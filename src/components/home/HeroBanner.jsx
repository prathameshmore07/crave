import React, { useState, useEffect, useRef } from 'react';

const bannerOffers = [
  {
    id: 1,
    badge: "WELCOME OFFER",
    title: "50% OFF UP TO Rs 100",
    subtitle: "On your first order. Use code WELCOME50",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #E23744 0%, #901721 100%)",
    bgColorStart: "#901721",
    textColor: "#FFFFFF"
  },
  {
    id: 2,
    badge: "WEEKEND FEAST",
    title: "FLAT Rs 100 OFF",
    subtitle: "On orders above Rs 299. Use code FIRST100",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #1C1C1B 0%, #0A0A09 100%)",
    bgColorStart: "#0A0A09",
    textColor: "#FFFFFF"
  },
  {
    id: 3,
    badge: "FREE DELIVERY",
    title: "NO DELIVERY CHARGES",
    subtitle: "On orders above Rs 149. Use code FREEDEL",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(135deg, #2D2D2C 0%, #151515 100%)",
    bgColorStart: "#151515",
    textColor: "#FFFFFF"
  }
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerOffers.length);
      }, 4000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  return (
    <section 
      className="relative w-full h-[140px] md:h-[180px] rounded-2xl overflow-hidden cursor-pointer shadow-overlap-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {bannerOffers.map((offer, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={offer.id}
              className={`absolute inset-0 w-full h-full flex transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{ background: offer.bgGradient }}
            >
              {/* Left Content Column */}
              <div className="flex-1 flex flex-col justify-center pl-6 pr-4 md:pl-12 text-left select-none">
                <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.8px] uppercase opacity-90 mb-1" style={{ color: offer.textColor }}>
                  {offer.badge}
                </span>
                <h2 className="text-[18px] md:text-[24px] font-semibold leading-tight tracking-[-0.3px] uppercase mb-0.5" style={{ color: offer.textColor }}>
                  {offer.title}
                </h2>
                <p className="text-[11px] md:text-[13px] font-medium opacity-80 leading-relaxed" style={{ color: offer.textColor }}>
                  {offer.subtitle}
                </p>
              </div>

              {/* Right Image Column */}
              <div className="w-[35%] md:w-[30%] h-full relative overflow-hidden">
                {/* Slanted or clean cut */}
                <div 
                  className="absolute inset-0 z-10" 
                  style={{
                    background: `linear-gradient(to right, ${offer.bgColorStart} 0%, transparent 100%)`
                  }} 
                />
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80";
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pill Indicators */}
      <div className="absolute bottom-4 left-6 md:left-12 z-20 flex items-center space-x-1.5">
        {bannerOffers.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="focus:outline-none transition-all duration-300"
              style={{
                width: isActive ? '20px' : '6px',
                height: '6px',
                borderRadius: '9999px',
                backgroundColor: isActive ? '#E23744' : '#D0D0D0'
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    </section>
  );
}
