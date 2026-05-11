import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, Flame, X, Sparkles, RotateCcw } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'sonner';
import DishImage from '../components/common/DishImage';

// Exquisite curated deck of campus favorites
const EXPLORER_DECK = [
  {
    id: "exp-1",
    name: "Classic Masala Dosa",
    price: 110,
    rating: 4.8,
    restaurant: "Malgudi Express",
    restaurantId: "rest-malgudi",
    deliveryTime: "20 mins",
    spiceLevel: 1,
    popularityTag: "Hostel Legend",
    funDescription: "Golden crispy crepe stuffed with spiced potato mash and served with dollops of ghee. Fueling engineering sessions since 2012.",
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=60",
    isVeg: true
  },
  {
    id: "exp-2",
    name: "Butter Chicken Classic",
    price: 320,
    rating: 4.9,
    restaurant: "Sher-E-Punjab",
    restaurantId: "rest-punjab",
    deliveryTime: "30 mins",
    spiceLevel: 2,
    popularityTag: "Sunday Special",
    funDescription: "Juicy tandoori chicken chunks cooked in a rich, velvety tomato-butter gravy with fresh cream. The ultimate comfort reward.",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop&q=60",
    isVeg: false
  },
  {
    id: "exp-3",
    name: "Sizzling Chocolate Brownie",
    price: 120,
    rating: 4.7,
    restaurant: "The Dessert Room",
    restaurantId: "rest-desserts",
    deliveryTime: "15 mins",
    spiceLevel: 0,
    popularityTag: "Exam Fuel",
    funDescription: "Fudgy warm chocolate brownie topped with chocolate chips. Guaranteed to release instant endorphins before that tough viva.",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=60",
    isVeg: true
  },
  {
    id: "exp-4",
    name: "Cheese Burst Margherita Pizza",
    price: 240,
    rating: 4.6,
    restaurant: "Pizza Kraft",
    restaurantId: "rest-pizza",
    deliveryTime: "25 mins",
    spiceLevel: 1,
    popularityTag: "Midnight Craving",
    funDescription: "Laden with local premium mozzarella, fresh basil, and an oozing cheese core that pulls for miles. Sharing highly discouraged.",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60",
    isVeg: true
  },
  {
    id: "exp-5",
    name: "Crispy Golden Fries",
    price: 90,
    rating: 4.5,
    restaurant: "Burger & Co",
    restaurantId: "rest-burger",
    deliveryTime: "18 mins",
    spiceLevel: 1,
    popularityTag: "Surprisingly Good",
    funDescription: "Skin-on potatoes salted to perfection and crisp as gold. Pairs beautifully with any academic procrastination routine.",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=60",
    isVeg: true
  },
  {
    id: "exp-6",
    name: "Chicken Dum Biryani",
    price: 280,
    rating: 4.9,
    restaurant: "Biryani Darbar",
    restaurantId: "rest-biryani",
    deliveryTime: "28 mins",
    spiceLevel: 3,
    popularityTag: "Messy but Worth It",
    funDescription: "Fragrant basmati rice layered with succulent chicken pieces, fried onions, saffron, and slow dum-cooked to absolute royalty.",
    imageUrl: "https://static.toiimg.com/thumb/54308405.cms?imgsize=510571&width=800&height=800",
    isVeg: false
  },
  {
    id: "exp-7",
    name: "Classic Paneer Roll",
    price: 130,
    rating: 4.4,
    restaurant: "Kolkata Kati Rolls",
    restaurantId: "rest-rolls",
    deliveryTime: "15 mins",
    spiceLevel: 2,
    popularityTag: "Student Favorite",
    funDescription: "Crispy flaky paratha wrapped tightly around charred, spiced paneer cubes, crunchy green peppers, and tang zesty mint chutney.",
    imageUrl: "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/02/paneer-biryani-recipe.jpg",
    isVeg: true
  }
];

// Tinder-style individual interactive card component
function SwipeCard({ item, onSwipeLeft, onSwipeRight, active }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map horizontal movement to rotation and opacity overlays
  const rotate = useTransform(x, [-150, 150], [-15, 15]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  
  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, 0], [1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 120) {
      onSwipeRight(item);
    } else if (info.offset.x < -120) {
      onSwipeLeft(item);
    }
  };

  if (!active) return null;

  return (
    <motion.div
      style={{ x, y, rotate, opacity, zIndex: 10 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileGrab={{ scale: 1.02, cursor: 'grabbing' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="absolute inset-0 w-full h-full bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden border border-black/[0.04] dark:border-white/[0.04] select-none cursor-grab"
    >
      {/* Absolute Overlays for Swipe Indicators */}
      <motion.div 
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 z-20 border-4 border-emerald-500 text-emerald-500 font-black text-xl uppercase tracking-widest px-4 py-1.5 rounded-xl rotate-[-12deg]"
      >
        CRAVE
      </motion.div>
      <motion.div 
        style={{ opacity: nopeOpacity }}
        className="absolute top-6 right-6 z-20 border-4 border-rose-500 text-rose-500 font-black text-xl uppercase tracking-widest px-4 py-1.5 rounded-xl rotate-[12deg]"
      >
        SKIP
      </motion.div>

      {/* Hero Image */}
      <div className="relative h-[55%] w-full bg-neutral-100 dark:bg-neutral-800">
        <DishImage
          src={item.imageUrl}
          alt={item.name}
          dishName={item.name}
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* Top Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
        
        {/* Floating Top Widgets */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <span className="bg-white/90 dark:bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-brand shadow-sm flex items-center gap-1">
            <Sparkles size={10} /> {item.popularityTag}
          </span>
          <span className="bg-black/45 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-white">
            ⏱ {item.deliveryTime}
          </span>
        </div>

        {/* Veg / Non-Veg Indicator Dot */}
        <div className="absolute bottom-3 right-4 bg-white/90 dark:bg-neutral-950/95 p-1 rounded-md shadow-xs pointer-events-none">
          <div className={item.isVeg ? 'veg-dot' : 'nonveg-dot'} />
        </div>
      </div>

      {/* Details Area */}
      <div className="p-6 h-[45%] flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-neutral-850 dark:text-neutral-100 leading-tight tracking-tight">
                {item.name}
              </h2>
              <p className="text-xs text-brand font-black tracking-wide leading-none mt-1">
                by {item.restaurant}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-black text-neutral-900 dark:text-neutral-50 block leading-none">
                {formatPrice(item.price)}
              </span>
              <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                ★ {item.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal line-clamp-3 pt-1">
            {item.funDescription}
          </p>
        </div>

        {/* Info Grid footer with professional icon replacement */}
        <div className="flex items-center gap-2 border-t border-black/[0.05] dark:border-white/[0.05] pt-3.5 mt-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Spice Level:</span>
          <div className="flex items-center gap-0.5">
            {item.spiceLevel > 0 ? (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: item.spiceLevel }).map((_, i) => (
                  <Flame key={i} size={11} className="fill-brand text-brand" />
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">Mild</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FoodExplorer() {
  const addItem = useCartStore((state) => state.addItem);

  const [deck, setDeck] = useState(EXPLORER_DECK);
  const [index, setIndex] = useState(0);
  const [bursts, setBursts] = useState([]);

  const currentItem = deck[index];

  const triggerBurst = (type) => {
    const burstId = Date.now() + Math.random();
    const newBursts = Array.from({ length: 8 }).map((_, i) => ({
      id: `${burstId}-${i}`,
      type,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      rotate: (Math.random() - 0.5) * 60,
      scale: Math.random() * 0.4 + 0.6
    }));
    setBursts(prev => [...prev, ...newBursts]);
    setTimeout(() => {
      setBursts(prev => prev.filter(b => !newBursts.some(nb => nb.id === b.id)));
    }, 850);
  };

  const handleSwipeLeft = (item) => {
    setIndex(prev => prev + 1);
    triggerBurst("skip");
    toast.info(`Skipped ${item.name}`, { position: 'top-center', duration: 1000 });
  };

  const handleSwipeRight = (item) => {
    setIndex(prev => prev + 1);
    triggerBurst("save");
    toast.success(`Saved ${item.name} to Wishlist!`, { position: 'top-center', duration: 1000 });
  };

  // Center Crave / Add to Cart action: adds directly to cart, triggers toast, and advances deck!
  const handleCraveAdd = (item) => {
    const restaurantInfo = {
      id: item.restaurantId,
      name: item.restaurant,
      locality: "Campus Kitchens",
      imageUrl: item.imageUrl
    };

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      isVeg: item.isVeg,
      imageUrl: item.imageUrl
    }, restaurantInfo);

    setIndex(prev => prev + 1);
    triggerBurst("crave");
    toast.success(`Added ${item.name} to cart!`, {
      position: 'top-center',
      duration: 1500
    });
  };

  const handleReset = () => {
    setIndex(0);
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-8 flex flex-col justify-center min-h-[calc(100vh-180px)]">
      
      {/* Page Title Header */}
      <div className="text-center space-y-1 select-none">
        <h1 className="text-2xl font-black tracking-tight text-neutral-850 dark:text-neutral-50 flex items-center justify-center gap-1.5">
          <Flame size={22} className="text-brand fill-brand animate-pulse" />
          Food Explorer
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          Quickly swipe right to save, left to skip, or crave to cart!
        </p>
      </div>

      {/* Floating Reaction Canvas */}
      <div className="relative w-full h-[400px] flex items-center justify-center select-none">
        {/* Animated bursts overlay with professional icon replacement */}
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          <AnimatePresence>
            {bursts.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 1, scale: 0.2, x: 0, y: 0, rotate: 0 }}
                animate={{ opacity: 0, scale: b.scale, x: b.x, y: b.y, rotate: b.rotate }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-[50%] top-[50%] pointer-events-none select-none"
              >
                {b.type === 'skip' && <X size={20} className="text-rose-500" strokeWidth={3} />}
                {b.type === 'save' && <Heart size={20} className="text-emerald-500 fill-emerald-500" />}
                {b.type === 'crave' && <Flame size={20} className="text-brand fill-brand" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stack of Swipeable Cards */}
        <div className="relative w-[320px] h-[400px]">
          <AnimatePresence mode="popLayout">
            {index < deck.length ? (
              <div className="absolute inset-0 w-full h-full">
                {index + 1 < deck.length && (
                  <div className="absolute inset-0 w-full h-full bg-white dark:bg-neutral-900 rounded-3xl border border-black/[0.04] dark:border-white/[0.04] opacity-50 scale-[0.96] translate-y-3 shadow-md pointer-events-none z-0 overflow-hidden">
                    <div className="h-[55%] w-full bg-neutral-100 dark:bg-neutral-800" />
                  </div>
                )}
                
                {/* Active Interactive Card */}
                <SwipeCard
                  key={currentItem.id}
                  item={currentItem}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  active={true}
                />
              </div>
            ) : (
              // Deck End Empty State
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900/40 dark:to-neutral-900/10 rounded-3xl border border-black/[0.05] dark:border-white/[0.05] flex flex-col items-center justify-center p-6 text-center space-y-5 shadow-inner"
              >
                <div className="w-16 h-16 rounded-full bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand">
                  <RotateCcw size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-neutral-850 dark:text-neutral-50">End of Explorer Deck</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium max-w-[220px]">
                    You have browsed all trending dishes. Reset the deck to swipe again!
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="h-10 px-5 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-850 text-white dark:text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <RotateCcw size={12} strokeWidth={2.5} /> Reset Deck
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Manual Swiping Buttons Drawer */}
      {index < deck.length && (
        <div className="flex items-center justify-center gap-6 pt-2 select-none">
          {/* 1. Skip Button */}
          <button
            onClick={() => handleSwipeLeft(currentItem)}
            className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 border border-black/[0.05] dark:border-white/[0.05] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
            title="Skip (Swipe Left)"
          >
            <X size={20} strokeWidth={3} />
          </button>

          {/* 2. Crave / Add to Cart Button */}
          <button
            onClick={() => handleCraveAdd(currentItem)}
            className="w-16 h-16 rounded-full bg-brand hover:bg-brand-hover text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
            title="Add to Cart (Crave)"
          >
            <Flame size={28} className="fill-white" />
          </button>

          {/* 3. Save Button */}
          <button
            onClick={() => handleSwipeRight(currentItem)}
            className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 border border-black/[0.05] dark:border-white/[0.05] text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
            title="Save (Swipe Right)"
          >
            <Heart size={20} strokeWidth={3} className="fill-emerald-500" />
          </button>
        </div>
      )}
    </div>
  );
}
