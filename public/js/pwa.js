(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (e) { console.warn('SW gagal:', e); });
    });
  }

  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  var deferred = null, btn = null;
// Petunjuk install untuk iOS Safari
(function () {
  var ua = navigator.userAgent;
  var isIOS = /iphone|ipad|ipod/i.test(ua) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = navigator.standalone === true ||
                   matchMedia('(display-mode: standalone)').matches;
  if (!isIOS || standalone || localStorage.getItem('iosHintOff')) return;

  window.addEventListener('load', function () {
    var box = document.createElement('div');
    box.setAttribute('role', 'dialog');
    box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));' +
      'z-index:999;padding:12px 14px;background:#efe6cf;color:#3f3a2e;border:3px solid #3b372f;' +
      'border-radius:14px;box-shadow:0 5px 0 #2a2722;font:22px/1.2 VT323,monospace;text-align:center';
    box.innerHTML = 'Lets install retro Cam: tap <b>Share</b> ⬆︎ and then <b>Add to your Home Screen</b>.' +
      '<br><button type="button" style="margin-top:8px;padding:2px 16px;font:22px VT323,monospace;' +
      'background:#4d4a42;color:#f1e8d0;border:2px solid #3b372f;border-radius:10px">OKE</button>';
    box.querySelector('button').onclick = function () {
      try { localStorage.setItem('iosHintOff', '1'); } catch (e) {}
      box.remove();
    };
    document.body.appendChild(box);
  });
})();
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
