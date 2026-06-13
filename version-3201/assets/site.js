(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(value);
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var input = document.querySelector(".filter-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".quick-filter"));
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (initialQuery) {
      input.value = initialQuery;
    }

    function activeFilter() {
      var current = buttons.find(function (button) {
        return button.classList.contains("is-active");
      });
      return current ? current.getAttribute("data-filter") : "all";
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var filter = activeFilter();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = filter === "all" || text.indexOf(filter.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(matchQuery && matchFilter));
      });
    }

    input.addEventListener("input", apply);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        apply();
      });
    });
    apply();
  }

  onReady(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
  });
})();
