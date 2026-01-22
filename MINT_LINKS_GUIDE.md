# 🚀 Y3K Mint Links - Airdrop System

## Direct Mint Links

Every Genesis Root now has a unique, shareable mint link:

```
https://y3k.xyz/mint/100  → Mint 100.y3k
https://y3k.xyz/mint/111  → Mint 111.y3k
https://y3k.xyz/mint/222  → Mint 222.y3k
https://y3k.xyz/mint/777  → Mint 777.y3k
https://y3k.xyz/mint/999  → Mint 999.y3k
```

## Features

### 🎁 Airdrop Ready
- **Copy & Share**: One-click copy mint link button
- **QR Codes**: Scannable QR for each root
- **Social Ready**: Optimized OpenGraph metadata for sharing
- **Hype Building**: Clean, minimal landing pages

### 💎 Rarity Display
- **Visual Indicators**: Color-coded by rarity tier
- **Emoji Badges**: Crown 👑, Diamond 💎, Lightning ⚡
- **Dynamic**: Calculates rarity from root number

### ⚡ Instant Minting
- **One Page**: Root info → Mint button → Payment → Done
- **No Navigation**: Direct path to ownership
- **Payment Ready**: Connects to payment API on port 9000

## URL Structure

```
/mint/[root]
```

- `[root]` = Any number 100-999
- Automatically validates and shows 404 for invalid roots
- Generates static pages for all special numbers at build time

## Using for Airdrops

### Example 1: Twitter Airdrop
```
🎁 Free Genesis Root Airdrop!

First 10 people to mint: https://y3k.xyz/mint/555

💎 MYTHIC tier
⚡ $29 value
🔒 1 of 1 forever
```

### Example 2: Discord Exclusive
```
Exclusive for OGs 👑

Your personal mint link:
https://y3k.xyz/mint/777

This root never exists again.
```

### Example 3: QR Code Poster
```
Print QR code from /mint/888
Post in coffee shop
Anyone scans → Direct to mint page
```

## Integration with Protocol Console

Each object's YAML now points to direct mint links:

```yaml
actions:
  - id: mint_namespace
    label: "Mint This Root"
    endpoint: "/mint/100"
    
  - id: share_link
    label: "Copy Mint Link"
    endpoint: "/mint/100"
```

Clicking these in Protocol Console (`/object/100.y3k`) → Takes you to mint page

## Build & Deploy

```powershell
# Build with all mint pages
cd y3k-markets-web
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=y3kmarkets
```

All mint links pre-generated as static HTML for instant loading.

## Payment Flow

1. User visits `/mint/777`
2. Clicks "MINT NOW"
3. Creates payment intent via API (localhost:9000)
4. Shows payment address + QR
5. Monitors blockchain
6. On confirmation → Root minted

## Customization

Want to add more features to mint pages?

Edit: `y3k-markets-web/app/mint/[root]/MintRootClient.tsx`

Options:
- Add countdown timers
- Show remaining supply
- Add social proof (X minted today)
- Display recent mints
- Add referral tracking

## Marketing Examples

### Hype Drop
```
🚨 ROOT 666 UNLOCKED 🚨

Only available for 24 hours:
https://y3k.xyz/mint/666

After that? Gone forever.
```

### Influencer Partnership
```
@influencer gets exclusive mint link:
https://y3k.xyz/mint/111

Their followers get special number.
They get on-chain credit forever.
```

### Event Exclusive
```
At conference? Scan QR code on badge.
Each attendee gets unique root (200-250).
Conference becomes immutable on-chain.
```

## Status: ✅ READY TO DEPLOY

All mint links operational. Payment API running. Start sharing links for hype! 🚀
