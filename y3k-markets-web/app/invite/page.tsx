import { Suspense } from "react";
import InviteClient from "./InviteClient";

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen pt-16">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-gray-300">
              Loading invitation…
            </div>
          </div>
        </main>
      }
    >
      <InviteClient />
    </Suspense>
  );
}
