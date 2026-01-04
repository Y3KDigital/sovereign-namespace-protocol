import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Mode | Y3K Markets",
  description:
    "Mandatory educational simulation of the Sovereign Namespace Protocol issuance flow (no real issuance).",
  alternates: { canonical: "/practice/" },
  openGraph: {
    title: "Practice Mode | Y3K Markets",
    description:
      "Mandatory educational simulation of the Sovereign Namespace Protocol issuance flow (no real issuance).",
  },
};

export default function PracticeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
