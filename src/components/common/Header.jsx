import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCityStore } from '../../store/cityStore';
import { useUiStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ChevronDown, Search, Sun, Moon, ShoppingBag, Bell } from 'lucide-react';
import { cities } from '../../data/cities';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  const gradients = [
    "from-rose-500 to-red-600 text-white", // Brand Red Gradient
    "from-violet-500 to-indigo-600 text-white", // Violet/Indigo
    "from-emerald-400 to-teal-600 text-white", // Emerald/Teal
    "from-amber-400 to-orange-500 text-white", // Amber/Orange
    "from-sky-400 to-blue-600 text-white", // Sky/Blue
    "from-fuchsia-400 to-pink-600 text-white" // Pink/Fuchsia
  ];
  if (!name) return gradients[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
};

export default function Header({ onOpenCityModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCity = useCityStore((state) => state.selectedCity);
  const selectedLocality = useCityStore((state) => state.selectedLocality);
  
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const setNotificationsOpen = useUiStore((state) => state.setNotificationsOpen);
  
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());
  
  const cartItems = useCartStore((state) => state.items);
  const user = useAuthStore((state) => state.user);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cityObj = cities.find(c => c.id === selectedCity);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 md:h-20 bg-[--header-bg] backdrop-blur-md border-b border-black/[0.04] dark:border-white/[0.05] select-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between px-4 md:px-8">
        
        {/* 1. BRAND LOGO - Highly constrained and disciplined sizing */}
        <Link 
          to="/" 
          className="flex items-center focus:outline-none select-none shrink-0 group transition-all duration-300 hover:opacity-90 active:scale-[0.98] ease-out mr-4 lg:mr-8"
        >
          <img 
            src={logo} 
            alt="CRAVE Logo" 
            className="h-[28px] sm:h-[32px] md:h-[36px] w-auto max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* 2. CENTERED SEARCH & CITY SELECTOR CAPSULE - Inspired by Airbnb & Uber Eats */}
        <div className="hidden md:flex flex-1 max-w-[560px] mx-auto items-center gap-4 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] rounded-full px-4 h-11 transition-all duration-200">
          {/* Search trigger button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 flex items-center justify-between min-w-0 text-left focus:outline-none h-full"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <span className="text-[13px] text-gray-400 dark:text-gray-500 truncate font-normal">
                Search restaurants, dishes...
              </span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.04] rounded px-1.5 py-0.5 select-none mr-2">
              <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500">⌘K</span>
            </div>
          </button>

          {/* Separator Pipe */}
          <div className="h-4 w-[1px] bg-black/[0.08] dark:bg-white/[0.08] shrink-0" />

          {/* City Selector */}
          <button 
            onClick={onOpenCityModal}
            className="flex items-center gap-1.5 focus:outline-none group hover:opacity-80 transition-all duration-200 shrink-0 h-full py-1"
          >
            <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 max-w-[140px] truncate">
              {cityObj ? (selectedLocality ? `${selectedLocality}` : cityObj.name) : "Select City"}
            </span>
            <ChevronDown size={13} className="text-[--brand] shrink-0 opacity-70 group-hover:translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>

        {/* MOBILE ONLY: Dynamic City Switcher inside Left Flow */}
        <div className="md:hidden flex items-center gap-1.5 min-w-0 mr-auto">
          <button 
            onClick={onOpenCityModal}
            className="flex items-center gap-1 focus:outline-none group hover:opacity-80 transition-all duration-200 min-w-0"
          >
            <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
              {cityObj ? (selectedLocality ? `${selectedLocality}` : cityObj.name) : "Select City"}
            </span>
            <ChevronDown size={12} className="text-[--brand] shrink-0 opacity-70 group-hover:translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>

        {/* 4. ACTIONS (Right Side) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          
          {/* Mobile Search Button */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[--text-primary] focus:outline-none"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[--text-primary] focus:outline-none"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[--text-primary] focus:outline-none relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand rounded-full ring-2 ring-white dark:ring-dark-bg animate-pulse"></span>
            )}
          </button>

          {/* Cart Trigger with Pop Count Badge */}
          <motion.button
            key={`cart-btn-${cartCount}`}
            initial={{ scale: 1 }}
            animate={cartCount > 0 ? { scale: [1, 1.2, 0.95, 1], rotate: [0, -6, 6, 0] } : {}}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCartOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[--text-primary] focus:outline-none relative cursor-pointer"
            aria-label="Cart"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 h-[17px] w-[17px] bg-[--brand] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm select-none"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>

          {/* Profile Avatar (32px circle, initials with premium gradient) */}
          <Link
            to="/profile"
            className={`w-[32px] h-[32px] rounded-full bg-gradient-to-tr ${user ? getAvatarColor(user.name) : 'from-zinc-400 to-zinc-500 text-white'} flex items-center justify-center border border-black/[0.04] dark:border-white/[0.08] text-[11px] font-bold tracking-wider focus:outline-none overflow-hidden transition-all shadow-xs hover:scale-105 active:scale-95 select-none`}
            aria-label="Profile"
          >
            {user ? getInitials(user.name) : "U"}
          </Link>
        </div>
        
      </div>
    </header>
  );
}
