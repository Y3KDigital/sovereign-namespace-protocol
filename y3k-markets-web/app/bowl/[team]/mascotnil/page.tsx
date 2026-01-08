import { notFound } from "next/navigation";

import { BowlLanding } from "@/app/bowl/_components/BowlLanding";
import { BOWL_TEAMS, getBowlTeam } from "@/lib/bowlTeams";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(BOWL_TEAMS).map((team) => ({ team }));
}

export function generateMetadata({ params }: { params: { team: string } }) {
  const team = getBowlTeam(params.team);
  if (!team) return {};

  const title = `${team.nil.mascotName} | ${team.displayName} MascotNIL | Y3K Markets`;
  const description = `Athlete / fan MascotNIL landing page for ${team.displayName}. Palette locked to ${team.colors.primary} / ${team.colors.secondary}.`;

  return {
    title,
    description,
  };
}

export default function MascotNilPage({ params }: { params: { team: string } }) {
  const team = getBowlTeam(params.team);
  if (!team) notFound();

  return <BowlLanding team={team} variant="mascot" />;
}
