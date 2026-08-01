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

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
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
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl border border-slate-200 animate-fade-in text-slate-900 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
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

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
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
      </div>
    </div>
  );
}
