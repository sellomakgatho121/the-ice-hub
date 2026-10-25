import React from "react";
import { SHOP } from "../lib/config.js";
import { useReel } from "../hooks/useReel.js";

/* The signature: a 150svh sticky runway scrubbing the owner's 30-frame reel.
 * Beat 1 is the active beat at first paint, exactly as the live site paints.
 * The scrub, progress hairline, and two-layer crossfade live in useReel. */
export default function Hero() {
  const { heroRef, layerARef, layerBRef, barRef, beat } = useReel();

  const beats = [
    {
      n: 1,
      content: (
        <>
          <h1 className="hero__statement" id="hero-statement">
            Below freezing, on Raymond Mhlaba Street.
          </h1>
          <p className="hero__sub">
            Ice in Tembisa from R17 a bag. Free delivery around Tembisa, open seven days a week.
          </p>
        </>
      ),
    },
    {
      n: 2,
      content: (
        <>
          <p className="hero__line">From one bag to thirty.</p>
          <p className="hero__sub">
            R17 for a 2 kg bag, R22 for a 3 kg. At thirty bags or more the whole line drops to stock price: R10 and
            R12.
          </p>
        </>
      ),
    },
    {
      n: 3,
      content: (
        <>
          <p className="hero__line">More cold. Less waiting.</p>
          <p className="hero__sub">
            Free delivery around Tembisa. Call ahead and it is cut and bagged while you are on your way.
          </p>
        </>
      ),
    },
    {
      n: 4,
      content: (
        <>
          <p className="hero__line">Choose it. Send it.</p>
          <p className="hero__sub">Pick your bags, build the order, send it straight to the shop on WhatsApp.</p>
        </>
      ),
    },
  ];

  return (
    <section className="hero" id="hero" data-hero="" aria-labelledby="hero-statement" ref={heroRef}>
      <div className="hero__stage">
        <div className="hero__media">
          <img
            id="reel-img"
            ref={layerARef}
            className="hero__reel is-front"
            src="/assets/reel/frame-001.webp"
            alt=""
            width="1280"
            height="720"
            decoding="async"
            fetchPriority="high"
            data-reel-layer=""
          />
          <img
            ref={layerBRef}
            className="hero__reel"
            src="/assets/reel/frame-001.webp"
            alt=""
            width="1280"
            height="720"
            decoding="async"
            aria-hidden="true"
            data-reel-layer=""
          />
        </div>

        <div className="hero__beats">
          {beats.map(({ n, content }) => (
            <div className="hero__beat" data-beat={n} data-active={beat === n ? "" : undefined} key={n}>
              {content}
            </div>
          ))}
        </div>

        <div className="hero__progress" aria-hidden="true">
          <span data-reel-bar="" ref={barRef} />
        </div>
        <a className="button button--frost hero__cta" href={`https://wa.me/${SHOP.whatsappDigits}`} rel="noopener">
          Order on WhatsApp
        </a>
      </div>
    </section>
  );
}
