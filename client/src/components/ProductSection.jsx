import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { getProducts, getCategories } from '../api';

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
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts({ limit: 100 }),
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

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((product) => {
          if (!product.categories || !Array.isArray(product.categories)) return false;
          return product.categories.some((cat) => {
            const catName = typeof cat === 'string' ? cat : cat.name || '';
            return catName === activeCategory;
          });
        });

  return (
    <section id="projects" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
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

        {/* Category Filter Tabs */}
        <motion.div
          className="flex overflow-x-auto gap-2 mb-10 sm:mb-12 pb-2 scrollbar-hide sm:justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => setActiveCategory('all')}
            className={
              activeCategory === 'all' ? 'category-pill-active' : 'category-pill'
            }
          >
            All Projects
          </button>

          {categories.map((cat) => {
            const catName = typeof cat === 'string' ? cat : cat.name || '';
            return (
              <button
                key={catName}
                onClick={() => setActiveCategory(catName)}
                className={
                  activeCategory === catName
                    ? 'category-pill-active'
                    : 'category-pill'
                }
              >
                {catName}
              </button>
            );
          })}
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 rounded-full bg-dark-800 border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-7 h-7 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-lg font-display">
              No projects found in this category
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Try selecting a different category above
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
