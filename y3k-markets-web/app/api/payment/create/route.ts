import { NextRequest, NextResponse } from 'next/server';

// NOTE: This is a placeholder for static builds
// Real implementation is in separate API server (payments-api/src/api-server.js)
// This route exists only to satisfy Next.js static build requirements

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'API not implemented - use separate API server at /api/payment/create'
  }, { status: 501 });
}
