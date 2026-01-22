// Object Route - Universal Protocol Console Renderer
// Renders any object from canonical ID

import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProtocolConsole } from '@/components/ProtocolConsole';
import { loadObject } from '@/lib/object-loader';
import '../../../components/ProtocolConsole.css';

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const object = await loadObject(params.id);
  
  if (!object) {
    return {
      title: 'Object Not Found',
      description: 'The requested object could not be found.',
    };
  }
  
  return {
    title: `${object.canonical_id} | Protocol Console`,
    description: object.description,
    openGraph: {
      title: object.canonical_id,
      description: object.description,
      type: 'website',
    },
  };
}

export default async function ObjectPage({ params }: Props) {
  const object = await loadObject(params.id);
  
  if (!object) {
    return (
      <div className="error-container">
        <h1>Object Not Found</h1>
        <p>The object <code>{params.id}</code> could not be found.</p>
        <a href="/">Return Home</a>
      </div>
    );
  }
  
  return (
    <main className="object-page">
      <Suspense fallback={<div className="loading">Loading object...</div>}>
        <ProtocolConsole object={object} />
      </Suspense>
    </main>
  );
}

// Generate static pages for all objects
export async function generateStaticParams() {
  const { getAllObjects } = await import('@/lib/object-loader');
  const objects = await getAllObjects();
  
  return objects.map(obj => ({
    id: obj.canonical_id,
  }));
}
