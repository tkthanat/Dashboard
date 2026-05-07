import React from 'react';

export default function KpiCardSkeleton() {
  return (
    <div className="bg-[#121A28] border border-[#1E293B] rounded-lg p-5 animate-pulse">
      {/* Header / Title */}
      <div className="h-3 w-1/3 bg-[#1E293B] rounded mb-4"></div>
      {/* Big Number / Main Value */}
      <div className="h-8 w-1/2 bg-[#1E293B] rounded mb-3"></div>
      {/* Subtitle / Description */}
      <div className="h-2 w-2/3 bg-[#1E293B] rounded"></div>
    </div>
  );
}