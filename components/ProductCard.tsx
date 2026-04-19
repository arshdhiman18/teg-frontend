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

export default function ProductCard({ product }: ProductCardProps) {
  const discountedPrice = getDiscountedPrice(product.price, product.discount);
  const hasDiscount = product.discount > 0;
  const imageUrl = product.images?.[0] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white rounded-3xl overflow-hidden shadow-luxury hover:shadow-luxury-hover hover:shadow-gold-glow border border-transparent hover:border-gold/20 transition-all duration-500"
    >
      <Link href={`/product/${product.slug || product._id}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[4/3] bg-light">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-all duration-500" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-light to-dark/5">
              <ImageOff className="w-10 h-10 text-dark/20" />
              <span className="font-inter text-xs text-dark/30">No image yet</span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${
                categoryColors[product.category] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {product.category}
            </span>
          </div>

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-inter font-medium bg-gold text-dark">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-inter font-semibold bg-red-500 text-white">
                -{product.discount}%
              </span>
            </div>
          )}

          {/* View Button - appears on hover */}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 text-dark text-xs font-inter font-semibold shadow-lg">
              View Setup
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Budget Tag */}
          <div className="mb-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-inter font-medium border ${
                budgetTagColors[product.budgetTag] || 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {product.budgetTag}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-playfair text-lg font-semibold text-dark leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {product.title}
          </h3>

          {/* Description preview */}
          {product.description && (
            <p className="font-inter text-xs text-dark/50 line-clamp-2 leading-relaxed mb-3">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-light">
            <div className="flex items-baseline gap-2">
              <span className="font-playfair text-xl font-bold text-gold">
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <span className="font-inter text-sm text-dark/40 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <span className="text-primary group-hover:text-gold transition-colors duration-300">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
