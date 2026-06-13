(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var sort = form.querySelector('[data-sort-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function applyFilter() {
      var term = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var matched = !term || cardText(card).indexOf(term) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function applySort() {
      if (!sort) {
        return;
      }

      var grid = document.querySelector('[data-card-grid]');
      if (!grid) {
        return;
      }

      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'rating') {
          return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
        }

        if (mode === 'views') {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        }

        if (mode === 'year') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }

        return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-CN');
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });

      applyFilter();
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (sort) {
      sort.addEventListener('change', applySort);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    applySort();
    applyFilter();
  });

  function startVideo(wrapper) {
    var video = wrapper.querySelector('video');
    var overlay = wrapper.querySelector('.player-overlay');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');

    if (!video.getAttribute('src') && stream) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    video.controls = true;

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playAttempt = video.play();

    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (wrapper) {
    var overlay = wrapper.querySelector('.player-overlay');
    var video = wrapper.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startVideo(wrapper);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo(wrapper);
        }
      });
    }
  });
})();
