import dynamic from 'next/dynamic';

const TechniqueDetailClient = dynamic(() => import('./TechniqueDetailClient'), { ssr: false });

export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export default function TechniqueDetailPage() {
  return <TechniqueDetailClient />;
}
