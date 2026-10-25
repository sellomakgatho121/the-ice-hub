import React from "react";
import { NumberTicker } from "./magicui/number-ticker.jsx";

/* Figures render their final value on the server (no-JS state) and tick up
   once they enter the viewport. R prefixes sit outside the ticker, as in the
   original markup. */
export default function Stats() {
  return (
    <section className="stats" aria-label="The shop in numbers">
      <div className="shell stats__grid">
        <div className="stat">
          <p className="stat__figure">
            <NumberTicker value={30} />
          </p>
          <p className="stat__label">bags unlock the stock price</p>
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
    </section>
  );
}
