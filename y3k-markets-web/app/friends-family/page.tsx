'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FriendsFamilyPortal() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!agreedToTerms) {
      setError('You must acknowledge the disclaimers to continue');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/friends-family/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        // Store access code in session
        sessionStorage.setItem('ff_access_code', accessCode.trim().toUpperCase());
        sessionStorage.setItem('ff_access_granted', 'true');
        sessionStorage.setItem('ff_access_time', Date.now().toString());
        
        // Redirect to minting page
        router.push('/mint?genesis_founder=true');
      } else {
        setError(data.error || 'Invalid access code. Please check your invitation email.');
      }
    } catch (err) {
      setError('Error validating access code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 mb-6">
            <span className="text-yellow-400 text-sm font-semibold">GENESIS FOUNDERS • FIRST 100</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Friends & Family Early Access
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Welcome to the Genesis Founders program. Enter your invitation code to access early claiming.
          </p>
        </div>

        {/* Critical Disclaimers */}
        <div className="bg-red-950/30 border-2 border-red-500/50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-red-400 text-3xl">⚠️</div>
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-3">This is NOT an Investment</h3>
              <ul className="space-y-2 text-red-200 text-sm">
                <li>❌ NO promised returns, profits, or yield</li>
                <li>❌ NO guaranteed future value or appreciation</li>
                <li>❌ NO buyback guarantees or revenue sharing</li>
                <li>✅ Digital collectible with potential utility only</li>
                <li>✅ Value may go DOWN or become ZERO</li>
                <li>✅ Purchase ONLY what you can afford to lose</li>
              </ul>
              <p className="mt-4 text-red-300 font-semibold">
                Purchase only if you're interested in the technology and collectibility, NOT for financial gain.
              </p>
            </div>
          </div>
        </div>

        {/* Program Benefits */}
        <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Genesis Founders Benefits</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <h4 className="font-semibold text-purple-200">24-Hour Early Access</h4>
                <p className="text-sm text-gray-400">Claim before public (after genesis completes)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h4 className="font-semibold text-purple-200">Genesis Founder Badge</h4>
                <p className="text-sm text-gray-400">Certificate includes founder status</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold text-purple-200">First Pick</h4>
                <p className="text-sm text-gray-400">Lower competition for best namespaces</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💎</span>
              <div>
                <h4 className="font-semibold text-purple-200">Same Pricing</h4>
                <p className="text-sm text-gray-400">Fair pricing = no preferential treatment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Code Form */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Enter Your Invitation Code</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-300 mb-2">
                Access Code
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="GENESIS-XXXX-XXXX"
                className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                required
                maxLength={20}
              />
              <p className="mt-2 text-sm text-gray-400">
                Check your invitation email for your unique access code
              </p>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-black text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">
                  I understand that Y3K namespaces are digital collectibles with potential utility, 
                  NOT investment securities. I acknowledge NO promises about future value, returns, 
                  or profits have been made. I am purchasing because I'm interested in the technology 
                  and collectibility. I have read and agree to the{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">
                    Terms & Conditions
                  </Link>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 text-lg"
            >
              {loading ? 'Validating...' : 'Continue to Claiming'}
            </button>
          </form>
        </div>

        {/* Timeline */}
        <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-400">6:00 PM EST</div>
              <div className="flex-1 h-px bg-gray-700"></div>
              <div className="text-gray-300">Genesis Ceremony Begins</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-400">~8:00 PM EST</div>
              <div className="flex-1 h-px bg-purple-500/30"></div>
              <div className="text-purple-300 font-semibold">Friends & Family Access Opens</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-400">+24 hours</div>
              <div className="flex-1 h-px bg-gray-700"></div>
              <div className="text-gray-300">Public Claiming Opens</div>
            </div>
          </div>
        </div>

        {/* Documentation Reference */}
        <div className="text-center">
          <Link 
            href="/docs"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>View Documentation</span>
            <span>→</span>
          </Link>
        </div>

        {/* Support */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Questions? Email: <a href="mailto:support@y3kdigital.com" className="text-purple-400 hover:text-purple-300">support@y3kdigital.com</a></p>
          <p className="mt-2">Lost your access code? Check your invitation email or contact support.</p>
        </div>
      </div>
    </main>
  );
}
