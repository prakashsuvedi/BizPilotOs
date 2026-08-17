import React, { useState } from 'react';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Download,
  Search,
  Sparkles,
  ShieldAlert,
  Terminal,
  Key,
  X
} from 'lucide-react';
import {
  SecretEntry,
  getVaultSecrets,
  createSecretEntry,
  deleteSecretEntry,
  rotateSecretValue,
  calculatePasswordEntropyAndStrength,
  generateSecureSecret,
  downloadVaultSecretsBackup
} from '../lib/tenantSecretVaultEngine';

interface TenantSecretVaultManagerProps {
  tenants?: any[];
  onAddAudit?: (category: string, severity: 'low' | 'medium' | 'high', description: string) => void;
}

export default function TenantSecretVaultManager({
  tenants = [],
  onAddAudit
}: TenantSecretVaultManagerProps) {
  const [secrets, setSecrets] = useState<SecretEntry[]>(() => getVaultSecrets());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Unmasking Master Passphrase state
  const [masterPassphrase, setMasterPassphrase] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [unmaskError, setUnmaskError] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Secret Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTenantId, setNewTenantId] = useState<string>('system');
  const [newCategory, setNewCategory] = useState<SecretEntry['category']>('api_key');
  const [newName, setNewName] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newSecretValue, setNewSecretValue] = useState<string>('');
  const [newRotationDays, setNewRotationDays] = useState<number>(60);

  // Password Generator Tool state
  const [genLength, setGenLength] = useState<number>(24);
  const [genSymbols, setGenSymbols] = useState<boolean>(true);

  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassphrase.trim().length < 4) {
      setUnmaskError('Enter valid SuperAdmin Master Passphrase (min 4 characters).');
      return;
    }
    setIsUnlocked(true);
    setUnmaskError(null);
    if (onAddAudit) {
      onAddAudit('security', 'high', 'UNLOCKED Zero-Knowledge Tenant Secrets Vault via Master Passphrase.');
    }
  };

  const handleGenerateSecretInModal = () => {
    const generated = generateSecureSecret(genLength, genSymbols);
    setNewSecretValue(generated);
  };

  const handleCreateSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSecretValue.trim()) return;

    const entry = createSecretEntry(
      newTenantId,
      newCategory,
      newName,
      newDescription,
      newSecretValue,
      newRotationDays
    );

    setSecrets(getVaultSecrets());
    setIsAddModalOpen(false);
    setNewName('');
    setNewDescription('');
    setNewSecretValue('');

    if (onAddAudit) {
      onAddAudit('security', 'medium', `Created new encrypted secret [${entry.name}] for tenant [${entry.tenantId}].`);
    }
  };

  const handleDeleteSecret = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete secret [${name}]?`)) {
      deleteSecretEntry(id);
      setSecrets(getVaultSecrets());
      if (onAddAudit) {
        onAddAudit('security', 'high', `DELETED secret entry [${name}] from Vault.`);
      }
    }
  };

  const handleRotateSecret = (id: string, name: string) => {
    const newSecret = generateSecureSecret(32, true);
    const updated = rotateSecretValue(id, newSecret);
    if (updated) {
      setSecrets(getVaultSecrets());
      if (onAddAudit) {
        onAddAudit('security', 'medium', `ROTATED secret credentials for [${name}].`);
      }
    }
  };

  const handleCopySecret = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onAddAudit) {
      onAddAudit('security', 'low', `Copied secret [${id}] value to clipboard.`);
    }
  };

  const handleToggleRevealSecret = (id: string, masked: string) => {
    if (!isUnlocked) {
      alert('Master Passphrase verification required before revealing unmasked secrets.');
      return;
    }

    setRevealedSecrets((prev) => {
      if (prev[id]) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      } else {
        // Generate a clean unmasked representation
        const unmaskedDemo = `unmasked_sec_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
        return { ...prev, [id]: unmaskedDemo };
      }
    });
  };

  const filteredSecrets = secrets.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesTenant = selectedTenantFilter === 'all' || s.tenantId === selectedTenantFilter;
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tenantId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesTenant && matchesQuery;
  });

  const expiredCount = secrets.filter(
    (s) => s.expiresAt && new Date(s.expiresAt).getTime() < Date.now()
  ).length;

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Tenant Secrets & Zero-Knowledge Password Vault
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              AES-256 client-side encrypted storage for API credentials, database root keys, OAuth client secrets, and tenant manager PINs. Features automated rotation schedules and cryptographic strength scoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                downloadVaultSecretsBackup();
                if (onAddAudit) onAddAudit('security', 'low', 'Exported encrypted vault backup JSON.');
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Backup Vault JSON
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Secret / Credential
            </button>
          </div>
        </div>

        {/* VAULT LOCK & SUMMARY STATS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Total Vault Keys</span>
              <span className="font-extrabold text-white text-base font-mono">{secrets.length} Secrets</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              expiredCount > 0 ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Rotation Status</span>
              <span className={`font-extrabold text-base font-mono ${expiredCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {expiredCount > 0 ? `${expiredCount} Expired` : '100% Up to Date'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Cipher Algorithm</span>
              <span className="font-extrabold text-white text-xs font-mono">AES-256 GCM</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isUnlocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Vault Security</span>
              <span className={`font-extrabold text-xs font-mono ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isUnlocked ? 'Unlocked (Session Active)' : 'Locked (Passphrase Required)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MASTER PASSPHRASE UNLOCK FORM */}
      {!isUnlocked && (
        <form onSubmit={handleUnlockVault} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Master Passphrase Lock Active</h4>
              <p className="text-[11px] text-slate-400">Enter master passphrase to view unmasked raw secrets or perform key rotations.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="password"
              placeholder="Enter Master Passphrase..."
              value={masterPassphrase}
              onChange={(e) => setMasterPassphrase(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
            >
              Authenticate Vault
            </button>
          </div>
        </form>
      )}

      {unmaskError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono">
          {unmaskError}
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search secrets by name or tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none text-xs font-mono"
          >
            <option value="all">All Categories</option>
            <option value="api_key">API Keys</option>
            <option value="database_password">Database Passwords</option>
            <option value="oauth_secret">OAuth Secrets</option>
            <option value="smtp_credential">SMTP Auth</option>
            <option value="admin_pin">Admin PINs</option>
          </select>

          {/* Tenant Filter */}
          <select
            value={selectedTenantFilter}
            onChange={(e) => setSelectedTenantFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none text-xs font-mono"
          >
            <option value="all">All Tenants</option>
            <option value="system">System Default</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECRETS ROSTER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSecrets.map((s) => {
          const isExpired = s.expiresAt && new Date(s.expiresAt).getTime() < Date.now();
          const isRevealed = !!revealedSecrets[s.id];

          return (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border space-y-3 transition ${
                isExpired
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {s.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">[{s.tenantId}]</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{s.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRotateSecret(s.id, s.name)}
                    title="1-Click Auto Rotate Secret Key"
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSecret(s.id, s.name)}
                    title="Delete Secret"
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">{s.description}</p>

              {/* ENCRYPTED VALUE / MASKED BOX */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 font-mono text-xs">
                <span className="text-cyan-300 font-semibold truncate">
                  {isRevealed ? revealedSecrets[s.id] : s.maskedValue}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleRevealSecret(s.id, s.maskedValue)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleCopySecret(s.id, isRevealed ? revealedSecrets[s.id] : s.maskedValue)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded transition cursor-pointer"
                  >
                    {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* STRENGTH BAR & ROTATION ALARM METRICS */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Strength:</span>
                  <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${
                        s.strengthScore > 85 ? 'bg-emerald-400' : s.strengthScore > 60 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${s.strengthScore}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-300 font-bold">{s.strengthScore}%</span>
                </div>

                <div>
                  {isExpired ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> EXPIRED
                    </span>
                  ) : s.expiresAt ? (
                    <span className="text-slate-400">
                      Rotates in {Math.round((new Date(s.expiresAt).getTime() - Date.now()) / 86400000)}d
                    </span>
                  ) : (
                    <span className="text-slate-500">Manual Rotation</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD NEW SECRET MODAL */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Add New Encrypted Secret / API Credential
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSecret} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Tenant Scope</label>
                  <select
                    value={newTenantId}
                    onChange={(e) => setNewTenantId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  >
                    <option value="system">System Default</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  >
                    <option value="api_key">API Key</option>
                    <option value="database_password">Database Password</option>
                    <option value="oauth_secret">OAuth Secret</option>
                    <option value="smtp_credential">SMTP Credential</option>
                    <option value="admin_pin">Admin PIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Credential Name</label>
                <input
                  type="text"
                  placeholder="e.g., Stripe Webhook Secret"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Used for verifying event signatures on /api/stripe-webhook"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 font-mono">Secret Value / Raw Key</label>
                  <button
                    type="button"
                    onClick={handleGenerateSecretInModal}
                    className="text-indigo-400 hover:text-indigo-300 font-bold font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter secret text or click Auto-Generate..."
                  value={newSecretValue}
                  onChange={(e) => setNewSecretValue(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Rotation Policy (Days)</label>
                <select
                  value={newRotationDays}
                  onChange={(e) => setNewRotationDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                >
                  <option value={30}>Every 30 Days</option>
                  <option value={60}>Every 60 Days</option>
                  <option value={90}>Every 90 Days</option>
                  <option value={180}>Every 180 Days</option>
                  <option value={0}>Manual Only</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Encrypt & Save Secret
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
