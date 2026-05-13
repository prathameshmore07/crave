import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ 
  title = "No results found", 
  description = "We couldn't find anything matching your selection. Try changing filters or city.", 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 max-w-md mx-auto">
      <div className="p-4 bg-gray-50 dark:bg-dark-surface border border-black/[0.05] dark:border-white/[0.05] rounded-full text-gray-400 mb-4">
        <Inbox size={32} />
      </div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-10 px-6 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
