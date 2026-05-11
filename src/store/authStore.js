import { create } from 'zustand';
import { useCartStore } from './cartStore';
import { useOrderStore } from './orderStore';
import { useReviewStore } from './reviewStore';
import { useNotificationStore } from './notificationStore';

// Helper to manage users registry in localStorage
const loadRegistry = () => {
  try {
    const reg = localStorage.getItem('crave_users_registry');
    return reg ? JSON.parse(reg) : {};
  } catch (err) {
    console.error("Error loading users registry:", err);
    return {};
  }
};

const saveToRegistry = (email, userData) => {
  try {
    const reg = loadRegistry();
    reg[email.toLowerCase().trim()] = userData;
    localStorage.setItem('crave_users_registry', JSON.stringify(reg));
  } catch (err) {
    console.error("Error saving to users registry:", err);
  }
};

export const useAuthStore = create((set, get) => {
  // Load initial state from localStorage
  const storedUser = localStorage.getItem('auth_user');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  const initialLoggedIn = localStorage.getItem('auth_isLoggedIn') === 'true' || false;

  return {
    user: initialUser,
    isLoggedIn: initialLoggedIn,

    login: (email, name = "User", phone = "9876543210") => {
      const normalizedEmail = email.toLowerCase().trim();
      const registry = loadRegistry();
      
      let userData;
      if (registry[normalizedEmail]) {
        // User exists! Load their saved profile
        userData = registry[normalizedEmail];
        // If a real name/phone was supplied (like on a re-auth/signup update), update it
        if (name !== "User") userData.name = name;
        if (phone !== "9876543210") userData.phone = phone;
      } else {
        // Create new user record
        userData = {
          name,
          phone,
          email: normalizedEmail,
          addresses: [],
          orderHistory: []
        };
      }

      // Save to registry and active session
      saveToRegistry(normalizedEmail, userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_isLoggedIn', 'true');
      
      set({ user: userData, isLoggedIn: true });

      // TRIGGER LIVE STORE REHYDRATION FOR THE LOGGED-IN USER
      try {
        useCartStore.getState().loadForUser();
        useOrderStore.getState().loadForUser();
        useReviewStore.getState().loadForUser();
        useNotificationStore.getState().loadForUser();
      } catch (err) {
        console.error("Error rehydrating stores on login:", err);
      }

      return true;
    },

    logout: () => {
      set({ user: null, isLoggedIn: false });
      localStorage.removeItem('auth_user');
      localStorage.setItem('auth_isLoggedIn', 'false');

      // TRIGGER LIVE STORE RESET BACK TO GUEST DATA
      try {
        useCartStore.getState().loadForUser();
        useOrderStore.getState().loadForUser();
        useReviewStore.getState().loadForUser();
        useNotificationStore.getState().loadForUser();
      } catch (err) {
        console.error("Error resetting stores on logout:", err);
      }
    },

    updateProfile: (updatedData) => {
      set((state) => {
        if (!state.user) return {};
        const newUser = { ...state.user, ...updatedData };
        
        // Persist to registry & active session
        saveToRegistry(newUser.email, newUser);
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

        // Persist to registry & active session
        saveToRegistry(newUser.email, newUser);
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

        // Persist to registry & active session
        saveToRegistry(newUser.email, newUser);
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

        // Persist to registry & active session
        saveToRegistry(newUser.email, newUser);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
        return { user: newUser };
      });
    }
  };
});


