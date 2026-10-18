import { G, rand, pick, TAU, clamp } from './state.js';
import { ENEMIES, ZONES, ZONE_TIME } from '../data/enemies.js';
import { later } from './spells/core.js';

// ---------- pool + grade espacial (lista ligada em arrays tipados, zero lixo por quadro) ----------
export const list = [];
const CELL = 3, GN = 64, HALF = (GN * CELL) / 2;
const head = new Int32Array(GN * GN);
let next = new Int32Array(1024);
let gx0 = 0, gz0 = 0;

function cellOf(x, z) {
  const cx = Math.floor((x - gx0) / CELL), cz = Math.floor((z - gz0) / CELL);
  return cx < 0 || cz < 0 || cx >= GN || cz >= GN ? -1 : cz * GN + cx;
}

function rebuildGrid() {
  gx0 = G.player.x - HALF; gz0 = G.player.z - HALF;
  head.fill(-1);
  if (next.length < list.length) next = new Int32Array(list.length * 2);
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (!e.alive) continue;
    const c = cellOf(e.x, e.z);
    if (c < 0) continue;
    next[i] = head[c]; head[c] = i;
  }
}

// Chama fn(e, distância²) para cada inimigo vivo cujo círculo toca o raio dado
export function inRadius(x, z, r, fn) {
  const reach = r + 4;
  const c0x = Math.max(0, Math.floor((x - reach - gx0) / CELL)), c1x = Math.min(GN - 1, Math.floor((x + reach - gx0) / CELL));
  const c0z = Math.max(0, Math.floor((z - reach - gz0) / CELL)), c1z = Math.min(GN - 1, Math.floor((z + reach - gz0) / CELL));
  for (let cz = c0z; cz <= c1z; cz++) for (let cx = c0x; cx <= c1x; cx++) {
    for (let i = head[cz * GN + cx]; i !== -1; i = next[i]) {
      const e = list[i];
      if (!e.alive) continue;
      const dx = e.x - x, dz = e.z - z, rr = r + e.r;
      const d2 = dx * dx + dz * dz;
      if (d2 <= rr * rr) fn(e, d2);
    }
  }
}

export function nearest(x, z, n = 1, maxR = 30) {
  const out = [];
  const m2 = maxR * maxR;
  for (const e of list) {
    if (!e.alive) continue;
    const dx = e.x - x, dz = e.z - z, d2 = dx * dx + dz * dz;
    if (d2 > m2) continue;
    if (out.length < n) { out.push([d2, e]); out.sort((a, b) => a[0] - b[0]); }
    else if (d2 < out[n - 1][0]) { out[n - 1] = [d2, e]; out.sort((a, b) => a[0] - b[0]); }
  }
  return out.map(o => o[1]);
}

export function randomNear(x, z, maxR) {
  const cand = [];
  const m2 = maxR * maxR;
  for (const e of list) if (e.alive && (e.x - x) ** 2 + (e.z - z) ** 2 < m2) cand.push(e);
  return cand.length ? pick(cand) : null;
}

export const aliveCount = () => list.reduce((n, e) => n + (e.alive ? 1 : 0), 0);

// ---------- spawn ----------
export function spawn(id, x, z, extra = {}) {
  const def = ENEMIES[id];
  let e = list.find(o => !o.alive);
  if (!e) { e = {}; list.push(e); }
  const t = G.t / 60;
  const growth = 1 + t * 0.5 + t * t * 0.06;
  const elite = !!extra.elite;
  let hp = def.hp * (def.boss ? 1 + t * 0.15 : growth) * (1 + G.stats.enemyHp) * (elite ? 4 * (1 + G.stats.eliteHp) : 1);
  hp *= 1 - 0.4 * (G.apocT / 20);
  Object.assign(e, {
    alive: true, id, def, x, z, r: def.r * (elite ? 1.35 : 1), hp, maxHp: hp, elite,
    dmg: def.dmg * (1 + t * 0.07), speed: def.speed * rand(0.9, 1.1),
    face: rand(TAU), freeze: 0, stun: 0, flash: 0, melt: 0, empHits: 0, kx: 0, kz: 0, vx: 0, vz: 0,
    phase: rand(TAU), sz: (elite ? 1.35 : 1), enraged: false, gasT: 2, hitT: {},
    ...extra,
  });
  if (def.ai === 'line') {
    // mira onde o jogador está agora e segue reto, como estrela cadente
    const dx = G.player.x - x, dz = G.player.z - z, d = Math.hypot(dx, dz) || 1, a = Math.atan2(dz, dx) + rand(-0.12, 0.12);
    e.vx = Math.cos(a) * e.speed; e.vz = Math.sin(a) * e.speed; e.face = Math.atan2(e.vx, e.vz);
    e.life = (d * 2.4) / e.speed;
  }
  return e;
}

function ringPos(minR = G.viewR + 3, maxR = G.viewR + 7) {
  const a = rand(TAU), d = rand(minR, maxR);
  return [G.player.x + Math.cos(a) * d, G.player.z + Math.sin(a) * d];
}

export const zoneAt = (t) => ZONES[Math.floor(t / ZONE_TIME) % ZONES.length];

let spawnAcc = 0, eliteT = 50, lastZone = -1, evDone = new Set();
export function resetSpawner() { spawnAcc = 0; eliteT = 50; lastZone = -1; evDone = new Set(); list.length = 0; hazards.length = 0; }

const EVENTS = {
  scarabRain() {
    G.ui?.banner('Alerta: chuva de Scarabs!');
    G.alertT = 5;
    const a = rand(TAU);
    // later() anda no relógio do jogo: pausa com o modal e é zerado a cada partida
    for (let i = 0; i < 46; i++) later(i * 0.09, () => {
      const off = rand(-14, 14), d = G.viewR + 4;
      spawn('scarab', G.player.x + Math.cos(a) * d - Math.sin(a) * off, G.player.z + Math.sin(a) * d + Math.cos(a) * off);
    });
  },
  redAlert() {
    G.ui?.banner('Alerta vermelho!');
    G.alertT = 6;
    for (let i = 0; i < 60; i++) later(i * 0.08, () => spawn(Math.random() < 0.7 ? 'scarab' : 'interceptor', ...ringPos()));
  },
  hiveRing() { ring('hive', 10); },
  mineRing() { ring('mine', 26); },
  atlasHorde() { G.ui?.banner('Horda de Atlas!'); for (let i = 0; i < 40; i++) spawn('atlas', ...ringPos()); },
};
function ring(id, n) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    spawn(id, G.player.x + Math.cos(a) * (G.viewR + 2), G.player.z + Math.sin(a) * (G.viewR + 2));
  }
}

export function updateSpawner(dt) {
  const tm = G.t / 60;
  const zi = Math.floor(G.t / ZONE_TIME), zone = zoneAt(G.t), zt = G.t - zi * ZONE_TIME;
  if (zi !== lastZone) {
    lastZone = zi;
    G.zone = zone;
    G.onZone?.(zone);
    if (zi > 0) G.ui?.banner(`Setor: ${zone.name}`);
  }
  const maxAlive = Math.min(560, 80 + tm * 45);
  spawnAcc += dt * (1.2 + tm * 1.4);
  const alive = aliveCount();
  while (spawnAcc >= 1) {
    spawnAcc -= 1;
    if (alive < maxAlive) spawn(pick(zone.pool), ...ringPos());
  }
  // elites aparecem em grupo, periodicamente
  if ((eliteT -= dt) <= 0) {
    eliteT = 55;
    const id = pick(zone.pool.filter(k => ENEMIES[k].ai === 'chase')), [x, z] = ringPos();
    for (let i = 0; i < 4; i++) spawn(id, x + rand(-2, 2), z + rand(-2, 2), { elite: true });
  }
  const key = (k) => `${zi}:${k}`;
  if (zt >= 120 && !evDone.has(key('ev'))) { evDone.add(key('ev')); EVENTS[zone.event](); }
  if (zt >= ZONE_TIME - 25 && !evDone.has(key('fin'))) {
    evDone.add(key('fin'));
    G.ui?.banner(`Onda final: ${zone.final.map(id => ENEMIES[id].name).join(' + ')}`);
    zone.final.forEach((id, i) => spawn(id, ...ringPos(G.viewR, G.viewR + 2), { blackBox: i === 0 }));
  }
}

// ---------- perigos no chão (gás da Colony) ----------
export const hazards = [];

// ---------- atualização ----------
export function updateEnemies(dt, hurtPlayer, onBoom) {
  rebuildGrid();
  const p = G.player;
  const slow = clamp(1 - G.stats.enemySlow - G.buff.slowAura, 0.2, 1);
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (!e.alive) continue;
    const def = e.def;
    e.flash = Math.max(0, e.flash - dt);
    e.phase += dt * (e.enraged ? 14 : 5);
    let dx = p.x - e.x, dz = p.z - e.z;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d; dz /= d;
    if (def.ai === 'line') {
      e.life -= dt;
      if (e.life <= 0) { e.alive = false; continue; }
    } else if (d > G.viewR * 2.2 && !def.boss) {
      // longe demais: reaparece do outro lado (o mapa é infinito)
      e.x = p.x + dx * (G.viewR + 4) + rand(-4, 4);
      e.z = p.z + dz * (G.viewR + 4) + rand(-4, 4);
      continue;
    }
    if (e.freeze > 0) { e.freeze -= dt; continue; }
    if (e.stun > 0) e.stun -= dt;
    else if (def.ai === 'line') {
      e.x += e.vx * slow * dt; e.z += e.vz * slow * dt;
    } else {
      const v = e.speed * slow;
      e.x += (dx * v + e.kx) * dt;
      e.z += (dz * v + e.kz) * dt;
      e.face = Math.atan2(dx, dz);
    }
    e.kx *= 0.9; e.kz *= 0.9;
    if (def.gas && (e.gasT -= dt) <= 0) {
      e.gasT = 6;
      for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU + rand(0.5); hazards.push({ x: e.x + Math.cos(a) * 4, z: e.z + Math.sin(a) * 4, r: 2.2, life: 7, dmg: e.dmg * 0.5 }); }
    }
    // separação entre vizinhos (Citadel atravessa a horda)
    if (!def.ghost && def.ai !== 'line') inRadius(e.x, e.z, e.r, (o, d2) => {
      if (o === e || o.def.ghost) return;
      const rr = e.r + o.r;
      const dd = Math.sqrt(d2) || 0.01;
      const push = (rr - dd) * 0.5;
      const wE = def.large && !o.def.large ? 0.15 : 1;
      e.x -= ((o.x - e.x) / dd) * push * wE;
      e.z -= ((o.z - e.z) / dd) * push * wE;
    });
    const touch = Math.hypot(p.x - e.x, p.z - e.z) < e.r * 0.85 + p.r;
    if (touch && G.cloaked <= 0) {
      if (def.boom) { onBoom(e); hurtPlayer(e.dmg, e); }
      else hurtPlayer(e.dmg, e);
    }
  }
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    h.life -= dt;
    if (h.life <= 0) { hazards[i] = hazards[hazards.length - 1]; hazards.pop(); continue; }
    if ((p.x - h.x) ** 2 + (p.z - h.z) ** 2 < h.r * h.r) hurtPlayer(h.dmg);
  }
}

// chamado pelo combate a cada golpe recebido
export function onEnemyHurt(e) {
  const def = e.def;
  if (def.enrage && !e.enraged) { e.enraged = true; e.speed = def.enrage; }
  // Overlord incha ao ser atingido; limitado a 5 incrementos por segundo para áreas de dano contínuo
  if (def.grow && G.t - (e.growT || 0) > 0.2) { e.growT = G.t; e.sz = Math.min(2.2, e.sz + 0.01); }
  if (def.shrink) e.sz = Math.max(0.6, e.sz - 0.03);
  if (def.grow || def.shrink) e.r = def.r * e.sz;
}

export function resists(e) {
  const r = Math.max(e.def.resist || 0, e.elite ? 0.5 : 0);
  return Math.random() < r;
}

// ---------- desenho ----------
// variantes: '' normal, 'w' clarão de dano, 'ice' congelado, 'stun' atordoado, 'elite' contorno vermelho
export function drawEnemies(getEB, shadow, darkB) {
  for (const e of list) {
    if (!e.alive) continue;
    const def = e.def;
    const s = def.scale * e.sz;
    let y = 0, sy = 1, sxz = 1, ry = e.face;
    if (def.roll) ry = e.phase * 0.6; // Swarm rola como capim seco
    else if (def.ai === 'line') ry = e.phase * 3;
    else { sy = 1 + Math.sin(e.phase * 1.6) * 0.06; sxz = 1 - Math.sin(e.phase * 1.6) * 0.03; }
    if (e.enraged) { sxz *= 1 + Math.sin(e.phase * 3) * 0.08; }
    const variant = e.flash > 0 ? 'w' : e.freeze > 0 ? 'ice' : e.stun > 0 ? 'stun' : '';
    let r = 1, g = 1, b = 1;
    if (e.enraged && def.enrage) { r = 1.6; g = 0.5; b = 0.45; }
    getEB(def, variant).push(e.x, y, e.z, ry, s * sxz, s * sy, s * sxz, r, g, b);
    if (e.elite) getEB(def, 'elite').push(e.x, y, e.z, ry, s * sxz * 1.12, s * sy * 1.12, s * sxz * 1.12, 1.4, 0.1, 0.1);
    shadow.push(e.x, 0.02, e.z, 0, e.r * 1.15, 1, e.r * 1.15, 0.2, 0.17, 0.15);
    if (def.dark) darkB.push(e.x, 0.06, e.z, 0, def.dark, 1, def.dark, 1, 1, 1);
  }
}
