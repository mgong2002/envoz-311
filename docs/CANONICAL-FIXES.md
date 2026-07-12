# Canonical strings & rules for the review-fix pass (READ FIRST)

You are applying review fixes to specific pages of the Envoz 311 static site. The shared foundation is already done — **do not edit `assets/js/shared.js`, `assets/js/data.js`, `assets/css/main.css`, or `assets/fonts/`.** Use the APIs they expose. Full plan: `docs/2026-07-12-review-fixes-implementation-plan.md`. Reviews: `docs/reviews/`.

## Canonical facts (spec of record — never contradict)

- **Confidence thresholds:** escalate to human when confidence **< 0.60**; answer info at **≥ 0.50**; decline below 0.50. **There is no 0.70 threshold.** Say "the 0.60 routing threshold" or "the city-configured routing threshold". Chips are amber-styled below 60 (handled in shared.js already).
- **CEL = "Continuous Evaluation Loop"** everywhere. Never "Civic Evidence Ledger", "Civic Evidence Log", "Continuous-improvement Event Log", "Continuous-Evidence-Log". Allowed gloss after first mention: "the CEL — every interaction becomes evidence."
- **The nine-step loop is a marketing illustration of the CEL**, not a spec'd process. Never "the nine-step Continuous Civic Improvement Loop" as a product concept. Say "an illustration of the Continuous Evaluation Loop (CEL) in action". Replace "Step through the nine stages/steps" → "Step through the loop".
- **Six routing outcomes only** (cm06 enum): `SERVICE_REQUEST_CREATED`, `INFORMATION_ANSWERED`, `ESCALATED_TO_HUMAN`, `EMERGENCY_REDIRECTED`, `STATUS_PROVIDED`, `NO_STRUCTURED_OUTPUT`. Token replacements:
  - `ANSWERED_FROM_KNOWLEDGE` → `INFORMATION_ANSWERED`
  - `SAFETY_ESCALATION` → `EMERGENCY_REDIRECTED`
  - `REFERRED` / `REFERRED_EXTERNAL` → `SERVICE_REQUEST_CREATED` (add visible note "logged with an external_referral record")
  - `HELD_FOR_REVIEW` → `NO_STRUCTURED_OUTPUT` (note "held in the Unknowns queue")  — but see unknowns rule below: an unknown still issues a VR
  - `DUPLICATE_FOLLOWED` → `STATUS_PROVIDED` (note "follower added to the existing case")
  - `NEEDS_REVIEW` as an *outcome* token → drop; it is a queue label only
- **Case internal_status enum:** `new, acknowledged, assigned, in_progress, resolved, closed, duplicate, invalid, referred`. Creation transition is `"from": null` (never `"intake"`). In schema-styled JSON records, `"crew_scheduled"` → `"assigned"`.
- **Priority enum:** `emergency, high, normal, low`. "Medium" → "Normal". "Needs Review" / "SLA Risk" / "Surge Cluster" are **queue/flag labels**, never priorities. (data.js already carries `priority` + optional `flag`.)
- **Unknowns always get a VR** (RF-V4-66): an unclassifiable call is filed as `other_unknown` and a VR number is always issued, then re-typed from the Unknowns queue. Never "no CRM case yet" or a caseless "4-hour hold". VR-4320's data already reflects this — match the copy: "Filed as other_unknown · VR-4320 issued · awaiting human re-type", resident still hears "a person will review it today" **with** a case number.
- **Unit economics:** **$0.50** per AI-handled interaction, **$3.40** per human-handled. Replace every `$0.42`→`$0.50` and `$3.80`/`$7.60`→`$3.40`. Any derived "cost avoided" figure must recompute: if a page shows "$17.7k avoided", change to "$7.1k" (≈2,465 interactions × ($3.40−$0.50)). ROI human-cost default input `8.50`→`3.40`.
- **Connectors — write-target honesty.** SeeClickFix is the only production connector. Status labels: SeeClickFix/Open311 = **"Production reference"**; Accela, Salesforce = **"Partner API"**; QAlert/Catalis = **"Stage Two"**; Tyler/My Civic = **"Roadmap"**; Granicus, CivicPlus, Cityworks, OpenGov EAM/Cartegraph = **"Target catalog"**. Twilio/Telnyx = **"Supported options"** (not GA). Never claim Envoz "writes into" the roadmap/target systems as if live. Canonical write-target sentence:
  > "Envoz writes into SeeClickFix today, with Accela and Salesforce via partner API — built on an Open311-style contract designed to extend to Tyler, QAlert, Cityworks, and OpenGov EAM."
- **"Nico Success Agent" → reframe, don't delete.** New name: **"Nico's improvement recommendations"** (positioning: "Drawn from the Continuous Evaluation Loop: every routed case, correction, and SLA outcome becomes evidence Nico turns into proposals your staff approve."). Drop "dedicated AI success agent assigned to your city", "Monitoring 24/7", and "42 staff hours/month if approved". Keep last-review, focus, open/ready counts, next council update.
- **"Learning Ledger" → "CEL Ledger"** (a dashboard view over cel_event rows, not an entity). `LL-####` ids → `CEL-####`. Remove "Learning Ledger" from any data-model entity list.
- **Photo privacy:** detect-and-prompt + privacy hold, NOT automatic blurring. Canonical: "Photos are screened for faces and plates and held for privacy review — cropped, blurred, or kept private — before any public display."
- **"12 minutes"** config time: demo-world number, not a benchmark. In FAQ/JSON-LD/meta say "minutes of guided conversation (the demo city configures in about 12 minutes)". The three-clocks card on configuration-studio keeps "12 minutes" (demo-labeled there). 48-hour and ~4-week clocks are exact — keep.

## Commercial rules (Workstream B)

- **Primary commercial CTA sitewide:** a "Book a 20-minute pilot scoping call" button. Use the shared form: any `<button type="button" data-pilot-open>Book a 20-minute pilot scoping call</button>` opens it (optionally `data-tier="Mid-size city pilot"`). Secondary CTA is "Watch the demo" (`voice-ai.html?demo=pothole`). **Remove all `mailto:pilots@…`/`mailto:partners@…` CTA links** — replace with `data-pilot-open` buttons (pass `data-tier`).
- **Closing CTA band:** end every page (including dashboards.html and staff-triage.html) with a closing band. You can hand-write one or, in a page JS file, append `Envoz.closingCTA({heading, sub})` HTML. Primary = pilot form, secondary = watch demo.
- **Founding-city framing (pilot-pricing only):** move the "demonstration prototype" line out of the footnote into a visible "Founding city program" band under the hero (first pilot cities, direct engineering access, pilot pricing locked for year one, "we will never assert certifications we do not hold — ask for the security roadmap").
- **Pricing model (pilot-pricing only):** delete monthly tier ranges; replace with **fixed-scope 90-day pilot totals** sized under small-purchase authority (Small ~$12–15K, Mid ~$15–20K, Large from ~$20K, Partner = partner terms), each tagged "90-day fixed scope · sized to fit typical small-purchase authority". Add an "Ongoing pricing" block = usage/outcome (pay per resolved request + ~2–5¢/min voice), "you pay for outcomes, not seats" (label illustrative). Add "After the pilot — three paths" (convert to annual usage/outcome agreement · don't convert: full export of cases/transcripts/config within 30 days at no cost · extend once). Add "How cities buy Envoz" (sized to fit small-purchase authority; RFI/RFP support; honest cooperative-vehicle status: "not yet on cooperative vehicles — pilots are structured so most cities don't need one; ask us about your threshold").
- **Accessibility content (trust.html + voice-ai.html):** add an accessibility commitment card/band — TTY/RTT intake, relay-service compatibility, WCAG 2.1 AA target for resident-facing web surfaces, voice as an access win for residents who can't use web forms. Modest targets, not certifications.
- **Staff/union reassurance (customer-success + attach to cost tiles):** a "What this means for your 311 staff" block — no pilot designed around headcount reduction; hours move from voicemail triage to field/case work (lead with "312 hours returned to field & case work"); staff approve every change. Add a one-line caveat next to any $/interaction comparison tile: "Efficiency here funds field work — pilots are never scoped around headcount reduction."
- **Hero/heading fixes:** index & voice-ai — move the "fictional data" chip BELOW the CTA row. `integrations.html` h1 "Arm the incumbent. Keep the system of record." → "Keep the system your staff trust. Add the voice channel it's missing." `configuration-studio.html` "Onboarding is the moat." → "Onboarding in days, not a six-month statement of work." `index.html` drop "Clarity Engine" from hero badge → "Powered By MetaEngage.ai". `staff-triage.html` — promote "8 structured cases instead of 23 voicemails" into the visible headline/subhead.
- **Testimonials (customer-success):** convert fictional "quote — Name · Title (fictional)" cards to scenario narration: "Week N — what your [role] sees:" + the same content, no invented names. Add a "Demo narrative" chip.

## Copy-voice budgets (Workstream C) — rendered copy only

Voice benchmark = the five human-sounding passages named at the end of `docs/reviews/2026-07-10-landing-ai-copy-tells.md`.
- **Em dashes (—): ≤ 3 per page** in rendered copy. Convert the rest to periods, colons, or "so/which/because". (Do not touch em dashes inside `mono`/JSON code samples or the `→` arrows.)
- **"X, not Y" contrast: ≤ 1 per page.** Kill doubled instances.
- **Triads (a, b, and c): break ~1/3** into pairs or a single claim with a number.
- **Slogan fragments: ≤ 1 per page.** ("One call. Correctly classified. Correctly routed. With confidence." is the allowed signature where it already appears.)
- **Eyebrows:** delete any uppercase eyebrow that restates its h2; cap survivors at 2–3 words; aim to cut ~1/3 sitewide.
- **Card scaffolding:** within a sibling card row, vary shape (one card two short sentences, one a fragment, one carrying a number) instead of identical "Bold phrase — payoff".
- **Brand-phrase homes** (paraphrase elsewhere): "no rip-and-replace" → index/platform/integrations only; "council-ready" → customer-success/dashboards/pilot-pricing only; "before the second ring" → index/voice-ai only; "confidence and rationale" → trust/platform/staff-triage only.
- **Six ready rewrites** (apply verbatim where the page matches): see `docs/reviews/2026-07-10-landing-ai-copy-tells.md` §1 (index h1, index two body sentences, platform lede, customer-success hero, trust answer block) and §2 (platform "routing layer in between").

## Design rules (Workstream D)

- **Emoji → SVG icons.** Replace emoji used as UI iconography with `Envoz.icon(name[, extraClass])` (returns an inline `<svg class="i-icon">`). In static HTML you can't call JS, so: for HTML-authored emoji, either (a) move the emoji into a small `<span data-icon="name"></span>` and have your page JS fill it via `Envoz.icon`, or (b) if the page already builds that section in JS, swap there. **Keep emoji inside simulated chat/call transcripts and resident-facing SMS bubbles — those are content, not UI.** Icon names available: `mic, phone, pin, check, warning, shield, chart, gear, doc, clock, globe, route, building, wrench, bell, users, layers, play, scale, lock, sparkle, map, flag`. Icon-tiles: replace the emoji glyph with an icon; the tile keeps its colored background.
- **Colored left-rail cards** (thin `border-left:5px` on a rounded card): restyle to the shared `.tinted-panel` (+`.teal/.amber/.red/.purple/.green`) pattern — a full tinted panel with a 1px border, no colored rail.
- **Grid rhythm** (index, platform, customer-success): convert one 3-card row to an asymmetric pair / single wide stat panel / plain list, so not every row is 3 identical cards.
- Hero inactive card contrast (index): bump `opacity:.35` → `.55`.

## Accessibility (Workstream E)

- **Dead anchor:** `platform.html` links to `voice-ai.html#escalation` — add `id="escalation"` to voice-ai's escalation/warm-transfer/bad-day section (whichever exists). Verify no other `*.html#…` links point at missing ids.
- **Heading order:** no level skips (h2→h4). Fix levels; if you need a smaller visual size at a correct level, use inline style or an existing class — don't jump levels.
- **JSON-LD:** after editing FAQ/answer copy, update the matching FAQPage/JSON-LD text so it still parses and matches visible copy.

## Working rules

- Keep every page functional: real `<button>`/`<a>`, keyboard-operable, `node --check` clean on any JS you touch, no new console errors.
- Priority order if budget is tight: **A (claims) > B (commercial) > C (copy) > D (design) > E (a11y)**. Never leave an A item half-done.
- Line numbers in reviews may be stale — grep for quoted strings.
- Final message: list files changed + which workstream items you completed vs skipped, and any deviations.
