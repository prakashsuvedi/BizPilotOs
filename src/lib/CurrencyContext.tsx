import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Currency = 'USD' | 'NPR' | 'INR' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'JPY' | string;

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Conversion rate from 1 USD
  formatPrefix?: string;
  formatSuffix?: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs. ', rate: 133.5 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.5 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', rate: 3.67 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 1.36 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', rate: 1.52 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 155.0 },
];

export const CURRENCY_RATE_MAP: Record<string, number> = {
  USD: 1.0,
  NPR: 133.5,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 155.0,
};

export const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  USD: '$',
  NPR: 'Rs. ',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
};

interface CurrencyContextType {
  currency: Currency;
  currentCurrency: Currency;
  setCurrency: (c: Currency, targetTenantId?: string) => void;
  formatCurrency: (amountInUsd: number, overrideCurrency?: Currency) => string;
  formatAmount: (amount: number, overrideCurrency?: Currency) => string;
  convertAmount: (amount: number, fromCurrency?: string, toCurrency?: string) => number;
  supportedCurrencies: CurrencyConfig[];
  syncTenantCurrency: (tenantId: string, initialCurrency?: string) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Helper to determine active tenant ID from session or query
function getActiveTenantId(): string | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fromQuery = urlParams.get('tenant') || urlParams.get('slug') || urlParams.get('t');
    if (fromQuery) return fromQuery;

    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (path && !['admin', 'login', 'signup', 'register'].includes(path.toLowerCase())) {
      const segs = path.split('/');
      if (segs.length === 1 && !segs[0].includes('.')) return segs[0];
      if (segs.length >= 2 && ['t', 'tenant', 'b', 'workspace'].includes(segs[0])) return segs[1];
    }

    const sessionRaw = localStorage.getItem('marketforge_user_session');
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session && session.tenantId) return session.tenantId;
    }

    const simulated = localStorage.getItem('mf_simulated_tenant');
    if (simulated) return simulated;

    const activeTenant = localStorage.getItem('marketforge_active_tenant');
    if (activeTenant) return activeTenant;
  } catch (e) {
    // ignore
  }
  return null;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const activeTenant = getActiveTenantId();
      if (activeTenant) {
        const tenantSpecific = localStorage.getItem(`marketforge_currency_${activeTenant}`);
        if (tenantSpecific) return tenantSpecific;
      }
      const saved = localStorage.getItem('marketforge_currency');
      if (saved) return saved;
    } catch (e) {}
    return 'USD';
  });

  // Sync with tenant storage on mount / URL changes
  useEffect(() => {
    const activeTenant = getActiveTenantId();
    if (activeTenant) {
      const tenantSpecific = localStorage.getItem(`marketforge_currency_${activeTenant}`);
      if (tenantSpecific && tenantSpecific !== currency) {
        setCurrencyState(tenantSpecific);
        return;
      }
    }
    const saved = localStorage.getItem('marketforge_currency');
    if (saved && saved !== currency) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = useCallback((newCurr: Currency, targetTenantId?: string) => {
    const cleanCurr = (newCurr || 'USD').toUpperCase().trim();
    setCurrencyState(cleanCurr);

    try {
      // 1. Save globally in browser storage
      localStorage.setItem('marketforge_currency', cleanCurr);

      // 2. Determine tenant context
      const effectiveTenant = targetTenantId || getActiveTenantId();
      if (effectiveTenant) {
        // Save tenant-specific key for instant retrieval
        localStorage.setItem(`marketforge_currency_${effectiveTenant}`, cleanCurr);

        // Also update the tenant object in master cache if exists
        const masterRaw = localStorage.getItem('marketforge_sa_tenants');
        if (masterRaw) {
          const list = JSON.parse(masterRaw);
          const updated = list.map((t: any) => {
            if (t.id === effectiveTenant) {
              return {
                ...t,
                currency: cleanCurr,
                settings: { ...(t.settings || {}), currencyCode: cleanCurr }
              };
            }
            return t;
          });
          localStorage.setItem('marketforge_sa_tenants', JSON.stringify(updated));
        }

        // 3. Asynchronously persist to backend API & Firestore
        fetch('/api/tenant/update-currency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId: effectiveTenant, currency: cleanCurr })
        }).catch((err) => {
          console.warn('[Currency Sync] Non-blocking server sync error:', err);
        });
      }
    } catch (e) {
      console.warn('[Currency] Error saving currency preference:', e);
    }
  }, []);

  const syncTenantCurrency = useCallback(async (tenantId: string, initialCurrency?: string) => {
    if (!tenantId) return;
    try {
      if (initialCurrency) {
        setCurrency(initialCurrency, tenantId);
        return;
      }

      // Check tenant local cache
      const cached = localStorage.getItem(`marketforge_currency_${tenantId}`);
      if (cached) {
        setCurrencyState(cached);
        return;
      }

      // Query tenant record from API
      const res = await fetch(`/api/tenant/details?slug=${encodeURIComponent(tenantId)}`);
      if (res.ok) {
        const data = await res.json();
        const serverCurr = data?.tenant?.currency || data?.tenant?.settings?.currencyCode;
        if (serverCurr) {
          localStorage.setItem(`marketforge_currency_${tenantId}`, serverCurr);
          setCurrencyState(serverCurr);
          return;
        }
      }
    } catch (err) {
      console.warn('[Currency] Failed to fetch server currency for tenant:', err);
    }
  }, [setCurrency]);

  const convertAmount = useCallback((amount: number, fromCurrency = 'USD', toCurrency = currency): number => {
    const fromRate = CURRENCY_RATE_MAP[fromCurrency.toUpperCase()] || 1.0;
    const toRate = CURRENCY_RATE_MAP[toCurrency.toUpperCase()] || 1.0;
    const inUsd = amount / fromRate;
    return inUsd * toRate;
  }, [currency]);

  const formatCurrency = useCallback((amountInUsd: number, overrideCurrency?: Currency): string => {
    const activeCurr = (overrideCurrency || currency || 'USD').toUpperCase();
    const rate = CURRENCY_RATE_MAP[activeCurr] || 1.0;
    const symbol = CURRENCY_SYMBOL_MAP[activeCurr] || `${activeCurr} `;
    const converted = amountInUsd * rate;

    // Formatting based on currency precision convention
    if (activeCurr === 'NPR') {
      const rounded = Math.round(converted);
      return `Rs. ${rounded.toLocaleString()}`;
    }
    if (activeCurr === 'INR') {
      const rounded = Math.round(converted);
      return `₹${rounded.toLocaleString()}`;
    }
    if (activeCurr === 'JPY') {
      const rounded = Math.round(converted);
      return `¥${rounded.toLocaleString()}`;
    }
    if (activeCurr === 'EUR') {
      return `€${converted.toFixed(2)}`;
    }
    if (activeCurr === 'GBP') {
      return `£${converted.toFixed(2)}`;
    }
    if (activeCurr === 'AED') {
      return `AED ${converted.toFixed(2)}`;
    }
    if (activeCurr === 'CAD') {
      return `CA$${converted.toFixed(2)}`;
    }
    if (activeCurr === 'AUD') {
      return `AU$${converted.toFixed(2)}`;
    }

    // Default USD
    if (activeCurr === 'USD') {
      return `$${converted.toFixed(2)}`;
    }

    return `${symbol}${converted.toFixed(2)}`;
  }, [currency]);

  const formatAmount = useCallback((amount: number, overrideCurrency?: Currency): string => {
    return formatCurrency(amount, overrideCurrency);
  }, [formatCurrency]);

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        currentCurrency: currency, 
        setCurrency, 
        formatCurrency, 
        formatAmount, 
        convertAmount, 
        supportedCurrencies: SUPPORTED_CURRENCIES,
        syncTenantCurrency 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
