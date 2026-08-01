import React, { useState, useEffect } from 'react';
import { clientDb } from '../lib/firebase';
import { AlertCircle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function TenantIntegrityChecker({ tenants }: { tenants: any[] }) {
  const [integrityStatus, setIntegrityStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprovisioning, setReprovisioning] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (tenants && tenants.length > 0) {
      checkIntegrity();
    }
  }, [tenants]);

  const checkIntegrity = async () => {
    setLoading(true);
    const statuses = [];

    for (const tenant of tenants) {
      if (!tenant.id) continue;
      try {
        const campaignProfiles = await clientDb.getCollection('campaign_profiles', tenant.id);
        const brandGuidelines = await clientDb.getCollection('brand_guidelines', tenant.id);

        const issues = [];
        if (!campaignProfiles || campaignProfiles.length === 0) {
          issues.push("Missing 'campaign_profiles' documents");
        }
        if (!brandGuidelines || brandGuidelines.length === 0) {
          issues.push("Missing 'brand_guidelines' documents");
        }

        statuses.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          email: tenant.ownerEmail,
          issues,
          status: issues.length === 0 ? 'Healthy' : 'Inconsistent'
        });
      } catch (err) {
        statuses.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          email: tenant.ownerEmail,
          issues: ['Failed to read from database boundaries'],
          status: 'Error'
        });
      }
    }

    setIntegrityStatus(statuses);
    setLoading(false);
  };

  const handleReprovision = async (tenantId: string, email: string, name: string) => {
    if (!window.confirm(`Are you sure you want to run manual data re-provisioning for ${tenantId}?`)) return;
    
    setReprovisioning(prev => ({ ...prev, [tenantId]: true }));
    try {
      await clientDb.addDocToTenant("campaign_profiles", {
        name: `${name} Core Profile`,
        targetAudience: "General Demographic",
        tone: "Professional"
      }, tenantId, "system_reprovision");

      await clientDb.addDocToTenant("brand_guidelines", {
        tagline: "Empowering our customers",
        primaryColor: "#6366f1",
        secondaryColor: "#06b6d4"
      }, tenantId, "system_reprovision");

      await checkIntegrity();
    } catch (err: any) {
      console.error("Re-provisioning failed", err);
      alert("Failed to re-provision: " + err.message);
    } finally {
      setReprovisioning(prev => ({ ...prev, [tenantId]: false }));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900 text-left">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-800 font-sans flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-500" />
            Tenant Integrity Checker
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Post-Provisioning Verification Matrix</p>
        </div>
        <button
          onClick={checkIntegrity}
          disabled={loading}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition"
          title="Refresh scan"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {loading && integrityStatus.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center font-mono">Running cross-tenant integrity scan...</div>
        ) : (
          integrityStatus.map((status) => (
            <div key={status.tenantId} className={`p-4 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${status.status === 'Healthy' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/50 border-rose-200'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs">{status.tenantName}</span>
                  <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono text-slate-500">{status.tenantId}</span>
                  {status.status === 'Healthy' ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> INTEGRITY OK</span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> INCONSISTENT</span>
                  )}
                </div>
                
                {status.issues.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {status.issues.map((issue: string, idx: number) => (
                      <div key={idx} className="text-[10px] font-mono text-rose-700 flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-rose-500 rounded-full"></span> {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {status.status !== 'Healthy' && (
                <button
                  onClick={() => handleReprovision(status.tenantId, status.email, status.tenantName)}
                  disabled={reprovisioning[status.tenantId]}
                  className="shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {reprovisioning[status.tenantId] ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Manual Re-provision
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
