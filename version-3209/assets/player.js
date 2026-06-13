(function() {
  function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var hlsInstance = null;
    var started = false;

    if (!video || !overlay || !config.source) {
      return;
    }

    if (config.poster) {
      video.setAttribute('poster', config.poster);
    }

    function showError() {
      overlay.classList.remove('hidden');
      overlay.innerHTML = '<span class="play-icon">!</span><strong>视频暂时无法加载，请稍后再试</strong>';
    }

    function attachSource() {
      if (started) {
        return Promise.resolve();
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(config.source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            showError();
          }
        });

        return Promise.resolve();
      }

      showError();
      return Promise.reject(new Error('unsupported'));
    }

    function playVideo() {
      attachSource().then(function() {
        overlay.classList.add('hidden');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function() {
            overlay.classList.remove('hidden');
          });
        }
      }).catch(function() {
        showError();
      });
    }

    overlay.addEventListener('click', playVideo);

    video.addEventListener('play', function() {
      overlay.classList.add('hidden');
    });

    video.addEventListener('error', function() {
      showError();
    });

    window.addEventListener('pagehide', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
