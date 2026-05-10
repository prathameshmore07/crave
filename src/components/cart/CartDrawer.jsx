import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useUiStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import DishImage from '../common/DishImage';
import CartItem from './CartItem';
import CouponInput from './CouponInput';
import TipSelector from './TipSelector';
import BillSummary from './BillSummary';
import { X, ShoppingBag, Plus, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

const recommendations = [
  { id: "rec-1", name: "Chilled Coca-Cola (330ml)", price: 40, isVeg: true, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=60" },
  { id: "rec-2", name: "Sizzling Chocolate Brownie", price: 120, isVeg: true, imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=60" },
  { id: "rec-3", name: "Crispy Golden Fries", price: 90, isVeg: true, imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&auto=format&fit=crop&q=60" }
];

export default function CartDrawer() {
  const navigate = useNavigate();
  const cartOpen = useUiStore((state) => state.cartOpen);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  
  const cartItems = useCartStore((state) => state.items);
  const activeRestaurant = useCartStore((state) => state.restaurant);
  const addItem = useCartStore((state) => state.addItem);
  const getCartTotals = useCartStore((state) => state.getCartTotals);

  const { finalTotal } = getCartTotals();

  const handleCheckoutRedirect = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const handleAddRecommendation = (rec) => {
    if (!activeRestaurant) return; // Cart shouldn't be open without active restaurant
    addItem(
      { id: rec.id, name: rec.name, price: rec.price, isVeg: rec.isVeg, imageUrl: rec.imageUrl },
      activeRestaurant
    );
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black z-50 pointer-events-auto"
          />

          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white dark:bg-dark-surface z-50 border-l border-black/[0.08] dark:border-white/[0.08] flex flex-col shadow-2xl h-full pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-brand" />
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">My Basket</h2>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-105 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                  {cartItems.length} items
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Body */}
            {cartItems.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Active Restaurant Header & Delivery ETA Badge */}
                {activeRestaurant && (
                  <div className="pb-3 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Ordering From</h3>
                      <p className="text-xs text-brand font-extrabold truncate">{activeRestaurant.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">{activeRestaurant.locality}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/10 text-right shrink-0">
                      <span className="text-[8px] uppercase font-bold tracking-wider block opacity-75 leading-none mb-0.5">Delivery ETA</span>
                      <span className="text-[11px] font-black leading-none">25-35 mins</span>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-1">
                  {cartItems.map((item, index) => (
                    <CartItem key={`${item.id}-${index}`} item={item} />
                  ))}
                </div>

                {/* Cooking Instructions / Kitchen Notes */}
                <div className="space-y-2 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Cooking Instructions</span>
                  </div>
                  <textarea
                    placeholder="Any kitchen notes? (e.g., Make it extra spicy, avoid onions, no cutlery needed)"
                    className="w-full min-h-[54px] bg-gray-55 dark:bg-dark-bg/30 border border-black/[0.05] dark:border-white/[0.05] rounded-xl p-3 text-xs text-gray-755 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand resize-none font-medium"
                    maxLength={150}
                  />
                </div>

                {/* Promo Code widget */}
                <CouponInput />

                {/* Tip delivery partner */}
                <TipSelector />

                {/* Frequently Bought Together recommendations */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Frequently Bought Together</h4>
                  <div className="space-y-2.5">
                    {recommendations.map((rec) => {
                      // Check if already in cart
                      const isAlreadyInCart = cartItems.some(i => i.id === rec.id);
                      if (isAlreadyInCart) return null;

                      return (
                        <div key={rec.id} className="flex items-center justify-between p-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-gray-50 dark:bg-dark-bg/50">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                              <DishImage 
                                src={rec.imageUrl} 
                                alt={rec.name} 
                                dishName={rec.name}
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">{rec.name}</h5>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{formatPrice(rec.price)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddRecommendation(rec)}
                            className="h-7 px-3 bg-brand/5 hover:bg-brand text-brand hover:text-white border border-brand/20 dark:border-brand/40 hover:border-brand font-black text-[10px] uppercase tracking-wider rounded-lg shadow-3xs flex items-center justify-center gap-1 transition-all cursor-pointer focus:outline-none"
                          >
                            <Plus size={10} strokeWidth={3} /> Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <BillSummary />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="relative">
                  {/* Floating Basket Graphic */}
                  <div className="w-20 h-20 bg-brand/5 dark:bg-brand/10 rounded-full flex items-center justify-center text-brand animate-pulse">
                    <ShoppingBag size={40} strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-dark-surface">
                    ?
                  </div>
                </div>
                
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-base font-black text-gray-850 dark:text-gray-100">Your cart is feeling hungry</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                    Add delicious dishes from premium restaurants nearby to satisfy your cravings.
                  </p>
                </div>

                <button
                  onClick={() => setCartOpen(false)}
                  className="h-11 px-6 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            )}

            {/* Footer Pay Button */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-dark-surface flex flex-col gap-2">
                <button
                  onClick={handleCheckoutRedirect}
                  className="h-12 w-full bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-between px-5 transition-colors cursor-pointer group focus:outline-none"
                >
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Payable Total</span>
                    <span className="text-sm font-black">{formatPrice(finalTotal)}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    Proceed to Pay
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
