'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView, useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  IndianRupee,
  Star,
  X,
  Gem,
  Home,
  Loader2,
} from 'lucide-react';
import { getActiveCategories, type Category } from '@/lib/api';

const storyCards = [
  {
    number: '01',
    title: 'The Vision',
    description:
      'We begin by listening to your story, your dreams, and your aesthetic. Every event is born from deep collaboration.',
    color: 'from-primary/20 to-primary/5',
  },
  {
    number: '02',
    title: 'The Design',
    description:
      'Our artisans craft each element with intention — from the centerpiece to the lighting, nothing is left to chance.',
    color: 'from-gold/20 to-gold/5',
  },
  {
    number: '03',
    title: 'The Execution',
    description:
      'On the day, our dedicated team orchestrates every detail flawlessly so you can be fully present in the moment.',
    color: 'from-primary/20 to-dark/10',
  },
  {
    number: '04',
    title: 'The Memory',
    description:
      'Long after the night ends, we leave you with photographs of joy, and a feeling that will last a lifetime.',
    color: 'from-gold/15 to-primary/10',
  },
];


const whyTEG = [
  {
    icon: Sparkles,
    title: 'Bespoke Design',
    description:
      'Every setup is uniquely designed for you. We don\'t believe in templates — your event is one of a kind, just like you.',
  },
  {
    icon: Shield,
    title: 'White-Glove Service',
    description:
      'From initial concept to final breakdown, our dedicated team manages every detail so you don\'t have to worry about a thing.',
  },
  {
    icon: IndianRupee,
    title: 'Transparent Pricing',
    description:
      'No hidden costs. No surprises. Clear packages for every budget — from intimate pocket-friendly setups to grand luxury experiences.',
  },
];

function AnimatedLetter({ char, index, total, progress, isGold }: {
  char: string; index: number; total: number;
  progress: MotionValue<number>; isGold: boolean;
}) {
  const color = useTransform(
    progress,
    [index / total, (index + 1) / total],
    isGold
      ? ['rgba(198,167,105,0.15)', 'rgba(198,167,105,1)']
      : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,1)']
  );
  return <motion.span style={{ color }}>{char}</motion.span>;
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const titleRef = useRef(null);
  const { scrollYProgress: titleProgress } = useScroll({ target: titleRef, offset: ['start 0.88', 'start 0.1'] });
  const w0Opacity = useTransform(titleProgress, [0, 0.18], [0, 1]);
  const w0Y = useTransform(titleProgress, [0, 0.18], [48, 0]);
  const w1Opacity = useTransform(titleProgress, [0.2, 0.38], [0, 1]);
  const w1Y = useTransform(titleProgress, [0.2, 0.38], [48, 0]);
  const w2Opacity = useTransform(titleProgress, [0.4, 0.58], [0, 1]);
  const w2Y = useTransform(titleProgress, [0.4, 0.58], [48, 0]);
  const w3Opacity = useTransform(titleProgress, [0.6, 0.78], [0, 1]);
  const w3Y = useTransform(titleProgress, [0.6, 0.78], [48, 0]);

  // Categories section state
  const [activeTab, setActiveTab] = useState<'social' | 'signature'>('social');
  const [catIndex, setCatIndex] = useState(0);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const CAT_VISIBLE = 3;
  const CARD_STEP = 320;

  useEffect(() => {
    getActiveCategories()
      .then((res) => setAllCategories(res.data))
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, []);

  const socialCats = allCategories.filter((c) => c.section === 'Social & Home Celebrations');
  const signatureCats = allCategories.filter((c) => c.section === 'Signature Events');
  const activeCategories = activeTab === 'social' ? socialCats : signatureCats;
  const catMaxIndex = Math.max(0, activeCategories.length - CAT_VISIBLE);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    scrollRef.current?.scrollTo({ left: index * CARD_STEP, behavior: 'smooth' });
    setCatIndex(index);
  };

  const handleCarouselScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.min(Math.round(scrollRef.current.scrollLeft / CARD_STEP), catMaxIndex);
    setCatIndex(idx);
  };

  const handleTabChange = (tab: 'social' | 'signature') => {
    setActiveTab(tab);
    setCatIndex(0);
    setTimeout(() => scrollRef.current?.scrollTo({ left: 0, behavior: 'instant' }), 50);
  };

  const whyTitleRef = useRef(null);
  const { scrollYProgress: whyProgress } = useScroll({ target: whyTitleRef, offset: ['start 0.88', 'start 0.1'] });
  const y0Opacity = useTransform(whyProgress, [0, 0.2], [0, 1]);
  const y0Y = useTransform(whyProgress, [0, 0.2], [48, 0]);
  const y1Opacity = useTransform(whyProgress, [0.22, 0.42], [0, 1]);
  const y1Y = useTransform(whyProgress, [0.22, 0.42], [48, 0]);
  const y2Opacity = useTransform(whyProgress, [0.44, 0.64], [0, 1]);
  const y2Y = useTransform(whyProgress, [0.44, 0.64], [48, 0]);
  const y3Opacity = useTransform(whyProgress, [0.66, 0.86], [0, 1]);
  const y3Y = useTransform(whyProgress, [0.66, 0.86], [48, 0]);

  const [videoModal, setVideoModal] = useState(false);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: videoProgress } = useScroll({
    target: videoSectionRef,
    offset: ['start start', 'end end'],
  });
  const maskPct = useTransform(videoProgress, [0.05, 0.88], [12, 152]);
  const videoClipPath = useTransform(maskPct, (v) => `circle(${v.toFixed(2)}% at 50% 62%)`);
  const videoTitleOpacity = useTransform(videoProgress, [0, 0.2], [1, 0]);
  const videoTitleY = useTransform(videoProgress, [0, 0.2], [0, -28]);

  const CTA_WORDS = ['Ready', 'to', 'Create', 'Something', 'Extraordinary?'] as const;
  const CTA_WORD_STARTS = [0, 5, 7, 13, 22] as const;
  const CTA_TOTAL = 36;
  const ctaTitleRef = useRef(null);
  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaTitleRef, offset: ['start 0.9', 'start 0.0'] });
  const descSkew = useTransform(ctaProgress, [0.85, 1.0], [6, 0]);
  const descOpacity = useTransform(ctaProgress, [0.85, 1.0], [0, 1]);
  const descY = useTransform(ctaProgress, [0.85, 1.0], [20, 0]);

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-light to-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(74,151,138,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(198,167,105,0.08),transparent_60%)]" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle bg-gold"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${6 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
                opacity: Math.random() * 0.2 + 0.05,
              }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-gold/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary/10" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20 md:pt-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 rounded-full mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="font-inter text-xs text-gold tracking-widest uppercase">Luxury Event Design</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white mb-4"
          >
            We Don&apos;t Decorate Events.
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-gold mb-8"
          >
            We Design Experiences.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="font-inter text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Luxury event design for those who demand the extraordinary.
            Every detail is intentional, every moment is unforgettable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/collections"
              className="group inline-flex items-center gap-2.5 btn-gold text-dark font-inter font-semibold px-8 py-4 rounded-full text-sm"
            >
              Explore Collections
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FEATURED CATEGORIES — Two Tabs ===== */}
      <section className="bg-white py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10">

          {/* Section heading */}
          <div className="mb-10">
            <p className="font-inter text-xs text-primary tracking-widest uppercase mb-3">Browse by Occasion</p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <h2 className="font-cormorant font-light text-dark leading-[1.1]" style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.8rem)' }}>
                Every Celebration<br />
                <span className="text-gold font-medium">Deserves Magic</span>
              </h2>

              {/* Tabs + Nav */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Tab switcher */}
                <div className="flex items-center gap-1 bg-light rounded-2xl p-1">
                  <button
                    onClick={() => handleTabChange('social')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-300 ${
                      activeTab === 'social'
                        ? 'bg-dark text-white shadow-sm'
                        : 'text-dark/50 hover:text-dark'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Social &amp; Home</span>
                    <span className="sm:hidden">Social</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('signature')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-300 ${
                      activeTab === 'signature'
                        ? 'bg-dark text-white shadow-sm'
                        : 'text-dark/50 hover:text-dark'
                    }`}
                  >
                    <Gem className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Signature Events</span>
                    <span className="sm:hidden">Signature</span>
                  </button>
                </div>

                {/* Carousel nav */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => scrollToIndex(Math.max(0, catIndex - 1))}
                    disabled={catIndex === 0}
                    className="w-10 h-10 rounded-full border border-dark/20 flex items-center justify-center text-dark/60 transition-all duration-200 hover:border-dark hover:text-dark disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollToIndex(Math.min(catMaxIndex, catIndex + 1))}
                    disabled={catIndex >= catMaxIndex}
                    className="w-10 h-10 rounded-full border border-dark/20 flex items-center justify-center text-dark/60 transition-all duration-200 hover:border-dark hover:text-dark disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tab label */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="font-inter text-sm text-dark/40 mt-3"
              >
                {activeTab === 'social'
                  ? 'Birthdays, anniversaries, baby showers, proposals & more'
                  : 'Premium luxury events, corporate, weddings & spiritual gatherings'}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Card track */}
          <div ref={scrollRef} onScroll={handleCarouselScroll} className="overflow-x-auto -mx-6 px-6 md:-mx-10 md:px-10 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {catsLoading ? (
                  <div className="flex items-center justify-center py-24 w-full">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : activeCategories.length === 0 ? (
                  <div className="flex items-center justify-center py-24 w-full">
                    <p className="font-inter text-sm text-dark/40">No events in this section yet</p>
                  </div>
                ) : (
                  <div className="flex gap-5 pb-1">
                    {activeCategories.map((cat, i) => {
                      const href = `/collections?mainCategory=${encodeURIComponent(cat.name)}`;
                      const num = String(i + 1).padStart(2, '0');
                      return (
                        <Link key={cat._id} href={href} className="flex-shrink-0">
                          <motion.div
                            className="relative rounded-2xl cursor-pointer group"
                            style={{ width: '300px', height: 'clamp(380px, 52vh, 500px)', willChange: 'transform' }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${cat.gradientFrom}, ${cat.gradientTo})` }} />
                              )}
                              <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, ${cat.gradientFrom}88, ${cat.gradientTo}aa)` }} />
                              <div className="absolute top-0 left-6 right-6 h-px" style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}60, transparent)` }} />
                              <div className="absolute top-5 left-6 font-cormorant leading-none select-none pointer-events-none" style={{ fontSize: '5.5rem', fontWeight: 300, color: 'rgba(255,255,255,0.07)' }}>{num}</div>
                              <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)' }}>
                                {cat.detail && <p className="font-inter text-[9px] tracking-[0.2em] uppercase mb-2.5" style={{ color: cat.accent, opacity: 0.85 }}>{cat.detail}</p>}
                                <h3 className="font-cormorant text-white leading-none mb-2" style={{ fontSize: '2.1rem', fontWeight: 300 }}>{cat.name}</h3>
                                {cat.tagline && <p className="font-inter text-xs text-white/40 mb-5 leading-relaxed">{cat.tagline}</p>}
                                <div className="flex items-center gap-2" style={{ color: cat.accent, opacity: 0.55 }}>
                                  <span className="font-inter text-[9px] tracking-widest uppercase group-hover:opacity-100 transition-opacity duration-300">Explore Setups</span>
                                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                              </div>
                            </div>
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 0 1px ${cat.accent}45` }} />
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="hidden md:flex justify-start items-center gap-2 mt-8">
            {Array.from({ length: catMaxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`transition-all duration-300 rounded-full ${catIndex === i ? 'w-6 h-2 bg-dark' : 'w-2 h-2 bg-dark/20 hover:bg-dark/40'}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ===== VIDEO SHOWCASE ===== */}
      <div
        ref={videoSectionRef}
        className="relative"
        style={{ height: 'calc(100vh + 500px)', background: '#060e0c' }}
      >
        <div className="sticky top-0 h-screen overflow-hidden" style={{ background: '#060e0c' }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(198,167,105,0.06) 0%, transparent 70%)' }}
          />
          <motion.div
            className="absolute left-0 right-0 text-center px-4 z-20 pointer-events-none"
            style={{ top: '22%', opacity: videoTitleOpacity, y: videoTitleY }}
          >
            <p className="font-inter text-xs text-gold tracking-widest uppercase mb-4">Behind the Magic</p>
            <h2 className="font-cormorant font-light text-white leading-[1.05]" style={{ fontSize: 'clamp(2.6rem, 5vw, 5.5rem)' }}>
              See What{' '}
              <span className="text-gold font-medium">We Create</span>
            </h2>
          </motion.div>
          <motion.div className="absolute inset-0" style={{ clipPath: videoClipPath }}>
            <video
              src="https://res.cloudinary.com/dww36nzdv/video/upload/Teg-Section_vmiiap.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'rgba(6,14,12,0.2)' }} />
          </motion.div>
          <button
            onClick={() => setVideoModal(true)}
            className="absolute top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 group"
            style={{ width: 'clamp(120px, 15vw, 156px)', height: 'clamp(120px, 15vw, 156px)' }}
            aria-label="Play video"
          >
            <motion.svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
              style={{ overflow: 'visible' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
            >
              <defs>
                <path id="vid-ring" d="M50,50 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
              </defs>
              <text style={{ fontSize: '9px', letterSpacing: '0.3em', fontFamily: 'sans-serif', fontWeight: 500, textTransform: 'uppercase' }} fill="rgba(255,255,255,0.85)">
                <textPath href="#vid-ring">PLAY VIDEO · PLAY VIDEO · PLAY VIDEO ·</textPath>
              </text>
            </motion.svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20"
                style={{ width: '40%', height: '40%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 0 32px rgba(198,167,105,0.18)' }}
              >
                <div className="ml-[8%]" style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '13px solid white' }} />
              </div>
            </div>
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="font-inter text-[9px] tracking-widest uppercase text-center" style={{ color: 'rgba(255,255,255,0.18)' }}>Scroll to reveal</p>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(14px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setVideoModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
              style={{ aspectRatio: '16/9', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' }}
            >
              <iframe
                src="https://player.cloudinary.com/embed/?cloud_name=dww36nzdv&public_id=Teg-Section_vmiiap&autoplay=true&controls=true"
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
              />
            </motion.div>
            <button
              onClick={() => setVideoModal(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STORY CARDS ===== */}
      <section className="bg-light section-padding overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div ref={titleRef} className="text-center mb-16 px-4">
            <motion.p
              className="font-inter text-xs text-primary tracking-widest uppercase mb-4"
              style={{ opacity: w0Opacity, y: w0Y }}
            >
              Our Process
            </motion.p>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-light text-dark leading-tight">
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: w1Opacity, y: w1Y }}>From</motion.span>
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: w2Opacity, y: w2Y }}>Vision</motion.span>
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: w2Opacity, y: w2Y }}>to</motion.span>
              <motion.span style={{ display: 'inline-block', opacity: w3Opacity, y: w3Y }} className="text-gold font-medium">Memory</motion.span>
            </h2>
          </div>

          <div className="hidden lg:grid lg:grid-cols-4 gap-6 px-4">
            {storyCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`relative bg-gradient-to-br ${card.color} rounded-3xl p-8 border border-dark/5 overflow-hidden min-h-[280px] flex flex-col justify-between`}
              >
                <span className="number-display">{card.number}</span>
                <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center mb-6">
                  <span className="font-cormorant text-gold font-semibold text-sm">{card.number}</span>
                </div>
                <div>
                  <h3 className="font-playfair text-xl font-semibold text-dark mb-3">{card.title}</h3>
                  <p className="font-inter text-sm text-dark/60 leading-relaxed">{card.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:hidden flex flex-col gap-5 px-4">
            {storyCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`relative bg-gradient-to-br ${card.color} rounded-2xl p-7 border border-dark/5 overflow-hidden`}
              >
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                    <span className="font-cormorant text-gold font-semibold text-sm">{card.number}</span>
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-semibold text-dark mb-2">{card.title}</h3>
                    <p className="font-inter text-sm text-dark/60 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-dark border-t border-b border-gold/10 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 lg:gap-24">
              {[
                { number: '500+', label: 'Events Curated' },
                { number: '10+', label: 'Cities Served' },
                { number: '98%', label: 'Satisfaction Rate' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="font-playfair text-4xl md:text-5xl font-bold text-gold mb-1">{stat.number}</div>
                  <div className="font-inter text-sm text-white/50 tracking-wide uppercase">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== WHY TEG ===== */}
      <section className="bg-light section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div ref={whyTitleRef} className="text-center mb-16">
            <motion.p className="font-inter text-xs text-primary tracking-widest uppercase mb-3" style={{ opacity: y0Opacity, y: y0Y }}>
              The TEG Difference
            </motion.p>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-light text-dark leading-tight">
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: y1Opacity, y: y1Y }}>Why</motion.span>
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: y1Opacity, y: y1Y }}>Discerning</motion.span>
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: y2Opacity, y: y2Y }}>Clients</motion.span>
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: y3Opacity, y: y3Y }}>Choose</motion.span>
              <motion.span style={{ display: 'inline-block', opacity: y3Opacity, y: y3Y }} className="text-gold font-medium">Us</motion.span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyTEG.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.7 }}
                  className="bg-white rounded-3xl p-8 shadow-luxury hover:shadow-luxury-hover transition-all duration-500 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary group-hover:text-gold transition-colors duration-300" />
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-dark mb-3">{item.title}</h3>
                  <p className="font-inter text-sm text-dark/60 leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIAL STRIP ===== */}
      <section className="bg-white py-12 overflow-hidden border-y border-light">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[...Array(3)].map((_, outer) =>
            ['Magical wedding setup ✦', 'Exceeded all expectations ✦', 'Truly bespoke experience ✦', 'Unforgettable birthday ✦', 'Professional & punctual ✦', 'Worth every rupee ✦'].map((text, i) => (
              <span key={`${outer}-${i}`} className="font-cormorant text-xl text-dark/30 italic px-10 shrink-0">
                {text}
              </span>
            ))
          )}
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
        `}</style>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="bg-dark section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,151,138,0.1),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div ref={ctaTitleRef} className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 rounded-full mb-8">
              <Star className="w-3.5 h-3.5 text-gold fill-gold" />
              <span className="font-inter text-xs text-gold tracking-widest uppercase">Let&apos;s Create Together</span>
            </div>

            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {CTA_WORDS.map((word, wi) => (
                <span key={wi} style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: wi < CTA_WORDS.length - 1 ? '0.28em' : 0 }}>
                  {word.split('').map((char, ci) => (
                    <AnimatedLetter
                      key={ci}
                      char={char}
                      index={CTA_WORD_STARTS[wi] + ci}
                      total={CTA_TOTAL}
                      progress={ctaProgress}
                      isGold={wi === 4}
                    />
                  ))}
                </span>
              ))}
            </h2>

            <motion.p
              style={{ opacity: descOpacity, skewX: descSkew, y: descY }}
              className="font-inter text-white/50 text-lg mb-10 max-w-xl mx-auto"
            >
              Let&apos;s turn your vision into the most beautiful celebration you&apos;ve ever experienced.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/collections"
                className="group inline-flex items-center gap-2.5 btn-gold text-dark font-inter font-semibold px-8 py-4 rounded-full text-sm"
              >
                Browse Packages
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
