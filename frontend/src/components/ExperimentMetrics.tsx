import React, { useEffect, useState } from 'react';
import { ExperimentMetrics } from '../types';
import { getExperiments } from '../services/api';
import { 
  FlaskConical, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const ExperimentMetricsView: React.FC = () => {
  const [metrics, setMetrics] = useState<ExperimentMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await getExperiments();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch experiment metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center flex items-center justify-center space-x-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin text-brand-accent" />
        <span>Loading Phase 6 Holdout Experiment Metrics...</span>
      </div>
    );
  }

  if (!metrics) return null;

  const isInsufficient = metrics.status_message.toLowerCase().includes('insufficient');

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" /> Phase 6 Holdout A/B Experiment
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {metrics.experiment_id}</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Control vs. Treatment Rescue Impact Validation
          </h2>
        </div>

        <button
          onClick={fetchMetrics}
          className="px-3.5 py-1.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Results</span>
        </button>
      </div>

      {/* Warning Notice if Insufficient Sample Size */}
      {isInsufficient ? (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-white">Insufficient Sample Size</h4>
            <p className="text-xs text-amber-200/80">
              The system currently has evaluated {metrics.total_sessions} session(s). Holdout metrics require a minimum sample size across Control (10%) and Treatment (90%) groups before claiming validated AI conversion improvements.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Holdout data shows statistically validated performance improvements.</span>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sessions & Split */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium block">Total Holdout Sessions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{metrics.total_sessions}</span>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              10% Ctrl / 90% Trt
            </span>
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between pt-1">
            <span>Control: {metrics.control_sessions}</span>
            <span>Treatment: {metrics.treatment_sessions}</span>
          </div>
        </div>

        {/* Control vs Treatment Conversion */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium block">Conversion Rates</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">
              {(metrics.treatment_conversion_rate * 100).toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              Ctrl: {(metrics.control_conversion_rate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 pt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{(metrics.incremental_conversion * 100).toFixed(1)}% Incremental Lift</span>
          </div>
        </div>

        {/* Incremental Revenue */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium block">Incremental Revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-cyan-400">
              ₹{metrics.incremental_revenue.toLocaleString()}
            </span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between pt-1">
            <span>Control: ₹{metrics.control_revenue.toLocaleString()}</span>
            <span>Trt: ₹{metrics.treatment_revenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Incremental Net Margin */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium block">Incremental Profit Margin</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">
              ₹{metrics.incremental_margin.toLocaleString()}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between pt-1">
            <span>Discount Cost: ₹{metrics.discount_cost.toLocaleString()}</span>
            <span>Recovery: {metrics.recovery_rate}%</span>
          </div>
        </div>

      </div>

    </div>
  );
};
