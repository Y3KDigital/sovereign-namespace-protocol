"use client";

import Link from "next/link";

export default function OwnershipPage() {
  return (
    <main className="min-h-screen pt-16 bg-slate-950 text-white">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-8">
              <Link href="/" className="hover:text-purple-400 transition">Home</Link>
              <Link href="/trust" className="hover:text-purple-400 transition">Trust</Link>
              <Link href="/status" className="hover:text-purple-400 transition">Status</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            What You Now Own
          </h1>
          <p className="text-xl text-slate-400">
            Complete orientation for your cryptographic root
          </p>
        </div>

        {/* The Root */}
        <section className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">Your Genesis Root</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              You own one of <span className="text-white font-semibold">955 total genesis roots</span> created 
              during the January 16, 2026 ceremony. This root was generated using verifiable entropy from:
            </p>
            <ul className="ml-6 space-y-2">
              <li>• Bitcoin block 879,420</li>
              <li>• Ethereum block 21,654,321</li>
              <li>• NIST randomness beacons</li>
              <li>• Atmospheric noise</li>
            </ul>
            <p className="text-white font-semibold">
              This root cannot be recreated. It was generated once and sealed permanently on IPFS.
            </p>
          </div>
        </section>

        {/* The Keys */}
        <section className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">Your Keys</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              You generated an <span className="text-white font-semibold">Ed25519 keypair</span> locally in your browser. 
              These keys were <span className="text-white font-semibold">never transmitted to any server</span>.
            </p>
            
            <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔑</div>
                <div>
                  <div className="text-red-400 font-bold mb-2">Private Key = Ownership</div>
                  <p className="text-slate-300 text-sm">
                    Your private key proves ownership. Anyone with this key controls your root. 
                    <span className="block mt-2 text-white">Store it safely. Y3K cannot recover it.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🌐</div>
                <div>
                  <div className="text-blue-400 font-bold mb-2">Public Key = Identity</div>
                  <p className="text-slate-300 text-sm">
                    Your public key is your visible identifier. It's anchored to your root in the genesis manifest. 
                    Safe to share.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Survives */}
        <section className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">What Survives Y3K</h2>
          <div className="space-y-4 text-slate-300">
            <p className="text-white font-semibold mb-4">
              Your ownership is not dependent on Y3K's existence.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <span className="font-semibold text-white">Genesis manifest is IPFS-locked</span>
                  <div className="text-sm text-slate-400 mt-1">
                    Hash: <span className="font-mono text-xs">bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Anyone can retrieve and verify your root certificate from IPFS.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <span className="font-semibold text-white">Your keys are yours</span>
                  <div className="text-sm text-slate-400">
                    Generated client-side. Never stored by Y3K. Cannot be seized or revoked.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl">✓</div>
                <div>
                  <span className="font-semibold text-white">Protocol is open</span>
                  <div className="text-sm text-slate-400">
                    All verification logic is public on GitHub. Anyone can implement compatible tools.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-200">
                If Y3K disappeared tomorrow, your root remains provably yours. The IPFS certificate, your keys, 
                and the public protocol ensure permanent ownership.
              </p>
            </div>
          </div>
        </section>

        {/* Subdomains */}
        <section className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">Creating Subdomains</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Your root allows unlimited subdomain creation. Examples:
            </p>
            
            <div className="bg-slate-950/50 border border-slate-600 rounded-lg p-6">
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <div className="text-green-400">→</div>
                  <div><span className="text-white">777</span> <span className="text-slate-500">(your root)</span></div>
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <div className="text-blue-400">→</div>
                  <div><span className="text-white">777/wallet</span></div>
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <div className="text-blue-400">→</div>
                  <div><span className="text-white">777/docs</span></div>
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <div className="text-blue-400">→</div>
                  <div><span className="text-white">777/vault</span></div>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-400">
              Each subdomain can be signed with your private key to prove delegation. 
              You can create certificates for subdomains, transfer them, or sell them independently.
            </p>

            <div className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-xl">⚙️</div>
                <div>
                  <div className="text-amber-400 font-semibold mb-1">Development in Progress</div>
                  <p className="text-sm text-slate-300">
                    Subdomain creation tools are being finalized. For now, your root is secure and verified. 
                    Subdomain functionality will be available soon via dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transfer */}
        <section className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">Transfer & Resale</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              You have <span className="text-white font-semibold">full transfer rights</span>. To transfer your root:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-slate-500 font-mono">1.</div>
                <div>
                  <span className="font-semibold text-white">Transfer your private key</span>
                  <div className="text-sm text-slate-400">
                    Securely share your private key with the buyer. Once they have it, they control the root.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-slate-500 font-mono">2.</div>
                <div>
                  <span className="font-semibold text-white">Update IPFS certificate (optional)</span>
                  <div className="text-sm text-slate-400">
                    New owner can generate a new signed certificate pointing to their public key.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-slate-500 font-mono">3.</div>
                <div>
                  <span className="font-semibold text-white">No platform approval needed</span>
                  <div className="text-sm text-slate-400">
                    Peer-to-peer transfer. No Y3K permission. No platform fees.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-200">
                You keep <span className="font-semibold">100% of resale proceeds</span>. No marketplace fees. 
                No platform cuts. Just peer-to-peer transfer.
              </p>
            </div>
          </div>
        </section>

        {/* What NOT to Expect */}
        <section className="bg-slate-900/50 border border-red-500/30 rounded-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-red-400 mb-4">What NOT to Expect</h2>
          <div className="space-y-4 text-slate-300">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-red-400 text-xl">✗</div>
                <div>
                  <span className="font-semibold text-white">No key recovery</span>
                  <div className="text-sm text-slate-400">
                    If you lose your private key, Y3K cannot help. There is no password reset. No support ticket. 
                    The key is the ownership. Write it down.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-red-400 text-xl">✗</div>
                <div>
                  <span className="font-semibold text-white">No custody service</span>
                  <div className="text-sm text-slate-400">
                    Y3K does not hold your keys. We cannot lock, unlock, freeze, or access your root. 
                    This is by design.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-red-400 text-xl">✗</div>
                <div>
                  <span className="font-semibold text-white">No renewal fees (but also no reminders)</span>
                  <div className="text-sm text-slate-400">
                    You never pay again. But this also means no renewal emails, no expiration warnings. 
                    You own it permanently from day one.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-red-400 text-xl">✗</div>
                <div>
                  <span className="font-semibold text-white">No chargebacks</span>
                  <div className="text-sm text-slate-400">
                    Crypto payments are final. Once confirmed, the transaction cannot be reversed. 
                    This is inherent to cryptocurrency, not a Y3K policy.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verification */}
        <section className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-4">Independent Verification</h2>
          <div className="space-y-4 text-slate-300">
            <p>Don't trust Y3K. Verify yourself:</p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-blue-400">→</div>
                <div>
                  <span className="font-semibold text-white">Genesis manifest on IPFS</span>
                  <div className="text-sm text-slate-400 font-mono mt-1">
                    ipfs://bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-blue-400">→</div>
                <div>
                  <span className="font-semibold text-white">Protocol source code</span>
                  <div className="text-sm text-slate-400">
                    <a href="https://github.com/Y3KDigital" className="underline hover:text-blue-400" target="_blank" rel="noopener">
                      github.com/Y3KDigital
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-blue-400">→</div>
                <div>
                  <span className="font-semibold text-white">Entropy sources</span>
                  <div className="text-sm text-slate-400">
                    Bitcoin block 879,420 • Ethereum block 21,654,321 • NIST beacons • All publicly auditable
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">You're Ready</h2>
          <div className="space-y-4 text-slate-300">
            <p className="text-lg">
              You now own permanent cryptographic infrastructure. Your root is yours. Your keys are yours. 
              No one can take them. No renewal required. No platform dependency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                href="/status"
                className="flex-1 text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                View System Status
              </Link>
              <Link
                href="/docs"
                className="flex-1 text-center px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
              >
                Read Documentation
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
