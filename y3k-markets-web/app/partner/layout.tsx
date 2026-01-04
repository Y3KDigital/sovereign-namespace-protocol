import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Portal | Y3K Markets",
  description:
    "Private partner portal for brokers and affiliates: referral links, verified attribution, and commission visibility.",
  alternates: { canonical: "/partner/" },
  openGraph: {
    title: "Partner Portal | Y3K Markets",
    description:
      "Private partner portal for brokers and affiliates: referral links, verified attribution, and commission visibility.",
  },
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
