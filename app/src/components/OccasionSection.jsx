import React from "react";

const OCCASIONS = [
  {
    title: "Home",
    body: "Keep your drinks and food fresh.",
    icon: "🏠",
  },
  {
    title: "Parties & Events",
    body: "Make every celebration cooler.",
    icon: "🎉",
  },
  {
    title: "Businesses",
    body: "Fuel your customers and operations.",
    icon: "🏢",
  },
  {
    title: "Bars & Restaurants",
    body: "Serve the perfect drink, every time.",
    icon: "🍸",
  },
  {
    title: "Outdoor Activities",
    body: "Stay cool, wherever you go.",
    icon: "🏕️",
  },
];

export default function OccasionSection() {
  return (
    <section className="section section--ink occasion" id="occasions" aria-labelledby="occasions-title">
      <div className="shell section-head">
        <p className="eyebrow js-reveal">PERFECT FOR</p>
        <h2 className="js-reveal" id="occasions-title">EVERY OCCASION</h2>
      </div>
      <div className="occasion-grid">
        {OCCASIONS.map((item, i) => (
          <article key={i} className="occasion-card js-reveal">
            <div className="occasion-icon">{item.icon}</div>
            <h3 className="occasion-title">{item.title}</h3>
            <p className="occasion-body">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
