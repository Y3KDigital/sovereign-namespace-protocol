import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Y3K Markets",
  description:
    "What Y3K Markets is building and what we believe about cryptographic scarcity, sovereignty, and immutable rules.",
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "About | Y3K Markets",
    description:
      "What Y3K Markets is building and what we believe about cryptographic scarcity, sovereignty, and immutable rules.",
  },
};

export default function AboutPage() {
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
              <Link href="/docs" className="hover:text-purple-400 transition">Docs</Link>
              <Link href="/trust" className="hover:text-purple-400 transition">Trust</Link>
              <Link href="/status" className="hover:text-purple-400 transition">Status</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">About</h1>
        <p className="text-gray-400 text-lg mb-8">
          Y3K Markets is building a marketplace for cryptographically unique namespaces where rarity is
          provable from deterministic cryptographic properties.
        </p>

        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-3">What we believe</h2>
            <ul className="space-y-2 text-gray-300 ml-6">
              <li>• Scarcity should be mathematical, not social.</li>
              <li>• Users should own keys and verify offline.</li>
              <li>• Protocol rules should be immutable after Genesis.</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-3">Open source</h2>
            <p className="text-gray-300 mb-4">
              Canonical protocol documents are published for public review.
            </p>
            <Link
              href="/docs/canonical/readme"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition"
            >
              View Canonical Docs
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
