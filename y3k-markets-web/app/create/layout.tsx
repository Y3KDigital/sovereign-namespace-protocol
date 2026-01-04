import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Namespace | Y3K Markets",
  description:
    "Generate a cryptographically unique namespace and preview derivation output. Your seed controls your keys.",
  alternates: { canonical: "/create/" },
  openGraph: {
    title: "Create Namespace | Y3K Markets",
    description:
      "Generate a cryptographically unique namespace and preview derivation output. Your seed controls your keys.",
  },
};

export default function CreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
