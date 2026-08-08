import React, { useEffect, useState } from 'react';
import { AICostMetrics } from '../types';
import { getAICostMetrics } from '../services/api';
import { Cpu, DollarSign, Clock, Layers, RefreshCw, Zap } from 'lucide-react';

export const AICostCard: React.FC = () => {
  const [costMetrics, setCostMetrics] = useState<AICostMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCost = async () => {
    setLoading(true);
    try {
      const data = await getAICostMetrics();
      setCostMetrics(data);
    } catch (err) {
      console.error('Failed to fetch AI cost metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCost();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-xs font-mono text-slate-400">
        Loading AI cost tracking metrics...
      </div>
    );
  }

  if (!costMetrics) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 font-mono text-xs">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          AI Decision Cost & Latency Tracker
        </h3>
        <button
          onClick={fetchCost}
          className="px-3 py-1 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center space-x-1.5 border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Total Decisions */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium uppercase">Total Decisions</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">{costMetrics.total_decisions}</span>
          <span className="text-[9px] text-slate-500 block">Evaluated sessions</span>
        </div>

        {/* Card 2: LLM Calls */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium uppercase">Total LLM Calls</span>
          <span className="text-2xl font-extrabold text-purple-400 mt-1 block">{costMetrics.total_llm_calls}</span>
          <span className="text-[9px] text-slate-500 block">Routine ML preferred ($0 LLM)</span>
        </div>

        {/* Card 3: Avg Cost per Decision */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium uppercase">Avg Cost / Decision</span>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
            ${costMetrics.average_cost_per_decision.toFixed(4)}
          </span>
          <span className="text-[9px] text-emerald-400/80 block">Cost Optimized</span>
        </div>

        {/* Card 4: Avg Decision Latency */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium uppercase">Avg Latency</span>
          <span className="text-2xl font-extrabold text-cyan-400 mt-1 block">
            {costMetrics.average_latency_ms.toFixed(1)}ms
          </span>
          <span className="text-[9px] text-cyan-400/80 block">Sub-20ms inference</span>
        </div>

      </div>

    </div>
  );
};
