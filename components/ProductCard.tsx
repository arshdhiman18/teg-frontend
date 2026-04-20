'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Star, ImageOff } from 'lucide-react';
import { Product, formatPrice, getDiscountedPrice } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

const budgetTagColors: Record<string, string> = {
  Pocket: 'bg-green-100 text-green-800 border-green-200',
  Premium: 'bg-blue-100 text-blue-800 border-blue-200',
  Luxury: 'bg-gold/10 text-gold border-gold/30',
};

const categoryColors: Record<string, string> = {
  Birthday: 'bg-pink-50 text-pink-700',
  Wedding: 'bg-rose-50 text-rose-700',
  Anniversary: 'bg-purple-50 text-purple-700',
  Corporate: 'bg-slate-100 text-slate-700',
  'Baby Shower': 'bg-yellow-50 text-yellow-700',
  Engagement: 'bg-indigo-50 text-indigo-700',
  Other: 'bg-gray-50 text-gray-700',
};

const DESC_LIMIT = 85;

export default function ProductCard({ product }: ProductCardProps) {
  const discountedPrice = getDiscountedPrice(product.price, product.discount);
  const hasDiscount = product.discount > 0;
  const imageUrl = product.images?.[0] || null;
  const shortDesc = product.description && product.description.length > DESC_LIMIT
    ? product.description.slice(0, DESC_LIMIT).trimEnd()
    : product.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-luxury hover:shadow-luxury-hover hover:shadow-gold-glow border border-transparent hover:border-gold/20 transition-all duration-500"
    >
      <Link href={`/product/${product.slug || product._id}`} className="flex flex-col h-full">

        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-light">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-all duration-500" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-light to-dark/5">
              <ImageOff className="w-6 h-6 sm:w-10 sm:h-10 text-dark/20" />
              <span className="font-inter text-[10px] sm:text-xs text-dark/30">No image yet</span>
            </div>
          )}

          {/* Category badge — truncated on mobile */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 max-w-[calc(100%-40px)]">
            <span
              className={`block truncate px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-inter font-medium ${
                categoryColors[product.category] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {product.category}
            </span>
          </div>

          {/* Featured — star only on mobile, full badge on sm+ */}
          {product.featured && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <span className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 rounded-full text-[9px] sm:text-xs font-inter font-medium bg-gold text-dark">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current shrink-0" />
                <span className="hidden sm:inline">Featured</span>
              </span>
            </div>
          )}

          {/* Discount */}
          {hasDiscount && (
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
              <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-inter font-semibold bg-red-500 text-white">
                -{product.discount}%
              </span>
            </div>
          )}

          {/* View hover button — desktop only */}
          <div className="hidden sm:block absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 text-dark text-xs font-inter font-semibold shadow-lg">
              View Setup
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5 flex flex-col flex-1">

          {/* Budget tag */}
          <div className="mb-1.5 sm:mb-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-inter font-medium border ${
              budgetTagColors[product.budgetTag] || 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              {product.budgetTag}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-playfair text-sm sm:text-lg font-semibold text-dark leading-snug mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {product.title}
          </h3>

          {/* Description — hidden on mobile */}
          {shortDesc && (
            <p className="hidden sm:block font-inter text-xs text-dark/50 leading-relaxed mb-3">
              {shortDesc}
              {product.description.length > DESC_LIMIT && (
                <span className="text-primary/70 font-medium"> ...more</span>
              )}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mt-auto pt-2 sm:pt-3 border-t border-light">
            <div className="flex items-baseline gap-1 sm:gap-2 min-w-0">
              <span className="font-playfair text-sm sm:text-xl font-bold text-gold truncate">
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <span className="hidden sm:inline font-inter text-sm text-dark/40 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <span className="text-primary group-hover:text-gold transition-colors duration-300 shrink-0">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
        </div>

      </Link>
    </motion.div>
  );
}
