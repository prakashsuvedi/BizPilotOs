/**
 * Enterprise Zero-Knowledge Tenant Secrets & Password Vault Engine
 * 
 * Manages encrypted API keys, database credentials, OAuth client secrets, SSL certificates,
 * and tenant admin PINs with AES-256 simulated encryption, strength scoring, and automated rotation tracking.
 */

export interface SecretEntry {
  id: string;
  tenantId: string;
  category: 'api_key' | 'database_password' | 'oauth_secret' | 'smtp_credential' | 'ssl_certificate' | 'admin_pin';
  name: string;
  description: string;
  maskedValue: string;
  encryptedValue: string;
  salt: string;
  iv: string;
  updatedAt: string;
  expiresAt: string | null;
  rotationDays: number; // e.g. 30, 60, 90 or 0 (disabled)
  lastRotatedAt: string;
  strengthScore: number; // 0 - 100
  plainTextPreview?: string; // transient unmasked state
}

export interface PasswordStrengthResult {
  score: number; // 0 to 100
  label: 'Weak' | 'Moderate' | 'Strong' | 'Enterprise Grade';
  entropyBits: number;
  suggestions: string[];
}

const STORAGE_KEY = 'marketforge_tenant_secrets_vault_v1';

const INITIAL_VAULT_SECRETS: SecretEntry[] = [
  {
    id: 'sec_stripe_live_key',
    tenantId: 'system',
    category: 'api_key',
    name: 'Stripe Payment Live Secret Key',
    description: 'Production API key used by Commerce & Subscription billing engines.',
    maskedValue: 'sk_live_51M************************9f2A',
    encryptedValue: 'AES256:7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    salt: 'salt_8f9a2b',
    iv: 'iv_3c4d5e6f',
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 75 * 86400000).toISOString(),
    rotationDays: 90,
    lastRotatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    strengthScore: 96,
  },
  {
    id: 'sec_gemini_api_key',
    tenantId: 'system',
    category: 'api_key',
    name: 'Gemini 2.5 Flash Production Key',
    description: 'Server-side API key powering AI Strategist and Marketing Package Generator.',
    maskedValue: 'AIzaSy************************x81Y',
    encryptedValue: 'AES256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    salt: 'salt_1a2b3c',
    iv: 'iv_9e0f1a2b',
    updatedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
    rotationDays: 60,
    lastRotatedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    strengthScore: 92,
  },
  {
    id: 'sec_db_root_pass',
    tenantId: 'system',
    category: 'database_password',
    name: 'Cloud SQL / PostgreSQL Root Credential',
    description: 'Database superuser password for multi-tenant schema migrations.',
    maskedValue: 'P@ss****************!9',
    encryptedValue: 'AES256:3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    salt: 'salt_3c4d5e',
    iv: 'iv_7a8b9c0d',
    updatedAt: new Date(Date.now() - 85 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 5 * 86400000).toISOString(), // EXPIRED ALERT
    rotationDays: 60,
    lastRotatedAt: new Date(Date.now() - 85 * 86400000).toISOString(),
    strengthScore: 88,
  },
  {
    id: 'sec_tenant_bistro_pin',
    tenantId: 'restaurant-tenant',
    category: 'admin_pin',
    name: 'Bistro POS Master Manager PIN',
    description: 'Master override PIN for restaurant discount & void operations.',
    maskedValue: '****',
    encryptedValue: 'AES256:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    salt: 'salt_5e6f7a',
    iv: 'iv_1e2f3a4b',
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    expiresAt: null,
    rotationDays: 0,
    lastRotatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    strengthScore: 70,
  },
  {
    id: 'sec_resend_smtp_key',
    tenantId: 'system',
    category: 'smtp_credential',
    name: 'Resend Email SMTP Auth Token',
    description: 'Transactional email API token for tenant onboarding welcome messages.',
    maskedValue: 're_************************k3L9',
    encryptedValue: 'AES256:9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    salt: 'salt_9c0d1e',
    iv: 'iv_5a6b7c8d',
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 175 * 86400000).toISOString(),
    rotationDays: 180,
    lastRotatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    strengthScore: 94,
  },
];

/**
 * Calculates cryptographic password entropy and strength score.
 */
export function calculatePasswordEntropyAndStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, label: 'Weak', entropyBits: 0, suggestions: ['Enter a password to evaluate strength'] };
  }

  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

  const entropyBits = Math.round(password.length * Math.log2(Math.max(1, charsetSize)));
  const suggestions: string[] = [];

  if (password.length < 12) suggestions.push('Use at least 12-16 characters for enterprise keys.');
  if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase characters (A-Z).');
  if (!/[0-9]/.test(password)) suggestions.push('Add numeric digits (0-9).');
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Include special symbols (!@#$%^&*).');

  let score = Math.min(100, Math.round((entropyBits / 128) * 100));
  if (password.length >= 16) score = Math.min(100, score + 10);

  let label: 'Weak' | 'Moderate' | 'Strong' | 'Enterprise Grade' = 'Weak';
  if (score >= 90) label = 'Enterprise Grade';
  else if (score >= 75) label = 'Strong';
  else if (score >= 50) label = 'Moderate';

  return { score, label, entropyBits, suggestions };
}

/**
 * Generates a cryptographically strong random password / key string.
 */
export function generateSecureSecret(length = 24, includeSymbols = true): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const fullSet = includeSymbols ? chars + symbols : chars;

  let result = '';
  const cryptoObj = window.crypto || (window as any).msCrypto;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const randomValues = new Uint32Array(length);
    cryptoObj.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += fullSet[randomValues[i] % fullSet.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += fullSet.charAt(Math.floor(Math.random() * fullSet.length));
    }
  }
  return result;
}

/**
 * Loads vault secrets from storage or initializes seed defaults.
 */
export function getVaultSecrets(): SecretEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse secrets vault:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VAULT_SECRETS));
  return INITIAL_VAULT_SECRETS;
}

/**
 * Saves secrets list back to storage.
 */
export function saveVaultSecrets(secrets: SecretEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(secrets));
  } catch (err) {
    console.error('Failed to save secrets vault:', err);
  }
}

/**
 * Rotates a secret value, updating its timestamp and strength score.
 */
export function rotateSecretValue(secretId: string, newSecretText: string): SecretEntry | null {
  const secrets = getVaultSecrets();
  const index = secrets.findIndex((s) => s.id === secretId);
  if (index === -1) return null;

  const target = secrets[index];
  const strength = calculatePasswordEntropyAndStrength(newSecretText);

  const prefix = newSecretText.length > 8 ? newSecretText.substring(0, 4) : '***';
  const suffix = newSecretText.length > 8 ? newSecretText.substring(newSecretText.length - 4) : '***';
  const maskedValue = `${prefix}${'*'.repeat(Math.max(6, newSecretText.length - 8))}${suffix}`;

  const updated: SecretEntry = {
    ...target,
    maskedValue,
    encryptedValue: `AES256:${Array.from({ length: 64 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')}`,
    updatedAt: new Date().toISOString(),
    lastRotatedAt: new Date().toISOString(),
    expiresAt: target.rotationDays > 0 ? new Date(Date.now() + target.rotationDays * 86400000).toISOString() : null,
    strengthScore: strength.score,
  };

  secrets[index] = updated;
  saveVaultSecrets(secrets);
  return updated;
}

/**
 * Adds a new secret entry to the vault.
 */
export function createSecretEntry(
  tenantId: string,
  category: SecretEntry['category'],
  name: string,
  description: string,
  secretText: string,
  rotationDays = 60
): SecretEntry {
  const secrets = getVaultSecrets();
  const strength = calculatePasswordEntropyAndStrength(secretText);

  const prefix = secretText.length > 8 ? secretText.substring(0, 4) : '***';
  const suffix = secretText.length > 8 ? secretText.substring(secretText.length - 4) : '***';
  const maskedValue = `${prefix}${'*'.repeat(Math.max(6, secretText.length - 8))}${suffix}`;

  const newEntry: SecretEntry = {
    id: `sec_${Date.now().toString(36)}_${Math.floor(100 + Math.random() * 900)}`,
    tenantId,
    category,
    name,
    description,
    maskedValue,
    encryptedValue: `AES256:${Array.from({ length: 64 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')}`,
    salt: `salt_${Math.random().toString(36).substring(2, 8)}`,
    iv: `iv_${Math.random().toString(36).substring(2, 10)}`,
    updatedAt: new Date().toISOString(),
    lastRotatedAt: new Date().toISOString(),
    expiresAt: rotationDays > 0 ? new Date(Date.now() + rotationDays * 86400000).toISOString() : null,
    rotationDays,
    strengthScore: strength.score,
  };

  secrets.unshift(newEntry);
  saveVaultSecrets(secrets);
  return newEntry;
}

/**
 * Deletes a secret from the vault.
 */
export function deleteSecretEntry(secretId: string): boolean {
  const secrets = getVaultSecrets();
  const filtered = secrets.filter((s) => s.id !== secretId);
  saveVaultSecrets(filtered);
  return filtered.length < secrets.length;
}

/**
 * Downloads an encrypted JSON vault backup snapshot.
 */
export function downloadVaultSecretsBackup() {
  const secrets = getVaultSecrets();
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    vaultVersion: '1.0.0-AES256-GCM',
    cipherAlgorithm: 'AES-256-GCM',
    secretCount: secrets.length,
    secrets: secrets.map(({ plainTextPreview, ...s }) => s),
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `marketforge_tenant_secrets_vault_backup_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
