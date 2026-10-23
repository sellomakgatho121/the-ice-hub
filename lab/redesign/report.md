# Liquid Glass redesign report

Date: 2026-10-22
Design truth: liquidglassdesign.com (+ Apple WWDC "Meet Liquid Glass" 2025/219, shuding/liquid-gress displacement technique)
Concept: `lab/redesign/CONCEPT.md` (one-canvas dark world, material lanes, lens tier, environment light)

## What shipped

| Layer | Decision |
|---|---|
| Canvas | One continuous dark world end to end. Section background flips removed; luminance is carried by materials, not by alternating stage and floor. |
| Material lanes | Clear chrome (header capsules, CTA, controls, summary), Regular (product cards), Mineral (content, text never sits on glass), Scene (hero reel + drift field). |
| Lens | Inline SVG filter `#lg-lens`: `feImage` gradient displacement map into `feDisplacementMap` (scale 26). Applied through `backdrop-filter: url(#lg-lens) blur() saturate()` on the Chromium tier via `@supports`; Safari degrades to blur+saturate. |
| Environment light | `--spec-x/--spec-y` pointer tracker in field.js (fine pointer only, reduced-motion gated) drives specular glints on card rims, chrome capsules, CTA and summary. |
| Hero | Scroll-scrub reel kept (40-frame feel, 30-frame set). Reel naming removed from the page; the progress meter became a luminous aperture edge at the hero seam. |
| Concentricity | Widget radius unified on `--radius-xl` (26px) for `.glass` base, counter cards and summary; pill radii for capsules and controls. |

## Gate-driven corrections during implementation

| Correction | Why |
|---|---|
| `--glass-face-bright` retuned to 72% ice-white | Cards are their own light source now; the old 26% face over bare abyss resolved to #42484B and failed contrast. New floor #B0B4B6 keeps every proven ink pair. |
| `.product` root and `.stepper` shell declare `color: var(--counter-ink)` | The section's frost base text no longer pairs with lit card faces (white-on-white). |
| Seven single-line at-rules reformatted to multi-line | check-contrast.mjs terminates at-rule capture on `\n}`; one-line media blocks over-captured following rules into the wrong media context (this hid the `.product` ink at 1440 exactly). Pure formatting, no rule content changed. |
| `.audience` border lines removed | Hard dividers contradict the scroll-edge principle; the stage tone shift alone separates counter from audience. |
| `.visit__grid:has(> .map-panel[hidden])` collapse | The map column is empty until requested; the hours column keeps a 62ch reading width instead of leaving a hollow right half. |
| `.address a` ink moved to `var(--refract)` | Stale bright-lane link ink (#0B4457) on the mineral canvas measured 1.88:1 (axe, serious). #6FD3EA on the dark floor passes with headroom. |

## Evidence

| Gate | Result | Log |
|---|---|---|
| Host tests (order/hours) | 21/21 PASS | `/tmp/opencode/host-redesign3.log` |
| Contrast cascade gate | PASS, 102 pairs resolved | `/tmp/opencode/contrast-redesign4.log` |
| Browser verify (30 steps incl. axe, no-JS, tap targets, reel bounds) | 30/30 PASS | `/tmp/opencode/verify-redesign2.log` |
| Visual deck (8 viewport shots, 1440 + 390) | reviewed, no defects | `lab/glass/redesign-*.png` (`redesign2.log`) |

Note on gate coverage: the contrast gate enumerates classed elements only; classless text leaves (the tel anchor was one) are covered by the axe step in the browser verify pass.

## Residuals

- `site/assets/reel/frame-031..048.webp` (18 files) are unfetched by any reel list. Removing them needs approval; they cost archive size only.
- opencode agent-fleet restart + `NVIDIA_API_KEY` are user-side; in-session delegation lanes were unavailable, so all work was implemented directly.
- Hero statement crosses the reel's brightest midband at 390 for one scroll band. Worst-case backdrop modelling passes; a scrim, not a copy or layout change, would be the lever if this ever bothers eye-review.

## Pro-Max pass (post-redesign polish)

Source: `nextlevelbuilder/ui-ux-pro-max-skill` (MIT), queried through its own
search CLI. Rules were adopted selectively: where the database's generic
recommendations fight the committed system (Vibrant & Block-based palette,
Rubik/Nunito type), the brand commitment wins; where they complement it, they
land.

| Rule | Gap found | Fix |
|---|---|---|
| Sticky nav must not obscure anchored content | No `scroll-margin-top` anywhere | 80px stop on `#main/#products/#delivery/#visit` (`calc(var(--tap) + var(--space-xs) * 3)`) |
| Pressed states carry feedback beyond colour | `:active` states were washes only | steppers `scale(0.92)` + transitions; `.liquid` and `.cta` press flexes `scale(0.985)` |
| `prefers-reduced-transparency` needs an opaque fallback | No such lane existed | Opaque fills per material: `#F2F6F8` bright faces, `--glass-fallback` glass, 96% dark chrome, solid amber CTA; blur dropped |
| Loading needs an accessible busy status | Button text only | `aria-busy` on the map panel for the iframe's lifetime |
| Scroll reveal, subtle tier (300–400ms, small rise, once) | No section entry | `reveal.js`: 12px rise, 380ms expo-out, IntersectionObserver once, 60/120ms sibling stagger; hiding scoped under the `.js` head bootstrap so a scriptless visit renders fully; reduced motion reveals at once |

### Gate evidence for the pass

| Gate | Result | Log |
|---|---|---|
| Host tests (order/hours) | 21/21 PASS | `/tmp/opencode/host-promax.log` |
| Contrast cascade gate | PASS | `/tmp/opencode/contrast-promax.log` |
| Browser verify (incl. axe, nav flow) | PASS, axe zero | `/tmp/opencode/verify-promax.log` |
| Deck recapture | 8/8 clean | `lab/glass/redesign-*.png` (`/tmp/opencode/redesign3.log`) |

The 390 counter shot still frames from mid-card because the capture script
scrolls by offset, not by anchor; the user path (nav links) stops one capsule
clear via the new scroll-margin, and the verify nav steps confirm it.
