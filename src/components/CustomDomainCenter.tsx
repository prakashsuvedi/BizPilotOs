import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Lock, 
  ShieldCheck, 
  Cpu, 
  ExternalLink,
  Plus,
  Trash2,
  Sliders,
  Radio,
  Server
} from 'lucide-react';
import { clientDb } from '../lib/firebase';

interface DomainRecord {
  id: string;
  tenantId: string;
  domain: string;
  routingMode: 'A' | 'B' | 'C'; // A: path-based, B: subdomain, C: custom domain
  dnsStatus: 'verified' | 'unverified' | 'pending';
  sslStatus: 'active' | 'expired' | 'pending_dns';
  cloudflareState: 'proxied' | 'dns_only' | 'none';
  txtChallenge: string;
  ipAddress: string;
  certificateIssuer: string;
  expiryDate: string;
  autoRenew: boolean;
  createdAt: string;
}

export default function CustomDomainCenter() {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newRoutingMode, setNewRoutingMode] = useState<'A' | 'B' | 'C'>('C');
  
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeDomainDetails, setActiveDomainDetails] = useState<DomainRecord | null>(null);
  const [propagationSim, setPropagationSim] = useState<Array<{ node: string; status: 'ok' | 'fail' | 'checking'; ip?: string; latency?: number }>>([]);
  const [isCopying, setIsCopying] = useState<string | null>(null);

  // Load domains and active tenants
  useEffect(() => {
    loadDomainsAndTenants();
  }, []);

  const loadDomainsAndTenants = () => {
    // Tenants from local storage list
    const saTenantsRaw = localStorage.getItem('marketforge_sa_tenants');
    let tenantsArray: any[] = [];
    if (saTenantsRaw) {
      try {
        tenantsArray = JSON.parse(saTenantsRaw);
        setTenantsList(tenantsArray);
      } catch (e) {
        console.error("Error reading sa tenants", e);
      }
    }

    // Load or initialize Domain list
    const persistedDomains = localStorage.getItem('marketforge_domain_records');
    if (persistedDomains) {
      try {
        setDomains(JSON.parse(persistedDomains));
      } catch (e) {
        bootstrapDefaultDomains(tenantsArray);
      }
    } else {
      bootstrapDefaultDomains(tenantsArray);
    }
  };

  const bootstrapDefaultDomains = (tenants: any[]) => {
    const defaults: DomainRecord[] = [
      {
        id: 'dom-1',
        tenantId: 'demo-tenant',
        domain: 'marketforge.scamspike.com/demo-tenant',
        routingMode: 'A',
        dnsStatus: 'verified',
        sslStatus: 'active',
        cloudflareState: 'proxied',
        txtChallenge: 'marketforge-verification-challenge=920ajshd1029as81',
        ipAddress: '199.195.143.10',
        certificateIssuer: "Let's Encrypt Authority X3",
        expiryDate: new Date(Date.now() + 82 * 24 * 3600 * 1000).toISOString(),
        autoRenew: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'dom-2',
        tenantId: 'suskriti',
        domain: 'suskriti.marketforge.scamspike.com',
        routingMode: 'B',
        dnsStatus: 'verified',
        sslStatus: 'active',
        cloudflareState: 'proxied',
        txtChallenge: 'marketforge-verification-challenge=ab928038asjdoq1',
        ipAddress: '199.195.143.10',
        certificateIssuer: "Let's Encrypt Authority X3",
        expiryDate: new Date(Date.now() + 44 * 24 * 3600 * 1000).toISOString(),
        autoRenew: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'dom-3',
        tenantId: 'siennaclay',
        domain: 'siennaclay.com',
        routingMode: 'C',
        dnsStatus: 'verified',
        sslStatus: 'active',
        cloudflareState: 'none',
        txtChallenge: 'marketforge-verification-challenge=82903hd823h8dhq8',
        ipAddress: '199.195.143.10',
        certificateIssuer: "DigiCert TLS RSA SHA256",
        expiryDate: new Date(Date.now() + 195 * 24 * 3600 * 1000).toISOString(),
        autoRenew: true,
        createdAt: new Date().toISOString()
      }
    ];

    // If there are other tenants in list not represented, we bootstrap default mappings for them
    tenants.forEach(t => {
      const exists = defaults.some(d => d.tenantId === t.id);
      if (!exists) {
        defaults.push({
          id: `dom_${t.id}`,
          tenantId: t.id,
          domain: t.domain || `${t.id}.marketforge.scamspike.com`,
          routingMode: t.domain?.includes('/') ? 'A' : (t.domain?.includes('marketforge') ? 'B' : 'C'),
          dnsStatus: 'verified',
          sslStatus: 'active',
          cloudflareState: 'proxied',
          txtChallenge: `marketforge-verification-challenge=${Math.random().toString(36).substr(2, 16)}`,
          ipAddress: '199.195.143.10',
          certificateIssuer: "Let's Encrypt Authority X3",
          expiryDate: new Date(Date.now() + 89 * 24 * 3600 * 1000).toISOString(),
          autoRenew: true,
          createdAt: new Date().toISOString()
        });
      }
    });

    setDomains(defaults);
    localStorage.setItem('marketforge_domain_records', JSON.stringify(defaults));
  };

  const saveDomains = (updated: DomainRecord[]) => {
    setDomains(updated);
    localStorage.setItem('marketforge_domain_records', JSON.stringify(updated));
  };

  // Switch routing mode for a domain record
  const handleSwitchRoutingMode = (id: string, mode: 'A' | 'B' | 'C') => {
    const updated = domains.map(d => {
      if (d.id === id) {
        let domainStr = d.domain;
        const tenant = tenantsList.find(t => t.id === d.tenantId);
        const slug = d.tenantId;

        if (mode === 'A') {
          domainStr = `marketforge.scamspike.com/${slug}`;
        } else if (mode === 'B') {
          domainStr = `${slug}.marketforge.scamspike.com`;
        } else {
          domainStr = tenant?.domain && !tenant.domain.includes('marketforge') ? tenant.domain : `${slug}.com`;
        }

        return {
          ...d,
          routingMode: mode,
          domain: domainStr,
          dnsStatus: mode === 'C' ? 'pending' : 'verified',
          sslStatus: mode === 'C' ? 'pending_dns' : 'active'
        } as DomainRecord;
      }
      return d;
    });

    saveDomains(updated);

    // Sync back to tenant config
    const targetDomainObj = updated.find(d => d.id === id);
    if (targetDomainObj) {
      updateTenantDomainInStorage(targetDomainObj.tenantId, targetDomainObj.domain);
    }

    if (activeDomainDetails?.id === id) {
      setActiveDomainDetails(updated.find(d => d.id === id) || null);
    }
  };

  const updateTenantDomainInStorage = (tenantId: string, domainStr: string) => {
    const saTenantsRaw = localStorage.getItem('marketforge_sa_tenants');
    if (saTenantsRaw) {
      try {
        const tenants = JSON.parse(saTenantsRaw);
        const updatedTenants = tenants.map((t: any) => {
          if (t.id === tenantId) {
            return { ...t, domain: domainStr };
          }
          return t;
        });
        localStorage.setItem('marketforge_sa_tenants', JSON.stringify(updatedTenants));
        setTenantsList(updatedTenants);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddDomainMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !newDomainInput) return;

    const freshDomain: DomainRecord = {
      id: `dom_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: selectedTenant,
      domain: newDomainInput.trim().toLowerCase(),
      routingMode: newRoutingMode,
      dnsStatus: newRoutingMode === 'C' ? 'pending' : 'verified',
      sslStatus: newRoutingMode === 'C' ? 'pending_dns' : 'active',
      cloudflareState: 'none',
      txtChallenge: `marketforge-verification-challenge=${Math.random().toString(36).substr(2, 16)}`,
      ipAddress: newRoutingMode === 'C' ? 'Checking...' : '199.195.143.10',
      certificateIssuer: newRoutingMode === 'C' ? 'Pending Issuer Assign' : "Let's Encrypt Authority X3",
      expiryDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      autoRenew: true,
      createdAt: new Date().toISOString()
    };

    const nextList = [...domains, freshDomain];
    saveDomains(nextList);
    updateTenantDomainInStorage(selectedTenant, freshDomain.domain);

    setNewDomainInput('');
    setIsAdding(false);
  };

  const handleDeleteDomainMapping = (id: string) => {
    if (window.confirm("Are you sure you want to delete this domain mapping partition? Routing will instantly fall back to standard subfolder mode.")) {
      const target = domains.find(d => d.id === id);
      const updated = domains.filter(d => d.id !== id);
      saveDomains(updated);
      
      if (target) {
        // Fallback tenant domain config to path based mode
        updateTenantDomainInStorage(target.tenantId, `marketforge.scamspike.com/${target.tenantId}`);
      }

      if (activeDomainDetails?.id === id) {
        setActiveDomainDetails(null);
      }
    }
  };

  const handleToggleAutoRenew = (id: string) => {
    const updated = domains.map(d => {
      if (d.id === id) {
        return { ...d, autoRenew: !d.autoRenew };
      }
      return d;
    });
    saveDomains(updated);
    if (activeDomainDetails?.id === id) {
      setActiveDomainDetails(updated.find(d => d.id === id) || null);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopying(label);
    setTimeout(() => setIsCopying(null), 2000);
  };

  // DNS propagation checker simulation
  const runDnsVerification = (record: DomainRecord) => {
    setIsVerifying(record.id);
    
    const nodes = [
      { node: 'US East (New York)', status: 'checking' },
      { node: 'US West (San Francisco)', status: 'checking' },
      { node: 'Europe (Frankfurt)', status: 'checking' },
      { node: 'Europe (London)', status: 'checking' },
      { node: 'Asia Pacific (Tokyo)', status: 'checking' },
      { node: 'Asia Pacific (Sydney)', status: 'checking' },
      { node: 'Asia Pacific (Singapore)', status: 'checking' },
      { node: 'South America (Sao Paulo)', status: 'checking' },
      { node: 'Africa (Cape Town)', status: 'checking' },
      { node: 'Asia (Mumbai)', status: 'checking' }
    ] as any[];
    
    setPropagationSim(nodes);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < nodes.length) {
        setPropagationSim(prev => {
          const updated = [...prev];
          const isSuccessful = Math.random() > 0.15 || record.routingMode !== 'C'; // simulate high success rate
          updated[currentIndex] = {
            node: updated[currentIndex].node,
            status: isSuccessful ? 'ok' : 'fail',
            ip: isSuccessful ? '199.195.143.10' : 'Unknown',
            latency: Math.floor(Math.random() * 85) + 12
          };
          return updated;
        });
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsVerifying(null);
        
        // Finalize DNS check
        const finalDnsState = Math.random() > 0.1 || record.routingMode !== 'C' ? 'verified' : 'unverified';
        const finalSslState = finalDnsState === 'verified' ? 'active' : 'pending_dns';
        
        const nextList = domains.map(d => {
          if (d.id === record.id) {
            return {
              ...d,
              dnsStatus: finalDnsState,
              sslStatus: finalSslState,
              ipAddress: finalDnsState === 'verified' ? '199.195.143.10' : 'Unresolved',
              certificateIssuer: finalDnsState === 'verified' ? "Let's Encrypt Authority X3" : 'Pending Assign'
            } as DomainRecord;
          }
          return d;
        });
        saveDomains(nextList);
        
        const finalObj = nextList.find(d => d.id === record.id) || null;
        setActiveDomainDetails(finalObj);
      }
    }, 250);
  };

  return (
    <div className="space-y-6" id="domain-management-center">
      {/* Upper header */}
      <div className="bg-[#18191A] border border-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-12">
          <Globe className="w-80 h-80 text-teal-400" />
        </div>
        
        <div className="max-w-3xl relative z-10 space-y-3">
          <span className="bg-teal-500/15 text-teal-300 border border-teal-500/25 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            Enterprise Traffic & CDN Layer
          </span>
          <h2 className="text-2xl font-bold font-sans tracking-tight">Enterprise Multi-Tenant Domain Manager</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Provision and configure high-performance edge routing across Mode A (Subfolder), Mode B (Subdomain), and Mode C (Dedicated Custom Domain). Change tenant routing modes in real time with automated SSL certificates, custom DNS challenges, and Cloudflare CDN proxy detection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main routing mapping table */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6 text-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Active Domain Partitions</h3>
              <p className="text-slate-500 text-xs">Manage active DNS boundaries and TLS handshakes.</p>
            </div>
            
            <button
              onClick={() => setIsAdding(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Domain Mapping
            </button>
          </div>

          {/* Active mappings list */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Workspace / Tenant</th>
                  <th className="py-3 px-4">Assigned Path/Host</th>
                  <th className="py-3 px-4">Routing Mode</th>
                  <th className="py-3 px-4 text-center">DNS Status</th>
                  <th className="py-3 px-4 text-center">SSL Handshake</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {domains.map(d => {
                  const tenant = tenantsList.find(t => t.id === d.tenantId);
                  return (
                    <tr 
                      key={d.id} 
                      className={`hover:bg-slate-50/70 transition cursor-pointer ${activeDomainDetails?.id === d.id ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => setActiveDomainDetails(d)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{tenant?.name || d.tenantId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {d.tenantId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono select-all font-semibold text-slate-700">
                        {d.domain}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.routingMode === 'A' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                              d.routingMode === 'B' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              Mode {d.routingMode}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 leading-none">
                            {d.routingMode === 'A' ? 'Subfolder Partition' :
                             d.routingMode === 'B' ? 'Subdomain Host' : 'Custom Dedicated DNS'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          {d.dnsStatus === 'verified' ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              Active
                            </span>
                          ) : d.dnsStatus === 'pending' ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold animate-pulse">
                              <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                              Pending Verification
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                              <XCircle className="w-3 h-3 text-rose-500" />
                              Unresolved
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          {d.sslStatus === 'active' ? (
                            <span className="text-emerald-600 flex items-center gap-1 font-mono text-[10.5px]">
                              <Lock className="w-3 h-3 text-emerald-500" />
                              HTTPS Safe
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1 font-mono text-[10.5px]">
                              <AlertTriangle className="w-3 h-3 text-slate-300" />
                              Self-Issued
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveDomainDetails(d)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition"
                            title="View DNS details"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDomainMapping(d.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition"
                            title="Purge Mapping"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Mapping Form Overlay / Drawer inside Tab */}
          {isAdding && (
            <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-5 space-y-4 animate-fade-in text-slate-900">
              <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  Create New Domain Boundary Map
                </h4>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
                >Close</button>
              </div>

              <form onSubmit={handleAddDomainMapping} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Target Tenant ID</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition text-slate-900"
                  >
                    <option value="">Select Tenant...</option>
                    {tenantsList.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Target FQDN Domain</label>
                  <input
                    type="text"
                    required
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    placeholder="e.g. portal.suskritidigital.com"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Initial Routing Mode</label>
                  <select
                    value={newRoutingMode}
                    onChange={(e) => setNewRoutingMode(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition text-slate-900"
                  >
                    <option value="A">Mode A (Path Segment)</option>
                    <option value="B">Mode B (Tenant Subdomain)</option>
                    <option value="C">Mode C (Dedicated Host DNS)</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Generate Mapping Rules
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Detailed Mode explanations */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-slate-900">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              Routing Mode Architectural Guide
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200 text-slate-900">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Mode A</span>
                  Path Partitioning
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Routes via <code className="bg-slate-50 px-1 rounded text-indigo-600 font-mono">/demo-tenant</code>. Safest setup, zero domain changes required. Uses shared system-wide wildcard SSL certifications.
                </p>
              </div>

              <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200 text-slate-900">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Mode B</span>
                  Subdomain Isolation
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Routes via <code className="bg-slate-50 px-1 rounded text-blue-600 font-mono">tenant.marketforge.scamspike.com</code>. Requires cPanel API connection to generate DNS virtual server hosts and bindings dynamically.
                </p>
              </div>

              <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200 text-slate-900">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Mode C</span>
                  Custom Dedicated DNS
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Routes via custom branded FQDN like <code className="bg-slate-50 px-1 rounded text-emerald-600 font-mono">siennaclay.com</code>. Requires CNAME/A record pointer, TXT verification challenges, and LetsEncrypt provisioning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar details panel */}
        <div className="space-y-6">
          {activeDomainDetails ? (
            <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm select-all">{activeDomainDetails.domain}</h3>
                  <p className="text-slate-400 text-xs">DNS Boundary configuration details</p>
                </div>
                <button 
                  onClick={() => setActiveDomainDetails(null)}
                  className="text-slate-500 hover:text-white text-xs font-semibold"
                >
                  ✕
                </button>
              </div>

              {/* Toggle configuration in real time */}
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1 font-mono">
                  <Sliders className="w-3 h-3 text-teal-400" />
                  Dynamic Switch routing engine
                </span>
                
                <div className="grid grid-cols-3 gap-1">
                  {['A', 'B', 'C'].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSwitchRoutingMode(activeDomainDetails.id, m as any)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        activeDomainDetails.routingMode === m
                          ? 'bg-teal-500 text-slate-950 shadow'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      Mode {m}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Toggle above switches to hot-rebind routing rules instantly without rebuilding or restarting the edge gateways.
                </p>
              </div>

              {/* Dynamic checklist & diagnostics action */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider text-[10px] font-mono">Verifications checklist</span>
                  <button
                    disabled={isVerifying !== null}
                    onClick={() => runDnsVerification(activeDomainDetails)}
                    className="text-teal-400 hover:text-teal-300 text-[11px] font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isVerifying === activeDomainDetails.id ? 'animate-spin' : ''}`} />
                    Run Diagnostics
                  </button>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-300">A Record pointer:</span>
                    <span className="text-slate-100 font-bold select-all">199.195.143.10</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-300">CNAME reference:</span>
                    <span className="text-slate-100 font-bold select-all">marketforge.scamspike.com</span>
                  </div>

                  {activeDomainDetails.routingMode === 'C' && (
                    <div className="space-y-1 bg-slate-800 p-2.5 rounded border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">TXT Challenge Token:</span>
                        <button
                          onClick={() => handleCopyText(activeDomainDetails.txtChallenge, 'txt')}
                          className="text-teal-400 hover:text-teal-300 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {isCopying === 'txt' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 select-all break-all pr-1 bg-slate-900/40 p-1.5 rounded mt-1 border border-slate-800">
                        {activeDomainDetails.txtChallenge}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-300">Cloudflare Edge Proxy:</span>
                    <span className={`font-bold ${
                      activeDomainDetails.cloudflareState === 'proxied' ? 'text-orange-400' : 'text-slate-400'
                    }`}>
                      {activeDomainDetails.cloudflareState === 'proxied' ? 'Orange-Cloud Proxied' : 'Direct Resolving'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-300">SSL Certificate Expiry:</span>
                    <span className="text-teal-400 font-bold">
                      {Math.ceil((new Date(activeDomainDetails.expiryDate).getTime() - Date.now()) / (24 * 3600 * 1000))} Days Left
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-300">Automated Renews:</span>
                    <button
                      onClick={() => handleToggleAutoRenew(activeDomainDetails.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                        activeDomainDetails.autoRenew ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {activeDomainDetails.autoRenew ? 'SLIDER ON' : 'SLIDER OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Propagation Simulator nodes list */}
              {propagationSim.length > 0 && (
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[9.5px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-teal-400" />
                      Global Propagation Check
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Resolving IP Address
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[10px] max-h-48 overflow-y-auto">
                    {propagationSim.map((n, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300">
                        <span>{n.node}</span>
                        <div className="flex items-center gap-2">
                          {n.status === 'checking' ? (
                            <span className="text-amber-400 animate-pulse">Checking...</span>
                          ) : n.status === 'ok' ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              ✓ {n.ip} ({n.latency}ms)
                            </span>
                          ) : (
                            <span className="text-rose-500 font-bold">✗ Host Unresolved</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-400 space-y-3 h-full flex flex-col items-center justify-center min-h-[300px]">
              <Globe className="w-12 h-12 text-slate-300 animate-pulse" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 text-xs">DNS Inspection Panel</h4>
                <p className="text-slate-400 text-xs max-w-xs mx-auto">
                  Select any active domain mapping on the left to review SSL handshakes, Cloudflare configurations, and run propagation diagnostics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
