'use client';

interface FinalityScreenProps {
  onNext: () => void;
}

export default function FinalityScreen({ onNext }: FinalityScreenProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Finality & Scarcity</h1>
        <p className="text-xl text-gray-300">
          Understanding the Genesis ceremony and permanent supply lock
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-gray-800 rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">The Genesis Ceremony</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            On <strong className="text-white">January 15, 2026 at 00:00:00 UTC</strong>, the Genesis 
            ceremony will finalize the protocol. After this moment, <strong>no new certificates can 
            ever be issued</strong> — not by the protocol operators, not by any government, not by anyone.
          </p>
          <p className="text-gray-300 leading-relaxed">
            This is not a business decision that can be reversed. It is a <strong>cryptographic 
            commitment</strong> that makes the protocol's scarcity mathematically enforced and permanent.
          </p>
        </div>

        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-red-300">What Genesis Finalization Means</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>No new certificates can be created after Genesis</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Cannot increase the supply (fixed at 1,377 certificates)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Protocol operators lose the ability to issue certificates</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>No "editions," "renewals," or "versions" — each identifier is unique forever</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4">Fixed Supply by Tier</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
              <p className="text-purple-300 font-semibold">Mythic</p>
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-sm text-gray-400">Forever</p>
            </div>
            <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
              <p className="text-orange-300 font-semibold">Legendary</p>
              <p className="text-3xl font-bold text-white">7</p>
              <p className="text-sm text-gray-400">Forever</p>
            </div>
            <div className="bg-pink-900/20 border border-pink-500 rounded-lg p-4">
              <p className="text-pink-300 font-semibold">Epic</p>
              <p className="text-3xl font-bold text-white">19</p>
              <p className="text-sm text-gray-400">Forever</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-300 font-semibold">Rare</p>
              <p className="text-3xl font-bold text-white">67</p>
              <p className="text-sm text-gray-400">Forever</p>
            </div>
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
              <p className="text-green-300 font-semibold">Uncommon</p>
              <p className="text-3xl font-bold text-white">257</p>
              <p className="text-sm text-gray-400">Forever</p>
            </div>
            <div className="bg-gray-700/20 border border-gray-500 rounded-lg p-4">
              <p className="text-gray-300 font-semibold">Common</p>
              <p className="text-3xl font-bold text-white">1,024</p>
              <p className="text-sm text-gray-400">Forever</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold text-white">Total: 1,377 certificates</p>
            <p className="text-gray-400">This number can <strong>never</strong> increase</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4">Cryptographic Irreversibility</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Each certificate is cryptographically signed with the protocol's private key during issuance. 
            After Genesis, this key is <strong>ceremonially destroyed</strong>, making it mathematically 
            impossible to create new valid certificates.
          </p>
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6">
            <h4 className="font-semibold mb-3 text-blue-300">What This Guarantees</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">✓</span>
                <span>Your certificate cannot be diluted by future issuances</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">✓</span>
                <span>No protocol upgrades can invalidate existing certificates</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">✓</span>
                <span>Scarcity is enforced by mathematics, not trust</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400">✓</span>
                <span>Protocol operators cannot favor insiders with late issuances</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4">Why This Design?</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Most digital systems maintain the ability to modify, revoke, or expand their supply. 
            This creates ongoing trust requirements and opportunities for abuse.
          </p>
          <p className="text-gray-300 leading-relaxed">
            By permanently locking the supply at Genesis, the protocol eliminates these trust 
            requirements and ensures that the rules governing scarcity can <strong>never change</strong> — 
            not even by unanimous agreement of all participants.
          </p>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-6">
          <h4 className="font-semibold mb-3 text-yellow-300">⚠️ Understand Before Proceeding</h4>
          <p className="text-gray-300 text-sm">
            This finality applies to <strong>real</strong> certificates. Once issued, your certificate 
            is part of the permanent record. There is no customer support that can reverse this. 
            There is no technical process to undo it. It is <strong>final</strong>.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Continue → Take Quiz
        </button>
      </div>
    </div>
  );
}
