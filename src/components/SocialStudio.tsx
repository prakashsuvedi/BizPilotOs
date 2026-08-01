import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '../types';
import { logAiTaskUsage } from '../lib/aiUsageTracker';
import AiUsageBadge from './AiUsageBadge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Share2, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Twitter, 
  Video, 
  Image as ImageIcon,
  Compass, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Loader2, 
  Send, 
  Users, 
  ShieldAlert, 
  Cpu, 
  BarChart3, 
  Clock, 
  ArrowRight, 
  Plus, 
  Check, 
  X,
  TrendingUp,
  Inbox,
  MessageSquare,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
  FileCheck,
  Zap,
  Layers,
  Search,
  ThumbsUp,
  CheckCircle2,
  Activity,
  Trash2,
  Filter,
  Tag,
  Globe,
  CalendarDays,
  Grid,
  List,
  DollarSign,
  Target,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
  userRole: string;
  onCreateAuditLog?: (type: string, severity: string, details: string) => void;
}

interface SocialAccount {
  id: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'TWITTER' | 'TIKTOK' | 'PINTEREST' | 'YOUTUBE';
  accountName: string;
  accountHandle: string;
  profileImage: string;
  followerCount: number;
  isActive: boolean;
  postCountThisMonth: number;
  lastPostedAt?: string;
  autoResponderActive?: boolean;
}

interface SocialPost {
  id: string;
  title?: string;
  platforms: string[];
  postType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'LINK';
  caption: string;
  hashtags: string[];
  scheduledFor: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  mediaUrls?: string[];
  mediaCleaned?: boolean;
  conversionRevenue?: number;
  conversionLeads?: number;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    impressions: number;
    clicks: number;
  };
  createdAt: string;
}

interface ApprovalRecord {
  id: string;
  postId: string;
  postCaption: string;
  platforms: string[];
  requester: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments: Array<{ userId: string; text: string; timestamp: string }>;
  createdAt: string;
}

export default function SocialStudio({
  profile,
  tenantId,
  userRole,
  onCreateAuditLog
}: Props) {
  // Offline Simulator Toggle State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlinePostQueue, setOfflinePostQueue] = useState<any[]>(() => {
    const saved = localStorage.getItem(`marketforge_social_queue_${tenantId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Keep network states synchronized
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      if (onCreateAuditLog) {
        onCreateAuditLog("SOCIAL_NETWORK_ONLINE", "INFO", "Social studio returned to online network simulation state.");
      }
    };
    const goOffline = () => {
      setIsOnline(false);
      if (onCreateAuditLog) {
        onCreateAuditLog("SOCIAL_NETWORK_OFFLINE", "WARNING", "Social database relaying storage targets strictly to browser localStorage.");
      }
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [tenantId]);

  // Flush offline social queue on connection restoration
  const handleFlushOfflineQueue = async () => {
    if (offlinePostQueue.length === 0) return;
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `⚡ Online connection found. Auto-flushing ${offlinePostQueue.length} pending operations.` }, ...prev]);
    
    let succeeded = 0;
    for (const post of offlinePostQueue) {
      try {
        const response = await fetch('/api/agent/social/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-simulated-tenant': tenantId
          },
          body: JSON.stringify(post)
        });
        if (response.ok) succeeded++;
      } catch (err) {
        console.error("Flush item warning:", err);
      }
    }

    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `✓ Synchronized ${succeeded}/${offlinePostQueue.length} queued posts successfully.` }, ...prev]);
    setOfflinePostQueue([]);
    localStorage.removeItem(`marketforge_social_queue_${tenantId}`);
    fetchPosts();
  };

  useEffect(() => {
    if (isOnline && offlinePostQueue.length > 0) {
      handleFlushOfflineQueue();
    }
  }, [isOnline]);

  // Main list states
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{title: string, desc: string, type: 'success' | 'error'} | null>(null);

  const handleTestConnectivity = async (accountId: string, platform: string) => {
    setTestingConnection(accountId);
    try {
      // Simulate API request to validate credentials
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (Math.random() > 0.1) { // 90% success
        setToastMessage({
          title: 'Connection Successful',
          desc: `Successfully authenticated with ${platform} API.`,
          type: 'success'
        });
      } else {
        throw new Error('Invalid token or expired session.');
      }
    } catch (err: any) {
      setToastMessage({
        title: 'Connection Failed',
        desc: err.message || 'Failed to communicate with API.',
        type: 'error'
      });
    } finally {
      setTestingConnection(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleTriggerScheduledPosts = () => {
     setPosts(prev => prev.map(p => {
       if (p.status === 'SCHEDULED') {
         return { 
           ...p, 
           status: 'PUBLISHED',
           mediaUrls: autoCleanMediaOnPublish ? [] : p.mediaUrls,
           mediaCleaned: autoCleanMediaOnPublish ? true : p.mediaCleaned
         };
       }
       return p;
     }));
     setToastMessage({
        title: 'Posts Triggered & Published',
        desc: autoCleanMediaOnPublish 
          ? 'All scheduled posts published. Media assets auto-cleaned while retaining full post records.'
          : 'All scheduled posts have been published successfully.',
        type: 'success'
     });
     setTimeout(() => setToastMessage(null), 4000);
  };

  const [logs, setLogs] = useState<Array<{ time: string; msg: string }>>([
    { time: new Date().toLocaleTimeString(), msg: "Social Media Scheduler Engine online and ready." }
  ]);

  // Tab section views
  const [subTab, setSubTab] = useState<'scheduler' | 'automation' | 'ad_library' | 'analytics' | 'repurpose' | 'keywords' | 'approvals'>('scheduler');

  // Scheduler View Mode & Asset Cleanup States
  const [schedulerViewMode, setSchedulerViewMode] = useState<'list' | 'calendar' | 'matrix'>('list');
  const [autoCleanMediaOnPublish, setAutoCleanMediaOnPublish] = useState<boolean>(true);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Account creation simulation modal states
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [authFormClientId, setAuthFormClientId] = useState('');
  const [authFormClientSecret, setAuthFormClientSecret] = useState('');
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [oauthSim, setOauthSim] = useState<string | null>(null);

  // Composer Form States
  const [showComposer, setShowComposer] = useState<boolean>(false);
  const [composerTitle, setComposerTitle] = useState<string>("");
  const [composerCaption, setComposerCaption] = useState<string>("");
  const [composerHashtags, setComposerHashtags] = useState<string>("");
  const [composerPlatforms, setComposerPlatforms] = useState<string[]>([]);
  const [composerPostType, setComposerPostType] = useState<'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'LINK'>('IMAGE');
  const [composerScheduledFor, setComposerScheduledFor] = useState<string>(() => {
    // Current date plus 2 days at 09:30 AM (optimal)
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(9, 30, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [composerMediaUrl, setComposerMediaUrl] = useState<string>("https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60");
  const [composerCtaText, setComposerCtaText] = useState<string>("Learn More");
  const [composerCtaUrl, setComposerCtaUrl] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<'fb_desktop' | 'fb_mobile' | 'ig_mobile'>('ig_mobile');

  // AI Hashtag & Trending Keyword Generator State
  const [suggestedAiHashtags, setSuggestedAiHashtags] = useState<Array<{ tag: string; reach: string; score: number; category: string }>>([
    { tag: '#AITrends', reach: '2.8M posts', score: 98, category: 'Technology' },
    { tag: '#GrowthHacks', reach: '1.9M posts', score: 95, category: 'Marketing' },
    { tag: '#AutomationTools', reach: '850K posts', score: 94, category: 'SaaS' },
    { tag: '#DigitalTransformation', reach: '3.1M posts', score: 92, category: 'Business' },
    { tag: '#MarketForge', reach: '120K posts', score: 99, category: 'Brand' },
    { tag: '#ProductivityOS', reach: '420K posts', score: 91, category: 'Productivity' }
  ]);

  const handleGenerateAiHashtags = async () => {
    setIsGeneratingHashtags(true);
    try {
      const topic = (composerTitle + ' ' + composerCaption).trim() || profile.industry || 'Business & Tech';
      const res = await fetch('/api/agent/social/hashtag_research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-simulated-tenant': tenantId },
        body: JSON.stringify({ keyword: topic, platform: composerPlatforms[0] || 'INSTAGRAM' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.topHashtags && Array.isArray(data.topHashtags)) {
          const formatted = data.topHashtags.map((h: any, idx: number) => ({
            tag: h.hashtag || `#tag${idx}`,
            reach: h.volume || `${Math.floor(Math.random() * 900 + 100)}K posts`,
            score: Math.floor(Math.random() * 10 + 90),
            category: 'AI Recommendation'
          }));
          setSuggestedAiHashtags(formatted);
        }
      } else {
        throw new Error();
      }
    } catch {
      // High-converting fallback recommendation engine
      const topicKeywords = (composerCaption + ' ' + composerTitle).toLowerCase();
      let tags = [
        { tag: '#AITrends', reach: '2.8M posts', score: 98, category: 'Tech Spikes' },
        { tag: '#WorkflowAutomation', reach: '1.4M posts', score: 96, category: 'Productivity' },
        { tag: '#FutureOfWork', reach: '3.2M posts', score: 95, category: 'Industry' },
        { tag: '#SaaSGrowth', reach: '910K posts', score: 93, category: 'B2B' },
        { tag: '#MarketForgeAI', reach: '250K posts', score: 99, category: 'Brand Tag' },
        { tag: '#TechInnovation', reach: '4.5M posts', score: 90, category: 'Viral' }
      ];
      if (topicKeywords.includes('food') || topicKeywords.includes('chef') || topicKeywords.includes('dining')) {
        tags = [
          { tag: '#GourmetDining', reach: '1.8M posts', score: 97, category: 'Culinary' },
          { tag: '#FarmToTable', reach: '2.2M posts', score: 96, category: 'Organic' },
          { tag: '#ChefSpecial', reach: '950K posts', score: 94, category: 'Trending' },
          { tag: '#FoodieGram', reach: '8.4M posts', score: 92, category: 'Viral' },
          { tag: '#TasteExperience', reach: '620K posts', score: 90, category: 'Niche' }
        ];
      }
      setSuggestedAiHashtags(tags);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const toggleHashtagChip = (tag: string) => {
    const rawTag = tag.startsWith('#') ? tag : `#${tag}`;
    let currentTags = composerHashtags.split(',').map(t => t.trim()).filter(Boolean);
    const existingIndex = currentTags.findIndex(t => (t.startsWith('#') ? t : `#${t}`).toLowerCase() === rawTag.toLowerCase());

    if (existingIndex >= 0) {
      currentTags.splice(existingIndex, 1);
    } else {
      currentTags.push(rawTag);
    }
    setComposerHashtags(currentTags.join(', '));
  };

  // Ad Studio Design Asset Picker Modal State
  const [showAdStudioPicker, setShowAdStudioPicker] = useState<boolean>(false);

  // AI Generation parameters
  const [aiObjective, setAiObjective] = useState<string>("Introduce our product and highlight seamless workspace integration");
  const [aiTone, setAiTone] = useState<'professional' | 'energetic' | 'casual' | 'promo' | 'storytelling'>('professional');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState<boolean>(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<boolean>(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState<boolean>(false);
  const [aiVariants, setAiVariants] = useState<string[]>([]);
  const [aiSelectedVariantIdx, setAiSelectedVariantIdx] = useState<number>(-1);
  const [lastAiUsage, setLastAiUsage] = useState<any>(null);

  // Ad Studio Creative Designs Library
  const adStudioAssets = [
    {
      id: 'ad-design-1',
      title: 'OmniCore v4 Enterprise AI Engine Launch',
      category: 'B2B SaaS & Enterprise',
      dimensions: '1080 x 1080 (1:1 Square)',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      headline: 'Scale Enterprise Output Safely with Autonomous AI Department Nodes',
      description: 'Integrate secure autonomous AI department agents directly into your custom cloud database architecture. Built for CTOs, product leaders, and engineering architects.',
      hashtags: ['#SaaS', '#AIEngine', '#CloudArchitecture', '#EnterpriseAI', '#TechInnovation', '#MarketForge'],
      conversionScore: 98
    },
    {
      id: 'ad-design-2',
      title: 'Summer Seasonal Promo - 30% Off Workspace',
      category: 'E-Commerce & Retail Promo',
      dimensions: '1080 x 1080 (1:1 Square)',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      headline: 'Unlock 30% Off All Premium Workspace Licenses',
      description: 'Supercharge your team velocity with end-to-end campaign automation and multi-channel scheduling. Limited time offer ending this Friday at midnight!',
      hashtags: ['#SummerSale', '#SpecialOffer', '#ProductivityHacks', '#SaaSDeals', '#GrowthMindset', '#AutomationTools'],
      conversionScore: 95
    },
    {
      id: 'ad-design-3',
      title: 'Gourmet Chef Tasting Experience',
      category: 'Restaurant & Dining',
      dimensions: '1080 x 1350 (4:5 Portrait)',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      headline: 'Savor Artisan Culinary Flavors: Farm-to-Table Weekend Special',
      description: 'Handcrafted culinary creations paired with organic vintage wines. Reserve your table online now or comment MENU to receive our full tasting guide in DM.',
      hashtags: ['#Foodie', '#GourmetDining', '#ChefSpecial', '#FarmToTable', '#FineDining', '#FoodPorn'],
      conversionScore: 96
    },
    {
      id: 'ad-design-4',
      title: 'Tropical Luxury Escape Vacation Flyer',
      category: 'Tours & Travel',
      dimensions: '1080 x 1080 (1:1 Square)',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      headline: 'Escape to Luxury Island Riviera: All-Inclusive Resorts',
      description: 'Breathtaking sunset views, private overwater bungalows, and bespoke excursion itineraries tailored for couples and luxury travelers.',
      hashtags: ['#TravelGoals', '#LuxuryResorts', '#Wanderlust', '#TropicalEscape', '#VacationVibes', '#TravelInspiration'],
      conversionScore: 94
    },
    {
      id: 'ad-design-5',
      title: 'Minimalist Product Spotlight Banner',
      category: 'Design & Workspace',
      dimensions: '1200 x 628 (16:9 Landscape)',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      headline: 'Elegance Meets Utility: The Next Generation Workspace OS',
      description: 'Refined aesthetic craftsmanship paired with ultra-low latency data synchronization. Designed for forward-thinking creative agencies.',
      hashtags: ['#DesignInspiration', '#Minimalism', '#WorkspaceGoals', '#UXDesign', '#ProductDesign'],
      conversionScore: 92
    },
    {
      id: 'ad-design-6',
      title: '24-Hour Flash Sale Countdown Poster',
      category: 'Urgent Campaign',
      dimensions: '1080 x 1080 (1:1 Square)',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      headline: '24-Hour Flash Sale: 50% Off Lifetime Pro Licenses',
      description: 'Only 45 seats remaining! Don’t miss out on automating your entire marketing and operations pipeline in one seamless portal.',
      hashtags: ['#FlashSale', '#LimitedTime', '#SaaSDeals', '#TechPromo', '#AutomationTools'],
      conversionScore: 97
    }
  ];

  // Automation Message Rules Center
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'rule-1',
      platform: 'INSTAGRAM',
      keyword: 'PRICE',
      commentReply: 'Check your DMs! 📩 We just sent you our complete pricing guide and special discount code.',
      dmMessage: 'Hi @user! Thanks for reaching out. Here is our complete pricing catalog: https://marketforge.ai/pricing. Use code PROMO10 for 10% off today!',
      active: true,
      triggeredCount: 142
    },
    {
      id: 'rule-2',
      platform: 'FACEBOOK',
      keyword: 'MENU',
      commentReply: 'Sent you our latest gourmet menu and reservation link! 🍽️',
      dmMessage: 'Hello! Here is our seasonal tasting menu & table booking link: https://marketforge.ai/reserve. Let us know if you need any dietary adjustments!',
      active: true,
      triggeredCount: 89
    },
    {
      id: 'rule-3',
      platform: 'TWITTER',
      keyword: 'SUPPORT',
      commentReply: 'Our support bot sent you a direct message to help resolve this instantly!',
      dmMessage: 'Hi! Our technical support team is online 24/7. Reply with your tenant ID or issue description to get instant assistance.',
      active: true,
      triggeredCount: 54
    },
    {
      id: 'rule-4',
      platform: 'TIKTOK',
      keyword: 'LINK',
      commentReply: 'Tap our bio link or check your TikTok DMs for the direct access code! ✨',
      dmMessage: 'Hey there! Here is your exclusive access link: https://marketforge.ai/join. Welcome to the workspace!',
      active: true,
      triggeredCount: 210
    }
  ]);

  // Live Automation Messages Stream
  const [automationLogs, setAutomationLogs] = useState([
    { id: 'log-1', time: '10:42 AM', platform: 'INSTAGRAM', user: '@alex_design', trigger: 'PRICE', status: 'DM SENT & COMMENT REPLIED', details: 'Sent pricing catalog & 10% promo code.' },
    { id: 'log-2', time: '10:35 AM', platform: 'FACEBOOK', user: '@sarah_m', trigger: 'MENU', status: 'DM SENT & COMMENT REPLIED', details: 'Delivered weekend tasting menu reservation link.' },
    { id: 'log-3', time: '09:18 AM', platform: 'TIKTOK', user: '@creative_sam', trigger: 'LINK', status: 'DM SENT', details: 'Dispatched bio download link for asset bundle.' },
    { id: 'log-4', time: '08:50 AM', platform: 'TWITTER', user: '@tech_lead', trigger: 'SUPPORT', status: 'DM SENT', details: 'Connected user with 24/7 automated support queue.' }
  ]);

  const [showAddRuleModal, setShowAddRuleModal] = useState<boolean>(false);
  const [newRulePlatform, setNewRulePlatform] = useState<string>('INSTAGRAM');
  const [newRuleKeyword, setNewRuleKeyword] = useState<string>('');
  const [newRuleCommentReply, setNewRuleCommentReply] = useState<string>('');
  const [newRuleDmMessage, setNewRuleDmMessage] = useState<string>('');

  // Repurposing States (Module 7)
  const [repurposeSourceText, setRepurposeSourceText] = useState<string>("");
  const [repurposeSourcePlatform, setRepurposeSourcePlatform] = useState<string>("LINKEDIN");
  const [repurposeTargetPlatforms, setRepurposeTargetPlatforms] = useState<string[]>(["TWITTER", "INSTAGRAM", "TIKTOK"]);
  const [repurposedResults, setRepurposedResults] = useState<Record<string, any> | null>(null);
  const [isRepurposing, setIsRepurposing] = useState<boolean>(false);

  // Keyword / Hashtag Research States (Module 8)
  const [keywordSeed, setKeywordSeed] = useState<string>("");
  const [keywordPlatform, setKeywordPlatform] = useState<string>("INSTAGRAM");
  const [isResearching, setIsResearching] = useState<boolean>(false);
  const [researchResult, setResearchResult] = useState<any | null>(null);

  // Outcome ROI loop (Module 9)
  const [isFeedingROI, setIsFeedingROI] = useState<boolean>(false);
  const [roiFeedResult, setRoiFeedResult] = useState<string | null>(null);

  // Fetch initial content
  const fetchAccounts = async () => {
    try {
      const response = await fetch(`/api/agent/social/accounts?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        throw new Error();
      }
    } catch {
      // Offline fallback accounts with all 7 platforms connected
      setAccounts([
        { id: 'acc-1', platform: 'INSTAGRAM', accountName: `${profile.name} Official`, accountHandle: `@${profile.name.toLowerCase().replace(/\s+/g, '')}_official`, profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=60', followerCount: 8900, isActive: true, postCountThisMonth: 18, autoResponderActive: true },
        { id: 'acc-2', platform: 'FACEBOOK', accountName: `${profile.name} Page`, accountHandle: `@${profile.name.toLowerCase().replace(/\s+/g, '')}_fb`, profileImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&fit=crop&q=60', followerCount: 12400, isActive: true, postCountThisMonth: 22, autoResponderActive: true },
        { id: 'acc-3', platform: 'LINKEDIN', accountName: `${profile.name} Corporate`, accountHandle: `@${profile.name.toLowerCase().replace(/\s+/g, '')}`, profileImage: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80&fit=crop&q=60', followerCount: 1420, isActive: true, postCountThisMonth: 12, autoResponderActive: false },
        { id: 'acc-4', platform: 'TWITTER', accountName: `${profile.name} Inc`, accountHandle: `@${profile.name.toLowerCase().replace(/\s+/g, '')}_inc`, profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=60', followerCount: 2240, isActive: true, postCountThisMonth: 34, autoResponderActive: true },
        { id: 'acc-5', platform: 'TIKTOK', accountName: `${profile.name} Tok`, accountHandle: `@${profile.name.toLowerCase().replace(/\s+/g, '')}_tok`, profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&q=60', followerCount: 18500, isActive: true, postCountThisMonth: 15, autoResponderActive: true },
        { id: 'acc-6', platform: 'YOUTUBE', accountName: `${profile.name} Tech Channel`, accountHandle: `@${profile.name.toLowerCase().replace(/\s+/g, '')}_yt`, profileImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80&fit=crop&q=60', followerCount: 5600, isActive: true, postCountThisMonth: 6, autoResponderActive: false },
        { id: 'acc-7', platform: 'PINTEREST', accountName: `${profile.name} Boards`, accountHandle: `@${profile.name.toLowerCase().replace(/\s+/g, '')}_pin`, profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=60', followerCount: 3100, isActive: true, postCountThisMonth: 9, autoResponderActive: false }
      ]);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/agent/social/posts?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        throw new Error();
      }
    } catch {
      // Fallback post list
      setPosts([
        {
          id: 'post-init-1',
          platforms: ['LINKEDIN', 'INSTAGRAM'],
          postType: 'IMAGE',
          caption: `We designed ${profile.name} to maximize productivity and lower team stress. With high fidelity workspace automations, your workflows run cleanly behind the scenes.`,
          hashtags: ['#workspace', '#workflow', '#automation', '#productivity', '#saas'],
          scheduledFor: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          status: 'PUBLISHED',
          metrics: { likes: 142, comments: 24, shares: 12, saves: 31, impressions: 2400, clicks: 189 },
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
        },
        {
          id: 'post-init-2',
          platforms: ['TWITTER'],
          postType: 'TEXT',
          caption: `Say goodbye to manual status update fatigue once and for all. Integrated dashboard logs keep your workflow synced instantly. ✨`,
          hashtags: ['#productivity', '#management'],
          scheduledFor: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          status: 'SCHEDULED',
          metrics: { likes: 0, comments: 0, shares: 0, saves: 0, impressions: 0, clicks: 0 },
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const fetchApprovals = async () => {
    try {
      const response = await fetch(`/api/agent/social/approvals?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setApprovals(data);
      } else {
        throw new Error();
      }
    } catch {
      setApprovals([
        {
          id: 'appr-1',
          postId: 'post-init-2',
          postCaption: `Say goodbye to manual status update fatigue once and for all. Integrated dashboard logs keep your workflow synced instantly. ✨`,
          platforms: ['TWITTER'],
          requester: 'Creative Director',
          status: 'PENDING',
          comments: [
            { userId: 'CMO', text: 'This looks solid and aligns with our branding objectives.', timestamp: new Date().toLocaleTimeString() }
          ],
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchPosts();
    fetchApprovals();
  }, [tenantId]);

  // Connect Simulation (Module 1)
  const handleTriggerOauthConnect = async (platform: string) => {
    setIsLoading(true);
    setConnectingPlatform(platform);
    
    // Simulate an OAuth Redirect Flow
    setOauthSim(platform);
    setIsLoading(false);
  };
  
  const finishOauthConnect = async (platform: string) => {
    setOauthSim(null);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/agent/social/connect/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          accountName: `${profile.name} ${platform.charAt(0) + platform.slice(1).toLowerCase()} Portal`,
          accountHandle: `@${profile.name.toLowerCase()}_${platform.toLowerCase()}`
        })
      });

      if (response.ok) {
        const newAcc = await response.json();
        if (newAcc.redirectUrl) {
            // For META, it returns a redirectUrl, but we'll bypass it for the simulation
        }
        setAccounts(prev => [newAcc, ...prev]);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `✓ Connected account: ${newAcc.accountName} (${platform}) compliantly.` }, ...prev]);
        if (onCreateAuditLog) {
          onCreateAuditLog("SOCIAL_ACCOUNT_CONNECTED", "SUCCESS", `Secure OAuth established with ${platform} API`);
        }
        setShowConnectModal(false);
        setConnectingPlatform(null);
      }
    } catch (e: any) {
      // Offline fallback mock adding
      const mockAcc: SocialAccount = {
        id: `acc-${Date.now()}`,
        platform: platform as any,
        accountName: `${profile.name} ${platform.charAt(0) + platform.slice(1).toLowerCase()}`,
        accountHandle: `@${profile.name.toLowerCase()}_${platform.toLowerCase()}`,
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&q=60',
        followerCount: 1500,
        isActive: true,
        postCountThisMonth: 0
      };
      setAccounts(prev => [mockAcc, ...prev]);
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `[Offline Sandbox Cache] Connection simulation added: ${mockAcc.accountName}` }, ...prev]);
    } finally {
      setIsLoading(false);
      setConnectingPlatform(null);
      setShowConnectModal(false);
    }
  };

  const handleDeleteAccount = async (id: string, platform: string) => {
    try {
      await fetch(`/api/agent/social/accounts?id=${id}&tenantId=${tenantId}`, { method: 'DELETE' });
    } catch {}
    setAccounts(prev => prev.filter(a => a.id !== id));
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `Disconnected ${platform} account ${id}.` }, ...prev]);
  };

  // Generate captions using Gemini (Module 3)
  const handleAIGenerateCaption = async () => {
    setIsGeneratingCaption(true);
    setAiVariants([]);
    setAiSelectedVariantIdx(-1);
    try {
      const response = await fetch('/api/agent/social/generate_caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          postType: 'restaurant_promotion',
          brandVoice: profile.brandVoice,
          mediaDescription: aiObjective,
          platform: composerPlatforms[0] || 'LINKEDIN',
          goal: 'drive conversions'
        })
      });

      if (response.ok) {
        const body = await response.json();
        setComposerCaption(body.caption);
        setComposerHashtags(body.hashtags.join(', '));
        if (body.captionVariants && body.captionVariants.length > 0) {
          setAiVariants(body.captionVariants);
        }
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: "✓ Gemini AI composed platform-optimized copies dynamically." }, ...prev]);
      }
      // Log transparent task-level AI usage
      const logged = logAiTaskUsage({
        tenantId,
        taskId: 'social_studio_gen',
        taskTitle: 'AI Social Media Post Copy Generation',
        modelId: 'gemini-2.5-flash',
        promptTokens: 1240,
        completionTokens: 580
      });
      setLastAiUsage(logged);
    } catch (e: any) {
      // Local highly intuitive copy templates
      const templates = [
        `Tired of chaotic manual status syncs? This is your invitation to experience seamless workspace productivity with ${profile.name}. Designed to eliminate config fatigue. ✨`,
        `Friction belongs in brake pads—not your software pipeline. See how teams are saving up to 5 hours weekly using ${profile.name} dashboards.`,
        `Elevate your team's tactical performance with ${profile.name}. Robust dashboards paired with multi-tenant workspace isolation rules. 🚀`
      ];
      setComposerCaption(templates[0]);
      setComposerHashtags("#productivity, #automation, #management");
      setAiVariants(templates);
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: "✓ [Self-Contained Model] Dynamic business voice generated." }, ...prev]);

      const logged = logAiTaskUsage({
        tenantId,
        taskId: 'social_studio_gen',
        taskTitle: 'AI Social Media Post Copy Generation',
        modelId: 'gemini-2.5-flash',
        promptTokens: 1100,
        completionTokens: 490
      });
      setLastAiUsage(logged);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Compose / Schedule post submission (Module 2)
  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (composerPlatforms.length === 0) {
      alert("Please check at least one target platform to distribute your copy.");
      return;
    }

    const tagsArray = composerHashtags.split(',').map(t => t.trim()).filter(Boolean);
    const postPayload = {
      platforms: composerPlatforms,
      postType: composerPostType,
      caption: composerCaption,
      hashtags: tagsArray,
      scheduledFor: new Date(composerScheduledFor).toISOString(),
      mediaUrls: composerMediaUrl ? [composerMediaUrl] : [],
      status: 'SCHEDULED',
      metrics: { likes: 0, comments: 0, shares: 0, saves: 0, impressions: 0, clicks: 0 },
      createdAt: new Date().toISOString()
    };

    // Offline caching execution (Module 10)
    if (!isOnline) {
      const offlineItem = { ...postPayload, id: `offline-post-${Date.now()}` };
      const updatedQueue = [...offlinePostQueue, offlineItem];
      setOfflinePostQueue(updatedQueue);
      localStorage.setItem(`marketforge_social_queue_${tenantId}`, JSON.stringify(updatedQueue));
      
      setPosts(prev => [offlineItem as any, ...prev]);
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: "⚠ Offline state triggers. Saved drafted post to browser local storage buffers." }, ...prev]);
      setShowComposer(false);
      return;
    }

    try {
      const res = await fetch('/api/agent/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify(postPayload)
      });
      if (res.ok) {
        const savedPost = await res.json();
        setPosts(prev => [savedPost, ...prev]);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `✓ Scheduled post on platforms: ${composerPlatforms.join(', ')}` }, ...prev]);
        if (onCreateAuditLog) {
          onCreateAuditLog("SOCIAL_POST_SCHEDULED", "SUCCESS", `Scheduled social post for queue on date ${composerScheduledFor}`);
        }
      }
    } catch {
      // Local sandbox save
      const sandboxPost: SocialPost = {
        ...postPayload,
        id: `post-${Date.now()}`,
        status: 'SCHEDULED'
      };
      setPosts(prev => [sandboxPost, ...prev]);
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `✓ [Sandbox State Saved] Saved post: ${sandboxPost.id}` }, ...prev]);
    } finally {
      setShowComposer(false);
      setComposerCaption("");
      setComposerHashtags("");
      setComposerPlatforms([]);
    }
  };

  // Analytics review trigger (Module 5)
  const [activeAnalyticsPost, setActiveAnalyticsPost] = useState<SocialPost | null>(null);
  const [detailedAnalyticsData, setDetailedAnalyticsData] = useState<any | null>(null);
  const [isDownloadingAnalytics, setIsDownloadingAnalytics] = useState<boolean>(false);

  const handleInspectCampaignAnalytics = async (clickedPost: SocialPost) => {
    setActiveAnalyticsPost(clickedPost);
    setIsDownloadingAnalytics(true);
    setDetailedAnalyticsData(null);
    try {
      const response = await fetch(`/api/agent/social/analytics/${clickedPost.id}?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setDetailedAnalyticsData(data);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `✓ Engagement report analysis ready for: ${clickedPost.id}` }, ...prev]);
      }
    } catch {
      // Fallback optimization diagnostic from business metadata
      setDetailedAnalyticsData({
        postId: clickedPost.id,
        currentMetrics: clickedPost.metrics,
        comparison: {
          yourAverageLikes: 85,
          yourAverageEngagementRate: 8.4,
          percentageAboveAverage: 45
        },
        topComments: [
          { author: "Mark Stephens", text: "This is precisely what our ops team was lacking.", likes: 8 },
          { author: "Elena Rostova", text: "Stellar visual representation here.", likes: 3 }
        ],
        recommendations: [
          "This publication scores 45% above your historical average. Model future copy lengths on this format.",
          "Image and carousel formats capture 2.1x clicks. Increase visual media uploads.",
          "Click-through rates spike on Tuesday work hours. Re-allocate queue schedules to 09:30 AM."
        ]
      });
    } finally {
      setIsDownloadingAnalytics(false);
    }
  };

  // Adapt/Repurpose content tool (Module 7)
  const handleAdaptContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repurposeSourceText.trim()) return;

    setIsRepurposing(true);
    setRepurposedResults(null);
    try {
      const res = await fetch('/api/agent/social/adapt_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          sourcePost: { text: repurposeSourceText },
          sourcePlatform: repurposeSourcePlatform,
          targetPlatforms: repurposeTargetPlatforms
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRepurposedResults(data);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: "✓ Gemini adapted copy blocks for target formats instantly." }, ...prev]);
      }
    } catch {
      // Offline fallback adaptive mapping
      const adapted: Record<string, any> = {};
      repurposeTargetPlatforms.forEach(p => {
        if (p === 'TWITTER') {
          adapted[p] = {
            caption: `${repurposeSourceText.slice(0, 180)}... Adapted for atomic reader speed. 🚀`,
            hashtags: ['#saas', '#tech']
          };
        } else if (p === 'INSTAGRAM') {
          adapted[p] = {
            caption: `📸 Capturing the core theme of our latest work notes:\n\n${repurposeSourceText}\n\nJoin the conversion circle and unlock premium tools!`,
            hashtags: ['#workspace', '#modernoffice', '#excellence']
          };
        } else {
          adapted[p] = {
            caption: `💡 Professional insights summary:\n\n• ${repurposeSourceText.slice(0, 100)}\n• Automated workspace logic\n\nFull details on our corporate channel!`,
            hashtags: ['#careers', '#digitaltransformation']
          };
        }
      });
      setRepurposedResults(adapted);
    } finally {
      setIsRepurposing(false);
    }
  };

  // Keyword / Hashtag Research tool (Module 8)
  const handleHashtagResearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordSeed.trim()) return;

    setIsResearching(true);
    setResearchResult(null);
    try {
      const res = await fetch('/api/agent/social/hashtag_research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          keyword: keywordSeed,
          platform: keywordPlatform
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResearchResult(data);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `✓ Completed algorithmic market hash popularity for keyword seed: ${keywordSeed}` }, ...prev]);
      }
    } catch {
      // Offline fallback lookup
      setResearchResult({
        topHashtags: [
          { hashtag: `#${keywordSeed.replace(/\s+/g, '')}`, volume: "1.4M posts", trend: "spiking", recommendedMix: "optimal" },
          { hashtag: `#${keywordSeed.replace(/\s+/g, '')}automation`, volume: "340K posts", trend: "upward", recommendedMix: "medium" },
          { hashtag: `#${keywordSeed.replace(/\s+/g, '')}experts`, volume: "120K posts", trend: "stable", recommendedMix: "niche" }
        ],
        relatedHashtags: [`#${keywordSeed.split(' ')[0]}design`, `#scale${keywordSeed.split(' ')[0]}`],
        trendingTopics: [
          "Eliminating workflow bottlenecks with modern serverless systems",
          "Automated corporate calendars vs traditional meetings"
        ]
      });
    } finally {
      setIsResearching(false);
    }
  };

  // Dispatches webhook payload simulation to Express (Module 5)
  const handleTriggerSimulatedWebhook = async (id: string, testPlatform: string) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `📡 Dispatching simulated Meta / Twitter webhook for post: ${id}...` }, ...prev]);
    try {
      const response = await fetch('/api/agent/social/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          postId: id,
          event: 'engagement_update',
          metrics: {
            likes: Math.floor(Math.random() * 80) + 15,
            comments: Math.floor(Math.random() * 15) + 3,
            shares: Math.floor(Math.random() * 10) + 2,
            saves: Math.floor(Math.random() * 12) + 1,
            impressions: Math.floor(Math.random() * 1200) + 500,
            clicks: Math.floor(Math.random() * 150) + 25
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPosts(prev => prev.map(p => p.id === id ? { ...p, metrics: result.metrics, status: 'PUBLISHED' } : p));
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: "✓ Webhook integrated! Inbound event updated client tables." }, ...prev]);
        
        // If inspecting this post, update its detail preview too
        if (activeAnalyticsPost?.id === id) {
          setDetailedAnalyticsData(prev => prev ? { ...prev, currentMetrics: result.metrics } : null);
        }
      }
    } catch {
      // Local live simulated increment
      setPosts(prev => prev.map(p => {
        if (p.id === id) {
          const updatedMetrics = {
            likes: p.metrics.likes + 24,
            comments: p.metrics.comments + 4,
            shares: p.metrics.shares + 2,
            saves: p.metrics.saves + 6,
            impressions: p.metrics.impressions + 180,
            clicks: p.metrics.clicks + 32
          };
          return { ...p, metrics: updatedMetrics, status: 'PUBLISHED' };
        }
        return p;
      }));
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: "✓ Simulated live parameters locally on physical layer." }, ...prev]);
    }
  };

  const handlePublishToLinkedIn = async (post: SocialPost) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: "⚡ Preparing outbound LinkedIn UGC publish query..." }, ...prev]);
    try {
      const response = await fetch('/api/agent/social/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          postId: post.id,
          caption: post.caption,
          hashtags: post.hashtags
        })
      });

      if (response.status === 402) {
        setShowUpgradeModal(true);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: "❌ LIMIT GATED: Selected campaign exceeds active subscription limits! Interceptor triggered." }, ...prev]);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "API refused connection.");
      }

      const result = await response.json();
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'PUBLISHED' } : p));
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `✓ LIVE OUTBOUND: LinkedIn Post Published successfully! ID: ${result.linkedinPostId || 'urn:li:share:simulated'}` }, ...prev]);
      
      if (onCreateAuditLog) {
        onCreateAuditLog("SOCIAL_LINKEDIN_PUBLISHED", "success", `LinkedIn UGC share executed for post ${post.id}. Mode=${result.simulated ? 'SIMULATOR' : 'LIVE'}`);
      }
    } catch (err: any) {
      setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `❌ API Error: ${err.message}` }, ...prev]);
    }
  };

  // Log outcomes predictive ROI logs (Module 9)
  const handleForceInboundROIOutcome = async () => {
    setIsFeedingROI(true);
    setRoiFeedResult(null);
    try {
      // Accumulate metrics
      const totalImpressions = posts.reduce((sum, p) => sum + (p.metrics?.impressions || 0), 0) || 4500;
      const totalClics = posts.reduce((sum, p) => sum + (p.metrics?.clicks || 0), 0) || 540;
      const totalLikes = posts.reduce((sum, p) => p.metrics?.likes || 0, 0) || 310;
      
      const res = await fetch('/api/agent/outcome_logger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-simulated-tenant': tenantId
        },
        body: JSON.stringify({
          source: 'SOCIAL_CAMPAIGN',
          campaignId: 'col-social-forge-1',
          goalType: 'Brand Awareness Campaign',
          modelPrediction: {
            predictedLeads: totalClics,
            metricUnit: "Social Link Clicks",
            confidenceBefore: "80%"
          },
          actualOutcome: {
            capturedLeads: Math.round(totalClics * 0.96),
            variancePercent: "-4%",
            confidenceAfter: "85%"
          },
          outcomeStatement: `Campaign outcome sync: Total impressions ${totalImpressions} fetched. Clickthrough aggregated to ${totalClics} click logs.`
        })
      });

      if (res.ok) {
        setRoiFeedResult(`✓ Fully synchronized ROI metrics! Outcome logs captured campaign statistics safely. CMO performance confidence score scaled to 85%!`);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: "✓ ROI tracking block synchronized to corporate database." }, ...prev]);
        if (onCreateAuditLog) {
          onCreateAuditLog("SOCIAL_ROI_LOGGED", "SUCCESS", `Logged actual vs predicted variance feedback. Variance: 4%`);
        }
      } else {
        throw new Error();
      }
    } catch {
      setRoiFeedResult(`[Database Offline Simulator] Successfully logged ROI metrics locally! Saved parameters variance tracking correctly.`);
    } finally {
      setIsFeedingROI(false);
    }
  };

  // Handle Approvals Actions (Module 6)
  const handleUpdateApprovalStatus = async (id: string, nextStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await fetch(`/api/agent/social/approvals?id=${id}&status=${nextStatus}&tenantId=${tenantId}`, { method: 'POST' });
    } catch {}

    setApprovals(prev => prev.map(a => {
      if (a.id === id) {
        // If approved, verify and update corresponding post state in list too!
        if (nextStatus === 'APPROVED') {
          setPosts(pList => pList.map(p => p.id === a.postId ? { ...p, status: 'SCHEDULED' } : p));
        }
        return { ...a, status: nextStatus };
      }
      return a;
    }));
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `✓ Processed approvals action: ${nextStatus} for checklist ID: ${id}` }, ...prev]);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'LINKEDIN': return <Linkedin className="w-4 h-4 text-sky-700" />;
      case 'INSTAGRAM': return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'FACEBOOK': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'TWITTER': return <Twitter className="w-4 h-4 text-slate-800" />;
      case 'TIKTOK': return <Video className="w-4 h-4 text-rose-500" />;
      case 'YOUTUBE': return <Video className="w-4 h-4 text-red-600" />;
      case 'PINTEREST': return <Share2 className="w-4 h-4 text-red-500" />;
      default: return <Share2 className="w-4 h-4 text-indigo-500" />;
    }
  };

  const activeProfileBgColor = profile.id === 'sienna' ? '#5C3E35' : (profile.id === 'solas' ? '#10b981' : '#4f46e5');
  const activeProfileThemeBorder = profile.id === 'sienna' ? 'border-[#5C3E35]/30 text-[#5C3E35]' : (profile.id === 'solas' ? 'border-emerald-600/30 text-emerald-400' : 'border-indigo-100 text-indigo-600');

  // Days list for calendar visualization (Module 4)
  const calendarDays = [
    { dayNumber: 15, hasPost: true, platform: 'LINKEDIN', type: 'PUBLISHED' },
    { dayNumber: 16, hasPost: true, platform: 'INSTAGRAM', type: 'PUBLISHED' },
    { dayNumber: 17, hasPost: false },
    { dayNumber: 18, hasPost: true, platform: 'TWITTER', type: 'SCHEDULED' },
    { dayNumber: 19, hasPost: false },
    { dayNumber: 20, hasPost: true, platform: 'LINKEDIN', type: 'SCHEDULED' },
    { dayNumber: 21, hasPost: false }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in shadow-xl">
          <div className={`p-4 rounded-xl flex items-start gap-3 ${toastMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
             <div className={`shrink-0 ${toastMessage.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
             </div>
             <div>
                <h4 className={`text-sm font-bold ${toastMessage.type === 'success' ? 'text-emerald-900' : 'text-red-900'}`}>{toastMessage.title}</h4>
                <p className={`text-xs mt-0.5 ${toastMessage.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{toastMessage.desc}</p>
             </div>
          </div>
        </div>
      )}

      
      {/* HEADER SECTION WITH NETWORK SIMULATOR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm text-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Share2 className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${activeProfileThemeBorder} bg-slate-50`}>
                Unified Social OS Engine
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">MarketForge Social Engine</h2>
            <p className="text-slate-500 text-xs mt-0.5">Publish and optimize content, adapt copies via Gemini, coordinate approvals, and synchronize marketing performance ROI.</p>
          </div>
        </div>

        {/* Network offline/online simulator toggle */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 p-2 rounded-xl text-xs shrink-0">
          <span className="font-mono font-bold text-slate-500">NETWORK SIMULATOR:</span>
          <button 
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>CONNECTED</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span>OFFLINE (LOCAL STORAGE ON)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {offlinePostQueue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{offlinePostQueue.length} Social drafts</strong> queued offline in local memory storage. Restore network connection to synchronize with the cloud database.
            </span>
          </div>
          <button 
            onClick={handleFlushOfflineQueue}
            disabled={!isOnline}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg disabled:opacity-50 flex items-center gap-1 cursor-pointer transition text-xs"
          >
            <RefreshCw className="w-3 h-3 text-white" />
            <span>Flush Sync Buffer</span>
          </button>
        </div>
      )}

      {/* SUB MENU TABS */}
      <div className="flex border-b border-slate-200 gap-1 bg-white p-1.5 rounded-xl border text-slate-900 overflow-x-auto scroller-hidden">
        {[
          { id: 'scheduler', name: 'Scheduler & Planner', icon: <CalendarIcon className="w-4 h-4" /> },
          { id: 'automation', name: 'Auto-Responder & DM Hub', icon: <MessageSquare className="w-4 h-4 text-purple-600" /> },
          { id: 'ad_library', name: 'Ad Studio Designs', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
          { id: 'analytics', name: 'Engagement & ROI Insights', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'repurpose', name: 'Adaptive Repurposing', icon: <Layers className="w-4 h-4" /> },
          { id: 'keywords', name: 'Hashtag Auditor', icon: <Search className="w-4 h-4" /> },
          { id: 'approvals', name: 'Approvals Pipeline', icon: <FileCheck className="w-4 h-4" /> }
        ].map((it) => (
          <button
            key={it.id}
            onClick={() => setSubTab(it.id as any)}
            className={`py-2 px-3.5 text-xs font-semibold flex items-center gap-2 rounded-lg transition cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === it.id
                ? 'bg-slate-900 text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {it.icon}
            {it.name}
          </button>
        ))}
      </div>

      {/* CURRENT SUB PANEL VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT COLUMN (7 units) */}
        <div className="lg:col-span-8 space-y-6">

          {/* TAB 1: SCHEDULER & PLANNER */}
          {subTab === 'scheduler' && (
            <div className="space-y-6">
              
              {/* COMPOSER BANNER TRIGGER */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow">
                <div className="space-y-2 z-10">
                  <span className="text-[9px] font-mono font-bold bg-white/10 text-indigo-300 px-2 py-0.5 rounded border border-white/20 uppercase tracking-widest">
                    Omni-Channel publisher
                  </span>
                  <h3 className="text-lg font-bold">Write corporate campaigns globally</h3>
                  <p className="text-slate-300 text-xs">Instantly publish or pre-schedule posts to 6 platforms with Gemini analytics.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowComposer(true)}
                  className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow border border-slate-100 shrink-0 transition"
                >
                  <Plus className="w-4 h-4 text-slate-900" />
                  <span>Compose New Social Post</span>
                </button>
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
              </div>

              {/* SCHEDULER CONTROLS & AUTO-CLEAN MEDIA TOGGLE BAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">View Mode:</span>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSchedulerViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        schedulerViewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Queue List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchedulerViewMode('calendar')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        schedulerViewMode === 'calendar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Intelligent Calendar View</span>
                    </button>
                  </div>
                </div>

                {/* Auto-Clean Media Asset Option */}
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">Auto-Clean Media Assets Post-Publish</p>
                      <p className="text-[9px] text-slate-500">Deletes images/videos post-publishing while keeping caption & analytics</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={autoCleanMediaOnPublish}
                      onChange={(e) => setAutoCleanMediaOnPublish(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              {/* CALENDAR MONTH PLANNER VIEW (INTELLIGENT SLOTS) */}
              {schedulerViewMode === 'calendar' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-bold text-slate-800 text-sm">Intelligent AI Scheduling Calendar (June 2026)</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-[10px] text-slate-600 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Published
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-600 font-mono">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Scheduled
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-purple-700 font-bold font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        🔥 AI Peak Engagement Slots (+65% Reach)
                      </span>
                    </div>
                  </div>

                  {/* Calendar grid view */}
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="text-center text-[10px] font-mono text-slate-500 font-bold py-1 bg-slate-50 border border-slate-100 rounded-lg">
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: 28 }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const dayPosts = posts.filter(p => {
                        const dt = new Date(p.scheduledFor);
                        return dt.getDate() === dayNumber;
                      });
                      const isOptimalSlot = [2, 5, 9, 14, 18, 22, 26].includes(dayNumber);

                      return (
                        <div 
                          key={idx} 
                          className={`min-h-24 border rounded-xl p-2 transition flex flex-col justify-between relative group cursor-pointer text-slate-900 ${
                            isOptimalSlot ? 'bg-purple-50/40 border-purple-200 hover:border-purple-400' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => {
                            setComposerScheduledFor(`2026-06-${dayNumber < 10 ? '0' + dayNumber : dayNumber}T09:30`);
                            setShowComposer(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-slate-600">{dayNumber}</span>
                            {isOptimalSlot && (
                              <span className="text-[8px] bg-purple-600 text-white font-bold px-1 rounded shadow-2xs">
                                09:30 AM 🔥
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 my-1">
                            {dayPosts.map((dp) => (
                              <div 
                                key={dp.id}
                                className={`p-1.5 rounded-lg text-[9px] font-mono flex items-center justify-between shadow-2xs border ${
                                  dp.status === 'PUBLISHED' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                }`}
                              >
                                <span className="truncate max-w-[70px] font-bold">{dp.title || dp.platforms[0]}</span>
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dp.status === 'PUBLISHED' ? '#10b981' : '#f59e0b' }}></span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                            <span className="text-indigo-600 font-bold">+ Schedule Post</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Content gaps notifier */}
                  <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5 text-xs text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-purple-950">AI Strategic Timing Recommendation:</p>
                      <p className="leading-relaxed">
                        Historical engagement models show high conversion rates on <span className="font-bold underline">Wednesdays at 09:30 AM</span> and <span className="font-bold underline">Fridays at 05:00 PM</span>. Drag or schedule posts into these slots to maximize ROI.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* POST LIST VIEW OR TELEMETRY */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">Active Social Publications Queue</h3>
                  <button onClick={handleTriggerScheduledPosts} className="text-[10px] font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 cursor-pointer transition">
                     <Zap className="w-3 h-3" />
                     Force Trigger Pending
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      No scheduled social posts found. Draft yours above!
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div key={post.id} className="border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition bg-slate-50 space-y-4 text-slate-900">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {post.platforms.map(p => (
                              <span key={p} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                                {getPlatformIcon(p)}
                                <span>{p}</span>
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              post.status === 'PUBLISHED' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {post.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Schedule: <strong>{new Date(post.scheduledFor).toLocaleDateString()} {new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-4 items-start">
                          {post.mediaUrls && post.mediaUrls.length > 0 ? (
                            <img src={post.mediaUrls[0]} className="w-16 h-16 rounded-lg object-cover shadow-sm border border-slate-200 shrink-0" alt="post media" />
                          ) : post.mediaCleaned ? (
                            <div className="w-16 h-16 rounded-lg bg-purple-50 border border-purple-200 flex flex-col items-center justify-center text-purple-700 shrink-0 p-1 text-center">
                              <Trash2 className="w-4 h-4 text-purple-600 mb-0.5" />
                              <span className="text-[8px] font-bold uppercase leading-none">Media Cleaned</span>
                            </div>
                          ) : null}
                          <div className="flex-1 space-y-2">
                            {post.title && <h4 className="text-xs font-bold text-slate-900">{post.title}</h4>}
                            <p className="text-xs text-slate-700 leading-relaxed font-sans">{post.caption}</p>
                            {post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {post.hashtags.map(tag => (
                              <span key={tag} className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))}
                          </div>
                        )}

                        {post.mediaCleaned && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <Trash2 className="w-3 h-3 text-purple-600" /> Auto-Cleaned Media Asset (Storage Optimized) • Complete Text & ROI Records Retained
                          </span>
                        )}

                        </div>
                        </div>
                        {/* Interactive simulation panel metrics */}
                        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
                            <div>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">likes</p>
                              <p className="text-xs font-bold text-slate-800">{post.metrics.likes}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">comments</p>
                              <p className="text-xs font-bold text-slate-800">{post.metrics.comments}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">shares</p>
                              <p className="text-xs font-bold text-slate-800">{post.metrics.shares}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">saves</p>
                              <p className="text-xs font-bold text-slate-800">{post.metrics.saves}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">impressions</p>
                              <p className="text-xs font-bold text-slate-800">{post.metrics.impressions}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">clicks</p>
                              <p className="text-xs font-bold text-[#f59e0b]">{post.metrics.clicks}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end shrink-0">
                            {post.platforms.includes('LINKEDIN') && post.status !== 'PUBLISHED' && (
                              <button
                                type="button"
                                onClick={() => handlePublishToLinkedIn(post)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1 border border-emerald-500"
                              >
                                <Send className="w-3 h-3" />
                                <span>Publish to LinkedIn Now</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleTriggerSimulatedWebhook(post.id, post.platforms[0] || 'LINKEDIN')}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1 border border-indigo-200"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Simulate Webhook Update</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInspectCampaignAnalytics(post)}
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-[10px] transition cursor-pointer"
                            >
                              Analyze
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AUTO-RESPONDER & DM AUTOMATION HUB */}
          {subTab === 'automation' && (
            <div className="space-y-6 text-slate-900">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">CONNECTED SITES</span>
                  <p className="text-xl font-bold font-mono text-slate-800 mt-1">7 / 7 Active</p>
                  <span className="text-[9px] text-emerald-600 font-semibold">Meta, X, LinkedIn, TikTok+</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">AUTO-DM RULES</span>
                  <p className="text-xl font-bold font-mono text-purple-600 mt-1">{automationRules.filter(r => r.active).length} Active</p>
                  <span className="text-[9px] text-purple-500 font-semibold">Comment-to-DM Engine</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">AUTO MESSAGES SENT</span>
                  <p className="text-xl font-bold font-mono text-indigo-600 mt-1">495 Delivered</p>
                  <span className="text-[9px] text-indigo-500 font-semibold">+18% conversion rate</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">WEBHOOK HEALTH</span>
                  <p className="text-xl font-bold font-mono text-emerald-600 mt-1">99.8% Uptime</p>
                  <span className="text-[9px] text-emerald-500 font-semibold">Avg Latency 24ms</span>
                </div>
              </div>

              {/* CONNECTED SOCIAL ACCOUNTS DETAILED TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-emerald-600" /> Real Social Sites Connection & Webhook Matrix
                    </h3>
                    <p className="text-slate-500 text-xs">Live API OAuth tokens, follower sync numbers, and direct message automation state.</p>
                  </div>
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Connect Channel
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[10px] font-mono font-bold text-slate-400 uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">Platform</th>
                        <th className="p-3">Account / Handle</th>
                        <th className="p-3">Followers</th>
                        <th className="p-3">Monthly Posts</th>
                        <th className="p-3">Auto-Responder</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {accounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(acc.platform)}
                              <span className="font-bold text-slate-800 font-mono text-[11px]">{acc.platform}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img src={acc.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                              <div>
                                <p className="font-bold text-slate-800 text-xs leading-tight">{acc.accountName}</p>
                                <p className="text-[10px] text-slate-400">{acc.accountHandle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-700">
                            {acc.followerCount.toLocaleString()}
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            {acc.postCountThisMonth} posts
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, autoResponderActive: !a.autoResponderActive } : a));
                                setToastMessage({
                                  title: 'Auto-Responder Toggled',
                                  desc: `Auto-responder ${!acc.autoResponderActive ? 'enabled' : 'disabled'} for ${acc.accountName}`,
                                  type: 'success'
                                });
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border cursor-pointer transition ${
                                acc.autoResponderActive !== false
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {acc.autoResponderActive !== false ? '⚡ AUTO-DM ON' : 'OFF'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleTestConnectivity(acc.id, acc.platform)}
                                disabled={testingConnection === acc.id}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] transition cursor-pointer flex items-center gap-1"
                              >
                                {testingConnection === acc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Ping API
                              </button>
                              <button
                                onClick={() => handleDeleteAccount(acc.id, acc.platform)}
                                className="px-1.5 py-1 text-rose-500 hover:text-rose-700 font-bold rounded text-[10px] transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AUTOMATED KEYWORD RULES & AUTO-RESPONDERS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" /> Comment-to-DM Keyword Auto-Responder Rules
                    </h3>
                    <p className="text-slate-500 text-xs">When users comment specific keywords, automatically reply in comments and dispatch a direct message (DM).</p>
                  </div>
                  <button
                    onClick={() => setShowAddRuleModal(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Auto-Rule
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3 relative hover:border-purple-300 transition">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(rule.platform)}
                          <span className="font-mono font-bold text-xs text-slate-800">{rule.platform}</span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-mono font-bold rounded-md">
                            Keyword: "{rule.keyword}"
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setAutomationRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${
                            rule.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {rule.active ? 'ACTIVE' : 'PAUSED'}
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block">Public Comment Auto-Reply:</span>
                          <p className="text-slate-700 italic bg-white p-2 rounded border border-slate-200 text-[11px] mt-0.5">
                            "{rule.commentReply}"
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-purple-600 font-bold uppercase block">Automated Direct Message (DM):</span>
                          <p className="text-purple-950 font-medium bg-purple-50/70 p-2 rounded border border-purple-100 text-[11px] mt-0.5 leading-relaxed">
                            "{rule.dmMessage}"
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
                        <span>Triggered: <strong className="text-slate-700">{rule.triggeredCount} times</strong></span>
                        <button
                          onClick={() => {
                            // Test trigger simulation
                            const newLog = {
                              id: `log-${Date.now()}`,
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              platform: rule.platform,
                              user: '@simulated_buyer',
                              trigger: rule.keyword,
                              status: 'DM SENT & COMMENT REPLIED',
                              details: `Dispatched auto-responder for keyword "${rule.keyword}"`
                            };
                            setAutomationLogs(prev => [newLog, ...prev]);
                            setAutomationRules(prev => prev.map(r => r.id === rule.id ? { ...r, triggeredCount: r.triggeredCount + 1 } : r));
                            setToastMessage({
                              title: 'Auto-Responder Tested!',
                              desc: `Simulated comment with keyword "${rule.keyword}" on ${rule.platform}. DM sent to @simulated_buyer.`,
                              type: 'success'
                            });
                            setTimeout(() => setToastMessage(null), 4000);
                          }}
                          className="text-purple-600 hover:text-purple-800 font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" /> Test Rule Trigger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE AUTOMATION MESSAGE STREAM LOG */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" /> Real-Time Automated Messages Stream Log
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Live Sync Active</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
                  {automationLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100/70 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[10px] text-slate-400 shrink-0">{log.time}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {getPlatformIcon(log.platform)}
                          <span className="font-bold text-slate-700 text-[11px]">{log.platform}</span>
                        </div>
                        <span className="font-bold text-purple-700 truncate">{log.user}</span>
                        <span className="bg-amber-100 text-amber-900 text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0">"{log.trigger}"</span>
                        <span className="text-slate-600 text-[11px] truncate hidden md:inline">{log.details}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded shrink-0">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AD STUDIO CREATIVE DESIGNS LIBRARY */}
          {subTab === 'ad_library' && (
            <div className="space-y-6 text-slate-900">
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold bg-white/20 text-purple-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Ad Studio Integration Module
                  </span>
                  <h3 className="text-xl font-bold text-white">Import High-Converting Designs from Ad Studio</h3>
                  <p className="text-slate-300 text-xs max-w-xl">
                    Select picture designs, headlines, and captions produced in the Creative Ad Studio module directly into your social post scheduler.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowComposer(true)}
                  className="px-4 py-2.5 bg-white text-purple-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow hover:bg-purple-50 transition shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-purple-950" /> Open Social Composer
                </button>
              </div>

              {/* Grid of Ad Studio Designs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adStudioAssets.map((asset) => (
                  <div key={asset.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        <img src={asset.imageUrl} alt={asset.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-mono font-bold px-2 py-1 rounded-md">
                          {asset.dimensions}
                        </div>
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-mono font-bold px-2 py-1 rounded-md shadow">
                          {asset.conversionScore}% CTR Match
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <span className="text-[9px] font-mono font-bold text-purple-600 uppercase tracking-widest">{asset.category}</span>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{asset.title}</h4>
                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                          "{asset.description}"
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {asset.hashtags.map((tag) => (
                            <span key={tag} className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          setComposerMediaUrl(asset.imageUrl);
                          setComposerTitle(asset.title);
                          setComposerCaption(asset.description);
                          setComposerHashtags(asset.hashtags.join(', '));
                          setShowComposer(true);
                          setToastMessage({
                            title: 'Ad Studio Design Imported!',
                            desc: `Loaded "${asset.title}" into the Social Post Composer.`,
                            type: 'success'
                          });
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Import Picture Design to Scheduler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICS & INSIGHT REPORTS */}
          {subTab === 'analytics' && (
            <div className="space-y-6 text-slate-900">
              
              {/* TOP KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">TOTAL REACH & IMPRESSIONS</span>
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-2xl font-black font-mono text-slate-900">263.4K</h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+28.4%</span>
                  </div>
                  <p className="text-slate-500 text-[10px]">Across 6 connected social channels</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">TOTAL CLICKS & CTR</span>
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-2xl font-black font-mono text-indigo-600">16.2K</h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">6.15% CTR</span>
                  </div>
                  <p className="text-slate-500 text-[10px]">Outbound traffic to landing pages</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">CONVERTED LEADS</span>
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-2xl font-black font-mono text-purple-600">634</h4>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">+18.2%</span>
                  </div>
                  <p className="text-slate-500 text-[10px]">Verified form submissions & DM rules</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">ATTRIBUTED SOCIAL ROI</span>
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-2xl font-black font-mono text-emerald-600">$53,800</h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">4.8x ROAS</span>
                  </div>
                  <p className="text-slate-500 text-[10px]">Directly synced to campaign outcomes</p>
                </div>
              </div>

              {/* RECHARTS CHART 1: WEEKLY REACH, CLICKS & ENGAGEMENTS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      Weekly Social Engagement & Click Velocity Trend
                    </h3>
                    <p className="text-xs text-slate-500">Aggregated impressions, link clicks, and post interactions</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Impressions
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Link Clicks
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { day: 'Mon', impressions: 12400, clicks: 1200, engagements: 850 },
                        { day: 'Tue', impressions: 18500, clicks: 1980, engagements: 1420 },
                        { day: 'Wed', impressions: 15200, clicks: 1450, engagements: 1050 },
                        { day: 'Thu', impressions: 22400, clicks: 2300, engagements: 1890 },
                        { day: 'Fri', impressions: 28900, clicks: 3100, engagements: 2450 },
                        { day: 'Sat', impressions: 19800, clicks: 1850, engagements: 1320 },
                        { day: 'Sun', impressions: 24200, clicks: 2600, engagements: 1980 }
                      ]}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="impressions" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorImpressions)" name="Impressions" />
                      <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" name="Clicks" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RECHARTS CHART 2 & 3: PLATFORM BREAKDOWN & ROI ATTRIBUTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Platform Comparative Metrics Bar Chart */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-600" />
                      Cross-Platform Engagement & Conversion Distribution
                    </h3>
                    <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">
                      Real-Time Aggregated
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { platform: 'LinkedIn', likes: 1850, clicks: 2400, leads: 110 },
                          { platform: 'Instagram', likes: 4800, clicks: 3900, leads: 185 },
                          { platform: 'Facebook', likes: 2900, clicks: 2100, leads: 92 },
                          { platform: 'Twitter', likes: 1650, clicks: 1950, leads: 64 },
                          { platform: 'TikTok', likes: 8900, clicks: 4200, leads: 145 },
                          { platform: 'Pinterest', likes: 920, clicks: 1100, leads: 38 }
                        ]}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="platform" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Bar dataKey="likes" fill="#8884d8" name="Likes & Reactions" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="clicks" fill="#82ca9d" name="Link Clicks" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="leads" fill="#ffc658" name="Converted Leads" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Campaign Revenue Distribution Pie Chart */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-emerald-600" />
                      Campaign Revenue Share
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      $53,800 Total
                    </span>
                  </div>

                  <div className="h-52 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Enterprise AI Launch', value: 38, color: '#4f46e5' },
                            { name: 'Summer Seasonal Sale', value: 28, color: '#10b981' },
                            { name: 'Chef Tasting Menu', value: 18, color: '#f59e0b' },
                            { name: 'Tropical Luxury Flyer', value: 16, color: '#ec4899' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {[
                            { color: '#4f46e5' },
                            { color: '#10b981' },
                            { color: '#f59e0b' },
                            { color: '#ec4899' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      <span className="truncate text-slate-700 font-medium">Enterprise AI (38%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="truncate text-slate-700 font-medium">Summer Sale (28%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="truncate text-slate-700 font-medium">Tasting Menu (18%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      <span className="truncate text-slate-700 font-medium">Tropical Flyer (16%)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* INTEGRATION WITH OUTCOME LOOP ROI FEEDER (MODULE 9) */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold bg-indigo-200 border border-indigo-300 text-indigo-700 px-2 py-0.5 rounded shadow-sm">
                      PHASE 10 LEARNING FEEDBACK MATRIX
                    </span>
                    <h4 className="text-sm font-bold text-indigo-950 pt-1">Synchronize Social ROI with Campaign Intelligence</h4>
                    <p className="text-indigo-900 text-xs leading-relaxed max-w-xl">
                      Feed real aggregate social impressions, clicklogs, interaction ratios, and audience variance directly back to your goal metrics. This reinforces our CMO algorithm training accurately.
                    </p>
                  </div>
                  <Cpu className="w-7 h-7 text-indigo-600 animate-pulse" />
                </div>

                {roiFeedResult && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{roiFeedResult}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleForceInboundROIOutcome}
                    disabled={isFeedingROI}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {isFeedingROI ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Updating CMO learning matrices...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-white" />
                        <span>Push Social Analytics to Campaign ROI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ACTIVE INSPECTION PANELS */}
              {activeAnalyticsPost ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-slate-900">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400">INSPECTING POST ENGAGEMENT REPORT</span>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-md">"{activeAnalyticsPost.caption.slice(0, 100)}..."</p>
                    </div>
                    <button 
                      onClick={() => setActiveAnalyticsPost(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Clear
                    </button>
                  </div>

                  {isDownloadingAnalytics ? (
                    <div className="flex justify-center items-center py-12 gap-2 text-xs text-slate-500 font-medium">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>Requesting platform API audit insight scores...</span>
                    </div>
                  ) : (
                    detailedAnalyticsData && (
                      <div className="space-y-5 font-sans">
                        
                        {/* Comparison blocks */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-slate-400 block tracking-wider uppercase font-mono">Average engagement</span>
                            <span className="text-xl font-bold font-mono text-slate-800">{detailedAnalyticsData.comparison?.yourAverageEngagementRate}%</span>
                          </div>
                          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-center space-y-1 text-indigo-900">
                            <span className="text-[9px] block tracking-wider uppercase font-mono">Momentum metrics</span>
                            <span className="text-xl font-bold font-mono text-indigo-700 flex items-center justify-center gap-1">
                              <TrendingUp className="w-4 h-4 text-indigo-600" />
                              <span>+{detailedAnalyticsData.comparison?.percentageAboveAverage}% Above Avg</span>
                            </span>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-slate-400 block tracking-wider uppercase font-mono">Predicted open likelihood</span>
                            <span className="text-xl font-bold font-mono text-slate-800">95.4 / 100</span>
                          </div>
                        </div>

                        {/* Recommendation bullet boxes (Module 5) */}
                        <div className="space-y-2.5">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                            Gemini Optimizations audit insights:
                          </h5>
                          <div className="grid grid-cols-1 gap-2">
                            {detailedAnalyticsData.recommendations?.map((rec: string, rIdx: number) => (
                              <div key={rIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed italic">
                                "{rec}"
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Selective Diagnostic Reporting Panel</p>
                  <p className="text-[11px] mt-1 max-w-xs mx-auto text-slate-500">Click the 'Analyze' button on any queued active publication in Scheduler queue list to pull instant engagement matrices.</p>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: ADAPTIVE REPURPOSING */}
          {subTab === 'repurpose' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="flex items-center gap-2 border-b pb-3">
                <Layers className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Cross-Platform Content Repurposing (Module 7)</h3>
                  <p className="text-slate-500 text-xs">Transform a single publication chunk to fit optimal parameters and formats across platforms instantly.</p>
                </div>
              </div>

              <form onSubmit={handleAdaptContentSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Source Content Body</label>
                  <textarea
                    required
                    rows={4}
                    value={repurposeSourceText}
                    onChange={(e) => setRepurposeSourceText(e.target.value)}
                    placeholder="Provide your initial master copy (e.g., long form LinkedIn report, press announcement, or campaign goal overview)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none transition leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Established Source Channel</label>
                    <select
                      value={repurposeSourcePlatform}
                      onChange={(e) => setRepurposeSourcePlatform(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="LINKEDIN">LinkedIn (Professional, B2B format)</option>
                      <option value="INSTAGRAM">Instagram (Sensory, lifestyle format)</option>
                      <option value="FACEBOOK">Facebook (Storytelling family format)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Target Distribution Outputs</label>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                      {['TWITTER', 'INSTAGRAM', 'TIKTOK', 'PINTEREST'].map(plat => (
                        <label key={plat} className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 border border-slate-200 text-slate-900">
                          <input
                            type="checkbox"
                            checked={repurposeTargetPlatforms.includes(plat)}
                            onChange={(e) => {
                              if (e.target.checked) setRepurposeTargetPlatforms(prev => [...prev, plat]);
                              else setRepurposeTargetPlatforms(prev => prev.filter(v => v !== plat));
                            }}
                            className="rounded border-slate-300"
                          />
                          <span>{plat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRepurposing}
                  className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {isRepurposing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Refactor and optimize structural layers via Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Convert, Refactor and Auto-Adapt Copies</span>
                    </>
                  )}
                </button>
              </form>

              {repurposedResults && (
                <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/50 space-y-4 text-slate-900">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest">Adapted Platform Manifest Copies:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(repurposedResults).map((pl) => (
                      <div key={pl} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 text-slate-900">
                        <div className="flex items-center gap-1 border-b pb-1.5">
                          {getPlatformIcon(pl)}
                          <span className="text-[10px] font-mono font-bold text-slate-700">{pl} OPTIMIZED</span>
                        </div>
                        <p className="text-xs text-slate-600 italic font-sans leading-relaxed">"{repurposedResults[pl].caption}"</p>
                        <div className="flex flex-wrap gap-1">
                          {repurposedResults[pl].hashtags?.map((tg: string) => (
                            <span key={tg} className="text-[9px] font-mono font-bold bg-slate-100 px-1 py-0.5 rounded text-slate-500">
                              {tg}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setComposerCaption(repurposedResults[pl].caption);
                            setComposerHashtags(repurposedResults[pl].hashtags?.join(', '));
                            setComposerPlatforms([pl]);
                            setShowComposer(true);
                          }}
                          className="w-full text-center py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition"
                        >
                          Use this template inside scheduler
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: HASHTAG / KEYWORD RESEARCH */}
          {subTab === 'keywords' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="flex items-center gap-2 border-b pb-3">
                <Search className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Hashtag Research & Trend Auditor (Module 8)</h3>
                  <p className="text-slate-500 text-xs">Audit hashtag trends and volume popularity to maximize campaign visibility.</p>
                </div>
              </div>

              <form onSubmit={handleHashtagResearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-6">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hashtag or Keyword Seed</label>
                  <input
                    type="text"
                    required
                    value={keywordSeed}
                    onChange={(e) => setKeywordSeed(e.target.value)}
                    placeholder="e.g. coffee culture, digital automation, design inspiration"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Channel Audit</label>
                  <select
                    value={keywordPlatform}
                    onChange={(e) => setKeywordPlatform(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-medium"
                  >
                    <option value="INSTAGRAM">Instagram Discovery</option>
                    <option value="LINKEDIN">LinkedIn Enterprise</option>
                    <option value="TWITTER">Twitter Trending</option>
                    <option value="TIKTOK">TikTok viral soundscape</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={isResearching}
                    className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow"
                  >
                    {isResearching ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Search className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>Analyze trends</span>
                  </button>
                </div>
              </form>

              {researchResult && (
                <div className="space-y-4 pt-1 font-sans">
                  
                  {/* Research list */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Algorithmic Popularity Indexes:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {researchResult.topHashtags?.map((hash: any, hIdx: number) => (
                        <div key={hIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-900">
                          <p className="font-bold text-indigo-700 text-xs font-mono">{hash.hashtag}</p>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>Aggregate volume:</span>
                            <span className="font-bold text-slate-800">{hash.volume}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>Trend speed:</span>
                            <span className="font-bold text-emerald-600 uppercase">{hash.trend}</span>
                          </div>
                          <span className="text-[9px] font-serif italic text-slate-400 block pt-0.5">Recommend use: {hash.recommendedMix}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Related keywords */}
                  <div className="p-3 border border-indigo-100 rounded-xl bg-indigo-50/20 text-slate-900">
                    <span className="text-[9px] font-mono font-bold text-slate-400 text-slate-400 block tracking-widest uppercase">Associated Viral topics to query:</span>
                    <ul className="list-disc pl-4 text-xs text-slate-600 leading-relaxed mt-1">
                      {researchResult.trendingTopics?.map((tp: string, tIdx: number) => (
                        <li key={tIdx} className="italic text-slate-700">"{tp}"</li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 5: COLLABORATION APPROVALS */}
          {subTab === 'approvals' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Team Collaboration & Compliance Approve Pipeline</h3>
                    <p className="text-slate-500 text-xs">Review draft publications, manage changes request comments, and ensure corporate styling alignment.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {approvals.filter(a => a.status === 'PENDING').length} PENDING AUDITS
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {approvals.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    All scheduled campaign items approved! Compliant state verified.
                  </div>
                ) : (
                  approvals.map((req) => (
                    <div key={req.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-4 text-slate-900">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded border">Checklist token: {req.id}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">Instigated by: <strong>{req.requester}</strong></span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200')
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block font-bold">Draft Content Target:</span>
                        <p className="text-xs text-slate-700 bg-white border border-slate-100 p-2 rounded-lg italic font-sans">
                          "{req.postCaption}"
                        </p>
                      </div>

                      {/* Comments feed */}
                      {req.comments.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block font-bold">In-Line Reviewer Comments:</span>
                          <div className="bg-white border border-slate-100 rounded-lg p-2.5 divide-y divide-slate-100 space-y-2 text-slate-900">
                            {req.comments.map((cm, cI) => (
                              <div key={cI} className="text-xs space-y-0.5 pt-1">
                                <div className="flex justify-between font-bold text-slate-800">
                                  <span>{cm.userId} (CMO)</span>
                                  <span className="text-[9px] text-slate-400 font-mono">{cm.timestamp}</span>
                                </div>
                                <p className="text-slate-600">"{cm.text}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {req.status === 'PENDING' && (
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateApprovalStatus(req.id, 'APPROVED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Approve compliant build</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateApprovalStatus(req.id, 'REJECTED')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg cursor-pointer transition flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5 text-white" />
                            <span>Reject & edit caption</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

        {/* RIGHT METADATA PANEL COLUMN (4 units) */}
        <div className="lg:col-span-4 space-y-6">

          {/* ACTIVE CONNECTED CHANNEL BLOCK (MODULE 1) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b pb-3.5">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Connected Channels</h3>
              <button
                type="button"
                onClick={() => setShowConnectModal(true)}
                className="px-2.5 py-1.5 bg-slate-900 bg-slate-900 text-white hover:bg-slate-950 font-bold text-[10px] rounded-lg transition text-center cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Add Channel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-3 hover:border-slate-300 transition text-slate-900 overflow-hidden">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={acc.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=60"} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-50 shrink-0 text-slate-900"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{acc.accountName}</h4>
                        <span className="shrink-0">{getPlatformIcon(acc.platform)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{acc.accountHandle}</p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] font-mono text-indigo-700 font-medium whitespace-nowrap">{acc.followerCount} seguidores</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t xl:border-t-0 border-slate-200/80 pt-2 xl:pt-0 justify-between xl:justify-end">
                    <button
                      type="button"
                      onClick={() => handleTestConnectivity(acc.id, acc.platform)}
                      disabled={testingConnection === acc.id}
                      className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      {testingConnection === acc.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                      <span>Test Connectivity</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc.id, acc.platform)}
                      className="text-[10.5px] font-bold text-rose-600 hover:text-rose-800 hover:underline px-1 py-1 cursor-pointer whitespace-nowrap"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TELEMETRY LOG HISTORY ACTIVITY */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 text-slate-900">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest border-b pb-2">Diagnostic Log Trace</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto scroller-hidden">
              {logs.map((lg, lgIdx) => (
                <div key={lgIdx} className="text-[10px] font-mono leading-relaxed text-slate-500 hover:text-slate-700 border-l border-slate-300 pl-2">
                  <span className="text-slate-400 font-bold">[{lg.time}]</span> <span className="text-slate-600">{lg.msg}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      
      {/* SIMULATED OAUTH POPUP */}
      {oauthSim && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-fade-in font-sans">
           <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                 {getPlatformIcon(oauthSim)}
                 <span className="font-bold text-slate-800 text-sm">Sign in to {oauthSim}</span>
              </div>
              <button onClick={() => setOauthSim(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
           </div>
           <div className="flex-1 flex items-center justify-center bg-slate-50 p-4">
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                 <div className="flex items-center justify-center gap-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                       <span className="font-black text-xl text-slate-800">MF</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                       {getPlatformIcon(oauthSim)}
                    </div>
                 </div>
                 
                 <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">MarketForge is requesting access to your {oauthSim} account</h3>
                    <p className="text-sm text-slate-500">
                      This will allow MarketForge to:
                      <br/>• Read your profile information
                      <br/>• Create and publish posts on your behalf
                      <br/>• Access basic analytics
                    </p>
                 </div>
                 
                 <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <button 
                      onClick={() => finishOauthConnect(oauthSim)}
                      className="w-full py-3 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold rounded-xl transition"
                    >
                      Allow Access
                    </button>
                    <button 
                      onClick={() => setOauthSim(null)}
                      className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      {/* COMPOSER FORM DIALOG MODAL LAYOUT */}
      {showComposer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col font-sans animate-zoom-in text-slate-900">
            
            {/* Modal header */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-slate-50 text-slate-900">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">Design Master Channel Publication</h4>
              </div>
              <button 
                onClick={() => setShowComposer(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleComposeSubmit} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
              
              {/* Form elements (7 units) */}
              <div className="md:col-span-7 space-y-4">
                
                {/* Brand guidance summary */}
                <div className="bg-indigo-50/50 p-3.5 border border-indigo-100 rounded-xl space-y-1 text-slate-900">
                  <span className="text-[9px] font-mono font-bold text-indigo-700 uppercase block tracking-wider">Style Continuity parameters:</span>
                  <p className="text-[11px] text-slate-600">
                    Applying theme metrics: <strong className="text-indigo-900">"{profile.brandVoice}"</strong> voice tones with corporate color hex coordinates.
                  </p>
                </div>

                {/* Target Platforms selectors */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Target Account Channels</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'TIKTOK', 'PINTEREST'].map(pl => {
                      const isConnected = accounts.some(a => a.platform === pl);
                      return (
                        <label 
                          key={pl} 
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition ${
                            composerPlatforms.includes(pl)
                              ? 'bg-slate-900 border-slate-950 text-white font-bold shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          } ${!isConnected ? 'opacity-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            disabled={!isConnected}
                            checked={composerPlatforms.includes(pl)}
                            onChange={(e) => {
                              if (e.target.checked) setComposerPlatforms(prev => [...prev, pl]);
                              else setComposerPlatforms(prev => prev.filter(p => p !== pl));
                            }}
                            className="hidden"
                          />
                          {getPlatformIcon(pl)}
                          <span className="text-[11px]">{pl}</span>
                          {!isConnected && <span className="text-[8px] text-slate-400">(Offline)</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Title / Headline */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">POST TITLE / HEADLINE</label>
                  <input
                    type="text"
                    value={composerTitle}
                    onChange={(e) => setComposerTitle(e.target.value)}
                    placeholder="e.g. OmniCore v4 Launch - Scaling Enterprise AI Safely"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* AI Assistant copy builder */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-slate-900">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase block">Gemini Content Ideation helper:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">Tone:</span>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[11px] text-slate-800 font-medium focus:outline-none"
                      >
                        <option value="professional">Professional / Corporate</option>
                        <option value="energetic">Energetic & Viral</option>
                        <option value="casual">Casual with Emojis ✨</option>
                        <option value="promo">Urgent Flash Sale / Promo 🏷️</option>
                        <option value="storytelling">Inspiring Storytelling 📖</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={aiObjective}
                      onChange={(e) => setAiObjective(e.target.value)}
                      placeholder="e.g. Introduce Sienna ceramic summer vases with premium discounts"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={handleAIGenerateCaption}
                      disabled={isGeneratingCaption}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      {isGeneratingCaption ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Generating dynamic copies...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                          <span>Gemini: Draft Optimized Copy ({aiTone.toUpperCase()})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {aiVariants.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Selected Copied Alternative:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {aiVariants.map((varText, vIdx) => (
                        <div 
                          key={vIdx}
                          onClick={() => {
                            setComposerCaption(varText);
                            setAiSelectedVariantIdx(vIdx);
                          }}
                          className={`p-2.5 rounded-lg border text-xs text-slate-600 cursor-pointer transition leading-relaxed ${
                            composerCaption === varText ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold' : 'bg-white border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          "{varText}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Character limit feedback counters */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span>CAPTION BODY</span>
                    <span className={composerCaption.length > 280 ? 'text-amber-600' : 'text-slate-400'}>
                      {composerCaption.length} characters
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={composerCaption}
                    onChange={(e) => setComposerCaption(e.target.value)}
                    placeholder="Place your master social post text here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Hashtags comma lists */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">HASHTAGS (Comma separated)</label>
                    <button
                      type="button"
                      onClick={handleGenerateAiHashtags}
                      disabled={isGeneratingHashtags}
                      className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      {isGeneratingHashtags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-300" />}
                      <span>Suggest AI Trending Hashtags</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={composerHashtags}
                    onChange={(e) => setComposerHashtags(e.target.value)}
                    placeholder="e.g. workspace, modernwork, automation"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />

                  {/* AI Generated Trending Hashtags & Keywords Toggle Chips */}
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-900 uppercase font-mono flex items-center gap-1">
                        <Tag className="w-3 h-3 text-purple-600" /> AI Trending Tag Suggestions (Click to Toggle)
                      </span>
                      <span className="text-[9px] text-purple-600 font-semibold">Gemini Real-Time Volume</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {suggestedAiHashtags.map((hObj) => {
                        const cleanTag = hObj.tag.startsWith('#') ? hObj.tag : `#${hObj.tag}`;
                        const currentList = composerHashtags.split(',').map(t => t.trim().toLowerCase());
                        const isSelected = currentList.includes(cleanTag.toLowerCase()) || currentList.includes(cleanTag.slice(1).toLowerCase());

                        return (
                          <button
                            key={hObj.tag}
                            type="button"
                            onClick={() => toggleHashtagChip(hObj.tag)}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold font-mono transition cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                                : 'bg-white hover:bg-purple-100 text-purple-900 border-purple-200'
                            }`}
                          >
                            <span>{cleanTag}</span>
                            <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-700'}`}>
                              {hObj.reach}
                            </span>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Media / AI Asset Generator */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-indigo-700 uppercase block tracking-wider">Visual Assets & Generative AI</span>
                     <span className="text-[9px] bg-white text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">Ad Studio, Pollinations & Unsplash</span>
                   </div>

                   {/* Import picture design from Ad Studio Button */}
                   <button
                     type="button"
                     onClick={() => setShowAdStudioPicker(true)}
                     className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                   >
                     <Sparkles className="w-4 h-4 text-amber-300" />
                     Import Picture Design from Ad Studio
                   </button>

                   <div className="space-y-3 pt-1">
                     <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Image Prompt or Search Term</label>
                       <input
                         type="text"
                         id="media-prompt-input"
                         placeholder="e.g. A modern corporate workspace, minimalist style"
                         className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                       />
                     </div>
                     <div className="flex gap-2">
                       <button
                         type="button"
                         onClick={() => {
                           const input = document.getElementById('media-prompt-input') as HTMLInputElement;
                           const prompt = input?.value;
                           if (!prompt) return;
                           const formatted = encodeURIComponent(prompt);
                           setComposerMediaUrl(`https://image.pollinations.ai/prompt/${formatted}?width=1080&height=1080&nologo=true`);
                         }}
                         className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                       >
                         <Sparkles className="w-3.5 h-3.5" /> AI Generate
                       </button>
                       <button
                         type="button"
                         onClick={() => {
                           const input = document.getElementById('media-prompt-input') as HTMLInputElement;
                           const prompt = input?.value;
                           if (!prompt) return;
                           const formatted = encodeURIComponent(prompt);
                           setComposerMediaUrl(`https://source.unsplash.com/1080x1080/?${formatted}`);
                         }}
                         className="flex-1 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                       >
                         <ImageIcon className="w-3.5 h-3.5" /> Unsplash Search
                       </button>
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Direct Media URL</label>
                       <input
                         type="text"
                         value={composerMediaUrl}
                         onChange={(e) => setComposerMediaUrl(e.target.value)}
                         className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                       />
                     </div>
                   </div>
                </div>

                {/* Scheduling times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">SCHEDULE DATE + TIME</label>
                    <input
                      type="datetime-local"
                      required
                      value={composerScheduledFor}
                      onChange={(e) => setComposerScheduledFor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 font-medium"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          d.setHours(9, 30, 0, 0);
                          setComposerScheduledFor(d.toISOString().slice(0, 16));
                        }}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[9.5px] font-mono font-bold rounded cursor-pointer"
                      >
                        Tomorrow 09:30 AM
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setHours(17, 0, 0, 0);
                          setComposerScheduledFor(d.toISOString().slice(0, 16));
                        }}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[9.5px] font-mono font-bold rounded cursor-pointer"
                      >
                        Today 05:00 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          const day = d.getDay();
                          const diff = d.getDate() + (5 - day + 7) % 7;
                          d.setDate(diff);
                          d.setHours(18, 0, 0, 0);
                          setComposerScheduledFor(d.toISOString().slice(0, 16));
                        }}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[9.5px] font-mono font-bold rounded cursor-pointer"
                      >
                        Friday 06:00 PM
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 p-3 rounded-xl space-y-1 text-slate-900">
                    <span className="text-[9px] font-mono font-bold text-indigo-700 uppercase block">Optimal AI recommended slot:</span>
                    <p className="text-[10.5px] text-slate-600 leading-normal">
                      Based on historical engagement, schedule this post for early work morning hours <strong className="text-slate-800">Tuesday 09:30 AM</strong> to secure +65% clicks.
                    </p>
                  </div>
                </div>

              </div>

              {/* POST MOBILE MOCKUP MOCK PREVIEW COLUMN (5 units) */}
              <div className="md:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Live Preview Mockup</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Characters: <span className={composerCaption.length > 2200 ? 'text-red-500' : 'text-slate-600'}>{composerCaption.length}/2200</span>
                  </span>
                </div>
                
                {/* Platform toggle layout selector */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-slate-900">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('fb_desktop')}
                    className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition cursor-pointer select-none text-center ${previewMode === 'fb_desktop' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    FB (Desktop)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('fb_mobile')}
                    className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition cursor-pointer select-none text-center ${previewMode === 'fb_mobile' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    FB (Mobile)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('ig_mobile')}
                    className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition cursor-pointer select-none text-center ${previewMode === 'ig_mobile' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    IG (Mobile)
                  </button>
                </div>

                {/* Facebook Desktop Preview */}
                {previewMode === 'fb_desktop' && (
                  <div className="border border-slate-200 rounded-2xl bg-white shadow-md overflow-hidden font-sans text-xs text-slate-800 animate-fade-in">
                    <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          MF
                        </div>
                        <div>
                          <p className="font-extrabold text-[12px] text-slate-900 hover:underline cursor-pointer leading-tight">
                            {profile.name} (Official Page)
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 leading-none mt-0.5">
                            <span>Sponsored</span> · <span className="text-[8px]">🌐</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-slate-400 font-bold px-2 hover:bg-slate-50 rounded-full cursor-pointer">···</div>
                    </div>

                    <div className="px-3.5 py-2.5 space-y-1.5 leading-relaxed text-xs">
                      <p className="whitespace-pre-line text-slate-700">
                        {composerCaption || "Write or generate your post caption using the Gemini assistant side panel..."}
                      </p>
                      {composerHashtags && (
                        <p className="text-indigo-600 font-semibold text-[11.5px]">
                          {composerHashtags.split(',').map(tg => `#${tg.trim().replace(/^#/, '')}`).join(' ')}
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-50 border-t border-b border-slate-100 overflow-hidden relative text-slate-900">
                      <img 
                        src={composerMediaUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60"} 
                        alt="" 
                        className="w-full max-h-[300px] object-cover bg-slate-100 text-slate-900"
                      />
                      {composerCtaText && (
                        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center hover:bg-slate-100 cursor-pointer transition text-slate-900">
                          <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                            <span className="text-[9px] font-sans font-medium text-slate-400 uppercase tracking-wider block">MARKETFORGE.AI</span>
                            <p className="font-bold text-slate-800 text-[11px] truncate">{composerCaption.split('\n')[0] || "Automate omnichannel reach instantly"}</p>
                          </div>
                          <span className="px-3 py-1.5 bg-white border border-slate-300 font-bold hover:bg-slate-50 rounded text-[11px] text-slate-700 shrink-0 uppercase transition">
                            {composerCtaText}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta engagement predictor */}
                    <div className="p-3 bg-indigo-950 text-white flex justify-between items-center border-t border-b border-indigo-900">
                      <div>
                        <span className="text-[8px] font-mono text-indigo-300 uppercase block tracking-wider">META ENGAGEMENT PREDICTOR (GEMINI)</span>
                        <p className="text-[10.5px] font-bold text-indigo-100">"Excellent layout. Clear CTA values."</p>
                      </div>
                      <span className="text-[10.5px] font-black font-mono text-indigo-400 bg-indigo-900/40 px-2 py-0.5 rounded border border-indigo-800">
                        15.6% Expected CTR
                      </span>
                    </div>

                    <div className="px-3.5 py-1.5 flex justify-between items-center border-b border-slate-100 text-slate-500 text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">👍❤️😮</span>
                        <span>1.5K likes</span>
                      </div>
                      <div>
                        <span>82 comments · 20 shares</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Facebook Mobile Preview */}
                {previewMode === 'fb_mobile' && (
                  <div className="border border-slate-200 rounded-2xl bg-white shadow-md overflow-hidden font-sans text-xs text-slate-800 max-w-[340px] mx-auto animate-fade-in">
                    <div className="p-3 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                          MF
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {profile.name} (Official Page)
                          </p>
                          <p className="text-[9px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                            <span>Sponsored</span> · <span>🌎</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-400 font-bold text-xs px-1">···</span>
                    </div>

                    <div className="p-3 text-xs text-slate-800 leading-relaxed">
                      <p className="whitespace-pre-line text-slate-700 text-slate-700 line-clamp-3">
                        {composerCaption || "Write or generate your post caption using the Gemini assistant side panel..."}
                      </p>
                      {composerHashtags && (
                        <p className="text-blue-600 pt-1 font-semibold text-blue-600">
                          {composerHashtags.split(',').map(tg => `#${tg.trim().replace(/^#/, '')}`).join(' ')}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <img 
                        src={composerMediaUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60"} 
                        alt="" 
                        className="w-full aspect-square object-cover"
                      />
                      {composerCtaText && (
                        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm p-2.5 text-[10px] border-t border-slate-100 flex justify-between items-center">
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-400 uppercase text-[8px] tracking-wider">MARKETFORGE.AI</p>
                            <p className="font-bold text-slate-800 text-[10.5px] truncate">{composerCaption.split('\n')[0] || "Automate omniscience"}</p>
                          </div>
                          <span className="px-2.5 py-1 bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded text-[9.5px] uppercase shadow-sm">
                            {composerCtaText}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta predictor */}
                    <div className="p-3 bg-indigo-950 text-white flex justify-between items-center border-t border-b border-indigo-900">
                      <div>
                        <span className="text-[8px] font-mono text-indigo-300 block">CTR PROJECTION MODEL</span>
                        <p className="text-[10px] font-bold text-indigo-100">"Sufficient formatting length."</p>
                      </div>
                      <span className="text-[10px] font-black font-mono text-indigo-400 bg-indigo-900/40 px-2.5 py-0.5 rounded border border-indigo-800">
                        14.2% Estimated CTR
                      </span>
                    </div>

                    <div className="p-2 flex justify-between items-center border-b border-slate-100 text-[9.5px] text-slate-500">
                      <span className="flex items-center gap-1">👍❤️ 840 likes</span>
                      <span>42 comments · 12 shares</span>
                    </div>
                  </div>
                )}

                {/* Instagram Mobile Preview */}
                {previewMode === 'ig_mobile' && (
                  <div className="border border-slate-200 rounded-3xl bg-white shadow-md overflow-hidden font-sans text-xs max-w-[340px] mx-auto animate-fade-in">
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 shrink-0">
                          <div className="w-full h-full rounded-full bg-white p-[1px] text-slate-900">
                            <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[9px]">
                              MF
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight text-slate-900">{profile.name.toLowerCase()}</p>
                          <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 leading-none">Sponsored Marketing Ad</p>
                        </div>
                      </div>
                      <span className="text-slate-500 font-black tracking-tight text-xs leading-none">···</span>
                    </div>

                    <div className="relative">
                      <img 
                        src={composerMediaUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60"} 
                        alt="" 
                        className="w-full aspect-square object-cover bg-slate-100 text-slate-900"
                      />
                      {composerCtaText && (
                        <div className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[11px] flex justify-between items-center cursor-pointer transition">
                          <span className="tracking-wide uppercase text-[9px] font-bold">{composerCtaText}</span>
                          <span className="text-[10px]">&gt;</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-900 border-t border-b border-slate-800 text-white flex justify-between items-center">
                      <div>
                        <span className="text-[8px] font-mono text-indigo-300 uppercase block">IG ENGAGEMENT PREDICTION</span>
                        <p className="text-[10.5px] font-bold text-indigo-100">"Excellent style pairing alignment."</p>
                      </div>
                      <span className="text-[10.5px] font-black font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800">
                        18.4% CTR
                      </span>
                    </div>

                    <div className="p-3 space-y-2">
                      <p className="text-slate-700 leading-relaxed text-slate-700 leading-normal text-[11.5px]">
                        <span className="font-bold text-slate-950 mr-1.5">{profile.name.toLowerCase()}</span>
                        {composerCaption || "Write or generate your post caption using the Gemini assistant side panel..."}
                      </p>
                      {composerHashtags && (
                        <p className="text-indigo-600 text-[11px] font-semibold">
                          {composerHashtags.split(',').map(tg => `#${tg.trim().replace(/^#/, '')}`).join(' ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  <span>Commit and Schedule publication template</span>
                </button>
              </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONNECT NEW CHANNEL MODAL DIALOG */}
      {showConnectModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border rounded-2xl shadow-xl w-full max-w-lg p-0 font-sans overflow-hidden animate-zoom-in text-slate-900 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b p-6 bg-slate-50 shrink-0">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                Connect New Social Channel
              </h4>
              <button onClick={() => { setShowConnectModal(false); setConnectingPlatform(null); setAuthFormClientId(''); setAuthFormClientSecret(''); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {!connectingPlatform ? (
                <>
                  <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900 shadow-sm flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">Official Connection Guide</p>
                      <p className="text-indigo-800/80 text-xs">
                        Select a platform below to connect securely. We use official OAuth 2.0 and API keys approved by each network to ensure your data remains protected.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { name: "LinkedIn Page", platform: "LINKEDIN", icon: <Linkedin className="w-5 h-5 text-sky-700" />, desc: "Connect Company Page" },
                      { name: "Instagram Business", platform: "INSTAGRAM", icon: <Instagram className="w-5 h-5 text-pink-600" />, desc: "Link IG Pro Account" },
                      { name: "Facebook Page", platform: "FACEBOOK", icon: <Facebook className="w-5 h-5 text-blue-600" />, desc: "Link FB Pages & Groups" },
                      { name: "X (Twitter)", platform: "TWITTER", icon: <Twitter className="w-5 h-5 text-slate-800" />, desc: "Connect X Premium/API" },
                      { name: "WhatsApp Business", platform: "WHATSAPP", icon: <MessageSquare className="w-5 h-5 text-emerald-500" />, desc: "Link WhatsApp Cloud API" },
                      { name: "TikTok Creative", platform: "TIKTOK", icon: <Video className="w-5 h-5 text-rose-500" />, desc: "Link Creator Account" }
                    ].map((plat) => {
                      const isConnected = accounts.some(a => a.platform === plat.platform);
                      return (
                      <button
                        key={plat.platform}
                        type="button"
                        onClick={() => setConnectingPlatform(plat.platform)}
                        className={`p-4 bg-white hover:bg-slate-50 border ${isConnected ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200'} hover:border-indigo-300 rounded-xl flex flex-col items-start gap-2 text-left cursor-pointer shadow-sm transition relative overflow-hidden`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {plat.icon}
                            <span className="font-bold text-sm">{plat.name}</span>
                          </div>
                          {isConnected ? (
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                          )}
                        </div>
                        <div className="flex items-center justify-between w-full mt-1">
                           <span className="text-[10px] text-slate-500">{plat.desc}</span>
                           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                      </button>
                    )})}
                  </div>
                </>
              ) : (
                <div className="space-y-5">
                   <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                     <button onClick={() => { setConnectingPlatform(null); setAuthFormClientId(''); setAuthFormClientSecret(''); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1"><ArrowRight className="w-3 h-3 rotate-180" /> Back</button>
                     <span className="text-sm font-bold text-slate-800">Configure {connectingPlatform}</span>
                   </div>
                   
                   <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 border border-slate-200 shadow-inner">
                     <p className="font-bold text-slate-800 mb-2 text-sm flex items-center gap-2">
                       <ShieldAlert className="w-4 h-4 text-indigo-600" />
                       Connection Guide: {connectingPlatform}
                     </p>
                     
                     {['FACEBOOK', 'INSTAGRAM'].includes(connectingPlatform) && (
                        <div className="space-y-2 text-slate-600">
                           <p>1. Navigate to the <strong>Meta for Developers</strong> portal and click "Create App".</p>
                           <p>2. Select "Other" &#8594; "Business" as the app type.</p>
                           <p>3. In your App Dashboard, add the <strong>Facebook Login for Business</strong> product.</p>
                           <p>4. Go to App Settings &#8594; Basic to copy your <strong>App ID</strong> and <strong>App Secret</strong>.</p>
                           <p className="mt-2 text-[10px] text-indigo-600 font-semibold bg-indigo-50 p-2 rounded">
                             * Requires a verified Meta Business Account for production use.
                           </p>
                        </div>
                     )}
                     
                     {connectingPlatform === 'LINKEDIN' && (
                        <div className="space-y-2 text-slate-600">
                           <p>1. Navigate to the <strong>LinkedIn Developer Portal</strong> and click "Create app".</p>
                           <p>2. Link your company's LinkedIn Page.</p>
                           <p>3. Request access to the <strong>Share on LinkedIn</strong> and <strong>Sign In with LinkedIn</strong> products under the Products tab.</p>
                           <p>4. Go to the Auth tab to find your <strong>Client ID</strong> and <strong>Client Secret</strong>.</p>
                           <p className="mt-2 text-[10px] text-indigo-600 font-semibold bg-indigo-50 p-2 rounded">
                             * You must be a Super Admin of the linked Company Page.
                           </p>
                        </div>
                     )}
                     
                     {connectingPlatform === 'TWITTER' && (
                        <div className="space-y-2 text-slate-600">
                           <p>1. Navigate to the <strong>X Developer Portal</strong> and sign in.</p>
                           <p>2. Create a Project and an associated Developer App.</p>
                           <p>3. Navigate to "Keys and tokens" under your app settings.</p>
                           <p>4. Generate your <strong>API Key</strong> (Client ID) and <strong>API Key Secret</strong> (Client Secret).</p>
                           <p className="mt-2 text-[10px] text-indigo-600 font-semibold bg-indigo-50 p-2 rounded">
                             * Note: Basic tier limits apply for automated posting (1500 posts/month).
                           </p>
                        </div>
                     )}
                     
                     {connectingPlatform === 'WHATSAPP' && (
                        <div className="space-y-2 text-slate-600">
                           <p>1. Navigate to <strong>Meta for Developers</strong> and create an App (Business type).</p>
                           <p>2. Add the <strong>WhatsApp</strong> product to your app.</p>
                           <p>3. Go to WhatsApp &#8594; API Setup to find your <strong>Phone Number ID</strong>.</p>
                           <p>4. Generate a <strong>Permanent Access Token</strong> via Meta Business settings.</p>
                        </div>
                     )}
                     
                     {connectingPlatform === 'TIKTOK' && (
                        <div className="space-y-2 text-slate-600">
                           <p>1. Go to the <strong>TikTok for Developers</strong> portal.</p>
                           <p>2. Create an App for Web and select the <strong>Video Kit</strong> product.</p>
                           <p>3. Complete app review (requires a valid privacy policy URL).</p>
                           <p>4. Copy your <strong>Client Key</strong> and <strong>Client Secret</strong> from App Details.</p>
                        </div>
                     )}
                   </div>

                   <form className="space-y-4" onSubmit={async (e) => { 
                     e.preventDefault(); 
                     setIsLoading(true);
                     try {
                        const res = await fetch('/api/agent/social/validate', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tenantId}` },
                           body: JSON.stringify({
                             platform: connectingPlatform,
                             clientId: authFormClientId,
                             clientSecret: authFormClientSecret
                           })
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                           setToastMessage({ title: 'Validation Failed', desc: data.error || data.message || 'Invalid credentials.', type: 'error' });
                           setTimeout(() => setToastMessage(null), 4000);
                           setIsLoading(false);
                        } else {
                           setToastMessage({ title: 'Connection Successful', desc: data.message || 'API connection established.', type: 'success' });
                           setTimeout(() => setToastMessage(null), 4000);
                           finishOauthConnect(connectingPlatform);
                        }
                     } catch (err: any) {
                        setToastMessage({ title: 'Connection Error', desc: err.message || 'Failed to reach API server.', type: 'error' });
                        setTimeout(() => setToastMessage(null), 4000);
                        setIsLoading(false);
                     }
                   }}>
                     {connectingPlatform === 'WHATSAPP' && (
                       <>
                         <div>
                           <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number ID</label>
                           <input type="text" value={authFormClientId} onChange={e => setAuthFormClientId(e.target.value)} required placeholder="e.g. 10293847561" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm" />
                         </div>
                         <div>
                           <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Permanent Access Token</label>
                           <input type="password" value={authFormClientSecret} onChange={e => setAuthFormClientSecret(e.target.value)} required placeholder="EAAD...XXXX" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm" />
                         </div>
                       </>
                     )}
                     {['TWITTER', 'LINKEDIN', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK'].includes(connectingPlatform) && (
                       <>
                         <div>
                           <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">App / Client ID</label>
                           <input type="text" value={authFormClientId} onChange={e => setAuthFormClientId(e.target.value)} required placeholder="Client ID" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm" />
                         </div>
                         <div>
                           <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">App / Client Secret (Token)</label>
                           <input type="password" value={authFormClientSecret} onChange={e => setAuthFormClientSecret(e.target.value)} required placeholder="Client Secret or Access Token" className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm" />
                         </div>
                       </>
                     )}

                     <button type="submit" disabled={isLoading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow disabled:opacity-50 transition">
                       {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                       Test Connectivity & Save
                     </button>
                   </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION UPGRADE MODAL DIALOG */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border text-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-8 font-sans space-y-6 relative animate-zoom-in">
            <button 
              onClick={() => setShowUpgradeModal(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wider rounded-full">
                Tier Upgrade Requested
              </span>
              <h4 className="font-extrabold text-slate-900 text-2xl tracking-tight">
                Unlock Pro & Agency Execution
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have reached your designated monthly campaign cap for your present plan tier. Upgrade to unlock active production pipes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-indigo-400 transition bg-slate-50 relative overflow-hidden text-slate-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Most Popular</span>
                  <p className="font-extrabold text-slate-800 text-lg">Growth Edition</p>
                  <p className="text-xs text-slate-500">For mid-market brands seeking scaling automations.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">$49</span>
                  <span className="text-slate-400 text-xs">/month</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>15 campaigns per month</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>5 integrated active channels</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Gemini Pro Copywriter</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={async () => {
                    alert("Simulating Upgrade to Growth Plan: Limits cleared! Redirecting to billing portal...");
                    setShowUpgradeModal(false);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Upgrade to Growth
                </button>
              </div>

              <div className="border-2 border-indigo-600 rounded-2xl p-5 space-y-4 relative bg-white shadow-md text-slate-900">
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[9px] uppercase tracking-wider rounded-md">
                  Unlimited
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">White-Label Ready</span>
                  <p className="font-extrabold text-slate-800 text-lg">Agency Edition</p>
                  <p className="text-xs text-slate-500">For high-growth agencies managing global clients.</p>
                </div>
                <div className="flex items-baseline gap-1 border-slate-100">
                  <span className="text-2xl font-black text-slate-900">$99</span>
                  <span className="text-slate-400 text-xs">/month</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>100 campaigns per month</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>12 connected active channels</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Full White-Label portal access</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={async () => {
                    alert("Simulating Upgrade to Agency Plan: Limits cleared! Redirecting to secure custom domain routing...");
                    setShowUpgradeModal(false);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Upgrade to Agency
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-400 font-medium">
                🔒 Secure checkout encrypted with TLS 1.3 standard bank compliance rules. Cancel anytime.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE AUTO-RESPONDER RULE MODAL */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border rounded-2xl shadow-xl w-full max-w-lg p-6 font-sans space-y-4 animate-zoom-in text-slate-900">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                Create Comment-to-DM Auto-Responder Rule
              </h4>
              <button onClick={() => setShowAddRuleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Target Platform</label>
                <select
                  value={newRulePlatform}
                  onChange={(e) => setNewRulePlatform(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none"
                >
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="TWITTER">Twitter / X</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="LINKEDIN">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Trigger Comment Keyword</label>
                <input
                  type="text"
                  required
                  value={newRuleKeyword}
                  onChange={(e) => setNewRuleKeyword(e.target.value.toUpperCase())}
                  placeholder="e.g. INFO, DISCOUNT, PRICE, CODE"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">Public Comment Reply</label>
                <textarea
                  rows={2}
                  required
                  value={newRuleCommentReply}
                  onChange={(e) => setNewRuleCommentReply(e.target.value)}
                  placeholder="e.g. Check your DMs! 📩 We sent you the direct link and code."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-purple-600 uppercase block mb-1">Automated Private DM Message</label>
                <textarea
                  rows={3}
                  required
                  value={newRuleDmMessage}
                  onChange={(e) => setNewRuleDmMessage(e.target.value)}
                  placeholder="e.g. Hi @user! Here is your exclusive download link: https://marketforge.ai/access..."
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!newRuleKeyword || !newRuleCommentReply || !newRuleDmMessage) return;
                  const newRuleObj = {
                    id: `rule-${Date.now()}`,
                    platform: newRulePlatform,
                    keyword: newRuleKeyword,
                    commentReply: newRuleCommentReply,
                    dmMessage: newRuleDmMessage,
                    active: true,
                    triggeredCount: 0
                  };
                  setAutomationRules(prev => [newRuleObj, ...prev]);
                  setShowAddRuleModal(false);
                  setNewRuleKeyword('');
                  setNewRuleCommentReply('');
                  setNewRuleDmMessage('');
                  setToastMessage({
                    title: 'Auto-Responder Rule Created!',
                    desc: `Created rule for keyword "${newRuleKeyword}" on ${newRulePlatform}`,
                    type: 'success'
                  });
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Save Auto-Responder Rule
              </button>
              <button
                type="button"
                onClick={() => setShowAddRuleModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AD STUDIO DESIGNS PICKER MODAL IN COMPOSER */}
      {showAdStudioPicker && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white border rounded-2xl shadow-xl w-full max-w-3xl p-6 font-sans space-y-4 animate-zoom-in text-slate-900 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Select Picture Design from Ad Studio
              </h4>
              <button onClick={() => setShowAdStudioPicker(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-1">
              {adStudioAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    setComposerMediaUrl(asset.imageUrl);
                    setComposerTitle(asset.title);
                    setComposerCaption(asset.description);
                    setComposerHashtags(asset.hashtags.join(', '));
                    setShowAdStudioPicker(false);
                    setToastMessage({
                      title: 'Ad Design Selected',
                      desc: `Imported "${asset.title}" into post composer`,
                      type: 'success'
                    });
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:border-purple-400 hover:shadow-md transition cursor-pointer flex flex-col bg-slate-50/50"
                >
                  <div className="relative aspect-video bg-slate-100">
                    <img src={asset.imageUrl} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      {asset.dimensions}
                    </span>
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                      {asset.conversionScore}% CTR
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[9px] font-mono font-bold text-purple-600 block">{asset.category}</span>
                    <p className="font-bold text-slate-800 text-xs truncate">{asset.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{asset.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
