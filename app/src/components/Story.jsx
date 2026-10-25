import React from "react";
import { useParallax } from "../hooks/useParallax.js";

/* Story band: the frame-020 background translates with scroll (depth 0.18,
 * scale 1.12 cover) — transform only, settled to `none` under reduced
 * motion. */
export default function Story() {
  const { bandRef, bgRef } = useParallax();

  return (
    <section className="parallax story" data-parallax="0.18" aria-labelledby="story-title" ref={bandRef}>
      <div
        className="parallax__bg"
        ref={bgRef}
        style={{ backgroundImage: "url('/assets/reel/frame-020.webp')" }}
        aria-hidden="true"
      />
      <div className="shell story__inner">
        <p className="eyebrow">The cold room</p>
        <h2 id="story-title">Cold is a service, not a slogan.</h2>
        <p className="story__body">
          Two kilos fills a cooler for a long day; three is the better rate for a braai. Call ahead and it is bagged
          before you arrive, so the ice is still cold when you get there.
        </p>
      </div>
    </section>
  );
}
