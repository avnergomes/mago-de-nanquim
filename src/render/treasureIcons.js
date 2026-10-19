import {
  K, P, S, M, T, HATCH, CROSS, SHINE, mix, n2, hash, rng, polar, smooth, poly, blob, star4, spark, zap, jagged, wash, runes, flameFan,
} from './icons.js';

// Tesouros dos baús a nanquim: relíquias sobre aguada simples, artefatos com moldura de raios dourados
// para se destacarem como raros. Peças reaproveitáveis (gema, moeda, frasco, livro, chama, asa) +
// detalhes procedurais. viewBox 64x64.

const GOLD = '#e6c93a', RED = '#c8423a', BLOOD = '#8c2a3a', BLUE = '#4f86d8', GREEN = '#5a9a4a', ICE = '#4fb0c6';
const PURPLE = '#b06ae8', ARC = '#7a8cff', FIRE = '#e8643a', STONE = '#8a7a66', BROWN = '#7a5a3a', LEATHER = '#9a6a3a';

// ---------- peças ----------
// gema lapidada: coroa, mesa e pavilhão facetados
function gem(x, y, r, c) {
  const tl = [x - r * 0.6, y - r * 0.75], tr = [x + r * 0.6, y - r * 0.75], ml = [x - r, y - r * 0.15], mr = [x + r, y - r * 0.15], b = [x, y + r];
  const il = [x - r * 0.3, y - r * 0.15], ir = [x + r * 0.3, y - r * 0.15];
  return `
  <path fill="${c}" ${M} d="${poly([tl, tr, mr, b, ml])}"/>
  <path fill="${mix(c, P, 0.45)}" stroke="none" d="${poly([tl, tr, ir, il])}"/>
  <path ${HATCH} d="${poly([ir, mr, b])}"/>
  <path fill="none" stroke="${K}" stroke-width=".8" stroke-linejoin="round" d="${poly([ml, mr], false)} ${poly([tl, il, b, ir, tr], false)} ${poly([il, [x, y - r * 0.75], ir], false)}"/>
  <path ${SHINE} d="${poly([[tl[0] + r * 0.12, tl[1] + r * 0.12], [x - r * 0.1, tl[1] + r * 0.12], [il[0], il[1] - r * 0.1]])}"/>`;
}
// brilho redondo em volta de algo
const glow = (x, y, r, c, o = 0.3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" fill-opacity="${o}"/>`;
// moeda com aro serrilhado
function coin(x, y, r, inner = '') {
  let teeth = '';
  for (let i = 0; i < 24; i++) { const [a, b] = [polar(x, y, r - 1.6, (i / 24) * 6.283), polar(x, y, r - 0.4, (i / 24) * 6.283)]; teeth += `M${n2(a[0])} ${n2(a[1])} L${n2(b[0])} ${n2(b[1])} `; }
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#ink-gold)" ${S}/>
  <path fill="none" stroke="${K}" stroke-width=".6" d="${teeth}"/>
  <circle cx="${x}" cy="${y}" r="${r - 2.4}" fill="none" stroke="${K}" stroke-width="1"/>
  <path ${HATCH} d="M${x + r} ${y} A${r} ${r} 0 0 1 ${x} ${y + r} A${r * 1.1} ${r * 1.1} 0 0 0 ${x + r} ${y}Z"/>${inner}`;
}
// chama em gota
const flame = (x, y, h, c = FIRE) => `
  <path fill="${c}" ${M} d="M${x} ${y - h} C${x + h * 0.15} ${y - h * 0.6} ${x + h * 0.5} ${y - h * 0.45} ${x + h * 0.45} ${y - h * 0.15} C${x + h * 0.42} ${y + h * 0.1} ${x + h * 0.2} ${y + h * 0.2} ${x} ${y + h * 0.2} C${x - h * 0.2} ${y + h * 0.2} ${x - h * 0.42} ${y + h * 0.1} ${x - h * 0.42} ${y - h * 0.15} C${x - h * 0.4} ${y - h * 0.35} ${x - h * 0.2} ${y - h * 0.4} ${x - h * 0.15} ${y - h * 0.55} C${x - h * 0.05} ${y - h * 0.5} ${x} ${y - h * 0.7} ${x} ${y - h}Z"/>
  <path fill="#ffd36b" stroke="none" d="M${x} ${y - h * 0.5} C${x + h * 0.1} ${y - h * 0.3} ${x + h * 0.25} ${y - h * 0.2} ${x + h * 0.22} ${y} C${x + h * 0.2} ${y + h * 0.1} ${x - h * 0.2} ${y + h * 0.1} ${x - h * 0.22} ${y} C${x - h * 0.24} ${y - h * 0.15} ${x - h * 0.1} ${y - h * 0.25} ${x} ${y - h * 0.5}Z"/>`;
// asa de penas (s = 1 direita, -1 esquerda)
function wing(x, y, s, size = 1, c = P) {
  let d = '';
  const tips = [];
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.38, L = size * (20 - i * 2.4);
    tips.push([x + s * Math.cos(a) * L, y + Math.sin(a) * L]);
  }
  const body = smooth([[x, y - 3 * size], [x + s * 10 * size, y - 12 * size], tips[0], tips[1], tips[2], tips[3], tips[4], [x + s * 4 * size, y + 6 * size]], false);
  for (let i = 1; i < 5; i++) d += `M${x + s * 3 * size} ${y} L${n2(tips[i][0] - s * 2)} ${n2(tips[i][1] - 1)} `;
  return `<path fill="${c}" ${M} d="${body}Z"/><path fill="none" stroke="${K}" stroke-width=".8" stroke-linecap="round" d="${d}"/>`;
}
// fundo de artefato: raios dourados e anel ornamental
function artBack(c, r) {
  let rays = '';
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * 6.283, [x0, y0] = polar(32, 32, 24, a), [x1, y1] = polar(32, 32, i % 2 ? 28 : 31.5, a);
    rays += `M${n2(x0)} ${n2(y0)} L${n2(x1)} ${n2(y1)} `;
  }
  return `${wash(c, r)}
  <path fill="none" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round" d="${rays}"/>
  <path fill="none" stroke="${K}" stroke-width=".7" stroke-linecap="round" d="${rays}"/>
  <circle cx="32" cy="32" r="23.5" fill="none" stroke="${K}" stroke-width="1.1" stroke-dasharray="1.5 2.5"/>`;
}
const corkFlask = (x, y, s, c) => `
  <path fill="${P}" fill-opacity=".85" ${S} d="M${x - 3 * s} ${y - 12 * s} V${y - 7 * s} C${x - 10 * s} ${y - 4 * s} ${x - 11 * s} ${y + 6 * s} ${x - 6 * s} ${y + 10 * s} C${x - 3 * s} ${y + 12 * s} ${x + 3 * s} ${y + 12 * s} ${x + 6 * s} ${y + 10 * s} C${x + 11 * s} ${y + 6 * s} ${x + 10 * s} ${y - 4 * s} ${x + 3 * s} ${y - 7 * s} V${y - 12 * s}Z"/>
  <path fill="${c}" stroke="none" d="M${x - 9.4 * s} ${y + 1 * s} C${x - 9.6 * s} ${y + 5 * s} ${x - 8.6 * s} ${y + 8 * s} ${x - 6 * s} ${y + 9.6 * s} C${x - 3 * s} ${y + 11.4 * s} ${x + 3 * s} ${y + 11.4 * s} ${x + 6 * s} ${y + 9.6 * s} C${x + 8.6 * s} ${y + 8 * s} ${x + 9.6 * s} ${y + 5 * s} ${x + 9.4 * s} ${y + 1 * s}Z"/>
  <path fill="none" ${M} d="M${x - 9.4 * s} ${y + 1 * s} H${x + 9.4 * s}"/>
  <path ${HATCH} d="M${x + 4 * s} ${y + 1 * s} H${x + 9.4 * s} C${x + 9.6 * s} ${y + 5 * s} ${x + 8.6 * s} ${y + 8 * s} ${x + 6 * s} ${y + 9.6 * s} C${x + 4 * s} ${y + 10.8 * s} ${x + 2 * s} ${y + 11 * s} ${x} ${y + 11.2 * s} C${x + 4 * s} ${y + 8 * s} ${x + 5 * s} ${y + 4 * s} ${x + 4 * s} ${y + 1 * s}Z"/>
  <rect x="${x - 4 * s}" y="${y - 15 * s}" width="${8 * s}" height="${4 * s}" rx="1" fill="${BROWN}" ${M}/>
  <path ${SHINE} d="M${x - 7 * s} ${y - 2 * s} C${x - 6.4 * s} ${y - 4 * s} ${x - 5 * s} ${y - 5 * s} ${x - 4 * s} ${y - 5.4 * s} C${x - 5 * s} ${y - 3.6 * s} ${x - 5.6 * s} ${y - 2 * s} ${x - 5.6 * s} ${y}Z"/>
  <circle cx="${x - 2 * s}" cy="${y + 6 * s}" r="${1.3 * s}" fill="${P}" stroke="${K}" stroke-width=".7"/><circle cx="${x + 2.4 * s}" cy="${y + 4 * s}" r="${0.9 * s}" fill="${P}" stroke="${K}" stroke-width=".7"/>`;
const crown = (y, c = 'url(#ink-gold)', gems = [RED, BLUE, GREEN]) => `
  <path fill="${c}" ${S} d="M12 ${y} L10 ${y - 18} L20 ${y - 9} L26 ${y - 22} L32 ${y - 10} L38 ${y - 22} L44 ${y - 9} L54 ${y - 18} L52 ${y}Z"/>
  <path ${HATCH} d="M32 ${y - 10} L38 ${y - 22} L44 ${y - 9} L54 ${y - 18} L52 ${y}Z"/>
  <rect x="11" y="${y - 2}" width="42" height="6" rx="1.5" fill="${c}" ${M}/>
  ${[10, 26, 38, 54].map((x) => `<circle cx="${x}" cy="${y - (x === 10 || x === 54 ? 18 : 22)}" r="1.8" fill="${P}" stroke="${K}" stroke-width=".9"/>`).join('')}
  ${gems.map((g, i) => `<circle cx="${20 + i * 12}" cy="${y + 1}" r="2" fill="${g}" stroke="${K}" stroke-width=".9"/>`).join('')}`;
function gear(x, y, R, teeth, c) {
  const pts = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * 6.283 + 0.2, rr = i % 4 < 2 ? R : R * 0.8;
    pts.push(polar(x, y, rr, a));
  }
  return `<path fill="${c}" ${M} d="${poly(pts)}"/><circle cx="${x}" cy="${y}" r="${n2(R * 0.45)}" fill="${P}" stroke="${K}" stroke-width="1.1"/>`;
}
function hourglass(cx, cy, broken) {
  return `
  <rect x="${cx - 13}" y="${cy - 21}" width="26" height="4" rx="1.4" fill="${BROWN}" ${M}/>
  <rect x="${cx - 13}" y="${cy + 17}" width="26" height="4" rx="1.4" fill="${BROWN}" ${M}/>
  <path stroke="${K}" stroke-width="3.6" stroke-linecap="round" d="M${cx - 11} ${cy - 17} V${cy + 17} M${cx + 11} ${cy - 17} V${cy + 17}"/>
  <path stroke="${BROWN}" stroke-width="1.6" stroke-linecap="round" d="M${cx - 11} ${cy - 17} V${cy + 17} M${cx + 11} ${cy - 17} V${cy + 17}"/>
  <path fill="${P}" fill-opacity=".8" ${M} d="M${cx - 8} ${cy - 17} C${cx - 8} ${cy - 6} ${cx - 2} ${cy - 3} ${cx - 1.4} ${cy} C${cx - 2} ${cy + 3} ${cx - 8} ${cy + 6} ${cx - 8} ${cy + 17} H${cx + 8} C${cx + 8} ${cy + 6} ${cx + 2} ${cy + 3} ${cx + 1.4} ${cy} C${cx + 2} ${cy - 3} ${cx + 8} ${cy - 6} ${cx + 8} ${cy - 17}Z"/>
  <path fill="${GOLD}" stroke="none" d="M${cx - 6} ${cy - 9} C${cx - 4} ${cy - 5} ${cx - 1} ${cy - 3} ${cx} ${cy - 1} C${cx + 1} ${cy - 3} ${cx + 4} ${cy - 5} ${cx + 6} ${cy - 9}Z M${cx - 7.4} ${cy + 16} C${cx - 6} ${cy + 10} ${cx - 2} ${cy + 9} ${cx} ${cy + 9} C${cx + 2} ${cy + 9} ${cx + 6} ${cy + 10} ${cx + 7.4} ${cy + 16}Z"/>
  <path fill="none" stroke="${GOLD}" stroke-width="1" stroke-dasharray="1 1.6" d="M${cx} ${cy} V${cy + 9}"/>
  ${broken ? `<path fill="none" stroke="${K}" stroke-width="1.2" stroke-linejoin="round" d="M${cx + 7} ${cy - 15} L${cx + 3} ${cy - 10} L${cx + 6} ${cy - 7} L${cx + 2} ${cy - 3} M${cx - 7} ${cy + 14} L${cx - 3} ${cy + 11} L${cx - 5} ${cy + 7}"/>` : ''}
  <path ${SHINE} d="M${cx - 6} ${cy - 15} C${cx - 6} ${cy - 10} ${cx - 4} ${cy - 7} ${cx - 2.6} ${cy - 5} C${cx - 5} ${cy - 8} ${cx - 5.6} ${cy - 11} ${cx - 5} ${cy - 15}Z"/>`;
}
function book(x, y, w, h, c, clasp = GOLD) {
  return `
  <path fill="${P}" ${M} d="M${x + 2} ${y + h} H${x + w + 2} V${y + 3} H${x + w}"/>
  <path fill="none" stroke="${K}" stroke-width=".6" d="M${x + 3} ${y + h - 1.4} H${x + w + 1} M${x + 3} ${y + h - 0.6} H${x + w + 1}"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h - 1}" rx="2" fill="${c}" ${S}/>
  <path ${HATCH} d="M${x + w * 0.6} ${y} H${x + w - 2} C${x + w} ${y} ${x + w} ${y + 2} ${x + w} ${y + 2} V${y + h - 3} C${x + w} ${y + h - 1} ${x + w - 2} ${y + h - 1} ${x + w - 2} ${y + h - 1} H${x + w * 0.6}Z"/>
  <path stroke="${K}" stroke-width="2.4" d="M${x + 3.4} ${y + 1} V${y + h - 2}"/>
  <rect x="${x + w - 3}" y="${y + h / 2 - 3.5}" width="5" height="7" rx="1" fill="${clasp}" ${M}/>`;
}

// ---------- desenhos ----------
// [cor, desenho]; o desenho recebe a cor (c) e um gerador com semente (r)
const DRAW = {
  // ===== relíquias =====
  lord_of_fire: [FIRE, (c, r) => `${wash(c, r)}
    ${flame(20, 30, 16)}${flame(32, 26, 22)}${flame(44, 30, 16)}
    ${crown(52)}${spark(8, 12, 2.4)}${spark(57, 10, 2)}`],
  stormy_clouds: [GOLD, (c, r) => `${wash(c, r)}
    <path fill="url(#ink-gold)" ${M} d="M20 34 L14 46 L19 46 L15 58 L26 42 L21 42 L25 34Z"/>
    <path fill="url(#ink-gold)" ${M} d="M40 34 L35 44 L39 44 L35 54 L45 41 L41 41 L44 34Z"/>
    <path ${T} d="M30 38 L27 45 M50 38 L47 45 M10 38 L8 43"/>
    <path fill="url(#ink-cloud)" ${S} d="M10 34 C3 34 3 24 10 23 C10 14 19 11 25 16 C27 7 42 6 44 15 C51 12 60 18 56 26 C61 29 57 36 51 35 L12 35Z"/>
    <path ${HATCH} d="M7 30 C12 33 20 33 25 31 C31 34 40 34 46 31 C50 33 54 33 57 30 C58 34 55 37 51 35 L12 35 C9 35 6 33 7 30Z"/>
    <path ${SHINE} d="M19 15 C22 12 26 13 27 16 C25 15 21 15 19 17Z"/>
    <path ${T} d="M16 26 C19 23 24 24 26 27 M33 21 C37 18 42 19 44 23"/>`],
  natures_wrath: [GREEN, (c, r) => {
    let thorns = '';
    const spiral = [];
    for (let i = 0; i <= 18; i++) { const a = i * 0.62, rr = 26 - i * 0.6; spiral.push(polar(32, 32, rr, a)); }
    spiral.forEach(([x, y], i) => { if (i % 3 === 1) thorns += `<path fill="${K}" d="M${n2(x - 1.2)} ${n2(y)} L${n2(x)} ${n2(y - 3)} L${n2(x + 1.2)} ${n2(y)}Z"/>`; });
    return `${wash(c, r)}
    <path fill="${mix(c, P, 0.15)}" ${S} d="M32 6 C46 12 52 28 44 44 C40 51 34 54 32 58 C30 54 24 51 20 44 C12 28 18 12 32 6Z"/>
    <path ${HATCH} d="M32 6 C46 12 52 28 44 44 C40 51 34 54 32 58Z"/>
    <path fill="none" ${M} d="M32 10 V58 M32 22 L24 16 M32 22 L40 16 M32 32 L22 25 M32 32 L42 25 M32 42 L24 36 M32 42 L40 36"/>
    <path fill="none" stroke="${BROWN}" stroke-width="2.6" stroke-linecap="round" d="${smooth(spiral, false)}"/>
    <path fill="none" stroke="${K}" stroke-width=".8" d="${smooth(spiral, false)}"/>
    ${thorns}
    <path fill="${RED}" d="M27 20 L30 22 L27 23Z M37 20 L34 22 L37 23Z"/>`;
  }],
  energy_engineering: [PURPLE, (c, r) => `${wash(c, r)}
    ${gear(24, 36, 16, 9, 'url(#ink-steel)')}
    <path ${HATCH} d="M24 36 L40 36 A16 16 0 0 1 24 52Z"/>
    ${gear(46, 18, 10, 7, 'url(#ink-gold)')}
    <circle cx="24" cy="36" r="6.4" fill="url(#ink-g-energy)" ${M}/>
    ${zap(poly(jagged(19, 39, 29, 33, r, 3, 1.4), false), c, 1.2)}
    <circle cx="46" cy="18" r="3" fill="${c}" stroke="${K}" stroke-width="1"/>
    ${spark(54, 44, 2.6)}${spark(8, 10, 2)}`],
  arcana: [ARC, (c, r) => `${wash(c, r)}
    ${glow(32, 22, 12, c)}
    <path fill="${P}" ${S} d="M6 44 C14 40 24 40 32 46 C40 40 50 40 58 44 L58 56 C50 52 40 52 32 58 C24 52 14 52 6 56Z"/>
    <path fill="${mix(c, K, 0.4)}" ${M} d="M6 56 C14 52 24 52 32 58 C40 52 50 52 58 56 L58 59 C50 55 40 55 32 61 C24 55 14 55 6 59Z"/>
    <path ${HATCH} d="M32 46 C40 40 50 40 58 44 L58 56 C50 52 40 52 32 58Z"/>
    <path fill="none" ${M} d="M32 46 V58"/>
    <path ${T} d="M11 47 C16 45 22 45 27 48 M11 51 C16 49 22 49 27 52 M37 48 C42 45 48 45 53 47 M37 52 C42 49 48 49 53 51"/>
    <path fill="url(#ink-g-none)" ${S} d="${star4(32, 22, 13, 2.4)}"/>
    <path fill="${P}" d="${star4(32, 22, 5, 0.9)}"/>
    ${runes(32, 22, 18, 6, r)}`],
  guardian_angel: [GOLD, (c, r) => `${wash(c, r)}
    ${wing(28, 36, -1, 1.2)}${wing(36, 36, 1, 1.2)}
    <ellipse cx="32" cy="14" rx="11" ry="4" fill="none" stroke="${K}" stroke-width="5"/>
    <ellipse cx="32" cy="14" rx="11" ry="4" fill="none" stroke="${GOLD}" stroke-width="2.6"/>
    <circle cx="32" cy="38" r="6" fill="url(#ink-gold)" ${S}/>
    <path fill="${P}" d="${star4(32, 38, 3.6, 0.6)}"/>
    ${spark(10, 12, 2.4)}${spark(54, 54, 2.2)}`],
  silent_casting: [ARC, (c, r) => `${wash(c, r)}
    <path stroke="${K}" stroke-width="2.6" stroke-linecap="round" d="M32 4 V10"/>
    <path fill="url(#ink-gold)" ${S} d="M32 9 C22 9 19 18 19 28 C19 36 16 40 12 44 H52 C48 40 45 36 45 28 C45 18 42 9 32 9Z"/>
    <path ${HATCH} d="M32 9 C42 9 45 18 45 28 C45 36 48 40 52 44 H42 C40 38 40 30 39 22 C38 15 36 11 32 9Z"/>
    <path fill="${c}" ${M} d="M14 30 C22 27 42 27 50 30 L51 37 C42 34 22 34 13 37Z"/>
    <path ${T} d="M20 30 L19 35 M27 29 L27 34 M37 29 L37 34 M44 30 L45 35"/>
    <path fill="${c}" ${M} d="M30 32 C26 36 24 40 26 44 L30 38Z M34 32 C38 36 40 40 38 44 L34 38Z"/>
    <circle cx="32" cy="46" r="3" fill="${STONE}" ${M}/>
    <path ${SHINE} d="M25 16 C26 13 28 12 30 12 C28 14 27 17 26.6 20Z"/>
    <path ${T} stroke-dasharray="1 2.4" d="M8 50 C12 52 16 52 20 50 M44 50 C48 52 52 52 56 50"/>`],
  war_magic: [RED, (c, r) => `${wash(c, r)}
    <g transform="rotate(45 32 32)">
      <rect x="29.6" y="4" width="4.8" height="40" fill="url(#ink-steel)" ${M}/>
      <path fill="url(#ink-steel)" ${M} d="M29.6 4 L32 -1 L34.4 4Z"/>
      <rect x="23" y="43" width="18" height="4" rx="1.4" fill="url(#ink-gold)" ${M}/>
      <rect x="30" y="47" width="4" height="10" fill="${BROWN}" ${M}/>
      <circle cx="32" cy="59" r="2.4" fill="url(#ink-gold)" ${M}/>
    </g>
    <g transform="rotate(-45 32 32)">
      <path stroke="${K}" stroke-width="4" stroke-linecap="round" d="M32 10 V60"/>
      <path stroke="${BROWN}" stroke-width="1.8" stroke-linecap="round" d="M32 10 V60"/>
      <circle cx="32" cy="8" r="5" fill="url(#ink-g-none)" ${M}/>
      <circle cx="31" cy="7" r="1.4" fill="${P}"/>
    </g>
    <path fill="${c}" ${S} d="M32 22 C37 25 41 26 44 26 C44 36 40 42 32 46 C24 42 20 36 20 26 C23 26 27 25 32 22Z"/>
    <path ${HATCH} d="M32 22 C37 25 41 26 44 26 C44 36 40 42 32 46Z"/>
    <path fill="${P}" d="${star4(32, 33, 5, 0.9)}"/>`],
  timekeeper: [BROWN, (c, r) => `${wash(GOLD, r)}${hourglass(32, 32, false)}${spark(52, 12, 2.4)}${spark(10, 52, 2)}`],
  pioneer: [RED, (c, r) => `${wash(GREEN, r)}
    <path fill="${mix(GREEN, P, 0.2)}" ${S} d="M2 58 C10 46 22 40 32 40 C42 40 54 46 62 58Z"/>
    <path ${HATCH} d="M32 40 C42 40 54 46 62 58 H48 C46 50 40 44 32 40Z"/>
    <path ${T} d="M14 50 L16 47 L18 50 M44 52 L46 49 L48 52 M26 46 L27 44 L28 46"/>
    <path stroke="${K}" stroke-width="3.6" stroke-linecap="round" d="M26 44 V6"/>
    <path stroke="${BROWN}" stroke-width="1.6" stroke-linecap="round" d="M26 44 V6"/>
    <circle cx="26" cy="5" r="2.2" fill="url(#ink-gold)" stroke="${K}" stroke-width="1"/>
    <path fill="${c}" ${S} d="M27 8 C34 5 40 11 48 8 C45 13 46 18 50 22 C42 25 36 19 27 22Z"/>
    <path ${HATCH} d="M38 9 C42 10 45 9 48 8 C45 13 46 18 50 22 C46 23 42 22 39 21 C41 17 40 12 38 9Z"/>
    <path fill="${P}" d="${star4(36, 15, 3.4, 0.6)}"/>`],
  smite: [GOLD, (c, r) => {
    let rays = '';
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22, [x, y] = polar(32, 46, 42, a); rays += `M32 46 L${n2(x)} ${n2(y)} `; }
    return `${wash(c, r)}
    <path fill="none" stroke="${GOLD}" stroke-width="2" stroke-opacity=".6" d="${rays}"/>
    <path fill="url(#ink-steel)" ${S} d="M29 6 H35 V40 L32 47 L29 40Z"/>
    <path ${HATCH} d="M32 6 H35 V40 L32 47Z"/>
    <path fill="url(#ink-gold)" ${S} d="M20 10 H44 C44 13 42 14 40 14 H24 C22 14 20 13 20 10Z"/>
    <rect x="29.6" y="0" width="4.8" height="10" fill="${BROWN}" ${M}/>
    <path fill="${P}" fill-opacity=".6" stroke="none" d="${blob(32, 52, 12, r, 0.15, 9, 0.4)}"/>
    <path fill="none" ${S} d="M8 54 C16 51 24 52 28 53 M36 53 C40 52 48 51 56 54"/>
    <path ${T} d="M22 57 L18 61 M42 57 L46 61 M32 58 V62"/>
    ${spark(32, 46, 4)}`;
  }],
  seal: [ARC, (c, r) => `${wash(c, r)}
    <path fill="none" stroke="${K}" stroke-width="5" d="M22 30 V20 C22 8 42 8 42 20 V30"/>
    <path fill="none" stroke="url(#ink-steel)" stroke-width="2.6" d="M22 30 V20 C22 8 42 8 42 20 V30"/>
    <rect x="14" y="28" width="36" height="28" rx="4" fill="url(#ink-gold)" ${S}/>
    <path ${HATCH} d="M38 28 H46 C48 28 50 30 50 32 V52 C50 54 48 56 46 56 H38Z"/>
    <circle cx="32" cy="42" r="8" fill="${c}" ${M}/>
    ${runes(32, 42, 5.6, 5, r, 1, 0.7)}
    <path fill="${K}" d="M30.6 41 A1.6 1.6 0 1 1 33.4 41 L34 47 H30Z"/>
    ${[[8, 46], [6, 38], [56, 46], [58, 38]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.7" fill="none" stroke="${K}" stroke-width="1.4"/>`).join('')}`],
  curse: [PURPLE, (c, r) => `${wash(c, r)}
    <path fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-opacity=".7" d="M14 30 C8 22 16 16 12 8 M50 30 C56 22 48 16 52 8 M32 16 C28 10 34 6 32 2"/>
    <path fill="${P}" ${S} d="M16 30 C16 18 24 12 32 12 C40 12 48 18 48 30 C48 37 45 41 42 43 V50 H22 V43 C19 41 16 37 16 30Z"/>
    <path ${HATCH} d="M32 12 C40 12 48 18 48 30 C48 37 45 41 42 43 V50 H37 C42 40 42 22 32 12Z"/>
    <path fill="${K}" d="M20 30 C20 25 28 25 28.6 30 C28.6 35 21 36 20 30Z M35.4 30 C36 25 44 25 44 30 C43 36 35.4 35 35.4 30Z M32 35 L34.4 40 H29.6Z"/>
    <circle cx="24.4" cy="30.4" r="2" fill="${c}"/><circle cx="39.6" cy="30.4" r="2" fill="${c}"/>
    <path ${T} d="M25 50 V45 M29 50 V44.4 M33 50 V44.4 M37 50 V45 M22.4 45 H41.6"/>
    <path ${T} d="M24 17 L26 21 L24 23"/>
    <path fill="${K}" d="M24 56 C28 54 36 54 40 56 L38 60 C34 59 30 59 26 60Z"/>`],
  chakra: [RED, (c, r) => {
    let petals = '';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 6.283, [x, y] = polar(32, 32, 17, a);
      petals += `<path transform="translate(${n2(x)} ${n2(y)}) rotate(${n2((a * 180) / Math.PI + 90)})" fill="${i % 2 ? mix(c, P, 0.55) : mix('#e88aa0', P, 0.3)}" ${M} d="M0 -10 C6 -5 6 5 0 10 C-6 5 -6 -5 0 -10Z"/>`;
    }
    return `${wash(c, r)}${petals}
    <circle cx="32" cy="32" r="11" fill="${P}" ${S}/>
    <path fill="${K}" d="M32 21 A11 11 0 0 1 32 43 A5.5 5.5 0 0 1 32 32 A5.5 5.5 0 0 0 32 21Z"/>
    <circle cx="32" cy="26.5" r="1.8" fill="${K}"/><circle cx="32" cy="37.5" r="1.8" fill="${P}"/>`;
  }],
  mana_factory: [BLUE, (c, r) => `${wash(c, r)}
    <path fill="${STONE}" ${S} d="M6 58 V34 L18 26 V34 L30 26 V34 L42 26 V58Z"/>
    <path ${HATCH} d="M30 34 L42 26 V58 H34 V36Z"/>
    <rect x="44" y="14" width="10" height="44" fill="${mix(STONE, K, 0.2)}" ${S}/>
    <path ${T} d="M44 22 H54 M44 30 H54 M44 38 H54 M44 46 H54"/>
    <rect x="11" y="40" width="7" height="7" fill="${GOLD}" ${M}/><rect x="24" y="40" width="7" height="7" fill="${GOLD}" ${M}/>
    <rect x="16" y="50" width="10" height="8" fill="${K}"/>
    <path fill="${c}" ${M} d="M49 8 L53 5 L57 9 L53 13 L49 10Z"/>
    <path fill="${mix(c, P, 0.3)}" ${M} d="M40 6 L43 3 L46 6 L43 9Z"/>
    <path fill="#5abf6a" ${M} d="M57 18 L59.6 16 L62 18.6 L59.4 21Z"/>
    <path ${T} d="M50 13 C47 15 48 18 46 20 M44 9 C42 10 41 12 42 14"/>`],
  doctor: [BROWN, (c, r) => `${wash(GOLD, r)}
    <path fill="#f4e7b2" ${S} d="M8 20 H52 V48 H8Z"/>
    <path fill="#e7dbb9" ${M} d="M4 16 C4 12 12 12 12 16 V52 C12 56 4 56 4 52Z"/>
    <path fill="#e7dbb9" ${M} d="M48 16 C48 12 56 12 56 16 V52 C56 56 48 56 48 52Z"/>
    <path ${HATCH} d="M12 42 H48 V48 H12Z"/>
    <path ${T} d="M16 25 H44 M18 29 H42 M16 33 H36 M16 37 H30"/>
    <path fill="${RED}" ${M} d="M36 40 L33 56 L37 53 L39 57 L41 41Z"/>
    <path fill="${RED}" ${M} d="M44 40 L47 56 L43 53 L41 57 L39 41Z"/>
    <circle cx="40" cy="40" r="6" fill="${BLOOD}" ${S}/>
    <path fill="none" stroke="${P}" stroke-width="1" d="M37 40 L40 37 L43 40 L40 43Z"/>`],
  blood_magic: [BLOOD, (c, r) => `${wash(RED, r)}
    <g transform="rotate(35 32 32)">
      <path fill="url(#ink-steel)" ${S} d="M29.6 2 L34.4 2 L34.6 30 L32 36 L29.4 30Z"/>
      <path ${HATCH} d="M32 2 H34.4 L34.6 30 L32 36Z"/>
      <path fill="${RED}" stroke="none" d="M30 24 C31 27 33 27 34.2 24 L34.4 30 L32 35 L29.6 30Z"/>
    </g>
    <path fill="${RED}" ${S} d="M30 20 C36 30 44 36 44 45 C44 53 38 58 31 58 C24 58 18 53 18 45 C18 36 26 30 30 20Z"/>
    <path ${HATCH} d="M37 33 C41 37 44 41 44 45 C44 53 38 58 31 58 C38 54 41 46 37 33Z"/>
    <path ${SHINE} d="M23 44 C23 39 26 36 28 34 C27 38 26 42 26 47Z"/>
    <circle cx="14" cy="58" r="2" fill="${RED}" stroke="${K}" stroke-width="1"/><circle cx="50" cy="56" r="1.4" fill="${RED}" stroke="${K}" stroke-width=".9"/>`],
  adrenaline: [RED, (c, r) => `${wash(c, r)}
    <path fill="${c}" ${S} d="M32 54 C22 46 8 37 8 24 C8 15 15 10 21 10 C26 10 30 13 32 18 C34 13 38 10 43 10 C49 10 56 15 56 24 C56 37 42 46 32 54Z"/>
    <path ${HATCH} d="M43 10 C49 10 56 15 56 24 C56 37 42 46 32 54 C40 44 48 34 48 24 C48 17 46 13 43 10Z"/>
    <path ${SHINE} d="M14 20 C15 16 18 14 21 14 C18 16 17 19 16.6 23Z"/>
    <path fill="none" stroke="${K}" stroke-width="4.6" stroke-linejoin="round" stroke-linecap="round" d="M2 34 H16 L20 26 L26 44 L32 18 L38 40 L42 30 H62"/>
    <path fill="none" stroke="${P}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" d="M2 34 H16 L20 26 L26 44 L32 18 L38 40 L42 30 H62"/>`],
  juggernaut: [STONE, (c, r) => `${wash(c, r)}
    <path fill="url(#ink-stone)" ${S} d="M18 60 C16 46 14 34 16 22 C18 10 26 6 34 6 C44 6 48 14 48 24 C48 30 46 34 46 40 C46 48 48 54 48 60Z"/>
    <path ${CROSS} d="M40 8 C46 12 48 18 48 24 C48 30 46 34 46 40 C46 48 48 54 48 60 H42 C42 48 44 32 40 8Z"/>
    <path fill="${mix(STONE, K, 0.5)}" ${M} d="M18 24 H32 L30 30 H20Z M36 24 H46 L45 30 H37Z"/>
    <path fill="${mix(STONE, K, 0.3)}" ${M} d="M30 26 L35 26 L37 42 C34 44 30 44 28 42Z"/>
    <path fill="none" ${M} d="M22 50 H42"/>
    <path ${T} d="M24 14 L28 18 L26 22 M42 44 L39 48 M20 38 L23 41"/>
    <circle cx="25" cy="27.4" r="1.2" fill="#ffd36b"/><circle cx="41" cy="27.4" r="1.2" fill="#ffd36b"/>
    <path fill="${GREEN}" fill-opacity=".8" ${T} d="M16 18 C20 14 24 16 26 12 C24 18 20 20 16 22Z"/>`],
  priest: [GOLD, (c, r) => `${wash(ARC, r)}
    <path fill="none" stroke="${K}" stroke-width="1.6" d="M32 2 V12 M26 12 L32 4 L38 12"/>
    <path fill="url(#ink-gold)" ${S} d="M20 22 C20 15 25 12 32 12 C39 12 44 15 44 22Z"/>
    <path fill="url(#ink-gold)" ${S} d="M18 24 H46 C46 36 40 44 32 44 C24 44 18 36 18 24Z"/>
    <path ${HATCH} d="M32 24 H46 C46 36 40 44 32 44Z"/>
    <path fill="${K}" d="M22 28 L24 32 L22 36 L20 32Z M42 28 L44 32 L42 36 L40 32Z M30 30 H34 V38 H30Z"/>
    <path fill="none" ${T} d="M18 24 H46"/>
    <path fill="none" stroke="${K}" stroke-width="1.6" d="M32 44 V50 M26 50 H38"/>
    <path fill="${P}" fill-opacity=".9" ${T} d="M30 12 C26 6 32 4 30 0 M36 12 C40 8 36 6 40 2 M24 14 C18 10 22 6 18 4"/>
    <path fill="${P}" fill-opacity=".6" stroke="none" d="${blob(32, 56, 14, r, 0.1, 9, 0.3)}"/>
    ${spark(54, 48, 2.4)}${spark(10, 46, 2)}`],
  eldritch: [PURPLE, (c, r) => {
    let tent = '';
    for (let i = 0; i < 6; i++) {
      const a = 0.35 + i * 0.48 + (i > 2 ? 0.6 : 0), [x1, y1] = polar(32, 32, 28, a), [cx, cy] = polar(32, 32, 20, a + 0.5);
      tent += `<path fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round" d="M32 32 Q${n2(cx)} ${n2(cy)} ${n2(x1)} ${n2(y1)}"/><path fill="none" stroke="${mix(c, K, 0.3)}" stroke-width="2.6" stroke-linecap="round" d="M32 32 Q${n2(cx)} ${n2(cy)} ${n2(x1)} ${n2(y1)}"/>`;
    }
    return `${wash(c, r)}${tent}
    <path fill="${P}" ${S} d="M10 32 C18 20 46 20 54 32 C46 44 18 44 10 32Z"/>
    <path ${HATCH} d="M32 22 C42 23 50 26 54 32 C50 38 42 41 32 42 C40 38 42 26 32 22Z"/>
    <circle cx="32" cy="32" r="8" fill="url(#ink-g-energy)" ${M}/>
    <ellipse cx="32" cy="32" rx="2" ry="6" fill="${K}"/>
    <circle cx="29.4" cy="29" r="1.6" fill="${P}"/>
    <path ${T} d="M14 27 L10 24 M20 23 L18 19 M44 23 L46 19 M50 27 L54 24"/>`;
  }],
  noblesse: [GOLD, (c, r) => `${wash(c, r)}
    <path fill="${BLOOD}" ${S} d="M6 52 C6 44 14 42 32 42 C50 42 58 44 58 52 C58 58 50 60 32 60 C14 60 6 58 6 52Z"/>
    <path ${HATCH} d="M40 43 C52 44 58 46 58 52 C58 58 50 60 32 60 C46 57 48 48 40 43Z"/>
    <path fill="${GOLD}" ${M} d="M6 52 L3 58 L8 55Z M58 52 L61 58 L56 55Z"/>
    ${crown(44, 'url(#ink-gold)', [BLUE, RED, GREEN])}
    ${spark(54, 12, 2.6)}${spark(8, 18, 2)}`],
  taoist: [K, (c, r) => {
    const tri = [[1, 1, 1], [0, 0, 0], [1, 0, 1], [0, 1, 0], [1, 1, 0], [0, 1, 1], [1, 0, 0], [0, 0, 1]];
    let bars = '';
    tri.forEach((t, i) => {
      const a = (i / 8) * 6.283 - Math.PI / 2, deg = n2((a * 180) / Math.PI + 90);
      const [x, y] = polar(32, 32, 22, a);
      t.forEach((full, j) => {
        bars += `<g transform="translate(${n2(x)} ${n2(y)}) rotate(${deg})">${full ? `<rect x="-5" y="${-3 + j * 2.4}" width="10" height="1.6" fill="${K}"/>` : `<rect x="-5" y="${-3 + j * 2.4}" width="4" height="1.6" fill="${K}"/><rect x="1" y="${-3 + j * 2.4}" width="4" height="1.6" fill="${K}"/>`}</g>`;
      });
    });
    return `${wash(RED, r)}
    <path fill="#e2cfa0" ${S} d="${poly(Array.from({ length: 8 }, (_, i) => polar(32, 32, 29, (i / 8) * 6.283 - Math.PI / 2 + Math.PI / 8)))}"/>
    <path ${HATCH} d="${poly([[32, 32], ...Array.from({ length: 3 }, (_, i) => polar(32, 32, 29, (i / 8) * 6.283 + Math.PI / 8))])}"/>
    ${bars}
    <circle cx="32" cy="32" r="12" fill="${P}" ${S}/>
    <path fill="${K}" d="M32 20 A12 12 0 0 1 32 44 A6 6 0 0 1 32 32 A6 6 0 0 0 32 20Z"/>
    <circle cx="32" cy="26" r="2" fill="${K}"/><circle cx="32" cy="38" r="2" fill="${P}"/>`;
  }],
  raven_feather: [K, (c, r) => {
    let barbs = '';
    for (let i = 0; i < 9; i++) {
      const t = 0.15 + i * 0.09, x = 14 + t * 36, y = 54 - t * 46;
      barbs += `M${n2(x)} ${n2(y)} L${n2(x - 9 + i * 0.4)} ${n2(y - 3)} M${n2(x)} ${n2(y)} L${n2(x + 5)} ${n2(y + 8 - i * 0.4)} `;
    }
    return `${wash(ARC, r)}
    <path fill="#3a3448" ${S} d="M50 4 C58 10 54 26 44 38 C38 45 30 50 22 50 C20 44 22 36 28 28 C34 18 42 8 50 4Z"/>
    <path fill="none" stroke="${mix(ARC, P, 0.3)}" stroke-width=".8" d="${barbs}"/>
    <path fill="none" stroke="${K}" stroke-width="2.2" stroke-linecap="round" d="M50 6 C42 20 30 38 14 58"/>
    <path fill="none" stroke="${P}" stroke-width=".8" stroke-linecap="round" d="M48 10 C40 22 30 36 20 50"/>
    <path fill="#3a3448" ${M} d="M24 46 L18 46 L22 42Z M34 40 L30 36 L35 36Z"/>
    ${spark(14, 16, 2.4)}${spark(56, 46, 2)}`;
  }],
  wolf_fang: [P, (c, r) => `${wash(STONE, r)}
    <path fill="none" stroke="${BROWN}" stroke-width="2" stroke-linecap="round" d="M8 6 C12 20 22 26 32 26 C42 26 52 20 56 6"/>
    <path fill="none" stroke="${K}" stroke-width=".7" stroke-dasharray="1.6 1.6" d="M8 6 C12 20 22 26 32 26 C42 26 52 20 56 6"/>
    <rect x="27" y="23" width="10" height="7" rx="2" fill="url(#ink-gold)" ${M}/>
    <path fill="${P}" ${S} d="M27 30 H37 C38 40 36 50 32 60 C30 52 26 42 27 30Z"/>
    <path ${HATCH} d="M32 30 H37 C38 40 36 50 32 60 C33 50 34 40 32 30Z"/>
    <path ${T} d="M29 34 C29 40 30 46 31 52"/>
    <path fill="${RED}" fill-opacity=".8" stroke="none" d="M31 56 C31.6 57 32 58 32 60 C31 58 30.6 57 31 56Z"/>
    <circle cx="20" cy="24" r="1.8" fill="${BLUE}" stroke="${K}" stroke-width=".8"/><circle cx="44" cy="24" r="1.8" fill="${BLUE}" stroke="${K}" stroke-width=".8"/>`],
  iron_ring: [STONE, (c, r) => `${wash(c, r)}
    <ellipse cx="32" cy="38" rx="20" ry="18" fill="none" stroke="${K}" stroke-width="11"/>
    <ellipse cx="32" cy="38" rx="20" ry="18" fill="none" stroke="url(#ink-steel)" stroke-width="7"/>
    <path fill="none" stroke="${K}" stroke-width=".7" d="M14 30 L17 32 M13 40 L16 40 M16 48 L19 46 M48 48 L45 46 M51 40 L48 40 M50 30 L47 32"/>
    <path fill="url(#ink-steel)" ${S} d="M22 22 L26 10 H38 L42 22Z"/>
    ${gem(32, 14, 6, BLUE)}
    <path fill="none" stroke="${P}" stroke-width="1.4" stroke-linecap="round" d="M18 32 C20 26 24 23 28 22"/>`],
  mana_vial: [BLUE, (c, r) => `${wash(c, r)}${corkFlask(32, 34, 1.9, c)}${spark(52, 14, 2.4)}${spark(12, 50, 2)}`],
  eternal_candle: [GOLD, (c, r) => `${wash(c, r)}
    ${glow(32, 14, 12, '#ffd36b', 0.35)}
    ${flame(32, 17, 13)}
    <path stroke="${K}" stroke-width="1.6" d="M32 17 V21"/>
    <path fill="${P}" ${S} d="M24 21 C27 20 37 20 40 21 V52 H24Z"/>
    <path ${HATCH} d="M34 21 C36 21 38 21 40 21 V52 H34Z"/>
    <path fill="${P}" ${M} d="M27 21 C27 25 26 28 27 30 C28 28 28.6 25 29 21Z M37 21 C37 24 38 26 37.4 28 C36.4 26 36 24 36 21Z"/>
    <path fill="url(#ink-gold)" ${S} d="M14 52 H50 C50 56 46 58 32 58 C18 58 14 56 14 52Z"/>
    <path fill="none" stroke="${K}" stroke-width="2" d="M50 53 C56 52 58 56 54 58"/>`],
  old_coin: [GOLD, (c, r) => `${wash(c, r)}
    ${coin(26, 40, 16, `<path fill="${K}" fill-opacity=".75" d="M20 46 C20 38 23 33 28 32 C30 30 33 31 33 34 C35 35 34 37 32 37 C33 40 33 44 32 47Z"/><circle cx="29.5" cy="34.5" r=".8" fill="${GOLD}"/>`)}
    ${coin(46, 22, 11, `<path fill="none" stroke="${K}" stroke-width="1.2" d="${star4(46, 22, 5, 1)}"/>`)}
    ${spark(56, 46, 2.4)}${spark(10, 12, 2)}`],
  hunter_badge: [RED, (c, r) => `${wash(c, r)}
    <path fill="${c}" ${M} d="M22 40 L16 62 L22 58 L26 63 L30 44Z M42 40 L48 62 L42 58 L38 63 L34 44Z"/>
    <circle cx="32" cy="28" r="20" fill="url(#ink-gold)" ${S}/>
    <circle cx="32" cy="28" r="14" fill="${P}" ${M}/>
    <circle cx="32" cy="28" r="9" fill="none" stroke="${c}" stroke-width="2.4"/>
    <circle cx="32" cy="28" r="3.6" fill="${c}" stroke="${K}" stroke-width="1"/>
    <path fill="none" stroke="${K}" stroke-width="1.2" d="M32 12 V20 M32 36 V44 M16 28 H24 M40 28 H48"/>
    <path ${HATCH} d="M52 28 A20 20 0 0 1 32 48 A20 20 0 0 1 18 42 L22 38 A14 14 0 0 0 46 28Z"/>`],
  rosary: [BROWN, (c, r) => {
    const beads = [];
    for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + 0.5 + (i / 15) * (Math.PI * 2 - 1); beads.push(polar(32, 26, 19, a)); }
    return `${wash(GOLD, r)}
    <path fill="none" stroke="${K}" stroke-width=".9" d="${smooth(beads, false)}"/>
    ${beads.map(([x, y], i) => `<circle cx="${n2(x)}" cy="${n2(y)}" r="${i % 5 === 0 ? 3 : 2.2}" fill="${i % 5 === 0 ? RED : BROWN}" stroke="${K}" stroke-width="1"/>`).join('')}
    <path fill="none" stroke="${K}" stroke-width=".9" d="M27 8 C29 12 31 14 32 18 C33 14 35 12 37 8 M32 18 V40"/>
    <circle cx="32" cy="40" r="2.4" fill="${BROWN}" stroke="${K}" stroke-width="1"/>
    <path fill="url(#ink-gold)" ${S} d="M29.6 44 H34.4 V48 H38 V52 H34.4 V61 H29.6 V52 H26 V48 H29.6Z"/>
    <path ${HATCH} d="M32 44 H34.4 V48 H38 V52 H34.4 V61 H32Z"/>`;
  }],
  traveler_boots: [LEATHER, (c, r) => `${wash(c, r)}
    <path fill="${c}" ${S} d="M20 6 H38 L37 36 C44 38 54 42 56 48 C57 52 56 56 52 56 H14 C12 56 11 54 12 50 L15 38 C17 28 19 16 20 6Z"/>
    <path ${HATCH} d="M30 6 H38 L37 36 C44 38 54 42 56 48 C50 46 42 44 34 42 C35 30 33 16 30 6Z"/>
    <path fill="${mix(c, K, 0.4)}" ${M} d="M12 56 H54 C56 56 57 58 56 60 H12 C10 60 10 56 12 56Z"/>
    <path fill="${mix(c, P, 0.3)}" ${M} d="M18 6 C24 4 34 4 40 6 L39.6 12 C34 10 24 10 18.6 12Z"/>
    <path ${T} d="M23 18 L33 18 M22.6 23 L33 23 M22.2 28 L33 28"/>
    <path fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="1.6 1.6" d="M14 50 C24 50 40 50 52 52"/>
    <path ${T} d="M4 34 H10 M2 40 H8 M6 46 H10"/>`],
  quartz_lens: [ICE, (c, r) => `${wash(c, r)}
    <path stroke="${K}" stroke-width="8" stroke-linecap="round" d="M40 40 L57 57"/>
    <path stroke="${BROWN}" stroke-width="4.6" stroke-linecap="round" d="M41 41 L57 57"/>
    <path fill="none" stroke="${K}" stroke-width=".7" d="M46 48 L48 46 M50 52 L52 50"/>
    <circle cx="26" cy="26" r="18" fill="url(#ink-gold)" ${S}/>
    <circle cx="26" cy="26" r="14" fill="url(#ink-ice)" fill-opacity=".85" ${M}/>
    <path ${HATCH} d="M40 26 A14 14 0 0 1 26 40 A14 14 0 0 1 14 33 C24 37 36 34 40 26Z"/>
    <path ${SHINE} d="M16 22 C17 17 21 14 26 13 C21 16 19 19 18.6 25Z"/>
    ${spark(28, 28, 4)}`],
  sage_bundle: [GREEN, (c, r) => {
    let leaves = '';
    for (let i = 0; i < 9; i++) {
      const y = 10 + i * 4.4, s = i % 2 ? 1 : -1, x = 32 + s * (5 + (i % 3));
      leaves += `<g transform="translate(${x} ${y}) rotate(${s * (30 + i * 3)})"><path fill="${i % 3 ? mix(c, P, 0.3) : mix(c, '#8ab0a0', 0.3)}" stroke="${K}" stroke-width="1" d="M-7 0 C-3 -4 3 -4 7 0 C3 4 -3 4 -7 0Z"/><path stroke="${K}" stroke-width=".6" d="M-7 0 H5"/></g>`;
    }
    return `${wash(c, r)}
    <path fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round" d="M30 6 L31 60 M34 6 L33 60 M28 12 L30 58"/>
    <path fill="none" stroke="${BROWN}" stroke-width="1.2" stroke-linecap="round" d="M30 6 L31 60 M34 6 L33 60"/>
    ${leaves}
    <path fill="${RED}" ${M} d="M26 46 C30 44 34 44 38 46 L38 50 C34 48 30 48 26 50Z"/>
    <path fill="${RED}" ${M} d="M32 48 L26 58 L30 56 Z M32 48 L38 58 L34 56Z"/>
    <path fill="${RED}" fill-opacity=".5" ${T} d="M48 50 C52 46 56 50 52 54 C50 56 48 56 48 54Z"/>`;
  }],
  frost_shard: [ICE, (c, r) => {
    const shard = (x, y, a, L, W) => { const tip = polar(x, y, L, a), base = polar(x, y, -L * 0.2, a), s1 = polar(x, y, L * 0.4, a + W), s2 = polar(x, y, L * 0.4, a - W); return `<path fill="url(#ink-ice)" ${S} d="${poly([base, s1, tip, s2])}"/><path ${HATCH} d="${poly([base, tip, s2])}"/><path fill="none" stroke="${K}" stroke-width=".7" d="${poly([base, tip], false)}"/>`; };
    return `${wash(c, r)}
    ${shard(26, 50, -1.95, 34, 0.32)}${shard(38, 52, -1.25, 26, 0.36)}${shard(20, 54, -2.6, 16, 0.4)}
    <path fill="${P}" fill-opacity=".7" ${T} d="${blob(32, 56, 18, r, 0.1, 9, 0.25)}"/>
    ${spark(48, 12, 2.6)}${spark(12, 18, 2)}
    ${[[50, 30], [10, 36], [56, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${P}" stroke="${K}" stroke-width=".8"/>`).join('')}`;
  }],
  arcane_fragment: [ARC, (c, r) => `${wash(c, r)}
    ${glow(32, 32, 20, c, 0.25)}
    <path fill="url(#ink-stone)" ${S} d="M14 18 L32 6 L50 16 L54 38 L40 56 L18 52 L10 34Z"/>
    <path ${CROSS} d="M50 16 L54 38 L40 56 L36 48 L44 34Z"/>
    <path fill="none" stroke="${K}" stroke-width="1.2" stroke-linejoin="round" d="M32 6 L30 18 L36 26 L34 36 M10 34 L20 36 L26 46 M40 56 L36 48"/>
    <path fill="none" stroke="${K}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" d="M24 22 L32 40 L40 22 M27 30 H37"/>
    <path fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M24 22 L32 40 L40 22 M27 30 H37"/>
    <path fill="none" stroke="${P}" stroke-width=".7" stroke-linecap="round" d="M24 22 L32 40 L40 22"/>
    ${spark(56, 8, 2.6)}${spark(8, 52, 2)}`],

  // ===== artefatos =====
  phoenix_heart: [FIRE, (c, r) => `${artBack(c, r)}
    ${wing(24, 30, -1, 1, '#f59a3a')}${wing(40, 30, 1, 1, '#f59a3a')}
    <path fill="url(#ink-g-fire)" ${M} d="${flameFan(32, 48, 22, -Math.PI * 0.8, -Math.PI * 0.2, 4, r)}"/>
    <path fill="${RED}" ${S} d="M32 50 C25 44 16 38 16 29 C16 23 20 20 24 20 C28 20 31 22 32 26 C33 22 36 20 40 20 C44 20 48 23 48 29 C48 38 39 44 32 50Z"/>
    <path ${HATCH} d="M40 20 C44 20 48 23 48 29 C48 38 39 44 32 50 C38 42 43 35 43 29 C43 24 42 22 40 20Z"/>
    <path ${SHINE} d="M20 27 C21 24 23 23 25 23 C23 25 22.4 27 22.2 30Z"/>
    ${flame(32, 38, 9, '#ffd36b')}`],
  forbidden_grimoire: [PURPLE, (c, r) => `${artBack(c, r)}
    ${book(14, 12, 34, 40, mix(c, K, 0.45), '#a9a8a2')}
    <path fill="none" stroke="${K}" stroke-width="3.4" d="M10 24 L54 40 M10 44 L54 22"/>
    <path fill="none" stroke="url(#ink-steel)" stroke-width="1.8" stroke-dasharray="3 1.4" d="M10 24 L54 40 M10 44 L54 22"/>
    <path fill="${P}" ${M} d="M22 32 C26 26 36 26 40 32 C36 38 26 38 22 32Z"/>
    <circle cx="31" cy="32" r="3.6" fill="url(#ink-g-energy)" stroke="${K}" stroke-width="1"/>
    <ellipse cx="31" cy="32" rx="1" ry="2.6" fill="${K}"/>
    <rect x="27" y="40" width="8" height="7" rx="1.4" fill="url(#ink-steel)" ${M}/>
    <path fill="none" stroke="${K}" stroke-width="1.4" d="M28.4 40 V37.6 C28.4 34.6 33.6 34.6 33.6 37.6 V40"/>`],
  broken_hourglass: [GOLD, (c, r) => `${artBack(ARC, r)}${hourglass(32, 32, true)}
    <path fill="url(#ink-ice)" ${M} d="M48 14 L53 10 L52 17Z M50 46 L56 48 L51 52Z M12 22 L16 18 L17 24Z"/>
    <circle cx="44" cy="40" r="1" fill="${GOLD}" stroke="${K}" stroke-width=".6"/><circle cx="47" cy="44" r=".8" fill="${GOLD}" stroke="${K}" stroke-width=".6"/>`],
  abyss_eye: [PURPLE, (c, r) => {
    let claws = '';
    for (let i = 0; i < 4; i++) {
      const a = Math.PI * 0.25 + (i * Math.PI) / 2, [x0, y0] = polar(32, 32, 13, a), [x1, y1] = polar(32, 32, 22, a + 0.35), [cx, cy] = polar(32, 32, 20, a - 0.2);
      claws += `<path fill="url(#ink-gold)" ${M} d="M${n2(x0 - 2)} ${n2(y0)} Q${n2(cx)} ${n2(cy)} ${n2(x1)} ${n2(y1)} Q${n2(cx + 1)} ${n2(cy + 1)} ${n2(x0 + 2)} ${n2(y0 + 1)}Z"/>`;
    }
    return `${artBack(c, r)}${claws}
    <circle cx="32" cy="32" r="14" fill="${K}" ${S}/>
    <circle cx="32" cy="32" r="11" fill="url(#ink-g-energy)"/>
    <ellipse cx="32" cy="32" rx="3" ry="9" fill="${K}"/>
    <path fill="none" stroke="${P}" stroke-width=".7" stroke-opacity=".7" d="M25 28 C27 25 30 24 32 24"/>
    <circle cx="27" cy="27" r="2.6" fill="${P}"/><circle cx="36" cy="37" r="1.2" fill="${P}"/>
    <path ${HATCH} d="M46 32 A14 14 0 0 1 32 46 A14 14 0 0 0 46 32Z"/>`;
  }],
  sun_crown: [GOLD, (c, r) => {
    let rays = '';
    for (let i = 0; i < 9; i++) { const a = Math.PI + 0.25 + (i / 8) * (Math.PI - 0.5), [x, y] = polar(32, 40, i % 2 ? 22 : 28, a), [l1, l2] = [polar(32, 40, 12, a - 0.12), polar(32, 40, 12, a + 0.12)]; rays += `<path fill="${i % 2 ? '#f59a3a' : 'url(#ink-gold)'}" ${M} d="${poly([l1, [x, y], l2])}"/>`; }
    return `${artBack(FIRE, r)}${rays}
    <path fill="url(#ink-hot)" ${S} d="M18 40 A14 14 0 0 1 46 40Z"/>
    <path fill="url(#ink-gold)" ${S} d="M12 40 H52 V48 C52 50 50 52 48 52 H16 C14 52 12 50 12 48Z"/>
    <path ${HATCH} d="M36 40 H52 V48 C52 50 50 52 48 52 H36Z"/>
    ${gem(32, 46, 4, RED)}
    <circle cx="20" cy="46" r="2" fill="${BLUE}" stroke="${K}" stroke-width=".9"/><circle cx="44" cy="46" r="2" fill="${BLUE}" stroke="${K}" stroke-width=".9"/>
    <path fill="url(#ink-gold)" stroke="${K}" stroke-width="1" stroke-linejoin="round" d="M30 30 L28 35 L30.6 35 L29 39 L34 33 L31.6 33 L33 30Z"/>`;
  }],
  winter_chalice: [ICE, (c, r) => `${artBack(c, r)}
    ${glow(32, 18, 12, c, 0.35)}
    <path fill="url(#ink-steel)" ${S} d="M14 12 H50 C50 26 42 34 32 34 C22 34 14 26 14 12Z"/>
    <path ${HATCH} d="M34 12 H50 C50 26 42 34 32 34 C38 30 38 20 34 12Z"/>
    <ellipse cx="32" cy="12" rx="18" ry="4" fill="url(#ink-ice)" ${M}/>
    <path fill="url(#ink-steel)" ${M} d="M29 34 H35 L34 48 H30Z"/>
    <path fill="url(#ink-steel)" ${S} d="M20 54 C20 49 26 48 32 48 C38 48 44 49 44 54Z"/>
    <path fill="url(#ink-ice)" ${M} d="M18 13 L16 20 L20 15Z M46 13 L48 21 L44 15Z M28 32 L27 38 L30 33Z"/>
    ${gem(32, 22, 4, ICE)}
    <path fill="none" stroke="${K}" stroke-width="1" d="M26 6 L28 8 M32 3 V6 M38 6 L36 8"/>
    ${spark(32, 8, 2.4)}`],
  reaper_scythe: [K, (c, r) => `${artBack(PURPLE, r)}
    <path stroke="${K}" stroke-width="4.4" stroke-linecap="round" d="M44 60 L22 8"/>
    <path stroke="${BROWN}" stroke-width="2" stroke-linecap="round" d="M44 60 L22 8"/>
    <path fill="none" stroke="${K}" stroke-width="1" d="M38 46 L41 45 M36 41 L39 40"/>
    <path fill="url(#ink-steel)" ${S} d="M23 10 C30 2 48 2 58 14 C48 10 38 12 28 20Z"/>
    <path ${HATCH} d="M28 20 C38 12 48 10 58 14 C48 12 38 14 30 21Z"/>
    <path fill="none" stroke="${P}" stroke-width="1" stroke-linecap="round" d="M30 8 C38 5 46 6 52 9"/>
    <circle cx="23" cy="10" r="2.6" fill="url(#ink-gold)" stroke="${K}" stroke-width="1"/>
    <path fill="${PURPLE}" fill-opacity=".5" stroke="none" d="M8 40 C12 34 16 36 18 32 C18 38 14 42 10 44Z M50 34 C54 30 58 32 60 28 C60 34 56 38 52 38Z"/>`],
  vampire_medallion: [BLOOD, (c, r) => `${artBack(RED, r)}
    <path fill="${K}" ${M} d="M20 30 C14 24 8 24 3 28 C6 30 7 33 6 36 C10 34 13 36 14 39 C16 35 20 36 22 38Z"/>
    <path fill="${K}" ${M} d="M44 30 C50 24 56 24 61 28 C58 30 57 33 58 36 C54 34 51 36 50 39 C48 35 44 36 42 38Z"/>
    <path fill="none" stroke="${GOLD}" stroke-width="1.6" d="M22 6 C24 14 28 18 32 18 C36 18 40 14 42 6"/>
    <circle cx="32" cy="36" r="15" fill="url(#ink-gold)" ${S}/>
    <circle cx="32" cy="36" r="11" fill="none" stroke="${K}" stroke-width="1"/>
    ${runes(32, 36, 13, 10, r, 1, 0.6)}
    ${gem(32, 36, 8, RED)}
    <path fill="${RED}" ${M} d="M32 52 C34 55 34.6 57 32 59 C29.4 57 30 55 32 52Z"/>`],
  winged_boots: [GOLD, (c, r) => `${artBack(ARC, r)}
    ${wing(22, 24, -1, 1.15)}
    <g transform="translate(6 6) scale(.82)">
      <path fill="${LEATHER}" ${S} d="M20 6 H38 L37 36 C44 38 54 42 56 48 C57 52 56 56 52 56 H14 C12 56 11 54 12 50 L15 38 C17 28 19 16 20 6Z"/>
      <path ${HATCH} d="M30 6 H38 L37 36 C44 38 54 42 56 48 C50 46 42 44 34 42 C35 30 33 16 30 6Z"/>
      <path fill="${mix(LEATHER, K, 0.4)}" ${M} d="M12 56 H54 C56 56 57 58 56 60 H12 C10 60 10 56 12 56Z"/>
      <path fill="url(#ink-gold)" ${M} d="M18 6 C24 4 34 4 40 6 L39.6 12 C34 10 24 10 18.6 12Z"/>
      <path fill="none" stroke="${GOLD}" stroke-width="2" d="M17 34 L37 30 M16 42 L42 40"/>
      <path fill="none" stroke="${K}" stroke-width=".7" d="M17 34 L37 30 M16 42 L42 40"/>
    </g>
    ${wing(40, 24, 1, 0.8)}
    <circle cx="22" cy="28" r="2" fill="${RED}" stroke="${K}" stroke-width=".9"/>
    <path ${T} d="M2 40 H8 M4 46 H10 M2 52 H8"/>`],
  titan_bow: [BROWN, (c, r) => `${artBack(RED, r)}
    <path fill="none" stroke="${K}" stroke-width="5.6" stroke-linecap="round" d="M14 6 C34 14 40 30 34 58"/>
    <path fill="none" stroke="url(#ink-gold)" stroke-width="3" stroke-linecap="round" d="M14 6 C34 14 40 30 34 58"/>
    <path fill="none" stroke="${K}" stroke-width=".9" d="M14 6 L34 58"/>
    <rect x="31" y="27" width="6" height="8" rx="1.4" fill="${BLOOD}" ${M} transform="rotate(10 34 31)"/>
    <path stroke="${K}" stroke-width="3.2" stroke-linecap="round" d="M8 46 L56 18"/>
    <path stroke="${BROWN}" stroke-width="1.4" stroke-linecap="round" d="M8 46 L56 18"/>
    <path fill="url(#ink-steel)" ${M} d="M60 15 L51 17 L55 23Z"/>
    <path fill="${RED}" ${M} d="M8 46 L4 44 L6 50 L10 49Z M12 44 L8 41 L9 46Z"/>
    ${spark(54, 44, 2.4)}`],
  philosopher_stone: [RED, (c, r) => `${artBack(c, r)}
    <circle cx="32" cy="32" r="21" fill="none" stroke="${K}" stroke-width="1.4"/>
    <path fill="none" stroke="${K}" stroke-width="1.2" d="${poly([[32, 11], [50.2, 42.5], [13.8, 42.5]])} M14 14 H50 V50 H14Z"/>
    <circle cx="32" cy="32" r="12" fill="none" stroke="${K}" stroke-width="1"/>
    ${glow(32, 32, 11, RED, 0.35)}
    <path fill="${RED}" ${S} d="${blob(32, 32, 9, r, 0.12, 7)}"/>
    <path ${HATCH} d="M41 32 C41 38 37 41 32 41 C37 38 39 35 41 32Z"/>
    <path ${SHINE} d="M27 29 C28 26 30 25 33 25 C30 27 29 29 28.6 31Z"/>
    ${[[32, 11], [50.2, 42.5], [13.8, 42.5]].map(([x, y]) => `<circle cx="${n2(x)}" cy="${n2(y)}" r="2.2" fill="${GOLD}" stroke="${K}" stroke-width=".9"/>`).join('')}`],
  arcane_prism: [ARC, (c, r) => `${artBack(c, r)}
    <path fill="none" stroke="${K}" stroke-width="3.6" d="M2 36 L22 32"/>
    <path fill="none" stroke="${P}" stroke-width="1.6" d="M2 36 L22 32"/>
    ${[RED, '#f59a3a', GOLD, GREEN, BLUE, PURPLE].map((col, i) => `<path stroke="${col}" stroke-width="2.4" d="M40 ${32 + i * 1.6} L62 ${24 + i * 5}"/>`).join('')}
    <path fill="none" stroke="${K}" stroke-width=".6" d="M40 32 L62 24 M40 40 L62 49"/>
    <path fill="url(#ink-ice)" fill-opacity=".9" ${S} d="M32 10 L48 46 H16Z"/>
    <path ${HATCH} d="M32 10 L48 46 H36Z"/>
    <path fill="none" ${M} d="M32 10 L36 46"/>
    <path ${SHINE} d="M30 18 L22 40 L25 40Z"/>`],
  archmage_scepter: [ARC, (c, r) => `${artBack(c, r)}
    <path stroke="${K}" stroke-width="5" stroke-linecap="round" d="M32 26 V60"/>
    <path stroke="url(#ink-gold)" stroke-width="2.6" stroke-linecap="round" d="M32 26 V60"/>
    <path fill="url(#ink-gold)" ${M} d="M27 40 H37 L36 44 H28Z M28 54 H36 L35 57 H29Z"/>
    <path fill="none" stroke="${K}" stroke-width="4.4" stroke-linecap="round" d="M32 28 C22 26 18 18 22 10 C24 6 28 6 30 8 M32 28 C42 26 46 18 42 10 C40 6 36 6 34 8"/>
    <path fill="none" stroke="url(#ink-gold)" stroke-width="2.2" stroke-linecap="round" d="M32 28 C22 26 18 18 22 10 C24 6 28 6 30 8 M32 28 C42 26 46 18 42 10 C40 6 36 6 34 8"/>
    ${glow(32, 16, 9, c, 0.4)}
    <circle cx="32" cy="16" r="6" fill="url(#ink-g-none)" ${S}/>
    <path fill="${P}" d="${star4(32, 16, 3.4, 0.6)}"/>
    ${spark(14, 30, 2.2)}${spark(50, 30, 2.2)}`],
  dragon_scale: [GREEN, (c, r) => {
    let scales = '';
    for (let row = 0; row < 6; row++) for (let i = 0; i < 6 - (row % 2); i++) {
      const x = 10 + i * 9.4 + (row % 2) * 4.7, y = 14 + row * 7.4;
      scales += `<path fill="${mix(c, row % 2 ? P : K, 0.15)}" stroke="${K}" stroke-width="1" d="M${x - 4.6} ${y} C${x - 4.6} ${y + 6} ${x + 4.6} ${y + 6} ${x + 4.6} ${y} C${x + 2} ${y + 2} ${x - 2} ${y + 2} ${x - 4.6} ${y}Z"/>`;
    }
    return `${artBack(c, r)}
    <clipPath id="dscale"><path d="M32 6 C42 10 50 12 54 12 C54 34 46 50 32 58 C18 50 10 34 10 12 C14 12 22 10 32 6Z"/></clipPath>
    <path fill="${mix(c, K, 0.3)}" ${S} d="M32 6 C42 10 50 12 54 12 C54 34 46 50 32 58 C18 50 10 34 10 12 C14 12 22 10 32 6Z"/>
    <g clip-path="url(#dscale)">${scales}</g>
    <path fill="none" ${S} d="M32 6 C42 10 50 12 54 12 C54 34 46 50 32 58 C18 50 10 34 10 12 C14 12 22 10 32 6Z"/>
    <path ${HATCH} d="M32 6 C42 10 50 12 54 12 C54 34 46 50 32 58Z"/>
    <path fill="none" stroke="${GOLD}" stroke-width="1.6" d="M32 10 C40 13 46 15 50 15.4"/>
    ${gem(32, 50, 3.6, RED)}`;
  }],
  titan_gauntlet: [STONE, (c, r) => `${artBack(FIRE, r)}
    <path fill="url(#ink-steel)" ${S} d="M18 58 V42 C14 38 13 30 15 24 L18 16 C19 13 23 13 23 16 L22 24 L24 12 C25 9 29 9 29 12 L28 24 L31 10 C32 7 36 7 36 10 L34 24 L38 13 C39 10 43 11 42 14 L39 28 C42 26 46 26 48 29 C48 32 44 36 42 40 V58Z"/>
    <path ${HATCH} d="M34 24 L38 13 C39 10 43 11 42 14 L39 28 C42 26 46 26 48 29 C48 32 44 36 42 40 V58 H36 C38 46 38 32 34 24Z"/>
    <path ${T} d="M16 28 H22 M22 26 H29 M28.6 25 H35 M19 34 H40"/>
    <rect x="16" y="46" width="28" height="12" rx="2" fill="url(#ink-gold)" ${S}/>
    ${gem(30, 51, 3.6, RED)}
    <path fill="none" stroke="${FIRE}" stroke-width="1.6" stroke-linecap="round" d="M8 22 L4 18 M8 32 L3 32 M50 18 L55 14 M54 26 L59 24"/>`],
  astrolabe: [GOLD, (c, r) => {
    let ticks = '';
    for (let i = 0; i < 48; i++) { const a = (i / 48) * 6.283, [x0, y0] = polar(32, 32, 21, a), [x1, y1] = polar(32, 32, i % 4 ? 22.6 : 24, a); ticks += `M${n2(x0)} ${n2(y0)} L${n2(x1)} ${n2(y1)} `; }
    return `${artBack(ARC, r)}
    <circle cx="32" cy="32" r="25" fill="url(#ink-gold)" ${S}/>
    <circle cx="32" cy="32" r="21" fill="#2f3a6a" ${M}/>
    <path fill="none" stroke="${K}" stroke-width=".6" d="${ticks}"/>
    <path fill="none" stroke="${GOLD}" stroke-width="1.2" d="M32 11 V53 M11 32 H53"/>
    <ellipse cx="32" cy="32" rx="14" ry="9" fill="none" stroke="${GOLD}" stroke-width="1.2" transform="rotate(-25 32 32)"/>
    <circle cx="32" cy="32" r="8" fill="none" stroke="${GOLD}" stroke-width="1" stroke-dasharray="2 1.6"/>
    <path fill="url(#ink-gold)" ${M} d="M32 32 L48 22 L46 26Z M32 32 L18 44 L21 42Z"/>
    <circle cx="32" cy="32" r="2.4" fill="${RED}" stroke="${K}" stroke-width="1"/>
    <path fill="${P}" d="${star4(22, 22, 2, 0.4)} ${star4(42, 42, 1.6, 0.3)} ${star4(40, 18, 1.2, 0.3)}"/>
    <circle cx="32" cy="5" r="3" fill="none" stroke="${K}" stroke-width="2.4"/>`;
  }],
};

const CACHE = new Map();

// HTML da ilustração de um tesouro (relíquia ou artefato); null quando não há desenho
export function treasureIcon(id) {
  const entry = DRAW[id];
  if (!entry) return null;
  if (!CACHE.has(id)) {
    const [c, draw] = entry;
    CACHE.set(id, `<svg class="glyph" viewBox="0 0 64 64" aria-hidden="true"><g filter="url(#ink-wobble)">${draw(c, rng(hash('treasure:' + id)))}</g></svg>`);
  }
  return CACHE.get(id);
}
export const treasureColor = (id) => DRAW[id]?.[0];
