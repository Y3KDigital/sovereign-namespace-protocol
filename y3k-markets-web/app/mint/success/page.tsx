import MintSuccessClient from "@/app/mint/success/MintSuccessClient";
import { Suspense } from "react";

export const metadata = {
  title: "Payment Status | Y3K Genesis",
  description: "Check payment status and generate ownership keys after payment confirmation.",
};

export default function MintSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen pt-32">
          <div className="max-w-3xl mx-auto px-4 py-12 text-center">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <div className="text-gray-400">Checking payment status...</div>
          </div>
        </main>
      }
    >
      <MintSuccessClient />
    </Suspense>
  );
}
