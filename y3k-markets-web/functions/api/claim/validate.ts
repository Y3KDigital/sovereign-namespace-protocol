// Token validation
export async function onRequestPost(context: any) {
  const VALID_TOKENS: Record<string, any> = {
    // ============================================
    // DONALD J. TRUMP: trump.x (Entertainment/Auction Reserve)
    // ============================================
    'trump': {
      namespace: 'trump.x',
      displayName: 'The Brand Sovereign',
      realName: '[Truth Layer Protected]',
      description: "trump.x - The ultimate brand namespace. Entertainment, business, legacy. Your identity, your rules.",
      whatYouOwn: [
        'Root Namespace: trump.x',
        'Truth Node: truth.trump.x',
        'Victory Vault: win.trump.x',
        'Brand Core: brand.trump.x',
        'Media: media.trump.x'
      ],
      certificates: ['trump.x', 'truth.trump.x', 'win.trump.x', 'brand.trump.x', 'media.trump.x'],
      legalFraming: 'Sovereign Brand Asset. Truth layer encrypted. Uncensorable identity.',
      tier: 'Crown Sovereign',
      rarity: 'Unique (1 of 1)',
      valid: true
    },
    'don': {
      namespace: 'don.x',
      displayName: 'Don Sovereign',
      realName: '[Truth Layer Protected]',
      description: "don.x - Clean, powerful, timeless. Your digital empire starts here.",
      whatYouOwn: [
        'Root Namespace: don.x',
        'Auth: don.auth.x',
        'Finance: don.finance.x',
        'Communications: don.tel.x'
      ],
      certificates: ['don.x', 'don.auth.x', 'don.finance.x', 'don.tel.x'],
      legalFraming: 'Sovereign Personal Asset. Truth layer encrypted.',
      tier: 'Named Sovereign',
      rarity: 'Unique (1 of 1)',
      valid: true
    },

    // ============================================
    // DON (PARTNER): 77.x - The Golden 77
    // ============================================
    'don77': {
      namespace: '77.x',
      displayName: 'The 77th Sovereign',
      realName: 'Don',
      description: "The Golden 77. Double luck. Double power. Mathematical destiny.",
      whatYouOwn: [
        'Root Namespace: 77.x',
        'Truth Node: truth.77.x',
        'Victory Vault: win.77.x',
        'Legacy: 47.77.x'
      ],
      certificates: ['77.x', 'truth.77.x', 'win.77.x', '47.77.x'],
      legalFraming: 'Sovereign Personal Asset. Uncensorable. Immutable. Forever.',
      tier: 'Jackpot Sovereign',
      rarity: 'Unique (1 of 1)',
      valid: true
    },

    // ============================================
    // BRAD PARSCALE: brad.x + 45.x (Dual Sovereignty)
    // ============================================
    'brad': {
      namespace: 'brad.x',
      displayName: 'Campaign Architect',
      realName: 'Brad Parscale',
      description: "brad.x - Your name, your namespace. Personal brand meets strategic command.",
      whatYouOwn: [
        'Root Authority: brad.x',
        'Auth: brad.auth.x',
        'Operations: brad.ops.x',
        'Data: brad.data.x'
      ],
      certificates: ['brad.x', 'brad.auth.x', 'brad.ops.x', 'brad.data.x'],
      legalFraming: 'Sovereign Personal Brand. Strategic command authority.',
      tier: 'Named Sovereign',
      rarity: 'Unique (1 of 1)',
      valid: true
    },
    'brad45': {
      namespace: '45.x',
      displayName: 'Protocol 45 Architect',
      realName: 'Brad Parscale',
      description: "The 45th Root. Command infrastructure. Campaign sovereignty.",
      whatYouOwn: [
        'Root Authority: 45.x',
        'Ops Node: ops.45.x',
        'Data Core: data.45.x',
        'Strategy: win.45.x'
      ],
      certificates: ['45.x', 'ops.45.x', 'data.45.x', 'win.45.x'],
      legalFraming: 'Operational Command Structure. Delegated sovereign authority.',
      tier: 'Strategic Command',
      rarity: 'Unique (1 of 1)',
      valid: true
    },

    // ============================================
    // ROGUE.X - Strategic Reserve
    // ============================================
    'rogue': {
      namespace: 'rogue.x',
      displayName: 'Rogue Operator',
      realName: '[Truth Layer Protected]',
      description: "rogue.x - Off the grid. Sovereign by design. No permission required.",
      whatYouOwn: [
        'Root Namespace: rogue.x',
        'Stealth: stealth.rogue.x',
        'Operations: ops.rogue.x',
        'Vault: vault.rogue.x'
      ],
      certificates: ['rogue.x', 'stealth.rogue.x', 'ops.rogue.x', 'vault.rogue.x'],
      legalFraming: 'Sovereign Operational Asset. Maximum privacy architecture.',
      tier: 'Shadow Sovereign',
      rarity: 'Unique (1 of 1)',
      valid: true
    },
    '77-2026-01-17-z7a2c8d1e5b4928f5ae2d3b4c6a7z8d1': {
      namespace: '77.x',
      displayName: 'Genesis Founder',
      realName: 'Seven',
      description: "Lucky sevens - your name, your namespace. 77.x represents double luck, double power.",
      certificates: ['77.x', '77.auth.x', '77.finance.x', '77.tel.x', '77.vault.x', '77.registry.x'],
      tier: 'Named Number',
      rarity: 'Fortune (1 of 10)',
      valid: true
    },

    // ============================================
    // BUCK.X - Genesis Founder
    // ============================================
    'buck': {
      namespace: 'buck.x',
      displayName: 'Buck',
      realName: 'Buck',
      description: "buck.x - Your sovereign digital identity. Permanent, uncensorable, truly yours. No renewals, no middlemen.",
      whatYouOwn: [
        'Root Namespace: buck.x',
        'Authentication: buck.auth.x',
        'Finance Hub: buck.finance.x',
        'Communications: buck.tel.x',
        'Vault Storage: buck.vault.x',
        'Registry Control: buck.registry.x'
      ],
      certificates: ['buck.x', 'buck.auth.x', 'buck.finance.x', 'buck.tel.x', 'buck.vault.x', 'buck.registry.x'],
      legalFraming: 'Perpetual digital property with Ed25519 cryptographic sovereignty. Zero renewal fees, infinite ownership.',
      tier: 'Genesis Founder',
      rarity: 'Personal Identity (1 of 1)',
      valid: true
    },

    // ============================================
    // JIMI.X - Genesis Founder
    // ============================================
    'jimi': {
      namespace: 'jimi.x',
      displayName: 'Jimi',
      realName: 'Jimi',
      description: "jimi.x - Your personal sovereign namespace. Built for the AI economy. Owned forever.",
      whatYouOwn: [
        'Root Namespace: jimi.x',
        'Authentication: jimi.auth.x',
        'Finance Hub: jimi.finance.x',
        'Communications: jimi.tel.x',
        'Vault Storage: jimi.vault.x',
        'Registry Control: jimi.registry.x'
      ],
      certificates: ['jimi.x', 'jimi.auth.x', 'jimi.finance.x', 'jimi.tel.x', 'jimi.vault.x', 'jimi.registry.x'],
      legalFraming: 'Perpetual digital property with Ed25519 cryptographic sovereignty. Zero renewal fees, infinite ownership.',
      tier: 'Genesis Founder',
      rarity: 'Personal Identity (1 of 1)',
      valid: true
    },

    // ============================================
    // BEN.X - Genesis Founder
    // ============================================
    'ben': {
      namespace: 'ben.x',
      displayName: 'Ben',
      realName: 'Ben',
      description: "ben.x - Your sovereign digital identity. Permanent, uncensorable, truly yours. No renewals, no middlemen.",
      whatYouOwn: [
        'Root Namespace: ben.x',
        'Authentication: ben.auth.x',
        'Finance Hub: ben.finance.x',
        'Communications: ben.tel.x',
        'Vault Storage: ben.vault.x',
        'Registry Control: ben.registry.x'
      ],
      certificates: ['ben.x', 'ben.auth.x', 'ben.finance.x', 'ben.tel.x', 'ben.vault.x', 'ben.registry.x'],
      legalFraming: 'Perpetual digital property with Ed25519 cryptographic sovereignty. Zero renewal fees, infinite ownership.',
      tier: 'Genesis Founder',
      rarity: 'Personal Identity (1 of 1)',
      valid: true
    },

    // ============================================
    // NAMED NAMESPACE: donald.x - Donald (DISABLED FOR VIP PROTOCOL)
    // ============================================
    // 'donald': {
    //   namespace: 'donald.x',
    //   displayName: 'Genesis Founder',
    //   realName: 'Donald',
    //   description: "Your personal sovereign namespace - donald.x. Like owning your own .com, but permanent, blockchain-verified, and truly yours. No middlemen, no renewals, no seizure risk.",
    //   whatYouOwn: [
    //     'Primary namespace: donald.x — Your digital identity',
    //     'Authentication: donald.auth.x — Secure login across Web3',
    //     'Finance: donald.finance.x — DeFi treasury & payments',
    //     'Communications: donald.tel.x — Encrypted messaging',
    //     'Storage: donald.vault.x — Secure file storage',
    //     'Registry: donald.registry.x — Subdomain management'
    //   ],
    //   certificates: ['donald.x', 'donald.auth.x', 'donald.finance.x', 'donald.tel.x', 'donald.vault.x', 'donald.registry.x'],
    //   legalFraming: 'Perpetual digital property rights with Ed25519 cryptographic ownership. No renewal fees, no expiration, cannot be seized. Backed by IPFS immutability and Base L2 blockchain verification.',
    //   tier: 'Named Genesis',
    //   rarity: 'Personal Identity',
    //   valid: true
    // },

    // ============================================
    // ANONYMOUS FOUNDERS: 222.x & 333.x
    // ============================================
    '222': {
      namespace: '222.x',
      displayName: 'Genesis Founder #222',
      realName: 'Anonymous Founder',
      description: "Triple balance. 222.x represents alignment of mind, body, and protocol - perfect for builders who value privacy while establishing Web3 presence.",
      whatYouOwn: [
        'Primary namespace: 222.x',
        'Authentication: 222.auth.x',
        'Finance: 222.finance.x',
        'Communications: 222.tel.x',
        'Storage: 222.vault.x',
        'Registry: 222.registry.x'
      ],
      certificates: ['222.x', '222.auth.x', '222.finance.x', '222.tel.x', '222.vault.x', '222.registry.x'],
      legalFraming: 'Perpetual digital property rights with cryptographic ownership - no renewal fees, no expiration, cannot be seized.',
      tier: 'Premium',
      rarity: 'Triple Repeating',
      valid: true
    },
    '222-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0': {
      namespace: '222.x',
      displayName: 'Genesis Founder #222',
      description: "Triple balance. 222.x represents alignment of mind, body, and protocol.",
      certificates: ['222.x', '222.auth.x', '222.finance.x', '222.tel.x', '222.vault.x', '222.registry.x'],
      valid: true
    },
    '333': {
      namespace: '333.x',
      displayName: 'Genesis Founder #333',
      realName: 'Anonymous Founder',
      description: "Triple growth. 333.x embodies creative expansion and decentralized innovation - ideal for protocol architects and DAO builders.",
      whatYouOwn: [
        'Primary namespace: 333.x',
        'Authentication: 333.auth.x',
        'Finance: 333.finance.x',
        'Communications: 333.tel.x',
        'Storage: 333.vault.x',
        'Registry: 333.registry.x'
      ],
      certificates: ['333.x', '333.auth.x', '333.finance.x', '333.tel.x', '333.vault.x', '333.registry.x'],
      legalFraming: 'Perpetual digital property rights with cryptographic ownership - no renewal fees, no expiration, cannot be seized.',
      tier: 'Premium',
      rarity: 'Triple Repeating',
      valid: true
    },
    '333-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1': {
      namespace: '333.x',
      displayName: 'Genesis Founder #333',
      description: "Triple growth. 333.x embodies creative expansion and decentralized innovation.",
      certificates: ['333.x', '333.auth.x', '333.finance.x', '333.tel.x', '333.vault.x', '333.registry.x'],
      valid: true
    },

    // ============================================
    // LUCKY NUMBER: 88.x - Double Infinity
    // ============================================
    '88': {
      namespace: '88.x',
      displayName: 'Double Infinity',
      realName: 'Anonymous Founder',
      description: "88.x - Double infinity, infinite prosperity. The most auspicious number in Chinese culture, representing wealth, fortune, and endless possibility.",
      whatYouOwn: [
        'Primary namespace: 88.x — Your infinite identity',
        'Authentication: 88.auth.x — Secure infinite access',
        'Finance: 88.finance.x — Prosperity treasury',
        'Communications: 88.tel.x — Fortune network',
        'Storage: 88.vault.x — Wealth preservation',
        'Registry: 88.registry.x — Domain of abundance'
      ],
      certificates: ['88.x', '88.auth.x', '88.finance.x', '88.tel.x', '88.vault.x', '88.registry.x'],
      legalFraming: 'Perpetual digital property rights with Ed25519 cryptographic ownership. No renewal fees, no expiration, cannot be seized. Backed by IPFS immutability and Base L2 blockchain verification.',
      tier: 'Fortune Number',
      rarity: 'Double Infinity',
      valid: true
    },
    '88-2026-01-17-d1i6g2e5f7g0124d9ig5h6e8f7i0d1g2': {
      namespace: '88.x',
      displayName: 'Double Infinity',
      description: "88.x - Double infinity, infinite prosperity.",
      certificates: ['88.x', '88.auth.x', '88.finance.x', '88.tel.x', '88.vault.x', '88.registry.x'],
      valid: true
    }
  };

  try {
    const { token } = await context.request.json();
    const tokenData = VALID_TOKENS[token];

    if (!tokenData) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(tokenData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
