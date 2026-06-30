'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  ImageOff,
  Loader2,
  Zap,
  Star,
  ThumbsUp,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { getEvents, Event, formatPrice } from '@/lib/api';
import WakingUpBanner from '@/components/WakingUpBanner';

const GENRE_COLORS: Record<string, string> = {
  Comedy: 'bg-yellow-100 text-yellow-800',
  Music: 'bg-purple-100 text-purple-800',
  Theatre: 'bg-red-100 text-red-800',
  Dance: 'bg-pink-100 text-pink-800',
  Sports: 'bg-green-100 text-green-800',
  Festival: 'bg-orange-100 text-orange-800',
  Kids: 'bg-blue-100 text-blue-800',
  Art: 'bg-teal-100 text-teal-800',
};

function EventCard({ event }: { event: Event }) {
  const imageUrl = event.images?.[0] || null;
  const genreColor = GENRE_COLORS[event.genre] || 'bg-gray-100 text-gray-700';
  const dateLabel = event.endDate ? `${event.startDate} - ${event.endDate}` : event.startDate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white rounded-2xl overflow-hidden shadow-luxury hover:shadow-luxury-hover border border-transparent hover:border-gold/20 transition-all duration-500"
    >
      <Link href={`/events/${event.slug || event._id}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/9] bg-light">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/15 transition-all duration-500" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-dark/5 to-dark/10">
              <ImageOff className="w-10 h-10 text-dark/20" />
              <span className="font-inter text-xs text-dark/30">No image</span>
            </div>
          )}

          {/* Genre badge */}
          {event.genre && (
            <div className="absolute top-3 left-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-inter font-semibold ${genreColor}`}>
                {event.genre}
              </span>
            </div>
          )}

          {/* Featured badge */}
          {event.featured && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-inter font-semibold bg-gold text-dark">
                <Star className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Featured</span>
              </span>
            </div>
          )}

          {/* Filling Fast badge */}
          {event.fillingFast && (
            <div className="absolute bottom-3 left-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-inter font-semibold bg-red-500 text-white">
                <Zap className="w-3 h-3 fill-current" />
                Filling Fast
              </span>
            </div>
          )}

          {/* Hover CTA */}
          <div className="hidden sm:block absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 text-dark text-xs font-inter font-semibold shadow-lg">
              View Event
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {event.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-inter font-medium bg-dark/5 text-dark/60">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-playfair text-base sm:text-lg font-semibold text-dark leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {event.title}
          </h3>

          {/* Date & Venue */}
          <div className="space-y-1.5 mb-3">
            {event.startDate && (
              <div className="flex items-center gap-2 text-dark/55">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span className="font-inter text-xs line-clamp-1">{dateLabel}</span>
              </div>
            )}
            {event.time && (
              <div className="flex items-center gap-2 text-dark/55">
                <Clock className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span className="font-inter text-xs">{event.time}</span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-2 text-dark/55">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span className="font-inter text-xs line-clamp-1">{event.venue}</span>
              </div>
            )}
          </div>

          {/* Footer: price + interested */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-light">
            <div className="min-w-0">
              {(() => {
                const hasPackages = event.packages?.length > 0;
                const minPkg = hasPackages ? Math.min(...event.packages.map((p) => p.price)) : null;
                const displayPrice = hasPackages ? minPkg! : event.price;
                if (displayPrice === 0 && !hasPackages) return <span className="font-playfair text-lg font-bold text-green-600">Free</span>;
                return (
                  <>
                    <span className="font-inter text-[10px] text-dark/40 mr-1">{hasPackages ? 'from' : 'onwards'}</span>
                    <span className="font-playfair text-lg font-bold text-gold">{formatPrice(displayPrice)}</span>
                  </>
                );
              })()}
            </div>
            {event.interestedCount > 0 && (
              <div className="flex items-center gap-1.5 text-dark/40">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="font-inter text-xs">{event.interestedCount} interested</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('');
  const [genres, setGenres] = useState<string[]>([]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEvents({ limit: 500 });
      setEvents(res.data);
      const uniqueGenres = Array.from(new Set(res.data.map((e) => e.genre).filter(Boolean)));
      setGenres(uniqueGenres);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = events.filter((e) => {
    const matchesGenre = !activeGenre || e.genre === activeGenre;
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.toLowerCase().includes(search.toLowerCase()) ||
      e.genre?.toLowerCase().includes(search.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-light pt-24 pb-16">
      <WakingUpBanner loading={loading} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-dark mb-2">
            Events
          </h1>
          <p className="font-inter text-dark/50 text-sm sm:text-base">
            Discover live experiences curated just for you
          </p>
        </motion.div>

        {/* Search + Genre filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
            <input
              type="text"
              placeholder="Search events, venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-dark/10 text-dark font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all shadow-sm"
            />
          </div>

          {/* Genre filter pills */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveGenre('')}
                className={`px-4 py-2 rounded-full font-inter text-sm font-medium transition-all duration-200 border ${
                  activeGenre === ''
                    ? 'bg-dark text-white border-dark'
                    : 'bg-white text-dark/60 border-dark/10 hover:border-dark/30'
                }`}
              >
                All
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setActiveGenre(activeGenre === genre ? '' : genre)}
                  className={`px-4 py-2 rounded-full font-inter text-sm font-medium transition-all duration-200 border ${
                    activeGenre === genre
                      ? 'bg-dark text-white border-dark'
                      : 'bg-white text-dark/60 border-dark/10 hover:border-dark/30'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Results count */}
        {!loading && !error && (
          <p className="font-inter text-xs text-dark/40 mb-5">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <p className="font-inter text-dark/60 mb-4">{error}</p>
            <button onClick={fetchEvents} className="text-sm font-inter text-primary hover:underline">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <Calendar className="w-16 h-16 text-dark/15 mx-auto mb-4" />
            <p className="font-playfair text-xl text-dark/40 mb-2">No events found</p>
            <p className="font-inter text-sm text-dark/30">
              {search || activeGenre ? 'Try adjusting your filters' : 'Check back soon for upcoming events'}
            </p>
            {(search || activeGenre) && (
              <button
                onClick={() => { setSearch(''); setActiveGenre(''); }}
                className="mt-4 text-primary font-inter text-sm hover:underline"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            <AnimatePresence>
              {filtered.map((event, i) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
