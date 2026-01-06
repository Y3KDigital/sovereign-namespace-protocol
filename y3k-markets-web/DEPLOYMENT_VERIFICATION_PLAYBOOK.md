# Deployment Verification Playbook (Cloudflare Pages)

This playbook is designed to prove “deployment truth” under adversarial verification.

**Scope:** `y3k-markets-web` (Next.js static export) deployed to Cloudflare Pages project **`y3kmarkets`**.

## Ground rules (what to trust)

Authoritative signals:

- Raw HTTP response headers and body fetched directly (no “reader mode”, no extractors)
- Cloudflare Pages deployment list (environment=production)

Non-authoritative signals:

- Third-party “page extraction” systems, cached snapshots, search previews
- Browser caches without a hard refresh / cache-bust

## 0) Windows note: use `curl.exe`

PowerShell aliases `curl` to `Invoke-WebRequest`. For deterministic results, use **`curl.exe`**.

### One-command option (recommended)

If you prefer a single command that prints pass/fail checks and exits non-zero on failure:

- `npm run verify:deploy`

This runs `scripts/verify-deploy.ps1`.

## 1) Confirm you’re deploying to the correct Pages project

From `y3k-markets-web/`:

- Production deployments:
  - `npx wrangler pages deployment list --project-name=y3kmarkets --environment=production`
- Preview deployments:
  - `npx wrangler pages deployment list --project-name=y3kmarkets --environment=preview`

Expected:

- Latest production deployment lists a URL like `https://<hash>.y3kmarkets.pages.dev`.
- The project domains include `y3kmarkets.pages.dev`, `x.y3kmarkets.com`, `y3kmarkets.com`.

## 2) Verify response headers (cache truth)

Check headers for all serving endpoints:

- `https://y3kmarkets.pages.dev/`
- `https://x.y3kmarkets.com/`
- `https://y3kmarkets.com/`

PowerShell (one-liners):

- `curl.exe -s -D - -o NUL -m 15 https://y3kmarkets.com/`
- `curl.exe -s -D - -o NUL -m 15 https://x.y3kmarkets.com/`
- `curl.exe -s -D - -o NUL -m 15 https://y3kmarkets.pages.dev/`

Expected headers (minimum):

- `Cache-Control: no-store` (HTML)
- Security headers present (CSP/HSTS/etc)

Notes:

- `cf-cache-status` is allowed to vary (DYNAMIC/HIT/etc). The key requirement is **HTML is not edge-cached across deploys** (no-store).

## 3) Prove the served HTML matches the latest build (body truth)

Fetch the raw homepage HTML and search for old/new claim markers.

Example: check that the *old* tier ranges (9,500+) are absent:

- `curl.exe --compressed -s -m 15 https://y3kmarkets.com/ | Select-String -Pattern '9,500\+|9,000\s*-\s*9,499|8,000\s*-\s*8,999' -AllMatches`

Example: check that the *new* tier ranges (0–1000) are present:

- `curl.exe --compressed -s -m 15 https://y3kmarkets.com/ | Select-String -Pattern '901|751|501|251|101|0' -AllMatches | Select-Object -First 20`

Expected:

- Old tier strings **do not appear** in the body.
- New tier strings **do appear** (often HTML-encoded, e.g. `901–1000` may render as `901ΓÇô1000`).

Tip: If you want an even tighter assertion, search for the exact component labels (e.g. `Tier 6`, `Tier 1`).

## 4) Canonical routing verification (spec link rot)

Spot-check that canonical docs routes resolve and that spec-index links don’t 404:

- `https://y3kmarkets.com/docs/canonical/spec-index/`
- Click-through (or fetch) a couple:
  - `https://y3kmarkets.com/docs/canonical/specs/constitution/`
  - `https://y3kmarkets.com/docs/canonical/specs/genesis-spec/`

Expected:

- Links resolve to `/docs/canonical/specs/.../`.
- Legacy `.md`-style links should redirect correctly.

## 5) Status page verification (no loopback in production)

- `https://y3kmarkets.com/status/`

Expected:

- API base displayed should be a public URL (e.g. `https://api.y3kmarkets.com`), never `localhost` / `127.0.0.1`.

If the status page shows fetch failures, that’s an **API availability/CORS/origin** issue—not a frontend deploy truth issue.

## 6) Troubleshooting playbook (common false negatives)

### “Extractor shows old content”

- Treat as non-authoritative.
- Re-run sections (2) and (3). Raw HTTP wins.

### Browser shows old content

- Hard refresh.
- Use a cache-busting query (still verify via raw HTTP):
  - `https://y3kmarkets.com/?v=<deploy-hash>`

### `curl` prompts for a URI

- You used PowerShell’s alias. Use `curl.exe`.

### `/index.html` behaves differently

- With `trailingSlash: true`, `/index.html` may redirect. Always verify the canonical path `/`.
