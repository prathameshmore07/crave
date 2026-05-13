import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ChevronRight, X, Printer, Download, Eye, Share2, Info } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'sonner';
import { getAvatarInitials, getAvatarGradient } from '../checkout/CheckoutBillSplitter';

export default function BillSplitter({ onClose }) {
  const { items: cartItems, getCartTotals, restaurant, friends, setFriends } = useCartStore();

  // Active Splits Mode: 'equal' | 'item'
  const [splitMode, setSplitMode] = useState('equal');
  const [newFriendName, setNewFriendName] = useState('');

  // Item assignment mapping: { [cartItemId]: friendId }
  const [assignments, setAssignments] = useState({});

  // Glassmorphic Share Card states
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  // Sync calculations with the global cart totals
  const { subtotal, discount, packagingCharge, deliveryFee, platformFee, gst, finalTotal } = getCartTotals();

  // Auto assign items when cart or friends list change
  useEffect(() => {
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
    
    if (friends.length >= 6) {
      toast.warning("Maximum of 6 split buddies reached!", { position: "top-center" });
      return;
    }

    const name = newFriendName.trim();
    const newFriend = {
      id: `f-${Date.now()}`,
      name: name,
      avatarGradient: getAvatarGradient(name, friends.length),
      initials: getAvatarInitials(name)
    };

    setFriends([...friends, newFriend]);
    setNewFriendName('');
    toast.success(`${name} added to split pool! 💸`, { position: "top-center" });
  };

  const handleRemoveFriend = (id) => {
    if (id === 'you') {
      toast.error("You cannot remove yourself from the split!", { position: "top-center" });
      return;
    }
    const removedFriend = friends.find(f => f.id === id);
    const updatedFriends = friends.filter(f => f.id !== id);
    setFriends(updatedFriends);
    
    // Re-assign items belonging to deleted friend back to the first remaining friend (You)
    const remainingFirstId = updatedFriends[0].id;
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

  // Perform core split mathematics proportionally including taxes/fees/discounts
  const calculateSplits = () => {
    const friendShares = friends.map(f => ({
      ...f,
      subtotalShare: 0,
      assignedItems: [],
      badge: null
    }));

    if (splitMode === 'equal') {
      const equalShareSubtotal = subtotal / friends.length;
      friendShares.forEach(f => {
        f.subtotalShare = equalShareSubtotal;
      });
    } else {
      cartItems.forEach(item => {
        const assignedFriendId = assignments[item.id] || friends[0].id;
        const customizationCost = (item.selectedCustomizations || []).reduce((sum, opt) => sum + (opt.price || 0), 0);
        const itemTotalCost = (item.price + customizationCost) * item.quantity;
        const targetShare = friendShares.find(fs => fs.id === assignedFriendId);
        if (targetShare) {
          targetShare.subtotalShare += itemTotalCost;
          targetShare.assignedItems.push(item);
        }
      });
    }

    const numFriends = friends.length;
    const extraCharges = (packagingCharge + deliveryFee + platformFee + gst) - discount;

    friendShares.forEach(f => {
      const ratio = subtotal > 0 ? f.subtotalShare / subtotal : 0;
      f.extraShare = extraCharges * ratio;
      f.totalShare = f.subtotalShare + f.extraShare;

      // Bestow award badges
      if (f.totalShare > (finalTotal / numFriends) * 1.25 && numFriends > 1) {
        f.badge = { text: "Spender 💀", color: "bg-rose-500/15 text-rose-500 border border-rose-500/20" };
      } else if (f.totalShare < (finalTotal / numFriends) * 0.75 && numFriends > 1) {
        f.badge = { text: "Saver 💸", color: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20" };
      }
    });

    return friendShares;
  };

  const computedShares = calculateSplits();

  // EXPORT ACTION 1: PDF Invoice Generation
  const handleExportPDF = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' });
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please enable popups for this site.");
      return;
    }

    const itemsHtml = cartItems.map(item => {
      const customizationCost = (item.selectedCustomizations || []).reduce((sum, opt) => sum + (opt.price || 0), 0);
      return `
        <tr style="border-bottom: 1px solid #f1f1f1;">
          <td style="padding: 10px 0; font-size: 13px; color: #333;">
            <div style="font-weight: bold;">${item.name}</div>
            ${item.selectedCustomizations && item.selectedCustomizations.length > 0 ? `
              <div style="font-size: 10px; color: #888; margin-top: 2px;">
                Customizations: ${item.selectedCustomizations.map(c => `${c.category}: ${c.label}`).join(', ')}
              </div>
            ` : ""}
          </td>
          <td style="padding: 10px 0; font-size: 13px; color: #333; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px 0; font-size: 13px; color: #333; text-align: right;">${formatPrice((item.price + customizationCost) * item.quantity)}</td>
        </tr>
      `;
    }).join("");

    const splitsHtml = computedShares.map(s => `
      <div style="background: #fafafa; border: 1px solid #eaeaea; border-radius: 12px; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: bold; font-size: 14px; color: #111;">${s.name}</div>
          <div style="font-size: 11px; color: #666; margin-top: 3px;">
            ${splitMode === 'equal' ? 'Equal Share' : s.assignedItems.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'No dishes assigned'}
          </div>
        </div>
        <div style="font-weight: bold; font-size: 14px; color: #ff5200; font-family: monospace;">${formatPrice(s.totalShare)}</div>
      </div>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>CRAVE Invoice - Bill Split</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              margin: 0;
              padding: 40px;
              background: #ffffff;
              color: #333333;
            }
            .invoice-container {
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 24px;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.02);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 24px;
              margin-bottom: 24px;
            }
            .logo {
              font-size: 28px;
              font-weight: 800;
              color: #ff5200;
              letter-spacing: -1px;
            }
            .logo span {
              color: #111111;
            }
            .receipt-title {
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #94a3b8;
              text-align: right;
            }
            .restaurant-name {
              font-size: 18px;
              font-weight: 600;
              color: #0f172a;
            }
            .meta-info {
              font-size: 12px;
              color: #64748b;
              margin-top: 4px;
            }
            .section-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #64748b;
              margin: 24px 0 12px 0;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 6px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              text-align: left;
              font-size: 11px;
              text-transform: uppercase;
              color: #94a3b8;
              padding-bottom: 8px;
              border-bottom: 1px solid #e2e8f0;
            }
            .totals-table {
              margin-top: 15px;
              float: right;
              width: 250px;
            }
            .totals-table td {
              padding: 4px 0;
              font-size: 13px;
            }
            .grand-total {
              font-size: 16px;
              font-weight: 800;
              color: #ff5200;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div>
                <div class="logo">CRAVE<span>.</span></div>
                <div class="restaurant-name">${restaurant?.name || "Crave Partner"}</div>
                <div class="meta-info">Date: ${dateStr} | Invoice: #CRV-${Math.floor(100000 + Math.random() * 900000)}</div>
              </div>
              <div>
                <div class="receipt-title">Dorm Split Bill</div>
              </div>
            </div>

            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Dish Name</th>
                  <th style="text-align: center; width: 60px;">Qty</th>
                  <th style="text-align: right; width: 100px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="overflow: hidden; margin-bottom: 20px;">
              <table class="totals-table">
                <tr>
                  <td style="color: #666;">Subtotal:</td>
                  <td style="text-align: right; font-family: monospace;">${formatPrice(subtotal)}</td>
                </tr>
                ${discount > 0 ? `
                <tr>
                  <td style="color: #666;">Discount:</td>
                  <td style="text-align: right; font-family: monospace; color: #16a34a;">-${formatPrice(discount)}</td>
                </tr>` : ""}
                <tr>
                  <td style="color: #666;">Taxes & Packing:</td>
                  <td style="text-align: right; font-family: monospace;">${formatPrice(gst + packagingCharge)}</td>
                </tr>
                <tr>
                  <td style="color: #666;">Delivery & Platform:</td>
                  <td style="text-align: right; font-family: monospace;">${formatPrice(deliveryFee + platformFee)}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0; font-weight: bold;">
                  <td class="grand-total">Total:</td>
                  <td style="text-align: right; font-family: monospace;" class="grand-total">${formatPrice(finalTotal)}</td>
                </tr>
              </table>
            </div>

            <div style="clear: both;"></div>

            <div class="section-title">Calculated Split Shares</div>
            <div>
              ${splitsHtml}
            </div>

            <div class="footer">
              This is a computer-generated Crave Split Bill receipt.<br>
              Crave Food Services Pvt. Ltd. | Smart Campus Network
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success("Printable PDF invoice opened in a new tab! 🖨️");
  };

  // EXPORT ACTION 2: Txt Summary Download
  const handleDownloadSummaryTxt = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' });
    let content = `==================================================\n`;
    content += `                  CRAVE BILL SPLIT                \n`;
    content += `==================================================\n`;
    content += `Date: ${dateStr}\n`;
    content += `Restaurant: ${restaurant?.name || "Crave Partner"}\n`;
    content += `--------------------------------------------------\n`;
    content += `ITEMS IN CART:\n`;
    cartItems.forEach(item => {
      content += `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}\n`;
    });
    content += `--------------------------------------------------\n`;
    content += `BILL BREAKDOWN:\n`;
    content += `Subtotal: ${formatPrice(subtotal)}\n`;
    if (discount > 0) content += `Discount: -${formatPrice(discount)}\n`;
    content += `GST & Restaurant Charges: ${formatPrice(gst)}\n`;
    content += `Delivery & Platform Fees: ${formatPrice(deliveryFee + platformFee)}\n`;
    content += `Packaging Charge: ${formatPrice(packagingCharge)}\n`;
    content += `Grand Total: ${formatPrice(finalTotal)}\n`;
    content += `--------------------------------------------------\n`;
    content += `INDIVIDUAL SPLITS (${splitMode === 'equal' ? 'EQUAL SPLIT' : 'ITEMIZED'}):\n`;
    computedShares.forEach(s => {
      content += `${s.name}: ${formatPrice(s.totalShare)}\n`;
      if (splitMode === 'item' && s.assignedItems.length > 0) {
        content += `  └─ Assigned: ${s.assignedItems.map(i => `${i.name} (x${i.quantity})`).join(', ')}\n`;
      }
    });
    content += `==================================================\n`;
    content += `             Thank you for choosing CRAVE!        \n`;
    content += `==================================================\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Crave_Bill_Split_${(restaurant?.name || "Order").replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Text summary card downloaded successfully! 📄");
  };

  // EXPORT ACTION 3: Mock Image Download Trigger
  const handleDownloadShareCard = () => {
    setIsDownloadingImage(true);
    setTimeout(() => {
      setIsDownloadingImage(false);
      setShowShareModal(false);
      toast.success("Split card saved to your gallery successfully! 📸", {
        description: "Your glassmorphic share card is ready to send."
      });
    }, 1500);
  };

  const handleCopySummary = () => {
    const text = computedShares.map(s => 
      `${s.initials} ${s.name}: ${formatPrice(s.totalShare)} (${s.assignedItems.map(i => `${i.name} x${i.quantity}`).join(', ') || 'Equal Split'})`
    ).join('\n');
    navigator.clipboard.writeText(`Crave Bill Split:\n${text}\nGrand Total: ${formatPrice(finalTotal)}`);
    toast.success("Split breakdown copied to clipboard! 📋");
  };

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
              <Users size={20} />
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
                <Plus size={14} /> Add
              </button>
            </form>

            {/* Friends list chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {friends.map((f) => (
                <div 
                  key={f.id}
                  className="pl-1.5 pr-2.5 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-black/[0.04] dark:border-white/[0.04] flex items-center gap-1.5 shadow-3xs"
                >
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${f.avatarGradient} text-white font-extrabold flex items-center justify-center text-[8px] uppercase shrink-0`}>
                    {f.initials}
                  </div>
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{f.name}</span>
                  {f.id !== 'you' && (
                    <button
                      onClick={() => handleRemoveFriend(f.id)}
                      className="w-4 h-4 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-rose-500 flex items-center justify-center cursor-pointer focus:outline-none transition-colors"
                    >
                      &times;
                    </button>
                  )}
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
                      className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/30 border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between gap-3 animate-fade-in"
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
                            {f.name}
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
                  className="p-4 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-50/25 dark:from-neutral-900/40 dark:to-neutral-900/10 border border-black/[0.03] dark:border-white/[0.03] flex items-start justify-between gap-4 animate-scale-up"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${share.avatarGradient} text-white font-extrabold flex items-center justify-center text-[8px] uppercase shrink-0`}>
                        {share.initials}
                      </div>
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
                      (Base: {formatPrice(share.subtotalShare)} + Tax/Fees)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Share / Exports Bar inside Cart Spliter */}
          <div className="border-t border-black/[0.03] dark:border-white/[0.03] pt-4.5 space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block">Export & Share Split:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleExportPDF}
                className="h-9 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer focus:outline-none"
              >
                <Printer size={12} /> PDF Invoice
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="h-9 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer focus:outline-none"
              >
                <Eye size={12} /> Share Card
              </button>
              <button
                type="button"
                onClick={handleDownloadSummaryTxt}
                className="h-9 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer focus:outline-none"
              >
                <Download size={12} /> Receipt Txt
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer Summary */}
        <div className="p-5 border-t border-black/[0.05] dark:border-white/[0.05] bg-neutral-50 dark:bg-neutral-900/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 leading-none block">Total Basket Cost</span>
            <span className="text-lg font-black text-neutral-850 dark:text-neutral-50 mt-1 block">{formatPrice(finalTotal)}</span>
          </div>
          <button
            onClick={() => {
              handleCopySummary();
              onClose();
            }}
            className="h-11 px-6 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
          >
            Confirm & Copy Split <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </motion.div>

      {/* Glassmorphic Dark-themed Share Modal Card */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-black border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-left text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              >
                <X size={14} />
              </button>

              {/* CRAVE Premium Card Branding Header */}
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3.5">
                <div>
                  <h3 className="text-sm font-black tracking-wide text-brand uppercase">CRAVE SPLITZ</h3>
                  <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider">Campus Sharing Receipt</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">#S-${Math.floor(100 + Math.random()*900)}</span>
              </div>

              {/* Huge Split Sum Banner */}
              <div className="text-center py-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl relative overflow-hidden">
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest block mb-1">TOTAL GRAND TOTAL</span>
                <span className="text-3xl font-black text-brand tracking-tight block drop-shadow-lg">{formatPrice(finalTotal)}</span>
                <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">Restaurant: {restaurant?.name || "Crave Kitchen"}</p>
              </div>

              {/* Glassmorphic Friend Share Listings */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {computedShares.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${s.avatarGradient} text-white font-extrabold flex items-center justify-center text-[7px] uppercase`}>
                        {s.initials}
                      </div>
                      <span className="text-xs font-bold text-zinc-350">{s.name}</span>
                    </div>
                    <span className="text-xs font-black text-brand font-mono">{formatPrice(s.totalShare)}</span>
                  </div>
                ))}
              </div>

              {/* Micro-animation Action CTA */}
              <button
                onClick={handleDownloadShareCard}
                disabled={isDownloadingImage}
                className="w-full h-11 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDownloadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving to Gallery...
                  </>
                ) : (
                  <>
                    <Download size={13} strokeWidth={2.5} /> Save Split Card Image
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
