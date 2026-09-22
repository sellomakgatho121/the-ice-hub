/* The Ice Hub — pre-order form.
 * POSTs to Web3Forms. Until the operator pastes a real access key in
 * site/config.js the form runs in DEMO mode (validation runs, no network).
 *
 * Web3Forms contract (https://web3forms.com/):
 *   - POST https://api.web3forms.com/submit
 *   - application/x-www-form-urlencoded
 *   - access_key  required
 *   - subject     optional, becomes the email subject
 *   - from_name   optional
 *   - botcheck    empty string = human; anything = bot
 *   - honeypot    "website" field, must be empty
 *   - redirect    false (we render our own confirmation)
 */

import { SHOP, isDemoMode } from "../config.js";

const form = document.querySelector(".reserve__form");
const hint = document.querySelector("[data-reserve-hint]");
const year = document.querySelector("[data-year]");

if (year) year.textContent = String(new Date().getFullYear());

if (form) {
  if (isDemoMode) {
    hint.textContent = "Demo mode. Add your Web3Forms key in site/config.js to enable submissions.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = (data.get("email") || "").toString().trim();
    const order = (data.get("order") || "").toString();

    // honeypot — if the hidden field is filled, silently bail
    const honeypot = (data.get("website") || "").toString();
    if (honeypot) {
      hint.textContent = "Thanks. We will be in touch.";
      form.reset();
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      hint.textContent = "Enter a valid email so we can confirm your pre-order.";
      form.querySelector('input[name="email"]').focus();
      return;
    }
    if (!order) {
      hint.textContent = "Pick what you need from the dropdown.";
      form.querySelector('select[name="order"]').focus();
      return;
    }

    const submit = form.querySelector("button[type=submit]");
    submit.disabled = true;
    const originalLabel = submit.textContent;
    submit.textContent = "Sending…";

    if (isDemoMode) {
      // No network. Still validate and reset so the operator can test UX.
      await new Promise((r) => setTimeout(r, 350));
      hint.textContent = `Demo mode \u00b7 no email was sent. ${order} would go to ${email}.`;
      submit.textContent = originalLabel;
      submit.disabled = false;
      form.reset();
      return;
    }

    // Build a FormData so Web3Forms gets a multipart body if it prefers one.
    const payload = new FormData();
    payload.set("access_key", SHOP.web3formsKey);
    payload.set("subject", `${SHOP.emailSubjectPrefix} \u00b7 ${order}`);
    payload.set("from_name", "The Ice Hub website");
    payload.set("replyto", email);
    payload.set("email", email);
    payload.set("order", order);
    payload.set("notify", SHOP.notifyEmail);
    payload.set("botcheck", "");
    payload.set("redirect", "false");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: payload,
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.success === true || json.message === "OK")) {
        hint.textContent = `Pre-order received. We will email ${email} to confirm collection.`;
        submit.textContent = "Sent";
        form.reset();
        setTimeout(() => { submit.textContent = originalLabel; submit.disabled = false; }, 4000);
      } else {
        throw new Error(json.message || `HTTP ${res.status}`);
      }
    } catch (err) {
      hint.textContent = `Could not send \u00b7 ${err.message}. Please call +27 81 859 2919.`;
      submit.textContent = originalLabel;
      submit.disabled = false;
    }
  });
}