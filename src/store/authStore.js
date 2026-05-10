import { create } from 'zustand';

export const useAuthStore = create((set) => {
  // Load initial state from localStorage
  const storedUser = localStorage.getItem('auth_user');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  const initialLoggedIn = localStorage.getItem('auth_isLoggedIn') === 'true' || false;

  return {
    user: initialUser,
    isLoggedIn: initialLoggedIn,
    login: (email, name = "User", phone = "9876543210") => {
      // Mock creation of user object on login/signup
      const userData = {
        name,
        phone,
        email,
        addresses: [],
        orderHistory: []
      };
      set({ user: userData, isLoggedIn: true });
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_isLoggedIn', 'true');
      return true;
    },
    logout: () => {
      set({ user: null, isLoggedIn: false });
      localStorage.removeItem('auth_user');
      localStorage.setItem('auth_isLoggedIn', 'false');
    },
    updateProfile: (updatedData) => {
      set((state) => {
        if (!state.user) return {};
        const newUser = { ...state.user, ...updatedData };
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        return { user: newUser };
      });
    },
    addAddress: (address) => {
      set((state) => {
        if (!state.user) return {};
        const newAddress = { id: `addr-${Date.now()}`, ...address };
        const newUser = {
          ...state.user,
          addresses: [...(state.user?.addresses || []), newAddress]
        };
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        return { user: newUser };
      });
    },
    deleteAddress: (id) => {
      set((state) => {
        if (!state.user) return {};
        const newUser = {
          ...state.user,
          addresses: (state.user?.addresses || []).filter(addr => addr.id !== id)
        };
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        return { user: newUser };
      });
    },
    addOrder: (order) => {
      set((state) => {
        if (!state.user) return {};
        const newUser = {
          ...state.user,
          orderHistory: [order, ...(state.user?.orderHistory || [])]
        };
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        return { user: newUser };
      });
    }
  };
});

