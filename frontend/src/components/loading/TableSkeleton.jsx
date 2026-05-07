import React from 'react';

export default function TableSkeleton({ rowCount = 5 }) {
  return (
    <div className="bg-[#121A28] border border-[#1E293B] rounded-lg p-5 animate-pulse">
       {/* Table Title */}
       <div className="h-3 w-48 bg-[#1E293B] rounded mb-6"></div>
       
       {/* Table Header Row */}
       <div className="flex justify-between mb-4 border-b border-[#1E293B] pb-3">
         <div className="h-2 w-1/5 bg-[#1E293B] rounded"></div>
         <div className="h-2 w-1/5 bg-[#1E293B] rounded"></div>
         <div className="h-2 w-1/5 bg-[#1E293B] rounded"></div>
         <div className="h-2 w-1/12 bg-[#1E293B] rounded"></div>
       </div>
       
       {/* Data Rows */}
       {Array.from({ length: rowCount }).map((_, i) => (
         <div key={i} className="flex justify-between items-center py-3.5 border-b border-[#1E293B]/50 last:border-0">
           <div className="h-3 w-1/5 bg-[#1E293B] rounded"></div>
           <div className="h-3 w-1/5 bg-[#1E293B] rounded"></div>
           <div className="h-3 w-1/5 bg-[#1E293B] rounded"></div>
           <div className="h-5 w-10 bg-[#1E293B] rounded-full"></div>
         </div>
       ))}
    </div>
  );
}