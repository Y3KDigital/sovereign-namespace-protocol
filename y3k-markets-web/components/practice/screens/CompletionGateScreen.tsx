'use client';

import { useState } from 'react';
import { getPublicApiBase } from '@/lib/publicApiBase';

interface CompletionGateScreenProps {
  sessionToken: string;
  session: {
    email: string;
  };
}

const REQUIRED_PHRASE = "I understand this is permanent and cannot be reversed.";

export default function CompletionGateScreen({ sessionToken, session }: CompletionGateScreenProps) {
  const [typedPhrase, setTypedPhrase] = useState('');
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [acknowledgementChecked, setAcknowledgementChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate phrase (EXACT match, case-sensitive)
    if (typedPhrase !== REQUIRED_PHRASE) {
      setError('The phrase must match exactly (case-sensitive): "I understand this is permanent and cannot be reversed."');
      return;
    }

    // Validate email re-confirmation
    if (emailConfirmation !== session.email) {
      setError('Email confirmation does not match your session email');
      return;
    }

    // Validate acknowledgement checkbox
    if (!acknowledgementChecked) {
      setError('You must acknowledge that you understand the permanence');
      return;
    }

    try {
      setIsSubmitting(true);

      const apiBase = getPublicApiBase();

      const response = await fetch(
        `${apiBase}/api/practice/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_token: sessionToken,
            typed_phrase: typedPhrase,
            email_confirmation: emailConfirmation,
            acknowledgement_checked: acknowledgementChecked,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete practice mode');
      }

      const data = await response.json();

      // Redirect to completion page
      window.location.href = `/practice/completion?token=${data.completion_token}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete practice mode');
    } finally {
      setIsSubmitting(false);
    }
  };

  const phraseMatches = typedPhrase === REQUIRED_PHRASE;
  const emailMatches = emailConfirmation === session.email;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Completion Gate</h1>
        <p className="text-xl text-gray-300">
          Final acknowledgment required to complete Practice Mode
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-gray-800 rounded-lg p-8 space-y-6">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-300">⚠️ Critical Understanding Required</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            You have completed the educational portion of Practice Mode. Before issuing your completion 
            token, you must confirm your understanding that <strong>real certificates are permanent, 
            immutable, and cannot be reversed</strong>.
          </p>
          <p className="text-gray-300 leading-relaxed">
            This completion does <strong>NOT</strong> reserve any identifier, guarantee access to real 
            issuance, or create a real certificate. It only confirms that you understand the protocol's 
            permanence and finality.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phrase Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Type the following phrase <strong>exactly</strong> (case-sensitive):
            </label>
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 mb-3">
              <p className="text-green-400 font-mono text-sm">
                {REQUIRED_PHRASE}
              </p>
            </div>
            <input
              type="text"
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                typedPhrase.length > 0
                  ? phraseMatches
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="Type the phrase exactly..."
              required
              disabled={isSubmitting}
            />
            {typedPhrase.length > 0 && (
              <p className={`text-sm mt-2 ${phraseMatches ? 'text-green-400' : 'text-red-400'}`}>
                {phraseMatches ? '✓ Phrase matches' : '✗ Phrase does not match (check capitalization and punctuation)'}
              </p>
            )}
          </div>

          {/* Email Re-confirmation */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Re-confirm your email address:
            </label>
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 mb-3">
              <p className="text-gray-400 text-sm">
                Your session email: <span className="text-white">{session.email}</span>
              </p>
            </div>
            <input
              type="email"
              value={emailConfirmation}
              onChange={(e) => setEmailConfirmation(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                emailConfirmation.length > 0
                  ? emailMatches
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="Re-type your email..."
              required
              disabled={isSubmitting}
            />
            {emailConfirmation.length > 0 && (
              <p className={`text-sm mt-2 ${emailMatches ? 'text-green-400' : 'text-red-400'}`}>
                {emailMatches ? '✓ Email matches' : '✗ Email does not match'}
              </p>
            )}
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgementChecked}
                onChange={(e) => setAcknowledgementChecked(e.target.checked)}
                className="mt-1"
                disabled={isSubmitting}
                required
              />
              <span className="text-sm text-gray-300">
                I acknowledge that completing Practice Mode <strong>does NOT reserve any identifier</strong>, 
                does NOT guarantee access to real issuance, and does NOT create a real certificate. 
                This is <strong>educational only</strong>.
              </span>
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !phraseMatches || !emailMatches || !acknowledgementChecked}
              className={`font-semibold py-3 px-8 rounded-lg transition-colors ${
                isSubmitting || !phraseMatches || !emailMatches || !acknowledgementChecked
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Practice Mode'}
            </button>
          </div>
        </form>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">What Happens Next</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">•</span>
              <span>You will receive a <strong>practice completion token</strong> (non-transferable)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">•</span>
              <span>A confirmation email will be sent to your address</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">•</span>
              <span>This token is for <strong>educational purposes only</strong> and has no value</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400">•</span>
              <span>Completion does NOT create any obligation or guarantee from protocol operators</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
