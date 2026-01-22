import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What You Actually Own | Y3K Markets",
  description:
    "Y3K does not sell tokens. It allocates cryptographic identity roots that let people own names, authority, and verification without platforms.",
  alternates: { canonical: "/trust/" },
  openGraph: {
    title: "What You Actually Own | Y3K Markets",
    description:
      "Understanding True Web3: Identity, Authority, Control, and Scarcity beyond speculation.",
  },
};

export default function TrustCenterPage() {
  return (
    <main className="min-h-screen pt-16 bg-black text-gray-200">
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
              <Link href="/trust" className="text-purple-400 font-bold">
                Trust
              </Link>
              <Link href="/docs/game-time" className="hover:text-purple-400 transition">
                Game Time
              </Link>
              <Link 
                href="/mint"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-bold"
              >
                Claim Root
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white">
                What You <span className="gradient-text">Actually Own</span>
            </h1>
            <div className="p-8 bg-blue-900/10 border border-blue-500/30 rounded-2xl max-w-4xl mx-auto">
                <p className="text-2xl md:text-3xl text-blue-200 font-light leading-relaxed">
                    "Y3K does not sell tokens. It allocates cryptographic identity roots that let you own names, authority, and verification <strong className="text-white font-bold">without platforms</strong>."
                </p>
            </div>
        </div>
      </section>

      {/* The Core Distinction - 4 Pillars */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            
            {/* Identity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition duration-300">
                <div className="text-4xl mb-4">🆔</div>
                <h3 className="text-2xl font-bold text-white mb-2">Identity <span className="text-gray-500 text-lg font-normal">(Not Profiles)</span></h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                    A cryptographic root is not a username on a server. It is a <strong>root of identity</strong> that you carry across systems. Passports expire. Platforms ban users. Your cryptographic root is verifiable anywhere, forever.
                </p>
                <div className="text-sm text-purple-300 font-mono bg-purple-900/10 p-2 rounded">
                    Value: No one can delete you.
                </div>
            </div>

            {/* Authority */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition duration-300">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-2xl font-bold text-white mb-2">Authority <span className="text-gray-500 text-lg font-normal">(Not Badges)</span></h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                    Ownership in True Web3 means <strong>signing power</strong>. You check-in, authorize, and approve actions without asking central permission. Our offline-first verification puts the stamp of authority in your hands, not ours.
                </p>
                <div className="text-sm text-purple-300 font-mono bg-purple-900/10 p-2 rounded">
                    Value: Your authority outlives the platform.
                </div>
            </div>

            {/* Control */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition duration-300">
                <div className="text-4xl mb-4">🔑</div>
                <h3 className="text-2xl font-bold text-white mb-2">Control <span className="text-gray-500 text-lg font-normal">(Not Custody)</span></h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                    Most "Web3" is just a login to a new website. Y3K delivers <strong>client-side keys</strong> and air-gapped security capability. If Y3K Markets disappears tomorrow, your namespace keys still work.
                </p>
                <div className="text-sm text-purple-300 font-mono bg-purple-900/10 p-2 rounded">
                    Value: Survivability.
                </div>
            </div>

            {/* Scarcity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition duration-300">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-2xl font-bold text-white mb-2">Scarcity <span className="text-gray-500 text-lg font-normal">(Not Artificial)</span></h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                    We don't "promise" not to mint more. It is <strong>mathematically impossible</strong> to create more genesis roots. The set is closed. The keys are burned. The math is absolute.
                </p>
                <div className="text-sm text-purple-300 font-mono bg-purple-900/10 p-2 rounded">
                    Value: Scarcity enforced by math, not reputation.
                </div>
            </div>

        </div>
      </section>

      {/* Real Use Cases */}
      <section className="py-20 px-4 bg-gray-900/50 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">How Humans Use True Web3</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
                {/* Personal */}
                <div className="bg-black p-8 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Your Sovereignty</h3>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li className="flex gap-3">
                            <span className="text-red-500">❌ Web2:</span>
                            Single-sign-on (Google/Apple) tracks you.
                        </li>
                        <li className="flex gap-3">
                            <span className="text-green-400">✅ Web3:</span>
                            Sign documents, authenticate apps, and prove action with your own key.
                        </li>
                    </ul>
                </div>

                {/* Family */}
                <div className="bg-black p-8 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Family & Legacy</h3>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li className="flex gap-3">
                            <span className="text-red-500">❌ Web2:</span>
                            Digital assets die with the account owner.
                        </li>
                        <li className="flex gap-3">
                            <span className="text-green-400">✅ Web3:</span>
                            Pass namespaces to children, trusts, or estates via offline key transfer.
                        </li>
                    </ul>
                </div>

                {/* Business */}
                <div className="bg-black p-8 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Business Trust</h3>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li className="flex gap-3">
                            <span className="text-red-500">❌ Web2:</span>
                            Email hacks and domain seizures.
                        </li>
                        <li className="flex gap-3">
                            <span className="text-green-400">✅ Web3:</span>
                            Invoice signing, contract anchoring, and continuity that outlives SaaS vendors.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </section>

      {/* Immutable History */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center border border-white/10 bg-white/5 rounded-2xl p-10">
            <div className="inline-block px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-bold mb-4 border border-green-500/30">
                HISTORICAL RECORD · FROZEN
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">The Genesis Event</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                On January 17, 2026 (UTC), 955 Genesis Roots were mathematically generated, hashed, and immutably committed. 
                <br/><br/>
                No additional Genesis Roots can ever be created. Subsequent activity consists solely of allocation and sovereign activation of these pre-existing roots.
            </p>
            <div className="flex justify-center gap-4">
                <Link href="/genesis" className="text-sm font-bold text-purple-400 hover:text-white transition">
                    View Verified Ceremony Artifacts →
                </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center">
        <Link 
            href="/mint" 
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition"
        >
            <span>Start Your Sovereignty Journey</span>
            <span>→</span>
        </Link>
      </footer>

    </main>
  );
}
