import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Spline from '@splinetool/react-spline';
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

      {/* LEFT/TOP SECTION: Interactive 3D Robot Spline */}
      <div className="relative w-full md:w-[45%] h-[40vh] md:h-screen flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#00f5ff]/10 bg-black/10 z-10">
        <div className="w-full h-full relative">
          <Spline scene="https://prod.spline.design/MyJlQNxotlykGCGr/scene.splinecode" />
          {/* Edge fade overlay to blend spline nicely */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#04040c] via-transparent to-[#0a0a25] opacity-40" />
        </div>

        {/* Text brand overlay */}
        <div className="absolute bottom-12 text-center pointer-events-none z-20">
          <h2 className="text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#6c63ff] tracking-wider mb-2">
            RAHONAM PLATFORM
          </h2>
          <p className="text-[12px] text-white/40 tracking-[3px] uppercase font-semibold">
            SECURE INTELLECT PORTAL
          </p>
        </div>

        {/* Developer attribution in subtle style */}
        <div className="absolute bottom-4 text-[11px] text-white/20 tracking-[1px] uppercase hidden md:block z-20">
          REVERSED CREATION BY MANOHAR
        </div>
      </div>

      {/* RIGHT/BOTTOM SECTION: Centered Login Form Card */}
      <div className="flex-1 flex items-center justify-center py-4 px-4 md:p-6 z-10 overflow-y-auto h-screen">
        <div
          className={`login-card w-full max-w-[420px] py-6 px-6 md:py-8 md:px-8 rounded-3xl my-auto max-h-[95vh] flex flex-col justify-between overflow-y-auto ${
            mounted ? 'login-card-enter' : 'opacity-0'
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 245, 255, 0.2) transparent'
          }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#6c63ff] mb-1">
              SYSTEM ACCESS
            </h1>
            <p className="text-[10px] font-bold tracking-[4px] text-[#00f5ff]/60 uppercase font-rajdhani">
              SECURE GRID SIGN-IN
            </p>
          </div>

          {/* Tab Switcher (Sign In / Register) */}
          <div className="login-tab-container relative flex w-full mb-5 rounded-full p-1 flex-shrink-0">
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
            <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3 animate-fade-in flex-shrink-0">
              <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-200/90 font-medium leading-relaxed">{errorText}</p>
            </div>
          )}

          {successText && (
            <div className="mb-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3 animate-fade-in flex-shrink-0">
              <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">{successText}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 flex-1 flex flex-col justify-center">
            {/* REGISTER TAB EXTRA FIELDS */}
            {activeTab === 'register' && (
              <>
                <div className="space-y-1">
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

                <div className="space-y-1">
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
            <div className="space-y-1">
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
            <div className="space-y-1">
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
              <div className="space-y-1">
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
              className="login-primary-btn mt-4 opacity-90 hover:opacity-100 disabled:opacity-50 flex-shrink-0"
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
