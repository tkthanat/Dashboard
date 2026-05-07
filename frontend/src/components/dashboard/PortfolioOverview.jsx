import React, { useMemo } from 'react';
import Card from '../common/Card';
import { gridZoneData } from '../../data/mockData';
import KpiCardSkeleton from '../loading/KpiCardSkeleton';
import ChartSkeleton from '../loading/ChartSkeleton';

export default function PortfolioOverview({ portfolios = [], usdMarket = null }) {
  const isLoading = !portfolios || portfolios.length === 0;

  const stats = useMemo(() => {
    if (isLoading) return {};

    const total = portfolios.length;
    const critical = portfolios.filter(p => p.status === 'Critical').length;
    const caution = portfolios.filter(p => p.status === 'Caution').length;
    const ok = total - critical - caution;
    
    const aum = portfolios.reduce((sum, p) => sum + (parseFloat(p.equity) || 0), 0);
    const pnl = portfolios.reduce((sum, p) => sum + (parseFloat(p.realized_pnl) || 0), 0);
    const lots = portfolios.reduce((sum, p) => sum + (parseInt(p.open_vol) || 0), 0);
    const worstClient = [...portfolios].sort((a, b) => (a.mdd || 0) - (b.mdd || 0))[0];

    return { total, critical, caution, ok, aum, pnl, lots, worstClient };
  }, [portfolios, isLoading]);

  const currentPrice = usdMarket?.history?.length > 0 
    ? usdMarket.history[usdMarket.history.length - 1].value 
    : '32.44';

  const formatM = (num) => (num / 1000000).toFixed(2) + 'M';

  return (
    <div className="mb-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
         <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">📊 PORTFOLIO OVERVIEW</span>
            <span className="bg-green-900/30 text-green-500 border border-green-500/30 px-2 py-0.5 rounded text-[9px] font-bold">LIVE DATA</span>
         </div>
         <div className="text-[10px] text-gray-500 font-medium">
            USD/THB: <span className="text-orange-400 font-bold">{currentPrice}</span> | Grid Zone: 28.00 - 33.00
         </div>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <KpiCardSkeleton key={i} />)}
          </div>
          <ChartSkeleton height="h-[60px]" />
        </>
      ) : (
        <>
          {/* KPI Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card padding="p-3.5" className="shadow-sm">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Active Clients</h3>
              <div className="text-2xl font-bold text-white leading-none mb-1.5">{stats.total || 41}</div>
              <p className="text-[9px] font-medium text-gray-500">
                <span className={stats.critical > 0 ? "text-red-500" : ""}>{stats.critical || 0} Critical</span> - <span>{stats.caution || 3} Caution</span>
              </p>
            </Card>

            <Card padding="p-3.5" className="border-t-2 border-t-green-500 shadow-sm">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Total AUM</h3>
              <div className="text-2xl font-bold text-white leading-none mb-1.5 font-mono">฿{stats.aum ? formatM(stats.aum) : '11.68M'}</div>
              <p className="text-[9px] font-medium text-green-500">Equity in Management</p>
            </Card>

            <Card padding="p-3.5" className="shadow-sm">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Today's PNL (ALL)</h3>
              <div className={`text-2xl font-bold leading-none mb-1.5 font-mono ${stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.pnl >= 0 ? '+' : ''}{stats.pnl ? stats.pnl.toLocaleString() : '0'}
              </div>
              <p className="text-[9px] font-medium text-gray-500">฿{(stats.pnl / (stats.total || 1)).toFixed(0)} Avg / Client</p>
            </Card>

            <Card padding="p-3.5" className="border-t-2 border-t-blue-500 shadow-sm">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Total Open Lots</h3>
              <div className="text-2xl font-bold text-white leading-none mb-1.5 font-mono">{stats.lots || 2114}</div>
              <p className="text-[9px] font-medium text-gray-500">{(stats.lots / (stats.total || 1)).toFixed(1)} Avg / Client</p>
            </Card>

            <Card padding="p-3.5" className="border-t-2 border-t-orange-500 shadow-sm">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Margin Health</h3>
              <div className="text-2xl font-bold text-orange-500 leading-none mb-1.5">{stats.caution || 3} Caution</div>
              <p className="text-[9px] font-medium text-gray-500">{stats.ok || 38} Clients are Healthy</p>
            </Card>

            <Card padding="p-3.5" className="border-t-2 border-t-red-500 shadow-sm">
              <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Worst MDD</h3>
              <div className="text-2xl font-bold text-red-500 leading-none mb-1.5 font-mono">{stats.worstClient?.mdd || '0.00'}%</div>
              <p className="text-[9px] font-medium text-gray-500">{stats.worstClient?.name || '---'}</p>
            </Card>
          </div>

          {/* Grid Zone Heatmap */}
          <Card padding="p-4" className="shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">ZONE DENSITY PROFILE — USD/THB 28.00 → 33.00</span>
              <div className="flex gap-4 items-center text-[9px] font-bold text-gray-400">
                 <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#10B981] rounded-sm"></span> TP'd</div>
                 <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#3B82F6] rounded-sm"></span> Partial</div>
                 <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#EF4444] rounded-sm"></span> Deep Long</div>
                 <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#F59E0B] rounded-sm shadow-[0_0_4px_#F59E0B]"></span> Current @{currentPrice}</div>
              </div>
            </div>
            
            <div className="relative w-full h-[60px] flex items-end gap-1 border-b border-[#1E293B] pb-1">
              {gridZoneData.map((zone, idx) => {
                  if (idx % 2 !== 0) return null; 
                  
                  let bgColor = 'bg-[#1E293B] hover:bg-gray-600'; 
                  if (zone.status === 'tpd') bgColor = 'bg-[#10B981] hover:bg-[#059669]';
                  if (zone.status === 'partial') bgColor = 'bg-[#3B82F6] hover:bg-[#2563EB]';
                  if (zone.status === 'full') bgColor = 'bg-[#EF4444] hover:bg-[#DC2626]';
                  if (zone.status === 'current') bgColor = 'bg-[#F59E0B] hover:bg-[#D97706] shadow-[0_0_8px_rgba(245,158,11,0.6)]';

                  const heightPercent = zone.count > 0 ? Math.max((zone.count / 50) * 100, 10) : 5;

                  return (
                    <div key={idx} className="flex-1 h-full flex items-end relative group cursor-pointer">
                       <div className={`w-full rounded-t-sm transition-all duration-300 ${bgColor}`} style={{ height: `${heightPercent}%` }}></div>
                       
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50">
                          <div className="bg-[#121A28] border border-[#1E293B] text-white text-[10px] px-3 py-2 rounded shadow-xl min-w-[120px] text-center">
                              <div className="text-gray-400 mb-1 border-b border-[#1E293B] pb-1">Price Zone</div>
                              <div className="font-mono text-orange-400 text-[11px] mb-1">{zone.price} - {(parseFloat(zone.price) + 0.19).toFixed(2)}</div>
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-gray-400">Clients:</span> 
                                <span className="font-bold text-white">{zone.count * 2} Accounts</span>
                              </div>
                          </div>
                          <div className="w-2 h-2 bg-[#121A28] border-b border-r border-[#1E293B] transform rotate-45 -mt-1.5"></div>
                       </div>
                    </div>
                  )
              })}
            </div>
            
            <div className="flex justify-between mt-1.5 text-[9px] text-gray-500 font-mono px-1">
              <span>28.00</span><span>29.00</span><span>30.00</span><span>31.00</span><span>32.00</span><span>33.00</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}