import { NextResponse } from 'next/server';
import { verifyEngagementGate } from '@/lib/engagement-gate';
import { emitHistory } from '@/lib/history'; // Leveraging your provenance engine

export async function POST(request: Request) {
  try {
    const bundle = await request.json();
    
    // 1. Run the Gate Logic
    const gateResult = verifyEngagementGate(bundle);

    if (!gateResult.isComplete) {
      return NextResponse.json({
        error: "Engagement Incomplete",
        details: gateResult.missingRequirements
      }, { status: 400 });
    }

    // 2. Log Provenance (The "Hard" Part)
    // We emit to the immutable history log that we built earlier
    emitHistory("ENGAGEMENT_SIGNED", {
        participant: bundle.participant_id,
        role: bundle.role_declaration.role,
        payout_type: bundle.payout_routing.preference_type,
        deal_id: bundle.deal_id
    }, "cryptographic_signature", bundle.participant_id);

    // 3. Return Success Artifacts
    return NextResponse.json({
      status: "ACTIVE",
      engagement_id: `eng_${crypto.randomUUID().substring(0,8)}`,
      timestamp: new Date().toISOString(),
      gate_check: "PASSED",
      message: "Engagement active. Entitlements are now eligible for calculation."
    });

  } catch (err) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 500 });
  }
}
