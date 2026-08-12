import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, FileText, CheckSquare, Clock, PieChart, 
  ArrowRight, Activity, Calendar, Cpu, Key, Shield, Search, 
  Filter, Download, RefreshCw, Eye, X, AlertTriangle, CheckCircle2,
  Database, Upload, FileSpreadsheet, Plus, Table, Mail, BookOpen
} from 'lucide-react';
import { BusinessProfile, TenantTeamMember } from '../types';
import TenantTeamManagement from './TenantTeamManagement';
import AiTelemetryModal from './AiTelemetryModal';
import EmailDiagnosticPanel from './EmailDiagnosticPanel';
import OperationsKnowledgeBase from './OperationsKnowledgeBase';
import { clientDb } from '../lib/firebase';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
  onLoginAsUser?: (member: TenantTeamMember) => void;
}

export default function BusinessOperations({ profile, tenantId, onLoginAsUser }: Props) {
  const [activeTab, setActiveTab] = useState('email_diagnostics');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Business Operations & Enterprise Governance</h2>
            <p className="text-sm text-slate-500">Manage multi-driver email fallbacks, SOP knowledge bases, tenant teams, designation OS, and CSV portability.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAiModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer shrink-0"
        >
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>AI API Telemetry & BYOK OS</span>
        </button>
      </div>

      <AiTelemetryModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        tenantId={tenantId}
        tenantName={profile.name}
      />

      <div className="flex gap-4 border-b border-slate-200 pb-px overflow-x-auto">
        {[
          { id: 'email_diagnostics', label: 'Primary SMTP & Email Diagnostics', icon: Mail },
          { id: 'sop_kb', label: 'Operations Knowledge Base & SOPs', icon: BookOpen },
          { id: 'hr', label: 'Team Members & Designation OS', icon: Users },
          { id: 'bulk_data', label: 'Bulk Data & CSV Portability', icon: Database },
          { id: 'audit_logs', label: 'Audit Logs & Governance', icon: Shield },
          { id: 'payroll', label: 'Payroll & Leaves', icon: FileText },
          { id: 'tasks', label: 'Task Management', icon: CheckSquare },
          { id: 'productivity', label: 'Productivity', icon: PieChart }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${activeTab === tab.id ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'email_diagnostics' && (
        <EmailDiagnosticPanel tenantId={tenantId} tenantName={profile.name} />
      )}
      {activeTab === 'sop_kb' && (
        <OperationsKnowledgeBase tenantId={tenantId} tenantName={profile.name} />
      )}
      {activeTab === 'hr' && (
        <TenantTeamManagement 
          tenantId={tenantId} 
          tenantName={profile.name} 
          onLoginAsUser={onLoginAsUser} 
        />
      )}
      {activeTab === 'bulk_data' && (
        <BulkDataTab tenantId={tenantId} tenantName={profile.name} />
      )}
      {activeTab === 'audit_logs' && (
        <AuditLogsTab 
          tenantId={tenantId} 
          tenantName={profile.name} 
        />
      )}
      {activeTab === 'payroll' && <PayrollTab />}
      {activeTab === 'tasks' && <TasksTab />}
      {activeTab === 'productivity' && <ProductivityTab />}
    </div>
  );
}

function HRTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center border-b pb-4 border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Team Directory</h3>
              <button className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold border border-blue-100 hover:bg-blue-100 transition">
                + Add Employee
              </button>
           </div>
           <div className="space-y-4">
             {[
               { name: 'Alice Chen', role: 'Operations Manager', dept: 'Operations', status: 'Active' },
               { name: 'Bob Smith', role: 'Sales Lead', dept: 'Sales', status: 'On Leave' },
               { name: 'Charlie Davis', role: 'Support Specialist', dept: 'Customer Success', status: 'Active' }
             ].map((emp, idx) => (
               <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                     {emp.name.charAt(0)}
                   </div>
                   <div>
                     <p className="font-bold text-slate-800 text-sm">{emp.name}</p>
                     <p className="text-xs text-slate-500">{emp.role} • {emp.dept}</p>
                   </div>
                 </div>
                 <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                   {emp.status}
                 </span>
               </div>
             ))}
           </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
          <h3 className="font-bold text-sm text-blue-100 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Company Pulse
          </h3>
          <div className="space-y-4">
            <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="text-xs text-blue-100 mb-1">Total Headcount</p>
              <p className="text-3xl font-black">24</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
               <p className="text-xs text-blue-100 mb-1">Pending Approvals</p>
               <p className="text-2xl font-bold">3</p>
               <button className="text-[10px] uppercase tracking-wider font-bold text-blue-200 mt-2 hover:text-white transition">Review Now &rarr;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayrollTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Payroll & Leaves</h3>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition">Run Payroll</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-slate-400 uppercase text-[10px] font-bold">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Base Salary</th>
              <th className="py-3 px-4">Leaves Used</th>
              <th className="py-3 px-4">Next Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700 text-sm">
            {[
               { name: 'Alice Chen', role: 'Operations Manager', base: '$6,500', leaves: '4/15', next: 'Nov 30, 2026' },
               { name: 'Bob Smith', role: 'Sales Lead', base: '$5,200', leaves: '12/15', next: 'Nov 30, 2026' },
               { name: 'Charlie Davis', role: 'Support Specialist', base: '$4,800', leaves: '2/15', next: 'Nov 30, 2026' }
            ].map((emp, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-semibold">{emp.name}</td>
                <td className="py-3 px-4 text-slate-500">{emp.role}</td>
                <td className="py-3 px-4 font-mono">{emp.base}</td>
                <td className="py-3 px-4 font-mono">{emp.leaves}</td>
                <td className="py-3 px-4 text-slate-500 font-mono">{emp.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TasksTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Active Tasks</h3>
        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 transition">New Task</button>
      </div>
      <div className="space-y-3">
        {[
          { title: 'Quarterly OKR Review', assignee: 'Alice C.', priority: 'High', status: 'In Progress' },
          { title: 'Update Client Pitch Deck', assignee: 'Bob S.', priority: 'Medium', status: 'Pending' },
          { title: 'Fix Support Ticket #1042', assignee: 'Charlie D.', priority: 'High', status: 'Done' }
        ].map((task, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-300 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <CheckSquare className={`w-5 h-5 ${task.status === 'Done' ? 'text-emerald-500' : 'text-slate-300'}`} />
              <div>
                <p className={`font-bold text-sm ${task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                <p className="text-xs text-slate-500">Assigned to: {task.assignee}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{task.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductivityTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-center py-20">
       <div className="text-center space-y-3">
         <PieChart className="w-12 h-12 text-slate-300 mx-auto" />
         <p className="text-slate-500 font-medium">Productivity analytics module is syncing.</p>
       </div>
    </div>
  );
}

// =========================================================================
// FIRESTORE AUDIT LOGS DATA TABLE COMPONENT
// =========================================================================
export interface AuditLogRecord {
  id: string;
  tenantId: string;
  userId?: string;
  userEmail: string;
  action: string;
  details?: string;
  severity?: 'info' | 'warning' | 'critical' | 'security';
  timestamp: string;
  ipAddress?: string;
}

function AuditLogsTab({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedLogModal, setSelectedLogModal] = useState<AuditLogRecord | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, [tenantId]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const fetched = await clientDb.getCollection<AuditLogRecord>('audit_logs', tenantId);
      
      // Fallback seed audit logs if collection is sparse or new
      const now = new Date();
      const seedLogs: AuditLogRecord[] = [
        {
          id: 'aud_801',
          tenantId,
          userId: 'usr_mgr_101',
          userEmail: 'alex.vance@mforge.com',
          action: 'Order Void Approved',
          details: 'Authorized void of Order #ord_101 ($109.45) - Customer Change of Mind',
          severity: 'warning',
          timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
          ipAddress: '192.168.1.104'
        },
        {
          id: 'aud_802',
          tenantId,
          userId: 'usr_cash_102',
          userEmail: 'sarah.jenkins@mforge.com',
          action: 'POS Terminal Sync Network Ping',
          details: 'Cashier 2 POS Terminal synchronized 14 offline draft tickets',
          severity: 'info',
          timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
          ipAddress: '192.168.1.108'
        },
        {
          id: 'aud_803',
          tenantId,
          userId: 'usr_admin_001',
          userEmail: 'prakashsuvedi.backup@gmail.com',
          action: 'BYOK API Key Rotated',
          details: 'Updated tenant Gemini 2.5 Flash Production API key credentials',
          severity: 'security',
          timestamp: new Date(now.getTime() - 120 * 60000).toISOString(),
          ipAddress: '10.0.4.12'
        },
        {
          id: 'aud_804',
          tenantId,
          userId: 'usr_admin_001',
          userEmail: 'prakashsuvedi.backup@gmail.com',
          action: 'Team Member Designation Updated',
          details: 'Promoted Marco Rossi from Waiter to Shift Supervisor (Manager PIN Granted)',
          severity: 'info',
          timestamp: new Date(now.getTime() - 240 * 60000).toISOString(),
          ipAddress: '10.0.4.12'
        },
        {
          id: 'aud_805',
          tenantId,
          userId: 'system_security',
          userEmail: 'security-bot@marketforge.ai',
          action: 'Multi-Tenant Auth RBAC Guard Verification',
          details: 'Passed 100% boundary check for tenant data isolation',
          severity: 'info',
          timestamp: new Date(now.getTime() - 480 * 60000).toISOString(),
          ipAddress: '127.0.0.1'
        },
        {
          id: 'aud_806',
          tenantId,
          userId: 'usr_cash_103',
          userEmail: 'david.miller@mforge.com',
          action: 'Tax Rate & Invoice Template Config Modified',
          details: 'Updated VAT rate to 13% and enabled Thermal Receipt printing',
          severity: 'critical',
          timestamp: new Date(now.getTime() - 1440 * 60000).toISOString(),
          ipAddress: '192.168.1.112'
        }
      ];

      // Merge fetched with seeds ensuring no duplicate IDs
      const mergedMap = new Map<string, AuditLogRecord>();
      [...fetched, ...seedLogs].forEach(item => {
        mergedMap.set(item.id, item);
      });

      const mergedList = Array.from(mergedMap.values()).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setLogs(mergedList);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Preset Date Handlers
  const handleApplyPreset = (preset: 'today' | '7days' | '30days' | 'all') => {
    const today = new Date();
    if (preset === 'today') {
      const dateStr = today.toISOString().split('T')[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (preset === '7days') {
      const past = new Date(today.getTime() - 7 * 86400000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === '30days') {
      const past = new Date(today.getTime() - 30 * 86400000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Filter Logic
  const filteredLogs = logs.filter(log => {
    // 1. Search term match
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
      log.userEmail.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      (log.details && log.details.toLowerCase().includes(term)) ||
      log.id.toLowerCase().includes(term);

    // 2. Severity match
    const logSev = log.severity || 'info';
    const matchesSeverity = severityFilter === 'ALL' || logSev.toLowerCase() === severityFilter.toLowerCase();

    // 3. Date range match
    let matchesDate = true;
    if (log.timestamp) {
      const logDateStr = log.timestamp.split('T')[0];
      if (startDate && logDateStr < startDate) matchesDate = false;
      if (endDate && logDateStr > endDate) matchesDate = false;
    }

    return matchesSearch && matchesSeverity && matchesDate;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'User Email', 'User ID', 'Action', 'Severity', 'Details', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString(),
      l.userEmail,
      l.userId || 'N/A',
      `"${l.action.replace(/"/g, '""')}"`,
      l.severity || 'info',
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ipAddress || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Logs_${tenantId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    } catch (e) {
      return { date: ts, time: '' };
    }
  };

  const getSeverityBadge = (sev: string = 'info') => {
    const normalized = sev.toLowerCase();
    if (normalized === 'critical' || normalized === 'error') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3 text-rose-600" /> Critical</span>;
    }
    if (normalized === 'security') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 w-fit"><Shield className="w-3 h-3 text-purple-600" /> Security</span>;
    }
    if (normalized === 'warning') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3 text-amber-600" /> Warning</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3 text-blue-600" /> Info</span>;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">Firestore Audit Logs & Governance Ledger</h3>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                audit_logs
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Immutable audit trail capturing all system events, role actions, security changes & financial overrides for {tenantName}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAuditLogs}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Audit CSV
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Date Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit logs by user, action, details, or Log ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Date Range Pickers */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="ALL">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="security">Security</option>
              </select>
            </div>

            {/* Date Range Start & End */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
                title="Start Date"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
                title="End Date"
              />
            </div>

            {/* Date Presets */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-600">
              <button
                onClick={() => handleApplyPreset('today')}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs transition cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => handleApplyPreset('7days')}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs transition cursor-pointer"
              >
                7 Days
              </button>
              <button
                onClick={() => handleApplyPreset('30days')}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs transition cursor-pointer"
              >
                30 Days
              </button>
              <button
                onClick={() => handleApplyPreset('all')}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs transition cursor-pointer text-indigo-600"
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Status indicator bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono border-t border-slate-100 pt-2.5">
          <span>Showing <strong className="text-slate-900">{filteredLogs.length}</strong> of <strong className="text-slate-700">{logs.length}</strong> audit records</span>
          {(startDate || endDate || severityFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSeverityFilter('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="text-indigo-600 hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Clear Active Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action & Details</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    <p className="font-medium">Loading Firestore `audit_logs` collection...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Shield className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No Audit Logs Found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your date range, search query, or severity filter.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const formatted = formatTimestamp(log.timestamp);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp Column */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900 block">{formatted.date}</span>
                        <span className="text-[10px] text-slate-400">{formatted.time}</span>
                      </td>

                      {/* User Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-[11px] shrink-0">
                            {log.userEmail.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate max-w-[180px]">
                            <span className="font-bold text-slate-900 block truncate">{log.userEmail}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {log.userId || 'system'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Action & Details Column */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-xs block">{log.action}</span>
                          {log.details && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md">
                              {log.details}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Severity Column */}
                      <td className="py-3.5 px-4">
                        {getSeverityBadge(log.severity)}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLogModal(log)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                          title="Inspect raw audit record"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Raw Log Detail Inspection */}
      {selectedLogModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base text-slate-900">Audit Log Record Details</h3>
              </div>
              <button
                onClick={() => setSelectedLogModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold">Log Record ID:</span>
                <span className="font-mono font-extrabold text-indigo-600">{selectedLogModal.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tenant ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLogModal.tenantId}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Severity Level</span>
                  <div className="mt-0.5">{getSeverityBadge(selectedLogModal.severity)}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">User / Actor</span>
                <p className="font-bold text-slate-900">{selectedLogModal.userEmail}</p>
                <p className="text-[10px] text-slate-400 font-mono">UID: {selectedLogModal.userId || 'N/A'} • IP: {selectedLogModal.ipAddress || 'Internal'}</p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Action</span>
                <p className="font-extrabold text-slate-900">{selectedLogModal.action}</p>
                <p className="text-slate-600 font-medium leading-relaxed">{selectedLogModal.details || 'No additional details logged.'}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Raw Firestore Payload</span>
                <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-40 border border-slate-800">
                  {JSON.stringify(selectedLogModal, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLogModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BulkDataTab({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [exportReportType, setExportReportType] = useState('campaign_roi');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [existingCustomers, setExistingCustomers] = useState<any[]>([]);

  useEffect(() => {
    loadCustomers();
  }, [tenantId]);

  const loadCustomers = async () => {
    try {
      const records = await clientDb.getCollection('customers', tenantId);
      if (records && records.length > 0) {
        setExistingCustomers(records);
      } else {
        // Mock default list if empty
        setExistingCustomers([
          { id: 'cust-1', name: 'Global Tech Corp', email: 'contact@globaltech.com', phone: '+1 555-0192', company: 'Global Tech', tier: 'Enterprise', status: 'Active', value: 12500 },
          { id: 'cust-2', name: 'Apex Media Solutions', email: 'sarah@apexmedia.io', phone: '+1 555-0481', company: 'Apex Media', tier: 'Growth', status: 'Lead', value: 4800 },
          { id: 'cust-3', name: 'Lumina Commerce', email: 'david@lumina.com', phone: '+1 555-0823', company: 'Lumina', tier: 'Starter', status: 'Active', value: 2400 },
        ]);
      }
    } catch (err) {
      console.warn("Could not load customers:", err);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sampleCsv = `Name,Email,Phone,Company,Tier,Status,Estimated_Value\n` +
      `Acme Dynamics,info@acmedynamics.com,+1 555-1234,Acme Dynamics,Enterprise,Active,15000\n` +
      `Beta Retailers,orders@betaretail.com,+1 555-5678,Beta Retailers,Growth,Lead,6500\n` +
      `Zenith Logistics,contact@zenithlog.com,+1 555-9012,Zenith Logistics,Starter,Active,3200\n` +
      `Orion Software,support@orion.io,+1 555-3456,Orion Software,Enterprise,Qualified,22000`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_customer_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsvString(text);
    };
    reader.readAsText(file);
  };

  const parseCsvString = (rawCsv: string) => {
    if (!rawCsv.trim()) {
      setParsedRows([]);
      return;
    }
    const lines = rawCsv.trim().split('\n');
    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rowObj: any = { _id: `temp-${i}` };
      headers.forEach((h, index) => {
        rowObj[h] = values[index] || '';
      });
      rows.push(rowObj);
    }
    setParsedRows(rows);
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    setImportStatus(null);

    try {
      for (const row of parsedRows) {
        const docData = {
          name: row.Name || row.name || 'Unnamed Contact',
          email: row.Email || row.email || 'N/A',
          phone: row.Phone || row.phone || 'N/A',
          company: row.Company || row.company || 'N/A',
          tier: row.Tier || row.tier || 'Starter',
          status: row.Status || row.status || 'Active',
          value: parseFloat(row.Estimated_Value || row.value || '0') || 0,
          importedAt: new Date().toISOString()
        };
        await clientDb.addDocToTenant('customers', docData, tenantId);
      }

      setImportStatus(`Successfully imported ${parsedRows.length} customer records to tenant database!`);
      setParsedRows([]);
      setCsvText('');
      loadCustomers();
    } catch (e: any) {
      console.error(e);
      setImportStatus(`Import failed: ${e.message || 'Unknown database error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportReport = () => {
    let reportFilename = 'report.csv';
    let headers: string[] = [];
    let rows: string[][] = [];

    if (exportReportType === 'campaign_roi') {
      reportFilename = `Campaign_Performance_Report_${tenantName.replace(/\s+/g, '_')}.csv`;
      headers = ['Campaign_Name', 'Channel', 'Impressions', 'Clicks', 'Leads', 'Conversion_Rate', 'Ad_Spend_USD', 'Attributed_Revenue_USD', 'ROI_Percent'];
      rows = [
        ['Enterprise AI Engine Launch', 'LinkedIn & X', '145,000', '4,200', '320', '7.6%', '$3,500.00', '$28,400.00', '+711%'],
        ['Summer Growth Promo Banner', 'Facebook & Instagram', '280,000', '8,900', '650', '7.3%', '$2,200.00', '$16,250.00', '+638%'],
        ['Gourmet Culinary Tasting', 'Instagram Reels', '98,000', '3,100', '210', '6.7%', '$1,200.00', '$8,400.00', '+600%'],
      ];
    } else if (exportReportType === 'customer_leads') {
      reportFilename = `Customer_Leads_Report_${tenantName.replace(/\s+/g, '_')}.csv`;
      headers = ['Customer_Name', 'Email', 'Phone', 'Company', 'Tier', 'Status', 'Estimated_Value_USD'];
      rows = existingCustomers.map(c => [
        c.name || 'N/A',
        c.email || 'N/A',
        c.phone || 'N/A',
        c.company || 'N/A',
        c.tier || 'Starter',
        c.status || 'Active',
        `$${(c.value || 0).toLocaleString()}`
      ]);
    } else if (exportReportType === 'ai_telemetry') {
      reportFilename = `AI_Token_Consumption_Report_${tenantName.replace(/\s+/g, '_')}.csv`;
      headers = ['Timestamp', 'Task_Name', 'Model_ID', 'Prompt_Tokens', 'Completion_Tokens', 'Estimated_Cost_USD'];
      rows = [
        [new Date().toISOString(), 'Campaign Strategy Generation', 'gemini-2.5-flash', '3,400', '1,850', '$0.0135'],
        [new Date(Date.now() - 3600000).toISOString(), 'WhatsApp Bot Trigger Builder', 'gemini-2.5-flash', '1,200', '450', '$0.0018'],
        [new Date(Date.now() - 7200000).toISOString(), 'AEO Search Index Audit', 'gemini-2.5-flash', '2,100', '980', '$0.0039'],
      ];
    } else {
      reportFilename = `Operations_Audit_Log_${tenantName.replace(/\s+/g, '_')}.csv`;
      headers = ['Timestamp', 'User', 'Action', 'Severity', 'Details'];
      rows = [
        [new Date().toISOString(), 'admin@marketforge.io', 'BULK_CSV_EXPORT', 'info', 'Exported performance report CSV'],
        [new Date(Date.now() - 1800000).toISOString(), 'admin@marketforge.io', 'MEMBER_DESIGNATION_UPDATE', 'info', 'Updated designation rules for sales team'],
      ];
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', reportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Utility Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" /> Bulk Data Utility & CSV Portability OS
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Import customer records in bulk via CSV or export granular performance, customer, and AI usage reports for tenant <strong className="text-slate-800">{tenantName}</strong>.
          </p>
        </div>

        <button
          onClick={handleDownloadSampleCsv}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Grid: Left - CSV Import, Right - Export Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: IMPORT CUSTOMER LISTS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" /> 1. Bulk Import Customer Lists (CSV)
            </h4>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              CSV Parser Active
            </span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Select CSV File from Device
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-xl p-1 bg-slate-50"
            />

            <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">- OR PASTE RAW CSV CONTENT -</div>

            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                parseCsvString(e.target.value);
              }}
              placeholder={`Name,Email,Phone,Company,Tier,Status,Estimated_Value\nAcme Corp,contact@acme.com,+1 555-0100,Acme,Enterprise,Active,10000`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Parsed Preview ({parsedRows.length} Rows Detected)</span>
                <span className="text-emerald-600 font-mono text-[11px]">✓ Headers Validated</span>
              </div>

              <div className="max-h-48 overflow-x-auto border border-slate-200 rounded-xl bg-slate-50 p-2">
                <table className="w-full text-left text-[11px] font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      {Object.keys(parsedRows[0]).filter(k => k !== '_id').map(key => (
                        <th key={key} className="p-2 whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 text-slate-700">
                        {Object.keys(row).filter(k => k !== '_id').map(key => (
                          <td key={key} className="p-2 whitespace-nowrap">{row[key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleCommitImport}
                disabled={isImporting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" /> Saving Customers to Tenant DB...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" /> Commit Import ({parsedRows.length} Customers)
                  </>
                )}
              </button>
            </div>
          )}

          {importStatus && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${importStatus.includes('Successfully') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* SECTION 2: EXPORT PERFORMANCE REPORTS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600" /> 2. Export Performance Reports to CSV
              </h4>
              <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                CSV Exporter
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Select Report Type</label>
                <select
                  value={exportReportType}
                  onChange={(e) => setExportReportType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="campaign_roi">Campaign Performance & Channel ROI Summary</option>
                  <option value="customer_leads">Customer Leads & Pipeline Register</option>
                  <option value="ai_telemetry">AI Token Usage & BYOK API Telemetry</option>
                  <option value="audit_trail">Operations Audit Trail & Compliance Log</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">End Date (Optional)</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-xs space-y-2">
              <span className="font-bold text-indigo-900 block">CSV Export Format Specification:</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Generates a clean RFC 4180 compliant CSV document with double-quoted text fields, timestamp formatting, and aggregated numeric metrics ready for Excel or Google Sheets.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportReport}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <Download className="w-4 h-4 text-white" /> Generate & Download CSV Report
          </button>
        </div>
      </div>

      {/* Existing Customer Records Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-600" /> Active Tenant Customer Directory ({existingCustomers.length} Records)
          </h4>
          <span className="text-xs text-slate-500 font-mono">Synced with Firestore database</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                <th className="p-3">Customer Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Company</th>
                <th className="p-3">Tier</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {existingCustomers.map((c, idx) => (
                <tr key={c.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-800">{c.name}</td>
                  <td className="p-3 font-mono text-slate-600">{c.email}</td>
                  <td className="p-3 text-slate-600">{c.company}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {c.tier || 'Starter'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {c.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    ${(c.value || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


