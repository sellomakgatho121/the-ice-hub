# Glass pass — The Ice Hub (2026-10-22)

Premium translucency across the counter, audience stage, visit summary, header,
and every button — while holding the accessibility and no-third-party gates.
Nothing outside `site/styles.css`, `site/index.html`, `site/scripts/check-contrast.mjs`
(gate harness), `site/scripts/verify.mjs` (gate harness), `site/scripts/reel.js`
(warm list) changed. No copy edits.

## Token retunes (site/styles.css `:root`)

| Token | Before | After | Why |
|---|---|---|---|
| `--counter-translucent` | `rgb(242 246 248 / 88%)` | `rgb(242 246 248 / 72%)` | Real glass: the counter samples the field behind it |
| `--counter-mute` | `#556E7A` | `#294652` | Old ink fails on the 72% face (3.51:1 live); retuned to the worst-case floor |
| `--counter-link` | `#0F5A73` | `#0B4457` | Same floor: 5.04:1 |
| `--field-ink` | 3.5% | 6% | Survives sampling under the brighter 72% surface |
| `--field-ink-strong` | 7% | 12% | Same |
| `--glass-sheen` | 14% | 16% | Top-edge luminance on tall faces |
| new `--glass-face-bright` | — | 26% (hover 30 / active 34) | Card faces |
| new `--glass-entry-bright` / `--glass-exit-bright` | — | 60% / 12% | Two-edge glass identity (bright lane) |
| new `--glass-liquid-face` | — | 22% (hover 28 / active 18) | + counter buttons at rest |
| new `--glass-secondary` / hover | — | 11% / 15% | Smoked secondary buttons |
| new `--ink-well` | — | 6% | Stepper well, dims under card face |
| new `--glass-stage-dark` / hover | — | 45% / 55% | Audience stage over the field |
| new `--glass-face-dark` | — | 88% | Summary panel |
| new `--glass-entry-dark` / `--glass-exit-dark` | — | 22% / 35% | Dark lane rims |
| new `--amber-glass` (+hover/active) | — | 82% / 92% / 88% | Header CTA |
| new `--amber-sheen`, `--amber-shadow`, `--amber-glass-blur` | — | 28%, shadow, 14px | Amber lane depth |
| new `--counter-sat` / `--counter-blur` | — | 115% / 24px | Surface filter, token-driven |
| new `--glass-rim-bright` / `-dark` / `-amber` | — | 45% / 18% / 55% | Rim gradients |

## Components (all tokens; `@supports` fallback ladders kept)

- `.counter-card` glass tile: rim `::before` (160° gradient, `mask-composite: xor`),
  `backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat))`,
  `> * { z-index: 1 }`, hover brightens face; solid `--counter-card` fallback.
- `.stepper`: `--ink-well` + inset `--counter-hair` shadow.
- `.counter-surface .liquid`: white-glass 22% + `--counter-ink`; bright rim
  override (0,3,0 specificity beats the generic `:hover` rule).
- `.cta` (header): amber glass, blur 14px, amber sheen inset, amber shadow;
  hover/active ordered after `.liquid:hover`; `:focus-visible` keeps amber shadow.
- `.counter-surface .button`: smoked secondary — no uniform border, inset edge pair.
- `.header[data-scrolled]`: inset sheen top edge.
- `.audience`: dark stage 45% + entry/exit border rims + blur (fallback `--deep`).
- `.audience__eyebrow`, `.audience__card--figure .audience__body`: haze → mist.
- `.summary`: `--glass-face-dark` + glass shadow + inset sheen/exit rim.
- `.field`: z-index 0 → **−1** — the field now paints behind section surfaces, so
  `backdrop-filter` genuinely samples it (frost texture shows through the counter).
- `index.html`: `product counter-card grain` ×3, audience cards `etched` → `glass`,
  summary `glass grain`, +4 field items (Zone 4, BAGS, R17, Blocks).

## Contrast engineering

The darkest composite the counter inks can sit on is the 72% face over the
abyss: `mix(72% × #F2F6F8, #05090C)` = **#B0B4B6** (axe measured this same value
live). Windier cases — card over surface (26% at 0,3,0 steps), well-dimmed
stepper, panel stacks — are all brighter, so the floor is the binding constraint.

- `--counter-mute #294652` on the floor: **4.77:1** (was 3.51:1 with the pre-pass hue);
  ~5.9:1 on card composites.
- `--counter-link #0B4457` on the floor: **5.04:1**; ~6.0:1 on cards.
- Disabled order buttons at rest are axe-exempt; enabled states pass with the
  rest-state bias in the static gate.

`scripts/check-contrast.mjs` was hardened first (token/type-aware matcher,
stack-composited backgrounds over the `FLOOR`, pseudo-element exclusion,
`chainTags` desync fix): it resolves **129 pairs** across 2 counter sections × 3
widths and **PASSes at 4.5:1 floor**. Unresolved entries are aria-hidden
decoratives only (`.icon`, `.map-panel.etched`, `.status__dot`).

## Gate evidence

| Gate | Result |
|---|---|
| `node --test scripts/*.test.mjs` | **21 pass / 0 fail** (`/tmp/opencode/verify-host2.log`) |
| `node scripts/check-contrast.mjs` | **PASS — 129 pairs** (`/tmp/opencode/contrast3.log`) |
| `node scripts/verify.mjs` | **EXIT 0, 30/30 steps ok** (`/tmp/opencode/verify-browser3.log`) |

Real defects the browser gate caught and their fixes:

1. **axe color-contrast, 8 nodes (3.51:1)** — the initial mute/link retune
   (`#3E5A66` / `#0F5A73`) was computed against a wrong floor; retuned to the
   measured composite (tokens above).
2. **"reel frame count within the set" frames=32** — two stacked causes:
   the harness counted resource *entries* (the two-layer reel warms frame-001
   through both `<img>`s → 32 entries, 30 distinct) and `reel.js`'s sparse warm
   list still carried 48-frame-era anchors (`34`, `48`), which exist as stale
   files and get fetched. Fixed by counting **distinct** frame files (≤30) and
   bounding warm lists to the set (`[1,2,8,15,22,26]`, metered `[1, TOTAL]`).

## Captures (before / after)

`lab/glass/{before,after}-<1440|390>-<hero|counter|audience|visit>.png` — 8 +
8 viewport shots, taken with `node lab/glass/capture.mjs <prefix>` (self-hosts
on :8123, pins the headless shell, re-execs with the platform spoof).
Visual review at both widths: field samples through the counter surface, card
rims catch light, steppers read as dimmed wells, buttons smoked glass, audience
stage carries its rims, scrolled header sheen present, no overflow or clipping.

## Residual notes

- `assets/reel/` still holds stale `frame-031..048.webp` (18 files, 48-frame
  era). Nothing fetches them now; deleting them is a plain cleanup but was left
  untouched pending approval.
- Metered users warm frames 1 and TOTAL, so the warm set can never reference a
  file outside the reel again.
- Working directory is not a git repo — no commits requested or made.

## Re-run commands

```sh
cd site
node --test scripts/*.test.mjs
node scripts/check-contrast.mjs
(setsid python3 -m http.server 8000 >/dev/null 2>&1 </dev/null &)
NODE_OPTIONS="--require ./platform-spoof.cjs" node scripts/verify.mjs
node ../lab/glass/capture.mjs after
```
