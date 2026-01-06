'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { getPublicApiBase } from "@/lib/publicApiBase";

interface Namespace {
  namespace: string;
  tier: string;
  ipfs_cid: string;
  issued_at: string;
}

const tierColors: Record<string, string> = {
  mythic: "text-pink-500",
  legendary: "text-yellow-500",
  epic: "text-purple-500",
  rare: "text-blue-500",
  uncommon: "text-green-500",
  common: "text-gray-500",
};

const GENESIS_DATE = "2026-01-15T00:00:00Z";

export default function ExplorePage() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [genesisFinalized, setGenesisFinalized] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    fetchNamespaces();
  }, [selectedTier]);

  const fetchNamespaces = async () => {
    setLoading(true);

    try {
      const apiUrl = getPublicApiBase();
      const url = selectedTier 
        ? `${apiUrl}/api/namespaces?tier=${selectedTier}&limit=100`
        : `${apiUrl}/api/namespaces?limit=100`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        setApiAvailable(false);
        setNamespaces([]);
        return;
      }

      const data = await response.json();
      setNamespaces(data);
      setApiAvailable(true);
      
      if (data.length > 0) {
        setGenesisFinalized(true);
      }
    } catch (err) {
      setApiAvailable(false);
      setNamespaces([]);
    } finally {
      setLoading(false);
    }
  };

  const filterByTier = (tier: string | null) => {
    setSelectedTier(tier);
  };

  const getDaysUntilGenesis = () => {
    const now = new Date();
    const genesis = new Date(GENESIS_DATE);
    const diff = genesis.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
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
              <Link href="/" className="hover:text-purple-400 transition">
                Home
              </Link>
              <Link href="/practice" className="hover:text-purple-400 transition">
                Practice
              </Link>
              <Link href="/explore" className="text-purple-400">
                Explore
              </Link>
              <Link href="/docs" className="hover:text-purple-400 transition">
                Docs
              </Link>
              <Link href="/trust" className="hover:text-purple-400 transition">
                Trust
              </Link>
              <Link href="/status" className="hover:text-purple-400 transition">
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 gradient-text">Namespace Registry</h1>
          <p className="text-gray-400 text-lg">Public read-only view of cryptographically unique namespaces</p>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <button 
            onClick={() => filterByTier(null)}
            className={`px-4 py-2 rounded-lg ${!selectedTier ? 'bg-purple-600 text-white' : 'bg-white/5 border border-white/10 hover:border-white/30'} transition`}
          >
            All
          </button>
          {['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'].map((tier) => (
            <button
              key={tier}
              onClick={() => filterByTier(tier)}
              className={`px-4 py-2 rounded-lg capitalize ${selectedTier === tier ? 'bg-purple-600 text-white' : 'bg-white/5 border border-white/10 hover:border-white/30'} transition`}
            >
              {tier}
            </button>
          ))}
        </div>

        {!loading && !genesisFinalized && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⏳</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Genesis Ceremony Pending</h3>
                <p className="text-gray-300 mb-3">
                  The Genesis ceremony will occur at <strong className="text-white">2026-01-15 00:00:00 UTC</strong>.
                  Until then, namespace issuance is frozen and the registry remains empty.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-purple-600/20 rounded-full">
                    📅 {getDaysUntilGenesis()} days remaining
                  </span>
                  <span className="text-gray-400">
                    0 namespaces issued
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading registry...</p>
          </div>
        )}

        {!loading && namespaces.length === 0 && !apiAvailable && (
          <div className="text-center py-12">
            <div className="bg-white/5 border border-white/10 rounded-lg p-12 max-w-3xl mx-auto">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-2xl font-bold mb-3">Registry Empty</h3>
              <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                No namespaces exist yet. Issuance begins after the Genesis ceremony on{' '}
                <span className="text-white font-semibold">January 15, 2026</span>.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-8 text-left">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-purple-400 font-semibold mb-1">Genesis-Locked Supply</div>
                  <div className="text-sm text-gray-400">Fixed tier allocations frozen at Genesis</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-purple-400 font-semibold mb-1">Cryptographic Uniqueness</div>
                  <div className="text-sm text-gray-400">Each namespace permanently unique via SHA3-256</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-purple-400 font-semibold mb-1">IPFS Permanence</div>
                  <div className="text-sm text-gray-400">Certificates stored on decentralized IPFS</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && namespaces.length === 0 && apiAvailable && genesisFinalized && (
          <div className="text-center py-12">
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-2">No Namespaces Match Filter</h3>
              <p className="text-gray-400 mb-4">
                {selectedTier 
                  ? `No ${selectedTier} tier namespaces have been issued yet.`
                  : 'Adjust your filters or check back later.'}
              </p>
              {selectedTier && (
                <button
                  onClick={() => filterByTier(null)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && namespaces.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {namespaces.map((ns) => {
              const tierColor = tierColors[ns.tier as keyof typeof tierColors] || "text-gray-500";
              return (
                <div 
                  key={ns.namespace}
                  className="bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <code className="text-2xl font-mono font-bold text-purple-400">
                      {ns.namespace}
                    </code>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${tierColor} bg-white/5`}>
                      {ns.tier}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tier</span>
                      <span className={`font-semibold capitalize ${tierColor}`}>{ns.tier}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Issued</span>
                      <span className="font-mono text-xs">{new Date(ns.issued_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Certificate</span>
                      <span className="font-mono text-xs text-purple-400">{ns.ipfs_cid.substring(0, 10)}...</span>
                    </div>
                  </div>

                  <Link href={`/explore/verify?namespace=${ns.namespace}`}>
                    <button className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-600 hover:to-blue-600 text-white font-semibold transition">
                      View Certificate
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {!loading && (
          <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm">
              <strong className="text-white">Public Registry Notice:</strong> This is a read-only verification surface.
              Namespaces cannot be purchased through this interface. All issuance occurs via Genesis-locked protocol rules.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
