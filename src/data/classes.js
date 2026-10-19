// Classes (학파) do Magic Survival (fonte: magic-survival-rpg.fandom.com/wiki/Classes).
// No original cada classe sobe de nível com material de pesquisa; aqui não há progressão
// entre partidas, então a classe escolhida vem com os bônus dos níveis 1 a 5 de uma vez.
// start: níveis iniciais por magia (todo mundo já começa com Projétil Mágico nível 1).
// mods: modificadores por magia, no mesmo formato dos atributos (src/data/spells.js).
// lvlDmg: dano da magia da classe +3% a cada 5 níveis do jogador.

const SIG = {
  cd: ['Recarga -20%', { cdMul: 0.8 }],
  num1: ['Número +1', { numAdd: 1 }],
  num35: ['Número +35%', { numMul: 1.35 }],
  size: ['Tamanho +25%', { sizeMul: 1.25 }],
  rot: ['Velocidade de rotação +50%', { speedMul: 1.5 }],
  tick: ['Intervalo de dano -20%', { intervalMul: 0.8 }],
};

// Classe ligada a uma magia: +2 níveis nela, dano +3% a cada 5 níveis, dois bônus e dano +20%.
function signature(id, name, en, spell, spellName, a, b) {
  const start = { [spell]: 2 };
  return {
    id, name, en, spell, start, lvlDmg: 0.03,
    mods: { [spell]: { ...SIG[a][1], ...SIG[b][1], dmgMul: 1.2 } },
    perks: [`${spellName} +2 níveis`, 'Dano dela +3% a cada 5 níveis', `${SIG[a][0]}, ${SIG[b][0].toLowerCase()}`, 'Dano dela +20%'],
  };
}

export const CLASSES = [
  signature('wizard', 'Feiticeiro', 'Wizard', 'magic_bolt', 'Projétil Mágico', 'cd', 'num1'),
  signature('astronomer', 'Astrônomo', 'Astronomer', 'satellite', 'Satélite', 'rot', 'num35'),
  signature('cryomancer', 'Criomante', 'Cryomancer', 'frost_nova', 'Nova Congelante', 'cd', 'size'),
  signature('shaman', 'Xamã', 'Shaman', 'thunderstorm', 'Tempestade de Raios', 'cd', 'num35'),
  signature('warlock', 'Bruxo', 'Warlock', 'meteor', 'Meteoro', 'cd', 'num35'),
  {
    id: 'arcanist', name: 'Arcanista', en: 'Arcanist', spell: 'magic_bolt', start: { magic_bolt: 1 },
    perLvlDmg: 0.01, choices: -1, manaBack: 0, passives: { intelligence: 1 },
    stats: (s) => { s.mana += 0.10; s.amp += 0.10; s.atk += 0.05; },
    perks: ['Projétil Mágico +1 nível', 'Dano de todas as magias +1% por nível', 'Uma carta a menos por escolha, sem Recuperar mana', 'Inteligência +1, mana +10%, ATK amplificado +10%, ATK +5%'],
  },
  signature('summoner', 'Invocador', 'Summoner', 'spirit', 'Espírito', 'cd', 'num35'),
  {
    id: 'bishop', name: 'Bispo', en: 'Bishop', spell: 'shield', start: { magic_bolt: 1, shield: 1 },
    shieldAmp: 0.10, specials: ['guardian_angel'], mods: { shield: { cdMul: 0.8, numAdd: 1 } },
    stats: (s) => { s.dmgTaken -= 0.05; },
    perks: ['Projétil Mágico e Escudo +1 nível', 'ATK amplificado +10% por escudo ativo', 'Anjo da Guarda: revive 1 vez, HP máximo +30%', 'Escudo: recarga -20%, número +1', 'Dano recebido -5%'],
  },
  signature('occultist', 'Ocultista', 'Occultist', 'arcane_ray', 'Raio Arcano', 'cd', 'num35'),
  signature('druid', 'Druida', 'Druid', 'cyclone', 'Ciclone', 'cd', 'num1'),
  signature('pyromancer', 'Piromante', 'Pyromancer', 'fireball', 'Bola de Fogo', 'cd', 'num1'),
  signature('sorcerer', 'Mago Elétrico', 'Sorcerer', 'electric_shock', 'Choque Elétrico', 'cd', 'num35'),
  signature('alchemist', 'Alquimista', 'Alchemist', 'energy_bolt', 'Raio de Energia', 'cd', 'num35'),
  {
    id: 'scholar', name: 'Erudito', en: 'Scholar', spell: null, startLevel: 3,
    perLvlDmg: 0.01, specials: ['doctor'], manaBack: 1.3, fourChance: 0.5,
    stats: (s) => { s.mana += 0.05; },
    perks: ['Começa 3 níveis acima', 'Dano de todas as magias +1% por nível', 'Doutor: nível máximo +3', 'Recuperar mana devolve +30%, 50% de chance de 4 cartas', 'Mana +5%'],
  },
  signature('witch', 'Bruxa', 'Witch', 'lava_zone', 'Zona de Lava', 'cd', 'num1'),
  signature('electromancer', 'Eletromante', 'Electromancer', 'electric_zone', 'Zona Elétrica', 'tick', 'size'),
  signature('arbiter', 'Árbitro', 'Arbiter', 'tsunami', 'Tsunami', 'cd', 'num35'),
  {
    id: 'archmage', name: 'Arquimago', en: 'Archmage', spell: 'magic_circle', start: { magic_circle: 1 }, startLevel: 3,
    comboDmg: 1.0, specials: ['silent_casting'],
    stats: (s) => { s.cdr += 0.03; },
    perks: ['Começa 3 níveis acima', 'Dano dos combos +100% (50% + 50%)', 'Círculo Mágico +1 nível', 'Conjuração Silenciosa: recarga -7%', 'Recarga de todas as magias -3%'],
  },
  {
    id: 'archaeologist', name: 'Arqueólogo', en: 'Archaeologist', spell: 'magic_bolt', start: { magic_bolt: 1 },
    chestEvery: 15, chestFreq: 1.1, passives: { explorer: 1 },
    stats: (s) => { s.mana += 0.10; s.pickup += 0.20; },
    perks: ['Projétil Mágico +1 nível', 'Um baú a cada 15 níveis', 'Explorador +1, mana +10%', 'Baús 10% mais frequentes', 'Alcance de coleta +20%'],
  },
  {
    id: 'magician', name: 'Ilusionista', en: 'Magician', spell: 'magic_bolt', start: { magic_bolt: 2 }, morph: 0.30,
    stats: (s) => { s.crit += 0.03; },
    perks: ['Projétil Mágico +2 níveis', '30% de chance de o projétil virar Choque Elétrico, Bola de Fogo, Espírito ou Raio de Energia', 'Crítico +3%'],
  },
  signature('mage', 'Mago', 'Mage', 'blizzard', 'Nevasca', 'cd', 'num35'),
  signature('battlemage', 'Mago de Batalha', 'Battlemage', 'flash_shock', 'Choque Relâmpago', 'cd', 'size'),
  signature('warlord', 'Senhor da Guerra', 'Warlord', 'incineration', 'Incineração', 'cd', 'size'),
  {
    id: 'black_mage', name: 'Mago Negro', en: 'Black Mage', spell: 'magic_bolt', start: { magic_bolt: 1 },
    killBlast: 0.20, passives: { arcane_effuse: 1 },
    stats: (s) => { s.size += 0.03; },
    perks: ['Projétil Mágico +1 nível', '20% de chance de o inimigo explodir ao morrer (75% do HP máximo dele)', 'Efusão Arcana +1', 'Tamanho de todas as magias +3%'],
  },
];

export const CLASS_BY_ID = Object.fromEntries(CLASSES.map(c => [c.id, c]));
