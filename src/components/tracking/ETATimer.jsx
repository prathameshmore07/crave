import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function ETATimer({ orderTimestamp, initialEta = 30 }) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialEta * 60);

  useEffect(() => {
    if (!orderTimestamp) return;

    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - new Date(orderTimestamp).getTime()) / 1000);
      
      // Let's speed up the delivery timeline simulation so that 60s in real time equals the full delivery.
      // To make the countdown look hyper-realistic, we scale the remaining time:
      // When elapsedSeconds is 0, remaining is initialEta * 60 (1800s).
      // When elapsedSeconds is 60, remaining is 0s.
      // So remaining seconds = Math.max(0, (1 - elapsedSeconds / 60) * initialEta * 60)
      const fractionRemaining = Math.max(0, 1 - elapsedSeconds / 60);
      const remaining = Math.round(fractionRemaining * initialEta * 60);
      setSecondsRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [orderTimestamp, initialEta]);

  const formatETA = () => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-brand/5 border border-brand/10 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-full bg-brand/10 text-brand">
          <Clock size={20} className="animate-pulse" />
        </span>
        <div>
          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100">Estimated Delivery Time</h4>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Your rider is speeding down the quickest route. Keep phone active!
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xl font-black text-brand tracking-wider font-mono">
          {formatETA()}
        </div>
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mins : Secs Left</span>
      </div>
    </div>
  );
}
