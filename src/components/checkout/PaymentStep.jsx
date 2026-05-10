import React, { useState } from 'react';
import { CreditCard, Wallet, Smartphone, Landmark, DollarSign, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { useCartStore } from '../../store/cartStore';

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
  const getCartTotals = useCartStore((state) => state.getCartTotals);

  const { finalTotal } = getCartTotals();

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!activeMethodId) return;
    onConfirm({
      method: activeMethodId,
      details: activeMethodId === 'upi' ? { vpa } : activeMethodId === 'card' ? { cardNumber } : {}
    });
  };

  const isFormValid = () => {
    if (!activeMethodId) return false;
    if (activeMethodId === 'upi' && !vpa.includes('@')) return false;
    if (activeMethodId === 'card' && (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3)) return false;
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
              <div className="space-y-3 animate-scale-up">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Enter UPI ID</label>
                  <input
                    type="text"
                    value={vpa}
                    onChange={(e) => setVpa(e.target.value)}
                    placeholder="e.g. name@okhdfcbank"
                    className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                  />
                  {!vpa.includes('@') && vpa.length > 0 && (
                    <span className="text-[9px] font-bold text-brand block">UPI ID must contain '@' symbol</span>
                  )}
                </div>
              </div>
            )}

            {activeMethodId === 'card' && (
              <div className="space-y-3 animate-scale-up">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Card Number</label>
                  <input
                    type="text"
                    maxLength="16"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234 5678 9012 3456"
                    className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="h-10 px-3 w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg text-xs font-semibold rounded-lg outline-none focus:border-brand"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">CVV</label>
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
                disabled={!isFormValid()}
                className={`h-11 w-full flex items-center justify-between px-5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ${
                  isFormValid() 
                    ? 'bg-brand hover:bg-brand-hover text-white cursor-pointer' 
                    : 'bg-gray-150 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Pay {formatPrice(finalTotal)}</span>
                <span className="flex items-center gap-0.5">
                  Confirm Order
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
