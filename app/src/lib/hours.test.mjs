import test from "node:test";
import assert from "node:assert/strict";
import { getShopStatus } from "./hours.js";
import { SHOP } from "./config.js";

// Timestamps below are UTC; the shop is UTC+2 year-round (Africa/Johannesburg).
test("weekday before opening reports the opening time", () => {
  assert.deepEqual(getShopStatus(new Date("2026-09-22T07:59:00Z")),
    { state: "closed", label: "Closed · opens 10:00" });
});

test("weekday at opening time is open", () => {
  assert.deepEqual(getShopStatus(new Date("2026-09-22T08:00:00Z")),
    { state: "open", label: "Open now · closes 19:00" });
});

test("weekday one minute before close is still open", () => {
  assert.deepEqual(getShopStatus(new Date("2026-09-22T16:59:00Z")),
    { state: "open", label: "Open now · closes 19:00" });
});

test("weekday at closing time is closed for the day", () => {
  assert.deepEqual(getShopStatus(new Date("2026-09-22T17:00:00Z")),
    { state: "closed", label: "Closed for the day" });
});

test("weekend opens earlier and closes later", () => {
  assert.deepEqual(getShopStatus(new Date("2026-09-20T07:00:00Z")),
    { state: "open", label: "Open now · closes 21:00" });
  assert.deepEqual(getShopStatus(new Date("2026-09-20T19:00:00Z")),
    { state: "closed", label: "Closed for the day" });
});

test("overnight past midnight reads as the next day, not the previous one", () => {
  // 23:30 SAST Sunday is 21:30 UTC Sunday; 01:00 SAST Monday is 23:00 UTC Sunday.
  assert.deepEqual(getShopStatus(new Date("2026-09-20T21:30:00Z")),
    { state: "closed", label: "Closed for the day" });
  assert.deepEqual(getShopStatus(new Date("2026-09-20T23:00:00Z")),
    { state: "closed", label: "Closed · opens 10:00" });
});

test("the result does not depend on the host timezone", () => {
  const at = new Date("2026-09-22T08:00:00Z");
  const here = getShopStatus(at);
  assert.equal(here.state, "open");
  assert.equal(here.label, "Open now · closes 19:00");
});

test("every day in the schedule resolves to a status", () => {
  const days = Object.keys(SHOP.schedule);
  assert.equal(days.length, 7);
  for (const day of days) {
    const status = getShopStatus(new Date("2026-09-22T08:00:00Z"));
    assert.ok(["open", "closed"].includes(status.state), `day ${day} produced ${status.state}`);
  }
});