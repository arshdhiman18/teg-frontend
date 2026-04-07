'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  ChevronLeft,
  Check,
  X,
  Star,
  ArrowRight,
  Loader2,
  Tag,
  Share2,
} from 'lucide-react';
import {
  getProduct,
  getProducts,
  Product,
  formatPrice,
  getDiscountedPrice,
  generateWhatsAppMessage,
} from '@/lib/api';

const TABS = ['Package Includes', "What's Excluded", 'Details'] as const;
type Tab = (typeof TABS)[number];

const budgetTagColors: Record<string, string> = {
  Pocket: 'bg-green-100 text-green-800 border border-green-200',
  Premium: 'bg-blue-100 text-blue-800 border border-blue-200',
  Luxury: 'bg-gold/10 text-gold border border-gold/30',
};

const categoryColors: Record<string, string> = {
  Birthday: 'bg-pink-100 text-pink-700',
  Wedding: 'bg-rose-100 text-rose-700',
  Anniversary: 'bg-purple-100 text-purple-700',
  Corporate: 'bg-slate-100 text-slate-700',
  'Baby Shower': 'bg-yellow-100 text-yellow-700',
  Engagement: 'bg-indigo-100 text-indigo-700',
  Other: 'bg-gray-100 text-gray-700',
};

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('Package Includes');
  const [copied, setCopied] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getProduct(id as string);
        setProduct(res.data);
        // Fetch similar products
        const simRes = await getProducts({
          category: res.data.category,
          limit: 4,
        });
        setSimilar(simRes.data.filter((p) => p._id !== res.data._id).slice(0, 4));
      } catch (err: any) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="font-inter text-dark/50">Loading setup details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="font-playfair text-2xl font-semibold text-dark mb-2">Setup Not Found</h2>
          <p className="font-inter text-dark/50 mb-6">{error || 'This product no longer exists.'}</p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-inter font-medium text-sm hover:bg-dark transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = getDiscountedPrice(product.price, product.discount);
  const hasDiscount = product.discount > 0;
  const images = product.images?.length
    ? product.images
    : ['https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80'];

  const whatsappMsg = generateWhatsAppMessage(product);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  return (
    <div className="min-h-screen bg-light pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-xs font-inter text-dark/40">
          <Link href="/" className="hover:text-dark transition-colors">Home</Link>
          <ChevronLeft className="w-3 h-3 rotate-180" />
          <Link href="/collections" className="hover:text-dark transition-colors">Collections</Link>
          <ChevronLeft className="w-3 h-3 rotate-180" />
          <span className="text-dark/70 truncate max-w-[200px]">{product.title}</span>
        </nav>
      </div>

      {/* Main Product Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* LEFT: Image Gallery (60%) */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <motion.div
              className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-dark/5 shadow-luxury mb-4"
              layoutId={`product-image-${product._id}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[selectedImage]}
                    alt={`${product.title} - image ${selectedImage + 1}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Discount badge */}
              {hasDiscount && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 rounded-full text-sm font-inter font-semibold bg-red-500 text-white shadow-lg">
                    -{product.discount}% OFF
                  </span>
                </div>
              )}
              {/* Featured */}
              {product.featured && (
                <div className="absolute top-4 left-4">
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-inter font-medium bg-gold text-dark shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </span>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === i
                        ? 'border-gold shadow-gold scale-105'
                        : 'border-transparent hover:border-gold/40'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details (40%) */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category + Budget Tag */}
              <div className="flex items-center flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${categoryColors[product.category] || 'bg-gray-100 text-gray-700'}`}>
                  {product.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${budgetTagColors[product.budgetTag] || ''}`}>
                  <Tag className="w-3 h-3 inline mr-1" />
                  {product.budgetTag}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-dark leading-tight mb-4">
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-playfair text-3xl font-bold text-gold">
                  {formatPrice(discountedPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="font-inter text-lg text-dark/40 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm font-inter font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Save {formatPrice(product.price - discountedPrice)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="font-inter text-sm text-dark/60 leading-relaxed mb-6 border-l-2 border-gold/30 pl-4">
                  {product.description}
                </p>
              )}

              {/* Tabs */}
              <div className="mb-4">
                <div className="flex border-b border-dark/10 gap-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-2.5 text-xs font-inter font-medium whitespace-nowrap transition-all duration-300 border-b-2 -mb-px ${
                        activeTab === tab
                          ? 'border-gold text-gold'
                          : 'border-transparent text-dark/50 hover:text-dark'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="pt-4"
                  >
                    {activeTab === 'Package Includes' && (
                      <ul className="space-y-2.5">
                        {product.includes?.length ? (
                          product.includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm font-inter text-dark/70">
                              <span className="mt-0.5 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-green-600" />
                              </span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <p className="text-sm font-inter text-dark/40">Details available on enquiry.</p>
                        )}
                      </ul>
                    )}

                    {activeTab === "What's Excluded" && (
                      <ul className="space-y-2.5">
                        {product.excludes?.length ? (
                          product.excludes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm font-inter text-dark/70">
                              <span className="mt-0.5 w-4 h-4 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                <X className="w-2.5 h-2.5 text-red-400" />
                              </span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <p className="text-sm font-inter text-dark/40">No exclusions listed.</p>
                        )}
                      </ul>
                    )}

                    {activeTab === 'Details' && (
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-dark/5">
                          <span className="text-xs font-inter text-dark/50 uppercase tracking-wide">Category</span>
                          <span className="text-xs font-inter font-medium text-dark">{product.category}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dark/5">
                          <span className="text-xs font-inter text-dark/50 uppercase tracking-wide">Budget Tier</span>
                          <span className="text-xs font-inter font-medium text-dark">{product.budgetTag}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dark/5">
                          <span className="text-xs font-inter text-dark/50 uppercase tracking-wide">Base Price</span>
                          <span className="text-xs font-inter font-medium text-dark">{formatPrice(product.price)}</span>
                        </div>
                        {hasDiscount && (
                          <div className="flex justify-between py-2 border-b border-dark/5">
                            <span className="text-xs font-inter text-dark/50 uppercase tracking-wide">Discount</span>
                            <span className="text-xs font-inter font-medium text-green-600">{product.discount}% off</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2">
                          <span className="text-xs font-inter text-dark/50 uppercase tracking-wide">Items Included</span>
                          <span className="text-xs font-inter font-medium text-dark">{product.includes?.length || 0} items</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 mt-6">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20c05e] text-white font-inter font-semibold px-6 py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_4px_24px_rgba(37,211,102,0.4)] text-sm"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  Enquire on WhatsApp
                </a>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 border border-dark/10 hover:border-dark/20 text-dark/60 hover:text-dark font-inter font-medium px-6 py-3.5 rounded-2xl transition-all duration-300 text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? 'Link Copied!' : 'Share This Setup'}
                </button>
              </div>

              {/* Trust signals */}
              <div className="mt-6 pt-5 border-t border-dark/5 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-inter text-dark/50">Custom setups available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-inter text-dark/50">Price inclusive of setup</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="font-inter text-xs text-primary tracking-widest uppercase mb-1">More Like This</p>
                <h2 className="font-playfair text-2xl font-semibold text-dark">Similar Setups</h2>
              </div>
              <Link
                href={`/collections?category=${product.category}`}
                className="hidden sm:flex items-center gap-1.5 text-sm font-inter text-dark/50 hover:text-dark transition-colors"
              >
                View all {product.category}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link href={`/product/${p.slug || p._id}`} className="group block">
                    <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-3 relative">
                      <Image
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80'}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <h3 className="font-playfair font-semibold text-dark group-hover:text-primary transition-colors text-sm mb-1 line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="font-playfair text-gold font-bold text-base">
                      {formatPrice(getDiscountedPrice(p.price, p.discount))}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
