"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const number = params.get("number") ?? "";
  const vanity  = params.get("vanity")  ?? number;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <div className="text-7xl mb-6">✅</div>
        <h1 className="text-4xl font-black mb-3">You Own the Call.</h1>
        <p className="text-gray-400 text-lg mb-6">
          Payment confirmed. <span className="text-white font-bold font-mono">{vanity}</span> is being activated.
          You'll receive onboarding details at the email you provided within 1 business day.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="text-3xl font-black font-mono text-white mb-1">{vanity}</div>
          <div className="text-sm text-gray-500 font-mono">{number}</div>
          <div className="mt-4 space-y-1.5 text-sm text-gray-400">
            <p>✓ AI intake is being configured</p>
            <p>✓ Onboarding email sent shortly</p>
            <p>✓ Live within 1 business day</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="tel:+18888550209" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition">
            📞 888-855-0209 — Contact Us
          </a>
          <Link href="/" className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-semibold transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
