import { create } from 'zustand';
import { getUserItem, getUserJsonItem, setUserItem, removeUserItem } from '../utils/storage';
import useMembershipStore from './membershipStore';

const sanitizeCartItems = (items) => {
  return (items || []).map(item => ({
    ...item,
    imageUrl: item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    selectedCustomizations: item.selectedCustomizations || []
  }));
};

export const useCartStore = create((set, get) => {
  // Retrieve initial user-scoped states from localStorage
  const items = sanitizeCartItems(getUserJsonItem('cart_items', []));
  const restaurant = getUserJsonItem('cart_restaurant', null);
  const tip = Number(getUserItem('cart_tip', '0'));
  const appliedCoupon = getUserJsonItem('cart_coupon', null);
  const cookingInstructions = getUserItem('cart_cooking_instructions', '');
  const deliveryInstruction = getUserItem('cart_delivery_instruction', '');

  return {
    items,
    restaurant,
    tip,
    appliedCoupon,
    cookingInstructions,
    deliveryInstruction,
    setCookingInstructions: (notes) => {
      setUserItem('cart_cooking_instructions', notes);
      set({ cookingInstructions: notes });
    },
    setDeliveryInstruction: (ins) => {
      setUserItem('cart_delivery_instruction', ins);
      set({ deliveryInstruction: ins });
    },
    friends: [
      { id: 'you', name: 'You', avatarGradient: 'from-orange-500 to-amber-500', initials: 'YO' }
    ],
    setFriends: (friendsList) => set({ friends: friendsList }),
    
    // Interceptor Modal State
    pendingItem: null,
    pendingRestaurant: null,
    showReplaceModal: false,

    // Rehydrate/refresh state when user logs in or out
    loadForUser: () => {
      set({
        items: sanitizeCartItems(getUserJsonItem('cart_items', [])),
        restaurant: getUserJsonItem('cart_restaurant', null),
        tip: Number(getUserItem('cart_tip', '0')),
        appliedCoupon: getUserJsonItem('cart_coupon', null),
        cookingInstructions: getUserItem('cart_cooking_instructions', ''),
        deliveryInstruction: getUserItem('cart_delivery_instruction', ''),
        friends: [
          { id: 'you', name: 'You', avatarGradient: 'from-orange-500 to-amber-500', initials: 'YO' }
        ],
        pendingItem: null,
        pendingRestaurant: null,
        showReplaceModal: false
      });
    },

    addItem: (item, restaurantInfo) => {
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

        const sanitizedItem = {
          ...item,
          imageUrl: item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
          selectedCustomizations: incomingCustomizations
        };

        if (existingItemIndex > -1) {
          // Update quantity on a completely new object reference
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + 1
          };
        } else {
          // Push a completely unique object reference with unique keys
          newItems.push({ 
            ...sanitizedItem, 
            quantity: 1
          });
        }

        // Save to user-scoped localStorage
        setUserItem('cart_items', newItems);
        setUserItem('cart_restaurant', activeRest);

        return {
          items: newItems,
          restaurant: activeRest
        };
      });
    },

    confirmReplaceCart: () => {
      const { pendingItem, pendingRestaurant } = get();
      if (pendingItem && pendingRestaurant) {
        // Clear existing cart coupon/tip data
        removeUserItem('cart_coupon');
        removeUserItem('cart_tip');
        
        const sanitizedPending = {
          ...pendingItem,
          imageUrl: pendingItem.imageUrl || pendingItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
          selectedCustomizations: pendingItem.selectedCustomizations || []
        };

        const newItems = [{ 
          ...sanitizedPending, 
          quantity: 1
        }];
        
        // Save to user-scoped localStorage
        setUserItem('cart_items', newItems);
        setUserItem('cart_restaurant', pendingRestaurant);
        
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
          removeUserItem('cart_restaurant');
          removeUserItem('cart_coupon');
          removeUserItem('cart_tip');
          removeUserItem('cart_items');
          removeUserItem('cart_cooking_instructions');
          removeUserItem('cart_delivery_instruction');
          return {
            items: [],
            restaurant: null,
            tip: 0,
            appliedCoupon: null,
            cookingInstructions: '',
            deliveryInstruction: ''
          };
        }

        setUserItem('cart_items', newItems);
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
          removeUserItem('cart_restaurant');
          removeUserItem('cart_coupon');
          removeUserItem('cart_tip');
          removeUserItem('cart_items');
          removeUserItem('cart_cooking_instructions');
          removeUserItem('cart_delivery_instruction');
          return {
            items: [],
            restaurant: null,
            tip: 0,
            appliedCoupon: null,
            cookingInstructions: '',
            deliveryInstruction: ''
          };
        }

        setUserItem('cart_items', newItems);
        return { items: newItems };
      });
    },

    clearCart: () => {
      removeUserItem('cart_items');
      removeUserItem('cart_restaurant');
      removeUserItem('cart_coupon');
      removeUserItem('cart_tip');
      removeUserItem('cart_cooking_instructions');
      removeUserItem('cart_delivery_instruction');
      set({
        items: [],
        restaurant: null,
        tip: 0,
        appliedCoupon: null,
        cookingInstructions: '',
        deliveryInstruction: '',
        friends: [
          { id: 'you', name: 'You', avatarGradient: 'from-orange-500 to-amber-500', initials: 'YO' }
        ]
      });
    },

    applyCoupon: (coupon) => {
      if (!coupon) {
        removeUserItem('cart_coupon');
        set({ appliedCoupon: null });
        return;
      }
      setUserItem('cart_coupon', coupon);
      set({ appliedCoupon: coupon });
    },

    setTip: (tipAmount) => {
      setUserItem('cart_tip', tipAmount.toString());
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

      // Crave PRO at checkout: waive delivery + platform fee + apply % off subtotal (coupon logic unchanged)
      const membershipActive = useMembershipStore.getState().isActive();
      const memberDiscountPct = membershipActive ? useMembershipStore.getState().getDiscountPercent() : 0;
      const membershipDiscount =
        membershipActive && subtotal > 0 ? Math.round((subtotal * memberDiscountPct) / 100) : 0;

      const couponFreeDelivery =
        state.appliedCoupon?.type === 'delivery' &&
        subtotal >= (state.appliedCoupon.minOrder ?? 0);

      const deliveryFee = state.restaurant
        ? couponFreeDelivery || membershipActive
          ? 0
          : 35
        : 0;

      const gst = Math.round(subtotal * 0.05); // 5% GST
      const platformFee = subtotal > 0 ? (membershipActive ? 0 : 2) : 0;
      const packagingCharge = subtotal > 0 ? 15 : 0;
      const total =
        subtotal > 0
          ? subtotal - discount - membershipDiscount + deliveryFee + gst + platformFee + state.tip
          : 0;
      const finalTotal = total + packagingCharge;

      return {
        subtotal,
        discount,
        membershipDiscount,
        deliveryFee,
        gst,
        platformFee,
        packagingCharge,
        total,
        finalTotal,
      };
    }
  };
});
