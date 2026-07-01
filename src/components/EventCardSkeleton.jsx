import React from 'react';

export default function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-48 bg-gray-200 w-full" />
      
      {/* Content Skeleton */}
      <div className="p-5">
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
        
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4" />
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-2/5" />
          </div>
        </div>
        
        <div className="pt-4 border-t flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
