import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust Center | Y3K Markets",
  description:
    "Security posture, protocol immutability guarantees, and canonical documents for independent verification.",
  alternates: { canonical: "/trust/" },
  openGraph: {
    title: "Trust Center | Y3K Markets",
    description:
      "Security posture, protocol immutability guarantees, and canonical documents for independent verification.",
  },
};

function TrustCard({
  title,
  description,
  href,
  badge,
}: {
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group block bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-xl p-6 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">{title}</h3>
            {badge ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-600/20 text-purple-200 border border-purple-500/20">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="text-gray-400 mt-2">{description}</p>
        </div>
        <div className="text-gray-500 group-hover:text-purple-300 transition">→</div>
      </div>
    </Link>
  );
}

export default function TrustCenterPage() {
  return (
    <main className="min-h-screen pt-16">
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
              <Link href="/docs" className="hover:text-purple-400 transition">
                Docs
              </Link>
              <Link href="/trust" className="text-purple-400">
                Trust
              </Link>
              <Link href="/status" className="hover:text-purple-400 transition">
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Trust Center</h1>
        <p className="text-gray-400 text-lg mb-10">
          Everything here is designed for independent verification: frozen specs, audit-facing docs,
          and live operational status.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <TrustCard
            title="Canonical Documents"
            badge="Frozen"
            description="Protocol docs mirrored on-site so verification never depends on external links."
            href="/docs/canonical/readme"
          />
          <TrustCard
            title="Security Overview"
            badge="Public"
            description="Threat model, security posture, and operating assumptions."
            href="/docs/canonical/security"
          />
          <TrustCard
            title="Specification Index"
            badge="Index"
            description="Find the exact frozen spec for any subsystem (genesis, rarity, vault, verifier, etc.)."
            href="/docs/canonical/spec-index"
          />
          <TrustCard
            title="Operational Status"
            badge="Live"
            description="View real-time API reachability and service signals."
            href="/status"
          />
        </div>

        <section className="bg-white/5 border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-3">What “trust” means here</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              Y3K is built to be verified, not believed. The goal is to make the claims legible and
              checkable by third parties.
            </p>
            <ul className="space-y-2 ml-6">
              <li>• Canonical documents are published and mirrored under this domain.</li>
              <li>• Post-genesis rules are intended to be immutable (no hidden admin toggles).</li>
              <li>• Certificates are designed to be verifiable offline (stateless verification).</li>
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
            >
              Read the docs
            </Link>
            <Link
              href="/practice"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
            >
              Try practice mode
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition"
            >
              Request an audit pack
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
