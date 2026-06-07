// Restores the saved palette / type pairing before first paint (no flash).
// Loaded beforeInteractive from the root layout; defaults stay "bone" +
// "editorial" when nothing (or junk) is stored.
(function () {
  try {
    var d = document.documentElement;
    var p = localStorage.getItem('palette');
    if (p === 'bone' || p === 'sage' || p === 'ink') d.dataset.palette = p;
    var t = localStorage.getItem('typepair');
    if (t === 'editorial' || t === 'modern' || t === 'literary') d.dataset.typepair = t;
  } catch {
    /* storage unavailable — keep defaults */
  }
})();
