// ─────────────────────────────────────────────────────────────────────────
// Kevin Conru — Publications index, Publication detail, About
// ─────────────────────────────────────────────────────────────────────────

// ─── Publications index ──────────────────────────────────────────────────
function Publications({ go }) {
  const [filter, setFilter] = useState('All');
  const regions = ['All', 'Oceania', 'Polynesia', 'Melanesia', 'Africa'];
  const matches = (pub) => {
    if (filter === 'All') return true;
    if (filter === 'Oceania') return /Oceania|Polynesia|Melanesia/.test(pub.region);
    return pub.region.includes(filter);
  };
  const list = PUBLICATIONS.filter(matches);

  return (
    <main className="page">
      <div className="wrap">
        <header className="pubs-head">
          <h1 className="display">Publications</h1>
          <p className="intro">
            Catalogues, monographs and archives — published over four decades on the arts of Oceania and Sub-Saharan Africa. Many accompany exhibitions held in Brussels, Rotterdam and beyond.
          </p>
        </header>

        <div className="pubs-toolbar">
          <span>{list.length} {list.length === 1 ? 'title' : 'titles'}</span>
          <div className="pubs-filters">
            {regions.map((r) => (
              <button key={r}
                className={"pubs-filter" + (filter === r ? " is-active" : "")}
                onClick={() => setFilter(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="pubs-grid">
          {list.map((pub, i) => (
            <article key={pub.id} className="pub-card fade-up"
              style={{ animationDelay: (i * 60) + 'ms' }}
              onClick={() => go({ name: 'publication', id: pub.id })}>
              <div className="pub-cover" style={{ '--cover-bg': pub.coverBg, '--cover-fg': pub.coverFg }}>
                <div className="pc-bg"></div>
                <div className="pc-content">
                  <div className="pc-mini">{pub.region}</div>
                  <div>
                    <div className="pc-mini" style={{ marginBottom: 10 }}>{pub.type} · {pub.year}</div>
                    <div className="pc-title">
                      {pub.title}
                    </div>
                  </div>
                </div>
                {pub.coverImage && (
                  <div className="pc-image" style={{ backgroundImage: `url('${pub.coverImage}')` }}></div>
                )}
              </div>
              <div className="pub-info">
                <div className="pub-info-l">
                  <h3>{pub.title}</h3>
                  <span className="pub-meta">{pub.sub}</span>
                </div>
                <span className="pub-year">{pub.year}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Lightbox ──────────────────────────────────────────────────────────
function Lightbox({ plate, total, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNav]);

  return (
    <div className={"lb" + (plate ? " is-open" : "")}>
      {plate && (
        <React.Fragment>
          <div className="lb-hd">
            <span>Plate № {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            <button className="lb-x" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className="lb-stage">
            <div className="lb-img">
              <img src={plate.image} alt={plate.title} />
            </div>
            <div className="lb-side">
              <h4 className="display">{plate.title}</h4>
              <p style={{ color: 'rgba(239,233,216,.6)', fontStyle: 'italic', fontFamily: 'var(--f-display)', fontSize: 17 }}>{plate.region}</p>
              <div className="lab">Date</div>
              <p>{plate.date}</p>
              <div className="lab">Materials</div>
              <p>{plate.materials}</p>
              <div className="lab">Dimensions</div>
              <p>{plate.dims}</p>
              <div className="lab">Provenance</div>
              <p>{plate.provenance}</p>
              <div className="lab">Note</div>
              <p>{plate.caption}</p>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// ─── Publication detail ──────────────────────────────────────────────────
function PublicationDetail({ id, go }) {
  const pub = PUBLICATIONS.find((p) => p.id === id) || PUBLICATIONS[0];
  const plates = pub.plates || [];
  const [lbIndex, setLbIndex] = useState(null);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const idx = PUBLICATIONS.findIndex((p) => p.id === pub.id);
  const next = PUBLICATIONS[(idx + 1) % PUBLICATIONS.length];

  return (
    <main className="page">
      <div className="wrap pd">
        <a className="pd-crumb" href="#" onClick={(e) => { e.preventDefault(); go({ name: 'publications' }); }}>
          ← Publications
        </a>

        <section className="pd-hero">
          <div className="pd-cover" style={{ '--cover-bg': pub.coverBg, '--cover-fg': pub.coverFg, background: pub.coverBg }}>
            <div className="pc-content" style={{ color: pub.coverFg }}>
              <div className="pc-mini">{pub.region} · {pub.type}</div>
              <div>
                <div className="pc-mini" style={{ marginBottom: 14 }}>{pub.publisher}</div>
                <div className="pc-title">{pub.title}</div>
              </div>
            </div>
            {pub.coverImage && <div className="pc-image" style={{ backgroundImage: `url('${pub.coverImage}')`, opacity: 1 }}></div>}
          </div>
          <div>
            <span className="eyebrow">{pub.type} · {pub.year}</span>
            <h1 className="pd-title" style={{ marginTop: 16 }}>
              {pub.title}
            </h1>
            <p className="serif-italic" style={{ fontSize: 24, color: 'var(--fg-soft)', margin: '-8px 0 24px' }}>{pub.sub}</p>
            <p className="pd-lead">{pub.summary}</p>
            <div className="pd-specs">
              <div className="pd-spec"><span className="lab">Year</span><span className="val">{pub.year}</span></div>
              <div className="pd-spec"><span className="lab">Pages</span><span className="val">{pub.pages}</span></div>
              <div className="pd-spec"><span className="lab">Publisher</span><span className="val" style={{ fontSize: 16 }}>{pub.publisher}</span></div>
              <div className="pd-spec"><span className="lab">Region</span><span className="val" style={{ fontSize: 16 }}>{pub.region}</span></div>
            </div>
            <div style={{ marginTop: 32 }}>
              <a className="link-arrow" href={"mailto:" + CONTACT.email + "?subject=" + encodeURIComponent("Enquiry — " + pub.title)}>
                Enquire about this title <ArrowRight />
              </a>
            </div>
          </div>
        </section>

        {plates.length > 0 && (
          <section>
            <div className="section-head" style={{ marginBottom: 40 }}>
              <div>
                <span className="eyebrow">Selected plates</span>
                <h2 className="display" style={{ fontSize: 'clamp(28px,3.5vw,44px)', marginTop: 12 }}>From the catalogue</h2>
              </div>
            </div>
            <div className="pd-plates">
              {plates.map((pl, i) => (
                <div key={pl.id} className="plate-card" onClick={() => setLbIndex(i)}>
                  <div className="plate">
                    <span className="plate-num">№ {String(i + 1).padStart(2, '0')}</span>
                    <img src={pl.image} alt={pl.title} />
                  </div>
                  <div className="plate-cap">
                    <span className="num">№ {String(i + 1).padStart(2, '0')}</span>
                    <div className="body">
                      <h4>{pl.title}</h4>
                      <p>{pl.region} · {pl.date}<br />{pl.materials}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginTop: 100, paddingTop: 40, borderTop: '1px solid var(--rule)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <span className="eyebrow">Next title</span>
              <a href="#" onClick={(e) => { e.preventDefault(); go({ name: 'publication', id: next.id }); }}
                 style={{ display: 'block', marginTop: 12 }}>
                <span className="display" style={{ fontSize: 'clamp(32px,5vw,64px)', lineHeight: 1 }}>{next.title}</span>
              </a>
            </div>
            <a className="link-arrow" href="#" onClick={(e) => { e.preventDefault(); go({ name: 'publication', id: next.id }); }}>
              Continue <ArrowRight />
            </a>
          </div>
        </section>
      </div>

      <Lightbox
        plate={lbIndex !== null ? plates[lbIndex] : null}
        total={plates.length}
        index={lbIndex || 0}
        onClose={() => setLbIndex(null)}
        onNav={(d) => setLbIndex((v) => (v + d + plates.length) % plates.length)}
      />
    </main>
  );
}

// ─── Film embed ────────────────────────────────────────────────────────
function FilmEmbed({ film }) {
  const [play, setPlay] = useState(false);
  const src = film.youtube
    ? `https://www.youtube.com/embed/${film.youtube}?rel=0&modestbranding=1${film.start ? `&start=${film.start}` : ''}${play ? '&autoplay=1' : ''}`
    : null;
  return (
    <div className="film">
      <div className="film-frame">
        {src ? (
          play ? (
            <iframe src={src} title={film.title} frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          ) : (
            <button className="film-poster" onClick={() => setPlay(true)} style={{ backgroundImage: `url('https://img.youtube.com/vi/${film.youtube}/maxresdefault.jpg')` }}>
              <span className="film-play" aria-hidden="true">▶</span>
            </button>
          )
        ) : (
          <div className="film-poster film-poster--soon">
            <span>Film · {film.year}</span>
          </div>
        )}
      </div>
      <div className="film-cap">
        <div className="film-meta">
          <span className="display film-title">{film.title}</span>
          <span className="cap">{film.year}</span>
        </div>
        <p>{film.intro}</p>
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────
function About({ go }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const timeline = [
    { yr: '2025', ev: 'The Ernst Heinrich Archive', desc: 'Published the archive of the German collector; a study of A. B. Lewis\u2019s personal photographs of New Guinea artefacts.' },
    { yr: '2024', ev: '100 Years of Surrealism', desc: 'Curated an Oceanic art exhibition for the ARTONOV festival, Brussels.' },
    { yr: '2023', ev: 'Polynesia · Ontong Java', desc: 'Curated and published on the arts of Polynesia (Lempertz Brussels); released the film \u201cOntong Java, Encounters and Observations\u201d.' },
    { yr: '2021', ev: 'Baron Freddy Rolin', desc: 'Published the archive of the Belgian collector and dealer.' },
    { yr: '2019', ev: 'Sepik / Ramu', desc: 'Curated and published on the arts of the Sepik / Ramu area of Papua New Guinea (Lempertz Brussels).' },
    { yr: '2016', ev: 'The William Oldman Collection', desc: 'Comprehensive book on the Oldman archive, with Robert Hales.' },
    { yr: '2014', ev: 'Papua New Guinea Masterpieces', desc: 'Curated an exhibition from the Royal Museum for Central Africa, held in Brussels.' },
    { yr: '2013', ev: 'Ring of Fire', desc: 'Major book on the art of the Bismarck Archipelago; basis of the Wereldmuseum Rotterdam exhibition, 2013\u20132014.' },
    { yr: '2006', ev: 'The Oldman Collection — Maori Art in London', desc: 'Produced a short documentary film.' },
  ];

  return (
    <main className="page">
      <div className="wrap ab">
        <a className="pd-crumb" href="#" onClick={(e) => { e.preventDefault(); go({ name: 'home' }); }}>← Home</a>

        <section className="ab-hero">
          <div className="ab-portrait">
            <img src="assets/portrait.jpg" alt="Kevin Conru" />
          </div>
          <div>
            <span className="eyebrow">About</span>
            <h1 className="ab-name">Kevin<br />Conru</h1>
            <div className="ab-role">Dealer · Curator · Publisher · Double bassist</div>
            <p className="ab-lead">
              Known for his publications on Southern African art, the photographs of <span className="it">Hugo Bernatzik</span>, and the arts of Oceania.
            </p>
          </div>
        </section>

        <section className="ab-body">
          <h3 className="display">Biography</h3>
          <div className="col">
            <p>
              Kevin Conru is known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania. He has travelled extensively in the Pacific and is a member of the Pacific Arts Association and the Oceanic Art Society. He has an Arts Policy MA from The City University, London, and is an orchestral double bassist.
            </p>
            <p>
              Kevin has published online the South Seas diary of a turn-of-the-20th-century Australian journalist, and has produced a major book on the art of the Bismarck Archipelago in Melanesia which was released in September 2013. This book formed the basis of the Rotterdam Wereldmuseum's Ring of Fire exhibition that took place in 2013–2014. He has curated an important exhibition of Papua New Guinea masterpieces from the Royal Museum for Central Africa, which was held in Brussels in 2014.
            </p>
            <p>
              Along with Robert Hales, he published a comprehensive book on the archive of William Oldman in 2016, and later in 2021, the archive of the Belgian collector and dealer Baron Freddy Rolin. He has curated and published on the arts of the Sepik / Ramu area of Papua New Guinea in 2019 and the arts of Polynesia in 2023. Both of these publications accompanied related exhibitions which were held at Lempertz Brussels. In 2024, he organised an Oceanic art exhibition that celebrated 100 years of Surrealism for the ARTONOV festival in Brussels. Recently, in 2025, he published the archive of the German collector Ernst Heinrich and a book on A. B. Lewis's personal photographs of New Guinea artefacts.
            </p>
            <p>
              Kevin Conru advises the Wyvern Research Institute in London. Beyond his curatorial and academic work, he produced two short films: <em className="serif-italic">The Oldman Collection — Maori Art in London</em> (2006) and <em className="serif-italic">Ontong Java, Encounters and Observations</em> (2023).
            </p>
          </div>
        </section>

        {/* Films */}
        <section style={{ marginTop: 90, paddingTop: 60, borderTop: '1px solid var(--rule-soft)' }}>
          <div className="section-head" style={{ marginBottom: 40 }}>
            <div>
              <span className="eyebrow">Film</span>
              <h2 className="display" style={{ fontSize: 'clamp(32px,4.5vw,52px)', marginTop: 12 }}>Moving image</h2>
            </div>
          </div>
          <div className="films-grid">
            {FILMS.map((f) => <FilmEmbed key={f.id} film={f} />)}
          </div>
        </section>

        {/* Timeline */}
        <section className="ab-cv" style={{ marginTop: 90 }}>
          <h3 className="display">Selected<br />chronology</h3>
          <div>
            {timeline.map((t, i) => (
              <div key={i} className="cv-row">
                <span className="yr">{t.yr}</span>
                <span className="ev"><em>{t.ev}</em><span className="desc">{t.desc}</span></span>
              </div>
            ))}
          </div>
        </section>

        {/* Affiliations */}
        <section className="ab-cv" style={{ marginTop: 60 }}>
          <h3 className="display">Affiliations</h3>
          <div>
            <div className="cv-row"><span className="yr">Member</span><span className="ev"><em>Pacific Arts Association</em></span></div>
            <div className="cv-row"><span className="yr">Member</span><span className="ev"><em>Oceanic Art Society</em></span></div>
            <div className="cv-row"><span className="yr">Advisor</span><span className="ev"><em>Wyvern Research Institute, London</em><span className="desc"><a href="https://wyvernresearch.org/" target="_blank" rel="noopener" style={{ borderBottom: '1px solid var(--rule)' }}>wyvernresearch.org ↗</a></span></span></div>
            <div className="cv-row"><span className="yr">MA</span><span className="ev"><em>Arts Policy, The City University, London</em></span></div>
          </div>
        </section>

        {/* Contact */}
        <section className="ab-contact" id="contact">
          <div className="cell">
            <span className="lab">Telephone</span>
            <span className="val"><a href={CONTACT.telHref}>{CONTACT.tel}</a></span>
          </div>
          <div className="cell">
            <span className="lab">Email</span>
            <span className="val"><a href={"mailto:" + CONTACT.email}>{CONTACT.email}</a></span>
          </div>
          <div className="cell">
            <span className="lab">Social</span>
            <span className="val">
              <a href={CONTACT.facebook} target="_blank" rel="noopener">Facebook</a> · <a href={CONTACT.instagram} target="_blank" rel="noopener">Instagram</a>
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

window.Publications = Publications;
window.PublicationDetail = PublicationDetail;
window.About = About;
