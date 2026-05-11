# 🍔 Crave — Premium Food Delivery Experience

A state-of-the-art, production-grade food delivery application built with **React**, **Vite**, and **Zustand**. Crave is engineered to mirror leading food apps like *Swiggy*, *Zomato*, and *Blinkit*, delivering a seamless, high-end user experience, robust state management, and strict validation controls.

> [!IMPORTANT]
> **Production-Ready & Fully Audited:** This codebase has undergone a comprehensive, feature-by-feature architectural audit verifying that all custom interactive sub-systems, account isolation parameters, and premium checkout pipelines are fully implemented and functional.

---

## 📊 Project Audit Status

An exhaustive technical evaluation of all application flows was executed to confirm reliability. You can access the detailed findings in our **[System Audit Report](file:///Users/prathamesh/.gemini/antigravity/brain/b01cbdc8-7902-4601-92b0-4067e293d845/audit_report.md)**.

| Feature Area | Implementation Status | System Files |
| :--- | :---: | :--- |
| **Restaurant & Menu Browsing** | ✅ Fully Implemented | [`RestaurantDetail.jsx`](file:///Users/prathamesh/Desktop/food-delivery-website/src/pages/RestaurantDetail.jsx) |
| **Cart Management & Verification** | ✅ Fully Implemented | [`cartStore.js`](file:///Users/prathamesh/Desktop/food-delivery-website/src/store/cartStore.js) |
| **Advanced Multi-Step Checkout** | ✅ Fully Implemented | [`Checkout.jsx`](file:///Users/prathamesh/Desktop/food-delivery-website/src/pages/Checkout.jsx) |
| **Rider Dispatch & Live Tracking** | ✅ Fully Implemented | [`Tracking.jsx`](file:///Users/prathamesh/Desktop/food-delivery-website/src/pages/Tracking.jsx) |
| **Saved Addresses & Validation** | ✅ Fully Implemented | [`SavedAddresses.jsx`](file:///Users/prathamesh/Desktop/food-delivery-website/src/components/profile/SavedAddresses.jsx) |
| **Verified Synced Reviews** | ✅ Fully Implemented | [`reviewStore.js`](file:///Users/prathamesh/Desktop/food-delivery-website/src/store/reviewStore.js) |
| **Account Isolation & Storage** | ✅ Fully Implemented | [`authStore.js`](file:///Users/prathamesh/Desktop/food-delivery-website/src/store/authStore.js) |

---

## 🔥 Startup-Grade Premium Features

To make Crave truly stand out as an innovative, highly interactive platform, we have engineered three unique, visually addictive features:

### 1. 🍔 Smart Combo Builder
- **Dynamic Upsell Recommendations:** Listens in real-time to items in the user's cart, suggesting clever combo pairings (e.g., matching a burger or pizza with fries, Cokes, and brownies; Biryani with cooling raita and sweets).
- **One-Tap Upgrade:** Includes an elegant checkmark confirmation and a single-click "Add" button that triggers seamless additions.
- **Micro-Savings Indicators:** Displays clear, glowing badges showcasing combo discount values (e.g., "Save ₹30!").
- **System File:** [`SmartComboBuilder.jsx`](file:///Users/prathamesh/Desktop/food-delivery-website/src/components/cart/SmartComboBuilder.jsx) (rendered inside the Cart Drawer).

### 2. 🎴 Food Explorer Mode ("Tinder for Food")
- **3D Card Deck Physics:** Users swipe through card decks displaying high-quality campus trending items using responsive dragging.
- **Multi-Gesture Reactions:** Swipe Right/Tap Heart to add to **Cravings** (🤤), Swipe Left/Tap X to **Skip** (❌), or swipe up/click flame for **Trending Super Likes** (🔥).
- **Floating Emoji Bursts:** Swiping triggers gorgeous, micro-animated vector explosions of craving/skip emojis on a floating canvas.
- **Dorm Tags:** Highlight items with playful campus tags like *"Hostel Legend"*, *"Exam Fuel"*, *"Midnight Craving"*, and *"Surprisingly Good"*.
- **System File:** [`FoodExplorer.jsx`](file:///Users/prathamesh/Desktop/food-delivery-website/src/pages/FoodExplorer.jsx) (navigable via headers and bottom mobile bar tabs).

### 👥 3. Shared Group Cart & Splitter Room
- **Live Room Lobbies:** Create a shared Room (e.g. `CRAVE-AJ92`) or join one with friends.
- **Teammate typing streams:** Simulates live companion activity, rendering typing dots and feeds (e.g. *"Daksh is choosing..."* followed by *"Daksh added Classic Paneer Roll 🌶️"*).
- **Dynamic Split Calculations:** Automatically does the math for the group, dividing subtotal, GST (18%), and shared delivery/platform fees based on who ordered what.
- **Social Dorm Badges:** Bestows humorous dorm tags based on cart behavior:
  - 💀 **Biggest Spender**
  - 🍰 **Dessert Addict**
  - 🌶️ **Spice Warrior**
  - 👀 **Silent Orderer**
- **System File:** [`GroupOrder.jsx`](file:///Users/prathamesh/Desktop/food-delivery-website/src/pages/GroupOrder.jsx) (available in header and mobile bottom nav).

---

## ✨ Standard Product Features

### 🏪 Curated Restaurant Discovery
- **Aesthetic Grid Rendering:** High-fidelity layouts with shimmer skeleton states to ensure premium perceived performance.
- **Advanced Taxonomy Filters:** Quick-toggle categories (e.g., South Indian, Fast Food, North Indian) and rating/distance constraints.
- **Dynamic Search Overlay:** Debounced instant matching across menus and kitchens.

### 🛒 Intelligent Cart Management
- **Duplicate Prevention:** Intelligently increments item quantities rather than duplicate list creation.
- **Safe Restaurant Switching:** Prompts users with a modern warning overlay when attempting to add items from a different kitchen.
- **Real-Time Calculations:** Sub-second recalculation of subtotals, GST (18%), delivery fees, and flat platform charges.

### 👤 Modernized Clean Profile Header
- **Minimalist Aesthetic:** Replaced flashy, fake luxury tiers ("Gourmet Gold Member") with a realistic, premium Swiggy-like layout.
- **Dynamic Account Stats:** Accurate user metrics showing exact counts of *Orders Placed*, *My Reviews*, *Saved Places*, and *Favourites*.
- **Account Setup Progress:** An interactive setup checklist displaying actual verification parameters and profile configuration completion.

### 🗺️ Premium Address & Delivery Controls
- **Strict Validations:** Real-time form controls requiring a strict 10-digit numeric mobile number starting with 6-9, a 6-digit postal pincode, and complete floor details.
- **Custom Location Labels:** Beautiful, micro-animated sliding custom field appearing instantly upon selecting "Other" label types.
- **Blinkit-Style Delivery Preferences:** Gorgeous, interactive preference cards with smooth border glow states and custom vectors:
  - 📦 **Leave at Door** (emerald emerald-500 glow)
  - 🔔 **Ring Doorbell** (indigo indigo-500 glow)
  - 📞 **Call on Arrival** (blue blue-500 glow)
- **Rider Presets:** Add pre-defined instruction tags such as *"Avoid calling"* or *"Doorbell not working"* directly to the order object with one click.

### 🚚 Simulated Real-Time Delivery Tracker
- **5-Stage Live Dispatch Pipeline:** Watch the order transition through realistic stages:
  1. *Placed & Confirmed* — Kitchen acknowledging order parameters.
  2. *Preparation Starting* — Fresh ingredients gathering.
  3. *Active Kitchen Cooking* — Chefs completing menu preparations.
  4. *Quality Hot Packaging* — Sealing products for travel.
  5. *Rider in Transit* — Real-time coordinate translation of dispatch.
- **Interactive Simulation Controls:** Speed-up delivery times to test transitions or trigger custom map progress states.

### ⭐ Dual-Synced Review Platform
- **Verified Purchase Restraints:** Review triggers unlock strictly for completed/delivered orders.
- **Multi-Level Rating Matrix:** Rate overall food quality, packaging durability, and delivery dispatch speed independently.
- **Instant Global Synced Feed:** Custom reviews dynamically populate the user’s "My Reviews" tab and are injected instantly into the public, cross-account feedback drawer of the restaurant.
- **Live Average Recalculations:** Submitting, modifying, or deleting feedback instantly triggers weighted recalculations of restaurant averages, directly affecting grid lists sorting.

---

## 📁 Technical Architecture

```
crave/
├── src/
│   ├── components/
│   │   ├── cart/             # Cart UI, Bill Summaries, Smart Combo, Coupons
│   │   ├── checkout/         # Address steps, Secure payment screens, Processors
│   │   ├── restaurant/       # Menu lists, category drawers, customizable plates
│   │   ├── tracking/         # Real-time timers, rider cards, simulation meters
│   │   ├── profile/          # Order lists, address books, favorites
│   │   └── common/           # Header, Dynamic SVG Dish images, skeletons, drawers
│   ├── pages/                # Route controllers (Home, Lists, Details, Tracker, Explorer, Group)
│   ├── store/                # Zustand global state (Auth, Cart, Orders, Reviews)
│   └── utils/                # Sanitization helpers, price/time formatting
```

### State Isolation & Storage Paradigm
Crave implements strict data segregation to guarantee multi-account privacy and prevent session leaks:
- Active accounts use unique email keys as identifiers.
- On login or registration, the application triggers localized store rehydration (`loadForUser`), retrieving only data scoped to that specific account.
- Switching profiles or logging out completely purges in-memory stores and localStorage active slots, guaranteeing a fresh, isolated state with `0` past actions for new signups.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation & Execution
1. **Clone the repository:**
   ```bash
   git clone https://github.com/prathameshmore07/crave.git
   cd crave
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite local development server:**
   ```bash
   npm run dev
   ```
   The app will run locally at: `http://localhost:5173`

4. **Verify and bundle for production:**
   ```bash
   npm run build
   ```

---

## 🛠️ Package Registry

*   **UI Core:** React 18.3 & Vite 5.4
*   **State Engines:** Zustand 4.5
*   **Routing Pipeline:** React Router Dom 6
*   **Styling Engine:** Tailwind CSS 3
*   **Micro-interactions:** Framer Motion 11
*   **Input Mechanics:** React Hook Form 7
*   **Icon Vectors:** Lucide React 1
*   **Interactive Toasts:** Sonner 2

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Prathamesh More**
- GitHub: [@prathameshmore07](https://github.com/prathameshmore07)

---

© Prathamesh More. All rights reserved.
