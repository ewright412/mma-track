import dynamic from 'next/dynamic';

const EditCardioClient = dynamic(() => import('./EditCardioClient'), { ssr: false });

export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export default function EditCardioPage() {
  return <EditCardioClient />;
}
