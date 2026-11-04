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
export const CASE_VERSION = 8; // bump when the Joseph Place case data changes
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
    L('H', 'Seller paid closing costs', { basis: 'linked', link: 'sellerClosing', atClosing: true }),
    L('H', 'Other disposition expenses', { atClosing: true }),
  ];
}

export function blankMarket() {
  return { subjectSqft: null, subjectBeds: null, subjectBaths: null, subjectYear: null, areaMedian: null, listToSalePct: 100, adjPerBed: 0, adjPerBath: 0, adjPerYear: 0, source: '',
    comps: [1, 2, 3].map(() => ({ id: newId('c'), address: '', status: 'closed', date: '', price: null, sqft: null, beds: null, baths: null, year: null, otherAdj: 0, note: '', include: true })) };
}
export function josephMarket() {
  const C = (address, status, date, price, sqft, beds, baths, year, note) => ({ id: newId('c'), address, status, date, price, sqft, beds, baths, year, otherAdj: 0, note, include: true });
  return {
    subjectSqft: 1403, subjectBeds: 3, subjectBaths: 2, subjectYear: 2026, areaMedian: 167000, listToSalePct: 100, adjPerBed: 0, adjPerBath: 0, adjPerYear: 0,
    source: 'Exhibit C, Joseph Place CMA (RPR, Nov. 1, 2026): six agent-selected comps. Subject living area 1,403 sq. ft., 3 bed / 2 bath. ZIP 38107 median sold price $167,000; sold-to-list price 94.1%; median 63 days on market.',
    comps: [
      C('915 Faxon Ave', 'active', 'Listed 8/6/2026', 234900, 1400, 3, 2, 2026, '0.54 mi. SW; new construction; 87 days on market'),
      C('1068 Faxon Ave', 'active', 'Listed 7/25/2026', 235900, 1527, 4, 2, 2026, '0.48 mi. S; new construction; 99 days on market'),
      C('855 N Watkins St', 'closed', 'Closed 8/3/2026', 230000, 1596, 3, 2.5, 2024, '0.74 mi. E; the only closed sale'),
      C('941 Leon Pl', 'active', 'Listed 9/21/2026', 205000, 1300, 3, 2, 2026, '0.13 mi. W; closest comp; 41 days on market'),
      C('616 N Claybrook St', 'active', 'Listed 8/5/2026', 289000, 1569, 4, 2.5, 2026, '0.69 mi. SE; proposed construction; 88 days on market'),
      C('1488 Lyndale Ave', 'pending', 'Pending 8/28/2026', 189000, 1772, 3, 2, 2024, '0.92 mi. E; under contract in 3 days'),
    ],
  };
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
    market: blankMarket(),
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
  p.timeline = { buildMonths: 3, saleMonths: 9 };
  const X = (ref) => `Exhibit D ${ref}`;
  p.budget = {
    costIncreasePct: 0,
    exhibitTotal: 161939, // printed total; line items add to $161,937 (rounding in the source)
    items: [
      // A. Land acquisition
      L('A', 'Land purchase price', { amount: 500, note: X('LD.01 Land Acquisition (CRA Essential Housing lot)') }),
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
      L('F', 'Loan application & origination fees', { basis: 'linked', link: 'loanFees', note: 'Casebook p. 20: $1,000 application fee + $1,000 origination fee = $2,000. Not in Exhibit D.' }),
      L('F', 'Interest during construction (3 months)', { basis: 'linked', link: 'interestBuild', note: 'Casebook p. 20: $146,000 × 8% ÷ 12 = $973 a month × 3 months to build = $2,920, about $3,000. Not in Exhibit D.' }),
      L('F', 'Interest while marketing the home (9 months)', { basis: 'linked', link: 'interestHold', note: 'Casebook p. 20: the broker expects up to 9 months to sell. $973 a month × 9 = $8,760, about $9,000. Selling sooner lowers this. Not in Exhibit D.' }),
      L('F', 'Job site security', { amount: 650, note: X('1.09') }),
      // G. Contingency
      L('G', 'Builder contingency', { amount: 5000, note: X('18.02 (about 3.8% of hard costs)') }),
      L('G', 'Rounding to the $162,000 development budget', { amount: 63, note: 'Casebook pp. 15, 19 and 21: the Exhibit D line items ($161,937) are presented as a $162,000 development budget.' }),
      // H. Developer fee & disposition
      L('H', 'Developer fee & program costs', { amount: 650, isDeveloperFee: true, note: X('LD.06 Development Cost') }),
      L('H', 'Selling costs: brokerage + seller paid closing (combined)', { basis: 'linked', link: 'commission', atClosing: true, note: 'Casebook pp. 17, 21 and 30: 6% of the $215,000 sale price = $12,900. The casebook rounds it to the nearest $1,000: $13,000 cost of sale. Not in Exhibit D.' }),
      L('H', 'Seller paid closing costs (only if beyond the 6%)', { basis: 'linked', link: 'sellerClosing', atClosing: true, note: 'Set by the seller paid closing cost %. The casebook\'s 6% already includes typical seller paid closing costs, so this is 0% unless you are testing more.' }),
    ],
  };
  p.sale = { price: 215000, commissionPct: 6, sellerClosingPct: 0, sellingRoundTo: 1000, targetMarginPct: 10, priceNote: 'Working projected sale price, rounded from the $213,958 CMA estimate.' };
  p.finance = {
    lender: 'The Housing Fund (THF), teaching-case scenario',
    loanAmount: 146000, loanStatus: 'committed', ratePct: 8, termMonths: 12, applicationFee: 1000, originationFee: 1000, originationPct: 0, otherLoanFees: 0, interestRoundTo: 1000, ltcBasis: 'budget', ltcRoundTo: 1000,
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
    ltcLimitPct: 90, ltvLimitPct: null, collateralValue: null, minEquityPct: 10,
    limitNote: 'Casebook: 90% of eligible project cost is about $146,000. An appraisal-based cap must also be met; its percentage is not stated.',
  };
  p.sources = [
    { id: 'jp-eq', type: 'developerEquity', name: 'Owner\'s equity: Gabe\'s cash on hand (Ferrybrook Holdings)', amount: 16000, status: 'committed', note: 'THF requires owner\'s equity of 10% of total project cost: 10% of $162,000 = $16,200, about $16,000. The loan covers the other 90% ($146,000).' },
    { id: 'jp-res', type: 'loanReserve', name: 'THF reserve for interest & loan fees', amount: 14000, status: 'committed', note: 'Held with the THF loan and drawn over time to pay the cost of debt: $12,000 interest (3 months to build + 9 to sell) + $2,000 loan fees. Repaid from the sale at closing. If the home takes longer to sell, the extra interest is not covered.' },
    { id: 'jp-cra', type: 'incentive', name: 'CRA Essential Housing development incentive', amount: 20000, status: 'conditional', includeInScenario: false, note: 'A possible CRA Essential Housing incentive tied to this parcel. It is a project source, not owner\'s equity: it can pay for the developer\'s financing gap, site costs, predevelopment, or added features such as eco-build standards, but never counts toward Gabe\'s 10% equity. Turn it on to see how a $20,000 CRA incentive changes profit, the funding gap and the equity Gabe must bring. Change the status to committed once it is awarded in writing.' },
  ];
  p.buyer = {
    ...blankBuyer(),
    location: 'Memphis, TN 38107',
    downPct: 3,
    income: 40792,
    incomeNote: 'ZIP 38107 median household income cited in the casebook, used as an illustrative buyer.',
    monthlyDebt: 300, cashForDown: 4000, cashForClosing: 3000,
  };
  p.market = josephMarket();
  p.pencilScenarios = {
    a: { label: 'Lower price: $190,000', salePrice: 190000, costIncreasePct: 0, delayMonths: 0, rateDeltaPct: 0, includeIncentive: false },
    b: { label: 'Lower price: $180,000', salePrice: 180000, costIncreasePct: 0, delayMonths: 0, rateDeltaPct: 0, includeIncentive: false },
  };
  p.assumptionNotes = [
    'The budget is Exhibit D, the Ferrybrook Holdings construction budget (October 2026). Its line items add to $161,937, presented in the casebook as a $162,000 development budget. Lines are grouped into the Learning Lab categories; each line shows its Exhibit D reference.',
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
  Object.values(memory.projects).forEach((q) => {
    if (!q.market) q.market = q.kind === 'case' ? josephMarket() : blankMarket();
    if (q.kind === 'case' && /reconciled before final underwriting/.test(q.sqftNote || '')) delete q.sqftNote;
    (q.sources || []).forEach((x) => { if (x.id === 'jp-cra' && /it can help pay costs but/.test(x.note || '')) x.note = x.note.replace('it can help pay costs but never counts', 'it can pay for the developer\'s financing gap, site costs, predevelopment, or added features such as eco-build standards, but never counts'); });
    (q.sources || []).forEach((x) => { if (x.id === 'jp-cra' && /^Not included in Gabe/.test(x.note || '')) x.note = x.note.replace(/^Not included in Gabe's budget \(Exhibit D\)\./, 'A possible CRA Essential Housing incentive.'); });
    const items = q.budget && q.budget.items;
    if (!items || items.some((i) => i.basis === 'linked' && i.link === 'sellerClosing')) return;
    const at = items.findIndex((i) => i.basis === 'linked' && i.link === 'commission');
    const line = L('H', q.kind === 'case' ? 'Seller paid closing costs (only if beyond the 6%)' : 'Seller paid closing costs', { basis: 'linked', link: 'sellerClosing', atClosing: true, note: q.kind === 'case' ? 'Set by the seller paid closing cost %. The casebook\'s 6% already includes typical seller paid closing costs, so this is 0% unless you are testing more.' : '' });
    items.splice(at >= 0 ? at + 1 : items.length, 0, line);
  });
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
  const p = { ...base, ...obj, budget: { ...base.budget, ...obj.budget }, sale: { ...base.sale, ...obj.sale }, finance: { ...base.finance, ...obj.finance }, buyer: { ...base.buyer, ...obj.buyer }, market: obj.market || base.market, timeline: { ...base.timeline, ...obj.timeline } };
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
