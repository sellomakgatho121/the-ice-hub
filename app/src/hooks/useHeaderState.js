import { useEffect, useState } from "react";

/* The Ice Hub — header chrome state (ported from site/scripts/nav.js).
 * Intersection observers, not scroll maths: no per-frame layout reads. */

/* Header goes solid once the hero has scrolled 120px past the top. */
export function useHeaderState() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "-120px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return scrolled;
}

/* aria-current="location" tracks the section in the vertical band around the
 * viewport midpoint. With several sections visible at once (short viewports,
 * tall sections), mark only the topmost so exactly one link is current. */
export function useSectionNav() {
  const [currentId, setCurrentId] = useState("");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const links = [...document.querySelectorAll('.header__nav a[href^="#"]')];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    if (sections.length === 0) return undefined;

    const visible = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const current = sections.find((section) => visible.has(section.id));
        setCurrentId(current?.id ?? "");
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return currentId;
}
