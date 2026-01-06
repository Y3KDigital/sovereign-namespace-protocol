"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPublicApiBase } from "@/lib/publicApiBase";

type Affiliate = {
  id: string;
  display_name: string;
  email: string;
  portal_token: string;
  referral_code: string;
  commission_bps: number;
  bonus_cents: number;
  active: boolean;
  created_at: string;
};

type AffiliatePortalStats = {
  leads_count: number;
  conversions_count: number;
  gross_revenue_cents: number;
  earned_cents: number;
  paid_cents: number;
  voided_cents: number;
};

type AffiliatePortalResponse = {
  affiliate: Affiliate;
  referral_url: string;
  stats: AffiliatePortalStats;
};

function formatUsd(cents: number): string {
  const dollars = cents / 100;
  return dollars.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

async function fetchWithTimeout(input: RequestInfo, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export default function PartnerClient() {
  const searchParams = useSearchParams();
  const token = (searchParams.get("t") || "").trim();

  const apiBase = useMemo(() => {
    return getPublicApiBase();
  }, []);

  const [data, setData] = useState<AffiliatePortalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithTimeout(
          `${apiBase}/api/affiliates/portal/${encodeURIComponent(token)}`,
          { method: "GET", headers: { Accept: "application/json" } },
          8000
        );

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const msg = body?.message || `Request failed (${res.status})`;
          throw new Error(msg);
        }

        const json = (await res.json()) as AffiliatePortalResponse;
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setError(e?.message || "Unable to load portal");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [apiBase, token]);

  return (
    <main className="min-h-screen pt-16">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-8">
              <Link href="/" className="hover:text-purple-400 transition">
                Home
              </Link>
              <Link href="/trust" className="hover:text-purple-400 transition">
                Trust
              </Link>
              <Link href="/status" className="hover:text-purple-400 transition">
                Status
              </Link>
              <Link href="/partner" className="text-purple-400">
                Partner
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Partner Portal</h1>
        <p className="text-gray-400 text-lg mb-10">
          A private console for brokers and affiliates: clean attribution, visible commissions, and a
          link you can send without ceremony.
        </p>

        {!token ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-3">Portal link required</h2>
            <p className="text-gray-300">
              This page loads your portal using a private token in the URL.
            </p>
            <p className="text-gray-400 mt-3">
              Example: <span className="font-mono">/partner/?t=pt_…</span>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition"
              >
                Request a portal link
              </Link>
              <Link
                href="/trust"
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
              >
                Verify the system
              </Link>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-gray-300">
            Loading portal…
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-200">
            <div className="font-semibold">Portal unavailable</div>
            <div className="text-sm mt-1 opacity-90">{error}</div>
          </div>
        ) : null}

        {data ? (
          <div className="space-y-6">
            <section className="bg-white/5 border border-white/10 rounded-xl p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{data.affiliate.display_name}</h2>
                  <div className="text-gray-400 mt-1">
                    Commission: {(data.affiliate.commission_bps / 100).toFixed(2)}% · Bonus per sale:
                    {" "}
                    {formatUsd(data.affiliate.bonus_cents)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Referral code</div>
                  <div className="font-mono text-lg">{data.affiliate.referral_code}</div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500">Leads</div>
                  <div className="text-2xl font-bold">{data.stats.leads_count}</div>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500">Conversions</div>
                  <div className="text-2xl font-bold">{data.stats.conversions_count}</div>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500">Gross revenue</div>
                  <div className="text-2xl font-bold">{formatUsd(data.stats.gross_revenue_cents)}</div>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500">Earned</div>
                  <div className="text-2xl font-bold">{formatUsd(data.stats.earned_cents)}</div>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500">Paid</div>
                  <div className="text-2xl font-bold">{formatUsd(data.stats.paid_cents)}</div>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500">Voided</div>
                  <div className="text-2xl font-bold">{formatUsd(data.stats.voided_cents)}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm text-gray-400 mb-2">Your referral link</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    readOnly
                    value={data.referral_url}
                    aria-label="Referral link"
                    title="Referral link"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(data.referral_url)}
                    className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This link routes prospects to a hosted invite page and records attribution.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/create"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition"
                >
                  Open mint page
                </Link>
                <Link
                  href="/trust"
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
                >
                  Verification pack
                </Link>
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-2">Notes</h3>
              <ul className="space-y-2 text-gray-300 ml-5">
                <li>• Earnings are ledgered on payment success and voided on qualifying refunds.</li>
                <li>
                  • This portal is a read model; payout rails (instant settlement) can be wired to
                  your preferred method.
                </li>
              </ul>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
