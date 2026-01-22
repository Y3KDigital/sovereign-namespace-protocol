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
          Claim Your <span className="gradient-text">Crypto Identity</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto">
          Pick a <strong className="text-white">three-digit root</strong> (100-999) and get <strong className="text-purple-400">full cryptographic control</strong> forever
        </p>
        
        {/* What You Get */}
        <div className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4 text-purple-300">What You're Claiming</h3>
          <div className="text-left space-y-3 text-gray-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <strong>Your Root Namespace</strong> — Like owning "100.x" instead of renting a domain
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌳</span>
              <div>
                <strong>Unlimited Sub-Names</strong> — Create kevan.100, wallet.100, ai.100, anything.100
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <strong>Post-Quantum Security</strong> — Your keys, protected with NIST cryptography
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <strong>Already Verified on IPFS</strong> — Certificates exist, you're claiming ownership
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/explore"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-12 py-4 rounded-xl transition transform hover:scale-105 font-semibold shadow-xl"
          >
            Browse 900 Available Roots →
          </a>
          <a
            href="/docs"
            className="border-2 border-white/20 hover:border-white/40 text-white text-lg px-8 py-4 rounded-xl transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
