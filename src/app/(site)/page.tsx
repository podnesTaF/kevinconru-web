import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedPublications } from '@/lib/queries/publications';
import { ArrowRight } from '@/components/icons';
import HeroPlate from '@/components/HeroPlate';
import PubCover from '@/components/PubCover';
import Gallery, { type GalleryView } from '@/components/Gallery';

// Curated object photography (sourced from the publications archive),
// pre-sized into /public/works by scripts. One row of three, rendered through
// the shared Gallery island as uniform cover cards + the full-screen lightbox.
const COLLECTIONS: GalleryView[] = [
  {
    id: 'work-1',
    imageUrl: '/works/work-1.jpg',
    title: 'Carved mask with paua-shell eyes',
    caption: null,
    width: 1100,
    height: 1466,
  },
  {
    id: 'work-2',
    imageUrl: '/works/work-2.jpg',
    title: 'Seated figure, red patina',
    caption: null,
    width: 768,
    height: 1024,
  },
  {
    id: 'work-6',
    imageUrl: '/works/work-6.jpg',
    title: 'Carved stone stele',
    caption: null,
    width: 1100,
    height: 1468,
  },
];

export default async function HomePage() {
  const featured = await getFeaturedPublications();

  return (
    <main className="page">
      {/* HERO — paper with a faint atmosphere wash; type rises in sequence */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-type">
              <h1 className="display hero-title rise">
                African&nbsp;&amp;
                <br />
                <span className="it">Oceanic</span>
                <br />
                art.
              </h1>
              <p className="hero-sub rise" style={{ '--rise-delay': '0.14s' } as CSSProperties}>
                Kevin Conru is known for his publications on Southern African art, the photographs
                of Hugo Bernatzik, and the arts of Oceania.
              </p>
              <div
                className="rise"
                style={{ marginTop: 8, '--rise-delay': '0.26s' } as CSSProperties}
              >
                <Link className="link-arrow" href="/publications">
                  Explore the publications <ArrowRight />
                </Link>
              </div>
            </div>
            <HeroPlate />
          </div>
        </div>
      </section>

      {/* FEATURED PUBLICATIONS — paper, continuing the hero ground */}
      <section className="section section--flush-top">
        <div className="wrap">
          <div className="section-head" data-reveal="up">
            <h2 className="display">
              Recent{' '}
              <span className="serif-italic" style={{ color: 'var(--terra)' }}>
                publications
              </span>
            </h2>
            <Link className="link-arrow" href="/publications">
              All publications <ArrowRight />
            </Link>
          </div>
          <div className="pubs-grid">
            {featured.map((pub, i) => (
              <Link
                key={pub.id}
                className="pub-card"
                href={`/publications/${pub.slug}`}
                data-reveal="up"
                style={{ '--rv-delay': `${i * 80}ms` } as CSSProperties}
              >
                <PubCover pub={pub} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* OBJECT PHOTOGRAPHY — dark ink band; cover cards + lightbox, no section
          title (each piece is labelled on the card / in the viewer). */}
      <section className="section band-dark" aria-label="Object photography">
        <div className="wrap">
          <Gallery items={COLLECTIONS} layout="covers" reveal />
        </div>
      </section>

      {/* ABOUT TEASER — tonal band, echoing the About page frontispiece */}
      <section className="section band-alt">
        <div className="wrap">
          <div className="about-teaser">
            <div className="about-portrait" data-reveal="zoom">
              <Image
                src="/seed/portrait.jpg"
                alt="Kevin Conru"
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
              />
            </div>
            <div
              className="about-copy"
              data-reveal="up"
              style={{ '--rv-delay': '140ms' } as CSSProperties}
            >
              <h3>
                Publications, exhibitions, and a{' '}
                <span className="serif-italic" style={{ color: 'var(--terra)' }}>
                  life in the Pacific
                </span>
                .
              </h3>
              <p>
                His major book on the art of the Bismarck Archipelago formed the basis of the
                Wereldmuseum Rotterdam&apos;s <em className="serif-italic">Ring of Fire</em>{' '}
                exhibition; more recently he has published the archives of{' '}
                <em className="serif-italic">William Oldman</em>,{' '}
                <em className="serif-italic">Baron Freddy Rolin</em> and{' '}
                <em className="serif-italic">Ernst Heinrich</em>.
              </p>
              <p style={{ marginBottom: 28 }}>
                He has travelled extensively in the Pacific, holds an Arts Policy MA from The City
                University, London, and is an orchestral double bassist.
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
