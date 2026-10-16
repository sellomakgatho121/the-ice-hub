import { SHOP } from "../config.js";

/**
 * Pure order-domain logic. No DOM, no side effects, no dependencies.
 * Every rule here is a confirmed business fact from DESIGN.md section 1.
 */

/**
 * Unit price for a product line. Bags drop to stock pricing for the ENTIRE
 * line at or above the threshold (not just the bags beyond it).
 * The 30 kg block has no stock tier and is always standard price.
 */
export function getUnitPrice(product, quantity) {
  return product.stockPrice !== null && quantity >= product.stockThreshold
    ? product.stockPrice
    : product.standardPrice;
}

/**
 * Build the order summary from a sparse quantity map.
 * Missing, non-numeric, negative and fractional inputs are all coerced to 0.
 */
export function calculateOrder(products, quantities) {
  const lines = products.flatMap((product) => {
    const raw = Number(quantities[product.id]);
    const quantity = Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0;
    if (quantity === 0) return [];
    const unitPrice = getUnitPrice(product, quantity);
    return [{
      product,
      quantity,
      unitPrice,
      lineTotal: quantity * unitPrice,
      stockApplied: product.stockPrice !== null && unitPrice === product.stockPrice,
    }];
  });

  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + line.lineTotal, 0),
  };
}

/**
 * Plain-text order message. The customer edits this before sending, so it
 * asks for the details the shop needs rather than collecting them here.
 */
export function buildWhatsAppMessage(summary) {
  const productLines = summary.lines.map(({ product, quantity, unitPrice }) =>
    `• ${quantity} × ${product.messageName}${quantity === 1 ? "" : "s"} at R${unitPrice} each`
  );
  return [
    "Hello The Ice Hub, I would like to order:",
    "",
    ...productLines,
    "",
    `Estimated total: R${summary.total}`,
    "",
    "Delivery or collection: please confirm",
    "Delivery address: please add",
    "Preferred date and time: please add",
    "",
    "Please confirm availability and the final total.",
  ].join("\n");
}

/** wa.me deep link with the encoded order text. */
export function buildWhatsAppUrl(summary) {
  const url = new URL(`https://wa.me/${SHOP.whatsappDigits}`);
  url.searchParams.set("text", buildWhatsAppMessage(summary));
  return url.toString();
}