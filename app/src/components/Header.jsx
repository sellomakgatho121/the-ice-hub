import React from "react";
import { SHOP } from "../lib/config.js";
import { useHeaderState, useSectionNav } from "../hooks/useHeaderState.js";
import { useShopStatus } from "../hooks/useShopStatus.js";

const waUrl = `https://wa.me/${SHOP.whatsappDigits}`;

const SECTIONS = [
  { id: "products", label: "Products" },
  { id: "delivery", label: "Delivery" },
  { id: "visit", label: "Visit" },
];

/* Transparent over the hero, solid once the hero leaves (data-scrolled, set
 * by the header-state IO). Nav links carry exactly one aria-current="location"
 * on the topmost visible section. Status starts deterministic ("Checking
 * hours") and goes live after mount. */
export default function Header() {
  const scrolled = useHeaderState();
  const currentId = useSectionNav();
  const status = useShopStatus();

  return (
    <header className="header" data-header="" data-scrolled={scrolled ? "" : undefined}>
      <div className="shell header__inner">
        <a className="wordmark" href="#main">
          The Ice Hub
        </a>
        <nav className="header__nav" aria-label="Sections">
          <p className={`status${status.state === "open" ? " is-open" : ""}`}>
            <span className="status__dot" aria-hidden="true" />
            <span data-open-status={status.state === "checking" ? undefined : status.state}>{status.label}</span>
          </p>
          {SECTIONS.map(({ id, label }) => (
            <a href={`#${id}`} key={id} aria-current={currentId === id ? "location" : undefined}>
              {label}
            </a>
          ))}
          <a className="cta" href={waUrl} rel="noopener">
            WhatsApp us
          </a>
        </nav>
      </div>
    </header>
  );
}
