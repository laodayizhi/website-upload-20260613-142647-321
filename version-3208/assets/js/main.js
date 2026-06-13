(function() {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.addEventListener("error", function(event) {
    var target = event.target;
    if (target && target.tagName === "IMG") {
      target.classList.add("is-muted-image");
    }
  }, true);

  document.querySelectorAll("form[action='search.html']").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      var input = form.querySelector("input[name='q']");
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        event.preventDefault();
        window.location.href = "search.html";
      }
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function(dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function(panel) {
    var scope = panel.parentElement || document;
    var grid = scope.querySelector("[data-filter-grid]");
    if (!grid) {
      grid = document.querySelector("[data-filter-grid]");
    }
    if (!grid) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search]"));
    var empty = scope.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input && input.id === "page-search-input") {
      input.value = q;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var text = normalize(input ? input.value : "");
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;
      cards.forEach(function(card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matchesText = !text || haystack.indexOf(text) !== -1;
        var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
        var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var show = matchesText && matchesRegion && matchesYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, region, year].forEach(function(control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
})();

function initMoviePlayer(url, videoId, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !overlay) {
    return;
  }

  var attached = false;
  var hlsInstance = null;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function play() {
    attach();
    overlay.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function() {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", play);
  video.addEventListener("click", function() {
    if (!attached || video.paused) {
      play();
    }
  });

  window.addEventListener("beforeunload", function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
