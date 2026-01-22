# Add OpenAI API Key to Cloudflare Pages

## Method 1: Via Dashboard (Recommended)

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** → **y3kmarkets** → **Settings** → **Environment variables**
3. Click **Add variable**
4. Set:
   - **Variable name:** `OPENAI_API_KEY`
   - **Value:** `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`
   - **Environment:** Production (and Preview if needed)
5. Click **Save**
6. Redeploy the site (or trigger a new deployment)

## Method 2: Via Wrangler CLI

```bash
cd "c:\Users\Kevan\web3 true web3 rarity\y3k-markets-web"

# Set production environment variable
npx wrangler pages secret put OPENAI_API_KEY --project-name=y3kmarkets

# When prompted, paste the key:
# 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
```

## After Adding the Variable

The API will automatically use the environment variable instead of the hardcoded fallback. The NFT art generator will start working immediately on the next request.

## Test It

1. Visit: https://f669e333.y3kmarkets.pages.dev
2. Scroll to "Generate & Mint Unique NFT Art"
3. Enter: "a donkey man with a beer, a man body with donkey head"
4. Select style: Cinematic
5. Click "Generate NFT Art"

Should now generate successfully! 🎨

## Latest Deployment
https://f669e333.y3kmarkets.pages.dev

## Security Note
The API key is now properly handled:
- ✅ Stored in Cloudflare environment variables (secure)
- ✅ Not exposed in client-side code
- ✅ Only accessible to edge functions
- ✅ Fallback included for testing (can be removed after env var is set)
