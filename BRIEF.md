# The Ice Hub — scrollcraft build brief

> Self-authored (not interviewed), marked as such. Replaces the silent 8-question interview. The user's earlier messages supply the answers: a real counter-service clear-ice shop in Tembisa, a 40-frame video they already own, a 7-act feeling curve they already wrote, and an explicit ask for one continuous single-page site navigated through scrollcraft devices. The build follows.

---

## Eight interview answers (from the existing BRIEF + the user's request)

1. **Vibe in 3–5 words, references:** cold, slow, mineral, precise, deliberate. Sapporo whisky ad, the glassblowing chapter of *Jiro Dreams of Sushi*, Hokkaido onsen at dawn.
2. **Section-by-section journey:** Cubes of the world → How ice remembers where it came from → The crack → What's on the counter → When we're open → Where to find us → Pre-order. Already in the existing BRIEF.
3. **Energy curve:** Quiet, slow, slightly cold for the first three sections. One loud moment at "The crack." Settles back to quiet and warm through the menu, hours, and contact.
4. **Feeling curve + peak:** Recognition → Tension → **The crack** (peak) → Substance → Range → Practical → Practical. The peak is "the visitor cracks the ice themselves by scrolling."
5. **One thing no other site does:** the 40-frame hero scrub is *not* a video — the visitor can stop, reverse, hold. They are editing the moment.
6. **Aesthetic range:** premium-minimal. Editorial. Hairline rules, dense type, restrained palette, one accent. Not brutalist, not playful.
7. **One unbroken world or distinct scenes:** one world. Same dark mineral palette, same type family, same surface. The device kit varies; the world doesn't.
8. **Assets already on hand:** the 40 hero frames, the favicon, the real shop contact, the menu (5 SKUs), the hours, the address, the form. No stock. No AI generation.

## What the visitor should believe by the end

Clear, slow ice is a real product you can walk in and buy, not a marketing trope. The shop is small, deliberate, and on Raymond Mhlaba Street.

## The visitor's next action

One action. One label. **Pre-order for collection.** Used on every CTA, in the nav, in the closing, and on the form.

## Feeling curve (written before any act planning)

| # | Act | Feeling | What on screen causes it |
|---|---|---|---|
| 1 | Recognition | Familiar cold | Hero scrub under the wheel — the cube forming frame by frame as the visitor scrolls. Hairline rule, single eyebrow `Frame 001 / 040`, single display sentence. Nothing else. |
| 2 | Tension | Unnerving clarity | Macro scrub inside the same 40 frames (frames 12–28), but the canvas is now a *mineral cross-section* rendered as a parallax depth layer. A line of body copy assembles word by word. |
| 3 | **The crack: peak** | The page breaks open | A procedural Three.js crystal separates into 8 lit facets as the visitor scrolls, then resolves into one form. The display heading breaks across the moving geometry. Loudest moment on the page. |
| 4 | Substance | Material truth | Pin. A high-contrast oversized statement holds still after the fracture: "Not decoration. A better pour." Three product qualities resolve beside it. |
| 5 | Range | Calm choice | Horizontal pan. Five products move through a clipped rail. Each card has a local outline icon, display title, body line and one clear next action. |
| 6 | Practical | Open now, today | Pin. The hours table and live `Open now · closes 19:00` line sit beside a restrained time dial. Quiet, but not silent. |
| 7 | Practical | Find us, call us | Vertical reveal. Address card. A `lucide-map-pin` next to the address. A `lucide-phone-call` next to the phone. The map (OSM embed, `requestIdleCallback`) fades in last. The pre-order form arrives as the last thing. |

## The peak, as one sentence

"It's the site where you crack the ice yourself by scrolling."

## Signature move (named, single)

**The Crack.** A procedural Three.js mineral crystal, faceted and semi-transparent, that separates into 8 fragments across the peak act and reassembles at the end. No 3D models appear elsewhere. This is the only WebGL moment, and it earns the render budget.

## Grammar (and why the other seven lost)

**Worldflight through fixed stages.** The page is one unbroken place. Each act holds a full-viewport stage while the visitor's focus, crop or object position changes with scroll. One Three.js canvas appears only at the peak. The world does not change identity; the viewing device changes. This is right for a shop whose promise is physical and local: walk in, collect, leave with cold in your hands.

## Score table (device per beat — the build order)

| Beat | Device | Why this one |
|---|---|---|
| 1 Recognition | `scrub` (hero, 40 frames) | The visitor's hand on the wheel is the strongest possible open. Already owned. |
| 2 Tension | `scrub` (macro) + parallax depth layer | Same asset, different framing. Frame 12–28 read close. The canvas holds the world. |
| 3 Turn (peak) | `reveal` + Three.js fracture | A procedural crystal separates and reforms from the same normalized scroll signal. |
| 4 Substance | `pin` (high-contrast statement) | The page stops moving and starts being read. |
| 5 Range | `pan` (horizontal rail) | Lateral travel reads as "options", vertical reads as "argument". |
| 6 Practical | `pin` (hours, live ticker) | The frame holds while a single line ticks. |
| 7 Practical | `reveal` (address, map, form, one CTA) | The last thing resolves. The CTA is the one action. |

**Variety check.** Six distinct device families across seven acts. No device twice in a row. At most one `scrub` after the hero (and the macro scrub is *staged* as a different device by being a different *frame range* and a different framing). `pin` appears twice (substance, practical) but separated by `pan` and on different subjects.

**Length check.** The finished experience uses extended runways where the image sequence, 3D fracture and horizontal product rail need time. Static practical sections remain short. The scroll length is earned by state changes, not empty distance.

## Hard rules carried over from BRIEF + the brand spec

- No em dash. No `transition: all`. No `outline: none` without a `:focus-visible` replacement. No parallax hero with "scroll to explore" cue. No `01 / 06` counters on later sections. `prefers-reduced-motion` is a CI assertion. Real `lucide` icons only, 1.5px stroke, 24×24, monochrome. Self-hosted WOFF2 only, no Google Fonts CDN. Inline SVG sprite for icons. Tabular-nums on every number. `text-wrap: pretty` on body. Sentence case in headings, body, and UI.

## What this build does NOT do

- No autoplay video. No autoplay audio. No stock 3D diorama. No WebGL particle system. No 3D avatars. No emoji. No colored icon fills. No gradient text. No `OrbitControls` on the page. No `<video>` tag.
