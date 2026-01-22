'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NamespaceNode {
  name: string;
  claimed: boolean;
  controller?: string;
  registered_at?: string;
  children: NamespaceNode[];
  level: number;
}

interface BlockchainNamespace {
  namespace: string;
  controller: string;
  metadata_hash: string;
  registered_at: string;
}

export default function RegistryExplorer() {
  const [namespaces, setNamespaces] = useState<NamespaceNode[]>([]);
  const [claimedCount, setClaimedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'bracket' | 'timeline' | 'fractal'>('bracket');
  const [filter, setFilter] = useState<'all' | 'claimed' | 'available'>('all');

  // Genesis roots - all 1000 roots from the protocol
  const GENESIS_ROOTS = [
    // Named roots (VIP/Partners)
    'brad.x', 'trump.x', 'don.x', 'rogue.x', 'buck.x',
    // Number roots (1-1000)
    ...Array.from({ length: 1000 }, (_, i) => `${i + 1}.x`)
  ];

  // Sub-namespace patterns for each root
  const SUB_PATTERNS = [
    'auth', 'finance', 'tel', 'vault', 'registry', 'ops', 'data', 
    'mail', 'calendar', 'contacts', 'events', 'policy', 'truth', 
    'win', 'brand', 'media', 'stealth'
  ];

  useEffect(() => {
    loadBlockchainState();
  }, []);

  async function loadBlockchainState() {
    try {
      const apiBase = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${apiBase}/api/blockchain/list`);
      const data = await response.json();

      const claimedNamespaces: Record<string, BlockchainNamespace> = {};
      
      // Fetch details for each claimed namespace
      for (const ns of data.namespaces || []) {
        const detailResponse = await fetch(`${apiBase}/api/blockchain/check/${ns}`);
        const detail = await detailResponse.json();
        if (detail.exists) {
          claimedNamespaces[ns] = detail.namespace;
        }
      }

      // Build namespace tree
      const tree = buildNamespaceTree(GENESIS_ROOTS, claimedNamespaces);
      setNamespaces(tree);
      setClaimedCount(data.namespaces?.length || 0);
    } catch (error) {
      console.error('Failed to load blockchain state:', error);
    } finally {
      setLoading(false);
    }
  }

  function buildNamespaceTree(roots: string[], claimed: Record<string, BlockchainNamespace>): NamespaceNode[] {
    return roots.map(root => {
      const node: NamespaceNode = {
        name: root,
        claimed: !!claimed[root],
        controller: claimed[root]?.controller,
        registered_at: claimed[root]?.registered_at,
        children: [],
        level: 0
      };

      // Add known sub-namespaces
      const baseName = root.replace('.x', '');
      SUB_PATTERNS.forEach(pattern => {
        const subName = `${pattern}.${root}`;
        if (claimed[subName]) {
          node.children.push({
            name: subName,
            claimed: true,
            controller: claimed[subName]?.controller,
            registered_at: claimed[subName]?.registered_at,
            children: [],
            level: 1
          });
        }
      });

      return node;
    });
  }

  const filteredNamespaces = namespaces.filter(ns => {
    if (filter === 'claimed') return ns.claimed;
    if (filter === 'available') return !ns.claimed;
    return true;
  });

  const timelineData = namespaces
    .filter(ns => ns.claimed && ns.registered_at)
    .sort((a, b) => new Date(a.registered_at!).getTime() - new Date(b.registered_at!).getTime());

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-2xl text-cyan-400 animate-pulse">Loading Namespace Registry...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            NAMESPACE REGISTRY
          </h1>
          <p className="text-gray-400">Fractal Bracket System • On-Chain State • Genesis Roots</p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-900/40 border border-cyan-900/30 p-4">
              <div className="text-xs text-cyan-600 mb-1">TOTAL ROOTS</div>
              <div className="text-2xl font-bold text-cyan-400">{GENESIS_ROOTS.length.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900/40 border border-green-900/30 p-4">
              <div className="text-xs text-green-600 mb-1">CLAIMED</div>
              <div className="text-2xl font-bold text-green-400">{claimedCount}</div>
            </div>
            <div className="bg-gray-900/40 border border-gray-800 p-4">
              <div className="text-xs text-gray-500 mb-1">AVAILABLE</div>
              <div className="text-2xl font-bold text-white">{(GENESIS_ROOTS.length - claimedCount).toLocaleString()}</div>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setView('bracket')}
              className={`px-4 py-2 rounded ${view === 'bracket' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400'}`}
            >
              Bracket View
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`px-4 py-2 rounded ${view === 'timeline' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400'}`}
            >
              Timeline View
            </button>
            <button
              onClick={() => setView('fractal')}
              className={`px-4 py-2 rounded ${view === 'fractal' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400'}`}
            >
              Fractal View
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded text-sm ${filter === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'}`}
            >
              All ({GENESIS_ROOTS.length})
            </button>
            <button
              onClick={() => setFilter('claimed')}
              className={`px-4 py-2 rounded text-sm ${filter === 'claimed' ? 'bg-green-900/50 text-green-400' : 'bg-gray-900 text-gray-500'}`}
            >
              Claimed ({claimedCount})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded text-sm ${filter === 'available' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'}`}
            >
              Available ({GENESIS_ROOTS.length - claimedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {view === 'bracket' && <BracketView namespaces={filteredNamespaces} />}
        {view === 'timeline' && <TimelineView timeline={timelineData} />}
        {view === 'fractal' && <FractalView namespaces={filteredNamespaces} />}
      </div>
    </div>
  );
}

function BracketView({ namespaces }: { namespaces: NamespaceNode[] }) {
  return (
    <div className="space-y-2">
      {namespaces.slice(0, 100).map((ns, i) => (
        <div key={i} className="border border-gray-800 bg-gray-900/20 p-3 hover:bg-gray-900/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${ns.claimed ? 'bg-green-400' : 'bg-gray-600'}`} />
              <span className="text-lg font-bold text-cyan-400">{ns.name}</span>
              {ns.claimed && (
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">CLAIMED</span>
              )}
            </div>
            {ns.controller && (
              <span className="text-xs text-gray-500 font-mono">
                {ns.controller.substring(0, 8)}...{ns.controller.substring(ns.controller.length - 8)}
              </span>
            )}
          </div>
          
          {/* Sub-namespaces */}
          {ns.children.length > 0 && (
            <div className="ml-8 mt-2 space-y-1">
              {ns.children.map((child, j) => (
                <div key={j} className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="text-gray-600">└─</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-green-400">{child.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {namespaces.length > 100 && (
        <div className="text-center text-gray-500 py-4">
          Showing first 100 of {namespaces.length} namespaces
        </div>
      )}
    </div>
  );
}

function TimelineView({ timeline }: { timeline: NamespaceNode[] }) {
  return (
    <div className="relative">
      {/* Timeline axis */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-cyan-900/30" />
      
      <div className="space-y-6">
        {timeline.map((ns, i) => (
          <div key={i} className="relative pl-16">
            {/* Timeline dot */}
            <div className="absolute left-6 top-2 w-4 h-4 rounded-full bg-cyan-400 border-4 border-black" />
            
            <div className="border border-cyan-900/30 bg-gray-900/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-cyan-400">{ns.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(ns.registered_at!).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Controller: <span className="font-mono text-green-400">{ns.controller?.substring(0, 16)}...</span>
              </div>
              {ns.children.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {ns.children.length} sub-namespace{ns.children.length !== 1 ? 's' : ''} created
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {timeline.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No claimed namespaces yet. Timeline will populate as roots are claimed.
        </div>
      )}
    </div>
  );
}

function FractalView({ namespaces }: { namespaces: NamespaceNode[] }) {
  const claimed = namespaces.filter(ns => ns.claimed);
  
  return (
    <div className="grid grid-cols-8 gap-2">
      {namespaces.slice(0, 200).map((ns, i) => (
        <div
          key={i}
          className={`aspect-square border ${
            ns.claimed 
              ? 'border-green-500 bg-green-900/20 hover:bg-green-900/40' 
              : 'border-gray-800 bg-gray-900/10 hover:bg-gray-900/30'
          } flex items-center justify-center text-xs transition-all cursor-pointer group relative`}
          title={ns.name}
        >
          <span className={ns.claimed ? 'text-green-400' : 'text-gray-600'}>
            {ns.name.replace('.x', '')}
          </span>
          
          {/* Hover details */}
          <div className="absolute inset-0 bg-black/95 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-center text-xs">
            <div className="text-cyan-400 font-bold mb-1 truncate">{ns.name}</div>
            {ns.claimed ? (
              <>
                <div className="text-green-400 text-xs">✓ CLAIMED</div>
                {ns.children.length > 0 && (
                  <div className="text-gray-400 text-xs mt-1">
                    {ns.children.length} sub{ns.children.length !== 1 ? 's' : ''}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500">Available</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
