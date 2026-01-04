import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invitation | Y3K Markets",
  description:
    "A private introduction to Y3K Markets: a verifiable namespace system with rarity, certificates, and immutable issuance rules.",
  alternates: { canonical: "/invite/" },
  openGraph: {
    title: "Invitation | Y3K Markets",
    description:
      "A private introduction to Y3K Markets: a verifiable namespace system with rarity, certificates, and immutable issuance rules.",
  },
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
