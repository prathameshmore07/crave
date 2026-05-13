import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-6 max-w-sm mx-auto animate-scale-up">
      <div className="inline-flex p-4 bg-brand/10 text-brand rounded-full">
        <ShoppingBag size={40} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Page Not Found</h2>
        <p className="text-xs text-gray-500 leading-relaxed font-semibold">
          Oops! The page you are looking for has been eaten by our kitchen chefs. Let's get you back to the menu!
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="h-11 px-6 bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} />
        Back to Home
      </button>
    </div>
  );
}
