/* The Ice Hub — open-now status.
 * Computes whether the shop is currently open. The shop's timezone and
 * weekly schedule are configured in site/config.js (Africa/Johannesburg).
 * The status is announced via aria-live="polite" so screen readers
 * pick it up.
 */

import { SHOP } from "../config.js";

const fmt = new Intl.DateTimeFormat("en-ZA", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: SHOP.timezone,
});

function minutesNowInShopTz() {
  const parts = fmt.formatToParts(new Date());
  const hh = Number(parts.find((p) => p.type === "hour").value);
  const mm = Number(parts.find((p) => p.type === "minute").value);
  const hour = hh === 24 ? 0 : hh;
  return hour * 60 + mm;
}

function dayInShopTz() {
  const d = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: SHOP.timezone,
  }).format(new Date());
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[d] ?? 0;
}

function status() {
  const day = dayInShopTz();
  const now = minutesNowInShopTz();
  const row = SHOP.schedule[day];
  if (!row) return { state: "closed", label: "Closed today" };
  if (now >= row.open && now < row.close) {
    const closes = fmt.format(new Date(Date.now() + (row.close - now) * 60_000));
    return { state: "open", label: `Open now \u00b7 closes ${closes}` };
  }
  if (now < row.open) {
    const opens = new Date();
    opens.setHours(Math.floor(row.open / 60), row.open % 60, 0, 0);
    const t = fmt.format(opens);
    return { state: "closed", label: `Closed \u00b7 opens ${t}` };
  }
  return { state: "closed", label: "Closed for the day" };
}

function paint() {
  const el = document.querySelector("[data-open-status]");
  if (!el) return;
  const s = status();
  el.dataset.openStatus = s.state;
  el.textContent = s.label;
}

paint();
setInterval(paint, 60_000);