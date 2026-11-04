/*
 * Emerging Developer Academy(TM) | Development Learning Lab(TM)
 * Shared interface: page shell, project bar, participant / facilitator mode,
 * form binding, glossary tooltips, charts, learning blocks and downloads.
 */
import * as S from './store.js?v=1793806206';
import * as E from './engine.js?v=1793806206';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const { fmt$, fmtPct } = E;
export const BRAND = 'Emerging Developer Academy™';
export const LAB = 'Development Learning Lab™';

export const PAGES = [
  { key: 'home', href: './', label: 'Lab Home' },
  { key: 'comps', href: 'comps.html', label: 'Market Comps' },
  { key: 'budget', href: 'budget.html', label: 'Budget Builder', n: 1 },
  { key: 'pencil', href: 'pencil.html', label: 'Pencil Test', n: 2 },
  { key: 'capital', href: 'capital.html', label: 'Capital Stack', n: 3 },
  { key: 'homebuyer', href: 'homebuyer.html', label: 'Homebuyer Affordability', n: 4 },
  { key: 'summary', href: 'summary.html', label: 'Feasibility Summary' },
];

export const GUIDE_ANCHOR = { home: '#start', comps: '#labM', budget: '#lab1', pencil: '#lab2', capital: '#lab3', homebuyer: '#lab4', summary: '#lab5' };

export const ACTIVITIES = [
  null,
  { title: 'Exercise 1: Development Budget', page: 'budget.html' },
  { title: 'Exercise 2: Pencil Test', page: 'pencil.html' },
  { title: 'Exercise 3: Capital Stack', page: 'capital.html' },
  { title: 'Exercise 4: Homebuyer Affordability', page: 'homebuyer.html' },
  { title: 'Market Comps: price support', page: 'comps.html' },
];

export const GLOSSARY = {
  comps: ['Comparable Sales (Comps)', 'Recent sales and listings of similar homes nearby. Closed sales show what buyers actually paid; active and pending list prices show what sellers are asking.'],
  ppsf: ['Price per Square Foot', 'A comp\'s price divided by its living area. Applied to the subject\'s living area, it turns each comp into a value estimate for the subject home.'],
  adjust: ['Adjustments', 'Dollar changes that make a comp more like the subject: for example, subtracting value for an extra bedroom the subject does not have.'],
  tdc: ['Total Development Cost (TDC)', 'Every cost to deliver and sell the project: land, predevelopment, sitework, hard and soft costs, financing and holding costs, contingency, developer fee and disposition (selling) costs. Loan principal is not a cost.'],
  hard: ['Hard Costs', 'The physical construction of the home: foundation, framing, systems, finishes and the general contractor\'s overhead and profit.'],
  soft: ['Soft Costs', 'Costs that are not physical construction: design, engineering, permits, insurance, legal, accounting and project management.'],
  contingency: ['Contingency', 'Money set aside for costs you cannot yet see. It is usually a percentage of hard costs and protects the project from overruns.'],
  equity: ['Developer Equity', 'The developer\'s own cash (or lender-recognized land value) invested in the project. It is a source of funds, not a project cost, and it is usually repaid last.'],
  stack: ['Capital Stack', 'All of the sources of money that pay for the project, layered by who gets repaid first: senior debt, subordinate debt, grants or incentives, then equity.'],
  ltc: ['Loan-to-Cost (LTC)', 'The loan amount divided by the eligible project cost. A 90% LTC lender will lend up to 90 cents of every eligible dollar; the developer covers the rest.'],
  ltv: ['Loan-to-Value (LTV)', 'The loan amount divided by the appraised (collateral) value of the completed property. Lenders often cap both LTC and LTV and use the lower result.'],
  gap: ['Financing Gap', 'Total uses minus the sources you actually have. A gap must be closed with more equity, another source, or a lower cost before the project can move forward.'],
  margin: ['Profit Margin', 'Project profit divided by gross sales revenue. It shows how much of each sales dollar the developer keeps.'],
  roc: ['Return on Cost', 'Project profit divided by total project cost. It shows the return the project earns on every dollar spent.'],
  roe: ['Return on Developer Equity', 'Project profit divided by the developer equity actually invested. This is a simplified, project-level figure. It is not annualized and is not an investor IRR.'],
  breakeven: ['Break-Even Sales Price', 'The lowest sales price that covers every project cost, after percentage-based selling costs come out of the price. Below it, the project loses money.'],
  dti: ['Debt-to-Income (DTI)', 'Front-end DTI: monthly housing payment ÷ gross monthly income. Back-end DTI: housing payment plus other monthly debts ÷ gross monthly income. Lenders set the limits.'],
  appraisalGap: ['Appraisal Gap', 'The difference when the appraised value comes in below the contract price. The lender lends on the lower value, so someone must cover the difference.'],
  dpa: ['Down Payment Assistance', 'Help for the buyer, such as a grant or forgivable loan, applied to the buyer\'s down payment or closing costs. It helps the buyer close. It does not pay the developer\'s construction costs.'],
  incentive: ['Development Incentive', 'Money or value provided to the project or developer (for example, a CRA incentive). It is different from homebuyer assistance and is not counted as committed until it is approved.'],
  netsales: ['Net Sales Revenue', 'Gross sales revenue minus the selling costs paid at closing (commissions, seller paid closing costs, other disposition costs).'],
  interest: ['Construction Interest', 'Interest owed on the construction loan while the home is built and marketed. On a draw loan it is charged on the amount drawn so far; some loans charge interest on the full amount from closing.'],
  holding: ['Holding Costs', 'Costs of owning the property while it is built and sold: interest, taxes, insurance, utilities and security. Every extra month adds to them.'],
  sources: ['Sources & Uses', 'Uses are what the money pays for. Sources are where the money comes from. A complete financing plan has committed sources equal to uses.'],
  cashToClose: ['Cash to Close', 'What the buyer must bring to closing: down payment plus buyer closing costs and any unfinanced fees, minus assistance applied to those costs.'],
};

let popEl = null;
export function tip(key) {
  const g = GLOSSARY[key];
  if (!g) return '';
  return `<button type="button" class="tip" data-term="${key}" aria-label="What is ${esc(g[0])}?" aria-expanded="false">?</button>`;
}
function closePop() { if (popEl) { popEl.remove(); popEl = null; $$('.tip[aria-expanded=true]').forEach((b) => b.setAttribute('aria-expanded', 'false')); } }
document.addEventListener('click', (e) => {
  const t = e.target.closest('.tip');
  if (!t) { if (!e.target.closest('.pop')) closePop(); return; }
  e.preventDefault();
  const open = t.getAttribute('aria-expanded') === 'true';
  closePop();
  if (open) return;
  const g = GLOSSARY[t.dataset.term];
  popEl = document.createElement('div');
  popEl.className = 'pop'; popEl.setAttribute('role', 'tooltip');
  popEl.innerHTML = `<b>${esc(g[0])}</b><br>${esc(g[1])}`;
  document.body.appendChild(popEl);
  const r = t.getBoundingClientRect();
  const w = Math.min(300, window.innerWidth - 20);
  popEl.style.maxWidth = w + 'px';
  popEl.style.left = Math.max(10, Math.min(window.scrollX + r.left - 20, window.scrollX + window.innerWidth - w - 10)) + 'px';
  popEl.style.top = window.scrollY + r.bottom + 8 + 'px';
  t.setAttribute('aria-expanded', 'true');
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); });

/* ------------------------------------------------------------------ */
/* Mode and classroom activity                                          */
/* ------------------------------------------------------------------ */
const qs = new URLSearchParams(location.search);
/* Facilitator mode is unlocked per device with a facilitator password.
   Only a SHA-256 hash is stored here. This keeps participants out of the
   presentation controls; it is not a security boundary (no data is hidden). */
const FAC_HASH = '39a6db9e3a3deff21761d6ddc468cec674c0decf57e12c49fe068ac77512ac7e';
const FAC_KEY = 'eda-lab-fac';
const isUnlocked = () => { try { return localStorage.getItem(FAC_KEY) === FAC_HASH; } catch (e) { return false; } };
async function hashPw(pw) {
  if (!(window.crypto && crypto.subtle)) return '';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('eda-lab:' + pw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function unlockFlow() {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'facmodal';
    wrap.innerHTML = `<form class="facbox" role="dialog" aria-modal="true" aria-labelledby="facTitle">
      <h2 id="facTitle">Facilitator login</h2>
      <p>Enter the facilitator password to turn on facilitator mode on this device.</p>
      <label for="facPw">Facilitator password</label>
      <input id="facPw" type="password" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" required>
      <p class="facerr" id="facErr" role="alert" hidden>That password did not work. Check the spelling and capital letters.</p>
      <div class="facbtns"><button class="btn" type="submit">Unlock</button><button class="btn alt" type="button" id="facCancel">Cancel</button></div>
    </form>`;
    document.body.appendChild(wrap);
    const input = wrap.querySelector('#facPw');
    setTimeout(() => input.focus(), 30);
    const close = (ok) => { wrap.remove(); resolve(ok); };
    wrap.querySelector('#facCancel').addEventListener('click', () => close(false));
    wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(false); });
    wrap.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if ((await hashPw(input.value.trim())) === FAC_HASH) {
        try { localStorage.setItem(FAC_KEY, FAC_HASH); localStorage.setItem('eda-lab-mode', 'facilitator'); } catch (err) {}
        close(true);
      } else { wrap.querySelector('#facErr').hidden = false; input.select(); }
    });
  });
}

/** In-page confirm / input box (browser pop-ups are blocked in many in-app browsers). */
export function askBox(message, { input = null, ok = 'OK', cancel = 'Cancel' } = {}) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'facmodal';
    wrap.innerHTML = `<form class="facbox" role="dialog" aria-modal="true"><p>${esc(message)}</p>${input !== null ? `<input type="text" id="askIn" value="${esc(input)}" aria-label="${esc(message)}">` : ''}<div class="facbtns"><button class="btn" type="submit">${esc(ok)}</button><button class="btn alt" type="button" data-c>${esc(cancel)}</button></div></form>`;
    document.body.appendChild(wrap);
    const inp = wrap.querySelector('#askIn');
    setTimeout(() => (inp || wrap.querySelector('button')).focus(), 30);
    const done = (v) => { wrap.remove(); resolve(v); };
    wrap.querySelector('[data-c]').addEventListener('click', () => done(input !== null ? null : false));
    wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') done(input !== null ? null : false); });
    wrap.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); done(input !== null ? inp.value : true); });
  });
}

function lockFacilitator() { try { localStorage.removeItem(FAC_KEY); localStorage.setItem('eda-lab-mode', 'participant'); } catch (e) {} }
function getMode() {
  if (!isUnlocked()) return 'participant';
  try { return localStorage.getItem('eda-lab-mode') || 'facilitator'; } catch (e) { return 'participant'; }
}
function setMode(m) { if (m === 'facilitator' && !isUnlocked()) return; try { localStorage.setItem('eda-lab-mode', m); } catch (e) {} applyMode(m); }
function applyMode(m) {
  document.body.classList.toggle('fac', m === 'facilitator');
  $$('.mode button[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
}
function getActivity() {
  const a = qs.get('activity');
  if (a !== null) { S.state().activity = Number(a) || null; S.persist(); }
  return S.state().activity || null;
}

/* ------------------------------------------------------------------ */
/* Shell                                                                */
/* ------------------------------------------------------------------ */
export function shell(pageKey, title) {
  const p = S.active();
  const projects = Object.values(S.state().projects);
  const opts = projects.map((x) => `<option value="${esc(x.id)}" ${x.id === p.id ? 'selected' : ''}>${esc(x.name)}${x.kind === 'case' ? ' (instructional case)' : ''}</option>`).join('');
  document.title = `${title} | ${LAB} | ${BRAND}`;
  document.body.insertAdjacentHTML('afterbegin', `
  <a class="skip" href="#main">Skip to content</a>
  <header class="lab-head"><div class="in">
    <img src="eda-logo.png" alt="Emerging Developer Academy">
    <div class="tt"><p class="kick">${BRAND} · Fall 2026</p><h1>${LAB}</h1></div>
    <a class="back" href="../#casestudy">← Back to the Case Study</a>
  </div></header>
  <nav class="tnav" aria-label="Learning Lab tools"><div class="in">
    ${PAGES.map((x) => `<a href="${x.href}" class="${x.key === pageKey ? 'cur' : ''}" ${x.key === pageKey ? 'aria-current="page"' : ''}>${x.n ? `<span class="n">${x.n}</span>` : ''}${x.label}</a>`).join('')}
  </div></nav>
  <section class="pbar noprint" aria-label="Project and view controls"><div class="in">
    <label for="projSel">Project</label>
    <select id="projSel">${opts}</select>
    <button class="btn alt sm" id="resetJP" type="button" title="Restore the original 1010 Joseph Place case figures">Reset to Joseph Place</button>
    <button class="btn g sm" id="startOwn" type="button">Start My Own Project</button>
    <details class="more" style="margin:0"><summary class="btn ghost sm" style="display:inline-flex">More ▾</summary>
      <div style="position:absolute;z-index:30;background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px;display:grid;gap:6px;margin-top:4px;box-shadow:0 6px 20px rgba(0,0,0,.12)">
        <button class="btn alt sm" id="saveCopy" type="button">Save as a new scenario</button>
        <button class="btn alt sm" id="dlProject" type="button">Download project file (JSON)</button>
        <label class="btn alt sm" style="cursor:pointer">Open project file<input id="upProject" type="file" accept=".json,application/json" hidden></label>
        <button class="btn alt sm" id="delProject" type="button" ${p.kind === 'case' ? 'disabled' : ''}>Delete this project</button>
        <p class="note" style="max-width:240px;margin:2px 0 0">Saved only in this browser. Nothing is sent to EDA, and there is no account or backup. Download the project file to keep a copy.</p>
      </div></details>
    <span class="sp"></span>
    <span class="saved" id="savedMsg" aria-live="polite"></span>
    ${isUnlocked() ? '<div class="mode" role="group" aria-label="View mode"><button type="button" data-mode="participant">Participant</button><button type="button" data-mode="facilitator">Facilitator</button></div><button class="btn ghost sm" type="button" id="facLock" title="Lock facilitator mode on this device">🔒 Lock</button>' : '<button class="btn alt sm" type="button" id="facLogin" title="Facilitators: enter the facilitator password">🔑 Facilitator login</button>'}
  </div></section>
  <section class="activity" aria-live="polite" aria-label="Classroom activity"><div class="box">
    <span>📍 <b>Current classroom activity:</b> <span id="actTitle"></span></span>
    <a id="actLink" class="btn sm" style="background:#fff;color:var(--mag)">Go to the activity</a>
    <span class="fac-only" style="gap:6px;align-items:center;margin-left:auto">
      <label for="actSel" style="font-size:13px">Set activity:</label>
      <select id="actSel"><option value="0">None</option>${ACTIVITIES.slice(1).map((a, i) => `<option value="${i + 1}">${a.title}</option>`).join('')}</select>
      <button class="btn sm" id="toggleLearn" type="button" style="background:#fff;color:var(--mag)">Hide explanations</button>
      <a class="btn sm" href="guide.html${GUIDE_ANCHOR[pageKey] || ''}" style="background:var(--navy);color:#fff">📘 Facilitator script</a>
    </span>
  </div></section>
  <div class="printonly" style="padding:10px 16px"><img src="eda-logo.png" alt="" style="height:40px"><p style="margin:4px 0 0"><b>${BRAND} · ${LAB}</b><br>${esc(title)} · ${esc(p.name)} · Analysis date ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
  <main id="main"></main>
  <footer class="lab-foot">${BRAND} · ${LAB} · <span class="nw">Alliance for Housing Progress</span><br>An instructional tool. Results are estimates based on the assumptions entered and are not a loan approval, appraisal, or eligibility decision.</footer>`);

  $('#projSel').addEventListener('change', (e) => { S.setActive(e.target.value); location.reload(); });
  $('#resetJP').addEventListener('click', async () => { if (await askBox('Reset 1010 Joseph Place to the original casebook figures? Your changes to the Joseph Place case will be lost. Your own projects are not affected.', { ok: 'Reset' })) { S.resetJosephPlace(); location.reload(); } });
  $('#startOwn').addEventListener('click', async () => { const n = await askBox('Name your project:', { input: 'My Project', ok: 'Start project' }); if (n !== null) { S.startOwn(n.trim() || 'My Project'); location.reload(); } });
  $('#saveCopy').addEventListener('click', async () => { const n = await askBox('Name this scenario:', { input: `${p.name} (scenario)`, ok: 'Save' }); if (n !== null) { S.saveCopy(n.trim() || undefined); location.reload(); } });
  $('#dlProject').addEventListener('click', () => download(`${slug(p.name)}-eda-project.json`, JSON.stringify(p, null, 2), 'application/json'));
  $('#upProject').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { S.importProject(JSON.parse(await f.text())); location.reload(); } catch (err) { askBox(err.message || 'That file could not be opened.', { ok: 'OK' }); }
  });
  $('#delProject').addEventListener('click', async () => { if (await askBox(`Delete "${p.name}" from this browser?`, { ok: 'Delete' })) { S.deleteProject(p.id); location.reload(); } });

  if (qs.has('facilitator') && !isUnlocked()) { unlockFlow().then((ok) => { const q = new URLSearchParams(location.search); q.delete('facilitator'); location.replace(location.pathname + (q.toString() ? '?' + q : '') + location.hash); }); }
  const mode = getMode(); applyMode(mode);
  $$('.mode button[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  const fl = $('#facLogin'); if (fl) fl.addEventListener('click', () => unlockFlow().then((ok) => { if (ok) location.reload(); }));
  const lk = $('#facLock'); if (lk) lk.addEventListener('click', async () => { if (await askBox('Lock facilitator mode on this device? You will need the facilitator password to turn it back on.', { ok: 'Lock' })) { lockFacilitator(); location.reload(); } });
  const showAct = () => {
    const a = S.state().activity;
    document.body.classList.toggle('has-activity', !!a || document.body.classList.contains('fac'));
    $('#actTitle').textContent = a ? ACTIVITIES[a].title : 'None selected';
    $('#actLink').style.display = a ? '' : 'none';
    if (a) $('#actLink').href = ACTIVITIES[a].page + '#exercise';
    $('#actSel').value = String(a || 0);
    $$('.learn.try').forEach((el) => el.classList.toggle('hl', a && Number(el.dataset.ex) === a));
  };
  getActivity();
  $('#actSel').addEventListener('change', (e) => { S.state().activity = Number(e.target.value) || null; S.persist(); showAct(); });
  $('#toggleLearn').addEventListener('click', (e) => { const h = document.body.classList.toggle('hide-learn'); e.target.textContent = h ? 'Show explanations' : 'Hide explanations'; });
  $$('.mode button[data-mode]').forEach((b) => b.addEventListener('click', showAct));
  setTimeout(showAct, 0);
  const labelTables = () => $$('.tblwrap[role=region]').forEach((w, i) => { const h = w.closest('.card')?.querySelector('h3'); w.setAttribute('aria-label', `${(h?.textContent || 'Table').replace(/^(Inputs|Results)\s*/, '').trim()} (table ${i + 1})`); });
  setTimeout(labelTables, 0); setTimeout(labelTables, 800);
  const markOver = () => $$('.tblwrap').forEach((w) => { const o = w.scrollWidth > w.clientWidth + 2; w.classList.toggle('over', o); if (!w.nextElementSibling || !w.nextElementSibling.classList.contains('swipe')) w.insertAdjacentHTML('afterend', '<p class="swipe" aria-hidden="true">Swipe the table sideways to see every column →</p>'); });
  setTimeout(markOver, 300); setTimeout(markOver, 1200); window.addEventListener('resize', markOver); document.addEventListener('input', () => setTimeout(markOver, 50));
  setTimeout(() => { const c = $('.tnav a.cur'), n = $('.tnav .in'); if (c && n) n.scrollLeft = c.offsetLeft - (n.clientWidth - c.offsetWidth) / 2; }, 0);
  return { main: $('#main'), project: p, refreshActivity: showAct };
}

/* ------------------------------------------------------------------ */
/* Forms                                                                */
/* ------------------------------------------------------------------ */
/**
 * field(path, label, {kind:'money'|'num'|'pct'|'text'|'select'|'bool'|'range', options, hint, tip, readonly, step, min, max})
 */
export function field(path, label, o = {}) {
  const kind = o.kind || 'money';
  const id = 'f-' + path.replace(/[^a-z0-9]/gi, '-');
  const lab = `<span><label for="${id}">${esc(label)}</label>${o.tip ? tip(o.tip) : ''}</span>`;
  const hint = o.hint ? `<span class="hint">${o.hint}</span>` : '';
  const attrs = `id="${id}" data-bind="${path}" data-kind="${kind}" ${o.readonly ? 'readonly' : ''} ${o.min !== undefined ? `min="${o.min}"` : ''} ${o.max !== undefined ? `max="${o.max}"` : ''}`;
  if (kind === 'select') return `<div class="f">${lab}<select ${attrs}>${o.options.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('')}</select>${hint}</div>`;
  if (kind === 'bool') return `<div class="f chk"><input type="checkbox" ${attrs}><label for="${id}">${esc(label)}</label>${o.tip ? tip(o.tip) : ''}${hint}</div>`;
  if (kind === 'text') return `<div class="f">${lab}<input type="text" ${attrs}>${hint}</div>`;
  if (kind === 'range') return `<div class="f">${lab}<div class="range"><input type="range" ${attrs} step="${o.step ?? 1}" aria-label="${esc(label)}"><output data-out="${path}"></output></div>${hint}</div>`;
  const wrap = kind === 'money' ? 'affix' : kind === 'pct' ? 'affix pc' : '';
  return `<div class="f">${lab}<div class="${wrap}"><input type="number" inputmode="decimal" step="${o.step ?? 'any'}" ${attrs}></div>${hint}</div>`;
}

export function bind(root, project, onChange) {
  const fill = () => $$('[data-bind]', root).forEach((el) => {
    const v = S.get(project, el.dataset.bind);
    if (el.type === 'checkbox') el.checked = !!v;
    else if (document.activeElement !== el) el.value = v === null || v === undefined ? '' : v;
    const out = $(`output[data-out="${el.dataset.bind}"]`, root);
    if (out) out.textContent = el.dataset.fmt === '$' ? fmt$(Number(v)) : `${v}${el.dataset.unit || ''}`;
  });
  fill();
  root.addEventListener('input', (e) => handle(e));
  root.addEventListener('change', (e) => handle(e));
  function handle(e) {
    const el = e.target.closest('[data-bind]');
    if (!el || !root.contains(el)) return;
    const k = el.dataset.kind;
    let v;
    if (el.type === 'checkbox') v = el.checked;
    else if (k === 'text' || k === 'select') v = el.value;
    else v = el.value === '' ? null : Number(el.value);
    if (k === 'select' && el.dataset.numeric) v = Number(v);
    S.set(project, el.dataset.bind, v);
    project.updated = new Date().toISOString();
    saved();
    const out = $(`output[data-out="${el.dataset.bind}"]`, root);
    if (out) out.textContent = el.dataset.fmt === '$' ? fmt$(Number(v)) : `${v}${el.dataset.unit || ''}`;
    onChange && onChange(el.dataset.bind, e);
  }
  return { fill };
}

let saveT;
export function saved() {
  const ok = S.persist();
  setTimeout(refreshCaseMath, 0);
  const m = $('#savedMsg');
  if (!m) return;
  m.textContent = ok ? 'Saved in this browser' : 'Not saved: this browser is blocking local storage';
  clearTimeout(saveT); saveT = setTimeout(() => (m.textContent = ''), 2500);
}

/* ------------------------------------------------------------------ */
/* Output components                                                    */
/* ------------------------------------------------------------------ */
export function kpi(label, value, sub = '', cls = '', tipKey = '') {
  return `<div class="kpi ${cls}"><div class="l">${esc(label)}${tipKey ? tip(tipKey) : ''}</div><div class="v${/[A-Za-z]{4,}/.test(String(value).replace(/<[^>]+>/g, '')) ? ' vt' : ''}">${value}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>`;
}
const ICONS = {
  good: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.6-4.3-4.3 1.4-1.4 2.9 2.9 5.9-5.9 1.4 1.4z"/></svg>',
  warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1 21h22zm1 15h-2v-2h2zm0-4h-2V9h2z"/></svg>',
  bad: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.2 12.8-1.4 1.4L12 13.4l-2.8 2.8-1.4-1.4 2.8-2.8-2.8-2.8 1.4-1.4 2.8 2.8 2.8-2.8 1.4 1.4-2.8 2.8z"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>',
};
const LABELS = { good: 'Result', warn: 'Caution', bad: 'Warning', info: 'Note' };
export function status(level, html) {
  return `<div class="status ${level}" role="status">${ICONS[level]}<p><b class="nw">${LABELS[level]}:</b> ${html}</p></div>`;
}

const PALETTE = ['#2E3192', '#8CC63F', '#9F1F63', '#4E7F1C', '#5C5FC4', '#C7559A', '#2C8C9E', '#B98A1E', '#7A7C93'];
export const color = (i) => PALETTE[i % PALETTE.length];

export function barList(rows, { total, fmt = fmt$ } = {}) {
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 1);
  return `<div class="bars" role="list">${rows.map((r, i) => `<div class="bar" role="listitem"><span>${esc(r.label)}</span><span class="tr" aria-hidden="true"><span class="fl" style="display:block;width:${(Math.abs(r.value) / max) * 100}%;background:${r.color || color(i)}"></span></span><span class="a">${fmt(r.value)}${total ? `<br><small style="font-weight:400;color:var(--gray)">${r.value / total > 0 && r.value / total < 0.01 ? '<1%' : fmtPct(r.value / total, 0)}</small>` : ''}</span></div>`).join('')}</div>`;
}

/** Line chart. series: [{name, color, dash, points:[{x,y}]}] */
export function lineChart(series, o = {}) {
  const W = 640, H = 320, m = { l: 78, r: 16, t: 18, b: 50 };
  const xs = series.flatMap((s) => s.points.map((p) => p.x));
  const ys = series.flatMap((s) => s.points.map((p) => p.y)).concat(o.zero ? [0] : []);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (y0 === y1) { y0 -= 1; y1 += 1; }
  const pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
  const X = (v) => m.l + ((v - x0) / (x1 - x0 || 1)) * (W - m.l - m.r);
  const Y = (v) => H - m.b - ((v - y0) / (y1 - y0)) * (H - m.t - m.b);
  const ticks = (a, b, n) => { const st = niceStep((b - a) / n); const out = []; for (let v = Math.ceil(a / st) * st; v <= b; v += st) out.push(v); return out; };
  const yt = ticks(y0, y1, 5), xt = ticks(x0, x1, 5);
  const fx = o.xfmt || ((v) => v), fy = o.yfmt || fmtShort;
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'Chart')}">`;
  yt.forEach((v) => (svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e6e8f0"/><text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="15" fill="#3a3c52">${fy(v)}</text>`));
  xt.forEach((v) => (svg += `<text x="${X(v)}" y="${H - m.b + 18}" text-anchor="middle" font-size="15" fill="#3a3c52">${fx(v)}</text>`));
  if (o.zero && y0 < 0 && y1 > 0) svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(0)}" y2="${Y(0)}" stroke="#1d1e33" stroke-width="1.5"/><text x="${W - m.r}" y="${Y(0) - 5}" text-anchor="end" font-size="14" fill="#1d1e33">$0 profit (break-even)</text>`;
  (o.vlines || []).forEach((vl) => { if (vl.x >= x0 && vl.x <= x1) svg += `<line x1="${X(vl.x)}" x2="${X(vl.x)}" y1="${m.t}" y2="${H - m.b}" stroke="${vl.color || '#9F1F63'}" stroke-dasharray="4 4"/><text x="${X(vl.x) + 4}" y="${m.t + 12}" font-size="14" fill="${vl.color || '#9F1F63'}">${esc(vl.label)}</text>`; });
  series.forEach((s, i) => {
    const c = s.color || color(i);
    svg += `<polyline fill="none" stroke="${c}" stroke-width="3" ${s.dash ? 'stroke-dasharray="7 5"' : ''} points="${s.points.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')}"/>`;
    s.points.forEach((p) => (svg += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="3.5" fill="${c}"><title>${esc(s.name)}: ${fx(p.x)} → ${fmt$(p.y)}</title></circle>`));
  });
  if (o.xTitle) svg += `<text x="${(W + m.l) / 2}" y="${H - 6}" text-anchor="middle" font-size="15" fill="#1d1e33">${esc(o.xTitle)}</text>`;
  svg += '</svg>';
  const legend = `<div class="legend">${series.map((s, i) => `<span><i style="background:${s.color || color(i)}"></i>${esc(s.name)}${s.dash ? ' (dashed)' : ''}</span>`).join('')}</div>`;
  return svg + legend;
}
function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1))); const n = raw / p; return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p; }
export const fmtShort = (v) => { const a = Math.abs(v); const s = v < 0 ? '−' : ''; return a >= 1e6 ? `${s}$${(a / 1e6).toFixed(1)}M` : a >= 1000 ? `${s}$${Math.round(a / 1000)}k` : `${s}$${Math.round(a)}`; };

/** Two-column stacked chart: total uses vs layered sources. */
export function stackChart(uses, layers, o = {}) {
  const W = 700, H = 340, m = { t: 16, b: 46 };
  const top = Math.max(uses, layers.reduce((s, l) => s + Math.max(0, l.value), 0), 1);
  const Y = (v) => ((H - m.t - m.b) * v) / top;
  const colW = 150, gx1 = 40, gx2 = 260;
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'Capital stack')}">`;
  svg += `<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fbeaf2"/><line x1="0" y1="0" x2="0" y2="8" stroke="#9F1F63" stroke-width="3"/></pattern></defs>`;
  const base = H - m.b;
  svg += `<rect x="${gx1}" y="${base - Y(uses)}" width="${colW}" height="${Y(uses)}" fill="#1d1e33" rx="4"/><text x="${gx1 + colW / 2}" y="${base - Y(uses) / 2}" fill="#fff" text-anchor="middle" font-size="14" font-weight="700">${fmtShort(uses)}</text><text x="${gx1 + colW / 2}" y="${base + 20}" text-anchor="middle" font-size="13" font-weight="700" fill="#1d1e33">Total uses</text>`;
  let y = base;
  layers.forEach((l, i) => {
    const h = Y(Math.max(0, l.value)); if (h <= 0) return;
    y -= h;
    const fill = l.pattern ? 'url(#hatch)' : l.color || color(i);
    svg += `<rect x="${gx2}" y="${y}" width="${colW}" height="${h}" fill="${fill}" stroke="#fff" stroke-width="1.5"><title>${esc(l.label)}: ${fmt$(l.value)}</title></rect>`;
    if (h > 16) svg += `<text x="${gx2 + colW / 2}" y="${y + h / 2 + 5}" fill="${l.pattern || l.light ? '#5c0f37' : '#fff'}" text-anchor="middle" font-size="14" font-weight="700">${fmtShort(l.value)}</text>`;
    svg += `<line x1="${gx2 + colW + 4}" x2="${gx2 + colW + 14}" y1="${y + h / 2}" y2="${y + h / 2}" stroke="#9a9cb0"/><text x="${gx2 + colW + 18}" y="${y + h / 2 + 4}" font-size="14" fill="#1d1e33">${esc(l.short || l.label)}</text>`;
  });
  svg += `<text x="${gx2 + colW / 2}" y="${base + 20}" text-anchor="middle" font-size="13" font-weight="700" fill="#1d1e33">Sources</text>`;
  svg += `<line x1="20" x2="${W - 10}" y1="${base}" y2="${base}" stroke="#1d1e33"/></svg>`;
  return svg;
}

/* ------------------------------------------------------------------ */
/* Learning blocks                                                      */
/* ------------------------------------------------------------------ */
export function learnTeach(html) {
  return `<section class="learn teach" aria-labelledby="teach-h"><h3 id="teach-h"><span class="ic">i</span>What This Tool Teaches</h3>${html}</section>`;
}
export function learnTry(ex, title, html) {
  return `<section class="learn try" id="exercise" data-ex="${ex}" aria-labelledby="try-h"><h3 id="try-h"><span class="ic">✎</span>Try It Yourself: ${esc(title)}</h3>${html}</section>`;
}
export function learnReflect(page, questions) {
  return `<section class="learn reflect" aria-labelledby="refl-h"><h3 id="refl-h"><span class="ic">?</span>What Did You Learn?</h3>
  <p class="note">Your answers save only in this browser and appear in your downloaded summary.</p>
  ${questions.map((q, i) => `<label class="q" for="r-${page}-${i}">${i + 1}. ${esc(q)}</label><textarea id="r-${page}-${i}" data-bind="reflections.${page}-${i}" data-kind="text"></textarea>`).join('')}</section>`;
}

/* ------------------------------------------------------------------ */
/* Downloads                                                            */
/* ------------------------------------------------------------------ */
export const slug = (s) => String(s || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function download(name, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
export function csv(rows) {
  return rows.map((r) => r.map((c) => { const s = c === null || c === undefined ? '' : String(c); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\n');
}
/** Download bar for a calculator. getRows() returns [[label, value], ...] */
export function downloadBar(tool, project, getRows) {
  const id = 'dl-' + tool.replace(/\W/g, '');
  setTimeout(() => {
    $(`#${id}-csv`).addEventListener('click', () => {
      const head = [[`${BRAND} | ${LAB}`], [tool], ['Project', project.name], ['Analysis date', new Date().toISOString().slice(0, 10)], []];
      download(`${slug(project.name)}-${slug(tool)}.csv`, csv(head.concat(getRows())), 'text/csv');
    });
    $(`#${id}-json`).addEventListener('click', () => download(`${slug(project.name)}-eda-project.json`, JSON.stringify(project, null, 2), 'application/json'));
    $(`#${id}-pdf`).addEventListener('click', () => window.print());
  });
  return `<div class="card noprint"><h3>Download My Analysis</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" id="${id}-pdf" type="button">Print or save as PDF</button>
      <button class="btn alt" id="${id}-csv" type="button">Download calculations (CSV)</button>
      <button class="btn alt" id="${id}-json" type="button">Download project file (JSON)</button>
      <a class="btn g" href="summary.html">Open the full Feasibility Summary</a>
    </div>
    <p class="note">To make a PDF, choose "Save as PDF" in the print window. The project file can be reopened later with More ▾ → Open project file.</p></div>`;
}

export function nextBar(prev, next) {
  return `<div class="nextbar noprint">${prev ? `<a class="btn alt" href="${prev[0]}">← ${esc(prev[1])}</a>` : '<span></span>'}${next ? `<a class="btn" href="${next[0]}">Next: ${esc(next[1])} →</a>` : ''}</div>`;
}

export function caseNotes(p) {
  if (p.kind !== 'case' || !p.assumptionNotes) return '';
  return `<details class="more"><summary>Where do the Joseph Place numbers come from?</summary><ul class="note">${p.assumptionNotes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></details>`;
}

// Explains a financing gap as "costs no committed source pays for" (Joseph Place: interest + loan fees)
export function gapWhy(p, c) {
  if (!(c.gapCommitted > 0.5) || !p.budget || !p.budget.exhibitTotal) return null;
  const items = c.budget.items.filter((i) => !i.atClosing && (i.value || 0) > 0);
  const fin = items.filter((i) => i.basis === 'linked' && (['interest', 'interestBuild', 'interestHold', 'loanFees'].includes(i.link)));
  const finTot = fin.reduce((t, i) => t + i.value, 0);
  const dev = c.uses - finTot;
  if (Math.abs(finTot - c.gapCommitted) > 1 && c.gapCommitted > 0.5) { /* partial reserve */ }
  if (!(c.gapCommitted > 0.5)) return null;
  const resv = (p.sources || []).filter((x) => x.type === 'loanReserve' && x.status === 'committed').reduce((t, x) => t + E.num(x.amount), 0);
  if (resv > 0) {
    const ff = (v) => '$' + Math.round(v).toLocaleString('en-US');
    const rowsR = `<tr><td>Total uses before the sale</td><td class="n">${ff(c.uses)}</td></tr><tr><td>− Construction loan</td><td class="n">${ff(c.loan)}</td></tr><tr><td>− Gabe's cash (owner's equity + cost of the loan)</td><td class="n">${ff(c.devEquityCommitted)}</td></tr><tr><td>− Available reserves for holding costs</td><td class="n">${ff(resv)}</td></tr><tr class="tot"><td>= Not yet covered</td><td class="n">${ff(c.gapCommitted)}</td></tr>`;
    return { rows: rowsR, text: `The available reserves (${ff(resv)}) were sized for the planned schedule. Loan payments now total ${ff(c.uses - c.loan - c.devEquityCommitted)}, so ${ff(c.gapCommitted)} is not covered. Gabe must bring more cash or add to the reserves.` };
  }
  const f = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const nm = (i) => String(i.name).replace(/</g, '&lt;');
  const rows = `<tr><td>Development budget</td><td class="n">${f(dev)}</td></tr>
    ${fin.map((i) => `<tr><td>+ ${nm(i)}</td><td class="n">${f(i.value)}</td></tr>`).join('')}
    <tr class="tot"><td>= Total uses before the sale</td><td class="n">${f(c.uses)}</td></tr>
    <tr><td>− Committed sources (loan + developer equity)</td><td class="n">${f(c.committed)}</td></tr>
    <tr class="tot"><td>= Financing gap</td><td class="n">${f(c.gapCommitted)}</td></tr>`;
  const partsA = fin.map((i) => `${i.link === 'loanFees' ? 'loan fees' : i.link === 'interestBuild' ? 'interest during construction' : i.link === 'interestHold' ? 'interest while marketing' : 'construction interest'} (${f(i.value)})`);
  const parts = partsA.length > 1 ? partsA.slice(0, -1).join(', ') + ' and ' + partsA[partsA.length - 1] : partsA.join('');
  const text = `The ${f(c.loan)} loan and ${f(c.committed - c.loan)} owner's equity (Gabe's cash on hand) cover the ${f(dev)} development budget. ${parts.charAt(0).toUpperCase() + parts.slice(1)} still need a source: ${f(finTot)} in all.`;
  return { rows, text };
}

/** Itemized "how each casebook figure is calculated" panel for the instructional case. */
let cmProject = null;
export function caseMath(p, keys) {
  if (p.kind !== 'case') return '';
  cmProject = p; setTimeout(refreshCaseMath, 0);
  return `<details class="card casemath" open><summary><h3 style="display:inline">How the casebook figures are calculated</h3></summary>
    <div class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"><table class="tbl"><thead><tr><th>Figure</th><th class="n">Amount</th><th>How it is calculated</th><th>Casebook</th></tr></thead><tbody data-cm="${(keys || []).join(',')}"></tbody></table></div>
    <p class="note">Amounts update if you change the case inputs. Reset to Joseph Place to return to the casebook figures.</p></details>`;
}
export function refreshCaseMath() {
  const p = cmProject; if (!p) return;
  document.querySelectorAll('tbody[data-cm]').forEach((tb) => { tb.innerHTML = caseMathRows(p, tb.dataset.cm ? tb.dataset.cm.split(',') : null); });
}
function caseMathRows(p, keys) {
  const b = E.budgetTotals(p), r = E.pencilTest(p), c = E.capitalStack(p);
  const f = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const item = (pred) => b.items.filter(pred).reduce((t, i) => t + (i.value || 0), 0);
  const exD = item((i) => (i.note || '').startsWith('Exhibit D'));
  const fees = item((i) => i.link === 'loanFees');
  const intr = c.interest, sell = b.atClosing;
  const dev = c.uses - fees - intr.total;
  const fx = p.finance, months = E.num(p.timeline.buildMonths) + E.num(p.timeline.saleMonths);
  const monthly = E.num(fx.loanAmount) * E.num(fx.ratePct) / 100 / 12;
  const exactSell = E.num(p.sale.price) * (E.num(p.sale.commissionPct) + E.num(p.sale.sellerClosingPct)) / 100;
  const res = (p.sources || []).filter((x) => x.type === 'loanReserve' && x.status === 'committed').reduce((t, x) => t + E.num(x.amount), 0);
  const eqSrc = c.sources.find((x) => x.id === 'jp-eq');
  const eq = eqSrc ? E.num(eqSrc.amount) : c.devEquityCommitted;
  const incAmt = (p.sources || []).filter((x) => x.type === 'incentive').reduce((t, x) => t + E.num(x.amount), 0);
  const all = {
    price: ['Sale price', f(r.price), `Working price from the CMA estimate of $213,958 (Exhibit C), rounded.`, 'p. 9'],
    budget: ['Development budget', f(dev), `Exhibit D line items ${f(exD)}${dev - exD ? ` + ${f(dev - exD)} to the casebook's ${f(dev)} total` : ''}.`, 'pp. 15, 19'],
    interest: ['Loan interest', f(intr.total), `${f(E.num(fx.loanAmount))} × ${E.num(fx.ratePct)}% ÷ 12 = ${f(monthly)} a month. <b>During construction</b>: ${E.num(p.timeline.buildMonths)} months = ${f(intr.buildExact)}${Math.abs(intr.build - intr.buildExact) > 0.5 ? `, about ${f(intr.build)}` : ''}. <b>While marketing the home</b>: ${E.num(p.timeline.saleMonths)} months = ${f(intr.holdExact)}${Math.abs(intr.hold - intr.holdExact) > 0.5 ? `, about ${f(intr.hold)}` : ''}. The casebook rounds each to the nearest $1,000.`, 'p. 20'],
    fees: ['Cost of the loan (fees)', f(fees), `${f(E.num(fx.applicationFee))} THF application fee, paid when the application is submitted (fixed)${E.num(fx.originationPct) ? ` + ${E.num(fx.originationPct)}% origination fee × ${f(E.num(fx.loanAmount))} loan = ${f(E.num(fx.loanAmount) * E.num(fx.originationPct) / 100)}, paid at loan closing if approved` : ''}${E.num(fx.originationFee) ? ` + ${f(E.num(fx.originationFee))} origination fee` : ''}. The origination fee changes with the loan amount. Paid from Gabe's cash on hand; not part of the reserves.`, 'p. 20'],
    selling: ['Selling costs', f(sell), `${E.num(p.sale.commissionPct) + E.num(p.sale.sellerClosingPct)}% × ${f(r.price)} = ${f(exactSell)}${Math.abs(sell - exactSell) > 0.5 ? `, rounded to the nearest $1,000 as in the casebook: ${f(sell)}` : ''}. Paid from the sale at closing.`, 'pp. 17, 21'],
    tdc: ['Total modeled costs', f(b.tdc), `${f(dev)} budget + ${f(intr.build)} construction interest + ${f(intr.hold)} marketing interest + ${f(fees)} cost of the loan + ${f(sell)} selling costs.`, 'p. 22'],
    net: ['Net sales revenue', f(r.net), `${f(r.price)} sale − ${f(sell)} selling costs.`, 'p. 21'],
    profit: ['Preliminary developer return', f(r.profit), `${f(r.net)} net − ${f(dev)} budget − ${f(intr.build)} construction interest − ${f(intr.hold)} marketing interest − ${f(fees)} cost of the loan${r.incentive ? ` + ${f(r.incentive)} incentive` : ''}.`, 'pp. 21, 30'],
    loan: ['Construction loan', f(c.loan), `THF lends 90% of the ${f(c.eligible)} total development cost: ${f(c.eligible * 0.9)}, about ${f(c.loan)}. The loan amount does not change with how Gabe applies his cash.`, 'p. 19'],
    equity: ['Owner\'s equity (Gabe\'s cash on hand)', f(eq), `THF's required minimum is 10% of total development cost: 10% × ${f(c.eligible)} = about ${f(c.lenderMinEquity || 0)}. Gabe applies his cash wherever the loan does not reach: ${f(c.eligible - c.loan)} of the budget + ${f(fees)} cost of the loan = ${f(eq)}. That meets the minimum.`, 'p. 19'],
    reserve: ['Available reserves for holding costs', f(res), `Interest-only loan payments: ${f(intr.build)} during construction + ${f(intr.hold)} while marketing = ${f(intr.total)}. Set aside and drawn over time, then repaid from the sale.${c.gapCommitted > 0.5 ? ` ${f(c.gapCommitted)} is not yet covered.` : ''}`, 'pp. 19–20'],
    cash: ['Gabe\'s cash in the deal', f(c.requiredEquity), `Minimum THF contribution ${f(c.lenderMinEquity || 0)} + ${f(c.requiredEquity - (c.lenderMinEquity || 0))} applied to the cost of the loan (application fee at submission, origination at closing). Available reserves cover the loan payments.`, 'p. 19'],
    incentive: ['CRA Essential Housing incentive', f(incAmt), `Tied to this parcel and still conditional. A project source, not owner's equity. If awarded, it can pay for the developer's financing gap, site costs, predevelopment, or added features such as eco-build standards. Gabe's ${f(c.lenderMinEquity || eq)} minimum contribution stays the same.`, 'pp. 5–6'],
    closing: ['Cash left at closing', f(r.net - c.loan - res), `${f(r.net)} net − ${f(c.loan)} loan − ${f(res)} reserves repaid = Gabe's ${f(c.devEquityCommitted)} cash back + the ${f(r.profit)} return.`, 'p. 30'],
  };
  const list = (keys || Object.keys(all)).map((k) => all[k]).filter(Boolean);
  return list.map(([a, v, how, pg]) => `<tr><td><b>${a}</b></td><td class="n">${v}</td><td class="tx" style="text-align:left">${how}</td><td style="white-space:nowrap">${pg}</td></tr>`).join('');
}
