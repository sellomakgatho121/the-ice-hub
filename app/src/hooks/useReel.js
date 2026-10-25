import { useEffect, useRef, useState } from "react";

/* The Ice Hub — hero reel scrub (ported from site/scripts/reel.js).
 *
 * Two stacked <img> layers crossfade between frames. A single layer with a
 * swapped `src` produces one hard snap per frame change, which reads as
 * choppy no matter how the scroll handler is tuned; dissolving the two layers
 * is what actually removes the stutter. `img.decode()` guarantees a frame is
 * rasterised before it is faded in, so a frame can never paint late or flash.
 */
const TOTAL = 30;
const PAD = 3;
const FRAME = (n) => `/assets/reel/frame-${String(n).padStart(PAD, "0")}.webp`;

/* Beat frame ranges, mapped to the animation rather than to arithmetic.
 *
 * SINGLE CLIP. The owner chose video 1 alone at its native 1280x720 over the
 * two-clip merge, so there is no seam anywhere in this reel: every one of the
 * 29 transitions crossfades. Source is 8s / 192 native frames at 24fps — the
 * bag holds still, tilts, bursts at ~3.0s, then tumbles.
 */
const BEATS = [
  [1, 8],
  [9, 11],
  [12, 15],
  [16, 30],
];

/* No cut to handle — this reel is one continuous clip. Kept at 0 so that
   restoring a multi-clip reel is a one-line change. */
const CUT_AFTER = 0;

/* Sparse anchors checked on load; the rest only warms when idle. */
const PRELOAD = [1, 2, 8, 15, 22, 26];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* Runs the scroll scrub for the hero. Beat changes go through React state
 * (only when the beat actually changes); frame swaps, the progress bar and
 * layer crossfades stay imperative DOM writes so scrolling never re-renders.
 * Exposed refs: heroRef (sticky runway), layerRefs (the two <img> layers),
 * barRef (progress hairline). */
export function useReel() {
  const heroRef = useRef(null);
  const layerARef = useRef(null);
  const layerBRef = useRef(null);
  const barRef = useRef(null);
  const [beat, setBeat] = useState(1);

  useEffect(() => {
    const hero = heroRef.current;
    const layers = [layerARef.current, layerBRef.current];
    if (!hero || !layers[0] || !layers[1]) return undefined;

    const media = layers[0].parentElement;
    const bar = barRef.current;
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = navigator.connection?.saveData === true;
    const slowConnection = /(^|-)2g$/.test(navigator.connection?.effectiveType ?? "");

    const cache = new Map();
    let front = 0;
    let lastIndex = 1;
    let lastBeat = 0;
    let token = 0;
    let ticking = false;
    let disposed = false;
    let cancelled = false;
    let rafId = 0;
    let idleHandle = 0;

    function warm(n) {
      if (cache.has(n)) return;
      const img = new Image();
      img.decoding = "async";
      img.src = FRAME(n);
      cache.set(n, img);
    }

    function paintBeat(next) {
      if (next === lastBeat) return;
      lastBeat = next;
      setBeat(next);
    }

    async function show(idx, hard) {
      const mine = ++token;
      const back = layers[1 - front];
      if (!back) return;

      back.src = FRAME(idx);

      if (back.decode) {
        try {
          await back.decode();
        } catch {
          return;
        }
      } else if (!back.complete) {
        await new Promise((resolve) => {
          back.addEventListener("load", resolve, { once: true });
          back.addEventListener("error", resolve, { once: true });
        });
      }
      if (!back.complete || back.naturalWidth === 0) return;

      if (mine !== token || cancelled || reducedQuery.matches) return;

      if (hard && media) {
        media.classList.add("is-hard");
        requestAnimationFrame(() => requestAnimationFrame(() => media.classList.remove("is-hard")));
      }

      layers[front].classList.remove("is-front");
      back.classList.add("is-front");
      front = 1 - front;
    }

    function paint() {
      ticking = false;
      if (disposed || cancelled || reducedQuery.matches || !hero) return;

      const rect = hero.getBoundingClientRect();
      const runway = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const t = clamp(-rect.top / runway, 0, 1);
      const idx = clamp(1 + Math.floor(t * TOTAL), 1, TOTAL);

      paintBeat(BEATS.findIndex(([a, b]) => idx >= a && idx <= b) + 1);
      if (bar) bar.style.transform = `scaleX(${t.toFixed(4)})`;

      if (idx === lastIndex) return;
      const hard = lastIndex === CUT_AFTER;
      lastIndex = idx;
      show(idx, hard);
    }

    function queuePaint() {
      if (ticking || cancelled) return;
      ticking = true;
      rafId = requestAnimationFrame(paint);
    }

    async function warmAll() {
      if (reducedQuery.matches) return;
      for (let n = 1; n <= TOTAL; n += 4) {
        for (let k = n; k < Math.min(n + 4, TOTAL + 1); k += 1) {
          if (cancelled) return;
          warm(k);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    }

    function setReducedState(reduced) {
      if (cancelled) return;
      if (reduced) {
        token += 1;
        layers.forEach((layer, i) => {
          layer.src = FRAME(1);
          layer.classList.toggle("is-front", i === 0);
        });
        front = 0;
        lastIndex = 0;
        if (bar) bar.style.transform = "scaleX(0)";
        paintBeat(1);
        document.body.dataset.state = "still";
        return;
      }
      document.body.dataset.state = "ready";
      queuePaint();
    }

    // Reduced motion never scrubs, so only frame 1 is needed. Metered
    // connections are common in Tembisa: warm sparsely, never the full run.
    if (reducedQuery.matches) {
      warm(1);
    } else if (!saveData && !slowConnection) {
      PRELOAD.forEach(warm);
      if ("requestIdleCallback" in window) {
        idleHandle = requestIdleCallback(() => warmAll(), { timeout: 2000 });
      } else {
        idleHandle = setTimeout(() => warmAll(), 500);
      }
    } else {
      [1, TOTAL].forEach(warm);
    }

    const onScroll = queuePaint;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const onReducedChange = (event) => setReducedState(event.matches);
    reducedQuery.addEventListener?.("change", onReducedChange);

    let observer = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          disposed = !entries[0].isIntersecting;
          if (disposed) token += 1;
          else queuePaint();
        },
        { rootMargin: "100% 0px" },
      );
      observer.observe(hero);
    }

    setReducedState(reducedQuery.matches);

    return () => {
      cancelled = true;
      token += 1;
      cancelAnimationFrame(rafId);
      if (idleHandle) {
        if ("requestIdleCallback" in window) cancelIdleCallback(idleHandle);
        else clearTimeout(idleHandle);
      }
      if (observer) observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reducedQuery.removeEventListener?.("change", onReducedChange);
      delete document.body.dataset.state;
    };
  }, []);

  return { heroRef, layerARef, layerBRef, barRef, beat, total: TOTAL };
}
