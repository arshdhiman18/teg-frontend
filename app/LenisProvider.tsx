'use client';

import { useEffect, ReactNode } from 'react';

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let lenis: any = null;

    const initLenis = async () => {
      try {
        const Lenis = (await import('lenis')).default;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        });

        const raf = (time: number) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);
      } catch (error) {
        // Lenis not available, smooth scroll via CSS is fallback
        console.warn('Lenis smooth scroll not initialized:', error);
      }
    };

    initLenis();

    return () => {
      if (lenis) {
        lenis.destroy();
      }
    };
  }, []);

  return <>{children}</>;
}
