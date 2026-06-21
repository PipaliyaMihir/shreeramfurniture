import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import ProductSection from '../components/ProductSection';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Hammer, Palette, Clock, Award } from 'lucide-react';
 
const highlights = [
  { icon: Hammer, text: 'Expert Craftsmanship' },
  { icon: Palette, text: 'Custom Designs' },
  { icon: Clock, text: 'On-Time Delivery' },
  { icon: Award, text: '8+ Years Experience' },
];
 
export default function HomePage() {
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

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 150);
      }
    }
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

        {/* Testimonials */}
        <section className="py-20 md:py-28 bg-dark-900 relative overflow-hidden">
          {/* Subtle background accent */}
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
              {[
                {
                  name: 'Priya Patel',
                  city: 'Ahmedabad',
                  rating: 5,
                  review:
                    'The modular kitchen they built is absolutely stunning! Every detail was perfect — from the wood finish to the soft-close fittings. Highly recommend Shree Ram Furniture.',
                },
                {
                  name: 'Rajesh Kumar',
                  city: 'Surat',
                  rating: 5,
                  review:
                    'Got complete office and bungalow furniture made on-site. The carpenters were extremely skilled and delivered exactly what was promised. Excellent custom work!',
                },
                {
                  name: 'Meera Shah',
                  city: 'Vadodara',
                  rating: 5,
                  review:
                    'Beautiful TV unit and wardrobe craftsmanship. Very sturdy construction and the finish is gorgeous. Our entire family loves the new look of our home!',
                },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="card card-hover p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <span key={j} className="text-gold-400 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.review}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center font-display font-bold text-dark-900 text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-400 text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.city}</p>
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
