"use client";

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float animation-delay-2s" />
      </div>

      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          True <span className="gradient-text">Web3 Rarity</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          The first marketplace where rarity is <span className="text-purple-400 font-semibold">cryptographically guaranteed</span>, 
          not artificially scarce.
        </p>
        
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl font-bold gradient-text mb-1">∞</div>
            <div className="text-sm text-gray-400">Unique Namespaces</div>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl font-bold text-purple-400 mb-1">6</div>
            <div className="text-sm text-gray-400">Rarity Tiers</div>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl font-bold text-blue-400 mb-1">100%</div>
            <div className="text-sm text-gray-400">Offline Capable</div>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl font-bold text-green-400 mb-1">PQ</div>
            <div className="text-sm text-gray-400">Post-Quantum</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/create"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-4 rounded-xl transition transform hover:scale-105 font-semibold"
          >
            Generate Namespace
          </a>
          <a
            href="/explore"
            className="border-2 border-white/20 hover:border-white/40 text-white text-lg px-8 py-4 rounded-xl transition"
          >
            Explore Marketplace
          </a>
        </div>
      </div>
    </section>
  );
}
