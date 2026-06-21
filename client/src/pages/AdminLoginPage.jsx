import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a24',
            color: '#e5e5e5',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
          },
        }}
      />

      {/* ── Background Glowing Orbs (Premium glassmorphism effect) ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-gold-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-primary-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gold-600/[0.03] rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
      >
        {/* Glow border wrapper */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-gold-400/[0.12] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
          
          {/* Card Container */}
          <div className="bg-dark-900/70 backdrop-blur-2xl rounded-[23px] overflow-hidden">
            
            {/* Header section with gradient line */}
            <div className="p-8 text-center relative border-b border-white/[0.04]">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
              
              {/* Premium Icon Ring */}
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500/20 to-gold-600/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold-400/20 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <ShieldCheck size={32} className="text-gold-400" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white tracking-tight mb-1">
                Admin Panel
              </h1>
              <p className="text-gray-400 text-xs tracking-wider uppercase">
                Shree Ram Furniture
              </p>
            </div>

            {/* Form body */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider text-left">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-400 transition-colors"
                    />
                    <input
                      id="admin-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@shreeramfurniture.com"
                      className="w-full bg-dark-950/60 border border-white/[0.06] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/30 transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider text-left">
                      Password
                    </label>
                  </div>
                  <div className="relative group">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-400 transition-colors"
                    />
                    <input
                      id="admin-password"
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-dark-950/60 border border-white/[0.06] rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/30 transition-all duration-300 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-4 text-base disabled:opacity-75 disabled:cursor-not-allowed group relative overflow-hidden transition-all duration-300 font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.15)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.3)]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center">
                      <LogIn size={18} className="transition-transform group-hover:translate-x-0.5" />
                      <span>Sign In to Panel</span>
                    </div>
                  )}
                </button>
              </form>

              {/* Back Link */}
              <div className="text-center mt-8">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gold-400 transition-all group/back"
                >
                  <ArrowLeft size={14} className="transition-transform group-hover/back:-translate-x-0.5" />
                  Back to Homepage
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* Footer copyright */}
        <p className="text-center text-gray-600 text-[10px] uppercase tracking-widest mt-6">
          © {new Date().getFullYear()} Shree Ram Furniture. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
