# Envoz 311 site — review-fixes implementation plan

**For:** the implementing model (Opus 4.8), working in this repo on branch `claude/envoz-311-landing-site-e6vpni`.
**From:** evaluation of the five developer reviews dated 2026-07-10, committed at `docs/reviews/`.
**Status:** plan only — nothing below has been implemented yet.

---

## 0. Mission and ground rules

Apply the fixes and refinements from the five reviews to the 12-page static site at the repo root. The reviews are consistent, high quality, and were verified spot-on against the current code (the 70% threshold, four CEL expansions, the dead `#escalation` anchor, `$0.42/$3.80/$8.50`, the single "Clarity Engine" occurrence, and the `mailto:` placeholder CTAs are all real). Do not rebuild anything; this is alignment + surface work.

Ground rules (unchanged from `CONVENTIONS.md` — read it first):

- Static site, no build step, **no external requests at runtime** (fonts/icons must be vendored into `assets/`).
- Shared design system in `assets/css/main.css`; shared layout/Nico dock in `assets/js/shared.js`; shared demo data in `assets/js/data.js`; per-page JS in `assets/js/pages/`.
- Line numbers in the reviews may have drifted — **grep for the quoted strings**, never trust line numbers.
- The reviewers' "requirements corpus" (PRD v3.2, journey slices, data model v4.2) is **NOT in this repo**. Section 1 below inlines every canonical fact you need from it, extracted from `docs/reviews/2026-07-10-landing-claims-consistency.md`. Treat Section 1 as the spec of record. Where a review conflicts with it, Section 1 wins.
- Keep the site's existing strengths intact — the reviews are explicit about these: fictional-data disclaimers, bad-day/failure-mode sections, respectful competitor comparison, published ROI formulas, the six-outcomes JSON cards, the three clocks, the beehive case, zero console errors / zero mobile overflow. Regressions here are worse than any fix.
- Work through the workstreams in order (A → F). One commit per workstream, then the verification pass (F) and push. Do not open a PR unless asked.

## 1. Canonical facts (inlined from the corpus — treat as the spec)

| Topic | Canonical value |
| --- | --- |
| Routing/confidence thresholds | Escalate to human when confidence **< 0.6**. Answer info questions at **≥ 0.5**, decline below 0.5. There is **no 0.7 threshold**. |
| CEL | **"Continuous Evaluation Loop"** — the only expansion in the corpus. (Not "Civic Evidence Ledger/Log", not "Continuous-improvement Event Log".) |
| Routing outcome enum (cm06, exactly six) | `SERVICE_REQUEST_CREATED`, `INFORMATION_ANSWERED`, `ESCALATED_TO_HUMAN`, `EMERGENCY_REDIRECTED`, `STATUS_PROVIDED`, `NO_STRUCTURED_OUTPUT`. Referrals live in the `external_referral` entity; emergencies log as `EMERGENCY_REDIRECTED`. |
| Case `internal_status` enum | `new, acknowledged, assigned, in_progress, resolved, closed, duplicate, invalid, referred`. Creation transition has `from_status: null` (never "intake"). Display names come from per-tenant `status_label.resident_label`. |
| Priority enum | `emergency, high, normal, low`. ("Medium", "Needs Review", "Surge Cluster" are not priorities — they may only appear as queue/flag labels.) |
| `id_source` enum (who can issue a case number) | `seeclickfix, accela, salesforce, email_fallback, sandbox, pending`. Tyler/Granicus/QAlert/Cityworks/OpenGov **cannot** currently be case-number sources. |
| Connector staging | SeeClickFix adapter = "first production proof point". QAlert/Catalis = Stage Two (months 4–6). Everything else is roadmap/target. |
| Unknown-category behavior (RF-V4-66) | A VR case number is **always issued**, filed as `other_unknown`, and re-typed later from the Unknowns queue. Never a caseless hold. No "4-hour target" exists in the corpus. |
| Unit economics (corpus KPI targets) | **$0.50** per AI-handled interaction vs **$3.40** per human-handled. (Site currently says $0.42 / $3.80 / ROI default $8.50 — all must change.) |
| Pricing posture | Usage/outcome pricing (pay-per-resolved-request, ~2–5¢/min voice economics) as the ongoing model; pilots sold **under the bid threshold (~$15–20K total)**. Monthly platform tiers contradict this. |
| Configuration time | "Minutes of guided configuration" — deliberately unquantified. "12 minutes" is a demo-world number only. 48-hour tenant provisioning and ~4-week production MVP are corpus-exact and stay. |
| Photo privacy | Detect-and-prompt + privacy hold (crop / blur / keep private before public display) — **not** unconditional automatic face/plate blurring. trust.html already has the correct wording; voice-ai.html does not. |
| Telephony | No carrier is committed. TTY/RTT and SIP transfer are corpus-backed. Twilio/Telnyx are options, not GA connectors. |
| Not in the corpus at all | "Nico Success Agent" (dedicated per-city 24/7 agent), the nine-step "Continuous Civic Improvement Loop", "Learning Ledger" entity + `LL-####` id scheme. Nearest support: the CEL "can suggest skill/tool improvements ('Nico has an improvement for this flow')". |
| Verified-correct site claims (do not touch) | "One call. Correctly classified. Correctly routed. With confidence."; three clocks; triage queues New/Needs Review/Unknowns/SLA Risk; correction-scope ladder; 911/safety-gate behavior; case-number integrity + proof strip; warm transfer with context; `HM-TEST-1042`; six outcomes on platform.html; KPI demo values (containment 76%, routing 91.6%, SLA 93.4%, unknown 3.8%, AHT 2:18). |

## 2. Decision log (conflicts resolved; the user may override)

These are judgment calls the reviews leave open. Implement as decided here unless the user says otherwise.

1. **CEL expansion — "Continuous Evaluation Loop" everywhere.** The selling review prefers "Civic Evidence Ledger" as a brand; the consistency review says the corpus defines "Continuous Evaluation Loop". Corpus wins. Marketing gloss "every interaction becomes evidence" is allowed as a tagline, never as the name.
2. **Commercial posture — "Founding city program", not concept-demo retreat.** Selling finding #1 demands a decision. Choose: the site sells real pilots, framed honestly. Pricing becomes a fixed-scope 90-day pilot "sized to fit under typical small-purchase thresholds (~$15–20K total)" + usage/outcome ongoing model. The "demonstration prototype" honesty moves up-front and is reframed positively (see B1).
3. **Confidence thresholds — adopt the corpus numbers (route ≥ 0.6).** Chip low-styling flips from `< 70` to `< 60`. Demo cases are re-rationalized, not re-scored: VR-4320 (41%) stays below threshold → held in Unknowns **with a VR number** filed as `other_unknown`; VR-4342 (64%) now routes on confidence but is **held for review by the surge-cluster monitor** (a flag, not a confidence failure) — update its copy accordingly. VR-4317 (76%) is unaffected.
4. **"Nico Success Agent" → reframed, not deleted.** The dashboards tab, agent card, and recommendation queue stay (they're the site's best demo surface), but the framing becomes CEL-driven recommendations: "Nico's improvement recommendations, drawn from the Continuous Evaluation Loop." Drop "dedicated AI success agent assigned to your city", "Monitoring 24/7", and the "42 staff hours/month if approved" projection.
5. **Nine-step loop → explicitly a marketing illustration.** Keep the visualization; retitle/caption it "How we picture the Continuous Evaluation Loop in action" and stop claiming it as a spec'd nine-step process ("Step through the nine stages" → "Step through the loop").
6. **"Learning Ledger" → a dashboard view over CEL events.** Rename the surface "CEL Ledger" (view name, not entity), change `LL-####` ids to `CEL-####` event ids, and remove "Learning Ledger" from the trust-page data-model explorer.
7. **Form CTA on a prototype** — implement the pilot-scoping form as a real, working modal that on submit shows an honest demo-mode confirmation ("Demo prototype — in production this books a 20-minute scoping call; email us at …") with the mailto as fallback. Never fake a successful submission. Leave a clearly commented swap point for a real endpoint/calendar URL.
8. **"Clarity Engine" — drop it** (appears once, on index). "Powered By MetaEngage.ai" remains everywhere it currently is.
9. **Typeface — vendor Public Sans** (OFL-licensed) into `assets/fonts/` as woff2 (400/600/700 + italic 400) with `@font-face`, promote it to first in `--font`. Do not hot-link any font CDN. If download is impossible in the environment, reorder the stack only and note it in the commit message.
10. **Fictional testimonials → scenario narration.** Keep the timeline content; replace "quote — Name · Title (fictional)" grammar with "Week 4 — what your Public Works director sees:" narration. No invented person names anywhere on the site afterwards.

## 3. Workstream A — claims & consistency (Priority 1; do first)

Every task cites the consistency review finding number (C#).

### A1. Thresholds (C2)
- `assets/js/shared.js`: `const low = pct < 70` → `pct < 60`.
- `staff-triage.html` "fall below the 70% routing threshold" → "fall below the 0.60 routing threshold".
- `assets/js/pages/voice-ai.js` VR-4342 scenario: replace "below the confident-routing threshold" framing with routed-at-64%-then-flagged-by-surge-cluster framing (see Decision 3).
- Grep sweep: `grep -rn "70%\|0\.7\b\|below the .*threshold" *.html assets/js` and fix every confidence-threshold mention to 0.6/0.5 or the words "the city-configured routing threshold".

### A2. Integration matrix & write-target claims (C1)
- `assets/js/pages/integrations.js`: change Status values — SeeClickFix/Open311: **"Production reference"**; Accela, Salesforce Service Cloud: **"Partner API"** (they are in the `id_source` enum); QAlert/Catalis: **"Stage Two"**; Tyler ESR/My Civic: **"Roadmap"**; Granicus, CivicPlus, Cityworks, OpenGov EAM/Cartegraph: **"Target catalog"**. Esri/Google Maps/Municode/knowledge sources can stay as-is (read-side).
- Add one visible line above the matrix: "SeeClickFix is our production reference connector today; statuses below show the build-out sequence." Keep the existing demo-catalog disclaimer.
- `index.html` (overlay section), `platform.html` (overlay mode list), `resources.html` FAQ **and its FAQPage JSON-LD**: change "writes into SeeClickFix, Tyler, Granicus, QAlert, Salesforce, Accela, Cityworks, and OpenGov EAM" → "writes into SeeClickFix today, with Accela and Salesforce via partner API — and is built on an Open311-style contract designed to extend to Tyler, QAlert, Cityworks, and OpenGov EAM."
- `index.html` meta description: "CRM overlay for SeeClickFix and Tyler" → "CRM overlay for SeeClickFix and Open311 systems".
- `configuration-studio.html` + `integrations.js`: Twilio/Telnyx → "supported carrier options", not GA (C15).

### A3. Pricing model (C3 + Selling #1) — see also B1
- `pilot-pricing.html`: delete monthly tier ranges ($2,500–$4,500 / $4,500–$9,000 / ~$9,000+). Replace the four cards' pricing lines with fixed-scope pilot totals: Small "$12–15K total", Mid "$15–20K total", Large/county "scoped, from $20K", Partner/white-label "partner terms" — every card tagged "90-day fixed scope · sized to fit typical small-purchase authority".
- Add an "Ongoing pricing" block after the tiers: usage/outcome model — pay per resolved request plus voice minutes (~2–5¢/min), "you pay for outcomes, not seats"; label ranges illustrative.
- Recompute the ROI payback assumption (currently $3,500/$6,750/$9,000 monthly fees) against the pilot totals + usage model; update the assumptions accordion text to match.

### A4. Unit economics (C4, C13)
- Global: `$0.42` → `$0.50` and `$3.80` → `$3.40` in `assets/js/data.js`, `customer-success.html`, `pilot-pricing.html`, `assets/js/pages/dashboards.js`.
- ROI calculator (`assets/js/pages/pilot-pricing.js` + HTML): human-cost default `$8.50` → `$3.40` with the label "conservative benchmark; use your own loaded cost"; make the Envoz per-interaction cost an **editable input** defaulted to $0.50 tagged "demo estimate" (Selling #12). Recheck the published formulas still read correctly.

### A5. Outcome tokens & state names (C5, C7, Selling #5)
- Replace invented tokens (locations: `assets/js/pages/voice-ai.js`, `resident-services.html`):
  - `ANSWERED_FROM_KNOWLEDGE` → `INFORMATION_ANSWERED`
  - `SAFETY_ESCALATION` → `EMERGENCY_REDIRECTED`
  - `REFERRED` / `REFERRED_EXTERNAL` → `SERVICE_REQUEST_CREATED` + visible note "logged with an external_referral record" (or `internal_status: referred` where a status is shown)
  - `HELD_FOR_REVIEW` / `NEEDS_REVIEW` (as outcomes) → queue labels only, outcome stays one of the six
  - `DUPLICATE_FOLLOWED` → `STATUS_PROVIDED` with "follower added to the existing case" note
- `trust.html` schema card: `"from": "intake"` → `"from": null`.
- `platform.html`: `"current_status": "crew_scheduled"` → `"assigned"` (or present it as `resident_label`).
- `assets/js/data.js`: priorities become High/Normal/Low (map Medium→Normal); keep "Needs Review", "SLA Risk", "Surge Cluster" strictly in the `queue`/flag fields, never `priority`. Update `staff-triage.js` and `dashboards.js` renderers if they key off "Medium".
- Verify "one of six outcomes" is now literally true site-wide: `grep -rn "SAFETY_ESCALATION\|HELD_FOR_REVIEW\|ANSWERED_FROM_KNOWLEDGE\|DUPLICATE_FOLLOWED\|REFERRED_EXTERNAL" *.html assets/js` returns nothing.

### A6. CEL naming (C6)
- One expansion sitewide: **Continuous Evaluation Loop**. Fix: `platform.html` ("Continuous-improvement Event Log"), `dashboards.html` + `staff-triage.html`/`staff-triage.js` ("Civic Evidence Ledger"), `resources.html` + its JSON-LD ("Civic Evidence Log"), `assets/js/pages/trust.js` ("Continuous-Evidence-Log").
- Allowed gloss after first use per page: "the CEL — every interaction becomes evidence".

### A7. Unknowns always get a VR (C8)
- `assets/js/data.js` VR-4320: give it its own case-number story — proof becomes "Filed as other_unknown · VR-4320 issued · awaiting human re-type", drop "no CRM case yet" and the "4-hour target" (replace with "same-day human review, set by tenant config" or just "human review today").
- Update matching copy in `staff-triage.html` (unknowns queue), `assets/js/pages/voice-ai.js` (beehive scenario — resident still hears "a person will review it today", now **with** a case number), and the low-confidence FAQ in `resources.html` (+ JSON-LD).

### A8. Success Agent / nine-step loop / Learning Ledger reframing (C9, C10, C11 — per Decisions 4–6)
- `dashboards.html` + `dashboards.js` (agent tab): retitle "Nico Success Agent · Assigned to Vista Robles" → "Nico's improvement recommendations · Vista Robles" with positioning line "Drawn from the Continuous Evaluation Loop: every routed case, correction, and SLA outcome becomes evidence Nico turns into proposals your staff approve." Remove "Monitoring 24/7", "dedicated AI success agent", and the hours-saved-if-approved projection from `data.js` agent block and every renderer. Keep: last review, focus, open recommendations, ready-for-approval count, next council update.
- `customer-success.html` §improvement-agent, `trust.html` infra card, `resources.html` FAQ (+ JSON-LD): same rename and de-agentification.
- `assets/js/shared.js` loop modal + `platform.html`/`trust.html` embeds: caption the visualization "How we picture the Continuous Evaluation Loop in action — an illustration, not a spec'd process"; "nine steps/stages" phrasing goes.
- Ledger: rename "Learning Ledger" → "CEL Ledger" (a dashboard view); `LL-1042…LL-1046` → `CEL-1042…` in `data.js`, `dashboards.js`, `platform.html`, `staff-triage.js`. Remove "Learning Ledger" from `trust.js` entity list (see A9).
- Update Nico dock command labels/replies in `shared.js` that reference "Success Agent" or "learning ledger" to the new names (keep the same regex matches working, plus the new terms).

### A9. Trust-page data-model explorer (C14)
- `assets/js/pages/trust.js`: stop claiming a 1:1 "20 core entities" mapping. Retitle the section "Core concepts of the data model". Remove "Learning Ledger"; fold "City Rule" + "Department Memory" into one chip "Memory Ladder (city rules · department memory)"; rename "Dedup Check" → "Case Cluster / Relation"; add chips for corpus-real concepts: "Intent Capture", "Write-back Idempotency", "KB Source Citation", "Config Session", "Workflow". Adjust `trust.html` copy that says "The 20 core entities".

### A10. Photo privacy claim (C12)
- `assets/js/pages/voice-ai.js` (bad-day card "Photo privacy"): replace "are cropped, and faces and license plates blurred, before anything appears" with the trust-page wording: "screened for faces and plates and held for privacy review — cropped, blurred, or kept private — before any public display."

### A11. "12 minutes" softening (C16)
- `resources.html` FAQ + JSON-LD: "Minutes of guided conversation with Nico — the demo city configures in about 12 minutes."
- `configuration-studio.html` meta description: same softening. The three-clocks card on the studio page keeps "12 minutes" (it is demo-labeled there). `index.html` mention: add "(demo)" or keep if already inside demo-labeled context — check.

## 4. Workstream B — commercial & selling structure (Priority 1–2)

### B1. Founding-city framing + honest prototype disclosure up-front (Selling #1)
- `pilot-pricing.html`: move the "demonstration prototype" sentence out of the procurement footnote into a visible "Founding city program" band directly under the hero: first pilot cities, direct engineering access, pilot pricing locked for year one, "we will never assert certifications we do not hold — ask for the security roadmap." Keep the modest-compliance sentence in procurement notes too (it's a strength) but it can no longer be the *first* disclosure.

### B2. One sitewide commercial CTA + working form (Selling #2)
- New primary commercial action everywhere: **"Book a 20-minute pilot scoping call"**.
- `assets/js/shared.js`: add a `Envoz.openPilotForm()` modal — fields: name, city/county, population, current CRM (select incl. "none"), email; supporting line "We reply within 2 business days with a scoped pilot outline." Submit → honest demo-mode confirmation + mailto fallback (Decision 7). Header: keep "Watch demo"; the "Configure a city" header button becomes the pilot CTA (or add it to the mobile drawer too). Every closing band sitewide gets primary = pilot form, secondary = "Watch the demo".
- Replace the four tier-card `mailto:` CTAs with the form (prefill tier in the modal).

### B3. Procurement + accessibility content (Selling #3)
- `pilot-pricing.html`: add "How cities buy Envoz" block — pilots sized to fit small-purchase authority; RFI/RFP response support; honest cooperative-vehicle status ("not yet on cooperative vehicles — pilots are structured so most cities don't need one; ask us about your threshold").
- `trust.html` + `voice-ai.html`: add an accessibility commitment card/band — TTY/RTT intake, relay-service compatibility, WCAG 2.1 AA target for resident-facing web surfaces, voice as an accessibility win for residents who can't use web forms. Keep claims modest (targets/design commitments, not certifications).

### B4. Staff/union reassurance (Selling #4)
- `customer-success.html` (or staff-triage): dedicated "What this means for your 311 staff" section — no pilot designed around headcount reduction; hours move from voicemail triage to field/case work (lead with the existing "312 hours returned to field & case work" line); staff approve every change.
- Attach a one-line caveat directly to the cost tiles that show $/interaction comparisons (customer-success scorecard tile, dashboards KPI, pilot ROI outputs): "Efficiency here funds field work — pilots are never scoped around headcount reduction."

### B5. Post-pilot story (Selling #6)
- `pilot-pricing.html`: "After the pilot — three paths" block: (1) convert to annual usage/outcome agreement (state the pricing approach), (2) don't convert — full export of cases, transcripts, configuration within 30 days at no cost, (3) extend the pilot once. Pull the existing scattered exit-ramp fragments into this one paragraph.

### B6. Hero/heading language fixes (Selling #7, #8, #11; site review #18)
- `index.html` + `voice-ai.html`: move the "fictional data" chip below the CTA row (keep it visible; value prop reads first).
- `integrations.html` h1: "Arm the incumbent. Keep the system of record." → "Keep the system your staff trust. Add the voice channel it's missing."
- `configuration-studio.html` "Onboarding is the moat." → "Onboarding in days, not a six-month statement of work."
- `index.html`: drop "Clarity Engine" from the hero badge → "Powered By MetaEngage.ai".
- `staff-triage.html` hero: promote "You arrived to 8 structured cases — not 23 voicemails" (rewritten per C-pass budgets, e.g. "You arrived to 8 structured cases instead of 23 voicemails") into the visible headline/subhead.

### B7. Testimonials → scenario narration (Selling #9; Decision 10)
- `customer-success.html`: convert each fictional quote card to "Week N — what your [role] sees:" narration; delete invented names (Marcus Hale et al.); keep the timeline and the content. Add a "Demo narrative" watermark chip on the cards.

### B8. Close the dead-ends (Selling #10)
- `dashboards.html` and `staff-triage.html`: add the standard closing CTA band (pilot form primary, demo secondary). Place the dashboards one after the Council Proof tab area — the report-generated moment.

## 5. Workstream C — copy voice pass (AI-writing tells)

Apply the budgets from `docs/reviews/2026-07-10-landing-ai-copy-tells.md`. Voice benchmark = the five passages listed in its final section (ROI assumptions, connector-library sentence, beehive case, three clocks, prototype disclosure). This pass touches rendered copy only — headlines, subheads, body, chips, FAQ answers — in all 12 HTML files plus copy strings in page JS.

Budgets (hard targets, verify with the grep harness in F):
- **C1 em dashes:** ≤ 3 per page in rendered copy (site currently 332 in HTML). Convert to periods, colons, "so/which/because". Apply the six ready rewrites from the review verbatim (index h1 + two body sentences, platform lede, customer-success hero, trust answer block).
- **C2 "X, not Y":** ≤ 1 per page. Apply the review's "routing layer in between" rewrite on platform. Kill the doubled instances (staff-triage back-to-back pair, customer-success's four, "proof, not promises" reuse on resources).
- **C3 "Every…/never/always":** vary the Ten Commitments so items open with the noun ("Case numbers come from your CRM's API." / "Tenants are isolated." …). Keep the fabrication guarantee in exactly two places (trust commitment #1, integrations reliability section); elsewhere state it factually once ("the case number comes from SeeClickFix"). Delete "— ever" flourishes.
- **C4 triads:** break ~1/3 into pairs or a single concrete claim with a number (use the review's "two departments, ten service types, and a number to hit by week 12" rewrite for pilot-pricing).
- **C5 slogan fragments:** ≤ 1 per page ("One call. Correctly classified…" stays as the signature where it is corpus-verbatim).
- **C6 card scaffolding:** on integrations overlay-principles, index stakeholder cards, customer-success Nico section, pilot-structure cards — vary shape within each row (one card two short sentences, one a fragment, one carrying a number).
- **C7 answer blocks:** keep the content (AEO is intentional) but demote visually — reduce to quieter styling and/or move below the first fold; do not delete (they carry the JSON-LD-adjacent snippet text).
- **C8 brand-phrase homes:** "no rip-and-replace" → index, platform, integrations only; "council-ready" → customer-success, dashboards, pilot-pricing only; "before the second ring" → index, voice-ai only; "confidence and rationale" → trust, platform, staff-triage only. Paraphrase elsewhere ("you keep SeeClickFix", "picked up on the first ring", "staff can see why it routed there").
- **Eyebrows (D4/C6):** current counts by page are in the harness. Remove every eyebrow that restates its h2 (the review names four examples); cap survivors at 2–3 words; target ≈ 2/3 of current count sitewide.
- Keep the 9:42 PM motif but drop one or two of its kicker restatements.

Note: A-workstream rewrites (agent tab, pricing, integrations) should be written to these budgets in the first pass so C doesn't redo them.

## 6. Workstream D — design pass (AI-look tells)

- **D1 typeface:** vendor Public Sans per Decision 9 (`assets/fonts/`, `@font-face` in main.css, first in `--font`). Optional: a distinct display face for h1/h2 only if it can also be vendored cleanly; otherwise skip.
- **D2 emoji → SVG icons (~300 instances):** add `Envoz.icon(name)` in `shared.js` returning inline SVG (`currentColor`, 1em, `aria-hidden="true"`); build a set of ~14: mic, phone, map-pin, check, warning, shield, chart, gear, document, clock, globe, route, building, wrench. Replace emoji in icon-tiles, chips, wf-node icons, proof/safety strips, rail buttons, buttons, step icons across HTML and JS renderers. **Keep emoji inside simulated chat/call transcripts** (they are content there). Worst files: `voice-ai.js` (~87), `platform.html` (~41).
- **D3 colored left-rail cards (4 instances):** restyle to the tinted-panel-with-border pattern (like `.answer-block`) or chip-strip. Grep `border-left` in page `<style>` blocks.
- **D5 grid rhythm:** on index, platform, customer-success — convert one three-card row per page to an asymmetric pair, a single wide stat panel, or a plain list.
- **D6 radius drift:** 29 distinct `border-radius` values found. Normalize to the tokens (`--r-sm/md/lg/xl`, `999px`, `50%`) in main.css and page style blocks.
- Site-review #21: nudge the index hero case-card inactive state from `opacity:.35` to ≈`.55` so it doesn't read washed-out; site-review #20: add a scroll affordance (fade edge) to `.tabs` on mobile in main.css.

## 7. Workstream E — accessibility & quality (Priority 3)

- **E1 dead anchor:** `platform.html` links to `voice-ai.html#escalation` — add `id="escalation"` to the escalation/bad-day section of voice-ai.html (grep for other dead anchors while at it: extract every `href="*.html#…"` and check the target ids exist).
- **E2 tap targets:** arrow-links (~18px) and footer links (~31px) → ≥ 24px hit area (WCAG 2.5.8), 44px where it doesn't distort layout. Add padding to `.small` arrow links and `.site-footer a` in main.css.
- **E3 heading skips:** every page has 1–5 h2→h4 skips. Fix by correcting levels and using CSS classes for visual size (add utility like `.h4-style` if needed) — do not change visual hierarchy.
- **E4:** keep all pages one-h1, unique title/meta; re-validate JSON-LD after A2/A6/A7/A8/A11 edits (FAQPage answers must match visible text).

## 8. Workstream F — verification (must pass before push)

Recreate the headless harness (playwright-core + vendored Chromium at `/opt/pw-browsers/chromium-*/chrome-linux/chrome`, `--no-sandbox`; install `playwright-core` in the scratchpad, never in the repo). Serve with `python3 -m http.server`.

1. **Zero console errors / pageerrors** on all 12 pages at 1440px and 390px; **zero horizontal overflow** at 390px (the `.reveal` observer needs an instant-scroll pass before full-page screenshots — see history: `scroll-behavior:smooth` swallows plain `scrollTo`).
2. **Interactive flows still work:** pothole demo → VR-4281 + proof (~20s); config-studio flow → credential fail/success, dirty-data gate, sandbox → HM-TEST-1042; dashboards deep links (`?tab=agent&rec=rec-storm-drain&sandbox=1`, `?tab=council&generate=1`, `?mode=surge`); staff-triage row select + CCIL walkthrough; ROI recompute (with new defaults); catalog filters; Nico dock commands (including the renamed agent/ledger commands); **new pilot form** opens, validates, shows demo-mode confirmation.
3. **Claims greps return clean:**
   - `grep -rn "SAFETY_ESCALATION\|HELD_FOR_REVIEW\|ANSWERED_FROM_KNOWLEDGE\|DUPLICATE_FOLLOWED\|REFERRED_EXTERNAL" *.html assets/js` → empty
   - `grep -rn "Civic Evidence\|Continuous-improvement\|Continuous-Evidence" *.html assets/js` → empty; `grep -rc "Continuous Evaluation Loop"` present on pages that expand CEL
   - `grep -rn "LL-10\|Learning Ledger" *.html assets/js` → empty
   - `grep -rn '\$0\.42\|\$3\.80\|\$8\.50' *.html assets/js` → empty
   - `grep -rn "pct < 70\|70% routing" assets/js *.html` → empty
   - `grep -rn "Clarity Engine\|Arm the incumbent\|is the moat" *.html assets/js` → empty
   - `grep -rn "Success Agent" *.html assets/js` → empty (or only in a "formerly known" comment)
   - per-page em-dash budget: `for f in *.html; do echo "$f $(grep -o '—' $f | wc -l)"; done` — flag any page > ~8 in raw HTML (raw HTML includes attributes/JSON-LD; rendered-copy budget is 3, so use judgment, but the total should drop from 332 to well under 100)
   - emoji sweep: `perl -CS -ne 'while (/[\x{1F000}-\x{1FAFF}]/g) { $c++ } END { print $c }' *.html assets/js/pages/*.js assets/js/shared.js` → only transcript content remains
   - dead anchors: extract `href="[a-z-]+\.html#…"` and verify each target id exists
4. **JSON-LD parses** (`node -e` JSON.parse on extracted blocks) and FAQ answers match the new visible copy.
5. Full-page screenshots of index, pilot-pricing, dashboards, integrations at 1440px — eyeball for layout regressions from the icon/radius/eyebrow passes.

## 9. Commit plan

1. `A: align claims with spec — thresholds, connectors, pricing model, outcome enum, CEL naming, unknowns-always-get-a-VR, agent/loop/ledger reframing`
2. `B: commercial structure — founding-city framing, pilot scoping form, procurement & accessibility content, staff reassurance, post-pilot paths, hero language`
3. `C: copy voice pass — em-dash/triad/contrast budgets, eyebrow thinning, brand-phrase homes`
4. `D: design pass — Public Sans, SVG icon set replacing emoji, rail-card restyle, radius tokens, grid variation`
5. `E: accessibility & quality — dead anchor, tap targets, heading levels, tab scroll affordance`
6. `F: verification fixes` (if any) — then push with `git push -u origin claude/envoz-311-landing-site-e6vpni`.

Update `CONVENTIONS.md` at the end: new icon helper, CEL naming rule, brand-phrase homes, copy budgets, and the pilot-form CTA pattern — so future edits don't reintroduce the tells.

## 10. Out of scope / needs the user

- Real form endpoint or calendar link (swap point is stubbed in B2).
- Actually joining cooperative purchasing vehicles; SOC 2 roadmap facts (copy stays modest until provided).
- The requirements corpus itself is not in the repo; if it gets added later, re-run the consistency greps against it.
- Publishing voice latency benchmarks (the consistency review notes this as unused whitespace — a future content play, not a fix).
