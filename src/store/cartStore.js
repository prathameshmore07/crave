import { create } from 'zustand';

export const useCartStore = create((set, get) => {
  const storedCart = localStorage.getItem('cart_items');
  const storedRestaurant = localStorage.getItem('cart_restaurant');
  const storedTip = localStorage.getItem('cart_tip');
  const storedCoupon = localStorage.getItem('cart_coupon');

  return {
    items: storedCart ? JSON.parse(storedCart) : [],
    restaurant: storedRestaurant ? JSON.parse(storedRestaurant) : null, // Active restaurant { id, name, deliveryFee }
    tip: storedTip ? Number(storedTip) : 0,
    appliedCoupon: storedCoupon ? JSON.parse(storedCoupon) : null, // { code, discountAmount, type }
    
    // Interceptor Modal State
    pendingItem: null,
    pendingRestaurant: null,
    showReplaceModal: false,

    addItem: (item, restaurantInfo) => {
      const currentRestaurant = get().restaurant;
      const differentRestaurant = currentRestaurant && currentRestaurant.id !== restaurantInfo.id;
      
      if (differentRestaurant) {
        set({
          pendingItem: item,
          pendingRestaurant: restaurantInfo,
          showReplaceModal: true
        });
        return;
      }

      set((state) => {
        // Safe deep/shallow mapping of current cart items to avoid references sharing
        let newItems = state.items.map(i => ({
          ...i,
          selectedCustomizations: i.selectedCustomizations || []
        }));
        
        let activeRest = state.restaurant || restaurantInfo;

        const incomingCustomizations = item.selectedCustomizations || [];

        const existingItemIndex = newItems.findIndex(i => 
          i.id === item.id && 
          JSON.stringify(i.selectedCustomizations) === JSON.stringify(incomingCustomizations)
        );

        if (existingItemIndex > -1) {
          // Update quantity on a completely new object reference
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + 1
          };
        } else {
          // Push a completely unique object reference with unique keys
          newItems.push({ 
            ...item, 
            quantity: 1, 
            selectedCustomizations: incomingCustomizations 
          });
        }

        // Save to localStorage
        localStorage.setItem('cart_items', JSON.stringify(newItems));
        localStorage.setItem('cart_restaurant', JSON.stringify(activeRest));

        return {
          items: newItems,
          restaurant: activeRest
        };
      });
    },

    confirmReplaceCart: () => {
      const { pendingItem, pendingRestaurant } = get();
      if (pendingItem && pendingRestaurant) {
        // Clear existing cart data
        localStorage.removeItem('cart_coupon');
        localStorage.removeItem('cart_tip');
        
        const newItems = [{ 
          ...pendingItem, 
          quantity: 1, 
          selectedCustomizations: pendingItem.selectedCustomizations || [] 
        }];
        
        localStorage.setItem('cart_items', JSON.stringify(newItems));
        localStorage.setItem('cart_restaurant', JSON.stringify(pendingRestaurant));
        
        set({
          items: newItems,
          restaurant: pendingRestaurant,
          tip: 0,
          appliedCoupon: null,
          pendingItem: null,
          pendingRestaurant: null,
          showReplaceModal: false
        });
      }
    },

    closeReplaceModal: () => {
      set({
        pendingItem: null,
        pendingRestaurant: null,
        showReplaceModal: false
      });
    },

    removeItem: (itemId, customizations = []) => {
      set((state) => {
        let newItems = state.items.map(i => ({
          ...i,
          selectedCustomizations: i.selectedCustomizations || []
        }));

        const normCustomizations = customizations || [];

        const itemIndex = newItems.findIndex(i => 
          i.id === itemId && 
          JSON.stringify(i.selectedCustomizations) === JSON.stringify(normCustomizations)
        );

        if (itemIndex > -1) {
          if (newItems[itemIndex].quantity > 1) {
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              quantity: newItems[itemIndex].quantity - 1
            };
          } else {
            newItems.splice(itemIndex, 1);
          }
        }

        if (newItems.length === 0) {
          localStorage.removeItem('cart_restaurant');
          localStorage.removeItem('cart_coupon');
          localStorage.removeItem('cart_tip');
          localStorage.removeItem('cart_items');
          return {
            items: [],
            restaurant: null,
            tip: 0,
            appliedCoupon: null
          };
        }

        localStorage.setItem('cart_items', JSON.stringify(newItems));
        return { items: newItems };
      });
    },

    updateQty: (itemId, quantity, customizations = []) => {
      set((state) => {
        let newItems = state.items.map(i => ({
          ...i,
          selectedCustomizations: i.selectedCustomizations || []
        }));

        const normCustomizations = customizations || [];

        const itemIndex = newItems.findIndex(i => 
          i.id === itemId && 
          JSON.stringify(i.selectedCustomizations) === JSON.stringify(normCustomizations)
        );

        if (itemIndex > -1) {
          if (quantity <= 0) {
            newItems.splice(itemIndex, 1);
          } else {
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              quantity: quantity
            };
          }
        }

        if (newItems.length === 0) {
          localStorage.removeItem('cart_restaurant');
          localStorage.removeItem('cart_coupon');
          localStorage.removeItem('cart_tip');
          localStorage.removeItem('cart_items');
          return {
            items: [],
            restaurant: null,
            tip: 0,
            appliedCoupon: null
          };
        }

        localStorage.setItem('cart_items', JSON.stringify(newItems));
        return { items: newItems };
      });
    },

    clearCart: () => {
      localStorage.removeItem('cart_items');
      localStorage.removeItem('cart_restaurant');
      localStorage.removeItem('cart_coupon');
      localStorage.removeItem('cart_tip');
      set({
        items: [],
        restaurant: null,
        tip: 0,
        appliedCoupon: null
      });
    },

    applyCoupon: (coupon) => {
      if (!coupon) {
        localStorage.removeItem('cart_coupon');
        set({ appliedCoupon: null });
        return;
      }
      localStorage.setItem('cart_coupon', JSON.stringify(coupon));
      set({ appliedCoupon: coupon });
    },

    setTip: (tipAmount) => {
      localStorage.setItem('cart_tip', tipAmount.toString());
      set({ tip: tipAmount });
    },

    getCartTotals: () => {
      const state = get();
      const subtotal = state.items.reduce((total, item) => {
        const customizationCost = (item.selectedCustomizations || []).reduce((sum, opt) => sum + (opt.price || 0), 0);
        return total + (item.price + customizationCost) * item.quantity;
      }, 0);

      let discount = 0;
      if (state.appliedCoupon) {
        const coupon = state.appliedCoupon;
        if (subtotal >= coupon.minOrder) {
          if (coupon.type === 'percentage') {
            discount = Math.min((subtotal * coupon.maxDiscount) / 100, coupon.maxDiscount);
          } else if (coupon.type === 'flat') {
            discount = coupon.maxDiscount;
          } else if (coupon.type === 'delivery') {
            discount = 0; // Handled directly in delivery fee reduction
          }
        }
      }

      const deliveryFee = state.restaurant 
        ? (state.appliedCoupon?.type === 'delivery' && subtotal >= state.appliedCoupon.minOrder ? 0 : 35) 
        : 0;

      const gst = Math.round(subtotal * 0.05); // 5% GST
      const platformFee = subtotal > 0 ? 2 : 0;
      const packagingCharge = subtotal > 0 ? 15 : 0;
      const total = subtotal > 0 ? (subtotal - discount + deliveryFee + gst + platformFee + state.tip) : 0;
      const finalTotal = total + packagingCharge;

      return {
        subtotal,
        discount,
        deliveryFee,
        gst,
        platformFee,
        packagingCharge,
        total,
        finalTotal
      };
    }
  };
});
