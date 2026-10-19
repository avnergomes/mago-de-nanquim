import { G, rand, TAU } from '../state.js';
import { list as enemies, inRadius } from '../enemies.js';
import { explode, vfx, damage, kill } from '../combat.js';
import { spawnRandomItem } from '../pickups.js';
import { has, later } from './core.js';

const P = () => G.player;

// ---------------- Escudo ----------------
export function shield(sp, dt, c) {
  const max = c.num;
  sp.st.charges ??= max;
  sp.st.amp = (G.cls?.shieldAmp || 0) * sp.st.charges;
  if (sp.st.charges < max) {
    sp.t -= dt;
    if (sp.t <= 0) { sp.t = c.cd; sp.st.charges = Math.min(max, sp.st.charges + (has(sp, 'reconstruct') ? 2 : 1)); }
  } else sp.t = c.cd;
  // chamado pelo jogador antes de sofrer dano; true = golpe bloqueado
  sp.block = () => {
    if (sp.st.charges <= 0) return false;
    sp.st.charges--;
    vfx('dome', P().x, 0, P().z, { life: 0.35, s0: 1.2, s1: 2.4, color: [1.3, 1.3, 1.5], soft: true });
    if (has(sp, 'destruction_field')) {
      for (let k = 0; k < 4; k++) later(k * 0.25, () => explode(P().x, P().z, 3.6 * c.size, c.dmg, { color: [1.5, 0.9, 1.3] }));
    }
    G.hooks.onShieldBreak?.forEach(f => f());
    return true;
  };
  const tint = [[1.5, 0.4, 0.4], [0.5, 1.4, 0.5], [1.5, 1.4, 0.4], [1.5, 1.5, 1.5], [0.6, 1.5, 0.8]][Math.max(0, sp.st.charges - 1)] || [1, 1, 1];
  sp.draw = (gb) => {
    if (sp.st.charges > 0) gb('dome', true).push(P().x, 0, P().z, G.t, 1.25, 1.6, 1.25, ...tint.map(v => v * 0.8));
  };
}

// ---------------- Camuflagem ----------------
export function cloaking(sp, dt, c) {
  sp.t = Math.max(0, sp.t - dt);
  if (G.cloaked > 0) {
    G.cloaked -= dt;
    if (G.cloaked <= 0) {
      G.cloaked = 0;
      if (has(sp, 'space_warp')) {
        explode(P().x, P().z, 9 * c.size, c.dmg, { color: [0.8, 0.4, 1.5], vlife: 0.6 });
        vfx('dome', P().x, 0, P().z, { life: 0.6, s0: 1, s1: 9 * c.size, sy: 0.5, color: [0.7, 0.4, 1.5], soft: true, ease: true });
      }
    }
  }
  // ativa sozinha quando o jogador é atingido ou fica cercado
  sp.trigger = () => {
    if (sp.t > 0 || G.cloaked > 0) return false;
    sp.t = c.cd;
    G.cloaked = c.dur;
    vfx('ring', P().x, 0.2, P().z, { life: 0.4, s0: 0.5, s1: 3, color: [0.7, 0.7, 1.4] });
    return true;
  };
  if (sp.t <= 0 && G.cloaked <= 0) {
    let near = 0;
    inRadius(P().x, P().z, 2.2, () => near++);
    if (near >= 10) sp.trigger();
  }
  sp.soulHarvest = has(sp, 'soul_harvest');
  sp.st.mana = sp.soulHarvest && G.cloaked > 0 ? 0.33 : 0;
}

// ---------------- Círculo Mágico ----------------
export function magic_circle(sp, dt, c) {
  sp.st.left = Math.max(0, (sp.st.left || 0) - dt);
  sp.t -= dt;
  if (sp.t <= 0) {
    sp.t = c.cd + c.dur;
    sp.st.left = c.dur;
    if (has(sp, 'material_synthesis')) {
      for (let i = 0; i < 5; i++) { const a = rand(TAU); spawnRandomItem(P().x + Math.cos(a) * 3, P().z + Math.sin(a) * 3); }
    }
  }
  // Amplificação 25% +5% por nível (2 a 4); Grande Círculo dobra
  sp.st.amp = sp.st.left > 0 ? (0.25 + 0.05 * (Math.min(sp.lvl, 4) - 1)) * (has(sp, 'great_circle') ? 2 : 1) : 0;
  sp.st.cdr = sp.st.left > 0 && has(sp, 'unleash_mana') ? 0.15 : 0;
  sp.st.mana = has(sp, 'material_synthesis') ? 0.15 : 0;
  sp.draw = (gb) => {
    if (sp.st.left <= 0) return;
    const R = 2.4;
    gb('ring', false).push(P().x, 0.08, P().z, G.t, R, 1, R, 1.5, 0.6, 1.4);
    gb('ring', false).push(P().x, 0.08, P().z, -G.t * 1.5, R * 0.75, 1, R * 0.75, 1.5, 0.6, 1.4);
    gb('star', false).push(P().x, 0.06, P().z, G.t, R * 1.2, 0.02, R * 1.2, 1.4, 0.5, 1.3);
  };
}

// ---------------- Armagedom ----------------
export function armageddon(sp, dt, c) {
  sp.st.casts ??= 0;
  sp.t -= dt;
  if (has(sp, 'doom_prophet') && !sp.st.hooked) {
    sp.st.hooked = true;
    (G.hooks.onOrb ??= new Set()).add(() => { sp.t -= 1; });
  }
  sp.st.regen = has(sp, 'rapture') ? 0.001 : 0;
  if (sp.t > 0) return;
  sp.t = c.cd;
  sp.st.casts++;
  const p = P();
  vfx('orb', p.x, 20, p.z, { life: 0.6, s0: 1.5, s1: 2.5, color: [1.5, 0.5, 0.3], update: (f) => { f.y = 20 - (f.age / f.life) * 20; } });
  later(0.6, () => {
    vfx('dome', p.x, 0, p.z, { life: 1.0, s0: 2, s1: G.viewR * 1.3, sy: 0.6, color: [1.5, 0.6, 0.25], soft: true, ease: true });
    vfx('ring', p.x, 0.2, p.z, { life: 1.0, s0: 2, s1: G.viewR * 1.3, color: [1.2, 0.3, 0.1], ease: true });
    for (const e of enemies) {
      if (!e.alive || (e.x - p.x) ** 2 + (e.z - p.z) ** 2 > (G.viewR * 1.3) ** 2) continue;
      if (e.def.boss) damage(e, e.maxHp * 0.15, { noCrit: true });
      else kill(e);
    }
    if (has(sp, 'apocalypse')) G.apocT = 20;
    if (has(sp, 'rapture') && sp.st.casts % 4 === 0) p.hp = p.maxHp;
  });
  sp.st.regen = has(sp, 'rapture') ? 0.001 : 0;
}
