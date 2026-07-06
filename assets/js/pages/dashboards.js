/* ============================================================
   Envoz 311 — Dashboards & AI Insights (city manager console)
   Tabs: performance | gaps | cel | agent | council
   All figures are illustrative demo data (Vista Robles, CA).
   ============================================================ */
(function () {
  "use strict";

  var D = window.ENVOZ_DATA;
  var M = D.successMetrics;

  var state = {
    tab: "performance",
    range: 90,
    surge: false,
    recFilter: "all",
    recStatus: {},      // id -> overridden status
    sandboxDone: {},    // id -> true after a sandbox pass
    celAnimated: false,
    reportBuilt: false,
    reportBuilding: false
  };

  /* ==================== tiny helpers ==================== */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function toast(msg) {
    var old = $(".toast");
    if (old) old.remove();
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2800);
  }

  /* ==================== SVG chart builders ==================== */
  var TEAL = "#0f8b8d", OCEAN = "#1f6fb2", PURPLE = "#6d5bd0", GREEN = "#12805c", AMBER = "#b45309";

  function svgOpen(w, h, label) {
    return '<svg class="chart-svg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label) + '" preserveAspectRatio="xMidYMid meet">';
  }
  function legend(items) {
    return '<div class="chart-legend">' + items.map(function (it) {
      return '<span><span class="lg-swatch" style="background:' + it[1] + '"></span>' + esc(it[0]) + "</span>";
    }).join("") + "</div>";
  }
  function chartCard(opts) {
    return '<div class="chart-card' + (opts.span ? " chart-span" : "") + '">' +
      "<h4>" + esc(opts.title) + "</h4>" +
      '<div class="chart-sub">' + esc(opts.sub) + "</div>" +
      (opts.legend || "") + opts.body +
      (opts.note ? '<div class="chart-note">' + esc(opts.note) + "</div>" : "") +
      "</div>";
  }

  function lineChart(cfg) {
    var w = cfg.w || 560, h = cfg.h || 200;
    var padL = cfg.padL || 44, padR = 46, padT = 16, padB = 26;
    var iw = w - padL - padR, ih = h - padT - padB;
    var labels = cfg.labels, n = labels.length;
    var all = [];
    cfg.series.forEach(function (s) { all = all.concat(s.values); });
    var min = cfg.yMin != null ? cfg.yMin : Math.min.apply(null, all);
    var max = cfg.yMax != null ? cfg.yMax : Math.max.apply(null, all);
    if (max === min) max = min + 1;
    var fmt = cfg.fmt || function (v) { return String(Math.round(v * 10) / 10); };
    function X(i) { return n === 1 ? padL + iw / 2 : padL + i * iw / (n - 1); }
    function Y(v) { return padT + ih * (1 - (v - min) / (max - min)); }

    var out = svgOpen(w, h, cfg.aria);
    for (var g = 0; g <= 3; g++) {
      var gv = min + (max - min) * g / 3, gy = Y(gv);
      out += '<line class="chart-axis" x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + gy.toFixed(1) + '"/>';
      out += '<text class="chart-label" x="' + (padL - 7) + '" y="' + (gy + 3).toFixed(1) + '" text-anchor="end">' + esc(fmt(gv)) + "</text>";
    }
    var step = Math.max(1, Math.ceil(n / 6));
    for (var i = 0; i < n; i++) {
      if (i % step === 0 || i === n - 1) {
        out += '<text class="chart-label" x="' + X(i).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">' + esc(labels[i]) + "</text>";
      }
    }
    cfg.series.forEach(function (s) {
      var color = s.color || TEAL;
      var pts = s.values.map(function (v, j) { return X(j).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ");
      if (s.area) {
        out += '<polygon class="chart-area" points="' + X(0).toFixed(1) + "," + (padT + ih) + " " + pts + " " + X(n - 1).toFixed(1) + "," + (padT + ih) + '"/>';
      }
      out += '<polyline class="chart-line" style="stroke:' + color + '" points="' + pts + '"/>';
      if (s.marker != null) {
        var mi = s.marker, mx = X(mi), my = Y(s.values[mi]);
        out += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="5" fill="' + AMBER + '" stroke="#fff" stroke-width="2"/>';
        out += '<text class="chart-label" x="' + mx.toFixed(1) + '" y="' + (my - 10).toFixed(1) + '" text-anchor="middle" style="fill:' + AMBER + ';font-weight:700">' + esc(s.markerLabel || "") + "</text>";
      }
      var lx = X(n - 1), ly = Y(s.values[n - 1]);
      out += '<circle cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="4" fill="' + color + '" stroke="#fff" stroke-width="1.5"/>';
      out += '<text class="chart-value" x="' + (lx + 7).toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '">' + esc(fmt(s.values[n - 1])) + "</text>";
      s.values.forEach(function (v, j) {
        out += '<circle cx="' + X(j).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="10" fill="transparent"><title>' + esc(labels[j] + (s.name ? " · " + s.name : "") + ": " + fmt(v)) + "</title></circle>";
      });
    });
    return out + "</svg>";
  }

  function barChart(cfg) {
    var w = cfg.w || 560, h = cfg.h || 210;
    var padL = cfg.padL || 40, padR = 8, padT = 20, padB = 30;
    var iw = w - padL - padR, ih = h - padT - padB;
    var n = cfg.values.length;
    var min = cfg.yMin != null ? cfg.yMin : 0;
    var max = cfg.yMax != null ? cfg.yMax : Math.max.apply(null, cfg.values) * 1.12;
    var fmt = cfg.fmt || function (v) { return String(v); };
    var band = iw / n, bw = Math.min(band * 0.6, 44);
    function Y(v) { return padT + ih * (1 - (v - min) / (max - min)); }

    var out = svgOpen(w, h, cfg.aria);
    for (var g = 0; g <= 3; g++) {
      var gv = min + (max - min) * g / 3, gy = Y(gv);
      out += '<line class="chart-axis" x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + gy.toFixed(1) + '"/>';
      out += '<text class="chart-label" x="' + (padL - 7) + '" y="' + (gy + 3).toFixed(1) + '" text-anchor="end">' + esc(fmt(gv)) + "</text>";
    }
    cfg.values.forEach(function (v, i) {
      var x = padL + band * i + (band - bw) / 2, y = Y(v);
      var color = (cfg.colorFor && cfg.colorFor(i)) || TEAL;
      out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(2, padT + ih - y).toFixed(1) + '" rx="4" fill="' + color + '"><title>' + esc(cfg.labels[i] + ": " + fmt(v)) + "</title></rect>";
      if (cfg.showValues) {
        out += '<text class="chart-value" x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle">' + esc(fmt(v)) + "</text>";
      }
      if (cfg.markers) {
        out += '<path d="M ' + (x + bw / 2).toFixed(1) + " " + (padT + 2) + ' l 5 6 l -5 6 l -5 -6 Z" fill="' + PURPLE + '"><title>' + esc(cfg.labels[i] + " · " + cfg.markers.title + ": " + cfg.markers.values[i] + "%") + "</title></path>";
        out += '<text class="chart-label" x="' + (x + bw / 2).toFixed(1) + '" y="' + (padT + 26) + '" text-anchor="middle" style="fill:' + PURPLE + ';font-weight:700">' + cfg.markers.values[i] + "%</text>";
      }
      out += '<text class="chart-label" x="' + (x + bw / 2).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">' + esc(cfg.labels[i]) + "</text>";
    });
    return out + "</svg>";
  }

  function groupedBars(cfg) {
    var w = 560, h = 220, padL = 52, padR = 8, padT = 18, padB = 30;
    var iw = w - padL - padR, ih = h - padT - padB;
    var n = cfg.labels.length;
    var max = 0;
    cfg.series.forEach(function (s) { max = Math.max(max, Math.max.apply(null, s.values)); });
    max *= 1.15;
    var band = iw / n, bw = Math.min(band * 0.3, 34);
    var fmt = cfg.fmt || function (v) { return String(v); };
    function Y(v) { return padT + ih * (1 - v / max); }
    var out = svgOpen(w, h, cfg.aria);
    for (var g = 0; g <= 3; g++) {
      var gv = max * g / 3, gy = Y(gv);
      out += '<line class="chart-axis" x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + gy.toFixed(1) + '"/>';
      out += '<text class="chart-label" x="' + (padL - 7) + '" y="' + (gy + 3).toFixed(1) + '" text-anchor="end">' + esc(fmt(gv)) + "</text>";
    }
    cfg.labels.forEach(function (lab, i) {
      var cx = padL + band * i + band / 2;
      cfg.series.forEach(function (s, k) {
        var x = cx + (k === 0 ? -bw - 1 : 1), y = Y(s.values[i]);
        out += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(2, padT + ih - y).toFixed(1) + '" rx="4" fill="' + s.color + '"><title>' + esc(lab + " · " + s.name + ": " + fmt(s.values[i])) + "</title></rect>";
        out += '<text class="chart-value" x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" text-anchor="middle">' + esc(fmt(s.values[i])) + "</text>";
      });
      out += '<text class="chart-label" x="' + cx.toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">' + esc(lab) + "</text>";
    });
    return out + "</svg>";
  }

  function hBars(cfg) {
    var rowH = 27, labelW = cfg.labelW || 168, valW = 46;
    var w = 560, h = cfg.rows.length * rowH + 12;
    var iw = w - labelW - valW - 10;
    var max = cfg.max || Math.max.apply(null, cfg.rows.map(function (r) { return r[1]; }));
    var fmt = cfg.fmt || function (v) { return String(v); };
    var out = svgOpen(w, h, cfg.aria);
    cfg.rows.forEach(function (r, i) {
      var y = 8 + i * rowH, bw = Math.max(3, iw * r[1] / max);
      var color = (cfg.colorFor && cfg.colorFor(r, i)) || TEAL;
      out += '<text class="chart-label" x="' + (labelW - 8) + '" y="' + (y + 12) + '" text-anchor="end" style="font-size:10.5px">' + esc(r[0]) + "</text>";
      out += '<rect class="bar-track" x="' + labelW + '" y="' + y + '" width="' + iw + '" height="16" rx="4"/>';
      out += '<rect x="' + labelW + '" y="' + y + '" width="' + bw.toFixed(1) + '" height="16" rx="4" fill="' + color + '"><title>' + esc(r[0] + ": " + fmt(r[1])) + "</title></rect>";
      out += '<text class="chart-value" x="' + (labelW + bw + 7).toFixed(1) + '" y="' + (y + 12) + '">' + esc(fmt(r[1])) + "</text>";
    });
    return out + "</svg>";
  }

  function ganttChart(cfg) {
    var rowH = 30, labelW = 190, w = 560;
    var h = cfg.rows.length * rowH + 30;
    var iw = w - labelW - 14;
    var max = cfg.max;
    var out = svgOpen(w, h, cfg.aria);
    for (var t = 0; t <= max; t += cfg.tick) {
      var x = labelW + iw * t / max;
      out += '<line class="chart-axis" x1="' + x.toFixed(1) + '" y1="6" x2="' + x.toFixed(1) + '" y2="' + (h - 22) + '"/>';
      out += '<text class="chart-label" x="' + x.toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">' + t + "h</text>";
    }
    cfg.rows.forEach(function (r, i) {
      var y = 10 + i * rowH;
      var x1 = labelW + iw * r.start / max;
      var bw = Math.max(5, iw * (r.end - r.start) / max);
      out += '<text class="chart-label" x="' + (labelW - 8) + '" y="' + (y + 11) + '" text-anchor="end" style="font-size:10.5px">' + esc(r.name) + "</text>";
      out += '<rect x="' + x1.toFixed(1) + '" y="' + y + '" width="' + bw.toFixed(1) + '" height="15" rx="4" fill="' + (r.color || TEAL) + '"><title>' + esc(r.name + " · " + r.dur) + "</title></rect>";
      out += '<text class="chart-value" x="' + (x1 + bw + 7).toFixed(1) + '" y="' + (y + 11.5) + '" style="font-size:9.5px">' + esc(r.dur) + "</text>";
    });
    return out + "</svg>";
  }

  /* teal sequential scale for the equity heatmap */
  var HEAT_SCALE = ["#eef7f6", "#d7efee", "#a8dedb", "#5cbdbb", "#17a2a4", "#0d6e71"];
  function heatColor(t) {
    var idx = Math.min(HEAT_SCALE.length - 1, Math.max(0, Math.floor(t * HEAT_SCALE.length)));
    return { bg: HEAT_SCALE[idx], ink: idx >= 3 ? "#ffffff" : "#0c1e36" };
  }

  /* ==================== Performance datasets ==================== */
  var WEEKS = ["4/14", "4/21", "4/28", "5/5", "5/12", "5/19", "5/26", "6/2", "6/9", "6/16", "6/23", "6/30"];
  var BASE = {
    sla: [88.9, 89.6, 90.2, 90.8, 91.5, 91.2, 92.0, 92.6, 92.4, 93.0, 93.1, 93.4],
    unknown: [7.2, 6.8, 6.4, 6.1, 5.7, 5.3, 5.0, 4.7, 4.4, 4.2, 4.0, 3.8],
    repeat: [18.4, 17.6, 16.9, 16.1, 15.4, 14.8, 14.1, 13.5, 12.9, 12.3, 11.7, 11.2],
    deflect: [61, 63, 64, 66, 68, 69, 71, 72, 74, 75, 77, 78],
    deptAcc: [93.2, 94.1, 88.4, 92.5, 90.2, 91.8, 89.5, 86.9],
    dow: [74, 76, 75, 73, 71, 80, 82],
    intents: [
      ["Pothole / road hazard", 214], ["Illegal dumping / bulk waste", 187],
      ["Streetlight outage", 156], ["Missed trash pickup", 149],
      ["Graffiti removal", 118], ["Water pooling", 96],
      ["Parks maintenance", 88], ["Abandoned vehicle", 71],
      ["Noise complaint", 64], ["Tree / limb down", 52]
    ],
    langs: {
      labels: ["English", "Spanish", "Viet.", "Mandarin", "Korean", "Tagalog", "Farsi", "11 more"],
      volume: [862, 236, 64, 38, 21, 12, 9, 6],
      conf: [97, 94, 91, 90, 92, 89, 88, 86]
    },
    cost: { labels: ["April", "May", "June"], human: [5.9, 6.3, 6.6], ai: [0.33, 0.35, 0.36] },
    heat: {
      metrics: ["Requests / 1k residents", "SLA compliance %", "Median response (hrs)", "After-hours share %"],
      lowerBetter: [false, false, true, false],
      rows: [
        ["Alton District", 31, 94.2, 26, 29],
        ["Harbor View", 27, 90.1, 34, 24],
        ["Oak Bluff", 34, 92.8, 28, 33],
        ["Paseo Market Corridor", 38, 93.5, 25, 22],
        ["Mesa Ridge", 24, 94.8, 24, 21],
        ["Civic Center", 22, 95.1, 22, 18],
        ["North Foothills", 19, 92.2, 31, 27],
        ["School Zone South", 29, 93.0, 27, 31]
      ]
    },
    timeline: [
      { name: "Answered & safety-gated", start: 0, end: 0.6, dur: "36 min avg", color: TEAL },
      { name: "Classified, located, routed", start: 0.6, end: 0.7, dur: "≈ 90 sec", color: TEAL },
      { name: "Staff approval (AM triage)", start: 0.7, end: 9.4, dur: "8.7 hrs", color: OCEAN },
      { name: "Crew scheduled", start: 9.4, end: 14.2, dur: "4.8 hrs", color: OCEAN },
      { name: "Field work completed", start: 14.2, end: 37.1, dur: "22.9 hrs", color: TEAL },
      { name: "Resident notified · closed", start: 37.1, end: 38, dur: "54 min", color: GREEN }
    ]
  };

  var SURGE = {
    sla: [93.0, 93.1, 91.2, 89.4, 90.8, 92.1, 92.7, 93.0, 93.2, 93.3, 93.4, 93.4],
    slaMarker: 3,
    unknown: [3.9, 4.0, 9.6, 7.1, 5.2, 4.4, 4.1, 4.0, 3.9, 3.9, 3.8, 3.8],
    unknownMarker: 2,
    dow: [76, 77, 81, 84, 79, 83, 85],
    deptAcc: [91.8, 93.4, 86.1, 90.7, 89.8, 90.9, 88.7, 85.2],
    intents: [
      ["Storm drain backup", 14], ["Tree / limb down", 11], ["Water pooling", 9],
      ["Flooded roadway", 7], ["Streetlight / signal out", 6], ["Sandbag pickup info", 5],
      ["Downed fence / debris", 4], ["Pothole / road hazard", 4],
      ["Missed trash pickup", 2], ["Roof / property damage referral", 2]
    ],
    hourly: {
      labels: ["12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"],
      calls: [6, 7, 9, 12, 18, 26, 41, 58, 63, 49, 31, 18]
    }
  };

  function weeksFor(range) { return range === 30 ? 5 : range === 60 ? 8 : 12; }
  function sliceW(arr, range) { return arr.slice(arr.length - weeksFor(range)); }
  function scaleIntents(range) {
    var f = state.range / 90;
    return BASE.intents.map(function (r) { return [r[0], Math.round(r[1] * f)]; });
  }

  /* KPI grid */
  function kpiTile(value, label, delta, deltaDir) {
    return '<div class="kpi kpi-accent"><span class="kpi-value">' + esc(value) + '</span><br>' +
      '<span class="kpi-label">' + esc(label) + "</span>" +
      (delta ? '<br><span class="kpi-delta ' + (deltaDir || "up") + '">' + esc(delta) + "</span>" : "") +
      "</div>";
  }

  function renderKPIs() {
    var host = $("#kpi-grid");
    if (state.surge) {
      host.innerHTML = [
        kpiTile("4.2×", "Call volume vs baseline · Jan 14", "▲ storm replay", "neutral"),
        kpiTile("81%", "AI containment during surge", "▲ 5 pts vs normal ops"),
        kpiTile("100%", "Calls answered · zero voicemail", "including 9–10 PM peak"),
        kpiTile("14", "Storm-drain cluster reports", "grouped under 1 parent case", "neutral"),
        kpiTile("Oak Bluff", "Hotspot neighborhood", "22 reports · crews staged", "neutral"),
        kpiTile("0:07", "Avg hold during peak hour", "vs 0:04 normal", "neutral"),
        kpiTile("3", "911 redirects · safety gate", "no 311 case created", "neutral"),
        kpiTile("96.1%", "Same-night SLA triage held", "▲ storm playbook active")
      ].join("");
      return;
    }
    var f = state.range / 90;
    var sla = state.range === 30 ? "94.1%" : state.range === 60 ? "93.7%" : M.slaCompliance;
    var acc = state.range === 30 ? "92.3%" : state.range === 60 ? "91.9%" : M.routingAccuracy;
    var unknown = state.range === 30 ? "3.1%" : state.range === 60 ? "3.5%" : M.unknownRate;
    host.innerHTML = [
      kpiTile(sla, "SLA compliance", "▲ 4.1 pts this quarter"),
      kpiTile(acc, "Routing accuracy", "▲ vs 84.9% at launch"),
      kpiTile(String(Math.round(327 * f)), "After-hours calls captured", "would have been voicemail"),
      kpiTile(M.avgHold, "Average hold time", "▼ from 6:40 pre-Envoz"),
      kpiTile(M.answeredBeforeSecondRing, "Answered before second ring"),
      kpiTile(M.coverage, "24/7 coverage", "365 days, every language"),
      kpiTile(M.csat, "Resident CSAT", "▲ 0.8 vs voicemail era"),
      kpiTile(M.costPerInteraction, "Cost per AI-handled interaction", "vs ~$7.60 human est.", "neutral"),
      kpiTile(String(Math.round(312 * f)), "Staff hours saved", "triage & data entry"),
      kpiTile(String(Math.round(1248 * f).toLocaleString ? Math.round(1248 * f).toLocaleString("en-US") : Math.round(1248 * f)), "Service requests created"),
      kpiTile(M.avgHandle, "Average handle time", "voice → routed case", "neutral"),
      kpiTile(M.containment, "AI containment", "warm transfer otherwise", "neutral"),
      kpiTile(M.languages, "Languages served", "of 70+ supported", "neutral"),
      kpiTile(unknown, "Unknown-service rate", "▼ trending down", "up")
    ].join("");
  }

  /* Equity heatmap → HTML grid of .heat-cell */
  function heatmapHTML() {
    var hm = BASE.heat;
    var cols = hm.metrics.length;
    var html = '<div class="heat-grid" style="grid-template-columns:150px repeat(' + cols + ',1fr)" role="table" aria-label="Service equity by neighborhood across four metrics">';
    html += '<div class="heat-head" role="columnheader"></div>';
    hm.metrics.forEach(function (m) { html += '<div class="heat-head" role="columnheader">' + esc(m) + "</div>"; });
    // per-column min/max
    var mins = [], maxs = [];
    for (var c = 0; c < cols; c++) {
      var vals = hm.rows.map(function (r) { return r[c + 1]; });
      mins.push(Math.min.apply(null, vals)); maxs.push(Math.max.apply(null, vals));
    }
    hm.rows.forEach(function (r) {
      var isHot = state.surge && r[0] === "Oak Bluff";
      html += '<div class="heat-rowlab" role="rowheader">' + esc(r[0]) + (isHot ? ' <span class="chip chip-amber" style="font-size:.62rem;padding:3px 7px">⛈ hotspot</span>' : "") + "</div>";
      for (var c2 = 0; c2 < cols; c2++) {
        var v = r[c2 + 1];
        if (isHot && c2 === 0) v = 62; // Oak Bluff surge request spike
        var t = (v - mins[c2]) / (maxs[c2] - mins[c2] || 1);
        if (hm.lowerBetter[c2]) t = 1 - t;
        if (isHot && c2 === 0) t = 1;
        var col = heatColor(t);
        html += '<div class="heat-cell' + (isHot && c2 === 0 ? " hot" : "") + '" role="cell" style="background:' + col.bg + ";color:" + col.ink + '" title="' + esc(r[0] + " · " + hm.metrics[c2] + ": " + v) + '">' + v + "</div>";
      }
    });
    html += "</div>";
    return html;
  }

  function renderCharts() {
    var host = $("#perf-charts");
    var wk = sliceW(WEEKS, state.range);
    var cards = [];

    if (state.surge) {
      cards.push(chartCard({
        span: true,
        title: "Surge timeline · calls per hour · Jan 14 storm replay",
        sub: "Storm made landfall ≈ 6 PM. Every call answered; 81% contained end-to-end by Nico.",
        body: barChart({
          labels: SURGE.hourly.labels, values: SURGE.hourly.calls, showValues: true, h: 190,
          colorFor: function (i) { return i >= 6 && i <= 9 ? AMBER : TEAL; },
          aria: "Bar chart of calls per hour on January 14, peaking at 63 calls at 8 PM"
        }),
        legend: legend([["Calls per hour", TEAL], ["Storm peak hours", AMBER]]),
        note: "Illustrative storm replay · fictional data"
      }));
    }

    cards.push(chartCard({
      title: "SLA compliance trend",
      sub: (state.surge ? "12 weeks incl. Jan 14 storm dip and recovery" : weeksFor(state.range) + " weeks · assessment & resolution SLAs met"),
      body: lineChart({
        labels: state.surge ? WEEKS : wk,
        series: [{
          values: state.surge ? SURGE.sla : sliceW(BASE.sla, state.range), area: true,
          marker: state.surge ? SURGE.slaMarker : null, markerLabel: state.surge ? "storm wk" : ""
        }],
        yMin: 84, yMax: 98, fmt: function (v) { return v.toFixed(1) + "%"; },
        aria: "Line chart of weekly SLA compliance rising to 93.4 percent"
      }),
      note: "Target: 90% · demo data"
    }));

    var deptShort = ["Pub Works", "Sanit.", "Utilities", "Parks", "Code", "Transp.", "Animal", "County"];
    var acc = (state.surge ? SURGE.deptAcc : BASE.deptAcc).map(function (v) {
      return state.surge ? v : Math.round((v + (state.range === 30 ? 0.6 : state.range === 60 ? 0.3 : 0)) * 10) / 10;
    });
    cards.push(chartCard({
      title: "Routing accuracy by department",
      sub: "First-routing decisions later confirmed by staff · " + (state.surge ? "Jan 14 storm replay" : "last " + state.range + " days"),
      body: barChart({
        labels: deptShort, values: acc, yMin: 80, yMax: 100, showValues: true,
        fmt: function (v) { return (Math.round(v * 10) / 10) + "%"; },
        aria: "Bar chart of routing accuracy by department, ranging from about 86 to 94 percent"
      }),
      note: "County Partner referrals are hardest to route — a known gap Nico is watching."
    }));

    cards.push(chartCard({
      title: "After-hours containment by day of week",
      sub: "Share of 5 PM – 8 AM calls fully resolved by Nico" + (state.surge ? " · storm week" : ""),
      body: barChart({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: state.surge ? SURGE.dow : BASE.dow,
        yMin: 0, yMax: 100, showValues: true,
        fmt: function (v) { return Math.round(v) + "%"; },
        aria: "Bar chart of after-hours containment by day of week, highest on weekends"
      }),
      note: "Remainder are warm-transferred with full context — residents never repeat themselves."
    }));

    var intents = state.surge ? SURGE.intents : scaleIntents(state.range);
    cards.push(chartCard({
      title: state.surge ? "Top service intents · Jan 14 storm" : "Top 10 service intents",
      sub: state.surge ? "Storm-drain backup cluster: 14 reports grouped to one parent case" : "Service requests created · last " + state.range + " days",
      body: hBars({
        rows: intents,
        colorFor: function (r) { return state.surge && r[0] === "Storm drain backup" ? AMBER : TEAL; },
        aria: "Horizontal bar chart of the top ten service request intents by volume"
      }),
      legend: state.surge ? legend([["Reports", TEAL], ["Surge cluster", AMBER]]) : "",
      note: state.surge ? "Follower status offered on the parent case to keep the queue clean." : ""
    }));

    cards.push(chartCard({
      title: "Unknown categories trending down",
      sub: "Calls with no confident taxonomy match — each one feeds the Learning Ledger",
      body: lineChart({
        labels: state.surge ? WEEKS : wk,
        series: [{
          values: state.surge ? SURGE.unknown : sliceW(BASE.unknown, state.range), area: true,
          marker: state.surge ? SURGE.unknownMarker : null, markerLabel: state.surge ? "storm spike" : ""
        }],
        yMin: 0, yMax: state.surge ? 11 : 9, fmt: function (v) { return (Math.round(v * 10) / 10) + "%"; },
        aria: "Line chart of unknown service category rate declining to 3.8 percent"
      }),
      note: state.surge ? "The storm spike became the storm-drain subcategory now in the taxonomy (LL-1044)." : "Down from 7.2% — approved vocabulary and rules close the gap week by week."
    }));

    cards.push(chartCard({
      span: true,
      title: "Service equity heatmap by neighborhood",
      sub: "Coverage across all eight neighborhoods · darker teal = stronger coverage (median response inverted: darker = faster)",
      body: heatmapHTML(),
      note: "Council-district equity view · illustrative demo data"
    }));

    cards.push(chartCard({
      title: "Language access · volume & AI confidence",
      sub: "Calls by language with routing-confidence markers · " + M.languages + " languages served",
      legend: legend([["Call volume", TEAL], ["Language AI confidence (◆)", PURPLE]]),
      body: barChart({
        labels: BASE.langs.labels,
        values: BASE.langs.volume.map(function (v) { return Math.round(v * state.range / 90); }),
        showValues: true, h: 230, padL: 46,
        markers: { values: BASE.langs.conf, title: "AI confidence" },
        aria: "Bar chart of call volume by language with purple markers showing AI confidence per language"
      }),
      note: "Purple is reserved for language & AI-confidence signals across Envoz."
    }));

    cards.push(chartCard({
      title: "Repeat-contact reduction",
      sub: "Residents calling back about the same issue, per 100 cases",
      body: lineChart({
        labels: wk,
        series: [{ values: sliceW(BASE.repeat, state.range), area: true }],
        yMin: 0, yMax: 22, fmt: function (v) { return (Math.round(v * 10) / 10); },
        aria: "Line chart of repeat contacts per 100 cases falling from 18.4 to 11.2"
      }),
      note: "Proactive SMS status links mean fewer “any update?” calls."
    }));

    cards.push(chartCard({
      title: "Cost avoided vs human handling",
      sub: "Monthly cost of AI-handled interactions vs estimated human handling ($ thousands)",
      legend: legend([["Est. human handling", OCEAN], ["Envoz AI-handled", TEAL]]),
      body: groupedBars({
        labels: BASE.cost.labels,
        series: [
          { name: "Est. human handling", color: OCEAN, values: BASE.cost.human },
          { name: "Envoz AI-handled", color: TEAL, values: BASE.cost.ai }
        ],
        fmt: function (v) { return "$" + (Math.round(v * 10) / 10) + "k"; },
        aria: "Grouped bar chart comparing estimated human handling cost to Envoz AI handling cost by month"
      }),
      note: "≈ $17.7k avoided this quarter at $0.42 per AI-handled interaction vs ~$7.60 human estimate."
    }));

    cards.push(chartCard({
      title: "Status self-service deflection",
      sub: "“Where’s my case?” checks resolved without staff, by week",
      body: lineChart({
        labels: wk,
        series: [{ values: sliceW(BASE.deflect, state.range), area: true }],
        yMin: 40, yMax: 90, fmt: function (v) { return Math.round(v) + "%"; },
        aria: "Line chart of status checks self-served without staff, rising to 78 percent"
      }),
      note: "Answered from live CRM status — never a fabricated repair date."
    }));

    cards.push(chartCard({
      span: true,
      title: "Complaint-to-resolution timeline · median pothole case",
      sub: "Where the 38 hours go — intake and routing take about 90 seconds; the rest is real-world work",
      legend: legend([["Nico (automated)", TEAL], ["Staff & scheduling", OCEAN], ["Closed & notified", GREEN]]),
      body: ganttChart({
        rows: BASE.timeline, max: 48, tick: 12,
        aria: "Timeline chart showing the phases of a median pothole case from report to resident notification over 38 hours"
      }),
      note: "Resident gets the real case number at minute two, and an SMS when the crew closes it."
    }));

    host.innerHTML = cards.join("");
  }

  function renderSurgeBits() {
    var banner = $("#surge-banner");
    var tgl = $("#surge-toggle");
    tgl.setAttribute("aria-pressed", String(state.surge));
    tgl.textContent = state.surge ? "⛈ Exit storm surge view" : "⛈ Storm surge view";
    if (state.surge) {
      banner.hidden = false;
      banner.className = "surge-banner";
      banner.innerHTML = "<span aria-hidden=\"true\" style=\"font-size:1.2rem\">⛈</span><span><strong>Storm surge mode · Jan 14 storm replay.</strong> Call volume 4.2× baseline, containment held at 81%, storm-drain cluster grouped, Oak Bluff crews staged.</span><span class=\"chip\">Replay · illustrative data</span>";
    } else {
      banner.hidden = true;
      banner.innerHTML = "";
    }
    $all("#range-pills .filter-pill").forEach(function (p) {
      p.disabled = state.surge;
      p.style.opacity = state.surge ? ".5" : "";
      p.title = state.surge ? "Time ranges pause during the Jan 14 storm replay" : "";
    });
  }

  function renderPerformance() {
    renderSurgeBits();
    renderKPIs();
    renderCharts();
  }

  function setSurge(on) {
    if (state.surge === on) return;
    state.surge = on;
    renderPerformance();
  }

  /* ==================== Tab 2 · Service Gaps ==================== */
  var CTA_FEEDBACK = {
    "Create rule": { status: "Queued · rule drafted for approval", note: "Draft rule sent to the Nico Success Agent queue" },
    "Open queue": { status: "Queue opened · flagged for supervisor", note: "4 at-risk cases surfaced in staff triage" },
    "Export for council": { status: "Exported · added to council report draft", note: "Will appear under “Service gaps discovered”" },
    "Add to configuration": { status: "Queued · configuration change drafted", note: "Proposed change awaits sandbox test & approval" }
  };

  function riskChip(risk) {
    var cls = risk === "Low" ? "chip-green" : risk === "Medium" ? "chip-amber" : "chip-red";
    return '<span class="chip ' + cls + '">Risk: ' + esc(risk) + "</span>";
  }

  function renderGaps() {
    var host = $("#gap-cards");
    host.innerHTML = D.gaps.map(function (g, i) {
      return '<div class="card card-hover" data-gap="' + i + '">' +
        '<div class="flex space-between" style="align-items:flex-start;gap:10px">' +
        '<h4 style="margin:0">' + esc(g.title) + "</h4>" + riskChip(g.risk) + "</div>" +
        '<p class="small" style="margin:12px 0 8px"><strong>Evidence:</strong> ' + esc(g.evidence) + "</p>" +
        '<p class="small" style="margin:0 0 8px"><strong>Suggested action:</strong> ' + esc(g.suggestion) + "</p>" +
        '<div class="chip-row" style="margin:10px 0">' +
        '<span class="chip chip-teal">Impact: ' + esc(g.impact) + "</span>" +
        '<span class="chip chip-outline">Owner: ' + esc(g.owner) + "</span></div>" +
        '<div class="gap-status">' +
        '<button class="btn btn-primary btn-sm" type="button" data-cta="' + esc(g.cta) + '">' + esc(g.cta) + "</button>" +
        '<span class="chip chip-outline gap-state">Proposed · awaiting action</span>' +
        '</div><div class="gap-proof"></div></div>';
    }).join("");

    $all("[data-cta]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var fb = CTA_FEEDBACK[btn.dataset.cta] || CTA_FEEDBACK["Create rule"];
        var card = btn.closest(".card");
        card.querySelector(".gap-state").outerHTML = '<span class="chip chip-green gap-state">✓ ' + esc(fb.status) + "</span>";
        card.querySelector(".gap-proof").innerHTML = '<div class="proof-strip" style="margin-top:12px"><span class="proof-icon">✓</span>' + esc(fb.note) + " · logged to the Civic Evidence Ledger</div>";
        btn.disabled = true;
        btn.textContent = "✓ Done";
        toast(fb.status);
      });
    });
  }

  /* ==================== Tab 3 · CEL Learning ==================== */
  var CEL_COUNTERS = [
    [47, "Routing corrections captured"], [31, "Unknown categories reviewed"],
    [4, "City-only rules created"], [9, "Department memory updates"],
    [2, "Global taxonomy candidates"], [6, "Knowledge-source updates"],
    [12, "Language vocabulary additions"], [3, "Connector / data fixes"],
    [18, "Sandbox tests passed"], [5, "Production changes approved"]
  ];

  var LEDGER_DETAIL = {
    "LL-1042": "Staff corrected 19 water-pooling cases from Streets to Utilities in 90 days; 17 of the 19 were within 30 ft of a storm-drain asset per the GIS layer. Proposed rule drafted, sandbox-tested against 47 historical cases (18/18 test suites passed), now awaiting city approval.",
    "LL-1043": "Spanish-language calls near School Zone South resolved addresses at 71% vs 82% citywide. Root cause: residents use school nicknames and crosswalk landmarks absent from the location vocabulary. Additions running in sandbox against recorded (consented) demo transcripts.",
    "LL-1044": "The phrase “storm grate burbling” appeared 14 times in 48 hours during the Jan 14 storm and fell below the confident-routing threshold each time. A provisional storm-drain backup subcategory was approved for the city taxonomy — flagged as a global taxonomy candidate pending multi-city evidence.",
    "LL-1045": "SeeClickFix write API returned elevated 429 responses between 2–4 AM on Jul 5. Retry window widened with idempotency keys preserved; zero duplicate case confirmations sent to residents.",
    "LL-1046": "17 neighborhood names in the imported trash-schedule sheet don’t match the canonical GIS list (e.g., “N. Foothills” vs “North Foothills”). Cleanup task list assigned to Sanitation before grounded answers go to production."
  };

  var celCounted = false;
  function renderCelCounters() {
    var host = $("#cel-counters");
    host.innerHTML = CEL_COUNTERS.map(function (c, i) {
      return '<div class="kpi"><span class="kpi-value" data-count="' + c[0] + '" id="cel-count-' + i + '">0</span><br><span class="kpi-label">' + esc(c[1]) + "</span></div>";
    }).join("");
  }
  function animateCounters() {
    if (celCounted) return;
    celCounted = true;
    $all("#cel-counters [data-count]").forEach(function (el) {
      var target = parseInt(el.dataset.count, 10), cur = 0;
      var stepT = Math.max(1, Math.round(target / 24));
      var iv = setInterval(function () {
        cur = Math.min(target, cur + stepT);
        el.textContent = String(cur);
        if (cur >= target) clearInterval(iv);
      }, 34);
    });
  }

  function statusChipFor(status) {
    var cls = /approved|completed/i.test(status) ? "chip-green"
      : /ready/i.test(status) ? "chip-amber"
      : /sandbox/i.test(status) ? "chip-purple"
      : "chip-ocean";
    return '<span class="chip ' + cls + '">' + esc(status) + "</span>";
  }

  function renderLedger() {
    var rows = D.ledger.map(function (r, i) {
      return '<tr class="clickable" data-ledger="' + i + '" aria-label="Ledger entry ' + esc(r.audit) + '">' +
        "<td>" + esc(r.date) + "</td><td><strong>" + esc(r.signal) + "</strong></td>" +
        "<td>" + esc(r.evidence) + "</td><td>" + esc(r.change) + "</td>" +
        '<td><span class="chip chip-outline">' + esc(r.scope) + "</span></td>" +
        "<td>" + statusChipFor(r.status) + "</td>" +
        "<td>" + esc(r.impact) + "</td>" +
        '<td><button class="ledger-toggle" type="button" aria-expanded="false" aria-controls="ledger-detail-' + i + '">' + esc(r.audit) + " ▸</button></td></tr>" +
        '<tr class="ledger-detail" id="ledger-detail-' + i + '" hidden><td colspan="8">' +
        "<strong>Full evidence:</strong> " + esc(LEDGER_DETAIL[r.audit] || r.evidence) +
        '<div class="chip-row" style="margin-top:10px"><span class="chip chip-navy mono">Audit ' + esc(r.audit) + "</span>" +
        '<span class="chip chip-outline">Scope: ' + esc(r.scope) + "</span>" +
        '<span class="chip chip-outline">Reviewed by 311 program manager</span></div></td></tr>';
    }).join("");

    $("#ledger-wrap").innerHTML =
      '<table class="data-table"><thead><tr>' +
      "<th>Date</th><th>Signal</th><th>Evidence</th><th>Recommended change</th><th>Scope</th><th>Status</th><th>Impact estimate</th><th>Audit</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table>";

    function toggleRow(i) {
      var detail = $("#ledger-detail-" + i);
      var btn = $('[aria-controls="ledger-detail-' + i + '"]');
      var open = detail.hidden;
      detail.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = btn.textContent.replace(open ? "▸" : "▾", open ? "▾" : "▸");
    }
    $all("#ledger-wrap tr[data-ledger]").forEach(function (tr) {
      tr.addEventListener("click", function () { toggleRow(tr.dataset.ledger); });
    });
    $all("#ledger-wrap .ledger-toggle").forEach(function (btn) {
      btn.addEventListener("click", function (e) { e.stopPropagation(); toggleRow(btn.getAttribute("aria-controls").replace("ledger-detail-", "")); });
    });
  }

  function initLoop() {
    var host = $("#cel-loop-host");
    host.innerHTML = window.Envoz.loopHTML("cel-loop-viz");
    $("#loop-replay").addEventListener("click", function () {
      window.Envoz.animateLoop($("#cel-loop-viz"));
    });
  }
  var loopPlayed = false;
  function playLoopOnce() {
    if (loopPlayed) return;
    loopPlayed = true;
    setTimeout(function () { window.Envoz.animateLoop($("#cel-loop-viz")); }, 450);
  }

  /* ==================== Tab 4 · Nico Success Agent ==================== */
  var MONITORS = [
    "Routing accuracy", "SLA risk", "Unknown-service categories", "Staff correction trends",
    "After-hours surge patterns", "Neighborhood service disparities", "Language access quality",
    "Repeated status-check topics", "Duplicate / related clusters", "Dirty configuration data",
    "Connector health", "Knowledge-base freshness", "External referral gaps", "Council-report accomplishments"
  ];

  var REC_AUDIT = {
    "rec-storm-drain": "LL-1042", "rec-spanish-vocab": "LL-1043", "rec-storm-subcat": "LL-1044",
    "rec-trash-data": "LL-1046", "rec-council-report": "LL-1048", "rec-sla-threshold": "LL-1047"
  };
  var REC_SANDBOX_RESULT = {
    "rec-storm-drain": "Rule tested against 47 historical cases · expected reroute reduction: 14%",
    "rec-spanish-vocab": "Vocabulary tested against 62 recorded demo calls · expected address-confidence gain: +11%",
    "rec-trash-data": "Cleanup validated against 17 flagged rows · 0 grounded-answer conflicts remain",
    "rec-storm-subcat": "Subcategory replayed against the 14-report storm cluster · 14/14 routed confidently",
    "rec-council-report": "Report compiled from 1,248 logged interactions · every figure traced to an audit id",
    "rec-sla-threshold": "Threshold replayed against 90 days of parks cases · 9 at-risk cases flagged earlier"
  };

  function recStatus(rec) { return state.recStatus[rec.id] || rec.status; }

  function renderAgentCard() {
    var a = D.agent;
    $("#agent-card").innerHTML =
      '<div class="flex flex-wrap" style="align-items:flex-start;gap:16px">' +
      '<span class="agent-orb" aria-hidden="true"></span>' +
      '<div style="flex:1;min-width:240px">' +
      '<div class="flex flex-wrap" style="gap:8px"><h3 style="margin:0">Nico · Success Agent</h3>' +
      '<span class="chip chip-green"><span class="dot"></span>' + esc(a.status) + "</span>" +
      '<span class="chip chip-outline">Last review: ' + esc(a.lastReview) + "</span></div>" +
      '<p class="small" style="margin:8px 0 4px;color:var(--muted)"><strong>Current focus:</strong> ' + esc(a.focus) + "</p>" +
      '<div class="chip-row">' + window.Envoz.confidenceChip(parseInt(a.confidence, 10)) +
      '<span class="chip chip-rationale">Confidence that current focus is the highest-impact fix</span></div>' +
      "</div></div>" +
      '<div class="agent-stats">' +
      '<div class="kpi"><span class="kpi-value">' + a.openRecs + '</span><br><span class="kpi-label">Open recommendations</span></div>' +
      '<div class="kpi"><span class="kpi-value">' + a.readyForApproval + '</span><br><span class="kpi-label">Ready for approval</span></div>' +
      '<div class="kpi"><span class="kpi-value">' + esc(a.hoursSavedIfApproved) + '</span><br><span class="kpi-label">Staff hours saved if approved</span></div>' +
      '<div class="kpi"><span class="kpi-value">' + esc(a.nextCouncilUpdate) + '</span><br><span class="kpi-label">Next council update</span></div>' +
      "</div>";
  }

  function renderMonitors() {
    $("#agent-monitors").innerHTML = MONITORS.map(function (m) {
      return '<span class="chip chip-teal" role="listitem">' + esc(m) + "</span>";
    }).join("");
  }

  function matchesFilter(rec) {
    var st = recStatus(rec);
    if (state.recFilter === "all") return true;
    if (state.recFilter === "ready") return /ready/i.test(st);
    if (state.recFilter === "open") return /open|in sandbox/i.test(st);
    if (state.recFilter === "approved") return /approved/i.test(st);
    return true;
  }

  function renderRecCards() {
    var host = $("#rec-cards");
    var list = D.recommendations.filter(matchesFilter);
    if (!list.length) {
      host.innerHTML = '<div class="card card-flat" style="grid-column:1/-1;text-align:center;color:var(--muted)">No recommendations match this filter yet.</div>';
      return;
    }
    host.innerHTML = list.map(function (rec) {
      var st = recStatus(rec);
      return '<div class="card card-hover rec-card" data-rec="' + rec.id + '">' +
        '<div class="flex space-between" style="align-items:flex-start;gap:10px">' +
        '<button class="rec-title-btn" type="button" data-rec-open="' + rec.id + '" aria-haspopup="dialog">' + esc(rec.title) + "</button>" +
        statusChipFor(st) + "</div>" +
        '<p class="small" style="margin:10px 0 0;color:var(--muted)">' + esc(rec.evidence) + "</p>" +
        '<div class="rec-meta"><span><strong>Impact:</strong> ' + esc(rec.impact) + "</span>" +
        "<span><strong>Owner:</strong> " + esc(rec.owner) + "</span></div>" +
        '<div class="chip-row" style="margin-bottom:12px">' + riskChip(rec.risk) +
        '<span class="chip chip-outline">' + esc(rec.scope) + "</span>" +
        '<span class="chip chip-outline mono">' + esc(REC_AUDIT[rec.id]) + "</span></div>" +
        '<div class="flex flex-wrap">' + rec.buttons.map(function (b, k) {
          return '<button class="btn ' + (k === 0 ? "btn-primary" : "btn-secondary") + ' btn-sm" type="button" data-rec-action="' + esc(b) + '" data-rec-id="' + rec.id + '">' + esc(b) + "</button>";
        }).join("") + "</div>" +
        '<div class="rec-ribbon"></div></div>';
    }).join("");

    if (/approved/i.test("")) { /* noop */ }

    $all(".rec-card", host).forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest("button") && !e.target.closest("[data-rec-open]")) return;
        openRecDrawer(findRec(card.dataset.rec), {});
      });
      var st = state.recStatus[card.dataset.rec];
      if (st && /approved/i.test(st)) {
        var rec = findRec(card.dataset.rec);
        card.querySelector(".rec-ribbon").innerHTML =
          '<div class="audit-ribbon" style="margin-top:12px"><span>🛡</span><span>Approved by City of Vista Robles · logged · <span class="mono">' + esc(REC_AUDIT[rec.id]) + "</span></span></div>";
      }
    });

    $all("[data-rec-action]", host).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        handleRecButton(btn.dataset.recId, btn.dataset.recAction);
      });
    });
  }

  function findRec(id) {
    return D.recommendations.filter(function (r) { return r.id === id; })[0];
  }

  function handleRecButton(id, action) {
    var rec = findRec(id);
    if (/sandbox/i.test(action) && !/continue/i.test(action)) { openRecDrawer(rec, { sandbox: true }); return; }
    if (/^approve/i.test(action) || /add (vocabulary|to taxonomy)/i.test(action)) { openRecDrawer(rec, { focusApprove: true }); return; }
    if (/review examples/i.test(action)) { openRecDrawer(rec, { evidence: true }); return; }
    if (/generate report/i.test(action)) {
      activateTab("council");
      setTimeout(generateReport, 350);
      return;
    }
    if (/share draft/i.test(action)) { toast("Demo mode — export simulated"); return; }
    if (/assign review|send to review/i.test(action)) {
      state.recStatus[id] = "Assigned · under review";
      renderRecCards();
      toast("Assigned to " + rec.owner + " for review · logged " + REC_AUDIT[id]);
      return;
    }
    if (/cleanup task list/i.test(action)) { toast("Cleanup task list created · 17 items assigned to Sanitation"); return; }
    if (/continue sandbox only/i.test(action)) { toast("Kept in sandbox — no production change made"); return; }
    openRecDrawer(rec, {});
  }

  /* ---------- Drawer ---------- */
  var drawerEls = null, drawerOpener = null;

  function closeDrawer() {
    if (!drawerEls) return;
    drawerEls.overlay.remove();
    drawerEls.drawer.remove();
    document.removeEventListener("keydown", drawerEsc);
    drawerEls = null;
    if (drawerOpener && document.contains(drawerOpener)) drawerOpener.focus();
    drawerOpener = null;
  }
  function drawerEsc(e) { if (e.key === "Escape") closeDrawer(); }

  function openRecDrawer(rec, opts) {
    if (!rec) return;
    closeDrawer();
    drawerOpener = document.activeElement;
    var audit = REC_AUDIT[rec.id];
    var st = recStatus(rec);
    var approved = /approved for/i.test(st);

    var overlay = document.createElement("div");
    overlay.className = "drawer-overlay";
    overlay.addEventListener("click", closeDrawer);

    var drawer = document.createElement("div");
    drawer.className = "drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", rec.title + " — recommendation details");

    var cases = rec.sampleCases.length
      ? rec.sampleCases.map(function (c) {
          return '<a class="chip chip-ocean" href="staff-triage.html?case=' + esc(c) + '" style="text-decoration:none">' + esc(c) + " ↗</a>";
        }).join(" ")
      : '<span class="small" style="color:var(--muted)">No individual cases — this change is program-level.</span>';

    drawer.innerHTML =
      '<div class="flex space-between" style="align-items:flex-start;gap:10px">' +
      "<div><h3>" + esc(rec.title) + "</h3>" +
      '<div class="chip-row"><span id="drawer-status">' + statusChipFor(st) + "</span>" + riskChip(rec.risk) + "</div></div>" +
      '<button class="modal-close" type="button" aria-label="Close details panel">✕</button></div>' +

      '<div class="d-section" id="drawer-evidence"><div class="d-label">Evidence</div>' +
      '<p class="small" style="margin:0 0 8px">' + esc(rec.evidence) + "</p>" +
      '<p class="small" style="margin:0;color:var(--muted)">' + esc(LEDGER_DETAIL[audit] || "Captured automatically from staff corrections, SLA outcomes, and interaction logs — every signal is evidence-linked.") + "</p></div>" +

      '<div class="d-section"><div class="d-label">Sample cases</div><div class="chip-row">' + cases + "</div></div>" +

      '<div class="d-section"><div class="d-label">Suggested action</div><p class="small" style="margin:0">' + esc(rec.action) + "</p></div>" +

      '<div class="d-section"><div class="d-label">Expected impact</div><p class="small" style="margin:0"><strong>' + esc(rec.impact) + "</strong> · Owner: " + esc(rec.owner) + "</p></div>" +

      '<div class="d-section"><div class="d-label">Governance scope</div>' +
      '<div class="chip-row"><span class="chip chip-navy">' + esc(rec.scope) + "</span></div>" +
      '<p class="small" style="margin:8px 0 0;color:var(--muted)">Scoped to Vista Robles only. One city’s correction never changes the global taxonomy — cross-city changes need multi-city evidence and separate review.</p></div>' +

      '<div class="d-section"><div class="d-label">Audit trail</div><ul class="audit-list">' +
      '<li><span class="mono">' + esc(audit) + "</span><span>Signal captured &amp; recommendation drafted</span></li>" +
      '<li><span class="mono">' + esc(audit) + "-S</span><span>Sandbox suite prepared (historical replay)</span></li>" +
      '<li><span class="mono">' + esc(audit) + "-A</span><span>Approval decision — pending city sign-off</span></li></ul></div>" +

      '<div class="d-section"><div class="d-label">Sandbox test</div>' +
      '<button class="btn btn-secondary btn-sm" type="button" id="drawer-sandbox">▶ Run sandbox test</button>' +
      '<div id="sandbox-zone" style="margin-top:10px" aria-live="polite">' +
      (state.sandboxDone[rec.id] ? '<div class="proof-strip"><span class="proof-icon">✓</span>' + esc(REC_SANDBOX_RESULT[rec.id]) + "</div>" : "") +
      "</div></div>" +

      '<div class="d-section"><div class="d-label">Approve</div>' +
      '<fieldset style="border:none;padding:0;margin:0 0 10px"><legend class="small" style="font-weight:600;padding:0;margin-bottom:6px">Choose deployment scope</legend>' +
      '<label class="small" style="display:block;margin-bottom:4px"><input type="radio" name="approve-scope" value="sandbox" checked style="width:auto;margin-right:7px">Sandbox — test environment only</label>' +
      '<label class="small" style="display:block"><input type="radio" name="approve-scope" value="production" style="width:auto;margin-right:7px">Production — live routing (city approval logged)</label></fieldset>' +
      '<button class="btn btn-primary" type="button" id="drawer-approve"' + (approved ? " disabled" : "") + ">✓ Approve</button>" +
      '<div id="approve-zone" style="margin-top:12px" aria-live="polite">' +
      (approved ? '<div class="audit-ribbon"><span>🛡</span><span>Approved by City of Vista Robles · logged · <span class="mono">' + esc(audit) + "</span></span></div>" : "") +
      "</div>" +
      '<p class="small" style="color:var(--muted);margin:12px 0 0">Autonomous where safe. Approval-gated where civic trust matters.</p></div>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    document.addEventListener("keydown", drawerEsc);
    drawerEls = { overlay: overlay, drawer: drawer };

    drawer.querySelector(".modal-close").addEventListener("click", closeDrawer);
    drawer.querySelector(".modal-close").focus();

    $("#drawer-sandbox", drawer).addEventListener("click", function () { runSandbox(rec); });
    $("#drawer-approve", drawer).addEventListener("click", function () { approveRec(rec); });

    if (opts.sandbox) setTimeout(function () { runSandbox(rec); }, 500);
    if (opts.evidence) {
      var ev = $("#drawer-evidence", drawer);
      ev.classList.add("d-highlight");
      ev.scrollIntoView({ block: "nearest" });
      setTimeout(function () { ev.classList.remove("d-highlight"); }, 2600);
    }
    if (opts.focusApprove) {
      var ap = $("#drawer-approve", drawer);
      ap.scrollIntoView({ block: "center" });
      ap.focus();
    }
  }

  function runSandbox(rec) {
    if (!drawerEls) return;
    var zone = $("#sandbox-zone", drawerEls.drawer);
    var btn = $("#drawer-sandbox", drawerEls.drawer);
    btn.disabled = true;
    var steps = ["Loading historical cases…", "Replaying routing decisions…", "Comparing against staff corrections…"];
    zone.innerHTML = '<div class="small" id="sbx-step" style="font-weight:600;color:var(--teal-700)">' + esc(steps[0]) + "</div>" +
      '<div class="sbx-track"><div class="sbx-bar" id="sbx-bar"></div></div>';
    var bar = $("#sbx-bar", zone), stepEl = $("#sbx-step", zone);
    var pct = 0, si = 0;
    var iv = setInterval(function () {
      pct = Math.min(100, pct + 9 + Math.random() * 8);
      bar.style.width = pct + "%";
      var ni = Math.min(steps.length - 1, Math.floor(pct / 34));
      if (ni !== si) { si = ni; stepEl.textContent = steps[si]; }
      if (pct >= 100) {
        clearInterval(iv);
        setTimeout(function () {
          zone.innerHTML = '<div class="proof-strip"><span class="proof-icon">✓</span>' + esc(REC_SANDBOX_RESULT[rec.id]) + "</div>";
          state.sandboxDone[rec.id] = true;
          btn.disabled = false;
          btn.textContent = "↻ Re-run sandbox test";
          if (!/approved/i.test(recStatus(rec)) && !/ready/i.test(recStatus(rec))) {
            state.recStatus[rec.id] = "Ready for approval";
            var sc = $("#drawer-status", drawerEls.drawer);
            if (sc) sc.innerHTML = statusChipFor("Ready for approval");
            renderRecCards();
          }
          toast("Sandbox test passed · " + REC_AUDIT[rec.id] + "-S logged");
        }, 320);
      }
    }, 130);
  }

  function approveRec(rec) {
    if (!drawerEls) return;
    var scopeInput = drawerEls.drawer.querySelector('input[name="approve-scope"]:checked');
    var scope = scopeInput ? scopeInput.value : "sandbox";
    var newStatus = scope === "production" ? "Approved for production" : "Approved for sandbox";
    var audit = REC_AUDIT[rec.id];

    var sc = $("#drawer-status", drawerEls.drawer);
    sc.innerHTML = statusChipFor("Ready for approval");
    setTimeout(function () {
      if (!drawerEls) return;
      sc.innerHTML = statusChipFor(newStatus);
      $("#approve-zone", drawerEls.drawer).innerHTML =
        '<div class="audit-ribbon"><span>🛡</span><span>Approved by City of Vista Robles · logged · <span class="mono">' + esc(audit) + "</span></span></div>";
      var ab = $("#drawer-approve", drawerEls.drawer);
      ab.disabled = true;
      ab.textContent = "✓ " + newStatus;
    }, 420);

    state.recStatus[rec.id] = newStatus;
    renderRecCards();
    toast(newStatus + " · " + audit + " logged to the Civic Evidence Ledger");
  }

  /* ==================== Tab 5 · Council Proof ==================== */
  function statRow(stats) {
    return '<div class="stat-row">' + stats.map(function (s) {
      return '<div class="stat-callout"><div class="v">' + esc(s[0]) + '</div><div class="l">' + esc(s[1]) + "</div></div>";
    }).join("") + "</div>";
  }
  function sectionCard(title, inner) {
    return '<div class="card report-section"><h3>' + esc(title) + "</h3>" + inner +
      '<p class="disclaimer" style="margin:10px 0 0">Illustrative demo data · fictional City of Vista Robles</p></div>';
  }

  function buildReportSections() {
    var wk8 = WEEKS.slice(4);
    return [
      sectionCard("Executive summary",
        '<p class="small">In its first 90 days, Envoz 311 answered every resident call 24/7, routed ' + M.requestsCreated + " service requests into SeeClickFix with " + M.routingAccuracy + " accuracy, and raised SLA compliance 4.1 points — while capturing 327 after-hours calls that would previously have been voicemail.</p>" +
        statRow([[M.slaCompliance, "SLA compliance · ▲ 4.1 pts"], ["327", "After-hours calls captured"], [M.costPerInteraction, "Cost per AI-handled interaction"], [M.csat, "Resident CSAT"]])),
      sectionCard("Resident access gains",
        statRow([["100%", "24/7 coverage · 365 days"], [M.answeredBeforeSecondRing, "Answered before second ring"], [M.avgHold, "Average hold time"], [M.languages, "Languages served"]]) +
        '<div class="chart-sub">Status checks self-served without staff · last 8 weeks</div>' +
        lineChart({ labels: wk8, series: [{ values: BASE.deflect.slice(4), area: true }], yMin: 40, yMax: 90, h: 150, fmt: function (v) { return Math.round(v) + "%"; }, aria: "Line chart of self-served status checks rising to 78 percent" })),
      sectionCard("Operational performance",
        statRow([[M.routingAccuracy, "Routing accuracy"], [M.avgHandle, "Avg handle time"], [M.containment, "AI containment"], [M.unknownRate, "Unknown-service rate · ▼"]]) +
        '<div class="chart-sub">SLA compliance trend · last 8 weeks</div>' +
        lineChart({ labels: wk8, series: [{ values: BASE.sla.slice(4), area: true }], yMin: 88, yMax: 96, h: 150, fmt: function (v) { return v.toFixed(1) + "%"; }, aria: "Line chart of SLA compliance rising to 93.4 percent" })),
      sectionCard("Equity and language access",
        '<p class="small">All eight neighborhoods sit within a 5-point SLA band. Spanish-language address confidence near School Zone South is the one flagged disparity — a vocabulary fix is ready for approval (+11% expected).</p>' +
        statRow([["8 / 8", "Neighborhoods in SLA band"], ["18", "Languages served this quarter"], ["94%", "Spanish routing confidence"], ["+11%", "Address-confidence fix ready"]])),
      sectionCard("Cost savings",
        statRow([["$17.7k", "Est. cost avoided (90 days)"], [M.staffHoursSaved + " hrs", "Staff hours saved"], [M.costPerInteraction, "Per AI-handled interaction"], ["~$7.60", "Est. human handling cost"]]) +
        '<div class="chart-sub">Monthly cost comparison ($ thousands)</div>' +
        legend([["Est. human handling", OCEAN], ["Envoz AI-handled", TEAL]]) +
        groupedBars({ labels: BASE.cost.labels, series: [{ name: "Est. human handling", color: OCEAN, values: BASE.cost.human }, { name: "Envoz AI-handled", color: TEAL, values: BASE.cost.ai }], fmt: function (v) { return "$" + (Math.round(v * 10) / 10) + "k"; }, aria: "Grouped bars comparing human and AI handling cost by month" })),
      sectionCard("Service gaps discovered",
        '<p class="small">The Continuous Civic Improvement Loop surfaced 6 service gaps this quarter — 3 with fixes ready for approval. Top three by expected impact:</p>' +
        '<ul class="small" style="line-height:1.9"><li><strong>Storm-drain misroutes:</strong> 19 corrections → proximity rule drafted (−14% reroutes)</li>' +
        "<li><strong>Spanish address confidence near schools:</strong> vocabulary additions (+11% confidence)</li>" +
        "<li><strong>Harbor View parks SLA lag:</strong> early-warning alert at 60% of SLA window</li></ul>" +
        statRow([["6", "Gaps discovered"], ["3", "Fixes ready for approval"], ["47", "Staff corrections learned from"]])),
      sectionCard("Next-quarter recommendations",
        '<ul class="small" style="line-height:1.9"><li>Approve the storm-drain proximity routing rule before winter surge season</li>' +
        "<li>Deploy Spanish landmark vocabulary for School Zone South</li>" +
        "<li>Enable parks SLA-risk alerts for Harbor View</li>" +
        "<li>Expand proactive SMS status updates to all departments</li></ul>" +
        statRow([["42 hrs/mo", "Staff time saved if approved"], ["−14%", "Expected reroute reduction"], ["Friday", "Next council update"]]))
    ];
  }

  function generateReport() {
    if (state.reportBuilding) return;
    if (state.reportBuilt) {
      $("#council-report").scrollIntoView({ behavior: "smooth", block: "start" });
      toast("Report already generated — scroll through it below");
      return;
    }
    state.reportBuilding = true;
    var host = $("#council-report");
    var btn = $("#generate-report");
    btn.disabled = true;

    host.innerHTML =
      '<div class="card" style="border-top:4px solid var(--navy-900)">' +
      '<div class="flex space-between flex-wrap"><div>' +
      '<span class="eyebrow">Council-ready proof report</span>' +
      '<h2 style="margin-bottom:2px">Vista Robles 311 Modernization: First 90 Days</h2>' +
      '<p class="small" style="color:var(--muted);margin:0">Prepared by the Nico Success Agent · every figure traces to a logged interaction or audit id · illustrative demo data</p>' +
      '</div><span class="chip chip-outline">Draft · ' + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + "</span></div>" +
      '<div class="build-status" id="build-status" style="margin-top:14px"><span class="build-dot" aria-hidden="true"></span><span id="build-msg">Compiling evidence from the Civic Evidence Ledger…</span></div>' +
      "</div><div id=\"report-sections\"></div><div id=\"report-actions\"></div>";

    var sections = buildReportSections();
    var wrap = $("#report-sections");
    var msg = $("#build-msg");
    var names = ["Executive summary", "Resident access gains", "Operational performance", "Equity & language access", "Cost savings", "Service gaps discovered", "Next-quarter recommendations"];

    sections.forEach(function (html, i) {
      setTimeout(function () {
        msg.textContent = "Building section " + (i + 1) + " of " + sections.length + " · " + names[i] + "…";
        wrap.insertAdjacentHTML("beforeend", html);
        var el = wrap.lastElementChild;
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("built"); }); });
      }, 520 * i);
    });

    setTimeout(function () {
      $("#build-status").innerHTML = '<div class="proof-strip" style="flex:1"><span class="proof-icon">✓</span>Report generated from ' + M.requestsCreated + " logged service requests · 7 sections · ready to present</div>";
      $("#report-actions").innerHTML =
        '<div class="card report-section built" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between">' +
        '<div class="flex flex-wrap">' +
        '<button class="btn btn-navy" type="button" data-export="PDF">⬇ Export PDF</button>' +
        '<button class="btn btn-secondary" type="button" data-export="PowerPoint">⬇ Export PowerPoint</button>' +
        '<button class="btn btn-secondary" type="button" data-export="Share link">🔗 Share link</button></div>' +
        '<span class="disclaimer">Exports are simulated in this demo environment.</span></div>';
      $all("[data-export]").forEach(function (b) {
        b.addEventListener("click", function () { toast("Demo mode — export simulated"); });
      });
      state.reportBuilding = false;
      state.reportBuilt = true;
      btn.disabled = false;
      btn.textContent = "↻ Regenerate report";
      btn.addEventListener("click", function () {
        state.reportBuilt = false;
        generateReport();
      }, { once: true });
    }, 520 * sections.length + 300);

    setTimeout(function () {
      host.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }

  /* ==================== Tabs ==================== */
  var TAB_KEYS = ["performance", "gaps", "cel", "agent", "council"];

  function activateTab(key, skipUrl) {
    if (TAB_KEYS.indexOf(key) === -1) key = "performance";
    state.tab = key;
    TAB_KEYS.forEach(function (k) {
      var btn = $("#tab-" + k), panel = $("#panel-" + k);
      var sel = k === key;
      btn.setAttribute("aria-selected", String(sel));
      btn.tabIndex = sel ? 0 : -1;
      panel.hidden = !sel;
    });
    if (!skipUrl) {
      var url = new URL(location.href);
      url.searchParams.set("tab", key);
      ["mode", "rec", "sandbox", "evidence", "filter", "generate"].forEach(function (p) { url.searchParams.delete(p); });
      history.replaceState(null, "", url);
    }
    if (key === "cel") { animateCounters(); playLoopOnce(); }
  }

  function initTabs() {
    var tablist = $("#dash-tabs");
    $all(".tab", tablist).forEach(function (btn) {
      btn.addEventListener("click", function () { activateTab(btn.dataset.tab); });
    });
    tablist.addEventListener("keydown", function (e) {
      var idx = TAB_KEYS.indexOf(state.tab);
      var next = null;
      if (e.key === "ArrowRight") next = (idx + 1) % TAB_KEYS.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + TAB_KEYS.length) % TAB_KEYS.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = TAB_KEYS.length - 1;
      if (next !== null) {
        e.preventDefault();
        activateTab(TAB_KEYS[next]);
        $("#tab-" + TAB_KEYS[next]).focus();
      }
    });
  }

  /* ==================== Nico command claims ==================== */
  function initNicoClaims() {
    document.addEventListener("nico:command", function (e) {
      var t = e.detail.text || "";
      if (/surge/i.test(t)) {
        e.detail.handled = true;
        e.detail.reply = state.surge
          ? "Storm surge mode is already on — you’re looking at the Jan 14 replay."
          : "Switching to storm surge mode — replaying the Jan 14 storm: 4.2× call volume, 81% containment, Oak Bluff hotspot.";
        activateTab("performance");
        setSurge(true);
        $("#panel-performance").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (/loop|improvement loop|civic improvement/i.test(t)) {
        e.detail.handled = true;
        e.detail.reply = "Here’s the Continuous Civic Improvement Loop, embedded right in the CEL Learning tab — watch it run.";
        activateTab("cel");
        setTimeout(function () {
          $("#cel-loop-card").scrollIntoView({ behavior: "smooth", block: "start" });
          window.Envoz.animateLoop($("#cel-loop-viz"));
        }, 400);
      }
    });
  }

  /* ==================== Controls ==================== */
  function initControls() {
    $all("#range-pills .filter-pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        if (state.surge) return;
        state.range = parseInt(pill.dataset.range, 10);
        $all("#range-pills .filter-pill").forEach(function (p) {
          p.setAttribute("aria-pressed", String(p === pill));
        });
        renderPerformance();
      });
    });
    $("#surge-toggle").addEventListener("click", function () { setSurge(!state.surge); });
    $("#generate-report").addEventListener("click", generateReport);
    $all("#rec-filters .filter-pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        state.recFilter = pill.dataset.filter;
        $all("#rec-filters .filter-pill").forEach(function (p) {
          p.setAttribute("aria-pressed", String(p === pill));
        });
        renderRecCards();
      });
    });
  }

  /* ==================== URL params ==================== */
  function applyParams() {
    var P = window.Envoz.param;
    var tab = P("tab");
    var rec = P("rec");
    var filter = P("filter");

    if (filter === "ready") {
      state.recFilter = "ready";
      $all("#rec-filters .filter-pill").forEach(function (p) {
        p.setAttribute("aria-pressed", String(p.dataset.filter === "ready"));
      });
      renderRecCards();
      if (!tab && !rec) tab = "agent";
    }
    if (rec && !tab) tab = "agent";
    if (tab) activateTab(tab, true);

    if (P("mode") === "surge") setSurge(true);

    if (rec) {
      var r = findRec(rec);
      if (r) {
        setTimeout(function () {
          openRecDrawer(r, { sandbox: P("sandbox") === "1", evidence: P("evidence") === "1" });
        }, 500);
      }
    }
    if (P("generate") === "1" && state.tab === "council") {
      setTimeout(generateReport, 600);
    }
  }

  /* ==================== boot ==================== */
  document.addEventListener("DOMContentLoaded", function () {
    initTabs();
    initControls();
    initNicoClaims();
    renderPerformance();
    renderGaps();
    renderCelCounters();
    renderLedger();
    initLoop();
    renderAgentCard();
    renderMonitors();
    renderRecCards();
    applyParams();
  });
})();
