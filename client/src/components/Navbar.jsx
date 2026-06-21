import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, LogIn, UserPlus, LogOut, User, ChevronDown } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Projects', href: '#projects' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, userLogout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSmoothScroll = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      document.body.style.overflow = '';
      setMobileOpen(false);
      const id = href.slice(1);
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) {
          setTimeout(() => {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const offsetPosition = elementRect - bodyRect - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }, 350);
        }
      } else {
        navigate('/' + href);
      }
    }
  };

  const handleLogout = () => {
    userLogout();
    setUserMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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

          {/* Desktop Right — Auth buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              // Logged-in user avatar + dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-800 border border-dark-600/30 hover:border-gold-400/30 transition-all duration-200 group"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center font-display font-bold text-dark-900 text-xs">
                    {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-dark-400 max-w-[100px] truncate">{currentUser?.name}</span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-600/30 rounded-2xl shadow-card-hover overflow-hidden"
                    >
                      <div className="p-3 border-b border-dark-600/10">
                        <p className="text-xs font-semibold text-dark-400 truncate">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Not logged in — show Login + Sign Up
              <>
                <Link to="/login" className="btn-outline px-4 py-2 text-sm flex items-center gap-1.5">
                  <LogIn size={14} />
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
                  <UserPlus size={14} />
                  Sign Up
                </Link>
              </>
            )}

            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, '#contact')}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl"
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 pt-2 space-y-1">
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
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800 border border-dark-600/20">
                      <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center font-bold text-dark-900 text-sm">
                        {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark-400">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1 btn-outline justify-center py-2.5 text-sm flex items-center gap-1.5">
                      <LogIn size={13} />
                      Login
                    </Link>
                    <Link to="/register" className="flex-1 btn-primary justify-center py-2.5 text-sm flex items-center gap-1.5">
                      <UserPlus size={13} />
                      Sign Up
                    </Link>
                  </div>
                )}

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
