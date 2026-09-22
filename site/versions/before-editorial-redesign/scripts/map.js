/* The Ice Hub — map embed.
 * Geocodes the address from config.js via OpenStreetMap Nominatim, then
 * renders an OSM iframe bounded to the result. On geocode failure, falls
 * back to the hard-coded fallbackLatLng in config.js.
 *
 * Caches the geocode result in localStorage for 30 days so repeat visits
 * do not re-hit Nominatim (Nominatim's usage policy requires <=1 req/s).
 *
 * The map is wrapped in a defer-and-pointer-events trick so it never
 * blocks first paint.
 */

import { SHOP } from "../config.js";

const CACHE_KEY = "icehub.geocode.v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    if (!j || typeof j.lat !== "number" || typeof j.lng !== "number") return null;
    if (Date.now() - j.fetchedAt > TTL_MS) return null;
    return j;
  } catch { return null; }
}

function writeCache(lat, lng) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ lat, lng, fetchedAt: Date.now() }));
  } catch { /* localStorage disabled */ }
}

async function geocode(address) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");
  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const arr = await res.json();
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("No result");
  const hit = arr[0];
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Bad result");
  return { lat, lng };
}

function buildEmbed(lat, lng) {
  // OSM embed iframe — bbox: west,north,east,south (in degrees)
  const delta = 0.006; // ~600m box
  const west = lng - delta;
  const east = lng + delta;
  const north = lat + delta;
  const south = lat - delta;
  const bbox = `${west.toFixed(5)},${north.toFixed(5)},${east.toFixed(5)},${south.toFixed(5)}`;
  const marker = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

function buildExternalLink(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lng.toFixed(5)}#map=17/${lat.toFixed(5)}/${lng.toFixed(5)}`;
}

function render(target, lat, lng, label) {
  const embed = buildEmbed(lat, lng);
  const external = buildExternalLink(lat, lng);
  target.innerHTML = `
    <iframe
      title="${label}"
      src="${embed}"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      style="width:100%;height:100%;border:0;display:block;background:var(--ink-1);"
    ></iframe>
    <a class="map__link" href="${external}" target="_blank" rel="noopener">
      Open in OpenStreetMap &rarr;
    </a>
  `;
}

function renderFallback(target) {
  const [lat, lng] = SHOP.fallbackLatLng;
  render(target, lat, lng, "The Ice Hub shop location (approximate)");
}

function renderError(target) {
  target.innerHTML = `
    <div class="map__fallback">
      <p>Map unavailable. The address is below.</p>
      <p class="map__addr">${SHOP.address}</p>
    </div>
  `;
}

async function init() {
  const target = document.querySelector("[data-map]");
  if (!target) return;

  // 1. try cache
  const cached = readCache();
  if (cached) {
    render(target, cached.lat, cached.lng, "The Ice Hub shop location");
    return;
  }

  // 2. try geocode
  try {
    const { lat, lng } = await geocode(SHOP.geocodeQuery);
    writeCache(lat, lng);
    render(target, lat, lng, "The Ice Hub shop location");
  } catch {
    // 3. fallback
    renderFallback(target);
  }
}

// Defer to idle so it never competes with first paint.
if ("requestIdleCallback" in window) {
  requestIdleCallback(init, { timeout: 1500 });
} else {
  setTimeout(init, 500);
}