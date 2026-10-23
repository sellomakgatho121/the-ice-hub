# The Ice Hub — Liquid Glass rebuild (concept, 2026-10-22)

## Design truth

Source of truth: **liquidglassdesign.com** (gallery + guide + resources), which
distils Apple's Liquid Glass (WWDC 2025, iOS 26). The non-negotiables it states:

1. **Glass is a chrome material.** It holds the layer that *floats above* content:
   navigation, controls, floating bars. Content itself stays on opaquer substance
   or on strongly frosted Regular glass (the iOS widget model) — never wispy
   glass under live copy.
2. **Lensing is the defining behaviour.** Edges bend light: the backdrop is
   warped like a real lens rim. On the web this is the SVG
   `feDisplacementMap` tier: `backdrop-filter: url(#lens) …` — real refraction,
   no WebGL, no third-party (defs live inline). Browsers without SVG-filter
   backdrop support (Safari) fall back to the CSS-only two-edge glass tier.
3. **Specular highlights.** Light travels the silhouette; pointer-tracked and
   scroll-tracked glints on glass rims.
4. **Adaptivity.** Glass tint and shadow respond to what passes underneath
   (scroll edge effects, `--glass-progress`).
5. **Regular vs Clear variants.** Regular = frosted, content-bearing. Clear =
   wispy chrome for controls.
6. **Morph + concentricity.** Controls flex on press, radii nest concentrically,
   transitions are transform/opacity only.

## Registered decisions

- **One world, fully dark.** The previous build's alternating light/dark section
  flips are gone. A single deep glacial canvas (`--abyss`) with luminance carried
  by the materials: bright hero imagery, Regular-frosted product cards, dark
  Regular panels. Contrast becomes *material brightness*, not background flipping.
  Most cohesive reading of "everything fits with everything else" under this
  design language.
- **Type system stays** (Bodoni Moda display + Manrope, self-hosted). It is the
  deployed identity, it carries the mineral voice, and it pairs with glass the
  way the gallery's best references do. BRAND.md's earlier Bricolage/Instrument
  spec was already superseded by the shipped, owner-approved serif system.
- **One accent rule keeps working**: amber `#D99E5A` remains the only warm fill
  and lives only on CTAs; ice blue `#8FB8C4` remains links/focus/progress.
- **Class names are mostly preserved** (`.glass`, `.liquid`, `.counter-card`,
  `.cta`, `.summary`, `.audience__*`, `.hero__*`) so the contrast gate's
  text-selector rules and the test surface keep their contract; the redesign is
  carried by restyling + a few structural wrappers, not a markup burn-down.
- **Reel naming is removed**: the `01 → 30` frame meter (`.hero__meta`) is
  deleted from markup and CSS. The scroll-scrub reel itself — the shop's
  signature — stays, with its progress re-styled as a luminous aperture edge.
  `reel.js` already null-guards the removed labels; the browser gate only reads
  `data-beat`, which stays.

## Material lanes

| Lane | Surfaces | Recipe |
|---|---|---|
| **A — Clear (chrome)** | header capsules, WhatsApp CTA, order buttons, stepper capsules, floating summary bar | low-opacity fill + url(#lens) refraction + blur/sat + bright rim pair + pointer specular + press flex |
| **B — Regular (cards)** | the three product cards, order summary lines | heavier frost (proven 72% face), lens-ringed, ink labels (proven `#294652`/`#0B4457` on the `#B0B4B6` floor), contact shadow that thickens on hover ("flexing glass") |
| **C — Mineral (content)** | hours, address, audience copy, footer | opaque ink surfaces, hairline rules, serif display, zero glass under paragraphs |
| **D — Scene** | hero reel (kept), drifting field (kept + sharpened) | full-bleed imagery; glass samples it |

## What floats where

- **Hero**: full-bleed reel; scrub kept; beat statements graded by veil, never
  boxed; luminous progress edge; glass stays out of the copy.
- **Header**: glass capsules (Clear) — wordmark capsule, links capsule, amber
  CTA capsule; scroll edge effect via `--glass-progress`.
- **Counter**: dark mineral section; three Regular-glass product widgets with
  lens rims + specular + thickening contact shadow; Clear-glass steppers and
  order buttons inside.
- **Audience / delivery**: dark Regular panels, hairline rhythm, no prose on
  wispy glass.
- **Visit**: dark; serif hours on ink; etched map panel unchanged in behaviour.
- **Summary**: floating Clear-glass capsule bar (tab-bar analog), appears only
  with items.
- **Footer**: mineral hairline, no glass.

## Gate contract (must stay green)

- axe zero violations; ≥44px tap targets; no horizontal overflow; no third-party
  requests (lens defs are inline SVG); no-JS: prices/hours/address/tel intact,
  summary hidden; bulk threshold + toast behaviour unchanged; reduced-motion
  collapses field drift, lens animation, morph transitions; hero reel still
  30 distinct frames, monotone scrub, one active layer; four beats in order.
- Contrast gate keeps its text-selector rules; new selectors are pseudo/soft
  layers only (no text), so rules stay name-compatible. Dark-lane ink re-verified
  where new pairs appear.

## Build order

1. tokens: lens/motion/radius/chrome lanes added; light-lane section tokens retired
2. svg lens defs + materials (`url()` tier with `@supports` ladder)
3. header chrome, hero, counter cards + controls, audience, visit, summary, footer
4. index.html: remove reel naming markup
5. gates: contrast + host + browser all EXIT 0
6. captures (`redesign` prefix), iterate on look
7. report
