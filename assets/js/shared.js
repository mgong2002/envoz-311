/* ============================================================
   Envoz 311 — shared layout, Nico dock, global interactions
   ============================================================ */
(function () {
  "use strict";

  const PAGES = [
    ["index.html", "Home"],
    ["platform.html", "Platform"],
    ["voice-ai.html", "Voice AI"],
    ["resident-services.html", "Services"],
    ["configuration-studio.html", "Configuration"],
    ["dashboards.html", "Dashboards"],
    ["staff-triage.html", "Staff Triage"],
    ["integrations.html", "Integrations"],
    ["trust.html", "Trust"],
    ["customer-success.html", "Council Proof"],
    ["pilot-pricing.html", "Pilot & Pricing"],
    ["resources.html", "Resources"]
  ];

  const ME_MARK =
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 8 L90 8 L90 24 L36 24 L64 50 L36 76 L90 76 L90 92 L10 92 L10 82 L42 50 L10 18 Z"/></svg>';

  const ENVOZ_MARK =
    '<svg viewBox="0 0 64 64" width="34" height="34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x="2" y="2" width="60" height="60" rx="15" fill="url(#envoz-g)"/><defs><linearGradient id="envoz-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#122a47"/><stop offset="1" stop-color="#0f8b8d"/></linearGradient></defs><rect x="13" y="26" width="5" height="12" rx="2.5" fill="#9be8e6"/><rect x="22" y="19" width="5" height="26" rx="2.5" fill="#d7efee"/><rect x="31" y="23" width="5" height="18" rx="2.5" fill="#9be8e6"/><path d="M47 16 c-5.5 0 -9.5 4.2 -9.5 9.4 0 6.6 9.5 16.6 9.5 16.6 s9.5 -10 9.5 -16.6 C56.5 20.2 52.5 16 47 16 Z" fill="#ffffff"/><circle cx="47" cy="25.5" r="3.6" fill="#0f8b8d"/></svg>';

  function poweredPill(large) {
    return (
      '<span class="powered-pill' + (large ? " powered-pill-lg" : "") + '" title="Powered By MetaEngage.ai">' +
      ME_MARK + "<span>Powered By MetaEngage.ai</span></span>"
    );
  }

  /* ---------------- Header ---------------- */
  function currentPage() {
    const p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }

  function renderHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;
    const cur = currentPage();
    const navLinks = PAGES.map(function (p) {
      const aria = p[0] === cur ? ' aria-current="page"' : "";
      return '<a href="' + p[0] + '"' + aria + ">" + p[1] + "</a>";
    }).join("");

    host.innerHTML =
      '<header class="site-header">' +
      '<div class="header-inner">' +
      '<a class="brand-lockup" href="index.html" aria-label="Envoz 311 home">' +
      '<span class="brand-row">' + ENVOZ_MARK +
      '<span class="brand-word">Envoz&nbsp;<span class="brand-311">311</span></span></span>' +
      poweredPill(false) +
      "</a>" +
      '<nav class="main-nav" aria-label="Primary">' + navLinks + "</nav>" +
      '<div class="header-ctas">' +
      '<a class="btn btn-ghost btn-sm" href="voice-ai.html?demo=pothole">Watch demo</a>' +
      '<button class="btn btn-primary btn-sm" type="button" data-pilot-open>Book a pilot call</button>' +
      '<button class="btn btn-navy btn-sm" type="button" data-nico-open>' + icon("mic") + ' Talk to Nico</button>' +
      "</div>" +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-drawer" aria-label="Open menu">☰</button>' +
      "</div>" +
      '<div class="mobile-drawer" id="mobile-drawer">' + navLinks +
      '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">' +
      '<button class="btn btn-primary btn-sm" type="button" data-pilot-open>Book a pilot call</button>' +
      '<a class="btn btn-secondary btn-sm" href="voice-ai.html?demo=pothole">Watch demo</a>' +
      '<button class="btn btn-navy btn-sm" type="button" data-nico-open>' + icon("mic") + ' Talk to Nico</button></div>' +
      poweredPill(false) +
      "</div>" +
      (document.body.dataset.marketing === "true"
        ? '<div class="success-bar" role="note">24/7 voice intake<span class="sep">·</span>70+ language-ready<span class="sep">·</span>CRM overlay<span class="sep">·</span>Confidence-scored routing<span class="sep">·</span>Council-ready proof</div>'
        : "") +
      "</header>";

    const toggle = host.querySelector(".nav-toggle");
    const drawer = host.querySelector(".mobile-drawer");
    toggle.addEventListener("click", function () {
      const open = drawer.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------------- Footer ---------------- */
  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    host.innerHTML =
      '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
      "<div>" +
      '<span class="brand-row" style="display:flex;align-items:center;gap:9px">' + ENVOZ_MARK +
      '<span class="brand-word" style="color:#fff">Envoz&nbsp;<span class="brand-311">311</span></span></span>' +
      '<p style="margin-top:14px;max-width:34ch">The civic intent-to-action routing brain with voice-first intake. One call. Correctly classified. Correctly routed. With confidence.</p>' +
      "</div>" +
      "<div><h4>Product</h4>" +
      '<a href="platform.html">Platform</a><a href="voice-ai.html">Voice AI for 311</a>' +
      '<a href="resident-services.html">Resident Services</a><a href="configuration-studio.html">Configuration Studio</a>' +
      '<a href="dashboards.html">Dashboards &amp; AI Insights</a><a href="staff-triage.html">Staff Triage</a></div>' +
      "<div><h4>Trust</h4>" +
      '<a href="trust.html">Trust, Data &amp; Compliance</a><a href="integrations.html">Integrations</a>' +
      '<a href="trust.html#governed-autonomy">Governed autonomy</a><a href="trust.html#data-model">Data model</a></div>' +
      "<div><h4>Company</h4>" +
      '<a href="customer-success.html">Customer Success</a><a href="pilot-pricing.html">Pilot &amp; Pricing</a>' +
      '<a href="resources.html">Resources / FAQ</a></div>' +
      "</div>" +
      '<div class="footer-bottom">' +
      '<div class="footer-parent-lockup">' +
      '<span class="lockup-pill"><img src="assets/img/metaengage-logo.svg" alt="Powered By MetaEngage.ai" style="height:17px;width:auto"><span>Powered By MetaEngage.ai</span></span>' +
      '<span class="parent-tagline">Elevating Engagement</span>' +
      "</div>" +
      '<div class="disclaimer">City of Vista Robles and Harbor Mesa are fictional demonstration cities. All metrics shown are illustrative demo data. © 2026 Envoz 311.</div>' +
      "</div>" +
      "</div></footer>";
  }

  /* ---------------- Nico dock ---------------- */
  const COMMANDS = [
    { label: "Show me the city manager dashboard", match: /(city manager )?dashboard/i,
      reply: "Opening the City Manager Success Dashboard for Vista Robles…",
      go: "dashboards.html?tab=performance" },
    { label: "Configure Harbor Mesa", match: /configure harbor|harbor mesa/i,
      reply: "Loading the Harbor Mesa onboarding flow in Configuration Studio…",
      go: "configuration-studio.html?flow=harbor-mesa" },
    { label: "Run a pothole report demo", match: /pothole/i,
      reply: "Starting the 90-second pothole demo — watch the call become case VR-4281…",
      go: "voice-ai.html?demo=pothole" },
    { label: "Show after-hours surge", match: /surge|after.?hours/i,
      reply: "Switching the dashboard to storm-surge mode…",
      go: "dashboards.html?tab=performance&mode=surge" },
    { label: "Compare Envoz to SeeClickFix", match: /compare|seeclickfix/i,
      reply: "Here’s a respectful comparison — SeeClickFix is an excellent case CRM; Envoz adds the voice-to-outcome layer on top.",
      action: "compare" },
    { label: "Open staff triage", match: /triage/i,
      reply: "Opening the staff triage console…", go: "staff-triage.html" },
    { label: "What service gaps should we fix?", match: /service gaps?|gaps.*fix|fix.*gaps/i,
      reply: "These are the AI-discovered service gaps, ranked by expected impact…",
      go: "dashboards.html?tab=gaps" },
    { label: "Generate a council proof report", match: /council/i,
      reply: "Generating the council-ready proof report for Vista Robles…",
      go: "dashboards.html?tab=council&generate=1" },
    { label: "Show the Continuous Evaluation Loop", match: /loop|improvement loop|civic improvement|evaluation loop/i,
      reply: "Here’s how we picture the Continuous Evaluation Loop (CEL) in action. Every step is evidence-logged and approval-gated.",
      action: "loop" },
    { label: "What has Nico learned this week?", match: /learned|learning ledger|cel ledger|ledger/i,
      reply: "Opening this week’s CEL Ledger…",
      go: "dashboards.html?tab=cel" },
    { label: "Show my 311 improvement plan", match: /improvement plan|success agent|recommendations/i,
      reply: "Opening Nico’s CEL-driven improvement recommendations…",
      go: "dashboards.html?tab=agent" },
    { label: "Create a city-only rule from staff corrections", match: /city.?only rule|staff correction/i,
      reply: "19 water-pooling cases were corrected from Streets to Utilities — here’s the proposed storm-drain proximity rule.",
      go: "dashboards.html?tab=agent&rec=rec-storm-drain" },
    { label: "Run this recommendation in sandbox", match: /sandbox/i,
      reply: "Running the recommendation against 47 historical cases in sandbox…",
      go: "dashboards.html?tab=agent&rec=rec-storm-drain&sandbox=1" },
    { label: "Explain why this recommendation is safe", match: /safe|why.*recommendation/i,
      reply: "Opening evidence, approval scope, and the audit trail for this recommendation…",
      go: "dashboards.html?tab=agent&rec=rec-storm-drain&evidence=1" },
    { label: "What changes still need approval?", match: /need approval|approval/i,
      reply: "Three changes are ready for approval. Nothing deploys to production without city sign-off.",
      go: "dashboards.html?tab=agent&filter=ready" }
  ];

  const CHIP_SET = [
    "Show me the city manager dashboard", "Run a pothole report demo", "Configure Harbor Mesa",
    "Show after-hours surge", "Compare Envoz to SeeClickFix", "Open staff triage",
    "What service gaps should we fix?", "Generate a council proof report",
    "Show the Continuous Evaluation Loop", "What has Nico learned this week?",
    "Show my 311 improvement plan", "Run this recommendation in sandbox",
    "Explain why this recommendation is safe", "What changes still need approval?"
  ];

  let panel, transcript, waveform;

  function renderDock() {
    const fab = document.createElement("button");
    fab.className = "nico-fab";
    fab.type = "button";
    fab.setAttribute("aria-label", "Talk to Nico, the Envoz AI assistant (demo mode)");
    fab.innerHTML = '<span class="orb" aria-hidden="true"></span><span class="fab-label">Talk to Nico</span>';
    document.body.appendChild(fab);

    panel = document.createElement("div");
    panel.className = "nico-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Nico AI assistant");
    panel.innerHTML =
      '<div class="nico-head"><span class="orb" aria-hidden="true"></span>' +
      '<div><div class="nico-title">Nico · Envoz 311 assistant</div>' +
      '<div class="nico-disclosure">You are speaking with an AI assistant · demo mode</div></div>' +
      '<div class="nico-waveform" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>' +
      "</div>" +
      '<div class="nico-transcript" aria-live="polite"></div>' +
      '<div class="nico-chips" role="list"></div>' +
      '<div class="nico-input-row">' +
      '<button class="nico-mic" type="button" aria-label="Simulate voice input">🎙</button>' +
      '<input type="text" placeholder="Type a command… (voice simulated)" aria-label="Type a command to Nico">' +
      '<button class="btn btn-primary btn-sm" type="button">Send</button></div>';
    document.body.appendChild(panel);

    transcript = panel.querySelector(".nico-transcript");
    waveform = panel.querySelector(".nico-waveform");
    const chips = panel.querySelector(".nico-chips");
    const input = panel.querySelector("input");
    const send = panel.querySelector(".nico-input-row .btn");
    const mic = panel.querySelector(".nico-mic");

    CHIP_SET.forEach(function (label) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", function () { handleCommand(label); });
      chips.appendChild(b);
    });

    function submit() {
      const v = input.value.trim();
      if (!v) return;
      input.value = "";
      handleCommand(v);
    }
    send.addEventListener("click", submit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });

    mic.addEventListener("click", function () {
      mic.classList.add("listening");
      waveform.classList.add("speaking");
      addBubble("user", "🎙 (simulated voice input)");
      setTimeout(function () {
        mic.classList.remove("listening");
        nicoSay("Voice is simulated in this demo — tap a command chip or type below, and I’ll do the rest.");
      }, 1400);
    });

    fab.addEventListener("click", toggle);
    document.addEventListener("click", function (e) {
      const opener = e.target.closest("[data-nico-open]");
      if (opener) toggle(true);
      const pilot = e.target.closest("[data-pilot-open]");
      if (pilot) {
        e.preventDefault();
        openPilotForm({ tier: pilot.getAttribute("data-tier") || "" });
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) toggle(false);
    });

    if (!sessionStorage.getItem("nico-greeted")) sessionStorage.setItem("nico-greeted", "1");
    nicoSay("Hi, I’m Nico. I can navigate this site, run demos, and show you proof. Try a command chip below.");
  }

  function toggle(force) {
    const open = typeof force === "boolean" ? force : !panel.classList.contains("open");
    panel.classList.toggle("open", open);
    if (open) panel.querySelector("input").focus();
  }

  function addBubble(who, text) {
    const el = document.createElement("div");
    el.className = "nico-bubble from-" + (who === "user" ? "user" : "nico");
    el.textContent = text;
    transcript.appendChild(el);
    transcript.scrollTop = transcript.scrollHeight;
  }

  function nicoSay(text) {
    waveform.classList.add("speaking");
    addBubble("nico", text);
    setTimeout(function () { waveform.classList.remove("speaking"); }, 1600);
  }

  function handleCommand(text) {
    toggle(true);
    addBubble("user", text);

    // Let the current page claim the command first (e.g. sandbox run on the page itself)
    const evt = new CustomEvent("nico:command", { detail: { text: text, handled: false }, cancelable: true });
    document.dispatchEvent(evt);
    if (evt.detail.handled) {
      if (evt.detail.reply) nicoSay(evt.detail.reply);
      return;
    }

    const cmd = COMMANDS.find(function (c) { return c.match.test(text); });
    if (!cmd) {
      nicoSay("I’m in demo mode, so I understand the commands on the chips below. In production I’d classify this against the city taxonomy — and if my confidence were low, I’d hand you to a person with full context.");
      return;
    }
    nicoSay(cmd.reply);
    if (cmd.action === "compare") { setTimeout(openCompareModal, 700); return; }
    if (cmd.action === "loop") { setTimeout(openLoopModal, 700); return; }
    if (cmd.go) setTimeout(function () { location.href = cmd.go; }, 1100);
  }

  /* ---------------- Comparison modal ---------------- */
  function openCompareModal() {
    openModal(
      "<h3>Envoz 311 + SeeClickFix — better together</h3>" +
      '<p class="small" style="color:var(--muted)">A respectful comparison. Most cities should keep SeeClickFix — and arm it with Envoz.</p>' +
      '<div class="table-wrap" style="margin:16px 0"><table class="data-table"><thead><tr><th></th><th>SeeClickFix / CivicPlus</th><th>Envoz 311</th></tr></thead><tbody>' +
      "<tr><td><strong>Case CRM &amp; map reporting</strong></td><td>✅ Excellent, mature</td><td>Writes into it — no replacement</td></tr>" +
      "<tr><td><strong>Status updates &amp; integrations</strong></td><td>✅ Mature</td><td>Reads &amp; reuses them</td></tr>" +
      "<tr><td><strong>24/7 voice-to-outcome intake</strong></td><td>—</td><td>✅ Answers, classifies, routes, writes back</td></tr>" +
      "<tr><td><strong>Confidence + rationale on every case</strong></td><td>—</td><td>✅ Visible on every routing decision</td></tr>" +
      "<tr><td><strong>Continuous improvement loop</strong></td><td>—</td><td>✅ Staff corrections become approved city rules</td></tr>" +
      "<tr><td><strong>Council-ready proof reports</strong></td><td>Basic reporting</td><td>✅ Generated from live evidence</td></tr>" +
      "</tbody></table></div>" +
      '<div class="proof-strip"><span class="proof-icon">✓</span>Overlay mode: Envoz creates the case, SeeClickFix issues the case number. Residents and staff keep the tools they know.</div>' +
      '<div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary" href="integrations.html">See the full integration matrix</a><a class="btn btn-secondary" href="platform.html">How overlay mode works</a></div>'
    );
  }

  /* ---------------- Improvement Loop ---------------- */
  const LOOP_STEPS = [
    ["Listen", "Calls, web reports, SMS, status checks, after-hours surges, multilingual interactions."],
    ["Understand", "Nico captures intent, language, transcript, location, service type, confidence, and rationale."],
    ["Route", "Taxonomy, department ownership, GIS jurisdiction, duplicates, SLA priority, write path."],
    ["Resolve", "Case created, routed, updated, referred, escalated — or answered from grounded city knowledge."],
    ["Measure", "CEL logs routing accuracy, corrections, handle time, containment, SLA, language confidence."],
    ["Learn", "Patterns detected: unknown phrases, misroutes, duplicate clusters, SLA disparities, stale answers."],
    ["Recommend", "Nico proposes safe improvements: city-only rules, vocabulary, taxonomy, data fixes."],
    ["Approve", "Humans choose scope: this case · city-only rule · department memory · global evidence."],
    ["Improve", "Approved changes are sandbox-tested, versioned, audited — then deployed."]
  ];

  function loopHTML(id) {
    const steps = LOOP_STEPS.map(function (s, i) {
      return (
        '<div class="loop-step" data-step="' + i + '" style="display:flex;gap:12px;align-items:flex-start;padding:9px 12px;border-radius:10px;transition:background .3s,box-shadow .3s">' +
        '<span class="step-dot" style="width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;border:2px solid var(--slate-300);color:var(--slate-500);background:var(--surface)">' + (i + 1) + "</span>" +
        '<span><strong style="display:block;font-size:.9rem">' + s[0] + '</strong><span class="small" style="color:var(--muted)">' + s[1] + "</span></span></div>"
      );
    }).join('<div class="wf-connector" style="margin-left:25px"></div>');
    return (
      '<div id="' + id + '">' +
      '<p class="small" style="color:var(--muted);margin:0 0 12px">How we picture the Continuous Evaluation Loop in action: an illustration of how evidence becomes approved improvements.</p>' +
      '<div class="chip-row" style="margin-bottom:14px"><span class="chip chip-teal">Listen → Understand → Route → Resolve → Measure → Learn → Recommend → Approve → Improve</span></div>' +
      steps +
      '<div class="audit-ribbon" style="margin-top:16px"><span>🛡</span><span><strong style="color:#fff">Envoz recommends. City staff approve.</strong> Every change is audited.</span></div></div>'
    );
  }

  function animateLoop(rootEl) {
    const steps = rootEl.querySelectorAll(".loop-step");
    const connectors = rootEl.querySelectorAll(".wf-connector");
    steps.forEach(function (s, i) {
      setTimeout(function () {
        s.style.background = "var(--aqua-50)";
        s.style.boxShadow = "inset 0 0 0 1.5px var(--teal-600)";
        const dot = s.querySelector(".step-dot");
        dot.style.background = "var(--teal-600)";
        dot.style.borderColor = "var(--teal-600)";
        dot.style.color = "#fff";
        if (connectors[i]) connectors[i].classList.add("lit");
        setTimeout(function () {
          s.style.background = "transparent";
          s.style.boxShadow = "none";
        }, 1400);
      }, 420 * i);
    });
  }

  function openLoopModal() {
    openModal(
      "<h3>The 311 program that improves itself, safely.</h3>" +
      '<p class="small" style="color:var(--muted)">Every routed case, staff correction, SLA outcome, and unknown category becomes evidence Nico turns into improvements city staff approve.</p>' +
      loopHTML("loop-modal-viz") +
      '<div style="margin-top:16px"><a class="btn btn-primary btn-sm" href="dashboards.html?tab=cel">Open the CEL Ledger</a></div>'
    );
    const viz = document.getElementById("loop-modal-viz");
    if (viz) setTimeout(function () { animateLoop(viz); }, 350);
  }

  /* ---------------- Generic modal ---------------- */
  function openModal(html) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "envoz-modal";
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
      '<button class="modal-close" type="button" aria-label="Close dialog">✕</button>' + html + "</div>";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    overlay.querySelector(".modal-close").addEventListener("click", closeModal);
    document.addEventListener("keydown", escClose);
    overlay.querySelector(".modal-close").focus();
  }
  function escClose(e) { if (e.key === "Escape") closeModal(); }
  function closeModal() {
    const m = document.getElementById("envoz-modal");
    if (m) m.remove();
    document.removeEventListener("keydown", escClose);
  }

  /* ---------------- Inline SVG icon set ----------------
     Replaces emoji used as UI iconography. Monochrome, currentColor,
     sized to 1em. Keep emoji only inside simulated chat/call transcripts. */
  const ICON_PATHS = {
    mic: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    phone: '<path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 6a2 2 0 0 1 2-2z"/>',
    pin: '<path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    warning: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.5"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    doc: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 13h6M9 17h6M9 9h2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
    route: '<circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="6" r="2.4"/><path d="M8 16.5 15.5 8M8 8h5a3 3 0 0 1 0 6"/>',
    building: '<path d="M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h1M8 12h1M15 8h1M15 12h1"/>',
    wrench: '<path d="M15 6a4 4 0 0 0-5 5L4 17l3 3 6-6a4 4 0 0 0 5-5l-2.5 2.5L13 9l1.5-3z"/>',
    bell: '<path d="M18 15V10a6 6 0 0 0-12 0v5l-2 2h16l-2-2z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 3-5 6-5s6 1.5 6 5"/><path d="M16 6a3 3 0 0 1 0 6M21 20c0-2.5-1.5-4-4-4.5"/>',
    layers: '<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 13l9 5 9-5M3 8v5M21 8v5"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    scale: '<path d="M12 3v18M6 21h12M4 8h16M8 8l-4 7a4 4 0 0 0 8 0L8 8zM16 8l4 7a4 4 0 0 0-8 0l4-7z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
  };
  function icon(name, cls) {
    const p = ICON_PATHS[name];
    if (!p) return "";
    return '<svg class="i-icon' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" width="1em" height="1em" fill="none" ' +
      'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + p + "</svg>";
  }

  /* ---------------- Pilot scoping form (primary commercial CTA) ---------------- */
  function openPilotForm(prefill) {
    const tier = prefill && prefill.tier ? prefill.tier : "";
    openModal(
      '<h3 style="margin-bottom:4px">Book a 20-minute pilot scoping call</h3>' +
      '<p class="small" style="color:var(--muted);margin-bottom:18px">Tell us about your city and we reply within 2 business days with a scoped pilot outline. No obligation.</p>' +
      '<form id="pilot-form" novalidate>' +
      (tier ? '<input type="hidden" name="tier" value="' + tier.replace(/"/g, "&quot;") + '">' : "") +
      '<div class="grid grid-2" style="gap:14px">' +
      '<div><label class="field-label" for="pf-name">Your name</label><input id="pf-name" name="name" type="text" required autocomplete="name"></div>' +
      '<div><label class="field-label" for="pf-city">City / county</label><input id="pf-city" name="city" type="text" required autocomplete="organization"></div>' +
      '<div><label class="field-label" for="pf-pop">Population served</label><input id="pf-pop" name="population" type="text" inputmode="numeric" placeholder="e.g. 120,000"></div>' +
      '<div><label class="field-label" for="pf-crm">Current 311 CRM</label><select id="pf-crm" name="crm">' +
      '<option value="">Select…</option><option>SeeClickFix / CivicPlus</option><option>Tyler</option><option>Granicus</option>' +
      '<option>QAlert / Catalis</option><option>Salesforce</option><option>Accela</option><option>Cityworks</option>' +
      '<option>Other</option><option>None / voicemail today</option></select></div>' +
      '<div style="grid-column:1/-1"><label class="field-label" for="pf-email">Work email</label><input id="pf-email" name="email" type="email" required autocomplete="email"></div>' +
      "</div>" +
      '<div id="pf-error" class="small" style="color:var(--red-700);margin-top:10px;display:none" role="alert"></div>' +
      '<div class="flex flex-wrap" style="margin-top:18px;gap:10px">' +
      '<button class="btn btn-primary" type="submit">Request scoping call</button>' +
      '<a class="btn btn-secondary" href="voice-ai.html?demo=pothole">Watch the demo first</a>' +
      "</div>" +
      '<p class="small" style="color:var(--muted);margin-top:14px">We will never assert certifications we do not hold. Ask us for the security roadmap.</p>' +
      "</form>"
    );
    const form = document.getElementById("pilot-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = form.name.value.trim(), city = form.city.value.trim(), email = form.email.value.trim();
      const err = document.getElementById("pf-error");
      if (!name || !city || !/.+@.+\..+/.test(email)) {
        err.textContent = "Please add your name, city, and a valid work email.";
        err.style.display = "block";
        return;
      }
      /* DEMO PROTOTYPE: no live endpoint. Swap the block below for a real
         POST or calendar URL (e.g. window.location = 'https://cal.example/envoz').
         mailto: is the working fallback. */
      const subject = encodeURIComponent("Pilot scoping call — " + city);
      const body = encodeURIComponent(
        "Name: " + name + "\nCity/county: " + city +
        "\nPopulation: " + form.population.value.trim() +
        "\nCurrent CRM: " + form.crm.value + "\nEmail: " + email +
        (tier ? "\nInterested tier: " + tier : "")
      );
      openModal(
        '<div class="center" style="padding:8px 0">' +
        '<div class="icon-tile green" style="margin:0 auto 14px">' + icon("check") + "</div>" +
        "<h3>Thanks, " + escHtml(name) + ".</h3>" +
        '<p style="max-width:46ch;margin:0 auto 8px">This is a demonstration prototype, so nothing was sent automatically. In production, this books a 20-minute scoping call and we reply within 2 business days with a scoped pilot outline for ' + escHtml(city) + ".</p>" +
        '<p class="small" style="color:var(--muted);max-width:46ch;margin:0 auto 18px">To reach us now, use the email below — it is pre-filled with what you entered.</p>' +
        '<a class="btn btn-primary" href="mailto:pilots@envoz311.example.com?subject=' + subject + "&body=" + body + '">Open pre-filled email</a>' +
        "</div>"
      );
    });
    const first = document.getElementById("pf-name");
    if (first) first.focus();
  }
  function escHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------------- Standard closing CTA band ---------------- */
  function closingCTA(opts) {
    opts = opts || {};
    const heading = opts.heading || "Ready to see it in your city?";
    const sub = opts.sub || "Start with a 90-day pilot, scoped to fit under most cities’ small-purchase authority.";
    return (
      '<section class="section section-dark grid-texture"><div class="container center">' +
      '<h2>' + heading + "</h2>" +
      '<p class="lede" style="margin:0 auto 22px">' + sub + "</p>" +
      '<div class="flex flex-wrap" style="justify-content:center;gap:12px">' +
      '<button class="btn btn-primary btn-lg" type="button" data-pilot-open>Book a 20-minute pilot scoping call</button>' +
      '<a class="btn btn-secondary btn-lg" href="voice-ai.html?demo=pothole">Watch the demo</a>' +
      "</div></div></section>"
    );
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Public API ---------------- */
  window.Envoz = {
    openModal: openModal,
    closeModal: closeModal,
    openCompareModal: openCompareModal,
    openLoopModal: openLoopModal,
    loopHTML: loopHTML,
    animateLoop: animateLoop,
    poweredPill: poweredPill,
    icon: icon,
    openPilotForm: openPilotForm,
    closingCTA: closingCTA,
    nicoSay: function (t) { toggle(true); nicoSay(t); },
    nicoCommand: handleCommand,
    param: function (k) { return new URLSearchParams(location.search).get(k); },
    confidenceChip: function (pct) {
      const low = pct < 60;
      return '<span class="chip chip-confidence' + (low ? " low" : "") + '" title="AI routing confidence">' +
        (low ? "◔" : "●") + " " + pct + "% confidence</span>";
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    renderDock();
    initReveal();
  });
})();
