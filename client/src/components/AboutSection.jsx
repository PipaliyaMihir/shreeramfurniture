import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Award, Users, Building2, Layers } from 'lucide-react';

const IMAGES = [
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&q=80',
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80',
];

const FEATURES = [
  'Custom On-Site Carpentry',
  'Modular Kitchen Specialists',
  'Custom Furniture Design',
  'On-Time Project Delivery',
];

const STATS = [
  { value: '150+', label: 'Completed Sites', icon: Building2 },
  { value: '8+', label: 'Years Experience', icon: Award },
  { value: '500+', label: 'Happy Families', icon: Users },
  { value: '6', label: 'Service Categories', icon: Layers },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden bg-dark-900 py-24 lg:py-32">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-gold-400/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* ── Left: Image collage ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {IMAGES.map((src, idx) => (
                <motion.div
                  key={idx}
                  custom={idx}
                  variants={fadeUp}
                  className={`group overflow-hidden rounded-2xl ${
                    idx === 1 ? 'mt-8' : idx === 2 ? '-mt-8' : ''
                  }`}
                >
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={src}
                      alt={`Furniture project ${idx + 1}`}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating rating card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
              className="absolute -bottom-6 -right-4 z-10 rounded-2xl border border-white/[0.06] bg-dark-800/90 px-6 py-5 shadow-2xl backdrop-blur-md sm:-right-6 lg:-right-8"
            >
              <div className="flex items-center gap-1 text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold-400" />
                ))}
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-dark-400">
                4.9<span className="text-base font-normal text-gray-400">/5.0</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Client Satisfaction</p>
            </motion.div>
          </motion.div>

          {/* ── Right: Text content ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.span custom={0} variants={fadeUp} className="section-label">
              About Us
            </motion.span>

            <motion.h2 custom={1} variants={fadeUp} className="section-title mt-3">
              Bespoke On-Site Furniture Since&nbsp;2016
            </motion.h2>

            <motion.p custom={2} variants={fadeUp} className="section-subtitle mt-5 max-w-lg">
              We are a dedicated team of highly skilled carpenters delivering premium 
              custom furniture and carpentry for homes, offices, and showrooms. 
              Every project we undertake reflects our commitment to quality craftsmanship, 
              durable structure, and meticulous attention to detail — from modular kitchens 
              and wardrobes to bespoke workspace units.
            </motion.p>

            {/* Feature checklist */}
            <motion.ul
              custom={3}
              variants={fadeUp}
              className="mt-8 grid gap-3 sm:grid-cols-2"
            >
              {FEATURES.map((feat, idx) => (
                <motion.li
                  key={feat}
                  custom={4 + idx}
                  variants={fadeUp}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400/10">
                    <Check className="h-4 w-4 text-gold-400" />
                  </span>
                  <span className="text-sm font-medium text-gray-300">{feat}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Divider */}
            <div className="mt-10 h-px w-full bg-white/[0.06]" />

            {/* CTA hint */}
            <motion.p custom={8} variants={fadeUp} className="mt-6 text-sm text-gray-500">
              Trusted by <span className="text-gold-400">500+</span> families across
              the region for their custom furniture needs.
            </motion.p>
          </motion.div>
        </div>

        {/* ── Stats row ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                custom={idx}
                variants={fadeUp}
                className="card card-hover group flex flex-col items-center py-8 text-center"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400 transition-colors group-hover:bg-gold-400/20">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-3xl font-bold text-dark-400">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm text-gray-400">{stat.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
