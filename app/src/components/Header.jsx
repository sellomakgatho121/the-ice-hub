import React, { useState, useEffect } from "react";
import { useReveal } from "../hooks/useReveal.js";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Why Us", href: "#occasions" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="shell header__inner">
          <a className="wordmark" href="#hero">THE ICE HUB</a>
          <nav className="header__nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={link.label === "Home" ? "active" : ""}>
                {link.label}
              </a>
            ))}
            <a href="#contact" className="button button--outline">Get in Touch</a>
          </nav>
          <button className="menu-toggle" onClick={toggleMenu} aria-expanded={isOpen} aria-label="Menu">
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <button className="menu-close" onClick={toggleMenu} aria-label="Close menu">✕</button>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} onClick={toggleMenu} className="mobile-link">
                {link.label}
              </a>
            ))}
            <a href="#contact" className="button" onClick={toggleMenu}>Get in Touch</a>
          </div>
        </div>
      )}
    </>
  );
}
