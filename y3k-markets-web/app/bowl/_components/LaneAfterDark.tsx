import Link from "next/link";

import type { TeamBrand } from "@/lib/bowlTeams";

export function LaneAfterDark({ team }: { team: TeamBrand }) {
  const primary = team.colors.primary;
  const secondary = team.colors.secondary;

  return (
    <main
      className="min-h-screen pt-16"
      style={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "--team-primary": primary,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "--team-secondary": secondary,
        // Keep shared brand styles on-theme.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "--brand-primary": primary,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "--brand-secondary": secondary,
      }}
    >
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-8">
              <Link
                href={`/bowl/${team.key}/mascotnil`}
                className="hover:text-[var(--team-primary)] transition"
              >
                Back to {team.nil.mascotName}
              </Link>
              <Link href="/docs/game-time" className="hover:text-[var(--team-primary)] transition">
                Game Time
              </Link>
              <Link href="/status" className="hover:text-[var(--team-primary)] transition">
                Status
              </Link>
              <Link href="/trust" className="hover:text-[var(--team-primary)] transition">
                Trust
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-xs uppercase tracking-wider text-gray-400">Humor / Bowl-week back page</div>
          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            <span className="text-[var(--team-primary)]">Lane After Dark</span>
          </h1>
          <p className="mt-3 text-gray-300 text-lg">
            A viral microsite concept for {team.displayName} fan culture — built to be shareable without making claims.
          </p>

          <div className="mt-4 text-sm text-gray-400">
            Keyword: <span className="text-[var(--team-primary)] font-semibold">Lane Kiffin</span> (troll mode, but safe).
          </div>

          <div className="mt-6 bg-black/30 border border-white/10 rounded-xl p-5 text-sm text-gray-300">
            <div className="font-semibold text-gray-100 mb-1">Disclaimer</div>
            <div>
              This page is satire and fan-culture commentary. It does not report news, assert facts, or claim insider information.
            </div>
          </div>

          <div className="mt-8 grid gap-6">
            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-[var(--team-secondary)]">Page title ideas</h2>
              <ul className="mt-3 space-y-2 text-gray-200 ml-5 list-disc">
                <li>“Lane After Dark”</li>
                <li>“The Kiffin Watch”</li>
                <li>“Postgame Lane”</li>
                <li>“Is Lane Checking Flight Status?”</li>
              </ul>
              <div className="mt-3 text-xs text-gray-500">Tone: tongue-in-cheek, internet-aware, never defamatory.</div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-[var(--team-secondary)]">Humor concept: “The Runway Cam”</h2>
              <p className="mt-3 text-gray-200">
                Premise: you’re not starting rumors — you’re surfing a well-known internet meme. Keep it wink-only.
              </p>
              <div className="mt-4 bg-black/30 border border-white/10 rounded-lg p-4">
                <div className="text-xs text-gray-500">Rule</div>
                <div className="text-gray-200">No claims. No statements of intent. No “sources say”.</div>
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-[var(--team-secondary)]">Short-form video ideas</h2>
              <ol className="mt-3 space-y-3 text-gray-200 ml-5 list-decimal">
                <li>
                  <span className="font-semibold">“Runway Mode: Activated”</span>
                  <div className="text-gray-300 text-sm mt-1">
                    Overlay: “Flight status: BOARDING” → cut to runway stock footage → end card: {team.nil.mascotName}.
                  </div>
                </li>
                <li>
                  <span className="font-semibold">“Assistant Coach Tracker”</span>
                  <div className="text-gray-300 text-sm mt-1">
                    Split-screen: stadium exit vs. silly airplane graphic. Caption: “SEC Twitter is typing…”
                  </div>
                </li>
                <li>
                  <span className="font-semibold">“Lane Checking His Phone”</span>
                  <div className="text-gray-300 text-sm mt-1">
                    Pop-up notifications: “weather update”, “SEC group chat”, “notifications muted (maybe)”.
                  </div>
                </li>
              </ol>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-[var(--team-secondary)]">How it fits NIL pages</h2>
              <div className="mt-3 text-gray-200">Keep the institutional page clean:</div>
              <ul className="mt-2 space-y-2 text-gray-200 ml-5 list-disc">
                <li>
                  <span className="font-semibold">{team.nil.cityName}</span> → compliance / governance / partners
                </li>
                <li>
                  <span className="font-semibold">{team.nil.mascotName}</span> → athlete brand / hype / conversion
                </li>
              </ul>
              <div className="mt-4">
                <Link
                  href={`/bowl/${team.key}/citynil`}
                  className="text-sm text-gray-300 underline underline-offset-4 hover:text-[var(--team-primary)] transition"
                >
                  Return to CityNIL →
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
