/* The Ice Hub — header and section chrome.
 * Replaces the parts of the old motion.js that still applied. Intersection
 * observers, not scroll maths: no per-frame layout reads.
 */

const header = document.querySelector("[data-header]");
const hero = document.querySelector("[data-hero]");
const navLinks = [...document.querySelectorAll('.header__nav a[href^="#"]')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (header && hero && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => header.toggleAttribute("data-scrolled", !entry.isIntersecting),
    { rootMargin: "-64px 0px 0px 0px" },
  ).observe(hero);
}

if ("IntersectionObserver" in window && sections.length) {
  const visible = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (entry.isIntersecting) visible.add(id);
        else visible.delete(id);
      }

      // With several sections visible at once (short viewports, tall
      // sections), mark only the topmost so exactly one link is current.
      const current = sections.find((section) => visible.has(section.id));
      for (const link of navLinks) {
        if (link.getAttribute("href") === `#${current?.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );

  for (const section of sections) observer.observe(section);
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());