"use client";

import { useState } from "react";
import Link from "next/link";

// Generate 100-999 (PUBLIC ROOTS ONLY)
const PUBLIC_NUMERIC = Array.from({ length: 900 }, (_, i) => (i + 100).toString());

const IPFS_BASE_URL = "https://dweb.link/ipfs/bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e";

const ITEMS_PER_PAGE = 50;

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter public roots only
  const filteredRoots = PUBLIC_NUMERIC.filter(rootName => 
    rootName.includes(searchTerm)
  );

  // Pagination
  const totalPages = Math.ceil(filteredRoots.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedRoots = filteredRoots.slice(startIndex, endIndex);

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-black text-white">
      {/* Nav Overlay */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <Link href="/" className="text-xl font-bold gradient-text">Y3K Markets</Link>
           <div className="flex gap-4 text-sm">
             <Link href="/" className="hover:text-white text-gray-400">Home</Link>
             <Link href="/mint" className="hover:text-white text-gray-400">Claim</Link>
           </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
           <h1 className="text-4xl md:text-6xl font-bold mb-4">
             Claim Your <span className="gradient-text">Genesis Root</span>
           </h1>
           <div className="max-w-3xl mx-auto space-y-4">
             <p className="text-xl text-gray-300">
               Choose from <strong className="text-white">900 three-digit genesis roots</strong> (100-999)
             </p>
             <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
               <h3 className="text-lg font-bold text-blue-400 mb-2">What You're Claiming:</h3>
               <ul className="text-left text-gray-300 space-y-2">
                 <li>✅ <strong>A Cryptographic Root Namespace</strong> — already exists on IPFS, verified</li>
                 <li>✅ <strong>Full Cryptographic Keys</strong> — you control the identity, forever</li>
                 <li>✅ <strong>Unlimited Sub-Namespaces</strong> — create kevan.100, wallet.100, agent.100, etc.</li>
                 <li>✅ <strong>Post-Quantum Security</strong> — protected with NIST-standard cryptography</li>
               </ul>
             </div>
           </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-40 bg-black/90 p-4 rounded-xl border border-white/10 backdrop-blur-xl transition shadow-xl">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredRoots.length)} of {filteredRoots.length} roots
          </div>

          <div className="w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search number (e.g. 100, 777)..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {displayedRoots.map((rootName) => (
            <Link 
              key={rootName}
              href={`/mint?namespace=${rootName}`}
              className="group relative p-4 rounded-xl border bg-white/5 border-white/10 hover:border-purple-500 transition hover:scale-105 flex flex-col items-center justify-center aspect-square"
            >
              <div className="text-3xl font-bold text-white group-hover:text-purple-400 transition">
                {rootName}
              </div>
              <div className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition">
                Click to Claim
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first, last, current, and neighbors
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg border transition ${
                        currentPage === page
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "bg-white/5 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}

        {filteredRoots.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No roots found matching "{searchTerm}"
          </div>
        )}
      </div>
    </main>
  );
}
