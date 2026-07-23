import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Search } from 'lucide-react';
import logoImg from '../assets/logo.png';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Projects', href: '#projects' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSmoothScroll = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      document.body.style.overflow = '';
      setMobileOpen(false);
      const id = href.slice(1);

      const performScroll = () => {
        if (id === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const el = document.getElementById(id);
        if (el) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const offsetPosition = elementRect - bodyRect - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      };

      if (location.pathname === '/') {
        performScroll();
        setTimeout(performScroll, 80);
      } else {
        navigate('/' + href);
      }
    }
  };

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (!headerSearch.trim()) return;
    const query = encodeURIComponent(headerSearch.trim());
    setMobileOpen(false);
    if (location.pathname === '/') {
      const newUrl = `${window.location.pathname}?search=${query}#projects`;
      window.history.pushState(null, '', newUrl);
      window.dispatchEvent(new Event('app-search-update'));
      const el = document.getElementById('projects');
      if (el) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const offsetPosition = elementRect - bodyRect - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    } else {
      navigate(`/?search=${query}#projects`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logoImg} alt="Shree Ram Furniture Logo" className="inline-block w-10 h-10 rounded-sm" />
            <span className="font-display text-xl font-bold text-gold-500 tracking-tight">
              Shree <span className="text-white">Ram Furniture</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="nav-link px-4 py-2 text-sm font-medium text-gray-350 hover:text-primary-600 transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Right — Search Bar + Get Free Quote CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <form onSubmit={handleHeaderSearch} className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-gold-400 pointer-events-none" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search projects..."
                className="bg-dark-800/90 border border-white/[0.08] focus:border-gold-400/50 rounded-xl py-2 pl-9 pr-7 text-xs text-gray-200 placeholder-gray-500 w-44 focus:w-60 transition-all duration-300 outline-none shadow-inner"
              />
              {headerSearch && (
                <button
                  type="button"
                  onClick={() => setHeaderSearch('')}
                  className="absolute right-2.5 text-gray-400 hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, '#contact')}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shrink-0"
            >
              Get Free Quote
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:text-primary-600 hover:bg-dark-700/50 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden bg-dark-900 border-b border-dark-600/30"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 pt-3 space-y-3">
              {/* Mobile Header Search Bar */}
              <form onSubmit={handleHeaderSearch} className="relative flex items-center px-1">
                <Search className="w-4 h-4 absolute left-4 text-gold-400 pointer-events-none" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full bg-dark-800 border border-white/[0.08] focus:border-gold-400/50 rounded-xl py-2.5 pl-10 pr-8 text-xs text-gray-200 placeholder-gray-500 outline-none"
                />
                {headerSearch && (
                  <button
                    type="button"
                    onClick={() => setHeaderSearch('')}
                    className="absolute right-3 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-primary-600 hover:bg-dark-700/50 transition-colors duration-300 text-base font-medium"
                >
                  <span className="w-1 h-1 rounded-full bg-gold-400/60" />
                  {link.name}
                </motion.a>
              ))}

              <div className="pt-4 border-t border-dark-600/30 space-y-2">
                <a
                  href="#contact"
                  onClick={(e) => handleSmoothScroll(e, '#contact')}
                  className="btn-primary flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-semibold rounded-xl"
                >
                  Get Free Quote
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
