'use client';

interface VerificationScreenProps {
  onNext: () => void;
}

export default function VerificationScreen({ onNext }: VerificationScreenProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Stateless Verification</h1>
        <p className="text-xl text-gray-300">
          How certificates can be verified without servers or databases
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-gray-800 rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">What is Stateless Verification?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Unlike traditional systems that require online databases or APIs to check validity, 
            Sovereign Namespace Protocol certificates can be verified <strong>completely offline</strong> using 
            only the certificate itself and cryptographic operations.
          </p>
          <p className="text-gray-300 leading-relaxed">
            This means anyone with the certificate can independently verify its authenticity without 
            trusting or contacting any third party, including the protocol operators.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-green-400 font-bold text-xl">1.</span>
              <div>
                <p className="font-semibold text-gray-200">Certificate Hash Verification</p>
                <p className="text-gray-400 text-sm">
                  Compute SHA3-256 hash of certificate contents and compare to recorded hash
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 font-bold text-xl">2.</span>
              <div>
                <p className="font-semibold text-gray-200">Dilithium5 Signature Verification</p>
                <p className="text-gray-400 text-sm">
                  Verify post-quantum digital signature using public key from Genesis ceremony
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 font-bold text-xl">3.</span>
              <div>
                <p className="font-semibold text-gray-200">IPFS Content Address Check</p>
                <p className="text-gray-400 text-sm">
                  Confirm IPFS CID matches certificate hash (content-addressed storage)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 font-bold text-xl">4.</span>
              <div>
                <p className="font-semibold text-gray-200">Genesis Timestamp Validation</p>
                <p className="text-gray-400 text-sm">
                  Verify certificate was issued before Genesis finalization (2026-01-15 00:00:00 UTC)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Demo */}
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4">Mock Verification Result</h3>
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl">✅</span>
              <div>
                <p className="text-2xl font-bold text-green-400">VALID (SIMULATION)</p>
                <p className="text-gray-300 text-sm">All cryptographic checks passed</p>
              </div>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>✓ Certificate hash matches recorded value</p>
              <p>✓ Dilithium5 signature is valid</p>
              <p>✓ IPFS CID corresponds to certificate content</p>
              <p>✓ Issued before Genesis finalization</p>
            </div>
          </div>
          <div className="mt-4 bg-orange-900/30 border border-orange-500 rounded-lg p-4">
            <p className="text-sm text-orange-200">
              <strong>⚠️ SIMULATION:</strong> This is a mock verification result. Real certificates 
              use actual Dilithium5 signatures that can be verified offline using the snp-verifier tool.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4">Why This Matters</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong>No server dependency:</strong> Verification works even if protocol operators disappear</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong>Censorship resistance:</strong> Cannot be blocked by governments or ISPs</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong>Long-term durability:</strong> Certificates remain verifiable for decades</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span><strong>Post-quantum secure:</strong> Protected against quantum computer attacks</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Continue → Finality Explanation
        </button>
      </div>
    </div>
  );
}
