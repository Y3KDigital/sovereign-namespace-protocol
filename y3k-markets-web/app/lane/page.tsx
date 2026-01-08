import Link from "next/link";

export const metadata = {
  title: "Lane After Dark (Satire) | Y3K Markets",
  description:
    "A shareable satire/fan-culture back-page for bowl week. No claims, no reporting.",
};

export default function LaneShortcutPage() {
  return (
    <main className="min-h-screen pt-16">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/bowl/olemiss/mascotnil" className="text-gray-300 hover:text-white transition">
                Ole Miss MascotNIL
              </Link>
              <Link href="/docs/game-time" className="text-gray-300 hover:text-white transition">
                Game Time
              </Link>
              <Link href="/status" className="text-gray-300 hover:text-white transition">
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-xs uppercase tracking-wider text-gray-400">
            Bowl-week back page (satire)
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            <span className="gradient-text">Lane After Dark</span>
          </h1>
          <p className="mt-3 text-gray-300 text-lg">
            The shareable troll page. It’s fan-culture satire — no claims, no reporting, no “sources say”.
          </p>

          <div className="mt-6 bg-black/30 border border-white/10 rounded-xl p-5 text-sm text-gray-300">
            <div className="font-semibold text-gray-100 mb-1">Disclaimer</div>
            <div>
              Satire and internet culture only. This page does not assert facts or insider information about any real person.
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/bowl/olemiss/lane"
              className="px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition"
            >
              Enter Lane After Dark →
            </Link>
            <Link
              href="/bowl/olemiss/mascotnil"
              className="px-5 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
            >
              Back to RebelNIL
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
