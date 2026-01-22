import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Professional Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/95 backdrop-blur-md border-b border-blue-500/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-white">Y3K</span>
            <span className="text-blue-400 ml-2 text-sm font-normal">Digital Property</span>
          </div>
          <Link 
            href="/mint"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-900/50"
          >
            Secure Your Position
          </Link>
        </div>
      </nav>

      {/* Trust Badge */}
      <div className="pt-24 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Genesis Ceremony Complete</span>
            </div>
            <span className="text-slate-600">•</span>
            <span>900 Total Supply</span>
            <span className="text-slate-600">•</span>
            <span>January 16, 2026</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            Digital Property Infrastructure.
            <span className="block mt-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Permanent Ownership. No Renewals.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Own a <span className="text-white font-semibold">cryptographic root</span> created once at genesis. 
            <span className="text-white font-semibold">No corporate custody.</span> 
            <span className="text-white font-semibold">No renewal fees.</span> 
            Keys generated client-side. You control everything.
          </p>

          <div className="pt-8">
            <Link
              href="/mint"
              className="inline-block px-16 py-5 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/50"
            >
              Secure Your Genesis Root - $29
            </Link>
          </div>

          <p className="text-sm text-slate-500">Cryptocurrency or stablecoin only • BTC • ETH • USDC • USDT</p>
        </div>
      </section>

      {/* What This Actually Is */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What This Actually Is</h2>
            <p className="text-xl text-slate-400">Real infrastructure. Real purpose. Real value.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-emerald-400 mb-6">✓ What This IS</h3>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="text-emerald-400 mt-1">•</div>
                  <div><span className="font-semibold text-white">Genesis Root</span> - One of 900 cryptographic roots created once on January 16, 2026</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-emerald-400 mt-1">•</div>
                  <div><span className="font-semibold text-white">Cold Storage Wallet</span> - Ed25519 keys generated offline, you control 100%</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-emerald-400 mt-1">•</div>
                  <div><span className="font-semibold text-white">Digital Property Infrastructure</span> - Build unlimited subdomains under your root, store assets, transfer freely</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-emerald-400 mt-1">•</div>
                  <div><span className="font-semibold text-white">Provably Scarce Asset</span> - Cannot be recreated, duplicated, or inflated</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-red-400 mb-6">✗ What This is NOT</h3>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">•</div>
                  <div><span className="font-semibold text-white">NOT a TLD</span> (Top Level Domain like .com or .eth)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">•</div>
                  <div><span className="font-semibold text-white">NOT an NFT</span> (ERC-721, Polygon, or any blockchain token)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">•</div>
                  <div><span className="font-semibold text-white">NOT a meme token</span> or speculative asset</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">•</div>
                  <div><span className="font-semibold text-white">NOT soulbound</span> - You have full transfer and resale rights</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-8 text-center">
            <p className="text-lg text-slate-300 leading-relaxed">
              This is <span className="text-blue-400 font-semibold">cryptographic infrastructure</span> with 
              <span className="text-white font-semibold"> real utility</span>, 
              <span className="text-white font-semibold"> proven scarcity</span>, and 
              <span className="text-white font-semibold"> genuine purpose</span>.
              <span className="block mt-4 text-slate-400">Not hype. Not speculation. Just structure.</span>
            </p>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">What You Receive</h2>
          <p className="text-center text-slate-400 mb-16">Real ownership. Professional grade security.</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-8 shadow-xl">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Paper Wallet (DIY Cold Storage)</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Your private keys are generated <span className="text-white font-semibold">in your browser, never transmitted to any server</span>. 
                You write them down on paper and store them securely. This is the same free cold storage method recommended by crypto experts.
              </p>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <div>Ed25519 cryptographic keypair (bank-grade)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <div>Paper wallet format - write down and secure offline</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <div>No hardware wallet needed (saves you $50-$200)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <div>You control keys 100% - Y3K has zero access</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-xl p-8 shadow-xl">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Genesis Root Namespace</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                One of <span className="text-white font-semibold">900 total supply</span> from the January 16, 2026 genesis ceremony. 
                Created using verifiable entropy: Bitcoin blocks, Ethereum blocks, NIST beacons, atmospheric noise.
              </p>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <div>Cryptographically unique - cannot be recreated</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <div>Create unlimited subdomains under your root</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <div>Full secondary market resale rights</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <div>No renewal fees, ever</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Bank-Grade Security<br /><span className="text-blue-400 text-2xl">(Without Buying a Hardware Wallet)</span></h2>
          <p className="text-xl text-slate-400 text-center mb-16">
            Y3K uses the same DIY paper wallet method recommended by crypto security experts. Your keys are generated in your browser—never on our servers—then you write them down and store them safely.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-slate-900/50 border border-slate-700 rounded-xl">
              <div className="text-3xl mb-3">🛡️</div>
              <div className="font-bold text-lg mb-2 text-white">Client-Side Generation</div>
              <div className="text-sm text-slate-400">Keys created in your browser only. Nothing sent to servers. This is the industry-standard free cold storage method.</div>
            </div>
            <div className="text-center p-6 bg-slate-900/50 border border-slate-700 rounded-xl">
              <div className="text-3xl mb-3">📋</div>
              <div className="font-bold text-lg mb-2 text-white">Paper Wallet Backup</div>
              <div className="text-sm text-slate-400">Write down your keys on paper and store in a safe. That's your cold storage—no hardware wallet needed.</div>
            </div>
            <div className="text-center p-6 bg-slate-900/50 border border-slate-700 rounded-xl">
              <div className="text-3xl mb-3">🔒</div>
              <div className="font-bold text-lg mb-2 text-white">Zero Y3K Access</div>
              <div className="text-sm text-slate-400">We cannot recover, reset, or access your wallet. No custodian, no company breach risk.</div>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <div className="text-xl font-bold text-amber-400 mb-3">Your Responsibility</div>
                <p className="text-slate-300 leading-relaxed">
                  You are in complete control. If you lose your private keys, Y3K cannot recover them. 
                  <span className="block mt-3 text-white font-semibold">This is real ownership - which means real responsibility.</span>
                  <span className="block mt-2 text-slate-400">Write down your keys. Store them safely. Treat them like cash.</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-slate-950/50 border border-blue-500/20 rounded-xl p-6">
            <p className="text-slate-400 text-sm leading-relaxed">
              <span className="text-blue-400 font-semibold">Hardware Wallet Note:</span> Dedicated devices like Ledger or Trezor cost $50-$200. 
              Y3K provides the same paper wallet security method that experts recommend for free (you just pay $29 for the namespace itself). 
              If you want a hardware wallet later, you can always import your keys into one—but you don't need it to get started.
            </p>
          </div>
        </div>
      </section>

      {/* Structure */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How This Works</h2>
          
          <div className="space-y-8">
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">One Payment. Forever.</h3>
              <p className="text-slate-300 leading-relaxed">
                <span className="text-white font-semibold">$29 once.</span> No renewals. No subscriptions. 
                <span className="block mt-3 text-slate-400">
                  You pay $29, receive your root and keys, and own it permanently. 
                  Transfer freely. Resell peer-to-peer. Keep 100% of proceeds.
                </span>
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">What You Can Do</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Cryptographic infrastructure with permanent ownership:
              </p>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 mt-1">→</div>
                  <div><span className="font-semibold text-white">Store assets:</span> Cryptocurrency, NFTs, credentials, smart contracts in your cold wallet</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 mt-1">→</div>
                  <div><span className="font-semibold text-white">Build infrastructure:</span> Create unlimited subdomains under your root (wallet, profile, vault, docs)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 mt-1">→</div>
                  <div><span className="font-semibold text-white">Trade freely:</span> Sell peer-to-peer or on marketplaces, keep 100% of proceeds</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Client-Side Generation</h3>
              <p className="text-slate-300 leading-relaxed">
                Keys generated locally in your browser. Never transmitted. 
                <span className="block mt-3 text-white font-semibold">Y3K has zero access.</span>
                <span className="block mt-3 text-slate-400">
                  No custody risk. No platform dependency. 
                  Ownership persists independently of Y3K's existence.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Simple, Fair Pricing</h2>
          
          <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-12 mb-12 shadow-2xl">
            <div className="text-6xl font-bold text-blue-400 mb-4">$29</div>
            <div className="text-2xl text-white font-semibold mb-6">One Time. Forever.</div>
            <div className="text-slate-400 mb-8">Cryptocurrency or stablecoin only</div>
            
            <div className="space-y-3 text-left max-w-md mx-auto mb-8 text-slate-300">
              <div className="flex items-center gap-3">
                <div className="text-emerald-400 text-xl">✓</div>
                <div>Genesis root namespace (1 of 900)</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-emerald-400 text-xl">✓</div>
                <div>Cold storage wallet with Ed25519 keys</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-emerald-400 text-xl">✓</div>
                <div>Create unlimited subdomains</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-emerald-400 text-xl">✓</div>
                <div>Full resale rights (keep 100%)</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-emerald-400 text-xl">✓</div>
                <div>No renewal fees, ever</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-emerald-400 text-xl">✓</div>
                <div>Limit: 1 per buyer</div>
              </div>
            </div>

            <Link
              href="/mint"
              className="inline-block px-16 py-5 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/50"
            >
              Secure Your Genesis Root Now
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="font-semibold text-white mb-2">✗ No Hidden Fees</div>
              <div className="text-slate-400">$29 is the total cost. Period.</div>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="font-semibold text-white mb-2">✗ No Annual Renewals</div>
              <div className="text-slate-400">Pay once, own forever</div>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="font-semibold text-white mb-2">✗ No Platform Fees</div>
              <div className="text-slate-400">Keep 100% when you resell</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why This is Safe</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-8">
              <div className="text-3xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-white mb-3">Verifiable Genesis</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The January 16, 2026 genesis ceremony used publicly verifiable entropy sources: 
                Bitcoin block 879,420, Ethereum block 21,654,321, NIST randomness beacons, and atmospheric noise. 
                All 900 roots are IPFS-locked with hash <span className="font-mono text-blue-400 text-xs break-all">bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e</span>.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-xl p-8">
              <div className="text-3xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-white mb-3">Open Source Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                All Y3K infrastructure code is open source on GitHub. 
                The cryptographic proofs, namespace generation, and wallet creation logic can be independently verified. 
                No trust required—verify the mathematics yourself.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-xl p-8">
              <div className="text-3xl mb-4">🏦</div>
              <h3 className="text-xl font-bold text-white mb-3">No Custody Risk</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Y3K never holds your assets. Your wallet keys are generated client-side and never transmitted. 
                Even if Y3K disappeared tomorrow, your ownership remains intact—provable on the blockchain, 
                backed by IPFS-locked certificates.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-xl p-8">
              <div className="text-3xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-white mb-3">Legally Sound</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                This is digital property, not securities. You receive cryptographic ownership rights, 
                not investment contracts. Full secondary market transfer rights with no platform gatekeeping. 
                This is infrastructure, not speculation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold text-white">
            <span className="text-blue-400">Permanent Ownership</span>
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            $29 for a cryptographic root. Created once. Owned permanently.
            <span className="block mt-2">No renewals. No custody. No intermediaries.</span>
            <span className="block mt-4 text-white font-semibold">Keys. Root. Ownership.</span>
          </p>
          <Link
            href="/mint"
            className="inline-block px-16 py-6 bg-blue-600 text-white text-2xl font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/50"
          >
            Secure Your Position
          </Link>
          <p className="text-sm text-slate-500">
            BTC • ETH • USDC • USDT accepted • 900 total supply • 1 per buyer
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold text-white mb-3">Y3K</div>
              <p className="text-sm text-slate-400">
                Digital property infrastructure for the next generation.
              </p>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">Product</div>
              <div className="space-y-2 text-sm text-slate-400">
                <div><Link href="/mint" className="hover:text-blue-400 transition">Buy Genesis Root</Link></div>
                <div><Link href="/docs" className="hover:text-blue-400 transition">Documentation</Link></div>
                <div><Link href="/explore" className="hover:text-blue-400 transition">Explore Roots</Link></div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">Trust</div>
              <div className="space-y-2 text-sm text-slate-400">
                <div><Link href="/trust" className="hover:text-blue-400 transition">Security & Safety</Link></div>
                <div><Link href="/status" className="hover:text-blue-400 transition">System Status</Link></div>
                <div><a href="https://github.com/Y3KDigital" className="hover:text-blue-400 transition">GitHub</a></div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-white mb-3">Genesis</div>
              <div className="space-y-2 text-sm text-slate-400">
                <div>January 16, 2026</div>
                <div>900 Total Supply</div>
                <div>Numbers only (100-999)</div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>© 2026 Y3K Digital Property • Not investment advice • Digital infrastructure only</p>
            <p className="mt-2">One-time $29 purchase • No renewal fees • Full resale rights</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
