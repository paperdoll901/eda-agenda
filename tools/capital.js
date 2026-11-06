import * as S from './store.js?v=1793946295';
import * as E from './engine.js?v=1793946295';
import * as U from './ui.js?v=1793946295';

const { main, project: p } = U.shell('capital', 'Capital Stack & Financing Simulator');
const { fmt$, fmtPct, esc, tip } = U;
p.sources = p.sources || [];
p.finance.draws = p.finance.draws || [];

const STATUS_OPTS = [['committed', 'Committed'], ['proposed', 'Proposed'], ['conditional', 'Conditional']];
const LAYER_COLORS = { constructionLoan: '#2E3192', loanReserve: '#5C5FC4', cdfi: '#5C5FC4', subordinate: '#7A7C93', predevGrant: '#2C8C9E', projectGrant: '#2C8C9E', incentive: '#B98A1E', investorEquity: '#C7559A', developerEquity: '#4E7F1C', landEquity: '#8CC63F', deferredFee: '#8CC63F', other: '#9a9cb0' };

main.innerHTML = `
<div class="pagehead"><div><h2>3 · Capital Stack & Financing Simulator</h2><p class="q">Where will the money come from, how much developer capital is required, and is the financing plan complete?</p></div></div>
${U.learnTeach(`<p>Every project has <b>uses</b> (what the money pays for) and <b>sources</b> (where the money comes from) ${tip('sources')}. The <b>capital stack</b> ${tip('stack')} layers those sources: the construction loan on top of developer equity, grants and other financing. When committed sources fall short of uses, the difference is a <b>financing gap</b> ${tip('gap')} that the developer must close before construction.</p>
<p><b>Two distinctions every developer must get right:</b></p><ul>
<li>The <b>buyer's mortgage</b> pays the purchase price at closing. That sale repays the construction loan, but the buyer's mortgage is <b>not</b> money available to build the house.</li>
<li>A <b>development incentive</b> ${tip('incentive')} supports the project. <b>Homebuyer assistance</b> ${tip('dpa')} helps the buyer close. They are not interchangeable, and an incentive is not counted as committed until it is approved.</li></ul>${U.caseNotes(p)}`)}
<div class="grid">
  <div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> Construction loan</h3>
      ${p.finance.lender ? `<p class="src" style="margin-top:-4px">${esc(p.finance.lender)}</p>` : ''}
      <div class="fields">
        ${U.field('finance.loanAmount', 'Loan amount')}
        ${U.field('finance.loanStatus', 'Loan status', { kind: 'select', options: STATUS_OPTS })}
        ${U.field('finance.ratePct', 'Interest rate (annual)', { kind: 'pct', tip: 'interest' })}
        ${U.field('finance.termMonths', 'Loan term (months)', { kind: 'num', min: 1 })}
        ${U.field('timeline.buildMonths', 'Construction period (months)', { kind: 'num', min: 0, step: 1 })}
        ${U.field('timeline.saleMonths', 'Marketing & sale period (months)', { kind: 'num', min: 0, step: 1 })}
        ${U.field('finance.applicationFee', 'Application fee')}
        ${U.field('finance.originationFee', 'Origination fee ($)')}
        ${U.field('finance.originationPct', 'Origination fee (% of loan)', { kind: 'pct' })}
        ${U.field('finance.otherLoanFees', 'Other loan fees')}
        ${U.field('finance.interestReserve', 'Interest reserve (inside the loan)', { hint: 'Part of the loan set aside to pay interest' })}
        ${U.field('finance.interestMethod', 'How interest is charged', { kind: 'select', options: [['full', 'Full loan balance from closing'], ['draws', 'On the amount drawn (draw schedule)'], ['average', 'Simplified average-balance estimate']] })}
      </div>
      <div class="fields" style="margin-top:10px">
        ${U.field('finance.ltcLimitPct', 'Lender loan-to-cost limit', { kind: 'pct', tip: 'ltc' })}
        ${U.field('finance.ltvLimitPct', 'Lender loan-to-value limit', { kind: 'pct', tip: 'ltv' })}
        ${U.field('finance.collateralValue', 'Eligible collateral (appraised) value', { hint: 'Leave blank if not yet appraised' })}
        ${U.field('finance.minEquityPct', 'Lender minimum developer equity', { kind: 'pct' })}
      </div>
      ${p.finance.limitNote ? `<p class="src">${esc(p.finance.limitNote)}</p>` : ''}
    </div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> Other funding sources</h3>
      <p class="note" style="margin-top:-4px">Mark each source <b>committed</b> (approved in writing), <b>proposed</b> (applied for) or <b>conditional</b> (depends on something not yet met). Only committed sources close the gap. Enter lender-recognized land equity separately from the land's market value.</p>
      <div id="srcs"></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        <select id="addType" aria-label="Type of source to add">${E.SOURCE_TYPES.map((t) => `<option value="${t.key}">${esc(t.name)}</option>`).join('')}</select>
        <button class="btn alt sm" type="button" id="addSrc">+ Add source</button>
      </div>
    </div>
  </div>
  <div class="sticky"><div class="card results"><h3><span class="tag out">Results</span> Financing summary</h3><div id="res"></div></div></div>
</div>
<div class="grid even">
  <div class="card results"><h3><span class="tag out">Results</span> Capital stack</h3><div id="stack"></div></div>
  <div class="card results"><h3><span class="tag out">Results</span> Sources & Uses</h3><div id="su" class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"></div></div>
</div>
<div class="card results"><h3><span class="tag out">Results</span> Construction draw & interest schedule</h3><div id="drawEdit"></div><div id="draws"></div></div>
<div class="card results"><h3><span class="tag out">Results</span> Funding scenario comparison</h3><div id="fsc" class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"></div></div>
${U.caseMath(p, ['budget', 'loan', 'equity', 'interest', 'fees', 'reserve', 'cash', 'incentive', 'closing'])}
${U.learnTry(3, 'Joseph Place capital stack', `<ol>
<li>Read the case: THF lends <b>$146,000</b>, 90% of the $162,000 total development cost, and requires Gabe to put in at least 10% (<b>$16,000</b>). The loan stays the same however he applies his cash. Where does his cash go, and why is his total contribution more than the minimum?</li>
<li>Loan payments (about $12,000) and loan fees ($2,000) sit <i>outside</i> the $162,000. Find the <b>available reserves to support holding costs</b> in the sources. How does Gabe's 10% cover the cost of the loan, how do the reserves carry the loan payments, and what happens if the home takes longer to sell than the reserves cover?</li>
<li>Gabe's budget does not include the <b>$20,000 CRA incentive</b>. In the scenario table, compare <b>No incentive</b> with <b>Incentive included</b>, then check <b>Include in base case</b> under Other funding sources. How does it change the gap and the equity Gabe must bring? What has to happen before it can be marked committed?</li>
<li>Change "How interest is charged" to <b>On the amount drawn</b>. How much interest would a draw-based loan save compared with the case's full-balance terms?</li>
<li>Lower the loan-to-cost limit to 80%. How much additional equity is required?</li></ol>`)}
${U.learnReflect('capital', ['How much additional equity is required when the lender reduces its loan-to-cost ratio?', 'How does a development incentive affect the financing gap, and why should it not be counted until it is approved?', 'Why can\'t the buyer\'s mortgage or down payment assistance pay for construction?'])}
<div id="dl"></div>
${U.nextBar(['pencil.html', 'Pencil Test'], ['homebuyer.html', 'Homebuyer Affordability'])}
<p class="disclaim">Instructional estimates only. Loan terms, limits and fees vary by lender and must be confirmed in writing. Selling costs are paid from sale proceeds at closing and are excluded from construction-period uses.</p>`;

function renderSources() {
  const el = U.$('#srcs');
  el.innerHTML = p.sources.length ? `<div class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"><table class="tbl"><thead><tr><th>Source</th><th class="n" style="min-width:110px">Amount</th><th style="min-width:120px">Status</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${p.sources.map((s, i) => `<tr>
    <td><input type="text" aria-label="Source name" data-bind="sources.${i}.name" data-kind="text"><div class="note">${esc((E.SOURCE_TYPES.find((t) => t.key === s.type) || {}).name || s.type)}${s.type === 'incentive' ? ` · <label><input type="checkbox" data-bind="sources.${i}.includeInScenario" data-kind="bool"> Include in base case</label>` : ''}</div>${s.note ? `<div class="src">${esc(s.note)}</div>` : ''}</td>
    <td>${s.link ? `<input type="text" readonly aria-label="Amount (linked)" data-link="${s.id}" value="${fmt$((E.capitalStack(p).sources.find((y) => y.id === s.id) || {}).amount || 0)}"><div class="note">${s.link === 'equityRemainder' ? 'Gabe\'s cash for whatever the loan does not cover' : 'Linked to the loan fees'}</div>` : `<input type="number" step="any" min="0" aria-label="Amount" data-bind="sources.${i}.amount" data-kind="num">`}</td>
    <td><select aria-label="Status" data-bind="sources.${i}.status" data-kind="select">${STATUS_OPTS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></td>
    <td><button class="btn ghost sm" type="button" data-del="${i}" aria-label="Remove ${esc(s.name)}">✕</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="note">No other sources yet.</p>';
  binder.fill();
}
main.addEventListener('click', (e) => { if (e.target.id === 'incOn') { p.sources.forEach((s) => { if (s.type === 'incentive') s.includeInScenario = true; }); U.saved(); renderSources(); update(); } });
U.$('#srcs').addEventListener('click', (e) => { const d = e.target.closest('[data-del]'); if (d) U.askBox('Remove this source?', { ok: 'Remove' }).then((ok) => { if (ok) { p.sources.splice(+d.dataset.del, 1); U.saved(); renderSources(); update(); } }); });
U.$('#addSrc').addEventListener('click', () => {
  const t = U.$('#addType').value; const def = E.SOURCE_TYPES.find((x) => x.key === t);
  p.sources.push({ id: S.newId('s'), type: t, name: def.name, amount: 0, status: t === 'incentive' ? 'conditional' : 'proposed', includeInScenario: t === 'incentive' ? false : undefined });
  U.saved(); renderSources(); update();
});
const binder = U.bind(main, p, (path) => { if (path === 'finance.interestMethod') renderDrawEditor(); update(); });

function update() {
  { const cs0 = E.capitalStack(p); U.$$('[data-link]').forEach((el) => (el.value = fmt$((cs0.sources.find((y) => y.id === el.dataset.link) || {}).amount || 0))); }
  const c = E.capitalStack(p);
  const b = c.budget;
  const gapLevel = c.gapCommitted > 0.5 ? (c.gapIfIncentives <= 0.5 ? 'warn' : 'bad') : c.gapAll < -0.5 ? 'info' : 'good';
  U.$('#res').innerHTML = `
  <div class="kpis">
    ${U.kpi('Funding gap (committed sources)', fmt$(Math.max(0, c.gapCommitted)), c.gapCommitted > 0.5 ? 'Still needs a source' : 'Committed sources cover uses', `hero ${c.gapCommitted > 0.5 ? 'neg' : 'pos'}`, 'gap')}
    ${U.kpi('Total uses', fmt$(c.uses), 'Construction-period costs', '', 'sources')}
    ${U.kpi('Committed sources', fmt$(c.committed), `+ ${fmt$(c.proposed)} proposed · ${fmt$(c.conditional)} conditional`)}
    ${U.kpi('Loan-to-cost', fmtPct(c.ltc), E.isNum(p.finance.ltcLimitPct) ? `Limit ${E.num(p.finance.ltcLimitPct)}%${p.finance.ltcBasis === 'budget' ? ` of the ${fmt$(c.eligible)} budget` : p.finance.ltcBasis === 'budgetPlusFees' ? ` of the ${fmt$(c.eligible)} project cost` : ''} → max ${fmt$(c.maxByLtc)}` : 'No limit entered', '', 'ltc')}
    ${U.kpi('Loan-to-value', c.ltv === null ? 'Not yet calculated' : fmtPct(c.ltv), c.ltv === null ? 'Enter an appraised value' : E.isNum(p.finance.ltvLimitPct) ? `Limit ${E.num(p.finance.ltvLimitPct)}% → max ${fmt$(c.maxByLtv)}` : '', '', 'ltv')}
    ${U.kpi('Developer cash needed', fmt$(c.requiredEquity), c.lenderMinEquity !== null ? `THF minimum ${E.num(p.finance.minEquityPct)}%: ${fmt$(c.lenderMinEquity)} · also covers the ${fmt$(E.loanFees(p))} cost of the loan` : `After debt, grants & other sources · ${fmt$(c.devEquityCommitted)} committed`, '', 'equity')}
    ${U.kpi('Loan interest', fmt$(c.interest.total), `${fmt$(c.interest.build)} construction + ${fmt$(c.interest.hold)} marketing · ${methodName(c.interest.method)}`, '', 'interest')}
  </div>
  ${(() => { const why = U.gapWhy(p, c); return why ? U.status(gapLevel, `Committed sources fall short of uses by <b>${fmt$(c.gapCommitted)}</b>. ${why.text}`) + `<details class="recon" style="margin:8px 0"><summary style="cursor:pointer;font-weight:700">Where the gap comes from</summary><table class="tbl" style="max-width:640px;margin-top:6px"><tbody>${why.rows}</tbody></table></details>` : U.status(gapLevel, c.gapCommitted > 0.5 ? `Committed sources fall short of uses by <b>${fmt$(c.gapCommitted)}</b>. ${c.proposed + c.conditional > 0.5 ? (c.gapAll <= 0.5 ? `The pending sources included in this scenario (${fmt$(c.proposed + c.conditional)}) would close it if they are approved.` : `Even if the pending sources included here (${fmt$(c.proposed + c.conditional)}) are approved, ${fmt$(c.gapAll)} would still be unfunded.`) : (c.offIncentiveTotal > 0 ? '' : 'No other sources are pending.')}` : c.gapAll < -0.5 ? `Sources exceed uses by ${fmt$(-c.gapAll)}. Check for double counting or reduce a source.` : 'Committed sources cover total uses. The financing plan balances on paper.'); })()}
  ${c.offIncentiveTotal > 0 ? `<div class="status info" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg><p><b>Not counted yet:</b> ${c.offIncentives.map((x) => `${esc(x.name)} (${fmt$(x.amount)}, ${esc(x.status)})`).join('; ')}. ${c.gapCommitted <= 0.5 ? `If it is awarded, it adds <b>${fmt$(c.offIncentiveTotal)}</b> for eligible project costs. ` : `If it is awarded, the gap ${c.gapIfIncentives <= 0.5 ? `<b>closes</b>${c.gapIfIncentives < -0.5 ? ` with ${fmt$(-c.gapIfIncentives)} to spare` : ''}` : `falls to <b>${fmt$(c.gapIfIncentives)}</b>`}. `}${c.lenderMinEquity !== null ? `It can pay for the developer's financing gap, site costs, predevelopment, or added features such as eco-build standards. It is a project source, not owner's equity: Gabe still needs at least <b>${fmt$(c.lenderMinEquity)}</b> of his own cash (the lender's ${E.num(p.finance.minEquityPct)}% equity requirement), so his cash needed would be <b>${fmt$(c.equityIfIncentives)}</b>.` : `The cash the developer must bring would be <b>${fmt$(c.equityIfIncentives)}</b>.`}<br><button class="btn sm" type="button" id="incOn" style="margin-top:8px">Include the incentive in this scenario</button></p></div>` : ''}
  ${c.warnings.filter((w) => w.level !== 'gap' && w.level !== 'info').map((w) => U.status('bad', esc(w.text))).join('')}
  ${c.maxLoan !== null ? `<p class="note">Maximum loan under the limits entered: <b>${fmt$(c.maxLoan)}</b>${c.maxByLtc !== null && c.maxByLtv !== null ? ` (the lower of loan-to-cost ${fmt$(c.maxByLtc)} and loan-to-value ${fmt$(c.maxByLtv)})` : ''}.</p>` : ''}
  ${c.interestReserve > 0 ? `<p class="note">${fmt$(c.interestReserve)} of the loan is an interest reserve, so ${fmt$(c.loanForCosts)} is available for other costs. The reserve pays interest that is already counted as a use; it is not an extra cost.</p>` : ''}
  <p class="note">Selling costs of ${fmt$(c.sellingCostsAtClosing)} are paid from the sale proceeds at closing, so they are not in construction-period uses.</p>`;

  // capital stack chart
  const layers = c.counted.filter((x) => x.amount > 0).map((x) => ({ label: `${x.name} (${x.status})`, short: `${shortName(x)}${x.status === 'committed' ? '' : ' (' + x.status + ')'}`, value: x.amount, color: LAYER_COLORS[x.type] || '#9a9cb0', light: x.type === 'landEquity' || x.type === 'deferredFee' }));
  if (c.gapCommitted - c.proposed - c.conditional > 0.5) layers.push({ label: 'Unfunded gap', short: 'Unfunded gap', value: c.gapCommitted - c.proposed - c.conditional, pattern: true });
  U.$('#stack').innerHTML = U.stackChart(c.uses, layers, { label: 'Capital stack: total uses compared with layered sources' }) + `<p class="note">Sources are stacked from the bottom up. The hatched layer is the part of total uses that no source covers yet.</p>`;

  // sources & uses table
  const useRows = E.CATEGORIES.map((k) => [k, b.items.filter((i) => i.cat === k.key && !i.atClosing).reduce((s, i) => s + (i.value || 0), 0)]).filter(([, v]) => v > 0);
  U.$('#su').innerHTML = `<table class="tbl"><thead><tr><th>Uses</th><th class="n">Amount</th></tr></thead><tbody>
    ${useRows.map(([k, v]) => `<tr><td>${k.key} · ${esc(k.name)}</td><td class="n">${fmt$(v)}</td></tr>`).join('')}
    <tr class="tot"><td>Total uses</td><td class="n">${fmt$(c.uses)}</td></tr></tbody></table>
    <table class="tbl" style="margin-top:12px"><thead><tr><th>Sources</th><th>Status</th><th class="n">Amount</th></tr></thead><tbody>
    ${c.sources.map((x) => { const excl = x.type === 'incentive' && !x.includeInScenario; return `<tr${excl ? ' style="color:var(--gray)"' : ''}><td>${esc(x.name)}${excl ? ' <i>(not included in this scenario)</i>' : ''}</td><td>${esc(x.status)}</td><td class="n">${fmt$(x.amount)}</td></tr>`; }).join('')}
    <tr class="sub"><td colspan="2">Committed sources</td><td class="n">${fmt$(c.committed)}</td></tr>
    <tr><td colspan="2">Proposed + conditional (not yet secured)</td><td class="n">${fmt$(c.proposed + c.conditional)}</td></tr>
    <tr class="tot"><td colspan="2">Funding gap (uses − committed)</td><td class="n">${fmt$(c.gapCommitted)}</td></tr></tbody></table>`;

  // draw schedule
  const ms = c.interest.schedule;
  const dl = (p.finance.draws || []).filter((d) => E.num(d.amount) > 0);
  const byM = {}; dl.forEach((d) => { const m = Math.max(1, Math.round(E.num(d.month))); (byM[m] = byM[m] || []).push(d); });
  const contract = dl.filter((d) => /^Draw \d/.test(d.label || '')).reduce((t, d) => t + E.num(d.amount), 0);
  let cumS = 0;
  const sov = dl.length ? `<h4 style="margin:6px 0 6px;font-size:15px">Schedule of values: when the loan is drawn</h4>
  <div class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"><table class="tbl"><thead><tr><th>Month</th><th>Draw (released after the work is verified)</th><th class="n">Amount</th><th class="n">Drawn to date</th></tr></thead><tbody>
  ${dl.map((d) => { cumS += E.num(d.amount); return `<tr><td>${Math.round(E.num(d.month))}</td><td class="tx" style="text-align:left">${esc(d.label || 'Draw')}</td><td class="n">${fmt$(E.num(d.amount))}</td><td class="n">${fmt$(cumS)}</td></tr>`; }).join('')}
  <tr class="tot"><td colspan="2">Total drawn${contract ? ` (vertical construction contract ${fmt$(contract)})` : ''}</td><td class="n">${fmt$(cumS)}</td><td></td></tr></tbody></table></div>` : '';
  U.$('#draws').innerHTML = `<p class="note" style="margin-top:-4px">Interest method: <b>${methodName(c.interest.method)}</b>. ${c.interest.method === 'full' ? 'Interest is charged on the full loan balance from closing, as in the Joseph Place case terms, even though the money is drawn in stages.' : c.interest.method === 'average' ? 'A simplified estimate (half the loan outstanding during construction, all of it during the sale period). Use only when no draw schedule is available.' : 'Interest is charged only on what has been drawn. Edit the draw schedule below.'} ${p.finance.drawNote ? esc(p.finance.drawNote) : ''}</p>
  ${sov}
  <h4 style="margin:14px 0 6px;font-size:15px">Month by month: draws and interest</h4>
  <div class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"><table class="tbl"><thead><tr><th>Month</th><th>Phase</th><th class="n">Draws released</th><th class="n">Drawn to date</th><th class="n">Interest charged on</th><th class="n">Interest</th></tr></thead><tbody>
  ${ms.map((m) => `<tr><td>${m.month}</td><td>${m.phase}${byM[m.month] ? `<br><span class="note">${byM[m.month].map((d) => esc((d.label || '').split(':')[0])).join(', ')}</span>` : ''}</td><td class="n">${m.draw ? fmt$(m.draw) : '·'}</td><td class="n">${fmt$(m.drawnToDate ?? 0)}</td><td class="n">${fmt$(m.balance)}</td><td class="n">${fmt$(m.interest)}</td></tr>`).join('')}
  <tr class="tot"><td colspan="2">Total</td><td class="n">${fmt$(ms.reduce((t, m) => t + m.draw, 0))}</td><td></td><td></td><td class="n">${fmt$(c.interest.exact)}</td></tr>
  ${Math.abs(c.interest.rounding) > 0.5 ? `<tr><td colspan="5">Rounded to the nearest $1,000, as in the casebook</td><td class="n">${fmt$(c.interest.total)}</td></tr>` : ''}</tbody></table></div>
  ${p.finance.interestMethod === 'draws' && Math.abs(c.interest.drawn - c.loan) > 1 ? U.status('warn', `The draw schedule totals ${fmt$(c.interest.drawn)}, but the loan is ${fmt$(c.loan)}. Adjust the draws so they add up to the loan.`) : ''}
  <p class="note">All draws are released during the ${E.num(p.timeline.buildMonths)}-month build. At ${E.num(p.finance.ratePct)}%, each month the loan stays outstanding adds about <b>${fmt$(c.interest.monthlyAtFull)}</b> of interest, before taxes, insurance and upkeep.</p>`;

  // funding scenarios
  const hasInc = p.sources.some((s) => s.type === 'incentive');
  const incAmt = p.sources.filter((s) => s.type === 'incentive').reduce((t, s) => t + E.num(s.amount), 0);
  const loanLower = Math.round(E.num(p.finance.loanAmount) * 0.9 / 1000) * 1000;
  const SC = [
    ['No incentive', { includeIncentive: false }],
    [hasInc ? `Incentive included (${fmt$(incAmt)}, conditional)` : 'Incentive included (none entered)', { includeIncentive: true }],
    ['Higher developer equity (+$10,000)', { extraEquity: 10000 }],
    [`Lower construction loan (${fmt$(loanLower)})`, { loanAmount: loanLower }],
    ['Higher financing costs (+2 pts rate)', { rateDeltaPct: 2 }],
  ].map(([l, s]) => { const x = E.capitalStack(p, s); const pt = E.pencilTest(p, s); return { l, x, pt }; });
  U.$('#fsc').innerHTML = `<table class="tbl"><thead><tr><th>Scenario</th><th class="n">Total uses</th><th class="n">Committed sources</th><th class="n">Gap now (committed)</th><th class="n">Gap if pending approved</th><th class="n">Cash needed now</th><th class="n">Cash needed if pending approved</th><th class="n">Profit</th></tr></thead><tbody>
  ${SC.map(({ l, x, pt }) => `<tr><td>${esc(l)}</td><td class="n">${fmt$(x.uses)}</td><td class="n">${fmt$(x.committed)}</td><td class="n">${x.gapCommitted > 0.5 ? '✕ ' + fmt$(x.gapCommitted) : '✓ $0'}</td><td class="n">${x.gapAll > 0.5 ? '✕ ' + fmt$(x.gapAll) : '✓ $0'}</td><td class="n">${fmt$(x.requiredEquity)}</td><td class="n">${fmt$(x.requiredEquityIfAllClose)}</td><td class="n">${fmt$(pt.profit)}</td></tr>`).join('')}</tbody></table>
  <ul class="note"><li><b>Incentive:</b> counted as conditional, so it lowers the gap only if the incentive is awarded. If approved, it reduces the cash Gabe must bring.</li><li><b>Higher equity:</b> closes the gap with the developer's own cash. Profit stays the same.</li><li><b>Lower loan:</b> less debt means less interest, but more developer cash is required.</li><li><b>Higher financing costs:</b> more interest raises uses and lowers profit at the same time.</li></ul>`;
}
const methodName = (m) => ({ full: 'Full balance from closing', draws: 'Draw-based', average: 'Simplified average balance' }[m] || m);
const shortName = (x) => ({ constructionLoan: 'Construction loan', loanReserve: 'Holding-cost reserves', developerEquity: 'Developer equity', landEquity: 'Land equity', incentive: 'Incentive', cdfi: 'CDFI loan', subordinate: 'Subordinate debt', investorEquity: 'Investor equity', predevGrant: 'Predev grant', projectGrant: 'Project grant', deferredFee: 'Deferred fee', other: 'Other' }[x.type] || x.name);

function drawEditor() {
  return `<div class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table" style="margin-bottom:10px"><table class="tbl" id="drawTbl"><caption>Draw schedule (edit)</caption><thead><tr><th>Description</th><th>Month</th><th class="n">Amount</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>
  ${p.finance.draws.map((d, i) => `<tr><td><input type="text" aria-label="Draw description" data-bind="finance.draws.${i}.label" data-kind="text"></td><td><input type="number" min="1" step="1" style="width:70px" aria-label="Draw month" data-bind="finance.draws.${i}.month" data-kind="num"></td><td><input type="number" min="0" step="any" aria-label="Draw amount" data-bind="finance.draws.${i}.amount" data-kind="num"></td><td><button class="btn ghost sm" type="button" data-ddel="${i}" aria-label="Remove draw">✕</button></td></tr>`).join('')}
  </tbody></table><button class="btn alt sm" type="button" id="addDraw">+ Add draw</button></div>`;
}
function renderDrawEditor() {
  const el = U.$('#drawEdit');
  if (p.finance.interestMethod !== 'draws') { el.innerHTML = ''; return; }
  el.innerHTML = drawEditor();
  binder.fill();
  U.$('#addDraw').onclick = () => { p.finance.draws.push({ label: 'Draw', month: (p.finance.draws.at(-1)?.month || 0) + 1, amount: 0 }); U.saved(); renderDrawEditor(); update(); };
  U.$('#drawTbl').onclick = (e) => { const d = e.target.closest('[data-ddel]'); if (d) { p.finance.draws.splice(+d.dataset.ddel, 1); U.saved(); renderDrawEditor(); update(); } };
}


U.$('#dl').innerHTML = U.downloadBar('Capital Stack', p, () => {
  const c = E.capitalStack(p); const d = (v) => (v === null ? 'Not yet calculated' : Math.round(v)); const pc = (v) => (v === null ? 'Not yet calculated' : (v * 100).toFixed(2) + '%');
  return [['Sources & Uses'], ['Total uses', d(c.uses)], ...c.sources.map((x) => [`Source: ${x.name}`, d(x.amount), x.status, x.type === 'incentive' && !x.includeInScenario ? 'not included' : '']), ['Committed sources', d(c.committed)], ['Proposed sources', d(c.proposed)], ['Conditional sources', d(c.conditional)], ['Funding gap (committed)', d(c.gapCommitted)], ['Loan-to-cost', pc(c.ltc)], ['Loan-to-value', pc(c.ltv)], ['Developer cash needed', d(c.requiredEquity)], ['Construction interest', d(c.interest.total), methodName(c.interest.method)], [], ['Month', 'Phase', 'Draw', 'Balance', 'Interest'], ...c.interest.schedule.map((m) => [m.month, m.phase, d(m.draw), d(m.balance), m.interest.toFixed(2)])];
});
renderSources();
renderDrawEditor();
update();
