# The Ice Hub — Design Brief (redesign pass)

**Date:** 2026-10-25
**Status:** Approved for implementation (owner-directed scrap-and-redesign).
**Stack decision:** React 19 + Vite 8 + Tailwind 4 in `app/` (owner-approved migration, 2026-10-25). `site/` remains the verified static rollback. The visual direction, copy, prices, hours, and motion plan below are unchanged.

**Migration note (2026-10-25):** the React port is verified at L2/L3; see [`migration-plan.md`](migration-plan.md) and [`resources.md`](resources.md). The JavaScript budget in §9 is the old static-site budget and no longer applies to `app/`; the React build measures **85.00 KB gzipped** and must be tracked as the new ceiling. The static site remains deployable until the owner runs the production switch.

## 1. Audience and objective

Local buyers in Tembisa (households, event planners, small venues) arriving on mobile,
wanting clear ice at known prices, with a single action: **order via WhatsApp**.
They arrive skeptical of "premium" claims; they want price, availability, hours, address,
and a phone number they can tap. Success = a WhatsApp message with a product + quantity.

## 2. Visual concept and rationale

"Cold ledger." A matte, mineral storefront: deep ink canvas, glacier-white type,
hairline rules, no glass, no blur, no neon. Reads as a cold, precise counter-service
shop rather than a glossy tech demo. Fits a physical ice supplier better than the
previous glossy-glass direction, which read as a UI kit applied to ice.

## 3. Typography direction

- **Display:** Bricolage Grotesque Variable (self-hosted WOFF2, OFL) — h1–h3, tight tracking, 500–700. Irregular grotesque construction gives a cut, mineral character.
- **Body:** Instrument Sans Variable (self-hosted WOFF2, OFL) — paragraphs/UI, 1.55 line-height.
- **Data/mono:** JetBrains Mono (self-hosted WOFF2, OFL) — prices, times, weights, tabular-nums.
- Scale via `clamp()`; `text-wrap: pretty` on body > 40ch. No Google Fonts CDN.

## 4. Color and contrast strategy

Dark glacial canvas. `--ink-0 #0A1620` page, `--ink-1 #10202C` surface, `--ink-2 #1A2E3C` raised, `--rule #263D4D` hairlines.
Text: `--ice-100 #F0F6F9` (frost white primary), `--ice-300 #B0C8D4` (secondary), `--ice-500 #7A96A3` (tertiary).
Accents: `--accent #4FC3DC` (glacial cyan — links, focus, progress, strokes),
`--accent-2 #F0F6F9` (frost — CTA fills, dark text). WCAG 2.1 AA floor 4.5:1 for body text.
No gradient text, no neon, no glass blur.

## 5. Layout and composition

Single column on mobile; 12-column grid on desktop with deliberate asymmetry in the hero
and a 2/3 + 1/3 split in the product section. Full-viewport stages for hero and
product; shorter rhythm for hours/contact. Hairline rules as section dividers, not cards.

## 6. Image and media direction

- Hero: 30-frame 1280×720 WebP scroll-scrubbed sequence (frames 1–30, 844 KB) — the signature motion. Over the 600 KB cap; see §9.
- No stock photography, no 3D dioramas, no WebGL (GPU context never initialised on this hardware).
- Product imagery: none available; rely on lucide icons + type + price. Honest about absence.
- Fallback: static poster frame when reduced motion or JS disabled.

## 7. Interaction and motion plan

- Scroll-scrubbed hero (signature): rAF frame swap, no autoplay, no `<video>`, reduced-motion poster.
- Parallax story band: one full-bleed image translated on scroll (`translate3d`, depth 0.18, rAF, passive listeners). One band only.
- Count-up stats: four figures animate once on entry (IO, 1.1s, cubic ease-out); final value is the no-JS/reduced-motion state.
- Fixed header: transparent with a top legibility gradient over the hero, flat solid once the hero leaves (IO, no scroll maths).
- Subtle fade/slide reveals on section entry (transform + opacity only, ≤300ms).
- `prefers-reduced-motion`: disable scrub, show poster, disable parallax (settle transform), show final counters, disable reveals.
- Two orchestrated moments (hero scrub, story parallax); everything else stays still or fades.

## 8. Responsive strategy

Breakpoints by content: 320 (floor), 768 (tablet), 1440 (desktop). Hero scales via
`svh` + `clamp()`. Product rail becomes a horizontal scroll-snap rail below 768. No horizontal overflow
at any width. Tap targets ≥ 44px.

## 9. Accessibility and performance requirements

- WCAG 2.1 AA; semantic HTML, real controls, visible focus (2px ice-blue ring).
- Keyboard: full tab order, skip link, no focus traps.
- Reduced motion honoured in CSS and JS.
- Media budget: hero ≤ 600 KB (currently 844 KB for frames 1–30, over budget). Static JS budget: ≤ 30 KB gzipped (30.1 KB uncompressed, ≈9 KB gzipped). **React migration (2026-10-25):** JS is **85.00 KB gzipped** (267.04 KB raw) including React, Motion, and the prerender hydration path; this is the new measured ceiling, not a claim that the old 30 KB budget still holds.
- LCP target: hero poster < 2.5s on 4G. No third-party requests on load.

## 10. Signature feature

**Scroll-scrubbed ice-cube hero.** The visitor cracks/forms the ice by scrolling;
frames are addressable, reversible, holdable. The single memorable, project-specific thing.
Kept per owner request.

## Mobile-centric direction (added 2026-10-25)

Reference: https://60fps.design/ — curated 60fps UI/UX animation from best-in-class mobile apps.
Principles adopted: thumb-zone primary actions, bottom-anchored CTAs, scroll-snap rails,
spring-physics micro-interactions (transform/opacity only), 44px+ tap targets,
bottom-sheet patterns for transient panels, no hover-only affordances.

Mobile rules:
- Primary CTA (WhatsApp order) is reachable in the thumb zone at all times on mobile.
- Product rail uses horizontal scroll-snap on mobile; vertical stack on desktop.
- All interactive elements ≥ 44px; no hover-only disclosure.
- Motion is 60fps-friendly: transform/opacity only, no layout thrash, spring easing.
- Reduced motion respected (60fps site is a reference, not a mandate to animate).

- Centered hero with gradient blob: avoided (asymmetric, no blob).
- Three identical feature cards: avoided (products differ in structure).
- Purple-blue gradient on dark: avoided (single ice-cyan accent).
- 24px-radius cards with soft shadow: avoided (hairline rules, flat surfaces).
- Decorative 01/02/03 markers: avoided (no counters).
- Stock illustration people / floating 3D: avoided (no 3D, no stock).
- Fade-up on every section: avoided (only hero + one reveal per section).
- Lorem-grade copy: avoided (real shop data only).
- One-size-plus-bold type scale: avoided (fluid clamp scale, weight variation).

## Assumptions stated

- No new user interview; reusing confirmed shop data (prices, hours, address, WhatsApp).
- Fonts/colors reuse the existing verified self-hosted set; no new unverified assets.
- React, React DOM, Vite, Tailwind, and Motion were added by the owner-approved migration; no new fonts, photography, illustration, 3D, or WebGL. Hero frames reused from the existing reel.
- WebGL/crystal removed (never worked on this hardware); not reinstated.

## Risks

- Hero frame weight (844 KB for frames 1–30) dominates LCP; must ship poster + lazy frames.
- Contrast on dark canvas with cyan accent needs verification per surface.
- Reduced-motion path must be tested, not assumed.

## Unverified

- Font license files not present in repo; inherited from original author's verification
  (DESIGN.md). Re-verify before any new font is added.
- No measured LCP/CLS yet (stage 9).
