(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function attachSource(video) {
    if (!video || video.dataset.ready === "true") {
      return;
    }
    var source = video.getAttribute("data-stream");
    if (!source) {
      return;
    }
    video.dataset.ready = "true";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsController = hls;
      return;
    }

    video.src = source;
  }

  function playFromShell(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    if (!video) {
      return;
    }
    attachSource(video);
    if (overlay) {
      overlay.hidden = true;
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) {
          overlay.hidden = false;
        }
      });
    }
  }

  onReady(function () {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      if (overlay) {
        overlay.addEventListener("click", function () {
          playFromShell(shell);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playFromShell(shell);
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.hidden = true;
          }
        });
      }
    });
  });
})();
