(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const nextButton = document.querySelector('[data-hero-next]');
  const prevButton = document.querySelector('[data-hero-prev]');
  let currentSlide = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function startHeroTimer() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHeroTimer();
    });
  });

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      startHeroTimer();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      startHeroTimer();
    });
  }

  showSlide(0);
  startHeroTimer();

  const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
  const yearFilter = document.querySelector('[data-year-filter]');
  const typeFilter = document.querySelector('[data-type-filter]');
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).find(function (value) {
      return value && value.trim();
    }) || '');
    const year = yearFilter ? normalize(yearFilter.value) : '';
    const type = typeFilter ? normalize(typeFilter.value) : '';
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = normalize(card.getAttribute('data-search'));
      const cardYear = normalize(card.getAttribute('data-year'));
      const cardType = normalize(card.getAttribute('data-type'));
      const matched = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year) && (!type || cardType.indexOf(type) !== -1);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount ? 'none' : 'block';
    }
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');

  if (initialQuery) {
    searchInputs.forEach(function (input) {
      if (!input.value) {
        input.value = initialQuery;
      }
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilters);
  }

  applyFilters();
})();
