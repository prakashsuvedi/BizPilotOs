import React, { useState } from 'react';
import { PlaneTakeoff, Map, Calendar as CalendarIcon, Users, CreditCard, Compass, Sun, MapPin } from 'lucide-react';
import { BusinessProfile } from '../types';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
}

export default function ToursAndTravelsManagement({ profile, tenantId }: Props) {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tours & Travels Operations</h2>
            <p className="text-sm text-slate-500">Manage bookings, itineraries, fleet, and travel agents.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-px overflow-x-auto">
        {[
          { id: 'bookings', label: 'Bookings', icon: CalendarIcon },
          { id: 'itineraries', label: 'Itineraries', icon: Map },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'payments', label: 'Payments', icon: CreditCard }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id ? 'border-cyan-600 text-cyan-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && <BookingsTab />}
      {activeTab === 'itineraries' && <ItinerariesTab />}
      {activeTab === 'customers' && <CustomersTab />}
      {activeTab === 'payments' && <PaymentsTab />}
    </div>
  );
}
function BookingsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center border-b pb-4 border-slate-100 mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Upcoming Departures</h3>
            <button className="px-3 py-1.5 bg-cyan-50 text-cyan-700 text-xs font-bold rounded hover:bg-cyan-100">Add Booking</button>
          </div>
          <div className="space-y-4">
            {[
              { dest: 'Bali Paradise Retreat', date: 'Oct 15, 2026', pax: 12, status: 'Confirmed' },
              { dest: 'Swiss Alps Expedition', date: 'Oct 18, 2026', pax: 8, status: 'Pending Visas' },
              { dest: 'Tokyo Neon Nights', date: 'Nov 02, 2026', pax: 4, status: 'Confirmed' }
            ].map((trip, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-700">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{trip.dest}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {trip.date}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {trip.pax} Pax</span>
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${trip.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {trip.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-md">
          <h3 className="font-bold text-sm text-cyan-100 mb-2">Weather & Alerts</h3>
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-8 h-8 text-yellow-300" />
            <div>
              <p className="font-bold text-lg">Bali, ID</p>
              <p className="text-xs text-cyan-100">32°C • Sunny</p>
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
            <p className="text-xs font-bold flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" /> Status Normal</p>
            <p className="text-[10px] text-cyan-50">No travel advisories for upcoming 72 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItinerariesTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Tour Itineraries</h3>
        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 transition">Create Itinerary</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: '7-Day Safari', loc: 'Kenya', price: '$2,400', rating: '4.9' },
          { name: 'Cultural Tour', loc: 'Kyoto', price: '$1,800', rating: '4.8' }
        ].map((itinerary, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-5 hover:border-cyan-400 transition cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-800">{itinerary.name}</h4>
              <span className="text-xs font-bold bg-cyan-100 text-cyan-700 px-2 py-1 rounded">{itinerary.price}</span>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> {itinerary.loc}</p>
            <div className="mt-4 flex gap-2">
               <button className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-slate-200">Edit</button>
               <button className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-slate-200">View Map</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Customer Directory</h3>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Name</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Email</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Trips</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3].map(i => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-700">Jane Doe {i}</td>
                <td className="py-3 px-4 text-slate-500">jane{i}@example.com</td>
                <td className="py-3 px-4 text-slate-600">{i + 1}</td>
                <td className="py-3 px-4 text-right space-x-2">
                   <button className="text-cyan-600 hover:underline text-xs font-bold">View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-center py-20">
       <div className="text-center space-y-3">
         <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
         <p className="text-slate-500 font-medium">Payment gateway configuration pending.</p>
       </div>
    </div>
  );
}


