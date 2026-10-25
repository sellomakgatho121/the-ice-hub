import React from "react";
import { SHOP } from "../lib/config.js";

/* Editorial hero: product photography left, bold typography right.
   The front-facing product shot is the undisputed star. */
export default function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-statement">
      <div className="hero__image">
        <img
          src="/assets/products/product-front.jpg"
          alt="2 kg ice-cube bag — front-facing product shot"
          width="923"
          height="1152"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      <div className="hero__content">
        <p className="hero__eyebrow">Ice · Tembisa · Since 2026</p>
        <h1 className="hero__statement" id="hero-statement">
          Pure ice. <span className="hero__accent">Zero fuss.</span>
        </h1>
        <p className="hero__sub">
          Crystal-clear 2 kg and 3 kg ice-cube bags, 30 kg blocks, free delivery around Tembisa.
          Order straight to the shop on WhatsApp.
        </p>
        <div className="hero__price">
          R<span>17</span> per 2 kg bag
        </div>
        <div className="hero__cta-group">
          <a
            className="button"
            href={`https://wa.me/${SHOP.whatsappDigits}?text=Hello%20The%20Ice%20Hub,%20I%20would%20like%20to%20order%20ice.%20Please%20send%20prices%20and%20availability.`}
            rel="noopener"
          >
            Order on WhatsApp
          </a>
          <a className="button button--outline" href="#products" rel="noopener">
            View products
          </a>
        </div>
      </div>
    </section>
  );
}
