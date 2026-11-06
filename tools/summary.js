import * as E from './engine.js?v=1793938071';
import * as U from './ui.js?v=1793938071';

const { main, project: p } = U.shell('summary', 'EDA Development Financial Feasibility Summary');
const { fmt$, fmtPct, esc } = U;

const b = E.budgetTotals(p);
const r = E.pencilTest(p);
const c = E.capitalStack(p);
const price = p.buyer.linkPrice ? E.num(p.sale.price) : E.num(p.buyer.price);
const h = E.affordabilitySummary(p.buyer, { price });
const mk = E.marketComps(p);
const hNo = E.affordabilitySummary(p.buyer, { price, withAssistance: false });
const sc = p.pencilScenarios || {};
const scn = (s) => ({ salePrice: E.isNum(s.salePrice) ? E.num(s.salePrice) : undefined, costIncreasePct: E.num(p.budget.costIncreasePct) + E.num(s.costIncreasePct), delayMonths: E.num(s.delayMonths), rateDeltaPct: E.num(s.rateDeltaPct), includeIncentive: s.includeIncentive ? true : E.includedIncentives(p) > 0 });
const A = sc.a ? E.pencilTest(p, scn(sc.a)) : null, B = sc.b ? E.pencilTest(p, scn(sc.b)) : null;
const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// risks and outstanding assumptions
const risks = [];
if (b.byCat.U > 0) risks.push(`${fmt$(b.byCat.U)} of the budget is not yet itemized by category.`);
b.zeroCats.forEach((k) => risks.push(`No costs entered for ${E.CATEGORIES.find((x) => x.key === k).name}. Confirm it is truly zero or already included elsewhere.`));
if (r.status === 'loss') risks.push('The project shows a projected loss at the base sales price.');
if (r.status === 'belowTarget' || r.status === 'breakeven') risks.push(`Projected profit margin (${fmtPct(r.margin)}) is below the ${E.num(p.sale.targetMarginPct)}% minimum target.`);
if (r.overrunToZero !== null) risks.push(`A hard-cost overrun of about ${r.overrunToZero.toFixed(1)}% would eliminate projected profit.`);
if (c.gapCommitted > 0.5) risks.push(`Financing gap of ${fmt$(c.gapCommitted)}: committed sources do not yet cover total uses.${c.gapIfIncentives <= 0.5 && c.offIncentiveTotal > 0 ? ' It closes if the pending incentive is awarded.' : ''}`);
c.warnings.filter((w) => w.level === 'risk').forEach((w) => risks.push(w.text));
(p.sources || []).filter((s) => s.status !== 'committed').forEach((s) => risks.push(`${s.name} (${fmt$(E.num(s.amount))}) is ${s.status}, not committed.`));
if (!E.isNum(p.finance.collateralValue)) risks.push('No appraised (collateral) value entered, so loan-to-value has not been tested.');
if (E.num(p.buyer.income) > 0 && !(h.meetsFront && h.meetsBack)) risks.push('The illustrative buyer does not meet both debt-to-income targets at this price.');
if (h.cashGap > 0.5) risks.push(`The illustrative buyer is short ${fmt$(h.cashGap)} of cash to close.`);
if (p.buyer.includeAssistance && h.assistanceApplied > 0 && p.buyer.assistanceStatus !== 'approved') risks.push('Homebuyer assistance is assumed but not approved.');
if (p.sqftNote) risks.push(p.sqftNote);
if (mk.status === 'aboveRange') risks.push(`The sales price is above every comparable sale (highest ${fmt$(mk.high)}).`);
if (mk.status === 'aboveClosed') risks.push(`The sales price is ${fmt$(mk.gapToClosed)} above what closed sales support (${fmt$(mk.closedValue)}). Possible appraisal gap.`);
E.validateProject(p).forEach((v) => risks.push(v.text));

const sec = (n, t, html) => `<div class="card" style="break-inside:avoid"><h3><span class="k" style="background:var(--navy);color:#fff;border-radius:6px;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-size:13px">${n}</span> ${t}</h3>${html}</div>`;
const tr = (l, v, cls = '') => { const t = String(v).replace(/<[^>]+>/g, ''); return `<tr class="${cls}"><td>${l}</td><td class="${/^[−$\d(]/.test(t) && !/[A-Za-z]{4,}/.test(t) ? 'n' : 'tx'}">${v}</td></tr>`; };

main.innerHTML = `
<div class="pagehead"><div><h2>EDA Development Financial Feasibility Summary</h2><p class="q">${esc(p.name)}${p.location ? ' · ' + esc(p.location) : ''} · Analysis date ${date}</p></div>
<div class="noprint" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="print" type="button">Print or save as PDF</button><button class="btn alt" id="csv" type="button">Download summary (CSV)</button><button class="btn alt" id="json" type="button">Download project file (JSON)</button></div></div>
${U.status('info', 'A <b>preliminary</b> supporting document for the EDA Development Package and project pitch. Figures are estimates from the assumptions entered in the four Learning Lab tools; they are not a loan approval, appraisal or eligibility determination.')}
${sec(1, 'Project Overview', `<table class="tbl"><tbody>
  ${tr('Project', esc(p.name))}${p.developer ? tr('Developer', esc(p.developer)) : ''}${tr('Location', esc(p.location || 'Not entered'))}${tr('Development type', esc(p.type))}
  ${tr('Units', p.units)}${tr('Building area', E.num(p.sqft) ? E.num(p.sqft).toLocaleString() + ' sq. ft.' : 'Not entered')}
  ${tr('Timeline', `${E.num(p.timeline.buildMonths)} months construction + ${E.num(p.timeline.saleMonths)} months marketing & sale`)}
  ${tr('Base sales price per unit', fmt$(r.price))}</tbody></table>${p.kind === 'case' && p.assumptionNotes ? `<ul class="note">${p.assumptionNotes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}`)}
${sec(2, 'Development Budget', `<table class="tbl"><tbody>${E.CATEGORIES.filter((k) => b.byCat[k.key] > 0 || k.key !== 'U').map((k) => tr(`${k.key} · ${esc(k.name)}`, fmt$(b.byCat[k.key]))).join('')}${tr('Total Development Cost', fmt$(b.tdc), 'tot')}${tr('Cost per sq. ft.', fmt$(b.perSf))}${tr('Construction (hard) cost per sq. ft.', fmt$(b.hardPerSf))}</tbody></table>`)}
${sec(3, 'Pencil Test and Profitability', `<table class="tbl"><thead><tr><th>Metric</th><th class="n">Base case</th>${A ? `<th class="n">${esc(sc.a.label)}</th>` : ''}${B ? `<th class="n">${esc(sc.b.label)}</th>` : ''}</tr></thead><tbody>
  ${[['Sales price', (x) => fmt$(x.price)], ['Gross sales revenue', (x) => fmt$(x.gross)], ['Net sales revenue', (x) => fmt$(x.net)], ['Total project cost', (x) => fmt$(x.totalCost)], ['Incentive applied', (x) => fmt$(x.incentive)], ['Project profit', (x) => fmt$(x.profit)], ['Profit margin', (x) => fmtPct(x.margin)], ['Return on cost', (x) => fmtPct(x.roc)], ['Break-even price', (x) => fmt$(x.breakEven)]].map(([l, f], i) => `<tr${i === 5 ? ' class="sub"' : ''}><td>${l}</td><td class="n">${f(r)}</td>${A ? `<td class="n">${f(A)}</td>` : ''}${B ? `<td class="n">${f(B)}</td>` : ''}</tr>`).join('')}
  </tbody></table><p class="note">Minimum target margin: ${E.num(p.sale.targetMarginPct)}%. Financial feasibility is not lender approval or market feasibility.</p>`)}
${sec(4, 'Sources & Uses', `<div class="grid even" style="gap:12px"><table class="tbl"><thead><tr><th>Uses</th><th class="n">Amount</th></tr></thead><tbody>${E.CATEGORIES.map((k) => [k, b.items.filter((i) => i.cat === k.key && !i.atClosing).reduce((s, i) => s + (i.value || 0), 0)]).filter(([, v]) => v > 0).map(([k, v]) => tr(esc(k.name), fmt$(v))).join('')}${tr('Total uses', fmt$(c.uses), 'tot')}</tbody></table>
  <table class="tbl"><thead><tr><th>Sources</th><th class="n">Amount</th></tr></thead><tbody>${c.sources.map((x) => tr(`${esc(x.name)} <span class="note">(${x.status}${x.type === 'incentive' && !x.includeInScenario ? ', not included' : ''})</span>`, fmt$(x.amount))).join('')}${tr('Committed sources', fmt$(c.committed), 'tot')}</tbody></table></div>
  <p class="note">Selling costs (${fmt$(c.sellingCostsAtClosing)}) are paid from sale proceeds at closing and are not construction-period uses.</p>`)}
${sec(5, 'Capital Stack', `<div style="max-width:700px">${U.stackChart(c.uses, c.counted.filter((x) => x.amount > 0).map((x) => ({ label: x.name, short: x.name.length > 30 ? x.name.slice(0, 28) + '…' : x.name, value: x.amount })).concat(c.gapCommitted - c.proposed - c.conditional > 0.5 ? [{ label: 'Unfunded gap', short: 'Unfunded gap', value: c.gapCommitted - c.proposed - c.conditional, pattern: true }] : []), { label: 'Capital stack' })}</div>
  <table class="tbl"><tbody>${tr('Construction loan', `${fmt$(c.loan)} at ${E.num(p.finance.ratePct)}%`)}${tr('Loan-to-cost', fmtPct(c.ltc))}${tr('Loan-to-value', c.ltv === null ? 'Not yet calculated (no appraised value)' : fmtPct(c.ltv))}${tr('Construction interest', `${fmt$(c.interest.total)} (${{ full: 'full balance from closing', draws: 'draw-based', average: 'simplified average balance' }[c.interest.method]})`)}${tr('Developer cash needed', fmt$(c.requiredEquity))}${tr('Developer equity committed', fmt$(c.devEquityCommitted))}</tbody></table>`)}
${sec(6, 'Financing Gap', (() => {
  const gap = c.gapCommitted; const pend = c.proposed + c.conditional; const off = c.offIncentives || [];
  const why = U.gapWhy(p, c);
  const rows = (why ? '' : tr('Total uses (construction period)', fmt$(c.uses)) + tr('Less committed sources', '−' + fmt$(c.committed))) + tr(gap > 0.5 ? 'Gap with committed sources only' : 'Surplus with committed sources', fmt$(Math.abs(gap)), 'tot')
    + (pend > 0.5 ? tr('Less pending sources included in this scenario', '−' + fmt$(pend)) : '')
    + off.map((x) => tr(`Less ${esc(x.name)} <span class="note">(${esc(x.status)}, not yet counted)</span>`, '−' + fmt$(x.amount))).join('')
    + (pend > 0.5 || off.length ? tr(c.gapIfIncentives > 0.5 ? 'Gap if everything pending is awarded' : 'Surplus if everything pending is awarded', fmt$(Math.abs(c.gapIfIncentives)), 'tot') : '');
  const lvl = gap <= 0.5 ? 'good' : c.gapIfIncentives <= 0.5 ? 'warn' : 'bad';
  const eqNow = c.devEquityCommitted;
  const resv = (p.sources || []).filter((x) => x.type === 'loanReserve' && x.status === 'committed').reduce((t, x) => t + E.num(x.amount), 0);
  const msg = gap <= 0.5 ? (resv > 0 ? `Committed sources cover total uses. The ${fmt$(c.loan)} loan finances 90% of the ${fmt$(c.eligible)} total development cost. Gabe's cash on hand, ${fmt$(c.devEquityCommitted)}, meets THF's ${fmt$(c.lenderMinEquity || 0)} minimum and covers the rest of the budget plus the ${fmt$(E.loanFees(p))} cost of the loan. ${fmt$(resv)} of available reserves support the loan payments until the sale.${c.offIncentiveTotal > 0 ? ` If awarded, the ${fmt$(c.offIncentiveTotal)} CRA incentive adds money for eligible costs such as site work, predevelopment or eco-build standards; it does not count as owner's equity.` : ''}` : 'Committed sources cover total uses.')
    : why && c.gapIfIncentives <= 0.5 ? `${why.text} Gabe can bring more equity or ask the lender about an interest reserve. If the ${fmt$(c.offIncentiveTotal)} CRA incentive is awarded in time, it can close this gap with ${fmt$(-c.gapIfIncentives)} left for other eligible costs such as site work, predevelopment or eco-build standards. The incentive does not count toward owner's equity: Gabe still brings ${fmt$(c.lenderMinEquity || 0)} of his own cash.`
    : c.gapIfIncentives <= 0.5 ? `Committed sources are ${fmt$(gap)} short today. The gap <b>closes</b> if the pending ${off.length ? esc(off.map((x) => x.name).join(' and ')) : 'sources'} ${off.length + (pend > 0.5 ? 1 : 0) > 1 ? 'are' : 'is'} awarded${c.gapIfIncentives < -0.5 ? `, leaving ${fmt$(-c.gapIfIncentives)} to spare` : ''}. Until then, the developer must cover the gap with more equity or another source. Developer cash needed if awarded: ${fmt$(c.equityIfIncentives)}.`
    : `Committed sources are ${fmt$(gap)} short, and ${fmt$(c.gapIfIncentives)} would remain unfunded even if everything pending is awarded.`;
  return U.status(lvl, msg) + (why ? `<h4 style="margin:12px 0 4px;font-size:15px">Where the gap comes from</h4><table class="tbl" style="max-width:640px"><tbody>${why.rows}</tbody></table><h4 style="margin:12px 0 4px;font-size:15px">How it closes</h4>` : '') + `<table class="tbl" style="max-width:640px;margin-top:10px"><tbody>${rows}</tbody></table>`;
})())}
${sec(7, 'Homebuyer Affordability', `<table class="tbl"><thead><tr><th><span class="sr-only">Actions</span></th><th class="n">Without assistance</th><th class="n">With assistance</th></tr></thead><tbody>
  ${[['Purchase price', (x) => fmt$(x.price)], ['Down payment', (x) => fmt$(x.down)], ['Loan amount', (x) => fmt$(x.loan)], ['Monthly housing payment', (x) => fmt$(x.housing)], ['Front-end DTI', (x) => fmtPct(x.frontDti)], ['Back-end DTI', (x) => fmtPct(x.backDti)], ['Cash to close', (x) => fmt$(x.cashToClose)], ['Cash shortfall', (x) => fmt$(x.cashGap)], ['Purchasing power', (x) => fmt$(x.maxPrice)], ['Payment affordability gap', (x) => (x.paymentGap === null ? 'Not yet calculated' : fmt$(x.paymentGap))]].map(([l, f]) => `<tr><td>${l}</td><td class="n">${f(hNo)}</td><td class="n">${f(h)}</td></tr>`).join('')}
  </tbody></table><p class="note">Illustrative buyer: ${fmt$(E.num(p.buyer.income))} income, ${fmt$(E.num(p.buyer.monthlyDebt))}/mo debts, ${E.num(p.buyer.downPct)}% down at ${E.num(p.buyer.ratePct)}%, ${E.MORTGAGE_PRODUCTS[p.buyer.product]?.name || ''} assumptions. Assistance status: ${esc(p.buyer.assistanceStatus)}. Not a preapproval.</p>`)}
${sec(8, 'Financial Risks and Outstanding Assumptions', risks.length ? `<ul>${risks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p>No outstanding items were flagged. Confirm all figures with your lender and professional team.</p>')}
${mk.value !== null ? sec(9, 'Market Support for the Sales Price', `<table class="tbl"><thead><tr><th>Comp</th><th>Status</th><th class="n">Price</th><th class="n">$ / sq. ft.</th><th class="n">Value for subject</th></tr></thead><tbody>${mk.comps.filter((x) => x.used).map((x) => `<tr><td>${esc(x.address || 'Comp')}</td><td>${E.COMP_STATUS[x.status]}</td><td class="n">${fmt$(x.price)}</td><td class="n">${fmt$(x.ppsf)}</td><td class="n">${fmt$(x.indicated)}</td></tr>`).join('')}</tbody></table>
  <table class="tbl" style="max-width:640px;margin-top:10px"><tbody>${tr('Supported value (average of comps)', fmt$(mk.value), 'tot')}${mk.closedValue !== null ? tr('Closed sales support', fmt$(mk.closedValue)) : ''}${tr('Range of comps', `${fmt$(mk.low)} to ${fmt$(mk.high)}`)}${tr('Sales price used in this summary', fmt$(mk.price))}</tbody></table>
  <p class="note">Subject living area ${mk.subjectSqft.toLocaleString('en-US')} sq. ft. Each comp's price per sq. ft. is applied to the subject, plus any adjustments. Not an appraisal.</p>`) : ''}
${U.caseMath(p)}
${Object.values(p.reflections || {}).some((x) => x && String(x).trim()) ? `<div class="card"><h3>My reflections</h3>${Object.entries(p.reflections).filter(([, v]) => v && String(v).trim()).map(([k, v]) => `<p><b>${esc({ budget: 'Budget', pencil: 'Pencil Test', capital: 'Capital Stack', homebuyer: 'Homebuyer' }[k.split('-')[0]] || k)} Q${+k.split('-')[1] + 1}:</b> ${esc(v)}</p>`).join('')}</div>` : ''}
<p class="disclaim">Prepared with the ${U.LAB}, ${U.BRAND}, hosted by the <span class="nw">Alliance for Housing Progress</span>. Property taxes, insurance, interest rates, loan terms, mortgage insurance and assistance eligibility require independent verification. Browser-saved projects are not backed up by EDA.</p>`;

U.$('#print').addEventListener('click', () => window.print());
U.$('#json').addEventListener('click', () => U.download(`${U.slug(p.name)}-eda-project.json`, JSON.stringify(p, null, 2), 'application/json'));
U.$('#csv').addEventListener('click', () => {
  const d = (v) => (v === null || v === undefined ? 'Not yet calculated' : Math.round(v)); const pc = (v) => (v === null ? 'Not yet calculated' : (v * 100).toFixed(2) + '%');
  const rows = [[`${U.BRAND} | ${U.LAB}`], ['EDA Development Financial Feasibility Summary'], ['Project', p.name], ['Analysis date', new Date().toISOString().slice(0, 10)], [],
    ['1. Project Overview'], ['Location', p.location], ['Type', p.type], ['Units', p.units], ['Sq. ft.', p.sqft], ['Construction months', p.timeline.buildMonths], ['Sale months', p.timeline.saleMonths], [],
    ['2. Development Budget'], ...E.CATEGORIES.map((k) => [k.name, d(b.byCat[k.key])]), ['Total Development Cost', d(b.tdc)], [],
    ['3. Pencil Test', 'Base', sc.a?.label || '', sc.b?.label || ''], ...[['Sales price', 'price'], ['Net sales revenue', 'net'], ['Total project cost', 'totalCost'], ['Project profit', 'profit']].map(([l, k]) => [l, d(r[k]), A ? d(A[k]) : '', B ? d(B[k]) : '']), ['Profit margin', pc(r.margin), A ? pc(A.margin) : '', B ? pc(B.margin) : ''], ['Break-even price', d(r.breakEven), A ? d(A.breakEven) : '', B ? d(B.breakEven) : ''], [],
    ['4-6. Sources & Uses'], ['Total uses', d(c.uses)], ...c.sources.map((x) => [x.name, d(x.amount), x.status]), ['Committed sources', d(c.committed)], ['Funding gap', d(c.gapCommitted)], ['Loan-to-cost', pc(c.ltc)], ['Developer cash needed', d(c.requiredEquity)], [],
    ['7. Homebuyer Affordability', 'Without assistance', 'With assistance'], ['Monthly payment', d(hNo.housing), d(h.housing)], ['Back-end DTI', pc(hNo.backDti), pc(h.backDti)], ['Cash to close', d(hNo.cashToClose), d(h.cashToClose)], ['Purchasing power', d(hNo.maxPrice), d(h.maxPrice)], [],
    ['8. Risks and Outstanding Assumptions'], ...risks.map((x) => [x])];
  U.download(`${U.slug(p.name)}-feasibility-summary.csv`, U.csv(rows), 'text/csv');
});
