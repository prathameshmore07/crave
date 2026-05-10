import { create } from 'zustand';

export const useUiStore = create((set) => {
  // Initialize dark mode from localStorage or media query
  const storedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = storedTheme ? storedTheme === 'dark' : systemDark;

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    theme: isDark ? 'dark' : 'light',
    cartOpen: false,
    searchOpen: false,
    filterDrawerOpen: false,
    supportOpen: false,
    supportType: 'chat', // 'chat' | 'helpline'
    notificationsOpen: false,

    toggleTheme: () => set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    }),

    setCartOpen: (open) => set({ cartOpen: open }),
    setSearchOpen: (open) => set({ searchOpen: open }),
    setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
    setSupportOpen: (open, type = 'chat') => set({ supportOpen: open, supportType: type }),
    setNotificationsOpen: (open) => set({ notificationsOpen: open })
  };
});
