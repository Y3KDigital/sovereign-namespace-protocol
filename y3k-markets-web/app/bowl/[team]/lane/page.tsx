import { notFound } from "next/navigation";

import { LaneAfterDark } from "@/app/bowl/_components/LaneAfterDark";
import { getBowlTeam } from "@/lib/bowlTeams";

export const dynamicParams = false;

export function generateStaticParams() {
  // Only generate the satire microsite for the team it was designed for.
  return [{ team: "olemiss" }];
}

export function generateMetadata({ params }: { params: { team: string } }) {
  const team = getBowlTeam(params.team);
  if (!team) return {};

  return {
    title: `Lane After Dark | ${team.displayName} | Y3K Markets`,
    description:
      "Satire / fan-culture microsite concept for bowl week (no claims, no reporting).",
  };
}

export default function LanePage({ params }: { params: { team: string } }) {
  const team = getBowlTeam(params.team);
  if (!team) notFound();

  // This back-page concept is only relevant for Ole Miss in the current brief.
  if (team.key !== "olemiss") notFound();

  return <LaneAfterDark team={team} />;
}
