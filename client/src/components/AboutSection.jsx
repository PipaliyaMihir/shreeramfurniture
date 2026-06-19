import { motion } from 'framer-motion';
import { Award, Users, Clock, Heart, CheckCircle, Star } from 'lucide-react';

const features = [
  { icon: Award, title: 'Premium Quality', desc: 'Each piece is crafted from the finest wood by master artisans with decades of experience.' },
  { icon: Clock, title: '15+ Years Experience', desc: 'Trusted by thousands of families since 2009 with unmatched craftsmanship.' },
  { icon: Users, title: '10,000+ Happy Clients', desc: 'Our family of satisfied customers keeps growing every year across India.' },
  { icon: Heart, title: 'Made with Love', desc: 'Every piece is built with passion, care, and attention to the finest details.' },
];

const stats = [
  { value: '500+', label: 'Products' },
  { value: '10K+', label: 'Clients' },
  { value: '15+', label: 'Years' },
  { value: '50+', label: 'Artisans' },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&q=80"
                    alt="Craftsman working"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"
                    alt="Furniture showroom"
                    className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"
                    alt="Premium sofa"
                    className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80"
                    alt="Wood detail"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-4 bg-white rounded-2xl shadow-wood-lg p-4 border border-primary-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Star className="text-amber-500 fill-amber-500" size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">4.9 / 5.0</p>
                  <p className="text-xs text-gray-400">Customer Rating</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-widest mb-3">
              About Us
            </span>
            <h2 className="section-title mb-6">
              Crafting Furniture<br />
              <span className="text-gradient">Since 2009</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              At <strong>Shree Ram Furniture</strong>, we believe that furniture is more than just functional — it's an expression of your personality and a legacy you leave for generations. Every piece we craft tells a story of skill, passion, and dedication.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Using premium Sheesham, Teak, and Mango wood sourced responsibly, our master artisans blend traditional Indian craftsmanship with modern designs to create furniture that is both timeless and durable.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {['100% Solid Wood', 'Custom Designs', 'Free Delivery', '5-Year Warranty', 'Expert Installation', 'EMI Available'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-primary-500 flex-shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-gradient-to-r from-primary-50 to-amber-50 rounded-2xl border border-primary-100">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-gradient font-display">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feat.icon size={24} className="text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{feat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
