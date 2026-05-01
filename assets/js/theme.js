/* ============================================================
   theme.js — Dark/light mode toggle with localStorage persistence
   ============================================================ */

(function () {
  var STORAGE_KEY = "theme";
  var html = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  function getTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        "Switch to " + (theme === "dark" ? "light" : "dark") + " mode"
      );
      toggle.textContent = theme === "dark" ? "☀" : "◐";
    }
  }

  setTheme(getTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = html.getAttribute("data-theme");
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* Listen for OS-level theme changes */
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? "dark" : "light");
      }
    });
})();
