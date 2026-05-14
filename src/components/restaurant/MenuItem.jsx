import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import { Plus, Minus, Star, Heart, Sparkles, Award, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import DishImage from '../common/DishImage';
import { getNutritionData } from '../../utils/nutrition';

export default function MenuItem({ item, restaurant, onOpenCustomize }) {
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const nutrition = getNutritionData(item);

  // Find quantity of this item in the cart
  const cartItemInstances = cartItems.filter(i => i.id === item.id);
  const quantityInCart = cartItemInstances.reduce((sum, i) => sum + i.quantity, 0);

  const handleAddClick = () => {
    if (item.customizations && item.customizations.length > 0) {
      onOpenCustomize(item);
    } else {
      const restInfo = {
        id: restaurant.id,
        name: restaurant.name,
        locality: restaurant.locality,
        imageUrl: restaurant.imageUrl,
        city: restaurant.city
      };
      addItem(item, restInfo);
      toast.success(`${item.name} added to cart!`, {
        position: 'bottom-center',
        duration: 1500
      });
    }
  };

  const handleDecreaseClick = () => {
    if (cartItemInstances.length > 0) {
      const targetInstance = cartItemInstances[cartItemInstances.length - 1];
      removeItem(targetInstance.id, targetInstance.selectedCustomizations);
      toast.info(`Removed 1 ${item.name} from cart.`, {
        position: 'bottom-center',
        duration: 1500
      });
    }
  };

  const handleIncreaseClick = () => {
    if (item.customizations && item.customizations.length > 0) {
      onOpenCustomize(item);
    } else {
      const restInfo = {
        id: restaurant.id,
        name: restaurant.name,
        locality: restaurant.locality,
        imageUrl: restaurant.imageUrl,
        city: restaurant.city
      };
      addItem(item, restInfo);
      toast.success(`${item.name} added to cart!`, {
        position: 'bottom-center',
        duration: 1500
      });
    }
  };

  return (
    <motion.div 
      id={`menu-item-${item.id}`} 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full flex justify-between py-6 border-b border-black/[0.05] dark:border-white/[0.05] gap-4 md:gap-8 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] px-3 md:px-4 -mx-3 md:-mx-4 rounded-2xl transition-all duration-300"
    >
      {/* Left Column: Details */}
      <div className="flex-1 min-w-0 pr-2 md:pr-4 space-y-2.5 flex flex-col justify-start">
        {/* Indicators and Badges */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          {item.isVeg ? (
            <div className="veg-dot flex-shrink-0 shadow-3xs" title="Veg"></div>
          ) : (
            <div className="nonveg-dot flex-shrink-0 shadow-3xs" title="Non-veg"></div>
          )}

          {/* professional icon replacement */}
          {/* remove unnecessary emoji clutter */}
          {item.isBestseller && (
            <span className="bg-amber-50/80 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1 border border-amber-200/20 shadow-3xs">
              <Star size={10} className="fill-amber-500 text-amber-500" /> Bestseller
            </span>
          )}

          {item.isMostOrdered && (
            <span className="bg-orange-50/80 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1 border border-orange-200/20 shadow-3xs">
              <Sparkles size={10} className="text-orange-500" /> Student Choice
            </span>
          )}

          {item.isChefSpecial && (
            <span className="bg-brand/5 text-brand dark:bg-brand/10 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1 border border-brand/10">
              <Award size={10} /> Chef Special
            </span>
          )}

          {item.rating && (
            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Star size={10} className="fill-amber-500 text-amber-500" /> {item.rating.toFixed(1)}
            </span>
          )}

          {item.spiceLevel && (
            <span className="flex items-center gap-0.5 flex-shrink-0" title={`Spice Level: ${item.spiceLevel}`}>
              {Array.from({ length: item.spiceLevel }).map((_, i) => (
                <Flame key={i} size={11} className="fill-brand text-brand animate-pulse" />
              ))}
            </span>
          )}
        </div>

        {/* Item Name */}
        <div>
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight leading-snug break-words">
            {item.name}
          </h3>
          
          {/* Price and Prep Time */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && (
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through font-medium">
                {formatPrice(item.originalPrice)}
              </span>
            )}
            {item.prepTime && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
                ⏱ {item.prepTime}
              </span>
            )}
          </div>
        </div>

        {/* Nutritional Info Inline Capsules */}
        {nutrition && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-rose-200/10 shadow-3xs">
              <Flame size={10} className="fill-rose-500 text-rose-500" /> {nutrition.calories} kcal
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-200/10 shadow-3xs">
              💪 {nutrition.protein} Protein
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-200/10 shadow-3xs">
              🍞 {nutrition.carbs} Carbs
            </span>
          </div>
        )}

        {/* Item Description */}
        {item.description && (
          <p className="text-xs md:text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed font-normal max-w-lg break-words line-clamp-3">
            {item.description}
          </p>
        )}

        {/* Customisable Indicator */}
        {item.customizations && item.customizations.length > 0 && (
          <span className="text-[10px] text-brand font-bold uppercase tracking-wider block pt-0.5">
            Customisable
          </span>
        )}
      </div>

      {/* Right Column: Image, Skeleton and Action Button */}
      <div className="flex flex-col items-center justify-start flex-shrink-0 relative w-24 md:w-32 h-28 md:h-36 z-0">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl md:rounded-2xl overflow-hidden border border-black/[0.04] dark:border-white/[0.04] bg-neutral-100 dark:bg-neutral-800 shadow-md relative group">
          <DishImage
            src={item.imageUrl}
            alt={item.name}
            dishName={item.name}
            category={item.category}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        </div>

        {/* Action Button Container */}
        <div className="absolute -bottom-2 md:-bottom-3.5 z-10 h-[30px] md:h-[36px] w-[80px] md:w-[100px]">
          <AnimatePresence mode="wait">
            {quantityInCart > 0 ? (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-brand/20 dark:border-brand/40 text-brand h-full w-full rounded-lg md:rounded-xl shadow-md font-bold text-[13px] px-1 overflow-hidden"
              >
                <button 
                  onClick={handleDecreaseClick}
                  className="hover:bg-brand/5 dark:hover:bg-brand/10 w-5 md:w-7 h-5 md:h-7 flex items-center justify-center rounded-md transition-colors select-none focus:outline-none"
                >
                  <Minus size={11} strokeWidth={3} />
                </button>
                <motion.span 
                  key={quantityInCart}
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="text-[11px] md:text-[12px] text-center select-none font-bold w-4 block text-brand dark:text-brand"
                >
                  {quantityInCart}
                </motion.span>
                <button 
                  onClick={handleIncreaseClick}
                  className="hover:bg-brand/5 dark:hover:bg-brand/10 w-5 md:w-7 h-5 md:h-7 flex items-center justify-center rounded-md transition-colors select-none focus:outline-none"
                >
                  <Plus size={11} strokeWidth={3} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add-btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05, shadow: "0 4px 12px rgba(230, 57, 70, 0.25)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddClick}
                className="bg-brand/5 dark:bg-brand/10 hover:bg-brand dark:hover:bg-brand border border-brand/15 dark:border-brand/30 hover:border-brand text-brand hover:text-white h-full w-full rounded-lg md:rounded-xl shadow-xs font-black text-[11px] md:text-[12px] uppercase tracking-widest flex items-center justify-center transition-all select-none focus:outline-none cursor-pointer"
              >
                Add
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
