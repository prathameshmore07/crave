import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Check, Gift } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'sonner';
import DishImage from '../common/DishImage';

// professional icon replacement
// remove unnecessary emoji clutter
// unified premium design system
const COMBO_PAIRINGS = [
  {
    triggerKeywords: ['burger', 'pizza', 'sandwich', 'pasta'],
    title: 'Late Night Diner Combo',
    badge: 'Saver Pack',
    suggestions: [
      { id: 'combo-fries', name: 'Crispy Golden Fries', price: 90, originalPrice: 120, saving: 30, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&auto=format&fit=crop&q=60' },
      { id: 'combo-coke', name: 'Chilled Coca-Cola (330ml)', price: 40, originalPrice: 50, saving: 10, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=60' },
      { id: 'combo-brownie', name: 'Sizzling Chocolate Brownie', price: 120, originalPrice: 150, saving: 30, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=60' }
    ]
  },
  {
    triggerKeywords: ['paneer', 'chicken', 'dal', 'butter', 'kofta'],
    title: 'Shahi Maharaja Combo',
    badge: 'Most Ordered',
    suggestions: [
      { id: 'combo-naan', name: 'Garlic Naan Buttered', price: 60, originalPrice: 80, saving: 20, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=150&auto=format&fit=crop&q=60' },
      { id: 'combo-dal', name: 'Dal Makhani Signature (Half)', price: 110, originalPrice: 150, saving: 40, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=60' }
    ]
  },
  {
    triggerKeywords: ['dosa', 'idli', 'vada', 'uttapam'],
    title: 'South Indian Feast Combo',
    badge: 'Student Saver',
    suggestions: [
      { id: 'combo-vada', name: 'Medu Vada Crispy (2 Pcs)', price: 70, originalPrice: 90, saving: 20, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=150&auto=format&fit=crop&q=60' },
      { id: 'combo-podi', name: 'Ghee Podi Idli (Mini)', price: 80, originalPrice: 110, saving: 30, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?w=150&auto=format&fit=crop&q=60' }
    ]
  },
  {
    triggerKeywords: ['biryani', 'rice', 'mutton'],
    title: 'Shahi Biryani Feast',
    badge: 'Festive Delight',
    suggestions: [
      { id: 'combo-raita', name: 'Premium Veg Raita', price: 40, originalPrice: 60, saving: 20, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=150&auto=format&fit=crop&q=60' },
      { id: 'combo-gulab', name: 'Gulab Jamun (2 Pcs)', price: 50, originalPrice: 80, saving: 30, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=150&auto=format&fit=crop&q=60' }
    ]
  }
];

export default function SmartComboBuilder() {
  const cartItems = useCartStore((state) => state.items);
  const activeRestaurant = useCartStore((state) => state.restaurant);
  const addItem = useCartStore((state) => state.addItem);

  const [activeCombo, setActiveCombo] = useState(null);
  const [addedComboItemIds, setAddedComboItemIds] = useState(new Set());

  // Detect which combo trigger matches the current cart item names
  useEffect(() => {
    if (cartItems.length === 0 || !activeRestaurant) {
      setActiveCombo(null);
      return;
    }

    let matchedCombo = null;
    for (const item of cartItems) {
      const itemNameLower = item.name.toLowerCase();
      matchedCombo = COMBO_PAIRINGS.find(pairing => 
        pairing.triggerKeywords.some(keyword => itemNameLower.includes(keyword))
      );
      if (matchedCombo) break;
    }

    if (matchedCombo) {
      const availableSuggestions = matchedCombo.suggestions.filter(sug => 
        !cartItems.some(item => item.name.toLowerCase() === sug.name.toLowerCase() || item.id === sug.id)
      );

      if (availableSuggestions.length > 0) {
        setActiveCombo({
          ...matchedCombo,
          suggestions: availableSuggestions
        });
      } else {
        setActiveCombo(null);
      }
    } else {
      setActiveCombo(null);
    }
  }, [cartItems, activeRestaurant]);

  const handleAddComboItem = (suggestion) => {
    if (!activeRestaurant) return;

    addItem(
      {
        id: suggestion.id,
        name: suggestion.name,
        price: suggestion.price,
        originalPrice: suggestion.originalPrice,
        isVeg: suggestion.isVeg,
        imageUrl: suggestion.imageUrl
      },
      activeRestaurant
    );

    setAddedComboItemIds(prev => {
      const copy = new Set(prev);
      copy.add(suggestion.id);
      return copy;
    });

    toast.success(`Combo upgraded: Added ${suggestion.name}`, {
      position: 'bottom-center'
    });
  };

  if (!activeCombo) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      // refined combo card layout
      className="p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.06] rounded-2xl shadow-sm space-y-3.5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />

      {/* Header with professional icon replacement */}
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand">
            <Sparkles size={14} />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase tracking-wider text-brand block leading-none">Upgrade & Save</span>
            <h4 className="text-xs font-extrabold text-gray-800 dark:text-zinc-100 mt-0.5">{activeCombo.title}</h4>
          </div>
        </div>
        <span className="bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-350 text-[8px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider shrink-0 border border-black/[0.03] dark:border-white/[0.03]">
          <Gift size={10} /> {activeCombo.badge}
        </span>
      </div>

      {/* Suggestion Cards list - properly spaced and compact */}
      <div className="space-y-2 z-10 relative">
        <AnimatePresence>
          {activeCombo.suggestions.map((sug) => {
            const isAdded = addedComboItemIds.has(sug.id);

            return (
              <motion.div 
                key={sug.id}
                layout
                whileHover={{ scale: 1.005 }}
                className="flex items-center justify-between p-2 rounded-xl border border-black/[0.03] dark:border-white/[0.03] bg-gray-50/50 dark:bg-zinc-950/40 hover:bg-white dark:hover:bg-zinc-900/50 transition-all gap-3"
              >
                {/* Product Meta */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative bg-zinc-100 dark:bg-zinc-800 border border-black/[0.04] dark:border-white/[0.04]">
                    <DishImage 
                      src={sug.imageUrl} 
                      alt={sug.name} 
                      dishName={sug.name}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-1 left-1 bg-white/90 dark:bg-neutral-950/90 p-0.5 rounded-xs scale-[0.65] origin-top-left">
                      <div className={sug.isVeg ? 'veg-dot' : 'nonveg-dot'} />
                    </div>
                  </div>
                  <div className="min-w-0 text-left">
                    <h5 className="text-[11px] font-bold text-gray-800 dark:text-zinc-100 truncate leading-tight">{sug.name}</h5>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[11px] font-black text-brand leading-none">
                        {formatPrice(sug.price)}
                      </span>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 line-through leading-none font-medium">
                        {formatPrice(sug.originalPrice)}
                      </span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold leading-none">
                        Save {formatPrice(sug.saving)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refined clean sizing button */}
                <button
                  disabled={isAdded}
                  onClick={() => handleAddComboItem(sug)}
                  className={`h-7 px-3 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg shrink-0 transition-all border cursor-pointer focus:outline-none ${
                    isAdded 
                      ? 'bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20' 
                      : 'bg-brand text-white hover:bg-brand-hover border-transparent shadow-3xs hover:shadow-2xs'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={10} strokeWidth={3} />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus size={10} strokeWidth={3} />
                      Add
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
