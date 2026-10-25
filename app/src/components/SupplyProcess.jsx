import React from "react";

const STEPS = [
  { num: "01", title: "ICE PRODUCTION", body: "Ice production details to be confirmed." },
  { num: "02", title: "BAGGING", body: "Packaging and bag sizes to be confirmed." },
  { num: "03", title: "SUPPLY", body: "Collection and delivery options to be confirmed." },
];

export default function SupplyProcess() {
  return (
    <section className="section section--ink supply" id="supply" aria-labelledby="supply-title">
      <div className="shell">
        <div className="section-head">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2 className="js-reveal" id="supply-title">FROM ICE TO YOU</h2>
          <p className="js-reveal" style={{ fontSize: "var(--text-sm)", color: "var(--ice-300)", maxWidth: 420 }}>
            A simple path from product enquiry to supply.
          </p>
        </div>
        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <article key={step.num} className="step js-reveal">
              <div className="step-number">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-body">{step.body}</p>
              {i < STEPS.length - 1 && <span className="step-arrow">▸</span>}
            </article>
          ))}
        </div>
        <a href="#contact" className="button" style={{ marginTop: "var(--s-8)", display: "inline-flex" }}>
          Ask About Supply
        </a>
      </div>
    </section>
  );
}
