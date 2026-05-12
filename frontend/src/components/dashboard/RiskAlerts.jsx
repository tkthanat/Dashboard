import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { mddDistributionData, monthlyPnlData } from '../../data/mockData';
import Card from '../common/Card';
import SectionTitle from '../common/SectionTitle';
import AlertListSkeleton from '../loading/AlertListSkeleton';
import ChartSkeleton from '../loading/ChartSkeleton';
import IncidentModal from './modalpopup/IncidentModal';

export default function RiskAlerts({ isLoading = false, onAlertUpdate, onNewAlert, onViewClient }) {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  
  const processedIds = useRef(new Set());
  const isInitialLoad = useRef(true);
  const callbacksRef = useRef({ onAlertUpdate, onNewAlert });

  useEffect(() => {
    callbacksRef.current = { onAlertUpdate, onNewAlert };
  }, [onAlertUpdate, onNewAlert]);

  const formatAlertData = (data) => {
    return data.map(item => {
      let icon, title, bg, border, buttons, textClass;
      if (item.type === 'critical') {
        icon = '🔴'; title = 'CRITICAL ALERT'; bg = 'bg-red-900/10'; border = 'border-l-red-500'; textClass = 'text-red-500';
        buttons = [{ label: 'FORCE CLOSE', style: 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' }];
      } else if (item.type === 'warning') {
        icon = '⚠️'; title = 'SYSTEM WARNING'; bg = 'bg-orange-900/10'; border = 'border-l-orange-500'; textClass = 'text-orange-500';
        buttons = [{ label: 'ACKNOWLEDGE', style: 'bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white' }];
      } else {
        icon = 'ℹ️'; title = 'INFORMATION'; bg = 'bg-blue-900/10'; border = 'border-l-blue-500'; textClass = 'text-blue-500';
        buttons = [{ label: 'DISMISS', style: 'bg-gray-500/20 text-gray-400 hover:bg-gray-500 hover:text-white' }];
      }
      return { ...item, icon, title, bg, border, buttons, textClass };
    });
  };

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:5000/ws/alerts');
    
    ws.onopen = () => console.log('✅ Connected to Risk Alerts WebSocket');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const incomingAlerts = formatAlertData(data);
        
        setAlerts(prevAlerts => {
          const newAlerts = incomingAlerts.filter(item => !processedIds.current.has(item.id));
          if (newAlerts.length === 0) return prevAlerts; 
          
          newAlerts.forEach(item => processedIds.current.add(item.id));
          if (!isInitialLoad.current && callbacksRef.current.onNewAlert) {
            newAlerts.forEach(alert => callbacksRef.current.onNewAlert(alert));
          }
          const combinedAlerts = [...newAlerts, ...prevAlerts];
          if (callbacksRef.current.onAlertUpdate) callbacksRef.current.onAlertUpdate(combinedAlerts.length);
          return combinedAlerts;
        });
        isInitialLoad.current = false;
      } catch (e) {
        console.error("Error parsing alerts WS", e);
      }
    };
    
    ws.onerror = (err) => { if (ws.readyState !== WebSocket.CLOSED) console.error("Risk Alerts WS Error:", err); };
    return () => { if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close(); };
  }, []);

  const handleAlertAction = (alertId, actionLabel, e) => {
    if (e) e.stopPropagation();
    console.log(`[Admin Action Executed] Command: ${actionLabel} | Alert ID: ${alertId}`);
    setAlerts(prevAlerts => {
      const remainingAlerts = prevAlerts.filter(alert => alert.id !== alertId);
      if (callbacksRef.current.onAlertUpdate) callbacksRef.current.onAlertUpdate(remainingAlerts.length);
      return remainingAlerts;
    });
    setSelectedAlert(null); 
  };

  // คำนวณจำนวน Alert แต่ละประเภท
  const alertCounts = useMemo(() => {
    return {
      ALL: alerts.length,
      CRITICAL: alerts.filter(a => a.type === 'critical').length,
      WARNING: alerts.filter(a => a.type === 'warning').length,
      INFO: alerts.filter(a => a.type === 'info').length
    };
  }, [alerts]);

  // กรอง Alert ตามที่เลือก
  const filteredAlerts = alerts.filter(alert => filterType === 'ALL' || alert.type.toUpperCase() === filterType);

  const CustomTooltipMDD = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121A28] border border-[#1E293B] p-2 rounded shadow-xl text-[10px] font-mono">
          <span className="text-gray-400">Clients: </span><span className="text-white font-bold">{payload[0].value}</span>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPNL = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isPositive = payload[0].value >= 0;
      return (
        <div className="bg-[#121A28] border border-[#1E293B] p-2 rounded shadow-xl text-[10px] font-mono">
          <p className="text-gray-400 mb-1">{label}</p>
          <p className={isPositive ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
            {isPositive ? '+' : ''}{payload[0].value.toLocaleString()} ฿
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-6 space-y-4 relative">
      <h2 className="text-[11px] font-bold text-gray-400 flex items-center gap-2 tracking-widest uppercase">
        <span className="text-orange-500">⚠️</span> RISK & ALERTS
        <span className="bg-red-900/40 text-red-500 border border-red-500/30 px-2 py-0.5 rounded-full text-[9px]">
          {isLoading && alerts.length === 0 ? '-' : alerts.length} ACTIVE
        </span>
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Alerts List */}
        <Card className="lg:col-span-2 h-[380px] flex flex-col" padding="p-0">
            {/* Header + Filter */}
            <div className="px-4 py-3 border-b border-[#1E293B]/50 bg-[#0F141E]/50 rounded-t-lg">
                <div className="flex justify-between items-center mb-3">
                    <SectionTitle title="Active Alerts Monitor" icon="🚨" className="mb-0" />
                    <span className="text-[9px] text-gray-500 font-mono">Pending Admin Action</span>
                </div>
                {/* Filter Pills */}
                <div className="flex gap-2">
                    {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(type => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold transition-colors border ${
                            filterType === type 
                              ? 'bg-[#1E293B] text-white border-[#475569]' 
                              : 'bg-transparent text-gray-500 border-[#1E293B] hover:text-gray-300'
                          }`}
                        >
                          {type}
                          <span className={`px-1.5 py-0.5 rounded-sm text-[9px] ${
                             filterType === type ? 'bg-[#0F141E] text-gray-300' : 'bg-[#1E293B]'
                          }`}>
                            {alertCounts[type]}
                          </span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#1E293B]">
                {isLoading && alerts.length === 0 ? (
                    <AlertListSkeleton count={4} />
                ) : filteredAlerts.length > 0 ? (
                    filteredAlerts.map(alert => (
                        <div 
                          key={alert.id} 
                          onClick={() => setSelectedAlert(alert)}
                          className={`${alert.bg} border border-[#1E293B] border-l-[3px] ${alert.border} rounded-lg p-3.5 flex justify-between items-start transition-all hover:border-[#475569] hover:bg-[#1E293B]/40 cursor-pointer shadow-sm`}
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px]">{alert.icon}</span>
                                    <span className="text-[11px] font-bold text-gray-200 tracking-wide">{alert.title}</span>
                                </div>
                                <div className="text-[11px] text-white ml-6 font-medium">{alert.message}</div>
                                {/* แสดง Description เพิ่มเติมแล้วตามที่ขอ */}
                                <div className="text-[10px] text-gray-400 ml-6 mt-0.5 line-clamp-1">{alert.desc}</div>
                                <div className="text-[9px] text-gray-500 ml-6 mt-1.5 flex items-center gap-1.5 font-mono">
                                    <span className="text-[8px]">⏰</span> {alert.time}
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4 shrink-0 items-center">
                                {alert.buttons.map((btn, idx) => (
                                    <button 
                                      key={idx} 
                                      onClick={(e) => handleAlertAction(alert.id, btn.label, e)}
                                      className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all active:scale-95 ${btn.style}`}
                                    >
                                      {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm font-bold flex-col gap-2 opacity-50">
                       NO ALERTS IN THIS CATEGORY.
                    </div>
                )}
            </div>
        </Card>
        
        {/* Sub Charts */}
        <div className="flex flex-col gap-4">
          <Card className="h-[182px] relative overflow-hidden" padding={isLoading ? "p-3" : "p-4"}>
            {isLoading ? <ChartSkeleton height="h-[80px]" /> : (
               <>
                 <SectionTitle title="MDD Distribution" icon="📈" />
                 <div className="flex-1 w-full -ml-4 z-10 h-full">
                   <ResponsiveContainer width="100%" height="80%">
                     <BarChart data={mddDistributionData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                       <XAxis type="number" hide />
                       <YAxis dataKey="range" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                       <Tooltip content={<CustomTooltipMDD />} cursor={{ fill: '#1E293B', opacity: 0.4 }} />
                       <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                         {mddDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </>
            )}
          </Card>
          
          <Card className="h-[182px] relative overflow-hidden" padding={isLoading ? "p-3" : "p-4"}>
            {isLoading ? <ChartSkeleton height="h-[80px]" /> : (
               <>
                 <SectionTitle title="Monthly PNL 2026" icon="📊" />
                 <div className="flex-1 w-full -ml-4 z-10 h-full">
                   <ResponsiveContainer width="100%" height="80%">
                     <BarChart data={monthlyPnlData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                       <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
                       <Tooltip content={<CustomTooltipPNL />} cursor={{ fill: '#1E293B', opacity: 0.4 }} />
                       <ReferenceLine y={0} stroke="#374151" />
                       <Bar dataKey="pnl" radius={[4, 4, 4, 4]} barSize={20}>
                         {monthlyPnlData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />)}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </>
            )}
          </Card>
        </div>
      </div>

      {/* Incident Modal */}
      <IncidentModal 
        alert={selectedAlert} 
        onClose={() => setSelectedAlert(null)} 
        onAction={handleAlertAction}
        onViewClient={onViewClient}
      />

    </div>
  );
}