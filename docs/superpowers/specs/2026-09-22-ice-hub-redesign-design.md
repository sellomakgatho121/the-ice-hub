# The Ice Hub website redesign

**Date:** 22 September 2026
**Status:** Approved design, implementation planned

## 1. Purpose

Redesign The Ice Hub website as a commerce-first, cinematic ordering experience for customers in and around Tembisa. The site must help visitors understand the products, prices, delivery offer, hours, and location quickly, then build and send an order through WhatsApp.

The visual experience should be distinctive and avant-garde without making essential information difficult to find. The existing 40-frame ice sequence will provide the central cinematic motif. The current procedural Three.js crystal effect will be removed.

## 2. Goals

1. Increase completed WhatsApp preorder conversations.
2. Give customers immediate access to products, prices, opening status, delivery information, and location.
3. Serve three audiences equally:
   - Nearby residents buying everyday ice.
   - Party and event customers buying larger quantities.
   - Bars, restaurants, and venues needing repeat supply.
4. Express the brand through cinematic image sequencing, typography, composition, and controlled motion.
5. Keep ordering usable if animation, JavaScript, individual reel frames, or embedded maps fail.

## 3. Non-goals

- The site will not process card payments or provide a full checkout.
- The site will not manage inventory or guarantee product availability.
- The site will not collect or retain customer details.
- The redesign will not introduce a framework, animation library, commerce backend, CMS, or WebGL experience.
- The site will not depend on an embedded map for directions.

## 4. Confirmed commercial information

The pricing flyer effective 20 May 2026 defines the public product catalog:

| Product | Single price | Stock price |
| --- | ---: | ---: |
| 2 kg ice-cube bag | R17 | R10 each for 20 or more bags |
| 3 kg ice-cube bag | R22 | R12 each for 20 or more bags |
| 30 kg ice block | R55 | Not applicable |

Additional confirmed information:

- Free delivery around Tembisa.
- Phone and WhatsApp number: `+27 81 859 2919`.
- Delivery eligibility and final fulfillment details are confirmed in WhatsApp.

The obsolete spheres, cold-brew, 10 kg supply, and 20 kg supply entries must not appear in the redesigned catalog.

## 5. Design principles

### 5.1 Useful first, cinematic always

The page exposes the ordering action, starting price, delivery offer, and location from the opening view. The film-like presentation supports conversion rather than delaying it.

### 5.2 Avant-garde, not obscure

Extreme type scale, asymmetric grids, outlined letterforms, cinematic crops, translucent planes, and deliberate negative space create visual tension. Product names, prices, quantities, opening information, and calls to action remain conventional and explicit.

### 5.3 One visual protagonist

The photographic reel is the sole hero effect. Removing the WebGL crystal reduces visual competition, runtime weight, GPU dependence, and fallback complexity.

### 5.4 Motion has an exit

Every animated state has a composed static equivalent. No essential fact, control, or navigation path depends on scroll scrubbing or animation.

## 6. Information architecture

The page remains a single continuous document with anchored navigation.

### 6.1 Persistent utility header

The header contains:

- The Ice Hub wordmark.
- Live open or closed status.
- Links to Products, Delivery, and Visit.
- An amber **Order on WhatsApp** action.

The header begins visually integrated with the hero and gains an ink-colored translucent background after scrolling.

### 6.2 Cinematic hero

The hero occupies approximately four viewport heights while its stage remains pinned. It contains:

- The scroll-controlled 40-frame photographic reel.
- The primary statement, “Cold. On command.”
- Supporting audience-oriented copy.
- “From R17,” “Free delivery around Tembisa,” and the phone number.
- A visible WhatsApp-ordering action.
- A vertical reel-progress indicator on desktop.

### 6.3 Product ordering

A bright, ice-white ordering surface follows the hero. It contains three product cards, quantity controls, standard and stock prices, and the estimated order total.

### 6.4 Audience and service proof

A dark photographic triptych presents the three use cases:

- Everyday essentials.
- Events and large gatherings.
- Bars, restaurants, and venues.

This section communicates local reliability, bulk pricing, repeat supply, and free delivery without introducing unsupported claims.

### 6.5 Practical information

The closing section contains:

- Live SAST opening status.
- The complete weekly schedule as static HTML.
- Delivery wording and the need to confirm the address.
- Location and an external directions link.
- Click-to-call and direct WhatsApp links.
- A final full-width order action.

## 7. Visual system

### 7.1 Brand language

Use the name **The Ice Hub** consistently. The voice remains cold, precise, local, and direct. Headings and interface copy use sentence case. Copy must avoid inflated marketing language and visible em dashes.

### 7.2 Color

Retain the established palette:

- Ink black for cinematic surfaces.
- Ice white for the ordering and practical surfaces.
- Mineral blue for progress, links, focus, and technical details.
- Amber only for primary ordering actions.

Translucent layers must retain sufficient contrast over every reel frame.

### 7.3 Typography

Use the current self-hosted fonts:

- **Bricolage Grotesque Variable:** oversized display statements and product names.
- **Instrument Sans Variable:** body text and interface copy.
- **JetBrains Mono:** status, navigation, labels, prices, quantities, and progress.

The design uses extreme display scale, tight optical spacing, selective outlined words, and asymmetric alignment. Utility information remains compact but readable.

### 7.4 Icons

Use the existing local SVG icon sprite. Icons are monochrome, functional, and limited to actions or information that benefit from reinforcement. No external icon library is required.

## 8. Cinematic motion system

### 8.1 Scroll sequence

The hero reel progresses through four narrative beats:

1. **Recognition, 0–25 percent:** The opening frame is nearly still. “Cold. On command.” appears at monumental scale.
2. **Compression, 25–50 percent:** The crop tightens subtly. “From one bag to twenty” moves across the asymmetric grid while pricing and bulk availability emerge as utility annotations.
3. **Release, 50–75 percent:** The composition opens and brightens. “More cold. Less waiting.” and free delivery around Tembisa become the focal information.
4. **Conversion, 75–100 percent:** The final frame settles. “Choose it. Send it.” leads directly into the bright ordering surface.

The transition from hero to products should feel like moving from a dark cold room into a crisp service counter.

### 8.2 Timing and rendering

- Reel progress is derived from actual scroll position and available scroll distance.
- The implementation maps progress deterministically to frames 1 through 40.
- Image scale and crop may shift subtly with progress, but the subject must remain legible.
- Type transitions use opacity, masking, and controlled translation.
- No element spins, bounces, or moves without conveying progression.
- Scroll work is scheduled with `requestAnimationFrame` and stops when the hero is outside the active range.

### 8.3 Frame loading

- Display an optimized poster immediately.
- Preload the opening frames needed for the first interaction.
- Warm the remaining frames progressively, prioritizing frames nearest the current position.
- Decode frames before display where the browser supports it.
- A missing frame holds the nearest available frame rather than revealing an empty background.

### 8.4 Reduced motion

When `prefers-reduced-motion: reduce` is active:

- The hero is one viewport rather than a pinned multi-viewport sequence.
- A deliberately selected still image replaces scrubbing.
- The primary copy, price cue, delivery statement, and order action remain visible.
- Marquees, reveal transitions, parallax, and animated progress are disabled.
- All product and navigation controls behave normally.

## 9. Ordering interaction

### 9.1 Product cards

Each card shows:

- Product and package size.
- Standard price.
- Stock price and threshold where applicable.
- Audience-oriented use label.
- Quantity decrement and increment controls.
- An **Add to order** action.

Quantities begin at zero and cannot become negative.

### 9.2 Price calculation

For 2 kg and 3 kg bags:

- Quantities from 1 through 19 use the standard unit price.
- Quantities of 20 or more use the applicable stock unit price for every bag of that product.

The 30 kg block always uses R55 per block.

When a bag quantity crosses the threshold in either direction, the card, estimated total, and accessibility announcement update together. The site describes the result as an estimated total because availability and fulfillment are confirmed by The Ice Hub.

### 9.3 Persistent order summary

The summary remains hidden until at least one quantity is greater than zero. It then shows:

- Total number of items.
- Condensed product breakdown.
- Estimated total.
- **Continue on WhatsApp** action.

On desktop it appears as a compact floating panel. On mobile it becomes a bottom bar with safe-area padding. It must not cover focused controls, legal information, or the final page content.

### 9.4 WhatsApp message

The site generates encoded plain text and opens WhatsApp for `+27 81 859 2919`. The message includes:

```text
Hello The Ice Hub, I would like to order:

• 20 × 2 kg ice-cube bags at R10 each
• 2 × 30 kg ice blocks at R55 each

Estimated total: R310

Delivery or collection: [please confirm]
Delivery address: [please add]
Preferred date and time: [please add]

Please confirm availability and the final total.
```

Only products with nonzero quantities are included. The customer can edit the message before sending it.

### 9.5 Non-JavaScript path

Every product card includes a normal direct WhatsApp link in the HTML. Without JavaScript, the quantity builder and estimate are absent, but a visitor can still start a product-specific order. The phone link, hours, address, and directions remain functional.

## 10. Hours, location, and delivery

- Opening status is calculated in South African Standard Time, independent of the visitor’s time zone.
- Complete hours remain visible in static markup even if status calculation fails.
- The delivery claim is written exactly as “Free delivery around Tembisa.”
- The interface does not infer a delivery radius or promise eligibility for a specific address.
- The generated order message asks the customer to supply an address for confirmation.
- The primary directions control is a normal external map link.
- Any optional embedded OpenStreetMap view loads only after explicit interaction and is not required to use the page.

## 11. Responsive behavior

### Desktop, 1024 px and wider

- Full asymmetric cinematic composition.
- Vertical reel progress rail.
- Three-column product and audience layouts.
- Compact floating order summary.

### Tablet, 600–1023 px

- Simplified headline choreography.
- Reduced decorative layering.
- One- or two-column sections according to available width.
- Touch-first quantity controls.

### Mobile, 320–599 px

- Purposeful reel crops with mobile-specific focal positions.
- Shorter hero scroll distance.
- Stacked products and audience cards.
- Compact header with the primary order action retained.
- Bottom order bar with safe-area insets.

All supported widths must avoid horizontal overflow. Controls must remain at least 44 by 44 CSS pixels.

## 12. Accessibility

- Use semantic header, navigation, main, section, article, footer, list, button, output, and definition-list elements as appropriate.
- Provide a skip link and logical heading hierarchy.
- Preserve complete keyboard operation and visible focus indicators.
- Use native buttons for quantity controls.
- Give quantity buttons product-specific accessible names.
- Announce quantity, stock-price activation, and estimated-total changes through a polite live region.
- Treat reel imagery as atmospheric and keep all commercial information in text.
- Maintain WCAG 2.2 AA contrast for text, controls, focus, and translucent overlays.
- Avoid autoplaying audio and flashing content.
- Respect reduced-motion preferences from the first render.

## 13. Performance and resilience

- Remove Three.js and the crystal module from the production page.
- Keep the existing static HTML, CSS, and native JavaScript architecture.
- Use self-hosted fonts and the local SVG sprite only.
- Do not add an animation dependency.
- Size image elements to avoid layout shift.
- Prioritize the hero poster, first reel frames, stylesheet, and display font.
- Defer remaining reel frames and optional map content.
- Ensure ordering controls become usable without waiting for all frames.
- Preserve a complete poster-based hero if Web APIs or reel assets fail.
- Remove Web3Forms from the main order journey and do not send customer data to a site backend.

## 14. Error and fallback behavior

| Failure | Required behavior |
| --- | --- |
| JavaScript unavailable | Static content, hours, direct product WhatsApp links, phone, and directions continue to work. |
| Individual frame unavailable | Hold the nearest decoded frame and continue the sequence. |
| Reel broadly unavailable | Display the designated poster with all key copy and actions. |
| WhatsApp app unavailable | The WhatsApp web URL remains usable; the phone link remains available separately. |
| Opening-status calculation fails | Full hours remain visible; no inaccurate status is shown. |
| Optional map fails | Address and external directions link remain available. |
| Reduced-motion enabled | Use the composed static hero and disable nonessential motion. |

## 15. Verification strategy

### 15.1 Automated browser verification

Extend the current Playwright and axe verification to check:

- All 40 frame URLs and the poster return successfully.
- Representative scroll positions map to the expected scenes and frames.
- Reel fallback remains legible when frames are blocked.
- Quantities cannot become negative.
- Standard and stock pricing switch exactly at 20 bags.
- Mixed-product estimated totals are correct.
- The WhatsApp URL contains the correct number and encoded order text.
- Only selected products appear in the message.
- The live opening status uses SAST.
- The static hours remain present.
- Keyboard focus order and operation are correct.
- The skip link works.
- Reduced-motion behavior avoids pinned scrubbing and animated marquees.
- axe reports no WCAG A or AA violations in tested states.
- Touch targets meet the 44-pixel minimum.
- No horizontal overflow occurs at 320, 390, 768, and 1440 px.
- The page remains usable with JavaScript disabled.

### 15.2 Manual verification

Review on representative mobile and desktop screens for:

- Cinematic pacing and continuity.
- Subject-safe image crops.
- Typography masks and transitions.
- Overlay contrast across light and dark reel frames.
- Header and order-summary behavior.
- Mobile safe-area handling.
- Real WhatsApp app and web handoff.
- Product, price, phone, delivery, hours, and location accuracy.

## 16. Implementation boundaries

The redesign should modify the existing static site rather than replace it with a framework. Likely affected files include the primary HTML, stylesheet, runtime configuration, reel and motion scripts, hours logic, order logic, map behavior, and browser verification scripts. Exact edits and test sequence will be defined in the implementation plan after this specification is approved.
