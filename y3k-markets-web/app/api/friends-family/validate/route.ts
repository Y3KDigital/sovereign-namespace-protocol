import { NextRequest, NextResponse } from 'next/server';

// Access codes - in production, store these in database
// Format: GENESIS-XXXX-XXXX
const VALID_ACCESS_CODES = new Set([
  // Founder tier (first 10)
  'GENESIS-F001-2026',
  'GENESIS-F002-2026',
  'GENESIS-F003-2026',
  'GENESIS-F004-2026',
  'GENESIS-F005-2026',
  'GENESIS-F006-2026',
  'GENESIS-F007-2026',
  'GENESIS-F008-2026',
  'GENESIS-F009-2026',
  'GENESIS-F010-2026',
  
  // Early supporter tier (next 90)
  'GENESIS-E011-2026',
  'GENESIS-E012-2026',
  'GENESIS-E013-2026',
  'GENESIS-E014-2026',
  'GENESIS-E015-2026',
  'GENESIS-E016-2026',
  'GENESIS-E017-2026',
  'GENESIS-E018-2026',
  'GENESIS-E019-2026',
  'GENESIS-E020-2026',
  // ... add more as needed
  
  // Test codes (remove in production)
  'GENESIS-TEST-0001',
  'GENESIS-DEMO-0001',
]);

// Track used codes (in production, use database)
const usedCodes = new Set<string>();

// Access window - 24 hours after genesis (8 PM EST Jan 16 to 8 PM EST Jan 17)
const GENESIS_COMPLETE_TIME = new Date('2026-01-16T20:00:00-05:00'); // 8 PM EST
const ACCESS_WINDOW_END = new Date('2026-01-17T20:00:00-05:00'); // 8 PM EST next day

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8081';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessCode } = body;

    if (!accessCode || typeof accessCode !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Access code is required' },
        { status: 400 }
      );
    }

    const code = accessCode.trim().toUpperCase();

    // Check if code format is valid
    if (!code.match(/^GENESIS-[A-Z0-9]{4}-[0-9]{4}$/)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid access code format. Expected: GENESIS-XXXX-2026' },
        { status: 400 }
      );
    }

    // Extract core code (e.g., F001)
    const coreCode = code.replace('GENESIS-', '').replace('-2026', '');

    // Call Backend for Validation
    try {
        const backendResp = await fetch(`${API_URL}/api/friends-family/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: coreCode })
        });
        
        if (!backendResp.ok) {
            console.error('Backend validation failed:', backendResp.status);
             return NextResponse.json(
                { valid: false, error: 'Validation service unavailable' },
                { status: 502 }
             );
        }

        const verification = await backendResp.json();
        
        if (!verification.valid) {
             return NextResponse.json(
                { valid: false, error: verification.message || 'Invalid access code' },
                { status: 401 }
             );
        }

        // Return success
        return NextResponse.json({
            valid: true,
            accessCode: code,
            tier: verification.tier,
            genesisFounder: verification.tier === 'founder',
            windowEnd: ACCESS_WINDOW_END.toISOString(),
        });

    } catch (err) {
        console.error('Backend connection error:', err);
        // Fallback or fail? Fail safe.
        return NextResponse.json(
             { valid: false, error: 'Validation service connection failed' },
             { status: 500 }
        );
    }

  } catch (error) {
    console.error('Error validating access code:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check access window status
export async function GET() {
  const now = new Date();
  
  return NextResponse.json({
    genesisCompleteTime: GENESIS_COMPLETE_TIME.toISOString(),
    accessWindowEnd: ACCESS_WINDOW_END.toISOString(),
    isOpen: now >= GENESIS_COMPLETE_TIME && now <= ACCESS_WINDOW_END,
    currentTime: now.toISOString(),
  });
}
