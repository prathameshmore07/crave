import React from 'react';
import { Check, Receipt, ChefHat, Flame, ShoppingBag, Bike, MapPin, Bell, CheckCircle2 } from 'lucide-react';

const stages = [
  { name: "Order Confirmed", desc: "We have received your order and payment successfully.", icon: Receipt },
  { name: "Restaurant Accepted", desc: "Our chef has accepted your order and is reviewing instructions.", icon: ChefHat },
  { name: "Preparing Food", desc: "Fresh ingredients are being chopped and cooked with care.", icon: Flame },
  { name: "Food Ready", desc: "Your meal is packed and waiting for our rider.", icon: ShoppingBag },
  { name: "Picked Up", desc: "Rider has picked up your package in a thermal insulated container.", icon: Bike },
  { name: "On The Way", desc: "Rider is heading towards your location using real-time GPS coordinates.", icon: MapPin },
  { name: "Arriving Soon", desc: "Rider is just a few blocks away! Keep your phone handy.", icon: Bell },
  { name: "Delivered", desc: "Order delivered! Enjoy your fresh and delicious bites.", icon: CheckCircle2 }
];

export default function ProgressBar({ currentStageIdx }) {
  return (
    <div className="w-full py-2 select-none">
      <div className="relative flex flex-col pl-3">
        {/* Continuous Vertical Connector Line */}
        <div 
          className="absolute left-[23px] top-[18px] bottom-[18px] w-0.5 bg-gray-100 dark:bg-neutral-800 z-0"
        />

        {/* Highlighted Fill Connector Line */}
        <div 
          className="absolute left-[23px] top-[18px] w-0.5 bg-brand z-0 transition-all duration-700 ease-out"
          style={{
            height: `${Math.min(100, (currentStageIdx / (stages.length - 1)) * 100)}%`,
            maxHeight: 'calc(100% - 36px)'
          }}
        />

        {/* Vertical Stages List */}
        <div className="space-y-3 relative z-10">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIdx;
            const isActive = index === currentStageIdx;
            const isFuture = index > currentStageIdx;
            const IconComponent = stage.icon;

            return (
              <div key={stage.name} className={`flex items-start gap-4 transition-all duration-300 ${
                isActive ? 'scale-[1.01]' : 'opacity-70'
              }`}>
                {/* Timeline Icon Badge */}
                <div className="relative flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-[18px] h-[18px] ml-1.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs z-10 relative animate-scale-up">
                      <Check size={9} strokeWidth={4} />
                    </div>
                  ) : isActive ? (
                    <div className="relative flex items-center justify-center w-[30px] h-[30px] z-10">
                      {/* Pulsing Outer Scale */}
                      <span className="absolute inset-0 rounded-full bg-brand/20 animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="w-[26px] h-[26px] rounded-full bg-brand text-white flex items-center justify-center shadow-sm shadow-brand/30 border-2 border-white dark:border-dark-surface">
                        <IconComponent size={11} className="animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-[16px] h-[16px] ml-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 flex items-center justify-center border border-gray-200 dark:border-neutral-700 z-10 relative text-[10px]">
                      <IconComponent size={8} />
                    </div>
                  )}
                </div>

                {/* Text Content Column */}
                <div className={`flex-1 min-w-0 ${isActive ? 'pl-0' : 'pl-2'}`}>
                  <h4 className={`text-xs font-bold leading-tight ${
                    isActive 
                      ? 'text-brand text-[12px]' 
                      : isCompleted 
                        ? 'text-gray-800 dark:text-gray-200' 
                        : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {stage.name}
                  </h4>
                  {isActive && (
                    <p className="text-[10px] mt-0.5 leading-relaxed font-bold text-gray-850 dark:text-gray-150 animate-fade-in">
                      {stage.desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
