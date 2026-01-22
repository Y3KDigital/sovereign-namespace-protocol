// app/api/admin/transmit/route.ts
// The Digital Nervous System (Telnyx Integrated)

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { targetName, phoneNumber, tier } = await request.json();

    // 1. Validation
    if (!targetName || !phoneNumber) {
      return NextResponse.json({ error: "Missing Parameters" }, { status: 400 });
    }

    // 2. Load Secret (Server-Side Only)
    // We look for either custom env var or standard one, prioritizing the one we just set
    const apiKey = process.env.TELNYX_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: "TELNYX_OFFLINE", 
        details: "API Key not found in server environment." 
      }, { status: 503 });
    }

    // 3. Generate Link (Deterministic)
    const token = targetName.toLowerCase().replace(/\s/g, '');
    const claimLink = `https://y3k.market/claim?token=${token}`;

    // 4. Compose Message (The "Badass" Script)
    const messageBody = `SECURE TRANSMISSION // Y3K MARKETS\nTo: ${targetName}\nStatus: ${tier || 'Sovereign Operator'}\n\nYou have been selected.\nWe have reserved a Sovereign Namespace for you.\nThis is not a website. It is a mathematical property you own forever.\n\n1. Secure it: ${claimLink}\n2. Claim.\n3. Never start over again.\n\n- The Architect`;

    // 5. Fire (Telnyx API)
    // Using simple fetch to avoid dependencies
    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            from: "+18884218987", // Default or env source
            to: phoneNumber,
            text: messageBody
        })
    });

    const telnyxData = await telnyxResponse.json();

    if (!telnyxResponse.ok) {
        console.error("Telnyx Error:", telnyxData);
        return NextResponse.json({ 
            status: "FAILED", 
            provider_error: telnyxData 
        }, { status: 500 });
    }

    // 6. Log Success (Mock Ledger for now)
    const logEntry = {
        timestamp: new Date().toISOString(),
        target: targetName,
        phone: phoneNumber,
        token: token,
        status: "SENT",
        msg_id: telnyxData.data?.id
    };

    return NextResponse.json({
        status: "TRANSMITTED",
        log: logEntry,
        link_generated: claimLink
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Internal Error", details: err.message }, { status: 500 });
  }
}
