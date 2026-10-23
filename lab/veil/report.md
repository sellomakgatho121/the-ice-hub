# Hero veil lightening report

## Change

File: `site/styles.css`, rule `.hero__veil` (lines 493-502). Only the three alpha
values changed; the 3-stop `to bottom` gradient structure, stop positions, and the
`rgb(5 9 12 / N%)` colour form are unchanged.

| Stop | Position | Old alpha | New alpha |
|------|----------|-----------|-----------|
| Top    | 0%   | 72% | 64% |
| Middle | 45%  | 46% | 24% |
| Bottom | 100% | 88% | 88% (unchanged) |

- Middle stop reduced 46% to 24% (target was 20-28%). The photo was 54% visible at
  the midpoint; it is now 76% visible there. This is the fix for the dullness.
- Bottom stop kept at 88%. It is load-bearing: `.hero__beats` is bottom-aligned
  (`align-content: end`) and the hero copy sits on it.
- Top stop reduced modestly 72% to 64%. The fixed header nav (wordmark, section
  links, WhatsApp CTA) occupies the top of the hero, so it stays substantial.

## Measured contrast, before vs after

Hero copy colour measured against the actual rendered background at each text
location (veil-over-photo composite), via in-browser pixel sampling of the
screenshots. WCAG 1.4.3 ratio.

### 1440px

| Element | Colour | Before | After |
|---------|--------|--------|-------|
| `.hero__statement` (h1) | `#FFFFFF` | 19.77:1 | 19.80:1 |
| `.hero__sub`            | `#AFC6D0` | 11.14:1 | 11.16:1 |
| `.hero__meta`           | `#7D96A0` | 6.34:1 | 6.34:1 |

### 390px

| Element | Colour | Before | After |
|---------|--------|--------|-------|
| `.hero__statement` (h1) | `#FFFFFF` | 15.55:1 | 13.80:1 |
| `.hero__sub`            | `#AFC6D0` | 8.66:1 | 7.88:1 |
| `.hero__meta`           | `#7D96A0` | 5.73:1 | 5.59:1 |

### Reading of the numbers

- At 1440px the copy sits over the dark backdrop portion of the photo, so the
  unchanged 88% bottom stop dominates and contrast is effectively identical.
- At 390px `object-fit: cover` crops to the bright ice bag behind the text, so the
  lighter middle stop lets more of that bright ice through and the ratio dips
  slightly. Every value remains well above the 4.5:1 WCAG AA floor (lowest is
  5.59:1). Legibility did not regress below acceptable levels.
- The project's own cascade-aware gate (`site/scripts/check-contrast.mjs`) still
  passes: 147 pairs resolved, every one clears 4.5:1.

## Screenshots

- `lab/veil/before-1440.png`
- `lab/veil/before-390.png`
- `lab/veil/after-1440.png`
- `lab/veil/after-390.png`

Captured with the project's Playwright Chromium at scroll 0 (sticky hero stage,
beat 1 active), `before` with the original alphas and `after` with the new ones.

## Visual result

The ice bag now reads sharply: ice texture, the blue ICE HUB wordmark, the
snowflakes, and the 2kg badge are all clearly visible instead of washed out. The
hero copy (statement, sub, meta) and the header nav remain legible at both widths.
