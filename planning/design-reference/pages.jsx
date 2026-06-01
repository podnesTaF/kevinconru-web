// ─────────────────────────────────────────────────────────────────────────
// Kevin Conru — pages
// ─────────────────────────────────────────────────────────────────────────

const { useState, useEffect, useRef } = React;

// ─── helpers ────────────────────────────────────────────────────────────
const ArrowRight = (p) => (
  <svg viewBox="0 0 14 10" fill="none" {...p}>
    <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
  </svg>
);

// ─── Nav ────────────────────────────────────────────────────────────────
function Nav({ route, go }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { id: 'home', label: 'Index' },
    { id: 'publications', label: 'Publications' },
    { id: 'about', label: 'About' },
  ];

  const isPub = route === 'publications' || route === 'publication';

  return (
    <React.Fragment>
      <nav className={"nav" + (scrolled ? " is-scrolled" : "")}>
        <a className="nav-brand" href="#" onClick={(e) => { e.preventDefault(); go({ name: 'home' }); }}>
          <span className="mark" aria-hidden="true"></span>
          <span>CONRU</span>
        </a>
        <div className="nav-links">
          {links.map((l) => (
            <a key={l.id}
               className={"nav-link" + ((l.id === 'publications' && isPub) || l.id === route ? " is-active" : "")}
               href="#"
               onClick={(e) => { e.preventDefault(); go({ name: l.id }); }}>
              {l.label}
            </a>
          ))}
        </div>
        <a className="nav-cta" href="#" onClick={(e) => { e.preventDefault(); go({ name: 'about' }); window.scrollTo({ top: 99999, behavior: 'smooth' }); }}>
          Get in touch
        </a>
        <button className="nav-mobile-btn" onClick={() => setMobileOpen(true)} aria-label="Menu"><span></span></button>
      </nav>
      {mobileOpen && (
        <div className="nav-mobile-sheet">
          <button className="nav-mobile-close" onClick={() => setMobileOpen(false)}>×</button>
          {links.map((l) => (
            <a key={l.id} className="nav-link" href="#"
               onClick={(e) => { e.preventDefault(); setMobileOpen(false); go({ name: l.id }); }}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}

// ─── Social icons ───────────────────────────────────────────────────────
const FacebookIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M14 8.5h2.2V5.6C15.84 5.55 14.9 5.5 13.8 5.5c-2.3 0-3.8 1.4-3.8 3.96V11.6H7.3v3.2H10V22h3.3v-7.2h2.6l.4-3.2h-3V9.8c0-.93.26-1.3 1.3-1.3z"/>
  </svg>
);
const InstagramIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="16.8" cy="7.2" r="1" fill="currentColor"/>
  </svg>
);

// ─── Footer ─────────────────────────────────────────────────────────────
function Footer({ go }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <div className="foot-brand">CONRU</div>
            <div className="foot-tag">African and Oceanic art — dealer, curator and publisher. Brussels.</div>
            <div className="foot-social">
              <a href={CONTACT.facebook} target="_blank" rel="noopener" aria-label="Facebook"><FacebookIcon /></a>
              <a href={CONTACT.instagram} target="_blank" rel="noopener" aria-label="Instagram"><InstagramIcon /></a>
            </div>
          </div>
          <div className="foot-col">
            <h6>Index</h6>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); go({ name: 'home' }); }}>Home</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); go({ name: 'publications' }); }}>Publications</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); go({ name: 'about' }); }}>About</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h6>Contact</h6>
            <ul>
              <li><a href={CONTACT.telHref}>{CONTACT.tel}</a></li>
              <li><a href={"mailto:" + CONTACT.email}>{CONTACT.email}</a></li>
              <li>{CONTACT.city}</li>
            </ul>
          </div>
          <div className="foot-col">
            <h6>Elsewhere</h6>
            <ul>
              <li><a href={CONTACT.facebook} target="_blank" rel="noopener">Facebook ↗</a></li>
              <li><a href={CONTACT.instagram} target="_blank" rel="noopener">Instagram ↗</a></li>
              <li><a href="https://wyvernresearch.org/" target="_blank" rel="noopener">Wyvern Research ↗</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <span>© {new Date().getFullYear()} Kevin Conru</span>
          <span>Brussels · By appointment</span>
        </div>
      </div>
    </footer>
  );
}

// ─── PubCover ───────────────────────────────────────────────────────────
function PubCover({ pub }) {
  return (
    <div className="pub-cover">
      <div className="pc-bg" style={{ background: pub.coverBg }}></div>
      <div className="pc-content" style={{ color: pub.coverFg }}>
        <div className="pc-mini">{pub.region} · {pub.publisher}</div>
        <div>
          <div className="pc-mini" style={{ marginBottom: 12 }}>№ {String(pub.year).slice(-2)}</div>
          <div className="pc-title">
            {pub.title.split(' ').slice(0, 2).join(' ')}
            <br />
            <span className="it">{pub.title.split(' ').slice(2).join(' ') || ''}</span>
          </div>
        </div>
      </div>
      {pub.coverImage && <div className="pc-image" style={{ backgroundImage: `url('${pub.coverImage}')` }}></div>}
    </div>
  );
}

// ─── Home ───────────────────────────────────────────────────────────────
function Home({ go, hero }) {
  const featured = PUBLICATIONS.slice(0, 3);
  const cycleObjects = ['assets/object-mask.jpg', 'assets/object-headdress.jpg'];
  const [heroObj, setHeroObj] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHeroObj((i) => (i + 1) % cycleObjects.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="page">
      {/* HERO */}
      <section className="hero" data-variant={hero}>
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-type">
              <div className="hero-meta">
                <span className="dot"></span>
                <span className="eyebrow">Dealer · Curator · Publisher — Brussels</span>
              </div>
              <h1 className="display hero-title">
                African&nbsp;&amp;<br />
                <span className="it">Oceanic</span><br />
                art.
              </h1>
              <p className="hero-sub">
                Kevin Conru is known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania. A member of the Pacific Arts Association and the Oceanic Art Society, based in Brussels.
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="num">10</span>
                  <span className="lab">Publications</span>
                </div>
                <div className="stat">
                  <span className="num">6</span>
                  <span className="lab">Curated exhibitions</span>
                </div>
                <div className="stat">
                  <span className="num">2</span>
                  <span className="lab">Short films</span>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <a className="link-arrow" href="#" onClick={(e) => { e.preventDefault(); go({ name: 'publications' }); }}>
                  Explore the publications <ArrowRight />
                </a>
              </div>
            </div>
            <div className="hero-photo">
              {cycleObjects.map((src, i) => (
                <img key={src} src={src} alt="" style={{ opacity: i === heroObj ? 1 : 0, transition: 'opacity 1.6s cubic-bezier(.2,.7,.2,1)' }} />
              ))}
              <div className="plate-info">
                <span>Plate № {heroObj === 0 ? '173' : '124'}</span>
                <span>New Ireland · c. 1890</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE — credibility band */}
      <section className="marquee">
        <div className="marquee-track">
          <span>
            Wereldmuseum Rotterdam <span className="star">✦</span>
            Royal Museum for Central Africa <span className="star">✦</span>
            Lempertz Brussels <span className="star">✦</span>
            Pacific Arts Association <span className="star">✦</span>
            Oceanic Art Society <span className="star">✦</span>
            ARTONOV Festival <span className="star">✦</span>
            Wyvern Research Institute <span className="star">✦</span>
          </span>
          <span aria-hidden="true">
            Wereldmuseum Rotterdam <span className="star">✦</span>
            Royal Museum for Central Africa <span className="star">✦</span>
            Lempertz Brussels <span className="star">✦</span>
            Pacific Arts Association <span className="star">✦</span>
            Oceanic Art Society <span className="star">✦</span>
            ARTONOV Festival <span className="star">✦</span>
            Wyvern Research Institute <span className="star">✦</span>
          </span>
        </div>
      </section>

      {/* FEATURED PUBLICATIONS */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">№ 01 — Selected Publications</span>
              <h2 className="display">Recent <span className="serif-italic" style={{ color: 'var(--terra)' }}>volumes</span>.</h2>
            </div>
            <a className="link-arrow" href="#" onClick={(e) => { e.preventDefault(); go({ name: 'publications' }); }}>
              All twelve <ArrowRight />
            </a>
          </div>
          <div className="featured-grid">
            {featured.map((pub) => (
              <a key={pub.id} className="feat-card" href="#"
                 onClick={(e) => { e.preventDefault(); go({ name: 'publication', id: pub.id }); }}>
                <div className="feat-plate" style={{ background: pub.coverBg }}>
                  {pub.coverImage
                    ? <img src={pub.coverImage} alt="" />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: pub.coverFg, fontFamily: 'var(--f-display)', fontSize: 48, padding: 24, textAlign: 'center' }}>{pub.title}</div>}
                </div>
                <div className="feat-meta">
                  <span>{pub.region}</span>
                  <span>{pub.year}</span>
                </div>
                <h3 className="feat-title">
                  {pub.title}<br />
                  <span className="it">— {pub.sub}</span>
                </h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="section">
        <div className="wrap">
          <div className="about-teaser">
            <div className="about-portrait">
              <img src="assets/portrait.jpg" alt="Kevin Conru" />
            </div>
            <div className="about-copy">
              <span className="eyebrow" style={{ marginBottom: 18, display: 'block' }}>№ 02 — The dealer</span>
              <h3>
                Publications, exhibitions, and a <span className="serif-italic" style={{ color: 'var(--terra)' }}>life in the Pacific</span>.
              </h3>
              <p>
                He has travelled extensively in the Pacific, holds an Arts Policy MA from The City University, London, and is an orchestral double bassist.
              </p>
              <p style={{ marginBottom: 28 }}>
                His major book on the art of the Bismarck Archipelago formed the basis of the Wereldmuseum Rotterdam's <em className="serif-italic">Ring of Fire</em> exhibition; more recently he has published the archives of <em className="serif-italic">William Oldman</em>, <em className="serif-italic">Baron Freddy Rolin</em> and <em className="serif-italic">Ernst Heinrich</em>.
              </p>
              <a className="link-arrow" href="#" onClick={(e) => { e.preventDefault(); go({ name: 'about' }); }}>
                Read more <ArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

window.Nav = Nav;
window.Footer = Footer;
window.PubCover = PubCover;
window.Home = Home;
window.ArrowRight = ArrowRight;
