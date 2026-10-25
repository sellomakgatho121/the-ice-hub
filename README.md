# The Ice Hub

The website for The Ice Hub, a local ice supplier in Tembisa, South Africa. The
repository contains the React storefront, the verified static rollback, local
media and fonts, verification tooling, and the design documents.

## Project status

The deploy target is the **React 19 + Vite 8 + Tailwind 4** app in [`app/`](app/).
It preserves the “Cold ledger” direction, the 30-frame scroll-scrubbed hero, the
WhatsApp order builder with live totals and 30-bag bulk pricing, live SAST
opening status, and the opt-in OpenStreetMap embed.

[`site/`](site/) remains the verified static build and rollback. The root
`vercel.json` now builds `app/dist`; the live deployment must be redeployed to
pick up the React app. See [`docs/design/migration-plan.md`](docs/design/migration-plan.md).

- [Current design brief](docs/design/brief.md)
- [Migration plan and verification evidence](docs/design/migration-plan.md)
- [Resource decisions](docs/design/resources.md)
- [React app README](app/README.md)
- [Brand rules](BRAND.md)
- [Original narrative brief](BRIEF.md)

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

Prices are from the shop’s pricing flyer effective 20 May 2026. The owner raised
the bulk threshold from 20 to 30 bags.

## Repository structure

```text
app/                      React 19 + Vite 8 + Tailwind 4 storefront
  src/                    components, hooks, pure domain logic, CSS
  public/                 self-hosted fonts, 30 reel frames, icons, manifest
  scripts/prerender.mjs   renderToString(App) -> dist/index.html
site/                     verified static rollback
docs/design/              current brief, migration plan, resources, tokens
docs/superpowers/         historical redesign spec and implementation plan
shots/                    local QA screenshots (gitignored)
Hero section images/      original reel source frames
lab/                      design audits and setup notes
vercel.json               Vercel install/build/output config for app/dist
deploy.sh                 gates, commit, push, deploy, live checks
```

## Run the app

Requirements: Node.js **22.12+**, npm, and Python 3 (only for the static
rollback server). Chromium 156 and `agent-browser` are installed here for L2/L3
checks.

```bash
cd app
npm ci
npm run dev        # http://127.0.0.1:5173
npm test           # 21 domain tests
npm run build      # prerender into dist/
npm run preview    # http://127.0.0.1:4173
```

## Verify

```bash
cd app
npm test
npm run build

# with the preview server running on :4173
QA="$HOME/.config/opencode/design-intelligence/browser/qa.mjs"
node "$QA" http://127.0.0.1:4173/ --width 390 --scroll-through \
  --out /tmp/icehub-390.png --json /tmp/icehub-390.json
node "$QA" http://127.0.0.1:4173/ --width 1440 --scroll-through \
  --out /tmp/icehub-1440.png --json /tmp/icehub-1440.json
```

The current build passes 320/390/1440 and 390 reduced-motion with
`findings: []`; see the migration plan for L3 evidence. `bash deploy.sh --dry`
runs the same gates plus tests and prerender checks.

## Deploy

`vercel.json` installs with `cd app && npm ci`, builds with
`cd app && npm run build`, and serves `app/dist`. `deploy.sh` refuses to deploy
if tests, build, prerender, or QA fail.

```bash
bash deploy.sh --dry    # gates only, no commit/push/deploy
bash deploy.sh --yes    # commit, push, deploy, print the live URL
```

`site/` is retained until the live React build is verified. Do not delete it
before then.

## Privacy

The storefront makes no third-party request on load. Fonts, frames, icons, and
JavaScript are self-hosted or bundled. The map is opt-in; it contacts Nominatim
only after the visitor presses “Load interactive map” and caches the result for
30 days. Orders are composed in the browser and handed to WhatsApp; nothing is
stored and no customer data leaves the device.

## Historical documents

- [Approved static redesign specification](docs/superpowers/specs/2026-09-22-ice-hub-redesign-design.md)
- [Static implementation plan](docs/superpowers/plans/2026-09-22-cinematic-whatsapp-storefront.md)

## License

No open-source license has been selected. All rights are reserved unless the
project owner adds a license.
