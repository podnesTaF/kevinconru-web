import Image from 'next/image';

const HERO_IMAGE = '/objects/object-7.jpg';

// Full-bleed hero background — one static photo under a dark wash so the
// hero type stays legible.
export default function HeroPlate() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" />
      <div className="hero-bg-veil" />
    </div>
  );
}
