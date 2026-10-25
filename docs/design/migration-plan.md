# The Ice Hub — React/Tailwind migration plan

**Date:** 2026-10-25
**Status:** Phases 1–4 complete and independently reviewed; Phase 5 config/docs complete;
production push/deploy **not executed**. Implementation lives in `app/`; `site/` remains the
verified rollback until the owner deploys and verifies the live build.
**Reason:** the owner chose a React/Tailwind stack so the creative shortlist can be used
directly, accepting the rewrite, bundle, and dependency costs.

## Non-goals

- No visual redesign. Preserve the "Cold ledger" direction, copy, prices, hours, address,
  WhatsApp handoff, map opt-in, and the scroll-scrubbed hero.
- No new photography, illustration, 3D, or WebGL. The owner's reel remains the only media.
- No third-party request on load. All fonts, frames, icons, and JS are self-hosted/bundled.
- No deploy or push. The current `site/` stays deployable.

## Stack

| Piece | Version | License | Evidence |
| --- | --- | --- | --- |
| React / React DOM | 19.3.1 | MIT | `npm view` 2026-10-25 |
| Vite | 8.3.5 | MIT | `npm view` 2026-10-25 |
| @vitejs/plugin-react | 6.1.2 | MIT | `npm view` 2026-10-25 |
| Tailwind CSS / @tailwindcss/vite | 4.3.3 | MIT | `npm view` 2026-10-25 |
| Motion (`motion/react`) | 14.6.0 | MIT | `npm view` 2026-10-25 |
| Magic UI NumberTicker | source copy | MIT | GitHub API `magicuidesign/magicui` 2026-10-25 |

Build: Vite. Styling: Tailwind v4 is the styling runtime and is used by the Magic UI
ticker; the port keeps the existing component CSS (986 lines) for visual parity rather
than rewriting every rule as utilities. This is a hybrid, not a utility-first rewrite.
Icons: keep the existing self-hosted Lucide sprite. Fonts: keep the existing self-hosted
WOFF2 set.

## Shortlist decisions

| Resource | Decision | Reason |
| --- | --- | --- |
| Magic UI | **Used** — NumberTicker for the stats | MIT; direct fit; no extra design system |
| Motion Primitives | Evaluated, not shipped | MIT, but a second component collection; Motion is used directly instead |
| Aceternity UI | Rejected for this pass | Effect-first; the hero is already a real product reel; no brief-level need |
| Animate UI | Rejected | Repo/license not verified; no needed primitive |
| Origin UI | **Blocked** | AGPL-3.0 (verified from repo LICENSE); commercial network use would require source disclosure |
| 21st.dev | Rejected | Per-component licenses; no component needed |
| Rive / LottieFiles / Spline / ShaderToy | Rejected | Runtime or asset weight, per-asset/shader licenses, no WebGL on this hardware |
| unDraw / Unsplash | Rejected | No illustration/photo need; the brief rejects stock imagery |
| Mobbin | Reference only | Paid; no app-flow pattern needed |
| Tailwind Plus / Cruip | Blocked | Paid/commercial terms; no purchase |
| Fontshare | Rejected | The self-hosted Bricolage/Instrument pair is already selected; no new font |

The owner's standing rule is encoded as a mandatory **evaluation** shortlist in
`~/.config/opencode/AGENTS.md` and the creative-resource registry (both updated
2026-10-25). Evaluation is mandatory; shipping still requires a verified license, stack
fit, bundle/runtime cost, and accessibility pass.

## Architecture

```
app/
  index.html                 # prerender marker, font/frame preloads, meta
  vite.config.js
  scripts/prerender.mjs      # renderToString(App) -> dist/index.html
  public/                    # assets, fonts, icons, favicon, manifest
  src/
    main.jsx                 # .js class + hydrateRoot
    App.jsx
    index.css                # @import "tailwindcss"; tokens; custom layers
    lib/                     # config.js, order.js, hours.js (pure, tested)
    hooks/                   # useReel, useHeaderState, useOrder, useShopStatus, useMap,
                             # useReveal, useParallax
    components/              # Header, Hero, Products, Stats, Story, Delivery, Visit, Footer,
                             # MobileBar, Summary, SkipLink, magicui/number-ticker
```

**Prerender + no-JS.** `vite build` then `node scripts/prerender.mjs` renders the app to
HTML and replaces `<!--app-html-->` in `dist/index.html`; `main.jsx` hydrates. Static
content (prices, hours table, address, direct WhatsApp links, footer) is visible without
JS. The steppers are inert without JS, exactly as they are today; the direct links work.

**Hydration safety.** Browser-only work stays in `useEffect`/event handlers. The shop
status starts as "Checking hours" and updates after mount. The reel starts on frame 1.
The order starts empty. The map panel starts hidden. The stat ticker renders its final
value on the server and animates only after mount.

**Motion.** Keep the native reel scrub and parallax (they are tuned and cheap); use
Motion for the Magic UI ticker and optional beat crossfades. Honour
`prefers-reduced-motion` in both CSS and hooks. The hero remains the single signature.

**Budget re-baseline.** React + Motion cannot meet the old ≤30 KB gzipped JS budget.
The measured build is **267.04 KB raw / 85.00 KB gzipped JS** and **21.90 KB raw /
5.45 KB gzipped CSS**; this is the new ceiling, and the old budget is no longer claimed.
The hero media budget (≤600 KB) remains aspirational; the reel is 844 KB today.

## Phases and gates

1. **Scaffold** — app shell, Tailwind tokens, assets, domain logic, tests, prerender.
   Gate: `npm run build` succeeds; `npm test` passes; prerendered HTML contains the
   product names and prices.
2. **Static port** — Header, Hero poster, Products, Stats, Story, Delivery, Visit,
   Footer, MobileBar, Summary. Gate: QA harness 320/390/1440 `findings: []`; no overflow.
3. **Interaction port** — reel scrub, beat changes, header state, section nav, order
   steppers/summary/WhatsApp links, hours status, map opt-in, reveals, ticker.
   Gate: L3 checks at 390/1440; reduced motion; order link carries and clears; map loads
   only on click; header solid after hero.
4. **Visual/perf/a11y pass** — compare against `shots/`; contrast; tap targets; focus;
   bundle and request audit. Gate: independent `reviewer` + `ui-visual-validator`.
5. **Switch** — update root `vercel.json` (`outputDirectory: app/dist`, build command),
   `deploy.sh`, README/brief/resources. Keep `site/` until the owner approves deletion.

**Phase status (2026-10-25):** 1–4 complete. Phase 4 manual L2/L3 and the independent
`reviewer` + `ui-visual-validator` passes are complete (notes documented); Phase 5
config/docs complete. Production push/deploy deliberately not executed; `deploy.sh --dry`
is the gate, `deploy.sh --yes` is the production action.

## Verification evidence (2026-10-25)

- `app/npm test`: **21/21 pass**.
- `app/npm run build`: **267.04 KB raw / 85.00 KB gzip JS**, **21.90 KB raw / 5.45 KB
  gzip CSS**, **10,580 bytes** prerendered HTML, no `app-html` marker.
- QA harness: **320, 390, 1440, and 390 reduced-motion** all exit 0 with
  `findings: []`, `consoleErrors: []`, `failedRequests: []`.
- L3: 2 bags → `R34`; clear → summary hidden and bare `wa.me`; 30 bags → `R10`, `R300`,
  bulk announcement; 29 → `R17`, `R493`; hero beat/frame/progress changes; header solid
  and one `aria-current`; map has **0 iframes before click**, then the OSM embed; reduced
  motion shows four beats, no scrub/parallax, final `30 / R10 / 7 / R55`; 844×390 CTA/sub
  overlap 0; no third-party request on load.
- Defects found during verification and fixed: undeclared `active` in `useReel` cleanup;
  duplicated/mis-set `data-open-status`; no timeout on the Nominatim request (button could
  stick on “Loading map”); inert no-JS map button; missing reduced-motion parallax
  `min-height: auto`; missing `.summary__lines li` flex/mono rule; map iframe not filling
  its panel; 24px header/footer/address tap targets; reduced-motion users warming all 30
  reel frames; stale reel index after a reduced-motion toggle; unguarded
  `IntersectionObserver`; duplicate polite live regions; green status dot outside the
  single-accent palette (now ice-cyan).
- Independent review: `reviewer` found no shipping blocker after the fixes; its
  `summary[hidden]` concern was checked and refuted (`.summary[hidden]` exists at
  `app/src/index.css`). `ui-visual-validator` returned **pass with notes**: the
  three-column audience cards and their bordered surfaces are retained because they are
  the approved static composition and changing them would be a redesign; the green dot
  was changed to the ice-cyan accent. No visual blocker.

**Still unverified:** real Android Edge/Chrome (headless Chromium only), screen-reader
output, live Vercel deployment, and the full-page QA screenshot rendering of sticky and
revealed content (viewport screenshots are authoritative; the full-page Delivery blank is
a capture artifact).

## Risks

- **No-JS regression** if prerender is skipped; the gate checks the built HTML.
- **Hydration mismatch** if a component reads `Date`/`window` during render; keep those
  in effects and start from deterministic values.
- **Tailwind rewrite drift**; port the existing CSS values, do not redesign.
- **Magic UI dependency creep**; copy only NumberTicker, not the registry/CLI.
- **AGPL/paid resources**; blocked until the owner supplies a license decision.
- **Bundle growth**; measure and report the real number.

## Rollback

`/data/data/com.termux/files/home/ice-hub-vanilla-20261025.tar.gz` (3.4 MB) and the
`site/` tree. This pass makes a **local commit** after the gates; it does **not** push or
deploy. To roll back before deployment, restore `site/` and the pre-migration
`vercel.json`/`deploy.sh`; to roll back after deployment, revert the migration commit and
redeploy the static tree.
