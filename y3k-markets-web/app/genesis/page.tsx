import Link from "next/link";

export default function GenesisPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Genesis
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/docs" className="text-gray-300 hover:text-white transition text-sm">
                Docs
              </Link>
              <Link href="/explore" className="text-gray-300 hover:text-white transition text-sm">
                Explore
              </Link>
              <Link 
                href="/mint"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
              >
                Claim Genesis Root
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Genesis Complete Page */}
      <section className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="max-w-5xl w-full py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 rounded-full bg-green-600/20 border border-green-500/50 text-green-400 text-sm font-semibold mb-6">
              ✅ GENESIS COMPLETE
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Y3K Canonical Genesis
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              January 16, 2026 • 6:20 PM EST
            </p>
            <p className="text-lg text-gray-400">
              955 immutable namespace roots now available
            </p>
          </div>

          {/* Genesis Hash Display */}
          <div className="mb-12 p-8 rounded-xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4">🔐 Genesis Hash</h2>
            <div className="font-mono text-sm bg-black/50 p-4 rounded-lg break-all mb-4 text-purple-300">
              0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc
            </div>
            <p className="text-gray-300 text-sm">
              This cryptographic fingerprint anchors all 955 namespaces. Every certificate references this hash, making them permanently verifiable.
            </p>
          </div>

          {/* Genesis Verification */}
          <div className="mb-12 p-8 rounded-xl bg-white/5 border border-blue-500/30">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">🔍 Genesis Artifacts</h2>
            <div className="font-mono text-xs bg-black/50 p-4 rounded-lg break-all mb-4 text-blue-300">
              IPFS CID: bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e
            </div>
            <p className="text-gray-300 text-sm mb-4">
              All 955 genesis certificates are hosted on Cloudflare for fast, reliable verification. Each certificate contains the genesis hash for cryptographic proof.
            </p>
            <div className="flex gap-3 flex-wrap items-center">
              <a
                 href="https://cloudflare-ipfs.com/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e"
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/50 text-blue-300 hover:bg-blue-600/30 transition font-bold"
              >
                ☁️ Verify on Cloudflare IPFS →
              </a>
              <a
                href="/genesis/genesis_attestation.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline ml-2"
              >
                Attestation →
              </a>
              <a
                href="/genesis/manifest.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Manifest →
              </a>
              <a
                href="/genesis/certificates/100.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Example Certificate →
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30">
              <div className="text-4xl font-bold mb-2 gradient-text">955</div>
              <div className="text-sm text-gray-400">Total Genesis Roots</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30">
              <div className="text-4xl font-bold mb-2 text-blue-400">900</div>
              <div className="text-sm text-gray-400">Unclaimed Genesis Roots</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30">
              <div className="text-4xl font-bold mb-2 text-green-400">55</div>
              <div className="text-sm text-gray-400">Protocol Reserved</div>
            </div>
          </div>

          {/* Tier Breakdown */}
          <div className="mb-12 p-8 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold mb-6">Genesis Root Tiers</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-yellow-400">👑 Crown Letters</div>
                  <div className="text-sm text-gray-400">26 roots</div>
                </div>
                <div className="text-sm text-gray-300">a-z • Protocol reserved</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-blue-400">👑 Crown Digits</div>
                  <div className="text-sm text-gray-400">10 roots</div>
                </div>
                <div className="text-sm text-gray-300">0-9 • Protocol reserved</div>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-purple-400">🎯 Three-Digit Genesis</div>
                  <div className="text-sm text-gray-400">900 roots</div>
                </div>
                <div className="text-sm text-gray-300">100-999 • Unclaimed</div>
              </div>
            </div>
          </div>

          {/* What This Means */}
          <div className="mb-12 p-8 rounded-xl bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30">
            <h2 className="text-2xl font-bold mb-4 text-green-400">What Does This Mean?</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                ✅ <strong>Genesis is permanent.</strong> These 955 roots can never be regenerated, altered, or expanded.
              </p>
              <p>
                ✅ <strong>Every namespace is verifiable.</strong> Each certificate contains the genesis hash and is published on IPFS.
              </p>
              <p>
                ✅ <strong>No trust required.</strong> Anyone can independently verify authenticity through cryptographic proof.
              </p>
              <p>
                ✅ <strong>True scarcity.</strong> 900 namespaces available for claiming, starting with Friends & Family access.
              </p>
            </div>
          </div>

          {/* Protocol Terminology Clarity */}
          <div className="mb-12 p-8 rounded-xl bg-blue-900/20 border-2 border-blue-500/40">
            <h2 className="text-2xl font-bold mb-4 text-blue-300">📘 Protocol Terminology</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>Claiming vs. Minting:</strong> In Y3K, "claiming" refers to <strong>deriving a pre-existing genesis namespace and activating its cryptographic certificate</strong>.
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>Genesis roots are <strong>fixed at genesis</strong> – no new roots can ever be created</li>
                <li>Claiming does not create supply – it activates your ownership certificate</li>
                <li>Sub-namespaces may be <strong>derived</strong> beneath your root under SNP sovereignty rules</li>
              </ul>
              <p className="text-blue-200 font-semibold text-sm mt-3">
                Root namespaces = sovereign, fixed at genesis. Sub-namespaces = permissioned, derivable under your root.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/50 text-purple-400 text-sm font-semibold mb-4">
                Friends & Family Access Now Live
              </div>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/friends-family"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl transition font-semibold text-lg"
              >
                F&F Portal →
              </Link>
              <Link
                href="/mint"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl transition font-semibold text-lg border border-white/20"
              >
                View Marketplace
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Public launch: January 17, 2026 at 8:00 PM EST
            </p>
          </div>

          {/* Verification Resources */}
          <div className="mt-12 p-6 rounded-xl bg-black/30 border border-white/10">
            <h3 className="text-lg font-bold mb-3">🔍 Verification Resources</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <a 
                href="https://ipfs.io/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e/certificates/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Browse all certificates →
              </a>
              <Link href="/status" className="text-blue-400 hover:text-blue-300 underline">
                Real-time system status →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>Y3K Sovereign Namespace Protocol • Genesis Complete</p>
          <p className="mt-2">The 955 genesis roots are immutable and cryptographically verifiable forever.</p>
        </div>
      </footer>
    </div>
  );
}
