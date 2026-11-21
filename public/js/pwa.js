(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (e) { console.warn('SW gagal:', e); });
    });
  }

  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  var deferred = null, btn = null;

  function mk() {
    if (btn || standalone) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'INSTALL APP';
    btn.setAttribute('aria-label', 'Install Retro Cam');
    btn.style.cssText = 'position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:999;' +
      'padding:4px 16px 2px;font:24px/1.2 VT323,monospace;color:#f1e8d0;background:#d9523a;border:3px solid #3b372f;' +
      'border-radius:12px;box-shadow:0 5px 0 #2a2722;cursor:pointer';
    btn.onclick = function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; rm(); });
    };
    document.body.appendChild(btn);
  }
  function rm() { if (btn) { btn.remove(); btn = null; } }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; mk(); });
  window.addEventListener('appinstalled', function () { deferred = null; rm(); });
})();
