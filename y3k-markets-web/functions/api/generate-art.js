// Cloudflare Pages Function for NFT art generation
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { prompt, style } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get API key from environment
    const apiKey = context.env.OPENAI_API_KEY || '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';

    // Enhance prompt with style
    const enhancedPrompt = `${prompt}, ${style} style, highly detailed, professional digital art, masterpiece quality`;

    // Call OpenAI API
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

    // Generate rarity score
    const rarityScore = calculateRarityScore(prompt, style);

    return new Response(JSON.stringify({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      rarityScore,
      metadata: {
        style,
        timestamp: new Date().toISOString(),
        model: 'dall-e-3',
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('NFT Art Generation Error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to generate art',
      details: error.message || 'Unknown error',
      hint: 'Check OpenAI API key configuration',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function calculateRarityScore(prompt, style) {
  let score = 50;
  const attributes = [];

  if (prompt.length > 100) {
    score += 15;
    attributes.push('Detailed Description');
  } else if (prompt.length > 50) {
    score += 10;
    attributes.push('Moderate Detail');
  }

  const words = prompt.split(' ').length;
  if (words > 20) {
    score += 10;
    attributes.push('Complex Composition');
  }

  const rareStyles = ['Cosmic', 'Abstract Art'];
  if (rareStyles.includes(style)) {
    score += 15;
    attributes.push(`Rare ${style}`);
  }

  const uncommonWords = ['ethereal', 'fractal', 'quantum', 'dimensional', 'cosmic', 'mythical'];
  const hasUncommon = uncommonWords.some(word => 
    prompt.toLowerCase().includes(word)
  );
  if (hasUncommon) {
    score += 10;
    attributes.push('Unique Elements');
  }

  let tier;
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
