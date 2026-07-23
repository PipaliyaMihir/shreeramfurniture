import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowRight, Heart } from 'lucide-react';

const services = [
  'Bedroom Design',
  'Living Area',
  'TV Unit',
  'Dining Room',
  'Office Setup',
];

const quickLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Our Projects', href: '#projects' },
  { name: 'About Us', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSmoothScroll = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } else {
        navigate('/' + href);
      }
    }
  };
  const handleServiceClick = (e, serviceName) => {
    e.preventDefault();
    const query = encodeURIComponent(serviceName);
    if (location.pathname === '/') {
      const newUrl = `${window.location.pathname}?category=${query}#projects`;
      window.history.pushState(null, '', newUrl);
      window.dispatchEvent(new Event('app-search-update'));
      const el = document.getElementById('projects');
      if (el) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      navigate(`/?category=${query}#projects`);
    }
  };

  return (
    <footer className="relative bg-dark-900 border-t border-dark-600/30">
      {/* ── CTA Banner ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 via-transparent to-gold-600/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center relative z-10">
          <span className="section-label">Let&apos;s Build Together</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-dark-400 mt-4 mb-4">
            Ready for Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Dream Furniture?
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base sm:text-lg mb-8">
            Transform your space with our expert craftsmanship. Get a free consultation and
            let&apos;s bring your vision to life.
          </p>
          <a
            href="#contact-form"
            onClick={(e) => handleSmoothScroll(e, '#contact-form')}
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl"
          >
            Get Free Consultation
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="border-t border-dark-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Column 1 – Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-gold-400 to-gold-600" />
                <span className="font-display text-xl font-bold text-dark-400 tracking-tight">
                  Shree <span className="text-gold-550">Ram Furniture</span>
                </span>
              </div>
              <p className="text-gray-405 text-sm leading-relaxed mb-6">
                Premium custom on-site furniture &amp; carpentry solutions for residential and
                commercial spaces. Crafting beautiful, durable custom furniture since 2025.
              </p>
              <div className="space-y-3">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-primary-600 transition-colors duration-300"
                >
                  <Phone className="w-4 h-4 text-gold-500/70" />
                  +91 99241 01181 , +91 99042 27279
                </a>
                <a
                  href="mailto:info@shreeramfurniture.com"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-primary-600 transition-colors duration-300"
                >
                  <Mail className="w-4 h-4 text-gold-500/70" />
                  shreeramfurniture@gmail.com
                </a>
                <div className="flex items-start gap-2.5 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 mt-0.5 text-gold-500/70 shrink-0" />
                  <span>Rajkot &amp; Gondal, Gujarat, India</span>
                </div>
              </div>
            </div>

            {/* Column 2 – Our Services */}
            <div>
              <h4 className="font-display text-sm font-semibold text-dark-400 uppercase tracking-wider mb-5">
                Our Services
              </h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service}>
                    <a
                      href="#projects"
                      onClick={(e) => handleServiceClick(e, service)}
                      className="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors duration-300"
                    >
                      <ArrowRight className="w-3 h-3 text-gold-400/50 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all duration-300" />
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 – Quick Links */}
            <div>
              <h4 className="font-display text-sm font-semibold text-dark-400 uppercase tracking-wider mb-5">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors duration-300"
                    >
                      <ArrowRight className="w-3 h-3 text-gold-400/50 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all duration-300" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 – Contact Info */}
            <div>
              <h4 className="font-display text-sm font-semibold text-dark-400 uppercase tracking-wider mb-5">
                Contact Info
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-gold-500/70 shrink-0" />
                  <span className="text-sm text-gray-400 leading-relaxed">
                    123, Furniture Lane,
                    <br />
                    Craft City, India — 400001
                  </span>
                </li>
                <li>
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-3 text-sm text-gray-400 hover:text-primary-600 transition-colors duration-300"
                  >
                    <Phone className="w-4 h-4 text-gold-500/70" />
                    +91 99241 01181 , +91 99042 27279
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@shreeramfurniture.com"
                    className="flex items-center gap-3 text-sm text-gray-400 hover:text-primary-600 transition-colors duration-300"
                  >
                    <Mail className="w-4 h-4 text-gold-500/70" />
                    shreeramfurniture@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 mt-0.5 text-gold-500/70 shrink-0" />
                  <span className="text-sm text-gray-400 leading-relaxed">
                    Mon – Sat: 9:00 AM – 7:00 PM
                    <br />
                    Sunday: Closed
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-dark-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Shree Ram Furniture. All rights reserved. Made with{' '}
            <Heart className="w-3 h-3 inline-block text-gold-400/70 fill-gold-400/70 -mt-px" />{' '}
            in India.
          </p>
          <Link
            to="/admin/login"
            className="text-xs text-gray-500 hover:text-primary-600 transition-colors duration-300"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
