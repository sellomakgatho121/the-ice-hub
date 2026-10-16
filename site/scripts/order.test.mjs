import test from "node:test";
import assert from "node:assert/strict";
import { SHOP } from "../config.js";
import {
  getUnitPrice,
  calculateOrder,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "./order.js";

const byId = Object.fromEntries(SHOP.products.map((p) => [p.id, p]));

test("bag pricing switches to stock for the whole line at 20", () => {
  assert.equal(getUnitPrice(byId["cubes-2kg"], 19), 17);
  assert.equal(getUnitPrice(byId["cubes-2kg"], 20), 10);
  assert.equal(getUnitPrice(byId["cubes-3kg"], 19), 22);
  assert.equal(getUnitPrice(byId["cubes-3kg"], 20), 12);
});

test("the 30 kg block has no stock tier", () => {
  assert.equal(getUnitPrice(byId["block-30kg"], 1), 55);
  assert.equal(getUnitPrice(byId["block-30kg"], 30), 55);
  assert.equal(byId["block-30kg"].stockPrice, null);
});

test("mixed order applies stock pricing and totals correctly", () => {
  const summary = calculateOrder(SHOP.products, {
    "cubes-2kg": 20,
    "cubes-3kg": 0,
    "block-30kg": 2,
  });
  assert.equal(summary.itemCount, 22);
  assert.equal(summary.total, 310);
  assert.deepEqual(
    summary.lines.map(({ product, quantity, unitPrice, lineTotal }) =>
      ({ id: product.id, quantity, unitPrice, lineTotal })),
    [
      { id: "cubes-2kg", quantity: 20, unitPrice: 10, lineTotal: 200 },
      { id: "block-30kg", quantity: 2, unitPrice: 55, lineTotal: 110 },
    ],
  );
  assert.equal(summary.lines[0].stockApplied, true);
});

test("one bag short of the threshold stays on standard pricing", () => {
  const summary = calculateOrder(SHOP.products, { "cubes-2kg": 19 });
  assert.equal(summary.total, 19 * 17);
  assert.equal(summary.lines[0].stockApplied, false);
});

test("invalid quantities create no order lines", () => {
  const summary = calculateOrder(SHOP.products, {
    "cubes-2kg": -1,
    "cubes-3kg": Number.NaN,
    "block-30kg": 0,
  });
  assert.deepEqual(summary, { lines: [], itemCount: 0, total: 0 });
});

test("fractional quantities truncate rather than bill partially", () => {
  const summary = calculateOrder(SHOP.products, { "block-30kg": 2.7 });
  assert.equal(summary.itemCount, 2);
  assert.equal(summary.total, 110);
});

test("the message labels totals as estimates and requests fulfillment details", () => {
  const summary = calculateOrder(SHOP.products, { "cubes-2kg": 20, "block-30kg": 2 });
  assert.equal(buildWhatsAppMessage(summary), [
    "Hello The Ice Hub, I would like to order:",
    "",
    "• 20 × 2 kg ice-cube bags at R10 each",
    "• 2 × 30 kg ice blocks at R55 each",
    "",
    "Estimated total: R310",
    "",
    "Delivery or collection: please confirm",
    "Delivery address: please add",
    "Preferred date and time: please add",
    "",
    "Please confirm availability and the final total.",
  ].join("\n"));
});

test("singular quantities are not pluralised", () => {
  const summary = calculateOrder(SHOP.products, { "block-30kg": 1 });
  assert.match(buildWhatsAppMessage(summary), /• 1 × 30 kg ice block at R55 each/);
});

test("zero-quantity products are omitted from the message", () => {
  const summary = calculateOrder(SHOP.products, { "cubes-2kg": 1, "cubes-3kg": 0 });
  const message = buildWhatsAppMessage(summary);
  assert.match(message, /2 kg ice-cube bag/);
  assert.doesNotMatch(message, /3 kg/);
});

test("the WhatsApp URL targets the shop and carries encoded order text", () => {
  const summary = calculateOrder(SHOP.products, { "cubes-3kg": 1 });
  const url = new URL(buildWhatsAppUrl(summary));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/27818592919");
  assert.match(url.searchParams.get("text"), /1 × 3 kg ice-cube bag at R22 each/);
});

test("the catalog matches the confirmed pricing flyer exactly", () => {
  assert.deepEqual(
    SHOP.products.map(({ id, standardPrice, stockPrice }) => ({ id, standardPrice, stockPrice })),
    [
      { id: "cubes-2kg", standardPrice: 17, stockPrice: 10 },
      { id: "cubes-3kg", standardPrice: 22, stockPrice: 12 },
      { id: "block-30kg", standardPrice: 55, stockPrice: null },
    ],
  );
});

test("wa.me digits carry no formatting characters", () => {
  assert.match(SHOP.whatsappDigits, /^\d+$/);
});