import React, { useState } from 'react';
import { Lock, Mail, Key, ShieldCheck, UserCheck, AlertCircle, Sparkles, X, ChevronRight, Award } from 'lucide-react';
import { TenantTeamMember } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName?: string;
  onLoginSuccess: (member: TenantTeamMember) => void;
  onLogoutToGuest?: () => void;
  currentMember?: TenantTeamMember | null;
}

export default function MemberAuthModal({
  isOpen,
  onClose,
  tenantId,
  tenantName = "Tenant Workspace",
  onLoginSuccess,
  onLogoutToGuest,
  currentMember
}: Props) {
  if (!isOpen) return null;

  const [authMode, setAuthMode] = useState<'password' | 'pin'>('pin');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [selectedPinMemberId, setSelectedPinMemberId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read team members from localStorage
  const getSavedMembers = (): TenantTeamMember[] => {
    try {
      const saved = localStorage.getItem('marketforge_tenant_team_members');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed loading saved team members:", e);
    }
    return [];
  };

  const allMembers = getSavedMembers();
  const tenantMembers = allMembers.filter(m => m.tenantId === tenantId);

  const handlePinKeyPress = (digit: string) => {
    if (digit === 'DEL') {
      setPinInput(prev => prev.slice(0, -1));
      return;
    }
    if (pinInput.length < 6) {
      setPinInput(prev => prev + digit);
    }
  };

  const handlePinLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    let targetMember: TenantTeamMember | undefined;

    if (selectedPinMemberId) {
      targetMember = tenantMembers.find(m => m.id === selectedPinMemberId);
    } else if (emailInput) {
      targetMember = tenantMembers.find(m => m.email.toLowerCase() === emailInput.trim().toLowerCase());
    }

    if (!targetMember) {
      // Search by PIN across tenant members
      targetMember = tenantMembers.find(m => m.pinCode === pinInput || (m.password && m.password === pinInput));
    }

    if (!targetMember) {
      setErrorMessage(`Invalid PIN or selected member not found. Please verify your 4-digit POS PIN.`);
      return;
    }

    if (targetMember.status === 'revoked') {
      setErrorMessage(`Access for user ${targetMember.name} has been revoked by Tenant Admin.`);
      return;
    }

    // Verify PIN code
    const expectedPin = targetMember.pinCode || '1234';
    if (pinInput !== expectedPin && targetMember.password !== pinInput) {
      setErrorMessage(`Incorrect PIN code for ${targetMember.name}. Please try again.`);
      return;
    }

    onLoginSuccess(targetMember);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const foundMember = tenantMembers.find(
      m => m.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (!foundMember) {
      setErrorMessage(`No registered team member found with email "${emailInput}" in ${tenantName}. Please verify credentials with your Tenant Admin.`);
      return;
    }

    if (foundMember.status === 'revoked') {
      setErrorMessage(`Access for user ${emailInput} has been revoked by the Tenant Admin.`);
      return;
    }

    // Check password if set
    if (foundMember.password && foundMember.password !== passwordInput.trim()) {
      setErrorMessage("Invalid password. Please check your password and try again.");
      return;
    }

    // Login successful
    onLoginSuccess(foundMember);
    onClose();
  };

  const handleQuickLogin = (member: TenantTeamMember) => {
    onLoginSuccess(member);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8 shadow-2xl border border-slate-200 text-slate-900 space-y-6 relative my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 z-20 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-full transition shadow-xs cursor-pointer flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Tenant Team Member Authentication</h3>
          <p className="text-xs text-slate-500">
            Log in with your tenant email and password to access features permitted for your designation.
          </p>
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-mono font-bold rounded-full text-[10px] border border-slate-200">
            Tenant: {tenantName} ({tenantId})
          </span>
        </div>

        {currentMember && (
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs">
                {currentMember.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">{currentMember.name} (Active Session)</p>
                <p className="text-[10px] text-indigo-700 font-semibold">{currentMember.designation}</p>
              </div>
            </div>
            {onLogoutToGuest && (
              <button
                onClick={() => {
                  onLogoutToGuest();
                  onClose();
                }}
                className="text-[11px] font-bold text-rose-600 hover:underline px-2 py-1"
              >
                Log Out
              </button>
            )}
          </div>
        )}

        {/* AUTHENTICATION MODE TAB TOGGLE */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => { setAuthMode('pin'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'pin' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-600" /> Touch POS PIN Keypad
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'password' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 text-indigo-600" /> Email & Password
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PIN CODE KEYPAD MODE */}
        {authMode === 'pin' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Staff Member (Optional)</label>
              <select
                value={selectedPinMemberId}
                onChange={(e) => {
                  setSelectedPinMemberId(e.target.value);
                  const mem = tenantMembers.find(m => m.id === e.target.value);
                  if (mem) setEmailInput(mem.email);
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Tap or Select Staff Member --</option>
                {tenantMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.designation} - PIN: {m.pinCode || '1234'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 text-center">
              <label className="text-xs font-bold text-slate-700 block">4-Digit Terminal PIN Code</label>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-mono text-xl font-black transition-all ${
                      pinInput.length > idx
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {pinInput.length > idx ? '•' : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* TOUCH KEYPAD GRID */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => {
                    if (btn === 'CLR') setPinInput('');
                    else handlePinKeyPress(btn);
                  }}
                  className={`py-3 rounded-2xl font-mono text-base font-black border transition active:scale-95 cursor-pointer shadow-xs ${
                    btn === 'CLR'
                      ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                      : btn === 'DEL'
                      ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                      : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handlePinLoginSubmit()}
              disabled={pinInput.length < 4}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Log In with PIN Code
            </button>
          </div>
        )}

        {/* EMAIL & PASSWORD MODE */}
        {authMode === 'password' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="you@tenantcompany.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Authenticate & Access Workspace
            </button>
          </form>
        )}

        {/* QUICK SWITCHER PRESETS FOR TESTING */}
        {tenantMembers.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
              Quick Switch Invited Team Members ({tenantMembers.length})
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {tenantMembers.map((mem) => (
                <button
                  key={mem.id}
                  type="button"
                  onClick={() => handleQuickLogin(mem)}
                  className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center justify-between text-left transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {mem.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-900">{mem.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{mem.designation} • Pass: {mem.password}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {mem.isInvestor && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded-md flex items-center gap-0.5">
                        <Award className="w-3 h-3 text-amber-600" /> Investor
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
          >
            <X className="w-4 h-4 text-slate-500" />
            <span>Close Authentication Window</span>
          </button>
        </div>
      </div>
    </div>
  );
}
