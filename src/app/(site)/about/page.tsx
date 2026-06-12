import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { getSiteSettings, getAffiliations } from '@/lib/queries/content';
import { CONTACT, FALLBACK_BIO } from '@/lib/site';
import RichText from '@/components/RichText';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Kevin Conru — known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania. Brussels.',
};

type Affiliation = { id: string; role: string; name: string; url: string | null };

// Relationship labels + the order their groups appear in. Roles are stored as
// short freeform strings in the DB ("Member", "Advisor", …); these turn them
// into the editorial headings shown on the page. Unknown roles fall back to the
// raw role and sort to the end.
const ROLE_LABELS: Record<string, string> = {
  Member: 'Member of',
  Advisor: 'Advisor of',
  Friend: 'Friends',
};
const ROLE_ORDER = ['Member', 'Friend', 'Advisor'];

// Roles stored on the About page but not shown in the Links section (e.g. the
// academic credential, which already lives in the biography copy).
const HIDDEN_ROLES = new Set(['MA']);

// Collapse the flat affiliation list into ordered groups keyed by role, keeping
// each role's original sortOrder within its group.
const groupAffiliations = (items: Affiliation[]) => {
  const groups = new Map<string, Affiliation[]>();
  for (const a of items) {
    if (HIDDEN_ROLES.has(a.role)) continue;
    const bucket = groups.get(a.role);
    if (bucket) bucket.push(a);
    else groups.set(a.role, [a]);
  }
  const rank = (role: string) => {
    const i = ROLE_ORDER.indexOf(role);
    return i === -1 ? ROLE_ORDER.length : i;
  };
  return [...groups.entries()]
    .map(([role, members]) => ({ role, members }))
    .sort((a, b) => rank(a.role) - rank(b.role));
};

// Background sequence down the page: tonal frontispiece → paper biography →
// affiliations → paper contact strip → dark footer.
export default async function AboutPage() {
  const [settings, affiliations] = await Promise.all([getSiteSettings(), getAffiliations()]);

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

      {/* Links — affiliations & friends */}
      {affiliations.length > 0 && (
        <section className="section">
          <div className="wrap">
            <section className="ab-cv ab-aff">
              <h3 className="display" data-reveal="up">
                Links
              </h3>
              <div className="aff-groups">
                {groupAffiliations(affiliations).map((g, gi) => (
                  <div
                    key={g.role}
                    className="aff-group"
                    data-reveal="up"
                    style={{ '--rv-delay': `${gi * 80}ms` } as CSSProperties}
                  >
                    <span className="aff-role">{ROLE_LABELS[g.role] ?? g.role}</span>
                    <ul className="aff-list">
                      {g.members.map((a) => (
                        <li key={a.id} className="aff-item">
                          <span className="aff-name">{a.name}</span>
                          {a.url && (
                            <a
                              className="aff-link"
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {a.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      )}

      {/* Contact — paper strip before the dark footer */}
      <section className="section" style={{ paddingBottom: 0,paddingTop: 0 }}>
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
