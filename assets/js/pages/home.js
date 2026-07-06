/* Home page — animate the hero split demo (call → map pin → case card → proof) */
(function () {
  "use strict";

  const LINES = [
    ["user", "I hit a huge pothole near the Alton ramp and almost swerved."],
    ["nico", "I can help report that. First, is anyone hurt or in immediate danger?"],
    ["user", "No, everyone's fine — but it's really deep."],
    ["nico", "Glad you're safe. Is this closer to Irvine Center Drive or Mesa Ridge?"],
    ["user", "Irvine Center Drive, right by the ramp."],
    ["nico", "Got it — reporting a high-priority pothole at Alton Pkwy & Irvine Center Dr. Your case number is VR-4281."]
  ];

  function bubble(who, text) {
    const el = document.createElement("div");
    el.className = "nico-bubble from-" + who;
    el.style.maxWidth = "95%";
    if (who === "nico") { el.style.background = "rgba(255,255,255,.12)"; el.style.color = "#e9edf2"; }
    el.textContent = text;
    return el;
  }

  function runHero() {
    const call = document.getElementById("hero-call");
    const pin = document.getElementById("hero-pin");
    const pinLabel = document.getElementById("hero-pin-label");
    const caseCard = document.getElementById("hero-case");
    const proof = document.getElementById("hero-proof");
    if (!call) return;

    call.innerHTML = "";
    LINES.forEach(function (l, i) {
      setTimeout(function () {
        call.appendChild(bubble(l[0], l[1]));
        call.scrollTop = call.scrollHeight;
        if (i === 4) { // location resolved → pin drops
          pin.style.visibility = "visible";
          pin.style.animation = "none";
          void pin.offsetWidth;
          pin.style.animation = "";
          setTimeout(function () { pinLabel.style.visibility = "visible"; }, 600);
        }
        if (i === 5) { // case created → card + proof
          caseCard.style.opacity = "1";
          setTimeout(function () { proof.style.visibility = "visible"; }, 500);
        }
      }, 1300 * i + 500);
    });

    // loop the demo
    setTimeout(function () {
      pin.style.visibility = "hidden";
      pinLabel.style.visibility = "hidden";
      caseCard.style.opacity = ".35";
      proof.style.visibility = "hidden";
      runHero();
    }, 1300 * LINES.length + 9000);
  }

  document.addEventListener("DOMContentLoaded", runHero);
})();
