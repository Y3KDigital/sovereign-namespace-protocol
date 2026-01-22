import { NextResponse } from 'next/server';

// Admin endpoint to generate access codes
// In production, protect this with admin authentication

function generateAccessCode(index: number, tier: 'F' | 'E'): string {
  const paddedIndex = index.toString().padStart(3, '0');
  return `GENESIS-${tier}${paddedIndex}-2026`;
}

export async function GET() {
  const codes: { index: number; code: string; tier: string; email?: string }[] = [];

  // Generate 10 Founder tier codes (F001-F010)
  for (let i = 1; i <= 10; i++) {
    codes.push({
      index: i,
      code: generateAccessCode(i, 'F'),
      tier: 'Founder',
      email: '', // To be filled manually
    });
  }

  // Generate 90 Early Supporter codes (E011-E100)
  for (let i = 11; i <= 100; i++) {
    codes.push({
      index: i,
      code: generateAccessCode(i, 'E'),
      tier: 'Early Supporter',
      email: '', // To be filled manually
    });
  }

  // Return as JSON
  return NextResponse.json({
    totalCodes: codes.length,
    codes,
    instructions: {
      usage: 'Copy these codes and distribute via email to friends & family',
      format: 'GENESIS-{TIER}{INDEX}-2026',
      example: 'GENESIS-F001-2026',
      tierExplanation: {
        F: 'Founder tier (first 10 closest supporters)',
        E: 'Early Supporter tier (next 90 participants)',
      },
      nextSteps: [
        '1. Export this JSON',
        '2. Match codes to email addresses',
        '3. Send personalized invitation emails',
        '4. Include link: https://y3kmarkets.com/friends-family',
        '5. Update validate/route.ts with all generated codes',
      ],
    },
  });
}

// POST endpoint to export as CSV
export async function POST() {
  const codes: string[] = [];

  // CSV header
  codes.push('Index,Code,Tier,Email,Invited,Used');

  // Generate all codes
  for (let i = 1; i <= 10; i++) {
    codes.push(`${i},${generateAccessCode(i, 'F')},Founder,,,`);
  }

  for (let i = 11; i <= 100; i++) {
    codes.push(`${i},${generateAccessCode(i, 'E')},Early Supporter,,,`);
  }

  const csv = codes.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="genesis-founders-codes.csv"',
    },
  });
}
