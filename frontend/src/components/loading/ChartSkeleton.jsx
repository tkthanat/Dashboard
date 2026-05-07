import React from 'react';

export default function ChartSkeleton({ height = "h-64" }) {
  return (
    <div className="bg-[#121A28] border border-[#1E293B] rounded-lg p-5 animate-pulse flex flex-col">
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-3 w-1/4 bg-[#1E293B] rounded"></div>
        <div className="h-5 w-16 bg-[#1E293B] rounded-full"></div>
      </div>
      {/* Chart Area (จำลองรูปทรงกราฟแท่ง) */}
      <div className={`w-full ${height} border-b border-l border-[#1E293B] flex items-end px-2 gap-2 pb-0 pt-4`}>
         <div className="w-full h-1/4 bg-[#1E293B]/50 rounded-t"></div>
         <div className="w-full h-1/2 bg-[#1E293B]/50 rounded-t"></div>
         <div className="w-full h-1/3 bg-[#1E293B]/50 rounded-t"></div>
         <div className="w-full h-3/4 bg-[#1E293B]/50 rounded-t"></div>
         <div className="w-full h-2/5 bg-[#1E293B]/50 rounded-t"></div>
         <div className="w-full h-full bg-[#1E293B]/50 rounded-t"></div>
         <div className="w-full h-3/5 bg-[#1E293B]/50 rounded-t"></div>
      </div>
    </div>
  );
}