import { ELEM, SPELL_BY_ID } from '../data/spells.js';

// Ilustrações das magias a nanquim, geradas por código: contorno sépia, aguada em gradiente na cor do
// elemento, hachura nas sombras, brilho de papel, respingos e detalhes procedurais (runas, faíscas,
// flocos, chamas). Tudo com semente fixa, então cada ícone sai igual sempre. Um SVG por magia (viewBox 64x64).
export const K = '#2a211b';
export const P = '#fffbe9';
export const S = `stroke="${K}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`; // contorno principal
export const M = `stroke="${K}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`; // contorno médio
export const T = `stroke="${K}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" fill="none"`; // detalhe fino
export const HATCH = 'fill="url(#ink-hatch)" stroke="none"'; // sombra em hachura
export const CROSS = 'fill="url(#ink-cross)" stroke="none"'; // sombra funda em hachura cruzada
export const SHINE = `fill="${P}" fill-opacity=".85" stroke="none"`; // brilho de papel por cima da aguada

// ---------- utilidades ----------
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
export const n2 = (v) => +v.toFixed(2);
export const hash = (str) => [...str].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const polar = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];

// curva suave (Catmull-Rom) passando pelos pontos
export function smooth(pts, closed = true) {
  const n = pts.length;
  const at = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${n2(pts[0][0])} ${n2(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += ` C${n2(p1[0] + (p2[0] - p0[0]) / 6)} ${n2(p1[1] + (p2[1] - p0[1]) / 6)} ${n2(p2[0] - (p3[0] - p1[0]) / 6)} ${n2(p2[1] - (p3[1] - p1[1]) / 6)} ${n2(p2[0])} ${n2(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}
export const poly = (pts, close = true) => 'M' + pts.map(([x, y]) => `${n2(x)} ${n2(y)}`).join(' L') + (close ? 'Z' : '');

// mancha irregular (pedra, poça, aguada)
export function blob(cx, cy, r, rand, jag = 0.15, n = 10, sy = 1) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 - jag + rand() * jag * 2);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sy]);
  }
  return smooth(pts);
}

// estrela de quatro pontas com lados côncavos
export const star4 = (cx, cy, r, k = r * 0.18) =>
  `M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - r}Z`;
export const spark = (x, y, r) => `<path fill="${P}" stroke="${K}" stroke-width=".9" stroke-linejoin="round" d="${star4(x, y, r, r * 0.16)}"/>`;

// raio em camadas: tinta grossa por baixo, cor no meio, fio claro no centro
export const zap = (d, c, w = 3) => `
  <path d="${d}" fill="none" stroke="${K}" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${P}" stroke-width="${n2(w * 0.3)}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".9"/>`;

// linha quebrada entre dois pontos (arco elétrico)
export function jagged(x0, y0, x1, y1, rand, steps = 7, amp = 5) {
  const pts = [[x0, y0]];
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (let i = 1; i < steps; i++) {
    const t = i / steps, o = (rand() * 2 - 1) * amp * (i % 2 ? 1 : -0.6);
    pts.push([x0 + dx * t + nx * o, y0 + dy * t + ny * o]);
  }
  pts.push([x1, y1]);
  return pts;
}

// respingos de tinta e pontilhado
function splatter(rand, c, n = 6, cx = 32, cy = 32, r0 = 24, r1 = 31) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const [x, y] = polar(cx, cy, r0 + rand() * (r1 - r0), rand() * Math.PI * 2);
    s += `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(0.5 + rand() * 1.3)}" fill="${c}" fill-opacity="${n2(0.35 + rand() * 0.4)}"/>`;
  }
  return s;
}
function stipple(rand, n, inside, c = K, rmax = 0.7) {
  let s = '';
  for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) {
    const x = rand() * 64, y = rand() * 64;
    if (!inside(x, y)) continue;
    s += `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(0.3 + rand() * rmax)}" fill="${c}"/>`;
    i++;
  }
  return s;
}

// aguada de fundo: mancha de aquarela na cor do elemento, com borda mais escura onde a tinta secou
export function wash(c, rand) {
  return `
  <path fill="${c}" fill-opacity=".16" stroke="${c}" stroke-opacity=".35" stroke-width=".8" d="${blob(32, 33, 27, rand, 0.1, 12)}"/>
  <path fill="${c}" fill-opacity=".12" stroke="none" d="${blob(30, 30, 18, rand, 0.2, 8)}"/>
  ${splatter(rand, mix(c, K, 0.4), 7)}`;
}

// marquinhas rúnicas em volta de um círculo
const GLYPHS = ['M-1.6 -2 L1.6 2 M1.6 -2 L-1.6 2', 'M0 -2.2 V2.2 M-1.6 -0.6 H1.6', 'M-1.6 2 L0 -2 L1.6 2', 'M-1.5 -2 H1.5 L-1.5 2 H1.5',
  'M0 -2.2 V2.2 M0 -1 L1.6 -2.2 M0 0.6 L-1.6 -0.6', 'M-1.6 -1.6 A1.8 1.8 0 1 0 1.6 -1.6', 'M-1.6 -2 V2 H1.6', 'M0 -2.2 L1.8 0 L0 2.2 L-1.8 0Z'];
export function runes(cx, cy, r, n, rand, sy = 1, w = 0.9) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * sy;
    const deg = sy === 1 ? (a * 180) / Math.PI + 90 : 0;
    s += `<path d="${GLYPHS[Math.floor(rand() * GLYPHS.length)]}" transform="translate(${n2(x)} ${n2(y)}) rotate(${n2(deg)}) scale(1 ${sy === 1 ? 1 : sy * 1.6})" fill="none" stroke="${K}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return s;
}

// chama em leque: pontas alternadas no aro, de a0 a a1 (radianos)
export function flameFan(ox, oy, R, a0, a1, tongues, rand) {
  const pts = [];
  const n = tongues * 2;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const r = i % 2 ? R * (0.7 + rand() * 0.08) : R * (0.92 + rand() * 0.12);
    pts.push(polar(ox, oy, r, a));
  }
  return smooth([[ox, oy], ...pts], true);
}

// ---------- desenhos ----------
// cada desenho recebe a cor do elemento (c), o gradiente do elemento (g) e um gerador com semente (r)
const DRAW = {
  // projétil mágico: estrela de quatro pontas com rastro e centelhas
  magic_bolt: (c, g, r) => `
    ${wash(c, r)}
    <path fill="${c}" fill-opacity=".5" stroke="none" d="M42 22 C32 30 18 42 4 60 C16 50 30 40 46 30Z"/>
    <path ${T} d="M30 33 L13 50 M35 37 L21 52 M27 28 L10 42"/>
    <path ${T} stroke-dasharray="1 3" d="M24 40 L8 56"/>
    <circle cx="41" cy="24" r="15" fill="${c}" fill-opacity=".22"/>
    <circle cx="41" cy="24" r="11" fill="none" stroke="${K}" stroke-width=".7" stroke-dasharray="1.5 2.5"/>
    <path fill="url(#${g})" ${S} d="${star4(41, 24, 19, 3.4)}"/>
    <path ${HATCH} d="M41 24 L60 24 Q44.4 27.4 41 43Z"/>
    <path fill="${P}" stroke="${K}" stroke-width="1" d="${star4(41, 24, 8, 1.5)}"/>
    <path ${SHINE} d="M39 12 Q40 21 31 23 Q39 21 39 12Z"/>
    ${spark(16, 13, 4.5)}${spark(55, 47, 3.5)}${spark(25, 47, 2.6)}${spark(57, 8, 2.2)}`,

  // bola de fogo: esfera incandescente com cauda de chamas
  fireball: (c, g, r) => `
    ${wash(c, r)}
    <path fill="url(#${g})" ${S} d="M31 13 C39 6 55 8 57 22 C59 36 48 43 37 41 C30 45 23 50 14 52 C19 47 20 45 19 43 C13 47 7 49 3 49 C9 42 12 38 15 34 C11 34 8 33 6 32 C13 27 19 25 24 23 C22 20 25 15 31 13Z"/>
    <path ${HATCH} d="M37 41 C48 43 59 36 57 22 C55 34 46 39 37 38 C30 42 22 48 14 52 C23 50 30 45 37 41Z"/>
    <path fill="#f59a3a" ${M} d="M33 18 C39 12 52 14 53 23 C54 32 46 37 38 36 C33 39 27 43 21 44 C24 41 24 39 23 38 C19 40 14 41 11 41 C16 37 19 34 21 32 C25 29 28 27 30 25 C29 23 30 20 33 18Z"/>
    <circle cx="41" cy="25" r="9.5" fill="url(#ink-hot)" ${M}/>
    <path ${SHINE} d="M35 22 C36 18 40 17 43 17 C40 19 38 21 37 25Z"/>
    <path ${T} d="M19 37 C24 33 28 31 33 30 M13 31 C18 29 22 28 26 28"/>
    <circle cx="10" cy="24" r="1.4" fill="${c}" stroke="${K}" stroke-width=".8"/>
    <circle cx="6" cy="40" r="1" fill="${K}"/>
    <circle cx="22" cy="55" r="1.2" fill="${c}" stroke="${K}" stroke-width=".8"/>
    ${spark(57, 46, 2.6)}`,

  // tempestade de raios: nuvem carregada, raio e chuva
  thunderstorm: (c, g, r) => `
    ${wash(c, r)}
    <path fill="url(#ink-cloud)" ${S} d="M12 33 C4 33 3 22 11 21 C10 12 20 8 26 13 C28 5 43 4 45 13 C52 10 61 16 57 25 C62 28 58 36 51 35 L15 35 C14 35 13 34 12 33Z"/>
    <path ${HATCH} d="M9 29 C14 32 22 32 27 30 C33 33 41 33 47 30 C51 32 55 32 58 29 C59 33 56 36 51 35 L15 35 C11 35 8 32 9 29Z"/>
    <path ${T} d="M17 25 C20 22 25 23 27 26 M32 20 C36 17 41 18 43 22 M45 26 C48 24 52 25 53 28"/>
    <path ${SHINE} d="M20 13 C23 10 27 11 28 14 C26 13 22 13 20 16Z M37 7 C40 6 43 7 44 10 C42 9 39 9 37 10Z"/>
    <path ${T} d="M48 39 L45 46 M54 38 L51 45 M52 48 L49 55 M9 39 L6 45 M14 46 L12 51"/>
    <path fill="url(#${g})" ${S} d="M34 33 L24 48 L32 48 L25 63 L44 42 L35 42 L42 33Z"/>
    <path ${HATCH} d="M35 42 L44 42 L25 63 L37 45Z"/>
    <path ${SHINE} d="M36 35 L29 45 L32 45Z"/>
    <path fill="${c}" ${M} d="M17 36 L12 44 L16 44 L12 52 L21 41 L17 41 L20 36Z"/>`,

  // meteoro: rocha com crateras e rastro de fogo
  meteor: (c, g, r) => `
    ${wash(c, r)}
    <path fill="url(#${g})" ${S} d="M1 3 C16 11 31 20 40 29 L27 44 C19 31 10 18 1 3Z"/>
    <path fill="#ffd36b" stroke="none" d="M9 11 C20 19 29 26 36 32 L31 38 C25 30 17 21 9 11Z"/>
    <path ${T} d="M7 19 C13 26 18 32 22 39 M17 5 C25 11 32 15 40 20 M2 13 L6 18"/>
    <path fill="url(#ink-stone)" ${S} d="${blob(42, 42, 14, r, 0.1, 9)}"/>
    <path ${CROSS} d="M54 35 C58 44 54 55 43 56 C50 52 54 45 54 35Z"/>
    <path ${HATCH} d="M53 38 C55 46 51 53 42 55 C48 49 51 44 53 38Z"/>
    <ellipse cx="45" cy="45" rx="4.5" ry="3.6" fill="#5e4f40" ${M}/>
    <path ${T} d="M41.5 44 C43 46.5 47 47.5 48.5 46"/>
    <ellipse cx="36" cy="47" rx="2.4" ry="2" fill="#5e4f40" stroke="${K}" stroke-width="1"/>
    <ellipse cx="47" cy="35" rx="2" ry="1.6" fill="#5e4f40" stroke="${K}" stroke-width="1"/>
    <path fill="none" stroke="#ffd36b" stroke-width="2" stroke-linecap="round" d="M31 39 C32 33 37 29 43 29"/>
    <path ${SHINE} d="M35 36 C37 32 41 31 44 31 C41 33 38 34 36 38Z"/>
    <circle cx="20" cy="44" r="1.4" fill="${c}" stroke="${K}" stroke-width=".8"/>
    <circle cx="30" cy="52" r="1" fill="${K}"/>${spark(58, 18, 2.6)}`,

  // ciclone: funil de faixas espiraladas com detritos voando
  cyclone: (c, g, r) => {
    const bands = [];
    for (let i = 0; i < 6; i++) bands.push({ y: 9 + i * 8.6, w: 26 - i * 4.2, x: 32 + Math.sin(i * 0.95) * 3.2 });
    const left = bands.map((b) => [b.x - b.w, b.y]), right = bands.map((b) => [b.x + b.w, b.y]).reverse();
    const tip = [29, 60];
    const body = smooth([...left, tip, ...right], true);
    const shade = smooth([...bands.map((b) => [b.x + b.w * 0.35, b.y + 2]), tip, ...right], true);
    let arcs = '';
    bands.forEach((b, i) => {
      arcs += `<path ${T} stroke-dasharray="2 2" d="M${n2(b.x - b.w)} ${b.y} C${n2(b.x - b.w)} ${b.y - 4} ${n2(b.x + b.w)} ${b.y - 4} ${n2(b.x + b.w)} ${b.y}"/>`;
      arcs += `<path fill="none" ${i === 0 ? S : M} d="M${n2(b.x - b.w)} ${b.y} C${n2(b.x - b.w)} ${b.y + 5} ${n2(b.x + b.w)} ${b.y + 5} ${n2(b.x + b.w)} ${b.y}"/>`;
    });
    const leaf = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><path fill="${mix(c, K, 0.25)}" stroke="${K}" stroke-width=".9" d="M-3 0 C-1 -2.4 1 -2.4 3 0 C1 2.4 -1 2.4 -3 0Z"/><path stroke="${K}" stroke-width=".6" d="M-3 0 H3"/></g>`;
    return `
    ${wash(c, r)}
    <path fill="url(#${g})" fill-opacity=".75" stroke="none" d="${body}"/>
    <path ${HATCH} d="${shade}"/>
    <path fill="none" ${S} d="${smooth([...left, tip], false)}"/>
    <path fill="none" ${S} d="${smooth([tip, ...right], false)}"/>
    ${arcs}
    <path ${SHINE} d="M10 12 C14 15 24 16 30 15 C24 17 15 17 10 14Z"/>
    <path ${T} d="M50 24 C55 22 58 25 56 28 M10 30 C6 30 5 34 8 35 M48 44 C53 44 54 48 51 50"/>
    ${leaf(56, 15, 30)}${leaf(9, 42, -40)}${leaf(52, 37, 70)}
    <path fill="#8a7a66" stroke="${K}" stroke-width=".9" d="M13 22 l3 -1 l1 2.5 l-3 1.2Z M45 54 l2.6 -.6 l.6 2.2 l-2.8 .8Z"/>
    <path ${T} d="M14 60 C20 57 24 58 27 60 M33 60 C37 57 43 57 48 60"/>`;
  },

  // choque elétrico: arco crepitando entre duas esferas condutoras
  electric_shock: (c, g, r) => {
    const main = jagged(14, 50, 50, 14, r, 8, 5);
    const b1 = jagged(...main[3], main[3][0] - 8, main[3][1] - 10, r, 3, 2);
    const b2 = jagged(...main[5], main[5][0] + 10, main[5][1] + 7, r, 3, 2);
    return `
    ${wash(c, r)}
    <circle cx="12" cy="52" r="10" fill="${c}" fill-opacity=".3"/>
    <circle cx="52" cy="12" r="10" fill="${c}" fill-opacity=".3"/>
    ${zap(poly(b1, false), c, 1.6)}${zap(poly(b2, false), c, 1.6)}
    ${zap(poly(main, false), c, 3.2)}
    <circle cx="12" cy="52" r="6.5" fill="url(#ink-gold)" ${S}/>
    <circle cx="52" cy="12" r="6.5" fill="url(#ink-gold)" ${S}/>
    <path ${HATCH} d="M18 52 A6 6 0 0 1 12 58 A7 7 0 0 0 18 52Z M58 12 A6 6 0 0 1 52 18 A7 7 0 0 0 58 12Z"/>
    <path ${SHINE} d="M8.5 50 A4 4 0 0 1 12 47.5 A4.5 4.5 0 0 0 9.5 51Z M48.5 10 A4 4 0 0 1 52 7.5 A4.5 4.5 0 0 0 49.5 11Z"/>
    <path ${T} d="M3 44 L6 46 M4 59 L7 57 M20 61 L19 58 M44 3 L45 6 M60 5 L57 7 M61 20 L58 19"/>
    ${spark(26, 22, 2.6)}${spark(42, 44, 2.2)}`;
  },

  // raio de energia: cristal de energia facetado com anéis de impulso
  energy_bolt: (c, g, r) => `
    ${wash(c, r)}
    <ellipse cx="15" cy="49" rx="5" ry="10" transform="rotate(45 15 49)" fill="none" stroke="${K}" stroke-width="1.2"/>
    <ellipse cx="20" cy="44" rx="6.5" ry="13" transform="rotate(45 20 44)" fill="${c}" fill-opacity=".18" ${M}/>
    <ellipse cx="27" cy="37" rx="7.5" ry="15" transform="rotate(45 27 37)" fill="none" ${S}/>
    <path fill="${c}" fill-opacity=".3" stroke="none" d="M60 4 L51 31 L22 44 L33 15Z" transform="translate(2 2)"/>
    <path fill="url(#${g})" ${S} d="M60 4 L51 31 L22 44 L33 15Z"/>
    <path ${HATCH} d="M60 4 L51 31 L22 44Z"/>
    <path fill="none" ${M} d="M60 4 L22 44"/>
    <path ${SHINE} d="M57 7 L36 17 L31 24 L38 19Z"/>
    <path fill="none" stroke="${P}" stroke-width="1.2" stroke-linecap="round" d="M54 12 L36 30"/>
    <circle cx="10" cy="58" r="1.6" fill="${c}" stroke="${K}" stroke-width=".8"/>
    <circle cx="6" cy="51" r="1" fill="${K}"/><circle cx="16" cy="60" r="1" fill="${K}"/>
    ${spark(50, 40, 3.2)}${spark(14, 26, 2.4)}`,

  // incineração: leque de chamas em três camadas saindo da ponta do cajado
  incineration: (c, g, r) => {
    const a0 = -Math.PI * 0.47, a1 = -Math.PI * 0.03;
    return `
    ${wash(c, r)}
    <path fill="url(#${g})" ${S} d="${flameFan(9, 55, 54, a0, a1, 5, r)}"/>
    <path ${HATCH} d="${flameFan(9, 55, 53, a1 - 0.35, a1, 1, r)}"/>
    <path fill="#f59a3a" ${M} d="${flameFan(9, 55, 39, a0 + 0.08, a1 - 0.06, 4, r)}"/>
    <path fill="#ffd36b" stroke="${K}" stroke-width="1.1" d="${flameFan(9, 55, 24, a0 + 0.15, a1 - 0.12, 3, r)}"/>
    <path ${SHINE} d="${flameFan(9, 55, 12, a0 + 0.3, a1 - 0.3, 2, r)}"/>
    <path ${T} d="M20 30 C24 26 28 24 32 22 M30 44 C36 40 40 39 46 38"/>
    <path stroke="${K}" stroke-width="3" stroke-linecap="round" d="M2 62 L7 57"/>
    <circle cx="9" cy="55" r="3.6" fill="${c}" ${M}/>
    <circle cx="8" cy="54" r="1.1" fill="${P}"/>
    <circle cx="60" cy="16" r="1.4" fill="${c}" stroke="${K}" stroke-width=".8"/>
    <circle cx="48" cy="6" r="1" fill="${K}"/><circle cx="62" cy="30" r="1" fill="${K}"/>
    ${spark(58, 6, 2.4)}`;
  },

  // nevasca: floco de neve ramificado com rajadas de vento
  blizzard: (c, g, r) => {
    let arms = '';
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 - Math.PI / 2;
      const p = (rr, da = 0) => polar(32, 32, rr, a + da);
      const [x0, y0] = p(5), [x1, y1] = p(25);
      arms += `M${n2(x0)} ${n2(y0)} L${n2(x1)} ${n2(y1)}`;
      for (const [at, len] of [[11, 7], [18, 5.5]]) {
        const [bx, by] = p(at);
        for (const s of [-1, 1]) {
          const [ex, ey] = polar(bx, by, len, a + s * 0.9);
          arms += ` M${n2(bx)} ${n2(by)} L${n2(ex)} ${n2(ey)}`;
        }
      }
    }
    const tips = Array.from({ length: 6 }, (_, k) => polar(32, 32, 27.5, (k * Math.PI) / 3 - Math.PI / 2));
    return `
    ${wash(c, r)}
    <circle cx="32" cy="32" r="22" fill="url(#${g})" fill-opacity=".45"/>
    <path ${T} d="M4 18 C10 12 18 12 22 16 M42 50 C48 54 56 52 60 46 M6 46 C9 50 14 51 17 49 M46 6 C51 5 56 8 57 12"/>
    <path fill="none" stroke="${K}" stroke-width="6" stroke-linecap="round" d="${arms}"/>
    <path fill="none" stroke="${mix(c, P, 0.55)}" stroke-width="2.8" stroke-linecap="round" d="${arms}"/>
    ${tips.map(([x, y]) => `<circle cx="${n2(x)}" cy="${n2(y)}" r="2.2" fill="${P}" stroke="${K}" stroke-width="1.2"/>`).join('')}
    <path fill="${P}" ${M} d="${poly(Array.from({ length: 6 }, (_, k) => polar(32, 32, 6, (k * Math.PI) / 3)))}"/>
    <path ${HATCH} d="${poly([[32, 32], polar(32, 32, 6, 0), polar(32, 32, 6, Math.PI / 3), polar(32, 32, 6, (2 * Math.PI) / 3)])}"/>
    ${stipple(r, 14, (x, y) => Math.hypot(x - 32, y - 32) > 26 && Math.hypot(x - 32, y - 32) < 31, K, 0.6)}
    ${spark(54, 26, 2.4)}${spark(10, 34, 2)}`;
  },

  // tsunami: onda que se enrola, crista de espuma e respingos
  tsunami: (c, g, r) => {
    const crest = [[28, 17], [34, 13.5], [40, 11.5], [46, 11], [52, 12.5], [57, 16], [60, 21]];
    return `
    ${wash(c, r)}
    <path fill="url(#${g})" ${S} d="M2 58 C6 40 14 24 30 16 C42 10 56 12 60 24 C62 32 54 38 48 33 C44 29 48 24 52 26 C47 20 38 22 32 30 C26 38 28 50 36 58Z"/>
    <path fill="${mix(c, K, 0.3)}" ${M} d="M52 26 C47 20 38 22 32 30 C28 36 28 44 31 50 C32 42 36 34 42 30 C46 28 50 28 52 26Z"/>
    <path ${CROSS} d="M50 25 C45 22 38 24 34 30 C31 35 30 41 31 46 C33 38 37 32 42 29 C45 27 48 26 50 25Z"/>
    <path ${HATCH} d="M2 58 C6 46 10 38 16 32 C12 40 10 50 12 58Z"/>
    <path fill="none" stroke="${P}" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".9" d="M14 44 C17 34 22 27 28 23 M20 50 C22 42 25 37 29 33"/>
    ${crest.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${2 + (i % 3) * 0.6}" fill="${P}" stroke="${K}" stroke-width="1"/>`).join('')}
    <circle cx="48" cy="5" r="1.4" fill="${P}" stroke="${K}" stroke-width=".8"/>
    <circle cx="56" cy="7" r="1.1" fill="${P}" stroke="${K}" stroke-width=".8"/>
    <circle cx="40" cy="5.5" r=".9" fill="${K}"/>
    <path fill="none" ${S} d="M1 61 C9 58 15 62 23 60 C31 58 37 62 45 60 C52 58 57 61 63 60"/>
    <path ${T} d="M40 56 C44 54 48 55 50 57 M50 52 C53 50 57 51 59 53"/>`;
  },

  // espírito: fantasma-chama com luz interna, rosto e fiapos
  spirit: (c, g, r) => `
    ${wash(c, r)}
    <path fill="${c}" fill-opacity=".35" stroke="none" d="M46 46 C52 50 56 56 60 58 C54 58 50 55 46 52Z M14 50 C10 54 6 56 3 56 C7 52 9 49 12 46Z"/>
    <path fill="url(#${g})" ${S} d="M32 5 C44 5 51 14 50 27 C49 39 45 46 41 52 C40 48 37 47 35 51 C33 56 29 59 24 59 C27 54 25 51 22 50 C15 44 13 34 15 24 C17 13 23 5 32 5Z"/>
    <path ${HATCH} d="M50 27 C49 39 45 46 41 52 C40 48 37 47 35 51 C38 44 44 38 46 27 C47 20 45 14 41 10 C47 13 50 19 50 27Z"/>
    <ellipse cx="31" cy="29" rx="12" ry="13" fill="${P}" fill-opacity=".35"/>
    <path ${SHINE} d="M22 14 C26 9 33 9 36 12 C31 12 26 14 23 19Z"/>
    <ellipse cx="26" cy="28" rx="3" ry="4.4" fill="${K}"/>
    <ellipse cx="38" cy="28" rx="3" ry="4.4" fill="${K}"/>
    <circle cx="25" cy="26.4" r="1" fill="${P}"/><circle cx="37" cy="26.4" r="1" fill="${P}"/>
    <path ${T} stroke-width="1.4" d="M28 37 C30 40 34 40 36 37"/>
    <path ${T} d="M20 46 C22 49 22 52 20 55 M44 44 C46 47 47 50 46 53"/>
    <circle cx="56" cy="14" r="3" fill="${c}" ${M}/><circle cx="55" cy="13" r=".9" fill="${P}"/>
    <circle cx="8" cy="22" r="2" fill="${c}" stroke="${K}" stroke-width="1.1"/>
    ${spark(10, 8, 2.6)}${spark(56, 34, 2)}`,

  // satélite: orbe planetário com anel de órbita, lua craterada e estrelas
  satellite: (c, g, r) => `
    ${wash(c, r)}
    <path fill="none" stroke="${K}" stroke-width="1.4" stroke-dasharray="4 3" d="M7 42 C2 32 22 18 40 14 C56 11 64 16 58 24"/>
    <circle cx="30" cy="34" r="15" fill="url(#${g})" ${S}/>
    <path ${HATCH} d="M45 34 A15 15 0 0 1 30 49 A15 15 0 0 1 17 41 C26 46 40 44 45 34Z"/>
    <path ${T} d="M17 29 C23 27 31 28 37 26 M16 36 C24 34 35 36 44 33 M19 42 C26 41 33 43 40 41"/>
    <path ${SHINE} d="M21 27 C23 22 27 20 31 20 C27 22 24 25 23 30Z"/>
    <path fill="none" ${S} d="M4 44 C0 38 20 28 40 24 C54 21 63 22 61 28"/>
    <path fill="none" ${S} stroke-width="2" d="M45 32 C52 30 58 31 56 35 C53 40 32 46 18 47"/>
    <circle cx="53" cy="14" r="6" fill="#f4e7b2" ${S}/>
    <path ${HATCH} d="M59 14 A6 6 0 0 1 53 20 A6 6 0 0 1 48.5 18 C53 19 57 17 59 14Z"/>
    <circle cx="51" cy="12" r="1.4" fill="none" stroke="${K}" stroke-width=".8"/>
    <circle cx="55" cy="16" r="1" fill="none" stroke="${K}" stroke-width=".8"/>
    ${spark(10, 10, 3)}${spark(22, 6, 1.8)}${spark(56, 54, 2.6)}${spark(8, 58, 1.8)}`,

  // raio arcano: emissor rúnico disparando um feixe
  arcane_ray: (c, g, r) => `
    ${wash(c, r)}
    <path fill="${c}" fill-opacity=".3" stroke="none" d="M22 24 L63 6 L63 30 L22 42Z"/>
    <path fill="url(#ink-beam)" ${S} d="M22 27 L62 11 L62 25 L22 38Z"/>
    <path fill="${P}" stroke="none" fill-opacity=".9" d="M24 31 L61 16 L61 19 L24 34Z"/>
    <path ${T} d="M30 23 L42 18 M36 39 L50 34 M46 14 L56 10 M50 32 L60 29"/>
    <circle cx="17" cy="32" r="14" fill="${P}" ${S}/>
    <circle cx="17" cy="32" r="10" fill="none" stroke="${K}" stroke-width="1"/>
    ${runes(17, 32, 12, 8, r)}
    <circle cx="17" cy="32" r="6.5" fill="url(#${g})" ${M}/>
    <path ${HATCH} d="M23.5 32 A6.5 6.5 0 0 1 17 38.5 A6.5 6.5 0 0 0 23.5 32Z M22.5 35 A6.5 6.5 0 0 1 14 38 C18 38 21 37 22.5 35Z"/>
    <circle cx="15" cy="30" r="1.8" fill="${P}"/>
    ${spark(44, 46, 2.6)}${spark(52, 4, 2.2)}`,

  // zona elétrica: círculo rúnico no chão em perspectiva com raios subindo
  electric_zone: (c, g, r) => `
    ${wash(c, r)}
    <ellipse cx="32" cy="45" rx="29" ry="14" fill="url(#${g})" fill-opacity=".55" ${S}/>
    <ellipse cx="32" cy="45" rx="23" ry="10.5" fill="none" stroke="${K}" stroke-width="1.1"/>
    ${runes(32, 45, 26, 12, r, 14 / 29, 0.8)}
    <ellipse cx="32" cy="45" rx="15" ry="6.5" fill="none" stroke="${K}" stroke-width="1.2" stroke-dasharray="3 2.5"/>
    <path ${HATCH} d="M3 45 C3 53 16 59 32 59 C48 59 61 53 61 45 C58 51 46 55 32 55 C18 55 6 51 3 45Z"/>
    <path fill="none" ${T} d="${poly([[20, 42], [44, 42], [32, 51]])} ${poly([[20, 48], [44, 48], [32, 39]])}"/>
    ${zap(poly(jagged(32, 45, 31, 20, r, 4, 2.5), false), c, 1.6)}
    <path fill="url(#ink-gold)" ${S} d="M24 4 L15 22 L21 22 L14 38 L30 17 L23 17 L30 4Z"/>
    <path ${HATCH} d="M23 17 L30 17 L14 38 L25 19Z"/>
    <path ${SHINE} d="M25 6 L18 20 L21 20Z"/>
    <path fill="${c}" ${M} d="M46 12 L40 24 L44 24 L39 36 L51 21 L46 21 L51 12Z"/>
    <path ${T} d="M8 32 L5 28 M56 30 L59 26 M8 18 L6 14 M58 10 L61 7"/>
    ${spark(38, 8, 2.4)}${spark(56, 40, 2)}`,

  // nova congelante: estilhaços de gelo facetados explodindo a partir do centro
  frost_nova: (c, g, r) => {
    let shards = '';
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 - Math.PI / 2 + (r() - 0.5) * 0.15;
      const L = k % 2 ? 22 : 29, W = k % 2 ? 0.2 : 0.16;
      const tip = polar(32, 32, L, a), base = polar(32, 32, 7, a);
      const s1 = polar(32, 32, L * 0.55, a + W), s2 = polar(32, 32, L * 0.55, a - W);
      shards += `<path fill="url(#ink-ice)" ${M} d="${poly([base, s1, tip, s2])}"/>`;
      shards += `<path ${HATCH} d="${poly([base, tip, s2])}"/>`;
      shards += `<path fill="none" stroke="${K}" stroke-width=".7" d="${poly([base, tip], false)}"/>`;
    }
    return `
    ${wash(c, r)}
    <circle cx="32" cy="32" r="29" fill="none" stroke="${K}" stroke-width="1.1" stroke-dasharray="1.5 3.5"/>
    <circle cx="32" cy="32" r="24" fill="${c}" fill-opacity=".25" stroke="${c}" stroke-width="1.2" stroke-dasharray="6 4"/>
    ${shards}
    <circle cx="32" cy="32" r="8" fill="${P}" ${S}/>
    <path fill="none" ${T} d="M32 26 V38 M26.8 29 L37.2 35 M26.8 35 L37.2 29"/>
    ${stipple(r, 10, (x, y) => Math.hypot(x - 32, y - 32) > 25 && Math.hypot(x - 32, y - 32) < 30, mix(c, K, 0.4), 0.8)}
    ${spark(54, 10, 2.6)}${spark(10, 54, 2.2)}`;
  },

  // zona de lava: poça incandescente com crosta, bolhas, rachaduras e fumaça
  lava_zone: (c, g, r) => `
    ${wash(c, r)}
    <path fill="url(#${g})" ${S} d="${blob(32, 44, 28, r, 0.08, 11, 0.5)}"/>
    <path fill="url(#ink-hot)" stroke="none" d="${blob(32, 45, 19, r, 0.12, 9, 0.45)}"/>
    <path fill="#5e4f40" ${M} d="M10 42 L17 39 L21 43 L15 47Z M41 50 L49 47 L54 50 L46 54Z M34 37 L40 36 L41 40 L36 41Z"/>
    <path ${HATCH} d="M15 47 L21 43 L17 46Z M46 54 L54 50 L49 53Z"/>
    <path fill="none" stroke="${mix(c, K, 0.2)}" stroke-width="1.2" stroke-linecap="round" d="M22 49 L27 46 L31 48 L35 45 M24 41 L28 43"/>
    <circle cx="26" cy="44" r="2.6" fill="#ffd36b" stroke="${K}" stroke-width="1.1"/>
    <path fill="none" stroke="${K}" stroke-width=".8" d="M24.6 43 A1.5 1.5 0 0 1 26.4 42.2"/>
    <circle cx="39" cy="46" r="1.8" fill="#ffd36b" stroke="${K}" stroke-width="1"/>
    <path ${HATCH} d="M4 44 C5 52 16 58 32 58 C48 58 59 52 60 44 C56 51 46 54 32 54 C18 54 8 51 4 44Z"/>
    <circle cx="24" cy="30" r="3.6" fill="${c}" ${M}/><circle cx="23" cy="29" r="1" fill="${P}"/>
    <circle cx="36" cy="22" r="2.4" fill="${c}" ${M}/>
    <circle cx="31" cy="14" r="1.4" fill="${K}"/>
    <path fill="#c9c3b0" fill-opacity=".8" ${T} d="M44 32 C40 28 44 24 47 26 C47 21 53 20 54 24 C58 23 60 28 56 30 C54 33 47 34 44 32Z"/>
    <path fill="#c9c3b0" fill-opacity=".7" ${T} d="M10 30 C7 27 10 23 13 25 C14 21 19 22 19 25 C21 26 20 30 17 30Z"/>
    <path ${T} d="M50 18 C48 14 52 12 50 8 M14 18 C16 15 13 13 15 10"/>`,

  // choque relâmpago: raio que rebenta no chão com estouro e rachaduras
  flash_shock: (c, g, r) => {
    const burst = [];
    for (let i = 0; i < 18; i++) {
      const a = Math.PI + (i / 17) * Math.PI;
      burst.push(polar(32, 52, i % 2 ? 8 + r() * 2 : 15 + r() * 4, a));
    }
    return `
    ${wash(c, r)}
    <path fill="${c}" fill-opacity=".5" ${M} d="${poly([[17, 52], ...burst, [47, 52]])}"/>
    <path fill="#ffd36b" stroke="none" d="${blob(32, 51, 7, r, 0.15, 8, 0.6)}"/>
    <path fill="url(#${g})" ${S} d="M36 1 L21 26 L30 26 L19 50 L45 20 L35 20 L45 1Z"/>
    <path ${HATCH} d="M35 20 L45 20 L19 50 L33 24Z"/>
    <path ${SHINE} d="M38 4 L26 23 L30 23Z"/>
    <path fill="none" ${S} d="M2 54 C10 52 20 53 26 54 M38 54 C45 53 54 52 62 54"/>
    <path ${T} d="M22 57 L18 61 L13 60 M42 57 L46 61 L52 60 M32 58 V63"/>
    <path fill="#8a7a66" stroke="${K}" stroke-width=".9" d="M8 44 l3 -1 l1 2.6 l-3 1Z M54 42 l2.6 -1 l1 2.2 l-2.8 1Z M14 36 l2 -.5 l.6 1.8 l-2 .6Z"/>
    <path ${T} d="M6 36 L3 32 M58 34 L61 30 M50 46 L54 44 M14 50 L10 48"/>
    ${spark(54, 10, 2.6)}${spark(10, 14, 2)}`;
  },

  // escudo: escudo de metal com aro dourado, rebites e runa central
  shield: (c, g, r) => `
    ${wash(c, r)}
    <path fill="url(#ink-gold)" ${S} d="M32 3 C40 9 48 10 56 10 C56 32 50 49 32 61 C14 49 8 32 8 10 C16 10 24 9 32 3Z"/>
    <path fill="url(#${g})" ${M} d="M32 9 C38 13 44 15 50 15 C50 32 45 45 32 54 C19 45 14 32 14 15 C20 15 26 13 32 9Z"/>
    <path ${HATCH} d="M32 9 C38 13 44 15 50 15 C50 32 45 45 32 54Z"/>
    <path ${HATCH} d="M56 10 C56 32 50 49 32 61 C46 50 52 34 52 12Z"/>
    <path fill="${P}" ${M} d="M32 19 L39 30 L32 44 L25 30Z"/>
    <path fill="none" ${T} d="M32 19 V44 M25 30 H39"/>
    <circle cx="32" cy="30" r="2.6" fill="${c}" stroke="${K}" stroke-width="1.1"/>
    ${[[14, 13], [50, 13], [32, 6], [15, 32], [49, 32], [32, 57]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${P}" stroke="${K}" stroke-width=".9"/>`).join('')}
    <path ${SHINE} d="M17 18 C21 18 25 17 29 14 C26 18 21 21 17 22Z"/>
    <path ${T} d="M10 20 C11 30 14 40 20 48"/>
    ${spark(58, 52, 2.6)}${spark(6, 56, 2)}`,

  // camuflagem: manto com capuz, olhos na sombra e barra se desfazendo em pontilhado
  cloaking: (c, g, r) => `
    ${wash(c, r)}
    <path fill="url(#${g})" fill-opacity=".85" ${S} d="M32 3 C45 5 52 18 52 33 C52 42 53 47 56 52 L8 52 C11 47 12 42 12 33 C12 18 19 5 32 3Z"/>
    <path ${HATCH} d="M32 3 C45 5 52 18 52 33 C52 42 53 47 56 52 L46 52 C47 40 47 22 32 3Z"/>
    <path fill="${K}" d="M32 13 C41 14 45 22 44 32 C43 40 38 44 32 44 C26 44 21 40 20 32 C19 22 23 14 32 13Z"/>
    <path fill="none" stroke="${mix(c, P, 0.3)}" stroke-width="1.2" d="M32 13 C41 14 45 22 44 32"/>
    <path fill="${c}" d="M24 30 C25 27.4 29 27.4 30 30 C29 31.4 25 31.4 24 30Z M34 30 C35 27.4 39 27.4 40 30 C39 31.4 35 31.4 34 30Z"/>
    <path fill="${P}" d="M26 29.6 a1 1 0 1 0 .1 0 M36 29.6 a1 1 0 1 0 .1 0"/>
    <path ${T} d="M15 50 C16 42 16 36 16 30 M49 50 C48 42 48 36 48 30 M24 51 C25 47 25 46 25 44 M40 51 C39 47 39 46 39 44"/>
    <path ${SHINE} d="M18 18 C21 11 26 7 31 6 C26 10 22 14 20 21Z"/>
    ${stipple(r, 40, (x, y) => y > 53 && y < 63 && x > 8 + (y - 52) * 1.2 && x < 56 - (y - 52) * 1.2, mix(c, K, 0.35), 0.8)}`,

  // círculo mágico: anéis duplos, runas geradas, hexagrama e nós nos vértices
  magic_circle: (c, g, r) => {
    const tri = (o) => poly([0, 1, 2].map((k) => polar(32, 32, 19, o + (k * 2 * Math.PI) / 3)));
    const nodes = Array.from({ length: 6 }, (_, k) => polar(32, 32, 19, -Math.PI / 2 + (k * Math.PI) / 3));
    let ticks = '';
    for (let k = 0; k < 36; k++) {
      const a = (k / 36) * Math.PI * 2, [x0, y0] = polar(32, 32, 29, a), [x1, y1] = polar(32, 32, k % 3 ? 30.5 : 32, a);
      ticks += `M${n2(x0)} ${n2(y0)} L${n2(x1)} ${n2(y1)} `;
    }
    return `
    <circle cx="32" cy="32" r="29" fill="url(#${g})" fill-opacity=".45" ${S}/>
    <path fill="none" stroke="${K}" stroke-width=".8" d="${ticks}"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="${K}" stroke-width="1.3"/>
    ${runes(32, 32, 25.5, 14, r, 1, 0.9)}
    <path ${HATCH} d="M61 32 A29 29 0 0 1 32 61 A29 29 0 0 1 11.5 52.5 L16.4 47.6 A22 22 0 0 0 54 32Z"/>
    <path fill="${P}" fill-opacity=".55" ${M} d="${tri(-Math.PI / 2)}"/>
    <path fill="${P}" fill-opacity=".55" ${M} d="${tri(Math.PI / 2)}"/>
    <circle cx="32" cy="32" r="9.5" fill="none" stroke="${K}" stroke-width="1.1" stroke-dasharray="2 2"/>
    ${nodes.map(([x, y]) => `<circle cx="${n2(x)}" cy="${n2(y)}" r="2.3" fill="${c}" stroke="${K}" stroke-width="1.1"/>`).join('')}
    <circle cx="32" cy="32" r="5" fill="url(#ink-gold)" ${M}/>
    <path fill="${P}" d="${star4(32, 32, 3.4, 0.6)}"/>`;
  },

  // armagedom: estrela flamejante caindo sobre o horizonte que já explode
  armageddon: (c, g, r) => `
    ${wash(c, r)}
    <path fill="url(#ink-hot)" stroke="none" d="M2 50 C10 40 20 36 32 36 C44 36 54 40 62 50Z"/>
    <path fill="#5e4f40" ${S} d="M1 52 C10 45 20 43 32 43 C44 43 54 45 63 52 L63 63 L1 63Z"/>
    <path ${CROSS} d="M1 56 C12 52 22 51 32 51 C42 51 52 52 63 56 L63 63 L1 63Z"/>
    <path fill="none" stroke="#ffd36b" stroke-width="1.6" stroke-linecap="round" d="M20 46 L24 50 L22 55 M40 45 L37 50 L41 56 M30 44 L31 48"/>
    <path fill="${K}" d="M10 46 l3 -4 l3 3Z M50 45 l3 -5 l3 5Z"/>
    <path fill="url(#ink-g-fire)" ${S} d="M60 2 C54 10 46 16 38 22 L28 16 C38 12 50 6 60 2Z"/>
    <path ${T} d="M50 2 L40 10 M62 12 L48 20 M44 2 L36 8"/>
    <path fill="url(#ink-gold)" ${S} d="M29 9 L33 18 L43 19 L36 25 L38 35 L29 30 L20 35 L22 25 L15 19 L25 18Z"/>
    <path ${HATCH} d="M29 22 L43 19 L36 25 L38 35 L29 30Z"/>
    <path ${SHINE} d="M28 13 L30 18 L25 19Z"/>
    <circle cx="29" cy="23" r="2.4" fill="${P}" stroke="${K}" stroke-width="1"/>
    <path ${T} d="M10 30 L8 26 M50 32 L54 29 M4 40 L1 38 M58 40 L62 38"/>
    ${spark(8, 12, 2.6)}${spark(18, 4, 1.8)}`,
};

// definições compartilhadas: tremido do traço, hachuras e aguadas em gradiente
const lin = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join('')}</linearGradient>`;
const rad = (id, stops) =>
  `<radialGradient id="${id}" cx=".38" cy=".34" r=".75">${stops.map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`).join('')}</radialGradient>`;
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="ink-wobble" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <pattern id="ink-hatch" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
    <path d="M0 0 V2.6" stroke="${K}" stroke-width=".7" stroke-opacity=".6"/></pattern>
  <pattern id="ink-cross" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
    <path d="M0 0 V2.6 M0 0 H2.6" stroke="${K}" stroke-width=".7" stroke-opacity=".6"/></pattern>
  ${Object.entries(ELEM).map(([k, { color }]) => rad(`ink-g-${k}`, [[0, mix(color, P, 0.6)], [0.55, color], [1, mix(color, K, 0.35)]])).join('')}
  ${rad('ink-hot', [[0, P], [0.4, '#ffe07a'], [1, '#f59a3a']])}
  ${rad('ink-stone', [[0, '#b8a990'], [0.6, '#7d6c58'], [1, '#4a3d31']])}
  ${rad('ink-cloud', [[0, '#eee8d6'], [0.6, '#aaa390'], [1, '#6d665a']])}
  ${lin('ink-gold', [[0, '#fff2b8'], [0.5, '#e6c93a'], [1, '#a8861c']])}
  ${lin('ink-ice', [[0, '#f4fbff'], [0.5, '#bfe8f2'], [1, ELEM.nature.color]], 1, 1)}
  ${lin('ink-steel', [[0, '#f2f0ea'], [0.5, '#a9a8a2'], [1, '#5d5b56']], 1, 1)}
  ${lin('ink-beam', [[0, ELEM.energy.color], [0.5, mix(ELEM.energy.color, P, 0.5)], [1, ELEM.energy.color]])}
</defs></svg>`;
document.body.insertAdjacentHTML('beforeend', DEFS);

// cache: o desenho é procedural, mas a mesma magia sempre gera o mesmo SVG
const CACHE = new Map();

// HTML do símbolo de uma magia; null quando não há desenho (cai no ícone de texto)
export function spellIcon(id) {
  const draw = DRAW[id];
  if (!draw) return null;
  if (!CACHE.has(id)) {
    const elem = SPELL_BY_ID[id].elem;
    const inner = draw(ELEM[elem].color, `ink-g-${elem}`, rng(hash(id)));
    CACHE.set(id, `<svg class="glyph" viewBox="0 0 64 64" aria-hidden="true"><g filter="url(#ink-wobble)">${inner}</g></svg>`);
  }
  return CACHE.get(id);
}
