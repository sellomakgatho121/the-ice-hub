# The Ice Hub — Creative Resource Shortlist (redesign pass)

**Date:** 2026-10-25
**Registry:** `~/.config/opencode/design-intelligence/creative-resource-registry.md` — updated 2026-10-25 with the verified Magic UI, Motion Primitives, and Origin UI findings.

## React/Tailwind migration (current, 2026-10-25)

The deploy target is now `app/`. The static-site decisions below are historical for
`site/` (the verified rollback); they no longer describe the React app.

| Piece | Version | License | Evidence |
| --- | --- | --- | --- |
| React / React DOM | 19.3.1 | MIT | `npm view` 2026-10-25 |
| Vite | 8.3.5 | MIT | `npm view` 2026-10-25 |
| @vitejs/plugin-react | 6.1.2 | MIT | `npm view` 2026-10-25 |
| Tailwind CSS / @tailwindcss/vite | 4.3.3 | MIT | `npm view` 2026-10-25 |
| Motion (`motion/react`) | 14.6.0 | MIT | `npm view` 2026-10-25 |
| Magic UI NumberTicker | source copy | MIT | GitHub API `magicuidesign/magicui` 2026-10-25 |

**Shortlist decisions**

| Resource | Decision | Reason |
| --- | --- | --- |
| Magic UI | **Used** — NumberTicker for the stats | MIT; direct fit; no second design system |
| Motion Primitives | Evaluated, not shipped | MIT; Motion is used directly instead of a second collection |
| Aceternity UI | Rejected for this pass | Effect-first; the reel is already the signature; no brief-level need |
| Animate UI | Rejected | Repo/license not verified; no needed primitive |
| Origin UI | **Blocked** | AGPL-3.0 (repo LICENSE); commercial network use would require source disclosure |
| 21st.dev | Rejected | Per-component licenses; no component needed |
| Rive / LottieFiles / Spline / ShaderToy | Rejected | Runtime/asset weight, per-asset/shader licenses, no WebGL on this hardware |
| unDraw / Unsplash | Rejected | No illustration/photo need; stock rejected by the brief |
| Mobbin | Reference only | Paid; no app-flow pattern needed |
| Tailwind Plus / Cruip | Blocked | Paid/commercial terms; no purchase |
| Fontshare | Rejected | Bricolage/Instrument pair retained; no new font |

The owner's standing rule is encoded as a mandatory **evaluation** shortlist in
`~/.config/opencode/AGENTS.md` and the registry. Evaluation is mandatory; shipping still
requires a verified license, stack fit, bundle/runtime cost, and accessibility pass.

**Current verification:** `npm test` 21/21; `npm run build` 85.00 KB JS gzip / 5.45 KB CSS
gzip; prerender 10,580 bytes with no `app-html`; QA 320/390/1440 + 390 reduced-motion
`findings: []`, no console or failed-request errors; L3 order, hero scrub, header,
map opt-in, and reduced-motion checks passed. No third-party request on load.

## Problem (historical static pass)

Redesign a static ice-supplier storefront with a scroll-scrubbed hero, no build step,
no third-party requests on load, and a ≤ 30 KB JS budget. Need: one display typeface,
one body typeface, one mono, one icon family, one motion approach. No new dependencies.

## Constraints (historical static pass)

Framework: none (static HTML/CSS/ES modules). Styling: CSS custom properties.
Budget: hero ≤ 600 KB, JS ≤ 30 KB gzipped. A11y: WCAG 2.1 AA, reduced motion.
Browser targets: modern mobile + desktop; no WebGL (GPU context unavailable on this hardware).

The React migration keeps the media/a11y/browser constraints, replaces the 30 KB JS
budget with the measured 85.00 KB gzip ceiling, and keeps the hero reel at 844 KB.

## What the project already has (checked first)

- Fonts: Bricolage Grotesque Variable, Instrument Sans Variable, JetBrains Mono
  (WOFF2, self-hosted). Bodoni Moda and Manrope remain on disk but are no longer
  referenced after the 2026-10-25 type change.
- Icons: lucide inline SVG sprite, 1.5 px stroke, 24×24, monochrome.
- Motion: native scroll + rAF frame scrub (no library).
- 3D: removed (crystal.js deleted; never initialised).

## Candidates and decisions

| Need | Candidate | Version | License | Decision |
| --- | --- | --- | --- | --- |
| Display type | Bricolage Grotesque Variable | vendored WOFF2 | OFL (upstream) — unverified in-repo | **Selected** (already shipped, self-hosted) |
| Body type | Instrument Sans Variable | vendored WOFF2 | OFL (upstream) — unverified in-repo | **Selected** |
| Mono/data | JetBrains Mono | vendored WOFF2 | OFL (upstream) — unverified in-repo | **Selected** |
| Icons | lucide | inline sprite | ISC (verified from upstream LICENSE per DESIGN.md) | **Selected** (reuse) |
| Scroll motion | native rAF frame scrub | n/a | n/a | **Selected** (no library; ≤ 30 KB budget) |
| Parallax band | native rAF `translate3d` | n/a | n/a | **Selected** (one band, passive listeners) |
| Count-up figures | native rAF + IntersectionObserver | n/a | n/a | **Selected** (final value is the no-JS state) |
| Section snap | fullPage.js (serkova template) | — | commercial | **Rejected** — hijacks scroll and conflicts with the sticky scrub hero |
| Serkova display face | PF Handbook Pro | — | commercial, not licensed | **Rejected** — no licence; Bricolage Grotesque carries the same bold grotesque role |
| Serkova body face | Advent Pro | — | OFL (Google) | **Rejected** — would be a new font; Instrument Sans already fits |
| 3D / WebGL | Three.js | — | MIT | **Rejected** — removed; GPU context never initialised on this hardware; no fallback budget worth spending |
| Scroll library | GSAP / ScrollTrigger | — | proprietary (paid for commercial) | **Rejected** — native scrub suffices; avoids license + bundle |
| Glassmorphism | backdrop-filter blur stack | — | n/a | **Rejected** — direction is matte; avoids the glossy cliché and the perf cost |
| Web3Forms | form backend | — | SaaS | **Rejected** — violates zero-third-party-request rule; WhatsApp handoff instead |
| Stock photography | — | — | varies | **Rejected** — no verified license; none in repo |

## Selected (smallest useful set)

- Typefaces: Bricolage Grotesque Variable (display), Instrument Sans Variable (body/UI), JetBrains Mono (data). Reuse; no new font.
- Icons: lucide inline sprite. Reuse.
- Motion: native scroll + rAF (scrub, parallax, count-up). No dependency.
- No new npm dependency, no new font, no new icon family.

## Integration notes

- Tokens mapped in `docs/design/tokens.css` (and mirrored into `site/styles.css`).
- Fonts already in `site/fonts/`; no install. `font-display: swap`, self-hosted WOFF2.
- lucide sprite already in `site/icons.svg`; 1.5 px stroke, 24×24, monochrome.
- Hero frames reused from `site/assets/reel/` (30 used of 48; 844 KB for frames 1–30, over the 600 KB brief budget).

## Verification status

- License verification: Lucide ISC verified from upstream (per DESIGN.md §0). Font OFL status is inherited/unverified in-repo — **verify before shipping** (download LICENSE files into `site/fonts/`).
- Render check: `qa.mjs` 320/390/1440 + reduced motion, all exit 0 with `findings: []` (2026-10-25).
- Reduced motion: verified in the harness (`animated: 0`, `transitioned: 0`) and in Chromium (parallax settled, counters final).
- Interaction: `agent-browser` L3 (parallax transform changes, counters reach 30/10/7/55, header solid after anchor, mobile-bar CTA carries and clears the order, reduced-motion shows all four beats).
- Independent review: `reviewer` + `ui-visual-validator`; majors fixed (mobile-bar order link, header CTA hover/target, no-JS reveal, landscape overlap, reduced-motion beats, 6→7 days, unsourced claims).

## Rejected-alternative summary

Three.js (hardware-incompatible), GSAP (license + bundle), glass blur (direction + perf),
Web3Forms (third-party request), stock photography (no verified license), fullPage.js
(scroll hijack), PF Handbook Pro (commercial licence), Advent Pro (new font, no need).
