/* ============================================================
   Configuration Studio — Harbor Mesa onboarding interview,
   live workflow canvas, checklist, sandbox test call.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- DOM handles (bound on DOMContentLoaded) ---------------- */
  var convo, btnContinue, btnAuto, btnRestart, btnRun, runStatus, resultPanel;

  /* ---------------- State ---------------- */
  var idx = 0;            // next message pointer
  var auto = false;       // auto-advance mode
  var autoTimer = null;
  var running = false;    // sandbox call in progress
  var runToken = 0;       // invalidates pending sandbox-run timeouts on restart
  var credResolved = false;
  var dataGateAcked = false;

  /* ---------------- Onboarding script ---------------- */
  var MSGS = [
    { who: "nico",
      text: "Welcome, Harbor Mesa. I’m Nico — I’ll configure your 311 tenant while we talk, and every answer lights up a piece on the canvas. First: what is your system of record for service requests?" },
    { who: "city",
      text: "We use SeeClickFix.",
      fx: function () {
        lightNode("wf-triage");
        errorNode("wf-scf");
        check("ck-sor");
        addCredentialCard();
      } },
    { who: "nico",
      text: "Perfect — no rip-and-replace. I’ll write cases into SeeClickFix and it keeps issuing the case numbers, so your staff keep the tools they already know. Next: where are your trash and recycling schedules?" },
    { who: "city",
      text: "In a Google Sheet that Sanitation keeps up to date.",
      fx: function () {
        lightNode("wf-trash");
        check("ck-trash");
        addDirtyDataCard();
      } },
    { who: "nico",
      text: "Imported into the sandbox knowledge source. Now — how do you handle after-hours calls today?" },
    { who: "city",
      text: "Honestly? They go to voicemail. Staff triage the backlog the next morning.",
      fx: function () {
        lightNode("wf-voice");
        lightNode("wf-safety");
        lightNode("wf-intent");
        check("ck-voice");
      } },
    { who: "nico",
      text: "That’s the 9:42 PM problem — I’ll answer those calls, run the safety gate first (emergencies go straight to 911, no 311 case), then classify intent with a visible confidence score. Which GIS layer should I use for road ownership?" },
    { who: "city",
      text: "Our Esri road ownership layer — some roads here are county-maintained.",
      fx: function () {
        lightNode("wf-gis");
        lightNode("wf-referral");
        check("ck-gis");
      } },
    { who: "nico",
      text: "Linked. County-owned segments become warm referrals with full context — never a dead end for the resident. What languages should we enable first?" },
    { who: "city",
      text: "English and Spanish.",
      fx: function () {
        lightNode("wf-sms");
        check("ck-lang");
      } },
    { who: "nico",
      text: "Done — bilingual voice intake and SMS confirmations are on, with more languages one toggle away. Last question: do you want to run a sandbox test call?" },
    { who: "city",
      text: "Yes — let’s see it.",
      fx: function () {
        lightNode("wf-cel");
        doneNode("wf-webhook");
        enableRun();
      } },
    { who: "nico",
      text: "Everything you just watched me build is sandbox-scoped — nothing is resident-facing. Press “Run sandbox call” and I’ll walk a test pothole report through the whole pipeline." }
  ];

  /* ---------------- Canvas helpers ---------------- */
  // Main-lane order, used to light connectors between adjacent lit nodes.
  var SPINE = ["wf-voice", "wf-safety", "wf-intent", "wf-gis", "wf-scf", "wf-sms", "wf-cel"];

  function node(id) { return document.getElementById(id); }

  function lightNode(id) {
    var n = node(id);
    if (!n) return;
    n.classList.remove("dim", "error");
    n.classList.add("lit");
    pulse(n);
    updateConnectors();
  }

  function doneNode(id) {
    var n = node(id);
    if (!n) return;
    n.classList.remove("dim", "error");
    n.classList.add("done");
    pulse(n);
  }

  function errorNode(id) {
    var n = node(id);
    if (!n) return;
    n.classList.remove("dim");
    n.classList.add("error");
  }

  function pulse(n) {
    n.classList.remove("run-hot");
    void n.offsetWidth; // restart animation
    n.classList.add("run-hot");
  }

  function updateConnectors() {
    for (var i = 0; i < SPINE.length - 1; i++) {
      var a = node(SPINE[i]), b = node(SPINE[i + 1]);
      var cx = document.getElementById("cx-" + (i + 1));
      if (!a || !b || !cx) continue;
      var litPair = a.classList.contains("lit") && b.classList.contains("lit");
      cx.classList.toggle("lit", litPair);
    }
  }

  /* ---------------- Checklist ---------------- */
  function check(id) {
    var li = document.getElementById(id);
    if (!li || li.classList.contains("done")) return;
    li.classList.add("done");
    var sr = li.querySelector(".ck-sr");
    if (sr) sr.textContent = "— complete";
  }

  function uncheckAll() {
    var items = document.querySelectorAll("#checklist .ck-item");
    items.forEach(function (li) {
      li.classList.remove("done");
      var sr = li.querySelector(".ck-sr");
      if (sr) sr.textContent = "— pending";
    });
  }

  /* ---------------- Transcript helpers ---------------- */
  function addBubble(who, text) {
    var el = document.createElement("div");
    el.className = "nico-bubble from-" + (who === "city" ? "user" : "nico");
    el.style.maxWidth = "94%";
    var sr = document.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = who === "city" ? "Harbor Mesa: " : "Nico: ";
    el.appendChild(sr);
    el.appendChild(document.createTextNode(text));
    convo.appendChild(el);
    convo.scrollTop = convo.scrollHeight;
    return el;
  }

  function addEventCard(html) {
    var el = document.createElement("div");
    el.className = "event-card";
    el.innerHTML = html;
    convo.appendChild(el);
    convo.scrollTop = convo.scrollHeight;
    return el;
  }

  /* ---------------- Interaction 1: credential validation ---------------- */
  function addCredentialCard() {
    var card = addEventCard(
      '<div class="caution-strip" role="status"><span aria-hidden="true">⚠️</span><span>Token check failed — <strong>Missing permission: issue:create</strong></span></div>' +
      '<p class="small" style="color:var(--muted)">The API token Harbor Mesa pasted can read issues but can’t create them. Nico validates every credential before it touches the canvas.</p>' +
      '<div class="flex flex-wrap">' +
      '<button class="btn btn-secondary btn-sm" type="button" data-cred="request">Send credential request</button>' +
      '<button class="btn btn-primary btn-sm" type="button" data-cred="retry">Try new token</button>' +
      "</div>" +
      '<p class="small" data-cred-note hidden style="color:var(--muted)"></p>'
    );

    card.querySelector('[data-cred="request"]').addEventListener("click", function () {
      var note = card.querySelector("[data-cred-note]");
      note.hidden = false;
      note.innerHTML = "✉️ Credential request sent to <span class=\"mono\">it@harbormesa.gov</span> with the exact scope needed (<span class=\"mono\">issue:create</span>, sandbox only). Paste the new token when it arrives — onboarding continues in the meantime.";
    });

    card.querySelector('[data-cred="retry"]').addEventListener("click", function () {
      resolveCredential(card);
    });
  }

  function resolveCredential(card) {
    if (credResolved) return;
    credResolved = true;
    card.innerHTML =
      '<div class="proof-strip" role="status"><span class="proof-icon">✓</span>Validated · scoped to Harbor Mesa sandbox</div>' +
      '<p class="small" style="color:var(--muted);margin:0">New token accepted with <span class="mono">issue:create</span> permission. Write access is limited to the sandbox tenant — production writes need a separate, city-approved credential.</p>';
    lightNode("wf-scf");
    check("ck-token");
  }

  /* ---------------- Interaction 2: Dirty Data Gate ---------------- */
  function addDirtyDataCard() {
    var card = addEventCard(
      '<div class="caution-strip" role="status"><span aria-hidden="true">⚠️</span><span><strong>Dirty Data Gate</strong> — trash schedule import has 17 inconsistent neighborhood names.</span></div>' +
      '<p class="small" style="color:var(--muted)">Dirty data does <strong>not</strong> block sandbox testing — Nico can answer schedule questions against the imported rows today. Dirty data <strong>does</strong> gate production: this tenant stays sandbox-only until the names are normalized. Nothing goes live for residents before that.</p>' +
      '<div class="flex flex-wrap">' +
      '<button class="btn btn-primary btn-sm" type="button" data-dq="tasks">Create data quality task list</button>' +
      '<button class="btn btn-secondary btn-sm" type="button" data-dq="sandbox">Continue sandbox only</button>' +
      "</div>" +
      '<div data-dq-note hidden></div>'
    );

    card.querySelector('[data-dq="tasks"]').addEventListener("click", function () {
      var note = card.querySelector("[data-dq-note]");
      note.hidden = false;
      note.innerHTML =
        '<div class="proof-strip" role="status"><span class="proof-icon">✓</span>Task list created · 17 rows assigned to Sanitation</div>' +
        '<p class="small" style="color:var(--muted);margin:8px 0 0">The production gate stays on until every row is normalized and re-validated. Sandbox testing continues either way.</p>';
      ackDataGate();
    });

    card.querySelector('[data-dq="sandbox"]').addEventListener("click", function () {
      var note = card.querySelector("[data-dq-note]");
      note.hidden = false;
      note.innerHTML =
        '<p class="small" style="color:var(--amber-700);font-weight:600;margin:0">Continuing in sandbox. Production remains gated until the schedule data is production-ready — you can create the cleanup task list any time.</p>';
      ackDataGate();
    });
  }

  function ackDataGate() {
    if (dataGateAcked) return;
    dataGateAcked = true;
    check("ck-data");
  }

  /* ---------------- Conversation engine ---------------- */
  function conversationDone() { return idx >= MSGS.length; }

  function advance() {
    if (conversationDone()) return null;
    var m = MSGS[idx++];
    addBubble(m.who, m.text);
    if (m.fx) m.fx();
    updateControls();
    return m;
  }

  function updateControls() {
    if (conversationDone()) {
      btnContinue.textContent = "▶ Run sandbox call";
      btnContinue.setAttribute("aria-label", "Run sandbox test call");
      btnAuto.disabled = true;
      setAuto(false);
    } else if (idx === 0) {
      btnContinue.textContent = "Start onboarding";
      btnContinue.removeAttribute("aria-label");
      btnAuto.disabled = false;
    } else {
      btnContinue.textContent = "Continue";
      btnContinue.removeAttribute("aria-label");
    }
  }

  function setAuto(on) {
    auto = on;
    btnAuto.setAttribute("aria-pressed", String(on));
    btnAuto.textContent = on ? "⏸ Pause auto-advance" : "Auto-advance";
    clearTimeout(autoTimer);
    if (on) scheduleNext(400);
  }

  function scheduleNext(delay) {
    clearTimeout(autoTimer);
    if (!auto) return;
    if (conversationDone()) { setAuto(false); return; }
    autoTimer = setTimeout(function () {
      if (!auto) return;
      var m = advance();
      // Longer pause after messages that spawn an event card, so it can be read.
      var next = 1500 + (m && m.fx ? 1600 : 0);
      scheduleNext(next);
    }, delay);
  }

  function startAuto() {
    if (conversationDone()) return;
    setAuto(true);
  }

  function fastForward() {
    setAuto(false);
    while (!conversationDone()) advance();
  }

  function restart() {
    setAuto(false);
    runToken++; // cancel any in-flight sandbox-run timeouts
    idx = 0;
    running = false;
    credResolved = false;
    dataGateAcked = false;
    convo.innerHTML = "";
    runStatus.textContent = "";
    resultPanel.hidden = true;
    btnRun.disabled = true;
    btnRun.textContent = "▶ Run sandbox call";
    btnContinue.disabled = false;
    uncheckAll();
    document.querySelectorAll("#wf-canvas .wf-node").forEach(function (n) {
      n.classList.remove("lit", "done", "error", "run-hot");
      n.classList.add("dim");
    });
    document.querySelectorAll("#wf-canvas .wf-connector").forEach(function (c) {
      c.classList.remove("lit");
    });
    updateControls();
  }

  /* ---------------- Interaction 3: sandbox test call ---------------- */
  function enableRun() {
    btnRun.disabled = false;
  }

  var RUN_SEQ = [
    ["wf-voice",  "Voice Trigger · answering test call (9:42 PM, after hours)"],
    ["wf-safety", "Safety Gate · “Is anyone hurt?” — no emergency detected"],
    ["wf-intent", "Geo/Classify · pothole intent · 91% confidence"],
    ["wf-gis",    "Geo/Classify · Harbor Mesa Blvd & 5th St · city-maintained segment"],
    ["wf-scf",    "Create Test Case · writing to SeeClickFix sandbox…"],
    ["wf-sms",    "Confirmation · SMS with case number + status link (EN/ES)"],
    ["wf-cel",    "CEL Logging · full run recorded for audit"]
  ];

  function runSandbox() {
    if (running) return;
    if (!conversationDone()) fastForward();
    running = true;
    var token = ++runToken;
    btnRun.disabled = true;
    btnContinue.disabled = true;
    resultPanel.hidden = true;

    RUN_SEQ.forEach(function (step, i) {
      setTimeout(function () {
        if (token !== runToken) return;
        var n = node(step[0]);
        if (n) {
          n.classList.remove("dim", "error");
          n.classList.add("lit");
          pulse(n);
        }
        updateConnectors();
        runStatus.textContent = step[1];
      }, 650 * i);
    });

    setTimeout(function () {
      if (token !== runToken) return;
      runStatus.textContent = "Test call complete · HM-TEST-1042";
      resultPanel.hidden = false;
      check("ck-test");
      addBubble("nico",
        "Test call complete — HM-TEST-1042 was created in the sandbox tenant only; no public case exists. When your schedule data is production-ready, this exact pipeline is what goes live.");
      running = false;
      btnRun.disabled = false;
      btnRun.textContent = "↻ Run sandbox call again";
      btnContinue.disabled = false;
      btnContinue.textContent = "↻ Run sandbox call again";
    }, 650 * RUN_SEQ.length + 400);
  }

  /* ---------------- Connector library modals ---------------- */
  var GROUP_DEFAULTS = {
    "Systems of Record": {
      chip: "chip-teal",
      mode: "Overlay — Envoz writes the case; your CRM stays the system of record and issues the case number.",
      auth: "Scoped API credential · validated before the first write",
      time: "Same day in sandbox"
    },
    "Telephony & Voice": {
      chip: "chip-ocean",
      mode: "Native channel — carries the resident call into the safety-gated pipeline.",
      auth: "Carrier credentials / SIP registration",
      time: "Under an hour in sandbox"
    },
    "GIS & Maps": {
      chip: "chip-green",
      mode: "Read-only lookup — grounds location, ownership, and jurisdiction before routing.",
      auth: "Layer URL + key where required",
      time: "Same day in sandbox"
    },
    "Knowledge Sources": {
      chip: "chip-purple",
      mode: "Grounded answers only — Nico cites the source and never invents city policy.",
      auth: "Read access",
      time: "Minutes to import · quality-gated before production"
    },
    "Notifications": {
      chip: "chip-amber",
      mode: "Outbound — real case numbers and status updates back to residents.",
      auth: "Sender identity verification",
      time: "Under an hour in sandbox"
    },
    "Custom": {
      chip: "chip-navy",
      mode: "Webhook piece — for anything without a native connector.",
      auth: "HMAC signature, OAuth 2.0, or API key — matched to your endpoint",
      time: "About a day, including validation"
    }
  };

  var CONNECTORS = {
    "SeeClickFix": { g: "Systems of Record", d: "The connector this demo uses: Envoz creates the case, SeeClickFix issues the number, residents and staff keep the tool they know." },
    "Tyler ESR": { g: "Systems of Record", d: "Writes structured service requests into Tyler Enterprise Service Requests with department and asset mapping." },
    "Granicus OneView / govService": { g: "Systems of Record", d: "Creates and updates OneView / govService records with full classification, location, and rationale attached." },
    "QAlert / Catalis": { g: "Systems of Record", d: "Maps the Envoz taxonomy onto your QAlert request types; duplicates are checked before every create." },
    "Salesforce Service Cloud": { g: "Systems of Record", d: "Writes cases into Service Cloud with confidence and rationale as custom fields your admins control." },
    "Accela": { g: "Systems of Record", d: "Creates Accela records for code-enforcement-shaped requests, with parcel context from your GIS layers." },
    "OpenGov EAM": { g: "Systems of Record", d: "Turns confirmed infrastructure requests into OpenGov EAM work orders against the right asset." },
    "Cityworks": { g: "Systems of Record", d: "Creates Cityworks service requests tied to GIS assets — the crew sees the same pin the resident described." },
    "Twilio": { g: "Telephony & Voice", d: "Voice and SMS transport. Your existing 311 number can forward after-hours calls in one afternoon." },
    "Telnyx": { g: "Telephony & Voice", d: "Alternative carrier with number porting and global SIP — useful for redundancy requirements." },
    "SIP trunk": { g: "Telephony & Voice", d: "Bring your own trunk: Envoz registers against your PBX so nothing about your phone bill changes." },
    "TTY/RTT": { g: "Telephony & Voice", d: "Text telephone and real-time text support, so accessible channels run through the same safety-gated pipeline." },
    "Esri / ArcGIS": { g: "GIS & Maps", d: "First-class support for the layers most cities already maintain — including the road ownership layer Harbor Mesa linked in this demo." },
    "Google Maps": { g: "GIS & Maps", d: "Geocoding and place resolution as a fallback when a resident describes a location by landmark." },
    "Parcel layers": { g: "GIS & Maps", d: "Resolves public-vs-private property questions before a case is created — fewer misrouted code cases." },
    "District layers": { g: "GIS & Maps", d: "Council district, maintenance zone, and school-zone flags attached to every case for routing and reporting." },
    "Road ownership layers": { g: "GIS & Maps", d: "City, county, or state? Envoz checks before routing — county segments become warm referrals, not dead ends." },
    "City website": { g: "Knowledge Sources", d: "Crawled and indexed with per-page citations — answers link back to the page they came from." },
    "Municode": { g: "Knowledge Sources", d: "Ordinance-grounded answers with section citations; Nico quotes code, never paraphrases it into being wrong." },
    "PDFs": { g: "Knowledge Sources", d: "Fee schedules, program flyers, holiday calendars — imported, chunked, and cited by page." },
    "Trash schedules": { g: "Knowledge Sources", d: "The most-asked 311 question. Imported per-address; dirty rows are flagged and gate production, never the sandbox." },
    "Google Sheets": { g: "Knowledge Sources", d: "Where real city data lives. Envoz imports the sheet, validates it, and reports every inconsistent row." },
    "FAQ pages": { g: "Knowledge Sources", d: "Existing FAQ content becomes voice-ready answers with source citations and staleness checks." },
    "SMS": { g: "Notifications", d: "Case number and status link the moment the case is created — in the resident's language." },
    "Email": { g: "Notifications", d: "Structured confirmations and the structured-email fallback path when a CRM write is unavailable." },
    "Outbound callback": { g: "Notifications", d: "Nico calls the resident back with status on request — no hold music, no phone tree." },
    "Webhook + matched auth": { g: "Custom", d: "A signed webhook piece for the system nobody else integrates with — HMAC, OAuth 2.0, or API key, matched to your endpoint and validated like every other credential." }
  };

  function openConnectorModal(name) {
    var c = CONNECTORS[name];
    if (!c || !window.Envoz) return;
    var g = GROUP_DEFAULTS[c.g];
    window.Envoz.openModal(
      "<h3>" + name + "</h3>" +
      '<div class="chip-row" style="margin:8px 0 14px">' +
      '<span class="chip ' + g.chip + '">' + c.g + "</span>" +
      '<span class="chip chip-outline">Available in sandbox</span>' +
      "</div>" +
      "<p>" + c.d + "</p>" +
      '<div class="table-wrap" style="margin:16px 0"><table class="data-table"><tbody>' +
      "<tr><td><strong>Mode</strong></td><td>" + g.mode + "</td></tr>" +
      "<tr><td><strong>Auth</strong></td><td>" + g.auth + "</td></tr>" +
      "<tr><td><strong>Credential check</strong></td><td>Validated by Nico before it touches the canvas — failures show the exact missing permission.</td></tr>" +
      "<tr><td><strong>Typical setup</strong></td><td>" + g.time + "</td></tr>" +
      "</tbody></table></div>" +
      '<p class="disclaimer">Demo environment · connector details are illustrative; no live systems are contacted.</p>' +
      '<div class="flex flex-wrap" style="margin-top:14px">' +
      '<a class="btn btn-primary btn-sm" href="integrations.html">Full integration matrix</a>' +
      '<a class="btn btn-secondary btn-sm" href="configuration-studio.html?flow=harbor-mesa">See it configured live</a>' +
      "</div>"
    );
  }

  /* ---------------- Nico command claims ---------------- */
  document.addEventListener("nico:command", function (e) {
    var t = e.detail.text || "";
    if (/sandbox/i.test(t)) {
      e.detail.handled = true;
      e.detail.reply = "Running a sandbox test call on the Harbor Mesa canvas — watch the pipeline light up. Sandbox only; no public case will be created.";
      document.getElementById("studio").scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(runSandbox, 600);
      return;
    }
    if (/harbor mesa|configure/i.test(t)) {
      e.detail.handled = true;
      e.detail.reply = "Starting the Harbor Mesa onboarding interview right here — every answer lights up a piece on the canvas.";
      document.getElementById("studio").scrollIntoView({ behavior: "smooth", block: "start" });
      if (idx === 0 || conversationDone()) {
        if (conversationDone()) restart();
        setTimeout(startAuto, 600);
      } else {
        startAuto();
      }
    }
  });

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    convo = document.getElementById("convo");
    btnContinue = document.getElementById("btn-continue");
    btnAuto = document.getElementById("btn-auto");
    btnRestart = document.getElementById("btn-restart");
    btnRun = document.getElementById("btn-run-sandbox");
    runStatus = document.getElementById("run-status");
    resultPanel = document.getElementById("sandbox-result");

    btnContinue.addEventListener("click", function () {
      if (conversationDone()) { runSandbox(); return; }
      setAuto(false);
      advance();
    });
    btnAuto.addEventListener("click", function () { setAuto(!auto); });
    btnRestart.addEventListener("click", restart);
    btnRun.addEventListener("click", runSandbox);

    document.querySelectorAll(".conn-btn").forEach(function (b) {
      b.addEventListener("click", function () { openConnectorModal(b.dataset.conn); });
    });

    updateControls();

    // ?flow=harbor-mesa auto-starts the onboarding conversation.
    if (window.Envoz && window.Envoz.param("flow") === "harbor-mesa") {
      setTimeout(startAuto, 700);
    }
  });
})();
