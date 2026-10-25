import React, { useEffect, useState } from "react";
import { SHOP } from "../lib/config.js";

/* Fixed bottom CTA bar, visible under 768px via CSS only (thumb-zone rule).
 * The href starts as the bare wa.me link and carries the built order message
 * once the summary is non-empty (order.href from App). */
export default function MobileBar({ href = `https://wa.me/${SHOP.whatsappDigits}` }) {
  return (
    <div className="mobile-bar">
      <a className="cta" href={href} rel="noopener" data-summary-cta="">
        Order on WhatsApp
      </a>
    </div>
  );
}
