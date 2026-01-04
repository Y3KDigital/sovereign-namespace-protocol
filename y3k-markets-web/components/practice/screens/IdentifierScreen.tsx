// Screen 3: Identifier Selection
// Mock selection (fake availability)

'use client';

import { useState } from 'react';

interface IdentifierScreenProps {
  sessionToken: string;
  session: any;
  onNext: () => void;
}

export default function IdentifierScreen({ sessionToken, session, onNext }: IdentifierScreenProps) {
  const [tier, setTier] = useState(session.selected_tier || 'Common');
  const [identifier, setIdentifier] = useState(session.selected_identifier || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tiers = [
    { name: 'Mythic', color: 'text-purple-400', supply: 3 },
    { name: 'Legendary', color: 'text-orange-400', supply: 7 },
    { name: 'Epic', color: 'text-pink-400', supply: 19 },
    { name: 'Rare', color: 'text-blue-400', supply: 67 },
    { name: 'Uncommon', color: 'text-green-400', supply: 257 },
    { name: 'Common', color: 'text-gray-400', supply: 1024 },
  ];

  const handleCheckAvailability = async () => {
    setError(null);
    setIsAvailable(null);

    if (!identifier || identifier.length < 1 || identifier.length > 32) {
      setError('Identifier must be 1-32 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(identifier)) {
      setError('Identifier must be alphanumeric (letters, numbers, _, -)');
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/practice/identifier`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_token: sessionToken,
            tier,
            identifier,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check availability');
      }

      // In practice mode, always returns true (simulation)
      setIsAvailable(data.available);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability');
    } finally {
      setIsChecking(false);
    }
  };

  const handleContinue = () => {
    if (isAvailable && identifier) {
      onNext();
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-6">Select Namespace Identifier</h1>

      <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4 mb-6">
        <p className="text-sm text-orange-300">
          ⚠️ <strong>SIMULATION ONLY</strong> — This identifier is not reserved. 
          Availability in Practice Mode does not guarantee real availability.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tier Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Rarity Tier</label>
          <div className="grid grid-cols-2 gap-3">
            {tiers.map((t) => (
              <button
                key={t.name}
                onClick={() => setTier(t.name)}
                className={`p-4 rounded-lg border-2 transition ${
                  tier === t.name
                    ? 'border-orange-500 bg-orange-900/20'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className={`font-bold ${t.color}`}>{t.name}</div>
                <div className="text-xs text-gray-500 mt-1">Supply: {t.supply}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Identifier Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Namespace Identifier
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value.toLowerCase());
                setIsAvailable(null);
              }}
              placeholder="example"
              className="flex-1 px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
              maxLength={32}
              disabled={isChecking}
            />
            <button
              onClick={handleCheckAvailability}
              disabled={isChecking || !identifier}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold transition"
            >
              {isChecking ? 'Checking...' : 'Check'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Format: <code className="bg-black px-1 rounded">{identifier || 'your-id'}.x</code> 
            {' '}(1-32 characters, alphanumeric, -, _)
          </p>
        </div>

        {/* Availability Result */}
        {isAvailable !== null && (
          <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <p className="font-bold text-green-400">
                  {identifier}.x is available (SIMULATION)
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  In real issuance, this identifier may already be taken.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Continue Button */}
        {isAvailable && (
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold text-lg transition"
          >
            Continue → View Certificate
          </button>
        )}
      </div>
    </div>
  );
}
