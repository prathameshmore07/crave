import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import { useCityStore } from '../../store/cityStore';
import { restaurants } from '../../data/restaurants';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, ArrowLeft, X, Store, Utensils, Hash, History, Flame } from 'lucide-react';
import { getUserJsonItem, setUserItem, removeUserItem } from '../../utils/storage';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo.png';

const trendingSearches = [
  "Biryani", "Pizza", "Dosa", "Burger", "Thali", "Chinese", "Desserts", "North Indian"
];

export default function SearchOverlay() {
  const navigate = useNavigate();
  const searchOpen = useUiStore((state) => state.searchOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const selectedCity = useCityStore((state) => state.selectedCity);

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  // Debounce query (180ms as requested)
  const debouncedQuery = useDebounce(query, 180);

  const user = useAuthStore((state) => state.user);

  // Load recent searches
  useEffect(() => {
    if (searchOpen) {
      const stored = getUserJsonItem('recent_searches', []);
      setRecentSearches(stored);
      // Autofocus input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [searchOpen, user]);

  // Escape and global trigger (⌘K / Ctrl+K / /) listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
      // Open with Meta+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Open with '/' if not currently in an input/textarea
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  if (!searchOpen) return null;

  // Search logic across city restaurants, cuisines, dishes
  const getSearchResults = () => {
    if (!debouncedQuery.trim()) return { restaurants: [], dishes: [], cuisines: [] };

    const lowerQuery = debouncedQuery.toLowerCase();
    const cityRestaurants = restaurants.filter(
      (r) => r.city.toLowerCase() === selectedCity.toLowerCase()
    );

    // 1. Restaurant matches
    const matchedRestaurants = cityRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.locality.toLowerCase().includes(lowerQuery)
    );

    // 2. Cuisine matches
    const matchedCuisinesSet = new Set();
    cityRestaurants.forEach((r) => {
      r.cuisines.forEach((c) => {
        if (c.toLowerCase().includes(lowerQuery)) {
          matchedCuisinesSet.add(c);
        }
      });
    });

    // 3. Dishes matches
    const matchedDishes = [];
    cityRestaurants.forEach((r) => {
      r.menuCategories.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.name.toLowerCase().includes(lowerQuery)) {
            matchedDishes.push({
              ...item,
              restaurantName: r.name,
              restaurantId: r.id
            });
          }
        });
      });
    });

    return {
      restaurants: matchedRestaurants.slice(0, 4),
      cuisines: Array.from(matchedCuisinesSet).slice(0, 3),
      dishes: matchedDishes.slice(0, 5)
    };
  };

  const results = getSearchResults();

  const handleSearchSubmit = (searchTerm) => {
    if (!searchTerm.trim()) return;

    // Save to recents
    const stored = getUserJsonItem('recent_searches', []);
    const updated = [searchTerm, ...stored.filter((s) => s !== searchTerm)].slice(0, 5);
    setUserItem('recent_searches', updated);
    setRecentSearches(updated);

    setSearchOpen(false);
    navigate(`/restaurants?search=${encodeURIComponent(searchTerm)}`);
  };

  const clearRecents = () => {
    removeUserItem('recent_searches');
    setRecentSearches([]);
  };

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/40 dark:bg-black/75 backdrop-blur-md md:backdrop-blur-lg flex justify-center items-start pt-0 md:pt-28 px-0 md:px-4 overflow-y-auto select-none"
      onClick={() => setSearchOpen(false)}
    >
      {/* Floating Command Panel Surface */}
      <div 
        className="w-full h-full md:h-auto md:max-h-[80vh] md:max-w-2xl bg-white dark:bg-zinc-950 rounded-none md:rounded-2xl border-0 md:border border-black/[0.08] dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col search-overlay-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row with input */}
        <div className="h-16 px-4 md:px-5 flex items-center border-b border-black/[0.06] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01] gap-3 shrink-0">
          <button
            onClick={() => setSearchOpen(false)}
            className="p-2 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 focus:outline-none flex-shrink-0 transition-all duration-150 active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for restaurants, cuisines or dishes..."
              className="w-full h-11 pl-9 pr-10 text-[14px] font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 bg-transparent border-0 focus:outline-none focus:ring-0"
            />
            <Search size={15} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 focus:outline-none transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Search Body Content - Scrollable container */}
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-6 bg-white dark:bg-zinc-950">
          {!query.trim() ? (
            /* Empty/Initial State: Recent and Trending side-by-side or stacked */
            <div className="space-y-8 max-w-2xl">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <History size={14} className="text-zinc-400 dark:text-zinc-500" />
                      Recent Searches
                    </h3>
                    <button 
                      onClick={clearRecents} 
                      className="text-[11px] text-[--brand] hover:underline focus:outline-none font-bold uppercase tracking-wider"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-[13px] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                      >
                        <button
                          onClick={() => handleSearchSubmit(term)}
                          className="hover:text-[--brand] transition-colors focus:outline-none font-medium"
                        >
                          {term}
                        </button>
                        <button
                          onClick={() => {
                            const updated = recentSearches.filter((s) => s !== term);
                            setUserItem('recent_searches', updated);
                            setRecentSearches(updated);
                          }}
                          className="p-0.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-zinc-400 dark:text-zinc-500 hover:text-[--brand] focus:outline-none transition-colors"
                          aria-label={`Remove search term ${term}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Now */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Flame size={14} className="text-zinc-400 dark:text-zinc-500" />
                  Trending Now
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearchSubmit(term)}
                      className="h-8 px-4 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:border-[--brand] hover:text-[--brand] hover:bg-[#FFF5F5] dark:hover:bg-[#2D1618]/30 transition-all focus:outline-none"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="space-y-6 max-w-2xl">
              {results.restaurants.length === 0 && results.dishes.length === 0 && results.cuisines.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                  <p className="text-[14px] font-medium">No results matching "{debouncedQuery}"</p>
                  <p className="text-[12px] mt-1 text-zinc-400 dark:text-zinc-500">Try searching for other dishes, cuisines or restaurants.</p>
                </div>
              ) : (
                <>
                  {/* Restaurants Matches */}
                  {results.restaurants.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 block">Restaurants</h4>
                      {results.restaurants.map((rest) => (
                        <button
                          key={rest.id}
                          onClick={() => {
                            setSearchOpen(false);
                            navigate(`/restaurant/${rest.id}`);
                          }}
                          className="w-full h-14 px-4 rounded-xl border border-zinc-100 dark:border-zinc-900/50 bg-zinc-50/40 dark:bg-zinc-900/10 flex items-center justify-between text-left hover:border-[--brand] hover:bg-[#FFF5F5] dark:hover:bg-[#2D1618]/30 hover:shadow-xs transition-all focus:outline-none group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Store size={16} className="text-zinc-400 dark:text-zinc-500 group-hover:text-[--brand] flex-shrink-0 transition-colors" />
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[--brand] transition-colors truncate">{rest.name}</div>
                              <div className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{rest.locality}</div>
                            </div>
                          </div>
                          <span className="text-[12px] text-[--brand] font-semibold flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-250 pr-1">
                            View menu
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Dishes Matches */}
                  {results.dishes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 block">Dishes</h4>
                      {results.dishes.map((dish) => (
                        <button
                          key={`${dish.restaurantId}-${dish.id}`}
                          onClick={() => {
                            setSearchOpen(false);
                            navigate(`/restaurant/${dish.restaurantId}?item=${dish.id}`);
                          }}
                          className="w-full h-14 px-4 rounded-xl border border-zinc-100 dark:border-zinc-900/50 bg-zinc-50/40 dark:bg-zinc-900/10 flex items-center justify-between text-left hover:border-[--brand] hover:bg-[#FFF5F5] dark:hover:bg-[#2D1618]/30 hover:shadow-xs transition-all focus:outline-none group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Utensils size={16} className="text-zinc-400 dark:text-zinc-500 group-hover:text-[--brand] flex-shrink-0 transition-colors" />
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[--brand] transition-colors truncate">{dish.name}</div>
                              <div className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">from {dish.restaurantName} • Rs {dish.price}</div>
                            </div>
                          </div>
                          <span className="text-[12px] text-[--brand] font-semibold flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-250 pr-1">
                            Order now
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cuisines Matches */}
                  {results.cuisines.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 block">Cuisines</h4>
                      {results.cuisines.map((cuisine) => (
                        <button
                          key={cuisine}
                          onClick={() => handleSearchSubmit(cuisine)}
                          className="w-full h-14 px-4 rounded-xl border border-zinc-100 dark:border-zinc-900/50 bg-zinc-50/40 dark:bg-zinc-900/10 flex items-center justify-between text-left hover:border-[--brand] hover:bg-[#FFF5F5] dark:hover:bg-[#2D1618]/30 hover:shadow-xs transition-all focus:outline-none group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Hash size={16} className="text-zinc-400 dark:text-zinc-500 group-hover:text-[--brand] flex-shrink-0 transition-colors" />
                            <div className="min-w-0">
                              <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[--brand] transition-colors truncate">{cuisine} Cuisines</div>
                              <div className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">View matching restaurants</div>
                            </div>
                          </div>
                          <span className="text-[12px] text-[--brand] font-semibold flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-250 pr-1">
                            View details
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
