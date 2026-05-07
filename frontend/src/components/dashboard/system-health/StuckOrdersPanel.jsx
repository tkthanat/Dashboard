import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import SectionTitle from '../../common/SectionTitle';

export default function StuckOrdersPanel({ orders = [] }) {
  const [realtimeOrders, setRealtimeOrders] = useState(orders);

  // เชื่อมต่อ WebSocket
  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:5000/ws/stuck_orders');
    
    ws.onopen = () => console.log('✅ Connected to Stuck Orders WebSocket');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setRealtimeOrders(data);
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
  }, []);

  return (
    <Card padding="p-0" className="mt-4 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1E293B] bg-[#0F141E]/50">
        <SectionTitle icon="⚡" title="Stuck / Pending Orders" subtitle="— Real-time Execution Log" className="mb-0" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px] border-collapse">
          <thead className="bg-[#1E293B]/30 text-gray-500 uppercase tracking-widest">
            <tr>
              <th className="p-3 font-bold">ORDER ID</th>
              <th className="p-3 font-bold">ACCOUNT</th>
              <th className="p-3 font-bold text-center">SIDE</th>
              <th className="p-3 font-bold text-right">PRICE</th>
              <th className="p-3 font-bold text-right">QTY</th>
              <th className="p-3 font-bold text-center">ZONE</th>
              <th className="p-3 font-bold text-center">SENT AT</th>
              <th className="p-3 font-bold text-center">AGE</th>
              <th className="p-3 font-bold text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/50 font-mono">
            {realtimeOrders.length > 0 ? realtimeOrders.map((order) => (
              <tr key={order.id} className="hover:bg-blue-500/5 transition-colors">
                <td className="p-3 text-gray-300 font-bold">{order.id}</td>
                <td className="p-3 text-gray-400">{order.account}</td>
                <td className="p-3 text-center">
                  <span className={`px-1.5 py-0.5 rounded-sm font-bold ${order.side === 'LONG' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>{order.side}</span>
                </td>
                {/* 🟢 แก้ไขตรงนี้: ครอบ Number() ป้องกันการแครชถ้าส่ง String มา */}
                <td className="p-3 text-right text-white">
                  {Number(order.price || 0).toFixed(3)}
                </td>
                <td className="p-3 text-right text-gray-300">{order.qty}</td>
                <td className="p-3 text-center text-blue-400">{order.zone}</td>
                <td className="p-3 text-center text-gray-500">{order.sent_at || order.sentAt}</td>
                <td className="p-3 text-center text-gray-300">{order.age}</td>
                <td className="p-3 text-center">
                   <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${order.status === 'STUCK' ? 'bg-red-900/20 text-red-500 border-red-500/30 animate-pulse' : 'bg-green-900/20 text-green-500 border-green-500/30'}`}>{order.status}</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-600 italic">No stuck orders detected.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}