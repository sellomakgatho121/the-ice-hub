import { useEffect, useState } from "react";
import { getShopStatus } from "../lib/hours.js";

/* The Ice Hub — live shop status (ported from site/scripts/hours.js).
 * Starts deterministic so the prerendered HTML and the hydrated markup
 * agree; the zoned clock read happens only after mount, then every minute.
 */
export function useShopStatus() {
  const [status, setStatus] = useState({ state: "checking", label: "Checking hours" });

  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (alive) setStatus(getShopStatus());
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}
