import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SHOP } from "../lib/config.js";
import { buildWhatsAppUrl, calculateOrder } from "../lib/order.js";

/* The Ice Hub — order interface (ported from site/scripts/order-ui.js).
 * All pricing and message rules live in order.js and are unit-tested there.
 * This hook only holds quantities and derives everything else. */

const productById = new Map(SHOP.products.map((p) => [p.id, p]));

/** wa.me deep link with the full order, or the bare number when it is empty. */
function hrefFor(summary) {
  if (summary.itemCount === 0) return `https://wa.me/${SHOP.whatsappDigits}`;
  return buildWhatsAppUrl(summary);
}

/* Order state. `announcement` feeds the `role=status` paragraph in App:
 * crossing a product's bulk threshold is the one interaction that carries
 * information (the price visibly changes), so it is announced politely —
 * once, on the crossing itself, never on every repaint. */
export function useOrder() {
  const [quantities, setQuantities] = useState({});
  const [announcement, setAnnouncement] = useState("");
const bulkRef = useRef({});

  const summary = useMemo(() => calculateOrder(SHOP.products, quantities), [quantities]);
  const href = useMemo(() => hrefFor(summary), [summary]);

  const setQuantity = useCallback((id, next) => {
    const product = productById.get(id);
    if (!product) return;
    setQuantities((prev) => {
      // `next` may be a quantity or an updater of the previous quantity, so
      // two steppers fired inside one batch never read a stale value.
      const raw = typeof next === "function" ? next(prev[id] ?? 0) : next;
      const value = Math.max(0, Math.trunc(Number(raw) || 0));
      if (value === (prev[id] ?? 0)) return prev;
      return { ...prev, [id]: value };
    });
  }, []);

  // Announce bulk-threshold crossings. The ref holds the previous at-bulk
  // flags so the message fires exactly on each upward crossing.
  useEffect(() => {
    const flags = bulkRef.current;
    for (const product of SHOP.products) {
      if (product.stockPrice === null || product.stockThreshold === null) continue;
      const atBulk = (quantities[product.id] ?? 0) >= product.stockThreshold;
      if (atBulk && !flags[product.id]) {
        const total = calculateOrder(SHOP.products, quantities).total;
        setAnnouncement(
          `${product.messageName} stock price applied: R${product.stockPrice} each for the whole line. Estimated total R${total}.`,
        );
      }
      flags[product.id] = atBulk;
    }
  }, [quantities]);

  return { quantities, summary, setQuantity, href, announcement };
}
