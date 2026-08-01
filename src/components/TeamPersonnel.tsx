import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Mail, Plus, X, RefreshCw, CheckCircle, Sliders, HardDrive, Filter, Search } from 'lucide-react';

interface Personnel {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'writer' | 'viewer';
  tenantId: string;
  status: string;
  lastActive: string;
  password?: string;
  username?: string;
}

interface TeamPersonnelProps {
  tenantId: string;
  userRole: string;
  onCreateAuditLog?: (action: string, level: 'low' | 'medium' | 'high', details: string, refId?: string) => void;
}

export default function TeamPersonnel({ tenantId, userRole, onCreateAuditLog }: TeamPersonnelProps) {
  const [members, setMembers] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Member Modal Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'writer' | 'viewer'>('writer');
  const [newPassword, setNewPassword] = useState('passCrew123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/tenant/team?tenantId=${encodeURIComponent(tenantId)}`);
      if (resp.ok) {
        const data = await resp.json();
        setMembers(data);
      }
    } catch (err) {
      console.warn("Could not query company representatives:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [tenantId]);

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    if (!newEmail.includes('@')) {
      setErrorText("A valid company personnel email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/tenant/add-team-member", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify({
          tenantId,
          name: newFullName,
          email: newEmail,
          role: newRole,
          password: newPassword,
          username: newUsername || newEmail.split("@")[0]
        })
      });

      if (!resp.ok) {
        const errVal = await resp.json();
        throw new Error(errVal.error || "Personnel enrollment failed.");
      }

      setSuccessText(`Representative "${newFullName}" enrolled successfully! SMTP notification mapped.`);
      
      // Reset forms
      setNewFullName('');
      setNewEmail('');
      setNewUsername('');
      setNewRole('writer');
      setNewPassword('passCrew123');

      // Refresh listings
      fetchMembers();
      
      if (onCreateAuditLog) {
        onCreateAuditLog("MEMBER_ENROLLED", "medium", `Enrolled brand crew "${newFullName}" [${newRole}] inside tenant scope.`);
      }

      setTimeout(() => {
        setShowAddModal(false);
        setSuccessText(null);
      }, 1500);

    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesRole = filterRole === 'all' || m.role === filterRole;
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.username && m.username.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left" id="team-personnel-dashboard">
      
      {/* Upper Status Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-slate-900">
        <div>
          <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide font-mono">
            {tenantId} Workspace Partitions
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Agency Directory & Credentials</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Configure multi-user access rules, review active supervisor roles, and recruit secondary creative representatives inside this space.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={fetchMembers}
            disabled={isLoading}
            className="p-2 border border-slate-200 bg-white text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Directory
          </button>
          
          <button 
            type="button" 
            onClick={() => setShowAddModal(true)}
            className="p-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            Add Crew Representative
          </button>
        </div>
      </div>

      {/* Directory Interface Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-900">
        
        {/* Search Inputs */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input 
            type="text" 
            placeholder="Search representatives, emails, handles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">Filter Role:</span>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 h-8 px-2.5 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Authorized Personell</option>
            <option value="owner">Owners (Admin Core)</option>
            <option value="admin">Administrators</option>
            <option value="writer">Content Writers</option>
            <option value="viewer">Client Viewers</option>
          </select>
        </div>
      </div>

      {/* Primary listings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between text-slate-900">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold uppercase border border-slate-200">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{member.name}</h3>
                    <span className="text-[10px] text-indigo-600 font-mono font-semibold">@{member.username || member.email.split('@')[0]}</span>
                  </div>
                </div>
                
                {/* Role badges styling */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  member.role === 'owner' ? 'bg-[#EEF2F6] text-[#1E293B] border border-slate-200' :
                  member.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                  member.role === 'writer' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  'bg-slate-50 text-slate-500 border border-slate-200'
                }`}>
                  {member.role}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 font-sans border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Access scope: <strong className="text-slate-700">{member.role === 'owner' || member.role === 'admin' ? 'Unrestricted write' : 'Assigned tasks'}</strong></span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active Session
              </span>
              <span>ID: {member.id}</span>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-sans space-y-2">
            <User className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">No workspace personnel found matching standard queries.</p>
            <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">Either refine selected criteria or declare a new representative to start multi-person simulation checks.</p>
          </div>
        )}
      </div>

      {/* Add personnel drawer modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddMemberSubmit} className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-900">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-white">Enroll Workspace Representative</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Authorizes new agency crew personnel keys to this tenant space.</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs text-left">
                  ⛔ {errorText}
                </div>
              )}

              {successText && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs text-left flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successText}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Personnel Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Richard Hendricks" 
                  value={newFullName}
                  onChange={(e) => {
                    setNewFullName(e.target.value);
                    setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-sans text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">System Username / CLI Handle</label>
                <input 
                  type="text" 
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Authorized Corporate Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. richard@hooli-corp.com" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-sans text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Assigned RBAC Privileges</label>
                  <select 
                    value={newRole}
                    onChange={(e: any) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="admin">Administrator</option>
                    <option value="writer">Content Writer</option>
                    <option value="viewer">Client Viewer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">Temporary Key / Password</label>
                  <input 
                    type="text" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 font-sans leading-normal">
                🔑 Note: Enrolling a crew representative immediately registers their system hash keys to memory and logs an authorized audit trail inside compliance database tables.
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2 text-slate-900">
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer transition disabled:opacity-50"
              >Close</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow disabled:opacity-50 flex items-center gap-1"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
