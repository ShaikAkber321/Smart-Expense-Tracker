import React from 'react';
import { Expense, AnalyticsData } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsData;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  const maxDow = Math.max(...Object.values(analytics.daily_averages_by_weekday), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Descriptive Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOTAL SPENT</span>
          <div className="text-base sm:text-lg font-bold font-display text-slate-900 mt-1">
            ₹{analytics.total_expenses.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">{analytics.total_transactions} txns</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MEAN (AVG)</span>
          <div className="text-base sm:text-lg font-bold font-display text-slate-900 mt-1">
            ₹{analytics.average_expense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Mean per ticket</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MEDIAN</span>
          <div className="text-base sm:text-lg font-bold font-display text-slate-900 mt-1">
            ₹{analytics.median_expense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">50th percentile</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">STD DEVIATION</span>
          <div className="text-base sm:text-lg font-bold font-display text-slate-900 mt-1">
            ±₹{analytics.std_dev_expense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Dispersion</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MAX SINGLE</span>
          <div className="text-base sm:text-lg font-bold font-display text-rose-600 mt-1">
            ₹{analytics.maximum_expense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Highest ticket</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MIN SINGLE</span>
          <div className="text-base sm:text-lg font-bold font-display text-emerald-600 mt-1">
            ₹{analytics.minimum_expense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Lowest ticket</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOP SPEND</span>
          <div className="text-base sm:text-lg font-bold font-display text-indigo-600 mt-1 truncate">
            {analytics.most_expensive_category}
          </div>
          <span className="text-[11px] text-slate-400">By total value</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOP FREQUENCY</span>
          <div className="text-base sm:text-lg font-bold font-display text-purple-600 mt-1 truncate">
            {analytics.most_frequent_category}
          </div>
          <span className="text-[11px] text-slate-400">By txn volume</span>
        </div>
      </div>

      {/* Category Breakdown Table & Largest Outliers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Category Expenditure Matrix</h3>
              <p className="text-xs text-slate-400">Total volume and percentage allocation across all historical records</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5 text-right">Transactions</th>
                  <th className="px-6 py-3.5 text-right">Total (₹)</th>
                  <th className="px-6 py-3.5 text-right">Proportion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.category_breakdown.map((c) => (
                  <tr key={c.category} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{c.category}</td>
                    <td className="px-6 py-3.5 text-right text-slate-500">{c.count}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-900">
                      ₹{c.total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-xs font-semibold text-indigo-600">{c.percentage}%</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${c.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 High-Value Outliers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-display">Top High-Value Outliers</h3>
            <p className="text-xs text-slate-400">Largest recorded individual line items</p>
          </div>
          <div className="space-y-2.5 pt-2">
            {analytics.largest_transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60"
              >
                <div>
                  <div className="font-semibold text-slate-800 text-xs">{t.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {t.category} • {t.date}
                  </div>
                </div>
                <div className="font-bold text-slate-900 text-sm font-display">
                  ₹{t.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly History & Weekday Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Historical Aggregates */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm font-display">Monthly Historical Aggregates</h3>
            <p className="text-xs text-slate-400">Grouped spending totals per billing cycle</p>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] text-slate-500 font-bold uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left">Period</th>
                  <th className="px-4 py-2.5 text-right">Transactions</th>
                  <th className="px-4 py-2.5 text-right">Total Spent (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.monthly_totals.map((m) => (
                  <tr key={m.month} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{m.month}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{m.count}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      ₹{m.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekday Spending Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm font-display">Daily Average Spending Profile</h3>
            <p className="text-xs text-slate-400">Mean spend rate by day of week</p>
          </div>
          <div className="space-y-3 pt-1">
            {Object.entries(analytics.daily_averages_by_weekday).map(([day, val]) => {
              const pct = Math.round((val / maxDow) * 100);
              return (
                <div key={day}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{day}</span>
                    <span className="font-bold text-slate-900">₹{val.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
