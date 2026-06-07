import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/queries/content';
import { getTimeline, getAffiliations } from '@/lib/queries/content';
import { CONTACT } from '@/lib/site';
import RichText from '@/components/RichText';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Kevin Conru — known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania. Brussels.',
};

const FALLBACK_BIO =
  '<p>Kevin Conru is known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania.</p>';

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').trim();

// Background sequence down the page: tonal frontispiece → paper biography →
// dark band (chronology + affiliations) → paper contact strip → dark footer.
export default async function AboutPage() {
  const [settings, timeline, affiliations] = await Promise.all([
    getSiteSettings(),
    getTimeline(),
    getAffiliations(),
  ]);

  const bio = settings?.bio ?? FALLBACK_BIO;
  const tel = settings?.tel ?? CONTACT.tel;
  const telHref = settings?.telHref ?? CONTACT.telHref;
  const email = settings?.email ?? CONTACT.email;
  const facebook = settings?.facebook ?? CONTACT.facebook;
  const instagram = settings?.instagram ?? CONTACT.instagram;

  return (
    <main className="page">
      {/* Frontispiece — tonal band opens the page like a book plate. */}
      <section className="band-alt ab-hero-band">
        <div className="wrap">
          <div className="ab-hero">
            <div className="ab-portrait plate-in">
              <Image
                src="/seed/portrait.jpg"
                alt="Kevin Conru"
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
              />
            </div>
            <div>
              <span className="eyebrow rise">About</span>
              <h1 className="ab-name rise" style={{ '--rise-delay': '0.1s' } as CSSProperties}>
                Kevin
                <br />
                Conru
              </h1>
              <p className="ab-lead rise" style={{ '--rise-delay': '0.22s' } as CSSProperties}>
                Known for his publications on Southern African art, the photographs of{' '}
                <span className="it">Hugo Bernatzik</span>, and the arts of Oceania.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Biography — back on the paper ground */}
      <section className="section">
        <div className="wrap">
          <div className="ab-body">
            <h3 className="display" data-reveal="up">
              Biography
            </h3>
            <div
              className="col"
              data-reveal="up"
              style={{ '--rv-delay': '120ms' } as CSSProperties}
            >
              <RichText html={bio} />
            </div>
          </div>
        </div>
      </section>

      {/* Archive — chronology + affiliations on the dark ink band */}
      {(timeline.length > 0 || affiliations.length > 0) && (
        <section className="section band-dark ab-archive">
          <div className="wrap">
            {timeline.length > 0 && (
              <section className="ab-cv">
                <h3 className="display" data-reveal="up">
                  Selected
                  <br />
                  chronology
                </h3>
                <div>
                  {timeline.map((t, i) => (
                    <div
                      key={t.id}
                      className="cv-row"
                      data-reveal="up"
                      style={{ '--rv-delay': `${Math.min(i, 6) * 60}ms` } as CSSProperties}
                    >
                      <span className="yr">{t.year}</span>
                      <span className="ev">
                        <em>{t.event}</em>
                        <span className="desc">{stripHtml(t.description)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {affiliations.length > 0 && (
              <section className="ab-cv" style={{ marginTop: 'clamp(40px, 8vw, 60px)' }}>
                <h3 className="display" data-reveal="up">
                  Affiliations
                </h3>
                <div>
                  {affiliations.map((a, i) => (
                    <div
                      key={a.id}
                      className="cv-row"
                      data-reveal="up"
                      style={{ '--rv-delay': `${Math.min(i, 6) * 60}ms` } as CSSProperties}
                    >
                      <span className="yr">{a.role}</span>
                      <span className="ev">
                        <em>{a.name}</em>
                        {a.url && (
                          <span className="desc">
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ borderBottom: '1px solid var(--ink-rule)' }}
                            >
                              {a.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
                            </a>
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      )}

      {/* Contact — paper strip before the dark footer */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="ab-contact" id="contact">
            <div className="cell" data-reveal="up">
              <span className="lab">Telephone</span>
              <span className="val">
                <a href={telHref}>{tel}</a>
              </span>
            </div>
            <div
              className="cell"
              data-reveal="up"
              style={{ '--rv-delay': '90ms' } as CSSProperties}
            >
              <span className="lab">Email</span>
              <span className="val">
                <a href={`mailto:${email}`}>{email}</a>
              </span>
            </div>
            <div
              className="cell"
              data-reveal="up"
              style={{ '--rv-delay': '180ms' } as CSSProperties}
            >
              <span className="lab">Social</span>
              <span className="val">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                )}
                {facebook && instagram && ' · '}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                )}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
