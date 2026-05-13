# 🍔 CRAVE — Premium Food Delivery Platform

A production-ready, highly interactive food delivery platform tailored for campus communities. Designed with a mobile-first philosophy, CRAVE mirrors industry standards (Zomato/Swiggy) with premium dark-mode aesthetics, rich micro-interactions, and robust state management.

Along with standard delivery features, CRAVE hosts a suite of advanced modern utilities—including a **Tinder-style Food Explorer Card Swiper**, a **Group Split-Bill Engine**, a **Real-Time Delivery Captain Simulation**, and a **Live AI Support chatbot powered by Gemini 2.5 Flash**.

---

## 📋 Project Overview

CRAVE is a modern Single Page Application (SPA) designed to solve the friction of campus food ordering. It addresses the needs of students and campus residents by merging high-fidelity food discovery with student-centric features such as custom memberships and group billing splits.

---

## 👥 Group Members
- Prathamesh More
- Prince Singh
- Sneha Chaturvedi
- Swaraj Jadhav

---

## 🛠 Tech Stack

### Core Frameworks & Tooling
* **React 18.3** — Modern component architecture using hooks and state synchronization.
* **Vite 5.4** — Supercharged dev environment and optimized production bundling.
* **React Router Dom v6** — Client-side declarative routing and navigation flows.

### State Management & Persistence
* **Zustand** — High-performance, atomic, store-based state management that powers the cart, auth, reviews, and tracking lifecycles.
* **Zustand Persist Middleware** — Enforces secure account-isolated `localStorage` persistence so user carts, addresses, review logs, and chat threads survive tab closures.

### CSS Styles & Animations
* **Vanilla CSS / Utility Tailwind CSS** — Deep styling integration combining sleek dark themes, glassmorphism, responsive flex/grid layouts, and customized scrollbars.
* **Framer Motion** — Powers layout animations, slide-out drawers, swipe gestures, and transitions.

### Key Libraries
* **Google Gemini API REST Client** — Powers the contextual AI live-chat support and rider dialogue systems.
* **Lucide React** — Elegant, scalable icon sets.
* **Sonner** — Beautiful toast alerts.
* **React Hook Form** — Robust validation for forms (addresses, card checkout, feedback).

---

## ✨ Core Implemented Features

### 1. Restaurant and Menu Browsing
Users can discover local campus dining halls and premium partner kitchens. Each restaurant displays a customized cover, delivery speed estimation, aggregate stars, and pricing range. Clicking into a restaurant reveals an intuitive menu segmented by categories, complete with dietary indicators (Veg/Non-Veg) and spice rankings.

### 2. Cart Management and Checkout
CRAVE implements an intelligent, transactional shopping cart. Adding items calculates real-time subtotal, GST (18%), packaging charges (₹15), platform commission (₹5), and delivery fees. The checkout is structured into a multi-step secure processing tunnel: Address → Payment Method Selection → Secure Full-Screen Processing Page → Order Confirmation.

### 3. Order Status and History
A complete, persistent history of all past transactions. Users can check details of any past order, inspect the itemized billing receipt, and review the timestamps of deliveries.

### 4. Cuisine and Rating Filters
Enables fine-grained search optimization. Users can filter listings by specialized cuisines (South Indian, North Indian, Chinese, Beverages, Fast Food) or sort restaurants based on ratings (4.0+ Stars), preparation speed, and delivery price thresholds.

### 5. Delivery Address Management
A robust address book component built into the user profile. Users can add, edit, and delete multiple localized addresses (such as Hostel Room, Library Desk, or Tech Park Block). Addresses are saved securely under their specific account.

### 6. Special Instructions
At the cart drawer, users can input customized kitchen briefs (e.g., *"Make it extra spicy"*, *"No onions"*) and rider drops (e.g., *"Leave at hostel security"*). These parameters propagate dynamically into the system context.

### 7. Reorder Favorite Meals
The order history page provides an instant one-click **Reorder Button**. Clicking it extracts the exact culinary combination from a past receipt, validates restaurant availability, and re-hydrates the cart instantly to expedite checking out.

### 8. Estimated Delivery Time UI
The tracking terminal displays a prominent countdown timer. It computes the Delivery ETA dynamically depending on preparation stages and real-time transit conditions, complete with a countdown ticking down to the minute of arrival.

---

## 🚀 Advanced Unique Features

CRAVE stands out as a high-end application due to several bespoke systems designed to mimic production-ready apps:

### 🎴 1. Food Explorer Swipe Engine
* **The Experience:** A Tinder-inspired food discovery engine. Users are presented with a stack of beautiful card layouts depicting top campus dishes. Swiping right likes and bookmarks the dish; swiping left passes; swiping up instantly adds that specific dish to their active cart.
* **Why it's unique:** Elevates boring list layouts into a gamified, gesture-driven discovery journey. Implemented using custom pointer gesture handlers and high-performance translation animations in Framer Motion.

### 💸 2. Split Bill System
* **The Experience:** Splitting food bills with campus friends is made frictionless. Inside the Checkout page, users can activate the Split Bill engine, type in multiple friends' names, and see the bill divided into equal or custom shares in real-time.
* **Why it's unique:** Supports instant copyable share links and displays individual QR-codes or payment shortcuts. Solves a major friction point for students dining together.

### 🤖 3. AI Chat Support using Gemini API (Gemini 2.5 Flash)
* **The Experience:** Features a fully working live chat console utilizing the ultra-fast `gemini-2.5-flash` model. 
* **Customer Support Roleplay:** Users chat with "Rohan", a premium support agent who is aware of their name, payment type, active restaurant, order items, and ETA. He provides helpful answers and can issue discount coupon codes (`CRAVECARE150`) for wrong or delayed orders.
* **Delivery Rider Simulation:** Users can toggle a direct chat with their assigned rider. The assistant roleplays like a real delivery partner (short, casual, delivery-focused text such as *"Almost there"*, *"Stuck in rain near block"*).
* **Robust Fail-Safe Protocol:** If the Gemini API key is missing, unconfigured, or the network request fails, the console prints clean logs, and the UI displays strictly a clean, non-intrusive message: **`"Support is temporarily unavailable."`**

### 👑 4. Membership Subscription Ecosystem
* **The Experience:** A fully designed membership landing hub and profile manager where users can subscribe to student-centric tier structures:
  * **STUDENT PREMIUM** (20% flat food discounts, free campus delivery, waived platform fees)
  * **CRAVE PRO** (15% flat food discounts, free delivery, priority support routing)
* **Why it's unique:** Implements realistic student verification (restricting the Student plan to `.edu`, `.edu.in`, or `.ac.in` domains) and supports dynamic cycle durations (Monthly, Half-Yearly, Yearly) with live savings summaries, renewal date count, and auto-renew toggle states in their profile dashboard.

### 🚚 5. Dynamic 5-Stage Order Tracking
* **The Experience:** Rather than static text, the tracking suite triggers a multi-stage active cooking and transit countdown:
  1. **Order Placed** — Transmitted to kitchen liaison desk.
  2. **Chef Confirmed** — Fresh kitchen ingredients checked and preparation starts.
  3. **Active Cooking** — Visual frying pan/steam simulation.
  4. **Ready for Pickup** — Packed securely inside thermal hot-bags.
  5. **Out for Delivery** — Active rider transit simulation.
* **Why it's unique:** Includes a beautiful simulated progress bar, dynamic text prompts, and integrates seamlessly with the active delivery rider live chat.

---

## 📁 Folder Structure

```
crave/
├── public/                    # Static assets (logos, icons, system images)
├── src/
│   ├── components/
│   │   ├── cart/             # Cart UI, BillSummary, TipSelector, Coupon System
│   │   ├── checkout/         # Address, Payment, and Secure Processing steps
│   │   ├── restaurant/       # Restaurant Card, MenuItem, ReviewCard
│   │   ├── tracking/         # Visual Progress Bar, ETATimer, RiderCard
│   │   ├── profile/          # OrderHistory, SavedAddresses, FavRestaurants
│   │   ├── search/           # Global overlay search component
│   │   ├── home/             # Hero banner, food categories grid
│   │   └── common/           # Header, Footer, BottomNav, SupportDrawer, DishImage
│   ├── pages/                # Route components (Home, Tracking, Profile, Membership, etc.)
│   ├── hooks/                # Custom React hooks (useDebounce, useLocalStorage)
│   ├── store/                # Zustand client state (auth, cart, order, reviews, membership)
│   ├── services/             # API layer and Gemini REST integration (geminiService.js)
│   ├── data/                 # Local data models (restaurants lists, riders metadata, reviews)
│   ├── App.jsx               # Root router, modal integrations, global configuration
│   ├── main.jsx              # Application mount point
│   ├── index.css             # Base design system and layout utility rules
│   └── App.css               # Shared layout rules
├── package.json              # Project dependencies and workspace scripts
├── vite.config.js            # Vite build parameters
├── tailwind.config.js        # Design system utility mapping
└── README.md                 # Project Documentation
```

---

## 🛡 State Management & Persistence Architecture

CRAVE leverages a highly decoupled, reactive Zustand architecture to ensure atomic state updates and prevent massive component re-renders:

```
                  ┌───────────────────────┐
                  │      Auth Store       │ ── Isolation by User ID
                  └───────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐
│    Cart Store    ││   Order Store    ││   Review Store   │
└──────────────────┘└──────────────────┘└──────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│               Zustand Persist Middleware                 │
└──────────────────────────────────────────────────────────┘
                              │
                              ▼
                        localStorage
```

### Account Isolation & Cart Interceptors
* Users must authenticate (via password or quick OTP) to check out.
* The cart restricts items to a **single restaurant at a time**. Adding an item from "Kitchen B" while the cart contains items from "Kitchen A" triggers the **Replace Cart Interceptor Modal**, preventing order fragmentation.
* All stores are synchronized with client-side localStorage. When a user buys a membership or deletes a past review, those actions instantly update both the active views and database persistence.

---

## 🔧 Installation & Setup

Follow these steps to run CRAVE on your local machine:

### Prerequisites
* Ensure you have **Node.js** (v18 or higher) and **npm** installed on your workstation.

### Step 1: Clone the Repository
```bash
git clone https://github.com/prathameshmore07/crave.git
cd crave
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file at the root of the project:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: Replace `your_gemini_api_key_here` with a valid Google AI Studio Gemini API Key. If left empty, the chat interface will gracefully display an "unavailable" message without crashing).*

### Step 4: Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:5173`** to explore CRAVE!

### Step 5: Production Build
Compile the optimized production bundle:
```bash
npm run build
npm run preview
```

---

## 🔮 Future Enhancements
* **Live GPS Maps Integration:** Incorporating real-time map plotting using Leaflet or Google Maps API for real rider tracking.
* **WebSocket Integration:** Transitioning the delivery simulation into active web-sockets connected to a backend Node.js dispatcher.
* **PWA Capabilities:** Registering a service worker to cache menu lists offline for campus ordering during low-connectivity scenarios.

---

## 📝 License
Licensed under the [MIT License](LICENSE). Feel free to leverage this project as a foundation for your university or portfolio case studies.

---

## 🔏 Copyright
© Prathamesh More