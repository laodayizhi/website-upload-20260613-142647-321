(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        function startTimer() {
            if (slides.length > 1) {
                timer = window.setInterval(nextSlide, 5200);
            }
        }

        function resetTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        }

        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                resetTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                resetTimer();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                resetTimer();
            });
        });
        showSlide(0);
        startTimer();

        var filterInput = document.querySelector('[data-filter-input]');
        var filterSelect = document.querySelector('[data-filter-select]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function filterCards() {
            if (!cards.length) {
                return;
            }
            var keyword = normalize(filterInput ? filterInput.value : '');
            var genre = normalize(filterSelect ? filterSelect.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var genreText = normalize(card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okGenre = !genre || genreText.indexOf(genre) !== -1;
                var show = okKeyword && okGenre;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (filterInput) {
            filterInput.addEventListener('input', filterCards);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && !filterInput.value) {
                filterInput.value = query;
            }
        }
        if (filterSelect) {
            filterSelect.addEventListener('change', filterCards);
        }
        filterCards();

        var video = document.getElementById('movieVideo');
        var overlay = document.getElementById('moviePlayOverlay');
        var button = document.getElementById('moviePlayButton');
        var message = document.getElementById('moviePlayerMessage');
        var source = typeof moviePlaybackSource === 'string' ? moviePlaybackSource : '';
        var playerReady = false;
        var hlsInstance = null;
        var pendingPlay = false;

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.classList.add('is-visible');
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function preparePlayer() {
            if (!video || !source || playerReady) {
                return;
            }
            playerReady = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (pendingPlay) {
                        requestPlay();
                    }
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('暂时无法播放，请稍后再试');
                    }
                });
            } else {
                video.src = source;
            }
        }

        function requestPlay() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        function startPlayback() {
            if (!video) {
                return;
            }
            pendingPlay = true;
            preparePlayer();
            requestPlay();
        }

        if (video && source) {
            if (button) {
                button.addEventListener('click', startPlayback);
            }
            if (overlay) {
                overlay.addEventListener('click', startPlayback);
            }
            video.addEventListener('play', function () {
                pendingPlay = false;
                hideOverlay();
            });
            video.addEventListener('error', function () {
                showMessage('暂时无法播放，请稍后再试');
            });
        }
    });
})();
