import * as S from './store.js?v=1793790609';
import * as E from './engine.js?v=1793790609';
import * as U from './ui.js?v=1793790609';

const { main, project: p } = U.shell('comps', 'Market Comps & Sale Price Support');
const { fmt$, esc, tip } = U;
if (!p.market) p.market = S.blankMarket();
const m = p.market;
const MAX = 10;
const round1k = (v) => Math.round(v / 1000) * 1000;

main.innerHTML = `
<div class="pagehead"><div><h2>Market Comps &amp; Sale Price Support</h2><p class="q">Which recent sales and listings support the price the developer plans to ask?</p></div></div>
${U.learnTeach(`<p>Before a budget can pencil, the developer needs a sale price the market will support. Comparable sales ${tip('comps')} are similar homes nearby. Each comp's price per square foot ${tip('ppsf')} is applied to the subject home's living area to estimate what the subject could sell for. Adjustments ${tip('adjust')} account for differences such as an extra bedroom or a newer home.</p>
<p><b>Closed sales carry the most weight.</b> They show what buyers actually paid, and they are what an appraiser relies on. Active and pending list prices show what sellers are asking. If the planned price is above what closed sales support, the home may appraise low, creating an appraisal gap ${tip('appraisalGap')}.</p>`)}
<div class="grid">
  <div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> The subject home</h3>
      <div class="fields">
        ${U.field('market.subjectSqft', 'Living area (sq. ft.)', { kind: 'num', min: 0 })}
        ${U.field('market.subjectBeds', 'Bedrooms', { kind: 'num', min: 0, step: 1 })}
        ${U.field('market.subjectBaths', 'Bathrooms', { kind: 'num', min: 0, step: 0.5, hint: 'A half bath counts as 0.5' })}
        ${U.field('market.subjectYear', 'Year built', { kind: 'num', min: 1800, step: 1 })}
        ${U.field('market.areaMedian', 'Neighborhood median sold price', { hint: 'A benchmark only, not a comp' })}
      </div>
      <div id="msrc"></div>
    </div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> Adjustments ${tip('adjust')}</h3>
      <div class="fields">
        ${U.field('market.listToSalePct', 'List-to-sale ratio for active and pending comps', { kind: 'pct', step: 0.1, hint: '100% uses asking prices as they are' })}
        ${U.field('market.adjPerBed', 'Value of one bedroom', { hint: 'Added when the subject has more' })}
        ${U.field('market.adjPerBath', 'Value of one full bathroom')}
        ${U.field('market.adjPerYear', 'Value of one year newer')}
      </div>
      <p class="note">Leave adjustments at $0 to match a CMA that applies none. Size is already handled by price per square foot.</p>
    </div>
    <div class="card inputs"><h3><span class="tag in">Inputs</span> Comparable sales and listings</h3>
      <div id="comps"></div>
      <button class="btn alt sm" type="button" id="addComp" style="margin-top:10px">+ Add a comp</button>
    </div>
  </div>
  <div class="sticky"><div class="card results"><h3><span class="tag out">Results</span> Price support</h3><div id="res"></div></div></div>
</div>
<div class="card results"><h3><span class="tag out">Results</span> Each comp as a value for the subject home</h3><div id="tbl" class="tblwrap" tabindex="0" role="region" aria-label="Scrollable table"></div><div id="bars" style="margin-top:12px"></div></div>
${U.learnTry(5, 'Joseph Place market support', `<ol>
<li>Read the six comps from Exhibit C, the Joseph Place CMA. Which one is a <b>closed sale</b>? Which are asking prices?</li>
<li>Find the supported value. Does it match the CMA's <b>$213,958</b>? Compare it with Gabe's working price of <b>$215,000</b>.</li>
<li>Now look at the closed sale alone. What does 855 N Watkins St support for the subject? How far above it is $215,000?</li>
<li>Set the list-to-sale ratio to <b>94.1%</b>, the ZIP 38107 sold-to-list ratio in the CMA. What happens to the supported value?</li>
<li>Uncheck the comp you think is least similar to the subject. Explain your choice. How much does the value move?</li>
<li>Decide on a sale price you could defend to a lender and an appraiser. Use the button in the results to send it to the Pencil Test, then check the profit.</li></ol>`)}
${U.learnReflect('comps', ['Why does a closed sale count for more than an active listing?', 'Which comp would you remove, and why?', 'What sale price would you defend to a lender, and what evidence supports it?'])}
<div id="dl"></div>
${U.nextBar(['./', 'Lab Home'], ['budget.html', 'Budget Builder'])}
<p class="disclaim">Instructional estimate only, not an appraisal or broker price opinion. Comps, adjustments and values must be confirmed by a licensed professional.</p>`;

function compCard(c, i) {
  const b = `market.comps.${i}`;
  return `<div class="comp${c.include === false ? ' off' : ''}" data-i="${i}">
    <div class="comph"><span class="cn">${i + 1}</span>
      <input type="text" class="caddr" aria-label="Comp ${i + 1} address" placeholder="Address" data-bind="${b}.address" data-kind="text">
      <label class="cinc"><input type="checkbox" data-bind="${b}.include" data-kind="bool"> Use</label>
      <button class="btn ghost sm" type="button" data-del="${i}" aria-label="Remove comp ${i + 1}">✕</button></div>
    <div class="fields cf">
      <div class="f"><span><label for="cs${i}">Status</label></span><select id="cs${i}" data-bind="${b}.status" data-kind="select">${Object.entries(E.COMP_STATUS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
      <div class="f"><span><label for="cd${i}">Date</label></span><input id="cd${i}" type="text" data-bind="${b}.date" data-kind="text" placeholder="e.g. Closed 8/3/2026"></div>
      <div class="f"><span><label for="cp${i}">Price</label></span><div class="affix"><input id="cp${i}" type="number" inputmode="decimal" step="any" data-bind="${b}.price" data-kind="money"></div></div>
      <div class="f"><span><label for="cq${i}">Living area (sq. ft.)</label></span><input id="cq${i}" type="number" inputmode="decimal" data-bind="${b}.sqft" data-kind="num"></div>
      <div class="f"><span><label for="cb${i}">Beds</label></span><input id="cb${i}" type="number" step="1" data-bind="${b}.beds" data-kind="num"></div>
      <div class="f"><span><label for="ct${i}">Baths</label></span><input id="ct${i}" type="number" step="0.5" data-bind="${b}.baths" data-kind="num"></div>
      <div class="f"><span><label for="cy${i}">Year built</label></span><input id="cy${i}" type="number" step="1" data-bind="${b}.year" data-kind="num"></div>
      <div class="f"><span><label for="co${i}">Other adjustment (±)</label></span><div class="affix"><input id="co${i}" type="number" inputmode="decimal" step="any" data-bind="${b}.otherAdj" data-kind="money"></div><span class="hint">Condition, lot, garage, location</span></div>
      <div class="f wide"><span><label for="cx${i}">Notes</label></span><input id="cx${i}" type="text" data-bind="${b}.note" data-kind="text" placeholder="Distance, condition, days on market"></div>
    </div>
    <p class="cout" data-out-c="${i}"></p>
  </div>`;
}
function renderComps() {
  U.$('#comps').innerHTML = m.comps.length ? m.comps.map(compCard).join('') : '<p class="note">No comps yet. Add at least three, ideally closed sales.</p>';
  U.$('#addComp').disabled = m.comps.length >= MAX;
  binder.fill(); update();
}
U.$('#comps').addEventListener('click', (e) => {
  const d = e.target.closest('[data-del]');
  if (!d) return;
  const c = m.comps[+d.dataset.del];
  U.askBox(`Remove comp ${+d.dataset.del + 1}${c.address ? ` (${c.address})` : ''}?`, { ok: 'Remove' }).then((ok) => { if (ok) { m.comps.splice(+d.dataset.del, 1); U.saved(); renderComps(); } });
});
U.$('#addComp').addEventListener('click', () => {
  if (m.comps.length >= MAX) return;
  m.comps.push({ id: S.newId('c'), address: '', status: 'closed', date: '', price: null, sqft: null, beds: null, baths: null, year: null, otherAdj: 0, note: '', include: true });
  U.saved(); renderComps();
});
U.$('#msrc').innerHTML = m.source ? `<p class="src">${esc(m.source)}</p>` : '';

const binder = U.bind(main, p, () => update());

const MSG = {
  incomplete: ['info', 'Enter the subject\'s living area and at least one comp with a price and living area.'],
  noPrice: ['info', 'Set a sales price on the Pencil Test, or use one of the buttons below.'],
};
function update() {
  const r = E.marketComps(p);
  r.comps.forEach((c, i) => {
    const el = U.$(`[data-out-c="${i}"]`); if (!el) return;
    el.closest('.comp').classList.toggle('off', c.include === false);
    el.innerHTML = !c.valid ? 'Enter a price and living area to use this comp.'
      : `${c.status !== 'closed' && r.listToSale < 1 ? `${fmt$(c.price)} × ${(r.listToSale * 100).toFixed(1)}% = ${fmt$(c.base)} · ` : ''}<b>${fmt$(c.ppsf)}</b> per sq. ft. × ${r.subjectSqft.toLocaleString('en-US')} sq. ft.${c.adjTotal ? ` ${c.adjTotal > 0 ? '+' : '−'} ${fmt$(Math.abs(c.adjTotal))} adjustments` : ''} = <b>${fmt$(c.indicated)}</b>${c.include === false ? ' <span class="note">(not used)</span>' : ''}`;
  });
  let lvl, msg;
  if (MSG[r.status]) [lvl, msg] = MSG[r.status];
  else {
    const P = fmt$(r.price);
    if (r.status === 'aboveRange') { lvl = 'bad'; msg = `The ${P} sales price is <b>above every comp</b> (highest ${fmt$(r.high)}). The market evidence does not support it. Lower the price or find stronger comps.`; }
    else if (r.status === 'aboveClosed') { lvl = 'warn'; msg = `The ${P} sales price is ${Math.abs(r.gapToValue) < 0.5 ? 'equal to' : r.gapToValue > 0 ? `${fmt$(r.gapToValue)} above` : `${fmt$(-r.gapToValue)} below`} the average of all comps (${fmt$(r.value)}), but <b>${fmt$(r.gapToClosed)} above what the ${r.closedCount === 1 ? 'closed sale supports' : 'closed sales support'}</b> (${fmt$(r.closedValue)}). Most of the support comes from asking prices. An appraiser leans on closed sales, so plan for a possible appraisal gap.`; }
    else if (r.status === 'aboveAverage') { lvl = 'warn'; msg = `The ${P} sales price is within the range of comps but ${fmt$(r.gapToValue)} above their average (${fmt$(r.value)}). Be ready to explain why this home is worth more.`; }
    else { lvl = 'good'; msg = `The ${P} sales price is <b>supported</b>: it is at or below the average of the comps${r.closedValue !== null ? ' and what closed sales support' : ''}. Keep checking the market as the home nears listing.`; }
  }
  const closedNote = r.closedCount ? `${r.closedCount} closed sale${r.closedCount > 1 ? 's' : ''}` : 'No closed sales';
  U.$('#res').innerHTML = r.value === null ? U.status(lvl, msg) : `
  <div class="kpis">
    ${U.kpi('Supported value (average of comps)', fmt$(r.value), `${r.used} comp${r.used === 1 ? '' : 's'} · ${fmt$(r.avgPpsf)} per sq. ft. average`, 'hero', 'comps')}
    ${U.kpi('Closed sales support', r.closedValue === null ? 'Not yet calculated' : fmt$(r.closedValue), closedNote)}
    ${U.kpi('Lowest comp', fmt$(r.low), 'Low end of the range')}
    ${U.kpi('Highest comp', fmt$(r.high), `Median ${fmt$(r.median)}`)}
    ${U.kpi('Your sales price', r.price > 0 ? fmt$(r.price) : 'Not set', r.price > 0 ? `${r.gapToValue >= 0 ? '+' : '−'}${fmt$(Math.abs(r.gapToValue))} vs. average` : 'Set on the Pencil Test', r.status === 'supported' ? 'pos' : r.status === 'aboveRange' ? 'neg' : '')}
    ${r.areaMedian !== null ? U.kpi('Neighborhood median sold', fmt$(r.areaMedian), 'Benchmark, not a comp') : ''}
  </div>
  ${U.status(lvl, msg)}
  <div class="usebtns">
    <button class="btn sm" type="button" data-use="${round1k(r.value)}">Use ${fmt$(round1k(r.value))} as the sales price</button>
    ${r.closedValue !== null ? `<button class="btn alt sm" type="button" data-use="${round1k(r.closedValue)}">Use ${fmt$(round1k(r.closedValue))} (closed sales)</button>` : ''}
  </div>
  <p class="note">The sales price feeds the Pencil Test, Capital Stack, Homebuyer Affordability and the Feasibility Summary. Values are rounded to the nearest $1,000.</p>`;
  U.$('#tbl').innerHTML = `<table class="tbl"><thead><tr><th>Comp</th><th>Status</th><th class="n">Price</th><th class="n">Sq. ft.</th><th class="n">$ / sq. ft.</th><th class="n">Adjustments</th><th class="n">Value for subject</th></tr></thead><tbody>
    ${r.comps.map((c, i) => `<tr${c.used ? '' : ' style="opacity:.55"'}><td>${i + 1}. ${esc(c.address || 'Comp ' + (i + 1))}${c.used ? '' : ' <span class="note">(not used)</span>'}</td><td>${E.COMP_STATUS[c.status] || ''}</td><td class="n">${c.price ? fmt$(c.price) : ''}</td><td class="n">${c.sqft ? c.sqft.toLocaleString('en-US') : ''}</td><td class="n">${c.valid ? fmt$(c.ppsf) : ''}</td><td class="n">${c.valid ? (c.adjTotal ? (c.adjTotal > 0 ? '+' : '−') + fmt$(Math.abs(c.adjTotal)) : '$0') : ''}</td><td class="n">${c.valid ? fmt$(c.indicated) : ''}</td></tr>`).join('')}
    ${r.value !== null ? `<tr class="tot"><td colspan="6">Supported value (average of comps used)</td><td class="n">${fmt$(r.value)}</td></tr>` : ''}
  </tbody></table>`;
  const rows = r.comps.filter((c) => c.used).map((c) => ({ label: `${c.address || 'Comp'} (${c.status === 'closed' ? 'closed' : c.status})`, value: c.indicated, color: c.status === 'closed' ? '#3f6b14' : c.status === 'pending' ? '#B98A1E' : '#2E3192' }));
  U.$('#bars').innerHTML = rows.length ? `<h4 style="margin:0 0 8px;font-size:15px">Value each comp suggests for the subject${r.price > 0 ? ` (your price: ${fmt$(r.price)})` : ''}</h4>${U.barList(rows)}<p class="note">Green = closed sale · gold = pending · navy = active listing.</p>` : '';
  U.markOver && U.markOver();
}
main.addEventListener('click', (e) => {
  const b = e.target.closest('[data-use]'); if (!b) return;
  const v = +b.dataset.use;
  U.askBox(`Set the sales price to ${fmt$(v)}? This changes the Pencil Test, Capital Stack, Homebuyer Affordability and Summary.`, { ok: 'Use this price' }).then((ok) => {
    if (!ok) return;
    p.sale.price = v; p.updated = new Date().toISOString(); U.saved(); update();
  });
});
U.$('#dl').innerHTML = U.downloadBar('Market Comps', p, () => {
  const r = E.marketComps(p);
  return [['Subject living area (sq. ft.)', r.subjectSqft], ['List-to-sale ratio', (r.listToSale * 100).toFixed(1) + '%'], [],
    ['Comp', 'Status', 'Date', 'Price', 'Sq. ft.', '$ per sq. ft.', 'Adjustments', 'Value for subject', 'Used', 'Notes'],
    ...r.comps.map((c) => [c.address, E.COMP_STATUS[c.status], c.date, c.price, c.sqft, c.ppsf, Math.round(c.adjTotal), c.indicated === null ? '' : Math.round(c.indicated), c.used ? 'yes' : 'no', c.note]), [],
    ['Supported value (average)', Math.round(r.value || 0)], ['Closed sales support', r.closedValue === null ? '' : Math.round(r.closedValue)], ['Median', Math.round(r.median || 0)], ['Low', Math.round(r.low || 0)], ['High', Math.round(r.high || 0)], ['Sales price', r.price]];
});
renderComps();
