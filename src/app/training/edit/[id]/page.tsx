import dynamic from 'next/dynamic';

const EditTrainingClient = dynamic(() => import('./EditTrainingClient'), { ssr: false });

export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export default function EditTrainingPage() {
  return <EditTrainingClient />;
}
