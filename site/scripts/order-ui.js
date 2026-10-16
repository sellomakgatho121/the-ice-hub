/* The Ice Hub — order interface.
 * All pricing and message rules live in order.js and are unit-tested there.
 * This module only reads the DOM and renders it.
 */

import { SHOP } from "../config.js";
import { calculateOrder, getUnitPrice, buildWhatsAppUrl } from "./order.js";

const quantities = Object.create(null);

const steppers = [...document.querySelectorAll("[data-step]")];
const cards = [...document.querySelectorAll("[data-product-card]")];
const summary = document.querySelector("[data-summary]");
const summaryLines = document.querySelector("[data-summary-lines]");
const summaryTotal = document.querySelector("[data-summary-total]");
const summaryCta = document.querySelector("[data-summary-cta]");
const announcer = document.querySelector("[data-order-announce]");

const productById = new Map(SHOP.products.map((p) => [p.id, p]));
const quantityOf = (id) => quantities[id] ?? 0;
const rands = (n) => `R${n}`;

function announce(message) {
  if (announcer) announcer.textContent = message;
}

/**
 * Crossing the bulk threshold is the one interaction that carries
 * information: the price visibly changes, so it is announced politely.
 * Announced only on the crossing itself, never on every repaint.
 */
function renderProduct(product) {
  const card = cards.find((el) => el.dataset.product === product.id);
  if (!card) return;
  const quantity = quantityOf(product.id);
  const unit = getUnitPrice(product, quantity);
  const atBulk = product.stockPrice !== null && quantity >= product.stockThreshold;

  const price = card.querySelector("[data-price]");
  if (price) price.textContent = rands(unit);

  const qty = card.querySelector(`[data-qty="${product.id}"]`);
  if (qty) qty.textContent = String(quantity);

  for (const button of card.querySelectorAll("[data-step]")) {
    if (Number(button.dataset.step) < 0) button.disabled = quantity === 0;
  }

  card.toggleAttribute("data-bulk", atBulk);
}

function renderSummary(summaryState) {
  if (!summary) return;
  const empty = summaryState.itemCount === 0;
  summary.hidden = empty;
  if (empty) return;

  if (summaryLines) {
    summaryLines.replaceChildren(
      ...summaryState.lines.map(({ product, quantity, unitPrice }) => {
        const li = document.createElement("li");
        const label = document.createElement("span");
        label.textContent = `${quantity} × ${product.messageName}`;
        const price = document.createElement("span");
        price.textContent = rands(quantity * unitPrice);
        li.append(label, price);
        return li;
      }),
    );
  }

  if (summaryTotal) summaryTotal.textContent = rands(summaryState.total);
  if (summaryCta) summaryCta.href = buildWhatsAppUrl(summaryState);
}

function repaint() {
  const state = calculateOrder(SHOP.products, quantities);
  for (const product of SHOP.products) renderProduct(product);
  renderSummary(state);
  return state;
}

function setQuantity(id, next) {
  const product = productById.get(id);
  if (!product) return;
  const before = quantityOf(id);
  const wasBulk = product.stockPrice !== null && before >= product.stockThreshold;

  const value = Math.max(0, Math.trunc(Number(next) || 0));
  if (value === before) return;
  quantities[id] = value;

  const nowBulk = product.stockPrice !== null && value >= product.stockThreshold;
  const state = repaint();

  if (nowBulk !== wasBulk && nowBulk) {
    announce(
      `${product.messageName} stock price applied: ${rands(product.stockPrice)} each for the whole line. Estimated total ${rands(state.total)}.`,
    );
  }
}

for (const button of steppers) {
  const id = button.dataset.product;
  if (!productById.has(id)) continue;
  button.addEventListener("click", () => {
    const delta = Number(button.dataset.step) || 0;
    setQuantity(id, quantityOf(id) + delta);
  });
}

// Buttons start disabled so a keyboard user cannot tab into a no-op control
// before any quantity exists.
for (const product of SHOP.products) {
  for (const button of cards.find((el) => el.dataset.product === product.id)?.querySelectorAll("[data-step]") ?? []) {
    if (Number(button.dataset.step) < 0) button.disabled = true;
  }
}

repaint();