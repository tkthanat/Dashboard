import { useEffect, useRef } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';
import ChartSkeleton from '../loading/ChartSkeleton';

export default function EquityAnomalyChart({ data, isLoading = false }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const tooltipRef = useRef(null);
  const seriesMapRef = useRef(new Map());

  useEffect(() => {
    if (isLoading || !chartContainerRef.current || !data) return;
    
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#64748B', attributionLogo: false },
      grid: { vertLines: { color: '#1E293B', style: 1 }, horzLines: { color: '#1E293B', style: 1 } },
      crosshair: { mode: 1, vertLine: { color: '#475569', labelBackgroundColor: '#1E293B' }, horzLine: { color: '#475569', labelBackgroundColor: '#1E293B' } },
      timeScale: { borderVisible: false, timeVisible: false },
      rightPriceScale: { borderVisible: false, minimumWidth: 70 },
    });
    chartInstanceRef.current = chart;

    const normalClients = data.filter(c => !c.isCritical && !c.isBest);
    const bestClients = data.filter(c => c.isBest);
    const criticalClients = data.filter(c => c.isCritical);

    const drawSeries = (clients, color, lineWidth, category) => {
      clients.forEach(client => {
        const series = chart.addSeries(LineSeries, {
          color: color, 
          lineWidth: lineWidth, 
          lastValueVisible: false, 
          priceLineVisible: false, 
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4, // 🟢 แก้ตรงนี้: เปิดให้แสดงจุด (Marker) ขนาด 4px สำหรับกราฟทุกเส้น
        });
        series.setData(client.history);
        seriesMapRef.current.set(series, { id: client.id, category, color });
      });
    };

    drawSeries(normalClients, '#3B82F630', 1, 'Cluster');
    drawSeries(bestClients, '#10B981', 2, 'Best');
    drawSeries(criticalClients, '#EF4444', 2.5, 'Critical');

    chart.subscribeCrosshairMove(param => {
      const tooltip = tooltipRef.current;
      const containerWidth = chartContainerRef.current.clientWidth;
      const containerHeight = chartContainerRef.current.clientHeight;

      if (!tooltip || !param.time || param.point.x < 0 || param.point.x > containerWidth || param.point.y < 0 || param.point.y > containerHeight) {
        tooltip.style.display = 'none';
        return;
      }

      let closestClient = null;
      let minDistance = 15;

      param.seriesData.forEach((dataPoint, series) => {
        const coordinateY = series.priceToCoordinate(dataPoint.value);
        const distanceY = Math.abs(param.point.y - coordinateY);

        if (distanceY < minDistance) {
          minDistance = distanceY;
          closestClient = { ...seriesMapRef.current.get(series), value: dataPoint.value };
        }
      });

      if (closestClient) {
        tooltip.style.display = 'block';
        
        let bgClass, borderClass, headerColor, icon;
        
        if (closestClient.category === 'Critical') {
          bgClass = 'bg-[#3F1115]/95'; 
          borderClass = 'border-red-500';
          icon = '🚨';
          headerColor = 'text-red-400';
        } else if (closestClient.category === 'Best') {
          bgClass = 'bg-[#062F21]/95'; 
          borderClass = 'border-green-500';
          icon = '🌟';
          headerColor = 'text-green-400';
        } else {
          bgClass = 'bg-[#121A28]/95'; 
          borderClass = 'border-blue-500/50';
          icon = '📊';
          headerColor = 'text-blue-400';
        }

        tooltip.className = `absolute z-10 ${bgClass} border-l-[3px] ${borderClass} shadow-2xl rounded-r p-3 pointer-events-none transition-opacity min-w-[160px] backdrop-blur-md`;

        tooltip.innerHTML = `
          <div class="${headerColor} text-[11px] font-bold tracking-widest uppercase mb-1">${icon} CLIENT: ${closestClient.id}</div>
          <div class="text-gray-400 text-[9px] mb-2 font-mono pb-2 border-b border-white/10">Date: ${param.time}</div>
          <div class="flex justify-between items-center gap-4 mt-2">
            <span class="text-gray-300 text-[10px]">Equity:</span>
            <span class="text-white text-[12px] font-mono font-bold">฿${Math.round(closestClient.value).toLocaleString()}</span>
          </div>
        `;

        const tooltipRect = tooltip.getBoundingClientRect();
        let left = param.point.x + 20;
        let top = param.point.y + 10;

        if (left + tooltipRect.width > containerWidth) left = param.point.x - tooltipRect.width - 20;
        if (top + tooltipRect.height > containerHeight) top = param.point.y - tooltipRect.height - 20;

        tooltip.style.left = Math.max(0, left) + 'px';
        tooltip.style.top = Math.max(0, top) + 'px';

      } else {
        tooltip.style.display = 'none';
      }
    });

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    window.addEventListener('resize', handleResize);
    chart.timeScale().fitContent();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, isLoading]);

  if (isLoading) {
    return <ChartSkeleton height="h-[250px]" />;
  }

  return (
    <div className="h-full w-full relative group">
      <div className="absolute top-4 left-4 z-10 flex gap-4 bg-[#0F141E]/80 border border-[#1E293B] p-2 rounded backdrop-blur-sm pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-red-500"></div>
          <span className="text-[9px] text-gray-300 font-bold tracking-wide">CRITICAL RISK</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span className="text-[9px] text-gray-300 font-bold tracking-wide">TOP PERFORMER</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-blue-500/50"></div>
          <span className="text-[9px] text-gray-400">NORMAL CLUSTER</span>
        </div>
      </div>

      <div className="absolute inset-0" ref={chartContainerRef}></div>
      <div ref={tooltipRef} className="hidden"></div>
    </div>
  );
}