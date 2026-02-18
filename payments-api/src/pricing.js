/**
 * pricing.js — Y3K Genesis Root Bonding Curve
 *
 * Rules:
 *   - 900 roots total (100–999)
 *   - Base price: $9
 *   - Every 10 roots sold adds $1 to the price
 *   - Root #1 sold = $9, Root #10 = $9, Root #11 = $10 ...
 *   - Root #900 (sold out) would be $98
 *
 * Special premium roots (toll-free area codes):
 *   888, 877, 866, 855, 844, 833 → 3× the curve price
 */

const BASE_PRICE_USD  = 9;      // dollars
const STEP_USD        = 1;      // +$1 per 10 mints
const STEP_SIZE       = 10;     // mints per step
const PREMIUM_ROOTS   = new Set([888, 877, 866, 855, 844, 833]);
const PREMIUM_MULT    = 3;      // 3× for toll-free numbers

/**
 * Calculate price in USD cents for the NEXT mint given
 * how many roots have already been sold.
 *
 * @param {number} mintedCount  — how many roots are already confirmed minted
 * @param {number} root         — the specific root being purchased (for premium check)
 * @returns {number}            — price in USD cents (e.g. 900 = $9.00)
 */
export function calcPriceCents(mintedCount, root) {
  const step     = Math.floor(mintedCount / STEP_SIZE);
  const baseUsd  = BASE_PRICE_USD + (step * STEP_USD);
  const mult     = PREMIUM_ROOTS.has(root) ? PREMIUM_MULT : 1;
  return Math.round(baseUsd * mult * 100); // convert to cents
}

/**
 * Human-readable price string, e.g. "$9.00" or "$27.00"
 */
export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Price schedule — array of { minMinted, maxMinted, priceUsd } brackets
 * Useful for showing buyers "price goes up at X roots sold"
 */
export function getPriceSchedule() {
  const schedule = [];
  for (let minted = 0; minted < 900; minted += STEP_SIZE) {
    const usd = BASE_PRICE_USD + Math.floor(minted / STEP_SIZE) * STEP_USD;
    schedule.push({
      minMinted: minted,
      maxMinted: Math.min(minted + STEP_SIZE - 1, 899),
      priceUsd:  usd,
      priceCents: usd * 100,
    });
  }
  return schedule;
}

export { PREMIUM_ROOTS, PREMIUM_MULT };
