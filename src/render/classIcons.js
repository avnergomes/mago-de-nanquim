import { CLASS_BY_ID } from '../data/classes.js';
import { ELEM, SPELL_BY_ID } from '../data/spells.js';
import {
  K, P, S, M, T, HATCH, CROSS, SHINE, mix, n2, hash, rng, polar, smooth, poly, blob, star4, spark, zap, jagged, wash, runes, flameFan,
} from './icons.js';

// Retratos das classes a nanquim, no mesmo traço dos ícones de magia: o mago é uma silhueta preta de
// olhos acesos (como no jogo), e cada classe ganha chapéu, adereço e emblema próprios na cor dela.
// Peças montáveis (busto, capuz, rosto, chapéu pontudo) + detalhes procedurais. viewBox 64x64.

// cor das classes que não estão ligadas a uma magia
const OWN = { scholar: '#8a6a3a', archaeologist: '#b08a4a', magician: '#c8423a', black_mage: '#6a4a9a' };
const BROWN = '#7a5a3a';

// ---------- peças ----------
// busto: ombros de manto escuro com gola em V na cor da classe
function bust(c, trim = c) {
  return `
  <path fill="${mix(c, K, 0.62)}" ${S} d="M7 64 C8 52 17 45 32 45 C47 45 56 52 57 64Z"/>
  <path ${HATCH} d="M32 45 C47 45 56 52 57 64 L45 64 C45 55 40 49 32 45Z"/>
  <path fill="${K}" d="M24 46 L32 57 L40 46Z"/>
  <path fill="none" stroke="${trim}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M23.5 46.2 L32 57.5 L40.5 46.2"/>
  <path ${T} stroke="${mix(c, P, 0.3)}" d="M17 54 C18 58 18 61 17 64 M47 54 C46 58 46 61 47 64"/>`;
}
// capuz em volta do rosto
function hood(fill) {
  return `
  <path fill="${fill}" ${S} d="M32 15 C45 16 51 28 49 47 C44 45 39 44.5 32 44.5 C25 44.5 20 45 15 47 C13 28 19 16 32 15Z"/>
  <path ${HATCH} d="M32 15 C45 16 51 28 49 47 C47 46 45 45.4 42.5 45 C44 32 41 21 32 15Z"/>
  <path ${T} d="M19 38 C18 30 21 22 27 18 M45 38 C46 31 44 25 40 20"/>`;
}
// rosto de sombra com olhos acesos
function face(eye, cy = 34, glow = true) {
  const e = (x0, x1) => `M${x0} ${cy} C${x0 + 1} ${cy - 2.2} ${x1 - 1} ${cy - 2.2} ${x1} ${cy} C${x1 - 1} ${cy + 1.2} ${x0 + 1} ${cy + 1.2} ${x0} ${cy}Z`;
  return `
  <ellipse cx="32" cy="${cy}" rx="8.5" ry="9.5" fill="${K}"/>
  ${glow ? `<ellipse cx="32" cy="${cy}" rx="7" ry="2.6" fill="${eye}" fill-opacity=".35"/>` : ''}
  <path fill="${eye}" d="${e(25.5, 30.5)} ${e(33.5, 38.5)}"/>
  <circle cx="27.6" cy="${cy - 0.3}" r=".6" fill="${P}"/><circle cx="35.6" cy="${cy - 0.3}" r=".6" fill="${P}"/>`;
}
// chapéu pontudo de mago: cone curvado até a ponta, faixa e aba
function hat(fill, { tip = [44, 2], brim = 27, rx = 19, band = P, shade = true } = {}) {
  const [tx, ty] = tip;
  const mid = tx * 0.5 + 16; // o cone se curva em direção à ponta
  const right = `C${mid + 4} ${ty + 12} 40 ${brim - 10} 43 ${brim}Z`;
  const cone = `M21 ${brim} C24 ${brim - 10} ${mid - 2} ${ty + 12} ${tx} ${ty} ${right}`;
  const half = `M32 ${brim} C34 ${brim - 10} ${mid + 1} ${ty + 12} ${tx} ${ty} ${right}`;
  return `
  <path fill="${fill}" ${S} d="${cone}"/>
  ${shade ? `<path ${HATCH} d="${half}"/>` : ''}
  <path fill="none" stroke="${K}" stroke-width="5.4" d="M21.6 ${brim - 3} C26 ${brim - 5.5} 38 ${brim - 5.5} 42.4 ${brim - 3}"/>
  <path fill="none" stroke="${band}" stroke-width="2.8" d="M21.6 ${brim - 3} C26 ${brim - 5.5} 38 ${brim - 5.5} 42.4 ${brim - 3}"/>
  <ellipse cx="32" cy="${brim}" rx="${rx}" ry="4.6" fill="${fill}" ${S}/>
  <path ${HATCH} d="M${32 - rx} ${brim} C${32 - rx} ${brim + 6} ${32 + rx} ${brim + 6} ${32 + rx} ${brim} C${32 + rx * 0.6} ${brim + 3} ${32 - rx * 0.6} ${brim + 3} ${32 - rx} ${brim}Z"/>`;
}
// cajado de madeira com algo na ponta (top recebe o SVG da ponta)
const staff = (x0, y0, x1, y1, top = '') => `
  <path stroke="${K}" stroke-width="4" stroke-linecap="round" d="M${x0} ${y0} L${x1} ${y1}"/>
  <path stroke="${BROWN}" stroke-width="1.8" stroke-linecap="round" d="M${x0} ${y0} L${x1} ${y1}"/>${top}`;
// mão de sombra
const hand = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="3" fill="${K}"/>`;
// fantasminha (Invocador)
const wisp = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path fill="${c}" ${M} d="M0 -6 C4 -6 6 -3 6 1 C6 4 4 6 3 8 C2 6.5 1 7 0 8.5 C-1 7 -2 6.5 -3 8 C-4 6 -6 4 -6 1 C-6 -3 -4 -6 0 -6Z"/>
  <circle cx="-2" cy="0" r="1" fill="${K}"/><circle cx="2" cy="0" r="1" fill="${K}"/></g>`;
const leaf = (x, y, a, c, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path fill="${c}" stroke="${K}" stroke-width="1" d="M-4 0 C-1.5 -3 1.5 -3 4 0 C1.5 3 -1.5 3 -4 0Z"/><path stroke="${K}" stroke-width=".6" d="M-4 0 H3"/></g>`;
const shard = (x, y, a, L, W) => {
  const tip = polar(x, y, L, a), s1 = polar(x, y, L * 0.5, a + W), s2 = polar(x, y, L * 0.5, a - W);
  return `<path fill="url(#ink-ice)" ${M} d="${poly([[x, y], s1, tip, s2])}"/><path ${HATCH} d="${poly([[x, y], tip, s2])}"/>`;
};

// ---------- retratos ----------
// cada desenho recebe a cor da classe (c), o gradiente do elemento (g) e um gerador com semente (r)
const DRAW = {
  // feiticeiro: chapéu pontudo estrelado, barba branca e cajado com estrela
  wizard: (c, g, r) => `
    ${wash(c, r)}
    ${bust(c)}
    <path fill="${P}" ${S} d="M24 39 C24 49 28 55 32 60 C36 55 40 49 40 39 C37 41.5 27 41.5 24 39Z"/>
    <path ${T} d="M29 44 C29 49 30 52 32 55 M35 44 C35 48 34.5 51 33.5 53"/>
    ${face(c, 33)}
    <path fill="${P}" ${M} d="M25 38.5 C28 40.5 36 40.5 39 38.5 C37 37 34 37.6 32 38.4 C30 37.6 27 37 25 38.5Z"/>
    ${hat(`url(#${g})`, { tip: [20, 3], brim: 25 })}
    <path fill="${P}" d="${star4(30, 16, 3.4, 0.6)} ${star4(24, 10.5, 2, 0.4)}"/>
    <path fill="#f4e7b2" stroke="${K}" stroke-width=".9" d="M37 19 A3.4 3.4 0 1 0 37 13 A2.6 2.6 0 1 1 37 19Z"/>
    ${staff(53, 63, 55, 16, `<path fill="url(#${g})" ${S} d="${star4(55, 12, 7.5, 1.4)}"/><path fill="${P}" d="${star4(55, 12, 3, 0.5)}"/>`)}
    ${hand(53, 50)}
    ${spark(7, 12, 2.6)}${spark(60, 30, 2)}`,

  // astrônomo: chapéu com lua crescente, luneta e planetinhas em órbita
  astronomer: (c, g, r) => `
    ${wash(c, r)}
    <ellipse cx="32" cy="30" rx="29" ry="9" transform="rotate(-14 32 30)" fill="none" stroke="${K}" stroke-width="1.1" stroke-dasharray="3 2.6"/>
    <circle cx="5" cy="38" r="3.4" fill="url(#${g})" ${M}/>
    <circle cx="59" cy="21" r="2.4" fill="#f4e7b2" stroke="${K}" stroke-width="1.1"/>
    ${bust(c, '#e6c93a')}
    ${face('#f4e7b2', 34)}
    ${hat(`url(#${g})`, { tip: [48, 3], band: '#e6c93a' })}
    <path fill="#f4e7b2" stroke="${K}" stroke-width="1" d="M34 21 A5 5 0 1 0 34 11 A3.8 3.8 0 1 1 34 21Z"/>
    <path fill="${P}" d="${star4(27, 15, 1.8, 0.3)} ${star4(40, 9, 1.5, 0.3)}"/>
    <g transform="rotate(-38 18 52)">
      <rect x="4" y="48.5" width="26" height="7" rx="1.5" fill="url(#ink-gold)" ${M}/>
      <rect x="0" y="47" width="6" height="10" rx="1.5" fill="#a8861c" ${M}/>
      <path ${T} d="M12 48.5 V55.5 M22 48.5 V55.5"/>
      <path ${HATCH} d="M4 53 H30 V55.5 H4Z"/>
    </g>
    ${hand(22, 54)}
    ${spark(54, 6, 2.6)}${spark(10, 8, 2)}${spark(58, 44, 1.8)}`,

  // criomante: capuz com coroa de gelo, broche de floco e estilhaços flutuando
  cryomancer: (c, g, r) => `
    ${wash(c, r)}
    ${bust(c, mix(c, P, 0.5))}
    ${hood(mix(c, K, 0.25))}
    ${shard(24, 17, -2.2, 12, 0.3)}${shard(40, 17, -0.95, 12, 0.3)}${shard(32, 15, -Math.PI / 2, 14, 0.26)}
    ${face(mix(c, P, 0.5), 34)}
    <path fill="none" stroke="${P}" stroke-width=".9" stroke-dasharray="1 2" d="M28 41 C30 44 34 44 36 41"/>
    <circle cx="32" cy="52" r="3.6" fill="${P}" ${M}/>
    <path ${T} d="M32 49 V55 M29.4 50.5 L34.6 53.5 M29.4 53.5 L34.6 50.5"/>
    ${shard(8, 30, -1.2, 9, 0.35)}${shard(57, 38, -1.9, 8, 0.35)}${shard(55, 12, -0.6, 7, 0.4)}
    ${spark(9, 50, 2.2)}${spark(58, 54, 1.8)}`,

  // xamã: máscara pintada, cocar de penas, colar de ossos e nuvem de tempestade
  shaman: (c, g, r) => {
    let feathers = '';
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.32, [x, y] = polar(32, 32, 22, a);
      const deg = (a * 180) / Math.PI + 90;
      feathers += `<g transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(deg)})"><path fill="${i % 2 ? c : P}" ${M} d="M0 -9 C4 -5 4 5 0 9 C-4 5 -4 -5 0 -9Z"/><path ${T} d="M0 -8 V12"/><path fill="${K}" d="M-2.6 -6 C-1 -7.6 1 -7.6 2.6 -6 C1 -5 -1 -5 -2.6 -6Z"/></g>`;
    }
    return `
    ${wash(c, r)}
    ${feathers}
    ${bust(c)}
    <ellipse cx="32" cy="27" rx="12" ry="4" fill="${BROWN}" ${M}/>
    <path fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="2 2" d="M21 27 C26 29 38 29 43 27"/>
    ${face(c, 35)}
    <path fill="none" stroke="${P}" stroke-width="1.2" stroke-linecap="round" d="M26 29.5 L26 31 M29 29 L29 31 M35 29 L35 31 M38 29.5 L38 31 M27 39 L29 41 M37 39 L35 41"/>
    ${[[21, 48], [25, 51.5], [29, 53.5], [35, 53.5], [39, 51.5], [43, 48]].map(([x, y], i) => `<path fill="${P}" stroke="${K}" stroke-width=".9" transform="translate(${x} ${y}) rotate(${(i - 2.5) * 18})" d="M-1 -2.6 C-2 -3.4 -2 -1.6 -1 -1.6 V1.6 C-2 1.6 -2 3.4 -1 2.6 H1 C2 3.4 2 1.6 1 1.6 V-1.6 C2 -1.6 2 -3.4 1 -2.6Z"/>`).join('')}
    <circle cx="32" cy="57" r="2.2" fill="${c}" stroke="${K}" stroke-width="1"/>
    <path fill="url(#ink-cloud)" ${M} d="M47 14 C44 14 44 9 47.5 9 C48 5 53 4 55 7.5 C58 6 61 9 59.5 12 C61 13 60 15.5 58 15 L48 15Z"/>
    <path fill="url(#ink-gold)" stroke="${K}" stroke-width="1.1" stroke-linejoin="round" d="M52 15 L49 20 L52 20 L50 25 L56 18 L53 18 L55 15Z"/>
    ${spark(7, 14, 2.2)}`;
  },

  // bruxo: capuz com chifres, olhos de brasa e meteoro na mão
  warlock: (c, g, r) => `
    ${wash(c, r)}
    ${bust(c)}
    <path fill="url(#ink-stone)" ${S} d="M22 20 C16 18 11 12 12 4 C15 10 19 12 25 14Z"/>
    <path fill="url(#ink-stone)" ${S} d="M42 20 C48 18 53 12 52 4 C49 10 45 12 39 14Z"/>
    <path ${T} d="M14 9 L16.5 8.5 M15.5 13 L18.5 12 M50 9 L47.5 8.5 M48.5 13 L45.5 12"/>
    ${hood(mix(c, K, 0.5))}
    ${face(c, 34)}
    <path fill="none" stroke="${c}" stroke-width="1" d="M25 31 L29.5 32.5 M39 31 L34.5 32.5"/>
    <path fill="url(#ink-g-fire)" ${M} d="M55 46 C59 40 63 36 63 31 C60 34 57 34 55 33 C56 38 52 42 49 46Z"/>
    <path fill="url(#ink-stone)" ${S} d="${blob(51, 51, 6, r, 0.12, 8)}"/>
    <path ${HATCH} d="M57 49 C58 54 55 57 50 57 C54 55 56 52 57 49Z"/>
    <circle cx="52" cy="52" r="1.6" fill="#5e4f40" stroke="${K}" stroke-width=".8"/>
    ${hand(47, 56)}
    ${spark(8, 40, 2.2)}`,

  // arcanista: capuz e um grande pergaminho rúnico desenrolado
  arcanist: (c, g, r) => `
    ${wash(c, r)}
    ${bust(c)}
    ${hood(mix(c, K, 0.35))}
    ${face(P, 33)}
    <path fill="#f4e7b2" ${S} d="M12 44 H50 V60 H12Z"/>
    <path fill="#e7dbb9" ${M} d="M9 41 C9 39 13 39 13 41 V61 C13 63 9 63 9 61Z"/>
    <path fill="#e7dbb9" ${M} d="M49 41 C49 39 53 39 53 41 V61 C53 63 49 63 49 61Z"/>
    <path ${HATCH} d="M13 56 H49 V60 H13Z"/>
    <path ${T} d="M17 48 H27 M30 48 H44 M17 52 H22 M25 52 H40 M17 56 H33 M36 56 H44"/>
    <path fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" d="M40 52 C42 50 44 51 44 53"/>
    <path fill="${P}" ${M} d="M54 30 C58 24 62 22 63 22 C62 27 59 32 55 36Z"/>
    <path ${T} d="M55 36 L52 44 M56 32 L61 25"/>
    ${spark(8, 14, 2.6)}${spark(56, 10, 2)}`,

  // invocador: capuz roxo cercado de espíritos e um círculo de invocação
  summoner: (c, g, r) => `
    ${wash(c, r)}
    <ellipse cx="32" cy="60" rx="26" ry="5" fill="${c}" fill-opacity=".3" stroke="${K}" stroke-width="1.1" stroke-dasharray="3 2"/>
    ${bust(c)}
    ${hood(`url(#${g})`)}
    ${face(P, 34)}
    ${wisp(9, 26, 1, mix(c, P, 0.4))}${wisp(55, 22, 0.85, mix(c, P, 0.4))}${wisp(55, 48, 0.7, mix(c, P, 0.55))}
    <path ${T} stroke-dasharray="1 2.4" d="M14 31 C18 38 20 40 22 44 M50 27 C47 30 46 34 46 38"/>
    ${spark(32, 7, 2.6)}${spark(6, 48, 1.8)}`,

  // bispo: mitra com runa, estola dourada, auréola e escudo
  bishop: (c, g, r) => `
    ${wash(c, r)}
    <circle cx="32" cy="24" r="20" fill="none" stroke="#e6c93a" stroke-width="2.4"/>
    <circle cx="32" cy="24" r="20" fill="none" stroke="${K}" stroke-width=".8" stroke-dasharray="2 3"/>
    ${bust(P, '#e6c93a')}
    <path fill="url(#ink-gold)" ${M} d="M24 46.4 L27 64 L22 64 L20 47.4Z M40 46.4 L37 64 L42 64 L44 47.4Z"/>
    ${face(c, 35)}
    <path fill="${P}" ${S} d="M22 29 C21 20 25 10 32 4 C39 10 43 20 42 29 C36 27 28 27 22 29Z"/>
    <path ${HATCH} d="M32 4 C39 10 43 20 42 29 C40 28.4 38 28 36 27.8 C37 19 35 10 32 4Z"/>
    <path fill="none" stroke="#e6c93a" stroke-width="2" d="M22.4 28.6 C28 26.6 36 26.6 41.6 28.6 M32 6 V27"/>
    <path fill="none" ${T} d="M22.4 28.6 C28 26.6 36 26.6 41.6 28.6"/>
    <path fill="${c}" stroke="${K}" stroke-width="1.1" d="M32 12 L35 17 L32 22 L29 17Z"/>
    <path fill="url(#ink-gold)" ${M} d="M50 46 C53 48 56 48 59 48 C59 56 56 61 50 64 C44 61 41 56 41 48 C44 48 47 48 50 46Z"/>
    <path fill="url(#${g})" stroke="${K}" stroke-width="1" d="M50 49 C52 50.4 54 51 56 51 C56 56 54 59 50 61.4 C46 59 44 56 44 51 C46 51 48 50.4 50 49Z"/>
    <path ${HATCH} d="M50 49 C52 50.4 54 51 56 51 C56 56 54 59 50 61.4Z"/>
    ${spark(8, 10, 2.4)}${spark(58, 10, 2)}`,

  // ocultista: capuz com terceiro olho aberto e runas flutuando
  occultist: (c, g, r) => `
    ${wash(c, r)}
    <circle cx="32" cy="30" r="27" fill="none" stroke="${K}" stroke-width=".8"/>
    ${runes(32, 30, 24, 10, r)}
    ${bust(c)}
    ${hood(mix(c, K, 0.55))}
    ${face(c, 36)}
    <path fill="${P}" ${M} d="M24 22 C27 17 37 17 40 22 C37 27 27 27 24 22Z"/>
    <circle cx="32" cy="22" r="3.6" fill="url(#${g})" stroke="${K}" stroke-width="1"/>
    <ellipse cx="32" cy="22" rx="1" ry="2.4" fill="${K}"/>
    <path ${T} d="M24 22 L21 21 M40 22 L43 21 M32 17.6 V15 M27 18.6 L26 16.4 M37 18.6 L38 16.4"/>
    <path fill="none" stroke="${c}" stroke-width="1.6" d="M26 54 L32 48 L38 54 L32 60Z"/>
    <circle cx="32" cy="54" r="1.4" fill="${c}"/>`,

  // druida: chifres de cervo, coroa de folhas e cajado retorcido
  druid: (c, g, r) => {
    const antler = (s) => `<path fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M${32 + s * 7} 20 C${32 + s * 12} 14 ${32 + s * 16} 10 ${32 + s * 18} 3 M${32 + s * 13} 13 C${32 + s * 18} 12 ${32 + s * 22} 10 ${32 + s * 25} 7 M${32 + s * 16} 9 C${32 + s * 14} 6 ${32 + s * 13} 4 ${32 + s * 12} 1"/>
      <path fill="none" stroke="#c9a46a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M${32 + s * 7} 20 C${32 + s * 12} 14 ${32 + s * 16} 10 ${32 + s * 18} 3 M${32 + s * 13} 13 C${32 + s * 18} 12 ${32 + s * 22} 10 ${32 + s * 25} 7 M${32 + s * 16} 9 C${32 + s * 14} 6 ${32 + s * 13} 4 ${32 + s * 12} 1"/>`;
    const lc = mix('#5a9a4a', c, 0.4);
    return `
    ${wash(c, r)}
    ${antler(-1)}${antler(1)}
    ${bust(c, lc)}
    ${hood(mix(lc, K, 0.35))}
    ${face('#d8f0a0', 34)}
    ${leaf(22, 20, -40, lc)}${leaf(27, 17, -15, mix(lc, P, 0.2))}${leaf(32, 16, 0, lc)}${leaf(37, 17, 15, mix(lc, P, 0.2))}${leaf(42, 20, 40, lc)}
    ${staff(10, 63, 9, 24, `<path fill="none" stroke="${K}" stroke-width="3.6" stroke-linecap="round" d="M9 24 C4 22 4 15 9 14 C13 13 14 18 11 19"/><path fill="none" stroke="${BROWN}" stroke-width="1.6" stroke-linecap="round" d="M9 24 C4 22 4 15 9 14 C13 13 14 18 11 19"/>`)}
    ${leaf(13, 26, 30, lc, 0.8)}${leaf(6, 30, -30, lc, 0.7)}
    ${hand(10, 50)}
    <path ${T} d="M50 34 C55 32 58 35 56 38 M52 46 C57 46 58 50 55 52"/>
    ${leaf(56, 28, 60, lc, 0.9)}${spark(58, 8, 2.2)}`;
  },

  // piromante: chapéu cuja ponta é uma chama e bola de fogo pairando na mão
  pyromancer: (c, g, r) => `
    ${wash(c, r)}
    ${bust(c, '#ffd36b')}
    ${face('#ffd36b', 34)}
    ${hat(mix(c, K, 0.35), { tip: [40, 10], band: '#ffd36b' })}
    <path fill="url(#${g})" ${S} d="M40 13 C34 10 34 4 38 1 C38 4 40 5 41 3 C44 5 46 9 43 12 C42 13 41 13 40 13Z"/>
    <path fill="#ffd36b" stroke="none" d="M40 11.5 C38 10 38 7.5 39.5 6 C40 8 41.5 8 42 7 C43 9 42 11 40 11.5Z"/>
    <path fill="${c}" fill-opacity=".35" d="M4 44 C4 36 10 32 16 32 C22 32 26 36 26 44Z"/>
    <path fill="url(#${g})" ${M} d="M15 27 C17 31 21 34 21.6 39.6 C22 44 19 46.6 15 46.6 C11 46.6 8 44 8.4 39.6 C8.8 35.4 11.4 33.6 12.6 30 C13.6 31.6 14.6 31.6 15 27Z"/>
    <circle cx="15" cy="40" r="5.4" fill="url(#ink-hot)" ${M}/>
    <path ${SHINE} d="M12 39 C12.5 37 14 36 16 36 C14 37 13 38 13 40Z"/>
    ${hand(15, 50)}
    <circle cx="52" cy="40" r="1.3" fill="${c}" stroke="${K}" stroke-width=".8"/>
    <circle cx="57" cy="32" r=".9" fill="${K}"/>${spark(56, 50, 2.2)}`,

  // mago elétrico: cabelo arrepiado faiscando e orbe elétrico na mão
  sorcerer: (c, g, r) => {
    const spikes = [];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI + (i / 10) * Math.PI;
      spikes.push(polar(32, 32, i % 2 ? 11 : 19 + r() * 3, a));
    }
    return `
    ${wash(c, r)}
    ${bust(c)}
    <path fill="${K}" ${S} d="${poly([[20, 36], ...spikes, [44, 36]])}"/>
    ${zap(poly(jagged(16, 16, 10, 7, r, 3, 1.6), false), c, 1.4)}${zap(poly(jagged(48, 16, 55, 8, r, 3, 1.6), false), c, 1.4)}${zap(poly(jagged(32, 13, 32, 3, r, 3, 1.4), false), c, 1.2)}
    ${face(c, 35)}
    <path fill="${mix(c, K, 0.4)}" ${M} d="M22 44 C24 41 26 42 28 44 L36 44 C38 42 40 41 42 44 L40 47 L24 47Z"/>
    <circle cx="51" cy="47" r="8" fill="${c}" fill-opacity=".3"/>
    <circle cx="51" cy="47" r="5.4" fill="url(#ink-gold)" ${S}/>
    ${zap(poly(jagged(46, 47, 56, 46, r, 4, 2), false), P, 0.8)}
    ${hand(51, 56)}
    ${zap(poly(jagged(57, 42, 62, 34, r, 3, 1.4), false), c, 1.2)}
    ${spark(8, 46, 2.2)}`;
  },

  // alquimista: chapéu de aba larga com óculos de proteção e frasco borbulhando
  alchemist: (c, g, r) => `
    ${wash(c, r)}
    ${bust(c, '#c9a46a')}
    ${face(c, 35)}
    <path fill="${BROWN}" ${S} d="M23 25 C22 16 26 11 32 11 C38 11 42 16 41 25Z"/>
    <path ${HATCH} d="M32 11 C38 11 42 16 41 25 L36 25 C37 18 35 13 32 11Z"/>
    <ellipse cx="32" cy="26" rx="20" ry="4.6" fill="${BROWN}" ${S}/>
    <path ${HATCH} d="M12 26 C12 32 52 32 52 26 C47 29 17 29 12 26Z"/>
    <path fill="none" stroke="${K}" stroke-width="2.4" d="M23 21 H41"/>
    <circle cx="27.5" cy="20" r="4" fill="url(#${g})" ${M}/><circle cx="36.5" cy="20" r="4" fill="url(#${g})" ${M}/>
    <path fill="${P}" d="M25.5 18.5 A2 2 0 0 1 27.5 17 A2.5 2.5 0 0 0 26 19.5Z M34.5 18.5 A2 2 0 0 1 36.5 17 A2.5 2.5 0 0 0 35 19.5Z"/>
    <path fill="${P}" fill-opacity=".85" ${S} d="M47 38 V44 C42 46 41 53 44 57 C47 61 55 61 58 57 C61 53 60 46 55 44 V38Z"/>
    <path fill="url(#${g})" stroke="none" d="M42.7 51 C42.6 54 43 55.5 44.6 57.4 C47.4 60.3 54.6 60.3 57.4 57.4 C59 55.5 59.4 54 59.3 51Z"/>
    <path fill="none" ${M} d="M42.7 51 H59.3"/>
    <rect x="45.6" y="35" width="10.8" height="3.6" rx="1" fill="${BROWN}" ${M}/>
    <circle cx="48" cy="55" r="1.4" fill="${P}" stroke="${K}" stroke-width=".7"/><circle cx="53" cy="53.6" r="1" fill="${P}" stroke="${K}" stroke-width=".7"/>
    <circle cx="50" cy="31" r="1.6" fill="${P}" stroke="${K}" stroke-width=".8"/><circle cx="53" cy="26" r="1.1" fill="${P}" stroke="${K}" stroke-width=".8"/>
    <path ${SHINE} d="M45 47 C45.5 45.5 46.5 45 47.4 44.8 C46.6 46 46.2 47.5 46.3 49Z"/>
    ${spark(8, 44, 2.2)}${spark(8, 10, 2)}`,

  // erudito: capelo de formatura com borla, óculos redondos e pilha de livros
  scholar: (c, g, r) => `
    ${wash(c, r)}
    ${bust(c, '#e6c93a')}
    ${face('#f4e7b2', 34)}
    <circle cx="28" cy="34" r="3.6" fill="none" stroke="${P}" stroke-width="1.2"/>
    <circle cx="36" cy="34" r="3.6" fill="none" stroke="${P}" stroke-width="1.2"/>
    <path fill="none" stroke="${P}" stroke-width="1.2" d="M31.6 34 H32.4"/>
    <path fill="${K}" ${M} d="M23 26 C23 22 41 22 41 26 L41 29 C36 27.6 28 27.6 23 29Z"/>
    <path fill="${mix(c, K, 0.5)}" ${S} d="M32 12 L54 19 L32 26 L10 19Z"/>
    <path ${HATCH} d="M32 26 L54 19 L32 12Z"/>
    <path fill="none" stroke="#e6c93a" stroke-width="1.6" stroke-linecap="round" d="M32 19 C40 20 46 21 49 22 L49 32"/>
    <path fill="#e6c93a" stroke="${K}" stroke-width=".9" d="M47 31 L51 31 L52 37 L46 37Z"/>
    <path ${T} d="M47.4 33 V36.4 M49 33 V36.6 M50.6 33 V36.4"/>
    <circle cx="32" cy="19" r="1.6" fill="#e6c93a" stroke="${K}" stroke-width=".8"/>
    <rect x="5" y="56" width="20" height="6" rx="1" fill="#8c2a3a" ${M}/>
    <rect x="7" y="50.5" width="17" height="5.5" rx="1" fill="#4f86d8" ${M}/>
    <rect x="6" y="45.5" width="15" height="5" rx="1" fill="#5a9a4a" ${M}/>
    <path fill="none" stroke="${P}" stroke-width="1" d="M22 58 H24 M21 52.5 H23 M18 47.5 H20"/>
    <path fill="${P}" ${M} d="M43 52 C47 50 51 50 54 52 C57 50 61 50 63 52 V61 C61 59 57 59 54 61 C51 59 47 59 43 61Z"/>
    <path ${T} d="M54 52 V61 M46 54 H51 M46 56.4 H51 M57 54 H61 M57 56.4 H60"/>
    ${spark(8, 12, 2.4)}`,

  // bruxa: chapéu de aba larga com a ponta dobrada e caldeirão de lava
  witch: (c, g, r) => `
    ${wash(c, r)}
    ${bust(c)}
    <path fill="${K}" d="M21 30 C18 38 18 46 20 50 C22 46 23 40 24 36Z M43 30 C46 38 46 46 44 50 C42 46 41 40 40 36Z"/>
    ${face(c, 35)}
    <path fill="${mix(c, K, 0.55)}" ${S} d="M21 27 C24 19 26 13 30 9 C34 5 38 4 42 6 C46 8 50 12 52 18 C48 13 44 12 41 13 C40 18 41 22 43 27Z"/>
    <path ${HATCH} d="M43 27 C41 22 40 18 41 13 C44 12 48 13 52 18 C49 14 45 13 43 14 C42 19 43 23 45 27Z"/>
    <path fill="none" stroke="${K}" stroke-width="5.4" d="M21.6 24 C26 21.5 38 21.5 42.4 24"/>
    <path fill="none" stroke="${c}" stroke-width="2.8" d="M21.6 24 C26 21.5 38 21.5 42.4 24"/>
    <rect x="29.6" y="20.6" width="4.8" height="4.6" fill="none" stroke="#e6c93a" stroke-width="1.2"/>
    <path fill="${mix(c, K, 0.55)}" ${S} d="M7 28 C7 24 57 24 57 28 C57 31 7 31 7 28Z"/>
    <path ${HATCH} d="M7 28 C7 31 57 31 57 28 C50 29.5 14 29.5 7 28Z"/>
    <path fill="#3e3530" ${S} d="M40 50 C40 62 60 62 60 50Z"/>
    <path ${CROSS} d="M52 50 C52 57 50 60 46 60.6 C52 61 59 58 60 50Z"/>
    <ellipse cx="50" cy="50" rx="10" ry="2.6" fill="url(#ink-hot)" ${M}/>
    <circle cx="47" cy="47" r="2" fill="${c}" stroke="${K}" stroke-width="1"/>
    <circle cx="52" cy="44" r="1.4" fill="${c}" stroke="${K}" stroke-width=".9"/>
    <path ${T} d="M54 41 C52 38 56 36 54 33 M47 41 C45 39 48 37 47 35"/>
    ${spark(8, 10, 2.4)}${spark(56, 6, 2)}`,

  // eletromante: elmo com bobina de Tesla e esfera soltando faíscas
  electromancer: (c, g, r) => `
    ${wash(c, r)}
    ${bust(c)}
    ${hood(mix(c, K, 0.55))}
    ${face(c, 35)}
    <path fill="url(#ink-steel)" ${S} d="M20 27 C20 18 25 15 32 15 C39 15 44 18 44 27 C38 25 26 25 20 27Z"/>
    <path ${HATCH} d="M32 15 C39 15 44 18 44 27 C42 26.4 40 26 38 25.8 C38 20 36 16 32 15Z"/>
    <rect x="29.5" y="8" width="5" height="8" fill="#a8861c" ${M}/>
    <path ${T} d="M29.5 10 H34.5 M29.5 12 H34.5 M29.5 14 H34.5"/>
    <circle cx="32" cy="6" r="3.6" fill="url(#ink-gold)" ${M}/>
    ${zap(poly(jagged(29, 5, 16, 6, r, 4, 2), false), c, 1.6)}${zap(poly(jagged(35, 5, 50, 3, r, 4, 2), false), c, 1.6)}
    ${zap(poly(jagged(33, 3, 40, -2, r, 2, 1), false), c, 1)}
    <path fill="none" stroke="${c}" stroke-width="1.6" d="M18 54 C22 52 26 56 30 54 C34 52 38 56 42 54 C44 53 46 53 47 54"/>
    <ellipse cx="32" cy="60" rx="18" ry="3" fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="2 2"/>
    ${spark(9, 18, 2.2)}${spark(56, 16, 2)}`,

  // árbitro: coroa de ondas, tridente e gotas d'água
  arbiter: (c, g, r) => `
    ${wash(c, r)}
    ${staff(53, 63, 53, 12, `<path fill="url(#ink-gold)" ${S} d="M46 15 C46 10 46 6 46 4 L48 7 V12 C50 13 51 13 51.6 12 V3 L53 0.5 L54.4 3 V12 C55 13 56 13 58 12 V7 L60 4 C60 6 60 10 60 15 C58 18 48 18 46 15Z"/>`)}
    ${bust(c, '#e6c93a')}
    ${face(mix(c, P, 0.5), 35)}
    <path fill="url(#${g})" ${S} d="M20 28 C19 22 20 19 22 17 C23 20 25 21 26 20 C25 16 27 12 30 11 C29 15 31 17 33 16 C33 13 36 10 39 10 C37 14 39 17 41 18 C42 16 43 15 45 15 C44 19 45 24 44 28 C37 26 27 26 20 28Z"/>
    <path ${HATCH} d="M39 10 C37 14 39 17 41 18 C42 16 43 15 45 15 C44 19 45 24 44 28 C42 27.4 40 27 38 26.8 C39 22 37 15 39 10Z"/>
    <path fill="none" stroke="${P}" stroke-width="1.2" stroke-linecap="round" d="M22 25 C24 22 27 22 29 24 M33 23 C35 21 38 21 40 23"/>
    <circle cx="32" cy="22" r="2" fill="#e6c93a" stroke="${K}" stroke-width="1"/>
    ${hand(53, 50)}
    <path fill="${mix(c, P, 0.4)}" stroke="${K}" stroke-width="1" d="M10 22 C12 26 13 28 10 30 C7 28 8 26 10 22Z M14 40 C15.6 43 16 44.4 14 46 C12 44.4 12.4 43 14 40Z M6 50 C7.4 52.6 7.8 54 6 55.4 C4.2 54 4.6 52.6 6 50Z"/>
    ${spark(16, 8, 2.2)}`,

  // arquimago: auréola de círculo mágico, chapéu alto com gema e longa barba
  archmage: (c, g, r) => `
    ${wash(c, r)}
    <circle cx="32" cy="27" r="25" fill="${c}" fill-opacity=".2" stroke="${K}" stroke-width="1.3"/>
    <circle cx="32" cy="27" r="20" fill="none" stroke="${K}" stroke-width=".8"/>
    ${runes(32, 27, 22.5, 14, r)}
    ${bust(c, '#e6c93a')}
    <path fill="${P}" ${S} d="M23 38 C22 50 27 58 32 63 C37 58 42 50 41 38 C37 41 27 41 23 38Z"/>
    <path ${T} d="M28 43 C28 50 30 55 32 58 M36 43 C36 49 35 53 33.6 56 M32 42 V52"/>
    ${face('#f4e7b2', 32)}
    <path fill="${P}" ${M} d="M24 37 C28 39.6 36 39.6 40 37 C37 35.6 34 36.2 32 37 C30 36.2 27 35.6 24 37Z"/>
    ${hat(`url(#${g})`, { tip: [32, 0], brim: 25, rx: 17, band: '#e6c93a' })}
    <path fill="url(#ink-gold)" stroke="${K}" stroke-width="1" d="M32 13 L35 17.4 L32 21.4 L29 17.4Z"/>
    <path fill="${P}" d="M31.4 15.4 L32.6 15.4 L32 17Z"/>
    <path fill="${P}" d="${star4(27, 10, 1.6, 0.3)} ${star4(37, 9, 1.4, 0.3)}"/>`,

  // arqueólogo: capacete de explorador, lenço no pescoço e bússola
  archaeologist: (c, g, r) => `
    ${wash(c, r)}
    ${bust('#6a5a3a', '#c8423a')}
    <path fill="#c8423a" ${M} d="M23 45 C27 48 37 48 41 45 L40 49 C36 51 28 51 24 49Z"/>
    <path fill="#c8423a" ${M} d="M36 49 L39 56 L35 55Z"/>
    ${face('#f4e7b2', 35)}
    <path fill="#e2cfa0" ${S} d="M20 27 C20 17 25 12 32 12 C39 12 44 17 44 27Z"/>
    <path ${HATCH} d="M32 12 C39 12 44 17 44 27 L38 27 C39 20 36 14 32 12Z"/>
    <path fill="none" stroke="${BROWN}" stroke-width="2.6" d="M20.4 24 C26 22.4 38 22.4 43.6 24"/>
    <path ${T} d="M32 12 V22"/>
    <ellipse cx="32" cy="27.4" rx="19" ry="4.4" fill="#e2cfa0" ${S}/>
    <path ${HATCH} d="M13 27.4 C13 33 51 33 51 27.4 C46 30 18 30 13 27.4Z"/>
    <circle cx="50" cy="52" r="9" fill="url(#ink-gold)" ${S}/>
    <circle cx="50" cy="52" r="6.4" fill="${P}" ${M}/>
    <path ${T} d="M50 46.4 V47.6 M50 56.4 V57.6 M44.4 52 H45.6 M54.4 52 H55.6"/>
    <path fill="#c8423a" stroke="${K}" stroke-width=".7" d="M50 52 L52.4 47.4 L51 52.6Z"/>
    <path fill="#4f86d8" stroke="${K}" stroke-width=".7" d="M50 52 L47.6 56.6 L49 51.4Z"/>
    <circle cx="50" cy="52" r=".9" fill="${K}"/>
    <rect x="48.6" y="41.4" width="2.8" height="2.4" rx=".6" fill="#a8861c" ${M}/>
    <path ${T} stroke-dasharray="2 2.4" d="M6 58 C10 50 8 44 14 40 C18 37 16 30 20 28"/>
    <path fill="none" stroke="#c8423a" stroke-width="1.6" d="M4 55 L8 59 M8 55 L4 59"/>`,

  // ilusionista: cartola, gravata-borboleta, varinha e carta flutuando
  magician: (c, g, r) => `
    ${wash(c, r)}
    ${bust('#3a3a4a', P)}
    <path fill="${c}" ${M} d="M32 49 L25 45.6 L25 52.4Z M32 49 L39 45.6 L39 52.4Z"/>
    <circle cx="32" cy="49" r="1.8" fill="${c}" ${M}/>
    ${face('#f4e7b2', 35)}
    <path fill="${K}" ${S} d="M23 7 C23 5 41 5 41 7 L40 26 C36 25 28 25 24 26Z"/>
    <path fill="none" stroke="${mix(K, P, 0.35)}" stroke-width="1.2" d="M38 8 L37.4 22"/>
    <path fill="${c}" ${M} d="M24.4 20 C28 19 36 19 39.6 20 L39.4 24 C36 23 28 23 24.6 24Z"/>
    <ellipse cx="32" cy="26.4" rx="16" ry="3.6" fill="${K}" ${S}/>
    <path fill="${P}" stroke="${K}" stroke-width="1.2" d="M23 7 C23 5 41 5 41 7 C41 9 23 9 23 7Z" fill-opacity=".15"/>
    <g transform="rotate(-40 52 22)"><rect x="44" y="20.6" width="17" height="3.2" rx="1.2" fill="${K}"/><rect x="57" y="20.6" width="4" height="3.2" rx="1" fill="${P}" stroke="${K}" stroke-width=".8"/></g>
    ${spark(58, 10, 3)}${spark(52, 6, 1.8)}${spark(62, 18, 1.6)}
    <g transform="rotate(-14 11 46)"><rect x="5" y="38" width="12" height="16" rx="2" fill="${P}" ${M}/><path fill="${c}" d="M11 42.6 C9 40 6.4 42.6 11 47 C15.6 42.6 13 40 11 42.6Z"/><path fill="${c}" d="M7.4 40 l.8 -1.4 l.8 1.4Z"/></g>`,

  // mago: capuz com borda de pele e cajado com floco de neve
  mage: (c, g, r) => {
    const fur = [];
    for (let i = 0; i <= 12; i++) fur.push(polar(32, 34, i % 2 ? 11.6 : 13.4, Math.PI * 0.95 + (i / 12) * Math.PI * 1.1));
    let flake = '';
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3, [x, y] = polar(52, 12, 7, a), [bx, by] = polar(52, 12, 4, a);
      flake += `M52 12 L${n2(x)} ${n2(y)} M${n2(bx)} ${n2(by)} L${n2(polar(bx, by, 2.4, a + 0.9)[0])} ${n2(polar(bx, by, 2.4, a + 0.9)[1])} M${n2(bx)} ${n2(by)} L${n2(polar(bx, by, 2.4, a - 0.9)[0])} ${n2(polar(bx, by, 2.4, a - 0.9)[1])} `;
    }
    return `
    ${wash(c, r)}
    ${bust(c, P)}
    ${hood(`url(#${g})`)}
    <path fill="${P}" ${M} d="${smooth(fur, false)} ${smooth([...fur].reverse().map(([x, y]) => [32 + (x - 32) * 0.82, 34 + (y - 34) * 0.82]), false).replace('M', 'L')}Z"/>
    ${face(mix(c, P, 0.5), 35)}
    ${staff(52, 63, 52, 20, `<path fill="none" stroke="${K}" stroke-width="4.4" stroke-linecap="round" d="${flake}"/><path fill="none" stroke="${mix(c, P, 0.55)}" stroke-width="2" stroke-linecap="round" d="${flake}"/><circle cx="52" cy="12" r="2.2" fill="${P}" stroke="${K}" stroke-width="1"/>`)}
    ${hand(52, 50)}
    ${[[8, 12], [14, 22], [6, 32], [12, 52], [60, 30], [44, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${P}" stroke="${K}" stroke-width=".8"/>`).join('')}`;
  },

  // mago de batalha: elmo fechado com viseira acesa, pluma, ombreiras e espada-relâmpago
  battlemage: (c, g, r) => `
    ${wash(c, r)}
    <path fill="url(#ink-steel)" ${S} d="M48 63 L54 10 L57 6 L59 10 L55 63Z"/>
    <path ${HATCH} d="M56.5 10 L59 10 L55 63 L52 63Z"/>
    <path fill="url(#${g})" stroke="${K}" stroke-width="1" stroke-linejoin="round" d="M56 14 L54 22 L56 22 L53.6 32 L57.4 20 L55.6 20 L57 14Z"/>
    ${bust(c)}
    <path fill="url(#ink-steel)" ${S} d="M8 56 C8 48 14 44 22 45 L24 52 C18 51 12 53 8 56Z M56 56 C56 48 50 44 42 45 L40 52 C46 51 52 53 56 56Z"/>
    <path ${T} d="M11 51 C14 49 18 48 22 48.4 M53 51 C50 49 46 48 42 48.4"/>
    <path fill="${c}" ${M} d="M32 13 C38 4 48 4 52 8 C46 8 42 10 38 15Z"/>
    <path ${T} d="M38 12 C42 8 46 7 50 7.6"/>
    <path fill="url(#ink-steel)" ${S} d="M21 46 C19 36 20 22 32 15 C44 22 45 36 43 46Z"/>
    <path ${HATCH} d="M32 15 C44 22 45 36 43 46 L37 46 C39 34 37 22 32 15Z"/>
    <path fill="${K}" d="M23 31 C28 29.4 36 29.4 41 31 L40.6 34.4 C36 33.4 28 33.4 23.4 34.4Z"/>
    <path fill="${c}" d="M25 32 C29 31 35 31 39 32 L39 32.8 C35 32.2 29 32.2 25 32.8Z"/>
    <path ${T} d="M32 17 V29 M32 36 V45 M27 38 H29 M27 41 H29 M35 38 H37 M35 41 H37"/>
    <path ${SHINE} d="M24 26 C25 21 28 18 31 17 C28 20 26 24 25.6 28Z"/>
    ${spark(8, 12, 2.4)}`,

  // senhor da guerra: elmo com chifres, ombreiras com espetos e chamas atrás
  warlord: (c, g, r) => `
    ${wash(c, r)}
    <path fill="url(#${g})" fill-opacity=".9" ${M} d="${flameFan(32, 46, 31, -Math.PI * 0.95, -Math.PI * 0.05, 6, r)}"/>
    <path fill="#ffd36b" fill-opacity=".8" stroke="none" d="${flameFan(32, 46, 21, -Math.PI * 0.88, -Math.PI * 0.12, 4, r)}"/>
    ${bust(c)}
    <path fill="url(#ink-steel)" ${S} d="M6 58 C5 49 12 44 21 45 L23 54 C16 53 10 55 6 58Z M58 58 C59 49 52 44 43 45 L41 54 C48 53 54 55 58 58Z"/>
    <path fill="#5d5b56" ${M} d="M10 48 L7 41 L14 46Z M54 48 L57 41 L50 46Z M16 46 L15 39 L20 45Z M48 46 L49 39 L44 45Z"/>
    <path fill="${K}" d="M24 40 C24 50 28 54 32 56 C36 54 40 50 40 40Z"/>
    ${face(c, 35)}
    <path fill="url(#ink-stone)" ${S} d="M22 25 C15 24 11 18 11 10 C14 15 18 18 23 19Z M42 25 C49 24 53 18 53 10 C50 15 46 18 41 19Z"/>
    <path fill="url(#ink-steel)" ${S} d="M21 30 C21 20 25 15 32 15 C39 15 43 20 43 30 C42 28 40 27 38 27 L36 31 L32 27 L28 31 L26 27 C24 27 22 28 21 30Z"/>
    <path ${HATCH} d="M32 15 C39 15 43 20 43 30 C42 28 40 27 38 27 C38 21 36 17 32 15Z"/>
    <path fill="none" stroke="#a8861c" stroke-width="1.6" d="M22 24 C27 22 37 22 42 24"/>
    <path ${T} d="M32 15 V22"/>`,

  // mago negro: capuz escuro, máscara de caveira com órbitas acesas e aura sombria
  black_mage: (c, g, r) => {
    let aura = '';
    for (let i = 0; i < 7; i++) {
      const x = 8 + i * 8, h = 10 + r() * 10;
      aura += `<path fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".7" d="M${x} ${44 - h * 0.2} C${x - 3} ${44 - h * 0.6} ${x + 3} ${44 - h * 0.9} ${x} ${44 - h * 1.6}"/>`;
    }
    return `
    ${wash(c, r)}
    ${aura}
    ${bust('#3a2f3e', c)}
    ${hood('#2f2733')}
    <path fill="${P}" ${S} d="M24 32 C24 25 28 22 32 22 C36 22 40 25 40 32 C40 36 38 38 37 39 L37 43 L27 43 L27 39 C26 38 24 36 24 32Z"/>
    <path ${HATCH} d="M32 22 C36 22 40 25 40 32 C40 36 38 38 37 39 L37 43 L34 43 C36 38 37 28 32 22Z"/>
    <path fill="${K}" d="M26.4 31 C26.4 28 30.4 28 30.6 31 C30.6 33.6 26.6 34 26.4 31Z M33.4 31 C33.6 28 37.6 28 37.6 31 C37.4 34 33.4 33.6 33.4 31Z M32 34.4 L33.4 37.4 H30.6Z"/>
    <circle cx="28.5" cy="31" r="1.3" fill="${c}"/><circle cx="35.5" cy="31" r="1.3" fill="${c}"/>
    <path ${T} d="M29 43 V40.4 M31 43 V40 M33 43 V40 M35 43 V40.4 M27.4 40.4 H36.6"/>
    <path ${T} stroke="${K}" d="M30 24 L31 26.4 L29.6 27.6"/>
    <circle cx="9" cy="52" r="4" fill="${c}" fill-opacity=".35" stroke="${K}" stroke-width="1"/>
    <circle cx="55" cy="50" r="3" fill="${c}" fill-opacity=".35" stroke="${K}" stroke-width="1"/>
    ${spark(9, 52, 2)}${spark(55, 50, 1.6)}`;
  },
};

const CACHE = new Map();

// cor da classe: a do elemento da magia dela, ou a própria quando não tem magia
export function classColor(c) {
  return OWN[c.id] ?? (c.spell ? ELEM[SPELL_BY_ID[c.spell].elem].color : '#8a6a3a');
}

// HTML do retrato de uma classe; null quando não há desenho
export function classIcon(id) {
  const draw = DRAW[id];
  if (!draw) return null;
  if (!CACHE.has(id)) {
    const c = CLASS_BY_ID[id];
    const elem = c.spell && !OWN[id] ? SPELL_BY_ID[c.spell].elem : 'none';
    const inner = draw(classColor(c), `ink-g-${elem}`, rng(hash('class:' + id)));
    CACHE.set(id, `<svg class="glyph" viewBox="0 0 64 64" aria-hidden="true"><g filter="url(#ink-wobble)">${inner}</g></svg>`);
  }
  return CACHE.get(id);
}
