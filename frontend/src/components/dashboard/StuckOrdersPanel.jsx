import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import SectionTitle from '../common/SectionTitle';

export default function StuckOrdersPanel({ orders = [], onNotify }) {
  const [realtimeOrders, setRealtimeOrders] = useState(orders);
  const [filter, setFilter] = useState('ALL');

  const [loadingActionId, setLoadingActionId] = useState(null);
  const [isPanicLoading, setIsPanicLoading] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:5000/ws/stuck_orders');
    ws.onopen = () => console.log('✅ Connected to Stuck Orders WebSocket');
    ws.onmessage = (event) => {
      try {
        if (!loadingActionId && !isPanicLoading) {
            setRealtimeOrders(JSON.parse(event.data));
        }
      } catch (e) {
        console.error("Error parsing stuck orders WS", e);
      }
    };
    ws.onerror = (err) => {
      if (ws.readyState !== WebSocket.CLOSED) console.error("Stuck Orders WS Error:", err);
    };
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
    };
  }, [loadingActionId, isPanicLoading]);

  const handleAction = async (orderId, actionType) => {
    setLoadingActionId(orderId);
    
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/orders/${encodeURIComponent(orderId)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: actionType })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setRealtimeOrders(prev => prev.filter(o => o.id !== orderId));
        if (onNotify) {
          onNotify({
            type: 'info', 
            title: `ACTION SUCCESS: ${actionType}`,
            desc: data.message, 
            time: new Date().toLocaleTimeString('th-TH'),
            icon: '✅', 
            border: 'border-l-green-500', 
            bg: 'bg-[#0F141E]'
          });
        }
      }
    } catch (error) {
      console.error("Action Error:", error);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handlePanicCancel = async () => {
    setIsPanicLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/orders/panic`, { method: 'POST' });
      const data = await res.json();
      
      if (data.status === 'success') {
        setRealtimeOrders(prev => prev.filter(o => o.status !== 'STUCK'));
        if (onNotify) {
          onNotify({
            type: 'critical', 
            title: 'PANIC RESOLVED',
            desc: data.message, 
            time: new Date().toLocaleTimeString('th-TH'),
            icon: '🚨', 
            border: 'border-l-red-500', 
            bg: 'bg-[#0F141E]'
          });
        }
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsPanicLoading(false); 
    }
  };

  const filteredOrders = realtimeOrders.filter(o => filter === 'ALL' || o.status === filter);
  
  const counts = {
    ALL: realtimeOrders.length,
    STUCK: realtimeOrders.filter(o => o.status === 'STUCK').length,
    PENDING: realtimeOrders.filter(o => o.status === 'PENDING').length,
    RETRYING: realtimeOrders.filter(o => o.status === 'RETRYING').length,
  };

  return (
    <Card padding="p-0" className="mt-8 overflow-hidden border border-[#1E293B] flex flex-col h-[390px]">
      
      <div className="shrink-0 px-4 py-3 border-b border-[#1E293B] bg-[#0F141E]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <SectionTitle icon="⚡" title="Stuck / Pending Orders" subtitle="— Real-time Execution Log" className="mb-0" />
        
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="flex bg-[#121A28] border border-[#1E293B] rounded-lg p-1">
            {['ALL', 'STUCK', 'PENDING', 'RETRYING'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filter === type ? 'bg-[#1E293B] text-white shadow' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {type}
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${filter === type ? 'bg-[#0F141E] text-gray-300' : 'bg-[#1E293B]'}`}>
                  {counts[type]}
                </span>
              </button>
            ))}
          </div>

          <button 
            onClick={handlePanicCancel}
            disabled={isPanicLoading || counts.STUCK === 0}
            className={`w-[170px] py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isPanicLoading 
                ? 'bg-red-900/10 text-red-700 border border-red-900/30 cursor-not-allowed' 
                : counts.STUCK > 0
                  ? 'bg-red-900/30 text-red-500 border border-red-500/50 hover:bg-red-900/50 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'bg-transparent text-[#1E293B] border border-[#1E293B]/50 cursor-not-allowed'
            }`}
          >
            {isPanicLoading ? (
               <><span className="w-3 h-3 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></span> CLEARING...</>
            ) : (
               <>🚨 CANCEL ALL STUCK</>
            )}
          </button>
        </div>
      </div>

      {/* บังคับโชว์ Scrollbar แนวตั้งเสมอด้วย overflow-y-scroll */}
      <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-[#1E293B] bg-[#0A0E17]/50">
        
        {/* ใส่ table-fixed เพื่อไม่ให้คอลัมน์ยืดหดตามเนื้อหาด้านใน */}
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap table-fixed">
          <thead className="bg-[#121A28]/95 text-gray-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm shadow-sm border-b border-[#1E293B]">
            <tr>
              {/* ล็อกความกว้างของแต่ละคอลัมน์เป็นเปอเซนต์ */}
              <th className="w-[11%] px-4 py-3.5 font-bold">ORDER ID</th>
              <th className="w-[11%] px-4 py-3.5 font-bold">ACCOUNT</th>
              <th className="w-[8%] px-4 py-3.5 font-bold text-center">SIDE</th>
              <th className="w-[10%] px-4 py-3.5 font-bold text-right">PRICE</th>
              <th className="w-[8%] px-4 py-3.5 font-bold text-right">QTY</th>
              <th className="w-[8%] px-4 py-3.5 font-bold text-center">ZONE</th>
              <th className="w-[8%] px-4 py-3.5 font-bold text-center">AGE</th>
              <th className="w-[12%] px-4 py-3.5 font-bold text-center">STATUS</th>
              <th className="w-[24%] px-4 py-3.5 font-bold text-right pr-6">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/50 font-mono">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const isRowLoading = loadingActionId === order.id;

                return (
                  <tr key={order.id} className={`transition-colors ${isRowLoading ? 'bg-[#1E293B]/20' : 'hover:bg-blue-500/5'}`}>
                    <td className="px-4 py-3 text-gray-300 font-bold overflow-hidden text-ellipsis">{order.id}</td>
                    <td className="px-4 py-3 text-gray-400 overflow-hidden text-ellipsis">{order.account}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-sm font-bold text-[10px] ${order.side === 'LONG' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>{order.side}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {Number(order.price || 0).toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">{order.qty}</td>
                    <td className="px-4 py-3 text-center text-blue-400">{order.zone}</td>
                    <td className="px-4 py-3 text-center text-gray-300">{order.age}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        order.status === 'STUCK' ? 'bg-red-900/20 text-red-500 border-red-500/30' : 
                        order.status === 'RETRYING' ? 'bg-orange-900/20 text-orange-400 border-orange-500/30' :
                        'bg-green-900/20 text-green-500 border-green-500/30'
                      }`}>{order.status}</span>
                    </td>
                    
                    <td className="px-4 py-3 text-right">
                      {isRowLoading ? (
                        <div className="flex items-center justify-end h-[28px] pr-8 text-gray-400 gap-2">
                            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                            <span className="text-[10px] font-sans">Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 font-sans">
                          <button 
                            onClick={() => handleAction(order.id, 'CANCEL')}
                            className="w-[75px] py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 bg-transparent border border-[#1E293B] text-gray-400 hover:border-red-500 hover:text-red-500 transition-colors"
                          >
                            ✖️ Cancel
                          </button>
                          {order.status === 'STUCK' && (
                            <>
                              <button 
                                onClick={() => handleAction(order.id, 'FORCE_MARKET')}
                                className="w-[80px] py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-colors"
                              >
                                ⚡ Market
                              </button>
                              <button 
                                onClick={() => handleAction(order.id, 'RETRY')}
                                className="w-[75px] py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600 hover:text-white transition-colors"
                              >
                                🔄 Retry
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="h-[280px] text-center text-gray-500 italic text-sm">
                  ALL CLEAR. No {filter !== 'ALL' ? filter : ''} orders detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}