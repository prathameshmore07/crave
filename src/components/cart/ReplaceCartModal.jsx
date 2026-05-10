import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ReplaceCartModal() {
  const showReplaceModal = useCartStore((state) => state.showReplaceModal);
  const pendingRestaurant = useCartStore((state) => state.pendingRestaurant);
  const activeRestaurant = useCartStore((state) => state.restaurant);
  const confirmReplaceCart = useCartStore((state) => state.confirmReplaceCart);
  const closeReplaceModal = useCartStore((state) => state.closeReplaceModal);

  return (
    <AnimatePresence>
      {showReplaceModal && (
        <>
          {/* Backdrop blur layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={closeReplaceModal}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-[200] pointer-events-auto"
          />

          {/* Modal Card Container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-md bg-white dark:bg-dark-surface border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-6 shadow-2xl relative pointer-events-auto flex flex-col space-y-5 text-left"
            >
              {/* Close Button */}
              <button
                onClick={closeReplaceModal}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Icon & Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-gray-850 dark:text-gray-100 tracking-tight leading-tight">
                    Replace Cart Items?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                    Your cart currently contains delicious dishes from <strong className="text-brand font-bold">{activeRestaurant?.name}</strong>.
                  </p>
                </div>
              </div>

              {/* Warning Context */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-bg/40 border border-black/[0.04] dark:border-white/[0.04] text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Adding items from <span className="text-gray-800 dark:text-gray-200 font-bold">{pendingRestaurant?.name}</span> will discard your current selection and clear your basket. Are you sure you want to proceed?
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={closeReplaceModal}
                  className="h-11 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-850 text-gray-650 dark:text-gray-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReplaceCart}
                  className="h-11 bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
                >
                  <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                  Replace Cart
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
