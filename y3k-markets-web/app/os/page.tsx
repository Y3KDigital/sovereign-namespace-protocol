import Link from "next/link";

export default function OSPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              kevan-os
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/docs" className="text-gray-300 hover:text-white transition text-sm">
                Docs
              </Link>
              <Link href="/genesis" className="text-gray-300 hover:text-white transition text-sm">
                Genesis
              </Link>
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-mono">
                v1.0.1 Stable
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            The World's First <span className="gradient-text">Sovereign OS</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            kevan-os is not a wallet. It is a full-stack personal operating system that replaces your telecom carrier, your bank, and your cloud provider with <strong>code you own</strong>.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/friends-family" className="px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition">
              Get the Demo Zip
            </Link>
            <Link href="/docs" className="px-8 py-4 rounded-xl bg-white/10 border border-white/10 hover:border-white/30 transition">
              Read the Whitepaper
            </Link>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-20 px-4 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Core Modules (Frozen v1.0.0)</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tel Module */}
            <div className="p-6 rounded-2xl bg-black border border-white/10 hover:border-blue-500/50 transition opacity-100">
              <div className="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center text-2xl mb-4 text-blue-400">
                📞
              </div>
              <h3 className="text-xl font-bold mb-2">kevan-tel</h3>
              <p className="text-gray-400 text-sm mb-4">
                Sovereign Telephony Node
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Programmable Voice/SMS</li>
                <li>• Carrier-Independent</li>
                <li>• Global Routing</li>
              </ul>
            </div>

            {/* Finance Module */}
            <div className="p-6 rounded-2xl bg-black border border-white/10 hover:border-purple-500/50 transition opacity-100">
              <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center text-2xl mb-4 text-purple-400">
                💸
              </div>
              <h3 className="text-xl font-bold mb-2">kevan-finance</h3>
              <p className="text-gray-400 text-sm mb-4">
                Universal Value Router
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Ledger & Wallet Unity</li>
                <li>• Smart Payment Routing</li>
                <li>• Immutable Audit Log</li>
              </ul>
            </div>

            {/* Mail Module */}
            <div className="p-6 rounded-2xl bg-black border border-white/10 hover:border-yellow-500/50 transition opacity-100">
              <div className="w-12 h-12 rounded-lg bg-yellow-900/30 flex items-center justify-center text-2xl mb-4 text-yellow-400">
                📨
              </div>
              <h3 className="text-xl font-bold mb-2">kevan-mail</h3>
              <p className="text-gray-400 text-sm mb-4">
                Identity-Bound Comms
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• Namespace-to-Namespace</li>
                <li>• Cross-Network Broadcast</li>
                <li>• Zero-Spam Architecture</li>
              </ul>
            </div>

            {/* Vault Module */}
            <div className="p-6 rounded-2xl bg-black border border-white/10 hover:border-green-500/50 transition opacity-100">
              <div className="w-12 h-12 rounded-lg bg-green-900/30 flex items-center justify-center text-2xl mb-4 text-green-400">
                🔐
              </div>
              <h3 className="text-xl font-bold mb-2">kevan-vault</h3>
              <p className="text-gray-400 text-sm mb-4">
                The Truth Layler
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>• IPFS Certificate Storage</li>
                <li>• Local-First Encryption</li>
                <li>• Deterministic Restore</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Observer Mode Feature */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/50 text-blue-400 text-xs font-semibold mb-4">
              NEW IN V1.0.1
            </div>
            <h2 className="text-4xl font-bold mb-6">Observer Mode</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              True sovereignty means proving integrity without asking for trust. 
              <strong>Observer Mode</strong> allows anyone to run a read-only instance of the OS.
            </p>
            <ul className="space-y-4 mb-8">
               <li className="flex items-start gap-3">
                 <span className="text-green-400">✓</span>
                 <span className="text-gray-300">View the immutable audit log in real-time</span>
               </li>
               <li className="flex items-start gap-3">
                 <span className="text-green-400">✓</span>
                 <span className="text-gray-300">Verify genesis certificates and signatures</span>
               </li>
               <li className="flex items-start gap-3">
                 <span className="text-green-400">✓</span>
                 <span className="text-gray-300">Zero risk: Write operations are biologically blocked</span>
               </li>
            </ul>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-gray-900 rounded-xl border border-white/10 p-2 shadow-2xl">
              <div className="bg-black rounded-lg p-6 font-mono text-xs md:text-sm text-gray-300 overflow-x-auto">
                <div className="text-green-500 mb-2">$ ./kevan-os --observer audit tail</div>
                <div className="text-blue-400 mb-4">📜 Global Sovereign Audit Log</div>
                <div className="mb-1">2026-01-17 12:00:01 | kevan.x | AuthLogin | &#123;"method":"biometric"&#125;</div>
                <div className="mb-1">2026-01-17 12:05:22 | kevan.x | TelCall   | &#123;"to":"+1999..."&#125;</div>
                <div className="mb-1">2026-01-17 12:15:00 | kevan.x | FinPay    | &#123;"amt":50.00,"cur":"USD"&#125;</div>
                <div className="text-gray-500 mt-4">-- End of Log --</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 Y3K Markets. Powered by kevan-os v1.0.1.
        </p>
      </footer>
    </div>
  );
}
