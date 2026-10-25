import React from "react";
import HeroProduct from "./HeroProduct.jsx";

const BENEFITS = [
  { label: "Long lasting cooling", icon: "❄️" },
  { label: "Pure & clean ice", icon: "✨" },
  { label: "Food grade bags", icon: "🛡️" },
  { label: "Perfect for any occasion", icon: "🎉" },
];

export default function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-statement">
      <div className="hero__left">
        <p className="hero__eyebrow">PURE ICE. REAL FRESHNESS.</p>
        <h1 className="hero__statement" id="hero-statement">
          THE ICE HUB
        </h1>
        <h2 className="hero__category">ICE CUBE BAGS</h2>
        <p className="hero__sub">
          Crystal clear. Fresh. Reliable.<br />
          Our ice cube bags are designed for homes, events, businesses and every moment that needs a little more chill.
        </p>
        <div className="hero__cta-group">
          <a href="#contact" className="button">Order Now</a>
          <a href="#products" className="button button--outline">View Products</a>
        </div>
        <p className="scroll-cue">SCROLL TO EXPLORE</p>
      </div>

      <div className="hero__right">
        <HeroProduct />
      </div>

      <aside className="benefit-panel" aria-label="Product benefits">
        <div className="benefit-label">WHY ICE CUBE BAGS</div>
        {BENEFITS.map((b, i) => (
          <div key={i} className="benefit-item">
            <span className="benefit-icon">{b.icon}</span>
            <div className="benefit-text">{b.label}</div>
          </div>
        ))}
      </aside>
    </section>
  );
}
