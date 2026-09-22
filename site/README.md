# The Ice Hub

An editorial product story for a counter-service ice shop in Tembisa. The redesigned layout separates typography from product imagery and keeps practical information in normal document flow. The 40-frame scroll film remains; the fracture scene uses a real-image fallback if WebGL is unavailable or lost.

## Experience architecture

1. **Hero reel:** 40 local JPEG frames scrubbed directly by scroll position.
2. **Process:** image and production notes in a responsive editorial spread.
3. **The crack:** one procedural Three.js scene with an explicit static-image fallback. Eight facets separate and reform when WebGL is available.
4. **Material:** a restrained statement and vertically arranged product notes.
5. **Range:** five visible product rows. Each action selects the corresponding order and focuses the email field.
6. **Hours:** live SAST open/closed state and a compact opening-hours table.
7. **Visit and pre-order:** contact details, an opt-in OpenStreetMap embed and Web3Forms integration (currently demo mode).

The page stays in one visual world. There is no client router, autoplay video, stock artwork or generic component library.

## Design system

- **Display:** Bricolage Grotesque Variable, self-hosted
- **Text:** Instrument Sans Variable, self-hosted
- **Utility:** JetBrains Mono, self-hosted
- **Icons:** local 1.5 px outline SVG sprite based on Lucide's visual grammar
- **Palette:** mineral ink, glacier white, ice blue and a single amber action color
- **Motion:** transform and opacity only; every continuous effect is disabled or collapsed under `prefers-reduced-motion`

The complete rules are in [`BRAND.md`](../BRAND.md), and the narrative plan is in [`BRIEF.md`](../BRIEF.md).

## Project structure

```text
site/
  assets/reel/            deployable copy of all 40 hero frames
  fonts/                  self-hosted WOFF2 variable fonts
  vendor/three.module.min.js
  scripts/
    reel.js               frame loading and scroll scrub
    motion.js             section progress, rail motion and reveals
    crystal.js            procedural WebGL crystal
    hours.js              SAST shop status
    map.js                deferred OSM map
    form.js               validation and Web3Forms submission
    verify.mjs            Playwright and axe verification
  icons.svg               local outline symbol sprite
  index.html
  styles.css
```

The original source frames remain in `Hero section images/`. They are copied into `site/assets/reel/` because the deployed static site cannot request files above its public root.

## Local development

```bash
cd site
npm install
npm run serve
```

Open <http://localhost:8000>.

## Verification

With the local server running:

```bash
cd site
npm run verify
```

The verifier checks:

- six distinct hero frames at exact reel depths
- local fonts, frame resources, and a healthy WebGL context or loaded image fallback
- five product cards and zero horizontal document overflow
- custom pre-order validation
- WCAG A/AA with axe
- reduced-motion collapse to a static frame
- 390 × 844 mobile layout and 44 px minimum touch targets
- desktop and mobile screenshots in `site/lab/shots/`

## Form setup

The form remains in demo mode until a valid Web3Forms key is added to `site/config.js`. Follow [`lab/web3forms-setup.md`](../lab/web3forms-setup.md). Do not commit a live key to a public repository.

## Shop details

- 9605 Winnie Mandela Zone 4, Raymond Mhlaba Street, Tembisa 1632
- +27 81 859 2919
- Lebomorena3@gmail.com
- Monday to Friday: 10:00 to 19:00
- Saturday to Sunday: 09:00 to 21:00
