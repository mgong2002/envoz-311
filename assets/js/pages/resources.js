/* ============================================================
   Envoz 311 — Resources / FAQ page behavior
   FAQ keyword filter + resource modals (page-only data)
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Resource library (page-only data) ---------------- */
  var RESOURCES = {
    "pilot-playbook": {
      title: "The 90-day Envoz 311 pilot playbook",
      chip: '<span class="chip chip-teal">Pilot planning</span>',
      html:
        '<p><strong>Days 1–14 · Configure and sandbox.</strong> Kick off with a working session where your 311 lead talks Nico through departments, service categories, GIS layers, and schedules — the Harbor Mesa demo shows this taking about 12 minutes of conversation, with a sandbox tenant standing about 48 hours later. Staff run test calls against the sandbox (like case HM-TEST-1042) and correct anything Nico gets wrong; every correction becomes tenant-scoped learning before a single resident ever calls.</p>' +
        '<p><strong>Days 15–45 · Go live after hours.</strong> Route only evening, overnight, and weekend calls to Envoz first, the hours where the alternative is voicemail. This is the lowest-risk, highest-contrast slice: staff arrive each morning to a clean, prioritized queue instead of a tape of voicemails, and you accumulate before/after evidence without touching daytime operations. Review the CEL Ledger weekly and approve the improvements worth keeping.</p>' +
        '<p><strong>Days 46–90 · Expand coverage and prove it.</strong> Extend to daytime overflow, watch containment and routing accuracy trend in the dashboard, and let Nico&rsquo;s improvement recommendations queue up its first city-only rules. Before day one, agree on the pilot metrics in writing (after-hours capture rate, answer speed, routing accuracy, staff triage hours, and resident callbacks) so the day-90 council report is a comparison, not a claim. Then <a href="dashboards.html?tab=council&generate=1">generate the council report</a> from live evidence.</p>',
      cta: '<a class="btn btn-primary btn-sm" href="pilot-pricing.html">See pilot &amp; pricing</a> <a class="btn btn-secondary btn-sm" href="configuration-studio.html?flow=harbor-mesa">Run the onboarding demo</a>'
    },
    "council-template": {
      title: "Council presentation template — outline",
      chip: '<span class="chip chip-navy">Council-ready</span>',
      html:
        '<p><strong>Open with the 9:42 PM problem, not the technology.</strong> Slide 1–2: one resident story — a dangerous pothole reported after hours that became a voicemail — and the numbers behind it (calls missed after 5 PM, morning triage hours, residents who never heard back). Slide 3: what changed — every call now answered before the second ring, classified, geo-tagged, and written into the city&rsquo;s existing system with a real case number. Keep the word &ldquo;AI&rdquo; secondary to the word &ldquo;answered.&rdquo;</p>' +
        '<p><strong>Prove it with four metric families, one slide each.</strong> Access (after-hours calls captured, languages served), speed (answer time, time-to-route), accuracy (routing accuracy, staff corrections trending down), and cost (cost per interaction, staff hours returned to field work). Pull each from the dashboard so every number traces to real cases — and label anything from the demo world as illustrative. Add one equity slide: coverage by neighborhood and language, because that is the question council will ask.</p>' +
        '<p><strong>Close with governance and a specific ask.</strong> One slide on guardrails — 911 redirect with no 311 case, case numbers only from the system of record, staff approval on every AI-learned change, full audit trail — and one slide with the ask: approve the next phase, with the metrics you will report at the next check-in. <a href="customer-success.html">Customer Success</a> shows how a Vista Robles city manager presents this arc.</p>',
      cta: '<a class="btn btn-primary btn-sm" href="dashboards.html?tab=council&generate=1">Generate a sample council report</a>'
    },
    "taxonomy-guide": {
      title: "311 taxonomy starter guide",
      chip: '<span class="chip chip-ocean">Configuration</span>',
      html:
        '<p><strong>Start from your top ~40 request types, not a 400-line wishlist.</strong> Pull twelve months of case history and rank by volume — in most cities, roughly 40 categories cover 90%+ of requests (potholes, streetlights, dumping, water issues, trees, abandoned vehicles, animal control, noise). Give every category exactly one owning department and an SLA; a category nobody owns is a case nobody closes. Ambiguous pairs — water pooling: Streets or Utilities? — deserve an explicit tie-breaker rule up front, because those are the cases staff will otherwise re-route by hand.</p>' +
        '<p><strong>Wire categories to your GIS layers before go-live.</strong> Road ownership, storm-drain assets, streetlight poles, parks boundaries, and school zones let Envoz resolve jurisdiction (&ldquo;city street or county road?&rdquo;) and priority (&ldquo;school-zone crosswalk&rdquo;) automatically. This is usually the data-cleanup work that sets the production timeline, so start it in week one.</p>' +
        '<p><strong>Plan for the unknowns queue: it is a feature, not a failure.</strong> Requests that don&rsquo;t confidently match any category (the beehive in a bus shelter) are filed as other_unknown with a case number and held for human review instead of being force-fitted, and repeated unmatched phrases become taxonomy candidates: 14 &ldquo;storm grate burbling&rdquo; reports in the demo produced a proposed storm-drain backup subcategory that staff approve into the taxonomy. Your taxonomy is a living document; the <a href="dashboards.html?tab=cel">CEL Ledger</a> shows it evolving.</p>',
      cta: '<a class="btn btn-primary btn-sm" href="configuration-studio.html">Open Configuration Studio</a>'
    },
    "overlay-guide": {
      title: "Overlay vs standalone — a decision guide",
      chip: '<span class="chip chip-amber">Deployment</span>',
      html:
        '<p><strong>Choose overlay if your CRM works and people use it.</strong> Ask five questions: Do staff live in the CRM daily? Does it expose a usable write API? (SeeClickFix and Open311 systems are the production reference today; Accela and Salesforce connect via partner API; Tyler, QAlert, Cityworks, and OpenGov EAM are on the Open311-style roadmap.) Do residents recognize its case numbers? Is the contract healthy for 18+ months? Is the data worth keeping? Mostly yes → overlay. Envoz answers the voice channel, classifies and routes, and writes cases into your CRM: the CRM issues the case number and remains the system of record. Nothing about staff workflow changes except the quality of what arrives.</p>' +
        '<p><strong>Choose standalone if there is no usable system to arm.</strong> Cities running on shared inboxes and sticky notes — or with a CRM staff have quietly abandoned — get a lightweight staff triage console, structured-email dispatch to departments, and thin case surfaces with local VR case numbers. It is deliberately thin: enough to give residents a trackable case and staff a clean queue, without becoming the CRM project you were avoiding.</p>' +
        '<p><strong>You are not locked in either way.</strong> Standalone cities that later buy a CRM flip to overlay mode without re-onboarding residents; overlay cities changing CRM vendors keep Envoz constant while the system of record changes underneath. The taxonomy, learned rules, and evidence history carry over because they are tenant assets, not CRM assets. Compare the modes on <a href="platform.html">Platform</a> and the connectors on <a href="integrations.html">Integrations</a>.</p>',
      cta: '<a class="btn btn-primary btn-sm" href="integrations.html">Explore integrations</a> <button class="btn btn-secondary btn-sm" type="button" onclick="Envoz.openCompareModal()">Compare with SeeClickFix</button>'
    },
    "trust-onepager": {
      title: "Trust & governance — the one-pager",
      chip: '<span class="chip chip-green">Governance</span>',
      html:
        '<p><strong>Safety first, on every single call.</strong> The safety gate runs before anything else: emergencies are redirected to 911 and no ordinary 311 case is created. Case numbers come only from the system of record — never generated by the AI — and Nico confirms nothing to a resident until write-back proof exists. If a write fails, Envoz retries with idempotency or falls back to structured email, and tells the resident the truth. No fabricated case numbers, no invented repair dates.</p>' +
        '<p><strong>Humans approve every change; every action is audited.</strong> Confidence and rationale are visible on each routing decision, and low confidence means a warm transfer with full context — never a guess. AI-learned improvements are scoped (this case → city-only rule → department memory → global evidence), sandbox-tested against historical cases, versioned, and deployed only after staff approval. All of it flows through the MetaEngage.ai Proxy Gate and audit trail, so governance is enforced by infrastructure, not by policy documents.</p>' +
        '<p><strong>The city owns its data, tenant-scoped end to end.</strong> Consent is recorded on every interaction, data is never mixed across tenants, and transcripts, cases, and learning evidence are exportable city property. The full detail — data model, retention, governed autonomy — lives on the <a href="trust.html">Trust page</a>.</p>',
      cta: '<a class="btn btn-primary btn-sm" href="trust.html">Read the full Trust page</a>'
    },
    "glossary": {
      title: "Glossary of civic AI terms",
      chip: '<span class="chip chip-purple">Reference</span>',
      html:
        '<p class="small" style="color:var(--muted)">The seven terms you&rsquo;ll meet across the Envoz 311 platform, defined plainly.</p>' +
        '<dl class="glossary-dl" style="margin:0">' +
        '<dt>CEL (Continuous Evaluation Loop)</dt><dd>The append-only record where every interaction outcome (routing accuracy, staff corrections, handle time, containment, SLA results, language confidence) is logged as evidence. The CEL is the &ldquo;Measure&rdquo; step of the Continuous Evaluation Loop and the source for every dashboard number and council report. Browse it in the <a href="dashboards.html?tab=cel">CEL Ledger</a>.</dd>' +
        '<dt>Proxy Gate</dt><dd>The MetaEngage.ai infrastructure control point between the AI and city systems of record. Every write the AI attempts passes through the Proxy Gate, is checked against approved scopes, and is audited — the AI never touches a CRM directly. This is how &ldquo;case numbers only from the system of record&rdquo; is enforced by architecture, not by promise.</dd>' +
        '<dt>Containment</dt><dd>The share of interactions fully resolved by the AI without needing a human — 76% in the Vista Robles demo. Measured honestly: a warm transfer counts as an escalation, not a contained call, so the number reflects real resident outcomes.</dd>' +
        '<dt>Warm transfer</dt><dd>A low-confidence handoff to a human with the full context attached — transcript, candidate classifications, and resolved location — so the resident never repeats themselves. The opposite of &ldquo;let me transfer you&rdquo; followed by starting over.</dd>' +
        '<dt>City-only rule</dt><dd>A routing rule learned from one city&rsquo;s corrections and applied only within that tenant. Example: after 19 water-pooling cases were corrected from Streets to Utilities, Vista Robles staff can approve a rule routing pooling reports within 30 feet of a storm-drain asset to Utilities. Other cities never inherit it unless their staff approve it as evidence.</dd>' +
        '<dt>Department memory</dt><dd>Learned vocabulary or preferences scoped to a single department within a city — for example, adding local school nicknames and crosswalk landmarks to Spanish location resolution for school-zone cases. Narrower than a city-only rule; broader than a single case.</dd>' +
        '<dt>Taxonomy candidate</dt><dd>A proposed new service category surfaced by repeated phrases that don&rsquo;t match the current taxonomy — like &ldquo;storm grate burbling&rdquo; appearing 14 times during a storm surge. Candidates wait in review with their evidence attached until staff approve them into the city taxonomy; nothing is added automatically.</dd>' +
        '</dl>',
      cta: '<a class="btn btn-primary btn-sm" href="platform.html">See the terms in context on Platform</a>'
    }
  };

  function openResource(id) {
    var r = RESOURCES[id];
    if (!r) return;
    window.Envoz.openModal(
      '<div class="chip-row" style="margin-bottom:10px">' + r.chip +
      '<span class="chip chip-outline">Envoz 311 resource</span></div>' +
      "<h3>" + r.title + "</h3>" +
      r.html +
      '<hr class="divider">' +
      '<div class="flex flex-wrap">' + r.cta + "</div>" +
      '<p class="disclaimer" style="margin:14px 0 0">Vista Robles and Harbor Mesa are fictional demonstration cities; all metrics are illustrative demo data.</p>'
    );
  }

  /* ---------------- FAQ keyword filter ---------------- */
  var searchInput, countEl, emptyEl, listEl;
  var items = []; // { el, group, text }
  var groups = []; // { el }

  function indexFaq() {
    listEl.querySelectorAll(".faq-group").forEach(function (g) {
      groups.push(g);
      g.querySelectorAll("details.faq-item").forEach(function (d) {
        items.push({
          el: d,
          group: g,
          text: (d.textContent || "").toLowerCase()
        });
      });
    });
  }

  function applyFilter(raw) {
    var q = raw.trim().toLowerCase();
    var shown = 0;

    items.forEach(function (it) {
      var match = q === "" || it.text.indexOf(q) !== -1;
      it.el.style.display = match ? "" : "none";
      if (match) shown++;
    });

    groups.forEach(function (g) {
      var any = false;
      g.querySelectorAll("details.faq-item").forEach(function (d) {
        if (d.style.display !== "none") any = true;
      });
      g.style.display = any ? "" : "none";
    });

    emptyEl.style.display = shown === 0 ? "block" : "none";

    if (q === "") {
      countEl.textContent = "Showing all " + items.length + " questions";
    } else if (shown === 0) {
      countEl.textContent = "No matches for “" + raw.trim() + "”";
    } else {
      countEl.textContent =
        "Showing " + shown + " of " + items.length + " questions matching “" + raw.trim() + "”";
    }
  }

  function setAllOpen(open) {
    items.forEach(function (it) {
      if (it.el.style.display !== "none") it.el.open = open;
    });
  }

  /* ---------------- Fill data-icon placeholders with shared SVG icons ---------------- */
  function fillIcons() {
    if (!window.Envoz || !window.Envoz.icon) return;
    document.querySelectorAll("[data-icon]").forEach(function (el) {
      var name = el.getAttribute("data-icon");
      if (name) el.innerHTML = window.Envoz.icon(name);
    });
  }

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    fillIcons();

    // Resource modals
    document.querySelectorAll("[data-resource]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openResource(btn.getAttribute("data-resource"));
      });
    });

    // FAQ filter
    searchInput = document.getElementById("faq-search");
    countEl = document.getElementById("faq-count");
    emptyEl = document.getElementById("faq-empty");
    listEl = document.getElementById("faq-list");
    if (searchInput && countEl && emptyEl && listEl) {
      indexFaq();
      searchInput.addEventListener("input", function () { applyFilter(searchInput.value); });
      document.getElementById("faq-clear").addEventListener("click", function () {
        searchInput.value = "";
        applyFilter("");
        searchInput.focus();
      });
    }

    // Expand / collapse all
    var expand = document.getElementById("faq-expand");
    var collapse = document.getElementById("faq-collapse");
    if (expand) expand.addEventListener("click", function () { setAllOpen(true); });
    if (collapse) collapse.addEventListener("click", function () { setAllOpen(false); });

    // Deep link: open a specific FAQ item via #hash
    if (location.hash) {
      var target = document.querySelector('details.faq-item' + location.hash.replace(/[^#\w-]/g, ""));
      if (target) {
        target.open = true;
        target.scrollIntoView({ block: "center" });
      }
    }

    // Let Nico answer glossary questions on this page
    document.addEventListener("nico:command", function (e) {
      var t = e.detail.text;
      if (/glossary|what does .*(cel|proxy gate|containment|warm transfer)/i.test(t)) {
        e.detail.handled = true;
        e.detail.reply = "Opening the civic AI glossary — CEL, Proxy Gate, containment, warm transfer, and more.";
        setTimeout(function () { openResource("glossary"); }, 600);
      }
    });
  });
})();
