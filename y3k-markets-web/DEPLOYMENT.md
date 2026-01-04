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
2. Navigate to Pages → y3k-markets
3. Click "Custom domains"
4. Add `y3kmarkets.com` and `www.y3kmarkets.com`
5. DNS will be configured automatically

### Step 3: Verify Deployment

Visit your site:

- **Cloudflare URL**: [https://y3k-markets.pages.dev](https://y3k-markets.pages.dev)
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

### 1. Connect to Rust API

Currently using mock data. To connect to your SNP Rust API:

1. **Update API base URL** in components:

   ```typescript
   const API_URL = "https://api.y3kmarkets.com";
   ```

2. **Create API service** (`lib/api.ts`):

   ```typescript
   export async function generateNamespace(seed: string) {
     const response = await fetch(`${API_URL}/namespaces`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ seed })
     });
     return response.json();
   }
   ```

3. **Deploy Rust API** to production:

   ```powershell
   cd ../api-server
   # Deploy to cloud provider (AWS/Azure/DO)
   ```

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

For marketplace functionality:

- Integrate Stripe or similar payment processor
- Add wallet connection (MetaMask, WalletConnect)
- Implement escrow smart contracts

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
NEXT_PUBLIC_CHAIN_ID=1 (or your blockchain network)
```

## Performance Optimizations

Already included:

- ✅ Static site generation (SSG)
- ✅ Image optimization
- ✅ Code splitting
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

Already implemented:

- ✅ HTTPS only (via Cloudflare)
- ✅ Content Security Policy headers
- ✅ XSS protection
- ✅ No sensitive data in client code

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
- **Canonical protocol docs**: https://y3kmarkets.com/docs/canonical/readme/
- **Email**: [support@y3kdigital.com](mailto:support@y3kdigital.com)

---

**Ready to launch? Run: `.\deploy.ps1`**
