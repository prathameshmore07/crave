import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import AddressStep from '../components/checkout/AddressStep';
import PaymentStep from '../components/checkout/PaymentStep';
import ProcessingStep from '../components/checkout/ProcessingStep';
import CheckoutBillSplitter from '../components/checkout/CheckoutBillSplitter';
import { formatPrice } from '../utils/formatPrice';
import { ShoppingBag, ArrowLeft, ShieldCheck, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { riders } from '../data/riders';

export default function Checkout() {
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const activeRestaurant = useCartStore((state) => state.restaurant);
  const getCartTotals = useCartStore((state) => state.getCartTotals);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const user = useAuthStore((state) => state.user);
  const addOrder = useAuthStore((state) => state.addOrder);

  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Address, 2: Payment, 3: Processing / Done
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const { subtotal, discount, deliveryFee, gst, platformFee, packagingCharge, finalTotal } = getCartTotals();

  // If cart is empty and we are not in processing state, redirect to home
  useEffect(() => {
    if (cartItems.length === 0 && checkoutStep < 3) {
      toast.info("Your basket is empty. Please add items to checkout.");
      navigate('/');
    }
  }, [cartItems, checkoutStep, navigate]);

  // Sync selected address if list changes
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const exists = user.addresses.some(a => a.id === selectedAddressId);
      if (!exists) {
        setSelectedAddressId(user.addresses[0].id);
      }
    } else {
      setSelectedAddressId("");
    }
  }, [user?.addresses, selectedAddressId]);

  const handleAddressConfirmed = () => {
    setCheckoutStep(2);
  };


  const handlePaymentConfirmed = (paymentData) => {
    // Generate a beautiful dummy order
    const orderId = `CRV-${Math.floor(100000 + Math.random() * 900000)}`;
    const matchedAddress = user.addresses.find(a => a.id === selectedAddressId);
    
    const orderFinalTotal = finalTotal;

    const randomRider = riders[Math.floor(Math.random() * riders.length)];
    const initialEta = 30; // mins initial ETA

    const newOrder = {
      orderId,
      restaurantId: activeRestaurant.id,
      restaurantName: activeRestaurant.name,
      restaurantImageUrl: activeRestaurant.imageUrl,
      locality: activeRestaurant.locality,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedCustomizations: item.selectedCustomizations,
        isVeg: item.isVeg
      })),
      deliveryAddress: matchedAddress,
      paymentMethod: paymentData.method,
      totalAmount: orderFinalTotal,
      timestamp: Date.now(),
      orderStatus: "Order Confirmed",
      ETA: initialEta,
      riderInfo: randomRider
    };

    // Save order in authStore OrderHistory and orderStore
    addOrder(newOrder);
    useOrderStore.getState().setActiveOrder(newOrder);

    setCreatedOrder(newOrder);
    setConfirmedTotal(orderFinalTotal);
    
    // clear cart immediately after successful payment
    // prevent stale cart restoration on browser back
    clearCart();

    // Jump to processing stage
    setCheckoutStep(3);
  };

  const steps = [
    { num: 1, label: "Delivery Address", icon: MapPin },
    { num: 2, label: "Secure Payment", icon: CreditCard }
  ];

  if (checkoutStep === 3) {
    return (
      <div className="fixed inset-0 z-[1000] bg-stone-50 dark:bg-dark-bg flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
        <div className="w-full max-w-[420px] py-3 md:py-6">
          <ProcessingStep orderDetails={createdOrder} orderTotal={confirmedTotal || finalTotal} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in space-y-8">
      {/* Checkout Header Progress Bar */}
      {checkoutStep < 3 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.04] pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-850 text-gray-500 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Checkout Step {checkoutStep}</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Finalize your delivery and payment details</p>
            </div>
          </div>

          {/* Stepper display */}
          <div className="flex items-center gap-3">
            {steps.map((s, idx) => {
              const StepIcon = s.icon;
              const isActive = s.num === checkoutStep;
              const isDone = s.num < checkoutStep;
              return (
                <React.Fragment key={s.num}>
                  <div className={`flex items-center gap-2 text-xs font-bold transition-all ${
                    isActive ? 'text-brand' : isDone ? 'text-success' : 'text-gray-400'
                  }`}>
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isActive ? 'bg-brand/10 border-brand' : isDone ? 'bg-success/10 border-success' : 'border-gray-200'
                    }`}>
                      {s.num}
                    </span>
                    <span>{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && <span className="text-gray-200">/</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-2">
          {checkoutStep === 1 && (
            <AddressStep
              activeAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              onNext={handleAddressConfirmed}
            />
          )}

          {checkoutStep === 2 && (
            <PaymentStep
              activeMethodId={selectedMethodId}
              onSelectMethod={setSelectedMethodId}
              onConfirm={handlePaymentConfirmed}
            />
          )}
        </div>

        {/* Right Column: Order Basket Breakdown Summary (Visible on step 1 & 2 only) */}
        {checkoutStep < 3 && (
          <div className="space-y-4 sticky top-[80px] h-fit">
            <div className="p-5 bg-white dark:bg-dark-surface border border-black/[0.06] dark:border-white/[0.06] rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-black/[0.04] pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-brand" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">Basket Summary</h3>
                </div>
                {activeRestaurant && (
                  <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                    {activeRestaurant.name}
                  </span>
                )}
              </div>

              {/* Items Summary Details list */}
              <div className="divide-y divide-black/[0.04] max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="py-2.5 flex justify-between items-start text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <div className="min-w-0 pr-4">
                      <div className="truncate flex items-center gap-1">
                        {item.isVeg ? <div className="veg-dot flex-shrink-0"></div> : <div className="nonveg-dot flex-shrink-0"></div>}
                        {item.name}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium block pl-4">Qty: {item.quantity}</span>
                    </div>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="border-t border-black/[0.04] pt-4 space-y-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Restaurant Packaging Fee</span>
                  <span>{formatPrice(packagingCharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Partner Delivery Fee</span>
                  <span>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Restaurant Charges</span>
                  <span>{formatPrice(gst)}</span>
                </div>
              </div>

              {/* Final total */}
              <div className="border-t border-black/[0.04] pt-3 flex justify-between items-center text-sm font-black text-neutral-850 dark:text-neutral-100">
                <span>Amount to Pay</span>
                <span className="text-base text-brand font-black">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Natural Collapsible Bill Splitter */}
            <CheckoutBillSplitter />

            <div className="flex items-center gap-1.5 p-3 rounded-lg bg-gray-50 dark:bg-dark-surface/40 text-[10px] text-gray-400 font-semibold uppercase tracking-wider justify-center">
              <ShieldCheck size={14} className="text-success animate-pulse" />
              100% Secure Checkout Payments
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
