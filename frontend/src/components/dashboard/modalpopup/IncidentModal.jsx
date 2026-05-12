import React from 'react';

export default function IncidentModal({ alert, onClose, onAction, onViewClient }) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#121A28] border border-[#1E293B] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className={`p-4 border-b border-[#1E293B] flex justify-between items-center ${alert.bg}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{alert.icon}</span>
            <h3 className={`font-bold tracking-wide ${alert.textClass}`}>INCIDENT DETAILS</h3>
            <span className="bg-[#0F141E] text-gray-400 px-2 py-0.5 rounded text-[10px] font-mono border border-[#1E293B] ml-2">
              {alert.id}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Issue Overview</div>
            <div className="text-white text-sm bg-[#0F141E] p-3 rounded-lg border border-[#1E293B] leading-relaxed">
              <span className="font-bold text-gray-200">{alert.message}</span> <br/>
              <span className="text-gray-400 text-xs mt-2 block">{alert.details || 'ไม่พบรายละเอียดเพิ่มเติมในระบบ'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0F141E] p-3 rounded-lg border border-[#1E293B]">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Affected Entity</div>
              <div className="text-white font-mono flex justify-between items-center">
                {alert.client_id || 'System Wide'}
                {alert.client_id && (
                  <button 
                    onClick={() => {
                      onClose();
                      if(onViewClient) onViewClient(alert.client_id);
                    }}
                    className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    VIEW PORTFOLIO
                  </button>
                )}
              </div>
            </div>
            <div className="bg-[#0F141E] p-3 rounded-lg border border-[#1E293B]">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Time & Duration</div>
              <div className="text-white font-mono flex items-center gap-2">
                {alert.time} <span className="text-gray-500 text-[10px]">({alert.duration || 'N/A'})</span>
              </div>
            </div>
          </div>

          {alert.metrics && (
            <div>
               <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Key Metrics</div>
               <div className="flex gap-6 border-l-2 border-[#1E293B] pl-3">
                  <div>
                    <div className="text-[9px] text-gray-500">Current Value</div>
                    <div className={`font-mono font-bold ${alert.metrics.current_value < 0 ? 'text-red-500' : 'text-white'}`}>
                      {alert.metrics.current_value?.toLocaleString()} {alert.metrics.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500">Threshold Limit</div>
                    <div className="font-mono text-gray-300">
                      {alert.metrics.threshold?.toLocaleString()} {alert.metrics.unit}
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Actions) */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0F141E]/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded text-xs font-bold text-gray-400 hover:text-white transition-colors">
            CANCEL
          </button>
          {alert.buttons?.map((btn, idx) => (
            <button 
              key={idx} 
              onClick={() => onAction(alert.id, btn.label)}
              className={`px-4 py-2 rounded text-xs font-bold transition-all active:scale-95 shadow-lg ${btn.style}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}