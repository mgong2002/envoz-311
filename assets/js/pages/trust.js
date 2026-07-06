/* Trust page — entity explorer, call-to-insight trace, improvement loop embed */
(function () {
  "use strict";

  /* ---- 20 core entities (page-only data; shared demo data lives in data.js) ---- */
  var ENTITIES = [
    ["Tenant", "The isolated container for one city — configuration, data, rules, and credentials never cross tenant boundaries."],
    ["Department", "A city work group that owns service types and receives routed cases, e.g. Public Works or Sanitation."],
    ["Service Type", "One taxonomy entry (like pothole_road_hazard) with its routing rules, priority defaults, and SLA targets."],
    ["Service Case", "The structured record of one resident request — written into your CRM, or held locally in standalone mode."],
    ["Routing Decision", "The chosen department plus the confidence score and rationale, stored with the case for staff review."],
    ["Geocode Result", "The resolved location with jurisdiction and GIS layer matches — city-maintained, county, or private."],
    ["Dedup Check", "The similarity match run before a case is created, so storm surges become one parent case, not forty."],
    ["Status Transition", "One audited step in a case lifecycle: from, to, timestamp, and the actor who made it happen."],
    ["CEL Event", "A Continuous-Evidence-Log entry recording what happened and why — the raw material for learning and audit."],
    ["Media Intake Token", "A short-lived upload link for photos, held for privacy review (crop, blur, or private) before any public display."],
    ["Contact Point", "A phone number or email the resident chose to share, stored against their consent record."],
    ["Consent Record", "What the resident agreed to: recording disclosure, SMS updates, and how their contact data may be used."],
    ["Notification Subscription", "A resident's opt-in to updates on a specific case or cluster — revocable at any time."],
    ["Outbound Message", "Every SMS or email Envoz sends, logged with template, language, and delivery result."],
    ["External Referral", "A documented handoff to a county, state, or utility partner when the issue is not the city's to fix."],
    ["Tool Call Audit", "The Proxy Gate's record of every system action: caller, tenant scope, parameters, and result."],
    ["Connector Piece", "One integration unit — like the SeeClickFix write API — with its health, retry, and idempotency state."],
    ["Learning Ledger", "The reviewed queue of improvements: evidence, scope, sandbox result, approval, and deployment."],
    ["City Rule", "A city-only routing or vocabulary rule approved by staff — like the storm-drain proximity rule."],
    ["Department Memory", "Vocabulary and patterns learned for one department, scoped to that team and no further."]
  ];

  var DETAIL_DEFAULT = "Select an entity above to see what it stores and why it exists. Every one of these records is tenant-scoped and auditable.";

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

  /* ---- Continuous Civic Improvement Loop embed ---- */
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
      if (/data model|entit(y|ies)/i.test(text)) {
        evt.detail.handled = true;
        evt.detail.reply = "Here's the Envoz data model — 20 tenant-scoped, auditable entities. Hover any of them for details.";
        document.getElementById("data-model").scrollIntoView({ behavior: "smooth" });
        setTimeout(traceFlow, 900);
      } else if (/commitment|never fabricate/i.test(text)) {
        evt.detail.handled = true;
        evt.detail.reply = "These are the ten commitments — design constraints, not aspirations. Number one: never fabricate a case number.";
        document.getElementById("commitments").scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initEntities();
    initLoop();
    initNicoCommands();
    var traceBtn = document.getElementById("flow-trace-btn");
    if (traceBtn) traceBtn.addEventListener("click", traceFlow);
  });
})();
