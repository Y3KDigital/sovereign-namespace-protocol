# Game Time Checklist (Bowl Week + Mint Funnel)

This is the short, do-not-think checklist to be ready for bowl-week traffic.

## 0) Preflight: decide your deployment mode

This web app uses `next.config.mjs` with `output: 'export'`.

That means **environment variables are baked into the static build at build time**.

- **If Cloudflare Pages builds from GitHub**: set env vars in Cloudflare Pages and redeploy.
- **If you build locally and run `wrangler pages deploy out`**: ensure your local `.env.local` is correct **before** `npm run build`.

## 1) Web (y3k-markets-web) — required config

Set these at build time:

- `NEXT_PUBLIC_API_URL` (points to the deployed `payments-api` base)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Stripe publishable key, e.g. `pk_live_...`)
- Optional: `NEXT_PUBLIC_IPFS_GATEWAY` (defaults can be fine)

Sanity check routes:

- `/bowl/miami/citynil`
- `/bowl/miami/mascotnil`
- `/bowl/olemiss/citynil`
- `/bowl/olemiss/mascotnil`
- `/bowl/olemiss/lane` (satire page)
- `/mint`

## 2) API (payments-api) — required config

In production you want Stripe to be *mandatory*:

- `REQUIRE_STRIPE=true`

Stripe secrets:

- `STRIPE_API_KEY=sk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`

Operational / safety:

- `CORS_ALLOWED_ORIGINS` includes your deployed site origin(s)
  - defaults already allow `https://y3kmarkets.com`, `https://x.y3kmarkets.com`, `https://y3kmarkets.pages.dev`, and `http://localhost:3000`

Health check:

- `GET /api/health` should show `stripe_configured: true`

## 3) Stripe webhook: verify delivery

- Stripe dashboard → Developers → Webhooks
- Confirm your endpoint points to:
  - `POST https://YOUR_API_HOST/api/payments/webhook`
- Confirm recent deliveries are **200 OK**

If you’re testing locally, follow:

- `../payments-api/STRIPE_TEST_EXECUTION.md`

## 4) End-to-end smoke test (live or test mode)

1. Open a bowl page (e.g. `/bowl/miami/citynil`)
2. Click the Mint CTA (should land on `/mint` with NIL params)
3. Enter an email
4. Click **Create payment intent**
5. Complete payment
6. Verify redirect to `/mint/success?order_id=...`
7. Wait for **Download certificate** link
8. Confirm:
   - namespace is shown
   - NIL label is shown
   - download works

## 5) Last-mile “crowd is here” checks

- Inventory is not exhausted unexpectedly:
  - `GET /api/inventory/status`
- Namespace reservations are working:
  - `GET /api/namespaces/availability?namespace=1.x`
- Support workflow:
  - If an order is paid but issuance is delayed, use the retry endpoint (see `payments-api` tooling) or check webhook delivery.

