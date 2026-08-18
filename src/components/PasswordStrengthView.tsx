import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { validatePasswordStrength } from '../lib/passwordValidation';

interface PasswordStrengthViewProps {
  password: string;
  userContext?: { name?: string; email?: string };
  showDetailedChecklist?: boolean;
}

export default function PasswordStrengthView({
  password,
  userContext,
  showDetailedChecklist = true
}: PasswordStrengthViewProps) {
  if (!password) {
    return (
      <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Strong Password Recommendation:</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Use 8+ characters with uppercase letters, lowercase letters, numbers, and symbols.
          Avoid birthdays, personal/family names, or phone numbers.
        </p>
      </div>
    );
  }

  const result = validatePasswordStrength(password, userContext);

  const getScoreColor = () => {
    switch (result.score) {
      case 0:
      case 1:
        return 'bg-rose-500 text-rose-300';
      case 2:
        return 'bg-amber-500 text-amber-300';
      case 3:
        return 'bg-blue-500 text-blue-300';
      case 4:
      default:
        return 'bg-emerald-500 text-emerald-300';
    }
  };

  const getScoreLabel = () => {
    switch (result.score) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Moderate';
      case 3:
        return 'Good';
      case 4:
      default:
        return 'Strong';
    }
  };

  return (
    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2.5 text-left text-xs font-sans">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold">
          <span className="text-slate-400 uppercase">Password Security Strength</span>
          <span className={getScoreColor().split(' ')[1]}>{getScoreLabel()}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`rounded-full transition-colors duration-300 ${
                result.score >= step
                  ? result.score <= 1
                    ? 'bg-rose-500'
                    : result.score === 2
                    ? 'bg-amber-500'
                    : result.score === 3
                    ? 'bg-blue-500'
                    : 'bg-emerald-500'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Checklist */}
      {showDetailedChecklist && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
          <div className={`flex items-center gap-1 ${result.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
            {result.hasMinLength ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <span className="w-3 h-3 rounded-full border border-white/20 inline-block shrink-0" />}
            <span>8+ characters</span>
          </div>
          <div className={`flex items-center gap-1 ${result.hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
            {result.hasUppercase ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <span className="w-3 h-3 rounded-full border border-white/20 inline-block shrink-0" />}
            <span>Uppercase (Caps)</span>
          </div>
          <div className={`flex items-center gap-1 ${result.hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
            {result.hasLowercase ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <span className="w-3 h-3 rounded-full border border-white/20 inline-block shrink-0" />}
            <span>Lowercase letter</span>
          </div>
          <div className={`flex items-center gap-1 ${result.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
            {result.hasNumber ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <span className="w-3 h-3 rounded-full border border-white/20 inline-block shrink-0" />}
            <span>Number (0-9)</span>
          </div>
          <div className={`flex items-center gap-1 col-span-2 ${result.hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
            {result.hasSpecialChar ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <span className="w-3 h-3 rounded-full border border-white/20 inline-block shrink-0" />}
            <span>Special Symbol (!@#$%)</span>
          </div>
        </div>
      )}

      {/* Security Warning against predictable information */}
      <div className="pt-1 border-t border-white/5 flex items-start gap-1.5 text-[10px] text-amber-300/90 leading-tight">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Security Note:</strong> Avoid using birthdays, personal names, family names, or phone numbers in your password.
        </span>
      </div>

      {result.hasCommonWeakPatterns && (
        <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span>Pattern detected: Please avoid dates, phone numbers, or names for your security.</span>
        </div>
      )}
    </div>
  );
}
