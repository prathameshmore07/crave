// reusable review modal component
// unified premium review flow used across tracking, past orders, and profile
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle, Trash2, UtensilsCrossed, Truck, Package, MessageSquare, Edit3 } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'sonner';

// compact professional rating layout — interactive
function RatingRow({ label, icon: Icon, value, onChange, readOnly = false }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 bg-zinc-50/40 dark:bg-zinc-900/30 rounded-lg border border-zinc-100/20 dark:border-zinc-800/20">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={13} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          readOnly ? (
            <Star
              key={star}
              size={13}
              className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 dark:text-zinc-700'}
            />
          ) : (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star)}
              className="focus:outline-none hover:scale-110 transition-transform bg-transparent border-none p-0 cursor-pointer"
            >
              <Star
                size={14}
                className={`transition-colors ${
                  star <= value ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 dark:text-zinc-700'
                }`}
              />
            </button>
          )
        ))}
      </div>
    </div>
  );
}

// compact dish rating card
function DishRatingCard({ item, rating, onChange, readOnly = false }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-100/15 dark:border-zinc-800/25">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-6 h-6 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
          <img
            src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&auto=format&fit=crop&q=60"}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&q=60"; }}
          />
        </div>
        <div className="min-w-0">
          <h5 className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 leading-tight truncate max-w-[110px]">{item.name}</h5>
          <span className="text-[8px] text-zinc-400 font-medium">{item.quantity}x · {formatPrice(item.price)}</span>
        </div>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {[1, 2, 3, 4, 5].map((star) => (
          readOnly ? (
            <Star key={star} size={10} className={star <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800"} />
          ) : (
            <button
              type="button"
              key={star}
              onClick={() => onChange(item.id, star)}
              className="focus:outline-none hover:scale-110 transition-transform bg-transparent border-none p-0 cursor-pointer"
            >
              <Star size={11} className={star <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800"} />
            </button>
          )
        ))}
      </div>
    </div>
  );
}

/**
 * ReviewModal — unified review component
 *
 * Props:
 * @param {boolean}  isOpen     — controls visibility
 * @param {function} onClose    — close handler
 * @param {object}   order      — order with items, rating, restaurantName, orderId, restaurantId
 * @param {function} onSubmit   — (ratingData) => void
 * @param {function} onDelete   — () => void  (optional, shows delete button)
 * @param {string}   mode       — 'new' | 'edit' | 'view'
 *                                 'new'  = fresh review form
 *                                 'edit' = editing an existing review
 *                                 'view' = read-only display with edit/delete actions
 * @param {function} onEdit     — () => void  (optional, called when user clicks "Edit" in view mode)
 */
export default function ReviewModal({ isOpen, onClose, order, onSubmit, onDelete, onEdit, mode = 'new' }) {
  // unified review flow state
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [packagingRating, setPackagingRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [dishRatings, setDishRatings] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const isEditing = mode === 'edit';
  const isViewOnly = mode === 'view';

  // sync form state when modal opens
  useEffect(() => {
    if (!isOpen || !order) return;

    if (order.rating && (isEditing || isViewOnly)) {
      // populate from existing rating data
      setFoodRating(order.rating.foodQuality || order.rating.food || 5);
      setDeliveryRating(order.rating.deliveryExperience || 5);
      setPackagingRating(order.rating.packaging || 5);
      setReviewComment(order.rating.comment || '');
      setDishRatings(order.rating.dishRatings || {});
    } else {
      // fresh review defaults
      setFoodRating(5);
      setDeliveryRating(5);
      setPackagingRating(5);
      setReviewComment('');
      const init = {};
      if (order.items) order.items.forEach(i => { init[i.id] = 5; });
      setDishRatings(init);
    }
    setShowSuccess(false);
  }, [isOpen, order?.orderId, mode]);

  // lock body scroll while modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleDishRatingChange = (itemId, stars) => {
    setDishRatings(prev => ({ ...prev, [itemId]: stars }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reviewComment.trim()) {
      toast.error('Please add a short comment about your experience.');
      return;
    }

    const emojiReaction = foodRating >= 5 ? '🥰' : foodRating >= 4 ? '🙂' : foodRating >= 3 ? '😐' : foodRating >= 2 ? '🙁' : '😠';

    const payload = {
      food: foodRating,
      foodQuality: foodRating,
      deliveryExperience: deliveryRating,
      packaging: packagingRating,
      comment: reviewComment,
      emoji: emojiReaction,
      timestamp: Date.now(),
      isEdited: isEditing,
      dishRatings,
    };

    // show brief success animation then close
    setShowSuccess(true);
    setTimeout(() => {
      onSubmit(payload);
      setShowSuccess(false);
    }, 1200);
  };

  if (!order) return null;

  // render via portal for proper z-index layering
  const modalRoot = document.getElementById('modal-root');

  // -- header badge text
  const badgeText = isViewOnly ? 'Your Review' : isEditing ? 'Edit Review' : 'Rate Order';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!showSuccess) onClose(); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="relative z-[9999] bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-[400px] max-h-[90vh] flex flex-col overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {showSuccess ? (
                /* success feedback animation */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="py-14 px-6 flex flex-col items-center justify-center space-y-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                    className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center"
                  >
                    <CheckCircle size={28} />
                  </motion.div>
                  <h4 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50">{isEditing ? 'Review Updated!' : 'Review Submitted!'}</h4>
                  <p className="text-[10px] text-zinc-400 font-medium text-center max-w-[200px]">Your feedback is now live on the restaurant page.</p>
                </motion.div>
              ) : isViewOnly ? (
                /* read-only review display */
                <motion.div key="view" className="flex flex-col overflow-hidden">
                  {/* header */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                    <div className="min-w-0">
                      <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest">Reviewed</span>
                      <h3 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mt-1 truncate max-w-[260px]">{order.restaurantName}</h3>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors border-none outline-none cursor-pointer flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>

                  {/* read-only body */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-200 [&::-webkit-scrollbar-thumb]:dark:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                    <RatingRow label="Food Quality" icon={UtensilsCrossed} value={order.rating?.food || order.rating?.foodQuality || 5} readOnly />
                    <RatingRow label="Delivery" icon={Truck} value={order.rating?.deliveryExperience || 5} readOnly />
                    <RatingRow label="Packaging" icon={Package} value={order.rating?.packaging || 5} readOnly />

                    {/* dish ratings read-only */}
                    {order.items && order.items.length > 0 && order.rating?.dishRatings && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block px-1">Dish Ratings</span>
                        {order.items.map((item) => (
                          <DishRatingCard key={item.id} item={item} rating={order.rating.dishRatings[item.id] || 5} readOnly />
                        ))}
                      </div>
                    )}

                    {/* written comment */}
                    {order.rating?.comment && (
                      <div className="pt-1.5">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block px-1 mb-1">Comment</span>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg p-3 border border-zinc-100/20 dark:border-zinc-800/20 italic">
                          "{order.rating.comment}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* view mode footer — edit / delete actions */}
                  <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0 flex gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={onEdit}
                        className="h-9 flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 border-none outline-none cursor-pointer"
                      >
                        <Edit3 size={11} />
                        Edit Review
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={onDelete}
                        className="h-9 px-3 border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer outline-none"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* interactive review form (new + edit modes) */
                <motion.div key="form" className="flex flex-col overflow-hidden">
                  {/* sticky header */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                    <div className="min-w-0">
                      <span className="text-[8px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-0.5 rounded font-bold uppercase tracking-widest">{badgeText}</span>
                      <h3 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mt-1 truncate max-w-[260px]">{order.restaurantName}</h3>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors border-none outline-none cursor-pointer flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>

                  {/* scrollable form body */}
                  <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-200 [&::-webkit-scrollbar-thumb]:dark:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">

                      {/* compact professional rating rows */}
                      <div className="space-y-1">
                        <RatingRow label="Food Quality" icon={UtensilsCrossed} value={foodRating} onChange={setFoodRating} />
                        <RatingRow label="Delivery" icon={Truck} value={deliveryRating} onChange={setDeliveryRating} />
                        <RatingRow label="Packaging" icon={Package} value={packagingRating} onChange={setPackagingRating} />
                      </div>

                      {/* individual dish ratings */}
                      {order.items && order.items.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block px-1">Rate Dishes</span>
                          {order.items.map((item) => (
                            <DishRatingCard
                              key={item.id}
                              item={item}
                              rating={dishRatings[item.id] || 5}
                              onChange={handleDishRatingChange}
                            />
                          ))}
                        </div>
                      )}

                      {/* review textbox with character counter */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between px-0.5">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Your Review</label>
                          <span className={`text-[9px] font-medium ${reviewComment.length > 400 ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-600'}`}>
                            {reviewComment.length}/500
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          maxLength={500}
                          placeholder="Share your thoughts on taste, delivery, and quality..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                          className="w-full p-2.5 border border-zinc-150 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 text-[11px] font-medium rounded-lg outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors resize-none text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-350 dark:placeholder:text-zinc-600"
                        />
                      </div>
                    </div>

                    {/* sticky footer actions */}
                    <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0 flex gap-2">
                      {isEditing && onDelete && (
                        <button
                          type="button"
                          onClick={onDelete}
                          className="h-9 px-3 border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer outline-none"
                        >
                          <Trash2 size={11} />
                          Delete
                        </button>
                      )}
                      <button
                        type="submit"
                        className="h-9 flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 border-none outline-none cursor-pointer shadow-sm"
                      >
                        <MessageSquare size={11} />
                        {isEditing ? 'Update Review' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // render via portal if available, otherwise inline
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : modalContent;
}
