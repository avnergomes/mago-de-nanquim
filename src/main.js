import * as THREE from 'three';
import { Batch } from './render/batch.js';
import { createInkPass } from './render/post.js';
import { groundTexture, toonRamp } from './render/textures.js';
import { fxMaterial, fxTime } from './render/fxmat.js';
import { wizard, enemyModels, fxModels } from './render/models.js';
import { G } from './game/state.js';
import { RUN_LENGTH } from './data/enemies.js';
import * as EN from './game/enemies.js';
import * as CB from './game/combat.js';
import * as PK from './game/pickups.js';
import { createPlayer, updatePlayer, hurtPlayer, gainXp, recomputeStats } from './game/player.js';
import { initInput } from './game/input.js';
import { learn, updateSpells, drawSpells, grantAll, combosReady, activateCombo } from './game/spells/index.js';
import { timers } from './game/spells/core.js';
import * as UI from './game/ui.js';

// ---------- renderização ----------
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
const ink = createInkPass(renderer);

const scene = new THREE.Scene();
const BG = new THREE.Color('#7c805f');
scene.background = BG;
scene.fog = new THREE.Fog(BG, 48, 95);
const camera = new THREE.PerspectiveCamera(45, 1, 1, 240);
const CAM_OFF = new THREE.Vector3(0, 24, 18);

// sombras de borda dura (sem PCF suave) para combinar com o traço sem antialias
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

const hemi = new THREE.HemisphereLight('#fff6e0', '#5d5646', 0.75);
const sun = new THREE.DirectionalLight('#ffe9c4', 2.6);
const SUN_OFF = new THREE.Vector3(-9, 16, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.02;
Object.assign(sun.shadow.camera, { near: 1, far: 60 });
// contraluz fria: recorta a silhueta dos espíritos contra o piso
const rim = new THREE.DirectionalLight('#9ec4ff', 0.9);
scene.add(hemi, sun, sun.target, rim, rim.target);

// luz por setor: ambiente e sol mudam de tom (esgoto escuro, usina azulada)
const ZONE_LIGHT = {
  arrays:    { hemi: 0.75, sun: 2.6, color: '#ffe9c4' },
  lab:       { hemi: 0.85, sun: 2.3, color: '#f4f6ff' },
  sewage:    { hemi: 0.45, sun: 1.9, color: '#d8f0b0' },
  arboretum: { hemi: 0.7,  sun: 2.5, color: '#fff0b8' },
  power:     { hemi: 0.55, sun: 2.2, color: '#c8d8ff' },
};

// luzes dinâmicas das magias: pool fixo (mudar a contagem de luzes recompila todos os materiais)
const LIGHTS = 6;
const fxLights = Array.from({ length: LIGHTS }, () => {
  const l = new THREE.PointLight('#ffffff', 0, 9, 1.6);
  scene.add(l);
  return l;
});
// brilho da gema do cajado
const gemLight = new THREE.PointLight('#5fe8ff', 6, 5, 1.6);
scene.add(gemLight);

const ramp = toonRamp();
const toonVC = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp });
const toonFlat = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: ramp });

// piso do setor atual; texturas geradas uma vez e trocadas a cada 4 min
const TILE = 16, floors = {};
const FLOOR_BG = { arrays: '#7c805f', lab: '#8d8c88', sewage: '#3c4135', arboretum: '#5d6f4e', power: '#5e6577' };
// a própria textura serve de relevo: rejunte e rachaduras reagem às luzes das magias
const groundMat = new THREE.MeshLambertMaterial({ bumpScale: 2.5 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240).rotateX(-Math.PI / 2), groundMat);
ground.receiveShadow = true;
scene.add(ground);
function setFloor(kind) {
  if (!floors[kind]) { floors[kind] = groundTexture(kind); floors[kind].repeat.set(240 / TILE, 240 / TILE); }
  groundMat.map = groundMat.bumpMap = floors[kind];
  groundMat.needsUpdate = true;
  BG.set(FLOOR_BG[kind]);
  scene.fog.color.copy(BG).multiplyScalar(0.7);
  scene.background = scene.fog.color;
  const L = ZONE_LIGHT[kind];
  hemi.intensity = L.hemi; sun.intensity = L.sun; sun.color.set(L.color);
}
// gera os 5 pisos já na carga, para não engasgar na troca de setor
for (const k of Object.keys(FLOOR_BG)) setFloor(k);
setFloor('arrays');
G.onZone = (zone) => setFloor(zone.floor);

const wizMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp, transparent: true });
const wizGeo = wizard();
const wiz = new THREE.Mesh(wizGeo, wizMat);
wiz.castShadow = true;
wiz.rotation.order = 'YXZ'; // inclinação relativa à direção em que o mago olha
const hover = { lean: 0, bank: 0, face: 0, t: 0 };
scene.add(wiz);

// inimigos: um lote por modelo e variante (normal, clarão branco, gelo, atordoado, contorno vermelho de elite)
const enemyGeo = {}, enemyB = {};
const VARIANT_MAT = {
  '': toonVC,
  w: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  ice: new THREE.MeshToonMaterial({ color: '#9fdcff', gradientMap: ramp }),
  stun: new THREE.MeshToonMaterial({ color: '#e8d870', gradientMap: ramp }),
  elite: new THREE.MeshBasicMaterial({ color: '#ff2020', side: THREE.BackSide }),
};
function getEB(def, variant) {
  const key = def.name + variant;
  if (!enemyB[key]) {
    const id = Object.keys(enemyModels).find(k => k.toLowerCase() === def.name.toLowerCase());
    enemyGeo[id] ??= enemyModels[id]();
    enemyB[key] = new Batch(scene, enemyGeo[id], VARIANT_MAT[variant], def.boss ? 8 : variant ? 300 : 700);
    // todas as variantes projetam sombra (senão o inimigo perde a sombra no frame do clarão); o casco de elite não
    enemyB[key].mesh.castShadow = variant !== 'elite';
    enemyB[key].mesh.receiveShadow = variant === '';
  }
  return enemyB[key];
}
// sombra de contato (oclusão sob os pés); preta para escurecer qualquer piso, a sombra do sol vem do shadow map
const shadowB = new Batch(scene, fxModels.shadow(), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.3, depthWrite: false }), 1400);
// escuridão que a Terra espalha ao redor
const darkB = new Batch(scene, fxModels.disk(), new THREE.MeshBasicMaterial({ color: '#05040a', transparent: true, opacity: 0.6, depthWrite: false }), 8);
const gasB = new Batch(scene, fxModels.disk(), new THREE.MeshBasicMaterial({ color: '#8fd04a', transparent: true, opacity: 0.35, depthWrite: false }), 120);
const mirageB = new Batch(scene, wizGeo, toonVC, 4);

const fxB = {};
const TOON_FX = { chest: toonVC, rock: toonFlat };
const BIG_FX = new Set(['shard', 'orb', 'bolt', 'spark', 'disk', 'glow']);
function getBatch(kind, soft) {
  const key = kind + (soft ? '~' : '');
  if (!fxB[key]) {
    const mat = TOON_FX[kind] && !soft ? TOON_FX[kind] : fxMaterial(kind, soft);
    fxB[key] = new Batch(scene, fxModels[kind](), mat, BIG_FX.has(kind) ? 3000 : 900);
    // só objetos sólidos (rochas, baús) fazem sombra; brilhos e áreas não
    if (TOON_FX[kind] && !soft) fxB[key].mesh.castShadow = fxB[key].mesh.receiveShadow = true;
  }
  return fxB[key];
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // em retrato (celular) afasta a câmera para manter a horda visível nas laterais
  const portrait = h > w;
  CAM_OFF.set(0, portrait ? 34 : 24, portrait ? 26 : 18);
  camera.updateProjectionMatrix();
  ink.resize();
  G.viewR = computeViewR();
  // frustum da sombra cobre a área visível em volta do jogador
  const sc = sun.shadow.camera, R = G.viewR + 4;
  Object.assign(sc, { left: -R, right: R, top: R, bottom: -R });
  sc.updateProjectionMatrix();
}
function computeViewR() {
  camera.position.copy(CAM_OFF);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  let r = 0;
  for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ray.setFromCamera(new THREE.Vector2(x, y), camera);
    if (ray.ray.intersectPlane(plane, hit)) r = Math.max(r, Math.hypot(hit.x, hit.z));
  }
  return Math.min(Math.max(r, 16), 46);
}
addEventListener('resize', resize);

// ---------- partida ----------
function newRun() {
  Object.assign(G, {
    t: 0, over: false, paused: false, spells: {}, passives: {}, growth: {}, specials: new Set(), combos: {},
    level: 1, xp: 0, kills: 0, apocT: 0, cloaked: 0, pendingLevels: 0, hooks: {}, runes: { inv: 0, frenzy: 0, greed: 0 }, alertT: 0,
    buff: { amp: 0, cdr: 0, slowAura: 0 }, usedRevives: 0, won: false, endless: false, bossRef: null,
  });
  EN.resetSpawner();
  CB.projs.length = 0; CB.fx.length = 0; PK.items.length = 0; timers.length = 0;
  PK.resetLoot();
  setFloor('arrays');
  createPlayer();
  learn('magic_bolt');
  G.hooks.onKill = new Set([(e) => {
    if (G.cloaked > 0 && G.spells.cloaking?.soulHarvest) G.player.hp = Math.min(G.player.maxHp, G.player.hp + G.player.maxHp * 0.001);
  }]);
  UI.refreshBuild();
  G.running = true;
}

G.spawnChest = PK.spawnChest;
G.hurtPlayer = hurtPlayer;
G.gainXp = gainXp;
// Runa da Purificação: elimina todos os inimigos em campo (chefes levam dano)
G.cleanse = () => {
  for (const e of EN.list) if (e.alive) { if (e.def.boss) CB.damage(e, e.maxHp * 0.1, { noCrit: true }); else CB.kill(e); }
  CB.vfx('dome', G.player.x, 0, G.player.z, { life: 0.6, s0: 1, s1: G.viewR, sy: 0.4, color: [0.4, 1.4, 0.7], soft: true, ease: true });
};

function togglePause() {
  if (!G.running || G.over || UI.isModalOpen()) return;
  G.paused = !G.paused;
  UI.showPause(G.paused);
}

// ---------- laço ----------
let last = performance.now(), fpsAcc = 0, fpsN = 0;
G.fps = 60;
const tmp = new THREE.Vector3();

function step(dt) {
  G.t += dt;
  const [pdx, pdz] = updatePlayer(dt);
  EN.updateSpawner(dt);
  EN.updateEnemies(dt, hurtPlayer, CB.selfDestruct);
  updateSpells(dt);
  CB.updateProjs(dt, pdx, pdz);
  CB.updateFx(dt);
  PK.updatePickups(dt, gainXp);
  G.bossRef = EN.list.find(e => e.alive && e.def.boss) || null;
  // vitória: passar dos 20 min E limpar a onda final (como no original)
  if (G.t >= RUN_LENGTH && !G.won && !G.endless && !G.bossRef) { G.won = true; G.running = false; UI.showEnd(true); }
  if (G.over) { G.running = false; UI.showEnd(false); }
}

// as LIGHTS fontes mais fortes na tela (projéteis e efeitos coloridos) ganham uma luz de verdade
const pick = [], chosen = [], CAND = 24;
function placeFxLights(p) {
  pick.length = 0;
  const consider = (o, size) => {
    const [r, g, b] = o.color, lum = r * 0.3 + g * 0.5 + b * 0.2;
    if (lum < 0.45) return; // manchas de tinta e sombras não iluminam
    const d2 = (o.x - p.x) ** 2 + (o.z - p.z) ** 2;
    if (d2 > G.viewR * G.viewR) return;
    const score = lum * Math.min(size, 4) / (1 + d2 * 0.004);
    if (pick.length === CAND && score <= pick[CAND - 1].score) return;
    let i = Math.min(pick.length, CAND - 1);
    while (i > 0 && pick[i - 1].score < score) { pick[i] = pick[i - 1]; i--; }
    pick[i] = { o, score, size };
  };
  for (const o of CB.projs) if (!o.hidden) consider(o, o.s);
  for (const f of CB.fx) consider(f, (f.s0 + f.s1) * 0.5 * (1 - f.age / f.life));
  // espalha: descarta candidatos colados num já escolhido, senão tudo soma no mesmo ponto e estoura em branco
  chosen.length = 0;
  for (const k of pick) {
    if (chosen.length === LIGHTS) break;
    if (chosen.every(c => (c.o.x - k.o.x) ** 2 + (c.o.z - k.o.z) ** 2 > 16)) chosen.push(k);
  }
  fxLights.forEach((l, i) => {
    const k = chosen[i];
    if (!k) { l.intensity = 0; return; }
    const [r, g, b] = k.o.color, m = Math.max(r, g, b);
    l.color.setRGB(r / m, g / m, b / m);
    l.position.set(k.o.x, Math.max(0.8, k.o.y ?? 0.8), k.o.z);
    l.distance = 4 + Math.min(k.size, 4) * 2;
    l.intensity = 7 * Math.min(1.3, m);
  });
}

function draw(time) {
  const p = G.player;
  camera.position.set(p.x + CAM_OFF.x, CAM_OFF.y, p.z + CAM_OFF.z);
  camera.lookAt(p.x, 0, p.z);
  // sol preso à grade de texels da sombra: sem cintilar a borda quando o jogador anda
  const texel = (2 * (G.viewR + 4)) / sun.shadow.mapSize.x;
  const sx = Math.round(p.x / texel) * texel, sz = Math.round(p.z / texel) * texel;
  sun.target.position.set(sx, 0, sz); sun.position.set(sx + SUN_OFF.x, SUN_OFF.y, sz + SUN_OFF.z);
  rim.target.position.set(p.x, 0, p.z); rim.position.set(p.x + 5, 9, p.z - 14);
  const fs = Math.sin(p.face), fc = Math.cos(p.face);
  gemLight.position.set(p.x + (0.44 * fc + 0.3 * fs) * 0.8, 1.2 + wiz.position.y, p.z + (0.3 * fc - 0.44 * fs) * 0.8);
  gemLight.intensity = 5 + Math.sin(time * 5) * 1.2;
  placeFxLights(p);
  fxTime.value = time % 1000;
  ground.position.set(Math.round(p.x / TILE) * TILE, 0, Math.round(p.z / TILE) * TILE);

  // mago flutua: paira com ondulação lenta, inclina para onde desliza e se deita na curva
  const dtv = Math.min(0.05, time - (hover.t || time)); hover.t = time;
  const ease = 1 - Math.exp(-dtv * 6);
  hover.lean += ((p.moving ? 0.22 : 0) - hover.lean) * ease;
  let turn = p.face - hover.face; turn = Math.atan2(Math.sin(turn), Math.cos(turn)); hover.face = p.face;
  hover.bank += (Math.max(-0.3, Math.min(0.3, -turn * 6)) - hover.bank) * ease;
  const lift = 0.45 + Math.sin(time * 2.1) * 0.09 + Math.sin(time * 3.7) * 0.03;
  wiz.position.set(p.x, lift, p.z);
  wiz.scale.setScalar(0.8);
  wiz.rotation.set(hover.lean + Math.sin(time * 1.3) * 0.03, p.face, hover.bank + Math.sin(time * 1.7) * 0.04);
  // rastro de poeira mágica quando desliza
  if (p.moving && G.running && !G.paused && Math.random() < 0.5) {
    CB.vfx('orb', p.x + (Math.random() - 0.5) * 0.4, 0.25 + Math.random() * 0.3, p.z + (Math.random() - 0.5) * 0.4,
      { life: 0.45, s0: 0.22, s1: 0.02, color: [0.35, 0.9, 1.1], soft: true });
  }
  getBatch('glow', true).push(p.x, 0.04, p.z, 0, 1.1, 1, 1.1, 0.25, 0.75, 0.9);
  wizMat.opacity = G.cloaked > 0 ? 0.35 : 1;
  wizMat.emissive.setRGB(p.hurtFlash > 0 ? 0.8 : 0, 0, 0);
  shadowB.push(p.x, 0.02, p.z, 0, 0.75, 1, 0.75, 0.2, 0.17, 0.15);

  if (G.spells.magic_bolt?.attrs.has('doppelganger')) {
    for (let i = 0; i < 3; i++) {
      const a = G.t * 1.5 + (i / 3) * Math.PI * 2;
      mirageB.push(p.x + Math.cos(a) * 2.2, 0.45 + Math.sin(time * 2.1 + i) * 0.09, p.z + Math.sin(a) * 2.2, p.face, 0.8, 0.8, 0.8, 0.7, 0.6, 1.4);
    }
  }

  EN.drawEnemies(getEB, shadowB, darkB);
  for (const h of EN.hazards) gasB.push(h.x, 0.05, h.z, time, h.r * (1 + Math.sin(time * 3) * 0.05), 1, h.r, 1, 1, 1);
  drawSpells(getBatch);
  CB.drawCombat(getBatch);
  PK.drawPickups(getBatch);

  for (const b of Object.values(enemyB)) b.end();
  shadowB.end(); darkB.end(); gasB.end();
  for (const b of Object.values(fxB)) b.end();
  mirageB.end();

  // alerta vermelho e frenesi tingem a tela, como no original
  const red = G.alertT > 0 || G.runes.frenzy > 0;
  ink.render(scene, camera, time, red ? [1.25, 0.72, 0.68] : [1, 1, 1]);
  tmp.set(p.x, 0, p.z).project(camera);
  UI.placePlayerBar((tmp.x * 0.5 + 0.5) * innerWidth, (-tmp.y * 0.5 + 0.5) * innerHeight);
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 1) { G.fps = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
  if (G.running && !G.paused && !UI.isModalOpen()) {
    step(dt);
    UI.pumpLevelUps();
  }
  if (G.player) {
    draw(now / 1000);
    UI.updateHUD(dt);
  }
}

// ---------- telas ----------
document.getElementById('start-btn').onclick = () => {
  document.getElementById('start').className = 'modal';
  newRun();
};
document.getElementById('end-restart').onclick = () => { document.getElementById('end').className = 'modal'; newRun(); };
document.getElementById('end-continue').onclick = () => { document.getElementById('end').className = 'modal'; G.endless = true; G.running = true; };
document.getElementById('pause-resume').onclick = togglePause;
document.getElementById('pause-btn').onclick = togglePause;

initInput(togglePause);
UI.initUI();
resize();
createPlayer(); // cena de fundo da tela inicial
requestAnimationFrame(frame);

// ---------- PWA: funciona offline e pode ser instalado ----------
// em localhost fica sem service worker, para cada rebuild aparecer na hora (127.0.0.1 testa o PWA)
if ('serviceWorker' in navigator && location.hostname !== 'localhost') navigator.serviceWorker.register('sw.js');
const installBtn = document.getElementById('install-btn');
let installEvt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; installBtn.hidden = false; });
installBtn.onclick = async () => { installEvt?.prompt(); await installEvt?.userChoice; installEvt = null; installBtn.hidden = true; };
// iPhone não tem o aviso de instalação: mostra o caminho manual quando ainda está no Safari
const standalone = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
document.getElementById('install-ios').hidden = !(/iPhone|iPad|iPod/.test(navigator.userAgent) && !standalone);

// ---------- depuração / teste de fumaça (console do navegador, só em máquina local) ----------
const DEV = ['localhost', '127.0.0.1'].includes(location.hostname);
if (DEV) window.dbg = {
  G,
  grantAll(attrIndex = 0) {
    grantAll((def) => { const pool = def.attrs.filter(a => !a.tier || a.tier === 7); return pool[attrIndex % pool.length].id; });
    for (const cb of combosReady()) activateCombo(cb.id);
    recomputeStats();
    UI.refreshBuild();
  },
  comboAll() {
    // força todos os atributos pedidos pelos 25 combos (ignora a regra de 1 atributo por magia)
    grantAll();
    for (const cb of combosReady()) activateCombo(cb.id);
    for (const sp of Object.values(G.spells)) sp.attrs.clear();
    for (const id of Object.keys(G.combos)) delete G.combos[id];
    for (const cb of (window.dbg.COMBOS || [])) { G.spells[cb.a[0]].attrs.add(cb.a[1]); G.spells[cb.b[0]].attrs.add(cb.b[1]); }
    for (const cb of combosReady()) activateCombo(cb.id);
    UI.refreshBuild();
  },
  time(s) { G.t = s; },
  xp(n) { gainXp(n); },
  god() { G.stats.dmgTaken = -0.99; G.player.maxHp = G.player.hp = 1e6; },
  count: () => EN.aliveCount(),
  list: () => EN.list.filter(e => e.alive),
  items: () => PK.items,
  hazards: () => EN.hazards,
  spawn(n = 500, id = 'swarm') {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, d = 6 + Math.random() * 18; EN.spawn(id, G.player.x + Math.cos(a) * d, G.player.z + Math.sin(a) * d); }
  },
};
if (DEV) import('./data/combos.js').then(m => { window.dbg.COMBOS = m.COMBOS; });
