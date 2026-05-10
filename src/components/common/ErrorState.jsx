import React, { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function ErrorState({ 
  message = "Something went wrong while fetching data.", 
  onRetry 
}) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } catch (e) {
      // Allow parent to bubble error or catch here
    } finally {
      // Maintain transition window
      setTimeout(() => {
        setRetrying(false);
      }, 400);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-16 h-16 bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 dark:border-red-500/20 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6 shadow-xs">
        <WifiOff size={28} className="animate-pulse" />
      </div>
      
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
        Connection Interrupted
      </h3>
      
      <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed max-w-xs">
        {message || "We're unable to connect to our kitchens. Please check your internet connection and try again."}
      </p>
      
      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[14px] font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none active:scale-95"
        >
          <RefreshCw size={14} className={`${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Reconnecting...' : 'Try Again'}
        </button>
      )}
    </div>
  );
}
