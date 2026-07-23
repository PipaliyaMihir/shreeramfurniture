import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import { getHeroSlides, getHeroConfig } from '../api';

const DEFAULT_SLIDES = [
  {
    title: 'Crafted with Passion,\nBuilt to Last',
    subtitle: 'Premium custom furniture & on-site carpentry contracting',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1600&q=80',
  },
  {
    title: 'Modern Modular\nKitchen Solutions',
    subtitle: 'Bespoke designs tailored for style and durability',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&q=80',
  },
  {
    title: 'Bespoke Custom\nFurniture',
    subtitle: 'Handcrafted furniture made directly on-site — bungalows, offices, and showrooms',
    image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1600&q=80',
  },
];

const pad = (n) => String(n).padStart(2, '0');

const slideVariants = {
  enter: { opacity: 0, scale: 1.03 },
  center: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: 'easeInOut' } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.8, ease: 'easeInOut' } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.7, ease: 'easeOut' },
  }),
};

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    title: 'Crafted with Passion,\nBuilt to Last',
    subtitle: 'Premium custom furniture & on-site carpentry contracting',
    ctaText: 'Explore Our Work',
    ctaLink: '#projects',
  });
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [slidesRes, configRes] = await Promise.all([
          getHeroSlides(),
          getHeroConfig(),
        ]);
        const slidesData = slidesRes.data || slidesRes;
        if (Array.isArray(slidesData) && slidesData.length > 0) {
          setSlides(slidesData);
        } else {
          setSlides(DEFAULT_SLIDES);
        }
        if (configRes.data) {
          setConfig(configRes.data);
        }
      } catch (err) {
        console.error('Failed to load Hero Slider data:', err);
        setSlides(DEFAULT_SLIDES);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const total = slides.length || 1;

  const goTo = useCallback(
    (index) => {
      if (total > 0) setCurrent((index + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    if (slides.length === 0) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next, slides.length]);

  const handleScrollToProjects = () => {
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // While loading — show first default image as static background (no black flash)
  if (loading) {
    return (
      <section id="home" className="relative h-screen w-full overflow-hidden bg-dark-900">
        <img
          src={DEFAULT_SLIDES[0].image}
          alt="Shree Ram Furniture"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/65" />
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-5 animate-pulse">
              <div className="h-5 w-28 bg-white/20 rounded-full" />
              <div className="h-16 w-3/4 bg-white/20 rounded-xl" />
              <div className="h-6 w-1/2 bg-white/10 rounded-lg" />
              <div className="h-12 w-44 bg-white/20 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[current] || slides[0] || DEFAULT_SLIDES[0];
  const imageSrc = slide?.image?.startsWith('http')
    ? slide.image
    : slide?.image
    ? `${slide.image}`
    : DEFAULT_SLIDES[0].image;

  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden bg-dark-900"
    >
      {/* ── Background slides ── */}
      <AnimatePresence>
        <motion.div
          key={current}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={imageSrc}
            alt={slide?.title || 'Shree Ram Furniture'}
            className="h-full w-full object-cover"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/65" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content overlay ── */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            {/* Slide counter */}
            <motion.div
              custom={0}
              variants={contentVariants}
              className="mb-6 flex items-center gap-3"
            >
              <span className="font-display text-sm font-semibold tracking-widest text-gold-400">
                {pad(current + 1)}
              </span>
              <span className="h-px w-10 bg-gold-400/40" />
              <span className="font-display text-sm font-semibold tracking-widest text-gray-400">
                {pad(slides.length)}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              custom={1}
              variants={contentVariants}
              className="font-display text-5xl font-bold leading-tight text-white md:text-7xl"
              style={{ whiteSpace: 'pre-line' }}
            >
              {config.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              custom={2}
              variants={contentVariants}
              className="mt-5 max-w-xl text-lg text-gray-300 md:text-xl"
            >
              {config.subtitle}
            </motion.p>

            {/* CTA */}
            <motion.div custom={3} variants={contentVariants} className="mt-8">
              <button
                onClick={handleScrollToProjects}
                className="btn-primary group inline-flex items-center gap-2"
              >
                {config.ctaText || 'Explore Our Work'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-500 ${
              idx === current
                ? 'w-8 bg-gold-400 shadow-md'
                : 'w-2 bg-white/40 hover:bg-white/70 shadow-sm border border-black/15'
            }`}
          />
        ))}
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4 text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
