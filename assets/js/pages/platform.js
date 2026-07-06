/* Platform page — deployment mode toggle, improvement loop embed, failure drill */
(function () {
  "use strict";

  /* ---------------- Deployment mode toggle ---------------- */
  function initModeToggle() {
    const tabs = [
      { btn: document.getElementById("tab-overlay"), panel: document.getElementById("panel-overlay") },
      { btn: document.getElementById("tab-standalone"), panel: document.getElementById("panel-standalone") }
    ];
    if (!tabs[0].btn || !tabs[1].btn) return;

    function select(idx) {
      tabs.forEach(function (t, i) {
        const on = i === idx;
        t.btn.setAttribute("aria-selected", String(on));
        t.btn.classList.toggle("active", on);
        t.panel.hidden = !on;
      });
    }

    tabs.forEach(function (t, i) {
      t.btn.addEventListener("click", function () { select(i); });
      t.btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const next = (i + 1) % tabs.length;
          select(next);
          tabs[next].btn.focus();
        }
      });
    });
    select(0);
  }

  /* ---------------- Continuous Civic Improvement Loop ---------------- */
  function initLoop() {
    const host = document.getElementById("loop-host");
    const btn = document.getElementById("animate-loop-btn");
    if (!host || !window.Envoz) return;

    host.innerHTML = Envoz.loopHTML("loop-viz");

    if (btn) {
      btn.addEventListener("click", function () {
        const viz = document.getElementById("loop-viz");
        if (!viz) return;
        btn.disabled = true;
        Envoz.animateLoop(viz);
        // Loop has 9 steps at 420ms apiece plus the fade-back window.
        setTimeout(function () { btn.disabled = false; }, 9 * 420 + 1500);
      });
    }
  }

  /* ---------------- Bad-day failure drill ---------------- */
  function initDrill() {
    const btn = document.getElementById("drill-btn");
    const write = document.getElementById("drill-write");
    const retry = document.getElementById("drill-retry");
    const fallback = document.getElementById("drill-fallback");
    const c1 = document.getElementById("drill-c1");
    const c2 = document.getElementById("drill-c2");
    const proof = document.getElementById("drill-proof");
    if (!btn || !write) return;

    function reset() {
      [write, retry, fallback].forEach(function (n) { n.classList.remove("lit", "done", "error"); });
      [c1, c2].forEach(function (c) { c.classList.remove("lit"); });
      proof.style.visibility = "hidden";
    }

    btn.addEventListener("click", function () {
      reset();
      btn.disabled = true;
      setTimeout(function () { write.classList.add("error"); }, 300);            // write fails
      setTimeout(function () { c1.classList.add("lit"); }, 1000);
      setTimeout(function () { retry.classList.add("lit"); }, 1300);             // retries w/ idempotency
      setTimeout(function () { retry.classList.remove("lit"); retry.classList.add("error"); }, 2500); // CRM still down
      setTimeout(function () { c2.classList.add("lit"); }, 3000);
      setTimeout(function () { fallback.classList.add("done"); }, 3300);         // structured-email fallback
      setTimeout(function () {
        proof.style.visibility = "visible";
        btn.disabled = false;
        btn.textContent = "↻ Run the failure drill again";
      }, 4000);
    });
  }

  /* ---------------- Nico page commands ---------------- */
  function initNicoCommands() {
    document.addEventListener("nico:command", function (e) {
      const text = e.detail.text || "";
      if (/animate.*loop|loop.*animate/i.test(text)) {
        e.detail.handled = true;
        e.detail.reply = "Animating the Continuous Civic Improvement Loop right here on the Platform page…";
        const section = document.getElementById("improvement-loop");
        if (section) section.scrollIntoView({ behavior: "smooth" });
        const viz = document.getElementById("loop-viz");
        if (viz) setTimeout(function () { Envoz.animateLoop(viz); }, 700);
      } else if (/standalone/i.test(text)) {
        e.detail.handled = true;
        e.detail.reply = "Switching to Standalone Mode — structured email fallback, lightweight triage, and local case numbers with full audit tracking.";
        const tab = document.getElementById("tab-standalone");
        if (tab) {
          tab.click();
          document.getElementById("deployment").scrollIntoView({ behavior: "smooth" });
        }
      } else if (/overlay/i.test(text)) {
        e.detail.handled = true;
        e.detail.reply = "Switching to Overlay Mode — Envoz writes into the CRM you already run, and your CRM keeps issuing the case numbers.";
        const tab = document.getElementById("tab-overlay");
        if (tab) {
          tab.click();
          document.getElementById("deployment").scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initModeToggle();
    initLoop();
    initDrill();
    initNicoCommands();
  });
})();
