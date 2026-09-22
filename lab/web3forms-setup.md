# Web3Forms setup

The form is wired to [Web3Forms](https://web3forms.com/) but ships in **demo mode** until a real access key is pasted into `site/config.js`.

## One-time setup

1. Open https://web3forms.com/ in a browser.
2. Enter `Lebomorena3@gmail.com` in the access key generator and click **Create Access Key**.
3. Web3Forms sends a confirmation email to that address; click the link inside to activate the key.
4. Copy the access key from the confirmation page.
5. Open `site/config.js` and replace:
   ```js
   web3formsKey: "YOUR_ACCESS_KEY_HERE",
   ```
   with:
   ```js
   web3formsKey: "your-actual-key-here",
   ```
6. Save the file. Reload the site — the form will switch from demo mode to live. The hint message ("Demo mode. Add your Web3Forms key...") disappears, and submissions POST to `https://api.web3forms.com/submit`.

## What gets emailed

Each submission arrives in `Leboborena3@gmail.com` with:

- **Subject:** `[The Ice Hub] Pre-order · <order value>`
- **From name:** `The Ice Hub website`
- **Reply-to:** the customer's email
- **Body:** the customer's email + their selected product (cubes-1kg, spheres, cold-brew, venue-10kg, venue-20kg)

Click **Reply** in Gmail and the reply goes to the customer.

## Spam protection

- `botcheck` field is rendered as an empty `<input>` and validated as empty.
- `website` honeypot field is hidden with `position:absolute;left:-9999px` and rejected if filled.
- The submit button is disabled while the request is in flight.
- All errors are surfaced through `aria-live="polite"` so screen readers announce them.

## Rollback

Set the key back to `"YOUR_ACCESS_KEY_HERE"` and reload — the form returns to demo mode without touching any other file.

## Why Web3Forms

- No account creation, no signup (just an email confirmation).
- Free tier covers the expected volume for a single counter-service shop.
- No server to run, no env vars to manage, no deploy-time secret.
- If the shop later needs a real backend, swap `form.js` for a `fetch("/api/order", …)` call. The form markup stays the same.