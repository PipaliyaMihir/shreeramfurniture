import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Eye, ShoppingCart, Tag } from 'lucide-react';

const getImageUrl = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';
  if (img.startsWith('http')) return img;
  return img;
};

const categoryImages = {
  'Sofa & Seating': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  'Bedroom': 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=600&q=80',
  'Dining': 'https://images.unsplash.com/photo-1565538420870-da08ff96a207?w=600&q=80',
  'Office': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
  'Storage': 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&q=80',
  'Outdoor': 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80',
};

function Stars({ rating = 4.5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.floor(rating) ? 'star-filled fill-amber-400' : 'star-empty fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}

export default function ProductCard({ product, index = 0 }) {
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl =
    !imgError && product.images && product.images.length > 0
      ? getImageUrl(product.images[0])
      : categoryImages[product.category] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';

  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="product-card card group overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image w-full h-full object-cover"
          onError={() => setImgError(true)}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-all duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="badge bg-red-500 text-white">-{discount}%</span>
          )}
          {product.featured && (
            <span className="badge bg-primary-500 text-white">Featured</span>
          )}
          {!product.inStock && (
            <span className="badge bg-gray-600 text-white">Out of Stock</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={() => setLiked(!liked)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              liked ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={16} className={liked ? 'fill-white' : ''} />
          </button>
        </div>

        {/* Quick View */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-all duration-300">
          <button className="w-full bg-charcoal/90 backdrop-blur-sm text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-charcoal transition-colors">
            <Eye size={16} />
            Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Stars rating={product.rating} />
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm leading-snug">
          {product.name}
        </h3>

        {product.material && (
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Tag size={10} />
            {product.material}
          </p>
        )}

        <p className="text-gray-500 text-xs line-clamp-2 mb-3">{product.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="price-new">₹{product.price?.toLocaleString('en-IN')}</span>
            {discount > 0 && (
              <span className="price-old ml-2">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-white hover:bg-primary-600 px-3 py-1.5 rounded-lg border border-primary-200 hover:border-primary-600 transition-all duration-200">
            <ShoppingCart size={14} />
            Enquire
          </button>
        </div>
      </div>
    </motion.div>
  );
}
