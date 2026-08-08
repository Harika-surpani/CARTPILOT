import React from 'react';
import { BusinessMetrics } from '../types';
import { 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  Tag, 
  Percent, 
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

interface MetricCardsProps {
  metrics: BusinessMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Monitored Sessions',
      value: metrics.total_sessions.toLocaleString(),
      subtext: 'Real-time clickstream streams',
      icon: Users,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
    },
    {
      title: 'High Risk Sessions',
      value: metrics.high_risk_sessions.toLocaleString(),
      subtext: `${((metrics.high_risk_sessions / metrics.total_sessions) * 100).toFixed(1)}% of overall traffic`,
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30'
    },
    {
      title: 'Recovered Sessions',
      value: metrics.recovered_sessions.toLocaleString(),
      subtext: 'Converted via AI rescue',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Total Revenue Saved',
      value: `$${metrics.revenue_saved.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      subtext: 'Attributed to automated offers',
      icon: DollarSign,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30'
    },
    {
      title: 'Coupons Issued / Redeemed',
      value: `${metrics.coupons_issued.toLocaleString()} / ${metrics.coupons_saved.toLocaleString()}`,
      subtext: `${((metrics.coupons_saved / metrics.coupons_issued) * 100).toFixed(1)}% redemption rate`,
      icon: Tag,
      color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Cart Recovery Rate',
      value: `${metrics.recovery_rate}%`,
      subtext: '+12.4% vs industry baseline',
      icon: Percent,
      color: 'from-teal-500/20 to-cyan-500/20 text-teal-400 border-teal-500/30'
    },
    {
      title: 'Average Cart Value',
      value: `$${metrics.avg_cart_value.toFixed(2)}`,
      subtext: 'Per active session',
      icon: ShoppingBag,
      color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30'
    },
    {
      title: 'Average Abandonment Risk',
      value: `${(metrics.avg_risk_score * 100).toFixed(1)}%`,
      subtext: 'Model-derived index',
      icon: TrendingUp,
      color: 'from-indigo-500/20 to-purple-500/20 text-brand-accent border-brand-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">{card.title}</span>
              <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-extrabold text-white font-mono mb-1">
                {card.value}
              </div>
              <span className="text-[11px] text-slate-500 block">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
