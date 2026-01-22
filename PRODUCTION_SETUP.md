# Y3K Markets - Production Deployment Setup

## ✅ What's Been Configured

### SEO Optimization
- ✅ Enhanced metadata with Open Graph + Twitter Cards
- ✅ Structured data (Schema.org JSON-LD)
- ✅ Sitemap.xml for search engines
- ✅ Robots.txt with crawler rules
- ✅ Geo targeting metadata
- ✅ PWA manifest for mobile

### Performance & Security
- ✅ Advanced HTTP headers (CSP, HSTS, XSS protection)
- ✅ Cache-Control optimized for static assets
- ✅ CORS configured for Stripe + IPFS
- ✅ Security headers for PCI compliance

### Latest Deployment
- URL: https://79259d6a.y3kmarkets.pages.dev
- Build: 67 pages, fully optimized
- Status: All NIL content removed, Genesis marketplace live

---

## 🚀 Next Steps: Add Custom Domain

### 1. Go to Cloudflare Pages Dashboard
```
https://dash.cloudflare.com/
→ Workers & Pages
→ y3kmarkets
→ Custom domains
```

### 2. Add y3kmarkets.com
Click "Set up a custom domain"
- Enter: `y3kmarkets.com`
- Click "Continue"

Cloudflare will automatically:
- Create DNS records
- Provision SSL certificate
- Enable HTTP/3 and Brotli compression

### 3. Add www Subdomain (Optional)
- Enter: `www.y3kmarkets.com`
- Set to redirect to `y3kmarkets.com`

### 4. Verify DNS Records
Go to DNS settings for y3kmarkets.com:
```
Type: CNAME
Name: @
Target: y3kmarkets.pages.dev
Proxy: Enabled (orange cloud)

Type: CNAME
Name: www
Target: y3kmarkets.pages.dev
Proxy: Enabled (orange cloud)
```

### 5. Enable Advanced Features (Recommended)
In Cloudflare Dashboard → Speed:
- ✅ Auto Minify (HTML, CSS, JS)
- ✅ Brotli compression
- ✅ Early Hints
- ✅ HTTP/3 (QUIC)
- ✅ Rocket Loader (optional)

In Cloudflare Dashboard → Caching:
- Browser Cache TTL: 4 hours
- Cache Level: Standard
- Always Online: Enabled

In Cloudflare Dashboard → SSL/TLS:
- Mode: Full (strict)
- Minimum TLS Version: 1.2
- TLS 1.3: Enabled
- Automatic HTTPS Rewrites: Enabled

---

## 🔌 API Configuration

### Option 1: Cloudflare Worker Proxy (Recommended)
Create a worker to proxy payments-api requests:

```javascript
// worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Proxy /api/* to your payments-api
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = 'https://your-api-server.com' + url.pathname;
      return fetch(apiUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
    }
    
    return fetch(request);
  }
}
```

Deploy worker:
```bash
npx wrangler deploy worker.js
```

### Option 2: Direct API Subdomain
Point `api.y3kmarkets.com` to your payments-api server:

DNS Record:
```
Type: A
Name: api
Target: [Your server IP]
Proxy: Enabled
```

Update environment variable:
```bash
NEXT_PUBLIC_API_URL=https://api.y3kmarkets.com
```

### Option 3: Cloudflare Tunnel (Most Secure)
Create a tunnel to your local payments-api:

```bash
# Install cloudflared
# Windows: choco install cloudflare-cloudflared

# Create tunnel
cloudflared tunnel create y3k-api

# Configure tunnel
cloudflared tunnel route dns y3k-api api.y3kmarkets.com

# Run tunnel
cloudflared tunnel run y3k-api
```

---

## 📊 Analytics & Monitoring

### Enable Cloudflare Web Analytics
Dashboard → Analytics → Web Analytics
- Add site: y3kmarkets.com
- Copy beacon script (already in layout)

### Enable Real User Monitoring
Dashboard → Speed → Real User Monitoring
- Enable RUM
- View Core Web Vitals data

---

## 🎯 Post-Launch Checklist

- [ ] Custom domain active (y3kmarkets.com)
- [ ] SSL certificate provisioned (check padlock)
- [ ] WWW redirect working
- [ ] API endpoint configured
- [ ] Google Search Console verified
- [ ] Submit sitemap to Google: https://search.google.com/search-console
- [ ] Test payments flow end-to-end
- [ ] Monitor Cloudflare Analytics

---

## 🔧 Quick Commands

### Rebuild and deploy:
```bash
cd "c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web"
npm run build
npx wrangler pages deploy out
```

### Start payments-api (local):
```bash
cd "c:\Users\Kevan\web3 true web3 rarity"
.\start-y3k-system.ps1
```

### View deployment logs:
```bash
npx wrangler pages deployment list
```

---

## 📈 Performance Benchmarks

Expected Lighthouse scores:
- Performance: 95-100
- Accessibility: 100
- Best Practices: 100
- SEO: 100

Current optimizations:
- Static site generation (SSG)
- Next.js Image optimization
- Brotli compression
- HTTP/3 + Early Hints
- Cloudflare CDN (200+ PoPs worldwide)

---

## 🌍 Geo Distribution

Cloudflare serves from 200+ cities globally:
- North America: ~70 PoPs
- Europe: ~60 PoPs
- Asia-Pacific: ~50 PoPs
- Latin America: ~15 PoPs
- Middle East & Africa: ~10 PoPs

All requests routed to nearest edge node automatically.

---

## 🎉 You're Ready!

Your site is production-ready with:
- ✅ Enterprise-grade security
- ✅ Global CDN distribution
- ✅ SEO optimization
- ✅ Performance tuning
- ✅ SSL/TLS encryption
- ✅ DDoS protection
- ✅ Real-time analytics

Current deployment: https://79259d6a.y3kmarkets.pages.dev
After custom domain: https://y3kmarkets.com

**Next:** Add custom domain in Cloudflare Dashboard → Custom domains
