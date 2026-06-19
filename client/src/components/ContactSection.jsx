import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const contactInfo = [
  { icon: MapPin, title: 'Visit Us', lines: ['123 Furniture Market', 'Rajkot, Gujarat - 360001'] },
  { icon: Phone, title: 'Call Us', lines: ['+91 99999 99999', '+91 88888 88888'] },
  { icon: Mail, title: 'Email Us', lines: ['info@shreeramfurniture.com', 'sales@shreeramfurniture.com'] },
  { icon: Clock, title: 'Working Hours', lines: ['Mon – Sat: 9:00 AM – 8:00 PM', 'Sun: 10:00 AM – 6:00 PM'] },
];

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    toast.success('Message sent! We will contact you shortly.', { duration: 4000 });
    setTimeout(() => setSent(false), 5000);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Get In Touch
          </span>
          <h2 className="section-title">
            Contact <span className="text-gradient">Us</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Have a question or want a custom piece? We'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-5"
          >
            {contactInfo.map((info) => (
              <div
                key={info.title}
                className="flex gap-4 p-5 bg-white rounded-2xl shadow-card border border-gray-100 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-primary-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <info.icon size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">{info.title}</p>
                  {info.lines.map((line, i) => (
                    <p key={i} className="text-gray-500 text-sm">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="overflow-hidden rounded-2xl shadow-card bg-white border border-gray-100 h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118247.72804988745!2d70.71716055!3d22.30401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959b0f01a85aa5d%3A0x93b7de63f6c72e3!2sRajkot%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shree Ram Furniture Location"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
              <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">Send us a Message</h3>
              <p className="text-gray-500 text-sm mb-8">Fill in the form and we'll get back to you within 24 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Rahul Sharma"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 99999 99999"
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about the furniture you're looking for..."
                    className="input-field resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || sent}
                  className="w-full btn-primary justify-center py-4 text-base disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sent ? (
                    <><CheckCircle size={18} /> Message Sent!</>
                  ) : sending ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={18} /> Send Message</>
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
