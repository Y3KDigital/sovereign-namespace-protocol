import MintClient from "@/app/mint/MintClient";
import { Suspense } from "react";

export const metadata = {
  title: "Mint | Y3K Markets",
  description:
    "Create a payment intent and mint a namespace with optional NIL labeling (CityNIL / MascotNIL).",
};

export default function MintPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen pt-16">
          <div className="max-w-3xl mx-auto px-4 py-12 text-gray-400">Loading…</div>
        </main>
      }
    >
      <MintClient />
    </Suspense>
  );
}
