import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Key, Mail, Lock, CheckCircle2, 
  XCircle, PieChart, DollarSign, Award, Layers, Search, 
  Filter, Eye, EyeOff, Edit3, Trash2, Building2, ChevronRight, 
  Briefcase, Check, AlertCircle, Copy, Send, Download, Sparkles, Globe, Palette
} from 'lucide-react';
import { TenantTeamMember, InvestorShareDetails } from '../types';
import TenantWhiteLabelCenter from './TenantWhiteLabelCenter';

interface Props {
  tenantId: string;
  tenantName?: string;
  userRole?: string;
  onLoginAsUser?: (member: TenantTeamMember) => void;
  formatCurrency?: (amount: number) => string;
}

export const ALL_AVAILABLE_MODULES = [
  { id: 'social_studio', name: 'Social Engine', desc: 'Social publishing & Gemini AI scheduling' },
  { id: 'email_studio', name: 'Email Studio', desc: 'Cold email sequences & broadcast automation' },
  { id: 'revenue_intelligence', name: 'Revenue OS', desc: 'LTV, MRR analytics & financial intelligence' },
  { id: 'success_center', name: 'Success Academy', desc: 'Knowledge articles & onboarding tutorials' },
  { id: 'restaurant_os', name: 'Restaurant OS', desc: 'POS billing, table floorplan & KDS system' },
  { id: 'tours_os', name: 'Tours & Travels OS', desc: 'Booking engine, itineraries & travel CRM' },
  { id: 'website_builder', name: 'AI Website Builder', desc: 'Visual CMS & multi-page landing creator' },
  { id: 'business_ops', name: 'Business Ops & HR', desc: 'Team directory, payroll & task management' },
  { id: 'omnicore_labs', name: 'OmniCore AI Labs', desc: 'Autonomous AI agents & custom LLM playground' },
  { id: 'super_admin', name: 'Super Admin Portal', desc: 'Multi-tenant management & platform telemetry' }
];

// Initial mock team members for default tenants
const INITIAL_TENANT_MEMBERS: TenantTeamMember[] = [
  // DemoCorp Tenant Members
  {
    id: 'tm-demo-1',
    tenantId: 'demo-tenant',
    name: 'Alexander Vance',
    email: 'alex.vance@democorp.com',
    password: 'DemoPass2026!',
    designation: 'Tenant Administrator & CEO',
    department: 'Executive',
    role: 'owner',
    status: 'active',
    permittedModules: ['social_studio', 'email_studio', 'revenue_intelligence', 'success_center', 'restaurant_os', 'tours_os', 'website_builder', 'business_ops', 'omnicore_labs', 'super_admin'],
    isInvestor: true,
    investorDetails: {
      sharePercentage: 45.0,
      investmentAmount: 450000,
      numberOfShares: 450000,
      shareClass: 'Founder Equity',
      valuationCap: 5000000,
      vestingStatus: 'Fully Vested (Founder Pool)',
      dividendRights: 'Pro-rata dividend distribution & voting rights',
      notes: 'Co-Founder & Chief Executive Officer'
    },
    invitedAt: '2025-01-15',
    lastActive: 'Active Now'
  },
  {
    id: 'tm-demo-2',
    tenantId: 'demo-tenant',
    name: 'Sarah Jenkins',
    email: 's.jenkins@democorp.com',
    password: 'SarahPass123!',
    designation: 'VP of Marketing & Growth',
    department: 'Sales & Marketing',
    role: 'admin',
    status: 'active',
    permittedModules: ['social_studio', 'email_studio', 'website_builder', 'business_ops'],
    isInvestor: false,
    invitedAt: '2025-03-10',
    lastActive: '10 mins ago'
  },
  {
    id: 'tm-demo-3',
    tenantId: 'demo-tenant',
    name: 'Venture Capital Partner',
    email: 'investor@nexuscap.com',
    password: 'InvestorKey2026!',
    designation: 'Lead Angel Investor',
    department: 'Investor Relations',
    role: 'investor',
    status: 'active',
    permittedModules: ['revenue_intelligence', 'business_ops', 'success_center'],
    isInvestor: true,
    investorDetails: {
      sharePercentage: 15.5,
      investmentAmount: 350000,
      numberOfShares: 155000,
      shareClass: 'Series A Preferred',
      valuationCap: 5000000,
      vestingStatus: 'Immediate 100% Preferred Share Ownership',
      dividendRights: '1.5x Liquidation Preference & Board Observer Seat',
      notes: 'Lead Seed & Series A Capital Contributor'
    },
    invitedAt: '2025-04-01',
    lastActive: 'Yesterday'
  },
  {
    id: 'tm-demo-4',
    tenantId: 'demo-tenant',
    name: 'Marcus Brody',
    email: 'm.brody@democorp.com',
    password: 'MarcusPass2026!',
    designation: 'Restaurant Operations Manager',
    department: 'Operations',
    role: 'writer',
    status: 'active',
    permittedModules: ['restaurant_os', 'business_ops'],
    isInvestor: false,
    invitedAt: '2025-05-12',
    lastActive: '2 hrs ago'
  },

  // Sienna Clay Tenant Members
  {
    id: 'tm-sienna-1',
    tenantId: 'sienna-tenant',
    name: 'Evelyn Thorne',
    email: 'evelyn@siennaclay.com',
    password: 'EvelynSienna2026!',
    designation: 'Founder & Managing Director',
    department: 'Executive',
    role: 'owner',
    status: 'active',
    permittedModules: ['social_studio', 'email_studio', 'revenue_intelligence', 'website_builder', 'business_ops'],
    isInvestor: true,
    investorDetails: {
      sharePercentage: 80.0,
      investmentAmount: 120000,
      numberOfShares: 800000,
      shareClass: 'Founder Equity',
      valuationCap: 1500000,
      vestingStatus: 'Fully Vested',
      dividendRights: 'Primary Voting & Capital Distribution',
      notes: 'Owner and Lead Craft Designer'
    },
    invitedAt: '2025-02-01',
    lastActive: '1 hr ago'
  },
  {
    id: 'tm-sienna-2',
    tenantId: 'sienna-tenant',
    name: 'Julian Hayes',
    email: 'julian@angelgroup.org',
    password: 'JulianAngel2026!',
    designation: 'Angel Investor & Advisor',
    department: 'Investor Relations',
    role: 'investor',
    status: 'active',
    permittedModules: ['revenue_intelligence', 'business_ops'],
    isInvestor: true,
    investorDetails: {
      sharePercentage: 10.0,
      investmentAmount: 50000,
      numberOfShares: 100000,
      shareClass: 'Angel Equity',
      valuationCap: 1500000,
      vestingStatus: '2 Year Vesting Schedule',
      dividendRights: 'Pro-rata Angel Dividend Rights',
      notes: 'Strategic Advisor for E-Commerce Expansion'
    },
    invitedAt: '2025-04-15',
    lastActive: '3 days ago'
  }
];

export default function TenantTeamManagement({
  tenantId,
  tenantName = "Active Tenant Workspace",
  userRole = "admin",
  onLoginAsUser,
  formatCurrency = (amt) => `$${amt.toLocaleString()}`
}: Props) {
  // Load members from localStorage or defaults
  const [members, setMembers] = useState<TenantTeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('marketforge_tenant_team_members');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed loading saved team members:", e);
    }
    return INITIAL_TENANT_MEMBERS;
  });

  // Save to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('marketforge_tenant_team_members', JSON.stringify(members));
  }, [members]);

  // Tab view inside team management: 'members' | 'captable' | 'whitelabel'
  const [viewTab, setViewTab] = useState<'members' | 'captable' | 'whitelabel'>('members');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [investorOnly, setInvestorOnly] = useState(false);

  // Modal State for Inviting / Editing Team Member
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('Pass' + Math.floor(100000 + Math.random() * 900000) + '!');
  const [formDesignation, setFormDesignation] = useState('Department Manager');
  const [formDepartment, setFormDepartment] = useState('Operations');
  const [formRoleScope, setFormRoleScope] = useState<'owner' | 'admin' | 'writer' | 'viewer' | 'investor'>('admin');
  const [formPermittedModules, setFormPermittedModules] = useState<string[]>([
    'social_studio', 'email_studio', 'revenue_intelligence', 'business_ops'
  ]);
  const [showPassword, setShowPassword] = useState(false);

  // Investor Share Details State (Optional)
  const [formIsInvestor, setFormIsInvestor] = useState(false);
  const [formSharePct, setFormSharePct] = useState<number>(5.0);
  const [formInvestAmt, setFormInvestAmt] = useState<number>(50000);
  const [formNumShares, setFormNumShares] = useState<number>(50000);
  const [formShareClass, setFormShareClass] = useState<'Common' | 'Series A Preferred' | 'Series B Preferred' | 'Angel Equity' | 'Founder Equity' | 'SAFE Note'>('Common');
  const [formValuationCap, setFormValuationCap] = useState<number>(2000000);
  const [formVestingStatus, setFormVestingStatus] = useState('4 Year Vesting / 1 Year Cliff');
  const [formDividendRights, setFormDividendRights] = useState('Standard Voting & Distribution Rights');
  const [formInvestorNotes, setFormInvestorNotes] = useState('');

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter members by current tenant
  const tenantMembers = members.filter(m => m.tenantId === tenantId);

  // Search filtered
  const filteredMembers = tenantMembers.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const matchesInvestor = !investorOnly || m.isInvestor;

    return matchesSearch && matchesRole && matchesInvestor;
  });

  // Calculate Cap Table Metrics for this tenant
  const investorsList = tenantMembers.filter(m => m.isInvestor && m.investorDetails);
  const totalEquityAllocatedPct = investorsList.reduce((acc, inv) => acc + (inv.investorDetails?.sharePercentage || 0), 0);
  const totalCapitalInvested = investorsList.reduce((acc, inv) => acc + (inv.investorDetails?.investmentAmount || 0), 0);
  const unallocatedEquityPct = Math.max(0, 100 - totalEquityAllocatedPct);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingMemberId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('Pass' + Math.floor(100000 + Math.random() * 900000) + '!');
    setFormDesignation('Operations Manager');
    setFormDepartment('Operations');
    setFormRoleScope('admin');
    setFormPermittedModules(['social_studio', 'email_studio', 'revenue_intelligence', 'business_ops']);
    setFormIsInvestor(false);
    setFormSharePct(5.0);
    setFormInvestAmt(50000);
    setFormNumShares(50000);
    setFormShareClass('Common');
    setFormValuationCap(2000000);
    setFormVestingStatus('4 Year Vesting / 1 Year Cliff');
    setFormDividendRights('Standard Voting Rights');
    setFormInvestorNotes('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (member: TenantTeamMember) => {
    setEditingMemberId(member.id);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPassword(member.password || 'Pass123!');
    setFormDesignation(member.designation);
    setFormDepartment(member.department);
    setFormRoleScope(member.role);
    setFormPermittedModules(member.permittedModules || []);
    setFormIsInvestor(!!member.isInvestor);
    if (member.investorDetails) {
      setFormSharePct(member.investorDetails.sharePercentage);
      setFormInvestAmt(member.investorDetails.investmentAmount);
      setFormNumShares(member.investorDetails.numberOfShares);
      setFormShareClass(member.investorDetails.shareClass);
      setFormValuationCap(member.investorDetails.valuationCap || 2000000);
      setFormVestingStatus(member.investorDetails.vestingStatus || '');
      setFormDividendRights(member.investorDetails.dividendRights || '');
      setFormInvestorNotes(member.investorDetails.notes || '');
    } else {
      setFormSharePct(5.0);
      setFormInvestAmt(50000);
      setFormNumShares(50000);
      setFormShareClass('Common');
      setFormValuationCap(2000000);
      setFormVestingStatus('4 Year Vesting / 1 Year Cliff');
      setFormDividendRights('Standard Voting Rights');
      setFormInvestorNotes('');
    }
    setIsModalOpen(true);
  };

  // Save Team Member Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) {
      alert("Please provide member name and email address.");
      return;
    }

    const investorData: InvestorShareDetails | undefined = formIsInvestor ? {
      sharePercentage: Number(formSharePct),
      investmentAmount: Number(formInvestAmt),
      numberOfShares: Number(formNumShares),
      shareClass: formShareClass,
      valuationCap: Number(formValuationCap),
      vestingStatus: formVestingStatus,
      dividendRights: formDividendRights,
      notes: formInvestorNotes
    } : undefined;

    if (editingMemberId) {
      // Edit existing member
      setMembers(prev => prev.map(m => {
        if (m.id === editingMemberId) {
          return {
            ...m,
            name: formName,
            email: formEmail,
            password: formPassword,
            designation: formDesignation,
            department: formDepartment,
            role: formIsInvestor && formRoleScope === 'viewer' ? 'investor' : formRoleScope,
            permittedModules: formPermittedModules,
            isInvestor: formIsInvestor,
            investorDetails: investorData
          };
        }
        return m;
      }));
      showToast(`Updated permissions & profile for ${formName}`);
    } else {
      // Create new invited member
      const newMember: TenantTeamMember = {
        id: `tm-${Date.now()}`,
        tenantId,
        name: formName,
        email: formEmail,
        password: formPassword,
        designation: formDesignation,
        department: formDepartment,
        role: formIsInvestor && formRoleScope === 'viewer' ? 'investor' : formRoleScope,
        status: 'active',
        permittedModules: formPermittedModules,
        isInvestor: formIsInvestor,
        investorDetails: investorData,
        invitedAt: new Date().toISOString().split('T')[0],
        lastActive: 'Invited Just Now'
      };

      setMembers(prev => [newMember, ...prev]);
      showToast(`Invited ${formName} (${formEmail}) with password & designation permissions!`);
    }

    setIsModalOpen(false);
  };

  // Toggle Module Selection
  const handleToggleModule = (modId: string) => {
    setFormPermittedModules(prev => 
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  // Apply Quick Preset Permissions based on Designation
  const handleApplyPreset = (type: 'all' | 'restaurant' | 'marketing' | 'investor' | 'minimal') => {
    if (type === 'all') {
      setFormPermittedModules(ALL_AVAILABLE_MODULES.map(m => m.id));
    } else if (type === 'restaurant') {
      setFormPermittedModules(['restaurant_os', 'business_ops', 'success_center']);
      setFormDesignation('Restaurant Lead Cashier');
      setFormDepartment('Operations');
    } else if (type === 'marketing') {
      setFormPermittedModules(['social_studio', 'email_studio', 'website_builder', 'business_ops']);
      setFormDesignation('Growth Marketing Specialist');
      setFormDepartment('Sales & Marketing');
    } else if (type === 'investor') {
      setFormPermittedModules(['revenue_intelligence', 'business_ops', 'success_center']);
      setFormDesignation('Investor & Equity Shareholder');
      setFormDepartment('Investor Relations');
      setFormIsInvestor(true);
      setFormRoleScope('investor');
    } else if (type === 'minimal') {
      setFormPermittedModules(['business_ops', 'success_center']);
    }
  };

  // Toggle Member Status (Revoke / Reactivate)
  const handleToggleStatus = (id: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'active' ? 'revoked' : 'active';
        showToast(`Changed status of ${m.name} to ${nextStatus.toUpperCase()}`);
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  // Delete Member
  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from this tenant workspace?`)) {
      setMembers(prev => prev.filter(m => m.id !== id));
      showToast(`Removed ${name} from workspace.`);
    }
  };

  // Copy Login Info
  const handleCopyCredentials = (member: TenantTeamMember) => {
    const credText = `MarketForge Workspace Login Credentials:\nTenant: ${tenantName}\nEmail: ${member.email}\nPassword: ${member.password || 'Set during signup'}\nDesignation: ${member.designation}`;
    navigator.clipboard.writeText(credText);
    showToast(`Copied login credentials for ${member.name} to clipboard!`);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP BANNER & METRICS */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                Tenant HR & Security OS
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {tenantId}</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
              <Users className="w-7 h-7 text-indigo-400" />
              Team Members & Designation Access Engine
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Invite team members by email, configure secure password access, assign role designations with custom feature permissions, and optionally map investor shareholding details.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Invite Team Member
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-0.5">Active Members</span>
            <div className="text-xl font-black text-white flex items-center gap-2">
              {tenantMembers.filter(m => m.status === 'active').length}
              <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                {tenantMembers.length} Total
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-0.5">Designated Admins</span>
            <div className="text-xl font-black text-white">
              {tenantMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-0.5">Mapped Investors</span>
            <div className="text-xl font-black text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              {investorsList.length} Shareholders
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-0.5">Total Capital Invested</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {formatCurrency(totalCapitalInvested)}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW SWITCHER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewTab('members')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewTab === 'members'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            Team Roster & Permissions ({tenantMembers.length})
          </button>
          <button
            onClick={() => setViewTab('captable')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewTab === 'captable'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4 text-amber-600" />
            Cap Table & Investor Ledger ({investorsList.length})
          </button>
          <button
            onClick={() => setViewTab('whitelabel')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewTab === 'whitelabel'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4 text-emerald-600" />
            Tenant White-Labeling & Domain
          </button>
        </div>

        {viewTab === 'members' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, email, designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white"
            >
              <option value="ALL">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="writer">Writer / Staff</option>
              <option value="investor">Investor</option>
            </select>

            <button
              onClick={() => setInvestorOnly(!investorOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                investorOnly
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Investors Only
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: MEMBERS ROSTER & PERMISSIONS */}
      {viewTab === 'members' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className={`bg-white border rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition relative flex flex-col justify-between ${
                member.status === 'revoked' ? 'border-rose-200 bg-rose-50/20 opacity-75' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">{member.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{member.email}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${
                    member.role === 'owner' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    member.role === 'admin' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                    member.role === 'investor' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {member.role}
                  </span>
                </div>

                {/* Designation Badge & Dept */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Designation Title</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {member.department}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {member.designation}
                  </p>
                </div>

                {/* Permitted Modules list */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Assigned Feature Modules ({member.permittedModules?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                    {member.permittedModules?.map((modId) => {
                      const modObj = ALL_AVAILABLE_MODULES.find(m => m.id === modId);
                      return (
                        <span key={modId} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700">
                          {modObj?.name || modId}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Investor Equity Card */}
                {member.isInvestor && member.investorDetails && (
                  <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" /> Shareholder Mapping
                      </span>
                      <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full font-mono font-bold text-[10px]">
                        {member.investorDetails.sharePercentage}% Share
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Invested Capital:</span>
                        <span className="font-extrabold text-slate-900 font-mono">
                          {formatCurrency(member.investorDetails.investmentAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Share Class:</span>
                        <span className="font-bold text-amber-900">
                          {member.investorDetails.shareClass}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyCredentials(member)}
                    title="Copy Email & Password Credentials"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                  </button>

                  {onLoginAsUser && (
                    <button
                      onClick={() => onLoginAsUser(member)}
                      title="Log In / Switch Session to this Member"
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      Login As &rarr;
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(member)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition cursor-pointer"
                    title="Edit Designation & Permissions"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(member.id)}
                    className={`p-1.5 rounded-xl transition cursor-pointer ${
                      member.status === 'active' 
                        ? 'text-emerald-600 hover:text-rose-600 hover:bg-rose-50' 
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={member.status === 'active' ? 'Revoke Access' : 'Reactivate Access'}
                  >
                    {member.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDeleteMember(member.id, member.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-base">No team members match your filter</h4>
              <p className="text-xs text-slate-500">Try adjusting your search keywords or invite a new team member to this tenant.</p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition cursor-pointer inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Invite First Team Member
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAP TABLE & INVESTOR LEDGER */}
      {viewTab === 'captable' && (
        <div className="space-y-6">
          {/* Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Allocated Equity</span>
              <div className="text-3xl font-black text-slate-900 font-mono">
                {totalEquityAllocatedPct.toFixed(1)}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, totalEquityAllocatedPct)}%` }} />
                <div className="bg-slate-200 h-full" style={{ width: `${Math.max(0, 100 - totalEquityAllocatedPct)}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 flex justify-between pt-1">
                <span>Allocated: {totalEquityAllocatedPct.toFixed(1)}%</span>
                <span>Unallocated Pool: {unallocatedEquityPct.toFixed(1)}%</span>
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Capital Raised</span>
              <div className="text-3xl font-black text-emerald-600 font-mono">
                {formatCurrency(totalCapitalInvested)}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Across {investorsList.length} mapped equity shareholders & strategic angels.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-md space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100 block">Cap Table Health</span>
              <div className="text-3xl font-black flex items-center gap-2">
                <Award className="w-8 h-8 text-amber-200" />
                Verified
              </div>
              <p className="text-xs text-amber-100">
                All equity allocations and dividend preferences are mapped to authenticated member accounts.
              </p>
            </div>
          </div>

          {/* Investor Shareholder Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-amber-600" /> Tenant Shareholder Register & Cap Table
                </h3>
                <p className="text-xs text-slate-500">Detailed equity percentages, capital contribution, share classes, and vesting schedules.</p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" /> Add Investor / Shareholder
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Shareholder / Investor</th>
                    <th className="p-4">Share Class</th>
                    <th className="p-4 text-right">Equity %</th>
                    <th className="p-4 text-right">Capital Invested</th>
                    <th className="p-4 text-right">Issued Shares</th>
                    <th className="p-4">Valuation Cap</th>
                    <th className="p-4">Vesting & Rights</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {investorsList.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">
                            {inv.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-slate-900 font-bold">{inv.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{inv.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                          {inv.investorDetails?.shareClass}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black font-mono text-sm text-indigo-700">
                        {inv.investorDetails?.sharePercentage}%
                      </td>
                      <td className="p-4 text-right font-extrabold font-mono text-emerald-700">
                        {formatCurrency(inv.investorDetails?.investmentAmount || 0)}
                      </td>
                      <td className="p-4 text-right font-mono text-slate-700">
                        {(inv.investorDetails?.numberOfShares || 0).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        {formatCurrency(inv.investorDetails?.valuationCap || 0)}
                      </td>
                      <td className="p-4 text-[11px]">
                        <p className="font-bold text-slate-800">{inv.investorDetails?.vestingStatus}</p>
                        <p className="text-[10px] text-slate-500">{inv.investorDetails?.dividendRights}</p>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenEditModal(inv)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Edit Equity
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Unallocated Founder Pool Row */}
                  <tr className="bg-slate-50/50 font-bold border-t-2 border-slate-200">
                    <td className="p-4 text-slate-500">Unallocated Treasury & Founder Reserve</td>
                    <td className="p-4"><span className="text-[10px] text-slate-400">Reserve Pool</span></td>
                    <td className="p-4 text-right font-mono text-slate-600">{unallocatedEquityPct.toFixed(1)}%</td>
                    <td className="p-4 text-right text-slate-400">-</td>
                    <td className="p-4 text-right text-slate-400">-</td>
                    <td className="p-4 text-slate-400">-</td>
                    <td className="p-4 text-[10px] text-slate-400">Reserved for future funding rounds</td>
                    <td className="p-4 text-center text-slate-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHITE-LABELING & DOMAIN CENTER */}
      {viewTab === 'whitelabel' && (
        <TenantWhiteLabelCenter tenantId={tenantId} />
      )}

      {/* MODAL: INVITE / EDIT TEAM MEMBER & DESIGNATION ACCESS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-2xl w-full shadow-2xl space-y-6 border border-slate-200 animate-fade-in text-slate-900 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">
                  Tenant Access & Designation Control
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                  {editingMemberId ? 'Edit Team Member Permissions' : 'Invite Team Member to Workspace'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Preset Quick Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block">
                  Quick Access Preset
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('all')}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    ⚡ Full Admin Access
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('restaurant')}
                    className="px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    🍽️ Restaurant Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('marketing')}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    📣 Growth & Marketing
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('investor')}
                    className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    🏆 Investor & Shareholder
                  </button>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Member Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address (Login ID) *</label>
                  <input
                    type="email"
                    required
                    placeholder="s.jenkins@company.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Member Login Password *</label>
                    <button
                      type="button"
                      onClick={() => setFormPassword('Pass' + Math.floor(100000 + Math.random() * 900000) + '!')}
                      className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Generate Random
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role Scope Authority</label>
                  <select
                    value={formRoleScope}
                    onChange={(e) => setFormRoleScope(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="owner">Owner (Full Workspace Control)</option>
                    <option value="admin">Admin (Managerial Control)</option>
                    <option value="writer">Writer / Staff (Operator)</option>
                    <option value="viewer">Viewer (Read-Only)</option>
                    <option value="investor">Investor (Financial & Cap Table Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Designation Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Head of Operations / POS Lead"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance & Accounting</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Kitchen / Service">Kitchen & Restaurant Service</option>
                    <option value="Investor Relations">Investor Relations</option>
                  </select>
                </div>
              </div>

              {/* Module Feature Permissions Grid */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Permitted Feature Modules ({formPermittedModules.length} Selected)
                  </label>
                  <span className="text-[10px] text-slate-400">Unchecked modules will be restricted</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {ALL_AVAILABLE_MODULES.map((mod) => {
                    const isChecked = formPermittedModules.includes(mod.id);
                    return (
                      <label 
                        key={mod.id} 
                        onClick={() => handleToggleModule(mod.id)}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition select-none ${
                          isChecked 
                            ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <p className="font-extrabold">{mod.name}</p>
                          <p className="text-[10px] text-slate-500 font-normal leading-tight">{mod.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Optional Investor Mapping & Share Details */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-extrabold text-xs text-amber-950">Map as Investor / Equity Shareholder (Optional)</p>
                      <p className="text-[10px] text-amber-800">Assign shareholding percentage, capital invested, and cap table rights.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsInvestor}
                    onChange={(e) => setFormIsInvestor(e.target.checked)}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>

                {formIsInvestor && (
                  <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-1">Equity Share %</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={formSharePct}
                          onChange={(e) => setFormSharePct(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-1">Capital Invested ($)</label>
                        <input
                          type="number"
                          step="1000"
                          value={formInvestAmt}
                          onChange={(e) => setFormInvestAmt(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-1">Share Class</label>
                        <select
                          value={formShareClass}
                          onChange={(e) => setFormShareClass(e.target.value as any)}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs font-bold bg-white"
                        >
                          <option value="Common">Common Stock</option>
                          <option value="Series A Preferred">Series A Preferred</option>
                          <option value="Series B Preferred">Series B Preferred</option>
                          <option value="Angel Equity">Angel Equity</option>
                          <option value="Founder Equity">Founder Equity</option>
                          <option value="SAFE Note">SAFE Note</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-1">Valuation Cap ($)</label>
                        <input
                          type="number"
                          step="10000"
                          value={formValuationCap}
                          onChange={(e) => setFormValuationCap(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-1">Number of Shares</label>
                        <input
                          type="number"
                          value={formNumShares}
                          onChange={(e) => setFormNumShares(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-amber-900 block mb-1">Vesting Status</label>
                        <input
                          type="text"
                          value={formVestingStatus}
                          onChange={(e) => setFormVestingStatus(e.target.value)}
                          placeholder="e.g. 4 Year Vesting / 1 Year Cliff"
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-amber-900 block mb-1">Dividend Rights & Notes</label>
                      <input
                        type="text"
                        value={formDividendRights}
                        onChange={(e) => setFormDividendRights(e.target.value)}
                        placeholder="e.g. Pro-rata distribution rights & voting preferences"
                        className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {editingMemberId ? 'Save Member Changes' : 'Invite & Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
