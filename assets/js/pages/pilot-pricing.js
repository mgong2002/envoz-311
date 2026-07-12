/* Pilot & Pricing — ROI calculator (live recompute, animated count-up),
   tier suggestion from population, demo-metric fill, Nico command hook. */
(function () {
  "use strict";

  var AI_COST_PER_INTERACTION = 0.50; // $ per AI-handled interaction — demo estimate; default for the editable input below
  var AFTER_HOURS_TRIAGE_SHARE = 0.5; // share of after-hours calls assumed to otherwise become next-morning triage

  // Pilots are one-time 90-day fixed-scope engagements; payback is measured against the pilot total, not a monthly fee.
  var TIERS = [
    { id: "tier-small", max: 75000, pilotTotal: 13500, label: "Small city pilot", assumption: "vs. a $12–15K fixed-scope pilot (small city)" },
    { id: "tier-mid", max: 250000, pilotTotal: 17500, label: "Mid-size city pilot", assumption: "vs. a $15–20K fixed-scope pilot (mid-size city)" },
    { id: "tier-large", max: Infinity, pilotTotal: 22000, label: "Large city / county pilot", assumption: "vs. a scoped pilot from $20K (large city / county)" }
  ];

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- formatting ---------------- */
  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function fmtMoney(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function fmtMonths(n) {
    if (!isFinite(n) || n <= 0) return "—";
    if (n > 36) return "36+ mo";
    return (Math.round(n * 10) / 10).toLocaleString("en-US") + " mo";
  }

  /* ---------------- animated count-up ---------------- */
  var animState = {}; // id -> { raf, current }

  function setOutput(id, target, fmt) {
    var el = document.getElementById(id);
    if (!el) return;
    var state = animState[id] || (animState[id] = { raf: null, current: 0 });
    if (state.raf) { cancelAnimationFrame(state.raf); state.raf = null; }

    if (reduceMotion || !isFinite(target)) {
      state.current = isFinite(target) ? target : 0;
      el.textContent = fmt(target);
      return;
    }
    var from = state.current;
    var start = null;
    var DURATION = 550;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / DURATION);
      var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      var val = from + (target - from) * eased;
      state.current = val;
      el.textContent = fmt(t === 1 ? target : val);
      if (t < 1) state.raf = requestAnimationFrame(frame);
      else state.raf = null;
    }
    state.raf = requestAnimationFrame(frame);
  }

  /* ---------------- inputs ---------------- */
  var FIELDS = ["pop", "volume", "afterhours", "costcall", "costenvoz", "containment", "handle", "hourly"];

  function readVal(key) {
    var num = document.getElementById("in-" + key);
    var v = parseFloat(num.value);
    if (isNaN(v)) v = parseFloat(num.getAttribute("value")) || 0;
    var min = parseFloat(num.min), max = parseFloat(num.max);
    if (!isNaN(min)) v = Math.max(min, v);
    if (!isNaN(max)) v = Math.min(max, v);
    return v;
  }

  function wireField(key) {
    var num = document.getElementById("in-" + key);
    var rng = document.getElementById("rg-" + key);
    if (!num || !rng) return;
    rng.addEventListener("input", function () {
      num.value = rng.value;
      recompute();
    });
    num.addEventListener("input", function () {
      var v = parseFloat(num.value);
      if (!isNaN(v)) rng.value = v;
      recompute();
    });
    num.addEventListener("blur", function () {
      // snap typed value back into range on blur so the math and field agree
      var v = readVal(key);
      num.value = v;
      rng.value = v;
      recompute();
    });
  }

  function tierFor(pop) {
    for (var i = 0; i < TIERS.length; i++) {
      if (pop < TIERS[i].max) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  /* ---------------- the math (mirrors the visible Assumptions panel) ---------------- */
  function recompute() {
    var pop = readVal("pop");
    var volume = readVal("volume");
    var afterHoursPct = readVal("afterhours") / 100;
    var costPerCall = readVal("costcall");
    var costEnvoz = readVal("costenvoz");
    var containment = readVal("containment") / 100;
    var handleMin = readVal("handle");
    var hourly = readVal("hourly");

    var aiHandled = volume * containment;
    var hoursSaved = aiHandled * handleMin / 60;
    var costAvoided = aiHandled * Math.max(0, costPerCall - costEnvoz);
    var afterHoursValue = volume * afterHoursPct * containment *
      (handleMin / 60) * hourly * AFTER_HOURS_TRIAGE_SHARE;
    var annualValue = costAvoided + afterHoursValue;

    var tier = tierFor(pop);
    var paybackMonths = annualValue > 0 ? (tier.pilotTotal / annualValue) * 12 : Infinity;

    setOutput("out-handled", aiHandled, fmtInt);
    setOutput("out-hours", hoursSaved, fmtInt);
    setOutput("out-avoided", costAvoided, fmtMoney);
    setOutput("out-afterhours", afterHoursValue, fmtMoney);
    setOutput("out-value", annualValue, fmtMoney);

    var payEl = document.getElementById("out-payback");
    if (payEl) payEl.textContent = fmtMonths(paybackMonths);

    var assumptionEl = document.getElementById("payback-assumption");
    if (assumptionEl) assumptionEl.textContent = tier.assumption + " · estimate";

    var tierChip = document.getElementById("tier-chip");
    if (tierChip) tierChip.textContent = "Suggested tier: " + tier.label;

    TIERS.forEach(function (t) {
      var card = document.getElementById(t.id);
      if (card) card.classList.toggle("tier-recommended", t.id === tier.id);
    });
  }

  /* ---------------- inline SVG icons (replace UI emoji) ---------------- */
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

  /* ---------------- demo metrics on the "what a pilot proves" checklist ---------------- */
  function fillDemoMetrics() {
    var metrics = (window.ENVOZ_DATA && window.ENVOZ_DATA.successMetrics) || {};
    var nodes = document.querySelectorAll("[data-metric]");
    Array.prototype.forEach.call(nodes, function (el) {
      var key = el.getAttribute("data-metric");
      if (metrics[key] !== undefined) el.textContent = metrics[key];
    });
  }

  /* ---------------- Nico command hook ---------------- */
  function wireNico() {
    document.addEventListener("nico:command", function (e) {
      var text = e.detail.text || "";
      if (/roi|calculator|payback|pricing|how much|cost of a pilot/i.test(text)) {
        e.detail.handled = true;
        e.detail.reply = "The ROI calculator is right on this page — I’ve scrolled you to it. Adjust the inputs and every estimate recalculates live.";
        var target = document.getElementById("roi-calculator");
        if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillIcons();
    FIELDS.forEach(wireField);
    fillDemoMetrics();
    wireNico();
    recompute();
  });
})();
