import React from "react";
import { SHOP } from "../lib/config.js";

/* Order summary, hidden with the order empty. Lines and total render from
 * the derived order state; the CTA hides with the summary, and the mobile
 * bar keeps the always-visible link (bare wa.me when the order clears). */
export default function Summary({ order }) {
  const { summary, href } = order;
  const empty = summary.itemCount === 0;

  return (
    <aside className="summary" data-summary="" hidden={empty} aria-label="Your order">
      <ul className="summary__lines" data-summary-lines="">
        {!empty &&
          summary.lines.map(({ product, quantity, unitPrice }) => (
            <li key={product.id}>
              <span>{`${quantity} × ${product.messageName}`}</span>
              <span>{`R${quantity * unitPrice}`}</span>
            </li>
          ))}
      </ul>
      <p className="summary__total">
        <span>Estimated total</span>
        <strong data-summary-total="">{`R${summary.total}`}</strong>
      </p>
      {!empty && (
        <a className="cta" href={href} rel="noopener" data-summary-cta="">
          Send order on WhatsApp
        </a>
      )}
    </aside>
  );
}
