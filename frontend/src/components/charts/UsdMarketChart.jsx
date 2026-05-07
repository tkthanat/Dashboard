import { useEffect, useRef } from 'react';
import { createChart, AreaSeries, LineSeries } from 'lightweight-charts';

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

export default function UsdMarketChart({ usdMarket, unifiedDates, onChartReady }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const isInitialFit = useRef(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#64748B', attributionLogo: false },
      grid: { vertLines: { color: '#1E293B', style: 1 }, horzLines: { color: '#1E293B', style: 1 } },
      crosshair: { mode: 1, vertLine: { color: '#475569' }, horzLine: { color: '#475569' } },
      timeScale: { borderVisible: false, timeVisible: false },
      rightPriceScale: { minimumWidth: 95 },
      localization: { dateFormat: 'dd/MM/yyyy' }, 
    });
    chartInstanceRef.current = chart;

    const xAxisFacer = chart.addSeries(LineSeries, { 
      color: 'rgba(0,0,0,0)', crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false, autoscaleInfoProvider: () => null 
    });
    xAxisFacer.setData(unifiedDates.map(d => ({ time: d, value: 0 })));

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#3B82F6', topColor: '#3B82F640', bottomColor: '#3B82F600', 
      lineWidth: 2, priceLineVisible: false,
    });
    seriesRef.current = series;

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    window.addEventListener('resize', handleResize);
    if (onChartReady) onChartReady(chart);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current || !seriesRef.current || !usdMarket?.history || !unifiedDates.length) return;

    const historyMap = new Map();
    usdMarket.history.forEach(item => {
        const ft = formatTime(item.time);
        if (ft) historyMap.set(ft, item.value);
    });

    let lastVal = usdMarket.history[0]?.value || 32.00;
    const cleanData = [];
    
    unifiedDates.forEach(date => {
        if (historyMap.has(date)) {
            lastVal = historyMap.get(date);
        }
        cleanData.push({ time: date, value: lastVal });
    });

    const uniqueData = [];
    let lastAddedTime = 0;
    cleanData.forEach(d => {
       const t = new Date(d.time).getTime();
       if (t > lastAddedTime) {
           uniqueData.push(d);
           lastAddedTime = t;
       }
    });

    seriesRef.current.setData(uniqueData);

    if (!isInitialFit.current) {
      setTimeout(() => {
        const totalPoints = unifiedDates.length;
        chartInstanceRef.current.timeScale().setVisibleLogicalRange({
          from: Math.max(0, totalPoints - 8), 
          to: totalPoints + 6
        });
      }, 50);
      isInitialFit.current = true;
    }
  }, [usdMarket, unifiedDates]);

  return (
    <Card padding="p-4" className="relative">
      <SectionTitle 
        icon="💱" 
        title="USD/THB Market Price (USDM26)" 
        rightElement={<span className="text-[9px] text-gray-500">SETTRADE API</span>}
      />
      <div className="h-[200px] w-full relative">
        <div className="absolute inset-0" ref={chartContainerRef}></div>
      </div>
    </Card>
  );
}