// Practice Mode - Session Flow (Screens 1-9)
// Path: /practice/session?token={session_token}
// Purpose: Main practice mode flow controller

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PracticeBanner from '@/components/practice/PracticeBanner';
import PurposeScreen from '@/components/practice/screens/PurposeScreen';
import OverviewScreen from '@/components/practice/screens/OverviewScreen';
import IdentifierScreen from '@/components/practice/screens/IdentifierScreen';
import CertificateScreen from '@/components/practice/screens/CertificateScreen';
import VerificationScreen from '@/components/practice/screens/VerificationScreen';
import FinalityScreen from '@/components/practice/screens/FinalityScreen';
import QuizScreen from '@/components/practice/screens/QuizScreen';
import CompletionGateScreen from '@/components/practice/screens/CompletionGateScreen';

interface PracticeSession {
  id: string;
  email: string;
  session_token: string;
  started_at: string;
  completed_at: string | null;
  quiz_score: number | null;
  quiz_attempts: number;
  selected_tier: string | null;
  selected_identifier: string | null;
  mock_certificate_json: string | null;
  completion_token: string | null;
  verified_email: boolean;
}

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get('token');

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, [sessionToken]);

  const loadSession = async () => {
    if (!sessionToken) {
      setError('Missing session token');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/practice/session/${sessionToken}`
      );

      if (!response.ok) {
        throw new Error('Session not found or expired');
      }

      const data = await response.json();
      setSession(data);

      // Determine current screen based on session state
      if (!data.verified_email) {
        router.push('/practice');
        return;
      }

      if (data.completed_at) {
        router.push(`/practice/completion?token=${data.completion_token}`);
        return;
      }

      // Set screen based on progress
      if (!data.selected_identifier) {
        setCurrentScreen(1); // Start at Purpose
      } else if (!data.mock_certificate_json) {
        setCurrentScreen(3); // Certificate screen
      } else if (data.quiz_score === null || data.quiz_score === undefined) {
        setCurrentScreen(5); // Verification Demo (start quiz flow)
      } else if (data.quiz_score < 7) {
        setCurrentScreen(7); // Quiz (failed, needs retry)
      } else {
        setCurrentScreen(8); // Completion gate (passed)
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentScreen < 9) {
      setCurrentScreen(currentScreen + 1);
      loadSession(); // Refresh session state
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PracticeBanner />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session || !sessionToken) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PracticeBanner />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-2xl font-bold mb-4 text-red-400">Session Error</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/practice')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold"
            >
              Start New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PracticeBanner />

      {/* Progress Bar */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Screen {currentScreen} of 9
            </span>
            <span className="text-gray-600">
              Session: {sessionToken.substring(0, 8)}...
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
            <progress
              className="y3k-progress"
              value={currentScreen}
              max={9}
              aria-label="Session progress"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {currentScreen === 1 && <PurposeScreen onNext={handleNext} />}
          {currentScreen === 2 && <OverviewScreen onNext={handleNext} />}
          {currentScreen === 3 && (
            <IdentifierScreen
              sessionToken={sessionToken}
              session={session}
              onNext={handleNext}
            />
          )}
          {currentScreen === 4 && (
            <CertificateScreen
              sessionToken={sessionToken}
              session={session}
              onNext={handleNext}
            />
          )}
          {currentScreen === 5 && (
            <VerificationScreen
              onNext={handleNext}
            />
          )}
          {currentScreen === 6 && (
            <FinalityScreen
              onNext={handleNext}
            />
          )}
          {currentScreen === 7 && (
            <QuizScreen
              sessionToken={sessionToken}
              onNext={handleNext}
            />
          )}
          {currentScreen === 8 && (
            <CompletionGateScreen
              sessionToken={sessionToken}
              session={session}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PracticeSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white">
        <PracticeBanner />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
