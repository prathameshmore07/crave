import React from 'react';
import { Phone, MessageSquare, Star, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function RiderCard({ rider, currentStageIdx = 0 }) {
  if (!rider) return null;

  // Dynamically map tracking stage to active rider coordinates status
  const getRiderStatus = () => {
    switch (currentStageIdx) {
      case 0:
      case 1:
        return "🏍️ Heading to the restaurant";
      case 2:
      case 3:
        return "👨‍🍳 Waiting for packaging at kitchen";
      case 4:
      case 5:
        return "⚡ On the way to your door";
      case 6:
        return "📍 Arrived near your location";
      case 7:
        return "✅ Delivered successfully";
      default:
        return "🏍️ Dispatched";
    }
  };

  return (
    <div className="p-4 border border-black/[0.05] dark:border-white/[0.05] bg-gray-50 dark:bg-dark-surface/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Initials Avatar Badge */}
        <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 text-brand font-extrabold flex items-center justify-center text-sm flex-shrink-0 shadow-xs relative">
          {rider.imageInitials}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-dark-bg rounded-full animate-pulse" />
        </div>

        {/* Rider Info details */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100">{rider.name}</h4>
            <span className="text-[9px] bg-brand/10 text-brand font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 tracking-wider">
              Delivery Hero
            </span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{rider.vehicle} • {rider.plateNumber}</p>
          
          <div className="flex items-center gap-2 pt-0.5 text-[10px] text-gray-600 dark:text-gray-400 font-bold">
            <span className="flex items-center gap-0.5 text-amber-600">
              <Star size={11} className="fill-current" />
              {rider.rating}
            </span>
            <span>•</span>
            <span>{rider.totalDeliveries} Rides Completed</span>
          </div>
          
          {/* Active coordinates status message */}
          <p className="text-[10px] text-brand font-extrabold pt-1 uppercase tracking-wide">{getRiderStatus()}</p>
        </div>
      </div>

      {/* Contact Trigger actions */}
      <div className="flex items-center gap-2 sm:self-center self-end">
        <button 
          onClick={() => toast.success(`Calling ${rider.name}... Please keep your line clear.`)}
          className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:border-brand hover:text-brand text-gray-600 dark:text-gray-300 transition-all cursor-pointer focus:outline-none"
          aria-label="Call Rider"
        >
          <Phone size={14} />
        </button>
        <button 
          onClick={() => toast.info(`Initializing secure chat tunnel with ${rider.name}...`)}
          className="p-2.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface hover:border-brand hover:text-brand text-gray-600 dark:text-gray-300 transition-all cursor-pointer focus:outline-none"
          aria-label="Message Rider"
        >
          <MessageSquare size={14} />
        </button>
      </div>
    </div>
  );
}
