// Y3K Sovereign Session API
// Canonical state endpoint - all systems read from here

import type { NextRequest } from 'next/server';
import type { SovereignSession, SessionStatus } from '@/lib/sovereign-session';

// In-memory store (replace with PostgreSQL/Redis in production)
const sessions = new Map<string, SovereignSession>();

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;
  
  // Retrieve session
  const session = sessions.get(sessionId);
  
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Session not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Return full session state
  return new Response(
    JSON.stringify({
      success: true,
      session,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=10', // 10s cache (state changes)
      },
    }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;
  const body = await request.json();
  
  const existingSession = sessions.get(sessionId);
  
  if (!existingSession) {
    return new Response(
      JSON.stringify({ error: 'Session not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Validate state transition if status is changing
  if (body.status && body.status !== existingSession.status) {
    const { VALID_TRANSITIONS } = await import('@/lib/sovereign-session');
    const validNextStates = VALID_TRANSITIONS[existingSession.status];
    
    if (!validNextStates.includes(body.status as SessionStatus)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid state transition',
          current: existingSession.status,
          attempted: body.status,
          valid: validNextStates,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // Merge updates (shallow merge)
  const updatedSession: SovereignSession = {
    ...existingSession,
    ...body,
    audit: {
      ...existingSession.audit,
      ...body.audit,
    },
  };
  
  sessions.set(sessionId, updatedSession);
  
  return new Response(
    JSON.stringify({
      success: true,
      session: updatedSession,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate required fields
  if (!body.session_id || !body.namespace || !body.controller) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: session_id, namespace, controller' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Check for duplicate
  if (sessions.has(body.session_id)) {
    return new Response(
      JSON.stringify({ error: 'Session already exists' }),
      { status: 409, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Create new session
  const newSession: SovereignSession = {
    session_id: body.session_id,
    namespace: body.namespace,
    controller: body.controller,
    operator_mode: body.operator_mode || 'OBSERVER',
    status: body.status || 'CLAIMED',
    identity_target: body.identity_target,
    ai_verdict: body.ai_verdict,
    ai_reasoning: body.ai_reasoning,
    ipfs_certificate: body.ipfs_certificate,
    audit: {
      created_at: new Date().toISOString(),
      claimed_at: body.status === 'CLAIMED' ? new Date().toISOString() : undefined,
      ...body.audit,
    },
    metadata: body.metadata,
  };
  
  sessions.set(body.session_id, newSession);
  
  return new Response(
    JSON.stringify({
      success: true,
      session: newSession,
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
