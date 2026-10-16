# The Ice Hub — Build Plan (v2, glossy direction)

**Date:** 13 October 2026
**Contract:** `DESIGN.md` (must be approved first)
**Supersedes:** `docs/superpowers/plans/2026-09-22-cinematic-whatsapp-storefront.md` (task structure only; that plan's §§8–16 remain binding and are restated in `DESIGN.md`)

---

## Environmental constraint: no browser on this host — RESOLVED

> **Resolved 2026-10-13. The browser gates now run on this host and pass 28/28.**
>
> Every finding below was correct as written, and the conclusion drawn from them was wrong. This userland is Ubuntu 24.04 under **PRoot** (glibc 2.39, Linux arm64 kernel) — not bare Termux. Node reports `process.platform === 'android'`, and Playwright gates solely on that string, so it refused a browser that runs here perfectly well.
>
> The fix, in three steps:
>
> 1. Relabel the platform before Playwright loads. `platform-spoof.cjs` sets `process.platform = "linux"`. Because ESM **hoists static imports**, the Playwright imports must be dynamic (`await import("playwright")`) or the spoof lands after the gate has already thrown.
> 2. Install normally with the spoof injected: `NODE_OPTIONS="--require ./platform-spoof.cjs" node node_modules/playwright/cli.js install chromium`. The post-install dependency check fails harmlessly; the linux-arm64 binary still downloads.
> 3. Supply the seven missing shared libraries: `apt-get install -y --no-install-recommends libnspr4 libnss3 libatk1.0-0t64 libxcomposite1 libxdamage1 libatspi2.0-0t64`.
>
> **Option 2 below was correct all along** — "a Linux aarch64 build may run under Termux". It was tested and rejected for the wrong reason, and the real blocker turned out to be a platform *label*, not a platform.
>
> Cost of that wrong assumption, now paid back: for the whole build the browser gate sat unrun, and it went on to find **five defects that static analysis could not** — a CTA at 1.22:1, an order summary at 1.64:1, hero text running off the left edge, ~100 px product icons, and six sub-44px tap targets.

**The Playwright gates in Phase 3 and Phase 7 cannot run on this machine.** Verified, not assumed:

- `npx playwright install chromium` fails with `Error: Unsupported platform: android`
- `apt` offers only `chromium-browser 2:1snap1-0ubuntu2`, a **snap wrapper**; `snap`/`snapd` are not present, so it cannot install
- `chromium` has no candidate in any configured repo
- No `chromium` or `headless_shell` binary exists on the filesystem (only npm metadata packages named `chromium-*`)
- Both existing harnesses already depend on an external `CHROMIUM_PATH` pointing at `/data/data/com.termux/files/usr/bin/chromium-browser`, which **no longer exists**

Consequence: `verify.mjs`, `verify-redesign.mjs`, axe, and Lighthouse all require a browser that this host cannot provide. This is a host limitation, not a code defect.

**Required before Phase 3.** One of:

1. **Run verification elsewhere** — CI, a desktop machine, or a cloud runner — with the built site served over HTTP. The harnesses already accept `CHROMIUM_PATH`, so only the browser location changes.
2. **Supply a Chromium binary** and set `CHROMIUM_PATH` to it. A Linux `aarch64` build may run under Termux; a Termux-native build would be needed for reliability. Unverified.
3. **Degrade the gates** — if neither is possible, Phase 7's Playwright, axe, and Lighthouse rows cannot pass and must be recorded as *not verified* rather than silently skipped. A gate that cannot run is not a gate that passed.

Option 3 must never be reported as a pass. `npm test` (pure `node:test`) is unaffected and runs anywhere — **but see the vacuous-pass warning below before trusting it.**

### Vacuous-pass warning: `npm test` is green while testing nothing

Verified on this repo today: with zero `*.test.mjs` files present, `node --test scripts/*.test.mjs` **exits 0** and prints no summary. `npm test` therefore reports success before a single test has been written, and `npm run verify` (which chains `npm test &&`) would go green on that basis.

This is the same failure mode as the browser gates, inverted: a gate that cannot run, versus a gate that cannot fail. Both are worse than no gate, because they report success.

Phase 3 must therefore assert coverage, not just exit status. Before Phase 3 is called done:

```bash
# must print a non-zero test count, or this is not a real pass
npm test 2>&1 | grep -E '^# (tests|pass) '
```

The six pricing/total/URL tests named in Task 1 are the minimum bar. A run reporting `tests 0` is a **fail**, not a pass, and must be recorded as such.

---

## Phase 0 — Approve the contract

No code is written until `DESIGN.md` is approved. All four §11 decisions already carry defaults, so approval is a confirmation, not an interview.

1. Owner reviews `DESIGN.md` and confirms or overrides the four defaults in §11 (reel kept, grade non-load-bearing, amber's role, hero copy line).
2. **Dispersion DPR check.** Colour separation is already settled by measurement (ΔE76 76.23, ~33× the perceptibility threshold), so dispersion is not under threat of being chromatically invisible. The only open failure mode is spatial: a 1px hairline aliasing to nothing at `devicePixelRatio: 1`. Test 1px specifically at DPR 1 on the cheapest target device in scope. If it fails there, ship 2px — do not cut dispersion and do not carry a variable just for it.
3. Independent critique of the contract. **Fallback is mandatory:** the lane-c reviewer is not a guaranteed-available tool, and three of four research lanes failed on the first attempt. If it is unavailable, dispatch a fresh `oracle` critique with the same brief. The gate is "an independent reviewer found no blocking defect", not "lane-c ran".
4. **Set the page-weight budget** before Phase 2. Old spec §13 required it and `DESIGN.md` only budgets the reel; without a total weight and LCP target the Lighthouse 100 gate has no input to hit.
5. **Resolve the browser constraint.** See the section above. **RESOLVED:** Playwright now runs on this host via the PRoot route, and the gate passes 28/28. 1 (run verification elsewhere), 2 (supply a `CHROMIUM_PATH`), or 3 (degrade the gates and record them as *not verified*). This must be settled before Phase 3, not discovered during it.
6. Amend, record what changed and why.

**Exit:** approved contract, no blocking defect from an independent reviewer, page-weight budget set, browser constraint resolved.

---

## Phase 1 — Parallel research lanes

Three of the four lanes below were **completed during planning** and are marked as such; only the copy pass remains open. Nothing here writes site code.

| Lane | Output | Feeds |
|---|---|---|
| Font pipeline | **Already done.** Fetch the `latin` subsets from the Google Fonts CSS API and self-host: Bodoni Moda 45.2 KB, Manrope 24.3 KB, JetBrains Mono 21.3 KB (already in repo). **Total 90.8 KB** against a 130 KB ceiling. Do not fetch `latin-ext` — isiZulu uses the plain Latin alphabet and it would cost 39.2 KB for glyphs never rendered. `pyftsubset` is **not installed here**; fetch pre-subsetted files instead. | §3 |
| Icon pipeline | **Already done.** `lab/proof/icons.svg`: 16 verified Lucide 1.56.0 symbols, 4.8 KB, `stroke-width="1.5"` baked into each `<symbol>`. Two names in the first draft did not exist (`cube`, `drop`) and were corrected to `box` and `droplet`. Copy to `site/icons.svg`. | §4 |
| Reel processing | **Already done.** Adopt the built 20-frame even subset from `lab/proof/reel-20/` (572 KB, byte-identical to source, motion arc verified, hard cut bridged). Copy into `site/assets/reel/` and set `TOTAL = 20` in `reel.js`. No derivative generation and no encoder. | §2b |
| Copy pass | **Mostly already clean.** Audited the current `index.html` against §7: **zero** banned words in visible copy, **zero** em dashes, **zero** uses of "premium". So this is not a rewrite. The actual work is (a) swap the hero line per the register decision, (b) delete the obsolete products — *Spheres*, *Cold drinks*, *Venue supply* all still appear and must not survive, (c) re-verify prices, phone, address and hours against §1, (d) write the four new hero scenes, which are the only genuinely new copy in the build. | §5, §7 |

**Exit:** measured byte totals, verified sprite, graded frames, clean copy.

**Failure rules**

- Fonts: **already settled at 90.8 KB**, under the 130 KB ceiling. The only live constraint is *not shipping `latin-ext`* — it would add 39.2 KB (30% of the payload) for glyphs this site never renders, on a false premise that isiZulu needs diacritics. It does not.
- Reel: the desktop-set budget is already settled by the 20-frame subset (572 KB). Do **not** re-derive it. If the subset is ever abandoned, the fallback ladder is WebP/AVIF encoded off-host, then fewer frames, then a lower desktop width — never a heavier JPEG.
- If any lane fails, dispatch a replacement. **A failed lane is not a completed lane.**

---

## Phase 2 — Foundation

Sequential. Everything downstream depends on it.

1. **`site/package.json` — add the missing scripts first.** Only `serve` and `verify` exist today; the plan calls `npm test` and `npm run verify:browser`, so this must land before anything else.
   ```json
   { "serve": "python -m http.server 8000",
     "test": "node --test scripts/*.test.mjs",
     "verify:browser": "node scripts/verify.mjs",
     "verify": "npm test && npm run verify:browser" }
   ```
2. `site/config.js` — canonical shop facts and the three-product catalog. Single source of truth.
3. `site/styles.css` — **full rewrite, not a prepend.** The existing stylesheet already defines 15 custom properties in 3,000-character single-line rules, and **two collide with the new token set under the same name but different values**:

   | Token | Old value | New value |
   |---|---|---|
   | `--amber` | `#d99e5a` | `#E0A45C` |
   | `--gutter` | `clamp(22px,4.4vw,84px)` | `clamp(1rem, 4vw, 2.5rem)` |

   Prepending `:root` over the old file would look correct and render wrong. The remaining 13 old tokens (`--accent`, `--ice-*`, `--ink-*`, `--rule`, `--display`, `--mono`, `--max`, `--hero-p`, `--text`) have no new counterpart and must not be carried over — they are superseded wholesale.
4. `@font-face` with metric-matched fallbacks.
5. Reset, skip link, `:focus-visible`, visually-hidden utility.
6. Icon sprite wired.
7. **Salvage `scripts/verify-redesign.mjs` before deleting it.** It is not dead code: 68 lines of live assertions that ran successfully and produced `site/lab/redesign/*.json`. It is simply **never referenced by any npm script** (`package.json` has only `serve` and `verify`), so it is orphaned rather than broken. Its checks are still valid patterns and must be carried into the new `verify.mjs` in Phase 3:
   - skip-link focus lands on `#main` (`.skip` and `#main` both take `document.activeElement`)
   - navigation does not overflow at any tested width
   - each product control selects the correct order value
   - reduced-motion hero stays on the designated still frame
   Then delete the file. Do not carry it forward unwired again.

**Commit:** `chore: establish design tokens, fonts, icons and test scripts`

---

## Phase 3 — Test harness

Built before components. This phase is **not** parallel with Phase 4.

- `order.test.mjs` — pricing tiers, the 20-bag threshold in both directions, mixed totals, zero/negative/NaN quantities, WhatsApp URL encoding and number
- `hours.test.mjs` — SAST status at open, close, and boundary instants; weekend schedule; failure degradation
- `verify.mjs` — Playwright matrix across 320/390/768/1440, reduced-motion, blocked-frame, no-`backdrop-filter`, and JS-disabled contexts; axe at hero, product builder with stock price active, and visit section

**Commit:** `test: add order, hours and browser verification harness`

---

## Phase 4 — Build

| Task | Depends on | Notes |
|---|---|---|
| 4.1 Hero reel + four beats | Phase 2, 3 | Reel logic survives; re-grade and re-choreograph. Nearest-frame fallback mandatory. |
| 4.2 Header + live status | Phase 2, 3 | SAST status. Glass only after scroll. |
| 4.3 The Counter | Phase 2, 3 | Product cards, steppers, live total. Highest-craft surface. |
| 4.4 Order summary + WhatsApp | 4.3 | Glass panel, mobile bottom bar, encoded message. |
| 4.5 Audience + Visit + footer | Phase 2, 3 | Static hours always present. Map stays opt-in. |
| 4.6 Reduced motion | 4.1–4.5 | Cross-cutting, applied last. |
| 4.7 Keyboard and a11y pass | 4.1–4.6 | Focus order, skip link, live region, 44px targets, no-JS path. An explicit work item, not an afterthought. |

**Commit per task.**

---

## Phase 5 — Verify, then delete, then re-verify

The previous ordering deleted before the browser gate, so the first time a broken reference surfaced would have been after files were gone. Corrected order:

1. **Verify first.** Full `npm run verify` green with everything still present.
2. **Prove unreferenced.** `git grep` for `crystal.js|three.module|form.js|Web3Forms|web3formsKey|reserve__form` returns nothing live.
3. **Then delete:** `scripts/crystal.js`, `scripts/form.js`, `vendor/three.module.min.js` (680K), `lab/web3forms-setup.md`, the `<canvas data-crystal>` and `.reserve__form` markup, the `Lebomorena3@gmail.com` address, and the obsolete spheres / cold drinks / venue supply products.
4. **Re-verify.** `npm run verify` green again, proving order-independence.

**Commit:** `refactor: remove Three.js crystal, Web3Forms and obsolete products`

---

## Phase 6 — Documentation and contract deconfliction

**Measured contradiction inventory.** Nine markdown files are tracked in git. Three of them still assert rules `DESIGN.md` supersedes, so a reader who opens them in the wrong order builds the wrong thing. This is not a stylistic concern — `BRAND.md` names the word "premium" as forbidden and mandates Lucide with no filled variants, both of which are now reversed.

| File | Still asserts | Action |
|---|---|---|
| `BRAND.md` | "premium" forbidden; Lucide only, no filled variants; matte/mineral, no gloss | **Delete.** Fully superseded; no surviving rule |
| `docs/superpowers/specs/2026-09-22-ice-hub-redesign-design.md` | "Use the current self-hosted fonts"; "existing local SVG icon sprite" | **Keep**, prepend a superseded banner. Its §4 business facts and §8–16 remain binding |
| `docs/superpowers/plans/2026-09-22-cinematic-whatsapp-storefront.md` | 9-task execution order | **Delete.** Replaced by this plan |
| `site/REDESIGN.md` | Never inspected during planning | **Read, then delete or supersede** |
| `lab/web3forms-setup.md` | Web3Forms setup | Delete in Phase 5 |
| `BRIEF.md`, `README.md`, `site/README.md`, `lab/web-design-guidelines-audit.md` | — | Update or leave, per below |

**Order matters.** Do this **after** the new site is verified working, never before — deleting the old contract before its replacement is proven leaves the repo with no contract at all.

Remaining documentation:
- `site/README.md` — implemented experience, file structure, commands, acceptance matrix
- `README.md` — deployable root, links to `DESIGN.md` and this plan, verified business facts
- `.gitignore` — generated screenshots, `node_modules`, temp logs

**Commit:** `docs: supersede BRAND.md and 2026-09-22 plan, document implemented storefront`

---

## Phase 7 — Verification gates

| Gate | Blocking condition |
|---|---|
| `npm test` | Any unit failure |
| `npm run verify:browser` | Any Playwright or axe failure |
| Lighthouse | Below 100 in any category, on a production build in real Chromium |
| `/visual-qa` | Any FAIL across the capture matrix |
| `/review-work` | Reviewer does not return PASS |
| Anti-slop sweep | Any §7 banned item found by inspection |

---

## Phase 8 — Independent verification

Distinct from `/review-work`, which is a gate review. This is an independent verifier given the original brief, `DESIGN.md`, and every changed file, with **no claimed test results handed to it**.

1. Dispatch the verifier.
2. On FAIL: add a focused failing test, make the smallest correction, re-run, return to the same verifier.
3. Spot-check two or three commands from its report by running them independently.

**Exit:** independent PASS. Only then is the work reported complete.

---

## Parallelism map

```
Phase 0  approve DESIGN.md                        gate
Phase 1  ├─ fonts ✓  ├─ icons ✓  ├─ reel ✓  ├─ copy   only copy remains
Phase 2  foundation (+ package scripts)            sequential
Phase 3  test harness                              sequential, BEFORE any component
Phase 4  4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7
Phase 5  verify → prove → delete → re-verify
Phase 6  documentation + contract deconfliction
Phase 7  gates                                    blocking
Phase 8  independent verification                 blocking
```

Phases 3 and 4 are **not** parallel. The earlier draft said "built before the components" and then scheduled them concurrently; that contradiction is resolved in favour of tests-first.

---

## Risks

| Risk | Mitigation |
|---|---|
| ~~Concept reads generic~~ **RESOLVED** | §2 replaced the stock key-light concept with light-passing-through: paired entry/exit edges, dispersion, and an Etched material. Re-critique required to confirm the replacement holds. |
| Gloss reads as generic glassmorphism | Glass passes the §2 two-question gate. Grain overlay. Hue-tinted shadows. `saturate(120%)`, not 140%. |
| ~~1.2MB reel makes Lighthouse 100 unreachable~~ **RESOLVED** | The 20-frame even subset lands at 572 KB, inside the §2b ceiling with no encoder required. Byte-identical to source, motion arc verified. |
| Contrast regresses on the counter surface | §2 surface-scoped tokens with measured ratios; banned pairings written as rules |
| Font payload breaches budget | Hard 130KB ceiling with a real mitigation, measured in Phase 1 |
| Reduced motion regresses | Dedicated Playwright context, asserted in Phase 3 and re-asserted in Phase 5 |
| Copy drifts into slop | §7 is the lint list, word-boundary matched, verified by grep in Phase 7 |
| A research lane fails silently | Phase 0 fallback and the Phase 1 failure rule both state a failed lane is not a completed lane |
| A tool named in a gate is unavailable | Every gate names the property being tested and a fallback dispatch |