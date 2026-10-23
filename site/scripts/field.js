/* The Ice Hub — drifting field.
 *
 * Translates the ghost word/icon track on scroll so real content moves behind
 * the glass surfaces. That content is what gives the glass something to
 * refract; without it the glass reads as a plain translucent panel.
 *
 * Transform only, rAF-coalesced, torn down when off-screen: this must never
 * be the reason a frame is dropped.
 */

const track = document.querySelector("[data-field-track]");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

/* Slower than scroll, so the field drifts rather than tracking. 0.18 keeps it
   legible through the blur without sliding out from behind the glass. */
const DRIFT = 0.18;

let ticking = false;
let running = false;
let observer = null;

function apply() {
  ticking = false;
  if (!running || !track) return;

  const span = track.offsetHeight || 1;
  const runway = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
  const travelled = (scrollY / runway) * span * DRIFT;

  track.style.setProperty("--field-y", `${travelled.toFixed(1)}px`);
}

function queue() {
  if (ticking || !running) return;
  ticking = true;
  requestAnimationFrame(apply);
}

function start() {
  running = true;
  queue();
}

function stop() {
  running = false;
  ticking = false;
}

if (track && !reduced.matches) {
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue, { passive: true });
  reduced.addEventListener?.("change", (event) => (event.matches ? stop() : start()));
  start();

  // Nothing to animate once the field has scrolled clear of the viewport.
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "25% 0px" },
    );
    observer.observe(track);
  }
}

/* Environment light: every glass silhouette shares one source, the pointer,
   fed through --spec-x/--spec-y on the document. Percent units keep the
   glints responsive. Pointer-only (there is nothing to track on touch) and
   skipped under reduced motion: the glint freezing per position is fine,
   chasing it is motion. */
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
if (finePointer.matches && !reduced.matches) {
  let lightQueued = false;
  window.addEventListener(
    "pointermove",
    (event) => {
      if (lightQueued) return;
      lightQueued = true;
      requestAnimationFrame(() => {
        lightQueued = false;
        const root = document.documentElement.style;
        root.setProperty("--spec-x", `${((event.clientX / innerWidth) * 100).toFixed(2)}%`);
        root.setProperty("--spec-y", `${((event.clientY / innerHeight) * 100).toFixed(2)}%`);
      });
    },
    { passive: true },
  );
}