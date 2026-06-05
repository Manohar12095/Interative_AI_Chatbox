import { useState } from 'react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, Check, Shield, LogOut } from 'lucide-react';
import { insforge } from '../../utils/insforge';

export default function ProfilePanel({ onClose, userEmail, userMeta, onLogout }) {
  const [name, setName] = useState(userMeta?.name || localStorage.getItem('rahonam_user_name') || '');
  const [phone, setPhone] = useState(userMeta?.phone || localStorage.getItem('rahonam_user_phone') || '');
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);

  // Password change
  const [showPassSection, setShowPassSection] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passMessage, setPassMessage] = useState(null);

  const saveName = async () => {
    localStorage.setItem('rahonam_user_name', name);
    try {
      await insforge.auth.updateUser({ data: { name } });
    } catch (e) {
      console.error(e);
    }
    setEditingName(false);
  };

  const savePhone = async () => {
    localStorage.setItem('rahonam_user_phone', phone);
    try {
      await insforge.auth.updateUser({ data: { phone } });
    } catch (e) {
      console.error(e);
    }
    setEditingPhone(false);
  };

  const handlePasswordChange = async () => {
    if (!newPass || !confirmPass) {
      setPassMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (newPass.length < 6) {
      setPassMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    
    try {
      const { error } = await insforge.auth.updateUser({ password: newPass });
      if (error) throw error;
      
      setPassMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setPassMessage(null), 3000);
    } catch (err) {
      setPassMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 w-[90%] max-w-[440px] rounded-2xl overflow-hidden animate-fade-slide-up"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {userEmail ? userEmail[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Account Profile
              </h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Manage your personal info
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--text-muted)' }}>
              <Mail size={12} className="inline mr-1.5 mb-0.5" />
              Email Address
            </label>
            <div
              className="px-4 py-3 rounded-xl text-[14px]"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {userEmail || 'guest@rahonam.ai'}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--text-muted)' }}>
              <User size={12} className="inline mr-1.5 mb-0.5" />
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setEditingName(true); }}
                placeholder="Enter your name"
                className="flex-1 px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: editingName ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  boxShadow: editingName ? '0 0 0 3px var(--brand-primary-light)' : 'none',
                }}
              />
              {editingName && (
                <button
                  onClick={saveName}
                  className="px-3 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--accent-gradient)', color: 'white' }}
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--text-muted)' }}>
              <Phone size={12} className="inline mr-1.5 mb-0.5" />
              Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setEditingPhone(true); }}
                placeholder="Enter phone number"
                className="flex-1 px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: editingPhone ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  boxShadow: editingPhone ? '0 0 0 3px var(--brand-primary-light)' : 'none',
                }}
              />
              {editingPhone && (
                <button
                  onClick={savePhone}
                  className="px-3 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--accent-gradient)', color: 'white' }}
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          {/* Change Password */}
          <div>
            <button
              onClick={() => setShowPassSection(!showPassSection)}
              className="flex items-center gap-2 text-[13px] font-semibold transition-colors w-full"
              style={{ color: 'var(--accent)' }}
            >
              <Shield size={14} />
              {showPassSection ? 'Hide Password Settings' : 'Change Password'}
            </button>

            {showPassSection && (
              <div className="mt-4 space-y-3 animate-fade-slide-up">
                {/* Current Password */}
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)}
                    placeholder="Current password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-[14px] outline-none transition-all"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* New Password */}
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="New password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-[14px] outline-none transition-all"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-[14px] outline-none transition-all"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password feedback */}
                {passMessage && (
                  <p
                    className="text-[12px] font-medium px-1"
                    style={{ color: passMessage.type === 'success' ? '#00E5A0' : '#FF4560' }}
                  >
                    {passMessage.text}
                  </p>
                )}

                <button
                  onClick={handlePasswordChange}
                  className="w-full py-2.5 rounded-xl text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    boxShadow: '0 4px 16px var(--accent-glow)',
                  }}
                >
                  Update Password
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(255, 69, 96, 0.1)',
              border: '1px solid rgba(255, 69, 96, 0.25)',
              color: '#FF4560',
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
