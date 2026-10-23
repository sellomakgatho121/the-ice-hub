/* The Ice Hub — hero reel scrub.
 *
 * Two stacked <img> layers crossfade between frames. A single layer with a
 * swapped `src` produces one hard snap per frame change, which reads as
 * choppy no matter how the scroll handler is tuned; dissolving the two layers
 * is what actually removes the stutter. `img.decode()` guarantees a frame is
 * rasterised before it is faded in, so a frame can never paint late or flash.
 */

const TOTAL = 30;
const PAD = 3;
const FRAME = (n) => `assets/reel/frame-${String(n).padStart(PAD, "0")}.webp`;

/* Beat frame ranges, mapped to the animation rather than to arithmetic.
 *
 * SINGLE CLIP. The owner chose video 1 alone at its native 1280x720 over the
 * two-clip merge, so there is no seam anywhere in this reel: every one of the
 * 29 transitions crossfades. Source is 8s / 192 native frames at 24fps — the
 * bag holds still, tilts, bursts at ~3.0s, then tumbles.
 *
 *   1-8   source  1-47    0.0-1.9s  bag at rest, hero statement
 *   9-11  source 54-72    2.2-3.0s  the tilt
 *   12-15 source 79-93    3.2-3.8s  the burst
 *   16-30 source 100-192  4.1-7.9s  tumble, handing off to the Counter
 *
 * Density, not frame count, governs perceived smoothness:
 * px/frame = (heroVh - 100)/100 * viewportHeight / 30. At 150svh that is
 * ~15 px/frame, the same density the previous 48-frame 360p reel had at
 * 180svh. The shorter runway is what buys the pixels-per-frame; dropping to 30
 * frames cost nothing provided the hero came down with it.
 */
const BEATS = [
  [1, 8],
  [9, 11],
  [12, 15],
  [16, 30],
];

/* No cut to handle — this reel is one continuous clip. Kept at 0 so that
   restoring a multi-clip reel is a one-line change; see extract-video1-720p.sh
   and the superseded incoming/extract-reel-frames.sh. */
const CUT_AFTER = 0;

const hero = document.querySelector("[data-hero]");
const layers = [...document.querySelectorAll("[data-reel-layer]")];
const media = layers[0]?.parentElement;
const bar = document.querySelector("[data-reel-bar]");
const indexLabel = document.querySelector("[data-frame-index]");
const totalLabel = document.querySelector("[data-frame-total]");
const beatNodes = [...document.querySelectorAll("[data-beat]")];

const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const saveData = navigator.connection?.saveData === true;
const slowConnection = /(^|-)2g$/.test(navigator.connection?.effectiveType ?? "");

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const cache = new Map();
let front = 0;
let lastIndex = 1;
let lastBeat = 0;
let token = 0;
let ticking = false;
let disposed = false;

function warm(n) {
  if (cache.has(n)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = FRAME(n);
  cache.set(n, img);
}

function paintBeat(beat) {
  if (beat === lastBeat) return;
  lastBeat = beat;
  for (const node of beatNodes) {
    if (Number(node.dataset.beat) === beat) node.setAttribute("data-active", "");
    else node.removeAttribute("data-active");
  }
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

  if (mine !== token || disposed || reducedQuery.matches) return;

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
  if (disposed || reducedQuery.matches || !hero) return;

  const rect = hero.getBoundingClientRect();
  const runway = Math.max(hero.offsetHeight - window.innerHeight, 1);
  const t = clamp(-rect.top / runway, 0, 1);
  const idx = clamp(1 + Math.floor(t * TOTAL), 1, TOTAL);

  paintBeat(BEATS.findIndex(([a, b]) => idx >= a && idx <= b) + 1);
  if (bar) bar.style.transform = `scaleX(${t.toFixed(4)})`;

  if (idx === lastIndex) return;
  const hard = lastIndex === CUT_AFTER;
  lastIndex = idx;
  if (indexLabel) indexLabel.textContent = String(idx).padStart(PAD, "0");

  show(idx, hard);
}

function queuePaint() {
  if (ticking || disposed) return;
  ticking = true;
  requestAnimationFrame(paint);
}

async function warmAll() {
  for (let n = 1; n <= TOTAL; n += 4) {
    for (let k = n; k < Math.min(n + 4, TOTAL + 1); k += 1) {
      warm(k);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

function setReducedState(reduced) {
  if (reduced) {
    token += 1;
    layers.forEach((layer, i) => {
      layer.src = FRAME(1);
      layer.classList.toggle("is-front", i === 0);
    });
    front = 0;
    if (indexLabel) indexLabel.textContent = "01";
    if (bar) bar.style.transform = "scaleX(0)";
    paintBeat(1);
    document.body.dataset.state = "still";
    return;
  }
  document.body.dataset.state = "ready";
  queuePaint();
}

// Metered connections are common in Tembisa: warm sparsely, never the full run.
/* The sparse list must stay inside [1, TOTAL]: 34 and 48 were the 48-frame
   reel's anchors and fetched files that no longer belong to the set. */
if (!saveData && !slowConnection) {
  [1, 2, 8, 15, 22, 26].forEach(warm);
  if ("requestIdleCallback" in window) requestIdleCallback(() => warmAll(), { timeout: 2000 });
  else setTimeout(() => warmAll(), 500);
} else {
  [1, TOTAL].forEach(warm);
}

window.addEventListener("scroll", queuePaint, { passive: true });
window.addEventListener("resize", queuePaint, { passive: true });
reducedQuery.addEventListener?.("change", (event) => setReducedState(event.matches));

if ("IntersectionObserver" in window && hero) {
  new IntersectionObserver(
    (entries) => {
      disposed = !entries[0].isIntersecting;
      if (disposed) token += 1;
      else queuePaint();
    },
    { rootMargin: "100% 0px" },
  ).observe(hero);
}

setReducedState(reducedQuery.matches);

/* Derived from TOTAL, not hardcoded: the hero still read "01 -> 20" after the
   reel grew to 48 frames, because the number had been written into the markup. */
if (totalLabel) totalLabel.textContent = String(TOTAL);