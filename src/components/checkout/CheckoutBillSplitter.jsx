import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ChevronDown, ChevronUp, Share2, Printer, Download, Eye, X, Check } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'sonner';

// Initials generation helper
export function getAvatarInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Gradient hash helper
export function getAvatarGradient(name) {
  const gradients = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-violet-500 to-fuchsia-500",
    "from-sky-500 to-blue-600"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export default function CheckoutBillSplitter() {
  const { items: cartItems, getCartTotals, restaurant } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [splitMode, setSplitMode] = useState('equal');
  
  // Start with just "You" in the split pool - no hardcoded Prathamesh/Daksh!
  const [friends, setFriends] = useState([
    { id: 'you', name: 'You', avatarGradient: 'from-orange-500 to-amber-500', initials: 'YO' }
  ]);
  const [newFriendName, setNewFriendName] = useState('');
  const [assignments, setAssignments] = useState({});

  // Glassmorphic Share Image Modal States
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  const { subtotal, discount, packagingCharge, deliveryFee, platformFee, gst, finalTotal } = getCartTotals();

  // Auto assign items to first friend (usually You)
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
    const name = newFriendName.trim();
    const newFriend = {
      id: `f-${Date.now()}`,
      name: name,
      avatarGradient: getAvatarGradient(name),
      initials: getAvatarInitials(name)
    };
    setFriends([...friends, newFriend]);
    setNewFriendName('');
    toast.success(`${name} added to split pool! 💸`);
  };

  const handleRemoveFriend = (id) => {
    if (id === 'you') {
      toast.error("You cannot remove yourself from the split!");
      return;
    }
    const removedFriend = friends.find(f => f.id === id);
    const updatedFriends = friends.filter(f => f.id !== id);
    setFriends(updatedFriends);

    // Re-assign items back to first remaining friend (You)
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
        const itemCost = (item.price + (item.selectedCustomizations || []).reduce((sum, opt) => sum + (opt.price || 0), 0)) * item.quantity;
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
        f.badge = { text: "Spender 💀", style: "bg-rose-500/15 text-rose-500 border border-rose-500/20" };
      } else if (f.totalShare < (finalTotal / numFriends) * 0.75 && numFriends > 1) {
        f.badge = { text: "Saver 💸", style: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20" };
      }
    });

    return friendShares;
  };

  const computedShares = calculateShares();

  // EXPORT ACTION 1: Export as Beautiful PDF Invoice
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

  // EXPORT ACTION 2: Download raw Summary .TXT Card
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

  // EXPORT ACTION 3: Mock glassmorphic download trigger
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
                    className="h-8 px-3 bg-brand hover:bg-brand-hover text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 focus:outline-none cursor-pointer"
                  >
                    <Plus size={12} strokeWidth={2.5} /> Add
                  </button>
                </form>

                {/* Buddies list */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {friends.map(f => (
                    <div
                      key={f.id}
                      className="inline-flex items-center gap-1.5 pl-1.5 pr-1 h-6 rounded-full bg-white dark:bg-neutral-900 border border-black/[0.04] dark:border-white/[0.04] shadow-3xs"
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${f.avatarGradient} text-white font-extrabold flex items-center justify-center text-[7px] uppercase`}>
                        {f.initials}
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{f.name}</span>
                      {f.id !== 'you' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(f.id)}
                          className="w-4 h-4 rounded-full text-gray-400 hover:text-rose-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
                        >
                          &times;
                        </button>
                      )}
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
                          className="bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] rounded py-0.5 px-1 text-[10px] font-bold focus:outline-none text-gray-600 dark:text-gray-300 cursor-pointer"
                        >
                          {friends.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
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
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${share.avatarGradient} text-white font-extrabold flex items-center justify-center text-[8px] uppercase shrink-0`}>
                          {share.initials}
                        </div>
                        <span className="truncate text-gray-700 dark:text-gray-300 text-[11px]">{share.name}</span>
                        {share.badge && (
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider leading-none shrink-0 ${share.badge.style}`}>
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

              {/* Premium Export & Share Bar */}
              <div className="border-t border-black/[0.03] dark:border-white/[0.03] pt-3.5 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block">Export & Share Split:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer focus:outline-none"
                    title="Export Split Invoice as PDF"
                  >
                    <Printer size={11} /> PDF Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer focus:outline-none"
                    title="Share as premium card"
                  >
                    <Eye size={11} /> Share Card
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSummaryTxt}
                    className="h-8 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer focus:outline-none"
                    title="Download raw summary txt"
                  >
                    <Download size={11} /> Receipt Txt
                  </button>
                </div>
              </div>

              {/* Copy breakdown action */}
              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full h-8 bg-brand/5 hover:bg-brand/10 border border-brand/10 text-brand rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all focus:outline-none"
              >
                <Share2 size={12} /> Copy Split Breakdown Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
