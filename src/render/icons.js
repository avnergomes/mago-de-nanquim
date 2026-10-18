import { ELEM, SPELL_BY_ID } from '../data/spells.js';

// Símbolos das magias desenhados a nanquim: contorno sépia, aguada na cor do elemento, brilho de papel
// e um filtro de tremido que deixa todo traço com cara de feito à mão. Um SVG por magia (viewBox 48x48).
const K = '#2a211b';
const L = 'fill="#fffbe9" fill-opacity=".75" stroke="none"'; // brilho de papel por cima da aguada
const S = `stroke="${K}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
const T = `stroke="${K}" stroke-width="1.3" stroke-linecap="round" fill="none"`; // traço fino de detalhe

// cada desenho recebe a cor do elemento (c) e devolve o miolo do SVG
const DRAW = {
  // estrela de quatro pontas com rastro
  magic_bolt: (c) => `
    <path ${T} d="M6 40 L16 30 M9 44 L19 34 M4 34 L13 26"/>
    <path fill="${c}" ${S} d="M30 6 C31 15 33 17 42 18 C33 19 31 21 30 30 C29 21 27 19 18 18 C27 17 29 15 30 6Z"/>
    <path ${L} d="M30 11 C30.5 15 31 16 34 17 C31 17.5 30.5 18 30 21Z"/>`,
  // bola de fogo: gota deitada com núcleo
  fireball: (c) => `
    <path fill="${c}" ${S} d="M8 40 C10 30 14 26 20 22 C17 18 19 12 24 10 C23 14 26 15 28 13 C29 9 33 7 36 8 C34 11 36 13 38 14 C43 17 44 25 40 31 C35 39 24 42 16 41 C13 41 10 41 8 40Z"/>
    <path fill="#ffd36b" stroke="${K}" stroke-width="1.6" d="M22 32 C22 26 26 23 31 22 C29 25 33 26 34 29 C35 34 30 37 26 36 C24 35 22 34 22 32Z"/>
    <path ${L} d="M27 31 C27 28 29 27 31 27 C30 29 31 31 29 32Z"/>`,
  // nuvem carregada com raio
  thunderstorm: (c) => `
    <path fill="#c9c3b0" ${S} d="M10 24 C6 24 5 17 10 16 C10 10 17 8 20 12 C22 6 32 6 33 13 C38 11 43 15 40 21 C42 25 38 27 35 26 L13 26 C12 26 11 25 10 24Z"/>
    <path ${T} d="M14 20 C17 19 19 20 21 21 M26 17 C29 16 31 17 33 19"/>
    <path fill="${c}" ${S} d="M24 26 L18 36 L23 36 L19 45 L31 32 L25 32 L29 26Z"/>`,
  // meteoro: rocha com cauda de fogo
  meteor: (c) => `
    <path fill="${c}" ${S} d="M6 6 C14 10 22 14 28 20 L22 26 C16 20 11 14 6 6Z"/>
    <path ${T} d="M10 8 L20 18 M8 12 L17 21"/>
    <path fill="#8a7a66" ${S} d="M22 24 C24 19 31 18 35 21 C40 24 41 31 37 35 C33 40 25 39 22 35 C19 31 20 27 22 24Z"/>
    <path ${T} d="M27 28 a2 2 0 1 0 0.1 0 M33 33 a1.5 1.5 0 1 0 0.1 0 M31 25 L33 26"/>
    <path ${L} d="M25 25 C27 22 31 22 33 23 C30 24 28 25 26 27Z"/>`,
  // ciclone: funil de espirais
  cyclone: (c) => `
    <path fill="${c}" fill-opacity=".55" stroke="none" d="M7 9 C16 5 34 5 41 9 C38 16 30 22 26 30 C24 35 25 40 24 44 C22 38 19 32 16 26 C12 19 8 14 7 9Z"/>
    <path fill="none" ${S} d="M6 9 C14 4 34 5 42 9 C36 12 14 13 8 10"/>
    <path fill="none" ${S} d="M11 17 C18 14 32 14 37 17 C32 20 18 21 13 18"/>
    <path fill="none" ${S} d="M16 25 C21 23 29 23 32 25 C28 28 21 28 18 26"/>
    <path fill="none" ${S} d="M21 32 C24 31 27 31 28 33 C26 35 23 35 22 34 M24 38 C25 40 24 42 24 44"/>`,
  // choque elétrico: arco entre dois pontos
  electric_shock: (c) => `
    <circle cx="8" cy="38" r="4" fill="${c}" ${S}/>
    <circle cx="40" cy="10" r="4" fill="${c}" ${S}/>
    <path fill="none" stroke="${K}" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round" d="M11 35 L18 31 L15 26 L24 24 L21 18 L30 16 L28 12 L37 12"/>
    <path fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" d="M11 35 L18 31 L15 26 L24 24 L21 18 L30 16 L28 12 L37 12"/>
    <path ${T} d="M5 30 L3 27 M12 44 L14 46 M44 16 L46 18 M35 4 L33 2"/>`,
  // raio de energia: losango alongado com anéis de impulso
  energy_bolt: (c) => `
    <ellipse cx="13" cy="35" rx="4" ry="8" transform="rotate(45 13 35)" fill="none" ${S}/>
    <ellipse cx="19" cy="29" rx="5" ry="10" transform="rotate(45 19 29)" fill="none" stroke="${K}" stroke-width="1.6"/>
    <path fill="${c}" ${S} d="M43 5 C38 14 33 21 24 30 C22 28 20 26 18 24 C27 15 34 10 43 5Z"/>
    <path ${L} d="M39 9 C35 14 31 18 26 23 C27 20 32 14 39 9Z"/>`,
  // incineração: leque de chamas saindo de um ponto
  incineration: (c) => `
    <path fill="${c}" ${S} d="M6 40 C12 30 16 22 18 12 C20 17 22 18 24 16 C26 11 30 8 34 6 C33 11 35 13 38 12 C40 16 41 20 40 24 C43 23 44 26 44 28 C34 33 18 38 6 40Z"/>
    <path fill="#ffd36b" stroke="${K}" stroke-width="1.6" d="M10 38 C16 33 20 28 23 21 C25 25 28 25 30 22 C31 26 33 27 35 26 C30 31 19 36 10 38Z"/>
    <circle cx="6" cy="40" r="2.5" fill="${K}"/>`,
  // nevasca: floco de neve com ramos
  blizzard: (c) => `
    <circle cx="24" cy="24" r="18" fill="${c}" fill-opacity=".35" stroke="none"/>
    <g fill="none" ${S}>
      <path d="M24 5 V43 M7.5 14.5 L40.5 33.5 M7.5 33.5 L40.5 14.5"/>
      <path d="M19 9 L24 13 L29 9 M19 39 L24 35 L29 39 M9 21 L14 19 L13 13 M39 27 L34 29 L35 35 M9 27 L14 29 L13 35 M39 21 L34 19 L35 13"/>
    </g>
    <circle cx="24" cy="24" r="3.2" fill="#fffbe9" ${S}/>`,
  // tsunami: onda que se enrola
  tsunami: (c) => `
    <path fill="${c}" ${S} d="M4 42 C8 30 14 18 26 12 C34 8 43 11 44 19 C44 25 37 27 34 23 C32 20 35 17 37 18 C33 15 26 17 22 24 C18 31 20 38 24 42Z"/>
    <path ${L} d="M24 15 C30 11 38 11 41 16 C37 13 30 13 25 17Z"/>
    <path ${T} d="M10 38 C13 30 17 24 22 20 M15 40 C17 34 19 30 22 27"/>
    <path fill="none" ${S} d="M2 44 C10 42 16 45 24 43 C32 41 38 45 46 43"/>`,
  // espírito: chama-fantasma com cauda
  spirit: (c) => `
    <path fill="${c}" ${S} d="M24 6 C33 6 38 13 37 22 C36 31 33 36 30 40 C29 37 27 36 25 39 C24 42 21 44 18 44 C20 40 18 38 16 37 C11 32 10 25 12 18 C14 11 18 6 24 6Z"/>
    <path ${L} d="M18 12 C21 9 26 9 28 11 C24 11 21 13 19 16Z"/>
    <ellipse cx="20" cy="22" rx="2.2" ry="3.2" fill="${K}"/>
    <ellipse cx="29" cy="22" rx="2.2" ry="3.2" fill="${K}"/>
    <path ${T} d="M21 29 C23 31 26 31 28 29"/>`,
  // satélite: orbe com órbita e lua
  satellite: (c) => `
    <ellipse cx="24" cy="25" rx="20" ry="8" transform="rotate(-20 24 25)" fill="none" stroke="${K}" stroke-width="1.6" stroke-dasharray="4 3"/>
    <circle cx="24" cy="25" r="9" fill="${c}" ${S}/>
    <path ${L} d="M19 22 C20 19 23 18 25 18 C23 20 21 21 20 24Z"/>
    <circle cx="41" cy="16" r="4.5" fill="#f4e7b2" ${S}/>
    <path ${T} d="M33 13 L36 14 M34 18 L36 17"/>`,
  // raio arcano: feixe saindo de um círculo
  arcane_ray: (c) => `
    <path fill="${c}" ${S} d="M16 20 L45 9 L45 21 L16 30Z"/>
    <path ${L} d="M20 22 L43 13 L43 15 L20 25Z"/>
    <circle cx="13" cy="25" r="9" fill="#fffbe9" ${S}/>
    <circle cx="13" cy="25" r="4" fill="${c}" stroke="${K}" stroke-width="1.6"/>
    <path ${T} d="M3 13 L6 16 M2 25 H5 M3 37 L6 34"/>`,
  // zona elétrica: círculo no chão com faíscas
  electric_zone: (c) => `
    <ellipse cx="24" cy="30" rx="20" ry="11" fill="${c}" fill-opacity=".45" ${S}/>
    <ellipse cx="24" cy="30" rx="13" ry="6.5" fill="none" stroke="${K}" stroke-width="1.4" stroke-dasharray="3 3"/>
    <path fill="${c}" ${S} d="M18 8 L13 20 L18 20 L15 30 L25 15 L20 15 L23 8Z"/>
    <path fill="${c}" stroke="${K}" stroke-width="1.8" stroke-linejoin="round" d="M34 14 L31 22 L34 22 L32 29 L39 19 L36 19 L38 14Z"/>`,
  // nova congelante: estilhaços de gelo em estouro
  frost_nova: (c) => `
    <circle cx="24" cy="24" r="20" fill="none" stroke="${K}" stroke-width="1.4" stroke-dasharray="2 4"/>
    <g fill="${c}" ${S}>
      <path d="M24 3 L27 17 L24 20 L21 17Z"/><path d="M24 45 L21 31 L24 28 L27 31Z"/>
      <path d="M3 24 L17 21 L20 24 L17 27Z"/><path d="M45 24 L31 27 L28 24 L31 21Z"/>
      <path d="M9 9 L19 17 L18 19 L16 19Z"/><path d="M39 39 L29 31 L30 29 L32 29Z"/>
      <path d="M39 9 L31 19 L29 18 L29 16Z"/><path d="M9 39 L17 29 L19 30 L19 32Z"/>
    </g>
    <circle cx="24" cy="24" r="3.5" fill="#fffbe9" ${S}/>`,
  // zona de lava: poça borbulhando
  lava_zone: (c) => `
    <path fill="${c}" ${S} d="M5 32 C4 25 12 22 18 23 C22 20 30 19 35 22 C42 22 45 28 43 33 C41 39 30 41 24 40 C16 41 6 39 5 32Z"/>
    <path fill="#ffd36b" stroke="none" d="M12 32 C12 29 17 28 21 29 C24 27 30 27 33 30 C35 33 30 35 24 35 C18 36 12 35 12 32Z"/>
    <circle cx="19" cy="17" r="3.2" fill="${c}" ${S}/>
    <circle cx="30" cy="12" r="2.2" fill="${c}" ${S}/>
    <circle cx="26" cy="5" r="1.4" fill="${K}"/>
    <path ${T} d="M15 31 a2 1.3 0 1 0 0.1 0 M29 32 a2.5 1.5 0 1 0 0.1 0"/>`,
  // choque relâmpago: raio vertical que rebenta no chão
  flash_shock: (c) => `
    <path fill="${c}" ${S} d="M27 2 L16 22 L23 22 L15 40 L33 17 L26 17 L33 2Z"/>
    <path ${L} d="M29 5 L21 19 L24 19 Z"/>
    <path fill="none" ${S} d="M6 42 C12 40 18 41 24 42 C30 41 36 40 42 42"/>
    <path ${T} d="M10 37 L6 33 M38 37 L42 33 M16 35 L14 31 M32 35 L34 31"/>`,
  // escudo com runa
  shield: (c) => `
    <path fill="${c}" ${S} d="M24 4 C30 8 36 9 41 9 C41 24 37 36 24 44 C11 36 7 24 7 9 C12 9 18 8 24 4Z"/>
    <path fill="none" stroke="${K}" stroke-width="1.4" d="M24 9 C28 12 32 13 36 13 C36 24 33 33 24 39 C15 33 12 24 12 13 C16 13 20 12 24 9Z"/>
    <path fill="none" ${S} d="M24 15 V33 M18 21 L24 27 L30 21"/>
    <path ${L} d="M13 13 C17 13 20 12 23 10 C21 13 17 15 13 16Z"/>`,
  // camuflagem: capuz com olhos na sombra
  cloaking: (c) => `
    <path fill="${c}" fill-opacity=".5" ${S} d="M24 4 C34 6 40 16 40 28 C40 36 41 41 43 44 L5 44 C7 41 8 36 8 28 C8 16 14 6 24 4Z"/>
    <path fill="${K}" d="M24 14 C31 15 34 21 33 29 C32 35 28 38 24 38 C20 38 16 35 15 29 C14 21 17 15 24 14Z"/>
    <path fill="#fffbe9" d="M18 26 C19 24 22 24 23 26 C22 27 19 27 18 26Z M25 26 C26 24 29 24 30 26 C29 27 26 27 25 26Z"/>
    <path ${T} d="M11 40 C12 34 12 30 12 26 M37 40 C36 34 36 30 36 26"/>`,
  // círculo mágico: pentagrama dentro do círculo
  magic_circle: (c) => `
    <circle cx="24" cy="24" r="20" fill="${c}" fill-opacity=".35" ${S}/>
    <circle cx="24" cy="24" r="16" fill="none" stroke="${K}" stroke-width="1.3"/>
    <path fill="none" ${S} d="M24 8 L33.4 37 L8.8 19 L39.2 19 L14.6 37Z"/>
    <path ${T} d="M24 2 V5 M24 43 V46 M2 24 H5 M43 24 H46"/>`,
  // armagedom: estrela caindo sobre o mundo
  armageddon: (c) => `
    <path fill="${c}" fill-opacity=".6" stroke="none" d="M4 44 C8 34 16 30 24 30 C32 30 40 34 44 44Z"/>
    <path fill="none" ${S} d="M3 44 C8 33 16 29 24 29 C32 29 40 33 45 44"/>
    <path ${T} d="M30 4 L22 18 M36 6 L28 20 M24 2 L18 14"/>
    <path fill="#ffd36b" ${S} d="M20 14 L23 20 L30 21 L25 25 L26 32 L20 28 L14 32 L15 25 L10 21 L17 20Z"/>
    <path ${T} d="M10 40 L12 36 M38 40 L36 36 M24 40 V36"/>`,
};

// filtro de tremido compartilhado: o mesmo traço "ferve" levemente, como tinta em papel
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="ink-wobble" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
  </filter></defs></svg>`;
document.body.insertAdjacentHTML('beforeend', DEFS);

// HTML do símbolo de uma magia; null quando não há desenho (cai no ícone de texto)
export function spellIcon(id) {
  const draw = DRAW[id];
  if (!draw) return null;
  return `<svg class="glyph" viewBox="0 0 48 48" aria-hidden="true"><g filter="url(#ink-wobble)">${draw(ELEM[SPELL_BY_ID[id].elem].color)}</g></svg>`;
}
