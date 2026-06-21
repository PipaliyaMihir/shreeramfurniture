import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FAF8F5',
            color: '#2E2724',
            border: '1px solid rgba(46, 39, 36, 0.08)',
            borderRadius: '12px',
          },
        }}
      />

      {/* ── Architectural Dotted Grid Background ── */}
      <div className="absolute inset-0 bg-[radial-gradient(#EDE6D4_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-50 pointer-events-none" />

      {/* Decorative Warm Accent Blur */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gold-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary-100/30 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
      >
        {/* Elegant Card Container */}
        <div className="bg-dark-800 border border-dark-600/35 rounded-3xl shadow-card overflow-hidden">
          
          {/* Header Section */}
          <div className="p-8 text-center border-b border-dark-600/10 bg-dark-900/20">
            <div className="flex justify-center items-center gap-2.5 mb-3">
              <div className="w-2.5 h-2.5 bg-gold-400 rounded-sm" />
              <span className="font-display text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em]">Shree Ram Furniture</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-dark-400 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              Please enter your credentials to access the panel
            </p>
          </div>

          {/* Form Body */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest text-left">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors"
                  />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@shreeramfurniture.com"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest text-left">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors"
                  />
                  <input
                    id="admin-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-400 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3.5 text-sm disabled:opacity-75 disabled:cursor-not-allowed group relative overflow-hidden transition-all duration-300 font-semibold shadow-md"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <LogIn size={16} className="transition-transform group-hover:translate-x-0.5" />
                    <span>Sign In to Panel</span>
                  </div>
                )}
              </button>
            </form>

            {/* Back to Homepage */}
            <div className="text-center mt-8">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gold-500 transition-colors group/back"
              >
                <ArrowLeft size={14} className="transition-transform group-hover/back:-translate-x-0.5" />
                Back to Homepage
              </a>
            </div>

          </div>
        </div>

        {/* Footer Copyright */}
        <p className="text-center text-gray-500 text-[10px] uppercase tracking-widest mt-6">
          © {new Date().getFullYear()} Shree Ram Furniture. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
