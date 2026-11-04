/*
 * Emerging Developer Academy(TM) | Development Learning Lab(TM)
 * Shared financial calculation engine.
 *
 * Pure functions only: no DOM, no storage. Every function takes plain data
 * and returns plain data so it can be unit tested (see tests/engine.test.mjs).
 *
 * Conventions
 * - Money is in dollars (unrounded). Rounding happens only for display.
 * - Percent inputs are stored as whole numbers (8 means 8%). They are
 *   converted to decimals with pct() at the point of calculation.
 * - Loan principal is a SOURCE of funds, never a project cost.
 *   Loan interest and loan fees ARE project costs.
 * - Budget items flagged atClosing (sales commissions, seller closing costs,
 *   other disposition costs) are paid out of sale proceeds at closing. They are
 *   part of Total Development Cost, deducted from gross sales exactly once, and
 *   are NOT a use of construction-period funds in the capital stack.
 * - Developer equity is a source of funds, not a cost.
 * - A development incentive (paid to the project) and homebuyer assistance
 *   (paid for the buyer) are separate fields and are never interchangeable.
 */

export const pct = (v) => (Number(v) || 0) / 100;
export const num = (v) => {
  const n = typeof v === 'string' ? Number(v.replace(/[$,%\s]/g, '')) : Number(v);
  return Number.isFinite(n) ? n : 0;
};
export const isNum = (v) => v !== null && v !== '' && v !== undefined && Number.isFinite(Number(v));
const safeDiv = (a, b) => (b === 0 || !Number.isFinite(b) ? null : a / b);
const clone = (o) => JSON.parse(JSON.stringify(o));

export const CATEGORIES = [
  { key: 'A', name: 'Land Acquisition', short: 'Land' },
  { key: 'B', name: 'Predevelopment & Due Diligence', short: 'Predevelopment' },
  { key: 'C', name: 'Site Development', short: 'Sitework' },
  { key: 'D', name: 'Hard Construction Costs', short: 'Hard costs' },
  { key: 'E', name: 'Soft Costs', short: 'Soft costs' },
  { key: 'F', name: 'Financing & Holding Costs', short: 'Financing & holding' },
  { key: 'G', name: 'Contingencies', short: 'Contingency' },
  { key: 'H', name: 'Developer Fee & Disposition Costs', short: 'Developer fee & disposition' },
  { key: 'U', name: 'Budgeted but Not Yet Itemized', short: 'Not yet itemized' },
];

/* ------------------------------------------------------------------ */
/* Mortgage math                                                        */
/* ------------------------------------------------------------------ */

/** Monthly principal & interest for a fixed-rate, fully amortizing loan. */
export function monthlyPayment(principal, annualRatePct, years) {
  const P = num(principal);
  const n = Math.round(num(years) * 12);
  if (P <= 0) return 0;
  if (n <= 0) return null; // invalid term
  const r = pct(annualRatePct) / 12;
  if (r === 0) return P / n; // zero-interest loan
  return (P * r) / (1 - Math.pow(1 + r, -n));
}

/* ------------------------------------------------------------------ */
/* Construction interest                                                */
/* ------------------------------------------------------------------ */

/**
 * Construction-period interest on an interest-only loan.
 * methods:
 *  'full'    full loan balance outstanding from closing (the case terms)
 *  'draws'   balance grows with the draw schedule. Each draw is outstanding
 *            from the start of the month it is drawn; after the final draw the
 *            drawn balance accrues through the marketing / hold period.
 *  'average' simplified estimate: 50% of the loan outstanding during
 *            construction, 100% during the hold period. Use only when no draw
 *            schedule is available.
 */
export function constructionInterest({ loan, ratePct, buildMonths, holdMonths, method = 'full', draws = [] }) {
  const L = Math.max(0, num(loan));
  const b = Math.max(0, Math.round(num(buildMonths)));
  const h = Math.max(0, Math.round(num(holdMonths)));
  const r = pct(ratePct) / 12;
  const months = b + h;
  const schedule = [];
  let total = 0;
  if (method === 'draws') {
    const byMonth = {};
    (draws || []).forEach((d) => {
      const m = Math.max(1, Math.round(num(d.month)));
      byMonth[m] = (byMonth[m] || 0) + Math.max(0, num(d.amount));
    });
    const lastDrawMonth = Math.max(0, ...Object.keys(byMonth).map(Number));
    const horizon = Math.max(months, lastDrawMonth);
    let bal = 0;
    for (let m = 1; m <= horizon; m++) {
      const draw = byMonth[m] || 0;
      bal += draw;
      const interest = bal * r;
      total += interest;
      schedule.push({ month: m, phase: m <= b ? 'Construction' : 'Marketing & hold', draw, balance: bal, interest });
    }
  } else {
    for (let m = 1; m <= months; m++) {
      const bal = method === 'average' && m <= b ? L * 0.5 : L;
      const interest = bal * r;
      total += interest;
      schedule.push({ month: m, phase: m <= b ? 'Construction' : 'Marketing & hold', draw: m === 1 && method === 'full' ? L : 0, balance: bal, interest });
    }
  }
  const drawn = method === 'draws' ? schedule.reduce((s, x) => s + x.draw, 0) : L;
  return { total, schedule, method, months, drawn, monthlyAtFull: L * r };
}

/* ------------------------------------------------------------------ */
/* Development budget                                                   */
/* ------------------------------------------------------------------ */

export function totalMonths(p) {
  return Math.max(0, num(p.timeline?.buildMonths)) + Math.max(0, num(p.timeline?.saleMonths));
}

export function loanFees(p) {
  const f = p.finance || {};
  return num(f.applicationFee) + num(f.originationFee) + num(f.loanAmount) * pct(f.originationPct) + num(f.otherLoanFees);
}

export function interestFor(p) {
  const f = p.finance || {};
  const r = constructionInterestRaw(p, f);
  // a case can round interest the way its casebook presents it (e.g. $11,680 shown as ~$12,000)
  // split interest into the construction period and the marketing (sale) period
  const buildExact = r.schedule.filter((m) => m.phase === 'Construction').reduce((t, m) => t + m.interest, 0);
  const holdExact = r.total - buildExact;
  const to = num(f.interestRoundTo);
  const rd = (v) => (to > 0 ? Math.round(v / to) * to : v);
  const build = rd(buildExact), hold = rd(holdExact), total = build + hold;
  return { ...r, exact: r.total, rounding: total - r.total, total, build, hold, buildExact, holdExact };
}
function constructionInterestRaw(p, f) {
  return constructionInterest({
    loan: f.loanAmount,
    ratePct: f.ratePct,
    buildMonths: p.timeline?.buildMonths,
    holdMonths: p.timeline?.saleMonths,
    method: f.interestMethod,
    draws: f.draws,
  });
}

export function grossSales(p) {
  return Math.max(0, num(p.units) || 0) * num(p.sale?.price);
}

/**
 * Compute every budget line and the category totals.
 * opts.revised      use each line's revised estimate where entered
 * opts.costIncreasePct  apply an across-the-board increase to hard costs (D)
 */
export function budgetTotals(p, opts = {}) {
  const items = (p.budget?.items || []).map((it) => ({ ...it }));
  // a seller paid closing % must always reach the budget, even if the project has no line for it
  if (pct(p.sale?.sellerClosingPct) > 0 && !items.some((i) => i.basis === 'linked' && i.link === 'sellerClosing')) items.push({ id: 'auto-seller-closing', cat: 'H', name: 'Seller paid closing costs', basis: 'linked', link: 'sellerClosing', atClosing: true, note: 'Added from the seller paid closing cost %' });
  const inc = pct(opts.costIncreasePct ?? p.budget?.costIncreasePct ?? 0);
  const months = totalMonths(p);
  const gross = grossSales(p);
  const interestParts = interestFor(p);
  const interest = interestParts.total;
  const fees = loanFees(p);
  const sellPct = pct(p.sale?.commissionPct) + pct(p.sale?.sellerClosingPct);

  const baseValue = (it) => {
    switch (it.basis) {
      case 'qty': return num(it.qty) * num(it.unitPrice);
      case 'monthly': return num(it.monthly) * months;
      case 'fixed': default: return num(it.amount);
    }
  };
  const applyRevised = (it, v) => (opts.revised && isNum(it.revised) ? num(it.revised) : v);

  // pass 1: fixed / qty / monthly lines
  items.forEach((it) => {
    if (it.basis === 'pct' || it.basis === 'linked') return;
    let v = applyRevised(it, baseValue(it));
    if (it.cat === 'D') v *= 1 + inc;
    it.value = v;
  });
  const sumCat = (k) => items.filter((i) => i.cat === k && i.value !== undefined).reduce((s, i) => s + i.value, 0);
  const hardBase = sumCat('D');
  const siteBase = sumCat('C');
  // pass 2: percentage and linked lines
  items.forEach((it) => {
    if (it.basis === 'pct') {
      const base = it.pctOf === 'sale' ? gross : it.pctOf === 'hardsite' ? hardBase + siteBase : hardBase;
      it.value = applyRevised(it, base * pct(it.pct));
    } else if (it.basis === 'linked') {
      let v = 0;
      if (it.link === 'interest') v = interest;
      else if (it.link === 'interestBuild') v = interestParts.build;
      else if (it.link === 'interestHold') v = interestParts.hold;
      else if (it.link === 'loanFees') v = fees;
      else if (it.link === 'commission') { v = gross * pct(p.sale?.commissionPct); const to = num(p.sale?.sellingRoundTo); if (to > 0) v = Math.round(v / to) * to; }
      else if (it.link === 'sellerClosing') v = gross * pct(p.sale?.sellerClosingPct);
      it.value = v;
    }
  });

  const byCat = {};
  CATEGORIES.forEach((c) => (byCat[c.key] = 0));
  items.forEach((it) => (byCat[it.cat] = (byCat[it.cat] || 0) + (it.value || 0)));
  const tdc = Object.values(byCat).reduce((s, v) => s + v, 0);
  const atClosing = items.filter((i) => i.atClosing).reduce((s, i) => s + (i.value || 0), 0);
  // split closing costs into percent-of-sale and fixed parts (for break-even)
  let closingPctOfSale = items
    .filter((i) => i.atClosing && ((i.basis === 'pct' && i.pctOf === 'sale') || (i.basis === 'linked' && (i.link === 'commission' || i.link === 'sellerClosing'))))
    .reduce((s, i) => s + (i.value || 0), 0);
  // break-even uses the true percentage; any casebook rounding of selling costs is treated as a fixed amount
  const comm = items.find((i) => i.basis === 'linked' && i.link === 'commission');
  if (comm && num(p.sale?.sellingRoundTo) > 0) closingPctOfSale += gross * pct(p.sale?.commissionPct) - comm.value;
  const closingFixed = comm && num(p.sale?.sellingRoundTo) > 0 ? atClosing - comm.value - (closingPctOfSale - gross * pct(p.sale?.commissionPct)) : atClosing - closingPctOfSale;
  const developerFee = items.filter((i) => i.isDeveloperFee).reduce((s, i) => s + (i.value || 0), 0);
  const sqft = num(p.sqft);
  const zeroCats = CATEGORIES.filter((c) => c.key !== 'U' && !(byCat[c.key] > 0)).map((c) => c.key);
  return {
    items, byCat, tdc, atClosing, closingPctOfSale, closingFixed,
    closingRate: gross > 0 ? closingPctOfSale / gross : sellPct,
    costBeforeClosing: tdc - atClosing,
    hard: byCat.D, developerFee,
    perSf: safeDiv(tdc, sqft), hardPerSf: safeDiv(byCat.D, sqft),
    interest, fees, months, zeroCats,
  };
}

/** Baseline vs revised comparison for every category. */
export function budgetComparison(p) {
  const base = budgetTotals(p, { revised: false, costIncreasePct: 0 });
  const rev = budgetTotals(p, { revised: true });
  const rows = CATEGORIES.map((c) => ({ key: c.key, name: c.name, base: base.byCat[c.key], revised: rev.byCat[c.key], change: rev.byCat[c.key] - base.byCat[c.key] }));
  return { rows, base, revised: rev, change: rev.tdc - base.tdc };
}

/* ------------------------------------------------------------------ */
/* Scenario helper                                                      */
/* ------------------------------------------------------------------ */

/**
 * Return a modified copy of a project for a what-if scenario.
 * s = { salePrice, costIncreasePct, contingencyPct, delayMonths, rateDeltaPct,
 *       includeIncentive, loanAmount, extraEquity }
 */
export function applyScenario(p, s = {}) {
  const q = clone(p);
  if (isNum(s.salePrice)) q.sale.price = num(s.salePrice);
  if (isNum(s.costIncreasePct)) q.budget.costIncreasePct = num(s.costIncreasePct);
  if (isNum(s.contingencyPct)) {
    q.budget.items.forEach((it) => { if (it.cat === 'G' && it.basis === 'pct') it.pct = num(s.contingencyPct); });
  }
  if (isNum(s.delayMonths)) q.timeline.saleMonths = num(q.timeline.saleMonths) + num(s.delayMonths);
  if (isNum(s.rateDeltaPct)) q.finance.ratePct = num(q.finance.ratePct) + num(s.rateDeltaPct);
  if (isNum(s.loanAmount)) q.finance.loanAmount = num(s.loanAmount);
  if (typeof s.includeIncentive === 'boolean') {
    (q.sources || []).forEach((src) => { if (src.type === 'incentive') src.includeInScenario = s.includeIncentive; });
  }
  if (isNum(s.extraEquity) && num(s.extraEquity) !== 0) {
    q.sources = q.sources || [];
    q.sources.push({ id: 'scenario-equity', type: 'developerEquity', name: 'Additional developer equity (scenario)', amount: num(s.extraEquity), status: 'committed' });
  }
  return q;
}

/* ------------------------------------------------------------------ */
/* Incentives                                                           */
/* ------------------------------------------------------------------ */

/** Development incentives the participant has chosen to include in this scenario. */
export function includedIncentives(p) {
  return (p.sources || []).filter((s) => s.type === 'incentive' && s.includeInScenario).reduce((t, s) => t + num(s.amount), 0);
}

/* ------------------------------------------------------------------ */
/* Pencil test                                                          */
/* ------------------------------------------------------------------ */

export function pencilTest(p, s = {}) {
  const q = applyScenario(p, s);
  const b = budgetTotals(q);
  const units = Math.max(0, num(q.units));
  const price = num(q.sale?.price);
  const gross = units * price;
  const sellingCosts = b.atClosing; // deducted once, here, from gross sales
  const net = gross - sellingCosts;
  const costBeforeClosing = b.costBeforeClosing;
  const incentive = includedIncentives(q);
  const profit = net - costBeforeClosing + incentive;
  const totalCost = b.tdc; // total project cost, including selling costs
  const margin = safeDiv(profit, gross);
  const roc = safeDiv(profit, totalCost);
  const equity = (q.sources || []).filter((x) => (x.type === 'developerEquity' || x.type === 'landEquity') && x.status === 'committed').reduce((t, x) => t + (x.link === 'loanFees' ? loanFees(q) : num(x.amount)), 0);
  const roe = equity > 0 ? profit / equity : null;
  const rate = units > 0 && gross > 0 ? b.closingPctOfSale / gross : pct(q.sale?.commissionPct) + pct(q.sale?.sellerClosingPct);
  const fixed = b.closingFixed;
  const needed = costBeforeClosing + fixed - incentive;
  const breakEven = units > 0 && 1 - rate > 0 ? needed / (units * (1 - rate)) : null;
  const tgt = pct(q.sale?.targetMarginPct);
  const targetPrice = units > 0 && 1 - rate - tgt > 0 ? needed / (units * (1 - rate - tgt)) : null;
  // cost-overrun exposure: hard-cost increase that takes profit to zero
  let overrunToZero = null;
  if (b.hard > 0 && profit > 0) {
    let lo = 0, hi = 1000;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const pr = pencilProfitOnly(q, num(q.budget.costIncreasePct) + mid);
      if (pr > 0) lo = mid; else hi = mid;
    }
    overrunToZero = lo;
  }
  let status;
  if (gross <= 0) status = 'incomplete';
  else if (Math.abs(profit) < Math.max(1, gross * 0.005)) status = 'breakeven';
  else if (profit < 0) status = 'loss';
  else if (isNum(q.sale?.targetMarginPct) && margin < tgt) status = 'belowTarget';
  else status = 'meetsTarget';
  return {
    price, units, gross, sellingCosts, net, costBeforeClosing, totalCost, incentive,
    profit, margin, roc, equity, roe, breakEven, targetPrice, overrunToZero, status,
    interest: b.interest, months: b.months, budget: b,
  };
}

function pencilProfitOnly(q, costIncreasePct) {
  const b = budgetTotals(q, { costIncreasePct });
  return grossSales(q) - b.atClosing - b.costBeforeClosing + includedIncentives(q);
}

/** Profit for a grid of sale prices and hard-cost changes (sensitivity chart). */
export function sensitivity(p, prices, costChanges) {
  return costChanges.map((c) => ({
    costChangePct: c,
    points: prices.map((pr) => {
      const r = pencilTest(p, { salePrice: pr, costIncreasePct: num(p.budget?.costIncreasePct) + c });
      return { price: pr, profit: r.profit, margin: r.margin };
    }),
  }));
}

/* ------------------------------------------------------------------ */
/* Capital stack                                                        */
/* ------------------------------------------------------------------ */

export const SOURCE_TYPES = [
  { key: 'developerEquity', name: 'Developer cash equity', equity: true },
  { key: 'loanReserve', name: 'Reserves for holding costs (loan payments)', debt: true },
  { key: 'landEquity', name: 'Eligible land equity (lender-recognized)', equity: true },
  { key: 'cdfi', name: 'CDFI financing', debt: true },
  { key: 'subordinate', name: 'Other subordinate / secondary financing', debt: true },
  { key: 'investorEquity', name: 'Investor equity', equity: true },
  { key: 'predevGrant', name: 'Predevelopment grant', grant: true },
  { key: 'projectGrant', name: 'Eligible project grant', grant: true },
  { key: 'incentive', name: 'CRA or other development incentive', grant: true },
  { key: 'deferredFee', name: 'Deferred developer fee', equity: true },
  { key: 'other', name: 'Other approved source' },
];

export function capitalStack(p, s = {}) {
  const q = applyScenario(p, s);
  const b = budgetTotals(q);
  const f = q.finance || {};
  const uses = b.costBeforeClosing; // construction-period uses; selling costs are paid from proceeds at closing
  const loan = Math.max(0, num(f.loanAmount));
  const interest = interestFor(q);
  const srcs = [{ id: 'loan', type: 'constructionLoan', name: 'Construction loan', amount: loan, status: f.loanStatus || 'committed' }]
    .concat((q.sources || []).map((x) => ({ ...x, amount: x.link === 'loanFees' ? loanFees(q) : num(x.amount) })));
  // an incentive only counts in this scenario when the participant includes it
  const counted = srcs.filter((x) => !(x.type === 'incentive' && !x.includeInScenario));
  const by = (st) => counted.filter((x) => x.status === st).reduce((t, x) => t + x.amount, 0);
  const committed = by('committed');
  const proposed = by('proposed');
  const conditional = by('conditional');
  const allSources = committed + proposed + conditional;
  const gapCommitted = uses - committed;
  const gapAll = uses - allSources;
  // eligible cost for loan-to-cost: total uses, or (as in the casebook) the development budget before interest and loan fees
  const eligible = f.ltcBasis === 'budget' ? uses - interest.total - loanFees(q) : uses;
  const ltc = safeDiv(loan, eligible);
  const collateral = num(f.collateralValue);
  const ltv = collateral > 0 ? loan / collateral : null;
  const ltcRaw = isNum(f.ltcLimitPct) && num(f.ltcLimitPct) > 0 ? eligible * pct(f.ltcLimitPct) : null;
  const maxByLtc = ltcRaw !== null && num(f.ltcRoundTo) > 0 ? Math.round(ltcRaw / num(f.ltcRoundTo)) * num(f.ltcRoundTo) : ltcRaw;
  const maxByLtv = isNum(f.ltvLimitPct) && num(f.ltvLimitPct) > 0 && collateral > 0 ? collateral * pct(f.ltvLimitPct) : null;
  const caps = [maxByLtc, maxByLtv].filter((v) => v !== null);
  const maxLoan = caps.length ? Math.min(...caps) : null;
  // equity requirement: what remains after debt, grants and other non-developer sources
  const isDevEquity = (x) => x.type === 'developerEquity' || x.type === 'landEquity' || x.type === 'deferredFee';
  const otherCommitted = counted.filter((x) => !isDevEquity(x) && x.status === 'committed').reduce((t, x) => t + x.amount, 0);
  const otherAll = counted.filter((x) => !isDevEquity(x)).reduce((t, x) => t + x.amount, 0);
  // owner's equity minimum (e.g. THF: 10% of total project cost), on the same cost basis and rounding as loan-to-cost.
  // Incentives and grants are project sources; they never count toward the owner's equity minimum.
  const minRaw = isNum(f.minEquityPct) && num(f.minEquityPct) > 0 ? eligible * pct(f.minEquityPct) : null;
  const lenderMinEquity = minRaw !== null && num(f.ltcRoundTo) > 0 ? Math.round(minRaw / num(f.ltcRoundTo)) * num(f.ltcRoundTo) : minRaw;
  const floor = lenderMinEquity || 0;
  const requiredEquity = Math.max(floor, uses - otherCommitted);
  const requiredEquityIfAllClose = Math.max(floor, uses - otherAll);
  const devEquityCommitted = counted.filter((x) => isDevEquity(x) && x.status === 'committed').reduce((t, x) => t + x.amount, 0);
  const warnings = [];
  if (maxByLtc !== null && loan > maxByLtc + 0.5) warnings.push({ level: 'risk', text: `The loan exceeds the ${num(f.ltcLimitPct)}% loan-to-cost limit by ${Math.round(loan - maxByLtc).toLocaleString()} dollars.` });
  if (maxByLtv !== null && loan > maxByLtv + 0.5) warnings.push({ level: 'risk', text: `The loan exceeds the ${num(f.ltvLimitPct)}% loan-to-value limit by ${Math.round(loan - maxByLtv).toLocaleString()} dollars.` });
  if (lenderMinEquity !== null && devEquityCommitted + 0.5 < lenderMinEquity) warnings.push({ level: 'risk', text: `Committed developer equity is below the lender's ${num(f.minEquityPct)}% minimum equity requirement.` });
  if (gapCommitted > 0.5) warnings.push({ level: 'gap', text: 'Committed sources do not yet cover total uses. The financing plan is incomplete.' });
  if (gapAll < -0.5) warnings.push({ level: 'info', text: 'Sources exceed uses. Confirm whether any source is double counted or can be reduced.' });
  if (num(f.interestReserve) > loan) warnings.push({ level: 'risk', text: 'The interest reserve is larger than the loan.' });
  const offIncentives = srcs.filter((x) => x.type === 'incentive' && !x.includeInScenario);
  const offIncentiveTotal = offIncentives.reduce((t, x) => t + x.amount, 0);
  const gapIfIncentives = gapAll - offIncentiveTotal;
  const equityIfIncentives = Math.max(floor, requiredEquityIfAllClose - offIncentiveTotal);
  return {
    offIncentives, offIncentiveTotal, gapIfIncentives, equityIfIncentives,
    uses, eligible, loan, sources: srcs, counted, committed, proposed, conditional, allSources,
    gapCommitted, gapAll, ltc, ltv, maxByLtc, maxByLtv, maxLoan,
    requiredEquity, requiredEquityIfAllClose, lenderMinEquity, devEquityCommitted,
    interest, interestReserve: num(f.interestReserve), loanForCosts: loan - num(f.interestReserve),
    budget: b, warnings, sellingCostsAtClosing: b.atClosing,
  };
}

/* ------------------------------------------------------------------ */
/* Homebuyer affordability                                              */
/* ------------------------------------------------------------------ */

/** Illustrative classroom assumptions. NOT current lender or agency rules. */
export const MORTGAGE_PRODUCTS = {
  conventional: { name: 'Conventional', downPct: 3, miAnnualPct: 0.5, upfrontPct: 0, financeUpfront: false },
  fha: { name: 'FHA', downPct: 3.5, miAnnualPct: 0.55, upfrontPct: 1.75, financeUpfront: true },
  va: { name: 'VA', downPct: 0, miAnnualPct: 0, upfrontPct: 2.15, financeUpfront: true },
  usda: { name: 'USDA', downPct: 0, miAnnualPct: 0.35, upfrontPct: 1, financeUpfront: true },
  other: { name: 'Other local or portfolio product', downPct: 3, miAnnualPct: 0, upfrontPct: 0, financeUpfront: false },
};

/**
 * b = buyer inputs (see store.js blankBuyer). price may be passed in so the
 * buyer price stays linked to the developer's sale price.
 * opts.withAssistance=false ignores every assistance field.
 */
export function affordability(b, opts = {}) {
  const price = num(opts.price ?? b.price);
  const useAssist = opts.withAssistance ?? b.includeAssistance ?? true;
  const down = price * pct(b.downPct);
  const dpa = useAssist ? Math.max(0, num(b.dpa)) : 0;
  const cca = useAssist ? Math.max(0, num(b.cca)) : 0;
  const prin = useAssist ? Math.max(0, num(b.principalReduction)) : 0;
  const otherA = useAssist ? Math.max(0, num(b.otherAssist)) : 0;
  const baseLoanBefore = Math.max(0, price - down);
  const principalApplied = Math.min(prin, baseLoanBefore);
  const baseLoan = baseLoanBefore - principalApplied;
  const upfront = baseLoan * pct(b.upfrontPct);
  const financedFee = b.financeUpfront ? upfront : 0;
  const cashFee = b.financeUpfront ? 0 : upfront;
  const loan = baseLoan + financedFee;
  const pi = monthlyPayment(loan, b.ratePct, b.termYears);
  const mi = (loan * pct(b.miAnnualPct)) / 12;
  const taxes = (price * pct(b.taxRatePct)) / 12;
  const ins = num(b.insuranceAnnual) / 12;
  const hoa = num(b.hoaMonthly);
  const housing = (pi ?? 0) + mi + taxes + ins + hoa;
  const gmi = num(b.income) / 12;
  const frontDti = gmi > 0 ? housing / gmi : null;
  const backDti = gmi > 0 ? (housing + num(b.monthlyDebt)) / gmi : null;
  const closing = isNum(b.closingCostsPct) && b.closingCostsMode !== 'amount' ? price * pct(b.closingCostsPct) : num(b.closingCostsAmount);
  // assistance is applied only to the expense it is eligible for, never twice
  const dpaApplied = Math.min(dpa, down + (b.dpaCoversClosing ? closing : 0));
  const dpaToClosing = Math.max(0, dpaApplied - down);
  const ccaApplied = Math.min(cca, Math.max(0, closing - dpaToClosing) + cashFee);
  const remainingEligible = Math.max(0, down + closing + cashFee - dpaApplied - ccaApplied);
  const otherApplied = Math.min(otherA, remainingEligible);
  const assistanceApplied = dpaApplied + ccaApplied + otherApplied + principalApplied;
  const unusedAssistance = dpa + cca + otherA + prin - assistanceApplied;
  const cashToClose = down + closing + cashFee + num(b.otherCash) - dpaApplied - ccaApplied - otherApplied;
  const cashAvailable = num(b.cashForDown) + num(b.cashForClosing);
  const cashGap = Math.max(0, cashToClose - cashAvailable);
  const meetsFront = frontDti !== null && frontDti <= pct(b.targetFrontPct) + 1e-9;
  const meetsBack = backDti !== null && backDti <= pct(b.targetBackPct) + 1e-9;
  return {
    price, down, baseLoan, principalApplied, upfront, financedFee, cashFee, loan, pi, mi, taxes, ins, hoa,
    housing, gmi, frontDti, backDti, closing, dpaApplied, ccaApplied, otherApplied, assistanceApplied,
    unusedAssistance, cashToClose, cashAvailable, cashGap, meetsFront, meetsBack, useAssist,
  };
}

/** Highest price at which both DTI targets are met (payment-based purchasing power). */
export function maxAffordablePrice(b, opts = {}) {
  if (!(num(b.income) > 0)) return null;
  const ok = (pr) => { const r = affordability(b, { ...opts, price: pr }); return r.meetsFront && r.meetsBack; };
  if (!ok(0)) return 0;
  let lo = 0, hi = 5_000_000;
  if (ok(hi)) return hi;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (ok(mid)) lo = mid; else hi = mid;
  }
  return lo;
}

export function affordabilitySummary(b, opts = {}) {
  const r = affordability(b, opts);
  const maxPrice = maxAffordablePrice(b, opts);
  const paymentGap = maxPrice === null ? null : Math.max(0, r.price - maxPrice);
  return { ...r, maxPrice, paymentGap };
}

/* ------------------------------------------------------------------ */
/* Validation                                                           */
/* ------------------------------------------------------------------ */

export function validateProject(p, limits = {}) {
  const L = { maxRatePct: 25, maxPct: 100, ...limits };
  const out = [];
  const add = (field, text, level = 'error') => out.push({ field, text, level });
  (p.budget?.items || []).forEach((it) => {
    const vals = [it.amount, it.unitPrice, it.qty, it.monthly, it.revised].filter(isNum).map(num);
    if (vals.some((v) => v < 0)) add(`item:${it.id}`, `"${it.name || 'Unnamed line'}" has a negative amount. Costs must be zero or more.`);
    if (it.basis === 'pct' && (num(it.pct) < 0 || num(it.pct) > L.maxPct)) add(`item:${it.id}`, `"${it.name}" uses a percentage outside 0 to ${L.maxPct}%.`);
  });
  const f = p.finance || {};
  if (num(f.ratePct) < 0 || num(f.ratePct) > L.maxRatePct) add('finance.ratePct', `The construction loan rate should be between 0% and ${L.maxRatePct}%.`);
  if (num(f.loanAmount) < 0) add('finance.loanAmount', 'The loan amount cannot be negative.');
  if (!(num(p.units) > 0)) add('units', 'Enter at least one residential unit.');
  if (!(num(p.sale?.price) > 0)) add('sale.price', 'Enter an anticipated sales price per unit.', 'warn');
  if (num(p.timeline?.buildMonths) < 0 || num(p.timeline?.saleMonths) < 0) add('timeline', 'Timeline months cannot be negative.');
  if (pct(p.sale?.commissionPct) + pct(p.sale?.sellerClosingPct) >= 1) add('sale', 'Selling costs of 100% or more make every sale price unprofitable.');
  if (budgetTotals(p).tdc <= 0) add('budget', 'The budget has no costs yet. Add line items to calculate Total Development Cost.', 'warn');
  const bu = p.buyer || {};
  if (num(bu.termYears) <= 0) add('buyer.termYears', 'The mortgage term must be greater than zero.');
  if (num(bu.ratePct) < 0 || num(bu.ratePct) > L.maxRatePct) add('buyer.ratePct', `The mortgage rate should be between 0% and ${L.maxRatePct}%.`);
  ['downPct', 'targetFrontPct', 'targetBackPct', 'taxRatePct', 'miAnnualPct', 'upfrontPct'].forEach((k) => {
    if (isNum(bu[k]) && (num(bu[k]) < 0 || num(bu[k]) > L.maxPct)) add(`buyer.${k}`, `${k} must be between 0% and ${L.maxPct}%.`);
  });
  if (num(bu.targetFrontPct) > num(bu.targetBackPct)) add('buyer.targetFrontPct', 'The front-end DTI target is higher than the back-end target. Back-end DTI includes housing plus other debt, so it is normally the larger number.', 'warn');
  return out;
}

/* ------------------------------------------------------------------ */
/* Formatting helpers (shared by UI and exports)                        */
/* ------------------------------------------------------------------ */

export const fmt$ = (v, d = 0) => (v === null || v === undefined || !Number.isFinite(v) ? 'Not yet calculated' : (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
export const fmtPct = (v, d = 1) => (v === null || v === undefined || !Number.isFinite(v) ? 'Not yet calculated' : (v < 0 && Math.abs(v * 100).toFixed(d) !== (0).toFixed(d) ? '−' : '') + Math.abs(v * 100).toFixed(d) + '%');

/* ------------------------------------------------------------------ */
/* Market comps (sale price support)                                    */
/* ------------------------------------------------------------------ */
/**
 * Each comp's price per sq. ft. (rounded to whole dollars, as a CMA reports it)
 * is applied to the subject's living area, then bed / bath / age / other
 * adjustments are added. Active and pending list prices can be discounted by a
 * list-to-sale ratio. The supported value is the average of the indications.
 */
export const COMP_STATUS = { closed: 'Closed sale', pending: 'Pending', active: 'Active listing' };
export function marketComps(p) {
  const m = p.market || {};
  const subj = num(m.subjectSqft) || num(p.sqft);
  const lts = isNum(m.listToSalePct) && num(m.listToSalePct) > 0 ? pct(m.listToSalePct) : 1;
  const diff = (a, b) => (isNum(a) && isNum(b) ? num(a) - num(b) : 0);
  const comps = (m.comps || []).map((c) => {
    const price = num(c.price), sqft = num(c.sqft);
    const valid = price > 0 && sqft > 0;
    const base = c.status === 'closed' ? price : price * lts;
    const ppsf = valid ? Math.round(base / sqft) : null;
    const rawPpsf = valid ? Math.round(price / sqft) : null;
    const bedAdj = diff(m.subjectBeds, c.beds) * num(m.adjPerBed);
    const bathAdj = diff(m.subjectBaths, c.baths) * num(m.adjPerBath);
    const yearAdj = diff(m.subjectYear, c.year) * num(m.adjPerYear);
    const otherAdj = num(c.otherAdj);
    const adjTotal = bedAdj + bathAdj + yearAdj + otherAdj;
    const sizeValue = valid && subj > 0 ? ppsf * subj : null;
    const indicated = sizeValue === null ? null : sizeValue + adjTotal;
    const used = valid && subj > 0 && c.include !== false;
    return { ...c, price, sqft, valid, used, base, ppsf, rawPpsf, bedAdj, bathAdj, yearAdj, otherAdj, adjTotal, sizeValue, indicated };
  });
  const used = comps.filter((c) => c.used);
  const vals = used.map((c) => c.indicated).sort((a, b) => a - b);
  const avg = (a) => (a.length ? a.reduce((t, v) => t + v, 0) / a.length : null);
  const value = avg(vals);
  const median = vals.length ? (vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2) : null;
  const closed = used.filter((c) => c.status === 'closed');
  const closedValue = avg(closed.map((c) => c.indicated));
  const avgPpsf = avg(used.map((c) => c.ppsf));
  const low = vals.length ? vals[0] : null, high = vals.length ? vals[vals.length - 1] : null;
  const price = num(p.sale?.price);
  let status;
  if (!vals.length || subj <= 0) status = 'incomplete';
  else if (!(price > 0)) status = 'noPrice';
  else if (price > high + 0.5) status = 'aboveRange';
  else if (closedValue !== null && price > closedValue * 1.02) status = 'aboveClosed';
  else if (price > value * 1.02) status = 'aboveAverage';
  else status = 'supported';
  return {
    subjectSqft: subj, listToSale: lts, comps, used: used.length, closedCount: closed.length,
    value, median, low, high, closedValue, avgPpsf, price,
    gapToValue: value === null ? null : price - value,
    gapToClosed: closedValue === null ? null : price - closedValue,
    areaMedian: isNum(m.areaMedian) ? num(m.areaMedian) : null, status,
  };
}
