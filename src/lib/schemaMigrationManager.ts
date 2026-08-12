/**
 * Schema Migration Manager & Tenant Configuration Provisioning Engine
 * 
 * Guarantees zero-downtime, non-destructive database versioning across releases.
 * Protects tenant custom configurations, custom domain mappings, and theme options from
 * breaking or overwriting when new SaaS software versions or schema fields are deployed.
 */

export interface TenantSystemConfig {
  schemaVersion: string;
  lastMigrationTimestamp: string;
  customConfigurations: Record<string, any>;
  tenantPreferences: {
    customDomain?: string;
    whiteLabelBranding?: Record<string, any>;
    featureFlags?: Record<string, boolean>;
    apiKeysMasked?: Record<string, string>;
  };
  fieldOverrides?: Record<string, any>;
}

export const CURRENT_SYSTEM_SCHEMA_VERSION = "2.4.0";

/**
 * Ensures that fetching any tenant document safely injects missing default fields from
 * newer software releases without mutating or overwriting the tenant's existing customized data.
 */
export function migrateTenantDataToCurrentVersion<T extends Record<string, any>>(
  tenantData: T,
  defaultSchemaFields: Partial<T>
): T & { _systemMeta: TenantSystemConfig } {
  if (!tenantData) {
    return {
      ...defaultSchemaFields,
      _systemMeta: {
        schemaVersion: CURRENT_SYSTEM_SCHEMA_VERSION,
        lastMigrationTimestamp: new Date().toISOString(),
        customConfigurations: {},
        tenantPreferences: {},
      },
    } as any;
  }

  const existingMeta: TenantSystemConfig = tenantData._systemMeta || {
    schemaVersion: "1.0.0",
    lastMigrationTimestamp: new Date().toISOString(),
    customConfigurations: {},
    tenantPreferences: {
      customDomain: tenantData.customDomain || tenantData.domain,
      whiteLabelBranding: tenantData.whiteLabelBranding || tenantData.branding,
    },
  };

  // Merge default schema fields safely (only inject if undefined in tenantData)
  const mergedData: any = { ...tenantData };
  Object.keys(defaultSchemaFields).forEach((key) => {
    if (mergedData[key] === undefined) {
      mergedData[key] = defaultSchemaFields[key];
    }
  });

  // Preserve tenant custom configurations across release updates
  mergedData._systemMeta = {
    ...existingMeta,
    schemaVersion: CURRENT_SYSTEM_SCHEMA_VERSION,
    lastMigrationTimestamp: new Date().toISOString(),
    tenantPreferences: {
      ...existingMeta.tenantPreferences,
      customDomain: mergedData.customDomain || existingMeta.tenantPreferences?.customDomain,
      whiteLabelBranding: mergedData.whiteLabelBranding || existingMeta.tenantPreferences?.whiteLabelBranding,
    },
  };

  return mergedData;
}

/**
 * Validates whether a tenant configuration structure is backward compatible with current release.
 */
export function validateTenantSchemaCompatibility(tenantData: any): {
  isCompatible: boolean;
  currentVersion: string;
  targetVersion: string;
  missingFields: string[];
} {
  const version = tenantData?._systemMeta?.schemaVersion || "1.0.0";
  const requiredFields = ["id", "name", "plan"];
  const missingFields = requiredFields.filter((f) => tenantData?.[f] === undefined);

  return {
    isCompatible: missingFields.length === 0,
    currentVersion: version,
    targetVersion: CURRENT_SYSTEM_SCHEMA_VERSION,
    missingFields,
  };
}
