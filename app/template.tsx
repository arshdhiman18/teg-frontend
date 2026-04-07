'use client';

import { motion }                    from 'framer-motion';
import { useLayoutEffect, useState } from 'react';

const DESKTOP_BARS = ['#0d1f1d', '#1F3D3A', '#509B8D', '#C6A769', '#2d6860', '#1F3D3A'] as const;
const MOBILE_BARS  = ['#0d1f1d', '#1F3D3A', '#509B8D', '#C6A769', '#2d6860', '#1F3D3A', '#509B8D', '#0d1f1d'] as const;

/* '135%' start → bars sweep in from well off-screen right (curved leading end
   visible travelling a long way before it even enters the viewport).
   times [0, 0.30, 0.86, 1]:
     0 → 30 %  enter  (easeOut)
    30 → 86 %  HOLD   (all bars covering simultaneously for ~1 s)
    86 → 100%  exit   (easeIn, brisk)                                          */
const KF    = ['135%', '0%', '0%', '-115%'];
const TIMES = [0, 0.30, 0.74, 1];

const DURATION        = 2.5;
const DESKTOP_STAGGER = 0.08;
const MOBILE_STAGGER  = 0.07;

export default function Template({ children }: { children: React.ReactNode }) {
  const [mobile, setMobile] = useState(false);
  useLayoutEffect(() => { setMobile(window.innerWidth < 768); }, []);

  const bars    = mobile ? MOBILE_BARS : DESKTOP_BARS;
  const stagger = mobile ? MOBILE_STAGGER : DESKTOP_STAGGER;
  const N       = bars.length;
  const totalDuration = DURATION + (N - 1) * stagger;

  return (
    <>
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 5000, pointerEvents: 'none', overflow: 'hidden' }}>
        {bars.map((color, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute', left: '-100px',
              top:    `calc(${(i / N) * 100}% - 1px)`,
              height: `calc(${100 / N}% + 2px)`,
              width:  'calc(100% + 200px)',
              background: color, borderRadius: '9999px',
            }}
            initial={{ x: KF[0] }}
            animate={{ x: KF }}
            transition={{ times: TIMES, duration: DURATION, delay: i * stagger, ease: ['easeOut', 'linear', 'easeIn'] as any }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: totalDuration - 0.12, duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </>
  );
}
