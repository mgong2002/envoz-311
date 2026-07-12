/* ============================================================
   Voice AI for 311 — interactive voice journey player
   Ten scenarios · timed animation · outcome column · demo data
   ============================================================ */
(function () {
  "use strict";

  var D = window.ENVOZ_DATA;

  /* Inline SVG icon shorthand (UI chrome only — never inside transcript bubbles). */
  function icon(name, cls) { return window.Envoz.icon(name, cls); }

  function caseById(id) {
    return D.cases.find(function (c) { return c.id === id; });
  }

  /* ---------------- HTML builders (run at render time) ---------------- */

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }

  function confChipsHTML(pct, rationale, source) {
    var html = window.Envoz.confidenceChip(pct);
    if (rationale) html += ' <span class="chip chip-rationale">' + esc(rationale) + "</span>";
    if (source) html += ' <span class="chip chip-source">' + icon("doc") + " " + esc(source) + "</span>";
    return '<div class="chip-row">' + html + "</div>";
  }

  function caseCardHTML(opts) {
    var priCls = opts.priority === "High" ? "chip-red" : "chip-amber";
    return (
      '<div class="card card-pad-sm">' +
      '<div class="flex space-between"><strong class="mono" style="color:var(--navy-900)">' + esc(opts.id) + "</strong>" +
      '<span class="chip ' + priCls + '">' + esc(opts.priority) + " priority</span></div>" +
      '<h3 style="margin:8px 0 2px;font-size:1.05rem">' + esc(opts.type) + "</h3>" +
      '<div class="small" style="color:var(--muted)">' + esc(opts.location) + " · " + esc(opts.dept) + "</div>" +
      (opts.proof ? '<div class="proof-strip" style="margin-top:10px">' + icon("check", "proof-icon") + esc(opts.proof) + "</div>" : "") +
      (opts.extra || "") +
      "</div>"
    );
  }

  function smsModal(title, msgs, note) {
    var body = msgs.map(function (m) {
      return '<div class="sms-msg ' + (m[0] === "in" ? "in" : "out") + '">' + esc(m[1]) + "</div>";
    }).join("");
    window.Envoz.openModal(
      "<h3>" + esc(title) + "</h3>" +
      '<p class="small" style="color:var(--muted)">Simulated SMS thread · demo data. In production these arrive from your city’s verified 311 number.</p>' +
      '<div class="sms-phone"><div class="sms-head">311 · VISTA ROBLES</div>' + body + "</div>" +
      (note ? '<p class="small" style="color:var(--muted);margin-top:14px">' + note + "</p>" : "")
    );
  }

  function statusModal(caseId, type, doneIdx, extraNote) {
    var steps = ["Received", "Classified & routed", "Staff approved", "Work scheduled", "Resolved"];
    var html = steps.map(function (s, i) {
      var cls = i < doneIdx ? "done" : i === doneIdx ? "active" : "";
      var dot = i < doneIdx ? icon("check") : String(i + 1);
      return '<div class="step ' + cls + '"><span class="step-dot">' + dot + '</span><span class="step-label">' + s + "</span></div>";
    }).join("");
    window.Envoz.openModal(
      "<h3>Status · <span class=\"mono\">" + esc(caseId) + "</span></h3>" +
      '<p class="small" style="color:var(--muted)">' + esc(type) + " · City of Vista Robles · demo data</p>" +
      '<div class="stepper" style="margin:18px 0;justify-content:space-between">' + html + "</div>" +
      '<div class="caution-strip">' + icon("clock") + '<span>Envoz never invents repair dates. This view shows only what the CRM has actually confirmed' +
      (extraNote ? ". " + esc(extraNote) : "") + ".</span></div>" +
      '<div style="margin-top:16px"><button class="btn btn-primary btn-sm" type="button" onclick="Envoz.closeModal()">Done</button></div>'
    );
  }

  /* ---------------- shared action handlers ---------------- */

  var ACTIONS = {
    "photo-4281": function () {
      window.Envoz.openModal(
        "<h3>Add a photo when it’s safe</h3>" +
        '<p>Nico texted a secure one-tap upload link to the caller’s phone. Nothing to install, and no pressure to photograph a live traffic lane.</p>' +
        '<div class="sms-phone"><div class="sms-head">311 · VISTA ROBLES</div>' +
        '<div class="sms-msg in">When it’s safe (not while driving), you can add a photo to case VR-4281: vr311.example/p/4281</div></div>' +
        '<div class="proof-strip" style="margin-top:16px">' + icon("lock", "proof-icon") + 'Photos are screened for faces and plates and held for privacy review, then cropped, blurred, or kept private before any public display. Originals stay tenant-scoped.</div>'
      );
    },
    "track-4281": function () { statusModal("VR-4281", "Pothole / Road Hazard · Public Works", 1, "48h assessment SLA, 21h remaining"); },
    "photo-4293": function () {
      window.Envoz.openModal(
        "<h3>Add a photo to VR-4293</h3>" +
        "<p>A secure upload link was texted to the caller. Photos help Sanitation size the right truck for bulk-waste pickup.</p>" +
        '<div class="proof-strip">' + icon("lock", "proof-icon") + 'Screened for faces and plates and held for privacy review before public display. See Bad-day behaviors below.</div>'
      );
    },
    "track-4293": function () { statusModal("VR-4293", "Illegal Dumping / Bulk Waste · Sanitation", 1, "72h removal SLA, 60h remaining"); },
    "track-4314": function () { statusModal("VR-4314", "Fallen Tree · Parks Maintenance", 2, "24h clearance SLA, 18h remaining"); },
    "track-4342": function () { statusModal("VR-4342", "Storm Drain Backup (provisional) · staff review", 1, "surge triage: monitoring, no ETA promised"); },
    "sms-follow-4317": function () {
      smsModal("Follow case VR-4317", [
        ["in", "You’re now following case VR-4317 (water pooling, Oak Bluff Dr). We’ll text you every status change."],
        ["in", "Current status: Utilities assessment scheduled. No repair date confirmed yet — we’ll tell you when one is."]
      ], "Followers get the same public status the original reporter sees, never the reporter’s personal details.");
    },
    "new-instead": function () {
      window.Envoz.openModal(
        "<h3>Report as new instead</h3>" +
        "<p>If the resident believes it’s a different problem, Nico files a <strong>new case linked to VR-4317</strong> so crews see both together. Nothing is silently merged or discarded.</p>" +
        '<div class="caution-strip">' + icon("layers") + '<span>Linked-duplicate handling keeps queues clean during surges without hiding any resident’s report.</span></div>' +
        '<div style="margin-top:16px" class="flex flex-wrap"><button class="btn btn-primary btn-sm" type="button" onclick="Envoz.closeModal()">Got it</button><a class="btn btn-secondary btn-sm" href="staff-triage.html">See duplicates in staff triage</a></div>'
      );
    },
    "sms-es-4330": function () {
      smsModal("Estado por SMS · VR-4330", [
        ["in", "Su reporte VR-4330 (luz de la calle, cruce escolar en Maple y la calle 3) fue enviado a Transporte. Prioridad elevada por zona escolar."],
        ["in", "Le avisaremos por SMS con cada cambio de estado — en español."]
      ], "Status updates continue in the language of the original call.");
    },
    "track-4330": function () { statusModal("VR-4330", "Streetlight Outage · Transportation · school-zone flag", 1, "5 business day SLA, on track"); },
    "surge-view": null, /* rendered as link */
    "text-routed-4320": function () {
      smsModal("Text me when it’s routed", [
        ["in", "Thanks for reporting the beehive at Jeffrey Transit Stop. It’s filed as case VR-4320 and a 311 specialist is reviewing it today."],
        ["in", "We’ll text you the moment it’s re-typed and routed to the right team."]
      ], "Unknowns are never forced into a wrong category just to close the call. A case number is always issued so nothing gets lost.");
    },
    "why-no-case": function () {
      window.Envoz.openModal(
        "<h3>Why no 311 case for an emergency?</h3>" +
        "<p>A downed, sparking wire is a life-safety event. Creating an ordinary 311 case would put it in a queue behind potholes, so Envoz refuses to.</p>" +
        "<ul style=\"line-height:2\"><li><strong>Immediate 911 guidance</strong>, stated clearly and repeated.</li>" +
        "<li><strong>No fabricated case number</strong>: a number would falsely imply the city has dispatched help.</li>" +
        "<li><strong>Outcome <span class=\"mono\">EMERGENCY_REDIRECTED</span></strong> is still logged to the CEL, so leaders can see emergency call volume.</li>" +
        "<li>The resident is invited to call back for cleanup and non-urgent follow-up once safe.</li></ul>" +
        '<div class="safety-strip">' + icon("warning") + '<span>Red is reserved for emergencies across the entire product. It always means 911, never a queue.</span></div>' +
        '<div style="margin-top:16px" class="flex flex-wrap"><a class="btn btn-primary btn-sm" href="trust.html">Safety &amp; escalation policy</a><button class="btn btn-secondary btn-sm" type="button" onclick="Envoz.closeModal()">Close</button></div>'
      );
    },
    "sms-schedule": function () {
      smsModal("Text me the schedule", [
        ["out", "Text me my trash schedule"],
        ["in", "Oak Bluff: trash + recycling every Thursday, carts out by 6 AM. Next pickup: Thu Jul 9. Source: City trash schedule (updated Jun 2026)."]
      ], "Grounded answers always cite their source. If the schedule data were stale, Nico would say so instead of guessing.");
    },
    "holiday-reminders": function () {
      smsModal("Holiday shift reminders", [
        ["out", "Remind me when pickup shifts for holidays"],
        ["in", "Done — you’ll get a text the week of any holiday that moves Oak Bluff pickup (next: Labor Day week, pickup slides to Friday Sep 11)."]
      ]);
    },
    "sms-caltrans": function () {
      smsModal("Caltrans referral link", [
        ["in", "Your ramp-meter report was referred to Caltrans District 12 with the location and a summary — you won’t need to repeat yourself."],
        ["in", "Track it here: csr.dot.example/ref/VR-REF-1188 · Caltrans D12: (949) 555-0123. Reply HELP anytime and we’ll re-check ownership."]
      ]);
    },
    "city-owned-after-all": function () {
      window.Envoz.openModal(
        "<h3>What if it’s actually city-owned?</h3>" +
        "<p>Warm referrals are logged, not forgotten. Reference <span class=\"mono\">VR-REF-1188</span> stays in the city’s referral ledger:</p>" +
        "<ul style=\"line-height:2\"><li>If Caltrans bounces it back as city-owned, the referral converts to a normal 311 case <strong>with the original call attached</strong>.</li>" +
        "<li>Staff corrections to ownership boundaries feed the CEL Ledger, so the GIS jurisdiction layer improves.</li>" +
        "<li>The resident keeps one thread the whole way, with no dead ends and no “call someone else.”</li></ul>" +
        '<div style="margin-top:14px" class="flex flex-wrap"><a class="btn btn-primary btn-sm" href="dashboards.html?tab=cel">See the CEL Ledger</a><button class="btn btn-secondary btn-sm" type="button" onclick="Envoz.closeModal()">Close</button></div>'
      );
    }
  };

  /* ---------------- scenario definitions ---------------- */
  /* Event kinds: {u|n: text, note?} bubble · {step:{ic,cls,html}} ·
     {pin:true} · {chips:{pct,rat,src}} · {outcome:html} ·
     {actions:[{label,act|href,primary?}]} · {audit:html} · d = ms before event */

  var SCENARIOS = [

    /* 1 — Pothole (default) */
    (function () {
      var c = caseById("VR-4281");
      return {
        id: "pothole", pill: "Pothole / road hazard", pillIcon: "warning",
        title: "Pothole / road hazard", time: "9:42 PM",
        meta: [["chip-amber", "After-hours"], ["chip-ocean", "Voice call"]],
        map: {
          streets: [["Alton Pkwy", "bottom:36px;left:12%"], ["Irvine Center Dr", "top:28%;right:8%"]],
          pin: { x: "54%", y: "58%", cls: "" },
          pinLabel: ["Resolved · city-maintained", "left:26%;top:66%"]
        },
        events: [
          { u: "I hit a huge pothole near the Alton ramp and almost swerved." },
          { n: "I can help report that. First, is anyone hurt or in immediate danger?" },
          { u: "No, everyone's fine — but it's really deep." },
          { step: { ic: "shield", cls: "ok", html: "<strong>Safety gate cleared</strong> · no injuries or immediate danger reported." } },
          { n: "Glad you're safe. Is this closer to Irvine Center Drive or Mesa Ridge?" },
          { u: "Irvine Center Drive, right by the ramp." },
          { pin: true },
          { step: { ic: "pin", cls: "info", html: "<strong>Location resolved</strong> · " + c.location + " · GIS road ownership layer." }, d: 500 },
          { step: { ic: "layers", cls: "ok", html: "<strong>Duplicate check</strong> · 1 related: " + c.related[0] + ". Not a duplicate." } },
          { step: { ic: "route", cls: "ok", html: "<strong>Jurisdiction</strong> · city-maintained roadway → " + c.dept + "." } },
          { chips: { pct: c.confidence, rat: c.rationale } },
          { n: "Got it — I've reported a high-priority pothole at Alton Parkway and Irvine Center Drive. Your case number is VR-4281, and I'm texting you a status link now." },
          { outcome: caseCardHTML({ id: c.id, type: c.type, location: c.location, dept: c.dept, priority: "High", proof: c.proof }) },
          { actions: [
            { label: "Add photo when safe", ic: "doc", act: "photo-4281" },
            { label: "Track status", ic: "bell", act: "track-4281", primary: true }
          ], d: 700 },
          { audit: 'CEL event logged · <span class="mono">SERVICE_REQUEST_CREATED</span> · VR-4281 · 21:44 PT', d: 700 }
        ]
      };
    })(),

    /* 2 — Illegal dumping */
    (function () {
      var c = caseById("VR-4293");
      return {
        id: "dumping", pill: "Illegal dumping / bulk waste", pillIcon: "wrench",
        title: "Illegal dumping / bulk waste", time: "7:12 AM",
        meta: [["chip-ocean", "Voice call"]],
        map: {
          streets: [["Paseo Market Corridor", "top:24%;left:10%"], ["Service alley", "bottom:40px;left:34%"]],
          pin: { x: "38%", y: "52%", cls: "" },
          pinLabel: ["Public right-of-way", "left:44%;top:58%"]
        },
        events: [
          { u: "Somebody dumped a mattress and bags behind Paseo Market again." },
          { n: "Thanks for reporting it. Is anything hazardous — sharp objects, anything leaking, or anyone in danger?" },
          { u: "No, it's just junk. It's blocking a parking spot in the alley." },
          { step: { ic: "shield", cls: "ok", html: "<strong>Safety gate cleared</strong> · no hazard to people; standard bulk-waste removal." } },
          { pin: true },
          { step: { ic: "pin", cls: "info", html: "<strong>Location resolved</strong> · " + c.location + " · alley alias matched to public right-of-way." }, d: 500 },
          { step: { ic: "layers", cls: "warn", html: "<strong>Duplicate check</strong> · 2 prior dumping cases in this alley (VR-4201, VR-4144). New incident; repeat-location pattern flagged for Sanitation." } },
          { step: { ic: "route", cls: "ok", html: "<strong>Jurisdiction</strong> · public right-of-way → " + c.dept + "." } },
          { chips: { pct: c.confidence, rat: c.rationale } },
          { n: "I've filed it — case VR-4293 with Sanitation, and I noted this alley has had repeat dumping so they can consider a camera or signage." },
          { outcome: caseCardHTML({ id: c.id, type: c.type, location: c.location, dept: c.dept, priority: "Normal", proof: c.proof }) },
          { actions: [
            { label: "Add photo", ic: "doc", act: "photo-4293" },
            { label: "Track status", ic: "bell", act: "track-4293", primary: true }
          ], d: 700 },
          { audit: 'CEL event logged · <span class="mono">SERVICE_REQUEST_CREATED</span> · VR-4293 · 07:14 PT · repeat-location pattern noted', d: 700 }
        ]
      };
    })(),

    /* 3 — Water leak (dedupe → follow vs new) */
    {
      id: "water", pill: "Water leak", pillIcon: "warning",
      title: "Water leak / pooling", time: "9:01 PM",
      meta: [["chip-amber", "After-hours"], ["chip-ocean", "Voice call"]],
      map: {
        streets: [["Oak Bluff Dr", "top:30%;left:8%"], ["Canyon Way", "bottom:36px;right:12%"]],
        pin: { x: "58%", y: "48%", cls: "" },
        pinLabel: ["Near storm drain SD-2214", "left:30%;top:56%"]
      },
      events: [
        { u: "There's water bubbling up out of the street on Oak Bluff Drive — I think a pipe is leaking." },
        { n: "Thanks for calling it in. Is water entering any home or garage, or flooding the roadway?" },
        { u: "No, it's just running along the curb." },
        { step: { ic: "shield", cls: "ok", html: "<strong>Safety gate cleared</strong> · no flooding of structures or roadway." } },
        { n: "Got it. Is it near the corner with Canyon Way, by the storm drain?" },
        { u: "Yes, right by the drain grate." },
        { pin: true },
        { step: { ic: "pin", cls: "info", html: "<strong>Location resolved</strong> · Oak Bluff Dr near storm drain #SD-2214 · GIS storm-drain asset layer." }, d: 500 },
        { step: { ic: "layers", cls: "warn", html: "<strong>Duplicate check</strong> · open case <strong>VR-4317 · Water Pooling</strong>, same block, reported 8:20 PM. Likely the same water." } },
        { n: "There's already an open case for water at that exact spot — VR-4317, reported about 40 minutes ago. I can add you as a follower so you get every update, or file a separate report if you think it's a different problem. Which would you like?" },
        { u: "Follow the existing one, please." },
        { step: { ic: "route", cls: "ok", html: "<strong>Jurisdiction</strong> · Utilities, per the storm-drain proximity rule city staff approved in June." } },
        { chips: { pct: 88, rat: "Matches open case within 120 ft; storm-drain proximity suggests Utilities." } },
        { outcome:
          '<div class="card card-pad-sm">' +
          '<div class="flex space-between"><strong class="mono" style="color:var(--navy-900)">VR-4317</strong><span class="chip chip-teal">Following</span></div>' +
          '<h3 style="margin:8px 0 2px;font-size:1.05rem">Water Pooling · existing case</h3>' +
          '<div class="small" style="color:var(--muted)">Oak Bluff Dr near storm drain #SD-2214 · Utilities</div>' +
          '<div class="proof-strip" style="margin-top:10px">' + icon("check", "proof-icon") + 'Added as follower to VR-4317 · SMS status link sent at 9:03 PM</div></div>' },
        { actions: [
          { label: "Text me updates on VR-4317", ic: "phone", act: "sms-follow-4317", primary: true },
          { label: "Report as new instead", act: "new-instead" }
        ], d: 700 },
        { audit: 'CEL event logged · <span class="mono">STATUS_PROVIDED</span> · VR-4317 · 21:03 PT · follower added to the existing case', d: 700 }
      ]
    },

    /* 4 — Fallen tree */
    (function () {
      var c = caseById("VR-4314");
      return {
        id: "tree", pill: "Fallen tree", pillIcon: "warning",
        title: "Fallen tree", time: "6:02 AM",
        meta: [["chip-ocean", "Voice call"]],
        map: {
          streets: [["Harbor View Park", "top:22%;left:10%"], ["East trail", "bottom:44px;right:14%"]],
          pin: { x: "50%", y: "44%", cls: "" },
          pinLabel: ["Parks asset boundary", "left:56%;top:50%"]
        },
        events: [
          { u: "There's a big tree down across the trail at Harbor View Park." },
          { n: "Is the tree touching any power lines, or is anyone trapped or hurt?" },
          { u: "No wires, nobody hurt. It's just blocking the whole trail." },
          { step: { ic: "shield", cls: "ok", html: "<strong>Safety gate cleared</strong> · no wires involved, no one trapped or injured." } },
          { pin: true },
          { step: { ic: "pin", cls: "info", html: "<strong>Location resolved</strong> · " + c.location + " · parks asset layer." }, d: 500 },
          { step: { ic: "layers", cls: "warn", html: "<strong>Duplicate check</strong> · related: " + c.related[0] + ". Different asset, likely the same windstorm, so a new case is filed and linked." } },
          { step: { ic: "route", cls: "ok", html: "<strong>Jurisdiction</strong> · inside park boundary → " + c.dept + "." } },
          { chips: { pct: c.confidence, rat: c.rationale } },
          { n: "Reported — case VR-4314 with Parks Maintenance, high priority since the trail is fully blocked. Crews see it alongside the branch report from earlier this morning." },
          { outcome: caseCardHTML({ id: c.id, type: c.type, location: c.location, dept: c.dept, priority: "High", proof: c.proof }) },
          { actions: [
            { label: "Track status", ic: "bell", act: "track-4314", primary: true },
            { label: "Open staff triage view", href: "staff-triage.html" }
          ], d: 700 },
          { audit: 'CEL event logged · <span class="mono">SERVICE_REQUEST_CREATED</span> · VR-4314 · 06:03 PT · linked to VR-4311', d: 700 }
        ]
      };
    })(),

    /* 5 — Streetlight outage, Spanish */
    (function () {
      var c = caseById("VR-4330");
      return {
        id: "streetlight", pill: "Streetlight · Spanish call", pillIcon: "globe",
        title: "Streetlight outage · school crosswalk", time: "8:51 PM",
        meta: [["chip-amber", "After-hours"], ["chip-purple", "Español"]],
        map: {
          streets: [["Maple St", "top:26%;left:10%"], ["3rd St · School Zone South", "bottom:38px;right:8%"]],
          pin: { x: "56%", y: "56%", cls: "" },
          pinLabel: ["Pole TL-0921 · school zone", "left:20%;top:64%"]
        },
        events: [
          { u: "La luz de la calle está apagada en el cruce de la escuela.", note: "“The streetlight is out at the school crossing.”" },
          { step: { ic: "globe", cls: "lang", html: "<strong>Language detected · Español</strong> · 94% language confidence. Conversation continues in Spanish." }, d: 600 },
          { n: "Gracias por avisar. Primero, ¿hay alguien herido o en peligro en este momento?", note: "“Thanks for letting us know. First, is anyone hurt or in danger right now?”" },
          { u: "No, pero el cruce queda muy oscuro cuando salen los niños.", note: "“No, but the crossing gets very dark when the kids come out.”" },
          { step: { ic: "shield", cls: "ok", html: "<strong>Safety gate cleared</strong> · no immediate danger; visibility concern noted." } },
          { n: "¿Está cerca de la escuela primaria, en Maple y la calle 3?", note: "“Is it near the elementary school, at Maple and 3rd?”" },
          { u: "Sí, justo en el cruce peatonal.", note: "“Yes, right at the pedestrian crosswalk.”" },
          { pin: true },
          { step: { ic: "pin", cls: "info", html: "<strong>Location resolved</strong> · pole TL-0921 at Maple &amp; 3rd · streetlight asset layer." }, d: 500 },
          { step: { ic: "layers", cls: "ok", html: "<strong>Duplicate check</strong> · no open cases on this pole." } },
          { step: { ic: "route", cls: "ok", html: "<strong>Jurisdiction</strong> · city-owned luminaire → " + c.dept + " · <strong>school-zone flag raises priority</strong>." } },
          { chips: { pct: c.confidence, rat: c.rationale } },
          { n: "Listo — reporté la luz apagada en el cruce escolar. Su número de caso es VR-4330 y le enviaré el estado por SMS, en español.", note: "“Done — I reported the light out at the school crossing. Your case number is VR-4330; I'll text you status updates in Spanish.”" },
          { outcome: caseCardHTML({ id: c.id, type: c.type, location: c.location, dept: c.dept, priority: "Normal", proof: c.proof,
            extra: '<div class="chip-row" style="margin-top:10px"><span class="chip chip-purple">' + icon("globe") + ' Español · 94% language confidence</span><span class="chip chip-amber">School-zone priority</span></div>' }) },
          { actions: [
            { label: "Recibir estado por SMS", ic: "phone", act: "sms-es-4330", primary: true },
            { label: "Track status", ic: "bell", act: "track-4330" }
          ], d: 700 },
          { audit: 'CEL event logged · <span class="mono">SERVICE_REQUEST_CREATED</span> · VR-4330 · 20:53 PT · lang=es', d: 700 }
        ]
      };
    })(),

    /* 6 — After-hours storm drain backup */
    (function () {
      var c = caseById("VR-4342");
      return {
        id: "storm", pill: "Storm drain backup · after-hours", pillIcon: "chart",
        title: "Storm drain backup · surge night", time: "10:31 PM",
        meta: [["chip-amber", "After-hours"], ["chip-navy", "Storm surge active"]],
        map: {
          streets: [["Oak Bluff Dr", "top:26%;left:8%"], ["Canyon Way", "bottom:38px;right:10%"]],
          cluster: { x: "56%", y: "50%" },
          pin: { x: "56%", y: "50%", cls: "amber" },
          pinLabel: ["14-report cluster · Oak Bluff", "left:24%;top:60%"]
        },
        events: [
          { u: "The storm grate on our corner is burbling and water's coming back up." },
          { n: "Is water entering any home or garage right now?" },
          { u: "No, it's staying in the gutter so far." },
          { step: { ic: "shield", cls: "ok", html: "<strong>Safety gate cleared</strong> · no water in structures; monitoring guidance given." } },
          { pin: true },
          { step: { ic: "pin", cls: "info", html: "<strong>Location resolved</strong> · " + c.location + "." }, d: 500 },
          { step: { ic: "warning", cls: "warn", html: "<strong>Surge cluster</strong> · 14 similar “storm grate burbling” reports within 0.5 mi in 48 hours. Likely one storm event." } },
          { step: { ic: "route", cls: "warn", html: "<strong>Jurisdiction</strong> · routed to Public Works on a 0.64 match, then held by the surge-cluster monitor. 14 similar reports in 48h are likely one event, not fourteen cases." } },
          { chips: { pct: c.confidence, rat: c.rationale } },
          { n: "I've created case VR-4342 and flagged it for staff review with the full cluster context. If water starts entering your home, call back immediately — that changes everything." },
          { outcome: caseCardHTML({ id: c.id, type: "Storm Drain Backup (provisional)", location: c.location, dept: "Public Works · staff review", priority: "Normal", proof: c.proof,
            extra: '<div class="caution-strip" style="margin-top:10px">' + icon("warning") + '<span>Routed on a 0.64 match, then held by the surge-cluster monitor with the transcript and 14-report context. No guess was forced.</span></div>' }) },
          { actions: [
            { label: "Track status", ic: "bell", act: "track-4342", primary: true },
            { label: "See the surge cluster", ic: "chart", href: "dashboards.html?tab=performance&mode=surge" }
          ], d: 700 },
          { audit: 'CEL event logged · <span class="mono">SERVICE_REQUEST_CREATED</span> · VR-4342 · 22:33 PT · flagged to the Unknowns queue · cluster n=14', d: 700 }
        ]
      };
    })(),

    /* 7 — Unknown: beehive in bus shelter */
    (function () {
      var c = caseById("VR-4320");
      return {
        id: "beehive", pill: "Unknown · beehive in bus shelter", pillIcon: "flag",
        title: "Unknown request · beehive in bus shelter", time: "3:45 PM",
        meta: [["chip-ocean", "Voice call"], ["chip-amber", "Unknowns queue"]],
        map: {
          streets: [["Jeffrey Transit Stop", "top:28%;left:12%"], ["School Zone South", "bottom:38px;right:10%"]],
          pin: { x: "46%", y: "50%", cls: "amber" },
          pinLabel: ["Transit shelter (city asset)", "left:52%;top:56%"]
        },
        events: [
          { u: "There's a basketball-sized beehive in the bus shelter." },
          { n: "Thanks — is anyone being stung or having an allergic reaction right now?" },
          { u: "No, people are just avoiding the shelter." },
          { step: { ic: "shield", cls: "ok", html: "<strong>Safety gate cleared</strong> · no active stings or allergic reactions." } },
          { pin: true },
          { step: { ic: "pin", cls: "info", html: "<strong>Location resolved</strong> · " + c.location + " · transit asset layer." }, d: 500 },
          { step: { ic: "layers", cls: "ok", html: "<strong>Duplicate check</strong> · no similar open reports." } },
          { step: { ic: "warning", cls: "warn", html: "<strong>No confident taxonomy match</strong> · candidates: Parks Maintenance 41% · Code Enforcement 33% · Animal / Vector Control 29%. All below the 0.60 routing threshold." } },
          { chips: { pct: 41, rat: "Below the 0.60 routing threshold; not forced into a wrong category." } },
          { n: "Honestly, this one doesn't fit a category I'm confident about, so I'd rather not guess. I've filed it as case VR-4320 and a person will review it today. I'll text you the moment it's routed to the right team." },
          { outcome:
            '<div class="card card-pad-sm">' +
            '<div class="flex space-between"><strong class="mono" style="color:var(--navy-900)">VR-4320</strong><span class="chip chip-amber">Unknowns queue</span></div>' +
            '<h3 style="margin:8px 0 2px;font-size:1.05rem">Filed as other_unknown</h3>' +
            '<div class="small" style="color:var(--muted)">Jeffrey Transit Stop · awaiting human re-type</div>' +
            '<div class="proof-strip" style="margin-top:10px">' + icon("check", "proof-icon") + 'VR-4320 issued · a person reviews it today, then routes it to the right team</div>' +
            '<p class="small" style="margin:10px 0 0;color:var(--muted)">Unknowns teach the system. If staff approve it, “hive or nest in a city asset” becomes a real category with a real owner.</p></div>' },
          { actions: [
            { label: "See it in staff triage", ic: "doc", href: "staff-triage.html", primary: true },
            { label: "Text me when it's routed", ic: "phone", act: "text-routed-4320" }
          ], d: 700 },
          { audit: 'CEL event logged · <span class="mono">NO_STRUCTURED_OUTPUT</span> · filed as other_unknown · VR-4320 issued · Unknowns queue · 15:45 PT', d: 700 }
        ]
      };
    })(),

    /* 8 — Emergency misdial: downed wire */
    {
      id: "emergency", pill: "Emergency misdial · downed wire", pillIcon: "shield",
      title: "Emergency misdial · downed wire", time: "8:12 PM",
      meta: [["chip-red", "Emergency detected"]],
      map: {
        streets: [["Routine mapping suspended", "top:44%;left:50%;transform:translate(-50%,-50%);color:var(--red-700);border-color:rgba(180,35,24,.35)"]],
        pin: null
      },
      events: [
        { u: "I meant to call about a tree branch, but a power line just came down across the street and it's sparking." },
        { step: { ic: "warning", cls: "alert", html: "<strong>Safety gate: life-safety hazard detected.</strong> Downed, energized wire. Routine intake halted." }, d: 700 },
        { n: "That's a life-safety emergency. Please hang up and call 911 right now. Stay far away from the wire, keep others away, and don't touch anything in contact with it — including fences and water." },
        { n: "I'm not creating a routine report while you may be in danger. Once everyone is safe, call us back and I'll handle the cleanup and the tree branch." },
        { step: { ic: "warning", cls: "alert", html: "<strong>Pipeline halted</strong> · location, duplicate, and routing steps are suspended during emergencies." } },
        { outcome:
          '<div class="safety-strip">' + icon("warning") + '<span><strong>Downed wire → 911 guidance given.</strong> No ordinary 311 case was created. Emergencies are never queued behind potholes, and no case number was fabricated.</span></div>' +
          '<p class="small" style="margin:10px 0 0;color:var(--muted)">Outcome code <span class="mono">EMERGENCY_REDIRECTED</span> · utility notified via standing protocol · resident invited to call back for non-urgent follow-up.</p>' },
        { actions: [
          { label: "Why no 311 case?", act: "why-no-case", primary: true },
          { label: "Safety & escalation policy", href: "trust.html" }
        ], d: 700 },
        { audit: 'CEL event logged · <span class="mono">EMERGENCY_REDIRECTED</span> · no case number issued · 20:12 PT', d: 700 }
      ]
    },

    /* 9 — Trash day lookup (grounded answer) */
    {
      id: "trash", pill: "Trash day lookup", pillIcon: "doc",
      title: "Trash day lookup · grounded answer", time: "10:04 AM",
      meta: [["chip-ocean", "Voice call"], ["chip-teal", "Knowledge answer"]],
      map: {
        streets: [["Oak Bluff", "top:26%;left:12%"], ["Canyon Way", "bottom:40px;right:14%"]],
        pin: { x: "50%", y: "46%", cls: "" },
        pinLabel: ["Oak Bluff service area", "left:56%;top:52%"]
      },
      events: [
        { u: "What day does trash pickup come to my street?" },
        { step: { ic: "shield", cls: "ok", html: "<strong>Safety gate</strong> · informational request; no safety screening needed." }, d: 600 },
        { n: "Happy to check. What street or neighborhood are you in?" },
        { u: "Oak Bluff, on Canyon Way." },
        { pin: true },
        { step: { ic: "pin", cls: "info", html: "<strong>Neighborhood resolved</strong> · Oak Bluff · Sanitation service-area layer." }, d: 500 },
        { step: { ic: "doc", cls: "ok", html: "<strong>Grounded lookup</strong> · answer drawn from the city trash schedule, not from guesswork. No case needed." } },
        { step: { ic: "route", cls: "ok", html: "<strong>Jurisdiction</strong> · city Sanitation service area." } },
        { chips: { pct: 96, rat: "Exact schedule match for Oak Bluff.", src: "City trash schedule · updated Jun 2026" } },
        { n: "Trash and recycling in Oak Bluff are collected every Thursday — carts out by 6 AM. Your next pickup is Thursday, July 9. Want me to text you the schedule?" },
        { u: "Yes, please." },
        { outcome:
          '<div class="card card-pad-sm">' +
          '<h3 style="margin:0 0 4px;font-size:1.05rem">Grounded answer, no case needed</h3>' +
          '<p class="small" style="margin:0 0 10px">Oak Bluff: trash + recycling <strong>every Thursday, carts out by 6 AM</strong>. Next pickup: Thu Jul 9.</p>' +
          '<div class="chip-row"><span class="chip chip-source">' + icon("doc") + ' City trash schedule · updated Jun 2026</span></div>' +
          '<div class="proof-strip" style="margin-top:10px">' + icon("check", "proof-icon") + 'Schedule texted to the caller at 10:05 AM</div></div>' },
        { actions: [
          { label: "Text me the schedule", ic: "phone", act: "sms-schedule", primary: true },
          { label: "Holiday shift reminders", ic: "bell", act: "holiday-reminders" }
        ], d: 700 },
        { audit: 'CEL event logged · <span class="mono">INFORMATION_ANSWERED</span> · source: trash schedule (Jun 2026) · 10:05 PT', d: 700 }
      ]
    },

    /* 10 — External ownership referral */
    {
      id: "referral", pill: "State-owned asset · warm referral", pillIcon: "route",
      title: "Ramp meter · Caltrans referral", time: "4:10 PM",
      meta: [["chip-ocean", "Voice call"], ["chip-navy", "External jurisdiction"]],
      map: {
        streets: [["I-5 on-ramp (state-owned)", "top:24%;right:8%"], ["Alton Pkwy (city)", "bottom:38px;left:10%"]],
        pin: { x: "62%", y: "42%", cls: "amber" },
        pinLabel: ["Caltrans District 12 asset", "left:18%;top:50%"]
      },
      events: [
        { u: "The metering signal on the I-5 on-ramp at Alton has been flashing red for two days." },
        { n: "Thanks for flagging it. Is it causing a crash risk right now — cars stopping suddenly or backing onto the freeway?" },
        { u: "No, traffic's just slower than usual getting on." },
        { step: { ic: "shield", cls: "ok", html: "<strong>Safety gate cleared</strong> · congestion, not an immediate hazard." } },
        { pin: true },
        { step: { ic: "pin", cls: "info", html: "<strong>Location resolved</strong> · I-5 NB on-ramp at Alton Pkwy." }, d: 500 },
        { step: { ic: "layers", cls: "ok", html: "<strong>Duplicate check</strong> · no open city or referral records for this ramp." } },
        { step: { ic: "route", cls: "warn", html: "<strong>Jurisdiction</strong> · GIS ownership layer shows the ramp meter is a <strong>Caltrans District 12</strong> asset, not city-maintained." } },
        { chips: { pct: 90, rat: "Ramp meter is a state asset; city crews cannot service it." } },
        { n: "That signal is maintained by Caltrans, not the city — but you're not on your own. I've sent Caltrans a warm referral with the exact location and a summary of what you told me, and I'm texting you their reference link and phone number now." },
        { outcome:
          '<div class="card card-pad-sm">' +
          '<h3 style="margin:0 0 4px;font-size:1.05rem">Warm referral → Caltrans District 12</h3>' +
          '<div class="small" style="color:var(--muted)">I-5 NB on-ramp at Alton Pkwy · ramp meter fault</div>' +
          '<div class="proof-strip" style="margin-top:10px">' + icon("check", "proof-icon") + 'Referral sent with location + transcript summary at 4:12 PM · reference VR-REF-1188</div>' +
          '<p class="small" style="margin:10px 0 0;color:var(--muted)">No dead ends: a city case is created and logged with an external_referral record, and if Caltrans bounces it back it stays a city case with the original call attached.</p></div>' },
        { actions: [
          { label: "Text me the Caltrans link", ic: "phone", act: "sms-caltrans", primary: true },
          { label: "What if it's city-owned after all?", act: "city-owned-after-all" }
        ], d: 700 },
        { audit: 'CEL event logged · <span class="mono">SERVICE_REQUEST_CREATED</span> · logged with an external_referral record · Caltrans D12 · VR-REF-1188 · 16:12 PT', d: 700 }
      ]
    }
  ];

  /* ---------------- player engine ---------------- */

  var runToken = 0;
  var current = SCENARIOS[0];
  var els = {};

  function bubble(who, text, note) {
    var b = document.createElement("div");
    b.className = "nico-bubble from-" + who;
    b.textContent = text;
    els.transcript.appendChild(b);
    if (note) {
      var n = document.createElement("div");
      n.className = "vo-note from-" + who;
      n.textContent = note;
      els.transcript.appendChild(n);
    }
    els.transcript.scrollTop = els.transcript.scrollHeight;
  }

  function speak(ms) {
    els.wave.classList.add("speaking");
    clearTimeout(speak.t);
    speak.t = setTimeout(function () { els.wave.classList.remove("speaking"); }, ms || 1500);
  }

  function addStep(s) {
    var el = document.createElement("div");
    el.className = "vo-step " + (s.cls || "");
    el.innerHTML = '<span class="ic" aria-hidden="true">' + icon(s.ic) + "</span><span>" + s.html + "</span>";
    els.steps.appendChild(el);
  }

  function dropPin() {
    var m = current.map;
    if (!m || !m.pin) return;
    var html = "";
    if (m.cluster) {
      html += '<div class="vo-cluster" style="left:' + m.cluster.x + ";top:" + m.cluster.y + '"></div>';
    }
    html += '<div class="map-pin ' + (m.pin.cls || "") + '" style="left:' + m.pin.x + ";top:" + m.pin.y + '"><span class="pin-head"></span></div>';
    if (m.pinLabel) {
      html += '<div class="map-label" style="' + m.pinLabel[1] + ';font-weight:700;color:var(--teal-700)">' + esc(m.pinLabel[0]) + "</div>";
    }
    els.pinSlot.innerHTML = html;
  }

  function renderActions(list) {
    els.actions.innerHTML = "";
    list.forEach(function (a) {
      var cls = "btn btn-sm " + (a.primary ? "btn-primary" : "btn-secondary");
      var el;
      if (a.href) {
        el = document.createElement("a");
        el.href = a.href;
      } else {
        el = document.createElement("button");
        el.type = "button";
        el.addEventListener("click", function () {
          var fn = ACTIONS[a.act];
          if (fn) fn();
        });
      }
      el.className = cls;
      if (a.ic) el.innerHTML = icon(a.ic) + " " + esc(a.label);
      else el.textContent = a.label;
      els.actions.appendChild(el);
    });
  }

  function runEvent(ev) {
    if (ev.u) { bubble("user", ev.u, ev.note); return; }
    if (ev.n) { bubble("nico", ev.n, ev.note); speak(Math.min(2600, 900 + ev.n.length * 14)); return; }
    if (ev.step) { addStep(ev.step); return; }
    if (ev.pin) { dropPin(); return; }
    if (ev.chips) {
      var el = document.createElement("div");
      el.className = "vo-step";
      el.style.border = "none";
      el.style.background = "transparent";
      el.style.padding = "2px 0";
      el.innerHTML = confChipsHTML(ev.chips.pct, ev.chips.rat, ev.chips.src);
      els.steps.appendChild(el);
      return;
    }
    if (ev.outcome) { els.outcome.innerHTML = ev.outcome; return; }
    if (ev.actions) { renderActions(ev.actions); return; }
    if (ev.audit) {
      els.audit.innerHTML = '<div class="audit-ribbon">' + icon("shield") + '<span>' + ev.audit + "</span></div>";
      return;
    }
  }

  function durationOf(ev) {
    var text = ev.u || ev.n;
    if (text) return Math.min(3000, 1000 + text.length * 20);
    return 950;
  }

  function play(id) {
    var sc = SCENARIOS.find(function (s) { return s.id === id; }) || SCENARIOS[0];
    current = sc;
    var token = ++runToken;

    /* reset UI */
    els.title.textContent = sc.title + " · " + sc.time;
    els.meta.innerHTML = sc.meta.map(function (m) {
      return '<span class="chip ' + m[0] + '">' + esc(m[1]) + "</span>";
    }).join("");
    els.transcript.innerHTML = "";
    els.steps.innerHTML = "";
    els.outcome.innerHTML = '<p class="small" style="color:var(--muted);margin:0">Outcome appears here as the call plays…</p>';
    els.actions.innerHTML = "";
    els.audit.innerHTML = "";
    els.pinSlot.innerHTML = "";
    els.streets.innerHTML = (sc.map && sc.map.streets ? sc.map.streets : []).map(function (s) {
      return '<div class="map-label" style="' + s[1] + '">' + esc(s[0]) + "</div>";
    }).join("");

    /* update pills */
    Array.prototype.forEach.call(els.pills.querySelectorAll(".filter-pill"), function (p) {
      p.setAttribute("aria-pressed", String(p.dataset.scenario === sc.id));
    });

    /* schedule events — ev.d overrides the gap after the previous event */
    var t = 500;
    var prev = null;
    sc.events.forEach(function (ev) {
      t += ev.d != null ? ev.d : (prev ? durationOf(prev) : 0);
      (function (delay) {
        setTimeout(function () {
          if (token !== runToken) return;
          runEvent(ev);
        }, delay);
      })(t);
      prev = ev;
    });
  }

  function playAndScroll(id) {
    var player = document.getElementById("player");
    if (player) player.scrollIntoView({ behavior: "smooth", block: "start" });
    play(id);
  }

  /* ---------------- init ---------------- */

  document.addEventListener("DOMContentLoaded", function () {
    /* Fill HTML-authored icon slots (hero, call header, bad-day/accessibility tiles). */
    Array.prototype.forEach.call(document.querySelectorAll("[data-icon]"), function (el) {
      var n = el.getAttribute("data-icon");
      if (n) el.innerHTML = icon(n);
    });

    els = {
      title: document.getElementById("vo-call-title"),
      meta: document.getElementById("vo-call-meta"),
      wave: document.getElementById("vo-wave"),
      transcript: document.getElementById("vo-transcript"),
      steps: document.getElementById("vo-steps"),
      outcome: document.getElementById("vo-outcome"),
      actions: document.getElementById("vo-actions"),
      audit: document.getElementById("vo-audit"),
      pinSlot: document.getElementById("vo-pin-slot"),
      streets: document.getElementById("vo-map-streets"),
      pills: document.getElementById("scenario-pills")
    };
    if (!els.pills) return;

    /* scenario picker pills */
    SCENARIOS.forEach(function (sc) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-pill";
      b.dataset.scenario = sc.id;
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "Play scenario: " + sc.title);
      b.innerHTML = icon(sc.pillIcon || "phone") + " <span>" + esc(sc.pill) + "</span>";
      b.addEventListener("click", function () { play(sc.id); });
      els.pills.appendChild(b);
    });

    /* replay + hero play buttons */
    document.getElementById("vo-replay").addEventListener("click", function () { play(current.id); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-play-demo]"), function (btn) {
      btn.addEventListener("click", function () { playAndScroll(btn.dataset.playDemo); });
    });

    /* Nico command contract: claim pothole demo locally */
    document.addEventListener("nico:command", function (e) {
      if (/pothole/i.test(e.detail.text)) {
        e.detail.handled = true;
        e.detail.reply = "Running the pothole demo right here — watch the 9:42 PM call become case VR-4281.";
        playAndScroll("pothole");
      }
    });

    /* URL param: ?demo=pothole auto-scrolls and auto-plays */
    if (window.Envoz.param("demo") === "pothole") {
      setTimeout(function () { playAndScroll("pothole"); }, 400);
    } else {
      /* pothole is the default scenario */
      setTimeout(function () { play("pothole"); }, 600);
    }
  });
})();
