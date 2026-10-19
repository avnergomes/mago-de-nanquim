import { K, P, S, M, T, HATCH, SHINE, mix, n2, hash, rng, polar, star4, spark, wash } from './icons.js';
import { corkFlask } from './treasureIcons.js';

// Ilustrações do resto da interface, no mesmo traço: passivas comuns e de crescimento, cartas de combo
// e de cura, e os sinais pequenos do HUD (abates, pausa, runas). Nada de emoji: tudo é SVG.

const GOLD = '#e6c93a', RED = '#c8423a', BLUE = '#4f86d8', GREEN = '#5a9a4a', PINK = '#e88aa0', ARC = '#7a8cff', BROWN = '#7a5a3a';

// ---------- passivas ----------
const PASSIVE = {
  // inteligência: cérebro com dobras e centelha de ideia
  intelligence: (r) => `${wash(PINK, r)}
    <path fill="${PINK}" ${S} d="M32 12 C38 8 46 10 48 16 C55 17 58 24 55 30 C59 35 56 43 50 44 C49 50 42 53 37 50 C35 53 29 53 27 50 C22 53 15 50 14 44 C8 43 5 35 9 30 C6 24 9 17 16 16 C18 10 26 8 32 12Z"/>
    <path ${HATCH} d="M32 12 C38 8 46 10 48 16 C55 17 58 24 55 30 C59 35 56 43 50 44 C49 50 42 53 37 50 C35 53 32 53 32 52Z"/>
    <path fill="none" ${M} d="M32 13 V51"/>
    <path ${T} stroke-width="1.4" d="M18 22 C22 20 25 23 24 27 C28 26 30 30 27 33 M14 34 C18 33 20 36 18 40 M22 42 C24 39 28 40 28 44 M46 22 C42 20 39 23 40 27 C36 26 34 30 37 33 M50 34 C46 33 44 36 46 40 M42 42 C40 39 36 40 36 44"/>
    <path ${SHINE} d="M18 18 C21 14 26 13 29 14 C25 16 22 18 20 21Z"/>
    <path stroke="${K}" stroke-width="2.4" stroke-linecap="round" d="M28 54 L28 59 M36 54 L36 59"/>
    ${spark(54, 8, 3)}${spark(8, 10, 2)}`,
  // conjuração rápida: cronômetro com ponteiro em movimento
  fast_casting: (r) => {
    let ticks = '';
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283, [x0, y0] = polar(32, 36, 15.5, a), [x1, y1] = polar(32, 36, i % 3 ? 17 : 18.6, a); ticks += `M${n2(x0)} ${n2(y0)} L${n2(x1)} ${n2(y1)} `; }
    return `${wash(BLUE, r)}
    <rect x="28" y="6" width="8" height="6" rx="1.4" fill="url(#ink-gold)" ${M}/>
    <path stroke="${K}" stroke-width="3" stroke-linecap="round" d="M47 17 L51 13"/>
    <circle cx="32" cy="36" r="21" fill="url(#ink-gold)" ${S}/>
    <circle cx="32" cy="36" r="17.5" fill="${P}" ${M}/>
    <path fill="${BLUE}" fill-opacity=".4" stroke="none" d="M32 36 L32 18.5 A17.5 17.5 0 0 1 49 32Z"/>
    <path fill="none" stroke="${K}" stroke-width=".9" d="${ticks}"/>
    <path stroke="${K}" stroke-width="2.6" stroke-linecap="round" d="M32 36 L44 28"/>
    <circle cx="32" cy="36" r="2.4" fill="${RED}" stroke="${K}" stroke-width="1"/>
    <path ${HATCH} d="M53 36 A21 21 0 0 1 32 57 A21 21 0 0 1 17 51 L20 48 A17.5 17.5 0 0 0 49.5 36Z"/>
    <path ${T} d="M4 26 H11 M2 34 H9 M5 42 H11"/>`;
  },
  // vitalidade: coração com cruz de cura
  vitality: (r) => `${wash(RED, r)}
    <path fill="${RED}" ${S} d="M32 56 C22 48 7 38 7 24 C7 15 14 9 21 9 C26 9 30 12 32 17 C34 12 38 9 43 9 C50 9 57 15 57 24 C57 38 42 48 32 56Z"/>
    <path ${HATCH} d="M43 9 C50 9 57 15 57 24 C57 38 42 48 32 56 C40 46 49 35 49 24 C49 17 47 12 43 9Z"/>
    <path ${SHINE} d="M13 20 C14 16 17 13 21 13 C17 16 16 19 15.6 23Z"/>
    <path fill="${P}" ${M} d="M28 20 H36 V28 H44 V36 H36 V44 H28 V36 H20 V28 H28Z"/>`,
  // pressa: botas de vento com rastro
  haste: (r) => `${wash(GREEN, r)}
    <path ${T} stroke-width="1.6" d="M2 30 H14 M4 38 H16 M2 46 H12"/>
    <path fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" d="M10 22 C16 18 22 20 22 26 M8 54 C14 58 20 56 22 52"/>
    <path fill="${BROWN}" ${S} d="M26 10 H42 L41 34 C47 36 56 40 58 46 C59 50 58 54 54 54 H22 C20 54 19 52 20 48 L23 36 C24 26 25 18 26 10Z"/>
    <path ${HATCH} d="M35 10 H42 L41 34 C47 36 56 40 58 46 C52 44 45 42 38 40 C39 28 38 18 35 10Z"/>
    <path fill="${mix(BROWN, K, 0.4)}" ${M} d="M20 54 H56 C58 54 59 56 58 58 H20 C18 58 18 54 20 54Z"/>
    <path fill="${P}" ${M} d="M26 14 C22 10 18 10 14 12 C18 14 20 16 24 20Z M26 20 C22 18 18 19 15 21 C19 22 21 24 25 26Z"/>
    <path ${T} d="M28 20 H39 M27.6 26 H39"/>`,
  // efusão arcana: estrela que se expande em anéis
  arcane_effuse: (r) => `${wash(ARC, r)}
    <circle cx="32" cy="32" r="27" fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="2 3"/>
    <circle cx="32" cy="32" r="21" fill="${ARC}" fill-opacity=".25" stroke="${K}" stroke-width="1.4"/>
    <circle cx="32" cy="32" r="14" fill="none" stroke="${ARC}" stroke-width="2"/>
    ${[0, 1, 2, 3].map((i) => { const a = i * 1.5708 + 0.785, [x, y] = polar(32, 32, 24, a), [x2, y2] = polar(32, 32, 30, a); return `<path stroke="${K}" stroke-width="2.2" stroke-linecap="round" d="M${n2(x)} ${n2(y)} L${n2(x2)} ${n2(y2)}"/><path fill="${K}" d="M${n2(x2)} ${n2(y2)} l${n2(Math.cos(a + 2.6) * 4)} ${n2(Math.sin(a + 2.6) * 4)} l${n2(Math.cos(a - 2.6) * 4 - Math.cos(a + 2.6) * 4)} ${n2(Math.sin(a - 2.6) * 4 - Math.sin(a + 2.6) * 4)}Z"/>`; }).join('')}
    <path fill="url(#ink-g-none)" ${S} d="${star4(32, 32, 12, 2.2)}"/>
    <path fill="${P}" d="${star4(32, 32, 4.6, 0.8)}"/>`,
  // concentração: bola de cristal com redemoinho
  concentration: (r) => `${wash('#b06ae8', r)}
    <path fill="url(#ink-gold)" ${S} d="M18 50 C18 46 24 44 32 44 C40 44 46 46 46 50 L50 58 H14Z"/>
    <path ${HATCH} d="M38 44.4 C43 45 46 47 46 50 L50 58 H40Z"/>
    <circle cx="32" cy="28" r="19" fill="url(#ink-g-energy)" fill-opacity=".9" ${S}/>
    <path fill="none" stroke="${P}" stroke-width="1.6" stroke-linecap="round" d="M32 28 C32 24 37 24 37 28 C37 33 28 34 27 28 C26 21 37 18 41 25 C45 33 35 42 26 38"/>
    <path ${HATCH} d="M51 28 A19 19 0 0 1 32 47 A19 19 0 0 1 20 42.6 C32 46 46 40 51 28Z"/>
    <path ${SHINE} d="M19 22 C21 16 26 12 31 11 C26 15 23 19 22 25Z"/>
    ${spark(54, 10, 2.6)}${spark(10, 14, 2)}`,
  // precisão: alvo com flecha cravada no centro
  snipe: (r) => `${wash(RED, r)}
    <circle cx="30" cy="34" r="24" fill="${P}" ${S}/>
    <circle cx="30" cy="34" r="18" fill="${RED}" ${M}/>
    <circle cx="30" cy="34" r="12" fill="${P}" ${M}/>
    <circle cx="30" cy="34" r="6" fill="${RED}" ${M}/>
    <path ${HATCH} d="M54 34 A24 24 0 0 1 30 58 A24 24 0 0 1 13 51 C28 58 48 52 54 34Z"/>
    <path stroke="${K}" stroke-width="3.2" stroke-linecap="round" d="M30 34 L56 8"/>
    <path stroke="${BROWN}" stroke-width="1.4" stroke-linecap="round" d="M30 34 L56 8"/>
    <path fill="${GOLD}" ${M} d="M52 12 L52 4 L56 8 L60 8 L56 12 Z"/>
    <path fill="${GOLD}" ${M} d="M48 16 L48 9 L52 12 L56 12 L52 16Z"/>`,
  // explorador: bússola sobre um mapa
  explorer: (r) => `${wash(GOLD, r)}
    <path fill="#f4e7b2" ${S} d="M4 14 L20 8 L36 14 L52 8 V48 L36 54 L20 48 L4 54Z"/>
    <path fill="none" stroke="${K}" stroke-width="1" d="M20 8 V48 M36 14 V54"/>
    <path ${HATCH} d="M20 8 L36 14 V54 L20 48Z"/>
    <path fill="none" stroke="${RED}" stroke-width="1.4" stroke-dasharray="2 2" d="M8 46 C12 36 18 34 24 30"/>
    <circle cx="40" cy="38" r="15" fill="url(#ink-gold)" ${S}/>
    <circle cx="40" cy="38" r="11" fill="${P}" ${M}/>
    <path ${T} d="M40 28.6 V30.4 M40 45.6 V47.4 M30.6 38 H32.4 M47.6 38 H49.4"/>
    <path fill="${RED}" stroke="${K}" stroke-width=".8" d="M40 38 L44 30 L41.6 38.8Z"/>
    <path fill="${BLUE}" stroke="${K}" stroke-width=".8" d="M40 38 L36 46 L38.4 37.2Z"/>
    <circle cx="40" cy="38" r="1.2" fill="${K}"/>`,
};

// ---------- cartas especiais ----------
const CARD = {
  // combo: dois anéis entrelaçados com estrela no encontro
  combo: (r) => `${wash(GOLD, r)}
    <circle cx="23" cy="32" r="15" fill="${'#e8643a'}" fill-opacity=".35" stroke="${K}" stroke-width="3.6"/>
    <circle cx="41" cy="32" r="15" fill="${'#4fb0c6'}" fill-opacity=".35" stroke="${K}" stroke-width="3.6"/>
    <circle cx="23" cy="32" r="15" fill="none" stroke="#e8643a" stroke-width="1.6"/>
    <circle cx="41" cy="32" r="15" fill="none" stroke="#4fb0c6" stroke-width="1.6"/>
    <path fill="url(#ink-gold)" ${S} d="${star4(32, 32, 11, 2)}"/>
    <path fill="${P}" d="${star4(32, 32, 4, 0.7)}"/>
    ${spark(54, 10, 2.6)}${spark(10, 54, 2.2)}`,
  // cura: poção vermelha
  heal: (r) => `${wash(RED, r)}${corkFlask(32, 34, 1.9, RED)}
    <path fill="${P}" stroke="${K}" stroke-width="1.1" d="M29 38 H35 V42 H39 V48 H35 V52 H29 V48 H25 V42 H29Z"/>`,
};

// ---------- sinais pequenos do HUD (sem aguada, para ficarem legíveis em 16 px) ----------
const SIGN = {
  kills: `<path fill="${P}" ${S} d="M14 30 C14 18 22 10 32 10 C42 10 50 18 50 30 C50 37 47 41 44 43 V52 H20 V43 C17 41 14 37 14 30Z"/>
    <path fill="${K}" d="M19 30 C19 24 28 24 28.6 30 C28.6 36 20 37 19 30Z M35.4 30 C36 24 45 24 45 30 C44 37 35.4 36 35.4 30Z M32 36 L35 42 H29Z"/>
    <path fill="none" stroke="${K}" stroke-width="2" d="M26 52 V46 M32 52 V46 M38 52 V46"/>`,
  pause: `<rect x="16" y="12" width="11" height="40" rx="3" fill="${K}"/><rect x="37" y="12" width="11" height="40" rx="3" fill="${K}"/>`,
  rune_inv: `<path fill="${P}" ${S} d="${star4(32, 32, 26, 5)}"/><path fill="none" ${M} d="M32 18 V46 M22 32 H42"/>`,
  rune_frenzy: `<path fill="${RED}" ${S} d="M32 4 C36 16 50 22 48 38 C47 50 40 58 32 58 C24 58 17 50 16 38 C15 28 22 24 24 14 C28 20 30 22 32 4Z"/><path fill="#ffd36b" stroke="none" d="M32 28 C35 34 40 38 39 46 C38 51 35 53 32 53 C29 53 26 51 25 46 C24 40 29 36 32 28Z"/>`,
  rune_greed: `<path fill="${BLUE}" ${S} d="M32 4 L54 26 L32 60 L10 26Z"/><path fill="none" ${M} d="M10 26 H54 M22 26 L32 4 L42 26 L32 60"/><path ${SHINE} d="M18 24 L30 8 L24 24Z"/>`,
};

const CACHE = new Map();
const svg = (inner) => `<svg class="glyph" viewBox="0 0 64 64" aria-hidden="true"><g filter="url(#ink-wobble)">${inner}</g></svg>`;
function cached(key, make) {
  if (!CACHE.has(key)) CACHE.set(key, make());
  return CACHE.get(key);
}
// selo de "crescimento" no canto: medalha dourada com um mais
const GROWTH_BADGE = `<circle cx="51" cy="51" r="10" fill="url(#ink-gold)" ${S}/><path fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round" d="M51 45.6 V56.4 M45.6 51 H56.4"/>`;

// ilustração de uma passiva comum ou de crescimento (g_<id>)
export function passiveIcon(id) {
  const base = id.replace(/^g_/, ''), draw = PASSIVE[base];
  if (!draw) return null;
  return cached('p:' + id, () => svg(draw(rng(hash('passive:' + base))) + (id !== base ? GROWTH_BADGE : '')));
}
// ilustração das cartas de combo e de cura
export function cardIcon(kind) {
  const draw = CARD[kind];
  return draw ? cached('c:' + kind, () => svg(draw(rng(hash('card:' + kind))))) : null;
}
// sinal pequeno do HUD (kills, pause, rune_inv, rune_frenzy, rune_greed)
export function signIcon(name) {
  return cached('s:' + name, () => `<svg class="sign" viewBox="0 0 64 64" aria-hidden="true">${SIGN[name]}</svg>`);
}
