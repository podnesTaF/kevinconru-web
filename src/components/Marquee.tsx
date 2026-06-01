import { Fragment } from "react";

// Infinite credibility strip. Two identical tracks (the second aria-hidden)
// let the CSS keyframe loop seamlessly.
export default function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null;

  const content = items.map((item, i) => (
    <Fragment key={i}>
      {item} <span className="star">✦</span>{" "}
    </Fragment>
  ));

  return (
    <section className="marquee">
      <div className="marquee-track">
        <span>{content}</span>
        <span aria-hidden="true">{content}</span>
      </div>
    </section>
  );
}
