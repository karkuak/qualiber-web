// Apply the saved colour theme before first paint, to avoid a flash.
// Kept as a static file (not inline) so the Content-Security-Policy can be script-src 'self'.
(function () {
  try {
    var t = localStorage.getItem('qb-theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();
