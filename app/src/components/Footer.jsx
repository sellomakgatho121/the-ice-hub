import React, { useEffect, useState } from "react";
import { SHOP } from "../lib/config.js";

/* Clean footer with shop details and WhatsApp link. */
export default function Footer() {
  const [year, setYear] = useState(2026);

  useEffect(() => setYear(new Date().getFullYear()), []);

  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <div>
          <p>The Ice Hub · Tembisa</p>
          <p>9605 Winnie Mandela Zone 4, Raymond Mhlaba Street, Tembisa 1632, South Africa</p>
        </div>
        <div>
          <p>
            <a href={`tel:+${SHOP.whatsappDigits}`}>{SHOP.whatsappDisplay}</a> ·{" "}
            <a href={`https://wa.me/${SHOP.whatsappDigits}`} rel="noopener">
              Order on WhatsApp
            </a>
          </p>
        </div>
        <div>
          <p>© {year} Zero Degrees. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
