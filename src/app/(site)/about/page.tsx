import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSettings } from "@/lib/queries/content";
import { getFilms, getTimeline, getAffiliations } from "@/lib/queries/content";
import { CONTACT } from "@/lib/site";
import RichText from "@/components/RichText";
import FilmEmbed from "@/components/FilmEmbed";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kevin Conru — dealer, curator and publisher of African and Oceanic art, based in Brussels.",
};

const FALLBACK_BIO =
  "<p>Kevin Conru is known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania.</p>";

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "").trim();

export default async function AboutPage() {
  const [settings, films, timeline, affiliations] = await Promise.all([
    getSiteSettings(),
    getFilms(),
    getTimeline(),
    getAffiliations(),
  ]);

  const roleLine = settings?.roleLine ?? "Dealer · Curator · Publisher · Double bassist";
  const bio = settings?.bio ?? FALLBACK_BIO;
  const tel = settings?.tel ?? CONTACT.tel;
  const telHref = settings?.telHref ?? CONTACT.telHref;
  const email = settings?.email ?? CONTACT.email;
  const facebook = settings?.facebook ?? CONTACT.facebook;
  const instagram = settings?.instagram ?? CONTACT.instagram;

  return (
    <main className="page">
      <div className="wrap ab">
        <section className="ab-hero">
          <div className="ab-portrait">
            <Image src="/seed/portrait.jpg" alt="Kevin Conru" fill sizes="(max-width: 900px) 100vw, 42vw" />
          </div>
          <div>
            <span className="eyebrow">About</span>
            <h1 className="ab-name">
              Kevin
              <br />
              Conru
            </h1>
            <div className="ab-role">{roleLine}</div>
            <p className="ab-lead">
              Known for his publications on Southern African art, the photographs of{" "}
              <span className="it">Hugo Bernatzik</span>, and the arts of Oceania.
            </p>
          </div>
        </section>

        <section className="ab-body">
          <h3 className="display">Biography</h3>
          <div className="col">
            <RichText html={bio} />
          </div>
        </section>

        {/* Films */}
        {films.length > 0 && (
          <section style={{ marginTop: 90, paddingTop: 60, borderTop: "1px solid var(--rule-soft)" }}>
            <div className="section-head" style={{ marginBottom: 40 }}>
              <div>
                <span className="eyebrow">Film</span>
                <h2 className="display" style={{ fontSize: "clamp(32px,4.5vw,52px)", marginTop: 12 }}>
                  Moving image
                </h2>
              </div>
            </div>
            <div className="films-grid">
              {films.map((f) => (
                <FilmEmbed
                  key={f.id}
                  film={{
                    id: f.id,
                    title: f.title,
                    year: f.year,
                    youtubeId: f.youtubeId,
                    startSeconds: f.startSeconds,
                    intro: f.intro,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Chronology */}
        {timeline.length > 0 && (
          <section className="ab-cv" style={{ marginTop: 90 }}>
            <h3 className="display">
              Selected
              <br />
              chronology
            </h3>
            <div>
              {timeline.map((t) => (
                <div key={t.id} className="cv-row">
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

        {/* Affiliations */}
        {affiliations.length > 0 && (
          <section className="ab-cv" style={{ marginTop: 60 }}>
            <h3 className="display">Affiliations</h3>
            <div>
              {affiliations.map((a) => (
                <div key={a.id} className="cv-row">
                  <span className="yr">{a.role}</span>
                  <span className="ev">
                    <em>{a.name}</em>
                    {a.url && (
                      <span className="desc">
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ borderBottom: "1px solid var(--rule)" }}
                        >
                          {a.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
                        </a>
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section className="ab-contact" id="contact">
          <div className="cell">
            <span className="lab">Telephone</span>
            <span className="val">
              <a href={telHref}>{tel}</a>
            </span>
          </div>
          <div className="cell">
            <span className="lab">Email</span>
            <span className="val">
              <a href={`mailto:${email}`}>{email}</a>
            </span>
          </div>
          <div className="cell">
            <span className="lab">Social</span>
            <span className="val">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              )}
              {facebook && instagram && " · "}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              )}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
