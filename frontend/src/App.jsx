import { useEffect, useState } from 'react';
import { fetchDashboardData } from './services/sheetService';
import Navbar from './components/layout/Navbar';
import PortfolioOverview from './components/dashboard/PortfolioOverview'; 
import PortfolioTable from './components/dashboard/PortfolioTable';
import RiskAlerts from './components/dashboard/RiskAlerts';
import ClientDrillDown from './components/dashboard/ClientDrillDown';
import SystemHealth from './components/dashboard/SystemHealth';
import ChartManager from './components/charts/ChartManager';
import EquityAnomalyChart from './components/charts/EquityAnomalyChart';
import Card from './components/common/Card';
import { anomalyChartData } from './data/mockData';

function App() {
  const [data, setData] = useState({ summary: null, portfolios: [], usd_market: null });
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [alertCount, setAlertCount] = useState(0);
  
  // State Pop-up Toasts
  const [toasts, setToasts] = useState([]);

  const handleNewAlert = (newAlert) => {
    const toastId = Date.now();
    setToasts(prev => [...prev, { ...newAlert, toastId }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.toastId !== toastId));
    }, 5000);
  };

  useEffect(() => {
    const load = async () => {
      const res = await fetchDashboardData();
      if (res) setData(res);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 80; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-gray-300 font-sans pb-10 relative">
      
      {/* Pop-up (Toast Notifications) */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.toastId} 
            className={`w-[320px] p-4 rounded-lg shadow-2xl border-l-[4px] ${toast.border} bg-[#121A28]/95 backdrop-blur-md border border-[#1E293B] transition-all duration-300 transform translate-x-0`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{toast.icon}</span>
              <span className={`text-[11px] font-bold tracking-widest uppercase ${toast.type === 'critical' ? 'text-red-400' : toast.type === 'warning' ? 'text-orange-400' : 'text-blue-400'}`}>
                {toast.title}
              </span>
            </div>
            <p className="text-[10px] text-gray-300 ml-7 leading-relaxed">{toast.desc}</p>
            <div className="text-[9px] text-gray-500 ml-7 mt-2 font-mono">
              ⏰ {toast.time}
            </div>
          </div>
        ))}
      </div>

      <Navbar loading={loading} alertCount={alertCount} onNavigate={handleScroll} />

      <main className="p-4 space-y-6">
        <div id="overview"><PortfolioOverview portfolios={data.portfolios} usdMarket={data.usd_market} kpi={data.summary || {}} /></div>
        <div id="market"><ChartManager portfolios={data.portfolios} usdMarket={data.usd_market} /></div>

        <div id="anomaly" className="space-y-2 mt-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
              <span className="text-blue-400">📈</span> EQUITY ANOMALY DETECTION
            </h2>
          </div>
          <Card padding={loading ? "p-3" : "p-4"} className="h-[280px] flex flex-col">
            <div className="flex-1 rounded">
              <EquityAnomalyChart data={anomalyChartData} isLoading={loading} />
            </div>
          </Card>
        </div>

        <div id="portfolio" className="space-y-2 mt-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
              <span className="text-indigo-400">👥</span> CLIENT PORTFOLIO MONITORING
              <span className="text-[9px] text-gray-500 normal-case font-medium">— คลิกที่รายชื่อเพื่อดูรายละเอียดด้านล่าง</span>
            </h2>
            <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20 font-bold text-[9px]">{data.portfolios.length} ACTIVE</span>
          </div>
          <Card padding="p-0" className="h-[400px]">
            <PortfolioTable data={data.portfolios} selectedClient={selectedClient} onSelectClient={setSelectedClient} isLoading={loading} />
          </Card>
        </div>

        <div id="risk">
          <RiskAlerts isLoading={loading} onAlertUpdate={setAlertCount} onNewAlert={handleNewAlert} />
        </div>
        
        <div id="drill"><ClientDrillDown client={selectedClient} onClose={() => setSelectedClient(null)} isLoading={loading} /></div>
        <div id="health"><SystemHealth /></div>
      </main>
    </div>
  );
}

export default App;