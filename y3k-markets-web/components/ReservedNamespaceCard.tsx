import React from 'react';

interface ReservedNamespaceCardProps {
  label: string;
  tier: 0 | 1 | 2;
  sovereignty: string;
  status: 'protocol-owned' | 'delegated' | 'available';
  activeSubdomains?: number;
  phoneRouting?: string;
  aiAgents?: number;
  delegatee?: string;
  delegationTerms?: string;
}

export function ReservedNamespaceCard({
  label,
  tier,
  sovereignty,
  status,
  activeSubdomains = 0,
  phoneRouting,
  aiAgents = 0,
  delegatee,
  delegationTerms,
}: ReservedNamespaceCardProps) {
  const tierColors = {
    0: 'border-purple-500 bg-purple-50',
    1: 'border-cyan-500 bg-cyan-50',
    2: 'border-blue-500 bg-blue-50',
  };

  const tierLabels = {
    0: '🏛️ TIER 0: CONSTITUTIONAL',
    1: '🏦 TIER 1: STRATEGIC ASSET',
    2: '💎 TIER 2: PREMIUM MARKET',
  };

  const statusBadges = {
    'protocol-owned': (
      <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-semibold">
        Protocol-Owned
      </span>
    ),
    'delegated': (
      <span className="px-3 py-1 bg-cyan-600 text-white rounded-full text-sm font-semibold">
        Delegated
      </span>
    ),
    'available': (
      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
        Available
      </span>
    ),
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${tierColors[tier]} transition-all hover:shadow-lg`}>
      {/* Tier Badge */}
      <div className="text-xs font-bold text-gray-600 mb-2">
        {tierLabels[tier]}
      </div>

      {/* Namespace Label */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{label}</h3>
        {statusBadges[status]}
      </div>

      {/* Sovereignty Class */}
      <div className="mb-4">
        <span className="text-sm text-gray-600">Sovereignty: </span>
        <span className="text-sm font-semibold text-gray-800">{sovereignty}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-gray-300">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{activeSubdomains}</div>
          <div className="text-xs text-gray-600">Active Subdomains</div>
        </div>
        {phoneRouting && (
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{phoneRouting}</div>
            <div className="text-xs text-gray-600">Phone Routing</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{aiAgents}</div>
          <div className="text-xs text-gray-600">AI Agents</div>
        </div>
      </div>

      {/* Delegation Info */}
      {delegatee && (
        <div className="mb-4 p-3 bg-white rounded border border-gray-200">
          <div className="text-sm">
            <span className="font-semibold">Delegatee: </span>
            <span className="text-gray-700">{delegatee}</span>
          </div>
          {delegationTerms && (
            <div className="text-sm mt-1">
              <span className="font-semibold">Terms: </span>
              <span className="text-gray-700">{delegationTerms}</span>
            </div>
          )}
        </div>
      )}

      {/* Availability Message */}
      <div className="mb-4">
        {status === 'protocol-owned' && tier === 0 && (
          <p className="text-sm text-gray-600 italic">
            🔒 Non-transferable constitutional namespace. Delegation only via governance approval.
          </p>
        )}
        {status === 'protocol-owned' && tier === 1 && (
          <p className="text-sm text-gray-600 italic">
            ⚡ Available for delegation or partnership. Contact protocol governance.
          </p>
        )}
        {status === 'available' && (
          <p className="text-sm text-gray-600 italic">
            ✨ Available for purchase or lease. View pricing and terms.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {status === 'protocol-owned' && (
          <>
            <button className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
              Request Partnership
            </button>
            <button className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors">
              View Documentation
            </button>
          </>
        )}
        {status === 'delegated' && (
          <button className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors">
            View Subdomain API
          </button>
        )}
        {status === 'available' && (
          <>
            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
              Purchase / Lease
            </button>
            <button className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition-colors">
              View Details
            </button>
          </>
        )}
      </div>

      {/* Protocol Message */}
      {tier <= 1 && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-500 text-center">
            {tier === 0 
              ? "Constitutional namespaces establish protocol authority and enable institutional trust"
              : "Strategic assets generate sustainable revenue through subdomain delegation"
            }
          </p>
        </div>
      )}
    </div>
  );
}

// Example usage with sample data
export function ReservedNamespaceExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Tier 0 Example */}
      <ReservedNamespaceCard
        label="y3k.protocol"
        tier={0}
        sovereignty="ProtocolReserved"
        status="protocol-owned"
        activeSubdomains={0}
        aiAgents={0}
      />

      {/* Tier 1 Example - Owned */}
      <ReservedNamespaceCard
        label="law"
        tier={1}
        sovereignty="ProtocolControlled"
        status="protocol-owned"
        activeSubdomains={12}
        phoneRouting="+1-800-LAW-Y3K"
        aiAgents={3}
      />

      {/* Tier 1 Example - Delegated */}
      <ReservedNamespaceCard
        label="intake.law"
        tier={1}
        sovereignty="ProtocolControlled"
        status="delegated"
        activeSubdomains={5}
        phoneRouting="+1-800-555-0100"
        aiAgents={1}
        delegatee="LegalTech Inc"
        delegationTerms="Commercial Lease - 3 years - $50K/year"
      />

      {/* Tier 2 Example - Available */}
      <ReservedNamespaceCard
        label="injury.law"
        tier={2}
        sovereignty="Transferable"
        status="available"
        activeSubdomains={0}
        aiAgents={0}
      />
    </div>
  );
}
