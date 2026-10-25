import React from "react";
import { SHOP } from "../lib/config.js";
import Icon from "./Icon.jsx";
import { useShopStatus } from "../hooks/useShopStatus.js";
import { useMap } from "../hooks/useMap.js";

/* Clean location block: map right, details left. Opt-in map — no iframe
   until the visitor asks for it. */
export default function Visit() {
  const status = useShopStatus();
  const { load, state, embedSrc, busy, hidden, onFrameLoad } = useMap();

  return (
    <section className="section" id="location" aria-labelledby="location-title">
      <div className="shell location">
        <div className="location__details js-reveal">
          <p className="eyebrow">Where we are</p>
          <h2 id="location-title">Come through</h2>

          <p className={`status${status.state === "open" ? " is-open" : ""}`} aria-live="polite">
            <span className="status__dot" aria-hidden="true" />
            <span data-open-status={status.state === "checking" ? undefined : status.state}>
              {status.label}
            </span>
          </p>

          <p className="location__item">
            <span className="location__label">Address</span>
            <span className="location__value">
              9605 Winnie Mandela Zone 4, Raymond Mhlaba Street, Tembisa 1632
            </span>
          </p>
          <p className="location__item">
            <span className="location__label">Phone</span>
            <span className="location__value">
              <a href={`tel:+${SHOP.whatsappDigits}`}>{SHOP.whatsappDisplay}</a>
            </span>
          </p>
          <p className="location__item">
            <span className="location__label">WhatsApp</span>
            <span className="location__value">
              <a href={`https://wa.me/${SHOP.whatsappDigits}`} rel="noopener">
                Send a message
              </a>
            </span>
          </p>
        </div>

        <div className="location__map js-reveal" data-map="" hidden={hidden} aria-busy={busy ? "true" : "false"}>
          {embedSrc && (
            <iframe
              title="Map of Zero Degrees, Tembisa"
              src={embedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={onFrameLoad}
            />
          )}
        </div>
        {!embedSrc && state !== "idle" && (
          <p className="js-reveal">Loading map…</p>
        )}
      </div>

      <div className="shell hours js-reveal">
        <p className="eyebrow">Opening hours</p>
        <div className="hours">
          <div className="hours__day">
            <p className="hours__name">Monday – Friday</p>
            <p className="hours__time">10:00 – 19:00</p>
          </div>
          <div className="hours__day hours__day--today">
            <p className="hours__name">Saturday</p>
            <p className="hours__time">09:00 – 21:00</p>
          </div>
          <div className="hours__day">
            <p className="hours__name">Sunday</p>
            <p className="hours__time">09:00 – 21:00</p>
          </div>
        </div>
      </div>
    </section>
  );
}
