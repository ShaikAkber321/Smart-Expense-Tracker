import React, { useState } from 'react';
import { PredictionData, AIInsightsData } from '../types';
import {
  Sparkles,
  TrendingUp,
  Bot,
  AlertCircle,
  Zap,
  PiggyBank,
  Sliders,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { ForecastTimelineChart } from './Charts';

interface PredictiveInsightsViewProps {
  prediction: PredictionData;
  aiInsights: AIInsightsData;
  onRefreshAI: () => void;
  isAiLoading: boolean;
  initialTab?: 'forecast' | 'ai';
}

export const PredictiveInsightsView: React.FC<PredictiveInsightsViewProps> = ({
  prediction,
  aiInsights,
  onRefreshAI,
  isAiLoading,
  initialTab = 'forecast',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'forecast' | 'ai'>(initialTab);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('forecast')}
          className={`pb-3 flex items-center space-x-2 transition ${
            activeSubTab === 'forecast'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Next-Month ML Forecast</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ai')}
          className={`pb-3 flex items-center space-x-2 transition ${
            activeSubTab === 'ai'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>OpenAI Saving Guidance</span>
        </button>
      </div>

      {/* TAB 1: PREDICTIVE FORECAST */}
      {activeSubTab === 'forecast' && (
        <div className="space-y-6">
          {!prediction.has_sufficient_data && (
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/80 text-amber-900 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-950">Insufficient Historical Data</h4>
                <p className="text-xs text-amber-800 mt-1">
                  {prediction.message ||
                    'Not enough historical data for a reliable prediction. Continue recording expenses to unlock predictive insights.'}
                </p>
              </div>
            </div>
          )}

          {/* Forecast Hero Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Time-Series Linear & Moving Average Ensemble</span>
                </span>
                <h3 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white mt-2">
                  ₹{prediction.predicted_total.toLocaleString('en-IN')}
                </h3>
                <p className="text-xs md:text-sm text-indigo-200/90">
                  Projected spending estimate for {prediction.predicted_month_name} based on multi-month regression.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-200">Expected Shift:</span>
                  <span className="font-bold text-emerald-400">
                    {prediction.expected_change_pct > 0
                      ? `+${prediction.expected_change_pct}%`
                      : `${prediction.expected_change_pct}%`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-200">Model Confidence:</span>
                  <span className="font-bold text-indigo-100">{prediction.confidence_score}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-200">Confidence Band:</span>
                  <span className="font-medium text-indigo-200">
                    ₹{prediction.confidence_interval.lower.toLocaleString('en-IN')} - ₹{prediction.confidence_interval.upper.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical vs Forecast Chart & Projected Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-display">
                    Historical Actuals vs Forecasted Month
                  </h3>
                  <p className="text-xs text-slate-400">Dotted indicator shows the machine learning projection</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                  Live Fit
                </span>
              </div>
              <div className="h-72 relative">
                <ForecastTimelineChart timeline={prediction.historical_chart_data} />
              </div>
            </div>

            {/* Projected Category Matrix */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm font-display mb-1">
                Projected Category Targets
              </h3>
              <p className="text-xs text-slate-400 mb-4">Predicted budget targets per category</p>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {Object.entries(prediction.predicted_categories).map(([cat, amt]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0"
                  >
                    <span className="font-semibold text-slate-700">{cat}</span>
                    <span className="font-bold text-indigo-600 font-display">
                      ₹{amt.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPENAI GUIDANCE */}
      {activeSubTab === 'ai' && (
        <div className="space-y-6">
          {/* Action trigger banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Bot className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Personalized OpenAI Savings Advisor
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Transmits strictly aggregated, anonymized metrics (category totals, run-rates, and budget limits) to generate tactical savings recommendations.
              </p>
            </div>
            <button
              onClick={onRefreshAI}
              disabled={isAiLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition inline-flex items-center space-x-2 shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isAiLoading ? 'Generating Advice...' : 'Refresh Financial Advice'}</span>
            </button>
          </div>

          {/* Disclaimer Banner */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center space-x-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong>Disclaimer:</strong> {aiInsights.disclaimer}
            </span>
          </div>

          {/* Executive Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Executive Financial Summary
            </span>
            <p className="text-slate-800 text-sm mt-2 leading-relaxed font-medium">
              {aiInsights.summary}
            </p>
          </div>

          {/* Priority Action Hero */}
          <div className="bg-indigo-50/70 border border-indigo-200 p-5 rounded-2xl flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-indigo-950 text-sm">High-Impact Priority Action</h4>
              <p className="text-xs text-indigo-900 mt-1 font-medium leading-relaxed">
                {aiInsights.priority_action}
              </p>
            </div>
          </div>

          {/* 3 Grid Columns: Concerns, Tips, Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Concerns */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span>Top Spending Concerns</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {aiInsights.top_concerns.map((c, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Saving Tips */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase mb-3">
                <PiggyBank className="w-4 h-4" />
                <span>Personalized Saving Tips</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {aiInsights.saving_tips.map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Budget Adjustments */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase mb-3">
                <Sliders className="w-4 h-4" />
                <span>Budget Adjustments</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {aiInsights.budget_suggestions.map((s, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
