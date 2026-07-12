# Envoz 311 landing site - AI-writing tells audit (12 pages)

Scope: rendered copy only (headlines, subheads, body, chips, FAQ answers) in all 12 .html files at
`landings/envoz-311-claude-envoz-311-landing-site-e6vpni\`.
Counts below are from the HTML files (299 em dashes in HTML; the site-wide 332 presumably includes JS data strings).

## Summary

The copy is well above average for AI-generated marketing - the vocabulary is clean (zero "seamless/empower/unlock/robust" hits in rendered copy), the claims are specific, and there is real product knowledge in every paragraph. What gives it away is rhythm, not word choice: a skeptical reader will notice the em-dash-plus-triad sentence shape repeated hundreds of times, the "X, not Y" contrast used ~40 times, the "Every ... always/never" reassurance cadence (57 never/always), and the fact that every section on every page opens with an uppercase eyebrow kicker. Worst offenders are index.html, platform.html, customer-success.html, and trust.html, where nearly every heading, card, and bullet shares one of three grammatical molds. Best pages are pilot-pricing.html (the ROI assumptions block), configuration-studio.html (the three clocks), and staff-triage.html (the beehive case) - these read like a person who has run the product.

## Findings

### 1. Em dash as the universal connective (299 in HTML, every page; worst: resources 43, pilot-pricing 41, platform 35, customer-success 33)

The dash stands in for "so", "which means", a colon, or a full stop. Six worst sentences with rewrites:

1. index.html h1: "AI-native 311 for cities that need every resident heard — after hours, in any language, with proof."
   Rewrite: "AI-native 311 that hears every resident, even at 9:42 PM, even in Tagalog, and can prove it."
2. index.html: "Today, that call becomes a voicemail — one of dozens staff triage the next morning, with no location, no classification, and no confirmation for the resident."
   Rewrite: "Today that call becomes voicemail number 14 in tomorrow morning's triage pile. No location, no category, and the resident never hears back."
3. index.html: "With Envoz 311, the same call becomes a correctly classified, geo-tagged, confidence-scored case in your existing CRM — before the resident gets home."
   Rewrite: "With Envoz 311, the same call is a classified, geo-tagged case in your existing CRM before the resident gets home."
4. platform.html lede: "It listens, classifies, locates, routes, and writes — and it shows its work on every decision."
   Rewrite: "It listens, classifies, locates, routes, and writes into your CRM. Then it shows its work."
5. customer-success.html hero: "Envoz 311 turns daily 311 operations into council-ready reporting — access, quality, speed, equity, efficiency, and learning — so your accomplishments are visible, measurable, and defensible."
   Rewrite: "Envoz 311 turns daily 311 operations into the report your council asks for: who got served, how fast, in which neighborhoods, and at what cost."
6. trust.html answer block: "...and all governed automation — from a single case correction to a new city rule — is sandbox-tested, approval-gated, and audited."
   Rewrite: "...and every automated change, whether a one-case correction or a new city rule, is tested in a sandbox and waits for staff approval."

Mechanical fix that preserves voice: on each page, keep at most 2-3 dashes in hero copy, convert the rest to periods, colons, or "so/which/because".

### 2. Negation-contrast framing: "X, not Y" / "not another" / "not just" (~40 occurrences, all 12 pages)

Worst (pure tic, no new information):
- platform.html: "Envoz is not another CRM and not another chatbot." (doubled in one sentence; index.html also has the eyebrow "Why Envoz is not another chatbot")
- staff-triage.html: "AI feels like a transparent coworker, not a black box. You arrived to 8 structured cases — not 23 voicemails." (two contrasts back to back)
- customer-success.html: "proof, not promises" / "evidence, not anecdotes" / "not tribal knowledge" / "live data, not memory" - four on one page, plus resources.html reuses "proof, not promises" verbatim.
- pilot-pricing.html: "deep, not thin."

Effective, keep as-is (asymmetric, carries a fact):
- integrations.html: "so the thirtieth city onboards in days, not the months the third one took."
- pilot-pricing.html: "not a guarantee of savings."

Rewrite for the worst: "Envoz is not another CRM and not another chatbot. It is the routing layer in between" -> "Cities already have CRMs and chatbots. Envoz is the routing layer between them: the part that decides what a request is, where it goes, and how to prove it."
Budget: one negation-contrast per page reads as conviction; three or more reads as a template.

### 3. "Every X..." anaphora plus never/always reassurance cadence (57 never/always across 11 pages)

- trust.html Ten Commitments: 9 of 10 entries start "Every ..." or "Never ..." ("Every action passes...", "Every case has...", "Every tenant is...", "Every grounded answer...", "Every escalation...", "Every status answer...", "Every configuration action...", "Every recommendation...", "Every production change..."). A numbered list where every item shares one opening word is a strong machine tell.
- "safety first, always" appears on index.html ("safety first, always.") and platform.html ("safety gate first, always"); voice-ai.html has "Safety first, always"; trust.html adds "in that order, always."
- "never fabricate/fabricated/invents" appears on 8 pages; platform.html alone: "never fabricated", "Never fabricated:", "it never invents one", "never a fabricated case number" is on integrations too.
- platform.html: "No fabricated case number, no invented confirmation — ever." The trailing "— ever" is a model-reassurance flourish.

Fix: keep the fabrication guarantee in exactly two places (trust.html commitment #1 and the integrations reliability section); elsewhere say it once, factually ("the case number comes from SeeClickFix"). Vary the commitments list so items open with the noun ("Case numbers come from your CRM's API." / "Tenants are isolated." ...).

### 4. Rule-of-three saturation (roughly 8-14 triads per page; worst: index, customer-success, trust, platform)

Nearly every heading or payoff clause resolves into a triad:
- pilot-pricing.html h2: "A pilot with edges: scoped, staffed, and measured" (also a colon headline)
- customer-success.html: "visible, measurable, and defensible"
- staff-triage.html answer block: "classified, geo-tagged, and explained"
- trust.html: "sandbox-tested, approval-gated, and audited"; resident-services.html: "measured, audited, and improvable"
- index.html: "Chatbots talk. Envoz routes, writes, and proves."; resident-services.html: "rename, retarget, and retire"
On index.html and customer-success.html nearly every card payoff is a triad, so the pattern is impossible to miss when scrolling. Rewrite for the worst: "scoped, staffed, and measured" -> "A pilot with edges: two departments, ten service types, and a number to hit by week 12." Break a third of the triads into pairs or single concrete claims.

### 5. Repeated staccato slogan fragments

"One call. Correctly classified. Correctly routed. With confidence." appears verbatim in the index meta description and platform.html hero. Same mold: "Overlay first. Standalone when you need it." (index), "Arm the incumbent. Keep the system of record." (integrations), "Keep your system of record. Close the voice loop." (integrations), "Emergency? 911, immediately." (trust), "Ten real resident calls. One governed pipeline." (voice-ai), "Five doors into the same demo world" is fine, but three-plus fragment-slogans per page is the pattern buyers now associate with LLM output. Keep one per page as the signature; let the rest be normal sentences.

### 6. Eyebrow/kicker saturation, sometimes longer than the heading it introduces

Every section on all 12 pages opens with an uppercase eyebrow. Several are full sentences that pre-state the heading:
- index.html: eyebrow "Built to improve every week, not just launch once" above h2 "The 311 program that improves itself — safely." (the kicker is longer than the headline and both say the same thing)
- index.html: eyebrow "Cities do not need another CRM" above "Overlay first. Standalone when you need it."
- voice-ai.html: eyebrow "Trust is what happens on a bad day" above "Bad-day behaviors, by design" (restates it)
- platform.html: eyebrow "Three layers, one accountable pipeline" above "Where Envoz sits — and what it owns"
Fix: drop eyebrows on 30-40% of sections (especially where they restate the h2), and keep them to 2-3 words where retained.

### 7. Uniform grammatical shape across sibling cards and bullets

Sequences where every item is "Bold verb phrase — payoff clause":
- integrations.html "Overlay principles": all 7 cards are "Heading / single sentence ending in a dash-payoff" ("...— never a parallel record living somewhere else." / "...— so there is no second console to check and no retraining program to fund." / "...— and a resident can never be confirmed twice...").
- index.html stakeholder cards: each is icon + role + italic quote + one triad sentence + arrow link, in identical order.
- customer-success.html Nico section: "Watches ... every day. / Recommends ... fixes. / Proves ... every change." (bolded verb anaphora)
- pilot-pricing.html pilot-structure: 7 cards all "Bold noun — small dash-payoff."
Fix: vary length and shape within each card row - let one card be two short sentences, one be a fragment, one carry a number. Identical scaffolding is what the eye catches before any word does.

### 8. The "answer block" paragraphs read as written for machines, not people

Every page has a boxed single-paragraph "answer-block" near the hero, each with the same skeleton: "Envoz 311 is an AI voice 311 platform that [5-clause list] — with [triad]." Example (index.html): "Envoz 311 is an AI voice 311 platform that answers after-hours calls, understands resident intent in 70+ languages, and writes structured cases into systems like SeeClickFix — with confidence, rationale, and proof attached to every routing decision." These are clearly LLM/SEO snippet bait ("AI voice 311 platform", "311 CRM overlay", "city manager 311 dashboard" keyword insertions). They may be a deliberate SEO/AEO choice; if so, visually demote them or move below the fold, because they are the single most machine-flavored block on each page and they sit in the hero.

### 9. Signature phrases stamped across pages

- "no rip-and-replace": ~12 rendered occurrences across 9 pages (chip, body, and answer blocks)
- "council-ready": 16 occurrences across 5 pages (customer-success and resources have 5 each)
- "before the second ring": 5 pages; "residents never repeat themselves / repeats their story": 6 pages; "confidence and rationale": ~15 occurrences
Any one of these is a good coined phrase; all of them on nearly every page reads like a prompt's brand-vocabulary list being dutifully inserted. Pick 2-3 pages where each phrase lives, and paraphrase elsewhere ("you keep SeeClickFix", "picked up on the first ring", "staff can see why it routed there").

### 10. Minor: colon headlines and "9:42 PM" motif

Colon headlines are rare (good): "Vista Robles 311 Modernization: 90-Day Demo Story", "A pilot with edges: scoped, staffed, and measured", plus bolded lead-ins like "Overlay / arm-the-incumbent:" and "The pattern to notice:". No "Here's how/why" transitions found. The 9:42 PM pothole motif recurs on 6 pages; as a deliberate through-line it works and mostly reads human - keep it, but drop one or two of the "The 9:42 PM problem"-style kicker restatements so it feels like a story, not a macro.

Positive: the generic AI-marketing lexicon (seamless, effortless, empower, unlock, transform, elevate, robust, delight, supercharge, peace of mind) has zero hits in rendered copy. The only "Elevating Engagement" is in JSON-LD metadata, not visible.

## Copy that already reads human

Keep these as the voice benchmark - specific, asymmetric, willing to admit limits:

1. pilot-pricing.html ROI assumptions: "We assume half of after-hours calls would otherwise become next-morning voicemail triage work at your staff hourly cost; the other half we conservatively assume would be re-dialed during business hours and are already counted in cost avoided." (and: "No value is assigned to resident satisfaction, equity coverage, or council reporting — real benefits we deliberately leave out of the math.")
2. integrations.html: "Every deployment hardens the shared connector library — field mappings, retry behavior, vendor quirks — so the thirtieth city onboards in days, not the months the third one took."
3. staff-triage.html: "There's a basketball-sized beehive in the bus shelter." with "All three candidates fall below the 70% routing threshold, so Nico refused to guess — and told the resident a person would review it today."
4. configuration-studio.html three clocks: "12 minutes - Configured by Nico... 48 hours - Tenant provisioned... ~4 weeks - Production MVP — pending data cleanup. Dirty data gates production, never the sandbox."
5. pilot-pricing.html procurement note: "Envoz is a demonstration prototype — we keep compliance claims modest and will not assert certifications we do not hold." (Ironically this sentence contains the "we keep claims modest" reassurance shape, but here it carries a real, checkable commitment, which is exactly why it lands as human.)
