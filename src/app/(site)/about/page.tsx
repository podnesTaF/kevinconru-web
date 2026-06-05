import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSettings } from "@/lib/queries/content";
import { getTimeline, getAffiliations } from "@/lib/queries/content";
import { CONTACT } from "@/lib/site";
import RichText from "@/components/RichText";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kevin Conru — known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania. Brussels.",
};

const FALLBACK_BIO =
  "<p>Kevin Conru is known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania.</p>";

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "").trim();

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

        {/* Chronology */}
        {timeline.length > 0 && (
          <section className="ab-cv" style={{ marginTop: "clamp(56px, 10vw, 90px)" }}>
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
          <section className="ab-cv" style={{ marginTop: "clamp(40px, 8vw, 60px)" }}>
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
