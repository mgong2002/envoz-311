/* Trust page — entity explorer, call-to-insight trace, improvement loop embed */
(function () {
  "use strict";

  /* ---- Core data-model concepts (page-only data; shared demo data lives in data.js) ---- */
  var ENTITIES = [
    ["Tenant", "The isolated container for one city: configuration, data, rules, and credentials never cross tenant boundaries."],
    ["Department", "A city work group that owns service types and receives routed cases, like Public Works or Sanitation."],
    ["Service Type", "One taxonomy entry (like pothole_road_hazard) with its routing rules, priority defaults, and SLA targets."],
    ["Service Case", "The structured record of one resident request, written into your CRM or held locally in standalone mode."],
    ["Intent Capture", "The structured read of what the resident is asking for, with candidate service types and a confidence score attached."],
    ["Routing Decision", "The chosen department plus the confidence score and rationale, stored with the case for staff review."],
    ["Geocode Result", "The resolved location with jurisdiction and GIS layer matches: city-maintained, county, or private."],
    ["Case Cluster / Relation", "The similarity match run before a case is created, so a storm surge becomes one parent case with related followers, not forty duplicates."],
    ["Status Transition", "One audited step in a case lifecycle: from, to, timestamp, and the actor who made it happen."],
    ["Workflow", "The ordered steps a case moves through after routing, from acknowledgement to resolution, each step logged."],
    ["CEL Event", "A Continuous Evaluation Loop entry recording what happened and why: the raw material for learning and audit."],
    ["KB Source Citation", "The published city record behind a grounded answer, shown to the resident so trash days and permit hours carry a source."],
    ["Media Intake Token", "A short-lived upload link for photos, held for privacy review (crop, blur, or private) before any public display."],
    ["Contact Point", "A phone number or email the resident chose to share, stored against their consent record."],
    ["Consent Record", "What the resident agreed to: recording disclosure, SMS updates, and how their contact data may be used."],
    ["Notification Subscription", "A resident's opt-in to updates on a specific case or cluster, revocable at any time."],
    ["Outbound Message", "Every SMS or email Envoz sends, logged with template, language, and delivery result."],
    ["External Referral", "A documented handoff to a county, state, or utility partner when the issue is not the city's to fix."],
    ["Tool Call Audit", "The Proxy Gate's record of every system action: caller, tenant scope, parameters, and result."],
    ["Write-back Idempotency", "The retry key that lets a CRM write repeat safely, so a flaky connection never creates two cases for one call."],
    ["Connector Piece", "One integration unit, like the SeeClickFix write API, with its health, retry, and idempotency state."],
    ["Config Session", "A recorded configuration conversation with Nico: the departments, taxonomy, and rules a city set up, versioned and auditable."],
    ["Memory Ladder (city rules · department memory)", "How far a lesson travels once staff approve it: a city-only routing rule, or vocabulary and patterns scoped to a single department."]
  ];

  var DETAIL_DEFAULT = "Select a concept above to see what it stores and why it exists. Every one of these records is tenant-scoped and auditable.";

  /* ---- Entity grid: hover previews, click pins ---- */
  function initEntities() {
    var grid = document.getElementById("entity-grid");
    var detail = document.getElementById("entity-detail");
    if (!grid || !detail) return;

    var pinned = null; // index of the clicked entity, if any

    function show(i) {
      if (i === null) {
        detail.innerHTML = "<span>" + DETAIL_DEFAULT + "</span>";
        return;
      }
      detail.innerHTML =
        '<span class="entity-name">' + ENTITIES[i][0] + "</span><span>" + ENTITIES[i][1] + "</span>";
    }

    ENTITIES.forEach(function (e, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "entity-chip";
      b.textContent = e[0];
      b.title = e[1];
      b.setAttribute("aria-pressed", "false");

      b.addEventListener("mouseenter", function () { show(i); });
      b.addEventListener("focus", function () { show(i); });
      b.addEventListener("mouseleave", function () { show(pinned); });
      b.addEventListener("blur", function () { show(pinned); });
      b.addEventListener("click", function () {
        var wasPinned = pinned === i;
        pinned = wasPinned ? null : i;
        grid.querySelectorAll(".entity-chip").forEach(function (chip, j) {
          chip.setAttribute("aria-pressed", String(pinned === j));
        });
        show(pinned === null ? i : pinned);
      });

      grid.appendChild(b);
    });

    show(null);
  }

  /* ---- "Trace a call" — light the flow nodes in order ---- */
  var tracing = false;
  function traceFlow() {
    if (tracing) return;
    var flow = document.getElementById("call-flow");
    if (!flow) return;
    tracing = true;

    var nodes = flow.querySelectorAll(".wf-node");
    var arrows = flow.querySelectorAll(".flow-arrow");
    nodes.forEach(function (n) { n.classList.remove("lit", "done"); });
    arrows.forEach(function (a) { a.classList.remove("lit"); });

    nodes.forEach(function (n, i) {
      setTimeout(function () {
        n.classList.add("lit");
        if (i > 0) {
          nodes[i - 1].classList.remove("lit");
          nodes[i - 1].classList.add("done");
        }
        if (arrows[i - 1]) arrows[i - 1].classList.add("lit");
        if (i === nodes.length - 1) {
          setTimeout(function () {
            n.classList.remove("lit");
            n.classList.add("done");
            tracing = false;
          }, 700);
        }
      }, 620 * i);
    });
  }

  /* ---- Continuous Evaluation Loop embed ---- */
  function initLoop() {
    var host = document.getElementById("trust-loop-host");
    var btn = document.getElementById("loop-animate-btn");
    if (!host || !window.Envoz) return;
    host.innerHTML = window.Envoz.loopHTML("trust-loop-viz");
    if (btn) {
      btn.addEventListener("click", function () {
        var viz = document.getElementById("trust-loop-viz");
        if (viz) window.Envoz.animateLoop(viz);
      });
    }
  }

  /* ---- Let Nico answer trust-specific commands on this page ---- */
  function initNicoCommands() {
    document.addEventListener("nico:command", function (evt) {
      var text = evt.detail.text || "";
      if (/data model|entit(y|ies)|concept/i.test(text)) {
        evt.detail.handled = true;
        evt.detail.reply = "Here's the Envoz data model: the core concepts, all tenant-scoped and auditable. Hover any of them for details.";
        document.getElementById("data-model").scrollIntoView({ behavior: "smooth" });
        setTimeout(traceFlow, 900);
      } else if (/commitment|never fabricate/i.test(text)) {
        evt.detail.handled = true;
        evt.detail.reply = "These are the ten commitments: design constraints, enforced and audited. Number one: case numbers come only from your CRM, never invented.";
        document.getElementById("commitments").scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  /* ---- Fill data-icon placeholders with shared SVG icons ---- */
  function fillIcons() {
    if (!window.Envoz || !window.Envoz.icon) return;
    document.querySelectorAll("[data-icon]").forEach(function (el) {
      var name = el.getAttribute("data-icon");
      if (name) el.innerHTML = window.Envoz.icon(name);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillIcons();
    initEntities();
    initLoop();
    initNicoCommands();
    var traceBtn = document.getElementById("flow-trace-btn");
    if (traceBtn) traceBtn.addEventListener("click", traceFlow);
  });
})();
