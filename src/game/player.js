import { G, baseStats, HP_BASE, SPEED_BASE, xpNeeded } from './state.js';
import { PASSIVES, GROWTH, SPECIALS } from '../data/passives.js';
import { inRadius } from './enemies.js';
import { damage } from './combat.js';
import { input } from './input.js';

export function createPlayer() {
  G.player = { x: 0, z: 0, r: 0.38, hp: HP_BASE, maxHp: HP_BASE, dirX: 0, dirZ: 1, moving: false, invuln: 0, face: 0, walk: 0, hurtFlash: 0 };
  recomputeStats();
}

export function recomputeStats() {
  const st = baseStats();
  for (const ps of PASSIVES) for (let i = 0; i < (G.passives[ps.id] || 0); i++) ps.apply(st);
  for (const gp of GROWTH) for (let i = 0; i < (G.growth[gp.id] || 0); i++) gp.apply(st);
  for (const sp of SPECIALS) if (G.specials.has(sp.id) && sp.id !== 'noblesse') sp.apply(st, G);
  G.cls?.stats?.(st);
  st.revive -= G.usedRevives || 0;
  const p = G.player;
  const ratio = p.hp / p.maxHp;
  G.stats = st;
  p.maxHp = HP_BASE * (1 + st.maxHp);
  p.hp = Math.max(1, ratio * p.maxHp);
}

export function updatePlayer(dt) {
  const p = G.player, st = G.stats;
  const [ix, iz] = input.dir();
  p.moving = ix !== 0 || iz !== 0;
  const speed = SPEED_BASE * (1 + st.speed) * (G.cloaked > 0 ? 1.5 : 1) * (G.runes.frenzy > 0 ? 1.25 : 1);
  const ox = p.x, oz = p.z;
  if (p.moving) {
    p.x += ix * speed * dt; p.z += iz * speed * dt;
    p.dirX = ix; p.dirZ = iz;
    const target = Math.atan2(ix, iz);
    let d = target - p.face;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    p.face += d * Math.min(1, dt * 14);
    p.walk += dt * 10;
  }
  p.invuln = Math.max(0, p.invuln - dt);
  p.hurtFlash = Math.max(0, p.hurtFlash - dt);
  const regen = st.regen + (G.buff.regen || 0);
  p.hp = Math.min(p.maxHp, p.hp + p.maxHp * regen * dt);
  for (const k in G.runes) G.runes[k] = Math.max(0, G.runes[k] - dt);
  G.alertT = Math.max(0, (G.alertT || 0) - dt);
  if (G.apocT > 0) G.apocT = Math.max(0, G.apocT - dt);
  return [p.x - ox, p.z - oz];
}

export function hurtPlayer(dmg) {
  const p = G.player;
  if (p.invuln > 0 || G.cloaked > 0 || G.over || G.runes.inv > 0) return;
  if (G.spells.shield?.block?.()) { p.invuln = 0.5; return; }
  if (G.spells.cloaking?.trigger?.()) return;
  p.hp -= dmg * Math.max(0.1, 1 + G.stats.dmgTaken);
  p.invuln = 0.6;
  p.hurtFlash = 0.2;
  if (p.hp > 0) return;
  if (G.stats.revive > 0) {
    G.stats.revive--;
    G.usedRevives = (G.usedRevives || 0) + 1;
    p.hp = p.maxHp * 0.5;
    p.invuln = 2;
    inRadius(p.x, p.z, 8, (e) => damage(e, 1e6, { noCrit: true }));
    G.ui?.banner('Anjo da Guarda: você reviveu!');
    return;
  }
  G.over = true;
}

export function gainXp(x) {
  G.xp += x;
  let need = xpNeeded(G.level);
  while (G.xp >= need) {
    G.xp -= need;
    G.level++;
    G.pendingLevels++;
    if (G.cls?.chestEvery && G.level % G.cls.chestEvery === 0) G.spawnChest(G.player.x + 3, G.player.z + 2);
    need = xpNeeded(G.level);
  }
}
