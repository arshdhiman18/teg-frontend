'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Search, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getProducts, Product } from '@/lib/api';
import { SECTIONS, CATEGORY_STRUCTURE, GENDER_OPTIONS, BUDGET_TAGS, getSubCategories } from '@/lib/categories';

const MAX_PRICE = 600000;

const formatPriceLabel = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

// ── Filter state type ──────────────────────────────────────────────────────
interface Filters {
  section: string;
  category: string[];
  subCategory: string;
  gender: string;
  budget: string;
  priceRange: [number, number];
  search: string;
}

const defaultFilters = (): Filters => ({
  section: '',
  category: [],
  subCategory: '',
  gender: '',
  budget: '',
  priceRange: [0, MAX_PRICE],
  search: '',
});

// ── Count active filters (excluding search & priceRange defaults) ──────────
const countActiveFilters = (f: Filters) => {
  let n = 0;
  if (f.section) n++;
  if (f.category.length > 0) n++;
  if (f.subCategory) n++;
  if (f.gender) n++;
  if (f.budget) n++;
  if (f.priceRange[0] > 0 || f.priceRange[1] < MAX_PRICE) n++;
  return n;
};

// ── Filter panel (shared between desktop modal and mobile sheet) ───────────
function FilterPanel({
  filters,
  onChange,
  onClear,
  onClose,
}: {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const subCats = filters.category.length === 1 ? getSubCategories(filters.category[0]) : [];

  const pill = (active: boolean, accent?: 'gold' | 'blue' | 'green') =>
    active
      ? accent === 'gold'
        ? 'bg-gold text-dark border-gold'
        : accent === 'blue'
        ? 'bg-blue-600 text-white border-blue-600'
        : accent === 'green'
        ? 'bg-green-600 text-white border-green-600'
        : 'bg-dark text-white border-dark'
      : 'bg-white text-dark/60 border-dark/15 hover:border-dark/30';

  const budgetAccent = (tag: string): 'gold' | 'blue' | 'green' | undefined =>
    tag === 'Luxury' ? 'gold' : tag === 'Premium' ? 'blue' : 'green';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark/8 shrink-0">
        <div>
          <h3 className="font-playfair text-lg font-semibold text-dark">Filters</h3>
          {countActiveFilters(filters) > 0 && (
            <p className="font-inter text-xs text-dark/40 mt-0.5">{countActiveFilters(filters)} active</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {countActiveFilters(filters) > 0 && (
            <button
              onClick={onClear}
              className="font-inter text-xs text-dark/40 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-dark/30 hover:text-dark hover:bg-light transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-7">

        {/* Section */}
        <div>
          <p className="font-inter font-semibold text-xs text-dark/50 uppercase tracking-wider mb-3">Section</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange({ section: '', category: [], subCategory: '' })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(!filters.section)}`}
            >
              All
            </button>
            {SECTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onChange({ section: filters.section === s ? '' : s, category: [], subCategory: '' })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(filters.section === s, 'gold')}`}
              >
                {s === 'Social & Home Celebrations' ? 'Social & Home' : 'Signature Events'}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="font-inter font-semibold text-xs text-dark/50 uppercase tracking-wider mb-3">Category</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange({ category: [], subCategory: '' })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(filters.category.length === 0)}`}
            >
              All
            </button>
            {Object.entries(CATEGORY_STRUCTURE)
              .filter(([sec]) => !filters.section || sec === filters.section)
              .flatMap(([, cats]) => Object.keys(cats))
              .map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const next = filters.category.includes(cat)
                      ? filters.category.filter((c) => c !== cat)
                      : [...filters.category, cat];
                    onChange({ category: next, subCategory: '' });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(filters.category.includes(cat))}`}
                >
                  {cat}
                </button>
              ))}
          </div>
        </div>

        {/* Sub-category (only when parent has subs) */}
        {subCats.length > 0 && (
          <div>
            <p className="font-inter font-semibold text-xs text-dark/50 uppercase tracking-wider mb-3">Sub-category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onChange({ subCategory: '' })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(!filters.subCategory)}`}
              >
                All
              </button>
              {subCats.map((sub) => (
                <button
                  key={sub}
                  onClick={() => onChange({ subCategory: filters.subCategory === sub ? '' : sub })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(filters.subCategory === sub)}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gender */}
        <div>
          <p className="font-inter font-semibold text-xs text-dark/50 uppercase tracking-wider mb-3">For</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange({ gender: '' })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(!filters.gender)}`}
            >
              Everyone
            </button>
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => onChange({ gender: filters.gender === g ? '' : g })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(filters.gender === g)}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <p className="font-inter font-semibold text-xs text-dark/50 uppercase tracking-wider mb-3">Budget Range</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange({ budget: '' })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(!filters.budget)}`}
            >
              All
            </button>
            {BUDGET_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => onChange({ budget: filters.budget === tag ? '' : tag })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-200 border ${pill(filters.budget === tag, budgetAccent(tag))}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-inter font-semibold text-xs text-dark/50 uppercase tracking-wider">Price Range</p>
            <span className="font-inter text-xs text-dark/50">
              Up to {formatPriceLabel(filters.priceRange[1])}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={5000}
            value={filters.priceRange[1]}
            onChange={(e) => onChange({ priceRange: [filters.priceRange[0], Number(e.target.value)] })}
            className="w-full accent-gold cursor-pointer"
          />
          <div className="flex justify-between text-xs font-inter text-dark/35 mt-1.5">
            <span>₹0</span>
            <span>₹6L+</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 border-t border-dark/8 shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl btn-gold text-dark font-inter font-semibold text-sm"
        >
          View Results
        </button>
      </div>
    </div>
  );
}

// ── Main collections content ───────────────────────────────────────────────
function CollectionsContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() => {
    const f = defaultFilters();
    const urlCat = searchParams.get('mainCategory') || searchParams.get('category') || '';
    f.category = urlCat ? [urlCat] : [];
    f.section = searchParams.get('section') || '';
    return f;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = countActiveFilters(filters);
  const hasSearch = !!filters.search;

  useEffect(() => {
    document.documentElement.style.overflow = showFilters ? 'hidden' : '';
    document.body.style.overflow = showFilters ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showFilters]);

  const patchFilters = (patch: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const clearFilters = () => setFilters(defaultFilters());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProducts({
        category: filters.category.length > 0 ? filters.category.join(',') : undefined,
        section: filters.section || undefined,
        subCategory: filters.subCategory || undefined,
        gender: filters.gender || undefined,
        budgetTag: filters.budget || undefined,
        minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        maxPrice: filters.priceRange[1] < MAX_PRICE ? filters.priceRange[1] : undefined,
        search: filters.search || undefined,
      });
      setProducts(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const allActiveChips = [
    filters.section && { label: filters.section === 'Social & Home Celebrations' ? 'Social & Home' : 'Signature', clear: () => patchFilters({ section: '', category: [], subCategory: '' }) },
    ...filters.category.map((cat) => ({ label: cat, clear: () => patchFilters({ category: filters.category.filter((c) => c !== cat), subCategory: '' }) })),
    filters.subCategory && { label: filters.subCategory, clear: () => patchFilters({ subCategory: '' }) },
    filters.gender && { label: filters.gender, clear: () => patchFilters({ gender: '' }) },
    filters.budget && { label: filters.budget, clear: () => patchFilters({ budget: '' }) },
    (filters.priceRange[0] > 0 || filters.priceRange[1] < MAX_PRICE) && {
      label: `${formatPriceLabel(filters.priceRange[0])} – ${formatPriceLabel(filters.priceRange[1])}`,
      clear: () => patchFilters({ priceRange: [0, MAX_PRICE] }),
    },
    filters.search && { label: `"${filters.search}"`, clear: () => patchFilters({ search: '' }) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-dark pt-32 pb-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="font-inter text-xs text-gold tracking-widest uppercase mb-3">Our Work</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">Event Collections</h1>
          <p className="font-inter text-white/50 max-w-xl mx-auto">
            Explore our curated portfolio of luxury event setups — each one a unique story.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 lg:pb-10">
        {/* Search + Filter toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/30" />
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => patchFilters({ search: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-dark/10 text-dark placeholder:text-dark/30 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
            />
          </div>

          {/* Desktop filter button */}
          <button
            onClick={() => setShowFilters(true)}
            className={`hidden lg:flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-inter font-medium text-sm transition-all duration-300 border ${
              activeCount > 0 ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-dark/10 hover:border-dark/20'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold text-dark text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
            )}
          </button>

          {/* Clear */}
          {(activeCount > 0 || hasSearch) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl font-inter text-sm text-dark/50 hover:text-dark border border-dark/10 bg-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {allActiveChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {allActiveChips.map((chip, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 bg-dark/8 text-dark text-xs font-inter px-3 py-1.5 rounded-full border border-dark/10"
              >
                {chip.label}
                <button onClick={chip.clear} className="hover:text-red-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="font-inter text-sm text-dark/50 mb-6">
            {products.length} {products.length === 1 ? 'setup' : 'setups'} found
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="font-inter text-sm text-dark/40">Loading collections...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <p className="font-inter text-dark/60 mb-4">{error}</p>
            <button onClick={() => fetchProducts()} className="text-sm font-inter text-primary hover:underline">Try again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gold" />
            </div>
            <h3 className="font-playfair text-2xl font-semibold text-dark mb-3">No setups found</h3>
            <p className="font-inter text-dark/50 mb-6">Try adjusting your filters or search query</p>
            <button onClick={clearFilters} className="font-inter text-sm font-medium text-primary hover:text-dark transition-colors">
              Clear all filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && products.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* ── Mobile sticky filter button ────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
        <div className="bg-white/95 backdrop-blur-md border-t border-dark/8 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowFilters(true)}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-inter font-semibold text-sm transition-all duration-300 border ${
              activeCount > 0 ? 'bg-dark text-white border-dark' : 'bg-light text-dark border-dark/15 hover:border-dark/30'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold text-dark text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
            )}
          </button>
          {(activeCount > 0 || hasSearch) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl font-inter text-sm text-dark/50 border border-dark/15 bg-light"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Filter overlays ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* DESKTOP — flex container handles centering (avoids transform conflict with framer y) */}
            <motion.div
              key="desktop-filter-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:flex fixed inset-0 z-50 items-center justify-center p-6"
              onClick={() => setShowFilters(false)}
            >
              <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col"
                style={{ maxHeight: '85vh', minHeight: '480px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <FilterPanel
                  filters={filters}
                  onChange={patchFilters}
                  onClear={clearFilters}
                  onClose={() => setShowFilters(false)}
                />
              </motion.div>
            </motion.div>

            {/* MOBILE — backdrop + bottom sheet */}
            <motion.div
              key="mobile-filter-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
              onClick={() => setShowFilters(false)}
            >
              <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm" />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 bg-white rounded-t-3xl shadow-[0_-16px_60px_rgba(0,0,0,0.15)] max-h-[88vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-dark/15 rounded-full mx-auto mt-3 mb-1 shrink-0" />
                <FilterPanel
                  filters={filters}
                  onChange={patchFilters}
                  onClear={clearFilters}
                  onClose={() => setShowFilters(false)}
                />
              </motion.div>
            </motion.div>

          </>
        )}
      </AnimatePresence>
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
