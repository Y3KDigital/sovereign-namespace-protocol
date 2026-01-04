import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Whitepaper | Docs | Y3K Markets",
  description: "Canonical long-form documents and briefings for investors, auditors, and implementers.",
  alternates: { canonical: "/docs/whitepaper/" },
  openGraph: {
    title: "Whitepaper | Docs | Y3K Markets",
    description: "Canonical long-form documents and briefings for investors, auditors, and implementers.",
  },
};

export default function WhitepaperPage() {
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
        <h1 className="text-5xl font-bold mb-4 gradient-text">Whitepaper</h1>
        <p className="text-gray-400 text-lg mb-8">
          This page links to canonical long-form documents for investors, auditors, and implementers.
        </p>

        <section className="bg-white/5 border border-white/10 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-3">Recommended reading</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs/canonical/readme"
              className="px-5 py-3 bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-lg transition"
            >
              README
            </Link>
            <Link
              href="/docs/canonical/executive-briefing"
              className="px-5 py-3 bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-lg transition"
            >
              Executive Briefing
            </Link>
            <Link
              href="/docs/canonical/spec-index"
              className="px-5 py-3 bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-lg transition"
            >
              Spec Index
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            If you need a single PDF-style artifact for investors/auditors, we can generate one from the frozen specs.
          </p>
        </section>
      </div>
    </main>
  );
}
