import React from 'react';

export default function AlertListSkeleton({ count = 3 }) {
  return (
    <div className="animate-pulse space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#121A28] border border-[#1E293B] rounded-lg p-4 flex justify-between items-center border-l-4 border-l-[#1E293B]">
          <div className="space-y-2.5 w-2/3">
            <div className="h-3 w-1/3 bg-[#1E293B] rounded"></div>
            <div className="h-2 w-full bg-[#1E293B] rounded"></div>
          </div>
          {/* Mock Button */}
          <div className="h-7 w-16 bg-[#1E293B] rounded flex-shrink-0"></div>
        </div>
      ))}
    </div>
  );
}