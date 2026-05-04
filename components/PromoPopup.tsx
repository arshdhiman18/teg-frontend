'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Zap, Ticket, ArrowRight, Users } from 'lucide-react';
import { getPromotionalEvent, Event, EventPackage, formatPrice } from '@/lib/api';

const STORAGE_KEY = 'teg_promo_dismissed';

export default function PromoPopup() {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    getPromotionalEvent()
      .then((res) => {
        if (res.data) {
          setEvent(res.data);
          const timer = setTimeout(() => setVisible(true), 900);
          return () => clearTimeout(timer);
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setVisible(false);
      setClosing(false);
    }, 350);
  };

  const handleCTA = () => {
    if (!event) return;
    dismiss();
    router.push(`/events/${event.slug || event._id}`);
  };

  if (!event) return null;

  const hasPackages = (event.packages?.length ?? 0) > 0;
  const minPrice = hasPackages ? Math.min(...event.packages.map((p: EventPackage) => p.price)) : event.price;
  const isFree = minPrice === 0 && !hasPackages;
  const priceLabel = isFree ? 'Free' : `${formatPrice(minPrice)}${hasPackages ? ' onwards' : '+'}`;
  const dateLabel = event.endDate ? `${event.startDate} – ${event.endDate}` : event.startDate;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: closing ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9990]"
            style={{ background: 'rgba(4,10,9,0.82)', backdropFilter: 'blur(8px)' }}
            onClick={dismiss}
          />

          {/* Card */}
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: closing ? 0 : 1, scale: closing ? 0.92 : 1, y: closing ? 20 : 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[9991] inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-[420px] rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] pointer-events-auto"
              style={{ background: '#0d1a18' }}
            >
              {/* Close button */}
              <button
                onClick={dismiss}
                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <X className="w-4 h-4 text-white/80" />
              </button>

              {/* ── Image section ── */}
              <div className="relative h-52 sm:h-64 overflow-hidden">
                {event.images?.[0] ? (
                  <Image
                    src={event.images[0]}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="420px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-dark" />
                )}

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a18] via-[#0d1a18]/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-3.5 left-3.5 flex gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-inter text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: 'rgba(198,167,105,0.18)', border: '1px solid rgba(198,167,105,0.35)', color: '#C6A769' }}>
                    <Ticket className="w-3 h-3" />
                    Featured Event
                  </span>
                  {event.fillingFast && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full font-inter text-[10px] font-semibold bg-red-500/90 text-white">
                      <Zap className="w-3 h-3 fill-white" />
                      Filling Fast
                    </span>
                  )}
                </div>

                {/* Genre tag bottom */}
                {event.genre && (
                  <div className="absolute bottom-14 left-4">
                    <span className="px-2.5 py-0.5 rounded-full font-inter text-[10px] font-medium bg-white/10 text-white/70 border border-white/10">
                      {event.genre}
                    </span>
                  </div>
                )}

                {/* Event title on image */}
                <div className="absolute bottom-3 left-4 right-12">
                  <h2 className="font-playfair text-white font-bold leading-snug" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.35rem)' }}>
                    {event.title}
                  </h2>
                </div>
              </div>

              {/* ── Content section ── */}
              <div className="px-5 pt-4 pb-5">
                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.startDate && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                      <Calendar className="w-3 h-3 text-gold shrink-0" />
                      <span className="font-inter text-xs text-white/70">{dateLabel}</span>
                    </div>
                  )}
                  {event.time && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                      <span className="font-inter text-xs text-white/70">{event.time}</span>
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                      <MapPin className="w-3 h-3 text-gold shrink-0" />
                      <span className="font-inter text-xs text-white/70 line-clamp-1">{event.venue}</span>
                    </div>
                  )}
                </div>

                {/* Price + interested */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-inter text-[10px] text-white/35 uppercase tracking-wide mb-0.5">Starting from</p>
                    <p className="font-playfair text-2xl font-bold text-gold">{priceLabel}</p>
                  </div>
                  {event.interestedCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
                      <Users className="w-3.5 h-3.5 text-white/40" />
                      <span className="font-inter text-xs text-white/50">{event.interestedCount} interested</span>
                    </div>
                  )}
                </div>

                {/* ── CTA ── */}
                <button
                  onClick={handleCTA}
                  className="group w-full relative overflow-hidden rounded-2xl py-4 font-inter font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(198,167,105,0.35)] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #C6A769 0%, #e8c97e 50%, #C6A769 100%)',
                    backgroundSize: '200% 100%',
                    color: '#0d1a18',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundPosition = '100% 0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundPosition = '0 0')}
                >
                  <Ticket className="w-4 h-4 shrink-0" />
                  Reserve My Spot
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                {/* Urgency line */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Zap className="w-3 h-3 text-red-400 fill-red-400" />
                  <p className="font-inter text-[11px] text-red-400 font-medium">
                    Seats filling fast — don&apos;t miss out
                  </p>
                </div>

                {/* Dismiss */}
                <div className="text-center mt-3">
                  <button
                    onClick={dismiss}
                    className="font-inter text-xs text-white/25 hover:text-white/50 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>

              {/* Ambient glow at bottom */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                style={{ background: 'linear-gradient(to right, transparent, rgba(198,167,105,0.4), transparent)' }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
