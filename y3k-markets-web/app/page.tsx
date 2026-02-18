import Link from "next/link";

/* ─── Data ─────────────────────────────────────────────── */
const TICKER = [
  { icon: "📞", label: "888-LAW-AI" }, { icon: "⛈️", label: "786-STORM" },
  { icon: "❄️", label: "833-HVAC-AI" }, { icon: "🧾", label: "844-CLAIM" },
  { icon: "💰", label: "888-BUCK-AI" }, { icon: "🌨️", label: "414-HAIL" },
  { icon: "🟣", label: "844-NEED-AI" }, { icon: "⚖️", label: "888-LAW-CALL" },
  { icon: "🔥", label: "833-HVAC-NOW" }, { icon: "📋", label: "888-CLAIM-REP" },
  { icon: "💵", label: "888-CASH-AI" }, { icon: "🏠", label: "909-ROOF" },
  { icon: "📞", label: "888-HELP-AI" }, { icon: "🌩️", label: "470-STORM" },
  { icon: "🏦", label: "866-BANK-AI" },
];

const BILLBOARDS = [
  { word: "STORM", number: "786-STORM", coverage: "Florida • Georgia • Arizona • Oklahoma" },
  { word: "LAWYER", number: "888-LAW-AI", coverage: "National Toll-Free" },
  { word: "HVAC", number: "833-HVAC-AI", coverage: "24/7 Emergency • National" },
  { word: "HAIL", number: "414-HAIL", coverage: "Wisconsin • Midwest" },
  { word: "CLAIM", number: "844-CLAIM", coverage: "Insurance Help • National" },
  { word: "MONEY", number: "888-BUCK-AI", coverage: "Financial Services • National" },
  { word: "NEED", number: "844-NEED-AI", coverage: "Universal Help • Routes to Every Vertical" },
];

const VERTICALS = [
  {
    icon: "⛈️", name: "STORM", tag: "Property Damage",
    desc: "Storm damage assessment, emergency routing, insurance claims, contractor matching, and safety guidance.",
    numbers: [
      { n: "470-STORM", loc: "Georgia" }, { n: "727-STORM", loc: "Florida" },
      { n: "786-STORM", loc: "Florida" }, { n: "623-STORM", loc: "Arizona" },
      { n: "539-ROOF", loc: "Oklahoma" },
    ],
    slug: "storm",
  },
  {
    icon: "🌨️", name: "HAIL", tag: "Roof & Hail Damage",
    desc: "Hail damage assessment, roof inspection guidance, insurance filing, contractor matching, and restoration coordination.",
    numbers: [
      { n: "262-HAIL", loc: "Wisconsin" }, { n: "414-HAIL", loc: "Wisconsin" },
      { n: "909-ROOF", loc: "California" },
    ],
    slug: "hail",
  },
  {
    icon: "❄️🔥", name: "HVAC", tag: "Heating & Cooling",
    desc: "HVAC emergency triage, no-heat/no-AC diagnosis, service scheduling, and safety guidance for gas leaks and CO hazards.",
    numbers: [
      { n: "833-HVAC-AI", loc: "National" }, { n: "833-HVAC-CALL", loc: "National" },
      { n: "833-HVAC-NOW", loc: "National" },
    ],
    slug: "hvac",
  },
  {
    icon: "🧾", name: "CLAIMS", tag: "Insurance Claims",
    desc: "Claim filing assistance, dispute resolution, coverage analysis, adjuster negotiation, and supplemental claims.",
    numbers: [
      { n: "844-CLAIM", loc: "National" }, { n: "855-CLAIM", loc: "National" },
      { n: "877-CLAIM", loc: "National" }, { n: "888-CLAIM-REP", loc: "National" },
      { n: "888-CLAIM-CHK", loc: "National" },
    ],
    slug: "claims",
  },
  {
    icon: "⚖️", name: "LAW", tag: "Legal Services",
    desc: "Legal intake & triage, case qualification, evidence prompting, jurisdiction routing, and claims escalation.",
    numbers: [
      { n: "888-LAW-AI", loc: "National" }, { n: "833-LAW-AI", loc: "National" },
      { n: "888-LAW-CALL", loc: "National" }, { n: "888-LAW-HELP", loc: "National" },
      { n: "888-TRUST-AI", loc: "National" },
    ],
    slug: "law",
  },
  {
    icon: "💰", name: "MONEY", tag: "Financial Services",
    desc: "Payment routing, settlement verification, funding qualification, and fraud screening with full compliance.",
    numbers: [
      { n: "888-BUCK-AI", loc: "National" }, { n: "888-CASH-AI", loc: "National" },
      { n: "866-BANK-AI", loc: "National" },
    ],
    slug: "money",
  },
  {
    icon: "🟣", name: "NEED", tag: "Universal Intake",
    desc: "The universal router. One word — NEED — captures every call and dynamically routes to the highest-value vertical based on caller intent. Storm? Legal? HVAC? NEED figures it out.",
    numbers: [
      { n: "844-NEED-AI", loc: "National" }, { n: "888-HELP-AI", loc: "National" },
      { n: "888-ASSIST", loc: "National" }, { n: "888-HAIL-AI", loc: "National" },
    ],
    slug: "need",
  },
];

const FEATURED = [
  { vanity: "888-LAW-AI", type: "Toll-Free", phone: "+1 (888) 505-2924", tag: "⚖️ Legal", geo: "🇺🇸 National", slug: "law" },
  { vanity: "786-STORM", type: "Local", phone: "+1 (786) 677-8676", tag: "⛈️ Storm", geo: "📍 Florida", slug: "storm" },
  { vanity: "833-HVAC-AI", type: "Toll-Free", phone: "+1 (833) 760-4328", tag: "❄️🔥 HVAC", geo: "🇺🇸 National", slug: "hvac" },
  { vanity: "844-CLAIM", type: "Toll-Free", phone: "+1 (844) 725-2460", tag: "🧾 Claims", geo: "🇺🇸 National", slug: "claims" },
  { vanity: "888-BUCK-AI", type: "Toll-Free", phone: "+1 (888) 676-2825", tag: "💰 Finance", geo: "🇺🇸 National", slug: "money" },
  { vanity: "844-NEED-AI", type: "Toll-Free", phone: "+1 (844) 669-6333", tag: "🟣 Universal", geo: "🇺🇸 National", slug: "need" },
];

const INFRA = [
  { icon: "🤖", title: "AI-First Intake", desc: "Human-like conversational AI with emotion detection, active listening, and de-escalation. Callers don't know it's AI." },
  { icon: "🌪️", title: "Weather-Aware Routing", desc: "Real-time weather intelligence triggers dynamic routing. When storms hit, STORM numbers surge — automatically." },
  { icon: "📊", title: "Full Audit Trail", desc: "Every call, every decision, every routing change is logged with HMAC-signed audit entries. Compliance built in." },
  { icon: "⚡", title: "Zero Wait Time", desc: "No hold music. No IVR trees. No 'press 1 for...' — AI picks up on the first ring, every time, 24/7/365." },
  { icon: "🔒", title: "Sovereign Infrastructure", desc: "All operations local-first. No forced cloud dependencies. Your data stays under your control with encrypted vault storage." },
  { icon: "📋", title: "Constitutional AI", desc: "Every agent action is bound by explicit rules and policies. No hallucinations. Sources cited. Uncertainty escalated." },
];

/* ─── Component ─────────────────────────────────────────── */
export default function Home() {
  const tickerDouble = [...TICKER, ...TICKER];

  return (
    <main className="min-h-screen bg-black text-white">

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">NEED AI</span>
            <span className="hidden sm:inline text-xs text-purple-400 border border-purple-400/30 rounded-full px-2 py-0.5">AI Phone Infrastructure</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#verticals" className="hover:text-white transition">Verticals</a>
            <a href="#numbers" className="hover:text-white transition">Numbers</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#earn" className="hover:text-white transition">Earn</a>
            <a href="/sales-deck" className="hover:text-white transition">Sales Deck</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/register" className="hidden sm:inline text-sm text-gray-400 hover:text-white transition">Sales Registration →</a>
            <Link href="/sales" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">
              Get a Number →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 rounded-full px-4 py-1.5 text-purple-300 text-xs font-mono uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            🟣 AI-Powered Phone Infrastructure
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none mb-4">
            Own the Word.<br />
            <span className="text-purple-400">Own the Call.</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            License vanity phone numbers that are permanently bound to AI intake systems.
            Put them on billboards. They answer themselves. 24/7. No wait times. Every call captured.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/sales" className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-xl transition shadow-2xl shadow-purple-900/50">
              Browse All Numbers →
            </Link>
            <a href="#billboards" className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white text-lg font-bold rounded-xl transition">
              See Billboards
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
            {[
              { n: "45+", l: "Vanity Numbers" },
              { n: "7", l: "AI Verticals" },
              { n: "24/7", l: "Always On" },
              { n: "0s", l: "Wait Time" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-4xl font-black text-white">{n}</div>
                <div className="text-sm text-gray-500 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden relative">
          <div className="flex gap-6 animate-[ticker_30s_linear_infinite] whitespace-nowrap w-max">
            {tickerDouble.map(({ icon, label }, i) => (
              <span key={i} className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 border border-white/10 rounded-full px-4 py-2 shrink-0">
                <span>{icon}</span> <span className="font-mono font-bold text-white">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO CALLOUT ────────────────────────────── */}
      <section className="py-10 px-6 bg-gradient-to-r from-emerald-950 via-black to-emerald-950 border-y border-emerald-500/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 text-emerald-400 text-xs font-mono uppercase mb-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live · AI-Answered · 24/7
            </div>
            <h2 className="text-2xl font-bold text-white">Hear It Now. <span className="text-emerald-400">It's live.</span></h2>
            <p className="text-gray-400 text-sm mt-1">Call <span className="text-white font-bold font-mono">888-855-0209</span> — AI answers instantly. Real infrastructure. Not a demo recording.</p>
          </div>
          <a href="tel:+18888550209" className="shrink-0 flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl shadow-emerald-900/50">
            📞 888-855-0209
          </a>
        </div>
      </section>

      {/* ── BILLBOARDS ──────────────────────────────────── */}
      <section id="billboards" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-yellow-400 font-mono uppercase tracking-widest mb-3">🎯 Billboard Ready</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">One Word. One Number.<br /><span className="text-gray-400">Millions of Eyes.</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our numbers follow billboard design rules: the word takes 70% of the board. No logos. No URLs. Just a word and a number people remember at 70 mph.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {BILLBOARDS.map(({ word, number, coverage }) => (
              <div key={number} className="bg-white rounded-xl overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="bg-black p-6 flex flex-col items-center justify-center min-h-[140px] relative">
                  <div className="text-4xl font-black text-white tracking-tight text-center leading-none mb-3">{word}</div>
                  <div className="text-yellow-400 font-mono font-bold text-lg">{number}</div>
                </div>
                <div className="bg-white p-3 text-center">
                  <div className="text-black text-xs font-medium">{coverage}</div>
                </div>
              </div>
            ))}
            <div className="bg-purple-900/30 border-2 border-purple-500/40 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[180px] p-6 hover:border-purple-400 transition cursor-pointer group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition">➕</div>
              <div className="text-purple-300 font-bold text-center">Your Number Here</div>
              <Link href="/sales" className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">License Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-3">⚡ Simple as 1-2-3</div>
            <h2 className="text-4xl font-black mb-3">How It Works</h2>
            <p className="text-gray-400">From billboard to closed deal — fully automated, fully auditable.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "1", title: "Pick a Number", desc: "Choose from 45+ vanity numbers across 7 verticals. Each number is permanently bound to an AI persona that knows its category." },
              { n: "2", title: "Put It on a Billboard", desc: "Slap it on a billboard, truck wrap, yard sign, or digital ad. One word. One number. That's it. People remember it at highway speed." },
              { n: "3", title: "AI Answers Every Call", desc: "Our AI picks up instantly — no hold music, no IVR maze. It qualifies the caller, captures intake data, and routes to the right team. 24/7/365." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="relative p-8 bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-6xl font-black text-white/10 absolute top-4 right-6 leading-none">{n}</div>
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg font-black mb-4">{n}</div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VERTICALS ───────────────────────────────────── */}
      <section id="verticals" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-orange-400 font-mono uppercase tracking-widest mb-3">🎯 7 Verticals</div>
            <h2 className="text-4xl font-black mb-3">A Number for Every Emergency</h2>
            <p className="text-gray-400">Each vertical has its own AI persona, intake flow, and escalation logic. Domain-specific. Always ready.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {VERTICALS.map((v) => (
              <div key={v.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition group">
                <div className="text-3xl mb-3">{v.icon}</div>
                <div className="font-black text-xl mb-1">{v.name}</div>
                <div className="text-xs text-purple-400 mb-3 font-semibold uppercase tracking-wide">{v.tag}</div>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">{v.desc}</p>
                <div className="space-y-1.5 mb-4">
                  {v.numbers.map(({ n, loc }) => (
                    <div key={n} className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-white">{n}</span>
                      <span className="text-gray-500">{loc}</span>
                    </div>
                  ))}
                </div>
                <Link href="/sales" className="text-xs text-purple-400 hover:text-purple-300 underline group-hover:text-purple-300 transition">
                  View {v.name} Numbers →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INFRASTRUCTURE ──────────────────────────────── */}
      <section className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-green-400 font-mono uppercase tracking-widest mb-3">🛡️ Built Different</div>
            <h2 className="text-4xl font-black mb-3">Enterprise-Grade AI Infrastructure</h2>
            <p className="text-gray-400">Every number is backed by institutional-grade technology. No shortcuts.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INFRA.map(({ icon, title, desc }) => (
              <div key={title} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED NUMBERS ────────────────────────────── */}
      <section id="numbers" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-yellow-400 font-mono uppercase tracking-widest mb-3">⭐ Premium Numbers</div>
            <h2 className="text-4xl font-black mb-3">Featured Numbers</h2>
            <p className="text-gray-400">Our most in-demand vanity numbers. Billboard-proven, AI-powered, ready to deploy.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED.map((f) => (
              <div key={f.vanity} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-2xl font-black font-mono text-white">{f.vanity}</div>
                    <div className="text-xs text-gray-500 mt-1">{f.phone}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${f.type === 'Toll-Free' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'bg-blue-900/40 text-blue-300 border border-blue-500/30'}`}>
                    {f.type}
                  </span>
                </div>
                <div className="flex gap-2 mb-5">
                  <span className="text-xs bg-white/10 rounded-full px-3 py-1">{f.tag}</span>
                  <span className="text-xs bg-white/10 rounded-full px-3 py-1">{f.geo}</span>
                </div>
                <Link href="/sales" className="block w-full text-center py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition">
                  License This Number →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/sales" className="inline-block px-10 py-4 border border-white/20 hover:border-purple-500/50 rounded-xl text-gray-300 hover:text-white transition font-semibold">
              View All 45+ Numbers →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs text-purple-400 font-mono uppercase tracking-widest mb-3">💳 Simple Licensing</div>
            <h2 className="text-4xl font-black mb-3">Ready to Own the Call?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">License a vanity number today. Put it on a billboard tomorrow. AI starts answering immediately. No setup. No training. No wait.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: "Local Market", price: "$297", period: "/mo",
                desc: "One local vanity number with full AI intake + routing. Perfect for regional service businesses.",
                features: ["1 Local vanity number", "AI intake + lead capture", "SMS confirmation to caller", "Monthly call report", "Cancel anytime"],
                cta: "Get a Local Number", highlight: false,
              },
              {
                name: "Toll-Free Pro", price: "$497", period: "/mo",
                desc: "National toll-free number AI-powered for your vertical. No geographic limits.",
                features: ["1 Toll-free number (800/833/844/855/866/877/888)", "Vertical-specific AI persona", "CRM webhook + Zapier", "Real-time call dashboard", "Priority support"],
                cta: "Get a Toll-Free Number", highlight: true,
              },
              {
                name: "Premium 888", price: "$997", period: "/mo",
                desc: "888 numbers only. The gold standard in toll-free. Maximum recall, maximum trust.",
                features: ["1 Premium 888 number", "Custom AI persona & script", "Multi-vertical routing", "White-glove onboarding", "Dedicated account manager"],
                cta: "Get an 888 Number", highlight: false,
              },
            ].map(({ name, price, period, desc, features, cta, highlight }) => (
              <div key={name} className={`rounded-2xl p-8 border ${highlight ? 'bg-purple-900/30 border-purple-500/50 ring-2 ring-purple-500/30 relative' : 'bg-white/5 border-white/10'}`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
                )}
                <div className="mb-6">
                  <div className="text-lg font-bold mb-1">{name}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">{price}</span>
                    <span className="text-gray-400 text-sm mb-1">{period}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">{desc}</p>
                </div>
                <ul className="space-y-2 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sales" className={`block w-full text-center py-3 rounded-xl font-bold transition ${highlight ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600">All plans billed monthly via Stripe. Cancel anytime. Number remains active until end of billing period.</p>
        </div>
      </section>

      {/* ── EARN / AFFILIATES ───────────────────────────── */}
      <section id="earn" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs text-green-400 font-mono uppercase tracking-widest mb-3">💵 Earn Commissions</div>
          <h2 className="text-4xl font-black mb-4">Refer a Business.<br /><span className="text-green-400">Get Paid Monthly.</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10">Every business you send that licenses a number earns you 20% recurring commission — every month, for as long as they stay active. Roofing company, law firm, HVAC contractor — they all need this.</p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { n: "$59/mo", l: "Per Local Number referral" },
              { n: "$99/mo", l: "Per Toll-Free referral" },
              { n: "$199/mo", l: "Per 888 number referral" },
            ].map(({ n, l }) => (
              <div key={l} className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
                <div className="text-3xl font-black text-green-400 mb-1">{n}</div>
                <div className="text-sm text-gray-400">{l}</div>
              </div>
            ))}
          </div>
          <Link href="/register" className="inline-block px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition">
            Become a Sales Rep →
          </Link>
        </div>
      </section>

      {/* ── LIVE DEMO ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-3">🎙️ Live AI Demos</div>
            <h2 className="text-4xl font-black mb-3">Hear It Before You Buy It</h2>
            <p className="text-gray-400">Don't take our word for it — talk to the AI yourself. Real AI. Real voice. Real-time conversation.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="font-bold text-lg mb-6 text-center">Try a Live AI Demo</h3>
            <p className="text-gray-400 text-sm text-center mb-8">Click any persona below to hear what callers experience.</p>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[
                { icon: "⚖️", label: "Legal AI", tel: "+18885052924" },
                { icon: "⛈️", label: "Storm AI", tel: "+17866778676" },
                { icon: "🧾", label: "Claims AI", tel: "+18447252460" },
                { icon: "🟣", label: "NEED Router", tel: "+18446696333" },
              ].map(({ icon, label, tel }) => (
                <a key={label} href={`tel:${tel}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-purple-900/40 border border-white/10 hover:border-purple-500/40 rounded-full font-semibold transition text-sm">
                  {icon} {label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 mb-8">
              {["🔊 Real Voice", "⚡ Instant", "🔒 Private"].map((f) => (
                <span key={f} className="bg-white/5 rounded-full px-3 py-1">{f}</span>
              ))}
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-4 max-w-lg mx-auto">
              {[
                { icon: "🤖", msg: "\"Hi, you've reached NEED AI. What do you need help with today?\"", side: "left" },
                { icon: "👤", msg: "\"My roof was damaged in last night's storm...\"", side: "right" },
                { icon: "⛈️", msg: "\"I'm connecting you to our storm damage specialist. Are you safe right now?\"", side: "left" },
              ].map(({ icon, msg, side }, i) => (
                <div key={i} className={`flex gap-3 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
                  <div className="text-2xl shrink-0">{icon}</div>
                  <div className={`text-sm text-gray-300 bg-white/5 rounded-xl p-3 max-w-xs ${side === 'right' ? 'text-right' : ''}`}>{msg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-black mb-4">Ready to Own the Call?</h2>
          <p className="text-gray-400 text-xl mb-10">License a vanity number today. Put it on a billboard tomorrow. AI starts answering immediately. No setup. No training. No wait.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sales" className="px-12 py-5 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-xl transition shadow-2xl shadow-purple-900/50">
              Browse Numbers →
            </Link>
            <a href="tel:+18446696333" className="px-12 py-5 bg-white/5 hover:bg-white/10 border border-white/20 text-white text-xl font-bold rounded-xl transition">
              📞 844-NEED-AI
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-16 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="text-xl font-black mb-2">NEED AI</div>
              <p className="text-gray-500 text-sm leading-relaxed">AI-powered vanity phone numbers for billboard advertising. Own the word. Own the call. Automate the outcome.</p>
            </div>
            <div>
              <div className="font-bold text-white mb-4">Verticals</div>
              <div className="space-y-2 text-sm text-gray-500">
                {[["⛈️ Storm","/sales"],["🌨️ Hail","/sales"],["❄️ HVAC","/sales"],["🧾 Claims","/sales"],["⚖️ Law","/sales"],["💰 Money","/sales"],["🟣 Need","/sales"]].map(([l,h]) => (
                  <div key={l as string}><Link href={h as string} className="hover:text-white transition">{l as string}</Link></div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold text-white mb-4">Numbers</div>
              <div className="space-y-2 text-sm text-gray-500">
                {[["All Numbers","/sales"],["Toll-Free","/sales"],["Local Numbers","/sales"],["Billboard Gallery","#billboards"]].map(([l,h]) => (
                  <div key={l as string}><Link href={h as string} className="hover:text-white transition">{l as string}</Link></div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold text-white mb-4">Company</div>
              <div className="space-y-2 text-sm text-gray-500">
                {[["Pricing","#pricing"],["Earn Commissions","#earn"],["Become a Sales Rep","/register"],["Get a Number","/sales"],["About","/about"]].map(([l,h]) => (
                  <div key={l as string}><a href={h as string} className="hover:text-white transition">{l as string}</a></div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">© 2026 NEED AI. All rights reserved.</p>
            <p className="text-gray-600 text-sm">AI-Powered Phone Number Infrastructure</p>
          </div>
        </div>
      </footer>

      {/* Ticker animation */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  );
}

