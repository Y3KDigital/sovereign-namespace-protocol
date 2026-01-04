// Screen 2: Protocol Overview
// What is Sovereign Namespace, what it is NOT

'use client';

export default function OverviewScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-gray-900 rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-6">Protocol Overview</h1>

      <div className="space-y-6 text-gray-300">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">What is Sovereign Namespace Protocol?</h2>
          <p className="text-lg leading-relaxed">
            A cryptographic certificate system where each namespace (e.g., <code className="bg-black px-2 py-1 rounded">1.x</code>) 
            is <strong className="text-white">cryptographically unique and Genesis-locked</strong>. 
            Certificates are signed with post-quantum Dilithium5, stored immutably on IPFS, and 
            verified offline using stateless validation.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Key Properties:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="mr-2">🔐</span>
              <span><strong>Dilithium5-signed</strong> — Post-quantum cryptographic signatures</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📦</span>
              <span><strong>IPFS-backed</strong> — Immutable storage, content-addressed</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔒</span>
              <span><strong>Genesis-locked</strong> — Supply fixed at finalization (2026-01-15)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>Stateless verification</strong> — Anyone can verify without our server</span>
            </li>
          </ul>
        </div>

        <div className="bg-red-900/20 border border-red-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-400 mb-4">What This is NOT:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span><strong>NOT a DNS domain</strong> — You cannot use it as a website address</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span><strong>NOT a TLD or registrar</strong> — This is not ICANN-related</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span><strong>NOT transferable</strong> — Certificates are bound to your keys</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span><strong>NOT an investment product</strong> — No yield, custody, or financial return</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4">Protocol Identifier: .y3k</h3>
          <p className="leading-relaxed">
            The <code className="bg-black px-2 py-1 rounded">.y3k</code> suffix is a 
            <strong className="text-white"> protocol identifier</strong> used to anchor certificates 
            in IPFS metadata. It is NOT a domain extension, NOT a TLD, and NOT used for DNS resolution. 
            It exists solely to distinguish Sovereign Namespace certificates from other certificate types.
          </p>
        </div>

        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-3">Rarity Tiers (6 levels)</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-purple-400 font-bold">Mythic</span> — Exactly 3 total</div>
            <div><span className="text-orange-400 font-bold">Legendary</span> — Exactly 7 total</div>
            <div><span className="text-pink-400 font-bold">Epic</span> — Exactly 19 total</div>
            <div><span className="text-blue-400 font-bold">Rare</span> — Exactly 67 total</div>
            <div><span className="text-green-400 font-bold">Uncommon</span> — Exactly 257 total</div>
            <div><span className="text-gray-400 font-bold">Common</span> — Exactly 1024 total</div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Total supply: <strong>1,377 certificates</strong> — Genesis-locked, cannot be increased
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-8 w-full py-4 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold text-lg transition"
      >
        Continue → Select Identifier
      </button>
    </div>
  );
}
