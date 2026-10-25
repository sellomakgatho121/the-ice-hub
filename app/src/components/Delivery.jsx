import React from "react";
import Icon from "./Icon.jsx";

export default function Delivery() {
  return (
    <section className="section" id="delivery" aria-labelledby="delivery-title">
      <div className="shell">
        <p className="eyebrow js-reveal">Who buys from us</p>
        <h2 className="js-reveal" id="delivery-title">
          Ice for the week, the function, and the floor
        </h2>

        <div className="audience">
          <article className="audience__card js-reveal">
            <p className="eyebrow">Everyday</p>
            <h3 className="audience__title">A bag before work</h3>
            <p className="audience__body">
              Most people buy on the way past. Two kilos fills a cooler for a long day; three is still the better rate
              if you are throwing a braai.
            </p>
          </article>
          <article className="audience__card js-reveal">
            <p className="eyebrow">Events</p>
            <p className="audience__figure">R10</p>
            <h3 className="audience__title">Thirty bags or more</h3>
            <p className="audience__body">
              The stock price applies to the whole line once you reach thirty, not just the bags past it. Order it in
              one message.
            </p>
          </article>
          <article className="audience__card js-reveal">
            <p className="eyebrow">Venues</p>
            <h3 className="audience__title">Standing orders</h3>
            <ul className="audience__rules">
              <li>
                <Icon name="truck" /> Free delivery around Tembisa
              </li>
              <li>
                <Icon name="clock" /> Weekdays 10:00 to 19:00
              </li>
              <li>
                <Icon name="weight" /> 30 kg blocks at a flat R55
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
