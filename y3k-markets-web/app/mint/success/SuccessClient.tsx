"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getPublicApiBase } from "@/lib/publicApiBase";

type NilRole = "city" | "mascot";

type OrderResponse = {
  order_id: string;
  status: string;
  namespace?: string | null;
  nil_name?: string | null;
  nil_role?: NilRole | null;
  nil_pair_key?: string | null;
  certificate_ipfs_cid?: string | null;
  download_url?: string | null;
  amount_paid_cents: number;
  created_at: string;
};

function formatMoney(cents: number): string {
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const apiBase = useMemo(() => getPublicApiBase(), []);

  const orderId = (searchParams.get("order_id") || "").trim();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let timer: number | null = null;

    async function fetchOnce(): Promise<OrderResponse | null> {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/orders/${encodeURIComponent(orderId)}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const body = (await res.json().catch(() => null)) as OrderResponse | null;
        if (!res.ok) {
          const msg = (body as any)?.message || `Request failed (${res.status})`;
          throw new Error(msg);
        }
        if (!body?.order_id) {
          throw new Error("Malformed response from API");
        }
        if (!cancelled) setOrder(body);
        return body;
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Unable to load order");
        return null;
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Poll until download_url exists or we hit a cap.
    let attempts = 0;
    const maxAttempts = 30; // ~60-90 seconds depending on interval

    async function loop() {
      const latest = await fetchOnce();
      attempts++;

      if (cancelled) return;
      if (latest?.download_url) return;

      if (attempts >= maxAttempts) return;
      const delayMs = 2000;
      timer = window.setTimeout(loop, delayMs);
    }

    loop();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [orderId, apiBase]);

  return (
    <main className="min-h-screen pt-16">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-8">
              <Link href="/mint" className="hover:text-purple-400 transition">
                Mint
              </Link>
              <Link href="/trust" className="hover:text-purple-400 transition">
                Trust
              </Link>
              <Link href="/docs/game-time" className="hover:text-purple-400 transition">
                Game Time
              </Link>
              <Link href="/status" className="hover:text-purple-400 transition">
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Mint status</h1>
        <p className="text-gray-400 mb-8">
          We’ll keep checking your order while issuance finalizes.
        </p>

        {!orderId ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-200">
            Missing <span className="font-mono">order_id</span>.
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs text-gray-500">Order</div>
                <div className="font-mono text-sm">{orderId}</div>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
              >
                Refresh
              </button>
            </div>

            {error ? (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">Status</div>
                <div className="text-sm font-semibold">
                  {order?.status ?? (loading ? "Loading…" : "—")}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">Paid</div>
                <div className="text-sm font-mono">
                  {order ? formatMoney(order.amount_paid_cents) : "—"}
                </div>
              </div>

              {order?.namespace ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">Namespace</div>
                  <div className="text-sm font-mono">{order.namespace}</div>
                </div>
              ) : null}

              {order?.nil_name ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">NIL</div>
                  <div className="text-sm">
                    <span className="font-semibold">{order.nil_name}</span>
                    {order.nil_role ? ` (${order.nil_role})` : ""}
                  </div>
                </div>
              ) : null}

              {order?.download_url ? (
                <div className="mt-4">
                  <Link
                    href={order.download_url}
                    className="block text-center px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition"
                  >
                    Download certificate
                  </Link>
                  {order.certificate_ipfs_cid ? (
                    <div className="mt-3 text-xs text-gray-500">
                      IPFS CID: <span className="font-mono">{order.certificate_ipfs_cid}</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-400">
                  Certificate not ready yet. This is normal—webhook issuance can take a moment.
                </div>
              )}
            </div>

            <div className="mt-6 text-xs text-gray-500">
              If this gets stuck in “succeeded” without a download link, it may mean the webhook hasn’t been delivered.
              In that case, use the retry endpoint in the API or contact support.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
