# WibsVerse software samples

Original JavaScript demonstrations with synthetic data. These are technical samples,
not client projects, shipped customer systems or production integrations.
Developed with assistance from AI coding tools; checked with local tests and Chrome.
No private WibsVerse code, credentials or customer data are included.

## What you can inspect

| Sample | Demonstrates | Verified checks |
| --- | --- | --- |
| Request triage | Input validation, event replay suppression, conflicting ID review | Included in 12 workflow tests |
| Invoice dispatch planning | Exact ID matching, ambiguous document review, prior-delivery suppression | Included in 12 workflow tests |
| Decimal price repair | A reproduced `parseInt` bug, integer minor units, strict validation | 6 regression tests and Chrome desktop checks |

## Run the workflows

Node.js 22 or newer; no packages, accounts or keys required.

```sh
node run.mjs
node --test workflows.test.mjs
```

The invoice example prepares a plan. It sends no email, reads no external documents
and connects to no CRM or automation service. Prepared items are not deliveries.
Read `README.txt` for persistence and integration limits.

## Inspect the price repair

```sh
node --test core.test.cjs
node preview.cjs
```

Open `http://127.0.0.1:8755` in a browser. The deliberately faulty calculation reports
57.00 for 19.90 x 3; the repaired version preserves 59.70 using integer cents.
Chrome desktop checks also verified 0.10 x 3 and rejection of the malformed quantity
`3x`, with stale displayed results cleared. This is not a payment system.

All 18 local automated checks passed on October 6, 2026. External APIs, actual email
delivery, production deployment and mobile browser behavior have not been verified.

## Separate reusable product

[CSV Match Desk](https://www.shopier.com/wibsverse/51552906) is my separate paid
download for comparing two CSV files by exact keys, reviewing unmatched/duplicate
records and exporting results. Its listed price was TRY 299 on October 6, 2026.
I sell that download through WibsVerse; it is not included in this repository.
These source demonstrations can be inspected without buying it.

For a scoped custom request, see the [Bionluk profile](https://bionluk.com/wibonsue).
Scope, input rights, an acceptance check and a feasible date are agreed before work.
Platform-sourced communication and orders stay on their originating platform.
