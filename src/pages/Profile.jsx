import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useReviewStore } from '../store/reviewStore';
import { useOrderStore } from '../store/orderStore';
import { useForm } from 'react-hook-form';
import OrderHistory from '../components/profile/OrderHistory';
import SavedAddresses from '../components/profile/SavedAddresses';
import FavRestaurants from '../components/profile/FavRestaurants';
import MembershipProfile from '../components/profile/MembershipProfile';
import { menuItemImages } from '../data/restaurants';
import { formatPrice } from '../utils/formatPrice';
import DishImage from '../components/common/DishImage';
import { 
  User, MapPin, Heart, ClipboardList, HelpCircle, Save, LogOut, 
  ChevronDown, ChevronUp, Star, MessageSquare, PhoneCall,
  Award, ShieldCheck, Sun, Moon, Sparkles, RefreshCw, Eye, EyeOff, Edit3, X, Trash2, Check, Crown
} from 'lucide-react';
import { toast } from 'sonner';
import useMembershipStore from '../store/membershipStore';

const DonutIcon = ({ className, size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 11.5 21.95 11 21.85 10.5C21.1 10.9 20.1 11 19.5 10.5C18.5 9.7 18.8 8.2 19.8 7.5C19.3 6 18.3 4.7 17 3.8C16 4.8 14.5 5 13.5 4C13 3.5 13.1 2.5 13.5 1.85C13 1.75 12.5 1.7 12 1.7V2ZM12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8Z" 
      fill="#F43F5E"
    />
    <path 
      d="M12 3.5C7.306 3.5 3.5 7.306 3.5 12C3.5 16.694 7.306 20.5 12 20.5C16.694 20.5 20.5 16.694 20.5 12C20.5 11.7 20.47 11.4 20.4 11.1C19.7 11.3 18.9 11 18.5 10.5C17.2 9.4 17.6 7.4 19 6.5C18.4 5.2 17.4 4.1 16.2 3.3C15.2 4.3 13.5 4.5 12.5 3.5C12.3 3.3 12.1 3.1 12 3V3.5ZM12 9C13.657 9 15 10.343 15 12C15 13.657 13.657 15 12 15C10.343 15 9 13.657 9 12C9 10.343 10.343 9 12 9Z" 
      fill="#FDA4AF"
    />
    <rect x="6" y="11" width="2" height="0.8" rx="0.4" transform="rotate(30 6 11)" fill="#FFF" />
    <rect x="10" y="5" width="2" height="0.8" rx="0.4" transform="rotate(-45 10 5)" fill="#FFF" />
    <rect x="15" y="15" width="2" height="0.8" rx="0.4" transform="rotate(15 15 15)" fill="#FFF" />
    <rect x="7" y="16" width="2" height="0.8" rx="0.4" transform="rotate(-15 7 16)" fill="#FFF" />
    <rect x="14" y="9" width="2" height="0.8" rx="0.4" transform="rotate(60 14 9)" fill="#FFF" />
  </svg>
);


const faqs = [
  { q: "How do I cancel my food delivery order?", a: "You can cancel your order within 60 seconds of placing it by reaching out to our support chat. Post confirmation, cancellations are not permitted." },
  { q: "Is cash on delivery available?", a: "Yes, we support Cash on Delivery (COD) as well as Card/UPI on Delivery across all serviceable areas." },
  { q: "How do I edit my delivery address after placing the order?", a: "Once placed, the address cannot be shifted online. Please contact our support team immediately to coordinate with the rider." },
  { q: "What is the refund turnaround time?", a: "Refunds for digital payments (UPI, Card, Wallet) are credited to the source within 2-3 business days." }
];

const mockReviews = [
  {
    id: 1,
    restaurantName: "The Burger Club",
    restaurantImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80",
    rating: 5,
    date: "04 May 2026",
    comment: "Absolutely succulent meat and pristine packaging. Arrived 10 minutes early! Will order again."
  },
  {
    id: 2,
    restaurantName: "Kabab Corner",
    restaurantImage: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&auto=format&fit=crop&q=80",
    rating: 4,
    date: "28 April 2026",
    comment: "Extremely rich spices and generous portions. The garlic naan was slightly tough but flavor made up for it."
  }
];

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  // Ultra-premium, elegant, minimal slate-silver and dark metallic themes (Stripe/Zomato Premium style)
  const gradients = [
    "from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 text-zinc-800 dark:text-zinc-200",
    "from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-950 text-stone-800 dark:text-stone-200",
    "from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-950 text-neutral-800 dark:text-neutral-200"
  ];
  if (!name) return gradients[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
};

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const setSupportOpen = useUiStore((state) => state.setSupportOpen);

  // Subscribed selectors for custom reviews and order history reactive updates
  const customReviews = useReviewStore((state) => state.customReviews);
  const orderHistory = useOrderStore((state) => state.orderHistory);
  const submitReview = useReviewStore((state) => state.submitReview);
  const rateOrder = useOrderStore((state) => state.rateOrder);
  const deleteReview = useReviewStore((state) => state.deleteReview);

  // Membership tier
  const activeMembership = useMembershipStore((state) => state.activeMembership);
  const isMemberActive = useMembershipStore((state) => state.isActive());
  const planOptions = useMembershipStore((state) => state.getPlanOptions());
  const membershipPlanName = isMemberActive && activeMembership ? planOptions[activeMembership.type]?.name : null;

  const [activeTab, setActiveTab] = useState("account"); // 'account', 'orders', 'addresses', 'favorites', 'reviews', 'faq'
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [saving, setSaving] = useState(false);

  // States for editing a review dynamically in Profile
  const [editingReview, setEditingReview] = useState(null);
  const [editStars, setEditStars] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editFoodStars, setEditFoodStars] = useState(5);
  const [editDeliveryStars, setEditDeliveryStars] = useState(5);
  const [editPackagingStars, setEditPackagingStars] = useState(5);
  const [editDishRatings, setEditDishRatings] = useState({});
  const [reviewSort, setReviewSort] = useState("newest");

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || ""
    }
  });

  // Re-sync values if store updates using primitive dependencies to prevent infinite render loops
  const userFieldsKey = user ? `${user.name}-${user.email}-${user.phone}` : '';
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    }
  }, [userFieldsKey, reset]);

  // Sync tab from query parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  if (!user) return null;

  const onProfileSubmit = async (data) => {
    setSaving(true);
    // Dynamic delay for high end loading skeleton feel
    await new Promise(resolve => setTimeout(resolve, 800));
    updateProfile(data);
    setSaving(false);
    toast.success("Profile saved!", {
      description: "Your coordinates have been synchronized successfully."
    });
  };



  const tabs = [
    { id: 'account', label: 'Account Info', icon: User, desc: 'Contact details & credentials' },
    { id: 'membership', label: 'My Membership', icon: Crown, desc: 'Premium subscription & benefits' },
    { id: 'orders', label: 'Past Orders', icon: ClipboardList, desc: 'Billing receipts & timelines' },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, desc: 'Home, office, guest locations' },
    { id: 'favorites', label: 'My Favourites', icon: Heart, desc: 'Saved kitchens & cuisines' },
    { id: 'reviews', label: 'My Reviews', icon: Star, desc: 'Previous rating submissions' },
    { id: 'faq', label: 'FAQ & Help', icon: HelpCircle, desc: 'Instant support resolutions' }
  ];

  // Realistic Account Details
  const memberName = user?.name || "Rahul Sharma";
  const userInitials = getInitials(memberName);
  const avatarGradient = getAvatarColor(memberName);
  const joinedDate = "Member since Jan 2024";
  
  // Dynamic stats counting
  const ordersCount = user?.orderHistory?.length || 0;
  const reviewsCount = customReviews?.length || 0;
  const savedPlacesCount = user?.addresses?.length || 0;
  const favoritesCount = user?.favorites?.length || 0;

  // Account Setup Verification list
  const setupSteps = [
    { label: "Verify Email & Phone", done: !!user?.email && !!user?.phone },
    { label: "Add Delivery Address", done: savedPlacesCount > 0 },
    { label: "Configure Security Lock", done: true },
    { label: "Add Profile Picture", done: true }
  ];
  const completedSteps = setupSteps.filter(s => s.done).length;
  const setupProgress = Math.round((completedSteps / setupSteps.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 space-y-10 page-enter select-none">
      
      {/* 1. Profile Premium Hero Header */}
      <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 rounded-[28px] p-6 md:p-8 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        {/* User Card Presentation */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left z-10 flex-1 w-full">
          {/* Avatar Sphere with clean inline indicator */}
          <div className="relative shrink-0">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-3xl font-black tracking-normal shadow-sm border border-zinc-200 dark:border-zinc-850 animate-in fade-in duration-500`} id="dynamic-avatar-profile">
              {userInitials}
            </div>
            {/* Subtle Active indicator dot */}
            <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 shadow-xs animate-pulse" />
          </div>
 
          <div className="space-y-3 mt-1 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none truncate">{memberName}</h1>
              {isMemberActive ? (
                <span 
                  onClick={() => setActiveTab('membership')}
                  className="inline-flex self-center sm:self-start bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg cursor-pointer hover:bg-amber-500/20 transition-colors gap-1 items-center"
                >
                  <Crown size={10} className="text-amber-500" />
                  {membershipPlanName || 'PRO Member'}
                </span>
              ) : (
                <span 
                  onClick={() => navigate('/membership')}
                  className="inline-flex self-center sm:self-start bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg cursor-pointer hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors gap-1 items-center group"
                >
                  Normal Member
                  <span className="text-[7px] bg-amber-500 text-white px-1 py-0.5 rounded font-black leading-none group-hover:bg-amber-600 transition-colors">Upgrade</span>
                </span>
              )}
            </div>
            
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold tracking-tight">
              {joinedDate} • {user?.email || "rahul@gmail.com"} • {user?.phone || "No phone connected"}
            </p>
 
            {/* Quick Micro-stats inside Hero */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              {/* Stat 1: Orders */}
              <div 
                onClick={() => setActiveTab('orders')}
                className="bg-white dark:bg-zinc-950/60 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/60 px-4 py-2 rounded-xl text-center cursor-pointer transition-all shrink-0 min-w-[90px]"
              >
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Orders Placed</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{ordersCount}</span>
              </div>
              
              {/* Stat 2: Reviews */}
              <div 
                onClick={() => setActiveTab('reviews')}
                className="bg-white dark:bg-zinc-950/60 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/60 px-4 py-2 rounded-xl text-center cursor-pointer transition-all shrink-0 min-w-[90px]"
              >
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">My Reviews</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{reviewsCount}</span>
              </div>

              {/* Stat 3: Saved addresses */}
              <div 
                onClick={() => setActiveTab('addresses')}
                className="bg-white dark:bg-zinc-950/60 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/60 px-4 py-2 rounded-xl text-center cursor-pointer transition-all shrink-0 min-w-[90px]"
              >
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Saved Places</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{savedPlacesCount}</span>
              </div>

              {/* Stat 4: Favorites */}
              <div 
                onClick={() => setActiveTab('favorites')}
                className="bg-white dark:bg-zinc-950/60 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/60 px-4 py-2 rounded-xl text-center cursor-pointer transition-all shrink-0 min-w-[90px]"
              >
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Favourites</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{favoritesCount}</span>
              </div>
            </div>
          </div>
        </div>
 
        {/* Realistic Setup Completion Status Widget */}
        <div className="w-full lg:w-80 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-5 rounded-[22px] space-y-3 z-10 self-stretch flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" /> Account Setup
            </span>
            <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{setupProgress}% Done</span>
          </div>
 
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-950/40">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${setupProgress}%` }}
            />
          </div>
 
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {setupSteps.map((step) => (
              <div key={step.label} className="flex items-center gap-1">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"}`}>
                  <Check size={9} strokeWidth={3} />
                </span>
                <span className="text-[9px] font-semibold text-zinc-500 truncate">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Panel Space */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* LEFT COLUMN: Premium List Sidebar */}
        <div className="col-span-1 flex flex-col gap-3">
          
          {/* Scrollable Nav Bar (Mobile layout friendly) & Vertical List on Desktop */}
          <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900/60 p-2.5 rounded-2xl flex lg:flex-col overflow-x-auto lg:overflow-x-visible whitespace-nowrap lg:whitespace-normal gap-1.5 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchParams({ tab: tab.id });
                  }}
                  className={`py-3 px-4 rounded-xl flex items-center gap-3.5 transition-all text-left outline-none cursor-pointer select-none shrink-0 lg:w-full ${
                    isActive 
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-md' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon size={16} className={`${isActive ? 'scale-110' : 'opacity-80'}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] tracking-tight">{tab.label}</span>
                    <span className={`text-[10px] font-medium leading-none mt-0.5 hidden lg:block ${isActive ? 'text-zinc-300 dark:text-zinc-500' : 'text-zinc-400'}`}>
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={() => {
              logout();
              toast.info("Logged out successfully");
              navigate("/");
            }}
            className="w-full h-12 border border-red-200/60 dark:border-red-950/40 bg-red-50/10 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer outline-none select-none"
          >
            <LogOut size={14} />
            Sign Out of Account
          </button>
        </div>

        {/* RIGHT COLUMN: Active Board Section Container */}
        <div className="col-span-1 lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[32px] p-6 md:p-8 shadow-xs min-h-[500px] transition-all relative">
          
          {/* TAB 1: Account Edit settings */}
          {activeTab === 'account' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-zinc-100 dark:border-zinc-900 pb-5">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Personal Account Coordinates</h3>
                <p className="text-[13px] text-zinc-400 mt-1 font-medium">Keep your identity credentials up to date for dispatch partners.</p>
              </div>

              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Full Legal Name</label>
                    <input
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      placeholder="e.g. Rahul Sharma"
                      className="h-12 px-4 w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[13px] font-semibold rounded-xl outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                    />
                    {errors.name && <span className="text-[11px] font-bold text-red-500 block">{errors.name.message}</span>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Active Phone Number</label>
                    <input
                      type="tel"
                      {...register("phone", { 
                        required: "Phone number is required",
                        minLength: { value: 10, message: "Phone must be exactly 10 digits" },
                        maxLength: { value: 10, message: "Phone must be exactly 10 digits" }
                      })}
                      placeholder="e.g. 9876543210"
                      className="h-12 px-4 w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[13px] font-semibold rounded-xl outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                    />
                    {errors.phone && <span className="text-[11px] font-bold text-red-500 block">{errors.phone.message}</span>}
                  </div>

                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Primary Email Address</label>
                  <input
                    type="email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                    })}
                    placeholder="e.g. rahul@gmail.com"
                    className="h-12 px-4 w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[13px] font-semibold rounded-xl outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                  />
                  {errors.email && <span className="text-[11px] font-bold text-red-500 block">{errors.email.message}</span>}
                </div>

                {/* Micro Save state buttons */}
                <button
                  type="submit"
                  disabled={saving}
                  className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Synchronizing...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Account Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Membership Section */}
          {activeTab === 'membership' && (
            <div className="animate-fade-in">
              <MembershipProfile />
            </div>
          )}

          {/* TAB 3: Past Orders View */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <OrderHistory />
            </div>
          )}

          {/* TAB 4: Saved Locations list */}
          {activeTab === 'addresses' && (
            <div className="animate-fade-in">
              <SavedAddresses />
            </div>
          )}

          {/* TAB 5: Favorite Kitchens list */}
          {activeTab === 'favorites' && (
            <div className="animate-fade-in">
              <FavRestaurants />
            </div>
          )}

          {/* TAB 6: Rating Feedbacks/Reviews Panel */}
          {activeTab === 'reviews' && (() => {
            const customReviewsMap = customReviews || {};
            const history = orderHistory || [];
            
            // Extract and flatten custom ratings
            const customList = [];
            Object.keys(customReviewsMap).forEach(restaurantId => {
              const list = customReviewsMap[restaurantId] || [];
              list.forEach(rev => {
                const matchingOrder = history.find(o => o.orderId === rev.orderId);
                customList.push({
                  id: rev.id,
                  orderId: rev.orderId,
                  restaurantId,
                  restaurantName: matchingOrder?.restaurantName || rev.restaurantName || "Campus Kitchen",
                  restaurantImage: matchingOrder?.restaurantImageUrl || matchingOrder?.restaurantImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80",
                  rating: rev.rating,
                  foodQuality: rev.foodQuality || rev.rating,
                  deliveryExperience: rev.deliveryExperience || rev.rating,
                  packaging: rev.packaging || rev.rating,
                  emoji: rev.emoji || "🥰",
                  date: matchingOrder?.date || rev.date,
                  comment: rev.text,
                  dishRatings: rev.dishRatings || {},
                  items: matchingOrder?.items || [],
                  timestamp: rev.timestamp || Date.now(),
                  isCustom: true,
                  isEdited: rev.isEdited || matchingOrder?.rating?.isEdited || rev.date?.includes('Edited')
                });
              });
            });

            // Sort custom reviews
            const sortedReviews = [...customList].sort((a, b) => {
              if (reviewSort === "newest") {
                return b.timestamp - a.timestamp;
              } else if (reviewSort === "highest") {
                return b.rating - a.rating;
              } else if (reviewSort === "lowest") {
                return a.rating - b.rating;
              }
              return 0;
            });

            const handleSaveEdit = (e) => {
              e.preventDefault();
              if (!editingReview) return;
              
              // prevent empty review submission
              if (!editComment.trim()) {
                toast.error("Please provide a review comment.");
                return;
              }

              // Update in reviewStore
              submitReview(editingReview.restaurantId, {
                id: editingReview.id,
                orderId: editingReview.orderId,
                rating: editStars,
                foodQuality: editFoodStars,
                deliveryExperience: editDeliveryStars,
                packaging: editPackagingStars,
                emoji: editingReview.emoji || "🥰",
                text: editComment,
                items: editingReview.items || [], // map review to ordered dishes
                date: "Edited just now",
                dishRatings: editDishRatings
              });

              // Update in orderStore
              rateOrder(editingReview.orderId, {
                food: editStars,
                foodQuality: editFoodStars,
                deliveryExperience: editDeliveryStars,
                packaging: editPackagingStars,
                comment: editComment,
                emoji: editingReview.emoji || "🥰",
                timestamp: Date.now(),
                isEdited: true,
                dishRatings: editDishRatings
              });

              setEditingReview(null);
              toast.success("Review updated successfully!");
            };

            return (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Header and sorting toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Verified Culinary Audits ({sortedReviews.length})</h3>
                    <p className="text-[13px] text-zinc-400 mt-1 font-medium">Ratings and feedback reports logged under your student profile.</p>
                  </div>
                  {sortedReviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sort:</span>
                      <select
                        value={reviewSort}
                        onChange={(e) => setReviewSort(e.target.value)}
                        className="h-8 px-2.5 text-xs font-black bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 rounded-lg outline-none text-zinc-800 dark:text-zinc-300 cursor-pointer"
                      >
                        <option value="newest">Newest First</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                      </select>
                    </div>
                  )}
                </div>

                {sortedReviews.length === 0 ? (
                  <div className="text-center py-16 max-w-sm mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mx-auto">
                      <Star size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No review logs submitted</h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-1 leading-relaxed">
                        Go to your past orders history to leave reviews on delivered items.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-lg border-none outline-none cursor-pointer"
                    >
                      Review Past Orders
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedReviews.map((review) => (
                      <div 
                        key={review.id} 
                        className="p-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-2xl space-y-4 hover:shadow-xs transition-shadow flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          {/* Card header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200/40 flex-shrink-0">
                                <DishImage src={review.restaurantImage} alt={review.restaurantName} dishName={review.restaurantName} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none truncate max-w-[140px] md:max-w-[180px]">{review.restaurantName}</h4>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-[10px] text-zinc-450 font-medium">{review.date}</span>
                                  {review.isEdited && (
                                    <span className="text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                      Edited
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm scale-110">{review.emoji}</span>
                          </div>

                          {/* Star rating & sub-ratings */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[9px] text-zinc-400 font-extrabold uppercase tracking-wide">
                              <span>Food: {review.foodQuality}★</span>
                              <span>Rider: {review.deliveryExperience}★</span>
                              <span>Package: {review.packaging}★</span>
                            </div>
                          </div>

                          {/* Custom Dish Ratings inside cards */}
                          {review.items && review.items.length > 0 && (
                            <div className="pt-2.5 border-t border-dashed border-zinc-200/40 dark:border-zinc-800/40 space-y-1">
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-550 font-black uppercase tracking-wider block">Dish Scores:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {review.items.map((item) => {
                                  const dStars = review.dishRatings[item.id] || 5;
                                  return (
                                    <div key={item.id} className="flex items-center justify-between bg-white dark:bg-zinc-950/40 p-1.5 px-2 rounded-lg text-[10px] font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200/10">
                                      <span className="truncate max-w-[100px]">{item.name}</span>
                                      <div className="flex items-center gap-0.5">
                                        {Array.from({ length: dStars }).map((_, i) => (
                                          <Star key={i} size={8} className="fill-amber-400 text-amber-400" />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Written comment */}
                          <p className="text-[13px] text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed italic text-left border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 py-0.5">
                            "{review.comment}"
                          </p>
                        </div>

                        {/* Card footer: verification & action buttons */}
                        <div className="pt-3 border-t border-zinc-200/20 dark:border-zinc-800/20 mt-4 space-y-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider">
                            <ShieldCheck size={12} /> Verified Gourmet Review
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => {
                                setEditingReview(review);
                                setEditStars(review.rating);
                                setEditComment(review.comment);
                                setEditFoodStars(review.foodQuality || review.rating);
                                setEditDeliveryStars(review.deliveryExperience || review.rating);
                                setEditPackagingStars(review.packaging || review.rating);
                                setEditDishRatings(review.dishRatings || {});
                              }}
                              className="flex items-center gap-1 text-[10px] text-brand hover:underline font-black uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer p-0"
                            >
                              <Edit3 size={11} /> Edit Review
                            </button>
                            
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete your verified review for ${review.restaurantName}?`)) {
                                  deleteReview(review.restaurantId, review.orderId);
                                  rateOrder(review.orderId, null);
                                  toast.success("Review deleted successfully!");
                                }
                              }}
                              className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 hover:underline font-black uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer p-0"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit inline reviews pop-up */}
                {editingReview && (
                  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setEditingReview(null)} />
                    <div className="bg-white dark:bg-dark-surface border border-zinc-100 dark:border-zinc-800 rounded-[24px] max-w-md w-full p-6 shadow-2xl relative z-10 text-left max-h-[85vh] overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                        <div>
                          <span className="text-[9px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Review Customizer</span>
                          <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider mt-1 truncate max-w-[280px]">
                            {editingReview.restaurantName}
                          </h4>
                        </div>
                        <button 
                          onClick={() => setEditingReview(null)}
                          className="w-7 h-7 rounded-full bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-400 cursor-pointer border-none outline-none"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <form onSubmit={handleSaveEdit} className="space-y-4">
                        {/* Overall rating stars */}
                        <div className="space-y-2 py-3 px-4 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100/40 dark:border-zinc-800/40 text-center">
                          <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider block">Adjust Stars ({editStars}★)</span>
                          <div className="flex items-center justify-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setEditStars(star)}
                                className="bg-transparent border-none outline-none cursor-pointer hover:scale-115 transition-transform"
                              >
                                <Star 
                                  size={24} 
                                  className={star <= editStars ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-750"} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sub-ratings details */}
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center justify-between p-3 bg-zinc-50/35 dark:bg-zinc-900/10 rounded-lg border border-zinc-100/10">
                            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">🍔 Food Quality</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button type="button" key={star} onClick={() => setEditFoodStars(star)} className="cursor-pointer bg-transparent border-none p-0">
                                  <Star size={14} className={star <= editFoodStars ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800"} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-zinc-50/35 dark:bg-zinc-900/10 rounded-lg border border-zinc-100/10">
                            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">🛵 Delivery Speed</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button type="button" key={star} onClick={() => setEditDeliveryStars(star)} className="cursor-pointer bg-transparent border-none p-0">
                                  <Star size={14} className={star <= editDeliveryStars ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800"} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-zinc-50/35 dark:bg-zinc-900/10 rounded-lg border border-zinc-100/10">
                            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">📦 Packaging Quality</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button type="button" key={star} onClick={() => setEditPackagingStars(star)} className="cursor-pointer bg-transparent border-none p-0">
                                  <Star size={14} className={star <= editPackagingStars ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800"} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Edit Dish Ratings */}
                        {editingReview.items && editingReview.items.length > 0 && (
                          <div className="space-y-3 py-3 px-4 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100/40 dark:border-zinc-800/40">
                            <span className="text-[10px] text-zinc-550 dark:text-zinc-450 font-black uppercase tracking-wider block mb-1">Edit Dish Ratings</span>
                            <div className="space-y-3.5">
                              {editingReview.items.map((item) => {
                                const dishImg = menuItemImages[item.name] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80";
                                const dRating = editDishRatings[item.id] || 5;
                                return (
                                  <div key={item.id} className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100/30 dark:border-zinc-900/40">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-8 h-8 rounded-md overflow-hidden bg-zinc-50 border border-zinc-200/40 flex-shrink-0">
                                        <DishImage src={dishImg} alt={item.name} dishName={item.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="text-left min-w-0">
                                        <h5 className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight truncate max-w-[150px]">{item.name}</h5>
                                        <span className="text-[9px] text-zinc-400 font-semibold">{item.quantity}x • {formatPrice(item.price)}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          type="button"
                                          key={star}
                                          onClick={() => {
                                            setEditDishRatings(prev => ({ ...prev, [item.id]: star }));
                                          }}
                                          className="focus:outline-none hover:scale-115 transition-transform bg-transparent border-none outline-none cursor-pointer p-0"
                                        >
                                          <Star
                                            size={14}
                                            className={star <= dRating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800"}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Text Comment with autosizing/character limit */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">Modify Comment</label>
                            <span className="text-[9px] font-bold text-zinc-400">{editComment.length} / 500</span>
                          </div>
                          <textarea
                            rows={3}
                            maxLength={500}
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            className="w-full p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold rounded-xl outline-none text-zinc-800 dark:text-zinc-200 focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="h-10 w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border-none cursor-pointer outline-none shadow-xs"
                        >
                          Save Changes
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}


          {/* TAB 8: Collapsible FAQs & Support */}
          {activeTab === 'faq' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-zinc-100 dark:border-zinc-900 pb-5">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Help Desk & Support Center</h3>
                <p className="text-[13px] text-zinc-400 mt-1 font-medium">Read official policy definitions or get immediate query solutions.</p>
              </div>

              <div className="space-y-3.5 max-w-2xl">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10"
                    >
                      <button
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full p-4.5 flex justify-between items-center text-[13px] font-bold text-zinc-800 dark:text-zinc-200 text-left outline-none"
                      >
                        {faq.q}
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isOpen && (
                        <div className="px-4.5 pb-4.5 text-[13px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed border-t border-zinc-100 dark:border-zinc-900 pt-3 animate-in fade-in duration-300 text-left">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Live Help Premium Card Widget */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-2xl text-left animate-in fade-in duration-300">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand block">Live Support Bridge</span>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Need live gourmet agent assistance?</h4>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold leading-relaxed">
                    Our local delivery captain and kitchen liaison desk are online 24/7. Chat live with Rohan or queue a priority callback.
                  </p>
                </div>
                <div className="flex gap-2.5 w-full md:w-auto flex-shrink-0">
                  <button
                    onClick={() => setSupportOpen(true, 'chat')}
                    className="flex-1 md:flex-initial h-10 px-4 bg-brand hover:bg-brand-hover text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-brand/10 cursor-pointer outline-none border-none"
                  >
                    <MessageSquare size={13} />
                    Live Chat
                  </button>
                  <button
                    onClick={() => setSupportOpen(true, 'helpline')}
                    className="flex-1 md:flex-initial h-10 px-4 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none"
                  >
                    <PhoneCall size={12} />
                    Helpline callback
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
