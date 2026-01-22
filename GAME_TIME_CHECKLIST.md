# Game Time Checklist (Bowl Week + Mint Funnel)

This is the short, do-not-think checklist to be ready for bowl-week traffic.

## Quick Links
- [Production Web](https://y3kmarkets.com)
- [Public Payments API](https://api.y3kmarkets.com)
- [Health Check](https://api.y3kmarkets.com/api/health)
- [Share /today](/today)
- [Go to Mint](/mint)
- [Mint TodayNIL (City)](/mint?nil_name=TodayNIL&nil_role=city)
- [Mint TodayNIL (Mascot)](/mint?nil_name=TodayNIL&nil_role=mascot)
- [Miami Funnel](/bowl/miami/citynil)
- [Ole Miss Funnel](/bowl/olemiss/citynil)

## 0) Preflight: decide your deployment mode
This web app uses `next.config.mjs` with `output: 'export'`.
That means environment variables are **baked into the static build** at build time.

- If Cloudflare Pages builds from GitHub: set env vars in Cloudflare Pages and redeploy.
- If you build locally and run `wrangler pages deploy out`: ensure your local `.env.local` is correct before `npm run build`.

## 1) Web (y3k-markets-web) — required config
Set these at build time:
- `NEXT_PUBLIC_API_URL` (points to the deployed payments-api base)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Stripe publishable key, e.g. `pk_live_...`)
- Optional: `NEXT_PUBLIC_IPFS_GATEWAY` (defaults can be fine)

**Notes:**
- On Cloudflare Pages, these must be set as build-time environment variables and then the site must be redeployed.
- If `/mint` shows “Stripe publishable key not configured”, the build did not include `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

**Sanity check routes:**
- `/bowl/miami/citynil`
- `/bowl/miami/mascotnil`
- `/bowl/olemiss/citynil`
- `/bowl/olemiss/mascotnil`
- `/bowl/olemiss/lane` (satire page)
- `/mint`

## 2) API (payments-api) — required config
In production you want Stripe to be mandatory:
- `REQUIRE_STRIPE=true`

**Stripe secrets:**
- `STRIPE_API_KEY=sk_live_...` (preferred)
- `STRIPE_WEBHOOK_SECRET=whsec_...`

**Operational / safety:**
- `CORS_ALLOWED_ORIGINS` includes your deployed site origin(s)
  - defaults already allow `https://y3kmarkets.com`, `https://x.y3kmarkets.com`, `https://y3kmarkets.pages.dev`, and `http://localhost:3000`

**Health check:**
`GET /api/health` should show `stripe_configured: true`

**Repo tooling that helps:**
- `payments-api/verify-public-api.ps1` validates public health + inventory.
- `payments-api/restart-payments-api.ps1` restarts the local API and prints health.
- `payments-api/run-tunnel.ps1` runs the repo-local Cloudflare tunnel runner (avoids user-profile tunnel collisions).

## 3) Stripe webhook: verify delivery
1. Stripe dashboard → Developers → Webhooks
2. Confirm your endpoint points to: `POST https://api.y3kmarkets.com/api/payments/webhook`
3. Confirm recent deliveries are **200 OK**

If you’re testing locally, follow: `../payments-api/STRIPE_TEST_EXECUTION.md`

## 4) End-to-end smoke test (live or test mode)
1. Open a bowl page (e.g. `/bowl/miami/citynil`)
2. Click the **Mint CTA** (should land on `/mint` with NIL params)
3. Enter an email
4. Click **Create payment intent** (or Claim Genesis Root)
5. Complete payment
6. Verify redirect to `/mint/success?order_id=...`
7. Wait for "Download certificate" link
8. Confirm:
   - namespace is shown
   - NIL label is shown
   - download works

## 5) Last-mile “crowd is here” checks
- **Inventory is not exhausted unexpectedly:**
  `GET /api/inventory/status`
- **Namespace reservations are working:**
  `GET /api/namespaces/availability?namespace=1.x`

**Support workflow:**
If an order is paid but issuance is delayed, use the retry endpoint (see payments-api tooling) or check webhook delivery.
If the success page stays stuck in "processing":
1. Check Stripe webhook deliveries (status, retries, error bodies).
2. Check payments-api logs for webhook signature errors (wrong `STRIPE_WEBHOOK_SECRET`) or DB errors.
