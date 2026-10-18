import { G, rand } from './state.js';

// Orbes de mana (XP), orbe de vida, ímã, runa de poder e baús.
export const items = [];
const ORB = {
  s: { xp: 1, color: [0.35, 0.6, 1.3], size: 0.22 },
  m: { xp: 5, color: [0.35, 1.2, 0.45], size: 0.3 },
  l: { xp: 25, color: [1.3, 0.35, 0.35], size: 0.4 },
};

const RUNES = ['inv', 'frenzy', 'greed', 'cleanse'];
let killChest = 0;

export function dropLoot(e) {
  const d = e.def;
  if (e.blackBox) { spawnChest(e.x, e.z, 'blackbox'); G.ui?.banner('Caixa Preta!'); }
  if (e.elite) {
    addItem('orb', e.x, e.z, { sub: 'l' });
    const r = Math.random();
    if (r < 0.35) addItem('orb', e.x + 0.6, e.z, { sub: 'm' });
    else if (r < 0.65) addItem('life', e.x + 0.6, e.z);
    else addItem('rune', e.x + 0.6, e.z, { rune: RUNES[(Math.random() * RUNES.length) | 0] });
    return;
  }
  if (d.deathBlast) {
    addItem('orb', e.x, e.z, { sub: 'l' });
    addItem('rune', e.x + 1, e.z, { rune: RUNES[(Math.random() * RUNES.length) | 0] });
    if (Math.random() < 0.3) spawnChest(e.x - 1, e.z);
    return;
  }
  if (Math.random() < 0.85 + G.stats.manaFreq * 0.15 || d.xp >= 5) {
    const xp = d.xp;
    const kind = xp >= 25 ? 'l' : xp >= 3 ? 'm' : 's';
    const n = kind === 'l' ? Math.max(1, Math.round(xp / 25)) : 1;
    for (let i = 0; i < n; i++) addItem('orb', e.x + rand(-0.6, 0.6), e.z + rand(-0.6, 0.6), { sub: kind });
  }
  const roll = Math.random();
  if (roll < 0.006) addItem('life', e.x, e.z);
  else if (roll < 0.008) addItem('rune', e.x, e.z, { rune: RUNES[(Math.random() * RUNES.length) | 0] });
  // baú comum a cada 250 abates
  if (++killChest >= 250) { killChest = 0; const a = Math.random() * 6.28; spawnChest(G.player.x + Math.cos(a) * 9, G.player.z + Math.sin(a) * 9); }
}
export function resetLoot() { killChest = 0; }

export function addItem(type, x, z, o = {}) {
  items.push({ type, x, z, y: 0.4, pull: false, age: 0, ...o });
}
export function spawnChest(x, z, sub = 'common') { addItem('chest', x, z, { sub }); }
export function spawnRandomItem(x, z) {
  const r = Math.random();
  addItem(r < 0.6 ? 'orb' : r < 0.85 ? 'life' : 'rune', x, z, { sub: 'm', rune: RUNES[(Math.random() * RUNES.length) | 0] });
}

export function updatePickups(dt, gainXp) {
  const p = G.player;
  const range = 4 * (1 + G.stats.pickup) * (G.runes.greed > 0 ? 3 : 1);
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.age += dt;
    const dx = p.x - it.x, dz = p.z - it.z, d = Math.hypot(dx, dz);
    if (it.type !== 'chest' && (d < range || it.pull)) {
      it.pull = true;
      const v = 14 + it.age * 2;
      it.x += (dx / (d || 1)) * v * dt; it.z += (dz / (d || 1)) * v * dt;
    }
    if (d < p.r + 0.5) {
      collect(it, gainXp);
      items[i] = items[items.length - 1];
      items.pop();
    }
  }
}

const RUNE_INFO = {
  inv: ['Runa da Invencibilidade', 8], frenzy: ['Runa do Frenesi: ATK +50%, velocidade +25%', 8],
  greed: ['Runa da Ganância', 5], cleanse: ['Runa da Purificação', 0],
};
function useRune(kind) {
  const [msg, dur] = RUNE_INFO[kind];
  G.ui?.banner(msg);
  if (kind === 'cleanse') { G.cleanse?.(); return; }
  G.runes[kind] = dur * (1 + G.stats.rune);
  if (kind === 'greed') for (const o of items) if (o.type === 'orb' && o.sub !== 'l') o.pull = true;
}

function collect(it, gainXp) {
  const p = G.player;
  if (it.type === 'orb') {
    gainXp(ORB[it.sub].xp * (1 + G.stats.mana + (G.buff.mana || 0)));
    G.hooks.onOrb?.forEach(f => f());
  } else if (it.type === 'life') {
    p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.2 * (1 + G.stats.lifeOrb));
  } else if (it.type === 'rune') {
    useRune(it.rune);
  } else if (it.type === 'chest') {
    G.ui?.openChest();
  }
}

export function drawPickups(getBatch) {
  const t = G.t;
  for (const it of items) {
    const bob = Math.sin(t * 4 + it.x) * 0.12;
    if (it.type === 'orb') {
      const o = ORB[it.sub], c = o.color;
      getBatch('shard', false).push(it.x, 0.45 + bob, it.z, t * 2 + it.z, o.size, o.size * 1.4, o.size, c[0], c[1], c[2]);
    } else if (it.type === 'life') {
      getBatch('orb', false).push(it.x, 0.5 + bob, it.z, 0, 0.42, 0.42, 0.42, 1.4, 0.3, 0.45);
      getBatch('ring', false).push(it.x, 0.5 + bob, it.z, t, 0.4, 0.4, 0.4, 1.4, 1.4, 1.4);
    } else if (it.type === 'rune') {
      const c = { inv: [1.4, 1.4, 1.5], frenzy: [1.5, 0.3, 0.25], greed: [0.4, 0.8, 1.5], cleanse: [0.3, 1.4, 0.6] }[it.rune];
      getBatch('star', false).push(it.x, 0.6 + bob, it.z, t * 2, 0.55, 0.9, 0.55, ...c);
      getBatch('ring', false).push(it.x, 0.1, it.z, t, 0.7, 1, 0.7, ...c);
    } else if (it.type === 'chest') {
      const bb = it.sub === 'blackbox';
      getBatch('chest', false).push(it.x, 0, it.z, Math.sin(t) * 0.1, 1.2, 1.2 + Math.abs(Math.sin(t * 3)) * 0.06, 1.2, ...(bb ? [0.25, 0.25, 0.3] : [1, 1, 1]));
      getBatch('ring', true).push(it.x, 0.1, it.z, t, 1.2 + Math.sin(t * 4) * 0.15, 1, 1.2, 1.4, 1.1, 0.3);
    }
  }
}

export const nearestChestDir = () => {
  const c = items.find(i => i.type === 'chest');
  return c ? Math.atan2(c.x - G.player.x, c.z - G.player.z) : null;
};
