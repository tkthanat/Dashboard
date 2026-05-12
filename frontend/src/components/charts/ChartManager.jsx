import { useState, useEffect, useMemo } from 'react';
import CashFlowChart from './CashFlowChart';
import UsdMarketChart from './UsdMarketChart';

// Date Formatter
const formatTime = (timeVal) => {
  if (!timeVal) return null;
  let d;
  if (typeof timeVal === 'string') {
    if (timeVal.match(/^\d{4}-\d{2}-\d{2}$/)) return timeVal;
    d = new Date(timeVal);
  } else {
    d = new Date(timeVal > 1e10 ? timeVal : timeVal * 1000);
  }
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Date Parser
const parseDateString = (ds) => {
    const [y, m, d] = ds.split('-');
    return new Date(y, m - 1, d).getTime();
};

export default function ChartManager({ portfolios = [], usdMarket = null }) {
  const [cashFlowChart, setCashFlowChart] = useState(null);
  const [usdChart, setUsdChart] = useState(null);
  
  // State สำหรับเก็บค่า Filter ของ Dropdown
  const [selectedClient, setSelectedClient] = useState('ALL');

  // Unified Timeline Synchronization
  const unifiedDates = useMemo(() => {
    if (!usdMarket?.history) return [];
    const dates = new Set();
    
    usdMarket.history.forEach(item => {
        const ft = formatTime(item.time);
        if (ft) dates.add(ft);
    });
    
    portfolios.forEach(p => {
        if (p.history) {
            p.history.forEach(h => {
                const ft = formatTime(h.time);
                if (ft) dates.add(ft);
            });
        }
    });
    
    return Array.from(dates).sort((a, b) => parseDateString(a) - parseDateString(b));
  }, [portfolios, usdMarket]);

  // Chart Panning Synchronization
  useEffect(() => {
    if (!cashFlowChart || !usdChart) return;
    let isSyncingLeft = false;
    let isSyncingRight = false;

    const handleCashFlowPan = (range) => {
      if (range && !isSyncingLeft) {
        isSyncingRight = true;
        usdChart.timeScale().setVisibleLogicalRange(range);
        setTimeout(() => { isSyncingRight = false; }, 50);
      }
    };

    const handleUsdPan = (range) => {
      if (range && !isSyncingRight) {
        isSyncingLeft = true;
        cashFlowChart.timeScale().setVisibleLogicalRange(range);
        setTimeout(() => { isSyncingLeft = false; }, 50);
      }
    };

    cashFlowChart.timeScale().subscribeVisibleLogicalRangeChange(handleCashFlowPan);
    usdChart.timeScale().subscribeVisibleLogicalRangeChange(handleUsdPan);

    return () => {
      cashFlowChart.timeScale().unsubscribeVisibleLogicalRangeChange(handleCashFlowPan);
      usdChart.timeScale().unsubscribeVisibleLogicalRangeChange(handleUsdPan);
    };
  }, [cashFlowChart, usdChart]);

  // Loading State
  if (!portfolios.length || !usdMarket) {
    return (
      <div className="bg-[#121A28] border border-[#1E293B] rounded h-[500px] flex items-center justify-center">
        <span className="text-gray-500 animate-pulse text-sm">Fetching Live Data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
            <span className="text-blue-500">🔗</span> CORRELATED MARKET PANES
          </span>
          <span className="bg-blue-900/30 text-blue-500 border border-blue-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
            X-AXIS LINKED
          </span>
          <span className="bg-green-900/30 text-green-500 border border-green-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
            MOCK DATA
          </span>
        </div>

        {/* Dropdown Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Client Filter:</span>
          <select 
            value={selectedClient} 
            onChange={(e) => setSelectedClient(e.target.value)}
            className="bg-[#0F141E] border border-[#1E293B] text-gray-300 text-[10px] rounded px-2 py-1 outline-none cursor-pointer focus:border-blue-500 transition-colors"
          >
            <option value="ALL">ALL PORTS</option>
            {portfolios.map((p, idx) => (
              <option key={idx} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts */}
      <CashFlowChart portfolios={portfolios} unifiedDates={unifiedDates} selectedClient={selectedClient} onChartReady={setCashFlowChart} />
      <UsdMarketChart usdMarket={usdMarket} unifiedDates={unifiedDates} onChartReady={setUsdChart} />
    </div>
  );
}