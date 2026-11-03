import * as E from './engine.js?v=1793719798';
import * as U from './ui.js?v=1793719798';

const { main, project: p } = U.shell('home', 'Lab Home');
const { fmt$, fmtPct, esc } = U;
const r = E.pencilTest(p);
const c = E.capitalStack(p);
const h = E.affordabilitySummary(p.buyer, { price: p.buyer.linkPrice ? p.sale.price : p.buyer.price });

main.innerHTML = `
<div class="pagehead"><div><h2>Welcome to the ${U.LAB}</h2><p class="q">Four connected financial tools that show how every development decision moves cost, profit, financing and the buyer's ability to purchase the home.</p></div></div>
<div class="card" style="border-top:5px solid var(--mag)">
  <h3>Working on: ${esc(p.name)} ${p.kind === 'case' ? '<span class="tag in">Instructional case</span>' : '<span class="tag out">My project</span>'}</h3>
  ${p.developer ? `<p class="note" style="margin-top:-4px">${esc(p.developer)} · ${esc(p.location)}</p>` : p.location ? `<p class="note">${esc(p.location)}</p>` : ''}
  <div class="kpis" style="margin-top:10px">
    ${U.kpi('Total development cost', fmt$(r.totalCost), '', '', 'tdc')}
    ${U.kpi('Sales price', fmt$(r.price))}
    ${U.kpi('Projected profit', fmt$(r.profit), fmtPct(r.margin) + ' margin', r.profit >= 0 ? 'pos' : 'neg')}
    ${U.kpi('Funding gap', fmt$(Math.max(0, c.gapCommitted)), 'Uses − committed sources', c.gapCommitted > 0.5 ? 'neg' : 'pos', 'gap')}
    ${U.kpi('Buyer payment', fmt$(h.housing), 'Back-end DTI ' + fmtPct(h.backDti), '', 'dti')}
  </div>
  <p class="note">Switch projects, reset Joseph Place, or start your own project from the bar at the top. Your work is saved only in this browser.</p>
</div>
<h3 style="margin:22px 0 10px">Work through the four tools in order</h3>
<div class="steps">
  <a class="step" href="budget.html"><span class="no">Tool 1 · Exercise 1</span><h3>Development Budget Builder</h3><p>Assemble the full budget, from land to closing, and find the Total Development Cost and cost per square foot.</p><span class="go">Open the Budget Builder →</span></a>
  <a class="step" href="pencil.html"><span class="no">Tool 2 · Exercise 2</span><h3>Pencil Test & Feasibility</h3><p>Test whether the sale covers all costs. Compare prices, cost overruns and delays side by side.</p><span class="go">Open the Pencil Test →</span></a>
  <a class="step" href="capital.html"><span class="no">Tool 3 · Exercise 3</span><h3>Capital Stack & Financing</h3><p>Line up the loan, equity and incentives against total uses, find the funding gap, and model draws and interest.</p><span class="go">Open the Capital Stack →</span></a>
  <a class="step" href="homebuyer.html"><span class="no">Tool 4 · Exercise 4</span><h3>Homebuyer Affordability</h3><p>Check whether the intended buyer can afford the payment and the cash to close, with and without assistance.</p><span class="go">Open Homebuyer Affordability →</span></a>
</div>
<div class="card" style="margin-top:18px;border-top:5px solid var(--green)"><h3>EDA Development Financial Feasibility Summary</h3><p style="margin:0 0 10px">One report that pulls all four tools together: project overview, budget, profitability, sources & uses, capital stack, financing gap, homebuyer affordability, and the risks and assumptions still open. Use it as a preliminary supporting document for your EDA Development Package and pitch.</p><a class="btn g" href="summary.html">Open the Feasibility Summary</a></div>
<div class="card"><h3>How the tools connect</h3>
<p style="margin:0">Budget → Pencil Test → Capital Stack → Homebuyer Affordability. You enter each number once. The budget's total cost feeds the pencil test and the sources & uses; the loan terms set construction interest in the budget; the developer's sales price becomes the buyer's purchase price.</p>
<ul class="note"><li>Loan principal is a source of funds, never a cost. Loan interest and fees are costs.</li><li>Developer equity is a source of funds, not an extra cost.</li><li>Selling costs are counted once: in the budget, deducted from the sale at closing.</li><li>Development incentives and homebuyer assistance are separate and never interchangeable.</li><li>Nothing proposed or conditional is counted as committed financing.</li></ul></div>
<h3 style="margin:22px 0 10px">Key terms</h3>
<div class="gloss">${['tdc', 'hard', 'soft', 'contingency', 'equity', 'stack', 'ltc', 'ltv', 'gap', 'margin', 'roc', 'dti', 'appraisalGap', 'dpa'].map((k) => `<div><b>${esc(U.GLOSSARY[k][0])}</b>${esc(U.GLOSSARY[k][1])}</div>`).join('')}</div>
<p class="disclaim">The ${U.LAB} is original instructional material of the ${U.BRAND}. Tools produce estimates from user-entered assumptions. They are not loan approvals, appraisals, underwriting, or homebuyer eligibility decisions.</p>`;
