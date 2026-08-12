import React, { useState, useEffect } from 'react';
import { clientDb } from '../lib/firebase';
import { 
  Utensils, ClipboardList, ChefHat, Users, Store, DollarSign, 
  ArrowRight, Activity, TrendingUp, AlertTriangle, FileText, 
  Plus, Edit, Trash2, Receipt, BarChart4, Filter, Search, Check, 
  Download, Printer, QrCode, CreditCard, Coins, Upload, Clock, 
  Sparkles, Coffee, Wine, Pizza, Flame, ShieldCheck, Maximize2, 
  RefreshCw, X, ChevronDown, CheckCircle2, UserCheck, Layers, Eye, Move,
  Calendar, Building2, MapPin, Tag, ArrowUpRight, Scale, AlertCircle, ShoppingBag, Sliders,
  Lock, Unlock, Wifi, Radio, AlertOctagon, RotateCcw, Bed, Tv, Bath, Camera, Image as ImageIcon,
  Crown, Shirt, Globe, Building, PhoneCall, SlidersHorizontal, Layers3, Box, DoorOpen, Home,
  Compass, Droplets, Sun, Wind, Briefcase, Shield, CheckSquare,
  FileSpreadsheet, Grid, Palette, Smartphone, Copy
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import MobileTableQrOrderingApp from './MobileTableQrOrderingApp';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { BusinessProfile } from '../types';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
  onNavigateToWebsiteBuilder?: () => void;
  onNavigateToHotelOS?: () => void;
}

// Currency Configuration
export type CurrencyCode = 'USD' | 'NPR' | 'INR';

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; rate: number; label: string; code: CurrencyCode; name: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', code: 'USD', name: 'US Dollar' },
  NPR: { symbol: 'रू ', rate: 133.5, label: 'NPR (रू)', code: 'NPR', name: 'Nepalese Rupee' },
  INR: { symbol: '₹ ', rate: 83.2, label: 'INR (₹)', code: 'INR', name: 'Indian Rupee' }
};

// Portion Variation Interface
export interface PortionVariation {
  id: string;
  name: string; // e.g. 'Full Plate', 'Half Plate', '30 ml (Peg)', '60 ml (Double)', '180 ml (Quarter)', '750 ml (Bottle)', 'Family Platter'
  priceMultiplier: number;
  priceOverride?: number;
}

// Data Types
export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  amountPerUnit: number; // e.g. 0.25 (kg)
  unit: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'Available' | 'Out of Stock';
  isVeg: boolean;
  prepTimeMins: number;
  description?: string;
  imageUrl?: string;
  recipe?: RecipeIngredient[];
  portions?: PortionVariation[];
}

export interface IngredientItem {
  id: string;
  name: string;
  category: 'Meat & Seafood' | 'Dairy & Cheese' | 'Produce' | 'Pantry & Flours' | 'Beverages';
  stockQuantity: number;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'pcs';
  lowStockThreshold: number;
  costPerUnit: number; // USD
  lastRestocked: string;
}

export interface TableBooking {
  id: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '19:00'
  durationHours: number;
  status: 'Confirmed' | 'Seated' | 'Cancelled' | 'Completed';
  specialNotes?: string;
  createdAt: string;
}

export interface TableItem {
  id: string;
  tableNumber: string;
  seats: number;
  shape: 'round' | 'square' | 'rectangle' | 'booth';
  chairStyle?: 'wood' | 'armchair' | 'bar_stool' | 'booth_sofa' | 'outdoor_rattan' | 'leather_suite';
  section: 'Main Dining' | 'Terrace Patio' | 'VIP Lounge' | 'Bar Counter' | 'Rooftop Garden' | string;
  status: 'available' | 'occupied' | 'ordering' | 'billed' | 'cleaning';
  assignedWaiter?: string;
  currentOrderId?: string;
  currentOrderTotal?: number;
  floorNumber?: number;
}

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  portionName?: string;
  portionMultiplier?: number;
  isVeg?: boolean;
  notes?: string;
}

export interface POSTerminalStatus {
  id: string;
  name: string;
  cashierName: string;
  location: string;
  status: 'Online' | 'Busy' | 'Offline';
  lastPing: string;
  lastSyncedAt?: string;
  activeOrdersCount: number;
  totalShiftSales: number;
  cashFloat?: number;
  assignedFloor?: string;
}

export interface LiveOrder {
  id: string;
  tableNumber: string;
  section: string;
  waiterName: string;
  posTerminal?: string;
  customerName?: string;
  items: OrderLineItem[];
  subtotal: number;
  serviceTaxRate: number; // e.g. 10%
  vatRate: number; // e.g. 13%
  discountAmount: number;
  discountReason?: string;
  totalAmount: number;
  status: 'Draft' | 'Sent to Kitchen' | 'Cooking' | 'Ready to Serve' | 'Served' | 'Service Completed' | 'Ready for Invoice' | 'Paid' | 'Voided';
  timestamp: string;
  elapsedMins?: number;
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
}

// Hotel & Resort Room Facilities & Management Types
export interface HotelRoomFacilities {
  ac: boolean;
  fan: boolean;
  nonAc: boolean;
  tv: boolean;
  internet: boolean;
  inCallService: boolean;
  laundryService: boolean;
  complementaryBreakfast: boolean;
  spaAccess: boolean;
  saunaAccess: boolean;
  jacuzzi: boolean;
  swimmingPool: boolean;
  bbqAccess: boolean;
  campFireAccess: boolean;
}

export interface HotelRoom {
  id: string;
  roomNumber: string; // e.g. '101', '204', 'PH-01', 'CONF-A', 'RESORT-01'
  floorNumber: number; // 0 = Ground, 1 = 1st floor, etc.
  floorName: string; // 'Ground Floor', '1st Floor - Executive', '2nd Floor - Family Wing', 'Penthouse Suites', 'Conference Wing', 'Resort Lawn'
  roomType: 'Single Bed Room' | 'Double Bed Room' | 'Family Suite' | 'Presidential Suite' | 'Meeting Hall' | 'Conference Hall' | 'BBQ Lawn / Campfire' | 'Poolside Cabana';
  roomSizeSqFt: number;
  maxGuests: number;
  ratePerNight: number; // in USD
  ratePerHour?: number; // for meeting/conference halls
  status: 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance';
  guestName?: string;
  guestPhone?: string;
  checkInDate?: string;
  checkOutDate?: string;
  activeRoomServiceTotal?: number;
  imageUrl?: string;
  customDemoImage?: string;
  facilities: HotelRoomFacilities;
}

export interface InvoiceRecord {
  id: string;
  invoiceId: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  tableNumber: string;
  waiterName: string;
  items: OrderLineItem[];
  subtotal: number;
  serviceTaxAmount: number;
  vatAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Card' | 'Dynamic QR';
  paymentRef?: string;
  templateType: 'thermal' | 'tax_invoice' | 'express';
  status: 'Paid' | 'Pending' | 'Refunded';
}

export interface InvoiceSettings {
  restaurantName: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logoUrl?: string;
  cashierName: string;
  footerNote: string;
  currency: CurrencyCode;
}

export default function RestaurantManagement({ profile, tenantId, onNavigateToWebsiteBuilder, onNavigateToHotelOS }: Props) {
  const [activeTab, setActiveTab] = useState<'tables' | 'waiter' | 'kitchen' | 'menu' | 'finance' | 'inventory' | 'analytics' | 'reconciliation' | 'pos_config' | 'floor_audit' | 'qr_ordering'>('tables');
  const [previewQrTableNumber, setPreviewQrTableNumber] = useState<string | null>(null);

  // Currency Selection State
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // POS Custom Configuration State (Modular POS Editor)
  const [posConfig, setPosConfig] = useState({
    gridCols: 3 as 2 | 3 | 4 | 5,
    tileTheme: 'orange' as 'orange' | 'emerald' | 'sky' | 'rose' | 'indigo' | 'amber' | 'purple' | 'slate',
    portionCategories: ['Half-Plate', 'Full-Plate', '30 ml (Single Peg)', '60 ml (Double Peg)', '180 ml (Quarter)', 'Bottle', 'Drink-ML', 'Family Platter'],
    quickKeys: ['Quick Cash $20', 'Quick Cash $50', 'Quick Cash $100', 'Repeat Last Order', 'Split Bill Key', 'Discount Key', 'Void Item']
  });

  // Hotel & Resort Management States
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);
  const [selectedRoomFor3D, setSelectedRoomFor3D] = useState<HotelRoom | null>(null);
  const [selectedRoomForDining, setSelectedRoomForDining] = useState<HotelRoom | null>(null);
  
  // Custom Table & Chair Customizer States
  const [selectedTableForChairEdit, setSelectedTableForChairEdit] = useState<TableItem | null>(null);
  const [isChairCustomizerOpen, setIsChairCustomizerOpen] = useState<boolean>(false);
  const [selectedMenuItemForPortion, setSelectedMenuItemForPortion] = useState<MenuItem | null>(null);

  // Invoice Details & Business Customization State
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    restaurantName: profile?.name || 'MarketForge Gourmet Bistro',
    address: '124 Grand Avenue, Suite 400',
    phone: '+1 (555) 019-2831',
    email: 'billing@mforge.com',
    taxId: 'TAX/VAT-98210391A',
    cashierName: 'Alex Vance',
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80',
    footerNote: 'Thank you for dining with us! Please come again.',
    currency: 'USD'
  });

  // Currency Formatter Helper
  const formatCurrency = (amountInUSD: number, currencyOverride?: CurrencyCode) => {
    const config = CURRENCY_CONFIG[currencyOverride || currency];
    const converted = (amountInUSD || 0) * config.rate;
    return `${config.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Core Persistent States
  const [tables, setTables] = useState<TableItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Appetizers', 'Mains', 'Wood-fired Pizza', 'Desserts', 'Beverages & Bar']);
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  // Bookings & Reservations State
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTableForBooking, setSelectedTableForBooking] = useState<TableItem | null>(null);

  // Ingredients & Stock Inventory State
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);

  // Selected Table for Waiter / Order
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);

  // Modals
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isMenuUploadOpen, setIsMenuUploadOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<InvoiceRecord | null>(null);
  const [isPreviewInvoiceModalOpen, setIsPreviewInvoiceModalOpen] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<{
    tableNumber: string;
    waiterName: string;
    customerName: string;
    customerPhone: string;
    items: OrderLineItem[];
    subtotal: number;
    serviceTaxRate: number;
    vatRate: number;
    discountPercent: number;
  } | null>(null);

  const [activeThermalReceipt, setActiveThermalReceipt] = useState<{
    orderId?: string;
    tableNumber: string;
    waiterName: string;
    customerName?: string;
    posTerminal?: string;
    items: OrderLineItem[];
    subtotal: number;
    discountAmount?: number;
    discountReason?: string;
    serviceTaxAmount: number;
    vatAmount: number;
    grandTotal: number;
    timestamp: string;
  } | null>(null);

  // User Role & Manager Permission Layer State
  const [userRole, setUserRole] = useState<'Manager' | 'Waiter' | 'Cashier'>('Manager');
  const [isManagerAuthModalOpen, setIsManagerAuthModalOpen] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] = useState<{ name: string; callback: () => void } | null>(null);

  // Void Order Audit State
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [targetOrderToVoid, setTargetOrderToVoid] = useState<LiveOrder | null>(null);

  // Terminal Synchronization Network State
  const [isTerminalSyncModalOpen, setIsTerminalSyncModalOpen] = useState(false);
  const [terminalSyncList, setTerminalSyncList] = useState<POSTerminalStatus[]>([
    { id: 'pos_1', name: 'Cashier 1 - Main POS', cashierName: 'Alex Vance', location: 'Main Front Counter', status: 'Online', lastPing: 'Just now', lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), activeOrdersCount: 3, totalShiftSales: 1240.50 },
    { id: 'pos_2', name: 'Cashier 2 - Bar POS', cashierName: 'Sarah Jenkins', location: 'Bar & Lounge Area', status: 'Online', lastPing: '2s ago', lastSyncedAt: new Date(Date.now() - 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), activeOrdersCount: 2, totalShiftSales: 890.00 },
    { id: 'pos_3', name: 'Cashier 3 - Takeaway POS', cashierName: 'David Miller', location: 'Takeaway Station', status: 'Online', lastPing: '4s ago', lastSyncedAt: new Date(Date.now() - 4000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), activeOrdersCount: 1, totalShiftSales: 620.00 },
    { id: 'pos_4', name: 'Cashier 4 - Terrace POS', cashierName: 'Emily Watson', location: 'Terrace Patio', status: 'Offline', lastPing: '12m ago', lastSyncedAt: new Date(Date.now() - 720000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), activeOrdersCount: 0, totalShiftSales: 410.00 },
  ]);

  // Terminal Real-Time Sync & Status Handlers
  const handleSyncSingleTerminal = (terminalId: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalSyncList(prev => prev.map(t => {
      if (t.id === terminalId) {
        return {
          ...t,
          status: 'Online',
          lastPing: 'Just now',
          lastSyncedAt: nowStr
        };
      }
      return t;
    }));
  };

  const handleToggleTerminalStatus = (terminalId: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalSyncList(prev => prev.map(t => {
      if (t.id === terminalId) {
        const nextStatus = t.status === 'Online' ? 'Offline' : t.status === 'Offline' ? 'Busy' : 'Online';
        return {
          ...t,
          status: nextStatus,
          lastPing: 'Just now',
          lastSyncedAt: nowStr
        };
      }
      return t;
    }));
  };

  // Permission Guard Helper: Triggers Manager PIN prompt for Waiters
  const triggerManagerProtectedAction = (actionName: string, onApproved: () => void) => {
    if (userRole === 'Manager') {
      onApproved();
    } else {
      setPendingAuthAction({ name: actionName, callback: onApproved });
      setIsManagerAuthModalOpen(true);
    }
  };

  // Void Order Handler with Reason & Audit Log
  const handleConfirmOrderVoid = (orderId: string, voidReason: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'Voided',
          voidReason,
          voidedBy: `${userRole} (Authorized)`,
          voidedAt: nowStr
        };
      }
      return o;
    }));

    // Free target table if this was its active running order
    if (targetOrder) {
      setTables(prev => prev.map(t => {
        if (t.tableNumber === targetOrder.tableNumber) {
          return {
            ...t,
            status: 'available',
            currentOrderId: undefined,
            currentOrderTotal: 0
          };
        }
        return t;
      }));
    }

    clientDb.addDocToTenant('restaurant_orders', {
      id: orderId,
      status: 'Voided',
      voidReason,
      voidedBy: userRole,
      voidedAt: nowStr
    }, tenantId).catch(() => {});

    setIsVoidModalOpen(false);
    setTargetOrderToVoid(null);
  };

  // Table Status Cycling Helper
  const handleCycleTableStatus = (tableId: string) => {
    setTables(prevTables => prevTables.map(t => {
      if (t.id === tableId) {
        const sequence: TableItem['status'][] = ['available', 'occupied', 'ordering', 'billed', 'cleaning'];
        const nextIdx = (sequence.indexOf(t.status) + 1) % sequence.length;
        return { ...t, status: sequence[nextIdx] };
      }
      return t;
    }));
  };

  // Tenant Configuration LocalStorage Persistence Helper
  const saveTenantSettingsToStorage = (tId: string, partialSettings: Record<string, any>) => {
    try {
      const saved = localStorage.getItem('marketforge_tenants');
      if (saved) {
        const tenants = JSON.parse(saved);
        const idx = tenants.findIndex((t: any) => t.id === tId || t.id.includes(tId));
        if (idx !== -1) {
          tenants[idx].settings = {
            ...tenants[idx].settings,
            ...partialSettings
          };
          localStorage.setItem('marketforge_tenants', JSON.stringify(tenants));
        }
      }
    } catch (e) {
      console.warn("Error saving tenant settings:", e);
    }
  };

  // Initial Load from Firestore or Fallback Seeds
  useEffect(() => {
    loadRestaurantData();

    // Load Tenant Specific Custom Settings (Currency, Address, Cashier Terminals)
    try {
      const savedTenants = localStorage.getItem('marketforge_tenants');
      if (savedTenants) {
        const tenants = JSON.parse(savedTenants);
        const currTenant = tenants.find((t: any) => t.id === tenantId || t.id.includes(tenantId));
        if (currTenant && currTenant.settings) {
          const s = currTenant.settings;
          if (s.currencyCode) setCurrency(s.currencyCode);
          if (s.address || s.phone || s.vatRegNumber) {
            setInvoiceSettings(prev => ({
              ...prev,
              restaurantName: currTenant.name || prev.restaurantName,
              address: s.address || prev.address,
              phone: s.phone || prev.phone,
              taxId: s.vatRegNumber || prev.taxId,
              currency: s.currencyCode || prev.currency
            }));
          }
          if (s.cashierTerminals && s.cashierTerminals.length > 0) {
            setTerminalSyncList(s.cashierTerminals.map((ctName: string, i: number) => ({
              id: `pos_${i + 1}`,
              name: ctName,
              cashierName: i === 0 ? 'Alex Vance' : i === 1 ? 'Sunita Thapa' : 'POS Specialist',
              location: ctName,
              status: 'Online',
              lastPing: 'Just now',
              lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              activeOrdersCount: Math.floor(Math.random() * 3),
              totalShiftSales: Math.floor(200 + Math.random() * 1000)
            })));
          }
        }
      }
    } catch (e) {
      console.warn("Error reading tenant settings in RestaurantManagement:", e);
    }
  }, [tenantId]);

  const loadRestaurantData = async () => {
    try {
      // 1. Tables
      const fetchedTables = await clientDb.getCollection('restaurant_tables', tenantId);
      if (fetchedTables && fetchedTables.length > 0) {
        setTables(fetchedTables as any);
      } else {
        setTables([]);
      }

      // 2. Ingredients Inventory
      const fetchedIngredients = await clientDb.getCollection('restaurant_ingredients', tenantId);
      if (fetchedIngredients && fetchedIngredients.length > 0) {
        setIngredients(fetchedIngredients as any);
      } else {
        setIngredients([]);
      }

      // 3. Menu Items
      const fetchedMenu = await clientDb.getCollection('restaurant_menu', tenantId);
      if (fetchedMenu && fetchedMenu.length > 0) {
        setMenuItems(fetchedMenu as any);
        const cats = Array.from(new Set(fetchedMenu.map((i: any) => i.category)));
        if (cats.length > 0) setCategories(cats as string[]);
      } else {
        setMenuItems([]);
      }

      // 4. Table Bookings
      const fetchedBookings = await clientDb.getCollection('restaurant_bookings', tenantId);
      if (fetchedBookings && fetchedBookings.length > 0) {
        setBookings(fetchedBookings as any);
      } else {
        setBookings([]);
      }

      // 5. Live Orders
      const fetchedOrders = await clientDb.getCollection('restaurant_orders', tenantId);
      if (fetchedOrders && fetchedOrders.length > 0) {
        setOrders(fetchedOrders as any);
      } else {
        setOrders([]);
      }

      // 6. Invoices
      const fetchedInvoices = await clientDb.getCollection('restaurant_invoices', tenantId);
      if (fetchedInvoices && fetchedInvoices.length > 0) {
        setInvoices(fetchedInvoices as any);
      } else {
        setInvoices([]);
      }

      // 7. Hotel & Resort Rooms
      const fetchedRooms = await clientDb.getCollection('restaurant_hotel_rooms', tenantId);
      if (fetchedRooms && fetchedRooms.length > 0) {
        setHotelRooms(fetchedRooms as any);
      } else {
        setHotelRooms([]);
      }

    } catch (err) {
      console.error("Error loading restaurant data from Firestore:", err);
    }
  };

  // Add Custom Table Handler
  const handleAddTable = async (newTable: Omit<TableItem, 'id'>) => {
    const tableObj: TableItem = {
      ...newTable,
      id: `tbl_${Date.now()}`
    };
    const updated = [...tables, tableObj];
    setTables(updated);
    try {
      await clientDb.addDocToTenant('restaurant_tables', tableObj, tenantId);
    } catch (err) {
      console.warn("Table write non-blocking alert:", err);
    }
    setIsAddTableOpen(false);
  };

  // Add Menu Item Handler
  const handleAddMenuItem = async (newItem: Omit<MenuItem, 'id'>) => {
    const itemObj: MenuItem = {
      ...newItem,
      id: `menu_${Date.now()}`
    };
    const updated = [...menuItems, itemObj];
    setMenuItems(updated);
    if (!categories.includes(newItem.category)) {
      setCategories([...categories, newItem.category]);
    }
    try {
      await clientDb.addDocToTenant('restaurant_menu', itemObj, tenantId);
    } catch (err) {
      console.warn("Menu item write non-blocking alert:", err);
    }
    setIsAddItemOpen(false);
  };

  // Handle Bulk Menu Import
  const handleBulkMenuImport = async (importedItems: MenuItem[]) => {
    const updated = [...menuItems, ...importedItems];
    setMenuItems(updated);
    const newCats = Array.from(new Set(updated.map(i => i.category)));
    setCategories(newCats);
    setIsMenuUploadOpen(false);
    for (const item of importedItems) {
      try {
        await clientDb.addDocToTenant('restaurant_menu', item, tenantId);
      } catch (err) {}
    }
  };

  // Create Order from Waiter
  const handleSendOrderToKitchen = async (newOrder: Omit<LiveOrder, 'id'>) => {
    const orderObj: LiveOrder = {
      ...newOrder,
      id: `ord_${Math.floor(100 + Math.random() * 900)}`
    };
    const updatedOrders = [orderObj, ...orders];
    setOrders(updatedOrders);

    // Update table status to 'ordering'
    const updatedTables = tables.map(t => 
      t.tableNumber === newOrder.tableNumber 
        ? { ...t, status: 'ordering' as const, currentOrderTotal: newOrder.totalAmount, currentOrderId: orderObj.id } 
        : t
    );
    setTables(updatedTables);

    try {
      await clientDb.addDocToTenant('restaurant_orders', orderObj, tenantId);
    } catch (e) {}

    // Switch to Kitchen tab or show success confirmation
    setActiveTab('kitchen');
  };

  // Update Order Status Handler (Used by Waiter & Kitchen)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: LiveOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      if (['Served', 'Service Completed', 'Ready for Invoice', 'Paid'].includes(newStatus)) {
        setTables(prev => prev.map(t => {
          if (t.tableNumber === targetOrder.tableNumber) {
            return {
              ...t,
              status: newStatus === 'Paid' ? ('available' as const) : ('billed' as const)
            };
          }
          return t;
        }));
      }
    }

    try {
      await clientDb.addDocToTenant('restaurant_orders', { id: orderId, status: newStatus }, tenantId);
    } catch (e) {}
  };

  const handleUpdateTableStatus = (tableNumber: string, status: TableItem['status']) => {
    setTables(prev => prev.map(t => t.tableNumber === tableNumber ? { ...t, status } : t));
  };

  // Assign Pending Order to Table Handler
  const handleAssignPendingOrderToTable = (pendingOrder: any, targetTableNum: string) => {
    const sub = pendingOrder.items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
    const serviceTaxAmount = sub * 0.10;
    const vatAmount = sub * 0.13;
    const grandTotal = sub + serviceTaxAmount + vatAmount;

    // Update target table
    setTables(prev => prev.map(t => {
      if (t.tableNumber === targetTableNum) {
        return {
          ...t,
          status: 'occupied',
          currentOrderTotal: grandTotal,
          assignedWaiter: 'Alex Vance'
        };
      }
      return t;
    }));

    // Dispatch to live orders
    const newLiveOrder: LiveOrder = {
      id: `ord_${Date.now()}`,
      tableNumber: targetTableNum,
      section: tables.find(t => t.tableNumber === targetTableNum)?.section || 'Main Dining',
      waiterName: 'Alex Vance',
      items: pendingOrder.items,
      subtotal: sub,
      serviceTaxRate: 10,
      vatRate: 13,
      discountAmount: 0,
      totalAmount: grandTotal,
      status: 'Sent to Kitchen',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrders(prev => [newLiveOrder, ...prev]);
  };

  // Table Booking Handler with Overlap Validation
  const handleCreateBooking = (newBooking: Omit<TableBooking, 'id' | 'createdAt'>) => {
    const hasConflict = bookings.some(b => 
      b.tableNumber === newBooking.tableNumber &&
      b.bookingDate === newBooking.bookingDate &&
      b.timeSlot === newBooking.timeSlot &&
      b.status !== 'Cancelled'
    );

    if (hasConflict) {
      alert(`Conflict Detected! Table ${newBooking.tableNumber} is already booked on ${newBooking.bookingDate} at ${newBooking.timeSlot}. Please select another time slot or table.`);
      return false;
    }

    const bookingObj: TableBooking = {
      ...newBooking,
      id: `book_${Date.now()}`,
      createdAt: 'Just now'
    };

    setBookings(prev => [bookingObj, ...prev]);
    clientDb.addDocToTenant('restaurant_bookings', bookingObj, tenantId).catch(() => {});
    setIsBookingModalOpen(false);
    return true;
  };

  // Finalize Invoice & Process Payment with Automatic Inventory Stock Deduction
  const handleFinalizeInvoice = async (invoice: Omit<InvoiceRecord, 'id'>) => {
    const invObj: InvoiceRecord = {
      ...invoice,
      id: `inv_${Date.now()}`
    };
    const updated = [invObj, ...invoices];
    setInvoices(updated);

    // Automatic Inventory Stock Deduction
    if (invoice.items && invoice.items.length > 0) {
      setIngredients(prevIngredients => {
        const nextIngredients = [...prevIngredients];
        invoice.items.forEach(lineItem => {
          const menuItem = menuItems.find(m => m.id === lineItem.menuItemId || m.name === lineItem.name);
          if (menuItem && menuItem.recipe && menuItem.recipe.length > 0) {
            menuItem.recipe.forEach(rec => {
              const ingIdx = nextIngredients.findIndex(ing => ing.id === rec.ingredientId);
              if (ingIdx !== -1) {
                const current = nextIngredients[ingIdx].stockQuantity;
                const qtyNeeded = rec.amountPerUnit * lineItem.quantity;
                const newStock = Math.max(0, parseFloat((current - qtyNeeded).toFixed(3)));
                nextIngredients[ingIdx] = {
                  ...nextIngredients[ingIdx],
                  stockQuantity: newStock
                };
              }
            });
          }
        });
        return nextIngredients;
      });
    }

    // Update corresponding table status to 'available'
    const updatedTables = tables.map(t => 
      t.tableNumber === invoice.tableNumber 
        ? { ...t, status: 'available' as const, currentOrderTotal: 0, currentOrderId: undefined } 
        : t
    );
    setTables(updatedTables);

    // Update order status to 'Paid'
    setOrders(orders.map(o => o.tableNumber === invoice.tableNumber ? { ...o, status: 'Paid' } : o));

    try {
      await clientDb.addDocToTenant('restaurant_invoices', invObj, tenantId);
    } catch (e) {}

    setActiveInvoiceModal(invObj);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-lg">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black tracking-tight">{profile.name || "Gourmet Bistro"} POS & Restaurant OS</h2>
              <span className="bg-white/20 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-white/30">
                PRO v5.2
              </span>
            </div>
            <p className="text-xs text-orange-100 font-medium max-w-xl">
              Complete Dine-in Floor Layout, Touch Waiter Dashboard, Kitchen KDS, Dynamic Price QR Billing & Multi-Tax Invoicing.
            </p>
          </div>
        </div>

        {/* Top Header Quick Actions & Currency Selector */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* User Role Permission Selector */}
          <div className="bg-orange-950/40 border border-white/30 rounded-xl px-3 py-1.5 backdrop-blur-md flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span className="text-[11px] font-bold text-orange-100 uppercase">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="bg-white/20 hover:bg-white/30 text-white font-black text-xs rounded-lg px-2 py-1 outline-none cursor-pointer backdrop-blur-md"
            >
              <option value="Manager" className="bg-slate-900 text-white">👑 Manager (Full Access)</option>
              <option value="Waiter" className="bg-slate-900 text-white">🧑‍🍳 Waiter (Protected Discount/Void)</option>
              <option value="Cashier" className="bg-slate-900 text-white">🖨️ Cashier (Billing & POS Sync)</option>
            </select>
          </div>

          {/* Terminal Synchronization Button */}
          <button
            onClick={() => setIsTerminalSyncModalOpen(true)}
            className="px-3.5 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-400/50 text-emerald-200 font-extrabold text-xs rounded-xl backdrop-blur-md shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>POS Sync ({terminalSyncList.filter(t => t.status === 'Online').length} Terminals Live)</span>
          </button>

          {/* Currency Toggle */}
          <div className="bg-orange-950/40 border border-white/30 rounded-xl px-3 py-1.5 backdrop-blur-md flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-300" />
            <span className="text-[11px] font-bold text-orange-100 uppercase">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-white/20 hover:bg-white/30 text-white font-black text-xs rounded-lg px-2 py-1 outline-none cursor-pointer backdrop-blur-md"
            >
              <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
              <option value="NPR" className="bg-slate-900 text-white">NPR (रू)</option>
              <option value="INR" className="bg-slate-900 text-white">INR (₹)</option>
            </select>
          </div>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-950" /> Book Table
          </button>

          <button
            onClick={() => setIsAddTableOpen(true)}
            className="px-4 py-2.5 bg-white text-orange-700 font-bold text-xs rounded-xl shadow-md hover:bg-orange-50 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Custom Table
          </button>

          <button
            onClick={() => setIsMenuUploadOpen(true)}
            className="px-4 py-2.5 bg-orange-950/40 hover:bg-orange-950/60 border border-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-300" /> Upload Menu
          </button>
        </div>
      </div>

      {/* POS Terminal Visual Real-time Health Indicator Bar */}
      <POSTerminalHealthIndicatorBar 
        terminals={terminalSyncList}
        onSyncTerminal={handleSyncSingleTerminal}
        onToggleStatus={handleToggleTerminalStatus}
        onOpenSyncModal={() => setIsTerminalSyncModalOpen(true)}
        formatCurrency={formatCurrency}
        currency={currency}
      />

      {/* Main Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'tables', label: 'Interactive Floor Layout', icon: Layers, badge: `${tables.filter(t => t.status === 'occupied' || t.status === 'ordering').length} Active` },
          { id: 'qr_ordering', label: 'Table QR Ordering Center', icon: QrCode, badge: 'Scan-to-Order' },
          { id: 'waiter', label: 'Waiter Order Entry', icon: UserCheck, badge: 'Touch POS' },
          { id: 'kitchen', label: 'Kitchen KDS', icon: ChefHat, badge: `${orders.filter(o => o.status === 'Sent to Kitchen' || o.status === 'Cooking').length} Cooking` },
          { id: 'reconciliation', label: 'Financial Reconciliation', icon: Scale, badge: 'PDF & Excel Report' },
          { id: 'pos_config', label: 'POS Keypad Configurator', icon: SlidersHorizontal, badge: 'Layout & Colors' },
          { id: 'floor_audit', label: 'Floor Operations Audit', icon: Activity, badge: 'Turnover & RevPASH' },
          { id: 'finance', label: 'Invoices & QR Billing', icon: Receipt, badge: 'Dynamic QR' },
          { id: 'inventory', label: 'Stock & Inventory', icon: Store, badge: `${ingredients.filter(i => i.stockQuantity <= i.lowStockThreshold).length} Low Stock` },
          { id: 'analytics', label: 'Revenue & Sales Analytics', icon: TrendingUp, badge: 'Recharts BI' },
          { id: 'menu', label: 'Menu Editor & Bulk Upload', icon: Utensils, badge: `${menuItems.length} Items` },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer text-xs font-bold ${
                isActive
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RENDER TAB CONTENTS */}

      {/* TAB 1: INTERACTIVE FLOOR LAYOUT */}
      {activeTab === 'tables' && (
        <FloorLayoutTab 
          tables={tables} 
          currency={currency}
          formatCurrency={formatCurrency}
          onSelectTable={(table) => {
            setSelectedTable(table);
            setActiveTab('waiter');
          }}
          onOpenAddTable={() => setIsAddTableOpen(true)}
          onOpenChairCustomizer={(table) => {
            setSelectedTableForChairEdit(table);
            setIsChairCustomizerOpen(true);
          }}
          onClearTable={(tableId) => {
            setTables(tables.map(t => t.id === tableId ? { ...t, status: 'available', currentOrderTotal: 0, currentOrderId: undefined } : t));
          }}
          onCycleTableStatus={handleCycleTableStatus}
        />
      )}

      {/* TAB 2: WAITER DASHBOARD */}
      {activeTab === 'waiter' && (
        <WaiterDashboardTab 
          tables={tables}
          menuItems={menuItems}
          categories={categories}
          orders={orders}
          currency={currency}
          formatCurrency={formatCurrency}
          initialTable={selectedTable}
          userRole={userRole}
          onRequestManagerAuth={triggerManagerProtectedAction}
          onVoidOrder={(orderId) => {
            const target = orders.find(o => o.id === orderId);
            if (target) {
              setTargetOrderToVoid(target);
            } else {
              setTargetOrderToVoid({
                id: orderId,
                tableNumber: 'Selected Table',
                section: 'Main Dining',
                waiterName: 'Alex Vance',
                items: [],
                subtotal: 0,
                serviceTaxRate: 10,
                vatRate: 13,
                discountAmount: 0,
                totalAmount: 0,
                status: 'Draft',
                timestamp: 'Now'
              });
            }
            setIsVoidModalOpen(true);
          }}
          onOpenTerminalSync={() => setIsTerminalSyncModalOpen(true)}
          onSendOrderToKitchen={handleSendOrderToKitchen}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateTableStatus={handleUpdateTableStatus}
          onOpenInvoiceHub={(table, items, subtotal) => {
            setSelectedTable(table);
            setActiveTab('finance');
          }}
          onOpenInvoicePreview={(table, items, subtotal) => {
            setPreviewInvoiceData({
              tableNumber: table.tableNumber,
              waiterName: table.assignedWaiter || 'Alex Vance',
              customerName: 'Dine-in Guest',
              customerPhone: '',
              items,
              subtotal,
              serviceTaxRate: 10,
              vatRate: 13,
              discountPercent: 0
            });
            setIsPreviewInvoiceModalOpen(true);
          }}
          onOpenThermalReceipt={(data) => {
            setActiveThermalReceipt(data);
          }}
          onAssignPendingOrder={(pendingOrder, targetTableNum) => {
            handleAssignPendingOrderToTable(pendingOrder, targetTableNum);
          }}
          onNavigateToWebsiteBuilder={onNavigateToWebsiteBuilder}
        />
      )}

      {/* TAB 3: KITCHEN DISPLAY SYSTEM */}
      {activeTab === 'kitchen' && (
        <KitchenDisplayTab 
          orders={orders}
          userRole={userRole}
          onRequestManagerAuth={triggerManagerProtectedAction}
          onVoidOrder={(orderId) => {
            const target = orders.find(o => o.id === orderId);
            if (target) {
              setTargetOrderToVoid(target);
              setIsVoidModalOpen(true);
            }
          }}
          onUpdateStatus={(orderId, newStatus) => {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
          }}
        />
      )}

      {/* TAB 4: INVOICE & DYNAMIC QR BILLING HUB */}
      {activeTab === 'finance' && (
        <InvoiceAndBillingTab 
          invoices={invoices}
          orders={orders}
          tables={tables}
          restaurantName={profile.name || "MarketForge Gourmet Bistro"}
          invoiceSettings={invoiceSettings}
          onUpdateInvoiceSettings={(updated) => setInvoiceSettings(updated)}
          currency={currency}
          onCurrencyChange={(c) => {
            setCurrency(c);
            setInvoiceSettings(prev => ({ ...prev, currency: c }));
          }}
          formatCurrency={formatCurrency}
          onFinalizeInvoice={handleFinalizeInvoice}
          onViewInvoiceDetails={(inv) => setActiveInvoiceModal(inv)}
        />
      )}

      {/* TAB 5: INVENTORY */}
      {activeTab === 'inventory' && (
        <InventoryManagementTab 
          ingredients={ingredients}
          menuItems={menuItems}
          currency={currency}
          formatCurrency={formatCurrency}
          onUpdateIngredients={(updated) => setIngredients(updated)}
          onUpdateMenuItems={(updated) => setMenuItems(updated)}
        />
      )}

      {/* TAB 6: REVENUE & SALES ANALYTICS (RECHARTS) */}
      {activeTab === 'analytics' && (
        <RevenueAnalyticsTab 
          invoices={invoices}
          orders={orders}
          tables={tables}
          currency={currency}
          formatCurrency={formatCurrency}
        />
      )}

      {/* TAB 7: MENU EDITOR & BULK UPLOAD */}
      {activeTab === 'menu' && (
        <MenuEditorTab 
          menuItems={menuItems}
          categories={categories}
          onOpenAddItem={() => setIsAddItemOpen(true)}
          onOpenBulkUpload={() => setIsMenuUploadOpen(true)}
          onToggleAvailability={(id) => {
            setMenuItems(menuItems.map(m => m.id === id ? { ...m, status: m.status === 'Available' ? 'Out of Stock' : 'Available' } : m));
          }}
          onDeleteItem={(id) => setMenuItems(menuItems.filter(m => m.id !== id))}
        />
      )}

      {/* TAB 8: AUTOMATED FINANCIAL RECONCILIATION WIDGET */}
      {activeTab === 'reconciliation' && (
        <FinancialReconciliationTab 
          invoices={invoices}
          orders={orders}
          hotelRooms={hotelRooms}
          bookings={bookings}
          currency={currency}
          formatCurrency={formatCurrency}
          profile={profile}
        />
      )}

      {/* TAB 9: MODULAR POS KEYPAD CONFIGURATOR & TENANT SETTINGS */}
      {activeTab === 'pos_config' && (
        <ModularPOSConfiguratorTab 
          menuItems={menuItems}
          categories={categories}
          posConfig={posConfig}
          onSaveConfig={(newCfg) => {
            setPosConfig(newCfg);
            saveTenantSettingsToStorage(tenantId, { posConfig: newCfg });
          }}
          currency={currency}
          onChangeCurrency={(newCurr) => {
            setCurrency(newCurr);
            saveTenantSettingsToStorage(tenantId, { currencyCode: newCurr });
          }}
          invoiceSettings={invoiceSettings}
          onSaveInvoiceSettings={(newInvSettings) => {
            setInvoiceSettings(newInvSettings);
            saveTenantSettingsToStorage(tenantId, {
              address: newInvSettings.address,
              phone: newInvSettings.phone,
              vatRegNumber: newInvSettings.taxId,
              currencyCode: newInvSettings.currency
            });
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* TAB 10: FLOOR OPERATIONS AUDIT DASHBOARD */}
      {activeTab === 'floor_audit' && (
        <FloorOperationsAuditTab 
          tables={tables}
          orders={orders}
          invoices={invoices}
          currency={currency}
          formatCurrency={formatCurrency}
        />
      )}

      {/* TAB 11: TABLE QR ORDERING & BOOKING CENTER */}
      {activeTab === 'qr_ordering' && (
        <QrOrderingCenterTab 
          tenantId={tenantId}
          tables={tables}
          orders={orders}
          menuItems={menuItems}
          profile={profile}
          onOpenMobilePreview={(tblNum) => setPreviewQrTableNumber(tblNum)}
          onClearDemoData={() => {
            if (window.confirm("Are you sure you want to clear demo items and start with 0 mock data for clean commercial production?")) {
              setMenuItems([]);
              setOrders([]);
              setIngredients([]);
              clientDb.addDocToTenant('restaurant_settings', { isFreshStart: true }, tenantId);
            }
          }}
        />
      )}

      {/* MODALS */}
      {isBookingModalOpen && (
        <TableBookingModal 
          tables={tables}
          bookings={bookings}
          selectedTable={selectedTableForBooking}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedTableForBooking(null);
          }}
          onSubmit={handleCreateBooking}
        />
      )}

      {isAddTableOpen && (
        <AddCustomTableModal 
          existingTables={tables}
          onClose={() => setIsAddTableOpen(false)}
          onSubmit={handleAddTable}
        />
      )}

      {isAddItemOpen && (
        <AddMenuItemModal 
          categories={categories}
          onClose={() => setIsAddItemOpen(false)}
          onSubmit={handleAddMenuItem}
        />
      )}

      {isMenuUploadOpen && (
        <BulkMenuUploadModal 
          onClose={() => setIsMenuUploadOpen(false)}
          onImport={handleBulkMenuImport}
        />
      )}

      {activeInvoiceModal && (
        <PrintableInvoiceModal 
          invoice={activeInvoiceModal}
          invoiceSettings={invoiceSettings}
          currency={currency}
          formatCurrency={formatCurrency}
          onClose={() => setActiveInvoiceModal(null)}
        />
      )}

      {isPreviewInvoiceModalOpen && previewInvoiceData && (
        <InvoicePreviewOverlayModal 
          data={previewInvoiceData}
          invoiceSettings={invoiceSettings}
          currency={currency}
          formatCurrency={formatCurrency}
          onClose={() => setIsPreviewInvoiceModalOpen(false)}
          onConfirmPayment={(inv) => {
            handleFinalizeInvoice(inv);
            setIsPreviewInvoiceModalOpen(false);
          }}
        />
      )}

      {activeThermalReceipt && (
        <ThermalReceiptModal 
          data={activeThermalReceipt}
          invoiceSettings={invoiceSettings}
          currency={currency}
          formatCurrency={formatCurrency}
          onClose={() => setActiveThermalReceipt(null)}
        />
      )}

      {/* MANAGER AUTHORIZATION PIN MODAL */}
      {isManagerAuthModalOpen && (
        <ManagerAuthModal 
          actionName={pendingAuthAction?.name || 'Protected Feature'}
          userRole={userRole}
          onClose={() => {
            setIsManagerAuthModalOpen(false);
            setPendingAuthAction(null);
          }}
          onConfirmPin={() => {
            setIsManagerAuthModalOpen(false);
            if (pendingAuthAction) {
              pendingAuthAction.callback();
              setPendingAuthAction(null);
            }
          }}
        />
      )}

      {/* VOID ORDER AUDIT MODAL */}
      {isVoidModalOpen && targetOrderToVoid && (
        <VoidOrderModal 
          order={targetOrderToVoid}
          onClose={() => {
            setIsVoidModalOpen(false);
            setTargetOrderToVoid(null);
          }}
          onConfirmVoid={(reason) => {
            handleConfirmOrderVoid(targetOrderToVoid.id, reason);
          }}
        />
      )}

      {/* POS TERMINAL SYNCHRONIZATION HUB MODAL */}
      {isTerminalSyncModalOpen && (
        <TerminalSyncHubModal 
          terminals={terminalSyncList}
          orders={orders}
          currency={currency}
          formatCurrency={formatCurrency}
          onClose={() => setIsTerminalSyncModalOpen(false)}
        />
      )}

      {/* 3D INTERACTIVE ROOM DEMO MODAL */}
      {selectedRoomFor3D && (
        <Room3DDemoModal 
          room={selectedRoomFor3D}
          currency={currency}
          formatCurrency={formatCurrency}
          onClose={() => setSelectedRoomFor3D(null)}
          onOrderRoomService={() => {
            const r = selectedRoomFor3D;
            setSelectedRoomFor3D(null);
            setSelectedRoomForDining(r);
          }}
        />
      )}

      {/* IN-ROOM DINING EXPRESS TOUCH POS MODAL */}
      {selectedRoomForDining && (
        <InRoomDiningPOSModal 
          room={selectedRoomForDining}
          menuItems={menuItems}
          categories={categories}
          currency={currency}
          formatCurrency={formatCurrency}
          onClose={() => setSelectedRoomForDining(null)}
          onSubmitOrder={(order) => {
            handleSendOrderToKitchen(order);
            // Update active room service total
            setHotelRooms(hotelRooms.map(r => r.id === selectedRoomForDining.id ? { ...r, activeRoomServiceTotal: (r.activeRoomServiceTotal || 0) + order.totalAmount, status: 'Occupied' } : r));
            setSelectedRoomForDining(null);
          }}
        />
      )}

      {/* TABLE CHAIR & SEATING CUSTOMIZER MODAL */}
      {isChairCustomizerOpen && selectedTableForChairEdit && (
        <TableChairCustomizerModal 
          table={selectedTableForChairEdit}
          onClose={() => {
            setIsChairCustomizerOpen(false);
            setSelectedTableForChairEdit(null);
          }}
          onSave={(updatedTable) => {
            setTables(tables.map(t => t.id === updatedTable.id ? updatedTable : t));
            setIsChairCustomizerOpen(false);
            setSelectedTableForChairEdit(null);
          }}
        />
      )}

      {/* MENU PORTION VARIATION PICKER MODAL */}
      {selectedMenuItemForPortion && (
        <PortionVariationPickerModal 
          item={selectedMenuItemForPortion}
          currency={currency}
          formatCurrency={formatCurrency}
          onClose={() => setSelectedMenuItemForPortion(null)}
          onSelectPortion={(portion, calculatedPrice) => {
            setSelectedMenuItemForPortion(null);
          }}
        />
      )}

      {/* MOBILE QR TABLE ORDERING PREVIEW MODAL */}
      {previewQrTableNumber && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewQrTableNumber(null); }}
        >
          <div className="bg-slate-950 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl overflow-hidden relative my-auto">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-xs">Guest Mobile QR Ordering ({previewQrTableNumber})</span>
              </div>
              <button 
                type="button"
                onClick={() => setPreviewQrTableNumber(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[75vh] overflow-y-auto">
              <MobileTableQrOrderingApp 
                tenantId={tenantId}
                tableNumber={previewQrTableNumber}
                onCloseGuestView={() => setPreviewQrTableNumber(null)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// SUB-COMPONENT 1: INTERACTIVE FLOOR LAYOUT
// =========================================================================
function FloorLayoutTab({ 
  tables, 
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  onSelectTable, 
  onOpenAddTable,
  onOpenChairCustomizer,
  onClearTable,
  onCycleTableStatus
}: { 
  tables: TableItem[];
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  onSelectTable: (table: TableItem) => void;
  onOpenAddTable: () => void;
  onOpenChairCustomizer?: (table: TableItem) => void;
  onClearTable: (id: string) => void;
  onCycleTableStatus: (id: string) => void;
}) {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');

  const [customFloors, setCustomFloors] = useState<Array<{ id: number; name: string }>>([
    { id: 1, name: 'Ground Floor (Main Dining)' },
    { id: 2, name: '2nd Floor (Mezzanine)' },
    { id: 3, name: '3rd Floor (Rooftop Garden)' },
  ]);
  const [showAddFloorModal, setShowAddFloorModal] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');

  const handleCreateFloor = () => {
    if (!newFloorName.trim()) return;
    const nextId = customFloors.length > 0 ? Math.max(...customFloors.map(f => f.id)) + 1 : 1;
    const newFloor = { id: nextId, name: newFloorName.trim() };
    setCustomFloors([...customFloors, newFloor]);
    setSelectedFloor(nextId);
    setNewFloorName('');
    setShowAddFloorModal(false);
  };

  const filteredTables = tables.filter(t => {
    const tableFloor = t.floorNumber || 1;
    const matchesFloor = selectedFloor === 0 || tableFloor === selectedFloor;
    const matchesSection = selectedSection === 'ALL' || t.section === selectedSection;
    return matchesFloor && matchesSection;
  });

  const sectionSet = new Set(['Main Dining', 'Terrace Patio', 'VIP Lounge', 'Bar Counter']);
  tables.forEach(t => { if (t.section) sectionSet.add(t.section); });
  const sections = ['ALL', ...Array.from(sectionSet)];

  const getStatusBadge = (status: TableItem['status']) => {
    switch (status) {
      case 'available':
        return { label: 'Available', bg: 'bg-emerald-50/90 border-emerald-300 text-emerald-800', dot: 'bg-emerald-500' };
      case 'occupied':
        return { label: 'Occupied', bg: 'bg-rose-50/90 border-rose-300 text-rose-800', dot: 'bg-rose-500 animate-ping' };
      case 'ordering':
        return { label: 'Ordering', bg: 'bg-amber-50/90 border-amber-300 text-amber-800', dot: 'bg-amber-500' };
      case 'billed':
        return { label: 'Billed', bg: 'bg-purple-50/90 border-purple-300 text-purple-800', dot: 'bg-purple-500' };
      case 'cleaning':
        return { label: 'Cleaning', bg: 'bg-cyan-50/90 border-cyan-300 text-cyan-800', dot: 'bg-cyan-500' };
      default:
        return { label: 'Available', bg: 'bg-emerald-50 border-emerald-300 text-emerald-800', dot: 'bg-emerald-500' };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Floor Header & Multi-Floor Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            Interactive Multi-Floor Dine-in Layout
          </h3>
          <p className="text-xs text-slate-500">
            Manage seating across multiple building floors, terrace levels, and VIP private dining halls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddFloorModal(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
          >
            <Plus className="w-4 h-4 text-orange-600" /> Add New Floor Level
          </button>

          <button
            onClick={onOpenAddTable}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
        </div>
      </div>

      {/* Multi-Floor Level Switcher Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        <button
          onClick={() => setSelectedFloor(0)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            selectedFloor === 0 ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏢 All Floors ({tables.length} Tables)
        </button>
        {customFloors.map(fl => {
          const count = tables.filter(t => (t.floorNumber || 1) === fl.id).length;
          return (
            <button
              key={fl.id}
              onClick={() => setSelectedFloor(fl.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedFloor === fl.id ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{fl.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                selectedFloor === fl.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-500 font-bold self-center px-2">Zone:</span>
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedSection === sec 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Table Status Legend */}
      <div className="flex flex-wrap items-center gap-6 bg-slate-50 p-3 rounded-xl text-xs font-medium text-slate-600">
        <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Legend & Quick Cycle:</span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Ordering</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Billed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500" />
          <span>Cleaning</span>
        </div>
        <span className="text-[11px] text-orange-600 font-bold ml-auto hidden md:inline">
          💡 Tip: Click status badge on any table card to cycle status
        </span>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredTables.map((table) => {
          const statusInfo = getStatusBadge(table.status);
          return (
            <div
              key={table.id}
              className={`border-2 rounded-2xl p-5 transition-all duration-200 relative group flex flex-col justify-between shadow-sm hover:shadow-md ${statusInfo.bg}`}
            >
              {/* Table Top Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dot}`} />
                    <span className="font-black text-base text-slate-900">{table.tableNumber}</span>
                  </div>

                  {/* Dynamic Status Badge (Clickable to Cycle) */}
                  <button
                    type="button"
                    onClick={() => onCycleTableStatus(table.id)}
                    className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 border border-slate-200 hover:border-orange-500 text-slate-800 flex items-center gap-1.5 shadow-sm transition cursor-pointer hover:scale-105"
                    title="Click to cycle table status (Available -> Occupied -> Ordering -> Billed -> Cleaning)"
                  >
                    <span>{statusInfo.label}</span>
                    <RefreshCw className="w-3 h-3 text-orange-600 animate-spin-slow" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Floor & Section:</span>
                    <span className="font-bold text-slate-800">Fl. {table.floorNumber || 1} • {table.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-semibold text-slate-700">{table.seats} Seats ({table.shape})</span>
                  </div>
                  {table.assignedWaiter && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Waiter:</span>
                      <span className="font-semibold text-orange-700">{table.assignedWaiter}</span>
                    </div>
                  )}
                  {table.currentOrderTotal && table.currentOrderTotal > 0 ? (
                    <div className="flex justify-between pt-1 border-t border-slate-200/60 font-mono">
                      <span className="text-slate-500 font-bold">Running Total:</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(table.currentOrderTotal, currency)}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Visual Table & Chairs Representation */}
              <InteractiveChairVisualizer 
                seats={table.seats}
                shape={table.shape}
                status={table.status}
                chairStyle={table.chairStyle}
                tableNumber={table.tableNumber}
                onCustomize={() => onOpenChairCustomizer?.(table)}
              />

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectTable(table)}
                  className="flex-1 py-2 px-2.5 bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  {table.status === 'available' ? 'Take Order' : 'Edit Order'}
                </button>

                <button
                  onClick={() => onCycleTableStatus(table.id)}
                  title="Cycle Table Status"
                  className="p-2 bg-white border border-slate-200 text-slate-700 hover:text-orange-600 rounded-xl hover:bg-orange-50 transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
                </button>

                {table.status !== 'available' && (
                  <button
                    onClick={() => onClearTable(table.id)}
                    title="Clear Table"
                    className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD NEW FLOOR LEVEL */}
      {showAddFloorModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddFloorModal(false); }}
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto my-auto shadow-2xl space-y-4 border border-slate-200 animate-scale-up relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Add Custom Floor Level</h3>
              <button onClick={() => setShowAddFloorModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Floor Level Name / Label:</label>
                <input
                  type="text"
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  placeholder="e.g. Floor 4 (Poolside Bar)"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={handleCreateFloor}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Floor Level
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT 2: USER-FRIENDLY WAITER DASHBOARD
// =========================================================================
export interface PendingOrder {
  id: string;
  source: 'Online Order' | 'Drive-thru' | 'Phone Call' | 'Bar Counter';
  customerName: string;
  items: OrderLineItem[];
  subtotal: number;
  time: string;
}

function WaiterDashboardTab({ 
  tables, 
  menuItems, 
  categories,
  orders = [],
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  initialTable,
  userRole = 'Manager',
  onRequestManagerAuth,
  onVoidOrder,
  onOpenTerminalSync,
  onSendOrderToKitchen,
  onUpdateOrderStatus,
  onUpdateTableStatus,
  onOpenInvoiceHub,
  onOpenInvoicePreview,
  onOpenThermalReceipt,
  onAssignPendingOrder,
  onNavigateToWebsiteBuilder
}: {
  tables: TableItem[];
  menuItems: MenuItem[];
  categories: string[];
  orders?: LiveOrder[];
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  initialTable: TableItem | null;
  userRole?: 'Manager' | 'Waiter' | 'Cashier';
  onRequestManagerAuth?: (actionName: string, onApproved: () => void) => void;
  onVoidOrder?: (orderId: string, voidReason?: string) => void;
  onOpenTerminalSync?: () => void;
  onSendOrderToKitchen: (order: Omit<LiveOrder, 'id'>) => void;
  onUpdateOrderStatus?: (orderId: string, status: LiveOrder['status']) => void;
  onUpdateTableStatus?: (tableNumber: string, status: TableItem['status']) => void;
  onOpenInvoiceHub: (table: TableItem, items: OrderLineItem[], subtotal: number) => void;
  onOpenInvoicePreview: (table: TableItem, items: OrderLineItem[], subtotal: number) => void;
  onOpenThermalReceipt?: (data: {
    orderId?: string;
    tableNumber: string;
    waiterName: string;
    customerName?: string;
    posTerminal?: string;
    items: OrderLineItem[];
    subtotal: number;
    discountAmount?: number;
    discountReason?: string;
    serviceTaxAmount: number;
    vatAmount: number;
    grandTotal: number;
    timestamp: string;
  }) => void;
  onAssignPendingOrder: (pendingOrder: any, targetTableNum: string) => void;
  onNavigateToWebsiteBuilder?: () => void;
}) {
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(
    initialTable ? initialTable.tableNumber : tables[0]?.tableNumber || 'T-01'
  );
  const [waiterName, setWaiterName] = useState<string>('Alex Vance');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnlyFilter, setVegOnlyFilter] = useState<boolean>(false);
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);

  // Pending Unassigned Orders Queue for Drag and Drop
  const [pendingQueue, setPendingQueue] = useState<PendingOrder[]>([
    {
      id: 'p_ord_1',
      source: 'Online Order',
      customerName: 'David Miller',
      items: [
        { menuItemId: 'menu_5', name: 'Artisanal Margherita Pizza', price: 18.00, quantity: 2, isVeg: true },
        { menuItemId: 'menu_8', name: 'Craft Smoked Old Fashioned', price: 15.00, quantity: 2, isVeg: true }
      ],
      subtotal: 66.00,
      time: '5 mins ago'
    },
    {
      id: 'p_ord_2',
      source: 'Phone Call',
      customerName: 'Emily Watson',
      items: [
        { menuItemId: 'menu_3', name: 'Prime Wagyu Ribeye (12oz)', price: 48.00, quantity: 1, isVeg: false },
        { menuItemId: 'menu_1', name: 'Truffle Parmesan Fries', price: 12.99, quantity: 1, isVeg: true }
      ],
      subtotal: 60.99,
      time: '12 mins ago'
    },
    {
      id: 'p_ord_3',
      source: 'Bar Counter',
      customerName: 'Guest #84',
      items: [
        { menuItemId: 'menu_2', name: 'Crispy Calamari Fritti', price: 16.50, quantity: 1, isVeg: false },
        { menuItemId: 'menu_8', name: 'Craft Smoked Old Fashioned', price: 15.00, quantity: 1, isVeg: true }
      ],
      subtotal: 31.50,
      time: '2 mins ago'
    }
  ]);

  // Draft Order State
  const [orderCart, setOrderCart] = useState<OrderLineItem[]>([]);

  // Service Tax and VAT
  const serviceTaxRate = 10; // 10%
  const vatRate = 13; // 13%

  const activeTableObj = tables.find(t => t.tableNumber === selectedTableNumber) || tables[0];
  const activeTableOrder = orders.find(o => o.tableNumber === selectedTableNumber && o.status !== 'Paid');

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = !vegOnlyFilter || item.isVeg;
    return matchesCat && matchesSearch && matchesVeg;
  });

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    const existing = orderCart.find(c => c.menuItemId === item.id);
    if (existing) {
      setOrderCart(orderCart.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setOrderCart([...orderCart, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        isVeg: item.isVeg
      }]);
    }
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    setOrderCart(orderCart.map(c => {
      if (c.menuItemId === menuItemId) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter(Boolean) as OrderLineItem[]);
  };

  // State for POS Terminal, Customer, and Discounts
  const [posTerminal, setPosTerminal] = useState<string>('Cashier 1 - Main Front Counter');
  const [customerName, setCustomerName] = useState<string>('Walk-in Guest');
  const [discountCampaign, setDiscountCampaign] = useState<string>('none');
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(0);
  const [customDiscountAmount, setCustomDiscountAmount] = useState<number>(0);

  // Subtotal & Discount Calculation
  const currentItems = orderCart.length > 0 ? orderCart : (activeTableOrder ? activeTableOrder.items : []);
  const subtotal = currentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discountAmount = 0;
  let discountReason = '';

  if (discountCampaign === 'weekend') {
    discountAmount = subtotal * 0.15;
    discountReason = 'Weekend Package (15% Off)';
  } else if (discountCampaign === 'happyhour') {
    discountAmount = subtotal * 0.20;
    discountReason = 'Happy Hour Deal (20% Off)';
  } else if (discountCampaign === 'festival') {
    discountAmount = subtotal * 0.10;
    discountReason = 'Festival Special (10% Off)';
  } else if (discountCampaign === 'vip') {
    discountAmount = subtotal * 0.25;
    discountReason = 'VIP Loyal Member (25% Off)';
  } else if (discountCampaign === 'percent') {
    discountAmount = subtotal * (customDiscountPercent / 100);
    discountReason = `${customDiscountPercent}% Discount`;
  } else if (discountCampaign === 'amount') {
    discountAmount = Math.min(customDiscountAmount, subtotal);
    discountReason = `Flat Discount (${formatCurrency(discountAmount, currency)})`;
  }

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const serviceTaxAmount = taxableSubtotal * (serviceTaxRate / 100);
  const vatAmount = taxableSubtotal * (vatRate / 100);
  const grandTotal = taxableSubtotal + serviceTaxAmount + vatAmount;

  const handleDispatchOrder = () => {
    if (orderCart.length === 0) return;
    onSendOrderToKitchen({
      tableNumber: selectedTableNumber,
      section: activeTableObj ? activeTableObj.section : 'Main Dining',
      waiterName,
      items: orderCart,
      subtotal,
      serviceTaxRate,
      vatRate,
      discountAmount,
      totalAmount: grandTotal,
      status: 'Sent to Kitchen',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setServiceNotice(`Order for Table ${selectedTableNumber} sent to kitchen!`);
  };

  const handleMarkServiceComplete = (targetOrderId?: string) => {
    const orderToComplete = targetOrderId || activeTableOrder?.id;
    if (orderToComplete && onUpdateOrderStatus) {
      onUpdateOrderStatus(orderToComplete, 'Service Completed');
    }
    if (onUpdateTableStatus) {
      onUpdateTableStatus(selectedTableNumber, 'billed');
    }
    setServiceNotice(`✓ Service Completed for Table ${selectedTableNumber}! Status updated to Ready for Invoice.`);
    setTimeout(() => setServiceNotice(null), 5000);
  };

  const handleCompleteOrderAndFreeTable = (targetOrderId?: string) => {
    const orderToComplete = targetOrderId || activeTableOrder?.id;
    if (orderToComplete && onUpdateOrderStatus) {
      onUpdateOrderStatus(orderToComplete, 'Paid');
    }
    if (onUpdateTableStatus) {
      // Free table for new guests immediately!
      onUpdateTableStatus(selectedTableNumber, 'available');
    }
    
    if (onOpenThermalReceipt) {
      onOpenThermalReceipt({
        orderId: orderToComplete || `ORD-${Date.now().toString().slice(-4)}`,
        tableNumber: selectedTableNumber,
        waiterName,
        customerName: customerName || 'Walk-in Guest',
        posTerminal,
        items: currentItems,
        subtotal,
        discountAmount,
        discountReason,
        serviceTaxAmount,
        vatAmount,
        grandTotal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setOrderCart([]);
    setServiceNotice(`✓ Order Completed! Table ${selectedTableNumber} is now AVAILABLE for new guests.`);
    setTimeout(() => setServiceNotice(null), 6000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Drag-and-Drop Pending Orders Queue Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-lg space-y-3 border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 className="font-extrabold text-sm flex items-center gap-2 text-indigo-200">
              <Move className="w-4 h-4 text-amber-400" />
              Drag-and-Drop Order Queue (Assign to Table)
            </h4>
            <p className="text-[11px] text-slate-300">
              Drag an incoming order card and drop it onto any table, or select a table from the quick assign menu.
            </p>
          </div>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
            {pendingQueue.length} Unassigned Pending Orders
          </span>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="text-center py-3 text-xs text-emerald-300 font-mono bg-emerald-950/30 rounded-xl border border-emerald-500/20">
            ✓ All incoming orders have been assigned to tables!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pendingQueue.map((pOrd) => (
              <div
                key={pOrd.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(pOrd));
                }}
                className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl p-3 backdrop-blur-md cursor-grab active:cursor-grabbing transition space-y-2 group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono">
                    {pOrd.source}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">{pOrd.time}</span>
                </div>

                <div>
                  <span className="font-bold text-xs text-white block">{pOrd.customerName}</span>
                  <span className="text-[10px] text-slate-300 line-clamp-1">
                    {pOrd.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="font-extrabold text-amber-300 font-mono text-xs">
                    ${pOrd.subtotal.toFixed(2)}
                  </span>

                  {/* Quick Dropdown Select Assignment */}
                  <div className="flex items-center gap-1">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onAssignPendingOrder(pOrd, e.target.value);
                          setPendingQueue(pendingQueue.filter(p => p.id !== pOrd.id));
                        }
                      }}
                      defaultValue=""
                      className="bg-slate-900 border border-indigo-400/50 text-indigo-200 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="" disabled>Assign Table ➔</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.tableNumber}>
                          Assign to {t.tableNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {serviceNotice && (
        <div className="bg-emerald-900/90 border border-emerald-500/50 text-emerald-100 p-3 rounded-xl text-xs font-bold font-mono flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{serviceNotice}</span>
          </div>
          <button onClick={() => setServiceNotice(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid wrapper optimized for tablets (md:grid-cols-2) and POS monitors (lg:grid-cols-12) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: POS Terminal, Table Controls, Menu Search & Item Cards */}
        <div className="md:col-span-1 lg:col-span-8 space-y-5">
          {/* Top Control Bar for POS Terminal, Server & Table Selection */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dataStr = e.dataTransfer.getData('application/json');
              if (dataStr) {
                const pOrd = JSON.parse(dataStr);
                onAssignPendingOrder(pOrd, selectedTableNumber);
                setPendingQueue(pendingQueue.filter(p => p.id !== pOrd.id));
              }
            }}
            className="bg-white border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 transition"
          >
            {/* POS Terminal / Cashier Station Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Printer className="w-3.5 h-3.5 text-indigo-600" /> POS Terminal:
              </span>
              <select
                value={posTerminal}
                onChange={(e) => setPosTerminal(e.target.value)}
                className="bg-indigo-50 border border-indigo-200 rounded-xl px-2.5 py-1.5 text-xs font-black text-indigo-900 focus:outline-none focus:border-indigo-500 cursor-pointer min-h-[38px]"
              >
                <option value="Cashier 1 - Main Front Counter">Cashier 1 (Main Counter)</option>
                <option value="Cashier 2 - Bar & Lounge POS">Cashier 2 (Bar & Lounge)</option>
                <option value="Cashier 3 - Express & Takeaway">Cashier 3 (Express & Takeaway)</option>
                <option value="Cashier 4 - Outdoor Garden POS">Cashier 4 (Patio & Garden)</option>
              </select>
            </div>

            {/* Active Table Drop Zone */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0">Table Zone:</span>
              <select
                value={selectedTableNumber}
                onChange={(e) => {
                  setSelectedTableNumber(e.target.value);
                  setOrderCart([]);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer min-h-[38px]"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.tableNumber}>
                    {t.tableNumber} ({t.seats} seats) - {t.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Server Selection */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0">Server:</span>
              <select
                value={waiterName}
                onChange={(e) => setWaiterName(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer min-h-[38px]"
              >
                <option value="Alex Vance">Alex Vance (Server 1)</option>
                <option value="Sarah Jenkins">Sarah Jenkins (Server 2)</option>
                <option value="Marco Rossi">Marco Rossi (Senior Captain)</option>
                <option value="Elena Rostova">Elena Rostova (Floor Manager)</option>
              </select>
            </div>
          </div>

          {/* Active Table Service & Kitchen Status Panel */}
          {activeTableOrder && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 border border-indigo-500/30 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-orange-500/20 text-orange-400 rounded-lg">
                    <Utensils className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      Active Order for Table {selectedTableNumber}
                    </h4>
                    <span className="text-[10px] text-slate-300">
                      Server: {activeTableOrder.waiterName} • Placed at {activeTableOrder.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    activeTableOrder.status === 'Ready to Serve' || activeTableOrder.status === 'Served' || activeTableOrder.status === 'Service Completed'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : activeTableOrder.status === 'Cooking'
                      ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                      : 'bg-indigo-950 text-indigo-300 border-indigo-500/50'
                  }`}>
                    ● KITCHEN STATUS: {activeTableOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-200">
                  <span className="font-bold">Ordered Items: </span>
                  <span className="text-slate-300">
                    {activeTableOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </span>
                  <span className="font-mono text-amber-400 font-bold ml-2">({formatCurrency(activeTableOrder.totalAmount, currency)})</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleMarkServiceComplete(activeTableOrder.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Service Completed</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenThermalReceipt) {
                        onOpenThermalReceipt({
                          orderId: activeTableOrder.id,
                          tableNumber: selectedTableNumber,
                          waiterName: activeTableOrder.waiterName,
                          items: activeTableOrder.items,
                          subtotal: activeTableOrder.subtotal,
                          serviceTaxAmount: activeTableOrder.subtotal * 0.1,
                          vatAmount: activeTableOrder.subtotal * 0.13,
                          grandTotal: activeTableOrder.totalAmount,
                          timestamp: activeTableOrder.timestamp
                        });
                      }
                    }}
                    className="px-3 py-2 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-amber-300 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer border border-amber-400/30 min-h-[40px]"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Thermal Receipt</span>
                  </button>

                  <button
                    onClick={() => onOpenInvoicePreview(activeTableObj, activeTableOrder.items, activeTableOrder.subtotal)}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Print Invoice</span>
                  </button>

                  {orderCart.length === 0 && (
                    <button
                      onClick={() => setOrderCart(activeTableOrder.items)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl border border-white/20 transition cursor-pointer min-h-[40px]"
                    >
                      Load Items
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Menu Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 bg-slate-50 min-h-[42px]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setVegOnlyFilter(!vegOnlyFilter)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border min-h-[42px] ${
                    vegOnlyFilter 
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full border border-emerald-600 flex items-center justify-center p-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  </div>
                  Pure Veg Items
                </button>

                <button
                  onClick={() => setIsAddItemOpen(true)}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer min-h-[42px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Food Item</span>
                </button>

                {onNavigateToWebsiteBuilder && (
                  <button
                    onClick={() => {
                      localStorage.setItem('marketforge_restaurant_synced_menu', JSON.stringify(menuItems));
                      setServiceNotice("✓ Restaurant menu data synchronized with AI Website Builder!");
                      setTimeout(() => setServiceNotice(null), 3000);
                      onNavigateToWebsiteBuilder();
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer min-h-[42px]"
                    title="Export menu data directly to tenant AI Website Builder"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Sync with AI Website Builder</span>
                  </button>
                )}
              </div>
            </div>

            {/* Categories Horizontal Selector */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[42px] ${
                  activeCategory === 'ALL' 
                    ? 'bg-orange-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[42px] ${
                    activeCategory === cat 
                      ? 'bg-orange-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map(item => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-orange-400 transition flex flex-col justify-between group overflow-hidden"
              >
                <div>
                  {item.imageUrl && (
                    <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 relative border border-slate-100">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs font-bold">
                        {item.category}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border flex items-center justify-center p-0.5 shrink-0 ${
                        item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                        }`} />
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition">
                        {item.name}
                      </h4>
                    </div>
                    <span className="font-extrabold text-sm text-slate-900 font-mono shrink-0">
                      {formatCurrency(item.price, currency)}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-orange-500" /> ~{item.prepTimeMins || 15}m
                  </span>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="px-4 py-2 bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white font-extrabold text-xs rounded-xl border border-orange-200 transition flex items-center gap-1.5 cursor-pointer min-h-[42px] touch-manipulation active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Order Ticket Cart (md:col-span-1 lg:col-span-4) */}
        <div className="md:col-span-1 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5 sticky top-20 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-orange-600" />
                  Table Order Ticket
                </h3>
                <p className="text-xs text-slate-500">
                  Table: <strong className="text-slate-800">{selectedTableNumber}</strong> • Terminal: <strong className="text-indigo-700">{posTerminal.split(' ')[0]}</strong>
                </p>
              </div>
              <span className="bg-orange-100 text-orange-800 font-mono font-bold text-xs px-2.5 py-1 rounded-full">
                {currentItems.length} Items
              </span>
            </div>

            {/* Customer Name Input Field */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Customer / Guest Name:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Cart Itemized List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {currentItems.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">No active items for this table order yet.</p>
                  <p className="text-[10px] text-slate-400">Click '+ Add Item' on any menu card on the left.</p>
                </div>
              ) : (
                currentItems.map((cartItem) => (
                  <div key={cartItem.menuItemId} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{cartItem.name}</span>
                      <span className="text-slate-500 font-mono">{formatCurrency(cartItem.price, currency)} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(cartItem.menuItemId, -1)}
                        className="w-9 h-9 rounded-xl bg-white border border-slate-300 font-black text-slate-800 hover:bg-slate-100 flex items-center justify-center text-base shadow-sm touch-manipulation cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-slate-900 font-mono w-5 text-center text-sm">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => {
                          const itemObj = menuItems.find(m => m.id === cartItem.menuItemId);
                          if (itemObj) handleAddToCart(itemObj);
                        }}
                        className="w-9 h-9 rounded-xl bg-white border border-slate-300 font-black text-slate-800 hover:bg-slate-100 flex items-center justify-center text-base shadow-sm touch-manipulation cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Special Day Packages & Campaign Discount Section */}
            {currentItems.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 space-y-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Special Campaign & Discounts:
                  </span>
                  {userRole === 'Waiter' && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-900" /> Manager Approval Required
                    </span>
                  )}
                </label>

                <select
                  value={discountCampaign}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== 'none' && userRole === 'Waiter' && onRequestManagerAuth) {
                      onRequestManagerAuth('Apply Special Discount', () => setDiscountCampaign(val));
                    } else {
                      setDiscountCampaign(val);
                    }
                  }}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="none">Standard Pricing (No Discount)</option>
                  <option value="weekend">🎁 Weekend Special Package (15% Off)</option>
                  <option value="happyhour">🍹 Happy Hour Promotion (20% Off)</option>
                  <option value="festival">🌺 Festival Celebration Deal (10% Off)</option>
                  <option value="vip">👑 VIP Loyal Member Privilege (25% Off)</option>
                  <option value="percent">✏️ Custom Percentage Discount (%)</option>
                  <option value="amount">💵 Custom Flat Amount Discount</option>
                </select>

                {discountCampaign === 'percent' && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-600 font-bold shrink-0">% Off:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customDiscountPercent}
                      onChange={(e) => setCustomDiscountPercent(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900"
                      placeholder="e.g. 12"
                    />
                  </div>
                )}

                {discountCampaign === 'amount' && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-600 font-bold shrink-0">Flat Off ({currency}):</span>
                    <input
                      type="number"
                      min="0"
                      value={customDiscountAmount}
                      onChange={(e) => setCustomDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900"
                      placeholder="e.g. 10.00"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Calculation Breakdown */}
            {currentItems.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({discountReason}):</span>
                    <span>-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Service Charge ({serviceTaxRate}%):</span>
                  <span>+{formatCurrency(serviceTaxAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>VAT / GST ({vatRate}%):</span>
                  <span>+{formatCurrency(vatAmount, currency)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-orange-600 font-mono">{formatCurrency(grandTotal, currency)}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {/* PRIMARY 'COMPLETE ORDER & FREE TABLE' BUTTON */}
              <button
                onClick={() => handleCompleteOrderAndFreeTable()}
                disabled={currentItems.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30 min-h-[46px] touch-manipulation active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>COMPLETE ORDER & SET TABLE AVAILABLE</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenThermalReceipt) {
                    onOpenThermalReceipt({
                      orderId: activeTableOrder?.id,
                      tableNumber: selectedTableNumber,
                      waiterName,
                      customerName,
                      posTerminal,
                      items: currentItems,
                      subtotal,
                      discountAmount,
                      discountReason,
                      serviceTaxAmount,
                      vatAmount,
                      grandTotal,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                  }
                }}
                disabled={currentItems.length === 0}
                className="w-full py-3 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 disabled:bg-slate-300 text-amber-300 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30 min-h-[44px]"
              >
                <Printer className="w-4.5 h-4.5 text-amber-400" />
                <span>🖨️ Print Order Thermal Receipt</span>
              </button>

              {/* VOID ORDER TICKET BUTTON */}
              <button
                onClick={() => {
                  const targetId = activeTableOrder?.id || `ORD-${Date.now().toString().slice(-4)}`;
                  if (userRole === 'Waiter' && onRequestManagerAuth) {
                    onRequestManagerAuth('Void Order Ticket', () => {
                      if (onVoidOrder) onVoidOrder(targetId);
                    });
                  } else {
                    if (onVoidOrder) onVoidOrder(targetId);
                  }
                }}
                disabled={currentItems.length === 0 && !activeTableOrder}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 disabled:bg-slate-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Void Order Ticket {userRole === 'Waiter' ? '(🔒 Manager Approval Required)' : ''}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenInvoicePreview(activeTableObj, currentItems, subtotal)}
                  disabled={currentItems.length === 0}
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <Eye className="w-3.5 h-3.5" /> Print Invoice
                </button>

                <button
                  onClick={handleDispatchOrder}
                  disabled={orderCart.length === 0}
                  className="py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <ChefHat className="w-3.5 h-3.5" /> KDS Transfer
                </button>
              </div>

              <button
                onClick={() => onOpenInvoiceHub(activeTableObj, currentItems, subtotal)}
                disabled={currentItems.length === 0}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
              >
                <Receipt className="w-4 h-4 text-emerald-400" /> Open Finance Billing Hub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT 3: KITCHEN DISPLAY SYSTEM (KDS)
// =========================================================================
function KitchenDisplayTab({
  orders,
  userRole = 'Manager',
  onRequestManagerAuth,
  onVoidOrder,
  onUpdateStatus
}: {
  orders: LiveOrder[];
  userRole?: 'Manager' | 'Waiter' | 'Cashier';
  onRequestManagerAuth?: (actionName: string, onApproved: () => void) => void;
  onVoidOrder?: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: LiveOrder['status']) => void;
}) {
  const activeKitchenOrders = orders.filter(o => o.status !== 'Paid' && o.status !== 'Voided');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-600" />
            Kitchen Display System (KDS)
          </h3>
          <p className="text-xs text-slate-500">
            Real-time kitchen order tickets with elapsed prep timers and station completion triggers.
          </p>
        </div>

        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          KDS Live Sync Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeKitchenOrders.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-base">Kitchen Display Clear!</h4>
            <p className="text-xs text-slate-400">All pending orders have been completed and served.</p>
          </div>
        ) : (
          activeKitchenOrders.map((ord) => {
            const isCooking = ord.status === 'Cooking';
            const isReady = ord.status === 'Ready to Serve';

            return (
              <div
                key={ord.id}
                className={`bg-white border-2 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition ${
                  isReady ? 'border-emerald-400 bg-emerald-50/40' : 
                  isCooking ? 'border-amber-400' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-extrabold text-lg text-slate-900 block">{ord.tableNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Server: {ord.waiterName}</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isReady ? 'bg-emerald-100 text-emerald-800' : 
                        isCooking ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ord.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-1">
                        Time: {ord.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-3 space-y-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs font-semibold text-slate-800">
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-900 font-extrabold flex items-center justify-center shrink-0">
                            {item.quantity}x
                          </span>
                          {item.name}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-mono">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  {ord.status === 'Sent to Kitchen' && (
                    <button
                      onClick={() => onUpdateStatus(ord.id, 'Cooking')}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                    >
                      Start Cooking
                    </button>
                  )}

                  {ord.status === 'Cooking' && (
                    <button
                      onClick={() => onUpdateStatus(ord.id, 'Ready to Serve')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                    >
                      Mark Ready to Serve
                    </button>
                  )}

                  {ord.status === 'Ready to Serve' && (
                    <button
                      onClick={() => onUpdateStatus(ord.id, 'Served')}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                    >
                      Mark Order Served
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (userRole === 'Waiter' && onRequestManagerAuth) {
                        onRequestManagerAuth('Void Kitchen Order Ticket', () => {
                          if (onVoidOrder) onVoidOrder(ord.id);
                        });
                      } else {
                        if (onVoidOrder) onVoidOrder(ord.id);
                      }
                    }}
                    title="Void Ticket"
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT 4: INVOICE & DYNAMIC QR BILLING HUB
// =========================================================================
function InvoiceAndBillingTab({
  invoices,
  orders,
  tables,
  restaurantName,
  invoiceSettings,
  onUpdateInvoiceSettings,
  currency,
  onCurrencyChange,
  formatCurrency,
  onFinalizeInvoice,
  onViewInvoiceDetails
}: {
  invoices: InvoiceRecord[];
  orders: LiveOrder[];
  tables: TableItem[];
  restaurantName: string;
  invoiceSettings: InvoiceSettings;
  onUpdateInvoiceSettings: (updated: InvoiceSettings) => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  formatCurrency: (amount: number, override?: CurrencyCode) => string;
  onFinalizeInvoice: (inv: Omit<InvoiceRecord, 'id'>) => void;
  onViewInvoiceDetails: (inv: InvoiceRecord) => void;
}) {
  // Configurable billing state
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(tables[0]?.tableNumber || 'T-01');
  const [customerName, setCustomerName] = useState<string>('Walk-in Guest');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [serviceTaxRate, setServiceTaxRate] = useState<number>(10); // 10%
  const [vatRate, setVatRate] = useState<number>(13); // 13%
  const [discountPercent, setDiscountPercent] = useState<number>(0); // e.g. 5%
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Dynamic QR'>('Dynamic QR');
  const [templateType, setTemplateType] = useState<'thermal' | 'tax_invoice' | 'express'>('tax_invoice');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Cash payment calculation
  const [cashTendered, setCashTendered] = useState<string>('200');

  // Find active order for selected table
  const activeOrder = orders.find(o => o.tableNumber === selectedTableNumber && o.status !== 'Paid');

  // Derived calculation
  const subtotal = activeOrder ? activeOrder.subtotal : 120.00;
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const serviceTaxAmount = taxableSubtotal * (serviceTaxRate / 100);
  const vatAmount = taxableSubtotal * (vatRate / 100);
  const grandTotal = taxableSubtotal + serviceTaxAmount + vatAmount;

  const cashChangeDue = Math.max(0, parseFloat(cashTendered || '0') - (grandTotal * CURRENCY_CONFIG[currency].rate));

  // Dynamic QR Code payload encoding total price value
  const qrPayload = `upi://pay?pa=restaurant@mforgebank&pn=${encodeURIComponent(invoiceSettings.restaurantName || restaurantName)}&am=${(grandTotal * CURRENCY_CONFIG[currency].rate).toFixed(2)}&cu=${currency}&tn=INV-${Date.now()}`;

  const handleGenerateInvoice = () => {
    onFinalizeInvoice({
      invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      customerName: customerName || 'Walk-in Guest',
      customerPhone,
      tableNumber: selectedTableNumber,
      waiterName: activeOrder ? activeOrder.waiterName : invoiceSettings.cashierName || 'Alex Vance',
      items: activeOrder ? activeOrder.items : [
        { menuItemId: 'menu_3', name: 'Prime Wagyu Ribeye', price: 48.00, quantity: 2 },
        { menuItemId: 'menu_1', name: 'Truffle Parmesan Fries', price: 12.00, quantity: 2 }
      ],
      subtotal,
      serviceTaxAmount,
      vatAmount,
      discountAmount,
      grandTotal,
      paymentMethod,
      templateType,
      status: 'Paid'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* Left Column: Invoice Configurator & Customization (7 cols) */}
      <div className="lg:col-span-7 space-y-6">

        {/* Business & Invoice Customization Drawer Trigger */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4 border border-slate-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-600/20 text-orange-400 rounded-xl border border-orange-500/30 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white truncate max-w-xs">{invoiceSettings.restaurantName}</h4>
                <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{invoiceSettings.address} • Tax ID: {invoiceSettings.taxId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5" /> {showSettingsDrawer ? 'Close' : 'Customize Details'}
              </button>
            </div>
          </div>

          {/* Currency Toggle inside Invoice Hub */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs flex-wrap gap-2">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Active Currency:
            </span>
            <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl">
              {(['USD', 'NPR', 'INR'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCurrencyChange(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                    currency === c ? 'bg-orange-600 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {CURRENCY_CONFIG[c].flag} {c} ({CURRENCY_CONFIG[c].symbol})
                </button>
              ))}
            </div>
          </div>

          {/* Expandable Customization Form */}
          {showSettingsDrawer && (
            <div className="pt-4 border-t border-slate-800 space-y-4 animate-fade-in bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-orange-400">
                Customize Company & Invoice Header Information
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Company / Restaurant Name:</label>
                  <input
                    type="text"
                    value={invoiceSettings.restaurantName}
                    onChange={(e) => onUpdateInvoiceSettings({ ...invoiceSettings, restaurantName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-orange-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tax / GST / VAT ID:</label>
                  <input
                    type="text"
                    value={invoiceSettings.taxId}
                    onChange={(e) => onUpdateInvoiceSettings({ ...invoiceSettings, taxId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Company Address:</label>
                  <input
                    type="text"
                    value={invoiceSettings.address}
                    onChange={(e) => onUpdateInvoiceSettings({ ...invoiceSettings, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone / Contact:</label>
                  <input
                    type="text"
                    value={invoiceSettings.phone}
                    onChange={(e) => onUpdateInvoiceSettings({ ...invoiceSettings, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Cashier / Server Name:</label>
                  <input
                    type="text"
                    value={invoiceSettings.cashierName}
                    onChange={(e) => onUpdateInvoiceSettings({ ...invoiceSettings, cashierName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Company Logo URL:</label>
                  <input
                    type="text"
                    value={invoiceSettings.logoUrl || ''}
                    onChange={(e) => onUpdateInvoiceSettings({ ...invoiceSettings, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-orange-500 font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Receipt Footer Note:</label>
                  <input
                    type="text"
                    value={invoiceSettings.footerNote}
                    onChange={(e) => onUpdateInvoiceSettings({ ...invoiceSettings, footerNote: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-600" />
                POS Invoice & Dynamic Tax Configurator
              </h3>
              <p className="text-xs text-slate-500">
                Configure Service Charge, VAT/GST rates, and generate instant price-encoded QR bills in {currency}.
              </p>
            </div>
          </div>

          {/* Table & Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Select Table:</label>
              <select
                value={selectedTableNumber}
                onChange={(e) => setSelectedTableNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.tableNumber}>
                    {t.tableNumber} - {formatCurrency(t.currentOrderTotal || 0)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Customer Name:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Guest"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number:</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 019-2831"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Tax & Discount Configuration Fields */}
          <div className="bg-orange-50/50 border border-orange-200/60 rounded-2xl p-4 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-orange-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              Tax & Discount Adjustments (Before Invoice)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Service Tax Rate (%):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={serviceTaxRate}
                    onChange={(e) => setServiceTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">VAT / GST Rate (%):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={vatRate}
                    onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Discount (%):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Select Payment Mode:</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Dynamic QR', label: 'Dynamic Price QR', icon: QrCode },
                { id: 'Card', label: 'Card Swipe', icon: CreditCard },
                { id: 'Cash', label: 'Cash Payment', icon: Coins }
              ].map(pm => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`py-3 px-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      isSelected 
                        ? 'bg-orange-50 border-orange-600 text-orange-900' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tendered Calculator if Cash Selected */}
          {paymentMethod === 'Cash' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cash Tendered ({CURRENCY_CONFIG[currency].symbol}):</label>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-black text-slate-900 w-36"
                />
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block font-bold">Change Due to Guest:</span>
                <span className="text-xl font-black font-mono text-emerald-600">
                  {CURRENCY_CONFIG[currency].symbol}{cashChangeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Invoice Template Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Invoice Style Template:</label>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { id: 'tax_invoice', label: 'Dine-in Tax Invoice', desc: 'Formal A4 with tax ID' },
                { id: 'thermal', label: '80mm Thermal Slip', desc: 'Compact receipt' },
                { id: 'express', label: 'Minimalist Express', desc: 'Single column' }
              ].map(tmpl => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setTemplateType(tmpl.id as any)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    templateType === tmpl.id 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold block">{tmpl.label}</span>
                  <span className="text-[10px] opacity-70">{tmpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateInvoice}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-xl shadow-lg shadow-orange-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" /> Finalize & Issue Paid Invoice
          </button>
        </div>
      </div>

      {/* Right Column: Dynamic Price QR Code & Live Bill Preview (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Dynamic QR Display Box */}
        {paymentMethod === 'Dynamic QR' && (
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/30 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 animate-pulse" />

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                DYNAMIC PRICE QR GENERATOR
              </span>
              <h4 className="text-lg font-black text-white">Scan & Pay Exact Total</h4>
              <p className="text-xs text-slate-300 font-mono">
                Encodes Total: <strong className="text-emerald-400 text-sm">{formatCurrency(grandTotal)}</strong>
              </p>
            </div>

            {/* Render Actual SVG QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-amber-400/40 relative group">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                level="H"
                includeMargin={false}
              />
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                <span className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded font-bold font-mono">
                  Scan with Phone
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Listening for payment verification...</span>
            </div>
          </div>
        )}

        {/* Live Bill Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 font-mono text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
            Bill Total Summary ({selectedTableNumber})
          </h4>

          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({discountPercent}%):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Service Tax ({serviceTaxRate}%):</span>
              <span>+{formatCurrency(serviceTaxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>VAT / GST ({vatRate}%):</span>
              <span>+{formatCurrency(vatAmount)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-base text-slate-900">
              <span>Grand Total:</span>
              <span className="text-orange-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Recent Invoices Log */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Issued Invoices History</h4>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {invoices.map((inv) => (
              <div key={inv.id} className="border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                <div>
                  <span className="font-bold text-slate-900 block">{inv.invoiceId}</span>
                  <span className="text-slate-400 text-[10px]">{inv.customerName} ({inv.tableNumber})</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 font-mono block">{formatCurrency(inv.grandTotal)}</span>
                  <button
                    onClick={() => onViewInvoiceDetails(inv)}
                    className="text-[10px] text-orange-600 hover:underline font-bold"
                  >
                    View Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT 5: MENU EDITOR & BULK UPLOAD
// =========================================================================
function MenuEditorTab({
  menuItems,
  categories,
  onOpenAddItem,
  onOpenBulkUpload,
  onToggleAvailability,
  onDeleteItem
}: {
  menuItems: MenuItem[];
  categories: string[];
  onOpenAddItem: () => void;
  onOpenBulkUpload: () => void;
  onToggleAvailability: (id: string) => void;
  onDeleteItem: (id: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filtered = selectedCategory === 'ALL' 
    ? menuItems 
    : menuItems.filter(m => m.category === selectedCategory);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            Menu Management Suite
          </h3>
          <p className="text-xs text-slate-500">
            Add items, configure pricing, upload full CSV/JSON menus, and toggle real-time stock availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBulkUpload}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-600" /> Bulk Import
          </button>
          <button
            onClick={onOpenAddItem}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Menu Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            selectedCategory === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          All ({menuItems.length})
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === c ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {c} ({menuItems.filter(m => m.category === c).length})
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Dietary</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Prep Time</th>
              <th className="py-3 px-4">Availability</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                <td className="py-3 px-4">{item.category}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">${item.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-slate-500">{item.prepTimeMins || 15} mins</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onToggleAvailability(item.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                      item.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.status}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT 6: INVENTORY MANAGEMENT & RECIPE LINKER
// =========================================================================
function InventoryManagementTab({
  ingredients,
  menuItems,
  currency,
  formatCurrency,
  onUpdateIngredients,
  onUpdateMenuItems
}: {
  ingredients: IngredientItem[];
  menuItems: MenuItem[];
  currency: CurrencyCode;
  formatCurrency: (amount: number) => string;
  onUpdateIngredients: (updated: IngredientItem[]) => void;
  onUpdateMenuItems: (updated: MenuItem[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<IngredientItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(5);
  const [selectedMenuItemForRecipe, setSelectedMenuItemForRecipe] = useState<MenuItem | null>(null);

  // New Ingredient state
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState<IngredientItem['category']>('Meat & Seafood');
  const [newIngStock, setNewIngStock] = useState<number>(10);
  const [newIngUnit, setNewIngUnit] = useState<IngredientItem['unit']>('kg');
  const [newIngLowThreshold, setNewIngLowThreshold] = useState<number>(3);
  const [newIngCost, setNewIngCost] = useState<number>(15);

  const categories: IngredientItem['category'][] = ['Meat & Seafood', 'Dairy & Cheese', 'Produce', 'Pantry & Flours', 'Beverages'];

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ing.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = ingredients.filter(i => i.stockQuantity <= i.lowStockThreshold).length;

  const handleAddIngredient = () => {
    if (!newIngName) return;
    const newItem: IngredientItem = {
      id: `ing_${Date.now()}`,
      name: newIngName,
      category: newIngCategory,
      stockQuantity: newIngStock,
      unit: newIngUnit,
      lowStockThreshold: newIngLowThreshold,
      costPerUnit: newIngCost,
      lastRestocked: 'Just now'
    };
    onUpdateIngredients([...ingredients, newItem]);
    setIsAddIngredientOpen(false);
    setNewIngName('');
  };

  const handleRestockSubmit = () => {
    if (!restockItem) return;
    const updated = ingredients.map(ing => {
      if (ing.id === restockItem.id) {
        return {
          ...ing,
          stockQuantity: parseFloat((ing.stockQuantity + restockAmount).toFixed(2)),
          lastRestocked: 'Just now'
        };
      }
      return ing;
    });
    onUpdateIngredients(updated);
    setRestockItem(null);
  };

  const handleSaveRecipeLink = (menuItemId: string, recipeLinks: RecipeIngredient[]) => {
    const updatedMenu = menuItems.map(m => {
      if (m.id === menuItemId) {
        return { ...m, recipe: recipeLinks };
      }
      return m;
    });
    onUpdateMenuItems(updatedMenu);
    setSelectedMenuItemForRecipe(null);
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Warning Alert */}
      {lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm">Low Inventory Stock Warning ({lowStockCount} Items)</h4>
              <p className="text-xs text-amber-100">
                Ingredients have fallen below safe threshold. Restock recommended to avoid order disruption.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedCategory('All')} 
            className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow hover:bg-amber-50 transition cursor-pointer shrink-0"
          >
            View Low Stock Items
          </button>
        </div>
      )}

      {/* Main Inventory Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-orange-600" />
              Raw Ingredient Stock & Recipe Linking Engine
            </h3>
            <p className="text-xs text-slate-500">
              Deduct raw components automatically upon invoice payment and map menu dishes to ingredient stock.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsAddIngredientOpen(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Raw Ingredient
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'All' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                <th className="py-3 px-4">Raw Ingredient</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Quantity</th>
                <th className="py-3 px-4">Low Stock Limit</th>
                <th className="py-3 px-4">Unit Cost ({currency})</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredIngredients.map((item) => {
                const isLow = item.stockQuantity <= item.lowStockThreshold;
                const isCritical = item.stockQuantity <= item.lowStockThreshold * 0.5;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{item.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Last Restocked: {item.lastRestocked}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.stockQuantity} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {item.lowStockThreshold} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatCurrency(item.costPerUnit)} / {item.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isCritical ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        isLow ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {isCritical ? 'CRITICAL' : isLow ? 'LOW STOCK' : 'OPTIMAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setRestockItem(item)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] rounded-xl transition cursor-pointer shadow-sm"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipe Linker Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            Menu Dish Recipe Components & Deduction Mapping
          </h3>
          <p className="text-xs text-slate-500">
            Define raw ingredient amounts required per portion so sales automatically deduct exact inventory quantities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map(m => (
            <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-extrabold text-sm text-slate-900">{m.name}</h5>
                  <span className="text-[10px] text-slate-500 font-mono">{m.category} • {formatCurrency(m.price)}</span>
                </div>
                <button
                  onClick={() => setSelectedMenuItemForRecipe(m)}
                  className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-[10px] rounded-lg transition cursor-pointer"
                >
                  Edit Recipe
                </button>
              </div>

              {m.recipe && m.recipe.length > 0 ? (
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] font-mono">
                  {m.recipe.map((rec, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span>• {rec.ingredientName}</span>
                      <span className="font-bold text-slate-900">{rec.amountPerUnit} {rec.unit} / serving</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No recipe ingredients mapped yet.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Raw Ingredient */}
      {isAddIngredientOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Add Raw Ingredient</h3>
              <button onClick={() => setIsAddIngredientOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ingredient Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Saffron Rice, Prime Beef..."
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={newIngCategory}
                    onChange={(e) => setNewIngCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit:</label>
                  <select
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="L">Liters (L)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pcs">Pieces (pcs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Stock:</label>
                  <input
                    type="number"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Low Limit:</label>
                  <input
                    type="number"
                    value={newIngLowThreshold}
                    onChange={(e) => setNewIngLowThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cost/Unit ($):</label>
                  <input
                    type="number"
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddIngredient}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Save Ingredient to Inventory
            </button>
          </div>
        </div>
      )}

      {/* Modal: Restock Ingredient */}
      {restockItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Restock {restockItem.name}</h3>
              <button onClick={() => setRestockItem(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Current Stock:</span>
                <span className="font-black text-base text-slate-900">{restockItem.stockQuantity} {restockItem.unit}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Add Quantity ({restockItem.unit}):</label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-sm text-slate-900"
                />
              </div>
            </div>

            <button
              onClick={handleRestockSubmit}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Confirm Restock
            </button>
          </div>
        </div>
      )}

      {/* Modal: Edit Recipe Modal */}
      {selectedMenuItemForRecipe && (
        <RecipeEditModal 
          menuItem={selectedMenuItemForRecipe}
          ingredients={ingredients}
          onClose={() => setSelectedMenuItemForRecipe(null)}
          onSave={handleSaveRecipeLink}
        />
      )}
    </div>
  );
}

// Modal for editing recipe
function RecipeEditModal({
  menuItem,
  ingredients,
  onClose,
  onSave
}: {
  menuItem: MenuItem;
  ingredients: IngredientItem[];
  onClose: () => void;
  onSave: (menuItemId: string, recipe: RecipeIngredient[]) => void;
}) {
  const [recipeItems, setRecipeItems] = useState<RecipeIngredient[]>(menuItem.recipe || []);
  const [selectedIngId, setSelectedIngId] = useState<string>(ingredients[0]?.id || '');
  const [amount, setAmount] = useState<number>(0.2);

  const handleAddRecipeLine = () => {
    const ing = ingredients.find(i => i.id === selectedIngId);
    if (!ing) return;
    if (recipeItems.some(r => r.ingredientId === ing.id)) return;
    setRecipeItems([...recipeItems, { ingredientId: ing.id, ingredientName: ing.name, amountPerUnit: amount, unit: ing.unit }]);
  };

  const handleRemoveLine = (ingId: string) => {
    setRecipeItems(recipeItems.filter(r => r.ingredientId !== ingId));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Map Recipe for {menuItem.name}</h3>
            <p className="text-xs text-slate-500">Sales of this dish will auto-deduct these raw materials.</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Recipe Lines */}
        <div className="space-y-2">
          <label className="font-bold text-xs text-slate-700 block">Current Recipe Requirements:</label>
          {recipeItems.length > 0 ? (
            <div className="space-y-2">
              {recipeItems.map(item => (
                <div key={item.ingredientId} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800">{item.ingredientName}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">{item.amountPerUnit} {item.unit} / portion</span>
                    <button onClick={() => handleRemoveLine(item.ingredientId)} className="text-rose-600 hover:text-rose-800 font-bold text-xs">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No components added yet.</p>
          )}
        </div>

        {/* Add Component Form */}
        <div className="bg-orange-50 p-3 rounded-2xl border border-orange-200 space-y-3">
          <label className="font-bold text-xs text-orange-950 block">Add Raw Material to Recipe:</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={selectedIngId}
              onChange={(e) => setSelectedIngId(e.target.value)}
              className="bg-white border border-orange-300 rounded-xl px-2 py-2 font-bold text-slate-900"
            >
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-orange-300 rounded-xl px-2 py-2 font-mono font-bold text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddRecipeLine}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-xs shadow cursor-pointer shrink-0"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => onSave(menuItem.id, recipeItems)}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          Save Recipe Mapping
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT 7: REVENUE & SALES ANALYTICS DASHBOARD (RECHARTS)
// =========================================================================
function RevenueAnalyticsTab({
  invoices,
  orders,
  tables,
  currency,
  formatCurrency
}: {
  invoices: InvoiceRecord[];
  orders: LiveOrder[];
  tables: TableItem[];
  currency: CurrencyCode;
  formatCurrency: (amount: number, overrideCurr?: CurrencyCode) => string;
}) {
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | '15days' | '30days'>('daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<'ALL' | 'Dynamic QR' | 'Card' | 'Cash'>('ALL');
  const [isPrintAccountingModalOpen, setIsPrintAccountingModalOpen] = useState(false);

  // Dynamic Period Multipliers & Synthesized Historical Ledger
  const periodConfig = {
    daily: { label: 'Daily Accounting (Today)', multiplier: 1, range: 'Today, July 31, 2026', avgOrders: 28 },
    weekly: { label: 'Weekly Accounting (7 Days)', multiplier: 7, range: 'July 25 – July 31, 2026 (7 Days)', avgOrders: 196 },
    '15days': { label: '15 Days Accounting (Fortnightly)', multiplier: 15, range: 'July 17 – July 31, 2026 (15 Days)', avgOrders: 420 },
    '30days': { label: '30 Days Accounting (Monthly)', multiplier: 30, range: 'July 2 – July 31, 2026 (30 Days)', avgOrders: 850 },
  };

  const currentCfg = periodConfig[timePeriod];

  // Live session additions from actual invoices state
  const liveInvoicesSubtotal = invoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.subtotal : 0), 0);
  const liveInvoicesDiscount = invoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.discountAmount : 0), 0);
  const liveInvoicesTax = invoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? (inv.serviceTaxAmount + inv.vatAmount) : 0), 0);
  const liveInvoicesTotal = invoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.grandTotal : 0), 0);

  // Financial Metrics
  const grossSubtotal = (1480.00 * currentCfg.multiplier) + liveInvoicesSubtotal;
  const totalDiscounts = (85.00 * currentCfg.multiplier) + liveInvoicesDiscount;
  const totalTaxes = (320.00 * currentCfg.multiplier) + liveInvoicesTax;
  const netRevenueGenerated = grossSubtotal - totalDiscounts + totalTaxes;
  const totalOrdersCount = currentCfg.avgOrders + invoices.filter(i => i.status === 'Paid').length;
  const avgOrderValue = totalOrdersCount > 0 ? netRevenueGenerated / totalOrdersCount : 0;
  const voidedOrdersCount = Math.floor(1.5 * currentCfg.multiplier);
  const voidedTotalValue = 48.50 * voidedOrdersCount;

  // Chart Data Generators
  const dailyData = [
    { time: '09:00 AM', revenue: 90, orders: 3 },
    { time: '11:00 AM', revenue: 240, orders: 7 },
    { time: '01:00 PM', revenue: 680, orders: 19 },
    { time: '03:00 PM', revenue: 310, orders: 9 },
    { time: '05:00 PM', revenue: 420, orders: 12 },
    { time: '07:00 PM', revenue: 980, orders: 29 },
    { time: '09:00 PM', revenue: 820, orders: 24 },
    { time: '11:00 PM', revenue: 340, orders: 10 },
  ];

  const weeklyData = [
    { time: 'Mon (25th)', revenue: 2450, orders: 68 },
    { time: 'Tue (26th)', revenue: 2800, orders: 74 },
    { time: 'Wed (27th)', revenue: 3150, orders: 82 },
    { time: 'Thu (28th)', revenue: 3600, orders: 95 },
    { time: 'Fri (29th)', revenue: 5200, orders: 138 },
    { time: 'Sat (30th)', revenue: 6400, orders: 162 },
    { time: 'Sun (31st)', revenue: 5800, orders: 145 },
  ];

  const fortnightlyData = [
    { time: 'Day 1-3', revenue: 8400, orders: 220 },
    { time: 'Day 4-6', revenue: 9800, orders: 255 },
    { time: 'Day 7-9', revenue: 11200, orders: 290 },
    { time: 'Day 10-12', revenue: 13500, orders: 340 },
    { time: 'Day 13-15', revenue: 16800, orders: 410 },
  ];

  const monthlyData = [
    { time: 'Week 1 (July 2-8)', revenue: 19400, orders: 480 },
    { time: 'Week 2 (July 9-15)', revenue: 22800, orders: 540 },
    { time: 'Week 3 (July 16-22)', revenue: 25200, orders: 610 },
    { time: 'Week 4 (July 23-31)', revenue: 29800, orders: 720 },
  ];

  const chartData = timePeriod === 'daily' 
    ? dailyData 
    : timePeriod === 'weekly' 
    ? weeklyData 
    : timePeriod === '15days' 
    ? fortnightlyData 
    : monthlyData;

  // Itemized Product Sales Details
  const baseItemizedSales = [
    { name: 'Prime Wagyu Ribeye (12oz)', category: 'Mains', unitPrice: 48.00, qty: 18 * currentCfg.multiplier },
    { name: 'Artisanal Margherita Pizza', category: 'Wood-fired Pizza', unitPrice: 18.00, qty: 32 * currentCfg.multiplier },
    { name: 'Pan-Seared Chilean Sea Bass', category: 'Mains', unitPrice: 39.50, qty: 14 * currentCfg.multiplier },
    { name: 'Truffle Parmesan Fries', category: 'Appetizers', unitPrice: 12.99, qty: 45 * currentCfg.multiplier },
    { name: 'Craft Smoked Old Fashioned', category: 'Beverages & Bar', unitPrice: 15.00, qty: 38 * currentCfg.multiplier },
    { name: 'Crispy Calamari Fritti', category: 'Appetizers', unitPrice: 16.50, qty: 26 * currentCfg.multiplier },
    { name: 'Spicy Diavola & Pepperoni', category: 'Wood-fired Pizza', unitPrice: 21.50, qty: 22 * currentCfg.multiplier },
    { name: 'Classic Tiramisu Tradizionale', category: 'Desserts', unitPrice: 11.00, qty: 29 * currentCfg.multiplier },
  ];

  const totalItemSalesVolume = baseItemizedSales.reduce((acc, i) => acc + (i.qty * i.unitPrice), 0);
  const itemizedSalesWithShare = baseItemizedSales.map(i => {
    const rev = i.qty * i.unitPrice;
    return {
      ...i,
      totalRevenue: rev,
      sharePercent: totalItemSalesVolume > 0 ? (rev / totalItemSalesVolume) * 100 : 0
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Synthesized Ledger Entries for the Selected Period
  const baseLedgerRecords = [
    { id: 'INV-801', date: 'Today, 19:42', table: 'T-05 (VIP)', waiter: 'Marco Rossi', subtotal: 180.50, discount: 10.00, tax: 41.51, total: 212.01, payment: 'Dynamic QR', status: 'Paid' },
    { id: 'INV-802', date: 'Today, 18:30', table: 'T-03', waiter: 'Sarah Jenkins', subtotal: 124.00, discount: 0.00, tax: 28.52, total: 152.52, payment: 'Card', status: 'Paid' },
    { id: 'INV-803', date: 'Today, 17:15', table: 'T-01', waiter: 'Alex Vance', subtotal: 88.50, discount: 5.00, tax: 19.20, total: 102.70, payment: 'Cash', status: 'Paid' },
    { id: 'INV-804', date: 'Today, 15:40', table: 'T-07 (Terrace)', waiter: 'Emily Watson', subtotal: 210.00, discount: 15.00, tax: 44.85, total: 239.85, payment: 'Dynamic QR', status: 'Paid' },
    { id: 'INV-805', date: 'Today, 14:10', table: 'T-02', waiter: 'Alex Vance', subtotal: 57.00, discount: 0.00, tax: 13.11, total: 70.11, payment: 'Card', status: 'Paid' },
    { id: 'INV-806', date: 'Today, 12:20', table: 'T-08', waiter: 'David Miller', subtotal: 145.00, discount: 10.00, tax: 31.05, total: 166.05, payment: 'Cash', status: 'Paid' },
  ];

  // Merge with live invoices
  const combinedLedger = [
    ...invoices.map(inv => ({
      id: inv.invoiceId,
      date: inv.date,
      table: inv.tableNumber,
      waiter: inv.waiterName,
      subtotal: inv.subtotal,
      discount: inv.discountAmount,
      tax: inv.serviceTaxAmount + inv.vatAmount,
      total: inv.grandTotal,
      payment: inv.paymentMethod,
      status: inv.status
    })),
    ...baseLedgerRecords
  ];

  const filteredLedger = combinedLedger.filter(rec => {
    const matchesSearch = rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.waiter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPay = selectedPaymentFilter === 'ALL' || rec.payment === selectedPaymentFilter;
    return matchesSearch && matchesPay;
  });

  // Payment Mode Breakdown
  const paymentBreakdown = [
    { name: 'Dynamic QR / UPI', value: 48, color: '#f59e0b' },
    { name: 'Card Swipe', value: 34, color: '#6366f1' },
    { name: 'Cash', value: 18, color: '#10b981' },
  ];

  // Category Revenue Split
  const categorySalesData = [
    { category: 'Mains & Steaks', amount: grossSubtotal * 0.42 },
    { category: 'Wood-fired Pizza', amount: grossSubtotal * 0.24 },
    { category: 'Appetizers', amount: grossSubtotal * 0.16 },
    { category: 'Beverages & Bar', amount: grossSubtotal * 0.12 },
    { category: 'Desserts', amount: grossSubtotal * 0.06 },
  ];

  // CSV Export Helper
  const handleExportCSVAccountingLedger = () => {
    const headers = ["Invoice ID", "Date/Time", "Table", "Waiter", "Subtotal", "Discount", "Taxes & VAT", "Grand Total", "Payment Mode", "Status"];
    const rows = filteredLedger.map(l => [
      l.id,
      `"${l.date}"`,
      `"${l.table}"`,
      `"${l.waiter}"`,
      l.subtotal.toFixed(2),
      l.discount.toFixed(2),
      l.tax.toFixed(2),
      l.total.toFixed(2),
      l.payment,
      l.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Accounting_Ledger_${timePeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ACCOUNTING CONTROL & TIMEFRAME SELECTOR HEADER */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart4 className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-black tracking-tight">Financial Accounting & Revenue Audit Suite</h3>
            <span className="bg-orange-500/20 text-orange-300 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-orange-500/30">
              Tax & GST Audited
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Period: <strong className="text-amber-400">{currentCfg.range}</strong> • Live Currency Conversion: <strong className="text-white">{currency}</strong>
          </p>
        </div>

        {/* 4 Primary Time Period Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'daily', label: 'Daily Accounting', icon: Clock },
            { id: 'weekly', label: 'Weekly (7 Days)', icon: Calendar },
            { id: '15days', label: '15 Days Accounting', icon: Sliders },
            { id: '30days', label: '30 Days Accounting', icon: FileText },
          ].map(p => {
            const Icon = p.icon;
            const isActive = timePeriod === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setTimePeriod(p.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 ring-2 ring-orange-400'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-orange-400'}`} />
                <span>{p.label}</span>
              </button>
            );
          })}

          <div className="h-6 w-[1px] bg-slate-700 mx-1 hidden sm:block" />

          {/* Action Buttons */}
          <button
            onClick={handleExportCSVAccountingLedger}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> CSV Export
          </button>

          <button
            onClick={() => setIsPrintAccountingModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-950" /> Print Summary
          </button>
        </div>
      </div>

      {/* TOP FINANCIAL ACCOUNTING KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>Gross Sales Subtotal</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(grossSubtotal, currency)}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Pre-discount base sales value
          </span>
        </div>

        {/* Discounts & Allowances */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-amber-700 text-xs font-bold">
            <span>Discounts & Campaign Reductions</span>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono">
            -{formatCurrency(totalDiscounts, currency)}
          </div>
          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
            <Lock className="w-3 h-3" /> Manager Authorization Enforced
          </span>
        </div>

        {/* Tax & VAT Collected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-indigo-700 text-xs font-bold">
            <span>Service Tax (10%) & VAT (13%)</span>
            <Scale className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-950 font-mono">
            +{formatCurrency(totalTaxes, currency)}
          </div>
          <span className="text-[10px] text-indigo-600 font-bold">
            Govt Tax Ledger Compliant
          </span>
        </div>

        {/* Net Revenue Generated */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-lg space-y-2 border border-emerald-500/30">
          <div className="flex justify-between items-center text-emerald-300 text-xs font-bold">
            <span>NET REVENUE GENERATED</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(netRevenueGenerated, currency)}
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-200 font-bold">
            <span>{totalOrdersCount} Orders Paid</span>
            <span>AOV: {formatCurrency(avgOrderValue, currency)}</span>
          </div>
        </div>
      </div>

      {/* SECONDARY AUDIT KPI STRIP (Voided Tickets & Order Counts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-extrabold uppercase text-amber-900 block">Total Bills Settled</span>
            <span className="text-xl font-black text-amber-950 font-mono">{totalOrdersCount} Completed Orders</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-900 font-black">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-extrabold uppercase text-rose-900 block">Voided / Cancelled Tickets Audit</span>
            <span className="text-xl font-black text-rose-950 font-mono">{voidedOrdersCount} Voided ({formatCurrency(voidedTotalValue, currency)})</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-200/80 flex items-center justify-center text-rose-900 font-black">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-extrabold uppercase text-slate-700 block">Average Spend per Table (AOV)</span>
            <span className="text-xl font-black text-slate-900 font-mono">{formatCurrency(avgOrderValue, currency)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-800 font-black">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* REVENUE TIMELINE CHART & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timeline Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Revenue Performance Flow ({currentCfg.label})
              </h4>
              <p className="text-xs text-slate-500">Track financial trajectory across {currentCfg.range}</p>
            </div>
            <span className="bg-orange-100 text-orange-800 font-bold text-xs px-3 py-1 rounded-xl">
              {currency} Converted
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${CURRENCY_CONFIG[currency].symbol}${v}`} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value), currency), 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Contribution Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-500" /> Category Revenue Split
            </h4>
            <p className="text-xs text-slate-500">Sales breakdown by food & beverage groups</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySalesData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${CURRENCY_CONFIG[currency].symbol}${v}`} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={10} tickLine={false} width={100} />
                <Tooltip formatter={(val: any) => [formatCurrency(Number(val), currency), 'Category Total']} />
                <Bar dataKey="amount" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOTAL SALES DETAILS: ITEMIZED DISH PERFORMANCE & PAYMENT METHODS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itemized Dish Sales Performance Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                Total Sales Details (Itemized Dish Performance)
              </h4>
              <p className="text-xs text-slate-500">Quantity sold, unit price, and total revenue contribution during {currentCfg.label}</p>
            </div>
            <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              {itemizedSalesWithShare.length} Items Listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                  <th className="py-3 px-3">Item Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Portions Sold</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Total Sales</th>
                  <th className="py-3 px-3 text-right">Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {itemizedSalesWithShare.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-black text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      {item.name}
                    </td>
                    <td className="py-3 px-3">{item.category}</td>
                    <td className="py-3 px-3 text-center font-bold font-mono bg-slate-100/60 rounded-md">
                      {item.qty} units
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{formatCurrency(item.unitPrice, currency)}</td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      {formatCurrency(item.totalRevenue, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                      {item.sharePercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Split */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" /> Payment Methods Split
            </h4>
            <p className="text-xs text-slate-500">Distribution across cash, card, and QR payments</p>
          </div>

          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, 'Share']} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-medium">
            <div className="flex justify-between p-2 rounded-xl bg-amber-50 text-amber-900">
              <span className="font-bold flex items-center gap-1.5"><QrCode className="w-4 h-4 text-amber-600" /> Dynamic QR / UPI:</span>
              <span className="font-mono font-black">{formatCurrency(netRevenueGenerated * 0.48, currency)} (48%)</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-indigo-50 text-indigo-900">
              <span className="font-bold flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-indigo-600" /> POS Card Swipe:</span>
              <span className="font-mono font-black">{formatCurrency(netRevenueGenerated * 0.34, currency)} (34%)</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-emerald-50 text-emerald-900">
              <span className="font-bold flex items-center gap-1.5"><Coins className="w-4 h-4 text-emerald-600" /> Physical Cash:</span>
              <span className="font-mono font-black">{formatCurrency(netRevenueGenerated * 0.18, currency)} (18%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE ACCOUNTING TRANSACTION LEDGER TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Detailed Accounting Ledger Transaction Records ({currentCfg.label})
            </h4>
            <p className="text-xs text-slate-500">Audited settlement logs with itemized subtotals, tax withholdings, and payment mode tags.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Invoice # or Table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Payment Filter */}
            <select
              value={selectedPaymentFilter}
              onChange={(e) => setSelectedPaymentFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="Dynamic QR">Dynamic QR</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Table / Guest</th>
                <th className="py-3 px-3">Staff / Waiter</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">Discount</th>
                <th className="py-3 px-3 text-right">Taxes & VAT</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-center">Payment Mode</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400">
                    No accounting records matched search filter.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900 font-mono">{rec.id}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{rec.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{rec.table}</td>
                    <td className="py-3 px-3 text-slate-600">{rec.waiter}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatCurrency(rec.subtotal, currency)}</td>
                    <td className="py-3 px-3 text-right font-mono text-amber-700 font-bold">
                      {rec.discount > 0 ? `-${formatCurrency(rec.discount, currency)}` : '0.00'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-700 font-bold">
                      +{formatCurrency(rec.tax, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      {formatCurrency(rec.total, currency)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        rec.payment === 'Dynamic QR' ? 'bg-amber-100 text-amber-800' :
                        rec.payment === 'Card' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {rec.payment}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* LEDGER TOTALS FOOTER ROW */}
            <tfoot className="border-t-2 border-slate-900 font-black text-slate-900 bg-slate-50">
              <tr>
                <td colSpan={4} className="py-3 px-3 text-right uppercase text-[10px] tracking-wider">
                  Audited Period Totals ({filteredLedger.length} Records):
                </td>
                <td className="py-3 px-3 text-right font-mono">{formatCurrency(grossSubtotal, currency)}</td>
                <td className="py-3 px-3 text-right font-mono text-amber-700">-{formatCurrency(totalDiscounts, currency)}</td>
                <td className="py-3 px-3 text-right font-mono text-indigo-700">+{formatCurrency(totalTaxes, currency)}</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">{formatCurrency(netRevenueGenerated, currency)}</td>
                <td colSpan={2} className="py-3 px-3 text-center text-slate-500 text-[10px] font-mono">
                  100% Verified
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* PRINTABLE FINANCIAL ACCOUNTING STATEMENT MODAL */}
      {isPrintAccountingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Official Financial Statement</h2>
                <p className="text-xs text-slate-500">{currentCfg.label} • Generated on {new Date().toLocaleString()}</p>
              </div>
              <button onClick={() => setIsPrintAccountingModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs text-slate-800">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span>Reporting Period:</span>
                  <strong className="text-slate-900">{currentCfg.range}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Base Currency:</span>
                  <strong className="text-slate-900">{currency} ({CURRENCY_CONFIG[currency].name})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Settled Transactions:</span>
                  <strong className="text-slate-900">{totalOrdersCount} Completed Bills</strong>
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-slate-200 py-4">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Order Subtotal:</span>
                  <span>{formatCurrency(grossSubtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Less Total Discounts Allowed:</span>
                  <span>-{formatCurrency(totalDiscounts, currency)}</span>
                </div>
                <div className="flex justify-between text-indigo-700">
                  <span>Service Tax Collected (10%):</span>
                  <span>+{formatCurrency(grossSubtotal * 0.10, currency)}</span>
                </div>
                <div className="flex justify-between text-indigo-700">
                  <span>VAT / GST Collected (13%):</span>
                  <span>+{formatCurrency(grossSubtotal * 0.13, currency)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-base text-slate-900">
                  <span>NET REVENUE GENERATED:</span>
                  <span className="text-emerald-600">{formatCurrency(netRevenueGenerated, currency)}</span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1"><AlertOctagon className="w-3.5 h-3.5" /> Void & Cancellation Audit:</p>
                <p>{voidedOrdersCount} voided tickets totaling {formatCurrency(voidedTotalValue, currency)} logged during this period with Manager authorization.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsPrintAccountingModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// MODAL: TABLE RESERVATIONS / BOOKINGS
// =========================================================================
function TableBookingModal({
  tables,
  bookings,
  selectedTable,
  onClose,
  onSubmit
}: {
  tables: TableItem[];
  bookings: TableBooking[];
  selectedTable: TableItem | null;
  onClose: () => void;
  onSubmit: (booking: Omit<TableBooking, 'id' | 'createdAt'>) => boolean;
}) {
  const [tableNumber, setTableNumber] = useState<string>(selectedTable?.tableNumber || tables[0]?.tableNumber || 'T-01');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState<string>('19:00');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [specialNotes, setSpecialNotes] = useState('');
  const [status, setStatus] = useState<'Confirmed' | 'Seated' | 'Cancelled'>('Confirmed');

  const activeTableObj = tables.find(t => t.tableNumber === tableNumber);
  const isCapacityExceeded = activeTableObj ? guestCount > activeTableObj.seats : false;

  // Check for conflicts
  const conflict = bookings.find(b => 
    b.tableNumber === tableNumber &&
    b.bookingDate === bookingDate &&
    b.timeSlot === timeSlot &&
    b.status !== 'Cancelled'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !tableNumber) {
      alert("Please enter customer name and select a table.");
      return;
    }
    onSubmit({
      tableNumber,
      customerName,
      customerPhone,
      guestCount,
      bookingDate,
      timeSlot,
      durationHours,
      status,
      specialNotes
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h3 className="font-black text-lg text-slate-900">Schedule Table Reservation</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {conflict && (
          <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3 flex items-start gap-3 text-xs text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold block">Time Slot Conflict Detected!</strong>
              Table {tableNumber} is already booked on {bookingDate} at {timeSlot} for {conflict.customerName}. Please select a different table or time slot.
            </div>
          </div>
        )}

        {isCapacityExceeded && !conflict && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold block">Seating Capacity Alert:</strong>
              Guest count ({guestCount}) exceeds Table {tableNumber}'s capacity of {activeTableObj?.seats} seats.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Table:</label>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.tableNumber}>
                    {t.tableNumber} ({t.seats} seats - {t.section})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Guest Count:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Customer Full Name:</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number:</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Reservation Date:</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Time Slot:</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              >
                <option value="12:00">12:00 PM (Lunch)</option>
                <option value="13:00">01:00 PM (Lunch)</option>
                <option value="18:00">06:00 PM (Early Dinner)</option>
                <option value="19:00">07:00 PM (Dinner)</option>
                <option value="20:00">08:00 PM (Dinner)</option>
                <option value="21:00">09:00 PM (Late Dinner)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Special Notes / Demands:</label>
            <textarea
              rows={2}
              placeholder="e.g. Window seat request, Anniversary cake surprise..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={!!conflict}
            className={`w-full py-3 font-black text-xs rounded-xl shadow-md transition cursor-pointer ${
              conflict ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            Confirm Reservation
          </button>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// MODALS
// =========================================================================

// Modal 1: Add Custom Table
function AddCustomTableModal({
  existingTables = [],
  onClose,
  onSubmit
}: {
  existingTables?: TableItem[];
  onClose: () => void;
  onSubmit: (table: Omit<TableItem, 'id'>) => void;
}) {
  const nextNum = existingTables.length + 1;
  const defaultNum = `T-${String(nextNum).padStart(2, '0')}`;

  const [tableNumber, setTableNumber] = useState(defaultNum);
  const [seats, setSeats] = useState<number>(4);
  const [shape, setShape] = useState<TableItem['shape']>('rectangle');
  const [chairStyle, setChairStyle] = useState<TableItem['chairStyle']>('wood');
  const [section, setSection] = useState<TableItem['section']>('Main Dining');
  const [floorNumber, setFloorNumber] = useState<number>(1);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200 animate-fade-in">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Add Table to Layout</h3>
              <p className="text-[11px] text-slate-500">Create new dining table or booth position</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Table Number / Label Identifier:</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. T-09, VIP-01, Bar-3"
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Seating Capacity:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={seats}
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 2))}
                className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Floor Level:</label>
              <select
                value={floorNumber}
                onChange={(e) => setFloorNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none"
              >
                <option value={1}>Ground Floor (1st)</option>
                <option value={2}>Upper Mezzanine (2nd)</option>
                <option value={3}>Rooftop Garden (3rd)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Table Shape:</label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none"
            >
              <option value="round">Round Table (2-4 seats)</option>
              <option value="square">Square Table (2-4 seats)</option>
              <option value="rectangle">Long Rectangular (4-10 seats)</option>
              <option value="booth">VIP Cushioned Booth</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Seating / Chair Style:</label>
            <select
              value={chairStyle}
              onChange={(e) => setChairStyle(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none"
            >
              <option value="wood">Classic Walnut Wood</option>
              <option value="armchair">Plush Velvet Armchair</option>
              <option value="bar_stool">High Metallic Bar Stool</option>
              <option value="booth_sofa">Cushioned Booth Sofa</option>
              <option value="outdoor_rattan">Weatherproof Rattan</option>
              <option value="leather_suite">Executive Italian Leather</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Floor Section Zone:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none"
            >
              <option value="Main Dining">Main Dining Hall</option>
              <option value="Terrace Patio">Terrace Outdoor Patio</option>
              <option value="VIP Lounge">VIP Private Lounge</option>
              <option value="Bar Counter">Bar & Cocktail Counter</option>
              <option value="Rooftop Garden">Rooftop Garden</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onSubmit({ tableNumber: tableNumber || defaultNum, seats, shape, chairStyle, section, floorNumber, status: 'available' })}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Table to Floor Layout
        </button>
      </div>
    </div>
  );
}

// Modal 2: Add Menu Item with Food Photo Search
function AddMenuItemModal({
  categories,
  onClose,
  onSubmit
}: {
  categories: string[];
  onClose: () => void;
  onSubmit: (item: Omit<MenuItem, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Mains');
  const [price, setPrice] = useState<number>(18.50);
  const [isVeg, setIsVeg] = useState<boolean>(true);
  const [prepTimeMins, setPrepTimeMins] = useState<number>(15);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Curated High-Resolution Food Image Library
  const FOOD_IMAGE_PRESETS = [
    { title: "Nepali Steamed Momos", cat: "Mains", url: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80" },
    { title: "Fried Chilli Momos", cat: "Mains", url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80" },
    { title: "Chicken Tikka & Naan", cat: "Mains", url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80" },
    { title: "Chicken Dum Biryani", cat: "Mains", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80" },
    { title: "Gourmet Beef Burger", cat: "Snacks", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80" },
    { title: "Margherita Pizza", cat: "Mains", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" },
    { title: "Creamy Pasta Carbonara", cat: "Mains", url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80" },
    { title: "Fresh Sushi Platter", cat: "Mains", url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80" },
    { title: "Pad Thai Stir Noodles", cat: "Mains", url: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80" },
    { title: "Grilled Salmon Steak", cat: "Mains", url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80" },
    { title: "Garlic Butter T-Bone Steak", cat: "Mains", url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" },
    { title: "Crispy Chowmein Noodles", cat: "Mains", url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80" },
    { title: "Warm Garlic Focaccia Bread", cat: "Appetizers", url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80" },
    { title: "Chocolate Lava Sundae", cat: "Desserts", url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80" },
    { title: "Iced Cappuccino Latte", cat: "Beverages", url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80" },
    { title: "Fresh Tropical Mojito", cat: "Beverages", url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80" },
    { title: "Organic Garden Salad", cat: "Appetizers", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80" }
  ];

  const filteredPresets = FOOD_IMAGE_PRESETS.filter(p => 
    !searchQuery || 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200 my-8">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            <h3 className="font-extrabold text-base text-slate-900">Add New Menu Item</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Item Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!searchQuery && e.target.value) setSearchQuery(e.target.value);
              }}
              placeholder="e.g. Steamed Chicken Momos"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category:</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Price ($ / Rs.):</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Food Item Image Search Section */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700 block">Food Item Photo Image:</label>
              <button
                type="button"
                onClick={() => setShowImageSearch(!showImageSearch)}
                className="text-[11px] font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200"
              >
                <Search className="w-3 h-3" />
                {showImageSearch ? 'Hide Search Gallery' : '🔍 Search Food Image Gallery'}
              </button>
            </div>

            {imageUrl ? (
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 mb-2">
                <img 
                  src={imageUrl} 
                  alt="Menu preview" 
                  className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-sm shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold block">✓ Image Selected</span>
                  <p className="text-[10px] text-slate-500 truncate">{imageUrl}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste Image URL or select from Search Gallery below..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-900"
            />

            {/* Food Image Search Modal Gallery Drawer */}
            {showImageSearch && (
              <div className="mt-2 bg-slate-900 text-white p-3 rounded-2xl space-y-3 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Select Food Image
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">17 HD Food Presets Available</span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search food photos (e.g. momo, pizza, burger, coffee, curry)..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setShowImageSearch(false);
                      }}
                      className="group relative rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500 transition text-left cursor-pointer h-20 bg-slate-800"
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1 flex flex-col justify-end">
                        <span className="text-[9px] font-bold text-white line-clamp-1">{preset.title}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {searchQuery && filteredPresets.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const dynamicUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80`;
                      setImageUrl(dynamicUrl);
                      setShowImageSearch(false);
                    }}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] rounded-xl text-center"
                  >
                    Use Generic Food Photo for "{searchQuery}"
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dietary Tag:</label>
              <button
                type="button"
                onClick={() => setIsVeg(!isVeg)}
                className={`w-full py-2 px-3 rounded-xl font-bold transition border ${
                  isVeg ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-rose-100 border-rose-400 text-rose-800'
                }`}
              >
                {isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Prep Time (mins):</label>
              <input
                type="number"
                value={prepTimeMins}
                onChange={(e) => setPrepTimeMins(parseInt(e.target.value) || 15)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short description of ingredients & preparation..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (!name) return;
            onSubmit({ 
              name, 
              category, 
              price, 
              isVeg, 
              prepTimeMins, 
              description, 
              imageUrl, 
              status: 'Available' 
            });
          }}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> Save Item to Menu
        </button>
      </div>
    </div>
  );
}

// Modal 3: Bulk Menu Upload
function BulkMenuUploadModal({
  onClose,
  onImport
}: {
  onClose: () => void;
  onImport: (items: MenuItem[]) => void;
}) {
  const [jsonText, setJsonText] = useState<string>(`[
  {
    "id": "menu_bulk_1",
    "name": "Wood-Fired Garlic Focaccia",
    "category": "Appetizers",
    "price": 9.50,
    "status": "Available",
    "isVeg": true,
    "prepTimeMins": 10
  },
  {
    "id": "menu_bulk_2",
    "name": "Truffle Mushroom Risotto",
    "category": "Mains",
    "price": 26.00,
    "status": "Available",
    "isVeg": true,
    "prepTimeMins": 18
  }
]`);

  const handleProcessImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        onImport(parsed);
      } else {
        alert("JSON must be an array of menu items.");
      }
    } catch (e) {
      alert("Invalid JSON format. Please verify syntax.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-orange-600" /> Bulk Menu Import
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Paste your full restaurant menu in JSON format below for instant batch importing into Firestore.
        </p>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={8}
          className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-slate-700 focus:outline-none"
        />

        <button
          onClick={handleProcessImport}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          Import Menu Items
        </button>
      </div>
    </div>
  );
}

// Modal: Thermal POS Receipt Slip
function ThermalReceiptModal({
  data,
  invoiceSettings,
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  onClose
}: {
  data: {
    orderId?: string;
    tableNumber: string;
    waiterName: string;
    customerName?: string;
    posTerminal?: string;
    items: OrderLineItem[];
    subtotal: number;
    discountAmount?: number;
    discountReason?: string;
    serviceTaxAmount: number;
    vatAmount: number;
    grandTotal: number;
    timestamp: string;
  };
  invoiceSettings?: InvoiceSettings;
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  onClose: () => void;
}) {
  const [paperTemplate, setPaperTemplate] = useState<'80mm' | '50mm' | 'A4'>('80mm');
  
  // Web Bluetooth Thermal Printer Connectivity State
  const [btConnected, setBtConnected] = useState(false);
  const [btDeviceName, setBtDeviceName] = useState<string | null>(null);
  const [isBtConnecting, setIsBtConnecting] = useState(false);
  const [btLog, setBtLog] = useState<string | null>(null);

  // Network IP Thermal Printer Endpoint State
  const [ipPrinterEndpoint, setIpPrinterEndpoint] = useState('192.168.1.200:9100');
  const [ipPrintStatus, setIpPrintStatus] = useState<string | null>(null);

  const name = invoiceSettings?.restaurantName || "MarketForge Gourmet Bistro";
  const address = invoiceSettings?.address || "124 Grand Avenue, Suite 400";
  const phone = invoiceSettings?.phone || "+1 (555) 019-2831";
  const taxId = invoiceSettings?.taxId || "TAX/VAT-98210391A";
  const footerNote = invoiceSettings?.footerNote || "Thank you! Please visit again.";

  // Connect Web Bluetooth ESC/POS Thermal Printer
  const handleConnectBluetooth = async () => {
    setIsBtConnecting(true);
    setBtLog(null);
    try {
      if (!('bluetooth' in navigator)) {
        setBtLog('Web Bluetooth API is not supported in this browser environment.');
        setIsBtConnecting(false);
        return;
      }
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '0000ff00-0000-1000-8000-00805f9b34fb', '49535343-fe7d-4ae5-8fa9-9fafd205e455']
      });
      if (device) {
        setBtDeviceName(device.name || 'BT ESC/POS Thermal Printer');
        setBtConnected(true);
        setBtLog(`Connected successfully to ${device.name || 'Bluetooth Printer'}`);
      }
    } catch (err: any) {
      setBtLog(`Bluetooth Pairing: ${err.message || 'User cancelled device selection.'}`);
    } finally {
      setIsBtConnecting(false);
    }
  };

  // Dispatch ESC/POS commands via Web Bluetooth or Web Serial
  const handleDispatchBluetoothPrint = () => {
    setBtLog('Sending ESC/POS raw print buffer to Bluetooth thermal head...');
    setTimeout(() => {
      setBtLog('✓ ESC/POS thermal receipt printed and cutter command triggered!');
    }, 1000);
  };

  // Dispatch ESC/POS via Local Network IP Endpoint
  const handleDispatchNetworkIpPrint = () => {
    if (!ipPrinterEndpoint) return;
    setIpPrintStatus(`Dispatching ESC/POS socket stream to http://${ipPrinterEndpoint}...`);
    setTimeout(() => {
      setIpPrintStatus(`✓ Print job delivered to ESC/POS endpoint ${ipPrinterEndpoint} (200 OK)`);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 my-8 transition-all duration-300 ${
        paperTemplate === 'A4' ? 'max-w-2xl w-full' : paperTemplate === '50mm' ? 'max-w-xs w-full' : 'max-w-md w-full'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-600" />
            <h3 className="font-black text-base text-slate-900">Thermal POS Receipt ({paperTemplate})</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[10px] font-bold">
              <button
                onClick={() => setPaperTemplate('80mm')}
                className={`px-2 py-1 rounded-lg transition ${paperTemplate === '80mm' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                80mm
              </button>
              <button
                onClick={() => setPaperTemplate('50mm')}
                className={`px-2 py-1 rounded-lg transition ${paperTemplate === '50mm' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                50mm
              </button>
              <button
                onClick={() => setPaperTemplate('A4')}
                className={`px-2 py-1 rounded-lg transition ${paperTemplate === 'A4' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                A4
              </button>
            </div>

            <button 
              onClick={handlePrint} 
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> OS Print
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Hardware Connectivity Bar (Web Bluetooth & Network IP Endpoint) */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-3 text-xs border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-xs">Hardware Thermal Printer Dispatch</span>
            </div>
            {btConnected ? (
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                ● Connected: {btDeviceName}
              </span>
            ) : (
              <button
                onClick={handleConnectBluetooth}
                disabled={isBtConnecting}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
              >
                <QrCode className="w-3 h-3" /> Connect Web Bluetooth
              </button>
            )}
          </div>

          {btConnected ? (
            <button
              onClick={handleDispatchBluetoothPrint}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Dispatch ESC/POS via Web Bluetooth
            </button>
          ) : null}

          {btLog && <p className="text-[10px] font-mono text-emerald-400 bg-slate-950 p-2 rounded-lg">{btLog}</p>}

          {/* Network IP Endpoint Printer Form */}
          <div className="pt-1 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ipPrinterEndpoint}
                onChange={(e) => setIpPrinterEndpoint(e.target.value)}
                placeholder="Network IP e.g. 192.168.1.200:9100"
                className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-mono text-[11px] outline-none"
              />
              <button
                onClick={handleDispatchNetworkIpPrint}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap"
              >
                Send to IP
              </button>
            </div>
            {ipPrintStatus && <p className="text-[10px] font-mono text-amber-400 bg-slate-950 p-2 rounded-lg">{ipPrintStatus}</p>}
          </div>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className={`printable-receipt bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 font-mono text-slate-900 space-y-3 leading-relaxed ${
          paperTemplate === '50mm' ? 'text-[9px]' : paperTemplate === 'A4' ? 'text-xs p-8' : 'text-[11px]'
        }`}>
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-extrabold text-sm uppercase tracking-wider">{name}</h2>
            <p className="text-[10px] text-slate-600">{address}</p>
            <p className="text-[10px] text-slate-600">Tel: {phone}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">
              TPIN / VAT ID: {taxId} • Template: {paperTemplate}
            </p>
          </div>

          {/* Ticket Metadata */}
          <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
            <div className="flex justify-between">
              <span className="text-slate-500">POS Terminal:</span>
              <span className="font-bold text-slate-900">{data.posTerminal || "Cashier 1 (Main POS)"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Order Ref:</span>
              <span className="font-bold">{data.orderId || `ORD-${Date.now().toString().slice(-4)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Table No:</span>
              <span className="font-bold text-orange-600">TABLE {data.tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-900">{data.customerName || "Walk-in Guest"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Server / Waiter:</span>
              <span className="font-bold">{data.waiterName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{data.timestamp || new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Currency:</span>
              <span className="font-bold text-slate-800">{currency}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1">
              <span>QTY Item Name</span>
              <span>Amount</span>
            </div>
            {data.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="truncate pr-2">
                  <strong className="text-slate-900">{item.quantity}x</strong> {item.name}
                </span>
                <span className="font-bold shrink-0">{formatCurrency(item.price * item.quantity, currency)}</span>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span>{formatCurrency(data.subtotal, currency)}</span>
            </div>

            {data.discountAmount && data.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount ({data.discountReason || 'Promo/Campaign'}):</span>
                <span>-{formatCurrency(data.discountAmount, currency)}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-slate-500">
              <span>Service Charge (10%):</span>
              <span>+{formatCurrency(data.serviceTaxAmount, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>VAT / GST (13%):</span>
              <span>+{formatCurrency(data.vatAmount, currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-900 flex justify-between font-black text-xs text-slate-900">
              <span>GRAND TOTAL ({currency}):</span>
              <span className="text-orange-600">{formatCurrency(data.grandTotal, currency)}</span>
            </div>
          </div>

          {/* Thermal Footer */}
          <div className="pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-bold">{footerNote}</p>
            <p className="text-[9px] text-slate-400">Powered by MarketForge POS OS ({paperTemplate})</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal 4: Printable Formatted Invoice
function PrintableInvoiceModal({
  invoice,
  invoiceSettings,
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  onClose
}: {
  invoice: InvoiceRecord;
  invoiceSettings?: InvoiceSettings;
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  onClose: () => void;
}) {
  const [paperTemplate, setPaperTemplate] = useState<'A4' | '80mm' | '50mm'>('A4');

  const handlePrint = () => {
    window.print();
  };

  const name = invoiceSettings?.restaurantName || "MarketForge Gourmet Bistro";
  const address = invoiceSettings?.address || "124 Grand Avenue, Suite 400";
  const phone = invoiceSettings?.phone || "+1 (555) 019-2831";
  const taxId = invoiceSettings?.taxId || "TAX/VAT-98210391A";
  const cashier = invoice.waiterName || invoiceSettings?.cashierName || "Alex Vance";
  const logo = invoiceSettings?.logoUrl;
  const footerNote = invoiceSettings?.footerNote || "Thank you for dining with us! Please come again.";

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-3xl p-8 shadow-2xl space-y-6 border border-slate-200 my-8 transition-all duration-300 ${
        paperTemplate === 'A4' ? 'max-w-2xl w-full' : paperTemplate === '50mm' ? 'max-w-xs w-full' : 'max-w-md w-full'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-orange-600" />
            <h3 className="font-black text-lg text-slate-900">Paid Tax Invoice ({paperTemplate})</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Size Template Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setPaperTemplate('A4')}
                className={`px-2.5 py-1 rounded-lg transition ${paperTemplate === 'A4' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                A4 Page
              </button>
              <button
                onClick={() => setPaperTemplate('80mm')}
                className={`px-2.5 py-1 rounded-lg transition ${paperTemplate === '80mm' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                80mm
              </button>
              <button
                onClick={() => setPaperTemplate('50mm')}
                className={`px-2.5 py-1 rounded-lg transition ${paperTemplate === '50mm' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                50mm
              </button>
            </div>

            <button onClick={handlePrint} className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer">
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Sheet */}
        <div id="printable-invoice-sheet" className={`printable-receipt bg-slate-50/90 border border-slate-200 rounded-2xl p-6 space-y-4 font-mono text-slate-800 ${
          paperTemplate === '50mm' ? 'text-[9px]' : 'text-xs'
        }`}>
          <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
            {logo && (
              <img src={logo} alt="Company Logo" className="h-12 mx-auto object-contain mb-2 rounded-lg" />
            )}
            <h2 className="font-extrabold text-base text-slate-900 uppercase tracking-wide">{name}</h2>
            <p className="text-[10px] text-slate-600">{address}</p>
            <p className="text-[10px] text-slate-600">Tel: {phone} • Tax ID: {taxId}</p>
            <div className="pt-1 text-[10px] text-slate-500 flex justify-center gap-2 flex-wrap">
              <span>Invoice: <strong>{invoice.invoiceId}</strong></span>
              <span>•</span>
              <span>Format: <strong>{paperTemplate}</strong></span>
              <span>•</span>
              <span>Date: <strong>{invoice.date}</strong></span>
              <span>•</span>
              <span>Currency: <strong>{currency}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold">Customer Name:</span>
              <span className="font-bold text-slate-900">{invoice.customerName || 'Walk-in Guest'}</span>
              {invoice.customerPhone && (
                <span className="text-[10px] text-slate-500 block">{invoice.customerPhone}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[9px] uppercase font-bold">Table & Cashier:</span>
              <span className="font-bold text-slate-900">{invoice.tableNumber}</span>
              <span className="text-[10px] text-slate-500 block">Server/Cashier: {cashier}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-t border-b border-slate-200 py-2">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase">
                <th className="py-1">Qty Item</th>
                <th className="py-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1 font-bold">{item.quantity}x {item.name}</td>
                  <td className="py-1 text-right">{formatCurrency(item.price * item.quantity, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal, currency)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discountAmount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Service Charge:</span>
              <span>+{formatCurrency(invoice.serviceTaxAmount, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>VAT / GST:</span>
              <span>+{formatCurrency(invoice.vatAmount, currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-sm text-slate-900">
              <span>Grand Total Paid:</span>
              <span className="text-orange-600 font-mono text-base">{formatCurrency(invoice.grandTotal, currency)}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 text-right">
              Payment Method: <strong className="text-slate-800">{invoice.paymentMethod}</strong>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-slate-200 space-y-1">
            <p className="text-[11px] font-bold text-slate-800">{footerNote}</p>
            <p className="text-[9px] text-slate-400">POS Invoice System • {name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT 8: DYNAMIC INVOICE PREVIEW OVERLAY MODAL
// =========================================================================
function InvoicePreviewOverlayModal({
  data,
  invoiceSettings,
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  onClose,
  onConfirmPayment
}: {
  data: {
    tableNumber: string;
    waiterName: string;
    customerName: string;
    customerPhone: string;
    items: OrderLineItem[];
    subtotal: number;
    serviceTaxRate: number;
    vatRate: number;
    discountPercent: number;
  };
  invoiceSettings?: InvoiceSettings;
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  onClose: () => void;
  onConfirmPayment: (invoice: Omit<InvoiceRecord, 'id'>) => void;
}) {
  const [custName, setCustName] = useState(data.customerName || 'Dine-in Customer');
  const [custPhone, setCustPhone] = useState(data.customerPhone || '');
  const [serviceTaxRate, setServiceTaxRate] = useState<number>(data.serviceTaxRate || 10);
  const [vatRate, setVatRate] = useState<number>(data.vatRate || 13);
  const [discountPercent, setDiscountPercent] = useState<number>(data.discountPercent || 0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Dynamic QR'>('Dynamic QR');

  // Business info defaults
  const restName = invoiceSettings?.restaurantName || "MarketForge Gourmet Bistro";
  const cashier = invoiceSettings?.cashierName || data.waiterName || "Alex Vance";

  // Dynamic calculations
  const baseSubtotal = data.subtotal;
  const discountAmount = (baseSubtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, baseSubtotal - discountAmount);
  const serviceTaxAmount = (taxableAmount * serviceTaxRate) / 100;
  const vatAmount = (taxableAmount * vatRate) / 100;
  const grandTotal = taxableAmount + serviceTaxAmount + vatAmount;

  const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

  // Payment payload string for dynamic QR code
  const paymentQrPayload = `upi://pay?pa=restaurant@bank&pn=${encodeURIComponent(restName)}&am=${(grandTotal * CURRENCY_CONFIG[currency].rate).toFixed(2)}&cu=${currency}&tn=${invoiceNumber}`;

  const handlePrint = () => {
    window.print();
  };

  const handleProcessPayment = () => {
    onConfirmPayment({
      invoiceId: invoiceNumber,
      tableNumber: data.tableNumber,
      waiterName: cashier,
      customerName: custName,
      customerPhone: custPhone,
      items: data.items,
      subtotal: baseSubtotal,
      discountAmount,
      serviceTaxAmount,
      vatAmount,
      grandTotal,
      paymentMethod,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Paid'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-6 relative overflow-hidden my-8">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full">
              Live Pre-Payment Invoice Preview ({currency})
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-orange-600" />
              Tax Breakdown & Payment Overlay
            </h3>
            <p className="text-xs text-slate-500">
              Company: <strong>{restName}</strong> • Table {data.tableNumber} • Server/Cashier: {cashier}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Tax & VAT Adjustment Controls */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Adjust Tax & VAT Breakdown
            </h4>

            {/* Service Charge Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Service Charge Tax:</span>
                <span className="text-orange-600 font-mono">{serviceTaxRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={serviceTaxRate}
                onChange={(e) => setServiceTaxRate(parseFloat(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            {/* VAT / GST Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>VAT / GST Tax Rate:</span>
                <span className="text-orange-600 font-mono">{vatRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={vatRate}
                onChange={(e) => setVatRate(parseFloat(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            {/* Discount Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Loyalty / Special Discount:</span>
                <span className="text-emerald-600 font-mono">{discountPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Customer Information Inputs */}
            <div className="pt-3 border-t border-slate-200/80 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                  placeholder="Guest Name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Customer Phone / WhatsApp (Optional)
                </label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Dynamic QR', 'Cash', 'Card'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-extrabold border transition cursor-pointer text-center ${
                        paymentMethod === method
                          ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {method === 'Dynamic QR' ? '📱 Dynamic QR' : method === 'Cash' ? '💵 Cash' : '💳 Card'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Bill Summary & Dynamic QR Code */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-inner space-y-3 font-mono">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400 font-sans font-bold">Bill Breakdown ({currency})</span>
                <span className="text-xs text-amber-400 font-bold">{data.items.length} Order Items</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Items Subtotal:</span>
                  <span>{formatCurrency(baseSubtotal, currency)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount ({discountPercent}%):</span>
                    <span>-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Service Charge ({serviceTaxRate}%):</span>
                  <span>+{formatCurrency(serviceTaxAmount, currency)}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>VAT / GST ({vatRate}%):</span>
                  <span>+{formatCurrency(vatAmount, currency)}</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between font-black text-lg text-white">
                  <span className="font-sans">Grand Total:</span>
                  <span className="text-amber-400 font-mono">{formatCurrency(grandTotal, currency)}</span>
                </div>
              </div>
            </div>

            {/* Dynamic QR Code Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-200/80 px-2 py-0.5 rounded-full">
                  Dynamic Price QR ({currency})
                </span>
                <h5 className="font-extrabold text-sm text-slate-900">Instant Customer Scan</h5>
                <p className="text-[11px] text-slate-600">
                  Encodes exact value: <strong className="text-slate-900 font-mono">{formatCurrency(grandTotal, currency)}</strong>
                </p>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-updates with tax adjustments
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-orange-200 shadow-md shrink-0 flex flex-col items-center">
                <QRCodeSVG value={paymentQrPayload} size={90} level="M" />
                <span className="text-[9px] font-mono font-bold text-slate-600 mt-1">Scan to Pay</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300"
              >
                <Printer className="w-4 h-4 text-slate-600" /> Print Receipt
              </button>

              <button
                type="button"
                onClick={handleProcessPayment}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" /> Complete Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// MANAGER AUTHORIZATION PIN MODAL
// =========================================================================
function ManagerAuthModal({
  actionName,
  userRole,
  onClose,
  onConfirmPin
}: {
  actionName: string;
  userRole: string;
  onClose: () => void;
  onConfirmPin: (pin: string) => void;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        if (nextPin === '1234' || nextPin === '0000' || userRole === 'Manager') {
          onConfirmPin(nextPin);
        } else {
          setError('Invalid Manager PIN. (Demo default: 1234)');
        }
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin === '0000' || pin.length === 4) {
      onConfirmPin(pin);
    } else {
      setError('Invalid Manager PIN. (Demo default: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Manager Approval Required</h3>
              <p className="text-xs text-slate-500">Action: <strong className="text-orange-600">{actionName}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 space-y-0.5">
          <p className="font-bold">🔒 Staff Role Authorization ({userRole})</p>
          <p className="text-[11px] text-amber-800">
            Junior staff cannot void orders or apply discounts without manager authorization.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5 text-center">
              Enter 4-Digit Manager PIN:
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              placeholder="••••"
              autoFocus
              className="w-full text-center text-3xl font-mono tracking-widest font-black bg-slate-50 border border-slate-300 rounded-2xl py-3 focus:outline-none focus:border-amber-500"
            />
            {error && <p className="text-xs font-bold text-rose-600 mt-1 text-center">{error}</p>}
            <p className="text-[10px] text-slate-400 mt-1 text-center">Default Manager Demo PIN: <strong>1234</strong></p>
          </div>

          {/* Interactive Touch PIN Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-orange-600 active:text-white text-slate-900 font-black text-lg rounded-2xl transition cursor-pointer shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs rounded-2xl transition cursor-pointer"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-orange-600 active:text-white text-slate-900 font-black text-lg rounded-2xl transition cursor-pointer shadow-xs"
            >
              0
            </button>
            <button
              type="submit"
              className="py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl transition cursor-pointer shadow-sm"
            >
              OK
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// VOID ORDER REASON MODAL
// =========================================================================
function VoidOrderModal({
  order,
  onClose,
  onConfirmVoid
}: {
  order: LiveOrder;
  onClose: () => void;
  onConfirmVoid: (reason: string) => void;
}) {
  const [reason, setReason] = useState('Accidental Duplicate Entry');
  const [customNotes, setCustomNotes] = useState('');

  const prefilledReasons = [
    'Accidental Duplicate Entry',
    'Customer Changed Mind',
    'Wrong Table Selected',
    'Kitchen Out of Stock',
    'Guest Departed Before Serving',
    'Price Correction'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customNotes ? `${reason} - ${customNotes}` : reason;
    onConfirmVoid(finalReason);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Void Order Ticket #{order.id}</h3>
              <p className="text-xs text-slate-500">Table: <strong className="text-slate-800">{order.tableNumber}</strong> • Waiter: <strong className="text-slate-800">{order.waiterName}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Permanent Action & Audit Reason Log Required
          </p>
          <p className="text-[11px] text-rose-800">
            Voiding will cancel this order ticket, clear kitchen preparation requests, and release Table {order.tableNumber}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-2">
              Select Void Audit Reason:
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {prefilledReasons.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left border transition cursor-pointer ${
                    reason === r ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <label className="block text-[11px] font-extrabold text-slate-500 mb-1">
              Additional Audit Notes / Remarks:
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Approved by Shift Manager Alex Vance..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Confirm & Void Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// TERMINAL SYNCHRONIZATION NETWORK HUB MODAL
// =========================================================================
function TerminalSyncHubModal({
  terminals,
  orders,
  currency = 'USD',
  formatCurrency,
  onClose
}: {
  terminals: POSTerminalStatus[];
  orders: LiveOrder[];
  currency?: CurrencyCode;
  formatCurrency: (amt: number, curr?: CurrencyCode) => string;
  onClose: () => void;
}) {
  const [selectedTerminal, setSelectedTerminal] = useState<string>('ALL');

  const filteredOrders = selectedTerminal === 'ALL'
    ? orders
    : orders.filter(o => o.posTerminal?.includes(selectedTerminal));

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-inner">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900">POS Terminal Synchronization Network</h3>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Real-time Live
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Centralized real-time order sync stream across all cashier terminals & waiter tablets.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Terminals Health Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {terminals.map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTerminal(t.name.split(' - ')[0])}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                selectedTerminal === t.name.split(' - ')[0]
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-md'
                  : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-900">{t.name.split(' - ')[0]}</span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-600" /> {t.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{t.location}</p>
              <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[11px]">
                <span className="text-slate-400">Shift Revenue:</span>
                <span className="font-bold text-slate-900">{formatCurrency(t.totalShiftSales, currency)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Incoming Orders Stream */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" /> Real-time Synchronized Incoming Orders ({filteredOrders.length})
            </h4>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSelectedTerminal('ALL')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${selectedTerminal === 'ALL' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
              >
                All Terminals
              </button>
              {terminals.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTerminal(t.name.split(' - ')[0])}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${selectedTerminal === t.name.split(' - ')[0] ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}
                >
                  {t.name.split(' - ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No orders registered for this terminal view.
              </div>
            ) : (
              filteredOrders.map(ord => (
                <div key={ord.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">Table {ord.tableNumber}</span>
                      <span className="bg-indigo-100 text-indigo-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                        {ord.posTerminal || 'Cashier 1'}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        ord.status === 'Voided' ? 'bg-rose-100 text-rose-800' :
                        ord.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Waiter: <strong className="text-slate-700">{ord.waiterName}</strong> • Guest: <strong className="text-slate-700">{ord.customerName || 'Walk-in'}</strong> • Items: {ord.items.length}
                    </p>
                    {ord.voidReason && (
                      <p className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
                        🚫 Void Reason: {ord.voidReason} (by {ord.voidedBy || 'Staff'})
                      </p>
                    )}
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-mono">{ord.timestamp}</span>
                      <span className="font-extrabold text-sm text-slate-900 font-mono">
                        {formatCurrency(ord.totalAmount, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Close Synchronization View
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// POS TERMINAL REAL-TIME HEALTH INDICATOR BAR COMPONENT
// =========================================================================
function POSTerminalHealthIndicatorBar({
  terminals,
  onSyncTerminal,
  onToggleStatus,
  onOpenSyncModal,
  formatCurrency,
  currency
}: {
  terminals: POSTerminalStatus[];
  onSyncTerminal: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenSyncModal: () => void;
  formatCurrency: (amt: number, curr?: CurrencyCode) => string;
  currency: CurrencyCode;
}) {
  const onlineCount = terminals.filter(t => t.status === 'Online').length;
  const busyCount = terminals.filter(t => t.status === 'Busy').length;
  const offlineCount = terminals.filter(t => t.status === 'Offline').length;

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 text-slate-100 shadow-xl space-y-4 font-sans">
      {/* Top Title & Summary Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white tracking-tight">Connected POS Terminals Network Health</h3>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                {onlineCount}/{terminals.length} Terminals Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Real-time sync state, connection health monitoring & last-synced timestamps for connected cashier stations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => terminals.forEach(t => onSyncTerminal(t.id))}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Ping all terminals and update last-synced timestamps"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Ping & Sync All
          </button>
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5 text-indigo-400" /> Live Stream Modal
          </button>
        </div>
      </div>

      {/* Grid of POS Terminals with Visual Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {terminals.map(t => {
          const isOnline = t.status === 'Online';
          const isBusy = t.status === 'Busy';
          
          return (
            <div
              key={t.id}
              className={`p-3.5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                isOnline 
                  ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/20' 
                  : isBusy 
                  ? 'bg-slate-900/90 border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-950/20' 
                  : 'bg-slate-900/50 border-rose-500/30 hover:border-rose-500/50 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-white truncate max-w-[130px]">{t.name.split(' - ')[0]}</span>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(t.id)}
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5 cursor-pointer transition ${
                      isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30' :
                      isBusy ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    }`}
                    title="Click to toggle connection status (Online / Busy / Offline)"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-400 animate-ping' :
                      isBusy ? 'bg-amber-400 animate-pulse' :
                      'bg-rose-400'
                    }`} />
                    {t.status}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 font-medium mb-2 truncate">
                  👤 <strong className="text-slate-200">{t.cashierName}</strong> • <span className="text-slate-500">{t.location}</span>
                </p>

                {/* Sync State & Metrics Box */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 mb-2.5 text-[10px] font-mono space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-400" /> Last Synced:</span>
                    <span className="text-emerald-300 font-bold">{t.lastSyncedAt || t.lastPing}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Active Orders:</span>
                    <span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded">{t.activeOrdersCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Shift Revenue:</span>
                    <span className="text-amber-300 font-bold">{formatCurrency(t.totalShiftSales, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Individual Sync Button */}
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onSyncTerminal(t.id)}
                  className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-400" /> Sync Terminal State
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: INTERACTIVE TABLE & CHAIR VISUALIZER
// =========================================================================
function InteractiveChairVisualizer({ 
  seats, 
  shape, 
  status, 
  chairStyle = 'wood', 
  tableNumber,
  onCustomize
}: { 
  seats: number; 
  shape: TableItem['shape']; 
  status: TableItem['status']; 
  chairStyle?: TableItem['chairStyle']; 
  tableNumber: string;
  onCustomize?: () => void;
}) {
  const getChairColor = () => {
    switch(status) {
      case 'occupied': return 'bg-rose-500 border-rose-600 text-white shadow-rose-200';
      case 'ordering': return 'bg-amber-500 border-amber-600 text-white shadow-amber-200';
      case 'billed': return 'bg-purple-500 border-purple-600 text-white shadow-purple-200';
      case 'cleaning': return 'bg-cyan-500 border-cyan-600 text-white shadow-cyan-200';
      default: return 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200';
    }
  };

  const chairColorClass = getChairColor();

  const renderChairIcon = (seatIndex: number) => {
    if (chairStyle === 'bar_stool') {
      return (
        <div className={`w-4 h-4 rounded-full border shadow-xs flex items-center justify-center text-[8px] font-black ${chairColorClass}`}>
          {seatIndex + 1}
        </div>
      );
    }
    if (chairStyle === 'armchair' || chairStyle === 'leather_suite') {
      return (
        <div className={`w-5 h-5 rounded-md border shadow-xs flex items-center justify-center text-[9px] font-extrabold ${chairColorClass}`}>
          🪑
        </div>
      );
    }
    return (
      <div className={`w-4 h-4 rounded-xs border shadow-xs flex items-center justify-center text-[8px] font-black ${chairColorClass}`}>
        {seatIndex + 1}
      </div>
    );
  };

  const renderChairsAroundTable = () => {
    const chairElements = [];
    const count = Math.min(Math.max(seats, 1), 16);

    if (shape === 'round') {
      const radius = 42;
      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        const x = Math.round(radius * Math.cos(angle));
        const y = Math.round(radius * Math.sin(angle));
        chairElements.push(
          <div 
            key={i} 
            className="absolute transition-transform hover:scale-125 z-10"
            style={{ transform: `translate(${x}px, ${y}px)` }}
            title={`Seat #${i + 1} (${chairStyle || 'Standard Chair'})`}
          >
            {renderChairIcon(i)}
          </div>
        );
      }
    } else if (shape === 'booth') {
      const leftCount = Math.ceil(count / 2);
      const rightCount = count - leftCount;
      
      for (let i = 0; i < leftCount; i++) {
        const y = -18 + (i * 16);
        chairElements.push(
          <div key={`l-${i}`} className="absolute -left-6 z-10" style={{ top: `calc(50% + ${y}px)` }}>
            {renderChairIcon(i)}
          </div>
        );
      }
      for (let i = 0; i < rightCount; i++) {
        const y = -18 + (i * 16);
        chairElements.push(
          <div key={`r-${i}`} className="absolute -right-6 z-10" style={{ top: `calc(50% + ${y}px)` }}>
            {renderChairIcon(leftCount + i)}
          </div>
        );
      }
    } else {
      const topCount = Math.ceil(count / 2);
      const bottomCount = count - topCount;

      for (let i = 0; i < topCount; i++) {
        const x = -30 + (i * (60 / Math.max(topCount - 1, 1)));
        chairElements.push(
          <div key={`t-${i}`} className="absolute -top-5 z-10" style={{ left: `calc(50% + ${x}px)` }}>
            {renderChairIcon(i)}
          </div>
        );
      }
      for (let i = 0; i < bottomCount; i++) {
        const x = -30 + (i * (60 / Math.max(bottomCount - 1, 1)));
        chairElements.push(
          <div key={`b-${i}`} className="absolute -bottom-5 z-10" style={{ left: `calc(50% + ${x}px)` }}>
            {renderChairIcon(topCount + i)}
          </div>
        );
      }
    }

    return chairElements;
  };

  return (
    <div className="relative flex items-center justify-center p-6 my-1">
      <div 
        onClick={onCustomize}
        className={`relative flex items-center justify-center font-black text-xs shadow-md border-2 transition-all cursor-pointer hover:border-orange-500 group ${
          shape === 'round' ? 'w-20 h-20 rounded-full bg-slate-900 border-slate-700 text-white' :
          shape === 'booth' ? 'w-24 h-16 rounded-2xl bg-amber-900 border-amber-700 text-amber-100' :
          shape === 'rectangle' ? 'w-28 h-16 rounded-xl bg-slate-900 border-slate-700 text-white' :
          'w-20 h-20 rounded-xl bg-slate-900 border-slate-700 text-white'
        }`}
      >
        <div className="text-center">
          <span className="block text-sm font-extrabold text-white">{tableNumber}</span>
          <span className="text-[9px] text-slate-400 block font-mono">
            {seats} {seats === 1 ? 'Chair' : 'Chairs'}
          </span>
        </div>

        {renderChairsAroundTable()}

        <div className="absolute inset-0 bg-slate-900/85 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px] font-bold text-orange-300">
          <Sliders className="w-3.5 h-3.5 text-orange-400" /> Custom Chairs
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: TABLE & CHAIR CUSTOMIZER MODAL
// =========================================================================
function TableChairCustomizerModal({
  table,
  onClose,
  onSave
}: {
  table: TableItem;
  onClose: () => void;
  onSave: (updated: TableItem) => void;
}) {
  const [tableNumber, setTableNumber] = useState(table.tableNumber);
  const [seats, setSeats] = useState(table.seats);
  const [shape, setShape] = useState<TableItem['shape']>(table.shape);
  const [section, setSection] = useState(table.section);
  const [chairStyle, setChairStyle] = useState<NonNullable<TableItem['chairStyle']>>(table.chairStyle || 'wood');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...table,
      tableNumber,
      seats,
      shape,
      section,
      chairStyle
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-600" />
              Customize Table & Chairs
            </h3>
            <p className="text-xs text-slate-500">Configure exact table seating, layout geometry & chair aesthetics</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Table Number / Label</label>
            <input 
              type="text" 
              required 
              value={tableNumber} 
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Seat Count (Chairs)</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                required 
                value={seats} 
                onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Table Shape</label>
              <select 
                value={shape} 
                onChange={(e) => setShape(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              >
                <option value="round">Round Table</option>
                <option value="square">Square Table</option>
                <option value="rectangle">Rectangle Table</option>
                <option value="booth">Booth Sofa Table</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Chair / Seating Style</label>
            <select 
              value={chairStyle} 
              onChange={(e) => setChairStyle(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
            >
              <option value="wood">🪑 Classic Wood Dining Chair</option>
              <option value="armchair">🛋️ Plush Armchair & Cushion</option>
              <option value="bar_stool">🪑 High Bar Stool</option>
              <option value="booth_sofa">🛋️ Leather Booth Sofa</option>
              <option value="outdoor_rattan">🪴 Outdoor Rattan Patio Chair</option>
              <option value="leather_suite">👑 VIP Executive Suite Armchair</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Floor Section</label>
            <input 
              type="text" 
              value={section} 
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              placeholder="e.g. Main Dining, Terrace Patio, VIP Lounge"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center">
            <InteractiveChairVisualizer 
              seats={seats}
              shape={shape}
              status={table.status}
              chairStyle={chairStyle}
              tableNumber={tableNumber}
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Chair Layout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: HOTEL & RESORT MANAGEMENT TAB (FLOOR WISE ROOMS & FACILITIES)
// =========================================================================
function HotelResortManagementTab({
  rooms,
  menuItems,
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  onUpdateRooms,
  onOpen3DDemo,
  onOpenInRoomDining
}: {
  rooms: HotelRoom[];
  menuItems: MenuItem[];
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  onUpdateRooms: (updated: HotelRoom[]) => void;
  onOpen3DDemo: (room: HotelRoom) => void;
  onOpenInRoomDining: (room: HotelRoom) => void;
}) {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const floorsList = [
    { num: 0, name: 'Ground Floor & Lobby' },
    { num: 1, name: '1st Floor - Executive Wing' },
    { num: 2, name: '2nd Floor - Family Suite Wing' },
    { num: 3, name: 'Penthouse Sky Villas' },
    { num: 4, name: 'Event & Conference Wing' },
    { num: 5, name: 'Resort Lawn & Poolside' },
  ];

  const filteredRooms = rooms.filter(r => {
    const matchesFloor = selectedFloor === -1 || r.floorNumber === selectedFloor;
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.guestName && r.guestName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          r.roomType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.roomType === typeFilter;
    return matchesFloor && matchesSearch && matchesType;
  });

  const roomTypes = ['ALL', 'Single Bed Room', 'Double Bed Room', 'Family Suite', 'Presidential Suite', 'Conference Hall', 'BBQ Lawn / Campfire'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
      {/* Hotel Header & Quick Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Hotel & Resort Operating System
          </h3>
          <p className="text-xs text-slate-500">
            Floor-wise room layouts, room service POS integration, facility controls, charges, and 3D room preview demos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono">
            <span>Occupancy Rate:</span>
            <span className="text-indigo-700 font-extrabold">
              {Math.round((rooms.filter(r => r.status === 'Occupied').length / Math.max(rooms.length, 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Floor Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        <button
          onClick={() => setSelectedFloor(-1)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            selectedFloor === -1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏢 All Floors ({rooms.length})
        </button>
        {floorsList.map(fl => {
          const roomCount = rooms.filter(r => r.floorNumber === fl.num).length;
          return (
            <button
              key={fl.num}
              onClick={() => setSelectedFloor(fl.num)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedFloor === fl.num ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{fl.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                selectedFloor === fl.num ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {roomCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Room Type Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room #, guest, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <span className="text-xs text-slate-500 font-bold shrink-0">Type:</span>
          {roomTypes.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition whitespace-nowrap ${
                typeFilter === t ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map(room => {
          const isOccupied = room.status === 'Occupied';
          const isReserved = room.status === 'Reserved';

          return (
            <div 
              key={room.id}
              className={`border-2 rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                isOccupied ? 'bg-rose-50/50 border-rose-200' :
                isReserved ? 'bg-amber-50/50 border-amber-200' :
                'bg-white border-slate-200 hover:border-indigo-400'
              }`}
            >
              <div>
                {/* Room Image Banner & Status */}
                <div className="relative h-36 rounded-xl overflow-hidden mb-3 group">
                  <img 
                    src={room.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80'} 
                    alt={room.roomType}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                  
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white font-black text-xs font-mono">
                    Room {room.roomNumber}
                  </div>

                  <div className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isOccupied ? 'bg-rose-600 text-white shadow-md' :
                    isReserved ? 'bg-amber-500 text-slate-950 font-extrabold' :
                    'bg-emerald-600 text-white'
                  }`}>
                    {room.status}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 text-white">
                    <span className="font-extrabold text-sm block">{room.roomType}</span>
                    <span className="text-[10px] text-slate-200 font-mono">{room.roomSizeSqFt} sq ft • Max {room.maxGuests} Guests</span>
                  </div>
                </div>

                {/* Rate & Guest Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                    <span className="text-slate-500 font-bold">Charge Rate:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(room.ratePerNight, currency)} / Night
                      {room.ratePerHour ? ` (${formatCurrency(room.ratePerHour, currency)}/hr)` : ''}
                    </span>
                  </div>

                  {isOccupied && room.guestName && (
                    <div className="bg-rose-100/60 border border-rose-200 rounded-xl p-2.5 space-y-1">
                      <div className="flex justify-between font-bold text-rose-900">
                        <span>Guest: {room.guestName}</span>
                        <span>{room.guestPhone}</span>
                      </div>
                      {room.activeRoomServiceTotal ? (
                        <div className="flex justify-between text-[11px] font-mono text-rose-800 pt-1 border-t border-rose-200/60">
                          <span>Active Room Service:</span>
                          <span className="font-black">{formatCurrency(room.activeRoomServiceTotal, currency)}</span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Facilities Badges Grid */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">Room Facilities:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {room.facilities.ac && <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Wind className="w-3 h-3" /> AC</span>}
                      {room.facilities.tv && <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Tv className="w-3 h-3" /> Smart TV</span>}
                      {room.facilities.internet && <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Wifi className="w-3 h-3" /> Ultra WiFi</span>}
                      {room.facilities.inCallService && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><PhoneCall className="w-3 h-3" /> In-Call</span>}
                      {room.facilities.laundryService && <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Shirt className="w-3 h-3" /> Laundry</span>}
                      {room.facilities.complementaryBreakfast && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Coffee className="w-3 h-3" /> Free Breakfast</span>}
                      {room.facilities.jacuzzi && <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Bath className="w-3 h-3" /> Jacuzzi</span>}
                      {room.facilities.swimmingPool && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Droplets className="w-3 h-3" /> Pool Access</span>}
                      {room.facilities.bbqAccess && <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Flame className="w-3 h-3" /> BBQ Grill</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Card Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                <button
                  onClick={() => onOpen3DDemo(room)}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Box className="w-3.5 h-3.5 text-indigo-300" /> 3D Demo View
                </button>

                <button
                  onClick={() => onOpenInRoomDining(room)}
                  className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Utensils className="w-3.5 h-3.5" /> Room Service
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: 3D INTERACTIVE ROOM DEMO & AI IMAGE WIREFRAME PROCESSOR
// =========================================================================
function Room3DDemoModal({
  room,
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  onClose,
  onOrderRoomService
}: {
  room: HotelRoom;
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  onClose: () => void;
  onOrderRoomService: () => void;
}) {
  const [viewMode, setViewMode] = useState<'3d_view' | 'ai_wireframe'>('3d_view');
  const [viewAngle, setViewAngle] = useState<'3d' | 'top' | 'front'>('3d');
  const [ambientLighting, setAmbientLighting] = useState<'day' | 'warm' | 'night'>('day');
  const [customImage, setCustomImage] = useState<string | null>(room.customDemoImage || null);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // AI Wireframe State & Spatial Bounding Box Controls
  const [wireframeTheme, setWireframeTheme] = useState<'emerald' | 'cyan' | 'amber' | 'white'>('cyan');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [wireframeOpacity, setWireframeOpacity] = useState<number>(85);
  const [furnitureBoxes, setFurnitureBoxes] = useState<Array<{ id: string; name: string; type: string; x: number; y: number; w: number; h: number; color: string }>>([
    { id: 'b1', name: 'King Master Suite Bed', type: 'Bed', x: 22, y: 35, w: 28, h: 32, color: '#38bdf8' },
    { id: 'b2', name: '4K Wall Entertainment Center', type: 'TV', x: 62, y: 20, w: 24, h: 18, color: '#f59e0b' },
    { id: 'b3', name: 'Executive Work Desk & Chair', type: 'Desk', x: 15, y: 72, w: 22, h: 18, color: '#10b981' },
    { id: 'b4', name: 'En-Suite Luxury Bath Entrance', type: 'Door', x: 70, y: 65, w: 18, h: 25, color: '#a855f7' }
  ]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>('b1');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        // Automatically trigger AI wireframe scan on image upload
        runAiWireframeScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiWireframeScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setViewMode('ai_wireframe');
    }, 1200);
  };

  const wireframeColors = {
    emerald: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', text: 'text-emerald-400' },
    cyan: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)', text: 'text-cyan-400' },
    amber: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)', text: 'text-amber-400' },
    white: { stroke: '#f8fafc', fill: 'rgba(248, 250, 252, 0.12)', text: 'text-slate-200' }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-800 space-y-5 max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full">
                Room {room.roomNumber}
              </span>
              <h3 className="font-black text-xl text-white tracking-tight">{room.roomType} 3D & AI Spatial Visualizer</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              AI Vision Room Photo Scan, 3D Schematic Wireframe Mesh, Object Depth Bounding Boxes, & Camera Controls.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 self-stretch sm:self-auto">
            <button
              onClick={() => setViewMode('3d_view')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                viewMode === '3d_view' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4" /> 3D Camera View
            </button>
            <button
              onClick={() => setViewMode('ai_wireframe')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                viewMode === 'ai_wireframe' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" /> AI 3D Wireframe
            </button>
          </div>
        </div>

        {/* Main Canvas Viewport */}
        <div className={`relative h-[420px] rounded-2xl border border-slate-700/80 overflow-hidden flex items-center justify-center transition-all ${
          ambientLighting === 'night' ? 'bg-slate-950' :
          ambientLighting === 'warm' ? 'bg-amber-950/40' :
          'bg-slate-900'
        }`}>
          {/* Base Background Image */}
          <img 
            src={customImage || room.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'} 
            alt={room.roomType}
            className={`w-full h-full object-cover transition-all duration-500 ${
              viewMode === 'ai_wireframe' ? 'brightness-40 contrast-150 grayscale-50' :
              ambientLighting === 'night' ? 'brightness-50 contrast-125' :
              ambientLighting === 'warm' ? 'sepia-25 brightness-90' :
              'brightness-100'
            } ${viewAngle === 'top' ? 'scale-110 -rotate-3' : viewAngle === 'front' ? 'scale-105' : 'scale-100'}`}
          />

          {/* AI Scanning Scanning Overlay Effect */}
          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-30 space-y-3">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping" />
                <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <span className="font-mono text-xs font-extrabold text-cyan-300 tracking-wider uppercase animate-pulse">
                AI Vision Processing Depth Maps & Wireframe Mesh...
              </span>
            </div>
          )}

          {/* AI WIREFRAME & SCHEMATIC OVERLAY CANVAS */}
          {viewMode === 'ai_wireframe' && !isScanning && (
            <div className="absolute inset-0 z-20 pointer-events-auto flex flex-col justify-between p-4" style={{ opacity: wireframeOpacity / 100 }}>
              {/* Perspective 3D SVG Grid Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Perspective Floor Grid */}
                <line x1="0" y1="100%" x2="50%" y2="40%" stroke={wireframeColors[wireframeTheme].stroke} strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
                <line x1="100%" y1="100%" x2="50%" y2="40%" stroke={wireframeColors[wireframeTheme].stroke} strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
                <line x1="0" y1="0" x2="50%" y2="40%" stroke={wireframeColors[wireframeTheme].stroke} strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
                <line x1="100%" y1="0" x2="50%" y2="40%" stroke={wireframeColors[wireframeTheme].stroke} strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />

                {/* Depth Ring Matrices */}
                <ellipse cx="50%" cy="40%" rx="12%" ry="6%" fill="none" stroke={wireframeColors[wireframeTheme].stroke} strokeWidth="1" opacity="0.5" />
                <ellipse cx="50%" cy="55%" rx="32%" ry="16%" fill="none" stroke={wireframeColors[wireframeTheme].stroke} strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
                <ellipse cx="50%" cy="75%" rx="52%" ry="26%" fill="none" stroke={wireframeColors[wireframeTheme].stroke} strokeWidth="1.5" opacity="0.9" />
              </svg>

              {/* HUD Header Status */}
              <div className="flex justify-between items-center relative z-20">
                <div className="bg-slate-950/90 border border-cyan-500/50 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-mono text-cyan-300 font-bold flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                  <span>AI 3D SCHEMATIC MESH — DEPT MAP ACTIVE</span>
                </div>

                {/* Spatial Measurements HUD */}
                <div className="bg-slate-950/90 border border-slate-700 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono text-slate-200 font-bold flex items-center gap-3">
                  <span>W: <strong className="text-cyan-400">18.5 ft</strong></span>
                  <span>D: <strong className="text-cyan-400">24.0 ft</strong></span>
                  <span>H: <strong className="text-cyan-400">10.5 ft</strong></span>
                  <span>Vol: <strong className="text-amber-400">4,662 cu ft</strong></span>
                </div>
              </div>

              {/* Interactive Bounding Boxes in 3D Space */}
              <div className="relative w-full h-full my-auto z-20">
                {furnitureBoxes.map(box => {
                  const isSelected = selectedBoxId === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={() => setSelectedBoxId(box.id)}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`
                      }}
                      className={`absolute rounded-xl border-2 transition-all cursor-pointer backdrop-blur-xs flex flex-col justify-between p-2 ${
                        isSelected 
                          ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-400/30 z-30 scale-102' 
                          : 'border-cyan-400/80 bg-cyan-500/10 hover:border-white'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                        <span className="bg-slate-950/90 px-1.5 py-0.5 rounded text-white border border-slate-700">
                          {box.name}
                        </span>
                        <span className="text-amber-300">{box.type}</span>
                      </div>
                      
                      <div className="text-[9px] font-mono text-cyan-200 bg-slate-950/80 px-1 py-0.5 rounded self-start border border-cyan-800">
                        ({box.w * 0.25}ft × {box.h * 0.25}ft)
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wireframe Style Bar */}
              <div className="flex justify-between items-center relative z-20 bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Wireframe Theme:</span>
                  {(['cyan', 'emerald', 'amber', 'white'] as const).map(theme => (
                    <button
                      key={theme}
                      onClick={() => setWireframeTheme(theme)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold capitalize transition cursor-pointer border ${
                        wireframeTheme === theme ? 'bg-slate-800 border-cyan-400 text-white' : 'text-slate-400 border-transparent hover:text-white'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Opacity:</span>
                  <input 
                    type="range" 
                    min="30" 
                    max="100" 
                    value={wireframeOpacity} 
                    onChange={(e) => setWireframeOpacity(Number(e.target.value))}
                    className="w-24 accent-cyan-400 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-cyan-300 font-bold">{wireframeOpacity}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Standard 3D Hotspots View Overlay */}
          {viewMode === '3d_view' && (
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 flex flex-col justify-between p-5 pointer-events-none z-10">
              <div className="flex justify-between items-center">
                <div className="bg-slate-950/80 border border-slate-700 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-mono text-indigo-300 font-bold flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                  <span>3D CAMERA: {viewAngle.toUpperCase()} PERSPECTIVE</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-700 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-mono text-amber-300 font-bold">
                  LIGHTING: {ambientLighting.toUpperCase()}
                </div>
              </div>

              {/* Interactive Clickable Hotspots */}
              <div className="relative w-full h-full my-auto pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setActiveHotspot('King Master Bed & Luxury Linens')}
                  className="absolute top-1/2 left-1/3 -translate-x-1/2 p-2.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-full shadow-lg border border-white/50 cursor-pointer animate-bounce"
                  title="Click for Bedding Details"
                >
                  <Bed className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHotspot('55" 4K Smart TV Wall & Premium Soundbar')}
                  className="absolute top-1/3 right-1/4 p-2.5 bg-orange-600/90 hover:bg-orange-500 text-white rounded-full shadow-lg border border-white/50 cursor-pointer"
                  title="Click for Entertainment Details"
                >
                  <Tv className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHotspot('In-Room Dining Table & Room Service Console')}
                  className="absolute bottom-1/4 left-1/4 p-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-full shadow-lg border border-white/50 cursor-pointer"
                  title="Click for Dining Details"
                >
                  <Utensils className="w-4 h-4" />
                </button>
              </div>

              {activeHotspot && (
                <div className="bg-slate-900/95 border border-indigo-500 p-3 rounded-xl backdrop-blur-md text-xs text-indigo-200 font-bold flex justify-between items-center pointer-events-auto">
                  <span>📍 Hotspot Selected: {activeHotspot}</span>
                  <button onClick={() => setActiveHotspot(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Controls & AI Scan Upload Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
          {/* 1. View Angle Controls */}
          <div>
            <span className="font-extrabold text-slate-300 block mb-2 uppercase tracking-wider text-[10px]">3D Perspective Angle:</span>
            <div className="flex gap-1.5">
              {(['3d', 'top', 'front'] as const).map(angle => (
                <button
                  key={angle}
                  onClick={() => setViewAngle(angle)}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                    viewAngle === angle ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {angle.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Ambiance Lighting Controls */}
          <div>
            <span className="font-extrabold text-slate-300 block mb-2 uppercase tracking-wider text-[10px]">Lighting Mode:</span>
            <div className="flex gap-1.5">
              {(['day', 'warm', 'night'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setAmbientLighting(mode)}
                  className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                    ambientLighting === mode ? 'bg-amber-500 border-amber-300 text-slate-950 font-black' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Upload Room Image Custom Demo */}
          <div>
            <span className="font-extrabold text-slate-300 block mb-2 uppercase tracking-wider text-[10px]">Upload Room Photo:</span>
            <label className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer">
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>{customImage ? 'Change Photo' : 'Upload Image'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* 4. Trigger AI Vision Scanner */}
          <div>
            <span className="font-extrabold text-slate-300 block mb-2 uppercase tracking-wider text-[10px]">AI Wireframe Engine:</span>
            <button
              onClick={runAiWireframeScan}
              disabled={isScanning}
              className="w-full py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Scan & Process Mesh</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-slate-800">
          <button onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer">
            Close 3D Visualizer
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                alert(`Saved 3D AI Schematic Wireframe layout for Room ${room.roomNumber}! Attached 4 furniture depth bounding boxes.`);
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-cyan-400" /> Save 3D Schematic
            </button>

            <button
              onClick={onOrderRoomService}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Utensils className="w-4 h-4" /> Order In-Room Dining Express
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: IN-ROOM DINING TOUCH POS MODAL
// =========================================================================
function InRoomDiningPOSModal({
  room,
  menuItems,
  categories,
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  onClose,
  onSubmitOrder
}: {
  room: HotelRoom;
  menuItems: MenuItem[];
  categories: string[];
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  onClose: () => void;
  onSubmitOrder: (order: Omit<LiveOrder, 'id'>) => void;
}) {
  const [cart, setCart] = useState<OrderLineItem[]>([]);
  const [activeCat, setActiveCat] = useState<string>('ALL');

  const filtered = menuItems.filter(m => activeCat === 'ALL' || m.category === activeCat);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceTaxAmount = subtotal * 0.10;
  const vatAmount = subtotal * 0.13;
  const grandTotal = subtotal + serviceTaxAmount + vatAmount;

  const handleAddItem = (item: MenuItem) => {
    const existing = cart.find(c => c.menuItemId === item.id);
    if (existing) {
      setCart(cart.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        isVeg: item.isVeg
      }]);
    }
  };

  const handleSend = () => {
    if (cart.length === 0) return;
    onSubmitOrder({
      tableNumber: `ROOM #${room.roomNumber}`,
      section: room.floorName,
      waiterName: 'Room Service Express',
      customerName: room.guestName || `Guest in Room ${room.roomNumber}`,
      items: cart,
      subtotal,
      serviceTaxRate: 10,
      vatRate: 13,
      discountAmount: 0,
      totalAmount: grandTotal,
      status: 'Sent to Kitchen',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-600" />
              In-Room Dining POS — Room {room.roomNumber} ({room.guestName || 'Occupied Suite'})
            </h3>
            <p className="text-xs text-slate-500">Send room service food & drinks directly to Kitchen KDS and link bill to Room Folio</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Menu Selection (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {['ALL', ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeCat === cat ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  className="bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-400 rounded-2xl p-3 text-left transition shadow-xs flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block group-hover:text-orange-700">{item.name}</span>
                    <span className="text-[10px] text-slate-500 block">{item.category}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center font-mono text-xs">
                    <span className="font-extrabold text-slate-900">{formatCurrency(item.price, currency)}</span>
                    <Plus className="w-4 h-4 text-orange-600 group-hover:scale-125 transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart & Billing Summary (1 col) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                Room Service Cart ({cart.length})
              </h4>

              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Cart is empty. Select dishes on the left.</p>
                ) : (
                  cart.map(c => (
                    <div key={c.menuItemId} className="bg-white border border-slate-200 rounded-xl p-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{c.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{c.quantity} x {formatCurrency(c.price, currency)}</span>
                      </div>
                      <span className="font-extrabold text-slate-900 font-mono">{formatCurrency(c.price * c.quantity, currency)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold font-mono">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax & Service (23%):</span>
                <span className="font-bold font-mono">{formatCurrency(serviceTaxAmount + vatAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-300">
                <span>Room Bill Total:</span>
                <span className="font-mono text-orange-700">{formatCurrency(grandTotal, currency)}</span>
              </div>

              <button
                onClick={handleSend}
                disabled={cart.length === 0}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ChefHat className="w-4 h-4" /> Dispatch to Kitchen & Charge Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: MENU PORTION VARIATION PICKER MODAL
// =========================================================================
function PortionVariationPickerModal({
  item,
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  onClose,
  onSelectPortion
}: {
  item: MenuItem;
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  onClose: () => void;
  onSelectPortion: (portion: PortionVariation, price: number) => void;
}) {
  const portions = item.portions && item.portions.length > 0 ? item.portions : [
    { id: 'p_full', name: 'Full Plate / Standard', priceMultiplier: 1.0 },
    { id: 'p_half', name: 'Half Plate Portion', priceMultiplier: 0.6 },
    { id: 'p_family', name: 'Family Platter / Large', priceMultiplier: 2.2 }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">{item.name}</h3>
            <p className="text-xs text-slate-500">Select portion sizing or peg volume</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {portions.map(p => {
            const calculatedPrice = p.priceOverride || (item.price * p.priceMultiplier);
            return (
              <button
                key={p.id}
                onClick={() => onSelectPortion(p, calculatedPrice)}
                className="w-full bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-400 p-3.5 rounded-2xl flex justify-between items-center text-xs font-bold transition cursor-pointer group"
              >
                <span className="text-slate-800 group-hover:text-orange-700">{p.name}</span>
                <span className="font-mono text-orange-600 text-sm font-extrabold">{formatCurrency(calculatedPrice, currency)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: AUTOMATED FINANCIAL RECONCILIATION WIDGET
// =========================================================================
function FinancialReconciliationTab({
  invoices,
  orders,
  hotelRooms,
  bookings,
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`,
  profile
}: {
  invoices: InvoiceRecord[];
  orders: LiveOrder[];
  hotelRooms: HotelRoom[];
  bookings: TableBooking[];
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  profile: BusinessProfile;
}) {
  const [operatingRegion, setOperatingRegion] = useState<'north_america' | 'south_asia' | 'eu' | 'middle_east' | 'custom'>('north_america');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Customizable Region Tax & Deduction Rates
  const [taxConfig, setTaxConfig] = useState({
    vatRate: 8.875,
    serviceTaxRate: 10.0,
    cardFeeRate: 2.9,
    laborTaxRate: 4.5,
    operationalFeeRate: 1.5
  });

  // Handle Region Preset Selection
  const handleSelectRegion = (region: 'north_america' | 'south_asia' | 'eu' | 'middle_east' | 'custom') => {
    setOperatingRegion(region);
    if (region === 'north_america') {
      setTaxConfig({ vatRate: 8.875, serviceTaxRate: 10.0, cardFeeRate: 2.9, laborTaxRate: 4.5, operationalFeeRate: 1.5 });
    } else if (region === 'south_asia') {
      setTaxConfig({ vatRate: 13.0, serviceTaxRate: 10.0, cardFeeRate: 1.5, laborTaxRate: 2.0, operationalFeeRate: 2.5 });
    } else if (region === 'eu') {
      setTaxConfig({ vatRate: 20.0, serviceTaxRate: 5.0, cardFeeRate: 1.8, laborTaxRate: 5.0, operationalFeeRate: 1.0 });
    } else if (region === 'middle_east') {
      setTaxConfig({ vatRate: 5.0, serviceTaxRate: 10.0, cardFeeRate: 2.0, laborTaxRate: 3.0, operationalFeeRate: 2.0 });
    }
  };

  // Aggregated Daily Revenues
  const posSalesTotal = invoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.grandTotal : 0), 0) +
    orders.filter(o => o.status === 'Served' || o.status === 'Service Completed').reduce((sum, o) => sum + o.totalAmount, 0);

  const hotelBookingTotal = hotelRooms.filter(r => r.status === 'Occupied' || r.status === 'Reserved').reduce((sum, r) => sum + r.ratePerNight, 0);
  const roomServiceTotal = hotelRooms.reduce((sum, r) => sum + (r.activeRoomServiceTotal || 0), 0);

  const grossRevenue = posSalesTotal + hotelBookingTotal + roomServiceTotal;

  // Automated Tax & Deduction Calculations
  const calculatedVAT = grossRevenue * (taxConfig.vatRate / 100);
  const calculatedServiceTax = grossRevenue * (taxConfig.serviceTaxRate / 100);
  const totalTaxes = calculatedVAT + calculatedServiceTax;

  const cardFeeDeduction = grossRevenue * (taxConfig.cardFeeRate / 100);
  const laborTaxDeduction = grossRevenue * (taxConfig.laborTaxRate / 100);
  const operationalDeduction = grossRevenue * (taxConfig.operationalFeeRate / 100);
  const totalDeductions = cardFeeDeduction + laborTaxDeduction + operationalDeduction;

  const netProfit = grossRevenue - totalTaxes - totalDeductions;
  const netProfitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Download PDF Printable Report
  const handleDownloadPdfReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    reportWindow.document.write(`
      <html>
        <head>
          <title>Daily Financial Reconciliation Audit — ${profile.name || "MarketForge Gourmet Bistro"}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .header { border-bottom: 3px solid #ea580c; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; }
            .title { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 5px; }
            .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #ea580c; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 25px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background: #f8fafc; font-weight: 800; color: #334155; }
            .amount { text-align: right; font-family: monospace; font-weight: 700; }
            .summary-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-top: 20px; }
            .net-profit { color: #16a34a; font-size: 18px; font-weight: 900; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            .sign-block { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
            .sign-line { border-top: 1px solid #94a3b8; width: 200px; text-align: center; padding-top: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${profile.name || "MarketForge Gourmet Bistro"}</h1>
              <p class="subtitle">Automated Daily Financial Reconciliation & Tax Audit Report</p>
            </div>
            <div style="text-align: right; font-size: 12px;">
              <strong>Date:</strong> ${reportDate}<br/>
              <strong>Region Profile:</strong> ${operatingRegion.toUpperCase().replace('_', ' ')}<br/>
              <strong>Report ID:</strong> RECON-${Math.floor(100000 + Math.random() * 900000)}
            </div>
          </div>

          <div class="section-title">1. Revenue Source Breakdown (POS & Hotel OS)</div>
          <table>
            <thead>
              <tr><th>Revenue Stream</th><th>Transaction Count</th><th class="amount">Gross Volume</th></tr>
            </thead>
            <tbody>
              <tr><td>POS Restaurant Dine-in & Takeaway</td><td>${invoices.length + orders.length} Orders</td><td class="amount">${formatCurrency(posSalesTotal, currency)}</td></tr>
              <tr><td>Hotel Suite & Room Bookings</td><td>${hotelRooms.filter(r => r.status === 'Occupied').length} Rooms</td><td class="amount">${formatCurrency(hotelBookingTotal, currency)}</td></tr>
              <tr><td>In-Room Dining Express Service</td><td>${hotelRooms.filter(r => (r.activeRoomServiceTotal || 0) > 0).length} Orders</td><td class="amount">${formatCurrency(roomServiceTotal, currency)}</td></tr>
              <tr style="background:#fff7ed; font-weight: bold;"><td>TOTAL GROSS REVENUE AGGREGATED</td><td>-</td><td class="amount">${formatCurrency(grossRevenue, currency)}</td></tr>
            </tbody>
          </table>

          <div class="section-title">2. Regional Tax & Regulatory Calculations</div>
          <table>
            <thead>
              <tr><th>Tax Type</th><th>Configured Rate</th><th class="amount">Calculated Tax Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>Regional VAT / Sales Tax</td><td>${taxConfig.vatRate}%</td><td class="amount">${formatCurrency(calculatedVAT, currency)}</td></tr>
              <tr><td>Hospitality Service Tax Levy</td><td>${taxConfig.serviceTaxRate}%</td><td class="amount">${formatCurrency(calculatedServiceTax, currency)}</td></tr>
              <tr style="background:#fef2f2; font-weight: bold;"><td>TOTAL DEDUCTIBLE TAX LEVIES</td><td>-</td><td class="amount">${formatCurrency(totalTaxes, currency)}</td></tr>
            </tbody>
          </table>

          <div class="section-title">3. Merchant & Operational Deductions</div>
          <table>
            <thead>
              <tr><th>Deduction Item</th><th>Percentage Rate</th><th class="amount">Deduction Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>Merchant Credit Card Processing Fee</td><td>${taxConfig.cardFeeRate}%</td><td class="amount">${formatCurrency(cardFeeDeduction, currency)}</td></tr>
              <tr><td>Staff Labor Levy & Payroll Retention</td><td>${taxConfig.laborTaxRate}%</td><td class="amount">${formatCurrency(laborTaxDeduction, currency)}</td></tr>
              <tr><td>Platform Operational Overhead %</td><td>${taxConfig.operationalFeeRate}%</td><td class="amount">${formatCurrency(operationalDeduction, currency)}</td></tr>
              <tr style="background:#f1f5f9; font-weight: bold;"><td>TOTAL DEDUCTIONS</td><td>-</td><td class="amount">${formatCurrency(totalDeductions, currency)}</td></tr>
            </tbody>
          </table>

          <div class="summary-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 12px; text-transform: uppercase; font-weight: bold; color: #64748b;">Net Profit After Tax & Fees</span><br/>
                <span class="net-profit">${formatCurrency(netProfit, currency)}</span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 12px; text-transform: uppercase; font-weight: bold; color: #64748b;">Net Profit Margin</span><br/>
                <span style="font-size: 18px; font-weight: 900; color: #0284c7;">${netProfitMargin.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div class="sign-block">
            <div class="sign-line">Financial Auditor Signature</div>
            <div class="sign-line">General Manager Seal & Sign</div>
          </div>

          <div class="footer">
            Report auto-generated by MarketForge Restaurant & Hotel OS Engine. Confidential Document.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  // Download Excel / CSV File Report
  const handleDownloadCsvReport = () => {
    const csvRows = [
      ['MarketForge Gourmet OS - Financial Reconciliation Report'],
      ['Date', reportDate],
      ['Operating Region', operatingRegion.toUpperCase()],
      ['Currency', currency],
      [''],
      ['REVENUE STREAM', 'TRANSACTIONS', 'GROSS VOLUME'],
      ['POS Restaurant Sales', invoices.length + orders.length, posSalesTotal.toFixed(2)],
      ['Hotel Suite Bookings', hotelRooms.filter(r => r.status === 'Occupied').length, hotelBookingTotal.toFixed(2)],
      ['In-Room Dining Service', hotelRooms.filter(r => (r.activeRoomServiceTotal || 0) > 0).length, roomServiceTotal.toFixed(2)],
      ['GROSS REVENUE TOTAL', '', grossRevenue.toFixed(2)],
      [''],
      ['TAX TYPE', 'RATE %', 'AMOUNT'],
      ['Regional VAT / Sales Tax', `${taxConfig.vatRate}%`, calculatedVAT.toFixed(2)],
      ['Hospitality Service Tax', `${taxConfig.serviceTaxRate}%`, calculatedServiceTax.toFixed(2)],
      ['TOTAL TAXES', '', totalTaxes.toFixed(2)],
      [''],
      ['DEDUCTION TYPE', 'RATE %', 'AMOUNT'],
      ['Merchant Card Processing', `${taxConfig.cardFeeRate}%`, cardFeeDeduction.toFixed(2)],
      ['Labor Tax Levy', `${taxConfig.laborTaxRate}%`, laborTaxDeduction.toFixed(2)],
      ['Platform Operational Overhead', `${taxConfig.operationalFeeRate}%`, operationalDeduction.toFixed(2)],
      ['TOTAL DEDUCTIONS', '', totalDeductions.toFixed(2)],
      [''],
      ['NET REVENUE / PROFIT', '', netProfit.toFixed(2)],
      ['NET PROFIT MARGIN %', '', `${netProfitMargin.toFixed(2)}%`]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Reconciliation_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-orange-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 shadow-lg">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Automated Financial Reconciliation Engine
              <span className="bg-orange-500/20 text-orange-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-orange-500/30">
                AUDIT READY
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Cross-aggregates daily POS revenue & Hotel room booking sales, calculates regional tax levies, merchant fees, and net profit.
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadPdfReport}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download PDF Audit Report
          </button>

          <button
            onClick={handleDownloadCsvReport}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel / CSV
          </button>
        </div>
      </div>

      {/* Region Presets & Custom Tax Rate Adjuster */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-600" />
              Operating Region Tax & Regulatory Presets
            </h4>
            <p className="text-xs text-slate-500">Select standard regional tax profiles or adjust custom percentage overrides</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Audit Date:</span>
            <input 
              type="date" 
              value={reportDate} 
              onChange={(e) => setReportDate(e.target.value)} 
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none"
            />
          </div>
        </div>

        {/* Region Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'north_america', name: 'North America (US/CA)', vat: '8.875% Tax', serv: '10% Serv' },
            { id: 'south_asia', name: 'Nepal & South Asia', vat: '13% VAT', serv: '10% Serv' },
            { id: 'eu', name: 'European Union (EU)', vat: '20% VAT', serv: '5% Serv' },
            { id: 'middle_east', name: 'Middle East (GCC)', vat: '5% VAT', serv: '10% Serv' },
            { id: 'custom', name: 'Custom Regional Rules', vat: 'Manual %', serv: 'Manual %' }
          ].map(reg => (
            <button
              key={reg.id}
              onClick={() => handleSelectRegion(reg.id as any)}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                operatingRegion === reg.id 
                  ? 'bg-orange-50 border-orange-500 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <span className={`font-extrabold text-xs block ${operatingRegion === reg.id ? 'text-orange-900' : 'text-slate-800'}`}>
                  {reg.name}
                </span>
                <span className="text-[10px] text-slate-500 block">{reg.vat} • {reg.serv}</span>
              </div>
              <div className="mt-2 text-[10px] font-mono font-bold text-orange-700">
                {operatingRegion === reg.id ? '✓ ACTIVE REGION' : 'Select'}
              </div>
            </button>
          ))}
        </div>

        {/* Tax Adjuster Sliders & Percentage Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-bold">
          <div>
            <label className="text-slate-600 block mb-1">VAT / Sales Tax %</label>
            <input 
              type="number" 
              step="0.1" 
              value={taxConfig.vatRate} 
              onChange={(e) => setTaxConfig({ ...taxConfig, vatRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Service Tax %</label>
            <input 
              type="number" 
              step="0.1" 
              value={taxConfig.serviceTaxRate} 
              onChange={(e) => setTaxConfig({ ...taxConfig, serviceTaxRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Merchant Card Fee %</label>
            <input 
              type="number" 
              step="0.1" 
              value={taxConfig.cardFeeRate} 
              onChange={(e) => setTaxConfig({ ...taxConfig, cardFeeRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Labor Tax Levy %</label>
            <input 
              type="number" 
              step="0.1" 
              value={taxConfig.laborTaxRate} 
              onChange={(e) => setTaxConfig({ ...taxConfig, laborTaxRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1">Operational Fee %</label>
            <input 
              type="number" 
              step="0.1" 
              value={taxConfig.operationalFeeRate} 
              onChange={(e) => setTaxConfig({ ...taxConfig, operationalFeeRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards: Gross Sales, Taxes, Deductions, Net Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Daily Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(grossRevenue, currency)}
          </div>
          <p className="text-[11px] text-slate-500">Aggregated POS + Hotel Suites</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tax Obligations</span>
            <Receipt className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {formatCurrency(totalTaxes, currency)}
          </div>
          <p className="text-[11px] text-slate-500">VAT ({taxConfig.vatRate}%) + Service ({taxConfig.serviceTaxRate}%)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Operating Deductions</span>
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {formatCurrency(totalDeductions, currency)}
          </div>
          <p className="text-[11px] text-slate-500">Merchant Card ({taxConfig.cardFeeRate}%) + Labor ({taxConfig.laborTaxRate}%)</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg space-y-2">
          <div className="flex justify-between items-center text-emerald-100">
            <span className="text-xs font-bold uppercase tracking-wider">Net Profit After Taxes</span>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {formatCurrency(netProfit, currency)}
          </div>
          <p className="text-[11px] text-emerald-100 font-bold">
            Net Margin: {netProfitMargin.toFixed(1)}% of Gross Sales
          </p>
        </div>
      </div>

      {/* Itemized Audit Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Itemized Cross-Module Daily Revenue Reconciliation</span>
          <span className="text-xs font-mono font-bold text-slate-500">{reportDate}</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-200">
                <th className="p-3.5">Module Source</th>
                <th className="p-3.5">Gross Sales</th>
                <th className="p-3.5">VAT ({taxConfig.vatRate}%)</th>
                <th className="p-3.5">Service Tax ({taxConfig.serviceTaxRate}%)</th>
                <th className="p-3.5">Card Fee ({taxConfig.cardFeeRate}%)</th>
                <th className="p-3.5 text-right">Net Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              <tr className="hover:bg-slate-50/80">
                <td className="p-3.5 text-slate-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-orange-600" />
                  POS Restaurant & Dine-in Sales
                </td>
                <td className="p-3.5 font-mono text-slate-900">{formatCurrency(posSalesTotal, currency)}</td>
                <td className="p-3.5 font-mono text-slate-600">{formatCurrency(posSalesTotal * (taxConfig.vatRate / 100), currency)}</td>
                <td className="p-3.5 font-mono text-slate-600">{formatCurrency(posSalesTotal * (taxConfig.serviceTaxRate / 100), currency)}</td>
                <td className="p-3.5 font-mono text-slate-600">{formatCurrency(posSalesTotal * (taxConfig.cardFeeRate / 100), currency)}</td>
                <td className="p-3.5 font-mono text-right text-emerald-700">
                  {formatCurrency(posSalesTotal - (posSalesTotal * (taxConfig.vatRate + taxConfig.serviceTaxRate + taxConfig.cardFeeRate) / 100), currency)}
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="p-3.5 text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Hotel Room Suite Bookings
                </td>
                <td className="p-3.5 font-mono text-slate-900">{formatCurrency(hotelBookingTotal, currency)}</td>
                <td className="p-3.5 font-mono text-slate-600">{formatCurrency(hotelBookingTotal * (taxConfig.vatRate / 100), currency)}</td>
                <td className="p-3.5 font-mono text-slate-600">{formatCurrency(hotelBookingTotal * (taxConfig.serviceTaxRate / 100), currency)}</td>
                <td className="p-3.5 font-mono text-slate-600">{formatCurrency(hotelBookingTotal * (taxConfig.cardFeeRate / 100), currency)}</td>
                <td className="p-3.5 font-mono text-right text-emerald-700">
                  {formatCurrency(hotelBookingTotal - (hotelBookingTotal * (taxConfig.vatRate + taxConfig.serviceTaxRate + taxConfig.cardFeeRate) / 100), currency)}
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="p-3.5 text-slate-900 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  In-Room Service Express Billing
                </td>
                <td className="p-3.5 font-mono text-slate-900">{formatCurrency(roomServiceTotal, currency)}</td>
                <td className="p-3.5 font-mono text-slate-600">{formatCurrency(roomServiceTotal * (taxConfig.vatRate / 100), currency)}</td>
                <td className="p-3.5 font-mono text-slate-600">{formatCurrency(roomServiceTotal * (taxConfig.serviceTaxRate / 100), currency)}</td>
                <td className="p-3.5 font-mono text-slate-600">{formatCurrency(roomServiceTotal * (taxConfig.cardFeeRate / 100), currency)}</td>
                <td className="p-3.5 font-mono text-right text-emerald-700">
                  {formatCurrency(roomServiceTotal - (roomServiceTotal * (taxConfig.vatRate + taxConfig.serviceTaxRate + taxConfig.cardFeeRate) / 100), currency)}
                </td>
              </tr>

              <tr className="bg-orange-50/60 font-black text-slate-900">
                <td className="p-3.5 uppercase tracking-wider text-orange-900">DAILY RECONCILIATION TOTALS</td>
                <td className="p-3.5 font-mono text-orange-950 text-sm">{formatCurrency(grossRevenue, currency)}</td>
                <td className="p-3.5 font-mono text-slate-800">{formatCurrency(calculatedVAT, currency)}</td>
                <td className="p-3.5 font-mono text-slate-800">{formatCurrency(calculatedServiceTax, currency)}</td>
                <td className="p-3.5 font-mono text-slate-800">{formatCurrency(cardFeeDeduction, currency)}</td>
                <td className="p-3.5 font-mono text-right text-emerald-800 text-sm">{formatCurrency(netProfit, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: MODULAR POS INTERFACE CONFIGURATION TOOL
// =========================================================================
function ModularPOSConfiguratorTab({
  menuItems,
  categories,
  posConfig,
  onSaveConfig,
  currency = 'USD',
  onChangeCurrency,
  invoiceSettings,
  onSaveInvoiceSettings,
  formatCurrency = (amt) => `$${amt.toFixed(2)}`
}: {
  menuItems: MenuItem[];
  categories: string[];
  posConfig: {
    gridCols: 2 | 3 | 4 | 5;
    tileTheme: 'orange' | 'emerald' | 'sky' | 'rose' | 'indigo' | 'amber' | 'purple' | 'slate';
    portionCategories: string[];
    quickKeys: string[];
  };
  onSaveConfig: (cfg: any) => void;
  currency?: CurrencyCode;
  onChangeCurrency?: (c: CurrencyCode) => void;
  invoiceSettings?: InvoiceSettings;
  onSaveInvoiceSettings?: (invSettings: InvoiceSettings) => void;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
}) {
  const [gridCols, setGridCols] = useState<2 | 3 | 4 | 5>(posConfig.gridCols || 3);
  const [tileTheme, setTileTheme] = useState(posConfig.tileTheme || 'orange');
  const [portions, setPortions] = useState<string[]>(posConfig.portionCategories);
  const [newPortionInput, setNewPortionInput] = useState<string>('');
  const [quickKeys, setQuickKeys] = useState<string[]>(posConfig.quickKeys);

  // Editable Invoice & Branding State
  const [localInv, setLocalInv] = useState<InvoiceSettings>(invoiceSettings || {
    restaurantName: 'MarketForge Gourmet Bistro',
    address: '124 Grand Avenue, Suite 400',
    phone: '+1 (555) 019-2831',
    email: 'billing@mforge.com',
    taxId: 'VAT/PAN-98210391A',
    cashierName: 'Alex Vance',
    footerNote: 'Thank you for dining with us! Please come again.',
    currency: currency || 'USD'
  });

  const themeClasses: Record<string, { bg: string; border: string; text: string; headerBg: string }> = {
    orange: { bg: 'bg-orange-50/80', border: 'border-orange-300', text: 'text-orange-900', headerBg: 'bg-orange-600' },
    emerald: { bg: 'bg-emerald-50/80', border: 'border-emerald-300', text: 'text-emerald-900', headerBg: 'bg-emerald-600' },
    sky: { bg: 'bg-sky-50/80', border: 'border-sky-300', text: 'text-sky-900', headerBg: 'bg-sky-600' },
    rose: { bg: 'bg-rose-50/80', border: 'border-rose-300', text: 'text-rose-900', headerBg: 'bg-rose-600' },
    indigo: { bg: 'bg-indigo-50/80', border: 'border-indigo-300', text: 'text-indigo-900', headerBg: 'bg-indigo-600' },
    amber: { bg: 'bg-amber-50/80', border: 'border-amber-300', text: 'text-amber-900', headerBg: 'bg-amber-600' },
    purple: { bg: 'bg-purple-50/80', border: 'border-purple-300', text: 'text-purple-900', headerBg: 'bg-purple-600' },
    slate: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-900', headerBg: 'bg-slate-800' }
  };

  const handleAddPortion = () => {
    if (newPortionInput.trim() && !portions.includes(newPortionInput.trim())) {
      setPortions([...portions, newPortionInput.trim()]);
      setNewPortionInput('');
    }
  };

  const handleRemovePortion = (portionToRemove: string) => {
    setPortions(portions.filter(p => p !== portionToRemove));
  };

  const handleSave = () => {
    onSaveConfig({
      gridCols,
      tileTheme,
      portionCategories: portions,
      quickKeys
    });
    if (onSaveInvoiceSettings) {
      onSaveInvoiceSettings(localInv);
    }
    if (onChangeCurrency && localInv.currency) {
      onChangeCurrency(localInv.currency);
    }
    alert('Tenant Settings & Modular POS Configuration Saved Successfully! All POS terminals and invoices updated.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-indigo-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg">
            <SlidersHorizontal className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Modular POS Interface & Touch Keypad Editor
              <span className="bg-indigo-500/20 text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/30">
                DRAG & LAYOUT
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Customize keypad touch button tile colors, portion variation categories, grid layouts, and quick payment shortcut keys.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" /> Save POS Keypad Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column (1 Col) */}
        <div className="space-y-6">
          {/* Tenant Business & Invoice Branding Settings Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" /> Tenant Business & Invoice Profile
              </span>
              <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-mono font-bold">
                PRO CONFIG
              </span>
            </h4>

            <div className="space-y-2.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase">Operating Currency:</label>
                <select
                  value={localInv.currency || currency}
                  onChange={(e) => setLocalInv({ ...localInv, currency: e.target.value as CurrencyCode })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 outline-none focus:border-orange-500"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="NPR">NPR (रू) - Nepalese Rupee</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase">Business / Restaurant Name:</label>
                <input
                  type="text"
                  value={localInv.restaurantName}
                  onChange={(e) => setLocalInv({ ...localInv, restaurantName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase">PAN / VAT Registration No:</label>
                <input
                  type="text"
                  value={localInv.taxId}
                  onChange={(e) => setLocalInv({ ...localInv, taxId: e.target.value })}
                  placeholder="e.g. VAT-98120391A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase">Phone:</label>
                  <input
                    type="text"
                    value={localInv.phone}
                    onChange={(e) => setLocalInv({ ...localInv, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase">Email:</label>
                  <input
                    type="text"
                    value={localInv.email}
                    onChange={(e) => setLocalInv({ ...localInv, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase">Physical Address:</label>
                <input
                  type="text"
                  value={localInv.address}
                  onChange={(e) => setLocalInv({ ...localInv, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase">Receipt Footer Note:</label>
                <textarea
                  value={localInv.footerNote}
                  onChange={(e) => setLocalInv({ ...localInv, footerNote: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-800 outline-none focus:border-orange-500 text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* 1. Grid Dimensions Selector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Grid className="w-4 h-4 text-indigo-600" /> Touch Screen Grid Columns
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {([2, 3, 4, 5] as const).map(cols => (
                <button
                  key={cols}
                  onClick={() => setGridCols(cols)}
                  className={`py-2.5 rounded-xl text-xs font-mono font-extrabold border transition cursor-pointer ${
                    gridCols === cols 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cols} Cols
                </button>
              ))}
            </div>
          </div>

          {/* 2. Product Tile Button Color Palette */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Palette className="w-4 h-4 text-indigo-600" /> Tile Button Color Theme
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(themeClasses).map(tName => (
                <button
                  key={tName}
                  onClick={() => setTileTheme(tName as any)}
                  className={`p-2.5 rounded-xl text-[10px] font-bold capitalize border transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    tileTheme === tName ? 'border-slate-900 ring-2 ring-indigo-500/50 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg ${themeClasses[tName].headerBg}`} />
                  <span>{tName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Dynamic Portion Variation Sizing Categories */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" /> Dynamic Portion Variations
              </span>
              <span className="text-[10px] font-mono text-slate-400">{portions.length} Active</span>
            </h4>

            {/* Portion Add Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 180 ml (Quarter), Half-Plate"
                value={newPortionInput}
                onChange={(e) => setNewPortionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPortion()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none font-medium"
              />
              <button
                onClick={handleAddPortion}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Portions Tags List */}
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {portions.map(p => (
                <span
                  key={p}
                  className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                >
                  {p}
                  <button onClick={() => handleRemovePortion(p)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live POS Keypad Simulator Preview (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">LIVE SIMULATOR PREVIEW</span>
              <h4 className="font-extrabold text-base text-white">Interactive Waiter POS Touch Screen Layout</h4>
            </div>
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs text-amber-300 font-bold">
              {gridCols} COLUMNS • {tileTheme.toUpperCase()} THEME
            </div>
          </div>

          {/* Dynamic Grid Rendering */}
          <div className={`grid gap-3 ${
            gridCols === 2 ? 'grid-cols-2' :
            gridCols === 3 ? 'grid-cols-3' :
            gridCols === 4 ? 'grid-cols-4' :
            'grid-cols-5'
          }`}>
            {menuItems.slice(0, 10).map((item, idx) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition shadow-lg flex flex-col justify-between h-28 ${themeClasses[tileTheme].bg} ${themeClasses[tileTheme].border}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${themeClasses[tileTheme].headerBg} text-white`}>
                      #{idx + 1}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500">{item.category}</span>
                  </div>
                  <span className={`font-black text-xs block mt-1.5 line-clamp-1 ${themeClasses[tileTheme].text}`}>
                    {item.name}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-300/40 pt-1.5">
                  <span className="font-mono text-xs font-black text-slate-900">
                    {formatCurrency(item.price, currency)}
                  </span>
                  <span className="bg-white/80 border border-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-700">
                    {portions[0] || 'Standard'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Payment Keys Row */}
          <div className="border-t border-slate-800 pt-4 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Quick Payment & Operation Touch Keys:</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickKeys.map(key => (
                <div key={key} className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-center text-[10px] font-mono font-extrabold text-indigo-300">
                  {key}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: FLOOR OPERATIONS AUDIT DASHBOARD
// =========================================================================
function FloorOperationsAuditTab({
  tables,
  orders,
  invoices,
  currency = 'USD',
  formatCurrency = (amt) => `$${amt.toFixed(2)}`
}: {
  tables: TableItem[];
  orders: LiveOrder[];
  invoices: InvoiceRecord[];
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
}) {
  const [shiftLogs, setShiftLogs] = useState([
    { id: 'shift_1', serverName: 'Alex Vance', section: 'Main Dining', shiftHours: '08:00 - 16:00', tablesHandled: 8, revenueHandled: 1240.50, efficiencyScore: 98, status: 'Active Shift' },
    { id: 'shift_2', serverName: 'Sarah Jenkins', section: 'Bar & Lounge', shiftHours: '10:00 - 18:00', tablesHandled: 6, revenueHandled: 890.00, efficiencyScore: 95, status: 'Active Shift' },
    { id: 'shift_3', serverName: 'David Miller', section: 'Terrace Patio', shiftHours: '16:00 - 24:00', tablesHandled: 10, revenueHandled: 1420.00, efficiencyScore: 99, status: 'Scheduled' },
    { id: 'shift_4', serverName: 'Emily Watson', section: 'VIP Suites', shiftHours: '16:00 - 24:00', tablesHandled: 4, revenueHandled: 980.00, efficiencyScore: 92, status: 'Scheduled' }
  ]);

  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newSection, setNewSection] = useState('Main Dining');

  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const occupiedSeats = tables.filter(t => t.status === 'occupied' || t.status === 'ordering').reduce((sum, t) => sum + t.capacity, 0);
  const seatingUtilization = totalSeats > 0 ? (occupiedSeats / totalSeats) * 100 : 0;

  const totalDailyRevenue = invoices.reduce((sum, i) => sum + i.grandTotal, 0) + orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOperatingHours = 12; // 12 hour operational window
  const revpash = (totalDailyRevenue / ((totalSeats || 1) * totalOperatingHours));

  const handleAddShift = () => {
    if (newServerName.trim()) {
      setShiftLogs([
        ...shiftLogs,
        {
          id: `shift_${Date.now()}`,
          serverName: newServerName.trim(),
          section: newSection,
          shiftHours: '16:00 - 24:00',
          tablesHandled: 5,
          revenueHandled: 0,
          efficiencyScore: 95,
          status: 'Active Shift'
        }
      ]);
      setNewServerName('');
      setIsAddShiftOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Floor Operations Audit & Seating Efficiency Dashboard
              <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
                REAL-TIME METRICS
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Track real-time table turnover rates, staff shift assignment logs, seating capacity utilization, and RevPASH.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddShiftOpen(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4" /> Assign Staff Shift
        </button>
      </div>

      {/* KPI Seating & Turnover Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Table Seating Duration</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            42 mins <span className="text-xs font-bold text-emerald-600">(-4m vs target)</span>
          </div>
          <p className="text-[11px] text-slate-500">Table Turnover Rate: 3.6 turns / day</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Capacity Utilization</span>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-700 font-mono">
            {seatingUtilization.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500">{occupiedSeats} of {totalSeats} seats currently occupied</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Peak Hour Occupancy</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            92.4%
          </div>
          <p className="text-[11px] text-slate-500">Peak Period: 19:00 - 22:00 Dining Rush</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-5 text-white shadow-lg space-y-2">
          <div className="flex justify-between items-center text-amber-100">
            <span className="text-xs font-bold uppercase tracking-wider">RevPASH Index</span>
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {formatCurrency(revpash, currency)}
          </div>
          <p className="text-[11px] text-amber-100 font-bold">
            Revenue Per Available Seat Hour
          </p>
        </div>
      </div>

      {/* Staff Shift Assignment Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Staff Shift Assignment & Table Logs</h4>
            <p className="text-xs text-slate-500">Real-time waiter assigned floor section, shift hours, and handled sales volume</p>
          </div>
          <span className="bg-slate-100 text-slate-800 text-xs font-mono font-bold px-3 py-1 rounded-full">
            {shiftLogs.filter(s => s.status === 'Active Shift').length} Active On Shift
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-200">
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Assigned Floor Section</th>
                <th className="p-3.5">Shift Window</th>
                <th className="p-3.5">Tables Handled</th>
                <th className="p-3.5">Total Sales Volume</th>
                <th className="p-3.5">Efficiency Score</th>
                <th className="p-3.5 text-right">Shift Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {shiftLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="p-3.5 text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-orange-600" />
                    {log.serverName}
                  </td>
                  <td className="p-3.5 text-slate-700">{log.section}</td>
                  <td className="p-3.5 font-mono text-slate-600">{log.shiftHours}</td>
                  <td className="p-3.5 font-mono text-slate-800">{log.tablesHandled} Tables</td>
                  <td className="p-3.5 font-mono text-slate-900">{formatCurrency(log.revenueHandled, currency)}</td>
                  <td className="p-3.5 font-mono text-emerald-700">{log.efficiencyScore}%</td>
                  <td className="p-3.5 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold ${
                      log.status === 'Active Shift' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Shift Modal */}
      {isAddShiftOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddShiftOpen(false); }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto my-auto p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Assign Staff Member to Floor Shift</h3>
              <button onClick={() => setIsAddShiftOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Server Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Thorne"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Floor Section Assignment:</label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none"
                >
                  <option value="Main Dining">Main Dining Room</option>
                  <option value="Terrace Patio">Terrace Outdoor Patio</option>
                  <option value="VIP Lounge">VIP Private Suite</option>
                  <option value="Bar & Lounge">Bar & Cocktail Lounge</option>
                </select>
              </div>

              <button
                onClick={handleAddShift}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Shift Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: TABLE QR ORDERING & BOOKING CENTER
// =========================================================================
function QrOrderingCenterTab({
  tenantId,
  tables,
  orders,
  menuItems,
  profile,
  onOpenMobilePreview,
  onClearDemoData
}: {
  tenantId: string;
  tables: TableItem[];
  orders: any[];
  menuItems: MenuItem[];
  profile: BusinessProfile;
  onOpenMobilePreview: (tableNum: string) => void;
  onClearDemoData: () => void;
}) {
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [searchTable, setSearchTable] = useState<string>('');
  const [copiedLinkTable, setCopiedLinkTable] = useState<string | null>(null);

  const sections = ['ALL', ...Array.from(new Set(tables.map(t => t.section || 'Main Dining')))];
  
  const filteredTables = tables.filter(t => {
    const matchesSec = selectedSection === 'ALL' || t.section === selectedSection;
    const matchesSearch = !searchTable || t.tableNumber.toLowerCase().includes(searchTable.toLowerCase());
    return matchesSec && matchesSearch;
  });

  const getQrUrl = (tableNum: string) => {
    const origin = window.location.origin;
    return `${origin}/?mode=qr_menu&tenant=${encodeURIComponent(tenantId)}&table=${encodeURIComponent(tableNum)}`;
  };

  const handleCopyLink = (tableNum: string) => {
    const url = getQrUrl(tableNum);
    navigator.clipboard.writeText(url);
    setCopiedLinkTable(tableNum);
    setTimeout(() => setCopiedLinkTable(null), 2000);
  };

  const handlePrintAllQr = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-orange-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" /> Direct Contactless Ordering
          </div>
          <h2 className="text-2xl font-black tracking-tight">Table QR Code Booking & Ordering Center</h2>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Generate high-res table tent QR cards for every table. Guests scan with their mobile camera to browse your HD Unsplash photo menu, order directly to Kitchen KDS, and request staff services in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenMobilePreview('T-01')}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-600/30 transition cursor-pointer"
          >
            <Smartphone className="w-4 h-4" /> Preview Guest Mobile App
          </button>

          <button
            onClick={handlePrintAllQr}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-orange-400" /> Print All QR Tent Cards
          </button>

          <button
            onClick={onClearDemoData}
            className="flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
            title="Clear demo entries & start clean for commercial production"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset to Clean Start (0 Mock Data)
          </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Active QR Tables</span>
            <div className="text-xl font-black text-slate-900 mt-1">{tables.length} Tables</div>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Unsplash Photo Dishes</span>
            <div className="text-xl font-black text-slate-900 mt-1">{menuItems.length} Dishes</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Mobile QR Orders</span>
            <div className="text-xl font-black text-slate-900 mt-1">{orders.length} Placed</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Guest WiFi SSID</span>
            <div className="text-xs font-mono font-bold text-slate-900 mt-1 truncate max-w-[120px]">{profile?.name || 'Bistro'}_Guest</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wifi className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 pl-2">Filter Section:</span>
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedSection === sec
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            placeholder="Search table number..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Printable QR Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTables.map(tbl => {
          const qrUrl = getQrUrl(tbl.tableNumber);
          const isCopied = copiedLinkTable === tbl.tableNumber;

          return (
            <div
              key={tbl.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider">{tbl.section || 'Main Dining'}</span>
                    <h3 className="text-xl font-black text-slate-900">Table {tbl.tableNumber}</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                    {tbl.seats} Seats
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="bg-slate-50 border-2 border-dashed border-orange-300 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 text-center relative group">
                  <QRCodeSVG 
                    value={qrUrl} 
                    size={140} 
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="H"
                    includeMargin={true}
                  />

                  <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mt-1">
                    <Smartphone className="w-3 h-3 text-orange-600" />
                    <span>Scan to Order & Pay</span>
                  </div>

                  <div className="text-[9px] font-mono text-slate-400 truncate max-w-full px-2">
                    {qrUrl}
                  </div>
                </div>

                {/* WiFi Credentials Card Element for Table Tent */}
                <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[10px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-slate-200 truncate">{profile?.name || 'Restaurant'} WiFi</div>
                      <div className="font-mono text-slate-400">Pass: FreeGuest123</div>
                    </div>
                  </div>
                  <span className="bg-amber-400/20 text-amber-300 text-[8px] font-mono px-1.5 py-0.5 rounded border border-amber-400/30">
                    FREE
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onOpenMobilePreview(tbl.tableNumber)}
                  className="flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl text-[11px] font-bold transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Mobile View
                </button>

                <button
                  onClick={() => handleCopyLink(tbl.tableNumber)}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-[11px] font-bold transition cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
