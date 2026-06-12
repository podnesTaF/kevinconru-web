import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries/content';
import HeroPlate from '@/components/HeroPlate';
import RichText from '@/components/RichText';
import { FALLBACK_BIO, TAGLINE } from '@/lib/site';

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
            <p className="eyebrow hero-eyebrow rise">
              Brussels · {TAGLINE}
            </p>
            <h1 className="display hero-title rise" style={{ '--rise-delay': '0.08s' } as CSSProperties}>
              Kevin <span className="it">Conru</span>
            </h1>
            <p className="hero-sub rise" style={{ '--rise-delay': '0.14s' } as CSSProperties}>
              Over the past four decades, Kevin Conru has undertaken a sustained study of these{' '}
              <span className="hl">artistic traditions</span> and the{' '}
              <span className="hl">cultures</span> from which they emerge. Through extensive
              research, publication, and curatorial practice, he has contributed significantly to the
              understanding and appreciation of these works, presenting his findings in numerous{' '}
              <span className="hl">exhibitions</span> and scholarly{' '}
              <span className="hl">publications</span>.
            </p>
            <div
              className="hero-ctas rise"
              style={{ '--rise-delay': '0.26s' } as CSSProperties}
            >
              <Link className="hero-cta hero-cta--primary" href="/about">
                About Kevin
              </Link>
              <Link className="hero-cta" href="/publications">
                Publications
              </Link>
              <Link className="hero-cta" href="/exhibitions">
                Exhibitions
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
