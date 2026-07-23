import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { getProducts, getCategories } from '../api';

const PAGE_SIZE = 12; // Show 12 projects at a time

const SkeletonCard = () => (
  <div className="rounded-2xl bg-dark-800 border border-white/[0.06] overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-dark-700" />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="h-5 bg-dark-700 rounded w-3/4" />
      <div className="flex gap-1.5">
        <div className="h-5 bg-dark-700 rounded-full w-16" />
        <div className="h-5 bg-dark-700 rounded-full w-14" />
      </div>
    </div>
  </div>
);

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts({ limit: 500 }),
          getCategories(),
        ]);
        const productsData = productsRes.data?.products || productsRes.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch project data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync search from URL params
  useEffect(() => {
    const syncSearchFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get('search');
      if (searchParam !== null) setSearchQuery(searchParam);
    };
    syncSearchFromUrl();
    window.addEventListener('app-search-update', syncSearchFromUrl);
    return () => window.removeEventListener('app-search-update', syncSearchFromUrl);
  }, []);

  // Reset pagination when filter/search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory, searchQuery]);

  const filteredProducts = products.filter((product) => {
    if (activeCategory !== 'all') {
      if (!product.categories || !Array.isArray(product.categories)) return false;
      const hasCat = product.categories.some((cat) => {
        const catName = typeof cat === 'string' ? cat : cat.name || '';
        return catName === activeCategory;
      });
      if (!hasCat) return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = product.name?.toLowerCase().includes(q);
      const matchDesc = product.description?.toLowerCase().includes(q);
      const matchCat = product.categories?.some((cat) => {
        const catName = typeof cat === 'string' ? cat : cat.name || '';
        return catName.toLowerCase().includes(q);
      });
      return matchName || matchDesc || matchCat;
    }

    return true;
  });

  // Only render the visible slice
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Small delay so skeleton shows briefly then new cards appear
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 400);
  };

  return (
    <section id="projects" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 flex flex-col items-center">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Portfolio
          </motion.span>

          <motion.h2
            className="section-title mt-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Completed Projects
          </motion.h2>

          <motion.p
            className="section-subtitle mt-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Explore our recently completed custom furniture projects for bungalows, offices, and showrooms
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          className="max-w-xl mx-auto mb-8 relative"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-gold-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, categories or keywords..."
              className="w-full bg-dark-800/90 border border-white/[0.08] focus:border-gold-400/50 rounded-2xl py-3 pl-11 pr-10 text-sm text-gray-200 placeholder-gray-500 transition-all outline-none shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 max-w-5xl mx-auto mb-10 sm:mb-12 px-2"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={() => setActiveCategory('all')}
            className={activeCategory === 'all' ? 'category-pill-active' : 'category-pill'}
          >
            All Projects
          </button>

          {categories.map((cat) => {
            const catName = typeof cat === 'string' ? cat : cat.name || '';
            const catIcon = typeof cat === 'object' ? cat.icon || '' : '';
            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                className={activeCategory === catName ? 'category-pill-active' : 'category-pill'}
              >
                {catIcon && <span className="mr-1.5">{catIcon}</span>}
                {catName}
              </button>
            );
          })}
        </motion.div>

        {/* Project count indicator */}
        {!loading && filteredProducts.length > 0 && (
          <div className="text-center text-gray-500 text-xs mb-6">
            Showing <span className="text-gold-400 font-semibold">{visibleProducts.length}</span> of{' '}
            <span className="text-gray-300 font-semibold">{filteredProducts.length}</span> projects
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 rounded-full bg-dark-800 border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-gold-400/60" />
            </div>
            <p className="text-gray-300 text-lg font-display font-semibold">No matching projects found</p>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              {searchQuery
                ? `No results for "${searchQuery}"${activeCategory !== 'all' ? ` in ${activeCategory}` : ''}. Try a different keyword.`
                : `No projects found in ${activeCategory}.`}
            </p>
            {(searchQuery || activeCategory !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="btn-outline mt-6 px-5 py-2 text-xs font-semibold text-gold-400 border-gold-400/30 hover:bg-gold-400/10"
              >
                Reset Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {visibleProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More skeleton while fetching next batch */}
            {loadingMore && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !loadingMore && (
              <motion.div
                className="flex flex-col items-center mt-12 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-gray-500 text-xs">
                  {filteredProducts.length - visibleCount} more projects available
                </p>
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-gold-400/30 text-gold-400 text-sm font-semibold hover:bg-gold-400/10 hover:border-gold-400/60 transition-all duration-300"
                >
                  Load More Projects
                  <ChevronDown className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* All loaded indicator */}
            {!hasMore && filteredProducts.length > PAGE_SIZE && (
              <div className="text-center mt-10 text-gray-600 text-xs">
                ✓ All {filteredProducts.length} projects loaded
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
