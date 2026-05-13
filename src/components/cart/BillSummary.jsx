import React from 'react';
import { useCartStore } from '../../store/cartStore';
import useMembershipStore from '../../store/membershipStore';
import { formatPrice } from '../../utils/formatPrice';
import { FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BillSummary() {
  const getCartTotals = useCartStore((state) => state.getCartTotals);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const restaurant = useCartStore((state) => state.restaurant);
  const tip = useCartStore((state) => state.tip);
  const isMember = useMembershipStore((state) => state.isActive());
  const memberDiscountPct = useMembershipStore((state) => (state.isActive() ? state.getDiscountPercent() : 0));

  const { subtotal, discount, membershipDiscount, deliveryFee, gst, platformFee, packagingCharge, finalTotal } =
    getCartTotals();

  const freeDeliveryLabel =
    deliveryFee === 0 && restaurant && subtotal > 0
      ? appliedCoupon?.type === 'delivery' && subtotal >= (appliedCoupon.minOrder ?? 0)
        ? 'FREE · Coupon'
        : isMember
          ? 'FREE · Crave PRO'
          : 'FREE'
      : null;

  if (subtotal === 0) return null;

  return (
    <div className="p-4 bg-gray-50/50 dark:bg-dark-bg/30 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] space-y-3">
      <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2 text-xs font-black uppercase tracking-wider text-gray-400">
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-gray-400" />
          Bill Summary
        </div>
        {(discount > 0 || membershipDiscount > 0) && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md flex items-center gap-1"
          >
            <Sparkles size={10} /> Saved {formatPrice(discount + membershipDiscount)}
          </motion.span>
        )}
      </div>

      <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400 font-medium leading-none">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span>Item Total</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">{formatPrice(subtotal)}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex justify-between items-center text-emerald-600 dark:text-emerald-400"
          >
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} />
              Coupon Discount ({appliedCoupon?.code})
            </span>
            <span className="font-extrabold">-{formatPrice(discount)}</span>
          </motion.div>
        )}
        {membershipDiscount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex justify-between items-center text-amber-700 dark:text-amber-400"
          >
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} />
              Crave PRO discount ({memberDiscountPct}%)
            </span>
            <span className="font-extrabold">-{formatPrice(membershipDiscount)}</span>
          </motion.div>
        )}

        {/* Delivery Fee */}
        <div className="flex justify-between items-center">
          <span>Delivery Partner Fee</span>
          {deliveryFee === 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide text-[10px] text-right max-w-[58%]">
              {freeDeliveryLabel || 'FREE'}
            </span>
          ) : (
            <span className="text-gray-800 dark:text-gray-200 font-bold">{formatPrice(deliveryFee)}</span>
          )}
        </div>

        {/* Platform Fee */}
        <div className="flex justify-between items-center">
          <span>Platform Fee</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">
            {subtotal <= 0 ? formatPrice(0) : platformFee === 0 && isMember ? (
              <span className="text-amber-700 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wide">
                Waived · PRO
              </span>
            ) : (
              formatPrice(platformFee)
            )}
          </span>
        </div>

        {/* Packaging Charges */}
        <div className="flex justify-between items-center">
          <span>Restaurant Packaging & Handling</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">{formatPrice(packagingCharge)}</span>
        </div>

        {/* Taxes/GST */}
        <div className="flex justify-between items-center">
          <span>GST & Restaurant Charges (5%)</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">{formatPrice(gst)}</span>
        </div>

        {/* Tip */}
        {tip > 0 && (
          <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
            <span>Rider Tip Support</span>
            <span className="text-gray-800 dark:text-gray-200 font-extrabold">{formatPrice(tip)}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="flex justify-between items-center border-t border-dashed border-black/[0.08] dark:border-white/[0.08] pt-3 text-sm font-black text-gray-850 dark:text-gray-100">
        <span>Total Payable Amount</span>
        <motion.span
          key={finalTotal}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="text-base text-brand font-black"
        >
          {formatPrice(finalTotal)}
        </motion.span>
      </div>
    </div>
  );
}
