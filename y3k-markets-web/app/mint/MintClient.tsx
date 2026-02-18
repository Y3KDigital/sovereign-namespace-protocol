"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_live_51T29nh1OEzphv6FLsoRg4yMypc4eskdoSGXSwMgnLxbAB1ptZm4YQ1uZnekR3peDHSvLW8sTOa5Fh3062yVbU96j00gtK152kK"
);

// ── Inner card form (needs to be inside <Elements>) ──────
function StripeCardForm({ root, onSuccess, onError }: {
  root: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/mint/success?stripe=1&root=${root}`,
      },
    });

    if (error) {
      onError(error.message || "Payment failed");
      setPaying(false);
    }
    // on success Stripe redirects to return_url automatically
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || paying}
        className="w-full px-4 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition disabled:opacity-50 font-bold text-lg"
      >
        {paying ? "Processing…" : "Pay $29 by Card"}
      </button>
    </form>
  );
}

export default function MintClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const presetNamespace = (searchParams.get("namespace") || "").trim() || "";
  
  const [namespace, setNamespace] = useState(presetNamespace);
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH" | "USDC" | "USDT" | "CARD">("CARD");
  const [error, setError] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [stage, setStage] = useState<"input" | "payment">("input");
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeRoot, setStripeRoot] = useState<number | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Allow clearing
    if (val === "") {
        setNamespace("");
        setError("");
        return;
    }

    // Numbers-only validation: Three-digit numbers 100-999 only
    if (/^[0-9]{0,3}$/.test(val)) {
        setNamespace(val);
        // Validate range if complete
        if (val.length === 3) {
          const num = parseInt(val, 10);
          if (num < 100 || num > 999) {
            setError("Invalid root. Use a three-digit number between 100 and 999.");
          } else {
            setError("");
          }
        } else {
          setError("");
        }
    } else {
        setError("Numbers only (100–999).");
    }
  };

  const createPaymentIntent = async () => {
    if (!namespace || namespace.length !== 3) {
      setError("Please enter a valid 3-digit root (100-999)");
      return;
    }

    const num = parseInt(namespace, 10);
    if (num < 100 || num > 999) {
      setError("Root must be between 100 and 999");
      return;
    }

    setIsCreatingPayment(true);
    setError("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

    try {
      if (selectedAsset === 'CARD') {
        // ── Stripe card flow ────────────────────────────
        const response = await fetch(`${apiUrl}/api/stripe/create-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ root: num }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Failed to create payment');
          setIsCreatingPayment(false);
          return;
        }
        setStripeClientSecret(data.client_secret);
        setStripeRoot(num);
        setStage('payment');
        setIsCreatingPayment(false);
        return;
      }

      // ── Crypto flow (existing) ──────────────────────
      const response = await fetch(`${apiUrl}/api/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ root: num, asset: selectedAsset }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create payment');
        setIsCreatingPayment(false);
        return;
      }

      router.push(`/mint/success?payment_id=${data.payment_id}`);

    } catch (err) {
      console.error('Payment creation error:', err);
      setError('Network error. Please try again.');
      setIsCreatingPayment(false);
    }
  };

  // Ed25519 Key Generation happens client-side after payment confirmation
  // Keys are generated in /mint/success page using window.crypto.getRandomValues
  // This ensures payment is verified before namespace is claimed

  return (
    <main className="min-h-screen pt-16">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-8">
              <Link href="/" className="hover:text-purple-400 transition">Home</Link>
              <Link href="/trust" className="hover:text-purple-400 transition">Trust</Link>
              <Link href="/status" className="hover:text-purple-400 transition">Status</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">$29 Genesis Registration</h1>
          <p className="text-xl text-gray-300 mb-2">
            <span className="text-green-400 font-bold">One-Time Genesis Ceremony.</span> <span className="text-purple-400 font-bold">No Renewals.</span> <span className="text-blue-400 font-bold">No Intermediaries.</span>
          </p>
          <p className="text-gray-400">
            Permanent cryptographic root from the January 16, 2026 genesis event. Created once. Cannot be recreated.
          </p>
          <p className="text-sm text-blue-300 mt-2 font-semibold">
            Available now: 900 numeric Genesis Roots (100–999).
          </p>
        </div>

        {/* --- STAGE 2: STRIPE CARD PAYMENT --- */}
        {stage === "payment" && stripeClientSecret && stripeRoot !== null && (
          <div className="bg-white/5 border border-violet-500/30 rounded-xl p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-violet-300 mb-1">💳 Secure Card Payment</h2>
              <p className="text-sm text-gray-400">Genesis Root <span className="text-white font-bold">#{stripeRoot}</span> · $29.00 USD · Powered by Stripe</p>
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: stripeClientSecret,
                appearance: {
                  theme: 'night',
                  variables: { colorPrimary: '#7c3aed', borderRadius: '8px' },
                },
              }}
            >
              <StripeCardForm
                root={stripeRoot}
                onSuccess={() => {}}
                onError={(msg) => { setError(msg); setStage('input'); }}
              />
            </Elements>
            <button
              onClick={() => { setStage('input'); setStripeClientSecret(null); }}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 underline"
            >
              ← Back / Change root
            </button>
          </div>
        )}

        {/* --- STAGE 1: INPUT --- */}
        {stage === "input" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="grid gap-6">
              
              {!namespace && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-200 text-sm">
                  💡 <strong>Genesis Roots are numeric only.</strong> Three digits (100–999). Alphabetical roots are not available.
                </div>
              )}

              <label className="grid gap-2">
                <span className="text-sm text-gray-300 font-medium">Choose Your Root</span>
                <div className="relative">
                  <input
                    value={namespace}
                    onChange={handleInput}
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    className={`w-full bg-black/40 border ${error ? 'border-red-500' : 'border-white/10 focus:border-purple-500'} rounded-lg px-4 py-4 font-mono text-2xl transition outline-none`}
                    placeholder="Enter a number (100–999)"
                    disabled={isCreatingPayment}
                  />
                  {!error && namespace && namespace.length === 3 && !isCreatingPayment && <div className="absolute right-4 top-5 text-green-400 font-bold">AVAILABLE</div>}
                  {error && <div className="absolute right-4 top-5 text-red-400 font-bold">INVALID</div>}
                </div>
                {error ? (
                    <span className="text-xs text-red-400 font-bold animate-pulse">{error}</span>
                ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Genesis Roots are numeric identifiers from 100–999, created once at genesis and owned permanently.
                      </span>
                    </div>
                )}
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-gray-300 font-medium">Payment Method</span>
                <div className="grid grid-cols-5 gap-2">
                  {/* Card first — easiest for most buyers */}
                  <button
                    type="button"
                    disabled={isCreatingPayment}
                    onClick={() => setSelectedAsset('CARD')}
                    className={`py-3 px-2 rounded-lg font-semibold text-sm transition col-span-1 ${
                      selectedAsset === 'CARD'
                        ? 'bg-violet-600 text-white ring-2 ring-violet-400'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    } ${isCreatingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    💳 Card
                  </button>
                  {(['BTC', 'ETH', 'USDC', 'USDT'] as const).map((asset) => (
                    <button
                      key={asset}
                      type="button"
                      disabled={isCreatingPayment}
                      onClick={() => setSelectedAsset(asset)}
                      className={`py-3 px-2 rounded-lg font-semibold text-sm transition ${
                        selectedAsset === asset
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      } ${isCreatingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
                {selectedAsset === 'CARD' && (
                  <p className="text-xs text-violet-300 mt-1">Visa, Mastercard, Amex — powered by Stripe. No account required.</p>
                )}
              </label>

              <button
                onClick={createPaymentIntent}
                disabled={!namespace || !!error || namespace.length !== 3 || isCreatingPayment}
                className={`w-full px-4 py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${
                  selectedAsset === 'CARD'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:shadow-violet-500/20'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-green-500/20'
                }`}
              >
                {isCreatingPayment ? (
                  <>
                    <span className="animate-spin">⏳</span> {selectedAsset === 'CARD' ? 'Loading Checkout...' : 'Creating Payment...'}
                  </>
                ) : (
                  <>
                    <span>{selectedAsset === 'CARD' ? '💳' : '🔗'}</span>
                    {selectedAsset === 'CARD' ? 'Pay $29 by Card' : 'Continue to Crypto Payment'}
                  </>
                )}
              </button>
              
              <div className="text-center text-xs text-gray-500">
                Keys are generated after payment confirmation. You maintain full control.
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center mt-6 text-[10px] text-slate-600 font-mono space-y-0.5">
          <div>v2.1.1 Sovereign</div>
          <div className="text-[9px] text-slate-700">Build: Jan 22, 2026 • Hash: 71fb75f</div>
        </div>
      </div>
    </main>
  );
}