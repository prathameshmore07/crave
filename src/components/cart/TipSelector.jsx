import React, { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { Heart } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

const tips = [10, 20, 30, 50];

export default function TipSelector() {
  const currentTip = useCartStore((state) => state.tip);
  const setTip = useCartStore((state) => state.setTip);
  const [customTip, setCustomTip] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleTipClick = (amount) => {
    setShowCustom(false);
    if (currentTip === amount) {
      setTip(0);
    } else {
      setTip(amount);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const parsed = Number(customTip);
    if (!isNaN(parsed) && parsed >= 0) {
      setTip(parsed);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-dark-surface rounded-xl border border-black/[0.04] dark:border-white/[0.04] space-y-3">
      <div className="flex items-center gap-2">
        <Heart size={16} className="text-brand fill-brand" />
        <div>
          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100">Tip Your Delivery Partner</h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-normal">
            100% of tips go directly to the rider. Support them during peak delivery hours.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {tips.map((amount) => {
          const isSelected = currentTip === amount && !showCustom;
          return (
            <button
              key={amount}
              onClick={() => handleTipClick(amount)}
              className={`h-8 px-3 rounded-lg border text-xs font-bold transition-all flex-shrink-0 ${
                isSelected 
                  ? 'border-brand bg-brand/10 text-brand' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-400'
              }`}
            >
              +{formatPrice(amount)}
            </button>
          );
        })}

        <button
          onClick={() => {
            setShowCustom(true);
            setTip(0);
          }}
          className={`h-8 px-3 rounded-lg border text-xs font-bold transition-all flex-shrink-0 ${
            showCustom 
              ? 'border-brand bg-brand/10 text-brand' 
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-400'
          }`}
        >
          {showCustom && currentTip > 0 ? `Custom: ${formatPrice(currentTip)}` : "Custom"}
        </button>

        {currentTip > 0 && (
          <button
            onClick={() => {
              setTip(0);
              setShowCustom(false);
              setCustomTip("");
            }}
            className="text-xs text-brand hover:underline font-bold pl-2 flex-shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {showCustom && (
        <form onSubmit={handleCustomSubmit} className="flex gap-2 animate-fade-in">
          <input
            type="number"
            min="1"
            value={customTip}
            onChange={(e) => setCustomTip(e.target.value)}
            placeholder="Enter amount (₹)"
            className="h-8 px-2.5 flex-1 text-xs border border-gray-200 dark:border-gray-750 bg-white dark:bg-dark-bg rounded-lg outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="h-8 px-3 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-hover"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
