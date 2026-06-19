import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, ChevronDown, Grid, LayoutList } from 'lucide-react';
import ProductCard from './ProductCard';
import { getProducts, getCategories } from '../api';

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-5 w-1/3 rounded" />
          <div className="skeleton h-8 w-1/4 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ProductSection() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [gridView, setGridView] = useState('grid');

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (search) params.search = search;

    getProducts(params)
      .then((res) => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setActiveCategory('all');
  };

  const allCategories = [{ name: 'All Products', slug: 'all', icon: '🛒' }, ...categories];

  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Our Collection
          </span>
          <h2 className="section-title">
            Handcrafted{' '}
            <span className="text-gradient">Furniture</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Explore our wide range of premium wooden furniture crafted with precision and care
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search furniture..."
              className="input-field pl-11 pr-4"
            />
          </form>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGridView('grid')}
              className={`p-2.5 rounded-lg border transition-colors ${gridView === 'grid' ? 'bg-primary-100 border-primary-300 text-primary-600' : 'border-gray-200 text-gray-500 hover:border-primary-200'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setGridView('list')}
              className={`p-2.5 rounded-lg border transition-colors ${gridView === 'list' ? 'bg-primary-100 border-primary-300 text-primary-600' : 'border-gray-200 text-gray-500 hover:border-primary-200'}`}
            >
              <LayoutList size={18} />
            </button>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {allCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setActiveCategory(cat.slug === 'all' ? 'all' : cat.name); setSearch(''); setSearchInput(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                (cat.slug === 'all' ? activeCategory === 'all' : activeCategory === cat.name)
                  ? 'bg-primary-600 text-white shadow-wood'
                  : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className={`grid gap-6 ${gridView === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛋️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
            <p className="text-gray-400">Try a different category or search term</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${gridView === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {products.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 text-sm">
              Showing <span className="font-semibold text-primary-600">{products.length}</span> products
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
