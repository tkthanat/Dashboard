import React from 'react';

export default function Card({ children, className = '', padding = 'p-4', noBorder = false }) {
  return (
    <div className={`bg-[#121A28] ${noBorder ? '' : 'border border-[#1E293B]'} rounded-lg flex flex-col ${padding} ${className}`}>
      {children}
    </div>
  );
}