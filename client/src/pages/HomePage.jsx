import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import ProductSection from '../components/ProductSection';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      <Navbar />
      <main>
        <HeroSlider />
        
        {/* Features Strip */}
        <div className="bg-white border-b border-gray-100 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
              {[
                { emoji: '🚚', text: 'Free Delivery' },
                { emoji: '🔨', text: 'Expert Installation' },
                { emoji: '⭐', text: '5-Year Warranty' },
                { emoji: '💳', text: 'Easy EMI' },
                { emoji: '🎨', text: 'Custom Designs' },
              ].map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                  <span className="text-xl">{emoji}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <ProductSection />
        <AboutSection />

        {/* Testimonials */}
        <section className="py-20 bg-gradient-to-br from-wood-deep via-charcoal to-wood-dark text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block text-primary-300 font-semibold text-sm uppercase tracking-widest mb-3">
                Testimonials
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                What Our Customers Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Priya Patel', city: 'Ahmedabad', rating: 5, review: 'The sofa is absolutely stunning! The quality is exceptional and delivery was smooth. Highly recommend Shree Ram Furniture.' },
                { name: 'Rajesh Kumar', city: 'Surat', rating: 5, review: 'Got a custom bedroom set made. The craftsmen were extremely skilled and delivered exactly what I wanted. Excellent service!' },
                { name: 'Meera Shah', city: 'Vadodara', rating: 5, review: 'Beautiful dining table. Very sturdy and the wood finish is gorgeous. My whole family loves it. Worth every rupee!' },
              ].map((t) => (
                <div key={t.name} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-amber-400">★</span>
                    ))}
                  </div>
                  <p className="text-white/85 text-sm leading-relaxed mb-6 italic">"{t.review}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{t.name}</p>
                      <p className="text-white/50 text-xs">{t.city}</p>
                    </div>
                  </div>
                </div>
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
