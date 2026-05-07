// ข้อมูลจำลองสำหรับหน้า Risk Alerts
export const riskAlertsData = [
  {
    id: 1, type: 'CRITICAL', title: 'Critical EE — ACC-0012 - สมชาย วงศ์ทอง',
    desc: 'EE ฿68,400 = 34.2% of deployed - USD/THB เหลือ 33.00 ทำให้ all zones เป็น deep long - อีก -14.2% จะถึง Margin Call',
    time: 'วันนี้ 08:32 น.', icon: '🔴', border: 'border-l-red-500', bg: 'bg-[#0F141E]',
    buttons: [
      { label: 'Ack', style: 'border border-[#1E293B] text-gray-400 hover:text-white' }, 
      { label: 'Force TP', style: 'border border-red-900/50 bg-red-900/20 text-red-500 hover:bg-red-900/40' }
    ]
  },
  {
    id: 2, type: 'WARNING', title: 'EE Caution — ACC-0028 - วิภา ศรีสมบัติ',
    desc: 'EE ฿92,100 = 46.1% - Trend ลง 3 วัน - MDD -5.8% เข้า warning zone',
    time: 'วันนี้ 09:14 น.', icon: '🟡', border: 'border-l-yellow-500', bg: 'bg-[#0F141E]',
    buttons: [
      { label: 'Ack', style: 'border border-[#1E293B] text-gray-400 hover:text-white' }, 
      { label: 'View', style: 'border border-[#1E293B] bg-[#1E293B]/50 text-gray-300 hover:bg-[#1E293B]' }
    ]
  },
  {
    id: 3, type: 'STUCK', title: 'Stuck Order — ACC-0031 - #TH-48219',
    desc: 'Limit Long @ 33.10 - 10 lots - ส่ง 09:43:12 - ไม่ Match หลัง 42s - USD/THB พุ่ง 0.12 ใน 90s',
    time: 'วันนี้ 09:43 น.', icon: '⚠️', border: 'border-l-orange-500', bg: 'bg-[#0F141E]',
    buttons: [
      { label: 'Cancel', style: 'border border-red-900/50 text-red-500 hover:bg-red-900/20' }, 
      { label: 'Market', style: 'bg-blue-600 text-white hover:bg-blue-500 border-transparent' }
    ]
  }
];

// ข้อมูลจำลองสำหรับกราฟ MDD
export const mddDistributionData = [
  { range: '0-2%', count: 24, color: '#10B981' }, // Safe (Green)
  { range: '2-5%', count: 12, color: '#3B82F6' }, // Normal (Blue)
  { range: '5-8%', count: 4, color: '#F59E0B' },  // Warning (Orange)
  { range: '>8%', count: 1, color: '#EF4444' }    // Critical (Red)
];

// ข้อมูลจำลองสำหรับกราฟ PNL
export const monthlyPnlData = [
  { month: 'Jan', pnl: 145000 },
  { month: 'Feb', pnl: 210000 },
  { month: 'Mar', pnl: -45000 },
  { month: 'Apr', pnl: 84000 },
];

// ข้อมูลจำลองสำหรับตาราง Stuck Orders
export const stuckOrdersData = [
  { id: '#TH-48219', account: 'ACC-0031', side: 'LONG', price: '33.100', qty: 10, zone: 'Z-51', sentAt: '09:43:12', age: '00:42', status: 'STUCK' },
  { id: '#TH-48204', account: 'ACC-0019', side: 'LONG', price: '32.900', qty: 10, zone: 'Z-49', sentAt: '09:38:04', age: 'Matched', status: 'OK' }
];

// ข้อมูลจำลองสำหรับกล่อง Equity Anomaly Detection (ใน App.jsx)
export const anomalyMockData = {
  critical: 'ACC-0012',
  caution: 'ACC-0028',
  best: 'ACC-0007',
  clusterAvg: 47
};

// ข้อมูลจำลองสำหรับหน้า Client Drill-Down
export const drillDownMockData = {
  kpi: { todayPnl: '+฿980', mtdPnl: '+฿28,400', mdd: '-9.2%' },
  mddAnalysis: {
    date: '12 มิ.ย. - 2 เม.ย. 2569',
    peak: '฿1,143,600',
    trough: '฿1,038,200',
    drawdown: '-฿105,400 (-9.2%)',
    duration: '21 วัน (ongoing)',
    recovery: 'In Progress',
    eeToMarginCall: 'อีก ฿28,400'
  },
  openPositions: [
    { id: 1, zone: 'Z-15', entry: '34.150', lots: 10, tpd: 0, unrealized: '+4,500', depthWidth: '40%' }
  ],
  realizedHistory: [
    { id: 1, date: '20/04/2026', pnl: '+1,200', contracts: 4, trades: 2, usdthb: '35.12' }
  ],
  stats: { winRate: '68.5%', profitFactor: '1.42', totalTrades: '142' }
};

// ข้อมูลจำลองสำหรับ Grid Zone Heatmap (28.00 - 33.00)
export const gridZoneData = Array.from({ length: 51 }, (_, i) => {
  const price = (28.0 + (i * 0.1)).toFixed(2);
  let status = 'empty';
  let count = 0;
  const p = parseFloat(price);
  
  if (p < 31.5) { status = 'tpd'; count = Math.floor(Math.random() * 5); }
  else if (p >= 31.5 && p < 32.4) { status = 'partial'; count = Math.floor(Math.random() * 10) + 1; }
  else if (p === 32.4) { status = 'current'; count = 41; }
  else if (p > 32.4 && p <= 32.8) { status = 'full'; count = Math.floor(Math.random() * 20) + 5; }
  
  return { price, count, status };
});

// ข้อมูลจำลองสำหรับ Equity Anomaly
const generateAnomalyData = () => {
  const dates = Array.from({length: 30}, (_, i) => `2026-04-${String(i+1).padStart(2, '0')}`);
  const clients = [];
  
  for(let i=0; i<50; i++) {
      let base = 200000;
      const isCritical = i === 11 || i === 24; // ให้มี Critical 2 คน
      const isBest = i === 6;    // ให้มี Best 1 คน
      
      const history = dates.map(d => {
          // ใช้เทคนิค Random Walk ให้กราฟดูสมจริงขึ้น
          let change = (Math.random() - 0.5) * 8000; 
          
          if(isCritical) {
            change = (Math.random() - 0.8) * 12000; // ร่วงหนักๆ
          } else if(isBest) {
            change = (Math.random() - 0.2) * 10000; // ขึ้นดีๆ
          } else {
            // Cluster ทั่วไป เกาะกลุ่มกัน
            change = (Math.random() - 0.5) * 3000;
          }
          
          base += change;
          return { time: d, value: base };
      });
      
      clients.push({
          id: `ACC-00${String(i+1).padStart(2, '0')}`,
          isCritical,
          isBest,
          history
      });
  }
  return clients;
};
export const anomalyChartData = generateAnomalyData();