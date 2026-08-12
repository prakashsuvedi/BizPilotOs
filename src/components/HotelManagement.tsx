import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Bed, 
  Calendar, 
  Users, 
  CreditCard, 
  KeyRound, 
  Sparkles, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  Coffee, 
  Briefcase, 
  Filter, 
  Download, 
  Phone, 
  Mail,
  UserCheck,
  Luggage,
  Sparkle,
  Eye,
  Maximize2,
  Sun,
  Moon,
  Car,
  Wine,
  Utensils,
  Compass,
  ShieldCheck,
  Layers,
  Box,
  X,
  ChevronRight,
  Printer,
  FileText,
  Receipt,
  UtensilsCrossed,
  Tag,
  FileCheck
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { useCurrency } from '../lib/CurrencyContext';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
}

export interface RoomFolioCharge {
  id: string;
  roomNumber: string;
  guestName: string;
  category: 'Room Accommodation' | 'Restaurant & Dining' | 'In-Room Dining' | 'Spa & Concierge' | 'Minibar & Sundry';
  description: string;
  date: string;
  amount: number;
}

export interface HotelRoom {
  id: string;
  roomNumber: string;
  type: 'Deluxe Suite' | 'Executive Room' | 'Ocean View' | 'Presidential Suite' | 'Standard King';
  floor: number;
  pricePerNight: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Housekeeping' | 'Maintenance';
  amenities: string[];
  maxOccupancy: number;
}

export interface RoomBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  bookingStatus: 'Confirmed' | 'Checked-In' | 'Checked-Out' | 'Cancelled';
  notes?: string;
  idProofVerified: boolean;
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  assignedStaff: string;
  status: 'Pending' | 'In Progress' | 'Inspected & Clean';
  priority: 'High' | 'Medium' | 'Standard';
  lastCleaned: string;
}

export default function HotelManagement({ profile, tenantId }: Props) {
  const [activeTab, setActiveTab] = useState<'rooms' | '3d_tour' | 'premium_services' | 'checkout_folio' | 'bookings' | 'housekeeping' | 'rates'>('rooms');
  const { currency, formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Interactive 3D Room Demo State
  const [selected3DRoomId, setSelected3DRoomId] = useState<string>('RM-301');
  const [view3DAngle, setView3DAngle] = useState<'3d' | 'top' | 'front'>('3d');
  const [ambientLighting, setAmbientLighting] = useState<'day' | 'warm' | 'night'>('day');

  // Integrated Room Folio Itemized Charges State (Room, Restaurant, In-Room Dining, Spa, Bar, Minibar)
  const [folioCharges, setFolioCharges] = useState<RoomFolioCharge[]>(() => {
    try {
      const saved = localStorage.getItem(`marketforge_hotel_${tenantId}_folio_charges`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [checkoutRoomNumber, setCheckoutRoomNumber] = useState<string>('101');
  const [showPostChargeModal, setShowPostChargeModal] = useState(false);
  const [postCategory, setPostCategory] = useState<RoomFolioCharge['category']>('Restaurant & Dining');
  const [postDescription, setPostDescription] = useState('');
  const [postAmount, setPostAmount] = useState<number>(45);
  const [receiptFormat, setReceiptFormat] = useState<'A4' | 'Thermal'>('A4');

  // Premium Concierge Service Requests State
  const [premiumRequests, setPremiumRequests] = useState<Array<{
    id: string;
    roomNumber: string;
    serviceName: string;
    category: 'Spa & Wellness' | 'VIP Transport' | 'Private Chef' | 'Excursions';
    scheduledTime: string;
    price: number;
    status: 'Pending' | 'Confirmed' | 'Completed';
  }>>(() => {
    try {
      const saved = localStorage.getItem(`marketforge_hotel_${tenantId}_premium_requests`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [showBookServiceModal, setShowBookServiceModal] = useState(false);
  const [newServiceRoom, setNewServiceRoom] = useState('101');
  const [newServiceType, setNewServiceType] = useState('Spa & Wellness');

  // Tenant-aware Local Persistence for Hotel Data
  const [rooms, setRooms] = useState<HotelRoom[]>(() => {
    try {
      const saved = localStorage.getItem(`marketforge_hotel_${tenantId}_rooms`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [bookings, setBookings] = useState<RoomBooking[]>(() => {
    try {
      const saved = localStorage.getItem(`marketforge_hotel_${tenantId}_bookings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>(() => {
    try {
      const saved = localStorage.getItem(`marketforge_hotel_${tenantId}_housekeeping`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Modal States
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [selectedFolioBooking, setSelectedFolioBooking] = useState<RoomBooking | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Booking Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('102');
  const [newCheckIn, setNewCheckIn] = useState('2026-08-10');
  const [newCheckOut, setNewCheckOut] = useState('2026-08-13');

  // New Room Form State
  const [newRoomNoInput, setNewRoomNoInput] = useState('');
  const [newRoomTypeInput, setNewRoomTypeInput] = useState<HotelRoom['type']>('Executive Room');
  const [newRoomFloorInput, setNewRoomFloorInput] = useState(1);
  const [newRoomPriceInput, setNewRoomPriceInput] = useState(150);

  useEffect(() => {
    try {
      localStorage.setItem(`marketforge_hotel_${tenantId}_rooms`, JSON.stringify(rooms));
    } catch (e) {}
  }, [rooms, tenantId]);

  useEffect(() => {
    try {
      localStorage.setItem(`marketforge_hotel_${tenantId}_bookings`, JSON.stringify(bookings));
    } catch (e) {}
  }, [bookings, tenantId]);

  useEffect(() => {
    try {
      localStorage.setItem(`marketforge_hotel_${tenantId}_housekeeping`, JSON.stringify(housekeeping));
    } catch (e) {}
  }, [housekeeping, tenantId]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics Calculations
  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
  const reservedCount = rooms.filter(r => r.status === 'Reserved').length;
  const availableCount = rooms.filter(r => r.status === 'Available').length;
  const occupancyRate = totalRooms > 0 ? Math.round(((occupiedCount + reservedCount) / totalRooms) * 100) : 0;
  
  const totalRevenue = bookings
    .filter(b => b.bookingStatus !== 'Cancelled')
    .reduce((acc, b) => acc + b.totalPrice, 0);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newRoomNumber) return;

    const selectedRoom = rooms.find(r => r.roomNumber === newRoomNumber);
    const pricePerNight = selectedRoom ? selectedRoom.pricePerNight : 150;
    
    // Calculate nights
    const start = new Date(newCheckIn).getTime();
    const end = new Date(newCheckOut).getTime();
    const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)));
    const total = pricePerNight * diffDays;

    const newBooking: RoomBooking = {
      id: `HB-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: newGuestName,
      guestEmail: newGuestEmail,
      guestPhone: newGuestPhone,
      roomNumber: newRoomNumber,
      roomType: selectedRoom ? selectedRoom.type : 'Executive Room',
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      nights: diffDays,
      totalPrice: total,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      idProofVerified: true
    };

    setBookings(prev => [newBooking, ...prev]);
    
    // Update Room status to Reserved/Occupied
    setRooms(prev => prev.map(r => r.roomNumber === newRoomNumber ? { ...r, status: 'Reserved' } : r));

    setShowNewBookingModal(false);
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestPhone('');
    triggerToast(`Reservation created for ${newGuestName} in Room ${newRoomNumber}!`);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNoInput) return;

    const newRoom: HotelRoom = {
      id: `RM-${newRoomNoInput}`,
      roomNumber: newRoomNoInput,
      type: newRoomTypeInput,
      floor: Number(newRoomFloorInput),
      pricePerNight: Number(newRoomPriceInput),
      status: 'Available',
      maxOccupancy: 3,
      amenities: ['WiFi', 'AC', 'Smart TV', 'Room Service']
    };

    setRooms(prev => [...prev, newRoom]);
    setShowNewRoomModal(false);
    setNewRoomNoInput('');
    triggerToast(`Room ${newRoomNoInput} (${newRoomTypeInput}) added to hotel inventory!`);
  };

  const handleStatusChange = (roomId: string, newStatus: HotelRoom['status']) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
    triggerToast(`Room status updated to ${newStatus}`);
  };

  const handleCheckInGuest = (bookingId: string, roomNum: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, bookingStatus: 'Checked-In' } : b));
    setRooms(prev => prev.map(r => r.roomNumber === roomNum ? { ...r, status: 'Occupied' } : r));
    triggerToast(`Guest checked into Room ${roomNum}!`);
  };

  const handleCheckOutGuest = (bookingId: string, roomNum: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, bookingStatus: 'Checked-Out' } : b));
    setRooms(prev => prev.map(r => r.roomNumber === roomNum ? { ...r, status: 'Housekeeping' } : r));
    
    // Add Housekeeping task automatically
    const newHk: HousekeepingTask = {
      id: `HK-${Date.now().toString().slice(-4)}`,
      roomNumber: roomNum,
      assignedStaff: 'Housekeeping Team',
      status: 'Pending',
      priority: 'High',
      lastCleaned: 'Just now'
    };
    setHousekeeping(prev => [newHk, ...prev]);

    triggerToast(`Guest checked out of Room ${roomNum}. Housekeeping task dispatched.`);
  };

  const handlePostChargeToFolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDescription || postAmount <= 0) return;

    const currentGuest = bookings.find(b => b.roomNumber === checkoutRoomNumber)?.guestName || 'Resort Guest';

    const newCharge: RoomFolioCharge = {
      id: `FC-${Math.floor(1000 + Math.random() * 9000)}`,
      roomNumber: checkoutRoomNumber,
      guestName: currentGuest,
      category: postCategory,
      description: postDescription,
      date: new Date().toISOString().split('T')[0],
      amount: Number(postAmount)
    };

    setFolioCharges(prev => [newCharge, ...prev]);
    setShowPostChargeModal(false);
    setPostDescription('');
    triggerToast(`Added ${formatCurrency(postAmount)} (${postCategory}) to Room ${checkoutRoomNumber} Folio!`);
  };

  const handleExecuteExpressCheckout = (roomNum: string) => {
    const booking = bookings.find(b => b.roomNumber === roomNum && b.bookingStatus !== 'Checked-Out');
    if (booking) {
      handleCheckOutGuest(booking.id, roomNum);
      setSelectedFolioBooking({ ...booking, bookingStatus: 'Checked-Out', paymentStatus: 'Paid' });
      triggerToast(`Successfully checked out Room ${roomNum}! Master invoice opened for printing.`);
    } else {
      triggerToast(`Room ${roomNum} checkout processed. Master bill ready.`);
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) || r.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-400/30 animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wide">
                Business OS • Hospitality Layer
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Tenant: {tenantId}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white mt-1">
              {profile.name} — Hotel & Resort Management OS
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Centralized front-desk reservation engine, room status grid, guest folio management, housekeeping dispatch and automated dynamic rate plans.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setShowNewRoomModal(true)}
            className="flex-1 lg:flex-none px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" /> Add Room
          </button>
          <button
            onClick={() => setShowNewBookingModal(true)}
            className="flex-1 lg:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" /> Create Reservation
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase">Occupancy Rate</span>
            <Bed className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{occupancyRate}%</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">{occupiedCount + reservedCount} of {totalRooms} rooms filled</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase">Available Rooms</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{availableCount}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Ready for walk-in check-in</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase">Active Reservations</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{bookings.length}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Confirmed guest stays</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase">Total Booking Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(totalRevenue)}</div>
          <div className="text-[10px] text-emerald-600 font-mono mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Syncing with Financial Engine
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'rooms', label: 'Room Inventory Grid', icon: Bed },
          { id: '3d_tour', label: '3D Room Visualizer & Tour', icon: Box },
          { id: 'premium_services', label: 'Premium Concierge & Spa Hub', icon: Sparkles },
          { id: 'checkout_folio', label: 'Express Checkout & Master Billing', icon: Receipt },
          { id: 'bookings', label: 'Guest Reservations & Folios', icon: Luggage },
          { id: 'housekeeping', label: 'Housekeeping & Maintenance', icon: Coffee },
          { id: 'rates', label: 'Dynamic Rate Plans', icon: DollarSign },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ROOM INVENTORY GRID */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search room number or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Housekeeping">Housekeeping</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(room => {
              const statusColors = {
                Available: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                Occupied: 'bg-rose-50 border-rose-200 text-rose-800',
                Reserved: 'bg-amber-50 border-amber-200 text-amber-800',
                Housekeeping: 'bg-indigo-50 border-indigo-200 text-indigo-800',
                Maintenance: 'bg-slate-100 border-slate-300 text-slate-800'
              };

              return (
                <div key={room.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Floor {room.floor}</span>
                      <h3 className="text-xl font-extrabold text-slate-900">Room {room.roomNumber}</h3>
                      <p className="text-xs font-semibold text-slate-600">{room.type}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusColors[room.status]}`}>
                      {room.status}
                    </span>
                  </div>

                  <div className="text-sm font-black text-indigo-600">
                    {formatCurrency(room.pricePerNight)} <span className="text-[10px] font-medium text-slate-400">/ night</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {room.amenities.map((am, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
                        {am}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                    <button
                      onClick={() => {
                        setSelected3DRoomId(room.id);
                        setActiveTab('3d_tour');
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer border border-indigo-200"
                    >
                      <Eye className="w-3 h-3 text-indigo-600" /> 3D Tour
                    </button>
                    <div className="flex items-center gap-1">
                      <select
                        value={room.status}
                        onChange={(e) => handleStatusChange(room.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRooms.length === 0 && (
              <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No rooms in inventory</h3>
                <p className="text-xs text-slate-400">Click "Add Room" above to register your first hotel room.</p>
                <button
                  onClick={() => setShowNewRoomModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-4 h-4" /> Add Room Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1.5: INTERACTIVE 3D ROOM DEMO & ARCHITECTURAL VISUALIZER */}
      {activeTab === '3d_tour' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                <Box className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Interactive 3D Room & Suite Visualizer</h3>
                <p className="text-xs text-indigo-200">
                  Architectural floor plans, 3D perspective inspection, ambient lighting simulation, and room specs.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-800/80 p-1 rounded-xl flex gap-1 border border-slate-700">
                <button
                  onClick={() => setView3DAngle('3d')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${view3DAngle === '3d' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  3D Isometric
                </button>
                <button
                  onClick={() => setView3DAngle('top')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${view3DAngle === 'top' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Top Floor Plan
                </button>
                <button
                  onClick={() => setView3DAngle('front')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${view3DAngle === 'front' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Front Wireframe
                </button>
              </div>

              <div className="bg-slate-800/80 p-1 rounded-xl flex gap-1 border border-slate-700">
                <button
                  onClick={() => setAmbientLighting('day')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${ambientLighting === 'day' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                  title="Daylight"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAmbientLighting('warm')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${ambientLighting === 'warm' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  title="Warm Evening"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAmbientLighting('night')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${ambientLighting === 'night' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  title="Midnight Velvet"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Select Room Selector Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
            {rooms.map(r => (
              <button
                key={r.id}
                onClick={() => setSelected3DRoomId(r.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  selected3DRoomId === r.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bed className="w-4 h-4" />
                <span>Room {r.roomNumber} ({r.type})</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  selected3DRoomId === r.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {formatCurrency(r.pricePerNight)}
                </span>
              </button>
            ))}
          </div>

          {/* 3D Canvas Visualizer Display */}
          {(() => {
            const currentRoom = rooms.find(r => r.id === selected3DRoomId) || rooms[0];
            const lightingBg = 
              ambientLighting === 'day' ? 'bg-gradient-to-b from-sky-100 via-amber-50/50 to-indigo-950/90' :
              ambientLighting === 'warm' ? 'bg-gradient-to-b from-amber-950 via-purple-950 to-slate-950' :
              'bg-gradient-to-b from-slate-950 via-indigo-950 to-black';

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3D Visual Box Container */}
                <div className={`lg:col-span-2 ${lightingBg} rounded-3xl p-8 border border-indigo-500/20 shadow-2xl relative min-h-[420px] flex flex-col justify-between overflow-hidden transition-all duration-500`}>
                  {/* Watermark badge */}
                  <div className="flex items-center justify-between text-xs text-white/80 z-10">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl font-mono text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Mode: {view3DAngle.toUpperCase()} • {ambientLighting.toUpperCase()} LIGHTING</span>
                    </div>
                    <span className="bg-indigo-600/80 text-white font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                      Interactive 3D Engine Active
                    </span>
                  </div>

                  {/* 3D Architectural Mockup Frame */}
                  <div className="my-8 flex items-center justify-center relative z-10">
                    <div className={`w-full max-w-lg transition-all duration-700 transform ${
                      view3DAngle === '3d' ? 'rotate-x-12 rotate-y-6 scale-95 shadow-2xl' :
                      view3DAngle === 'top' ? 'rotate-0 scale-100 border-2 border-indigo-400/40' :
                      'rotate-0 scale-90 opacity-90'
                    }`}>
                      <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-indigo-500/40 rounded-3xl p-6 text-white space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">Floor {currentRoom.floor} Layout</span>
                            <h4 className="text-2xl font-black text-white">Room {currentRoom.roomNumber} — {currentRoom.type}</h4>
                          </div>
                          <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                            850 Sq. Ft.
                          </span>
                        </div>

                        {/* Interactive Blueprint Grid */}
                        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                            <span className="text-[10px] text-indigo-300 block font-bold">🛏️ KING BED & LOUNGE</span>
                            <p className="text-[11px] text-slate-300">Memory Foam Plush, Dual Bedside Touch Control</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                            <span className="text-[10px] text-amber-300 block font-bold">🌊 PRIVATE BALCONY</span>
                            <p className="text-[11px] text-slate-300">Panoraic Sunset Horizon, Outdoor Daybed</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                            <span className="text-[10px] text-sky-300 block font-bold">🛁 EN-SUITE SPA JACUZZI</span>
                            <p className="text-[11px] text-slate-300">Hydrotherapy Jets, Italian Marble Floor</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                            <span className="text-[10px] text-emerald-300 block font-bold">📺 SMART ROOM CONCIERGE</span>
                            <p className="text-[11px] text-slate-300">Automated AC, Blinds, In-Room Ordering Pad</p>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-white/10">
                          <span>Max Guests: <strong>{currentRoom.maxOccupancy} Persons</strong></span>
                          <span>Nightly Rate: <strong className="text-indigo-300">{formatCurrency(currentRoom.pricePerNight)}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar inside 3D View */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs text-white z-10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Interested in booking Room {currentRoom.roomNumber}?</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowNewBookingModal(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      Reserve Room {currentRoom.roomNumber}
                    </button>
                  </div>
                </div>

                {/* Side Specifications Panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-slate-900 text-base">Architectural & Tech Specs</h4>
                    <p className="text-xs text-slate-500">Live hardware integration & suite engineering</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <span className="font-bold text-slate-800 block">🔊 Acoustic Isolation</span>
                      <p className="text-slate-500 text-[11px]">Triple-pane soundproof glazing (STC Rating 58)</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <span className="font-bold text-slate-800 block">🌡️ Climate & Air Quality</span>
                      <p className="text-slate-500 text-[11px]">HEPA H14 Air Purification + Automated Thermostat</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <span className="font-bold text-slate-800 block">🔑 Keyless Door Entry</span>
                      <p className="text-slate-500 text-[11px]">Bluetooth Mobile App Digital Key + RFID Card</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <span className="font-bold text-slate-800 block">📶 Ultra-High Speed Fiber</span>
                      <p className="text-slate-500 text-[11px]">Dedicated Wi-Fi 7 Access Point (1 Gbps Symmetrical)</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveTab('premium_services')}
                      className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer border border-indigo-200"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" /> View Premium Concierge & Spa
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 1.8: PREMIUM GUEST SERVICES & CONCIERGE HUB */}
      {activeTab === 'premium_services' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-500/30 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Premium Guest Services & Concierge Hub</h3>
                <p className="text-xs text-amber-200">
                  Luxury Spa & Wellness, VIP Chauffeured Transfers, Private In-Suite Chef, and Helipad Excursions.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowBookServiceModal(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Book Service For Guest Room
            </button>
          </div>

          {/* Premium Service Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-amber-400 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                💆‍♀️
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Spa & Wellness Sanctuary</h4>
                <p className="text-xs text-slate-500 mt-0.5">Deep Tissue Massage, Hydrotherapy, & Organic Facials.</p>
              </div>
              <div className="text-xs font-extrabold text-amber-700 font-mono">From {formatCurrency(180)} / session</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-indigo-400 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                🚘
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">VIP Chauffeured Fleet</h4>
                <p className="text-xs text-slate-500 mt-0.5">Rolls-Royce, Escalade & Tesla Model Y Airport Pickup.</p>
              </div>
              <div className="text-xs font-extrabold text-indigo-700 font-mono">From {formatCurrency(150)} / transfer</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-emerald-400 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                👨‍🍳
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Private In-Suite Michelin Chef</h4>
                <p className="text-xs text-slate-500 mt-0.5">Custom 5-Course Tasting Menu cooked live on Balcony.</p>
              </div>
              <div className="text-xs font-extrabold text-emerald-700 font-mono">From {formatCurrency(320)} / guest</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-sky-400 transition">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                🚁
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Yacht & Helipad Charter</h4>
                <p className="text-xs text-slate-500 mt-0.5">Private Coastal Helicopter Flights & Sunset Cruises.</p>
              </div>
              <div className="text-xs font-extrabold text-sky-700 font-mono">From {formatCurrency(650)} / trip</div>
            </div>
          </div>

          {/* Active Guest Requests Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Active Concierge & Service Requests</h4>
                <p className="text-xs text-slate-500">Track and dispatch premium guest amenity bookings across all rooms</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {premiumRequests.length} Scheduled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 font-bold text-slate-700 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Room</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Service Name</th>
                    <th className="p-3">Scheduled Time</th>
                    <th className="p-3 text-right">Cost Charge</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {premiumRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-900">Room {req.roomNumber}</td>
                      <td className="p-3 font-semibold text-indigo-600">{req.category}</td>
                      <td className="p-3 font-bold text-slate-800">{req.serviceName}</td>
                      <td className="p-3 text-slate-600 font-mono">{req.scheduledTime}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">{formatCurrency(req.price)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'Confirmed' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          ● {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            const nextStatus = req.status === 'Pending' ? 'Confirmed' : req.status === 'Confirmed' ? 'Completed' : 'Pending';
                            setPremiumRequests(prev => prev.map(p => p.id === req.id ? { ...p, status: nextStatus } : p));
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          Cycle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOOK SERVICE MODAL */}
          {showBookServiceModal && (
            <div 
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
              onClick={(e) => { if (e.target === e.currentTarget) setShowBookServiceModal(false); }}
            >
              <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto my-auto shadow-2xl border border-slate-200 space-y-4 animate-scale-up relative">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900">Book Premium Concierge Service</h3>
                  <button 
                    type="button"
                    onClick={() => setShowBookServiceModal(false)} 
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Select Guest Room:</label>
                    <select
                      value={newServiceRoom}
                      onChange={(e) => setNewServiceRoom(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    >
                      {rooms.map(r => (
                        <option key={r.id} value={r.roomNumber}>Room {r.roomNumber} ({r.type})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Service Category:</label>
                    <select
                      value={newServiceType}
                      onChange={(e) => setNewServiceType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    >
                      <option value="Spa & Wellness">Spa & Wellness</option>
                      <option value="VIP Transport">VIP Chauffeured Transport</option>
                      <option value="Private Chef">Private In-Suite Gourmet Chef</option>
                      <option value="Excursions">Helipad / Yacht Charter Excursion</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const priceMap: Record<string, number> = {
                      'Spa & Wellness': 220,
                      'VIP Transport': 150,
                      'Private Chef': 350,
                      'Excursions': 750,
                    };
                    const newReq = {
                      id: `PR-${Date.now().toString().slice(-4)}`,
                      roomNumber: newServiceRoom,
                      serviceName: `Premium ${newServiceType} Experience`,
                      category: newServiceType as any,
                      scheduledTime: 'Today, 20:00',
                      price: priceMap[newServiceType] || 200,
                      status: 'Confirmed' as const
                    };
                    setPremiumRequests(prev => [newReq, ...prev]);
                    setShowBookServiceModal(false);
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Add & Charge To Room Folio
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1.9: EXPRESS CHECKOUT & UNIFIED MASTER BILLING */}
      {activeTab === 'checkout_folio' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Express Guest Checkout & Master Billing</h3>
                <p className="text-xs text-indigo-200">
                  Unified POS billing across Room Stays, Restaurant Meals, Bar Orders, Room Service & Spa Amenities.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPostChargeModal(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Post Restaurant / Extra Charge
              </button>
            </div>
          </div>

          {/* Active Guest Room Quick Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-500 uppercase block">Select Room for Express Checkout & Master Folio:</label>
              <span className="text-[10px] text-slate-400 font-mono">Syncing Restaurant POS & Room Accounts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {rooms.map(r => {
                const currentBooking = bookings.find(b => b.roomNumber === r.roomNumber && b.bookingStatus !== 'Checked-Out');
                const isSelected = checkoutRoomNumber === r.roomNumber;
                return (
                  <button
                    key={r.id}
                    onClick={() => setCheckoutRoomNumber(r.roomNumber)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer relative ${
                      isSelected 
                        ? 'bg-indigo-50/90 border-indigo-600 shadow-md ring-2 ring-indigo-500/20' 
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-black text-slate-900 text-sm">Room {r.roomNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Occupied' ? 'bg-rose-100 text-rose-800' :
                        r.status === 'Reserved' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-indigo-700 mt-1 truncate">
                      {currentBooking ? currentBooking.guestName : 'Vacant Room'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {r.type} • {formatCurrency(r.pricePerNight)}/night
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master Itemized Folio Breakdown Card */}
          {(() => {
            const selectedBooking = bookings.find(b => b.roomNumber === checkoutRoomNumber && b.bookingStatus !== 'Checked-Out') || bookings.find(b => b.roomNumber === checkoutRoomNumber);
            const currentCharges = folioCharges.filter(c => c.roomNumber === checkoutRoomNumber);
            const subtotal = currentCharges.reduce((acc, c) => acc + c.amount, 0);
            const municipalTax = Math.round(subtotal * 0.07);
            const serviceCharge = Math.round(subtotal * 0.10);
            const grandTotal = subtotal + municipalTax + serviceCharge;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Itemized Folio Table */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-lg">Room {checkoutRoomNumber} Master Guest Folio</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                          Live POS Sync Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Guest: <strong className="text-slate-800">{selectedBooking?.guestName || 'Alexander Vance'}</strong> ({selectedBooking?.guestEmail || 'guest@resort.com'})
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (selectedBooking) {
                          setSelectedFolioBooking(selectedBooking);
                        } else {
                          triggerToast('No active reservation found for this room.');
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-indigo-300" /> Preview Master Invoice
                    </button>
                  </div>

                  {/* Itemized Charges Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Category</th>
                          <th className="p-3">Item Description</th>
                          <th className="p-3">Posting Date</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {currentCharges.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">
                              No charges posted to Room {checkoutRoomNumber} folio yet.
                            </td>
                          </tr>
                        ) : (
                          currentCharges.map(charge => (
                            <tr key={charge.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 font-extrabold text-indigo-700">
                                <span className="inline-flex items-center gap-1">
                                  {charge.category.includes('Restaurant') ? <Utensils className="w-3.5 h-3.5 text-amber-600" /> :
                                   charge.category.includes('In-Room') ? <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" /> :
                                   charge.category.includes('Spa') ? <Sparkles className="w-3.5 h-3.5 text-purple-600" /> :
                                   charge.category.includes('Minibar') ? <Wine className="w-3.5 h-3.5 text-sky-600" /> :
                                   <Bed className="w-3.5 h-3.5 text-indigo-600" />}
                                  {charge.category}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-slate-800">{charge.description}</td>
                              <td className="p-3 text-slate-500 font-mono text-[11px]">{charge.date}</td>
                              <td className="p-3 text-right font-mono font-black text-slate-900">{formatCurrency(charge.amount)}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setFolioCharges(prev => prev.filter(c => c.id !== charge.id))}
                                  className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                                  title="Void Charge"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Restaurant Meal or Service Banner */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Utensils className="w-4 h-4 text-amber-600" />
                      <span>Guest dined at Resort Restaurant or ordered Room Service?</span>
                    </div>
                    <button
                      onClick={() => setShowPostChargeModal(true)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      + Post Restaurant Order
                    </button>
                  </div>
                </div>

                {/* Folio Summary & Express Settlement Box */}
                <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">Financial Settlement Summary</span>
                      <h4 className="text-xl font-black text-white mt-0.5">Room {checkoutRoomNumber} Master Bill</h4>
                    </div>

                    <div className="space-y-2.5 text-xs font-medium">
                      <div className="flex justify-between text-slate-300">
                        <span>Room Accommodation Stay</span>
                        <span className="font-mono">{formatCurrency(currentCharges.filter(c => c.category === 'Room Accommodation').reduce((a,b)=>a+b.amount,0))}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Restaurant & Bar Orders</span>
                        <span className="font-mono text-amber-400">{formatCurrency(currentCharges.filter(c => c.category === 'Restaurant & Dining').reduce((a,b)=>a+b.amount,0))}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>In-Room Dining</span>
                        <span className="font-mono text-emerald-400">{formatCurrency(currentCharges.filter(c => c.category === 'In-Room Dining').reduce((a,b)=>a+b.amount,0))}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Spa & Concierge Services</span>
                        <span className="font-mono text-purple-400">{formatCurrency(currentCharges.filter(c => c.category === 'Spa & Concierge').reduce((a,b)=>a+b.amount,0))}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Minibar & Sundry</span>
                        <span className="font-mono text-sky-400">{formatCurrency(currentCharges.filter(c => c.category === 'Minibar & Sundry').reduce((a,b)=>a+b.amount,0))}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400 text-[11px]">
                        <span>Subtotal Charges</span>
                        <span className="font-mono">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Tourism Tax (7% VAT)</span>
                        <span className="font-mono">{formatCurrency(municipalTax)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Resort Service Charge (10%)</span>
                        <span className="font-mono">{formatCurrency(serviceCharge)}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-indigo-300 uppercase font-bold block">Total Outstanding Folio</span>
                        <span className="text-2xl font-black text-white">{formatCurrency(grandTotal)}</span>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-80" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleExecuteExpressCheckout(checkoutRoomNumber)}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Settle Folio & Complete Checkout
                    </button>

                    <button
                      onClick={() => {
                        if (selectedBooking) {
                          setSelectedFolioBooking(selectedBooking);
                        } else {
                          triggerToast('Please select a valid room booking.');
                        }
                      }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                    >
                      <FileText className="w-4 h-4 text-indigo-400" /> Print Detailed PDF Invoice
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: GUEST RESERVATIONS & FOLIOS */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Guest Reservation Records</h3>
              <p className="text-xs text-slate-500">Live guest folios, arrival/departure schedules and payment statuses</p>
            </div>
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              + New Reservation
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Guest Info</th>
                  <th className="p-3.5">Room & Type</th>
                  <th className="p-3.5">Dates & Nights</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Stay Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-600">{booking.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{booking.guestName}</div>
                      <div className="text-[10px] text-slate-500">{booking.guestEmail} • {booking.guestPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-extrabold text-slate-900">Room {booking.roomNumber}</span>
                      <div className="text-[10px] text-slate-500">{booking.roomType}</div>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <div>{booking.checkIn} → {booking.checkOut}</div>
                      <div className="text-[10px] font-mono text-slate-500">{booking.nights} Nights stay</div>
                    </td>
                    <td className="p-3.5 font-extrabold text-slate-900">{formatCurrency(booking.totalPrice)}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        booking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        booking.bookingStatus === 'Checked-In' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        booking.bookingStatus === 'Confirmed' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedFolioBooking(booking)}
                        className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-lg cursor-pointer transition flex items-center gap-1"
                      >
                        <CreditCard className="w-3 h-3" /> Folio
                      </button>
                      {booking.bookingStatus === 'Confirmed' && (
                        <button
                          onClick={() => handleCheckInGuest(booking.id, booking.roomNumber)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition"
                        >
                          Check In
                        </button>
                      )}
                      {booking.bookingStatus === 'Checked-In' && (
                        <button
                          onClick={() => handleCheckOutGuest(booking.id, booking.roomNumber)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition"
                        >
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HOUSEKEEPING & MAINTENANCE */}
      {activeTab === 'housekeeping' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1">Housekeeping Dispatch & Room Cleaning Queue</h3>
            <p className="text-xs text-slate-500 mb-4">Track sanitization, room inspection status, and housekeeping assignments.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {housekeeping.map(task => (
                <div key={task.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-base">Room {task.roomNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      task.status === 'Inspected & Clean' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Assigned to: <span className="font-bold text-slate-900">{task.assignedStaff}</span></div>
                  <div className="text-[11px] text-slate-500">Last Cleaned: {task.lastCleaned}</div>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setHousekeeping(prev => prev.map(h => h.id === task.id ? { ...h, status: 'Inspected & Clean' } : h));
                        setRooms(prev => prev.map(r => r.roomNumber === task.roomNumber ? { ...r, status: 'Available' } : r));
                        triggerToast(`Room ${task.roomNumber} marked as Inspected & Clean!`);
                      }}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Mark Inspected & Ready
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DYNAMIC RATE PLANS */}
      {activeTab === 'rates' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Dynamic Seasonal Pricing & Rate Matrix</h3>
            <p className="text-xs text-slate-500">Automated rate plan adjustments synchronized with Website Builder & Booking Engine</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="font-extrabold text-indigo-950 text-sm">Standard Rate Plan</div>
              <p className="text-xs text-indigo-800">Base pricing applied during standard non-peak seasons.</p>
              <div className="text-lg font-black text-indigo-900">Base Tariff (100%)</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="font-extrabold text-amber-950 text-sm">Peak Holiday Surge (+35%)</div>
              <p className="text-xs text-amber-800">Automatically triggered during holidays, festivals, and weekend spikes.</p>
              <div className="text-lg font-black text-amber-900">+35% Dynamic Markup</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="font-extrabold text-emerald-950 text-sm">Corporate & Group Discount (-15%)</div>
              <p className="text-xs text-emerald-800">Applied for bulk corporate retreats and bookings over 5 nights.</p>
              <div className="text-lg font-black text-emerald-900">-15% Loyalty Discount</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW BOOKING */}
      {showNewBookingModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewBookingModal(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto my-auto shadow-2xl space-y-4 animate-scale-up relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Luggage className="w-5 h-5 text-indigo-600" /> New Guest Reservation
              </h3>
              <button 
                type="button" 
                onClick={() => setShowNewBookingModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Guest Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sarah@guest.com"
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0199"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Room</label>
                <select
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.roomNumber}>
                      Room {r.roomNumber} - {r.type} ({formatCurrency(r.pricePerNight)}/night) [{r.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Check-In Date</label>
                  <input
                    type="date"
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer mt-2"
              >
                Confirm Booking & Generate Folio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW ROOM */}
      {showNewRoomModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewRoomModal(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto my-auto shadow-2xl space-y-4 animate-scale-up relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Bed className="w-5 h-5 text-indigo-600" /> Add New Hotel Room
              </h3>
              <button 
                type="button" 
                onClick={() => setShowNewRoomModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 401"
                  value={newRoomNoInput}
                  onChange={(e) => setNewRoomNoInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Room Category / Type</label>
                <select
                  value={newRoomTypeInput}
                  onChange={(e) => setNewRoomTypeInput(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Standard King">Standard King</option>
                  <option value="Executive Room">Executive Room</option>
                  <option value="Ocean View">Ocean View</option>
                  <option value="Deluxe Suite">Deluxe Suite</option>
                  <option value="Presidential Suite">Presidential Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Floor Number</label>
                  <input
                    type="number"
                    value={newRoomFloorInput}
                    onChange={(e) => setNewRoomFloorInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nightly Tariff Rate</label>
                  <input
                    type="number"
                    value={newRoomPriceInput}
                    onChange={(e) => setNewRoomPriceInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer mt-2"
              >
                Add Room to Hotel Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST RESTAURANT / EXTRA CHARGE TO ROOM */}
      {showPostChargeModal && (
        <div 
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPostChargeModal(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto my-auto shadow-2xl space-y-4 animate-scale-up text-slate-900 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" /> Post Charge to Room Folio
              </h3>
              <button 
                type="button" 
                onClick={() => setShowPostChargeModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostChargeToFolio} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Guest Room:</label>
                <select
                  value={checkoutRoomNumber}
                  onChange={(e) => setCheckoutRoomNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.roomNumber}>Room {r.roomNumber} ({r.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Charge Category:</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="Restaurant & Dining">Restaurant & Dining Meal</option>
                  <option value="In-Room Dining">In-Room Dining Order</option>
                  <option value="Spa & Concierge">Spa & Concierge Service</option>
                  <option value="Minibar & Sundry">Minibar & Sundry Item</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Description / Order Details:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seafood Dinner & Pinot Noir - Table 4"
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Charge Amount ({currency}):</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={postAmount}
                  onChange={(e) => setPostAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Post Charge to Room {checkoutRoomNumber}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE GUEST MASTER INVOICE & THERMAL RECEIPT */}
      {selectedFolioBooking && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedFolioBooking(null); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto shadow-2xl space-y-5 animate-scale-up text-slate-900 relative">
            {/* Header with Format Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-lg text-slate-900">{profile.name} — Master Guest Invoice</h3>
                </div>
                <p className="text-xs text-slate-500 font-mono">Folio Reference: {selectedFolioBooking.id} • Tenant: {tenantId}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Format Toggle Button */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setReceiptFormat('A4')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      receiptFormat === 'A4' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Standard A4
                  </button>
                  <button
                    onClick={() => setReceiptFormat('Thermal')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      receiptFormat === 'Thermal' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    80mm Thermal
                  </button>
                </div>

                <button 
                  onClick={() => setSelectedFolioBooking(null)} 
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* A4 FORMAT VIEW */}
            {receiptFormat === 'A4' ? (
              <div className="space-y-5 print:p-0">
                {/* Guest & Room Summary Header */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Guest Particulars</span>
                    <p className="font-extrabold text-slate-900 text-sm">{selectedFolioBooking.guestName}</p>
                    <p className="text-slate-600">{selectedFolioBooking.guestEmail}</p>
                    <p className="text-slate-600">{selectedFolioBooking.guestPhone}</p>
                    <p className="mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded w-max">
                      ✓ Government ID Verified
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Reservation Summary</span>
                    <p className="font-extrabold text-indigo-700 text-sm">Room {selectedFolioBooking.roomNumber} ({selectedFolioBooking.roomType})</p>
                    <p className="text-slate-600">Check-In: <strong>{selectedFolioBooking.checkIn}</strong></p>
                    <p className="text-slate-600">Check-Out: <strong>{selectedFolioBooking.checkOut}</strong> ({selectedFolioBooking.nights} Nights)</p>
                    <p className="text-slate-600">Status: <strong className="text-emerald-600">{selectedFolioBooking.bookingStatus}</strong></p>
                  </div>
                </div>

                {/* Itemized Charges Breakdown Table */}
                {(() => {
                  const charges = folioCharges.filter(c => c.roomNumber === selectedFolioBooking.roomNumber);
                  const subtotal = charges.reduce((a, b) => a + b.amount, 0);
                  const municipalTax = Math.round(subtotal * 0.07);
                  const serviceCharge = Math.round(subtotal * 0.10);
                  const grandTotal = subtotal + municipalTax + serviceCharge;

                  return (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono flex items-center justify-between">
                        <span>Consolidated Folio Charges (Room + Dining + Spa)</span>
                        <span className="text-[10px] text-indigo-600 font-bold">{charges.length} Line Items</span>
                      </h4>
                      <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 font-mono text-[10px] text-slate-600 uppercase border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Category</th>
                              <th className="p-2.5">Item Description</th>
                              <th className="p-2.5 text-center">Date</th>
                              <th className="p-2.5 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {charges.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-4 text-center text-slate-400">
                                  No charges recorded. Defaulting to base reservation rate.
                                </td>
                              </tr>
                            ) : (
                              charges.map(c => (
                                <tr key={c.id}>
                                  <td className="p-2.5 font-bold text-indigo-700">{c.category}</td>
                                  <td className="p-2.5 text-slate-900 font-medium">{c.description}</td>
                                  <td className="p-2.5 text-center text-slate-500 font-mono text-[11px]">{c.date}</td>
                                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(c.amount)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                          <tfoot className="bg-slate-50 border-t border-slate-200 text-xs">
                            <tr>
                              <td colSpan={3} className="p-2 text-right text-slate-500 font-medium">Subtotal Charges:</td>
                              <td className="p-2 text-right font-mono font-bold text-slate-800">{formatCurrency(subtotal)}</td>
                            </tr>
                            <tr>
                              <td colSpan={3} className="p-2 text-right text-slate-500 font-medium">Municipal Hospitality Tax (7%):</td>
                              <td className="p-2 text-right font-mono text-slate-600">{formatCurrency(municipalTax)}</td>
                            </tr>
                            <tr>
                              <td colSpan={3} className="p-2 text-right text-slate-500 font-medium">Resort Service Charge (10%):</td>
                              <td className="p-2 text-right font-mono text-slate-600">{formatCurrency(serviceCharge)}</td>
                            </tr>
                            <tr className="border-t border-slate-300 font-black text-sm">
                              <td colSpan={3} className="p-3 text-right uppercase font-mono text-slate-900">Total Billed Master Folio:</td>
                              <td className="p-3 text-right text-indigo-700 font-black">{formatCurrency(grandTotal)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
                  <div className="border-b border-dashed border-slate-300 pb-8 text-center">
                    <p className="font-mono text-[10px] uppercase">Guest Authorization Signature</p>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-8 text-center">
                    <p className="font-mono text-[10px] uppercase">Resort General Manager Signature</p>
                  </div>
                </div>
              </div>
            ) : (
              /* 80mm POS THERMAL SLIP VIEW */
              <div className="bg-amber-50/50 p-6 rounded-2xl border-2 border-dashed border-slate-300 max-w-sm mx-auto font-mono text-xs text-slate-900 space-y-3 shadow-inner">
                <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
                  <h4 className="font-black text-sm uppercase tracking-wider">{profile.name}</h4>
                  <p className="text-[10px] text-slate-600">LUXURY RESORT & RESTAURANT OS</p>
                  <p className="text-[10px] text-slate-500">TAX INVOICE / THERMAL RECEIPT</p>
                  <p className="text-[10px] text-slate-500">{new Date().toLocaleString()}</p>
                </div>

                <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                  <div className="flex justify-between"><span>GUEST:</span> <strong className="font-bold">{selectedFolioBooking.guestName}</strong></div>
                  <div className="flex justify-between"><span>ROOM:</span> <strong className="font-bold">Room {selectedFolioBooking.roomNumber}</strong></div>
                  <div className="flex justify-between"><span>REF:</span> <span>{selectedFolioBooking.id}</span></div>
                </div>

                <div className="space-y-1 border-b border-dashed border-slate-400 pb-3">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Itemized Summary:</p>
                  {folioCharges.filter(c => c.roomNumber === selectedFolioBooking.roomNumber).map(c => (
                    <div key={c.id} className="flex justify-between text-[11px]">
                      <span className="truncate pr-2">{c.description}</span>
                      <span className="font-bold shrink-0">{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                </div>

                {(() => {
                  const charges = folioCharges.filter(c => c.roomNumber === selectedFolioBooking.roomNumber);
                  const subtotal = charges.reduce((a, b) => a + b.amount, 0);
                  const tax = Math.round(subtotal * 0.07);
                  const service = Math.round(subtotal * 0.10);
                  const grandTotal = subtotal + tax + service;

                  return (
                    <div className="space-y-1 text-xs pt-1">
                      <div className="flex justify-between text-slate-600"><span>SUBTOTAL:</span><span>{formatCurrency(subtotal)}</span></div>
                      <div className="flex justify-between text-slate-600"><span>VAT (7%):</span><span>{formatCurrency(tax)}</span></div>
                      <div className="flex justify-between text-slate-600"><span>SERVICE (10%):</span><span>{formatCurrency(service)}</span></div>
                      <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-900 pt-1 mt-1">
                        <span>GRAND TOTAL:</span>
                        <span>{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="text-center pt-2 text-[10px] text-slate-500 font-sans">
                  *** THANK YOU FOR VISITING OUR RESORT ***
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                ● PAID IN FULL
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleCheckOutGuest(selectedFolioBooking.id, selectedFolioBooking.roomNumber);
                    setSelectedFolioBooking(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Settle & Checkout
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
