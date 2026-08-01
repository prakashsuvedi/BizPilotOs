// MarketForge AI - Enterprise Globalization Engine (Phase 4)
// Automatically configures localization settings, payment specs, tax parameters and defaults based on Selected Country.

export interface LocalizationConfig {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  language: string;
  taxName: string;
  taxRate: number; // percentage e.g. 13
  fiscalYearStart: string; // "MM-DD"
  businessCategoryDefault: string;
  industryDefault: string;
  paymentProviders: string[];
  regionalCompliance: string;
  businessDefaults: {
    address: string;
    phone: string;
    website: string;
  };
}

export const GLOBALIZATION_PROFILES: Record<string, LocalizationConfig> = {
  US: {
    countryCode: "US",
    countryName: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "hh:mm A",
    numberFormat: "en-US",
    language: "en",
    taxName: "Sales Tax",
    taxRate: 8.875,
    fiscalYearStart: "10-01",
    businessCategoryDefault: "SaaS Enterprise",
    industryDefault: "Technology & Professional Services",
    paymentProviders: ["stripe", "paypal", "paddle"],
    regionalCompliance: "GDPR / CCPA / SOC2 compliant",
    businessDefaults: {
      address: "120 Pine Street, Suite 400, New York, NY 10005",
      phone: "+1 (212) 555-0190",
      website: "https://democorp.marketforge.ai"
    }
  },
  NP: {
    countryCode: "NP",
    countryName: "Nepal",
    currencyCode: "NPR",
    currencySymbol: "रु",
    timezone: "Asia/Kathmandu",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "HH:mm",
    numberFormat: "ne-NP",
    language: "ne",
    taxName: "VAT",
    taxRate: 13.0,
    fiscalYearStart: "04-01", // Bikram Sambat fiscal cycles
    businessCategoryDefault: "E-Commerce & Hospitality",
    industryDefault: "Tourism & Tech Retail",
    paymentProviders: ["khalti", "esewa", "fonespay"],
    regionalCompliance: "Nepal IRD Registered VAT compliant",
    businessDefaults: {
      address: "Lalitpur Tech Hub, Pulchowk Ward 3, Lalitpur 44600",
      phone: "+977 (1) 555-9830",
      website: "https://democorp.marketforge.ai/t/nepal"
    }
  },
  IN: {
    countryCode: "IN",
    countryName: "India",
    currencyCode: "INR",
    currencySymbol: "₹",
    timezone: "Asia/Kolkata",
    dateFormat: "DD-MM-YYYY",
    timeFormat: "hh:mm A",
    numberFormat: "en-IN",
    language: "hi",
    taxName: "GST",
    taxRate: 18.0,
    fiscalYearStart: "04-01",
    businessCategoryDefault: "FinTech & IT Services",
    industryDefault: "Digital Commerce & Consulting",
    paymentProviders: ["razorpay", "upi", "paytm"],
    regionalCompliance: "GSTIN and RBI Online Compliance ready",
    businessDefaults: {
      address: "Salarpuria Tech Park, 7th Block Koramangala, Bengaluru 560095",
      phone: "+91 (80) 5550-9833",
      website: "https://democorp.marketforge.ai/t/india"
    }
  },
  GB: {
    countryCode: "GB",
    countryName: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
    timezone: "Europe/London",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    numberFormat: "en-GB",
    language: "en",
    taxName: "VAT",
    taxRate: 20.0,
    fiscalYearStart: "04-06",
    businessCategoryDefault: "B2B Professional Agency",
    industryDefault: "Legal & Digital Finance",
    paymentProviders: ["stripe", "paddle", "gocardless"],
    regionalCompliance: "UK HMRC VAT / GDPR certified",
    businessDefaults: {
      address: "32 London Wall, London EC2M 5QD",
      phone: "+44 (20) 7946-0192",
      website: "https://democorp.marketforge.ai/t/uk"
    }
  },
  AU: {
    countryCode: "AU",
    countryName: "Australia",
    currencyCode: "AUD",
    currencySymbol: "$",
    timezone: "Australia/Sydney",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "hh:mm A",
    numberFormat: "en-AU",
    language: "en",
    taxName: "GST",
    taxRate: 10.0,
    fiscalYearStart: "07-01",
    businessCategoryDefault: "Creative Solutions Group",
    industryDefault: "Agency & Digital Media",
    paymentProviders: ["stripe", "paypal", "afterpay"],
    regionalCompliance: "ATO ABN / GST Registered",
    businessDefaults: {
      address: "Level 14, 201 Elizabeth Street, Sydney NSW 2000",
      phone: "+61 (2) 9876-5432",
      website: "https://democorp.marketforge.ai/t/australia"
    }
  },
  JP: {
    countryCode: "JP",
    countryName: "Japan",
    currencyCode: "JPY",
    currencySymbol: "¥",
    timezone: "Asia/Tokyo",
    dateFormat: "YYYY/MM/DD",
    timeFormat: "HH:mm",
    numberFormat: "ja-JP",
    language: "ja",
    taxName: "Consumption Tax",
    taxRate: 10.0,
    fiscalYearStart: "04-01",
    businessCategoryDefault: "High-Tech Manufacturing & Retail",
    industryDefault: "Tech R&D & Logistics",
    paymentProviders: ["stripe", "paypay", "konbini"],
    regionalCompliance: "NTA Invoice Qualified System active",
    businessDefaults: {
      address: "Roppongi Hills North Tower 12F, Minato-ku, Tokyo 106-6108",
      phone: "+81 (3) 5555-0143",
      website: "https://democorp.marketforge.ai/t/japan"
    }
  },
  DE: {
    countryCode: "DE",
    countryName: "Germany (Europe)",
    currencyCode: "EUR",
    currencySymbol: "€",
    timezone: "Europe/Berlin",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "HH:mm",
    numberFormat: "de-DE",
    language: "de",
    taxName: "Mehrwertsteuer (MwSt)",
    taxRate: 19.0,
    fiscalYearStart: "01-01",
    businessCategoryDefault: "Engineering & Enterprise Automation",
    industryDefault: "Infrastructure Software",
    paymentProviders: ["stripe", "sofort", "giropay"],
    regionalCompliance: "DSGVO / GDPR strict compliance check",
    businessDefaults: {
      address: "Kurfürstendamm 194, 10707 Berlin",
      phone: "+49 (30) 5550-1289",
      website: "https://democorp.marketforge.ai/t/germany"
    }
  },
  AE: {
    countryCode: "AE",
    countryName: "United Arab Emirates (Middle East)",
    currencyCode: "AED",
    currencySymbol: "د.إ",
    timezone: "Asia/Dubai",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "hh:mm A",
    numberFormat: "ar-AE",
    language: "ar",
    taxName: "VAT",
    taxRate: 5.0,
    fiscalYearStart: "01-01",
    businessCategoryDefault: "Luxury Properties & Logistics",
    industryDefault: "Finance & Global Trade",
    paymentProviders: ["stripe", "paypal", "payfort"],
    regionalCompliance: "FTA UAE Corporate VAT Compliant",
    businessDefaults: {
      address: "Downtown Boulevard, Burj Plaza Tower 2, Dubai",
      phone: "+971 (4) 555-0142",
      website: "https://democorp.marketforge.ai/t/uae"
    }
  }
};

export function getGlobalizationSettings(countryCode: string): LocalizationConfig {
  return GLOBALIZATION_PROFILES[countryCode.toUpperCase()] || GLOBALIZATION_PROFILES.US;
}
