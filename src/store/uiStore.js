import { create } from 'zustand';

// Dark mode only — no light theme toggle; Tailwind `dark:` variants always apply via `dark` on <html>
const applyDarkOnly = () => {
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
};

applyDarkOnly();

export const useUiStore = create((set) => ({
  theme: 'dark',
  cartOpen: false,
  searchOpen: false,
  filterDrawerOpen: false,
  supportOpen: false,
  supportType: 'chat',
  notificationsOpen: false,

  /** @deprecated Light mode removed; kept as no-op for any stray callers */
  toggleTheme: () => {},

  setCartOpen: (open) => set({ cartOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
  setSupportOpen: (open, type = 'chat') => set({ supportOpen: open, supportType: type }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
}));
