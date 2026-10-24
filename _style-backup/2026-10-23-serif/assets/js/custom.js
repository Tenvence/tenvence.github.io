/* ==========================================================================
   Custom interactions: scroll progress, scroll reveal
   Progressive enhancement — the page works fine without JS.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- scroll progress bar ------------------------------------------------- */

  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  var ticking = false;

  function onFrame() {
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    var height = doc.scrollHeight - window.innerHeight;
    var ratio = height > 0 ? scrollTop / height : 0;

    progress.style.width = Math.min(ratio, 1) * 100 + "%";

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onFrame);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onFrame();

  /* --- reveal on scroll ---------------------------------------------------- */

  if (reduceMotion || !("IntersectionObserver" in window)) {
    return;
  }

  var targets = Array.prototype.slice.call(
    document.querySelectorAll(".page__content h1, .paper-box")
  );

  var visible = [];

  targets.forEach(function (el, i) {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      return; // already on screen: leave it alone, no flash
    }
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 5) * 0.05 + "s";
    visible.push(el);
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.04 }
  );

  visible.forEach(function (el) {
    observer.observe(el);
  });
})();
