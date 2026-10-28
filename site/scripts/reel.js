/* The Ice Hub — deterministic scroll-scrubbed hero.
 *
 * Primary path: supplied, seek-optimized MP4.
 * Resilience path: existing crossfaded WebP frames if the MP4 is unavailable.
 * The hero remains useful if either animation path fails or motion is reduced.
 */
const hero = document.querySelector("[data-hero]");
const media = document.querySelector("[data-hero-media]");
const video = document.querySelector("[data-video-reel]");
const bar = document.querySelector("[data-reel-bar]");
const indexLabel = document.querySelector("[data-frame-index]");
const totalLabel = document.querySelector("[data-frame-total]");
const beatNodes = [...document.querySelectorAll("[data-beat]")];
const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const saveData = navigator.connection?.saveData === true;
const slowConnection = /(^|-)2g$/.test(navigator.connection?.effectiveType ?? "");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

let activeMode = "pending";
let disposed = false;
let ticking = false;
let lastBeat = 0;
let lastVideoProgress = -1;
let targetTime = 0;
let seeking = false;
let seekQueued = false;
let frameFallbackStarted = false;

function paintBeat(beat) {
  if (beat === lastBeat) return;
  lastBeat = beat;
  for (const node of beatNodes) {
    if (Number(node.dataset.beat) === beat) node.setAttribute("data-active", "");
    else node.removeAttribute("data-active");
  }
}

function getProgress() {
  if (!hero) return 0;
  const rect = hero.getBoundingClientRect();
  const runway = Math.max(hero.offsetHeight - window.innerHeight, 1);
  return clamp(-rect.top / runway, 0, 1);
}

function paintVideo() {
  ticking = false;
  if (disposed || !hero) return;
  const progress = getProgress();
  const beat = Math.min(4, Math.floor(progress * 4) + 1);
  paintBeat(beat);
  if (bar) bar.style.transform = `scaleX(${progress.toFixed(4)})`;

  if (activeMode === "video" && video && Number.isFinite(video.duration) && video.duration > 0) {
    targetTime = progress * video.duration;
    if (Math.abs(progress - lastVideoProgress) > 0.002) {
      lastVideoProgress = progress;
      queueSeek();
    }
    if (indexLabel) indexLabel.textContent = String(Math.min(4, Math.floor(progress * 4) + 1)).padStart(2, "0");
    if (totalLabel) totalLabel.textContent = "04";
  }
}

function queuePaint() {
  if (ticking || disposed) return;
  ticking = true;
  requestAnimationFrame(paintVideo);
}

function queueSeek() {
  if (!video || activeMode !== "video" || reducedQuery.matches) return;
  if (seeking) {
    seekQueued = true;
    return;
  }
  requestAnimationFrame(() => {
    if (!video || activeMode !== "video" || video.readyState < HTMLMediaElement.HAVE_METADATA) return;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (!duration) return;
    const nextTime = clamp(targetTime, 0, Math.max(0, duration - 0.001));
    if (Math.abs(video.currentTime - nextTime) < 0.035) return;
    seeking = true;
    seekQueued = false;
    try {
      video.currentTime = nextTime;
    } catch {
      seeking = false;
    }
  });
}

function onSeeked() {
  seeking = false;
  if (seekQueued || (video && Math.abs(video.currentTime - targetTime) > 0.12)) {
    seekQueued = false;
    queueSeek();
  }
}

function enableVideo() {
  if (!video || activeMode === "video" || reducedQuery.matches) return;
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;
  activeMode = "video";
  media?.classList.add("has-video");
  video.classList.add("is-ready");
  video.pause();
  targetTime = getProgress() * video.duration;
  queueSeek();
  queuePaint();
}

function startFrameFallback() {
  if (activeMode === "frames") return;
  activeMode = "frames";
  media?.classList.remove("has-video");
  video?.classList.remove("is-ready");
  if (!frameFallbackStarted) {
    frameFallbackStarted = true;
    initFrameFallback();
  }
  queuePaint();
}

function setReducedState(reduced) {
  if (reduced) {
    video?.pause();
    if (video) {
      try { video.currentTime = 0; } catch {}
    }
    media?.classList.remove("has-video");
    if (activeMode !== "frames") {
      activeMode = "frames";
      media?.classList.remove("has-video");
      if (!frameFallbackStarted) {
        frameFallbackStarted = true;
        initFrameFallback(true);
      } else {
        document.querySelectorAll("[data-reel-layer]").forEach((layer, i) => {
          layer.src = "assets/reel/frame-001.webp";
          layer.classList.toggle("is-front", i === 0);
        });
      }
    }
    document.body.dataset.state = "still";
    if (bar) bar.style.transform = "scaleX(0)";
    paintBeat(1);
    return;
  }
  document.body.dataset.state = "ready";
  if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA && video.duration > 0) enableVideo();
  else if (activeMode === "frames") queuePaint();
}

function initFrameFallback(forceStill = false) {
  const TOTAL = 30;
  const PAD = 3;
  const FRAME = (n) => `assets/reel/frame-${String(n).padStart(PAD, "0")}.webp`;
  const layers = [...document.querySelectorAll("[data-reel-layer]")];
  let front = 0;
  let lastIndex = 1;
  let token = 0;
  const cache = new Map();

  function warm(n) {
    if (cache.has(n)) return;
    const img = new Image();
    img.decoding = "async";
    img.src = FRAME(n);
    cache.set(n, img);
  }

  async function show(idx) {
    const mine = ++token;
    const back = layers[1 - front];
    if (!back) return;
    back.src = FRAME(idx);
    if (back.decode) {
      try { await back.decode(); } catch { return; }
    } else if (!back.complete) {
      await new Promise((resolve) => {
        back.addEventListener("load", resolve, { once: true });
        back.addEventListener("error", resolve, { once: true });
      });
    }
    if (!back.complete || back.naturalWidth === 0 || mine !== token || disposed || reducedQuery.matches) return;
    layers[front].classList.remove("is-front");
    back.classList.add("is-front");
    front = 1 - front;
  }

  function paintFrames() {
    if (disposed || activeMode !== "frames" || !hero) return;
    const progress = getProgress();
    const idx = clamp(1 + Math.floor(progress * TOTAL), 1, TOTAL);
    if (idx === lastIndex) return;
    lastIndex = idx;
    if (indexLabel) indexLabel.textContent = String(idx).padStart(PAD, "0");
    if (totalLabel) totalLabel.textContent = String(TOTAL);
    show(idx);
  }

  const framePaint = () => {
    if (ticking || disposed || activeMode !== "frames") return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      paintFrames();
      if (bar) bar.style.transform = `scaleX(${getProgress().toFixed(4)})`;
      paintBeat(Math.min(4, Math.floor(getProgress() * 4) + 1));
    });
  };

  window.addEventListener("scroll", framePaint, { passive: true });
  window.addEventListener("resize", framePaint, { passive: true });
  if (forceStill || reducedQuery.matches) {
    layers.forEach((layer, i) => {
      layer.src = FRAME(1);
      layer.classList.toggle("is-front", i === 0);
    });
  } else {
    [1, 2, 8, 15, 22, 26].forEach(warm);
    if (!saveData && !slowConnection) {
      if ("requestIdleCallback" in window) requestIdleCallback(() => {
        for (let n = 1; n <= TOTAL; n += 1) warm(n);
      }, { timeout: 2000 });
      else setTimeout(() => { for (let n = 1; n <= TOTAL; n += 1) warm(n); }, 500);
    }
    framePaint();
  }
}

if (video) {
  video.addEventListener("loadedmetadata", enableVideo);
  video.addEventListener("canplay", enableVideo);
  video.addEventListener("seeked", onSeeked);
  video.addEventListener("error", startFrameFallback);
  video.addEventListener("emptied", () => {
    if (activeMode === "pending") startFrameFallback();
  });
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA && video.duration > 0) enableVideo();
  else {
    // Do not leave the opening viewport waiting for the MP4. The existing
    // first frame remains visible until metadata confirms a usable video.
    setTimeout(() => {
      if (activeMode === "pending") startFrameFallback();
    }, 5000);
  }
} else {
  startFrameFallback();
}

window.addEventListener("scroll", queuePaint, { passive: true });
window.addEventListener("resize", queuePaint, { passive: true });
reducedQuery.addEventListener?.("change", (event) => setReducedState(event.matches));

if ("IntersectionObserver" in window && hero) {
  new IntersectionObserver(([entry]) => {
    disposed = !entry.isIntersecting;
    if (!disposed) queuePaint();
  }, { rootMargin: "100% 0px" }).observe(hero);
}

setReducedState(reducedQuery.matches);
if (totalLabel && !video) totalLabel.textContent = "30";
