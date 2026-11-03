# Development Learning Lab™

Four connected financial calculators for the Emerging Developer Academy™ Fall 2026 Cohort Hub, preloaded with the 1010 Joseph Place instructional case.

| Page | Tool |
|---|---|
| `index.html` | Lab Home |
| `budget.html` | 1 · Development Budget Builder |
| `pencil.html` | 2 · Development Pencil Test & Feasibility Calculator |
| `capital.html` | 3 · Capital Stack & Financing Simulator |
| `homebuyer.html` | 4 · Homebuyer Affordability & Subsidy Calculator |
| `summary.html` | EDA Development Financial Feasibility Summary |

## Architecture

- **`engine.js`**: shared financial engine. Pure functions, no DOM or storage. Unit tested in `tests/engine.test.mjs` (`npm test`).
- **`store.js`**: one project object shared by all four tools (single source of truth), the Joseph Place case data, and browser-local saving.
- **`ui.js`**: shared page shell, project bar, participant and facilitator modes, form binding, glossary tooltips, SVG charts, learning blocks and downloads.
- **`lab.css`**: EDA brand styles (Indigo `#2E3192`, Lime `#8CC63F`, Magenta `#9F1F63`).
- No build step and no dependencies. Plain HTML and ES modules, served by GitHub Pages like the rest of the hub.

## Accounting rules the engine enforces

- Loan principal is a source of funds, never a cost. Interest and loan fees are costs.
- Developer equity is a source, not a cost. A developer fee in the budget is counted once.
- Selling costs (commissions, seller closing costs, other disposition costs) are in Total Development Cost, are deducted from gross sales once, and are not construction-period uses in Sources & Uses.
- Development incentives and homebuyer assistance are separate fields. An incentive counts only when the user includes it, and never as committed financing.
- Homebuyer assistance is applied only to the expense it is eligible for and never twice.
- Missing inputs show "Not yet calculated" rather than an assumed number.

## Joseph Place figures

Taken from the *1010 Joseph Place Development Casebook* (EDA Fall 2026): $215,000 working sale price; $162,000 project budget ($143,000 vertical construction Schedule of Values + $19,000 not yet itemized, which Exhibit D breaks down); $146,000 construction loan at 8% interest-only on the full balance; $16,000 developer equity; $1,000 application + $1,000 origination fees; 3-month build + 9 months to sell; 6% combined selling costs; 90% loan-to-cost.

Classroom scenarios: $190,000 and $180,000 sale prices; $15,000 CRA incentive (conditional); 3% down payment. The illustrative buyer uses the casebook's $40,792 ZIP 38107 median income. Rate, taxes, insurance, debts and cash are editable placeholders.

## Saving and privacy

Projects save only in the participant's browser (`localStorage`). There are no accounts and no central records. Participants can download a project file (JSON) and reopen it later.

## Modes

Add `?mode=facilitator` (or use the toggle) for larger presentation-friendly results, the Current Classroom Activity selector, and a show/hide control for explanations. `?activity=1`–`4` highlights a classroom exercise.
