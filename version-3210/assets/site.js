(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 6200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
    var list = panel.parentElement.querySelector('[data-filter-list]') || document.querySelector('[data-filter-list]');
    var items = list ? Array.prototype.slice.call(list.querySelectorAll('[data-filter-item]')) : [];
    var current = '';

    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var token = current.toLowerCase();

      items.forEach(function (item) {
        var text = (item.getAttribute('data-search') || '').toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedToken = !token || text.indexOf(token) !== -1;
        item.classList.toggle('is-hidden', !(matchedKeyword && matchedToken));
      });
    };

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      if (q) {
        input.value = q;
      }
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (btn) {
          btn.classList.remove('active');
        });
        button.classList.add('active');
        current = button.getAttribute('data-filter-value') || '';
        apply();
      });
    });

    apply();
  });
})();

function initMoviePlayer(url) {
  var video = document.getElementById('movie-player');
  var cover = document.querySelector('.player-cover');
  var started = false;

  if (!video || !url) {
    return;
  }

  var bind = function () {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  };

  var play = function () {
    bind();
    if (cover) {
      cover.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}
