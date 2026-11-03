/*
 * Emerging Developer Academy(TM) | Development Learning Lab(TM)
 * Shared project data model, Joseph Place instructional case, and
 * browser-local saving. One project object is the single source of truth
 * for all four calculators.
 *
 * Saving: projects are stored only in THIS browser (localStorage). Nothing is
 * sent to a server, there are no accounts, and nothing is backed up. Use
 * "Download project file" to keep a copy.
 */

const KEY = 'eda-lab-v1';
let uid = 0;
export const newId = (p = 'i') => `${p}${Date.now().toString(36)}${(uid++).toString(36)}`;

const L = (cat, name, extra = {}) => ({ id: newId(), cat, name, basis: 'fixed', amount: 0, revised: null, ...extra });

export function blankBuyer() {
  return {
    linkPrice: true, price: 0, location: '',
    product: 'conventional', downPct: 3, ratePct: 6.5, termYears: 30,
    miAnnualPct: 0.5, upfrontPct: 0, financeUpfront: false,
    taxRatePct: 1.5, insuranceAnnual: 1800, hoaMonthly: 0,
    closingCostsMode: 'pct', closingCostsPct: 3, closingCostsAmount: 0, otherCash: 0,
    income: 0, monthlyDebt: 0, cashForDown: 0, cashForClosing: 0,
    targetFrontPct: 31, targetBackPct: 43,
    includeAssistance: true, dpa: 0, dpaCoversClosing: false, cca: 0, principalReduction: 0, otherAssist: 0,
    assistanceStatus: 'assumed',
  };
}

/** Full template of budget lines used for a new project. */
export function templateItems() {
  return [
    L('A', 'Land purchase price'), L('A', 'Title examination and insurance'), L('A', 'Legal and closing expenses'), L('A', 'Survey'), L('A', 'Other acquisition expenses'),
    L('B', 'Environmental assessments'), L('B', 'Geotechnical investigations'), L('B', 'Architectural services'), L('B', 'Civil engineering'), L('B', 'Zoning and entitlement expenses'), L('B', 'Permitting and plan review'), L('B', 'Utility investigations'), L('B', 'Other professional services'),
    L('C', 'Site clearing and demolition'), L('C', 'Grading and excavation'), L('C', 'Water service and connections'), L('C', 'Sewer service and connections'), L('C', 'Electrical utility connections'), L('C', 'Driveways and sidewalks'), L('C', 'Drainage and stormwater'), L('C', 'Landscaping'), L('C', 'Other sitework'),
    L('D', 'Foundation'), L('D', 'Framing'), L('D', 'Roofing'), L('D', 'Exterior finishes'), L('D', 'Windows and doors'), L('D', 'Plumbing'), L('D', 'Electrical'), L('D', 'HVAC'), L('D', 'Insulation'), L('D', 'Drywall'), L('D', 'Interior finishes'), L('D', 'Flooring'), L('D', 'Cabinets and countertops'), L('D', 'Fixtures and appliances'), L('D', 'General contractor overhead and profit'), L('D', 'Other construction expenses'),
    L('E', 'Insurance'), L('E', 'Professional fees not already captured'), L('E', 'Construction administration'), L('E', 'Project management'), L('E', 'Inspections'), L('E', 'Accounting and legal'), L('E', 'Other soft costs'),
    L('F', 'Construction loan origination and application fees', { basis: 'linked', link: 'loanFees' }),
    L('F', 'Construction-period interest', { basis: 'linked', link: 'interest' }),
    L('F', 'Other loan-related fees'),
    L('F', 'Property taxes during construction', { basis: 'monthly', monthly: 0 }),
    L('F', 'Insurance during construction', { basis: 'monthly', monthly: 0 }),
    L('F', 'Utilities and site security', { basis: 'monthly', monthly: 0 }),
    L('F', 'Other holding costs'),
    L('G', 'Construction contingency', { basis: 'pct', pct: 0, pctOf: 'hard' }),
    L('G', 'Other project contingency'),
    L('H', 'Developer fee', { isDeveloperFee: true }),
    L('H', 'Marketing expenses'),
    L('H', 'Sales commissions', { basis: 'linked', link: 'commission', atClosing: true }),
    L('H', 'Seller closing costs', { basis: 'linked', link: 'sellerClosing', atClosing: true }),
    L('H', 'Other disposition expenses', { atClosing: true }),
  ];
}

export function blankProject(name = 'My Project') {
  return {
    id: newId('p'), kind: 'own', name, location: '', type: 'Single-family residential', units: 1, sqft: 0,
    timeline: { buildMonths: 6, saleMonths: 3 },
    budget: { items: templateItems(), costIncreasePct: 0 },
    sale: { price: 0, commissionPct: 6, sellerClosingPct: 0, targetMarginPct: 10 },
    finance: {
      loanAmount: 0, loanStatus: 'proposed', ratePct: 8, termMonths: 12, applicationFee: 0, originationFee: 0, originationPct: 0, otherLoanFees: 0,
      interestMethod: 'average', draws: [], interestReserve: 0,
      ltcLimitPct: 80, ltvLimitPct: null, collateralValue: null, minEquityPct: null,
    },
    sources: [],
    buyer: blankBuyer(),
    pencilScenarios: { a: { label: 'Scenario A', salePrice: null, costIncreasePct: 0, delayMonths: 0, rateDeltaPct: 0, includeIncentive: false }, b: { label: 'Scenario B', salePrice: null, costIncreasePct: 10, delayMonths: 2, rateDeltaPct: 0, includeIncentive: false } },
    reflections: {},
    notes: [],
    updated: new Date().toISOString(),
  };
}

/**
 * 1010 Joseph Place, Memphis, TN. Ferrybrook Holdings, Inc. (Gabriel D. Franceschi).
 * Figures come from the 1010 Joseph Place Development Casebook (EDA Fall 2026).
 * Exhibit D (full construction budget) is in the companion exhibits volume and is
 * NOT itemized here; the $19,000 of the $162,000 budget outside the $143,000
 * vertical construction contract is shown as "not yet itemized" on purpose.
 */
export function josephPlace() {
  const p = blankProject('1010 Joseph Place');
  p.id = 'joseph-place';
  p.kind = 'case';
  p.location = 'Memphis, Tennessee (ZIP 38107)';
  p.developer = 'Gabriel D. Franceschi, Ferrybrook Holdings, Inc. (EDA 2025 alumnus)';
  p.units = 1;
  p.sqft = 1500;
  p.sqftNote = 'Preliminary materials describe about 1,500 heated sq. ft.; a later CMA uses 1,403 sq. ft. The casebook says these must be reconciled before final underwriting.';
  p.timeline = { buildMonths: 3, saleMonths: 9 };
  const src = 'Casebook: Schedule of Values, $143,000 vertical construction contract';
  p.budget = {
    costIncreasePct: 0,
    items: [
      L('D', 'Site, foundation & underslab (15%)', { amount: 21450, note: src }),
      L('D', 'Framing & dry-in (25%)', { amount: 35750, note: src }),
      L('D', 'Rough systems / MEP (20%)', { amount: 28600, note: src }),
      L('D', 'Insulation & drywall (15%)', { amount: 21450, note: src }),
      L('D', 'Interior & exterior finishes (20%)', { amount: 28600, note: src }),
      L('D', 'Completion & closeout (5%)', { amount: 7150, note: src }),
      L('U', 'Balance of $162,000 project budget (land, site, soft costs per Exhibit D)', { amount: 19000, note: 'Casebook: $162,000 project budget less $143,000 vertical contract. Itemize from Exhibit D.' }),
      L('F', 'Loan application & origination fees', { basis: 'linked', link: 'loanFees', note: 'Casebook: $1,000 application fee + $1,000 origination estimate, outside the $162,000 budget.' }),
      L('F', 'Construction-period interest', { basis: 'linked', link: 'interest', note: 'Casebook: interest-only at 8% on the full $146,000 from closing, 3 months build + 9 months to sell.' }),
      L('G', 'Construction contingency', { basis: 'pct', pct: 0, pctOf: 'hard', note: 'Not stated in the casebook. Confirm in Exhibit D whether a contingency is already inside the $162,000.' }),
      L('H', 'Selling costs: brokerage + seller closing (combined)', { basis: 'linked', link: 'commission', atClosing: true, note: 'Casebook uses 6% of the projected sale price for combined disposition costs.' }),
    ],
  };
  p.sale = { price: 215000, commissionPct: 6, sellerClosingPct: 0, targetMarginPct: 10, priceNote: 'Working projected sale price, rounded from the $213,958 CMA estimate.' };
  p.finance = {
    lender: 'The Housing Fund (THF), teaching-case scenario',
    loanAmount: 146000, loanStatus: 'committed', ratePct: 8, termMonths: 12, applicationFee: 1000, originationFee: 1000, originationPct: 0, otherLoanFees: 0,
    interestMethod: 'full',
    draws: [
      { month: 1, amount: 3000, label: 'Loan balance above vertical contract (illustrative timing)' },
      { month: 1, amount: 21450, label: 'Site, foundation & underslab' },
      { month: 1, amount: 35750, label: 'Framing & dry-in' },
      { month: 2, amount: 28600, label: 'Rough systems / MEP' },
      { month: 2, amount: 21450, label: 'Insulation & drywall' },
      { month: 3, amount: 28600, label: 'Interior & exterior finishes' },
      { month: 3, amount: 7150, label: 'Completion & closeout' },
    ],
    drawNote: 'Draw amounts are from the casebook Schedule of Values. The month each draw falls in is an illustrative classroom assumption.',
    interestReserve: 0,
    ltcLimitPct: 90, ltvLimitPct: null, collateralValue: null, minEquityPct: null,
    limitNote: 'Casebook: 90% of eligible project cost is about $146,000. An appraisal-based cap must also be met; its percentage is not stated.',
  };
  p.sources = [
    { id: 'jp-eq', type: 'developerEquity', name: 'Developer cash equity (Ferrybrook Holdings)', amount: 16000, status: 'committed', note: 'Casebook: $162,000 budget = $146,000 loan + $16,000 developer equity.' },
    { id: 'jp-cra', type: 'incentive', name: 'CRA development incentive (illustrative classroom scenario)', amount: 15000, status: 'conditional', includeInScenario: false, note: 'Classroom scenario amount. Its treatment (developer funding, buyer assistance or another benefit) is not confirmed in the casebook, so it is never counted as committed.' },
  ];
  p.buyer = {
    ...blankBuyer(),
    location: 'Memphis, TN 38107',
    downPct: 3,
    income: 40792,
    incomeNote: 'ZIP 38107 median household income cited in the casebook, used as an illustrative buyer.',
    monthlyDebt: 300, cashForDown: 4000, cashForClosing: 3000,
  };
  p.pencilScenarios = {
    a: { label: 'Lower price: $190,000', salePrice: 190000, costIncreasePct: 0, delayMonths: 0, rateDeltaPct: 0, includeIncentive: false },
    b: { label: 'Lower price: $180,000', salePrice: 180000, costIncreasePct: 0, delayMonths: 0, rateDeltaPct: 0, includeIncentive: false },
  };
  p.assumptionNotes = [
    'Sale price, budget, loan, equity, interest terms, loan fees and the 6% selling-cost rate come from the 1010 Joseph Place casebook.',
    'Casebook figures are teaching assumptions. They do not establish that a loan closed or a home sold.',
    'The $190,000 and $180,000 price scenarios and the $15,000 CRA incentive are classroom scenarios.',
    'Buyer rate, taxes, insurance, debt, cash and closing costs are illustrative placeholders. Verify before use.',
  ];
  return p;
}

/* ------------------------------------------------------------------ */
/* Storage                                                              */
/* ------------------------------------------------------------------ */

function read() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.projects) return s; } catch (e) { /* storage unavailable */ }
  return null;
}
let memory = null;
export function state() {
  if (memory) return memory;
  memory = read() || { projects: {}, activeId: 'joseph-place', activity: null };
  if (!memory.projects['joseph-place']) memory.projects['joseph-place'] = josephPlace();
  if (!memory.projects[memory.activeId]) memory.activeId = 'joseph-place';
  return memory;
}
export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state())); return true; } catch (e) { return false; }
}
export const active = () => state().projects[state().activeId];
export function setActive(id) { if (state().projects[id]) { state().activeId = id; persist(); } }
export function resetJosephPlace() { state().projects['joseph-place'] = josephPlace(); state().activeId = 'joseph-place'; persist(); }
export function startOwn(name) { const p = blankProject(name || 'My Project'); state().projects[p.id] = p; state().activeId = p.id; persist(); return p; }
export function saveCopy(name) {
  const src = active();
  const p = JSON.parse(JSON.stringify(src));
  p.id = newId('p'); p.kind = 'own'; p.name = name || `${src.name} (copy)`;
  state().projects[p.id] = p; state().activeId = p.id; persist(); return p;
}
export function deleteProject(id) {
  if (id === 'joseph-place') return false;
  delete state().projects[id];
  if (state().activeId === id) state().activeId = 'joseph-place';
  persist(); return true;
}
export function importProject(obj) {
  if (!obj || !obj.budget || !obj.sale) throw new Error('This file is not an EDA Learning Lab project file.');
  const base = blankProject(obj.name);
  const p = { ...base, ...obj, budget: { ...base.budget, ...obj.budget }, sale: { ...base.sale, ...obj.sale }, finance: { ...base.finance, ...obj.finance }, buyer: { ...base.buyer, ...obj.buyer }, timeline: { ...base.timeline, ...obj.timeline } };
  p.id = newId('p'); p.kind = 'own';
  state().projects[p.id] = p; state().activeId = p.id; persist(); return p;
}

/* path helpers: get(p,'finance.ratePct'), set(p,'finance.ratePct',8) */
export function get(o, path) { return path.split('.').reduce((a, k) => (a == null ? a : a[k]), o); }
export function set(o, path, v) {
  const ks = path.split('.'); let a = o;
  ks.slice(0, -1).forEach((k) => { if (a[k] == null) a[k] = {}; a = a[k]; });
  a[ks[ks.length - 1]] = v;
}
