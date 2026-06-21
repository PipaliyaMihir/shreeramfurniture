import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userLogin(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#FAF8F5', color: '#2E2724', border: '1px solid rgba(46,39,36,0.08)', borderRadius: '12px' } }} />

      {/* Background dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#EDE6D4_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[280px] h-[280px] bg-gold-200/15 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-dark-800 border border-dark-600/35 rounded-3xl shadow-card overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-dark-600/10 bg-dark-900/20">
            <div className="flex justify-center items-center gap-2.5 mb-3">
              <div className="w-2.5 h-2.5 bg-gold-400 rounded-sm" />
              <span className="font-display text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em]">Shree Ram Furniture</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-dark-400 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 text-xs mt-1">Sign in to your account to leave a review</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest text-left">Email Address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
                  <input
                    id="user-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest text-left">Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
                  <input
                    id="user-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-11"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-400 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <LogIn size={15} />
                    <span>Sign In</span>
                  </div>
                )}
              </button>
            </form>

            <div className="text-center mt-6 space-y-3">
              <p className="text-gray-500 text-xs">
                Don't have an account?{' '}
                <Link to="/register" state={{ from }} className="text-gold-500 font-semibold hover:text-gold-400 transition-colors">
                  Create one
                </Link>
              </p>
              <a href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold-500 transition-colors">
                <ArrowLeft size={13} />
                Back to Homepage
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-[10px] uppercase tracking-widest mt-5">
          © {new Date().getFullYear()} Shree Ram Furniture
        </p>
      </motion.div>
    </div>
  );
}
