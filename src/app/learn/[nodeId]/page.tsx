import dynamic from 'next/dynamic';

const LessonPlayerClient = dynamic(() => import('./LessonPlayerClient'), { ssr: false });

export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export default function LessonPlayerPage() {
  return <LessonPlayerClient />;
}
