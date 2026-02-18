"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const TIER_PRICES: Record<string, number> = {
  local:    297,
  tollfree: 497,
  premium:  997,
};
const TIER_LABELS: Record<string, string> = {
  local:    "Local Market",
  tollfree: "Toll-Free Pro",
  premium:  "Premium 888",
};

function CheckoutForm() {
  const params = useSearchParams();
  const number = params.get("number") ?? "";
  const vanity  = params.get("vanity")  ?? number;
  const tier    = params.get("tier")    ?? "tollfree";

  const price  = TIER_PRICES[tier] ?? 497;
  const label  = TIER_LABELS[tier] ?? "Toll-Free Pro";

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000"}/api/stripe/create-license-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, vanity, tier, price, name, email, company }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Payment session failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">NEED AI</Link>
          <Link href="/sales" className="text-sm text-gray-400 hover:text-white transition">← Back to Numbers</Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center pt-24 pb-16 px-6">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10">

          {/* Left: Order summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-fit">
            <h2 className="font-bold text-xl mb-6">Order Summary</h2>
            <div className="bg-black/40 border border-white/10 rounded-xl p-5 mb-6">
              <div className="text-3xl font-black font-mono text-white mb-1">{vanity}</div>
              <div className="text-sm text-gray-500 font-mono">{number}</div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Plan</span>
                <span className="font-semibold">{label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Billing</span>
                <span className="font-semibold">Monthly</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Includes</span>
                <span className="font-semibold text-right text-xs leading-relaxed">AI intake + routing<br />24/7 coverage<br />Monthly reports</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="font-bold">Monthly Total</span>
                <span className="text-2xl font-black text-white">${price}<span className="text-gray-500 text-sm font-normal">/mo</span></span>
              </div>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>✓ Cancel anytime — no contracts</p>
              <p>✓ Active within 1 business day</p>
              <p>✓ Secured by Stripe</p>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <h1 className="text-3xl font-black mb-2">License <span className="text-purple-400">{vanity}</span></h1>
            <p className="text-gray-400 text-sm mb-8">Complete your info below — you'll be redirected to Stripe to complete payment securely.</p>

            {error && (
              <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-4 mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-300">Full Name *</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-300">Email Address *</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                  placeholder="jane@yourcompany.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-300">Company / Business Name</label>
                <input
                  value={company} onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition"
                  placeholder="Smith Roofing LLC"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl transition mt-2"
              >
                {loading ? "Redirecting to Stripe..." : `Pay $${price}/mo → Secure Checkout`}
              </button>
            </form>
            <p className="text-center text-xs text-gray-600 mt-4">Secured by Stripe · Your card info never touches our server</p>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
