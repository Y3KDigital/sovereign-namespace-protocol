import { NextRequest, NextResponse } from 'next/server';

// NOTE: This is a placeholder for static builds
// Real implementation is in separate API server (payments-api/src/api-server.js)
// This route exists only to satisfy Next.js static build requirements
// 
// Use query parameter: /api/payment/status?id=<payment_id>

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: 'API not implemented - use separate API server at /api/payment/status/:id'
  }, { status: 501 });
}
