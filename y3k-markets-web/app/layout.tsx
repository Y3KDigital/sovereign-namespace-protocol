import type { Metadata } from "next";
import "./globals.css";

import { getBrandGradientVars } from "@/lib/gameDay";

export const metadata: Metadata = {
  metadataBase: new URL("https://y3kmarkets.com"),
  title: {
    default: "Y3K Markets - True Web3 Rarity | Genesis Roots Live",
    template: "%s | Y3K Markets"
  },
  description: "Genesis ceremony complete. 955 cryptographically unique roots generated. Post-quantum namespace system with Dilithium signatures. Friends & Family minting now live.",
  keywords: [
    "Web3", "Blockchain", "Namespace", "Digital Identity", "Rarity",
    "Post-Quantum", "Dilithium", "IPFS", "Genesis", "NFT",
    "Cryptography", "Y3K", "Sovereign Namespace Protocol", "SNP"
  ],
  authors: [{ name: "Y3K Digital" }],
  creator: "Y3K Digital",
  publisher: "Y3K Digital",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Y3K Markets - True Web3 Rarity",
    description: "955 Genesis Roots. Cryptographically guaranteed uniqueness. Post-quantum ready. Mint now.",
    type: "website",
    url: "https://y3kmarkets.com",
    siteName: "Y3K Markets",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Y3K Markets - Genesis Complete",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Y3K Markets - True Web3 Rarity",
    description: "955 Genesis Roots. Post-quantum namespace system. Mint now.",
    creator: "@Y3KDigital",
    images: ["/og-image.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "https://y3kmarkets.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Set brand colors (game-day mode) at build-time via NEXT_PUBLIC_GAME_TEAM.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      style={getBrandGradientVars()}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://y3kmarkets.com/",
              "name": "Y3K Markets",
              "description": "955 Genesis Roots. Cryptographically guaranteed uniqueness.",
            })
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
