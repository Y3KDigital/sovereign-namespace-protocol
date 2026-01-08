"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getPublicApiBase } from "@/lib/publicApiBase";

// Stripe Elements (optional; page degrades gracefully if publishable key missing)
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

type NilRole = "city" | "mascot";

type CreatePaymentResponse = {
  payment_intent_id: string;
  client_secret: string;
  amount_cents: number;
  currency: string;
  namespace_reserved?: string | null;
  nil_name?: string | null;
  nil_role?: NilRole | null;
  nil_pair_key?: string | null;
};

function canUseStripe() {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

function stripePromise() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  return loadStripe(key);
}

function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe is not ready.");
      return;
    }

    setWorking(true);
    try {
      const res = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/mint/success?order_id=${encodeURIComponent(
            orderId
          )}`,
        },
      });

      if (res.error) {
        setError(res.error.message ?? "Payment failed");
      }
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mt-6">
      <PaymentElement />
      {error ? (
        <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
          {error}
        </div>
      ) : null}
      <button
        type="button"
        onClick={confirm}
        disabled={!stripe || !elements || working}
        className="mt-4 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-60"
      >
        {working ? "Confirming…" : "Pay & Mint"}
      </button>
      <div className="mt-3 text-xs text-gray-500">
        After payment, issuance finalizes via webhook. If the certificate is still processing, the status page will update.
      </div>
    </div>
  );
}

export default function MintClient() {
  const searchParams = useSearchParams();

  const apiBase = useMemo(() => getPublicApiBase(), []);

  const presetNilName = (searchParams.get("nil_name") || "").trim() || undefined;
  const presetNilRole = (searchParams.get("nil_role") || "").trim() as NilRole;
  const presetNilPairKey = (searchParams.get("nil_pair_key") || "").trim() || undefined;
  const presetRarityTier = (searchParams.get("rarity_tier") || "").trim() || "common";
  const presetNamespace = (searchParams.get("namespace") || "").trim() || "";

  const [email, setEmail] = useState("");
  const [rarityTier, setRarityTier] = useState(presetRarityTier);
  const [namespace, setNamespace] = useState(presetNamespace);

  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatePaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stripe = useMemo(() => stripePromise(), []);

  async function createIntent() {
    setError(null);

    if (!email.trim()) {
      setError("Please enter an email.");
      return;
    }

    if (presetNilName && (presetNilRole !== "city" && presetNilRole !== "mascot")) {
      setError("Invalid nil_role. Expected 'city' or 'mascot'.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${apiBase}/api/payments/create-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          customer_email: email.trim(),
          rarity_tier: rarityTier,
          namespace: namespace.trim() ? namespace.trim() : undefined,
          nil_name: presetNilName,
          nil_role: presetNilName ? presetNilRole : undefined,
          nil_pair_key: presetNilPairKey,
        }),
      });

      const body = (await res.json().catch(() => null)) as CreatePaymentResponse | null;
      if (!res.ok) {
        const msg = (body as any)?.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }
      if (!body?.client_secret || !body?.payment_intent_id) {
        throw new Error("Malformed response from API");
      }

      setCreated(body);
    } catch (e: any) {
      setError(e?.message || "Unable to create payment intent");
    } finally {
      setCreating(false);
    }
  }

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
              <Link href="/docs/game-time" className="hover:text-purple-400 transition">
                Game Time
              </Link>
              <Link href="/status" className="hover:text-purple-400 transition">
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Mint</h1>
        <p className="text-gray-400 mb-8">
          Create a Stripe PaymentIntent through the public API, then confirm payment to mint and receive a certificate.
        </p>

        {!canUseStripe() ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 text-yellow-100">
            <div className="font-semibold">Stripe publishable key not configured</div>
            <div className="text-sm mt-1">
              Set <span className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span> in <span className="font-mono">y3k-markets-web/.env.local</span> to enable card payment.
            </div>
            <div className="text-sm mt-3">
              You can still use bowl-week pages as conversion funnels; route CTAs to <Link className="underline" href="/contact">Contact</Link> until Stripe is wired.
            </div>
          </div>
        ) : null}

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm text-gray-300">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-gray-300">Rarity tier</span>
              <select
                value={rarityTier}
                onChange={(e) => setRarityTier(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3"
              >
                {[
                  "common",
                  "uncommon",
                  "rare",
                  "epic",
                  "legendary",
                  "mythic",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-gray-300">Desired namespace (optional)</span>
              <input
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 font-mono"
                placeholder="1.x"
              />
              <span className="text-xs text-gray-500">
                If provided, the API will reserve it up-front if available.
              </span>
            </label>

            {presetNilName ? (
              <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                <div className="text-xs text-gray-500">NIL labels (preset)</div>
                <div className="mt-1 text-gray-200">
                  <span className="font-semibold">{presetNilName}</span> ({presetNilRole})
                </div>
                {presetNilPairKey ? (
                  <div className="text-xs text-gray-500 mt-1">
                    Pair key: <span className="font-mono">{presetNilPairKey}</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                Tip: bowl-week pages prefill CityNIL/MascotNIL labels automatically.
              </div>
            )}

            {error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            ) : null}

            {!created ? (
              <button
                onClick={createIntent}
                disabled={creating}
                className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create payment intent"}
              </button>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="text-green-100 font-semibold">Payment intent created</div>
                <div className="text-xs text-gray-300 mt-1">
                  Order ID: <span className="font-mono">{created.payment_intent_id}</span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  Amount: <span className="font-mono">{created.amount_cents}</span> {created.currency.toUpperCase()}
                </div>

                {stripe ? (
                  <Elements
                    stripe={stripe}
                    options={{
                      clientSecret: created.client_secret,
                      appearance: { theme: "night" },
                    }}
                  >
                    <CheckoutForm orderId={created.payment_intent_id} />
                  </Elements>
                ) : (
                  <div className="mt-3 text-sm text-gray-300">
                    Stripe not available.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          Want a bowl-week page? Try:
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/bowl/miami/citynil"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
            >
              Miami CityNIL
            </Link>
            <Link
              href="/bowl/miami/mascotnil"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
            >
              Miami MascotNIL
            </Link>
            <Link
              href="/bowl/olemiss/citynil"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
            >
              Ole Miss CityNIL
            </Link>
            <Link
              href="/bowl/olemiss/mascotnil"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
            >
              Ole Miss MascotNIL
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
