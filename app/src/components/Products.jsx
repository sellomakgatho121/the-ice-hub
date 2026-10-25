import React from "react";
import { SHOP } from "../lib/config.js";
import { getUnitPrice } from "../lib/order.js";

const CARD_IMAGES = {
  "cubes-2kg": "/assets/products/product-front.jpg",
  "cubes-3kg": "/assets/products/product-motion-1.jpg",
  "block-30kg": "/assets/products/product-motion-2.png",
};
const UNIT_LABELS = {
  "cubes-2kg": { one: "2 kg bag", many: "2 kg ice-cube bags" },
  "cubes-3kg": { one: "3 kg bag", many: "3 kg ice-cube bags" },
  "block-30kg": { one: "30 kg block", many: "30 kg ice blocks" },
};

function stockNote(product) {
  if (product.stockPrice === null || product.stockThreshold === null) {
    return "Flat rate. No bulk tier.";
  }
  return `${product.stockThreshold}+ bags drop to R${product.stockPrice} each for the whole line.`;
}

function orderHref(product) {
  const message = `Hello Zero Degrees, I would like to order ${UNIT_LABELS[product.id].many}.`;
  return `https://wa.me/${SHOP.whatsappDigits}?text=${encodeURIComponent(message)}`;
}

export default function Products({ order }) {
  const { quantities, setQuantity } = order;

  return (
    <section className="section" id="products" aria-labelledby="products-title">
      <div className="shell">
        <div className="section__head">
          <p className="eyebrow js-reveal">Prices effective 20 May 2026</p>
          <h2 className="js-reveal" id="products-title">
            Order ice
          </h2>
        </div>

        <ul className="products">
          {SHOP.products.map((product) => {
            const quantity = quantities[product.id] ?? 0;
            const atBulk = product.stockPrice !== null && quantity >= product.stockThreshold;
            return (
              <li
                className={`product js-reveal ${atBulk ? "product--bulk" : ""}`}
                key={product.id}
                data-product-card=""
                data-product={product.id}
                data-bulk={atBulk ? "" : undefined}
              >
                <img
                  className="product__image"
                  src={CARD_IMAGES[product.id]}
                  alt={`${product.name} product shot`}
                  width="923"
                  height="1152"
                  loading="lazy"
                  decoding="async"
                />
                <div className="product__head">
                  <h3 className="product__name">{product.name}</h3>
                  <p className="product__price">
                    <span data-price="">{`R${getUnitPrice(product, quantity)}`}</span>
                  </p>
                </div>
                <p className="product__use">{product.use}</p>
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
                    −
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
                    +
                  </button>
                </div>
                <a className="button" href={orderHref(product)} rel="noopener" data-direct-order="">
                  Order via WhatsApp
                </a>
                {atBulk && (
                  <p className="product__bulk">
                    Bulk price applied — R{product.stockPrice} each
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
