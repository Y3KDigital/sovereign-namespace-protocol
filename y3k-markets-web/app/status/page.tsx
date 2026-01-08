"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPublicApiBase } from "@/lib/publicApiBase";

type HealthOk = {
  status: string;
  service: string;
  version?: string;
  stripe_configured?: boolean;
  endpoints?: string[];
};

type FetchState<T> =
  | { state: "idle" | "loading" }
  | { state: "ok"; data: T; fetchedAt: string }
  | { state: "error"; message: string };

function isoNow() {
  return new Date().toISOString();
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Request failed";
}

async function fetchJson<T>(url: string, timeoutMs = 4500): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ""}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function Pill({
  label,
  tone,
}: {
  label: string;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  const cls =
    tone === "good"
      ? "bg-green-600/20 border-green-500/20 text-green-200"
      : tone === "warn"
        ? "bg-yellow-600/20 border-yellow-500/20 text-yellow-100"
        : tone === "bad"
          ? "bg-red-600/20 border-red-500/20 text-red-200"
          : "bg-white/5 border-white/10 text-gray-200";
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border ${cls}`}>{label}</span>
  );
}

export default function StatusPage() {
  const apiBase = useMemo(() => {
    return getPublicApiBase();
  }, []);

  const [health, setHealth] = useState<FetchState<HealthOk>>({ state: "idle" });
  const [inventory, setInventory] = useState<FetchState<Record<string, unknown>>>({ state: "idle" });

  const refresh = async () => {
    setHealth({ state: "loading" });
    setInventory({ state: "loading" });

    try {
      const data = await fetchJson<HealthOk>(`${apiBase}/api/health`);
      setHealth({ state: "ok", data, fetchedAt: isoNow() });
    } catch (e) {
      setHealth({ state: "error", message: toErrorMessage(e) });
    }

    try {
      const data = await fetchJson<Record<string, unknown>>(`${apiBase}/api/inventory/status`);
      setInventory({ state: "ok", data, fetchedAt: isoNow() });
    } catch (e) {
      setInventory({ state: "error", message: toErrorMessage(e) });
    }
  };

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const healthTone: "good" | "neutral" | "bad" =
    health.state === "ok" && health.data.status === "healthy"
      ? "good"
      : health.state === "loading"
        ? "neutral"
        : "bad";

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
              <Link href="/explore" className="hover:text-purple-400 transition">
                Explore
              </Link>
              <Link href="/docs" className="hover:text-purple-400 transition">
                Docs
              </Link>
              <Link href="/trust" className="hover:text-purple-400 transition">
                Trust
              </Link>
              <Link href="/docs/game-time" className="hover:text-purple-400 transition">
                Game Time
              </Link>
              <Link href="/status" className="text-purple-400">
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-5xl font-bold mb-3 gradient-text">System Status</h1>
            <p className="text-gray-400 text-lg">
              Live signals from public endpoints. Updated every 15 seconds.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Pill label={`API Base: ${apiBase}`} tone="neutral" />
            <button
              type="button"
              onClick={() => void refresh()}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Payments API Health</h2>
                <p className="text-gray-400 text-sm mt-1">GET {apiBase}/api/health</p>
              </div>
              <Pill
                label={
                  health.state === "ok"
                    ? health.data.status
                    : health.state === "loading"
                      ? "loading"
                      : "error"
                }
                tone={healthTone}
              />
            </div>

            <div className="mt-4 text-sm">
              {health.state === "ok" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Service</span>
                    <span className="text-gray-200">{health.data.service}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Version</span>
                    <span className="text-gray-200">{health.data.version ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Stripe configured</span>
                    <span className="text-gray-200">
                      {typeof health.data.stripe_configured === "boolean"
                        ? String(health.data.stripe_configured)
                        : "—"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
                    Fetched: {health.fetchedAt}
                  </div>
                </div>
              ) : health.state === "error" ? (
                <div className="text-red-200">
                  {health.message}
                  <div className="text-xs text-gray-500 mt-2">
                    If this is intermittent, check Cloudflare Tunnel origin availability.
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Loading…</div>
              )}
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Inventory Status</h2>
                <p className="text-gray-400 text-sm mt-1">GET {apiBase}/api/inventory/status</p>
              </div>
              <Pill
                label={
                  inventory.state === "ok"
                    ? "ok"
                    : inventory.state === "loading"
                      ? "loading"
                      : "error"
                }
                tone={inventory.state === "ok" ? "good" : inventory.state === "loading" ? "neutral" : "bad"}
              />
            </div>

            <div className="mt-4">
              {inventory.state === "ok" ? (
                <pre className="text-xs bg-black/40 border border-white/10 rounded-lg p-3 overflow-auto">
                  {JSON.stringify(inventory.data, null, 2)}
                </pre>
              ) : inventory.state === "error" ? (
                <div className="text-red-200 text-sm">{inventory.message}</div>
              ) : (
                <div className="text-gray-400 text-sm">Loading…</div>
              )}
              {inventory.state === "ok" ? (
                <div className="text-xs text-gray-500 pt-2">
                  Fetched: {inventory.fetchedAt}
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <section className="mt-8 bg-white/5 border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-3">What this page proves</h2>
          <ul className="space-y-2 text-gray-300 ml-6">
            <li>• Public reachability of your operational endpoints.</li>
            <li>• Stripe configuration state is explicit (no silent partial failures).</li>
            <li>• Inventory and issuance constraints can be monitored externally.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/trust"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
            >
              Back to Trust Center
            </Link>
            <a
              href={`${apiBase}/api/health`}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open /api/health
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
