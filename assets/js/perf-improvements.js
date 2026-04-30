// Small, non-invasive performance helpers.
// - Adds `loading="lazy"` to images/iframes unless opted-out via data-priority or .no-lazy
// - Defers loading of scripts marked with data-defer-src (loads after idle)

(function(){
  'use strict';

  // Lazy Load Google AdSense
  function lazyLoadAdSense() {
    var script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8278748118891475';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }

  var adLoaded = false;
  function onFirstInteraction() {
    if (adLoaded) return;
    adLoaded = true;
    
    // Slight delay to ensure we're out of the critical paint path
    setTimeout(lazyLoadAdSense, 2000);

    // Cleanup listeners
    ['touchstart', 'keydown', 'mousedown'].forEach(function(e) {
      window.removeEventListener(e, onFirstInteraction);
    });
  }

  ['touchstart', 'keydown', 'mousedown'].forEach(function(e) {
    window.addEventListener(e, onFirstInteraction, { passive: true });
  });

  function setLazyForMedia(){
    try{
      var imgs = document.querySelectorAll('img:not([loading])');
      imgs.forEach(function(img){
        if (img.hasAttribute('data-priority') || img.classList.contains('no-lazy')) return;
        img.setAttribute('loading','lazy');
      });
    }catch(e){}
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
    }catch(e){}
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

})();
