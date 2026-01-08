import Link from "next/link";

import type { NilVariant, TeamBrand } from "@/lib/bowlTeams";
import { nilNameFor, nilPairKeyFor } from "@/lib/bowlTeams";

function roleCopy(variant: NilVariant) {
  if (variant === "city") {
    return {
      label: "CityNIL",
      headline: "Institutional governance page",
      subhead:
        "Compliance-forward, partner-ready, and built for fast bowl-week credibility.",
      bullets: [
        "Compliance / governance tone",
        "Partners, collectives, donors",
        "Clear placement for sponsorship + disclosure",
      ],
    };
  }

  return {
    label: "MascotNIL",
    headline: "Athlete / fan conversion page",
    subhead:
      "High-energy, mobile-first, built for highlights, offers, and conversion during bowl week.",
    bullets: [
      "Athlete-forward NIL offers",
      "Social-first creative + short-form video",
      "Fast CTA cadence",
    ],
  };
}

export function BowlLanding({ team, variant }: { team: TeamBrand; variant: NilVariant }) {
  const primary = team.colors.primary;
  const secondary = team.colors.secondary;

  const nilName = nilNameFor(team, variant);
  const nilRole = variant;
  const nilPairKey = nilPairKeyFor(team);

  const copy = roleCopy(variant);

  const mintHref = `/mint?nil_name=${encodeURIComponent(nilName)}&nil_role=${encodeURIComponent(
    nilRole
  )}&nil_pair_key=${encodeURIComponent(nilPairKey)}&rarity_tier=${encodeURIComponent(
    team.nil.defaultRarityTier
  )}`;

  const sibling = variant === "city" ? "mascotnil" : "citynil";
  const siblingLabel = variant === "city" ? "MascotNIL" : "CityNIL";

  return (
    <main
      className="min-h-screen pt-16"
      style={{
        // Using CSS variables lets us keep a single layout system while swapping palettes.
        // Important rule: do not mix team palettes on the same page.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "--team-primary": primary,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "--team-secondary": secondary,
        // Also drive global brand variables for shared utilities like .gradient-text.
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
              <Link href="/" className="hover:text-[var(--team-primary)] transition">
                Home
              </Link>
              <Link
                href="/explore"
                className="hover:text-[var(--team-primary)] transition"
              >
                Explore
              </Link>
              <Link href="/trust" className="hover:text-[var(--team-primary)] transition">
                Trust
              </Link>
              <Link
                href="/docs/game-time"
                className="hover:text-[var(--team-primary)] transition"
              >
                Game Time
              </Link>
              <Link href="/status" className="hover:text-[var(--team-primary)] transition">
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-400">Bowl-week activation</div>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">
                <span className="text-[var(--team-primary)]">{nilName}</span>
              </h1>
              <p className="mt-3 text-gray-300 text-lg">
                {team.displayName} · {copy.label} · {copy.headline}
              </p>
              <p className="mt-2 text-gray-400">{copy.subhead}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={mintHref}
                className="px-5 py-3 rounded-lg text-black font-semibold bg-[var(--team-primary)] hover:opacity-90 transition"
              >
                Mint {nilName}
              </Link>
              <Link
                href={`/bowl/${team.key}/${sibling}`}
                className="px-5 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-[var(--team-primary)] transition"
              >
                View {siblingLabel}
              </Link>

              {team.key === "olemiss" ? (
                <Link
                  href={`/bowl/${team.key}/lane`}
                  className="px-5 py-3 rounded-lg bg-black/40 border border-[var(--team-primary)]/40 hover:border-[var(--team-primary)] transition"
                  title="Satire / fan-culture troll page (no claims)"
                >
                  Lane Kiffin Troll →
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-black/30 border border-white/10 rounded-xl p-5">
              <div className="text-sm text-gray-400">University</div>
              <div className="text-lg font-semibold text-gray-100">{team.university}</div>
              <div className="text-sm text-gray-400 mt-3">City</div>
              <div className="text-gray-200">{team.city}</div>
              <div className="text-sm text-gray-400 mt-3">Conference</div>
              <div className="text-gray-200">{team.conference}</div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-xl p-5">
              <div className="text-sm text-gray-400">Identity</div>
              <div className="text-gray-200 mt-1">Nickname: {team.nickname}</div>
              <div className="text-gray-200 mt-1">Mascot: {team.mascot}</div>
              <div className="text-sm text-gray-400 mt-3">Brand personality</div>
              <div className="text-gray-200">{team.brandPersonality}</div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-xl p-5">
              <div className="text-sm text-gray-400">Locked palette</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-gray-200">Primary</span>
                <span className="font-mono text-sm text-[var(--team-primary)]">{primary}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-gray-200">Secondary</span>
                <span className="font-mono text-sm text-[var(--team-secondary)]">{secondary}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-gray-200">White</span>
                <span className="font-mono text-sm text-gray-100">{team.colors.white}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <div
                  className="h-9 w-9 rounded-lg border border-white/10"
                  style={{ backgroundColor: primary }}
                  title="Primary"
                />
                <div
                  className="h-9 w-9 rounded-lg border border-white/10"
                  style={{ backgroundColor: secondary }}
                  title="Secondary"
                />
                <div
                  className="h-9 w-9 rounded-lg border border-white/10"
                  style={{ backgroundColor: team.colors.white }}
                  title="White"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-3 text-[var(--team-secondary)]">What this page is for</h2>
              <ul className="space-y-2 text-gray-200 ml-5 list-disc">
                {copy.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-3 text-[var(--team-secondary)]">NIL pairing (locked)</h2>
              <div className="text-gray-200">Always mint two names per market:</div>
              <div className="mt-3 grid gap-2">
                <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-gray-300">CityNIL</span>
                  <span className="font-semibold text-[var(--team-primary)]">{team.nil.cityName}</span>
                </div>
                <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-gray-300">MascotNIL</span>
                  <span className="font-semibold text-[var(--team-primary)]">{team.nil.mascotName}</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Pair key: <span className="font-mono">{nilPairKey}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-500">
            Bowl-week rule: keep layout grid, typography, CTA placement consistent across teams — swap only palette + copy.
          </div>
        </div>

        {team.key === "olemiss" ? (
          <div className="mt-6 text-xs text-gray-500">
            Note: “Lane After Dark” is satire/fan-culture commentary. No claims, no reporting.
          </div>
        ) : null}
      </div>
    </main>
  );
}
