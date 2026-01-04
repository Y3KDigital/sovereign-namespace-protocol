"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function randomSeed(length: number) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function CreatePage() {
  const [seed, setSeed] = useState<string>("");
  const [working, setWorking] = useState(false);
  const [previewHash, setPreviewHash] = useState<string | null>(null);

  const seedHint = useMemo(() => {
    if (!seed) return "";
    if (seed.length >= 32) return "Good length.";
    return `Consider at least 32 characters (currently ${seed.length}).`;
  }, [seed]);

  const onRandom = () => {
    setSeed(randomSeed(48));
    setPreviewHash(null);
  };

  const onGenerate = async () => {
    setWorking(true);
    try {
      // Note: this is a UI preview hash only.
      // The protocol uses SHA3-256 + Dilithium5 key derivation server-side / in native tools.
      const h = await sha256Hex(seed || "");
      setPreviewHash(h);
    } finally {
      setWorking(false);
    }
  };

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
              <Link href="/explore" className="hover:text-purple-400 transition">Explore</Link>
              <Link href="/create" className="text-purple-400">Create</Link>
              <Link href="/docs" className="hover:text-purple-400 transition">Docs</Link>
              <Link href="/trust" className="hover:text-purple-400 transition">Trust</Link>
              <Link href="/status" className="hover:text-purple-400 transition">Status</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">Create Namespace</h1>
        <p className="text-gray-400 text-lg mb-10">
          Generate your cryptographically unique namespace using post-quantum cryptography.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Seed Phrase <span className="text-gray-500">(min 32 characters recommended)</span>
          </label>
          <textarea
            value={seed}
            onChange={(e) => {
              setSeed(e.target.value);
              setPreviewHash(null);
            }}
            rows={4}
            placeholder="Enter a seed phrase..."
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-purple-500/60"
          />
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500">{seedHint}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onGenerate}
                disabled={working || seed.length === 0}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {working ? "Generating…" : "Generate Namespace"}
              </button>
              <button
                type="button"
                onClick={onRandom}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
              >
                Random Seed
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold mb-2">Preview</h2>
            <p className="text-gray-400 text-sm mb-4">
              This preview is for UX only. Final issuance and certificates are produced by the SNP engine.
            </p>

            <div className="bg-black/40 border border-white/10 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Preview Hash (SHA-256)</div>
              <div className="font-mono text-sm text-purple-300 break-all">
                {previewHash ?? "—"}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/docs/rarity"
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
              >
                Learn about rarity
              </Link>
              <Link
                href="/practice"
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition"
              >
                Practice mode
              </Link>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              ⚠️ Your seed generates your namespace and keys. Store it securely. We cannot recover lost seeds.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">How Namespace Generation Works</h2>
          <ol className="space-y-2 text-gray-300 ml-6">
            <li>1. Seed Input: Your seed is hashed for uniform distribution</li>
            <li>2. Key Generation: Dilithium5 keypair generated using post-quantum cryptography</li>
            <li>3. Namespace Creation: Unique namespace derived from cryptographic properties</li>
            <li>4. Rarity Calculation: Score computed from entropy, patterns, and complexity</li>
            <li>5. Certificate Issuance: IPFS-backed certificate proving ownership and uniqueness</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
