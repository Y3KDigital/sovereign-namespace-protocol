'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NamespaceData {
  namespace: string;
  certificates: string[];
  tier: string;
  rarity: string;
  claimedAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [namespace, setNamespace] = useState<NamespaceData | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has claimed namespace (from localStorage)
    const claimedData = localStorage.getItem('claimed_namespace');
    if (!claimedData) {
      router.push('/');
      return;
    }

    try {
      const data = JSON.parse(claimedData);
      setNamespace(data);
      setLoading(false);
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && !(window as any).ethereum) {
      alert('Please install MetaMask to connect your wallet');
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts'
      });
      setWalletAddress(accounts[0]);
      setWalletConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center">
        <div className="animate-pulse text-amber-400 text-2xl">Loading your namespace...</div>
      </div>
    );
  }

  if (!namespace) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900">
      {/* Header */}
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex items-center gap-4">
              {!walletConnected ? (
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg">
                  <span className="text-green-400 text-sm">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="inline-block px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
            <span className="text-amber-400 text-sm font-semibold tracking-wider">YOUR SOVEREIGN NAMESPACE</span>
          </div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-2">
            {namespace.namespace}
          </h1>
          <p className="text-slate-400 text-xl">
            Genesis Founder • {namespace.tier} Tier • {namespace.rarity}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certificates */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">📜 Your Certificates</h2>
              <div className="space-y-3">
                {namespace.certificates.map((cert, i) => (
                  <div key={i} className="bg-slate-700/30 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-mono text-lg">{cert}</p>
                      <p className="text-slate-400 text-sm">
                        {i === 0 && 'Root Identity'}
                        {cert.includes('auth') && 'Authentication System'}
                        {cert.includes('finance') && 'Financial Operations'}
                        {cert.includes('tel') && 'Communications'}
                        {cert.includes('vault') && 'Secure Storage'}
                        {cert.includes('registry') && 'Subdomain Manager'}
                      </p>
                    </div>
                    <span className="text-green-400">✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusive Offers */}
            <div className="bg-gradient-to-br from-amber-900/20 to-slate-900/20 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-amber-400">💎 Member Privileges</h2>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full uppercase tracking-wider">Genesis Access</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/ceremony" className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-amber-500/20 hover:border-amber-500/50 rounded-xl transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔔</span>
                    <span className="text-white font-semibold group-hover:text-amber-400 transition">Quantum Ceremony</span>
                  </div>
                  <p className="text-slate-400 text-sm">Participate in the global namespace bell ceremony.</p>
                </Link>
                <div className="p-4 bg-slate-800/20 border border-slate-700 rounded-xl opacity-75">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🛍️</span>
                    <span className="text-slate-300 font-semibold">Genesis Marketplace</span>
                  </div>
                  <p className="text-slate-500 text-sm">Exclusive trading rights coming soon.</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">⚡ Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 rounded-lg transition text-left">
                  <div className="text-2xl mb-2">🌐</div>
                  <div className="text-white font-semibold">Set Resolver</div>
                  <div className="text-slate-400 text-sm">Point to website/wallet</div>
                </button>
                <button className="p-4 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 rounded-lg transition text-left">
                  <div className="text-2xl mb-2">➕</div>
                  <div className="text-white font-semibold">Create Subdomain</div>
                  <div className="text-slate-400 text-sm">Unlimited subdomains</div>
                </button>
                <button className="p-4 bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 rounded-lg transition text-left">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-white font-semibold">Setup Payments</div>
                  <div className="text-slate-400 text-sm">Receive crypto</div>
                </button>
                <button className="p-4 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-500/30 rounded-lg transition text-left">
                  <div className="text-2xl mb-2">🔑</div>
                  <div className="text-white font-semibold">Export Keys</div>
                  <div className="text-slate-400 text-sm">For wallet import</div>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-amber-400 mb-4">📊 Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-slate-400 text-sm">Certificates Owned</div>
                  <div className="text-white text-2xl font-bold">{namespace.certificates.length}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Subdomains Created</div>
                  <div className="text-white text-2xl font-bold">0</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Resolver Records</div>
                  <div className="text-white text-2xl font-bold">0</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Estimated Value</div>
                  <div className="text-green-400 text-2xl font-bold">$7,500+</div>
                </div>
              </div>
            </div>

            {/* Network */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-amber-400 mb-4">🌐 Network</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol</span>
                  <span className="text-white">Y3K v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chain</span>
                  <span className="text-white">Base L2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage</span>
                  <span className="text-white">IPFS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="text-green-400">● Active</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-purple-300 mb-2">Need Help?</h3>
              <p className="text-slate-300 text-sm mb-4">
                New to Y3K? Check out our guides to get started.
              </p>
              <Link 
                href="https://docs.y3kmarkets.com" 
                target="_blank"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View Documentation →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
