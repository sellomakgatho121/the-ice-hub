import React from "react";

export default function ContactSection() {
  return (
    <section className="section section--ink contact" id="contact" aria-labelledby="contact-title">
      <div className="shell">
        <div className="contact-inner js-reveal">
          <p className="eyebrow">STAY COOL · STAY FRESH · STAY CONNECTED</p>
          <h2 className="js-reveal" id="contact-title">LET'S TALK ICE.</h2>
          <p className="contact-sub js-reveal">
            Contact details and ordering channel can be added once confirmed.
          </p>
          <a href="#contact-form" className="button" style={{ marginTop: "var(--s-6)", width: "100%", maxWidth: 300 }}>
            Contact Us
          </a>
        </div>
        <div className="contact-placeholder js-reveal" style={{ marginTop: "var(--s-8)" }}>
          <div className="placeholder-card">
            <p className="placeholder-label">ENQUIRY</p>
            <p className="placeholder-body">
              Contact and product details are pending confirmation. Please check back soon, or reach out through your
              usual channel to place an order.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
