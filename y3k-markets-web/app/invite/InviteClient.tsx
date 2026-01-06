"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPublicApiBase } from "@/lib/publicApiBase";

async function fetchWithTimeout(input: RequestInfo, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export default function InviteClient() {
  const searchParams = useSearchParams();
  const referralCode = (searchParams.get("r") || "").trim();

  const apiBase = useMemo(() => {
    return getPublicApiBase();
  }, []);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setSuccess(null);

    if (!referralCode) {
      setError("Missing referral code.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter an email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchWithTimeout(
        `${apiBase}/api/affiliates/leads`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            referral_code: referralCode,
            lead_email: email.trim(),
            lead_name: name.trim() ? name.trim() : undefined,
            note: note.trim() ? note.trim() : undefined,
          }),
        },
        8000
      );

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = body?.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      setSuccess(
        "Introduced. You’ll receive a confirmation email if your broker has configured it."
      );
      setEmail("");
      setName("");
      setNote("");
    } catch (e: any) {
      setError(e?.message || "Unable to submit");
    } finally {
      setSubmitting(false);
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
              <Link href="/status" className="hover:text-purple-400 transition">
                Status
              </Link>
              <Link href="/invite" className="text-purple-400">
                Invitation
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Invitation</h1>
        <p className="text-gray-400 text-lg mb-10">
          You’ve been introduced to a system designed to be verified, not sold. The purpose is
          simple: acquire a unique namespace, receive a verifiable certificate, and operate under
          rules that aim to be immutable.
        </p>

        {!referralCode ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-3">Missing referral code</h2>
            <p className="text-gray-300">This invitation requires a referral code.</p>
            <p className="text-gray-400 mt-3">
              Example: <span className="font-mono">/invite/?r=r…</span>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition"
              >
                Request an introduction
              </Link>
              <Link
                href="/trust"
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
              >
                Verify the system
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-3">Request access</h2>
              <p className="text-gray-400 mb-6">
                Leave a clean contact point. Your broker will see the introduction as a lead tied to
                your invitation.
              </p>

              {success ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-200">
                  {success}
                </div>
              ) : null}

              {error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-200">
                  {error}
                </div>
              ) : null}

              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm text-gray-300">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3"
                    placeholder="you@firm.com"
                    autoComplete="email"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-gray-300">Name (optional)</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-gray-300">Note (optional)</span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 min-h-[90px]"
                    placeholder="A sentence is plenty."
                  />
                </label>

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>

                <p className="text-xs text-gray-500">
                  Referral code: <span className="font-mono">{referralCode}</span>
                </p>
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-2">Continue</h3>
              <p className="text-gray-400 mb-5">
                If you prefer to proceed directly, you can explore issuance and acquire a namespace.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/create"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition"
                >
                  Acquire a namespace
                </Link>
                <Link
                  href="/trust"
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
                >
                  Read the verification pack
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
