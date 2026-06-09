import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Phone, CheckCircle2, AlertCircle, Loader2, Cpu } from 'lucide-react';
import { insforge } from '../../utils/insforge';

// Generate particles once so they don't re-render
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 2,
  left: Math.random() * 100,
  top: Math.random() * 100,
  opacity: Math.random() * 0.4 + 0.3,
  duration: Math.random() * 12 + 10,
  delay: Math.random() * 8,
  color: Math.random() > 0.5 ? '#00f5ff' : '#6c63ff',
}));

export default function LoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [successText, setSuccessText] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorText(null);
    setSuccessText(null);
    setIsLoading(true);

    if (!formData.email) {
      setErrorText('Please enter your email address.');
      setIsLoading(false);
      return;
    }
    if (!formData.password) {
      setErrorText('Please enter your password.');
      setIsLoading(false);
      return;
    }

    try {
      if (activeTab === 'login') {
        try {
          const { data, error } = await insforge.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          if (error) throw error;
          if (data.session && onLogin) {
            onLogin(data.session);
          }
        } catch (e) {
          if (e.message.includes('Unexpected token') || e.message.includes('not valid JSON') || e.message.includes('Failed to fetch')) {
            // Broken server fallback
            const users = JSON.parse(localStorage.getItem('rahonam_users') || '[]');
            const user = users.find(u => u.email === formData.email && u.password === formData.password);
            if (!user) throw new Error('Invalid credentials');
            if (onLogin) onLogin({ user: { ...user, isLocal: true } });
          } else {
            throw e;
          }
        }
      } else if (activeTab === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        try {
          const { data, error } = await insforge.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                name: formData.name,
                phone: formData.phone,
              }
            }
          });
          if (error) throw error;
          if (data.session && onLogin) {
            onLogin(data.session);
          } else {
            setSuccessText('Registration successful! Please check your email to confirm your account.');
          }
        } catch (e) {
          if (e.message.includes('Unexpected token') || e.message.includes('not valid JSON') || e.message.includes('Failed to fetch')) {
            // Broken server fallback
            const users = JSON.parse(localStorage.getItem('rahonam_users') || '[]');
            if (users.find(u => u.email === formData.email)) throw new Error('User already exists');
            const newUser = { 
              id: 'local_' + Date.now(), 
              email: formData.email, 
              password: formData.password, 
              user_metadata: { name: formData.name, phone: formData.phone } 
            };
            users.push(newUser);
            localStorage.setItem('rahonam_users', JSON.stringify(users));
            if (onLogin) onLogin({ user: { ...newUser, isLocal: true } });
          } else {
            throw e;
          }
        }
      }
    } catch (err) {
      setErrorText(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="login-page-root relative min-h-screen w-full flex flex-col md:flex-row overflow-x-hidden font-rajdhani"
      style={{
        background: 'radial-gradient(ellipse at top, #0a0a25 0%, #04040c 70%, #080812 100%)',
      }}
    >
      {/* Floating Space Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full login-particle"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: p.color,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `-${p.delay}s`,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* Futuristic Scanline */}
      <div className="login-scanline" />

      {/* LEFT/TOP SECTION: Interactive Holographic Neural Core */}
      <div className="relative w-full md:w-[45%] flex flex-col items-center justify-center py-10 md:py-0 border-b md:border-b-0 md:border-r border-[#00f5ff]/10 bg-black/10 z-10">
        <div className="relative w-[180px] h-[180px] md:w-[280px] md:h-[280px] flex items-center justify-center">
          {/* Outer glowing pulsing orb */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00f5ff]/10 to-[#6c63ff]/10 animate-pulse blur-xl" />
          
          {/* Cybernetic Rotating Vector Rings */}
          <svg className="w-full h-full animate-[spin_25s_linear_infinite]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="url(#cyanGrad)" strokeWidth="1.5" strokeDasharray="30 15 10 15" strokeLinecap="round" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="url(#purpleGrad)" strokeWidth="1" strokeDasharray="5 10" />
            <defs>
              <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00c6ff" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#7b2fff" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner Counter-Rotating Rings */}
          <svg className="absolute w-[80%] h-[80%] animate-[spin_15s_linear_infinite_reverse]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#00f5ff" strokeWidth="0.75" strokeDasharray="15 30 5 15" opacity="0.4" />
            <circle cx="100" cy="100" r="65" fill="none" stroke="#6c63ff" strokeWidth="1" strokeDasharray="40 10 20 10" opacity="0.6" />
          </svg>

          {/* Neural Core Icon */}
          <div className="absolute flex flex-col items-center justify-center animate-pulse">
            <Cpu size={48} className="text-[#00f5ff] drop-shadow-[0_0_15px_rgba(0,245,255,0.7)]" />
            <span className="text-[10px] tracking-[4px] text-white/50 font-bold uppercase mt-2">SYS_CORE</span>
          </div>
        </div>

        <div className="text-center mt-6 px-6">
          <h2 className="text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#6c63ff] tracking-wider mb-2">
            RAHONAM PLATFORM
          </h2>
          <p className="text-[12px] text-white/40 tracking-[3px] uppercase font-semibold">
            SECURE INTELLECT PORTAL
          </p>
        </div>

        {/* Developer attribution in subtle style */}
        <div className="absolute bottom-4 text-[11px] text-white/20 tracking-[1px] uppercase hidden md:block">
          REVERSED CREATION BY MANOHAR
        </div>
      </div>

      {/* RIGHT/BOTTOM SECTION: Centered Login Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-10">
        <div
          className={`login-card w-full max-w-[430px] p-8 md:p-10 rounded-3xl ${
            mounted ? 'login-card-enter' : 'opacity-0'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#6c63ff] mb-1">
              SYSTEM ACCESS
            </h1>
            <p className="text-[10px] font-bold tracking-[4px] text-[#00f5ff]/60 uppercase font-rajdhani">
              SECURE GRID SIGN-IN
            </p>
          </div>

          {/* Tab Switcher (Sign In / Register) */}
          <div className="login-tab-container relative flex w-full mb-8 rounded-full p-1">
            <div
              className="login-tab-indicator absolute top-1 bottom-1 rounded-full"
              style={{
                width: 'calc(50% - 4px)',
                transform: `translateX(${activeTab === 'login' ? '0' : 'calc(100% + 4px)'})`,
              }}
            />
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorText(null);
                setSuccessText(null);
              }}
              className={`flex-1 relative z-10 py-2.5 text-[13px] font-orbitron font-bold tracking-[2px] uppercase transition-colors duration-200 ${
                activeTab === 'login' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorText(null);
                setSuccessText(null);
              }}
              className={`flex-1 relative z-10 py-2.5 text-[13px] font-orbitron font-bold tracking-[2px] uppercase transition-colors duration-200 ${
                activeTab === 'register' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Register
            </button>
          </div>

          {/* Status Notifications */}
          {errorText && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3 animate-fade-in">
              <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-200/90 font-medium leading-relaxed">{errorText}</p>
            </div>
          )}

          {successText && (
            <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3 animate-fade-in">
              <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">{successText}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* REGISTER TAB EXTRA FIELDS */}
            {activeTab === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="login-label">Full Name</label>
                  <div className="relative">
                    <User size={16} className="login-input-icon" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => updateField('name', e.target.value)}
                      placeholder="Your full name"
                      className="login-input pl-10 pr-4"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="login-label">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="login-input-icon" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      placeholder="Your phone number (optional)"
                      className="login-input pl-10 pr-4"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field (Used for both tabs) */}
            <div className="space-y-1.5">
              <label className="login-label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="login-input-icon" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="you@example.com"
                  className="login-input pl-10 pr-4"
                />
              </div>
            </div>

            {/* Password Field (Used for both tabs) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="login-label">Password</label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    className="text-[11px] text-[#00f5ff]/70 hover:text-[#00f5ff] transition-colors font-semibold tracking-wider uppercase"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e => updateField('password', e.target.value)}
                  placeholder="••••••••"
                  className="login-input pl-10 pr-11 tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye-btn"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register tab only) */}
            {activeTab === 'register' && (
              <div className="space-y-1.5">
                <label className="login-label">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="login-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={e => updateField('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="login-input pl-10 pr-11 tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="login-eye-btn"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-primary-btn mt-6 opacity-90 hover:opacity-100 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <span className="font-orbitron text-[13px] font-bold tracking-[3px] uppercase">
                  {activeTab === 'login' ? 'Access System' : 'Initialize Account'}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
