/* The Ice Hub — runtime config.
 * Single source of truth for values that change per deployment.
 * Edit this file; do not edit the consumers.
 */

export const SHOP = {
  // Web3Forms access key. Get one at https://web3forms.com/ — paste here.
  // Until you set this, the form runs in DEMO mode (no network request).
  web3formsKey: "YOUR_ACCESS_KEY_HERE",

  // Email shown to the shop in the form submission email.
  notifyEmail: "Lebomorena3@gmail.com",

  // Subject prefix used in the email the shop receives.
  emailSubjectPrefix: "[The Ice Hub] Pre-order",

  // Address shown on the site (human-readable).
  address: "9605 Winnie Mandela Zone 4, Raymond Mhlaba Street, Tembisa 1632, South Africa",

  // Address sent to Nominatim for the map. "Winnie Mandela Zone 4" is a
  // Tembisa-internal street label that Nominatim doesn't index, so we use
  // the postal form which resolves to a sensible centroid in the area.
  geocodeQuery: "Tembisa, Gauteng, South Africa",

  // Hard-coded fallback if the geocode API is unreachable.
  fallbackLatLng: [-26.0096119, 28.2313797], // approx. Tembisa (verified via Nominatim 2026)

  // Timezone of the shop. South Africa observes SAST year-round (UTC+2, no DST).
  timezone: "Africa/Johannesburg",

  // Schedule (24h, minutes from 00:00). 0=Sun … 6=Sat.
  schedule: {
    0: { open:  9 * 60, close: 21 * 60 },
    1: { open: 10 * 60, close: 19 * 60 },
    2: { open: 10 * 60, close: 19 * 60 },
    3: { open: 10 * 60, close: 19 * 60 },
    4: { open: 10 * 60, close: 19 * 60 },
    5: { open: 10 * 60, close: 19 * 60 },
    6: { open:  9 * 60, close: 21 * 60 },
  },

  // WhatsApp destination, digits only, no "+" — wa.me requires it.
  whatsappDigits: "27818592919",
  whatsappDisplay: "+27 81 859 2919",
  deliveryClaim: "Free delivery around Tembisa",

  // Prices from the pricing flyer effective 20 May 2026.
  // stockPrice applies to the WHOLE line once quantity reaches stockThreshold.
  products: [
    { id: "cubes-2kg", name: "2 kg ice cubes", messageName: "2 kg ice-cube bag",
      standardPrice: 17, stockPrice: 10, stockThreshold: 20, use: "Everyday" },
    { id: "cubes-3kg", name: "3 kg ice cubes", messageName: "3 kg ice-cube bag",
      standardPrice: 22, stockPrice: 12, stockThreshold: 20, use: "Events" },
    { id: "block-30kg", name: "30 kg ice block", messageName: "30 kg ice block",
      standardPrice: 55, stockPrice: null, stockThreshold: null, use: "Venues" },
  ],
};

// Demo mode is on when the key is the placeholder. Surfaced in the form hint.
export const isDemoMode = SHOP.web3formsKey === "YOUR_ACCESS_KEY_HERE";