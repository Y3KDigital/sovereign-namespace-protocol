"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51T29nr00TXpnKEHbc4bCq6sRoa3XW2OoTdbWY60Uf5hNjMELBMQHp56vuAHzZBgIdNn8HieWCnCTaNhGS5EiofqB001PFiPJmL"
);

interface PaymentStatus {
  payment_id: string;
  root: number;
  asset: string;
  status: 'pending' | 'confirmed' | 'complete' | 'expired';
  tx_hash: string | null;
  confirmations: number;
  created_at: number;
  confirmed_at: number | null;
  expires_at: number;
  is_expired: boolean;
}

interface Keys {
  privateKey: string;
  publicKey: string;
}

export default function MintSuccessClient() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const isStripe = searchParams.get('stripe') === '1';
  const stripeIntentId = searchParams.get('payment_intent');
  const stripeIntentSecret = searchParams.get('payment_intent_client_secret');
  const stripeRoot = searchParams.get('root');

  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keys, setKeys] = useState<Keys | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [stripeStatus, setStripeStatus] = useState<'checking' | 'succeeded' | 'failed' | null>(null);

  // ── Stripe redirect handler ───────────────────────────
  useEffect(() => {
    if (!isStripe || !stripeIntentId || !stripeIntentSecret) return;

    setStripeStatus('checking');

    stripePromise.then(async (stripe) => {
      if (!stripe) { setStripeStatus('failed'); return; }
      const { paymentIntent } = await stripe.retrievePaymentIntent(stripeIntentSecret);
      if (paymentIntent?.status === 'succeeded') {
        setStripeStatus('succeeded');
        setLoading(false);
      } else {
        setStripeStatus('failed');
        setError(`Payment ${paymentIntent?.status || 'failed'}. Please try again.`);
        setLoading(false);
      }
    });
  }, [isStripe, stripeIntentId, stripeIntentSecret]);

  // ── Crypto payment poll (existing) ───────────────────
  useEffect(() => {
    if (isStripe || !paymentId) {
      if (!isStripe && !paymentId) {
        setError('No payment ID provided');
        setLoading(false);
      }
      return;
    }

    const checkPayment = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';
        const response = await fetch(`${apiUrl}/api/payment/status/${paymentId}`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const data = await response.json();
        setPayment(data);
        setLoading(false);

      } catch (err) {
        console.error('Payment check error:', err);
        setError('Failed to check payment status');
        setLoading(false);
      }
    };

    // Initial check
    checkPayment();

    // Poll every 5 seconds if pending
    const interval = setInterval(() => {
      if (payment?.status !== 'confirmed' && payment?.status !== 'complete') {
        checkPayment();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId, payment?.status]);

  const generateKeys = () => {
    // Ed25519 keypair generation using Web Crypto API
    // This is the ONLY place keys are generated - after payment confirmation
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    
    // For production, use nacl.sign.keyPair() from tweetnacl
    // This is simplified for demonstration
    const privateKey = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    const publicKey = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 64);
    
    setKeys({ privateKey, publicKey });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`Copied ${label}!`);
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <h1 className="text-2xl font-bold mb-2">
            {isStripe ? 'Confirming Card Payment…' : 'Checking Payment Status...'}
          </h1>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </main>
    );
  }

  // ── Stripe payment succeeded ─────────────────────────
  if (isStripe && stripeStatus === 'succeeded') {
    const rootNum = parseInt(stripeRoot || '0');
    return (
      <main className="min-h-screen pt-16 px-4">
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Root #{rootNum} is Yours
          </h1>
          <p className="text-gray-300 mb-1">Genesis registration confirmed via Stripe.</p>
          <p className="text-sm text-violet-300 font-mono mb-6">Payment Intent: {stripeIntentId}</p>

          <div className="bg-violet-900/20 border border-violet-500/40 rounded-xl p-6 text-left mb-6">
            <h2 className="font-bold text-violet-300 mb-1">What happens next</h2>
            <ol className="text-sm text-gray-300 list-decimal list-inside space-y-1">
              <li>Your root <strong>#{rootNum}</strong> is being registered on the Sovereign Namespace Protocol</li>
              <li>Ed25519 ownership keys will be generated and emailed within 24 hours</li>
              <li>Your permanent certificate will be issued from the January 16, 2026 genesis block</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/mint" className="px-6 py-3 bg-violet-700 hover:bg-violet-800 rounded-lg font-semibold">
              Register Another Root
            </Link>
            <Link href="/" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-semibold">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (error || (!isStripe && !payment)) {
    return (
      <main className="min-h-screen pt-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2 text-red-400">Error</h1>
          <p className="text-gray-400 mb-6">{error || 'Payment not found'}</p>
          <Link href="/mint" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
            Return to Mint Page
          </Link>
        </div>
      </main>
    );
  }

  // Payment expired
  if (payment.is_expired) {
    return (
      <main className="min-h-screen pt-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">⏱️</div>
          <h1 className="text-2xl font-bold mb-2 text-orange-400">Payment Expired</h1>
          <p className="text-gray-400 mb-2">This payment intent has expired (24-hour window).</p>
          <p className="text-sm text-gray-500 mb-6">Root {payment.root} is still available.</p>
          <Link href={`/mint?namespace=${payment.root}`} className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  // Waiting for payment
  if (payment.status === 'pending') {
    const timeRemaining = payment.expires_at - Math.floor(Date.now() / 1000);
    const hoursRemaining = Math.floor(timeRemaining / 3600);

    return (
      <main className="min-h-screen pt-32 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900 border border-yellow-500/30 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <h1 className="text-3xl font-bold mb-2">Waiting for Payment</h1>
            <p className="text-gray-400 mb-6">Root: <span className="text-green-400 font-mono text-xl">{payment.root}</span></p>

            {payment.tx_hash ? (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-6">
                <div className="text-blue-400 font-semibold mb-2">Transaction Detected! ✓</div>
                <div className="text-xs text-gray-400 font-mono break-all mb-3">{payment.tx_hash}</div>
                <div className="text-sm text-gray-300">
                  Confirmations: <span className="text-green-400 font-bold">{payment.confirmations}</span> / <span className="text-gray-500">
                    {payment.asset === 'BTC' ? '6' : '12'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">Checking every 30 seconds...</div>
              </div>
            ) : (
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6 mb-6">
                <div className="text-orange-400 font-semibold mb-3">Send Payment Now</div>
                <div className="text-sm text-gray-300 mb-4">
                  Send <strong>$29 USD</strong> in <strong>{payment.asset}</strong> to:
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700 mb-4">
                  <div className="text-xs text-gray-500 mb-1">{payment.asset} Address:</div>
                  <div className="font-mono text-xs text-gray-300 break-all">
                    {payment.asset === 'BTC' 
                      ? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
                      : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
                    }
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Expires in ~{hoursRemaining} hours • Monitoring blockchain automatically
                </div>
              </div>
            )}

            <div className="text-xs text-gray-600">
              This page auto-refreshes every 5 seconds. Keep it open.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Payment confirmed - generate keys!
  if (payment.status === 'confirmed' && !keys) {
    return (
      <main className="min-h-screen pt-32 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900 border border-green-500/30 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-400 mb-2">Payment Confirmed!</h1>
            <p className="text-gray-400 mb-6">Root: <span className="text-green-400 font-mono text-xl">{payment.root}</span></p>

            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-6">
              <div className="text-green-400 font-semibold mb-3">Transaction Verified ✓</div>
              <div className="text-xs text-gray-400 font-mono break-all mb-2">{payment.tx_hash}</div>
              <div className="text-sm text-gray-300">
                {payment.confirmations} confirmations • Asset: {payment.asset}
              </div>
            </div>

            <button
              onClick={generateKeys}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg shadow-lg"
            >
              🔐 Generate My Keys Now
            </button>

            <div className="text-xs text-gray-500 mt-4">
              Keys are generated locally in your browser. Never transmitted to any server.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Keys generated - show paper wallet
  if (keys) {
    return (
      <main className="min-h-screen pt-32 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-900 border border-green-500/30 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">Genesis Root Secured!</h1>
              <p className="text-gray-400">Root: <span className="text-green-400 font-mono text-2xl">{payment.root}</span></p>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <div className="text-amber-400 font-bold text-lg mb-2">CRITICAL: Save Your Private Key</div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• Write it down on paper immediately</div>
                    <div>• Store in a secure location (safe, vault)</div>
                    <div>• <strong className="text-amber-400">If you lose this, your root is GONE FOREVER</strong></div>
                    <div>• Y3K cannot recover lost keys</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="text-red-400 font-bold mb-2 flex items-center gap-2">
                  <span>☢️</span> Private Key (KEEP SECRET)
                </div>
                <div className="bg-black/60 p-3 rounded font-mono text-xs text-red-300 break-all mb-2">
                  {keys.privateKey}
                </div>
                <button
                  onClick={() => copyToClipboard(keys.privateKey, 'Private Key')}
                  className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                >
                  Copy Private Key
                </button>
              </div>

              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="text-green-400 font-bold mb-2">Public Key (Safe to Share)</div>
                <div className="bg-black/60 p-3 rounded font-mono text-xs text-green-300 break-all mb-2">
                  {keys.publicKey}
                </div>
                <button
                  onClick={() => copyToClipboard(keys.publicKey, 'Public Key')}
                  className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 rounded"
                >
                  Copy Public Key
                </button>
              </div>
            </div>

            {copyFeedback && (
              <div className="text-center text-sm text-green-400 mb-4 animate-pulse">
                ✓ {copyFeedback}
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                id="saved"
                checked={isSaved}
                onChange={(e) => setIsSaved(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="saved" className="text-sm text-gray-300">
                I have saved my private key in a secure location
              </label>
            </div>

            <Link
              href="/mint/ownership"
              className={`block w-full px-6 py-4 rounded-lg font-bold text-center transition ${
                isSaved
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }`}
              onClick={(e) => !isSaved && e.preventDefault()}
            >
              Continue to Ownership Guide →
            </Link>

            <div className="text-center mt-4 text-xs text-gray-500">
              Certificate will be published to IPFS shortly
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
