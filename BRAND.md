# The Ice Hub — Brand System v1 (anti-slop spec)

> Replaces the generic v0/Cursor template you downloaded. Every token, face, and rule in this file is the *only* set the build, the flyer, the receipt, and any future AI agent are allowed to use.

---

## 1. Name and voice

- **Name:** The Ice Hub. (Never "Ice Hub". Never "ICE HUB".)
- **Voice:** cold, slow, mineral, precise, deliberate. Sentence case in body. Sentence case in UI labels. Sentence case in headings.
- **Forbidden words:** premium, luxury, world-class, artisanal, curated, bespoke, elevated, exceptional, exclusive, fine.
- **Forbidden punctuation:** em dash anywhere visible. Use period, comma, colon, semicolon, parentheses, or line break.
- **Forbidden artifacts:** stock 3D dioramas, neon glow, gradient text, parallax hero with "scroll to explore" cue, `01 / 06` counters, "ICE CUBES R5" neon price stickers.

## 2. Palette (mineral, not neon)

| Token | Hex | Role |
|---|---|---|
| `--ink-0` | `#0A1216` | page canvas, manifest theme |
| `--ink-1` | `#10191D` | surface |
| `--ink-2` | `#1A2429` | raised surface, map placeholder bg |
| `--rule` | `#2A353B` | hairline, divider, border |
| `--ice-100` | `#F4F8FA` | glacier white, primary text on ink |
| `--ice-300` | `#B8C8CF` | soft ice, secondary text |
| `--ice-500` | `#7D96A0` | mid ice, eyebrows, tertiary text |
| `--accent` | `#8FB8C4` | ice blue — links, focus, progress, status, reveal strokes |
| `--accent-2` | `#D99E5A` | warm amber — CTA only, never decorative |

**One accent rule.** Amber is the *only* color allowed on a button or as a fill. Ice blue is the *only* color allowed on a link, focus ring, progress bar, or as a stroke. The flyer's `#C62828` red and the PDF's `#FF5500` flame orange are out.

## 3. Type (not generic)

- **Display:** `Bricolage Grotesque Variable`, self-hosted. Use for `h1`–`h3`. Tight tracking, weight 540–650, sentence case. Its irregular grotesque construction gives the site a cut, mineral character without becoming decorative.
- **Body:** `Instrument Sans Variable`, self-hosted, for paragraphs and UI. 1.55 line-height. `text-wrap: pretty` on paragraphs longer than 40ch. `font-variant-numeric: tabular-nums` on every number, price, time, weight, dimension.
- **Mono / utility:** `JetBrains Mono` for eyebrows only. 18em letter-spacing. Uppercase. `--ice-500` color. No other use.
- **Self-hosted WOFF2 only.** No Google Fonts CDN. Files live in `site/fonts/`. Use `font-display: swap` and a metric-matched fallback stack.
- **No script face anywhere.** The flyer's `Caveat` is gone. The PDF's `Montserrat` is gone. `Bebas Neue` is gone.

## 4. Iconography (premium, hand-picked)

- **Source:** `lucide` (open-source, MIT, hand-tuned by the Figma team, no anime gradients). **Strictly 1.5px stroke, 24×24 grid, rounded line caps, monochrome currentColor.** No filled variants. No colored boxes. No 3D extruded icons.
- **Delivery:** one inline SVG sprite in `public/icons.svg`. Reference with `<svg><use href="/icons.svg#ice-cube"/></svg>`. Tree-shakable, no JS, no extra request after first paint.
- **Never use:** emoji, Material Icons, Font Awesome, heroicons, twemoji, anything colored.
- **Icon set for The Ice Hub (curated, ~18):** `ice-cube`, `ice-sphere`, `ice-block`, `thermometer-low`, `thermometer-cold`, `droplet`, `glass-old-fashioned`, `glass-martini`, `glass-cocktail`, `bottle`, `truck-delivery`, `phone-call`, `map-pin`, `clock`, `sun`, `moon`, `arrow-right-long`, `chevron-down`.

## 5. Signature move

The 40-frame hero scrub. Frame-accurate, scroll-driven, no autoplay, no video tag, no MP4. The visitor cracks the cube by scrolling. This belongs in the spec as a named component, not a feature.

## 6. Things the PDF was wrong about

- Delete every reference to Bebas Neue, Caveat, Montserrat, flame orange, action red, "frosted crystal overlay textures", and the "PREMIUM QUALITY ICE | RELIABLE SERVICE | YOUR TRUST, OUR PRIORITY" footer line.
- Add the eight hard rules from the `web-design-guidelines` audit so the next agent that reads this file doesn't re-import the same bad ideas.
- The flyer is a *promo* artifact that uses the same palette, the same display face, and the same icon set as the site. No `Bebas`. No `Caveat`. No `#C62828`. Recolor price stickers to `--accent-2` (amber).

## 7. Where this spec is enforced

- The static build reads tokens from `site/styles.css`; runtime scripts read state from CSS custom properties rather than duplicating visual tokens.
- A lint check fails the build if `transition: all`, `outline: none`, or `user-scalable=no` appears.
- `prefers-reduced-motion` is a CI assertion, not a hope.
