"use client";

export function LiveCounter() {
  const TOTAL_ROOTS = 955;
  const GENESIS_HASH = "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc";
  const IPFS_CID = "bafybeidelwnl2eavhx654t3dj6t3naoy6stsjxag5p74pjlm7gqjtbyv5e";

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-purple-900/10 to-blue-900/10 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-400 mb-2">✅ GENESIS COMPLETE</div>
          <div className="text-5xl md:text-6xl font-bold gradient-text">
            {TOTAL_ROOTS.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Genesis roots generated and locked
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-gray-400 mb-1">Genesis Hash:</div>
            <code className="text-purple-400 font-mono text-xs break-all">{GENESIS_HASH}</code>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-gray-400 mb-1">IPFS Directory CID:</div>
            <code className="text-blue-400 font-mono text-xs break-all">{IPFS_CID}</code>
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <a
              href={`https://ipfs.io/ipfs/${IPFS_CID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/50 hover:bg-purple-600/30 transition"
            >
              Verify on IPFS →
            </a>
            <a
              href="/genesis"
              className="text-xs px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 transition"
            >
              Ceremony Details →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
