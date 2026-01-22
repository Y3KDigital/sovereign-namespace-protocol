import Link from "next/link";
import type { Metadata } from "next";
import SovereignTools from "./SovereignTools";
import DelegationBuilder from "./DelegationBuilder";

export const metadata: Metadata = {
  title: "First Sovereign Action | Y3K Markets",
  description: "Initialize your sovereign authority. Verify, Sign, and Delegate.",
};

export default function StartPage() {
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
              <Link href="/trust" className="text-gray-400 hover:text-white transition">
                Trust
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs font-bold mb-6 border border-purple-500/30">
                STATUS: CLAIM COMPLETE
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Initialize <span className="gradient-text">Authority</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                You have successfully claimed a root. You are no longer a user on a platform. You are now a <strong>Sovereign Authority</strong>.
                <br/>
                Here is how you exercise that power.
            </p>
        </div>
      </section>

      {/* Action 1: The Artifacts */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-4">1. Understand Your Artifacts</h3>
                    <p className="text-gray-400 mb-6">
                        The .zip file you just downloaded contains your <strong>Private Key</strong>. 
                        This file <em>is</em> your identity. 
                    </p>
                    <ul className="space-y-4 text-sm text-gray-300">
                        <li className="flex gap-3 items-start">
                            <span className="text-red-500">⚠</span>
                            <span><strong>Do not upload it</strong> to any website (including ours).</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-red-500">⚠</span>
                            <span><strong>Do not lose it.</strong> We cannot recover it for you.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <span className="text-green-500">✓</span>
                            <span><strong>Backup immediately</strong> to a USB drive or cold storage.</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-4">Ownership = Custody</h2>
                <p className="text-lg text-gray-400">
                    If Y3K Markets held your key, we would be your master. Because you hold it, you are sovereign. This responsibility is the price of true ownership.
                </p>
            </div>
        </div>
      </section>

      {/* Action 2: Verification (INTERACTIVE TOOL) */}
      <section className="py-16 px-4 bg-gray-900/20 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">2. Verify Your Existence</h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Use your namespace to check its status on the network. Or verify a cryptographic signature to prove ownership without revealing your key.
                </p>
            </div>
            
            <SovereignTools />

        </div>
      </section>

      {/* Action 3: Delegation */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-4">The Delegation Model</h3>
                    <p className="text-gray-400 mb-4 text-sm">
                        You don't need to use your Root Key for everything. You can create <strong>Delegates</strong>.
                    </p>
                    <div className="space-y-3">
                        <div className="p-3 bg-black rounded border border-white/10 flex justify-between items-center">
                            <span className="text-gray-300">Root Key</span>
                            <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">Vault (Cold)</span>
                        </div>
                        <div className="flex justify-center text-gray-600">↓ delegates to</div>
                        <div className="p-3 bg-black rounded border border-white/10 flex justify-between items-center">
                            <span className="text-gray-300">Voting Delegate</span>
                            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">Active (Hot)</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-4">3. Delegate Authority</h2>
                <p className="text-lg text-gray-400 mb-6">
                    Sovereignty means you can empower others to act on your behalf without giving them your identity. 
                    <br/><br/>
                    Assign a key for voting, a key for chat, and a key for payments. If a delegate key is compromised, your Root remains safe.
                </p>
                
                {/* Visual Guide Link */}
                <div className="mb-8">
                    <Link 
                        href="/docs/delegation" 
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-white font-bold transition text-sm"
                    >
                        Read the Delegation Doctrine →
                    </Link>
                </div>

                {/* Tool: Builder */}
                <DelegationBuilder />
            </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-8">Ready to Build?</h2>
        <div className="flex justify-center gap-6">
            <Link 
                href="/docs" 
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition"
            >
                Read Developer Docs
            </Link>
            <Link 
                href="/trust" 
                className="px-8 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition"
            >
                Why This Matters
            </Link>
        </div>
      </footer>

    </main>
  );
}
