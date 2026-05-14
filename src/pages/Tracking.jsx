import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getLiveChatResponse, loadLocalChatHistory, saveLocalChatHistory } from '../services/geminiService';

// use shared brand assets across payment flow
import logo from '../assets/logo.png';
import ReviewModal from '../components/common/ReviewModal';
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
  MessageSquare,
  Send,
  Download
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

  const handlePrintReceipt = () => {
    if (!orderToShow) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to download your receipt.");
      return;
    }
    
    // Construct order item rows
    const itemRows = orderToShow.items.map(item => `
      <tr style="border-bottom: 1px solid #f3f4f6; font-size: 13px;">
        <td style="padding: 12px 0; font-weight: 600; color: #1f2937; text-align: left;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: \${item.isVeg ? '#10b981' : '#ef4444'}; margin-right: 6px;"></span>
          \${item.name}
          \${item.selectedCustomizations && item.selectedCustomizations.length > 0 
            ? \`<div style="font-size: 10px; color: #6b7280; font-weight: 500; margin-top: 2px; padding-left: 14px;">\${item.selectedCustomizations.map(c => c.name).join(', ')}</div>\` 
            : ''}
        </td>
        <td style="padding: 12px 0; text-align: center; color: #4b5563;">\${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-family: monospace; font-weight: bold; color: #1f2937;">₹\${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Instructions markup
    let instructionsSection = '';
    if (orderToShow.cookingInstructions || orderToShow.deliveryInstruction) {
      instructionsSection = `
        <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; text-align: left;">
          <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 10px; margin-top: 0;">Special Instructions</h3>
          \${orderToShow.cookingInstructions ? \`
            <div style="font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 8px;">
              <strong style="color: #ea580c;">🍳 Chef Note:</strong> \${orderToShow.cookingInstructions}
            </div>
          \` : ''}
          \${orderToShow.deliveryInstruction ? \`
            <div style="font-size: 12px; font-weight: 500; color: #374151;">
              <strong style="color: #2563eb;">🛵 Rider Note:</strong> <span style="text-transform: capitalize;">\${orderToShow.deliveryInstruction.replace('-', ' ')}</span>
            </div>
          \` : ''}
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Crave Receipt - Order #\${orderToShow.orderId}</title>
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
                <div class="meta-value" style="font-family: monospace; letter-spacing: 0.5px;">\${orderToShow.orderId}</div>
              </div>
            </div>
          </div>

          <div class="details-grid">
            <div class="restaurant-box">
              <div class="meta-label" style="color: #b45309;">ORDERED FROM</div>
              <div class="meta-value" style="font-size: 14px; color: #78350f; margin-top: 4px;">\${orderToShow.restaurantName}</div>
              <div style="font-size: 11px; color: #92400e; font-weight: 500; margin-top: 2px;">\${orderToShow.locality || 'Crave Kitchen'}</div>
              <div style="font-size: 11px; color: #92400e; font-weight: 600; margin-top: 8px;">Date: \${orderToShow.date}</div>
            </div>
            <div class="address-box">
              <div class="meta-label" style="color: #15803d;">DELIVERED TO</div>
              <div class="meta-value" style="font-size: 13px; color: #14532d; margin-top: 4px;">\${orderToShow.deliveryAddress?.fullName || 'Valued Customer'}</div>
              <div style="font-size: 11px; color: #166534; font-weight: 500; margin-top: 2px; line-height: 1.4;">
                \${orderToShow.deliveryAddress?.flatNo ? \`\${orderToShow.deliveryAddress.flatNo}, \` : ''}
                \${orderToShow.deliveryAddress?.area || 'Campus Address'}
              </div>
              <div style="font-size: 11px; color: #166534; font-weight: 600; margin-top: 8px;">Method: \${orderToShow.paymentMethod || 'UPI Payment'}</div>
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
              \${itemRows}
            </tbody>
          </table>

          <div class="totals-table">
            <div class="totals-row">
              <span>Subtotal</span>
              <span style="font-family: monospace;">₹\${(orderToShow.totalAmount - 15).toFixed(2)}</span>
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
              <span style="font-family: monospace; color: #ff385c;">₹\${orderToShow.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          \${instructionsSection}

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

  const orderId = orderToShow?.orderId || id || 'general';
  const riderStorageKey = `rider_chat_${orderId}`;

  // States
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  
  // Rider communications states
  // Rider chat states
  const [isRiderMessaging, setIsRiderMessaging] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isRiderTyping, setIsRiderTyping] = useState(false);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  // reviewMode: 'new' | 'view' | 'edit' — controls ReviewModal state
  const [reviewMode, setReviewMode] = useState('new');

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


  // Initialize and load rider chat when messaging opens
  useEffect(() => {
    if (isRiderMessaging) {
      const saved = loadLocalChatHistory(riderStorageKey);
      if (saved && saved.length > 0) {
        setChatMessages(saved);
      } else {
        const assignedRider = orderToShow?.riderInfo || riders[0];
        const greeting = `Hi there! I'm ${assignedRider?.name || 'your rider'}. I have securely loaded your hot meal package and I am speeding down the shortest route to your block. Do you need any condiments or specific gate drop-off instructions?`;
        const initial = [
          {
            id: 'm-1',
            sender: 'rider',
            text: greeting,
            timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
        setChatMessages(initial);
        saveLocalChatHistory(riderStorageKey, initial);
      }
    }
  }, [isRiderMessaging, riderStorageKey, orderToShow]);


  const handleSendChatMessage = async (text) => {
    if (!text.trim() || isRiderTyping) return;
    const userMsg = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    saveLocalChatHistory(riderStorageKey, updatedMessages);
    setNewMessageText("");

    setIsRiderTyping(true);
    
    try {
      const assignedRider = orderToShow?.riderInfo || riders[0];
      const context = {
        restaurantName: orderToShow?.restaurantName || "ITM Canteen",
        orderStatus: orderToShow?.orderStatus || "Out for Delivery",
        eta: orderToShow?.eta || "10",
        deliveryAddress: orderToShow?.deliveryAddress,
        riderName: assignedRider?.name || "Rohan"
      };

      // Call Gemini customer support/rider assistant
      const replyText = await getLiveChatResponse({
        type: "rider",
        message: text,
        chatHistory: chatMessages,
        context
      });

      setIsRiderTyping(false);
      const replyMsg = {
        id: `m-${Date.now() + 1}`,
        sender: 'rider',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedWithReply = [...updatedMessages, replyMsg];
      setChatMessages(updatedWithReply);
      saveLocalChatHistory(riderStorageKey, updatedWithReply);
    } catch (err) {
      console.error("Failed to fetch rider reply:", err);
      setIsRiderTyping(false);
      const errorMsg = {
        id: `m-err-${Date.now()}`,
        sender: 'rider',
        text: "Support is temporarily unavailable.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const updatedWithError = [...updatedMessages, errorMsg];
      setChatMessages(updatedWithError);
      saveLocalChatHistory(riderStorageKey, updatedWithError);
    }
  };

  // Handle live delivery simulation (survives page reloads perfectly via timestamp tracking!)
  useEffect(() => {
    if (!orderToShow) return;

    const updateStageAndNotifications = () => {
      // Force Delivered status stage directly if order is set as Delivered
      if (orderToShow.orderStatus === "Delivered") {
        setCurrentStageIdx(7);
        if (trackingStageIdx !== 7) {
          setTrackingStageIdx(7);
        }
        return;
      }

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
        toast.success("Restaurant accepted your order", {
          description: "Our kitchen partner has approved your culinary instructions."
        });
        break;
      case 2:
        toast.info("Food preparation started", {
          description: "Fresh ingredients are being sliced and sizzled on the grill."
        });
        break;
      case 3:
        toast.success("Your meal is cooked & packed", {
          description: "A secure thermal seal has been applied. Ready for courier pick up."
        });
        break;
      case 4:
        toast.info("Courier partner picked up your parcel", {
          description: `${orderToShow?.riderInfo?.name || "Rider"} is securing your hot package.`
        });
        break;
      case 5:
        toast.success("Courier is on the way", {
          description: "Your delivery hero is riding down the quickest route."
        });
        break;
      case 6:
        toast.warning("Order is arriving soon", {
          description: "Your delivery hero is just a few meters away. Keep your phone handy!"
        });
        break;
      case 7:
        toast.success("Order delivered successfully", {
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

  // review handlers are now managed by the unified ReviewModal component

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
                      {(() => {
                        const names = [...new Set(orderToShow.items.map(i => i.restaurantName || i.restaurant).filter(Boolean))];
                        return names.length > 0 ? names.join(', ') : (orderToShow.restaurantName || "CRAVE Partner");
                      })()}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1.5 border-t border-emerald-500/10 mt-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {orderToShow.rating ? (
                        <>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                          <Check size={11} strokeWidth={3} />
                          Review Submitted
                        </span>
                        <button
                          onClick={() => {
                            setReviewMode('view');
                            setIsRatingModalOpen(true);
                          }}
                          className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xs transition-colors cursor-pointer border-none outline-none flex items-center gap-1.5"
                        >
                          <MessageSquare size={12} />
                          View Review
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewMode('new');
                          setIsRatingModalOpen(true);
                        }}
                        className="h-10 px-4 bg-brand hover:bg-brand-hover text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-md shadow-brand/10 transition-all focus:outline-none flex items-center gap-1.5 cursor-pointer"
                      >
                        <Star size={12} className="fill-current" />
                        Rate Order
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleOneClickReorder(orderToShow)}
                    className="h-10 px-4 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-brand hover:text-brand text-[11px] font-black uppercase tracking-widest rounded-xl transition-all focus:outline-none cursor-pointer"
                  >
                    Order Again
                  </button>
                </div>
              </div>
            )}

            {/* 8-stage progress indicator inside bounded scroll container */}
            <div className="max-h-[165px] overflow-y-auto scrollbar-thin pr-1 border border-black/[0.04] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01] rounded-2xl p-3 shadow-inner">
              <ProgressBar currentStageIdx={currentStageIdx} />
            </div>

            {/* Delivery Partner Details (assigned starting at Stage 1: Confirmed) */}
            {currentStageIdx >= 1 && assignedRider && (
              <div className="space-y-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] animate-scale-up">
                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Courier Partner Details</h3>
                <RiderCard 
                  rider={assignedRider} 
                  currentStageIdx={currentStageIdx} 
                  onCall={() => {
                    // Open native phone dialer instead of in-app VOIP simulation
                    const riderPhone = assignedRider?.phone || '+919876543210';
                    window.open(`tel:${riderPhone}`, '_self');
                    toast.success(`Calling ${assignedRider?.name || 'Rider'}...`, {
                      description: 'Opening your phone\'s dialer app.',
                      duration: 2000
                    });
                  }}
                  onMessage={() => setIsRiderMessaging(true)}
                />
              </div>
            )}

             {/* Quick helpdesk action widgets */}
            <div className="pt-4 border-t border-black/[0.05] dark:border-white/[0.05] flex gap-3 flex-wrap">
              <button 
                onClick={() => setSupportOpen(true, 'chat')}
                className="flex-1 min-w-[130px] h-10 px-4 border border-brand/30 bg-brand/5 hover:bg-brand hover:text-white text-brand rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
              >
                <HelpCircle size={13} />
                24/7 Chat Support
              </button>
              <button 
                onClick={() => setSupportOpen(true, 'helpline')}
                className="flex-1 min-w-[130px] h-10 px-4 border border-brand/30 bg-brand/5 hover:bg-brand hover:text-white text-brand rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
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
            
            <div className="relative h-[210px] bg-gray-50 dark:bg-neutral-900 border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-inner">
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
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Receipt & Order Items</h3>
              <button
                onClick={handlePrintReceipt}
                className="flex items-center gap-1 bg-brand/5 hover:bg-brand hover:text-white text-brand px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-none outline-none"
              >
                <Download size={11} />
                Download PDF
              </button>
            </div>
            
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

              {/* Persistent Order Instructions Block */}
              {(orderToShow.cookingInstructions || orderToShow.deliveryInstruction) && (
                <div className="border-t border-black/[0.05] dark:border-white/[0.05] pt-3 mt-2 space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-550 block text-left">Your Instructions</span>
                  <div className="space-y-1">
                    {orderToShow.cookingInstructions && (
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-orange-500/[0.04] dark:bg-orange-500/[0.02] border border-orange-500/10 text-[10px] text-gray-700 dark:text-gray-300 font-medium text-left">
                        <span className="font-extrabold text-orange-600 dark:text-orange-400 shrink-0">🍳 Chef Note:</span>
                        <span className="truncate">{orderToShow.cookingInstructions}</span>
                      </div>
                    )}
                    {orderToShow.deliveryInstruction && (
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-500/[0.04] dark:bg-blue-500/[0.02] border border-blue-500/10 text-[10px] text-gray-700 dark:text-gray-300 font-medium text-left">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 shrink-0">🛵 Rider Note:</span>
                        <span className="capitalize">{orderToShow.deliveryInstruction.replace('-', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* POST-DELIVERY REVIEW — unified review component */}
      <ReviewModal
        isOpen={isRatingModalOpen}
        onClose={() => { setIsRatingModalOpen(false); setReviewMode('new'); }}
        order={orderToShow}
        mode={reviewMode}
        onSubmit={(ratingData) => {
          // save review to order store
          rateOrder(orderToShow.orderId, ratingData);

          // save to review store
          const activeUser = useAuthStore.getState().user;
          const authorName = activeUser ? activeUser.name : "You";
          useReviewStore.getState().submitReview(orderToShow.restaurantId, {
            id: `review-${orderToShow.orderId}`,
            userName: authorName,
            avatar: authorName.substring(0, 2).toUpperCase(),
            rating: ratingData.foodQuality,
            foodQuality: ratingData.foodQuality,
            deliveryExperience: ratingData.deliveryExperience,
            packaging: ratingData.packaging,
            text: ratingData.comment,
            emoji: ratingData.emoji,
            orderId: orderToShow.orderId,
            date: ratingData.isEdited ? "Edited just now" : "Just now",
            items: orderToShow.items || [],
            dishRatings: ratingData.dishRatings,
          });

          setIsRatingModalOpen(false);
          setReviewMode('new');
          toast.success(ratingData.isEdited ? "Review updated!" : "Review submitted!", {
            description: "Your feedback is live on the restaurant page."
          });
        }}
        onEdit={() => setReviewMode('edit')}
        onDelete={() => {
          rateOrder(orderToShow.orderId, null);
          useReviewStore.getState().deleteReview(orderToShow.restaurantId, orderToShow.orderId);
          setIsRatingModalOpen(false);
          setReviewMode('new');
          toast.success("Review deleted successfully");
        }}
      />

      {/* Rider Call — now handled via native tel: link, no in-app overlay needed */}

      {/* 2. Rider Chat Drawer Modal */}
      <AnimatePresence>
        {isRiderMessaging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-xs flex justify-end"
          >
            {/* Overlay click close handler */}
            <div className="absolute inset-0" onClick={() => setIsRiderMessaging(false)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-950 h-full shadow-2xl flex flex-col border-l border-black/[0.04] dark:border-white/[0.04] z-10"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 text-brand font-extrabold flex items-center justify-center text-xs relative">
                    {assignedRider?.imageInitials || "RH"}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-neutral-950 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-850 dark:text-gray-100">{assignedRider?.name || "Delivery Hero"}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Courier Partner • Online</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRiderMessaging(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-500 dark:text-neutral-400 flex items-center justify-center cursor-pointer transition-colors outline-none focus:outline-none"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Chat Bubbles Scroll Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map(msg => {
                  const isMe = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-scale-up`}>
                      <div className={`max-w-[80%] rounded-2xl p-3.5 space-y-1 text-left ${
                        isMe 
                          ? 'bg-brand text-white rounded-tr-none' 
                          : 'bg-neutral-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100 rounded-tl-none'
                      }`}>
                        <p className="text-xs font-semibold leading-relaxed">{msg.text}</p>
                        <span className={`text-[8px] font-bold block text-right ${isMe ? 'text-white/60' : 'text-neutral-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Simulated typing indicator bubble */}
                {isRiderTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-neutral-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Reply Chips */}
              <div className="p-3 border-t border-black/[0.03] dark:border-white/[0.03] bg-neutral-50/40 dark:bg-neutral-900/10 flex flex-wrap gap-2">
                {[
                  "Please leave it at the gate",
                  "I am outside",
                  "Call me when you arrive",
                  "Please bring it fast, thanks!"
                ].map(chipText => (
                  <button
                    key={chipText}
                    type="button"
                    onClick={() => handleSendChatMessage(chipText)}
                    disabled={isRiderTyping}
                    className="px-3 py-1.5 text-[10px] font-bold bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] rounded-full hover:border-brand hover:text-brand text-gray-600 dark:text-gray-350 transition-all cursor-pointer focus:outline-none"
                  >
                    {chipText}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage(newMessageText);
                }}
                className="p-4 border-t border-black/[0.05] dark:border-white/[0.05] flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Type secure message..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  disabled={isRiderTyping}
                  className="flex-1 h-10 bg-neutral-50 dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || isRiderTyping}
                  className="w-10 h-10 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
