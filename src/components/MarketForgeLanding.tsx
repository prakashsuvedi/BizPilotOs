import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { MarketForgeLogo, MarketForgeEmblem } from './MarketForgeLogo';
import { getTenantBranding, saveTenantBranding, TenantBranding } from '../lib/tenantBranding';
import CompanyPagesModal, { CompanyPageType } from './CompanyPagesModal';
import {
  Sparkles,
  Building2,
  Globe,
  Mail,
  Share2,
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  Zap,
  ChevronRight,
  Clock,
  Check,
  Copy,
  X,
  Phone,
  Sun,
  Moon,
  Store,
  ShoppingBag,
  Hotel,
  Utensils,
  Compass,
  Star,
  MapPin,
  Calendar,
  Users,
  Coffee,
  CheckCircle,
  Briefcase,
  Send,
  Lock,
  MessageSquare,
  Award,
  Heart,
  KeyRound,
  RefreshCw
} from 'lucide-react';

export interface MarketForgeLandingProps {
  tenantId?: string;
  onSelectFeature?: (featureId: string) => void;
  onEnterOS?: () => void;
}

export function MarketForgeLanding({ tenantId = 'demo-tenant', onSelectFeature, onEnterOS }: MarketForgeLandingProps) {
  // Tenant White-Label & Dynamic Theme State
  const [branding, setBranding] = useState<TenantBranding>(() => getTenantBranding(tenantId));
  const [companyPagesModalOpen, setCompanyPagesModalOpen] = useState<boolean>(false);
  const [companyPageTab, setCompanyPageTab] = useState<CompanyPageType>('about');

  // Interactive Modals State
  const [bookingModalItem, setBookingModalItem] = useState<any | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-08-20');
  const [guestCount, setGuestCount] = useState('2');

  // Copyable Links Modal
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Staff Auth & Password Reset Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Category Filter for Menu/Catalog
  const [activeCatalogCategory, setActiveCatalogCategory] = useState<string>('All');

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetMessage({ type: 'error', text: 'Please enter a valid registered email address.' });
      return;
    }

    setIsResetLoading(true);
    try {
      const res = await fetch('/api/tenant/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, step: 'request' })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch password reset code.');
      }

      setResetCode(data.resetCode || 'MKT-RESET-123456');
      setResetCodeSent(true);
      setResetMessage({
        type: 'success',
        text: `✓ Verification code sent to ${resetEmail}. Set your new password below.`
      });
    } catch (err: any) {
      setResetMessage({ type: 'error', text: err.message || 'Error requesting password reset.' });
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setIsResetLoading(true);
    try {
      const res = await fetch('/api/tenant/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          newPassword: resetNewPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setResetMessage({
        type: 'success',
        text: '✓ Password updated successfully! You can now log in.'
      });
      setTimeout(() => {
        setAuthModalTab('login');
      }, 1500);
    } catch (err: any) {
      setResetMessage({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setIsResetLoading(false);
    }
  };

  const openCompanyPage = (tab: CompanyPageType) => {
    setCompanyPageTab(tab);
    setCompanyPagesModalOpen(true);
  };

  useEffect(() => {
    const loaded = getTenantBranding(tenantId);
    setBranding(loaded);
  }, [tenantId]);

  useEffect(() => {
    const handleBrandingUpdated = (e: any) => {
      if (!e.detail?.tenantId || e.detail?.tenantId === tenantId) {
        const fresh = getTenantBranding(tenantId);
        setBranding(fresh);
      }
    };
    window.addEventListener('tenant_branding_updated', handleBrandingUpdated);
    return () => window.removeEventListener('tenant_branding_updated', handleBrandingUpdated);
  }, [tenantId]);

  const handleCopyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToast(label);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  // Determine Business Vertical from Tenant Profile / Name
  const detectBusinessType = (): 'hotel_resort' | 'restaurant' | 'tours_travel' | 'retail_commerce' | 'agency_enterprise' => {
    const combined = ((branding.companyName || '') + ' ' + tenantId).toLowerCase();
    if (combined.includes('hotel') || combined.includes('resort') || combined.includes('lodge') || combined.includes('inn') || combined.includes('hospitality') || combined.includes('stay') || combined.includes('villa')) {
      return 'hotel_resort';
    }
    if (combined.includes('restaurant') || combined.includes('cafe') || combined.includes('café') || combined.includes('dining') || combined.includes('bistro') || combined.includes('kitchen') || combined.includes('food') || combined.includes('bar') || combined.includes('grill') || combined.includes('pizza') || combined.includes('bakery') || combined.includes('eats')) {
      return 'restaurant';
    }
    if (combined.includes('tour') || combined.includes('travel') || combined.includes('trek') || combined.includes('trip') || combined.includes('adventure') || combined.includes('expedition') || combined.includes('holiday')) {
      return 'tours_travel';
    }
    if (combined.includes('store') || combined.includes('shop') || combined.includes('mart') || combined.includes('retail') || combined.includes('clay') || combined.includes('fashion') || combined.includes('boutique') || combined.includes('hardware') || combined.includes('gear')) {
      return 'retail_commerce';
    }
    return 'agency_enterprise';
  };

  const businessType = detectBusinessType();

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModalItem(null);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setGuestNotes('');
    }, 2200);
  };

  // Business Specific Catalog Datasets
  const hotelRoomsData = [
    {
      id: 'room-1',
      title: 'Presidential Panorama Suite',
      category: 'Luxury Suite',
      price: '$350',
      unit: '/ night',
      rating: '4.95',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      description: 'Expansive master suite featuring panoramic ocean view, private jacuzzi balcony, king bed, and complimentary executive lounge access.',
      features: ['King Bed', 'Jacuzzi Balcony', 'Free Breakfast', 'High-Speed Wi-Fi', '24/7 Butler Service']
    },
    {
      id: 'room-2',
      title: 'Executive Royal Balcony Room',
      category: 'Executive Room',
      price: '$220',
      unit: '/ night',
      rating: '4.88',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      description: 'Elegantly appointed executive room with plush bedding, private workspace, espresso machine, and garden skyline view.',
      features: ['King or Twin Beds', 'Private Balcony', 'Espresso Station', 'Work Desk', 'Smart HDTV']
    },
    {
      id: 'room-3',
      title: 'Garden Private Family Villa',
      category: 'Private Villa',
      price: '$450',
      unit: '/ night',
      rating: '4.98',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      description: 'Two-bedroom secluded sanctuary with private plunge pool, outdoor dining gazebo, kitchenette, and lush botanical garden enclosure.',
      features: ['2 King Bedrooms', 'Private Pool', 'Gazebo Dining', 'Kitchenette', 'Airport Transfer Included']
    },
    {
      id: 'room-4',
      title: 'Deluxe Courtyard King Suite',
      category: 'Deluxe Room',
      price: '$160',
      unit: '/ night',
      rating: '4.82',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      description: 'Cozy, modern retreat overlooking the serene central courtyard. Perfect for business travelers and weekend getaways.',
      features: ['Queen Bed', 'Courtyard View', 'Rain Shower', 'Complimentary Minibar', 'Air Conditioning']
    }
  ];

  const restaurantMenuData = [
    {
      id: 'menu-1',
      title: 'Wood-Fired Prime Ribeye Steak',
      category: 'Main Course',
      price: '$38',
      unit: '',
      rating: '4.98',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      description: 'Aged 30 days, seared over oak wood charcoal, served with roasted garlic butter, rosemary potatoes, and chimichurri.',
      features: ['Chef Special', '30-Day Dry Aged', 'Gluten Free Option']
    },
    {
      id: 'menu-2',
      title: 'Handcrafted Truffle Fettuccine',
      category: 'Main Course',
      price: '$26',
      unit: '',
      rating: '4.92',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      description: 'Fresh artisanal pasta tossed in black truffle cream, Parmigiano-Reggiano, wild forest mushrooms, and fresh herbs.',
      features: ['Fresh Handmade Pasta', 'Vegetarian', 'Black Truffle']
    },
    {
      id: 'menu-3',
      title: 'Artisanal Burrata & Heirloom Bruschetta',
      category: 'Starters',
      price: '$16',
      unit: '',
      rating: '4.89',
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb16431?auto=format&fit=crop&w=800&q=80',
      description: 'Creamy Italian burrata cheese, organic vine-ripened tomatoes, fresh basil pesto, balsamic reduction on toasted sourdough.',
      features: ['Farm Fresh', 'Vegetarian']
    },
    {
      id: 'menu-4',
      title: 'Crispy Pan-Seared Atlantic Salmon',
      category: 'Main Course',
      price: '$32',
      unit: '',
      rating: '4.94',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
      description: 'Sustainably sourced salmon fillet with lemon herb risotto, glazed asparagus spears, and citrus butter glaze.',
      features: ['Seafood Special', 'Rich in Omega-3']
    },
    {
      id: 'menu-5',
      title: 'Dark Chocolate Lava Cake & Gelato',
      category: 'Desserts',
      price: '$12',
      unit: '',
      rating: '4.96',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      description: 'Warm molten Valrhona chocolate cake paired with Madagascar vanilla bean gelato and fresh raspberry reduction.',
      features: ['Valrhona Chocolate', 'House Gelato']
    },
    {
      id: 'menu-6',
      title: 'Botanical Craft Cocktail Series',
      category: 'Beverages',
      price: '$14',
      unit: '',
      rating: '4.90',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
      description: 'Artisanal signature cocktail crafted with small-batch spirits, house-infused botanicals, fresh citrus, and edible flowers.',
      features: ['Craft Spirits', 'House Infusions']
    }
  ];

  const toursPackagesData = [
    {
      id: 'tour-1',
      title: 'Himalayan Sunrise & Heritage Cultural Expedition',
      category: 'Adventure & Culture',
      price: '$850',
      unit: '/ person',
      rating: '4.98',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      description: '5 Days / 4 Nights immersive journey visiting ancient heritage sites, scenic mountain viewpoints, luxury resort stays, and private guide services.',
      features: ['5 Days / 4 Nights', 'All Resort Stays Included', 'Private Tour Guide', 'Airport Pickup & Drop']
    },
    {
      id: 'tour-2',
      title: 'Tropical Beach & Island Escape',
      category: 'Leisure & Beach',
      price: '$1,200',
      unit: '/ person',
      rating: '4.95',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      description: '7 Days / 6 Nights luxury island hop with speedboat transfers, coral reef snorkeling trips, sunset yacht dinners, and beachfront villa lodging.',
      features: ['7 Days / 6 Nights', 'Beachfront Villa', 'Sunset Yacht Cruise', 'Snorkeling Gear']
    },
    {
      id: 'tour-3',
      title: 'Alpine Valley Trekking & Wildlife Safari',
      category: 'Eco Trekking',
      price: '$620',
      unit: '/ person',
      rating: '4.91',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      description: '4 Days / 3 Nights guided mountain trail trek through national parks, wildlife viewing excursions, bonfire dinners, and authentic lodge stays.',
      features: ['4 Days / 3 Nights', 'Certified Trekking Guide', 'All Meals Included', 'Permits Covered']
    }
  ];

  const retailCatalogData = [
    {
      id: 'item-1',
      title: 'Handcrafted Ceramic Artisan Vase',
      category: 'Home Decor',
      price: '$85',
      unit: '',
      rating: '4.90',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      description: 'Wheel-thrown stoneware vase with natural matte glaze finish. Designed for modern living spaces.',
      features: ['Handmade', 'Eco-Friendly Clay', 'In Stock']
    },
    {
      id: 'item-2',
      title: 'Minimalist Matte Tableware Collection',
      category: 'Kitchenware',
      price: '$140',
      unit: ' (12 Pcs)',
      rating: '4.96',
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
      description: 'Complete 12-piece ceramic dining set including dinner plates, salad bowls, and artisan mugs.',
      features: ['Dishwasher Safe', 'Microwave Safe', 'Scratch Resistant']
    },
    {
      id: 'item-3',
      title: 'Botanical Scented Soy Candle Set',
      category: 'Lifestyle',
      price: '$42',
      unit: '',
      rating: '4.88',
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      description: '100% natural soy wax infused with essential oils of cedarwood, lavender, and amber.',
      features: ['50 Hr Burn Time', 'Natural Soy Wax', 'Recyclable Glass']
    }
  ];

  const agencyServicesData = [
    {
      id: 'service-1',
      title: 'Enterprise Digital Growth & Campaign Engine',
      category: 'Growth Services',
      price: 'Custom Quote',
      unit: '',
      rating: '5.0',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      description: 'Full-stack brand strategy, multi-channel ad management, SEO architecture, and automated conversion pipelines.',
      features: ['Omnichannel Ad Management', 'SEO & Content Autopilot', 'Dedicated Growth Team']
    },
    {
      id: 'service-2',
      title: 'Custom SaaS & Cloud Operations Architecture',
      category: 'Engineering',
      price: 'Custom Quote',
      unit: '',
      rating: '4.98',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      description: 'Custom web platforms, mobile application development, multi-tenant databases, and automated API workflows.',
      features: ['High-Performance Code', 'Cloud Infrastructure', '24/7 SLA Support']
    },
    {
      id: 'service-3',
      title: 'Brand Identity & Visual Asset Production',
      category: 'Creative Design',
      price: 'Custom Quote',
      unit: '',
      rating: '4.94',
      image: 'https://images.unsplash.com/photo-1542744094-3a3172720177?auto=format&fit=crop&w=800&q=80',
      description: 'Comprehensive brand style guides, logo design, marketing collaterals, commercial video ads, and UI/UX systems.',
      features: ['Logo & Visual Guidelines', 'Social Asset Bundles', 'Vector Design Files']
    }
  ];

  // Select Active Dataset based on Business Vertical
  const getActiveDataset = () => {
    switch (businessType) {
      case 'hotel_resort':
        return { items: hotelRoomsData, title: 'Luxury Rooms, Suites & Villas', label: 'Inquire & Book Room' };
      case 'restaurant':
        return { items: restaurantMenuData, title: 'Signature Culinary Offerings', label: 'Reserve Table / Order' };
      case 'tours_travel':
        return { items: toursPackagesData, title: 'Featured Tour & Travel Packages', label: 'Book Travel Experience' };
      case 'retail_commerce':
        return { items: retailCatalogData, title: 'Curated Product Collection', label: 'Order / Inquire Now' };
      default:
        return { items: agencyServicesData, title: 'Our Core Professional Services', label: 'Request Service Quote' };
    }
  };

  const activeDataset = getActiveDataset();

  // Categories Filter
  const categoriesList = ['All', ...Array.from(new Set(activeDataset.items.map(i => i.category)))];

  const filteredItems = activeCatalogCategory === 'All' 
    ? activeDataset.items 
    : activeDataset.items.filter(i => i.category === activeCatalogCategory);

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white pb-20 overflow-x-hidden">
      
      {/* Dynamic Page Metadata */}
      <Helmet>
        <title>{branding.companyName || 'Official Website'}</title>
        <meta name="description" content={branding.tagline || 'Welcome to our official website.'} />
      </Helmet>

      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      {/* ========================================================= */}
      {/* 1. TOP HEADER & NAVIGATION BAR                           */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070A13]/90 backdrop-blur-2xl shadow-xl transition-all">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-8 flex items-center justify-between gap-4">
          
          {/* Tenant Logo & Business Branding */}
          <div className="flex items-center gap-3">
            {branding.logoUrl && !branding.logoUrl.includes('photo-1618005182384') ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-10 w-auto max-h-12 object-contain rounded-xl border border-white/20 shadow-md bg-slate-900/80 p-1"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 border border-cyan-300/40 shadow-lg flex items-center justify-center text-white font-black text-base tracking-wider uppercase">
                {(branding.companyName || tenantId || 'M').charAt(0)}
              </div>
            )}
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  {branding.companyName}
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Website</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md hidden md:block">
                {branding.tagline || 'Welcome to our official business portal.'}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1 font-mono text-xs">
            <a href="#offerings" className="px-3.5 py-2 text-slate-300 hover:text-cyan-300 hover:bg-white/5 rounded-xl transition">
              {businessType === 'hotel_resort' ? 'Rooms & Suites' : businessType === 'restaurant' ? 'Menu & Dining' : businessType === 'tours_travel' ? 'Tour Packages' : 'Offerings & Catalog'}
            </a>
            <a href="#about-us" className="px-3.5 py-2 text-slate-300 hover:text-cyan-300 hover:bg-white/5 rounded-xl transition">
              About Us
            </a>
            <a href="#contact" className="px-3.5 py-2 text-slate-300 hover:text-cyan-300 hover:bg-white/5 rounded-xl transition">
              Contact & Location
            </a>
          </nav>

          {/* Actions: Direct Workspace / Staff Sign In */}
          <div className="flex items-center gap-2">
            
            {/* Reset Password Button */}
            <button
              onClick={() => {
                setAuthModalTab('reset');
                setIsAuthModalOpen(true);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Reset Password</span>
            </button>

            {/* Share / Copy URL Pill */}
            <button
              onClick={() => setIsCopyModalOpen(!isCopyModalOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
              title="Share Website URL"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Staff / Owner Login Button */}
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/25 border border-cyan-300/30 flex items-center gap-2 transition transform hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Sign In</span>
            </button>
          </div>

        </div>
      </header>

      {/* Share Links Dropdown Popover */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0c0f1d] border border-cyan-500/35 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" /> Shareable Website Links
              </span>
              <button onClick={() => setIsCopyModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {copiedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{copiedToast} copied to clipboard!</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="font-bold text-white mb-1">Direct Tenant Website Link</div>
                <div className="font-mono text-slate-400 text-[11px] truncate mb-2">
                  {window.location.origin}/?tenant={tenantId}
                </div>
                <button
                  onClick={() => handleCopyLink(`${window.location.origin}/?tenant=${tenantId}`, 'Tenant Website Link')}
                  className="w-full py-2 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. HERO BANNER SECTION                                   */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-16 relative z-10">
        
        <section className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 via-white/[0.02] to-transparent p-6 sm:p-12 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 text-xs font-mono font-bold">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Welcome to {branding.companyName}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {branding.customLandingData?.heroTitle || (
                  businessType === 'hotel_resort' ? 'World-Class Hospitality & Luxury Stay' :
                  businessType === 'restaurant' ? 'Artisanal Dining & Gourmet Cuisine' :
                  businessType === 'tours_travel' ? 'Unforgettable Travel & Trekking Escapes' :
                  businessType === 'retail_commerce' ? 'Curated Lifestyle Products & Craft' :
                  'Excellence in Enterprise Solutions'
                )}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
                {branding.customLandingData?.heroSubtitle || branding.tagline || (
                  businessType === 'hotel_resort' ? 'Immerse yourself in tranquil comfort, premium amenities, and personalized guest services tailored to your stay.' :
                  businessType === 'restaurant' ? 'Experience farm-to-table freshness, signature chef recipes, and warm dining hospitality every single day.' :
                  'Delivering premier quality, dedicated customer care, and industry-leading standards.'
                )}
              </p>

              {/* Call-to-action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#offerings"
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-600/20 border border-emerald-400/40 flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-200" />
                  <span>{businessType === 'hotel_resort' ? 'Explore Rooms & Suites' : businessType === 'restaurant' ? 'View Gourmet Menu' : businessType === 'tours_travel' ? 'View Tour Packages' : 'Explore Offerings'}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={onEnterOS}
                  className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-white/10 flex items-center gap-2 transition cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Staff / Workspace Portal</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-slate-400 text-xs border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Premium Quality Assured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Direct Customer Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>4.9 / 5 Guest Rating</span>
                </div>
              </div>

            </div>

            {/* Right Hero Image / Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 relative aspect-4/3 group">
                <img
                  src={branding.customLandingData?.heroImageUrl || branding.logoUrl || (
                    businessType === 'hotel_resort' ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80' :
                    businessType === 'restaurant' ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80' :
                    businessType === 'tours_travel' ? 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80' :
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
                  )}
                  alt={branding.companyName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full w-fit">
                    Official Representative
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">{branding.companyName}</h3>
                  <p className="text-xs text-slate-300 font-mono truncate">{branding.address || 'Location Verified'}</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. OFFERINGS & CATALOGUE SHOWCASE                         */}
        {/* ========================================================= */}
        <section id="offerings" className="space-y-8 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4" /> Featured Offerings
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {activeDataset.title}
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCatalogCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeCatalogCategory === cat
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-cyan-500/40 transition duration-300 overflow-hidden flex flex-col justify-between group text-left shadow-xl"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-cyan-300 border border-white/20">
                      {item.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-300 border border-white/20 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> {item.rating}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {/* Features checklist */}
                    <div className="pt-2 space-y-1.5">
                      {item.features?.map((feat: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 border-t border-white/5 mt-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block font-mono uppercase">Pricing</span>
                    <span className="text-xl font-black text-emerald-400">{item.price}</span>
                    <span className="text-xs text-slate-400 font-mono">{item.unit}</span>
                  </div>

                  <button
                    onClick={() => setBookingModalItem(item)}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md border border-cyan-300/30 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Inquire / Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. ABOUT US & VALUE PROPOSITION                           */}
        {/* ========================================================= */}
        <section id="about-us" className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 text-left space-y-8 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold uppercase text-indigo-400 tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" /> About {branding.companyName}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Dedicated to Craft, Comfort & Exceptional Experience
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {branding.customLandingData?.aboutText || `${branding.companyName} operates with an uncompromising commitment to client satisfaction, seamless service execution, and modern standard quality. Whether you are visiting our location or connecting online, our team guarantees unmatched attention to detail.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-emerald-400 font-black text-lg">100% Satisfaction</div>
                  <div className="text-xs text-slate-300">Dedicated staff and verified service protocols.</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-cyan-400 font-black text-lg">Instant Support</div>
                  <div className="text-xs text-slate-300">Reach our team directly via phone or online inquiry.</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Official Business Guarantee
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This official digital storefront is verified under {branding.companyName}. All bookings, reservations, and customer inquiries are handled directly by our authorized operations team.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Domain Status: Verified</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. LOCATION & CONTACT INQUIRY SECTION                     */}
        {/* ========================================================= */}
        <section id="contact" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left scroll-mt-20">
          
          {/* Left: Contact Details */}
          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location & Contact
              </span>
              <h2 className="text-2xl font-black text-white">Get in Touch With Us</h2>
            </div>

            <div className="space-y-4 text-xs font-sans text-slate-300">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Address</span>
                  <span>{branding.address || '100 Business Avenue, Suite 100'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Direct Phone</span>
                  <span>{branding.phone || '+1 (800) 555-0199'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Email Support</span>
                  <span>{branding.supportEmail || 'contact@workspace.com'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Instant Message / Inquiry Form */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" /> Send Direct Inquiry Message
            </h3>
            
            {bookingSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-2 animate-in fade-in">
                <div className="font-extrabold text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Message Received Successfully!
                </div>
                <p className="text-xs">
                  Thank you for reaching out to {branding.companyName}. Our team will respond to your request shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Alexander Vance"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 block mb-1">Inquiry / Special Request Details</label>
                  <textarea
                    rows={3}
                    required
                    value={guestNotes}
                    onChange={(e) => setGuestNotes(e.target.value)}
                    placeholder="Tell us about your reservation dates, guest count, or service requirements..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-lg border border-emerald-400/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Submit Inquiry
                </button>
              </form>
            )}
          </div>

        </section>

      </main>

      {/* ========================================================= */}
      {/* 6. INQUIRY / BOOKING MODAL                                */}
      {/* ========================================================= */}
      {bookingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0c0f1d] border border-cyan-500/35 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Booking Request</span>
                <h3 className="text-lg font-black text-white">{bookingModalItem.title}</h3>
              </div>
              <button onClick={() => setBookingModalItem(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-2 animate-in fade-in text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-extrabold text-base">Booking Request Submitted!</div>
                <p className="text-xs">
                  We have received your reservation request for {bookingModalItem.title}. Our team will contact you at {guestEmail} to confirm details.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <span className="text-slate-300">Selected Offering Rate:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{bookingModalItem.price} {bookingModalItem.unit}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Guests / Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Special Notes / Requests</label>
                  <textarea
                    rows={2}
                    value={guestNotes}
                    onChange={(e) => setGuestNotes(e.target.value)}
                    placeholder="e.g., High floor room, dietary restrictions, arrival time..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg border border-cyan-300/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm Booking Request
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. FOOTER & DISCRETE STAFF WORKSPACE LINK                 */}
      {/* ========================================================= */}
      <footer className="mt-20 border-t border-white/10 bg-[#04060d] py-12 px-4 sm:px-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Footer Info */}
          <div className="space-y-1 text-center md:text-left">
            <div className="font-extrabold text-white text-base">{branding.companyName}</div>
            <p className="text-slate-400 text-xs">{branding.tagline || 'Official Business Website & Portal'}</p>
            <p className="text-[11px] text-slate-400 pt-1">
              © {new Date().getFullYear()} {branding.companyName}. All rights reserved.
            </p>
          </div>

          {/* Center Company Information Page Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            {[
              { key: 'about', label: 'About Us' },
              { key: 'privacy', label: 'Privacy Policy' },
              { key: 'contact', label: 'Contact Us' },
              { key: 'faq', label: 'FAQ' },
              { key: 'disclaimer', label: 'Disclaimer' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => openCompanyPage(item.key as any)}
                className="text-slate-400 hover:text-cyan-300 transition cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Staff Workspace Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAuthModalTab('reset');
                setIsAuthModalOpen(true);
              }}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl font-mono text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reset Password</span>
            </button>
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl font-mono text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Staff Workspace Login</span>
            </button>
          </div>

        </div>
      </footer>

      {/* Staff Login & Password Reset Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#0b0e1a] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-left font-sans animate-in fade-in zoom-in-95">
            
            {/* Header & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30">
                  {authModalTab === 'login' ? <Lock className="w-5 h-5 text-indigo-400" /> : <KeyRound className="w-5 h-5 text-indigo-400" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {authModalTab === 'login' ? 'Staff & Workspace Sign In' : 'Account Password Reset'}
                  </h3>
                  <p className="text-[11px] text-slate-400">{branding.companyName} Member Gateway</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setResetMessage(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab('login');
                  setResetMessage(null);
                }}
                className={`py-2 rounded-lg transition cursor-pointer text-center ${authModalTab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab('reset');
                  setResetMessage(null);
                }}
                className={`py-2 rounded-lg transition cursor-pointer text-center ${authModalTab === 'reset' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Reset Password
              </button>
            </div>

            {/* Notifications */}
            {resetMessage && (
              <div className={`p-3.5 rounded-xl text-xs font-mono font-medium ${resetMessage.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-950/50 border border-red-900 text-red-200'}`}>
                {resetMessage.text}
              </div>
            )}

            {/* TAB 1: LOGIN TAB */}
            {authModalTab === 'login' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your workspace credentials to access the <strong>{branding.companyName}</strong> management platform.
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="text-xs text-slate-400">
                    Clicking below will navigate to the primary workspace authorization portal with <strong>{tenantId}</strong> preselected.
                  </div>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      onEnterOS?.();
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer transition transform hover:-translate-y-0.5"
                  >
                    <span>Proceed to Tenant Workspace Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('reset');
                      setResetMessage(null);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition hover:underline cursor-pointer"
                  >
                    Forgot your password? Reset it here
                  </button>
                </div>
              </div>
            ) : (
              /* TAB 2: RESET PASSWORD TAB */
              <div className="space-y-4">
                {!resetCodeSent ? (
                  <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Registered Email Address</label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. staff@democorp.com"
                        className="w-full bg-black/50 border border-white/15 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isResetLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow"
                    >
                      {isResetLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching Reset Request...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Request Reset Code</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleConfirmPasswordReset} className="space-y-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Reset Recovery Code</label>
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="MKT-RESET-123456"
                        className="w-full bg-black/50 border border-white/15 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">New Password</label>
                      <input
                        type="password"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 chars)"
                        className="w-full bg-black/50 border border-white/15 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isResetLoading}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow"
                    >
                      {isResetLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>Save New Password &amp; Continue</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Company Pages Modal */}
      <CompanyPagesModal
        isOpen={companyPagesModalOpen}
        onClose={() => setCompanyPagesModalOpen(false)}
        defaultTab={companyPageTab}
      />

    </div>
  );
}

export default MarketForgeLanding;
