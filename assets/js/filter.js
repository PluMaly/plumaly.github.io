/* ============================================================
   filter.js — Publication category filter (journal / conference / working)
   ============================================================ */

(function () {
  var filterBtns = document.querySelectorAll(".filter__btn");
  var pubCards = document.querySelectorAll(".publication__card");

  if (!filterBtns.length || !pubCards.length) return;

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var category = this.getAttribute("data-filter");

      /* Update active button state */
      filterBtns.forEach(function (b) {
        b.classList.remove("filter__btn--active");
      });
      this.classList.add("filter__btn--active");

      /* Show/hide cards by data-category */
      pubCards.forEach(function (card) {
        if (category === "all" || card.getAttribute("data-category") === category) {
          card.style.display = "";
        } else {
          card.style.display = "none";
          /* Close accordion if hidden */
          card.classList.remove("publication__card--open");
        }
      });
    });
  });
})();
