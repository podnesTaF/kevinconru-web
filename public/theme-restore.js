// Restore the saved palette + type pairing before hydration so there is no
// flash of the defaults. Loaded from app/layout.tsx via
// <Script strategy="beforeInteractive"> — kept as a static file because the
// App Router injects beforeInteractive scripts with React's preinit(), which
// only supports src-based scripts (inline ones render as raw <script> tags
// that React 19 warns about and never re-executes on client renders).
// Mirrors the storage keys used by PaletteSwitcher / TypographySwitcher.
(function () {
  try {
    var d = document.documentElement;
    var p = localStorage.getItem("palette");
    if (p === "bone" || p === "sage" || p === "ink") d.dataset.palette = p;
    var t = localStorage.getItem("typepair");
    if (t === "editorial" || t === "modern" || t === "literary") d.dataset.typepair = t;
  } catch (e) {}
})();
