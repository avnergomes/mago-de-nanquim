// Bestiário do jogo original: "espíritos mutantes" (fonte: NamuWiki 매직서바이벌 §9 e diário de experimentos).
// Números de hp/dano/velocidade são calibração desta releitura (o jogo não publica stats).
// ai: chase = persegue; line = voa reto como estrela cadente; drift = quase parado
// boom: explode ao tocar o jogador (some); deathBoom: explode ao morrer; resist: chance de ignorar congelar/atordoar
export const ENEMIES = {
  swarm:       { name: 'Swarm', core: null, hp: 30, speed: 2.6, dmg: 6, r: 0.5, xp: 1, scale: 1, ai: 'chase', roll: true },
  scarab:      { name: 'Scarab', core: 'white', hp: 16, speed: 7.5, dmg: 12, r: 0.45, xp: 1, scale: 0.9, ai: 'line', boom: true },
  corrupt:     { name: 'Corrupt', core: 'toxic', hp: 40, speed: 2.6, dmg: 7, r: 0.5, xp: 1, scale: 1, ai: 'chase', deathBoom: 10 },
  mine:        { name: 'Mine', core: 'red', hp: 130, speed: 2.3, dmg: 16, r: 0.75, xp: 3, scale: 1.3, ai: 'chase' },
  rampage:     { name: 'Rampage', core: 'pale', hp: 70, speed: 1.5, dmg: 9, r: 0.6, xp: 2, scale: 1.1, ai: 'chase', enrage: 6.5 },
  hive:        { name: 'Hive', core: null, hp: 650, speed: 1.0, dmg: 11, r: 1.6, xp: 8, scale: 2.6, ai: 'chase', large: true },
  overlord:    { name: 'Overlord', core: 'crimson', hp: 9000, speed: 2.1, dmg: 40, r: 1.5, xp: 120, scale: 2.4, ai: 'chase', large: true, grow: true, resist: 1, boss: true },
  colony:      { name: 'Colony', core: 'vein', hp: 4000, speed: 0.6, dmg: 14, r: 1.8, xp: 80, scale: 3, ai: 'chase', large: true, resist: 1, gas: true, boss: true },
  invader:     { name: 'Invader', core: 'cyan', hp: 90, speed: 2.2, dmg: 14, r: 0.7, xp: 3, scale: 1.25, ai: 'chase', enrage: 6, shrink: true },
  atlas:       { name: 'Atlas', core: 'ember', hp: 260, speed: 2.7, dmg: 18, r: 0.8, xp: 4, scale: 1.4, ai: 'chase', resist: 0.75 },
  terra:       { name: 'Terra', core: 'moon', hp: 45000, speed: 1.2, dmg: 50, r: 2.4, xp: 400, scale: 3.4, ai: 'chase', large: true, resist: 1, dark: 13, boss: true },
  citadel:     { name: 'Citadel', core: 'star', hp: 6000, speed: 1.5, dmg: 30, r: 2.0, xp: 100, scale: 3.6, ai: 'chase', large: true, resist: 1, ghost: true, deathBlast: 9, boss: true },
  interceptor: { name: 'Interceptor', core: 'yellow', hp: 20, speed: 8.5, dmg: 12, r: 0.45, xp: 1, scale: 0.85, ai: 'line', boom: true },
  howling:     { name: 'Howling', core: 'blue', hp: 110, speed: 2.9, dmg: 22, r: 0.7, xp: 3, scale: 1.2, ai: 'chase', boom: true },
};

// Setores (구역). Como no Ecossistema Artificial: um setor a cada 4 min, cada um termina numa onda final.
// pool = inimigos comuns; event = onda especial no meio do setor; final = onda final (larga Caixa Preta)
export const ZONES = [
  { id: 'arrays', name: 'Arranjos', en: 'Arrays', floor: 'arrays', pool: ['swarm', 'swarm', 'swarm', 'scarab'], event: 'scarabRain', final: ['citadel'] },
  { id: 'laboratory', name: 'Laboratório', en: 'Laboratory', floor: 'lab', pool: ['swarm', 'swarm', 'rampage', 'mine', 'scarab'], event: 'redAlert', final: ['overlord'] },
  { id: 'sewage', name: 'Esgoto', en: 'Sewage System', floor: 'sewage', pool: ['corrupt', 'corrupt', 'swarm', 'hive'], event: 'hiveRing', final: ['citadel', 'overlord'] },
  { id: 'arboretum', name: 'Arboreto', en: 'Arboretum', floor: 'arboretum', pool: ['swarm', 'mine', 'rampage', 'howling', 'interceptor'], event: 'mineRing', final: ['colony', 'colony'] },
  { id: 'power_plant', name: 'Usina', en: 'Power Plant', floor: 'power', pool: ['invader', 'invader', 'atlas', 'mine', 'interceptor'], event: 'atlasHorde', final: ['terra'] },
];

export const ZONE_TIME = 240;
export const RUN_LENGTH = 1200; // 20 min = 5 setores; depois segue em modo infinito
