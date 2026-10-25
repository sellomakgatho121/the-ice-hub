import { useCallback, useRef, useState } from "react";
import { SHOP } from "../lib/config.js";

/* The Ice Hub — opt-in map panel (ported from site/scripts/map.js).
 * No third-party request is made until the visitor asks for the map. The
 * geocode result is cached for 30 days: Nominatim's usage policy allows no
 * more than one request per second, and repeat visits must not re-hit it.
 */
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

  // Nominatim can be slow or unreachable on a mobile connection. Without a
  // deadline the button sits on "Loading map" forever; abort into the
  // hard-coded fallback instead.
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
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
    (lng - delta).toFixed(5),
    (lat + delta).toFixed(5),
    (lng + delta).toFixed(5),
    (lat - delta).toFixed(5),
  ].join(",");
  const marker = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

/* Opt-in map loading. States: idle -> loading (geocoding) -> loaded (embed
 * shown, `aria-busy` until the iframe's own load event). A geocode failure
 * renders the hard-coded fallback position instead of an error state — a
 * failed map must never remove the address or the directions link. */
export function useMap() {
  const [state, setState] = useState("idle"); // idle | loading | loaded
  const [embedSrc, setEmbedSrc] = useState(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const panelRef = useRef(null);
  const startedRef = useRef(false);

  const load = useCallback(async () => {
    if (startedRef.current || state !== "idle") return;
    startedRef.current = true;
    setState("loading");

    let position = readCache();
    if (!position) {
      try {
        position = await geocode(SHOP.geocodeQuery);
        writeCache(position.lat, position.lng);
      } catch {
        // A failed map must never remove the address or the directions link,
        // so the fallback position is rendered instead of an error state.
        const [lat, lng] = SHOP.fallbackLatLng;
        position = { lat, lng };
      }
    }

    setFrameLoaded(false);
    setEmbedSrc(embedUrl(position));
    setState("loaded");
  }, [state]);

  const hidden = state === "idle" || state === "loading";

  return {
    panelRef,
    load,
    state,
    embedSrc,
    onFrameLoad: () => setFrameLoaded(true),
    // iframes fire load even on error pages, so clearing busy here is safe.
    busy: state === "loaded" && !frameLoaded,
    hidden,
  };
}
