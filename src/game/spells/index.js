import { G } from '../state.js';
import { SPELL_BY_ID } from '../../data/spells.js';
import { COMBOS } from '../../data/combos.js';
import { calc, updateTimers } from './core.js';
import * as A1 from './attack1.js';
import * as A2 from './attack2.js';
import * as U from './utility.js';
import { COMBO_FX } from './combos.js';

const EXEC = {
  magic_bolt: A1.magic_bolt, fireball: A1.fireball, thunderstorm: A1.thunderstorm, meteor: A1.meteor,
  cyclone: A1.cyclone, electric_shock: A1.electric_shock, energy_bolt: A1.energy_bolt, incineration: A1.incineration,
  blizzard: A1.blizzard, tsunami: A2.tsunami, spirit: A2.spirit, satellite: A2.satellite, arcane_ray: A2.arcane_ray,
  electric_zone: A2.electric_zone, frost_nova: A2.frost_nova, lava_zone: A2.lava_zone, flash_shock: A2.flash_shock,
  shield: U.shield, cloaking: U.cloaking, magic_circle: U.magic_circle, armageddon: U.armageddon,
};

export function learn(id) {
  const sp = G.spells[id];
  if (sp) { sp.lvl++; return sp; }
  return (G.spells[id] = { def: SPELL_BY_ID[id], lvl: 1, attrs: new Set(), t: 0.3, st: {} });
}

export function addAttr(id, attrId) {
  G.spells[id].attrs.add(attrId);
}

export function combosReady() {
  return COMBOS.filter(cb => !G.combos[cb.id] && [cb.a, cb.b].every(([s, at]) => G.spells[s]?.attrs.has(at)));
}

export function activateCombo(id) {
  const rt = { t: undefined };
  G.combos[id] = rt;
  COMBO_FX[id]?.init?.(rt);
}

export function updateSpells(dt) {
  updateTimers(dt);
  let amp = 0, cdr = 0, regen = 0, mana = 0;
  for (const id in G.spells) {
    const sp = G.spells[id];
    EXEC[id](sp, dt, calc(sp));
    amp += sp.st.amp || 0; cdr += sp.st.cdr || 0; regen += sp.st.regen || 0; mana += sp.st.mana || 0;
  }
  G.buff.amp = amp; G.buff.cdr = cdr; G.buff.regen = regen; G.buff.mana = mana;
  for (const id in G.combos) COMBO_FX[id]?.update?.(G.combos[id], dt);
}

export function drawSpells(gb) {
  for (const id in G.spells) G.spells[id].draw?.(gb);
}

// teste de fumaça: todas as magias no nível máximo com um atributo cada, mais todos os combos possíveis
export function grantAll(pickAttr = (def) => def.attrs.filter(a => !a.tier || a.tier === 7)[0].id) {
  for (const id of Object.keys(EXEC)) {
    const def = SPELL_BY_ID[id];
    G.spells[id] = { def, lvl: def.levels.length + 1, attrs: new Set(), t: 0.2, st: {} };
    if (id === 'magic_bolt') G.spells[id].attrs.add('fission');
    G.spells[id].attrs.add(pickAttr(def));
  }
}
export { EXEC };
