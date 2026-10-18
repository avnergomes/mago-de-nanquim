// Combinações de magia: exigem duas magias com atributos específicos.
// Os nomes da tabela de combos do wiki divergem dos nomes de atributo; o mapeamento abaixo é explícito.
// guess: true = o nome do combo não tem par exato entre os atributos atuais (provável renomeação
// em atualização do jogo); foi associado ao atributo mais próximo.
// O wiki não descreve os efeitos: cada efeito-assinatura aqui é criação desta releitura.

export const COMBOS = [
  { id: 'wrath_of_the_sky', name: 'Ira dos Céus', a: ['thunderstorm', 'lightning_explosion'], b: ['meteor', 'meteor_shower'], desc: 'Meteoros eletrificados caem em sequência e cada impacto solta raios.' },
  { id: 'flying_sword', name: 'Espada Voadora', a: ['spirit', 'magic_blade'], b: ['electric_shock', 'chain_lightning'], desc: 'Lâminas voadoras orbitam e saltam entre inimigos com relâmpagos.' },
  { id: 'light_bolt_blast', name: 'Rajada de Luz', a: ['energy_bolt', 'charged_particles'], b: ['spirit', 'familiar'], desc: 'O familiar absorve raios de energia e dispara uma explosão de luz em anel.' },
  { id: 'tera_current', name: 'Tera Corrente', a: ['arcane_ray', 'em_burst'], b: ['electric_shock', 'superconductivity'], guess: true, desc: 'Raios arcanos conduzem choque: cada inimigo atingido é eletrocutado em cadeia.' },
  { id: 'war_climate', name: 'Clima de Guerra', a: ['meteor', 'meteor_shower'], b: ['blizzard', 'shooting_star'], desc: 'Uma chuva de meteoros de gelo congela onde cai.' },
  { id: 'demon_equation', name: 'Equação Demoníaca', a: ['fireball', 'big_bang'], b: ['energy_bolt', 'flare'], desc: 'Bolas de fogo gigantes explodem em clarões que se espalham em estrela.' },
  { id: 'frenzy', name: 'Frenesi', a: ['flash_shock', 'satans_nails'], b: ['magic_bolt', 'fire_at_will'], desc: 'Projéteis mágicos que acertam abrem pequenos clarões cruzados.' },
  { id: 'pandaemonium', name: 'Pandemônio', a: ['fireball', 'constellation'], b: ['satellite', 'will_o_wisp'], desc: 'Anéis de fogo-fátuo flamejantes explodem ao tocar inimigos.' },
  { id: 'reaction', name: 'Reação', a: ['energy_bolt', 'spark'], b: ['shield', 'destruction_field'], desc: 'Um campo de faíscas permanente pulsa ao seu redor.' },
  { id: 'vortex', name: 'Vórtice', a: ['cyclone', 'void'], b: ['satellite', 'antigravity'], desc: 'Um vórtice gigante puxa todos os inimigos para o centro e os tritura.' },
  { id: 'breath_of_fire', name: 'Sopro de Fogo', a: ['incineration', 'cerberus_flame'], b: ['arcane_ray', 'reflect'], desc: 'Raios de fogo varrem em leque à sua frente e às suas costas.' },
  { id: 'ether_fire', name: 'Fogo Etéreo', a: ['blizzard', 'blaze'], b: ['incineration', 'flame_strike'], desc: 'Chamas azuis caem do céu e queimam o chão por alguns segundos.' },
  { id: 'orbital_bombing', name: 'Bombardeio Orbital', a: ['thunderstorm', 'judgement'], b: ['blizzard', 'shooting_star'], desc: 'Um feixe orbital desce sobre o maior grupo de inimigos.' },
  { id: 'neutron_generation', name: 'Geração de Nêutrons', a: ['cyclone', 'electric_orb'], b: ['satellite', 'nuclear_fusion'], desc: 'O núcleo de fusão dispara orbes elétricos em todas as direções.' },
  { id: 'winter_storm', name: 'Tempestade de Inverno', a: ['blizzard', 'sub_zero'], b: ['fireball', 'poison_gas'], desc: 'Nuvens de névoa gelada congelam e envenenam por onde passam.' },
  { id: 'plasma_beam', name: 'Feixe de Plasma', a: ['arcane_ray', 'disintegration'], b: ['satellite', 'nuclear_fusion'], desc: 'O núcleo dispara um feixe de plasma contínuo que gira com ele.' },
  { id: 'master_of_storms', name: 'Mestre das Tempestades', a: ['cyclone', 'extreme_weather'], b: ['magic_bolt', 'fire_at_will'], guess: true, desc: 'Ciclones disparam projéteis mágicos enquanto giram.' },
  { id: 'runaway_electricity', name: 'Eletricidade Descontrolada', a: ['electric_shock', 'chain_lightning'], b: ['spirit', 'familiar'], desc: 'O familiar dispara relâmpagos em cadeia em vez de tiros.' },
  { id: 'lightning_attunement', name: 'Sintonia Elétrica', a: ['electric_zone', 'electricity_blast'], b: ['satellite', 'will_o_wisp'], guess: true, desc: 'Os satélites viram bobinas: raios ligam cada um a inimigos dentro da zona.' },
  { id: 'blooming_snowflakes', name: 'Flocos Florescentes', a: ['frost_nova', 'ice_age'], b: ['tsunami', 'pole'], desc: 'Cada nova gera flocos de gelo que se abrem em ondas congelantes.' },
  { id: 'inferno', name: 'Inferno', a: ['incineration', 'flame_strike'], b: ['lava_zone', 'melt'], desc: 'As chamas deixam rastros de lava por onde passam.' },
  { id: 'blast_furnace', name: 'Alto-Forno', a: ['lava_zone', 'magma_eruption'], b: ['meteor', 'volcanic_eruption'], desc: 'A poça de magma lança meteoros periodicamente.' },
  { id: 'quantum_explosion', name: 'Explosão Quântica', a: ['shield', 'destruction_field'], b: ['armageddon', 'apocalypse'], desc: 'Cada escudo quebrado reduz 10 s da recarga do Armagedom.' },
  { id: 'lightning_blast', name: 'Raio do Nada', a: ['thunderstorm', 'thunderclap'], b: ['electric_shock', 'chain_lightning'], guess: true, desc: 'Cada raio que cai se espalha em relâmpagos em cadeia.' },
  { id: 'deluge', name: 'Dilúvio', a: ['tsunami', 'siren_song'], b: ['cyclone', 'extreme_weather'], guess: true, desc: 'Trombas d’água giram pelo campo arrastando inimigos.' },
];
