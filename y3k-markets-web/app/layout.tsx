import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://y3kmarkets.com"),
  title: "Y3K Markets - True Web3 Rarity",
  description: "The first marketplace where rarity is cryptographically guaranteed, not artificially scarce.",
  keywords: ["Web3", "NFT", "Rarity", "Blockchain", "Post-Quantum", "Cryptography", "Namespaces"],
  authors: [{ name: "Y3K Digital" }],
  openGraph: {
    title: "Y3K Markets - True Web3 Rarity",
    description: "Cryptographically guaranteed rarity marketplace",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
