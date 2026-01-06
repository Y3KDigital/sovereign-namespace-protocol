// Practice Mode - Entry Gate (Screen 0)
// Path: /practice
// Purpose: Entry point for mandatory educational simulation

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PracticeBanner from '@/components/practice/PracticeBanner';
import { getPublicApiBase } from '@/lib/publicApiBase';

export default function PracticeEntryPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [acknowledgement, setAcknowledgement] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !acknowledgement) {
      setError('Please provide email and acknowledge this is a simulation.');
      return;
    }

    setIsLoading(true);

    try {
      const apiBase = getPublicApiBase();
      const response = await fetch(`${apiBase}/api/practice/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, acknowledgement }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start practice session');
      }

      // Show success message
      setError(null);
      alert(`Verification email sent to ${email}. Please check your inbox.`);
      
      // Note: User will click verification link in email, no redirect here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <PracticeBanner />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Practice Mode</h1>
            <p className="text-xl text-gray-400">
              Mandatory Educational Simulation
            </p>
          </div>

          {/* Warning Card */}
          <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">
              🔶 Before You Begin
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>This is a <strong>simulation</strong>. No real certificates will be issued.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You must complete all steps to understand the protocol.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>A passing score on the quiz (100%) is required.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Completion of Practice Mode does not guarantee real issuance eligibility.</span>
              </li>
            </ul>
          </div>

          {/* Entry Form */}
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-8">
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-2">
                You will receive a verification link to begin the simulation.
              </p>
            </div>

            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgement}
                  onChange={(e) => setAcknowledgement(e.target.checked)}
                  className="mt-1 mr-3 h-4 w-4"
                  required
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-300">
                  I understand this is a <strong>simulation only</strong>. No real certificates, 
                  keys, or IPFS uploads will occur. This is for educational purposes to understand 
                  the protocol before real issuance.
                </span>
              </label>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-600 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !acknowledgement}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition"
            >
              {isLoading ? 'Starting...' : 'Begin Practice Mode'}
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Genesis finalization: 2026-01-15 00:00:00 UTC (12 days remaining)
          </p>
        </div>
      </div>
    </div>
  );
}
