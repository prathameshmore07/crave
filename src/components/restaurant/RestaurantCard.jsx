import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import DishImage from '../common/DishImage';

export default function RestaurantCard({ restaurant }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('fav_restaurants') || '[]');
    setIsFavorite(favorites.includes(restaurant.id));
  }, [restaurant.id]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem('fav_restaurants') || '[]');
    let newFavs = [...favorites];
    
    if (isFavorite) {
      newFavs = newFavs.filter(id => id !== restaurant.id);
      toast.info(`Removed ${restaurant.name} from Favourites`);
    } else {
      newFavs.push(restaurant.id);
      toast.success(`Added ${restaurant.name} to Favourites`);
    }

    localStorage.setItem('fav_restaurants', JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
    
    // Trigger spring scale animation
    setIsAnimate(true);
    setTimeout(() => setIsAnimate(false), 250);
  };

  // Safe checks and formatting
  const ratingText = restaurant.rating ? restaurant.rating.toFixed(1) : "0.0";
  const limitCuisines = restaurant.cuisines ? restaurant.cuisines.slice(0, 3).join(', ') : '';
  const cleanDiscount = restaurant.discount ? restaurant.discount.replace(/₹/g, 'Rs ') : null;
  const costForTwoText = `Rs ${restaurant.costForTwo} for two`;
  const isClosed = restaurant.isOpen === false;
  const isSpecial = restaurant.isSpecial || restaurant.name === "ITM Canteen";

  return (
    <Link 
      to={`/restaurant/${restaurant.id}`}
      className={`group block w-full bg-[--card-bg] rounded-[20px] overflow-hidden transition-all duration-300 ease-out focus:outline-none relative ${
        isSpecial 
          ? 'border-2 border-amber-500/40 dark:border-amber-400/30 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.15)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.25)] hover:border-amber-500 dark:hover:border-amber-400 scale-[1.01] hover:scale-[1.03]' 
          : 'border border-black/[0.03] dark:border-white/[0.03] hover:-translate-y-1 hover:shadow-lg'
      }`}
    >
      {/* Special Highlights Layer for ITM Canteen */}
      {isSpecial && (
        <div className="absolute top-[12px] left-[12px] z-20 flex flex-col gap-1.5 items-start">
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
            ★ TRENDING STUDENT FAV
          </span>
          {cleanDiscount && (
            <span className="bg-[#1C1C1C]/90 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-[4px] backdrop-blur-sm">
              {cleanDiscount}
            </span>
          )}
        </div>
      )}

      {/* Image Area */}
      <div className="relative h-[190px] w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
        <DishImage
          src={restaurant.imageUrl}
          alt={restaurant.name}
          dishName={restaurant.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay bottom 80px */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[80px]"
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.25), transparent)'
          }}
        />

        {/* Closed Overlay */}
        {isClosed && (
          <div className="absolute inset-0 bg-white/55 dark:bg-black/55 flex items-center justify-center z-10">
            <div className="bg-[#1C1C1C] text-white text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Closed now
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-[12px] right-[12px] w-8 h-8 rounded-full backdrop-blur-md bg-white/75 dark:bg-black/60 border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center focus:outline-none z-20 hover:scale-105 hover:bg-white dark:hover:bg-black transition-all ${
            isAnimate ? 'favorite-toggle-active' : ''
          }`}
          aria-label="Toggle Favorite"
        >
          <Heart 
            size={15} 
            className={`transition-colors duration-200 ${
              isFavorite 
                ? 'fill-[--brand] text-[--brand]' 
                : 'text-[--text-muted]'
            }`} 
          />
        </button>

        {/* Discount Badge (Normal restaurant) */}
        {cleanDiscount && !isClosed && !isSpecial && (
          <div className="absolute bottom-[12px] left-[12px] bg-[--brand] text-white px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider z-10 shadow-xs">
            {cleanDiscount}
          </div>
        )}
      </div>

      {/* Pure Veg Banner */}
      {restaurant.isPureVeg && (
        <div className="h-[28px] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] flex items-center px-4 gap-2 border-b border-black/[0.03] dark:border-white/[0.03]">
          <span className="indicator-veg flex-shrink-0" />
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            PURE VEG
          </span>
        </div>
      )}

      {/* Card Body */}
      <div className={`pt-[14px] px-[16px] pb-[16px] flex flex-col ${isSpecial ? 'bg-amber-500/[0.02] dark:bg-amber-400/[0.01]' : ''}`}>
        {/* Name */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-scale-16 text-[--text-primary] font-semibold truncate mb-0.5">
            {restaurant.name}
          </h3>
          {isSpecial && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/10 shrink-0">
              CAMPUS FAV
            </span>
          )}
        </div>

        {/* Cuisines */}
        <p className="text-scale-14 text-[--text-secondary] truncate mb-2">
          {limitCuisines}
        </p>

        {/* Tags Row for ITM Canteen */}
        {isSpecial && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {["College Vibe", "Late Night", "Budget Friendly"].map(t => (
              <span key={t} className="text-[9px] bg-gray-100 dark:bg-neutral-800 text-[--text-secondary] px-2 py-0.5 rounded-full font-medium border border-black/[0.03] dark:border-white/[0.03]">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Metadata Row */}
        <div className="flex items-center text-scale-13 text-[--text-secondary] mt-[4px]">
          <div className="flex items-center gap-0.5 text-[--brand] font-semibold mr-1.5 flex-shrink-0">
            <Star size={12} className="fill-current" />
            <span>{ratingText}</span>
          </div>
          
          <span className="text-[--text-muted] mx-1 flex-shrink-0">·</span>
          <span className="truncate mr-1.5 flex-shrink-0">
            {restaurant.deliveryTime ? `${restaurant.deliveryTime} mins` : "25 mins"}
          </span>
          
          <span className="text-[--text-muted] mx-1 flex-shrink-0">·</span>
          <span className="truncate text-[--text-secondary]">
            {costForTwoText}
          </span>
        </div>
      </div>
    </Link>
  );
}
