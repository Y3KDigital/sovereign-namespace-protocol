// Example: Wire ledger-client.ts to Dashboard Wallet Tile
//
// This shows how to integrate the existing ledger-client.ts with 
// the new Rust L1 indexer (running on port 8089).
//
// NO CODE CHANGES NEEDED - just update .env.local

// FILE: y3k-markets-web/.env.local
// Add or update this line:
// NEXT_PUBLIC_LEDGER_API=http://localhost:8089

// FILE: y3k-markets-web/components/wallet/WalletTile.tsx (EXAMPLE)

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getBalances, formatBalance, getUserAccount } from "@/lib/ledger-client";

export default function WalletTile() {
  const { data: session } = useSession();

  // Get balances from Rust L1 indexer
  const { data: balances, isLoading } = useQuery({
    queryKey: ["balances", session?.user?.sub],
    queryFn: async () => {
      if (!session?.user?.sub) return [];
      const account = getUserAccount(session.user.sub); // acct:user:{sub}
      return await getBalances(account);
    },
    enabled: !!session?.user?.sub,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return <div>Loading balances...</div>;
  }

  return (
    <div className="wallet-tile">
      <h3>My Balances</h3>
      {balances?.map((bal) => (
        <div key={bal.asset} className="balance-row">
          <span className="asset-symbol">{bal.asset}</span>
          <span className="balance-amount">
            {formatBalance(bal.balance_wei, 18)} {bal.asset}
          </span>
        </div>
      ))}
    </div>
  );
}

// BEFORE (cached JSON):
// - Dashboard read from static file or database cache
// - Balances could be stale or out of sync
// - No verifiable state root

// AFTER (Rust L1 indexer):
// - Dashboard queries /balances endpoint (port 8089)
// - Reads from live ChainState (always current)
// - Verifiable via /audit state root
// - Same API contract - no code changes needed

// Key Benefits:
// ✅ Real-time balances (not cached)
// ✅ Verifiable state (state root from /audit)
// ✅ Sovereign truth (Rust L1 ChainState)
// ✅ Drop-in replacement (same API shape)

// Optional: Show state root for verification
export function StateRootBadge() {
  const { data: audit } = useQuery({
    queryKey: ["audit"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LEDGER_API}/audit`);
      return await response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="state-root-badge" title="Rust L1 State Root">
      <span>🔐</span>
      <code>{audit?.state_root?.slice(0, 8)}...</code>
      <span className="height">Height: {audit?.height}</span>
    </div>
  );
}
