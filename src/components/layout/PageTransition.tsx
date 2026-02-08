'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Start fade out
    setIsTransitioning(true);

    const timeout = setTimeout(() => {
      // Update content and fade in
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [pathname, children]);

  return (
    <div
      className={`transition-opacity duration-150 ease-out ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {displayChildren}
    </div>
  );
}
