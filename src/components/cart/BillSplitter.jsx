import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Trash2, Check, Sparkles, DollarSign, Calculator, ChevronRight, X, Info } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'sonner';

export default function BillSplitter({ onClose }) {
  const { items: cartItems, getSubtotal } = useCartStore();

  // Active Splits Mode: 'equal' | 'item'
  const [splitMode, setSplitMode] = useState('equal');
  
  // List of active friends to split with
  const [friends, setFriends] = useState([
    { id: 'f-1', name: 'Prathamesh', avatar: '🔥' },
    { id: 'f-2', name: 'Daksh', avatar: '👨‍💻' }
  ]);
  const [newFriendName, setNewFriendName] = useState('');

  // Item assignment mapping: { [cartItemId]: friendId }
  const [assignments, setAssignments] = useState({});

  // Subtotal, taxes and calculations
  const subtotal = getSubtotal();
  const gst = subtotal * 0.18; // 18% GST
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const platformFee = subtotal > 0 ? 10 : 0;
  const grandTotal = subtotal + gst + deliveryFee + platformFee;

  // Auto assign items when cart or friends list change
  useEffect(() => {
    // Default assignment: assign all items to the first friend if not already assigned
    if (friends.length > 0) {
      const updatedAssignments = { ...assignments };
      cartItems.forEach(item => {
        if (!updatedAssignments[item.id] || !friends.some(f => f.id === updatedAssignments[item.id])) {
          updatedAssignments[item.id] = friends[0].id;
        }
      });
      setAssignments(updatedAssignments);
    }
  }, [cartItems, friends]);

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    
    // Limits max friends to keep UI exceptionally clean
    if (friends.length >= 6) {
      toast.warning("Maximum of 6 split buddies reached!", { position: "top-center" });
      return;
    }

    const avatars = ['👨‍💻', '🧑‍🚀', '👩‍🎨', '🦁', '🦉', '🦊', '🦄', '🐝'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newFriend = {
      id: `f-${Date.now()}`,
      name: newFriendName.trim(),
      avatar: randomAvatar
    };

    setFriends([...friends, newFriend]);
    setNewFriendName('');
    toast.success(`${newFriend.name} added to split pool!`, { position: "top-center" });
  };

  const handleRemoveFriend = (id) => {
    if (friends.length <= 1) {
      toast.error("Need at least 1 person to split the bill!", { position: "top-center" });
      return;
    }
    const removedFriend = friends.find(f => f.id === id);
    setFriends(friends.filter(f => f.id !== id));
    
    // Re-assign items belonging to deleted friend back to the first remaining friend
    const remainingFirstId = friends.filter(f => f.id !== id)[0].id;
    const updatedAssignments = { ...assignments };
    Object.keys(updatedAssignments).forEach(itemId => {
      if (updatedAssignments[itemId] === id) {
        updatedAssignments[itemId] = remainingFirstId;
      }
    });
    setAssignments(updatedAssignments);

    toast.info(`Removed ${removedFriend?.name}`, { position: "top-center" });
  };

  const handleAssignItem = (itemId, friendId) => {
    setAssignments(prev => ({
      ...prev,
      [itemId]: friendId
    }));
  };

  // Perform core split mathematics
  const calculateSplits = () => {
    const friendShares = friends.map(f => ({
      ...f,
      subtotal: 0,
      assignedItems: [],
      badge: null
    }));

    if (splitMode === 'equal') {
      // Equal splitting
      const equalShareSubtotal = subtotal / friends.length;
      friendShares.forEach(f => {
        f.subtotal = equalShareSubtotal;
      });
    } else {
      // Item-based splitting
      cartItems.forEach(item => {
        const assignedFriendId = assignments[item.id];
        const itemTotalCost = item.price * item.quantity;
        const targetShare = friendShares.find(fs => fs.id === assignedFriendId);
        if (targetShare) {
          targetShare.subtotal += itemTotalCost;
          targetShare.assignedItems.push(item);
        }
      });
    }

    // Distribute taxes and fixed fees proportionally or equally
    const numFriends = friends.length;
    friendShares.forEach(f => {
      // Share of tax is proportional to subtotal share
      const ratio = subtotal > 0 ? f.subtotal / subtotal : 0;
      f.gstShare = gst * ratio;
      f.feesShare = (deliveryFee + platformFee) / numFriends;
      f.totalShare = f.subtotal + f.gstShare + f.feesShare;
    });

    // Bestow award badges
    let maxSpentId = null;
    let maxSpentVal = -1;
    friendShares.forEach(f => {
      if (f.totalShare > maxSpentVal) {
        maxSpentVal = f.totalShare;
        maxSpentId = f.id;
      }
    });

    friendShares.forEach(f => {
      // 1. Biggest spender
      if (f.id === maxSpentId && maxSpentVal > 0 && numFriends > 1) {
        f.badge = { text: "Biggest Spender 💀", color: "bg-rose-500/10 text-rose-500 border border-rose-500/20" };
      }
      // 2. Dessert Addict (ordered chocolate, brownie, pastry, cold coffee)
      else if (splitMode === 'item' && f.assignedItems.some(i => /chocolate|brownie|dessert|sweet|cake|icecream|coffee/i.test(i.name))) {
        f.badge = { text: "Dessert Addict 🍰", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20" };
      }
      // 3. Broke student mode
      else if (splitMode === 'equal' || f.totalShare < (grandTotal / numFriends) * 0.8) {
        f.badge = { text: "Broke Student 💸", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" };
      }
    });

    return friendShares;
  };

  const computedShares = calculateSplits();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-xs flex flex-col justify-end md:justify-center p-3 select-none"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full max-w-lg mx-auto bg-white dark:bg-neutral-950 rounded-3xl border border-black/[0.06] dark:border-white/[0.06] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/30">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-neutral-850 dark:text-neutral-50">Dorm Bill Splitter</h2>
              <p className="text-[10px] text-neutral-400 font-medium">Auto-calculates itemized individual totals & taxes</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-500 dark:text-neutral-400 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body Scroll Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Split Mode Selector Segment */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-black/[0.02] dark:border-white/[0.02]">
            <button
              onClick={() => setSplitMode('equal')}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                splitMode === 'equal'
                  ? 'bg-white dark:bg-neutral-800 text-brand shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-850'
              }`}
            >
              Equal Split
            </button>
            <button
              onClick={() => {
                if (cartItems.length === 0) {
                  toast.error("Cart is empty!", { position: "top-center" });
                  return;
                }
                setSplitMode('item');
              }}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                splitMode === 'item'
                  ? 'bg-white dark:bg-neutral-800 text-brand shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-850'
              }`}
            >
              Item-Based Split
            </button>
          </div>

          {/* Add Split Buddy Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Users size={12} /> Split Buddies ({friends.length})
            </h3>
            
            {/* Input pill */}
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input
                type="text"
                placeholder="Add friend's name..."
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                maxLength={14}
                className="flex-1 h-10 bg-neutral-50 dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 text-xs font-bold text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer focus:outline-none"
              >
                <UserPlus size={14} /> Add
              </button>
            </form>

            {/* Friends list chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {friends.map((f) => (
                <div 
                  key={f.id}
                  className="pl-2.5 pr-1.5 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-black/[0.04] dark:border-white/[0.04] flex items-center gap-1.5"
                >
                  <span className="text-sm leading-none">{f.avatar}</span>
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{f.name}</span>
                  <button
                    onClick={() => handleRemoveFriend(f.id)}
                    className="w-5 h-5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-rose-500 flex items-center justify-center cursor-pointer focus:outline-none transition-colors"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Item-Based Assignment Matrix */}
          {splitMode === 'item' && (
            <div className="space-y-3.5">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                Assign Dishes to People
              </h3>
              
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const currentlyAssignedFriendId = assignments[item.id] || friends[0].id;
                  
                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/30 border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 truncate leading-tight">{item.name}</h4>
                        <p className="text-[10px] text-neutral-500 leading-none mt-1">
                          {formatPrice(item.price)} x{item.quantity}
                        </p>
                      </div>

                      {/* Select Friend Dropdown */}
                      <select
                        value={currentlyAssignedFriendId}
                        onChange={(e) => handleAssignItem(item.id, e.target.value)}
                        className="bg-white dark:bg-neutral-900 border border-black/[0.08] dark:border-white/[0.08] text-xs font-bold py-1 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand text-neutral-700 dark:text-neutral-300 cursor-pointer"
                      >
                        {friends.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.avatar} {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Calculated Individual Breakdowns */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              Individual Share Breakdown
            </h3>

            <div className="space-y-3">
              {computedShares.map((share) => (
                <div 
                  key={share.id}
                  className="p-4 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-50/25 dark:from-neutral-900/40 dark:to-neutral-900/10 border border-black/[0.03] dark:border-white/[0.03] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base leading-none">{share.avatar}</span>
                      <h4 className="text-xs font-black text-neutral-800 dark:text-neutral-100">{share.name}</h4>
                      {share.badge && (
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${share.badge.color}`}>
                          {share.badge.text}
                        </span>
                      )}
                    </div>

                    {/* Assigned list text info */}
                    {splitMode === 'item' && share.assignedItems.length > 0 && (
                      <p className="text-[10px] text-neutral-400 max-w-[280px] truncate">
                        Ordering: {share.assignedItems.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </p>
                    )}
                    {splitMode === 'item' && share.assignedItems.length === 0 && (
                      <p className="text-[10px] text-rose-400 flex items-center gap-1">
                        <Info size={10} /> No dishes assigned to this friend!
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-neutral-900 dark:text-neutral-50 block">
                      {formatPrice(share.totalShare)}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-medium">
                      (Base: {formatPrice(share.subtotal)} + Tax/Fees)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Summary */}
        <div className="p-5 border-t border-black/[0.05] dark:border-white/[0.05] bg-neutral-50 dark:bg-neutral-900/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 leading-none block">Total Basket Cost</span>
            <span className="text-lg font-black text-neutral-850 dark:text-neutral-50 mt-1 block">{formatPrice(grandTotal)}</span>
          </div>
          <button
            onClick={() => {
              toast.success("Splits copied! You're ready to request pay.", { icon: "💳" });
              onClose();
            }}
            className="h-11 px-6 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
          >
            Confirm & Copy Split <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
