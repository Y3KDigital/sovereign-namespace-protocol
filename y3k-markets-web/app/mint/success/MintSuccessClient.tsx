"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_live_51T29nh1OEzphv6FLsoRg4yMypc4eskdoSGXSwMgnLxbAB1ptZm4YQ1uZnekR3peDHSvLW8sTOa5Fh3062yVbU96j00gtK152kK"
);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://payments.y3kmarkets.com";

interface MintStatus {
  minted: boolean;
  txHash?: string;
  transferTxHash?: string;
  polygonscan?: string;
  error?: string;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-xs px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition"
    >
      {copied ? "✓ Copied" : `Copy ${label}`}
    </button>
  );
}

// ── NFT mint status poller ─────────────────────────────────────────────────────
function NftStatusBox({
  paymentIntentId,
  rootNum,
  walletAddress,
}: {
  paymentIntentId: string;
  rootNum: number;
  walletAddress: string | null;
}) {
  const [status, setStatus] = useState<MintStatus>({ minted: false });
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/stripe/intent/${paymentIntentId}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.tx_hash) {
          setStatus({
            minted: true,
            txHash: data.tx_hash,
            transferTxHash: data.transfer_tx_hash,
            polygonscan: data.tx_hash
              ? `https://polygonscan.com/tx/${data.tx_hash}`
              : undefined,
          });
          return; // stop polling
        }
      }
    } catch {
      // silent — keep polling
    }
    setAttempts((n) => {
      const next = n + 1;
      if (next < 24) {
        // poll for ~2 min max (5s × 24)
        timerRef.current = setTimeout(poll, 5000);
      }
      return next;
    });
  };

  useEffect(() => {
    // Start polling after a brief delay to allow webhook to fire
    timerRef.current = setTimeout(poll, 6000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status.minted && status.txHash) {
    return (
      <div className="bg-green-900/20 border border-green-500/40 rounded-xl p-5 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🔗</span>
          <h3 className="font-bold text-green-400">
            NFT Minted on Polygon Mainnet
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-400">Mint tx: </span>
            <a
              href={`https://polygonscan.com/tx/${status.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-mono text-xs break-all"
            >
              {status.txHash}
            </a>
            <span className="ml-2">
              <CopyButton text={status.txHash} label="tx" />
            </span>
          </div>
          {status.transferTxHash && walletAddress && (
            <div>
              <span className="text-gray-400">Transfer to your wallet: </span>
              <a
                href={`https://polygonscan.com/tx/${status.transferTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline font-mono text-xs break-all"
              >
                {status.transferTxHash}
              </a>
            </div>
          )}
          {walletAddress && (
            <div>
              <span className="text-gray-400">Delivered to: </span>
              <span className="font-mono text-xs text-white">
                {walletAddress}
              </span>
            </div>
          )}
          {status.polygonscan && (
            <a
              href={status.polygonscan}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 mt-1 bg-purple-700 hover:bg-purple-800 rounded-lg font-semibold text-sm"
            >
              View on Polygonscan ↗
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-5 text-left">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl animate-spin">⛏️</span>
        <span className="font-semibold text-purple-300">
          Minting your NFT on Polygon…
        </span>
      </div>
      <p className="text-xs text-gray-400">
        {attempts < 24
          ? "This usually takes 15–60 seconds. Keep this page open."
          : "Taking longer than expected — check back or contact support."}
      </p>
      {attempts > 0 && attempts < 24 && (
        <div className="mt-2 w-full bg-white/10 rounded-full h-1">
          <div
            className="bg-purple-500 h-1 rounded-full transition-all"
            style={{ width: `${Math.min(100, (attempts / 24) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function MintSuccessClient() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const isStripe = searchParams.get("stripe") === "1";
  const stripeIntentId = searchParams.get("payment_intent");
  const stripeIntentSecret = searchParams.get("payment_intent_client_secret");
  const stripeRoot = searchParams.get("root");
  const walletParam = searchParams.get("wallet");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stripeStatus, setStripeStatus] = useState<
    "checking" | "succeeded" | "failed" | null
  >(null);

  // ── Stripe redirect: confirm payment intent ────────────────────────────
  useEffect(() => {
    if (!isStripe || !stripeIntentId || !stripeIntentSecret) return;
    setStripeStatus("checking");

    stripePromise.then(async (stripe) => {
      if (!stripe) {
        setStripeStatus("failed");
        return;
      }
      const { paymentIntent } = await stripe.retrievePaymentIntent(
        stripeIntentSecret
      );
      if (paymentIntent?.status === "succeeded") {
        setStripeStatus("succeeded");
        setLoading(false);
      } else {
        setStripeStatus("failed");
        setError(`Payment ${paymentIntent?.status || "failed"}. Please try again.`);
        setLoading(false);
      }
    });
  }, [isStripe, stripeIntentId, stripeIntentSecret]);

  // ── Crypto payments: handled below (no initial load needed) ──────────
  useEffect(() => {
    if (isStripe) return;
    if (!paymentId) {
      setError("No payment ID provided");
    }
    setLoading(false);
  }, [isStripe, paymentId]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <h1 className="text-2xl font-bold mb-2">
            {isStripe ? "Confirming payment…" : "Checking payment status…"}
          </h1>
          <p className="text-gray-400">Please wait…</p>
        </div>
      </main>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error || (isStripe && stripeStatus === "failed")) {
    return (
      <main className="min-h-screen pt-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2 text-red-400">
            Payment Error
          </h1>
          <p className="text-gray-400 mb-6">{error || "Payment not confirmed."}</p>
          <Link
            href="/mint"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Return to Mint Page
          </Link>
        </div>
      </main>
    );
  }

  // ── Stripe success ─────────────────────────────────────────────────────
  if (isStripe && stripeStatus === "succeeded") {
    const rootNum = parseInt(stripeRoot || "0", 10);
    return (
      <main className="min-h-screen pt-16 px-4">
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold gradient-text">
                Y3K Markets
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto py-12">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Root #{rootNum} is Yours
            </h1>
            <p className="text-gray-300 mb-1">
              Genesis registration confirmed via Stripe.
            </p>
            <p className="text-xs text-gray-500 font-mono">
              Intent: {stripeIntentId}
            </p>
          </div>

          {/* NFT Mint status box */}
          {stripeIntentId && (
            <div className="mb-6">
              <NftStatusBox
                paymentIntentId={stripeIntentId}
                rootNum={rootNum}
                walletAddress={walletParam}
              />
            </div>
          )}

          {/* What happens next */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="font-bold text-white mb-3">
              📋 Your Genesis Certificate
            </h2>
            <ol className="text-sm text-gray-300 list-decimal list-inside space-y-2">
              <li>
                Root{" "}
                <strong className="text-white">#{rootNum}</strong> is
                permanently registered on the Sovereign Namespace Protocol
              </li>
              <li>
                The NumberRoot NFT (ERC-721) is being minted and transferred to
                your Polygon wallet
              </li>
              <li>
                Your cryptographic ownership certificate from the{" "}
                <span className="text-yellow-400">
                  January 16, 2026 genesis block
                </span>{" "}
                will be issued within 24 hours
              </li>
            </ol>

            {!walletParam && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-300">
                ⚠️ No wallet address was provided. Your NFT is held in the
                protocol escrow. Contact support with your payment intent ID to
                claim it: <strong>{stripeIntentId}</strong>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/mint"
              className="px-6 py-3 bg-violet-700 hover:bg-violet-800 rounded-lg font-semibold text-center"
            >
              Register Another Root
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-semibold text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Crypto payment fallback (existing flow) ────────────────────────────
  return (
    <main className="min-h-screen pt-32 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-5xl mb-4">🔗</div>
        <h1 className="text-2xl font-bold mb-2">Crypto Payment Initiated</h1>
        <p className="text-gray-400 mb-4">Payment ID: {paymentId}</p>
        <p className="text-sm text-gray-500 mb-6">
          Your root will be registered once the transaction confirms.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-purple-700 hover:bg-purple-800 rounded-lg font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

