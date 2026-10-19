// Estado global da partida. Um jogo de ação muda estado a cada quadro; centralizar aqui
// evita passar dezenas de referências entre sistemas.
export const G = {
  t: 0, running: false, paused: false, over: false,
  player: null,
  stats: null,
  buff: { amp: 0, cdr: 0, slowAura: 0 },
  spells: {},       // id -> runtime { def, lvl, attrs:Set, t, st }
  passives: {},     // id -> nível
  growth: {},
  specials: new Set(),
  artifacts: new Set(),
  combos: {},       // id -> runtime
  level: 1, xp: 0, kills: 0,
  apocT: 0,
  cloaked: 0,
  viewR: 22,
  pendingLevels: 0,
  bossesDone: new Set(),
  hooks: {},        // callbacks registrados por magias (onShieldBreak, onPickup, onKill...)
  runes: { inv: 0, frenzy: 0, greed: 0 },
};

export function baseStats() {
  return {
    atk: 0, amp: 0, cdr: 0, size: 0, dur: 0,
    crit: 0.05, critMul: 1.5,
    speed: 0, pickup: 0, maxHp: 0, regen: 0, lifeOrb: 0, dmgTaken: 0, revive: 0,
    elem: { fire: 0, storm: 0, nature: 0, energy: 0, none: 0 },
    enemySlow: 0, enemyHp: 0, eliteHp: 0, manaFreq: 0, maxLevel: 100,
    magicDmg: 0, passiveBonus: 0, rune: 0, mana: 0,
    dodge: 0, eliteDmg: 0, execute: 0, killHeal: 0,
  };
}

export const ATK_BASE = 10;
export const HP_BASE = 200; // HP base do jogo original
export const SPEED_BASE = 5.6;

export const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const randi = (n) => (Math.random() * n) | 0;
export const pick = (arr) => arr[randi(arr.length)];
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const TAU = Math.PI * 2;

export function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = randi(i + 1); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

export function xpNeeded(level) {
  return Math.floor(4 + level * 3 + Math.pow(level, 1.5));
}
