import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { offers } from '../../data/offers';
import { Tag, Check, X, Sparkles, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../../utils/formatPrice';
import { motion, AnimatePresence } from 'framer-motion';

export default function CouponInput() {
  const [code, setCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const getCartTotals = useCartStore((state) => state.getCartTotals);

  const { subtotal, discount } = getCartTotals();

  // Animated success state when coupon is applied
  useEffect(() => {
    if (appliedCoupon && discount > 0) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [appliedCoupon, discount]);

  // Intelligent Real-time Auto-Apply Coupon System
  useEffect(() => {
    if (!appliedCoupon && subtotal > 0) {
      const eligibleOffers = offers.filter(o => subtotal >= o.minOrder);
      if (eligibleOffers.length > 0) {
        let bestOffer = null;
        let maxSavings = 0;

        eligibleOffers.forEach(o => {
          let savings = 0;
          if (o.type === 'percentage') {
            savings = Math.min((subtotal * o.maxDiscount) / 100, o.maxDiscount || Infinity);
          } else if (o.type === 'flat') {
            savings = o.maxDiscount;
          }

          if (savings > maxSavings) {
            maxSavings = savings;
            bestOffer = o;
          }
        });

        if (bestOffer) {
          applyCoupon(bestOffer);
          toast.success(`🎉 Auto-applied the best offer: ${bestOffer.code}! Saved ${formatPrice(maxSavings)}`, {
            position: 'bottom-center',
            duration: 3000
          });
        }
      }
    }
  }, [subtotal, appliedCoupon, applyCoupon]);

  const handleApply = (e) => {
    e.preventDefault();
    if (!code) return;

    const coupon = offers.find(o => o.code.toUpperCase() === code.toUpperCase().trim());

    if (!coupon) {
      toast.error("Invalid coupon code!", { position: 'bottom-center' });
      return;
    }

    if (subtotal < coupon.minOrder) {
      toast.error(`Add items worth ₹${coupon.minOrder - subtotal} more to apply this coupon!`, {
        position: 'bottom-center'
      });
      return;
    }

    applyCoupon(coupon);
    toast.success(`Coupon "${coupon.code}" applied successfully!`, { position: 'bottom-center' });
    setCode("");
  };

  const handleRemove = () => {
    applyCoupon(null);
    setShowSuccess(false);
    toast.info("Coupon removed.", { position: 'bottom-center' });
  };

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Coupon Code</div>
      
      {appliedCoupon ? (
        <div className="space-y-2">
          {/* Applied coupon badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 border border-dashed border-emerald-500/30 bg-emerald-500/[0.03] rounded-xl"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <BadgeCheck size={16} strokeWidth={2.5} />
              </motion.span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{appliedCoupon.code}</span>
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[9px] uppercase font-bold tracking-widest text-emerald-650 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                  >
                    <Sparkles size={8} /> Active
                  </motion.span>
                </div>
                <span className="text-[9px] text-gray-450 block font-semibold leading-none mt-0.5">
                  Coupon Applied Successfully
                </span>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50/10 transition-colors cursor-pointer focus:outline-none"
              title="Remove Coupon"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </motion.div>

          {/* Animated savings display */}
          <AnimatePresence>
            {showSuccess && discount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <Check size={14} strokeWidth={3} className="text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300"
                    >
                      You're saving {formatPrice(discount)} on this order! 🎉
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="WELCOME50, FREEDEL..."
              className="h-10 pl-10 pr-3 w-full border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-dark-bg text-xs font-semibold rounded-xl outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all uppercase placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-5 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-xs cursor-pointer focus:outline-none"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
