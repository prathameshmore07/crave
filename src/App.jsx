import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useCityStore } from './store/cityStore';
import { useAuthStore } from './store/authStore';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import BottomNav from './components/common/BottomNav';
import CityModal from './components/common/CityModal';
import CartDrawer from './components/cart/CartDrawer';
import SearchOverlay from './components/search/SearchOverlay';
import ReplaceCartModal from './components/cart/ReplaceCartModal';
import FloatingCart from './components/cart/FloatingCart';
import SupportDrawer from './components/common/SupportDrawer';
import NotificationDrawer from './components/common/NotificationDrawer';
import Home from './pages/Home';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import Checkout from './pages/Checkout';
import Tracking from './pages/Tracking';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import FoodExplorer from './pages/FoodExplorer';
import Membership from './pages/Membership';
import MembershipCheckout from './pages/MembershipCheckout';
import MembershipSuccess from './pages/MembershipSuccess';
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';
import logo from './assets/logo.png';

import { cities } from './data/cities';

// Private Route gatekeeper wrapper (Redirects to Auth if not logged in)
const PrivateRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  return user ? children : <Navigate to="/auth" replace />;
};

export default function App() {
  const selectedCity = useCityStore((state) => state.selectedCity);
  const setCity = useCityStore((state) => state.setCity);
  const user = useAuthStore((state) => state.user);

  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFade, setSplashFade] = useState(false);

  // Show splash for 1.2 seconds, then trigger fade out
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setSplashFade(true);
    }, 1200);

    // Completely remove splash element 400ms after fade out begins
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Force-open city modal on first load if no city has been selected or if the selected city is no longer valid
  useEffect(() => {
    if (!showSplash) {
      if (!selectedCity) {
        setCityModalOpen(true);
      } else {
        const isValidCity = cities.some(c => c.id === selectedCity);
        if (!isValidCity) {
          // Reset city to empty to trigger modal selection
          setCity("", "");
          setCityModalOpen(true);
        }
      }
    }
  }, [showSplash, selectedCity, setCity]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-800 dark:text-gray-200 flex flex-col transition-colors duration-200">
        
        {/* Splash screen overlay */}
        {showSplash && (
          <div 
            className={`fixed inset-0 z-[9999] bg-[#FAFAF9] dark:bg-[#0A0A09] flex flex-col items-center justify-center transition-all duration-700 ease-out ${
              splashFade ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="flex flex-col items-center gap-6 text-center px-6">
              <div className="flex items-center justify-center transition-all duration-500">
                <img 
                  src={logo} 
                  alt="CRAVE Logo" 
                  className="h-12 sm:h-16 w-auto object-contain"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-sm font-semibold tracking-[0.25em] text-gray-900 dark:text-gray-100 font-sans uppercase">
                  CRAVE
                </h1>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-[0.15em] uppercase">
                  Gourmet Delivered Instantly
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Custom global notification layer */}
        <Toaster position="top-center" richColors />

        {/* Global sticky header navigation */}
        <Header onOpenCityModal={() => setCityModalOpen(true)} />

        {/* Core router container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-24 pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<RestaurantList />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
            
            {/* Membership routes */}
            <Route path="/membership" element={<Membership />} />
            <Route path="/membership-checkout" element={
              <PrivateRoute>
                <MembershipCheckout />
              </PrivateRoute>
            } />
            <Route path="/membership-success/:memberId" element={
              <PrivateRoute>
                <MembershipSuccess />
              </PrivateRoute>
            } />
            
            {/* Guarded checkout, tracking, and profile paths */}
            <Route path="/checkout" element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } />
            <Route path="/order/:id/track" element={
              <PrivateRoute>
                <Tracking />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/explorer" element={
              <PrivateRoute>
                <FoodExplorer />
              </PrivateRoute>
            } />


            {/* Error route matches */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Desktop footers */}
        <Footer />

        {/* Mobile quick bottom tabs (60px high) */}
        <BottomNav />

        {/* Global Modals & Overlay Drawers */}
        <CityModal 
          isOpen={cityModalOpen} 
          onClose={() => setCityModalOpen(false)} 
          forceSelection={!selectedCity} // Force blocker if no city set
        />
        
        {/* Cart Slider drawer */}
        <CartDrawer />

        {/* Global Multi-Restaurant Interceptor Modal */}
        <ReplaceCartModal />

        {/* Floating Mini Cart Preview */}
        <FloatingCart />

        {/* Full-screen debounced instant search overlay */}
        <SearchOverlay />

        {/* Global Support and Notification Hub overlays */}
        <SupportDrawer />
        <NotificationDrawer />
      </div>
    </Router>
  );
}
