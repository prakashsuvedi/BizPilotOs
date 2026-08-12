import { useCurrency } from '../lib/CurrencyContext';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: any;
  onConfirm: (method: string) => void;
  isLoading: boolean;
}

export default function CheckoutModal({ isOpen, onClose, selectedPlan, onConfirm, isLoading }: CheckoutModalProps) {
  const [confirmMethod, setConfirmMethod] = React.useState<string | null>(null);
  const { formatCurrency } = useCurrency();
  if (!isOpen || !selectedPlan) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#0C0D14] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0e101a]">
            <div>
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                Checkout
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Complete your subscription to {selectedPlan.name}
              </p>
            </div>
            <button
              onClick={() => { setConfirmMethod(null); onClose(); }}
              disabled={isLoading}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {confirmMethod ? (
               <div className="bg-[#0e101a] border border-white/10 rounded-xl p-6 text-center space-y-6">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
                     <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Confirm Payment</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                      You are about to initiate a payment of <span className="font-bold text-white">{formatCurrency(selectedPlan.amountToPay || selectedPlan.mrr)}</span> using {confirmMethod === 'local' ? 'Local Wallets (API Nepal)' : 'International Card (Stripe)'}. Do you want to proceed?
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button 
                       onClick={() => setConfirmMethod(null)} 
                       disabled={isLoading}
                       className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition"
                     >
                        Cancel
                     </button>
                     <button 
                       onClick={() => onConfirm(confirmMethod)}
                       disabled={isLoading}
                       className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {isLoading ? 'Processing...' : 'Proceed to Pay'}
                     </button>
                  </div>
               </div>
            ) : (
               <>
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-slate-300">Total Amount Due</span>
              <span className="text-2xl font-bold text-white">{formatCurrency(selectedPlan.amountToPay || selectedPlan.mrr)}<span className="text-sm text-slate-400 font-normal">{selectedPlan.amountToPay < selectedPlan.mrr ? ' (Prorated)' : '/mo'}</span></span>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Payment Method</h3>
              
              {/* Local Payments */}
              <button 
                onClick={() => setConfirmMethod('local')}
                disabled={isLoading}
                className="w-full text-left bg-[#0e101a] border border-white/10 hover:border-indigo-500/50 rounded-xl p-5 transition group disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-white group-hover:text-indigo-400 transition">Pay with Local Wallets / QR</h4>
                    <p className="text-xs text-slate-400 mt-0.5">API Nepal integration</p>
                  </div>
                </div>
                
                {/* Clean CSS Badges for Local Wallets */}
                <div className="flex items-center gap-2 flex-wrap pl-16 sm:pl-0 shrink-0">
                  <div className="h-[30px] bg-[#60bb46] rounded-md px-2.5 flex items-center justify-center shadow-sm border border-[#52a63a]">
                     <span className="text-white font-bold text-[11px] tracking-wide">eSewa</span>
                  </div>
                  <div className="h-[30px] bg-[#5c2d91] rounded-md px-2.5 flex items-center justify-center shadow-sm border border-[#4d2678]">
                     <span className="text-white font-bold text-[11px] tracking-wide">Khalti</span>
                  </div>
                  <div className="h-[30px] bg-[#e21b22] rounded-md px-2.5 flex items-center justify-center shadow-sm border border-[#cc181f]">
                     <span className="text-white font-bold text-[11px] tracking-wide">Fonepay</span>
                  </div>
                </div>
              </button>

              {/* International Payments */}
              <button 
                onClick={() => setConfirmMethod('stripe')}
                disabled={isLoading}
                className="w-full text-left bg-[#0e101a] border border-white/10 hover:border-emerald-500/50 rounded-xl p-5 transition group disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-white group-hover:text-emerald-400 transition">Pay with International Card</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Stripe secure checkout</p>
                  </div>
                </div>
                
                {/* SVG/CSS Badges for Cards */}
                <div className="flex items-center gap-2 flex-wrap pl-16 sm:pl-0 shrink-0">
                   {/* Visa */}
                   <div className="h-[30px] w-[46px] bg-[#ffffff] rounded-md flex items-center justify-center shadow-sm border border-slate-200">
                      <svg viewBox="0 0 38 12" className="h-[12px] fill-[#1434CB]"><path d="M14.654 0l-1.352 8.444h2.158L16.812 0h-2.158zm7.126 8.243c-2.164 0-3.69-1.127-3.699-2.735-.011-1.303 1.205-2.028 2.122-2.47 1.054-.509 1.411-.837 1.408-1.293-.004-.702-.857-1.025-1.649-1.025-.916 0-1.745.215-2.417.653l-.337.158-.31-1.895C17.781.168 18.995 0 20.076 0c2.302 0 3.805 1.116 3.818 2.853.013 1.357-1.327 2.109-2.151 2.51-.97.472-1.309.775-1.307 1.2.003.65.732.996 1.686.996.81 0 1.547-.168 2.127-.474l.261-.138.318 1.948c-.68.31-1.666.577-2.854.577zM29.566 0h-1.684c-.52 0-.96.302-1.166.77L22.614 8.444h2.274l.455-1.229h2.775l.267 1.229h2.01L29.566 0zm-2.025 5.56l.872-2.355.503 2.355h-1.375zM11.648 8.444L9.125.43c-.156-.511-.531-.762-1.018-.762H.214L0 1.218c1.65.347 3.513.935 4.673 1.644l1.517 5.253h2.261l3.197-7.685h2.25l-2.45 8.014z"/></svg>
                   </div>
                   {/* Mastercard */}
                   <div className="h-[30px] w-[46px] bg-[#ffffff] rounded-md flex items-center justify-center shadow-sm border border-slate-200">
                      <svg viewBox="0 0 36 24" className="h-[18px]"><path fill="#EB001B" d="M22.1 12A11.96 11.96 0 0117.5 21.6 12 12 0 0017.5 2.4 11.96 11.96 0 0122.1 12z"/><path fill="#F79E1B" d="M29.5 12a12 12 0 01-12 9.6c2.4 0 4.6-.9 6.2-2.4V4.8C22.1 3.3 19.9 2.4 17.5 2.4 20.3 2.4 22.8 3.5 24.8 5.2 27.6 7.4 29.5 9.5 29.5 12z"/><path fill="#FF5F00" d="M17.5 21.6a11.96 11.96 0 01-4.6-9.6 11.96 11.96 0 014.6-9.6A11.96 11.96 0 0012.9 12a11.96 11.96 0 004.6 9.6z"/><path fill="#EB001B" d="M5.5 12A12 12 0 0117.5 2.4 11.96 11.96 0 0012.9 12a11.96 11.96 0 004.6 9.6A12 12 0 015.5 12z"/></svg>
                   </div>
                   {/* Amex */}
                   <div className="h-[30px] w-[46px] bg-[#007BC1] rounded-md flex items-center justify-center shadow-sm border border-[#00609a]">
                      <svg viewBox="0 0 32 32" className="h-[20px] fill-white"><path d="M28.026 12H32l-1.993 6.942-2.448-6.942h-3.692l-2.006 6.942L19.868 12h-3.64l3.824 10h4.298l1.455-5.204L27.273 22h4.718L32 12h-3.974zm-22.162 0h-4.32l-1.544 10h4.088l.617-2.316h4.536l.578 2.316h4.372L11.534 12H5.864zm1.4 3.73l1.196 3.96h-2.34l1.144-3.96z"/></svg>
                   </div>
                </div>
              </button>
            </div>

            </>
            )}
            {isLoading && !confirmMethod && (
              <div className="flex items-center justify-center gap-2 text-indigo-400 text-sm font-bold p-4 bg-indigo-500/10 rounded-xl">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                Redirecting to secure gateway...
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
