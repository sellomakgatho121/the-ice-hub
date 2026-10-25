# The Ice Hub — React app

React 19 + Vite 8 + Tailwind 4 port of the static storefront in `../site/`.
The visual direction, copy, prices, hours, address, WhatsApp handoff, and
scroll-scrubbed hero are preserved. `../site/` is the verified rollback until the
production switch is deployed and checked.

## Stack

| Piece | Version | License |
| --- | --- | --- |
| React / React DOM | 19.3.1 | MIT |
| Vite | 8.3.5 | MIT |
| @vitejs/plugin-react | 6.1.2 | MIT |
| Tailwind CSS / @tailwindcss/vite | 4.3.3 | MIT |
| Motion (`motion/react`) | 14.6.0 | MIT |
| Magic UI NumberTicker | source copy | MIT |

Node **22.12+** is required by Vite 8. The repo root `.nvmrc` pins Node 22 for
Vercel; `package.json` declares the same floor.

## Commands

```bash
cd app
npm ci
npm test          # 21 pure domain tests
npm run dev       # http://127.0.0.1:5173
npm run build     # vite build + prerender into dist/
npm run preview   # http://127.0.0.1:4173
```

`npm run build` writes the prerendered HTML to `dist/index.html`; the
`<!--app-html-->` marker must be gone and product names/prices must be present.
`dist/` and `node_modules/` are gitignored; Vercel builds from source.

## Architecture

```
src/
  main.jsx          .js class + hydrateRoot
  App.jsx           section assembly; order state and announcer
  index.css         Tailwind import, tokens, ported component CSS
  lib/              config, order, hours (pure, unit-tested)
  hooks/            useReel, useHeaderState, useOrder, useShopStatus,
                    useMap, useReveal, useParallax
  components/       Header, Hero, Products, Stats, Story, Delivery, Visit,
                    Footer, MobileBar, Summary, SkipLink, Icon,
                    magicui/number-ticker
scripts/prerender.mjs
public/             self-hosted fonts, reel frames, icons, favicon, manifest
```

- **No-JS:** prerendered copy, prices, hours, address, direct WhatsApp links,
  and footer are visible. The map button is hidden until `.js`; the order
  steppers are inert, exactly as before.
- **Hydration:** status starts “Checking hours”; order starts empty; map starts
  hidden; ticker renders its final value; reel starts on frame 1. Browser-only
  reads are in effects.
- **Motion:** native rAF reel scrub and parallax; Motion powers the Magic UI
  ticker. `prefers-reduced-motion` disables scrub/parallax, shows all four hero
  beats, and keeps final counter values.
- **Privacy:** no third-party request on load. The OpenStreetMap iframe and
  Nominatim geocode happen only after “Load interactive map”; the geocode is
  cached for 30 days and falls back to fixed coordinates after an 8s timeout.

## Verified state (2026-10-25)

- `npm test`: 21/21.
- `npm run build`: 267.04 KB raw / **85.00 KB gzip JS**; 21.90 KB raw /
  **5.45 KB gzip CSS**; 10,580-byte prerender.
- QA harness 320/390/1440 + 390 reduced-motion: `findings: []`, no console or
  failed-request errors.
- L3: order totals/bulk/clear, WhatsApp links, hero scrub, header state and
  `aria-current`, map opt-in, reduced motion, 844×390 landscape overlap.

Unverified: real Android Edge/Chrome, screen-reader output, and the live Vercel
deployment. Full-page QA screenshots misrender sticky/revealed content; viewport
screenshots are authoritative.

## Deploy

The root `vercel.json` installs with `cd app && npm ci`, builds with
`cd app && npm run build`, and serves `app/dist`. Root `deploy.sh` runs tests,
build, prerender checks, and the QA harness before committing/pushing/deploying.
Use `bash deploy.sh --dry` to run every gate without changing anything;
`bash deploy.sh --yes` is the production action.

## Resources

Magic UI NumberTicker is the only shortlist component shipped. Origin UI is
blocked by its AGPL-3.0 license. Motion Primitives, Aceternity, Animate UI,
21st.dev, Rive, LottieFiles, Spline, ShaderToy, unDraw, Unsplash, Mobbin,
Tailwind Plus, Cruip, and Fontshare are evaluated/rejected or blocked in
`../docs/design/resources.md`. No new fonts or media were added.
