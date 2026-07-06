# Envoz 311 site — build conventions (internal)

Static multi-page site. No build step, no external network requests (fonts/CDNs). Everything must work by opening the HTML file over a local static server.

## Files

- `assets/css/main.css` — design system. **Do not edit.** Page-specific styles go in a `<style>` block in the page `<head>`.
- `assets/js/data.js` — shared demo data at `window.ENVOZ_DATA` (cases, ledger, recommendations, gaps, successMetrics, agent, departments, neighborhoods). **Do not edit.** Reuse it; page-only data lives in the page's JS file.
- `assets/js/shared.js` — injects header/footer/Nico dock. **Do not edit.**
- `assets/js/pages/<page>.js` — your page's behavior (plain JS, IIFE, `"use strict"`, no frameworks).
- `assets/img/` — `envoz-mark.svg`, `metaengage-mark.svg`, `metaengage-logo.svg`.

## Page skeleton (copy exactly)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>…page title… | Envoz 311</title>
<meta name="description" content="…page-specific…">
<link rel="icon" type="image/svg+xml" href="assets/img/envoz-mark.svg">
<link rel="stylesheet" href="assets/css/main.css">
<!-- JSON-LD where appropriate -->
<style>/* page-specific styles only */</style>
</head>
<body data-page="…" data-marketing="true|false">
<a class="skip-link" href="#main">Skip to content</a>
<div id="site-header"></div>
<main id="main"> … </main>
<div id="site-footer"></div>
<script src="assets/js/data.js"></script>
<script src="assets/js/shared.js"></script>
<script src="assets/js/pages/….js"></script>
</body>
</html>
```

`data-marketing="true"` shows the sticky success bar. Use `true` on marketing pages (home, platform, voice-ai, resident-services, integrations, trust, customer-success, pilot-pricing, resources); `false` on operational consoles (configuration-studio, dashboards, staff-triage).

## Pages / filenames

index.html, platform.html, voice-ai.html, resident-services.html, configuration-studio.html, dashboards.html, staff-triage.html, integrations.html, trust.html, customer-success.html, pilot-pricing.html, resources.html. Link between them with these exact relative hrefs.

## Global JS API (`window.Envoz`, available after DOMContentLoaded)

- `Envoz.openModal(html)` / `Envoz.closeModal()`
- `Envoz.openCompareModal()` — SeeClickFix comparison
- `Envoz.openLoopModal()` — Continuous Civic Improvement Loop modal
- `Envoz.loopHTML(id)` → HTML string of the loop viz; `Envoz.animateLoop(rootEl)` animates it. Use these to embed the loop on Platform / Dashboards / Trust.
- `Envoz.poweredPill(large)` → "Powered By MetaEngage.ai" pill HTML
- `Envoz.nicoSay(text)` — open dock, Nico speaks
- `Envoz.param(key)` — URL query param
- `Envoz.confidenceChip(pct)` → confidence chip HTML

### Nico command contract

`shared.js` routes global commands. Before navigating, it dispatches `nico:command` (`CustomEvent`, `detail: {text, handled, reply}`) — a page may claim a command by setting `detail.handled = true` (and optionally `detail.reply`).

Pages must honor these URL params on load:

- `dashboards.html`: `tab` = performance|gaps|cel|agent|council; `mode=surge` (storm/surge view); `generate=1` (auto-generate council report); `rec=<id>` (open recommendation side panel, e.g. `rec-storm-drain`); `sandbox=1` (animate sandbox run in that panel); `evidence=1` (open evidence view); `filter=ready`.
- `voice-ai.html`: `demo=pothole` auto-plays the pothole scenario ending in VR-4281.
- `configuration-studio.html`: `flow=harbor-mesa` preloads the Harbor Mesa onboarding conversation.

## Design system quick reference

Layout: `.container`, `.section`, `.section-tight`, `.section-dark` (+`.grid-texture`), `.section-aqua`, `.grid.grid-2/3/4`, `.flex`, `.space-between`, `.center`, `.eyebrow`, `.lede`, `.answer-block` (SEO answer block near top of page).
Cards: `.card` (+`.card-hover`, `.card-flat`, `.card-pad-sm`), `.card-dark`, `.icon-tile` (+`ocean|purple|amber|green|navy`), `.kpi` (`.kpi-value/.kpi-label/.kpi-delta.up/down`), `.chart-card`.
Chips: `.chip` + `chip-teal|ocean|navy|green|amber|red|purple|outline`, `.chip-confidence` (+`.low` <70%), `.chip-source`, `.chip-rationale`, `.chip-row`.
Strips: `.proof-strip` (green, animated), `.safety-strip` (red), `.caution-strip` (amber), `.audit-ribbon` (navy).
Status: `.status-new/review/resolved/risk`, `.priority-high/medium/low`.
Steppers: `.stepper > .step(.done/.active) > .step-dot + .step-label`.
Tables: `.table-wrap > table.data-table`; row states `.selected`, `.clickable`.
Tabs: `.tabs > button.tab[aria-selected]` + `.tab-panel[hidden]`. Filters: `.filter-pill[aria-pressed]`.
Buttons: `.btn` + `btn-primary|navy|secondary|ghost` + `btn-sm|btn-lg`.
Modal/drawer: use `Envoz.openModal`; for detail side panels use `.drawer-overlay` + `.drawer` (build in page JS).
Workflow: `.wf-node` (+`.lit/.done/.error`, inner `.wf-icon`), `.wf-connector` (+`.lit`).
Map: `.map-panel > .map-grid` + `.map-pin(.red/.amber) > .pin-head` + `.map-label`.
JSON: `.json-card` with `<span class="k|s|n|b">` tokens.
Charts: inline SVG in `.chart-card`; classes `chart-svg`, `bar-fill`, `bar-track`, `chart-axis`, `chart-line(.ocean)`, `chart-area`, `chart-label`, `chart-value`. Colors: teal `#0f8b8d` primary series, ocean `#1f6fb2` secondary, amber `#b45309` caution, red `#b42318` emergency only, green `#12805c` resolved, purple `#6d5bd0` ONLY for language/AI-confidence. Never rainbow palettes.
Animation: add `.reveal` to blocks for scroll-in (shared.js observes). Respect the existing `prefers-reduced-motion` rule (pure CSS/JS timeouts are fine).
Watermark: `.infra-watermark` inside a `position:relative` container for the subtle "Powered By MetaEngage.ai" mark (Configuration Studio canvas, Trust sections).

## Copy & content rules

- Brand: **Envoz 311** (never "Emvoz"). Parent: exact phrase **Powered By MetaEngage.ai** — subtle, never co-equal with Envoz branding. Alt text for the logo: `Powered By MetaEngage.ai`.
- Demo world: City of Vista Robles, CA; onboarding city Harbor Mesa, CA; assistant **Nico**; 311 / (949) 555-0311; cases VR-4281…VR-4342; sandbox case HM-TEST-1042; incumbent example SeeClickFix.
- Outcome language, no AI hype. Never "replace staff" — "protect staff from chaos", "keep humans accountable". Mark metrics as demo data ("Illustrative demo data"). Trust = confidence, rationale, source, audit, case-write proof. "No rip-and-replace." Respectful competitor language.
- Emergencies: red only; 911 redirect, no 311 case. Never fabricate case numbers or repair dates — say so where relevant.
- Accessibility: semantic headings (one `h1`), aria-labels on interactive controls, keyboard operability (real `<button>`/`<a>`), WCAG-ish contrast.
- SEO: unique title/meta description, concise `.answer-block` near the top, JSON-LD (FAQPage on resources.html, BreadcrumbList elsewhere as sensible), natural use of phrases like "AI voice 311 platform", "311 CRM overlay", "after-hours 311 automation" — no keyword stuffing.

## Quality bar

No placeholders, no dead ends, no lorem ipsum. Every button does something (real behavior, a modal, or navigation). Interactions must work with keyboard. Test that your page renders without console errors.
