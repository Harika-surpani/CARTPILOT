import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Zap, Target, Sliders } from 'lucide-react';
import { RecommendResponse } from '../types';
import { useNavigate } from 'react-router-dom';

interface RecommendationCardProps {
  recommendation: RecommendResponse;
  onSimulateChannel?: (action: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onSimulateChannel
}) => {
  const navigate = useNavigate();

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'Offer Coupon':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Free Shipping':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Retry Payment':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Send Reminder':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-brand-500/20 text-brand-accent">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Recommendation Engine</h3>
            <p className="text-[11px] text-slate-400">Rule-mapped optimal rescue intervention</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-semibold text-brand-accent flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 fill-current" /> Single-Action Policy
        </span>
      </div>

      {/* Recommended Action Highlight */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-dark-800 to-slate-900 border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-brand-accent" /> Recommended Action
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {new Date(recommendation.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-2xl font-black px-4 py-2 rounded-xl border ${getActionBadgeColor(recommendation.recommended_action)} shadow-lg`}>
            {recommendation.recommended_action}
          </span>

          <button
            onClick={() => {
              if (onSimulateChannel) {
                onSimulateChannel(recommendation.recommended_action);
              } else {
                navigate('/notification-demo');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-brand-500/20 active:scale-95"
          >
            <span>Preview Intervention</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Detected Reason Heuristic */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium">Detected Abandonment Reason:</span>
        <span className="font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
          {recommendation.reason}
        </span>
      </div>

      {/* Top Feature Importance Weights */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-brand-accent" /> Top Contributing Factors
        </h4>

        <div className="space-y-2">
          {recommendation.top_features.slice(0, 3).map((feat, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">{feat.description || feat.feature}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Feature key: {feat.feature}</span>
                </div>
              </div>
              <span className="font-mono font-bold text-brand-accent bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                +{(feat.importance).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
