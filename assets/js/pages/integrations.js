/* Integrations page — matrix render + category filters, connector detail
   modals, and the write-back reliability outage simulation. */
(function () {
  "use strict";

  var CAT_LABELS = {
    record: "System of record",
    gis: "GIS & maps",
    tel: "Telephony",
    knowledge: "Knowledge"
  };

  var STATUS_CLASS = {
    "Production reference": "chip-green",
    "Partner API": "chip-ocean",
    "Stage Two": "chip-amber",
    "Roadmap": "chip-purple",
    "Target catalog": "chip-outline",
    "Supported options": "chip-teal",
    "GA": "chip-green",
    "Beta": "chip-amber"
  };

  var CONNECTORS = [
    {
      name: "SeeClickFix / Open311", cat: "record",
      useCase: "Primary overlay target: after-hours voice reports become SeeClickFix issues",
      mode: "Overlay · Open311 write",
      writes: "Service request, category, geo-point, photos, summary, confidence + rationale note",
      reads: "Request types, case status, public comments",
      proof: "CRM-issued case ID echoed to resident; write receipt in audit log",
      status: "Production reference",
      detail: "The reference overlay integration. Envoz creates the issue through the Open311 GeoReport v2 endpoint where available, or the native SeeClickFix API, and only confirms a case number once SeeClickFix returns one. Status checks read back from the same record, so residents and staff see a single source of truth."
    },
    {
      name: "Tyler ESR / My Civic", cat: "record",
      useCase: "Enterprise 311 system of record for larger cities",
      mode: "Overlay · native API write",
      writes: "Case, classification, priority, location, transcript summary",
      reads: "Service catalog, workflow states, case status",
      proof: "Tyler case ID + timestamped write receipt",
      status: "Roadmap",
      detail: "On the roadmap. Envoz will map its taxonomy to the Tyler service catalog so cases arrive pre-classified into the workflows staff already run, with the Tyler case ID as the number the resident hears. It is built on the same Open311-style write contract already proven with SeeClickFix, not shipping yet."
    },
    {
      name: "Granicus OneView / govService", cat: "record",
      useCase: "Request management inside the Granicus experience suite",
      mode: "Overlay · partner API write",
      writes: "Service request, routing rationale, resident contact preference",
      reads: "Request status, request types, knowledge articles",
      proof: "OneView request ID logged with write receipt",
      status: "Target catalog",
      detail: "In the target catalog. Planned to write requests into OneView / govService and read status back for resident SMS updates, delivered with vendor cooperation. Knowledge articles can already ground Nico's answers today, keeping the city's published guidance authoritative."
    },
    {
      name: "CivicPlus", cat: "record",
      useCase: "City website + request intake platform overlay",
      mode: "Overlay · case write + deep link",
      writes: "Service request, category, geo-point, summary",
      reads: "Request types, statuses; site content for grounded answers",
      proof: "Request ID confirmed before the resident hears it",
      status: "Target catalog",
      detail: "In the target catalog. For CivicPlus cities, Envoz is designed to write requests into the same intake pipeline the website uses and deep-link residents to the public status page. Today the city website already doubles as a knowledge source for grounded answers."
    },
    {
      name: "QAlert / Catalis", cat: "record",
      useCase: "311 CRM common in mid-size cities",
      mode: "Overlay · native API write",
      writes: "Case, department queue, priority, confidence note",
      reads: "Queues, statuses, duplicate candidates",
      proof: "QAlert case number + audit entry",
      status: "Stage Two",
      detail: "Stage Two on the build-out (months 4–6). Envoz will route into existing QAlert queues and read duplicate candidates back before creating a case, so surge nights don't flood the queue with fourteen copies of the same storm-drain report."
    },
    {
      name: "Salesforce Service Cloud", cat: "record",
      useCase: "Case management for cities standardized on Salesforce",
      mode: "Overlay · REST write",
      writes: "Case object + custom fields: confidence, rationale, channel",
      reads: "Case status, contact records, entitlement / SLA data",
      proof: "Salesforce Case ID; idempotency key on every write",
      status: "Partner API",
      detail: "Cases are created through the standard REST API with Envoz confidence and rationale stored in custom fields, so admins can report on routing quality inside Salesforce. Entitlement data feeds SLA-risk alerts back into Envoz dashboards."
    },
    {
      name: "Accela", cat: "record",
      useCase: "Code enforcement and permitting record write-back",
      mode: "Overlay · record write",
      writes: "Code-enforcement record, location, evidence summary",
      reads: "Record types, statuses, inspection schedules",
      proof: "Accela record ID in audit log",
      status: "Partner API",
      detail: "Complaints that classify as code enforcement (abandoned vehicles, property maintenance) are written as Accela records with the evidence summary attached, and inspection schedules read back for honest resident expectations."
    },
    {
      name: "Cityworks", cat: "record",
      useCase: "Asset-linked work orders for public works crews",
      mode: "Overlay · work-order write",
      writes: "Service request linked to asset ID, priority, geo-point",
      reads: "Asset registry, work-order status",
      proof: "Work-order number confirmed before resident notification",
      status: "Target catalog",
      detail: "In the target catalog. Because Envoz resolves location against GIS asset layers first, planned Cityworks requests would arrive already linked to the specific storm drain, streetlight, or road segment, so crews get an asset ID instead of a paragraph."
    },
    {
      name: "OpenGov EAM / Cartegraph", cat: "record",
      useCase: "Enterprise asset management task write-back",
      mode: "Overlay · task write",
      writes: "Task / request with asset reference and severity",
      reads: "Asset and task status, maintenance schedules",
      proof: "Task ID + write receipt",
      status: "Target catalog",
      detail: "In the target catalog. Envoz is designed to write asset-referenced tasks into OpenGov EAM (Cartegraph) and read maintenance schedules so Nico can eventually tell a resident when the pothole's road segment is already slated for resurfacing. Not shipping yet."
    },
    {
      name: "Esri / ArcGIS", cat: "gis",
      useCase: "Jurisdiction, ownership, and asset grounding for routing",
      mode: "Read · grounding",
      writes: "None (read-only)",
      reads: "Road ownership, parcels, storm-drain and streetlight asset layers",
      proof: "Layer + feature ID cited in routing rationale",
      status: "GA",
      detail: "Every routing decision is grounded against the city's own ArcGIS layers: is this road city-maintained or county? Which storm-drain asset is within 30 feet? The cited layer and feature ID appear in the case rationale, so staff can verify the call."
    },
    {
      name: "Google Maps", cat: "gis",
      useCase: "Geocoding fallback and landmark normalization",
      mode: "Read · grounding",
      writes: "None (read-only)",
      reads: "Geocoding, place and landmark names",
      proof: "Geocode source cited on location resolution",
      status: "GA",
      detail: "When a resident says \"by the taco place on Alton,\" Google Maps resolves the landmark and the city's GIS confirms jurisdiction. City layers always win on ownership; Maps only fills the naming gap."
    },
    {
      name: "Twilio / Telnyx", cat: "tel",
      useCase: "Voice carriage, SMS status links, warm transfer",
      mode: "Channel · voice & SMS",
      writes: "SMS confirmations with status links, callback requests",
      reads: "Call metadata, caller language hints, transfer status",
      proof: "Call SID logged on every interaction",
      status: "Supported options",
      detail: "Cities keep their existing 311 number, and carriage simply points at Envoz. Low-confidence calls warm-transfer to staff with full context over the same trunk, and every interaction's call SID lands in the audit log."
    },
    {
      name: "Municode", cat: "knowledge",
      useCase: "Ordinance-grounded answers: parking, noise, permits",
      mode: "Read · knowledge",
      writes: "None (read-only)",
      reads: "Municipal code sections, ordinance text",
      proof: "Section citation on every grounded answer",
      status: "Beta",
      detail: "When a resident asks whether overnight RV parking is legal, Nico answers from the city's actual code and cites the section. If the ordinance is ambiguous or unindexed, Nico says so and offers a staff follow-up instead of guessing."
    },
    {
      name: "City website / PDFs / Google Sheets", cat: "knowledge",
      useCase: "Grounded answers for schedules, hours, and fees",
      mode: "Read · knowledge",
      writes: "None (read-only)",
      reads: "Web pages, PDF documents, trash-schedule sheets",
      proof: "Source + freshness date shown per answer",
      status: "GA",
      detail: "Most city knowledge lives in pages, PDFs, and spreadsheets, and Envoz ingests them as-is, tenant-scoped, showing the source and freshness date on every answer. Stale or conflicting sources surface as data-quality recommendations in the CEL."
    }
  ];

  /* ---------------- Matrix render + filters ---------------- */
  var activeCat = "all";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function statusChip(status) {
    return '<span class="chip ' + (STATUS_CLASS[status] || "") + '">' + esc(status) + "</span>";
  }

  function renderMatrix() {
    var body = document.getElementById("matrix-body");
    var count = document.getElementById("matrix-count");
    if (!body) return;

    var rows = CONNECTORS.filter(function (c) {
      return activeCat === "all" || c.cat === activeCat;
    });

    body.innerHTML = rows.map(function (c) {
      var idx = CONNECTORS.indexOf(c);
      return (
        '<tr class="clickable" data-idx="' + idx + '">' +
        '<td><button class="matrix-sys-btn" type="button" data-idx="' + idx +
        '" aria-label="Connector details for ' + esc(c.name) + '">' + esc(c.name) + "</button>" +
        '<div class="small" style="color:var(--muted)">' + esc(CAT_LABELS[c.cat]) + "</div></td>" +
        "<td>" + esc(c.useCase) + "</td>" +
        '<td style="white-space:nowrap">' + esc(c.mode) + "</td>" +
        "<td>" + esc(c.writes) + "</td>" +
        "<td>" + esc(c.reads) + "</td>" +
        "<td>" + esc(c.proof) + "</td>" +
        "<td>" + statusChip(c.status) + "</td>" +
        "</tr>"
      );
    }).join("");

    if (count) {
      count.textContent = "Showing " + rows.length + " of " + CONNECTORS.length + " connectors";
    }
  }

  function openConnectorModal(c) {
    window.Envoz.openModal(
      '<div class="chip-row" style="margin-bottom:10px">' +
      '<span class="chip chip-teal">' + esc(CAT_LABELS[c.cat]) + "</span>" + statusChip(c.status) +
      "</div>" +
      "<h3>" + esc(c.name) + "</h3>" +
      '<p style="color:var(--body)">' + esc(c.detail) + "</p>" +
      '<div class="table-wrap" style="margin:14px 0"><table class="data-table"><tbody>' +
      "<tr><td><strong>Use case</strong></td><td>" + esc(c.useCase) + "</td></tr>" +
      "<tr><td><strong>Mode</strong></td><td>" + esc(c.mode) + "</td></tr>" +
      "<tr><td><strong>Data written</strong></td><td>" + esc(c.writes) + "</td></tr>" +
      "<tr><td><strong>Data read</strong></td><td>" + esc(c.reads) + "</td></tr>" +
      "<tr><td><strong>Proof / audit</strong></td><td>" + esc(c.proof) + "</td></tr>" +
      "</tbody></table></div>" +
      '<div class="proof-strip"><span class="proof-icon">✓</span>Tenant-scoped credentials · idempotent writes · structured-email fallback on outage.</div>' +
      '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">' +
      '<a class="btn btn-primary btn-sm" href="configuration-studio.html">Connect it in the studio</a>' +
      '<a class="btn btn-secondary btn-sm" href="platform.html">How overlay mode works</a></div>'
    );
  }

  function initMatrix() {
    renderMatrix();

    var pills = document.querySelectorAll(".filter-pill[data-cat]");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        activeCat = pill.dataset.cat;
        pills.forEach(function (p) {
          p.setAttribute("aria-pressed", String(p === pill));
        });
        renderMatrix();
      });
    });

    var body = document.getElementById("matrix-body");
    if (body) {
      body.addEventListener("click", function (e) {
        var row = e.target.closest("[data-idx]");
        if (!row) return;
        var c = CONNECTORS[Number(row.dataset.idx)];
        if (c) openConnectorModal(c);
      });
    }
  }

  /* ---------------- Write-back reliability simulation ---------------- */
  var simRunning = false;

  function strip(cls, icon, text) {
    return '<div class="' + cls + '"><span' +
      (cls === "proof-strip" ? ' class="proof-icon"' : ' aria-hidden="true"') + ">" + icon + "</span>" + text + "</div>";
  }

  function initReliability() {
    var btn = document.getElementById("relia-run");
    var status = document.getElementById("relia-status");
    if (!btn || !status) return;

    var nodes = {
      write: document.getElementById("rn-write"),
      retry: document.getElementById("rn-retry"),
      fallback: document.getElementById("rn-fallback"),
      honest: document.getElementById("rn-honest")
    };
    var conns = [
      document.getElementById("rc-1"),
      document.getElementById("rc-2"),
      document.getElementById("rc-3")
    ];
    var defaultStatus = status.innerHTML;

    function resetFlow() {
      Object.keys(nodes).forEach(function (k) {
        nodes[k].classList.remove("lit", "done", "error");
      });
      conns.forEach(function (c) { c.classList.remove("lit"); });
    }

    btn.addEventListener("click", function () {
      if (simRunning) return;
      simRunning = true;
      btn.disabled = true;
      resetFlow();
      status.innerHTML = "";

      var steps = [
        [0, function () {
          nodes.write.classList.add("lit");
          status.innerHTML = strip("audit-ribbon", window.Envoz.icon("shield"),
            '<span>21:44:07 · <span class="mono">POST /open311/requests</span> · <span class="mono">idempotency_key=env-vr-4281-a1</span></span>');
        }],
        [1400, function () {
          nodes.write.classList.remove("lit");
          nodes.write.classList.add("error");
          status.innerHTML += strip("caution-strip", "⚠",
            "Attempt 1 timed out after 8 seconds. Retrying with the same idempotency key, so a duplicate case cannot be created.");
        }],
        [2800, function () {
          conns[0].classList.add("lit");
          nodes.retry.classList.add("lit");
        }],
        [4200, function () {
          nodes.retry.classList.remove("lit");
          nodes.retry.classList.add("error");
          status.innerHTML += strip("caution-strip", "⚠",
            "Attempts 2–3 failed. Connector marked degraded; on-call engineer notified. Falling back to structured email.");
        }],
        [5600, function () {
          conns[1].classList.add("lit");
          nodes.fallback.classList.add("lit");
        }],
        [7000, function () {
          nodes.fallback.classList.remove("lit");
          nodes.fallback.classList.add("done");
          status.innerHTML += strip("audit-ribbon", window.Envoz.icon("shield"),
            '<span>Structured case packet emailed to <span class="mono">publicworks@vistarobles.gov</span> · reconciliation flag set.</span>');
        }],
        [8400, function () {
          conns[2].classList.add("lit");
          nodes.honest.classList.add("done");
          status.innerHTML += strip("proof-strip", "✓",
            "Resident hears the truth: “Your report is recorded, and the city will text your case number as soon as it’s issued.” No number is invented.");
        }],
        [9800, function () {
          status.innerHTML += strip("proof-strip", "✓",
            "3:12 AM · connector recovered. Queued write replays with the same key; SeeClickFix issues VR-4281 and the resident gets the real number by SMS.");
        }],
        [12400, function () {
          resetFlow();
          status.innerHTML = defaultStatus;
          btn.disabled = false;
          simRunning = false;
        }]
      ];

      steps.forEach(function (s) { setTimeout(s[1], s[0]); });
    });
  }

  /* ---------------- Nico command hooks ---------------- */
  var NICO_FILTERS = [
    [/systems? of record|crm connectors?/i, "record", "Filtering the matrix to systems of record: the CRMs Envoz writes cases into."],
    [/gis|maps? connectors?|arcgis/i, "gis", "Filtering the matrix to GIS & maps: read-only grounding for routing decisions."],
    [/telephony|twilio|telnyx/i, "tel", "Filtering the matrix to telephony: cities keep their existing 311 number."],
    [/knowledge sources?|municode/i, "knowledge", "Filtering the matrix to knowledge sources: every answer cites where it came from."]
  ];

  function initNico() {
    document.addEventListener("nico:command", function (e) {
      var text = e.detail.text || "";
      for (var i = 0; i < NICO_FILTERS.length; i++) {
        if (NICO_FILTERS[i][0].test(text)) {
          activeCat = NICO_FILTERS[i][1];
          document.querySelectorAll(".filter-pill[data-cat]").forEach(function (p) {
            p.setAttribute("aria-pressed", String(p.dataset.cat === activeCat));
          });
          renderMatrix();
          var matrix = document.getElementById("matrix");
          if (matrix) matrix.scrollIntoView({ behavior: "smooth" });
          e.detail.handled = true;
          e.detail.reply = NICO_FILTERS[i][2];
          return;
        }
      }
      if (/simulate.*(outage|api failure)|api outage/i.test(text)) {
        var btn = document.getElementById("relia-run");
        var section = document.getElementById("reliability");
        if (section) section.scrollIntoView({ behavior: "smooth" });
        if (btn && !btn.disabled) setTimeout(function () { btn.click(); }, 600);
        e.detail.handled = true;
        e.detail.reply = "Simulating a CRM API outage: watch the write path retry, fall back to structured email, and stay honest with the resident.";
      }
    });
  }

  /* ---------------- Fill static data-icon placeholders with inline SVG ---------------- */
  function fillIcons(root) {
    if (!window.Envoz || !window.Envoz.icon) return;
    (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
      if (el.getAttribute("data-icon-done")) return;
      el.innerHTML = window.Envoz.icon(el.getAttribute("data-icon"));
      el.setAttribute("data-icon-done", "1");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillIcons();
    initMatrix();
    initReliability();
    initNico();
  });
})();
