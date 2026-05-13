import { useEffect, useState } from 'react';
import { formatPrice } from '../../utils/formatPrice';
import { Check, CheckCircle } from 'lucide-react';

// Premium Order Confirmation Screen
export default function OrderConfirmation({
  order,
  onConfirm,
  isVisible = true,
}) {
  const [animate, setAnimate] = useState(false);
  const [stepComplete, setStepComplete] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setAnimate(true);
      const timer = setTimeout(() => setStepComplete(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible || !order) return null;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = order.deliveryFee || 0;
  const tax = Math.round((subtotal * 0.05) * 100) / 100; // 5% tax
  const total = subtotal + deliveryFee + tax - (order.discountAmount || 0);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        {/* Success Checkmark Animation */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-6 transition-all duration-700 ${
              animate
                ? 'scale-100 opacity-100'
                : 'scale-0 opacity-0'
            }`}
          >
            <CheckCircle size={56} className="text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            Order Confirmed
          </h2>
          <p className="text-gray-400 text-sm">
            Your order has been successfully placed
          </p>
        </div>

        {/* Order Number */}
        <div className="mb-6 p-4 bg-gray-900/80 rounded-lg border border-gray-800">
          <p className="text-xs text-gray-500 mb-1">ORDER ID</p>
          <p className="text-lg font-bold text-orange-400 font-mono">
            #{order.orderId}
          </p>
        </div>

        {/* Restaurant Info */}
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
              <span className="text-lg">🏪</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">
                {order.restaurantName}
              </p>
              <p className="text-xs text-gray-400">
                {order.address || '123 Food Street'}
              </p>
            </div>
          </div>
        </div>

        {/* ETA & Delivery Info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* ETA */}
          <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-xs text-blue-400 mb-1 font-medium">ESTIMATED ETA</p>
            <p className="text-lg font-bold text-blue-300">
              {formatTime(order.estimatedTime || 30)}
            </p>
          </div>

          {/* Delivery Type */}
          <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
            <p className="text-xs text-purple-400 mb-1 font-medium">DELIVERY</p>
            <p className="text-lg font-bold text-purple-300">
              {order.deliveryType === 'scheduled' ? 'Scheduled' : 'ASAP'}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800 space-y-3 text-sm">
          <div className="font-semibold text-white pb-3 border-b border-gray-700">
            Order Summary
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-gray-300 text-xs"
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>₹{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-700 space-y-1 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>₹{formatPrice(subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>-₹{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Delivery Fee</span>
              <span>
                {deliveryFee === 0 ? (
                  <span className="text-green-400">Free</span>
                ) : (
                  `₹${formatPrice(deliveryFee)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tax</span>
              <span>₹{formatPrice(tax)}</span>
            </div>

            <div className="flex justify-between font-bold text-orange-400 text-base pt-2 border-t border-gray-700">
              <span>Total</span>
              <span>₹{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
          <p className="text-xs text-gray-500 mb-2">PAYMENT METHOD</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
              {order.paymentMethod === 'card' && '💳'}
              {order.paymentMethod === 'upi' && '₹'}
              {order.paymentMethod === 'wallet' && '👛'}
              {order.paymentMethod === 'cod' && '💵'}
            </div>
            <div>
              <p className="text-sm font-semibold capitalize">
                {order.paymentMethod === 'card'
                  ? 'Debit/Credit Card'
                  : order.paymentMethod === 'upi'
                  ? 'UPI'
                  : order.paymentMethod === 'wallet'
                  ? 'Wallet'
                  : 'Cash on Delivery'}
              </p>
            </div>
            <div className="ml-auto">
              <Check size={16} className="text-green-400" />
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-6 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
          <p className="text-xs text-gray-500 mb-2">DELIVERY TO</p>
          <p className="text-sm font-semibold text-white">
            {order.deliveryAddress ||
              '123 Main Street, Apt 4B, City, State 100001'}
          </p>
        </div>

        {/* Next Steps */}
        <div className="mb-6 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg text-xs text-blue-300">
          <p className="font-semibold mb-2">What's Next?</p>
          <ul className="space-y-1">
            <li>✓ Order confirmed by restaurant</li>
            <li>✓ Rider assigned</li>
            <li>✓ Track live on next screen</li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={onConfirm}
          disabled={!stepComplete}
          className={`w-full py-4 bg-orange-500 text-white rounded-lg font-semibold text-lg transition-all ${
            stepComplete
              ? 'hover:bg-orange-600 cursor-pointer'
              : 'opacity-70 cursor-not-allowed'
          }`}
        >
          {stepComplete ? 'Track Your Order' : 'Preparing...'}
        </button>

        {/* Support Link */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Need help?{' '}
          <button className="text-orange-400 hover:underline">
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
}
