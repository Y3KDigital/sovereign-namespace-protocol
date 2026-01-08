import { BOWL_TEAMS, type TeamBrand, type TeamKey } from "./bowlTeams";

export type ActiveTeamEnv = {
  key: TeamKey | null;
  team: TeamBrand | null;
};

export function getActiveTeamKeyFromEnv(): TeamKey | null {
  const raw = (
    process.env.NEXT_PUBLIC_GAME_TEAM ||
    process.env.NEXT_PUBLIC_ACTIVE_TEAM ||
    ""
  )
    .trim()
    .toLowerCase();

  if (raw === "miami" || raw === "olemiss") return raw;
  return null;
}

export function getActiveTeam(): TeamBrand | null {
  const key = getActiveTeamKeyFromEnv();
  return key ? BOWL_TEAMS[key] : null;
}

export function getBrandGradientVars() {
  const team = getActiveTeam();

  // Defaults preserve the existing look when no team is set.
  const brandPrimary = team?.colors.primary ?? "#667eea";
  const brandSecondary = team?.colors.secondary ?? "#764ba2";

  return {
    "--brand-primary": brandPrimary,
    "--brand-secondary": brandSecondary,
  } as const;
}
