import React, { useState } from 'react';
import { Star, ThumbsUp, ShieldCheck } from 'lucide-react';
import { menuItemImages } from '../../data/restaurants';
import DishImage from '../common/DishImage';

// Resolve the item's Unsplash image or high-quality keyword fallback
function getItemImage(name) {
  const lowercaseName = (name || "").toLowerCase();

  // Try static list lookup first
  if (menuItemImages && menuItemImages[name]) {
    return menuItemImages[name];
  }

  // Exact matching checks
  if (lowercaseName.includes("dosa")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("idli")) {
    return "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("vada")) {
    return "https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("uttapam")) {
    return "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("fried rice") || lowercaseName.includes("rice")) {
    return "https://images.unsplash.com/photo-1603133872878-685f2086ca77?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("noodle") || lowercaseName.includes("hakka") || lowercaseName.includes("schezwan")) {
    return "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("manchurian") || lowercaseName.includes("chilli") || lowercaseName.includes("paneer")) {
    return "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("fries") || lowercaseName.includes("chips")) {
    return "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("pav bhaji") || lowercaseName.includes("bhaji")) {
    return "https://images.unsplash.com/photo-1606491048563-eb955f4623e1?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("vada pav") || lowercaseName.includes("samosa") || lowercaseName.includes("chaat") || lowercaseName.includes("puri") || lowercaseName.includes("bhature")) {
    return "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("biryani")) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("fish") || lowercaseName.includes("prawn") || lowercaseName.includes("bombil") || lowercaseName.includes("surmai")) {
    return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("dal") || lowercaseName.includes("chicken") || lowercaseName.includes("kofta") || lowercaseName.includes("roti") || lowercaseName.includes("naan")) {
    return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("coffee") || lowercaseName.includes("mojito") || lowercaseName.includes("shake") || lowercaseName.includes("juice") || lowercaseName.includes("soda") || lowercaseName.includes("drink") || lowercaseName.includes("chai") || lowercaseName.includes("tea")) {
    return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("jamun") || lowercaseName.includes("rasgulla") || lowercaseName.includes("muffin") || lowercaseName.includes("croissant") || lowercaseName.includes("brownie") || lowercaseName.includes("sweet") || lowercaseName.includes("dessert")) {
    return "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&auto=format&fit=crop&q=60";
  }

  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60";
}

export default function ReviewCard({ review }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Interactive mini emoji reactions state
  const [reactions, setReactions] = useState({
    laugh: review.reactions?.laugh || Math.floor((review.helpfulCount || 0) * 0.4),
    heart: review.reactions?.heart || Math.floor((review.helpfulCount || 0) * 0.2),
    fire: review.reactions?.fire || Math.floor((review.helpfulCount || 0) * 0.3),
  });
  const [reacted, setReacted] = useState({ laugh: false, heart: false, fire: false });

  const handleHelpfulClick = () => {
    if (hasVoted) {
      setHelpfulCount(prev => prev - 1);
    } else {
      setHelpfulCount(prev => prev + 1);
    }
    setHasVoted(!hasVoted);
  };

  const handleEmojiReact = (type) => {
    setReacted(prev => {
      const isReacted = !prev[type];
      setReactions(r => ({
        ...r,
        [type]: isReacted ? r[type] + 1 : r[type] - 1
      }));
      return { ...prev, [type]: isReacted };
    });
  };

  const isLong = review.text && review.text.length > 160;
  const displayText = isLong && !isExpanded 
    ? `${review.text.substring(0, 160)}...` 
    : review.text;

  return (
    <div className="py-5 border-b border-black/[0.05] dark:border-white/[0.05] flex flex-col space-y-3.5 text-left">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 items-start min-w-0">
          <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-black text-xs flex items-center justify-center border border-brand/20 flex-shrink-0">
            {review.avatar || (review.userName ? review.userName[0].toUpperCase() : "U")}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-100">{review.userName}</h4>
              
              {/* Verified Order Badge */}
              {(review.isVerified || review.isUserReview) && (
                <span className="inline-flex items-center gap-0.5 text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  <ShieldCheck size={9} /> Verified Order
                </span>
              )}

              {/* Top Reviewer Badges */}
              {(review.isTopLiked || review.isTopReviewer) && (
                <span className="inline-flex items-center gap-0.5 text-[8px] bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  ⭐ Top Review
                </span>
              )}

              {(review.isTrending || review.isTrendingReviewer) && (
                <span className="inline-flex items-center gap-0.5 text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  📈 Trending
                </span>
              )}
            </div>
            {/* Review timestamps */}
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{review.date}</span>
          </div>
        </div>

        {/* Rating and Emoji Row */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {review.emoji && <span className="text-sm scale-110">{review.emoji}</span>}
          <div className="flex items-center gap-0.5 bg-success text-white px-2 py-0.5 rounded text-xs font-black">
            <span>{review.rating}</span>
            <Star size={10} className="fill-current" />
          </div>
        </div>
      </div>

      {/* Ordered Items Summary with beautiful dish thumbnails */}
      {review.items && review.items.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          <span className="text-[9px] text-zinc-400 dark:text-zinc-550 font-black uppercase tracking-wider block">Ordered Items:</span>
          <div className="flex flex-wrap gap-2">
            {review.items.map((item, idx) => {
              const imgUrl = getItemImage(item.name);
              return (
                <div key={idx} className="flex items-center gap-2 bg-zinc-500/5 dark:bg-zinc-900/30 p-1.5 pr-3 rounded-full border border-black/[0.04] dark:border-white/[0.04]">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-black/[0.05] dark:border-white/[0.05] flex-shrink-0">
                    <DishImage 
                      src={imgUrl} 
                      alt={item.name} 
                      dishName={item.name}
                      className="w-full h-full object-cover" 
                      showSpinner={false}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-700 dark:text-zinc-300 font-extrabold">
                    {item.name} <span className="text-brand font-black ml-0.5">{item.quantity ? `${item.quantity}x` : '1x'}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Text comment formatted nicely with Expand/Collapse */}
      <div className="space-y-1">
        <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/40 p-3 rounded-xl border border-black/[0.03] dark:border-white/[0.03] whitespace-pre-wrap">
          {displayText}
        </p>
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-brand hover:underline font-black uppercase tracking-wider bg-transparent border-none outline-none cursor-pointer pt-0.5"
          >
            {isExpanded ? "Read Less ▲" : "Read More ▼"}
          </button>
        )}
      </div>

      {/* Sub-ratings specifications row */}
      {(review.foodQuality || review.deliveryExperience || review.packaging) && (
        <div className="flex flex-wrap items-center gap-2.5 text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-wider">
          {review.foodQuality && (
            <span className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 px-2.5 py-1 rounded-md">🍔 Food: {review.foodQuality}★</span>
          )}
          {review.deliveryExperience && (
            <span className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 px-2.5 py-1 rounded-md">🛵 Service: {review.deliveryExperience}★</span>
          )}
          {review.packaging && (
            <span className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 px-2.5 py-1 rounded-md">📦 Packing: {review.packaging}★</span>
          )}
        </div>
      )}

      {/* Action Row: Helpful Vote & Emoji Reactions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          onClick={handleHelpfulClick}
          className={`flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full border transition-all cursor-pointer ${
            hasVoted 
              ? 'bg-brand/10 text-brand border-brand/20' 
              : 'bg-white dark:bg-dark-bg text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-50'
          }`}
        >
          <ThumbsUp size={10} className={hasVoted ? 'fill-current' : ''} />
          Helpful ({helpfulCount})
        </button>

        {/* Dynamic Interactive Emoji Reactions list */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEmojiReact('laugh')}
            className={`h-7 px-2.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1 bg-transparent transition-all hover:scale-105 cursor-pointer ${
              reacted.laugh 
                ? 'border-yellow-400 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400' 
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
          >
            <span>😂</span>
            <span>{reactions.laugh}</span>
          </button>
          
          <button
            onClick={() => handleEmojiReact('heart')}
            className={`h-7 px-2.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1 bg-transparent transition-all hover:scale-105 cursor-pointer ${
              reacted.heart 
                ? 'border-red-400 bg-red-400/10 text-red-500' 
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
          >
            <span>❤️</span>
            <span>{reactions.heart}</span>
          </button>

          <button
            onClick={() => handleEmojiReact('fire')}
            className={`h-7 px-2.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1 bg-transparent transition-all hover:scale-105 cursor-pointer ${
              reacted.fire 
                ? 'border-orange-400 bg-orange-400/10 text-orange-500' 
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
          >
            <span>🔥</span>
            <span>{reactions.fire}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
