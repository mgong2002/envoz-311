# Landing Site Review Addendum - AI-generated look and voice - 2026-07-10

Why this pass: a growing share of readers (including city evaluators) now recognize the visual and writing patterns of AI-generated pages and discount what they read accordingly. The site should read as designed and written by people. This addendum audits exactly that, on top of the main review of the same date.

Companion: `2026-07-10-landing-ai-copy-tells.md` - the full writing-voice audit (10 patterns with counts, verbatim quotes, and rewrites).

## Verdict

The bones are not the problem: the navy/teal palette is a deliberate civic choice (none of the stock AI looks), layouts are left-aligned, the marketing vocabulary is clean (zero hits for seamless/empower/unlock/robust in rendered copy), and the content is unusually specific. What pattern-matches to "generated" is a set of surface tells - a handful of CSS decisions and, above all, sentence rhythm. All of it is fixable in one styling pass plus one copy pass, without redesigning anything.

## Design tells

- **D1. Font is Inter** - the single most default AI-era typeface. The stack already contains the fix: Public Sans (second in the stack) is the U.S. government's own open typeface - promoting it first position is a one-line change that also tells a civic story. Consider a distinct display face for h1/h2 to complete the shift.
- **D2. Emoji used as UI icons, ~300 instances** - chips, pills, proof markers, and step icons use emoji (worst: the voice-scenario engine with 87, platform with 41). Emoji as interface iconography is a strong AI tell, renders differently on every OS (several look poor on Windows), and clashes with the otherwise serious civic tone. Replace with one small inline SVG icon set (a dozen icons cover the whole site); keep emoji only inside simulated chat/call transcripts where they are content.
- **D3. Colored left rail on rounded cards** (4 instances - the red 5px safety-gate card, teal catalog/note cards, a purple variant). This exact card treatment is a recognized generated-page cliche. The site already has better native patterns for emphasis: the tinted full-panel with border (answer blocks) and the chip-strip. Restyle the rail cards to one of those.
- **D4. Eyebrow kicker on 52 of 72 sections**, several longer than the headline they introduce and restating it. Drop the eyebrow on roughly a third of sections (start with every one that repeats its h2) and cap the rest at 2-3 words.
- **D5. Seventeen three-column card grids** across 12 pages. Vary the rhythm on the worst pages (index, platform, customer-success): let one row be 2 asymmetric cards, one be a single wide panel with a number, one be a plain list.
- **D6. Nineteen distinct border-radius values** while the system defines three tokens. Not an AI tell (it is the opposite - drift), but normalizing to the tokens will make the surface read as designed.

## Writing tells (summary - full detail in the companion)

- **C1. Em dash as the universal connective: 299 in rendered copy** (worst: resources 43, pilot-pricing 41, platform 35). Budget: 2-3 per page in hero copy; convert the rest to periods, colons, or so/which/because. Six worst sentences have ready rewrites in the companion.
- **C2. "X, not Y" negation-contrast ~40 times** ("not another CRM and not another chatbot" doubled in one sentence; "proof, not promises" reused verbatim on two pages). Budget: one per page reads as conviction; three reads as a template.
- **C3. "Every .../ never / always" reassurance cadence, 57 occurrences** - including the Ten Commitments list where 9 of 10 items open identically. Vary the openers; state the fabrication guarantee in two places, factually, instead of on eight pages.
- **C4. Rule-of-three saturation, ~8-14 triads per page** ("scoped, staffed, and measured"; "visible, measurable, and defensible"). Break a third of them into pairs or a single concrete claim with a number.
- **C5. Staccato slogan fragments** ("One call. Correctly classified. Correctly routed.") - keep one per page as a signature, not three.
- **C6. Identical card scaffolding** - rows where all 7 cards are "Bold verb phrase - dash payoff". Vary length and shape within each row.
- **C7. Hero "answer blocks" are SEO snippet bait** ("Envoz 311 is an AI voice 311 platform that...") - if intentional for answer engines, keep the content but demote it visually or move below the fold; it is the most machine-flavored block on every page.
- **C8. Brand phrases stamped everywhere** ("no rip-and-replace" x12, "council-ready" x16, "confidence and rationale" x15) - assign each phrase 2-3 home pages and paraphrase elsewhere.

The companion also lists five passages that already read fully human (the ROI assumptions, the connector-library sentence, the beehive case, the three clocks, the prototype disclosure) - use those as the voice benchmark for the rewrite pass.

## Suggested fix order

1. One CSS pass: font stack order, rail-card restyle, radius tokens (D1, D3, D6) - small, mechanical.
2. One markup pass: emoji to SVG icons, eyebrow thinning, grid variation (D2, D4, D5).
3. One copy pass with the budgets above, using the six ready rewrites and the five benchmark passages as the target voice (C1-C8).
