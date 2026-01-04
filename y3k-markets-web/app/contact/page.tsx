import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | Y3K Markets",
  description: "Partnerships, press, and security disclosures for Y3K Markets and the Sovereign Namespace Protocol.",
  alternates: { canonical: "/contact/" },
  openGraph: {
    title: "Contact | Y3K Markets",
    description: "Partnerships, press, and security disclosures for Y3K Markets and the Sovereign Namespace Protocol.",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-16">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-8">
              <Link href="/" className="hover:text-purple-400 transition">Home</Link>
              <Link href="/practice" className="hover:text-purple-400 transition">Practice</Link>
              <Link href="/explore" className="hover:text-purple-400 transition">Explore</Link>
              <Link href="/docs" className="hover:text-purple-400 transition">Docs</Link>
              <Link href="/trust" className="hover:text-purple-400 transition">Trust</Link>
              <Link href="/status" className="hover:text-purple-400 transition">Status</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Contact</h1>
        <p className="text-gray-400 text-lg mb-8">
          For partnerships, press, and security disclosures, use the channels below.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-2">Email</h2>
            <p className="text-gray-300">
              <a className="text-purple-400 hover:text-purple-300 underline" href="mailto:support@y3kdigital.com">
                support@y3kdigital.com
              </a>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              (If you are reporting a security issue, please include “SECURITY” in the subject line.)
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-2">Social</h2>
            <p className="text-gray-300">
              <a
                className="text-purple-400 hover:text-purple-300 underline"
                href="https://twitter.com/y3kdigital"
                target="_blank"
                rel="noopener noreferrer"
              >
                @y3kdigital
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
