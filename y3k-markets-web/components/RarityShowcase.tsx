"use client";

const rarityTiers = [
  {
    name: "Mythic",
    color: "from-pink-600 to-red-600",
    textColor: "text-pink-500",
    borderColor: "border-pink-500/50",
    probability: "Tier 6",
    score: "901–1000",
    example: "1.x",
    description: "Legendary one-of-a-kind namespaces with perfect cryptographic properties",
  },
  {
    name: "Legendary",
    color: "from-yellow-500 to-orange-500",
    textColor: "text-yellow-500",
    borderColor: "border-yellow-500/50",
    probability: "Tier 5",
    score: "751–900",
    example: "42.x",
    description: "Extraordinarily rare with exceptional hash patterns",
  },
  {
    name: "Epic",
    color: "from-purple-600 to-indigo-600",
    textColor: "text-purple-500",
    borderColor: "border-purple-500/50",
    probability: "Tier 4",
    score: "501–750",
    example: "777.x",
    description: "Highly valuable with remarkable structural uniqueness",
  },
  {
    name: "Rare",
    color: "from-blue-500 to-cyan-500",
    textColor: "text-blue-500",
    borderColor: "border-blue-500/50",
    probability: "Tier 3",
    score: "251–500",
    example: "1337.x",
    description: "Uncommon namespaces with strong cryptographic traits",
  },
  {
    name: "Uncommon",
    color: "from-green-500 to-emerald-500",
    textColor: "text-green-500",
    borderColor: "border-green-500/50",
    probability: "Tier 2",
    score: "101–250",
    example: "8888.x",
    description: "Above-average uniqueness with notable properties",
  },
  {
    name: "Common",
    color: "from-gray-500 to-gray-600",
    textColor: "text-gray-500",
    borderColor: "border-gray-500/50",
    probability: "Tier 1",
    score: "0–100",
    example: "123456.x",
    description: "Standard namespaces with baseline cryptographic security",
  },
];

export function RarityShowcase() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 gradient-text">
          Rarity Tiers
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Every namespace is assigned a deterministic rarity score (0-1000) based on cryptographic properties:
          hash entropy, byte distribution, and structural complexity.
        </p>

        <p className="text-center text-gray-500 mb-10 max-w-3xl mx-auto text-sm">
          Examples are illustrative only; rarity is computed solely from cryptographic properties, not numeric meaning.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  {tier.probability}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">Score Range</div>
                <div className="text-xl font-mono font-bold">{tier.score}</div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">Example</div>
                <code className={`text-lg font-mono ${tier.textColor}`}>
                  {tier.example}
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

        <div className="mt-12 text-center">
          <a
            href="/docs/rarity"
            className="text-purple-400 hover:text-purple-300 transition underline"
          >
            Learn how rarity is calculated →
          </a>
        </div>
      </div>
    </section>
  );
}
