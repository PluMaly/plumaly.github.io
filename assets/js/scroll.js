/* ============================================================
   scroll.js — Smooth scroll, nav highlight, back-to-top, mobile nav, accordion
   ============================================================ */

(function () {
  /* --- Mobile nav toggle ------------------------------ */
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("nav__links--open");
    });
    /* Close when clicking a nav link (mobile) */
    navLinks.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("nav__links--open");
      });
    });
    /* Close when clicking outside */
    document.addEventListener("click", function (e) {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("nav__links--open");
      }
    });
  }

  /* --- Nav active state on scroll --------------------- */
  var sections = document.querySelectorAll("section[id]");
  var navItems = document.querySelectorAll(".nav__link");

  function updateActiveNav() {
    var scrollY = window.scrollY + 80; /* offset for fixed nav */
    var current = "";

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = section.getAttribute("id");
      }
    });

    navItems.forEach(function (link) {
      var href = link.getAttribute("href");
      link.classList.toggle(
        "nav__link--active",
        href === "#" + current
      );
    });
  }

  /* --- Smooth scroll for anchor links ------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* --- Back to top ------------------------------------ */
  var backBtn = document.getElementById("back-to-top");
  if (backBtn) {
    window.addEventListener("scroll", function () {
      backBtn.classList.toggle("back-to-top--visible", window.scrollY > 500);
    });
    backBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* --- Scroll progress bar ---------------------------- */
  var progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    window.addEventListener("scroll", function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    });
  }

  window.addEventListener("scroll", updateActiveNav);

  /* --- Accordion for publication cards ---------------- */
  function toggleCard(card) {
    if (!card) return;
    var isOpen = card.classList.contains("publication__card--open");
    /* Close all other open cards */
    document.querySelectorAll(".publication__card--open").forEach(function (c) {
      c.classList.remove("publication__card--open");
    });
    /* Toggle this card if it wasn't open */
    if (!isOpen) {
      card.classList.add("publication__card--open");
    }
  }

  /* Publication card click — toggle on main area */
  document.querySelectorAll(".publication__main").forEach(function (main) {
    main.addEventListener("click", function () {
      toggleCard(this.closest(".publication__card"));
    });
  });

})();
