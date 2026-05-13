import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { offers } from '../../data/offers';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OfferStrip() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied!`);
  };

  const handleSeeAll = () => {
    navigate('/restaurants?offers=true');
  };

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setShowLeftArrow(el.scrollLeft > 5);
      setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Run once initially
      checkScroll();
      // Handle resize
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.75;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full relative group/outer">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-scale-20 text-[--text-primary] tracking-tight">
          Best offers for you
        </h2>
        <button 
          onClick={handleSeeAll} 
          className="text-[13px] font-medium text-[--brand] hover:underline focus:outline-none"
        >
          See all
        </button>
      </div>

      {/* Left Arrow Button */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-[-18px] top-[calc(50%+14px)] -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md bg-white/90 dark:bg-neutral-900/90 border border-black/[0.06] dark:border-white/[0.06] shadow-sm hover:scale-105 active:scale-95 opacity-0 group-hover/outer:opacity-100 transition-all duration-200 focus:outline-none text-[--text-primary]"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* Right Arrow Button */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-[-18px] top-[calc(50%+14px)] -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md bg-white/90 dark:bg-neutral-900/90 border border-black/[0.06] dark:border-white/[0.06] shadow-sm hover:scale-105 active:scale-95 opacity-0 group-hover/outer:opacity-100 transition-all duration-200 focus:outline-none text-[--text-primary]"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* Horizontal Scroll Area */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-[12px] overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
      >
        {offers.map((offer) => {
          // Replace rupee unicode with plain text "Rs"
          const cleanSubtitle = offer.subtitle.replace(/₹/g, 'Rs ');
          const cleanTitle = offer.title.replace(/₹/g, 'Rs ');

          return (
            <button
              key={offer.code}
              onClick={() => handleCopyCode(offer.code)}
              className="flex-shrink-0 w-[240px] h-[100px] bg-[--card-bg] border border-[--border] rounded-[12px] flex items-center overflow-hidden text-left focus:outline-none hover:border-[--brand]/40 hover:-translate-y-0.5 transition-all duration-300"
              title="Click to copy code"
            >
              {/* Left Side: Coupon Code */}
              <div className="w-[100px] h-full flex flex-col items-center justify-center bg-black/[0.015] dark:bg-white/[0.015] border-r border-dashed border-[--border] px-2 text-center flex-shrink-0">
                <span className="text-[11px] md:text-[12px] font-mono font-semibold text-[--brand] tracking-wider uppercase whitespace-nowrap">
                  {offer.code}
                </span>
                <span className="text-[9px] text-[--text-secondary] uppercase tracking-wider font-medium mt-1 select-none">
                  COPY
                </span>
              </div>

              {/* Right Side: Description */}
              <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                <h4 className="text-[13px] font-semibold text-[--text-primary] truncate">
                  {cleanTitle}
                </h4>
                <p className="text-[11px] text-[--text-secondary] font-normal line-clamp-2 mt-1 leading-[1.35]">
                  {cleanSubtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
