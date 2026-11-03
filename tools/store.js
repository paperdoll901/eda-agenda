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
export const CASE_VERSION = 3; // bump when the Joseph Place case data changes
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
  p.caseVersion = CASE_VERSION;
  p.location = 'Memphis, Tennessee (ZIP 38107)';
  p.developer = 'Gabriel D. Franceschi, Ferrybrook Holdings, Inc. (EDA 2025 alumnus)';
  p.units = 1;
  p.sqft = 1500;
  p.sqftNote = 'Exhibit D uses about 1,500 heated sq. ft. Preliminary materials describe about 1,500 heated sq. ft.; a later CMA uses 1,403 sq. ft. The casebook says these must be reconciled before final underwriting.';
  p.timeline = { buildMonths: 3, saleMonths: 9 };
  const X = (ref) => `Exhibit D ${ref}`;
  p.budget = {
    costIncreasePct: 0,
    exhibitTotal: 161939, // printed total; line items add to $161,937 (rounding in the source)
    items: [
      // A. Land acquisition
      L('A', 'Land purchase price', { amount: 500, note: X('LD.01 Land Acquisition (CRA Essential Housing lot)') }),
      L('A', 'Title, legal and acquisition closing costs', { amount: 0, note: 'Not in Exhibit D. Casebook: acquisition closing costs must be confirmed. Estimate this.' }),
      // B. Predevelopment
      L('B', 'Architect, engineering, soils study & land survey', { amount: 600, note: X('1.01') }),
      L('B', 'Design review / plan check fees', { amount: 2500, note: X('1.02') }),
      L('B', 'Permits (city / county)', { amount: 322, note: X('1.03') }),
      // C. Site development
      L('C', 'Clearing & stakeout', { amount: 850, note: X('3.01') }),
      L('C', 'Finish grading', { amount: 511, note: X('3.11') }),
      L('C', 'Utility connection fees (water, sewer, electric)', { amount: 6500, note: X('1.05') }),
      L('C', 'Driveway, walkways & steps', { amount: 7671, note: X('15.01') }),
      L('C', 'Landscaping', { amount: 1023, note: X('15.02') }),
      // D. Hard construction
      L('D', 'Foundation & slab (concrete)', { amount: 18098, note: X('4.02 foundation $5,114 + 4.03 slab $12,984') }),
      L('D', 'Framing (lumber + labor)', { amount: 26733, note: X('5.01 lumber $16,548 + 5.06 labor $10,185') }),
      L('D', 'Roofing, gutters & downspouts', { amount: 5421, note: X('8.01 $3,375 + 8.02 $2,046') }),
      L('D', 'Exterior siding & exterior painting', { amount: 5757, note: X('6.01 siding $2,557 + 15.05 painting $3,200') }),
      L('D', 'Windows & exterior doors', { amount: 3273, note: X('7.01 $2,046 + 7.02 $1,227') }),
      L('D', 'Plumbing (ground, top-out, finish, fixtures)', { amount: 12194, note: X('16.01–16.04') }),
      L('D', 'HVAC (rough + finish)', { amount: 7671, note: X('16.07 $3,580 + 16.08 $4,091') }),
      L('D', 'Electrical & lighting fixtures', { amount: 8438, note: X('17.01 $4,091 + 17.02 $3,580 + 17.03 $767 (Exhibit D subtotal shows $8,439)') }),
      L('D', 'Insulation', { amount: 2425, note: X('9.01') }),
      L('D', 'Drywall (material & labor)', { amount: 7160, note: X('9.02') }),
      L('D', 'Interior finishes (paint, trim, doors, hardware, carpentry, mirrors)', { amount: 9974, note: X('10.01 painting $2,046 + 11.01–11.04, 11.06 $7,928 (Exhibit D subtotal shows $7,927)') }),
      L('D', 'Flooring', { amount: 4497, note: X('12.01') }),
      L('D', 'Cabinets & countertops', { amount: 5335, note: X('13.01 $3,395 + 13.02 $1,940') }),
      L('D', 'Appliances', { amount: 2700, note: X('14.01') }),
      L('D', 'General contractor overhead, profit & builder\'s fee', { amount: 9350, note: X('18.01 overhead/profit $350 + 18.03 builder\'s fee $9,000') }),
      L('D', 'Temporary utilities, final cleaning & touch-up', { amount: 1884, note: X('1.07 $350 + 1.12 $1,534') }),
      // E. Soft costs
      L('E', "Builder's risk insurance", { amount: 750, note: X('1.04') }),
      L('E', 'Project management & supervision', { amount: 3500, note: X('1.10') }),
      // F. Financing & holding
      L('F', 'Loan application & origination fees', { basis: 'linked', link: 'loanFees', note: 'Casebook: $1,000 application + $1,000 origination estimate. Not in Exhibit D.' }),
      L('F', 'Construction-period interest', { basis: 'linked', link: 'interest', note: 'Casebook: 8% interest-only on the full $146,000 from closing, 3 months build + 9 months to sell. Not in Exhibit D.' }),
      L('F', 'Job site security', { amount: 650, note: X('1.09') }),
      L('F', 'Property taxes, insurance & utilities while marketing', { basis: 'monthly', monthly: 0, note: 'Not in Exhibit D. Casebook: holding costs during the 9-month sale period must be confirmed. Enter a monthly estimate.' }),
      // G. Contingency
      L('G', 'Builder contingency', { amount: 5000, note: X('18.02 (about 3.8% of hard costs)') }),
      // H. Developer fee & disposition
      L('H', 'Developer fee & program costs', { amount: 650, isDeveloperFee: true, note: X('LD.06 Development Cost') }),
      L('H', 'Selling costs: brokerage + seller closing (combined)', { basis: 'linked', link: 'commission', atClosing: true, note: 'Casebook: 6% of the projected sale price for combined disposition costs. Not in Exhibit D.' }),
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
    { id: 'jp-cra', type: 'incentive', name: 'CRA Essential Housing development incentive', amount: 20000, status: 'conditional', includeInScenario: false, note: 'Not included in Gabe\'s budget (Exhibit D). Turn it on to see how a $20,000 CRA incentive changes profit, the funding gap and the equity Gabe must bring. Change the status to committed once it is awarded in writing.' },
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
    'The budget is Exhibit D, the Ferrybrook Holdings construction budget (October 2026). Its line items add to $161,937; Exhibit D prints $161,939 because of rounding, and the casebook rounds to $162,000. Lines are grouped into the Learning Lab categories; each line shows its Exhibit D reference.',
    'Sale price, loan, equity, interest terms, loan fees and the 6% selling-cost rate come from the casebook. They sit outside Exhibit D, exactly as the casebook explains.',
    'Casebook figures are teaching assumptions. They do not establish that a loan closed or a home sold.',
    'The $190,000 and $180,000 price scenarios are classroom scenarios. The $20,000 CRA incentive is not in Gabe\'s budget; it is off by default and can be turned on and off.',
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
  const jp = memory.projects['joseph-place'];
  if (!jp || jp.caseVersion !== CASE_VERSION) { memory.projects['joseph-place'] = josephPlace(); try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) {} }
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
