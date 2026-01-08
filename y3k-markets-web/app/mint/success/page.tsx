import SuccessClient from "@/app/mint/success/SuccessClient";
import { Suspense } from "react";

export const metadata = {
  title: "Mint Status | Y3K Markets",
  description: "Check payment and issuance status after completing checkout.",
};

export default function MintSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen pt-16">
          <div className="max-w-3xl mx-auto px-4 py-12 text-gray-400">Loading…</div>
        </main>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
