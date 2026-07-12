# Envoz 311 Landing Site Review - draft of 2026-07-10

Scope: the 12-page marketing/product site (`index`, `platform`, `voice-ai`, `resident-services`, `configuration-studio`, `dashboards`, `staff-triage`, `integrations`, `trust`, `customer-success`, `pilot-pricing`, `resources` + `assets/`).

Companion documents (full detail behind the priorities below):
- `2026-07-10-landing-claims-consistency.md` - every site claim checked against the requirements baseline v3.2, journey slices v3, and data model v4.2 (7 contradictions, 5 overclaims, 4 risky unverifiables, 24 clean checks)
- `2026-07-10-landing-selling-review.md` - conversion and selling-structure review for procurement-driven city buyers (12 ranked findings, per-page 5-second verdicts)
- `2026-07-10-landing-ai-look-review.md` - audit of visual and writing patterns that read as AI-generated (6 design tells, 8 writing tells, fix order)
- `2026-07-10-landing-ai-copy-tells.md` - the full writing-voice detail behind it (counts, quotes, ready rewrites, voice benchmarks)

## Verdict

The build quality is genuinely high: the site is technically clean, mobile-safe, accessible in its foundations, and its disclaimer discipline and "we show our failure modes" posture are trust assets most vendors never achieve. The work needed before this goes in front of any real city is not rebuilding - it is (1) aligning a set of numbers and names that currently contradict the product's own spec, and (2) deciding what the site is commercially (priced pilots vs concept demo), because right now it does both and each undermines the other.

## What already works (keep it)

- Zero console errors, zero failed requests, zero horizontal overflow across all 12 pages at 375 / 768 / 1440 px.
- Full content in static HTML: the site is completely readable with JavaScript disabled; reveal-on-scroll animations correctly disable under `prefers-reduced-motion`.
- Mobile nav is a real `<button>` with `aria-expanded` and `aria-label`; every page has a viewport meta, a unique title, a meta description, exactly one h1, and alt text on every image.
- All interactive demos work: Nico dock (typed commands), ROI calculator recompute, service-catalog filters (39 -> 15), voice scenarios, dashboard tabs, and query-param deep links (`voice-ai.html?demo=pothole` auto-runs; `dashboards.html?tab=...` switches).
- Fictional-data hygiene, the respectful competitor comparison, the published ROI formulas ("benefits we deliberately leave out of the math"), and the six-outcomes-with-JSON proof blocks are the strongest selling assets on the site (selling review, "What already works").
- 24 claims verified exactly right against the spec, including the three clocks, the triage queues, the correction-scope ladder, emergency handling, and case-number integrity (consistency doc, "Clean checks").

## Priority 1 - fix before any external audience

1. **Sitewide invented routing threshold (70%)** - the spec's thresholds are 0.5 / 0.6, and the demo case VR-4342 (64%) is shown held for review when it would route under the spec. Baked into `shared.js`, so every confidence chip repeats it. [Consistency #2]
2. **Integration matrix overclaims "GA"** - Tyler, Salesforce, CivicPlus marked GA; the FAQ JSON-LD (machine-readable) claims writes into 8 CRMs; the spec has SeeClickFix as the only production proof point and the `id_source` enum cannot record most of the listed systems. [Consistency #1]
3. **Pricing model contradicts the spec and itself** - monthly subscription tiers ($2,500-$9,000+) vs the spec's usage/outcome pricing posture and ~$15-20K under-bid-threshold pilot anchor; the same page admits "demonstration prototype" in a footnote after quoting prices. Decide: founding-city program with upfront honesty, or concept demo without hard prices. [Consistency #3, Selling #1]
4. **No real conversion path** - the only commercial action is `mailto:pilots@envoz311.example.com` (a placeholder domain), and the primary CTA drifts page to page. One sitewide commercial CTA + a short form or calendar link. [Selling #2, TE-2]
5. **Missing must-have B2G content: procurement vehicle and accessibility mandates** - no cooperative-purchasing/RFP language anywhere; ADA / Section 508 / WCAG never mentioned on a voice-first product for government. [Selling #3]
6. **The precision brand contradicts itself on names** - CEL expanded four different ways (spec: Continuous Evaluation Loop); "one of six outcomes" broken by SAFETY_ESCALATION and REFERRED on other pages; invented outcome tokens vs the canonical cm06 enum. [Consistency #5, #6; Selling #5]

## Priority 2 - fix before the pilot conversations the site invites

7. Unit economics moved favorably from the spec's own targets ($0.42 vs $0.50 AI; $3.80 vs $3.40 human) and the $0.42 feeds the ROI payback math; the calculator's $8.50 human-cost default is 2.5x the spec figure. [Consistency #4, #13]
8. Invented case states and priorities in schema-styled records on the trust page ("intake", "crew_scheduled", "Needs Review" as a priority) on the page that says "exactly as your systems see it". [Consistency #7]
9. "Unknown category means no CRM case yet" contradicts the v4.2 always-issue-a-VR decision - the exact fail-silently posture the spec eliminated. [Consistency #8]
10. Three branded capabilities the spec does not define: "Nico Success Agent" (dedicated 24/7 per-city agent), the nine-step "Continuous Civic Improvement Loop", and a "Learning Ledger" entity with LL-#### ids presented as part of the data model. Present as marketing gloss over CEL, or add to the spec first. [Consistency #9, #10, #11]
11. Staff-displacement metrics ($0.42 vs manual, "76% contained without staff involvement") lack an adjacent, dedicated staff/union reassurance section. [Selling #4]
12. Fictional testimonials use real-testimonial visual grammar (name + title + quote); a screenshot loses the "(fictional)" tag - fatal if mistaken for an invented reference. Reframe as scenario narration. [Selling #9]
13. No post-pilot story: nothing says what year 2 costs or what happens at day 91 (convert / extend / export and walk). [Selling #6]
14. The site pattern-matches to AI-generated, in look and voice - colored left rails on rounded cards, Inter as the typeface, ~300 emoji used as UI icons, an uppercase eyebrow on 52 of 72 sections, and a copy rhythm of em dashes (299), triads, and "X, not Y" contrasts that a skeptical reader now recognizes as machine voice. The palette, layout, and vocabulary are fine; this is a surface pass, with a concrete fix order and ready rewrites in the AI-look companion docs. [AI-look D1-D6, C1-C8]

## Priority 3 - quality pass

15. Dead anchor: `platform.html` links to `voice-ai.html#escalation`, which does not exist. [TE-1]
16. Small tap targets: inline arrow-links render at ~18px height and footer links at ~31px on mobile (WCAG 2.5.8 minimum is 24px; platform guidance is 44px). Add padding to `.small`/arrow link styles. [TE-3]
17. Heading-level skips on every page (1-5 per page, e.g. h2 -> h4): affects screen-reader outline navigation. [TE-4]
18. Hero copy issues: the fiction disclaimer chip is the first thing read on index (move below the CTA row); "Arm the incumbent" and "Onboarding is the moat" are investor language on buyer pages; "Clarity Engine" appears exactly once - adopt or drop. [Selling #7, #8, #11]
19. `dashboards.html` and `staff-triage.html` end without a closing CTA band - dead-ends at the site's strongest "wow" moments. [Selling #10]
20. Dashboards tab strip truncates on mobile ("CEL Lear...") with no scroll affordance - add a fade edge or shorten labels. [TE-6]
21. Design polish questions, not defects: the third hero demo card on index reads washed-out on the navy ground (if it is an intentional inactive state, consider slightly more contrast); dense sections run body text near the small end for long reading. Overall the navy/teal civic system, card grammar, and section rhythm are coherent and professional. [D-1..D-3]

## How this was tested (reproduce)

- Served the repo statically and loaded all 12 pages in headless Chromium at 375x812 (mobile emulation), 768x1024, and 1440x900: collected console errors, failed requests, `scrollWidth` overflow, tap-target sizes, heading order, alt/meta/JSON-LD presence.
- Full-page screenshots at all three widths (with a scroll-through first so reveal-on-scroll content is visible) reviewed for layout and design.
- Interactive flows driven programmatically: Nico dock command, ROI calculator input change, catalog filter, voice scenario, hamburger menu, tab and demo deep links.
- Progressive-enhancement checks: JavaScript disabled; `prefers-reduced-motion: reduce`.
- Every number, threshold, state name, enum token, and capability claim on the site grepped and cross-checked against requirements baseline v3.2, journey slices v3, and data model v4.2 (see companion doc for citations).
- Link integrity: all internal hrefs and anchors resolved against the actual files.
