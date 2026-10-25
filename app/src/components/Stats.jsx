import React from "react";
import { NumberTicker } from "./magicui/number-ticker.jsx";

/* Clean stat grid — numbers first, labels second. */
export default function Stats() {
  return (
    <section className="section section--ink stats js-reveal" aria-label="The shop in numbers">
      <div className="shell">
        <div className="stats">
          <div className="stat">
            <p className="stat__figure">
              <NumberTicker value={30} />
            </p>
            <p className="stat__label">bags unlock bulk price</p>
          </div>
          <div className="stat">
            <p className="stat__figure">
              R<NumberTicker value={10} />
            </p>
            <p className="stat__label">per 2 kg bag at bulk</p>
          </div>
          <div className="stat">
            <p className="stat__figure">
              <NumberTicker value={7} />
            </p>
            <p className="stat__label">days open every week</p>
          </div>
          <div className="stat">
            <p className="stat__figure">
              R<NumberTicker value={55} />
            </p>
            <p className="stat__label">flat for a 30 kg block</p>
          </div>
        </div>
      </div>
    </section>
  );
}
