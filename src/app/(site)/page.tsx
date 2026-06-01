import Link from "next/link";
import Image from "next/image";
import { getFeaturedPublications } from "@/lib/queries/publications";
import { getSiteSettings, type HeroStat, type Marquee as MarqueeItems } from "@/lib/queries/content";
import { regionLabel } from "@/lib/format";
import { ArrowRight } from "@/components/icons";
import HeroPlate from "@/components/HeroPlate";
import Marquee from "@/components/Marquee";

const FALLBACK_STATS: HeroStat[] = [
  { num: "10", label: "Publications" },
  { num: "6", label: "Curated exhibitions" },
  { num: "2", label: "Short films" },
];

export default async function HomePage() {
  const [featured, settings] = await Promise.all([getFeaturedPublications(), getSiteSettings()]);

  const stats = (settings?.heroStats as HeroStat[] | undefined) ?? FALLBACK_STATS;
  const marquee = (settings?.marquee as MarqueeItems | undefined) ?? [];

  return (
    <main className="page">
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-type">
              <div className="hero-meta">
                <span className="dot" />
                <span className="eyebrow">Dealer · Curator · Publisher — Brussels</span>
              </div>
              <h1 className="display hero-title">
                African&nbsp;&amp;
                <br />
                <span className="it">Oceanic</span>
                <br />
                art.
              </h1>
              <p className="hero-sub">
                Kevin Conru is known for his publications on Southern African art, the photographs of
                Hugo Bernatzik, and the arts of Oceania. A member of the Pacific Arts Association and
                the Oceanic Art Society, based in Brussels.
              </p>
              <div className="hero-stats">
                {stats.map((s) => (
                  <div className="stat" key={s.label}>
                    <span className="num">{s.num}</span>
                    <span className="lab">{s.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <Link className="link-arrow" href="/publications">
                  Explore the publications <ArrowRight />
                </Link>
              </div>
            </div>
            <HeroPlate />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee items={marquee} />

      {/* FEATURED PUBLICATIONS */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">№ 01 — Selected Publications</span>
              <h2 className="display">
                Recent{" "}
                <span className="serif-italic" style={{ color: "var(--terra)" }}>
                  volumes
                </span>
                .
              </h2>
            </div>
            <Link className="link-arrow" href="/publications">
              All publications <ArrowRight />
            </Link>
          </div>
          <div className="featured-grid">
            {featured.map((pub) => (
              <Link key={pub.id} className="feat-card" href={`/publications/${pub.slug}`}>
                <div className="feat-plate" style={{ background: pub.coverBg ?? undefined }}>
                  {pub.coverImage ? (
                    <Image
                      src={pub.coverImage.url}
                      alt={pub.coverImage.alt ?? pub.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="feat-fallback" style={{ color: pub.coverFg ?? "#efe9d8" }}>
                      {pub.title}
                    </div>
                  )}
                </div>
                <div className="feat-meta">
                  <span>{regionLabel(pub.region)}</span>
                  <span>{pub.year}</span>
                </div>
                <h3 className="feat-title">
                  {pub.title}
                  {pub.subtitle && (
                    <>
                      <br />
                      <span className="it">— {pub.subtitle}</span>
                    </>
                  )}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="section">
        <div className="wrap">
          <div className="about-teaser">
            <div className="about-portrait">
              <Image src="/seed/portrait.jpg" alt="Kevin Conru" fill sizes="(max-width: 900px) 100vw, 42vw" />
            </div>
            <div className="about-copy">
              <span className="eyebrow" style={{ marginBottom: 18, display: "block" }}>
                № 02 — The dealer
              </span>
              <h3>
                Publications, exhibitions, and a{" "}
                <span className="serif-italic" style={{ color: "var(--terra)" }}>
                  life in the Pacific
                </span>
                .
              </h3>
              <p>
                He has travelled extensively in the Pacific, holds an Arts Policy MA from The City
                University, London, and is an orchestral double bassist.
              </p>
              <p style={{ marginBottom: 28 }}>
                His major book on the art of the Bismarck Archipelago formed the basis of the
                Wereldmuseum Rotterdam&apos;s <em className="serif-italic">Ring of Fire</em> exhibition;
                more recently he has published the archives of{" "}
                <em className="serif-italic">William Oldman</em>,{" "}
                <em className="serif-italic">Baron Freddy Rolin</em> and{" "}
                <em className="serif-italic">Ernst Heinrich</em>.
              </p>
              <Link className="link-arrow" href="/about">
                Read more <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
