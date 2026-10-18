import { G, rand, TAU } from './state.js';
import { inRadius, onEnemyHurt, resists } from './enemies.js';
import { dropLoot } from './pickups.js';

const KILL_MANA = 0.25; // fração do XP do inimigo ganha ao matar, sem pegar orbe

// ---------- dano ----------
export function damage(e, amount, o = {}) {
  if (!e.alive) return 0;
  let dmg = amount * (1 + e.melt);
  let crit = false;
  if (!o.noCrit && Math.random() < G.stats.crit) { dmg *= G.stats.critMul; crit = true; }
  e.hp -= dmg;
  e.flash = 0.07;
  if (o.freeze && !resists(e)) e.freeze = Math.max(e.freeze, o.freeze);
  if (o.stun && !resists(e)) e.stun = Math.max(e.stun, o.stun);
  onEnemyHurt(e);
  if (o.melt) e.melt = Math.min(0.3, e.melt + o.melt);
  if (o.knock && !e.def.large && e.def.ai !== 'line') {
    const dx = e.x - (o.kx ?? G.player.x), dz = e.z - (o.kz ?? G.player.z), d = Math.hypot(dx, dz) || 1;
    e.kx += (dx / d) * o.knock; e.kz += (dz / d) * o.knock;
  }
  if (G.dmgNumbers && (crit || dmg > 500)) G.dmgNumbers(e.x, e.z, dmg, crit);
  if (e.hp <= 0) kill(e);
  return dmg;
}

export function kill(e) {
  if (!e.alive) return;
  e.alive = false;
  G.kills++;
  inkSplat(e.x, e.z, e.r);
  const d = e.def;
  // mana direta por abate (pequena); os orbes continuam sendo a fonte principal
  G.gainXp?.(d.xp * KILL_MANA * (e.elite ? 3 : 1) * (1 + G.stats.mana + (G.buff.mana || 0)));
  if (d.deathBoom) {
    // Corrupt: carregado de material explosivo, estoura ao morrer
    vfx('orb', e.x, 0.5, e.z, { life: 0.3, s0: 0.4, s1: 1.8, color: [0.85, 1.0, 0.25], soft: true });
    if (Math.hypot(G.player.x - e.x, G.player.z - e.z) < 1.8) G.hurtPlayer?.(d.deathBoom);
  }
  if (d.deathBlast) {
    // Citadel: explosão gigante que fere todos os monstros por perto
    vfx('dome', e.x, 0, e.z, { life: 0.7, s0: 1, s1: d.deathBlast, sy: 0.5, color: [1.5, 1.5, 1.4], soft: true, ease: true });
    inRadius(e.x, e.z, d.deathBlast, (o) => { if (o !== e) damage(o, o.def.boss ? o.maxHp * 0.1 : 1e5, { noCrit: true }); });
  }
  dropLoot(e);
  G.hooks.onKill?.forEach(f => f(e));
}

// mancha de tinta que se espalha e some quando um espírito morre
export function inkSplat(x, z, r) {
  vfx('disk', x, 0.03, z, { life: 0.5, s0: r * 0.6, s1: r * 1.6, color: [0.1, 0.09, 0.11], soft: true });
  for (let i = 0; i < 4; i++) {
    const a = rand(TAU), d = r * rand(0.5, 1.2);
    vfx('orb', x + Math.cos(a) * d, 0.3, z + Math.sin(a) * d, { life: 0.35, s0: r * 0.35, s1: 0.02, color: [0.08, 0.07, 0.09] });
  }
}

// autodestruição ao tocar o jogador (Scarab, Interceptor, Howling): sem drop
export function selfDestruct(e) {
  e.alive = false;
  vfx('orb', e.x, 0.5, e.z, { life: 0.28, s0: 0.3, s1: e.r * 2.4, color: [1.5, 0.9, 0.5], soft: true });
  inkSplat(e.x, e.z, e.r);
}

// explosão instantânea em área + desenho
export function explode(x, z, R, dmg, o = {}) {
  inRadius(x, z, R, (e) => damage(e, dmg, o));
  const c = o.color || [1, 0.6, 0.25];
  vfx('orb', x, 0.4, z, { life: o.vlife ?? 0.32, s0: R * 0.4, s1: R * 1.15, color: c, soft: true, sy: 0.55 });
  vfx('ring', x, 0.1, z, { life: o.vlife ?? 0.32, s0: R * 0.3, s1: R, color: c.map(v => v * 0.7) });
}

// ---------- projéteis / áreas (entidades de magia) ----------
export const projs = [];
const DEF = {
  kind: 'orb', x: 0, y: 0.8, z: 0, vx: 0, vz: 0, vy: 0, r: 0.4, dmg: 0, pierce: 1, life: 1, age: 0,
  color: [1, 1, 1], s: 1, sy: null, ry: 0, interval: 0, tick: 0, follow: false, soft: false, noHit: false,
};

export function shoot(p) {
  const o = Object.assign({}, DEF, p);
  o.hit = new Set();
  if (o.sy === null) o.sy = o.s;
  projs.push(o);
  return o;
}

export function updateProjs(dt, pdx, pdz) {
  for (let i = projs.length - 1; i >= 0; i--) {
    const p = projs[i];
    p.age += dt;
    if (p.follow) { p.x += pdx; p.z += pdz; }
    if (p.update) p.update(p, dt);
    p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
    trail(p, dt);
    if (!p.noHit && !p.dead) hitTest(p, dt);
    if (p.age >= p.life || p.dead) {
      p.dead = true;
      p.onEnd?.(p);
      projs[i] = projs[projs.length - 1];
      projs.pop();
    }
  }
}

function hitTest(p, dt) {
  if (p.interval > 0) {
    p.tick -= dt;
    if (p.tick > 0) return;
    p.tick = p.interval;
    if (p.test) { p.test(p); return; }
    inRadius(p.x, p.z, p.r, (e) => { damage(e, p.dmg, p); p.onHit?.(p, e); });
    return;
  }
  const visit = (e) => {
    if (p.dead || p.hit.has(e)) return;
    p.hit.add(e);
    sparks(e.x, p.y, e.z, p.color, 3);
    damage(e, p.dmg, p);
    p.onHit?.(p, e);
    if (--p.pierce <= 0) p.dead = true;
  };
  if (p.test) p.test(p, visit);
  else inRadius(p.x, p.z, p.r, visit);
}

// ---------- detalhe cosmético das magias (com teto, para não pesar em horda grande) ----------
const FX_BUDGET = 2400;
const bright = (c) => c[0] * 0.3 + c[1] * 0.5 + c[2] * 0.2 > 0.45;
const sparkFly = (f, dt) => { f.x += f.vx * dt; f.z += f.vz * dt; f.y = Math.max(0.05, f.y + f.vy * dt); f.vy -= 14 * dt; };

// faíscas que espirram no impacto
export function sparks(x, y, z, color, n) {
  if (fx.length > FX_BUDGET || !bright(color)) return;
  for (let i = 0; i < n; i++) {
    const a = rand(TAU), v = rand(3, 7);
    fx.push({ kind: 'spark', x, y: Math.max(0.3, y), z, age: 0, life: rand(0.18, 0.32), s0: 0.32, s1: 0.04, sy: 1,
      ry: Math.atan2(Math.cos(a), Math.sin(a)), color, soft: true, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: rand(2, 5), update: sparkFly });
  }
}

// rastro de brasas atrás de projéteis em movimento (quem já desenha o próprio rastro fica de fora)
function trail(p, dt) {
  if (p.update || p.interval > 0 || p.follow || p.hidden || fx.length > FX_BUDGET) return;
  const sp2 = p.vx * p.vx + p.vz * p.vz;
  if (sp2 < 9 || !bright(p.color)) return;
  p.trailT = (p.trailT ?? 0) - dt;
  if (p.trailT > 0) return;
  p.trailT = 0.03;
  vfx('orb', p.x + rand(-0.1, 0.1), p.y, p.z + rand(-0.1, 0.1), { life: 0.22, s0: p.s * 0.55, s1: 0.02, color: p.color, soft: true });
}

// segmento (x0,z0)->(x1,z1) com meia largura w: chama fn para cada inimigo que encosta
export function segmentHits(x0, z0, x1, z1, w, fn) {
  const dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  inRadius(cx, cz, Math.sqrt(L2) / 2 + w, (e) => {
    const t = Math.max(0, Math.min(1, ((e.x - x0) * dx + (e.z - z0) * dz) / L2));
    const px = x0 + dx * t - e.x, pz = z0 + dz * t - e.z;
    if (px * px + pz * pz <= (w + e.r) ** 2) fn(e);
  });
}

// ---------- efeitos só visuais ----------
export const fx = [];
export function vfx(kind, x, y, z, o = {}) {
  fx.push({ kind, x, y, z, age: 0, life: 0.4, s0: 1, s1: 1, sy: 1, ry: rand(TAU), color: [1, 1, 1], soft: false, ...o });
}
export function updateFx(dt) {
  for (let i = fx.length - 1; i >= 0; i--) {
    const f = fx[i];
    f.age += dt;
    if (f.update) f.update(f, dt);
    if (f.age >= f.life) { fx[i] = fx[fx.length - 1]; fx.pop(); }
  }
}

// ---------- desenho de tudo acima ----------
export function drawCombat(getBatch) {
  for (const p of projs) {
    if (p.hidden) continue;
    // poça de luz no chão sob o que brilha (some quando o projétil sobe)
    if (bright(p.color) && p.y < 4 && p.kind !== 'disk') {
      const g = Math.min(p.s, 3) * 1.8 * (1 - p.y / 5);
      getBatch('glow', true).push(p.x, 0.04, p.z, 0, g, 1, g, ...p.color);
    }
    if (p.draw) { p.draw(p, getBatch); continue; }
    const [r, g, b] = p.color;
    getBatch(p.kind, p.soft).push(p.x, p.y, p.z, p.ry, p.s, p.sy, p.s, r, g, b);
  }
  for (const f of fx) {
    const k = f.age / f.life, s = f.s0 + (f.s1 - f.s0) * (f.ease ? 1 - (1 - k) ** 3 : k);
    // brilho aditivo apaga suave no fim da vida em vez de sumir de estalo
    const fade = f.soft ? 1 - k * k : 1 - k * 0.35;
    const [r, g, b] = f.color;
    if (f.len) getBatch(f.kind, f.soft).push(f.x, f.y, f.z, f.ry, f.sx, f.sx, f.len, r, g, b);
    else if (f.tilt !== undefined) getBatch(f.kind, f.soft).pushTilt(f.x, f.y, f.z, f.ry, f.tilt, s, r, g, b);
    else getBatch(f.kind, f.soft).push(f.x, f.y, f.z, f.ry, s, s * f.sy, s, r * fade, g * fade, b * fade);
  }
}
