import React from "react";
import { SHOP } from "../lib/config.js";
import Icon from "./Icon.jsx";
import { useShopStatus } from "../hooks/useShopStatus.js";
import { useMap } from "../hooks/useMap.js";

/* Hours status goes live after mount; the map is opt-in — no iframe or
 * Nominatim request exists until the visitor presses "Load interactive map"
 * (useMap holds the geocode + cache + fallback logic). */
export default function Visit() {
  const status = useShopStatus();
  const { load, state, embedSrc, busy, hidden, onFrameLoad } = useMap();

  return (
    <section className="section counter-surface" id="visit" aria-labelledby="visit-title">
      <div className="shell visit__grid">
        <div>
          <p className="eyebrow js-reveal">Where we are</p>
          <h2 className="js-reveal" id="visit-title">
            Come through
          </h2>

          <p className={`status${status.state === "open" ? " is-open" : ""}`} aria-live="polite">
            <span className="status__dot" aria-hidden="true" />
            <span data-open-status={status.state === "checking" ? undefined : status.state}>{status.label}</span>
          </p>

          <dl className="hours">
            <div>
              <dt>Monday to Friday</dt>
              <dd>10:00 – 19:00</dd>
            </div>
            <div>
              <dt>Saturday</dt>
              <dd>09:00 – 21:00</dd>
            </div>
            <div>
              <dt>Sunday</dt>
              <dd>09:00 – 21:00</dd>
            </div>
          </dl>

          <p className="address">
            <Icon name="map-pin" />
            <span>
              {SHOP.address.replace(", South Africa", "")}
              <br />
              <a href={`tel:+${SHOP.whatsappDigits}`}>{SHOP.whatsappDisplay}</a>
            </span>
          </p>

          <p className="map-controls" data-map-controls="">
            <button
              className="button map-load"
              type="button"
              aria-expanded={state === "loaded" ? "true" : "false"}
              onClick={load}
              disabled={state !== "idle"}
            >
              {state === "idle" ? "Load interactive map" : state === "loading" ? "Loading map" : "Map loaded"}
            </button>
            <a
              className="button button--ghost"
              href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(SHOP.geocodeQuery)}`}
              rel="noopener"
              target="_blank"
            >
              Open directions
            </a>
          </p>
        </div>
        <div
          className="map-panel"
          data-map=""
          hidden={hidden}
          aria-hidden={hidden ? "true" : undefined}
          aria-busy={busy ? "true" : "false"}
        >
          {embedSrc && (
            <iframe
              title="Map of The Ice Hub, Tembisa"
              src={embedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={onFrameLoad}
            />
          )}
        </div>
      </div>
    </section>
  );
}
