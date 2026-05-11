import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useOrderStore } from '../../store/orderStore';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { useReviewStore } from '../../store/reviewStore';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/formatPrice';
import { ShoppingBag, ChevronRight, CheckCircle, Compass, Star, CreditCard, MessageSquare, X, ShieldAlert, Trash2 } from 'lucide-react';
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
  let orders = orderHistory || [];
  if (orders.length === 0 && user) {
    orders = user.orderHistory || [];
  }

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

    const authorName = user ? user.name : "You (Student Verified)";

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

      <div className="space-y-4">
        {orders.map((order) => {
          const liveStatus = getOrderLiveStatus(order);
          const { isActive, isDelivered, isCancelled, status } = liveStatus;
          const hasRating = order.rating;

          return (
            <div 
              key={order.orderId}
              className="p-5 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 rounded-2xl flex flex-col hover:shadow-xs hover:border-zinc-200 dark:hover:border-zinc-800 transition-all relative overflow-hidden"
            >
              {/* Order content flex row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-4">
                <div className="flex gap-4 items-start min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-black/[0.05] flex-shrink-0">
                    <DishImage 
                      src={order.restaurantImageUrl || order.restaurantImage} 
                      alt={order.restaurantName}
                      dishName={order.restaurantName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-gray-850 dark:text-gray-100">{order.restaurantName}</span>
                      
                      {isActive ? (
                        <span className="text-[8px] bg-brand/10 text-brand font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                          <Compass size={9} className="animate-spin" style={{ animationDuration: '3s' }} /> {status}
                        </span>
                      ) : isCancelled ? (
                        <span className="text-[8px] bg-red-500/10 text-red-600 dark:text-red-400 font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                          Cancelled
                        </span>
                      ) : (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle size={9} /> Delivered
                        </span>
                      )}

                      {hasRating && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Star size={9} className="fill-amber-500 text-amber-500" /> Rated {order.rating.food}★
                        </span>
                      )}
                    </div>

                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                      {order.date} • ID: <span className="font-mono font-black">{order.orderId}</span>
                    </p>
                    
                    {/* Items summary list */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 pt-1 leading-normal font-medium truncate max-w-md">
                      {order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                    </p>

                    {/* Payment method info */}
                    <span className="inline-flex items-center gap-1 text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider pt-1">
                      <CreditCard size={10} /> Paid via {order.paymentMethod || "Secure UPI"}
                    </span>
                  </div>
                </div>

                {/* Pricing breakdown & Action Column */}
                <div className="flex flex-col items-start md:items-end gap-4 border-t md:border-t-0 border-black/[0.04] dark:border-white/[0.04] pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-[8px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest block">Paid Invoice</span>
                    <span className="text-sm font-black text-brand tracking-tight">{formatPrice(order.totalAmount)}</span>
                  </div>
                  
                  {/* Action Button Groups - Organized by Order Status */}
                  <div className="flex flex-col w-full md:w-auto gap-3">
                    
                    {/* REVIEW ACTIONS - Show only for delivered orders */}
                    {isDelivered && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {hasRating ? (
                          <>
                            <button
                              onClick={() => openReviewModal(order)}
                              className="h-9 px-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer border-none outline-none flex items-center gap-1.5 flex-shrink-0"
                            >
                              <MessageSquare size={12} strokeWidth={2.5} />
                              Edit Review
                            </button>
                            <button
                              onClick={() => triggerDeleteReview(order)}
                              className="h-9 w-9 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border-none outline-none flex-shrink-0"
                              title="Delete Review"
                            >
                              <Trash2 size={13} strokeWidth={2.5} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openReviewModal(order)}
                            className="h-9 px-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer border-none outline-none flex items-center gap-1.5 flex-shrink-0"
                          >
                            <MessageSquare size={12} strokeWidth={2.5} />
                            Rate Order
                          </button>
                        )}
                      </div>
                    )}

                    {/* ACTIVE ORDER ACTIONS */}
                    {isActive && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => navigate(`/order/${order.orderId}/track`)}
                          className="h-9 px-3.5 bg-brand hover:bg-brand-hover active:opacity-90 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md shadow-brand/20 cursor-pointer border-none outline-none flex items-center justify-center gap-1.5 w-full"
                        >
                          <Compass size={12} className="animate-spin" style={{ animationDuration: '5s' }} strokeWidth={2.5} />
                          Track Order
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toast.info("Connecting you to Support...", { description: `Order reference: ${order.orderId}` })}
                            className="flex-1 h-9 px-2.5 border border-black/[0.08] dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-900 active:bg-gray-100 dark:active:bg-neutral-800 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                          >
                            Support
                          </button>
                          <button
                            onClick={() => toast.success("Calling delivery agent...", { description: "Rider ID: RD-9082" })}
                            className="flex-1 h-9 px-2.5 border border-black/[0.08] dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-900 active:bg-gray-100 dark:active:bg-neutral-800 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                          >
                            Call Rider
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CANCELLED ORDER ACTION */}
                    {isCancelled && (
                      <button
                        onClick={() => toast.info("Opening our resolution desk...", { description: `Order reference: ${order.orderId}` })}
                        className="h-9 px-3.5 border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white active:bg-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer w-full"
                      >
                        Help Center
                      </button>
                    )}

                    {/* REORDER ACTION - Show for delivered or cancelled */}
                    {(isDelivered || isCancelled) && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="h-9 px-3.5 border-2 border-brand/40 hover:border-brand bg-brand/5 hover:bg-brand text-brand hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 w-full md:w-auto"
                      >
                        Reorder
                        <ChevronRight size={11} strokeWidth={3} />
                      </button>
                    )}

                  </div>
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

                    <form onSubmit={handleSubmitRating} className="space-y-4 max-h-[calc(90vh-240px)] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:dark:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                      
                      {/* Row 1: Overall Experience */}
                      <div className="space-y-2 py-3 px-4 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100/40 dark:border-zinc-800/40">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider">Overall Experience</span>
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                            {ratingStars} ★ {selectedEmoji}
                          </span>
                        </div>
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
                                className="focus:outline-none hover:scale-115 transition-transform bg-transparent border-none outline-none cursor-pointer"
                              >
                                <Star
                                  size={24}
                                  className={`transition-colors ${
                                    isFilled ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 dark:text-zinc-700'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 2: Food Quality Sub-rating */}
                      <div className="space-y-1.5 py-2 px-4 bg-zinc-50/20 dark:bg-zinc-900/20 rounded-xl border border-zinc-100/10 dark:border-zinc-800/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-550 dark:text-zinc-450 font-extrabold uppercase tracking-wider">🍔 Food Quality</span>
                          <span className="text-[11px] text-zinc-450 font-bold">{foodStars}★</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = hoverFood ? star <= hoverFood : star <= foodStars;
                            return (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setFoodStars(star)}
                                onMouseEnter={() => setHoverFood(star)}
                                onMouseLeave={() => setHoverFood(0)}
                                className="focus:outline-none hover:scale-110 transition-transform bg-transparent border-none outline-none cursor-pointer"
                              >
                                <Star
                                  size={18}
                                  className={`transition-colors ${
                                    isFilled ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 dark:text-zinc-800'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 3: Delivery Experience Sub-rating */}
                      <div className="space-y-1.5 py-2 px-4 bg-zinc-50/20 dark:bg-zinc-900/20 rounded-xl border border-zinc-100/10 dark:border-zinc-800/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-550 dark:text-zinc-450 font-extrabold uppercase tracking-wider">🛵 Delivery Experience</span>
                          <span className="text-[11px] text-zinc-450 font-bold">{deliveryStars}★</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = hoverDelivery ? star <= hoverDelivery : star <= deliveryStars;
                            return (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setDeliveryStars(star)}
                                onMouseEnter={() => setHoverDelivery(star)}
                                onMouseLeave={() => setHoverDelivery(0)}
                                className="focus:outline-none hover:scale-110 transition-transform bg-transparent border-none outline-none cursor-pointer"
                              >
                                <Star
                                  size={18}
                                  className={`transition-colors ${
                                    isFilled ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 dark:text-zinc-800'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 4: Packaging Sub-rating */}
                      <div className="space-y-1.5 py-2 px-4 bg-zinc-50/20 dark:bg-zinc-900/20 rounded-xl border border-zinc-100/10 dark:border-zinc-800/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-550 dark:text-zinc-450 font-extrabold uppercase tracking-wider">📦 Packaging Quality</span>
                          <span className="text-[11px] text-zinc-450 font-bold">{packagingStars}★</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = hoverPackaging ? star <= hoverPackaging : star <= packagingStars;
                            return (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setPackagingStars(star)}
                                onMouseEnter={() => setHoverPackaging(star)}
                                onMouseLeave={() => setHoverPackaging(0)}
                                className="focus:outline-none hover:scale-110 transition-transform bg-transparent border-none outline-none cursor-pointer"
                              >
                                <Star
                                  size={18}
                                  className={`transition-colors ${
                                    isFilled ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 dark:text-zinc-800'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 5: Individual Dish Ratings */}
                      {activeReviewOrder.items && activeReviewOrder.items.length > 0 && (
                        <div className="space-y-3 py-3 px-4 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100/40 dark:border-zinc-800/40">
                          <span className="text-[10px] text-zinc-550 dark:text-zinc-450 font-black uppercase tracking-wider block mb-1">🍕 Rate Ordered Dishes</span>
                          <div className="space-y-3">
                            {activeReviewOrder.items.map((item) => {
                              const dishImg = menuItemImages[item.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80";
                              const currentDishRating = dishRatings[item.id] || 5;
                              return (
                                <div key={item.id} className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100/30 dark:border-zinc-900/40">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 rounded-md overflow-hidden bg-zinc-50 border border-zinc-200/40 flex-shrink-0">
                                      <DishImage src={dishImg} alt={item.name} dishName={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left min-w-0">
                                      <h5 className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight truncate max-w-[150px]">{item.name}</h5>
                                      <span className="text-[9px] text-zinc-400 font-semibold">{item.quantity}x • {formatPrice(item.price)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        type="button"
                                        key={star}
                                        onClick={() => {
                                          setDishRatings(prev => ({ ...prev, [item.id]: star }));
                                        }}
                                        className="focus:outline-none hover:scale-115 transition-transform bg-transparent border-none outline-none cursor-pointer p-0"
                                      >
                                        <Star
                                          size={14}
                                          className={star <= currentDishRating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800"}
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

                      {/* Emoji Reactions Selection Stickers */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-wider block">Choose Reaction Emoji</label>
                        <div className="flex items-center gap-2.5">
                          {emojiStickers.map((emo) => (
                            <button
                              type="button"
                              key={emo}
                              onClick={() => setSelectedEmoji(emo)}
                              className={`h-9 w-9 rounded-full flex items-center justify-center text-lg border transition-all hover:scale-115 cursor-pointer bg-transparent ${
                                selectedEmoji === emo 
                                  ? 'border-amber-400 bg-amber-500/10 scale-110' 
                                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                              }`}
                            >
                              {emo}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Box and Character Counter */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider block">Write comments/review text</label>
                          <span className={`text-[10px] font-bold ${reviewComment.length > 450 ? 'text-brand' : 'text-zinc-400'}`}>
                            {reviewComment.length} / 500
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          maxLength={500}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Tell us about the recipe, delivery speed, and packing..."
                          className="w-full p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold rounded-xl outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors resize-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                        />
                      </div>

                      {/* Submit / Save / Delete Buttons */}
                      {activeReviewOrder.rating ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => triggerDeleteReview(activeReviewOrder)}
                            className="h-11 flex-1 border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            Delete Review
                          </button>
                          <button
                            type="submit"
                            className="h-11 flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 border-none outline-none cursor-pointer"
                          >
                            <MessageSquare size={13} />
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          className="h-11 w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 border-none outline-none cursor-pointer"
                        >
                          <MessageSquare size={13} />
                          Submit Verified Review
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
