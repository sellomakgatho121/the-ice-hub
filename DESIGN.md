# The Ice Hub — Design System Contract (v2, glossy direction)

**Date:** 13 October 2026
**Status:** Draft for approval. Nothing is implemented.
**Supersedes:** `BRAND.md` v1 (mineral/matte, forbidden-word list, Lucide icon lock) in full; `docs/superpowers/specs/2026-09-22-ice-hub-redesign-design.md` §7 (visual system) and §5.2 (avant-garde-not-obscure is retained but reframed by §7 here); `docs/superpowers/plans/2026-09-22-cinematic-whatsapp-storefront.md` (task structure only).

**Inherited requirements.** The old spec (`2026-09-22-ice-hub-redesign-design.md`) carries requirements not restated here. They remain binding **and are cited by title, because section numbers collide between the two documents:**

| Old spec section | Title | Status here |
|---|---|---|
| §8 | Cinematic motion system | Superseded by §6 |
| §9 | Ordering interaction | Restated in §5 |
| §10 | Hours, location, and delivery | Restated in §1 |
| §11 | Responsive behavior | Restated in §2b |
| §12 | Accessibility | Restated in §8 and §8b |
| §13 | Performance and resilience | **Partially restated only** — see below |
| §14 | Error and fallback behavior | Restated as §8b |
| §15 | Verification strategy | Restated as §9 |

**This document wins wherever the two differ.**

**One known gap in inheritance.** Old spec §13 sets general performance requirements that are **not** restated here: total page-weight ceiling, LCP target, and font-load verification. §2b budgets the reel only. **Phase 2 must set the page-weight budget before any surface is built**, or the Lighthouse 100 gate in §9 has no input target to hit. This is an open item, recorded in §11.

**Visual companion:** `lab/proof/materials.html` renders every material, the state ramp, focus states, and the type system described here. This document specifies; that file shows. Serve it with `python -m http.server 8001` and open it. It is a review artifact, not deployable — the real site makes zero third-party requests, while the proof sheet loads fonts from a CDN so the type can be judged before Phase 1 self-hosts them.

---

## 0. Research Log

The frontend skill gates `DESIGN.md` behind a research phase. Four lanes were fired in parallel.

| Lane | Tool | Result |
|---|---|---|
| Typography systems | librarian | Delivered. Ranked 10-font comparison, pairing analysis, `clamp()` scale, `pyftsubset` recipe, contrast table. Drove the font decision below. |
| Icon libraries | librarian | **Failed.** Agent degenerated into a repetition loop; output unusable. Licence facts recovered and independently re-verified against the upstream LICENSE files. Weight/geometry comparison below is from domain knowledge, flagged as unverified. |
| Premium design references | librarian | **Failed.** Result fetch error. Anti-slop checklist in §7 is authored from domain knowledge, not retrieved sources. |
| Existing code inventory | explore | **Failed.** Result fetch error. `site/index.html` (209 lines) was read directly instead. |

**Verified externally:** Lucide = ISC, Phosphor = MIT, both permitting commercial use and modification. Confirmed from `github.com/lucide-icons/lucide/blob/main/LICENSE` and `github.com/phosphor-icons/core/blob/main/LICENSE`.

**Honest gap:** two of four lanes produced nothing usable. The anti-slop checklist and icon-geometry claims are therefore *unverified opinion*, not researched fact. Section 7 is written so it can be challenged item by item.

---

## 1. What supersedes and what survives

This is the load-bearing distinction. Design freedom is total; business truth is not negotiable.

### Survives unchanged (business facts, not design)

- Catalog: 2 kg ice-cube bag R17 / R10 at 20+ · 3 kg bag R22 / R12 at 20+ · 30 kg block R55
- Phone and WhatsApp: +27 81 859 2919 (`27818592919`)
- Address: 9605 Winnie Mandela Zone 4, Raymond Mhlaba Street, Tembisa 1632
- Hours: Mon–Fri 10:00–19:00, Sat–Sun 09:00–21:00, computed in `Africa/Johannesburg`
- Delivery claim, verbatim: "Free delivery around Tembisa."
- Estimates are estimates. Availability is confirmed by the shop.

### Removed

- **Obsolete products.** Current `index.html` sells 5 things: cubes, blocks, **spheres**, **cold drinks**, **venue supply**. Spheres and cold drinks do not exist in the current catalog and must not survive the rebuild.
- Web3Forms email form and the `Lebomorena3@gmail.com` address in `index.html:173`
- **The Crack** — `crystal.js`, `vendor/three.module.min.js`, `<canvas data-crystal>`, 692KB. **This was not incidental.** `BRIEF.md` named it as the project's single signature move ("the visitor cracks the ice themselves by scrolling") and the loudest point of a seven-act feeling curve. The 2026-09-22 spec removed it before this contract existed.

  It also **never worked on this hardware.** `site/lab/redesign/report.json` records `canvas: false`, `webgl: false`, `staticFallback: true` — the GPU context never initialised, so the peak moment of the original design rendered as a static image on every load. Deleting it removes dead weight, not a working feature.

  **Consequence for §11:** the 40-frame reel is not the original signature idea. It is the substitute that took its place. If the brief's promise is what matters, the honest options are to keep the reel as the protagonist, or to commission a replacement motif — not to treat the reel as if it were always the plan.

- **"Pre-order for collection" as the single action.** `BRIEF.md` was emphatic: one action, one label, repeated on every CTA. This contract replaces it with a WhatsApp handoff and a quantity builder. That is the correct commercial direction, but it is a change of the brief's core instruction, not a continuation of it.
- The BRAND.md forbidden-word list and the matte-only material rule

---

## 2. Art direction: "Cold, lit from behind"

> **Revised after critique.** The previous concept — a single key light from the top-left with a bright top-edge catch — was rejected. It is the first result for any glassmorphism tutorial (iOS 7, 2013), and it is incoherent with the brief: a bright top-edge catch reads **wet and warm**, not cold. A design built on light *entering* a surface cannot be cold. This section replaces it.

Ice is the only common substance that is simultaneously transparent and reflective. The system is built on that fact, and on its second-order consequence, which is what most ice imagery gets wrong: **ice is not lit. It is lit through.** Light enters, scatters, and leaves.

**The unifying rule: every surface shows light that has already passed through it.**

Each glass surface therefore has **two** edges, and they are not the same:

- **Entry edge** (top): narrow, crisp, brighter. Light arriving.
- **Exit edge** (bottom): wider, softer, dimmer, and slightly cooler. Light leaving, having lost coherence.

```css
border-top:    1px solid var(--glass-entry);   /* entry: crisp, bright  */
border-bottom: 2px solid var(--glass-exit);    /* exit: wider, dimmer    */
```

That asymmetry is the concept. It is physically motivated, visually subtle, and it is not the first thing any glassmorphism tutorial teaches — because nobody thinks to model light leaving.

**Dispersion is the one sanctioned break in the two-hue rule.** Real ice splits light, so one element per viewport may carry a 1px chromatic split on its entry edge, cyan on one side and amber on the other.

The accurate form of the rule: dispersion is **the only place both hues touch the same element**. Amber-as-CTA and cyan-as-link routinely coexist *on screen* — the header CTA is amber on every viewport — so "the only place both hues appear" would be false. What is genuinely unique is both hues meeting *on one surface*.

```css
/* hard edge only — no blur, no bloom, no drop-shadow.
   A blurred chromatic split reads as chromatic aberration, which is
   an optical defect, not an optical effect. It must read as a seam. */
border-image: linear-gradient(90deg, var(--refract) 0 50%, var(--amber) 50%) 1;
```

**The colour separation is settled by measurement, not assumption.** `--refract` vs `--amber` measures **ΔE76 76.23** — roughly 33× the perceptibility threshold, on both `--abyss` and `--shelf`. Dispersion is not at risk of being invisible because the hues are too close; they are about as far apart as two hues can be. It will not be cut for lack of colour contrast.

**The only open question is spatial, not chromatic:** whether a 1px line renders at all on a low-DPR display. Phase 0 therefore tests **1px at 1× DPR** specifically. A 1px hairline can alias into nothing at devicePixelRatio 1, and that is the only failure mode that remains open.

**Etched, not glazed.** Where the old concept called for gloss, this calls for **etched glass**: high blur, *no* border highlight, low contrast, with text set **beside** the etched plane rather than on it. Etched glass is the material that is actually cold, and it is the one surface the AI-gloss aesthetic never reaches for.

### Material model

Four materials, each with a defined recipe. Not interchangeable.

**1. Refraction (hero, dark surfaces)**
Full-bleed photography. Content sits on a graded veil, never a flat scrim, so it holds contrast across all 40 frames. Type is set directly on the image.

**The colour grade is a light touch, not the carrier of "cold."** A modest cool shift and contrast lift is applied; nothing else. The coldness is carried by the Didone hairlines, the mineral palette, and the Etched material, which hold it with or without any grading at all. This is deliberate: the source footage is uncommissioned and its native colour temperature is unknown, so a heavy grade would be a dependency on an asset nobody has seen. **If the grade fails, ships late, or the footage turns out warm, the design still reads cold.** Anything load-bearing must not depend on an uninspected input.

**2. Glass (floating surfaces: scrolled header, order summary, stepper well)**
```css
background: var(--glass-fill);                        /* UNIFORM — no directional gradient */
@supports not (backdrop-filter: blur(1px)) { background: var(--glass-fallback); }
backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat));
-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat));
border-radius: var(--radius-lg);
border-top:    1px solid var(--glass-entry);   /* entry: crisp, bright  */
border-bottom: 2px solid var(--glass-exit);    /* exit: wider, dimmer    */
border-inline: 0;                               /* never a 4-sided border */
box-shadow: var(--glass-shadow);
```

**The fill is deliberately uniform.** An earlier draft used `linear-gradient(160deg, …)`, which places its brightest stop at the upper-left — reintroducing exactly the top-left key light this section rejects. A diagonal gradient is the fingerprint of a directional light source, and it is the single clearest tell that "transmission" is only cosmetic. **All directional information lives in the edge pair; the interior carries none.**

Six corrections, each a known AI-generated tell:

1. **Uniform fill, no diagonal gradient.** See above. A gradient here would reintroduce a key light.
2. **Two edges, not one.** Entry is narrow, crisp and bright. Exit is double width, softer and dimmer. A uniform 1px border on all four sides is the glassmorphism signature and is banned.
3. **Exit edge at 16%, and the value is measured, not asserted.** An earlier critique claimed the original 10% value sat "below the perceptual threshold" and would have shipped invisible. **Colorimetry does not support that.** Compositing `rgb(180 214 226)` over `--deep`:

   | Exit alpha | vs backdrop ΔE76 | vs **entry edge** ΔE76 | vs panel fill ΔE76 |
   |---:|---:|---:|---:|
   | 10% | 9.34 | **15.14** | 1.77 (marginal) |
   | 16% | 14.69 | **10.03** | 6.78 (solid) |
   | 22% | 19.86 | 5.55 | 11.91 |

   ΔE76 ≈ 2.3 is reliably perceptible. At 10% the exit edge was never invisible against the backdrop or the entry edge. 16% is chosen for a different reason: **at 10% the exit edge sits only ΔE 1.77 from the panel fill**, and a 2px line needs more separation from its immediate neighbour than a large area does. So 16% buys edge-against-fill legibility while still keeping the entry/exit split obvious at ΔE 10.

   Note the inverse relationship: **raising the exit alpha toward the entry alpha erodes the concept.** At 22% the pair-delta falls to 5.55 and at 30% to 4.46. The exit edge must stay clearly dimmer. If the two edges ever read as equal, the transmission model has collapsed into a uniform border.
4. **`saturate(120%)`, not `140%`.** The heavy boost compensates for desaturated generated imagery and is the stock glass-card recipe. Real glass shifts colour very slightly.
5. **Shadows are tinted.** A neutral `rgb(0 0 0 / 55%)` shadow on a cool scene is the clearest tell of a template. Shadows are coloured light; in a blue scene they are blue.
6. **A grain overlay.** `feTurbulence` at 3% costs ~200 bytes and no request, and kills the unnaturally smooth neural-net look. Photographic texture is what generated imagery lacks.

**The two-edge asymmetry is mandatory.** A glass surface with a uniform border reads as a translucent rectangle.

**Glass gate — a test, not a list.** Glass earns its place only when both are true: (a) there is high-frequency detail behind it that the blur destroys, and (b) removing the blur would lose information. If the backdrop is a flat colour, glass is decoration and must be cut. A fifth glass surface is not automatically wrong; a fifth *material* is what breaks the system.

**3. Etched (quiet planes: audience card grounds, map panel, secondary bands)**
The cold cousin of Glass, and the material the glossy AI aesthetic never reaches for.
```css
backdrop-filter: blur(var(--etched-blur));
background: var(--etched-fill);
border: 0;                        /* no rim: etched glass has no lit edge */
/* text sits beside the plane, never on it */
```
Higher blur, no rim, lower contrast. Where Glass says "this is an active control," Etched says "this is space." Never nest Etched inside Glass.

> **Etched planes are panels, not grounds.** An Etched surface is never the page background — it is always a bounded panel with content beside it. "Audience card grounds" means the plane behind each card, not a section-wide plane. A section-wide Etched plane would place text *on* the plane, violating the rule; that configuration is not permitted.

**4. Counter (commerce surfaces: product cards, ordering)**
Bright, near-opaque, cool blue-white. The deliberate visual opposite of Refraction. This is the "moving from the cold room to the service counter" beat, preserved as a material transition rather than a scroll trick.

```css
background: var(--counter);                        /* #F2F6F8 */
--counter-card:  #FFFFFF;                          /* product card surface */
--counter-hair: rgb(10 20 27 / 12%);               /* dividers, card edges */
--counter-ink:   #0A141B;                          /* 17.11:1 */
--counter-mute:  #556E7A;                          /* 4.96:1 */
--counter-link:  #0F5A73;                          /* 7.07:1 */
--counter-shadow: 0 2px 8px -2px rgb(2 12 20 / 18%);
box-shadow: var(--counter-shadow);
```

**Card separation is carried by the hairline, not the fill.** Measured: `--counter-card` on `--counter` is ΔE76 **3.77** (above the ~2.3 perceptual threshold, so cards do read as distinct) but only **1.087:1** contrast. That is marginal, and it means the surface difference alone is doing less work than it appears to. The separation is really carried by `--counter-hair` at ΔE76 **9.57**, with the shadow reinforcing it. **The hairline is not optional on this surface** — removing it leaves cards floating on near-white with nothing but a soft shadow to define them.

**Section-to-surface map.** Every section is assigned, so no token is orphaned:

| Section | Ground | Notes |
|---|---|---|
| Hero | `--abyss` | Photography over it, Refraction material |
| Counter | `--counter` | Cards at `--counter-card`, dividers `--counter-hair` |
| Audience | `--deep` | Etched panels sit on it |
| Visit | `--counter` | Map panel is Etched |
| Footer | `--abyss` | `--frost` at `--text--1` |
| Floating: header, summary, stepper | `--shelf` (as the fallback fill) | Glass over whatever is behind |

**Layering contract.** `backdrop-filter` creates a containing block and clips any filtered element behind it. With a pinned hero, a fixed summary and a transparent-to-glass header, stacking order must be explicit or panels will vanish:

```css
--z-base: 0; --z-raised: 10; --z-sticky: 20;
--z-header: 30; --z-summary: 40; --z-skip: 50;
```
Glass elements may never share a stacking context with a filtered ancestor.

### Palette

Tokens are **scoped by surface**. A single flat table is a defect: the cyan that reads correctly on midnight is invisible on the bright counter. Verified ratios are given, not estimated.

**On dark surfaces** (`--abyss`, `--deep`, `--shelf`)

| Token | Value | Role | Verified |
|---|---|---|---|
| `--abyss` | `#05090C` | Deepest ground, hero base, amber-CTA focus inner lip | — |
| `--deep` | `#0A141B` | Dark surface | — |
| `--shelf` | `#12222C` | Raised dark surface | — |
| `--frost` | `#FFFFFF` | Primary text on dark, rim highlights, amber-CTA focus outer ring | 18.4:1 on abyss |
| `--mist` | `#AFC6D0` | Secondary text on dark | 11.1:1 on abyss |
| `--haze` | `#7D96A0` | Tertiary text, eyebrows on dark | 6.3:1 on abyss |
| `--refract` | `#6FD3EA` | Links, focus, progress, active state **on dark only** | 11.59:1 on abyss, 9.44:1 on shelf |
| `--amber` | `#E0A45C` | Primary CTA **fill only**, on dark | 9.17:1 on abyss |

**On the bright counter surface** (`--counter` `#F2F6F8`)

| Token | Value | Role | Verified |
|---|---|---|---|
| `--counter` | `#F2F6F8` | Bright commerce surface | — |
| `--counter-ink` | `#0A141B` | Primary text on counter | 17.11:1 |
| `--counter-mute` | `#556E7A` | Secondary text, eyebrows on counter | 4.96:1 |
| `--counter-link` | `#0F5A73` | Links and focus on counter | 7.07:1 |

**Hard rules, each one a measured failure if broken**

- `--refract` is **banned on `--counter`**. It measures **1.59:1** there. On the counter, links and focus use `--counter-link`.
- `--amber` is **banned as text on `--counter`** (2.00:1). It is a fill only, always carrying `--abyss` text at 9.17:1.
- `--frost` and `--mist` are **banned on `--counter`** (1.09:1 and 1.64:1).
- Focus indicators need 3:1 against their adjacent surface. `--refract` satisfies this on dark; `--counter-link` satisfies it on the counter.
- `<html>` declares `color-scheme: dark`, so the counter section must declare `color-scheme: light` or form controls and scrollbars render dark on a bright surface.

### The one named exception

BRAND.md banned gloss. It is superseded, but gloss is not allowed to run wild. Glass is expected on exactly four surfaces: the scrolled header, the order summary, the quantity stepper well, and the opt-in map panel. Etched carries the quiet planes. A glass card grid is the single most recognisable AI-generated interface of 2026.

The four named surfaces are an *expectation*, not a whitelist; the gate above is the actual rule. A fifth glass surface passes only if it satisfies the gate.

---

## 2b. Primitive scales

Everything below is a token. No raw values in component CSS.

### Material tokens

Declared here so the §2 material recipes contain no raw values. A recipe that hardcodes `rgb(255 255 255 / 22%)` cannot be re-themed, and it silently violates this rule.

```css
/* Glass */
--glass-fill:      rgb(255 255 255 / 7%);
--glass-fallback:  rgb(18 34 44 / 94%);   /* = --shelf at 94% */
--glass-entry:     rgb(255 255 255 / 22%);
--glass-exit:      rgb(180 214 226 / 16%);
--glass-shadow:    0 24px 64px -12px rgb(2 12 20 / 60%);
--glass-blur:      20px;
--glass-sat:       120%;

/* Etched */
--etched-fill:     rgb(18 34 44 / 55%);    /* = --shelf at 55% */
--etched-blur:     32px;

/* Grain */
--grain-opacity:   3%;
```

### Spacing — a rhythm, not a grid

Base 4, then a deliberate **1.625 ratio**. A uniform 8px scale is itself an AI tell: real layouts have a pulse, with small gaps nested inside large ones.

```css
--space-3xs: 0.25rem;   /*  4px  hairline gaps            */
--space-2xs: 0.5rem;    /*  8px  icon-to-label            */
--space-xs:  0.75rem;   /* 12px  inside controls          */
--space-sm:  1rem;      /* 16px  component padding        */
--space-md:  1.5rem;    /* 24px  card padding             */
--space-lg:  2.5rem;    /* 40px  between grouped items    */
--space-xl:  4rem;      /* 64px  section internals        */
--space-2xl: 6.5rem;    /* 104px between sections (desk)  */
--space-3xl: 10rem;     /* 160px, hero scale only         */
```

Mobile collapses `--space-2xl` to `--space-xl`. Section rhythm on a 390px screen is 64px, not 104px.

### Radii

```css
--radius-sm:   6px;    /* tags, chips                     */
--radius-md:  12px;    /* buttons, inputs                 */
--radius-lg:  20px;    /* cards, glass panels — not 16px  */
--radius-pill: 999px;  /* status dots                     */
```

16px is the glassmorphism default and is banned. Nothing exceeds `--radius-lg`; full circles are `--radius-pill` only.

### Easing and duration

```css
--ease-out:        cubic-bezier(0.16, 1, 0.3, 1);      /* entrances */
--ease-in-out:     cubic-bezier(0.65, 0, 0.35, 1);    /* state changes */
--ease-cinematic:  cubic-bezier(0.2, 0.78, 0.2, 1);   /* reel scrub only */

--dur-fast: 120ms;   /* hover, press                     */
--dur-base: 220ms;   /* default transitions              */
--dur-slow: 420ms;   /* scene changes                     */
```

`transition: all` is banned. Every transition names its properties explicitly. Anything above 420ms is a scene change, not an interaction, and must be justified against reduced-motion.

### Interaction state ramp

§7 bans accent-coloured borders on rounded surfaces as the #1 AI-slop tell, and mandates the replacement: **one ink at many alphas**. That replacement is only enforceable if the steps exist. Undefined, every component invents its own and the ramp drifts. These are the only permitted steps.

```css
/* DARK surfaces: ink is --frost */
--wash-rest:     0%;
--wash-hover:    4%;    /* @media (hover: hover) only */
--wash-active:   8%;    /* pressed */
--wash-selected: 12%;   /* always paired with a check glyph, never alone */

/* LIGHT counter surface: ink is --counter-ink */
--wash-rest-light:     0%;
--wash-hover-light:    4%;
--wash-active-light:   8%;
--wash-selected-light:12%;
```

**Step size is measured, not conventional.** Consecutive steps composite to ΔE76 **3.19–4.34** apart on the counter and **3.85–4.34** on `--shelf`, against a ~2.3 perceptual threshold. The steps are separable by a clear margin and still subtler than the entry edge, so hover never competes with the material.

Three rules that make the ramp work:

1. **Selection always carries a glyph.** `--wash-selected` alone reads as "slightly darker" and is indistinguishable from hover. Selection = 12% wash **plus** a `check` glyph at `--frost` / `--counter-ink`.
2. **Focus is never a wash.** It is a `:focus-visible` ring, 3px at 2px offset. A wash cannot work here, and the reason is measurable: the widest wash step in this ramp (`--wash-selected`, 12%) reaches only **1.28:1** against the counter surface, while **WCAG 1.4.11 Non-text Contrast** requires **3:1** for any visual information identifying a component state. A wash focus indicator fails 1.4.11 by more than a factor of two, and additionally fails **2.4.7 Focus Visible** in forced-colors mode, where user agents strip background colours and rely on outlines — a background-only indicator simply disappears. *(An earlier draft mis-cited 2.4.11 here; that criterion is "Focus Not Obscured (Minimum)" and does not govern focus appearance. 2.4.13 Focus Appearance — AAA, and the criterion that actually governs indicator size and contrast — is met by the 3px / 2px-offset ring, which exceeds its 2px minimum perimeter.)*

   **Ring colour by surface, including the CTA — which is a third case, not a variant of the others:**

   | Surface | Ring | Measured |
   |---|---|---:|
   | Dark (`--abyss`, `--deep`, `--shelf`) | `--refract` | 11.59:1 on abyss |
   | Counter (light) | `--counter-link` | 7.07:1 |
   | **Amber CTA fill** | **two-tone: `--abyss` inner lip + `--frost` outer ring** | 9.17:1 / 18.4:1 |

   The amber CTA needs two colours because it is flanked by two different neighbours. With `outline-offset`, the ring floats on the *page*, not on the button, so it must contrast with both. Measured: `--counter-link` is 3.53:1 against the amber fill but only **2.60:1** against the abyss page, failing 1.4.11 on the side that matters. A single-colour ring cannot satisfy both, so the CTA carries a 1px `--abyss` inner lip against its own fill and a 3px `--frost` outer ring against the page.
3. **Hover is capability-gated.** Wrapped in `@media (hover: hover)`. On touch there is no hover, and a stuck hover wash on tap reads as a permanent selection.

**Never mix ramps.** A component that crosses from a dark to a light surface switches ink, never interpolates.

### Breakpoints and grid

```css
--bp-sm: 600px;    /* mobile ends        */
--bp-md: 1024px;   /* tablet ends        */
--bp-lg: 1440px;   /* content max reached */

--shell:       min(1440px, 100% - 8rem);   /* 128px margins at desktop */
--shell-tablet: min(1024px, 100% - 3rem);
--shell-mobile: calc(100% - 2rem);          /* 16px margins, 320px floor */
--gutter: clamp(1rem, 4vw, 2.5rem);
```

| Band | Width | Columns | Shell |
|---|---|---:|---|
| Mobile | 320–599 | 4 | `100% - 2rem` |
| Tablet | 600–1023 | 8 | `100% - 3rem` |
| Desktop | 1024–1439 | 12 | `100% - 8rem` |
| Wide | 1440+ | 12 | capped 1440px |

Every image and reel frame carries explicit `width`/`height` or an `aspect-ratio` box so nothing shifts on load.

### Reel asset budget

Measured baseline: **40 frames at 1280×720 = 1.2MB**, per-frame 17KB–85KB. Shipping that untouched makes a Lighthouse 100 performance score unreachable.

| Derivative | Width | Quality | Applies to |
|---|---:|---:|---|
| Poster | 1280 | 72 | First paint, reduced-motion still |
| Mobile set | 640 | 68 | 320–599px only |
| Tablet set | 960 | 72 | 600–1023px only |
| Desktop set | 1280 | 75 | 1024px+ only |

**These budgets are currently UNACHIEVABLE and that is a measured finding, not a target to negotiate down.**

The source is 40 frames at 1280×720 totalling **1.09 MB, averaging 27.8 KB/frame** (verified: uniform dimensions, 3 components, no EXIF). The 600 KB desktop ceiling is therefore **below the JPEG source floor** — no amount of JPEG quality tuning reaches it, because re-encoding cannot beat a smaller original.

Attempted on this host: `jpeg-js` re-encode made it *worse* (1280w q75 → 2.14 MB, roughly double the source).

> **Superseded — an encoder IS now available.** The toolchain note below was accurate when written: this host had no `cwebp`, `avifenc`, `ffmpeg` or ImageMagick. `cwebp` 1.3.2 (from the Termux package `webp`; note `libwebp` is the wrong name and does not resolve) and `ffmpeg` 6.1.1 were installed on 2026-10-13 while preparing the replacement reel, so WebP encoding now happens in-house. What actually paid off was not the format but **downscaling**: at equal dimensions WebP is a wash against the source JPEG (28.0 KB vs 27.8 KB), because this footage is unusually dense. `@jsquash/webp` installs but its WASM encoder cannot initialise (`fetch` for the `.wasm` is unimplemented on this Node). No `cwebp`, `avifenc`, `ffmpeg`, or ImageMagick is present.

**Therefore Phase 1 must change the codec, not the quality setting.** Realistic options, in order of preference:

1. **WebP or AVIF, encoded off-host.** WebP typically lands 25–35% under JPEG for photographic content, putting 40 desktop frames near 700–820 KB. AVIF can reach the 600 KB ceiling but costs more encode time. This host cannot run either encoder; CI or a desktop machine can.
2. **Fewer frames.** 40 is the source count, not a requirement. Dropping to ~24 frames at 1280w JPEG lands near the ceiling with no tooling at all, and a slower scrub can read as more deliberate rather than less.
3. **Reduce desktop width** to 1024w, which is defensible since the reel is atmospheric and sits behind a veil.

**RESOLVED: 48 frames merged from two supplied clips, 640×360 WebP q72. 589 KB.**

> **The hero footage was replaced on 2026-10-13.** The previous reel was abstract ice footage extracted from a 40-frame GIF, and the owner reported the scroll animation as "choppy". Diagnosis was not a missing library: perceived smoothness is governed by **pixels per scroll pixel**, and that build sat at **130.5 px/frame**, 4–6× into the visibly-steppy band. See §5 for the hero height that now fixes it.
>
> The replacement is a genuine product animation — a branded 2 kg bag that holds still, tilts, bursts into ice cubes and vapour, then tumbles away as the pile settles. **The owner supplied it as two clips and confirmed the second continues the first**, so they are merged into one continuous **15-second** sequence:
>
> | Reel frames | Source | Clip | Duration |
> |---|---|---|---|
> | 01–25 | video 1 frames 1–168 | 1280×720, H.264, 24fps | 0.0–7.0s |
> | 26–48 | video 2 frames 1–192 | 640×360, H.264, 24fps | 7.0–15.0s |
>
> Encoded to **640×360 WebP q72, method 6**, measuring **41.9 dB PSNR averaged across the sequence** — visually lossless, where 40 dB is the conventional threshold. Real total **589 KB**, 11 KB inside the ceiling.

**The continuation was verified, not assumed.** Video 1's motion profile accelerates out (`0.2 → 5.8`) and video 2's decelerates in (`5.2 → 0.4`) — complementary, as a continuation should be. But the clips share **no overlapping frame**: the closest any video-2 frame comes to any video-1 frame is **7.6× an in-sequence step**, where a true overlap would be ~0. The join is therefore a real discontinuity, and every candidate seam was measured rather than guessed.

**The seam is handled as an edit, not dissolved.** Cutting video 1 at frame 168 and starting video 2 at frame 1 is the smoothest available join at **6.64× the mean in-sequence step**. For scale, the previous ice clip's deliberate cut measured 2.9× its own mean, so this seam is over twice as violent as an ordinary edit — dissolving it would smear. It is placed **exactly on the beat 3/4 boundary** and swapped without a crossfade (`CUT_AFTER = 25`), so it reads as intentional. All 47 other transitions dissolve.

**Both clips were normalised to 640×360**, video 2's native resolution. Upscaling video 2 to match video 1's 1280×720 would add no real detail and would make the seam visibly sharper-to-softer mid-scroll; matching to the lower resolution keeps the join invisible. **This is a recorded trade:** it costs sharpness on large displays, and only 11 KB of headroom remains in the reel budget to recover it. If a 1280×720 version of video 2 exists, the merge should be redone at a higher resolution.

**The native-video route was measured and rejected, not assumed.** Both source clips have **1 keyframe** (only the first frame), so frame-accurate `currentTime` scrubbing is not possible without re-encoding. The cheapest short-GOP re-encode (`crf30 -g 8`) came to **1,234 KB — 2.2× the entire reel ceiling** — and seeking still stutters on mobile. Frame extraction wins on payload *and* on control.

**This content is not cheap to encode.** Action frames cost **32% more** than the static opening (18.9 vs 14.3 KB per frame at 800px q72) — the ice-cube and vapour detail is high-frequency. At native 1280×720, 48 frames would have cost 1,799 KB. Resolution, not format, is where the bytes are: WebP at *equal* dimensions is a wash here (28.0 KB vs a source JPEG's 27.8 KB).

> **CORRECTED 2026-10-13 by decoding all 40 source frames** (`jpeg-js`, 160×90 luma). Three earlier claims in this document were wrong and are superseded by measurement.
>
> **1. The subset is not an even stride.** It is
> `[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40]` —
> stride 2 up to 19, then a jump to 22 and stride 2 to 40. "1, 3, 5 … 39" was wrong on the tail.
>
> **2. The subset does not bridge the hard cut. It absorbs it.** The cut is at source **37→38**. The subset omits 37 but keeps 36 and 38, so the discontinuity falls *inside* the single subset step 18→19 (source 36→38), measured at **50.5** against a clean baseline of mean 21.5 / sd 9.4 — **3.1 sd**, far outside the clean maximum of 38.8. A step that spans a discontinuity cannot be smaller than it. "Bridges" was wrong; the cut is still on screen.
>
> **3. The peak is beat 2, not beat 3.** Measured subset steps are front-loaded: `3.9, 7.1, 10.9, 27.6, 32.2, 38.8, 17.9, 27.0, 26.8, 37.2, 29.8, 21.7, 19.6, 20.1, 18.8, 15.7, 14.2, [cut 50.5], 16.8`. The largest clean steps are 06→07 and 10→11, both in beat 2.

### The 180 KB critical path — RESOLVED, and it does fit

This section previously declared the budget unachievable. That verdict was computed against the **40-frame** design, which preloaded 3–5 frames:

| Composition (old 40-frame build) | Initial payload |
|---|---:|
| 3 preloaded frames + 56 KB display font + 30 KB code | 283 KB |
| 5 preloaded frames + same | 352 KB |

The fixed cost was 86 KB before a single frame loaded, so no subset size could fix it. **Measured against the built site**, the picture changed, because only one frame is ever preloaded:

| Layer | Measured |
|---|---:|
| `index.html` gzipped | 3.4 KB |
| `styles.css` gzipped | 6.5 KB |
| Fonts (3 WOFF2, already compressed) | 90.8 KB |
| `frame-001.webp` (the only preload) | 16.7 KB |
| **Critical path** | **117.3 KB / 180 KB** |

**The budget is met with 63 KB of headroom**, so it is not recorded as accepted debt. Three things drive the change: the reel is preloaded one frame deep rather than five, the removed Three.js vendor bundle (676 KB) no longer competes for the same budget, and the WebP poster is **16.7 KB where the previous JPEG poster was 52.8 KB** — downscaling, not just format, is what shrank it.

**This is a static measurement, not a Lighthouse result.** Transfer size is arithmetic; LCP, CLS and TBT are not, and those remain unmeasured until a real Chromium runs §9's browser gate.

### Page-weight budget

Measured baseline of the current build, for scale: HTML 3.6KB gzip, CSS 4.4KB, scripts 7.5KB, fonts 93KB woff2, reel 1.14MB, Three.js vendor 692KB (deleted in Phase 5).

**These are hard ceilings. Lighthouse 100 in §9 is unachievable without them, because Lighthouse scores against measured transfer size, not intent.**

| Layer | Ceiling | Notes |
|---|---:|---|
| HTML, gzipped | 8 KB | Budgeted above current 3.6KB for the four-scene hero markup |
| CSS, gzipped | 10 KB | Budgeted above current 4.4KB for four materials, tokens, layering |
| JS, all modules, gzipped | 14 KB | `reel` + `motion` + `order` + `hours` + `map` + `config`. No code splitting needed at this size |
| Fonts, woff2 (already compressed) | 130 KB | §3. Not gzipped again |
| **Critical path** | **180 KB** | HTML + CSS + display font + poster. What LCP waits on |
| **Total excluding frames 7–40** | **200 KB** | The page is fully usable at this weight |

Fonts dominate the budget. They are also the only layer where weight buys quality rather than feature, which is why §3 caps them at 130KB rather than leaving them open.

**Performance targets, measured on a production build in real Chromium:**

| Metric | Target |
|---|---|
| LCP | < 2.0s (Lighthouse mobile, simulated 4G) |
| CLS | < 0.02 — every image and frame carries an explicit `aspect-ratio` |
| TBT | < 50ms — `rAF`-scheduled scroll work, no long tasks |
| Third-party requests on load | **0** |

**Third-party requests on load: zero** is the strictest rule in this document. The map is opt-in, fonts are self-hosted, icons are local, and there is no analytics. Any request to a domain the owner did not name is a gate failure.

---

## 3. Typography

**Decision: replace Bricolage Grotesque and Instrument Sans. Keep JetBrains Mono.**

| Role | Family | Axes | Licence | Rationale |
|---|---|---|---|---|
| Display | **Bodoni Moda** | `wght` 400–900, `opsz` 6–96 | OFL | High-contrast Didone. Sharp hairline serifs read as *cold*, which no geometric sans can. The `opsz` axis gives a true text-size optical master. |
| Text | **Manrope** | `wght` 200–800 | OFL | Monolinear geometric grotesque. Near-zero stroke contrast, so it recedes and lets the Didone carry the voice. Large x-height survives small mobile text. |
| Numeric | **JetBrains Mono** | 400, 700 | OFL | Already shipped. Tabular figures. Prices must align in a column and must never reflow when quantity changes. |

**Why Bricolage Grotesque is cut:** 597 glyphs, Latin-only, no italics, and its design language is compressed and anxious. It fights the concept. Its `opsz` default of 96 also means you must explicitly override it to get neutral rendering.

**Why Instrument Sans is cut:** `wght` 400–700 only. No optical sizing, no weight headroom for a display-adjacent role.

### Type scale (320px → 1280px)

```css
--text--1: clamp(0.833rem, 0.811rem + 0.110vw, 0.9rem);
--text-0:  clamp(1rem,     0.958rem + 0.208vw, 1.125rem);
--text-1:  clamp(1.2rem,   1.131rem + 0.343vw, 1.406rem);
--text-2:  clamp(1.44rem,  1.334rem + 0.530vw, 1.758rem);
--text-3:  clamp(1.728rem, 1.572rem + 0.782vw, 2.197rem);
--text-4:  clamp(2.074rem, 1.850rem + 1.120vw, 2.746rem);
--text-5:  clamp(2.488rem, 2.173rem + 1.575vw, 3.433rem);
--text-6:  clamp(2.986rem, 2.604rem + 1.969vw, 4.12rem);
```

Display type drives `font-variation-settings: 'opsz'` by rendered size. **The ceiling is 72, not the font's 96.** Production precedent is explicit that `opsz 96` is tuned for billboard sizes and "reads as fragile in product UI"; this site's hero caps at 66px, which is heading scale. Overdriving the axis at this size thins the hairlines until they break up on low-DPI Android screens, which is most of this site's traffic.

| Element | Max size | `opsz` |
|---|---:|---:|
| Hero statement | 66px | 72 |
| h2 | 55px | 60 |
| h3 | 44px | 44 |

Leading tightens from `1.15` to `1.0`; body sits at `1.6`.

**`opsz` must be set through `font-variation-settings`, never `font-feature-settings`.** It is a variation axis, not a feature. Using the wrong property is **silently ignored** with no error and no fallback: the browser quietly renders the default optical size and the type looks subtly wrong at every size with nothing in devtools to explain it. This is a documented production footgun; it is called out here because the failure mode is invisible.

**Display weight is 400 to 500, never 900.** Setting a Didone heavy is the cheapest-looking thing you can do to one. Its hairlines thin out, the thick stems slab, and the result reads fashion-magazine rather than expensive. Premium display setting is a *light* weight at a *large* optical size, tracking between `0` and `-0.01em`. Anything tighter than `-0.01em` collapses Didone hairlines at high `opsz`.

**No real italic anywhere.** Verified empirically against the Google Fonts CSS API: **Manrope serves zero italic faces** and **Bricolage Grotesque has none** (Bodoni Moda does). The existing build already handles this deliberately, setting `font-style: normal` on its `<em>` elements and colouring them instead. That convention survives: **`<em>` is a colour-emphasis device, never a slant.** Setting body italics in Manrope produces a synthesised oblique, which reads as broken rather than emphatic.

*(`--accent` in the old `styles.css` is the superseded name for what is `--refract` here. Do not reintroduce it.)*

### Font payload — measured, not estimated

Fetched from the Google Fonts CSS API and weighed. Google splits each family into `latin` and `latin-ext` subsets; `latin` already includes `U+2000-206F` (general punctuation), so it covers this site's full range.

| Family | `latin` | `latin-ext` | Ships |
|---|---:|---:|---|
| Bodoni Moda variable (`opsz` 6–96, `wght` 400–900) | 45.2 KB | 24.4 KB | **45.2 KB** |
| Manrope variable (`wght` 200–800) | 24.3 KB | 14.8 KB | **24.3 KB** |
| JetBrains Mono (already in repo, pre-subsetted) | — | — | **21.3 KB** |
| | | | **90.8 KB** |

**90.8 KB against a 130 KB ceiling — 39.2 KB of headroom.** The earlier 130 KB figure was a guess that happened to match the `latin-ext` total almost exactly, which meant the budget was silently deciding whether to ship `latin-ext`. It does not ship.

**`latin-ext` is not needed and its stated justification was wrong.** An earlier draft claimed the extended subset "covers English and isiZulu diacritics." isiZulu is written in the plain Latin alphabet with no diacritical marks, so basic `latin` covers it completely. Shipping `latin-ext` would have cost 39.2 KB — 30% of the whole font payload — for glyphs the site will never render.

The repo's existing `jetbrains-mono.woff2` is **static, not variable** (no `fvar` table). That is fine for prices and coordinates at two weights, and it is 8 KB cheaper than a variable file would be.

`font-display: swap` on display and text, `optional` on mono. Metric-matched `size-adjust` fallbacks to prevent layout shift.

**Tooling note:** `pyftsubset` and `fontTools` are **not installed on this host**. Either install them, or fetch pre-subsetted files from the Google Fonts CSS API as above and self-host those. Do not ship a Google Fonts CDN `<link>` — the contract requires self-hosting and zero third-party requests on load.

---

## 4. Iconography

**Revised decision: revert to Lucide.** *(Changed after critique; the original Phosphor recommendation was wrong on the reasoning.)*

| | Lucide | Phosphor |
|---|---|---|
| Licence | ISC (commercial + modification) | MIT (same) |
| Weights | Outline only | 6, incl. fill and duotone |
| Register | Geometric, sharp terminals, precise | Rounded, friendly, consumer |

The original argument was that a dimensional system needs fill and duotone icons. **That argument is backwards.** Icons do not need to share the material of the surface they sit on. A hairline icon inside a volumetric panel is *deliberate contrast*, and that is exactly how real hardware reads (Teenage Engineering, Braun, Leica). Material contrast is the more expensive choice.

**Duotone is banned outright.** Duotone and gradient-filled icons are the single most reliable AI-generated-UI tell of 2026. Naming it a selling point would have been self-defeating against a brief whose central requirement is "no AI slop".

Phosphor's rounded, approachable geometry also fights the register. Coldness in an icon comes from sharp terminals and low stroke contrast, which is Lucide.

Selected differentiation (an added-to-cart state, say) is signalled with a **check glyph at the same stroke weight**, never with a weight swap.

*Still unverified: the research lane for icons failed. Icon names below are from domain knowledge and must be visually confirmed before commit.*

**Rules:** 24×24 grid, `currentColor`, 1.5px stroke (the repo already sets this globally: `svg { fill: none; stroke: currentColor; stroke-width: 1.5 }`), no fill, no duotone, no emoji, no icon fonts, no icon-colour boxes. Icons reinforce meaning, never carry it alone.

**Verified against `lucide-static@1.56.0` (2,143 icons).** Names below were checked to exist, not recalled:

| Purpose | Icon | Verified |
|---|---|---|
| Bag products (2 kg, 3 kg) | `box` | ✅ |
| Block product (30 kg) | `weight` | ✅ |
| Cold | `snowflake` | ✅ |
| Melt / water | `droplet` | ✅ |
| Delivery | `truck` | ✅ |
| Call | `phone` | ✅ |
| Location | `map-pin` | ✅ |
| Hours | `clock` | ✅ |
| Price | `tag` | ✅ |
| Stepper | `minus`, `plus` | ✅ |
| Selection | `check` | ✅ |
| Direction | `arrow-right`, `arrow-up-right` | ✅ |
| Supply | `package` | ✅ |
| Quality | `shield-check` | ✅ |

**The 1.5px stroke must be baked into every symbol, not inherited.** Lucide ships `stroke-width="2"` as a *presentation attribute* on each `<svg>`. The repo's global `svg { stroke-width: 1.5 }` rule does **not** reliably reach inside an external `<use>` sprite — the referenced content is a separate document, and host-page selectors generally do not match into it across engines. The result is silent: icons render at 2px, no error, no visual clue in devtools, and the whole weight system quietly misses its mark.

So the sprite must declare the weight itself:

```xml
<symbol id="truck" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"> … </symbol>
```

Verified working sprite: 16 symbols, **4.8 KB**, all IDs resolving. A ready-built one is at `lab/proof/icons.svg`.

**Lucide supplies the interface icons only. It does not supply the three product marks.** Its closest ice-adjacent glyphs are `dice-1`–`dice-6` and `ice-cream-*`, none of which is an ice bag. Drawing three bespoke marks — bag, bag, block — at one consistent construction will do more for this site than any choice between icon libraries, and costs three paths rather than a dependency.

Ship as a single inline `<svg><use href="icons.svg#id">` sprite, ~15 icons, committed to `site/icons.svg`.

---

## 5. Page architecture

Single continuous document, anchored navigation.

### Composition contract

Premium-ness is mostly composition, not material. Every section below declares the same four things so that no screen can drift into a uniform grid of equal-weight cards. **One focal point per section. If two things are competing for attention, one of them is wrong.**

| § | Section | Grid | Biggest thing | Deliberately small |
|---|---|---|---|---|
| 1 | Header | 12-col, single row | Wordmark | Status, nav — all `--text--1` |
| 2 | Hero | Full-bleed, asymmetric 5/7 | The reel statement at `--text-6` | Beat labels, frame index |
| 3 | Counter | 3-col equal | Price figures at `--text-5` mono | Eyebrows, use-labels |
| 4 | Audience | 3-col, staggered vertical offsets | Section heading | Card body copy |
| 5 | Visit | 7/5 split | Hours table as `--text-1` | Address lines |
| 6 | Footer | 12-col, single quiet row | Nothing | Everything, uniformly `--text--1` |

**Asymmetry is mandatory.** No section may place its heading centred above a centred row of equal cards. The old build already used a 5/7 split and staggered offsets; that instinct is kept.

**Every section gets exactly one element above `--text-4`.** Two large elements competing in one viewport is the most common way a premium layout collapses into a template.

### Section detail

1. **Header** — wordmark, live open/closed status, Products/Delivery/Visit, amber WhatsApp CTA. Transparent over hero, transitions to Glass on scroll. Nothing here exceeds `--text-0`.
2. **Hero** — the 48-frame merged product animation, pinned, **180svh**. Four beats mapped to what the footage does, not to equal arithmetic. The clip change falls exactly on the beat 3/4 edge:

| Beat | Frames | Source time | What is on screen | Line |
|---|---|---|---|---|
| 1 Recognition | 01–07 | 0.0–2.0s | Bag at rest, frontal | Monumental statement, `--text-6` — **"Below freezing, on Raymond Mhlaba Street."** |
| 2 Compression | 08–14 | 2.0–4.0s | The tilt, then the burst | "From one bag to twenty." with pricing and bulk threshold as utility annotations |
| 3 Release | 15–25 | 4.0–7.0s | Tumble, ending **on the cut** | "More cold. Less waiting." with free delivery around Tembisa |
| 4 Conversion | 26–48 | 7.0–15.0s | Clip 2: cascade, bag lifting out, pile settling | "Choose it. Send it." |

**The hero is 180svh, down from 390svh, and that is a deliberate reversal.** Density is `px/frame = (heroVh − 100)/100 × viewportHeight ÷ 48`. At 390svh that is **56.3 px/frame**; at 180svh it is **15.0 px/frame**, the middle of the comfortable 15–20 band. The original specification asked for a very long runway *and* a small frame set, and the two were mutually incompatible — that mismatch was the choppiness. A shorter pinned hero is also less of a scroll commitment.

**Beat 3 ends exactly at the clip seam** (frame 25) so the discontinuity between the two supplied clips reads as a deliberate edit rather than a stutter. See §2b for how that seam was located and measured.

The peak falls in beat 3, not beat 2, and beats 2 and 3 are within 1 unit of each other — so the release and conversion beats carry comparable visual weight. If the choreography needs one unmistakable climax rather than a sustained one, shift the beat 2/3 boundary two frames later.

Only beat 1 depends on the owner decision. **The other three are settled and Phase 4 can build them now.**

**The reel's real motion profile, measured.** Decoded all 40 frames and computed mean absolute luma difference between consecutive frames. This is not a uniform sequence, and the beat boundaries must not be assumed to be at 25/50/75%.

| Frames | Mean step | Character |
|---|---:|---|
| 1–10 | 12.1 | Opens **near-still** (steps 2–7 measure only 2–9), then accelerates hard from frame 8 |
| 11–20 | 21.3 | Peak motion. The sequence is front-loaded, not evenly paced |
| 21–30 | 18.2 | Decelerating |
| 31–40 | 15.2 | Settles, with one exception below |

**There is a hard cut at frame 37→38.** Measured by decoding all 40 frames: step **50.0** against a sequence mean of 17.1 — **2.9×** — while the next largest transition is only 28.9. That is a scene change, not motion. Two consequences: the scrub must not interpolate across it, and a beat boundary should land there deliberately so the cut reads as intentional rather than as a stutter.

Both are now handled. The 20-frame subset **cannot** remove the cut (it omits source 37 but keeps 36 and 38, so the jump lands inside subset step 18→19 at 50.5 — see the correction in §2b). The scrub is therefore **nearest-frame only with no interpolation**, which means the jump renders as a single discrete step rather than a blend, and **beat 3 ends at frame 18** so that step coincides exactly with the beat 3/4 boundary. The cut now reads as an edit.

*An earlier draft of this section placed the cut at 38→39 and gave it as 49.2. Both numbers were off; 37→38 at 50.0 is the measurement.*

The front-loaded arc (still → accelerate → peak → settle) is a legitimate narrative shape and it corroborates the "Recognition" beat's intent. It does not, however, align with equal-width quarters — beats 2 and 3 are doing most of the work. Beat boundaries should be tuned to the motion, not to arithmetic. Survives from the old design because it works. The statement is the only `--text-6` on the page.
3. **The Counter** — material flips from Refraction to Counter. Three products, real prices, quantity steppers, live estimated total. **The conversion surface, and it gets the most craft.** Prices are the largest thing here, not product names — the customer scans for cost, not identity.
4. **Audience** — three use cases: everyday, events, venues. Carries the bulk-pricing argument. Cards stagger vertically so the row never reads as a comparison table.
5. **Visit** — SAST status, full static hours, address, click-to-call, WhatsApp, opt-in map. Hours are the largest element because they answer the question people actually arrive with.
6. **Footer** — quiet. Nothing competes with the order CTA directly above it.

### The commerce mechanic

- Quantities start at zero, floor at zero, native `<button>` elements, 44×44px minimum.
- 1–19 bags at standard price; 20+ drops the **entire line** to stock price. 30 kg block is flat R55.
- Crossing 20 is the site's one important micro-interaction: the price visibly changes and a polite live region announces it. **This is motion that carries information, not decoration.**
- Summary hides at zero items. Desktop: fixed Glass panel, lower-right. Mobile: bottom bar with `env(safe-area-inset-bottom)`.
- WhatsApp handoff encodes a plain-text order to `wa.me/27818592919`.

---

## 6. Motion

- Compositor-only: `transform`, `opacity`, `filter`. Never `width`, `height`, `top`, `left`.
- `rAF`-scheduled, torn down when the hero leaves the viewport.
- **Every animation must answer "what does this tell the user?"** If the answer is "nothing", it gets cut.
- `prefers-reduced-motion: reduce` is honoured from first paint: hero collapses to one viewport, one still frame, no scrubbing, no marquee, no parallax. All copy, prices, and actions remain reachable.
- **Banned:** `transition: all`. Ever.

---

## 7. Anti-slop constitution

Unverified opinion (see Research Log). Written to be argued with.

**Banned outright**
- Emoji as icons · gradient text · neon glow · `01 / 06` counters · stock 3D dioramas
- **Duotone or gradient-filled icons**
- The generic hero: large display headline, six-to-ten word subhead, exactly two CTAs. Banned **structurally, not cosmetically** — left-aligned and asymmetric variants are the same tell.
- **The cinematic-scrub hero, which is the dominant 2026 AI template and is banned for exactly this document.** A pinned multi-viewport scroll section, scrubbed frame sequence or video, dark cool-graded imagery, one oversized display statement. §5 mandates a 40-frame pinned reel, so this ban *applies to us*, and passing the first ban while looking identical to every generated cinematic site is the specific failure this list exists to prevent.
  - Distinguishing requirement: the reel must be **tied to the commerce**, not atmospheric. At least one beat must carry a fact a customer needs (price, delivery, hours), and the transition into the Counter must be a deliberate material change rather than a scroll. Pure atmosphere fails, even when beautifully executed.
- **Three identical cards, in any arrangement.** Banning "three identical feature cards in a row" is not enough: staggered vertical offsets defeat the letter of that ban and nothing else. Proximity and alignment, not difference in vertical position, are what make a row read as a template. If three cards are needed, they must differ in **structure**, not position.
- **The aggregate.** No single tell above is what makes a page read as generated. The combination of cold near-black, a cyan accent, frosted panels, and a high-contrast serif display over a geometric sans *is* the 2026 AI house style. If all four are present and nothing else is doing the work, the page fails regardless of how clean each element is. **At least two of those four must be absent**, replaced by something this brand can justify.
- Three identical feature cards in a row
- Glass applied where it is not doing work (see the glass gate above)
- Logo strips, testimonial carousels, "Trusted by"
- Vague inflated copy: *premium, luxury, world-class, artisanal, curated, bespoke, elevated, exceptional, seamless, unlock, delve, game-changer, revolutionize, cutting-edge, next-level, effortlessly, sleek, innovative, unleash*
- **Accent-coloured borders on rounded surfaces** — `border-left: 2px solid <accent>` used to mark a selected or focused card. This is the single most recognisable AI-generated UI tell. Encode state with one ink at many alphas, a check glyph, or tonal layering.

**Mechanical note on linting this list.** Word-boundary matching is mandatory. A naive substring grep for `fine` also fires on *de**fine**d*, *re**fine***, and *con**fine***, which are ordinary words this site uses. The same applies to `unlock` / `unlocked` and `discover` / `discovery`. Any automated check must use `\b`.

**Mechanical scan — zero hits expected.** The rules above are judgement calls; these are greps. Each was verified absent in the prior build by `lab/web-design-guidelines-audit.md`, and two of them (`outline: none`, `user-scalable=no`) were dropped when this contract superseded `BRAND.md`. Restored here, extended.

| Check | Fails on |
|---|---|
| `user-scalable=no`, `maximum-scale=1` | Pinch-zoom disabled. WCAG 1.4.4 failure |
| `outline: none` / `outline: 0` with no `:focus-visible` replacement | Destroys keyboard focus indication |
| `transition: all` | Unbounded transition; animates properties never intended |
| `onPaste` with `preventDefault` | Blocks paste on inputs |
| Inline `onClick` navigation instead of `<a>` | Breaks middle-click, open-in-new-tab, and crawlability |
| Click handlers on `<div>`/`<span>` | Not keyboard reachable |
| `<img>` without `width` and `height` | Layout shift; fails CLS budget |
| Form input without an associated `<label>` | Screen-reader failure |
| Icon-only button without `aria-label` | Unnamed control |
| `autoFocus` | Steals focus on load, disorients keyboard users |
| Reduced-motion honoured only in CSS, not in JS | Scroll-scrub and `rAF` work keeps running |
| Hardcoded date/number format outside copy | Breaks on other locales |

Run as part of `npm run verify:browser`, not by eye. **A gate that cannot run is not a gate that passed** — see the plan's environmental-constraint section.

**Conflict to note for the client:** the brief asked for a "premium" feeling. The word *premium* is banned from visible copy. Quality is the standard; inflated vocabulary is not the way to signal it.

**Self-check before any surface is called done**
1. Does every animation communicate state change or progression?
2. Would this look deliberate if all the copy were removed?
3. Is there exactly one focal point, or did I put three things at the same weight?
4. Does the spacing have a rhythm, or is everything on a uniform grid?
5. Would a designer at Linear reject this?

---

## 8. Non-negotiable constraints

- No framework, no animation library, no build step, no CMS, no WebGL. Semantic HTML + CSS + native ES modules.
- No third-party request on load. The map stays opt-in. No customer data leaves the browser.
- Everything works with JavaScript disabled, including direct per-product WhatsApp links.
- WCAG 2.2 AA. 44px targets. No horizontal overflow at 320/390/768/1440.
- Skip link, logical headings, visible focus, polite live region for price changes.

---

## 8b. Resilience and failure modes

Every row below is an assertion in the browser verification suite, not an intention.

| Failure | Required behaviour |
|---|---|
| JavaScript unavailable | Static prices, full hours, address, click-to-call, directions, and a direct WhatsApp link per product all keep working. The quantity builder and estimate are absent, not broken. |
| `backdrop-filter` unsupported | `@supports` block drops to the opaque `--shelf` fill. Nothing becomes unreadable. |
| A single reel frame fails | Hold the nearest decoded frame. Never a blank background. No uncaught error. |
| Reel broadly unavailable | Designated poster renders with headline, price cue, delivery claim, and the order action all present. |
| Fonts fail to load | Metric-matched `size-adjust` fallbacks prevent layout shift. Content stays readable in the fallback stack. |
| WhatsApp app absent | The `wa.me` web URL still opens. The `tel:` link remains separately available. |
| Opening-status calculation throws | Full static hours remain. No inaccurate status is ever shown. An error is not rendered as "Open". |
| `Intl` unavailable or SAST unresolvable | Same as above. Status degrades to "Status unavailable", never to a guess. |
| Opt-in map fails | Address and external directions link remain. |
| Reduced motion active | Hero is one viewport, one still frame, no scrub, no marquee, no parallax. All controls behave normally. |
| Horizontal overflow | Must not occur at 320, 390, 768, or 1440. `svh` units, not `vh`, on mobile. |

---

## 9. Verification gates

| Gate | Tool | Blocking |
|---|---|---|
| Design critique | designpowers lane-c | Flatness / accessibility-constraint review of this document |
| Unit | `node:test` | Pricing, totals, WhatsApp URL, SAST status |
| Browser | Playwright | Order flow, reel fallback, reduced motion, keyboard, no-JS |
| A11y | axe | Zero WCAG A/AA violations in meaningful states |
| Performance | Lighthouse, real Chromium | 100 across categories, measured on a production build |
| Visual | `/visual-qa` | Light + dark, phone + desktop, motion driven and inspected |
| Review | `/review-work` | Single gate reviewer before any handoff |

---

## 10. Accepted debt

Deliberate, recorded, and owned. Each entry is a known limitation accepted for a stated reason, not an oversight.

| Debt | Why accepted | Revisit when |
|---|---|---|
| Manrope has no true italic | Verified against the Google Fonts CSS API. Synthesised obliques read as broken. Mitigated by the `<em>`-as-colour convention in §3. | A variable sans with a real italic becomes worth the payload. |
| Four-frame reel minimum on `save-data` / 2g | Mobile data in Tembisa is frequently metered. Film fidelity is not worth a stalled hero. | Always — this is permanent behaviour, not debt. |
| Map stays opt-in behind a button | No third-party request on load, and no location data sent before consent. Costs one extra click. | Only if the client accepts the privacy trade the other way. |
| No server-side inventory or payment | Out of scope and stated in the brief. Prices are explicitly estimates. | Business decision, not engineering. |
| 40-frame reel at ~600KB desktop | Chosen under the §2b budget. Heavier variants would breach it. | If LCP budget loosens. |
| Bodoni Moda is a widely-used display face | Accepted trade for optical-size range and licence clarity. Mitigated by weight ≤500 and near-zero tracking. | If a rarer Didone with a comparable `opsz` axis is found under OFL. |
| **Frosted navigation was deliberately removed by the previous pass** | `site/REDESIGN.md` records that the prior redesign removed "frosted navigation, glowing scan line, tilting cards, decorative rings and large progress statistics" as slop. This contract puts Glass back on the scrolled header. That is a reversal of a decision made by someone who had looked at this exact site, so it is recorded rather than presented as original. The distinguishing claim: the prior pass removed glass as generic blur; this one restricts it to four gated surfaces with a mandatory two-edge treatment and a no-glass-within-glass rule. | If Glass reads generic on the live header, cut it and let the header stay flat ink. |

**Decided during planning, pending owner confirmation:** the four defaults in §11. None is load-bearing and all four are reversible at low cost.

---

## 11. Decisions

> **Provenance.** The art direction was changed by the orchestrator during planning, on critique evidence, **not approved by the owner.** Every decision below is recorded rather than silently applied, and every one is reversible. Nothing is implemented until the owner signs off.

### Default applied — owner may override any of these

| # | Decision | Default applied | Reversal cost |
|---|---|---|---|
| 1 | **The reel** | **All 40 frames, re-encoded to 800×450 WebP q55 — 552 KB, within the 600 KB ceiling.** Measured at **40.3 dB PSNR** across the sequence (visually lossless), decoded memory 1.4 MB/frame rather than 3.7 MB. This superseded an earlier default that shipped a 20-frame byte-identical JPEG subset; that subset was rejected on measurement because the resulting **130.5 px/frame density was the direct cause of the choppy playback the owner reported**. A WebP encoder (`cwebp`, Termux `webp` package) was installed to reach 40 frames within budget. | Low |
| 2 | **The photography grade** | **Light touch, non-load-bearing** (§2). No commissioned grade. Coldness is carried by the Didone hairlines, the mineral palette, and the Etched material. If the footage is warm, the design still holds. | Low |
| 3 | **Amber's role** | **Warm light from inside a cold place.** The shop's own light, seen through ice. It justifies the CTA fill and the dispersion half-split as one idea instead of two coincidences. | Low |
| 4 | **Hero copy** | **Option B below**, pending owner voice call. | Trivial |

### Hero copy — three registers, written out

| | Line | Register |
|---|---|---|
| **A** | "Clear ice. Cut slowly." | Craft-coffee. Concrete and uninflated, but it borrows the soap-and-coffee cadence and signals taste to a buyer who just wants ice. *Current line.* |
| **B** | **"Below freezing, on Raymond Mhlaba Street."** | Cold and local. Matches the concept, is specific to the actual address, and claims nothing. **Default.** |
| **C** | "Open now. R17 a bag." | Dependable. Converts best, sounds like a shop board, and is the safest of the three. |

All three carry no banned vocabulary. The hero's supporting line is unchanged and already carries the commercial facts: from R17, free delivery around Tembisa, and the phone number. **Option B recommends itself only if the cold register is wanted; C is the right call if conversion is the priority.**

### Deferred to a device test, not an owner decision

**Dispersion amplitude.** A 1px chromatic split is below the perceptual threshold on many displays, so placement was premature to decide. Phase 0 runs a three-variant test (1px / 2px / 3px) on target hardware. If no variant reads, dispersion is cut rather than enlarged.

### Settled by measurement

**Amber CTA.** Amber fill with `--abyss` text at **9.17:1**. A cyan primary CTA is not viable: `--refract` measures **1.59:1** as text on `--counter`, and `--counter-link` is a link token, not a button fill.

### Still genuinely open — one item

**Nothing blocks the build on an open question.** The only outstanding item is owner sign-off on the four defaults above.