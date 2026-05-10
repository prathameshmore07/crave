# 🍔 Crave — Premium Food Delivery Experience

A modern, fully-featured food delivery application built with React and Vite. Browse restaurants, customize orders, and track deliveries in real-time with a seamless, production-ready interface.

> **Problem Solved:** Providing users with a premium food ordering experience that combines beautiful UI, intelligent cart management, real-time tracking, and verified community reviews.

---

## 📋 Overview

Crave is a comprehensive food delivery platform that simulates a production-grade ordering system. The application focuses on delivering an intuitive user experience with realistic workflows, dynamic menu management, and detailed order tracking.

### Why Crave?
- **Realistic UX:** Built to mirror industry-standard food delivery apps like Zomato and Swiggy
- **Smart Workflows:** Intelligent cart system prevents accidental restaurant switching
- **Live Tracking:** Visual progress tracking with simulated delivery stages
- **Community Trust:** Verified purchase reviews with real user feedback
- **Smooth Experience:** Premium animations and transitions throughout the app

---

## ✨ Features

### 🏪 Restaurant Discovery
- Browse curated restaurants with live ratings and delivery times
- Filter by cuisine type (South Indian, Chinese, North Indian, Fast Food, etc.)
- Search overlay for quick restaurant lookup
- City-based restaurant availability
- Restaurant detail pages with full menu information

### 🛒 Smart Cart System
- **Intelligent Restaurant Switching:** Prompts to replace cart when selecting items from different restaurants
- **Item Customizations:** Add special instructions and dietary preferences
- **Real-time Calculations:** Live subtotal, GST, delivery fees, and platform charges
- **Persistent State:** Cart survives page refreshes via localStorage
- **Coupon System:** Apply discount codes for instant savings
- **Tip Selection:** Flexible tipping options for delivery partners

### 📍 Advanced Checkout Flow
- **Multi-step Process:** Address selection → Payment method → Processing
- **Saved Addresses:** Store and manage multiple delivery addresses
- **Payment Options:** Support for multiple payment methods
- **Order Confirmation:** Detailed bill summary with itemized charges
- **Error Handling:** Graceful fallbacks and validation

### 🚚 Real-time Order Tracking
- **5-Stage Progress Tracking:**
  1. Order placed & kitchen notification
  2. Chef confirmation & prep starts
  3. Active cooking & ingredient prep
  4. Ready for pickup with hot packaging
  5. Rider in transit on optimized route
- **Live ETA Timer:** Countdown to estimated delivery
- **Rider Information:** View delivery partner details and contact
- **Order Status Map:** Visual progress bar with detailed stage descriptions

### ⭐ Verified Review System
- **Purchase-Verified Reviews:** Only customers who ordered can review
- **Rich Media:** Upload dish images with reviews
- **Edit & Delete:** Modify or remove reviews anytime
- **Community Ratings:** Aggregate star ratings with distribution
- **Authentic Feedback:** Verified badges for trustworthy reviews
- **ITM Canteen Easter Eggs:** Humorous community reviews for on-campus dining

### 👤 User Profile & History
- **Order History:** Complete list of past orders with details
- **Reorder Feature:** One-click reordering of favorite meals
- **Saved Addresses:** Manage delivery address book
- **Favorite Restaurants:** Bookmark and quick-access loved eateries
- **Account Settings:** Manage user preferences and login status
- **Theme Support:** Dark/light mode for comfortable browsing

### 🔍 Search & Filtering
- **Global Search:** Find restaurants and cuisines instantly
- **Cuisine Filters:** Browse by food category preferences
- **Rating Filters:** Find top-rated establishments
- **Price Filters:** Filter by delivery fees and price ranges
- **Debounced Search:** Optimized search performance

### 🎨 UI/UX Highlights
- **Premium Animations:** Smooth transitions and micro-interactions via Framer Motion
- **Shimmer Effects:** Loading skeletons for excellent perceived performance
- **Responsive Design:** Mobile-first, works flawlessly on all devices
- **Dark UI:** Modern dark mode with accessibility in mind
- **Toast Notifications:** Non-intrusive feedback via Sonner
- **Intuitive Navigation:** Bottom tab nav for mobile, header for desktop

### 📸 Dynamic Image System
- **Smart Image Fallbacks:** Categorized food image mapping
- **Lazy Loading:** Optimized rendering for performance
- **Unsplash Integration:** High-quality dish photography
- **Fallback Keywords:** Auto-suggests relevant images if item not found
- **DishImage Component:** Reusable, intelligent image resolver

### 💳 Payment Flow
- **Branded Payment Interface:** Cohesive design with company branding
- **Multiple Methods:** Cards, UPI, wallets, and cash on delivery
- **Order Processing:** Real-time processing state with animations
- **Confirmation Tracking:** Immediate redirect to tracking post-purchase

### 📱 Responsive & Accessible
- **Mobile-First Design:** Optimized for all screen sizes
- **Touch-Friendly:** Large tap targets and gesture support
- **Keyboard Navigation:** Full keyboard accessibility
- **Semantic HTML:** Proper heading hierarchy and ARIA labels
- **Performance:** Optimized for fast loading and smooth interactions

---

## 🛠 Tech Stack

### Frontend Framework
- **React 18.3** — Modern UI library with hooks
- **Vite 5.4** — Lightning-fast build tool and dev server

### State Management
- **Zustand** — Lightweight, scalable state store
  - Cart management
  - Authentication state
  - UI toggles (modals, drawers)
  - Order tracking
  - Reviews

### Styling & Animation
- **Tailwind CSS** — Utility-first styling framework
- **Framer Motion** — Production-grade animation library
- **PostCSS & Autoprefixer** — CSS processing pipeline

### Routing & Forms
- **React Router 6** — Client-side routing
- **React Hook Form** — Efficient form state management
- **Zod** — TypeScript-first schema validation

### UI Components & Icons
- **Lucide React** — 1000+ beautiful, consistent icons
- **Sonner** — Toast notifications with superior UX

### Development Tools
- **ESLint** — Code quality and consistency
- **React Hooks Linter** — Hook best practices enforcement

### Data Persistence
- **localStorage** — Client-side data caching
- **Session State** — Transient UI state management

---

## 📁 Folder Structure

```
crave/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── cart/             # Cart UI and interactions
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── FloatingCart.jsx
│   │   │   ├── BillSummary.jsx
│   │   │   ├── CouponInput.jsx
│   │   │   ├── TipSelector.jsx
│   │   │   └── ReplaceCartModal.jsx
│   │   ├── checkout/         # Checkout flow components
│   │   │   ├── AddressStep.jsx
│   │   │   ├── PaymentStep.jsx
│   │   │   └── ProcessingStep.jsx
│   │   ├── restaurant/       # Restaurant & menu components
│   │   │   ├── RestaurantCard.jsx
│   │   │   ├── MenuItem.jsx
│   │   │   ├── CustomizeModal.jsx
│   │   │   └── ReviewCard.jsx
│   │   ├── tracking/         # Order tracking components
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ETATimer.jsx
│   │   │   └── RiderCard.jsx
│   │   ├── profile/          # User profile components
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── SavedAddresses.jsx
│   │   │   └── FavRestaurants.jsx
│   │   ├── search/           # Search functionality
│   │   │   └── SearchOverlay.jsx
│   │   ├── home/             # Homepage components
│   │   │   ├── HeroBanner.jsx
│   │   │   ├── CuisineTiles.jsx
│   │   │   └── OfferStrip.jsx
│   │   └── common/           # Shared components
│   │       ├── Header.jsx
│   │       ├── BottomNav.jsx
│   │       ├── Footer.jsx
│   │       ├── CityModal.jsx
│   │       ├── DishImage.jsx
│   │       ├── Skeleton.jsx
│   │       ├── EmptyState.jsx
│   │       ├── ErrorState.jsx
│   │       ├── NotificationDrawer.jsx
│   │       └── SupportDrawer.jsx
│   ├── pages/                # Route pages
│   │   ├── Home.jsx
│   │   ├── RestaurantList.jsx
│   │   ├── RestaurantDetail.jsx
│   │   ├── Checkout.jsx
│   │   ├── Tracking.jsx
│   │   ├── Profile.jsx
│   │   ├── Auth.jsx
│   │   └── NotFound.jsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   └── useScrollPosition.js
│   ├── store/                # Zustand state stores
│   │   ├── cartStore.js
│   │   ├── authStore.js
│   │   ├── cityStore.js
│   │   ├── orderStore.js
│   │   ├── reviewStore.js
│   │   ├── notificationStore.js
│   │   └── uiStore.js
│   ├── utils/                # Utility functions
│   │   ├── formatPrice.js
│   │   ├── formatTime.js
│   │   ├── getRatingColor.js
│   │   └── getSpiceLabel.js
│   ├── data/                 # Mock data & constants
│   │   ├── restaurants.js
│   │   ├── cities.js
│   │   ├── offers.js
│   │   ├── reviews.js
│   │   └── riders.js
│   ├── services/             # API integration layer
│   │   └── api.js
│   ├── assets/               # Images, logos, etc.
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn/pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/crave.git
cd crave
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

4. **Build for production**
```bash
npm run build
```

5. **Preview production build**
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 5.4.10 | Build tool |
| Zustand | 4.5.7 | State management |
| React Router | 6.30.3 | Client routing |
| Tailwind CSS | 3.4.19 | Styling |
| Framer Motion | 11.18.2 | Animations |
| React Hook Form | 7.75.0 | Form handling |
| Zod | 4.4.3 | Schema validation |
| Lucide React | 1.14.0 | Icon library |
| Sonner | 2.0.7 | Notifications |

---

## 🎯 Performance Optimizations

### Component Optimization
- **Memoization:** React.memo prevents unnecessary re-renders
- **Zustand Selectors:** Granular state subscriptions minimize re-renders
- **Code Splitting:** Route-based lazy loading (via React Router)

### Rendering Performance
- **Shimmer Skeletons:** Loading states feel faster than they are
- **Image Lazy Loading:** DishImage component uses native lazy loading
- **Debounced Search:** Prevents excessive re-renders during typing

### Data Caching
- **localStorage Persistence:** Cart, auth, addresses cached locally
- **Memoized Selectors:** Zustand prevents redundant calculations
- **Reusable Components:** MenuItems, ReviewCards fully composable

### Build Optimization
- **Vite Optimizations:** Pre-bundling, code splitting, tree-shaking
- **Tailwind Purge:** Only shipped CSS for used utilities
- **Image Optimization:** Unsplash URLs with compression params

---

## 🔄 Order Flow

### Cart Logic
1. User browses restaurants and adds items
2. System detects restaurant switch and shows interceptor modal
3. User confirms to replace cart or cancel
4. Items accumulate in cart with customizations
5. Cart persists across sessions

### Checkout Flow
1. **Step 1 - Address:** Select or add delivery address
2. **Step 2 - Payment:** Choose payment method
3. **Step 3 - Processing:** Real-time order confirmation
4. System generates order ID and rider assignment
5. User redirected to tracking page

### Tracking Flow
1. Order placed → Kitchen notification stage
2. Chef confirms → Preparation starts
3. Active cooking → Ingredients being prepped
4. Ready for pickup → Hot packaging complete
5. Rider in transit → Live delivery tracking
6. Post-delivery → Review prompt shown

### Review System
1. User can only review after delivery completes
2. Select star rating (1-5 stars)
3. Upload dish image (optional)
4. Add detailed comment
5. Submit for community visibility
6. Edit/delete own reviews anytime

---

## 🖼 Image System

### Dynamic Image Resolution
The app implements an intelligent image system with multiple fallback layers:

```
Priority 1: Static mapping (menuItemImages)
Priority 2: Item name pattern matching (e.g., "dosa" → dosa image)
Priority 3: Category-based fallback (cuisine type)
Priority 4: Generic food placeholder
```

### Benefits
- **No Broken Images:** Always displays relevant imagery
- **Performance:** Lazy loading with Unsplash compression
- **Customization:** Easy to add static images per restaurant
- **Recovery:** Automatic fallback if primary source fails

---

## ⭐ Reviews & Rating System

### Features
- **Verified Purchases:** Only users with completed orders can review
- **Rich Content:** Support for star ratings, text, and images
- **Community Moderation:** Edit/delete your own reviews
- **Rating Distribution:** Aggregate stats (1⭐ through 5⭐)
- **Authentic Feedback:** Real user voices shape restaurant reputation

### Review Editing
Users can modify reviews even after submission, allowing for corrections or updated feedback based on subsequent visits.

---

## 🎨 UI/UX Principles

### Design System
- **Color Palette:** Modern dark UI with brand accent colors
- **Typography:** Clear hierarchy with readable font sizes
- **Spacing:** Consistent padding and margins via Tailwind utilities
- **Icons:** Lucide React for consistent 24px icons

### Animations
- **Page Transitions:** Smooth route changes
- **Modal Animations:** Entrance and exit animations
- **Loading States:** Shimmer effects and skeleton screens
- **Interactions:** Hover states and tap feedback

### Accessibility
- **Keyboard Navigation:** Full keyboard support
- **Color Contrast:** WCAG AA compliant
- **Semantic HTML:** Proper heading structure
- **ARIA Labels:** Screen reader support where needed

---

## 🚀 Deployment

### Environment Setup
Create a `.env.local` file (not committed):
```bash
VITE_API_BASE_URL=https://api.example.com
VITE_MAPS_API_KEY=your_maps_api_key
```

### Deployment Options
- **Vercel:** Zero-config deployment
- **Netlify:** Git-based CI/CD
- **GitHub Pages:** Static hosting
- **AWS S3 + CloudFront:** Scalable CDN

### Build Output
```bash
npm run build
# Output in dist/ directory, ready for deployment
```

---

## 🐛 Known Challenges & Solutions

### Challenge 1: Image Mapping
- **Issue:** Different restaurants use different dish names for similar items
- **Solution:** Multi-layer fallback with keyword matching and category defaults

### Challenge 2: Cart Synchronization
- **Issue:** Preventing accidental mixing of orders from different restaurants
- **Solution:** Interceptor modal with clear UX for switching

### Challenge 3: Review State Management
- **Issue:** Managing edit/delete states across sessions
- **Solution:** Zustand store with localStorage persistence

### Challenge 4: Real-time Tracking
- **Issue:** Simulating realistic delivery progression
- **Solution:** Time-based stage transitions with visual feedback

### Challenge 5: Payment Flow Consistency
- **Issue:** Maintaining state across checkout steps
- **Solution:** Zustand store with validation at each step

---

## 🔮 Future Enhancements

### Backend Integration
- [ ] Real backend API integration
- [ ] Database for persistent order storage
- [ ] Authentication with JWT tokens
- [ ] Real payment gateway (Stripe, Razorpay)

### Advanced Features
- [ ] Live maps with delivery partner tracking
- [ ] Push notifications for order updates
- [ ] AI-powered recommendations
- [ ] Loyalty program & rewards
- [ ] Subscription/meal plans

### Platform Expansion
- [ ] Delivery partner mobile app
- [ ] Restaurant admin dashboard
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] Voice ordering

### Performance
- [ ] Service Worker for offline support
- [ ] Optimized image serving
- [ ] GraphQL API optimization
- [ ] Progressive Web App (PWA)

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
   ```bash
   git clone https://github.com/prathameshmore07/crave.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Write descriptive commit messages
- Test on mobile devices

### Before Submitting PR
- Run `npm run lint`
- Test all user flows
- Check mobile responsiveness
- Verify console for errors

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 👤 Author

**Prathamesh More**

- GitHub: [@prathamesh](https://github.com/prathameshmore07)

---

## 🙏 Acknowledgments

- Inspired by industry-leading delivery platforms
- UI/UX best practices from Zomato, Swiggy, DoorDash
- Community feedback and contributions
- Open source libraries that power this app

---

© Prathamesh More. All rights reserved.
