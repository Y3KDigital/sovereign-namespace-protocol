import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status | Y3K Markets",
  description: "Live operational status signals for Y3K Markets public endpoints.",
  alternates: { canonical: "/status/" },
  openGraph: {
    title: "Status | Y3K Markets",
    description: "Live operational status signals for Y3K Markets public endpoints.",
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
