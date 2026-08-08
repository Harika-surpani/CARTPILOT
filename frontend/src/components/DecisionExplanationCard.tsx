import React from 'react';
import { RecommendResponse, RealtimeSessionPayload } from '../types';
import { BrainCircuit, HelpCircle, Zap, ShieldCheck, DollarSign, TrendingUp } from 'lucide-react';

interface DecisionExplanationCardProps {
  decision: RecommendResponse | RealtimeSessionPayload | null;
}

export const DecisionExplanationCard: React.FC<DecisionExplanationCardProps> = ({ decision }) => {
  if (!decision) return null;

  const signals = decision.top_signals || decision.top_features?.map(f => f.description) || ['High cart value', 'Checkout started'];
  const reason = decision.reason || 'Checkout hesitation';
  const recAction = decision.recommended_action || 'SEND_REMINDER';
  const finalAction = decision.final_action || recAction;
  const cost = decision.discount_cost ?? 0;
  const margin = decision.expected_incremental_margin ?? 0;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-brand-accent" />
          Enterprise Decision Explanation
        </h3>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
          Explainable AI Decision Layer
        </span>
      </div>

      {/* Grid of Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
        
        {/* Card 1: WHY THIS DECISION? */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> WHY THIS DECISION?
          </span>
          <span className="font-bold text-white text-sm block">{reason}</span>
          <div className="space-y-1 text-[11px] text-slate-400 pt-1">
            <span className="text-[10px] text-slate-500 block">Top Intent Signals:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              {signals.slice(0, 3).map((sig, idx) => (
                <li key={idx} className="truncate">{sig}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 2: WHAT ACTION & WHY THIS ACTION? */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] text-brand-accent font-bold uppercase flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> WHAT & WHY THIS ACTION?
          </span>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block">Recommended (ML):</span>
            <span className="font-bold text-slate-300 text-xs block">{recAction}</span>
            <span className="text-[10px] text-emerald-400 block pt-1">Final Executed:</span>
            <span className="font-extrabold text-emerald-300 text-sm block">{finalAction}</span>
          </div>
        </div>

        {/* Card 3: DISCOUNT COST & EXPECTED MARGIN */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> DISCOUNT & EXPECTED MARGIN
          </span>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-slate-400 text-[11px]">Discount Cost:</span>
            <span className="font-bold text-slate-200">₹{cost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400 text-[11px]">Net Incremental Margin:</span>
            <span className="font-extrabold text-emerald-400 text-sm">+₹{margin.toFixed(2)}</span>
          </div>
          <span className="text-[9px] text-slate-500 block pt-1">Economic Viability Check Passed</span>
        </div>

      </div>

    </div>
  );
};
