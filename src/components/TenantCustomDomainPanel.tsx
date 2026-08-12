import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Lock, 
  ShieldCheck, 
  Server, 
  Plus, 
  Trash2, 
  AlertCircle,
  ExternalLink,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BookOpen,
  Info
} from 'lucide-react';

export interface CustomDomainRecord {
  id: string;
  tenantId: string;
  domain: string;
  dnsStatus: 'verified' | 'unverified' | 'pending' | 'error';
  sslStatus: 'active' | 'expired' | 'pending_dns' | 'failed';
  txtChallenge: string;
  ipAddress: string;
  cnameTarget: string;
  createdAt: string;
  verifiedAt?: string;
  errorMessage?: string;
}

interface TenantCustomDomainPanelProps {
  tenantId: string;
  tenantName?: string;
  onDomainUpdated?: (domain: string) => void;
}

export default function TenantCustomDomainPanel({
  tenantId,
  tenantName = 'Enterprise Workspace',
  onDomainUpdated
}: TenantCustomDomainPanelProps) {
  const [domainList, setDomainList] = useState<CustomDomainRecord[]>([]);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedTxt, setCopiedTxt] = useState<string | null>(null);
  const [simNodes, setSimNodes] = useState<Array<{ name: string; status: 'pending' | 'ok' | 'fail'; latency?: number }>>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [activeInstructionStep, setActiveInstructionStep] = useState<number | null>(1);

  // Load tenant domains from localStorage
  useEffect(() => {
    loadTenantDomains();
  }, [tenantId]);

  const loadTenantDomains = () => {
    const storedDomainsRaw = localStorage.getItem('marketforge_domain_records');
    let allRecords: any[] = [];
    if (storedDomainsRaw) {
      try {
        allRecords = JSON.parse(storedDomainsRaw);
      } catch (e) {
        console.error("Error reading domain records", e);
      }
    }

    const filtered = allRecords.filter((d: any) => d.tenantId === tenantId);
    if (filtered.length > 0) {
      setDomainList(filtered.map(formatDomainRecord));
    } else {
      // Create initial pending default domain for tenant
      const initialRecord: CustomDomainRecord = {
        id: `dom_${tenantId}_1`,
        tenantId,
        domain: `${tenantId}.mybrand.com`,
        dnsStatus: 'pending',
        sslStatus: 'pending_dns',
        txtChallenge: `marketforge-challenge=${Math.random().toString(36).substring(2, 18)}`,
        ipAddress: '199.195.143.10',
        cnameTarget: 'cname.marketforge.scamspike.com',
        createdAt: new Date().toISOString()
      };
      const updatedAll = [...allRecords, initialRecord];
      localStorage.setItem('marketforge_domain_records', JSON.stringify(updatedAll));
      setDomainList([initialRecord]);
    }
  };

  const formatDomainRecord = (raw: any): CustomDomainRecord => ({
    id: raw.id || `dom_${Math.random().toString(36).substring(2, 9)}`,
    tenantId: raw.tenantId || tenantId,
    domain: raw.domain || 'custom.domain.com',
    dnsStatus: raw.dnsStatus || 'pending',
    sslStatus: raw.sslStatus || 'pending_dns',
    txtChallenge: raw.txtChallenge || `marketforge-challenge=${Math.random().toString(36).substring(2, 18)}`,
    ipAddress: raw.ipAddress || '199.195.143.10',
    cnameTarget: raw.cnameTarget || 'cname.marketforge.scamspike.com',
    createdAt: raw.createdAt || new Date().toISOString(),
    verifiedAt: raw.verifiedAt,
    errorMessage: raw.errorMessage
  });

  const saveAllDomains = (updatedTenantRecords: CustomDomainRecord[]) => {
    const storedDomainsRaw = localStorage.getItem('marketforge_domain_records');
    let allRecords: any[] = storedDomainsRaw ? JSON.parse(storedDomainsRaw) : [];
    
    // Replace current tenant's records
    const otherTenantsRecords = allRecords.filter((d: any) => d.tenantId !== tenantId);
    const combined = [...otherTenantsRecords, ...updatedTenantRecords];
    
    localStorage.setItem('marketforge_domain_records', JSON.stringify(combined));
    setDomainList(updatedTenantRecords);

    // If there is a verified domain, sync back to tenant config
    const verified = updatedTenantRecords.find(d => d.dnsStatus === 'verified');
    if (verified && onDomainUpdated) {
      onDomainUpdated(verified.domain);
    }
  };

  const handleAddCustomDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;

    setIsSubmitting(true);
    let cleaned = newDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    const newRecord: CustomDomainRecord = {
      id: `dom_${Math.random().toString(36).substring(2, 9)}`,
      tenantId,
      domain: cleaned,
      dnsStatus: 'pending', // Explicit 'Pending DNS Verification' status
      sslStatus: 'pending_dns',
      txtChallenge: `marketforge-challenge=${Math.random().toString(36).substring(2, 18)}`,
      ipAddress: '199.195.143.10',
      cnameTarget: 'cname.marketforge.scamspike.com',
      createdAt: new Date().toISOString()
    };

    const updated = [newRecord, ...domainList];
    saveAllDomains(updated);
    setNewDomainInput('');
    setIsSubmitting(false);
  };

  const handleVerifyDns = (record: CustomDomainRecord, forceFail: boolean = false) => {
    setVerifyingId(record.id);

    const nodes = [
      { name: 'US East (New York DNS)', status: 'pending' as const },
      { name: 'US West (San Francisco DNS)', status: 'pending' as const },
      { name: 'Europe (Frankfurt Edge)', status: 'pending' as const },
      { name: 'Asia Pacific (Tokyo Edge)', status: 'pending' as const },
      { name: 'Asia Pacific (Singapore Edge)', status: 'pending' as const }
    ];

    setSimNodes(nodes);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < nodes.length) {
        setSimNodes(prev => {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            status: forceFail && idx === 3 ? 'fail' : 'ok',
            latency: Math.floor(Math.random() * 40) + 15
          };
          return next;
        });
        idx++;
      } else {
        clearInterval(interval);
        setVerifyingId(null);

        // Update status based on outcome
        const updated = domainList.map(d => {
          if (d.id === record.id) {
            if (forceFail) {
              return {
                ...d,
                dnsStatus: 'error' as const,
                sslStatus: 'failed' as const,
                errorMessage: 'DNS lookup timed out or CNAME target mismatch at Tokyo edge.'
              };
            }
            return {
              ...d,
              dnsStatus: 'verified' as const,
              sslStatus: 'active' as const,
              verifiedAt: new Date().toISOString(),
              errorMessage: undefined
            };
          }
          return d;
        });

        saveAllDomains(updated);
        setSimNodes([]);
      }
    }, 300);
  };

  const handleDeleteDomain = (id: string) => {
    if (window.confirm("Are you sure you want to remove this custom domain configuration?")) {
      const updated = domainList.filter(d => d.id !== id);
      saveAllDomains(updated);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxt(key);
    setTimeout(() => setCopiedTxt(null), 2000);
  };

  return (
    <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">
              <Globe className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-wider">
              Tenant Custom Domain Engine
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white">Custom Domain Name Configuration</h3>
          <p className="text-xs text-slate-300">
            Input custom domain names (e.g., <code className="text-indigo-300 font-mono">shop.yourbrand.com</code>) to map directly to your workspace.
          </p>
        </div>

        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="px-4 py-2 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          {showInstructions ? 'Hide DNS Instructions' : 'View DNS Setup Instructions'}
          {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* INSTRUCTIONS ACCORDION / STEP-BY-STEP POP-OVER PANEL */}
      {showInstructions && (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl text-slate-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Step-by-Step DNS Configuration Guide</span>
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold">
                    GoDaddy, Namecheap & Cloudflare
                  </span>
                </h4>
                <p className="text-xs text-slate-400">Follow these 4 simple steps to point your custom domain or subdomain to MarketForge.</p>
              </div>
            </div>
          </div>

          {/* ACCORDION STEPS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            
            {/* STEP 1 */}
            <div 
              onClick={() => setActiveInstructionStep(activeInstructionStep === 1 ? null : 1)}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                activeInstructionStep === 1 
                  ? 'bg-indigo-950/70 border-indigo-500 text-white ring-1 ring-indigo-500/50' 
                  : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center border border-indigo-500/30">
                  1
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-300">REGISTRAR</span>
              </div>
              <h5 className="text-xs font-bold mb-1">Open Domain Registrar</h5>
              <p className="text-[11px] text-slate-400 leading-snug">
                Log in to GoDaddy, Namecheap, Cloudflare, or Route53 and open DNS Management.
              </p>
            </div>

            {/* STEP 2 */}
            <div 
              onClick={() => setActiveInstructionStep(activeInstructionStep === 2 ? null : 2)}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                activeInstructionStep === 2 
                  ? 'bg-indigo-950/70 border-indigo-500 text-white ring-1 ring-indigo-500/50' 
                  : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                  2
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-300">CNAME / A RECORD</span>
              </div>
              <h5 className="text-xs font-bold mb-1">Add Host Pointer</h5>
              <p className="text-[11px] text-slate-400 leading-snug">
                For subdomains add CNAME to <code className="text-indigo-300">cname.marketforge.scamspike.com</code> or A Record to <code className="text-indigo-300">199.195.143.10</code>.
              </p>
            </div>

            {/* STEP 3 */}
            <div 
              onClick={() => setActiveInstructionStep(activeInstructionStep === 3 ? null : 3)}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                activeInstructionStep === 3 
                  ? 'bg-indigo-950/70 border-indigo-500 text-white ring-1 ring-indigo-500/50' 
                  : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/30">
                  3
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-300">TXT TOKEN</span>
              </div>
              <h5 className="text-xs font-bold mb-1">Add TXT Challenge</h5>
              <p className="text-[11px] text-slate-400 leading-snug">
                Add TXT Record <code className="text-amber-300">_marketforge-challenge</code> with your unique token for security verification.
              </p>
            </div>

            {/* STEP 4 */}
            <div 
              onClick={() => setActiveInstructionStep(activeInstructionStep === 4 ? null : 4)}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                activeInstructionStep === 4 
                  ? 'bg-indigo-950/70 border-indigo-500 text-white ring-1 ring-indigo-500/50' 
                  : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs font-bold flex items-center justify-center border border-teal-500/30">
                  4
                </span>
                <span className="text-[10px] font-mono font-bold text-teal-300">PROPAGATE</span>
              </div>
              <h5 className="text-xs font-bold mb-1">Verify Status</h5>
              <p className="text-[11px] text-slate-400 leading-snug">
                Click <strong className="text-white">Re-Verify DNS Status</strong>. Status updates to Green Active badge upon edge resolution.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* INPUT FORM TO ADD CUSTOM DOMAIN */}
      <form onSubmit={handleAddCustomDomain} className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-3">
        <label className="block text-xs font-bold text-slate-200">
          Enter Your Custom Domain Name:
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={newDomainInput}
              onChange={(e) => setNewDomainInput(e.target.value)}
              placeholder="e.g. store.acmecorp.com or www.brand.com"
              className="w-full bg-slate-950 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-teal-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newDomainInput.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg border border-teal-400/30 flex items-center justify-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Custom Domain
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          New domains will be placed in <strong className="text-amber-400">Pending DNS Verification</strong> status until CNAME / A Records propagate.
        </p>
      </form>

      {/* DOMAIN RECORDS LIST */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          Configured Domain Name Mappings & Edge Status
        </h4>

        {domainList.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-white/10 rounded-2xl text-slate-400 text-xs">
            No custom domains added yet. Input a domain above to begin DNS verification.
          </div>
        ) : (
          <div className="space-y-4">
            {domainList.map((rec) => {
              const isPending = rec.dnsStatus === 'pending' || rec.dnsStatus === 'unverified';
              const isVerified = rec.dnsStatus === 'verified';
              const isError = rec.dnsStatus === 'error';

              return (
                <div
                  key={rec.id}
                  className={`border rounded-2xl p-5 space-y-4 transition ${
                    isVerified
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isPending
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  {/* TOP CARD BAR WITH VISUAL STATUS INDICATORS */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow ${
                        isVerified 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : isPending 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-extrabold text-white text-sm font-mono">{rec.domain}</h5>
                          
                          {/* VISUAL STATUS INDICATORS (GREEN / YELLOW / RED) */}
                          {isVerified && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Active (Verified)
                            </span>
                          )}

                          {isPending && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              Pending DNS Verification
                            </span>
                          )}

                          {isError && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow">
                              <span className="w-2 h-2 rounded-full bg-rose-400" />
                              Error (DNS Misconfigured)
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Added: {new Date(rec.createdAt).toLocaleDateString()}
                          {rec.verifiedAt && ` • Verified: ${new Date(rec.verifiedAt).toLocaleTimeString()}`}
                        </p>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleVerifyDns(rec, false)}
                        disabled={verifyingId === rec.id}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow ${
                          isPending
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : isError
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${verifyingId === rec.id ? 'animate-spin' : ''}`} />
                        {verifyingId === rec.id ? 'Checking DNS Nodes...' : isPending ? 'Re-Verify DNS Status' : isError ? 'Retry DNS Resolution' : 'Check Health'}
                      </button>

                      {/* SIMULATE ERROR BUTTON FOR TESTING */}
                      <button
                        onClick={() => handleVerifyDns(rec, true)}
                        disabled={verifyingId === rec.id}
                        className="px-2.5 py-2 text-[10px] text-slate-400 hover:text-rose-300 bg-slate-900 border border-white/10 rounded-xl hover:bg-rose-950/40 transition cursor-pointer"
                        title="Simulate DNS failure to test Error red badge status"
                      >
                        Test Fail
                      </button>

                      <button
                        onClick={() => handleDeleteDomain(rec.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition cursor-pointer"
                        title="Remove Domain"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ERROR BANNER IF DNS FAILED */}
                  {isError && rec.errorMessage && (
                    <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-white font-bold">DNS Resolution Error:</strong>
                        <p className="text-[11px] text-rose-300 font-mono mt-0.5">{rec.errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* DNS CONFIGURATION INSTRUCTIONS BOX */}
                  <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-sans text-xs font-bold text-teal-300 uppercase">
                        Required DNS Host Records
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        Configure these records at your DNS registrar (GoDaddy, Namecheap, Cloudflare)
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      {/* CNAME RECORD */}
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-slate-400">Type:</span> <strong className="text-emerald-400">CNAME</strong>
                          <span className="text-slate-500 mx-2">|</span>
                          <span className="text-slate-400">Host / Name:</span> <strong className="text-white">www</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Points To:</span>
                          <strong className="text-indigo-300">{rec.cnameTarget}</strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rec.cnameTarget, `cname_${rec.id}`)}
                            className="p-1 hover:text-white text-slate-400 transition"
                            title="Copy CNAME"
                          >
                            {copiedTxt === `cname_${rec.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* A RECORD */}
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-slate-400">Type:</span> <strong className="text-emerald-400">A Record</strong>
                          <span className="text-slate-500 mx-2">|</span>
                          <span className="text-slate-400">Host / Name:</span> <strong className="text-white">@</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Points To IP:</span>
                          <strong className="text-indigo-300">{rec.ipAddress}</strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rec.ipAddress, `ip_${rec.id}`)}
                            className="p-1 hover:text-white text-slate-400 transition"
                            title="Copy IP"
                          >
                            {copiedTxt === `ip_${rec.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* TXT CHALLENGE RECORD */}
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-slate-400">Type:</span> <strong className="text-amber-400">TXT Verification</strong>
                            <span className="text-slate-500 mx-2">|</span>
                            <span className="text-slate-400">Host:</span> <strong className="text-white">_marketforge-challenge</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rec.txtChallenge, `txt_${rec.id}`)}
                            className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-sans font-bold"
                          >
                            {copiedTxt === `txt_${rec.id}` ? 'Copied Token!' : 'Copy Token'}
                          </button>
                        </div>
                        <div className="p-1.5 bg-black/60 rounded text-[10px] text-slate-300 break-all border border-white/5">
                          {rec.txtChallenge}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NODE SIMULATION STATUS WHEN VERIFYING */}
                  {verifyingId === rec.id && simNodes.length > 0 && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-white/10 space-y-2 font-mono text-[11px]">
                      <p className="font-bold text-amber-300 flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        Querying Global DNS Authoritative Servers...
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                        {simNodes.map((node, i) => (
                          <div key={i} className="flex items-center justify-between p-1 bg-slate-900 rounded">
                            <span className="text-slate-400">{node.name}</span>
                            {node.status === 'ok' ? (
                              <span className="text-emerald-400 font-bold">✓ Resolved ({node.latency}ms)</span>
                            ) : (
                              <span className="text-amber-400 animate-pulse">Resolving...</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
