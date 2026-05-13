import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useMembershipStore from '../store/membershipStore';
import SecurePaymentProcessing from '../components/payment/SecurePaymentProcessing';

// Payment validation helpers
const validateCard = (cardData) => {
  const errors = {};

  if (!cardData.number) {
    errors.number = 'Card number is required';
  } else if (!/^\d{12}$/.test(cardData.number.replace(/\s/g, ''))) {
    errors.number = 'Card number must be 12 digits';
  }

  if (!cardData.expiry) {
    errors.expiry = 'Expiry date is required';
  } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
    errors.expiry = 'Format: MM/YY';
  }

  if (!cardData.cvv) {
    errors.cvv = 'CVV is required';
  } else if (!/^\d{3}$/.test(cardData.cvv)) {
    errors.cvv = 'CVV must be 3 digits';
  }

  if (!cardData.holder) {
    errors.holder = 'Cardholder name is required';
  }

  return errors;
};

const validateUPI = (upiId) => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
  return upiRegex.test(upiId);
};

const friendlyCycle = (key) =>
  ({ monthly: 'Monthly', halfYearly: 'Half-yearly', yearly: 'Yearly' }[key] || key);

export default function MembershipCheckout() {
  const navigate = useNavigate();
  const {
    selectedPlanType,
    selectedCycle,
    getPlanDetails,
    activateMembership,
    isLoadingMembership,
    membershipError,
  } = useMembershipStore();

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // prevent invalid membership route state — toast once when redirecting
  const redirectRef = useRef(false);

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holder: '',
  });
  const [cardErrors, setCardErrors] = useState({});

  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState(null);

  useEffect(() => {
    if (!selectedPlanType || !selectedCycle) {
      if (!redirectRef.current) {
        redirectRef.current = true;
        toast.message('Please select a membership plan.', { duration: 3200 });
        navigate('/membership', { replace: true });
      }
    }
  }, [selectedPlanType, selectedCycle, navigate]);

  // prevent invalid membership route state — avoid flashing checkout when selection missing
  if (!selectedPlanType || !selectedCycle) {
    return null;
  }

  const planDetails = getPlanDetails();
  if (!planDetails?.plan || !planDetails?.cycle) {
    if (!redirectRef.current) {
      redirectRef.current = true;
      toast.message('Please select a membership plan.', { duration: 3200 });
      navigate('/membership', { replace: true });
    }
    return null;
  }

  const totalAmount = planDetails.cycle.price;

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardChange = (field, value) => {
    let formattedValue = value;
    if (field === 'number') {
      const digits = value.replace(/\D/g, '').slice(0, 12);
      formattedValue = formatCardNumber(digits);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    if (cardErrors[field]) {
      setCardErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleUpiChange = (value) => {
    setUpiId(value);
    if (upiError) {
      setUpiError(null);
    }
  };

  const handlePayment = async () => {
    setPaymentError(null);

    if (paymentMethod === 'card') {
      const errors = validateCard(cardData);
      if (Object.keys(errors).length > 0) {
        setCardErrors(errors);
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!validateUPI(upiId)) {
        setUpiError('Please enter a valid UPI ID (e.g., user@bank)');
        return;
      }
    }

    setProcessing(true);

    try {
      // keep existing app functionality intact — activation simulates payment + backend (includes delay)
      const membership = await activateMembership({
        type: selectedPlanType,
        cycle: selectedCycle,
        price: totalAmount,
        paymentMethod,
      });

      navigate(`/membership-success/${membership.id}`);
    } catch (error) {
      setProcessing(false);
      setPaymentError(error.message || 'Payment failed. Please try again.');
    }
  };

  const panel =
    'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-dark-surface shadow-sm';
  const methodBase =
    'p-4 rounded-xl border-2 cursor-pointer transition bg-gray-50/80 dark:bg-zinc-900/40';

  return (
    <div className="min-h-[70vh] text-gray-800 dark:text-gray-200 transition-colors duration-300 pb-16">
      {processing && (
        <SecurePaymentProcessing
          type="membership"
          paymentMethod={paymentMethod}
          onComplete={() => {}}
          isProcessing={processing}
        />
      )}

      <div className="max-w-6xl mx-auto px-0 sm:px-2 py-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Membership checkout</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Review your plan, then pay securely to activate Crave PRO.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 ${panel}`}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Plan summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 dark:text-gray-400">Plan</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-right">
                    {planDetails.plan.name}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 dark:text-gray-400">Duration</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {planDetails.cycle.duration}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 dark:text-gray-400">Renewal</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {friendlyCycle(planDetails.cycleName)}
                  </span>
                </div>
                <div className="h-px bg-black/[0.06] dark:bg-white/[0.08] my-2" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total due</span>
                  <span className="text-brand">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/25">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                You save {planDetails.cycle.savingsPercent}% vs list price
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                List price was ₹{planDetails.cycle.originalPrice.toLocaleString()} for this period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment method</h3>
              <div className="space-y-3">
                <div
                  className={`${methodBase} ${
                    paymentMethod === 'upi'
                      ? 'border-brand bg-brand/5'
                      : 'border-black/[0.06] dark:border-white/[0.08]'
                  }`}
                  onClick={() => {
                    setPaymentMethod('upi');
                    setCardErrors({});
                    setPaymentError(null);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setPaymentMethod('upi')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">UPI</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Google Pay, PhonePe, Paytm</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'upi' ? 'border-brand bg-brand' : 'border-gray-400'
                      }`}
                    >
                      {paymentMethod === 'upi' && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  {paymentMethod === 'upi' && (
                    <input
                      type="text"
                      placeholder="user@bank"
                      value={upiId}
                      onChange={(e) => handleUpiChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-black/[0.08] dark:border-white/[0.1] text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  )}
                  {upiError && <p className="text-red-500 text-xs mt-2">{upiError}</p>}
                </div>

                <div
                  className={`${methodBase} ${
                    paymentMethod === 'card'
                      ? 'border-brand bg-brand/5'
                      : 'border-black/[0.06] dark:border-white/[0.08]'
                  }`}
                  onClick={() => {
                    setPaymentMethod('card');
                    setUpiError(null);
                    setPaymentError(null);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Card</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Visa, Mastercard, RuPay</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-brand bg-brand' : 'border-gray-400'
                      }`}
                    >
                      {paymentMethod === 'card' && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        placeholder="Card number"
                        value={cardData.number}
                        onChange={(e) => handleCardChange('number', e.target.value)}
                        maxLength={14}
                        className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border text-sm text-gray-900 dark:text-gray-100 ${
                          cardErrors.number ? 'border-red-500' : 'border-black/[0.08] dark:border-white/[0.1]'
                        }`}
                      />
                      {cardErrors.number && (
                        <p className="text-red-500 text-xs">{cardErrors.number}</p>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={(e) => handleCardChange('expiry', e.target.value)}
                          maxLength={5}
                          className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border text-sm ${
                            cardErrors.expiry ? 'border-red-500' : 'border-black/[0.08] dark:border-white/[0.1]'
                          }`}
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          value={cardData.cvv}
                          onChange={(e) => handleCardChange('cvv', e.target.value)}
                          maxLength={3}
                          className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border text-sm ${
                            cardErrors.cvv ? 'border-red-500' : 'border-black/[0.08] dark:border-white/[0.1]'
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Name on card"
                        value={cardData.holder}
                        onChange={(e) => handleCardChange('holder', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border text-sm ${
                          cardErrors.holder ? 'border-red-500' : 'border-black/[0.08] dark:border-white/[0.1]'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(paymentError || membershipError) && (
              <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20">
                <p className="text-red-600 dark:text-red-400 text-sm">{paymentError || membershipError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/membership')}
                className="flex-1 py-3 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePayment}
                disabled={!paymentMethod || processing || isLoadingMembership}
                className="flex-1 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMembership || processing ? 'Processing…' : 'Activate membership'}
              </button>
            </div>
          </div>

          <div>
            <div className={`p-6 sticky top-24 ${panel}`}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6">Order summary</h3>
              <div className="mb-6 pb-6 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="text-3xl mb-2">{planDetails.plan.icon}</div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{planDetails.plan.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {planDetails.cycle.duration} · {friendlyCycle(planDetails.cycleName)}
                </p>
              </div>
              <div className="space-y-2 mb-6 pb-6 border-b border-black/[0.06] dark:border-white/[0.08] text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">List price</span>
                  <span className="text-gray-500 line-through">
                    ₹{planDetails.cycle.originalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Plan savings</span>
                  <span>
                    −₹
                    {(planDetails.cycle.originalPrice - planDetails.cycle.price).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-500 dark:text-gray-400">Total</span>
                  <span className="text-2xl font-bold text-brand">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Included benefits
                </p>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  {planDetails.plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 shrink-0">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
