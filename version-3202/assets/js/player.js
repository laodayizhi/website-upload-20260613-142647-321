function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var stream = options.stream;
    var started = false;
    var hls = null;

    if (!video || !overlay || !stream) {
        return;
    }

    function begin() {
        overlay.classList.add("is-hidden");

        if (!started) {
            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
                video.load();
            }
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    overlay.addEventListener("click", begin);
    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            begin();
        });
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            begin();
        }
    });
    video.addEventListener("loadedmetadata", function () {
        if (started && video.paused) {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
