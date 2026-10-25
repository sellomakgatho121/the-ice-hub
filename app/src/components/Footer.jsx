import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <div className="footer-brand">
          <div className="footer-wordmark">THE ICE HUB</div>
          <p className="footer-dev">
            Responsive storefront prototype · Contact and product details pending confirmation
          </p>
        </div>
        <div className="footer-links">
          <a href="#hero">Home</a>
          <a href="#about">About</a>
          <a href="#products">Products</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}
