import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';
import { getUserJsonItem, setUserItem } from '../utils/storage';
import { restaurants } from '../data/restaurants';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import DishImage from '../components/common/DishImage';
import { formatPrice } from '../utils/formatPrice';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, AlertCircle, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function Wishlist() {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);

  const [activeTab, setActiveTab] = useState('dishes'); // 'dishes' | 'restaurants'
  const [savedDishes, setSavedDishes] = useState([]);
  const [savedRestaurants, setSavedRestaurants] = useState([]);

  // Load wishlist items on mount and listen to changes
  useEffect(() => {
    const loadWishlist = () => {
      const dishes = getUserJsonItem('saved_for_later', []);
      const favRestIds = getUserJsonItem('fav_restaurants', []);
      
      // Resolve full restaurant details from ids
      const resolvedRestaurants = restaurants.filter(r => favRestIds.includes(r.id));
      
      setSavedDishes(dishes);
      setSavedRestaurants(resolvedRestaurants);
    };

    loadWishlist();

    window.addEventListener('wishlist-updated', loadWishlist);
    return () => {
      window.removeEventListener('wishlist-updated', loadWishlist);
    };
  }, []);

  const handleRemoveDish = (dishId, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const dishes = getUserJsonItem('saved_for_later', []);
    const updated = dishes.filter(d => d.id !== dishId);
    setUserItem('saved_for_later', updated);
    setSavedDishes(updated);
    toast.info("Dish removed from Wishlist");
  };

  const handleMoveToCart = (dish, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Default restaurant info or try to find matching in database
    const matchedRest = restaurants.find(r => r.id === dish.restaurantId) || {
      id: dish.restaurantId || 'rest-generic',
      name: dish.restaurant || 'Campus Kitchen',
      locality: 'Campus Delivery',
      imageUrl: dish.imageUrl
    };

    const restaurantInfo = {
      id: matchedRest.id,
      name: matchedRest.name,
      locality: matchedRest.locality,
      imageUrl: matchedRest.imageUrl
    };

    // Add to cart using unified addToCart logic
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      isVeg: dish.isVeg,
      imageUrl: dish.imageUrl,
      selectedCustomizations: []
    }, restaurantInfo);

    // Remove from saved dishes list
    const dishes = getUserJsonItem('saved_for_later', []);
    const updated = dishes.filter(d => d.id !== dish.id);
    setUserItem('saved_for_later', updated);
    setSavedDishes(updated);

    toast.success(`Moved ${dish.name} to Cart!`, {
      description: "Basket updated successfully."
    });
    setCartOpen(true);
  };

  const handleRemoveRestaurant = (restaurantId, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const favRestIds = getUserJsonItem('fav_restaurants', []);
    const updated = favRestIds.filter(id => id !== restaurantId);
    setUserItem('fav_restaurants', updated);
    
    const resolvedRestaurants = restaurants.filter(r => updated.includes(r.id));
    setSavedRestaurants(resolvedRestaurants);
    toast.info("Restaurant removed from Favourites");
  };

  const hasItems = activeTab === 'dishes' ? savedDishes.length > 0 : savedRestaurants.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 space-y-10 page-enter select-none text-left">
      {/* Premium Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto pt-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/10 flex items-center justify-center text-brand mx-auto shadow-sm">
          <Heart size={22} className="fill-brand animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight flex items-center justify-center gap-2">
          Wishlist & Saved Items
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider leading-relaxed">
          Your curated catalog of campus delicacies and top food spots
        </p>
      </div>

      {/* Mode Switcher Buttons */}
      <div className="flex items-center justify-center border-b border-black/[0.05] dark:border-white/[0.05] pb-1 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('dishes')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 text-center transition-all cursor-pointer outline-none ${
            activeTab === 'dishes'
              ? 'border-brand text-brand'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          Saved Dishes ({savedDishes.length})
        </button>
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 text-center transition-all cursor-pointer outline-none ${
            activeTab === 'restaurants'
              ? 'border-brand text-brand'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          Fav Restaurants ({savedRestaurants.length})
        </button>
      </div>

      {/* Content Space */}
      {hasItems ? (
        activeTab === 'dishes' ? (
          /* Saved Dishes Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDishes.map((dish) => (
              <div
                key={dish.id}
                className="group relative bg-white dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Visual Section */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0 relative">
                    <DishImage
                      src={dish.imageUrl}
                      alt={dish.name}
                      dishName={dish.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-1 right-1 p-1 bg-white/90 dark:bg-neutral-950/90 rounded-md shadow-xs">
                      <div className={dish.isVeg ? 'veg-dot' : 'nonveg-dot'} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 truncate group-hover:text-brand transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-[10px] text-brand font-extrabold tracking-wide uppercase mt-0.5">
                      by {dish.restaurant || 'Campus Kitchen'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1.5 leading-none">
                      {formatPrice(dish.price)}
                    </p>
                  </div>
                </div>

                {/* Fun Description (if available) */}
                {dish.funDescription && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 leading-relaxed font-normal line-clamp-2">
                    {dish.funDescription}
                  </p>
                )}

                {/* Footer Action buttons with unified dimensions */}
                <div className="flex items-center gap-2 pt-4 border-t border-black/[0.03] dark:border-white/[0.03] mt-4">
                  <button
                    onClick={(e) => handleRemoveDish(dish.id, e)}
                    className="h-10 px-3 bg-gray-50 dark:bg-neutral-850 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-black/[0.03] dark:border-white/[0.03]"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={(e) => handleMoveToCart(dish, e)}
                    className="h-10 flex-1 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer outline-none border-none"
                  >
                    <ShoppingBag size={13} />
                    Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Favourite Restaurants Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRestaurants.map((rest) => (
              <div key={rest.id} className="relative group">
                <RestaurantCard restaurant={rest} />
              </div>
            ))}
          </div>
        )
      ) : (
        /* Enhanced Empty State UI */
        <div className="max-w-md mx-auto text-center py-16 px-6 bg-white dark:bg-dark-surface/50 border border-black/[0.04] dark:border-white/[0.04] rounded-3xl space-y-5 shadow-xs animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-gray-55 dark:bg-zinc-800/60 text-gray-400 flex items-center justify-center mx-auto">
            <Heart size={28} strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-gray-850 dark:text-gray-100">
              Your {activeTab} shelf is empty
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold max-w-[280px] mx-auto">
              {activeTab === 'dishes'
                ? "Swipe right on Food Explorer, or look out for save buttons to save dishes for your late session cravings."
                : "Tap the heart on top of your preferred canteen profiles to queue them here for instant ordering."}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="h-11 px-6 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            Start Browsing <ArrowRight size={12} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
