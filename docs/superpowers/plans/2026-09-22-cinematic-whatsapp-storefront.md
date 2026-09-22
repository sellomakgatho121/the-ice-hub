# Cinematic WhatsApp Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current editorial ice story and email preorder form with an accessible, cinematic, scroll-driven storefront that calculates product totals and opens a ready-to-send WhatsApp order.

**Architecture:** Keep the existing static HTML, CSS, and native ES-module architecture. Put product and shop facts in `config.js`, pure pricing/message behavior in a new `order.js`, reel rendering in `reel.js`, page choreography in `motion.js`, and SAST status in `hours.js`; verify pure behavior with Node's built-in test runner and the complete experience with Playwright and axe.

**Tech Stack:** Semantic HTML5, CSS, native JavaScript ES modules, Node.js 20+, `node:test`, Playwright 1.62+, axe-core 4.13+, Python static server

**Spec:** `docs/superpowers/specs/2026-09-22-ice-hub-redesign-design.md`

## Global Constraints

- Keep the existing static HTML, CSS, and native JavaScript architecture; do not add a framework, animation library, commerce backend, CMS, or WebGL experience.
- Use the current self-hosted Bricolage Grotesque Variable, Instrument Sans Variable, and JetBrains Mono fonts.
- Use the existing local SVG icon sprite; do not add an external icon dependency.
- Use **The Ice Hub** consistently, sentence case for copy, and no visible em dashes.
- Use amber only for primary ordering actions; reserve mineral blue for progress, links, focus, and technical details.
- Public catalog: 2 kg ice-cube bag at R17 or R10 each for 20+; 3 kg ice-cube bag at R22 or R12 each for 20+; 30 kg ice block at R55.
- Order destination: WhatsApp `+27 81 859 2919`; describe totals as estimates and delivery as exactly “Free delivery around Tembisa.”
- Support widths from 320 px upward with no horizontal overflow and at least 44 by 44 CSS pixel controls.
- Preserve static hours, contact details, directions, and product-specific WhatsApp links when JavaScript is unavailable.
- Respect `prefers-reduced-motion` from first render and keep all commercial information outside atmospheric imagery.
- Meet WCAG 2.2 AA for text, controls, focus states, and overlays.

## File Structure

- Modify `site/config.js`: canonical shop contact, schedule, delivery copy, and three-product catalog.
- Create `site/scripts/order.js`: pure pricing/message functions plus DOM enhancement for the product builder.
- Create `site/scripts/order.test.mjs`: deterministic unit tests for prices, totals, and WhatsApp URLs.
- Modify `site/index.html`: complete semantic storefront, static no-JavaScript links, cinematic scenes, practical information, and live regions.
- Rewrite `site/styles.css`: responsive visual system, hero scenes, product builder, service triptych, practical close, and reduced-motion composition.
- Modify `site/scripts/reel.js`: progressive frame loading, deterministic scroll mapping, scene state, and nearest-frame fallback.
- Modify `site/scripts/motion.js`: header state, page progress, active navigation, reveal orchestration, and footer year.
- Modify `site/scripts/hours.js`: testable SAST status calculation and rendering for every status target.
- Modify `site/scripts/map.js`: retain opt-in OpenStreetMap behavior and use the static external directions link as the primary path.
- Rewrite `site/scripts/verify.mjs`: integrated desktop, mobile, reduced-motion, failure, keyboard, order, and axe verification.
- Modify `site/package.json`: add unit and combined verification commands.
- Modify `site/README.md`: document the implemented experience, files, local workflow, and verification.
- Modify `README.md`: document the repository and point to the approved specification and plan.
- Delete `site/scripts/crystal.js`, `site/scripts/form.js`, and `site/vendor/three.module.min.js` after references are removed and verification passes.
- Delete `lab/web3forms-setup.md` after the email integration is removed.

---

### Task 1: Canonical catalog and order-domain behavior

**Files:**
- Modify: `site/config.js:1-44`
- Create: `site/scripts/order.js`
- Create: `site/scripts/order.test.mjs`
- Modify: `site/package.json:5-8`

**Interfaces:**
- Produces: `SHOP.whatsappDigits: string`, `SHOP.whatsappDisplay: string`, `SHOP.deliveryClaim: string`, and `SHOP.products: readonly Product[]`.
- Produces: `getUnitPrice(product, quantity): number`, `calculateOrder(products, quantities): OrderSummary`, `buildWhatsAppMessage(summary): string`, and `buildWhatsAppUrl(summary): string` from `site/scripts/order.js`.
- `Product` shape: `{ id: string, name: string, messageName: string, standardPrice: number, stockPrice: number|null, stockThreshold: number|null, use: string }`.
- `OrderSummary` shape: `{ lines: Array<{ product, quantity, unitPrice, lineTotal, stockApplied }>, itemCount: number, total: number }`.

- [ ] **Step 1: Add failing order-domain tests**

Create `site/scripts/order.test.mjs` with concrete checks for the two price tiers, mixed totals, empty selections, message text, and destination number:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { SHOP } from "../config.js";
import {
  getUnitPrice,
  calculateOrder,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "./order.js";

const byId = Object.fromEntries(SHOP.products.map((product) => [product.id, product]));

test("bag pricing changes for the full line at 20 bags", () => {
  assert.equal(getUnitPrice(byId["cubes-2kg"], 19), 17);
  assert.equal(getUnitPrice(byId["cubes-2kg"], 20), 10);
  assert.equal(getUnitPrice(byId["cubes-3kg"], 19), 22);
  assert.equal(getUnitPrice(byId["cubes-3kg"], 20), 12);
});

test("block pricing remains fixed", () => {
  assert.equal(getUnitPrice(byId["block-30kg"], 1), 55);
  assert.equal(getUnitPrice(byId["block-30kg"], 30), 55);
});

test("mixed order summary counts items and applies stock pricing", () => {
  const summary = calculateOrder(SHOP.products, {
    "cubes-2kg": 20,
    "cubes-3kg": 0,
    "block-30kg": 2,
  });
  assert.equal(summary.itemCount, 22);
  assert.equal(summary.total, 310);
  assert.deepEqual(summary.lines.map(({ quantity, unitPrice, lineTotal }) => ({ quantity, unitPrice, lineTotal })), [
    { quantity: 20, unitPrice: 10, lineTotal: 200 },
    { quantity: 2, unitPrice: 55, lineTotal: 110 },
  ]);
});

test("empty and invalid quantities do not create order lines", () => {
  const summary = calculateOrder(SHOP.products, {
    "cubes-2kg": -1,
    "cubes-3kg": Number.NaN,
    "block-30kg": 0,
  });
  assert.deepEqual(summary, { lines: [], itemCount: 0, total: 0 });
});

test("message identifies prices as estimated and asks for fulfillment details", () => {
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

test("WhatsApp URL uses the configured international digits and encoded message", () => {
  const summary = calculateOrder(SHOP.products, { "cubes-3kg": 1 });
  const url = new URL(buildWhatsAppUrl(summary));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/27818592919");
  assert.match(url.searchParams.get("text"), /1 × 3 kg ice-cube bag at R22 each/);
});
```

- [ ] **Step 2: Add the test command and confirm the expected failure**

Update `site/package.json` scripts to:

```json
{
  "serve": "python -m http.server 8000",
  "test": "node --test scripts/*.test.mjs",
  "verify:browser": "node scripts/verify.mjs",
  "verify": "npm test && npm run verify:browser"
}
```

Run: `cd site && npm test`

Expected: FAIL because `scripts/order.js` does not exist and the new catalog fields are not defined.

- [ ] **Step 3: Replace deployment configuration with shop and catalog facts**

Keep `address`, `geocodeQuery`, `fallbackLatLng`, `timezone`, and `schedule`, remove all Web3Forms and email-submission fields, then add:

```js
export const SHOP = {
  whatsappDigits: "27818592919",
  whatsappDisplay: "+27 81 859 2919",
  deliveryClaim: "Free delivery around Tembisa",
  address: "9605 Winnie Mandela Zone 4, Raymond Mhlaba Street, Tembisa 1632, South Africa",
  geocodeQuery: "Tembisa, Gauteng, South Africa",
  fallbackLatLng: [-26.0096119, 28.2313797],
  timezone: "Africa/Johannesburg",
  schedule: {
    0: { open: 9 * 60, close: 21 * 60 },
    1: { open: 10 * 60, close: 19 * 60 },
    2: { open: 10 * 60, close: 19 * 60 },
    3: { open: 10 * 60, close: 19 * 60 },
    4: { open: 10 * 60, close: 19 * 60 },
    5: { open: 10 * 60, close: 19 * 60 },
    6: { open: 9 * 60, close: 21 * 60 },
  },
  products: [
    { id: "cubes-2kg", name: "2 kg ice cubes", messageName: "2 kg ice-cube bag", standardPrice: 17, stockPrice: 10, stockThreshold: 20, use: "Everyday" },
    { id: "cubes-3kg", name: "3 kg ice cubes", messageName: "3 kg ice-cube bag", standardPrice: 22, stockPrice: 12, stockThreshold: 20, use: "Events" },
    { id: "block-30kg", name: "30 kg ice block", messageName: "30 kg ice block", standardPrice: 55, stockPrice: null, stockThreshold: null, use: "Venues" },
  ],
};
```

- [ ] **Step 4: Implement the pure order-domain functions**

Create the first half of `site/scripts/order.js`:

```js
import { SHOP } from "../config.js";

export function getUnitPrice(product, quantity) {
  return product.stockPrice !== null && quantity >= product.stockThreshold
    ? product.stockPrice
    : product.standardPrice;
}

export function calculateOrder(products, quantities) {
  const lines = products.flatMap((product) => {
    const quantity = Number.isFinite(Number(quantities[product.id]))
      ? Math.max(0, Math.trunc(Number(quantities[product.id])))
      : 0;
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

export function buildWhatsAppUrl(summary) {
  const url = new URL(`https://wa.me/${SHOP.whatsappDigits}`);
  url.searchParams.set("text", buildWhatsAppMessage(summary));
  return url.toString();
}
```

- [ ] **Step 5: Run unit tests**

Run: `cd site && npm test`

Expected: six tests PASS.

- [ ] **Step 6: Commit the order domain**

```bash
git add site/config.js site/scripts/order.js site/scripts/order.test.mjs site/package.json
git commit -m "feat: define WhatsApp order domain"
```

### Task 2: Semantic storefront and no-JavaScript ordering path

**Files:**
- Modify: `site/index.html:1-209`
- Test: `site/scripts/verify.mjs`

**Interfaces:**
- Consumes: `SHOP.products` and the order functions established in Task 1.
- Produces: stable selectors `[data-hero]`, `[data-scene]`, `[data-product]`, `[data-quantity]`, `[data-order-summary]`, `[data-order-live]`, `[data-open-status]`, `[data-map]`, and `[data-reveal]`.
- Each `[data-product]` carries a `data-product` value matching one `SHOP.products[].id`.

- [ ] **Step 1: Add a failing semantic smoke check**

At the beginning of the browser flow in `site/scripts/verify.mjs`, replace the old section assumptions with:

```js
const semantic = await page.evaluate(() => ({
  title: document.title,
  productIds: [...document.querySelectorAll("[data-product]")].map((node) => node.dataset.product),
  directOrders: [...document.querySelectorAll("[data-direct-order]")].map((node) => node.href),
  scenes: document.querySelectorAll("[data-scene]").length,
  hasCrystal: Boolean(document.querySelector("[data-crystal]")),
  hasEmailForm: Boolean(document.querySelector(".reserve__form")),
  staticHours: document.querySelector(".schedule")?.textContent ?? "",
}));
assert.deepEqual(semantic.productIds, ["cubes-2kg", "cubes-3kg", "block-30kg"]);
assert.equal(semantic.directOrders.length, 3);
assert.ok(semantic.directOrders.every((href) => href.startsWith("https://wa.me/27818592919")));
assert.equal(semantic.scenes, 4);
assert.equal(semantic.hasCrystal, false);
assert.equal(semantic.hasEmailForm, false);
assert.match(semantic.staticHours, /Monday to Friday/);
assert.match(semantic.staticHours, /Saturday to Sunday/);
```

- [ ] **Step 2: Run the browser verifier and confirm it fails on the old markup**

Run the server in one terminal: `cd site && npm run serve`

Run: `cd site && npm run verify:browser`

Expected: FAIL because there are five old products, no four-scene hero, and obsolete crystal/form markup remains.

- [ ] **Step 3: Replace the document metadata, header, and cinematic hero**

Rewrite `site/index.html` so the head uses the approved title and description, preloads frame 001 and the two primary fonts, and the body starts with:

```html
<a class="skip" href="#main">Skip to content</a>
<header class="topbar" data-header>
  <a class="brand" href="#top" aria-label="The Ice Hub home" translate="no">The Ice Hub</a>
  <nav class="nav" aria-label="Primary navigation">
    <a href="#products" data-nav="products">Products</a>
    <a href="#delivery" data-nav="delivery">Delivery</a>
    <a href="#visit" data-nav="visit">Visit</a>
  </nav>
  <p class="topbar__status"><span aria-hidden="true"></span><span data-open-status>Status unavailable</span></p>
  <a class="nav__cta" href="#products">Order on WhatsApp</a>
  <div class="topbar__meter" aria-hidden="true"><span data-page-progress></span></div>
</header>
<main id="main" tabindex="-1">
  <section id="top" class="hero" data-hero aria-labelledby="hero-title">
    <div class="hero__stage">
      <div class="hero__media" aria-hidden="true">
        <img id="reel-img" src="assets/reel/ezgif-frame-001.jpg" alt="" width="1280" height="720" decoding="async" fetchpriority="high">
      </div>
      <div class="hero__veil" aria-hidden="true"></div>
      <div class="hero__grid">
        <div class="hero-scene" data-scene="recognition">
          <p class="eyebrow">Ice cubes · Ice blocks · Tembisa</p>
          <h1 id="hero-title">Cold.<span>On command.</span></h1>
          <p>For the everyday run, the full guest list and the venues that cannot run out.</p>
        </div>
        <div class="hero-scene" data-scene="compression" aria-hidden="true">
          <p class="eyebrow">Made to move</p><h2>From one bag<span>to twenty.</span></h2>
          <p>Single orders when you need them. Stock pricing when the occasion demands more.</p>
        </div>
        <div class="hero-scene" data-scene="release" aria-hidden="true">
          <p class="eyebrow">Free delivery around Tembisa</p><h2>More cold.<span>Less waiting.</span></h2>
        </div>
        <div class="hero-scene" data-scene="conversion" aria-hidden="true">
          <p class="eyebrow">Order in under a minute</p><h2>Choose it.<span>Send it.</span></h2>
          <a class="hero__order" href="#products">Start a WhatsApp order</a>
        </div>
      </div>
      <div class="hero__progress" aria-hidden="true"><span data-reel-bar></span></div>
      <p class="frame-index" aria-hidden="true"><span data-frame-index>001</span> / 040</p>
    </div>
  </section>
```

- [ ] **Step 4: Add the product builder with real prices and direct fallbacks**

Add `#products` with exactly three `article[data-product]` elements. Each article contains its product name, standard price, stock price when applicable, a decrement button, `<output data-quantity>0</output>`, increment button, add button, and a direct link whose encoded starter text names that product:

```html
<a data-direct-order href="https://wa.me/27818592919?text=Hello%20The%20Ice%20Hub%2C%20I%20would%20like%20to%20order%202%20kg%20ice-cube%20bags.%20Please%20confirm%20availability%20and%20the%20final%20total.">Order 2 kg bags directly</a>
```

Use equivalent links for 3 kg bags and 30 kg blocks. Add this summary after the product grid:

```html
<aside class="order-summary" data-order-summary hidden aria-label="Current order">
  <div><strong data-order-count>0 items selected</strong><small data-order-detail></small></div>
  <strong data-order-total>R0</strong>
  <a data-order-whatsapp href="https://wa.me/27818592919">Continue on WhatsApp</a>
</aside>
<p class="sr-only" data-order-live aria-live="polite"></p>
```

- [ ] **Step 5: Add audience, delivery, hours, visit, and footer sections**

Add `#delivery` with three audience cards for Everyday essentials, Built for the guest list, and Supply that stays ready. Add `#visit` containing the static schedule, the confirmed address, `tel:+27818592919`, a direct WhatsApp link, the exact delivery claim, the existing `[data-map]` opt-in container, and a final anchor back to `#products`. Preserve `[data-year]` in the footer.

- [ ] **Step 6: Load only the required modules**

End the document with:

```html
<script type="module" src="scripts/reel.js"></script>
<script type="module" src="scripts/motion.js"></script>
<script type="module" src="scripts/order.js"></script>
<script type="module" src="scripts/hours.js"></script>
<script type="module" src="scripts/map.js"></script>
```

Remove references to `scripts/crystal.js` and `scripts/form.js`.

- [ ] **Step 7: Run the semantic smoke check**

Run: `cd site && npm run verify:browser`

Expected: the new semantic checks PASS; visual/layout checks may still fail until later tasks.

- [ ] **Step 8: Commit semantic storefront markup**

```bash
git add site/index.html site/scripts/verify.mjs
git commit -m "feat: add semantic cinematic storefront"
```

### Task 3: Interactive order builder and WhatsApp handoff

**Files:**
- Modify: `site/scripts/order.js`
- Modify: `site/scripts/verify.mjs`

**Interfaces:**
- Consumes: the pure functions from Task 1 and the selectors from Task 2.
- Produces: `initOrderBuilder(root = document): void`; product cards receive `data-stock-active="true|false"` and the order summary receives `hidden` plus a current WhatsApp `href`.

- [ ] **Step 1: Add failing Playwright order scenarios**

Add a browser verification block that:

```js
const twoKg = page.locator('[data-product="cubes-2kg"]');
await twoKg.locator('[data-action="increment"]').click({ clickCount: 19 });
assert.equal(await twoKg.locator('[data-quantity]').textContent(), "19");
assert.equal(await page.locator('[data-order-total]').textContent(), "R323");
assert.equal(await twoKg.getAttribute("data-stock-active"), "false");
await twoKg.locator('[data-action="increment"]').click();
assert.equal(await page.locator('[data-order-total]').textContent(), "R200");
assert.equal(await twoKg.getAttribute("data-stock-active"), "true");
await page.locator('[data-product="block-30kg"] [data-action="increment"]').click({ clickCount: 2 });
assert.equal(await page.locator('[data-order-total]').textContent(), "R310");
const href = await page.locator('[data-order-whatsapp]').getAttribute("href");
const orderUrl = new URL(href);
assert.equal(orderUrl.pathname, "/27818592919");
assert.match(orderUrl.searchParams.get("text"), /20 × 2 kg ice-cube bags at R10 each/);
assert.match(orderUrl.searchParams.get("text"), /2 × 30 kg ice blocks at R55 each/);
```

Also decrement the 2 kg count 21 times and assert it stops at zero.

- [ ] **Step 2: Run the browser verifier and confirm interaction failure**

Run: `cd site && npm run verify:browser`

Expected: FAIL because the controls do not update quantities or totals.

- [ ] **Step 3: Implement DOM enhancement in `order.js`**

Append:

```js
export function initOrderBuilder(root = document) {
  const cards = [...root.querySelectorAll("[data-product]")];
  const summaryElement = root.querySelector("[data-order-summary]");
  if (!cards.length || !summaryElement) return;
  const products = new Map(SHOP.products.map((product) => [product.id, product]));
  const quantities = Object.fromEntries(SHOP.products.map((product) => [product.id, 0]));
  const live = root.querySelector("[data-order-live]");

  const render = (announcement = "") => {
    const summary = calculateOrder(SHOP.products, quantities);
    cards.forEach((card) => {
      const product = products.get(card.dataset.product);
      const quantity = quantities[product.id];
      card.querySelector("[data-quantity]").value = quantity;
      card.querySelector("[data-quantity]").textContent = quantity;
      card.dataset.stockActive = String(product.stockPrice !== null && quantity >= product.stockThreshold);
    });
    summaryElement.hidden = summary.itemCount === 0;
    root.querySelector("[data-order-count]").textContent = `${summary.itemCount} item${summary.itemCount === 1 ? "" : "s"} selected`;
    root.querySelector("[data-order-detail]").textContent = summary.lines.map((line) => `${line.quantity} × ${line.product.name}`).join(" · ");
    root.querySelector("[data-order-total]").textContent = `R${summary.total}`;
    root.querySelector("[data-order-whatsapp]").href = summary.lines.length ? buildWhatsAppUrl(summary) : `https://wa.me/${SHOP.whatsappDigits}`;
    if (announcement && live) live.textContent = `${announcement}. Estimated total R${summary.total}.`;
  };

  cards.forEach((card) => {
    const product = products.get(card.dataset.product);
    if (!product) return;
    card.querySelector('[data-action="decrement"]').addEventListener("click", () => {
      quantities[product.id] = Math.max(0, quantities[product.id] - 1);
      render(`${product.name} quantity ${quantities[product.id]}`);
    });
    card.querySelector('[data-action="increment"]').addEventListener("click", () => {
      quantities[product.id] += 1;
      const stock = product.stockPrice !== null && quantities[product.id] === product.stockThreshold;
      render(stock ? `${product.name} stock price activated` : `${product.name} quantity ${quantities[product.id]}`);
    });
    card.querySelector('[data-action="add"]').addEventListener("click", () => {
      if (quantities[product.id] === 0) quantities[product.id] = 1;
      render(`${product.name} added to order`);
    });
  });
  render();
}

if (typeof document !== "undefined") initOrderBuilder();
```

- [ ] **Step 4: Run unit and browser tests**

Run: `cd site && npm test && npm run verify:browser`

Expected: unit tests PASS and order scenarios PASS; later visual checks may remain pending.

- [ ] **Step 5: Commit the order interface**

```bash
git add site/scripts/order.js site/scripts/verify.mjs
git commit -m "feat: build WhatsApp order interaction"
```

### Task 4: Progressive cinematic reel and four-scene choreography

**Files:**
- Modify: `site/scripts/reel.js:1-89`
- Modify: `site/scripts/verify.mjs`

**Interfaces:**
- Consumes: `[data-hero]`, `#reel-img`, `[data-reel-bar]`, `[data-frame-index]`, and four `[data-scene]` elements.
- Produces: `frameForProgress(progress): number`, `sceneForProgress(progress): number`, body state `ready|still`, hero CSS custom property `--hero-p`, and one active scene marked `data-active="true"`.

- [ ] **Step 1: Add failing reel state checks**

For desktop, sample hero progress at `0`, `.24`, `.26`, `.51`, `.76`, and `1`. Record frame source, active scene, and `--hero-p`; assert:

```js
assert.equal(new Set(states.map((state) => state.frame)).size, 6);
assert.deepEqual(states.map((state) => state.scene), [
  "recognition", "recognition", "compression", "release", "conversion", "conversion",
]);
assert.ok(states.every((state) => Number(state.progress) >= 0 && Number(state.progress) <= 1));
```

Block frame 020 and assert the hero retains a loaded frame with nonzero `naturalWidth` and records no uncaught page error.

- [ ] **Step 2: Run the verifier and confirm scene/fallback failures**

Run: `cd site && npm run verify:browser`

Expected: FAIL because old reel code does not drive scene state or nearest-frame fallback.

- [ ] **Step 3: Refactor reel calculation and loading**

In `reel.js`, export and use:

```js
const TOTAL = 40;
const REDUCED_FRAME = 21;
const clamp = (value) => Math.min(1, Math.max(0, value));
export const frameForProgress = (progress) => Math.round(1 + clamp(progress) * (TOTAL - 1));
export const sceneForProgress = (progress) => Math.min(3, Math.floor(clamp(progress) * 4));
```

Preload frames 1 through 6 immediately, then warm nearby frames around the current index before warming the rest during idle time. Track successfully loaded frame numbers in a `Set`. When the requested frame errors, select the loaded frame with the smallest absolute numeric distance. Update the image, index label, progress bar, `--hero-p`, and active scene in one `requestAnimationFrame` callback.

- [ ] **Step 4: Make scene accessibility state follow visual state**

For each paint, apply `data-active="true"` and remove `aria-hidden` only on the active scene; set `data-active="false"` and `aria-hidden="true"` on the remaining scenes. In reduced motion, use frame 21, activate the recognition scene, and set `document.body.dataset.state = "still"`.

- [ ] **Step 5: Run reel, fallback, and reduced-motion checks**

Run: `cd site && npm run verify:browser`

Expected: six distinct frames, the expected four-scene sequence, nearest-frame fallback, and static reduced state all PASS.

- [ ] **Step 6: Commit cinematic reel behavior**

```bash
git add site/scripts/reel.js site/scripts/verify.mjs
git commit -m "feat: choreograph cinematic hero reel"
```

### Task 5: Responsive avant-garde visual system

**Files:**
- Rewrite: `site/styles.css:1-end`
- Modify: `site/scripts/motion.js:1-51`
- Modify: `site/scripts/verify.mjs`

**Interfaces:**
- Consumes: semantic section classes and data attributes established in Task 2.
- Produces: `data-scrolled` on the header, `aria-current="location"` on the active navigation link, `data-visible="true"` on observed reveal elements, and responsive/reduced-motion layouts.

- [ ] **Step 1: Add failing layout, focus, target-size, and motion checks**

At 320, 390, 768, and 1440 px, assert no horizontal overflow, visible focus for the skip link, a minimum 44 px interactive target, and visible product prices. At 1440 px assert a three-column product grid; at 390 px assert one column and an order-summary bottom inset of at least 8 px. In reduced motion assert hero height is no more than one viewport plus 2 px, every scene transition duration is effectively zero, and no marquee animation runs.

- [ ] **Step 2: Run browser verification and confirm layout failures**

Run: `cd site && npm run verify:browser`

Expected: FAIL because the old stylesheet targets removed sections and does not style the storefront.

- [ ] **Step 3: Establish tokens, fonts, global layout, and focus treatment**

Rewrite the stylesheet beginning with the existing local `@font-face` sources and these tokens:

```css
:root {
  --ink-0: #071014;
  --ink-1: #0d181d;
  --ice-100: #f4f8fa;
  --ice-300: #b8c8cf;
  --ice-500: #7d96a0;
  --accent: #8fb8c4;
  --action: #d99e5a;
  --line-dark: rgb(25 49 58 / 22%);
  --line-light: rgb(202 225 234 / 18%);
  --ease-cinematic: cubic-bezier(.2, .78, .2, 1);
}
```

Add border-box sizing, dark background, self-hosted font assignments, a visually hidden utility, skip-link focus behavior, `:focus-visible` with a 3 px mineral-blue outline, and a centered content width using `min(1440px, calc(100% - 64px))`.

- [ ] **Step 4: Style the header and cinematic hero**

Use a fixed translucent header after `data-scrolled="true"`. Give `.hero` a desktop height near `390svh`, `.hero__stage` a sticky `100svh` stage, full-bleed cover imagery, contrast-preserving veils, and an asymmetric grid. Use Bricolage at fluid monumental sizes, one outlined line per scene, controlled scene opacity/translation, a desktop vertical progress rail, and frame index. Ensure pointer events remain available only on the active scene.

- [ ] **Step 5: Style the bright product counter and order summary**

Create an ice-white section, a three-column ruled product grid, oversized product names and prices, 44 px steppers, explicit stock-active presentation through `[data-stock-active="true"]`, and an amber WhatsApp action. Keep the hidden summary out of layout with `[hidden]{display:none!important}`. On desktop, fix the visible summary near the lower-right edge; include enough section/footer padding that it never covers final content.

- [ ] **Step 6: Style audience and practical sections**

Create the dark three-card photographic triptych, gradient text protection, a bright practical two-column close, static schedule, contact rows, opt-in map panel, and final full-width amber action. Keep copy readable without images.

- [ ] **Step 7: Add tablet, mobile, and reduced-motion compositions**

At 1023 px collapse complex overlays and allow one- or two-column layouts. At 599 px use `calc(100% - 32px)` shells, a shorter hero runway, mobile focal positions, stacked products/audiences, compact navigation, and a safe-area-aware bottom summary:

```css
.order-summary {
  bottom: max(12px, env(safe-area-inset-bottom));
}
```

Under reduced motion, make the hero one viewport, unpin the stage, show only recognition copy, disable transforms/transitions/animations, hide progress, and retain the product jump action.

- [ ] **Step 8: Replace obsolete motion logic**

Rewrite `motion.js` to schedule one update per animation frame, update global page progress, toggle header `data-scrolled`, assign active navigation according to section intersection, and set the footer year. Use an `IntersectionObserver` to set `data-visible="true"` on `[data-reveal]` elements; if reduced motion is active, mark them visible immediately. Remove all crack events, fracture percentages, and old product-to-email behavior.

- [ ] **Step 9: Run complete responsive and accessibility verification**

Run: `cd site && npm run verify`

Expected: unit, layout, reduced-motion, touch target, keyboard, and axe checks PASS at every viewport.

- [ ] **Step 10: Commit the visual system**

```bash
git add site/styles.css site/scripts/motion.js site/scripts/verify.mjs
git commit -m "feat: style cinematic responsive storefront"
```

### Task 6: Testable SAST status and resilient visit controls

**Files:**
- Modify: `site/scripts/hours.js:1-60`
- Modify: `site/scripts/map.js:1-153`
- Create: `site/scripts/hours.test.mjs`
- Modify: `site/scripts/verify.mjs`

**Interfaces:**
- Produces: `getShopStatus(date): { state: "open"|"closed", label: string }`.
- Consumes: all `[data-open-status]` targets, `[data-map]`, `SHOP.schedule`, `SHOP.timezone`, `SHOP.address`, and `SHOP.fallbackLatLng`.

- [ ] **Step 1: Write failing deterministic hours tests**

Create `site/scripts/hours.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { getShopStatus } from "./hours.js";

test("weekday opening, open, and closed states use Johannesburg time", () => {
  assert.deepEqual(getShopStatus(new Date("2026-09-22T07:59:00Z")), { state: "closed", label: "Closed · opens 10:00" });
  assert.deepEqual(getShopStatus(new Date("2026-09-22T08:00:00Z")), { state: "open", label: "Open now · closes 19:00" });
  assert.deepEqual(getShopStatus(new Date("2026-09-22T17:00:00Z")), { state: "closed", label: "Closed for the day" });
});

test("weekend schedule opens at 09:00 and closes at 21:00", () => {
  assert.deepEqual(getShopStatus(new Date("2026-09-20T07:00:00Z")), { state: "open", label: "Open now · closes 21:00" });
  assert.deepEqual(getShopStatus(new Date("2026-09-20T19:00:00Z")), { state: "closed", label: "Closed for the day" });
});
```

- [ ] **Step 2: Run unit tests and confirm current time formatting is not deterministic**

Run: `cd site && npm test`

Expected: FAIL because `getShopStatus` is not exported and current code derives closing times by adding durations to the visitor-local `Date`.

- [ ] **Step 3: Refactor status calculation around explicit zoned parts**

Export `getShopStatus(date = new Date())`. Build one `Intl.DateTimeFormat` with `weekday`, `hour`, and `minute` in `SHOP.timezone`, derive the weekday and minute count from `formatToParts(date)`, and format configured opening/closing minutes with a local `HH:MM` helper. Render the returned state and label into every `[data-open-status]`, then repaint every 60 seconds.

- [ ] **Step 4: Keep map loading opt-in and directions independent**

Retain the cached Nominatim lookup and fallback coordinates, but do not create an iframe or contact Nominatim until the user activates `[data-map-load]`. Keep the external directions anchor in static HTML. Build the opt-in button with DOM methods, preserve `rel="noopener noreferrer"`, and replace button text with “Loading map…” only during the explicit load.

- [ ] **Step 5: Verify no third-party map request occurs before consent**

In Playwright, collect requests after initial load and assert none target `nominatim.openstreetmap.org` or `/export/embed.html`. Click `[data-map-load]`, fulfill Nominatim with a fixed JSON result, and assert the iframe is created with an OpenStreetMap URL and a descriptive title.

- [ ] **Step 6: Run unit and browser verification**

Run: `cd site && npm run verify`

Expected: hours tests, map-consent checks, and all existing checks PASS.

- [ ] **Step 7: Commit practical information behavior**

```bash
git add site/scripts/hours.js site/scripts/hours.test.mjs site/scripts/map.js site/scripts/verify.mjs
git commit -m "feat: harden hours and visit information"
```

### Task 7: Failure modes, JavaScript-disabled path, and final browser gate

**Files:**
- Modify: `site/scripts/verify.mjs`
- Modify: `site/package.json`

**Interfaces:**
- Consumes all public DOM behavior completed in Tasks 1 through 6.
- Produces: `site/lab/shots/report.json` and representative screenshots for desktop, mobile, reduced motion, and reel fallback.

- [ ] **Step 1: Consolidate verifier helpers**

Keep `openPage(context, options)` responsible for page errors and first-render readiness. Add `record(name, details, ok)` that pushes one report step and throws an assertion on failure. Use separate contexts for desktop motion, reduced motion, mobile touch, blocked reel, and JavaScript disabled.

- [ ] **Step 2: Add the complete acceptance matrix**

The verifier must assert:

```js
const expected = {
  products: ["cubes-2kg", "cubes-3kg", "block-30kg"],
  prices: ["R17", "R22", "R55"],
  viewports: [320, 390, 768, 1440],
  whatsappPath: "/27818592919",
  frameCount: 40,
};
```

Check all 40 frame responses, four scene transitions, fallback when one and all later frames are blocked, exact 20-item thresholds, mixed total R310, encoded WhatsApp text, static hours, SAST status, opt-in map behavior, skip link, keyboard stepper operation, visible focus, 44 px targets, no overflow, local font completion, and zero page errors.

- [ ] **Step 3: Add JavaScript-disabled assertions**

Create a context with `javaScriptEnabled: false`; load the page and assert the three product names and prices, three direct WhatsApp anchors, full hours, address, phone link, delivery claim, directions link, and hero poster are visible. Do not wait for `body.dataset.state` in this context.

- [ ] **Step 4: Run axe in meaningful states**

Run axe with `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, and `wcag22aa` tags at the hero, product builder with an active stock price and visible summary, and visit section. Disable visual transitions before analysis but do not hide live controls.

- [ ] **Step 5: Capture review artifacts and write the report**

Write screenshots named `desktop-hero.png`, `desktop-products.png`, `desktop-visit.png`, `mobile-hero.png`, `mobile-products.png`, `reduced-hero.png`, and `reel-fallback.png`. Write structured results and page errors to `site/lab/shots/report.json`; exit with status 1 if any check fails.

- [ ] **Step 6: Run the final automated gate twice**

Run: `cd site && npm run verify`

Expected: PASS.

Run a second time: `cd site && npm run verify`

Expected: PASS again, proving cached map/reel state does not make the suite order-dependent.

- [ ] **Step 7: Commit final verification**

```bash
git add site/scripts/verify.mjs site/package.json site/lab/shots/report.json
git commit -m "test: verify cinematic storefront acceptance"
```

### Task 8: Remove obsolete integrations and document the implemented site

**Files:**
- Delete: `site/scripts/crystal.js`
- Delete: `site/scripts/form.js`
- Delete: `site/vendor/three.module.min.js`
- Delete: `lab/web3forms-setup.md`
- Modify: `site/README.md:1-end`
- Modify: `README.md:1-end`
- Modify: `.gitignore`

**Interfaces:**
- Produces public project documentation that matches the final code and points to the specification, implementation plan, and verification command.

- [ ] **Step 1: Prove obsolete files are unreferenced**

Run:

```bash
git grep -nE "crystal\.js|three\.module|form\.js|Web3Forms|web3formsKey|reserve__form" -- ':!docs/superpowers/**' ':!site/versions/**'
```

Expected: no matches in the active site or active documentation.

- [ ] **Step 2: Remove obsolete active-site dependencies**

Delete `site/scripts/crystal.js`, `site/scripts/form.js`, `site/vendor/three.module.min.js`, and `lab/web3forms-setup.md`. Keep archived `site/versions/` snapshots unchanged because they document prior designs.

- [ ] **Step 3: Rewrite site documentation**

Document in `site/README.md`:

- The commerce-first cinematic experience and four hero beats.
- The exact public product catalog and prices.
- The WhatsApp builder, pricing threshold, non-JavaScript links, SAST status, and opt-in map.
- The active file structure without Three.js or Web3Forms.
- `npm install`, `npm run serve`, `npm test`, and `npm run verify` commands.
- The browser acceptance matrix and output location.

- [ ] **Step 4: Update repository documentation and ignores**

In root `README.md`, identify `site/` as the deployable root, link the approved specification and this plan, list the verified business details, and link `BRAND.md` and `BRIEF.md` as supporting context. Add `.superpowers/`, `site/node_modules/`, temporary logs, and generated screenshot directories to `.gitignore`, while retaining the JSON verification report if it is intentionally committed.

- [ ] **Step 5: Run documentation and reference scans**

Run:

```bash
git grep -nE "spheres|cold drinks|10 kg|20 kg venue|Web3Forms|Three\.js|crystal" -- README.md site ':!site/versions/**' ':!docs/superpowers/**'
```

Expected: no obsolete active-product or integration claims.

Run:

```bash
git grep -n "—" -- README.md BRAND.md BRIEF.md site ':!site/versions/**'
```

Expected: no visible em dashes in active site copy or active project documentation.

- [ ] **Step 6: Run final verification after cleanup**

Run: `cd site && npm run verify`

Expected: PASS with no request for the deleted vendor module or removed scripts.

- [ ] **Step 7: Manually review the final experience**

Start `npm run serve`, inspect 390 by 844 and 1440 by 900 viewports, scrub the complete reel, cross both stock-price thresholds, open the generated WhatsApp URL without sending it, enable reduced motion, test keyboard navigation, and confirm copy against the 20 May 2026 pricing flyer.

- [ ] **Step 8: Commit cleanup and documentation**

```bash
git add -A
git commit -m "docs: document redesigned Ice Hub storefront"
```

### Task 9: Final independent verification

**Files:**
- Review only: all files changed in Tasks 1 through 8

**Interfaces:**
- Produces the required independent PASS, FAIL, or PARTIAL verdict before completion is reported.

- [ ] **Step 1: Request independent verification**

Invoke the `verification` agent with the original redesign request, the approved specification, this plan, every changed/deleted file, the static-site approach, and no claimed test results.

- [ ] **Step 2: Resolve every FAIL finding**

For a FAIL verdict, add a focused failing test, make the smallest correction, run that test, run `npm run verify`, and return the exact fix to the same verifier until it returns PASS or PARTIAL.

- [ ] **Step 3: Spot-check verifier evidence**

Re-run two or three commands from the verifier's PASS report, including `cd site && npm run verify`, and confirm output matches its command blocks. Resume the verifier if evidence is absent or diverges.

- [ ] **Step 4: Commit verified corrections if any**

```bash
git add -A
git commit -m "fix: address storefront verification findings"
```

Skip this commit only when the verification pass requires no correction.
