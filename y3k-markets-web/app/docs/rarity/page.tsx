import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rarity System | Docs | Y3K Markets",
  description: "High-level overview of how SNP computes deterministic rarity tiers from cryptographic properties.",
  alternates: { canonical: "/docs/rarity/" },
  openGraph: {
    title: "Rarity System | Docs | Y3K Markets",
    description: "High-level overview of how SNP computes deterministic rarity tiers from cryptographic properties.",
  },
};

export default function RarityDocsPage() {
  return (
    <main className="min-h-screen pt-16">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-8">
              <Link href="/" className="hover:text-purple-400 transition">Home</Link>
              <Link href="/practice" className="hover:text-purple-400 transition">Practice</Link>
              <Link href="/explore" className="hover:text-purple-400 transition">Explore</Link>
              <Link href="/docs" className="text-purple-400">Docs</Link>
              <Link href="/trust" className="hover:text-purple-400 transition">Trust</Link>
              <Link href="/status" className="hover:text-purple-400 transition">Status</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Rarity System</h1>
        <p className="text-gray-400 text-lg mb-8">
          Rarity tiers are determined by deterministic, cryptographic properties. No subjective traits.
        </p>

        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-3">Six tiers</h2>
            <p className="text-gray-300 mb-4">
              Namespaces are categorized into six tiers: Mythic, Legendary, Epic, Rare, Uncommon, and Common.
              Each tier maps to a score range computed from the protocol’s rarity algorithm.
            </p>
            <p className="text-gray-400 text-sm">
              This page is a human-readable overview. The canonical source is the frozen specification.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-3">How scoring works (high level)</h2>
            <ul className="space-y-2 text-gray-300 ml-6">
              <li>• Deterministic inputs (namespace id + cryptographic material)</li>
              <li>• Pattern detection (e.g., palindromes, repeats, sequences)</li>
              <li>• Entropy / distribution analysis</li>
              <li>• Weighted sum → final score → tier</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-3">Canonical specification</h2>
            <p className="text-gray-300 mb-4">
              For auditors and implementers, use the frozen spec:
            </p>
            <Link
              href="/docs/canonical/specs/rarity-spec"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition"
            >
              Read Rarity Specification
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
