import React, { useState } from 'react';
import { 
  MessageSquarePlus, X, Send, Bug, Sparkles, HelpCircle, 
  CheckCircle2, AlertCircle, Copy, Check, ShieldCheck, Terminal
} from 'lucide-react';

interface FeedbackWidgetProps {
  currentTenantId?: string;
  userEmail?: string;
  userRole?: string;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  currentTenantId = 'platform-root',
  userEmail = 'visitor@marketforge.ai',
  userRole = 'visitor'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<'bug' | 'feature' | 'praise' | 'diagnostic'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedDiag, setCopiedDiag] = useState(false);

  const getDiagnosticPayload = () => {
    return {
      category,
      title: title.trim() || `Automated ${category.toUpperCase()} Report`,
      description: description.trim(),
      rating,
      context: {
        tenantId: currentTenantId,
        userEmail,
        userRole,
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        clientTimestamp: new Date().toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
  };

  const handleCopyDiagnostics = () => {
    const bundle = JSON.stringify(getDiagnosticPayload(), null, 2);
    navigator.clipboard.writeText(bundle).then(() => {
      setCopiedDiag(true);
      setTimeout(() => setCopiedDiag(false), 2500);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a brief description before submitting.' });
      return;
    }

    if (isSubmitting) return; // Double-click lock
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = getDiagnosticPayload();
      const res = await fetch('/api/telemetry/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Feedback and telemetry securely logged. Thank you!' });
        setTitle('');
        setDescription('');
        setTimeout(() => {
          setIsOpen(false);
          setStatusMessage(null);
        }, 2200);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Unable to transmit feedback. Diagnostics preserved locally.' });
      }
    } catch (err: any) {
      console.error('Feedback submit failure:', err);
      setStatusMessage({ type: 'error', text: 'Network exception. You can still copy the diagnostic bundle.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 font-sans">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-900 active:bg-black text-white text-xs font-bold rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer"
          title="Provide Feedback or Report a Bug"
          aria-label="Open Feedback & Diagnostic Dialog"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <MessageSquarePlus className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Feedback & Diagnostics</span>
        </button>
      </div>

      {/* Slide-out / Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">System Feedback & Telemetry</h3>
                  <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Tenant: {currentTenantId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800">
              {statusMessage && (
                <div className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'bug', label: 'Bug / Issue', icon: Bug, color: 'text-rose-500' },
                    { key: 'feature', label: 'Idea', icon: Sparkles, color: 'text-amber-500' },
                    { key: 'praise', label: 'General', icon: HelpCircle, color: 'text-indigo-500' },
                    { key: 'diagnostic', label: 'Telemetry', icon: Terminal, color: 'text-emerald-500' }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isSelected = category === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setCategory(tab.key as any)}
                        className={`px-3 py-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tab.color}`} />
                        <span className="text-[10px] whitespace-nowrap">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  placeholder={category === 'bug' ? 'e.g., Campaign save button unresponsive' : 'e.g., Requesting custom domain export'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              {/* Description input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Details & Steps to Reproduce <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide any relevant context, expected behavior, or steps you took..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition resize-none"
                />
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-700">Platform Experience Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-lg transition-transform hover:scale-125 cursor-pointer ${
                        star <= rating ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnostic Quick Bar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="text-[11px] text-slate-500 truncate">
                  <span className="font-mono font-bold text-slate-700">{userEmail}</span> ({userRole})
                </div>
                <button
                  type="button"
                  onClick={handleCopyDiagnostics}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                  title="Copy JSON diagnostic bundle to clipboard"
                >
                  {copiedDiag ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedDiag ? 'Copied' : 'Copy Diagnostics'}
                </button>
              </div>

              {/* Submit & Close */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
