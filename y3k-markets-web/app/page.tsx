import Link from "next/link";
import { RarityShowcase } from "@/components/RarityShowcase";
import { LiveCounter } from "@/components/LiveCounter";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/explore" className="text-gray-300 hover:text-white transition">
                Explore
              </Link>
              <Link href="/create" className="text-gray-300 hover:text-white transition">
                Create
              </Link>
              <Link href="/docs" className="text-gray-300 hover:text-white transition">
                Docs
              </Link>
              <Link href="/trust" className="text-gray-300 hover:text-white transition">
                Trust
              </Link>
              <Link href="/docs/game-time" className="text-gray-300 hover:text-white transition">
                Game Time
              </Link>
              <Link href="/status" className="text-gray-300 hover:text-white transition">
                Status
              </Link>
              <Link 
                href="/create"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Live Counter */}
      <LiveCounter />

      {/* Rarity Tiers Showcase */}
      <RarityShowcase />

      {/* How It Works */}
      <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold mb-3">Cryptographic Uniqueness</h3>
              <p className="text-gray-400">
                Every namespace is generated and bound under SNP's cryptographic profile (post-quantum signatures via
                NIST-standard ML-DSA/Dilithium and modern hashing). Once created, duplicates are cryptographically
                infeasible—and verification can be performed offline.
              </p>
            </div>
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">Provable Rarity</h3>
              <p className="text-gray-400">
                Rarity scores are calculated from cryptographic properties—hash entropy, 
                byte patterns, and structural complexity. No subjective traits.
              </p>
            </div>
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold mb-3">Sovereign Ownership</h3>
              <p className="text-gray-400">
                You control your keys, you control your namespace. Offline-capable, 
                air-gapped security. No third-party custody.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Y3K Markets */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why <span className="gradient-text">Y3K Markets</span>?
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="text-xl font-bold mb-2">True Scarcity</h3>
                <p className="text-gray-400">
                  Traditional NFTs rely on creator promises. Y3K namespaces are cryptographically unique—
                  duplication is cryptographically infeasible.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Post-Quantum Ready</h3>
                <p className="text-gray-400">
                  Most blockchains use ECDSA signatures vulnerable to quantum computers. 
                  SNP is designed around NIST-standard post-quantum signatures (ML-DSA/Dilithium) to support long-term
                  verification as cryptography evolves.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Sovereign Control</h3>
                <p className="text-gray-400">
                  Your keys live on YOUR device. All operations work offline. 
                  No cloud dependencies, no custody risks.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Transparent Rarity</h3>
                <p className="text-gray-400">
                  Rarity is calculated from cryptographic properties, not subjective traits. 
                  View the exact algorithm—no hidden formulas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to own <span className="gradient-text">true rarity</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Generate your cryptographically unique namespace in seconds
          </p>
          <Link
            href="/create"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-12 py-4 rounded-xl transition transform hover:scale-105"
          >
            Generate Your Namespace
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Y3K Markets</h3>
              <p className="text-gray-400 text-sm">
                True Web3 Rarity. Cryptographically guaranteed uniqueness.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/explore" className="block hover:text-white transition">Explore</Link>
                <Link href="/create" className="block hover:text-white transition">Create</Link>
                <Link href="/docs" className="block hover:text-white transition">Documentation</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/docs/security" className="block hover:text-white transition">Security</Link>
                <Link href="/docs/whitepaper" className="block hover:text-white transition">Whitepaper</Link>
                <Link href="/docs/canonical/readme" className="block hover:text-white transition">Canonical Docs</Link>
                <Link href="/trust" className="block hover:text-white transition">Trust Center</Link>
                <Link href="/status" className="block hover:text-white transition">System Status</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/about" className="block hover:text-white transition">About</Link>
                <Link href="/contact" className="block hover:text-white transition">Contact</Link>
                <a href="https://twitter.com/y3kdigital" className="block hover:text-white transition" target="_blank" rel="noopener noreferrer">Twitter</a>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400 pt-8 border-t border-white/10">
            © 2026 Y3K Digital. Built on Sovereign Namespace Protocol (SNP).
          </div>
        </div>
      </footer>
    </main>
  );
}
