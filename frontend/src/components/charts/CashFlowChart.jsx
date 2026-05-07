import { useEffect, useRef, useState } from 'react';
import { createChart, LineSeries } from 'lightweight-charts';

import Card from '../common/Card';
import SectionTitle from '../common/SectionTitle';

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

export default function CashFlowChart({ portfolios, unifiedDates, onChartReady }) {
  const chartContainerRef = useRef(null);
  const tooltipRef = useRef(null);
  const isInitialFit = useRef(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const chartInstanceRef = useRef(null);
  const seriesMapRef = useRef(new Map());

  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#64748B', attributionLogo: false },
      grid: { vertLines: { color: '#1E293B', style: 1 }, horzLines: { color: '#1E293B', style: 1 } },
      crosshair: { mode: 1, vertLine: { color: '#475569' }, horzLine: { color: '#475569' } },
      timeScale: { borderVisible: false, timeVisible: false },
      rightPriceScale: { alignLabels: false, minimumWidth: 95 },
      localization: { dateFormat: 'dd/MM/yyyy' },
    });
    chartInstanceRef.current = chart;

    chart.subscribeCrosshairMove(param => {
      const tooltip = tooltipRef.current;
      if (!tooltip || !param.time || param.point.x < 0 || param.point.y < 0) {
        tooltip.style.display = 'none';
        return;
      }

      let closestSeries = null;
      let minDistance = Infinity;
      let hoveredValue = null;

      param.seriesData.forEach((dataPoint, series) => {
        if (dataPoint && dataPoint.value !== undefined && seriesMapRef.current.has(series)) {
          const yCoord = series.priceToCoordinate(dataPoint.value);
          if (yCoord !== null) {
            const distance = Math.abs(yCoord - param.point.y);
            if (distance < minDistance) {
              minDistance = distance;
              closestSeries = series;
              hoveredValue = dataPoint.value;
            }
          }
        }
      });

      if (closestSeries && minDistance < 25) {
        const targetClient = seriesMapRef.current.get(closestSeries);
        if (targetClient) {
          const [year, month, day] = param.time.split('-'); 
          tooltip.style.display = 'block';
          tooltip.style.left = param.point.x + 15 + 'px';
          tooltip.style.top = param.point.y + 15 + 'px';
          tooltip.innerHTML = `
            <div class="font-bold text-white mb-2 border-b border-gray-700 pb-1 text-[11px] uppercase tracking-wide truncate">
              ${targetClient.name}
            </div>
            <div class="flex items-center justify-between gap-4 text-[9px] mb-1">
              <span class="text-gray-500">Date:</span>
              <span class="text-gray-300 font-mono">${day}/${month}/${year}</span>
            </div>
            <div class="flex items-center justify-between gap-4 mt-1 text-[10px]">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" style="background-color: ${targetClient.color};"></span>
                <span class="text-gray-500">Cash Flow:</span>
              </div>
              <span class="text-green-400 font-mono font-bold">฿${Math.round(hoveredValue).toLocaleString()}</span>
            </div>
          `;
        }
      } else {
        tooltip.style.display = 'none';
      }
    });

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    window.addEventListener('resize', handleResize);
    if (onChartReady) onChartReady(chart);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current || !portfolios.length || !unifiedDates.length) return;
    const chart = chartInstanceRef.current;
    
    seriesMapRef.current.forEach((val, series) => {
        try { chart.removeSeries(series); } catch (e) {}
    });
    seriesMapRef.current.clear();

    const xAxisFacer = chart.addSeries(LineSeries, { 
      color: 'rgba(0,0,0,0)', crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false, autoscaleInfoProvider: () => null 
    });
    xAxisFacer.setData(unifiedDates.map(d => ({ time: d, value: 0 })));

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

    portfolios.forEach((port, idx) => {
      const seriesColor = colors[idx % colors.length];
      const series = chart.addSeries(LineSeries, {
        color: seriesColor, lineWidth: 1, lastValueVisible: true, priceLineVisible: false, crosshairMarkerVisible: true,
      });

      const historyMap = new Map();
      if (port.history) {
        port.history.forEach(h => {
            const ft = formatTime(h.time);
            if (ft) historyMap.set(ft, parseFloat(h.cash_flow || 0));
        });
      }

      let rawData = [];
      let lastVal = parseFloat(port.cash_flow || 0);
      let started = false;

      unifiedDates.forEach(date => {
        if (historyMap.has(date)) {
            started = true;
            lastVal = historyMap.get(date);
            rawData.push({ time: date, value: lastVal });
        } else if (started) {
            rawData.push({ time: date, value: lastVal });
        }
      });

      if (rawData.length === 0) {
          rawData.push({ time: unifiedDates[unifiedDates.length - 1], value: lastVal });
      }

      const uniqueData = [];
      let lastAddedTime = 0;
      rawData.forEach(d => {
         const t = new Date(d.time).getTime();
         if (t > lastAddedTime) {
             uniqueData.push(d);
             lastAddedTime = t;
         }
      });

      series.setData(uniqueData);
      seriesMapRef.current.set(series, { name: port.name, color: seriesColor });
    });

    if (!isInitialFit.current) {
      setTimeout(() => {
        const totalPoints = unifiedDates.length;
        chart.timeScale().setVisibleLogicalRange({
          from: Math.max(0, totalPoints - 8), 
          to: totalPoints + 6 
        });
      }, 50);
      isInitialFit.current = true;
    }
  }, [portfolios, unifiedDates]);

  return (
    <Card padding="p-4" className="relative">
      <SectionTitle 
        icon="🔥" 
        title="Daily Realized Cash Flow" 
        subtitle="(All Ports)"
        rightElement={
          <div className="flex items-center gap-1 bg-[#0F141E] p-1 rounded border border-[#1E293B]">
            {['1D', '3D', '7D', '1M', '3M', 'ALL'].map(filter => (
               <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)} 
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${activeFilter === filter ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
               >
                  {filter}
               </button>
            ))}
          </div>
        }
      />
      <div className="h-[280px] w-full relative">
        <div className="absolute inset-0" ref={chartContainerRef}></div>
        <div ref={tooltipRef} className="absolute z-10 bg-[#0F141E] border border-[#1E293B] shadow-lg rounded p-3 pointer-events-none hidden transition-opacity min-w-[200px]"></div>
      </div>
    </Card>
  );
}