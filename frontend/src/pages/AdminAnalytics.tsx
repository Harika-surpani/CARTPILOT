import React from 'react';
import { 
  BarChart3, 
  BrainCircuit, 
  CheckCircle2, 
  Award, 
  Activity, 
  ShieldCheck, 
  Sliders,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ModelPerformanceStats } from '../types';
import { ExperimentMetricsView } from '../components/ExperimentMetrics';
import { AICostCard } from '../components/AICostCard';

export const AdminAnalytics: React.FC = () => {
  const modelStats: ModelPerformanceStats[] = [
    { model_name: 'XGBoost (Winning Model)', accuracy: 1.0000, precision: 1.0000, recall: 1.0000, f1_score: 1.0000, roc_auc: 1.0000 },
    { model_name: 'Random Forest', accuracy: 1.0000, precision: 1.0000, recall: 1.0000, f1_score: 1.0000, roc_auc: 1.0000 },
    { model_name: 'Logistic Regression', accuracy: 0.9990, precision: 0.9985, recall: 1.0000, f1_score: 0.9992, roc_auc: 0.9999 }
  ];

  const topFeatures = [
    { name: 'cart_value', weight: 8.5312, pct: 45.2, desc: 'Cumulative session transaction value (₹)' },
    { name: 'avg_time_between_events_sec', weight: 2.1450, pct: 18.5, desc: 'Mean idle time between consecutive actions' },
    { name: 'total_events', weight: 1.8920, pct: 12.1, desc: 'Total clickstream event count' },
    { name: 'product_views', weight: 1.4510, pct: 9.8, desc: 'Count of product detail view interactions' },
    { name: 'session_duration_sec', weight: 1.1200, pct: 7.4, desc: 'Total elapsed time from first event' },
    { name: 'add_to_cart_count', weight: 0.9850, pct: 4.2, desc: 'Items added to shopping cart' },
    { name: 'checkout_started', weight: 0.6500, pct: 2.8, desc: 'Binary flag indicating checkout initiation' }
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
          Phase 2, 5, 6 & Enterprise Decision Layer Analytics
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">
          Admin Model Analytics, Holdout Experiments & AI Cost Tracker
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics from machine learning inference, business decision guardrails, Phase 6 holdout experiments, and the enterprise multi-agent decision pipeline.
        </p>
      </div>

      {/* PHASE 6 HOLDOUT EXPERIMENT DASHBOARD */}
      <ExperimentMetricsView />

      {/* AI COST & LATENCY TRACKER */}
      <AICostCard />

      {/* 4 WINNING METRIC STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
          <span className="text-[10px] text-slate-400 block uppercase">Accuracy</span>
          <span className="text-2xl font-black text-emerald-400">100.0%</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-brand-500/30 bg-brand-950/20">
          <span className="text-[10px] text-slate-400 block uppercase">Precision</span>
          <span className="text-2xl font-black text-brand-accent">100.0%</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-purple-500/30 bg-purple-950/20">
          <span className="text-[10px] text-slate-400 block uppercase">Recall</span>
          <span className="text-2xl font-black text-purple-400">100.0%</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
          <span className="text-[10px] text-slate-400 block uppercase">F1-Score</span>
          <span className="text-2xl font-black text-amber-400">1.0000</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-400 block uppercase">ROC-AUC</span>
          <span className="text-2xl font-black text-cyan-400">1.0000</span>
        </div>
      </div>

      {/* MODEL COMPARISON TABLE */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-accent" />
            Phase 2 ML Model Comparison Matrix
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Holdout Test Split (20%)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Model Classifier</th>
                <th className="p-3.5">Accuracy</th>
                <th className="p-3.5">Precision</th>
                <th className="p-3.5">Recall</th>
                <th className="p-3.5">F1-Score</th>
                <th className="p-3.5 rounded-r-xl">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {modelStats.map((row, idx) => (
                <tr key={idx} className={idx === 0 ? 'bg-brand-500/10 font-bold text-white' : 'hover:bg-slate-800/40'}>
                  <td className="p-3.5 flex items-center gap-2">
                    {idx === 0 && <Award className="w-4 h-4 text-amber-400 shrink-0" />}
                    <span>{row.model_name}</span>
                  </td>
                  <td className="p-3.5 text-emerald-400">{(row.accuracy * 100).toFixed(2)}%</td>
                  <td className="p-3.5">{(row.precision * 100).toFixed(2)}%</td>
                  <td className="p-3.5">{(row.recall * 100).toFixed(2)}%</td>
                  <td className="p-3.5 text-amber-400">{row.f1_score.toFixed(4)}</td>
                  <td className="p-3.5 text-brand-accent">{row.roc_auc.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFUSION MATRIX & FEATURE IMPORTANCE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Confusion Matrix Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Confusion Matrix (Test Set N=2,000)
          </h3>

          <div className="grid grid-cols-2 gap-3 font-mono text-center">
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] text-emerald-400 block font-bold uppercase">True Negatives (TN)</span>
              <span className="text-3xl font-extrabold text-emerald-300">656</span>
              <span className="text-[10px] text-slate-400 block">Actual Purchase, Predicted Purchase</span>
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-1 opacity-75">
              <span className="text-[10px] text-rose-400 block font-bold uppercase">False Positives (FP)</span>
              <span className="text-3xl font-extrabold text-rose-300">0</span>
              <span className="text-[10px] text-slate-400 block">Actual Purchase, Predicted Abandon</span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1 opacity-75">
              <span className="text-[10px] text-amber-400 block font-bold uppercase">False Negatives (FN)</span>
              <span className="text-3xl font-extrabold text-amber-300">0</span>
              <span className="text-[10px] text-slate-400 block">Actual Abandon, Predicted Purchase</span>
            </div>

            <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-1">
              <span className="text-[10px] text-purple-400 block font-bold uppercase">True Positives (TP)</span>
              <span className="text-3xl font-extrabold text-purple-300">1,344</span>
              <span className="text-[10px] text-slate-400 block">Actual Abandon, Predicted Abandon</span>
            </div>
          </div>
        </div>

        {/* Feature Importance Weights */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            Global Feature Importance (XGBoost)
          </h3>

          <div className="space-y-3">
            {topFeatures.map((feat, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-white font-bold">{feat.name}</span>
                  <span className="text-brand-accent">{feat.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full"
                    style={{ width: `${feat.pct}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500 block">{feat.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
