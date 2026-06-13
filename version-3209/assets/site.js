(function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startTimer() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function() {
      showSlide(current + 1);
    }, 5000);
  }

  function resetTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }

    startTimer();
  }

  if (prev) {
    prev.addEventListener('click', function() {
      showSlide(current - 1);
      resetTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function() {
      showSlide(current + 1);
      resetTimer();
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      resetTimer();
    });
  });

  startTimer();

  var searchInput = document.querySelector('.local-search');
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get('q') || '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function itemText(item) {
    return [
      item.getAttribute('data-title'),
      item.getAttribute('data-category'),
      item.getAttribute('data-region'),
      item.getAttribute('data-year'),
      item.getAttribute('data-genre'),
      item.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  function applyFilters() {
    var text = normalize(searchInput ? searchInput.value : '');
    var filterValues = {};

    filterSelects.forEach(function(select) {
      filterValues[select.getAttribute('data-filter')] = normalize(select.value);
    });

    items.forEach(function(item) {
      var visible = true;
      var haystack = itemText(item);

      if (text && haystack.indexOf(text) === -1) {
        visible = false;
      }

      Object.keys(filterValues).forEach(function(key) {
        var value = filterValues[key];

        if (value && normalize(item.getAttribute('data-' + key)) !== value) {
          visible = false;
        }
      });

      item.style.display = visible ? '' : 'none';
    });
  }

  if (searchInput) {
    searchInput.value = queryValue;
    searchInput.addEventListener('input', applyFilters);
  }

  filterSelects.forEach(function(select) {
    select.addEventListener('change', applyFilters);
  });

  if (items.length) {
    applyFilters();
  }
})();
