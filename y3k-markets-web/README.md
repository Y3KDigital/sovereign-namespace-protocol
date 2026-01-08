# Y3K Markets Website

The official marketplace website for Y3K Markets - True Web3 Rarity.

## Features

- 🎨 Modern, responsive design with Tailwind CSS
- ⚡ Fast, SEO-optimized Next.js 14 (App Router)
- 🔐 Cryptographic namespace generation
- 📊 Live rarity calculation and visualization
- 🌐 Deployed on Cloudflare Pages

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages
- **Backend (payments + issuance)**: Rust payments API (`../payments-api`)

## Local Development

```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deploy to Cloudflare Pages

### Option 1: Automatic Deployment (Recommended)

```powershell
# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=y3kmarkets --branch=main
```

### Option 2: Connect GitHub Repository

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project" → "Connect to Git"
3. Select your repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `y3k-markets-web`
5. Click "Save and Deploy"

## Deployment verification (audit-friendly)

If you need to prove what is *actually* being served (headers + raw HTML, resistant to stale extractors), use:

- `DEPLOYMENT_VERIFICATION_PLAYBOOK.md`

### CI evidence capture (Deployment Truth Control)

This repo includes a GitHub Actions workflow that runs the same verification and uploads the terminal output as an artifact:

- `.github/workflows/deployment-truth-control.yml`

Use **Actions → Deployment Truth Control → Run workflow** (optionally override the base URLs).

## Environment Variables

For production deployment, set these in Cloudflare Pages.

For local development, copy `.env.example` to `.env.local` and adjust as needed.

```dotenv
NEXT_PUBLIC_API_URL=https://api.y3kmarkets.com
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Custom Domain

1. Go to Cloudflare Pages → Your Project → Custom domains
2. Add `y3kmarkets.com`
3. DNS records will be configured automatically

## Project Structure

```text
y3k-markets-web/
├── app/
│   ├── page.tsx          # Home page
│   ├── explore/          # Marketplace explorer
│   ├── create/           # Namespace generator
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── HeroSection.tsx
│   ├── LiveCounter.tsx
│   └── RarityShowcase.tsx
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── wrangler.toml        # Cloudflare config
```

## Integration with payments-api (mint flow)

The `/mint` page and bowl-week landings create a Stripe PaymentIntent and then poll order status:

- **Create payment intent**: `POST /api/payments/create-intent`
- **Get order status**: `GET /api/orders/{order_id}`
- **Download certificate**: `GET /api/downloads/{token}`

See:

- `../payments-api/README.md`
- `../payments-api/STRIPE_TEST_EXECUTION.md`

## Production Checklist

- [ ] Set environment variables in Cloudflare
- [ ] Configure custom domain (y3kmarkets.com)
- [ ] Enable HTTPS/SSL
- [ ] Test namespace generation flow
- [ ] Verify API connectivity
- [ ] Enable analytics (Cloudflare Web Analytics)
- [ ] Set up error monitoring (Sentry/LogRocket)

## License

See ../LICENSE

## Support

- Documentation: <https://y3kmarkets.com/docs>
- Canonical protocol docs: <https://y3kmarkets.com/docs/canonical/readme/>
- Email: [support@y3kdigital.com](mailto:support@y3kdigital.com)
