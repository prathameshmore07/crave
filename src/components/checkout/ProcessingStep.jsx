import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Loader2, Sparkles, ShieldCheck, Receipt, ShoppingBag, 
  ArrowRight, Home, Star, MapPin, Copy, X, Lock
} from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'sonner';
import DishImage from '../common/DishImage';

// use shared brand assets across payment flow
import logo from '../../assets/logo.png';

const loadingSteps = [
  { id: 1, label: "Securing checkout gateway", desc: "End-to-end encrypted node connection" },
  { id: 2, label: "Processing secure token", desc: "Bank response signature verification" },
  { id: 3, label: "Transmitting order to kitchen", desc: "Instructions sent to restaurant terminal" },
  { id: 4, label: "Securing delivery partner", desc: "Immediate courier pickup assigned" }
];

export default function ProcessingStep({ orderDetails, orderTotal }) {
  const navigate = useNavigate();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (currentStepIdx < loadingSteps.length) {
      const duration = currentStepIdx === 0 ? 1000 : currentStepIdx === 1 ? 1200 : currentStepIdx === 2 ? 1000 : 1200;
      const timer = setTimeout(() => {
        setCurrentStepIdx(prev => prev + 1);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsDone(true);
    }
  }, [currentStepIdx]);

  const handleTrackClick = () => {
    navigate(`/order/${orderDetails?.orderId}/track`);
  };

  const handleContinueOrdering = () => {
    navigate('/');
  };

  const copyOrderId = () => {
    if (orderDetails?.orderId) {
      navigator.clipboard.writeText(orderDetails.orderId);
      toast.success("Order ID copied!", {
        position: 'bottom-center',
        duration: 1200
      });
    }
  };

  // Calculations for bill receipt
  const subtotal = orderDetails?.items?.reduce((acc, item) => {
    const custCost = (item.selectedCustomizations || []).reduce((sum, c) => sum + (c.price || 0), 0);
    return acc + (item.price + custCost) * item.quantity;
  }, 0) || (orderTotal > 67 ? orderTotal - 67 : orderTotal);

  const discount = orderDetails?.discount || 0;
  const deliveryFee = orderDetails?.deliveryFee || 35;
  const gst = Math.round(subtotal * 0.05);
  const platformFee = 2;
  const packagingCharge = 15;

  return (
    <div className="relative overflow-visible w-full flex items-center justify-center p-1">
      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div
            key="processing-container"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-md p-5 bg-white dark:bg-dark-surface border border-black/[0.06] dark:border-white/[0.06] rounded-[24px] space-y-6 shadow-xl relative overflow-hidden text-center"
          >
            {/* Ambient Brand Glow */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-brand/8 rounded-full blur-2xl pointer-events-none" />

            {/* Branded Header */}
            <div className="flex flex-col items-center space-y-2.5 relative z-10">
              <img src={logo} alt="CRAVE Logo" className="h-[28px] w-auto object-contain" />
              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.25em]">Gourmet Delivered Instantly</span>
            </div>

            {/* Compact Progress Ring */}
            <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-gray-100 dark:stroke-neutral-850" strokeWidth="4" fill="transparent" />
                <motion.circle 
                  cx="50" cy="50" r="42" className="stroke-brand" strokeWidth="4.5" fill="transparent" 
                  strokeDasharray="263.89"
                  initial={{ strokeDashoffset: 263.89 }}
                  animate={{ strokeDashoffset: 263.89 - (263.89 * (currentStepIdx / loadingSteps.length)) }}
                  transition={{ duration: 0.6 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex items-center justify-center">
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-neutral-850 p-0.5 shadow-sm border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-center overflow-hidden">
                  <img src="/favicon.jpg" alt="Favicon" className="w-full h-full rounded-lg object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-1 bg-brand text-white text-[8px] font-black px-1.5 py-0.5 rounded-full font-mono tracking-wider shadow-xs">
                {Math.round((currentStepIdx / loadingSteps.length) * 100)}%
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-gray-850 dark:text-gray-100 flex items-center justify-center gap-1">
                <ShieldCheck className="text-brand w-4 h-4" /> Secure checkout loading
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold">Ensuring end-to-end payment encryption</p>
            </div>

            {/* Compact Steps List */}
            <div className="space-y-2 relative z-10 text-left">
              {loadingSteps.map((s, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isActive = idx === currentStepIdx;
                return (
                  <div 
                    key={s.id} 
                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-200 ${
                      isActive 
                        ? 'bg-brand/[0.02] border-brand/15 dark:bg-brand/[0.01]' 
                        : isCompleted
                        ? 'border-emerald-500/10 bg-emerald-500/[0.01]'
                        : 'border-transparent opacity-20'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <span className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                          <Check size={9} strokeWidth={3} />
                        </span>
                      ) : isActive ? (
                        <span className="w-4.5 h-4.5 rounded-full bg-brand text-white flex items-center justify-center text-[9px] font-bold">
                          <Loader2 size={9} className="animate-spin" />
                        </span>
                      ) : (
                        <span className="w-4.5 h-4.5 rounded-full border border-gray-200 dark:border-neutral-800 text-gray-400 flex items-center justify-center text-[8px] font-bold font-mono">
                          {s.id}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className={`text-[10px] font-black tracking-tight ${
                        isActive ? 'text-brand' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'
                      }`}>
                        {s.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Branded Security Footnote */}
            <div className="pt-3.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[8px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black">
              <span className="flex items-center gap-1">
                <Lock size={9} className="text-emerald-500" /> Secure SSL
              </span>
              <span>CRAVE SAFE SHIELD</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-container"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-7 sm:p-8 bg-white dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.04] rounded-[28px] space-y-6 shadow-2xl relative text-center overflow-hidden"
          >
            {/* Minimalist Top Bar */}
            <div className="flex items-center justify-between">
              <img src={logo} alt="CRAVE Logo" className="h-[22px] w-auto object-contain" />
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} strokeWidth={2.5} className="text-emerald-500" /> Secure Payment Approved
              </div>
            </div>

            {/* Pulsing Visual Checkmark */}
            <div className="pt-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 animate-pulse">
                <Check size={26} strokeWidth={3} />
              </div>
            </div>

            {/* Clean Typography Title & Subtitle */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold leading-relaxed">
                We've transmitted your recipe instructions to the kitchen.
              </p>
            </div>

            {/* Elegant Live Status Indicator (Zero Border, Pure Micro-Animation) */}
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-450 text-xs font-black py-0.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Kitchen is preparing your fresh order...</span>
            </div>

            {/* Premium Dashed Digital Receipt Slip (Extremely Clean, Zero Clutter) */}
            <div className="py-4 border-y border-dashed border-black/[0.06] dark:border-white/[0.06] space-y-3.5 text-left text-xs">
              <div className="flex justify-between items-center gap-3">
                <span className="text-gray-400 font-black uppercase tracking-wider text-[9px] shrink-0">Culinary Partner</span>
                <span className="font-black text-gray-850 dark:text-gray-100 truncate max-w-[200px]">
                  {orderDetails?.restaurantName || "CRAVE Partner Restaurant"}
                </span>
              </div>
              
              <div className="flex justify-between items-center gap-3">
                <span className="text-gray-400 font-black uppercase tracking-wider text-[9px] shrink-0">Items Summary</span>
                <span className="font-bold text-gray-650 dark:text-gray-300 truncate max-w-[200px]">
                  {orderDetails?.items?.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                </span>
              </div>

              <div className="flex justify-between items-center gap-3">
                <span className="text-gray-400 font-black uppercase tracking-wider text-[9px] shrink-0">Transaction ID</span>
                <button 
                  onClick={copyOrderId} 
                  className="font-mono font-bold text-brand hover:text-brand-hover text-[10px] tracking-wider uppercase flex items-center gap-1 cursor-pointer outline-none bg-transparent"
                  title="Click to copy order ID"
                >
                  {orderDetails?.orderId || "CRV-ORDER"} <Copy size={9} />
                </button>
              </div>

              <div className="flex justify-between items-center gap-3 pt-0.5">
                <span className="text-gray-400 font-black uppercase tracking-wider text-[9px] shrink-0">Amount Charged</span>
                <span className="font-black text-brand text-sm">{formatPrice(orderTotal)}</span>
              </div>

              {orderDetails?.riderInfo && (
                <div className="flex justify-between items-center gap-3 border-t border-dashed border-black/[0.04] dark:border-white/[0.04] pt-3.5">
                  <span className="text-gray-400 font-black uppercase tracking-wider text-[9px] shrink-0">Assigned Rider</span>
                  <span className="font-extrabold text-gray-850 dark:text-gray-100 flex items-center gap-1">
                    <span>🛵 {orderDetails.riderInfo.name}</span>
                    <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-black ml-1.5 flex items-center gap-0.5 leading-none">
                      ★ {orderDetails.riderInfo.rating}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Premium Minimal CTA Grid */}
            <div className="space-y-4 pt-1">
              <button
                onClick={handleTrackClick}
                className="h-11.5 w-full bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand/10 cursor-pointer flex items-center justify-center gap-2 focus:outline-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                Track Live Order Location
                <ArrowRight size={12} />
              </button>

              <div className="flex items-center justify-center gap-5 text-[10px] font-black uppercase tracking-widest text-gray-450 dark:text-gray-400 pt-1">
                <button
                  onClick={() => setShowReceipt(true)}
                  className="hover:text-brand transition-colors cursor-pointer outline-none flex items-center gap-1.5"
                >
                  <Receipt size={12} /> View Bill Receipt
                </button>
                <span className="text-gray-200 dark:text-neutral-800">|</span>
                <button
                  onClick={handleContinueOrdering}
                  className="hover:text-brand transition-colors cursor-pointer outline-none flex items-center gap-1.5"
                >
                  <Home size={12} /> Return to Home
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipts Drawer Modal */}
      <AnimatePresence>
        {showReceipt && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 text-gray-800 dark:text-gray-100 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-5 relative flex flex-col max-h-[85vh]"
            >
              <button 
                onClick={() => setShowReceipt(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 transition-colors"
              >
                <X size={14} />
              </button>

              <div className="flex flex-col items-center text-center pb-4 border-b border-dashed border-black/10 dark:border-white/10 mt-1">
                <img src={logo} alt="CRAVE Logo" className="h-[24px] w-auto object-contain mb-1" />
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-gray-100">CRAVE RETAIL RECEIPT</h4>
                <p className="text-[9px] text-gray-400 font-semibold mt-1">Order Date: {orderDetails?.date || "Today"}</p>
                <p className="text-[9px] font-mono text-brand font-bold uppercase tracking-wider">ID: {orderDetails?.orderId}</p>
              </div>

              {/* Items list inside modal */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                {orderDetails?.items?.map((item, idx) => {
                  const itemCustomCost = (item.selectedCustomizations || []).reduce((sum, c) => sum + (c.price || 0), 0);
                  return (
                    <div key={item.id || idx} className={`flex justify-between items-start pt-2.5 text-[11px] ${idx === 0 ? 'pt-0' : ''}`}>
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-800 dark:text-gray-200">{item.name}</span>
                          <span className="text-[9px] text-brand font-black">×{item.quantity}</span>
                        </div>
                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                          <div className="text-[8px] text-gray-400 dark:text-gray-500 pl-1 mt-0.5">
                            {item.selectedCustomizations.map(c => c.label).join(', ')}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-gray-950 dark:text-white font-mono">
                        {formatPrice((item.price + itemCustomCost) * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2 text-[11px]">
                <div className="flex justify-between text-gray-400 font-bold uppercase text-[8px] tracking-wider">
                  <span>Subtotal</span>
                  <span className="font-mono text-[10px] text-gray-850 dark:text-gray-200">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold uppercase text-[8px] tracking-wider">
                    <span>Discount</span>
                    <span className="font-mono text-[10px]">- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400 font-bold uppercase text-[8px] tracking-wider">
                  <span>Delivery Fee</span>
                  <span className="font-mono text-[10px] text-gray-850 dark:text-gray-200">{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-bold uppercase text-[8px] tracking-wider">
                  <span>GST (5%)</span>
                  <span className="font-mono text-[10px] text-gray-850 dark:text-gray-200">{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-bold uppercase text-[8px] tracking-wider">
                  <span>Fees & Packaging</span>
                  <span className="font-mono text-[10px] text-gray-850 dark:text-gray-200">{formatPrice(platformFee + packagingCharge)}</span>
                </div>
                <div className="flex justify-between pt-2.5 border-t border-dashed border-black/10 dark:border-white/10 items-center">
                  <span className="font-black text-gray-900 dark:text-gray-100 uppercase text-[10px] tracking-wider">Total Paid</span>
                  <span className="font-black text-brand text-sm font-mono">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-center text-[8px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-normal">
                Thank you for choosing Crave!
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
