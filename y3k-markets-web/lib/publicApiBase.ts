export const DEFAULT_PUBLIC_API_BASE = "https://api.y3kmarkets.com";

function trimTrailingSlashes(v: string): string {
  return v.replace(/\/+$/, "");
}

/**
 * Public API base URL used by the web frontend.
 *
 * - In local dev, set NEXT_PUBLIC_API_URL (e.g. http://127.0.0.1:8081)
 * - In production, set it to your deployed API (e.g. https://api.y3kmarkets.com)
 *
 * If unset, we fall back to the public default.
 */
export function getPublicApiBase(): string {
  const v = process.env.NEXT_PUBLIC_API_URL;
  if (typeof v === "string" && v.trim()) {
    const candidate = trimTrailingSlashes(v.trim());

    // Guardrail: never publish loopback endpoints in production builds.
    // Static export bakes env vars at build time, so a developer's .env.local
    // could otherwise ship `http://127.0.0.1:...` onto the public internet.
    if (process.env.NODE_ENV === "production") {
      try {
        const url = new URL(candidate);
        const host = url.hostname;
        if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") {
          return DEFAULT_PUBLIC_API_BASE;
        }
      } catch {
        // If it isn't a valid absolute URL, fail closed in production.
        return DEFAULT_PUBLIC_API_BASE;
      }
    }

    return candidate;
  }
  return DEFAULT_PUBLIC_API_BASE;
}
