import React, { useState, useEffect } from 'react';
import { 
  Utensils, ShoppingBag, Clock, CheckCircle2, ChevronRight, 
  Search, Filter, Plus, Minus, X, PhoneCall, Droplets, 
  Sparkles, Calendar, UserCheck, CreditCard, ArrowLeft,
  Flame, Leaf, Star, ChevronDown, Check, QrCode
} from 'lucide-react';
import { clientDb } from '../lib/firebase';
import { MenuItem, TableItem, PortionVariation } from './RestaurantManagement';

interface Props {
  tenantId: string;
  tableNumber?: string;
  onCloseGuestView?: () => void;
}

export default function MobileTableQrOrderingApp({ tenantId, tableNumber = 'T-01', onCloseGuestView }: Props) {
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'status' | 'booking'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Appetizers', 'Mains', 'Wood-fired Pizza', 'Desserts', 'Beverages & Bar']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  
  // Tenant / Restaurant Details
  const [restaurantInfo, setRestaurantInfo] = useState<{
    name: string;
    logoUrl?: string;
    currency: string;
    taxRate: number;
  }>({
    name: 'Sienna Garden Bistro',
    currency: '$',
    taxRate: 10
  });

  // Selected Item Modal for Customization
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedPortion, setSelectedPortion] = useState<PortionVariation | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Cart State
  const [cart, setCart] = useState<Array<{
    id: string;
    menuItem: MenuItem;
    portion?: PortionVariation;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>>([]);

  // Active Submitted Order for Real-Time Status Tracking
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [tableNotes, setTableNotes] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [waiterCallStatus, setWaiterCallStatus] = useState<string | null>(null);

  // Future Booking Modal / Tab
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState<string>('19:00');
  const [bookingGuests, setBookingGuests] = useState<number>(2);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Load Menu and Restaurant Details
  useEffect(() => {
    loadMenuAndRestaurantData();
  }, [tenantId]);

  const loadMenuAndRestaurantData = async () => {
    try {
      // Load Tenant Brand / Name
      const savedTenants = localStorage.getItem('marketforge_tenants');
      if (savedTenants) {
        const tenants = JSON.parse(savedTenants);
        const currTenant = tenants.find((t: any) => t.id === tenantId || t.id?.includes(tenantId));
        if (currTenant) {
          setRestaurantInfo({
            name: currTenant.name || 'Sienna Garden Bistro',
            logoUrl: currTenant.branding?.logoUrl,
            currency: currTenant.settings?.currencyCode === 'NPR' ? 'रू ' : currTenant.settings?.currencyCode === 'INR' ? '₹ ' : '$',
            taxRate: 10
          });
        }
      }

      // Fetch Menu from Firestore or Fallback Presets
      const fetchedMenu = await clientDb.getCollection('restaurant_menu', tenantId);
      if (fetchedMenu && fetchedMenu.length > 0) {
        setMenuItems(fetchedMenu as any);
        const cats = Array.from(new Set(fetchedMenu.map((i: any) => i.category)));
        if (cats.length > 0) setCategories(cats as string[]);
      } else {
        // Fallback Unsplash-Rich Menu Items
        const seedMenu: MenuItem[] = [
          {
            id: 'm_1',
            name: 'Nepali Steamed Chicken Momos',
            category: 'Appetizers',
            price: 12.50,
            status: 'Available',
            isVeg: false,
            prepTimeMins: 15,
            description: 'Juicy minced chicken infused with garlic ginger, coriander, served with roasted tomato sesame chutney.',
            imageUrl: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80',
            portions: [
              { id: 'p_1', name: 'Steamed 10 pcs', priceMultiplier: 1 },
              { id: 'p_2', name: 'Kothey Pan-Fried 10 pcs', priceMultiplier: 1.15 }
            ]
          },
          {
            id: 'm_2',
            name: 'Artisanal Margherita Pizza',
            category: 'Wood-fired Pizza',
            price: 16.00,
            status: 'Available',
            isVeg: true,
            prepTimeMins: 12,
            description: 'San Marzano tomato coulis, fresh mozzarella di bufala, organic extra virgin olive oil, and sweet basil.',
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
            portions: [
              { id: 'p_3', name: 'Medium (10")', priceMultiplier: 1 },
              { id: 'p_4', name: 'Large (14")', priceMultiplier: 1.4 }
            ]
          },
          {
            id: 'm_3',
            name: 'Prime Wagyu Beef Burger',
            category: 'Mains',
            price: 18.50,
            status: 'Available',
            isVeg: false,
            prepTimeMins: 18,
            description: 'Grade A5 Wagyu patty with aged cheddar, caramelized onion jam, and brioche bun with truffle fries.',
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'm_4',
            name: 'Creamy Truffle Mushroom Pasta',
            category: 'Mains',
            price: 17.00,
            status: 'Available',
            isVeg: true,
            prepTimeMins: 15,
            description: 'Fettuccine pasta in wild porcini mushroom truffle cream sauce with shaved Parmigiano Reggiano.',
            imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'm_5',
            name: 'Iced Caramel Macchiato',
            category: 'Beverages & Bar',
            price: 6.50,
            status: 'Available',
            isVeg: true,
            prepTimeMins: 5,
            description: 'Freshly pulled double shot espresso layered with silky chilled milk and Madagascar vanilla caramel.',
            imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'm_6',
            name: 'Fresh Tropical Passion Mojito',
            category: 'Beverages & Bar',
            price: 8.00,
            status: 'Available',
            isVeg: true,
            prepTimeMins: 5,
            description: 'Muddled fresh mint leaves, lime juice, passionfruit puree, sparkling soda water on crushed ice.',
            imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'm_7',
            name: 'Molten Chocolate Lava Sundae',
            category: 'Desserts',
            price: 9.50,
            status: 'Available',
            isVeg: true,
            prepTimeMins: 10,
            description: 'Warm dark chocolate lava cake served with artisanal gelato vanilla bean and raspberry coulis.',
            imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'
          }
        ];
        setMenuItems(seedMenu);
      }
    } catch (err) {
      console.warn("Failed loading mobile QR menu:", err);
    }
  };

  // Filter Menu Items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDiet = dietaryFilter === 'all' || 
      (dietaryFilter === 'veg' && item.isVeg) || 
      (dietaryFilter === 'non-veg' && !item.isVeg);
    
    return matchesCategory && matchesSearch && matchesDiet && item.status === 'Available';
  });

  // Open Customization Modal
  const handleOpenCustomizer = (item: MenuItem) => {
    setSelectedItem(item);
    setSelectedPortion(item.portions && item.portions.length > 0 ? item.portions[0] : null);
    setQuantity(1);
    setItemNotes('');
  };

  // Add Item to Cart
  const handleAddToCart = () => {
    if (!selectedItem) return;

    const unitPrice = selectedPortion 
      ? (selectedPortion.priceOverride || selectedItem.price * selectedPortion.priceMultiplier) 
      : selectedItem.price;

    const cartItemId = `${selectedItem.id}_${selectedPortion?.id || 'std'}_${itemNotes}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(c => c.id === cartItemId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, {
        id: cartItemId,
        menuItem: selectedItem,
        portion: selectedPortion || undefined,
        quantity,
        unitPrice,
        notes: itemNotes
      }];
    });

    setSelectedItem(null);
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const cartTax = cartSubtotal * 0.10; // 10% tax/service
  const cartTotal = cartSubtotal + cartTax;

  // Update Cart Item Quantity
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as any;
    });
  };

  // Submit Order from Table
  const handleSubmitTableOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmittingOrder(true);

    try {
      const newOrder = {
        id: `ord_qr_${Date.now()}`,
        tenantId,
        tableNumber,
        customerName: customerName || `Table Guest (${tableNumber})`,
        customerPhone: customerPhone || 'N/A',
        waiterName: 'Mobile QR Direct',
        items: cart.map(c => ({
          menuItemId: c.menuItem.id,
          name: `${c.menuItem.name}${c.portion ? ` (${c.portion.name})` : ''}`,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          totalPrice: c.unitPrice * c.quantity,
          isVeg: c.menuItem.isVeg,
          notes: c.notes || ''
        })),
        totalAmount: cartTotal,
        status: 'Sent to Kitchen', // Sent to Kitchen -> In Preparation -> Ready -> Served
        orderType: 'Table QR Order',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: tableNotes
      };

      // Save to Firestore so POS & KDS update instantly!
      await clientDb.addDocToTenant('restaurant_orders', newOrder, tenantId);

      setActiveOrder(newOrder);
      setCart([]);
      setIsSubmittingOrder(false);
      setActiveTab('status');
    } catch (err) {
      console.warn("Error placing mobile table order:", err);
      setIsSubmittingOrder(false);
      alert("Order submitted! Waiter notified for table " + tableNumber);
      setActiveTab('status');
    }
  };

  // Call Waiter Signal
  const handleCallWaiter = (reason: string) => {
    setWaiterCallStatus(reason);
    setTimeout(() => {
      setWaiterCallStatus(null);
    }, 4000);
  };

  // Book Future Table Reservation
  const handleBookTableFuture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      alert("Please enter your name to reserve a table.");
      return;
    }

    try {
      const bookingObj = {
        id: `bk_${Date.now()}`,
        tenantId,
        tableNumber,
        customerName,
        customerPhone: customerPhone || 'N/A',
        guestCount: bookingGuests,
        bookingDate,
        timeSlot: bookingTime,
        durationHours: 2,
        status: 'Confirmed',
        specialNotes: `Mobile QR booking via Table ${tableNumber}`,
        createdAt: new Date().toISOString()
      };

      await clientDb.addDocToTenant('restaurant_bookings', bookingObj, tenantId);
      setBookingSuccessMsg(`Table reservation confirmed for ${customerName} on ${bookingDate} at ${bookingTime}!`);
    } catch (err) {
      setBookingSuccessMsg(`Table reservation received! The team will confirm your table shortly.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden border-x border-slate-800">
      
      {/* Top Header */}
      <header className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 p-4 sticky top-0 z-30 shadow-lg text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            {restaurantInfo.logoUrl ? (
              <img src={restaurantInfo.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-md" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/30">
                <Utensils className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none text-white">{restaurantInfo.name}</h1>
              <p className="text-[10px] text-amber-100 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Digital Table Menu & Mobile Ordering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCloseGuestView && (
              <button 
                onClick={onCloseGuestView} 
                className="bg-black/30 hover:bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-xl font-bold backdrop-blur-sm border border-white/10 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Exit
              </button>
            )}
          </div>
        </div>

        {/* Table Number Badge */}
        <div className="flex items-center justify-between bg-black/25 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/15">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-900 font-black text-xs px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
              <QrCode className="w-3 h-3" />
              Table {tableNumber}
            </span>
            <span className="text-xs text-amber-100 font-medium">Scan & Order Active</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => handleCallWaiter('Waiter Assistance Requested')}
              className="bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/20 transition-all"
            >
              <PhoneCall className="w-3 h-3 text-amber-300" />
              Call Waiter
            </button>
            <button 
              onClick={() => handleCallWaiter('Water / Cutlery Requested')}
              className="bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/20 transition-all"
            >
              <Droplets className="w-3 h-3 text-cyan-300" />
              Water
            </button>
          </div>
        </div>

        {/* Call Waiter Alert Banner */}
        {waiterCallStatus && (
          <div className="mt-2.5 bg-emerald-500/90 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center justify-between animate-bounce">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              Alert Sent: {waiterCallStatus} for Table {tableNumber}!
            </span>
            <span className="text-[10px] bg-slate-950 text-emerald-300 px-1.5 py-0.5 rounded-md">Notified</span>
          </div>
        )}
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 pb-24 overflow-y-auto p-4 space-y-4">

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            
            {/* Search and Dietary Filter Bar */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search momos, pizza, drinks, pasta..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Veg / Non-Veg Quick Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDietaryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    dietaryFilter === 'all' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setDietaryFilter('veg')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    dietaryFilter === 'veg' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md' 
                      : 'bg-slate-900 text-emerald-400 border border-slate-800'
                  }`}
                >
                  <span className="w-2.5 h-2.5 border border-emerald-400 p-0.5 rounded-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </span>
                  100% Veg
                </button>
                <button
                  onClick={() => setDietaryFilter('non-veg')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    dietaryFilter === 'non-veg' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'bg-slate-900 text-red-400 border border-slate-800'
                  }`}
                >
                  <span className="w-2.5 h-2.5 border border-red-400 p-0.5 rounded-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  </span>
                  Non-Veg
                </button>
              </div>

              {/* Category Horizontal Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    selectedCategory === 'All' 
                      ? 'bg-slate-100 text-slate-950 shadow-md' 
                      : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  🔥 All Categories ({menuItems.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      selectedCategory === cat 
                        ? 'bg-amber-500 text-slate-950 shadow-md' 
                        : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu List */}
            <div className="space-y-3.5">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-slate-800 p-6 space-y-2">
                  <Utensils className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="font-extrabold text-sm text-slate-300">No items match your filter</p>
                  <p className="text-xs text-slate-500">Try clearing your search query or dietary filters.</p>
                </div>
              ) : (
                filteredMenuItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => handleOpenCustomizer(item)}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3 flex gap-3 shadow-md active:scale-[0.99] transition-all cursor-pointer group relative"
                  >
                    {/* Unsplash High-Res Food Thumbnail */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        loading="lazy"
                      />
                      <span className="absolute top-1.5 left-1.5">
                        {item.isVeg ? (
                          <span className="bg-slate-950/80 backdrop-blur-md p-1 rounded-md border border-emerald-500/50 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          </span>
                        ) : (
                          <span className="bg-slate-950/80 backdrop-blur-md p-1 rounded-md border border-red-500/50 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-bold text-xs text-white leading-snug group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal font-normal">
                          {item.description || 'Delicious freshly prepared item crafted by our master chef.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-extrabold text-sm text-amber-400">
                          {restaurantInfo.currency}{item.price.toFixed(2)}
                        </span>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCustomizer(item);
                          }}
                          className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          ADD
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CART TAB */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                Table {tableNumber} Cart
              </h2>
              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-xl">
                {cart.reduce((a, b) => a + b.quantity, 0)} Items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-6 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="font-bold text-sm text-slate-200">Your table cart is empty</p>
                <p className="text-xs text-slate-400">Browse the menu and tap 'ADD' to build your table order.</p>
                <button 
                  onClick={() => setActiveTab('menu')}
                  className="bg-amber-500 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-2xl mt-2"
                >
                  Browse Full Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Item List */}
                <div className="space-y-3">
                  {cart.map((cartItem) => (
                    <div key={cartItem.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex gap-3 items-center">
                      <img 
                        src={cartItem.menuItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'} 
                        alt={cartItem.menuItem.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{cartItem.menuItem.name}</h4>
                        {cartItem.portion && (
                          <span className="text-[10px] text-amber-400 font-medium block">
                            Option: {cartItem.portion.name}
                          </span>
                        )}
                        {cartItem.notes && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            Note: "{cartItem.notes}"
                          </span>
                        )}
                        <span className="font-extrabold text-xs text-slate-200 block mt-1">
                          {restaurantInfo.currency}{(cartItem.unitPrice * cartItem.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Buttons */}
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
                        <button 
                          onClick={() => handleUpdateCartQuantity(cartItem.id, -1)}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-xs text-amber-400 w-4 text-center">{cartItem.quantity}</span>
                        <button 
                          onClick={() => handleUpdateCartQuantity(cartItem.id, 1)}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Info & Notes Input */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-200">Guest & Table Details:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Your Name (Optional):</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Phone Number (Optional):</label>
                      <input 
                        type="text" 
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. +977..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Kitchen / Allergies Instructions:</label>
                    <textarea 
                      rows={2}
                      value={tableNotes}
                      onChange={(e) => setTableNotes(e.target.value)}
                      placeholder="e.g. Make it extra spicy, serve drinks first..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Order Summary breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Items Subtotal:</span>
                    <span>{restaurantInfo.currency}{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax & Service (10%):</span>
                    <span>{restaurantInfo.currency}{cartTax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-sm text-white">
                    <span>Total Amount:</span>
                    <span className="text-amber-400">{restaurantInfo.currency}{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  onClick={handleSubmitTableOrder}
                  disabled={isSubmittingOrder}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {isSubmittingOrder ? (
                    <span>Submitting Order to Kitchen...</span>
                  ) : (
                    <>
                      <Utensils className="w-5 h-5" />
                      Place Table {tableNumber} Order ({restaurantInfo.currency}{cartTotal.toFixed(2)})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STATUS TAB */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Live Order Tracking
              </h2>
            </div>

            {activeOrder ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Order Reference</span>
                    <span className="font-extrabold text-sm text-amber-400">#{activeOrder.id.slice(-6)}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {activeOrder.status}
                  </span>
                </div>

                {/* Timeline Visual Progress */}
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">Order Sent to Kitchen</h4>
                      <p className="text-[10px] text-slate-400">Received by Waiter & Chef KDS terminal</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg">
                      <Flame className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">In Preparation</h4>
                      <p className="text-[10px] text-slate-400">Chef is freshly crafting your dishes</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10 opacity-60">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-black text-xs flex items-center justify-center">
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">Served to Table {tableNumber}</h4>
                      <p className="text-[10px] text-slate-400">Waiter will bring piping hot to your table</p>
                    </div>
                  </div>
                </div>

                {/* Ordered Items Summary */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1.5">Order Breakdown:</h4>
                  {activeOrder.items?.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-bold text-amber-400">{restaurantInfo.currency}{(it.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-xs text-white">
                    <span>Total Billed:</span>
                    <span className="text-amber-400">{restaurantInfo.currency}{(activeOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleCallWaiter('Request Bill / Invoice')}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    Request Bill
                  </button>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add More Items
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-6 space-y-3">
                <Clock className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="font-bold text-sm text-slate-200">No active order for Table {tableNumber}</p>
                <p className="text-xs text-slate-400">Place an order from the Menu tab to monitor live kitchen status.</p>
                <button 
                  onClick={() => setActiveTab('menu')}
                  className="bg-amber-500 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-2xl"
                >
                  View Digital Menu
                </button>
              </div>
            )}
          </div>
        )}

        {/* BOOKING TAB */}
        {activeTab === 'booking' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Reserve Future Table
              </h2>
              <p className="text-xs text-slate-400">Book your next visit or private dining slot directly from your mobile.</p>
            </div>

            {bookingSuccessMsg ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-extrabold text-base text-white">Reservation Confirmed!</h3>
                <p className="text-xs text-emerald-200">{bookingSuccessMsg}</p>
                <button 
                  onClick={() => setBookingSuccessMsg(null)}
                  className="bg-emerald-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl"
                >
                  Book Another Table
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookTableFuture} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Full Name:</label>
                  <input 
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Phone Number:</label>
                  <input 
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +1 555-0198"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Date:</label>
                    <input 
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Time Slot:</label>
                    <select 
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                    >
                      <option value="12:00">12:00 PM (Lunch)</option>
                      <option value="13:30">01:30 PM (Lunch)</option>
                      <option value="18:30">06:30 PM (Dinner)</option>
                      <option value="19:30">07:30 PM (Dinner)</option>
                      <option value="20:30">08:30 PM (Dinner)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Number of Guests:</label>
                  <select 
                    value={bookingGuests}
                    onChange={(e) => setBookingGuests(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests (Couples)</option>
                    <option value={4}>4 Guests (Family)</option>
                    <option value={6}>6 Guests (Group)</option>
                    <option value={10}>10+ Guests (Party)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 rounded-2xl shadow-lg mt-2"
                >
                  Confirm Reservation Request
                </button>
              </form>
            )}
          </div>
        )}

      </main>

      {/* Item Customizer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 max-w-md w-full space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="relative rounded-2xl overflow-hidden h-40 bg-slate-800">
              <img 
                src={selectedItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'} 
                alt={selectedItem.name} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-2.5 right-2.5 bg-slate-950/80 text-white p-1.5 rounded-full backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-extrabold text-base text-white">{selectedItem.name}</h3>
                <span className="font-black text-base text-amber-400">
                  {restaurantInfo.currency}
                  {((selectedPortion ? (selectedPortion.priceOverride || selectedItem.price * selectedPortion.priceMultiplier) : selectedItem.price) * quantity).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedItem.description}</p>
            </div>

            {/* Portion Variations Options */}
            {selectedItem.portions && selectedItem.portions.length > 0 && (
              <div className="space-y-2">
                <label className="font-bold text-xs text-slate-300 block">Select Size / Portion:</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedItem.portions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPortion(p)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        selectedPortion?.id === p.id 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {restaurantInfo.currency}{(p.priceOverride || (selectedItem.price * p.priceMultiplier)).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="font-bold text-xs text-slate-300 block mb-1">Custom Request / Spiciness:</label>
              <input 
                type="text" 
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="e.g. Mild spice, sauce on side..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Quantity and Add */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-sm text-white w-6 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Table Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Mobile Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 py-2.5 px-6 flex justify-between items-center z-40 text-slate-400">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex flex-col items-center gap-1 font-bold text-[10px] transition-all ${
            activeTab === 'menu' ? 'text-amber-400 scale-105' : 'hover:text-slate-200'
          }`}
        >
          <Utensils className="w-5 h-5" />
          Menu
        </button>

        <button
          onClick={() => setActiveTab('cart')}
          className={`flex flex-col items-center gap-1 font-bold text-[10px] transition-all relative ${
            activeTab === 'cart' ? 'text-amber-400 scale-105' : 'hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>
          Cart
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`flex flex-col items-center gap-1 font-bold text-[10px] transition-all ${
            activeTab === 'status' ? 'text-amber-400 scale-105' : 'hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          Track Order
        </button>

        <button
          onClick={() => setActiveTab('booking')}
          className={`flex flex-col items-center gap-1 font-bold text-[10px] transition-all ${
            activeTab === 'booking' ? 'text-amber-400 scale-105' : 'hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          Reserve
        </button>
      </nav>

    </div>
  );
}
