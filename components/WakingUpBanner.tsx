'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server } from 'lucide-react';

export default function WakingUpBanner({ loading }: { loading: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-dark/90 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-xl border border-white/10 whitespace-nowrap"
        >
          <Server className="w-3.5 h-3.5 text-gold shrink-0 animate-pulse" />
          <span className="font-inter text-xs">Server is starting up — this can take up to a minute</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
