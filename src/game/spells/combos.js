import { G, rand, TAU } from '../state.js';
import { nearest, randomNear, inRadius } from '../enemies.js';
import { shoot, explode, vfx, damage, segmentHits } from '../combat.js';
import { calc, later, COL } from './core.js';
import { zap, chainLightning } from './attack1.js';
import { fireRay, nova, lavaPool } from './attack2.js';

// Efeitos-assinatura dos combos. O wiki só lista os pré-requisitos; os efeitos são desta releitura.
const P = () => G.player;
const C = (id) => calc(G.spells[id]);
const around = (r) => { const a = rand(TAU), d = Math.sqrt(Math.random()) * r; return [P().x + Math.cos(a) * d, P().z + Math.sin(a) * d]; };
const target = (r = 14) => { const t = randomNear(P().x, P().z, r); return t ? [t.x, t.z] : around(r * 0.7); };
const hook = (name, fn) => (G.hooks[name] ??= new Set()).add(fn);

function skyRock(x, z, s, color, land, fall = 0.55) {
  shoot({ kind: 'rock', x: x - 6, z: z - 6, y: 18, vx: 6 / fall, vz: 6 / fall, vy: -18 / fall, life: fall, noHit: true, s, color,
    update: (p) => { p.ry += 0.25; vfx('orb', p.x, p.y, p.z, { life: 0.3, s0: s * 0.8, s1: 0.1, color, soft: true }); }, onEnd: land });
}

const every = (cd, fn) => (rt, dt) => { rt.t = (rt.t ?? cd * 0.5) - dt; if (rt.t <= 0) { rt.t = cd * (1 - Math.min(0.6, G.stats.cdr)); fn(rt); } };

export const COMBO_FX = {
  wrath_of_the_sky: { update: every(6, () => {
    const c = C('thunderstorm');
    for (let i = 0; i < 7; i++) later(i * 0.18, () => {
      const [x, z] = target();
      skyRock(x, z, 1.1, [1.4, 1.3, 0.5], () => {
        explode(x, z, 2.8, c.dmg * 1.2, { color: COL.storm, stun: 0.3 });
        nearest(x, z, 3, 7).forEach(e => { zap(x, z, e.x, e.z); damage(e, c.dmg * 0.5); });
      });
    });
  }) },
  flying_sword: { update: every(3, () => {
    const c = C('spirit');
    nearest(P().x, P().z, 6, 18).forEach((e, i) => later(i * 0.08, () => {
      const a = (i / 6) * TAU, x = P().x + Math.cos(a) * 2, z = P().z + Math.sin(a) * 2;
      const dx = e.x - x, dz = e.z - z, d = Math.hypot(dx, dz) || 1;
      shoot({ kind: 'blade', x, z, y: 1.2, vx: dx / d * 26, vz: dz / d * 26, ry: Math.atan2(dx, dz), r: 0.5, s: 1.1, dmg: c.dmg * 1.5, pierce: 3, life: 1,
        color: [1.3, 1.4, 1.5], onHit: (p, t) => chainLightning(t, c.dmg * 0.6, 2, new Set()) });
    }));
  }) },
  light_bolt_blast: { update: every(5, () => {
    const c = C('energy_bolt');
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU;
      shoot({ kind: 'orb', x: P().x, z: P().z, y: 1, vx: Math.sin(a) * 9, vz: Math.cos(a) * 9, r: 0.45, s: 0.5, dmg: c.dmg, pierce: Infinity, life: 1.2,
        color: [1.5, 1.4, 0.9], onEnd: (p) => explode(p.x, p.z, 1.6, c.dmg, { color: [1.5, 1.4, 0.9] }) });
    }
  }) },
  tera_current: { update: every(4, () => {
    const c = C('arcane_ray');
    for (let i = 0; i < 4; i++) fireRay(P().x, P().z, rand(TAU), c, { color: COL.storm, life: 0.6, onHit: (e) => chainLightning(e, c.dmg * 0.4, 2, new Set()) });
  }) },
  war_climate: { update: every(6, () => {
    const c = C('meteor');
    for (let i = 0; i < 8; i++) later(i * 0.15, () => {
      const [x, z] = target();
      skyRock(x, z, 0.9, COL.ice, () => explode(x, z, 2.6, c.dmg, { color: COL.ice, freeze: 2 }));
    });
  }) },
  demon_equation: { update: every(6, () => {
    const c = C('fireball'), t = nearest(P().x, P().z, 1, 20)[0];
    const a = t ? Math.atan2(t.x - P().x, t.z - P().z) : rand(TAU);
    shoot({ kind: 'orb', x: P().x, z: P().z, y: 1.2, vx: Math.sin(a) * 9, vz: Math.cos(a) * 9, r: 1.1, s: 1.6, dmg: 0, pierce: 1, life: 2, color: [1.5, 0.35, 0.6],
      onEnd: (p) => {
        explode(p.x, p.z, 4.5, c.dmg * 3, { color: [1.5, 0.4, 0.6] });
        for (let k = 0; k < 12; k++) {
          const b = (k / 12) * TAU;
          shoot({ kind: 'bolt', x: p.x, z: p.z, y: 1, vx: Math.sin(b) * 12, vz: Math.cos(b) * 12, ry: b, r: 0.4, s: 0.5, dmg: c.dmg, pierce: Infinity, life: 0.6, color: [1.5, 0.9, 1.2] });
        }
      } });
  }) },
  frenzy: { update: every(2.5, () => {
    const c = C('flash_shock');
    nearest(P().x, P().z, 5, 16).forEach((e, i) => later(i * 0.1, () => {
      for (const a of [Math.PI / 4, -Math.PI / 4]) {
        const dx = Math.sin(a) * 3.5, dz = Math.cos(a) * 3.5;
        segmentHits(e.x - dx, e.z - dz, e.x + dx, e.z + dz, 0.6, (t) => damage(t, c.dmg * 0.35));
        vfx('beam', e.x - dx, 0.8, e.z - dz, { life: 0.25, ry: a, color: COL.storm, sx: 0.35, len: 7 });
      }
    }));
  }) },
  pandaemonium: { init: (rt) => hook('onSatHit', (x, z) => {
    if (G.t - (rt.last ?? 0) < 0.12) return;
    rt.last = G.t;
    explode(x, z, 1.8, C('fireball').dmg * 0.5, { color: COL.fire });
  }) },
  reaction: { update: every(0.45, () => {
    const c = C('energy_bolt');
    inRadius(P().x, P().z, 4.2, (e) => damage(e, c.dmg * 0.3));
    for (let i = 0; i < 3; i++) { const a = rand(TAU), d = rand(1, 4.2); zap(P().x, P().z, P().x + Math.cos(a) * d, P().z + Math.sin(a) * d, [1.4, 0.6, 1.5]); }
  }) },
  vortex: { update: every(7, () => {
    const c = C('cyclone'), [x, z] = target(12);
    shoot({ kind: 'cyclone', soft: true, x, z, y: 0, r: 8, s: 4, sy: 5, dmg: c.dmg * 0.6, interval: 0.3, life: 3.2, color: [0.6, 0.4, 1.3],
      update: (p, d) => {
        p.ry += d * 12;
        inRadius(p.x, p.z, 8, (e) => { if (e.def.boss) return; const dx = p.x - e.x, dz = p.z - e.z, dd = Math.hypot(dx, dz) || 1; e.x += dx / dd * 6 * d; e.z += dz / dd * 6 * d; });
      } });
  }) },
  breath_of_fire: { update: every(3.5, () => {
    const c = C('incineration'), f = Math.atan2(P().dirX, P().dirZ);
    for (const base of [f, f + Math.PI]) for (let k = -2; k <= 2; k++) fireRay(P().x, P().z, base + k * 0.28, c, { color: COL.fire, life: 0.5, len: 14 });
  }) },
  ether_fire: { update: every(5, () => {
    const c = C('incineration');
    for (let i = 0; i < 10; i++) later(i * 0.12, () => {
      const [x, z] = target();
      skyRock(x, z, 0.6, [0.4, 0.8, 1.5], () => {
        explode(x, z, 1.8, c.dmg, { color: [0.4, 0.8, 1.5] });
        lavaPool(x, z, 1.6, { ...c, interval: 0.4, dmg: c.dmg * 0.4 }, 2).color = [0.4, 0.8, 1.5];
      }, 0.4);
    });
  }) },
  orbital_bombing: { update: every(8, () => {
    const c = C('thunderstorm'), [x, z] = target(16);
    shoot({ kind: 'column', soft: true, x, z, y: 0, r: 3.6, s: 3.6, sy: 40, dmg: c.dmg * 0.8, interval: 0.2, life: 2.2, color: [1.5, 1.4, 1.0], knock: 0,
      draw: (p, gb) => { gb('column', true).push(p.x, 0, p.z, 0, 3.6, 40, 3.6, 1.4, 1.35, 0.9); gb('column', false).push(p.x, 0, p.z, 0, 1.2, 40, 1.2, 1.5, 1.5, 1.4); } });
  }) },
  neutron_generation: { update: every(0.25, () => {
    const s = G.spells.satellite?.st.sats?.[0];
    if (!s) return;
    const a = rand(TAU), c = C('cyclone');
    shoot({ kind: 'orb', x: s[0], z: s[1], y: 1, vx: Math.sin(a) * 12, vz: Math.cos(a) * 12, r: 0.35, s: 0.4, dmg: c.dmg * 0.5, life: 1, color: COL.storm });
  }) },
  winter_storm: { update: every(5, () => {
    const c = C('blizzard');
    for (let i = 0; i < 3; i++) {
      const [x, z] = around(8), a = rand(TAU);
      shoot({ kind: 'orb', soft: true, x, z, y: 0.6, vx: Math.sin(a) * 2, vz: Math.cos(a) * 2, r: 2.6, s: 2.6, sy: 1.1, dmg: c.dmg * 0.5, interval: 0.4, life: 4,
        freeze: 0.5, color: [0.7, 1.2, 0.9] });
    }
  }) },
  plasma_beam: { update: (rt, dt) => {
    const s = G.spells.satellite?.st.sats?.[0];
    if (!s) return;
    rt.t = (rt.t ?? 0) - dt;
    if (rt.t > 0) return;
    rt.t = 0.15;
    const c = C('arcane_ray'), a = Math.atan2(s[0] - P().x, s[1] - P().z);
    fireRay(P().x, P().z, a, c, { life: 0.16, len: 18, mul: 0.35, color: [1.5, 0.5, 0.9] });
  } },
  master_of_storms: { update: every(4, () => {
    const c = C('magic_bolt');
    for (let i = 0; i < 2; i++) {
      const [x, z] = around(7), a = rand(TAU);
      shoot({ kind: 'cyclone', soft: true, x, z, y: 0, vx: Math.sin(a) * 3, vz: Math.cos(a) * 3, r: 1.8, s: 1.6, sy: 3, dmg: c.dmg * 0.4, interval: 0.3, life: 3, color: COL.wind,
        update: (p, d) => {
          p.ry += d * 10;
          if ((p.k = (p.k || 0) + d) > 0.12) {
            p.k = 0;
            const b = rand(TAU);
            shoot({ kind: 'bolt', x: p.x, z: p.z, y: 1, vx: Math.sin(b) * 15, vz: Math.cos(b) * 15, ry: b, r: 0.3, s: 0.4, dmg: c.dmg, life: 0.8, color: COL.arcane });
          }
        } });
    }
  }) },
  runaway_electricity: { init: () => hook('familiarShot', (x, z, a, c) => {
    shoot({ kind: 'shard', x, z, y: 1.4, vx: Math.sin(a) * 15, vz: Math.cos(a) * 15, ry: a, r: 0.35, s: 0.5, dmg: c.dmg, life: 1, color: COL.storm,
      onHit: (p, e) => chainLightning(e, c.dmg * 0.6, 2, new Set()) });
  }) },
  lightning_attunement: { update: every(0.3, () => {
    const sats = G.spells.satellite?.st.sats || [], c = C('electric_zone');
    for (const [x, z] of sats) {
      const e = randomNear(x, z, 6);
      if (e) { zap(x, z, e.x, e.z); damage(e, c.dmg * 3); }
    }
  }) },
  blooming_snowflakes: { init: () => hook('onNova', (x, z, R, c) => {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + rand(0.5);
      shoot({ kind: 'star', x, z, y: 1, vx: Math.sin(a) * 8, vz: Math.cos(a) * 8, ry: a, r: 0.4, s: 0.6, dmg: c.dmg * 0.3, pierce: Infinity, life: 0.7, color: COL.ice,
        update: (p, d) => { p.ry += d * 8; }, onEnd: (p) => nova(p.x, p.z, 2.2, c.dmg * 0.6) });
    }
  }) },
  inferno: { init: (rt) => hook('onFlame', (q) => {
    if (G.t - (rt.last ?? 0) < 0.12) return;
    rt.last = G.t;
    lavaPool(q.x, q.z, 1.2, { ...C('lava_zone'), interval: 0.5, dmg: C('lava_zone').dmg * 0.3 }, 1.6);
  }) },
  blast_furnace: { update: every(3, () => {
    const c = C('meteor'), [x, z] = target();
    skyRock(x, z, 1.3, COL.lava, () => {
      explode(x, z, 3.2, c.dmg, { color: COL.lava });
      lavaPool(x, z, 2.6, { ...C('lava_zone') }, 3);
    });
  }) },
  quantum_explosion: { init: () => hook('onShieldBreak', () => {
    const a = G.spells.armageddon;
    if (a) a.t -= 10;
    explode(P().x, P().z, 5.5, C('shield').dmg * 2, { color: [1.5, 0.6, 1.5] });
  }) },
  lightning_blast: { init: () => hook('onStrike', (x, z, dmg) => {
    const e = nearest(x, z, 1, 5)[0];
    if (e) chainLightning(e, dmg * 0.4, 3, new Set());
  }) },
  deluge: { update: every(4, () => {
    const c = C('tsunami');
    for (let i = 0; i < 3; i++) {
      const [x, z] = around(10), a = rand(TAU);
      shoot({ kind: 'cyclone', soft: true, x, z, y: 0, vx: Math.sin(a) * 4, vz: Math.cos(a) * 4, r: 2.2, s: 1.8, sy: 4, dmg: c.dmg * 0.5, interval: 0.35, life: 3.5,
        color: COL.water, update: (p, d) => {
          p.ry += d * 9;
          inRadius(p.x, p.z, 4, (e) => { if (e.def.large) return; e.x += (p.x - e.x) * 2 * d; e.z += (p.z - e.z) * 2 * d; });
        } });
    }
  }) },
};
