const reviewTemplates = [
  "Amazing food quality! Delivered hot and fresh. Will definitely order again.",
  "Loved the flavors. Authentic taste, generous portions. Highly recommended!",
  "Good food but delivery took slightly longer than expected. Taste was excellent.",
  "Perfect lunch option. Everything was well-packed and tasted great.",
  "The biryani was absolutely fantastic. Best I've had from any delivery app.",
  "Decent food, nothing extraordinary. Packaging could be better.",
  "Excellent taste and value for money. The gravy dishes were outstanding.",
  "Fresh ingredients and authentic spices. You can taste the difference.",
  "Ordered for a family gathering. Everyone loved it! Great portions.",
  "The paneer dishes are a must-try. Soft, creamy, and flavorful.",
  "Consistent quality every time I order. My go-to restaurant for weekends.",
  "The kebabs were juicy and perfectly spiced. Naan was fresh and soft.",
  "Good variety on the menu. Tried the thali and it was a complete meal.",
  "Fast delivery and great taste. The dal makhani was heavenly.",
  "Slightly oily but tasty. Would recommend the starters over main course."
];

const names = ["Arjun M.", "Priya S.", "Rahul K.", "Sneha R.", "Vikram T.", "Ananya P.", "Karthik N.", "Divya L.", "Rohit G.", "Meera V.", "Aditya B.", "Kavya D.", "Nikhil J.", "Pooja W.", "Sameer H."];

const dates = ["2 days ago", "1 week ago", "2 weeks ago", "3 weeks ago", "1 month ago", "2 months ago", "3 days ago", "5 days ago", "4 weeks ago", "6 days ago", "10 days ago", "2 months ago", "1 week ago", "3 weeks ago", "1 month ago"];

const itmCanteenReviews = [
  {
    id: "navimumbai-kharghar-1-rev-1",
    userName: "Prathamesh",
    avatar: "P",
    rating: 5,
    date: "2 days ago",
    text: "Cheese Dosa had enough oil to slide into another dimension.",
    helpfulCount: 489,
    isTopReviewer: true,
    isTrendingReviewer: true,
    isVerified: true,
    foodQuality: 5,
    deliveryExperience: 5,
    packaging: 5,
    emoji: "🔥",
    items: [{ name: "Cheese Dosa", quantity: 1 }],
    reactions: { laugh: 215, heart: 98, fire: 145 },
    timestamp: Date.now() - 2 * 24 * 3600 * 1000
  },
  {
    id: "navimumbai-kharghar-1-rev-2",
    userName: "Om",
    avatar: "D",
    rating: 4,
    date: "3 days ago",
    text: "NMIMS Canteen Review ❌ ITM Canteen Review ✅",
    helpfulCount: 189,
    isVerified: true,
    foodQuality: 4,
    deliveryExperience: 4,
    packaging: 5,
    emoji: "😋",
    items: [{ name: "Cold Coffee", quantity: 1 }],
    reactions: { laugh: 85, heart: 24, fire: 12 },
    timestamp: Date.now() - 3 * 24 * 3600 * 1000
  },
  {
    id: "navimumbai-kharghar-1-rev-3",
    userName: "Vyom",
    avatar: "V",
    rating: 4,
    date: "5 days ago",
    text: "Paneer Fried Rice had paneer sightings, not paneer pieces.",
    helpfulCount: 145,
    isVerified: true,
    foodQuality: 4,
    deliveryExperience: 4,
    packaging: 4,
    emoji: "🍚",
    items: [{ name: "Paneer Fried Rice", quantity: 1 }],
    reactions: { laugh: 72, heart: 18, fire: 9 },
    timestamp: Date.now() - 5 * 24 * 3600 * 1000
  },
  {
    id: "navimumbai-kharghar-1-rev-4",
    userName: "Danish",
    avatar: "D",
    rating: 4,
    date: "6 days ago",
    text: "Burger bun looked freshly sat on.",
    helpfulCount: 98,
    isVerified: true,
    foodQuality: 3,
    deliveryExperience: 5,
    packaging: 4,
    emoji: "🍔",
    items: [{ name: "Veg Burger", quantity: 1 }],
    reactions: { laugh: 61, heart: 14, fire: 6 },
    timestamp: Date.now() - 6 * 24 * 3600 * 1000
  },
  {
    id: "navimumbai-kharghar-1-rev-5",
    userName: "Aareen",
    avatar: "A",
    rating: 1,
    date: "1 week ago",
    text: "Aaichya Hatcha Majhya Avdicha #AHMA gang",
    helpfulCount: 86,
    isVerified: true,
    foodQuality: 4,
    deliveryExperience: 3,
    packaging: 4,
    emoji: "🍹",
    items: [{ name: "Mojito", quantity: 1 }],
    reactions: { laugh: 58, heart: 15, fire: 5 },
    timestamp: Date.now() - 7 * 24 * 3600 * 1000
  },
  {
    id: "navimumbai-kharghar-1-rev-6",
    userName: "Ronak",
    avatar: "R",
    rating: 5,
    date: "10 days ago",
    text: "Triple Schezwan Fried Rice looked dangerous but disappeared instantly.",
    helpfulCount: 77,
    isVerified: true,
    foodQuality: 5,
    deliveryExperience: 5,
    packaging: 5,
    emoji: "🔥",
    items: [{ name: "Triple Schezwan Fried Rice", quantity: 1 }],
    reactions: { laugh: 51, heart: 11, fire: 19 },
    timestamp: Date.now() - 10 * 24 * 3600 * 1000
  },
  {
    id: "navimumbai-kharghar-1-rev-7",
    userName: "Dev",
    avatar: "D",
    rating: 4,
    date: "2 weeks ago",
    text: "Packaging cleaner than the kitchen probably.",
    helpfulCount: 65,
    isVerified: true,
    foodQuality: 4,
    deliveryExperience: 4,
    packaging: 4,
    emoji: "📦",
    items: [{ name: "Paneer Dosa", quantity: 1 }],
    reactions: { laugh: 45, heart: 8, fire: 4 },
    timestamp: Date.now() - 14 * 24 * 3600 * 1000
  },
  {
    id: "navimumbai-kharghar-1-rev-8",
    userName: "Nishi",
    avatar: "N",
    rating: 5,
    date: "2 weeks ago",
    text: "The only consistently fresh item here is packaged chips.",
    helpfulCount: 43,
    isVerified: true,
    foodQuality: 5,
    deliveryExperience: 4,
    packaging: 4,
    emoji: "🍟",
    items: [{ name: "Oreo Shake", quantity: 1 }],
    reactions: { laugh: 39, heart: 7, fire: 3 },
    timestamp: Date.now() - 16 * 24 * 3600 * 1000
  },
  {
    id: "navimumbai-kharghar-1-rev-9",
    userName: "Nandeni",
    avatar: "N",
    rating: 4,
    date: "3 weeks ago",
    text: "Delicious Food",
    helpfulCount: 38,
    isVerified: true,
    foodQuality: 4,
    deliveryExperience: 4,
    packaging: 4,
    emoji: "🥔",
    items: [{ name: "Fries", quantity: 1 }],
    reactions: { laugh: 31, heart: 10, fire: 2 },
    timestamp: Date.now() - 21 * 24 * 3600 * 1000
  },
  {
    id: "navimumbai-kharghar-1-rev-10",
    userName: "Swaraj",
    avatar: "S",
    rating: 5,
    date: "3 weeks ago",
    text: "Pizza cheese stretching harder than the budget.",
    helpfulCount: 31,
    isVerified: true,
    foodQuality: 5,
    deliveryExperience: 5,
    packaging: 4,
    emoji: "🍕",
    items: [{ name: "Cheese Dosa", quantity: 1 }],
    reactions: { laugh: 29, heart: 8, fire: 4 },
    timestamp: Date.now() - 22 * 24 * 3600 * 1000
  }
];

export function generateReviews(restaurantId) {
  if (restaurantId === "navimumbai-kharghar-1") {
    return itmCanteenReviews;
  }

  const seed = restaurantId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: 15 }, (_, i) => ({
    id: `${restaurantId}-rev-${i}`,
    userName: names[(seed + i) % names.length],
    avatar: names[(seed + i) % names.length].split(' ').map(n => n[0]).join(''),
    rating: [4, 5, 3, 5, 4, 4, 5, 3, 4, 5, 4, 5, 3, 4, 5][(seed + i) % 15],
    date: dates[(seed + i) % dates.length],
    text: reviewTemplates[(seed + i) % reviewTemplates.length],
    helpfulCount: ((seed * (i + 1)) % 42),
    timestamp: Date.now() - (i * 24 * 60 * 60 * 1000 + 3 * 3600 * 1000)
  }));
}
