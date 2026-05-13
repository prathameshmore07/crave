import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ArrowRight, Sparkles, MessageSquare, AlertCircle, ShoppingBag, Send } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'sonner';
import DishImage from '../components/common/DishImage';

// Seed dishes available inside the group room
const ROOM_MENU = [
  { id: "grp-1", name: "Classic Masala Dosa", price: 110, isVeg: true, imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=150" },
  { id: "grp-2", name: "Crispy Golden Fries", price: 90, isVeg: true, imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150" },
  { id: "grp-3", name: "Double Cheese Burger", price: 160, isVeg: true, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150" },
  { id: "grp-4", name: "Paneer Roll Extra Spicy", price: 140, isVeg: true, imageUrl: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/02/paneer-biryani-recipe.jpg" },
  { id: "grp-5", name: "Sizzling Chocolate Brownie", price: 120, isVeg: true, imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150" },
  { id: "grp-6", name: "Tandoori Chicken Momos", price: 180, isVeg: false, imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=150" }
];

export default function GroupOrder() {
  const addItemToMainCart = useCartStore((state) => state.addItem);

  // Core States
  const [roomId, setRoomId] = useState("");
  const [activeRoom, setActiveRoom] = useState(null); // { id: "HOSTEL-205", name: "Hostel Night Cravings", members: [...] }
  const [roomNameInput, setRoomNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");

  // Room Specific States
  const [activityFeed, setActivityFeed] = useState([]);
  const [typingMember, setTypingMember] = useState("");
  const [groupCart, setGroupCart] = useState([]); // { memberName: "Prathamesh", item: {...}, qty: 1 }

  // Custom User Cart Inside Room
  const [userItems, setUserItems] = useState([]);

  // Mock Members Available in Room Simulation
  const mockMembers = [
    { name: "Daksh", avatar: "👨‍💻", badge: "Spice Warrior 🌶️" },
    { name: "Vyom", avatar: "🧑‍🚀", badge: "Dessert Addict 🍰" },
    { name: "Prerna", avatar: "👩‍🎨", badge: "Biggest Spender 💀" }
  ];

  // Simulated live additions by mock room members
  useEffect(() => {
    if (!activeRoom) return;

    // Set up initial seed items in group cart to make it look active right away!
    setGroupCart([
      { memberName: "Prathamesh (You)", item: ROOM_MENU[2], qty: 1, avatar: "🔥", badge: "Silent Orderer 👀" },
      { memberName: "Daksh", item: ROOM_MENU[3], qty: 1, avatar: "👨‍💻", badge: "Spice Warrior 🌶️" },
      { memberName: "Vyom", item: ROOM_MENU[4], qty: 1, avatar: "🧑‍🚀", badge: "Dessert Addict 🍰" }
    ]);

    setActivityFeed([
      "Daksh created the shared cart 🚀",
      "Vyom joined the party 👋",
      "Prathamesh joined the party 👋"
    ]);

    // Periodically simulate friends typing and adding foods!
    const triggerInterval = setInterval(() => {
      const activeMember = mockMembers[Math.floor(Math.random() * mockMembers.length)];
      const randomFood = ROOM_MENU[Math.floor(Math.random() * ROOM_MENU.length)];

      // 1. Simulate typing state
      setTypingMember(`${activeMember.name} is choosing...`);

      // 2. Add item after 1.5s
      setTimeout(() => {
        setTypingMember("");
        
        // shared group order cart state
        setGroupCart(prev => {
          const existing = prev.find(i => i.memberName === activeMember.name && i.item.id === randomFood.id);
          if (existing) {
            return prev.map(i => i.memberName === activeMember.name && i.item.id === randomFood.id ? { ...i, qty: i.qty + 1 } : i);
          } else {
            return [...prev, {
              memberName: activeMember.name,
              item: randomFood,
              qty: 1,
              avatar: activeMember.avatar,
              badge: activeMember.badge
            }];
          }
        });

        setActivityFeed(prev => [
          `${activeMember.name} added ${randomFood.name} to the shared pot!`,
          ...prev.slice(0, 7) // Keep last 8 lines
        ]);

        toast(`${activeMember.name} added ${randomFood.name}!`, {
          icon: '🍲',
          position: 'bottom-right'
        });
      }, 1500);

    }, 15000); // Trigger simulation update every 15s

    return () => clearInterval(triggerInterval);
  }, [activeRoom]);

  // Handles Local User Adding Item Inside Shared Room
  const handleUserAddItem = (dish) => {
    if (!activeRoom) return;

    setGroupCart(prev => {
      const existing = prev.find(i => i.memberName === "Prathamesh (You)" && i.item.id === dish.id);
      if (existing) {
        return prev.map(i => i.memberName === "Prathamesh (You)" && i.item.id === dish.id ? { ...i, qty: i.qty + 1 } : i);
      } else {
        return [...prev, {
          memberName: "Prathamesh (You)",
          item: dish,
          qty: 1,
          avatar: "🔥",
          badge: "Silent Orderer 👀"
        }];
      }
    });

    setActivityFeed(prev => [
      `You added ${dish.name} 🛒`,
      ...prev
    ]);

    toast.success(`You added ${dish.name} to the group cart!`, {
      position: 'bottom-center'
    });
  };

  // Handles Room Creation
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!roomNameInput.trim()) return;

    const generatedCode = `CRAVE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setActiveRoom({
      id: generatedCode,
      name: roomNameInput.trim(),
      members: ["Prathamesh (You)", "Daksh", "Vyom"]
    });
    toast.success(`Welcome to room ${generatedCode}!`, {
      position: 'top-center'
    });
  };

  // Handles joining room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setActiveRoom({
      id: joinCodeInput.trim().toUpperCase(),
      name: "Hostel Night Bites",
      members: ["Prathamesh (You)", "Daksh", "Vyom", "Prerna"]
    });
    toast.success(`Joined Room Successfully!`, {
      position: 'top-center'
    });
  };

  // auto split bill calculation
  const calculateBillSplit = () => {
    // 1. Compute individual subtotal mapping
    const memberTotals = {};
    let subtotal = 0;

    groupCart.forEach(cartItem => {
      const itemCost = cartItem.item.price * cartItem.qty;
      subtotal += itemCost;
      memberTotals[cartItem.memberName] = (memberTotals[cartItem.memberName] || 0) + itemCost;
    });

    // 2. Fixed shared parameters
    const gstRate = 0.18; // 18% GST
    const flatDeliveryFee = 40;
    const flatPlatformFee = 10;

    const totalGST = subtotal * gstRate;
    const totalAdditionalFees = flatDeliveryFee + flatPlatformFee;
    const grandTotal = subtotal + totalGST + totalAdditionalFees;

    const numMembers = Object.keys(memberTotals).length || 1;

    // 3. Map individual breakdown (fair split: individual subtotal + share of tax/fees)
    const splitBreakdown = Object.entries(memberTotals).map(([member, total]) => {
      const individualGST = total * gstRate;
      const individualSharedFees = totalAdditionalFees / numMembers;
      const individualGrandTotal = total + individualGST + individualSharedFees;

      // Find avatar & social badge
      const cartRef = groupCart.find(i => i.memberName === member);

      return {
        member,
        subtotal: total,
        gst: individualGST,
        sharedFees: individualSharedFees,
        totalPayable: individualGrandTotal,
        avatar: cartRef ? cartRef.avatar : "🔥",
        badge: cartRef ? cartRef.badge : "Silent Orderer 👀"
      };
    });

    return {
      subtotal,
      totalGST,
      totalAdditionalFees,
      grandTotal,
      splitBreakdown
    };
  };

  const { subtotal, totalGST, totalAdditionalFees, grandTotal, splitBreakdown } = calculateBillSplit();

  // Transfer all group cart items onto the central checkout cart
  const handleFinalizeGroupOrder = () => {
    const restaurantMock = {
      id: "rest-canteen",
      name: "ITM Canteen & Lounge",
      locality: "Campus Core",
      imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300"
    };

    // Push each grouped item onto the central Zustand cart state store
    groupCart.forEach(cartItem => {
      for (let i = 0; i < cartItem.qty; i++) {
        addItemToMainCart(cartItem.item, restaurantMock);
      }
    });

    toast.success(`Group Order items pushed to main cart! Proceeding to Checkout...`, {
      icon: '🛒',
      position: 'bottom-center'
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-3 px-2 space-y-8 min-h-[calc(100vh-180px)]">
      
      {/* Title Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-3xl font-black tracking-tight text-neutral-850 dark:text-neutral-50 flex items-center justify-center gap-2">
          <Users size={28} className="text-brand fill-brand/10" />
          Group Hub & Splitter
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium max-w-md mx-auto">
          Start a live room, invite dorm mates, add your favorite plates, and let Crave calculate split totals automatically!
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!activeRoom ? (
          // Room setup lobbies
          <motion.div
            key="lobby"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto"
          >
            {/* Create Room Box */}
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] shadow-lg flex flex-col justify-between space-y-5">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand bg-brand/10 px-2 py-0.5 rounded-full">New Room</span>
                <h3 className="text-base font-black text-neutral-850 dark:text-neutral-50">Create Group Cart</h3>
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                  Start an ordering lobby for your hostel block, team meeting, or dinner friends.
                </p>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-3 mt-2">
                <input
                  type="text"
                  placeholder="e.g., Hostel Night Cravings 🍕"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  className="w-full h-11 bg-neutral-50 dark:bg-neutral-950 border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 text-xs font-bold text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <button
                  type="submit"
                  className="w-full h-11 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  Create Room <ArrowRight size={12} strokeWidth={3} />
                </button>
              </form>
            </div>

            {/* Join Room Box */}
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] shadow-lg flex flex-col justify-between space-y-5">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">Join Room</span>
                <h3 className="text-base font-black text-neutral-850 dark:text-neutral-50">Enter Lobby Code</h3>
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                  Have a shared invite code? Enter it below to dive straight into the active cart room.
                </p>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-3 mt-2">
                <input
                  type="text"
                  placeholder="e.g., CRAVE-XYZ78"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="w-full h-11 bg-neutral-50 dark:bg-neutral-950 border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 text-xs font-bold text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-brand uppercase"
                />
                <button
                  type="submit"
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  Join Lobby <ArrowRight size={12} strokeWidth={3} />
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          // Active group dashboard
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left: Canteen Menu Selection & Live Streams (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Room Header Banner */}
              <div className="p-4 bg-gradient-to-r from-neutral-900 to-neutral-950 text-white rounded-3xl flex items-center justify-between border border-white/[0.04]">
                <div>
                  <span className="text-[8px] uppercase tracking-widest text-brand font-black block">Active Lobby</span>
                  <h3 className="text-base font-black truncate">{activeRoom.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium leading-none mt-1">Invitation Code: <span className="text-white font-extrabold">{activeRoom.id}</span></p>
                </div>
                
                {/* Simulated Typing State Stream */}
                {typingMember && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-brand/10 text-brand px-3 py-1.5 rounded-xl border border-brand/20 text-xs font-bold animate-pulse"
                  >
                    {typingMember}
                  </motion.div>
                )}
              </div>

              {/* Shared Food Selection Grid */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Campus Bites Menu</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROOM_MENU.map((dish) => (
                    <div 
                      key={dish.id}
                      className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-3 shadow-2xs group hover:border-brand/25 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                          <DishImage src={dish.imageUrl} alt={dish.name} dishName={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-extrabold text-neutral-850 dark:text-neutral-100 truncate">{dish.name}</h5>
                          <p className="text-[11px] text-neutral-900 dark:text-neutral-200 font-black mt-0.5">{formatPrice(dish.price)}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUserAddItem(dish)}
                        className="w-8 h-8 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-black/[0.04] dark:border-white/[0.04] text-neutral-600 dark:text-neutral-400 hover:bg-brand hover:text-white hover:border-brand flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Activity Streams Feed */}
              <div className="p-4 bg-white dark:bg-neutral-900 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] space-y-3 shadow-inner max-h-[220px] overflow-hidden relative">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Lobby Activity Stream</h4>
                <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-1">
                  <AnimatePresence>
                    {activityFeed.map((feed, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 leading-snug"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0" />
                        {feed}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Split Totals & Badges (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Shared Cart items pot */}
              <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-3">
                  <h3 className="text-sm font-black text-neutral-850 dark:text-neutral-50">Shared Cart Pot</h3>
                  <span className="text-[10px] font-black bg-brand/10 text-brand px-2.5 py-0.5 rounded-full">
                    {groupCart.reduce((acc, i) => acc + i.qty, 0)} Items Added
                  </span>
                </div>

                {groupCart.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {groupCart.map((cartItem, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.03] dark:border-white/[0.03]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm leading-none">{cartItem.avatar}</span>
                            <span className="text-xs font-black text-neutral-850 dark:text-neutral-100">{cartItem.memberName}</span>
                            <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded-md font-bold truncate max-w-[100px]">
                              {cartItem.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1 pl-5">
                            {cartItem.item.name} <span className="font-bold text-neutral-750 dark:text-neutral-200">x{cartItem.qty}</span>
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-neutral-850 dark:text-neutral-100">
                          {formatPrice(cartItem.item.price * cartItem.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                    Shared Cart Pot is empty. Tap items to pile them up!
                  </div>
                )}
              </div>

              {/* Dynamic Split Bill Calculator Summary */}
              {groupCart.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-indigo-50/20 via-white to-white dark:from-indigo-950/10 dark:via-neutral-900 dark:to-neutral-900 rounded-3xl border border-indigo-500/10 dark:border-indigo-500/20 shadow-lg space-y-4">
                  <h3 className="text-sm font-black text-neutral-850 dark:text-neutral-50 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-indigo-500" />
                    Auto-Split Calculations
                  </h3>

                  <div className="space-y-2.5">
                    {splitBreakdown.map((memberSplit, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-2xl bg-white dark:bg-neutral-950/40 border border-black/[0.03] dark:border-white/[0.03] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm leading-none">{memberSplit.avatar}</span>
                            <h4 className="text-xs font-black text-neutral-800 dark:text-neutral-150">{memberSplit.member}</h4>
                          </div>
                          <span className="text-xs font-black text-indigo-650 dark:text-indigo-400">
                            {formatPrice(memberSplit.totalPayable)}
                          </span>
                        </div>

                        {/* Cost distribution tags */}
                        <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[9px] text-neutral-400 font-medium pl-5">
                          <span>Items: {formatPrice(memberSplit.subtotal)}</span>
                          <span>Tax (18%): {formatPrice(memberSplit.gst)}</span>
                          <span>Fees Split: {formatPrice(memberSplit.sharedFees)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shared Pool Overall Summary */}
                  <div className="border-t border-black/[0.05] dark:border-white/[0.05] pt-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-500">
                      <span>Shared Subtotal:</span>
                      <span className="font-bold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Shared GST & Service Taxes:</span>
                      <span className="font-bold">{formatPrice(totalGST)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Shared Delivery & Platform Charges:</span>
                      <span className="font-bold">{formatPrice(totalAdditionalFees)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-neutral-850 dark:text-neutral-100 border-t border-dashed border-black/[0.05] dark:border-white/[0.05] pt-2.5">
                      <span>Total Shared Basket Cost:</span>
                      <span className="text-brand font-black text-base">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Transfer to Checkout Cart */}
                  <button
                    onClick={handleFinalizeGroupOrder}
                    className="w-full h-11 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none mt-2"
                  >
                    Transfer to Main Cart <ShoppingBag size={12} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
