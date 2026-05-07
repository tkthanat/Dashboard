import React from 'react';

export default function SettradePanel({ data }) {
  if (!data) return null;

  return (
    <div className="bg-[#121A28] border border-[#1E293B] rounded-lg p-5 flex flex-col h-full">
      <div className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
        <span className="text-blue-500">🌐</span> SETTRADE OPEN API
      </div>
      <div className="flex flex-col justify-between flex-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Status</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1.5 ${data.status === 'Connected' ? 'bg-green-900/30 text-green-500 border-green-800/50' : 'bg-red-900/30 text-red-500 border-red-800/50'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span> 
            LIVE
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">WS Ping</span>
          <span className="text-[11px] text-green-500 font-mono font-bold">7 ms</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Last Message</span>
          <span className="text-[11px] text-gray-300 font-mono">&lt;1s</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Uptime 24h</span>
          <span className="text-[11px] text-white font-mono">99.97%</span>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-gray-500">Rate Limit</span>
            <span className="text-[11px] text-orange-400 font-mono font-bold">236/300 req/min</span>
          </div>
          <div className="w-full bg-[#0F141E] rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-orange-500" style={{ width: '78%' }}></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Reconnects</span>
          <span className="text-[11px] text-white font-mono font-bold">0</span>
        </div>
      </div>
    </div>
  );
}