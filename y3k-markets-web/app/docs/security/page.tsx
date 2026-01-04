import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security | Docs | Y3K Markets",
  description: "Key safety and security guidance for operating and auditing the Sovereign Namespace Protocol.",
  alternates: { canonical: "/docs/security/" },
  openGraph: {
    title: "Security | Docs | Y3K Markets",
    description: "Key safety and security guidance for operating and auditing the Sovereign Namespace Protocol.",
  },
};

export default function SecurityDocsPage() {
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
        <h1 className="text-5xl font-bold mb-4 gradient-text">Security</h1>
        <p className="text-gray-400 text-lg mb-8">
          Security is a first-class requirement: key ownership, offline verification, and immutable protocol rules.
        </p>

        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-3">Key safety</h2>
            <ul className="space-y-2 text-gray-300 ml-6">
              <li>• Secret keys must never be committed to git.</li>
              <li>• Store secret keys encrypted and access-controlled.</li>
              <li>• Prefer offline / air-gapped workflows for Genesis operations.</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-3">Canonical docs</h2>
            <p className="text-gray-300 mb-4">
              Full security guidance, threat model, and operational checklists:
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs/canonical/security"
                className="px-5 py-3 bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-lg transition"
              >
                Security
              </Link>
              <Link
                href="/docs/canonical/security-verification"
                className="px-5 py-3 bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-lg transition"
              >
                Security Verification
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
