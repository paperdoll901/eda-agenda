import * as S from './store.js?v=1793745986';
import * as E from './engine.js?v=1793745986';
import * as U from './ui.js?v=1793745986';

const { main, project: p } = U.shell('budget', 'Development Budget Builder');
const { fmt$, fmtPct, esc, tip } = U;

const BASIS = [
  ['fixed', 'Fixed $ amount'],
  ['qty', 'Quantity × unit price'],
  ['pct', 'Percentage'],
  ['monthly', 'Per month × project months'],
];
const PCT_OF = [['hard', '% of hard costs'], ['hardsite', '% of hard + site costs'], ['sale', '% of gross sales']];
const LINK_TEXT = {
  interest: 'Calculated from the construction loan (Capital Stack tool)',
  interestBuild: 'Loan interest for the construction months (Capital Stack tool)',
  interestHold: 'Loan interest for the months on the market (Capital Stack tool)',
  loanFees: 'Calculated from loan fees (Capital Stack tool)',
  commission: 'Calculated from the commission % and sales price',
  sellerClosing: 'Calculated from the seller paid closing % and sales price',
};

main.innerHTML = `
<div class="pagehead"><div><h2>1 · Development Budget Builder</h2><p class="q">What will the complete project cost, from land to sale?</p></div></div>
${U.learnTeach(`<p>A development budget is more than the builder's construction estimate. It is every dollar needed to buy the land, prepare and build, carry the project while it is built and sold, and close the sale. That total is the <b>Total Development Cost (TDC)</b> ${tip('tdc')}.</p>
<p>Each line belongs to exactly one category so nothing is counted twice. Loan <i>principal</i> is never a cost. It is how you pay for the costs. Loan <i>interest and fees</i> are costs. This budget feeds the Pencil Test and the Capital Stack tools automatically.</p>${U.caseNotes(p)}`)}
<div class="grid">
  <div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> Project basics</h3>
      <div class="fields">
        ${U.field('name', 'Project name', { kind: 'text' })}
        ${U.field('location', 'Location', { kind: 'text' })}
        ${U.field('units', 'Residential units', { kind: 'num', min: 0, step: 1 })}
        ${U.field('sqft', 'Total building sq. ft.', { kind: 'num', min: 0, hint: p.sqftNote ? 'See note below' : '' })}
        ${U.field('timeline.buildMonths', 'Construction months', { kind: 'num', min: 0, step: 1 })}
        ${U.field('timeline.saleMonths', 'Marketing & sale months', { kind: 'num', min: 0, step: 1, tip: 'holding' })}
        ${U.field('sale.price', 'Sales price per unit', { hint: 'Used for %-of-sale lines' })}
        ${U.field('sale.commissionPct', 'Sales commission %', { kind: 'pct', hint: 'Brokerage, or all selling costs combined' })}
        ${U.field('sale.sellerClosingPct', 'Seller paid closing cost %', { kind: 'pct', hint: 'Only if not already in the % above' })}
      </div>
      ${p.sqftNote ? `<p class="src">${esc(p.sqftNote)}</p>` : ''}
      ${p.budget.exhibitTotal && E.num(p.sale.sellerClosingPct) === 0 ? `<p class="src">Casebook: one combined ${E.num(p.sale.commissionPct)}% of the sale price covers brokerage <i>and</i> seller paid closing costs (${fmt$(E.num(p.sale.price) * E.num(p.sale.commissionPct) / 100)} at ${fmt$(E.num(p.sale.price))}; about $13,000 in the casebook). Seller paid closing cost is 0% so it is not counted twice. Enter a % there only to test closing costs beyond the casebook's 6%.</p>` : ''}
      ${p.sale.priceNote ? `<p class="src">${esc(p.sale.priceNote)}</p>` : ''}
    </div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> Revised budget: model a cost increase</h3>
      <div class="fields">
        ${U.field('budget.costIncreasePct', 'Hard-cost increase in the revised budget', { kind: 'pct', hint: 'Applies to category D in the revised column only' })}
      </div>
    </div>
  </div>
  <div class="sticky">
    <div class="card results"><h3><span class="tag out">Results</span> Budget summary</h3><div id="res"></div></div>
  </div>
</div>
<div class="card inputs"><h3><span class="tag in">Inputs</span> Budget line items</h3>
      <p class="note" style="margin-top:-4px">Open a category to add, edit, duplicate or remove lines. Enter a <b>revised estimate</b> on any line to compare it with the baseline. Lines marked "linked" update from other tools so they are entered only once.</p>
      <div id="cats"></div>
    </div>
<div class="card results"><h3><span class="tag out">Results</span> Baseline vs. revised budget</h3><div id="cmp" class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"></div></div>
${U.caseMath(p, ['budget', 'interest', 'fees', 'selling', 'tdc'])}
${U.learnTry(1, 'Joseph Place development budget', `<p>The Joseph Place budget is <b>Exhibit D</b>, Ferrybrook Holdings' construction budget, with every line placed in a Learning Lab category. Each line shows its Exhibit D reference.</p><ol>
<li>Open each category. Notice that the builder's "General Project Requirements" (Exhibit D section 1) is split across <b>predevelopment</b> (design review, permits), <b>sitework</b> (utility connection fees), <b>soft costs</b> (insurance, project management) and <b>holding costs</b> (job security). Why does a developer separate them?</li>
<li>Exhibit D totals about <b>$162,000</b>. Interest (about $12,000), loan fees ($2,000) and selling costs (about $13,000) are <i>not</i> in Exhibit D. What is the full Total Development Cost?</li>
<li>Exhibit D leaves out two costs the casebook says Gabe must confirm: acquisition closing costs (title, legal) and holding costs during the 9-month sale period (taxes, insurance, utilities). Add them: in <b>Land Acquisition</b> click <b>+ Add a line</b> and enter an estimate; in <b>Financing &amp; Holding</b> add a line, choose <b>Per month × project months</b>, and enter a monthly estimate. How much do they reduce profit in the Pencil Test?</li>
<li>The $5,000 builder contingency is about 3.8% of hard costs. Is that enough? Enter a 10% hard-cost increase in the revised budget and compare.</li>
<li>Exhibit D reports $107 per sq. ft. for construction. The Lab shows hard costs per sq. ft. lower, and total cost per sq. ft. higher. Why are they different?</li></ol>`)}
${U.learnReflect('budget', ['Which costs are easiest to forget when a builder hands you a construction estimate?', 'Why does the casebook warn that closing costs may appear three times?', 'How would a three-month sales delay change this budget, and which lines would move?'])}
<div id="dl"></div>
${U.nextBar(['./', 'Lab Home'], ['pencil.html', 'Pencil Test'])}
<p class="disclaim">Budget figures are planning estimates entered by the user. Category definitions are instructional. Confirm every cost with bids, the lender and your professional team.</p>`;

const catsEl = U.$('#cats');
const open = new Set(['D']);

function itemRow(it, idx) {
  const b = `budget.items.${idx}`;
  let calc = '';
  if (it.basis === 'linked') calc = `<span class="calc">🔗 ${esc(LINK_TEXT[it.link] || 'Linked')}</span>`;
  else if (it.basis === 'qty') calc = `<span class="calc"><input type="number" step="any" aria-label="Quantity" data-bind="${b}.qty" data-kind="num" placeholder="Qty"><input type="text" aria-label="Unit" data-bind="${b}.unit" data-kind="text" placeholder="unit" style="width:56px">× $<input type="number" step="any" aria-label="Unit price" data-bind="${b}.unitPrice" data-kind="num" placeholder="Price"></span>`;
  else if (it.basis === 'pct') calc = `<span class="calc"><input type="number" step="any" aria-label="Percent" data-bind="${b}.pct" data-kind="num">%<select aria-label="Percent of" data-bind="${b}.pctOf" data-kind="select">${PCT_OF.map(([v, t]) => `<option value="${v}" ${it.pctOf === v ? 'selected' : ''}>${t}</option>`).join('')}</select></span>`;
  else if (it.basis === 'monthly') calc = `<span class="calc">$<input type="number" step="any" aria-label="Monthly amount" data-bind="${b}.monthly" data-kind="num">/mo × <span data-months></span></span>`;
  else calc = `<span class="calc">$<input type="number" step="any" min="0" aria-label="Amount for ${esc(it.name)}" data-bind="${b}.amount" data-kind="num"></span>`;
  const basisSel = it.basis === 'linked' ? '<span class="calc">Linked</span>' : `<select aria-label="How this cost is calculated" data-basis="${idx}">${BASIS.map(([v, t]) => `<option value="${v}" ${it.basis === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
  const revised = it.basis === 'linked' ? '<span class="calc" style="justify-content:flex-end">n/a</span>' : `<input type="number" step="any" min="0" aria-label="Revised estimate" placeholder="Revised" data-bind="${b}.revised" data-kind="num">`;
  const closing = it.cat === 'H' && !it.isDeveloperFee && it.basis !== 'linked' ? `<label class="nt" style="color:var(--gray)"><input type="checkbox" data-bind="${b}.atClosing" data-kind="bool"> Paid from sale proceeds at closing</label>` : '';
  return `<div class="item" data-idx="${idx}">
    <input class="nm" type="text" aria-label="Line item name" data-bind="${b}.name" data-kind="text">
    ${basisSel}${calc}${revised}
    <span class="val" data-val="${idx}"></span>
    <span class="acts"><button class="btn ghost sm" type="button" data-dup="${idx}" title="Duplicate line" aria-label="Duplicate ${esc(it.name)}">⧉</button>${it.basis === 'linked' ? '' : `<button class="btn ghost sm" type="button" data-del="${idx}" title="Remove line" aria-label="Remove ${esc(it.name)}">✕</button>`}</span>
    ${it.note ? `<span class="nt">Source: ${esc(it.note)}</span>` : ''}${closing}
  </div>`;
}

function renderCats() {
  catsEl.innerHTML = E.CATEGORIES.filter((c) => c.key !== 'U' || p.budget.items.some((i) => i.cat === 'U')).map((c) => {
    const rows = p.budget.items.map((it, i) => [it, i]).filter(([it]) => it.cat === c.key);
    return `<details class="cat ${c.key}" data-cat="${c.key}" ${open.has(c.key) ? 'open' : ''}>
      <summary><span class="k">${c.key}</span><span class="t">${esc(c.name)}</span><span class="z" data-zero="${c.key}" hidden>$0</span><span class="a" data-sub="${c.key}"></span></summary>
      <div class="items">
        <div class="item itemhead"><span>Line item</span><span>Basis</span><span>Calculation</span><span>Revised</span><span style="text-align:right">Baseline</span><span></span></div>
        ${rows.map(([it, i]) => itemRow(it, i)).join('') || '<p class="note">No lines yet.</p>'}
        <button class="btn alt sm" type="button" data-add="${c.key}" style="margin-top:8px">+ Add a line to ${esc(c.short)}</button>
      </div></details>`;
  }).join('');
  binder.fill();
  update();
}

catsEl.addEventListener('toggle', (e) => { const d = e.target.closest('details.cat'); if (d) (d.open ? open.add : open.delete).call(open, d.dataset.cat); }, true);
catsEl.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]'), dup = e.target.closest('[data-dup]'), del = e.target.closest('[data-del]');
  if (add) { p.budget.items.push({ id: S.newId(), cat: add.dataset.add, name: 'New line item', basis: 'fixed', amount: 0, revised: null }); U.saved(); renderCats(); }
  if (dup) { const src = p.budget.items[+dup.dataset.dup]; const c = JSON.parse(JSON.stringify(src)); c.id = S.newId(); c.name = src.name + ' (copy)'; if (c.basis === 'linked') { c.basis = 'fixed'; c.amount = 0; delete c.link; } p.budget.items.splice(+dup.dataset.dup + 1, 0, c); U.saved(); renderCats(); }
  if (del) { const it = p.budget.items[+del.dataset.del]; U.askBox(`Remove "${it.name}"?`, { ok: 'Remove' }).then((ok) => { if (ok) { p.budget.items.splice(+del.dataset.del, 1); U.saved(); renderCats(); } }); }
});
catsEl.addEventListener('change', (e) => {
  const s = e.target.closest('[data-basis]');
  if (!s) return;
  const it = p.budget.items[+s.dataset.basis];
  it.basis = s.value;
  if (it.basis === 'pct' && !it.pctOf) it.pctOf = 'hard';
  U.saved(); renderCats();
});

const binder = U.bind(main, p, () => update());

function update() {
  const b = E.budgetTotals(p);
  const cmp = E.budgetComparison(p);
  b.items.forEach((it, i) => { const el = U.$(`[data-val="${i}"]`); if (el) el.textContent = fmt$(it.value); });
  U.$$('[data-months]').forEach((el) => (el.textContent = `${b.months} months`));
  E.CATEGORIES.forEach((c) => {
    const s = U.$(`[data-sub="${c.key}"]`); if (s) s.textContent = fmt$(b.byCat[c.key]);
    const z = U.$(`[data-zero="${c.key}"]`); if (z) z.hidden = b.byCat[c.key] > 0;
  });
  const issues = E.validateProject(p).filter((v) => v.field.startsWith('item') || v.field === 'budget' || v.field === 'units' || v.field === 'timeline');
  const zero = b.zeroCats.map((k) => E.CATEGORIES.find((c) => c.key === k).short);
  const unitemized = b.byCat.U;
  const rows = E.CATEGORIES.filter((c) => b.byCat[c.key] > 0).map((c, i) => ({ label: c.short, value: b.byCat[c.key] }));
  U.$('#res').innerHTML = `
    <div class="kpis">
      ${U.kpi('Total Development Cost', fmt$(b.tdc), `${p.units} unit${p.units == 1 ? '' : 's'} · ${b.months} months`, 'hero', 'tdc')}
      ${U.kpi('Cost per sq. ft.', b.perSf === null ? 'Not yet calculated' : fmt$(b.perSf), 'TDC ÷ building sq. ft.')}
      ${U.kpi('Construction cost per sq. ft.', b.hardPerSf === null ? 'Not yet calculated' : fmt$(b.hardPerSf), 'Hard costs ÷ sq. ft.', '', 'hard')}
      ${U.kpi('Hard construction', fmt$(b.byCat.D), fmtPct(b.tdc ? b.byCat.D / b.tdc : null, 0) + ' of TDC', '', 'hard')}
      ${U.kpi('Financing & holding', fmt$(b.byCat.F), `Interest ${fmt$(b.interest)} · fees ${fmt$(b.fees)}`, '', 'holding')}
      ${U.kpi('Paid at closing from sale', fmt$(b.atClosing), 'Commissions & seller costs')}
    </div>
    <h4 style="margin:16px 0 8px;font-size:14px">Cost category distribution</h4>
    ${rows.length ? U.barList(rows, { total: b.tdc }) : '<p class="note">Add costs to see the breakdown.</p>'}
    <table class="tbl" style="margin-top:12px"><tbody>
      ${E.CATEGORIES.filter((c) => c.key !== 'U' || b.byCat.U > 0).map((c) => `<tr><td>${c.key} · ${esc(c.name)}</td><td class="n">${fmt$(b.byCat[c.key])}</td></tr>`).join('')}
      <tr class="tot"><td>Total Development Cost</td><td class="n">${fmt$(b.tdc)}</td></tr>
      <tr><td>Includes developer fee</td><td class="n">${fmt$(b.developerFee)}</td></tr>
    </tbody></table>
    ${unitemized > 0 ? U.status('warn', `${fmt$(unitemized)} of the budget is not yet itemized. Assign it to categories so missing costs can be found.`) : ''}
    ${p.budget.exhibitTotal ? (() => { const isD = (i) => (i.note || '').startsWith('Exhibit D'); const ex = b.items.filter(isD).reduce((t, i) => t + (i.value || 0), 0); const out = b.items.filter((i) => !isD(i) && (i.value || 0) > 0); const ok = Math.abs(ex + out.reduce((t, i) => t + i.value, 0) - b.tdc) < 1; return `<div class="status info recon" role="status"><div style="flex:1;min-width:0"><b>How the Total Development Cost is built</b><table class="tbl" style="margin:8px 0 4px"><tbody><tr><td>Exhibit D construction budget (line items)</td><td class="n">${fmt$(ex)}</td></tr>${out.map((i) => `<tr><td>+ ${esc(i.name)} ${(i.note || '').startsWith('Casebook') ? '<span class="note">(casebook)</span>' : ''}</td><td class="n">${fmt$(i.value)}</td></tr>`).join('')}<tr class="tot"><td>= Total Development Cost</td><td class="n">${fmt$(b.tdc)}</td></tr></tbody></table><div class="fac-only" style="display:none">Facilitator note: Exhibit D prints ${fmt$(p.budget.exhibitTotal)} because its own subtotals round up by a few dollars; the casebook rounds the same budget to $162,000. The Lab uses the line items as written.</div></div></div>`; })() : ''}
    ${(() => { const z = b.items.filter((i) => i.basis !== 'linked' && !(i.value > 0)); return z.length ? U.status('warn', `<b>${z.length} line${z.length > 1 ? 's are' : ' is'} $0:</b> ${z.map((i) => esc(i.name)).join('; ')}. Estimate each, or confirm it is truly zero.`) : ''; })()}
    ${zero.length ? U.status('warn', `These categories are $0: <b>${zero.join(', ')}</b>. Confirm each is truly zero or already included elsewhere.`) : ''}
    ${issues.map((v) => U.status(v.level === 'error' ? 'bad' : 'warn', esc(v.text))).join('')}
    <p class="note">Selling costs are part of TDC but are paid from the sale proceeds at closing. The Pencil Test deducts them once; the Capital Stack does not ask lenders or equity to fund them.</p>`;
  const chg = (v) => (v === 0 ? '·' : (v > 0 ? '▲ ' : '▼ ') + fmt$(Math.abs(v)));
  U.$('#cmp').innerHTML = `<table class="tbl cmpt"><thead><tr><th>Category</th><th class="n">Baseline</th><th class="n">Revised</th><th class="n chg">Change</th></tr></thead><tbody>
    ${cmp.rows.filter((r) => r.key !== 'U' || r.base > 0 || r.revised > 0).map((r) => `<tr><td>${r.key} · ${esc(E.CATEGORIES.find((c) => c.key === r.key).short)}</td><td class="n">${fmt$(r.base)}</td><td class="n">${fmt$(r.revised)}${r.change ? `<span class="chg2">${chg(r.change)}</span>` : ''}</td><td class="n chg">${chg(r.change)}</td></tr>`).join('')}
    <tr class="tot"><td>Total (TDC)</td><td class="n">${fmt$(cmp.base.tdc)}</td><td class="n">${fmt$(cmp.revised.tdc)}${cmp.change ? `<span class="chg2">${chg(cmp.change)}</span>` : ''}</td><td class="n chg">${chg(cmp.change)}</td></tr>
  </tbody></table><p class="note">Revised = revised estimates where entered, plus the ${E.num(p.budget.costIncreasePct)}% hard-cost increase. ▲ means the revised budget costs more.</p>`;
}

U.$('#dl').innerHTML = U.downloadBar('Development Budget Builder', p, () => {
  const b = E.budgetTotals(p); const r = E.budgetTotals(p, { revised: true });
  return [['Category', 'Line item', 'Basis', 'Baseline', 'Revised', 'Paid at closing']]
    .concat(b.items.map((it, i) => [it.cat, it.name, it.basis, Math.round(it.value), Math.round(r.items[i].value), it.atClosing ? 'yes' : '']))
    .concat([[], ['Summary'], ...E.CATEGORIES.map((c) => [c.key, c.name, '', Math.round(b.byCat[c.key]), Math.round(r.byCat[c.key])]), ['', 'Total Development Cost', '', Math.round(b.tdc), Math.round(r.tdc)], ['', 'Cost per sq. ft.', '', b.perSf ? b.perSf.toFixed(2) : 'Not yet calculated'], ['', 'Construction cost per sq. ft.', '', b.hardPerSf ? b.hardPerSf.toFixed(2) : 'Not yet calculated']]);
});
renderCats();
