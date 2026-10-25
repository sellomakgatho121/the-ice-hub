import React from "react";
import { SHOP } from "../lib/config.js";
import { useHeaderState, useSectionNav } from "../hooks/useHeaderState.js";
import { useShopStatus } from "../hooks/useShopStatus.js";

const waUrl = `https://wa.me/${SHOP.whatsappDigits}`;

const SECTIONS = [
  { id: "products", label: "Products" },
  { id: "delivery", label: "Delivery" },
  { id: "location", label: "Location" },
  { id: "hours", label: "Hours" },
];

/* Clean sticky header: logo left, section links right, WhatsApp CTA far right.
   Status dot shows open/closed. */
export default function Header() {
  const currentId = useSectionNav();
  const status = useShopStatus();

  return (
    <header className="header" data-header="">
      <div className="shell header__inner">
        <a className="wordmark" href="#main">
          Zero Degrees
        </a>
        <nav className="header__nav" aria-label="Sections">
          {SECTIONS.map(({ id, label }) => (
            <a href={`#${id}`} key={id} aria-current={currentId === id ? "location" : undefined}>
              {label}
            </a>
          ))}
          <a className="button" href={waUrl} rel="noopener">
            WhatsApp us
          </a>
        </nav>
      </div>
    </header>
  );
}
