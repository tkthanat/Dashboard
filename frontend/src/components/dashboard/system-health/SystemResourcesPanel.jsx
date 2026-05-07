import React from 'react';

export default function SystemResourcesPanel({ data }) {
  if (!data) return null;

  const getProgressColor = (percent) => {
    if (percent < 60) return 'bg-green-500';
    if (percent < 85) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-[#121A28] border border-[#1E293B] rounded-lg p-5 flex flex-col h-full">
      <div className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
        <span className="text-gray-400">🖥️</span> SYSTEM RESOURCES
      </div>
      <div className="flex flex-col justify-between flex-1">
        <div className="mb-1">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-gray-500">CPU</span>
            <span className="text-white font-mono">{data.cpu}%</span>
          </div>
          <div className="w-full bg-[#0F141E] rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${getProgressColor(data.cpu)} transition-all duration-500`} style={{ width: `${data.cpu}%` }}></div>
          </div>
        </div>
        <div className="mb-1">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-gray-500">RAM</span>
            <span className="text-white font-mono">{data.ram}%</span>
          </div>
          <div className="w-full bg-[#0F141E] rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${getProgressColor(data.ram)} transition-all duration-500`} style={{ width: `${data.ram}%` }}></div>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-gray-500">Disk</span>
            <span className="text-white font-mono">{data.disk}%</span>
          </div>
          <div className="w-full bg-[#0F141E] rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${getProgressColor(data.disk)}`} style={{ width: `${data.disk}%` }}></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-[11px] text-gray-500">DB Connections</span>
          <span className="text-[11px] text-white font-mono">22/100</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">Redis</span>
          <span className="px-2 py-0.5 rounded-full bg-green-900/30 text-green-500 border border-green-800/50 text-[9px] font-bold">OK</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">TimescaleDB</span>
          <span className="px-2 py-0.5 rounded-full bg-green-900/30 text-green-500 border border-green-800/50 text-[9px] font-bold">OK</span>
        </div>
      </div>
    </div>
  );
}