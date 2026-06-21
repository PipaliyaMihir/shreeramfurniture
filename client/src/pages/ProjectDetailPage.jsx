import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Star, ExternalLink } from 'lucide-react';
import { getProduct, getProducts, rateProduct } from '../api';
import toast, { Toaster } from 'react-hot-toast';

const getImageUrl = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80';
  if (img.startsWith('http')) return img;
  return img;
};

function StarRating({ rating = 4.5 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={20}
          className={
            i <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i - 0.5 <= rating
              ? 'fill-amber-400/50 text-amber-400'
              : 'fill-gray-600 text-gray-600'
          }
        />
      ))}
      <span className="ml-2 text-sm text-gray-400 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function InteractiveRating({ projectId, currentRating, reviewCount, onRateSuccess }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(() => {
    return localStorage.getItem(`srf_rated_${projectId}`) === 'true';
  });
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (ratingVal) => {
    if (hasRated || submitting) return;
    setSubmitting(true);
    try {
      const res = await rateProduct(projectId, ratingVal);
      toast.success('Thank you for rating this project!');
      localStorage.setItem(`srf_rated_${projectId}`, 'true');
      setHasRated(true);
      if (onRateSuccess) {
        onRateSuccess(res.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="text-left">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Project Rating</p>
        <div className="flex items-center gap-2">
          <StarRating rating={currentRating} />
          <span className="text-xs text-gray-500 font-semibold">({reviewCount} reviews)</span>
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-4">
        {hasRated ? (
          <p className="text-xs text-green-400 font-medium flex items-center gap-1.5 justify-center py-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            You have rated this project. Thank you!
          </p>
        ) : (
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 mb-2.5">Rate this project</p>
            <div className="flex justify-center gap-1.5" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRate(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  className="focus:outline-none transition-transform duration-200 active:scale-95 disabled:opacity-50"
                >
                  <Star
                    size={26}
                    className={`transition-colors duration-200 ${
                      i <= hoverRating
                        ? 'fill-gold-400 text-gold-400'
                        : 'fill-transparent text-gray-500 hover:text-gold-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Back bar skeleton */}
      <div className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="skeleton h-5 w-40 rounded-lg" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="relative w-full h-[50vh] md:h-[60vh] skeleton" />

      {/* Info skeleton */}
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
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Gallery skeleton */}
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

  // Scroll to top on mount / id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveSubCategory('all');
  }, [id]);

  // Fetch project data
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

  // Group images based on active subcategory tab
  const displayedImages = activeSubCategory === 'all'
    ? subCategories.reduce((acc, cat) => acc.concat(cat.images || []), [])
    : subCategories.find(cat => cat.name === activeSubCategory)?.images || [];

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

  const goLightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
  }, [lightboxImages.length]);

  const goLightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
  }, [lightboxImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goLightboxPrev();
      if (e.key === 'ArrowRight') goLightboxNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, closeLightbox, goLightboxPrev, goLightboxNext]);

  // Related projects (exclude current, up to 3)
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
  const heroCoverImage = lightboxImages[0] || getImageUrl(null);

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
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
          <div className="max-w-7xl mx-auto">
            {/* Category badges */}
            {categoryNames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {categoryNames.map((cat) => (
                  <span key={cat} className="badge">
                    {cat}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Project name */}
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

      {/* ───── Project Info Section ───── */}
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
          </motion.div>

          {/* Right — Rating + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Rating */}
            <InteractiveRating
              projectId={project._id || project.id}
              currentRating={project.rating || 5}
              reviewCount={project.reviewCount || 0}
              onRateSuccess={(updatedProject) => {
                setProject(updatedProject);
              }}
            />

            {/* CTA Button */}
            <Link
              to="/#contact"
              className="btn-primary w-full justify-center py-4 text-base"
            >
              <ExternalLink size={18} />
              Get Design Quote
            </Link>
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

          {/* Sub-category Filter Tabs */}
          {subCategories.length > 1 && (
            <div
              className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
            {displayedImages.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="img-zoom rounded-xl cursor-pointer group relative overflow-hidden aspect-[4/3]"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={getImageUrl(src)}
                  alt={`${project.name} — Image ${i + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-dark-900/0 group-hover:bg-dark-900/40 transition-colors duration-300 flex items-center justify-center rounded-xl">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20">
                    View
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ───── Fullscreen Lightbox ───── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lightbox-overlay"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-[110] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            >
              <X size={24} />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-6 z-[110] text-white/70 text-sm font-display font-medium bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>

            {/* Prev button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goLightboxPrev();
              }}
              className="absolute left-2 md:left-6 z-[110] p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
              src={lightboxImages[lightboxIndex]}
              alt={`${project.name} — Image ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goLightboxNext();
              }}
              className="absolute right-2 md:right-6 z-[110] p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            >
              <ChevronRight size={28} />
            </button>
          </motion.div>
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
              const rpImage =
                rp.images && rp.images.length > 0
                  ? getImageUrl(rp.images[0])
                  : getImageUrl(null);

              return (
                <motion.div
                  key={rpId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    to={`/project/${rpId}`}
                    className="card card-hover block overflow-hidden group"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={rpImage}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="font-display font-bold text-white text-lg leading-snug line-clamp-2">
                          {rp.name}
                        </h4>
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
