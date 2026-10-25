import { useEffect, useRef } from "react";

/* The Ice Hub — parallax band (ported from site/scripts/parallax.js).
 * Transform only, reduced-motion aware, no layout thrash: one rAF pass reads
 * the band rect and writes the background transform, and stops when nothing
 * is on screen or reduced motion is on. */
export function useParallax() {
  const bandRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const band = bandRef.current;
    const bg = bgRef.current;
    if (!band || !bg) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;
    let rafId = 0;

    function paint() {
      ticking = false;
      if (reduced.matches) return;

      const vh = window.innerHeight || 1;
      const rect = band.getBoundingClientRect();
      if (rect.bottom < -vh || rect.top > vh * 2) return;

      const depth = Number(band.dataset.parallax) || 0.18;
      const centre = rect.top + rect.height / 2 - vh / 2;
      const y = (centre / vh) * depth * vh;

      bg.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(1.12)`;
    }

    function queue() {
      if (ticking || reduced.matches) return;
      ticking = true;
      rafId = requestAnimationFrame(paint);
    }

    function settle() {
      bg.style.transform = "none";
    }

    const onReducedChange = (event) => {
      if (event.matches) settle();
      else queue();
    };

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    reduced.addEventListener?.("change", onReducedChange);

    if (reduced.matches) settle();
    else queue();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      reduced.removeEventListener?.("change", onReducedChange);
    };
  }, []);

  return { bandRef, bgRef };
}
