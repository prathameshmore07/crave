import { create } from 'zustand';
import { generateReviews } from '../data/reviews';

export const useReviewStore = create((set, get) => {
  // Safe load custom user reviews from localStorage
  const loadStoredReviews = () => {
    try {
      const stored = localStorage.getItem('user_custom_reviews');
      return stored ? JSON.parse(stored) : {};
    } catch (err) {
      console.error("Error loading user reviews from localStorage:", err);
      return {};
    }
  };

  return {
    // Structure: { [restaurantId]: [review1, review2, ...] }
    customReviews: loadStoredReviews(),

    // Retrieve combined reviews (Seed reviews + Custom reviews) for a restaurant
    getReviewsForRestaurant: (restaurantId) => {
      // Generate initial template seed reviews
      const seeds = generateReviews(restaurantId).map((rev, i) => {
        const rating = rev.rating;
        const seedBase = (restaurantId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + i);
        
        // Define realistic sub-ratings for the prefilled seed reviews
        const food = rating;
        const delivery = Math.max(1, Math.min(5, (seedBase % 3 === 0) ? rating : (seedBase % 3 === 1) ? Math.max(1, rating - 1) : Math.min(5, rating + 1)));
        const packaging = Math.max(1, Math.min(5, (seedBase % 2 === 0) ? rating : Math.max(1, rating - 1)));
        
        // Determine dynamic emoji reaction based on star rating
        const emojiReaction = rating >= 5 ? "🥰" : rating >= 4 ? "🙂" : rating >= 3 ? "😐" : rating >= 2 ? "🙁" : "😠";

        // Parse seed dates into real timestamps
        let timestamp = Date.now() - (i * 24 * 60 * 60 * 1000 + 3 * 3600 * 1000);

        return {
          ...rev,
          foodQuality: food,
          deliveryExperience: delivery,
          packaging: packaging,
          isVerified: i % 3 === 0, // Mark some seeds as verified orders
          emoji: emojiReaction,
          timestamp,
          date: rev.date
        };
      });

      const custom = get().customReviews[restaurantId] || [];
      // Put custom user reviews first so they appear instantly at the top
      return [...custom, ...seeds];
    },

    // Add or update a review
    submitReview: (restaurantId, reviewData) => {
      try {
        const currentCustom = { ...get().customReviews };
        const restaurantReviews = currentCustom[restaurantId] || [];

        // Check if user already reviewed this order (by orderId) to prevent duplicate reviews
        const existingIdx = restaurantReviews.findIndex(r => r.orderId === reviewData.orderId);
        
        let updatedReviews = [...restaurantReviews];
        
        // Prevent empty review submission
        if (!reviewData.text || !reviewData.text.trim()) {
          console.warn("Attempted to submit an empty review comment.");
          return;
        }

        // Determine emoji reaction dynamically if not supplied
        const ratingNum = Number(reviewData.rating);
        const emojiReaction = reviewData.emoji || (ratingNum >= 5 ? "🥰" : ratingNum >= 4 ? "🙂" : ratingNum >= 3 ? "😐" : ratingNum >= 2 ? "🙁" : "😠");

        const newReview = {
          id: reviewData.id || `custom-rev-${Date.now()}`,
          userName: reviewData.userName || "You (Student)",
          avatar: reviewData.avatar || "U",
          rating: ratingNum,
          foodQuality: Number(reviewData.foodQuality || ratingNum),
          deliveryExperience: Number(reviewData.deliveryExperience || ratingNum),
          packaging: Number(reviewData.packaging || ratingNum),
          date: reviewData.date || "Just now",
          timestamp: reviewData.timestamp || Date.now(),
          text: reviewData.text,
          emoji: emojiReaction,
          helpfulCount: reviewData.helpfulCount || 0,
          orderId: reviewData.orderId,
          items: reviewData.items || [], // store actual items in review
          dishRatings: reviewData.dishRatings || {}, // store dish ratings in review
          isUserReview: true, // Helper flag
          isVerified: true,   // Verified purchase banner
          isEdited: existingIdx !== -1 // Add isEdited flag if modified
        };

        if (existingIdx !== -1) {
          // Edit existing review
          updatedReviews[existingIdx] = { 
            ...updatedReviews[existingIdx], 
            ...newReview, 
            date: "Edited just now",
            timestamp: Date.now()
          };
          
          // // update restaurant average after edit
          updateRestaurantRatingState(restaurantId, newReview.rating, true, restaurantReviews[existingIdx]?.rating);
        } else {
          // Append new review
          updatedReviews = [newReview, ...updatedReviews];
          
          // // save review for delivered order
          updateRestaurantRatingState(restaurantId, newReview.rating, false, null);
        }

        currentCustom[restaurantId] = updatedReviews;
        localStorage.setItem('user_custom_reviews', JSON.stringify(currentCustom));
        set({ customReviews: currentCustom });
      } catch (err) {
        console.error("Failed to submit review:", err);
      }
    },

    // Delete a review
    deleteReview: (restaurantId, orderId) => {
      try {
        const currentCustom = { ...get().customReviews };
        const restaurantReviews = currentCustom[restaurantId] || [];

        const targetReview = restaurantReviews.find(r => r.orderId === orderId);
        if (!targetReview) return;

        // Filter out target review
        const updatedReviews = restaurantReviews.filter(r => r.orderId !== orderId);
        currentCustom[restaurantId] = updatedReviews;

        // // remove review from local storage
        localStorage.setItem('user_custom_reviews', JSON.stringify(currentCustom));
        set({ customReviews: currentCustom });

        // Recalculate restaurant rating on delete properly
        updateRestaurantRatingOnDelete(restaurantId, targetReview.rating);
      } catch (err) {
        console.error("Failed to delete review:", err);
      }
    }
  };
});

// Helper to save average rating changes locally so it never loses parity and updates instantly
function updateRestaurantRatingState(restaurantId, newRating, isEdit, oldRating) {
  try {
    const ratingsCache = JSON.parse(localStorage.getItem('restaurant_ratings_cache') || '{}');
    if (!ratingsCache[restaurantId]) {
      ratingsCache[restaurantId] = {
        rating: 4.6, // Default baseline rating for calculations
        ratingCount: 150
      };
    }
    
    const curr = ratingsCache[restaurantId];
    if (isEdit && oldRating !== null) {
      // Calculate adjusted rating accurately by swapping old rating for new rating
      const sum = (curr.rating * curr.ratingCount) - Number(oldRating) + Number(newRating);
      curr.rating = parseFloat((sum / curr.ratingCount).toFixed(1));
    } else {
      // Add new rating to count
      const sum = (curr.rating * curr.ratingCount) + Number(newRating);
      curr.ratingCount += 1;
      curr.rating = parseFloat((sum / curr.ratingCount).toFixed(1));
    }
    
    ratingsCache[restaurantId] = curr;
    localStorage.setItem('restaurant_ratings_cache', JSON.stringify(ratingsCache));
  } catch (e) {
    console.error("Failed updating rating caches:", e);
  }
}

// Helper to subtract rating on deletion
function updateRestaurantRatingOnDelete(restaurantId, deletedRating) {
  try {
    const ratingsCache = JSON.parse(localStorage.getItem('restaurant_ratings_cache') || '{}');
    if (ratingsCache[restaurantId]) {
      const curr = ratingsCache[restaurantId];
      if (curr.ratingCount > 1) {
        const sum = (curr.rating * curr.ratingCount) - Number(deletedRating);
        curr.ratingCount -= 1;
        curr.rating = parseFloat((sum / curr.ratingCount).toFixed(1));
      } else {
        // Reset to default baseline
        curr.rating = 4.6;
        curr.ratingCount = 150;
      }
      ratingsCache[restaurantId] = curr;
      localStorage.setItem('restaurant_ratings_cache', JSON.stringify(ratingsCache));
    }
  } catch (e) {
    console.error("Failed to update rating on delete:", e);
  }
}
