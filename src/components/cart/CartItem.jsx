import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import { Plus, Minus, Trash2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getUserJsonItem, setUserItem } from '../../utils/storage';
import DishImage from '../common/DishImage';

export default function CartItem({ item }) {
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const customizationCost = (item.selectedCustomizations || []).reduce((sum, opt) => sum + (opt.price || 0), 0);
  const totalItemPrice = (item.price + customizationCost) * item.quantity;

  const handleSaveForLater = (i) => {
    // Save to favorites in localStorage as demonstration
    try {
      const favorites = getUserJsonItem('saved_for_later', []);
      if (!favorites.some(fav => fav.id === i.id)) {
        favorites.push(i);
        setUserItem('saved_for_later', favorites);
        window.dispatchEvent(new Event('wishlist-updated'));
      }
      // Remove from cart
      removeItem(i.id, i.selectedCustomizations);
      toast.success(`Saved "${i.name}" for later!`, {
        position: 'bottom-center',
        duration: 2000
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = (i) => {
    removeItem(i.id, i.selectedCustomizations);
    toast.info(`Removed "${i.name}" from your basket.`, {
      position: 'bottom-center',
      duration: 1500
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start py-4 border-b border-black/[0.04] dark:border-white/[0.04] gap-3.5"
    >
      {/* Food Image Thumbnail */}
      <div className="w-[52px] h-[52px] rounded-xl overflow-hidden border border-black/[0.04] dark:border-white/[0.04] bg-gray-50 dark:bg-neutral-850 flex-shrink-0 relative animate-fade-in">
        <DishImage 
          src={item.imageUrl || item.image} 
          alt={item.name} 
          dishName={item.name}
          category={item.category}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name and customization descriptions */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {item.isVeg ? (
            <div className="veg-dot" title="Veg"></div>
          ) : (
            <div className="nonveg-dot" title="Non-veg"></div>
          )}
          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate pr-2">
            {item.name}
          </h4>
        </div>
        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
          <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed mb-1">
            {item.selectedCustomizations.map(c => `${c.category}: ${c.label}`).join(', ')}
          </p>
        )}
        <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span>{formatPrice(item.price + customizationCost)} Each</span>
        </div>

        {/* Save for later & Delete Actions */}
        <div className="flex items-center gap-2.5 mt-2">
          <button 
            onClick={() => handleSaveForLater(item)}
            className="text-[9px] font-bold uppercase tracking-wider text-gray-400 hover:text-brand transition-colors flex items-center gap-0.5 cursor-pointer focus:outline-none"
          >
            <Heart size={9} strokeWidth={2.5} /> Save for Later
          </button>
          <span className="text-[8px] text-black/[0.1] dark:text-white/[0.1] select-none">|</span>
          <button 
            onClick={() => handleRemove(item)}
            className="text-[9px] font-bold uppercase tracking-wider text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-0.5 cursor-pointer focus:outline-none"
          >
            <Trash2 size={9} strokeWidth={2.5} /> Remove
          </button>
        </div>
      </div>

      {/* Quantity & Price Column */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="flex items-center justify-between bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 text-brand h-6.5 w-[72px] rounded-lg font-bold text-xs overflow-hidden shadow-2xs">
          <button 
            onClick={() => updateQty(item.id, item.quantity - 1, item.selectedCustomizations)}
            className="hover:bg-brand/5 w-5.5 h-full flex items-center justify-center rounded-l-lg transition-colors cursor-pointer select-none focus:outline-none"
          >
            <Minus size={10} strokeWidth={3} />
          </button>
          <span key={item.quantity} className="text-[11px] text-center select-none text-gray-800 dark:text-gray-200 font-bold">
            {item.quantity}
          </span>
          <button 
            onClick={() => updateQty(item.id, item.quantity + 1, item.selectedCustomizations)}
            className="hover:bg-brand/5 w-5.5 h-full flex items-center justify-center rounded-r-lg transition-colors cursor-pointer select-none focus:outline-none"
          >
            <Plus size={10} strokeWidth={3} />
          </button>
        </div>
        <div className="text-xs font-black text-gray-850 dark:text-gray-100 leading-none">
          {formatPrice(totalItemPrice)}
        </div>
      </div>
    </motion.div>
  );
}
