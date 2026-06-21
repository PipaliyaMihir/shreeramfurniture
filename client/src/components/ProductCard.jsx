import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80';

const getImageUrl = (img) => {
  if (!img) return FALLBACK_IMAGE;
  if (img.startsWith('http')) return img;
  return img;
};

const ProductCard = ({ product }) => {
  const imageUrl =
    product.images && product.images.length > 0
      ? getImageUrl(product.images[0])
      : FALLBACK_IMAGE;

  const displayCategories = (product.categories || []).slice(0, 2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/project/${product._id}`}
        className="group relative block overflow-hidden rounded-2xl bg-dark-800 border border-white/[0.06] hover:border-gold-400/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(191,155,48,0.08)]"
      >
        {/* Image Container — 16:10 aspect */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <h3 className="font-display text-lg font-bold text-white mb-2 line-clamp-1">
            {product.name}
          </h3>

          {displayCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {displayCategories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat.name || cat;
                return (
                  <span
                    key={catName}
                    className="text-xs bg-white/50 text-gray-300 font-bold rounded-full px-2 py-0.5"
                  >
                    {catName}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
