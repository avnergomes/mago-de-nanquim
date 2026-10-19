import { G, rand, randi, TAU } from '../state.js';
import { nearest, randomNear, inRadius } from '../enemies.js';
import { shoot, explode, vfx, damage } from '../combat.js';
import { has, cooldown, later, COL } from './core.js';

const P = () => G.player;
const dirTo = (x, z, e) => { const dx = e.x - x, dz = e.z - z, d = Math.hypot(dx, dz) || 1; return [dx / d, dz / d]; };
const randDir = () => { const a = rand(TAU); return [Math.cos(a), Math.sin(a)]; };
const around = (r) => { const a = rand(TAU), d = Math.sqrt(Math.random()) * r; return [P().x + Math.cos(a) * d, P().z + Math.sin(a) * d]; };

// relâmpago visual entre dois pontos (segmentos curtos de cor elétrica)
export function zap(x0, z0, x1, z1, color = COL.storm) {
  const n = 5;
  for (let i = 0; i < n; i++) {
    const a = i / n, b = (i + 1) / n;
    const ax = x0 + (x1 - x0) * a + (i ? rand(-0.4, 0.4) : 0), az = z0 + (z1 - z0) * a + (i ? rand(-0.4, 0.4) : 0);
    const bx = x0 + (x1 - x0) * b + rand(-0.4, 0.4), bz = z0 + (z1 - z0) * b + rand(-0.4, 0.4);
    const L = Math.hypot(bx - ax, bz - az);
    vfx('beam', ax, 0.9, az, { life: 0.14, s0: 1, s1: 1, ry: Math.atan2(bx - ax, bz - az), color, sx: 0.12, len: L });
  }
}

// ---------------- Projétil Mágico ----------------
export function magic_bolt(sp, dt, c) {
  sp.st.mirages ??= 0;
  cooldown(sp, dt, c, () => {
    const origins = has(sp, 'doppelganger')
      ? [0, 1, 2].map(i => { const a = G.t * 1.5 + (i / 3) * TAU; return [P().x + Math.cos(a) * 2.2, P().z + Math.sin(a) * 2.2]; })
      : [[P().x, P().z]];
    for (const [ox, oz] of origins) {
      for (let i = 0; i < c.num; i++) {
        later(i * 0.07, () => fireBolt(sp, c, ox, oz, i));
      }
    }
  });
  if (has(sp, 'doppelganger')) sp.st.drawMirage = true;
}

function fireBolt(sp, c, ox, oz, i) {
  let dirs;
  if (has(sp, 'fire_at_will')) dirs = [randDir()];
  else {
    const t = nearest(ox, oz, has(sp, 'fission') ? 3 : 1, 24);
    const k = t.length ? i % t.length : 0;
    dirs = t.length ? (has(sp, 'fission') ? t : [t[k]]).map(e => dirTo(ox, oz, e)) : [randDir()];
  }
  const arrow = has(sp, 'magic_arrow');
  for (const [dx, dz] of dirs) {
    const v = 17 * c.speed;
    if (G.cls?.morph && !arrow && Math.random() < G.cls.morph) { morphBolt(ox, oz, dx, dz, v, c); continue; }
    shoot({
      kind: arrow ? 'shard' : 'bolt', x: ox, z: oz, y: 0.9, vx: dx * v, vz: dz * v, r: 0.32 * c.size, s: 0.55 * c.size,
      ry: Math.atan2(dx, dz), dmg: c.dmg, pierce: arrow ? Infinity : 1, life: arrow ? 1.6 : 1.3, color: COL.arcane,
      onEnd: has(sp, 'fireworks') ? (p) => fireworks(p, c) : null,
    });
  }
}

// Ilusionista: o projétil vira Choque Elétrico, Bola de Fogo, Espírito ou Raio de Energia
const MORPH = [
  { kind: 'shard', color: COL.storm, update: (p) => { p.ry += rand(-0.6, 0.6); } },
  { kind: 'orb', color: COL.fire, s: 1.4, boom: true },
  { kind: 'bolt', color: COL.energy },
  { kind: 'orb', color: [1.5, 0.8, 1.5], pierce: 3 },
];
function morphBolt(x, z, dx, dz, v, c) {
  const m = MORPH[randi(MORPH.length)], k = m.s || 1;
  shoot({
    kind: m.kind, x, z, y: 0.9, vx: dx * v, vz: dz * v, ry: Math.atan2(dx, dz), r: 0.32 * c.size * k, s: 0.55 * c.size * k,
    dmg: c.dmg, pierce: m.pierce || 1, life: 1.3, color: m.color, update: m.update,
    onEnd: m.boom ? (p) => explode(p.x, p.z, 1.8 * c.size, c.dmg * 0.5, { color: COL.fire }) : null,
  });
}

function fireworks(p, c) {
  for (let k = 0; k < 3; k++) {
    const a = p.ry + (k - 1) * 0.6, dx = Math.sin(a), dz = Math.cos(a);
    shoot({
      kind: 'orb', x: p.x, z: p.z, y: 0.9, vx: dx * 9, vz: dz * 9, r: 0.3, s: 0.35, dmg: c.dmg * 0.5, life: 0.35,
      color: [1.5, 0.9, 1.2], onEnd: (q) => explode(q.x, q.z, 1.5 * c.size, c.dmg * 0.5, { color: [1.5, 0.8, 1.3] }),
    });
  }
}

// ---------------- Bola de Fogo ----------------
export function fireball(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const targets = nearest(P().x, P().z, c.num, 22);
    for (let i = 0; i < c.num; i++) {
      later(i * 0.1, () => {
        const big = has(sp, 'big_bang') && i === 0 ? 1.5 : 1;
        const R = 2.1 * c.size * big, dmg = c.dmg * big;
        const boom = (x, z) => {
          if (has(sp, 'poison_gas')) {
            shoot({ kind: 'orb', soft: true, x, z, y: 0.3, r: R, s: R * 0.8, sy: R * 0.4, dmg, interval: 0.3, life: 0.95, color: [0.7, 1.2, 0.3],
              update: (p) => { p.r = R * (1 + p.age * 0.6); p.s = p.r * 0.85; p.sy = p.r * 0.4; } });
          } else explode(x, z, R, dmg, { color: COL.fire });
        };
        if (has(sp, 'constellation')) {
          const [x, z] = around(8), [dx, dz] = randDir();
          shoot({ kind: 'orb', x, z, y: 0.9, vx: dx * 4, vz: dz * 4, r: 0.6 * c.size, s: 0.75 * c.size * big, dmg: 0, pierce: 2, life: 3.5 * (1 + G.stats.dur),
            follow: true, color: COL.fire, update: (p, d) => { p.vx *= 1 - d * 0.6; p.vz *= 1 - d * 0.6; },
            onHit: (p) => boom(p.x, p.z) });
          return;
        }
        const t = targets.length ? targets[i % targets.length] : null;
        const [dx, dz] = t ? dirTo(P().x, P().z, t) : randDir();
        shoot({ kind: 'orb', x: P().x, z: P().z, y: 0.9, vx: dx * 12, vz: dz * 12, r: 0.45 * c.size * big, s: 0.7 * c.size * big,
          dmg: 0, pierce: 1, life: 1.6, color: COL.fire, onHit: (p) => boom(p.x, p.z),
          update: (p) => { if (G.t % 0.05 < 0.017) vfx('orb', p.x, p.y, p.z, { life: 0.25, s0: p.s * 0.7, s1: 0.05, color: [1.4, 0.8, 0.2], soft: true }); } });
      });
    }
  });
}

// ---------------- Tempestade de Raios ----------------
function strike(x, z, R, dmg, half = false) {
  vfx('zigzag', x, 0, z, { life: 0.22, s0: 1, s1: 1, sy: 9, color: [1.5, 1.45, 0.6], ry: rand(TAU) });
  vfx('column', x, 0, z, { life: 0.16, s0: R * 0.22, s1: 0.04, sy: 40, color: [1.5, 1.5, 1.1], soft: true });
  explode(x, z, R, dmg, { color: COL.storm, stun: 0.15 });
  if (half) inRadius(x, z, R * 1.6, (e) => { if ((e.x - x) ** 2 + (e.z - z) ** 2 > R * R) damage(e, dmg * 0.5); });
  G.hooks.onStrike?.forEach(f => f(x, z, dmg));
}

export function thunderstorm(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const R = 1.7 * c.size;
    if (has(sp, 'judgement')) {
      const t = nearest(P().x, P().z, 1, 18)[0];
      const [x, z] = t ? [t.x, t.z] : around(6);
      strike(x, z, R * (1 + 0.2 * c.num), c.dmg, true);
      return;
    }
    for (let i = 0; i < c.num; i++) {
      later(i * (has(sp, 'lightning_explosion') ? 0.12 : 0.05), () => {
        const t = has(sp, 'lightning_explosion') ? null : randomNear(P().x, P().z, 16);
        const [x, z] = t ? [t.x, t.z] : around(12);
        const reps = has(sp, 'thunderclap') ? 1 + randi(3) : 1;
        for (let k = 0; k < reps; k++) later(k * 0.18, () => strike(x + rand(-0.4, 0.4), z + rand(-0.4, 0.4), R, c.dmg));
      });
    }
  });
}

// ---------------- Meteoro ----------------
export function meteor(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const asteroid = has(sp, 'asteroid');
    const n = asteroid ? 1 : c.num;
    const R = 2.6 * c.size * (asteroid ? 1 + 0.5 * c.num : 1);
    const gap = has(sp, 'meteor_shower') ? 0.1 : 0.22;
    for (let i = 0; i < n; i++) later(i * gap, () => {
      const t = Math.random() < 0.6 ? randomNear(P().x, P().z, 14) : null;
      const [x, z] = t ? [t.x + rand(-1, 1), t.z + rand(-1, 1)] : around(13);
      const land = () => {
        explode(x, z, R, c.dmg, { color: COL.fire, knock: 4, kx: x, kz: z });
        vfx('rock', x, 0.2, z, { life: 0.8, s0: R * 0.5, s1: R * 0.3, color: [0.5, 0.3, 0.25], sy: 0.6 });
        if (has(sp, 'volcanic_eruption')) shoot({ kind: 'disk', soft: true, x, z, y: 0.05, r: R, s: R, sy: 1, dmg: c.dmg * 0.25, interval: 1, life: 3 * (1 + G.stats.dur), color: COL.lava });
        G.hooks.onMeteor?.forEach(f => f(x, z, R, c.dmg));
      };
      if (has(sp, 'volcanic_eruption')) { land(); return; }
      const fall = 0.65;
      shoot({ kind: 'rock', x: x - 8, z: z - 8, y: 22, vx: 8 / fall, vz: 8 / fall, vy: -22 / fall, life: fall, noHit: true,
        s: R * 0.45, color: [1.4, 0.6, 0.3], onEnd: land,
        update: (p) => { p.ry += 0.2; vfx('orb', p.x, p.y, p.z, { life: 0.35, s0: p.s * 0.9, s1: 0.1, color: [1.5, 0.7, 0.2], soft: true }); } });
    });
  });
}

// ---------------- Ciclone ----------------
export function cyclone(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const voidA = has(sp, 'void'), orb = has(sp, 'electric_orb');
    const t = nearest(P().x, P().z, 1, 20)[0];
    const [bx, bz] = t ? dirTo(P().x, P().z, t) : randDir();
    for (let i = 0; i < c.num; i++) later(voidA ? i * 0.15 : 0, () => {
      const spread = (i - (c.num - 1) / 2) * 0.35, ca = Math.cos(spread), sa = Math.sin(spread);
      const dx = bx * ca - bz * sa, dz = bx * sa + bz * ca;
      const [x, z] = voidA ? around(10) : [P().x, P().z];
      const base = 1.3 * c.size;
      shoot({
        kind: 'cyclone', soft: true, x, z, y: 0, vx: voidA ? 0 : dx * 5, vz: voidA ? 0 : dz * 5, r: base * 0.5, s: base * 0.5, sy: 2.4,
        dmg: c.dmg, interval: c.interval, life: c.dur, color: COL.wind, knock: 1,
        update: (p, d) => {
          const k = Math.min(1, (p.age / p.life) * (voidA ? 9 : 1));
          const g = orb ? 1.6 - k * 1.1 : 0.5 + k * 1.1;
          p.r = base * g; p.s = p.r; p.sy = 1.6 + p.r * 0.8; p.ry += d * 9;
          if (orb && (p.st = (p.st || 0) + d) > 0.15) {
            p.st = 0;
            const [ex, ez] = randDir();
            shoot({ kind: 'orb', x: p.x, z: p.z, y: 0.9, vx: ex * 11, vz: ez * 11, r: 0.3, s: 0.3, dmg: c.dmg * 0.3, life: 0.9, color: COL.storm });
          }
        },
      });
    });
  });
}

// ---------------- Choque Elétrico ----------------
function chain(from, dmg, left, seen) {
  if (left <= 0) return;
  seen.add(from);
  const cand = nearest(from.x, from.z, 6, 7).filter(e => !seen.has(e));
  if (!cand.length) return;
  const to = cand[0];
  later(0.06, () => {
    zap(from.x, from.z, to.x, to.z);
    damage(to, dmg);
    chain(to, dmg, left - 1, seen);
  });
}
export { chain as chainLightning };

export function electric_shock(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const sup = has(sp, 'superconductivity');
    const targets = sup ? nearest(P().x, P().z, c.num, 18) : [];
    for (let i = 0; i < c.num; i++) later(sup ? i * 0.06 : 0, () => {
      const t = targets[i % Math.max(1, targets.length)];
      const [dx, dz] = sup && t ? dirTo(P().x, P().z, t) : randDir();
      const hi = has(sp, 'high_output') && Math.random() < 0.5 ? 2.5 : 1;
      shoot({
        kind: 'shard', x: P().x, z: P().z, y: 0.9, vx: dx * 14, vz: dz * 14, ry: Math.atan2(dx, dz),
        r: 0.35 * c.size * (hi > 1 ? 1.4 : 1), s: 0.5 * c.size * (hi > 1 ? 1.5 : 1), dmg: c.dmg * hi, life: 1.0, color: COL.storm,
        onHit: has(sp, 'chain_lightning') ? (p, e) => chain(e, c.dmg, 1 + randi(3), new Set()) : null,
        update: (p) => { p.ry += rand(-0.6, 0.6); },
      });
    });
  });
}

// ---------------- Raio de Energia ----------------
export function energy_bolt(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const flare = has(sp, 'flare'), spark = has(sp, 'spark'), charged = has(sp, 'charged_particles');
    const t = nearest(P().x, P().z, 1, 22)[0];
    const [bx, bz] = t ? dirTo(P().x, P().z, t) : randDir();
    const base = Math.atan2(bx, bz);
    for (let i = 0; i < c.num; i++) later(flare ? 0 : i * 0.03, () => {
      const a = flare ? (i / c.num) * TAU : base + rand(-0.5, 0.5);
      const v = (spark ? 5 : 11) * c.speed * rand(0.85, 1.15);
      const dx = Math.sin(a), dz = Math.cos(a);
      shoot({
        kind: 'orb', x: P().x, z: P().z, y: 0.9, vx: dx * v, vz: dz * v, r: 0.35 * c.size, s: 0.38 * c.size, dmg: c.dmg,
        pierce: Infinity, life: c.dur, color: COL.energy, interval: spark ? 0.3 : 0,
        onEnd: flare ? (p) => explode(p.x, p.z, 1.6 * c.size, c.dmg * 2, { color: COL.energy }) : charged ? (p) => {
          shoot({ kind: 'orb', x: p.x, z: p.z, y: 0.9, r: p.r, s: p.s, dmg: c.dmg, pierce: Infinity, life: 2, color: [1.5, 0.8, 1.5],
            update: (q) => { const dx2 = P().x - q.x, dz2 = P().z - q.z, d = Math.hypot(dx2, dz2) || 1; q.vx = dx2 / d * 16; q.vz = dz2 / d * 16; if (d < 0.8) q.dead = true; } });
        } : null,
      });
    });
  });
}

// ---------------- Incineração ----------------
export function incineration(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const p = P();
    const dirs = [0];
    if (has(sp, 'pyromaniac')) dirs.push(0.5, -0.5);
    if (has(sp, 'cerberus_flame')) dirs.push(Math.PI / 2, -Math.PI / 2);
    const strike = has(sp, 'flame_strike');
    for (let i = 0; i < c.num; i++) later(i * (0.5 / c.num), () => {
      const k = i / c.num, pw = strike ? 1 + k * 3 : 1, sz = strike ? 1 + k * 0.5 : 1;
      const face = Math.atan2(p.dirX, p.dirZ);
      for (const off of dirs) {
        const a = face + off + rand(-0.22, 0.22), v = 10 * c.speed;
        shoot({
          kind: 'flame', soft: true, x: p.x + Math.sin(a) * 0.6, z: p.z + Math.cos(a) * 0.6, y: 0.7, vx: Math.sin(a) * v, vz: Math.cos(a) * v,
          ry: a, r: 0.5 * c.size * sz, s: 0.5 * c.size * sz, dmg: c.dmg * pw, pierce: Infinity, life: 0.55,
          color: [1.5, 0.5 + rand(0.4), 0.15],
          update: (q) => { q.s = q.r = 0.5 * c.size * sz * (1 + q.age * 2.4); q.sy = q.s; },
          onHit: (q, e) => G.hooks.onFlame?.forEach(f => f(q, e)),
        });
      }
    });
  });
}

// ---------------- Nevasca ----------------
export function blizzard(sp, dt, c) {
  if (sp.st.active > 0) {
    sp.st.active -= dt;
    if (has(sp, 'sub_zero')) G.buff.slowAura = Math.min(0.6, (G.buff.slowAura || 0) + 0.03 * dt);
    if (sp.st.active <= 0) G.buff.slowAura = 0;
  }
  cooldown(sp, dt, c, () => {
    const star = has(sp, 'shooting_star'), blaze = has(sp, 'blaze');
    // intervalo base 0,3 s = nevasca de 2 s; Estrela Cadente e Labareda alteram via intervalMul
    const span = (2 * c.interval) / 0.3;
    sp.st.active = span + 1;
    const R = 1.3 * c.size;
    for (let i = 0; i < c.num; i++) later((i / c.num) * span, () => {
      const [x, z] = around(10 * (blaze ? 0.7 : 1));
      const fall = star ? 1.2 : 0.45;
      const land = () => {
        explode(x, z, R, c.dmg, { color: blaze ? [1.2, 0.6, 1.5] : COL.ice, freeze: !blaze && Math.random() < 0.35 ? 1.6 : 0 });
        if (blaze) later(0.15, () => explode(x, z, R, c.dmg * 0.9, { color: [1.3, 0.5, 1.5] }));
        G.hooks.onIce?.forEach(f => f(x, z, R, c.dmg));
      };
      shoot({ kind: 'shard', x: x - 2, z: z - 2, y: 12, vx: 2 / fall, vz: 2 / fall, vy: -12 / fall, life: fall, noHit: true,
        s: 0.45 * c.size * (star ? 1.6 : 1), color: blaze ? [1.3, 0.6, 1.5] : COL.ice, onEnd: land });
    });
  });
}
