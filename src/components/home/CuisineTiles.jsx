import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DishImage from '../common/DishImage';

const cuisines = [
  { 
    id: "biryani", 
    name: "Biryani", 
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "southindian", 
    name: "South Indian", 
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "northindian", 
    name: "North Indian", 
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "chinese", 
    name: "Chinese", 
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "streetfood", 
    name: "Street Food", 
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "continental", 
    name: "Continental", 
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "seafood", 
    name: "Seafood", 
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "cafe", 
    name: "Cafe", 
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "sweets", 
    name: "Sweets", 
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "burger", 
    name: "Burger", 
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "kebabs", 
    name: "Kebabs", 
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=120&auto=format&fit=crop&q=80" 
  },
  { 
    id: "thali", 
    name: "Thali", 
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=120&auto=format&fit=crop&q=80" 
  }
];

export default function CuisineTiles() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleCuisineClick = (cuisineName) => {
    navigate(`/restaurants?cuisine=${encodeURIComponent(cuisineName)}`);
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
      checkScroll();
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
      <h2 className="text-scale-20 text-[--text-primary] mb-6 tracking-tight">
        What are you craving?
      </h2>

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
      
      {/* Horizontally scrollable single row for both mobile and desktop */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-3 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
      >
        {cuisines.map((cuisine) => (
          <button
            key={cuisine.id}
            onClick={() => handleCuisineClick(cuisine.name)}
            className="flex-shrink-0 w-[114px] h-[94px] rounded-[16px] bg-[--card-bg] border border-[--border] flex flex-col items-center justify-center p-3 text-center focus:outline-none hover:border-[--brand]/25 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-stone-100 border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ease-out flex-shrink-0">
              <DishImage 
                src={cuisine.image} 
                alt={cuisine.name}
                dishName={cuisine.name}
                className="w-full h-full object-cover"
                showSpinner={false}
              />
            </div>
            <span className="text-[12px] font-semibold text-[--text-primary] mt-2 group-hover:text-[--brand] transition-colors truncate w-full tracking-tight">
              {cuisine.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
