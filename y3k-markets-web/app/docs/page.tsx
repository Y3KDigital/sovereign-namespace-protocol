import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Docs | Sovereign Namespace Protocol (SNP) | Y3K Markets",
  description: "Technical documentation and frozen specifications for the Sovereign Namespace Protocol (SNP).",
  alternates: { canonical: "/docs/" },
  openGraph: {
    title: "Docs | Sovereign Namespace Protocol (SNP) | Y3K Markets",
    description: "Technical documentation and frozen specifications for the Sovereign Namespace Protocol (SNP).",
  },
};

export default function DocsPage() {
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
              <Link href="/practice" className="hover:text-purple-400 transition">
                Practice
              </Link>
              <Link href="/explore" className="hover:text-purple-400 transition">
                Explore
              </Link>
              <Link href="/docs" className="text-purple-400">
                Docs
              </Link>
                <Link href="/trust" className="hover:text-purple-400 transition">
                  Trust
                </Link>
                <Link href="/status" className="hover:text-purple-400 transition">
                  Status
                </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Protocol Documentation</h1>
        <p className="text-gray-400 text-lg mb-12">
          Technical specifications for the Sovereign Namespace Protocol (SNP)
        </p>

        <div className="space-y-8">
          {/* Genesis Notice */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⏳</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Pre-Genesis Protocol State</h3>
                <p className="text-gray-300 mb-3">
                  The Sovereign Namespace Protocol is currently in pre-Genesis state. 
                  The Genesis ceremony will occur at <strong className="text-white">2026-01-15 00:00:00 UTC</strong>, 
                  after which all protocol rules become permanently frozen and no namespaces can be recreated.
                </p>
              </div>
            </div>
          </div>

          {/* What This Is */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">What This Is</h2>
            <p className="text-gray-300 mb-4">
              SNP defines a <strong className="text-white">non-recreatable, post-quantum, sovereign namespace system</strong> where:
            </p>
            <ul className="space-y-2 text-gray-300 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Each namespace is a <strong className="text-white">cryptographic asset</strong>, not a label</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong className="text-white">Single genesis</strong> ensures namespaces can never be recreated on any other network</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong className="text-white">No admin keys</strong> exist post-genesis (provably destroyed)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong className="text-white">No governance</strong> can change the rules (immutable protocol law)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong className="text-white">Post-quantum cryptography</strong> (Dilithium5) ensures long-term security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong className="text-white">Stateless verification</strong> works even if the chain dies</span>
              </li>
            </ul>
            <p className="text-gray-400 mt-4 text-sm">
              This is <strong>not</strong> a domain system, identity service, or wallet protocol.
              This is a <strong className="text-white">permanent trust primitive</strong> and <strong className="text-white">digital scarcity substrate</strong>.
            </p>
          </section>

          {/* Core Specifications */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Core Specifications</h2>
            <p className="text-gray-400 text-sm mb-6">
              Tip: click any spec card to open the canonical (frozen) document.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <SpecCard
                title="Constitution"
                description="Immutable protocol rules and governance framework"
                status="frozen"
                href="/docs/canonical/specs/constitution"
              />
              <SpecCard
                title="Genesis Specification"
                description="Single-use ceremony for namespace derivation"
                status="frozen"
                href="/docs/canonical/specs/genesis-spec"
              />
              <SpecCard
                title="Namespace Object"
                description="Core cryptographic identity primitive"
                status="frozen"
                href="/docs/canonical/specs/namespace-object"
              />
              <SpecCard
                title="Rarity System"
                description="Six-tier deterministic scarcity model"
                status="frozen"
                href="/docs/canonical/specs/rarity-spec"
              />
              <SpecCard
                title="Crypto Profile"
                description="Post-quantum signature and hashing algorithms"
                status="frozen"
                href="/docs/canonical/specs/crypto-profile"
              />
              <SpecCard
                title="Stateless Verifier"
                description="Offline certificate verification without chain access"
                status="frozen"
                href="/docs/canonical/specs/stateless-verifier"
              />
              <SpecCard
                title="Sovereignty Classes"
                description="Transfer, delegation, inheritance, and sealing rules"
                status="frozen"
                href="/docs/canonical/specs/sovereignty-classes"
              />
              <SpecCard
                title="Policy Engine"
                description="Deterministic, machine-readable governance evaluation"
                status="frozen"
                href="/docs/canonical/specs/policy-spec"
              />
              <SpecCard
                title="Vault Model"
                description="Secure key storage and recovery mechanisms"
                status="frozen"
                href="/docs/canonical/specs/vault-model"
              />
            </div>
          </section>

          {/* Implementation Status */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Implementation Status</h2>
            
            <div className="space-y-4">
              <StatusSection
                title="✅ Constitutional Layer Complete"
                items={[
                  "Genesis ceremony implementation",
                  "Core objects (Namespace, Identity, Certificate, Vault)",
                  "Sovereignty transitions with signature verification",
                  "Security documentation and threat model",
                  "Policy engine v1.0"
                ]}
              />
              
              <StatusSection
                title="🏗️ In Progress"
                items={[
                  "Test coverage improvements (target: 80%+)",
                  "Property testing for determinism verification",
                  "Integration test suite expansion"
                ]}
              />
              
              <StatusSection
                title="📋 Planned"
                items={[
                  "Chain anchoring and replication protocol",
                  "Smart contract integration backends",
                  "Production deployment configuration",
                  "Public audit and certification"
                ]}
              />
            </div>
          </section>

          {/* Security & Audit */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Security & Audit</h2>
            <p className="text-gray-300 mb-4">
              The protocol is designed with security-first principles:
            </p>
            <ul className="space-y-2 text-gray-300 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong className="text-white">Post-quantum cryptography</strong> using NIST-standardized Dilithium5</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong className="text-white">Admin key destruction</strong> ceremony documented and verifiable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong className="text-white">Deterministic policy engine</strong> ensures reproducible governance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong className="text-white">Stateless verification</strong> prevents chain dependency</span>
              </li>
            </ul>
            <div className="mt-6 bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                <strong>Pre-Audit Status:</strong> The protocol is ready for professional security audit. 
                No production deployment will occur until independent verification is complete.
              </p>
            </div>
          </section>

          {/* GitHub Repository */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Open Source</h2>
            <p className="text-gray-300 mb-4">
              Canonical protocol documents are published here for public review:
            </p>
            <Link
              href="/docs/canonical/readme"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View Canonical Docs
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

function SpecCard({
  title,
  description,
  status,
  href,
}: {
  title: string;
  description: string;
  status: string;
  href?: string;
}) {
  const CardInner = (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-lg">{title}</h3>
        {status === 'frozen' && (
          <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full">
            FROZEN
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );

  if (!href) return CardInner;
  return (
    <Link href={href} className="block">
      {CardInner}
    </Link>
  );
}

function StatusSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <ul className="space-y-1 ml-6">
        {items.map((item, i) => (
          <li key={i} className="text-gray-300 text-sm">• {item}</li>
        ))}
      </ul>
    </div>
  );
}
