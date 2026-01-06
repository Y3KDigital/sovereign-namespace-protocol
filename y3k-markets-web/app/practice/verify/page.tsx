// Practice Mode - Email Verification (Screen 1)
// Path: /practice/verify?token={verification_token}
// Purpose: Verify email and redirect to session

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PracticeBanner from '@/components/practice/PracticeBanner';
import { getPublicApiBase } from '@/lib/publicApiBase';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Missing verification token');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const apiBase = getPublicApiBase();
      const response = await fetch(
        `${apiBase}/api/practice/verify-email?token=${token}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setSessionToken(data.session_token);
      setStatus('success');

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.push(`/practice/session?token=${data.session_token}`);
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <PracticeBanner />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold mb-4">Verifying Email...</h1>
              <p className="text-gray-400">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-2xl font-bold mb-4 text-green-400">Email Verified!</h1>
              <p className="text-gray-400 mb-6">
                Redirecting to Practice Mode session...
              </p>
              {sessionToken && (
                <p className="text-sm text-gray-600">
                  Session: {sessionToken.substring(0, 8)}...
                </p>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="text-6xl mb-6">❌</div>
              <h1 className="text-2xl font-bold mb-4 text-red-400">Verification Failed</h1>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="font-bold mb-4">Possible reasons:</h2>
                <ul className="text-left space-y-2 text-gray-400 text-sm">
                  <li>• Verification link expired (1 hour limit)</li>
                  <li>• Link already used</li>
                  <li>• Invalid token</li>
                </ul>
              </div>
              <button
                onClick={() => router.push('/practice')}
                className="mt-8 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold"
              >
                Start New Practice Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PracticeVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white">
        <PracticeBanner />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
