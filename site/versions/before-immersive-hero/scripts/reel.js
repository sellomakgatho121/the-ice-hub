const TOTAL = 40;
const PAD = 3;
const FRAME = (n) => `assets/reel/ezgif-frame-${String(n).padStart(PAD, "0")}.jpg`;
const reel = document.getElementById("top");
const img = document.getElementById("reel-img");
const bar = document.querySelector("[data-reel-bar]");
const indexLabel = document.querySelector("[data-frame-index]");
const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const cache = new Map();
let lastIndex = -1;
let ticking = false;

function preload(n) {
  if (cache.has(n)) return cache.get(n);
  const frame = new Image();
  frame.decoding = "async";
  frame.src = FRAME(n);
  cache.set(n, frame);
  return frame;
}

[1, 8, 16, 24, 32, 40].forEach(preload);
function loaded(frame) {
  if (frame.complete) return Promise.resolve();
  return new Promise((resolve) => {
    frame.addEventListener("load", resolve, { once: true });
    frame.addEventListener("error", resolve, { once: true });
  });
}
async function warmCache() {
  for (let start = 1; start <= TOTAL; start += 4) {
    const batch = [];
    for (let n = start; n < Math.min(start + 4, TOTAL + 1); n += 1) batch.push(loaded(preload(n)));
    await Promise.all(batch);
  }
}
if ("requestIdleCallback" in window) requestIdleCallback(() => warmCache(), { timeout: 1200 });
else setTimeout(() => warmCache(), 300);

function progress() {
  if (!reel) return 0;
  const rect = reel.getBoundingClientRect();
  const runway = Math.max(reel.offsetHeight - window.innerHeight, 1);
  return Math.min(1, Math.max(0, -rect.top / runway));
}

function paint() {
  ticking = false;
  if (reducedQuery.matches) return;
  const t = progress();
  const idx = Math.min(TOTAL, Math.max(1, Math.round(1 + t * (TOTAL - 1))));
  if (idx === lastIndex) return;
  lastIndex = idx;
  const next = preload(idx);
  const apply = () => {
    if (idx !== lastIndex || reducedQuery.matches) return;
    img.src = FRAME(idx);
    indexLabel.textContent = String(idx).padStart(PAD, "0");
    bar.style.transform = `scaleX(${t})`;
    reel.style.setProperty("--hero-p", t.toFixed(4));
  };
  if (next.complete) apply();
  else next.addEventListener("load", apply, { once: true });
}

function queuePaint() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(paint);
}

function setReducedState(reduced) {
  if (reduced) {
    img.src = FRAME(21);
    indexLabel.textContent = "021";
    bar.style.transform = "scaleX(.52)";
    reel.style.setProperty("--hero-p", ".52");
    document.body.dataset.state = "still";
  } else {
    document.body.dataset.state = "ready";
    queuePaint();
  }
}

window.addEventListener("scroll", queuePaint, { passive: true });
window.addEventListener("resize", queuePaint, { passive: true });
reducedQuery.addEventListener?.("change", (event) => setReducedState(event.matches));
setReducedState(reducedQuery.matches);
