import { CustomFeatureTile, CustomLandingData, CustomProductTile, TenantBranding } from './tenantBranding';

export type BusinessType = 
  | 'hotel_resort'
  | 'restaurant'
  | 'tours_travel'
  | 'retail_commerce'
  | 'healthcare_clinic'
  | 'fitness_gym'
  | 'real_estate'
  | 'education_academy'
  | 'tech_saas'
  | 'agency_enterprise';

export interface BusinessTemplateDefinition {
  id: BusinessType;
  name: string;
  badge: string;
  iconName: string;
  category: string;
  description: string;
  themeId: string;
  primaryColor: string;
  accentColor: string;
  recommendedModules: string[];
  defaultHeroTitle: string;
  defaultHeroSubtitle: string;
  defaultHeroImageUrl: string;
  defaultCtaButtonText: string;
  defaultAboutText: string;
  defaultFeatures: CustomFeatureTile[];
  defaultItems: CustomProductTile[];
}

export const BUSINESS_TEMPLATES: Record<BusinessType, BusinessTemplateDefinition> = {
  hotel_resort: {
    id: 'hotel_resort',
    name: 'Hotel & Luxury Resort',
    badge: 'Hospitality & Stays',
    iconName: 'Hotel',
    category: 'Hospitality',
    description: 'Suites, oceanfront villas, room reservation folios, concierge services, and gourmet in-room dining.',
    themeId: 'lux_gold',
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    recommendedModules: ['hotel', 'website', 'marketing', 'finance'],
    defaultHeroTitle: 'World-Class Hospitality & Luxury Stay',
    defaultHeroSubtitle: 'Immerse yourself in tranquil comfort, premium suites, signature wellness amenities, and 24/7 dedicated butler service.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'Explore Rooms & Suites',
    defaultAboutText: 'Crafted with timeless elegance and modern prestige, our luxury resort delivers personalized guest experiences, panoramic vistas, and unmatched attention to detail from check-in to departure.',
    defaultFeatures: [
      { title: 'Presidential Suites', desc: 'Private balconies, plush king bedding, and jacuzzi plunge pools.', badge: 'Luxury' },
      { title: '24/7 Concierge & Butler', desc: 'Dedicated personal assistance for airport transfers and tours.', badge: 'Service' },
      { title: 'Wellness Spa & Dining', desc: 'Holistic therapies, infinity pool, and 5-star culinary mastery.', badge: 'Amenities' }
    ],
    defaultItems: [
      {
        id: 'room-1',
        title: 'Presidential Panorama Ocean Suite',
        category: 'Luxury Suite',
        price: '$350',
        unit: '/ night',
        rating: '4.95',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        badge: 'Most Popular',
        description: 'Expansive master suite featuring panoramic ocean views, private jacuzzi balcony, king bed, and complimentary executive lounge access.',
        features: ['King Bed', 'Jacuzzi Balcony', 'Free Gourmet Breakfast', 'High-Speed Wi-Fi', '24/7 Butler']
      },
      {
        id: 'room-2',
        title: 'Executive Royal Skyline Room',
        category: 'Executive Room',
        price: '$220',
        unit: '/ night',
        rating: '4.88',
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        badge: 'High Demand',
        description: 'Elegantly appointed executive room with plush bedding, private workspace, espresso machine, and city skyline view.',
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
        badge: 'Exclusive',
        description: 'Two-bedroom secluded sanctuary with private plunge pool, outdoor dining gazebo, kitchenette, and lush botanical garden enclosure.',
        features: ['2 King Bedrooms', 'Private Pool', 'Gazebo Dining', 'Kitchenette', 'Airport Transfer']
      },
      {
        id: 'room-4',
        title: 'Deluxe Courtyard King Suite',
        category: 'Deluxe Room',
        price: '$160',
        unit: '/ night',
        rating: '4.82',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        badge: 'Best Value',
        description: 'Cozy, modern retreat overlooking the serene central courtyard. Perfect for business travelers and weekend getaways.',
        features: ['Queen Bed', 'Courtyard View', 'Rain Shower', 'Complimentary Minibar', 'Air Conditioning']
      }
    ]
  },

  restaurant: {
    id: 'restaurant',
    name: 'Restaurant, Cafe & Dining',
    badge: 'Artisanal Dining & Bar',
    iconName: 'Utensils',
    category: 'Dining & Food',
    description: 'Live food menu, chef specials, online table reservations, craft cocktails, and kitchen display orders.',
    themeId: 'nordic_emerald',
    primaryColor: '#059669',
    accentColor: '#10b981',
    recommendedModules: ['restaurant', 'website', 'marketing', 'finance'],
    defaultHeroTitle: 'Artisanal Dining & Gourmet Cuisine',
    defaultHeroSubtitle: 'Experience farm-to-table freshness, signature wood-fired recipes, and unforgettable gastronomic hospitality every single day.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'View Gourmet Menu & Reserve',
    defaultAboutText: 'Rooted in a passion for authentic culinary craftsmanship, our kitchen sources organic seasonal ingredients to prepare mouthwatering dishes that celebrate flavor, heritage, and modern creativity.',
    defaultFeatures: [
      { title: 'Farm-to-Table Fresh', desc: '100% locally sourced organic produce and premium cuts.', badge: 'Fresh' },
      { title: 'Chef Special Recipes', desc: 'Signature handcrafted entrees prepared with culinary precision.', badge: 'Gourmet' },
      { title: 'Instant Online Booking', desc: 'Reserve your dining table or VIP lounge in real time.', badge: 'Fast' }
    ],
    defaultItems: [
      {
        id: 'menu-1',
        title: 'Wood-Fired Prime Ribeye Steak',
        category: 'Main Course',
        price: '$38',
        unit: '',
        rating: '4.98',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        badge: 'Chef Special',
        description: 'Aged 30 days, seared over oak wood charcoal, served with roasted garlic butter, rosemary potatoes, and chimichurri.',
        features: ['30-Day Dry Aged', 'Charcoal Wood-Fired', 'Gluten Free Option']
      },
      {
        id: 'menu-2',
        title: 'Handcrafted Truffle Fettuccine',
        category: 'Main Course',
        price: '$26',
        unit: '',
        rating: '4.92',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
        badge: 'Vegetarian',
        description: 'Fresh artisanal pasta tossed in black truffle cream, 24-month Parmigiano-Reggiano, wild forest mushrooms, and herbs.',
        features: ['Fresh Handmade Pasta', 'Black Truffle Cream', 'Parmigiano-Reggiano']
      },
      {
        id: 'menu-3',
        title: 'Artisanal Burrata & Heirloom Bruschetta',
        category: 'Starters',
        price: '$16',
        unit: '',
        rating: '4.89',
        image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb16431?auto=format&fit=crop&w=800&q=80',
        badge: 'Starter',
        description: 'Creamy Italian burrata cheese, organic vine-ripened tomatoes, fresh basil pesto, balsamic reduction on toasted sourdough.',
        features: ['Italian Burrata', 'Organic Heirloom Tomatoes', 'House Basil Pesto']
      },
      {
        id: 'menu-4',
        title: 'Crispy Pan-Seared Atlantic Salmon',
        category: 'Main Course',
        price: '$32',
        unit: '',
        rating: '4.94',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
        badge: 'Seafood',
        description: 'Sustainably sourced salmon fillet with lemon herb risotto, glazed asparagus spears, and citrus butter glaze.',
        features: ['Wild Atlantic Salmon', 'Lemon Herb Risotto', 'Rich in Omega-3']
      },
      {
        id: 'menu-5',
        title: 'Dark Chocolate Lava Cake & Gelato',
        category: 'Desserts',
        price: '$12',
        unit: '',
        rating: '4.96',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        badge: 'Sweet Treat',
        description: 'Warm molten Valrhona chocolate cake paired with Madagascar vanilla bean gelato and fresh raspberry reduction.',
        features: ['Valrhona Chocolate', 'Madagascar Vanilla Gelato', 'Fresh Berries']
      }
    ]
  },

  tours_travel: {
    id: 'tours_travel',
    name: 'Tours & Travel Agency',
    badge: 'Expeditions & Escapes',
    iconName: 'Compass',
    category: 'Travel & Tours',
    description: 'Curated holiday packages, trekking itineraries, private guide dispatch, and adventure bookings.',
    themeId: 'vibrant_sunset',
    primaryColor: '#e11d48',
    accentColor: '#f97316',
    recommendedModules: ['tours', 'website', 'marketing', 'finance'],
    defaultHeroTitle: 'Unforgettable Travel & Trekking Escapes',
    defaultHeroSubtitle: 'Discover bucket-list destinations with certified guides, seamless flight/hotel logistics, and personalized itineraries.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'Explore Tour Packages & Book',
    defaultAboutText: 'With over a decade of worldwide adventure expertise, we design bespoke journeys that connect travelers with breathtaking landscapes, rich cultural heritages, and authentic local experiences.',
    defaultFeatures: [
      { title: 'Certified Local Guides', desc: 'Expert mountaineers and cultural historians for complete safety.', badge: 'Expert' },
      { title: 'All-Inclusive Packages', desc: 'Lodging, transport, permits, and meals fully covered.', badge: 'Hassle-Free' },
      { title: 'Flexible Booking Guarantee', desc: 'Free reschedule options and 24/7 traveler support desk.', badge: 'Guaranteed' }
    ],
    defaultItems: [
      {
        id: 'tour-1',
        title: 'Himalayan Sunrise & Heritage Cultural Expedition',
        category: 'Adventure & Culture',
        price: '$850',
        unit: '/ person',
        rating: '4.98',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        badge: 'Best Seller',
        description: '5 Days / 4 Nights immersive journey visiting ancient heritage sites, scenic mountain viewpoints, luxury resort stays, and private guide services.',
        features: ['5 Days / 4 Nights', 'All Resort Stays Included', 'Private Tour Guide', 'Airport Pickup & Drop']
      },
      {
        id: 'tour-2',
        title: 'Tropical Beach & Coral Island Escape',
        category: 'Leisure & Beach',
        price: '$1,200',
        unit: '/ person',
        rating: '4.95',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        badge: 'Luxury',
        description: '7 Days / 6 Nights luxury island hop with speedboat transfers, coral reef snorkeling trips, sunset yacht dinners, and beachfront villa lodging.',
        features: ['7 Days / 6 Nights', 'Beachfront Villa', 'Sunset Yacht Cruise', 'Snorkeling Gear Included']
      },
      {
        id: 'tour-3',
        title: 'Alpine Valley Trekking & Wildlife Safari',
        category: 'Eco Trekking',
        price: '$620',
        unit: '/ person',
        rating: '4.91',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        badge: 'Eco Tour',
        description: '4 Days / 3 Nights guided mountain trail trek through national parks, wildlife viewing excursions, bonfire dinners, and authentic lodge stays.',
        features: ['4 Days / 3 Nights', 'Certified Trekking Guide', 'All Meals Included', 'Permits Covered']
      }
    ]
  },

  retail_commerce: {
    id: 'retail_commerce',
    name: 'Retail & E-Commerce Store',
    badge: 'Curated Products',
    iconName: 'ShoppingBag',
    category: 'Commerce & Retail',
    description: 'Product catalogs, instant shopping cart, inventory variants, customer reviews, and payment checkout.',
    themeId: 'clean_saas',
    primaryColor: '#4f46e5',
    accentColor: '#06b6d4',
    recommendedModules: ['ecommerce', 'website', 'marketing', 'finance'],
    defaultHeroTitle: 'Curated Lifestyle Products & Craft',
    defaultHeroSubtitle: 'Explore our handpicked collection of artisan stoneware, lifestyle goods, and premium home essentials delivered directly to your door.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'Shop New Arrivals',
    defaultAboutText: 'We craft and curate everyday luxury essentials engineered for durability, timeless aesthetic beauty, and sustainable everyday living.',
    defaultFeatures: [
      { title: 'Artisan Quality', desc: 'Masterfully built with eco-friendly sustainable materials.', badge: 'Premium' },
      { title: 'Fast Express Delivery', desc: 'Tracked shipping with secure protective packaging.', badge: 'Fast' },
      { title: '30-Day Guarantee', desc: 'No-hassle returns and dedicated customer care.', badge: 'Safe' }
    ],
    defaultItems: [
      {
        id: 'item-1',
        title: 'Handcrafted Ceramic Artisan Vase',
        category: 'Home Decor',
        price: '$85',
        unit: '',
        rating: '4.90',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        badge: 'Top Pick',
        description: 'Wheel-thrown stoneware vase with natural matte glaze finish. Designed for modern living spaces and dried botanical arrangements.',
        features: ['Handmade Stoneware', 'Matte Glaze Finish', 'In Stock']
      },
      {
        id: 'item-2',
        title: 'Minimalist Matte Tableware Collection',
        category: 'Kitchen & Dining',
        price: '$120',
        unit: '',
        rating: '4.93',
        image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
        badge: '12-Piece Set',
        description: 'Complete 12-piece dinner set including plates, bowls, and mugs in earthy slate charcoal and natural clay tones.',
        features: ['Dishwasher Safe', 'Microwave Safe', '12-Piece Set']
      },
      {
        id: 'item-3',
        title: 'Organic Botanical Scented Candle',
        category: 'Aromatherapy',
        price: '$34',
        unit: '',
        rating: '4.87',
        image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
        badge: 'Eco Soy',
        description: '100% pure soy wax candle infused with wild cedarwood, lavender, and amber essential oils. 60-hour clean burn time.',
        features: ['Pure Soy Wax', 'Essential Oils', '60-Hour Burn']
      }
    ]
  },

  healthcare_clinic: {
    id: 'healthcare_clinic',
    name: 'Healthcare & Medical Clinic',
    badge: 'Clinical Care',
    iconName: 'HeartPulse',
    category: 'Healthcare',
    description: 'Doctor consultations, medical services, digital patient appointments, diagnostic packages, and pharmacy info.',
    themeId: 'clean_saas',
    primaryColor: '#0284c7',
    accentColor: '#06b6d4',
    recommendedModules: ['office_hr', 'website', 'marketing', 'finance'],
    defaultHeroTitle: 'Compassionate Care & Advanced Medicine',
    defaultHeroSubtitle: 'Providing state-of-the-art diagnostic care, specialist appointments, and personalized wellness plans for your whole family.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'Book Medical Consultation',
    defaultAboutText: 'Our board-certified medical physicians and health specialists are dedicated to delivering precision diagnostics, compassionate patient care, and preventive health solutions.',
    defaultFeatures: [
      { title: 'Board-Certified Doctors', desc: 'Experienced specialists across cardiology, pediatrics & wellness.', badge: 'Certified' },
      { title: 'Advanced Diagnostics', desc: 'Same-day lab tests and digital health record access.', badge: 'Modern' },
      { title: 'Virtual & In-Person Visits', desc: 'Telehealth video consultations or visit our clinical center.', badge: '24/7' }
    ],
    defaultItems: [
      {
        id: 'med-1',
        title: 'Comprehensive Health & Executive Checkup',
        category: 'Preventive Care',
        price: '$199',
        unit: '',
        rating: '4.97',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
        badge: 'Recommended',
        description: 'Complete 45-point health screening including blood panel, ECG, cholesterol, liver function, and doctor consultation.',
        features: ['Full Blood Panel', 'ECG Screening', 'Doctor Review', 'Digital Report']
      },
      {
        id: 'med-2',
        title: 'Specialist Cardiology & Heart Wellness',
        category: 'Cardiology',
        price: '$140',
        unit: '',
        rating: '4.95',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
        badge: 'Specialist',
        description: 'In-depth cardiovascular consultation, stress test evaluation, and personalized heart health lifestyle plan.',
        features: ['Cardiologist Consult', 'Stress Test Analysis', 'Lifestyle Blueprint']
      },
      {
        id: 'med-3',
        title: 'Dental Whitening & Oral Hygiene Spa',
        category: 'Dental Care',
        price: '$95',
        unit: '',
        rating: '4.89',
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
        badge: 'Popular',
        description: 'Professional ultrasonic dental scaling, enamel polishing, fluoride protection, and cosmetic whitening consultation.',
        features: ['Ultrasonic Cleaning', 'Enamel Polish', 'Digital X-Ray Review']
      }
    ]
  },

  fitness_gym: {
    id: 'fitness_gym',
    name: 'Fitness Gym & Wellness Studio',
    badge: 'Fitness & Health',
    iconName: 'Dumbbell',
    category: 'Fitness & Sports',
    description: 'Membership plans, personal trainer sessions, group fitness classes, nutrition plans, and gym passes.',
    themeId: 'synthwave_neon',
    primaryColor: '#8b5cf6',
    accentColor: '#ec4899',
    recommendedModules: ['office_hr', 'website', 'marketing', 'finance'],
    defaultHeroTitle: 'Transform Your Body & Elevate Your Life',
    defaultHeroSubtitle: 'State-of-the-art gym equipment, world-class personal trainers, dynamic group fitness classes, and tailored nutrition coaching.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'Start Free 7-Day Trial Pass',
    defaultAboutText: 'We build empowering, results-driven fitness spaces equipped with cutting-edge strength machines, recovery saunas, and energetic coaches committed to helping you crush your goals.',
    defaultFeatures: [
      { title: 'Elite Training Staff', desc: 'Certified trainers providing personalized workout blueprints.', badge: 'Coaching' },
      { title: '24/7 Member Access', desc: 'Secure biometric access to train whenever your schedule permits.', badge: '24/7' },
      { title: 'Recovery & Saunas', desc: 'Infrared saunas, cold plunge tubs, and massage therapy.', badge: 'Recovery' }
    ],
    defaultItems: [
      {
        id: 'fit-1',
        title: 'All-Access Elite Monthly Membership',
        category: 'Membership',
        price: '$79',
        unit: '/ mo',
        rating: '4.96',
        image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
        badge: 'Top Pick',
        description: 'Unlimited access to all gym floors, free weight zones, group HIIT classes, recovery sauna, and locker amenities.',
        features: ['24/7 Floor Access', 'All Group Classes', 'Sauna & Locker', 'Guest Pass (1/mo)']
      },
      {
        id: 'fit-2',
        title: '1-on-1 Personal Training Masterclass',
        category: 'Personal Training',
        price: '$240',
        unit: '/ 5 pack',
        rating: '4.99',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
        badge: 'High Impact',
        description: 'Five 60-minute private coaching sessions with body composition scanning and customized weekly nutrition guidance.',
        features: ['5 Private Sessions', 'Body Composition Scan', 'Custom Nutrition Plan']
      },
      {
        id: 'fit-3',
        title: 'Dynamic Yoga & Breathwork Immersion',
        category: 'Wellness Class',
        price: '$50',
        unit: '/ mo',
        rating: '4.91',
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
        badge: 'Mind & Body',
        description: 'Weekly guided vinyasa flow, restorative sound healing, and breathwork sessions in our serene studio.',
        features: ['Mat & Props Provided', 'Sound Bath Meditation', 'All Skill Levels']
      }
    ]
  },

  real_estate: {
    id: 'real_estate',
    name: 'Real Estate & Property',
    badge: 'Properties & Realty',
    iconName: 'Building',
    category: 'Real Estate',
    description: 'Luxury home listings, commercial properties, virtual 3D tours, agent consultation, and property valuation.',
    themeId: 'lux_gold',
    primaryColor: '#0f172a',
    accentColor: '#38bdf8',
    recommendedModules: ['office_hr', 'website', 'marketing', 'finance'],
    defaultHeroTitle: 'Curated Luxury Residences & Prime Estates',
    defaultHeroSubtitle: 'Browse premier architectural homes, penthouse apartments, and high-yield commercial investment properties.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'Browse Exclusive Listings',
    defaultAboutText: 'We specialize in luxury property acquisition, high-return commercial portfolios, and architectural residences with complete discretion and premier market analysis.',
    defaultFeatures: [
      { title: 'Exclusive Portfolio', desc: 'Access off-market prime properties and architectural masterpieces.', badge: 'Luxury' },
      { title: 'Virtual 3D Tours', desc: 'Explore high-definition 360-degree interactive floorplans online.', badge: 'Tech' },
      { title: 'Investment Advisory', desc: 'Comprehensive yield analysis and capital appreciation forecasting.', badge: 'Advisory' }
    ],
    defaultItems: [
      {
        id: 'prop-1',
        title: 'Modern Sunset Hills Architectural Villa',
        category: 'Luxury Villa',
        price: '$2,450,000',
        unit: '',
        rating: '4.98',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        badge: 'Featured',
        description: '4-bedroom modern smart home with infinity pool, panoramic mountain views, wine cellar, and 3-car garage.',
        features: ['4 Beds / 5 Baths', '4,800 Sq Ft', 'Infinity Pool', 'Smart Home Automation']
      },
      {
        id: 'prop-2',
        title: 'Skyline Penthouse with Private Terrace',
        category: 'Penthouse',
        price: '$1,850,000',
        unit: '',
        rating: '4.94',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        badge: 'City Center',
        description: 'Floor-to-ceiling glass penthouse with wrap-around rooftop terrace, private elevator, and concierge service.',
        features: ['3 Beds / 3.5 Baths', '3,200 Sq Ft', 'Private Elevator', '24/7 Doorman']
      }
    ]
  },

  education_academy: {
    id: 'education_academy',
    name: 'Education, Academy & Institutes',
    badge: 'Courses & Mastery',
    iconName: 'GraduationCap',
    category: 'Education',
    description: 'Online learning courses, interactive bootcamps, instructor certifications, student enrollment, and workshops.',
    themeId: 'clean_saas',
    primaryColor: '#2563eb',
    accentColor: '#38bdf8',
    recommendedModules: ['office_hr', 'website', 'marketing', 'finance'],
    defaultHeroTitle: 'Master High-Demand Skills with Industry Leaders',
    defaultHeroSubtitle: 'Accelerate your career through interactive hands-on bootcamps, certified masterclasses, and direct mentor guidance.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'Explore Course Catalog & Enroll',
    defaultAboutText: 'Our academy empowers students, working professionals, and entrepreneurs with practical, real-world curriculums designed to unlock career growth and creative mastery.',
    defaultFeatures: [
      { title: 'Industry-Led Curriculum', desc: 'Taught by seasoned practitioners from top global companies.', badge: 'Practical' },
      { title: 'Certified Credentials', desc: 'Earn verifiable digital certificates to showcase on LinkedIn.', badge: 'Certified' },
      { title: 'Direct Mentor Reviews', desc: 'Get 1-on-1 code and design reviews on all portfolio projects.', badge: '1-on-1' }
    ],
    defaultItems: [
      {
        id: 'edu-1',
        title: 'Full-Stack AI Software Engineering Bootcamp',
        category: 'Software & AI',
        price: '$499',
        unit: '',
        rating: '4.97',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        badge: 'Best Seller',
        description: '12-week comprehensive program covering modern TypeScript, React, Cloud APIs, Large Language Models, and scalable backend architectures.',
        features: ['12-Week Intensive', '10 Portfolio Projects', '1-on-1 Mentorship', 'Job Placement Support']
      },
      {
        id: 'edu-2',
        title: 'UI/UX Design Systems & Product Strategy',
        category: 'Design & UX',
        price: '$349',
        unit: '',
        rating: '4.91',
        image: 'https://images.unsplash.com/photo-1581291518655-9523c932deda?auto=format&fit=crop&w=800&q=80',
        badge: 'Interactive',
        description: 'Master Figma components, micro-interactions, responsive spatial layout, and user research frameworks.',
        features: ['Figma Mastery', 'Design System Architecture', 'User Testing Labs']
      }
    ]
  },

  tech_saas: {
    id: 'tech_saas',
    name: 'Technology, Software & SaaS',
    badge: 'AI Cloud Platform',
    iconName: 'Zap',
    category: 'Technology & SaaS',
    description: 'Software platforms, cloud API services, AI automation pipelines, subscription pricing tiers, and developer documentation.',
    themeId: 'cyber_obsidian',
    primaryColor: '#6366f1',
    accentColor: '#06b6d4',
    recommendedModules: ['website', 'marketing', 'finance', 'office_hr'],
    defaultHeroTitle: 'Autonomous AI Operating System for Enterprise',
    defaultHeroSubtitle: 'Streamline mission-critical workflows, automate multi-channel campaigns, and deploy intelligent cloud microservices in seconds.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'Start 14-Day Free Cloud Trial',
    defaultAboutText: 'We build enterprise-grade software infrastructure engineered for high-concurrency cloud deployments, zero-trust RBAC security, and real-time AI automation.',
    defaultFeatures: [
      { title: 'Sub-second AI Processing', desc: 'State-of-the-art model inference with zero latency overhead.', badge: 'Fast' },
      { title: 'Multi-Tenant Isolation', desc: 'Granular workspace partitioning with enterprise encryption.', badge: 'Secure' },
      { title: 'API & Webhook Engine', desc: 'Seamlessly sync with your existing CRM and data pipelines.', badge: 'Scalable' }
    ],
    defaultItems: [
      {
        id: 'tech-1',
        title: 'Enterprise Growth Cloud Suite',
        category: 'Subscription',
        price: '$249',
        unit: '/ mo',
        rating: '4.99',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        badge: 'Top Seller',
        description: 'Complete access to AI marketing automation, lead scoring CRM, automated WhatsApp bots, and team RBAC.',
        features: ['Unlimited AI Generations', '50,000 API Requests/mo', 'Dedicated Account Manager', 'Custom Domain']
      },
      {
        id: 'tech-2',
        title: 'Autonomous SDR & Lead Discovery Engine',
        category: 'AI Tool',
        price: '$129',
        unit: '/ mo',
        rating: '4.93',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80',
        badge: 'High Impact',
        description: 'Scrape, enrich, score, and automatically dispatch personalized multi-channel outreach sequences to verified decision-makers.',
        features: ['Verified Email Discovery', 'Automated Sequence Engine', 'CRM Bi-directional Sync']
      }
    ]
  },

  agency_enterprise: {
    id: 'agency_enterprise',
    name: 'Corporate, Agency & Professional Services',
    badge: 'Enterprise Solutions',
    iconName: 'Briefcase',
    category: 'Corporate & Consulting',
    description: 'Strategic consulting, brand identity, digital transformation, custom development, and corporate solutions.',
    themeId: 'cyber_obsidian',
    primaryColor: '#4f46e5',
    accentColor: '#38bdf8',
    recommendedModules: ['website', 'marketing', 'office_hr', 'finance'],
    defaultHeroTitle: 'Excellence in Enterprise Solutions & Strategy',
    defaultHeroSubtitle: 'Delivering premier business consulting, digital transformation, and industry-leading performance standards for forward-thinking brands.',
    defaultHeroImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    defaultCtaButtonText: 'Request Executive Proposal',
    defaultAboutText: 'We partner with enterprise leaders and high-growth organizations to architect resilient business models, optimize operational efficiency, and capture market leadership.',
    defaultFeatures: [
      { title: 'Strategic Advisory', desc: 'Proven business execution frameworks tailored to your market.', badge: 'Strategy' },
      { title: 'End-to-End Execution', desc: 'From initial roadmap to full production rollout and scaling.', badge: 'Turnkey' },
      { title: 'Global Compliance', desc: 'Enterprise data sovereignty and rigorous security auditing.', badge: 'Secure' }
    ],
    defaultItems: [
      {
        id: 'corp-1',
        title: 'Digital Transformation & Cloud Modernization',
        category: 'Consulting',
        price: '$2,500',
        unit: '',
        rating: '4.98',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        badge: 'Enterprise',
        description: 'Comprehensive audit and re-architecture of legacy enterprise software into scalable, secure cloud-native platforms.',
        features: ['Architecture Blueprint', 'Security & Compliance Audit', 'Full Implementation Plan']
      },
      {
        id: 'corp-2',
        title: 'Omnichannel Brand Identity & Growth Package',
        category: 'Creative & Growth',
        price: '$1,200',
        unit: '',
        rating: '4.95',
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
        badge: 'Turnkey',
        description: 'End-to-end brand identity design, marketing messaging guidelines, landing page assets, and go-to-market playbook.',
        features: ['Brand Style Guide', 'High-Converting Copy', 'Multi-channel Visual Assets']
      }
    ]
  }
};

/**
 * Generate a complete TenantBranding initialized for a specific businessType
 */
export function generateBusinessDefaultBranding(
  tenantId: string,
  companyName: string,
  businessType: BusinessType = 'retail_commerce',
  domain?: string,
  supportEmail?: string
): TenantBranding {
  const template = BUSINESS_TEMPLATES[businessType] || BUSINESS_TEMPLATES.agency_enterprise;
  
  const customLandingData: CustomLandingData = {
    heroTitle: template.defaultHeroTitle,
    heroSubtitle: template.defaultHeroSubtitle,
    heroImageUrl: template.defaultHeroImageUrl,
    ctaButtonText: template.defaultCtaButtonText,
    aboutText: template.defaultAboutText,
    showcaseFeatures: template.defaultFeatures,
    productsCatalog: template.defaultItems
  };

  return {
    tenantId,
    businessType,
    companyName: companyName || template.name,
    tagline: template.description,
    logoUrl: '',
    address: '100 Business Parkway, Suite 200',
    phone: '+1 (800) 555-0199',
    supportEmail: supportEmail || `contact@${tenantId}.com`,
    primaryColor: template.primaryColor,
    accentColor: template.accentColor,
    customDomain: domain || `${tenantId}.marketforge.com`,
    domainRoutingMode: 'path',
    dnsStatus: 'verified',
    sslStatus: 'active',
    homepageSource: 'custom_landing',
    activeTheme: template.themeId,
    customLandingData,
    lastUpdated: new Date().toISOString()
  };
}
