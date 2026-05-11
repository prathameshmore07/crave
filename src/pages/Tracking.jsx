import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar from '../components/tracking/ProgressBar';
import RiderCard from '../components/tracking/RiderCard';
import ETATimer from '../components/tracking/ETATimer';
import { useOrderStore } from '../store/orderStore';
import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { getUserJsonItem } from '../utils/storage';
import { riders } from '../data/riders';

// use shared brand assets across payment flow
import logo from '../assets/logo.png';
import { 
  CheckCircle2, 
  PhoneCall, 
  Compass, 
  AlertTriangle, 
  HelpCircle, 
  ArrowLeft, 
  TrendingUp, 
  Sparkles, 
  ShoppingBag, 
  Star, 
  Camera, 
  X, 
  Clock, 
  Check,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../utils/formatPrice';

const stageTexts = [
  "Order placed successfully! Reaching out to the kitchen.",
  "Chef confirmed your order! Preparations starting soon.",
  "Fresh ingredients are being chopped! Your meal is cooking.",
  "Your meal is hot, packed, and waiting for courier pickup.",
  "Rider picked up your hot food package! On the quickest route.",
  "Rider is heading towards your location. Speeding down the quickest route.",
  "Your hot meal is arriving soon! Keep your phone active.",
  "Meal Delivered! Enjoy your fresh and delicious bites."
];

export default function Tracking() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Zustand Store integrations
  const { activeOrder, trackingStageIdx, setTrackingStageIdx, orderHistory, setOrderDelivered, rateOrder } = useOrderStore();
  const addToCart = useCartStore((state) => state.addItem);
  const setCartOpen = useUiStore((state) => state.setCartOpen);
  const setSupportOpen = useUiStore((state) => state.setSupportOpen);

  // States
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  
  // Rating states
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [packagingRating, setPackagingRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dishRatings, setDishRatings] = useState({});

  // Refs to prevent duplicate toast notifications
  const notifiedStages = useRef({});

  // lock body scroll while review modal open
  useEffect(() => {
    if (isRatingModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isRatingModalOpen]);

  // Match the route order ID or fallback to activeOrder / latest_order
  let orderToShow = activeOrder;
  if (id && activeOrder?.orderId !== id) {
    const historicalOrder = orderHistory.find(o => o.orderId === id);
    if (historicalOrder) {
      orderToShow = historicalOrder;
    } else {
      try {
        const parsed = getUserJsonItem('latest_order');
        if (parsed && parsed.orderId === id) {
          orderToShow = parsed;
        }
      } catch (e) {
        console.error("Failed to parse latest_order from localStorage:", e);
      }
    }
  }

  // Handle live delivery simulation (survives page reloads perfectly via timestamp tracking!)
  useEffect(() => {
    if (!orderToShow) return;

    const updateStageAndNotifications = () => {
      // Calculate elapsed seconds since order timestamp
      const elapsed = Math.floor((Date.now() - new Date(orderToShow.timestamp).getTime()) / 1000);
      
      let stage = 0;
      if (elapsed >= 60) stage = 7;
      else if (elapsed >= 45) stage = 6;
      else if (elapsed >= 30) stage = 5;
      else if (elapsed >= 20) stage = 4;
      else if (elapsed >= 15) stage = 3;
      else if (elapsed >= 10) stage = 2;
      else if (elapsed >= 5) stage = 1;

      // Update local state
      setCurrentStageIdx(stage);

      // Save progress to store
      if (stage !== trackingStageIdx) {
        setTrackingStageIdx(stage);
      }

      // Mark delivered automatically if stage is 7
      if (stage === 7 && orderToShow.orderStatus !== "Delivered") {
        setOrderDelivered(orderToShow.orderId);
      }

      // Trigger unique Sonner Toast exactly once on transition
      if (stage > 0 && !notifiedStages.current[stage]) {
        notifiedStages.current[stage] = true;
        triggerToastNotification(stage);
      }
    };

    updateStageAndNotifications();
    const timer = setInterval(updateStageAndNotifications, 1000);

    return () => clearInterval(timer);
  }, [orderToShow, trackingStageIdx]);

  const triggerToastNotification = (stage) => {
    switch (stage) {
      case 1:
        toast.success("🍳 Restaurant accepted your order!", {
          description: "Our kitchen partner has approved your culinary instructions."
        });
        break;
      case 2:
        toast.info("🍜 Food preparation started!", {
          description: "Fresh ingredients are being sliced and sizzled on the grill."
        });
        break;
      case 3:
        toast.success("🛍️ Your meal is cooked & packed!", {
          description: "A secure thermal seal has been applied. Ready for courier pick up."
        });
        break;
      case 4:
        toast.info("🚴 Courier partner picked up your parcel!", {
          description: `${orderToShow?.riderInfo?.name || "Rider"} is securing your hot package.`
        });
        break;
      case 5:
        toast.success("⚡ Courier is on the way!", {
          description: "Your delivery hero is riding down the quickest route."
        });
        break;
      case 6:
        toast.warning("🏠 Order is arriving soon!", {
          description: "Your delivery hero is just a few meters away. Keep your phone handy!"
        });
        break;
      case 7:
        toast.success("🎉 Order delivered successfully!", {
          description: "Thank you for choosing Crave! Enjoy your warm meal."
        });
        break;
      default:
        break;
    }
  };

  const handleOneClickReorder = (order) => {
    if (!order || !order.items) return;

    // Preserve customized options
    order.items.forEach(item => {
      addToCart({
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
        locality: order.locality
      });
    });

    toast.success(`Copied past order from ${order.restaurantName}!`, {
      description: "Customizations preserved. Basket drawer opened."
    });
    setCartOpen(true);
  };

  const submitReviewFeedback = (e) => {
    e.preventDefault();
    
    // // prevent empty review submission
    if (!reviewComment.trim()) {
      toast.error("Please enter a short comment.");
      return;
    }

    const emojiReaction = foodRating >= 5 ? "🥰" : foodRating >= 4 ? "🙂" : foodRating >= 3 ? "😐" : foodRating >= 2 ? "🙁" : "😠";

    const ratingObj = {
      food: foodRating,
      foodQuality: foodRating,
      deliveryExperience: deliveryRating,
      packaging: packagingRating,
      comment: reviewComment,
      emoji: emojiReaction,
      timestamp: Date.now(),
      dishRatings: dishRatings
    };

    // // save review for delivered order
    rateOrder(orderToShow.orderId, ratingObj);

    const activeUser = useAuthStore.getState().user;
    const authorName = activeUser ? activeUser.name : "You (Student Verified)";

    useReviewStore.getState().submitReview(orderToShow.restaurantId, {
      id: `review-${orderToShow.orderId}`,
      userName: authorName,
      avatar: authorName.substring(0, 2).toUpperCase(),
      rating: foodRating,
      foodQuality: foodRating,
      deliveryExperience: deliveryRating,
      packaging: packagingRating,
      text: reviewComment,
      emoji: emojiReaction,
      orderId: orderToShow.orderId,
      date: "Just now",
      items: orderToShow.items || [],
      dishRatings: dishRatings
    });

    setIsRatingModalOpen(false);
    setIsEditingReview(false);
    toast.success("Review submitted successfully", {
      description: "Your detailed review is live on the restaurant reviews section!"
    });

    // Reset review form states
    setReviewComment("");
    setUploadedImage(null);
  };

  // enable edit/delete review for verified orders
  const handleStartEdit = () => {
    if (orderToShow.rating) {
      setFoodRating(orderToShow.rating.foodQuality || orderToShow.rating.food || 5);
      setDeliveryRating(orderToShow.rating.deliveryExperience || orderToShow.rating.food || 5);
      setPackagingRating(orderToShow.rating.packaging || orderToShow.rating.food || 5);
      setReviewComment(orderToShow.rating.comment || "");
      setDishRatings(orderToShow.rating.dishRatings || {});
    }
    setIsEditingReview(true);
  };

  const handleDeleteTrackingReview = () => {
    rateOrder(orderToShow.orderId, null);
    useReviewStore.getState().deleteReview(orderToShow.restaurantId, orderToShow.orderId);
    setIsRatingModalOpen(false);
    setIsEditingReview(false);
    toast.success("Review deleted successfully");
  };

  const handleMockImageUpload = () => {
    setUploadedImage("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&auto=format&fit=crop&q=80");
    toast.info("Photo loaded successfully! (Demonstration mock photo attached)");
  };

  // Custom UI Skeletons & Suggestions for EMPTY STATE
  if (!orderToShow) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-8 animate-fade-in">
        <div className="relative w-24 h-24 bg-brand/5 dark:bg-brand/10 rounded-full flex items-center justify-center text-brand mx-auto shadow-inner">
          <Compass size={44} className="animate-spin text-brand" style={{ animationDuration: '15s' }} />
          <div className="absolute inset-0 border-2 border-dashed border-brand/20 rounded-full animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-850 dark:text-gray-100 font-sans tracking-tight">No active deliveries right now</h2>
          <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed max-w-sm mx-auto font-semibold">
            Your stomach shouldn't wait! Add fresh items from your favorite local kitchens to trigger live, cinema-style order tracking.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-md mx-auto pt-4">
          <button
            onClick={() => navigate('/')}
            className="h-12 w-full bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand/10 cursor-pointer focus:outline-none"
          >
            Browse Restaurants
          </button>
          
          {orderHistory.length > 0 && (
            <div className="text-left space-y-3.5 pt-8 border-t border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={12} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Order again suggestions</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {orderHistory.slice(0, 3).map((hist) => (
                  <div
                    key={hist.orderId}
                    className="p-4 bg-white dark:bg-dark-surface border border-black/[0.05] dark:border-white/[0.05] rounded-xl flex items-center justify-between gap-4 hover:border-brand/30 transition-all shadow-xs"
                  >
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{hist.restaurantName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium leading-tight">
                        {hist.items ? hist.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : 'Past order'}
                      </p>
                      <p className="text-[9px] text-gray-400 mt-1 font-semibold">{hist.date} • {formatPrice(hist.totalAmount)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOneClickReorder(hist)}
                        className="h-8 px-3 bg-brand/5 hover:bg-brand text-brand hover:text-white text-[10px] font-bold rounded-lg transition-all focus:outline-none"
                      >
                        Reorder
                      </button>
                      <button
                        onClick={() => navigate(`/order/${hist.orderId}/track`)}
                        className="h-8 px-3 border border-gray-200 dark:border-gray-800 hover:border-brand/40 text-gray-600 dark:text-gray-400 rounded-lg text-[10px] font-semibold transition-all focus:outline-none"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const assignedRider = orderToShow.riderInfo || riders[0];

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in space-y-6">
      
      {/* Header breadcrumb row */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand transition-colors outline-none cursor-pointer"
        >
          <ArrowLeft size={12} />
          Return to Hub
        </button>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
          Placed on {orderToShow.date}
        </span>
      </div>

      {/* Grid of tracking map + timeline status */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left column: Status Timeline & Actions (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 bg-white dark:bg-dark-surface border border-black/[0.05] dark:border-white/[0.05] rounded-3xl space-y-5 transition-colors shadow-md relative overflow-hidden">
            
            {/* Compact Premium Tracking Header (Zero Repetitive Brand Bloat) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.04] dark:border-white/[0.04] pb-4.5 animate-fade-in">
              <div className="flex items-center gap-3.5 text-left min-w-0">
                {/* Micro Restaurant Thumbnail */}
                {(orderToShow.restaurantImageUrl || orderToShow.restaurantImage) && (
                  <img
                    src={orderToShow.restaurantImageUrl || orderToShow.restaurantImage}
                    alt={orderToShow.restaurantName || "Restaurant"}
                    className="w-11 h-11 rounded-xl object-cover border border-black/[0.05] dark:border-white/[0.05] shadow-xs shrink-0"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80";
                    }}
                  />
                )}
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand leading-none">
                      {orderToShow.restaurantName || "CRAVE Partner"}
                    </span>
                    <span className="text-gray-300 dark:text-neutral-800 text-[10px]">•</span>
                    <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 font-extrabold leading-none">
                      ID: {orderToShow.orderId}
                    </span>
                  </div>
                  <h2 className="text-sm font-black text-neutral-850 dark:text-gray-100 mt-1.5 leading-tight">
                    {stageTexts[currentStageIdx]}
                  </h2>
                </div>
              </div>

              {/* Status Badge & Tracker */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                {currentStageIdx < 7 ? (
                  <span className="text-[9px] font-black text-white bg-gradient-to-r from-brand to-rose-500 px-3 py-1.5 rounded-lg uppercase tracking-wider animate-pulse flex items-center gap-1.5 shadow-sm shadow-brand/10">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                    </span>
                    Live GPS Tracker
                  </span>
                ) : (
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                    <Check size={11} strokeWidth={3} />
                    Delivered
                  </span>
                )}
              </div>
            </div>

            {/* Real-time countdown timer */}
            {currentStageIdx < 7 ? (
              <ETATimer orderTimestamp={orderToShow.timestamp} initialEta={orderToShow.ETA || 30} />
            ) : (
              <div className="p-5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-450 text-xs font-extrabold uppercase tracking-wider">
                  <CheckCircle2 size={20} className="text-emerald-500 animate-bounce" />
                  Delivered successfully at {new Date(orderToShow.deliveredTimestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                  Hope you love your warm meal! Thank you for ordering with Crave. We value your dining feedback.
                </p>
                
                {/* Post Delivery Action Row */}
                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <button
                    onClick={() => {
                      setIsEditingReview(false);
                      setIsRatingModalOpen(true);
                    }}
                    className="h-10 px-4 bg-brand text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-hover shadow-md shadow-brand/10 transition-all focus:outline-none flex items-center gap-1.5 cursor-pointer"
                  >
                    <Star size={12} className="fill-current" />
                    {orderToShow.rating ? "Edit / View Review" : "Rate Order"}
                  </button>
                  <button
                    onClick={() => handleOneClickReorder(orderToShow)}
                    className="h-10 px-4 border border-brand/20 text-brand text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-brand/5 transition-all focus:outline-none"
                  >
                    Order Again
                  </button>
                </div>
              </div>
            )}

            {/* 8-stage progress indicator */}
            <ProgressBar currentStageIdx={currentStageIdx} />

            {/* Delivery Partner Details (assigned starting at Stage 4: Picked Up) */}
            {currentStageIdx >= 4 && assignedRider && (
              <div className="space-y-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] animate-scale-up">
                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Courier Partner Details</h3>
                <RiderCard rider={assignedRider} currentStageIdx={currentStageIdx} />
              </div>
            )}

             {/* Quick helpdesk action widgets */}
            <div className="pt-4 border-t border-black/[0.05] dark:border-white/[0.05] flex gap-3 flex-wrap">
              <button 
                onClick={() => setSupportOpen(true, 'chat')}
                className="flex-1 min-w-[130px] h-10 px-4 border border-black/[0.08] dark:border-white/[0.08] bg-gray-50/40 dark:bg-neutral-850/40 hover:border-brand hover:text-brand text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
              >
                <HelpCircle size={13} />
                24/7 Chat Support
              </button>
              <button 
                onClick={() => setSupportOpen(true, 'helpline')}
                className="flex-1 min-w-[130px] h-10 px-4 border border-black/[0.08] dark:border-white/[0.08] bg-gray-50/40 dark:bg-neutral-850/40 hover:border-brand hover:text-brand text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
              >
                <PhoneCall size={12} />
                Support Helpline
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Map Route & Order Items (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mock Interactive Map Panel */}
          <div className="p-4 bg-white dark:bg-dark-surface border border-black/[0.05] dark:border-white/[0.05] rounded-3xl space-y-3.5 shadow-md">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Compass size={12} className="text-brand animate-spin" style={{ animationDuration: '10s' }} />
              Live Delivery Route Map
            </h3>
            
            <div className="relative h-[260px] bg-gray-50 dark:bg-neutral-900 border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-inner">
              {/* Stylized background grid matching coordinates */}
              <div className="absolute inset-0 opacity-15 dark:opacity-5">
                <svg width="100%" height="100%">
                  <pattern id="roadGridTrackingNew" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#roadGridTrackingNew)" />
                </svg>
              </div>

              {/* Route path connector vector map */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 50,180 Q 110,60 170,120 T 230,30"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  className="opacity-35"
                />
                {/* Active fill line index */}
                <path
                  d="M 50,180 Q 110,60 170,120 T 230,30"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    strokeDasharray: "400",
                    strokeDashoffset: 400 - (currentStageIdx / 7) * 220
                  }}
                />
              </svg>

              {/* Culinary Restaurant Source Node */}
              <div className="absolute left-[8%] bottom-[12%] flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center relative">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 relative z-10" />
                </div>
                <span className="text-[8px] font-black text-gray-500 mt-1 uppercase tracking-wider bg-white/95 dark:bg-neutral-800/95 px-1.5 py-0.5 rounded shadow-xs max-w-[90px] truncate">
                  {orderToShow.restaurantName || "Kitchen"}
                </span>
              </div>

              {/* Destination Address Node */}
              <div className="absolute right-[8%] top-[10%] flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center relative">
                  <span className="w-2 h-2 rounded-full bg-brand animate-ping absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-brand relative z-10" />
                </div>
                <span className="text-[8px] font-black text-gray-500 mt-1 uppercase tracking-wider bg-white/95 dark:bg-neutral-800/95 px-1.5 py-0.5 rounded shadow-xs">
                  Your Home
                </span>
              </div>

              {/* Active Moving Rider Pin */}
              {currentStageIdx >= 4 && currentStageIdx < 7 && (
                <div
                  className="absolute transition-all duration-1000 ease-out z-20 flex flex-col items-center"
                  style={{
                    left: currentStageIdx === 4 ? "40%" : currentStageIdx === 5 ? "60%" : "82%",
                    top: currentStageIdx === 4 ? "52%" : currentStageIdx === 5 ? "38%" : "22%",
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <div className="p-1.5 bg-brand text-white rounded-full shadow-lg relative">
                    <Compass size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <span className="text-[7px] font-black uppercase text-brand tracking-widest mt-0.5 bg-white/90 dark:bg-neutral-850/90 px-1 rounded shadow-2xs">
                    Moving
                  </span>
                </div>
              )}

              {/* Status banner */}
              <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-dark-surface/95 border border-black/[0.04] dark:border-white/[0.04] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">
                {currentStageIdx === 7 ? "Delivered" : "Rider Dispatched"}
              </div>
            </div>
          </div>

          {/* Ordered items details card */}
          <div className="p-5 bg-white dark:bg-dark-surface border border-black/[0.05] dark:border-white/[0.05] rounded-3xl space-y-3.5 shadow-md">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">Receipt & Order Items</h3>
            
            <div className="divide-y divide-black/[0.03] dark:divide-white/[0.03] max-h-48 overflow-y-auto pr-1">
              {orderToShow.items.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="py-2.5 flex justify-between items-start text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {item.isVeg ? <div className="veg-dot flex-shrink-0" /> : <div className="nonveg-dot flex-shrink-0" />}
                      <span className="font-bold text-gray-800 dark:text-gray-200">{item.name}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">× {item.quantity}</span>
                    </div>
                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                      <p className="text-[9px] text-gray-400 font-medium mt-0.5 leading-tight">
                        {item.selectedCustomizations.map(c => c.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-black/[0.05] dark:border-white/[0.05] pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(orderToShow.totalAmount - 15)}</span>
              </div>
              <div className="flex justify-between text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                <span>Packaging charge</span>
                <span className="font-mono">{formatPrice(15)}</span>
              </div>
              <div className="flex justify-between text-gray-850 dark:text-gray-100 font-black pt-1 border-t border-dashed border-black/[0.05] dark:border-white/[0.05]">
                <span>Total Paid via {orderToShow.paymentMethod || "UPI"}</span>
                <span className="font-mono text-brand">{formatPrice(orderToShow.totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* POST-DELIVERY REVIEW OVERLAY MODAL */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-full h-full min-h-screen">
          {/* Modal Backdrop Scrim - covers entire page with blur and prevents interaction */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsRatingModalOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm w-full h-full min-h-screen z-[9998]"
          />
          
          {/* Modal Body */}
          <div className="bg-white dark:bg-dark-surface border border-black/[0.08] dark:border-white/[0.08] w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl relative z-[9999] animate-scale-up text-left max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            
            {/* Close trigger button */}
            <button 
              onClick={() => setIsRatingModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer z-20"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1 flex-shrink-0">
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">Order Review</span>
              <h3 className="text-base font-black text-gray-850 dark:text-gray-100">Rate your experience</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Help us refine deliveries from {orderToShow.restaurantName}</p>
            </div>

            {/* allow modal content scrolling */}
            {orderToShow.rating && !isEditingReview ? (
              // Saved rating review readout
              <div className="p-4 border border-black/[0.04] dark:border-white/[0.04] bg-gray-50 dark:bg-dark-surface/50 rounded-2xl space-y-4 text-xs font-semibold overflow-y-auto flex-1 max-h-[60vh] md:max-h-[70vh] pr-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Food Quality</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < orderToShow.rating.food ? "fill-amber-500 text-amber-500" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-black/[0.03] pt-2">
                  <span className="text-gray-400">Rider Service</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < orderToShow.rating.deliveryExperience ? "fill-amber-500 text-amber-500" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-black/[0.03] pt-2">
                  <span className="text-gray-400">Packaging Integrity</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < orderToShow.rating.packaging ? "fill-amber-500 text-amber-500" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
                {orderToShow.rating.comment && (
                  <div className="border-t border-black/[0.03] pt-3 text-gray-600 dark:text-gray-300">
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-1">Your Comment</span>
                    "{orderToShow.rating.comment}"
                  </div>
                )}
                {orderToShow.rating.imageUrl && (
                  <div className="border-t border-black/[0.03] pt-2">
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider mb-2">Attached Photo</span>
                    <img src={orderToShow.rating.imageUrl} alt="Uploaded Review" className="w-14 h-14 object-cover rounded-lg border border-black/[0.06]" />
                  </div>
                )}

                {/* Actions: Edit or Delete Review */}
                <div className="flex gap-2 border-t border-black/[0.03] pt-3.5 mt-1">
                  {/* enable edit/delete review for verified orders */}
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="h-9 flex-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer border-none outline-none"
                  >
                    <MessageSquare size={12} />
                    Edit Review
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTrackingReview}
                    className="h-9 px-3 border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border-none outline-none"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              // Interactive rating review submission form
              <form onSubmit={submitReviewFeedback} className="space-y-4 overflow-y-auto flex-1 pr-1 max-h-[60vh] md:max-h-[70vh]">
                
                {/* 1. Food Rating stars */}
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-600 dark:text-gray-300">Food Quality</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        type="button"
                        key={stars}
                        onClick={() => setFoodRating(stars)}
                        className="text-amber-500 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                      >
                        <Star size={18} className={stars <= foodRating ? "fill-current" : "stroke-current text-gray-200 dark:text-gray-700"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Rider service rating */}
                <div className="flex items-center justify-between text-xs font-bold border-t border-black/[0.03] pt-2.5">
                  <span className="text-gray-600 dark:text-gray-300">Delivery Service</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        type="button"
                        key={stars}
                        onClick={() => setDeliveryRating(stars)}
                        className="text-amber-500 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                      >
                        <Star size={18} className={stars <= deliveryRating ? "fill-current" : "stroke-current text-gray-200 dark:text-gray-700"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Eco-Packaging rating */}
                <div className="flex items-center justify-between text-xs font-bold border-t border-black/[0.03] pt-2.5">
                  <span className="text-gray-600 dark:text-gray-300">Packaging Integrity</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        type="button"
                        key={stars}
                        onClick={() => setPackagingRating(stars)}
                        className="text-amber-500 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                      >
                        <Star size={18} className={stars <= packagingRating ? "fill-current" : "stroke-current text-gray-200 dark:text-gray-700"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3.5. Individual Dish Ratings */}
                {orderToShow.items && orderToShow.items.length > 0 && (
                  <div className="space-y-2.5 py-3 px-4 bg-zinc-550/5 dark:bg-zinc-900/40 rounded-2xl border border-black/[0.03] dark:border-white/[0.03] border-t">
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest block">Rate Individual Dishes:</span>
                    <div className="space-y-2">
                      {orderToShow.items.map((item) => {
                        const dRating = dishRatings[item.id] || 5;
                        return (
                          <div key={item.id} className="flex items-center justify-between gap-3 bg-white dark:bg-dark-surface p-2 rounded-xl border border-black/[0.02] dark:border-white/[0.02]">
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{item.name}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => {
                                    setDishRatings(prev => ({ ...prev, [item.id]: star }));
                                  }}
                                  className="focus:outline-none hover:scale-110 transition-transform bg-transparent border-none p-0 cursor-pointer"
                                >
                                  <Star
                                    size={13}
                                    className={star <= dRating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-neutral-800"}
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

                {/* 4. Text Review comment */}
                <div className="space-y-1 pt-2 border-t border-black/[0.03]">
                  <label htmlFor="reviewText" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Share your culinary thoughts</label>
                  <textarea
                    id="reviewText"
                    rows={3}
                    placeholder="Tell us about the spice, flavor profile, and delivery speed..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-transparent focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none"
                    required
                  />
                </div>



                {/* Submission CTA */}
                <div className="pt-3 flex gap-2">
                  {isEditingReview && (
                    <button
                      type="button"
                      onClick={() => setIsEditingReview(false)}
                      className="h-11 px-4 border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-55 dark:hover:bg-neutral-800 transition-all focus:outline-none cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="h-11 flex-1 bg-brand text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-hover shadow-md shadow-brand/10 transition-all focus:outline-none cursor-pointer"
                  >
                    {isEditingReview ? "Save Changes" : "Submit Premium Review"}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
