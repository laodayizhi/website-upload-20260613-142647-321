(function () {
    'use strict';

    var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    var hlsLoaderPromise = null;

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function loadScript(src) {
        if (hlsLoaderPromise) {
            return hlsLoaderPromise;
        }

        hlsLoaderPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsLoaderPromise;
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var panel = document.querySelector('[data-mobile-menu-panel]');

        if (!button || !panel) {
            return;
        }

        button.addEventListener('click', function () {
            var isOpen = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilterPanels() {
        selectAll('[data-filter-panel]').forEach(function (panel) {
            var section = panel.parentElement;
            var input = panel.querySelector('[data-filter-input]');
            var year = panel.querySelector('[data-filter-year]');
            var type = panel.querySelector('[data-filter-type]');
            var reset = panel.querySelector('[data-filter-reset]');
            var grid = section ? section.querySelector('[data-filter-grid]') : null;
            var result = section ? section.querySelector('[data-filter-result]') : null;
            var cards = grid ? selectAll('.movie-card', grid) : [];

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var selectedYear = year ? year.value : '';
                var selectedType = type ? type.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var match = true;

                    if (query && text.indexOf(query) === -1) {
                        match = false;
                    }

                    if (selectedYear && cardYear !== selectedYear) {
                        match = false;
                    }

                    if (selectedType && cardType !== selectedType) {
                        match = false;
                    }

                    card.classList.toggle('is-hidden-by-filter', !match);
                    if (match) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = '共匹配 ' + visible + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            if (year) {
                year.addEventListener('change', apply);
            }

            if (type) {
                type.addEventListener('change', apply);
            }

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (type) {
                        type.value = '';
                    }
                    apply();
                });
            }
        });
    }

    function initPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var overlay = wrapper.querySelector('[data-play-button]');
        var source = wrapper.getAttribute('data-src');

        if (!video || !source) {
            return;
        }

        function playSource() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            if (video._hlsInstance) {
                video._hlsInstance.destroy();
                video._hlsInstance = null;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }

            loadScript(HLS_CDN).then(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }
            }).catch(function () {
                video.src = source;
                video.play().catch(function () {});
            });
        }

        if (overlay) {
            overlay.addEventListener('click', playSource);
        }

        wrapper._playSource = playSource;
    }

    function setupPlayers() {
        selectAll('[data-player]').forEach(function (wrapper) {
            initPlayer(wrapper);
        });

        selectAll('[data-source-tabs]').forEach(function (tabs) {
            var wrapper = document.querySelector('[data-player]');
            var buttons = selectAll('[data-source]', tabs);

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    var source = button.getAttribute('data-source');
                    var video = wrapper ? wrapper.querySelector('video') : null;

                    buttons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });

                    if (!wrapper || !source) {
                        return;
                    }

                    wrapper.setAttribute('data-src', source);
                    if (video) {
                        video.pause();
                        video.removeAttribute('src');
                        video.load();
                    }

                    initPlayer(wrapper);
                    if (wrapper._playSource) {
                        wrapper._playSource();
                    }
                });
            });
        });
    }

    function createSearchCard(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '    <a class="movie-card__poster" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <span class="poster-frame poster-frame--card">',
            '            <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\');" />',
            '            <span class="poster-fallback">' + escapeHtml(movie.title.slice(0, 18)) + '</span>',
            '        </span>',
            '        <span class="movie-card__score">' + escapeHtml(String(movie.rating)) + '</span>',
            '    </a>',
            '    <div class="movie-card__body">',
            '        <a class="movie-card__title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
            '        <p class="movie-card__meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
            '        <p class="movie-card__desc">' + escapeHtml(movie.description) + '</p>',
            '        <div class="movie-card__tags">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setupSearchPage() {
        var app = document.querySelector('[data-search-app]');
        if (!app || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var input = app.querySelector('[data-search-input]');
        var type = app.querySelector('[data-search-type]');
        var year = app.querySelector('[data-search-year]');
        var reset = app.querySelector('[data-search-reset]');
        var result = app.querySelector('[data-search-result]');
        var grid = app.querySelector('[data-search-grid]');
        var movies = window.MOVIE_SEARCH_INDEX;
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function fillSelect(select, values) {
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        fillSelect(type, Array.from(new Set(movies.map(function (movie) {
            return movie.type;
        }))).filter(Boolean).sort());

        fillSelect(year, Array.from(new Set(movies.map(function (movie) {
            return movie.year;
        }))).filter(Boolean).sort().reverse());

        function apply() {
            var query = input.value.trim().toLowerCase();
            var selectedType = type.value;
            var selectedYear = year.value;
            var matched = movies.filter(function (movie) {
                var text = movie.search.toLowerCase();
                if (query && text.indexOf(query) === -1) {
                    return false;
                }
                if (selectedType && movie.type !== selectedType) {
                    return false;
                }
                if (selectedYear && movie.year !== selectedYear) {
                    return false;
                }
                return true;
            }).slice(0, 240);

            result.textContent = '共匹配 ' + matched.length + ' 部影片' + (matched.length >= 240 ? '，已显示前 240 部' : '');
            grid.innerHTML = matched.map(createSearchCard).join('\n');
        }

        input.value = initialQuery;
        input.addEventListener('input', apply);
        type.addEventListener('change', apply);
        year.addEventListener('change', apply);
        reset.addEventListener('click', function () {
            input.value = '';
            type.value = '';
            year.value = '';
            apply();
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilterPanels();
        setupPlayers();
        setupSearchPage();
    });
}());
