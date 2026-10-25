import { SHOP } from "./config.js";

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const zonedParts = new Intl.DateTimeFormat("en-ZA", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: SHOP.timezone,
});

const hhmm = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * Shop status for an instant. Derives the weekday and clock entirely from
 * zoned parts of `date`, so a visitor's own timezone cannot shift the answer.
 * Never throws: an unresolvable timezone or schedule row yields "closed".
 */
export function getShopStatus(date = new Date()) {
  let day;
  let now;
  try {
    const parts = zonedParts.formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    day = WEEKDAY_INDEX[get("weekday")] ?? 0;
    const hour = Number(get("hour")) % 24;
    now = hour * 60 + Number(get("minute"));
  } catch {
    return { state: "closed", label: "Status unavailable" };
  }

  const row = SHOP.schedule[day];
  if (!row) return { state: "closed", label: "Closed today" };
  if (now < row.open) return { state: "closed", label: `Closed · opens ${hhmm(row.open)}` };
  if (now < row.close) return { state: "open", label: `Open now · closes ${hhmm(row.close)}` };
  return { state: "closed", label: "Closed for the day" };
}
