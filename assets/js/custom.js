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

  /* --- close the overflow menu on scroll / outside click / Esc ------------- */

  var navButton = document.querySelector(".greedy-nav > button");

  function closeMenu() {
    if (navButton && navButton.classList.contains("close")) {
      navButton.click();
    }
  }

  window.addEventListener("scroll", closeMenu, { passive: true });

  document.addEventListener("click", function (event) {
    if (event.target.closest && event.target.closest(".greedy-nav")) return;
    closeMenu();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  /* --- smooth anchor scrolling with the floating header's offset ---------- */

  function targetTop(el) {
    if (/^H[1-6]$/.test(el.tagName)) {
      var range = document.createRange();
      range.selectNodeContents(el);
      var rects = range.getClientRects();
      if (rects.length) return rects[0].top + window.pageYOffset;
    }
    return el.getBoundingClientRect().top + window.pageYOffset;
  }

  function scrollToElement(el) {
    /* the masthead is a side column / bottom bar now and never covers the
       top of the viewport, so a small constant offset suffices */
    var offset = 30;
    var end = Math.max(targetTop(el) - offset, 0);

    if (reduceMotion) {
      window.scrollTo(0, end);
      return;
    }

    var start = window.pageYOffset;
    var distance = end - start;
    var duration = Math.min(900, Math.max(420, Math.abs(distance) * 0.45));
    var started = null;

    function step(now) {
      if (started === null) started = now;
      var p = Math.min((now - started) / duration, 1);
      var eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, start + distance * eased);
      if (p < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  var anchorLinks = document.querySelectorAll('.masthead a[href*="#"], .site-footer a[href*="#"]');

  Array.prototype.forEach.call(anchorLinks, function (link) {
    link.addEventListener("click", function (event) {
      var href = link.getAttribute("href") || "";
      var hash = href.indexOf("#") >= 0 ? href.split("#")[1] : "";
      if (!hash) return;

      var target = document.getElementById(hash);
      if (!target) return;

      event.preventDefault();
      closeMenu();

      /* tap feedback: replay the ping; a class (not :active) so quick taps
         still run the whole animation */
      link.classList.remove("nav-tapped");
      void link.offsetWidth;
      link.classList.add("nav-tapped");
      window.setTimeout(function () {
        link.classList.remove("nav-tapped");
      }, 500);

      scrollToElement(target);

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + hash);
      }
    });
  });

  /* --- pin the avatar column; top-align the dock and match its height ------ */

  var stickySidebar = document.querySelector(".sidebar.sticky");
  var dock = document.querySelector("#main > .masthead");

  /* the center column's first line of real text, in document coordinates
     (skips the invisible anchor-offset hack that opens the homepage) */
  function contentTop() {
    var content = document.querySelector(".page__content");
    if (!content) return null;

    var kids = content.children;
    for (var i = 0; i < kids.length; i++) {
      if (!kids[i].textContent.replace(/\s+/g, "")) continue;
      var range = document.createRange();
      range.selectNodeContents(kids[i]);
      var rects = range.getClientRects();
      if (rects.length) return rects[0].top + window.pageYOffset;
    }
    return null;
  }

  function alignColumns() {
    if (dock) {
      dock.style.top = "";
      dock.style.height = "";
      dock.style.marginTop = "";
    }
    if (!stickySidebar) return;

    stickySidebar.style.top = "";
    stickySidebar.style.marginTop = "";
    if (window.innerWidth < 925) return;

    var previousPosition = stickySidebar.style.position;
    stickySidebar.style.position = "static";
    var naturalRect = stickySidebar.getBoundingClientRect();
    var naturalTop = naturalRect.top + window.pageYOffset;
    var naturalHeight = naturalRect.height;
    stickySidebar.style.position = previousPosition;

    /* drop the profile card and the dock so their tops meet the center
       column's first line of text instead of the flex row's top edge */
    var firstLineTop = contentTop();
    var delta =
      firstLineTop === null ? 0 : Math.max(firstLineTop - naturalTop, 0);
    var stickTop = Math.round(naturalTop + delta);

    stickySidebar.style.marginTop = delta + "px";
    stickySidebar.style.top = stickTop + "px";

    /* the dock sticks beside the profile card and matches its height */
    if (dock) {
      dock.style.marginTop = delta + "px";
      dock.style.top = stickTop + "px";
      dock.style.height = Math.round(naturalHeight) + "px";
    }
  }

  alignColumns();
  /* late-loading avatar images change the profile height; re-sync then */
  window.addEventListener("load", alignColumns);
  /* any late change to the profile card's size (fonts, images) re-syncs too */
  if (window.ResizeObserver && stickySidebar) {
    new ResizeObserver(function () {
      alignColumns();
    }).observe(stickySidebar);
  }

  /* --- keep edge tooltips inside the bottom bar ---------------------------- */

  var tooltipBar = document.querySelector(".masthead");

  /* Narrow mode centres each tooltip above its icon; near the bar's ends a
     wide tooltip would stick out, so measure it and shift it back inside
     through the --tip-shift custom property. */
  function fitTooltips() {
    if (!tooltipBar) return;

    var links = tooltipBar.querySelectorAll(
      ".visible-links .masthead__menu-item > a"
    );

    if (window.innerWidth > 924) {
      Array.prototype.forEach.call(links, function (link) {
        link.style.removeProperty("--tip-shift");
      });
      return;
    }

    /* a probe styled exactly like the tooltip pseudo-element */
    var gauge = document.createElement("span");
    gauge.style.cssText =
      "position:absolute;visibility:hidden;white-space:nowrap;" +
      "font-size:0.92rem;font-weight:600;letter-spacing:0.02em;" +
      "padding:0.5em 1.05em;border:1px solid transparent;box-sizing:border-box;";
    document.body.appendChild(gauge);

    var barRect = tooltipBar.getBoundingClientRect();

    Array.prototype.forEach.call(links, function (link) {
      gauge.style.fontFamily = window.getComputedStyle(link).fontFamily;
      gauge.textContent = link.getAttribute("data-tip") || "";
      var half = gauge.getBoundingClientRect().width / 2;
      var rect = link.getBoundingClientRect();
      var center = (rect.left + rect.right) / 2;
      var shift = 0;
      if (center - half < barRect.left) {
        shift = barRect.left - (center - half);
      } else if (center + half > barRect.right) {
        shift = barRect.right - (center + half);
      }
      link.style.setProperty("--tip-shift", Math.round(shift) + "px");
    });

    document.body.removeChild(gauge);
  }

  fitTooltips();
  window.addEventListener("load", fitTooltips);

  /* Media-query styles can lag the resize event: innerWidth already reports
     the new viewport while getBoundingClientRect still sees the old mode's
     styles (that mis-measured the profile height once, and the dock kept
     its narrow size in wide mode). Re-measure on the next animation frame,
     when the new styles have settled, and on the media-query flip itself. */
  var syncFrame = 0;
  var syncTimer = 0;

  function scheduleLayoutSync() {
    if (!syncFrame) {
      syncFrame = window.requestAnimationFrame(function () {
        syncFrame = 0;
        alignColumns();
        fitTooltips();
      });
    }
    /* trailing re-check once the viewport has fully settled (resized images
       and media-query evaluation can take a second frame) */
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(function () {
      alignColumns();
      fitTooltips();
    }, 160);
  }

  window.addEventListener("resize", scheduleLayoutSync);
  if (window.matchMedia) {
    var wideQuery = window.matchMedia("(min-width: 925px)");
    if (wideQuery.addEventListener) {
      wideQuery.addEventListener("change", scheduleLayoutSync);
    } else if (wideQuery.addListener) {
      wideQuery.addListener(scheduleLayoutSync);
    }
  }

  /* --- heading underline width --------------------------------------------- */

  function measureTitles() {
    var titles = document.querySelectorAll(".page__content h1");
    var widest = 0;

    Array.prototype.forEach.call(titles, function (heading) {
      var range = document.createRange();
      range.selectNodeContents(heading);
      var rects = range.getClientRects();
      for (var i = 0; i < rects.length; i++) {
        widest = Math.max(widest, rects[i].width);
      }
    });

    /* every heading's underline grows to the longest title's width */
    if (widest) {
      document.documentElement.style.setProperty("--title-w", Math.round(widest) + "px");
    }
  }

  measureTitles();
  window.addEventListener("resize", measureTitles);

  /* --- all publications: collapse to the ten most recent ------------------- */

  var pubsHeading = document.getElementById("all-publications");

  if (pubsHeading) {
    var VISIBLE_COUNT = 20;

    /* the section is a flat run of h2 + ul pairs ending at the next h1 */
    var groups = [];
    var items = [];
    var currentYear = null;
    var lastElement = pubsHeading;
    var el = pubsHeading.nextElementSibling;

    while (el && el.tagName !== "H1") {
      if (el.tagName === "H2") {
        currentYear = el;
      } else if (el.tagName === "UL") {
        groups.push({ heading: currentYear, list: el });
        for (var i = 0; i < el.children.length; i++) {
          items.push(el.children[i]);
        }
      }
      lastElement = el;
      el = el.nextElementSibling;
    }

    if (items.length > VISIBLE_COUNT) {
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "pubs-toggle";
      toggle.setAttribute("aria-expanded", "false");

      var toggleLabel = document.createElement("span");
      toggle.appendChild(toggleLabel);

      var setCollapsed = function (collapsed) {
        for (var i = VISIBLE_COUNT; i < items.length; i++) {
          items[i].classList.toggle("pub-hidden", collapsed);
        }
        /* a year group with no visible entries hides its heading too */
        groups.forEach(function (group) {
          var anyVisible = false;
          for (var i = 0; i < group.list.children.length; i++) {
            if (!group.list.children[i].classList.contains("pub-hidden")) {
              anyVisible = true;
              break;
            }
          }
          group.list.classList.toggle("pub-hidden", !anyVisible);
          if (group.heading) {
            group.heading.classList.toggle("pub-hidden", !anyVisible);
          }
        });
        toggle.setAttribute("aria-expanded", String(!collapsed));
        toggleLabel.textContent = collapsed
          ? "Show More Publications"
          : "Show Less Publication";
      };

      toggle.addEventListener("click", function () {
        setCollapsed(toggle.getAttribute("aria-expanded") === "true");
      });

      lastElement.parentNode.insertBefore(toggle, lastElement.nextSibling);
      setCollapsed(true);
    }
  }

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
