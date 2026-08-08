import React from 'react';
import { RealtimeSessionPayload, ClickstreamEvent } from '../types';
import { RiskIndicator } from './RiskIndicator';
import { 
  Activity, 
  ShoppingCart, 
  BrainCircuit, 
  ShieldCheck, 
  DollarSign, 
  Layers, 
  Sparkles, 
  Clock,
  FlaskConical,
  Zap
} from 'lucide-react';

interface LiveSessionProps {
  sessionId: string;
  realtimeData: RealtimeSessionPayload | null;
  events: ClickstreamEvent[];
  cartValue: number;
  isConnected: boolean;
}

export const LiveSession: React.FC<LiveSessionProps> = ({
  sessionId,
  realtimeData,
  events,
  cartValue,
  isConnected
}) => {
  const currentRisk = realtimeData ? realtimeData.risk_score : 0.0;
  const abandonmentProb = realtimeData ? Math.round(realtimeData.abandonment_probability * 100) : 0;
  const purchaseProb = realtimeData ? Math.round(realtimeData.purchase_probability * 100) : 100;
  const reason = realtimeData?.reason || 'Browsing';
  const recAction = realtimeData?.recommended_action || 'DO_NOTHING';
  const finalAction = realtimeData?.final_action || 'DO_NOTHING';
  const margin = realtimeData?.expected_incremental_margin ?? 0;
  const decisionStatus = realtimeData?.decision_status || 'PENDING';
  const experimentGroup = realtimeData?.experiment_group || 'TREATMENT';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-2 border ${
            isConnected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'LIVE WEBSOCKET CONNECTED' : 'POLLING MODE'}</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Session ID: #{sessionId}</span>
        </div>

        <RiskIndicator riskScore={currentRisk} size="md" />
      </div>

      {/* Grid Status Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Cart Value */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Current Cart Value</span>
          <span className="text-2xl font-extrabold text-white">₹{cartValue.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{events.length} Event(s) recorded</span>
        </div>

        {/* Abandonment vs Purchase Probabilities */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Model Probabilities</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold text-rose-400">{abandonmentProb}% Abandon</span>
            <span className="text-xs text-emerald-400 font-mono">{purchaseProb}% Buy</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden flex">
            <div className="bg-rose-500 h-full" style={{ width: `${abandonmentProb}%` }} />
            <div className="bg-emerald-500 h-full" style={{ width: `${purchaseProb}%` }} />
          </div>
        </div>

        {/* Likely Reason */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Inferred Abandonment Signal</span>
          <span className="text-sm font-bold text-amber-300 block truncate mt-1">{reason}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Phase 3 Signal Engine</span>
        </div>

        {/* Holdout Group & Status */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">A/B Holdout Group</span>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              experimentGroup === 'CONTROL' 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            }`}>
              {experimentGroup} (10% Control / 90% Trt)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">Status: {decisionStatus}</span>
        </div>

      </div>

      {/* Guardrail Decision & Expected Incremental Margin Panel */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-brand-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-accent" />
            <h4 className="text-sm font-bold text-white">Phase 5 Business Guardrail & Margin Decision</h4>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Expected Net Margin: +₹{margin.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Recommended Action (Phase 3 ML)</span>
            <span className="font-bold text-slate-200 text-sm">{recAction}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
            <span className="text-emerald-400 text-[10px] block font-semibold">Final Action (After Guardrails & Holdout)</span>
            <span className="font-bold text-emerald-300 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-accent" />
              {finalAction}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
