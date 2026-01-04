// Screen 1: Purpose Statement
// Why Practice Mode exists

'use client';

export default function PurposeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-gray-900 rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-6">Purpose of Practice Mode</h1>

      <div className="space-y-6 text-gray-300">
        <p className="text-xl leading-relaxed">
          Sovereign Namespace Protocol certificates are <strong className="text-white">permanent, 
          immutable, and non-transferable</strong>. Once issued, they cannot be changed, revoked, 
          or recovered if keys are lost.
        </p>

        <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-6">
          <h2 className="text-xl font-bold text-orange-400 mb-4">
            This is NOT reversible
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span>No "undo" or "reset"</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span>No customer support can modify your certificate</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span>Key loss means permanent loss of access</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">❌</span>
              <span>No refunds after 24-hour payment window</span>
            </li>
          </ul>
        </div>

        <p className="text-lg">
          Practice Mode lets you experience the <strong>exact flow</strong> of real issuance 
          without any real consequences. You will see mock certificates, simulate verification, 
          and understand Genesis finalization—all in a safe environment.
        </p>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">What happens in this simulation:</h2>
          <ul className="space-y-2">
            <li>✅ Select a namespace identifier (not reserved)</li>
            <li>✅ View a mock Dilithium5-signed certificate</li>
            <li>✅ Understand stateless verification</li>
            <li>✅ Learn about Genesis and scarcity enforcement</li>
            <li>✅ Take a mandatory quiz (100% required)</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500">
          <strong>Note:</strong> Completing Practice Mode does not guarantee eligibility for 
          real issuance. Real certificates require payment, Genesis participation, and supply 
          availability.
        </p>
      </div>

      <button
        onClick={onNext}
        className="mt-8 w-full py-4 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold text-lg transition"
      >
        I Understand → Continue
      </button>
    </div>
  );
}
