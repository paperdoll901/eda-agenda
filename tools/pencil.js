import * as S from './store.js?v=1793724408';
import * as E from './engine.js?v=1793724408';
import * as U from './ui.js?v=1793724408';

const { main, project: p } = U.shell('pencil', 'Development Pencil Test & Feasibility Calculator');
const { fmt$, fmtPct, esc, tip } = U;
p.pencilScenarios = p.pencilScenarios || { a: { label: 'Scenario A' }, b: { label: 'Scenario B' } };

const STATUS = {
  incomplete: ['info', 'Enter a sales price and at least one unit to run the pencil test.'],
  loss: ['bad', 'The project <b>loses money</b> under these assumptions. Costs exceed net sales revenue.'],
  breakeven: ['warn', 'The project is <b>at break-even</b>. There is no cushion for a cost overrun, delay or lower price.'],
  belowTarget: ['warn', 'The project shows a <b>profit, but below your minimum target margin</b>.'],
  meetsTarget: ['good', 'The project <b>pencils</b>: it shows a profit that meets your minimum target margin under these assumptions.'],
};

function scenarioInputs(k) {
  const b = `pencilScenarios.${k}`;
  return `<td><input type="text" aria-label="Scenario ${k.toUpperCase()} name" data-bind="${b}.label" data-kind="text"></td>`;
}

main.innerHTML = `
<div class="pagehead"><div><h2>2 · Development Pencil Test</h2><p class="q">Does the development make financial sense under the current assumptions?</p></div></div>
${U.learnTeach(`<p>A <b>pencil test</b> is the quick feasibility check a developer runs before committing real money: will the expected sale cover <i>all</i> project costs and leave an acceptable return? It uses the Total Development Cost from the Budget Builder, so nothing is typed twice.</p>
<p>Gross sales − selling costs = <b>net sales revenue</b> ${tip('netsales')}. Net sales − all other project costs (+ any approved incentive) = <b>project profit</b>. Selling costs come out once. A positive result means the numbers work on paper. It does <b>not</b> mean a lender has approved the loan or that buyers will pay the price.</p>${U.caseNotes(p)}`)}
<div class="grid">
  <div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> Project & sale assumptions</h3>
      <div class="fields">
        ${U.field('name', 'Project name', { kind: 'text' })}
        ${U.field('type', 'Development type', { kind: 'text' })}
        ${U.field('units', 'Residential units', { kind: 'num', min: 0, step: 1 })}
        ${U.field('sqft', 'Total building sq. ft.', { kind: 'num', min: 0 })}
        ${U.field('timeline.buildMonths', 'Construction months', { kind: 'num', min: 0, step: 1 })}
        ${U.field('timeline.saleMonths', 'Marketing & sale months', { kind: 'num', min: 0, step: 1 })}
        ${U.field('sale.price', 'Base sales price per unit')}
        ${U.field('sale.commissionPct', 'Sales commission %', { kind: 'pct', hint: 'Brokerage, or all selling costs combined' })}
        ${U.field('sale.sellerClosingPct', 'Seller closing cost %', { kind: 'pct', hint: 'Only if not already in the % above' })}
        ${U.field('sale.targetMarginPct', 'Minimum target profit margin', { kind: 'pct', tip: 'margin' })}
      </div>
      ${p.budget.exhibitTotal && E.num(p.sale.sellerClosingPct) === 0 ? `<p class="src">Casebook: one combined ${E.num(p.sale.commissionPct)}% of the sale price covers brokerage <i>and</i> seller closing costs (${fmt$(E.num(p.sale.price) * E.num(p.sale.commissionPct) / 100)} at ${fmt$(E.num(p.sale.price))}; the casebook P&amp;L rounds it to $13,000). Seller closing cost is 0% so it is not counted twice.</p>` : ''}
      <div class="fields" style="margin-top:10px">
        ${U.field('budget.costIncreasePct', 'Hard-cost increase (what-if)', { kind: 'pct' })}
        ${U.field('finance.ratePct', 'Construction loan rate', { kind: 'pct' })}
      </div>
      <div id="incentives" style="margin-top:10px"></div>
      <p class="note">Total development cost comes from the <a href="budget.html">Budget Builder</a>. Other disposition costs are entered there as "paid from sale proceeds at closing."</p>
      ${p.sale.priceNote ? `<p class="src">${esc(p.sale.priceNote)}</p>` : ''}
    </div>
  </div>
  <div class="sticky"><div class="card results"><h3><span class="tag out">Results</span> Pencil test</h3><div id="res"></div></div></div>
</div>
<div class="card results"><h3><span class="tag out">Results</span> Side-by-side scenario comparison</h3>
  <p class="note" style="margin-top:-4px">Every value is editable. Leave a sales price blank to use the base price. Changes apply only to that scenario.</p>
  <div class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"><table class="tbl sc" id="sc"></table></div>
</div>
<div class="grid even">
  <div class="card results"><h3><span class="tag out">Results</span> Sensitivity: sales price, cost and profit</h3><div id="sens"></div></div>
  <div class="card results"><h3><span class="tag out">Results</span> Margin sensitivity</h3><div id="msens" class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"></div></div>
</div>
${U.learnTry(2, 'Joseph Place pencil test', `<ol>
<li>With Joseph Place loaded, read the base case at the <b>$215,000</b> working sale price. Compare the result to the casebook's <b>$26,000 preliminary developer return</b>. (The casebook rounds interest to $12,000 and selling costs to $13,000.)</li>
<li>In the comparison table, Scenario A is <b>$190,000</b> and Scenario B is <b>$180,000</b>. At which price does the project stop meeting a 10% target margin? Does either price lose money?</li>
<li>Add a <b>10% hard-cost increase</b> to Scenario A. What happens to profit and the break-even price?</li>
<li>Add a <b>3-month delay</b> to Scenario B. How much does each extra month cost in interest?</li>
<li>Find the cost-overrun exposure in the results: how large can a hard-cost overrun get before profit reaches $0?</li>
<li>Gabe's budget leaves out the <b>$20,000 CRA incentive</b>. Check <b>Include this incentive</b> in the inputs, or tick it for one scenario. Does the $180,000 price still lose money with the incentive?</li></ol>`)}
${U.learnReflect('pencil', ['What happens to developer profit when construction costs increase by 10%?', 'At what sales price does the project stop meeting the developer\'s target margin?', 'Why is a positive pencil test not the same as a lender approval or proof of market demand?'])}
<div id="dl"></div>
${U.nextBar(['budget.html', 'Budget Builder'], ['capital.html', 'Capital Stack'])}
<p class="disclaim">Financial feasibility is not lender approval, an appraisal or proof of market demand. Results are estimates based only on the assumptions entered. Return on developer equity is a simplified project-level figure; it is not annualized and is not an investor IRR.</p>`;

function renderIncentives() {
  const inc = (p.sources || []).map((s, i) => [s, i]).filter(([s]) => s.type === 'incentive');
  U.$('#incentives').innerHTML = inc.length ? inc.map(([s, i]) => `<div class="status info"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg><p><b>${esc(s.name)}</b>: ${fmt$(E.num(s.amount))}, status <b>${esc(s.status)}</b>.<br>
    <label style="display:inline-flex;gap:8px;align-items:center;font-weight:700;margin-top:6px"><input type="checkbox" style="width:22px;height:22px" data-bind="sources.${i}.includeInScenario" data-kind="bool"> Include the ${fmt$(E.num(s.amount))} incentive in the base case</label> ${tip('incentive')}<br><span class="note">${esc(s.note || 'Not counted unless you include it. Including it does not mean it is approved.')}</span></p></div>`).join('')
    : `<p class="note">No development incentives entered. Add one in the <a href="capital.html">Capital Stack</a> tool.</p>`;
}
renderIncentives();
const binder = U.bind(main, p, () => update());

const ROWS = [
  ['Sales price', (x) => fmt$(x.price)],
  ['Development cost (TDC)', (x) => fmt$(x.totalCost)],
  ['Net proceeds (net sales revenue)', (x) => fmt$(x.net)],
  ['Development incentive applied', (x) => fmt$(x.incentive)],
  ['<b>Project profit</b>', (x) => `<b>${x.profit < 0 ? '▼ ' : ''}${fmt$(x.profit)}</b>`],
  ['Profit margin', (x) => fmtPct(x.margin)],
  ['Return on cost', (x) => fmtPct(x.roc)],
  ['Break-even price', (x) => fmt$(x.breakEven)],
  ['Result', (x) => resultLabel(x.status)],
];
function buildScenarioTable() {
  const inp = (k, f, ph = '') => `<input type="number" step="any" aria-label="Scenario ${k.toUpperCase()} ${f}" data-bind="pencilScenarios.${k}.${f}" data-kind="num" placeholder="${ph}">`;
  U.$('#sc').innerHTML = `<thead><tr><th>Metric</th><th class="n">Base case</th><th class="n" data-h="a"></th><th class="n" data-h="b"></th></tr></thead><tbody>
    <tr><th scope="row">Scenario name</th><td>Current inputs</td>${scenarioInputs('a')}${scenarioInputs('b')}</tr>
    <tr><th scope="row">Sales price per unit (input)</th><td class="n" data-c="price"></td><td>${inp('a', 'salePrice', 'Base price')}</td><td>${inp('b', 'salePrice', 'Base price')}</td></tr>
    <tr><th scope="row">Added hard-cost increase % (input)</th><td class="n" data-c="cost"></td><td>${inp('a', 'costIncreasePct')}</td><td>${inp('b', 'costIncreasePct')}</td></tr>
    <tr><th scope="row">Project delay, months (input)</th><td class="n">0</td><td>${inp('a', 'delayMonths')}</td><td>${inp('b', 'delayMonths')}</td></tr>
    <tr><th scope="row">Interest rate change, % points (input)</th><td class="n">0</td><td>${inp('a', 'rateDeltaPct')}</td><td>${inp('b', 'rateDeltaPct')}</td></tr>
    <tr><th scope="row">Include development incentive</th><td class="n" data-c="inc"></td>${['a', 'b'].map((k) => `<td><input type="checkbox" aria-label="Scenario ${k.toUpperCase()} include incentive" data-bind="pencilScenarios.${k}.includeIncentive" data-kind="bool"></td>`).join('')}</tr>
    ${ROWS.map(([l], i) => `<tr${i === 4 ? ' class="sub"' : ''}><th scope="row">${l}</th>${['base', 'a', 'b'].map((k) => `<td class="n" data-r="${i}-${k}"></td>`).join('')}</tr>`).join('')}
  </tbody>`;
}
function renderScenarioTable(R) {
  const sc = p.pencilScenarios;
  U.$('[data-h="a"]').textContent = sc.a.label || 'Scenario A';
  U.$('[data-h="b"]').textContent = sc.b.label || 'Scenario B';
  U.$('[data-c="price"]').textContent = fmt$(R.base.price);
  U.$('[data-c="cost"]').textContent = E.num(p.budget.costIncreasePct) + '%';
  U.$('[data-c="inc"]').textContent = E.includedIncentives(p) ? 'Yes' : 'No';
  ROWS.forEach(([, f], i) => ['base', 'a', 'b'].forEach((k) => (U.$(`[data-r="${i}-${k}"]`).innerHTML = f(R[k]))));
}
const resultLabel = (s) => ({ incomplete: 'Incomplete', loss: '✕ Loss', breakeven: '! Break-even', belowTarget: '! Below target', meetsTarget: '✓ Meets target' }[s]);

function update() {
  const r = E.pencilTest(p);
  const sc = p.pencilScenarios;
  const scn = (s) => ({ salePrice: E.isNum(s.salePrice) ? E.num(s.salePrice) : undefined, costIncreasePct: E.num(p.budget.costIncreasePct) + E.num(s.costIncreasePct), delayMonths: E.num(s.delayMonths), rateDeltaPct: E.num(s.rateDeltaPct), includeIncentive: s.includeIncentive ? true : E.includedIncentives(p) > 0 });
  const R = { base: r, a: E.pencilTest(p, scn(sc.a)), b: E.pencilTest(p, scn(sc.b)) };
  const [lvl, msg] = STATUS[r.status];
  const tgt = E.num(p.sale.targetMarginPct);
  const issues = E.validateProject(p).filter((v) => !v.field.startsWith('buyer'));
  U.$('#res').innerHTML = `
    <div class="kpis">
      ${U.kpi('Project profit', fmt$(r.profit), 'Net sales − all costs', `hero ${r.profit >= 0 ? 'pos' : 'neg'}`)}
      ${U.kpi('Profit margin on sales', fmtPct(r.margin), `Target ${tgt}%`, r.margin === null ? '' : r.margin >= E.pct(tgt) ? 'pos' : 'neg', 'margin')}
      ${U.kpi('Return on cost', fmtPct(r.roc), 'Profit ÷ total project cost', '', 'roc')}
      ${U.kpi('Break-even sales price', fmt$(r.breakEven), r.breakEven && r.price ? `${fmtPct((r.price - r.breakEven) / r.price)} cushion below the base price` : '', '', 'breakeven')}
      ${U.kpi('Price needed for target margin', fmt$(r.targetPrice), `${tgt}% margin`)}
      ${U.kpi('Return on developer equity', r.roe === null ? 'Not yet calculated' : fmtPct(r.roe), r.roe === null ? 'Enter committed developer equity in the Capital Stack' : `On ${fmt$(r.equity)} committed equity · simplified, not annualized, not IRR`, '', 'roe')}
    </div>
    ${U.status(lvl, msg)}
    <table class="tbl"><tbody>
      <tr><td>Gross sales revenue (${r.units} × ${fmt$(r.price)})</td><td class="n">${fmt$(r.gross)}</td></tr>
      <tr><td>− Selling costs paid at closing</td><td class="n">${fmt$(-r.sellingCosts)}</td></tr>
      <tr class="sub"><td>= Net sales revenue ${tip('netsales')}</td><td class="n">${fmt$(r.net)}</td></tr>
      <tr><td>− All other project costs (from the budget, including interest and loan fees)</td><td class="n">${fmt$(-r.costBeforeClosing)}</td></tr>
      ${r.incentive ? `<tr><td>+ Development incentive included in this scenario (conditional)</td><td class="n">${fmt$(r.incentive)}</td></tr>` : ''}
      <tr class="tot"><td>= Project profit</td><td class="n">${fmt$(r.profit)}</td></tr>
      <tr><td>Total project cost (TDC, including selling costs)</td><td class="n">${fmt$(r.totalCost)}</td></tr>
      <tr><td>Construction-period interest (${r.months} months)</td><td class="n">${fmt$(r.interest)}</td></tr>
    </tbody></table>
    <h4 style="margin:14px 0 6px;font-size:14px">Feasibility indicators</h4>
    <ul class="warns">
      <li>${r.profit > 0 ? '✓ Positive projected profit' : r.status === 'breakeven' ? '! Break-even result' : '✕ Negative projected profit'}</li>
      <li>${r.margin !== null && r.margin >= E.pct(tgt) ? `✓ Meets the ${tgt}% minimum target margin` : `✕ Does not meet the ${tgt}% minimum target margin`}</li>
      <li>Cost-overrun exposure: ${r.overrunToZero === null ? 'no cushion: the project is not profitable now' : `profit reaches $0 if hard costs rise about <b>${r.overrunToZero.toFixed(1)}%</b>`}</li>
      <li>Margin sensitivity: each $5,000 change in price moves profit by about ${fmt$(5000 * r.units * (1 - (r.budget.closingRate || 0)))}</li>
    </ul>
    ${issues.map((v) => U.status(v.level === 'error' ? 'bad' : 'warn', esc(v.text))).join('')}
    ${U.status('info', 'A project that pencils is <b>financially feasible on paper</b>. It is not "bankable" or "approved." Lender underwriting, appraisal and market evidence are separate tests.')}`;
  renderScenarioTable(R);
  // sensitivity
  const base = r.price || 200000;
  const prices = Array.from({ length: 9 }, (_, i) => Math.round((base * (0.8 + i * 0.05)) / 1000) * 1000);
  const sens = E.sensitivity(p, prices, [0, 10, 20]);
  U.$('#sens').innerHTML = r.gross > 0 ? U.lineChart(sens.map((s, i) => ({ name: s.costChangePct === 0 ? 'Current costs' : `Hard costs +${s.costChangePct}%`, color: ['#2E3192', '#C98A00', '#9F1F63'][i], dash: i > 0, points: s.points.map((pt) => ({ x: pt.price, y: pt.profit })) })), { zero: true, label: 'Profit at different sales prices and cost levels', xTitle: 'Sales price per unit', xfmt: U.fmtShort, vlines: [{ x: r.price, label: 'Base price' }, ...(r.breakEven ? [{ x: r.breakEven, label: 'Break-even', color: '#4E7F1C' }] : [])] }) + '<p class="note">Each line shows projected profit as the sales price changes. Where a line crosses $0, the project stops making money.</p>' : '<p class="note">Enter a sales price to see the chart.</p>';
  const costs = [0, 5, 10, 15, 20];
  const mprices = [-20000, -10000, 0, 10000].map((d) => r.price + d).filter((x) => x > 0);
  U.$('#msens').innerHTML = r.gross > 0 ? `<table class="tbl"><caption>Profit margin by price and hard-cost increase</caption><thead><tr><th>Price \\ Cost</th>${costs.map((c) => `<th class="n">+${c}%</th>`).join('')}</tr></thead><tbody>${mprices.map((pr) => `<tr><th scope="row">${fmt$(pr)}</th>${costs.map((c) => { const x = E.pencilTest(p, { salePrice: pr, costIncreasePct: E.num(p.budget.costIncreasePct) + c }); const ok = x.margin !== null && x.margin >= E.pct(tgt); const neg = x.profit < 0; return `<td class="n" style="${neg ? 'background:#fbeaf2' : ok ? 'background:#eef7e6' : 'background:#fff6e0'}">${neg ? '✕ ' : ok ? '✓ ' : '! '}${fmtPct(x.margin, 0)}</td>`; }).join('')}</tr>`).join('')}</tbody></table><p class="note">✓ meets the ${tgt}% target · ! profitable but below target · ✕ loss.</p>` : '';
}

buildScenarioTable();
binder.fill();
U.$('#dl').innerHTML = U.downloadBar('Pencil Test', p, () => {
  const r = E.pencilTest(p); const sc = p.pencilScenarios;
  const scn = (s) => ({ salePrice: E.isNum(s.salePrice) ? E.num(s.salePrice) : undefined, costIncreasePct: E.num(p.budget.costIncreasePct) + E.num(s.costIncreasePct), delayMonths: E.num(s.delayMonths), rateDeltaPct: E.num(s.rateDeltaPct), includeIncentive: s.includeIncentive ? true : E.includedIncentives(p) > 0 });
  const A = E.pencilTest(p, scn(sc.a)), B = E.pencilTest(p, scn(sc.b));
  const row = (l, f) => [l, f(r), f(A), f(B)];
  const d = (v) => (v === null ? 'Not yet calculated' : Math.round(v));
  const pc = (v) => (v === null ? 'Not yet calculated' : (v * 100).toFixed(2) + '%');
  return [['Metric', 'Base case', sc.a.label, sc.b.label], row('Sales price', (x) => d(x.price)), row('Gross sales revenue', (x) => d(x.gross)), row('Selling costs', (x) => d(x.sellingCosts)), row('Net sales revenue', (x) => d(x.net)), row('Total development cost', (x) => d(x.totalCost)), row('Incentive applied', (x) => d(x.incentive)), row('Project profit', (x) => d(x.profit)), row('Profit margin', (x) => pc(x.margin)), row('Return on cost', (x) => pc(x.roc)), row('Return on developer equity (simplified)', (x) => pc(x.roe)), row('Break-even price', (x) => d(x.breakEven)), row('Price for target margin', (x) => d(x.targetPrice)), row('Result', (x) => resultLabel(x.status)), [], ['Financial feasibility is not lender approval or market feasibility.']];
});
update();
