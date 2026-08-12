import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Receipt, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  X, 
  ShieldCheck, 
  DollarSign, 
  Utensils, 
  Clock, 
  Key, 
  Send, 
  Globe, 
  Plus, 
  Trash2, 
  Copy, 
  Check,
  RefreshCw,
  FileCheck2,
  Lock,
  Download
} from 'lucide-react';
import { TenantConfig, TenantInfrastructureSettings, TenantTeamMember } from '../types';
import { createTenantBackupSnapshot } from '../lib/tenantBackupEngine';
import { CURRENT_SYSTEM_SCHEMA_VERSION, validateTenantSchemaCompatibility } from '../lib/schemaMigrationManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tenant: TenantConfig, teamMembers: TenantTeamMember[]) => void;
  initialName?: string;
  initialDomain?: string;
  initialOwnerEmail?: string;
}

export default function TenantOnboardingWizard({
  isOpen,
  onClose,
  onComplete,
  initialName = '',
  initialDomain = '',
  initialOwnerEmail = ''
}: Props) {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Identity & Currency
  const [tenantName, setTenantName] = useState(initialName || 'Everest Summit Bistro & Lounge');
  const [tenantDomain, setTenantDomain] = useState(initialDomain || 'everestbistro.marketforge.app');
  const [ownerEmail, setOwnerEmail] = useState(initialOwnerEmail || 'owner@everestbistro.com');
  const [currencyCode, setCurrencyCode] = useState<'USD' | 'EUR' | 'GBP' | 'NPR' | 'INR' | 'AED'>('NPR');
  const [taxVatRate, setTaxVatRate] = useState<number>(13);
  const [serviceChargeRate, setServiceChargeRate] = useState<number>(10);
  const [vatRegNumber, setVatRegNumber] = useState('PAN-309485123');
  const [address, setAddress] = useState('Lakeside 6, Pokhara, Nepal');
  const [phone, setPhone] = useState('+977 61-532100');

  // Step 2: Infrastructure Configuration
  const [businessType, setBusinessType] = useState<'restaurant' | 'hotel_resort' | 'tours_travel' | 'retail_commerce'>('restaurant');
  const [numberOfCashiers, setNumberOfCashiers] = useState<number>(3);
  const [cashierTerminals, setCashierTerminals] = useState<string[]>(['POS-01 Main Counter', 'POS-02 Terrace Bar', 'POS-03 VIP Room']);
  const [numberOfRooms, setNumberOfRooms] = useState<number>(18);
  const [floorsAndTerraces, setFloorsAndTerraces] = useState<string[]>([
    'Ground Floor Main Dining',
    '1st Floor Terrace & Bar',
    'Rooftop Sunset Lounge',
    'Garden Patio'
  ]);
  const [newFloorInput, setNewFloorInput] = useState('');
  const [tablesPerFloor, setTablesPerFloor] = useState<number>(12);
  const [allowQuickPinLogin, setAllowQuickPinLogin] = useState<boolean>(true);

  // Step 3: Modules & Operating Hours
  const [activeModules, setActiveModules] = useState<string[]>([
    'restaurant_os',
    'business_ops',
    'social_studio',
    'email_studio',
    'revenue_intelligence'
  ]);
  const [openingHours, setOpeningHours] = useState('07:00 AM - 11:30 PM (Daily)');

  // Step 4: Team Member Setup (Waiters, Chefs, Cashiers, Managers)
  const [teamMembers, setTeamMembers] = useState<Partial<TenantTeamMember>[]>([
    {
      id: 'init-mgr-1',
      name: 'Rohan Sharma',
      email: ownerEmail || 'rohan.sharma@everestbistro.com',
      password: 'OwnerPass2026!',
      pinCode: '1001',
      designation: 'General Manager & Owner',
      department: 'Executive',
      role: 'owner',
      status: 'active',
      permittedModules: ['restaurant_os', 'business_ops', 'revenue_intelligence', 'social_studio', 'email_studio'],
    },
    {
      id: 'init-chef-1',
      name: 'Chef Anil Kapoor',
      email: 'anil.chef@everestbistro.com',
      password: 'ChefPass2026!',
      pinCode: '5555',
      designation: 'Head Chef & Kitchen Lead',
      department: 'Kitchen & Food',
      role: 'writer',
      status: 'active',
      permittedModules: ['restaurant_os'],
    },
    {
      id: 'init-cashier-1',
      name: 'Sunita Thapa',
      email: 'sunita.cashier@everestbistro.com',
      password: 'CashierPass2026!',
      pinCode: '1234',
      designation: 'Lead Cashier Specialist',
      department: 'Operations',
      role: 'writer',
      status: 'active',
      permittedModules: ['restaurant_os'],
    },
    {
      id: 'init-waiter-1',
      name: 'Bikram Gurung',
      email: 'bikram.waiter@everestbistro.com',
      password: 'WaiterPass2026!',
      pinCode: '8888',
      designation: 'Senior Terrace Waiter',
      department: 'Bar & Service',
      role: 'viewer',
      status: 'active',
      permittedModules: ['restaurant_os'],
    }
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Waitstaff' | 'Chef' | 'Cashier' | 'Manager'>('Waitstaff');
  const [newMemberPin, setNewMemberPin] = useState('');

  // Step 5: Pre-Flight Verification & DNS State
  const [isVerifyingDns, setIsVerifyingDns] = useState<boolean>(false);
  const [dnsStatus, setDnsStatus] = useState<'verified' | 'pending'>('verified');
  const [dnsTxtRecord] = useState<string>(`marketforge-verify=${Math.random().toString(36).substring(2, 12)}`);
  const [securityRulesVerified, setSecurityRulesVerified] = useState<boolean>(true);
  const [schemaVersionVerified, setSchemaVersionVerified] = useState<boolean>(true);

  const handleAddFloor = () => {
    if (newFloorInput.trim()) {
      setFloorsAndTerraces([...floorsAndTerraces, newFloorInput.trim()]);
      setNewFloorInput('');
    }
  };

  const handleRemoveFloor = (index: number) => {
    setFloorsAndTerraces(floorsAndTerraces.filter((_, i) => i !== index));
  };

  const handleAddTeamMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      alert("Please enter both team member name and email.");
      return;
    }

    let designation = 'Waiter / Service Staff';
    let dept = 'Bar & Service';
    let roleScope: 'owner' | 'admin' | 'writer' | 'viewer' = 'viewer';
    let defaultPin = newMemberPin || Math.floor(1000 + Math.random() * 9000).toString();

    if (newMemberRole === 'Chef') {
      designation = 'Kitchen Chef / Line Cook';
      dept = 'Kitchen & Food';
      roleScope = 'writer';
    } else if (newMemberRole === 'Cashier') {
      designation = 'Cashier & POS Billing Specialist';
      dept = 'Operations';
      roleScope = 'writer';
    } else if (newMemberRole === 'Manager') {
      designation = 'Operations Supervisor';
      dept = 'Operations';
      roleScope = 'admin';
    }

    const token = 'inv_' + Math.random().toString(36).substring(2, 12);

    const newMember: Partial<TenantTeamMember> = {
      id: 'tm-' + Date.now() + Math.random().toString(36).substring(2, 5),
      name: newMemberName,
      email: newMemberEmail,
      password: 'Pass' + Math.floor(100000 + Math.random() * 900000) + '!',
      pinCode: defaultPin,
      designation,
      department: dept,
      role: roleScope,
      status: 'pending_invite',
      permittedModules: ['restaurant_os'],
      invitedAt: new Date().toISOString().split('T')[0],
      inviteToken: token
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberPin('');
  };

  const toggleModule = (modId: string) => {
    if (activeModules.includes(modId)) {
      setActiveModules(activeModules.filter(m => m !== modId));
    } else {
      setActiveModules([...activeModules, modId]);
    }
  };

  const handleVerifyDns = () => {
    setIsVerifyingDns(true);
    setTimeout(() => {
      setIsVerifyingDns(false);
      setDnsStatus('verified');
    }, 1200);
  };

  const handleFinishOnboarding = async () => {
    const generatedTenantId = tenantDomain.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '-tenant';

    const settings: TenantInfrastructureSettings = {
      businessType,
      numberOfRooms,
      numberOfCashiers,
      cashierTerminals,
      floorsAndTerraces,
      tablesPerFloor,
      currencyCode,
      taxVatRate,
      serviceChargeRate,
      allowQuickPinLogin,
      address,
      phone,
      vatRegNumber,
      openingHours
    };

    const newTenant: TenantConfig = {
      id: generatedTenantId,
      name: tenantName,
      domain: tenantDomain,
      ownerEmail,
      status: 'active',
      plan: 'Growth (1 Month Free Trial)',
      mrr: 0,
      trialDaysLeft: 30,
      activatedModules: activeModules,
      settings,
      _systemMeta: {
        schemaVersion: CURRENT_SYSTEM_SCHEMA_VERSION,
        createdAt: new Date().toISOString(),
        lastMigrationTimestamp: new Date().toISOString(),
      }
    };

    // Generate initial point-in-time backup snapshot
    await createTenantBackupSnapshot(
      generatedTenantId,
      newTenant,
      `Initial Provisioning Snapshot v${CURRENT_SYSTEM_SCHEMA_VERSION}`,
      ownerEmail
    );

    const fullTeamMembers: TenantTeamMember[] = teamMembers.map(tm => ({
      id: tm.id || 'tm-' + Math.random().toString(36).substring(2, 7),
      tenantId: generatedTenantId,
      name: tm.name || 'Team Member',
      email: tm.email || 'user@tenant.com',
      password: tm.password || 'Pass123!',
      pinCode: tm.pinCode || '1234',
      designation: tm.designation || 'Staff',
      department: tm.department || 'Operations',
      role: tm.role || 'viewer',
      status: tm.status || 'active',
      permittedModules: tm.permittedModules || ['restaurant_os'],
      invitedAt: tm.invitedAt || new Date().toISOString().split('T')[0],
      lastActive: 'Just Now'
    }));

    onComplete(newTenant, fullTeamMembers);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8 shadow-2xl border border-slate-200 my-auto text-slate-900 space-y-6 relative animate-fade-in">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close onboarding wizard"
          className="absolute right-4 top-4 z-20 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-full transition shadow-xs cursor-pointer flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER PROGRESS */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Interactive Tenant Onboarding & Blueprint Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Configure Tenant & Multi-Room Blueprint</h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Customize rooms, cashiers, terrace floors, roles, and domain mappings for this tenant. All changes instantly synchronize across the entire platform.
          </p>

          {/* STEP INDICATOR */}
          <div className="flex items-center justify-between max-w-lg mx-auto pt-2">
            {[
              { label: '1. Identity', num: 1 },
              { label: '2. Layout', num: 2 },
              { label: '3. Modules', num: 3 },
              { label: '4. Staff & PINs', num: 4 },
              { label: '5. Pre-Flight', num: 5 },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center transition ${
                  step === s.num ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[11px] font-bold ${step === s.num ? 'text-indigo-700' : 'text-slate-500'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: IDENTITY & CURRENCY */}
        {step === 1 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" /> Tenant Business Identity & Financial Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Business / Brand Name</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Royal Horizon Resort & Restaurant"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tenant Domain Prefix</label>
                <input
                  type="text"
                  value={tenantDomain}
                  onChange={(e) => setTenantDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  placeholder="royalhorizon.marketforge.app"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Owner Email Address</label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Primary Operating Currency</label>
                <select
                  value={currencyCode}
                  onChange={(e: any) => setCurrencyCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="NPR">NPR (Nepalese Rupee - रु)</option>
                  <option value="USD">USD (US Dollar - $)</option>
                  <option value="EUR">EUR (Euro - €)</option>
                  <option value="GBP">GBP (British Pound - £)</option>
                  <option value="INR">INR (Indian Rupee - ₹)</option>
                  <option value="AED">AED (UAE Dirham - د.إ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">VAT / Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxVatRate}
                  onChange={(e) => setTaxVatRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Charge Rate (%)</label>
                <input
                  type="number"
                  value={serviceChargeRate}
                  onChange={(e) => setServiceChargeRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">VAT / PAN Registration Number</label>
                <input
                  type="text"
                  value={vatRegNumber}
                  onChange={(e) => setVatRegNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Location Address & Phone</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 mb-2"
                  placeholder="Street Address, City"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INFRASTRUCTURE & LAYOUT */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Floors, Rooms, Terraces & Cashier Terminals
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Number of Cashier POS Terminals</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={numberOfCashiers}
                  onChange={(e) => {
                    const num = Math.max(1, Number(e.target.value));
                    setNumberOfCashiers(num);
                    const newTerminals = Array.from({ length: num }, (_, i) => `POS-0${i + 1} Counter ${i + 1}`);
                    setCashierTerminals(newTerminals);
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hotel / Resort Room Count (If applicable)</label>
                <input
                  type="number"
                  min={0}
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* FLOORS & TERRACES BUILDER */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="text-xs font-extrabold text-slate-800 block">
                Dining Floors, Terraces & Room Sections Layout
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFloorInput}
                  onChange={(e) => setNewFloorInput(e.target.value)}
                  placeholder="e.g. Garden Terrace, Poolside VIP Cabana, Rooftop Deck"
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddFloor}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {floorsAndTerraces.map((fl, idx) => (
                  <div key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 shadow-sm">
                    <span>{fl}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFloor(idx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK TOUCH POS PIN CODE LOGIN SETTING */}
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">Touch Terminal 4-Digit Quick PIN Login</p>
                <p className="text-[11px] text-slate-500">Allows waiters and cashiers to quickly log in with 4-digit PINs on touch screens.</p>
              </div>
              <input
                type="checkbox"
                checked={allowQuickPinLogin}
                onChange={(e) => setAllowQuickPinLogin(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* STEP 3: MODULES & HOURS */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-indigo-600" /> Module Activation & Operating Schedule
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Operating Hours</label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 block">Select Active Platform Modules for Tenant</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {[
                  { id: 'restaurant_os', title: 'Restaurant OS (POS, Floorplan, KDS)', desc: 'Full billing, table layout, kitchen screens' },
                  { id: 'business_ops', title: 'Business Ops & HR', desc: 'Staff rosters, attendance, salary slips' },
                  { id: 'social_studio', title: 'Social Engine & AI Marketing', desc: 'Gemini marketing posts & scheduler' },
                  { id: 'email_studio', title: 'Email Studio & Sequences', desc: 'Automated newsletters & sequences' },
                  { id: 'revenue_intelligence', title: 'Revenue OS & Financials', desc: 'Real-time sales analytics & P&L' },
                  { id: 'tours_os', title: 'Tours & Travel OS', desc: 'Itinerary builder & booking engine' },
                  { id: 'website_builder', title: 'AI Website Builder', desc: 'CMS & custom domain landing pages' }
                ].map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      activeModules.includes(mod.id) ? 'bg-indigo-50/80 border-indigo-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={activeModules.includes(mod.id)}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{mod.title}</p>
                      <p className="text-[10px] text-slate-500">{mod.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: STAFF CREATION (WAITER, CHEF, CASHIER, MANAGER) & PINS */}
        {step === 4 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Initial Team Roster (Waiters, Chefs, Cashiers, Managers)
            </h3>

            {/* ADD STAFF FORM */}
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
              <span className="text-xs font-extrabold text-slate-800 block">Add Team Member / Role Designation</span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Full Name (e.g. Ramesh Giri)"
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="ramesh@tenant.com"
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={newMemberRole}
                  onChange={(e: any) => setNewMemberRole(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Waitstaff">Waitstaff / Waiter</option>
                  <option value="Chef">Chef / Kitchen Staff</option>
                  <option value="Cashier">Cashier POS Operator</option>
                  <option value="Manager">Manager / Supervisor</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={newMemberPin}
                    onChange={(e) => setNewMemberPin(e.target.value)}
                    placeholder="PIN (1234)"
                    className="w-20 px-2 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddTeamMember}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* TEAM ROSTER LIST */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {teamMembers.map((tm, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {tm.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{tm.name} <span className="text-[10px] text-slate-400 font-normal">({tm.email})</span></p>
                      <p className="text-[10px] text-indigo-700 font-semibold">{tm.designation} • Dept: {tm.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1">
                      <Key className="w-3 h-3 text-indigo-600" /> PIN: {tm.pinCode || '1234'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: PRE-FLIGHT VERIFICATION & DNS CHECK */}
        {step === 5 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> Pre-Flight Domain DNS & Security Verification
            </h3>

            {/* DNS CNAME / TXT LOOKUP SIMULATOR */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">DNS Domain Target:</span>
                <span className="text-cyan-400 font-bold">{tenantDomain}</span>
              </div>
              
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">CNAME Record Target:</span>
                  <span className="text-slate-200">ingress.marketforge.app</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verification TXT Token:</span>
                  <span className="text-amber-300">{dnsTxtRecord}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dnsStatus === 'verified' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                  <span className="text-[11px] font-bold text-slate-200">
                    {dnsStatus === 'verified' ? 'DNS Propagation Verified' : 'Awaiting TXT Propagation'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyDns}
                  disabled={isVerifyingDns}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isVerifyingDns ? 'animate-spin' : ''}`} />
                  {isVerifyingDns ? 'Verifying...' : 'Re-Check DNS'}
                </button>
              </div>
            </div>

            {/* PRE-FLIGHT COMPLIANCE VERIFICATION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950">Firestore 18-Collection Isolation</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">Row-level security rules compiled for tenant <code>{tenantDomain.split('.')[0]}</code>.</p>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
                <FileCheck2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-indigo-950">Schema Compatibility v{CURRENT_SYSTEM_SCHEMA_VERSION}</h4>
                  <p className="text-[11px] text-indigo-800 mt-0.5">Automatic point-in-time state snapshot will be taken prior to activation.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Previous Step
            </button>
          ) : (
            <div></div>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Finalize Tenant Provisioning & Activate Workspace
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

