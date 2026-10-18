import { G, shuffle } from './state.js';
import { SPELLS, maxLevel } from '../data/spells.js';
import { PASSIVES, GROWTH, SPECIALS } from '../data/passives.js';
import { COMBOS } from '../data/combos.js';
import { learn, addAttr, combosReady, activateCombo } from './spells/index.js';
import { recomputeStats } from './player.js';

// Monta as opções de subida de nível. Cada opção: { kind, id, title, sub, desc, icon, elem, apply }
export function levelOptions() {
  const opts = [];
  for (const cb of combosReady()) {
    opts.push({ kind: 'combo', id: cb.id, icon: '✸', title: cb.name, sub: 'Combinação', desc: cb.desc, weight: 6, apply: () => activateCombo(cb.id) });
  }
  for (const def of SPELLS) {
    const sp = G.spells[def.id];
    if (!sp) {
      opts.push({ kind: 'new', id: def.id, icon: def.icon, elem: def.elem, title: def.name, sub: `${def.en} · Nova`, desc: def.desc, weight: def.utility ? 0.6 : 1, apply: () => learn(def.id) });
    } else if (sp.lvl < maxLevel(def)) {
      const L = def.levels[sp.lvl - 1];
      const desc = L === 'attr' ? 'Desbloqueia um atributo: escolha 1 de 3.' : describeLevel(L);
      opts.push({ kind: 'up', id: def.id, icon: def.icon, elem: def.elem, title: def.name, sub: `Nível ${sp.lvl + 1}`, desc, weight: 1.6,
        apply: () => { learn(def.id); if (L === 'attr') return { attrFor: def.id, tier: sp.lvl }; } });
    }
  }
  for (const ps of PASSIVES) {
    const n = G.passives[ps.id] || 0;
    if (n < ps.max + G.stats.passiveBonus) {
      opts.push({ kind: 'passive', id: ps.id, icon: ps.icon, title: ps.name, sub: `Passiva ${n + 1}/${ps.max + G.stats.passiveBonus}`, desc: ps.desc, weight: 0.9,
        apply: () => { G.passives[ps.id] = n + 1; recomputeStats(); } });
    }
  }
  let pool = opts;
  if (G.level >= G.stats.maxLevel || pool.length < 3) {
    for (const gp of GROWTH) {
      const n = G.growth[gp.id] || 0;
      if (n < gp.max) pool.push({ kind: 'growth', id: gp.id, icon: gp.icon, title: gp.name, sub: `Crescimento ${n + 1}/${gp.max}`, desc: gp.desc, weight: 1,
        apply: () => { G.growth[gp.id] = n + 1; recomputeStats(); } });
    }
    if (G.level >= G.stats.maxLevel) pool = pool.filter(o => o.kind === 'growth' || o.kind === 'combo');
  }
  if (!pool.length) pool.push({ kind: 'heal', icon: '❤', title: 'Poção', sub: 'Recuperação', desc: 'Recupera 30% do HP.', weight: 1, apply: () => { G.player.hp = Math.min(G.player.maxHp, G.player.hp + G.player.maxHp * 0.3); } });
  return weightedPick(pool, 3 + (G.extraChoice ? 1 : 0));
}

function weightedPick(pool, n) {
  const out = [], rest = pool.slice();
  while (out.length < n && rest.length) {
    const total = rest.reduce((s, o) => s + o.weight, 0);
    let r = Math.random() * total, i = 0;
    while ((r -= rest[i].weight) > 0) i++;
    out.push(rest.splice(i, 1)[0]);
  }
  return out;
}

function describeLevel(L) {
  const t = [];
  if (L.dmg) t.push(`Dano +${Math.round(L.dmg * 100)}%`);
  if (L.num) t.push(`Número +${L.num}`);
  if (L.size) t.push(`Tamanho +${Math.round(L.size * 100)}%`);
  if (L.cd) t.push(`Recarga -${Math.round(L.cd * 100)}%`);
  if (L.dur) t.push(`Duração +${Math.round(L.dur * 100)}%`);
  return t.join(', ');
}

// Atributos oferecidos ao destravar (Projétil Mágico tem dois momentos: nível 4 e 7)
export function attrOptions(spellId, atLevel) {
  const sp = G.spells[spellId];
  return sp.def.attrs
    .filter(a => !a.tier || a.tier === atLevel)
    .map(a => {
      const combo = COMBOS.filter(cb => (cb.a[0] === spellId && cb.a[1] === a.id) || (cb.b[0] === spellId && cb.b[1] === a.id));
      return { kind: 'attr', id: a.id, spell: sp.def.id, icon: sp.def.icon, elem: sp.def.elem, title: a.name, sub: `${sp.def.name} · ${a.en}`,
        desc: a.desc + (combo.length ? `\nCombo: ${combo.map(c => c.name).join(', ')}` : ''), apply: () => addAttr(spellId, a.id) };
    });
}

// Baú: 3 passivas especiais ainda não obtidas
export function chestOptions() {
  const avail = shuffle(SPECIALS.filter(s => !G.specials.has(s.id))).slice(0, 3);
  if (!avail.length) return [{ kind: 'heal', icon: '❤', title: 'Tesouro', sub: 'Baú', desc: 'Recupera todo o HP.', apply: () => { G.player.hp = G.player.maxHp; } }];
  return avail.map(s => ({ kind: 'special', id: s.id, icon: s.icon, title: s.name, sub: 'Passiva Especial', desc: s.desc,
    apply: () => { G.specials.add(s.id); recomputeStats(); if (s.id === 'noblesse') s.apply(G.stats, G); } }));
}
