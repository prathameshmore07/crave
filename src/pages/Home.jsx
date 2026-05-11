import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCityStore } from '../store/cityStore';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';
import { useOrderStore } from '../store/orderStore';
import { fetchRestaurants } from '../services/api';
import HeroBanner from '../components/home/HeroBanner';
import CuisineTiles from '../components/home/CuisineTiles';
import OfferStrip from '../components/home/OfferStrip';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import { toast } from 'sonner';
import DishImage from '../components/common/DishImage';

export default function Home() {
  const navigate = useNavigate();
  const selectedCity = useCityStore((state) => state.selectedCity);
  const selectedLocality = useCityStore((state) => state.selectedLocality);
  const user = useAuthStore((state) => state.user);
  const addToCart = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("recommended");
  const [pastOrders, setPastOrders] = useState([]);

  // Staggered cascade loading sections state
  const [loadedSections, setLoadedSections] = useState({
    banners: false,
    cuisines: false,
    offers: false,
    restaurants: false,
    orderAgain: false,
    topRated: false,
    collections: false
  });

  const orderHistory = useOrderStore((state) => state.orderHistory);

  // Load past orders from user-scoped useOrderStore on mount / update
  useEffect(() => {
    if (orderHistory && orderHistory.length > 0) {
      setPastOrders(orderHistory.slice(0, 3));
    } else {
      setPastOrders([]);
    }
  }, [orderHistory]);

  useEffect(() => {
    if (selectedCity) {
      loadRestaurants();
    }
  }, [selectedCity, selectedLocality, sortBy]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Reset loaded sections on city/locality change
      setLoadedSections({
        banners: false,
        cuisines: false,
        offers: false,
        restaurants: false,
        orderAgain: false,
        topRated: false,
        collections: false
      });

      const data = await fetchRestaurants(selectedCity, { sortBy, locality: selectedLocality });
      setRestaurants(data);
      
      // Enforce the 800 milliseconds skeleton delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Cascading top-to-bottom section activations (staggered 100ms apart)
      setLoadedSections(prev => ({ ...prev, banners: true }));
      setTimeout(() => setLoadedSections(prev => ({ ...prev, cuisines: true })), 100);
      setTimeout(() => setLoadedSections(prev => ({ ...prev, offers: true })), 200);
      setTimeout(() => setLoadedSections(prev => ({ ...prev, restaurants: true })), 300);
      setTimeout(() => setLoadedSections(prev => ({ ...prev, orderAgain: true })), 400);
      setTimeout(() => setLoadedSections(prev => ({ ...prev, topRated: true })), 500);
      setTimeout(() => setLoadedSections(prev => ({ ...prev, collections: true })), 600);

    } catch (err) {
      setError(err.message);
      toast.error("Failed to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          isVeg: item.isVeg,
          quantity: item.quantity || 1
        }, order.restaurantId, order.restaurantName);
      });
      toast.success(`Reordered from ${order.restaurantName}! Items added to cart.`);
      setCartOpen(true);
    } else {
      // Fallback navigate to restaurant
      navigate(`/restaurant/${order.restaurantId}`);
    }
  };

  // Filter top rated near you (rating 4.3+)
  const topRatedRestaurants = restaurants
    .filter(r => r.rating >= 4.3)
    .slice(0, 4);

  if (error) {
    return (
      <div className="page-enter min-h-[70vh] flex items-center justify-center py-16 px-4 max-w-7xl mx-auto w-full">
        <ErrorState message={error} onRetry={loadRestaurants} />
      </div>
    );
  }

  return (
    <div className="page-enter max-w-7xl mx-auto px-[16px] md:px-[24px] pb-16 flex flex-col gap-[48px]">
      
      {/* Section 1 — Hero banner carousel */}
      {loadedSections.banners ? (
        <HeroBanner />
      ) : (
        <div className="w-full h-[140px] md:h-[180px] rounded-2xl bg-gray-200 dark:bg-neutral-800 animate-pulse" />
      )}

      {/* Section 2 — Cuisine quick-select */}
      {loadedSections.cuisines ? (
        <CuisineTiles />
      ) : (
        <div className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-neutral-800 rounded-md animate-pulse" />
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-[114px] h-[94px] rounded-[16px] bg-gray-200 dark:bg-neutral-800 shrink-0 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Section 3 — Active offers strip */}
      {loadedSections.offers ? (
        <OfferStrip />
      ) : (
        <div className="w-full h-14 rounded-xl bg-gray-200 dark:bg-neutral-800 animate-pulse" />
      )}

      {/* Section 4 — "Order again" section (Renders above primary grid if past delivered orders exist) */}
      {loadedSections.orderAgain && pastOrders.length > 0 && (
        <div className="flex flex-col gap-[24px]">
          <div>
            <h2 className="text-scale-20 text-[--text-primary]">
              Order again
            </h2>
            <p className="text-[13px] text-[--text-secondary] mt-1">Reorder from recently visited kitchens</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[16px]">
            {pastOrders.map((order, idx) => (
              <div 
                key={`${order.orderId || idx}`} 
                className="p-[16px] bg-[--card-bg] border border-[--border] rounded-2xl flex items-center justify-between gap-[16px] hover:shadow-xs transition-shadow"
              >
                {/* Photo and Details */}
                <div className="flex items-center gap-[12px] min-w-0">
                  <div className="w-[44px] h-[44px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-[--border]">
                    <DishImage 
                      src={order.restaurantImageUrl || order.restaurantImage} 
                      alt={order.restaurantName}
                      dishName={order.restaurantName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-scale-15-semibold text-[--text-primary] truncate">
                      {order.restaurantName}
                    </h4>
                    <p className="text-scale-12 text-[--text-secondary] truncate mt-0.5 font-normal">
                      {order.items ? order.items.map(i => `${i.quantity || 1}x ${i.name}`).join(', ') : 'Reorder items'}
                    </p>
                  </div>
                </div>

                {/* Reorder Action */}
                <button
                  onClick={(e) => handleReorder(e, order)}
                  className="h-[34px] px-[12px] border border-[--brand] text-[--brand] hover:bg-[#FFF5F5] dark:hover:bg-[#2A1C1C] text-[13px] font-semibold rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                >
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5 — Nearby restaurants (Primary content) */}
      <div className="flex flex-col gap-[32px]">
        {/* Header and sort row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-scale-20 text-[--text-primary]">
              Restaurants near you
            </h2>
            <p className="text-[13px] text-[--text-secondary] mt-1 hidden sm:block">Popular delivery hotspots in your area</p>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-scale-12-uppercase text-[--text-secondary] hidden sm:inline">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 border border-[--border] bg-[--card-bg] text-[13px] font-medium rounded-lg outline-none cursor-pointer focus:border-[--brand] text-[--text-primary]"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Rating: High to Low</option>
              <option value="deliveryTime">Delivery Time</option>
              <option value="costLowToHigh">Price: Low to High</option>
              <option value="costHighToLow">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading Skeletons */}
        {!loadedSections.restaurants && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[20px] gap-y-[32px]">
            {Array.from({ length: 6 }).map((_, idx) => (
              <RestaurantCardSkeleton key={idx} />
            ))}
          </div>
        )}
        {/* Restaurants Grid */}
        {loadedSections.restaurants && !error && (
          restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[20px] gap-y-[32px]">
              {restaurants.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-[--border] rounded-2xl bg-[--card-bg]">
              <p className="text-scale-14 text-[--text-secondary]">No restaurants open in this city right now.</p>
            </div>
          )
        )}
      </div>

      {/* Section 6 — Top rated */}
      {loadedSections.topRated && !error && topRatedRestaurants.length > 0 && (
        <div className="flex flex-col gap-[32px]">
          <div>
            <h2 className="text-scale-20 text-[--text-primary]">
              Top rated near you
            </h2>
            <p className="text-[13px] text-[--text-secondary] mt-1">Gourmet highlights rated 4.3 ★ and above</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[20px] gap-y-[32px]">
            {topRatedRestaurants.map((rest) => (
              <RestaurantCard key={`top-${rest.id}`} restaurant={rest} />
            ))}
          </div>
        </div>
      )}

      {/* Section 7 — Curated Collections Row */}
      {loadedSections.collections && !error && (
        <div className="flex flex-col gap-[24px]">
          <div>
            <h2 className="text-scale-20 text-[--text-primary]">
              Curated Collections
            </h2>
            <p className="text-[13px] text-[--text-secondary] mt-1">
              Handpicked recommendations for every craving
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                title: "Healthy Meals",
                desc: "Nutritious & low-calorie choices",
                tag: "Healthy",
                img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80"
              },
              {
                title: "Late Night Bites",
                desc: "Open late for those midnight munchies",
                tag: "Burger",
                img: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&q=80"
              },
              {
                title: "Office Lunch Specials",
                desc: "Quick, satisfying, and easy on the wallet",
                tag: "Thali",
                img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"
              }
            ].map((col) => (
              <div
                key={col.title}
                onClick={() => navigate(`/restaurants?collection=${col.tag}`)}
                className="relative rounded-2xl h-44 overflow-hidden group cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/30 transition-colors" />
                <img
                  src={col.img}
                  alt={col.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-15" />
                <div className="absolute bottom-5 left-5 right-5 z-20 text-white">
                  <span className="px-2 py-0.5 bg-white/20 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Collection
                  </span>
                  <h3 className="text-[18px] font-bold mt-1.5 group-hover:text-[--brand] transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-[12px] text-white/80 mt-0.5 font-normal line-clamp-1">
                    {col.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
