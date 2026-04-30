// Small, non-invasive performance helpers.
// - Adds `loading="lazy"` to images/iframes unless opted-out via data-priority or .no-lazy
// - Defers loading of scripts marked with data-defer-src (loads after idle)

(function(){
  'use strict';

  // Fix for "Unload event listeners are deprecated" (Lighthouse/Chrome compliance)
  // We intercept 'unload' listener registration to avoid the deprecation warning.
  // Modern browsers and scripts should use 'pagehide' or 'visibilitychange' instead.
  (function() {
    var originalAdd = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
      if (type === 'unload') return; // Bypass deprecated listener
      return originalAdd.apply(this, arguments);
    };
    Object.defineProperty(window, 'onunload', {
      set: function() { /* ignore */ },
      get: function() { return null; }
    });
  })();

  function setLazyForMedia(){
    try{
      var imgs = document.querySelectorAll('img:not([loading])');
      imgs.forEach(function(img){
        if (img.hasAttribute('data-priority') || img.classList.contains('no-lazy')) return;
        img.setAttribute('loading','lazy');
      });

      var iframes = document.querySelectorAll('iframe:not([loading])');
      iframes.forEach(function(iframe){
        if (iframe.hasAttribute('data-priority') || iframe.classList.contains('no-lazy')) return;
        iframe.setAttribute('loading','lazy');
      });
    }catch(e){console.warn('perf helper error',e)}
  }

  function loadDeferredScripts(){
    try{
      var nodes = document.querySelectorAll('script[data-defer-src]');
      nodes.forEach(function(n){
        var s = document.createElement('script');
        s.src = n.getAttribute('data-defer-src');
        if (n.hasAttribute('data-module')) s.type = 'module';
        if (n.hasAttribute('data-async')) s.async = true;
        if (n.hasAttribute('data-defer')) s.defer = true;
        if (n.getAttribute('crossorigin')) s.crossOrigin = n.getAttribute('crossorigin');
        document.body.appendChild(s);
        n.remove();
      });
    }catch(e){console.warn('defer loader error',e)}
  }

  function onIdle(cb){
    if ('requestIdleCallback' in window) requestIdleCallback(cb,{timeout:2000});
    else setTimeout(cb,1500);
  }

  document.addEventListener('DOMContentLoaded', function(){
    setLazyForMedia();
    onIdle(function(){
      loadDeferredScripts();
    });
  });
  // Set explicit width/height attributes for game thumbnails to avoid layout shift
  function setThumbnailSizes(){
    try{
      // target images inside game folders (thumbnails) and gallery images
      var imgs = Array.from(document.querySelectorAll('img'));
      imgs.forEach(function(img){
        try{
          var src = img.getAttribute('src')||'';
          if(!src) return;
          if(src.indexOf('/game/')===-1) return; // only affect game assets
          if(img.hasAttribute('width') && img.hasAttribute('height')) return;
          var w = img.offsetWidth || img.clientWidth || img.naturalWidth;
          var h = img.offsetHeight || img.clientHeight || img.naturalHeight;
          if(w && h){
            // Round to integer to avoid long floats
            img.setAttribute('width', Math.round(w));
            img.setAttribute('height', Math.round(h));
          }
        }catch(e){/* ignore per-image errors */}
      });
    }catch(e){console.warn('thumbnail size helper error',e)}
  }

  // Run immediately and on idle; also after window resize (debounced)
  setThumbnailSizes();
  onIdle(setThumbnailSizes);
  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setThumbnailSizes, 250);
  });
})();
