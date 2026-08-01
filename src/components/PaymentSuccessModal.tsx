import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentSuccessModal({ isOpen, onClose }: PaymentSuccessModalProps) {

  return (
    <AnimatePresence>
      {isOpen && (
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
          className="bg-[#0C0D14] border border-emerald-500/30 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden text-center p-8"
        >
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
             </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-sm text-slate-400 mb-8">
            Your subscription has been upgraded successfully. Thank you for your purchase.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-lg"
          >
            Continue to Dashboard
          </button>
        </motion.div>
      </motion.div>
          )}
    </AnimatePresence>
  );
}
