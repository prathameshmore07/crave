import { create } from 'zustand';
import { getUserJsonItem, setUserItem } from '../utils/storage';

const initialNotifications = [
  {
    id: 'notif-1',
    type: 'order_status',
    title: 'Order Confirmed! 🎉',
    message: 'Your gourmet box from Royal Biryani House has been received and accepted by the kitchen terminal.',
    timestamp: '2 mins ago',
    isRead: false,
    link: '/profile?tab=orders'
  },
  {
    id: 'notif-2',
    type: 'promo',
    title: 'Delhi Gourmet Unlocked! 🌶️',
    message: 'We are now live in Delhi! Celebrate with flat ₹150 off on premium fine dining spots using code DELHIGOURMET.',
    timestamp: '1 hour ago',
    isRead: false,
    link: '/'
  },
  {
    id: 'notif-3',
    type: 'delivery_agent',
    title: 'Verified Review Approved! ⭐',
    message: 'Your recent review for Burger Loft was approved. You earned 200 Loyalty Stars! Coupon Code BURGERLOFT15 unlocked.',
    timestamp: '4 hours ago',
    isRead: true,
    link: '/profile?tab=reviews'
  },
  {
    id: 'notif-4',
    type: 'promo',
    title: 'Weekend Fuel Offer! 🎁',
    message: 'Get Free delivery on all orders above ₹149 in Navi Mumbai, Mumbai, and Pune! Happy feasting!',
    timestamp: '1 day ago',
    isRead: true,
    link: '/'
  }
];

export const useNotificationStore = create((set, get) => {
  // Try to load notifications from user-scoped localStorage
  const getStoredNotifications = () => {
    return getUserJsonItem('crave_notifications', initialNotifications);
  };

  const persist = (notifs) => {
    setUserItem('crave_notifications', notifs);
  };

  return {
    notifications: getStoredNotifications(),

    loadForUser: () => {
      set({ notifications: getStoredNotifications() });
    },

    getUnreadCount: () => {
      return get().notifications.filter(n => !n.isRead).length;
    },

    markAsRead: (id) => set((state) => {
      const updated = state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      persist(updated);
      return { notifications: updated };
    }),

    markAllAsRead: () => set((state) => {
      const updated = state.notifications.map(n => ({ ...n, isRead: true }));
      persist(updated);
      return { notifications: updated };
    }),

    deleteNotification: (id) => set((state) => {
      const updated = state.notifications.filter(n => n.id !== id);
      persist(updated);
      return { notifications: updated };
    }),

    clearAll: () => set(() => {
      persist([]);
      return { notifications: [] };
    }),

    addNotification: (notif) => set((state) => {
      const newNotif = {
        id: `notif-${Date.now()}`,
        isRead: false,
        timestamp: 'Just now',
        ...notif
      };
      const updated = [newNotif, ...state.notifications];
      persist(updated);
      return { notifications: updated };
    })
  };
});
