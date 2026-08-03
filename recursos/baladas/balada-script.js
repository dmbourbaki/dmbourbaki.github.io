/* Baladas de Siempre — control de reproducción exclusiva entre reproductores de Spotify
   Usa la Spotify iFrame API oficial para pausar automáticamente los demás
   reproductores en cuanto uno empieza a sonar. */
(function () {
  var controllers = [];

  function initControllers(IFrameAPI) {
    var containers = document.querySelectorAll('.spotify-embed-container');
    containers.forEach(function (el) {
      var turntable = el.closest('.turntable');
      if (!turntable) return;
      var uri = turntable.getAttribute('data-spotify-uri');
      if (!uri) return;

      var options = { uri: uri, width: '100%', height: '152' };

      IFrameAPI.createController(el, options, function (EmbedController) {
        controllers.push(EmbedController);

        EmbedController.addListener('playback_update', function (e) {
          if (e && e.data && e.data.isPaused === false) {
            controllers.forEach(function (other) {
              if (other !== EmbedController) {
                other.pause();
              }
            });
          }
        });
      });
    });
  }

  window.onSpotifyIframeApiReady = function (IFrameAPI) {
    initControllers(IFrameAPI);
  };

  // Carga el script oficial de la API de Spotify
  var tag = document.createElement('script');
  tag.src = 'https://open.spotify.com/embed/iframe-api/v1';
  tag.async = true;
  document.head.appendChild(tag);
})();
