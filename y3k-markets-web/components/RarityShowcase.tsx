"use client";

const rarityTiers = [
  {
    name: "Crown Letters",
    color: "from-pink-600 to-red-600",
    textColor: "text-pink-500",
    borderColor: "border-pink-500/50",
    count: "26 total",
    availability: "Protocol Reserved",
    examples: "a, b, c ... x, y, z",
    description: "Single letter namespaces. Maximum rarity. Reserved for protocol infrastructure.",
  },
  {
    name: "Crown Digits",
    color: "from-yellow-500 to-orange-500",
    textColor: "text-yellow-500",
    borderColor: "border-yellow-500/50",
    count: "10 total",
    availability: "Protocol Reserved",
    examples: "0, 1, 2 ... 7, 8, 9",
    description: "Single digit namespaces. Legendary status. Reserved for protocol bridges.",
  },
  {
    name: "Three-Digit Genesis",
    color: "from-purple-600 to-indigo-600",
    textColor: "text-purple-500",
    borderColor: "border-purple-500/50",
    count: "900 total",
    availability: "Available to Claim",
    examples: "100, 200, 500, 777, 999",
    description: "Public genesis roots. Position-based pricing. Available for Friends & Family, then public claiming.",
  },
];

export function RarityShowcase() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 gradient-text">
          Genesis Root Tiers
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          The 955 genesis roots are organized into three tiers based on format and availability.
          All roots are cryptographically unique and locked by genesis hash.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {rarityTiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-6 rounded-xl bg-white/5 border-2 ${tier.borderColor} hover:scale-105 transition transform`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-2xl font-bold ${tier.textColor}`}>
                  {tier.name}
                </h3>
                <div className="text-sm text-gray-400">
                  {tier.count}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">Availability</div>
                <div className="text-lg font-semibold">{tier.availability}</div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">Examples</div>
                <code className={`text-base font-mono ${tier.textColor}`}>
                  {tier.examples}
                </code>
              </div>

              <p className="text-sm text-gray-400">
                {tier.description}
              </p>

              <div className="mt-6">
                <div className={`h-2 rounded-full bg-gradient-to-r ${tier.color} opacity-50`} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            <strong className="text-white">900 three-digit roots</strong> are available for claiming.
            Friends & Family holders get 24-hour early access, then public claiming opens.
          </p>
          <a
            href="/genesis"
            className="inline-block text-purple-400 hover:text-purple-300 transition underline"
          >
            View ceremony details and verification →
          </a>
        </div>
      </div>
    </section>
  );
}
