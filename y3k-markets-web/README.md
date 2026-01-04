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
- **Backend**: Rust API (../api-server)

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

## Environment Variables

For production deployment, set these in Cloudflare Pages:

```
NEXT_PUBLIC_API_URL=https://api.y3kmarkets.com
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## Custom Domain

1. Go to Cloudflare Pages → Your Project → Custom domains
2. Add `y3kmarkets.com`
3. DNS records will be configured automatically

## Project Structure

```
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

## Integration with SNP

This website connects to the Sovereign Namespace Protocol (SNP) Rust API:

- **Namespace generation**: `POST /namespaces`
- **Rarity calculation**: `GET /namespaces/:id/rarity`
- **Certificate verification**: `GET /certificates/:hash`

See `../api-server/` for API implementation.

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

- Documentation: https://y3kmarkets.com/docs
- Canonical protocol docs: https://y3kmarkets.com/docs/canonical/readme/
- Email: support@y3kdigital.com
