export default function PortfolioTable({ data, selectedClient, onSelectClient, isLoading = false }) {
  // Loading State Check
  const loadingState = isLoading || !data || data.length === 0;

  return (
    <div className="overflow-auto h-full scrollbar-thin scrollbar-thumb-gray-700">
      <table className="w-full text-left border-collapse text-[11px]">
        <thead className="sticky top-0 bg-[#0F141E] z-10 shadow-sm">
          <tr className="text-gray-500 border-b border-[#1E293B] uppercase tracking-tighter">
            <th className="py-3 px-4 font-bold">Client Name</th>
            <th className="py-3 px-4 font-bold text-right">Equity (THB)</th>
            <th className="py-3 px-4 font-bold text-right">EE</th>
            <th className="py-3 px-4 font-bold text-right">Total IM</th>
            <th className="py-3 px-4 font-bold text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E293B]/50">
          
          {loadingState ? (
            /* Skeleton State */
            Array.from({ length: 8 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="animate-pulse">
                <td className="py-3.5 px-4"><div className="h-3 w-28 bg-[#1E293B] rounded"></div></td>
                <td className="py-3.5 px-4"><div className="h-3 w-20 bg-[#1E293B] rounded ml-auto"></div></td>
                <td className="py-3.5 px-4"><div className="h-3 w-20 bg-[#1E293B] rounded ml-auto"></div></td>
                <td className="py-3.5 px-4"><div className="h-3 w-16 bg-[#1E293B] rounded ml-auto"></div></td>
                <td className="py-3.5 px-4"><div className="h-4 w-12 bg-[#1E293B] rounded-full mx-auto"></div></td>
              </tr>
            ))
          ) : (
            /* Data State */
            data.map((port, idx) => {
              const isSelected = selectedClient && selectedClient.name === port.name;
              return (
                <tr 
                  key={idx} 
                  onClick={() => onSelectClient(port)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected ? 'bg-blue-900/30 border-l-2 border-l-blue-500' : 'hover:bg-blue-500/5 border-l-2 border-l-transparent'
                  }`}
                >
                  <td className={`py-2.5 px-4 font-medium ${isSelected ? 'text-blue-400' : 'text-gray-300 group-hover:text-blue-400'}`}>
                    {port.name}
                  </td>
                  <td className="py-2.5 px-4 text-right text-white font-mono">{port.equity.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right text-orange-400 font-mono">{port.ee.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right text-purple-400 font-mono">{port.totalIM.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      port.status === 'Critical' ? 'bg-red-900/20 text-red-500 border-red-500/50 animate-pulse' :
                      port.status === 'Caution' ? 'bg-orange-900/20 text-orange-500 border-orange-500/50' :
                      'bg-green-900/20 text-green-500 border-green-500/50'
                    }`}>
                      {port.status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
          
        </tbody>
      </table>
    </div>
  );
}