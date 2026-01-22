"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection />
      <WhatThisIsSection />
      <RaritySimulator />
      <ComparisonSection />
      <WhyMostDontMatterSection />
      <ArchitectureSection />
      <AIAssistantSection />
      <NFTArtGenerator />
      <InteractiveDemoSection />
      <Footer />
    </div>
  );
}

// ============================================
// HERO SECTION
// ============================================

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-blue-500/20" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-bold leading-tight">
          Future of
          <span className="block text-green-400">Digital Identity</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
          Digital identity should be <span className="text-green-400 font-bold">scarce</span>,{' '}
          <span className="text-green-400 font-bold">sovereign</span>, and{' '}
          <span className="text-green-400 font-bold">income-producing</span>.
        </p>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Y3K is a namespace system built for long-term value. Not speculation. Not hype.{' '}
          <span className="text-white font-semibold">Infrastructure that compounds</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/claim"
            className="px-8 py-4 bg-green-400 text-black font-bold rounded-lg hover:bg-green-300 transition-colors"
          >
            Explore the System
          </Link>
          <Link
            href="/practice"
            className="px-8 py-4 border border-green-400 text-green-400 font-bold rounded-lg hover:bg-green-400/10 transition-colors"
          >
            Try Demo
          </Link>
        </div>

        <div className="pt-12 animate-bounce">
          <div className="text-gray-500">Scroll</div>
          <div className="text-2xl">↓</div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// WHAT THIS IS SECTION
// ============================================

function WhatThisIsSection() {
  return (
    <section className="py-24 px-6 border-t border-green-500/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">What This Is</h2>
        
        <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-16">
          Y3K is a namespace system with enforced rarity, designed for long-term value creation.{' '}
          <span className="text-white">Not speculation. Not memes. Digital infrastructure.</span>
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: 'Enforced Rarity',
              description: 'Fixed supply at genesis. No inflation. No dilution. Value preservation through structural scarcity.'
            },
            {
              title: 'Hierarchical Namespaces',
              description: 'Root namespaces spawn sub-namespaces. Each level inherits value and creates new utility.'
            },
            {
              title: 'Long-Term Design',
              description: 'Built for decades, not quarters. Compatible with legacy systems, Web2, and emerging AI agents.'
            },
            {
              title: 'Real Infrastructure',
              description: 'Not just names. Payment rails. Identity layers. Broker networks. Actual economic utility.'
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-green-400/5 border border-green-500/20 rounded-lg">
              <h3 className="text-xl font-bold text-green-400 mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center space-y-4">
          <div className="text-3xl font-bold">No Buzzwords</div>
          <div className="text-3xl font-bold">No Hype</div>
          <div className="text-3xl font-bold text-green-400">Just Structure</div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// RARITY SIMULATOR
// ============================================

function RaritySimulator() {
  const [adoption, setAdoption] = useState(30);
  const [claimed, setClaimed] = useState(25);

  const baseValue = 100;
  const scarcityMultiplier = 1 + (claimed / 100);
  const adoptionMultiplier = 1 + (adoption / 100);
  const estimatedValue = Math.round(baseValue * scarcityMultiplier * adoptionMultiplier);
  const valueIncrease = Math.round(((estimatedValue - baseValue) / baseValue) * 100);

  const totalSupply = 1000;
  const claimedCount = Math.round(totalSupply * (claimed / 100));
  const availableCount = totalSupply - claimedCount;

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-black to-green-900/5">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-6">Rarity & Scarcity</h2>
        <p className="text-center text-gray-400 mb-16">
          Feel how scarcity creates value. Interact with the controls to understand why fixed supply matters.
        </p>

        <div className="bg-black border border-green-500/30 rounded-lg p-8 space-y-8">
          <h3 className="text-2xl font-bold text-green-400">Simulate Market Dynamics</h3>

          {/* Network Adoption Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-gray-400">Network Adoption</label>
              <span className="text-white font-bold">{adoption}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adoption}
              onChange={(e) => setAdoption(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-400"
            />
            <p className="text-sm text-gray-500 mt-1">As more users join the network, demand increases</p>
          </div>

          {/* Namespaces Claimed Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-gray-400">Namespaces Claimed</label>
              <span className="text-white font-bold">{claimed}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={claimed}
              onChange={(e) => setClaimed(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-400"
            />
            <p className="text-sm text-gray-500 mt-1">As supply decreases, remaining namespaces become more valuable</p>
          </div>

          {/* Supply Visualization */}
          <div className="pt-6 border-t border-green-500/20">
            <div className="text-center mb-4">
              <div className="text-lg text-gray-400">Fixed Supply: 1,000 Root Namespaces</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-red-400/10 border border-red-400/30 rounded">
                <div className="text-3xl font-bold text-red-400">{claimedCount}</div>
                <div className="text-gray-400">Claimed</div>
              </div>
              <div className="text-center p-4 bg-green-400/10 border border-green-400/30 rounded">
                <div className="text-3xl font-bold text-green-400">{availableCount}</div>
                <div className="text-gray-400">Available</div>
              </div>
            </div>
          </div>

          {/* Value Calculation */}
          <div className="p-6 bg-green-400/10 border border-green-400/30 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-2">Estimated Value per Namespace</div>
            <div className="text-5xl font-bold text-green-400 mb-2">
              {valueIncrease > 0 ? '+' : ''}{valueIncrease}%
            </div>
            <div className="text-3xl font-bold text-white mb-4">${estimatedValue}</div>
            <div className="text-sm text-gray-400">
              Base value: ${baseValue} | Scarcity: {scarcityMultiplier.toFixed(2)}x | Adoption: {adoptionMultiplier.toFixed(2)}x
            </div>
          </div>

          {/* Key Insight */}
          <div className="p-4 bg-blue-400/10 border border-blue-400/30 rounded text-sm text-gray-300">
            <span className="text-blue-400 font-bold">Key insight:</span> Unlike systems with unlimited minting, 
            Y3K's fixed supply means early participants benefit from structural appreciation. 
            Value comes from scarcity, not speculation.
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// COMPARISON SECTION
// ============================================

function ComparisonSection() {
  return (
    <section className="py-24 px-6 border-t border-green-500/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-6">How We Compare</h2>
        <p className="text-center text-gray-400 mb-16">
          A clear, honest comparison. No trash talk. Just structural differences that matter for long-term value.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-green-500/30">
                <th className="text-left p-4 text-gray-400 font-normal">Feature</th>
                <th className="text-left p-4 text-green-400 font-bold">Y3K</th>
                <th className="text-left p-4 text-gray-400">Traditional DNS</th>
                <th className="text-left p-4 text-gray-400">NFT Names</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Supply Control', 'Fixed at genesis', 'Unlimited minting', 'Variable per collection'],
                ['Economic Utility', 'Payment rails + Identity', 'Name resolution only', 'Speculation primarily'],
                ['AI Integration', 'Native agent routing', 'Not designed for AI', 'Limited / none'],
                ['Legacy Compatibility', 'Built for Web2 + Web3', 'Web3 only', 'Chain dependent'],
                ['Value Preservation', 'Structural scarcity', 'Dilution risk', 'Market dependent'],
                ['Sub-namespace Revenue', 'Owners earn from children', 'Single level only', 'Not applicable']
              ].map(([feature, y3k, dns, nft], i) => (
                <tr key={i} className="border-b border-green-500/10 hover:bg-green-400/5 transition-colors">
                  <td className="p-4 text-gray-400">{feature}</td>
                  <td className="p-4 text-white font-semibold">{y3k}</td>
                  <td className="p-4 text-gray-500">{dns}</td>
                  <td className="p-4 text-gray-500">{nft}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Comparison based on architectural design, not marketing claims.
        </p>
      </div>
    </section>
  );
}

// ============================================
// WHY MOST DON'T MATTER SECTION
// ============================================

function WhyMostDontMatterSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-black to-red-900/5">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-6">Why Most Web3 Names Don't Matter</h2>
        <p className="text-center text-gray-400 mb-16">
          A calm explanation of structural problems. Not criticism. Just architecture.
        </p>

        <div className="space-y-8">
          {[
            {
              belief: '"Adoption equals value"',
              reality: 'Unlimited supply dilutes any adoption gains. Millions of users mean nothing if anyone can mint millions of names.'
            },
            {
              belief: '"More chains mean more opportunity"',
              reality: 'Fragmentation destroys value. Each new chain creates another isolated namespace. Y3K is chain-agnostic infrastructure.'
            },
            {
              belief: '"Low prices attract users"',
              reality: 'Low prices signal disposability. Premium positioning with real scarcity creates lasting value perception.'
            }
          ].map((item, i) => (
            <div key={i} className="p-6 bg-red-400/5 border border-red-400/20 rounded-lg">
              <div className="text-sm text-gray-500 mb-2">Common belief</div>
              <div className="text-xl text-red-400 font-bold mb-3">{item.belief}</div>
              <div className="text-gray-300">{item.reality}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-green-400/10 border border-green-400/30 rounded-lg text-center">
          <div className="text-2xl text-gray-300 italic">
            "Hustle is not infrastructure. Y3K builds for the next century, not the next funding round."
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// ARCHITECTURE SECTION
// ============================================

function ArchitectureSection() {
  return (
    <section className="py-24 px-6 border-t border-green-500/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-6">Our Architecture</h2>
        <p className="text-center text-gray-400 mb-16">
          Simple visuals. Real infrastructure. Each layer builds on the last to create an integrated value network.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: 'Namespaces',
              description: 'Root namespaces with hierarchical sub-namespaces. Each level inherits properties and creates utility.',
              icon: '🌐'
            },
            {
              title: 'Identity',
              description: 'Sovereign identity layer. No email required. No personal data collected. Pure cryptographic ownership.',
              icon: '🔐'
            },
            {
              title: 'Payments',
              description: 'Native payment rails. Receive value through your namespace. No middlemen. Direct routing.',
              icon: '💳'
            },
            {
              title: 'Vaults',
              description: 'Programmable value storage. Time-locked. Conditional. Multi-signature when needed.',
              icon: '🔒'
            },
            {
              title: 'AI Agents',
              description: 'Namespace-native AI routing. Agents can send and receive on your behalf. Automated value flows.',
              icon: '🤖'
            },
            {
              title: 'Broker Network',
              description: 'Neural routing for value distribution. Find the right path. No centralized intermediaries.',
              icon: '🔄'
            }
          ].map((layer, i) => (
            <div key={i} className="p-6 bg-green-400/5 border border-green-500/20 rounded-lg hover:bg-green-400/10 transition-colors">
              <div className="text-4xl mb-4">{layer.icon}</div>
              <h3 className="text-xl font-bold text-green-400 mb-3">{layer.title}</h3>
              <p className="text-gray-400">{layer.description}</p>
            </div>
          ))}
        </div>

        <div className="p-8 bg-black border border-green-500/30 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-green-400 mb-6">Value Flow</h3>
          <div className="flex items-center justify-center gap-3 text-lg flex-wrap">
            {['Namespace', 'Identity', 'Payments', 'Vaults', 'Agents'].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-white font-semibold">{step}</span>
                {i < arr.length - 1 && <span className="text-green-400">→</span>}
              </div>
            ))}
          </div>
          <p className="text-gray-400 mt-6">Each layer enables the next. No gaps. No broken paths.</p>
        </div>

        <div className="mt-12 text-center">
          <div className="text-xl text-gray-300 italic">"Oh... this is actually useful."</div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// AI ASSISTANT SECTION
// ============================================

function AIAssistantSection() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Hello! I'm the Y3K assistant. I can help you understand our namespace system, explain how scarcity creates value, and answer questions about our architecture. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');

  const quickQuestions = [
    'How does Y3K create scarcity?',
    'Why are sub-namespaces valuable?',
    'How do payments work?',
    'What makes Y3K different?'
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', content: input }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Great question about "${input}". Y3K uses cryptographic scarcity enforced at the protocol level, ensuring that once a namespace is claimed, it cannot be duplicated or inflated. This creates structural value that compounds over time as the network grows.`
      }]);
    }, 1000);

    setInput('');
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-black to-blue-900/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-blue-400/20 text-blue-400 rounded-full text-sm font-bold mb-4">
            AI-Powered
          </div>
          <h2 className="text-5xl font-bold mb-4">Ask the Assistant</h2>
          <p className="text-gray-400">
            An AI that explains concepts conversationally. Ask about rarity, value, use cases, or anything else.{' '}
            <span className="text-white">No email required. No data collected.</span>
          </p>
        </div>

        <div className="bg-black border border-blue-500/30 rounded-lg overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-green-400/20 text-white'
                    : 'bg-blue-400/10 text-gray-300'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          <div className="p-4 border-t border-blue-500/20 flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="px-3 py-1 bg-blue-400/10 text-blue-400 text-sm rounded hover:bg-blue-400/20 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-blue-500/20 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about Y3K..."
              className="flex-1 bg-black border border-blue-500/30 rounded px-4 py-2 text-white focus:border-blue-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="px-6 py-2 bg-blue-400 text-black font-bold rounded hover:bg-blue-300 transition-colors"
            >
              Send
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          No personal data collected. No email required. Just questions and answers.
        </p>
      </div>
    </section>
  );
}

// ============================================
// NFT ART GENERATOR
// ============================================

function NFTArtGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');

  const styles = ['Cinematic', 'Abstract Art', 'Sci-Fi', 'Organic', 'Minimal', 'Cosmic'];

  return (
    <section className="py-24 px-6 border-t border-green-500/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-purple-400/20 text-purple-400 rounded-full text-sm font-bold mb-4">
            AI-Powered Creation
          </div>
          <h2 className="text-5xl font-bold mb-4">Generate & Mint Unique NFT Art</h2>
          <p className="text-gray-400">
            Create stunning digital art, mint as NFTs with cryptographic security, trade on the marketplace, or fractionalize for shared ownership.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 mb-2">Describe Your Vision</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A majestic dragon emerging from digital circuits, golden scales reflecting neon light..."
                className="w-full h-32 bg-black border border-purple-500/30 rounded-lg px-4 py-3 text-white resize-none focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Art Style</label>
              <div className="grid grid-cols-3 gap-2">
                {styles.map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3 py-2 rounded border transition-colors ${
                      style === s
                        ? 'border-purple-400 bg-purple-400/20 text-purple-400'
                        : 'border-purple-500/30 text-gray-400 hover:border-purple-400/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full bg-purple-400 text-black font-bold py-3 rounded-lg hover:bg-purple-300 transition-colors">
              Generate NFT Art
            </button>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Cryptographic Security', icon: '🔒' },
                { label: 'Rarity Scoring', icon: '💎' },
                { label: 'IPFS Certification', icon: '📜' },
                { label: 'Marketplace Ready', icon: '🏪' }
              ].map((feature, i) => (
                <div key={i} className="p-3 bg-purple-400/5 border border-purple-500/20 rounded text-center">
                  <div className="text-2xl mb-1">{feature.icon}</div>
                  <div className="text-gray-400">{feature.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-8 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎨</div>
              <div className="text-gray-400">Your creation will appear here</div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-4 gap-6 text-center">
          {[
            { title: 'Cryptographic Security', desc: 'SHA-256 verified' },
            { title: 'AI Appraisal', desc: 'Third-party valuation' },
            { title: 'Fractionalization', desc: 'Shared ownership' },
            { title: 'Vault & Loans', desc: 'Leverage your NFTs' }
          ].map((feature, i) => (
            <div key={i} className="p-4 bg-purple-400/5 border border-purple-500/20 rounded">
              <div className="font-bold text-white mb-1">{feature.title}</div>
              <div className="text-sm text-gray-400">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// INTERACTIVE DEMO SECTION
// ============================================

function InteractiveDemoSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<{ available: boolean; tier: string; value: number } | null>(null);

  const handleSearch = () => {
    if (!searchTerm) return;

    // Simulate search
    const available = Math.random() > 0.5;
    const tiers = ['Root', 'Premium', 'Standard'];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const value = tier === 'Root' ? 10000 : tier === 'Premium' ? 1000 : 100;

    setSearchResult({ available, tier, value });
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-black to-green-900/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Interactive Demo</h2>
          <div className="text-2xl text-gray-300 mb-6">Experience the System</div>
          <p className="text-gray-400">
            Simulate claiming a namespace. No wallet required. Understand why early scarcity matters through interaction.
          </p>
        </div>

        <div className="bg-black border border-green-500/30 rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-gray-400 mb-3">Search for a namespace (try: art, gaming, yourname)</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search"
                className="flex-1 bg-black border border-green-500/30 rounded px-4 py-3 text-white focus:border-green-400 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-green-400 text-black font-bold rounded hover:bg-green-300 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {searchResult === null && (
            <div className="p-8 text-center text-gray-500">
              Enter a namespace to see availability and value
            </div>
          )}

          {searchResult && (
            <div className={`p-6 rounded-lg border ${searchResult.available ? 'bg-green-400/10 border-green-400/30' : 'bg-red-400/10 border-red-400/30'}`}>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{searchResult.available ? '✓' : '✗'}</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {searchTerm} is {searchResult.available ? 'Available' : 'Taken'}
                </div>
                {searchResult.available && (
                  <>
                    <div className="text-gray-400 mb-4">Tier: {searchResult.tier}</div>
                    <div className="text-3xl font-bold text-green-400 mb-4">${searchResult.value.toLocaleString()}</div>
                    <button className="px-6 py-2 bg-green-400 text-black font-bold rounded hover:bg-green-300 transition-colors">
                      Claim Namespace
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 p-6 bg-blue-400/5 border border-blue-400/20 rounded-lg">
          <h3 className="text-lg font-bold text-blue-400 mb-3">Understanding the Demo</h3>
          <p className="text-gray-400">
            This simulation shows how namespace value is determined by tier (root, premium, standard), scarcity, and sub-namespace activity. 
            Early claims at higher tiers capture more value as the network grows. This is education through interaction, not a sales pitch.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================

function Footer() {
  return (
    <footer className="border-t border-green-500/20 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-3xl font-bold mb-4">Y3K</h3>
            <p className="text-gray-400 mb-6">Digital infrastructure built for the next century.</p>
            <div className="flex gap-4">
              <Link href="/docs" className="text-green-400 hover:text-green-300">Documentation</Link>
              <Link href="/status" className="text-green-400 hover:text-green-300">System Status</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-white mb-3">Y3K Markets</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div><Link href="/docs" className="hover:text-white">Documentation</Link></div>
                <div><Link href="/docs/whitepaper" className="hover:text-white">Whitepaper</Link></div>
                <div><a href="https://github.com/Y3KDigital" className="hover:text-white">GitHub</a></div>
                <div><Link href="/contact" className="hover:text-white">Contact</Link></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-green-500/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>© 2026 Y3K Markets. All rights reserved.</div>
          <div className="text-gray-400">Built for long-term value. Not speculation.</div>
        </div>
      </div>
    </footer>
  );
}
