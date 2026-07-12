# Envoz 311 Landing Site - Conversion & Selling Structure Review

Reviewer lens: B2G SaaS, procurement-driven city/county buyers (city managers, 311 directors, IT directors, council members). All 12 pages read in full. Quotes are verbatim from the HTML.

## Top findings

### 1. HIGH - The site sells priced pilots, then admits it is a prototype in a footnote (pilot-pricing.html)
Quote: "Security review packet available. Architecture overview, data-flow diagrams, and control descriptions on request. Envoz is a demonstration prototype - we keep compliance claims modest and will not assert certifications we do not hold."
This sentence sits inside "Procurement notes" on the same page that quotes "$2,500-$4,500 per month" and asks buyers to "Start a pilot conversation." A risk-averse procurement reader who finds "demonstration prototype" after reading dollar figures will conclude the prices are fiction too, and stop. The honesty is right; the placement and framing are wrong.
Fix: Decide what the site is. If it sells real pilots, replace the buried admission with an upfront, positively framed program: "Founding city program - we are onboarding our first pilot cities. You get direct access to the engineering team, pilot pricing locked for year one, and we will never assert certifications we do not hold (SOC 2 in progress: ask for the roadmap)." If it is a concept demo, remove the hard dollar ranges and the mailto sales CTAs.

### 2. HIGH - No low-friction primary conversion action; the only way to buy is a mailto link
The four tier cards all resolve to `mailto:pilots@envoz311.example.com`. There is no form, no scheduling link, no RFI download, no "talk to a human" path that does not require the buyer to compose an email from scratch. Meanwhile the primary CTA drifts page to page: "Watch the 90-second pothole report" (index), "See the architecture" (platform), "Estimate your ROI" (pricing), "Generate a council proof report" (customer-success), "Read the ten commitments" (trust). Demo-exploration CTAs dominate; the commercial CTA ("Explore a 90-day pilot") appears only as a secondary button on some pages.
Fix: Pick one primary commercial action sitewide - e.g. "Book a 20-minute pilot scoping call" backed by a short form (name, city, population, CRM) or a calendar link - and put it in the header and every closing band. Keep "Watch the demo" as the consistent secondary. CTAs should say what happens next: "We reply within 2 business days with a scoped pilot outline" already exists as body text on pricing; promote it to the button's supporting line everywhere.

### 3. HIGH - Two must-have B2G objections are missing entirely: procurement vehicle and accessibility mandates
Search of all 12 pages: no mention of cooperative purchasing (Sourcewell, OMNIA, NASPO ValuePoint), state contract vehicles, sole-source justification support, or RFP response support - the first question a purchasing officer asks. Accessibility: "TTY / RTT" appears once, as an unexplained connector button in Configuration Studio; ADA, Section 508, and WCAG are never mentioned on a product whose core channel is voice, sold to buyers with legal accessibility mandates.
Fix: (a) Add a "How cities buy Envoz" block to pilot-pricing.html: pilot sized to fit under typical small-purchase thresholds, RFI/RFP support, vehicle status. Even "Pilots are scoped to fit most cities' small-purchase authority - ask us about your threshold" is a real answer. (b) Add an accessibility commitment card to trust.html and voice-ai.html: TTY/RTT intake, relay service compatibility, WCAG target for resident-facing web surfaces, and how voice AI helps residents who cannot use web forms.

### 4. MED - Union / staff-displacement fear is triggered by the metrics but only defended in passing
Quotes doing the triggering: "$0.42 cost per interaction ... vs $3.80 manual" (customer-success), "312 staff hours saved this quarter", "76% contained without staff involvement" (pilot-pricing). The reassurance exists but is scattered one-liners: "Staff stay accountable for every decision - Envoz protects them from chaos, it never replaces them" (customer-success) and "Humans stay accountable" (pricing procurement notes). A council member or union rep screenshots the $0.42-vs-$3.80 tile without the caveat.
Fix: Add one dedicated "What this means for your 311 staff" section (staff-triage.html or customer-success.html): no pilot is designed around headcount reduction; hours move from voicemail triage to field and case work (the "312 hours returned to field & case work" framing already exists - lead with it); staff are the approvers of every change. Attach the reassurance line directly to the cost tiles, not three sections away.

### 5. MED - The audit-grade product has three names for its own audit log and breaks its "six outcomes" promise
Platform.html: "CEL - Continuous-improvement Event Log". Dashboards.html and staff-triage.html: "Civic Evidence Ledger (CEL)". Resources.html FAQ: "Civic Evidence Log". Three expansions of the same acronym on a product whose pitch is precision and auditability. Worse, platform.html promises "Every interaction ends in one of six outcomes", but resident-services.html logs emergencies as "a SAFETY_ESCALATION outcome" (the six list calls it EMERGENCY_REDIRECTED) and referrals as "a REFERRED outcome" (not in the six at all).
Fix: Pick one expansion ("Civic Evidence Ledger" is the strongest) and one canonical outcome list, then grep every page. If referrals are an outcome, it is "one of seven outcomes" - do not let the flagship precision claim be falsifiable from your own pages.

### 6. MED - Pricing page has no post-pilot story, so procurement cannot budget year 2
The page prices only the 90-day pilot. Nothing states what an annual subscription costs, even as a range or a formula ("annual pricing continues at your pilot tier rate" would do), and nothing states what happens at day 91: convert, extend, or walk away with your data. The exit ramp exists in fragments ("Fixed term with defined success criteria - no open-ended contracts"; "Export at any time; deletion honored at contract end") but never as a plain paragraph a buyer can paste into a staff report.
Fix: Add an "After the pilot" block with three explicit paths: (1) convert to an annual agreement at a stated pricing approach, (2) do not convert - full data export (cases, transcripts, configuration) within N days at no cost, (3) extend the pilot. Risk reversal is the cheapest trust you can buy here.

### 7. MED - The home hero leads with "fictional data" before it says what the product is
Quote (first visible element above the H1): "City of Vista Robles · live demo world · fictional data". The very first words a buyer reads on the site are a disclaimer. The disclaimer discipline is excellent sitewide, but position matters: value prop first, fiction label second.
Fix: Keep the chip but move it below the CTA row (near "Nico · AI assistant · demo mode"), or reword to lead with the benefit: "Explore a live demo world - City of Vista Robles, fictional data". Same issue on voice-ai.html's hero chip.

### 8. MED - Investor-deck language on buyer-facing pages: "Arm the incumbent" and "Onboarding is the moat"
Quotes: "Arm the incumbent. Keep the system of record." (integrations.html H1); "Onboarding is the moat." (configuration-studio.html H2). "Moat" is a word for your board, not for a city IT director; "the incumbent" is how a vendor sees SeeClickFix, not how the city sees the tool its staff use daily. Both lines also mildly undercut the otherwise respectful partner posture ("System-of-record partner" chips).
Fix: Integrations H1: "Keep the system your staff trust. Add the voice channel it is missing." Configuration Studio H2: "Onboarding in days, not a six-month statement of work." (the supporting copy under the moat headline already says exactly this - promote it).

### 9. MED - Fictional testimonial quotes are formatted like real case-study testimonials (customer-success.html)
Quotes like "'The morning voicemail pile is gone...' - Marcus Hale · Public Works Director, Vista Robles (fictional)" are correctly and repeatedly labeled, and the section eyebrow says "Fictional case study" - genuinely good practice. The residual risk is format: quote + name + title is the visual grammar of a reference, and a skimmed or screenshotted version loses the "(fictional)" tag. In govtech, being caught with what looks like an invented reference is fatal.
Fix: Reframe from testimonial format to scenario format: "Week 4 - what your Public Works director sees:" followed by the same content as narration, no invented person names. Keep the timeline; drop the fake attributions. Alternatively watermark the quote cards themselves ("Demo narrative") rather than relying on the footer tag.

### 10. LOW - dashboards.html and staff-triage.html are near dead-ends
Dashboards ends at the Council Proof tab with no closing CTA band at all - the strongest "wow" surface on the site (generate a council report) leads nowhere commercial. Staff-triage ends on the CCIL animation with a link back to dashboards. Both are marked `data-marketing="false"`, but buyers will land on them from the five home-page "doors".
Fix: Add the standard closing band ("Explore a 90-day pilot" primary + "Configure a demo city" secondary) to both. After a buyer generates a council report is exactly the moment to offer the pilot.

### 11. LOW - Four brand names compete in the first screen; "Clarity Engine" appears exactly once
Home hero contains Envoz 311, "City of Vista Robles", Nico, and "Powered By MetaEngage.ai Clarity Engine". "Clarity Engine" never appears again on any page (elsewhere it is just "Powered By MetaEngage.ai"). A first-time visitor cannot tell in 5 seconds which name is the product, which is the AI, and which is the platform.
Fix: Drop "Clarity Engine" or adopt it sitewide. Consider moving the powered-by pill out of the hero entirely - trust.html and the FAQ already explain the two-layer story well, where it belongs.

### 12. LOW - The ROI calculator feeds a fictional demo number into real dollar math
Quote (assumptions): "The $0.42 figure is illustrative demo data from the Vista Robles demo world." The disclosure exists, but only inside the collapsed assumptions accordion, while the headline KPIs ("Estimated cost avoided / yr", "Estimated payback period") render as authoritative outputs. The rest of the calculator is a model of credibility (published formulas, deliberately excluded soft benefits, "not a guarantee of savings" strip).
Fix: Make the Envoz per-interaction cost an editable input defaulted to $0.42 with an inline "demo estimate" tag, so the buyer owns the assumption instead of inheriting a fictional one.

## Per-page 5-second verdicts

- index.html: PASS - what (AI 311 voice), who (cities), why (every resident heard, after hours, with proof) all in the H1; only flaw is the fiction chip firing first.
- platform.html: BORDERLINE - "civic intent-to-action routing brain" is category-creation jargon; the lede rescues it but costs seconds.
- voice-ai.html: PASS - "The AI voice agent for 311 that turns every call into a routed outcome" is the crispest hero on the site.
- resident-services.html: PASS - "One front door for every resident request - configured for your city" says what and for whom.
- configuration-studio.html: BORDERLINE - "Configure a city by talking to Nico" assumes you already know who Nico is; the value (minutes, not months) is below the fold.
- dashboards.html: PASS as product surface - "The numbers a council actually asks about" is the right hook for a city manager.
- staff-triage.html: BORDERLINE - reads as raw app UI ("Staff Triage · Vista Robles 311"); the actual value line ("8 structured cases - not 23 voicemails") is buried in a small band-line.
- integrations.html: FAIL for the cold visitor - "Arm the incumbent" is insider language; the lede sentence beneath it is what the H1 should say.
- trust.html: BORDERLINE - "Governed autonomy for public service" is abstract; the lede ("every change waits for a human signature") carries the meaning.
- customer-success.html: PASS - "Turn 311 modernization into proof your council can see" nails the buyer's actual job-to-be-done.
- pilot-pricing.html: PASS - "Start with a 90-day pilot. Prove it to council with numbers" is exactly right for this buyer.
- resources.html: PASS - "Straight answers to the questions cities actually ask" plus visible question count sets expectations well.

## What already works

- Fictional-data hygiene is the best I have seen on a demo site: "Vista Robles is a fictional demonstration city" disclaimers appear on every metrics surface, and even the fake staff quotes carry "(fictional)" tags - keep this discipline, it is a genuine trust asset.
- The "bad-day behaviors" sections (platform, voice-ai, trust, integrations) sell failure modes on purpose - "Cities should judge 311 systems by their failure behavior - so here is ours, in the open" is exactly the posture a risk-averse government buyer wants, and almost no vendor does it.
- The competitive section on integrations.html is respectful and specific: real strengths granted to SeeClickFix, Tyler, and Granicus, differentiation stated as "where Envoz adds", closed with "every platform above serves cities well." This survives being read by the incumbent's rep in the room.
- The ROI calculator publishes every formula, states an assumption for after-hours value that deliberately discounts by 50%, and lists the benefits it refuses to monetize ("resident satisfaction, equity coverage, council reporting - real benefits we deliberately leave out of the math"). That last line is a credibility masterstroke.
- The six structured outcomes with JSON samples (platform.html) make "not another chatbot" concrete instead of asserted - the ESCALATED_TO_HUMAN and NO_STRUCTURED_OUTPUT cards, which show the product admitting uncertainty, are the strongest proof elements on the site.
- Pilot framing is procurement-literate: "A pilot with edges: scoped, staffed, and measured", success metrics agreed in week one and reused in the final council report, fixed 90-day term, "no open-ended contracts."
