import { restaurants as rawRestaurants } from '../data/restaurants';
import { offers } from '../data/offers';
import { useReviewStore } from '../store/reviewStore';

const RANDOM_ERROR_PROBABILITY = 0.05; // 5% chance of mock network failure

// Automatic retry helper to gracefully bypass simulated network failures (refresh bug fix!)
const simulateNetwork = async (delay, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        if (Math.random() < RANDOM_ERROR_PROBABILITY) {
          setTimeout(() => reject(new Error("Network connection lost. Retrying...")), delay / 2);
        } else {
          setTimeout(resolve, delay);
        }
      });
    } catch (err) {
      if (i === retries) {
        throw new Error("Poor internet connection. Please check your network and try again.");
      }
      console.warn(`Simulated network retry ${i + 1}/${retries}...`);
    }
  }
};

// Gets dynamically cached restaurant fields (like average rating and review counts) from local storage
const getSyncedRestaurants = () => {
  try {
    const ratingsCache = JSON.parse(localStorage.getItem('restaurant_ratings_cache') || '{}');
    return rawRestaurants.map(r => {
      if (ratingsCache[r.id]) {
        return {
          ...r,
          rating: ratingsCache[r.id].rating,
          ratingCount: `${(ratingsCache[r.id].ratingCount / 1000).toFixed(1)}K reviews`
        };
      }
      return r;
    });
  } catch (e) {
    return rawRestaurants;
  }
};

export const fetchRestaurants = async (city, filters = {}) => {
  // Graceful slow network handling with automatic retries
  await simulateNetwork(500);
  const activeRestaurants = getSyncedRestaurants();
  let result = activeRestaurants.filter(r => r.city.toLowerCase() === city.toLowerCase());

  // Filter by locality
  if (filters.locality) {
    result = result.filter(r => r.locality.toLowerCase() === filters.locality.toLowerCase());
  }

  // Search filter
  if (filters.search) {
    const query = filters.search.toLowerCase();
    
    if (query === 'healthy') {
      result = result.filter(r => 
        r.isPureVeg || 
        r.isVeg || 
        r.cuisines.some(c => {
          const cl = c.toLowerCase();
          return cl.includes('south indian') || cl.includes('cafe') || cl.includes('beverages');
        })
      );
    } else if (query === 'burger') {
      result = result.filter(r => 
        r.cuisines.some(c => {
          const cl = c.toLowerCase();
          return cl.includes('continental') || cl.includes('cafe') || cl.includes('fast food') || cl.includes('street food');
        })
      );
    } else if (query === 'thali') {
      result = result.filter(r => 
        r.cuisines.some(c => {
          const cl = c.toLowerCase();
          return cl.includes('north indian') || cl.includes('biryani') || cl.includes('south indian');
        })
      );
    } else {
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) || 
        r.cuisines.some(c => c.toLowerCase().includes(query)) ||
        r.locality.toLowerCase().includes(query)
      );
    }
  }

  // Veg/Nonveg filters
  if (filters.veg) {
    result = result.filter(r => r.isVeg === true || r.isPureVeg === true);
  }

  if (filters.nonVeg) {
    result = result.filter(r => r.isVeg === false);
  }

  if (filters.rating4Plus) {
    result = result.filter(r => r.rating >= 4.0);
  }

  if (filters.fastDelivery) {
    result = result.filter(r => r.deliveryTime < 30);
  }

  if (filters.hasOffers) {
    result = result.filter(r => r.discount !== null);
  }

  if (filters.pureVeg) {
    result = result.filter(r => r.isPureVeg === true);
  }

  // Sorting handlers
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "deliveryTime":
        result.sort((a, b) => a.deliveryTime - b.deliveryTime);
        break;
      case "costLowToHigh":
        result.sort((a, b) => a.costForTwo - b.costForTwo);
        break;
      case "costHighToLow":
        result.sort((a, b) => b.costForTwo - a.costForTwo);
        break;
      default:
        break;
    }
  }

  return result;
};

export const fetchRestaurantById = async (id) => {
  await simulateNetwork(400);
  const activeRestaurants = getSyncedRestaurants();
  const restaurant = activeRestaurants.find(r => r.id === id);
  if (!restaurant) throw new Error("Gourmet kitchen not found in this city.");
  return restaurant;
};

export const fetchOffers = async () => {
  await simulateNetwork(300);
  return offers;
};

export const fetchReviews = async (restaurantId) => {
  await simulateNetwork(400);
  // Unify seed reviews and user reviews from reviewStore
  return useReviewStore.getState().getReviewsForRestaurant(restaurantId);
};

export const submitOrder = async (orderData) => {
  // Simulate order creation in backend
  await simulateNetwork(1800);
  const orderId = `CRV-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    success: true,
    orderId,
    estimatedTime: 25, // 25 mins fast campus delivery
    ...orderData,
    date: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};
