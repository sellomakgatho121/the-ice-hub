# The Ice Hub — static rollback

> **2026-10-25 — React/Tailwind migration.** The deploy target is now
> [`../app/`](../app/) (see [`../docs/design/migration-plan.md`](../docs/design/migration-plan.md)).
> This `site/` tree is the verified static rollback and is kept until the live
> React build is checked. The current static build follows the “Cold ledger”
> direction in [`../docs/design/brief.md`](../docs/design/brief.md) (Bricolage
> Grotesque / Instrument Sans / JetBrains Mono, 30 frames, 30-bag bulk
> threshold). The older design notes below are historical where they conflict.

A storefront for a counter-service ice shop in Tembisa. Static HTML, CSS and
native ES modules — no framework, no build step, no CMS, and no third-party
request on load. Orders are composed in the browser and handed to WhatsApp;
nothing is stored and no customer data leaves the device.

The design contract for the static rollback is
[`../docs/design/brief.md`](../docs/design/brief.md). The older `DESIGN.md`
v2 describes a superseded glossy direction.

## Experience architecture

1. **Hero reel** — 30 frames from a single 8s / 1280×720 clip, WebP
   (844 KB). Frame density is the governing constraint: `px/frame = (heroVh −
   100)/100 × viewportHeight ÷ frameCount`. The hero is **150svh** to hold that
   at ~15 px/frame; the previous 390svh/20-frame build gave 130.5 px/frame and
   read as choppy. The reel is one continuous clip, so every transition
   crossfades and there is no seam.
2. **Counter** — three products with real prices, quantity steppers and a live
   estimated total. Crossing 20 bags drops the whole line to stock price and
   is announced in a polite live region.
3. **Audience** — three cards that differ in *structure* (prose-led,
   figure-led, list-led), not merely in vertical offset.
4. **Visit** — SAST open/closed status, full static hours, address,
   click-to-call, and an opt-in map that contacts nobody until it is pressed.

Every section works with JavaScript disabled: static prices, full hours,
address, click-to-call, and a direct WhatsApp link per product. The quantity
builder is *absent* in that case, not broken.

## Design system

- **Display:** Bodoni Moda Variable (`wght` 400–900, `opsz` 6–96), self-hosted
- **Text:** Manrope Variable (`wght` 200–800), self-hosted
- **Numeric:** JetBrains Mono, self-hosted (prices use tabular figures)
- **Icons:** local 1.5 px Lucide sprite, 16 symbols, stroke width baked into
  each `<symbol>` so an external `<use>` cannot silently inherit 2 px
- **Materials:** Refraction (hero), Glass (four gated surfaces only), Etched
  (quiet planes), Counter (commerce)
- **Motion:** transform and opacity only; honoured in JavaScript as well as
  CSS, so the scrub does not keep running when CSS disables it

## Project structure

```text
site/
  assets/reel/            48 hero frames, 640x360 WebP (frame-001 … frame-048)
  fonts/                  self-hosted WOFF2
  scripts/
    order.js              pure pricing/total/WhatsApp logic (unit-tested)
    order-ui.js           steppers, live total, bulk announcement
    hours.js              SAST shop status (unit-tested)
    reel.js               frame scrub, beat activation, reduced motion
    nav.js                header state, active section, year
    map.js                deferred opt-in OSM embed
    check-contrast.mjs    cascade-aware WCAG contrast gate
    verify.mjs            Playwright + axe gate (needs a real Chromium)
  icons.svg               local outline symbol sprite
  index.html
  styles.css              tokens, materials, components
```

`vendor/`, `crystal.js`, `form.js` and `motion.js` were removed: WebGL and
Web3Forms both violate the zero-third-party-request rule.

## Local development

```bash
cd site
npm run serve     # http://localhost:8000
```

## Verification

Two tiers, because they can run in different places:

```bash
npm run verify:host    # runs anywhere: unit tests + contrast gate
npm run verify         # the above, then the browser gate
```

`verify:host` is what can execute on a machine without a browser. It runs the
`node:test` suites for pricing, totals, WhatsApp URL and SAST status, then
`check-contrast.mjs`, which resolves the CSS cascade for every element on the
bright counter surface and checks each winning colour pair against WCAG 1.4.3.
That gate is proven, not assumed: injecting `--frost` or `--mist` onto the
counter makes it fail with exit 1.

`verify` additionally runs `verify.mjs` in a real Chromium, with
`@axe-core/playwright` for the a11y pass. It covers the resilience rows in
DESIGN.md §8b: reel frame failure, reduced motion, JavaScript disabled, opt-in
map, and 44 px tap targets at 390 px.

**It runs here, and it passes — 28/28, zero runtime errors.** Getting Chromium
onto this host took three steps that are easy to repeat on another Android
box:

1. Node reports `process.platform === 'android'` and Playwright refuses to
   resolve a browser. `platform-spoof.cjs` relabels it to `linux`; ESM hoists
   static imports, so the imports must be **dynamic** (`await import(...)`) or
   the spoof lands too late.
2. `NODE_OPTIONS="--require ./platform-spoof.cjs" node node_modules/playwright/cli.js install chromium`
   then installs the normal linux-arm64 build. Its dependency check fails
   harmlessly; the binary still lands.
3. Seven shared libraries were missing. `apt-get install -y --no-install-recommends
   libnspr4 libnss3 libatk1.0-0t64 libxcomposite1 libxdamage1 libatspi2.0-0t64`
   resolves every one.

**What this gate has already caught that static analysis could not:** the
header WhatsApp CTA at 1.22:1 (a `.header__nav a` rule outranking `.cta`),
the fixed order summary dropping to 1.64:1 over the bright counter, hero text
running off the left edge for want of a gutter, product icons rendering at
~100 px, and six tap targets under 44 px.

### Screenshots

`node scripts/shoot.mjs` writes desktop and mobile captures to `lab/shots/`.
Rendering is the only way to catch layout defects, and on this project it
found four that no amount of static checking had.

## Shop details

- 9605 Winnie Mandela Zone 4, Raymond Mhlaba Street, Tembisa 1632
- +27 81 859 2919
- Monday to Friday: 10:00 to 19:00
- Saturday to Sunday: 09:00 to 21:00