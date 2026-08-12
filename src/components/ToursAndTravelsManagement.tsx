import React, { useState, useEffect } from 'react';
import { PlaneTakeoff, Map, Calendar as CalendarIcon, Users, CreditCard, Compass, Sun, MapPin, Plus, Printer, CheckCircle, ShieldAlert, FileText, Download, Phone, Mail, Award, DollarSign } from 'lucide-react';
import { BusinessProfile } from '../types';
import { useCurrency } from '../lib/CurrencyContext';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
}

interface TourBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  dest: string;
  date: string;
  pax: number;
  totalAmount: number;
  status: 'Confirmed' | 'Pending Visas' | 'Cancelled';
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  guideAssigned: string;
}

interface TourItinerary {
  id: string;
  name: string;
  loc: string;
  days: number;
  price: number;
  rating: string;
  description: string;
}

export default function ToursAndTravelsManagement({ profile, tenantId }: Props) {
  const [activeTab, setActiveTab] = useState('bookings');
  const { currency, formatCurrency } = useCurrency();

  // Tenant-aware persistence for bookings
  const [bookings, setBookings] = useState<TourBooking[]>(() => {
    try {
      const saved = localStorage.getItem(`marketforge_tours_${tenantId}_bookings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'TB-1001', customerName: 'Eleanor Vance', customerEmail: 'eleanor@travel.com', dest: 'Bali & Ubud Paradise Retreat', date: '2026-10-15', pax: 4, totalAmount: 3200, status: 'Confirmed', paymentStatus: 'Paid', guideAssigned: 'Ketan Sharma' },
      { id: 'TB-1002', customerName: 'Marcus Wright', customerEmail: 'm.wright@solas.io', dest: 'Swiss Alps Expedition & Zermatt', date: '2026-10-18', pax: 2, totalAmount: 4800, status: 'Pending Visas', paymentStatus: 'Partial', guideAssigned: 'Hans Weber' },
      { id: 'TB-1003', customerName: 'Dr. Sarah Connor', customerEmail: 'sarah@apexmed.org', dest: 'Tokyo Neon & Kyoto Temple Tour', date: '2026-11-02', pax: 6, totalAmount: 7500, status: 'Confirmed', paymentStatus: 'Paid', guideAssigned: 'Kenji Sato' }
    ];
  });

  const [itineraries, setItineraries] = useState<TourItinerary[]>(() => {
    try {
      const saved = localStorage.getItem(`marketforge_tours_${tenantId}_itineraries`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'IT-01', name: '7-Day African Wildlife Safari', loc: 'Kenya & Serengeti', days: 7, price: 2400, rating: '4.9', description: 'Includes 4x4 Land Cruiser, luxury tented camp, balloon safari & park entry.' },
      { id: 'IT-02', name: 'Kyoto Cultural Heritage & Tea Ceremony', loc: 'Kyoto & Nara, Japan', days: 5, price: 1800, rating: '4.8', description: 'Bullet train transfers, shinto shrine pass, ryokan stay with kaiseki dining.' },
      { id: 'IT-03', name: 'Everest Base Camp Helicopter Trek', loc: 'Solukhumbu, Nepal', days: 12, price: 3500, rating: '5.0', description: 'Lukla flight, sherpa guides, high-altitude lodge accommodation & medical oxygen.' }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(`marketforge_tours_${tenantId}_bookings`, JSON.stringify(bookings));
    } catch (e) {}
  }, [bookings, tenantId]);

  useEffect(() => {
    try {
      localStorage.setItem(`marketforge_tours_${tenantId}_itineraries`, JSON.stringify(itineraries));
    } catch (e) {}
  }, [itineraries, tenantId]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/20 rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <PlaneTakeoff className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Tours & Travels Operations OS</h2>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                {currency} ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Manage tour packages, itinerary dispatchers, fleet drivers, and customer vouchers for tenant <strong className="text-cyan-300 font-mono">{tenantId}</strong>.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono hidden sm:block">
            <span className="text-[10px] text-slate-400 block uppercase">Active Agency Revenue</span>
            <span className="text-sm font-black text-cyan-400">
              {formatCurrency(bookings.reduce((sum, b) => sum + (b.paymentStatus === 'Paid' ? b.totalAmount : b.totalAmount * 0.5), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        {[
          { id: 'bookings', label: 'Booking Desk & Vouchers', icon: CalendarIcon },
          { id: 'itineraries', label: 'Package & Itinerary Builder', icon: Map },
          { id: 'customers', label: 'Passenger Directory', icon: Users },
          { id: 'payments', label: 'Agency Accounts & Invoices', icon: CreditCard }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition cursor-pointer ${activeTab === tab.id ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <BookingsTab 
          bookings={bookings} 
          onAddBooking={(newB) => setBookings([newB, ...bookings])}
          formatCurrency={formatCurrency}
        />
      )}
      {activeTab === 'itineraries' && (
        <ItinerariesTab 
          itineraries={itineraries} 
          onAddItinerary={(newI) => setItineraries([newI, ...itineraries])}
          formatCurrency={formatCurrency}
        />
      )}
      {activeTab === 'customers' && <CustomersTab bookings={bookings} />}
      {activeTab === 'payments' && <PaymentsTab bookings={bookings} formatCurrency={formatCurrency} />}
    </div>
  );
}

function BookingsTab({ 
  bookings, 
  onAddBooking,
  formatCurrency 
}: { 
  bookings: TourBooking[]; 
  onAddBooking: (b: TourBooking) => void;
  formatCurrency: (amt: number) => string;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<TourBooking | null>(null);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [destination, setDestination] = useState('Everest Helicopter Tour');
  const [pax, setPax] = useState(2);
  const [price, setPrice] = useState(1500);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;
    const newB: TourBooking = {
      id: `TB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: custName,
      customerEmail: custEmail || 'guest@travel.com',
      dest: destination,
      date: new Date().toISOString().split('T')[0],
      pax: Number(pax),
      totalAmount: Number(price),
      status: 'Confirmed',
      paymentStatus: 'Paid',
      guideAssigned: 'Lead Expedition Officer'
    };
    onAddBooking(newB);
    setCustName('');
    setCustEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex justify-between items-center border-b pb-4 border-slate-100 mb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-600" /> Active Departure Manifest & Bookings
              </h3>
              <p className="text-xs text-slate-500">Real-time status of group tours, private charters and passenger vouchers.</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Book New Package
            </button>
          </div>

          <div className="space-y-3">
            {bookings.map((trip) => (
              <div key={trip.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-cyan-50/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">{trip.dest}</p>
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {trip.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 font-medium"><Users className="w-3 h-3 text-slate-400" /> {trip.customerName} ({trip.pax} Pax)</span>
                      <span className="flex items-center gap-1 font-mono"><CalendarIcon className="w-3 h-3 text-slate-400" /> {trip.date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block font-mono">
                      {formatCurrency(trip.totalAmount)}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${trip.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {trip.paymentStatus}
                    </span>
                  </div>

                  <button 
                    onClick={() => setSelectedVoucher(trip)}
                    className="p-2 bg-white border border-slate-200 hover:border-cyan-500 rounded-xl text-slate-600 hover:text-cyan-600 transition cursor-pointer flex items-center gap-1 font-bold text-xs"
                    title="Print Passenger Voucher"
                  >
                    <Printer className="w-4 h-4 text-cyan-600" /> Voucher
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRINTABLE TRAVEL VOUCHER MODAL */}
        {selectedVoucher && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-scale-up text-slate-900">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold">
                    <PlaneTakeoff className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Official Passenger Travel Voucher</h3>
                    <p className="text-xs text-slate-500 font-mono">Voucher ID: {selectedVoucher.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedVoucher(null)} 
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Itinerary & Passenger Specs */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Primary Traveler</span>
                  <p className="font-extrabold text-slate-900">{selectedVoucher.customerName}</p>
                  <p className="text-slate-600">{selectedVoucher.customerEmail}</p>
                  <p className="mt-1 text-slate-600 font-bold">Pax Count: {selectedVoucher.pax} Passengers</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Expedition Details</span>
                  <p className="font-extrabold text-cyan-700">{selectedVoucher.dest}</p>
                  <p className="text-slate-600">Departure Date: <strong>{selectedVoucher.date}</strong></p>
                  <p className="text-slate-600">Assigned Officer: <strong>{selectedVoucher.guideAssigned}</strong></p>
                </div>
              </div>

              {/* Inclusions & Luggage Allowance */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Package Inclusions & Instructions</span>
                <div className="bg-cyan-50/50 border border-cyan-200/60 p-3 rounded-2xl space-y-1.5">
                  <p className="font-bold text-cyan-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-cyan-600" /> Private AC Vehicle Transfers & Hotel Pickup Included
                  </p>
                  <p className="text-slate-600 pl-5">Please carry your physical passport and 2 passport size photographs at airport entry.</p>
                  <p className="text-slate-600 pl-5">24/7 Helpline: +1 (800) 555-EXPEDITION</p>
                </div>
              </div>

              {/* Fee & Receipt Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Package Fee</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{formatCurrency(selectedVoucher.totalAmount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${selectedVoucher.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    ● {selectedVoucher.paymentStatus === 'Paid' ? 'PAID IN FULL' : 'DEPOSIT RECEIVED'}
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Print Voucher
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
          <h3 className="font-extrabold text-sm text-cyan-100 mb-2 flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-300" /> Live Destination Intelligence
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-8 h-8 text-yellow-300" />
            <div>
              <p className="font-extrabold text-lg">Kathmandu & Pokhara Valley</p>
              <p className="text-xs text-cyan-100">24°C • Clear Mountain Views</p>
            </div>
          </div>
          <div className="bg-black/30 rounded-2xl p-4 backdrop-blur-md border border-white/10 space-y-2">
            <p className="text-xs font-bold flex items-center gap-1.5 text-emerald-300">
              <ShieldAlert className="w-4 h-4" /> All Flight Corridors Normal
            </p>
            <p className="text-[11px] text-cyan-100 leading-relaxed">
              Permits, Sagarmatha National Park entry vouchers, and helicopter landing clearances active for current session.
            </p>
          </div>
        </div>

        {/* Modal form */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreate} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <PlaneTakeoff className="w-5 h-5 text-cyan-600" /> New Tour Booking
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Primary Passenger Name:</label>
                  <input 
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Alexandra Smith"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Contact Email:</label>
                  <input 
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Tour Package / Destination:</label>
                  <input 
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Passenger Count (Pax):</label>
                    <input 
                      type="number"
                      min={1}
                      value={pax}
                      onChange={(e) => setPax(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Total Fee Amount:</label>
                    <input 
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ItinerariesTab({ 
  itineraries, 
  onAddItinerary,
  formatCurrency 
}: { 
  itineraries: TourItinerary[]; 
  onAddItinerary: (i: TourItinerary) => void;
  formatCurrency: (amt: number) => string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base">Agency Tour Itineraries & Catalog</h3>
          <p className="text-xs text-slate-500">Configure customized trip itineraries, inclusions, hotel ratings, and baseline pricing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {itineraries.map((item) => (
          <div key={item.id} className="border border-slate-200 rounded-2xl p-5 hover:border-cyan-500/50 transition bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-extrabold text-slate-800 text-sm">{item.name}</h4>
                <span className="text-xs font-black bg-cyan-100 text-cyan-800 px-2.5 py-1 rounded-xl font-mono">
                  {formatCurrency(item.price)}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5 text-cyan-600"/> {item.loc} ({item.days} Days)</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-600 flex items-center gap-1">★ {item.rating} Rating</span>
              <button 
                onClick={() => alert(`Full Itinerary Breakdown for ${item.name}:\nLocation: ${item.loc}\nDuration: ${item.days} Days\nBase Fare: ${formatCurrency(item.price)}\n\nIncludes private transfers, licensed tour guides, breakfast buffet and permits.`)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Inspect Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersTab({ bookings }: { bookings: TourBooking[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
      <h3 className="font-extrabold text-slate-800 text-base mb-1">Passenger & Client Directory</h3>
      <p className="text-xs text-slate-500 mb-4">Registered travelers across active and historical tours.</p>

      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Passenger Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Booking ID</th>
              <th className="py-3 px-4">Assigned Guide</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-800">{b.customerName}</td>
                <td className="py-3 px-4 text-slate-500">{b.customerEmail}</td>
                <td className="py-3 px-4 font-mono text-cyan-700 font-bold">{b.id}</td>
                <td className="py-3 px-4 text-slate-600">{b.guideAssigned}</td>
                <td className="py-3 px-4 text-right">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab({ bookings, formatCurrency }: { bookings: TourBooking[]; formatCurrency: (amt: number) => string }) {
  const totalCollected = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'Paid' ? b.totalAmount : b.totalAmount * 0.5), 0);
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base">Agency Financials & Invoicing</h3>
          <p className="text-xs text-slate-500">Track tour deposit collections, vendor payouts, and travel agency commissions.</p>
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-2xl px-4 py-2 font-mono text-right">
          <span className="text-[10px] text-cyan-700 block uppercase font-bold">Total Confirmed Collections</span>
          <span className="text-lg font-black text-cyan-900">{formatCurrency(totalCollected)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Paid Vouchers</span>
          <span className="text-2xl font-black text-emerald-600 block">{bookings.filter(b => b.paymentStatus === 'Paid').length}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Pending Visa / Partial</span>
          <span className="text-2xl font-black text-amber-600 block">{bookings.filter(b => b.paymentStatus === 'Partial').length}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Average Booking Value</span>
          <span className="text-2xl font-black text-cyan-700 block font-mono">
            {formatCurrency(bookings.length > 0 ? totalCollected / bookings.length : 0)}
          </span>
        </div>
      </div>
    </div>
  );
}



