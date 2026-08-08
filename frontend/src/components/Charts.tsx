import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

// Color definitions matching SaaS Dark theme
const COLORS = {
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#ef4444',
  indigo: '#6366f1',
  purple: '#a855f7',
  cyan: '#06b6d4',
};

const ACTION_PIE_COLORS = ['#a855f7', '#10b981', '#f59e0b', '#3b82f6', '#64748b'];

// Custom Dark Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-xl border border-slate-700 text-xs shadow-2xl space-y-1">
        <p className="font-bold text-white mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-mono flex items-center justify-between gap-3" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Abandonment Trend Area Chart
export const AbandonmentTrendChart: React.FC = () => {
  const data = [
    { time: '09:00', Abandoned: 140, Recovered: 45, Purchased: 95 },
    { time: '10:00', Abandoned: 220, Recovered: 85, Purchased: 130 },
    { time: '11:00', Abandoned: 310, Recovered: 140, Purchased: 180 },
    { time: '12:00', Abandoned: 480, Recovered: 210, Purchased: 240 },
    { time: '13:00', Abandoned: 390, Recovered: 180, Purchased: 210 },
    { time: '14:00', Abandoned: 520, Recovered: 260, Purchased: 290 },
    { time: '15:00', Abandoned: 610, Recovered: 310, Purchased: 340 },
    { time: '16:00', Abandoned: 450, Recovered: 230, Purchased: 270 },
  ];

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="abandonedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="recoveredGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Area type="monotone" dataKey="Abandoned" stroke={COLORS.rose} fillOpacity={1} fill="url(#abandonedGrad)" />
          <Area type="monotone" dataKey="Recovered" stroke={COLORS.emerald} fillOpacity={1} fill="url(#recoveredGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Risk Distribution Bar Chart
export const RiskDistributionChart: React.FC<{ distribution?: { low: number; medium: number; high: number } }> = ({ distribution }) => {
  const data = [
    { name: 'Low Risk', count: distribution?.low ?? 3279, fill: COLORS.emerald },
    { name: 'Medium Risk', count: distribution?.medium ?? 2840, fill: COLORS.amber },
    { name: 'High Risk', count: distribution?.high ?? 3881, fill: COLORS.rose },
  ];

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Action Distribution Donut Pie Chart
export const ActionDistributionChart: React.FC<{ actionCounts?: Record<string, number> }> = ({ actionCounts }) => {
  const data = actionCounts
    ? Object.entries(actionCounts).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Offer Coupon', value: 3120 },
        { name: 'Free Shipping', value: 2150 },
        { name: 'Send Reminder', value: 1185 },
        { name: 'Retry Payment', value: 266 },
        { name: 'Do Nothing', value: 3279 }
      ];

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={ACTION_PIE_COLORS[index % ACTION_PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Revenue Saved Cumulative Line Chart
export const RevenueSavedChart: React.FC = () => {
  const data = [
    { day: 'Mon', Saved: 18400, Target: 15000 },
    { day: 'Tue', Saved: 34200, Target: 30000 },
    { day: 'Wed', Saved: 58900, Target: 45000 },
    { day: 'Thu', Saved: 89400, Target: 60000 },
    { day: 'Fri', Saved: 124500, Target: 80000 },
    { day: 'Sat', Saved: 158200, Target: 100000 },
    { day: 'Sun', Saved: 184250, Target: 120000 },
  ];

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.5} />
              <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Area type="monotone" dataKey="Saved" stroke={COLORS.indigo} strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
