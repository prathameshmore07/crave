import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCityStore } from '../store/cityStore';
import { fetchRestaurants } from '../services/api';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { SlidersHorizontal, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RestaurantList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCity = useCityStore((state) => state.selectedCity);
  const selectedLocality = useCityStore((state) => state.selectedLocality);

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mobile drawer open state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    veg: false,
    nonVeg: false,
    rating4Plus: false,
    fastDelivery: false,
    hasOffers: searchParams.get('offers') === 'true',
    pureVeg: false,
    sortBy: "recommended",
    search: searchParams.get('search') || searchParams.get('cuisine') || searchParams.get('collection') || ""
  });

  // Re-sync query parameters if changed (e.g. from bottom nav or header click)
  useEffect(() => {
    const searchVal = searchParams.get('search') || searchParams.get('cuisine') || searchParams.get('collection') || "";
    const offersVal = searchParams.get('offers') === 'true';
    
    setFilters(prev => ({
      ...prev,
      search: searchVal,
      hasOffers: offersVal
    }));
  }, [searchParams]);

  useEffect(() => {
    if (selectedCity) {
      loadRestaurants();
    }
  }, [selectedCity, selectedLocality, filters]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRestaurants(selectedCity, { ...filters, locality: selectedLocality });
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load restaurants list.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (key) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({
      ...prev,
      sortBy: e.target.value
    }));
  };

  const clearFilters = () => {
    setFilters({
      veg: false,
      nonVeg: false,
      rating4Plus: false,
      fastDelivery: false,
      hasOffers: false,
      pureVeg: false,
      sortBy: "recommended",
      search: ""
    });
    setSearchParams({});
    setIsFilterDrawerOpen(false);
  };

  const filterChips = [
    { key: "veg", label: "Veg" },
    { key: "nonVeg", label: "Non-Veg" },
    { key: "rating4Plus", label: "Rating 4.0+" },
    { key: "fastDelivery", label: "Fast Delivery" },
    { key: "hasOffers", label: "Offers & Discounts" },
    { key: "pureVeg", label: "Pure Veg" }
  ];

  // Count active filters
  const activeFiltersCount = Object.keys(filters).reduce((acc, key) => {
    if (key !== 'sortBy' && key !== 'search' && filters[key]) {
      return acc + 1;
    }
    return acc;
  }, 0);

  if (error) {
    return (
      <div className="page-enter min-h-[70vh] flex items-center justify-center py-16 px-4 max-w-7xl mx-auto w-full">
        <ErrorState message={error} onRetry={loadRestaurants} />
      </div>
    );
  }

  return (
    <div className="page-enter max-w-7xl mx-auto px-[16px] md:px-[24px] pb-20 select-none">
      
      {/* Listing Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[--border] pb-5 mb-6">
        <div>
          <h1 className="text-scale-22 text-[--text-primary] capitalize">
            Restaurants in {selectedCity ? selectedCity : "your city"}
          </h1>
          <p className="text-scale-13 text-[--text-secondary] mt-1 font-normal">
            {loading ? "Discovering nearby kitchens..." : `Found ${restaurants.length} delivery partners close to you`}
          </p>
        </div>

        {/* Sort select */}
        <div className="flex items-center gap-2">
          <label htmlFor="list-sort" className="text-scale-12-uppercase text-[--text-muted]">Sort:</label>
          <select
            id="list-sort"
            value={filters.sortBy}
            onChange={handleSortChange}
            className="h-9 px-3 border border-[--border] bg-[--card-bg] text-[13px] font-medium rounded-lg outline-none cursor-pointer focus:border-[--brand]"
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Rating: High to Low</option>
            <option value="deliveryTime">Delivery Time</option>
            <option value="costLowToHigh">Price: Low to High</option>
            <option value="costHighToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left Panel (Desktop) + Main Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* DESKTOP FILTER LEFT PANEL (Hidden on mobile) */}
        <div className="hidden md:block col-span-1 border-r border-[--border] pr-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-scale-16 text-[--text-primary]">Filters</h3>
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearFilters} 
                className="text-[12px] text-[--brand] hover:underline focus:outline-none font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filterChips.map((chip) => {
              const isActive = filters[chip.key];
              return (
                <label 
                  key={`desktop-f-${chip.key}`} 
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleFilter(chip.key)}
                    className="w-4.5 h-4.5 accent-[--brand] rounded border-[--border] text-white focus:ring-0 focus:outline-none"
                  />
                  <span className={`text-[14px] transition-colors ${
                    isActive ? 'text-[--brand] font-medium' : 'text-[--text-secondary] group-hover:text-[--text-primary]'
                  }`}>
                    {chip.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* MAIN LISTING AREA */}
        <div className="md:col-span-3 space-y-6">
          
          {/* MOBILE CHIPS BAR (Hidden on desktop) */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 hide-scrollbar border-b border-[--border]">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`h-8.5 px-3.5 text-[13px] font-medium rounded-full border flex items-center gap-1.5 flex-shrink-0 transition-colors ${
                activeFiltersCount > 0 
                  ? 'border-[--brand] bg-[#FFF5F5] dark:bg-[#2A1C1C] text-[--brand]' 
                  : 'border-[--border] bg-[--card-bg] text-[--text-primary]'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-[18px] h-[18px] rounded-full bg-[--brand] text-white text-[10px] font-semibold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {filterChips.map((chip) => {
              const isActive = filters[chip.key];
              return (
                <button
                  key={`mobile-chip-${chip.key}`}
                  onClick={() => toggleFilter(chip.key)}
                  className={`h-8.5 px-4 text-[13px] font-medium rounded-full border flex-shrink-0 flex items-center gap-1 transition-colors ${
                    isActive 
                      ? 'bg-[--brand] border-[--brand] text-white' 
                      : 'bg-[--card-bg] border-[--border] text-[--text-secondary]'
                  }`}
                >
                  {isActive && <Check size={12} />}
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Skeletons Loader */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
              {Array.from({ length: 6 }).map((_, idx) => (
                <RestaurantCardSkeleton key={idx} />
              ))}
            </div>
          )}
          {/* Empty Matches */}
          {!loading && !error && restaurants.length === 0 && (
            <EmptyState 
              title="No restaurants found" 
              description="We couldn't find any kitchen matching your active filters. Try adjusting or clearing them."
              actionLabel="Clear All Filters"
              onAction={clearFilters}
            />
          )}

          {/* Loaded Restaurants Grid */}
          {!loading && !error && restaurants.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
              {restaurants.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FILTER DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[160] flex items-end justify-center md:hidden bg-black/50 modal-overlay-enter">
          {/* Dismiss backdrop on click */}
          <div className="absolute inset-0" onClick={() => setIsFilterDrawerOpen(false)} />

          <div 
            className="relative w-full bg-[--card-bg] rounded-t-[20px] max-h-[80vh] flex flex-col overflow-hidden shadow-modal z-10 transition-transform duration-300"
            style={{ animation: 'fade-in 200ms ease-out' }}
          >
            {/* Header */}
            <div className="p-5 border-b border-[--border] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-scale-18 text-[--text-primary]">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-[--brand] text-white text-[11px] font-semibold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[--text-secondary] focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Checkbox Options Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {filterChips.map((chip) => {
                const isActive = filters[chip.key];
                return (
                  <button
                    key={`drawer-chip-${chip.key}`}
                    onClick={() => toggleFilter(chip.key)}
                    className="w-full flex items-center justify-between py-2.5 text-left focus:outline-none border-b border-[--border]/40 last:border-0"
                  >
                    <span className={`text-[15px] ${isActive ? 'text-[--brand] font-semibold' : 'text-[--text-primary]'}`}>
                      {chip.label}
                    </span>
                    <div className={`w-[20px] h-[20px] rounded border flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[--brand] border-[--brand] text-white' : 'border-[#D0D0D0] bg-transparent'
                    }`}>
                      {isActive && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sticky Drawer Footer actions */}
            <div className="p-5 border-t border-[--border] flex items-center gap-4 bg-[--card-bg]">
              <button 
                onClick={clearFilters}
                className="flex-1 h-11 text-scale-14 font-medium text-[--text-secondary] hover:text-[--text-primary] text-center focus:outline-none"
              >
                Clear All
              </button>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 h-11 bg-[--brand] hover:bg-red-600 text-white text-[15px] font-semibold rounded-lg flex items-center justify-center shadow-sm focus:outline-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
