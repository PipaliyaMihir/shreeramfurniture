import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import ProductSection from '../components/ProductSection';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Hammer, Palette, Clock, Award, Star } from 'lucide-react';
import { getRecentReviews } from '../api';

const highlights = [
  { icon: Hammer, text: 'Expert Craftsmanship' },
  { icon: Palette, text: 'Custom Designs' },
  { icon: Clock, text: 'On-Time Delivery' },
  { icon: Award, text: '8+ Years Experience' },
];

const FALLBACK_TESTIMONIALS = [
  {
    name: 'Priya Patel',
    rating: 5,
    message: 'The modular kitchen they built is absolutely stunning! Every detail was perfect — from the wood finish to the soft-close fittings. Highly recommend Shree Ram Furniture.',
    projectName: 'Nand Prime Bungalow',
  },
  {
    name: 'Rajesh Kumar',
    rating: 5,
    message: 'Got complete office and bungalow furniture made on-site. The carpenters were extremely skilled and delivered exactly what was promised. Excellent custom work!',
    projectName: 'Nand Prime Bungalow',
  },
  {
    name: 'Meera Shah',
    rating: 5,
    message: 'Beautiful TV unit and wardrobe craftsmanship. Very sturdy construction and the finish is gorgeous. Our entire family loves the new look of our home!',
    projectName: 'Royal Residency Bungalow',
  },
];

export default function HomePage() {
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  // Fetch real reviews from the database
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getRecentReviews();
        const reviews = res.data;
        if (reviews && reviews.length >= 2) {
          setTestimonials(reviews.slice(0, 6));
        }
        // If fewer than 2 real reviews, keep showing fallback so page doesn't look empty
      } catch (err) {
        // silently fall back to hardcoded testimonials
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a24',
            color: '#e5e5e5',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
          },
        }}
      />
      <Navbar />

      <main>
        <HeroSlider />

        {/* Highlights Strip */}
        <div className="relative bg-dark-800 border-y border-white/[0.04] py-5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              {highlights.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2.5 text-gray-400 text-sm font-medium"
                >
                  <Icon size={18} className="text-gold-400" />
                  <span>{text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <ProductSection />
        <AboutSection />

        {/* ── Testimonials (dynamic from DB, fallback to hardcoded) ── */}
        <section className="py-20 md:py-28 bg-dark-900 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-400/[0.03] rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-14">
              <span className="section-label">Testimonials</span>
              <h2 className="section-title">What Our Clients Say</h2>
              <p className="section-subtitle mx-auto">
                Hear from clients who trusted us with their custom furniture projects
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t._id || t.name + i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="card card-hover p-6"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} size={14} className="fill-gold-400 text-gold-400" />
                    ))}
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-6 italic flex-1">
                    &ldquo;{t.message || t.review}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center font-display font-bold text-dark-900 text-sm flex-shrink-0">
                      {(t.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-400 text-sm">{t.name}</p>
                      {t.projectName && (
                        <p className="text-gray-500 text-xs">{t.projectName}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
