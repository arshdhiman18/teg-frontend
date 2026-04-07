'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Shield,
  IndianRupee,
  Star,
  Cake,
  Heart,
  Briefcase,
  Baby,
  Gift,
  Gem,
} from 'lucide-react';

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

const categories = [
  { label: 'Birthday', icon: Cake, href: '/collections?category=Birthday', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { label: 'Wedding', icon: Heart, href: '/collections?category=Wedding', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { label: 'Anniversary', icon: Gem, href: '/collections?category=Anniversary', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { label: 'Corporate', icon: Briefcase, href: '/collections?category=Corporate', color: 'bg-slate-50 text-slate-600 border-slate-100' },
  { label: 'Baby Shower', icon: Baby, href: '/collections?category=Baby Shower', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  { label: 'Engagement', icon: Gift, href: '/collections?category=Engagement', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
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

// Letter-by-letter color scrub — each instance calls useTransform at component level (no hooks-in-loop)
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

  // Story title — scroll-scrubbed word reveal (GSAP ScrollTrigger equivalent)
  const titleRef = useRef(null);
  const { scrollYProgress: titleProgress } = useScroll({ target: titleRef, offset: ['start 0.88', 'start 0.1'] });
  const w0Opacity = useTransform(titleProgress, [0, 0.18], [0, 1]);
  const w0Y       = useTransform(titleProgress, [0, 0.18], [48, 0]);
  const w1Opacity = useTransform(titleProgress, [0.2, 0.38], [0, 1]);
  const w1Y       = useTransform(titleProgress, [0.2, 0.38], [48, 0]);
  const w2Opacity = useTransform(titleProgress, [0.4, 0.58], [0, 1]);
  const w2Y       = useTransform(titleProgress, [0.4, 0.58], [48, 0]);
  const w3Opacity = useTransform(titleProgress, [0.6, 0.78], [0, 1]);
  const w3Y       = useTransform(titleProgress, [0.6, 0.78], [48, 0]);

  // "Every Celebration Deserves Magic" scroll-scrubbed reveal
  const catTitleRef = useRef(null);
  const { scrollYProgress: catProgress } = useScroll({ target: catTitleRef, offset: ['start 0.88', 'start 0.1'] });
  const c0Opacity = useTransform(catProgress, [0, 0.2], [0, 1]);
  const c0Y       = useTransform(catProgress, [0, 0.2], [48, 0]);
  const c1Opacity = useTransform(catProgress, [0.22, 0.42], [0, 1]);
  const c1Y       = useTransform(catProgress, [0.22, 0.42], [48, 0]);
  const c2Opacity = useTransform(catProgress, [0.44, 0.64], [0, 1]);
  const c2Y       = useTransform(catProgress, [0.44, 0.64], [48, 0]);
  const c3Opacity = useTransform(catProgress, [0.66, 0.86], [0, 1]);
  const c3Y       = useTransform(catProgress, [0.66, 0.86], [48, 0]);

  // "Why Discerning Clients Choose Us" scroll-scrubbed reveal
  const whyTitleRef = useRef(null);
  const { scrollYProgress: whyProgress } = useScroll({ target: whyTitleRef, offset: ['start 0.88', 'start 0.1'] });
  const y0Opacity = useTransform(whyProgress, [0, 0.2], [0, 1]);
  const y0Y       = useTransform(whyProgress, [0, 0.2], [48, 0]);
  const y1Opacity = useTransform(whyProgress, [0.22, 0.42], [0, 1]);
  const y1Y       = useTransform(whyProgress, [0.22, 0.42], [48, 0]);
  const y2Opacity = useTransform(whyProgress, [0.44, 0.64], [0, 1]);
  const y2Y       = useTransform(whyProgress, [0.44, 0.64], [48, 0]);
  const y3Opacity = useTransform(whyProgress, [0.66, 0.86], [0, 1]);
  const y3Y       = useTransform(whyProgress, [0.66, 0.86], [48, 0]);

  // "Ready to Create Something Extraordinary?" — letter-by-letter color scrub
  // Words: Ready(5) to(2) Create(6) Something(9) Extraordinary?(14) = 36 letters total
  const CTA_WORDS = ['Ready', 'to', 'Create', 'Something', 'Extraordinary?'] as const;
  const CTA_WORD_STARTS = [0, 5, 7, 13, 22] as const; // cumulative letter index before each word
  const CTA_TOTAL = 36;
  const ctaTitleRef = useRef(null);
  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaTitleRef, offset: ['start 0.9', 'start 0.0'] });
  // Description: tilted → straight after letters reveal
  const descSkew  = useTransform(ctaProgress, [0.85, 1.0], [6, 0]);
  const descOpacity = useTransform(ctaProgress, [0.85, 1.0], [0, 1]);
  const descY     = useTransform(ctaProgress, [0.85, 1.0], [20, 0]);

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-light to-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(74,151,138,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(198,167,105,0.08),transparent_60%)]" />

        {/* Floating particles */}
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
          {/* Decorative rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-gold/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary/10" />
        </div>

        {/* Hero Content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20 md:pt-0"
        >
          {/* Tag line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 rounded-full mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="font-inter text-xs text-gold tracking-widest uppercase">
              Luxury Event Design
            </span>
          </motion.div>

          {/* Main Headline */}
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

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="font-inter text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Luxury event design for those who demand the extraordinary.
            Every detail is intentional, every moment is unforgettable.
          </motion.p>

          {/* CTA Buttons */}
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
                  <div className="font-playfair text-4xl md:text-5xl font-bold text-gold mb-1">
                    {stat.number}
                  </div>
                  <div className="font-inter text-sm text-white/50 tracking-wide uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== STORY CARDS - HORIZONTAL SCROLL ===== */}
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

          {/* Desktop: horizontal cards in a row */}
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

          {/* Mobile: vertical stack */}
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

      {/* ===== FEATURED CATEGORIES ===== */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div ref={catTitleRef} className="text-center mb-16">
            <motion.p className="font-inter text-xs text-primary tracking-widest uppercase mb-3" style={{ opacity: c0Opacity, y: c0Y }}>
              Browse by Occasion
            </motion.p>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-light text-dark leading-tight">
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: c1Opacity, y: c1Y }}>Every</motion.span>
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: c2Opacity, y: c2Y }}>Celebration</motion.span>
              <motion.span style={{ display: 'inline-block', marginRight: '0.3em', opacity: c3Opacity, y: c3Y }}>Deserves</motion.span>
              <motion.span style={{ display: 'inline-block', opacity: c3Opacity, y: c3Y }} className="text-gold font-medium">Magic</motion.span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                >
                  <Link
                    href={cat.href}
                    className={`group flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border ${cat.color} hover:shadow-luxury-hover hover:-translate-y-2 transition-all duration-500 text-center`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-luxury flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-playfair text-lg font-semibold text-dark group-hover:text-current transition-colors">
                        {cat.label}
                      </h3>
                      <p className="font-inter text-xs text-dark/40 mt-1">View setups →</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
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
              <span className="font-inter text-xs text-gold tracking-widest uppercase">
                Let&apos;s Create Together
              </span>
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
