import { G, ATK_BASE } from '../state.js';

// Valores efetivos de uma magia: base x níveis x atributos x atributos do jogador.
export function calc(sp) {
  const d = sp.def, b = d.base, st = G.stats;
  let dmg = 0, num = 0, size = 0, cd = 0, dur = 0;
  for (let i = 0; i < sp.lvl - 1; i++) {
    const L = d.levels[i];
    if (L === 'attr') continue;
    dmg += L.dmg || 0; num += L.num || 0; size += L.size || 0; cd += L.cd || 0; dur += L.dur || 0;
  }
  let dmgMul = 1, numAdd = 0, numMul = 1, cdMul = 1, cdAdd = 0, sizeMul = 1, durMul = 1, speedMul = 1, intervalMul = 1;
  for (const id of sp.attrs) {
    const m = d.attrs.find(a => a.id === id).mods;
    dmgMul *= m.dmgMul ?? 1; numAdd += m.numAdd ?? 0; numMul *= m.numMul ?? 1;
    cdMul *= m.cdMul ?? 1; cdAdd += m.cdAdd ?? 0; sizeMul *= m.sizeMul ?? 1;
    durMul *= m.durMul ?? 1; speedMul *= m.speedMul ?? 1; intervalMul *= m.intervalMul ?? 1;
  }
  const atk = ATK_BASE * (1 + st.atk) * (1 + st.amp + G.buff.amp + (G.runes.frenzy > 0 ? 0.5 : 0));
  const elemMul = 1 + (st.elem[d.elem] || 0);
  const cdr = Math.min(0.6, st.cdr + G.buff.cdr);
  return {
    dmg: (b.dmg / 100) * atk * (1 + dmg) * dmgMul * elemMul * (1 + st.magicDmg),
    num: Math.max(1, Math.round((b.num + num + numAdd) * numMul)),
    cd: Math.max(0.08, (b.cd * (1 - cd) * cdMul + cdAdd) * (1 - cdr)),
    size: (1 + size) * sizeMul * (1 + st.size),
    dur: (b.dur || 1) * (1 + dur) * durMul * (1 + st.dur),
    speed: speedMul,
    interval: (b.interval || 0.3) * intervalMul,
  };
}

export const has = (sp, attrId) => sp.attrs.has(attrId);

// Laço de recarga padrão: chama cast quando o tempo zera
export function cooldown(sp, dt, c, cast) {
  sp.t -= dt;
  if (sp.t <= 0) { sp.t = c.cd; cast(); }
}

// Agenda ações ao longo do tempo (rajadas, sequências)
export const timers = [];
export function later(delay, fn) { timers.push({ t: delay, fn }); }
export function updateTimers(dt) {
  for (let i = timers.length - 1; i >= 0; i--) {
    const k = timers[i];
    k.t -= dt;
    if (k.t <= 0) { timers[i] = timers[timers.length - 1]; timers.pop(); k.fn(); }
  }
}

// cores por elemento (valores > 1 brilham depois do passe de tinta)
export const COL = {
  arcane: [0.55, 0.65, 1.5], fire: [1.5, 0.55, 0.2], storm: [1.4, 1.3, 0.35], ice: [0.6, 1.1, 1.5],
  wind: [0.7, 1.3, 0.9], energy: [1.2, 0.5, 1.5], water: [0.3, 0.7, 1.4], lava: [1.5, 0.35, 0.1],
  holy: [1.5, 1.4, 1.0], dark: [0.5, 0.3, 0.7],
};
