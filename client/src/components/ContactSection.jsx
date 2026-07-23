import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitQuotation } from '../api';

const contactInfo = [
  { icon: MapPin, title: 'Visit Us', lines: ['Rajkot & Gondal'] },
  { icon: User, title: 'Partners', lines: ['Bhaveshbhai Vadodariya', 'Prashantbhai Pipaliya'] },
  { icon: Phone, title: 'Call Us', lines: ['+91 99241 01181', '+91 99042 27279'] },
  { icon: Clock, title: 'Working Hours', lines: ['Mon – Sat : 9:00 AM – 8:00 PM', 'Sunday : Closed'] },
];

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitQuotation(form);
      setSent(true);
      toast.success('Quotation request submitted! Check your email for our catalog.', { duration: 5000 });
      setTimeout(() => setSent(false), 5000);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-dark-900 border-t border-white/[0.06] relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-gold-400/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="section-label">Get In Touch</span>
          <h2 className="section-title">
            Request a Free <span className="text-gradient">Quotation</span> & Catalog
          </h2>
          <p className="section-subtitle mx-auto">
            Fill out the form below to receive an automated quote catalog directly to your email.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((info) => (
              <div
                key={info.title}
                className="flex gap-4 p-5 bg-dark-800/60 border border-white/[0.06] rounded-2xl hover:border-gold-400/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-11 h-11 bg-gold-400/10 rounded-xl flex items-center justify-center flex-shrink-0 text-gold-400">
                  <info.icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-dark-400 mb-1 text-sm sm:text-base">{info.title}</p>
                  {info.lines.map((line, i) => (
                    <p key={i} className="text-gray-400 text-sm leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Google Maps Card */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-dark-800/60 h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118247.72804988745!2d70.71716055!3d22.30401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959b0f01a85aa5d%3A0x93b7de63f6c72e3!2sRajkot%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shree Ram Furniture Location"
              />
            </div>
          </motion.div>

          {/* Contact & Quotation Form */}
          <motion.div
            id="contact-form"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="bg-dark-800/60 border border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="font-display text-2xl font-bold text-dark-400 mb-2">Request Catalog</h3>
              <p className="text-gray-400 text-sm mb-6">Provide your contact info and tell us about your bungalow, office, or showroom requirements.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter You Good Name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Enter Phone Number"
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter Your Email"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Requirements / Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Mention items you're interested in (e.g. office tables , tv cabinets , showroom display)..."
                    className="input-field resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || sent}
                  className="w-full btn-primary justify-center py-3.5 text-sm font-bold uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sent ? (
                    <><CheckCircle size={16} /> Catalog Requested!</>
                  ) : sending ? (
                    <><div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Submitting...</>
                  ) : (
                    <><Send size={16} /> Get Free Quote & Catalog</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
