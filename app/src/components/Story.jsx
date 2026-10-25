import React from "react";

/* Full-bleed product image band with crisp copy overlay. */
export default function Story() {
  return (
    <section className="section section--ink story js-reveal" aria-labelledby="story-title">
      <div className="story__bg">
        <img
          src="/assets/products/product-motion-1.jpg"
          alt="Ice cubes in motion"
          width="923"
          height="1152"
          decoding="async"
          loading="lazy"
        />
      </div>
      <div className="story__inner">
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
