'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
  Theater,
  Hourglass,
  Share2,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Zap,
  Star,
  ArrowLeft,
  Loader2,
  ImageOff,
  Check,
  ExternalLink,
} from 'lucide-react';
import { getEvent, getEvents, markEventInterest, Event, formatPrice } from '@/lib/api';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';

const GENRE_COLORS: Record<string, string> = {
  Comedy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Music: 'bg-purple-100 text-purple-800 border-purple-200',
  Theatre: 'bg-red-100 text-red-800 border-red-200',
  Dance: 'bg-pink-100 text-pink-800 border-pink-200',
  Sports: 'bg-green-100 text-green-800 border-green-200',
  Festival: 'bg-orange-100 text-orange-800 border-orange-200',
  Kids: 'bg-blue-100 text-blue-800 border-blue-200',
  Art: 'bg-teal-100 text-teal-800 border-teal-200',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [interested, setInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showVenues, setShowVenues] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await getEvent(id);
        setEvent(res.data);
        setInterestedCount(res.data.interestedCount || 0);
        const related = await getEvents({ genre: res.data.genre, limit: 4 });
        setRelatedEvents(related.data.filter((e) => e._id !== res.data._id).slice(0, 3));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleInterest = async () => {
    if (interested || !event) return;
    setInterested(true);
    try {
      const res = await markEventInterest(event._id);
      setInterestedCount(res.interestedCount);
    } catch {
      setInterested(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event?.title, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (!event) return;
    const dateLabel = event.endDate ? `${event.startDate} - ${event.endDate}` : event.startDate;
    const message = encodeURIComponent(
      `Hi, I'm interested in this event:\n\nEvent: ${event.title}\nDate: ${dateLabel}\nVenue: ${event.venue}\nPrice: ${formatPrice(event.price)} onwards\n\nPage: ${window.location.href}\n\nPlease share booking details.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const prevImage = () => setActiveImage((p) => (p === 0 ? (event!.images.length - 1) : p - 1));
  const nextImage = () => setActiveImage((p) => (p === (event!.images.length - 1) ? 0 : p + 1));

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-light flex flex-col items-center justify-center gap-4">
        <Calendar className="w-16 h-16 text-dark/20" />
        <h2 className="font-playfair text-2xl text-dark/60">Event not found</h2>
        <Link href="/events" className="text-primary font-inter text-sm hover:underline">
          Back to Events
        </Link>
      </div>
    );
  }

  const dateLabel = event.endDate ? `${event.startDate} - ${event.endDate}` : event.startDate;
  const genreStyle = GENRE_COLORS[event.genre] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="min-h-screen bg-light">
      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <button
          onClick={() => router.push('/events')}
          className="flex items-center gap-2 text-dark/50 hover:text-dark font-inter text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-dark leading-tight">
            {event.title}
          </h1>
          <button
            onClick={handleShare}
            className="shrink-0 p-2.5 rounded-xl border border-dark/10 text-dark/50 hover:text-dark hover:border-dark/30 transition-all"
            title="Share"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">

          {/* Left: Image gallery */}
          <div>
            {/* Main image */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-dark/10 mb-3 group">
              {event.images.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={event.images[activeImage]}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 65vw"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Nav arrows */}
                  {event.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark/50 hover:bg-dark/80 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark/50 hover:bg-dark/80 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Dot indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {event.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`rounded-full transition-all ${i === activeImage ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {event.featured && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-inter font-semibold bg-gold text-dark">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>
                  {event.fillingFast && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-inter font-semibold bg-red-500 text-white">
                        <Zap className="w-3 h-3 fill-current" />
                        Filling Fast
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-dark/5 to-dark/10">
                  <ImageOff className="w-14 h-14 text-dark/20" />
                  <span className="font-inter text-sm text-dark/30">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {event.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {event.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImage ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" width={80} height={56} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-inter font-medium bg-dark text-white">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Interested */}
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-2 text-dark/60">
                <ThumbsUp className="w-4 h-4" />
                <span className="font-inter text-sm font-medium">{interestedCount} are interested</span>
              </div>
              <button
                onClick={handleInterest}
                disabled={interested}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-inter text-sm font-semibold border-2 transition-all duration-300 ${
                  interested
                    ? 'bg-green-50 border-green-400 text-green-600'
                    : 'bg-white border-dark/20 text-dark hover:border-primary hover:text-primary'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${interested ? 'fill-green-500 text-green-500' : ''}`} />
                {interested ? "I'm Interested ✓" : "I'm Interested"}
              </button>
            </div>

            {/* About section */}
            {event.description && (
              <div className="mt-8">
                <h2 className="font-playfair text-xl font-semibold text-dark mb-3">About The Event</h2>
                <div className="w-12 h-0.5 bg-gold mb-4" />
                <p className="font-inter text-dark/70 text-sm leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: Info card */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-white rounded-2xl border border-dark/8 shadow-luxury p-5 space-y-4">

              {/* Date */}
              {event.startDate && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-dark/40 uppercase tracking-wide mb-0.5">Date</p>
                    <p className="font-inter text-sm font-semibold text-dark">{dateLabel}</p>
                  </div>
                </div>
              )}

              {/* Time */}
              {event.time && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-dark/40 uppercase tracking-wide mb-0.5">Time</p>
                    <p className="font-inter text-sm font-semibold text-dark">{event.time}</p>
                  </div>
                </div>
              )}

              {/* Duration */}
              {event.duration && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Hourglass className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-dark/40 uppercase tracking-wide mb-0.5">Duration</p>
                    <p className="font-inter text-sm font-semibold text-dark">{event.duration}</p>
                  </div>
                </div>
              )}

              {/* Age Limit */}
              {event.ageLimit && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-dark/40 uppercase tracking-wide mb-0.5">Age Limit</p>
                    <p className="font-inter text-sm font-semibold text-dark">{event.ageLimit}</p>
                  </div>
                </div>
              )}

              {/* Language */}
              {event.language && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-dark/40 uppercase tracking-wide mb-0.5">Language</p>
                    <p className="font-inter text-sm font-semibold text-dark">{event.language}</p>
                  </div>
                </div>
              )}

              {/* Genre */}
              {event.genre && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Theater className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-dark/40 uppercase tracking-wide mb-0.5">Genre</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-inter font-semibold border ${genreStyle}`}>
                      {event.genre}
                    </span>
                  </div>
                </div>
              )}

              {/* Venue */}
              {event.venue && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter text-[10px] text-dark/40 uppercase tracking-wide mb-0.5">Venue</p>
                    <p className="font-inter text-sm font-semibold text-dark">{event.venue}</p>
                    {event.otherVenues?.length > 0 && (
                      <button
                        onClick={() => setShowVenues(!showVenues)}
                        className="font-inter text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                      >
                        View {event.otherVenues.length} Other Venue{event.otherVenues.length !== 1 ? 's' : ''}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    <AnimatePresence>
                      {showVenues && event.otherVenues?.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-1 overflow-hidden"
                        >
                          {event.otherVenues.map((v, i) => (
                            <p key={i} className="font-inter text-xs text-dark/60 pl-2 border-l-2 border-primary/30">
                              {v}
                            </p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-dark/8" />

              {/* Price + CTA */}
              <div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-playfair text-2xl font-bold text-dark">{formatPrice(event.price)}</span>
                  <span className="font-inter text-sm text-dark/50">onwards</span>
                </div>
                {event.fillingFast && (
                  <p className="font-inter text-xs text-red-500 font-semibold flex items-center gap-1 mb-3">
                    <Zap className="w-3 h-3 fill-red-500" />
                    Filling Fast
                  </p>
                )}
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-inter font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Book Now via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <div className="mt-14">
            <h2 className="font-playfair text-2xl font-semibold text-dark mb-6">More {event.genre} Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedEvents.map((rel) => {
                const relDateLabel = rel.endDate ? `${rel.startDate} - ${rel.endDate}` : rel.startDate;
                return (
                  <Link key={rel._id} href={`/events/${rel.slug || rel._id}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-luxury hover:shadow-luxury-hover border border-transparent hover:border-gold/20 transition-all duration-500"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-light">
                        {rel.images?.[0] ? (
                          <Image src={rel.images[0]} alt={rel.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" sizes="33vw" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-dark/5">
                            <ImageOff className="w-8 h-8 text-dark/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-playfair text-base font-semibold text-dark line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {rel.title}
                        </h3>
                        {rel.startDate && (
                          <div className="flex items-center gap-1.5 text-dark/50">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-inter text-xs">{relDateLabel}</span>
                          </div>
                        )}
                        <p className="font-playfair text-gold font-bold text-base mt-2">{formatPrice(rel.price)} <span className="font-inter text-xs font-normal text-dark/40">onwards</span></p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
