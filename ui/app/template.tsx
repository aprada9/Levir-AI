'use client';

import PerplexicaTopNav from '@/components/PerplexicaTopNav';
import { useSelectedLayoutSegments } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const isOCRRoute = segments.includes('ocr');

  return (
    <>
      {!isOCRRoute && <PerplexicaTopNav />}
      {children}
    </>
  );
} 