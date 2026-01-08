export type TeamKey = "miami" | "olemiss";
export type NilVariant = "city" | "mascot";

export interface TeamBrand {
  key: TeamKey;
  displayName: string;
  university: string;
  city: string;
  conference: string;
  nickname: string;
  mascot: string;
  brandPersonality: string;
  colors: {
    primary: string; // CTA + highlights
    secondary: string; // headers + authority
    white: string;
  };
  nil: {
    cityName: string;
    mascotName: string;
    // A sensible default for bowl-week conversion pages.
    defaultRarityTier: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
  };
}

export const BOWL_TEAMS: Record<TeamKey, TeamBrand> = {
  miami: {
    key: "miami",
    displayName: "Miami Hurricanes",
    university: "University of Miami",
    city: "Coral Gables (Miami metro)",
    conference: "ACC",
    nickname: "Hurricanes",
    mascot: "Sebastian the Ibis",
    brandPersonality: "Speed, flash, confidence, swagger, South Florida culture",
    colors: {
      primary: "#F47321", // Orange
      secondary: "#005030", // Green
      white: "#FFFFFF",
    },
    nil: {
      cityName: "GablesNIL",
      mascotName: "HurricaneNIL",
      defaultRarityTier: "common",
    },
  },
  olemiss: {
    key: "olemiss",
    displayName: "Ole Miss Rebels",
    university: "University of Mississippi",
    city: "Oxford, Mississippi",
    conference: "SEC",
    nickname: "Rebels",
    mascot: "Landshark (modern); Colonel Reb (legacy)",
    brandPersonality: "Tradition, defiance, confidence, southern prestige",
    colors: {
      primary: "#CE1126", // Cardinal Red
      secondary: "#13294B", // Navy
      white: "#FFFFFF",
    },
    nil: {
      cityName: "OxfordNIL",
      mascotName: "RebelNIL",
      defaultRarityTier: "common",
    },
  },
};

export function getBowlTeam(team: string): TeamBrand | null {
  const key = team.toLowerCase() as TeamKey;
  return BOWL_TEAMS[key] ?? null;
}

export function nilNameFor(team: TeamBrand, variant: NilVariant) {
  return variant === "city" ? team.nil.cityName : team.nil.mascotName;
}

export function nilPairKeyFor(team: TeamBrand) {
  // Stable, lowercase a-z only key; server also derives if omitted.
  // Keep it predictable for marketing + analytics.
  return team.nil.cityName
    .replace(/NIL$/i, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, 64);
}
