import { useCurrency } from '../lib/CurrencyContext';
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Percent, TrendingUp, Users, Shield, Award, Calendar, 
  Plus, ArrowUpRight, ArrowDownRight, RefreshCw, Briefcase, FileText, 
  ChevronRight, Calculator, PieChart as PieIcon, BarChart3, HelpCircle,
  PiggyBank, Info, Sliders, Play, TrendingDown, Layers, Building, Brain
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, LineChart, Line, PieChart, Cell, Pie 
} from 'recharts';

interface FinancialIntelligenceEngineProps {
  tenantId: string;
  userRole: string;
}

// Interfaces
interface Shareholder {
  id: string;
  name: string;
  role: 'founder' | 'partner' | 'investor' | 'employee';
  shareClass: 'Class A Common' | 'Class B Preferred' | 'Warrants';
  shares: number;
  capitalContribution: number;
  votingPower: number; // percentage
  equityPercent: number; // percentage
}

interface FinancialTransaction {
  id: string;
  date: string;
  type: 'revenue' | 'expense' | 'capital_investment' | 'dividend_payout';
  category: string;
  description: string;
  amount: number;
  payee: string;
}

export default function FinancialIntelligenceEngine({ tenantId, userRole }: FinancialIntelligenceEngineProps) {
  const { formatCurrency } = useCurrency();

  // Navigation internal state
  const [activeTab, setActiveTab] = useState<'overview' | 'cap_table' | 'statements' | 'distribution' | 'forecasting' | 'advisory'>('overview');
  const [roleView, setRoleView] = useState<'founder' | 'executive' | 'board' | 'investor'>('founder');

  // Interactive states
  const [shareholders, setShareholders] = useState<Shareholder[]>([
    { id: '1', name: 'Alexander Sterling', role: 'founder', shareClass: 'Class A Common', shares: 5100000, capitalContribution: 150000, votingPower: 51, equityPercent: 51 },
    { id: '2', name: 'Elena Rostova', role: 'founder', shareClass: 'Class A Common', shares: 2900000, capitalContribution: 90000, votingPower: 29, equityPercent: 29 },
    { id: '3', name: 'Vanguard Ventures', role: 'investor', shareClass: 'Class B Preferred', shares: 1500000, capitalContribution: 1500000, votingPower: 15, equityPercent: 15 },
    { id: '4', name: 'Marcus Sterling', role: 'partner', shareClass: 'Class A Common', shares: 300000, capitalContribution: 50000, votingPower: 3, equityPercent: 3 },
    { id: '5', name: 'Option Pool (ESOP)', role: 'employee', shareClass: 'Warrants', shares: 200000, capitalContribution: 0, votingPower: 2, equityPercent: 2 },
  ]);

  const [transactions, setTransactions] = useState<FinancialTransaction[]>([
    { id: 'tx-01', date: '2026-06-25', type: 'revenue', category: 'SaaS Subscriptions', description: 'Enterprise License Renewal - AeroFlow', amount: 48000, payee: 'AeroFlow Operations' },
    { id: 'tx-02', date: '2026-06-24', type: 'expense', category: 'Infrastructure', description: 'Cloud compute usage billing', amount: 12400, payee: 'Google Cloud Platform' },
    { id: 'tx-03', date: '2026-06-22', type: 'revenue', category: 'API Overages', description: 'Usage overage billing tier 3', amount: 8400, payee: 'Sienna Artisanal' },
    { id: 'tx-04', date: '2026-06-20', type: 'expense', category: 'Marketing', description: 'Strategic social attribution campaign', amount: 15000, payee: 'Meta Ads Manager' },
    { id: 'tx-05', date: '2026-06-18', type: 'capital_investment', category: 'Series A Extension', description: 'Capital infusion tranche 2', amount: 500000, payee: 'Vanguard Ventures' },
    { id: 'tx-06', date: '2026-06-15', type: 'expense', category: 'Salaries', description: 'Payroll administration mid-month', amount: 38500, payee: 'MarketForge Staff' },
    { id: 'tx-07', date: '2026-06-10', type: 'revenue', category: 'Professional Services', description: 'AI OS Customization Workshop', amount: 25000, payee: 'Global Pharma Group' },
  ]);

  // Forecasting and Valuation parameters
  const [growthRate, setGrowthRate] = useState<number>(15); // % quarterly growth
  const [discountRate, setDiscountRate] = useState<number>(10); // % discount rate (WACC)
  const [terminalMultiple, setTerminalMultiple] = useState<number>(12); // EBITDA multiple
  const [opexGrowth, setOpexGrowth] = useState<number>(5); // % quarterly increase

  // Form Inputs
  const [newShareholder, setNewShareholder] = useState({
    name: '',
    role: 'investor' as any,
    shareClass: 'Class B Preferred' as any,
    shares: 100000,
    capital: 100000
  });

  const [newTx, setNewTx] = useState({
    type: 'revenue' as any,
    category: 'SaaS Subscriptions',
    description: '',
    amount: 5000,
    payee: ''
  });

  const [dividendAmount, setDividendAmount] = useState<number>(100000);
  const [dividendLogs, setDividendLogs] = useState<any[]>([
    { id: 'div-1', date: '2026-03-15', declaredAmount: 50000, status: 'Distributed', description: 'Q1 Profit Share Dividend distribution' }
  ]);

  // Recalculate Shareholder totals
  const totalShares = shareholders.reduce((sum, s) => sum + s.shares, 0);
  const totalCapital = shareholders.reduce((sum, s) => sum + s.capitalContribution, 0);

  const formatMoney = (val: number) => { return formatCurrency(val);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Add Shareholder
  const handleAddShareholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShareholder.name.trim()) return;

    const newS: Shareholder = {
      id: Date.now().toString(),
      name: newShareholder.name,
      role: newShareholder.role,
      shareClass: newShareholder.shareClass,
      shares: Number(newShareholder.shares),
      capitalContribution: Number(newShareholder.capital),
      votingPower: 0, // Recalculated below
      equityPercent: 0 // Recalculated below
    };

    const updatedShareholders = [...shareholders, newS];
    const newTotalShares = updatedShareholders.reduce((sum, s) => sum + s.shares, 0);
    const newTotalCapital = updatedShareholders.reduce((sum, s) => sum + s.capitalContribution, 0);

    const finalized = updatedShareholders.map(s => {
      const sharesPct = Number(((s.shares / newTotalShares) * 100).toFixed(2));
      return {
        ...s,
        equityPercent: sharesPct,
        votingPower: s.shareClass === 'Warrants' ? 0 : sharesPct // Warrants don't have voting power
      };
    });

    setShareholders(finalized);
    setNewShareholder({
      name: '',
      role: 'investor',
      shareClass: 'Class B Preferred',
      shares: 100000,
      capital: 100000
    });
  };

  // Add Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description.trim() || !newTx.payee.trim()) return;

    const t: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: newTx.type,
      category: newTx.category,
      description: newTx.description,
      amount: Number(newTx.amount),
      payee: newTx.payee
    };

    setTransactions([t, ...transactions]);
    setNewTx({
      type: 'revenue',
      category: 'SaaS Subscriptions',
      description: '',
      amount: 5000,
      payee: ''
    });
  };

  // Run Dividend distribution simulation
  const handleTriggerDividends = () => {
    if (dividendAmount <= 0) return;

    const payouts = shareholders.map(s => ({
      shareholder: s.name,
      amount: (dividendAmount * (s.equityPercent / 100)),
      shares: s.shares,
      equityPercent: s.equityPercent
    }));

    const log = {
      id: `div-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      declaredAmount: dividendAmount,
      status: 'Distributed',
      description: `Profit Share Dividend distribution of ${formatMoney(dividendAmount)}`,
      payouts
    };

    setDividendLogs([log, ...dividendLogs]);

    // Record transactions for dividend payouts
    const txs: FinancialTransaction[] = shareholders.map((s, idx) => ({
      id: `tx-div-${Date.now()}-${idx}`,
      date: new Date().toISOString().split('T')[0],
      type: 'dividend_payout',
      category: 'Dividend Distribution',
      description: `Dividend payment to ${s.name}`,
      amount: (dividendAmount * (s.equityPercent / 100)),
      payee: s.name
    }));

    setTransactions(prev => [...txs, ...prev]);
    alert(`Dividend distribution executed successfully! ${formatMoney(dividendAmount)} split among ${shareholders.length} equity holders based on the cap table.`);
  };

  // Financial Calculations (dynamic based on current transactions state)
  const totalRevenue = transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const capitalInjected = transactions.filter(t => t.type === 'capital_investment').reduce((sum, t) => sum + t.amount, 0);
  const dividendsPaid = transactions.filter(t => t.type === 'dividend_payout').reduce((sum, t) => sum + t.amount, 0);

  // Profit and Loss Metrics
  const grossProfit = totalRevenue; // Simplified assuming SaaS (no direct product COGS for simplicity)
  const ebitda = totalRevenue - totalExpense;
  const netIncome = ebitda; // Simplified before depreciation/taxes

  // Financial Health Ratios
  const burnRate = totalExpense / 6; // Average monthly burn
  const runwayMonths = burnRate > 0 ? (capitalInjected + totalRevenue - totalExpense) / burnRate : 999;
  const roi = totalCapital > 0 ? ((netIncome + totalCapital) / totalCapital - 1) * 100 : 0;
  const roe = totalCapital > 0 ? (netIncome / totalCapital) * 100 : 0;

  // 1-5 Year Projection Models
  const generateProjections = () => {
    const data = [];
    let curRev = totalRevenue || 120000;
    let curOpex = totalExpense || 45000;
    let cumCashFlow = capitalInjected + curRev - curOpex;

    for (let i = 1; i <= 5; i++) {
      curRev = curRev * (1 + growthRate / 100);
      curOpex = curOpex * (1 + opexGrowth / 100);
      const curEbitda = curRev - curOpex;
      const curNetIncome = curEbitda;
      cumCashFlow += curEbitda;

      data.push({
        year: `Year ${i}`,
        Revenue: Math.round(curRev),
        Expenses: Math.round(curOpex),
        EBITDA: Math.round(curEbitda),
        NetIncome: Math.round(curNetIncome),
        CashPosition: Math.round(cumCashFlow)
      });
    }
    return data;
  };

  const projections = generateProjections();

  // DCF Valuation Model
  const calcValuation = () => {
    const terminalEbitda = projections[4]?.EBITDA || 500000;
    const terminalVal = terminalEbitda * terminalMultiple;
    
    // Discount year 1-5 cashflows
    let dcfVal = 0;
    const wacc = discountRate / 100;
    for (let i = 0; i < 5; i++) {
      const cf = projections[i].EBITDA; // Proxy cashflow as EBITDA for simpler model
      dcfVal += cf / Math.pow(1 + wacc, i + 1);
    }
    dcfVal += terminalVal / Math.pow(1 + wacc, 5);

    return {
      dcfValuation: dcfVal,
      ebitdaValuation: (ebitda > 0 ? ebitda : 100000) * terminalMultiple,
      terminalVal
    };
  };

  const valModels = calcValuation();

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      
      {/* SECTION HEADER & ROLE VIEWS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-[10px] tracking-widest font-mono text-indigo-300 uppercase">Phase 2 — Multi-Role Sovereign Governance</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight">Enterprise Financial Intelligence OS</h3>
          <p className="text-[11px] text-slate-400">
            Real-time capitalization ledger, dividend calculation engines, dual-role audit panels, and forecasting engines.
          </p>
        </div>

        {/* Dynamic Board/Founder perspective filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setRoleView('founder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              roleView === 'founder' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Founder Dashboard
          </button>
          <button
            onClick={() => setRoleView('executive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              roleView === 'executive' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Executive Office
          </button>
          <button
            onClick={() => setRoleView('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              roleView === 'board' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Board of Directors
          </button>
          <button
            onClick={() => setRoleView('investor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              roleView === 'investor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Investor Relations
          </button>
        </div>
      </div>

      {/* HORIZONTAL NAVIGATION BAR */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto text-slate-900">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
          General Ledger & Ratios
        </button>
        <button
          onClick={() => setActiveTab('cap_table')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cap_table' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          Sovereign Cap Table & Equity
        </button>
        <button
          onClick={() => setActiveTab('statements')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'statements' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-500" />
          GAAP Financial Statements
        </button>
        <button
          onClick={() => setActiveTab('distribution')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'distribution' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5 text-indigo-500" />
          Dividend & Distribution Engine
        </button>
        <button
          onClick={() => setActiveTab('forecasting')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'forecasting' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-indigo-500" />
          DCF Valuation & Forecasting
        </button>
        <button
          onClick={() => setActiveTab('advisory')}
          className={`py-2 px-4 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'advisory' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          Autonomous Advisory Co-Engine™
        </button>
      </div>

      {/* ACTIVE TAB VIEWS */}
      
      {/* TAB 1: GENERAL LEDGER & RATIOS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* CORE STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-slate-900">
              <span className="text-[10px] text-slate-400 block font-bold uppercase font-sans">Accumulated Revenue</span>
              <div className="flex justify-between items-center">
                <span className="text-xl font-extrabold text-slate-950 font-mono">{formatMoney(totalRevenue)}</span>
                <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 text-xs font-bold flex items-center gap-0.5 font-mono">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +18.4%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">SaaS subscription & API overages</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-slate-900">
              <span className="text-[10px] text-slate-400 block font-bold uppercase font-sans">Operating Expenses</span>
              <div className="flex justify-between items-center">
                <span className="text-xl font-extrabold text-slate-950 font-mono">{formatMoney(totalExpense)}</span>
                <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600 text-xs font-bold flex items-center gap-0.5 font-mono">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  -4.2%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Cloud infrastructure & salaries</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-slate-900">
              <span className="text-[10px] text-slate-400 block font-bold uppercase font-sans">EBITDA (Net Income)</span>
              <div className="flex justify-between items-center">
                <span className="text-xl font-extrabold text-slate-950 font-mono">{formatMoney(netIncome)}</span>
                <span className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-0.5 font-mono ${netIncome >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {netIncome >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {netIncome >= 0 ? 'Profitable' : 'Deficit'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Earnings before interest & tax</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-slate-900">
              <span className="text-[10px] text-slate-400 block font-bold uppercase font-sans">Financial Runway</span>
              <div className="flex justify-between items-center">
                <span className="text-xl font-extrabold text-slate-950 font-mono">
                  {runwayMonths > 100 ? 'Infinite' : `${runwayMonths.toFixed(1)} Mo`}
                </span>
                <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 text-xs font-bold font-sans">
                  Stable
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">Cash position over average burn</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* TRANSACTION RECORD FORM & HISTORY */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-2 text-slate-900">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans">
                  <RefreshCw className="w-4 h-4 text-indigo-500" />
                  Live Corporate Transaction Journal
                </h4>
                <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-mono font-bold">
                  {transactions.length} Ledger Events
                </span>
              </div>

              {/* Add Transaction Form */}
              <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block">Tx Type</label>
                  <select
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value as any })}
                    className="w-full p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none text-slate-900"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                    <option value="capital_investment">Capital Investment</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block">Category</label>
                  <select
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    className="w-full p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none text-slate-900"
                  >
                    <option value="SaaS Subscriptions">SaaS Subscriptions</option>
                    <option value="API Overages">API Overages</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Series A Extension">Series A Extension</option>
                    <option value="Professional Services">Professional Services</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block">Description & Payee</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="e.g. Server hosting"
                      value={newTx.description}
                      onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                      className="w-1/2 p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="e.g. AWS"
                      value={newTx.payee}
                      onChange={(e) => setNewTx({ ...newTx, payee: e.target.value })}
                      className="w-1/2 p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none text-slate-900"
                    />
                  </div>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block">Amount ($)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={newTx.amount}
                      onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                      className="w-2/3 p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none font-mono font-bold text-slate-900"
                    />
                    <button
                      type="submit"
                      className="w-1/3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Transactions List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-sans text-[10px] uppercase font-bold">
                      <th className="py-2">Date</th>
                      <th className="py-2">Description</th>
                      <th className="py-2">Category</th>
                      <th className="py-2">Payee / Payer</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition py-2 text-slate-900">
                        <td className="py-2.5 font-mono text-slate-500 font-semibold">{tx.date}</td>
                        <td className="py-2.5 font-bold text-slate-900">{tx.description}</td>
                        <td className="py-2.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-600">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-600 font-semibold">{tx.payee}</td>
                        <td className={`py-2.5 text-right font-mono font-extrabold ${
                          tx.type === 'revenue' || tx.type === 'capital_investment' ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                          {tx.type === 'revenue' || tx.type === 'capital_investment' ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FINANCIAL RATIOS AND AUDIT ASSISTANT */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-slate-900">
              <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans">
                <Shield className="w-4 h-4 text-indigo-500" />
                SaaS Performance & Health Ratios
              </h4>

              <div className="space-y-3.5 pt-2">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-xs block">Gross Profit Margin</span>
                    <span className="text-[10px] text-slate-400">Total Revenue minus COGS</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-indigo-600">100.0%</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-xs block">Return on Equity (ROE)</span>
                    <span className="text-[10px] text-slate-400">Net income divided by capital contribution</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-indigo-600">{roe.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-xs block">Return on Investment (ROI)</span>
                    <span className="text-[10px] text-slate-400">Gain on initial capital cost</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-indigo-600">{roi.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-xs block">Operating EBITDA Margin</span>
                    <span className="text-[10px] text-slate-400">Earnings before cost adjustment</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-indigo-600">
                    {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>

              {/* Perspective Card */}
              <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1.5 text-xs leading-normal">
                <span className="font-bold text-indigo-950 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  {roleView === 'founder' ? 'Founder Directive' : roleView === 'executive' ? 'Executive Directive' : roleView === 'board' ? 'Board Mandate' : 'Investor Briefing'}
                </span>
                <p className="text-indigo-800 font-sans">
                  {roleView === 'founder' ? (
                    "As a Founder, maintain capitalization alignment and equity pools. Ensure capital calls are executed only after dual board sign-off."
                  ) : roleView === 'executive' ? (
                    "Review operational cost tracking. Outflows must remain below 30% of monthly subscription recurring margins."
                  ) : roleView === 'board' ? (
                    "The Board has declared strict oversight on the capital contributions ledger. Next dividend announcement is scheduled for Q3."
                  ) : (
                    "Verify cap table percentages. Your Class B Preferred shares guarantee liquidation preference in any subsequent valuation round."
                  )}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CAP TABLE & EQUITY MANAGEMENT */}
      {activeTab === 'cap_table' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* LEFT: SHAREHOLDER REGISTRY & ADD SHAREHOLDER */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-2 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans">
                <Users className="w-4 h-4 text-indigo-500" />
                Ownership & Sovereign Cap Table Registry
              </h4>
              <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-mono font-bold">
                Total Share Pool: {totalShares.toLocaleString()}
              </span>
            </div>

            {/* Add Shareholder Form */}
            <form onSubmit={handleAddShareholder} className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newShareholder.name}
                  onChange={(e) => setNewShareholder({ ...newShareholder, name: e.target.value })}
                  className="w-full p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Role</label>
                <select
                  value={newShareholder.role}
                  onChange={(e) => setNewShareholder({ ...newShareholder, role: e.target.value as any })}
                  className="w-full p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none font-sans text-slate-900"
                >
                  <option value="founder">Founder</option>
                  <option value="partner">Partner</option>
                  <option value="investor">Investor</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Share Class</label>
                <select
                  value={newShareholder.shareClass}
                  onChange={(e) => setNewShareholder({ ...newShareholder, shareClass: e.target.value as any })}
                  className="w-full p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none font-sans text-slate-900"
                >
                  <option value="Class A Common">Class A Common</option>
                  <option value="Class B Preferred">Class B Preferred</option>
                  <option value="Warrants">Warrants / Options</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Shares</label>
                <input
                  type="number"
                  value={newShareholder.shares}
                  onChange={(e) => setNewShareholder({ ...newShareholder, shares: Number(e.target.value) })}
                  className="w-full p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none font-mono font-semibold text-slate-900"
                />
              </div>
              <div className="space-y-1 flex flex-col justify-end">
                <label className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Contribution ($)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={newShareholder.capital}
                    onChange={(e) => setNewShareholder({ ...newShareholder, capital: Number(e.target.value) })}
                    className="w-2/3 p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none font-mono font-semibold text-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-1/3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Shareholders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-sans text-[10px] uppercase font-bold">
                    <th className="py-2">Stakeholder</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Share Class</th>
                    <th className="py-2 text-right">Shares</th>
                    <th className="py-2 text-right">Capital Contribution</th>
                    <th className="py-2 text-right">Voting Rights</th>
                    <th className="py-2 text-right">Equity %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans font-medium text-slate-700">
                  {shareholders.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition py-2 text-slate-900">
                      <td className="py-2.5 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          s.role === 'founder' ? 'bg-indigo-50 text-indigo-700' :
                          s.role === 'partner' ? 'bg-cyan-50 text-cyan-700' :
                          s.role === 'investor' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600 font-mono font-semibold">{s.shareClass}</td>
                      <td className="py-2.5 text-right font-mono text-slate-900 font-bold">{s.shares.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-mono text-slate-800">{formatMoney(s.capitalContribution)}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">{s.votingPower}%</td>
                      <td className="py-2.5 text-right font-mono font-extrabold text-indigo-600">{s.equityPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: EQUITY VISUALIZATION CHART */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-slate-900">
            <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans">
              <PieIcon className="w-4 h-4 text-indigo-500" />
              Sovereign Equity Allocations
            </h4>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shareholders}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="shares"
                  >
                    {shareholders.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => Number(value).toLocaleString() + ' shares'} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5 text-slate-900">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Capital Contributions Overview</span>
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-semibold text-slate-600">Total Capital Contributed:</span>
                <span className="font-mono font-extrabold text-slate-900">{formatMoney(totalCapital)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-semibold text-slate-600">Total Shares Outstanding:</span>
                <span className="font-mono font-extrabold text-slate-900">{totalShares.toLocaleString()} shares</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: GAAP FINANCIAL STATEMENTS */}
      {activeTab === 'statements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-slate-800">
          
          {/* PROFIT & LOSS STATEMENT */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-slate-900">
            <h4 className="text-xs uppercase font-bold text-slate-950 tracking-wider flex items-center gap-1.5 font-sans border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Profit & Loss (P&L) Statement
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span>Revenue</span>
                <span className="font-mono">{formatMoney(totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pl-3">
                <span>SaaS Subscriptions</span>
                <span className="font-mono">{formatMoney(totalRevenue - 25000)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pl-3">
                <span>Professional Services</span>
                <span className="font-mono">{formatMoney(25000)}</span>
              </div>
              <div className="border-t border-slate-100 my-1"></div>
              <div className="flex justify-between items-center font-bold text-slate-900">
                <span>Gross Profit</span>
                <span className="font-mono text-emerald-600">{formatMoney(grossProfit)}</span>
              </div>
              <div className="border-t border-slate-100 my-1"></div>
              <div className="flex justify-between items-center font-bold">
                <span>Operating Expenses (OPEX)</span>
                <span className="font-mono text-rose-500">{formatMoney(totalExpense)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pl-3">
                <span>Marketing & Sales</span>
                <span className="font-mono">{formatMoney(15000)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pl-3">
                <span>Engineering & Infrastructure</span>
                <span className="font-mono">{formatMoney(12400)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pl-3">
                <span>G&A / Salaries</span>
                <span className="font-mono">{formatMoney(38500)}</span>
              </div>
              <div className="border-t border-slate-100 my-1"></div>
              <div className="flex justify-between items-center font-extrabold text-indigo-700 bg-indigo-50/50 p-2 rounded-lg">
                <span>EBITDA</span>
                <span className="font-mono">{formatMoney(ebitda)}</span>
              </div>
            </div>
          </div>

          {/* BALANCE SHEET STATEMENT */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-slate-900">
            <h4 className="text-xs uppercase font-bold text-slate-950 tracking-wider flex items-center gap-1.5 font-sans border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-indigo-500" />
              Sovereign Balance Sheet
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center font-bold text-indigo-950">
                <span>Assets</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Cash & Cash Equivalents</span>
                <span className="font-mono">{formatMoney(capitalInjected + totalRevenue - totalExpense - dividendsPaid)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Accounts Receivable (AR)</span>
                <span className="font-mono">{formatMoney(15000)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Intellectual Property</span>
                <span className="font-mono">{formatMoney(500000)}</span>
              </div>
              <div className="border-t border-slate-100 my-1"></div>
              <div className="flex justify-between items-center font-bold text-indigo-950">
                <span>Liabilities</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Accounts Payable (AP)</span>
                <span className="font-mono">{formatMoney(8400)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Corporate Debt</span>
                <span className="font-mono">{formatMoney(0)}</span>
              </div>
              <div className="border-t border-slate-100 my-1"></div>
              <div className="flex justify-between items-center font-bold text-indigo-950">
                <span>Sovereign Equity</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Paid-In Capital</span>
                <span className="font-mono">{formatMoney(totalCapital)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Retained Earnings</span>
                <span className="font-mono">{formatMoney(netIncome - dividendsPaid)}</span>
              </div>
              <div className="border-t border-indigo-100 my-1"></div>
              <div className="flex justify-between items-center font-extrabold text-indigo-700 bg-indigo-50/50 p-2 rounded-lg">
                <span>Total Liabilities & Equity</span>
                <span className="font-mono">{formatMoney(totalCapital + (netIncome - dividendsPaid) + 8400)}</span>
              </div>
            </div>
          </div>

          {/* CASH FLOW STATEMENT */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-slate-900">
            <h4 className="text-xs uppercase font-bold text-slate-950 tracking-wider flex items-center gap-1.5 font-sans border-b border-slate-100 pb-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Statement of Cash Flows
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center font-bold text-indigo-950">
                <span>Operating Activities</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Cash Receipts from Customers</span>
                <span className="font-mono text-emerald-600">+{formatMoney(totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Cash Payments for Operations</span>
                <span className="font-mono text-rose-500">-{formatMoney(totalExpense)}</span>
              </div>
              <div className="border-t border-slate-100 my-1"></div>
              <div className="flex justify-between items-center font-bold text-indigo-950">
                <span>Investing Activities</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>IP Capitalizations</span>
                <span className="font-mono">{formatMoney(0)}</span>
              </div>
              <div className="border-t border-slate-100 my-1"></div>
              <div className="flex justify-between items-center font-bold text-indigo-950">
                <span>Financing Activities</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Equity Capital Inflow</span>
                <span className="font-mono text-emerald-600">+{formatMoney(capitalInjected)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-3">
                <span>Dividends Distributed</span>
                <span className="font-mono text-rose-500">-{formatMoney(dividendsPaid)}</span>
              </div>
              <div className="border-t border-indigo-100 my-1"></div>
              <div className="flex justify-between items-center font-extrabold text-indigo-700 bg-indigo-50/50 p-2 rounded-lg">
                <span>Net Increase in Cash</span>
                <span className="font-mono">{formatMoney(capitalInjected + totalRevenue - totalExpense - dividendsPaid)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIVIDEND & DISTRIBUTION ENGINE */}
      {activeTab === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-slate-800">
          
          {/* LEFT: TRIGGER ENGINE */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-1 text-slate-900">
            <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans border-b border-slate-100 pb-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Sovereign Dividend Dispatch Controls
            </h4>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Retained Earnings Available</label>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-lg font-bold text-slate-900">
                  {formatMoney(netIncome - dividendsPaid)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Declare Dividend Amount ($)</label>
                <input
                  type="number"
                  value={dividendAmount}
                  onChange={(e) => setDividendAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTriggerDividends}
                disabled={(netIncome - dividendsPaid) < dividendAmount}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Disburse Pro-Rata Dividends
              </button>

              {(netIncome - dividendsPaid) < dividendAmount && (
                <p className="text-[10px] text-rose-500 italic font-medium leading-normal">
                  Warning: Insufficient retained earnings to declare dividend of this size.
                </p>
              )}
            </div>
          </div>

          {/* CENTER/RIGHT: HISTORY & DIVIDEND LOGS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-2 text-slate-900">
            <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Historical Corporate Payout Ledger
            </h4>

            {dividendLogs.length > 0 ? (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {dividendLogs.map((log) => (
                  <div key={log.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 font-sans">{log.description}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{log.date}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold font-sans">
                        {log.status}
                      </span>
                    </div>

                    {log.payouts && (
                      <div className="bg-white border border-slate-100 rounded-lg p-2.5 space-y-2 text-slate-900">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Equity Split Distribution Details</span>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                          {log.payouts.map((p: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-1.5 rounded text-slate-900">
                              <span className="text-slate-600 font-semibold">{p.shareholder} ({p.equityPercent}%)</span>
                              <span className="font-mono font-bold text-slate-900">{formatMoney(p.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-sans">
                No dividends distributed yet. Declare an amount above to disburse capital.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DCF VALUATION & PROJECTIONS */}
      {activeTab === 'forecasting' && (
        <div className="space-y-6 animate-fade-in text-slate-800">
          
          {/* CONTROL CALIBRATIONS & VALUATION STATS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PARAMETERS CONTROL PANEL */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-slate-900">
              <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans border-b border-slate-100 pb-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Valuation Engine Calibration
              </h4>

              <div className="space-y-4 text-xs pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700 font-sans">Quarterly Revenue Growth Rate</span>
                    <span className="font-mono text-indigo-600 font-bold">{growthRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700 font-sans">Quarterly OPEX Growth Rate</span>
                    <span className="font-mono text-indigo-600 font-bold">{opexGrowth}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={opexGrowth}
                    onChange={(e) => setOpexGrowth(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700 font-sans">Weighted Cost of Capital (WACC)</span>
                    <span className="font-mono text-indigo-600 font-bold">{discountRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700 font-sans">EBITDA Terminal Valuation Multiple</span>
                    <span className="font-mono text-indigo-600 font-bold">{terminalMultiple}x</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={terminalMultiple}
                    onChange={(e) => setTerminalMultiple(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* DYNAMIC VALUATION OUTPUTS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-2 text-slate-900">
              <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans border-b border-slate-100 pb-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Dual-Method Business Valuation Models
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-slate-900">
                  <span className="text-[10px] uppercase font-extrabold text-indigo-500 block">Discounted Cash Flow (DCF) Method</span>
                  <div className="text-xl font-extrabold text-slate-950 font-mono">
                    {formatMoney(valModels.dcfValuation)}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal font-sans">
                    Calculated by discounting Year 1-5 projected EBITDA back to present value using WACC of {discountRate}% plus {terminalMultiple}x terminal multiple.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-slate-900">
                  <span className="text-[10px] uppercase font-extrabold text-indigo-500 block">EBITDA Multiple Method</span>
                  <div className="text-xl font-extrabold text-slate-950 font-mono">
                    {formatMoney(valModels.ebitdaValuation)}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal font-sans">
                    Calculated as current annual EBITDA proxy ({formatMoney(ebitda > 0 ? ebitda : 100000)}) multiplied by terminal factor of {terminalMultiple}x.
                  </p>
                </div>
              </div>

              {/* Advanced metrics board info */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                <div className="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-lg text-slate-900">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Terminal Value</span>
                  <span className="font-mono font-bold text-slate-900">{formatMoney(valModels.terminalVal)}</span>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-lg text-slate-900">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Internal Rate of Return</span>
                  <span className="font-mono font-bold text-slate-900">38.4%</span>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-lg text-slate-900">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Net Present Value (NPV)</span>
                  <span className="font-mono font-bold text-slate-900">{formatMoney(valModels.dcfValuation - totalCapital)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-YEAR PROJECTION CHART */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-slate-900">
            <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans border-b border-slate-100 pb-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Dynamic 5-Year Revenue, Expenses, & Cash Position Forecasting
            </h4>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projections}
                  margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="CashPosition" stroke="#6366f1" fillOpacity={1} fill="url(#colorCash)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: STRATEGIC AUTONOMOUS GROWTH & ADVISORY CO-ENGINE */}
      {activeTab === 'advisory' && (
        <AdvisoryCoEngineView 
          totalRevenue={totalRevenue} 
          totalExpense={totalExpense} 
          ebitda={ebitda} 
          netIncome={netIncome} 
          formatMoney={formatMoney} 
        />
      )}

    </div>
  );
}

// Sub-component to prevent file size limits and maintain architectural modularity
function AdvisoryCoEngineView({ 
  totalRevenue, 
  totalExpense, 
  ebitda, 
  netIncome, 
  formatMoney 
}: { 
  totalRevenue: number, 
  totalExpense: number, 
  ebitda: number, 
  netIncome: number, 
  formatMoney: (val: number) => string 
}) {
  // Budget sliders
  const [budget, setBudget] = useState<number>(100000);
  const [allocationPaidSearch, setAllocationPaidSearch] = useState<number>(30); // %
  const [allocationSocial, setAllocationSocial] = useState<number>(40); // %
  const [allocationInfluencers, setAllocationInfluencers] = useState<number>(10); // %
  const [allocationDirectSales, setAllocationDirectSales] = useState<number>(20); // %

  // Scenario picker
  const [growthScenario, setGrowthScenario] = useState<'bootstrap' | 'expansion' | 'blitzscale'>('expansion');

  // Custom simulation triggers
  const [customInsight, setCustomInsight] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);
  const [advices, setAdvices] = useState<any[]>([
    {
      id: 'adv-01',
      date: new Date().toISOString().split('T')[0],
      title: 'Enterprise Multi-Tenant Upsell Vector',
      category: 'Market Entry',
      impact: 'High',
      desc: 'Based on your SaaS subscription margins, upselling current Gold cohort accounts with customized visual brand asset modules is predicted to boost immediate contract values by 22% with $0 acquisition cost.'
    },
    {
      id: 'adv-02',
      date: new Date().toISOString().split('T')[0],
      title: 'Infrastructure Capacity Lock-in',
      category: 'Cost Optimization',
      impact: 'Medium',
      desc: 'Your compute billing currently scales linearly. Migrating to Google Cloud Platform pre-committed contracts will lower G&A OPEX burn rates by 12.4% over the next 18 months.'
    }
  ]);

  // Recalculate percentages to make sure sum = 100%
  const totalAlloc = allocationPaidSearch + allocationSocial + allocationInfluencers + allocationDirectSales;

  // Acquisition calculations (Simulated non-linear formulas for CAC & LTV)
  const calcSimulatedCAC = () => {
    // Paid search: CAC base $50. Social: CAC base $40. Influencers: CAC base $65. Direct Sales: CAC base $350.
    const searchCAC = 50 * (1 + (allocationPaidSearch / 100));
    const socialCAC = 40 * (1 + (allocationSocial / 100) * 0.8);
    const influencerCAC = 65 * (1 + (allocationInfluencers / 100) * 1.5);
    const directSalesCAC = 350 * (1 + (allocationDirectSales / 100) * 0.5);

    const weightedCAC = (
      (allocationPaidSearch * searchCAC) + 
      (allocationSocial * socialCAC) + 
      (allocationInfluencers * influencerCAC) + 
      (allocationDirectSales * directSalesCAC)
    ) / 100;

    return Math.max(15, Math.round(weightedCAC));
  };

  const cac = calcSimulatedCAC();
  const rawAcquired = Math.round(budget / cac);
  const netAcquired = Math.round(rawAcquired * (totalAlloc === 100 ? 1 : 0)); // Only works if sum = 100%

  // Lifetime value (LTV) assumptions
  const avgSubscriptionRevenue = 1500; // $ ARR per client
  const churnRate = 0.08; // 8% annual churn
  const ltv = Math.round(avgSubscriptionRevenue / churnRate);
  const ltvToCacRatio = (ltv / cac).toFixed(1);

  // Growth projection data based on scenario
  const getScenarioData = () => {
    const data = [];
    let currentARR = totalRevenue * 4 || 400000;
    const factor = growthScenario === 'bootstrap' ? 1.08 : (growthScenario === 'expansion' ? 1.25 : 1.45);
    
    for (let m = 1; m <= 12; m++) {
      currentARR = currentARR * (1 + (factor - 1) / 12);
      data.push({
        month: `Month ${m}`,
        ARR: Math.round(currentARR),
        CAC: Math.round(cac * (1 + (m * 0.02)))
      });
    }
    return data;
  };

  const scenarioData = getScenarioData();

  // Handle custom advice request
  const handleGenerateAdvice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInsight.trim()) return;

    setLoadingAdvice(true);
    setTimeout(() => {
      const generated = {
        id: `adv-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        title: customInsight.length > 30 ? `${customInsight.substring(0, 30)}...` : customInsight,
        category: 'Autonomous Strategy',
        impact: Number(ltvToCacRatio) > 4.0 ? 'Critical' : 'Medium',
        desc: `Autonomous intelligence evaluated "${customInsight}". Under WACC constraints of 10% and LTV:CAC of ${ltvToCacRatio}x, we suggest launching a pro-rata sandbox trial targeting this niche with a 30-day conversion limit. This caps initial marketing risk to under $5,000.`
      };
      setAdvices([generated, ...advices]);
      setCustomInsight("");
      setLoadingAdvice(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-slate-800">
      
      {/* BUDGET OPTIMIZATION & VECTOR CALIBRATION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-1 text-slate-900">
        <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
          <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans">
            <Sliders className="w-4 h-4 text-indigo-500 animate-pulse" />
            Strategic Budget Optimizer
          </h4>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            totalAlloc === 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            Alloc: {totalAlloc}% {totalAlloc === 100 ? '(Balanced)' : '(Unbalanced)'}
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Strategic Sandbox Budget</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono font-bold text-slate-950"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Channels Weight Allocation</span>
            
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Paid Search Advertising</span>
                <span className="font-mono">{allocationPaidSearch}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={allocationPaidSearch}
                onChange={(e) => setAllocationPaidSearch(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Social Marketing Channels</span>
                <span className="font-mono">{allocationSocial}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={allocationSocial}
                onChange={(e) => setAllocationSocial(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Influencer Alliances</span>
                <span className="font-mono">{allocationInfluencers}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={allocationInfluencers}
                onChange={(e) => setAllocationInfluencers(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Enterprise Direct Sales</span>
                <span className="font-mono">{allocationDirectSales}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={allocationDirectSales}
                onChange={(e) => setAllocationDirectSales(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 font-sans text-slate-900">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Sovereign Performance Predictions</span>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-600">Predicted Customer CAC:</span>
              <span className="font-mono font-bold text-slate-900">${cac}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-600">Estimated LTV:</span>
              <span className="font-mono font-bold text-slate-900">${ltv}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-600">Customers Acquired:</span>
              <span className="font-mono font-bold text-indigo-600">{netAcquired} new accounts</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-100 pt-1.5 mt-1.5">
              <span className="font-bold text-slate-800">LTV : CAC Ratio:</span>
              <span className={`font-mono font-extrabold ${Number(ltvToCacRatio) >= 3 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {ltvToCacRatio}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGIC INSIGHTS AND PLANNERS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-2 text-slate-900">
        <h4 className="text-xs uppercase font-bold text-slate-900 tracking-wider flex items-center gap-1.5 font-sans border-b border-slate-100 pb-2">
          <Brain className="w-4 h-4 text-indigo-500" />
          Autonomous Advisory & Market Entry Playbooks
        </h4>

        {/* Generate custom advice */}
        <form onSubmit={handleGenerateAdvice} className="flex gap-2 text-xs">
          <input
            type="text"
            placeholder="Type corporate query or entry market (e.g. Expand into Enterprise Health SaaS)..."
            value={customInsight}
            onChange={(e) => setCustomInsight(e.target.value)}
            className="flex-1 p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-indigo-500 font-sans text-slate-900"
          />
          <button
            type="submit"
            disabled={loadingAdvice || !customInsight.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition disabled:opacity-50"
          >
            {loadingAdvice ? 'Calculating...' : 'Query Engine'}
          </button>
        </form>

        {/* Advisory List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advices.map((adv) => (
            <div key={adv.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-bold font-sans">
                  {adv.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  adv.impact === 'High' || adv.impact === 'Critical' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {adv.impact} Impact
                </span>
              </div>
              <h5 className="font-bold text-slate-950 font-sans">{adv.title}</h5>
              <p className="text-slate-600 leading-normal font-sans font-medium">{adv.desc}</p>
              <span className="text-[10px] text-slate-400 font-mono block pt-1 border-t border-slate-100">
                Generated: {adv.date}
              </span>
            </div>
          ))}
        </div>

        {/* SCENARIO LINE GRAPH */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 text-slate-900">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">Interactive Strategic Trajectory (12 Months)</span>
            
            <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold font-sans">
              <button
                onClick={() => setGrowthScenario('bootstrap')}
                className={`px-2 py-1 rounded transition cursor-pointer ${growthScenario === 'bootstrap' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Organic
              </button>
              <button
                onClick={() => setGrowthScenario('expansion')}
                className={`px-2 py-1 rounded transition cursor-pointer ${growthScenario === 'expansion' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Expansion
              </button>
              <button
                onClick={() => setGrowthScenario('blitzscale')}
                className={`px-2 py-1 rounded transition cursor-pointer ${growthScenario === 'blitzscale' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Blitzscale
              </button>
            </div>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scenarioData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="ARR" name="Simulated ARR" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="CAC" name="Projected CAC" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
