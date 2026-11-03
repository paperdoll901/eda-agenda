import * as S from './store.js?v=1793725294';
import * as E from './engine.js?v=1793725294';
import * as U from './ui.js?v=1793725294';

const { main, project: p } = U.shell('homebuyer', 'Homebuyer Affordability & Subsidy Calculator');
const { fmt$, fmtPct, esc, tip } = U;
const b = p.buyer;
const buyerPrice = () => (b.linkPrice ? E.num(p.sale.price) : E.num(b.price));

main.innerHTML = `
<div class="pagehead"><div><h2>4 · Homebuyer Affordability & Subsidy Calculator</h2><p class="q">Can the intended buyer afford the home the developer plans to deliver?</p></div></div>
${U.learnTeach(`<p>A project only works if a real buyer can purchase the finished home. This tool connects your sales price to the buyer's monthly payment, debt-to-income ratios ${tip('dti')} and the cash needed at closing ${tip('cashToClose')}. A buyer can fail on either test: the <b>monthly payment</b> may be too high for their income, or they may not have enough <b>cash to close</b>.</p>
<p>Homebuyer assistance ${tip('dpa')} helps the buyer, not the developer's construction budget. It is applied only to the costs it is eligible for and is never counted twice. This is an instructional calculator, <b>not a mortgage preapproval or eligibility decision</b>.</p>${U.caseNotes(p)}`)}
<div class="grid">
  <div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> The home</h3>
      <div class="fields">
        ${U.field('buyer.linkPrice', 'Use the developer\'s sales price from the Pencil Test', { kind: 'bool' })}
        <div class="f" id="priceWrap"></div>
        ${U.field('buyer.location', 'Property location', { kind: 'text' })}
        ${U.field('buyer.taxRatePct', 'Property tax (annual % of price)', { kind: 'pct', step: 0.01 })}
        ${U.field('buyer.insuranceAnnual', 'Homeowner\'s insurance (annual)')}
        ${U.field('buyer.hoaMonthly', 'HOA fees (monthly)')}
      </div>
    </div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> Mortgage assumptions</h3>
      <div class="fields">
        ${U.field('buyer.product', 'Loan product category', { kind: 'select', options: Object.entries(E.MORTGAGE_PRODUCTS).map(([k, v]) => [k, v.name]) })}
        <div class="f"><span>&nbsp;</span><button class="btn alt sm" type="button" id="loadProd">Load illustrative product assumptions</button></div>
        ${U.field('buyer.downPct', 'Down payment', { kind: 'range', min: 0, max: 25, step: 0.5 })}
        ${U.field('buyer.ratePct', 'Interest rate', { kind: 'range', min: 0, max: 12, step: 0.125 })}
        ${U.field('buyer.termYears', 'Loan term (years)', { kind: 'num', min: 1 })}
        ${U.field('buyer.miAnnualPct', 'Mortgage insurance (annual % of loan)', { kind: 'pct', step: 0.01 })}
        ${U.field('buyer.upfrontPct', 'Upfront mortgage fee (% of loan)', { kind: 'pct', step: 0.01 })}
        ${U.field('buyer.financeUpfront', 'Finance the upfront fee into the loan', { kind: 'bool' })}
        ${U.field('buyer.closingCostsPct', 'Buyer closing costs (% of price)', { kind: 'pct', step: 0.1 })}
        ${U.field('buyer.otherCash', 'Other buyer cash needed (reserves, prepaids)')}
      </div>
      <p class="note">Product assumptions are <b>illustrative classroom values</b>, not current lender or agency rules. Edit them to match a real loan estimate.</p>
    </div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> The buyer</h3>
      <div class="fields">
        ${U.field('buyer.income', 'Annual gross household income')}
        ${U.field('buyer.monthlyDebt', 'Monthly recurring debts', { hint: 'Car, student loans, cards, etc.' })}
        ${U.field('buyer.cashForDown', 'Cash available for down payment')}
        ${U.field('buyer.cashForClosing', 'Cash available for closing costs')}
        ${U.field('buyer.targetFrontPct', 'Target front-end DTI', { kind: 'pct', tip: 'dti' })}
        ${U.field('buyer.targetBackPct', 'Target back-end DTI', { kind: 'pct', tip: 'dti' })}
      </div>
      ${b.incomeNote ? `<p class="src">${esc(b.incomeNote)}</p>` : ''}
    </div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> Homebuyer assistance</h3>
      <div class="fields">
        ${U.field('buyer.includeAssistance', 'Include assistance in the main result', { kind: 'bool' })}
        ${U.field('buyer.assistanceStatus', 'Assistance status', { kind: 'select', options: [['assumed', 'Assumed for this exercise'], ['applied', 'Applied for'], ['approved', 'Approved in writing']] })}
        ${U.field('buyer.dpa', 'Down payment assistance', { tip: 'dpa' })}
        ${U.field('buyer.dpaCoversClosing', 'DPA may also pay closing costs', { kind: 'bool' })}
        ${U.field('buyer.cca', 'Closing cost assistance')}
        ${U.field('buyer.principalReduction', 'Mortgage principal reduction')}
        ${U.field('buyer.otherAssist', 'Other eligible buyer subsidy')}
      </div>
      <p class="note">Entering an amount does not make the buyer eligible. Program rules, income limits and lender participation must be confirmed.</p>
    </div>
  </div>
  <div class="sticky"><div class="card results"><h3><span class="tag out">Results</span> Affordability</h3><div id="res"></div></div></div>
</div>
<div class="grid even">
  <div class="card results"><h3><span class="tag out">Results</span> With vs. without assistance</h3><div id="cmpA" class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"></div></div>
  <div class="card results"><h3><span class="tag out">Results</span> Mortgage scenario comparison</h3><div id="cmpM" class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"></div></div>
</div>
<div class="card results"><h3><span class="tag out">Results</span> Interest rates and purchasing power</h3><div id="rateChart"></div></div>
${U.learnTry(4, 'Joseph Place homebuyer', `<ol>
<li>The buyer price is linked to the developer's <b>$215,000</b> working sale price. Set the down payment to <b>3%</b>.</li>
<li>The illustrative buyer earns <b>$40,792</b>, the ZIP 38107 median household income cited in the casebook. Can this buyer afford the payment? What are the front-end and back-end DTIs?</li>
<li>Uncheck "Use the developer's sales price" and try the classroom price of <b>$190,000</b>. What changes?</li>
<li>Add down payment assistance and closing cost assistance. Does assistance fix a <i>payment</i> problem, a <i>cash</i> problem, or both?</li>
<li>Move the interest rate slider up one point. How much purchasing power does the buyer lose?</li></ol>`)}
${U.learnReflect('homebuyer', ['How does an increase in interest rates affect the intended buyer\'s purchasing power?', 'What is the difference between an affordability gap based on monthly payment and one based on cash to close?', 'If the target buyer cannot afford the home, what could the developer change: price, size, design, or financing partners?'])}
<div id="dl"></div>
${U.nextBar(['capital.html', 'Capital Stack'], ['summary.html', 'Feasibility Summary'])}
<p class="disclaim">Instructional estimate only, not a mortgage preapproval, loan estimate or eligibility determination. Property taxes, insurance, interest rates, mortgage insurance, fees and assistance eligibility require independent verification with a lender and program administrator.</p>`;

function renderPrice() {
  U.$('#priceWrap').outerHTML = b.linkPrice
    ? `<div class="f" id="priceWrap"><span><label for="lp">Purchase price (linked)</label></span><input id="lp" type="text" readonly value="${fmt$(E.num(p.sale.price))}"><span class="hint">From the developer's sales price. Uncheck the box above to try a different price.</span></div>`
    : `<div class="f" id="priceWrap"><span><label for="f-buyer-price">Purchase price</label></span><div class="range"><input id="f-buyer-price" type="range" min="50000" max="500000" step="1000" data-bind="buyer.price" data-kind="num" aria-label="Purchase price"><output data-out="buyer.price"></output></div></div>`;
  const r = U.$('#f-buyer-price'); if (r) r.dataset.fmt = '$';
}
U.$('[data-bind="buyer.downPct"]').dataset.unit = '%';
U.$('[data-bind="buyer.ratePct"]').dataset.unit = '%';
if (!b.linkPrice && !E.num(b.price)) b.price = E.num(p.sale.price) || 200000;
renderPrice();
const binder = U.bind(main, p, (path) => {
  if (path === 'buyer.linkPrice') { if (!b.linkPrice && !E.num(b.price)) b.price = E.num(p.sale.price); renderPrice(); binder.fill(); }
  update();
});
U.$('#loadProd').addEventListener('click', () => {
  const d = E.MORTGAGE_PRODUCTS[b.product];
  Object.assign(b, { downPct: d.downPct, miAnnualPct: d.miAnnualPct, upfrontPct: d.upfrontPct, financeUpfront: d.financeUpfront });
  U.saved(); binder.fill(); update();
});

function row(l, a, c, cls = '') { return `<tr class="${cls}"><td>${l}</td><td class="n">${a}</td><td class="n">${c}</td></tr>`; }
function update() {
  const price = buyerPrice();
  const s = E.affordabilitySummary(b, { price });
  const no = E.affordabilitySummary(b, { price, withAssistance: false });
  const yes = E.affordabilitySummary(b, { price, withAssistance: true });
  const tf = E.num(b.targetFrontPct), tb = E.num(b.targetBackPct);
  const payOK = s.meetsFront && s.meetsBack;
  const cashOK = s.cashGap <= 0.5;
  const issues = E.validateProject(p).filter((v) => v.field.startsWith('buyer'));
  let lvl, msg;
  if (!(E.num(b.income) > 0)) { lvl = 'info'; msg = 'Enter the buyer\'s annual income to test affordability.'; }
  else if (payOK && cashOK) { lvl = 'good'; msg = 'Under these assumptions the buyer <b>meets both DTI targets and has enough cash to close</b>. A lender must still verify income, credit and assets.'; }
  else if (!payOK && !cashOK) { lvl = 'bad'; msg = `<b>Both tests fail</b>: the monthly payment is above the DTI targets <i>and</i> the buyer is short ${fmt$(s.cashGap)} of cash to close.`; }
  else if (!payOK) { lvl = 'bad'; msg = 'The buyer has the cash to close, but the <b>monthly payment is above the DTI targets</b>. Down payment help alone may not fix this.'; }
  else { lvl = 'warn'; msg = 'The monthly payment fits, but the buyer is <b>short of cash to close</b>. Assistance or a lower cash requirement could close this gap.'; }
  const debt = E.num(b.monthlyDebt);
  const incNeed = Math.max(tf > 0 ? s.housing / (tf / 100) : 0, tb > 0 ? (s.housing + debt) / (tb / 100) : 0) * 12;
  const recon = E.num(b.income) > 0 && !(payOK && cashOK) ? `<div class="status ${lvl} recon" role="status"><div style="flex:1;min-width:0"><b>What it would take to close the gap</b>
    <table class="tbl" style="margin:8px 0 4px"><tbody>
      ${payOK ? '' : `<tr><td>Sales price</td><td class="n">${fmt$(price)}</td></tr><tr><td>Price this buyer can carry at ${tf}% / ${tb}% DTI</td><td class="n">${fmt$(s.maxPrice)}</td></tr><tr class="tot"><td>Payment gap to close (price reduction, buydown or principal reduction)</td><td class="n">${fmt$(Math.max(0, s.paymentGap || 0))}</td></tr><tr><td>Or: income needed at this price</td><td class="n">${fmt$(incNeed)} <span class="note">vs. ${fmt$(E.num(b.income))}</span></td></tr>`}
      ${cashOK ? '' : `<tr><td>Cash to close</td><td class="n">${fmt$(s.cashToClose)}</td></tr><tr><td>Buyer cash on hand</td><td class="n">${fmt$(s.cashAvailable)}</td></tr><tr class="tot"><td>Cash gap (down payment or closing-cost assistance)</td><td class="n">${fmt$(s.cashGap)}</td></tr>`}
    </tbody></table>${b.incomeNote ? `<p class="note" style="margin:6px 0 0">This is the casebook's buyer question: can a household at the ZIP 38107 median income (${fmt$(E.num(b.income))}) buy at ${fmt$(price)}? A failing result here is the finding to discuss, not an error. Try a lower price on the Pencil Test, add assistance below, or test a higher-income buyer.</p>` : ''}</div></div>` : '';
  U.$('#res').innerHTML = `
  <div class="kpis">
    ${U.kpi('Estimated monthly housing payment', fmt$(s.housing), `P&I ${fmt$(s.pi)} · taxes ${fmt$(s.taxes)} · ins. ${fmt$(s.ins)} · MI ${fmt$(s.mi)}${s.hoa ? ' · HOA ' + fmt$(s.hoa) : ''}`, 'hero')}
    ${U.kpi('Front-end DTI', fmtPct(s.frontDti), `Target ${tf}% · ${s.frontDti === null ? '' : s.meetsFront ? '✓ within target' : '✕ above target'}`, s.frontDti === null ? '' : s.meetsFront ? 'pos' : 'neg', 'dti')}
    ${U.kpi('Back-end DTI', fmtPct(s.backDti), `Target ${tb}% · ${s.backDti === null ? '' : s.meetsBack ? '✓ within target' : '✕ above target'}`, s.backDti === null ? '' : s.meetsBack ? 'pos' : 'neg', 'dti')}
    ${U.kpi('Buyer down payment', fmt$(s.down), `${E.num(b.downPct)}% of ${fmt$(price)}`)}
    ${U.kpi('Estimated cash to close', fmt$(s.cashToClose), `Buyer has ${fmt$(s.cashAvailable)} · ${cashOK ? '✓ enough' : '✕ short ' + fmt$(s.cashGap)}`, cashOK ? 'pos' : 'neg', 'cashToClose')}
    ${U.kpi('Total assistance applied', fmt$(s.assistanceApplied), s.unusedAssistance > 0.5 ? `${fmt$(s.unusedAssistance)} could not be applied to eligible costs` : `Status: ${b.assistanceStatus}`, '', 'dpa')}
    ${U.kpi('Estimated purchasing power', fmt$(s.maxPrice), 'Highest price that meets both DTI targets')}
    ${U.kpi('Affordability gap (payment)', s.paymentGap === null ? 'Not yet calculated' : s.paymentGap > 0 ? fmt$(s.paymentGap) : '$0', s.paymentGap > 0 ? 'Price above purchasing power' : 'Price is within purchasing power', s.paymentGap > 0 ? 'neg' : 'pos', 'appraisalGap')}
  </div>
  ${U.status(lvl, msg)}${recon}
  ${U.status('info', `<b>Two different tests.</b> Payment affordability depends on income and the monthly payment. Cash affordability depends on savings and assistance. Here the payment gap is ${s.paymentGap === null ? 'not yet calculated' : fmt$(s.paymentGap)} and the cash gap is ${fmt$(s.cashGap)}.`)}
  ${b.includeAssistance && s.assistanceApplied > 0 && b.assistanceStatus !== 'approved' ? U.status('warn', 'Assistance is included but not approved. Treat this result as a scenario until the buyer is approved for the program.') : ''}
  ${issues.map((v) => U.status(v.level === 'error' ? 'bad' : 'warn', esc(v.text))).join('')}
  <table class="tbl" style="margin-top:10px"><tbody>
    <tr><td>Purchase price</td><td class="n">${fmt$(price)}</td></tr>
    <tr><td>− Down payment</td><td class="n">${fmt$(-s.down)}</td></tr>
    ${s.principalApplied ? `<tr><td>− Principal reduction assistance</td><td class="n">${fmt$(-s.principalApplied)}</td></tr>` : ''}
    ${s.financedFee ? `<tr><td>+ Financed upfront fee</td><td class="n">${fmt$(s.financedFee)}</td></tr>` : ''}
    <tr class="sub"><td>= Loan amount</td><td class="n">${fmt$(s.loan)}</td></tr>
    <tr><td>Down payment + closing costs${s.cashFee ? ' + upfront fee' : ''}${E.num(b.otherCash) ? ' + other cash' : ''}</td><td class="n">${fmt$(s.down + s.closing + s.cashFee + E.num(b.otherCash))}</td></tr>
    <tr><td>− Assistance applied to eligible cash costs</td><td class="n">${fmt$(-(s.dpaApplied + s.ccaApplied + s.otherApplied))}</td></tr>
    <tr class="tot"><td>= Cash to close</td><td class="n">${fmt$(s.cashToClose)}</td></tr>
  </tbody></table>`;

  U.$('#cmpA').innerHTML = `<table class="tbl"><thead><tr><th><span class="sr-only">Actions</span></th><th class="n">Without assistance</th><th class="n">With assistance</th></tr></thead><tbody>
    ${row('Loan amount', fmt$(no.loan), fmt$(yes.loan))}
    ${row('Monthly housing payment', fmt$(no.housing), fmt$(yes.housing))}
    ${row('Front-end DTI', fmtPct(no.frontDti), fmtPct(yes.frontDti))}
    ${row('Back-end DTI', fmtPct(no.backDti), fmtPct(yes.backDti))}
    ${row('Cash to close', fmt$(no.cashToClose), fmt$(yes.cashToClose))}
    ${row('Cash shortfall', no.cashGap > 0.5 ? '✕ ' + fmt$(no.cashGap) : '✓ $0', yes.cashGap > 0.5 ? '✕ ' + fmt$(yes.cashGap) : '✓ $0')}
    ${row('Purchasing power', fmt$(no.maxPrice), fmt$(yes.maxPrice), 'sub')}
    ${row('Assistance applied', '$0', fmt$(yes.assistanceApplied))}
  </tbody></table><p class="note">Down payment and closing cost help lower cash to close. Only principal reduction lowers the loan and the monthly payment.</p>`;

  const prods = Object.entries(E.MORTGAGE_PRODUCTS);
  const res = prods.map(([k, d]) => [d, E.affordabilitySummary({ ...b, downPct: d.downPct, miAnnualPct: d.miAnnualPct, upfrontPct: d.upfrontPct, financeUpfront: d.financeUpfront }, { price })]);
  U.$('#cmpM').innerHTML = `<table class="tbl"><thead><tr><th>Product (illustrative)</th><th class="n">Down</th><th class="n">Payment</th><th class="n">Back-end DTI</th><th class="n">Cash to close</th></tr></thead><tbody>
    ${res.map(([d, r]) => `<tr><td>${esc(d.name)}<div class="note">${d.downPct}% down · MI ${d.miAnnualPct}%/yr · upfront ${d.upfrontPct}%${d.financeUpfront ? ' financed' : ''}</div></td><td class="n">${fmt$(r.down)}</td><td class="n">${fmt$(r.housing)}</td><td class="n">${r.backDti === null ? '·' : (r.meetsBack ? '✓ ' : '✕ ') + fmtPct(r.backDti)}</td><td class="n">${fmt$(r.cashToClose)}</td></tr>`).join('')}
  </tbody></table><p class="note">Same buyer, price and rate. Product terms are classroom placeholders; eligibility is not assumed. VA and USDA loans have their own eligibility rules.</p>`;

  if (E.num(b.income) > 0) {
    const base = E.num(b.ratePct);
    const rates = Array.from({ length: 9 }, (_, i) => Math.max(0, Math.round((base - 2 + i * 0.5) * 100) / 100));
    const pts = (wa) => rates.map((r) => ({ x: r, y: E.maxAffordablePrice({ ...b, ratePct: r }, { withAssistance: wa }) }));
    U.$('#rateChart').innerHTML = U.lineChart([{ name: 'Purchasing power without assistance', color: '#2E3192', points: pts(false) }, { name: 'Purchasing power with assistance', color: '#4E7F1C', dash: true, points: pts(true) }, { name: 'Home price', color: '#9F1F63', points: rates.map((r) => ({ x: r, y: price })) }], { label: 'Purchasing power at different interest rates', xTitle: 'Mortgage interest rate', xfmt: (v) => v.toFixed(1) + '%', vlines: [{ x: base, label: 'Current rate', color: '#5d5f75' }] }) + `<p class="note">Where a purchasing-power line is below the home price line, the buyer cannot afford the payment at that rate. A one-point rate increase changes purchasing power by about ${fmt$(E.maxAffordablePrice({ ...b, ratePct: base }) - E.maxAffordablePrice({ ...b, ratePct: base + 1 }))}.</p>`;
  } else U.$('#rateChart').innerHTML = '<p class="note">Enter the buyer\'s income to see purchasing power.</p>';
}

U.$('#dl').innerHTML = U.downloadBar('Homebuyer Affordability', p, () => {
  const price = buyerPrice(); const no = E.affordabilitySummary(b, { price, withAssistance: false }); const yes = E.affordabilitySummary(b, { price, withAssistance: true });
  const d = (v) => (v === null ? 'Not yet calculated' : Math.round(v)); const pc = (v) => (v === null ? 'Not yet calculated' : (v * 100).toFixed(2) + '%');
  return [['Input', 'Value'], ['Purchase price', price], ['Product', E.MORTGAGE_PRODUCTS[b.product]?.name], ['Down payment %', b.downPct], ['Interest rate %', b.ratePct], ['Term (years)', b.termYears], ['Annual income', b.income], ['Monthly debts', b.monthlyDebt], ['Assistance status', b.assistanceStatus], [], ['Result', 'Without assistance', 'With assistance'], ['Loan amount', d(no.loan), d(yes.loan)], ['Monthly housing payment', d(no.housing), d(yes.housing)], ['Front-end DTI', pc(no.frontDti), pc(yes.frontDti)], ['Back-end DTI', pc(no.backDti), pc(yes.backDti)], ['Down payment', d(no.down), d(yes.down)], ['Cash to close', d(no.cashToClose), d(yes.cashToClose)], ['Cash shortfall', d(no.cashGap), d(yes.cashGap)], ['Assistance applied', 0, d(yes.assistanceApplied)], ['Purchasing power', d(no.maxPrice), d(yes.maxPrice)], ['Payment affordability gap', d(no.paymentGap), d(yes.paymentGap)], [], ['Instructional estimate only. Not a preapproval or eligibility determination.']];
});
update();
