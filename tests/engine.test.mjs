// Run with: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../tools/engine.js';
import { josephPlace, blankProject } from '../tools/store.js';

const close = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('mortgage amortization matches the standard formula', () => {
  // $200,000 at 6% for 30 years = $1,199.10
  close(E.monthlyPayment(200000, 6, 30), 1199.10);
  close(E.monthlyPayment(100000, 7.5, 15), 927.01);
});

test('zero-interest mortgage divides principal evenly', () => {
  close(E.monthlyPayment(120000, 0, 10), 1000);
});

test('invalid loan term returns null, zero principal returns 0', () => {
  assert.equal(E.monthlyPayment(100000, 6, 0), null);
  assert.equal(E.monthlyPayment(0, 6, 30), 0);
});

test('construction interest: full balance from closing (Joseph Place terms)', () => {
  const r = E.constructionInterest({ loan: 146000, ratePct: 8, buildMonths: 3, holdMonths: 9, method: 'full' });
  close(r.monthlyAtFull, 973.33);
  close(r.total, 11680);
  assert.equal(r.schedule.length, 12);
});

test('construction interest: draw-based is lower than full balance', () => {
  const draws = [{ month: 1, amount: 50000 }, { month: 2, amount: 50000 }, { month: 3, amount: 46000 }];
  const r = E.constructionInterest({ loan: 146000, ratePct: 12, buildMonths: 3, holdMonths: 0, method: 'draws', draws });
  // 1%/mo: 500 + 1000 + 1460
  close(r.total, 2960);
  const full = E.constructionInterest({ loan: 146000, ratePct: 12, buildMonths: 3, holdMonths: 0, method: 'full' });
  assert.ok(r.total < full.total);
});

test('construction interest: average-balance estimate', () => {
  const r = E.constructionInterest({ loan: 100000, ratePct: 12, buildMonths: 4, holdMonths: 2, method: 'average' });
  // 4 months at 50k*1% + 2 months at 100k*1% = 2000 + 2000
  close(r.total, 4000);
});

test('Joseph Place budget is Exhibit D, fully itemized, with no double counting', () => {
  const p = josephPlace();
  const b = E.budgetTotals(p);
  const exhibitD = b.costBeforeClosing - b.interest - b.fees; // everything except casebook financing items
  close(exhibitD, 161937); // Exhibit D line items (printed total $161,939, rounding)
  close(b.byCat.U, 0); // nothing left un-itemized
  assert.deepEqual(b.zeroCats, []);
  close(b.byCat.A, 500);
  close(b.byCat.B, 3422);
  close(b.byCat.C, 16555);
  close(b.byCat.D, 130910);
  close(b.byCat.E, 4250);
  close(b.byCat.G, 5000);
  close(b.fees, 2000);
  close(b.interest, 11680);
  close(b.atClosing, 12900); // 6% of $215,000
  close(b.tdc, 161937 + 2000 + 11680 + 12900);
  close(b.developerFee, 650);
});

test('pencil test: profit, margin, return on cost (Joseph Place base)', () => {
  const r = E.pencilTest(josephPlace());
  close(r.gross, 215000);
  close(r.net, 202100);
  close(r.profit, 202100 - 175617); // 26,483; casebook rounds to $26,000
  close(r.margin, 26483 / 215000, 1e-9);
  close(r.roc, 26483 / 188517, 1e-9);
});

test('pencil test: selling costs deducted exactly once', () => {
  const p = josephPlace();
  const r = E.pencilTest(p);
  // profit = gross - TDC (TDC already contains selling costs)
  close(r.profit, r.gross - r.totalCost);
});

test('break-even price covers all costs including percentage selling costs', () => {
  const p = josephPlace();
  const r = E.pencilTest(p);
  close(r.breakEven, 175617 / 0.94);
  const atBE = E.pencilTest(p, { salePrice: r.breakEven });
  close(atBE.profit, 0, 0.5);
  assert.equal(atBE.status, 'breakeven');
});

test('target-margin price earns exactly the target margin', () => {
  const p = josephPlace();
  const r = E.pencilTest(p);
  const t = E.pencilTest(p, { salePrice: r.targetPrice });
  close(t.margin, 0.10, 1e-6);
});

test('return on developer equity uses committed equity, or is not calculated', () => {
  const r = E.pencilTest(josephPlace());
  close(r.roe, 26483 / 16000, 1e-9);
  const p = blankProject();
  assert.equal(E.pencilTest(p).roe, null);
});

test('scenario comparison: lower prices and cost overrun reduce profit', () => {
  const p = josephPlace();
  const base = E.pencilTest(p).profit;
  const a = E.pencilTest(p, { salePrice: 190000 }).profit;
  const b = E.pencilTest(p, { salePrice: 180000 }).profit;
  close(base - a, 25000 * 0.94);
  close(a - b, 10000 * 0.94);
  const over = E.pencilTest(p, { costIncreasePct: 10 }).profit;
  close(base - over, 13091);
  const delay = E.pencilTest(p, { delayMonths: 1 }).profit;
  close(base - delay, 973.33);
});

test('cost-overrun exposure: hard-cost increase that takes profit to zero', () => {
  const p = josephPlace();
  const r = E.pencilTest(p);
  close(r.overrunToZero, (26483 / 130910) * 100, 0.01);
});

test('conditional incentive is excluded until included in the scenario', () => {
  const p = josephPlace();
  assert.equal(E.includedIncentives(p), 0);
  const withI = E.pencilTest(p, { includeIncentive: true });
  close(withI.profit - E.pencilTest(p).profit, 15000);
  const cs = E.capitalStack(p);
  assert.equal(cs.conditional, 0); // excluded
  const cs2 = E.capitalStack(p, { includeIncentive: true });
  close(cs2.conditional, 15000);
  close(cs2.committed, cs.committed); // never counted as committed
});

test('capital stack: sources & uses reconciliation for Joseph Place', () => {
  const cs = E.capitalStack(josephPlace());
  close(cs.uses, 175617); // selling costs are paid from proceeds, not a construction-period use
  close(cs.committed, 162000); // $146,000 loan + $16,000 equity
  close(cs.gapCommitted, 13617); // interest and loan fees still need a source
  close(cs.uses, cs.committed + cs.gapCommitted);
});

test('loan-to-cost and loan-to-value', () => {
  const p = josephPlace();
  const cs = E.capitalStack(p);
  close(cs.ltc, 146000 / 175617, 1e-9);
  assert.equal(cs.ltv, null);
  p.finance.collateralValue = 200000; p.finance.ltvLimitPct = 75;
  const cs2 = E.capitalStack(p);
  close(cs2.ltv, 0.73, 1e-9);
  close(cs2.maxByLtv, 150000);
  close(cs2.maxLoan, Math.min(150000, 175617 * 0.9));
});

test('developer equity requirement after debt and grants', () => {
  const p = josephPlace();
  const cs = E.capitalStack(p);
  close(cs.requiredEquity, 175617 - 146000);
  const cs2 = E.capitalStack(p, { loanAmount: 130000 });
  // $16,000 less debt means $16,000 more equity, minus the 12 months of interest no longer owed on it
  close(cs2.requiredEquity - cs.requiredEquity, 16000 - 16000 * 0.08);
});

test('loan principal is a source, not a cost', () => {
  const p = josephPlace();
  const tdc1 = E.budgetTotals(p).tdc;
  p.finance.interestMethod = 'draws';
  p.finance.ratePct = 0; // remove interest so only principal could change TDC
  const tdcNoInterest = E.budgetTotals(p).tdc;
  p.finance.loanAmount = 0;
  close(E.budgetTotals(p).tdc, tdcNoInterest - 0); // principal change has no effect when rate is 0 and fees fixed
  assert.ok(tdc1 > tdcNoInterest);
});

test('affordability: down payment, loan, DTI and cash to close', () => {
  const b = { ...josephPlace().buyer, price: 200000, downPct: 3, ratePct: 6, termYears: 30, miAnnualPct: 0.6, upfrontPct: 0, financeUpfront: false, taxRatePct: 1.2, insuranceAnnual: 1200, hoaMonthly: 0, closingCostsMode: 'pct', closingCostsPct: 3, income: 72000, monthlyDebt: 500, dpa: 0, cca: 0, principalReduction: 0, otherAssist: 0 };
  const r = E.affordability(b);
  close(r.down, 6000);
  close(r.loan, 194000);
  close(r.pi, E.monthlyPayment(194000, 6, 30));
  close(r.mi, 97);
  close(r.taxes, 200);
  close(r.ins, 100);
  close(r.housing, r.pi + 97 + 200 + 100);
  close(r.frontDti, r.housing / 6000, 1e-9);
  close(r.backDti, (r.housing + 500) / 6000, 1e-9);
  close(r.cashToClose, 6000 + 6000);
});

test('assistance is applied only to eligible expenses and never twice', () => {
  const b = { ...josephPlace().buyer, price: 200000, downPct: 3, closingCostsMode: 'pct', closingCostsPct: 3, dpa: 10000, dpaCoversClosing: false, cca: 9000, otherAssist: 5000, principalReduction: 0, upfrontPct: 0 };
  const r = E.affordability(b);
  close(r.dpaApplied, 6000); // capped at the down payment
  close(r.ccaApplied, 6000); // capped at closing costs
  close(r.otherApplied, 0); // nothing left to apply it to
  close(r.cashToClose, 0);
  close(r.unusedAssistance, 4000 + 3000 + 5000);
  const none = E.affordability(b, { withAssistance: false });
  close(none.cashToClose, 12000);
});

test('principal reduction lowers the loan and is not also deducted from cash', () => {
  const b = { ...josephPlace().buyer, price: 200000, downPct: 3, closingCostsPct: 3, dpa: 0, cca: 0, otherAssist: 0, principalReduction: 10000, upfrontPct: 0 };
  const r = E.affordability(b);
  close(r.loan, 184000);
  close(r.cashToClose, 12000);
});

test('financed upfront fee increases the loan, unfinanced fee increases cash to close', () => {
  const base = { ...josephPlace().buyer, price: 200000, downPct: 3.5, upfrontPct: 1.75, closingCostsPct: 0, dpa: 0, cca: 0, otherAssist: 0, principalReduction: 0 };
  const fin = E.affordability({ ...base, financeUpfront: true });
  close(fin.loan, 193000 * 1.0175);
  const cash = E.affordability({ ...base, financeUpfront: false });
  close(cash.loan, 193000);
  close(cash.cashToClose - fin.cashToClose, 193000 * 0.0175);
});

test('max affordable price meets both DTI targets', () => {
  const b = josephPlace().buyer;
  const m = E.maxAffordablePrice(b);
  const r = E.affordability(b, { price: m });
  assert.ok(r.frontDti <= 0.31 + 1e-6 && r.backDti <= 0.43 + 1e-6);
  const over = E.affordability(b, { price: m + 1000 });
  assert.ok(!(over.meetsFront && over.meetsBack));
});

test('missing income: DTI and purchasing power are not fabricated', () => {
  const b = { ...josephPlace().buyer, income: 0, price: 150000 };
  const s = E.affordabilitySummary(b);
  assert.equal(s.frontDti, null);
  assert.equal(s.maxPrice, null);
  assert.equal(s.paymentGap, null);
});

test('division by zero and empty projects do not produce fabricated results', () => {
  const p = blankProject();
  const r = E.pencilTest(p);
  assert.equal(r.margin, null);
  assert.equal(r.status, 'incomplete');
  const b = E.budgetTotals(p);
  assert.equal(b.perSf, null);
  const cs = E.capitalStack(p);
  assert.equal(cs.ltc, null);
});

test('validation catches negative costs, bad rates, bad terms', () => {
  const p = blankProject();
  p.budget.items[0].amount = -500;
  p.finance.ratePct = 40;
  p.buyer.termYears = 0;
  const v = E.validateProject(p).map((x) => x.text).join(' | ');
  assert.match(v, /negative/);
  assert.match(v, /construction loan rate/);
  assert.match(v, /term must be greater than zero/);
});

test('percentage contingency follows hard costs and cost increases', () => {
  const p = josephPlace();
  p.budget.items.push({ id: 'pc', cat: 'G', name: 'Added contingency', basis: 'pct', pct: 5, pctOf: 'hard' });
  const b = E.budgetTotals(p);
  close(b.byCat.G, 5000 + 130910 * 0.05);
  const b2 = E.budgetTotals(p, { costIncreasePct: 10 });
  close(b2.byCat.D, 130910 * 1.1);
  close(b2.byCat.G, 5000 + 130910 * 1.1 * 0.05);
});

test('revised estimates compare against baseline', () => {
  const p = josephPlace();
  p.budget.items[0].revised = 25000;
  const c = E.budgetComparison(p);
  close(c.change, 24500);
});
