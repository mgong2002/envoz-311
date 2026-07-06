# Envoz 311 — Multi-Page Marketing + Product Experience Site

A demo-ready, multi-page marketing and product prototype for the **Envoz 311 Platform** — a civic AI platform for cities, counties, and local governments. **Powered By MetaEngage.ai.**

> One call. Correctly classified. Correctly routed. With confidence.

## Running the site

Static site — no build step, no external dependencies. Serve the repo root with any static server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then open http://localhost:8080.

## Pages

| Page | File | What it shows |
| --- | --- | --- |
| Home | `index.html` | Hero split demo (call → map → case), the 9:42 PM problem, improvement loop |
| Platform | `platform.html` | Layered architecture, structured outputs, overlay vs standalone |
| Voice AI for 311 | `voice-ai.html` | 10 interactive voice scenarios incl. the 90-second pothole demo (VR-4281) |
| Resident Services | `resident-services.html` | 28-service configurable catalog with working filters |
| Configuration Studio | `configuration-studio.html` | Configure Harbor Mesa by talking to Nico; sandbox call → HM-TEST-1042 |
| Dashboards & AI Insights | `dashboards.html` | Performance, Service Gaps, CEL Learning, Nico Success Agent, Council Proof |
| Staff Triage | `staff-triage.html` | Case console (VR-4281…VR-4342), unknowns learning queue, correction demo |
| Integrations | `integrations.html` | Integration matrix, respectful competitor comparison |
| Trust, Data & Compliance | `trust.html` | Governed autonomy, data model, MetaEngage.ai infrastructure |
| Customer Success | `customer-success.html` | Council proof, scorecard, 90-day demo story |
| Pilot & Pricing | `pilot-pricing.html` | Pilot tiers and a working ROI calculator |
| Resources / FAQ | `resources.html` | 18 answer-engine-optimized FAQs with FAQPage JSON-LD |

## Nico voice/chat dock

Every page has a floating **Talk to Nico** dock (typed commands always work; voice is simulated). Try:
`Run a pothole report demo` · `Show me the city manager dashboard` · `Configure Harbor Mesa` · `Show after-hours surge` · `Compare Envoz to SeeClickFix` · `Generate a council proof report` · `Show the Continuous Civic Improvement Loop`

## Structure

- `assets/css/main.css` — shared design system (calm, civic, WCAG-friendly)
- `assets/js/shared.js` — header/footer/Nico dock, global command router, loop component
- `assets/js/data.js` — shared fictional demo data (`window.ENVOZ_DATA`)
- `assets/js/pages/*.js` — per-page behavior
- `assets/img/` — Envoz mark, MetaEngage.ai logo assets
- `CONVENTIONS.md` — internal build conventions

## Disclaimer

City of Vista Robles and Harbor Mesa are fictional demonstration cities. All metrics, cases, and quotes are illustrative demo data.
