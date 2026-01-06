'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PracticeBanner from '@/components/practice/PracticeBanner';
import { getPublicApiBase } from '@/lib/publicApiBase';

interface CompletionData {
  completion_token: string;
  completed_at: string;
  email: string;
  selected_identifier: string | null;
  selected_tier: string | null;
}

function CompletionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const completionToken = searchParams.get('token');

  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompletionData();
  }, [completionToken]);

  const loadCompletionData = async () => {
    if (!completionToken) {
      setError('Missing completion token');
      setIsLoading(false);
      return;
    }

    try {
      const apiBase = getPublicApiBase();
      const response = await fetch(
        `${apiBase}/api/practice/completion/${completionToken}`
      );

      if (!response.ok) {
        throw new Error('Completion token not found or invalid');
      }

      const data = await response.json();
      setCompletionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load completion data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PracticeBanner />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-6"></div>
          <p className="text-gray-400">Loading completion data...</p>
        </div>
      </div>
    );
  }

  if (error || !completionData) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PracticeBanner />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-red-300">Error</h2>
              <p className="text-gray-300 mb-6">{error || 'Failed to load completion data'}</p>
              <button
                onClick={() => router.push('/practice')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Return to Practice Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PracticeBanner />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <span className="text-8xl mb-6 block">✅</span>
            <h1 className="text-5xl font-bold mb-4">Practice Mode Complete</h1>
            <p className="text-2xl text-gray-300">
              You have successfully completed the mandatory education flow
            </p>
          </div>

          {/* Completion Token Display */}
          <div className="bg-gray-800 rounded-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Completion Details</h2>
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Completion Token (Non-Transferable)</p>
                  <p className="text-lg font-mono text-white break-all">{completionData.completion_token}</p>
                </div>
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Completed At</p>
                  <p className="text-lg text-white">{new Date(completionData.completed_at).toLocaleString()}</p>
                </div>
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-lg text-white">{completionData.email}</p>
                </div>
                {completionData.selected_identifier && (
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Practice Identifier (SIMULATION ONLY)</p>
                    <p className="text-lg text-white">
                      {completionData.selected_identifier}.x
                      {completionData.selected_tier && (
                        <span className="ml-3 text-sm text-gray-500">({completionData.selected_tier})</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-300">Confirmation Email Sent</h3>
              <p className="text-gray-400">
                A confirmation email has been sent to <strong className="text-white">{completionData.email}</strong> with 
                a record of your Practice Mode completion. Please check your inbox.
              </p>
            </div>
          </div>

          {/* Critical Disclaimers */}
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-red-300">⚠️ Important: What This Completion Does NOT Do</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="text-red-400 mt-1 text-xl">✗</span>
                <span><strong>Does NOT reserve any identifier</strong> — The practice identifier is not held for you and may be claimed by others during real issuance</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-400 mt-1 text-xl">✗</span>
                <span><strong>Does NOT guarantee access to real issuance</strong> — Completion is educational only and creates no entitlement</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-400 mt-1 text-xl">✗</span>
                <span><strong>Does NOT create a real certificate</strong> — All practice certificates are mock data with simulation flags</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-400 mt-1 text-xl">✗</span>
                <span><strong>Creates no obligation</strong> — Protocol operators are not required to provide you with anything based on this completion</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-400 mt-1 text-xl">✗</span>
                <span><strong>Has no monetary value</strong> — This completion token cannot be sold, transferred, or exchanged</span>
              </li>
            </ul>
          </div>

          {/* What It Does Do */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">✓ What This Completion Confirms</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="text-blue-400 mt-1">✓</span>
                <span>You have completed the mandatory education about protocol permanence and finality</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-400 mt-1">✓</span>
                <span>You understand that real certificates are permanent, immutable, and non-transferable</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-400 mt-1">✓</span>
                <span>You passed the mandatory quiz with 100% accuracy</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-400 mt-1">✓</span>
                <span>You have a record of completing Practice Mode for your own reference</span>
              </li>
            </ul>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Return to Home
            </button>
          </div>

          {/* Genesis Reminder */}
          <div className="text-center text-gray-500 text-sm">
            <p>Genesis Finalization: January 15, 2026 00:00:00 UTC</p>
            <p>After Genesis, no new certificates can ever be issued</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PracticeCompletionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white">
        <PracticeBanner />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-6"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CompletionContent />
    </Suspense>
  );
}
