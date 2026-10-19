// Passivas comuns, de crescimento (após o nível 100), relíquias (passivas especiais dos baús)
// e artefatos (mais raros e fortes: garantidos na Caixa Preta, 15% por carta no baú comum).
// apply(st, n) altera o objeto de atributos do jogador; n = nível atual (1..max).

export const PASSIVES = [
  { id: 'intelligence', name: 'Inteligência', max: 5, desc: 'ATK +10%', apply: (s) => { s.atk += 0.10; } },
  { id: 'fast_casting', name: 'Conjuração Rápida', max: 3, desc: 'Recarga de todas as magias -5%', apply: (s) => { s.cdr += 0.05; } },
  { id: 'vitality', name: 'Vitalidade', max: 5, desc: 'HP máximo +20%, cura do Orbe de Vida +10%', apply: (s) => { s.maxHp += 0.20; s.lifeOrb += 0.10; } },
  { id: 'haste', name: 'Pressa', max: 2, desc: 'Velocidade de movimento +10%', apply: (s) => { s.speed += 0.10; } },
  { id: 'arcane_effuse', name: 'Efusão Arcana', max: 3, desc: 'Tamanho de todas as magias +5%', apply: (s) => { s.size += 0.05; } },
  { id: 'concentration', name: 'Concentração', max: 3, desc: 'Duração de todas as magias +10%', apply: (s) => { s.dur += 0.10; } },
  { id: 'snipe', name: 'Precisão', max: 3, desc: 'Chance de crítico +5%', apply: (s) => { s.crit += 0.05; } },
  { id: 'explorer', name: 'Explorador', max: 3, desc: 'Alcance de coleta +33%', apply: (s) => { s.pickup += 0.33; } },
];

export const GROWTH = [
  { id: 'g_intelligence', name: 'Inteligência+', max: 8, desc: 'ATK +3%', apply: (s) => { s.atk += 0.03; } },
  { id: 'g_fast_casting', name: 'Conjuração Rápida+', max: 6, desc: 'Recarga -1%', apply: (s) => { s.cdr += 0.01; } },
  { id: 'g_vitality', name: 'Vitalidade+', max: 8, desc: 'HP máximo +10%', apply: (s) => { s.maxHp += 0.10; } },
  { id: 'g_haste', name: 'Pressa+', max: 5, desc: 'Velocidade +2%', apply: (s) => { s.speed += 0.02; } },
  { id: 'g_arcane_effuse', name: 'Efusão Arcana+', max: 6, desc: 'Tamanho +2%', apply: (s) => { s.size += 0.02; } },
  { id: 'g_concentration', name: 'Concentração+', max: 6, desc: 'Duração +3%', apply: (s) => { s.dur += 0.03; } },
  { id: 'g_snipe', name: 'Precisão+', max: 6, desc: 'Crítico +1%', apply: (s) => { s.crit += 0.01; } },
  { id: 'g_explorer', name: 'Explorador+', max: 5, desc: 'Coleta +10%', apply: (s) => { s.pickup += 0.10; } },
];

export const SPECIALS = [
  { id: 'lord_of_fire', name: 'Senhor do Fogo', desc: 'Dano de Bola de Fogo, Meteoro, Incineração e Zona de Lava +25%', apply: (s) => { s.elem.fire += 0.25; } },
  { id: 'stormy_clouds', name: 'Nuvens Tempestuosas', desc: 'Dano de Tempestade de Raios, Choque Elétrico, Zona Elétrica e Choque Relâmpago +25%', apply: (s) => { s.elem.storm += 0.25; } },
  { id: 'natures_wrath', name: 'Ira da Natureza', desc: 'Dano de Ciclone, Nevasca, Tsunami e Nova Congelante +25%', apply: (s) => { s.elem.nature += 0.25; } },
  { id: 'energy_engineering', name: 'Engenharia Energética', desc: 'Dano de Raio de Energia, Raio Arcano, Espírito e Satélite +25%', apply: (s) => { s.elem.energy += 0.25; } },
  { id: 'arcana', name: 'Arcana', desc: 'ATK +15%', apply: (s) => { s.atk += 0.15; } },
  { id: 'guardian_angel', name: 'Anjo da Guarda', desc: 'Revive mais 1 vez. HP máximo +30%', apply: (s) => { s.revive += 1; s.maxHp += 0.30; } },
  { id: 'silent_casting', name: 'Conjuração Silenciosa', desc: 'Recarga de todas as magias -7%', apply: (s) => { s.cdr += 0.07; } },
  { id: 'war_magic', name: 'Magia de Guerra', desc: 'ATK +8%, tamanho das magias +8%', apply: (s) => { s.atk += 0.08; s.size += 0.08; } },
  { id: 'timekeeper', name: 'Guardião do Tempo', desc: 'Runas duram +12%. Duração das magias +12%', apply: (s) => { s.rune += 0.12; s.dur += 0.12; } },
  { id: 'pioneer', name: 'Pioneiro', desc: 'Velocidade +3%, alcance de coleta +50%', apply: (s) => { s.speed += 0.03; s.pickup += 0.5; } },
  { id: 'smite', name: 'Golpe Divino', desc: 'Multiplicador de crítico +30%', apply: (s) => { s.critMul += 0.30; } },
  { id: 'seal', name: 'Selo', desc: 'Velocidade de todos os inimigos -8%', apply: (s) => { s.enemySlow += 0.08; } },
  { id: 'curse', name: 'Maldição', desc: 'HP máximo de todos os inimigos -6%', apply: (s) => { s.enemyHp -= 0.06; } },
  { id: 'chakra', name: 'Chakra', desc: 'Dano de todas as magias +20%', apply: (s) => { s.magicDmg += 0.20; } },
  { id: 'mana_factory', name: 'Fábrica de Mana', desc: 'Orbes de mana surgem 20% mais vezes', apply: (s) => { s.manaFreq += 0.20; } },
  { id: 'doctor', name: 'Doutor', desc: 'Nível máximo +3', apply: (s) => { s.maxLevel += 3; } },
  { id: 'blood_magic', name: 'Magia de Sangue', desc: 'Amplifica ATK em 10%. Regeneração -0,25%/s', apply: (s) => { s.amp += 0.10; s.regen -= 0.0025; } },
  { id: 'adrenaline', name: 'Adrenalina', desc: 'ATK, crítico e velocidade +5%', apply: (s) => { s.atk += 0.05; s.crit += 0.05; s.speed += 0.05; } },
  { id: 'juggernaut', name: 'Colosso', desc: 'ATK +10%, dano recebido -15%', apply: (s) => { s.atk += 0.10; s.dmgTaken -= 0.15; } },
  { id: 'priest', name: 'Sacerdote', desc: 'HP máximo dos inimigos -3%. Regeneração +0,3%/s', apply: (s) => { s.enemyHp -= 0.03; s.regen += 0.003; } },
  { id: 'eldritch', name: 'Sobrenatural', desc: 'HP máximo de elites -10%', apply: (s) => { s.eliteHp -= 0.10; } },
  { id: 'noblesse', name: 'Nobreza', desc: 'Cria 1 baú do tesouro por perto', apply: (s, G) => { G.spawnChest(G.player.x + 3, G.player.z + 2); } },
  { id: 'taoist', name: 'Taoísta', desc: 'Nível máximo de todas as passivas comuns +1', apply: (s) => { s.passiveBonus += 1; } },
  // relíquias criadas para esta releitura
  { id: 'raven_feather', name: 'Pena de Corvo', desc: '6% de chance de esquivar de um golpe', apply: (s) => { s.dodge += 0.06; } },
  { id: 'wolf_fang', name: 'Presa de Lobo', desc: 'Crítico +4%, multiplicador de crítico +15%', apply: (s) => { s.crit += 0.04; s.critMul += 0.15; } },
  { id: 'iron_ring', name: 'Anel de Ferro', desc: 'Dano recebido -8%', apply: (s) => { s.dmgTaken -= 0.08; } },
  { id: 'mana_vial', name: 'Ampola de Mana', desc: 'Mana obtida +15%', apply: (s) => { s.mana += 0.15; } },
  { id: 'eternal_candle', name: 'Vela Eterna', desc: 'Duração das magias +10%. Regeneração +0,1%/s', apply: (s) => { s.dur += 0.10; s.regen += 0.001; } },
  { id: 'old_coin', name: 'Moeda Antiga', desc: 'Alcance de coleta +30%, orbes de mana surgem 10% mais vezes', apply: (s) => { s.pickup += 0.30; s.manaFreq += 0.10; } },
  { id: 'hunter_badge', name: 'Insígnia do Caçador', desc: 'Dano contra elites e chefes +20%', apply: (s) => { s.eliteDmg += 0.20; } },
  { id: 'rosary', name: 'Rosário', desc: 'Cada abate cura 0,1% do HP máximo', apply: (s) => { s.killHeal += 0.001; } },
  { id: 'traveler_boots', name: 'Botas de Viajante', desc: 'Velocidade de movimento +6%', apply: (s) => { s.speed += 0.06; } },
  { id: 'quartz_lens', name: 'Lente de Quartzo', desc: 'Tamanho das magias +6%, crítico +3%', apply: (s) => { s.size += 0.06; s.crit += 0.03; } },
  { id: 'sage_bundle', name: 'Ramo de Sálvia', desc: 'Cura do Orbe de Vida +40%, HP máximo +10%', apply: (s) => { s.lifeOrb += 0.40; s.maxHp += 0.10; } },
  { id: 'frost_shard', name: 'Lasca de Gelo Eterno', desc: 'Inimigos 5% mais lentos. Dano de Natureza +10%', apply: (s) => { s.enemySlow += 0.05; s.elem.nature += 0.10; } },
  { id: 'arcane_fragment', name: 'Fragmento Arcano', desc: 'Dano das magias arcanas (Projétil Mágico e utilitárias) +30%', apply: (s) => { s.elem.none += 0.30; } },
];

// Artefatos: tesouros raros e fortes, quase sempre com um preço
export const ARTIFACTS = [
  { id: 'phoenix_heart', name: 'Coração de Fênix', desc: 'Revive mais 1 vez. Regeneração +0,4%/s', apply: (s) => { s.revive += 1; s.regen += 0.004; } },
  { id: 'forbidden_grimoire', name: 'Grimório Proibido', desc: 'Dano de todas as magias +40%. HP máximo -20%', apply: (s) => { s.magicDmg += 0.40; s.maxHp -= 0.20; } },
  { id: 'broken_hourglass', name: 'Ampulheta Partida', desc: 'Recarga de todas as magias -15%. Duração -10%', apply: (s) => { s.cdr += 0.15; s.dur -= 0.10; } },
  { id: 'abyss_eye', name: 'Olho do Abismo', desc: 'Crítico +15%, multiplicador de crítico +50%', apply: (s) => { s.crit += 0.15; s.critMul += 0.50; } },
  { id: 'sun_crown', name: 'Coroa do Sol', desc: 'Dano de Fogo e Tempestade +30%', apply: (s) => { s.elem.fire += 0.30; s.elem.storm += 0.30; } },
  { id: 'winter_chalice', name: 'Cálice do Inverno', desc: 'Dano de Natureza +35%. Inimigos 10% mais lentos', apply: (s) => { s.elem.nature += 0.35; s.enemySlow += 0.10; } },
  { id: 'reaper_scythe', name: 'Foice do Ceifador', desc: 'Inimigos comuns e elites abaixo de 8% do HP morrem na hora', apply: (s) => { s.execute = Math.max(s.execute, 0.08); } },
  { id: 'vampire_medallion', name: 'Medalhão Vampírico', desc: 'Cada abate cura 0,4% do HP máximo', apply: (s) => { s.killHeal += 0.004; } },
  { id: 'winged_boots', name: 'Botas Aladas', desc: 'Velocidade +20%, 10% de chance de esquivar', apply: (s) => { s.speed += 0.20; s.dodge += 0.10; } },
  { id: 'titan_bow', name: 'Arco Mata-Titãs', desc: 'Dano contra elites e chefes +50%', apply: (s) => { s.eliteDmg += 0.50; } },
  { id: 'philosopher_stone', name: 'Pedra Filosofal', desc: 'Mana obtida +40%, orbes de mana surgem 30% mais vezes', apply: (s) => { s.mana += 0.40; s.manaFreq += 0.30; } },
  { id: 'arcane_prism', name: 'Prisma Arcano', desc: 'Tamanho das magias +20%. Amplifica ATK em 15%', apply: (s) => { s.size += 0.20; s.amp += 0.15; } },
  { id: 'archmage_scepter', name: 'Cetro do Arquimago', desc: 'Nível máximo das passivas comuns +1. Nível máximo +5', apply: (s) => { s.passiveBonus += 1; s.maxLevel += 5; } },
  { id: 'dragon_scale', name: 'Escama de Dragão', desc: 'HP máximo +40%, dano recebido -25%', apply: (s) => { s.maxHp += 0.40; s.dmgTaken -= 0.25; } },
  { id: 'titan_gauntlet', name: 'Manopla do Titã', desc: 'ATK +30%, recarga -5%', apply: (s) => { s.atk += 0.30; s.cdr += 0.05; } },
  { id: 'astrolabe', name: 'Astrolábio', desc: 'Runas duram +50%. Duração das magias +20%', apply: (s) => { s.rune += 0.50; s.dur += 0.20; } },
];
