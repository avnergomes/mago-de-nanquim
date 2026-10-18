// Tabela de magias do Magic Survival (fonte: magic-survival-rpg.fandom.com, v0.956).
// dmg = % do ATK do jogador. levels[i] = bônus do nível i+2; 'attr' = escolha de atributo.
// Modificadores de atributo: dmgMul, numAdd, numMul, cdMul, cdAdd, sizeMul, durMul, speedMul, intervalMul.
// Comportamentos especiais (fundir, encadear, etc.) ficam nos executores em src/game/spells/.

export const ELEM = {
  fire: { name: 'Fogo', color: '#e8643a' },
  storm: { name: 'Tempestade', color: '#e6c93a' },
  nature: { name: 'Natureza', color: '#4fb0c6' },
  energy: { name: 'Energia', color: '#b06ae8' },
  none: { name: 'Arcano', color: '#7a8cff' },
};

const A = 'attr';

export const SPELLS = [
  {
    id: 'magic_bolt', name: 'Projétil Mágico', en: 'Magic Bolt', elem: 'none', icon: '✦',
    desc: 'Dispara um projétil no inimigo mais próximo.',
    base: { dmg: 500, cd: 0.75, num: 1, size: 1 },
    levels: [{ num: 1 }, { dmg: 0.5 }, A, { num: 1 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'magic_arrow', tier: 4, name: 'Flecha Mágica', en: 'Magic Arrow', desc: 'Atravessa todos os inimigos. Dano +80%, tamanho e velocidade +180%.', mods: { dmgMul: 1.8, sizeMul: 2.8, speedMul: 2.8 } },
      { id: 'fireworks', tier: 4, name: 'Fogos de Artifício', en: 'Fireworks', desc: 'Divide em três e explode. Dano +50%, recarga +2 s.', mods: { dmgMul: 1.5, cdAdd: 2 } },
      { id: 'fission', tier: 4, name: 'Fissão', en: 'Fission', desc: 'Dispara contra 2 alvos adicionais.', mods: {} },
      { id: 'chain_casting', tier: 7, name: 'Conjuração em Cadeia', en: 'Chain Casting', desc: 'Número +1, recarga -20%.', mods: { numAdd: 1, cdMul: 0.8 } },
      { id: 'fire_at_will', tier: 7, name: 'Fogo à Vontade', en: 'Fire at Will', desc: 'Disparos em direções aleatórias. Número x5, dano +50%, recarga +3 s.', mods: { numMul: 5, dmgMul: 1.5, cdAdd: 3 } },
      { id: 'doppelganger', tier: 7, name: 'Doppelgänger', en: 'Doppelganger', desc: 'Invoca 3 miragens que disparam por você. Recarga +50%.', mods: { cdMul: 1.5 } },
    ],
  },
  {
    id: 'fireball', name: 'Bola de Fogo', en: 'Fireball', elem: 'fire', icon: '🔥',
    desc: 'Lança um projétil explosivo.',
    base: { dmg: 700, cd: 1.5, num: 1, size: 1 },
    levels: [{ num: 1 }, { dmg: 0.5 }, { size: 0.2 }, { num: 1 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'big_bang', name: 'Big Bang', en: 'Big Bang', desc: 'A primeira bola de cada conjuração tem dano e tamanho x1,5. Dano +80%.', mods: { dmgMul: 1.8 } },
      { id: 'poison_gas', name: 'Gás Venenoso', en: 'Poison Gas', desc: 'A explosão se expande e acerta 3 vezes. Dano -30%.', mods: { dmgMul: 0.7 } },
      { id: 'constellation', name: 'Constelação', en: 'Constellation', desc: 'Surge em pontos aleatórios, persiste 3,5 s seguindo você. Penetração +1.', mods: {} },
    ],
  },
  {
    id: 'thunderstorm', name: 'Tempestade de Raios', en: 'Thunderstorm', elem: 'storm', icon: '⚡',
    desc: 'Raios caem sobre inimigos próximos.',
    base: { dmg: 1500, cd: 2, num: 1, size: 1 },
    levels: [{ dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, A],
    attrs: [
      { id: 'thunderclap', name: 'Trovoada', en: 'Thunderclap', desc: 'Raios caem de 1 a 3 vezes seguidas. Recarga -25%.', mods: { cdMul: 0.75 } },
      { id: 'lightning_explosion', name: 'Explosão Relâmpago', en: 'Lightning Explosion', desc: 'Explosão maior, raios em pontos aleatórios em sequência. Dano +80%.', mods: { dmgMul: 1.8, sizeMul: 1.5 } },
      { id: 'judgement', name: 'Julgamento', en: 'Judgement', desc: 'Os raios se fundem em um. Dano x5, tamanho +20% por raio, recarga x2.', mods: { dmgMul: 5, cdMul: 2 } },
    ],
  },
  {
    id: 'meteor', name: 'Meteoro', en: 'Meteor', elem: 'fire', icon: '☄',
    desc: 'Um meteoro cai em um ponto aleatório.',
    base: { dmg: 1500, cd: 4.5, num: 1, size: 1 },
    levels: [{ num: 1 }, { dmg: 0.5 }, { size: 0.2 }, { num: 1 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'volcanic_eruption', name: 'Erupção Vulcânica', en: 'Volcanic Eruption', desc: 'Explode na hora e deixa uma cratera (25% do dano por s, 3 s).', mods: {} },
      { id: 'meteor_shower', name: 'Chuva de Meteoros', en: 'Meteor Shower', desc: 'Número x3, intervalo -30%. Dano e tamanho -25%.', mods: { numMul: 3, dmgMul: 0.75, sizeMul: 0.75 } },
      { id: 'asteroid', name: 'Asteroide', en: 'Asteroid', desc: 'Fundem-se em um. Tamanho +50% por meteoro, dano x3, recarga x2.', mods: { dmgMul: 3, cdMul: 2 } },
    ],
  },
  {
    id: 'cyclone', name: 'Ciclone', en: 'Cyclone', elem: 'nature', icon: '🌀',
    desc: 'Uma rajada de vento que cresce e causa dano.',
    base: { dmg: 500, cd: 3.5, num: 1, size: 1, dur: 2, interval: 0.3 },
    levels: [{ num: 1 }, { dmg: 0.5 }, { dur: 0.3 }, { num: 1 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'extreme_weather', name: 'Clima Extremo', en: 'Extreme Weather', desc: 'Número +2, recarga -10%.', mods: { numAdd: 2, cdMul: 0.9 } },
      { id: 'electric_orb', name: 'Orbe Elétrico', en: 'Electric Orb', desc: 'Encolhe disparando projéteis aleatórios. Dano x2, tamanho +30%.', mods: { dmgMul: 2, sizeMul: 1.3 } },
      { id: 'void', name: 'Vazio', en: 'Void', desc: 'Surgem em sequência em pontos aleatórios e ficam. Crescem 9x mais rápido. Duração -50%, recarga x2.', mods: { durMul: 0.5, cdMul: 2 } },
    ],
  },
  {
    id: 'electric_shock', name: 'Choque Elétrico', en: 'Electric Shock', elem: 'storm', icon: 'ϟ',
    desc: 'Libera eletricidade em direções aleatórias.',
    base: { dmg: 500, cd: 2, num: 2, size: 1 },
    levels: [{ dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, A],
    attrs: [
      { id: 'chain_lightning', name: 'Relâmpago em Cadeia', en: 'Chain Lightning', desc: 'Encadeia de 1 a 3 vezes. Dano +50%.', mods: { dmgMul: 1.5 } },
      { id: 'high_output', name: 'Alta Potência', en: 'High Output', desc: '50% de chance de dano x2,5. Recarga -15%.', mods: { cdMul: 0.85 } },
      { id: 'superconductivity', name: 'Supercondutividade', en: 'Superconductivity', desc: 'Disparos em sequência contra inimigos próximos. Dano x3, tamanho x2.', mods: { dmgMul: 3, sizeMul: 2 } },
    ],
  },
  {
    id: 'energy_bolt', name: 'Raio de Energia', en: 'Energy Bolt', elem: 'energy', icon: '✺',
    desc: 'Dispara projéteis perfurantes próximos.',
    base: { dmg: 750, cd: 3.3, num: 5, size: 1, dur: 1.1 },
    levels: [{ dmg: 0.2, num: 2 }, { dmg: 0.2, num: 2 }, { dmg: 0.2, num: 2 }, { dmg: 0.2, num: 2 }, { dmg: 0.2, num: 2 }, A],
    attrs: [
      { id: 'charged_particles', name: 'Partículas Carregadas', en: 'Charged Particles', desc: 'No fim, os raios voltam até você. Número e velocidade +35%.', mods: { numMul: 1.35, speedMul: 1.35 } },
      { id: 'spark', name: 'Faísca', en: 'Spark', desc: 'Causa dano a cada 0,3 s. Duração x2,5, tamanho +25%, dano -25%.', mods: { durMul: 2.5, sizeMul: 1.25, dmgMul: 0.75 } },
      { id: 'flare', name: 'Clarão', en: 'Flare', desc: 'Espalha em todas as direções e explode com dobro de força no fim. Dano +30%.', mods: { dmgMul: 1.3 } },
    ],
  },
  {
    id: 'incineration', name: 'Incineração', en: 'Incineration', elem: 'fire', icon: '♨',
    desc: 'Lança chamas à frente do personagem.',
    base: { dmg: 500, cd: 4, num: 15, size: 1 },
    levels: [{ num: 6 }, { dmg: 0.5 }, { size: 0.2 }, { num: 6 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'flame_strike', name: 'Golpe Flamejante', en: 'Flame Strike', desc: 'Poder cresce durante o jato (até dano x4, tamanho x1,5). Número +25%.', mods: { numMul: 1.25 } },
      { id: 'pyromaniac', name: 'Piromaníaco', en: 'Pyromaniac', desc: 'Gera 2 chamas extras de mesmo dano. Recarga -20%.', mods: { cdMul: 0.8 } },
      { id: 'cerberus_flame', name: 'Chama de Cérbero', en: 'Cerberus Flame', desc: 'Também lança para os lados. Dano +30%, alcance +20%, número -33%.', mods: { dmgMul: 1.3, numMul: 0.67, speedMul: 1.2 } },
    ],
  },
  {
    id: 'blizzard', name: 'Nevasca', en: 'Blizzard', elem: 'nature', icon: '❄',
    desc: 'Ergue uma nevasca que congela inimigos.',
    base: { dmg: 700, cd: 6, num: 20, size: 1 },
    levels: [{ num: 6 }, { dmg: 0.5 }, { cd: 0.15 }, { num: 6 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'sub_zero', name: 'Abaixo de Zero', en: 'Sub-Zero', desc: 'Inimigos perdem 3% de velocidade por s enquanto dura. Número +30%.', mods: { numMul: 1.3 } },
      { id: 'shooting_star', name: 'Estrela Cadente', en: 'Shooting Star', desc: 'Queda lenta. Dano x2, tamanho x1,35, número -50%.', mods: { dmgMul: 2, sizeMul: 1.35, numMul: 0.5, intervalMul: 2 } },
      { id: 'blaze', name: 'Labareda Gélida', en: 'Blaze', desc: 'Explode 2 vezes seguidas (-10% por explosão), sem congelar. Intervalo e raio -30%.', mods: { intervalMul: 0.7 } },
    ],
  },
  {
    id: 'tsunami', name: 'Tsunami', en: 'Tsunami', elem: 'nature', icon: '🌊',
    desc: 'Uma onda gigante atravessa o campo.',
    base: { dmg: 700, cd: 8.5, num: 8, size: 1 },
    levels: [{ num: 3 }, { dmg: 0.5 }, { cd: 0.15 }, { num: 3 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'pole', name: 'Polo', en: 'Pole', desc: 'Ondas em todas as direções que congelam.', mods: {} },
      { id: 'siren_song', name: 'Canto da Sereia', en: 'Siren Song', desc: 'Ondas surgem para onde você anda. Recarga e número -50%.', mods: { cdMul: 0.5, numMul: 0.5 } },
      { id: 'great_eruption', name: 'Onda de Lava', en: 'Great Eruption', desc: 'Raio maior. Dano x2, tamanho +10%, recarga +30%.', mods: { dmgMul: 2, sizeMul: 1.1, cdMul: 1.3 } },
    ],
  },
  {
    id: 'spirit', name: 'Espírito', en: 'Spirit', elem: 'energy', icon: '👻',
    desc: 'Invoca espíritos que atacam junto com você.',
    base: { dmg: 650, cd: 0.9, num: 1, size: 1 },
    levels: [{ dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, A],
    attrs: [
      { id: 'magic_missile', name: 'Míssil Mágico', en: 'Magic Missile', desc: 'Recarga acelera conforme o número de espíritos. Recarga -20%.', mods: { cdMul: 0.8 } },
      { id: 'magic_blade', name: 'Lâmina Arcana', en: 'Magic Blade', desc: 'Atira uma lâmina imediata no alvo. Dano x2,5.', mods: { dmgMul: 2.5 } },
      { id: 'familiar', name: 'Familiar', en: 'Familiar', desc: 'Fundem-se em um que dispara em todas as direções (+15 tiros por espírito).', mods: { cdMul: 5 } },
    ],
  },
  {
    id: 'satellite', name: 'Satélite', en: 'Satellite', elem: 'energy', icon: '◎',
    desc: 'Esferas que giram ao redor do personagem.',
    base: { dmg: 450, cd: 0.5, num: 1, size: 1 },
    levels: [{ dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, A],
    attrs: [
      { id: 'antigravity', name: 'Antigravidade', en: 'Anti-Gravity', desc: 'A rotação acelera até x3 e volta ao normal, em ciclo.', mods: {} },
      { id: 'will_o_wisp', name: 'Fogo-fátuo', en: "Will o' the Wisp", desc: 'Dois anéis. Número x2, rotação +33%, tamanho -33%.', mods: { numMul: 2, speedMul: 1.33, sizeMul: 0.67 } },
      { id: 'nuclear_fusion', name: 'Fusão Nuclear', en: 'Nuclear Fusion', desc: 'Fundem-se em um, dano a cada 0,3 s; dano e tamanho +1x por satélite. Rotação -50%.', mods: { speedMul: 0.5 } },
    ],
  },
  {
    id: 'arcane_ray', name: 'Raio Arcano', en: 'Arcane Ray', elem: 'energy', icon: '☄',
    desc: 'Dispara um raio que atravessa tudo.',
    base: { dmg: 900, cd: 3.5, num: 1, size: 1, dur: 0.8 },
    levels: [{ dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, { dmg: 0.2, num: 1 }, A],
    attrs: [
      { id: 'reflect', name: 'Reflexo', en: 'Reflect', desc: 'Cada raio gera outro no sentido oposto. Dano +50%, intervalo -50%.', mods: { dmgMul: 1.5 } },
      { id: 'disintegration', name: 'Raio Desintegrador', en: 'Disintegration Ray', desc: 'O raio gira rápido ao seu redor. Dano x2, recarga +50%.', mods: { dmgMul: 2, cdMul: 1.5 } },
      { id: 'em_burst', name: 'Pulso Eletromagnético', en: 'Electromagnetic Burst', desc: 'Raios em direções aleatórias, dano a cada 0,5 s. Duração x4.', mods: { durMul: 4 } },
    ],
  },
  {
    id: 'electric_zone', name: 'Zona Elétrica', en: 'Electric Zone', elem: 'storm', icon: '◉',
    desc: 'Causa dano contínuo ao redor do personagem.',
    base: { dmg: 125, cd: 0, num: 1, size: 1, interval: 0.25 },
    levels: [{ size: 0.15 }, { dmg: 0.5 }, { size: 0.15 }, { size: 0.2 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'electricity_blast', name: 'Descarga Elétrica', en: 'Electricity Blast', desc: 'Dano +80%, tamanho +30%.', mods: { dmgMul: 1.8, sizeMul: 1.3 } },
      { id: 'emp', name: 'PEM', en: 'EMP', desc: 'Atordoa a cada 4 acertos. Intervalo de dano -10%.', mods: { intervalMul: 0.9 } },
      { id: 'fire_aura', name: 'Aura de Fogo', en: 'Fire Aura', desc: 'Pulsa expandindo e some, em ciclo. Dano x5, intervalo x3.', mods: { dmgMul: 5, intervalMul: 3 } },
    ],
  },
  {
    id: 'frost_nova', name: 'Nova Congelante', en: 'Frost Nova', elem: 'nature', icon: '✱',
    desc: 'Congela inimigos próximos por um momento.',
    base: { dmg: 1200, cd: 5.5, num: 1, size: 1 },
    levels: [{ size: 0.15 }, { dmg: 0.5 }, { cd: 0.15 }, { size: 0.2 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'absolute_zero', name: 'Zero Absoluto', en: 'Absolute Zero', desc: 'Congela também quem está perto da explosão. Congelamento +25%.', mods: {} },
      { id: 'ice_age', name: 'Era do Gelo', en: 'Ice Age', desc: 'Explode 3 vezes, x1,5 a cada vez. Tamanho -20%, recarga x2.', mods: { sizeMul: 0.8, cdMul: 2 } },
      { id: 'earthquake', name: 'Terremoto', en: 'Earthquake', desc: 'Atordoa em vez de congelar. Dano x2, tamanho +25%.', mods: { dmgMul: 2, sizeMul: 1.25 } },
    ],
  },
  {
    id: 'lava_zone', name: 'Zona de Lava', en: 'Lava Zone', elem: 'fire', icon: '♒',
    desc: 'Cria uma poça de lava que causa dano contínuo.',
    base: { dmg: 1000, cd: 5, num: 1, size: 1, dur: 6, interval: 0.5 },
    levels: [{ num: 1 }, { dmg: 0.5 }, { size: 0.2 }, { num: 1 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'melt', name: 'Derreter', en: 'Melt', desc: 'Cada acerto faz o inimigo receber +5% de dano (até 30%). Recarga -15%.', mods: { cdMul: 0.85 } },
      { id: 'crater', name: 'Cratera', en: 'Crater', desc: 'Número x2, tamanho e duração -20%.', mods: { numMul: 2, sizeMul: 0.8, durMul: 0.8 } },
      { id: 'magma_eruption', name: 'Erupção de Magma', en: 'Magma Eruption', desc: 'Fundem-se em uma. Tamanho +30% por poça, dano x2, recarga x2.', mods: { dmgMul: 2, cdMul: 2 } },
    ],
  },
  {
    id: 'flash_shock', name: 'Choque Relâmpago', en: 'Flash Shock', elem: 'storm', icon: '⚡',
    desc: 'Um clarão cruza a tela na direção em que você anda.',
    base: { dmg: 1800, cd: 10, num: 1, size: 1 },
    levels: [{ size: 0.15 }, { dmg: 0.5 }, { size: 0.15 }, { cd: 0.2 }, { dmg: 0.5 }, A],
    attrs: [
      { id: 'wipeout', name: 'Aniquilação', en: 'Wipeout', desc: 'O feixe central causa dano x10. Tamanho +30%.', mods: { sizeMul: 1.3 } },
      { id: 'ragnarok', name: 'Ragnarök', en: 'Ragnarok', desc: 'Área maior. Número +5, recarga x2.', mods: { numAdd: 5, cdMul: 2 } },
      { id: 'satans_nails', name: 'Pregos de Satã', en: "Satan's Nails", desc: 'Clarões aleatórios com laterais; +1 por conjuração (zera a cada 4). Dano +33%, tamanho -50%.', mods: { dmgMul: 1.33, sizeMul: 0.5 } },
    ],
  },
  // ----- utilitárias (máx. nível 5) -----
  {
    id: 'shield', name: 'Escudo', en: 'Shield', elem: 'none', icon: '🛡', utility: true,
    desc: 'Cria um escudo que bloqueia um golpe. Começa com 2 cargas.',
    base: { dmg: 500, cd: 33, num: 2, size: 1 },
    levels: [{ cd: 0.1 }, { cd: 0.1 }, { cd: 0.1 }, A],
    attrs: [
      { id: 'barrier', name: 'Barreira', en: 'Barrier', desc: 'Máximo de escudos +2.', mods: { numAdd: 2 } },
      { id: 'reconstruct', name: 'Reconstruir', en: 'Reconstruct', desc: 'Recarrega 2 por vez. Máximo +1, recarga +20%.', mods: { numAdd: 1, cdMul: 1.2 } },
      { id: 'destruction_field', name: 'Campo de Destruição', en: 'Destruction Field', desc: 'Ao quebrar, explode 4 vezes seguindo você.', mods: {} },
    ],
  },
  {
    id: 'cloaking', name: 'Camuflagem', en: 'Cloaking', elem: 'none', icon: '👁', utility: true,
    desc: 'Atravessa tudo e fica mais rápido por um momento (ativa ao levar dano).',
    base: { dmg: 50000, cd: 45, num: 1, size: 1, dur: 2 },
    levels: [{ dur: 0.3 }, { dur: 0.3 }, { dur: 0.3 }, A],
    attrs: [
      { id: 'mirage', name: 'Miragem', en: 'Mirage', desc: 'Duração +80%.', mods: { durMul: 1.8 } },
      { id: 'space_warp', name: 'Dobra Espacial', en: 'Space Warp', desc: 'Ao fim, uma explosão poderosa ao seu redor.', mods: {} },
      { id: 'soul_harvest', name: 'Colheita de Almas', en: 'Soul Harvest', desc: 'Cura 0,1% por abate camuflado. Mana +33%.', mods: {} },
    ],
  },
  {
    id: 'magic_circle', name: 'Círculo Mágico', en: 'Magic Circle', elem: 'none', icon: '⛤', utility: true,
    desc: 'Amplifica o ATK em 25% por um tempo.',
    base: { dmg: 25, cd: 20, num: 1, size: 1, dur: 5 },
    levels: [{ dmg: 0.2, dur: 0.2 }, { dmg: 0.2, dur: 0.2 }, { dmg: 0.2, dur: 0.2 }, A],
    attrs: [
      { id: 'unleash_mana', name: 'Mana Liberada', en: 'Unleash Mana', desc: 'Recargas -15% enquanto ativo. Recarga do círculo -15%.', mods: { cdMul: 0.85 } },
      { id: 'material_synthesis', name: 'Síntese Material', en: 'Material Synthesis', desc: 'Gera 5 itens ao conjurar. Mana +15%.', mods: {} },
      { id: 'great_circle', name: 'Grande Círculo', en: 'Great Magic Circle', desc: 'Efeito x2. Duração e recarga +33%.', mods: { dmgMul: 2, durMul: 1.33, cdMul: 1.33 } },
    ],
  },
  {
    id: 'armageddon', name: 'Armagedom', en: 'Armageddon', elem: 'none', icon: '☢', utility: true,
    desc: 'Elimina todos os inimigos da tela.',
    base: { dmg: 0, cd: 100, num: 1, size: 1 },
    levels: [{ cd: 0.1 }, { cd: 0.1 }, { cd: 0.1 }, A],
    attrs: [
      { id: 'apocalypse', name: 'Apocalipse', en: 'Apocalypse', desc: 'Depois, todos os inimigos perdem 40% de HP, que volta em 20 s.', mods: {} },
      { id: 'rapture', name: 'Arrebatamento', en: 'Rapture', desc: 'Cura todo o HP a cada 4ª conjuração. Regeneração +0,1%/s.', mods: {} },
      { id: 'doom_prophet', name: 'Profeta do Fim', en: 'Doom Prophet', desc: 'Cada orbe de mana reduz 1 s da recarga. Recarga -10%.', mods: { cdMul: 0.9 } },
    ],
  },
];

export const SPELL_BY_ID = Object.fromEntries(SPELLS.map(s => [s.id, s]));
export const maxLevel = (def) => def.levels.length + 1;
