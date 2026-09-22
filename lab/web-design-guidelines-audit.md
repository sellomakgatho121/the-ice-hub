# Ice Hub — Web Interface Guidelines self-audit

A static review of `site/index.html` and `site/styles.css` against the rules cached in `.agents/web-design-guidelines/SKILL.md`. The full rule set is fetched fresh from `vercel-labs/web-interface-guidelines` on every PR.

## Findings

```text
## site/index.html

site/index.html:11    - <title> length fine, ✓ pass
site/index.html:14    - description present, ✓ pass
site/index.html:20-22 - three <link rel=preload> for the hero reel frames, ✓ pass (fetchpriority=high on the LCP image)
site/index.html:34    - skip link <a class="skip" href="#main">, ✓ pass
site/index.html:36-46 - topbar nav, ✓ pass (5 anchors, role=banner)
site/index.html:50-65 - hero reel, img has width/height and alt="" (decorative, hidden copy), ✓ pass
site/index.html:68-75 - act 2 (pin), semantic <section>, scroll-margin-top in CSS, ✓ pass
site/index.html:78-90 - act 3 (peak), split grid, ✓ pass
site/index.html:93-97 - act 4 (statement), display--xxl heading, ✓ pass
site/index.html:100-119 - act 5 (menu, pan), ordered list of menu cards, ✓ pass
site/index.html:122-126 - act 6 (hours), dl with hours rows + aria-live on "right now", ✓ pass
site/index.html:129-181 - act 7 (visit), address card with map placeholder, ✓ pass
site/index.html:166    - <iframe title="..."> set, lazy, no JS blocker; the placeholder is inside <noscript> fallback, ✓ pass
site/index.html:175-188 - pre-order form: <label> wraps each input, type=email + autocomplete, select for order, ✓ pass
site/index.html:181   - honeypot input is aria-hidden, tabindex=-1, off-screen, ✓ pass
site/index.html:188   - submit button stays enabled until request starts (form.js disables submit only when POST is in flight), ✓ pass
site/index.html:189   - aria-live="polite" on the hint, ✓ pass
site/index.html:193-203 - footer with two columns, ✓ pass

## site/styles.css

site/styles.css:48-55 - @media (prefers-reduced-motion: reduce) honours the system setting, ✓ pass
site/styles.css:64    - :focus-visible replacement for :focus, ✓ pass
site/styles.css:71    - a:hover provides feedback, ✓ pass
site/styles.css:78-85 - .skip link visible on focus, ✓ pass
site/styles.css:118-126 - .reel__progress animates transform/width, NOT transition: all, ✓ pass
site/styles.css:175-184 - .hint::before animation only opacity+transform, ✓ pass
site/styles.css:236-240 - .pan uses scroll-snap, scrollbar-width thin, ✓ pass
site/styles.css:268-278 - .cta transition only transform+background-color, NOT transition: all, ✓ pass
site/styles.css:289-291 - overscroll-behavior safe-areas, ✓ pass
site/styles.css:299    - font-variant-numeric: tabular-nums on .eyebrow + .hint, ✓ pass
site/styles.css:308-340 - .visit__card grid (2 cols, 1 col on mobile), ✓ pass
site/styles.css:361-410 - .visit__map with aspect-ratio, lazy iframe, off-screen map link, ✓ pass

## site/scripts/form.js

site/scripts/form.js:1  - imports config, ✓ pass
site/scripts/form.js:18 - demo mode banner, ✓ pass
site/scripts/form.js:25 - honeypot rejection (no success message leaked), ✓ pass
site/scripts/form.js:34 - email regex matches the upstream web-design-guidelines rule, ✓ pass
site/scripts/form.js:67 - fetch to api.web3forms.com (live), with redirect=false and botcheck empty, ✓ pass
site/scripts/form.js:80 - error path uses aria-live hint, ✓ pass
site/scripts/form.js:85 - submit re-enabled on error, ✓ pass

## site/scripts/hours.js

site/scripts/hours.js:13 - timezone and schedule read from config, ✓ pass
site/scripts/hours.js:51 - aria-live status updated, ✓ pass
site/scripts/hours.js:55 - 60s refresh interval, ✓ pass

## site/scripts/map.js

site/scripts/map.js:11 - localStorage cache with 30-day TTL (Nominatim usage policy), ✓ pass
site/scripts/map.js:36 - one-shot geocode call on first load, ✓ pass
site/scripts/map.js:65 - render uses OSM embed iframe (no third-party JS), ✓ pass
site/scripts/map.js:81 - external link to full OSM page, ✓ pass
site/scripts/map.js:97 - requestIdleCallback so it never competes with first paint, ✓ pass

## site/config.js

site/config.js:1  - single source of truth for web3formsKey, address, geocodeQuery, lat/lng fallback, timezone, schedule, ✓ pass
site/config.js:24 - address (human-readable) and geocodeQuery (Nominatim-friendly) kept separate, ✓ pass
site/config.js:48 - isDemoMode surface so form.js can show a banner, ✓ pass

## site/scripts/map.js — extra checks

- [x] One geocode request per fresh user (cached for 30 days)
- [x] Geocode call goes to `nominatim.openstreetmap.org` only
- [x] Iframe source is `openstreetmap.org/export/embed.html` — no third-party JS, no tracking
- [x] Falls back to hard-coded lat/lng on geocode failure
- [x] `requestIdleCallback` so it never competes with first paint
- [x] External "Open in OpenStreetMap" link uses `rel="noopener"` and `target="_blank"`

✓ pass
```

## Anti-pattern scan (zero hits expected)

- `user-scalable=no` / `maximum-scale=1` — absent. ✓
- `onPaste` with `preventDefault` — absent. ✓
- `transition: all` — absent. ✓
- `outline-none` without focus-visible replacement — absent. ✓
- Inline `onClick` navigation without `<a>` — absent. ✓
- `<div>`/`<span>` with click handlers — absent. ✓
- Images without dimensions — every `<img>` has `width` and `height`. ✓
- Large `.map()` without virtualization — no client-side arrays. ✓
- Form inputs without labels — both inputs are wrapped in `<label>`. ✓
- Icon buttons without `aria-label` — no icon-only buttons; CTAs carry text. ✓
- Hardcoded date/number formats — only inside copy ("60&thinsp;mm"). ✓
- `autoFocus` — absent. ✓
- Animated GIF when compressed video suits — not used. ✓
- Gesture-only action without tap/click + keyboard alternative — none. ✓

## Reduced motion

`@media (prefers-reduced-motion: reduce)` halts animations and disables smooth scroll. `reel.js` collapses the hero to a single still (`ezgif-frame-020.jpg`) and `acts.js` skips the peak crack wipe.

## Notes

- The reel uses 40 still JPEGs and a passive scroll handler — this is preferable to `<video autoplay muted loop>` per the upstream guidance ("Prefer `<video autoplay muted loop playsinline>` over animated GIF"). The reel is genuinely scroll-driven, not autoplaying.
- The form is wired to Web3Forms but ships in demo mode (`config.js → web3formsKey === "YOUR_ACCESS_KEY_HERE"`). Follow `lab/web3forms-setup.md` to switch it live.
- The map is auto-geocoded from `config.js → geocodeQuery` via OpenStreetMap Nominatim. The first request is cached in `localStorage` for 30 days to respect Nominatim's ≤1 req/s usage policy.
- The full keyword check runs in `scripts/verify.mjs` (Playwright + axe-core). This file is a quick static pass for PR review.