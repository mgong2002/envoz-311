/* Customer Success / Council Proof — agent status panel + interactive 90-day timeline */
(function () {
  "use strict";

  /* ---------------- 90-day improvement timeline (page-only data) ---------------- */
  var PHASES = [
    {
      when: "Week 1",
      title: "Stand up & validate",
      milestone: "Milestone: sandbox validated, writeback proven",
      items: [
        "Configure your top 10 services against the city taxonomy",
        "Run sandbox calls end-to-end — no production traffic yet",
        "Validate system-of-record writeback (real case numbers, e.g. SeeClickFix)",
        "Identify dirty data before it can cause a single misroute"
      ]
    },
    {
      when: "Weeks 2–4",
      title: "Capture & listen",
      milestone: "Milestone: first service-gap list delivered",
      items: [
        "Capture after-hours requests that used to become voicemail",
        "Monitor routing confidence on every live case",
        "Start the staff correction loop — every reroute becomes evidence",
        "Build the first service-gap list from real resident demand"
      ]
    },
    {
      when: "Weeks 5–8",
      title: "Learn & improve",
      milestone: "Milestone: first approved city rules live",
      items: [
        "Approve the first city-only routing rules (sandbox-tested)",
        "Add local language and landmark vocabulary",
        "Reduce the unknown-service rate as the taxonomy learns",
        "Improve SLA-risk alerts so supervisors intervene earlier"
      ]
    },
    {
      when: "Weeks 9–12",
      title: "Prove & plan",
      milestone: "Milestone: council proof report presented",
      items: [
        "Generate the council proof report from live evidence",
        "Show access gains: after-hours coverage and language reach",
        "Show efficiency gains and equity / service coverage",
        "Deliver the next-quarter improvement plan"
      ]
    }
  ];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function icon(name) { return (window.Envoz && window.Envoz.icon) ? window.Envoz.icon(name) : ""; }

  function fillIcons() {
    var nodes = document.querySelectorAll("[data-icon]");
    Array.prototype.forEach.call(nodes, function (el) {
      if (!el.dataset.iconFilled) {
        el.innerHTML = icon(el.getAttribute("data-icon"));
        el.dataset.iconFilled = "1";
      }
    });
  }

  function renderTimeline() {
    var grid = document.getElementById("phase-grid");
    if (!grid) return;

    grid.innerHTML = PHASES.map(function (p, i) {
      var open = i === 0;
      return (
        '<div class="phase-card' + (open ? " open" : "") + '" data-phase="' + i + '">' +
        '<button class="phase-head" type="button" aria-expanded="' + open + '" aria-controls="phase-panel-' + i + '">' +
        '<span class="phase-dot" aria-hidden="true">' + (i + 1) + "</span>" +
        '<span class="phase-when">' + esc(p.when) + "</span>" +
        '<span class="phase-title">' + esc(p.title) + "</span>" +
        '<span class="phase-caret" aria-hidden="true">▾</span>' +
        "</button>" +
        '<div class="phase-panel" id="phase-panel-' + i + '"' + (open ? "" : " hidden") + ">" +
        "<ul>" + p.items.map(function (it) {
          return '<li><span class="tick">' + icon("check") + "</span><span>" + esc(it) + "</span></li>";
        }).join("") + "</ul>" +
        '<span class="chip chip-green">' + esc(p.milestone) + "</span>" +
        "</div></div>"
      );
    }).join("");

    grid.addEventListener("click", function (e) {
      var head = e.target.closest(".phase-head");
      if (!head || !grid.contains(head)) return;
      togglePhase(head.closest(".phase-card"));
    });
  }

  function togglePhase(card) {
    var head = card.querySelector(".phase-head");
    var panel = card.querySelector(".phase-panel");
    var willOpen = panel.hidden;
    panel.hidden = !willOpen;
    card.classList.toggle("open", willOpen);
    head.setAttribute("aria-expanded", String(willOpen));
  }

  /* ---------------- Nico's improvement recommendations panel (from shared demo data) ---------------- */
  function renderAgentStats() {
    var host = document.getElementById("agent-stats");
    if (!host || !window.ENVOZ_DATA || !window.ENVOZ_DATA.agent) return;
    var a = window.ENVOZ_DATA.agent;

    var statusChip = document.getElementById("agent-status");
    if (statusChip) statusChip.textContent = a.status;

    var rows = [
      ["Current focus", a.focus],
      ["Last program review", a.lastReview],
      ["Recommendation confidence", a.confidence],
      ["Open recommendations", a.openRecs],
      ["Ready for city approval", a.readyForApproval],
      ["Next council update", a.nextCouncilUpdate]
    ];
    host.innerHTML = rows.map(function (r) {
      return '<div class="agent-stat"><span>' + esc(r[0]) + '</span><span class="v">' + esc(r[1]) + "</span></div>";
    }).join("");
  }

  /* ---------------- Nico command hook: let this page claim its own topics ---------------- */
  function initNicoHook() {
    document.addEventListener("nico:command", function (e) {
      var text = e.detail.text || "";
      if (/before.?after|scorecard|90.?day|timeline|case study/i.test(text)) {
        var target =
          /scorecard/i.test(text) ? "scorecard" :
          /timeline/i.test(text) ? "timeline" :
          /case study|90.?day/i.test(text) ? "case-study" : "before-after";
        var el = document.getElementById(target);
        if (el) {
          e.detail.handled = true;
          e.detail.reply = "Scrolling you to that section — all figures here are illustrative demo data for Vista Robles.";
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillIcons();
    renderTimeline();
    renderAgentStats();
    initNicoHook();
  });
})();
