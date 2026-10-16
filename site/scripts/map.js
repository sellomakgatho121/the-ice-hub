/* The Ice Hub — opt-in map panel.
 * No third-party request is made until the visitor asks for the map. The
 * geocode result is cached for 30 days: Nominatim's usage policy allows no
 * more than one request per second, and repeat visits must not re-hit it.
 */

import { SHOP } from "../config.js";

const CACHE_KEY = "icehub.geocode.v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const hit = JSON.parse(raw);
    if (!hit || typeof hit.lat !== "number" || typeof hit.lng !== "number") return null;
    if (Date.now() - hit.fetchedAt > TTL_MS) return null;
    return hit;
  } catch {
    return null;
  }
}

function writeCache(lat, lng) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ lat, lng, fetchedAt: Date.now() }));
  } catch {
    // localStorage unavailable: the map simply re-geocodes next visit.
  }
}

async function geocode(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);

  const hits = await res.json();
  if (!Array.isArray(hits) || hits.length === 0) throw new Error("No geocode result");

  const lat = Number(hits[0].lat);
  const lng = Number(hits[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Bad geocode result");
  return { lat, lng };
}

function embedUrl({ lat, lng }) {
  const delta = 0.006;
  const bbox = [
    (lng - delta).toFixed(5), (lat + delta).toFixed(5),
    (lng + delta).toFixed(5), (lat - delta).toFixed(5),
  ].join(",");
  const marker = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

function showFrame(panel, position) {
  const frame = document.createElement("iframe");
  frame.title = "Map of The Ice Hub, Tembisa";
  frame.src = embedUrl(position);
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer-when-downgrade";
  panel.replaceChildren(frame);
  panel.hidden = false;
  panel.removeAttribute("aria-hidden");
  panel.setAttribute("data-loaded", "");
}

const panel = document.querySelector("[data-map]");
const controls = document.querySelector("[data-map-controls]");

if (panel && controls) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button";
  button.textContent = "Load interactive map";
  button.setAttribute("aria-expanded", "false");
  controls.insertBefore(button, controls.querySelector(".button"));

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Loading map";

    const cached = readCache();
    if (cached) {
      showFrame(panel, cached);
      return;
    }

    try {
      const hit = await geocode(SHOP.geocodeQuery);
      writeCache(hit.lat, hit.lng);
      showFrame(panel, hit);
    } catch {
      // A failed map must never remove the address or the directions link,
      // so the fallback position is rendered instead of an error state.
      const [lat, lng] = SHOP.fallbackLatLng;
      showFrame(panel, { lat, lng });
    }
  }, { once: true });
}