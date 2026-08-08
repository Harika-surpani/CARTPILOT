import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface RiskIndicatorProps {
  riskScore: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ riskScore, size = 'md' }) => {
  const percentage = Math.round(riskScore * 100);

  let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let Icon = CheckCircle;

  if (riskScore >= 0.70) {
    level = 'HIGH';
    colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    Icon = ShieldAlert;
  } else if (riskScore >= 0.40) {
    level = 'MEDIUM';
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    Icon = AlertTriangle;
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-2 text-base font-bold' : 'px-3 py-1 text-sm font-semibold';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border ${colorClass} ${paddingClass}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span className="font-mono">{level} RISK ({percentage}%)</span>
    </div>
  );
};
