import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries/content';
import HeroPlate from '@/components/HeroPlate';
import RichText from '@/components/RichText';

const FALLBACK_BIO =
  '<p>Kevin Conru is known for his publications on Southern African art, the photographs of Hugo Bernatzik, and the arts of Oceania.</p>';

export default async function HomePage() {
  const settings = await getSiteSettings();
  const bio = settings?.bio ?? FALLBACK_BIO;

  return (
    <main className="page">
      {/* HERO — full-bleed darkened background photo, type + CTAs on top */}
      <section className="hero hero--cover">
        <HeroPlate />
        <div className="wrap">
          <div className="hero-type">
            <h1 className="display hero-title rise">
              Kevin
              <br />
              Conru
            </h1>
            <p className="hero-sub rise" style={{ '--rise-delay': '0.14s' } as CSSProperties}>
              Kevin Conru is known for his publications on Southern African art, the photographs of
              Hugo Bernatzik, and the arts of Oceania.
            </p>
            <div
              className="hero-ctas rise"
              style={{ '--rise-delay': '0.26s' } as CSSProperties}
            >
              <Link className="hero-cta hero-cta--primary" href="/about#contact">
                Contact
              </Link>
              <Link className="hero-cta" href="/about">
                About
              </Link>
              <Link className="hero-cta" href="/publications">
                Publications
              </Link>
            </div>
          </div>
        </div>
        <Link className="hero-scroll" href="#biography" aria-label="Scroll to biography">
          <span className="hero-scroll-line" />
          <span className="hero-scroll-label">Scroll</span>
        </Link>
      </section>

      {/* BIOGRAPHY — portrait + text, as on About */}
      <section className="section" id="biography">
        <div className="wrap">
          <div className="ab-body ab-body--portrait">
            <div className="ab-portrait plate-in" data-reveal="up">
              <Image
                src="/seed/portrait.jpg"
                alt="Kevin Conru"
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
              />
            </div>
            <div className="ab-body-main">
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
        </div>
      </section>
    </main>
  );
}
