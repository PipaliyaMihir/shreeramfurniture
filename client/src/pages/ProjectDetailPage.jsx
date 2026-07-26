import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, X, Star, ExternalLink,
  Send, MessageSquare, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { getProduct, getProducts, rateProduct } from '../api';
import toast, { Toaster } from 'react-hot-toast';

const getImageUrl = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  // Resolve server-relative paths like "/uploads/filename.jpg"
  const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5001'
    : '';
  return `${base}${img}`;
};

function StarRating({ rating = 4.5, size = 18 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i - rating < 1 && i - rating > 0
              ? 'fill-amber-400/50 text-amber-400'
              : 'fill-gray-600 text-gray-600'
          }
        />
      ))}
      <span className="ml-2 text-sm text-gray-400 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Review Form Component ──────────────────────────────────────────
function ReviewForm({ projectId, onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error('Please fill in both your name and review message');
      return;
    }
    setSubmitting(true);
    try {
      const res = await rateProduct(projectId, { name, rating, message });
      toast.success('Thank you! Your review has been submitted.');
      setName('');
      setMessage('');
      setRating(5);
      if (onSubmitSuccess && res.data) {
        onSubmitSuccess(res.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">Your Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                size={22}
                className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-600 text-gray-600'}
              />
            </button>
          ))}
          <span className="text-xs text-amber-400 font-bold ml-2">{rating} / 5</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">Your Name *</label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ramesh Patel"
          className="input-field text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">Your Review *</label>
        <textarea
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your experience with our interior design & woodwork..."
          className="input-field text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full justify-center py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-70"
      >
        {submitting ? (
          'Submitting...'
        ) : (
          <div className="flex items-center gap-2 justify-center">
            <Send size={14} />
            Submit Review
          </div>
        )}
      </button>
    </form>
  );
}

// ── Reviews List ──────────────────────────────────────────
function ReviewsList({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic text-center py-4">
        No reviews yet. Be the first to leave one!
      </p>
    );
  }
  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {[...reviews].reverse().map((r, i) => (
        <div key={r._id || i} className="flex gap-3 bg-dark-900/40 rounded-xl p-3.5 border border-dark-600/10">
          <div className="w-8 h-8 bg-gradient-to-br from-dark-600 to-dark-700 rounded-full flex items-center justify-center font-bold text-gold-400 text-sm flex-shrink-0">
            {r.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-dark-400 truncate">{r.name}</p>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={11} className={i <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-600 text-gray-600'} />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{r.message}</p>
            {r.createdAt && (
              <p className="text-[10px] text-gray-600 mt-1.5">
                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Fullscreen Lightbox Modal ──────────────────────────────────────────────
function LightboxModal({ images, currentIndex, projectName, onClose, onPrev, onNext }) {
  const [zoom, setZoom] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const containerRef = useRef(null);

  // Reset zoom and position whenever image index changes
  useEffect(() => {
    setZoom(1);
    setResetKey((prev) => prev + 1);
  }, [currentIndex]);

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 4));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 1));

  const resetZoomAndPosition = () => {
    setZoom(1);
    setResetKey((prev) => prev + 1);
  };

  const toggleZoom = () => {
    if (zoom > 1) {
      resetZoomAndPosition();
    } else {
      setZoom(2);
    }
  };

  const handlePrev = () => {
    onPrev();
  };

  const handleNext = () => {
    onNext();
  };

  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      zoomIn();
    } else if (e.deltaY > 0) {
      zoomOut();
    }
  };

  // Keyboard navigation for Laptop / PC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (currentIndex > 0) handlePrev();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (currentIndex < images.length - 1) handleNext();
      }
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === 'r' || e.key === 'R') resetZoomAndPosition();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentIndex, images.length]);

  // Touch / Drag swipe handler for Left & Right slide on mobile and laptop
  const handleDragEnd = (event, info) => {
    if (zoom > 1) return; // don't slide when zoomed in
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -40 || velocity < -250) {
      if (currentIndex < images.length - 1) handleNext();
    } else if (offset > 40 || velocity > 250) {
      if (currentIndex > 0) handlePrev();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center select-none"
      onClick={onClose}
    >
      {/* ── Top Bar ── */}
      <div
        className="absolute top-4 left-0 right-0 z-[110] px-4 md:px-8 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Counter Badge */}
        <div className="text-white/90 text-xs md:text-sm font-display font-semibold bg-white/10 px-4 py-1.5 rounded-full border border-white/15 shadow-lg">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Action Buttons: Zoom In (+), Zoom Out (-), Restart (Reset), Close (X) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={zoomIn}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            title="Zoom In (+)"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            title="Zoom Out (-)"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={resetZoomAndPosition}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            title="Restart / Reset Original Size & Position (R)"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-red-500/80 text-white transition-colors duration-200 ml-1 shadow-lg"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Left / Right Arrow Buttons — HIDDEN ON MOBILE (swipe only), VISIBLE ON LAPTOP (md:flex) ── */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="hidden md:flex absolute left-4 md:left-8 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all duration-200 active:scale-95 shadow-xl items-center justify-center"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft size={30} />
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="hidden md:flex absolute right-4 md:right-8 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all duration-200 active:scale-95 shadow-xl items-center justify-center"
          title="Next (Right Arrow)"
        >
          <ChevronRight size={30} />
        </button>
      )}

      {/* ── Slide Image Container with Drag & Bounded Zoom Panning ── */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-12 overflow-hidden"
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          key={`${currentIndex}-${resetKey}`}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 1, scale: zoom }}
          transition={{
            scale: { type: 'spring', stiffness: 300, damping: 28 },
            opacity: { duration: 0.12 }
          }}
          drag={zoom === 1 ? 'x' : true}
          dragConstraints={
            zoom === 1
              ? { left: 0, right: 0 }
              : {
                  left: -((typeof window !== 'undefined' ? window.innerWidth : 800) * (zoom - 0.95)) / 2,
                  right: ((typeof window !== 'undefined' ? window.innerWidth : 800) * (zoom - 0.95)) / 2,
                  top: -((typeof window !== 'undefined' ? window.innerHeight : 600) * (zoom - 0.95)) / 2,
                  bottom: ((typeof window !== 'undefined' ? window.innerHeight : 600) * (zoom - 0.95)) / 2,
                }
          }
          dragElastic={zoom === 1 ? 0.2 : 0.05}
          onDragEnd={handleDragEnd}
          onDoubleClick={toggleZoom}
          className="cursor-grab active:cursor-grabbing max-w-full max-h-full flex items-center justify-center touch-pan-y"
        >
          <img
            src={images[currentIndex]}
            alt={`${projectName} — Image ${currentIndex + 1}`}
            className="max-w-[95vw] sm:max-w-[90vw] max-h-[85vh] sm:max-h-[82vh] object-contain rounded-2xl shadow-2xl pointer-events-none select-none"
          />
        </motion.div>
      </div>

      {/* Bottom hint for Laptop users */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[110] text-white/50 text-xs hidden md:block">
        Use Left / Right Arrow keys to slide · Double-click or scroll to zoom
      </div>
    </div>
  );
}

function SkeletonPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <div className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="skeleton h-5 w-40 rounded-lg" />
        </div>
      </div>
      <div className="relative w-full h-[50vh] md:h-[60vh] skeleton" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-6 w-3/4 rounded-lg" />
            <div className="skeleton h-4 w-full rounded-lg" />
            <div className="skeleton h-4 w-5/6 rounded-lg" />
            <div className="skeleton h-4 w-2/3 rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="skeleton h-6 w-40 rounded-lg" />
            <div className="skeleton h-48 w-full rounded-xl" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="skeleton h-8 w-48 rounded-lg mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [visibleImageCount, setVisibleImageCount] = useState(10);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveSubCategory('all');
  }, [id]);

  useEffect(() => {
    setVisibleImageCount(10);
  }, [activeSubCategory, id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectRes, allRes] = await Promise.all([
          getProduct(id),
          getProducts({ limit: 100 }),
        ]);
        setProject(projectRes.data);
        setAllProjects(allRes.data?.products || allRes.data || []);
      } catch (err) {
        console.error('Failed to fetch project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const subCategories = project?.categories || [];

  const displayedImages = activeSubCategory === 'all'
    ? subCategories.reduce((acc, cat) => acc.concat(cat.images || []), [])
    : subCategories.find(cat => cat.name === activeSubCategory)?.images || [];

  const imagesToDisplay = (activeSubCategory === 'all' && displayedImages.length > visibleImageCount)
    ? displayedImages.slice(0, visibleImageCount)
    : displayedImages;

  const lightboxImages = displayedImages.length
    ? displayedImages.map(getImageUrl)
    : [getImageUrl(null)];

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  // Stops at index 0 (1 of N — end of left)
  const goLightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Stops at last index (N of N — end of right)
  const goLightboxNext = useCallback(() => {
    setLightboxIndex((prev) => Math.min(prev + 1, lightboxImages.length - 1));
  }, [lightboxImages.length]);

  const relatedProjects = allProjects
    .filter((p) => (p._id || p.id) !== id)
    .slice(0, 3);

  if (loading) return <SkeletonPage />;

  if (!project) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-6">
        <p className="text-gray-400 text-lg font-display">Project not found.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          <ArrowLeft size={18} />
          Back to Home
        </button>
      </div>
    );
  }

  const categoryNames = subCategories.map((cat) => cat.name);
  const heroCoverImage = project?.coverImage ? getImageUrl(project.coverImage) : (lightboxImages[0] || getImageUrl(null));

  return (
    <div className="min-h-screen bg-dark-900">
      <Toaster position="top-right" />

      {/* ───── Back Button Bar ───── */}
      <div className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 py-4 text-sm font-medium text-gray-400 hover:text-gold-400 transition-colors duration-300 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Projects
          </button>
        </div>
      </div>

      {/* ───── Hero Banner ───── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden"
      >
        <img
          src={heroCoverImage}
          alt={project.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80';
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
          <div className="max-w-7xl mx-auto">
            {categoryNames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {categoryNames.map((cat) => (
                  <span key={cat} className="badge">{cat}</span>
                ))}
              </motion.div>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl"
            >
              {project.name}
            </motion.h1>
          </div>
        </div>
      </motion.div>

      {/* ───── Project Info + Review Section ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Left — Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <h2 className="section-label">About This Project</h2>
            {project.description ? (
              <p className="text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">
                A beautifully executed custom furniture project by Shree Ram Furniture — showcasing expert craftsmanship and attention to detail.
              </p>
            )}

            {/* CTA Button below description */}
            <div className="mt-8">
              <a
                href="/#contact-form"
                className="btn-primary inline-flex items-center gap-2 py-3 px-6 text-base"
              >
                <ExternalLink size={18} />
                Get Design Quote
              </a>
            </div>
          </motion.div>

          {/* Right — Rating Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="card p-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-405 uppercase tracking-widest mb-2">Project Rating</p>
                <div className="flex items-center gap-2">
                  <StarRating rating={project.rating || 5} />
                  <span className="text-xs text-gray-500 font-semibold">({project.reviewCount || 0} reviews)</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('reviews-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-outline w-full justify-center py-3 text-sm"
              >
                Read Customer Reviews
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── Image Gallery ───── */}
      {displayedImages.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="section-label">Gallery</h2>
            <h3 className="section-title mb-6">Project Gallery</h3>
          </motion.div>

          {subCategories.length > 1 && (
            <div
              className="flex md:flex-wrap overflow-x-auto md:overflow-visible gap-2 mb-8 pb-2 md:pb-0 scrollbar-hide text-nowrap"
            >
              <button
                onClick={() => setActiveSubCategory('all')}
                className={activeSubCategory === 'all' ? 'category-pill-active' : 'category-pill'}
              >
                All Work
              </button>
              {subCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveSubCategory(cat.name)}
                  className={activeSubCategory === cat.name ? 'category-pill-active' : 'category-pill'}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {imagesToDisplay.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 10) * 0.04 }}
                className="img-zoom rounded-xl cursor-pointer group relative overflow-hidden aspect-[4/3]"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={getImageUrl(src)}
                  alt={`${project.name} — Image ${i + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-dark-900/0 group-hover:bg-dark-900/40 transition-colors duration-300 flex items-center justify-center rounded-xl">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20">
                    View
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* See More Images button for All Work category when images > 10 */}
          {activeSubCategory === 'all' && displayedImages.length > visibleImageCount && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mt-10 gap-3"
            >
              <p className="text-gray-500 text-xs">
                Showing {visibleImageCount} of {displayedImages.length} images in All Work
              </p>
              <button
                onClick={() => setVisibleImageCount((prev) => prev + 10)}
                className="btn-outline flex items-center gap-2 px-8 py-3 rounded-xl border border-gold-400/40 text-gold-400 text-sm font-semibold hover:bg-gold-400/10 transition-all duration-300 shadow-md"
              >
                See More Images
                <ChevronDown size={18} />
              </button>
            </motion.div>
          )}
        </section>
      )}

      {/* ───── Reviews & Ratings Section ───── */}
      <section id="reviews-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 border-t border-white/[0.06] pt-12 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Left — Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="section-label">Reviews</h2>
            <h3 className="section-title mb-6">Customer Feedback ({project.reviews?.length || 0})</h3>
            <ReviewsList reviews={project.reviews} />
          </div>

          {/* Right — Write a Review Form */}
          <div className="card p-6 self-start w-full">
            <h4 className="text-sm font-semibold text-black uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <MessageSquare size={16} className="text-gold-500" />
              Write a Review
            </h4>
            <ReviewForm
              projectId={project._id || project.id}
              onSubmitSuccess={(updatedProject) => setProject(updatedProject)}
            />
          </div>
        </div>
      </section>

      {/* ───── Fullscreen Lightbox ───── */}
      <AnimatePresence>
        {lightboxOpen && (
          <LightboxModal
            images={lightboxImages}
            currentIndex={lightboxIndex}
            projectName={project.name}
            onClose={closeLightbox}
            onPrev={goLightboxPrev}
            onNext={goLightboxNext}
          />
        )}
      </AnimatePresence>

      {/* ───── Related Projects ───── */}
      {relatedProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="section-label">Explore More</h2>
            <h3 className="section-title">Related Projects</h3>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedProjects.map((rp, i) => {
              const rpId = rp._id || rp.id;
              const rpImage = rp.images && rp.images.length > 0 ? getImageUrl(rp.images[0]) : getImageUrl(null);

              return (
                <motion.div
                  key={rpId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link to={`/project/${rpId}`} className="card card-hover block overflow-hidden group">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={rpImage} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="font-display font-bold text-white text-lg leading-snug line-clamp-2">{rp.name}</h4>
                        {rp.categories && rp.categories.length > 0 && (
                          <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mt-1">
                            {rp.categories.map(c => c.name).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
