import { Suspense } from "react";
import PartnerClient from "./PartnerClient";

export default function PartnerPortalPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen pt-16">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-gray-300">
              Loading portal…
            </div>
          </div>
        </main>
      }
    >
      <PartnerClient />
    </Suspense>
  );
}
