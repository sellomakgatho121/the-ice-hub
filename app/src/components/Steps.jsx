import React from "react";

/* Three-step ordering process — simple, clear, no fluff. */
export default function Steps() {
  const steps = [
    {
      num: "01",
      title: "Pick your bags",
      body: "Choose 2 kg or 3 kg ice-cube bags, or a 30 kg block. Thirty or more bags drop to bulk price.",
    },
    {
      num: "02",
      "title": "Message us",
      body: "Send your order on WhatsApp. Confirm availability and the final total with the shop.",
    },
    {
      num: "03",
      title: "Get it delivered",
      body: "Free delivery around Tembisa. Your ice is cut and bagged before you arrive.",
    },
  ];

  return (
    <section className="section section--ink steps js-reveal" aria-labelledby="steps-title">
      <div className="shell">
        <p className="eyebrow">How it works</p>
        <h2 id="steps-title">Order in three steps</h2>
        <div className="steps">
          {steps.map((step) => (
            <div key={step.num} className="step js-reveal">
              <p className="step__num">{step.num}</p>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__body">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
