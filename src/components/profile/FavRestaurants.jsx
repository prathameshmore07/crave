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
      <div className="text-center py-12 px-4 space-y-3 max-w-sm mx-auto">
        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.04] text-gray-400 flex items-center justify-center mx-auto">
          <Heart size={20} />
        </div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">No Favourites Yet</h4>
        <p className="text-xs text-gray-500">Tap the heart button on any restaurant card to save your top food spots here.</p>
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
