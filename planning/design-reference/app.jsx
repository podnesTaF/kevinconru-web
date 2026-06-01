// ─────────────────────────────────────────────────────────────────────────
// Kevin Conru — app shell, hash router, Tweaks
// ─────────────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "bone",
  "typepair": "editorial",
  "heroVariant": "default"
}/*EDITMODE-END*/;

// hash-based routing: #/, #/publications, #/publication/:id, #/about
function parseHash() {
  const h = (window.location.hash || '#/').replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'publications') return { name: 'publications' };
  if (parts[0] === 'publication') return { name: 'publication', id: parts[1] };
  if (parts[0] === 'about') return { name: 'about' };
  return { name: 'home' };
}
function routeToHash(r) {
  if (r.name === 'home') return '#/';
  if (r.name === 'publications') return '#/publications';
  if (r.name === 'publication') return '#/publication/' + r.id;
  if (r.name === 'about') return '#/about';
  return '#/';
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState(parseHash());

  useEffect(() => {
    const onHash = () => { setRoute(parseHash()); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // reflect tweaks onto <html> for CSS
  useEffect(() => {
    document.documentElement.dataset.palette = t.palette;
    document.documentElement.dataset.typepair = t.typepair;
  }, [t.palette, t.typepair]);

  const go = (r) => {
    const hash = routeToHash(r);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(r);
    }
    if (r.name !== 'publication') window.scrollTo({ top: 0 });
  };

  const routeName = route.name === 'publication' ? 'publication' : route.name;

  return (
    <div className="shell">
      <Nav route={routeName} go={go} />
      {route.name === 'home' && <Home go={go} hero={t.heroVariant} />}
      {route.name === 'publications' && <Publications go={go} />}
      {route.name === 'publication' && <PublicationDetail id={route.id} go={go} />}
      {route.name === 'about' && <About go={go} />}
      <Footer go={go} />

      <TweaksPanel>
        <TweakSection label="Palette" />
        <TweakRadio label="Mood" value={t.palette}
          options={['bone', 'sage', 'ink']}
          onChange={(v) => setTweak('palette', v)} />

        <TweakSection label="Typography" />
        <TweakRadio label="Pairing" value={t.typepair}
          options={['editorial', 'modern', 'literary']}
          onChange={(v) => setTweak('typepair', v)} />

        <TweakSection label="Home hero" />
        <TweakRadio label="Layout" value={t.heroVariant}
          options={['default', 'split', 'type']}
          onChange={(v) => setTweak('heroVariant', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
