# Editorial redesign

## Direction

Primary surface: Decide / Learn. Separate the proposition from the product film; keep the seven narrative subjects but reserve scroll runways for the film and fracture. The product range is a visible list rather than a clipped horizontal rail. Hours, contact details and collection stay in normal document flow.

Preserved: local imagery, self-hosted Bricolage Grotesque and Instrument Sans, mineral palette, amber collection actions, product options and shop details.

Removed from the presentation: frosted navigation, glowing scan line, tilting cards, decorative rings and large progress statistics. Every product now has a functional collection action that selects the correct order and focuses the email input.

The original brief describes the previous scroll-heavy composition. This document records the redesign's intentional departures. No product prices or testimonials were added. Changed marketing copy remains a draft for owner review.

## Source backup

`versions/before-editorial-redesign/` contains the previous `index.html`, `styles.css` and `scripts/`. Restore those files into `site/` to revert. Assets, fonts and config were not replaced.

## Observed verification

- `lab/redesign/report.json`: standard browser checks passed. Six sampled scroll positions show distinct frames; all 40 frame resources loaded. Fonts loaded. Five product rows present. No page overflow at 1440px or 390px. Mobile target minimum was 44px. Form validation and reduced-motion mode passed. No uncaught page errors in the final run.
- `lab/redesign/interaction-report.json`: tests passed at 320, 390, 768 and 1440px. All five product selections, email focus, skip-link keyboard navigation, reduced-motion frame stability and invalid-email handling were exercised at each width. Automated axe scans reported zero violations under the selected WCAG tags. This is not a complete accessibility certification or screen-reader test.
- Desktop/mobile hero, product list, fracture fallback, location and mobile collection screenshots were visually inspected.
- A blocked-WebGL test showed the local still image, without an uncaught exception. This host's Chromium loses or refuses GPU contexts; a healthy animated fracture was NOT visually verified. The runtime test explicitly reports `webgl: false`, `staticFallback: true`, rather than claiming a working GPU from the presence of a canvas.
- The map did not create an iframe before opt-in. Clicking Load interactive map created an OpenStreetMap iframe. Live map tiles were not verified. Directions remain an independent external link.
- The form is in demo mode. A valid test submission displayed the no-email confirmation. No real email was sent.

Visual self-audit: 0/10 listed slop tells in the inspected redesign. No remaining compositional tell identified.

## Re-run

Start a server from the site directory, or use an explicit directory argument:

```sh
python -m http.server 8018 --bind 127.0.0.1 --directory '/data/data/com.termux/files/home/Projects-Consolidated/The ice hub/site'
CHROMIUM_PATH=/data/data/com.termux/files/usr/bin/chromium-browser npm run verify -- --url http://127.0.0.1:8018 --out lab/redesign
node scripts/verify-redesign.mjs
```

The page remains a static HTML/CSS/JS site; no framework or production dependencies were added. Preview: http://127.0.0.1:8018/ while the local server is running.
