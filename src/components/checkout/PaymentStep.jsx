import React, { useState } from 'react';
import { CreditCard, Wallet, Smartphone, Landmark, DollarSign, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { useCartStore } from '../../store/cartStore';
import { toast } from 'sonner';

const paymentMethods = [
  { id: 'gpay', name: 'Google Pay', icon: Smartphone, subtitle: 'Pay instantly from bank account' },
  { id: 'phonepe', name: 'PhonePe', icon: Smartphone, subtitle: 'Fastest UPI app integration' },
  { id: 'upi', name: 'UPI (Paytm / Other)', icon: Smartphone, subtitle: 'Enter UPI ID / VPA' },
  { id: 'card', name: 'Credit or Debit Card', icon: CreditCard, subtitle: 'Visa, Mastercard, RuPay' },
  { id: 'cod', name: 'Cash on Delivery (COD)', icon: DollarSign, subtitle: 'Pay in cash / digital on delivery' }
];

export default function PaymentStep({ activeMethodId, onSelectMethod, onConfirm }) {
  const [vpa, setVpa] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const getCartTotals = useCartStore((state) => state.getCartTotals);

  const { finalTotal } = getCartTotals();

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!activeMethodId || isProcessing) return;
    
    setIsProcessing(true);
    const toastId = toast.loading("Processing order & verifying payment gateway...", { position: "top-center" });

    setTimeout(() => {
      toast.success("Payment authorized successfully! Creating your order...", { id: toastId, position: "top-center" });
      onConfirm({
        method: activeMethodId,
        details: activeMethodId === 'upi' ? { vpa } : activeMethodId === 'card' ? { cardNumber, cardHolder } : {}
      });
    }, 1500);
  };

  const isFormValid = () => {
    if (!activeMethodId) return false;
    
    // For UPI
    if (activeMethodId === 'upi') {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      return upiRegex.test(vpa);
    }
    
    // For Card
    if (activeMethodId === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length !== 16 || !/^\d+$/.test(cleanCard)) return false;
      
      // Card Expiry validation (MM/YY)
      if (cardExpiry.length !== 5) return false;
      const [month, year] = cardExpiry.split('/');
      if (!month || !year || month.length !== 2 || year.length !== 2) return false;
      const monthNum = parseInt(month, 10);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return false;
      
      // CVV validation
      if (cardCvv.length !== 3 || !/^\d+$/.test(cardCvv)) return false;
      
      // Cardholder validation
      if (!cardHolder.trim() || !/^[a-zA-Z\s]+$/.test(cardHolder)) return false;
    }
    
    // For GPay, PhonePe, COD
    return true;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Select Payment Method</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Choose your preferred way to complete the payment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Selectors list */}
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = activeMethodId === method.id;
            return (
              <button
                key={method.id}
                onClick={() => onSelectMethod(method.id)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3.5 transition-all outline-none ${
                  isSelected 
                    ? 'border-brand bg-brand/[0.01]' 
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <span className={`p-2 rounded-lg ${isSelected ? 'bg-brand/10 text-brand' : 'bg-gray-50 dark:bg-dark-bg text-gray-500'}`}>
                  <Icon size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">{method.name}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{method.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Details input context */}
        <div className="p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-gray-50 dark:bg-dark-surface/50 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-300 border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
              Payment Details
            </h4>

            {!activeMethodId && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-10 font-medium">
                Please select a payment method from the left to configure details.
              </p>
            )}

            {activeMethodId === 'gpay' && (
              <div className="space-y-2 animate-scale-up text-center py-6">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Google Pay will open automatically upon clicking "Pay". Complete authentication on your device.
                </p>
              </div>
            )}

            {activeMethodId === 'phonepe' && (
              <div className="space-y-2 animate-scale-up text-center py-6">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  PhonePe portal will load securely. Keep your primary smartphone ready to authorize.
                </p>
              </div>
            )}

            {activeMethodId === 'upi' && (
              <div className="space-y-3 animate-scale-up text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Enter UPI ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vpa}
                      onChange={(e) => setVpa(e.target.value.trim())}
                      placeholder="e.g. name@okhdfcbank"
                      className={`h-10 pl-3 pr-10 w-full border bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none transition-colors ${
                        vpa.length === 0
                          ? 'border-gray-200 dark:border-gray-750 focus:border-brand'
                          : /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(vpa)
                            ? 'border-emerald-500 focus:border-emerald-500'
                            : 'border-rose-500 focus:border-rose-500'
                      }`}
                    />
                    {vpa.length > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(vpa) ? (
                          <Check size={14} className="text-emerald-500 stroke-[3]" />
                        ) : (
                          <span className="text-[10px] font-black text-rose-500">!</span>
                        )}
                      </span>
                    )}
                  </div>
                  {vpa.length > 0 && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(vpa) && (
                    <span className="text-[9px] font-bold text-rose-500 block animate-fade-in">
                      {!vpa.includes('@') 
                        ? "UPI ID must contain '@' symbol" 
                        : "Invalid format. Use name@bank format (e.g. user@okaxis)"}
                    </span>
                  )}
                </div>
              </div>
            )}

            {activeMethodId === 'card' && (
              <div className="space-y-3 animate-scale-up text-left">
                {/* Cardholder name input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    placeholder="e.g. PRATHAMESH MORE"
                    className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                  />
                  {cardHolder.length > 0 && !/^[a-zA-Z\s]+$/.test(cardHolder) && (
                    <span className="text-[9px] font-bold text-rose-500 block">Letters and spaces only</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Card Number</label>
                  <input
                    type="text"
                    maxLength="16"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234 5678 9012 3456"
                    className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                  />
                  {cardNumber.length > 0 && cardNumber.length < 16 && (
                    <span className="text-[9px] font-bold text-rose-500 block">Must be exactly 16 digits</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d/]/g, '');
                        if (val.length === 2 && !val.includes('/') && e.nativeEvent.inputType !== 'deleteContentBackward') {
                          val += '/';
                        }
                        setCardExpiry(val);
                      }}
                      placeholder="MM/YY"
                      className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">CVV</label>
                    <input
                      type="password"
                      maxLength="3"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeMethodId === 'cod' && (
              <div className="space-y-2 animate-scale-up text-center py-6">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-success bg-success/5 border border-success/10 p-3 rounded-lg">
                  <Check size={14} strokeWidth={3} className="text-success flex-shrink-0" />
                  <span>Cash/UPI on Delivery Selected. No advanced details needed.</span>
                </div>
              </div>
            )}
          </div>

          {activeMethodId && (
            <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] space-y-3">
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                <ShieldCheck size={14} className="text-success" />
                Secured SSL 256-bit connection
              </div>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={!isFormValid() || isProcessing}
                className={`h-11 w-full flex items-center justify-between px-5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ${
                  isFormValid() && !isProcessing
                    ? 'bg-brand hover:bg-brand-hover text-white cursor-pointer' 
                    : 'bg-gray-150 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing Order...
                  </span>
                ) : (
                  <span>Pay {formatPrice(finalTotal)}</span>
                )}
                <span className="flex items-center gap-0.5">
                  {isProcessing ? "Verifying..." : "Confirm Order"}
                  <ArrowRight size={14} />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
