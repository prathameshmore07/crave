import { create } from 'zustand';

export const useOrderStore = create((set, get) => {
  // Safe load from localStorage with auto-delivery transition for older pending orders
  const loadStored = (key, fallback) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return fallback;
      const parsed = JSON.parse(stored);
      
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
          localStorage.setItem('order_history', JSON.stringify(processed));
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
    trackingStageIdx: Number(localStorage.getItem('tracking_stage_idx') || '0'),

    setActiveOrder: (order) => {
      if (order) {
        try {
          localStorage.setItem('active_order', JSON.stringify(order));
          localStorage.setItem('tracking_stage_idx', '0');
          localStorage.setItem('latest_order', JSON.stringify(order));
          
          const history = get().orderHistory;
          const exists = history.some(o => o.orderId === order.orderId);
          let updatedHistory = history;
          if (!exists) {
            updatedHistory = [order, ...history].slice(0, 20); // Keep last 20 orders
            localStorage.setItem('order_history', JSON.stringify(updatedHistory));
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
        localStorage.removeItem('active_order');
        localStorage.removeItem('tracking_stage_idx');
        set({ activeOrder: null, trackingStageIdx: 0 });
      }
    },

    setTrackingStageIdx: (idx) => {
      try {
        localStorage.setItem('tracking_stage_idx', idx.toString());
        set({ trackingStageIdx: idx });

        // Synchronize in activeOrder container if available
        const active = get().activeOrder;
        if (active) {
          const updated = { ...active, trackingStageIdx: idx };
          localStorage.setItem('active_order', JSON.stringify(updated));
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

        localStorage.setItem('order_history', JSON.stringify(updatedHistory));

        const active = get().activeOrder;
        let updatedActive = active;
        if (active && active.orderId === orderId) {
          updatedActive = { ...active, orderStatus: "Delivered", deliveredTimestamp: Date.now() };
          localStorage.setItem('active_order', JSON.stringify(updatedActive));
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

        localStorage.setItem('order_history', JSON.stringify(updatedHistory));

        const active = get().activeOrder;
        let updatedActive = active;
        if (active && active.orderId === orderId) {
          updatedActive = { ...active, rating: ratingData };
          localStorage.setItem('active_order', JSON.stringify(updatedActive));
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
      localStorage.removeItem('active_order');
      localStorage.removeItem('tracking_stage_idx');
      set({ activeOrder: null, trackingStageIdx: 0 });
    }
  };
});
