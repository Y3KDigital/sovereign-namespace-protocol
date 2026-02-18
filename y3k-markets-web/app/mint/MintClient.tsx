"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
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

const PREMIUM_ROOTS = new Set([833, 844, 855, 866, 877, 888]);
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://payments.y3kmarkets.com";

interface PriceData {
  root: number;
  priceDisplay: string;
  priceCents: number;
  mintedCount: number;
  isPremium: boolean;
  remaining: number;
  nextBracketAt: number;
  nextPriceDisplay: string;
}

// ── Stripe card form (must live inside <Elements>) ────────────────────────────
function StripeCardForm({
  root,
  priceDisplay,
  walletAddress,
  onError,
}: {
  root: number;
  priceDisplay: string;
  walletAddress: string;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);

    const returnUrl = new URL(`${window.location.origin}/mint/success`);
    returnUrl.searchParams.set("stripe", "1");
    returnUrl.searchParams.set("root", String(root));
    if (walletAddress.trim()) {
      returnUrl.searchParams.set("wallet", walletAddress.trim());
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl.toString() },
    });

    if (error) {
      onError(error.message || "Payment failed");
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || paying}
        className="w-full px-4 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition disabled:opacity-50 font-bold text-lg"
      >
        {paying ? "Processing…" : `Pay ${priceDisplay} by Card`}
      </button>
    </form>
  );
}

// ── Bonding curve progress bar ────────────────────────────────────────────────
function PriceBar({ data }: { data: PriceData }) {
  const total = 900;
  const sold = data.mintedCount;
  const pct = Math.round((sold / total) * 100);
  const toNextBracket = data.nextBracketAt - sold;

  return (
    <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-white text-lg">
          {data.isPremium && (
            <span className="text-yellow-400 mr-1">★</span>
          )}
          Root #{data.root}
          {data.isPremium && (
            <span className="ml-2 text-xs text-yellow-400 font-normal">
              Premium (toll-free area code)
            </span>
          )}
        </span>
        <span className="text-2xl font-bold text-green-400">
          {data.priceDisplay}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{sold} minted</span>
        <span>{total - sold} remaining</span>
      </div>

      {toNextBracket > 0 && (
        <p className="mt-2 text-xs text-yellow-300">
          Locked at {data.priceDisplay} for the next{" "}
          <span className="font-bold">{toNextBracket}</span> mints — then rises
          to {data.nextPriceDisplay}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MintClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const presetNamespace = (searchParams.get("namespace") || "").trim();

  const [namespace, setNamespace] = useState(presetNamespace);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<
    "BTC" | "ETH" | "USDC" | "USDT" | "CARD"
  >("CARD");
  const [error, setError] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [stage, setStage] = useState<"input" | "payment">("input");
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(
    null
  );
  const [stripeRoot, setStripeRoot] = useState<number | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // ── Fetch live price whenever valid root entered ─────────────────────────
  const fetchPrice = useCallback(async (root: number) => {
    setPriceLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/price/${root}`);
      if (res.ok) {
        const data = await res.json();
        setPriceData(data);
      }
    } catch {
      // silently fail — price display is cosmetic
    } finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (namespace.length === 3) {
      const num = parseInt(namespace, 10);
      if (num >= 100 && num <= 999) {
        fetchPrice(num);
        return;
      }
    }
    setPriceData(null);
  }, [namespace, fetchPrice]);

  // ── Root input handler ───────────────────────────────────────────────────
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setNamespace("");
      setError("");
      return;
    }
    if (/^[0-9]{0,3}$/.test(val)) {
      setNamespace(val);
      if (val.length === 3) {
        const num = parseInt(val, 10);
        if (num < 100 || num > 999) {
          setError("Invalid root. Use 100–999.");
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

  // ── Wallet validation ────────────────────────────────────────────────────
  const handleWalletInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setWalletAddress(val);
    if (val && !/^0x[0-9a-fA-F]{40}$/.test(val)) {
      setWalletError("Must be a valid Ethereum/Polygon address (0x…)");
    } else {
      setWalletError("");
    }
  };

  // ── Create payment intent ───────────────────────────────────────────────
  const createPaymentIntent = async () => {
    if (!namespace || namespace.length !== 3) {
      setError("Please enter a valid 3-digit root (100–999)");
      return;
    }
    const num = parseInt(namespace, 10);
    if (num < 100 || num > 999) {
      setError("Root must be between 100 and 999");
      return;
    }
    if (walletError) return;

    setIsCreatingPayment(true);
    setError("");

    try {
      if (selectedAsset === "CARD") {
        const body: Record<string, string | number> = { root: num };
        if (walletAddress.trim()) body.walletAddress = walletAddress.trim();

        const response = await fetch(`${API_URL}/api/stripe/create-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Failed to create payment");
          setIsCreatingPayment(false);
          return;
        }
        setStripeClientSecret(data.client_secret);
        setStripeRoot(num);
        setStage("payment");
        setIsCreatingPayment(false);
        return;
      }

      // ── Crypto flow ─────────────────────────────────────────────────────
      const response = await fetch(`${API_URL}/api/payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ root: num, asset: selectedAsset }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to create payment");
        setIsCreatingPayment(false);
        return;
      }
      router.push(`/mint/success?payment_id=${data.payment_id}`);
    } catch {
      setError("Network error. Please try again.");
      setIsCreatingPayment(false);
    }
  };

  const livePrice =
    priceData?.priceDisplay ||
    (namespace.length === 3 && PREMIUM_ROOTS.has(parseInt(namespace, 10))
      ? "$27.00"
      : "$9.00");

  return (
    <main className="min-h-screen pt-16">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-8">
              <Link href="/" className="hover:text-purple-400 transition">
                Home
              </Link>
              <Link href="/trust" className="hover:text-purple-400 transition">
                Trust
              </Link>
              <Link href="/status" className="hover:text-purple-400 transition">
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Genesis Root Registration
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            <span className="text-green-400 font-bold">One-Time Mint.</span>{" "}
            <span className="text-purple-400 font-bold">No Renewals.</span>{" "}
            <span className="text-blue-400 font-bold">No Intermediaries.</span>
          </p>
          <p className="text-gray-400">
            Permanent cryptographic root from the January 16, 2026 genesis
            event. Created once. Cannot be recreated.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-green-900/30 border border-green-500/40 rounded-full px-4 py-1.5">
            <span className="text-green-400 font-bold text-sm">
              Bonding Curve Pricing
            </span>
            <span className="text-gray-400 text-xs">
              · starts at $9 · rises as roots are claimed
            </span>
          </div>
        </div>

        {/* ── STAGE 2: STRIPE CHECKOUT ──────────────────────────────────── */}
        {stage === "payment" &&
          stripeClientSecret &&
          stripeRoot !== null && (
            <div className="bg-white/5 border border-violet-500/30 rounded-xl p-6 shadow-2xl">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-violet-300 mb-1">
                  💳 Secure Card Payment
                </h2>
                <p className="text-sm text-gray-400">
                  Genesis Root{" "}
                  <span className="text-white font-bold">#{stripeRoot}</span> ·{" "}
                  <span className="text-green-400 font-bold">{livePrice}</span>{" "}
                  · Powered by Stripe
                </p>
                {walletAddress && (
                  <p className="text-xs text-blue-300 mt-1">
                    NFT will be sent to:{" "}
                    <span className="font-mono">{walletAddress}</span>
                  </p>
                )}
              </div>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: stripeClientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "#7c3aed",
                      borderRadius: "8px",
                    },
                  },
                }}
              >
                <StripeCardForm
                  root={stripeRoot}
                  priceDisplay={livePrice}
                  walletAddress={walletAddress}
                  onError={(msg) => {
                    setError(msg);
                    setStage("input");
                  }}
                />
              </Elements>
              <button
                onClick={() => {
                  setStage("input");
                  setStripeClientSecret(null);
                }}
                className="mt-3 text-xs text-gray-500 hover:text-gray-300 underline"
              >
                ← Back / Change root
              </button>
            </div>
          )}

        {/* ── STAGE 1: INPUT ───────────────────────────────────────────── */}
        {stage === "input" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="grid gap-6">
              {!namespace && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-200 text-sm">
                  💡{" "}
                  <strong>Genesis Roots are numeric.</strong> Three digits
                  (100–999). Price increases as supply drops.
                </div>
              )}

              {/* Root number input */}
              <label className="grid gap-2">
                <span className="text-sm text-gray-300 font-medium">
                  Choose Your Root
                </span>
                <div className="relative">
                  <input
                    value={namespace}
                    onChange={handleInput}
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    className={`w-full bg-black/40 border ${
                      error
                        ? "border-red-500"
                        : "border-white/10 focus:border-purple-500"
                    } rounded-lg px-4 py-4 font-mono text-2xl transition outline-none`}
                    placeholder="100 – 999"
                    disabled={isCreatingPayment}
                  />
                  {!error &&
                    namespace.length === 3 &&
                    !isCreatingPayment && (
                      <div className="absolute right-4 top-5 text-green-400 font-bold text-sm">
                        {priceLoading ? "…" : livePrice}
                      </div>
                    )}
                  {error && (
                    <div className="absolute right-4 top-5 text-red-400 font-bold text-sm">
                      INVALID
                    </div>
                  )}
                </div>
                {error ? (
                  <span className="text-xs text-red-400 font-bold animate-pulse">
                    {error}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">
                    Three-digit numeric root (100–999). Toll-free area codes
                    (833/844/855/866/877/888) carry a premium.
                  </span>
                )}
              </label>

              {/* Live bonding curve display */}
              {priceData && !error && (
                <PriceBar data={priceData} />
              )}

              {/* Wallet address input */}
              <label className="grid gap-2">
                <span className="text-sm text-gray-300 font-medium">
                  Your Polygon Wallet{" "}
                  <span className="text-gray-500 font-normal">
                    (optional — for NFT delivery)
                  </span>
                </span>
                <input
                  value={walletAddress}
                  onChange={handleWalletInput}
                  type="text"
                  inputMode="text"
                  className={`w-full bg-black/40 border ${
                    walletError
                      ? "border-red-500"
                      : "border-white/10 focus:border-blue-500"
                  } rounded-lg px-4 py-3 font-mono text-sm transition outline-none`}
                  placeholder="0x… (Ethereum / Polygon address)"
                  disabled={isCreatingPayment}
                />
                {walletError ? (
                  <span className="text-xs text-red-400">{walletError}</span>
                ) : (
                  <span className="text-xs text-gray-500">
                    Enter your wallet to receive the NumberRoot NFT on Polygon
                    Mainnet. You can claim it later if left blank.
                  </span>
                )}
              </label>

              {/* Payment method selector */}
              <label className="grid gap-2">
                <span className="text-sm text-gray-300 font-medium">
                  Payment Method
                </span>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    type="button"
                    disabled={isCreatingPayment}
                    onClick={() => setSelectedAsset("CARD")}
                    className={`py-3 px-2 rounded-lg font-semibold text-sm transition col-span-1 ${
                      selectedAsset === "CARD"
                        ? "bg-violet-600 text-white ring-2 ring-violet-400"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    } ${isCreatingPayment ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    💳 Card
                  </button>
                  {(["BTC", "ETH", "USDC", "USDT"] as const).map((asset) => (
                    <button
                      key={asset}
                      type="button"
                      disabled={isCreatingPayment}
                      onClick={() => setSelectedAsset(asset)}
                      className={`py-3 px-2 rounded-lg font-semibold text-sm transition ${
                        selectedAsset === asset
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      } ${isCreatingPayment ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
                {selectedAsset === "CARD" && (
                  <p className="text-xs text-violet-300 mt-1">
                    Visa, Mastercard, Amex — powered by Stripe. No account
                    required.
                  </p>
                )}
              </label>

              {/* CTA button */}
              <button
                onClick={createPaymentIntent}
                disabled={
                  !namespace ||
                  !!error ||
                  !!walletError ||
                  namespace.length !== 3 ||
                  isCreatingPayment
                }
                className={`w-full px-4 py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${
                  selectedAsset === "CARD"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                }`}
              >
                {isCreatingPayment ? (
                  <>
                    <span className="animate-spin">⏳</span>{" "}
                    {selectedAsset === "CARD"
                      ? "Loading Checkout…"
                      : "Creating Payment…"}
                  </>
                ) : (
                  <>
                    <span>
                      {selectedAsset === "CARD" ? "💳" : "🔗"}
                    </span>
                    {selectedAsset === "CARD"
                      ? `Pay ${livePrice} by Card`
                      : "Continue to Crypto Payment"}
                  </>
                )}
              </button>

              <div className="text-center text-xs text-gray-500">
                Keys are generated after payment confirmation. You maintain full
                control.
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-6 text-[10px] text-slate-600 font-mono space-y-0.5">
          <div>v3.0.0 Sovereign</div>
          <div className="text-[9px] text-slate-700">
            Build: Jan 2026 • Bonding Curve Active
          </div>
        </div>
      </div>
    </main>
  );
}

