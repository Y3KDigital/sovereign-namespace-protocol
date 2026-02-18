"use client";
import Link from "next/link";

const ECOSYSTEM_LAYERS = [
  {
    layer: "Layer 0",
    title: "Crown Roots",
    subtitle: "a–z · 0–9 · 00–99",
    desc: "174 sovereign roots. The entire alphabet. Every digit. Every two-digit number. Locked at genesis — never sold, never auctioned.",
    color: "from-yellow-500 to-orange-500",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    icon: "👑",
  },
  {
    layer: "Layer 1",
    title: "Economic Roots",
    subtitle: ".law · .bank · .pay · .ai · .number · .trust",
    desc: "Core semantic infrastructure for finance, legal, identity, and AI. Protocol-controlled. Subdomain delegation by governance only.",
    color: "from-blue-500 to-blue-600",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    icon: "🏛️",
  },
  {
    layer: "Layer 2",
    title: "Live TLDs on Polygon",
    subtitle: ".nil · .law · .legal · .bot · .ai.$ · .grid · .chain",
    desc: "107+ TLDs minted on Polygon Mainnet. Real NFTs. Real on-chain ownership. Subnames like burnzy.888 are live today.",
    color: "from-purple-500 to-purple-600",
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    icon: "⛓️",
  },
  {
    layer: "Layer 3",
    title: "Genesis Number Roots",
    subtitle: "100 · 101 · 102 … 999",
    desc: "900 three-digit number roots. Cold storage, Ed25519 keys, IPFS-locked certificates. $29 each. Created once on January 16, 2026.",
    color: "from-emerald-500 to-green-500",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    icon: "🔢",
  },
  {
    layer: "Layer 4",
    title: "Phone Number Infrastructure",
    subtitle: "888 · 833 · 844 · 855",
    desc: "Toll-free number roots mapped to sovereign namespaces. AI agents answer. Calls route to legal, claims, financial, and storm verticals.",
    color: "from-rose-500 to-pink-500",
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
    icon: "📞",
  },
];

const DEMO_STEPS = [
  {
    step: "01",
    action: "Call 888-855-0209",
    what: "You reach the Y3K sovereign infrastructure live demo line",
    result: "AI agent answers, confirms your call is being handled by a namespace-routed sovereign endpoint",
  },
  {
    step: "02",
    action: "Say your name",
    what: "The system maps your name to available namespace roots",
    result: "yourname.888 · yourname.law · yourname.number — all shown in real time",
  },
  {
    step: "03",
    action: "Get your root",
    what: "Choose a 3-digit Genesis Root (100–999) for $29",
    result: "Cold storage wallet generated in browser. Keys are yours. No custody. No renewal.",
  },
  {
    step: "04",
    action: "Build your stack",
    what: "Create unlimited subdomains under your root",
    result: "wallet.YOUR-ROOT · vault.YOUR-ROOT · id.YOUR-ROOT — all yours forever",
  },
];

const CONTENT_HOOKS = [
  {
    platform: "TikTok / Reels",
    hook: '"I own the letter A on the internet"',
    angle: "Visual: type .a in browser → show the sovereign ownership certificate → 3M views waiting",
    cta: "Call 888-855-0209 to see what you can own",
  },
  {
    platform: "Twitter / X",
    hook: '"We own every number from 0 to 99. Here\'s why that matters."',
    angle: "Thread: explain namespace roots → Crown Roots → phone routing → $29 entry point",
    cta: "y3kmarkets.com/demo",
  },
  {
    platform: "YouTube Shorts",
    hook: '"Call this number and watch what happens"',
    angle: "Screen record: call 888-855-0209 → AI answers → namespace demo plays out live",
    cta: "Get your own root for $29",
  },
  {
    platform: "Reddit / HN",
    hook: '"We built a post-quantum namespace protocol with 955 fixed roots. AMA."',
    angle: "Technical deep-dive: Dilithium5 signatures, no ECDSA, no admin keys, constitutional law",
    cta: "github.com/Y3KDigital/sovereign-namespace-protocol",
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/95 backdrop-blur-md border-b border-blue-500/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-white">Y3K</span>
            <span className="text-blue-400 ml-2 text-sm font-normal">Digital Property</span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="tel:+18888550209"
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              📞 Call Live Demo
            </a>
            <Link
              href="/mint"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
            >
              Get Your Root
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-400 text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            Live Infrastructure · Call Now
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            The Whole Stack.
            <span className="block mt-3 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              One Phone Number.
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            888-855-0209 is not just a phone number. It's a live demonstration of sovereign 
            digital infrastructure — namespace routing, AI agents, and cryptographic ownership, 
            working together in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="tel:+18888550209"
              className="flex items-center gap-3 bg-emerald-600 text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-900/50 w-full sm:w-auto justify-center"
            >
              <span className="text-2xl">📞</span>
              Call 888-855-0209
            </a>
            <Link
              href="/mint"
              className="flex items-center gap-3 border border-blue-500/50 text-blue-400 px-10 py-5 rounded-xl text-xl font-bold hover:bg-blue-500/10 transition-all w-full sm:w-auto justify-center"
            >
              Get Your Root — $29
            </Link>
          </div>
          <p className="text-sm text-slate-500">Toll-free · AI-answered · Live 24/7</p>
        </div>
      </section>

      {/* How the Demo Works */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">How the Demo Works</h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Four steps from first call to sovereign ownership.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {DEMO_STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-8 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-blue-500/30">{item.step}</span>
                  <h3 className="text-xl font-bold text-white">{item.action}</h3>
                </div>
                <p className="text-slate-400 text-sm">{item.what}</p>
                <div className="bg-slate-800 rounded-lg p-3 border-l-2 border-emerald-500">
                  <p className="text-emerald-400 text-sm font-medium">→ {item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Full Ecosystem */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">The Full Stack</h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Five layers of sovereign digital infrastructure. All interconnected. All permanent.
          </p>
          <div className="space-y-4">
            {ECOSYSTEM_LAYERS.map((layer) => (
              <div
                key={layer.layer}
                className={`${layer.bg} border ${layer.border} rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6`}
              >
                <div className="flex items-center gap-4 md:w-64 shrink-0">
                  <span className="text-3xl">{layer.icon}</span>
                  <div>
                    <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">{layer.layer}</div>
                    <div className="text-lg font-bold text-white">{layer.title}</div>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className={`text-sm font-mono bg-gradient-to-r ${layer.color} bg-clip-text text-transparent font-semibold`}>
                    {layer.subtitle}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Strategy / Go Viral */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Built for the Algorithm</h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Every platform has a different hook. Same infrastructure. Different angle.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {CONTENT_HOOKS.map((item) => (
              <div
                key={item.platform}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4"
              >
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">{item.platform}</div>
                <blockquote className="text-white font-bold text-lg">{item.hook}</blockquote>
                <p className="text-slate-400 text-sm">{item.angle}</p>
                <div className="bg-slate-800 rounded-lg px-4 py-2 text-blue-400 text-sm font-mono">
                  {item.cta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crown Root Ownership Statement */}
      <section className="py-20 px-6 border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="text-6xl">👑</div>
          <h2 className="text-4xl font-bold text-white">
            174 Crown Roots. Locked Forever.
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-2xl mx-auto">
            {"abcdefghijklmnopqrstuvwxyz".split("").map((l) => (
              <div key={l} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg py-3 text-center text-yellow-400 font-bold text-lg font-mono">
                .{l}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-w-2xl mx-auto">
            {"0123456789".split("").map((n) => (
              <div key={n} className="bg-orange-500/10 border border-orange-500/20 rounded-lg py-3 text-center text-orange-400 font-bold text-lg font-mono">
                .{n}
              </div>
            ))}
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Plus all 100 two-digit roots (.00–.99), 10 alpha primitives (ai, id, io, ip, vm, os, tx, db, zk, pq), 
            and 28 economic and protocol roots. <span className="text-white">The entire primitive namespace layer.</span>
          </p>
          <p className="text-slate-500 text-sm">
            Sovereignty class: ProtocolReserved · Transfer: NEVER · Policy: ROOTS_ONLY_NEVER_SOLD
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold text-white">
            Start with <span className="text-emerald-400">$29.</span>
          </h2>
          <p className="text-xl text-slate-300">
            One Genesis Root. Cold storage wallet. Unlimited subdomains. Permanent ownership.
            <span className="block mt-2 text-white font-semibold">No renewals. No custody. No intermediaries.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/mint"
              className="bg-blue-600 text-white px-12 py-5 rounded-xl text-xl font-semibold hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/50 w-full sm:w-auto text-center"
            >
              Get Your Genesis Root
            </Link>
            <a
              href="tel:+18888550209"
              className="border border-emerald-500/50 text-emerald-400 px-12 py-5 rounded-xl text-xl font-semibold hover:bg-emerald-500/10 transition-all w-full sm:w-auto text-center"
            >
              📞 Call First
            </a>
          </div>
          <p className="text-sm text-slate-500">BTC · ETH · USDC · USDT · 900 total supply · 1 per buyer</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          <p>© 2026 Y3K Digital Property · Not investment advice · Digital infrastructure only</p>
          <p className="mt-2">
            <Link href="/" className="hover:text-blue-400 transition">Home</Link>
            {" · "}
            <Link href="/mint" className="hover:text-blue-400 transition">Mint</Link>
            {" · "}
            <a href="https://github.com/Y3KDigital" className="hover:text-blue-400 transition">GitHub</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
