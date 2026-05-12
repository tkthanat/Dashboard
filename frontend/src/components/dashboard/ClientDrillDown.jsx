import React, { useMemo, useState } from 'react';
import { drillDownMockData } from '../../data/mockData';
import Card from '../common/Card';
import SectionTitle from '../common/SectionTitle';
import ClientEquityChart from '../charts/ClientEquityChart';
import KpiCardSkeleton from '../loading/KpiCardSkeleton';
import ChartSkeleton from '../loading/ChartSkeleton';
import TableSkeleton from '../loading/TableSkeleton';

export default function ClientDrillDown({ client, onClose, isLoading = false }) {
  // default state
  const [timeRange, setTimeRange] = useState('ALL');

  const stats = useMemo(() => {
    if (!client || !client.history || client.history.length === 0) return null;
    const history = [...client.history].sort((a, b) => new Date(a.date) - new Date(b.date));
    let peak = -Infinity, maxMDD = 0, currentTrough = Infinity, peakDate = null, troughDate = null;

    history.forEach((h) => {
      const eq = parseFloat(h.equity || 0);
      if (eq > peak) { peak = eq; peakDate = h.date; currentTrough = eq; }
      const dd = peak > 0 ? ((eq - peak) / peak) * 100 : 0;
      if (dd < maxMDD) maxMDD = dd;
      if (eq < currentTrough) { currentTrough = eq; troughDate = h.date; }
    });

    const now = new Date();
    const mtdPnl = history.reduce((sum, h) => {
      const d = new Date(h.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        return sum + (parseFloat(h.cash_flow || 0));
      }
      return sum;
    }, 0);

    return { peak, maxMDD, peakDate, trough: currentTrough, troughDate, mtdPnl };
  }, [client]);

  // empty state
  if (!client && !isLoading) {
    return (
      <div className="mt-6 p-10 border border-dashed border-[#1E293B] rounded-lg text-center text-gray-600 text-xs italic bg-[#0B1120]">
        กรุณาเลือกบัญชีลูกค้าจากตารางด้านบน เพื่อดูรายละเอียดพอร์ตเชิงลึก
      </div>
    );
  }

  // loading state
  if (isLoading) {
    return (
      <div className="mt-8 space-y-6 pb-10">
        <div className="h-6 w-48 bg-[#1E293B] rounded mb-4 animate-pulse"></div>
        <div className="h-16 w-full bg-[#1E293B] rounded-lg mb-4 animate-pulse"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {[1,2,3,4,5,6,7].map(i => <KpiCardSkeleton key={i} />)}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <ChartSkeleton height="h-[250px]" />
           <ChartSkeleton height="h-[250px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
           <TableSkeleton rowCount={6} />
           <TableSkeleton rowCount={6} />
        </div>
      </div>
    );
  }

  const eePercentage = client.equity > 0 ? ((client.ee / client.equity) * 100).toFixed(1) : 0;

  return (
    <div className="mt-8 space-y-6 animate-fade-in pb-10">
      
      {/* header */}
      <div className="flex items-center gap-3 mb-2 px-1">
        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">CLIENT DRILL-DOWN</span>
        <span className="px-2 py-0.5 rounded-full border border-red-900/50 bg-red-900/20 text-red-500 text-[9px] font-bold tracking-widest uppercase">
          {client.account_no} — {client.status === 'Critical' ? 'HIGH RISK' : 'NORMAL'}
        </span>
      </div>

      {/* client info */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {client.account_no?.slice(-2) || '12'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              {client.name || 'สมชาย วงศ์ทอง'}
              <span className={`text-[9px] border px-2 py-0.5 rounded-full tracking-widest uppercase font-bold flex items-center gap-1 ${client.status === 'Critical' ? 'bg-red-900/40 text-red-500 border-red-500/50' : 'bg-green-900/40 text-green-500 border-green-500/50'}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${client.status === 'Critical' ? 'bg-red-500' : 'bg-green-500'}`}></span> {client.status}
              </span>
            </h2>
            <div className="text-[10px] text-gray-500 mt-1.5 font-mono flex items-center gap-2">
              <span>{client.account_no} - Broker: KGSEC - เปิดบัญชี 15 ม.ค. 2568 - Deployed ฿200,000 - Reserve ฿1,000,000</span>
            </div>
          </div>
        </div>
        {onClose && (
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors bg-[#121A28] p-2 rounded-lg border border-[#1E293B]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        )}
      </div>

      {/* kpi matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
        {[
          { label: 'EQUITY', value: `฿${client.equity.toLocaleString()}`, color: 'text-white' },
          { label: 'EE', value: `฿${client.ee.toLocaleString()}`, color: 'text-red-500' },
          { label: 'EE%', value: `${eePercentage}%`, color: 'text-red-400' },
          { label: 'OPEN LOTS', value: `${client.open_vol}`, color: 'text-white' },
          { label: 'TODAY PNL', value: drillDownMockData.kpi.todayPnl, color: 'text-green-500' },
          { label: 'MTD PNL', value: drillDownMockData.kpi.mtdPnl, color: 'text-green-500' },
          { label: 'MDD', value: drillDownMockData.kpi.mdd, color: 'text-red-500' }
        ].map((item, i) => (
          <Card key={i} padding="p-4" className="shadow-sm justify-center">
            <div className="text-[9px] font-bold text-gray-500 mb-1.5 tracking-widest uppercase">{item.label}</div>
            <div className={`text-base md:text-lg font-bold font-mono ${item.color}`}>{item.value}</div>
          </Card>
        ))}
      </div>

      {/* historical analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="p-5" className="flex flex-col">
          <SectionTitle 
            icon={<span className="text-pink-500">📈</span>}
            title="Equity Curve" 
            subtitle={`— ${timeRange}`}
            rightElement={
              <div className="flex gap-1 bg-[#0F141E] p-1 rounded-lg border border-[#1E293B]">
                {/* update filter array */}
                {['1D', '3D', '7D', '15D', '1M', '3M', '6M', 'ALL'].map(r => (
                  <button 
                    key={r} 
                    onClick={() => setTimeRange(r)} 
                    className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${timeRange === r ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            }
          />
          <div className="flex-1 min-h-[200px] mb-4 mt-2">
             <ClientEquityChart historyData={client.history} timeRange={timeRange} />
          </div>
          <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-2.5 flex items-center gap-2 text-[10px] mt-auto">
             <span className="text-red-500 font-bold shrink-0">📌 MDD: {drillDownMockData.mddAnalysis.date}</span>
             <span className="text-gray-400 truncate">· Peak <span className="text-white font-mono">{drillDownMockData.mddAnalysis.peak}</span> · Trough <span className="text-red-400 font-mono">{drillDownMockData.mddAnalysis.trough}</span> · Drawdown <span className="text-red-500 font-mono">{drillDownMockData.mddAnalysis.drawdown}</span> - <span className="text-orange-400">ยังไม่ฟื้นตัว</span></span>
          </div>
        </Card>

        <Card padding="p-5" className="text-[11px] h-full">
          <SectionTitle icon={<span className="text-blue-400">📊</span>} title="MDD Analysis" className="mb-4" />
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-white font-bold">Current MDD <span className="text-red-500">{drillDownMockData.kpi.mdd}</span></span>
                <span className="text-gray-500">Limit: 10%</span>
              </div>
              <div className="w-full h-2 bg-[#0F141E] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: '92%' }}></div>
              </div>
              <div className="text-[9px] text-orange-400 mt-1">⚠️ เหลืออีก 0.8% ถึง forced close</div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-white font-bold">Historical Max MDD</span>
                <span className="text-red-500">-11.2%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0F141E] rounded-full overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: '100%' }}></div>
              </div>
              <div className="text-[9px] text-gray-500 mt-1">ช่วง 2568 — สิ้น ส.ค. 2568</div>
            </div>

            <div className="space-y-2.5 pt-4">
               {[
                 { label: 'Peak Equity', value: drillDownMockData.mddAnalysis.peak, color: 'text-white' },
                 { label: 'Trough', value: drillDownMockData.mddAnalysis.trough, color: 'text-red-400' },
                 { label: 'Drawdown', value: drillDownMockData.mddAnalysis.drawdown.split(' ')[0], color: 'text-red-500' }, 
                 { label: 'Duration', value: drillDownMockData.mddAnalysis.duration, color: 'text-white' },
                 { label: 'Recovery', value: drillDownMockData.mddAnalysis.recovery, color: 'text-orange-400' },
                 { label: 'EE to Margin Call', value: drillDownMockData.mddAnalysis.eeToMarginCall, color: 'text-red-400' }
               ].map((row, i) => (
                 <div key={i} className="flex justify-between items-center border-b border-[#1E293B]/50 pb-1.5">
                   <span className="text-gray-500">{row.label}</span>
                   <span className={`font-mono font-bold ${row.color}`}>{row.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </Card>
      </div>

      {/* data tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
        <Card padding="p-5" className="flex flex-col">
          <SectionTitle icon={<span className="text-gray-300">📄</span>} title="Open Positions" subtitle="(310 Lots - 31 Zones)" />
          <div className="flex-1 overflow-auto border border-[#1E293B] rounded-lg bg-[#0F141E]">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-[#1E293B]/40 sticky top-0 backdrop-blur-md">
                <tr className="text-gray-500 uppercase tracking-widest">
                  <th className="p-3 font-bold">ZONE</th>
                  <th className="p-3 font-bold">ENTRY ฿</th>
                  <th className="p-3 font-bold text-right">LOTS</th>
                  <th className="p-3 font-bold text-right">TP'D</th>
                  <th className="p-3 font-bold text-right">UNREALIZED PNL</th>
                  <th className="p-3 font-bold text-center">DEPTH</th>
                </tr>
              </thead>
              <tbody>
                 {drillDownMockData.openPositions.map((pos) => (
                   <tr key={pos.id} className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/20 transition-colors">
                      <td className="p-3 text-white font-mono">{pos.zone}</td>
                      <td className="p-3 text-white font-mono">{pos.entry}</td>
                      <td className="p-3 text-right text-gray-300 font-mono">{pos.lots}</td>
                      <td className="p-3 text-right text-gray-500 font-mono">{pos.tpd}</td>
                      <td className="p-3 text-right font-mono font-bold text-green-500">{pos.unrealized}</td>
                      <td className="p-3 text-center">
                         <div className="w-16 h-1.5 bg-[#1E293B] rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: pos.depthWidth }}></div>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padding="p-5" className="flex flex-col">
          <SectionTitle icon={<span className="text-yellow-500">💰</span>} title="Realized PNL History" subtitle="— 30 วัน" />
          <div className="flex-1 overflow-auto border border-[#1E293B] rounded-lg bg-[#0F141E] flex flex-col">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-[#1E293B]/40 sticky top-0 backdrop-blur-md">
                <tr className="text-gray-500 uppercase tracking-widest">
                  <th className="p-3 font-bold">วันที่</th>
                  <th className="p-3 font-bold text-right">PNL (฿)</th>
                  <th className="p-3 font-bold text-right">CONTRACTS</th>
                  <th className="p-3 font-bold text-right">TRADES</th>
                  <th className="p-3 font-bold text-right">USDTHB</th>
                </tr>
              </thead>
              <tbody>
                 {drillDownMockData.realizedHistory.map((history) => (
                   <tr key={history.id} className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/20">
                      <td className="p-3 text-gray-400">{history.date}</td>
                      <td className="p-3 text-right font-mono font-bold text-green-500">{history.pnl}</td>
                      <td className="p-3 text-right text-gray-400 font-mono">{history.contracts}</td>
                      <td className="p-3 text-right text-gray-400 font-mono">{history.trades}</td>
                      <td className="p-3 text-right text-gray-500 font-mono">{history.usdthb}</td>
                   </tr>
                 ))}
              </tbody>
            </table>
            
            <div className="mt-auto border-t border-[#1E293B] bg-[#121A28]/80 p-2 flex justify-around text-[10px] font-mono shrink-0">
               <span className="text-gray-400">WIN RATE: <span className="text-green-500 font-bold">{drillDownMockData.stats.winRate}</span></span>
               <span className="text-gray-400">PROFIT FACTOR: <span className="text-blue-400 font-bold">{drillDownMockData.stats.profitFactor}</span></span>
               <span className="text-gray-400">TOTAL TRADES: <span className="text-white font-bold">{drillDownMockData.stats.totalTrades}</span></span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}