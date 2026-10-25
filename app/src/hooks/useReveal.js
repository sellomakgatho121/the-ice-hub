import { useEffect } from "react";

/* The Ice Hub — scroll reveal (ported from site/scripts/reveal.js).
 *
 * Pro-Max subtle tier: section heads and cards rise 12px and fade in over
 * 380ms the first time they enter the viewport. Elements already on screen
 * reveal immediately, so the first paint never waits on a scroll. Hiding is
 * scoped under the .js root class added in main.jsx — a scriptless visit
 * renders fully.
 *
 * IO plays once per element; the classes hand off to a timeout so the
 * elements' own hover transitions take over cleanly after the reveal.
 * Reduced motion (or a missing IO) reveals everything at once.
 */
const HANDOFF_MS = 700; // later than the longest reveal (120ms delay + 380ms)

export function useReveal() {
  useEffect(() => {
    const items = [...document.querySelectorAll(".js-reveal")];
    if (items.length === 0) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const revealAll = () => {
      for (const el of items) el.classList.add("is-in");
    };

    if (reduced.matches || !("IntersectionObserver" in window)) {
      revealAll();
      return undefined;
    }

    const pending = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          el.classList.add("is-in");
          pending.set(
            el,
            setTimeout(() => {
              el.classList.remove("js-reveal", "is-in");
              pending.delete(el);
            }, HANDOFF_MS),
          );
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    for (const el of items) observer.observe(el);

    const onReducedChange = (event) => {
      if (!event.matches) return;
      observer.disconnect();
      for (const timeout of pending.values()) clearTimeout(timeout);
      pending.clear();
      revealAll();
    };
    reduced.addEventListener?.("change", onReducedChange);

    return () => {
      observer.disconnect();
      for (const timeout of pending.values()) clearTimeout(timeout);
      pending.clear();
      reduced.removeEventListener?.("change", onReducedChange);
    };
  }, []);
}
