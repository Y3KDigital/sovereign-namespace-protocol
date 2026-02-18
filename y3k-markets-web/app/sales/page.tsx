"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Data ─────────────────────────────────────────────── */
const ALL_NUMBERS = [
  // Premium 888
  { vanity: "888-LAW-AI",  phone: "888-505-2924", category: "Law",    vertical: "law",    tier: "premium", geo: "National", desc: "Top-tier legal intake. Qualifies cases, captures details, routes attorneys." },
  { vanity: "888-BUCK-AI", phone: "888-676-2825", category: "Money",  vertical: "money",  tier: "premium", geo: "National", desc: "Funding qualification, settlement routing, financial AI intake." },
  { vanity: "888-CASH-AI", phone: "844-347-2274", category: "Money",  vertical: "money",  tier: "premium", geo: "National", desc: "Cash advance qualification and payment routing AI." },
  { vanity: "888-BANK-AI", phone: "866-506-2265", category: "Money",  vertical: "money",  tier: "premium", geo: "National", desc: "Banking and financial services intake. High trust recall." },
  { vanity: "888-0NIL",    phone: "888-678-0645", category: "NIL",    vertical: "need",   tier: "premium", geo: "National", desc: "NIL athlete compliance and payment routing." },
  { vanity: "888-0LAW",    phone: "888-649-0529", category: "Law",    vertical: "law",    tier: "premium", geo: "National", desc: "Legal intake overflow. Perfect billboard pair with 888-LAW-AI." },
  // Toll-Free
  { vanity: "844-CLAIM",   phone: "844-725-2460", category: "Claims", vertical: "claims", tier: "tollfree", geo: "National", desc: "Insurance claim filing, dispute guidance, adjuster prep." },
  { vanity: "855-AUTO",    phone: "855-771-2886", category: "Auto",   vertical: "claims", tier: "tollfree", geo: "National", desc: "Auto incident intake, accident triage, insurance guidance." },
  { vanity: "833-LAW-AI",  phone: "833-445-2924", category: "Law",    vertical: "law",    tier: "tollfree", geo: "National", desc: "Legal intake overflow. National toll-free." },
  { vanity: "888-LIVE-AI", phone: "888-855-0209", category: "Demo",   vertical: "need",   tier: "tollfree", geo: "National", desc: "🟢 LIVE RIGHT NOW — Call it and hear the AI. Available for exclusive licensing." },
  // Local
  { vanity: "909-ROOF",    phone: "909-488-7663", category: "Roofing", vertical: "hail",  tier: "local",   geo: "California", desc: "Roofing lead intake for Southern California market." },
  { vanity: "539-ROOF",    phone: "539-476-7663", category: "Roofing", vertical: "hail",  tier: "local",   geo: "Oklahoma/Central", desc: "Roofing AI intake for Central US market." },
  { vanity: "321-VIP",     phone: "321-485-8333", category: "Concierge", vertical: "need", tier: "local",  geo: "Florida", desc: "Premium concierge intake. Ends in -3333. Maximum recall." },
  { vanity: "321-LOCAL-FL",phone: "321-559-0559", category: "General", vertical: "need",  tier: "local",   geo: "Florida", desc: "Florida local intake number." },
  { vanity: "478-LOCAL-GA",phone: "478-242-4246", category: "General", vertical: "need",  tier: "local",   geo: "Georgia", desc: "Georgia local intake number." },
];

const TIERS = [
  { id: "local",    label: "Local",       price: 297,  period: "mo", desc: "Local market vanity number with full AI intake." },
  { id: "tollfree", label: "Toll-Free",   price: 497,  period: "mo", desc: "National toll-free number, vertical AI persona." },
  { id: "premium",  label: "Premium 888", price: 997,  period: "mo", desc: "888 only. Gold standard. Max trust & recall." },
];

const VERTICALS = [
  { id: "all",    label: "All" },
  { id: "law",    label: "⚖️ Law" },
  { id: "claims", label: "🧾 Claims" },
  { id: "hail",   label: "🌨️ Hail / Roof" },
  { id: "money",  label: "💰 Money" },
  { id: "need",   label: "🟣 NEED" },
];

export default function SalesPage() {
  const [activeVertical, setActiveVertical] = useState("all");
  const [activeTier, setActiveTier] = useState("all");

  const filtered = ALL_NUMBERS.filter((n) => {
    const vMatch = activeVertical === "all" || n.vertical === activeVertical;
    const tMatch = activeTier === "all" || n.tier === activeTier;
    return vMatch && tMatch;
  });

  const tierBadge = (tier: string) => {
    if (tier === "premium")  return "bg-yellow-900/40 text-yellow-300 border border-yellow-500/30";
    if (tier === "tollfree") return "bg-purple-900/40 text-purple-300 border border-purple-500/30";
    return "bg-blue-900/40 text-blue-300 border border-blue-500/30";
  };
  const tierLabel = (tier: string) => {
    if (tier === "premium")  return "⭐ 888 Premium";
    if (tier === "tollfree") return "📞 Toll-Free";
    return "📍 Local";
  };
  const tierPrice = (tier: string) => TIERS.find((t) => t.id === tier)?.price ?? 497;

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">NEED AI</Link>
          <Link href="/sales" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">
            Get a Number →
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-6 text-center bg-gradient-to-b from-purple-950/20 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 rounded-full px-4 py-1.5 text-purple-300 text-xs font-mono uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            45+ Vanity Numbers Available
          </div>
          <h1 className="text-5xl font-black mb-4">License a Number.<br /><span className="text-purple-400">Start Taking Calls Tomorrow.</span></h1>
          <p className="text-gray-400 text-lg mb-6">Every number includes fully-configured AI intake, 24/7 coverage, and a monthly call report. No setup fees. No contracts.</p>
          <a href="tel:+18888550209" className="inline-flex items-center gap-2 text-emerald-400 border border-emerald-500/30 bg-emerald-900/20 rounded-full px-5 py-2 text-sm font-mono hover:bg-emerald-900/40 transition">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Or call 888-855-0209 to talk to our AI right now
          </a>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="py-12 px-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {TIERS.map(({ id, label, price, desc }) => (
              <button
                key={id}
                onClick={() => setActiveTier(activeTier === id ? "all" : id)}
                className={`text-left p-6 rounded-2xl border transition ${activeTier === id ? "border-purple-500 bg-purple-900/30 ring-2 ring-purple-500/30" : "border-white/10 bg-white/5 hover:border-purple-500/40"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-bold text-lg">{label}</div>
                  {activeTier === id && <span className="text-xs bg-purple-600 rounded-full px-2 py-0.5">Selected</span>}
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-black">${price}</span>
                  <span className="text-gray-400 text-sm mb-0.5">/mo</span>
                </div>
                <p className="text-gray-400 text-sm">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Vertical filter */}
          <div className="flex flex-wrap gap-3 mb-10">
            {VERTICALS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveVertical(id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeVertical === id ? "bg-purple-600 text-white" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((n) => (
              <div key={n.phone} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xl font-black font-mono text-white">{n.vanity}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{n.phone}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ml-2 ${tierBadge(n.tier)}`}>
                    {tierLabel(n.tier)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  📍 {n.geo} · {n.category}
                </div>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">{n.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">${tierPrice(n.tier)}<span className="text-gray-500 text-xs font-normal">/mo</span></span>
                  <a
                    href={`/checkout?number=${encodeURIComponent(n.phone)}&vanity=${encodeURIComponent(n.vanity)}&tier=${n.tier}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
                  >
                    License Now →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-600">
              No numbers match those filters. <button onClick={() => { setActiveVertical("all"); setActiveTier("all"); }} className="text-purple-400 hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 border-t border-white/10 text-center bg-white/[0.02]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-4">Don't see exactly what you need?</h2>
          <p className="text-gray-400 mb-8">We have 45+ numbers across 7 verticals. If the perfect number isn't listed here, call us — we'll find it.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+18888550209" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">
              📞 Call 888-855-0209
            </a>
            <Link href="/" className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-semibold transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
