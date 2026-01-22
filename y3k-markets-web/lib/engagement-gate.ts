export interface EngagementVerificationResult {
  isComplete: boolean;
  missingRequirements: string[];
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
}

export function verifyEngagementGate(bundle: any): EngagementVerificationResult {
  const missing: string[] = [];

  if (!bundle) return { isComplete: false, missingRequirements: ['No bundle found'], status: 'PENDING' };
  
  // 1. Check Identity Binding
  if (!bundle.participant_id) missing.push('Missing Participant ID (DID)');

  // 2. Check Role
  if (!bundle.role_declaration?.role) missing.push('Missing Role Declaration');

  // 3. Check Payout Routing
  if (!bundle.payout_routing?.preference_type) missing.push('Missing Payout Routing Preference');
  if (bundle.payout_routing?.preference_type === 'self_custody' && !bundle.payout_routing?.destination?.address) {
    missing.push('Missing Self-Custody Address');
  }

  // 4. Check Signature
  if (!bundle.signature?.value) missing.push('Missing Cryptographic Signature');

  // 5. Check Terms Agreement
  if (!bundle.terms_hash) missing.push('Missing Terms Acceptance');

  return {
    isComplete: missing.length === 0,
    missingRequirements: missing,
    status: missing.length === 0 ? 'ACTIVE' : 'PENDING'
  };
}
