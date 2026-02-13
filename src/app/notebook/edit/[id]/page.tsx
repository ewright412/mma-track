import dynamic from 'next/dynamic';

const EditNoteClient = dynamic(() => import('./EditNoteClient'), { ssr: false });

export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export default function EditNotePage() {
  return <EditNoteClient />;
}
