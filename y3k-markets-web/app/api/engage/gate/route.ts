import { NextResponse } from 'next/server';
import { verifyEngagementGate } from '@/lib/engagement-gate';

// This endpoint is used by external systems (Slack, Deal Flow, Contracts) 
// to check if they are allowed to proceed with "Work".

export async function POST(request: Request) {
  try {
    const { engagement_bundle } = await request.json();
    
    // Validate the bundle
    const result = verifyEngagementGate(engagement_bundle);

    return NextResponse.json(result);

  } catch (err) {
    return NextResponse.json({ status: "PENDING", error: "Invalid request" }, { status: 400 });
  }
}
