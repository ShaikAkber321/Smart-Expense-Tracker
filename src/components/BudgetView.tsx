import React, { useState } from 'react';
import { Budget, Expense, ExpenseCategory } from '../types';
import { Plus, X, Wallet, AlertCircle } from 'lucide-react';

interface BudgetViewProps {
  budgets: Budget[];
  expenses: Expense[];
  onSaveBudget: (budget: Omit<Budget, 'id'>) => void;
}

const CATEGORIES: Array<string> = [
  'Overall',
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Healthcare',
  'Entertainment',
  'Groceries',
  'Rent',
  'Utilities',
  'Other',
];

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  expenses,
  onSaveBudget,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState('Overall');
  const [limitInput, setLimitInput] = useState('');

  // Calculate this month's spending per category (March 2026)
  const currentMonthPrefix = '2026-03';
  const thisMonthExpenses = expenses.filter(e => e.expense_date.startsWith(currentMonthPrefix));

  const totalSpentOverall = thisMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const overallBudgetLimit = budgets.find(b => b.category === 'Overall')?.monthly_limit || 50000;
  const overallUsedPct = Math.round((totalSpentOverall / overallBudgetLimit) * 100);

  const catSpent: Record<string, number> = {};
  for (const e of thisMonthExpenses) {
    catSpent[e.category] = (catSpent[e.category] || 0) + Number(e.amount);
  }

  const categoryBudgets = budgets.filter(b => b.category !== 'Overall');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limitInput);
    if (isNaN(numLimit) || numLimit <= 0) return;

    onSaveBudget({
      category: targetCategory,
      monthly_limit: numLimit,
      month: 3,
      year: 2026,
    });

    setLimitInput('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Master Allowance Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Monthly Overview
            </span>
            <h3 className="text-2xl font-bold font-display text-slate-900 mt-1">
              Master Monthly Allowance
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Monitors overall spending across all categories for March 2026
            </p>
          </div>
          <div className="md:text-right">
            <div className="text-xs text-slate-400 font-medium">Total Spent This Month</div>
            <div className="text-2xl font-bold font-display text-slate-900">
              ₹{totalSpentOverall.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Budget Target: ₹{overallBudgetLimit.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span
              className={
                overallUsedPct >= 100
                  ? 'text-rose-600 font-bold'
                  : overallUsedPct >= 90
                  ? 'text-amber-600 font-bold'
                  : overallUsedPct >= 75
                  ? 'text-yellow-600 font-bold'
                  : 'text-emerald-600 font-bold'
              }
            >
              {overallUsedPct >= 100
                ? '⚠ Budget Exceeded'
                : overallUsedPct >= 90
                ? 'Critical Warning (>90%)'
                : overallUsedPct >= 75
                ? 'Pacing Caution (>75%)'
                : '✓ Spending On Track'}
            </span>
            <span className="text-slate-800 font-bold">{overallUsedPct}% utilized</span>
          </div>
          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallUsedPct >= 100
                  ? 'bg-rose-600'
                  : overallUsedPct >= 90
                  ? 'bg-amber-500'
                  : overallUsedPct >= 75
                  ? 'bg-yellow-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, overallUsedPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>0%</span>
            <span>75% Caution</span>
            <span>90% Alert</span>
            <span>100% Ceil</span>
          </div>
        </div>
      </div>

      {/* Category Budgets Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg font-display">Category Allocations</h3>
          <p className="text-xs text-slate-500">Fine-grained spending controls per category</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs inline-flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Set Target Limit</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryBudgets.map((b) => {
          const spent = catSpent[b.category] || 0;
          const pct = Math.round((spent / b.monthly_limit) * 100);

          let barColor = 'bg-indigo-600';
          let statusText = `${pct}% used`;
          let textColor = 'text-slate-700';

          if (pct >= 100) {
            barColor = 'bg-rose-600';
            statusText = `Exceeded (${pct}%)`;
            textColor = 'text-rose-600 font-bold';
          } else if (pct >= 90) {
            barColor = 'bg-amber-500';
            statusText = `Critical (${pct}%)`;
            textColor = 'text-amber-600 font-bold';
          } else if (pct >= 75) {
            barColor = 'bg-yellow-500';
            statusText = `Caution (${pct}%)`;
            textColor = 'text-yellow-600 font-bold';
          }

          return (
            <div
              key={b.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{b.category}</span>
                <span className={`text-xs ${textColor}`}>{statusText}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>
                  Spent: <strong className="text-slate-800">₹{spent.toLocaleString('en-IN')}</strong>
                </span>
                <span>
                  Limit: <strong className="text-slate-800">₹{b.monthly_limit.toLocaleString('en-IN')}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 font-display text-lg">Define Budget Target</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Target Category
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'Overall' ? 'Master Monthly Budget' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Monthly Limit (₹) *
                </label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  required
                  placeholder="e.g., 8000"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
