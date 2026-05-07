import React from 'react';

export default function SystemResourceSkeleton() {
  return (
    <div className="bg-[#121A28] border border-[#1E293B] rounded-lg p-5 flex flex-col h-full animate-pulse">
      {/* Title */}
      <div className="h-3 w-1/2 bg-[#1E293B] rounded mb-6"></div>
      
      <div className="flex flex-col justify-between flex-1 space-y-4">
        {/* Progress Bars */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-1">
            <div className="flex justify-between mb-2">
              <div className="h-2 w-8 bg-[#1E293B] rounded"></div>
              <div className="h-2 w-10 bg-[#1E293B] rounded"></div>
            </div>
            <div className="w-full bg-[#0F141E] rounded-full h-1.5">
              {/* Randomized widths */}
              <div className={`h-1.5 rounded-full bg-[#1E293B] ${i === 1 ? 'w-1/3' : i === 2 ? 'w-2/3' : 'w-1/2'}`}></div>
            </div>
          </div>
        ))}
        
        {/* Bottom Text Lines */}
        <div className="pt-3 space-y-3 border-t border-[#1E293B]/50 mt-2">
            <div className="flex justify-between items-center">
              <div className="h-2 w-20 bg-[#1E293B] rounded"></div>
              <div className="h-3 w-10 bg-[#1E293B] rounded"></div>
            </div>
             <div className="flex justify-between items-center">
              <div className="h-2 w-12 bg-[#1E293B] rounded"></div>
              <div className="h-4 w-10 bg-[#1E293B] rounded-full"></div>
            </div>
        </div>
      </div>
    </div>
  );
}