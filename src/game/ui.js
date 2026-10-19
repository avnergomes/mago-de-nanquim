import { G, xpNeeded } from './state.js';

// Recuperar mana: pula a escolha e devolve parte da mana do nível.
// ponytail: 50% é estimativa; o wiki não publica o valor base.
const MANA_BACK = 0.5;
import { ELEM, SPELL_BY_ID, maxLevel } from '../data/spells.js';
import { COMBOS } from '../data/combos.js';
import { PASSIVES, SPECIALS, ARTIFACTS } from '../data/passives.js';
import { levelOptions, attrOptions, chestOptions } from './levelup.js';
import { spellIcon } from '../render/icons.js';
import { classIcon as classArt, classColor } from '../render/classIcons.js';
import { treasureIcon } from '../render/treasureIcons.js';
import { CLASSES, CLASS_BY_ID } from '../data/classes.js';

const $ = (id) => document.getElementById(id);
const fmtTime = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let modalOpen = false;
const queue = [];

export const isModalOpen = () => modalOpen;

// Fila de escolhas: subida de nível, atributo, baú. Uma por vez, jogo pausado enquanto aberta.
function enqueue(task) { queue.push(task); if (!modalOpen) runQueue(); }
async function runQueue() {
  modalOpen = true;
  while (queue.length) await queue.shift()();
  modalOpen = false;
}

function choose(title, subtitle, options, cls = '', skip = null) {
  return new Promise((resolve) => {
    const box = $('choice');
    box.className = `modal show ${cls}`;
    $('choice-title').textContent = title;
    $('choice-sub').textContent = subtitle;
    const cards = $('choice-cards');
    cards.innerHTML = '';
    options.forEach((o, i) => {
      const el = document.createElement('button');
      el.className = `card kind-${o.kind}`;
      const col = o.elem ? ELEM[o.elem].color : o.kind === 'combo' ? '#d4a73a' : o.kind === 'special' ? '#c0508a' : o.kind === 'artifact' ? '#e6c93a' : '#5a7a5a';
      el.style.setProperty('--accent', col);
      el.innerHTML = `<div class="ic">${spellIcon(o.spell ?? o.id) ?? treasureIcon(o.id) ?? esc(o.icon || '?')}</div><div class="tx"><b>${esc(o.title)}</b><i>${esc(o.sub || '')}</i><p>${esc(o.desc).replace(/\n/g, '<br>')}</p></div><kbd>${i + 1}</kbd>`;
      el.onclick = () => done(o);
      cards.appendChild(el);
    });
    const sk = $('choice-skip');
    sk.hidden = !skip;
    if (skip) { sk.textContent = skip.title; sk.onclick = () => done(skip); }
    const onKey = (e) => { const n = +e.key; if (n >= 1 && n <= options.length) done(options[n - 1]); };
    addEventListener('keydown', onKey);
    function done(o) {
      removeEventListener('keydown', onKey);
      box.className = 'modal';
      resolve(o);
    }
  });
}

export function pumpLevelUps() {
  if (modalOpen || G.pendingLevels <= 0 || G.over) return;
  G.pendingLevels--;
  enqueue(async () => {
    const lvl = G.level - G.pendingLevels, back = MANA_BACK * (G.cls?.manaBack ?? 1);
    const skip = back > 0 ? { title: `Recuperar mana (${Math.round(back * 100)}%)`, apply: () => G.gainXp(xpNeeded(lvl - 1) * back) } : null;
    const o = await choose('Subiu de nível!', `Nível ${lvl}. Escolha uma melhoria.`, levelOptions(), '', skip);
    const res = o.apply();
    if (res?.attrFor) {
      const a = await choose('Atributo desbloqueado', 'Escolha como esta magia vai evoluir. Atributos certos liberam combos.', attrOptions(res.attrFor, res.tier), 'attr');
      a.apply();
    }
    refreshBuild();
  });
}

// ---------- escolha de classe (tela inicial) ----------
let classId = 'wizard';
try { const saved = localStorage.getItem('nanquim-class'); if (CLASS_BY_ID[saved]) classId = saved; } catch {}
export const chosenClass = () => classId;
const classIcon = (c) => classArt(c.id) ?? (c.icon ? esc(c.icon) : spellIcon(c.spell));

function initClassPicker() {
  const grid = $('class-grid');
  const show = () => {
    const c = CLASS_BY_ID[classId];
    for (const b of grid.children) b.setAttribute('aria-pressed', b.dataset.id === classId);
    $('class-info').style.setProperty('--accent', classColor(c));
    $('class-info').innerHTML = `<div class="ic">${classIcon(c)}</div><div><b>${esc(c.name)}</b> <i>${esc(c.en)}</i><ul>${c.perks.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`;
  };
  for (const c of CLASSES) {
    const b = document.createElement('button');
    b.className = 'cls';
    b.dataset.id = c.id;
    b.title = c.name;
    b.style.setProperty('--accent', classColor(c));
    b.innerHTML = `<span>${classIcon(c)}</span><small>${esc(c.name)}</small>`;
    b.onclick = () => { classId = c.id; try { localStorage.setItem('nanquim-class', classId); } catch {} show(); };
    grid.appendChild(b);
  }
  show();
}

export function initUI() {
  initClassPicker();
  G.ui = {
    banner(msg) {
      const b = $('banner');
      b.textContent = msg;
      b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    },
    openChest(sub) {
      enqueue(async () => {
        const o = await choose(sub === 'blackbox' ? 'Caixa Preta' : 'Baú do tesouro', 'Uma relíquia ou um artefato para esta partida.', chestOptions(sub), 'chest');
        o.apply();
        refreshBuild();
      });
    },
  };
}

let hudT = 0;
export function updateHUD(dt) {
  hudT -= dt;
  const p = G.player;
  $('xp-fill').style.width = `${Math.min(100, (G.xp / xpNeeded(G.level)) * 100)}%`;
  $('hp-fill').style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
  if (hudT > 0) return;
  hudT = 0.2;
  $('timer').textContent = fmtTime(G.t);
  $('kills').textContent = `☠ ${G.kills}`;
  $('lvl').textContent = `Nv ${G.level}`;
  $('hp-txt').textContent = `${Math.ceil(p.hp)} / ${Math.ceil(p.maxHp)}`;
  const boss = document.querySelector('#bossbar');
  const b = G.bossRef;
  if (b && b.alive) { boss.style.display = 'block'; $('boss-fill').style.width = `${(b.hp / b.maxHp) * 100}%`; $('boss-name').textContent = b.def.name; }
  else boss.style.display = 'none';
  const cl = G.spells.cloaking, ar = G.spells.armageddon;
  $('cds').innerHTML = [cl && `👁 ${G.cloaked > 0 ? 'ativa' : cl.t > 0 ? Math.ceil(cl.t) + 's' : 'pronta'}`, ar && `☢ ${Math.max(0, Math.ceil(ar.t))}s`,
    G.runes.inv > 0 && `✧ invencível ${Math.ceil(G.runes.inv)}s`, G.runes.frenzy > 0 && `✦ frenesi ${Math.ceil(G.runes.frenzy)}s`, G.runes.greed > 0 && `◈ ganância ${Math.ceil(G.runes.greed)}s`, G.spells.shield && `🛡 ${G.spells.shield.st.charges ?? 0}`].filter(Boolean).join(' · ');
}

export function refreshBuild() {
  const rows = Object.values(G.spells).map(sp => {
    const max = maxLevel(sp.def);
    const attrs = [...sp.attrs].map(id => sp.def.attrs.find(a => a.id === id).name).join(', ');
    return `<div class="sp" style="--accent:${ELEM[sp.def.elem].color}" title="${esc(sp.def.name)}${attrs ? ': ' + esc(attrs) : ''}"><span>${spellIcon(sp.def.id) ?? esc(sp.def.icon)}</span><em>${sp.lvl >= max ? 'MAX' : sp.lvl}</em></div>`;
  });
  $('build').innerHTML = rows.join('');
  const combos = Object.keys(G.combos).map(id => COMBOS.find(c => c.id === id).name);
  $('combos').innerHTML = combos.map(n => `<span>✸ ${esc(n)}</span>`).join('');
}

export function buildSummary() {
  const spells = Object.values(G.spells).map(sp => {
    const attrs = [...sp.attrs].map(id => sp.def.attrs.find(a => a.id === id).name);
    return `<li><b>${spellIcon(sp.def.id) ?? esc(sp.def.icon)} ${esc(sp.def.name)}</b> nv ${sp.lvl}${attrs.length ? ` <i>(${esc(attrs.join(', '))})</i>` : ''}</li>`;
  }).join('');
  const pas = PASSIVES.filter(p => G.passives[p.id]).map(p => `${esc(p.name)} ${G.passives[p.id]}`).join(', ') || 'nenhuma';
  const tre = (list, set) => list.filter(t => set.has(t.id)).map(t => `<span class="tr">${treasureIcon(t.id) ?? ''}${esc(t.name)}</span>`).join(', ');
  const spc = tre(SPECIALS, G.specials) || 'nenhuma';
  const art = tre(ARTIFACTS, G.artifacts) || 'nenhum';
  const cmb = Object.keys(G.combos).map(id => esc(COMBOS.find(c => c.id === id).name)).join(', ') || 'nenhum';
  return `<ul class="sum">${spells}</ul><p><b>Passivas:</b> ${pas}</p><p><b>Relíquias:</b> ${spc}</p><p><b>Artefatos:</b> ${art}</p><p><b>Combos:</b> ${cmb}</p>`;
}

export function showEnd(victory) {
  $('end-title').textContent = victory ? 'Você sobreviveu!' : 'Fim da jornada';
  $('end-stats').innerHTML = `<p>${esc(G.cls?.name ?? '')} · Tempo ${fmtTime(G.t)} · Nível ${G.level} · ${G.kills} inimigos</p>${buildSummary()}`;
  $('end-continue').style.display = victory ? 'inline-block' : 'none';
  $('end').className = 'modal show';
}

export function showPause(on) {
  $('pause').className = on ? 'modal show' : 'modal';
  if (on) $('pause-build').innerHTML = buildSummary();
}

// barra de HP flutuante sob o mago
export function placePlayerBar(sx, sy) {
  const el = $('pbar');
  el.style.transform = `translate(${sx - 26}px, ${sy + 8}px)`;
  $('pbar-fill').style.width = `${Math.max(0, (G.player.hp / G.player.maxHp) * 100)}%`;
}
