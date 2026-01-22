import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MintRootClient from './MintRootClient';

// Generate static params for all roots (100-999)
export async function generateStaticParams() {
  const roots = [];
  
  // Special roots with rarity
  const special = [100, 111, 222, 333, 444, 555, 666, 777, 888, 999];
  special.forEach(num => roots.push({ root: num.toString() }));
  
  // Add some other interesting numbers
  for (let i = 100; i <= 999; i += 100) {
    if (!special.includes(i)) roots.push({ root: i.toString() });
  }
  
  return roots;
}

interface PageProps {
  params: { root: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const root = params.root;
  const rootNum = parseInt(root);
  
  if (isNaN(rootNum) || rootNum < 100 || rootNum > 999) {
    return { title: 'Invalid Root' };
  }
  
  // Determine rarity
  let rarity = 'STANDARD';
  let rarityColor = '#888';
  
  const digits = root.split('');
  if (digits[0] === digits[1] && digits[1] === digits[2]) {
    rarity = 'CROWN';
    rarityColor = '#FFD700';
  } else if (digits[0] === digits[1] || digits[1] === digits[2]) {
    rarity = 'MYTHIC';
    rarityColor = '#9C27B0';
  }
  
  return {
    title: `Mint ${root}.y3k • ${rarity} Genesis Root`,
    description: `Claim your Genesis Root ${root}.y3k • ${rarity} rarity tier • $29 USD • Limited supply forever`,
    openGraph: {
      title: `🎁 Mint ${root}.y3k`,
      description: `${rarity} Genesis Root • Claim yours now`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Mint ${root}.y3k`,
      description: `${rarity} Genesis Root • $29`,
    }
  };
}

export default function MintRootPage({ params }: PageProps) {
  const root = params.root;
  const rootNum = parseInt(root);
  
  // Validate root number
  if (isNaN(rootNum) || rootNum < 100 || rootNum > 999) {
    notFound();
  }
  
  return <MintRootClient root={root} />;
}
