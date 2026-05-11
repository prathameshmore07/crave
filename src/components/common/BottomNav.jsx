import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import { Home, Flame, Search, ClipboardList, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);

  const currentPath = location.pathname;

  const handleTabClick = (tab, path) => {
    if (tab === 'search') {
      setSearchOpen(true);
    } else {
      navigate(path);
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'explorer', label: 'Explorer', icon: Flame, path: '/explorer' },
    { id: 'search', label: 'Search', icon: Search, path: '#' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/profile?tab=orders' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white dark:bg-[#141414] border-t border-black/[0.08] dark:border-white/[0.08] z-[90] flex items-center justify-around px-2 select-none transition-colors duration-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        
        // Active check
        let isActive = false;
        if (tab.id === 'home' && currentPath === '/') {
          isActive = true;
        } else if (tab.id === 'profile' && currentPath === '/profile' && !location.search.includes('tab=orders')) {
          isActive = true;
        } else if (tab.id === 'orders' && currentPath === '/profile' && location.search.includes('tab=orders')) {
          isActive = true;
        } else if (tab.id === 'explorer' && currentPath === '/explorer') {
          isActive = true;
        }

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id, tab.path)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 space-y-1 focus:outline-none"
          >
            <Icon 
              size={22} 
              className="transition-colors duration-150" 
              style={{ color: isActive ? '#E23744' : '#9E9E9E' }}
            />
            <span 
              className="text-[10px] font-medium tracking-wide transition-colors duration-150"
              style={{ color: isActive ? '#E23744' : '#9E9E9E' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
