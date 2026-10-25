import React from "react";
import { SHOP } from "../lib/config.js";
import { getUnitPrice } from "../lib/order.js";
import Icon from "./Icon.jsx";

/* Product cards keep the prerendered shape: prices render through
 * getUnitPrice so the stock tier shows the moment the threshold is crossed,
 * `data-bulk` marks the card at-bulk, minus is disabled at 0, and the direct
 * per-product WhatsApp links bypass the order entirely. */
const CARD_ICONS = { "cubes-2kg": "box", "cubes-3kg": "box", "block-30kg": "weight" };
const UNIT_LABELS = {
  "cubes-2kg": { one: "2 kg bag", many: "2 kg ice-cube bags" },
  "cubes-3kg": { one: "3 kg bag", many: "3 kg ice-cube bags" },
  "block-30kg": { one: "30 kg block", many: "30 kg ice blocks" },
};

function stockNote(product) {
  if (product.stockPrice === null || product.stockThreshold === null) {
    return "Flat rate. No bulk tier.";
  }
  return `${product.stockThreshold} or more drops to R${product.stockPrice} a bag.`;
}

function orderHref(product) {
  const message = `Hello The Ice Hub, I would like to order ${UNIT_LABELS[product.id].many}.`;
  return `https://wa.me/${SHOP.whatsappDigits}?text=${encodeURIComponent(message)}`;
}

export default function Products({ order }) {
  const { quantities, setQuantity } = order;

  return (
    <section className="section counter-surface" id="products" aria-labelledby="products-title">
      <div className="shell">
        <p className="eyebrow js-reveal">Prices effective 20 May 2026</p>
        <h2 className="js-reveal" id="products-title">
          Buy ice
        </h2>

        <ul className="products">
          {SHOP.products.map((product) => {
            const quantity = quantities[product.id] ?? 0;
            const atBulk = product.stockPrice !== null && quantity >= product.stockThreshold;
            return (
              <li
                className="product js-reveal"
                key={product.id}
                data-product-card=""
                data-product={product.id}
                data-bulk={atBulk ? "" : undefined}
              >
                <div className="product__head">
                  <h3 className="product__name">{product.name}</h3>
                  <p className="product__price">
                    <span data-price="">{`R${getUnitPrice(product, quantity)}`}</span>
                  </p>
                </div>
                <p className="product__use">
                  <Icon name={CARD_ICONS[product.id]} />
                  {product.use}
                </p>
                <p className="product__note" data-stock-note="">
                  {stockNote(product)}
                </p>
                <div className="stepper">
                  <button
                    className="stepper__btn"
                    type="button"
                    data-step="-1"
                    data-product={product.id}
                    aria-label={`One fewer ${UNIT_LABELS[product.id].one}`}
                    onClick={() => setQuantity(product.id, (current) => Math.max(0, current - 1))}
                    disabled={quantity === 0}
                  >
                    <Icon name="minus" />
                  </button>
                  <output className="stepper__qty" data-qty={product.id} aria-live="off">
                    {quantity}
                  </output>
                  <button
                    className="stepper__btn"
                    type="button"
                    data-step="1"
                    data-product={product.id}
                    aria-label={`One more ${UNIT_LABELS[product.id].one}`}
                    onClick={() => setQuantity(product.id, (current) => current + 1)}
                  >
                    <Icon name="plus" />
                  </button>
                </div>
                <a className="button" href={orderHref(product)} rel="noopener" data-direct-order="">
                  Order by WhatsApp
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
