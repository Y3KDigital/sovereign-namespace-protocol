export async function onRequestPost({ request, env }: any) {
  try {
    const { targetName, phoneNumber, tier } = await request.json();

    // 1. Validation
    if (!targetName || !phoneNumber) {
      return new Response(JSON.stringify({ error: "Missing Parameters" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Load Secret (Environment Variable from Cloudflare Pages)
    const apiKey = env.TELNYX_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "TELNYX_OFFLINE", 
        details: "API Key not found in environment." 
      }), { 
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Generate Link (Deterministic)
    const token = targetName.toLowerCase().replace(/\s/g, '');
    const claimLink = `https://y3kmarkets.com/claim?token=${token}`;

    // 4. Compose Message (The "Badass" Script)
    const messageBody = `SECURE TRANSMISSION // Y3K MARKETS\nTo: ${targetName}\nStatus: ${tier || 'Sovereign Operator'}\n\nYou have been selected.\nWe have reserved a Sovereign Namespace for you.\nThis is not a website. It is a mathematical property you own forever.\n\n1. Secure it: ${claimLink}\n2. Claim.\n3. Never start over again.\n\n- The Architect`;

    // 5. Fire (Telnyx API)
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
        return new Response(JSON.stringify({
            error: "CARRIER REJECTION",
            details: telnyxData
        }), { 
            status: 502,
            headers: { "Content-Type": "application/json" }
        });
    }

    // 6. Success
    return new Response(JSON.stringify({
        success: true,
        log: telnyxData,
        link_generated: claimLink
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Internal System Error", details: err.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
  }
}
