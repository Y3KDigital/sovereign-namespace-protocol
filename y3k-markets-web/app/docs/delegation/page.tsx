import type { Metadata } from "next";
import Link from "next/link";
import DelegationVerifier from "./DelegationVerifier";

export const metadata: Metadata = {
  title: "Delegation & Hierarchy | Y3K Markets",
  description:
    "How to safely structure authority for your sovereign namespace using sub-keys instead of exposing your root.",
};

export default function DelegationDocsPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-black text-gray-200">
      
      {/* Navigation Overlay */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Docs
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/start" className="text-gray-400 hover:text-white transition">
                ← Back to Activation
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 border-b border-white/10 pb-8">
            <div className="inline-block px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-bold mb-4 border border-blue-500/30">
                ARCHITECTURE
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Delegation & <span className="gradient-text">Hierarchy</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
                True sovereignty means never exposing your root key. Learn how to create specific authorities for specific tasks.
            </p>
        </header>

        {/* Section 1: The Golden Rule */}
        <section className="mb-16">
            <div className="p-8 bg-red-900/10 border border-red-500/30 rounded-2xl">
                <h3 className="text-xl font-bold text-red-400 mb-2">The Golden Rule of Cold Storage</h3>
                <p className="text-lg text-white font-medium">
                    "Your Root Key lives offline. It only comes online to create Delegates."
                </p>
            </div>
        </section>

        {/* Section 2: How It Works */}
        <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-6">How Delegation Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        In Y3K, "Delegation" creates a parent-child relationship between cryptographic keys.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        A Delegate Key can sign messages and take actions, but its authority is <strong>limited by scope</strong> and can be <strong>revoked instantly</strong> by the parent.
                    </p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 font-mono text-sm">
                    <div className="text-purple-400 mb-2">// HIERARCHY EXAMPLE</div>
                    <div className="pl-4 border-l border-white/20">
                        <span className="text-white block">Root (kevan.x)</span>
                        <span className="text-gray-500 text-xs block mb-3">Offline (Vault)</span>
                        
                        <div className="pl-4 border-l border-white/20 mt-2">
                            <span className="text-blue-400 block">└── Delegate: Vote</span>
                            <span className="text-gray-500 text-xs block mb-2">Active (Browser)</span>
                        </div>

                        <div className="pl-4 border-l border-white/20 mt-2">
                             <span className="text-green-400 block">└── Delegate: Wallet</span>
                             <span className="text-gray-500 text-xs block">Hardware (Ledger)</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 3: Use Cases */}
        <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Standard Use Cases</h2>
            
            <div className="space-y-6">
                <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center text-xl border border-blue-500/30 shrink-0">
                        🗳️
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Voting & Governance</h3>
                        <p className="text-gray-400 mt-2">
                            Delegates allow you to participate in DAOs or governance without risking your entire identity. If a voting delegate is compromised, your assets and root identity remain safe.
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-full bg-green-900/20 text-green-400 flex items-center justify-center text-xl border border-green-500/30 shrink-0">
                        💬
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Communication (Chat)</h3>
                        <p className="text-gray-400 mt-2">
                            Sign messages and verify login sessions with a "hot" delegate key. This key can live in your browser or phone without the security risk of storing your root key on a connected device.
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-full bg-purple-900/20 text-purple-400 flex items-center justify-center text-xl border border-purple-500/30 shrink-0">
                        🏢
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Business Hierarchy</h3>
                        <p className="text-gray-400 mt-2">
                            A company root (`corp.x`) can delegate authority to employees (`alice.corp.x`, `finance.corp.x`). When an employee leaves, simply revoke their delegate key. The root identity never changes hands.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 4: Implementation */}
        <section className="py-12 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Technical Implementation</h2>
            <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
                <pre className="text-sm text-gray-300 overflow-x-auto">
{`{
  "type": "DELEGATION",
  "parent": "kevan.x",
  "delegate_pubkey": "ed25519:...",
  "scope": ["SIGN", "VOTE"],
  "expiry": "2027-01-01T00:00:00Z",
  "signature": "..." // Signed by kevan.x Root Key
}`}
                </pre>
            </div>
            <p className="text-gray-400 mt-4 text-sm">
                This signed JSON object is all that is required to prove delegation. It can be stored on-chain, in IPFS, or transmitted directly peer-to-peer.
            </p>
            
            {/* Phase 2B: Verifier Tool */}
            <DelegationVerifier />

        </section>

      </article>
    </main>
  );
}
