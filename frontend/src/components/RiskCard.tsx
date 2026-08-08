import React from 'react';
import { AlertTriangle, ShieldCheck, Activity, TrendingUp, Info } from 'lucide-react';
import { RecommendResponse, PredictResponse } from '../types';

interface RiskCardProps {
  prediction?: PredictResponse | null;
  recommendation?: RecommendResponse | null;
  className?: string;
}

export const RiskCard: React.FC<RiskCardProps> = ({ prediction, recommendation, className = '' }) => {
  const riskScore = recommendation?.risk_score ?? prediction?.risk_score ?? 0.85;
  const abandonmentProb = recommendation?.abandonment_probability ?? prediction?.abandonment_probability ?? 0.85;
  const purchaseProb = recommendation?.purchase_probability ?? prediction?.purchase_probability ?? 0.15;
  const confidence = recommendation?.confidence ?? prediction?.confidence ?? 0.92;

  const riskPercent = Math.round(riskScore * 100);
  const purchasePercent = Math.round(purchaseProb * 100);

  // Dynamic Color Palette based on Risk level
  const getRiskStyle = () => {
    if (riskScore >= 0.7) {
      return {
        badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        ringColor: 'stroke-rose-500',
        gradient: 'from-rose-500 via-pink-500 to-amber-500',
        text: 'text-rose-400',
        label: 'HIGH RISK',
        icon: AlertTriangle
      };
    }
    if (riskScore >= 0.4) {
      return {
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        ringColor: 'stroke-amber-500',
        gradient: 'from-amber-500 via-yellow-500 to-emerald-500',
        text: 'text-amber-400',
        label: 'MEDIUM RISK',
        icon: Info
      };
    }
    return {
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      ringColor: 'stroke-emerald-500',
      gradient: 'from-emerald-500 to-teal-400',
      text: 'text-emerald-400',
      label: 'LOW RISK',
      icon: ShieldCheck
    };
  };

  const style = getRiskStyle();
  const IconComponent = style.icon;

  return (
    <div className={`glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-6 ${className}`}>
      
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-brand-accent" />
          <h3 className="text-base font-bold text-white">Cart Abandonment Risk</h3>
        </div>

        <span className={`px-3 py-1 rounded-full border text-xs font-black tracking-wider flex items-center space-x-1.5 ${style.badge}`}>
          <IconComponent className="w-3.5 h-3.5" />
          <span>{style.label}</span>
        </span>
      </div>

      {/* Main Meter / Gauge Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* SVG Circular Progress Meter */}
        <div className="relative flex flex-col items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              className="stroke-slate-800"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              className={`${style.ringColor} transition-all duration-1000 ease-out`}
              strokeWidth="12"
              strokeDasharray={377}
              strokeDashoffset={377 - (377 * riskScore)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-extrabold font-mono ${style.text}`}>
              {riskPercent}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Risk Score
            </span>
          </div>
        </div>

        {/* Probability Breakdown Sliders */}
        <div className="space-y-4">
          
          {/* Abandonment Probability */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Abandonment Probability</span>
              <span className="text-rose-400 font-mono">{(abandonmentProb * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${abandonmentProb * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Purchase Probability */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Purchase Probability</span>
              <span className="text-emerald-400 font-mono">{purchasePercent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${purchaseProb * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Model Confidence */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-brand-accent" /> Model Confidence:
            </span>
            <span className="text-white font-mono font-bold">{(confidence * 100).toFixed(0)}%</span>
          </div>

        </div>

      </div>

    </div>
  );
};
