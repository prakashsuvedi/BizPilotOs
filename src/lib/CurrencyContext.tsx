import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'NPR' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatCurrency: (amountInUsd: number, overrideCurrency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const saved = localStorage.getItem('marketforge_currency') as Currency;
    if (saved === 'NPR' || saved === 'USD' || saved === 'INR') {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('marketforge_currency', c);
  };

  const formatCurrency = (amountInUsd: number, overrideCurrency?: Currency) => {
    const activeCurr = overrideCurrency || currency;
    if (activeCurr === 'NPR') {
      const converted = Math.round(amountInUsd * 133);
      return `Rs. ${converted.toLocaleString()}`;
    }
    if (activeCurr === 'INR') {
      const converted = Math.round(amountInUsd * 83);
      return `₹${converted.toLocaleString()}`;
    }
    return `$${amountInUsd.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
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

