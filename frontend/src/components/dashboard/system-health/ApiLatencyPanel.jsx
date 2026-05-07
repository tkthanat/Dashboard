import React, { useState, useEffect, useRef } from 'react';
import Card from '../../common/Card';
import SectionTitle from '../../common/SectionTitle';
import { createChart, AreaSeries, LineSeries } from 'lightweight-charts';

export default function ApiLatencyPanel() {
  const [timeFilter, setTimeFilter] = useState('15M');
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const thresholdSeriesRef = useRef(null);
  const [pingData, setPingData] = useState([]);
  
  // ตัวแปรสำหรับเก็บค่า Latency ล่าสุดที่ได้จาก Backend
  const latestLatencyRef = useRef(45);

  // Timeframe Aggregation
  const getIntervalSeconds = (f) => {
    if(f === '1M') return 60;
    if(f === '5M') return 300;
    if(f === '15M') return 900;
    if(f === '30M') return 1800;
    if(f === '1H') return 3600;
    if(f === '4H') return 14400;
    if(f === '1D') return 86400;
    return 900;
  };

  // Time Alignment
  const getAlignedTime = (intervalSecs) => {
    const nowSecs = Math.floor(Date.now() / 1000);
    const tzOffsetSecs = new Date().getTimezoneOffset() * 60;
    const localSecs = nowSecs - tzOffsetSecs;
    const alignedLocalSecs = Math.floor(localSecs / intervalSecs) * intervalSecs;
    return alignedLocalSecs + tzOffsetSecs;
  };

  // Chart Initialization & Mock Historical Data
  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 400,
      height: chartContainerRef.current.clientHeight || 200,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#64748B', attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1E293B', style: 1 } },
      timeScale: { 
        timeVisible: true, 
        secondsVisible: false, 
        borderVisible: false,
        fixLeftEdge: true, 
        fixRightEdge: true 
      },
      rightPriceScale: { borderVisible: false },
    });
    chartInstanceRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#3B82F6', topColor: '#3B82F640', bottomColor: '#3B82F600', lineWidth: 2, priceLineVisible: false
    });
    seriesRef.current = series;

    const threshold = chart.addSeries(LineSeries, {
      color: 'rgba(239, 68, 68, 0.5)', lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false
    });
    thresholdSeriesRef.current = threshold;

    const intervalSecs = getIntervalSeconds(timeFilter);
    const currentAlignedTime = getAlignedTime(intervalSecs);
    const newData = [];
    let historyValue = 45;

    // สร้างข้อมูลย้อนหลังหลอกๆ ไว้แสดงผลตอนเปิดหน้าแรก
    for (let i = 60; i >= 0; i--) {
      const time = currentAlignedTime - (i * intervalSecs);
      historyValue = Math.max(10, Math.min(300, historyValue + (Math.random() - 0.5) * 30));
      newData.push({ time, value: historyValue });
    }

    series.setData(newData);
    threshold.setData(newData.map(d => ({ time: d.time, value: 200 })));
    setPingData(newData);

    setTimeout(() => chart.timeScale().fitContent(), 50);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [timeFilter]);

  // WebSocket Connection (เชื่อมต่อ FastAPI)
  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:5000/ws/latency');

    ws.onopen = () => console.log('✅ Connected to Latency WebSocket');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.latency_ms) {
          // เก็บค่าที่ได้จาก Server ไว้ใน ref
          latestLatencyRef.current = data.latency_ms;
        }
      } catch (error) {
        console.error("Error parsing WS data", error);
      }
    };

    ws.onerror = (error) => {
      // ดัก Error สีแดงตอน React Strict Mode สั่ง Re-mount
      if (ws.readyState !== WebSocket.CLOSED) {
         console.error("WebSocket Error: ", error);
      }
    };

    // ปิดการเชื่อมต่อเมื่อเปลี่ยนหน้าหรือ Component ถอนตัว
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  // Real-time Update Tick (อัปเดตกราฟด้วยข้อมูลจาก WebSocket)
  useEffect(() => {
    const intervalSecs = getIntervalSeconds(timeFilter);

    const timer = setInterval(() => {
      setPingData(prev => {
        if (prev.length === 0) return prev;
        
        const lastPoint = prev[prev.length - 1];
        const currentAlignedTime = getAlignedTime(intervalSecs);
        
        // ดึงค่าใหม่ที่วิ่งผ่าน WebSocket มาใช้งาน
        const newValue = latestLatencyRef.current;

        if (currentAlignedTime > lastPoint.time) {
          const newPoint = { time: currentAlignedTime, value: newValue };
          if(seriesRef.current) seriesRef.current.update(newPoint);
          if(thresholdSeriesRef.current) thresholdSeriesRef.current.update({ time: currentAlignedTime, value: 200 });
          return [...prev.slice(1), newPoint];
        } else {
          const updatedPoint = { time: lastPoint.time, value: newValue };
          if(seriesRef.current) seriesRef.current.update(updatedPoint);
          return [...prev.slice(0, -1), updatedPoint];
        }
      });
    }, 2000); 

    return () => clearInterval(timer);
  }, [timeFilter]); 

  const filters = ['1M', '5M', '15M', '30M', '1H', '4H', '1D'];

  return (
    <Card padding="p-4">
      <SectionTitle 
        icon="⚡" 
        title="API Latency Monitoring" 
        subtitle="(Settrade Open API)"
        rightElement={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[9px] text-gray-400 mr-2 hidden md:flex">
              <span className="w-2 h-0.5 bg-red-500"></span> Threshold 200ms
            </span>
            <div className="flex items-center gap-1 bg-[#0F141E] p-1 rounded border border-[#1E293B] overflow-x-auto">
              {filters.map(f => (
                 <button 
                    key={f} 
                    onClick={() => setTimeFilter(f)} 
                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${timeFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                    {f}
                 </button>
              ))}
            </div>
          </div>
        }
      />
      <div className="h-[200px] w-full relative mt-4">
        <div className="absolute inset-0" ref={chartContainerRef}></div>
      </div>
    </Card>
  );
}