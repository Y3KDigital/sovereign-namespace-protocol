import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, style } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY || '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';

    // Enhance prompt with style
    const enhancedPrompt = `${prompt}, ${style} style, highly detailed, professional digital art, masterpiece quality`;

    // Call OpenAI API directly (no SDK needed for edge runtime)
    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      throw new Error(errorData.error?.message || `OpenAI API returned ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    // Generate rarity score based on prompt complexity
    const rarityScore = calculateRarityScore(prompt, style);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      rarityScore,
      metadata: {
        style,
        timestamp: new Date().toISOString(),
        model: 'dall-e-3',
      },
    });
  } catch (error: any) {
    console.error('NFT Art Generation Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate art',
        details: error.message || 'Unknown error',
        hint: 'Check OpenAI API key configuration',
      },
      { status: 500 }
    );
  }
}

function calculateRarityScore(prompt: string, style: string): {
  score: number;
  tier: string;
  attributes: string[];
} {
  let score = 50; // Base score
  
  const attributes: string[] = [];

  // Length bonus
  if (prompt.length > 100) {
    score += 15;
    attributes.push('Detailed Description');
  } else if (prompt.length > 50) {
    score += 10;
    attributes.push('Moderate Detail');
  }

  // Complexity bonus (check for multiple concepts)
  const words = prompt.split(' ').length;
  if (words > 20) {
    score += 10;
    attributes.push('Complex Composition');
  }

  // Style bonus
  const rareStyles = ['Cosmic', 'Abstract Art'];
  if (rareStyles.includes(style)) {
    score += 15;
    attributes.push(`Rare ${style}`);
  }

  // Uniqueness check (uncommon words)
  const uncommonWords = ['ethereal', 'fractal', 'quantum', 'dimensional', 'cosmic', 'mythical'];
  const hasUncommon = uncommonWords.some(word => 
    prompt.toLowerCase().includes(word)
  );
  if (hasUncommon) {
    score += 10;
    attributes.push('Unique Elements');
  }

  // Determine tier
  let tier: string;
  if (score >= 85) {
    tier = 'Legendary';
  } else if (score >= 70) {
    tier = 'Epic';
  } else if (score >= 55) {
    tier = 'Rare';
  } else {
    tier = 'Common';
  }

  return { score, tier, attributes };
}
