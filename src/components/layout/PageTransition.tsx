'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animKey, setAnimKey] = useState(0);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setAnimKey((k) => k + 1);
    }
    setDisplayChildren(children);
  }, [pathname, children]);

  return (
    <div key={animKey} className="animate-fade-in">
      {displayChildren}
    </div>
  );
}
