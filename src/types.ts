export interface BusinessProfile {
  id: string;
  tenantId?: string;
  name: string;
  industry: string;
  category: string;
  description: string;
  targetAudience: string;
  brandVoice: string;
  logoUrl?: string;
  websiteUrl?: string;
  modelWeightLeads?: number;
  modelWeightSales?: number;
  modelWeightRetention?: number;
}

export interface CustomerPersona {
  name: string;
  role: string;
  demographics: string;
  painPoints: string[];
  goals: string[];
  preferredChannels: string[];
  buyingTriggers: string;
}

export interface MarketPositioning {
  tagline: string;
  elevatorPitch: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  valueProposition: string;
  competitorDefenses: string;
}

export interface CampaignDay {
  day: string;
  channel: string;
  title: string;
  description: string;
  goal: string;
}

export interface CampaignPlan {
  id?: string;
  campaignName: string;
  objective: string;
  durationWeeks: number;
  channels: string[];
  launchCalendar: CampaignDay[];
  strategicKPIs: string[];
  strategyId?: string;
  strategyVersion?: number;
  targetMarket?: 'Native/Local' | 'United States' | 'Western Europe' | 'South Asia' | 'Gulf Regions' | string;
  predictedOutcomes?: {
    lowCase?: { [key: string]: any };
    expectedCase?: { [key: string]: any };
    bestCase?: { [key: string]: any };
  };
  executionStatus?: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  executionStartDate?: string;
  executionEndDate?: string;
  associatedOutcomeLogIds?: string[];
  trackRecord?: {
    totalRuns: number;
    successCount: number;
    avgAccuracy: number;
    confidenceScore: number;
  };
}

export interface ContentAsset {
  id: string;
  type: 'social' | 'ad' | 'email' | 'sales_pitch';
  title: string;
  body: string;
  headline?: string;
  callToAction: string;
  channelName: string;
  createdAt: string;
}

export interface BrandGuideline {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  typographyHeading: string;
  typographyBody: string;
  visualVibe: string;
  vibeDescription: string;
  logoPlacementRules: string[];
  doAndDont: {
    dos: string[];
    donts: string[];
  };
  assetChecklist: string[];
}

export interface ModulePrice {
  id: string;
  name: string;
  category: 'base' | 'addon';
  priceNpr: number;
  priceUsd: number;
  description: string;
  isFree?: boolean;
}

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  ownerEmail: string;
  isCustom?: boolean;
  status: 'active' | 'suspended';
  plan: 'Basic' | 'Growth' | 'Pro' | 'Enterprise' | 'Custom';
  mrr: number;
  trialDaysLeft?: number;
  activeUsers?: number;
  storageMb?: number;
  health?: 'Healthy' | 'Degraded';
  apiRequests?: number;
  pdfExports?: number;
  imageGenerations?: number;
  knowledgeAssets?: number;
  disabledModules?: string[];
  activatedModules?: string[];
  subscriptionPriceNpr?: number;
  paymentGateway?: 'stripe' | 'esewa' | 'khalti' | 'fonepay' | 'manual';
  paymentStatus?: 'active' | 'pending' | 'failed';
  createdAt?: string;
}

export type AgentType = 'strategist' | 'planner' | 'writer' | 'creative';

export interface AgentStatus {
  id: AgentType;
  name: string;
  title: string;
  avatar: string;
  description: string;
  status: 'idle' | 'analyzing' | 'completed' | 'failed';
  lastAction?: string;
}

export type SubscriptionPlan = 'free' | 'pro' | 'agency' | 'Starter' | 'Growth' | 'Agency' | 'Enterprise';

export interface AgencyWhiteLabelConfig {
  agencyName: string;
  primaryColor: string;
  logoUrl: string;
  isEnabled: boolean;
}

export interface OptimizedAsset {
  id: string;
  name: string;
  type: string;
  category: 'image' | 'pdf' | 'metadata' | 'creative';
  isPermanent: boolean;
  originalSize: number; // in bytes
  optimizedSize: number; // in bytes
  uploadedAt: string; // ISO datetime string
  expiresAt: string | null; // ISO datetime string or null if permanent
  isThumbnail: boolean;
  hasThumbnail: boolean;
  thumbnailId?: string;
  format: 'webp' | 'pdf' | 'json';
  planAtCreation: SubscriptionPlan;
  reductionPercentage: number;
}

export interface StorageMetrics {
  totalOriginalSize: number;
  totalOptimizedSize: number;
  totalSavingsPercent: number;
  unoptimizedVirtualCost: number; // monthly run-rate in USD
  optimizedCost: number; // monthly run-rate in USD
  temporaryCount: number;
  permanentCount: number;
  purgedCount: number;
}

export type KnowledgeCategory = 'company' | 'product' | 'service' | 'industry' | 'customer_segment' | 'competitor' | 'brand_voice' | 'key_message';

export interface KnowledgeItem {
  id: string;
  tenantId: string;
  category: KnowledgeCategory;
  title: string;
  content: Record<string, any>;
  source: 'website_url' | 'profile_pdf' | 'catalog_pdf' | 'brochure' | 'manual' | 'manual_entry';
  sourceDetail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  confidenceScore: number; // 0-100 indicating extraction confidence
}

export interface KnowledgeRelationship {
  id: string;
  fromId: string;
  toId: string;
  type: string; // e.g. 'offered_by' | 'has_target' | 'uses_voice' | 'competes_with'
}

export interface BrandConfig {
  logo_url: string;
  favicon_url: string;
  brand_name: string;
  tagline: string;
  primary_color: string;
  secondary_color: string;
}

export interface InvestorShareDetails {
  sharePercentage: number; // e.g. 15.5
  investmentAmount: number; // e.g. 250000
  numberOfShares: number; // e.g. 15500
  shareClass: 'Common' | 'Series A Preferred' | 'Series B Preferred' | 'Angel Equity' | 'Founder Equity' | 'SAFE Note';
  valuationCap?: number; // e.g. 2000000
  vestingStatus?: string; // e.g. "4 Year Vesting / 1 Year Cliff"
  dividendRights?: string; // e.g. "Non-cumulative 8% dividend preference"
  notes?: string;
}

export interface TenantTeamMember {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  password?: string; // Credentials for logging in
  designation: string; // e.g. 'Tenant Owner', 'General Manager', 'Restaurant POS Lead', 'Marketing Specialist', 'Investor / Board Member'
  department: string; // e.g. 'Executive', 'Operations', 'Finance', 'Sales & Marketing', 'Engineering', 'Investor Relations'
  role: 'owner' | 'admin' | 'writer' | 'viewer' | 'investor';
  status: 'active' | 'pending_invite' | 'revoked';
  permittedModules: string[]; // Module IDs: ['social', 'email', 'revenue', 'restaurant', 'tours', 'website', 'business_ops', 'omnicore', 'admin']
  isInvestor?: boolean;
  investorDetails?: InvestorShareDetails;
  invitedAt: string;
  lastActive: string;
  avatarUrl?: string;
}

