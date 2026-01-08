# Y3K Markets Deployment Guide

## Quick Start

Your Y3K Markets website is ready to deploy! Here's how:

### Step 1: Deploy to Cloudflare Pages

#### Option A: Using the Deploy Script (Easiest)

```powershell
cd y3k-markets-web
.\deploy.ps1
```

#### Option B: Manual Deployment

```powershell
cd y3k-markets-web
npm run build
npx wrangler pages deploy out --project-name=y3kmarkets --branch=main
```

When prompted, authenticate with your Cloudflare API token:
⚠️ **Do not paste or commit API tokens into this repo.**

Authenticate using Wrangler instead:

```powershell
npx wrangler login
```

Or set a local environment variable (recommended for CI) such as `CLOUDFLARE_API_TOKEN` in your machine/CI secret store.

### Step 2: Configure Custom Domain

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to Pages → y3kmarkets
3. Click "Custom domains"
4. Add `y3kmarkets.com` and `www.y3kmarkets.com`
5. DNS will be configured automatically

### Step 3: Verify Deployment

For a verification-first, audit-friendly checklist (headers + raw HTML proof), see:

- `DEPLOYMENT_VERIFICATION_PLAYBOOK.md`

Visit your site:

- **Cloudflare URL**: [https://y3kmarkets.pages.dev](https://y3kmarkets.pages.dev)
- **x subdomain**: [https://x.y3kmarkets.com](https://x.y3kmarkets.com)
- **Custom domain**: [https://y3kmarkets.com](https://y3kmarkets.com)

## What's Included

✅ **Landing Page** (`/`)

- Hero section with animated background
- Live namespace counter
- Rarity tiers showcase
- "How It Works" section
- Call-to-action buttons

✅ **Explore Page** (`/explore`)

- Namespace marketplace grid
- Rarity filters (Mythic, Legendary, Epic, etc.)
- Mock namespace listings with prices
- Search functionality (ready for API integration)

✅ **Create Page** (`/create`)

- Namespace generator form
- Seed input with random seed button
- Live rarity calculation
- Certificate download (ready for API integration)

✅ **Responsive Design**

- Mobile-friendly
- Dark theme optimized
- Gradient accents (purple/blue brand colors)
- Smooth animations

## Next Steps

### 1. Connect to the Payments API (game-time critical)

The bowl-week pages and `/mint` call the **payments API** from the browser.

Key endpoints used by the web app:

- `POST /api/payments/create-intent`
- `GET /api/orders/{order_id}`
- `GET /api/downloads/{token}`

1. **Set `NEXT_PUBLIC_API_URL`**:

   - For local dev: copy `.env.example` → `.env.local` and set your local API base.
   - For Cloudflare Pages (Git integration): set the variable in Pages → Settings → Environment variables (it is baked at build time).
   - For local-build + `wrangler pages deploy` (this repo's default): ensure your local `.env.local` is correct **before** running `npm run build`.

2. **Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**:

   - Required to render Stripe Elements checkout on `/mint`.
   - This is public-safe (publishable key), but still treat it as a config value (don’t hardcode it).

3. **Ensure API CORS allows the site origin**:

   The payments API supports `CORS_ALLOWED_ORIGINS` and defaults to allowing:
   `https://y3kmarkets.com`, `https://x.y3kmarkets.com`, `https://y3kmarkets.pages.dev`, and `http://localhost:3000`.
   If you deploy additional subdomains, either:
   - add them to `CORS_ALLOWED_ORIGINS`, or
   - rely on the built-in `https://*.y3kmarkets.com` allowance.
4. **Deploy payments API** to production:

   - Deploy `../payments-api` to your API host.
   - Ensure `STRIPE_API_KEY` + `STRIPE_WEBHOOK_SECRET` are set (and valid) for real purchases.
   - Consider setting `REQUIRE_STRIPE=true` in production to prevent booting without Stripe.

### 2. Add Analytics

Cloudflare Web Analytics (free):

1. Go to Cloudflare Dashboard → Web Analytics
2. Add y3kmarkets.com
3. Copy beacon script
4. Add to `app/layout.tsx`

### 3. Set Up Error Monitoring

Optional integrations:

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Posthog**: Product analytics

### 4. Enable Payments

Stripe checkout is now integrated on `/mint` (via Stripe Elements + PaymentIntents).

For the backend execution protocol and webhook forwarding, see:

- `../payments-api/STRIPE_TEST_EXECUTION.md`

For “we are walking into the stadium” readiness, see:

- `GAME_TIME_CHECKLIST.md`

## Development Workflow

### Local Development

```powershell
cd y3k-markets-web
npm run dev
# Open http://localhost:3000
```

### Make Changes

1. Edit files in `app/` or `components/`
2. Changes hot-reload automatically
3. Test in browser

### Deploy Updates

```powershell
npm run build
.\deploy.ps1
```

## Environment Variables

Set these in Cloudflare Pages → Settings → Environment variables:

```dotenv
NEXT_PUBLIC_API_URL=https://api.y3kmarkets.com
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
# Stripe publishable key for client-side checkout (/mint)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# NEXT_PUBLIC_CHAIN_ID=1
```

## Performance Optimizations

Already included:

- ✅ Static site generation (SSG)
- ✅ Image optimization
- ✅ Cloudflare CDN
- ✅ Gzip compression

## SEO Optimizations

Already configured:

- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph tags (social sharing)
- ✅ Semantic HTML
- ✅ Mobile responsive
- ✅ Fast load times

## Security

Deployment-time controls:

- ✅ HTTPS only (via Cloudflare)
- ✅ No sensitive data in client code (publishable Stripe key only)
- ⚠️ Security headers (CSP, etc.) should be enforced via Cloudflare Pages headers/config

If you need proof-oriented verification (headers + raw HTML), use:

- `DEPLOYMENT_VERIFICATION_PLAYBOOK.md`

## Troubleshooting

### Build fails

```powershell
# Clear cache and rebuild
rm -r .next node_modules
npm install
npm run build
```

### Deployment fails

```powershell
# Check Wrangler is installed
npx wrangler --version

# Re-authenticate
npx wrangler login
```

### Custom domain not working

1. Check DNS propagation (can take 24-48 hours)
2. Verify SSL certificate is active
3. Clear browser cache

## Support

- **Documentation**: This file + README.md
- **Canonical protocol docs**: <https://y3kmarkets.com/docs/canonical/readme/>
- **Email**: [support@y3kdigital.com](mailto:support@y3kdigital.com)

---

**Ready to launch? Run: `.\deploy.ps1`**
