// Screen 4: Certificate Preview
// Mock Dilithium5-signed certificate (watermarked SIMULATION)

'use client';

import { useEffect, useState } from 'react';
import { getPublicApiBase } from '@/lib/publicApiBase';

interface CertificateScreenProps {
  sessionToken: string;
  session: any;
  onNext: () => void;
}

interface MockCertificate {
  version: string;
  namespace: string;
  tier: string;
  issued_at: string;
  ipfs_cid: string;
  certificate_hash: string;
  signature: string;
  genesis_timestamp: string;
  protocol_version: string;
  is_simulation: boolean;
}

export default function CertificateScreen({ sessionToken, session, onNext }: CertificateScreenProps) {
  const [certificate, setCertificate] = useState<MockCertificate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if certificate already generated
    if (session.mock_certificate_json) {
      try {
        setCertificate(JSON.parse(session.mock_certificate_json));
      } catch (err) {
        console.error('Failed to parse certificate:', err);
      }
    } else {
      generateCertificate();
    }
  }, [session]);

  const generateCertificate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const apiBase = getPublicApiBase();
      const response = await fetch(
        `${apiBase}/api/practice/generate-certificate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: sessionToken }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate certificate');
      }

      setCertificate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="bg-gray-900 rounded-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold mb-2">Generating Mock Certificate...</h2>
          <p className="text-gray-400">Creating Dilithium5-signed simulation artifact</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-8">
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 text-red-400">
          <h2 className="font-bold mb-2">Certificate Generation Failed</h2>
          <p>{error}</p>
        </div>
        <button
          onClick={generateCertificate}
          className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
        >
          Retry Generation
        </button>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-6">Certificate Preview</h1>

      <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4 mb-6">
        <p className="text-sm text-orange-300 font-bold">
          🔶 SIMULATION / PRACTICE MODE — NOT A REAL CERTIFICATE 🔶
        </p>
        <p className="text-xs text-orange-400 mt-2">
          This certificate is watermarked and flagged as simulation. 
          The signature is mock data. The IPFS CID is prefixed with "QmPRACTICE".
        </p>
      </div>

      <div className="space-y-6">
        {/* Certificate JSON */}
        <div>
          <h2 className="text-xl font-bold mb-3">Certificate Structure</h2>
          <pre className="bg-black p-6 rounded-lg overflow-x-auto text-xs text-gray-300 border border-gray-700">
{JSON.stringify(certificate, null, 2)}
          </pre>
        </div>

        {/* Key Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Namespace</div>
            <div className="font-mono text-sm text-white break-all">
              {certificate.namespace}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Tier</div>
            <div className="font-bold text-sm text-purple-400">
              {certificate.tier}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">IPFS CID (Mock)</div>
            <div className="font-mono text-xs text-blue-400 break-all">
              {certificate.ipfs_cid}
            </div>
            <div className="text-xs text-orange-400 mt-1">
              ⚠️ Prefixed with "QmPRACTICE" (simulation marker)
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Certificate Hash</div>
            <div className="font-mono text-xs text-green-400 break-all">
              {certificate.certificate_hash.substring(0, 32)}...
            </div>
          </div>
        </div>

        {/* Signature Display */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-xs text-gray-500 mb-2">Dilithium5 Signature (Mock)</div>
          <div className="font-mono text-xs text-gray-400 break-all">
            {certificate.signature}
          </div>
          <div className="text-xs text-orange-400 mt-2">
            ⚠️ This is placeholder text, not a real Dilithium5 signature
          </div>
        </div>

        {/* Key Indicators */}
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
          <h3 className="font-bold text-blue-400 mb-3">Certificate Properties:</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">🔐</span>
              <span><strong>Post-quantum signed:</strong> Real certificates use Dilithium5 (NIST standardized)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📦</span>
              <span><strong>IPFS-backed:</strong> Content-addressed, immutable storage</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔒</span>
              <span><strong>Genesis-locked:</strong> Timestamp: {certificate.genesis_timestamp}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>Verifiable offline:</strong> Anyone can verify without our server</span>
            </li>
          </ul>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-8 w-full py-4 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold text-lg transition"
      >
        Continue → Verification Demo
      </button>
    </div>
  );
}
