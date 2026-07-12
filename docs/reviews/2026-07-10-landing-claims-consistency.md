# Landing site vs requirements corpus - consistency findings

Date: 2026-07-10
Site: `landings\envoz-311-claude-envoz-311-landing-site-e6vpni\` (12 HTML pages + assets/js)
Corpus checked:
- Baseline PRD v3.2: `docs\02_Product_And_Requirements\2026-07-01-Envoz-311-Platform-Requirements-Baseline-v3_2.md`
- Journey slices: `docs\02_Product_And_Requirements\1-Envoz_Req-by-Journey\*.md`
- Data model v4.2: `docs\04_Engineering_And_Architecture\Canonical-Data-Model-and-Schema-Library\2026-07-07-Emvoz311-Canonical-Data-Model-and-Schema-Library-v4.2.md` + `Emvoz311-Schema-Library-v4.2\` package (schemas, migrations, triggers)

Counts: CONTRADICTS 7 · OVERCLAIMS 5 · UNVERIFIABLE-BUT-RISKY 4 · OK-FICTIONAL (grouped list at end)

---

## Ranked findings

### 1. OVERCLAIMS - Integration matrix ships "GA" connectors the corpus does not have
- Page: `integrations.html` (hero chip "14 connectors"; answer block), `assets/js/pages/integrations.js` lines 22-158, `index.html` line 311, `platform.html` lines 291-300, `resources.html` FAQ JSON-LD ("It writes cases into systems like SeeClickFix, Tyler, Granicus, QAlert, Salesforce, Accela, Cityworks, and OpenGov EAM")
- Site quote: "Tyler ESR / My Civic ... status: GA", "CivicPlus ... GA", "Salesforce Service Cloud ... GA"; "Envoz writes into SeeClickFix, Tyler, Granicus, QAlert, Salesforce, Accela, Cityworks, and OpenGov EAM"
- Corpus: Baseline §4.7 names the SeeClickFix adapter as "the first production proof point"; §10 puts the QAlert/Catalis connector in Stage Two (months 4-6). Data model `003_case.sql` `id_source` enum admits only `seeclickfix, accela, salesforce, email_fallback, sandbox, pending` - Tyler, Granicus, QAlert, Cityworks, OpenGov cannot even be recorded as a case-number source. Pilot page itself says "Envoz is a demonstration prototype."
- Risk: a technical evaluator will ask to see any one "GA" connector besides SeeClickFix. The matrix disclaimer ("Illustrative demo catalog") does not cover index/platform/FAQ pages, and the FAQ claim is in machine-readable JSON-LD.
- Fix: mark SeeClickFix as the production/reference connector; move Tyler/Salesforce/Accela to "roadmap / partner API", QAlert/Catalis to "Stage Two", and drop Granicus/Cityworks/OpenGov/CivicPlus from write-target lists (or label the whole matrix "target catalog"). Align the FAQ JSON-LD wording. Extend the `id_source` enum only if these connectors are actually committed.

### 2. CONTRADICTS - Site invents a 70% routing threshold; corpus thresholds are 0.5 / 0.6
- Page: `staff-triage.html` line 193; `assets/js/pages/voice-ai.js` (VR-4342 at 64% "below the confident-routing threshold"); `assets/js/shared.js` line 421 (`const low = pct < 70` styles every confidence chip sitewide)
- Site quote: "All three candidates fall below the 70% routing threshold, so Nico refused to guess"
- Corpus: Baseline §9 acceptance criteria - escalate when confidence < 0.6; answer info questions at confidence >= 0.5, decline below 0.5. Same numbers in Slice J1 §Acceptance ("Given confidence < 0.6 ... SIP transfer with a context packet"). No 0.7 threshold exists anywhere in the corpus.
- Risk: the VR-4342 demo case (64%) would ROUTE under the corpus rules but is shown held for review; the invented threshold is baked into shared UI logic, so every page repeats it.
- Fix: either change the site to the corpus thresholds (route at >= 0.6, escalate below; chips low-styled under 60) or say "below the city-configured routing threshold" with no number. Update shared.js, staff-triage copy, and the VR-4342/VR-4317 confidence values so the demo cases are consistent with whichever rule is chosen.

### 3. CONTRADICTS - Pricing page sells monthly subscription tiers; corpus pricing posture is usage/outcome + ~$15-20K pilot
- Page: `pilot-pricing.html` lines 81, 149-192 (and ROI payback assumptions line 332)
- Site quote: "priced in transparent monthly ranges by city size - from roughly $2,500/month for small cities"; tiers "$2,500-$4,500 / $4,500-$9,000 per month - 90-day pilot estimate"; large tier "starting near $9,000 per month"
- Corpus: Baseline §4.10 - "usage/outcome pricing is uncontested whitespace - nobody prices per resolved request. Emvoz target - pay-per-resolved-request / overflow pricing (and ~2-5c/min voice economics)"; procurement play is "sell under the bid threshold (~$15-20K pilot)". A large pilot at $9,000/mo x 3 months = $27K+ blows the under-bid-threshold anchor; mid tier tops out at $27K. The site never mentions the usage/outcome model that the corpus calls a flagship differentiator.
- Fix: reframe pilot pricing as a fixed-scope pilot in the ~$15-20K range (or "under typical bid thresholds"), and present the ongoing model as usage/outcome (per resolved request / overflow minutes), not per-month platform tiers. If tiers must stay, cap the pilot totals at the corpus anchor and add the usage-pricing story.

### 4. CONTRADICTS - Unit-economics numbers moved favorably from the PRD figures
- Page: `customer-success.html` line 220 ("$0.42 cost per interaction ... vs $3.80 manual"), `pilot-pricing.html` line 329 ("$0.42 estimated Envoz cost per AI interaction"), `assets/js/data.js` line 220 (`costPerInteraction: "$0.42"`)
- Corpus: Baseline §8 KPIs - "cost per interaction ~$0.50 AI-handled vs. ~$3.40 human"; Slice J1 §Success repeats $0.50 / $3.40.
- Risk: AI cost rounded down ($0.50 -> $0.42) and human cost rounded up ($3.40 -> $3.80), widening the ratio from ~6.8x to ~9x. Demo-labeled, but the $0.42 is wired into the ROI payback formula shown to procurement.
- Fix: use $0.50 and $3.40 (the corpus's own conservative targets) in the scorecard, data.js, and the ROI assumptions; keep the "illustrative" label.

### 5. CONTRADICTS - The site invents outcome/event names outside the canonical six-value enum
- Page: `assets/js/pages/voice-ai.js` audit lines 274, 416, 443, 479, 514 and `resident-services.html` lines 159, 189
- Site quotes: CEL audits "DUPLICATE_FOLLOWED", "HELD_FOR_REVIEW", "ANSWERED_FROM_KNOWLEDGE", "REFERRED_EXTERNAL", "SERVICE_REQUEST_CREATED + NEEDS_REVIEW"; "logs the redirect as a SAFETY_ESCALATION outcome"; "Every referral is logged as a REFERRED outcome"
- Corpus: `schemas/4.2/cm06.cel-event.json` `routing_outcome` enum is exactly SERVICE_REQUEST_CREATED, INFORMATION_ANSWERED, ESCALATED_TO_HUMAN, EMERGENCY_REDIRECTED, STATUS_PROVIDED, NO_STRUCTURED_OUTPUT. Referrals live in the `external_referral` entity, emergencies log as EMERGENCY_REDIRECTED. The site's own `platform.html` lists the correct six - the other pages contradict it.
- Fix: replace invented tokens with enum values (ANSWERED_FROM_KNOWLEDGE -> INFORMATION_ANSWERED; SAFETY_ESCALATION -> EMERGENCY_REDIRECTED; REFERRED/REFERRED_EXTERNAL -> SERVICE_REQUEST_CREATED with `internal_status: referred` or the external_referral record; HELD_FOR_REVIEW/NEEDS_REVIEW -> queue labels, not outcome tokens).

### 6. CONTRADICTS - Four conflicting expansions of "CEL", none matching the corpus name
- Page: `platform.html` line 115 ("CEL - Continuous-improvement Event Log"), `dashboards.html` line 155 + `staff-triage.html` lines 131, 154 ("Civic Evidence Ledger (CEL)"), `resources.html` FAQ lines 78, 315 ("Civic Evidence Log"), `assets/js/pages/trust.js` entity list ("Continuous-Evidence-Log")
- Corpus: Baseline §1/§4.2 - "Continuous Evaluation Loop (CEL)". That is the only expansion in the entire corpus.
- Risk: an evaluator cross-checking the acronym finds the site disagreeing with the spec and with itself on the platform's flagship moat.
- Fix: one global pass - expand CEL as "Continuous Evaluation Loop" everywhere (marketing may add "every interaction becomes evidence" as gloss, not as the name).

### 7. CONTRADICTS - Invented case states and priorities outside the canonical state machine
- Page: `trust.html` line 231 (`"status_transition": { "from": "intake", "to": "new" }`), `platform.html` line 191 (`"current_status": "crew_scheduled"`), `assets/js/data.js` (priority values "Medium", "Needs Review", "Surge Cluster"; status values "SLA Risk", "Needs Review")
- Corpus: `005_status_sla_outbox.sql` / `003_case.sql` - `internal_status` enum is exactly new, acknowledged, assigned, in_progress, resolved, closed, duplicate, invalid, referred (creation transition has NULL from_status, not "intake"); priority enum is emergency, high, normal, low. Per-tenant `status_label.resident_label` exists for display names, but the trust page presents "intake" inside a schema-style record it claims is "exactly as your systems see it".
- Fix: trust.html record: `"from": null`. platform.html: use a canonical status (e.g. "assigned") or label the field resident_label. data.js: priorities High/Normal/Low; keep "Needs Review"/"SLA Risk"/"Surge Cluster" strictly as queue/flag labels, not status or priority values.

### 8. CONTRADICTS - "Unknown category means no case is created" vs the v4.2 always-issue-a-VR decision
- Page: `assets/js/data.js` VR-4320 ("proof: Held in learning queue - no CRM case yet"), `staff-triage.html` line 186 ("No CRM case routed yet - held in the learning queue (4-hour target)"), `resources.html` low-confidence FAQ
- Corpus: Data model v4.2 §N (RF-V4-66 decision) - when the voice flow cannot fully type a request, "the gate files the case as `other_unknown` ... so a VR is always issued and J7's unknowns queue re-types it later". Baseline J1 edge (2) alternative is a warm transfer with context - not a caseless 4-hour hold.
- Risk: the site's behavior ("resident told a person will review it, no case number") is exactly the "fail silently" posture v4.2 was written to eliminate.
- Fix: give VR-4320 a real VR number filed as other_unknown sitting in the Unknowns queue; drop "no CRM case yet" and the invented "4-hour target" (or source an SLA from the tenant config story).

### 9. OVERCLAIMS - "Nico Success Agent": a dedicated per-city AI agent the corpus never defines
- Page: `dashboards.html` tab 4 ("Every Envoz city gets a dedicated AI success agent that monitors the program around the clock"), `customer-success.html` §improvement-agent, `trust.html` infra-cap "Nico Success Agent", `resources.html` FAQ ("monitoring the 311 program 24/7 ... 6 open recommendations with 3 ready for approval, projected to save 42 staff hours per month"), `assets/js/data.js` agent block
- Corpus: no "success agent" exists anywhere in the Baseline, slices, or data model (grep confirms). Nearest support is Baseline §4.3a(c): the CEL "can then suggest skill/tool improvements ('Nico has an improvement for this flow')" - a CEL feature, not an assigned monitoring agent with a recommendation queue, autonomy boundaries, and hours-saved projections.
- Fix: rename the surface to CEL-driven recommendations ("Nico proposes improvements from CEL evidence") and drop "dedicated agent assigned to your city / monitoring 24/7" framing, or add the capability to the corpus before marketing it.

### 10. OVERCLAIMS - "Continuous Civic Improvement Loop", a branded nine-step process with no corpus basis
- Page: `assets/js/shared.js` LOOP_STEPS (Listen -> ... -> Improve), `platform.html` §improvement-loop ("Step through the nine stages"), `trust.html` ("Nine steps, each one evidence-logged"), `resources.html` FAQ JSON-LD (defines the loop as a product concept)
- Corpus: the corpus concept is the Continuous Evaluation Loop (CEL) - a QA/eval flywheel (Baseline §4.2). No nine-step "Civic Improvement Loop" exists; the step names and count are invented.
- Risk: an evaluator asking for the spec behind "the nine-step loop" gets nothing; it also collides with finding 6 (CEL naming).
- Fix: present it explicitly as a marketing illustration of how the CEL works ("how we picture the CEL in action"), or reduce to the corpus-backed elements: CEL logging, correction scopes, sandbox-test, approval gate.

### 11. OVERCLAIMS - "Learning Ledger" with LL-#### audit ids presented as a platform audit surface
- Page: `dashboards.html` CEL tab ("Learning Ledger ... Click any row for the full evidence and audit trail"), `platform.html` line 363 ("audit entry LL-1042"), `assets/js/data.js` ledger block, `assets/js/pages/trust.js` entity #18 "Learning Ledger"
- Corpus: the v4.2 schema package (20 schemas, migrations 001-017) has no learning-ledger entity or LL id scheme; audit surfaces are `cel_event`, `tool_call_audit`, `status_transition`. Trust page claims the entity belongs to the data model.
- Fix: either present the ledger as a dashboard view over cel_event rows (use cel event ids) or drop the LL-#### id scheme and the "Learning Ledger" entry from the 20-entity data-model explorer.

### 12. OVERCLAIMS - Automatic face/license-plate blurring stated as platform behavior
- Page: `voice-ai.html` line 184 ("Resident photos are cropped, and faces and license plates blurred, before anything appears on a public map")
- Corpus: Slice J2 / Baseline J2 edge (CL-03) - photo PII screening "detects sensitive content ... and prompts to crop/blur/submit privately"; Vision-RAG photo analysis is Deferred (Baseline §10). The corpus behavior is detect-and-prompt plus privacy hold (media intake token review), not unconditional automatic redaction.
- Fix: "Photos are screened for faces and plates and held for privacy review - cropped, blurred, or kept private - before any public display" (trust.html line 327 already has the correct wording).

### 13. UNVERIFIABLE-BUT-RISKY - ROI calculator defaults invented and load-bearing
- Page: `pilot-pricing.html` lines 267 ($8.50 default "current cost per human-handled call"), 332 (assumed pilot fees $3,500 / $6,750 / $9,000 per month)
- Corpus: the only cost anchor is ~$3.40 per human-handled interaction (Baseline §8); no per-call staffing cost, population bands, or monthly fees exist. The $8.50 default is 2.5x the corpus's human-cost figure and directly inflates "cost avoided" and shortens payback.
- Fix: default the human-cost input to $3.40 (cite it as the corpus benchmark) or to a cited industry source; recompute the payback assumption from whatever pricing survives finding 3. Keep the existing "not a guarantee" caution.

### 14. UNVERIFIABLE-BUT-RISKY - "The 20 core entities" explorer names entities the schema package does not contain
- Page: `trust.html` §data-model + `assets/js/pages/trust.js` lines 6-27
- Detail: the count 20 matches the v4.2 package ("20 schemas at /schemas/4.2/"), which is nice, but several names have no schema counterpart: "Learning Ledger" (none), "City Rule" and "Department Memory" (both are facets of cm07.memory-ladder), "Dedup Check" (case_cluster/case_relation tables, no such entity). Meanwhile real schemas (intent_capture, workflow, config-session, writeback-idempotency, kb-source-citation) are absent.
- Risk: an evaluator diffing the 20 chips against the 20 schema files finds ~5 mismatches on a page titled "Explore the data model."
- Fix: regenerate the chip list from the actual schema filenames (cm00-cm11, soa/sob/soc), with friendly display names.

### 15. UNVERIFIABLE-BUT-RISKY - Twilio / Telnyx named as telephony connectors
- Page: `configuration-studio.html` lines 270-273, `integrations.js` line 132 ("Twilio / Telnyx ... GA")
- Corpus: no corpus document names a telephony carrier; the PSTN carrier decision is an explicitly open item. TTY/RTT and SIP are corpus-backed (Baseline §4.1, §9 SIP transfer).
- Fix: label carriers as "supported options" rather than GA connectors, or generalize to "PSTN / SIP trunk providers" until the carrier decision lands.

### 16. UNVERIFIABLE-BUT-RISKY - "About 12 minutes" configuration time stated as product fact (including in SEO JSON-LD)
- Page: `resources.html` FAQ + FAQ JSON-LD line 58 ("About 12 minutes of guided conversation with Nico produces a configured demo city"), `configuration-studio.html` meta description and three-clocks card, `index.html` line 281
- Corpus: Baseline §4.9/§4.3a and Slice J8 commit to "minutes of guided configuration" - deliberately unquantified. 12 minutes is a demo-world number; inside the JSON-LD FAQ and meta descriptions it reads as a measured product benchmark.
- Fix: in FAQ/JSON-LD say "minutes of guided conversation (the demo city configures in about 12 minutes)"; keep the 12-minute figure demo-labeled on the studio page. The 48-hour and ~4-week clocks are corpus-exact and can stay.

---

## Clean checks (verified accurate against the corpus)

- No stale "Vera" anywhere on the site; the agent is Nico throughout (v3.1 rename fully propagated).
- "One call. Correctly classified. Correctly routed. With confidence." - verbatim Baseline §1 promise.
- Three-persona framing and JTBD quotes ("get this problem on record, in my language, right now"; clean cases, not chaotic transcripts; council-ready proof) - Baseline §3.
- Three clocks kept separate and honest (configure in minutes / 48-hour tenant provisioning / ~4-week production MVP gated by dirty data) - Baseline §4.9, Slice J8 R-J8-08. "Dirty data gates production, not the sandbox" matches J8 edge behavior exactly.
- Six structured outcomes on platform.html, including NO_STRUCTURED_OUTPUT - exactly the cm06 routing_outcome enum (v4.2).
- Sandbox test case id "HM-TEST-1042" matches the canonical sandbox display-id rule ('HM-TEST-' || n) in 003_case.sql.
- Triage queues New / Needs Review / Unknowns / SLA Risk - verbatim R-J7-02.
- Correction scope ladder (this case only / city-only rule / department memory / global taxonomy evidence, never a blind global overwrite) - verbatim J7 CL-08 edge (3).
- The beehive-in-a-bus-shelter unknown, "seen 3+ times becomes a taxonomy candidate" logic, and unknowns-learning-queue framing - corpus-canonical examples (J1 edge 2, J7 narrative), aside from finding 8.
- Emergency handling: safety gate first, 911 redirect, no ordinary 311 case, never confidence-gated - Baseline §4.2, §9.
- Case-number integrity story (number only from the system of record, retry with idempotency, structured-email fallback, never fabricate, proof strip "issued by SeeClickFix at 9:44 PM") - Baseline §2, §4.7, §4.8, J1 edge (7), J4 edge (4).
- Warm transfer with full context packet so the resident never repeats themselves - §9 escalation criterion.
- Non-associated caller gets public status only; light authentication before private detail; stale-status humility (never invent a repair date) - Slice J5 R-J5-02/05 and CL-06.
- No-dead-end external referrals to county/Caltrans/HOA/utility with context attached - Slice J6 R-J6-04a.
- 70+ languages, auto-detect, mid-call switch, escalate rather than risk a wrong address; EN+ES as the pilot default - Baseline §4.1, §10 Day One.
- "Answers before the second ring" and the ~90-second call - R-J1-01 and J1 target.
- Overlay-first / standalone dual mode, structured-email fallback, thin case surface with local VR numbers, open-source CRM as Stage Two posture - Baseline §2, §4.4.
- Proxy Gate as the single checkpoint for every tool call, tenant isolation, audit logging - Baseline §4.8 (site name "Proxy Gate" is an acceptable short form of "Deterministic Proxy Gate").
- Dashboards lead with routing accuracy, containment, unknown-rate, equity, SLA - and explicitly refuse "conversations handled" - Baseline §8.
- Compliance posture kept modest ("demonstration prototype ... will not assert certifications we do not hold") - consistent with §7 Day One posture.
- Demo KPI values sit on the right side of corpus targets (containment 76% vs >70%, routing accuracy 91.6% vs >85%, SLA 93.4% vs >90%, unknown rate 3.8% vs <5%, AHT 2:18 vs <3 min).
- Open311-native positioning - §4.7 universal write-back contract.
- No latency/concurrency numbers are claimed on the site, so the <~700 ms, <50 ms gate, and 50/20/250 sizing anchors cannot be contradicted (note: publishing voice benchmarks is a §4.8/§6 whitespace play the site currently leaves unused).

## OK-FICTIONAL (clearly labeled demo data, listed briefly)

City of Vista Robles and Harbor Mesa (both flagged fictional on every page); all VR-#### case records, transcripts, and SLA countdowns in data.js; the 8-neighborhood SLA heatmap; the 90-day case study with fictional named staff (flagged "fictional" per quote); dashboard KPI set (98.7% answered before second ring, 0:04 hold, 327 after-hours calls, 18 languages, 312 staff hours) - each page carries "illustrative demo data" disclaimers; the 29-service demo catalog ("set per city during onboarding"); the 6 recommendations / 5 ledger rows demo set (apart from findings 9-11 about the framing around them); simulated call journeys on voice-ai.html ("simulated calls - demo data").
