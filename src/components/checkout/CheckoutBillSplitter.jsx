import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'sonner';

export default function CheckoutBillSplitter() {
  const { items: cartItems, getCartTotals } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [splitMode, setSplitMode] = useState('equal');
  
  const [friends, setFriends] = useState([
    { id: 'f-1', name: 'Prathamesh', avatar: '🔥' },
    { id: 'f-2', name: 'Daksh', avatar: '👨‍💻' }
  ]);
  const [newFriendName, setNewFriendName] = useState('');
  const [assignments, setAssignments] = useState({});

  const { subtotal, discount, packagingCharge, deliveryFee, platformFee, gst, finalTotal } = getCartTotals();

  // Auto assign items to first friend
  useEffect(() => {
    if (friends.length > 0) {
      const updatedAssignments = { ...assignments };
      let updated = false;
      cartItems.forEach(item => {
        if (!updatedAssignments[item.id] || !friends.some(f => f.id === updatedAssignments[item.id])) {
          updatedAssignments[item.id] = friends[0].id;
          updated = true;
        }
      });
      if (updated) {
        setAssignments(updatedAssignments);
      }
    }
  }, [cartItems, friends]);

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    if (friends.length >= 6) {
      toast.warning("Maximum of 6 split buddies reached!");
      return;
    }
    const avatars = ['👨‍💻', '🧑‍🚀', '👩‍🎨', '🦊', '🦄', '🦁', '🦉'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const newFriend = {
      id: `f-${Date.now()}`,
      name: newFriendName.trim(),
      avatar: randomAvatar
    };
    setFriends([...friends, newFriend]);
    setNewFriendName('');
    toast.success(`${newFriend.name} added!`);
  };

  const handleRemoveFriend = (id) => {
    if (friends.length <= 1) {
      toast.error("At least 1 person is required to split!");
      return;
    }
    const removedFriend = friends.find(f => f.id === id);
    const updatedFriends = friends.filter(f => f.id !== id);
    setFriends(updatedFriends);

    // Re-assign items belonging to deleted friend back to the first remaining friend
    const remainingFirstId = updatedFriends[0].id;
    const updatedAssignments = { ...assignments };
    Object.keys(updatedAssignments).forEach(itemId => {
      if (updatedAssignments[itemId] === id) {
        updatedAssignments[itemId] = remainingFirstId;
      }
    });
    setAssignments(updatedAssignments);
    toast.info(`Removed ${removedFriend?.name}`);
  };

  const handleAssignItem = (itemId, friendId) => {
    setAssignments(prev => ({ ...prev, [itemId]: friendId }));
  };

  const calculateShares = () => {
    const friendShares = friends.map(f => ({
      ...f,
      subtotalShare: 0,
      assignedItems: [],
      badge: null
    }));

    if (splitMode === 'equal') {
      const equalSubtotal = subtotal / friends.length;
      friendShares.forEach(f => {
        f.subtotalShare = equalSubtotal;
      });
    } else {
      cartItems.forEach(item => {
        const friendId = assignments[item.id] || friends[0].id;
        const itemCost = item.price * item.quantity;
        const target = friendShares.find(fs => fs.id === friendId);
        if (target) {
          target.subtotalShare += itemCost;
          target.assignedItems.push(item);
        }
      });
    }

    const numFriends = friends.length;
    const extraCharges = (packagingCharge + deliveryFee + platformFee + gst) - discount;

    friendShares.forEach(f => {
      const ratio = subtotal > 0 ? f.subtotalShare / subtotal : 0;
      f.extraShare = extraCharges * ratio;
      f.totalShare = f.subtotalShare + f.extraShare;

      // Badges
      if (f.totalShare > (finalTotal / numFriends) * 1.25 && numFriends > 1) {
        f.badge = { text: "Spender 💀", style: "bg-rose-500/10 text-rose-500 border border-rose-500/10" };
      } else if (f.totalShare < (finalTotal / numFriends) * 0.75 && numFriends > 1) {
        f.badge = { text: "Saver 💸", style: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10" };
      }
    });

    return friendShares;
  };

  const computedShares = calculateShares();

  const handleCopySummary = () => {
    const text = computedShares.map(s => 
      `${s.avatar} ${s.name}: ${formatPrice(s.totalShare)} (${s.assignedItems.map(i => `${i.name} x${i.quantity}`).join(', ') || 'Equal Split'})`
    ).join('\n');
    navigator.clipboard.writeText(`Crave Bill Split:\n${text}\nGrand Total: ${formatPrice(finalTotal)}`);
    toast.success("Split breakdown copied to clipboard! 📋");
  };

  return (
    <div className="bg-white dark:bg-dark-surface border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-200 shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left focus:outline-none hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Users size={16} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Split Bill with Friends</h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Calculate individual itemized splits</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-black/[0.04] dark:border-white/[0.04]"
          >
            <div className="p-4 space-y-4 bg-gray-50/[0.3] dark:bg-black/[0.15]">
              {/* Split Mode Toggle */}
              <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-neutral-900 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSplitMode('equal')}
                  className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    splitMode === 'equal'
                      ? 'bg-white dark:bg-neutral-800 text-brand shadow-xs'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('item')}
                  className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    splitMode === 'item'
                      ? 'bg-white dark:bg-neutral-800 text-brand shadow-xs'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                >
                  Itemized Split
                </button>
              </div>

              {/* Add Buddy Form */}
              <div className="space-y-2">
                <form onSubmit={handleAddFriend} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Friend's name..."
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    maxLength={14}
                    className="flex-1 h-8 bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] rounded-lg px-2.5 text-xs font-semibold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="h-8 px-3 bg-brand hover:bg-brand-hover text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 focus:outline-none"
                  >
                    <Plus size={12} strokeWidth={2.5} /> Add
                  </button>
                </form>

                {/* Buddies list */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {friends.map(f => (
                    <div
                      key={f.id}
                      className="inline-flex items-center gap-1 pl-2 pr-1 h-6 rounded-full bg-white dark:bg-neutral-900 border border-black/[0.04] dark:border-white/[0.04]"
                    >
                      <span className="text-xs leading-none">{f.avatar}</span>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(f.id)}
                        className="w-4 h-4 rounded-full text-gray-400 hover:text-rose-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] flex items-center justify-center transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itemized assign controls */}
              {splitMode === 'item' && (
                <div className="space-y-2 border-t border-black/[0.03] dark:border-white/[0.03] pt-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Assign items to buddies:</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        <span className="truncate max-w-[140px]">{item.name}</span>
                        <select
                          value={assignments[item.id] || friends[0]?.id}
                          onChange={(e) => handleAssignItem(item.id, e.target.value)}
                          className="bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] rounded py-0.5 px-1 text-[10px] font-bold focus:outline-none text-gray-600 dark:text-gray-300"
                        >
                          {friends.map(f => (
                            <option key={f.id} value={f.id}>{f.avatar} {f.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shares Breakdown */}
              <div className="border-t border-black/[0.03] dark:border-white/[0.03] pt-3 space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Calculated Splits:</span>
                <div className="space-y-1.5">
                  {computedShares.map(share => (
                    <div key={share.id} className="flex items-center justify-between text-xs font-bold p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-black/[0.02] dark:border-white/[0.02]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs leading-none">{share.avatar}</span>
                        <span className="truncate text-gray-700 dark:text-gray-300 text-[11px]">{share.name}</span>
                        {share.badge && (
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider leading-none ${share.badge.style}`}>
                            {share.badge.text}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-black text-gray-850 dark:text-gray-100">{formatPrice(share.totalShare)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy breakdown action */}
              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full h-8 bg-brand/5 hover:bg-brand/10 border border-brand/10 text-brand rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all focus:outline-none"
              >
                <Share2 size={12} /> Share & Copy Split Breakdown
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
