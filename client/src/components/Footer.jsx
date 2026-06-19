import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

const socialLinks = [
  { label: 'f', name: 'Facebook', href: '#' },
  { label: '📷', name: 'Instagram', href: '#' },
  { label: '𝕏', name: 'Twitter', href: '#' },
  { label: '▶', name: 'YouTube', href: '#' },
];

const footerLinks = {
  'Quick Links': ['Home', 'Products', 'About Us', 'Contact'],
  'Categories': ['Sofa & Seating', 'Bedroom', 'Dining', 'Office', 'Storage', 'Outdoor'],
  'Services': ['Custom Design', 'Free Delivery', 'Installation', 'Warranty', 'EMI Available'],
};

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-charcoal text-white">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-wood-mid to-wood-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
              Looking for Custom Furniture?
            </h3>
            <p className="text-white/80">Get a free design consultation and quote today.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => scrollTo('#contact')}
              className="flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Free Quote
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-wood-dark rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl font-display">SR</span>
              </div>
              <div>
                <p className="font-display font-bold text-xl">Shree Ram</p>
                <p className="text-primary-400 text-xs font-medium tracking-widest uppercase">Furniture</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Crafting premium wooden furniture since 2009. We blend traditional Indian craftsmanship with modern designs to create furniture that lasts a lifetime.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              {[
                { icon: Phone, text: '+91 99999 99999' },
                { icon: Mail, text: 'info@shreeramfurniture.com' },
                { icon: MapPin, text: 'Rajkot, Gujarat - 360001' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-gray-400 text-sm hover:text-primary-400 transition-colors">
                  <Icon size={16} className="text-primary-500 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map(({ label, name, href }) => (
                <a
                  key={name}
                  href={href}
                  title={name}
                  className="w-9 h-9 bg-white/10 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 text-sm font-bold"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); scrollTo('#products'); }}
                      className="text-gray-400 text-sm hover:text-primary-400 transition-colors flex items-center gap-1 group"
                    >
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0 duration-200" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © 2024 Shree Ram Furniture. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-primary-400 text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-primary-400 text-xs transition-colors">Terms of Service</a>
            <a href="/admin/login" className="text-gray-500 hover:text-primary-400 text-xs transition-colors">Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
