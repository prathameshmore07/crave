import React from 'react';

export function Skeleton({ className }) {
  return (
    <div className={`skeleton-pulse bg-gray-200 dark:bg-neutral-800 rounded ${className}`}></div>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="w-full bg-[--card-bg] rounded-[16px] border border-[--border] overflow-hidden">
      {/* Image Skeleton */}
      <div className="h-[180px] w-full bg-gray-200 dark:bg-neutral-800 skeleton-pulse"></div>
      
      {/* Content Skeleton */}
      <div className="pt-[14px] px-[16px] pb-[16px] space-y-3">
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded"></div>
        <div className="h-4.5 w-1/2 bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded"></div>
        <div className="pt-2 flex gap-4 items-center">
          <div className="h-4 w-12 bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded"></div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="w-full flex justify-between py-6 border-b border-[--border]">
      <div className="space-y-2 flex-1 pr-4">
        <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded"></div>
        <div className="h-5 w-1/2 bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded"></div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded"></div>
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded text-sm"></div>
      </div>
      <div className="w-[80px] h-[80px] bg-gray-200 dark:bg-neutral-800 skeleton-pulse rounded-lg flex-shrink-0"></div>
    </div>
  );
}
