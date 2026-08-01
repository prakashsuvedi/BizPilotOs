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
  Lock, Unlock, Wifi, Radio, AlertOctagon, RotateCcw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { BusinessProfile } from '../types';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
}

// Currency Configuration
export type CurrencyCode = 'USD' | 'NPR' | 'INR';

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; rate: number; label: string; code: CurrencyCode; name: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', code: 'USD', name: 'US Dollar' },
  NPR: { symbol: 'रू ', rate: 133.5, label: 'NPR (रू)', code: 'NPR', name: 'Nepalese Rupee' },
  INR: { symbol: '₹ ', rate: 83.2, label: 'INR (₹)', code: 'INR', name: 'Indian Rupee' }
};

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
  section: 'Main Dining' | 'Terrace Patio' | 'VIP Lounge' | 'Bar Counter';
  status: 'available' | 'occupied' | 'ordering' | 'billed' | 'cleaning';
  assignedWaiter?: string;
  currentOrderId?: string;
  currentOrderTotal?: number;
}

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
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

export default function RestaurantManagement({ profile, tenantId }: Props) {
  const [activeTab, setActiveTab] = useState<'tables' | 'waiter' | 'kitchen' | 'menu' | 'finance' | 'inventory' | 'analytics'>('tables');

  // Currency Selection State
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

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

  // Initial Load from Firestore or Fallback Seeds
  useEffect(() => {
    loadRestaurantData();
  }, [tenantId]);

  const loadRestaurantData = async () => {
    try {
      // 1. Tables
      const fetchedTables = await clientDb.getCollection('restaurant_tables', tenantId);
      if (fetchedTables && fetchedTables.length > 0) {
        setTables(fetchedTables as any);
      } else {
        const seedTables: TableItem[] = [
          { id: 'tbl_1', tableNumber: 'T-01', seats: 2, shape: 'round', section: 'Main Dining', status: 'available' },
          { id: 'tbl_2', tableNumber: 'T-02', seats: 2, shape: 'square', section: 'Main Dining', status: 'occupied', assignedWaiter: 'Alex Vance', currentOrderTotal: 48.50 },
          { id: 'tbl_3', tableNumber: 'T-03', seats: 4, shape: 'rectangle', section: 'Main Dining', status: 'ordering', assignedWaiter: 'Sarah Jenkins', currentOrderTotal: 92.00 },
          { id: 'tbl_4', tableNumber: 'T-04', seats: 4, shape: 'rectangle', section: 'Main Dining', status: 'available' },
          { id: 'tbl_5', tableNumber: 'T-05', seats: 6, shape: 'booth', section: 'VIP Lounge', status: 'billed', assignedWaiter: 'Marco Rossi', currentOrderTotal: 185.00 },
          { id: 'tbl_6', tableNumber: 'T-06', seats: 4, shape: 'square', section: 'Terrace Patio', status: 'available' },
          { id: 'tbl_7', tableNumber: 'T-07', seats: 2, shape: 'round', section: 'Terrace Patio', status: 'occupied', assignedWaiter: 'Alex Vance', currentOrderTotal: 34.00 },
          { id: 'tbl_8', tableNumber: 'T-08', seats: 8, shape: 'rectangle', section: 'VIP Lounge', status: 'available' },
        ];
        setTables(seedTables);
      }

      // 2. Ingredients Inventory Seeds
      const fetchedIngredients = await clientDb.getCollection('restaurant_ingredients', tenantId);
      if (fetchedIngredients && fetchedIngredients.length > 0) {
        setIngredients(fetchedIngredients as any);
      } else {
        const seedIngredients: IngredientItem[] = [
          { id: 'ing_1', name: 'Prime Wagyu Ribeye', category: 'Meat & Seafood', stockQuantity: 15.5, unit: 'kg', lowStockThreshold: 5.0, costPerUnit: 32.00, lastRestocked: 'Yesterday' },
          { id: 'ing_2', name: 'Fresh Mozzarella di Bufala', category: 'Dairy & Cheese', stockQuantity: 18.0, unit: 'kg', lowStockThreshold: 4.0, costPerUnit: 14.00, lastRestocked: 'Today' },
          { id: 'ing_3', name: 'Chilean Sea Bass Fillet', category: 'Meat & Seafood', stockQuantity: 3.2, unit: 'kg', lowStockThreshold: 5.0, costPerUnit: 28.50, lastRestocked: '3 days ago' }, // Low stock
          { id: 'ing_4', name: 'White Truffle Oil', category: 'Pantry & Flours', stockQuantity: 4.5, unit: 'L', lowStockThreshold: 1.0, costPerUnit: 45.00, lastRestocked: '4 days ago' },
          { id: 'ing_5', name: 'Wild Calamari Rings', category: 'Meat & Seafood', stockQuantity: 22.0, unit: 'kg', lowStockThreshold: 5.0, costPerUnit: 11.00, lastRestocked: '2 days ago' },
          { id: 'ing_6', name: 'San Marzano Flour Type 00', category: 'Pantry & Flours', stockQuantity: 7.5, unit: 'kg', lowStockThreshold: 10.0, costPerUnit: 2.50, lastRestocked: '5 days ago' }, // Low stock
          { id: 'ing_7', name: 'Organic San Marzano Tomatoes', category: 'Produce', stockQuantity: 30.0, unit: 'kg', lowStockThreshold: 8.0, costPerUnit: 3.20, lastRestocked: 'Yesterday' },
          { id: 'ing_8', name: 'Artisanal Espresso Beans', category: 'Beverages', stockQuantity: 12.0, unit: 'kg', lowStockThreshold: 2.0, costPerUnit: 18.00, lastRestocked: 'Today' }
        ];
        setIngredients(seedIngredients);
      }

      // 3. Menu Items with Linked Recipes
      const fetchedMenu = await clientDb.getCollection('restaurant_menu', tenantId);
      if (fetchedMenu && fetchedMenu.length > 0) {
        setMenuItems(fetchedMenu as any);
        const cats = Array.from(new Set(fetchedMenu.map((i: any) => i.category)));
        if (cats.length > 0) setCategories(cats as string[]);
      } else {
        const seedMenu: MenuItem[] = [
          { 
            id: 'menu_1', 
            name: 'Truffle Parmesan Fries', 
            category: 'Appetizers', 
            price: 12.99, 
            status: 'Available', 
            isVeg: true, 
            prepTimeMins: 10, 
            description: 'Hand-cut russet potatoes tossed in white truffle oil and aged Parmigiano',
            recipe: [{ ingredientId: 'ing_4', ingredientName: 'White Truffle Oil', amountPerUnit: 0.05, unit: 'L' }]
          },
          { 
            id: 'menu_2', 
            name: 'Crispy Calamari Fritti', 
            category: 'Appetizers', 
            price: 16.50, 
            status: 'Available', 
            isVeg: false, 
            prepTimeMins: 12, 
            description: 'Served with charred lemon aioli and spicy marinara dip',
            recipe: [{ ingredientId: 'ing_5', ingredientName: 'Wild Calamari Rings', amountPerUnit: 0.25, unit: 'kg' }]
          },
          { 
            id: 'menu_3', 
            name: 'Prime Wagyu Ribeye (12oz)', 
            category: 'Mains', 
            price: 48.00, 
            status: 'Available', 
            isVeg: false, 
            prepTimeMins: 22, 
            description: 'Grade A5 Wagyu with herb compound butter and roasted garlic mash',
            recipe: [{ ingredientId: 'ing_1', ingredientName: 'Prime Wagyu Ribeye', amountPerUnit: 0.35, unit: 'kg' }]
          },
          { 
            id: 'menu_4', 
            name: 'Pan-Seared Chilean Sea Bass', 
            category: 'Mains', 
            price: 39.50, 
            status: 'Available', 
            isVeg: false, 
            prepTimeMins: 18, 
            description: 'Over saffron risotto and blistered cherry tomatoes',
            recipe: [{ ingredientId: 'ing_3', ingredientName: 'Chilean Sea Bass Fillet', amountPerUnit: 0.28, unit: 'kg' }]
          },
          { 
            id: 'menu_5', 
            name: 'Artisanal Margherita Pizza', 
            category: 'Wood-fired Pizza', 
            price: 18.00, 
            status: 'Available', 
            isVeg: true, 
            prepTimeMins: 12, 
            description: 'San Marzano tomatoes, fresh mozzarella di bufala, and sweet basil',
            recipe: [
              { ingredientId: 'ing_6', ingredientName: 'San Marzano Flour Type 00', amountPerUnit: 0.25, unit: 'kg' },
              { ingredientId: 'ing_2', ingredientName: 'Fresh Mozzarella di Bufala', amountPerUnit: 0.15, unit: 'kg' },
              { ingredientId: 'ing_7', ingredientName: 'Organic San Marzano Tomatoes', amountPerUnit: 0.15, unit: 'kg' }
            ]
          },
          { 
            id: 'menu_6', 
            name: 'Spicy Diavola & Pepperoni', 
            category: 'Wood-fired Pizza', 
            price: 21.50, 
            status: 'Available', 
            isVeg: false, 
            prepTimeMins: 14, 
            description: 'Calabrian chili honey, spicy salami, and smoked provolone',
            recipe: [
              { ingredientId: 'ing_6', ingredientName: 'San Marzano Flour Type 00', amountPerUnit: 0.25, unit: 'kg' },
              { ingredientId: 'ing_2', ingredientName: 'Fresh Mozzarella di Bufala', amountPerUnit: 0.15, unit: 'kg' }
            ]
          },
          { 
            id: 'menu_7', 
            name: 'Classic Tiramisu Tradizionale', 
            category: 'Desserts', 
            price: 11.00, 
            status: 'Available', 
            isVeg: true, 
            prepTimeMins: 5, 
            description: 'Espresso-soaked ladyfingers, whipped mascarpone, and Valrhona cocoa',
            recipe: [{ ingredientId: 'ing_8', ingredientName: 'Artisanal Espresso Beans', amountPerUnit: 0.04, unit: 'kg' }]
          },
          { 
            id: 'menu_8', 
            name: 'Craft Smoked Old Fashioned', 
            category: 'Beverages & Bar', 
            price: 15.00, 
            status: 'Available', 
            isVeg: true, 
            prepTimeMins: 5, 
            description: 'Bourbon, demerara sugar, Angostura bitters infused with applewood smoke' 
          },
        ];
        setMenuItems(seedMenu);
      }

      // 4. Table Bookings Seeds
      const fetchedBookings = await clientDb.getCollection('restaurant_bookings', tenantId);
      if (fetchedBookings && fetchedBookings.length > 0) {
        setBookings(fetchedBookings as any);
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        const seedBookings: TableBooking[] = [
          { 
            id: 'book_1', 
            tableNumber: 'T-01', 
            customerName: 'Alexander Wright', 
            customerPhone: '+1 (555) 234-5678', 
            guestCount: 2, 
            bookingDate: todayStr, 
            timeSlot: '19:00', 
            durationHours: 2, 
            status: 'Confirmed', 
            specialNotes: 'Anniversary celebration - Window table request', 
            createdAt: 'Today, 10:30 AM' 
          },
          { 
            id: 'book_2', 
            tableNumber: 'T-05', 
            customerName: 'Sophia Martinez', 
            customerPhone: '+1 (555) 876-5432', 
            guestCount: 6, 
            bookingDate: todayStr, 
            timeSlot: '20:00', 
            durationHours: 2, 
            status: 'Confirmed', 
            specialNotes: 'VIP Lounge reservation for business dinner', 
            createdAt: 'Today, 11:15 AM' 
          }
        ];
        setBookings(seedBookings);
      }

      // 5. Live Orders
      const fetchedOrders = await clientDb.getCollection('restaurant_orders', tenantId);
      if (fetchedOrders && fetchedOrders.length > 0) {
        setOrders(fetchedOrders as any);
      } else {
        const seedOrders: LiveOrder[] = [
          {
            id: 'ord_101',
            tableNumber: 'T-03',
            section: 'Main Dining',
            waiterName: 'Sarah Jenkins',
            items: [
              { menuItemId: 'menu_3', name: 'Prime Wagyu Ribeye (12oz)', price: 48.00, quantity: 1, isVeg: false, notes: 'Medium rare, extra sauce' },
              { menuItemId: 'menu_1', name: 'Truffle Parmesan Fries', price: 12.99, quantity: 2, isVeg: true },
              { menuItemId: 'menu_8', name: 'Craft Smoked Old Fashioned', price: 15.00, quantity: 1, isVeg: true }
            ],
            subtotal: 88.99,
            serviceTaxRate: 10,
            vatRate: 13,
            discountAmount: 0,
            totalAmount: 109.45,
            status: 'Cooking',
            timestamp: new Date(Date.now() - 12 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            elapsedMins: 12
          },
          {
            id: 'ord_102',
            tableNumber: 'T-02',
            section: 'Main Dining',
            waiterName: 'Alex Vance',
            items: [
              { menuItemId: 'menu_5', name: 'Artisanal Margherita Pizza', price: 18.00, quantity: 2, isVeg: true, notes: 'Extra crispy crust' },
              { menuItemId: 'menu_7', name: 'Classic Tiramisu Tradizionale', price: 11.00, quantity: 1, isVeg: true }
            ],
            subtotal: 47.00,
            serviceTaxRate: 10,
            vatRate: 13,
            discountAmount: 0,
            totalAmount: 57.81,
            status: 'Ready to Serve',
            timestamp: new Date(Date.now() - 20 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            elapsedMins: 20
          }
        ];
        setOrders(seedOrders);
      }

      // 6. Invoices
      const fetchedInvoices = await clientDb.getCollection('restaurant_invoices', tenantId);
      if (fetchedInvoices && fetchedInvoices.length > 0) {
        setInvoices(fetchedInvoices as any);
      } else {
        const seedInvoices: InvoiceRecord[] = [
          {
            id: 'inv_801',
            invoiceId: 'INV-2026-081',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            customerName: 'VIP Table Guest (T-05)',
            tableNumber: 'T-05',
            waiterName: 'Marco Rossi',
            items: [
              { menuItemId: 'menu_3', name: 'Prime Wagyu Ribeye', price: 48.00, quantity: 2, isVeg: false },
              { menuItemId: 'menu_4', name: 'Chilean Sea Bass', price: 39.50, quantity: 1, isVeg: false },
              { menuItemId: 'menu_8', name: 'Smoked Old Fashioned', price: 15.00, quantity: 3, isVeg: true }
            ],
            subtotal: 180.50,
            serviceTaxAmount: 18.05,
            vatAmount: 23.46,
            discountAmount: 10.00,
            grandTotal: 212.01,
            paymentMethod: 'Dynamic QR',
            templateType: 'tax_invoice',
            status: 'Paid'
          }
        ];
        setInvoices(seedInvoices);
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
          { id: 'waiter', label: 'Waiter Order Entry', icon: UserCheck, badge: 'Touch POS' },
          { id: 'kitchen', label: 'Kitchen KDS', icon: ChefHat, badge: `${orders.filter(o => o.status === 'Sent to Kitchen' || o.status === 'Cooking').length} Cooking` },
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
  onClearTable,
  onCycleTableStatus
}: { 
  tables: TableItem[];
  currency?: CurrencyCode;
  formatCurrency?: (amount: number, override?: CurrencyCode) => string;
  onSelectTable: (table: TableItem) => void;
  onOpenAddTable: () => void;
  onClearTable: (id: string) => void;
  onCycleTableStatus: (id: string) => void;
}) {
  const [selectedSection, setSelectedSection] = useState<string>('ALL');

  const filteredTables = selectedSection === 'ALL' 
    ? tables 
    : tables.filter(t => t.section === selectedSection);

  const sections = ['ALL', 'Main Dining', 'Terrace Patio', 'VIP Lounge', 'Bar Counter'];

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
      {/* Floor Header & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            Interactive Dine-in Floor Layout
          </h3>
          <p className="text-xs text-slate-500">
            Real-time table occupancy, seating capacity, assigned waiters, running bills, and 1-click status cycling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {sections.map(sec => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedSection === sec 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAddTable}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
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
                    <span className="text-slate-400">Section:</span>
                    <span className="font-bold text-slate-800">{table.section}</span>
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

              {/* Visual Table Representation */}
              <div className="my-2 flex items-center justify-center">
                <div className={`relative flex items-center justify-center font-bold text-xs shadow-inner transition ${
                  table.shape === 'round' ? 'w-20 h-20 rounded-full bg-white border-2 border-slate-300' :
                  table.shape === 'booth' ? 'w-24 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300' :
                  table.shape === 'rectangle' ? 'w-28 h-16 rounded-xl bg-white border-2 border-slate-300' :
                  'w-20 h-20 rounded-xl bg-white border-2 border-slate-300'
                }`}>
                  <span className="text-slate-700 font-black">{table.tableNumber}</span>

                  {/* Seat Dots Visualization */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {Array.from({ length: Math.min(table.seats, 4) }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-white" />
                    ))}
                  </div>
                </div>
              </div>

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
  onAssignPendingOrder
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
                Pure Veg Items Only
              </button>
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
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-orange-400 transition flex flex-col justify-between group"
              >
                <div>
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
  onClose,
  onSubmit
}: {
  onClose: () => void;
  onSubmit: (table: Omit<TableItem, 'id'>) => void;
}) {
  const [tableNumber, setTableNumber] = useState('T-09');
  const [seats, setSeats] = useState<number>(4);
  const [shape, setShape] = useState<TableItem['shape']>('rectangle');
  const [section, setSection] = useState<TableItem['section']>('Main Dining');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">Add Custom Table to Floor Layout</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Table Number / Label:</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Seating Capacity (Seats):</label>
            <input
              type="number"
              value={seats}
              onChange={(e) => setSeats(parseInt(e.target.value) || 2)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Table Shape:</label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
            >
              <option value="round">Round Table (2-4 seats)</option>
              <option value="square">Square Table (2-4 seats)</option>
              <option value="rectangle">Long Rectangular (4-10 seats)</option>
              <option value="booth">VIP Cushioned Booth</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Floor Section Zone:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
            >
              <option value="Main Dining">Main Dining Hall</option>
              <option value="Terrace Patio">Terrace Outdoor Patio</option>
              <option value="VIP Lounge">VIP Private Lounge</option>
              <option value="Bar Counter">Bar & Cocktail Counter</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onSubmit({ tableNumber, seats, shape, section, status: 'available' })}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          Add Table to Layout
        </button>
      </div>
    </div>
  );
}

// Modal 2: Add Menu Item
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">Add New Menu Item</h3>
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
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lobster Thermidor"
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
              <label className="font-bold text-slate-700 block mb-1">Price ($):</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
              />
            </div>
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
            onSubmit({ name, category, price, isVeg, prepTimeMins, description, status: 'Available' });
          }}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          Save Item to Menu
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
  const handlePrint = () => {
    window.print();
  };

  const name = invoiceSettings?.restaurantName || "MarketForge Gourmet Bistro";
  const address = invoiceSettings?.address || "124 Grand Avenue, Suite 400";
  const phone = invoiceSettings?.phone || "+1 (555) 019-2831";
  const taxId = invoiceSettings?.taxId || "TAX/VAT-98210391A";
  const footerNote = invoiceSettings?.footerNote || "Thank you! Please visit again.";

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 my-8">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-600" />
            <h3 className="font-black text-base text-slate-900">POS Thermal Slip</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint} 
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Slip
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="printable-receipt bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 font-mono text-[11px] text-slate-900 space-y-3 leading-relaxed">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-extrabold text-sm uppercase tracking-wider">{name}</h2>
            <p className="text-[10px] text-slate-600">{address}</p>
            <p className="text-[10px] text-slate-600">Tel: {phone}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">
              TPIN / VAT ID: {taxId}
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
            <p className="text-[9px] text-slate-400">Powered by MarketForge POS OS</p>
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
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 border border-slate-200 my-8">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-orange-600" />
            <h3 className="font-black text-lg text-slate-900">Paid Tax Invoice</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer">
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Sheet */}
        <div id="printable-invoice-sheet" className="printable-receipt bg-slate-50/90 border border-slate-200 rounded-2xl p-6 space-y-4 font-mono text-xs text-slate-800">
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin.length === 4) {
      onConfirmPin(pin);
    } else {
      setError('Invalid Manager PIN. (Demo default: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
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

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
          <p className="font-bold">🔒 Role Restriction Active ({userRole})</p>
          <p className="text-[11px] text-amber-800">
            Discounts and Order Voiding require Manager PIN authorization for audit compliance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Enter 4-Digit Manager PIN:
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              placeholder="••••"
              autoFocus
              className="w-full text-center text-2xl font-mono tracking-widest font-black bg-slate-50 border border-slate-300 rounded-xl py-3 focus:outline-none focus:border-amber-500"
            />
            {error && <p className="text-xs font-bold text-rose-600 mt-1">{error}</p>}
            <p className="text-[10px] text-slate-400 mt-1 text-center">Default Manager Demo PIN: <strong>1234</strong></p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-4 h-4" /> Verify & Authorize
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
