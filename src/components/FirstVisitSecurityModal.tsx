import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, X, ArrowRight } from 'lucide-react';
import PasswordStrengthView from './PasswordStrengthView';
import { validatePasswordStrength } from '../lib/passwordValidation';

interface FirstVisitSecurityModalProps {
  user: {
    email: string;
    name?: string;
    tenantId: string;
    role?: string;
  };
  onClose: () => void;
  onPasswordChanged?: () => void;
}

export default function FirstVisitSecurityModal({
  user,
  onClose,
  onPasswordChanged
}: FirstVisitSecurityModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDismiss = () => {
    localStorage.setItem(`marketforge_security_notice_dismissed_${user.email}`, 'true');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    const strength = validatePasswordStrength(newPassword, { email: user.email, name: user.name });
    if (!strength.isValid) {
      setError(strength.issues[0] || 'Password does not meet all complexity requirements.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('marketforge_token') || '';
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user.email,
          tenantId: user.tenantId,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccess('✓ Password successfully updated! Your workspace is secure.');
      localStorage.setItem(`marketforge_security_notice_dismissed_${user.email}`, 'true');
      if (onPasswordChanged) onPasswordChanged();

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0e101a] border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-left font-sans animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Security Recommendation
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">Set Your Custom Secure Password</h3>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro Body */}
        <p className="text-xs text-slate-300 leading-relaxed">
          Welcome to your workspace, <strong className="text-white">{user.name || user.email}</strong>! For maximum protection, we recommend changing your initial temporary password to a strong, personalized password.
        </p>

        {/* Notification alerts */}
        {error && (
          <div className="p-3 bg-red-950/70 border border-red-800 text-red-200 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Current / Initial Temporary Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current or temporary password from email"
                className="w-full bg-black/50 border border-white/15 text-white text-xs rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1"
                title={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              New Secure Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create strong new password"
                className="w-full bg-black/50 border border-white/15 text-white text-xs rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1"
                title={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Strength View */}
          <PasswordStrengthView
            password={newPassword}
            userContext={{ email: user.email, name: user.name }}
          />

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full bg-black/50 border border-white/15 text-white text-xs rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1"
                title={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Skip &amp; Keep Current Password
            </button>

            <button
              type="submit"
              disabled={loading || !newPassword}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer transition transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
