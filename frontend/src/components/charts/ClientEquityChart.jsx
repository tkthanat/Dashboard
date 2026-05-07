import { useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';

export default function ClientEquityChart({ historyData }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || !historyData || historyData.length === 0) return;
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#64748B', attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1E293B', style: 1 } },
      crosshair: { mode: 1, vertLine: { color: '#475569' }, horzLine: { color: '#475569' } },
      timeScale: { borderVisible: false, timeVisible: true },
      rightPriceScale: { borderVisible: false, minimumWidth: 60 },
    });
    chartInstanceRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#EC4899', 
      topColor: '#EC489940',
      bottomColor: '#EC489900',
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
    });

    // Map data with fallback to estimated equity
    const formattedData = historyData.map(d => ({
      time: d.time || d.date, 
      value: parseFloat(d.est_current_equity || d.equity || 0)
    })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    series.setData(formattedData);
    
    setTimeout(() => {
        chart.timeScale().fitContent();
    }, 50);

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [historyData]);

  return (
    <div className="h-full w-full relative">
      <div className="absolute inset-0" ref={chartContainerRef}></div>
    </div>
  );
}