import React, { useState, useEffect } from 'react';
import { restaurants } from '../../data/restaurants';
import RestaurantCard from '../restaurant/RestaurantCard';
import { Heart } from 'lucide-react';
import { getUserJsonItem } from '../../utils/storage';
import { useAuthStore } from '../../store/authStore';

export default function FavRestaurants() {
  const [favs, setFavs] = useState([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const favorites = getUserJsonItem('fav_restaurants', []);
    const matched = restaurants.filter(r => favorites.includes(r.id));
    setFavs(matched);
  }, [user]);

  if (favs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-4 space-y-4 max-w-md mx-auto min-h-[400px] animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-black/[0.04] dark:border-white/[0.04] text-zinc-400 flex items-center justify-center mx-auto shadow-sm">
          <Heart size={24} className="opacity-80" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">No Favourites Yet</h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">Tap the heart button on any restaurant card to save your top food spots here for instant access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">My Favourite Spots</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Quickly access the food joints you order from most frequently</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favs.map((rest) => (
          <RestaurantCard key={rest.id} restaurant={rest} />
        ))}
      </div>
    </div>
  );
}
