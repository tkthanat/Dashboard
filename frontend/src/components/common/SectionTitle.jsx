import React from 'react';

export default function SectionTitle({ icon, title, subtitle, rightElement, className = '' }) {
  return (
    <div className={`flex justify-between items-center mb-2 z-10 ${className}`}>
      <div className="text-[10px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
        {icon && <span>{icon}</span>}
        {title}
        {subtitle && <span className="text-[10px] text-gray-500 normal-case ml-1">{subtitle}</span>}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}