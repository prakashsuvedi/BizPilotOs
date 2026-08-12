import React, { useState, useEffect } from 'react';
import {
  Globe,
  Wand2,
  RefreshCw,
  UploadCloud,
  Code,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Plus,
  Trash2,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Layers,
  Palette,
  ShoppingBag,
  HeartPulse,
  Pill,
  Store,
  Compass,
  Dumbbell,
  Building,
  Star,
  MapPin,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  X,
  Image as ImageIcon,
  MessageSquare,
  Maximize2,
  Send,
  Zap,
  Sliders,
  Tag,
  ShieldCheck,
  Layout,
  FileText,
  Inbox,
  Edit3,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Download,
  Flame,
  Moon,
  Sun,
  EyeOff,
  User,
  Sparkle,
  Bed,
  Utensils,
  Calendar,
  Search
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { getTenantBranding, saveTenantBranding } from '../lib/tenantBranding';
import { clientDb } from '../lib/firebase';
import { logAiTaskUsage } from '../lib/aiUsageTracker';
import AiUsageBadge from './AiUsageBadge';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
}

// Section Data Types
export type SectionType = 
  | 'hero' 
  | 'features' 
  | 'products' 
  | 'stats' 
  | 'testimonials' 
  | 'faq' 
  | 'cta' 
  | 'contact' 
  | 'customText'
  | 'hotelRooms'
  | 'restaurantMenu'
  | 'toursPackages';

export interface PageSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  hidden?: boolean;
  contentData?: any; // items array or custom text
}

export interface WebsitePage {
  id: string;
  name: string;
  slug: string;
  sections: PageSection[];
}

export interface WebTheme {
  id: string;
  name: string;
  description: string;
  bgCanvas: string;
  cardBg: string;
  textColor: string;
  headingColor: string;
  accentBtn: string;
  accentText: string;
  badgeBg: string;
  headerBg: string;
  fontFamily: string;
  borderColor: string;
}

export const WORLD_CLASS_THEMES: Record<string, WebTheme> = {
  cyber_obsidian: {
    id: 'cyber_obsidian',
    name: 'Cyber Obsidian (Dark Luxury)',
    description: 'Deep midnight obsidian with violet & cyan glow accents, glassy cards, ultra-modern tech aesthetic.',
    bgCanvas: 'bg-[#07080E]',
    cardBg: 'bg-[#0D0E17]/90 backdrop-blur-md border border-white/10',
    textColor: 'text-slate-300',
    headingColor: 'text-white',
    accentBtn: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/30',
    accentText: 'text-cyan-400',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
    headerBg: 'bg-[#090A10]/95 backdrop-blur-md',
    fontFamily: 'font-sans',
    borderColor: 'border-white/10'
  },
  lux_gold: {
    id: 'lux_gold',
    name: 'Midnight Gold & Serif Luxury',
    description: 'High-end gold accents on dark slate with Playfair serif headlines for premium brand prestige.',
    bgCanvas: 'bg-[#0A0D14]',
    cardBg: 'bg-[#111622] border border-amber-500/20 shadow-xl',
    textColor: 'text-amber-100/80',
    headingColor: 'text-amber-100 font-serif',
    accentBtn: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold shadow-lg shadow-amber-600/20',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    headerBg: 'bg-[#070A10]/95 backdrop-blur-md border-b border-amber-500/20',
    fontFamily: 'font-serif',
    borderColor: 'border-amber-500/20'
  },
  clean_saas: {
    id: 'clean_saas',
    name: 'Clean Crisp Tech SaaS (Light)',
    description: 'Ultra-clean white/slate canvas with high-contrast crisp blue geometry and sharp typography.',
    bgCanvas: 'bg-slate-50',
    cardBg: 'bg-white border border-slate-200 shadow-sm',
    textColor: 'text-slate-600',
    headingColor: 'text-slate-900',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20',
    accentText: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    headerBg: 'bg-white/95 backdrop-blur-md border-b border-slate-200',
    fontFamily: 'font-sans',
    borderColor: 'border-slate-200'
  },
  nordic_emerald: {
    id: 'nordic_emerald',
    name: 'Nordic Organic Emerald',
    description: 'Deep forest green and warm cream highlights with organic rounded curves and peaceful vibe.',
    bgCanvas: 'bg-[#05140E]',
    cardBg: 'bg-[#0A241A] border border-emerald-500/20 shadow-lg',
    textColor: 'text-emerald-100/80',
    headingColor: 'text-emerald-50',
    accentBtn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    headerBg: 'bg-[#040F0A]/95 backdrop-blur-md border-b border-emerald-500/20',
    fontFamily: 'font-sans',
    borderColor: 'border-emerald-500/20'
  },
  vibrant_sunset: {
    id: 'vibrant_sunset',
    name: 'Vibrant Sunset Coral',
    description: 'High-energy coral red and amber gradients designed for creative agencies and e-commerce.',
    bgCanvas: 'bg-[#12080C]',
    cardBg: 'bg-[#1E0E15] border border-rose-500/20 shadow-xl',
    textColor: 'text-rose-100/80',
    headingColor: 'text-white',
    accentBtn: 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white shadow-lg shadow-rose-500/30',
    accentText: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    headerBg: 'bg-[#0E060A]/95 backdrop-blur-md border-b border-rose-500/20',
    fontFamily: 'font-sans',
    borderColor: 'border-rose-500/20'
  },
  synthwave_neon: {
    id: 'synthwave_neon',
    name: 'Cyberpunk Synthwave Neon',
    description: 'Electric pink and cyber cyan neon contrast on grid dark purple backdrop.',
    bgCanvas: 'bg-[#0B0612]',
    cardBg: 'bg-[#150B24] border border-fuchsia-500/30 shadow-2xl',
    textColor: 'text-fuchsia-100/80',
    headingColor: 'text-fuchsia-50',
    accentBtn: 'bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white font-extrabold shadow-lg shadow-fuchsia-500/40',
    accentText: 'text-cyan-300',
    badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40',
    headerBg: 'bg-[#08040E]/95 backdrop-blur-md border-b border-fuchsia-500/30',
    fontFamily: 'font-sans',
    borderColor: 'border-fuchsia-500/30'
  }
};

export default function WebsiteBuilderOS({ profile, tenantId }: Props) {
  // Global Website Configuration State
  const [siteName, setSiteName] = useState(profile.name || 'Enterprise MarketForge Studio');
  const [activeThemeId, setActiveThemeId] = useState<string>('cyber_obsidian');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'pages' | 'sections' | 'themes' | 'leads' | 'export'>('pages');

  // Multi-Page state
  const [pages, setPages] = useState<WebsitePage[]>([
    {
      id: 'page_home',
      name: 'Home',
      slug: '/',
      sections: [
        {
          id: 'sec_hero_1',
          type: 'hero',
          title: 'Transform Your Business Operations With AI Intelligence',
          subtitle: 'Automate customer growth, optimize campaign conversions, and publish high-converting enterprise digital storefronts in seconds.',
          badge: 'Next-Gen Enterprise Engine',
          imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
          ctaText: 'Explore Collection',
          ctaLink: '#catalog'
        },
        {
          id: 'sec_features_1',
          type: 'features',
          title: 'Engineered For High Growth Businesses',
          subtitle: 'Our key competitive advantages and operational standards',
          contentData: [
            { title: 'AI-Powered Automation', desc: 'Instant campaign generation with Gemini 2.5 intelligence.' },
            { title: 'Omnichannel Publishing', desc: 'Sync landing pages, WhatsApp bots, and social feeds in 1-click.' },
            { title: 'Real-Time ROI Analytics', desc: 'Track ad spend, customer pipelines, and token consumption.' }
          ]
        },
        {
          id: 'sec_products_1',
          type: 'products',
          title: 'Featured Offerings & Premium Services',
          subtitle: 'Browse our top-tier catalog items engineered for maximum quality',
          contentData: [
            { id: 'p1', title: 'Enterprise Growth Package', price: '$499/mo', category: 'Subscription', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', badge: 'Top Seller', description: 'Full access to AI marketing automation, lead scoring, and dedicated CRM.' },
            { id: 'p2', title: 'AEO Knowledge Base Optimizer', price: '$299', category: 'Optimization', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', badge: 'High Impact', description: 'Index your business across Perplexity, Gemini, and ChatGPT search bots.' },
            { id: 'p3', title: 'Custom Whitelabel Portal', price: '$899', category: 'Enterprise', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', badge: 'Custom', description: 'Your logo, custom domain, BYOK API key integration, and multi-user RBAC.' }
          ]
        },
        {
          id: 'sec_stats_1',
          type: 'stats',
          title: 'Proven Enterprise Performance',
          subtitle: 'Real metrics backed by global customer results',
          contentData: [
            { metric: '99.99%', label: 'Cloud Network Uptime' },
            { metric: '10x', label: 'Faster Lead Processing' },
            { metric: '$4.2M+', label: 'Attributed Client Revenue' }
          ]
        },
        {
          id: 'sec_contact_1',
          type: 'contact',
          title: 'Get In Touch With Our Executive Team',
          subtitle: 'Send us a message and receive a custom solution proposal within 2 hours.',
          ctaText: 'Submit Inquiry'
        }
      ]
    },
    {
      id: 'page_about',
      name: 'About Us',
      slug: '/about',
      sections: [
        {
          id: 'sec_about_hero',
          type: 'hero',
          title: 'Pioneering The Future Of Autonomous Business Operations',
          subtitle: 'Founded with a mission to eliminate manual marketing friction and empower companies to scale effortlessly.',
          badge: 'Our Corporate Mission',
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
        },
        {
          id: 'sec_about_text',
          type: 'customText',
          title: 'Behind MarketForge Studio',
          subtitle: 'We combine generative AI, real-time analytics, and white-label multi-tenancy into a singular operating system.',
          contentData: 'MarketForge was built from the ground up to handle high-concurrency enterprise workloads. Whether you run a single boutique agency or manage a multi-location healthcare network, our platform adapts to your brand guidelines automatically.'
        }
      ]
    }
  ]);

  const [activePageId, setActivePageId] = useState<string>('page_home');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>('sec_hero_1');

  // Leads state
  const [receivedLeads, setReceivedLeads] = useState<any[]>([]);

  // Preview Submission Form State inside preview iframe
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [leadSubmittedStatus, setLeadSubmittedStatus] = useState<string | null>(null);

  // Status & Publishing
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Load configuration from Firestore on mount
  useEffect(() => {
    loadSavedWebsiteConfig();
    loadLeads();
  }, [tenantId]);

  const loadSavedWebsiteConfig = async () => {
    try {
      const configDoc = await clientDb.getDocById('website_config', tenantId);
      if (configDoc) {
        if (configDoc.siteName) setSiteName(configDoc.siteName);
        if (configDoc.activeThemeId) setActiveThemeId(configDoc.activeThemeId);
        if (configDoc.pages && configDoc.pages.length > 0) setPages(configDoc.pages);
      }
    } catch (err) {
      console.warn("Could not load website_config from Firestore:", err);
    }
  };

  const loadLeads = async () => {
    try {
      const docs = await clientDb.getCollection('leads', tenantId);
      if (docs && docs.length > 0) {
        setReceivedLeads(docs);
      } else {
        if (tenantId === 'demo-tenant' || tenantId === 'sienna-tenant') {
          // Template showcase sample leads
          setReceivedLeads([
            { id: 'lead-1', name: 'Alexander Wright', email: 'alex@apexcorp.com', phone: '+1 555-0182', message: 'Interested in the Enterprise Whitelabel Portal integration.', createdAt: new Date().toISOString() },
            { id: 'lead-2', name: 'Samantha Vance', email: 'sam@lumina.io', phone: '+1 555-0492', message: 'Would like a quick demo of the AEO Knowledge Base Optimizer.', createdAt: new Date(Date.now() - 3600000).toISOString() }
          ]);
        } else {
          setReceivedLeads([]);
        }
      }
    } catch (err) {
      console.warn("Could not load leads:", err);
    }
  };

  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const activeTheme = WORLD_CLASS_THEMES[activeThemeId] || WORLD_CLASS_THEMES.cyber_obsidian;

  // Helper to save website state to Firestore
  const saveWebsiteToDb = async (updatedPages: WebsitePage[], updatedThemeId: string, updatedName: string) => {
    const payload = {
      id: tenantId,
      siteName: updatedName,
      activeThemeId: updatedThemeId,
      pages: updatedPages,
      updatedAt: new Date().toISOString()
    };
    try {
      await clientDb.addDocToTenant('website_config', payload, tenantId);
    } catch (err) {
      console.warn("Failed saving website config to Firestore:", err);
    }
  };

  // Section Manipulation Handlers
  const handleAddSection = (type: SectionType) => {
    const newSecId = `sec_${type}_${Date.now()}`;
    let newSec: PageSection;

    switch (type) {
      case 'hero':
        newSec = { id: newSecId, type, title: 'New Catchy Hero Headline', subtitle: 'Detailed subtitle explaining your value proposition', badge: 'New Feature', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80', ctaText: 'Get Started' };
        break;
      case 'features':
        newSec = { id: newSecId, type, title: 'Core Competitive Advantages', subtitle: 'Why clients choose us over competitors', contentData: [{ title: 'Advantage 1', desc: 'Description of key feature' }, { title: 'Advantage 2', desc: 'Description of another key capability' }] };
        break;
      case 'products':
        newSec = { id: newSecId, type, title: 'Featured Products & Services', subtitle: 'Explore our catalog offerings', contentData: [{ id: `p_${Date.now()}`, title: 'Premium Service Item', price: '$199', category: 'General', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', badge: 'Hot', description: 'Item description text.' }] };
        break;
      case 'stats':
        newSec = { id: newSecId, type, title: 'Key Milestones', subtitle: 'Numbers that speak for themselves', contentData: [{ metric: '100+', label: 'Clients Served' }, { metric: '99.8%', label: 'Satisfaction' }] };
        break;
      case 'testimonials':
        newSec = { id: newSecId, type, title: 'What Our Clients Say', subtitle: 'Real testimonials from industry leaders', contentData: [{ quote: 'MarketForge completely revolutionized our lead conversion rate.', author: 'Elena Rostova', role: 'CEO, Apex Media' }] };
        break;
      case 'faq':
        newSec = { id: newSecId, type, title: 'Frequently Asked Questions', subtitle: 'Everything you need to know about our services', contentData: [{ q: 'How fast can I get started?', a: 'You can launch your digital workspace in less than 5 minutes.' }, { q: 'Do you offer custom SLA support?', a: 'Yes, 24/7 dedicated account managers are available.' }] };
        break;
      case 'cta':
        newSec = { id: newSecId, type, title: 'Ready To Accelerate Your Growth?', subtitle: 'Join over 5,000+ businesses running on our engine today.', ctaText: 'Claim Your Free Trial' };
        break;
      case 'contact':
        newSec = { id: newSecId, type, title: 'Contact Us', subtitle: 'Fill out the form below to reach our team directly.', ctaText: 'Send Message' };
        break;
      case 'hotelRooms':
        newSec = {
          id: newSecId,
          type,
          title: 'Luxury Guest Rooms & Suites',
          subtitle: 'Experience world-class hospitality with direct online room reservations.',
          badge: 'Live Room Availability',
          contentData: [
            { id: 'hr-1', roomNumber: '401', type: 'Presidential Ocean Suite', pricePerNight: 450, maxOccupancy: 4, amenities: ['Private Balcony', 'King Bed', 'Jacuzzi', 'High-Speed Wi-Fi'], image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80' },
            { id: 'hr-2', roomNumber: '302', type: 'Executive Skyline Suite', pricePerNight: 280, maxOccupancy: 2, amenities: ['City View', 'Work Desk', 'Mini Bar', 'Breakfast Included'], image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80' },
            { id: 'hr-3', roomNumber: '205', type: 'Deluxe King Room', pricePerNight: 180, maxOccupancy: 2, amenities: ['King Bed', 'Ensuite Bathroom', 'Smart TV'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80' }
          ]
        };
        break;
      case 'restaurantMenu':
        newSec = {
          id: newSecId,
          type,
          title: 'Chef Selected Gourmet Dining Menu',
          subtitle: 'Artisanal culinary creations prepared with organic local ingredients.',
          badge: 'Gourmet Dining',
          contentData: [
            { id: 'rm-1', name: 'Truffle Glazed Wagyu Ribeye', category: 'Main Course', price: 68, prepTimeMins: 25, isVeg: false, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', description: 'Dry-aged Wagyu ribeye served with black truffle reduction.' },
            { id: 'rm-2', name: 'Wild Mushroom & Spinach Risotto', category: 'Main Course', price: 34, prepTimeMins: 20, isVeg: true, image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80', description: 'Creamy Arborio rice with porcini mushrooms and truffle oil.' },
            { id: 'rm-3', name: 'Artisan Burrata & Heirloom Salad', category: 'Starters', price: 24, prepTimeMins: 12, isVeg: true, image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19655?auto=format&fit=crop&w=600&q=80', description: 'Fresh Italian burrata with heirloom tomatoes and basil oil.' }
          ]
        };
        break;
      case 'toursPackages':
        newSec = {
          id: newSecId,
          type,
          title: 'Curated Global Expeditions & Tour Packages',
          subtitle: 'Unforgettable journeys guided by certified experts with complete itinerary logistics.',
          badge: 'Featured Tours',
          contentData: [
            { id: 'tp-1', name: '7-Day African Wildlife Safari', loc: 'Kenya & Serengeti', days: 7, price: 2400, rating: '4.9', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', description: '4x4 Land Cruiser, luxury tented camp & balloon safari.' },
            { id: 'tp-2', name: 'Kyoto Cultural Heritage & Tea Ceremony', loc: 'Kyoto, Japan', days: 5, price: 1800, rating: '4.8', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', description: 'Shinkansen transfers, shrine pass & ryokan kaiseki dining.' },
            { id: 'tp-3', name: 'Everest Helicopter Trek & Base Camp', loc: 'Solukhumbu, Nepal', days: 12, price: 3500, rating: '5.0', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80', description: 'Lukla flight, sherpa guides, oxygen & luxury lodge accommodation.' }
          ]
        };
        break;
      default:
        newSec = { id: newSecId, type: 'customText', title: 'Custom Text Section', subtitle: 'Informational block', contentData: 'Add any custom company description or terms here.' };
    }

    const updatedPages = pages.map(p => {
      if (p.id !== activePageId) return p;
      return { ...p, sections: [...p.sections, newSec] };
    });

    setPages(updatedPages);
    setSelectedSectionId(newSecId);
    saveWebsiteToDb(updatedPages, activeThemeId, siteName);
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const updatedPages = pages.map(p => {
      if (p.id !== activePageId) return p;
      const idx = p.sections.findIndex(s => s.id === sectionId);
      if (idx === -1) return p;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= p.sections.length) return p;

      const newSections = [...p.sections];
      const temp = newSections[idx];
      newSections[idx] = newSections[targetIdx];
      newSections[targetIdx] = temp;
      return { ...p, sections: newSections };
    });

    setPages(updatedPages);
    saveWebsiteToDb(updatedPages, activeThemeId, siteName);
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedPages = pages.map(p => {
      if (p.id !== activePageId) return p;
      return { ...p, sections: p.sections.filter(s => s.id !== sectionId) };
    });
    setPages(updatedPages);
    if (selectedSectionId === sectionId) setSelectedSectionId(null);
    saveWebsiteToDb(updatedPages, activeThemeId, siteName);
  };

  const handleToggleHideSection = (sectionId: string) => {
    const updatedPages = pages.map(p => {
      if (p.id !== activePageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => s.id === sectionId ? { ...s, hidden: !s.hidden } : s)
      };
    });
    setPages(updatedPages);
    saveWebsiteToDb(updatedPages, activeThemeId, siteName);
  };

  const handleUpdateSectionField = (sectionId: string, field: keyof PageSection, value: any) => {
    const updatedPages = pages.map(p => {
      if (p.id !== activePageId) return p;
      return {
        ...p,
        sections: p.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s)
      };
    });
    setPages(updatedPages);
    saveWebsiteToDb(updatedPages, activeThemeId, siteName);
  };

  // Add Custom Page
  const handleAddPage = () => {
    const name = prompt('Enter new page title (e.g. Services, Pricing, FAQ):');
    if (!name || !name.trim()) return;
    const slug = '/' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newPage: WebsitePage = {
      id: `page_${Date.now()}`,
      name: name.trim(),
      slug,
      sections: [
        {
          id: `sec_hero_${Date.now()}`,
          type: 'hero',
          title: name.trim(),
          subtitle: `Explore detailed insights and offerings on ${name.trim()}.`,
          badge: 'Official Page'
        }
      ]
    };

    const updated = [...pages, newPage];
    setPages(updated);
    setActivePageId(newPage.id);
    saveWebsiteToDb(updated, activeThemeId, siteName);
  };

  // Live Contact Submission inside preview frame
  const handlePreviewSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail.trim()) return;

    const newLead = {
      id: `lead_${Date.now()}`,
      name: leadName.trim() || 'Anonymous Visitor',
      email: leadEmail.trim(),
      phone: leadPhone.trim() || 'N/A',
      message: leadMessage.trim() || 'Inquiry submitted from live website preview.',
      createdAt: new Date().toISOString()
    };

    setReceivedLeads([newLead, ...receivedLeads]);
    setLeadSubmittedStatus('Thank you! Your message has been received.');
    setLeadName('');
    setLeadEmail('');
    setLeadPhone('');
    setLeadMessage('');

    try {
      await clientDb.addDocToTenant('leads', newLead, tenantId);
    } catch (err) {
      console.warn("Error saving lead:", err);
    }
  };

  // AI Copilot Content Generator
  const handleAiGenerativeSection = async (sectionId: string) => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate punchy high-converting website copy for business profile: ${profile.name}, industry: ${profile.industry || 'Technology'}. Return JSON with "headline", "subtitle", "badge"`
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.text || '';
        let headline = 'Accelerate Business Results With Autonomous AI';
        let subtitle = 'Eliminate manual bottlenecks and scale operations effortlessly.';
        let badge = 'AI Optimized Copy';

        try {
          const parsed = JSON.parse(aiText);
          if (parsed.headline) headline = parsed.headline;
          if (parsed.subtitle) subtitle = parsed.subtitle;
          if (parsed.badge) badge = parsed.badge;
        } catch (e) {
          if (aiText) headline = aiText.substring(0, 60);
        }

        handleUpdateSectionField(sectionId, 'title', headline);
        handleUpdateSectionField(sectionId, 'subtitle', subtitle);
        handleUpdateSectionField(sectionId, 'badge', badge);

        logAiTaskUsage(tenantId, 'Website Copy Synthesizer', 'gemini-2.5-flash', 1800, 950);
      }
    } catch (err) {
      console.warn("AI generation failed fallback applied:", err);
      handleUpdateSectionField(sectionId, 'title', 'Engineered For Exponential Scale');
      handleUpdateSectionField(sectionId, 'subtitle', 'Automate customer growth and maximize campaign ROI with intelligence.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Publish Site Live
  const handlePublishLive = async () => {
    setIsPublishing(true);
    const slug = siteName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const url = `https://${slug || 'business'}.marketforge.site`;
    setPublishedUrl(url);

    try {
      const currentBranding = getTenantBranding(tenantId);
      const updatedBranding = {
        ...currentBranding,
        tenantId,
        companyName: siteName,
        homepageSource: 'website_builder' as const,
        customLandingData: {
          siteName,
          pages,
          activeThemeId
        }
      };
      await saveTenantBranding(updatedBranding);
      await saveWebsiteToDb(pages, activeThemeId, siteName);
    } catch (err) {
      console.warn("Error publishing site:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  // HTML Export Generator
  const generateExportHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName} - Official Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="${activeTheme.bgCanvas} ${activeTheme.textColor} ${activeTheme.fontFamily}">
  <header class="${activeTheme.headerBg} p-4 px-8 border-b ${activeTheme.borderColor} flex justify-between items-center sticky top-0 z-50">
    <h1 class="text-xl font-bold ${activeTheme.headingColor}">${siteName}</h1>
    <nav class="flex gap-6 text-sm font-semibold">
      ${pages.map(p => `<a href="${p.slug}" class="hover:underline">${p.name}</a>`).join('')}
    </nav>
  </header>
  <main class="max-w-6xl mx-auto p-8 space-y-16">
    ${activePage.sections.filter(s => !s.hidden).map(s => `
      <section class="${activeTheme.cardBg} p-8 rounded-2xl space-y-4">
        ${s.badge ? `<span class="px-3 py-1 rounded-full text-xs font-bold ${activeTheme.badgeBg}">${s.badge}</span>` : ''}
        <h2 class="text-3xl font-extrabold ${activeTheme.headingColor}">${s.title}</h2>
        ${s.subtitle ? `<p class="text-base leading-relaxed">${s.subtitle}</p>` : ''}
      </section>
    `).join('')}
  </main>
  <footer class="p-8 text-center text-xs opacity-60 border-t ${activeTheme.borderColor}">
    © 2026 ${siteName}. All Rights Reserved. Built with MarketForge OS.
  </footer>
</body>
</html>`;
  };

  const selectedSection = activePage.sections.find(s => s.id === selectedSectionId);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20 text-slate-100">
      {/* Top Header Controls Bar */}
      <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-3.5 flex items-center justify-center text-white shadow-xl">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
                World-Class Website Builder OS
              </span>
              <AiUsageBadge tenantId={tenantId} />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Interactive Enterprise Storefront Studio</h2>
            <p className="text-xs text-slate-300">
              Drag & reorder sections, customize themes, edit pages dynamically, and capture leads directly into Firestore.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-2 transition cursor-pointer"
          >
            <Code className="w-4 h-4 text-cyan-400" /> Export HTML
          </button>

          <button
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400/30 flex items-center gap-2 transition cursor-pointer"
          >
            {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>{isPublishing ? 'Publishing...' : 'Publish Live To Cloud'}</span>
          </button>
        </div>
      </div>

      {/* Published Notice */}
      {publishedUrl && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Website Published & Live On Cloud Network!</p>
              <p className="text-emerald-200 font-mono mt-0.5">{publishedUrl}</p>
            </div>
          </div>
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Visit Site
          </a>
        </div>
      )}

      {/* Studio Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT TOOLBAR (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Toolbar Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[#0D0E17] border border-white/10 p-1.5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('pages')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'pages' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" /> Pages ({pages.length})
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'sections' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Sections
            </button>

            <button
              onClick={() => setActiveTab('themes')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'themes' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Themes
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'leads' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" /> Leads ({receivedLeads.length})
            </button>
          </div>

          {/* TAB 1: PAGES MANAGER */}
          {activeTab === 'pages' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" /> Site Page Manager
                  </h3>
                  <p className="text-[11px] text-slate-400">Switch pages or add custom routes</p>
                </div>
                <button
                  onClick={handleAddPage}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Page
                </button>
              </div>

              <div className="space-y-2">
                {pages.map((p) => {
                  const isActive = p.id === activePageId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActivePageId(p.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-indigo-900/40 border-indigo-500 text-white shadow-md'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <div>
                          <p className="font-bold text-xs">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{p.slug}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-slate-300">
                        {p.sections.length} Sections
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Site Title Renamer */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Brand Storefront Title</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => {
                    setSiteName(e.target.value);
                    saveWebsiteToDb(pages, activeThemeId, e.target.value);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS BUILDER & REORDERER */}
          {activeTab === 'sections' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" /> Active Sections ({activePage.sections.length})
                </h3>
                <span className="text-[10px] font-mono text-indigo-300">{activePage.name}</span>
              </div>

              {/* Add Section Buttons Grid */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Add Section To Page</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleAddSection('hero')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> + Hero Banner
                  </button>
                  <button onClick={() => handleAddSection('features')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> + Features Grid
                  </button>
                  <button onClick={() => handleAddSection('products')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> + Products
                  </button>
                  <button onClick={() => handleAddSection('stats')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> + Stats Counter
                  </button>
                  <button onClick={() => handleAddSection('testimonials')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400" /> + Testimonials
                  </button>
                  <button onClick={() => handleAddSection('faq')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-rose-400" /> + FAQ Block
                  </button>
                  <button onClick={() => handleAddSection('cta')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> + CTA Banner
                  </button>
                  <button onClick={() => handleAddSection('contact')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" /> + Contact Form
                  </button>
                  <button onClick={() => handleAddSection('hotelRooms')} className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5 text-indigo-300">
                    <Bed className="w-3.5 h-3.5 text-indigo-400" /> + Hotel Rooms
                  </button>
                  <button onClick={() => handleAddSection('restaurantMenu')} className="p-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5 text-orange-300">
                    <Utensils className="w-3.5 h-3.5 text-orange-400" /> + Dining Menu
                  </button>
                  <button onClick={() => handleAddSection('toursPackages')} className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-xs font-bold text-left transition cursor-pointer flex items-center gap-1.5 text-cyan-300">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" /> + Tour Packages
                  </button>
                </div>
              </div>

              {/* Sections Reorder List */}
              <div className="space-y-2 border-t border-white/10 pt-4 max-h-[350px] overflow-y-auto pr-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Current Page Order</label>
                {activePage.sections.map((sec, index) => {
                  const isSelected = sec.id === selectedSectionId;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-indigo-900/50 border-indigo-500 text-white shadow-md'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{index + 1}</span>
                        <p className="font-bold text-xs truncate">{sec.title || sec.type}</p>
                        {sec.hidden && <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">(Hidden)</span>}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveSection(sec.id, 'up'); }}
                          className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveSection(sec.id, 'down'); }}
                          className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleHideSection(sec.id); }}
                          className="p-1 text-slate-400 hover:text-amber-300 hover:bg-white/10 rounded"
                          title="Toggle Hide"
                        >
                          {sec.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section Live Editor Editor Panel */}
              {selectedSection && (
                <div className="bg-white/5 border border-indigo-500/30 rounded-2xl p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Section ({selectedSection.type.toUpperCase()})
                    </span>
                    <button
                      onClick={() => handleAiGenerativeSection(selectedSection.id)}
                      disabled={isGeneratingAI}
                      className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      {isGeneratingAI ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 text-amber-300" />}
                      <span>AI Re-Write</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Headline Title</label>
                      <input
                        type="text"
                        value={selectedSection.title || ''}
                        onChange={(e) => handleUpdateSectionField(selectedSection.id, 'title', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Subtitle / Body Description</label>
                      <textarea
                        rows={2}
                        value={selectedSection.subtitle || ''}
                        onChange={(e) => handleUpdateSectionField(selectedSection.id, 'subtitle', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Badge Tag</label>
                      <input
                        type="text"
                        value={selectedSection.badge || ''}
                        onChange={(e) => handleUpdateSectionField(selectedSection.id, 'badge', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    {selectedSection.imageUrl !== undefined && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Image URL</label>
                        <input
                          type="text"
                          value={selectedSection.imageUrl || ''}
                          onChange={(e) => handleUpdateSectionField(selectedSection.id, 'imageUrl', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] font-mono text-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: THEME SELECTOR */}
          {activeTab === 'themes' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Palette className="w-4 h-4 text-purple-400" /> World-Class Theme Presets
              </h3>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {Object.values(WORLD_CLASS_THEMES).map((theme) => {
                  const isSelected = activeThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setActiveThemeId(theme.id);
                        saveWebsiteToDb(pages, theme.id, siteName);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-500 ring-2 ring-indigo-500/40 text-white shadow-xl'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${theme.accentBtn}`} />
                          {theme.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{theme.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: RECEIVED LEADS */}
          {activeTab === 'leads' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-emerald-400" /> Storefront Lead Inbox ({receivedLeads.length})
                </h3>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Live Firestore Sync
                </span>
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {receivedLeads.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No leads received yet. Test the contact form in the live preview frame!</p>
                ) : (
                  receivedLeads.map((lead) => (
                    <div key={lead.id} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{lead.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{new Date(lead.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[11px] text-indigo-300 font-mono flex items-center gap-3">
                        <span>✉ {lead.email}</span>
                        <span>☎ {lead.phone}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] bg-black/40 p-2 rounded-lg border border-white/5 mt-1">
                        "{lead.message}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT LIVE VIEWPORT FRAME (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Frame Device Bar */}
          <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-3 text-xs font-mono text-slate-400">
                Live Preview Sandbox: <strong className="text-indigo-300">{siteName.toLowerCase().replace(/[^a-z0-9]/g, '')}.marketforge.site{activePage.slug}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewportMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewportMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewportMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RENDERED LIVE WEBSITE CANVAS */}
          <div className="bg-slate-950 border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden min-h-[650px] flex justify-center">
            <div
              className={`transition-all duration-300 w-full overflow-y-auto max-h-[750px] rounded-xl border border-white/5 ${
                viewportMode === 'mobile'
                  ? 'max-w-sm my-4 shadow-2xl ring-8 ring-slate-900 rounded-3xl'
                  : viewportMode === 'tablet'
                  ? 'max-w-2xl my-2 shadow-xl'
                  : 'max-w-full'
              }`}
            >
              {/* LIVE SITE RENDER WITH ACTIVE THEME */}
              <div className={`min-h-full ${activeTheme.bgCanvas} ${activeTheme.textColor} ${activeTheme.fontFamily} selection:bg-indigo-500/30`}>
                {/* Site Header */}
                <header className={`${activeTheme.headerBg} border-b ${activeTheme.borderColor} sticky top-0 z-40 px-6 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${activeTheme.accentBtn} flex items-center justify-center font-black text-sm`}>
                      {siteName.charAt(0)}
                    </div>
                    <span className={`font-extrabold text-base ${activeTheme.headingColor}`}>{siteName}</span>
                  </div>

                  <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
                    {pages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setActivePageId(p.id)}
                        className={`hover:opacity-100 transition cursor-pointer ${
                          p.id === activePageId ? `font-bold ${activeTheme.accentText} border-b-2 border-current pb-0.5` : 'opacity-70'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </nav>

                  <a
                    href="#contact_section"
                    className={`px-4 py-2 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow-md transition`}
                  >
                    Contact Us
                  </a>
                </header>

                {/* Render Sections */}
                <div className="space-y-12 py-8 px-6 md:px-12">
                  {activePage.sections.filter(s => !s.hidden).map((sec) => {
                    const isSelected = sec.id === selectedSectionId;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => setSelectedSectionId(sec.id)}
                        className={`relative rounded-2xl transition cursor-pointer group ${
                          isSelected ? 'ring-2 ring-indigo-500 p-2 bg-indigo-500/5' : ''
                        }`}
                      >
                        {/* Section Label Overlay on hover */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded border border-white/20 z-10">
                          Click to Edit ({sec.type.toUpperCase()})
                        </div>

                        {/* HERO SECTION */}
                        {sec.type === 'hero' && (
                          <div className="grid md:grid-cols-2 gap-8 items-center py-8">
                            <div className="space-y-4">
                              {sec.badge && (
                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${activeTheme.badgeBg}`}>
                                  {sec.badge}
                                </span>
                              )}
                              <h1 className={`text-3xl sm:text-4xl font-black leading-tight ${activeTheme.headingColor}`}>
                                {sec.title}
                              </h1>
                              <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                                {sec.subtitle}
                              </p>
                              {sec.ctaText && (
                                <div className="pt-2">
                                  <a href="#contact_section" className={`px-6 py-3 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow-lg inline-flex items-center gap-2`}>
                                    {sec.ctaText} <ArrowRight className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                            </div>
                            {sec.imageUrl && (
                              <img src={sec.imageUrl} alt={sec.title} className="rounded-2xl shadow-xl w-full h-72 object-cover border border-white/10" />
                            )}
                          </div>
                        )}

                        {/* FEATURES SECTION */}
                        {sec.type === 'features' && (
                          <div className="space-y-6 py-4">
                            <div className="text-center space-y-1">
                              <h3 className={`text-2xl font-extrabold ${activeTheme.headingColor}`}>{sec.title}</h3>
                              <p className="text-xs opacity-80">{sec.subtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {(sec.contentData || []).map((f: any, idx: number) => (
                                <div key={idx} className={`${activeTheme.cardBg} p-5 rounded-2xl space-y-2`}>
                                  <div className={`w-8 h-8 rounded-lg ${activeTheme.badgeBg} flex items-center justify-center font-bold text-xs`}>
                                    0{idx + 1}
                                  </div>
                                  <h4 className={`font-bold text-sm ${activeTheme.headingColor}`}>{f.title}</h4>
                                  <p className="text-xs opacity-80 leading-relaxed">{f.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PRODUCTS / CATALOG SECTION */}
                        {sec.type === 'products' && (
                          <div className="space-y-6 py-4">
                            <div className="text-center space-y-1">
                              <h3 className={`text-2xl font-extrabold ${activeTheme.headingColor}`}>{sec.title}</h3>
                              <p className="text-xs opacity-80">{sec.subtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                              {(sec.contentData || []).map((p: any) => (
                                <div key={p.id} className={`${activeTheme.cardBg} rounded-2xl overflow-hidden flex flex-col justify-between p-4 space-y-3`}>
                                  <img src={p.image} alt={p.title} className="w-full h-36 object-cover rounded-xl" />
                                  <div>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="font-bold opacity-70">{p.category}</span>
                                      <span className={`font-bold ${activeTheme.accentText}`}>{p.price}</span>
                                    </div>
                                    <h4 className={`font-bold text-sm mt-1 ${activeTheme.headingColor}`}>{p.title}</h4>
                                    <p className="text-xs opacity-80 line-clamp-2 mt-1">{p.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* STATS SECTION */}
                        {sec.type === 'stats' && (
                          <div className={`${activeTheme.cardBg} p-6 rounded-2xl text-center space-y-4`}>
                            <h3 className={`text-xl font-bold ${activeTheme.headingColor}`}>{sec.title}</h3>
                            <div className="grid grid-cols-3 gap-4">
                              {(sec.contentData || []).map((st: any, idx: number) => (
                                <div key={idx}>
                                  <span className={`text-2xl font-extrabold font-mono ${activeTheme.accentText}`}>{st.metric}</span>
                                  <span className="text-[11px] block opacity-80 font-semibold">{st.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TESTIMONIALS SECTION */}
                        {sec.type === 'testimonials' && (
                          <div className="space-y-4 py-4">
                            <h3 className={`text-xl font-bold text-center ${activeTheme.headingColor}`}>{sec.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(sec.contentData || []).map((t: any, idx: number) => (
                                <div key={idx} className={`${activeTheme.cardBg} p-5 rounded-2xl space-y-2`}>
                                  <p className="text-xs italic opacity-90">"{t.quote}"</p>
                                  <div className="text-[11px] font-bold opacity-70">
                                    — {t.author}, <span className="text-indigo-400">{t.role}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* FAQ SECTION */}
                        {sec.type === 'faq' && (
                          <div className="space-y-4 py-4">
                            <h3 className={`text-xl font-bold text-center ${activeTheme.headingColor}`}>{sec.title}</h3>
                            <div className="space-y-2">
                              {(sec.contentData || []).map((faq: any, idx: number) => (
                                <div key={idx} className={`${activeTheme.cardBg} p-4 rounded-xl space-y-1`}>
                                  <p className={`font-bold text-xs ${activeTheme.headingColor}`}>Q: {faq.q}</p>
                                  <p className="text-xs opacity-80">A: {faq.a}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTA BANNER */}
                        {sec.type === 'cta' && (
                          <div className={`${activeTheme.cardBg} p-8 rounded-2xl text-center space-y-4 border ${activeTheme.borderColor}`}>
                            <h3 className={`text-2xl font-black ${activeTheme.headingColor}`}>{sec.title}</h3>
                            <p className="text-xs opacity-90 max-w-lg mx-auto">{sec.subtitle}</p>
                            <a href="#contact_section" className={`px-6 py-3 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow-lg inline-block`}>
                              {sec.ctaText || 'Get Started Now'}
                            </a>
                          </div>
                        )}

                        {/* CONTACT FORM SECTION */}
                        {sec.type === 'contact' && (
                          <div id="contact_section" className={`${activeTheme.cardBg} p-6 rounded-2xl space-y-4 border ${activeTheme.borderColor}`}>
                            <div className="text-center space-y-1">
                              <h3 className={`text-xl font-bold ${activeTheme.headingColor}`}>{sec.title}</h3>
                              <p className="text-xs opacity-80">{sec.subtitle}</p>
                            </div>

                            <form onSubmit={handlePreviewSubmitLead} className="space-y-3 max-w-md mx-auto">
                              <input
                                type="text"
                                required
                                placeholder="Your Name"
                                value={leadName}
                                onChange={(e) => setLeadName(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-xs focus:outline-none"
                              />
                              <input
                                type="email"
                                required
                                placeholder="Your Email Address"
                                value={leadEmail}
                                onChange={(e) => setLeadEmail(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-xs focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Phone Number"
                                value={leadPhone}
                                onChange={(e) => setLeadPhone(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-xs focus:outline-none"
                              />
                              <textarea
                                rows={3}
                                placeholder="Your Message..."
                                value={leadMessage}
                                onChange={(e) => setLeadMessage(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-xs focus:outline-none resize-none"
                              />
                              <button
                                type="submit"
                                className={`w-full py-2.5 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow-md transition cursor-pointer`}
                              >
                                {sec.ctaText || 'Submit Inquiry'}
                              </button>
                            </form>

                            {leadSubmittedStatus && (
                              <p className="text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                                {leadSubmittedStatus}
                              </p>
                            )}
                          </div>
                        )}

                        {/* HOTEL ROOMS SECTION */}
                        {sec.type === 'hotelRooms' && (
                          <div className="space-y-6 py-4">
                            <div className="text-center space-y-1">
                              <h3 className={`text-2xl font-extrabold ${activeTheme.headingColor}`}>{sec.title}</h3>
                              <p className="text-xs opacity-80">{sec.subtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {(sec.contentData || []).map((r: any) => (
                                <div key={r.id} className={`${activeTheme.cardBg} rounded-2xl overflow-hidden flex flex-col justify-between p-4 space-y-3`}>
                                  <img src={r.image} alt={r.type} className="w-full h-40 object-cover rounded-xl" />
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="font-bold opacity-70">Room {r.roomNumber}</span>
                                      <span className={`font-bold ${activeTheme.accentText}`}>${r.pricePerNight}/night</span>
                                    </div>
                                    <h4 className={`font-bold text-sm ${activeTheme.headingColor}`}>{r.type}</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {(r.amenities || []).map((am: string, i: number) => (
                                        <span key={i} className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">
                                          {am}
                                        </span>
                                      ))}
                                    </div>
                                    <button
                                      onClick={() => {
                                        setLeadMessage(`I would like to reserve Room ${r.roomNumber} (${r.type}) for $${r.pricePerNight}/night.`);
                                        const contactEl = document.getElementById('contact_section');
                                        if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
                                      }}
                                      className={`w-full py-2 mt-2 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow transition cursor-pointer`}
                                    >
                                      Book This Suite
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* RESTAURANT MENU SECTION */}
                        {sec.type === 'restaurantMenu' && (
                          <div className="space-y-6 py-4">
                            <div className="text-center space-y-1">
                              <h3 className={`text-2xl font-extrabold ${activeTheme.headingColor}`}>{sec.title}</h3>
                              <p className="text-xs opacity-80">{sec.subtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {(sec.contentData || []).map((m: any) => (
                                <div key={m.id} className={`${activeTheme.cardBg} rounded-2xl overflow-hidden flex flex-col justify-between p-4 space-y-3`}>
                                  <img src={m.image} alt={m.name} className="w-full h-36 object-cover rounded-xl" />
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.isVeg ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                        {m.isVeg ? 'Veg' : 'Non-Veg'} • {m.prepTimeMins}m
                                      </span>
                                      <span className={`font-bold ${activeTheme.accentText}`}>${m.price}</span>
                                    </div>
                                    <h4 className={`font-bold text-sm ${activeTheme.headingColor}`}>{m.name}</h4>
                                    <p className="text-xs opacity-80 line-clamp-2">{m.description}</p>
                                    <button
                                      onClick={() => {
                                        setLeadMessage(`I want to place an order/table reservation for: ${m.name} ($${m.price}).`);
                                        const contactEl = document.getElementById('contact_section');
                                        if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
                                      }}
                                      className={`w-full py-2 mt-2 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow transition cursor-pointer`}
                                    >
                                      Order Online / Reserve
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TOURS PACKAGES SECTION */}
                        {sec.type === 'toursPackages' && (
                          <div className="space-y-6 py-4">
                            <div className="text-center space-y-1">
                              <h3 className={`text-2xl font-extrabold ${activeTheme.headingColor}`}>{sec.title}</h3>
                              <p className="text-xs opacity-80">{sec.subtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {(sec.contentData || []).map((tp: any) => (
                                <div key={tp.id} className={`${activeTheme.cardBg} rounded-2xl overflow-hidden flex flex-col justify-between p-4 space-y-3`}>
                                  <img src={tp.image} alt={tp.name} className="w-full h-40 object-cover rounded-xl" />
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="font-bold opacity-70">📍 {tp.loc}</span>
                                      <span className={`font-bold ${activeTheme.accentText}`}>${tp.price} ({tp.days} Days)</span>
                                    </div>
                                    <h4 className={`font-bold text-sm ${activeTheme.headingColor}`}>{tp.name}</h4>
                                    <p className="text-xs opacity-80 line-clamp-2">{tp.description}</p>
                                    <button
                                      onClick={() => {
                                        setLeadMessage(`Inquiry for Tour Package: ${tp.name} in ${tp.loc} ($${tp.price}, ${tp.days} Days).`);
                                        const contactEl = document.getElementById('contact_section');
                                        if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
                                      }}
                                      className={`w-full py-2 mt-2 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow transition cursor-pointer`}
                                    >
                                      Inquire & Book Package
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CUSTOM TEXT SECTION */}
                        {sec.type === 'customText' && (
                          <div className={`${activeTheme.cardBg} p-6 rounded-2xl space-y-2`}>
                            <h3 className={`text-xl font-bold ${activeTheme.headingColor}`}>{sec.title}</h3>
                            <p className="text-xs opacity-80 leading-relaxed">{sec.contentData}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <footer className={`p-8 text-center text-xs opacity-60 border-t ${activeTheme.borderColor} mt-12`}>
                  <p>© 2026 {siteName}. All Rights Reserved. Powered by MarketForge OS.</p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HTML EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-6 max-w-2xl w-full space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" /> Export Standalone Production HTML/CSS
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copy or download this fully self-contained HTML file. It uses Tailwind CDN and includes all page sections for <strong>{siteName}</strong>.
            </p>

            <textarea
              rows={12}
              readOnly
              value={generateExportHtml()}
              className="w-full bg-black/80 border border-white/10 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none resize-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateExportHtml());
                  alert('HTML code copied to clipboard!');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-4 h-4" /> Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
