/* The Ice Hub — scroll motion layer.
 *
 * Two effects, both transform/opacity only and both reduced-motion aware:
 *   1. parallax bands: [data-parallax="0.15"] with a .parallax__bg child
 *   2. count-up figures: [data-countup="30"] with optional prefix/suffix
 *
 * No library, no layout thrash on every frame: one rAF pass reads the band
 * rects, writes transforms, and stops when nothing is on screen.
 */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const bands = [...document.querySelectorAll("[data-parallax]")];
const counters = [...document.querySelectorAll("[data-countup]")];

let ticking = false;

function paint() {
  ticking = false;
  if (reduced.matches) return;

  const vh = window.innerHeight || 1;

  for (const band of bands) {
    const bg = band.querySelector(".parallax__bg");
    if (!bg) continue;

    const rect = band.getBoundingClientRect();
    if (rect.bottom < -vh || rect.top > vh * 2) continue;

    const depth = Number(band.dataset.parallax) || 0.15;
    const centre = rect.top + rect.height / 2 - vh / 2;
    const y = (centre / vh) * depth * vh;

    bg.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(1.12)`;
  }
}

function queue() {
  if (ticking || reduced.matches) return;
  ticking = true;
  requestAnimationFrame(paint);
}

function settle() {
  for (const band of bands) {
    const bg = band.querySelector(".parallax__bg");
    if (bg) bg.style.transform = "none";
  }
}

function countUp(el) {
  const target = Number(el.dataset.countup);
  if (!Number.isFinite(target)) return;

  const prefix = el.dataset.prefix ?? "";
  const suffix = el.dataset.suffix ?? "";

  if (reduced.matches) {
    el.textContent = `${prefix}${target}${suffix}`;
    return;
  }

  const start = performance.now();
  const duration = 1100;

  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) ** 3;
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

if (counters.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.45 },
  );

  for (const el of counters) observer.observe(el);
} else {
  for (const el of counters) {
    el.textContent = `${el.dataset.prefix ?? ""}${el.dataset.countup}${el.dataset.suffix ?? ""}`;
  }
}

if (bands.length) {
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue, { passive: true });
  reduced.addEventListener?.("change", (event) => {
    if (event.matches) settle();
    else queue();
  });

  if (reduced.matches) settle();
  else queue();
}
