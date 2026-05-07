import React from 'react';

export default function OrderExecutionPanel() {
  return (
    <div className="bg-[#121A28] border border-[#1E293B] rounded-lg p-5 flex flex-col h-full">
      <div className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
        <span className="text-orange-500">⚡</span> ORDER EXECUTION
      </div>
      <div className="flex flex-col justify-between flex-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Avg Latency</span>
          <span className="text-[11px] text-green-500 font-mono font-bold">11 ms</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">P50</span>
          <span className="text-[11px] text-white font-mono">9 ms</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">P95</span>
          <span className="text-[11px] text-orange-400 font-mono">52 ms</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">P99</span>
          <span className="text-[11px] text-red-500 font-mono font-bold">238 ms</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Max Spike</span>
          <span className="text-[11px] text-red-500 font-mono font-bold">312ms @ 09:43</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Avg Slippage</span>
          <span className="text-[11px] text-white font-mono">0.004 THB</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Fill Rate</span>
          <span className="text-[11px] text-green-500 font-mono">99.95%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Orders Today</span>
          <span className="text-[11px] text-white font-mono font-bold">2,184</span>
        </div>
      </div>
    </div>
  );
}