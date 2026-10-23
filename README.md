# The Ice Hub

The website for The Ice Hub, a local ice supplier in Tembisa, South Africa. The repository contains the current static site, its local media and fonts, browser verification tooling, and the approved design documents for a commerce-first WhatsApp storefront.

## Project status

The deployable site in [`site/`](site/) implements the approved redesign. It uses a 30-frame scroll-controlled product film at 720p, token-based glass materials, a WhatsApp order builder with live totals and bulk pricing, an opt-in OpenStreetMap embed, and live South African opening status. Three.js and Web3Forms have been removed.

- [Approved redesign specification](docs/superpowers/specs/2026-09-22-ice-hub-redesign-design.md)
- [Task-by-task implementation plan](docs/superpowers/plans/2026-09-22-cinematic-whatsapp-storefront.md)
- [Brand rules](BRAND.md)
- [Original Scrollcraft brief](BRIEF.md)

## Confirmed shop information

- **Address:** 9605 Winnie Mandela Zone 4, Raymond Mhlaba Street, Tembisa 1632, South Africa
- **Phone and WhatsApp:** +27 81 859 2919
- **Delivery:** Free delivery around Tembisa. Eligibility and fulfillment details are confirmed in WhatsApp.
- **Monday to Friday:** 10:00 to 19:00
- **Saturday and Sunday:** 09:00 to 21:00

### Public catalog

| Product | Standard price | Stock price |
| --- | ---: | ---: |
| 2 kg ice-cube bag | R17 | R10 each for 30 or more bags |
| 3 kg ice-cube bag | R22 | R12 each for 30 or more bags |
| 30 kg ice block | R55 | Not applicable |

These prices are taken from the shop's pricing flyer effective 20 May 2026. The owner subsequently raised the bulk threshold from 20 bags to 30.

## Repository structure

```text
docs/superpowers/
  specs/                  approved redesign specification
  plans/                  detailed implementation plan
Hero section images/      original 40 reel frames
lab/                      design audits and setup notes
site/                     deployable static-site root
  assets/reel/            deployable copies of all 40 frames
  fonts/                  self-hosted variable fonts
  scripts/                site modules and browser verification
  vendor/                 current Three.js runtime, pending removal
  index.html
  styles.css
BRAND.md                   visual and editorial rules
BRIEF.md                   original narrative brief
```

The source frames are copied into `site/assets/reel/` because a deployed static site cannot request files outside its public root.

## Run locally

Requirements:

- Node.js 20 or newer
- npm
- Python 3
- Chromium or a compatible Playwright browser for verification

```bash
cd site
npm install
npm run serve
```

Open <http://localhost:8000>.

## Verify the current site

Keep the local server running, then use another terminal:

```bash
cd site
npm run verify
```

The current verifier exercises the reel, local assets and fonts, WebGL fallback, form validation, reduced-motion behavior, responsive overflow, touch targets, and selected WCAG A/AA rules with axe. Generated screenshots are excluded from version control.

## Implementation direction

The approved redesign keeps the project framework-free: semantic HTML, CSS, and native JavaScript modules. The planned implementation adds testable pricing and SAST status modules, progressive reel loading, resilient no-JavaScript product links, responsive order summaries, and encoded WhatsApp order messages. It also expands automated checks across pricing thresholds, fallback states, keyboard interaction, accessibility, and 320, 390, 768, and 1440 px layouts.

Implementation should follow the approved plan task by task. The plan uses Node's built-in test runner for pure behavior and Playwright with axe for browser verification.

## Configuration and privacy

The current Web3Forms integration is deliberately left in demo mode with the placeholder value in `site/config.js`. Never commit live access keys or customer information. The planned WhatsApp storefront removes that form and sends no customer data to a site backend.

## License

No open-source license has been selected. All rights are reserved unless the project owner adds a license.
