import React from "react";
import { SHOP } from "../lib/config.js";

/* Fixed bottom CTA bar on mobile — thumb-zone access to WhatsApp. */
export default function MobileBar({ href = `https://wa.me/${SHOP.whatsappDigits}` }) {
  return (
    <div className="mobile-bar">
      <a className="button" href={href} rel="noopener" data-summary-cta="">
        Order on WhatsApp
      </a>
    </div>
  );
}
