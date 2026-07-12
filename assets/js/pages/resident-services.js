/* ============================================================
   Resident Services — filterable, expandable service catalog
   (Vista Robles demo configuration; page-only data lives here,
   departments come from window.ENVOZ_DATA.departments)
   ============================================================ */
(function () {
  "use strict";

  function ic(name) {
    return (window.Envoz && window.Envoz.icon) ? window.Envoz.icon(name) : "";
  }

  var CATEGORIES = [
    ["Roads & Transportation", "Streets, signals, sidewalks, and everything residents drive or walk past."],
    ["Utilities & Water", "Leaks, backups, drains, and hydrants, with main-vs-private checks built in."],
    ["Clean & Safe", "Dumping, graffiti, missed pickups, and vector control."],
    ["Parks & Public Spaces", "Trees, trails, restrooms, playgrounds, and irrigation."],
    ["Code & Community", "Quality-of-life concerns handled with care and a services-first posture."],
    ["Info / Knowledge", "Grounded answers from city sources: no case created, nothing guessed."]
  ];

  /* Each service:
     dept: null = grounded knowledge answer, no case
     photo: "required" | "optional" | "na"
     flags: gis (ownership check uses a GIS/asset layer),
            referral (external referral possible),
            review (low-confidence human review gate)            */
  var SERVICES = [

    /* ---------- Roads & Transportation ---------- */
    { id: "pothole", name: "Pothole / Road Hazard", cat: "Roads & Transportation", dept: "Public Works",
      required: ["Location", "Hazard size & depth", "Lane position"],
      sla: "48h assessment · same-day if traffic hazard", ownership: "GIS road ownership layer",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "I hit a huge pothole near the Alton ramp and almost swerved.",
      dupe: "Open pothole cases within 250 ft are surfaced first — residents can follow the existing case instead of opening a duplicate.",
      source: null, gis: true, referral: true, review: false },

    { id: "streetlight", name: "Streetlight Outage", cat: "Roads & Transportation", dept: "Transportation",
      required: ["Nearest address or pole ID", "Outage type (dark / flickering)", "School-zone proximity"],
      sla: "5 business days · same-day review in school zones", ownership: "Streetlight asset layer (city vs utility pole)",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "La luz de la calle está apagada en el cruce de la escuela.",
      dupe: "Pole-ID matching closes duplicates automatically; school-zone reports raise priority on the existing case.",
      source: null, gis: true, referral: true, review: false },

    { id: "signal", name: "Traffic Signal Malfunction", cat: "Roads & Transportation", dept: "Transportation",
      required: ["Intersection", "Malfunction type (dark / flashing / stuck)", "Traffic backing up?"],
      sla: "2h dispatch target", ownership: "Signal asset layer + state-route check",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "The light at Alton and 3rd has been stuck on red for ten minutes.",
      dupe: "Intersection-level matching keeps one parent case per signal; later callers get status instead of a new case.",
      source: null, gis: true, referral: true, review: false },

    { id: "sidewalk", name: "Sidewalk Damage", cat: "Roads & Transportation", dept: "Public Works",
      required: ["Location", "Trip-height estimate", "Cause if known (e.g. tree root)"],
      sla: "10 business days assessment", ownership: "Sidewalk + parcel frontage layer",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "The sidewalk in front of 412 Oak Bluff has lifted about two inches.",
      dupe: "Segment matching within 100 ft; tree-root damage links to the street-tree inventory for a combined work order.",
      source: null, gis: true, referral: false, review: false },

    { id: "abandoned-vehicle", name: "Abandoned Vehicle", cat: "Roads & Transportation", dept: "Code Enforcement",
      required: ["Location", "Vehicle description", "Days stationary", "Plate if visible"],
      sla: "72h tag-and-notice", ownership: "Public right-of-way check (street centerline)",
      channels: ["Voice", "Web", "SMS"], photo: "required",
      prompt: "A gray sedan with flat tires has been parked on our street for nine days.",
      dupe: "Plate or description match on the same block reuses the open case — and its 72-hour ordinance clock.",
      source: "Municode §10.32 (72-hour rule)", gis: true, referral: false, review: false },

    { id: "sweeping", name: "Street Sweeping Issue", cat: "Roads & Transportation", dept: "Public Works",
      required: ["Block or route", "Issue type (missed / blocked / debris left)"],
      sla: "Next sweep cycle · 5 business days", ownership: "Sweep route layer",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "Our street was skipped on sweeping day again this week.",
      dupe: "Route-day matching groups reports from the same block into a single route ticket.",
      source: "City sweeping schedule", gis: true, referral: false, review: false },

    /* ---------- Utilities & Water ---------- */
    { id: "water-leak", name: "Water Leak", cat: "Utilities & Water", dept: "Utilities",
      required: ["Location", "Severity (drip / stream / gushing)", "Street side or private side?"],
      sla: "4h dispatch for active leaks", ownership: "Water utility layer (main vs private lateral)",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "Water is bubbling up through the street near my driveway.",
      dupe: "Leaks within 150 ft of an active repair attach to the existing work order instead of paging a second crew.",
      source: null, gis: true, referral: true, review: false },

    { id: "sewer-backup", name: "Sewer Backup", cat: "Utilities & Water", dept: "Utilities",
      required: ["Address", "Backup location (inside / cleanout / street)", "Multiple homes affected?"],
      sla: "2h emergency dispatch", ownership: "Sewer main layer (main vs private lateral)",
      channels: ["Voice", "Web"], photo: "optional",
      prompt: "Sewage is coming up in my shower drain and my neighbor has it too.",
      dupe: "Two or more addresses on one main escalates to a mainline blockage — one crew, one parent case.",
      source: null, gis: true, referral: true, review: false },

    { id: "storm-drain", name: "Storm Drain Blockage", cat: "Utilities & Water", dept: "Utilities",
      required: ["Nearest drain or corner", "Standing-water extent", "Weather context"],
      sla: "24h assessment · surge triage during storms", ownership: "Storm-drain asset layer",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "The storm grate on our corner is burbling and water’s coming back up.",
      dupe: "Surge clustering: 14 similar reports in 48h become one parent event with followers, not 14 cases.",
      source: null, gis: true, referral: false, review: true },

    { id: "hydrant", name: "Hydrant Issue", cat: "Utilities & Water", dept: "Utilities",
      required: ["Hydrant location or ID", "Issue type (leaking / damaged / opened)"],
      sla: "24h inspection · immediate if sheared", ownership: "Hydrant asset layer (city vs water district)",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "A fire hydrant on Mesa Ridge is leaking steadily at the base.",
      dupe: "Hydrant-ID matching; district-owned hydrants trigger a warm referral instead of a misfiled city case.",
      source: null, gis: true, referral: true, review: false },

    { id: "power-outage", name: "Power Outage Referral", cat: "Utilities & Water", dept: "County Partner",
      required: ["Address", "Outage extent (home / block)", "Any downed wires? (safety gate)"],
      sla: "Immediate warm referral", ownership: "None — electric utility service territory",
      channels: ["Voice", "Web", "SMS"], photo: "na",
      prompt: "The power is out on our whole block — is that the city?",
      dupe: "No city case is created — Nico shares the utility’s outage line and map link; wires down means 911 first.",
      source: "Utility outage map", gis: false, referral: true, review: false },

    /* ---------- Clean & Safe ---------- */
    { id: "dumping", name: "Illegal Dumping / Bulk Waste", cat: "Clean & Safe", dept: "Sanitation",
      required: ["Location", "Items description", "Blocking access?"],
      sla: "72h removal", ownership: "Public right-of-way check",
      channels: ["Voice", "Web", "SMS"], photo: "required",
      prompt: "Somebody dumped a mattress and bags behind Paseo Market again.",
      dupe: "Alley-level matching links repeat-dumping reports into a hotspot file — evidence for enforcement, not clutter.",
      source: "Municode §8.12", gis: true, referral: false, review: false },

    { id: "graffiti", name: "Graffiti", cat: "Clean & Safe", dept: "Public Works",
      required: ["Location & surface", "Size estimate", "Offensive content? (raises priority)"],
      sla: "5 business days · 48h if offensive", ownership: "Parcel layer (public vs private surface)",
      channels: ["Voice", "Web", "SMS"], photo: "required",
      prompt: "There’s graffiti on the sound wall along Alton Parkway.",
      dupe: "Same-surface matching within 50 ft; private-property tags route to a Code Enforcement notice instead.",
      source: null, gis: true, referral: false, review: false },

    { id: "trash-missed", name: "Trash Missed Pickup", cat: "Clean & Safe", dept: "Sanitation",
      required: ["Address", "Cart type (trash / recycle / green)", "Cart was out by 6 AM?"],
      sla: "Next-day recovery pickup", ownership: "Collection route layer",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "My recycling cart was never emptied yesterday.",
      dupe: "Whole-street misses roll up into one route ticket instead of dozens of identical cases.",
      source: "City trash schedule", gis: true, referral: false, review: false },

    { id: "dead-animal", name: "Dead Animal", cat: "Clean & Safe", dept: "Animal / Vector Control",
      required: ["Location", "Animal type / size", "In the roadway?"],
      sla: "24h removal", ownership: "GIS road ownership layer",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "There’s a deer on the shoulder of Canyon Way near the trailhead.",
      dupe: "Location-and-species matching within 200 ft prevents duplicate dispatches; highway shoulders refer to Caltrans.",
      source: null, gis: true, referral: true, review: false },

    { id: "rodent", name: "Rodent / Pest Concern", cat: "Clean & Safe", dept: "Animal / Vector Control",
      required: ["Address or area", "Pest type", "Public or private property?"],
      sla: "5 business days inspection", ownership: "Parcel layer",
      channels: ["Voice", "Web"], photo: "optional",
      prompt: "We’re seeing rats around the storm channel behind our homes.",
      dupe: "Area clustering flags vector-control zones for block-level treatment instead of one-off visits.",
      source: null, gis: true, referral: true, review: true },

    /* ---------- Parks & Public Spaces ---------- */
    { id: "fallen-tree", name: "Fallen Tree", cat: "Parks & Public Spaces", dept: "Parks Maintenance",
      required: ["Location", "Blocking a path or road?", "Wires involved? (safety gate)"],
      sla: "24h clearance · immediate if blocking a road", ownership: "Parks asset layer + street-tree inventory",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "There’s a big tree down across the trail at Harbor View Park.",
      dupe: "Storm-event grouping: nearby limb and tree reports attach to one parent event; wires involved means 911 and the utility first.",
      source: null, gis: true, referral: true, review: false },

    { id: "restroom", name: "Park Restroom Issue", cat: "Parks & Public Spaces", dept: "Parks Maintenance",
      required: ["Park & restroom location", "Issue type (locked / plumbing / cleanliness)"],
      sla: "24h response", ownership: "Parks asset layer",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "The restroom at Harbor View Park has been locked all weekend.",
      dupe: "Facility-ID matching; repeat reports raise priority on the open case instead of duplicating it.",
      source: null, gis: true, referral: false, review: false },

    { id: "playground", name: "Playground Damage", cat: "Parks & Public Spaces", dept: "Parks Maintenance",
      required: ["Park & equipment", "Damage description", "Injury risk?"],
      sla: "48h safety assessment · same-day if hazardous", ownership: "Parks asset layer",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "A swing chain is broken at the Mesa Ridge playground.",
      dupe: "Equipment-level matching; hazard flags fast-track the existing case rather than opening a second one.",
      source: null, gis: true, referral: false, review: false },

    { id: "trail", name: "Trail Obstruction", cat: "Parks & Public Spaces", dept: "Parks Maintenance",
      required: ["Trail name & nearest marker", "Obstruction type", "Still passable?"],
      sla: "72h clearance", ownership: "Trails layer (city vs open-space district)",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "A rockslide is covering half the east trail past marker 4.",
      dupe: "Trail-segment matching; obstructions on open-space-district segments get a warm referral with the location attached.",
      source: null, gis: true, referral: true, review: false },

    { id: "irrigation", name: "Irrigation Issue", cat: "Parks & Public Spaces", dept: "Parks Maintenance",
      required: ["Park or median location", "Issue type (broken head / running water / dry turf)"],
      sla: "5 business days · 24h if water is running", ownership: "Parks irrigation asset layer",
      channels: ["Voice", "Web", "SMS"], photo: "optional",
      prompt: "Sprinklers at the Civic Center median have been running for hours.",
      dupe: "Controller-zone matching groups reports on the same irrigation zone into one work order.",
      source: null, gis: true, referral: false, review: false },

    /* ---------- Code & Community ---------- */
    { id: "noise", name: "Noise Complaint", cat: "Code & Community", dept: "Code Enforcement",
      required: ["Address or area", "Noise type & timing", "Ongoing or recurring?"],
      sla: "72h follow-up · active disturbances go to the non-emergency line", ownership: "Parcel layer",
      channels: ["Voice", "Web"], photo: "na",
      prompt: "Construction has been starting before 7 AM all week on our street.",
      dupe: "Recurring complaints on the same parcel build one case history — pattern evidence, not pile-up.",
      source: "Municode §9.40 quiet hours", gis: true, referral: false, review: true },

    { id: "str", name: "Short-Term Rental Concern", cat: "Code & Community", dept: "Code Enforcement",
      required: ["Property address", "Concern type (parties / parking / unpermitted)", "Dates observed"],
      sla: "10 business days case review", ownership: "Parcel layer + STR registry",
      channels: ["Voice", "Web"], photo: "optional",
      prompt: "The house next door seems to be an unpermitted vacation rental.",
      dupe: "Registry matching links reports to the property’s compliance file; repeat reports strengthen one case.",
      source: "Municode §5.88 STR ordinance", gis: true, referral: false, review: true },

    { id: "encampment", name: "Encampment Outreach Referral", cat: "Code & Community", dept: "Code Enforcement",
      required: ["Location", "Approximate size", "Immediate safety concern?"],
      sla: "48h outreach referral", ownership: "Jurisdiction check (city vs county land)",
      channels: ["Voice", "Web"], photo: "na",
      prompt: "There’s a new encampment forming under the Alton overpass.",
      dupe: "Location matching links reports to the active outreach file — a services-first response, coordinated with the county team.",
      source: null, gis: true, referral: true, review: true },

    { id: "signage", name: "Business Signage Concern", cat: "Code & Community", dept: "Code Enforcement",
      required: ["Business address", "Sign type (banner / A-frame / digital)", "Blocking the sidewalk?"],
      sla: "10 business days review", ownership: "Parcel layer",
      channels: ["Voice", "Web"], photo: "optional",
      prompt: "A shop on Paseo Market has an A-frame sign blocking the sidewalk.",
      dupe: "Parcel matching; sidewalk-obstruction flags add an accessibility priority to the open case.",
      source: "Municode §17.30 sign code", gis: true, referral: false, review: false },

    /* ---------- Info / Knowledge (grounded answers, no case) ---------- */
    { id: "trash-day", name: "Trash Day Lookup", cat: "Info / Knowledge", dept: null,
      required: ["Address"],
      sla: "Answered in-call", ownership: "None — knowledge",
      channels: ["Voice", "Web", "SMS"], photo: "na",
      prompt: "When is trash day on Mesa Ridge Road?",
      dupe: "No case created — the answer is grounded in the current collection schedule, never guessed.",
      source: "City trash schedule", gis: false, referral: false, review: false },

    { id: "permit-status", name: "Permit Status", cat: "Info / Knowledge", dept: null,
      required: ["Permit number or address"],
      sla: "Answered in-call", ownership: "None — knowledge",
      channels: ["Voice", "Web"], photo: "na",
      prompt: "Can you check the status of my patio permit?",
      dupe: "No case created — status is read live from the permit system; an unclear record goes to staff instead of a guess.",
      source: "Permit system (read-only)", gis: false, referral: false, review: true },

    { id: "park-hours", name: "Park Hours", cat: "Info / Knowledge", dept: null,
      required: ["Park name"],
      sla: "Answered in-call", ownership: "None — knowledge",
      channels: ["Voice", "Web", "SMS"], photo: "na",
      prompt: "What time does Harbor View Park close tonight?",
      dupe: "No case created — seasonal hours come from the Parks page and refresh whenever the page changes.",
      source: "Parks page", gis: false, referral: false, review: false },

    { id: "closures", name: "Street Closure Information", cat: "Info / Knowledge", dept: null,
      required: ["Street or area", "Date of travel"],
      sla: "Answered in-call", ownership: "None — knowledge",
      channels: ["Voice", "Web", "SMS"], photo: "na",
      prompt: "Is Alton Parkway still closed for the resurfacing project?",
      dupe: "No case created — if a closure isn’t in the feed, Nico says so and offers a callback; dates are never invented.",
      source: "Public Works closure feed", gis: false, referral: false, review: false }
  ];

  var PHOTO_TEXT = {
    required: "Required — Nico texts a secure upload link before the case is filed.",
    optional: "Optional — a photo helps crews, but never blocks a report.",
    na: "Not applicable."
  };

  /* ---------------- State ---------------- */
  var state = { cat: "All", dept: "all", channel: "any", photo: false, gis: false, referral: false, review: false };
  var expanded = {}; // id -> true, survives re-renders

  var catalogEl, countEl, emptyEl, pillsEl, deptSel, channelSel;
  var toggles = {}; // key -> input element

  function matches(s) {
    if (state.cat !== "All" && s.cat !== state.cat) return false;
    if (state.dept !== "all") {
      if (state.dept === "__info") { if (s.dept !== null) return false; }
      else if (s.dept !== state.dept) return false;
    }
    if (state.channel !== "any" && s.channels.indexOf(state.channel) === -1) return false;
    if (state.photo && s.photo !== "required") return false;
    if (state.gis && !s.gis) return false;
    if (state.referral && !s.referral) return false;
    if (state.review && !s.review) return false;
    return true;
  }

  /* ---------------- Card rendering ---------------- */
  function chipList(items, cls) {
    return '<span class="chip-row">' + items.map(function (t) {
      return '<span class="chip ' + cls + '">' + t + "</span>";
    }).join("") + "</span>";
  }

  function headerChips(s) {
    var out = [];
    out.push(s.dept
      ? '<span class="chip chip-navy">' + s.dept + "</span>"
      : '<span class="chip chip-teal">Grounded answer, no case</span>');
    out.push('<span class="chip chip-outline">' + ic("clock") + " " + s.sla.split(" · ")[0] + "</span>");
    if (s.photo === "required") out.push('<span class="chip chip-amber">Photo required</span>');
    if (s.referral) out.push('<span class="chip chip-ocean">' + ic("route") + " Referral possible</span>");
    if (s.review) out.push('<span class="chip chip-purple">◔ Review gate</span>');
    return '<span class="chip-row">' + out.join("") + "</span>";
  }

  function row(label, valueHTML) {
    return '<div class="svc-row"><dt>' + label + "</dt><dd>" + valueHTML + "</dd></div>";
  }

  function cardHTML(s) {
    var isOpen = !!expanded[s.id];
    var bodyId = "svc-body-" + s.id;
    var body =
      row("Required fields", chipList(s.required, "chip-outline")) +
      row("Routing", s.dept ? s.dept : "Grounded answer, no case created") +
      row("SLA target", s.sla) +
      row("Ownership check", s.ownership) +
      row("Resident channels", chipList(s.channels, "chip-ocean")) +
      row("Photo", PHOTO_TEXT[s.photo]) +
      row("Duplicates & related", s.dupe) +
      row("Sample prompt", '<p class="svc-prompt">“' + s.prompt + "”</p>") +
      (s.source ? row("Knowledge source", '<span class="chip chip-source">' + ic("doc") + " " + s.source + "</span>") : "");

    return (
      '<article class="card svc-card">' +
      '<button class="svc-head" type="button" data-svc="' + s.id + '" aria-expanded="' + isOpen + '" aria-controls="' + bodyId + '">' +
      "<span>" +
      '<span class="svc-kicker">' + s.cat + "</span>" +
      "<h4>" + s.name + "</h4>" +
      headerChips(s) +
      "</span>" +
      '<span class="svc-caret" aria-hidden="true">▾</span>' +
      "</button>" +
      '<div class="svc-body" id="' + bodyId + '"' + (isOpen ? "" : " hidden") + "><dl>" + body + "</dl></div>" +
      "</article>"
    );
  }

  function render() {
    var visible = SERVICES.filter(matches);
    var html = "";

    CATEGORIES.forEach(function (c) {
      var inCat = visible.filter(function (s) { return s.cat === c[0]; });
      if (!inCat.length) return;
      html +=
        '<div class="svc-cat-head"><h3>' + c[0] + '</h3><span class="small">' + c[1] + "</span>" +
        '<span class="chip chip-outline">' + inCat.length + (inCat.length === 1 ? " service" : " services") + "</span></div>" +
        '<div class="grid grid-2">' + inCat.map(cardHTML).join("") + "</div>";
    });

    catalogEl.innerHTML = html;
    emptyEl.hidden = visible.length > 0;
    countEl.textContent = "Showing " + visible.length + " of " + SERVICES.length + " services";
  }

  /* ---------------- Filters ---------------- */
  function setCategory(cat) {
    state.cat = cat;
    pillsEl.querySelectorAll(".filter-pill").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.cat === cat));
    });
    render();
  }

  function resetFilters() {
    state.dept = "all"; deptSel.value = "all";
    state.channel = "any"; channelSel.value = "any";
    ["photo", "gis", "referral", "review"].forEach(function (k) {
      state[k] = false;
      toggles[k].checked = false;
      toggles[k].closest(".svc-toggle").classList.remove("on");
    });
    setCategory("All");
  }

  function buildFilters() {
    // Category pills
    var cats = ["All"].concat(CATEGORIES.map(function (c) { return c[0]; }));
    pillsEl.innerHTML = cats.map(function (c) {
      return '<button class="filter-pill" type="button" data-cat="' + c +
        '" aria-pressed="' + (c === "All") + '">' + (c === "All" ? "All services" : c) + "</button>";
    }).join("");
    pillsEl.addEventListener("click", function (e) {
      var pill = e.target.closest(".filter-pill");
      if (pill) setCategory(pill.dataset.cat);
    });

    // Department select (from shared data) + grounded-answer bucket
    var depts = (window.ENVOZ_DATA && ENVOZ_DATA.departments) || [];
    deptSel.innerHTML =
      '<option value="all">All departments</option>' +
      depts.map(function (d) { return '<option value="' + d + '">' + d + "</option>"; }).join("") +
      '<option value="__info">Grounded answer, no case</option>';
    deptSel.addEventListener("change", function () { state.dept = deptSel.value; render(); });

    channelSel.addEventListener("change", function () { state.channel = channelSel.value; render(); });

    // Attribute toggles
    [["photo", "f-photo"], ["gis", "f-gis"], ["referral", "f-referral"], ["review", "f-review"]].forEach(function (t) {
      var input = document.getElementById(t[1]);
      toggles[t[0]] = input;
      input.addEventListener("change", function () {
        state[t[0]] = input.checked;
        input.closest(".svc-toggle").classList.toggle("on", input.checked);
        render();
      });
    });

    document.getElementById("f-clear").addEventListener("click", resetFilters);
    document.getElementById("svc-empty-clear").addEventListener("click", resetFilters);
  }

  /* ---------------- Expand / collapse (keyboard-friendly: real buttons) ---------------- */
  function initExpand() {
    catalogEl.addEventListener("click", function (e) {
      var head = e.target.closest(".svc-head");
      if (!head) return;
      var id = head.dataset.svc;
      var open = head.getAttribute("aria-expanded") !== "true";
      expanded[id] = open;
      head.setAttribute("aria-expanded", String(open));
      document.getElementById("svc-body-" + id).hidden = !open;
    });
  }

  /* ---------------- Nico commands for this page ---------------- */
  var CAT_KEYWORDS = [
    [/roads?|transport|street|traffic/i, "Roads & Transportation"],
    [/utilit|water|sewer|drain|hydrant/i, "Utilities & Water"],
    [/clean|dumping|graffiti|trash|pest/i, "Clean & Safe"],
    [/parks?|trail|playground/i, "Parks & Public Spaces"],
    [/code|community|noise|rental/i, "Code & Community"],
    [/info|knowledge|question|lookup/i, "Info / Knowledge"]
  ];

  function initNico() {
    document.addEventListener("nico:command", function (e) {
      var t = e.detail.text || "";
      if (/clear (the )?filters?/i.test(t)) {
        resetFilters();
        e.detail.handled = true;
        e.detail.reply = "Filters cleared — showing all " + SERVICES.length + " services in the Vista Robles demo catalog.";
        return;
      }
      if (!/(service|catalog)/i.test(t) || !/(show|filter|list|which)/i.test(t)) return;
      for (var i = 0; i < CAT_KEYWORDS.length; i++) {
        if (CAT_KEYWORDS[i][0].test(t)) {
          resetFilters();
          setCategory(CAT_KEYWORDS[i][1]);
          var n = SERVICES.filter(matches).length;
          e.detail.handled = true;
          e.detail.reply = "Filtering the catalog to " + CAT_KEYWORDS[i][1] + " — " + n + " services. Expand any card to see its routing logic.";
          var sec = document.getElementById("catalog");
          if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
    });
  }

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    catalogEl = document.getElementById("svc-catalog");
    countEl = document.getElementById("svc-count");
    emptyEl = document.getElementById("svc-empty");
    pillsEl = document.getElementById("cat-pills");
    deptSel = document.getElementById("f-dept");
    channelSel = document.getElementById("f-channel");
    if (!catalogEl) return;

    // Fill static [data-icon] placeholders (chrome icons authored in HTML).
    document.querySelectorAll("[data-icon]").forEach(function (el) {
      el.innerHTML = ic(el.getAttribute("data-icon"));
    });

    buildFilters();
    initExpand();
    initNico();
    render();
  });
})();
