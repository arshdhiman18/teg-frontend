'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ─── Curved SVG paths ─────────────────────────────────────────────────────
   Each line goes from above the viewport (y = -60) to below it (y = 980).
   Control points push/pull horizontally to create organic S-curves.
   Lines are distributed across the full width (viewBox 1440 × 900).
──────────────────────────────────────────────────────────────────────────── */
const LINES = [
  { d: 'M 60  -60 C 200  220  -20  680  120  980', w: 0.7,  o: 0.13, delay: 0     },
  { d: 'M 210 -60 C 370  230  130  690  270  980', w: 1.3,  o: 0.28, delay: 0.055 },
  { d: 'M 370 -60 C 530  240  290  690  430  980', w: 0.9,  o: 0.2,  delay: 0.11  },
  { d: 'M 530 -60 C 700  250  450  700  590  980', w: 2.1,  o: 0.52, delay: 0.165 }, // focal
  { d: 'M 690 -60 C 860  255  610  710  750  980', w: 0.9,  o: 0.22, delay: 0.22  },
  { d: 'M 850 -60 C 1020 260  770  715  910  980', w: 1.7,  o: 0.42, delay: 0.275 }, // focal
  { d: 'M 1010 -60 C 1180 260  930  715  1070 980', w: 0.8, o: 0.18, delay: 0.33  },
  { d: 'M 1170 -60 C 1340 255  1090 710  1230 980', w: 1.2, o: 0.28, delay: 0.385 },
  { d: 'M 1330 -60 C 1500 245  1250 700  1390 980', w: 0.6, o: 0.13, delay: 0.44  },
];

/* ─── Easing helper ─────────────────────────────────────────────────────── */
function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function SplashScreen() {
  const [progress, setProgress]   = useState(0);
  const [phase, setPhase]         = useState<'loading' | 'exiting' | 'done'>('loading');
  const rafRef                    = useRef<number | undefined>(undefined);

  /* ── Scroll lock — prevents page from scrolling under the splash ──────── */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (phase === 'done') {
      html.style.overflow = '';
      body.style.overflow = '';
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // CSS-level lock
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    // Event-level lock — stops Lenis and any other JS-driven scroll
    // (Lenis listens to 'wheel' on window; preventDefault blocks it)
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('wheel',      block, { passive: false });
    window.addEventListener('touchmove',  block, { passive: false });

    return () => {
      window.removeEventListener('wheel',     block);
      window.removeEventListener('touchmove', block);
    };
  }, [phase]);

  /* ── Progress counter ─────────────────────────────────────────────────── */
  useEffect(() => {
    const DURATION = 2700; // ms from 0 → 100
    let startTs = 0;

    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / DURATION, 1);
      const p = Math.floor(easeOutQuad(t) * 100);
      setProgress(p);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setProgress(100);
        // Brief hold at 100%, then lift curtain
        setTimeout(() => setPhase('exiting'), 380);
        // Remove from DOM after curtain clears
        setTimeout(() => setPhase('done'), 1500);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  if (phase === 'done') return null;

  const exiting = phase === 'exiting';

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden flex items-center justify-center"
      style={{ zIndex: 9999, background: '#060f0d' }}
      /* Slide the entire curtain upward to reveal the site */
      animate={{ y: exiting ? '-100%' : '0%' }}
      transition={
        exiting
          ? { duration: 0.95, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0 }
      }
    >
      {/* ── Soft ambient glow behind TEG ─────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 65% 50% at 50% 52%, rgba(80,155,141,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Curved SVG lines ─────────────────────────────────────────── */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          {/* Soft glow for the two focal lines */}
          <filter id="teg-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {LINES.map((l, i) => (
          <motion.path
            key={i}
            d={l.d}
            stroke="#509B8D"
            strokeWidth={l.w}
            strokeOpacity={l.o}
            strokeLinecap="round"
            filter={l.o > 0.4 ? 'url(#teg-glow)' : undefined}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: l.delay,
              duration: 1.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </svg>

      {/* ── Brand centre ─────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center select-none" style={{ zIndex: 1 }}>

        {/* TEG — letter-by-letter blur-reveal */}
        <div style={{ display: 'flex', letterSpacing: '0.42em', lineHeight: 1 }}>
          {['T', 'E', 'G'].map((ch, i) => (
            <motion.span
              key={ch}
              style={{
                fontFamily:  'var(--font-cormorant)',
                fontSize:    'clamp(5.5rem, 16vw, 14.5rem)',
                fontWeight:  300,
                color:       '#F4F8F7',
                display:     'block',
              }}
              initial={{ opacity: 0, y: 55, filter: 'blur(18px)' }}
              animate={{ opacity: 1, y: 0,  filter: 'blur(0px)'  }}
              transition={{
                delay:    0.38 + i * 0.1,
                duration: 1.05,
                ease:     [0.22, 1, 0.36, 1],
              }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        {/* Gold separator line */}
        <motion.div
          style={{
            height:     '1px',
            width:      '76px',
            background: 'linear-gradient(90deg, transparent, #C6A769 40%, #C6A769 60%, transparent)',
            marginTop:  '1.4rem',
            marginBottom: '1.3rem',
            transformOrigin: 'center',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.88, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Tagline */}
        <motion.p
          style={{
            fontFamily:    'var(--font-inter)',
            fontSize:      '0.58rem',
            letterSpacing: '0.62em',
            textTransform: 'uppercase',
            color:         'rgba(244,248,247,0.38)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 1.08, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          The Event Gardener
        </motion.p>
      </div>

      {/* ── Loading counter ───────────────────────────────────────────── */}
      <motion.div
        className="absolute flex flex-col items-center"
        style={{ bottom: '2.75rem', left: 0, right: 0, gap: '0.8rem' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ delay: exiting ? 0 : 0.25, duration: 0.45 }}
      >
        {/* Progress track */}
        <div
          style={{
            width: '148px',
            height: '1px',
            background: 'rgba(80,155,141,0.16)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              position:     'absolute',
              top: 0, left: 0, bottom: 0,
              background:   '#509B8D',
              boxShadow:    '0 0 10px rgba(80,155,141,0.85)',
              transformOrigin: 'left',
            }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.08, ease: 'linear' }}
          />
        </div>

        {/* Percentage number */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
          <span
            style={{
              fontFamily:  'var(--font-cormorant)',
              fontSize:    '1.45rem',
              fontWeight:  300,
              color:       '#C6A769',
              minWidth:    '2.6rem',
              textAlign:   'right',
              lineHeight:  1,
            }}
          >
            {progress}
          </span>
          <span
            style={{
              fontFamily:    'var(--font-inter)',
              fontSize:      '0.52rem',
              letterSpacing: '0.22em',
              color:         'rgba(244,248,247,0.28)',
            }}
          >
            %
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
