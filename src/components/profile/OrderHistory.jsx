import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useOrderStore } from '../../store/orderStore';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { useReviewStore } from '../../store/reviewStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/formatPrice';
import { ShoppingBag, ChevronRight, CheckCircle, Compass, Star, CreditCard, MessageSquare, X, ShieldAlert, Trash2, Download, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { menuItemImages } from '../../data/restaurants';
import DishImage from '../common/DishImage';

export default function OrderHistory() {
  const navigate = useNavigate();
  const { orderHistory, rateOrder } = useOrderStore();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const submitReview = useReviewStore((state) => state.submitReview);
  const deleteReview = useReviewStore((state) => state.deleteReview);

  const user = useAuthStore((state) => state.user);

  // Modal active states
  const [activeReviewOrder, setActiveReviewOrder] = useState(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState(null);
  
  // lock body scroll while review modal or delete confirmation modal is open
  useEffect(() => {
    const shouldLock = activeReviewOrder || deleteConfirmOrder;
    if (shouldLock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeReviewOrder, deleteConfirmOrder]);

  const [ratingStars, setRatingStars] = useState(5);
  const [foodStars, setFoodStars] = useState(5);
  const [deliveryStars, setDeliveryStars] = useState(5);
  const [packagingStars, setPackagingStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🥰");
  const [dishRatings, setDishRatings] = useState({});

  // Hover states for stellar stars
  const [hoverOverall, setHoverOverall] = useState(0);
  const [hoverFood, setHoverFood] = useState(0);
  const [hoverDelivery, setHoverDelivery] = useState(0);
  const [hoverPackaging, setHoverPackaging] = useState(0);

  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  // Fallback to active user's profile orderHistory if store is empty
  let rawOrders = orderHistory || [];
  if (rawOrders.length === 0 && user) {
    rawOrders = user.orderHistory || [];
  }

  // Split multi-restaurant orders into separate display cards for clarity
  const orders = rawOrders.flatMap(order => {
    if (!order.items || order.items.length === 0) return [order];

    const itemsByRestaurant = order.items.reduce((acc, item) => {
      const resName = item.restaurantName || item.restaurant || order.restaurantName || "Unknown Kitchen";
      if (!acc[resName]) acc[resName] = [];
      acc[resName].push(item);
      return acc;
    }, {});

    const restaurantNames = Object.keys(itemsByRestaurant);
    if (restaurantNames.length <= 1) return [order];

    return restaurantNames.map((resName) => {
      const items = itemsByRestaurant[resName];
      return {
        ...order,
        // unique key for React rendering
        uniqueDisplayKey: `${order.orderId}-${resName}`,
        displayRestaurantName: resName,
        displayItems: items,
        displayImage: items[0]?.imageUrl || order.restaurantImageUrl || order.restaurantImage,
        isSplitOrder: true
      };
    });
  });

  // Instant PDF Receipt generator for historical orders
  const handlePrintReceipt = (order) => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to download your receipt.");
      return;
    }
    
    // Construct order item rows
    const itemRows = order.items.map(item => `
      <tr style="border-bottom: 1px solid #f3f4f6; font-size: 13px;">
        <td style="padding: 12px 0; font-weight: 600; color: #1f2937; text-align: left;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${item.isVeg ? '#10b981' : '#ef4444'}; margin-right: 6px;"></span>
          ${item.name}
          ${item.selectedCustomizations && item.selectedCustomizations.length > 0 
            ? `<div style="font-size: 10px; color: #6b7280; font-weight: 500; margin-top: 2px; padding-left: 14px;">${item.selectedCustomizations.map(c => c.name).join(', ')}</div>` 
            : ''}
        </td>
        <td style="padding: 12px 0; text-align: center; color: #4b5563;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-family: monospace; font-weight: bold; color: #1f2937;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Instructions markup
    let instructionsSection = '';
    if (order.cookingInstructions || order.deliveryInstruction) {
      instructionsSection = `
        <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; text-align: left;">
          <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 10px; margin-top: 0;">Special Instructions</h3>
          ${order.cookingInstructions ? `
            <div style="font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 8px;">
              <strong style="color: #ea580c;">🍳 Chef Note:</strong> ${order.cookingInstructions}
            </div>
          ` : ''}
          ${order.deliveryInstruction ? `
            <div style="font-size: 12px; font-weight: 500; color: #374151;">
              <strong style="color: #2563eb;">🛵 Rider Note:</strong> <span style="text-transform: capitalize;">${order.deliveryInstruction.replace('-', ' ')}</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Crave Receipt - Order #${order.orderId}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
            background-color: #ffffff;
            color: #111827;
            margin: 0;
            padding: 40px;
            -webkit-print-color-adjust: exact;
          }
          .invoice-card {
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #f3f4f6;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px dashed #f3f4f6;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .brand-logo {
            font-family: 'Outfit', sans-serif;
            font-size: 28px;
            font-weight: 900;
            color: #ff385c;
            letter-spacing: -0.03em;
            margin: 0;
            text-align: left;
          }
          .brand-tag {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #9ca3af;
            margin-top: 4px;
            text-align: left;
          }
          .invoice-title {
            font-size: 16px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #111827;
            text-align: right;
            margin: 0 0 8px 0;
          }
          .meta-label {
            font-size: 11px;
            color: #6b7280;
            font-weight: 600;
            display: block;
          }
          .meta-value {
            font-size: 12px;
            font-weight: 700;
            color: #111827;
            margin-top: 2px;
          }
          .details-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .restaurant-box {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
            padding: 16px;
            border-radius: 16px;
            text-align: left;
          }
          .address-box {
            background-color: #f0fdf4;
            border: 1px solid #dcfce7;
            padding: 16px;
            border-radius: 16px;
            text-align: left;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          .totals-table {
            width: 100%;
            margin-top: 16px;
            border-top: 1px solid #f3f4f6;
            padding-top: 16px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #4b5563;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .grand-total-row {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 900;
            color: #111827;
            border-top: 2px dashed #f3f4f6;
            padding-top: 16px;
            margin-top: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 11px;
            color: #9ca3af;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            line-height: 1.6;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-card {
              border: none;
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header-row">
            <div>
              <h1 class="brand-logo">CRAVE.</h1>
              <div class="brand-tag">Premium Food Delivery</div>
            </div>
            <div>
              <div class="invoice-title">Official Invoice</div>
              <div style="text-align: right;">
                <span class="meta-label">ORDER ID:</span>
                <div class="meta-value" style="font-family: monospace; letter-spacing: 0.5px;">${order.orderId}</div>
              </div>
            </div>
          </div>

          <div class="details-grid">
            <div class="restaurant-box">
              <div class="meta-label" style="color: #b45309;">ORDERED FROM</div>
              <div class="meta-value" style="font-size: 14px; color: #78350f; margin-top: 4px;">${order.restaurantName}</div>
              <div style="font-size: 11px; color: #92400e; font-weight: 500; margin-top: 2px;">${order.locality || 'Crave Kitchen'}</div>
              <div style="font-size: 11px; color: #92400e; font-weight: 600; margin-top: 8px;">Date: ${order.date}</div>
            </div>
            <div class="address-box">
              <div class="meta-label" style="color: #15803d;">DELIVERED TO</div>
              <div class="meta-value" style="font-size: 13px; color: #14532d; margin-top: 4px;">${order.deliveryAddress?.fullName || 'Valued Customer'}</div>
              <div style="font-size: 11px; color: #166534; font-weight: 500; margin-top: 2px; line-height: 1.4;">
                ${order.deliveryAddress?.flatNo ? `${order.deliveryAddress.flatNo}, ` : ''}
                ${order.deliveryAddress?.area || 'Campus Address'}
              </div>
              <div style="font-size: 11px; color: #166534; font-weight: 600; margin-top: 8px;">Method: ${order.paymentMethod || 'UPI Payment'}</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr style="border-bottom: 2px solid #111827; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; text-align: left;">
                <th style="padding-bottom: 8px;">Menu Item</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div class="totals-table">
            <div class="totals-row">
              <span>Subtotal</span>
              <span style="font-family: monospace;">₹${(order.totalAmount - 15).toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Packaging & Handling Charges</span>
              <span style="font-family: monospace;">₹15.00</span>
            </div>
            <div class="totals-row">
              <span>Delivery Partner Fee</span>
              <span style="color: #10b981;">FREE</span>
            </div>
            <div class="grand-total-row">
              <span>Total Paid</span>
              <span style="font-family: monospace; color: #ff385c;">₹${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          ${instructionsSection}

          <div class="footer">
            Thank you for dining with Crave!<br />
            Loved your food? Open the app to rate your delivery agent and kitchen chef.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("Generating your PDF Receipt...", {
      description: "Press Print or Save to save your receipt."
    });
  };

  // Reload previous ordered items back into cart
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) {
      toast.error("No items found to reorder.");
      return;
    }

    order.items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.isVeg,
        selectedCustomizations: item.selectedCustomizations || [],
        quantity: item.quantity || 1
      }, {
        id: order.restaurantId,
        name: order.restaurantName,
        imageUrl: order.restaurantImageUrl || order.restaurantImage,
        locality: order.locality || "Main Branch"
      });
    });

    toast.success(`Basket reloaded from ${order.restaurantName}!`, {
      description: "Previous customization choices preserved."
    });
    setCartOpen(true);
  };

  // sync action buttons with actual order status
  // prevent preparing state after delivery
  const getOrderLiveStatus = (order) => {
    if (!order) return { status: "Unknown", stage: 0, isDelivered: false, isActive: false, isCancelled: false };
    
    if (order.orderStatus === "Cancelled") {
      return { status: "Cancelled", stage: -1, isDelivered: false, isActive: false, isCancelled: true };
    }
    
    const elapsed = Math.floor((Date.now() - new Date(order.timestamp).getTime()) / 1000);
    
    // Check if orderStatus is explicitly set to Delivered, Completed, or elapsed has reached 60s
    const isStoredDelivered = order.orderStatus === "Delivered" || order.orderStatus === "Delivered Successfully" || order.orderStatus === "Completed";
    
    if (isStoredDelivered || elapsed >= 60) {
      return { status: "Delivered", stage: 7, isDelivered: true, isActive: false, isCancelled: false };
    }
    
    let stage = 0;
    let status = "Order Confirmed";
    
    if (elapsed >= 45) {
      stage = 6;
      status = "Near You";
    } else if (elapsed >= 30) {
      stage = 5;
      status = "On The Way";
    } else if (elapsed >= 20) {
      stage = 4;
      status = "Picked Up";
    } else if (elapsed >= 15) {
      stage = 3;
      status = "Cooking";
    } else if (elapsed >= 10) {
      stage = 2;
      status = "Preparing";
    } else if (elapsed >= 5) {
      stage = 1;
      status = "Accepted";
    } else {
      stage = 0;
      status = "Order Confirmed";
    }

    return { status, stage, isDelivered: false, isActive: true, isCancelled: false };
  };

  // allow reviews for all delivered orders
  const isOrderDelivered = (order) => {
    return getOrderLiveStatus(order).isDelivered;
  };

  // Determine if order is still fresh / active
  const getOrderStatus = (order) => {
    const live = getOrderLiveStatus(order);
    return { isActive: live.isActive, elapsedSeconds: Math.floor((Date.now() - new Date(order.timestamp).getTime()) / 1000) };
  };

  // Open the review modal (populated with current ratings if editing)
  const openReviewModal = (order) => {
    setActiveReviewOrder(order);
    if (order.rating) {
      setRatingStars(order.rating.food || 5);
      setFoodStars(order.rating.foodQuality || order.rating.food || 5);
      setDeliveryStars(order.rating.deliveryExperience || order.rating.food || 5);
      setPackagingStars(order.rating.packaging || order.rating.food || 5);
      setReviewComment(order.rating.comment || "");
      setSelectedEmoji(order.rating.emoji || "🥰");
      setDishRatings(order.rating.dishRatings || {});
    } else {
      setRatingStars(5);
      setFoodStars(5);
      setDeliveryStars(5);
      setPackagingStars(5);
      setReviewComment("");
      setSelectedEmoji("🥰");
      
      // Prepopulate dish ratings
      const initialDishRatings = {};
      if (order.items) {
        order.items.forEach(item => {
          initialDishRatings[item.id] = 5;
        });
      }
      setDishRatings(initialDishRatings);
    }
    setShowSuccessAnim(false);
  };

  // Handle rating submission
  const handleSubmitRating = (e) => {
    e.preventDefault();
    if (!activeReviewOrder) return;

    // prevent empty review submission
    if (!reviewComment.trim()) {
      toast.error("Please enter a short comment.", {
        description: "Your detailed feedback is highly appreciated!"
      });
      return;
    }

    const isEdit = !!activeReviewOrder.rating;

    const ratingData = {
      food: ratingStars,
      foodQuality: foodStars,
      deliveryExperience: deliveryStars,
      packaging: packagingStars,
      comment: reviewComment,
      emoji: selectedEmoji,
      timestamp: Date.now(),
      isEdited: isEdit,
      dishRatings: dishRatings // save dish ratings separately
    };

    // allow review only for delivered orders
    rateOrder(activeReviewOrder.orderId, ratingData);

    const authorName = user?.name || "Student Verified";

    // submit review instantly to the restaurant reviews pool
    submitReview(activeReviewOrder.restaurantId, {
      id: `review-${activeReviewOrder.orderId}`,
      userName: authorName,
      avatar: authorName.substring(0, 2).toUpperCase(),
      rating: ratingStars,
      foodQuality: foodStars,
      deliveryExperience: deliveryStars,
      packaging: packagingStars,
      text: reviewComment,
      emoji: selectedEmoji,
      orderId: activeReviewOrder.orderId,
      items: activeReviewOrder.items || [], // map review to ordered dishes
      date: isEdit ? "Edited just now" : "Just now",
      dishRatings: dishRatings // save dish ratings separately
    });

    // Play premium success animation then close modal gracefully
    setShowSuccessAnim(true);
    setTimeout(() => {
      setActiveReviewOrder(null);
      setShowSuccessAnim(false);
      toast.success(isEdit ? "Review updated" : "Review submitted successfully", {
        description: "Your rating and feedback metrics are instantly visible on the restaurant page."
      });
    }, 1800);
  };

  // Trigger delete review workflow
  const triggerDeleteReview = (order) => {
    setDeleteConfirmOrder(order);
  };

  // Confirm delete review and clear state properly
  const handleDeleteReview = () => {
    if (!deleteConfirmOrder) return;

    const restaurantId = deleteConfirmOrder.restaurantId;
    const orderId = deleteConfirmOrder.orderId;

    // remove review from local storage
    deleteReview(restaurantId, orderId);

    // Clear order rating state to null so user can rate order again
    rateOrder(orderId, null);

    setDeleteConfirmOrder(null);
    setActiveReviewOrder(null); // Close the active review modal automatically
    toast.success("Review deleted", {
      description: "Your visual rating is removed and averages have been recalculated."
    });
  };

  // Automatic Emoji Reaction Mapper based on rating score
  const handleStarSelection = (score) => {
    setRatingStars(score);
    const emojis = ["😠", "🙁", "😐", "🙂", "🥰"];
    setSelectedEmoji(emojis[score - 1] || "🥰");
  };

  const emojiStickers = ["🥰", "😋", "🔥", "⚡", "👍", "❤️", "🙁", "😠"];

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 px-4 space-y-4 max-w-sm mx-auto animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-zinc-900 border border-black/[0.04] dark:border-white/[0.04] text-gray-400 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag size={24} className="text-gray-400/80" />
        </div>
        <div className="space-y-1 text-center">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No past culinary adventures yet</h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold leading-relaxed">Your orders will be logged here with complete timestamps, billing specs, and review links.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="h-9 px-4 bg-brand hover:bg-brand-hover text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer outline-none border-none"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left relative">
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Past Orders & Receipts</h3>
        <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-1 font-medium">Manage details of previous gourmet selections, ratings, and instant reordering options.</p>
      </div>

      <div className="space-y-4 max-h-[680px] overflow-y-auto pr-3 -mr-3 custom-scrollbar">
        {orders.map((order) => {
          const liveStatus = getOrderLiveStatus(order);
          const { isActive, isDelivered, isCancelled, status } = liveStatus;
          const hasRating = order.rating;

          return (
            <div 
              key={order.uniqueDisplayKey || order.orderId}
              className="p-5 md:p-6 bg-zinc-900/40 dark:bg-black/40 border border-zinc-100 dark:border-zinc-900 rounded-[24px] hover:bg-zinc-900/60 dark:hover:bg-zinc-900/30 transition-all group relative overflow-hidden"
            >
              {/* Main horizontal layout - screenshot style */}
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                
                {/* 1. Left: Restaurant Image */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-black/[0.05] flex-shrink-0 shadow-sm">
                  <DishImage 
                    src={order.displayImage || order.restaurantImageUrl || order.restaurantImage} 
                    alt={order.displayRestaurantName || order.restaurantName}
                    dishName={order.displayRestaurantName || order.restaurantName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 2. Middle-Left: Info Stack */}
                <div className="flex-1 space-y-2.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      <ShoppingBag size={14} className="text-brand" />
                      <span className="truncate max-w-[200px]">
                        {(order.displayItems || order.items).map(item => `${item.quantity}x ${item.name}`).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                      {order.displayRestaurantName || order.restaurantName}
                    </h4>
                    
                    {isActive ? (
                      <span className="text-[9px] bg-brand/10 text-brand font-black uppercase tracking-widest px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse">
                        <Compass size={10} className="animate-spin" style={{ animationDuration: '3s' }} /> {status}
                      </span>
                    ) : isCancelled ? (
                      <span className="text-[9px] bg-red-500/10 text-red-600 dark:text-red-400 font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest px-2 py-0.5 rounded-lg flex items-center gap-0.5 border border-emerald-500/10">
                        <CheckCircle size={10} /> Delivered
                      </span>
                    )}

                    {hasRating && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest px-2 py-0.5 rounded-lg flex items-center gap-0.5 border border-amber-500/10">
                        <Star size={10} className="fill-amber-500 text-amber-500" /> Rated {order.rating.food}★
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {order.date} <span className="opacity-30">•</span> ID: <span className="text-zinc-500 dark:text-zinc-400 font-mono">CRV-{order.orderId}</span>
                  </p>

                  <p className="text-[13px] text-zinc-600 dark:text-zinc-300 font-medium truncate max-w-lg leading-relaxed">
                    {(order.displayItems || order.items).map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                  </p>

                  <div className="flex items-center gap-3 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-550 font-black uppercase tracking-widest">
                      <CreditCard size={11} /> Paid via {order.paymentMethod || "COD"}
                    </span>
                  </div>
                </div>

                {/* 3. Middle-Right: Quick Actions (Text based) */}
                <div className="hidden lg:flex flex-col items-center justify-center gap-4 px-6 border-x border-zinc-100 dark:border-zinc-900">
                  <button 
                    onClick={() => navigate(`/order/${order.orderId}/track`)}
                    className="text-[13px] font-black text-zinc-800 dark:text-zinc-100 hover:text-brand transition-colors bg-transparent border-none outline-none cursor-pointer p-0"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handlePrintReceipt(order)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all bg-transparent border-none outline-none cursor-pointer p-0"
                  >
                    <Download size={12} /> Invoice PDF
                  </button>
                </div>

                {/* 4. Right: Price & Main Action */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 w-full lg:w-auto">
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest block mb-1">Paid Invoice</span>
                    <span className="text-lg font-black text-brand tracking-tighter leading-none">₹{order.totalAmount}</span>
                  </div>

                  <button
                    onClick={() => handleReorder(order)}
                    className="h-12 px-8 bg-brand hover:bg-brand-hover text-white text-[13px] font-black rounded-2xl transition-all hover:scale-[1.03] active:scale-97 shadow-lg shadow-brand/20 cursor-pointer border-none outline-none flex items-center justify-center gap-2 group/btn"
                  >
                    Reorder
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>

              {/* Bottom Footer Actions (Mobile + Small Details) */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-4">
                <div className="flex lg:hidden items-center gap-4">
                  <button 
                    onClick={() => navigate(`/order/${order.orderId}/track`)}
                    className="text-[12px] font-black text-zinc-800 dark:text-zinc-100 bg-transparent border-none outline-none cursor-pointer p-0"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handlePrintReceipt(order)}
                    className="text-[11px] font-bold text-zinc-400 bg-transparent border-none outline-none cursor-pointer p-0"
                  >
                    Invoice PDF
                  </button>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                   {order.orderStatus === "Delivered" && (
                     hasRating ? (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => openReviewModal(order)}
                          className="text-[11px] font-black text-zinc-400 hover:text-amber-500 transition-colors uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer p-0"
                        >
                          Edit Review
                        </button>
                        <div className="w-[1px] h-3 bg-zinc-100 dark:bg-zinc-900" />
                        <button
                          onClick={() => triggerDeleteReview(order)}
                          className="flex items-center gap-1.5 text-[11px] font-black text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer p-0"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openReviewModal(order)}
                        className="flex items-center gap-1.5 text-[11px] font-black text-zinc-400 hover:text-amber-500 transition-colors uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer p-0"
                      >
                        <Star size={12} /> Rate Order
                      </button>
                    )
                   )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* RATING / REVIEW MODAL WITH SUCCESS ANIMATIONS - RENDERED VIA PORTAL */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {activeReviewOrder && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Modal Backdrop Scrim */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { if (!showSuccessAnim) setActiveReviewOrder(null); }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              />

              {/* Modal Body - Centered with proper z-index and scrolling */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-50 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <AnimatePresence mode="wait">
                {showSuccessAnim ? (
                  /* Success Animation Feedback Card */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="py-16 px-6 flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shadow-lg relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                      >
                        <CheckCircle size={36} />
                      </motion.div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Review Saved!</h4>
                      <p className="text-xs text-zinc-400 font-semibold">Your metrics and feedback comments are live on the restaurant reviews section.</p>
                    </div>
                  </motion.div>
                ) : (
                  /* Interactive Form with subratings & character count */
                  /* allow modal content scrolling */
                  <motion.div key="form" className="p-6 space-y-5 text-left">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                      <div className="flex-1">
                        <span className="text-[9px] bg-brand/10 text-brand px-2.5 py-1 rounded-full font-black uppercase tracking-wider inline-block">Campus Taste Audit</span>
                        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight mt-2 line-clamp-2">
                          {activeReviewOrder.restaurantName}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveReviewOrder(null)}
                        className="flex-shrink-0 ml-3 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-colors border-none outline-none cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitRating} className="space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:dark:bg-zinc-855 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                      
                      {/* Section 1: Culinary & Delivery Experience (UNIFIED SHEET) */}
                      <div className="p-5 bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900/60 dark:to-zinc-950/60 rounded-2xl border border-black/[0.03] dark:border-white/[0.03] shadow-xs space-y-4">
                        <div className="border-b border-black/[0.04] dark:border-white/[0.04] pb-2 text-left">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-black uppercase tracking-widest block">Experience Ratings</span>
                        </div>

                        {/* Overall Experience */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-1">
                          <div className="text-left">
                            <span className="text-xs text-zinc-850 dark:text-zinc-150 font-bold">Overall Experience</span>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">How was your culinary experience in total?</p>
                          </div>
                          <div className="flex items-center gap-3 justify-start sm:justify-end">
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = hoverOverall ? star <= hoverOverall : star <= ratingStars;
                                return (
                                  <button
                                    type="button"
                                    key={star}
                                    onClick={() => handleStarSelection(star)}
                                    onMouseEnter={() => setHoverOverall(star)}
                                    onMouseLeave={() => setHoverOverall(0)}
                                    className="focus:outline-none hover:scale-125 transition-transform bg-transparent border-none outline-none cursor-pointer p-0"
                                  >
                                    <Star
                                      size={22}
                                      className={`transition-all duration-300 ${
                                        isFilled 
                                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]' 
                                          : 'text-zinc-200 dark:text-zinc-800'
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                            <span className="h-8 w-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-lg font-bold flex items-center justify-center border border-amber-500/20 transition-all duration-300 animate-fade-in" title="Your sentiment">
                              {selectedEmoji}
                            </span>
                          </div>
                        </div>

                        {/* Food Quality */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-1 border-t border-black/[0.02] dark:border-white/[0.02] pt-3">
                          <div className="text-left">
                            <span className="text-xs text-zinc-855 dark:text-zinc-150 font-bold">🍔 Food Quality</span>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">Taste, temperature, and recipe freshness</p>
                          </div>
                          <div className="flex items-center gap-1 justify-start sm:justify-end">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFilled = hoverFood ? star <= hoverFood : star <= foodStars;
                              return (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setFoodStars(star)}
                                  onMouseEnter={() => setHoverFood(star)}
                                  onMouseLeave={() => setHoverFood(0)}
                                  className="focus:outline-none hover:scale-115 transition-transform bg-transparent border-none outline-none cursor-pointer p-0"
                                >
                                  <Star
                                    size={16}
                                    className={`transition-all duration-300 ${
                                      isFilled 
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]' 
                                        : 'text-zinc-200 dark:text-zinc-800'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Delivery speed */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-1 border-t border-black/[0.02] dark:border-white/[0.02] pt-3">
                          <div className="text-left">
                            <span className="text-xs text-zinc-855 dark:text-zinc-150 font-bold">🛵 Delivery Speed</span>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">Rider etiquette and delivery speed</p>
                          </div>
                          <div className="flex items-center gap-1 justify-start sm:justify-end">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFilled = hoverDelivery ? star <= hoverDelivery : star <= deliveryStars;
                              return (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setDeliveryStars(star)}
                                  onMouseEnter={() => setHoverDelivery(star)}
                                  onMouseLeave={() => setHoverDelivery(0)}
                                  className="focus:outline-none hover:scale-115 transition-transform bg-transparent border-none outline-none cursor-pointer p-0"
                                >
                                  <Star
                                    size={16}
                                    className={`transition-all duration-300 ${
                                      isFilled 
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]' 
                                        : 'text-zinc-200 dark:text-zinc-800'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Packaging quality */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-1 border-t border-black/[0.02] dark:border-white/[0.02] pt-3">
                          <div className="text-left">
                            <span className="text-xs text-zinc-855 dark:text-zinc-150 font-bold">📦 Packaging Quality</span>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">Spill-proof, seal, and clean packing</p>
                          </div>
                          <div className="flex items-center gap-1 justify-start sm:justify-end">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFilled = hoverPackaging ? star <= hoverPackaging : star <= packagingStars;
                              return (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setPackagingStars(star)}
                                  onMouseEnter={() => setHoverPackaging(star)}
                                  onMouseLeave={() => setHoverPackaging(0)}
                                  className="focus:outline-none hover:scale-115 transition-transform bg-transparent border-none outline-none cursor-pointer p-0"
                                >
                                  <Star
                                    size={16}
                                    className={`transition-all duration-300 ${
                                      isFilled 
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]' 
                                        : 'text-zinc-200 dark:text-zinc-800'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Individual Dish Ratings (List style) */}
                      {activeReviewOrder.items && activeReviewOrder.items.length > 0 && (
                        <div className="p-5 bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900/60 dark:to-zinc-950/60 rounded-2xl border border-black/[0.03] dark:border-white/[0.03] shadow-xs space-y-3.5">
                          <div className="border-b border-black/[0.04] dark:border-white/[0.04] pb-2 text-left">
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-black uppercase tracking-widest block">Item Feedback (Optional)</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {activeReviewOrder.items.map((item) => {
                              const dishImg = menuItemImages[item.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80";
                              const currentDishRating = dishRatings[item.id] || 5;
                              return (
                                <div key={item.id} className="flex items-center justify-between gap-3 py-1.5 px-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.01] rounded-xl transition-all">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-black/[0.04] dark:border-white/[0.05] flex-shrink-0">
                                      <DishImage src={dishImg} alt={item.name} dishName={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left min-w-0">
                                      <h5 className="text-[11px] font-bold text-zinc-850 dark:text-zinc-200 leading-tight truncate max-w-[120px]">{item.name}</h5>
                                      <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-semibold">{item.quantity}x • {formatPrice(item.price)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-0.5 flex-shrink-0">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        type="button"
                                        key={star}
                                        onClick={() => {
                                          setDishRatings(prev => ({ ...prev, [item.id]: star }));
                                        }}
                                        className="focus:outline-none hover:scale-120 transition-transform bg-transparent border-none outline-none cursor-pointer p-0"
                                      >
                                        <Star
                                          size={12}
                                          className={`transition-all duration-300 ${
                                            star <= currentDishRating 
                                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" 
                                              : "text-zinc-200 dark:text-zinc-850"
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Section 3: Emoji & Written Feedback Dual-Column Container */}
                      <div className="p-5 bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900/60 dark:to-zinc-950/60 rounded-2xl border border-black/[0.03] dark:border-white/[0.03] shadow-xs grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Column 1: Emoji reactions */}
                        <div className="space-y-3.5 text-left flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-black uppercase tracking-widest block mb-1">Choose Reaction Emoji</span>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 font-medium">Select a reaction sticker for your review badge</p>
                          </div>
                          <div className="grid grid-cols-8 gap-1.5 w-full pt-1">
                            {emojiStickers.map((emo) => (
                              <button
                                type="button"
                                key={emo}
                                onClick={() => setSelectedEmoji(emo)}
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-base border transition-all duration-300 hover:scale-115 cursor-pointer bg-transparent ${
                                  selectedEmoji === emo 
                                    ? 'border-amber-400 bg-amber-500/10 dark:bg-amber-500/20 scale-110 shadow-md shadow-amber-500/10' 
                                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50'
                                }`}
                              >
                                {emo}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Column 2: Feedback text */}
                        <div className="space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-black uppercase tracking-widest block">Comments / review text</span>
                            <span className={`text-[9px] font-bold ${reviewComment.length > 450 ? 'text-brand' : 'text-zinc-400'}`}>
                              {reviewComment.length} / 500
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            maxLength={500}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Brief comments on taste, delivery speed, and packaging..."
                            className="w-full p-2.5 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-xs font-semibold rounded-xl outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all resize-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                          />
                        </div>
                      </div>

                      {/* Submit / Save / Delete Buttons */}
                      {activeReviewOrder.rating ? (
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => triggerDeleteReview(activeReviewOrder)}
                            className="h-10 flex-1 border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            Delete Review
                          </button>
                          <button
                            type="submit"
                            className="h-10 flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 border-none outline-none cursor-pointer"
                          >
                            <MessageSquare size={13} />
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          className="h-10 w-full bg-brand hover:bg-brand-hover text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-99 shadow-md shadow-brand/10 flex items-center justify-center gap-1.5 border-none outline-none cursor-pointer pt-2"
                        >
                          <MessageSquare size={13} />
                          Submit Review
                        </button>
                      )}
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
        document.getElementById('modal-root')
      )}

      {/* DELETE CONFIRMATION OVERLAY MODAL - RENDERED VIA PORTAL */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {deleteConfirmOrder && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmOrder(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-50 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4"
              >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto">
                <ShieldAlert size={24} />
              </div>
              
              <div className="space-y-1 text-center">
                <h4 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Delete Review?</h4>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold leading-relaxed">
                  Are you sure you want to permanently delete your verified review for <span className="font-extrabold text-zinc-700 dark:text-zinc-300">{deleteConfirmOrder.restaurantName}</span>? This action will remove it from the restaurant profile instantly.
                </p>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmOrder(null)}
                  className="flex-1 h-10 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border-none outline-none cursor-pointer"
                >
                  No, Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border-none outline-none cursor-pointer animate-pulse"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
        document.getElementById('modal-root')
      )}
    </div>
  );
}
