import React, { useState, useEffect } from 'react';
import SettradePanel from './system-health/SettradePanel';
import OrderExecutionPanel from './system-health/OrderExecutionPanel';
import SystemResourcesPanel from './system-health/SystemResourcesPanel';
import ApiLatencyPanel from './system-health/ApiLatencyPanel';
import SystemResourceSkeleton from '../loading/SystemResourceSkeleton';
import ChartSkeleton from '../loading/ChartSkeleton';
import AlertListSkeleton from '../loading/AlertListSkeleton';

export default function SystemHealth() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/system-health');
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        if (result.status === 'success') {
          setHealthData(result.data);
        }
      } catch (error) {
        console.error("Error fetching system health:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
    const intervalId = setInterval(fetchHealth, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="mt-10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <h2 className="text-[13px] font-bold text-gray-300 tracking-widest uppercase">System Health</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-green-900/30 text-green-500 text-[10px] font-bold border border-green-800/50 tracking-wider">
            ALL SYSTEMS OK
          </span>
        </div>

        <div className="flex items-center gap-3 bg-[#121A28] border border-[#1E293B] px-3 py-1 rounded-full shadow-sm">
          <div className="flex items-center gap-2 border-r border-[#1E293B] pr-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Local Bot</span>
          </div>
          <span className="text-[9px] text-gray-500 font-mono">Ping: <span className="text-white font-bold">12ms</span></span>
        </div>
      </div>

      {loading && !healthData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SystemResourceSkeleton />
            <SystemResourceSkeleton />
            <SystemResourceSkeleton />
          </div>
          <ChartSkeleton height="h-48" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SettradePanel data={healthData?.settrade} />
            <OrderExecutionPanel /> 
            <SystemResourcesPanel data={healthData?.server} />
          </div>
          <ApiLatencyPanel />
        </>
      )}
    </div>
  );
}