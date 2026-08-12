/**
 * Automated Tenant Backup & Snapshot Restore Engine
 * 
 * Provides point-in-time state snapshots for multi-tenant environments.
 * Allows SuperAdmins and Tenant Owners to export, snapshot, and restore tenant configurations,
 * custom branding, domain mappings, and operational records without data corruption.
 */

import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, addDoc } from 'firebase/firestore';
import { clientDb } from './firebase';
import { CURRENT_SYSTEM_SCHEMA_VERSION, TenantSystemConfig } from './schemaMigrationManager';

export interface TenantBackupSnapshot {
  id: string;
  tenantId: string;
  tenantName: string;
  createdAt: string;
  createdBy: string;
  schemaVersion: string;
  description: string;
  data: {
    tenantConfig: any;
    brandingConfig?: any;
    domainConfig?: any;
    campaignProfilesCount?: number;
    guidelinesCount?: number;
    customFields?: Record<string, any>;
  };
}

/**
 * Creates a point-in-time snapshot of a tenant's complete configuration state.
 */
export async function createTenantBackupSnapshot(
  tenantId: string,
  tenantData: any,
  description: string = 'Automated Version Upgrade Snapshot',
  operatorEmail: string = 'admin@system.local'
): Promise<TenantBackupSnapshot> {
  const snapshotId = `backup_${tenantId}_${Date.now()}`;
  const timestamp = new Date().toISOString();

  const backupPayload: TenantBackupSnapshot = {
    id: snapshotId,
    tenantId,
    tenantName: tenantData.name || tenantId,
    createdAt: timestamp,
    createdBy: operatorEmail,
    schemaVersion: tenantData._systemMeta?.schemaVersion || CURRENT_SYSTEM_SCHEMA_VERSION,
    description,
    data: {
      tenantConfig: { ...tenantData },
      brandingConfig: tenantData.whiteLabelBranding || tenantData.branding || null,
      domainConfig: {
        customDomain: tenantData.customDomain || null,
        domainVerified: tenantData.domainVerified || false,
        sslStatus: tenantData.sslStatus || 'active',
      },
      customFields: tenantData.customConfigurations || {},
    },
  };

  // Persist backup record to Firestore in 'tenant_backups' collection if DB is connected
  try {
    if (clientDb) {
      await setDoc(doc(clientDb, 'tenant_backups', snapshotId), backupPayload);
    }
  } catch (err) {
    console.warn('[TenantBackupEngine] Firestore backup save warning:', err);
  }

  // Also save in localStorage for instant offline access & fallback
  try {
    const existing = JSON.parse(localStorage.getItem(`mf_backups_${tenantId}`) || '[]');
    existing.unshift(backupPayload);
    localStorage.setItem(`mf_backups_${tenantId}`, JSON.stringify(existing.slice(0, 20))); // keep max 20 snapshots locally
  } catch (err) {
    console.warn('[TenantBackupEngine] LocalStorage backup error:', err);
  }

  return backupPayload;
}

/**
 * Retrieves all available snapshots for a given tenant.
 */
export async function getTenantBackupSnapshots(tenantId: string): Promise<TenantBackupSnapshot[]> {
  const snapshots: TenantBackupSnapshot[] = [];

  // Try fetching from Firestore first
  try {
    if (clientDb) {
      const q = query(
        collection(clientDb, 'tenant_backups'),
        where('tenantId', '==', tenantId),
        limit(20)
      );
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        snapshots.push(docSnap.data() as TenantBackupSnapshot);
      });
    }
  } catch (err) {
    console.warn('[TenantBackupEngine] Error fetching Firestore backups:', err);
  }

  // Fallback / merge with local storage
  try {
    const local = JSON.parse(localStorage.getItem(`mf_backups_${tenantId}`) || '[]');
    local.forEach((locSnap: TenantBackupSnapshot) => {
      if (!snapshots.some((s) => s.id === locSnap.id)) {
        snapshots.push(locSnap);
      }
    });
  } catch (err) {
    // Ignore parse error
  }

  return snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Downloads a backup snapshot as a JSON file.
 */
export function downloadBackupSnapshotJson(snapshot: TenantBackupSnapshot) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tenant_${snapshot.tenantId}_backup_${snapshot.createdAt.replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restores a tenant state safely from a snapshot without destroying new system metadata fields.
 */
export function prepareTenantRestore(
  currentTenantData: any,
  snapshot: TenantBackupSnapshot
): any {
  const restoredConfig = { ...snapshot.data.tenantConfig };

  // Ensure current system metadata & schema version are preserved
  restoredConfig._systemMeta = {
    schemaVersion: CURRENT_SYSTEM_SCHEMA_VERSION,
    lastMigrationTimestamp: new Date().toISOString(),
    restoredFromSnapshot: snapshot.id,
    customConfigurations: snapshot.data.customFields || {},
    tenantPreferences: {
      customDomain: snapshot.data.domainConfig?.customDomain || currentTenantData?.customDomain,
      whiteLabelBranding: snapshot.data.brandingConfig || currentTenantData?.whiteLabelBranding,
    },
  };

  return restoredConfig;
}
