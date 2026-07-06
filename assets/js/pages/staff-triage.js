/* ============================================================
   Staff Triage console — queue filters, case detail panel,
   unknowns learning queue, CCIL correction walkthrough.
   Reads shared demo data from window.ENVOZ_DATA (never duplicated).
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Page state ---------------- */

  var CASE_ORDER = ["VR-4281", "VR-4293", "VR-4314", "VR-4320", "VR-4317", "VR-4330", "VR-4337", "VR-4342"];

  var QUEUES = ["All", "New", "Needs Review", "Unknowns", "SLA Risk", "Resolved", "External Referrals", "Data Quality"];

  var QUEUE_NOTES = {
    "All": "Every case arrives classified, geo-tagged, and confidence-scored — clean cases, not chaotic transcripts.",
    "New": "Clean, high-confidence cases ready for one-click approval.",
    "Needs Review": "Nico routed these but wants a human eye — ordinance nuance or borderline confidence.",
    "Unknowns": "Below the routing threshold, so Nico refused to guess. Your correction teaches the system — on your terms.",
    "SLA Risk": "The clock is running — earliest deadline first.",
    "Resolved": "Illustrative resolved sample. The full history stays in SeeClickFix, your system of record.",
    "External Referrals": "Outside city jurisdiction — warm-referred with full context so residents never repeat themselves.",
    "Data Quality": "Nico flags data problems before they become resident problems."
  };

  /* Map pin placement per case (demo positions on the schematic GIS panel) */
  var PIN = {
    "VR-4281": { left: "58%", top: "54%", cls: "red" },
    "VR-4293": { left: "34%", top: "42%", cls: "" },
    "VR-4314": { left: "22%", top: "64%", cls: "red" },
    "VR-4317": { left: "68%", top: "36%", cls: "amber" },
    "VR-4320": { left: "46%", top: "70%", cls: "amber" },
    "VR-4330": { left: "52%", top: "50%", cls: "" },
    "VR-4337": { left: "74%", top: "60%", cls: "" },
    "VR-4342": { left: "63%", top: "30%", cls: "amber" }
  };

  /* Small illustrative sets for informational queues (not full cases) */
  var RESOLVED_ROWS = [
    { id: "VR-4262", type: "Pothole / Road Hazard", location: "Alton Pkwy corridor", confidence: 94, priority: "Medium", dept: "Public Works", note: "Resolved Jun 12" },
    { id: "VR-4144", type: "Illegal Dumping / Bulk Waste", location: "Paseo Market alley", confidence: 90, priority: "Medium", dept: "Sanitation", note: "Resolved Jun 16" }
  ];
  var REFERRAL_ROWS = [
    { id: "VR-4306", type: "Freeway Ramp Debris", location: "I-405 SB ramp at Alton", confidence: 88, priority: "Medium", dept: "County Partner", note: "Warm-referred · resident kept one status link" }
  ];

  var cases = {};        // id -> shared data object (read-only)
  var state = {};        // id -> mutable triage state (dept, priority, status, action, rationale, cel…)
  var activeQueue = "All";
  var selectedId = null;
  var celSeq = 2107;
  var dqDone = false;    // data-quality task claimed
  var drawerBody = null;

  var mqNarrow = window.matchMedia("(max-width: 1100px)");

  function celId() { return "CEL-" + (celSeq++); }

  function nowLabel() { return "Just now"; }

  function seedCel(c) {
    var ev = [
      { t: c.time, txt: "Intake via " + c.channel.toLowerCase() + " · safety gate passed" },
      { t: c.time, txt: "Classified “" + c.type + "” · " + c.confidence + "% confidence · rationale logged" }
    ];
    if (c.id === "VR-4317") {
      ev.push({ t: c.time, txt: "Initially routed to Streets · correction pattern flagged (19 similar reroutes in 90 days)" });
    }
    if (c.id === "VR-4342") {
      ev.push({ t: c.time, txt: "Matched Oak Bluff surge cluster · 14 similar reports in 48h" });
    }
    ev.push({ t: c.time, txt: c.proof });
    return ev;
  }

  (window.ENVOZ_DATA.cases || []).forEach(function (c) {
    cases[c.id] = c;
    state[c.id] = {
      dept: c.dept, priority: c.priority, status: c.status, action: c.action,
      rationale: c.rationale, draft: null, ribbon: null, rerouteOpen: false,
      cel: seedCel(c)
    };
  });

  /* ---------------- Small helpers ---------------- */

  function labelize(key) {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, function (m) { return m.toUpperCase(); });
  }

  function priorityHTML(p) {
    if (p === "High") return '<span class="priority-high">High</span>';
    if (p === "Medium") return '<span class="priority-medium">Medium</span>';
    if (p === "Low") return '<span class="priority-low">Low</span>';
    if (p === "Surge Cluster") return '<span class="chip chip-ocean">Surge Cluster</span>';
    return '<span class="chip chip-amber">' + p + "</span>";
  }

  function statusClass(s) {
    if (s === "New") return "status-new";
    if (s === "SLA Risk" || s === "Escalated") return "status-risk";
    if (s === "Approved" || s === "Resolved" || s === "Rerouted" || s === "Corrected" || s === "Merged") return "status-resolved";
    return "status-review";
  }

  function actionChip(a) {
    var cls = "chip-outline";
    if (a === "Approve") cls = "chip-green";
    if (a === "Reroute" || a === "Route") cls = "chip-amber";
    if (a === "Review") cls = "chip-ocean";
    if (/✓|Merged|Escalated/.test(a)) cls = "chip-teal";
    return '<span class="chip ' + cls + '">' + a + "</span>";
  }

  function deptOptions(current) {
    return (window.ENVOZ_DATA.departments || []).map(function (d) {
      var sel = d === current ? " selected" : "";
      return "<option" + sel + ">" + d + "</option>";
    }).join("");
  }

  /* ---------------- Left rail ---------------- */

  function queueCount(q) {
    if (q === "All") return CASE_ORDER.length;
    if (q === "Resolved") return RESOLVED_ROWS.length;
    if (q === "External Referrals") return REFERRAL_ROWS.length;
    if (q === "Data Quality") return 1;
    return CASE_ORDER.filter(function (id) { return cases[id].queue === q; }).length;
  }

  function renderRail() {
    var rail = document.getElementById("queue-rail");
    rail.innerHTML = QUEUES.map(function (q) {
      var pressed = q === activeQueue ? "true" : "false";
      return '<button type="button" class="rail-btn" data-queue="' + q + '" aria-pressed="' + pressed + '">' +
        "<span>" + q + '</span><span class="count">' + queueCount(q) + "</span></button>";
    }).join("");
  }

  /* ---------------- Main table ---------------- */

  function visibleIds() {
    if (activeQueue === "All") return CASE_ORDER;
    return CASE_ORDER.filter(function (id) { return cases[id].queue === activeQueue; });
  }

  function infoRowHTML(r) {
    return '<tr style="color:var(--muted)">' +
      '<td><strong class="mono">' + r.id + '</strong><div class="small status-resolved">' + r.note + "</div></td>" +
      "<td>" + r.type + "</td><td>" + r.location + "</td>" +
      "<td>" + window.Envoz.confidenceChip(r.confidence) + "</td>" +
      "<td>" + priorityHTML(r.priority) + "</td>" +
      "<td>" + r.dept + "</td>" +
      '<td><span class="chip chip-outline">Closed</span></td></tr>';
  }

  function noteRow(html) {
    return '<tr><td colspan="7" style="background:var(--offwhite);color:var(--muted);font-size:.84rem">' + html + "</td></tr>";
  }

  function dqRowHTML() {
    var body = dqDone
      ? '<div class="proof-strip"><span class="proof-icon">✓</span>Cleanup task list created and assigned to Sanitation · logged as LL-1046 in the Learning Ledger.</div>'
      : '<div class="flex flex-wrap" style="gap:8px">' +
        '<button type="button" class="btn btn-primary btn-sm" data-action="dq-task">Create cleanup task list</button>' +
        '<a class="btn btn-ghost btn-sm" href="dashboards.html?tab=cel">View in Learning Ledger →</a></div>';
    return '<tr><td colspan="7">' +
      '<div style="display:flex;flex-direction:column;gap:10px;padding:6px 2px">' +
      '<div class="flex flex-wrap" style="gap:8px"><span class="chip chip-amber">Data quality task</span><span class="chip chip-outline">Assigned · audit LL-1046</span></div>' +
      "<strong>Normalize 17 inconsistent trash-schedule neighborhood names</strong>" +
      '<span class="small" style="color:var(--muted)">Imported from a spreadsheet during onboarding. Inconsistent names cause grounded-answer escalations on trash-day questions — Nico flagged it before residents ever noticed.</span>' +
      body + "</div></td></tr>";
  }

  function rowHTML(c) {
    var st = state[c.id];
    var sel = c.id === selectedId ? " selected" : "";
    return '<tr class="clickable' + sel + '" data-case="' + c.id + '" tabindex="0" role="button" ' +
      'aria-label="Open case ' + c.id + " — " + c.type + '">' +
      '<td><strong class="mono">' + c.id + '</strong><div class="small ' + statusClass(st.status) + '">' + st.status + "</div></td>" +
      "<td>" + c.type + '<div class="small" style="color:var(--muted)">' + c.channel + " · " + c.time + "</div></td>" +
      "<td>" + c.location + "</td>" +
      "<td>" + window.Envoz.confidenceChip(c.confidence) + "</td>" +
      "<td>" + priorityHTML(st.priority) + "</td>" +
      "<td>" + st.dept + "</td>" +
      "<td>" + actionChip(st.action) + "</td></tr>";
  }

  function renderTable() {
    var body = document.getElementById("triage-body");
    var heading = document.getElementById("queue-heading");
    var note = document.getElementById("queue-note");
    var chip = document.getElementById("queue-count-chip");

    heading.textContent = activeQueue === "All" ? "All cases" : activeQueue;
    note.textContent = QUEUE_NOTES[activeQueue];

    if (activeQueue === "Resolved") {
      body.innerHTML = RESOLVED_ROWS.map(infoRowHTML).join("") +
        noteRow("Illustrative resolved sample — Envoz writes the outcome back, but the full case history lives in SeeClickFix, your system of record.");
      chip.textContent = RESOLVED_ROWS.length + " illustrative cases";
      return;
    }
    if (activeQueue === "External Referrals") {
      body.innerHTML = REFERRAL_ROWS.map(infoRowHTML).join("") +
        noteRow("This ramp is state-owned, so no city 311 case was forced through. Nico warm-referred it to the county partner with the transcript and location attached — the resident kept a single status link.");
      chip.textContent = REFERRAL_ROWS.length + " referral this week";
      return;
    }
    if (activeQueue === "Data Quality") {
      body.innerHTML = dqRowHTML();
      chip.textContent = "1 open task";
      return;
    }

    var ids = visibleIds();
    body.innerHTML = ids.map(function (id) { return rowHTML(cases[id]); }).join("") ||
      noteRow("Nothing waiting in this queue right now.");
    chip.textContent = ids.length + (ids.length === 1 ? " case" : " cases");
  }

  function setQueue(q) {
    activeQueue = q;
    var ids = visibleIds();
    if (["Resolved", "External Referrals", "Data Quality"].indexOf(q) === -1 &&
        ids.length && ids.indexOf(selectedId) === -1) {
      selectedId = ids[0];
    }
    renderRail();
    renderTable();
    renderDetail();
  }

  /* ---------------- Case detail panel ---------------- */

  function mapHTML(c) {
    var p = PIN[c.id] || { left: "50%", top: "50%", cls: "" };
    return '<div class="map-panel" style="min-height:150px" role="img" aria-label="Map location of ' + c.id + " at " + c.location + '">' +
      '<div class="map-grid" aria-hidden="true"></div>' +
      '<div class="map-label" style="top:10px;left:10px">Vista Robles GIS</div>' +
      '<div class="map-pin ' + p.cls + '" style="left:' + p.left + ";top:" + p.top + '"><span class="pin-head"></span></div>' +
      '<div class="map-label" style="left:12px;bottom:10px;font-weight:700;color:var(--teal-700)">📍 ' + c.location + "</div></div>";
  }

  function transcriptHTML(c) {
    return '<div class="case-transcript">' + c.transcript.map(function (line) {
      var who = line[0] === "Nico" ? "nico" : "user";
      return '<div class="nico-bubble from-' + who + '"><strong style="font-size:.7rem;display:block;opacity:.75">' + line[0] + "</strong>" + line[1] + "</div>";
    }).join("") + "</div>";
  }

  function fieldsHTML(c) {
    var rows = Object.keys(c.fields).map(function (k) {
      return "<dt>" + labelize(k) + "</dt><dd>" + c.fields[k] + "</dd>";
    }).join("");
    return '<dl class="kv">' + rows + "</dl>";
  }

  function actBtn(action, cls, label, disabled) {
    return '<button type="button" class="btn ' + cls + ' btn-sm" data-action="' + action + '"' +
      (disabled ? " disabled" : "") + ">" + label + "</button>";
  }

  function actionsHTML(c, st) {
    var decided = ["Approved", "Merged", "Corrected"].indexOf(st.status) !== -1;
    var h = "<h4>Decide</h4>" +
      '<div class="flex flex-wrap" style="gap:8px">' +
      actBtn("approve", "btn-primary", st.status === "Approved" ? "Approved ✓" : "✓ Approve route", st.status === "Approved") +
      actBtn("reroute-open", "btn-secondary", "⇄ Reroute…", false) +
      "</div>";
    if (st.rerouteOpen) {
      h += '<div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
        '<select data-reroute aria-label="Choose new department" style="width:auto;min-width:200px">' + deptOptions(st.dept.replace("?", "")) + "</select>" +
        actBtn("reroute-confirm", "btn-navy", "Confirm reroute", false) +
        actBtn("reroute-cancel", "btn-ghost", "Cancel", false) + "</div>";
    }
    h += "<h4>Queue hygiene</h4>" +
      '<div class="flex flex-wrap" style="gap:8px">' +
      actBtn("merge", "btn-secondary", st.status === "Merged" ? "Merged ✓" : "Merge as duplicate", st.status === "Merged") +
      actBtn("related", "btn-secondary", "Keep as related", false) +
      actBtn("escalate", "btn-secondary", "▲ Escalate", st.status === "Escalated") +
      "</div>" +
      "<h4>Teach Nico</h4>" +
      '<div class="flex flex-wrap" style="gap:8px">' +
      actBtn("rule", "btn-secondary", "＋ Add city-only rule", false) +
      actBtn("taxonomy", "btn-secondary", "Submit as taxonomy candidate", false) +
      "</div>";
    void decided;
    return h;
  }

  function detailHTML(c) {
    var st = state[c.id];
    var h = '<div class="case-detail" data-detail-case="' + c.id + '">';

    if (st.ribbon) {
      h += '<div class="audit-ribbon detail-ribbon" tabindex="-1" role="status" style="margin-bottom:14px"><span aria-hidden="true">🛡</span><span>' + st.ribbon + "</span></div>";
    }

    h += '<div class="flex space-between flex-wrap" style="gap:8px">' +
      '<strong class="mono" style="color:var(--navy-900)">' + c.id + "</strong>" +
      '<span class="' + statusClass(st.status) + ' status">' + st.status + "</span></div>" +
      '<h3 style="margin:8px 0 2px;font-size:1.08rem">' + c.type + "</h3>" +
      '<div class="small" style="color:var(--muted)">' + c.location + " · " + c.neighborhood + " · " + c.channel + " · " + c.time + "</div>" +
      '<div class="chip-row" style="margin:10px 0 0">' +
      window.Envoz.confidenceChip(c.confidence) +
      '<span class="chip chip-navy">' + st.dept + "</span>" +
      (st.priority === "High" ? '<span class="chip chip-red">High priority</span>'
        : st.priority === "Medium" ? '<span class="chip chip-amber">Medium priority</span>'
        : '<span class="chip chip-ocean">' + st.priority + "</span>") +
      "</div>";

    h += "<h4>AI summary</h4><p class=\"small\" style=\"margin:0;color:var(--navy-800)\">" + c.summary + "</p>";

    h += "<h4>Transcript excerpt</h4>" + transcriptHTML(c);

    h += "<h4>Extracted fields</h4>" + fieldsHTML(c);

    h += "<h4>Routing</h4><dl class=\"kv\">" +
      "<dt>Category</dt><dd>" + c.type + "</dd>" +
      "<dt>Priority</dt><dd>" + st.priority + "</dd>" +
      "<dt>Department</dt><dd>" + st.dept + "</dd></dl>";

    h += "<h4>Location</h4>" + mapHTML(c);

    h += "<h4>SLA timer</h4>";
    h += c.status === "SLA Risk"
      ? '<div class="caution-strip"><span aria-hidden="true">⏱</span>' + c.sla + "</div>"
      : '<div class="small" style="color:var(--navy-800)"><span class="chip chip-teal">⏱ ' + c.sla + "</span></div>";

    var rationaleVal = st.draft !== null ? st.draft : st.rationale;
    h += "<h4>Why Nico routed it this way <span style=\"text-transform:none;letter-spacing:0\">· editable</span></h4>" +
      '<textarea data-rationale rows="3" aria-label="Edit routing rationale for ' + c.id + '" style="font-size:.85rem">' + rationaleVal + "</textarea>" +
      '<div style="margin-top:8px">' + actBtn("save-rationale", "btn-secondary", "Save rationale", false) + "</div>";

    h += "<h4>Sources</h4>";
    h += c.sources.length
      ? '<div class="chip-row">' + c.sources.map(function (s) { return '<span class="chip chip-source">' + s + "</span>"; }).join("") + "</div>"
      : '<p class="small" style="color:var(--muted);margin:0">No source layers consulted — held in the learning queue until a human routes it.</p>';

    h += "<h4>Proof</h4>" +
      '<div class="proof-strip"><span class="proof-icon">✓</span>' + c.proof + "</div>";

    h += "<h4>Nearby &amp; related</h4>";
    h += c.related.length
      ? '<ul class="small" style="margin:0;color:var(--navy-800)">' + c.related.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul>"
      : '<p class="small" style="color:var(--muted);margin:0">No related cases within 0.5 mi in the last 30 days.</p>';

    if (c.id === "VR-4342" && st.status !== "Merged") {
      h += '<div class="follower-box" style="margin-top:12px"><strong>🔁 13 similar reports — likely one event.</strong> Merge as follower? ' +
        "Followers keep their own status link while crews work one parent case." +
        '<div class="flex flex-wrap" style="gap:8px;margin-top:10px">' +
        actBtn("merge", "btn-navy", "Merge as follower", false) +
        actBtn("related", "btn-ghost", "Keep separate", false) + "</div></div>";
    }

    if (c.id === "VR-4320") {
      h += '<div class="caution-strip" style="margin-top:12px"><span aria-hidden="true">⚠</span><span>Human review required — this case is in the <a href="#learning-queue">unknowns learning queue</a> below.</span></div>';
    }

    h += actionsHTML(c, st);

    h += "<h4>CEL event history</h4><ol class=\"cel-list\">" +
      st.cel.map(function (e) { return '<li><span class="t">' + e.t + "</span><span>" + e.txt + "</span></li>"; }).join("") +
      "</ol>" +
      '<p class="small" style="color:var(--muted);margin-top:10px">Civic Evidence Ledger · every event reversible, versioned, audited · illustrative demo data.</p>';

    h += "</div>";
    return h;
  }

  function renderDetail() {
    var c = cases[selectedId];
    var aside = document.getElementById("case-detail");
    if (!c) { if (aside) aside.innerHTML = ""; return; }
    var html = detailHTML(c);
    if (aside) aside.innerHTML = html;
    if (drawerBody) drawerBody.innerHTML = html;
  }

  /* ---------------- Drawer (narrow screens) ---------------- */

  function closeDrawer() {
    var ov = document.getElementById("triage-drawer-overlay");
    var dr = document.getElementById("triage-drawer");
    if (ov) ov.remove();
    if (dr) dr.remove();
    drawerBody = null;
  }

  function openDrawer() {
    closeDrawer();
    var ov = document.createElement("div");
    ov.className = "drawer-overlay";
    ov.id = "triage-drawer-overlay";
    var dr = document.createElement("div");
    dr.className = "drawer";
    dr.id = "triage-drawer";
    dr.setAttribute("role", "dialog");
    dr.setAttribute("aria-label", "Case detail");
    dr.innerHTML = '<button class="modal-close" type="button" aria-label="Close case detail">✕</button><div class="drawer-body" style="clear:both"></div>';
    document.body.appendChild(ov);
    document.body.appendChild(dr);
    drawerBody = dr.querySelector(".drawer-body");
    ov.addEventListener("click", closeDrawer);
    dr.querySelector(".modal-close").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { closeDrawer(); document.removeEventListener("keydown", esc); }
    });
    renderDetail();
    dr.querySelector(".modal-close").focus();
  }

  function selectCase(id, fromUser) {
    selectedId = id;
    renderTable();
    renderDetail();
    if (fromUser && mqNarrow.matches) openDrawer();
  }

  /* ---------------- Actions ---------------- */

  function pushCel(st, txt) { st.cel.push({ t: nowLabel(), txt: txt }); }

  function rerenderAfterAction(host) {
    renderRail();
    renderTable();
    renderDetail();
    var scope = drawerBody || document.getElementById("case-detail");
    void host;
    if (scope) {
      var ribbon = scope.querySelector(".detail-ribbon");
      if (ribbon) ribbon.focus();
    }
  }

  function doAction(btn) {
    var host = btn.closest("[data-detail-case]");
    var action = btn.getAttribute("data-action");

    if (action === "dq-task") {
      dqDone = true;
      renderTable();
      window.Envoz.nicoSay("Cleanup task list created for the 17 inconsistent trash-schedule neighborhood names — assigned to Sanitation and logged as LL-1046.");
      return;
    }

    if (!host) return;
    var id = host.getAttribute("data-detail-case");
    var c = cases[id];
    var st = state[id];
    if (!c || !st) return;
    var ev = celId();

    switch (action) {
      case "approve":
        st.status = "Approved";
        st.action = "Approved ✓";
        st.rerouteOpen = false;
        st.ribbon = "Route approved → " + st.dept + " · written back to SeeClickFix · <span class=\"mono\">" + ev + "</span> logged.";
        pushCel(st, "Staff approved route to " + st.dept + " · " + ev);
        break;

      case "reroute-open":
        st.rerouteOpen = true;
        break;

      case "reroute-cancel":
        st.rerouteOpen = false;
        break;

      case "reroute-confirm": {
        var sel = host.querySelector("[data-reroute]");
        var newDept = sel ? sel.value : st.dept;
        var oldDept = st.dept;
        st.dept = newDept;
        st.status = "Rerouted";
        st.action = "Rerouted ✓";
        st.rerouteOpen = false;
        st.ribbon = "Rerouted " + oldDept + " → " + newDept + " · correction captured in <span class=\"mono\">" + ev + "</span> — Nico watches for a pattern before proposing any rule.";
        pushCel(st, "Staff rerouted " + oldDept + " → " + newDept + " · correction evidence " + ev);
        break;
      }

      case "merge":
        st.status = "Merged";
        st.action = "Merged ✓";
        st.ribbon = (id === "VR-4342"
          ? "Merged as follower of the Oak Bluff parent case (14 reports → 1 work order). Each resident keeps their own status link. "
          : "Merged as duplicate of the nearest related case. The resident still gets status updates. ") +
          "<span class=\"mono\">" + ev + "</span> logged.";
        pushCel(st, "Merged as " + (id === "VR-4342" ? "follower of Oak Bluff parent case" : "duplicate") + " · " + ev);
        break;

      case "related":
        st.ribbon = "Kept as related — cross-linked, not merged. Nico records the decision so future clusters ask before assuming. <span class=\"mono\">" + ev + "</span> logged.";
        pushCel(st, "Marked related (no merge) · " + ev);
        break;

      case "escalate":
        st.priority = "High";
        st.status = "Escalated";
        st.action = "Escalated ▲";
        st.ribbon = "Escalated to the duty supervisor with full transcript, fields, and map context — no one re-asks the resident anything. <span class=\"mono\">" + ev + "</span> logged.";
        pushCel(st, "Escalated to supervisor · priority raised to High · " + ev);
        break;

      case "rule":
        st.ribbon = "Draft city-only rule created from this case — scoped to Vista Robles, pending staff approval. <a href=\"dashboards.html?tab=agent&rec=rec-storm-drain\">Review in Nico’s queue →</a> <span class=\"mono\">" + ev + "</span>.";
        pushCel(st, "City-only rule drafted (pending approval) · " + ev);
        break;

      case "taxonomy":
        st.ribbon = "Submitted as a global taxonomy candidate — anonymized evidence only. Nothing changes in any city without human review. <span class=\"mono\">" + ev + "</span> logged.";
        pushCel(st, "Submitted as global taxonomy evidence (anonymized) · " + ev);
        break;

      case "save-rationale": {
        var ta = host.querySelector("[data-rationale]");
        if (ta) st.rationale = ta.value.trim() || st.rationale;
        st.draft = null;
        st.ribbon = "Rationale updated by staff · previous version retained · <span class=\"mono\">" + ev + "</span> logged to the CEL.";
        pushCel(st, "Staff edited routing rationale (versioned) · " + ev);
        break;
      }

      default:
        return;
    }
    rerenderAfterAction(host);
  }

  /* ---------------- Unknowns learning queue ---------------- */

  var SCOPE_COPY = {
    "case": "Correction applied to VR-4320 only. The global model is untouched.",
    "rule": "Draft city-only rule created for Vista Robles — “beehive / wasp nest on a transit asset” — pending staff approval in Nico’s recommendation queue.",
    "dept": "Added to department memory — tenant-scoped vocabulary for the receiving department. No other city is affected.",
    "global": "Submitted as anonymized global taxonomy evidence. The review board decides; nothing changes without human approval."
  };

  function initUnknowns() {
    var deptSel = document.getElementById("correct-dept");
    deptSel.innerHTML = deptOptions("Animal / Vector Control");

    var bars = document.getElementById("clf-bars");
    function fillBars() {
      bars.querySelectorAll(".clf-fill").forEach(function (f) {
        f.style.width = f.getAttribute("data-w") + "%";
      });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { setTimeout(fillBars, 250); io.disconnect(); }
        });
      }, { threshold: 0.4 });
      io.observe(bars);
    } else {
      fillBars();
    }

    document.getElementById("apply-correction").addEventListener("click", function () {
      var scopeInput = document.querySelector('input[name="scope"]:checked');
      var scope = scopeInput ? scopeInput.value : "case";
      var dept = deptSel.value;
      var ev = celId();
      var st = state["VR-4320"];
      st.dept = dept;
      st.status = "Corrected";
      st.action = "Routed ✓";
      st.ribbon = "Unknown resolved: routed to " + dept + " · scope: " + scopeInput.closest(".scope-option").querySelector("strong").textContent + " · <span class=\"mono\">" + ev + "</span> logged.";
      pushCel(st, "Staff correction: routed to " + dept + " · scope “" + scope + "” · " + ev);

      var result = document.getElementById("correction-result");
      result.innerHTML =
        '<div class="proof-strip"><span class="proof-icon">✓</span>' + SCOPE_COPY[scope] + "</div>" +
        '<div class="audit-ribbon" style="margin-top:8px"><span aria-hidden="true">🛡</span><span>VR-4320 routed to ' + dept +
        " · <span class=\"mono\">" + ev + "</span> · reversible · versioned · audited. Corrections never blindly overwrite the global model.</span></div>" +
        (scope === "rule"
          ? '<div style="margin-top:10px"><a class="btn btn-secondary btn-sm" href="dashboards.html?tab=agent">Review the drafted rule in Nico’s queue →</a></div>'
          : "");

      renderRail();
      renderTable();
      renderDetail();
    });
  }

  /* ---------------- CCIL walkthrough ---------------- */

  var CCIL_STEPS = [
    ["Correction spotted", "VR-4317 · “Water pooling on Oak Bluff Dr” was initially routed to <strong>Streets</strong>."],
    ["Staff reroute", "A staff member reroutes it to <strong>Utilities</strong> — “water pooling near a storm drain” is usually Utilities in Vista Robles."],
    ["Evidence logged", "The Civic Evidence Ledger captures the correction — who, what, and why — alongside the 19 similar corrections made in the last 90 days."],
    ["Nico proposes a city-only rule", "“When water pooling is reported within 30 feet of a storm-drain asset, route to Utilities unless the resident mentions pavement damage.” Scoped to Vista Robles. Nothing global."],
    ["Staff choose the scope", "Nothing deploys itself. Pick how far this correction reaches:"],
    ["Sandbox proof", ""]
  ];

  var CCIL_OUTCOMES = {
    sandbox: "Sandbox run complete — zero production impact until a human approves.",
    rule: "City-only rule drafted · status: Ready for approval · scoped to Vista Robles only.",
    once: "Correction stays on VR-4317 only — no rule created. Nico keeps the evidence in case the pattern grows."
  };

  function ccilStepHTML(i, s) {
    var extra = "";
    if (i === 4) {
      extra = '<div class="flex flex-wrap" style="gap:8px;margin-top:10px">' +
        '<button type="button" class="btn btn-secondary btn-sm" data-ccil-choice="sandbox">Test in sandbox</button>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-ccil-choice="rule">Create city-only rule</button>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-ccil-choice="once">Keep as one-case correction</button></div>';
    }
    if (i === 5) {
      extra = '<div id="ccil-outcome" style="margin-top:4px"></div>';
    }
    return '<div class="ccil-step" id="ccil-step-' + i + '"><span class="dot">' + (i + 1) + "</span>" +
      '<span style="min-width:0"><strong style="display:block;font-size:.92rem;color:var(--navy-900)">' + s[0] + "</strong>" +
      '<span class="small" style="color:var(--slate-600)">' + s[1] + "</span>" + extra + "</span></div>";
  }

  function openCcil() {
    var html =
      "<h3>How Envoz learns from a staff correction</h3>" +
      '<p class="small" style="color:var(--muted)">Correction → evidence → proposal → human choice → sandbox proof. Six steps, every one audited. Illustrative demo data.</p>' +
      '<div style="margin-top:14px">' +
      CCIL_STEPS.map(function (s, i) { return ccilStepHTML(i, s); }).join('<div class="ccil-connector" aria-hidden="true"></div>') +
      "</div>" +
      '<div class="audit-ribbon" style="margin-top:16px"><span aria-hidden="true">🛡</span><span><strong style="color:#fff">Envoz recommends. City staff approve.</strong> Every change is versioned, sandbox-tested, and audited.</span></div>';
    window.Envoz.openModal(html);

    for (var i = 0; i < 5; i++) {
      (function (idx) {
        setTimeout(function () {
          var el = document.getElementById("ccil-step-" + idx);
          if (el) el.classList.add("lit");
        }, 550 * idx + 300);
      })(i);
    }

    document.querySelectorAll("[data-ccil-choice]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll("[data-ccil-choice]").forEach(function (x) {
          x.classList.toggle("btn-navy", x === b);
          x.classList.toggle("btn-secondary", x !== b);
        });
        var step6 = document.getElementById("ccil-step-5");
        var out = document.getElementById("ccil-outcome");
        if (step6) step6.classList.add("lit");
        if (out) {
          out.innerHTML =
            '<div class="proof-strip"><span class="proof-icon">✓</span>Rule tested against 47 historical cases · expected reroute reduction: 14%.</div>' +
            '<p class="small" style="margin:8px 0;color:var(--slate-600)">' + CCIL_OUTCOMES[b.getAttribute("data-ccil-choice")] + "</p>" +
            '<a class="btn btn-primary btn-sm" href="dashboards.html?tab=agent&rec=rec-storm-drain">Open this recommendation in Dashboards →</a>';
        }
      });
    });
  }

  /* ---------------- Nico command claim ---------------- */

  document.addEventListener("nico:command", function (e) {
    if (/triage/i.test(e.detail.text)) {
      e.detail.handled = true;
      e.detail.reply = "You’re already in the staff triage console — I’ve focused the Needs Review queue. Two cases are waiting for a human decision.";
      setQueue("Needs Review");
      var consoleEl = document.getElementById("console");
      if (consoleEl) consoleEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /* ---------------- Wiring ---------------- */

  document.addEventListener("DOMContentLoaded", function () {
    renderRail();
    selectedId = "VR-4281";
    renderTable();
    renderDetail();
    initUnknowns();

    // Rail filter clicks
    document.getElementById("queue-rail").addEventListener("click", function (e) {
      var b = e.target.closest("[data-queue]");
      if (b) setQueue(b.getAttribute("data-queue"));
    });

    // Table row select (click + keyboard)
    var tbody = document.getElementById("triage-body");
    tbody.addEventListener("click", function (e) {
      if (e.target.closest("[data-action]") || e.target.closest("a")) return;
      var tr = e.target.closest("tr[data-case]");
      if (tr) selectCase(tr.getAttribute("data-case"), true);
    });
    tbody.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var tr = e.target.closest("tr[data-case]");
      if (tr) { e.preventDefault(); selectCase(tr.getAttribute("data-case"), true); }
    });

    // Detail panel actions (works in aside and drawer) + data-quality task
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (btn && !btn.disabled) doAction(btn);
      var ccil = e.target.closest("[data-ccil-open]");
      if (ccil) openCcil();
    });

    // Preserve unsaved rationale edits across re-renders
    document.addEventListener("input", function (e) {
      if (!e.target.matches("[data-rationale]")) return;
      var host = e.target.closest("[data-detail-case]");
      if (host) state[host.getAttribute("data-detail-case")].draft = e.target.value;
    });
  });
})();
