// Passivas comuns, de crescimento (após o nível 100) e especiais (vindas de baús).
// apply(st, n) altera o objeto de atributos do jogador; n = nível atual (1..max).

export const PASSIVES = [
  { id: 'intelligence', name: 'Inteligência', icon: '🧠', max: 5, desc: 'ATK +10%', apply: (s) => { s.atk += 0.10; } },
  { id: 'fast_casting', name: 'Conjuração Rápida', icon: '⏱', max: 3, desc: 'Recarga de todas as magias -5%', apply: (s) => { s.cdr += 0.05; } },
  { id: 'vitality', name: 'Vitalidade', icon: '❤', max: 5, desc: 'HP máximo +20%, cura do Orbe de Vida +10%', apply: (s) => { s.maxHp += 0.20; s.lifeOrb += 0.10; } },
  { id: 'haste', name: 'Pressa', icon: '👟', max: 2, desc: 'Velocidade de movimento +10%', apply: (s) => { s.speed += 0.10; } },
  { id: 'arcane_effuse', name: 'Efusão Arcana', icon: '✷', max: 3, desc: 'Tamanho de todas as magias +5%', apply: (s) => { s.size += 0.05; } },
  { id: 'concentration', name: 'Concentração', icon: '◔', max: 3, desc: 'Duração de todas as magias +10%', apply: (s) => { s.dur += 0.10; } },
  { id: 'snipe', name: 'Precisão', icon: '◎', max: 3, desc: 'Chance de crítico +5%', apply: (s) => { s.crit += 0.05; } },
  { id: 'explorer', name: 'Explorador', icon: '🧭', max: 3, desc: 'Alcance de coleta +33%', apply: (s) => { s.pickup += 0.33; } },
];

export const GROWTH = [
  { id: 'g_intelligence', name: 'Inteligência+', icon: '🧠', max: 8, desc: 'ATK +3%', apply: (s) => { s.atk += 0.03; } },
  { id: 'g_fast_casting', name: 'Conjuração Rápida+', icon: '⏱', max: 6, desc: 'Recarga -1%', apply: (s) => { s.cdr += 0.01; } },
  { id: 'g_vitality', name: 'Vitalidade+', icon: '❤', max: 8, desc: 'HP máximo +10%', apply: (s) => { s.maxHp += 0.10; } },
  { id: 'g_haste', name: 'Pressa+', icon: '👟', max: 5, desc: 'Velocidade +2%', apply: (s) => { s.speed += 0.02; } },
  { id: 'g_arcane_effuse', name: 'Efusão Arcana+', icon: '✷', max: 6, desc: 'Tamanho +2%', apply: (s) => { s.size += 0.02; } },
  { id: 'g_concentration', name: 'Concentração+', icon: '◔', max: 6, desc: 'Duração +3%', apply: (s) => { s.dur += 0.03; } },
  { id: 'g_snipe', name: 'Precisão+', icon: '◎', max: 6, desc: 'Crítico +1%', apply: (s) => { s.crit += 0.01; } },
  { id: 'g_explorer', name: 'Explorador+', icon: '🧭', max: 5, desc: 'Coleta +10%', apply: (s) => { s.pickup += 0.10; } },
];

export const SPECIALS = [
  { id: 'lord_of_fire', name: 'Senhor do Fogo', icon: '🔥', desc: 'Dano de Bola de Fogo, Meteoro, Incineração e Zona de Lava +25%', apply: (s) => { s.elem.fire += 0.25; } },
  { id: 'stormy_clouds', name: 'Nuvens Tempestuosas', icon: '⛈', desc: 'Dano de Tempestade de Raios, Choque Elétrico, Zona Elétrica e Choque Relâmpago +25%', apply: (s) => { s.elem.storm += 0.25; } },
  { id: 'natures_wrath', name: 'Ira da Natureza', icon: '🍃', desc: 'Dano de Ciclone, Nevasca, Tsunami e Nova Congelante +25%', apply: (s) => { s.elem.nature += 0.25; } },
  { id: 'energy_engineering', name: 'Engenharia Energética', icon: '⚙', desc: 'Dano de Raio de Energia, Raio Arcano, Espírito e Satélite +25%', apply: (s) => { s.elem.energy += 0.25; } },
  { id: 'arcana', name: 'Arcana', icon: '📖', desc: 'ATK +15%', apply: (s) => { s.atk += 0.15; } },
  { id: 'guardian_angel', name: 'Anjo da Guarda', icon: '👼', desc: 'Revive mais 1 vez. HP máximo +30%', apply: (s) => { s.revive += 1; s.maxHp += 0.30; } },
  { id: 'silent_casting', name: 'Conjuração Silenciosa', icon: '🤫', desc: 'Recarga de todas as magias -7%', apply: (s) => { s.cdr += 0.07; } },
  { id: 'war_magic', name: 'Magia de Guerra', icon: '⚔', desc: 'ATK +8%, tamanho das magias +8%', apply: (s) => { s.atk += 0.08; s.size += 0.08; } },
  { id: 'timekeeper', name: 'Guardião do Tempo', icon: '⌛', desc: 'Runas duram +12%. Duração das magias +12%', apply: (s) => { s.rune += 0.12; s.dur += 0.12; } },
  { id: 'pioneer', name: 'Pioneiro', icon: '🚩', desc: 'Velocidade +3%, alcance de coleta +50%', apply: (s) => { s.speed += 0.03; s.pickup += 0.5; } },
  { id: 'smite', name: 'Golpe Divino', icon: '✝', desc: 'Multiplicador de crítico +30%', apply: (s) => { s.critMul += 0.30; } },
  { id: 'seal', name: 'Selo', icon: '🔒', desc: 'Velocidade de todos os inimigos -8%', apply: (s) => { s.enemySlow += 0.08; } },
  { id: 'curse', name: 'Maldição', icon: '💀', desc: 'HP máximo de todos os inimigos -6%', apply: (s) => { s.enemyHp -= 0.06; } },
  { id: 'chakra', name: 'Chakra', icon: '☯', desc: 'Dano de todas as magias +20%', apply: (s) => { s.magicDmg += 0.20; } },
  { id: 'mana_factory', name: 'Fábrica de Mana', icon: '🏭', desc: 'Orbes de mana surgem 20% mais vezes', apply: (s) => { s.manaFreq += 0.20; } },
  { id: 'doctor', name: 'Doutor', icon: '🎓', desc: 'Nível máximo +3', apply: (s) => { s.maxLevel += 3; } },
  { id: 'blood_magic', name: 'Magia de Sangue', icon: '🩸', desc: 'Amplifica ATK em 10%. Regeneração -0,25%/s', apply: (s) => { s.amp += 0.10; s.regen -= 0.0025; } },
  { id: 'adrenaline', name: 'Adrenalina', icon: '💢', desc: 'ATK, crítico e velocidade +5%', apply: (s) => { s.atk += 0.05; s.crit += 0.05; s.speed += 0.05; } },
  { id: 'juggernaut', name: 'Colosso', icon: '🗿', desc: 'ATK +10%, dano recebido -15%', apply: (s) => { s.atk += 0.10; s.dmgTaken -= 0.15; } },
  { id: 'priest', name: 'Sacerdote', icon: '🙏', desc: 'HP máximo dos inimigos -3%. Regeneração +0,3%/s', apply: (s) => { s.enemyHp -= 0.03; s.regen += 0.003; } },
  { id: 'eldritch', name: 'Sobrenatural', icon: '👁', desc: 'HP máximo de elites -10%', apply: (s) => { s.eliteHp -= 0.10; } },
  { id: 'noblesse', name: 'Nobreza', icon: '👑', desc: 'Cria 1 baú do tesouro por perto', apply: (s, G) => { G.spawnChest(G.player.x + 3, G.player.z + 2); } },
  { id: 'taoist', name: 'Taoísta', icon: '☯', desc: 'Nível máximo de todas as passivas comuns +1', apply: (s) => { s.passiveBonus += 1; } },
];
