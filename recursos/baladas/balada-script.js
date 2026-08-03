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

        if (turntable.getAttribute('data-autoplay') === 'true') {
          EmbedController.addListener('ready', function () {
            try { EmbedController.play(); } catch (err) { /* el navegador puede bloquear el autoplay */ }
          });
        }

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

/* Baladas de Siempre — lightbox de galería
   Al hacer clic en una foto de la galería, se muestra en grande sobre un fondo oscuro. */
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = '<button class="lightbox-close" aria-label="Cerrar">&times;</button><img src="" alt="">';
  document.body.appendChild(overlay);

  var overlayImg = overlay.querySelector('img');

  function closeLightbox() {
    overlay.classList.remove('active');
    overlayImg.src = '';
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  document.querySelectorAll('.gallery .frame img').forEach(function (img) {
    img.addEventListener('click', function () {
      overlayImg.src = img.src;
      overlayImg.alt = img.alt || '';
      overlay.classList.add('active');
    });
  });
});
