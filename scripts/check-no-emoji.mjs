// Barra emojis e símbolos pictográficos no jogo: toda a iconografia é SVG desenhada em src/render/.
// Uso: node scripts/check-no-emoji.mjs (sai com erro e lista as ocorrências).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['index.html', 'style.css', 'manifest.webmanifest', 'sw.js', 'src', 'README.md'];
const EXT = new Set(['.js', '.mjs', '.html', '.css', '.json', '.webmanifest', '.md']);
// pictogramas de emoji, seletor de variação e os blocos de símbolos/dingbats (setas, ✦, ☠, ◎...)
const BAD = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}\u{2190}-\u{2BFF}]/gu;

const files = [];
const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).forEach((f) => walk(join(p, f))) : EXT.has(extname(p)) && files.push(p));
ROOTS.forEach(walk);

let found = 0;
for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    const m = line.match(BAD);
    if (m) { found++; console.log(`${f}:${i + 1}: ${[...new Set(m)].join(' ')}  ${line.trim().slice(0, 90)}`); }
  });
}
if (found) { console.error(`\n${found} linha(s) com emoji ou símbolo pictográfico. Use as ilustrações SVG de src/render/.`); process.exit(1); }
console.log(`sem emojis (${files.length} arquivos verificados)`);
