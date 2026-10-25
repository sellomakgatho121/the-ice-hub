import React, { useEffect, useState } from "react";
import { SHOP } from "../lib/config.js";

/* Year is prerendered deterministically ("2026") for hydration safety; the
 * live clock swap happens in a mount effect. */
export default function Footer() {
  const [year, setYear] = useState(2026);

  useEffect(() => setYear(new Date().getFullYear()), []);

  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <p>The Ice Hub · Tembisa</p>
        <p>
          <a href={`tel:+${SHOP.whatsappDigits}`}>{SHOP.whatsappDisplay}</a> ·{" "}
          <a href={`https://wa.me/${SHOP.whatsappDigits}`} rel="noopener">
            WhatsApp
          </a>
        </p>
        <p>© {year}</p>
      </div>
    </footer>
  );
}
