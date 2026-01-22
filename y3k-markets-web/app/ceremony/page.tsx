'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClaimEvent {
  namespace: string;
  tier: string;
  timestamp: string;
  blockNumber?: number;
}

interface SupplyStats {
  tier: string;
  total: number;
  claimed: number;
  remaining: number;
  value: string;
}

export default function CeremonyPage() {
  const [recentClaims, setRecentClaims] = useState<ClaimEvent[]>([
    { namespace: 'brad.x', tier: 'Named Genesis', timestamp: '2026-01-18T01:52:00Z' },
    { namespace: '77.x', tier: 'Premium Double', timestamp: '2026-01-17T23:15:00Z' },
  ]);

  const [supplyStats] = useState<SupplyStats[]>([
    { tier: '1# Root (0-9)', total: 10, claimed: 0, remaining: 10, value: '$35,000' },
    { tier: '2# Premium (10-99)', total: 90, claimed: 2, remaining: 88, value: '$7,500' },
    { tier: '3# Standard (100-999)', total: 900, claimed: 3, remaining: 897, value: '$3,500' },
    { tier: 'Named Genesis', total: 10, claimed: 1, remaining: 9, value: '$7,500' },
    { tier: 'Triple Repeating', total: 45, claimed: 0, remaining: 45, value: '$7,500' },
    { tier: 'Ceremonial Grants', total: 10, claimed: 1, remaining: 9, value: 'Gift' },
  ]);

  const [countdown, setCountdown] = useState({
    days: 13,
    hours: 5,
    minutes: 42,
    seconds: 18
  });

  const [totalClaimed, setTotalClaimed] = useState(7);
  const [totalSupply] = useState(1000);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const claimedPercentage = ((totalClaimed / totalSupply) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
      {/* Header */}
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-6">
              <Link href="/mint" className="text-purple-300 hover:text-purple-100 transition">
                Claim Yours
              </Link>
              <Link href="/" className="text-slate-400 hover:text-white transition">
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4 animate-pulse">
            <span className="text-purple-400 text-sm font-semibold tracking-wider">🔮 GENESIS CEREMONY LIVE</span>
          </div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            The Ceremony
          </h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto">
            Watch as digital history is being written. Every claim is permanent. Every namespace is unique. 
            Once the ceremony ends, these will never be created again.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-orange-300 text-center mb-6">⏰ Ceremonial Access Ends In</h2>
          <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">{countdown.days}</div>
              <div className="text-orange-300 text-sm uppercase">Days</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">{countdown.hours}</div>
              <div className="text-orange-300 text-sm uppercase">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">{countdown.minutes}</div>
              <div className="text-orange-300 text-sm uppercase">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">{countdown.seconds}</div>
              <div className="text-orange-300 text-sm uppercase">Seconds</div>
            </div>
          </div>
          <p className="text-center text-slate-300 mt-6">
            After this time, ceremonial invitations expire. Unclaimed namespaces will be released to public auction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Supply Gauge */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-purple-400 mb-6">🌍 Global Supply Status</h2>
            
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Genesis Supply</span>
                <span className="text-white font-bold">{totalClaimed} / {totalSupply} Claimed ({claimedPercentage}%)</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-6 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${claimedPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-green-400">✓ {totalClaimed} Sovereign Owners</span>
                <span className="text-orange-400">{totalSupply - totalClaimed} Remaining</span>
              </div>
            </div>

            {/* Supply by Tier */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-300 mb-4">Supply by Rarity Tier</h3>
              {supplyStats.map((stat, i) => (
                <div key={i} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="text-white font-semibold">{stat.tier}</div>
                      <div className="text-slate-400 text-sm">{stat.value} market value</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-300">{stat.remaining}</div>
                      <div className="text-slate-400 text-sm">of {stat.total} left</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        stat.remaining === 0 ? 'bg-red-500' :
                        stat.remaining < stat.total * 0.1 ? 'bg-orange-500' :
                        stat.remaining < stat.total * 0.3 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(stat.remaining / stat.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Claims Feed */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">🔔 Live Ceremony Log</h2>
            
            {recentClaims.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔮</div>
                <p className="text-slate-400">Awaiting first claim...</p>
                <p className="text-slate-500 text-sm mt-2">The ceremony begins</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentClaims.map((claim, i) => (
                  <div 
                    key={i}
                    className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4 animate-fade-in"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">🎉</div>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-white mb-1">{claim.namespace}</div>
                        <div className="text-purple-300 text-sm">{claim.tier}</div>
                        <div className="text-slate-400 text-xs mt-2">
                          {new Date(claim.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Last Block</div>
              <div className="font-mono text-purple-300 text-xs">#826,543</div>
            </div>
          </div>
        </div>

        {/* Scarcity Warning */}
        <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-3xl font-bold text-yellow-300 mb-4">This Is Your Only Chance</h3>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto mb-6">
            The genesis ceremony happened once on January 17, 2026. These 1,000 namespaces can <strong>never be created again</strong>. 
            Every claim is permanent. Every namespace is unique. Once they're gone, they're gone forever.
          </p>
          <p className="text-yellow-400 font-semibold text-xl mb-6">
            Only {totalSupply - totalClaimed} of {totalSupply} remain.
          </p>
          <Link 
            href="/mint"
            className="inline-block px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold text-xl rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all shadow-lg"
          >
            Claim Your Namespace Now →
          </Link>
        </div>

        {/* Ceremony Details */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="text-xl font-bold text-purple-300 mb-2">Cryptographically Unique</h3>
            <p className="text-slate-400 text-sm">
              Each namespace created with entropy from Bitcoin, Ethereum, NIST beacons, and cosmic radiation
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">♾️</div>
            <h3 className="text-xl font-bold text-purple-300 mb-2">Yours Forever</h3>
            <p className="text-slate-400 text-sm">
              No renewal fees, no expiration, cannot be seized. True digital property rights.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">📜</div>
            <h3 className="text-xl font-bold text-purple-300 mb-2">IPFS Verified</h3>
            <p className="text-slate-400 text-sm">
              Every certificate published to IPFS with immutable proof of ownership
            </p>
          </div>
        </div>
      </div>

      {/* Sound effect element (hidden) */}
      <audio id="bell-sound" preload="auto">
        <source src="/sounds/ceremony-bell.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
