'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Search, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getProducts, Product } from '@/lib/api';

const CATEGORIES = ['Birthday', 'Wedding', 'Anniversary', 'Corporate', 'Baby Shower', 'Engagement', 'Other'];
const BUDGET_TAGS = ['Pocket', 'Premium', 'Luxury'];
const MAX_PRICE = 600000;

function CollectionsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProducts({
        category: selectedCategory || undefined,
        budgetTag: selectedBudget || undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < MAX_PRICE ? priceRange[1] : undefined,
        search: searchQuery || undefined,
      });
      setProducts(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedBudget, priceRange, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBudget('');
    setPriceRange([0, MAX_PRICE]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedBudget || priceRange[0] > 0 || priceRange[1] < MAX_PRICE || searchQuery;

  const formatPriceLabel = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-dark pt-32 pb-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-inter text-xs text-gold tracking-widest uppercase mb-3">Our Work</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">
            Event Collections
          </h1>
          <p className="font-inter text-white/50 max-w-xl mx-auto">
            Explore our curated portfolio of luxury event setups — each one a unique story.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-dark/10 text-dark placeholder:text-dark/30 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-inter font-medium text-sm transition-all duration-300 border ${
              showFilters
                ? 'bg-dark text-white border-dark'
                : 'bg-white text-dark border-dark/10 hover:border-dark/20'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-gold" />
            )}
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl font-inter text-sm text-dark/50 hover:text-dark border border-dark/10 bg-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white rounded-3xl p-6 border border-dark/5 shadow-luxury">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Event Type */}
                  <div>
                    <h3 className="font-inter font-semibold text-sm text-dark mb-4 uppercase tracking-wide">
                      Event Type
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-300 border ${
                          !selectedCategory
                            ? 'bg-dark text-white border-dark'
                            : 'bg-white text-dark/60 border-dark/15 hover:border-dark/30'
                        }`}
                      >
                        All
                      </button>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-300 border ${
                            selectedCategory === cat
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-dark/60 border-dark/15 hover:border-dark/30'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Tag */}
                  <div>
                    <h3 className="font-inter font-semibold text-sm text-dark mb-4 uppercase tracking-wide">
                      Budget Range
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedBudget('')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-300 border ${
                          !selectedBudget
                            ? 'bg-dark text-white border-dark'
                            : 'bg-white text-dark/60 border-dark/15 hover:border-dark/30'
                        }`}
                      >
                        All
                      </button>
                      {BUDGET_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedBudget(selectedBudget === tag ? '' : tag)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-300 border ${
                            selectedBudget === tag
                              ? tag === 'Luxury'
                                ? 'bg-gold text-dark border-gold'
                                : tag === 'Premium'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-dark/60 border-dark/15 hover:border-dark/30'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-inter font-semibold text-sm text-dark mb-4 uppercase tracking-wide">
                      Price Range
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-inter text-dark/50">
                        <span>{formatPriceLabel(priceRange[0])}</span>
                        <span>{formatPriceLabel(priceRange[1])}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={MAX_PRICE}
                        step={5000}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full accent-gold cursor-pointer"
                      />
                      <p className="text-xs text-dark/40 font-inter">
                        Up to {formatPriceLabel(priceRange[1])}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategory && (
              <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-inter px-3 py-1.5 rounded-full border border-primary/20">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedBudget && (
              <span className="flex items-center gap-1.5 bg-gold/10 text-gold text-xs font-inter px-3 py-1.5 rounded-full border border-gold/20">
                {selectedBudget}
                <button onClick={() => setSelectedBudget('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="flex items-center gap-1.5 bg-dark/10 text-dark text-xs font-inter px-3 py-1.5 rounded-full border border-dark/10">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="font-inter text-sm text-dark/50 mb-6">
            {products.length} {products.length === 1 ? 'setup' : 'setups'} found
          </p>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="font-inter text-sm text-dark/40">Loading collections...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <p className="font-inter text-dark/60 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="text-sm font-inter text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gold" />
            </div>
            <h3 className="font-playfair text-2xl font-semibold text-dark mb-3">No setups found</h3>
            <p className="font-inter text-dark/50 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="font-inter text-sm font-medium text-primary hover:text-dark transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
