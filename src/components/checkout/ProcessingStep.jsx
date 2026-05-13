import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Loader2, Sparkles, ShieldCheck, Receipt, ShoppingBag, 
  ArrowRight, Home, Star, MapPin, Copy, X, Lock, Gift, Clock, CreditCard
} from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'sonner';
import { menuItemImages } from '../../data/restaurants';

// use shared brand assets across payment flow
import logo from '../../assets/logo.png';

export default function ProcessingStep({ orderDetails, orderTotal, onOrderComplete }) {
  const navigate = useNavigate();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // show secure order processing flow
  const loadingSteps = [
    { id: 1, label: "Verifying payment session", desc: "Verifying transaction with secure SSL connection" },
    { id: 2, label: "Confirming kitchen request", desc: "Transmitting recipe blueprint and cooking notes" },
    { id: 3, label: "Assigning delivery partner", desc: "Locating nearest campus rider captain" },
    { id: 4, label: "Securing live tracking channel", desc: "Configuring live GPS telemetry link" },
    { id: 5, label: "Finalizing order packet", desc: "Generating secure order delivery hash" }
  ];

  useEffect(() => {
    if (currentStepIdx < loadingSteps.length) {
      // realistic sequential timing
      const durations = [1000, 1200, 1100, 1000, 1200];
      const timer = setTimeout(() => {
        setCurrentStepIdx(prev => prev + 1);
      }, durations[currentStepIdx] || 1000);
      return () => clearTimeout(timer);
    } else {
      setIsDone(true);
    }
  }, [currentStepIdx, loadingSteps.length]);

  // No auto-redirect — user stays on Order Confirmed screen
  // and must click "Track Live Order" to go to tracking page

  const handleTrackClick = () => {
    // force redirect to tracking after order creation
    navigate(`/tracking/${orderDetails?.orderId}`, { replace: true });
    // THEN clear cart safely after navigation
    if (onOrderComplete) {
      setTimeout(() => onOrderComplete(), 200);
    }
  };

  const handleContinueOrdering = () => {
    navigate('/');
  };

  const copyOrderId = () => {
    if (orderDetails?.orderId) {
      navigator.clipboard.writeText(orderDetails.orderId);
      toast.success("Order ID copied to clipboard!", {
        position: 'bottom-center',
        duration: 1200
      });
    }
  };

  const getItemImage = (itemName) => {
    const cleanName = itemName?.replace(" Extra", "");
    return menuItemImages[cleanName] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80";
  };

  // Calculations for bill receipt
  const subtotal = orderDetails?.items?.reduce((acc, item) => {
    const custCost = (item.selectedCustomizations || []).reduce((sum, c) => sum + (c.price || 0), 0);
    return acc + (item.price + custCost) * item.quantity;
  }, 0) || (orderTotal > 67 ? orderTotal - 67 : orderTotal);

  const discount = orderDetails?.discount || 0;
  const deliveryFee = orderDetails?.deliveryFee || 0; // Default zero or computed
  const gst = Math.round(subtotal * 0.05);
  const platformFee = 2;
  const packagingCharge = 15;

  return (
    <div className="relative overflow-visible w-full flex items-center justify-center p-1 font-inter">
      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div
            key="processing-container"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-md p-6 bg-zinc-950 border border-zinc-900 rounded-[28px] space-y-6 shadow-2xl relative overflow-hidden text-center"
          >
            {/* Ambient Brand Glow */}
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-brand/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Branded Header */}
            <div className="flex flex-col items-center space-y-2 relative z-10">
              <img src={logo} alt="CRAVE Logo" className="h-[32px] w-auto object-contain" />
              <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-[0.3em]">Gourmet Delivered Instantly</span>
            </div>

            {/* Compact Progress Ring */}
            <div className="relative flex items-center justify-center w-24 h-24 mx-auto my-4">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-zinc-900" strokeWidth="3.5" fill="transparent" />
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
                <div className="w-12 h-12 rounded-xl bg-zinc-900 p-0.5 shadow-md border border-zinc-800 flex items-center justify-center overflow-hidden animate-pulse">
                  <img src="/favicon.jpg" alt="Favicon" className="w-full h-full rounded-lg object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-1.5 bg-brand text-white text-[9px] font-black px-2 py-0.5 rounded-full font-mono tracking-wider shadow-md">
                {Math.round((currentStepIdx / loadingSteps.length) * 100)}%
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-sm font-black text-zinc-100 flex items-center justify-center gap-1.5">
                <ShieldCheck className="text-brand w-4.5 h-4.5 animate-pulse" /> Secure Checkout Loading
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">Ensuring end-to-end multi-node encryption</p>
            </div>

            {/* Compact Steps List */}
            <div className="space-y-2.5 relative z-10 text-left pt-2">
              {loadingSteps.map((s, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isActive = idx === currentStepIdx;
                return (
                  <div 
                    key={s.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                      isActive 
                        ? 'bg-brand/5 border-brand/30 scale-[1.01]' 
                        : isCompleted
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-transparent opacity-20'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      ) : isActive ? (
                        <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-brand/20">
                          <Loader2 size={10} className="animate-spin" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-zinc-800 text-zinc-500 flex items-center justify-center text-[9px] font-bold font-mono">
                          {s.id}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className={`text-[11px] font-black tracking-tight ${
                        isActive ? 'text-brand' : isCompleted ? 'text-emerald-400' : 'text-zinc-500'
                      }`}>
                        {s.label}
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5 font-medium">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Branded Security Footnote */}
            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[8px] text-zinc-500 uppercase tracking-widest font-black">
              <span className="flex items-center gap-1.5">
                <Lock size={9} className="text-emerald-500 animate-pulse" /> Secure SSL 256-Bit
              </span>
              <span>CRAVE SAFE SHIELD</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-[390px] mx-auto bg-zinc-950 border border-zinc-900 rounded-[22px] p-3.5 sm:p-4 space-y-3 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin pr-1.5 flex flex-col"
          >
            {/* Soft Ambient Brand Gradients */}
            <div className="absolute -right-32 -top-32 w-64 h-64 bg-brand/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute -left-32 -bottom-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />

            {/* SECTION 1: SUCCESS HERO */}
            <div className="flex flex-col items-center text-center space-y-1.5 pt-0.5 relative">
              <div className="relative flex items-center justify-center">
                {/* Outer pulsing ring - simplified & smaller */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.15, 0.1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute w-11 h-11 bg-emerald-500/10 rounded-full"
                />
                
                {/* Core Check Circle - smaller w-7.5 h-7.5 */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  className="relative w-7.5 h-7.5 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-md shadow-emerald-500/10"
                >
                  <motion.svg 
                    width="13" 
                    height="13" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <motion.path 
                      d="M20 6L9 17l-5-5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.2, duration: 0.5, ease: "easeInOut" }}
                    />
                  </motion.svg>
                </motion.div>
              </div>
              
              <div className="space-y-0.5 z-10">
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-base font-black text-zinc-50 tracking-tight"
                >
                  Order Confirmed
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-[10px] text-zinc-400 font-medium"
                >
                  Your meal is now being freshly prepared.
                </motion.p>
              </div>
            </div>

            {/* SECTION 2: DELIVERY ETA PROGRESS */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-2.5 space-y-2">
              {/* Header row with ETA and Payment Info */}
              <div className="flex items-center justify-between text-[9px] font-bold">
                <div className="flex items-center gap-1 text-zinc-400">
                  <Clock size={10} className="text-brand" />
                  <span>ETA: <span className="text-zinc-100 font-extrabold">{orderDetails?.ETA || 30} mins</span></span>
                </div>
                <div className="text-zinc-400 flex items-center gap-1">
                  <CreditCard size={10} className="text-zinc-500" />
                  <span>Paid via {orderDetails?.paymentMethod || "UPI"}</span>
                </div>
              </div>

              {/* Linear Progress Timeline */}
              <div className="relative pt-0.5 pb-0.5">
                {/* Track base */}
                <div className="absolute top-[11px] left-[6%] right-[6%] h-[1.5px] bg-zinc-900 rounded-full" />
                {/* Active progress */}
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "38%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute top-[11px] left-[6%] h-[1.5px] bg-gradient-to-r from-emerald-500 to-brand rounded-full"
                />

                {/* Timeline Steps */}
                <div className="grid grid-cols-4 relative z-10">
                  {[
                    { label: "Confirmed", icon: "✓", active: true, done: true },
                    { label: "Preparing", icon: "🍳", active: true, done: false, pulse: true },
                    { label: "Transit", icon: "🛵", active: false, done: false },
                    { label: "Delivered", icon: "🏠", active: false, done: false }
                  ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center space-y-1">
                      <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[8px] border transition-all ${
                        step.done 
                          ? 'bg-emerald-500 border-emerald-500 text-black font-extrabold'
                          : step.pulse
                            ? 'bg-brand/15 border-brand text-brand animate-pulse'
                            : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                      }`}>
                        <span className={step.pulse ? 'scale-105' : ''}>{step.icon}</span>
                      </div>
                      <span className={`text-[7.5px] font-bold uppercase tracking-wider ${
                        step.active ? 'text-zinc-300' : 'text-zinc-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: ORDER SUMMARY CARD */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden divide-y divide-zinc-900/50">
              {/* Summary Card Header - compacted */}
              <div className="p-2.5 flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[7.5px] text-zinc-550 font-extrabold uppercase tracking-wider block">Kitchen Partner</span>
                  <h4 className="text-[11px] font-bold text-zinc-200 truncate">
                    {orderDetails?.restaurantName || "CRAVE Culinary Studio"}
                  </h4>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[7.5px] text-zinc-550 font-extrabold uppercase tracking-wider block">Order Code</span>
                  <button 
                    onClick={copyOrderId}
                    className="text-[8.5px] font-mono font-bold text-brand hover:text-brand-hover flex items-center gap-1 ml-auto focus:outline-none"
                    title="Copy Order ID"
                  >
                    {orderDetails?.orderId || "CRV-ORDER"} <Copy size={7.5} className="text-zinc-500" />
                  </button>
                </div>
              </div>

              {/* Ordered Items List - highly compacted */}
              <div className="p-2.5 space-y-1.5 max-h-[72px] overflow-y-auto divide-y divide-zinc-950/20">
                {orderDetails?.items?.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex justify-between items-center gap-2 pt-1.5 first:pt-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-900 flex-shrink-0">
                        <img 
                          src={getItemImage(item.name)} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.2 h-1.2 rounded-full shrink-0 ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <p className="text-[11px] font-bold text-zinc-200 truncate">{item.name}</p>
                        </div>
                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                          <p className="text-[8.5px] text-zinc-500 font-semibold truncate mt-0.5">
                            {item.selectedCustomizations.map(c => c.name || c.label).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[8.5px] font-bold bg-zinc-950 border border-zinc-900 text-zinc-400 px-1.2 py-0.2 rounded-md">
                        × {item.quantity}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-zinc-300">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown inside Card - compacted */}
              <div className="p-2.5 bg-zinc-950/20 text-[10px] space-y-1.5 font-semibold text-zinc-450">
                <div className="flex justify-between items-center">
                  <span className="text-[7.5px] font-bold uppercase tracking-wider text-zinc-550">Items Subtotal</span>
                  <span className="font-mono text-zinc-350">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="text-[7.5px] font-bold uppercase tracking-wider">Applied Coupon</span>
                    <span className="font-mono">- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-zinc-550">
                  <span className="text-[7.5px] font-bold uppercase tracking-wider">Fees & Taxes</span>
                  <span className="font-mono text-zinc-450">{formatPrice(gst + platformFee + packagingCharge)}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-zinc-900 font-black text-zinc-100">
                  <span className="text-[8px] font-bold uppercase tracking-wider">Amount Paid</span>
                  <span className="font-mono text-brand text-xs">{formatPrice(orderTotal)}</span>
                </div>
              </div>
            </div>

            {/* SECTION 3.5: DELIVERY ADDRESS (Premium Compact Row) */}
            {orderDetails?.deliveryAddress && (
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-2.5 flex items-start gap-2.5 text-left">
                <MapPin size={14} className="text-brand shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[7.5px] text-zinc-550 font-bold uppercase tracking-wider block">Delivery Address</span>
                  <p className="text-[11px] font-bold text-zinc-200 truncate">
                    {orderDetails.deliveryAddress.name} ({orderDetails.deliveryAddress.type || "Home"})
                  </p>
                  <p className="text-[9.5px] text-zinc-400 font-medium truncate mt-0.5">
                    {orderDetails.deliveryAddress.flat}, {orderDetails.deliveryAddress.landmark}, {orderDetails.deliveryAddress.area}
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 4: ASSIGNED RIDER CARD (Premium Compact Row) */}
            {orderDetails?.riderInfo && (
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-2 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Rider Avatar with Soft Pulse Indicator */}
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <span className="text-[11px] font-bold text-brand uppercase">{orderDetails.riderInfo.name?.[0] || 'R'}</span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-zinc-950 animate-pulse" />
                  </div>
                  
                  <div className="min-w-0 text-left">
                    <span className="text-[7.5px] text-zinc-550 font-bold uppercase tracking-wider block">Your Delivery Captain</span>
                    <span className="text-[11px] font-bold text-zinc-200 block truncate leading-tight">
                      {orderDetails.riderInfo.name}
                    </span>
                    <span className="text-[7.5px] text-zinc-400 font-medium block leading-none">
                      ⚡ EV Captain • ETA 18 mins
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center gap-0.5 text-[8.5px] font-bold text-amber-400 bg-amber-400/5 border border-amber-400/10 px-1.2 py-0.2 rounded-md">
                    <Star size={8} className="fill-amber-400 text-amber-400 animate-pulse" />
                    <span>{orderDetails.riderInfo.rating || '4.9'}</span>
                  </div>
                  <span className="text-[7.5px] font-bold text-emerald-400 bg-emerald-500/10 px-1.2 py-0.2 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </div>
              </div>
            )}

            {/* SECTION 5: PRIMARY CTA & SECONDARY ACTIONS */}
            <div className="space-y-2.5 pt-0.5 relative z-10">
              <button
                onClick={handleTrackClick}
                className="h-9 w-full bg-brand hover:bg-brand/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand/5 cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-[0.99] outline-none border-none"
              >
                <span className="w-1.2 h-1.2 rounded-full bg-white animate-ping shrink-0" />
                Track Live Order
                <ArrowRight size={11} strokeWidth={3} />
              </button>

              <div className="flex items-center justify-center gap-3.5 text-[8.5px] font-bold uppercase tracking-widest text-zinc-500 pt-0.5">
                <button
                  onClick={() => setShowReceipt(true)}
                  className="hover:text-brand transition-colors cursor-pointer outline-none bg-transparent flex items-center gap-1 focus:outline-none border-none"
                >
                  <Receipt size={10} /> View Digital Invoice
                </button>
                <span className="text-zinc-800">|</span>
                <button
                  onClick={handleContinueOrdering}
                  className="hover:text-brand transition-colors cursor-pointer outline-none bg-transparent flex items-center gap-1 focus:outline-none border-none"
                >
                  <Home size={10} /> Back to Hub
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipts Drawer Modal */}
      <AnimatePresence>
        {showReceipt && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-900 text-zinc-100 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-6 relative flex flex-col max-h-[85vh]"
            >
              <button 
                onClick={() => setShowReceipt(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-zinc-900 text-zinc-500 transition-colors"
              >
                <X size={15} />
              </button>

              <div className="flex flex-col items-center text-center pb-4 border-b border-dashed border-zinc-800 mt-1">
                <img src={logo} alt="CRAVE Logo" className="h-[28px] w-auto object-contain mb-1.5" />
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-200">CRAVE RETAIL RECEIPT</h4>
                <p className="text-[9px] text-zinc-500 font-semibold mt-1">Order Date: {orderDetails?.date || "Today"}</p>
                <p className="text-[9px] font-mono text-brand font-bold uppercase tracking-wider mt-0.5">ID: {orderDetails?.orderId}</p>
              </div>

              {/* Items list inside modal */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 divide-y divide-zinc-900">
                {orderDetails?.items?.map((item, idx) => {
                  const itemCustomCost = (item.selectedCustomizations || []).reduce((sum, c) => sum + (c.price || 0), 0);
                  return (
                    <div key={item.id || idx} className={`flex justify-between items-start pt-3.5 text-xs ${idx === 0 ? 'pt-0' : ''}`}>
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-200">{item.name}</span>
                          <span className="text-[9px] text-brand font-black bg-brand/10 px-1.5 py-0.5 rounded">×{item.quantity}</span>
                        </div>
                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                          <div className="text-[9px] text-zinc-500 pl-1 mt-1">
                            {item.selectedCustomizations.map(c => c.label || c.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-zinc-100 font-mono flex-shrink-0">
                        {formatPrice((item.price + itemCustomCost) * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-zinc-900 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-350">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold uppercase text-[9px] tracking-wider">
                    <span>Discount</span>
                    <span className="font-mono">- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                  <span>Delivery Fee</span>
                  <span className="font-mono text-zinc-350">{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                  <span>GST (5%)</span>
                  <span className="font-mono text-zinc-350">{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                  <span>Fees & Packaging</span>
                  <span className="font-mono text-zinc-350">{formatPrice(platformFee + packagingCharge)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-dashed border-zinc-800 items-center">
                  <span className="font-black text-zinc-200 uppercase text-[10px] tracking-wider">Total Paid</span>
                  <span className="font-black text-brand text-base font-mono">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-900 text-center text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-normal">
                Thank you for choosing Crave!
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
