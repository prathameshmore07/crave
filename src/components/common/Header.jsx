import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCityStore } from '../../store/cityStore';
import { useUiStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ChevronDown, Search, Sun, Moon, ShoppingBag, Bell, Compass } from 'lucide-react';
import { cities } from '../../data/cities';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

const DonutIcon = ({ className, size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 11.5 21.95 11 21.85 10.5C21.1 10.9 20.1 11 19.5 10.5C18.5 9.7 18.8 8.2 19.8 7.5C19.3 6 18.3 4.7 17 3.8C16 4.8 14.5 5 13.5 4C13 3.5 13.1 2.5 13.5 1.85C13 1.75 12.5 1.7 12 1.7V2ZM12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8Z" 
      fill="#F43F5E"
    />
    <path 
      d="M12 3.5C7.306 3.5 3.5 7.306 3.5 12C3.5 16.694 7.306 20.5 12 20.5C16.694 20.5 20.5 16.694 20.5 12C20.5 11.7 20.47 11.4 20.4 11.1C19.7 11.3 18.9 11 18.5 10.5C17.2 9.4 17.6 7.4 19 6.5C18.4 5.2 17.4 4.1 16.2 3.3C15.2 4.3 13.5 4.5 12.5 3.5C12.3 3.3 12.1 3.1 12 3V3.5ZM12 9C13.657 9 15 10.343 15 12C15 13.657 13.657 15 12 15C10.343 15 9 13.657 9 12C9 10.343 10.343 9 12 9Z" 
      fill="#FDA4AF"
    />
    <rect x="6" y="11" width="2" height="0.8" rx="0.4" transform="rotate(30 6 11)" fill="#FFF" />
    <rect x="10" y="5" width="2" height="0.8" rx="0.4" transform="rotate(-45 10 5)" fill="#FFF" />
    <rect x="15" y="15" width="2" height="0.8" rx="0.4" transform="rotate(15 15 15)" fill="#FFF" />
    <rect x="7" y="16" width="2" height="0.8" rx="0.4" transform="rotate(-15 7 16)" fill="#FFF" />
    <rect x="14" y="9" width="2" height="0.8" rx="0.4" transform="rotate(60 14 9)" fill="#FFF" />
  </svg>
);

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

        {/* Navigation Links for Premium Features */}
        <div className="hidden lg:flex items-center gap-5 mr-4 shrink-0 border-r border-black/[0.06] dark:border-white/[0.06] pr-5">
          <Link 
            to="/explorer" 
            className={`text-[11px] font-black uppercase tracking-widest hover:text-brand transition-colors flex items-center gap-1.5 ${
              location.pathname === '/explorer' ? 'text-brand' : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {/* professional icon replacement */}
            {/* remove unnecessary emoji clutter */}
            <Compass size={13} className="text-brand animate-spin" style={{ animationDuration: '6s' }} /> Explorer
          </Link>
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
            <DonutIcon size={18} className="animate-pulse" />
          </Link>
        </div>
        
      </div>
    </header>
  );
}
