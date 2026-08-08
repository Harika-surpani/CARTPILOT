import React, { useEffect, useState } from 'react';
import { getMetrics } from '../services/api';
import { BusinessMetrics } from '../types';
import { MetricCards } from '../components/MetricCards';
import { 
  AbandonmentTrendChart, 
  RiskDistributionChart, 
  ActionDistributionChart, 
  RevenueSavedChart 
} from '../components/Charts';
import { 
  LayoutDashboard, 
  RefreshCw, 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    const res = await getMetrics();
    setMetrics(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            Executive Analytics Suite
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            AI Cart Rescue Business Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time business telemetry, revenue recovery attribution, and model performance metrics.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 text-brand-accent ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 8 KPI Cards Grid */}
      {metrics ? (
        <MetricCards metrics={metrics} />
      ) : (
        <div className="text-center py-12 text-slate-500">Loading business metrics...</div>
      )}

      {/* 4 RECHARTS VISUALIZATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Real-time Abandonment & Recovery Trends */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-400" />
              Abandonment vs Recovery Volume
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Hourly Stream</span>
          </div>
          <AbandonmentTrendChart />
        </div>

        {/* Chart 2: Risk Category Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Risk Level Distribution
            </h3>
            <span className="text-[11px] font-mono text-slate-400">10,000 Sessions</span>
          </div>
          <RiskDistributionChart distribution={metrics?.risk_distribution} />
        </div>

        {/* Chart 3: Action Counts Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-400" />
              Executed AI Rescue Actions
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Single-Action Policy</span>
          </div>
          <ActionDistributionChart actionCounts={metrics?.action_counts} />
        </div>

        {/* Chart 4: Revenue Saved Growth */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Cumulative Revenue Recovered ($)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Weekly Performance</span>
          </div>
          <RevenueSavedChart />
        </div>

      </div>

      {/* LIVE RECENT DECISION LOGS TABLE */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-accent" />
            Live AI Rescue Decision Audit Log
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Append-Only Audit Stream
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Session ID</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Detected Reason</th>
                <th className="p-3">Recommended Action</th>
                <th className="p-3">Cart Value</th>
                <th className="p-3 rounded-r-xl">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {[
                { id: '1000_142', risk: 0.91, reason: 'Price Sensitive', action: 'Offer Coupon', cart: '$320.00', time: '12:44:12' },
                { id: '1000_143', risk: 0.78, reason: 'Shipping Cost', action: 'Free Shipping', cart: '$89.99', time: '12:43:50' },
                { id: '1000_144', risk: 0.45, reason: 'Hesitation / Inactivity', action: 'Send Reminder', cart: '$199.50', time: '12:42:10' },
                { id: '1000_145', risk: 0.88, reason: 'Payment Failure', action: 'Retry Payment', cart: '$450.00', time: '12:40:05' },
                { id: '1000_146', risk: 0.22, reason: 'Low Risk', action: 'Do Nothing', cart: '$59.99', time: '12:38:22' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-white">{row.id}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      row.risk >= 0.7 ? 'bg-rose-500/20 text-rose-400' : row.risk >= 0.4 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {(row.risk * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{row.reason}</td>
                  <td className="p-3 font-bold text-brand-accent">{row.action}</td>
                  <td className="p-3 text-white">{row.cart}</td>
                  <td className="p-3 text-slate-500">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
