import { create } from 'zustand';
import { getUserItem, getUserJsonItem, setUserItem, removeUserItem } from '../utils/storage';

export const useOrderStore = create((set, get) => {
  // Safe load from user-scoped localStorage with auto-delivery transition for older pending orders
  const loadStored = (key, fallback) => {
    try {
      const parsed = getUserJsonItem(key, fallback);
      if (!parsed || parsed === fallback) return fallback;
      
      if (key === 'order_history') {
        const now = Date.now();
        let updated = false;
        
        // Auto-deliver any pending orders that were placed more than 45 seconds ago
        const processed = parsed.map(o => {
          const elapsed = now - new Date(o.timestamp || now).getTime();
          if (o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled" && elapsed > 45000) {
            updated = true;
            return { ...o, orderStatus: "Delivered", deliveredTimestamp: now };
          }
          return o;
        });
        
        if (updated) {
          setUserItem('order_history', processed);
        }
        return processed;
      }
      return parsed;
    } catch (err) {
      console.error(`Error loading key "${key}" from localStorage:`, err);
      return fallback;
    }
  };

  return {
    activeOrder: loadStored('active_order', null),
    orderHistory: loadStored('order_history', []),
    trackingStageIdx: Number(getUserItem('tracking_stage_idx', '0')),

    loadForUser: () => {
      set({
        activeOrder: loadStored('active_order', null),
        orderHistory: loadStored('order_history', []),
        trackingStageIdx: Number(getUserItem('tracking_stage_idx', '0'))
      });
    },

    setActiveOrder: (order) => {
      if (order) {
        try {
          setUserItem('active_order', order);
          setUserItem('tracking_stage_idx', '0');
          setUserItem('latest_order', order);
          
          const history = get().orderHistory;
          const exists = history.some(o => o.orderId === order.orderId);
          let updatedHistory = history;
          if (!exists) {
            updatedHistory = [order, ...history].slice(0, 20); // Keep last 20 orders
            setUserItem('order_history', updatedHistory);
          }

          set({ 
            activeOrder: order, 
            trackingStageIdx: 0,
            orderHistory: updatedHistory
          });
        } catch (err) {
          console.error("Failed to store active order in localStorage:", err);
        }
      } else {
        removeUserItem('active_order');
        removeUserItem('tracking_stage_idx');
        set({ activeOrder: null, trackingStageIdx: 0 });
      }
    },

    setTrackingStageIdx: (idx) => {
      try {
        setUserItem('tracking_stage_idx', idx.toString());
        set({ trackingStageIdx: idx });

        // Synchronize in activeOrder container if available
        const active = get().activeOrder;
        if (active) {
          const updated = { ...active, trackingStageIdx: idx };
          setUserItem('active_order', updated);
          set({ activeOrder: updated });
        }
      } catch (err) {
        console.error("Failed to update tracking stage in localStorage:", err);
      }
    },

    setOrderDelivered: (orderId) => {
      try {
        const history = get().orderHistory;
        const updatedHistory = history.map(o => {
          if (o.orderId === orderId) {
            return { ...o, orderStatus: "Delivered", deliveredTimestamp: Date.now() };
          }
          return o;
        });

        setUserItem('order_history', updatedHistory);

        const active = get().activeOrder;
        let updatedActive = active;
        if (active && active.orderId === orderId) {
          updatedActive = { ...active, orderStatus: "Delivered", deliveredTimestamp: Date.now() };
          setUserItem('active_order', updatedActive);
        }

        set({
          orderHistory: updatedHistory,
          activeOrder: updatedActive
        });
      } catch (err) {
        console.error("Failed to set order delivered:", err);
      }
    },

    rateOrder: (orderId, ratingData) => {
      try {
        const history = get().orderHistory;
        const updatedHistory = history.map(o => {
          if (o.orderId === orderId) {
            return { ...o, rating: ratingData };
          }
          return o;
        });

        setUserItem('order_history', updatedHistory);

        const active = get().activeOrder;
        let updatedActive = active;
        if (active && active.orderId === orderId) {
          updatedActive = { ...active, rating: ratingData };
          setUserItem('active_order', updatedActive);
        }

        set({
          orderHistory: updatedHistory,
          activeOrder: updatedActive
        });
      } catch (err) {
        console.error("Failed to rate order:", err);
      }
    },

    clearActiveOrder: () => {
      removeUserItem('active_order');
      removeUserItem('tracking_stage_idx');
      set({ activeOrder: null, trackingStageIdx: 0 });
    },

    // Realistic lifecycle simulation for demo purposes
    startSimulation: (orderId) => {
      // Stage 1: Order Confirmed (already set at creation)
      
      // Stage 2: Food is being prepared (5s)
      setTimeout(() => {
        get().setTrackingStageIdx(1);
      }, 5000);

      // Stage 3: Rider has picked up (12s)
      setTimeout(() => {
        get().setTrackingStageIdx(2);
      }, 12000);

      // Stage 4: Delivered (20s)
      setTimeout(() => {
        get().setTrackingStageIdx(3);
        get().setOrderDelivered(orderId);
      }, 20000);
    }
  };
});
