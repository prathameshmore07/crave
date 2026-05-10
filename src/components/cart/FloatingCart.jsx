import React from 'react';
import { useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { formatPrice } from '../../utils/formatPrice';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function FloatingCart() {
  const location = useLocation();
  const cartItems = useCartStore((state) => state.items);
  const activeRestaurant = useCartStore((state) => state.restaurant);
  const getCartTotals = useCartStore((state) => state.getCartTotals);
  const cartOpen = useUiStore((state) => state.cartOpen);
  const setCartOpen = useUiStore((state) => state.setCartOpen);

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { finalTotal } = getCartTotals();

  // Hide floating cart on checkout page, live tracking, and when cart drawer is active
  const hideOnPaths = ['/checkout', '/order'];
  const shouldHide = cartOpen || totalCount === 0 || hideOnPaths.some(p => location.pathname.startsWith(p));

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="fixed z-[80] bottom-[76px] md:bottom-6 left-4 right-4 md:left-auto md:right-6 pointer-events-none"
      >
        <button
          onClick={() => setCartOpen(true)}
          className="w-full md:w-[360px] bg-brand hover:bg-brand-hover text-white h-14 rounded-2xl shadow-xl shadow-brand/20 border border-brand-hover/10 flex items-center justify-between px-5 pointer-events-auto select-none transition-all active:scale-[0.98] group cursor-pointer"
        >
          {/* Left Block: Counts and Rest Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[11px] uppercase font-bold tracking-wider block opacity-85">
                {totalCount} {totalCount === 1 ? 'Item' : 'Items'} Added
              </span>
              <span className="text-sm font-black">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Right Block: CTA & Arrow */}
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 group-hover:bg-white/15 transition-colors">
            View Basket
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
