import React, { useState, useEffect, useRef } from 'react';
import { menuItemImages } from '../../data/restaurants';

// Robust, high-quality category-specific fallback images to guarantee visual consistency
export function getFoodCategoryFallback(name, category) {
  // 0. Check for exact match in our master item images database first (Original restaurant image)
  if (name && menuItemImages[name]) {
    return menuItemImages[name];
  }

  const lowercaseName = (name || "").toLowerCase();
  const lowercaseCategory = (category || "").toLowerCase();

  // Keyword check first for dosa variants
  if (lowercaseName.includes("dosa")) {
    if (lowercaseName.includes("masala") && !lowercaseName.includes("mysore")) {
      return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80"; // Masala Dosa
    }
    if (lowercaseName.includes("cheese")) {
      return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80"; // Cheese Dosa
    }
    if (lowercaseName.includes("paneer")) {
      return "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop&q=80"; // Paneer Dosa
    }
    if (lowercaseName.includes("mysore")) {
      return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80"; // Mysore Masala Dosa
    }
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80"; // Default Dosa fallback
  }

  // Idli / Vada
  if (lowercaseName.includes("idli")) {
    return "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseName.includes("vada")) {
    return "https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseName.includes("uttapam")) {
    return "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&auto=format&fit=crop&q=80";
  }

  // Fried Rice variations
  if (lowercaseName.includes("fried rice") || lowercaseName.includes("rice")) {
    if (lowercaseName.includes("triple") || lowercaseName.includes("schezwan")) {
      return "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop&q=80"; // Spicy/Schezwan Fried Rice
    }
    return "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop&q=80"; // Veg/Chicken Fried Rice
  }

  // Noodles
  if (lowercaseName.includes("noodle") || lowercaseName.includes("hakka") || lowercaseName.includes("schezwan")) {
    return "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80";
  }

  // Manchurian / Chilli Paneer
  if (lowercaseName.includes("manchurian") || lowercaseName.includes("chilli") || lowercaseName.includes("paneer")) {
    return "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80";
  }

  // Burgers
  if (lowercaseName.includes("burger")) {
    if (lowercaseName.includes("chicken")) {
      return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80"; // Chicken Burger
    }
    return "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80"; // Veg Burger
  }

  // Pizza / Continental / Pasta
  if (lowercaseName.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseName.includes("pasta") || lowercaseName.includes("alfredo") || lowercaseName.includes("penne")) {
    return "https://images.unsplash.com/photo-1645112481338-35623bb37f62?w=400&auto=format&fit=crop&q=80"; // Pasta image
  }
  if (lowercaseName.includes("fries") || lowercaseName.includes("chips")) {
    return "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80";
  }

  // Pav Bhaji / Street Food
  if (lowercaseName.includes("pav bhaji") || lowercaseName.includes("bhaji")) {
    return "https://images.unsplash.com/photo-1606491048563-eb955f4623e1?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseName.includes("vada pav") || lowercaseName.includes("samosa") || lowercaseName.includes("chaat") || lowercaseName.includes("puri") || lowercaseName.includes("bhature") || lowercaseCategory.includes("street")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80";
  }

  // Biryani
  if (lowercaseName.includes("biryani")) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80";
  }

  // Seafood
  if (lowercaseName.includes("fish") || lowercaseName.includes("prawn") || lowercaseName.includes("bombil") || lowercaseName.includes("surmai") || lowercaseCategory.includes("seafood")) {
    return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80";
  }

  // Curry / Dal / North Indian
  if (lowercaseName.includes("dal") || lowercaseName.includes("chicken") || lowercaseName.includes("kofta") || lowercaseName.includes("roti") || lowercaseName.includes("naan") || lowercaseCategory.includes("north indian")) {
    return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80";
  }

  // Beverages / Coffee / Shakes / Mojito
  if (lowercaseName.includes("coffee") || lowercaseName.includes("mojito") || lowercaseName.includes("shake") || lowercaseName.includes("juice") || lowercaseName.includes("soda") || lowercaseName.includes("drink") || lowercaseName.includes("chai") || lowercaseName.includes("tea") || lowercaseCategory.includes("beverages")) {
    if (lowercaseName.includes("coffee")) {
      return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80"; // Cold Coffee
    }
    if (lowercaseName.includes("shake")) {
      return "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80"; // Oreo Shake
    }
    if (lowercaseName.includes("mojito")) {
      return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80"; // Mojito
    }
    return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80"; // Default drink
  }

  // Sweets
  if (lowercaseName.includes("jamun") || lowercaseName.includes("rasgulla") || lowercaseName.includes("muffin") || lowercaseName.includes("croissant") || lowercaseName.includes("brownie") || lowercaseName.includes("sweet") || lowercaseName.includes("dessert")) {
    return "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&auto=format&fit=crop&q=80";
  }

  // Category fallbacks
  if (lowercaseCategory.includes("dosa") || lowercaseCategory.includes("south")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseCategory.includes("fried rice") || lowercaseCategory.includes("rice")) {
    return "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseCategory.includes("noodle") || lowercaseCategory.includes("chinese")) {
    return "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseCategory.includes("burger") || lowercaseCategory.includes("pizza") || lowercaseCategory.includes("fast")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseCategory.includes("biryani")) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseCategory.includes("sweet") || lowercaseCategory.includes("dessert")) {
    return "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&auto=format&fit=crop&q=80";
  }
  if (lowercaseCategory.includes("drink") || lowercaseCategory.includes("beverage") || lowercaseCategory.includes("cafe")) {
    return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80";
  }

  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80";
}

export default function DishImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  dishName = "",
  category = "",
  timeoutMs = 3500,
  showSpinner = true
}) {
  // isolate image state per menu item
  const [currentSrc, setCurrentSrc] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading", "loaded", "fallback"
  const lastValidSrc = useRef(null);
  const loadingUrlRef = useRef(null);
  const activeTimerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // validate manual image URL before render
  const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim();
    if (clean === "" || (clean.includes("?") && (clean.endsWith("?") || clean.includes("?placeholder") || clean.includes("question_mark")))) return false;
    // Must be a valid web URL or asset reference
    return clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/") || clean.startsWith("data:");
  };

  useEffect(() => {
    // prevent shared fallback corruption by validating before setting state
    if (!isValidUrl(src)) {
      // keep old image if new URL fails
      if (lastValidSrc.current) {
        setCurrentSrc(lastValidSrc.current);
        setStatus("loaded");
      } else {
        const fallback = getFoodCategoryFallback(dishName, category);
        setCurrentSrc(fallback);
        setStatus("fallback");
      }
      return;
    }

    // Isolate this loading process completely
    loadingUrlRef.current = src;
    setStatus("loading");

    if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

    let isMounted = true;
    let retryCount = 0;

    const tryLoad = (targetUrl) => {
      const img = new Image();
      let hasFinished = false;

      // Isolated loading timeout handling
      const timeoutTimer = setTimeout(() => {
        if (hasFinished || !isMounted || loadingUrlRef.current !== src) return;
        hasFinished = true;
        img.src = ""; // cancel network request
        handleFailure();
      }, timeoutMs);

      img.onload = () => {
        if (hasFinished || !isMounted || loadingUrlRef.current !== src) return;
        hasFinished = true;
        clearTimeout(timeoutTimer);

        lastValidSrc.current = targetUrl;
        setCurrentSrc(targetUrl);
        setStatus("loaded");
      };

      img.onerror = () => {
        if (hasFinished || !isMounted || loadingUrlRef.current !== src) return;
        hasFinished = true;
        clearTimeout(timeoutTimer);

        // Isolated retry logic (tries once after 300ms)
        if (retryCount < 1) {
          retryCount++;
          retryTimeoutRef.current = setTimeout(() => {
            if (isMounted && loadingUrlRef.current === src) {
              tryLoad(targetUrl);
            }
          }, 300);
        } else {
          handleFailure();
        }
      };

      img.src = targetUrl;
    };

    const handleFailure = () => {
      // keep old image if new URL fails
      if (lastValidSrc.current) {
        setCurrentSrc(lastValidSrc.current);
        setStatus("loaded");
      } else {
        const fallback = getFoodCategoryFallback(dishName, category);
        setCurrentSrc(fallback);
        setStatus("fallback");
      }
    };

    tryLoad(src);

    return () => {
      isMounted = false;
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [src, dishName, category, timeoutMs]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-150 dark:bg-zinc-900">
      {/* Isolated Loading Spinner State */}
      {status === "loading" && (
        <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center">
          {showSpinner && (
            <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt || dishName || "Food Item"}
          className={`${className} transition-all duration-500 ${
            status === "loaded" || status === "fallback" ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
}
