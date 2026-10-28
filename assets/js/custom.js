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
    var nav = document.querySelector(".masthead");
    var offset = (nav ? nav.getBoundingClientRect().height : 56) + 34;
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
      scrollToElement(target);

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + hash);
      }
    });
  });

  /* --- keep the floating header aligned with the main content column ------- */

  var masthead = document.querySelector(".masthead");
  var pageContent = document.querySelector(".page__content");
  var pageSidebar = document.querySelector(".sidebar");

  function alignMasthead() {
    if (!masthead || !pageContent) return;

    if (window.innerWidth < 768) {
      masthead.style.width = "";
      masthead.style.marginLeft = "";
      masthead.style.maxWidth = "";
      return;
    }

    var contentRect = pageContent.getBoundingClientRect();
    var left = pageSidebar
      ? pageSidebar.getBoundingClientRect().left
      : contentRect.left;
    var right = contentRect.right;

    /* span from the avatar column's left edge to the content's right edge */
    masthead.style.maxWidth = "none";
    masthead.style.marginLeft = Math.round(left) + "px";
    masthead.style.width = Math.round(right - left) + "px";
  }

  /* --- keep the avatar column still from the very first scroll ------------- */

  var stickySidebar = document.querySelector(".sidebar.sticky");

  function alignSidebar() {
    if (!stickySidebar) return;

    stickySidebar.style.top = "";
    if (window.innerWidth < 925) return;

    var previousPosition = stickySidebar.style.position;
    stickySidebar.style.position = "static";
    var naturalTop =
      stickySidebar.getBoundingClientRect().top + window.pageYOffset;
    stickySidebar.style.position = previousPosition;

    stickySidebar.style.top = Math.round(naturalTop) + "px";
  }

  /* --- spread the visible items between the capsule's straight edges ------- */

  function resetNavLayout() {
    var nav = document.querySelector(".greedy-nav");
    var ul = nav && nav.querySelector(".visible-links");
    if (!ul) return;
    nav.style.justifyContent = "";
    ul.style.display = "";
    ul.style.alignItems = "";
    ul.style.justifyContent = "";
    ul.style.width = "";
    ul.style.margin = "";

    Array.prototype.forEach.call(ul.children, function (li) {
      var link = li.firstElementChild;
      if (!link) return;
      link.style.marginLeft = "";
      link.style.marginRight = "";
    });
  }

  function distributeNav() {
    var nav = document.querySelector(".greedy-nav");
    var ul = nav && nav.querySelector(".visible-links");
    if (!nav || !ul || !ul.children.length) return;

    resetNavLayout();

    var btn = nav.querySelector("button");
    var btnVisible =
      btn &&
      !btn.classList.contains("hidden") &&
      getComputedStyle(btn).display !== "none";

    var navRect = nav.getBoundingClientRect();
    var navStyle = getComputedStyle(nav);
    var padLeft = parseFloat(navStyle.paddingLeft) || 0;
    var padRight = parseFloat(navStyle.paddingRight) || 0;
    var left = padLeft;
    var right = navRect.width - padRight;

    if (btnVisible) {
      /* measure to the visible navicon, not the transparent button box */
      var navicon = btn.querySelector(".navicon");
      var iconRect = navicon
        ? navicon.getBoundingClientRect()
        : btn.getBoundingClientRect();
      right = Math.min(right, iconRect.left - navRect.left);
    }

    var items = Array.prototype.slice.call(ul.children);
    var total = 0;
    Array.prototype.forEach.call(items, function (li) {
      var link = li.firstElementChild;
      if (link) {
        link.style.marginLeft = "0px";
        link.style.marginRight = "0px";
        total += link.getBoundingClientRect().width;
      } else {
        total += li.getBoundingClientRect().width;
      }
    });

    var available = right - left;

    if (items.length < 2) {
      /* a single item stays at the left edge instead of being pushed away */
      nav.style.justifyContent = "flex-start";
      ul.style.display = "flex";
      ul.style.justifyContent = "flex-start";
      ul.style.margin = "0";
      ul.style.width = "auto";
      return;
    }

    var gapCount = btnVisible ? items.length : items.length - 1;
    var gap = gapCount > 0 ? (available - total) / gapCount : 0;
    if (!isFinite(gap) || gap < 0) gap = 0;

    nav.style.justifyContent = "flex-start";
    ul.style.display = "flex";
    ul.style.alignItems = "center";
    ul.style.justifyContent = "space-between";
    ul.style.margin = "0";
    ul.style.width =
      Math.max(0, btnVisible ? available - gap : available) + "px";

    /* one correction pass so the gap before the navicon matches the item gaps */
    if (btnVisible && items.length > 1) {
      var iconLeft = (btn.querySelector(".navicon") || btn).getBoundingClientRect().left;
      var firstRect = items[0].firstElementChild.getBoundingClientRect();
      var secondRect = items[1].firstElementChild.getBoundingClientRect();
      var lastRect = items[items.length - 1].firstElementChild.getBoundingClientRect();
      var wordGap = secondRect.left - firstRect.right;
      var lastGap = iconLeft - lastRect.right;
      var correction =
        ((lastGap - wordGap) * (items.length - 1)) / items.length;
      var width = parseFloat(ul.style.width) || 0;
      ul.style.width = Math.max(0, width + correction) + "px";
    }
  }

  var navDistributeTimer = null;

  function scheduleDistribute() {
    window.clearTimeout(navDistributeTimer);
    navDistributeTimer = window.setTimeout(distributeNav, 40);
  }

  function alignHeader() {
    resetNavLayout();
    alignMasthead();
    alignSidebar();
  }

  alignHeader();
  window.addEventListener("resize", alignHeader);

  /* The greedy-nav script loads after this file. Its updateNav() compares the
     list width with the space left of the toggle; a fixed width would make it
     loop forever, so let it always measure the natural list and re-spread
     afterwards. */
  var navHookAttempts = 0;

  function hookUpdateNav() {
    if (typeof window.updateNav === "function") {
      if (!window.updateNav.__dshWrapped) {
        var originalUpdateNav = window.updateNav;
        var wrappedUpdateNav = function () {
          var list = document.querySelector(".greedy-nav .visible-links");
          if (list) list.style.width = "";
          var result = originalUpdateNav.apply(this, arguments);
          scheduleDistribute();
          return result;
        };
        wrappedUpdateNav.__dshWrapped = true;
        window.updateNav = wrappedUpdateNav;
      }
      scheduleDistribute();
      return;
    }
    if (navHookAttempts++ < 200) window.setTimeout(hookUpdateNav, 25);
  }

  hookUpdateNav();

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
