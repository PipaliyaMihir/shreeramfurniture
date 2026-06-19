import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getHeroSlides } from '../api';

const defaultSlides = [
  {
    title: 'Crafted with Tradition,\nDesigned for Today',
    subtitle: 'Discover our exclusive collection of handcrafted wooden furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    ctaText: 'Explore Collection',
    ctaLink: '#products',
  },
  {
    title: 'Transform Your\nLiving Space',
    subtitle: 'Premium quality furniture for every room in your home',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80',
    ctaText: 'Shop Now',
    ctaLink: '#products',
  },
  {
    title: 'Bedroom Furniture\nOf Your Dreams',
    subtitle: 'Sleep in luxury with our handcrafted bedroom collections',
    image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1600&q=80',
    ctaText: 'View Bedroom',
    ctaLink: '#products',
  },
];

const CustomArrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className={`absolute z-10 top-1/2 -translate-y-1/2 ${direction === 'left' ? 'left-6' : 'right-6'} 
    w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center
    hover:bg-white/30 transition-all duration-200 text-white`}
  >
    {direction === 'left' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
  </button>
);

export default function HeroSlider() {
  const [slides, setSlides] = useState(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getHeroSlides()
      .then((res) => {
        if (res.data && res.data.length > 0) setSlides(res.data);
      })
      .catch(() => {});
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: 'ease-in-out',
    prevArrow: <CustomArrow direction="left" />,
    nextArrow: <CustomArrow direction="right" />,
    beforeChange: (_, next) => setCurrentSlide(next),
    appendDots: (dots) => (
      <div style={{ bottom: '24px' }}>
        <ul className="flex items-center justify-center gap-2">{dots}</ul>
      </div>
    ),
  };

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative">
      <Slider {...settings}>
        {slides.map((slide, idx) => (
          <div key={idx}>
            <div
              className="relative h-screen min-h-[600px] flex items-center"
              style={{
                background: `url(${slide.image}) center/cover no-repeat`,
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />

              {/* Content */}
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-4"
                  >
                    <span className="inline-flex items-center gap-2 bg-primary-500/20 backdrop-blur-sm border border-primary-400/30 text-primary-200 text-sm font-medium px-4 py-1.5 rounded-full">
                      ✨ Premium Quality Furniture
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 whitespace-pre-line"
                  >
                    {slide.title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-white/80 text-lg sm:text-xl mb-8 leading-relaxed"
                  >
                    {slide.subtitle}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex flex-wrap gap-4"
                  >
                    <button
                      onClick={() => scrollTo(slide.ctaLink || '#products')}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-glow hover:-translate-y-1 text-base"
                    >
                      {slide.ctaText}
                      <ArrowRight size={18} />
                    </button>
                    <button
                      onClick={() => scrollTo('#contact')}
                      className="inline-flex items-center gap-2 px-8 py-4 glass text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/30 text-base"
                    >
                      Contact Us
                    </button>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20"
                  >
                    {[
                      { value: '500+', label: 'Products' },
                      { value: '10K+', label: 'Happy Clients' },
                      { value: '15+', label: 'Years Experience' },
                      { value: '100%', label: 'Handcrafted' },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="text-2xl font-bold text-primary-300 font-display">{stat.value}</p>
                        <p className="text-white/60 text-sm">{stat.label}</p>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
        <span className="text-white/60 text-xs font-medium">Scroll Down</span>
        <div className="w-0.5 h-8 bg-gradient-to-b from-white/60 to-transparent rounded-full" />
      </div>
    </section>
  );
}
