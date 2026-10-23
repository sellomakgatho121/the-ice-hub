/* The Ice Hub — scroll reveal.
 *
 * Pro-Max subtle tier: section heads and cards rise 12px and fade in over
 * 380ms the first time they enter the viewport. Elements already on screen
 * reveal immediately, so the first paint never waits on a scroll. Hiding is
 * scoped under the .js root class the head bootstrap adds — a scriptless
 * visit renders fully.
 *
 * IO played once per element; the classes hand off to a timeout so the
 * elements' own hover transitions take over cleanly after the reveal.
 * Reduced motion (or a missing IO) reveals everything at once.
 */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const items = document.querySelectorAll(".js-reveal");

if (reduced.matches || !("IntersectionObserver" in window)) {
  for (const el of items) el.classList.add("is-in");
} else {
  const HANDOFF_MS = 700; // later than the longest reveal (120ms delay + 380ms)
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        setTimeout(() => {
          entry.target.classList.remove("js-reveal", "is-in");
        }, HANDOFF_MS);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  for (const el of items) observer.observe(el);
}
