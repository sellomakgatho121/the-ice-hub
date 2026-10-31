/* THE ICE HUB — native MP4 scroll scrub.
 *
 * Scroll position is the single source of truth: progress 0..1 maps directly
 * to media time 0..duration. Seeking is serialized; while one seek is active,
 * only the newest target is retained. No React render loop and no autoplay.
 */
const hero = document.querySelector("[data-hero]");
const media = document.querySelector("[data-hero-media]");
const video = document.querySelector("[data-video-reel]");
const status = document.querySelector("[data-video-status]");
const bar = document.querySelector("[data-reel-bar]");
const beatNodes = [...document.querySelectorAll("[data-beat]")];
const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

let disposed = false;
let rafPending = false;
let seekInFlight = false;
let seekRafPending = false;
let latestTarget = 0;
let lastProgress = -1;
let lastBeat = 0;
let metadataReady = false;
let usableFrame = false;

function setState(state, message) {
  if (media) media.dataset.videoState = state;
  if (document.body) document.body.dataset.state = state === "reduced" || state === "error" ? "still" : state === "ready" ? "ready" : "loading";
  if (status && message) status.textContent = message;
}

function progressFromScroll() {
  if (!hero) return 0;
  const runway = Math.max(hero.offsetHeight - window.innerHeight, 1);
  return clamp(-hero.getBoundingClientRect().top / runway, 0, 1);
}

function updateBeat(progress) {
  const beat = Math.min(4, Math.floor(progress * 4) + 1);
  if (beat === lastBeat) return;
  lastBeat = beat;
  for (const node of beatNodes) {
    if (Number(node.dataset.beat) === beat) node.setAttribute("data-active", "");
    else node.removeAttribute("data-active");
  }
}

function requestLatestSeek() {
  if (!metadataReady || reducedQuery.matches || disposed || !video) return;
  if (seekInFlight || seekRafPending) return;
  seekRafPending = true;
  requestAnimationFrame(() => {
    seekRafPending = false;
    if (!metadataReady || reducedQuery.matches || disposed || !video || seekInFlight) return;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (duration <= 0) return;
    const target = clamp(latestTarget, 0, Math.max(0, duration - 0.015));
    if (Math.abs(video.currentTime - target) < 0.025) return;
    seekInFlight = true;
    try {
      video.currentTime = target;
    } catch {
      seekInFlight = false;
    }
  });
}

function onSeeked() {
  seekInFlight = false;
  if (Math.abs(video.currentTime - latestTarget) > 0.06) requestLatestSeek();
}

function paint() {
  rafPending = false;
  if (disposed || !hero) return;
  const progress = progressFromScroll();
  updateBeat(progress);
  if (bar) bar.style.transform = `scaleX(${progress.toFixed(4)})`;
  if (!metadataReady || reducedQuery.matches || !video) return;

  if (Math.abs(progress - lastProgress) > 0.001) {
    lastProgress = progress;
    latestTarget = progress * video.duration;
    requestLatestSeek();
  }
}

function queuePaint() {
  if (rafPending || disposed) return;
  rafPending = true;
  requestAnimationFrame(paint);
}

function onMetadata() {
  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
    failVideo();
    return;
  }
  metadataReady = true;
  latestTarget = progressFromScroll() * video.duration;
  video.pause();
  requestLatestSeek();
  if (status) status.textContent = "Hero video metadata loaded";
}

function onUsableFrame() {
  if (usableFrame || reducedQuery.matches) return;
  usableFrame = true;
  setState("ready", "Hero video ready. Scroll to explore.");
  queuePaint();
}

function failVideo() {
  metadataReady = false;
  seekInFlight = false;
  setState("error", "Hero video unavailable. Showing the product image.");
}

function onMotionPreference(event) {
  if (event.matches) {
    video?.pause();
    setState("reduced", "Showing still product image because reduced motion is enabled.");
    if (bar) bar.style.transform = "scaleX(0)";
    updateBeat(0);
  } else {
    if (video?.readyState >= HTMLMediaElement.HAVE_METADATA) {
      onMetadata();
      if (usableFrame) setState("ready", "Hero video ready. Scroll to explore.");
    }
    queuePaint();
  }
}

if (video) {
  video.addEventListener("loadedmetadata", onMetadata);
  video.addEventListener("loadeddata", onUsableFrame);
  video.addEventListener("canplay", onUsableFrame);
  video.addEventListener("seeked", onSeeked);
  video.addEventListener("error", failVideo);
  video.addEventListener("abort", failVideo);
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMetadata();
} else {
  failVideo();
}

window.addEventListener("scroll", queuePaint, { passive: true });
window.addEventListener("resize", queuePaint, { passive: true });
reducedQuery.addEventListener?.("change", onMotionPreference);

let observer;
if ("IntersectionObserver" in window && hero) {
  observer = new IntersectionObserver(([entry]) => {
    disposed = !entry.isIntersecting;
    if (!disposed) queuePaint();
  }, { rootMargin: "100% 0px" });
  observer.observe(hero);
}

if (reducedQuery.matches) onMotionPreference({ matches: true });
else {
  setState("loading", "Loading hero video");
  window.setTimeout(() => {
    if (!metadataReady && video && video.readyState < HTMLMediaElement.HAVE_METADATA) failVideo();
  }, 12000);
  queuePaint();
}

window.addEventListener("pagehide", () => {
  disposed = true;
  observer?.disconnect();
  video?.pause();
  video?.removeEventListener("seeked", onSeeked);
}, { once: true });
