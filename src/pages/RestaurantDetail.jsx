import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchRestaurantById, fetchReviews } from '../services/api';
import MenuItem from '../components/restaurant/MenuItem';
import CustomizeModal from '../components/restaurant/CustomizeModal';
import ReviewCard from '../components/restaurant/ReviewCard';
import { MenuItemSkeleton } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import { Star, Clock, Heart, ArrowLeft, Percent, ThumbsUp, MapPin, Search, Sparkles, Zap } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { getRatingColor } from '../utils/getRatingColor';
import { formatTime } from '../utils/formatTime';
import { toast } from 'sonner';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("online"); // 'online', 'reviews'
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);
  const [reviewFilter, setReviewFilter] = useState("recent"); // 'recent', 'top', 'helpful'

  // Customize Modal State
  const [customizeItem, setCustomizeItem] = useState(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Search in Menu State
  const [menuSearch, setMenuSearch] = useState("");

  const categoryRefs = useRef([]);

  // Filter menu items by search query if any (safely derived at the top of body)
  const getFilteredMenuCategories = () => {
    if (!restaurant) return [];
    if (!menuSearch) return restaurant.menuCategories || [];
    const lowerQuery = menuSearch.toLowerCase();
    
    return (restaurant.menuCategories || []).map((category) => {
      const matchedItems = (category.items || []).filter((item) => 
        item.name.toLowerCase().includes(lowerQuery) || 
        (item.description && item.description.toLowerCase().includes(lowerQuery))
      );
      return {
        ...category,
        items: matchedItems
      };
    }).filter(cat => cat.items.length > 0);
  };

  const menuCategories = getFilteredMenuCategories();

  useEffect(() => {
    loadRestaurantDetails();
  }, [id]);

  // Handle automatic scrolling to deep-linked menu items
  useEffect(() => {
    if (!loading && restaurant) {
      const itemId = searchParams.get('item');
      if (itemId) {
        setTimeout(() => {
          const element = document.getElementById(`menu-item-${itemId}`);
          if (element) {
            // Find category matching this item
            let matchedIdx = 0;
            restaurant.menuCategories.forEach((cat, idx) => {
              if (cat.items.some(i => i.id === itemId)) {
                matchedIdx = idx;
              }
            });
            setSelectedCategoryIdx(matchedIdx);

            const isMobile = window.innerWidth < 768;
            const headerHeight = isMobile ? 180 : 210;
            const topOffset = element.getBoundingClientRect().top + window.scrollY - headerHeight;
            window.scrollTo({ top: topOffset, behavior: 'smooth' });

            // Apply attention glow blink
            element.classList.add('highlight-blink');
            setTimeout(() => {
              element.classList.remove('highlight-blink');
            }, 3000);
          }
        }, 400);
      }
    }
  }, [loading, restaurant, searchParams]);

  // Scroll Spy for Category Selection
  useEffect(() => {
    if (activeTab !== 'online' || menuCategories.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-180px 0px -50% 0px',
      threshold: 0
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = categoryRefs.current.indexOf(entry.target);
          if (index !== -1) {
            setSelectedCategoryIdx(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    categoryRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [activeTab, menuCategories]);

  const loadRestaurantDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRestaurantById(id);
      setRestaurant(data);

      // Pre-load reviews
      setReviewsLoading(true);
      const reviewList = await fetchReviews(id);
      setReviews(reviewList);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load restaurant details.");
    } finally {
      setLoading(false);
      setReviewsLoading(false);
    }
  };

  const handleOpenCustomize = (item) => {
    setCustomizeItem(item);
    setIsCustomizeOpen(true);
  };

  const scrollToCategory = (index) => {
    setSelectedCategoryIdx(index);
    const element = categoryRefs.current[index];
    if (element) {
      const isMobile = window.innerWidth < 768;
      const headerHeight = isMobile ? 180 : 210;
      const topOffset = element.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="h-[280px] skeleton rounded-2xl w-full"></div>
        <div className="space-y-4">
          <div className="h-8 w-1/3 skeleton rounded"></div>
          <div className="h-4 w-1/4 skeleton rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2 col-span-1 hidden md:block">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-full skeleton rounded"></div>
            ))}
          </div>
          <div className="col-span-3 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadRestaurantDetails} />;
  }

  if (!restaurant) return null;


  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in space-y-6">
      {/* Hero Header Back Row */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand transition-colors outline-none cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Restaurants
      </button>

      {/* Hero Banner Area */}
      <div className="relative h-[280px] w-full rounded-2xl overflow-hidden shadow-xs">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60";
          }}
        />
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10" />

        <div className="absolute bottom-6 left-6 right-6 z-20 text-white space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {restaurant.isPureVeg && (
              <span className="text-[10px] bg-success text-white font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm">
                100% Pure Veg
              </span>
            )}
            {(restaurant.isSpecial || restaurant.name === "ITM Canteen") && (
              <>
                {/* professional icon replacement */}
                {/* remove unnecessary emoji clutter */}
                <span className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Sparkles size={11} className="animate-pulse" /> COLLEGE FAVORITE
                </span>
                <span className="text-[10px] bg-indigo-600 text-white font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Zap size={11} /> LATE NIGHT AVAILABLE
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{restaurant.name}</h1>
          <p className="text-xs md:text-sm text-zinc-200 font-medium">{restaurant.cuisines.join(', ')} • {restaurant.locality}</p>
        </div>
      </div>

      {/* Info details row card */}
      <div className="p-5 bg-white dark:bg-dark-surface border border-black/[0.06] dark:border-white/[0.06] rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center text-center transition-colors relative overflow-hidden">
        {(restaurant.isSpecial || restaurant.name === "ITM Canteen") && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />
        )}
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">Rating</span>
          <div className="flex items-center justify-center gap-1 font-semibold text-sm text-gray-800 dark:text-gray-100">
            <span className={`px-2 py-0.5 rounded flex items-center gap-0.5 text-xs text-white ${getRatingColor(restaurant.rating)}`}>
              {restaurant.rating.toFixed(1)} <Star size={11} className="fill-current" />
            </span>
            <span className="text-xs text-gray-400 font-medium">({restaurant.ratingCount})</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">Est. Time</span>
          <div className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
            <Clock size={15} className="text-gray-400" />
            {formatTime(restaurant.deliveryTime)}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">Cost For Two</span>
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {formatPrice(restaurant.costForTwo)}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Status</span>
          <span className={`text-xs font-bold uppercase tracking-wider inline-block px-2.5 py-0.5 rounded ${restaurant.isOpen ? 'bg-success/10 text-success' : 'bg-red-100 text-red-800'}`}>
            {restaurant.isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Offers details */}
      {restaurant.discount && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/5 dark:from-amber-400/5 dark:to-orange-500/2 border border-amber-500/20 dark:border-amber-400/10 rounded-xl flex items-center justify-between gap-3 animate-fade-in text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <Percent size={18} className="text-amber-500 animate-spin-slow" />
            <span>STUDENT OFFER: {restaurant.discount} • Free delivery on orders above ₹149</span>
          </div>
          {(restaurant.isSpecial || restaurant.name === "ITM Canteen") && (
            <span className="hidden sm:inline-block text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
              COLLEGE DEAL
            </span>
          )}
        </div>
      )}

      {/* Sticky Segment Tabs & Search Bar Header */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md pb-3 pt-1 border-b border-black/[0.05] dark:border-white/[0.05] -mx-4 px-4 md:-mx-8 md:px-8 space-y-3 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-black/[0.02] dark:border-white/[0.02]">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("online")}
              className={`py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all outline-none cursor-pointer ${
                activeTab === 'online' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              Order Online
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all outline-none cursor-pointer ${
                activeTab === 'reviews' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{restaurant.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Accepting Orders</span>
          </div>
        </div>

        {activeTab === 'online' && (
          <div className="relative w-full max-w-full md:max-w-xl mx-auto py-1 animate-in fade-in duration-300">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Search dishes or cuisines..."
              className="h-10 pl-10 pr-4 w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl outline-none text-xs font-semibold focus:border-brand dark:focus:border-brand focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>
        )}
      </div>

      {/* Tabs Content */}
      {activeTab === 'online' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Categories Sidebar navigation (Desktop) */}
          <div className="col-span-1 hidden md:block pr-6 border-r border-black/[0.04] dark:border-white/[0.04] space-y-2 sticky top-[210px] h-fit self-start">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 pb-3 mb-2 border-b border-black/[0.05] dark:border-white/[0.05]">
              Menu Sections
            </h3>
            <div className="flex flex-col space-y-1">
              {menuCategories.map((cat, idx) => (
                <button
                  key={cat.name}
                  onClick={() => scrollToCategory(idx)}
                  className={`w-full text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all outline-none border-l-2 cursor-pointer ${
                    selectedCategoryIdx === idx 
                      ? 'bg-brand/5 border-brand text-brand font-bold pl-4' 
                      : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] pl-3'
                  }`}
                >
                  {cat.name}
                  <span className="text-[10px] font-normal opacity-60 ml-1.5 lowercase">({cat.items.length})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items lists */}
          <div className="col-span-1 md:col-span-3 space-y-10">
            {menuCategories.length > 0 ? (
              menuCategories.map((cat, idx) => (
                <div 
                  key={cat.name} 
                  ref={el => categoryRefs.current[idx] = el}
                  className="space-y-1 animate-fade-in"
                >
                  <h2 className="text-xs md:text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest pb-2 border-b border-black/[0.05] dark:border-white/[0.05] sticky top-[172px] md:top-[198px] bg-white dark:bg-dark-bg z-20 pt-3 transition-all">
                    {cat.name}
                  </h2>
                  <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {cat.items.map((item) => (
                      <MenuItem 
                        key={item.id} 
                        item={item} 
                        restaurant={restaurant} 
                        onOpenCustomize={handleOpenCustomize}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-sm text-gray-500">No dishes match your search query.</p>
              </div>
            )}
          </div>
        </div>
      ) : (() => {
        // Compute sub-ratings averages dynamically based on the active reviews list
        const reviewsCount = reviews.length;
        const avgFood = reviewsCount > 0 
          ? (reviews.reduce((sum, r) => sum + (r.foodQuality || r.rating), 0) / reviewsCount).toFixed(1) 
          : "4.7";
        const avgService = reviewsCount > 0 
          ? (reviews.reduce((sum, r) => sum + (r.deliveryExperience || r.rating), 0) / reviewsCount).toFixed(1) 
          : "4.6";
        const avgPacking = reviewsCount > 0 
          ? (reviews.reduce((sum, r) => sum + (r.packaging || r.rating), 0) / reviewsCount).toFixed(1) 
          : "4.5";

        // Sort reviews dynamically based on the chosen segment filter
        const sortedReviews = [...reviews].sort((a, b) => {
          if (reviewFilter === 'top') {
            return b.rating - a.rating;
          }
          if (reviewFilter === 'helpful') {
            return (b.helpfulCount || 0) - (a.helpfulCount || 0);
          }
          if (reviewFilter === 'funniest') {
            return (b.reactions?.laugh || 0) - (a.reactions?.laugh || 0);
          }
          // Default: recent customer feedback order
          const timeA = a.timestamp || 0;
          const timeB = b.timestamp || 0;
          return timeB - timeA;
        });

        return (
          /* Reviews list tab views */
          <div className="space-y-8 max-w-3xl text-left animate-in fade-in duration-300">
            {/* Reviews Rating distribution and sub-ratings bars */}
            <div className="p-6 bg-white dark:bg-dark-surface border border-black/[0.05] dark:border-white/[0.05] rounded-2xl flex flex-col md:flex-row gap-6 items-stretch shadow-xs">
              
              {/* Left Column: Overall Score card */}
              <div className="text-center py-2 px-4 space-y-1 flex-shrink-0 md:border-r border-black/[0.05] dark:border-white/[0.05] md:pr-6 flex flex-col justify-center">
                <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{restaurant.rating.toFixed(1)}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Out of 5 Stars</p>
                <div className="flex items-center gap-0.5 justify-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < Math.round(restaurant.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-700"} 
                    />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-400 font-bold block pt-1.5">{reviewsCount} Total Reviews</span>
              </div>

              {/* Right Column: Premium Sub-ratings Performance breakdown */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                
                {/* Food Taste Sub-rating */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl space-y-2 border border-black/[0.01] dark:border-white/[0.01]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-450 dark:text-gray-500 font-extrabold uppercase tracking-wider block">🍔 Food Quality</span>
                    <span className="text-xs font-black text-gray-800 dark:text-zinc-200 flex items-center gap-0.5">
                      {avgFood} <Star size={10} className="fill-amber-400 text-amber-400" />
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(Number(avgFood) / 5) * 100}%` }}></div>
                  </div>
                </div>

                {/* Service Experience Sub-rating */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl space-y-2 border border-black/[0.01] dark:border-white/[0.01]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-450 dark:text-gray-500 font-extrabold uppercase tracking-wider block">🛵 Service / Rider</span>
                    <span className="text-xs font-black text-gray-800 dark:text-zinc-200 flex items-center gap-0.5">
                      {avgService} <Star size={10} className="fill-emerald-500 text-emerald-500" />
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(Number(avgService) / 5) * 100}%` }}></div>
                  </div>
                </div>

                {/* Packaging Quality Sub-rating */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl space-y-2 border border-black/[0.01] dark:border-white/[0.01]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-450 dark:text-gray-500 font-extrabold uppercase tracking-wider block">📦 Packing Quality</span>
                    <span className="text-xs font-black text-gray-800 dark:text-zinc-200 flex items-center gap-0.5">
                      {avgPacking} <Star size={10} className="fill-indigo-500 text-indigo-500" />
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-550 rounded-full" style={{ width: `${(Number(avgPacking) / 5) * 100}%` }}></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Premium Category Filter Pills for sorting */}
            <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
              <button
                onClick={() => setReviewFilter('recent')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  reviewFilter === 'recent'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent'
                    : 'bg-white dark:bg-dark-surface hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                🕒 Latest
              </button>
              <button
                onClick={() => setReviewFilter('funniest')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  reviewFilter === 'funniest'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent'
                    : 'bg-white dark:bg-dark-surface hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                😂 Funniest
              </button>
              <button
                onClick={() => setReviewFilter('top')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  reviewFilter === 'top'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent'
                    : 'bg-white dark:bg-dark-surface hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                ⭐ Highest Rated
              </button>
              <button
                onClick={() => setReviewFilter('helpful')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  reviewFilter === 'helpful'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent'
                    : 'bg-white dark:bg-dark-surface hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                👍 Most Helpful
              </button>
            </div>

            {/* User Reviews lists */}
            {reviewsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-28 w-full skeleton rounded-2xl"></div>
                ))}
              </div>
            ) : sortedReviews.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 font-bold uppercase tracking-wider text-xs">
                No verified foodie logs listed under this section.
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05] space-y-1">
                {sortedReviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Customize variants modal overlay */}
      <CustomizeModal
        item={customizeItem}
        restaurant={restaurant}
        isOpen={isCustomizeOpen}
        onClose={() => {
          setIsCustomizeOpen(false);
          setCustomizeItem(null);
        }}
      />
    </div>
  );
}
