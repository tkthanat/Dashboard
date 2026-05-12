import { useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';

export default function ClientEquityChart({ historyData, timeRange = 'ALL' }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const dataLengthRef = useRef(0);

  // initialize chart
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

    // map data
    const formattedData = historyData.map(d => ({
      time: d.time || d.date, 
      value: parseFloat(d.est_current_equity || d.equity || 0)
    })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    dataLengthRef.current = formattedData.length;
    series.setData(formattedData);
    
    applyTimeFilter(chart, dataLengthRef.current, timeRange);

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [historyData]);

  // handle time filter updates
  useEffect(() => {
    if (!chartInstanceRef.current || dataLengthRef.current === 0) return;
    applyTimeFilter(chartInstanceRef.current, dataLengthRef.current, timeRange);
  }, [timeRange]);

  // apply time range logic
  const applyTimeFilter = (chart, totalPoints, filter) => {
    let daysToShow = totalPoints;
    
    switch (filter) {
      case '1D': daysToShow = 2; break;
      case '3D': daysToShow = 3; break;
      case '7D': daysToShow = 7; break;
      case '15D': daysToShow = 15; break;
      case '1M': daysToShow = 30; break;
      case '3M': daysToShow = 90; break;
      case '6M': daysToShow = 180; break;
      case 'ALL': daysToShow = totalPoints; break;
      default: daysToShow = totalPoints;
    }

    if (filter === 'ALL') {
      chart.timeScale().fitContent();
    } else {
      chart.timeScale().setVisibleLogicalRange({
        from: Math.max(0, totalPoints - daysToShow),
        to: totalPoints + 2
      });
    }
  };

  return (
    <div className="h-full w-full relative">
      <div className="absolute inset-0" ref={chartContainerRef}></div>
    </div>
  );
}