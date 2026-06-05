import React, { useState, useEffect, useMemo } from 'react';
import Spline from '@splinetool/react-spline';
import { Eye, EyeOff, User, Lock, Mail, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { insforge } from '../../utils/insforge';

// Generate particles once so they don't re-render
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 3,
  left: Math.random() * 100,
  top: Math.random() * 100,
  opacity: Math.random() * 0.4 + 0.4,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 10,
  color: Math.random() > 0.5 ? '#00f5ff' : '#6c63ff',
}));

export default function LoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [guestToast, setGuestToast] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState(null);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestLogin = () => {
    setGuestToast(true);
    setTimeout(() => {
      setGuestToast(false);
      if (onLogin) onLogin();
    }, 2500);
  };

  const handleSubmit = async () => {
    setErrorToast(null);
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        try {
          const { data, error } = await insforge.auth.signInWithPassword({
            email: formData.identifier,
            password: formData.password,
          });
          if (error) throw error;
          if (data.session && onLogin) onLogin(data.session);
        } catch (e) {
          if (e.message.includes('Unexpected token') || e.message.includes('not valid JSON') || e.message.includes('Failed to fetch')) {
            // Broken server fallback
            const users = JSON.parse(localStorage.getItem('rahonam_users') || '[]');
            const user = users.find(u => (u.email === formData.identifier || u.user_metadata.name === formData.identifier) && u.password === formData.password);
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
            setErrorToast('Registration successful! Please check your email to confirm.');
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
      setErrorToast(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = ['login', 'register', 'guest'];
  const tabIndex = tabs.indexOf(activeTab);

  return (
    <div
      className="login-page-root relative min-h-screen w-full overflow-x-hidden overflow-y-auto font-rajdhani"
      style={{
        background: 'radial-gradient(ellipse at top, #0a0a2e 0%, #050510 60%, #0d0d1a 100%)',
      }}
    >
      {/* ── Floating Particles ──────────────────── */}
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

      {/* ── Scan Line ──────────────────────────── */}
      <div className="login-scanline" />

      {/* ── Spline Robot — Top Section ──────────── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '45vh', zIndex: 1 }}
      >
        <Spline scene="https://prod.spline.design/MyJlQNxotlykGCGr/scene.splinecode" />
        {/* Bottom fade so robot blends into the card area */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: '120px',
            background: 'linear-gradient(to top, #050510, transparent)',
          }}
        />
      </div>

      {/* ── Login Card — Below Robot ───────────── */}
      <div className="relative flex justify-center px-4 pb-12" style={{ zIndex: 10, marginTop: '-40px' }}>
        <div
          className={`login-card w-full max-w-[420px] p-8 rounded-3xl ${mounted ? 'login-card-enter' : 'opacity-0'}`}
        >
          {/* ── Brand Title ──────────────────────── */}
          <h1 className="login-title text-center text-3xl font-bold font-orbitron mb-1">
            RAHONAM
          </h1>
          <p className="login-subtitle text-center text-[11px] font-semibold tracking-[4px] uppercase mb-8 font-rajdhani">
            NEURAL ACCESS PORTAL
          </p>

          {/* ── Tab Switcher ─────────────────────── */}
          <div className="login-tab-container relative flex w-full mb-7 rounded-full p-1">
            {/* Sliding pill indicator */}
            <div
              className="login-tab-indicator absolute top-1 bottom-1 rounded-full"
              style={{
                width: 'calc(33.333% - 4px)',
                transform: `translateX(calc(${tabIndex * 100}% + ${tabIndex * 4}px))`,
              }}
            />
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`login-tab-btn flex-1 relative z-10 py-2 text-[14px] font-semibold tracking-wide capitalize transition-colors duration-200 ${
                  activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tab Content ──────────────────────── */}
          <div className="min-h-[280px]">

            {/* ─── LOGIN ───────────────────────── */}
            {activeTab === 'login' && (
              <div className="space-y-5 login-tab-fade">
                {/* Identifier */}
                <div className="space-y-1.5">
                  <label className="login-label">IDENTIFIER</label>
                  <div className="relative">
                    <User size={16} className="login-input-icon" />
                    <input
                      type="text"
                      value={formData.identifier}
                      onChange={e => updateField('identifier', e.target.value)}
                      placeholder="Email / Username / Phone"
                      className="login-input pl-10 pr-4"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="login-label">PASSWORD</label>
                  <div className="relative">
                    <Lock size={16} className="login-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => updateField('password', e.target.value)}
                      placeholder="••••••••"
                      className="login-input pl-10 pr-11 tracking-widest"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-eye-btn"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="text-right pt-1">
                    <button className="text-[12px] text-[#6c63ff] hover:underline transition-colors font-medium">
                      Forgot Password?
                    </button>
                  </div>
                </div>

                <button onClick={handleSubmit} disabled={isLoading} className="login-primary-btn mt-3 opacity-90 hover:opacity-100 disabled:opacity-50">
                  {isLoading ? <Loader2 size={18} className="animate-spin text-white" /> : <span className="font-orbitron text-[13px] font-bold tracking-[3px]">ACCESS SYSTEM</span>}
                </button>
              </div>
            )}

            {/* ─── REGISTER ────────────────────── */}
            {activeTab === 'register' && (
              <div className="space-y-4 login-tab-fade">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="login-label">FULL NAME</label>
                  <div className="relative">
                    <User size={16} className="login-input-icon" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => updateField('name', e.target.value)}
                      placeholder="Your full name"
                      className="login-input pl-10 pr-4"
                    />
                  </div>
                </div>
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="login-label">EMAIL</label>
                  <div className="relative">
                    <Mail size={16} className="login-input-icon" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                      placeholder="you@example.com"
                      className="login-input pl-10 pr-4"
                    />
                  </div>
                </div>
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="login-label">PHONE NUMBER</label>
                  <div className="relative">
                    <Phone size={16} className="login-input-icon" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="login-input pl-10 pr-4"
                    />
                  </div>
                </div>
                {/* Password */}
                <div className="space-y-1.5">
                  <label className="login-label">PASSWORD</label>
                  <div className="relative">
                    <Lock size={16} className="login-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => updateField('password', e.target.value)}
                      placeholder="Create password"
                      className="login-input pl-10 pr-11"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="login-eye-btn">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="login-label">CONFIRM PASSWORD</label>
                  <div className="relative">
                    <Lock size={16} className="login-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => updateField('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className="login-input pl-10 pr-11"
                    />
                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="login-eye-btn">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button onClick={handleSubmit} disabled={isLoading} className="login-primary-btn mt-3 opacity-90 hover:opacity-100 disabled:opacity-50">
                  {isLoading ? <Loader2 size={18} className="animate-spin text-white" /> : <span className="font-orbitron text-[13px] font-bold tracking-[3px]">INITIALIZE ACCOUNT</span>}
                </button>
              </div>
            )}

            {/* ─── GUEST ───────────────────────── */}
            {activeTab === 'guest' && (
              <div className="flex flex-col items-center justify-center py-6 space-y-5 login-tab-fade">
                <div className="text-[64px] leading-none login-guest-icon">👾</div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-[#00f5ff] font-orbitron tracking-wide login-title-glow">
                    ANONYMOUS ACCESS
                  </h3>
                  <p className="text-[14px] text-white/50 font-rajdhani font-medium">
                    No credentials required. Limited system access.
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 w-full px-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] text-white/30 uppercase tracking-[3px] font-semibold">or enter the grid</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button onClick={handleGuestLogin} className="login-ghost-btn w-full">
                  <span className="font-orbitron text-[13px] font-bold tracking-[3px]">ENTER AS GHOST</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Guest Toast ────────────────────────── */}
      {guestToast && (
        <div className="login-toast fixed bottom-8 left-1/2 z-50">
          <CheckCircle2 size={18} className="text-[#00f5ff] flex-shrink-0" />
          <span className="text-white/90 font-medium tracking-wide text-[14px]">👾 Ghost Mode Activated</span>
        </div>
      )}

      {/* ── Error Toast ────────────────────────── */}
      {errorToast && (
        <div className="login-toast fixed bottom-8 left-1/2 z-50 !border-[#FF4560]/40 !shadow-[0_0_24px_rgba(255,69,96,0.15)]">
          <AlertCircle size={18} className="text-[#FF4560] flex-shrink-0" />
          <span className="text-white/90 font-medium tracking-wide text-[14px]">{errorToast}</span>
        </div>
      )}
    </div>
  );
}
