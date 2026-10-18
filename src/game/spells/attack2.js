import { G, rand, TAU } from '../state.js';
import { nearest, randomNear, inRadius } from '../enemies.js';
import { shoot, explode, vfx, damage, segmentHits } from '../combat.js';
import { has, cooldown, later, COL } from './core.js';
import { zap } from './attack1.js';

const P = () => G.player;
const dirTo = (x, z, e) => { const dx = e.x - x, dz = e.z - z, d = Math.hypot(dx, dz) || 1; return [dx / d, dz / d]; };
const around = (r) => { const a = rand(TAU), d = Math.sqrt(Math.random()) * r; return [P().x + Math.cos(a) * d, P().z + Math.sin(a) * d]; };

// ---------------- Tsunami ----------------
function wave(x, z, dx, dz, width, c, o = {}) {
  const v = o.speed ?? 11;
  return shoot({
    kind: 'wall', soft: true, x, z, y: 0, vx: dx * v, vz: dz * v, ry: Math.atan2(dx, dz), r: 1, s: 1, dmg: c.dmg, pierce: Infinity,
    life: o.life ?? 4.6, color: o.color ?? COL.water, freeze: o.freeze ?? 0, knock: 3,
    test: (p, visit) => segmentHits(p.x - dz * width / 2, p.z + dx * width / 2, p.x + dz * width / 2, p.z - dx * width / 2, 0.9 * c.size, visit),
    draw: (p, gb) => {
      gb('wall', true).push(p.x, 0, p.z, p.ry, width, 1.6 * c.size, 1.6 * c.size, ...p.color);
      gb('wall', false).push(p.x, 1.5 * c.size, p.z - dz * 0.2, p.ry, width * 0.96, 0.25 * c.size, 0.5 * c.size, 1.4, 1.5, 1.5);
    },
    update: o.update,
  });
}

export function tsunami(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const p = P(), seg = 2.8 * c.size;
    if (has(sp, 'pole')) {
      const n = Math.max(8, c.num);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU, dx = Math.sin(a), dz = Math.cos(a);
        const w = wave(p.x + dx, p.z + dz, dx, dz, seg, c, { speed: 9, life: 2.6, freeze: 1.5, color: COL.ice,
          update: (q) => { q.wid = 2 * Math.PI * (1 + q.age * 9) / n; } });
        w.test = (q, visit) => { const W = q.wid || seg; segmentHits(q.x - dz * W / 2, q.z + dx * W / 2, q.x + dz * W / 2, q.z - dx * W / 2, 0.9, visit); };
        w.draw = (q, gb) => { const W = (q.wid || seg) * 1.05; gb('wall', true).push(q.x, 0, q.z, q.ry, W, 1.5 * c.size, 1.2, ...COL.ice); };
      }
      return;
    }
    let dx = Math.SQRT1_2, dz = Math.SQRT1_2, back = 26, spacing = seg;
    if (has(sp, 'siren_song')) { dx = p.dirX; dz = p.dirZ; back = 5; }
    if (has(sp, 'great_eruption')) { back = 34; spacing = seg * 1.3; }
    const color = has(sp, 'great_eruption') ? COL.lava : COL.water;
    for (let i = 0; i < c.num; i++) {
      const off = (i - (c.num - 1) / 2) * spacing;
      wave(p.x - dx * back + dz * off, p.z - dz * back - dx * off, dx, dz, spacing * 1.05, c, { color, life: (back + 30) / 11 });
    }
  });
}

// ---------------- Espírito ----------------
export function spirit(sp, dt, c) {
  const fam = has(sp, 'familiar');
  const n = fam ? 1 : c.num;
  sp.st.pos = [];
  for (let i = 0; i < n; i++) {
    const a = G.t * 1.6 + (i / n) * TAU;
    sp.st.pos.push([P().x + Math.cos(a) * 1.5, 1.6 + Math.sin(G.t * 3 + i) * 0.2, P().z + Math.sin(a) * 1.5]);
  }
  const cd = has(sp, 'magic_missile') ? c.cd / (1 + c.num * 0.25) : c.cd;
  cooldown(sp, dt, { cd }, () => {
    if (fam) {
      const shots = 15 * c.num;
      for (let k = 0; k < shots; k++) later((k / shots) * 0.8, () => {
        const [x, y, z] = sp.st.pos[0] || [P().x, 1.6, P().z];
        const a = (k / 15) * TAU + k * 0.07;
        if (G.hooks.familiarShot?.size) { G.hooks.familiarShot.forEach(f => f(x, z, a, c)); return; }
        shoot({ kind: 'bolt', x, y, z, vx: Math.sin(a) * 13, vz: Math.cos(a) * 13, ry: a, r: 0.3, s: 0.35, dmg: c.dmg, life: 1.1, color: COL.energy });
      });
      return;
    }
    const blade = has(sp, 'magic_blade');
    sp.st.pos.forEach(([x, y, z], i) => later(i * 0.12, () => {
      const t = nearest(x, z, 1, 13)[0];
      if (!t) return;
      const [dx, dz] = dirTo(x, z, t), v = blade ? 30 : 15;
      shoot({ kind: blade ? 'blade' : 'bolt', x, y, z, vx: dx * v, vz: dz * v, ry: Math.atan2(dx, dz), r: 0.35 * c.size,
        s: (blade ? 0.9 : 0.4) * c.size, dmg: c.dmg, pierce: Infinity, life: 0.9, color: blade ? [1.2, 1.3, 1.5] : COL.energy,
        onHit: G.hooks.onSpiritHit?.size ? (p, e) => G.hooks.onSpiritHit.forEach(f => f(p, e)) : null });
    }));
  });
  sp.draw = (gb) => {
    for (const [x, y, z] of sp.st.pos) {
      const s = fam ? 0.6 + c.num * 0.08 : 0.32;
      gb('orb', false).push(x, y, z, G.t * 2, s, s * 1.2, s, 1.3, 0.75, 1.5);
      gb('orb', true).push(x, y, z, 0, s * 1.7, s * 1.7, s * 1.7, 0.9, 0.5, 1.3);
    }
  };
}

// ---------------- Satélite ----------------
export function satellite(sp, dt, c) {
  const fusion = has(sp, 'nuclear_fusion'), wisp = has(sp, 'will_o_wisp');
  let mul = 1;
  if (has(sp, 'antigravity')) mul = 1 + 2 * (0.5 - 0.5 * Math.cos((G.t % 6) / 6 * TAU));
  sp.st.ang = (sp.st.ang || 0) + dt * 2.7 * c.speed * mul;
  const sats = [];
  if (fusion) sats.push([3.2, 0, 0.5 * c.size * (1 + c.num * 0.6)]);
  else {
    const n = c.num, half = wisp ? Math.ceil(n / 2) : n;
    for (let i = 0; i < n; i++) {
      const inner = !wisp || i < half, cnt = inner ? half : n - half, j = inner ? i : i - half;
      sats.push([inner ? 2.6 : 3.8, (inner ? 1 : -1) * ((j / cnt) * TAU), 0.42 * c.size]);
    }
  }
  sp.st.sats = sats.map(([R, off, r], i) => {
    const a = (wisp && i >= Math.ceil(c.num / 2) ? -sp.st.ang : sp.st.ang) + off;
    return [P().x + Math.cos(a) * R, P().z + Math.sin(a) * R, r];
  });
  const dmg = fusion ? c.dmg * c.num : c.dmg, every = fusion ? 0.3 : 0.5;
  for (const [x, z, r] of sp.st.sats) {
    inRadius(x, z, r, (e) => {
      if (G.t - (e.hitT.sat ?? -9) < every) return;
      e.hitT.sat = G.t;
      damage(e, dmg, { knock: fusion ? 0 : 2, kx: x, kz: z });
      G.hooks.onSatHit?.forEach(f => f(x, z, e, c));
    });
  }
  sp.draw = (gb) => {
    for (const [x, z, r] of sp.st.sats) {
      gb('orb', false).push(x, 1.0, z, G.t * 3, r, r, r, ...(fusion ? [1.5, 1.3, 0.6] : wisp ? [0.6, 1.4, 1.2] : [1.0, 0.8, 1.5]));
      gb('ring', false).push(x, 1.0, z, G.t * 5, r * 1.4, r * 1.4, r * 1.4, 1.4, 1.4, 1.4);
    }
  };
}

// ---------------- Raio Arcano ----------------
export function fireRay(x, z, a, c, o = {}) {
  const len = o.len ?? 42, w = 0.45 * c.size;
  return shoot({
    kind: 'beam', x, z, y: 1, ry: a, r: w, s: w, dmg: c.dmg * (o.mul ?? 1), pierce: Infinity, life: o.life ?? c.dur, follow: true,
    interval: o.interval ?? 0, color: o.color ?? [1.3, 0.7, 1.5], spin: o.spin ?? 0,
    update: (p, d) => { p.ry += p.spin * d; },
    test: (p, visit) => {
      const ex = p.x + Math.sin(p.ry) * len, ez = p.z + Math.cos(p.ry) * len;
      segmentHits(p.x, p.z, ex, ez, w, visit || ((e) => { damage(e, p.dmg); o.onHit?.(e); }));
    },
    onHit: o.onHit ? (p, e) => o.onHit(e) : null,
    draw: (p, gb) => {
      const fl = 1 - p.age / p.life;
      gb('beam', true).push(p.x, 1, p.z, p.ry, w * 2.4 * (0.6 + fl * 0.4), w * 2.4, len, ...p.color);
      gb('beam', false).push(p.x, 1, p.z, p.ry, w * 0.8, w * 0.8, len, 1.5, 1.4, 1.5);
    },
  });
}

export function arcane_ray(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const p = P();
    const ts = nearest(p.x, p.z, c.num, 30);
    if (has(sp, 'em_burst')) {
      const n = 1 + Math.floor(Math.random() * c.num);
      for (let i = 0; i < n; i++) fireRay(p.x, p.z, rand(TAU), c, { interval: 0.5 });
      return;
    }
    for (let i = 0; i < c.num; i++) {
      const t = ts[i % Math.max(1, ts.length)];
      const a = t ? Math.atan2(t.x - p.x, t.z - p.z) : rand(TAU);
      if (has(sp, 'disintegration')) { fireRay(p.x, p.z, a + (i / c.num) * TAU, c, { interval: 0.2, spin: 4.5, len: 16 }); continue; }
      later(i * 0.08, () => {
        fireRay(p.x, p.z, a, c);
        if (has(sp, 'reflect')) fireRay(p.x, p.z, a + Math.PI, c);
        G.hooks.onRay?.forEach(f => f(p.x, p.z, a, c));
      });
    }
  });
}

// ---------------- Zona Elétrica ----------------
export function electric_zone(sp, dt, c) {
  const R = 2.5 * c.size, p = P(), aura = has(sp, 'fire_aura');
  sp.st.tick = (sp.st.tick ?? 0) - dt;
  if (aura) {
    const cyc = c.interval * 2;
    const k0 = sp.st.k ?? 0, k = k0 + dt / cyc;
    sp.st.k = k % 1;
    if (k >= 1) sp.st.hit = new Set();
    sp.st.hit ??= new Set();
    const rr = R * 1.2 * sp.st.k;
    inRadius(p.x, p.z, rr, (e) => { if (!sp.st.hit.has(e)) { sp.st.hit.add(e); damage(e, c.dmg, { knock: 2 }); } });
  } else if (sp.st.tick <= 0) {
    sp.st.tick = c.interval;
    inRadius(p.x, p.z, R, (e) => {
      damage(e, c.dmg);
      if (has(sp, 'emp') && ++e.empHits % 4 === 0) e.stun = Math.max(e.stun, 0.7);
    });
    if (Math.random() < 0.6) { const a = rand(TAU), d = rand(R * 0.3, R); zap(p.x, p.z, p.x + Math.cos(a) * d, p.z + Math.sin(a) * d); }
    G.hooks.onZoneTick?.forEach(f => f(p.x, p.z, R, c));
  }
  sp.draw = (gb) => {
    if (aura) {
      const rr = R * 1.2 * (sp.st.k || 0);
      gb('ring', false).push(p.x, 0.12, p.z, 0, rr, 1, rr, 1.5, 0.6, 0.2);
      gb('disk', true).push(p.x, 0.04, p.z, 0, rr, 1, rr, 1.4, 0.5, 0.2);
    } else {
      gb('disk', true).push(p.x, 0.04, p.z, G.t, R, 1, R, 1.2, 1.15, 0.4);
      gb('ring', false).push(p.x, 0.1, p.z, G.t * 2, R, 1, R, 1.4, 1.35, 0.4);
    }
  };
}

// ---------------- Nova Congelante ----------------
export function nova(x, z, R, dmg, o = {}) {
  explode(x, z, R, dmg, { color: o.color ?? COL.ice, freeze: o.freeze ?? 1.6, stun: o.stun ?? 0, vlife: 0.45 });
  vfx('dome', x, 0, z, { life: 0.45, s0: R * 0.2, s1: R, sy: 0.6, color: o.color ?? COL.ice, soft: true, ease: true });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    vfx('shard', x + Math.cos(a) * R * 0.8, 0.3, z + Math.sin(a) * R * 0.8, { life: 0.6, s0: 0.6, s1: 0.1, ry: a, color: o.color ?? COL.ice });
  }
}
export function frost_nova(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const p = P(), R = 3.6 * c.size;
    const quake = has(sp, 'earthquake');
    const opt = quake ? { color: [1.0, 0.75, 0.45], freeze: 0, stun: 1.2 } : { freeze: has(sp, 'absolute_zero') ? 2 : 1.6 };
    if (has(sp, 'ice_age')) {
      for (let k = 0; k < 3; k++) later(k * 0.35, () => nova(P().x, P().z, R * 1.5 ** k, c.dmg * 1.5 ** k, opt));
    } else nova(p.x, p.z, R, c.dmg, opt);
    if (has(sp, 'absolute_zero')) inRadius(p.x, p.z, R * 1.7, (e) => { if (!e.def.large) e.freeze = Math.max(e.freeze, 2); });
    G.hooks.onNova?.forEach(f => f(p.x, p.z, R, c));
  });
}

// ---------------- Zona de Lava ----------------
export function lavaPool(x, z, R, c, life) {
  return shoot({ kind: 'disk', soft: true, x, z, y: 0.05, r: R, s: R, sy: 1, dmg: c.dmg, interval: c.interval, life,
    color: COL.lava, melt: c.melt ?? 0,
    draw: (p, gb) => {
      const k = Math.min(1, p.age * 4, (p.life - p.age) * 3);
      gb('disk', true).push(p.x, 0.05, p.z, 0, R * k, 1, R * k, 1.5, 0.45, 0.1);
      gb('ring', false).push(p.x, 0.08, p.z, p.age, R * k, 1, R * k, 1.0, 0.25, 0.05);
      if (Math.random() < 0.3) vfx('orb', p.x + rand(-R, R) * 0.6, 0.1, p.z + rand(-R, R) * 0.6, { life: 0.4, s0: 0.25, s1: 0.05, color: [1.5, 0.7, 0.1] });
    } });
}
export function lava_zone(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const magma = has(sp, 'magma_eruption');
    const n = magma ? 1 : c.num, R = 2.1 * c.size * (magma ? 1 + 0.3 * c.num : 1);
    const cc = { ...c, melt: has(sp, 'melt') ? 0.05 : 0 };
    for (let i = 0; i < n; i++) {
      const t = randomNear(P().x, P().z, 12);
      const [x, z] = t ? [t.x, t.z] : around(8);
      lavaPool(x, z, R, cc, c.dur);
    }
    sp.t = c.cd + c.dur; // a recarga só começa quando a lava some
  });
}

// ---------------- Choque Relâmpago ----------------
function flashBand(x, z, dx, dz, c, half, o = {}) {
  const w = 1.4 * c.size, v = 46;
  return shoot({
    kind: 'wall', x, z, y: 0, vx: dx * v, vz: dz * v, ry: Math.atan2(dx, dz), dmg: c.dmg, pierce: Infinity, life: o.life ?? 1.25, color: COL.storm,
    test: (p, visit) => segmentHits(p.x - dz * half, p.z + dx * half, p.x + dz * half, p.z - dx * half, w, visit),
    onHit: o.wipe ? (p, e) => { const perp = Math.abs((e.x - p.x) * dz - (e.z - p.z) * dx); if (perp < 2) damage(e, c.dmg * 9, { noCrit: true }); } : null,
    draw: (p, gb) => {
      gb('wall', true).push(p.x, 0, p.z, p.ry, half * 2, 2.6 * c.size, w * 2, 1.5, 1.45, 0.7);
      gb('wall', false).push(p.x, 0, p.z, p.ry, half * 2, 0.3, w * 0.5, 1.5, 1.5, 1.4);
      if (o.wipe) gb('wall', false).push(p.x, 0, p.z, p.ry, 4, 3.5 * c.size, w * 0.8, 1.5, 1.5, 1.5);
    },
  });
}
export function flash_shock(sp, dt, c) {
  cooldown(sp, dt, c, () => {
    const p = P();
    const dx = p.dirX, dz = p.dirZ, half = 16 * c.size;
    if (has(sp, 'satans_nails')) {
      sp.st.cast = ((sp.st.cast || 0) % 4) + 1;
      for (let i = 0; i < sp.st.cast * c.num; i++) later(i * 0.12, () => {
        const a = rand(TAU), ex = Math.sin(a), ez = Math.cos(a), [x, z] = around(12);
        for (const side of [-1, 0, 1]) flashBand(x - ex * 10 + ez * side * 3, z - ez * 10 - ex * side * 3, ex, ez, c, half * 0.35, { life: 0.5 });
      });
      return;
    }
    for (let i = 0; i < c.num; i++) later(i * 0.1, () => {
      const off = i === 0 ? 0 : rand(-18, 18);
      flashBand(p.x - dx * 22 + dz * off, p.z - dz * 22 - dx * off, dx, dz, c, half, { wipe: has(sp, 'wipeout') });
    });
  });
}
