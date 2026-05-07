export default function Navbar({ loading, alertCount = 0, onNavigate }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0F141E] border-b border-[#1E293B] shadow-md">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">G</div>
          <div>
            <h1 className="text-sm font-bold text-gray-100 leading-tight">TFEX Grid Robot</h1>
            <p className="text-[10px] text-gray-400">USD/THB Futures Admin</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-1 text-xs font-medium">
          <button onClick={() => onNavigate('overview')} className="px-3 py-1.5 hover:bg-[#1E293B] text-gray-400 rounded transition-colors flex items-center gap-2">Overview</button>
          <button onClick={() => onNavigate('market')} className="px-3 py-1.5 hover:bg-[#1E293B] text-gray-400 rounded transition-colors flex items-center gap-2">Market</button>
          <button onClick={() => onNavigate('anomaly')} className="px-3 py-1.5 hover:bg-[#1E293B] text-gray-400 rounded transition-colors flex items-center gap-2">Equity</button>
          <button onClick={() => onNavigate('portfolio')} className="px-3 py-1.5 hover:bg-[#1E293B] text-gray-400 rounded transition-colors flex items-center gap-2">Clients</button>
          <button onClick={() => onNavigate('risk')} className="px-3 py-1.5 hover:bg-[#1E293B] text-gray-400 rounded transition-colors flex items-center gap-2">Risk</button>
          <button onClick={() => onNavigate('drill')} className="px-3 py-1.5 hover:bg-[#1E293B] text-gray-400 rounded transition-colors flex items-center gap-2">Drill</button>
          <button onClick={() => onNavigate('health')} className="px-3 py-1.5 hover:bg-[#1E293B] text-gray-400 rounded transition-colors flex items-center gap-2">Health</button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs font-bold">
        {alertCount > 0 && (
          <button 
            onClick={() => onNavigate('risk')} 
            className="px-3 py-1.5 rounded-full flex items-center gap-2 border bg-red-900/30 text-red-500 border-red-800/50 hover:bg-red-900/50 transition-colors animate-pulse cursor-pointer"
          >
            🔴 {alertCount} Alerts
          </button>
        )}

        <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 border ${
          loading 
            ? 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50' 
            : 'bg-[#064E3B]/40 text-green-400 border-green-700/50'
        }`}>
          <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
          {loading ? 'SYNCING...' : 'LIVE CONNECTED'}
        </div>
      </div>
    </nav>
  );
}