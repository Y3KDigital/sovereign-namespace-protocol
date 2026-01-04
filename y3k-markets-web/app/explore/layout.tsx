import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Registry | Y3K Markets",
  description:
    "Public read-only registry of cryptographically unique namespaces and their deterministic rarity tiers.",
  alternates: { canonical: "/explore/" },
  openGraph: {
    title: "Explore Registry | Y3K Markets",
    description:
      "Public read-only registry of cryptographically unique namespaces and their deterministic rarity tiers.",
  },
};

export default function ExploreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
