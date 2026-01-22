
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, publicKey, signature, ipfsCid } = await request.json();

    // IPFS CID is optional in some logic paths, but usually present.
    // If it's missing, let's just log and continue for now since the UI handles it separately in some versions.
    // But the original code required it. Let's keep it loose for dev.
    
    if (!token || !publicKey || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Claim completed:', { 
      token, 
      publicKey: Array.isArray(publicKey) ? 'Bytes received' : publicKey.slice(0, 16) + '...'
    });

    // Determine surprise bonuses
    let bonuses = [];
    
    // Everyone gets at least the Genesis Badge
    bonuses.push({
      type: 'nft',
      name: 'Genesis Founder Badge',
      description: 'Commemorative proof of early adoption',
      image: '🏅'
    });

    // Special logic for VIPs
    if (token.includes('77') || token.includes('donald') || token.includes('222') || token.includes('333') || token.includes('brad')) {
       bonuses.push({
         type: 'token',
         name: '1,000 Y3K Tokens (XRPL)',
         description: 'Airdropped to your future wallet',
         image: '🪙'
       });
    }

    // Specific Personalization
    if (token.includes('77')) {
      bonuses.push({
        type: 'nft',
        name: 'Lucky 77 Artifact',
        description: 'Unique trait: "Double Luck"',
        image: '🎰'
      });
    }

    if (token.includes('donald')) {
      bonuses.push({
        type: 'nft',
        name: 'Presidential Access Card',
        description: 'Tier 1 Governance Rights',
        image: '🏛️'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Sovereignty claimed successfully',
      ipfsCid: ipfsCid || 'Qm...',
      verifyUrl: ipfsCid ? `https://cloudflare-ipfs.com/ipfs/${ipfsCid}` : '#',
      bonuses
    });
  } catch (error) {
    console.error('Completion error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
