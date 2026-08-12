/**
 * UIStyleEngine - Unified Design Token System & Component Style Provider
 * Provides standardized design tokens, class generators, and theme rules
 * across MarketForge Enterprise AI OS components.
 */

export const UIStyleEngine = {
  // Design Tokens
  tokens: {
    radii: {
      container: 'rounded-2xl',
      card: 'rounded-2xl',
      subCard: 'rounded-xl',
      button: 'rounded-xl',
      input: 'rounded-xl',
      badge: 'rounded-full',
    },
    padding: {
      container: 'p-6 md:p-8',
      card: 'p-5 md:p-6',
      subCard: 'p-4',
      button: 'px-4 py-2.5',
      buttonSmall: 'px-3 py-1.5',
      input: 'px-3.5 py-2.5',
    },
    shadows: {
      card: 'shadow-xl shadow-black/20',
      floating: 'shadow-2xl shadow-indigo-950/40',
      glowIndigo: 'shadow-lg shadow-indigo-500/20',
      glowEmerald: 'shadow-lg shadow-emerald-500/20',
    },
    borders: {
      subtle: 'border border-white/10',
      interactive: 'border border-white/10 hover:border-white/20 transition-all duration-200',
      accentIndigo: 'border border-indigo-500/30',
      accentEmerald: 'border border-emerald-500/30',
      accentAmber: 'border border-amber-500/30',
      accentRose: 'border border-rose-500/30',
    },
    colors: {
      bgDark: 'bg-[#0D0E17]',
      bgDarkCard: 'bg-[#0D0E17]',
      bgSubCard: 'bg-white/5',
      bgInput: 'bg-white/5',
      textPrimary: 'text-white',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      textAccent: 'text-indigo-400',
    }
  },

  // Component Style Presets
  cards: {
    primary: 'bg-[#0D0E17] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20 backdrop-blur-md',
    headerBanner: 'bg-[#0D0E17] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6',
    subCard: 'p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-200',
    accentIndigo: 'p-5 bg-white/5 border border-indigo-500/30 rounded-xl space-y-3',
    accentEmerald: 'p-5 bg-white/5 border border-emerald-500/30 rounded-xl space-y-3',
    accentAmber: 'p-5 bg-white/5 border border-amber-500/30 rounded-xl space-y-3',
  },

  buttons: {
    primary: 'px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer',
    emerald: 'px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer',
    amber: 'px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg border border-amber-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer',
    danger: 'px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg border border-rose-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer',
    ghost: 'px-3 py-1.5 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-semibold text-xs rounded-lg transition-all cursor-pointer',
  },

  inputs: {
    text: 'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all',
    select: 'w-full bg-[#0D0E17] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all',
    textarea: 'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all',
  },

  badges: {
    indigo: 'px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold rounded-full uppercase flex items-center gap-1',
    emerald: 'px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold rounded-full uppercase flex items-center gap-1',
    amber: 'px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold rounded-full uppercase flex items-center gap-1',
    rose: 'px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold rounded-full uppercase flex items-center gap-1',
    cyan: 'px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold rounded-full uppercase flex items-center gap-1',
  },

  tabs: {
    container: 'flex items-center gap-1 bg-[#0D0E17] border border-white/10 p-1.5 rounded-2xl overflow-x-auto',
    active: 'py-2 px-4 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
    inactive: 'py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap',
  },

  typography: {
    h1: 'text-3xl font-extrabold text-white tracking-tight',
    h2: 'text-2xl font-extrabold text-white tracking-tight',
    h3: 'text-lg font-bold text-white',
    h4: 'text-sm font-bold text-white',
    body: 'text-xs text-slate-300 leading-relaxed',
    caption: 'text-[11px] text-slate-400 font-mono',
  }
};

export default UIStyleEngine;
