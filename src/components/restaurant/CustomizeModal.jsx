import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import { X, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomizeModal({ item, restaurant, isOpen, onClose }) {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    if (item && item.customizations) {
      // Set default options (e.g. first option for required customizations)
      const defaults = [];
      item.customizations.forEach((custom) => {
        if (custom.required && custom.options.length > 0) {
          defaults.push({
            category: custom.name,
            label: custom.options[0].label,
            price: custom.options[0].price
          });
        }
      });
      setSelectedOptions(defaults);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleOptionToggle = (customName, option, isRequired) => {
    setSelectedOptions((prev) => {
      if (isRequired) {
        // Radio logic: replace previous option from this category
        const filtered = prev.filter(o => o.category !== customName);
        return [...filtered, { category: customName, label: option.label, price: option.price }];
      } else {
        // Checkbox logic: toggle selection
        const exists = prev.find(o => o.category === customName && o.label === option.label);
        if (exists) {
          return prev.filter(o => !(o.category === customName && o.label === option.label));
        } else {
          return [...prev, { category: customName, label: option.label, price: option.price }];
        }
      }
    });
  };

  const calculateItemTotal = () => {
    const customizationsCost = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    return item.price + customizationsCost;
  };

  const handleAddToCart = () => {
    const restInfo = {
      id: restaurant.id,
      name: restaurant.name,
      locality: restaurant.locality,
      imageUrl: restaurant.imageUrl
    };

    const customizedItem = {
      ...item,
      selectedCustomizations: selectedOptions
    };

    addItem(customizedItem, restInfo);
    toast.success(`Added ${item.name} (Customized) to cart`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-md border border-black/[0.08] dark:border-white/[0.08] flex flex-col overflow-hidden max-h-[85vh] shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.08] flex justify-between items-start bg-gray-50 dark:bg-neutral-800/40">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              {item.isVeg ? <div className="veg-dot"></div> : <div className="nonveg-dot"></div>}
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">{item.name}</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Base Price: {formatPrice(item.price)}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {item.customizations?.map((custom) => (
            <div key={custom.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-300">
                  {custom.name}
                </h3>
                {custom.required ? (
                  <span className="text-[10px] font-bold text-brand uppercase bg-brand/10 px-1.5 py-0.5 rounded">Required</span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase bg-gray-105 dark:bg-neutral-850 px-1.5 py-0.5 rounded">Optional</span>
                )}
              </div>

              <div className="space-y-2">
                {custom.options.map((option) => {
                  const isChecked = selectedOptions.some(o => o.category === custom.name && o.label === option.label);
                  return (
                    <button
                      key={option.label}
                      onClick={() => handleOptionToggle(custom.name, option, custom.required)}
                      className={`w-full h-11 px-3 rounded-lg border text-left flex items-center justify-between text-xs font-semibold transition-all ${
                        isChecked 
                          ? 'border-brand bg-brand/[0.02] text-brand' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-brand border-brand text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg'}`}>
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </span>
                        {option.label}
                      </span>
                      {option.price > 0 && <span className="text-gray-500 dark:text-gray-400 font-medium">(+{formatPrice(option.price)})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-neutral-800/40 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Total Item Price</div>
            <div className="text-base font-extrabold text-gray-800 dark:text-gray-200">{formatPrice(calculateItemTotal())}</div>
          </div>
          <button
            onClick={handleAddToCart}
            className="h-10 px-6 bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
