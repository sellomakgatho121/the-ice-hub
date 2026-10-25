import React from "react";
import Icon from "./Icon.jsx";

export default function AboutSection() {
  return (
    <section className="section section--pale about" id="about" aria-labelledby="about-title">
      <div className="shell">
        <div className="section-head">
          <p className="eyebrow">ABOUT US</p>
          <h2 className="js-reveal" id="about-title">MORE THAN JUST ICE</h2>
          <p className="js-reveal" style={{ fontSize: "1.25rem", color: "#05BAF7", fontWeight: 700, marginTop: "var(--s-2)" }}>
            WE DELIVER COOL CONFIDENCE.
          </p>
        </div>
        <div className="about-grid">
          <div className="about-copy js-reveal">
            <p className="about-body">
              At THE ICE HUB, we bring ice cube bags to everyday moments, gatherings and businesses. This storefront
              concept is built around clarity, freshness and a straightforward way to get in touch.
            </p>
            <div className="about-labels">
              <span className="about-label">Product focused</span>
              <span className="about-label">Clear, simple experience</span>
              <span className="about-label">Supply details to confirm</span>
            </div>
            <a href="#contact" className="button button--outline" style={{ marginTop: "var(--s-5)" }}>
              Learn More
            </a>
          </div>
          <div className="about-product js-reveal">
            <div className="about-product-card">
              <div className="about-product-visual">
                <svg viewBox="0 0 200 260" width="100%" height="100%" role="img" aria-label="Ice cube bag">
                  <defs>
                    <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#F3F8FF", stopOpacity: 0.9 }} />
                      <stop offset="50%" style={{ stopColor: "#65D7FF", stopOpacity: 0.5 }} />
                      <stop offset="100%" style={{ stopColor: "#05BAF7", stopOpacity: 0.3 }} />
                    </linearGradient>
                    <filter id="bagShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation={8} />
                      <feOffset dx={0} dy={12} result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope={0.4} />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Bag body */}
                  <path
                    d="M 60,40 Q 60,10 100,10 Q 140,10 140,40 Q 140,120 100,140 Q 60,120 60,40 Z"
                    fill="url(#bagGrad)"
                    stroke="rgba(5,186,247,0.4)"
                    strokeWidth="2"
                    filter="url(#bagShadow)"
                  />
                  {/* Neck */}
                  <rect x="80" y="0" width="40" height="20" fill="#F3F8FF" stroke="rgba(5,186,247,0.5)" strokeWidth="1" />
                  {/* Ice cubes */}
                  <rect x="75" y="30" width="14" height="14" rx="3" fill="#E0F7FF" opacity="0.9" />
                  <rect x="111" y="45" width="16" height="16" rx="3" fill="#F3F8FF" opacity="0.85" />
                  <rect x="62" y="55" width="12" height="12" rx="2" fill="#65D7FF" opacity="0.7" />
                  <rect x="118" y="60" width="10" height="10" rx="2" fill="#FFFFFF" opacity="0.8" />
                  {/* Label */}
                  <rect x="68" y="95" width="64" height="32" rx="6" fill="#1A2E3C" />
                  <text x="100" y="108" textAnchor="middle" fill="#F3F8FF" fontFamily="Bricolage Grotesque, sans-serif" fontSize="11" fontWeight="bold">THE ICE HUB</text>
                  <text x="100" y="119" textAnchor="middle" fill="#05BAF7" fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing="1">ICE CUBE BAG</text>
                  <text x="100" y="127" textAnchor="middle" fill="#B3C5D7" fontFamily="JetBrains Mono, monospace" fontSize="6" letterSpacing="0.5">PURE · CLEAN · FRESH</text>
                </svg>
              </div>
              <p className="about-product-caption">THE ICE HUB — ICE CUBE BAG</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
