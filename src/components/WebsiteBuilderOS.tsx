import React, { useState } from 'react';
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
  Utensils,
  HeartPulse,
  Pill,
  PhoneCall,
  Compass,
  Dumbbell,
  Scissors,
  Smile,
  Package,
  Shirt,
  Building,
  Briefcase,
  Star,
  MapPin,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  X,
  Image as ImageIcon,
  MessageSquare,
  Maximize2,
  Send,
  Zap,
  Sliders,
  Store,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { getTenantBranding, saveTenantBranding } from '../lib/tenantBranding';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
}

// Preset Industry Templates
export interface IndustryPreset {
  id: string;
  name: string;
  icon: React.ElementType;
  badge: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroImage: string;
  primaryColorTheme: string;
  itemsLabel: string;
  products: {
    id: string;
    title: string;
    price: string;
    category: string;
    image: string;
    badge: string;
    description: string;
  }[];
  features: {
    title: string;
    desc: string;
  }[];
  aboutText: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
}

const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: 'hospital',
    name: 'Hospital & Healthcare',
    icon: HeartPulse,
    badge: 'Medical Excellence',
    heroHeadline: 'World-Class Compassionate Care For Your Loved Ones',
    heroSubtitle: '24/7 emergency medical response, advanced diagnostics, expert multi-specialty doctors, and modern clinical facilities.',
    heroImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'emerald',
    itemsLabel: 'Departments & Specialties',
    products: [
      {
        id: 'p1',
        title: 'Emergency & Critical ICU Care',
        price: '24/7 Active',
        category: 'Emergency',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
        badge: 'Priority 1',
        description: 'Immediate trauma response with fully equipped cardiac life support ambulances.'
      },
      {
        id: 'p2',
        title: 'Comprehensive Cardiology Suite',
        price: 'Consultation $80',
        category: 'Specialties',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
        badge: 'Top Rated',
        description: 'Advanced ECG, 2D Echo, stress testing, and expert interventional cardiology.'
      },
      {
        id: 'p3',
        title: 'Digital Radiology & MRI Scans',
        price: 'From $120',
        category: 'Diagnostics',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
        badge: 'High Precision',
        description: 'Ultra-low radiation 3D CT scans and high-resolution MRI imaging.'
      }
    ],
    features: [
      { title: 'JCI Accredited Facility', desc: 'Compliant with international healthcare safety and hygiene protocols.' },
      { title: '50+ Specialist Doctors', desc: 'Renowned surgeons, pediatricians, cardiologists, and neurologists.' },
      { title: 'Digital Health Records', desc: 'Secure online patient portal to access prescriptions and test results.' }
    ],
    aboutText: 'Dedicated to providing patient-first medical treatments with cutting-edge medical technology and empathetic healthcare teams.',
    contactAddress: '102 Medical Boulevard, Health City Zone',
    contactPhone: '+1 (800) 555-0199',
    contactEmail: 'care@medicalcenter.org'
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy & Wellness',
    icon: Pill,
    badge: '100% Genuine Medicines',
    heroHeadline: 'Your Trusted Neighborhood Pharmacy & Health Hub',
    heroSubtitle: 'Authentic prescription medicines, wellness supplements, home delivery within 30 minutes, and online prescription refills.',
    heroImage: 'https://images.unsplash.com/photo-1586015555751-63c205739221?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'teal',
    itemsLabel: 'Featured Medicines & Supplements',
    products: [
      {
        id: 'ph1',
        title: 'Daily Multi-Vitamin & Mineral Boost',
        price: '$24.99',
        category: 'Supplements',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        badge: 'Best Seller',
        description: 'High potency essential vitamins for immunity, stamina, and bone health.'
      },
      {
        id: 'ph2',
        title: 'Automatic Digital Blood Pressure Monitor',
        price: '$45.00',
        category: 'Medical Devices',
        image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1cdb?auto=format&fit=crop&w=600&q=80',
        badge: 'FDA Approved',
        description: 'One-touch pulse and BP checker with memory recall for 2 users.'
      },
      {
        id: 'ph3',
        title: 'Organic Herbal Sleep & Immunity Tea',
        price: '$14.50',
        category: 'Wellness',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
        badge: '100% Natural',
        description: 'Soothing chamomile and ashwagandha blend for restful night recovery.'
      }
    ],
    features: [
      { title: 'Express 30-Min Delivery', desc: 'Urgent medications delivered direct to your doorstep safely.' },
      { title: 'Prescription Auto-Refill', desc: 'Never run out of essential monthly chronic disease care medicines.' },
      { title: 'Licensed Pharmacists', desc: 'Free consultation on dosage, side effects, and drug interactions.' }
    ],
    aboutText: 'Bridging healthcare with convenience. We source 100% certified pharmaceutical supplies from verified manufacturers globally.',
    contactAddress: '45 Health Avenue, Care Square',
    contactPhone: '+1 (800) 444-MEDS',
    contactEmail: 'order@pharmacyhub.com'
  },
  {
    id: 'mobile_shop',
    name: 'Mobile & Tech Electronics',
    icon: PhoneCall,
    badge: 'Latest Smartphones & Gadgets',
    heroHeadline: 'Upgrade to Flagship Smartphones & Smart Accessories',
    heroSubtitle: 'Explore the newest smartphones, wireless earbuds, smartwatches, and laptop accessories with official warranty and easy EMI.',
    heroImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'indigo',
    itemsLabel: 'Hot Selling Tech & Devices',
    products: [
      {
        id: 'm1',
        title: 'Ultra Pro Max 5G Smartphone (256GB)',
        price: '$999.00',
        category: 'Smartphones',
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
        badge: 'New Release',
        description: 'A18 Pro chip, OLED 120Hz display, titanium body, and 108MP camera.'
      },
      {
        id: 'm2',
        title: 'Active Noise Canceling Wireless Earbuds',
        price: '$149.00',
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
        badge: '30h Battery',
        description: 'Spatial audio with dynamic head tracking and IPX5 water resistance.'
      },
      {
        id: 'm3',
        title: 'Titanium Smartwatch with ECG & GPS',
        price: '$220.00',
        category: 'Wearables',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
        badge: 'Fitness Pro',
        description: 'Continuous heart rate, blood oxygen sensor, and dual-frequency GPS.'
      }
    ],
    features: [
      { title: 'Official Brand Warranty', desc: '100% genuine products with 1-year brand replacement warranty.' },
      { title: 'Instant Exchange Offer', desc: 'Trade in your old device for maximum cash back toward new upgrades.' },
      { title: 'Zero% Interest EMI', desc: 'Flexible monthly installment plans with major credit cards.' }
    ],
    aboutText: 'Your one-stop destination for authentic smartphones, audio gear, smart wearables, and professional device repair services.',
    contactAddress: '78 Tech Plaza, Cyber Avenue',
    contactPhone: '+1 (800) 888-TECH',
    contactEmail: 'sales@techmobile.com'
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Cafe',
    icon: Utensils,
    badge: 'Artisanal Dining Experience',
    heroHeadline: 'Savor Exquisite Gourmet Flavors & Artisan Recipes',
    heroSubtitle: 'Handcrafted wood-fired pizzas, chef special delicacies, organic ingredients, and cozy ambience for memorable celebrations.',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'amber',
    itemsLabel: 'Chef Signature Specials',
    products: [
      {
        id: 'r1',
        title: 'Truffle & Wild Mushroom Wood-fired Pizza',
        price: '$22.50',
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        badge: 'Chef Favorite',
        description: 'Fresh mozzarella, black truffle oil, wild mushrooms, and fresh basil leaves.'
      },
      {
        id: 'r2',
        title: 'Grilled Salmon with Citrus Herb Glaze',
        price: '$28.00',
        category: 'Seafood',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
        badge: 'Fresh Catch',
        description: 'Wild Atlantic salmon served with roasted asparagus and garlic butter quinoa.'
      },
      {
        id: 'r3',
        title: 'Artisan Espresso Tiramisu & Gelato',
        price: '$9.50',
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
        badge: 'Handmade',
        description: 'Traditional mascarpone cheese cream layered with espresso-soaked ladyfingers.'
      }
    ],
    features: [
      { title: 'Farm-to-Table Fresh', desc: '100% organic produce sourced daily from local sustainable farms.' },
      { title: 'Online Table Reservation', desc: 'Book private booths or outdoor terrace seating in seconds.' },
      { title: 'Contactless QR Menu', desc: 'Instant digital ordering and table payment gateway.' }
    ],
    aboutText: 'Blending traditional culinary techniques with modern gastronomy to create dining moments you will cherish with friends and family.',
    contactAddress: '12 Gourmet Street, Culinary Haven',
    contactPhone: '+1 (800) 333-FOOD',
    contactEmail: 'reserve@bistrogourmet.com'
  },
  {
    id: 'mart',
    name: 'Departmental Mart & Grocery',
    icon: Store,
    badge: 'Lowest Prices Guaranteed',
    heroHeadline: 'Fresh Farm Groceries & Everyday Supermarket Deals',
    heroSubtitle: 'Over 10,000+ household items, fresh vegetables, organic dairy, snacks, and imported pantry items delivered directly to your home.',
    heroImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'emerald',
    itemsLabel: 'Super Saver Daily Grocery Deals',
    products: [
      {
        id: 'mrt1',
        title: 'Farm Fresh Organic Milk & Dairy Basket',
        price: '$6.99',
        category: 'Dairy & Eggs',
        image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
        badge: 'Farm Fresh',
        description: 'Pure pasteurized whole milk, fresh butter, and free-range brown eggs.'
      },
      {
        id: 'mrt2',
        title: 'Premium Organic Exotic Fruits Box',
        price: '$18.50',
        category: 'Fresh Produce',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
        badge: 'Vitamin Pack',
        description: 'Selected ripe avocados, dragon fruit, blueberries, and kiwi.'
      },
      {
        id: 'mrt3',
        title: 'Whole Grain Bakery Bread & Artisan Snacks',
        price: '$4.25',
        category: 'Pantry',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        badge: 'Baked Today',
        description: 'Stone-ground sourdough bread baked fresh every morning.'
      }
    ],
    features: [
      { title: 'Wholesale Discount Pricing', desc: 'Bulk discount rewards on weekly family supermarket baskets.' },
      { title: 'Doorstep Delivery in 2 Hours', desc: 'Temperature-controlled delivery vehicles keep produce fresh.' },
      { title: 'Quality Assurance Guarantee', desc: '100% hassle-free refund if you are dissatisfied with fresh items.' }
    ],
    aboutText: 'Your reliable neighborhood department mart committed to quality, freshness, and unbeatable wholesale pricing.',
    contactAddress: '88 Central Market Road, Mart City',
    contactPhone: '+1 (800) 999-MART',
    contactEmail: 'support@supermartexpress.com'
  },
  {
    id: 'tours',
    name: 'Tours, Travels & Adventure',
    icon: Compass,
    badge: 'Curated Dream Holidays',
    heroHeadline: 'Explore Unforgettable Destinations Across the Globe',
    heroSubtitle: 'Tailor-made vacation packages, trekking expeditions, luxury resort bookings, and hassle-free visa assistance.',
    heroImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'sky',
    itemsLabel: 'Featured Holiday & Tour Packages',
    products: [
      {
        id: 't1',
        title: 'Himalayan Mountain Expedition (7 Days)',
        price: '$899 / person',
        category: 'Adventure Trek',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
        badge: 'All Inclusive',
        description: 'Guided trek with mountain lodges, campfire nights, and helicopter rescue insurance.'
      },
      {
        id: 't2',
        title: 'Tropical Island Beach Villa Resort (5 Days)',
        price: '$1,250 / couple',
        category: 'Luxury Vacation',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        badge: 'Popular Choice',
        description: 'Private oceanfront bungalow, spa credits, speed boat transfers, and seafood buffets.'
      },
      {
        id: 't3',
        title: 'European Heritage & Cultural Tour (10 Days)',
        price: '$2,400 / person',
        category: 'International',
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
        badge: 'Guided Group',
        description: 'Paris, Rome, and Zurich with bullet train passes, museum entrances, and English guides.'
      }
    ],
    features: [
      { title: 'Zero Cancellation Fee', desc: 'Flexibility to reschedule or cancel up to 48 hours before trip departure.' },
      { title: '24/7 On-Tour Support', desc: 'Local travel concierge reachable at any point during your holiday.' },
      { title: 'Custom Itinerary Builder', desc: 'Craft personalized travel itineraries matching your exact budget.' }
    ],
    aboutText: 'Passionate travel experts helping thousands of travelers create lifelong memories across 40+ countries.',
    contactAddress: '204 Destination Towers, Transit Square',
    contactPhone: '+1 (800) 777-TOUR',
    contactEmail: 'holidays@worldtours.com'
  },
  {
    id: 'fitness',
    name: 'Fitness Gym, Crossfit & Zumba',
    icon: Dumbbell,
    badge: 'Transform Your Mind & Body',
    heroHeadline: 'Unleash Your Full Athletic Potential Today',
    heroSubtitle: 'State-of-the-art heavy lifting gear, high-energy Zumba dance cardio classes, personal trainers, and steam sauna.',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'rose',
    itemsLabel: 'Membership Memberships & Training Modules',
    products: [
      {
        id: 'f1',
        title: 'All-Access Monthly Gym & Cardio Pass',
        price: '$49 / month',
        category: 'Memberships',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        badge: 'Best Value',
        description: 'Unlimited access to weight floor, cardio zone, lockers, and sauna rooms.'
      },
      {
        id: 'f2',
        title: 'High-Energy Zumba & Dance Fitness Group',
        price: '$35 / 10 Sessions',
        category: 'Group Classes',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
        badge: 'Fun Cardio',
        description: 'Latin dance cardio routines led by certified Zumba instructors for fast calorie burn.'
      },
      {
        id: 'f3',
        title: '1-on-1 Elite Personal Body Sculpting',
        price: '$120 / month',
        category: 'Personal Coaching',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
        badge: 'Guaranteed Results',
        description: 'Customized weight loss / muscle gain workouts with personalized nutrition meal planning.'
      }
    ],
    features: [
      { title: 'Biometric Body Composition', desc: 'Monthly InBody 3D muscle mass and body fat percentage scanning.' },
      { title: 'Hygienic Sanitized Equipment', desc: 'Sanitized workout zones with filtered air circulation.' },
      { title: 'Free Trial Class', desc: 'Experience a free workout session before committing to membership.' }
    ],
    aboutText: 'A high-energy fitness community empowering individuals of all fitness levels to build strength, confidence, and longevity.',
    contactAddress: '55 Power Gym Complex, Arena Boulevard',
    contactPhone: '+1 (800) 666-FITNESS',
    contactEmail: 'join@powerhousegym.com'
  },
  {
    id: 'beauty',
    name: 'Beauty Parlor, Salon & Spa',
    icon: Scissors,
    badge: 'Glow With Elegance',
    heroHeadline: 'Premium Hair Styling, Skincare & Luxury Spa Care',
    heroSubtitle: 'Pamper yourself with organic facials, bridal makeup, trendsetting hair coloring, nail art, and therapeutic massages.',
    heroImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'rose',
    itemsLabel: 'Signature Beauty Packages',
    products: [
      {
        id: 'b1',
        title: 'Hydra-Glow Anti-Aging Facial Spa',
        price: '$85.00',
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
        badge: 'Instant Radiance',
        description: 'Deep pore extraction, hyaluronic acid infusion, and collagen LED mask massage.'
      },
      {
        id: 'b2',
        title: 'Bridal Glam & HD Makeup Package',
        price: '$250.00',
        category: 'Bridal Studio',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
        badge: 'Waterproof HD',
        description: 'Complete wedding makeover including hair draping, lash extensions, and touch-up kit.'
      },
      {
        id: 'b3',
        title: 'Keratin Hair Smoothing & Color Balayage',
        price: '$140.00',
        category: 'Hair Care',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        badge: 'Frizz Free',
        description: 'Deep nourishing keratin therapy with customized dimensional balayage highlights.'
      }
    ],
    features: [
      { title: 'International Products', desc: 'Exclusive use of Loreal, Olaplex, and Dermalogica certified lines.' },
      { title: 'Private VIP Spa Rooms', desc: 'Relaxing ambient room with aromatherapy and soothing music.' },
      { title: 'Instant Online Appointment', desc: 'Pick your preferred beauty artist and slot without waiting.' }
    ],
    aboutText: 'Dedicated to highlighting your inner beauty through bespoke aesthetic treatments, skilled stylists, and relaxing sanctuary spaces.',
    contactAddress: '108 Glamour Lane, Beauty Zone',
    contactPhone: '+1 (800) 222-GLOW',
    contactEmail: 'book@beautysalon.com'
  },
  {
    id: 'dentist',
    name: 'Dental Clinic & Orthodontics',
    icon: Smile,
    badge: 'Gentle Dental Care',
    heroHeadline: 'Achieve a Radiant, Healthy & Confident Smile',
    heroSubtitle: 'Painless teeth whitening, laser dentistry, invisible aligners, dental implants, and pediatric dental checkups.',
    heroImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'cyan',
    itemsLabel: 'Dental Treatments & Cosmetic Care',
    products: [
      {
        id: 'd1',
        title: '3D Laser Teeth Whitening Treatment',
        price: '$199.00',
        category: 'Cosmetic Dentistry',
        image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
        badge: '3 Shades Brighter',
        description: 'Single-session painless laser bleaching removing deep tea, coffee, and tobacco stains.'
      },
      {
        id: 'd2',
        title: 'Clear Invisible Braces & Aligners',
        price: 'From $1,400',
        category: 'Orthodontics',
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80',
        badge: 'Discreet',
        description: 'Custom 3D scanned transparent aligners to straighten teeth without metal wires.'
      },
      {
        id: 'd3',
        title: 'Single Tooth Swiss Dental Implant',
        price: '$850.00',
        category: 'Restorative',
        image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80',
        badge: 'Lifetime Warranty',
        description: 'Biocompatible titanium root with natural-looking porcelain crown.'
      }
    ],
    features: [
      { title: '100% Painless Laser Tech', desc: 'Micro-invasive procedures with minimal healing downtime.' },
      { title: 'Ultra-Sterilized Environment', desc: 'Hospital-grade autoclave sterilization for every instrument.' },
      { title: 'Emergency Dental Response', desc: 'Same-day urgent appointments for severe toothache or injuries.' }
    ],
    aboutText: 'Combining dental art with medical precision. Our clinic provides gentle dental experiences for patients of all ages.',
    contactAddress: '302 Smile Plaza, Healthcare Way',
    contactPhone: '+1 (800) 111-SMILE',
    contactEmail: 'appointment@dentalcare.com'
  },
  {
    id: 'wholesale',
    name: 'Wholesale & B2B Distributor',
    icon: Package,
    badge: 'B2B Bulk Supply Partner',
    heroHeadline: 'Direct Factory Prices & High Volume B2B Bulk Supply',
    heroSubtitle: 'Source high-demand merchandise, raw materials, consumer goods, and industrial components with guaranteed MOQ terms and global freight.',
    heroImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'indigo',
    itemsLabel: 'Bulk Supply Catalog & Containers',
    products: [
      {
        id: 'w1',
        title: 'Industrial Electronics & Cable Master Cartons',
        price: '$12.50 / unit (MOQ 100)',
        category: 'Hardware',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        badge: 'ISO Certified',
        description: 'High-purity copper wiring, heavy-duty connectors, and heat-resistant shielding.'
      },
      {
        id: 'w2',
        title: 'Eco-Friendly Biodegradable Packaging Boxes',
        price: '$0.45 / box (MOQ 1000)',
        category: 'Packaging',
        image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        badge: 'Eco-Friendly',
        description: 'Heavy 3-ply corrugated boxes ideal for e-commerce and retail shipment.'
      },
      {
        id: 'w3',
        title: 'Commercial Cleaning & Sanitizer Drums (200L)',
        price: '$180 / Drum',
        category: 'Chemicals',
        image: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=600&q=80',
        badge: 'Hospital Grade',
        description: '75% alcohol disinfectant solution formulated for large enterprise buildings.'
      }
    ],
    features: [
      { title: 'Tiered Bulk Volume Discount', desc: 'Save up to 40% when ordering full container loads (FCL).' },
      { title: 'Dedicated Key Account Manager', desc: 'Single point contact for contract quotes and customs clearance.' },
      { title: 'Net 30/60 Credit Terms', desc: 'Flexible trade credit options for verified business partners.' }
    ],
    aboutText: 'Leading global B2B distributor providing reliable supply chain continuity for retailers, factories, and corporate clients.',
    contactAddress: '500 Logistics Logistics Hub, Port Road',
    contactPhone: '+1 (800) 555-BULK',
    contactEmail: 'b2b@wholesaledirect.com'
  },
  {
    id: 'fashion',
    name: 'Fashion, Boutique & Clothes',
    icon: Shirt,
    badge: 'New Season Collection',
    heroHeadline: 'Discover Timeless Style & Runway Fashion Trends',
    heroSubtitle: 'Handpicked apparel, designer dresses, streetwear coats, footwear, and accessories tailored for modern elegance.',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    primaryColorTheme: 'purple',
    itemsLabel: 'New Season Fashion Arrivals',
    products: [
      {
        id: 'fa1',
        title: 'Handcrafted Cashmere Wool Trench Coat',
        price: '$189.00',
        category: 'Outerwear',
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80',
        badge: '100% Cashmere',
        description: 'Double-breasted classic silhouette lined with soft silk for luxury comfort.'
      },
      {
        id: 'fa2',
        title: 'Vintage Leather Shoulder Crossbody Bag',
        price: '$95.00',
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
        badge: 'Genuine Leather',
        description: 'Full-grain Italian leather with brass hardware and adjustable strap.'
      },
      {
        id: 'fa3',
        title: 'Urban Minimalist Unisex Sneakers',
        price: '$110.00',
        category: 'Footwear',
        image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80',
        badge: 'Limited Edition',
        description: 'Breathable canvas upper with memory foam cushioned rubber soles.'
      }
    ],
    features: [
      { title: 'Free Global Express Shipping', desc: 'Complimentary tracked courier delivery on orders over $100.' },
      { title: '30-Day Easy Exchange', desc: 'Hassle-free size exchange and store credit policy.' },
      { title: 'Sustainable Organic Fabrics', desc: 'Ethically manufactured with low impact eco-dyes.' }
    ],
    aboutText: 'Curating modern wardrobes that express individuality, confidence, and effortless sophistication.',
    contactAddress: '15 Fashion Avenue, Style Quarter',
    contactPhone: '+1 (800) 888-STYLE',
    contactEmail: 'concierge@boutiquefashion.com'
  }
];

// Color Theme Map
export interface ColorThemeOption {
  id: string;
  name: string;
  headerBg: string;
  heroGradient: string;
  accentBtn: string;
  accentText: string;
  badgeBg: string;
}

const COLOR_THEMES: Record<string, ColorThemeOption> = {
  emerald: {
    id: 'emerald',
    name: 'Clean Medical Emerald',
    headerBg: 'bg-[#061811]',
    heroGradient: 'from-emerald-950 via-[#061811] to-[#040D0A]',
    accentBtn: 'bg-emerald-500 hover:bg-emerald-400 text-[#040D0A]',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  teal: {
    id: 'teal',
    name: 'Teal Wellness',
    headerBg: 'bg-[#041618]',
    heroGradient: 'from-teal-950 via-[#041618] to-[#020A0B]',
    accentBtn: 'bg-teal-400 hover:bg-teal-300 text-slate-950',
    accentText: 'text-teal-300',
    badgeBg: 'bg-teal-500/20 text-teal-200 border-teal-500/30'
  },
  indigo: {
    id: 'indigo',
    name: 'Cyberpunk Tech Indigo',
    headerBg: 'bg-[#0A0D1D]',
    heroGradient: 'from-indigo-950 via-[#0A0D1D] to-[#05060F]',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    accentText: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  },
  amber: {
    id: 'amber',
    name: 'Warm Gourmet Amber',
    headerBg: 'bg-[#1C1206]',
    heroGradient: 'from-amber-950 via-[#1C1206] to-[#0F0A03]',
    accentBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  sky: {
    id: 'sky',
    name: 'Ocean Sky Blue',
    headerBg: 'bg-[#061320]',
    heroGradient: 'from-sky-950 via-[#061320] to-[#020810]',
    accentBtn: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
    accentText: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
  },
  rose: {
    id: 'rose',
    name: 'Vibrant Beauty Rose',
    headerBg: 'bg-[#1C0913]',
    heroGradient: 'from-rose-950 via-[#1C0913] to-[#0F040A]',
    accentBtn: 'bg-rose-500 hover:bg-rose-400 text-white',
    accentText: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  },
  cyan: {
    id: 'cyan',
    name: 'Radiant Cyan',
    headerBg: 'bg-[#04161B]',
    heroGradient: 'from-cyan-950 via-[#04161B] to-[#020B0E]',
    accentBtn: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
    accentText: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30'
  },
  purple: {
    id: 'purple',
    name: 'Luxury Royal Purple',
    headerBg: 'bg-[#140A1C]',
    heroGradient: 'from-purple-950 via-[#140A1C] to-[#0A040E]',
    accentBtn: 'bg-purple-600 hover:bg-purple-500 text-white',
    accentText: 'text-purple-300',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  }
};

export default function WebsiteBuilderOS({ profile, tenantId }: Props) {
  // Config state
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('hospital');
  const currentIndustry = INDUSTRY_PRESETS.find(i => i.id === selectedIndustryId) || INDUSTRY_PRESETS[0];

  const [activeThemeKey, setActiveThemeKey] = useState<string>(currentIndustry.primaryColorTheme);
  const activeTheme = COLOR_THEMES[activeThemeKey] || COLOR_THEMES.indigo;

  // Custom Editable State
  const [siteName, setSiteName] = useState<string>(profile.name || currentIndustry.name);
  const [heroHeadline, setHeroHeadline] = useState<string>(currentIndustry.heroHeadline);
  const [heroSubtitle, setHeroSubtitle] = useState<string>(currentIndustry.heroSubtitle);
  const [heroImage, setHeroImage] = useState<string>(currentIndustry.heroImage);
  const [aboutText, setAboutText] = useState<string>(currentIndustry.aboutText);
  const [contactAddress, setContactAddress] = useState<string>(currentIndustry.contactAddress);
  const [contactPhone, setContactPhone] = useState<string>(currentIndustry.contactPhone);
  const [contactEmail, setContactEmail] = useState<string>(currentIndustry.contactEmail);

  // Products state
  const [productsList, setProductsList] = useState(currentIndustry.products);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'General',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    badge: 'Popular',
    description: ''
  });
  const [isAddingProductModal, setIsAddingProductModal] = useState(false);

  // UI state
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preset' | 'theme' | 'content' | 'products' | 'publish'>('preset');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeType, setCodeType] = useState<'html' | 'react'>('html');
  const [copiedCode, setCopiedCode] = useState(false);

  // Contact form state in preview
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });

  // Handle Preset change
  const handleSelectIndustry = (preset: IndustryPreset) => {
    setSelectedIndustryId(preset.id);
    setActiveThemeKey(preset.primaryColorTheme);
    setHeroHeadline(preset.heroHeadline);
    setHeroSubtitle(preset.heroSubtitle);
    setHeroImage(preset.heroImage);
    setAboutText(preset.aboutText);
    setContactAddress(preset.contactAddress);
    setContactPhone(preset.contactPhone);
    setContactEmail(preset.contactEmail);
    setProductsList(preset.products);
  };

  // AI Auto Synthesize
  const handleAISynthesize = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setIsGeneratingAI(false);
      setHeroHeadline(`Elite ${currentIndustry.name} Solutions Designed For Exceptional Impact`);
      setHeroSubtitle(`Leveraging high-precision workflows, certified expertise, and instant client satisfaction for ${profile.name}.`);
    }, 1500);
  };

  // Add Product handler
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title) return;
    const item = {
      id: 'p_' + Date.now(),
      ...newProduct
    };
    setProductsList([...productsList, item]);
    setNewProduct({
      title: '',
      price: '',
      category: 'General',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      badge: 'New',
      description: ''
    });
    setIsAddingProductModal(false);
  };

  const handleRemoveProduct = (id: string) => {
    setProductsList(productsList.filter(p => p.id !== id));
  };

  // Handle Publish & Auto Sync to Tenant White-Label Engine
  const handlePublishSite = async () => {
    const slug = siteName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const domain = `https://${slug || 'business'}.marketbazaaros.site`;
    setPublishedUrl(domain);
    setIsPublished(true);

    // Auto-sync published website data with Tenant White-Labeling Engine
    try {
      const currentBranding = getTenantBranding(tenantId || 'demo-tenant');
      const updatedBranding = {
        ...currentBranding,
        tenantId: tenantId || 'demo-tenant',
        companyName: siteName || currentBranding.companyName,
        tagline: heroHeadline || currentBranding.tagline,
        address: contactAddress || currentBranding.address,
        phone: contactPhone || currentBranding.phone,
        supportEmail: contactEmail || currentBranding.supportEmail,
        homepageSource: 'website_builder' as const,
        customLandingData: {
          heroTitle: heroHeadline,
          heroSubtitle: heroSubtitle,
          heroImageUrl: heroImage,
          ctaButtonText: 'Explore Collection',
          aboutText: aboutText,
          productsCatalog: productsList.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            image: p.image,
            category: p.category,
            badge: p.badge,
            description: p.description
          }))
        }
      };
      await saveTenantBranding(updatedBranding);
    } catch (err) {
      console.warn('Failed auto-syncing website builder to tenant white-label:', err);
    }
  };

  const generatedHtmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName} - Official Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#07080E] text-slate-100 font-sans">
  <header class="${activeTheme.headerBg} border-b border-white/10 sticky top-0 z-50 py-4 px-8 flex justify-between items-center">
    <h1 class="text-xl font-extrabold text-white">${siteName}</h1>
    <nav class="hidden md:flex gap-6 text-xs font-semibold text-slate-300">
      <a href="#home">Home</a>
      <a href="#services">Services</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
    <a href="#contact" class="px-4 py-2 ${activeTheme.accentBtn} font-bold text-xs rounded-xl">Contact Us</a>
  </header>

  <section id="home" class="py-20 px-8 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <div class="space-y-6">
      <span class="px-3 py-1 text-xs font-bold rounded-full ${activeTheme.badgeBg}">${currentIndustry.badge}</span>
      <h2 class="text-4xl font-extrabold text-white leading-tight">${heroHeadline}</h2>
      <p class="text-slate-300 text-sm leading-relaxed">${heroSubtitle}</p>
      <a href="#contact" class="inline-block px-6 py-3 ${activeTheme.accentBtn} font-bold rounded-xl shadow-lg">Get Started Today</a>
    </div>
    <div>
      <img src="${heroImage}" alt="${siteName}" class="rounded-2xl shadow-2xl border border-white/10 w-full object-cover h-96">
    </div>
  </section>

  <!-- Products / Services -->
  <section id="services" class="py-16 px-8 max-w-6xl mx-auto space-y-8">
    <h3 class="text-2xl font-bold text-white text-center">${currentIndustry.itemsLabel}</h3>
    <div class="grid md:grid-cols-3 gap-6">
      ${productsList.map(p => `
        <div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-4 space-y-3">
          <img src="${p.image}" class="w-full h-40 object-cover rounded-xl" alt="${p.title}">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-indigo-300">${p.category}</span>
            <span class="text-xs font-bold text-emerald-400">${p.price}</span>
          </div>
          <h4 class="font-bold text-white text-base">${p.title}</h4>
          <p class="text-xs text-slate-400">${p.description}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <footer class="bg-black/80 border-t border-white/10 py-8 text-center text-xs text-slate-400">
    <p>&copy; 2026 ${siteName}. All Rights Reserved. Powered by MarketBazaar OS.</p>
  </footer>
</body>
</html>`;

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">
      {/* Top OS Header Bar */}
      <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-3.5 flex items-center justify-center text-white shadow-xl">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
                AI Website Builder OS
              </span>
              <span className="text-xs text-slate-400 font-mono">Tenant: {tenantId}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Interactive Enterprise Website Studio</h2>
            <p className="text-xs text-slate-300">
              Select company niche presets, color palettes, upload catalog products, and publish live in 1-click.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAISynthesize}
            disabled={isGeneratingAI}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg border border-purple-400/30 flex items-center gap-2 transition cursor-pointer"
          >
            {isGeneratingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-amber-300" />}
            {isGeneratingAI ? 'AI Synthesizing...' : 'AI Auto-Craft Copy'}
          </button>

          <button
            onClick={() => setShowCodeModal(true)}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-2 transition cursor-pointer"
          >
            <Code className="w-4 h-4 text-cyan-400" /> Export Code
          </button>

          <button
            onClick={handlePublishSite}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 border border-emerald-400/30 flex items-center gap-2 transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" /> Publish Live
          </button>
        </div>
      </div>

      {/* Published Alert Notification */}
      {isPublished && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Website Live On MarketBazaar Cloud Network!</p>
              <p className="text-emerald-200 font-mono mt-0.5">{publishedUrl}</p>
            </div>
          </div>
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#040D0A] font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Visit Site
          </a>
        </div>
      )}

      {/* Main Studio Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Customizer Toolbar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 bg-[#0D0E17] border border-white/10 p-1.5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'preset' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" /> Niche Preset
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'theme' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Palette
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'content' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Copy
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'products' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Catalog ({productsList.length})
            </button>
          </div>

          {/* TAB 1: Company / Niche Presets */}
          {activeTab === 'preset' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-400" />
                  Select Business Niche
                </h3>
                <span className="text-[10px] font-mono text-slate-400">{INDUSTRY_PRESETS.length} Presets Available</span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {INDUSTRY_PRESETS.map((preset) => {
                  const IconComp = preset.icon;
                  const isSelected = selectedIndustryId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectIndustry(preset)}
                      className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-500 text-white shadow-lg'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">{preset.name}</p>
                          <p className="text-[10px] text-slate-400">{preset.badge}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Color Palette */}
          {activeTab === 'theme' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                Select Color Scheme
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {Object.values(COLOR_THEMES).map((theme) => {
                  const isSelected = activeThemeKey === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setActiveThemeKey(theme.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-indigo-500 ring-2 ring-indigo-500/50 text-white'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${theme.accentBtn}`} />
                        <span className="font-bold text-xs truncate">{theme.name}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Copy & Branding Details */}
          {activeTab === 'content' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl font-sans">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Customize Branding & Copy
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Business Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Hero Title Headline</label>
                  <textarea
                    rows={2}
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Hero Subtitle</label>
                  <textarea
                    rows={3}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Unsplash Hero Image URL</label>
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  />
                </div>

                <div className="border-t border-white/10 pt-3">
                  <label className="block text-slate-400 mb-1 font-semibold">Contact Address & Phone</label>
                  <input
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 mb-2"
                  />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Products / Catalog Manager */}
          {activeTab === 'products' && (
            <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl font-sans">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  {currentIndustry.itemsLabel}
                </h3>
                <button
                  onClick={() => setIsAddingProductModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {productsList.map((prod) => (
                  <div key={prod.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                    <img src={prod.image} alt={prod.title} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs truncate">{prod.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="text-emerald-400 font-bold">{prod.price}</span>
                        <span>•</span>
                        <span>{prod.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(prod.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Live Viewport Sandbox (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Viewport Control Top Bar */}
          <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-3 text-xs font-mono text-slate-400">
                Live Rendering Sandbox: <strong className="text-indigo-300">{siteName.toLowerCase().replace(/[^a-z0-9]/g, '')}.omnicore.site</strong>
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

          {/* Rendered Live Website Frame */}
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
              {/* LIVE WEBSITE BODY */}
              <div className="min-h-full bg-[#07080E] text-slate-100 font-sans selection:bg-indigo-500/30">
                {/* Header Navbar */}
                <header className={`${activeTheme.headerBg} border-b border-white/10 sticky top-0 z-40 px-6 py-4 flex items-center justify-between backdrop-blur-md`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${activeTheme.accentBtn} flex items-center justify-center font-black text-sm`}>
                      {siteName.charAt(0)}
                    </div>
                    <span className="font-display font-extrabold text-base text-white">{siteName}</span>
                  </div>

                  <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
                    <a href="#hero" className="hover:text-white transition">Home</a>
                    <a href="#features" className="hover:text-white transition">Why Us</a>
                    <a href="#catalog" className="hover:text-white transition">{currentIndustry.itemsLabel}</a>
                    <a href="#about" className="hover:text-white transition">About</a>
                    <a href="#contact" className="hover:text-white transition">Contact</a>
                  </nav>

                  <a
                    href="#contact"
                    className={`px-4 py-2 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow-md transition`}
                  >
                    Contact Us
                  </a>
                </header>

                {/* Hero Section */}
                <section id="hero" className={`relative py-16 px-6 md:px-12 bg-gradient-to-b ${activeTheme.heroGradient} overflow-hidden`}>
                  <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                      <span className={`inline-block px-3.5 py-1 text-xs font-bold rounded-full border ${activeTheme.badgeBg}`}>
                        {currentIndustry.badge}
                      </span>
                      <h1 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight">
                        {heroHeadline}
                      </h1>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {heroSubtitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <a
                          href="#contact"
                          className={`px-6 py-3 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition`}
                        >
                          Book Appointment
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                          href="#catalog"
                          className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 transition"
                        >
                          View {currentIndustry.itemsLabel}
                        </a>
                      </div>
                    </div>

                    <div className="relative">
                      <img
                        src={heroImage}
                        alt={siteName}
                        className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover h-80"
                      />
                      <div className="absolute -bottom-4 -left-4 bg-[#0D0E17]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <div className="text-[11px]">
                          <p className="font-bold text-white">Verified Enterprise Service</p>
                          <p className="text-slate-400">100% Guaranteed Satisfaction</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Key Features Grid */}
                <section id="features" className="py-12 px-6 md:px-12 max-w-5xl mx-auto space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="font-display font-extrabold text-xl text-white">Why Choose {siteName}?</h3>
                    <p className="text-xs text-slate-400">Our core commitments and operational standards</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentIndustry.features.map((feat, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                        <div className={`w-8 h-8 rounded-lg ${activeTheme.badgeBg} flex items-center justify-center font-bold text-xs`}>
                          0{idx + 1}
                        </div>
                        <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{feat.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Products & Services Catalog Section */}
                <section id="catalog" className="py-12 px-6 md:px-12 bg-white/5 border-y border-white/10">
                  <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className={`text-xs font-mono font-bold ${activeTheme.accentText} uppercase`}>
                          Featured Offerings
                        </span>
                        <h3 className="font-display font-extrabold text-2xl text-white mt-1">
                          {currentIndustry.itemsLabel}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {productsList.length} Items Available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {productsList.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-[#0D0E17] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition flex flex-col justify-between group"
                        >
                          <div>
                            <div className="relative h-44 overflow-hidden">
                              <img
                                src={prod.image}
                                alt={prod.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              />
                              <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">
                                {prod.badge}
                              </span>
                            </div>

                            <div className="p-4 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-mono">{prod.category}</span>
                                <span className={`font-bold text-sm ${activeTheme.accentText}`}>{prod.price}</span>
                              </div>
                              <h4 className="font-bold text-white text-sm">{prod.title}</h4>
                              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                                {prod.description}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 pt-0">
                            <a
                              href="#contact"
                              className={`w-full py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition`}
                            >
                              Inquire Now
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* About & Contact Section */}
                <section id="contact" className="py-12 px-6 md:px-12 max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <span className={`text-xs font-mono font-bold ${activeTheme.accentText} uppercase`}>
                        Get in Touch
                      </span>
                      <h3 className="font-display font-extrabold text-2xl text-white mt-1">
                        Contact Us Today
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {aboutText}
                      </p>
                    </div>

                    <div className="space-y-3 text-xs text-slate-300 font-sans">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{contactAddress}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{contactEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Contact Form Simulator */}
                  <div className="bg-[#0D0E17] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                    <h4 className="font-bold text-white text-sm">Send a Direct Message</h4>
                    {formSubmitted ? (
                      <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-4 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p className="font-bold text-white text-xs">Message Received!</p>
                        <p className="text-[11px] text-emerald-200">Our executive team will contact you shortly.</p>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setFormSubmitted(true);
                        }}
                        className="space-y-3 text-xs"
                      >
                        <div>
                          <input
                            type="text"
                            placeholder="Your Full Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <textarea
                            rows={3}
                            placeholder="How can we assist you?"
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className={`w-full py-2.5 ${activeTheme.accentBtn} font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer`}
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Request
                        </button>
                      </form>
                    )}
                  </div>
                </section>

                {/* Footer */}
                <footer className="bg-black/90 border-t border-white/10 py-8 px-6 text-center text-xs text-slate-400 space-y-2">
                  <p className="font-bold text-slate-200">{siteName}</p>
                  <p>&copy; 2026 {siteName}. Powered by MarketBazaar OS Platform.</p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Catalog Item */}
      {isAddingProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0E17] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display font-bold text-base text-white">Add Product / Service Item</h3>
              <button onClick={() => setIsAddingProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Health Scan"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Price Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. $49 or $25/mo"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Diagnostics"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Unsplash Image URL</label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of this product or service..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                Save To Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Export Code */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0E17] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-white">Export Website Code</h3>
              </div>
              <button onClick={() => setShowCodeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-slate-950 p-4 rounded-xl border border-white/10 max-h-96 overflow-y-auto font-mono text-xs text-slate-300">
              <pre>{generatedHtmlCode}</pre>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Ready to drop into any server or host.</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedHtmlCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied to Clipboard!' : 'Copy HTML5 Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
