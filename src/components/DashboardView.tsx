import React from 'react';
import { Expense, Budget, PredictionData, InsightAlert, ActiveTab } from '../types';
import {
  Calendar,
  History,
  TrendingUp,
  Sparkles,
  Tag,
  AlertTriangle,
  Info,
  CheckCircle,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import {
  MonthlyTrendChart,
  CategoryDonutChart,
  ForecastTimelineChart,
  PaymentMethodChart,
  DailyWeekdayChart,
  BudgetVsActualChart,
} from './Charts';

interface DashboardViewProps {
  expenses: Expense[];
  budgets: Budget[];
  prediction: PredictionData;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  budgets,
  prediction,
  setActiveTab,
}) => {
  // Current Month calculations (March 2026)
  const currentMonthKey = '2026-03';
  const lastMonthKey = '2026-02';

  const thisMonthExpenses = expenses.filter(e => e.expense_date.startsWith(currentMonthKey));
  const lastMonthExpenses = expenses.filter(e => e.expense_date.startsWith(lastMonthKey));

  const totalThisMonth = thisMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalLastMonth = lastMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const momChange = totalLastMonth > 0
    ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 1000) / 10
    : 0;

  // Daily avg (March has 31 days)
  const dailyAvg = Math.round((totalThisMonth / 31) * 100) / 100;

  // Highest Category
  const catSums: Record<string, number> = {};
  for (const exp of thisMonthExpenses) {
    catSums[exp.category] = (catSums[exp.category] || 0) + Number(exp.amount);
  }
  const sortedCats = Object.entries(catSums).sort((a, b) => b[1] - a[1]);
  const highestCat = sortedCats[0] ? sortedCats[0][0] : 'None';
  const highestCatAmount = sortedCats[0] ? sortedCats[0][1] : 0;

  // Budget
  const masterBudget = budgets.find(b => b.category === 'Overall')?.monthly_limit || 50000;
  const budgetUsedPct = Math.round((totalThisMonth / masterBudget) * 100);
  const remainingBudget = Math.max(0, masterBudget - totalThisMonth);

  // Trailing 6 months data for Chart 1
  const monthMap: Record<string, number> = {};
  for (const exp of expenses) {
    const m = exp.expense_date.substring(0, 7);
    monthMap[m] = (monthMap[m] || 0) + Number(exp.amount);
  }
  const sortedMonths = Object.keys(monthMap).sort().slice(-6);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendLabels = sortedMonths.map(m => {
    const [yr, mo] = m.split('-');
    return `${monthNames[parseInt(mo, 10) - 1]} '${yr.slice(2)}`;
  });
  const trendValues = sortedMonths.map(m => Math.round(monthMap[m]));

  // Category chart data
  const categoryLabels = sortedCats.map(c => c[0]);
  const categoryValues = sortedCats.map(c => Math.round(c[1]));

  // Payment method chart data
  const methodMap: Record<string, number> = {};
  for (const exp of thisMonthExpenses) {
    methodMap[exp.payment_method] = (methodMap[exp.payment_method] || 0) + Number(exp.amount);
  }
  const methodLabels = Object.keys(methodMap);
  const methodValues = Object.values(methodMap).map(v => Math.round(v));

  // Day of week spending
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dowSums = [0, 0, 0, 0, 0, 0, 0];
  const dowCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const exp of expenses) {
    const d = new Date(exp.expense_date + 'T00:00:00');
    const idx = (d.getDay() + 6) % 7;
    dowSums[idx] += Number(exp.amount);
    dowCounts[idx] += 1;
  }
  const dowAvg = dowSums.map((sum, i) => (dowCounts[i] > 0 ? Math.round(sum / dowCounts[i]) : 0));

  // Smart alerts
  const alerts: InsightAlert[] = [];
  if (budgetUsedPct >= 100) {
    alerts.push({
      type: 'danger',
      title: 'Budget Exceeded',
      message: `Current month spending (₹${totalThisMonth.toLocaleString('en-IN')}) has exceeded your target budget (₹${masterBudget.toLocaleString('en-IN')}).`,
    });
  } else if (budgetUsedPct >= 90) {
    alerts.push({
      type: 'warning',
      title: 'Critical Budget Alert',
      message: `You have consumed ${budgetUsedPct}% of your ₹${masterBudget.toLocaleString('en-IN')} allowance. ₹${remainingBudget.toLocaleString('en-IN')} remains.`,
    });
  } else if (budgetUsedPct >= 75) {
    alerts.push({
      type: 'warning',
      title: 'Budget Caution',
      message: `75% threshold crossed (${budgetUsedPct}% used). Consider pacing non-essential expenses.`,
    });
  }

  if (momChange > 15) {
    alerts.push({
      type: 'warning',
      title: 'Spending Surge',
      message: `Expenditure increased by +${momChange}% compared to last month.`,
    });
  } else if (momChange < -15) {
    alerts.push({
      type: 'success',
      title: 'Positive Saving Trend',
      message: `Great job! Your spending is down ${Math.abs(momChange)}% compared to last month.`,
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>THIS MONTH</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">
            ₹{totalThisMonth.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-xs">
            <span className={`inline-flex items-center font-bold ${momChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {momChange > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {momChange > 0 ? `+${momChange}%` : `${momChange}%`}
            </span>
            <span className="text-slate-400">vs last month</span>
          </div>
        </div>

        {/* Card 2: Last Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>LAST MONTH</span>
            <span className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
              <History className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">
            ₹{totalLastMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-2">Historical baseline comparison</div>
        </div>

        {/* Card 3: Daily Average */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>DAILY AVERAGE</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">
            ₹{dailyAvg.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {expenses.length} total recorded transactions
          </div>
        </div>

        {/* Card 4: Next Month Prediction */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 shadow-xs hover:border-indigo-300 transition">
          <div className="flex items-center justify-between text-indigo-900 text-xs font-bold uppercase tracking-wider mb-2">
            <span>NEXT MONTH PREDICTION</span>
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-display text-indigo-700">
            ₹{prediction.predicted_total.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-indigo-600 font-semibold">
              {prediction.expected_change_pct > 0 ? `+${prediction.expected_change_pct}%` : `${prediction.expected_change_pct}%`} shift
            </span>
            <span className="text-slate-400">
              Confidence: {prediction.confidence_score}%
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-bold text-slate-700">Master Monthly Budget</span>
            <span className="font-bold text-slate-900">{budgetUsedPct}% utilized</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsedPct >= 100
                  ? 'bg-rose-600'
                  : budgetUsedPct >= 90
                  ? 'bg-amber-500'
                  : budgetUsedPct >= 75
                  ? 'bg-yellow-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Limit: <strong className="text-slate-800">₹{masterBudget.toLocaleString('en-IN')}</strong></span>
            <span>Remaining: <strong className="text-emerald-600">₹{remainingBudget.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Top Spending Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Top Expenditure Category</div>
            <div className="text-lg font-bold text-slate-900 font-display mt-0.5">{highestCat}</div>
            <div className="text-xs text-slate-400 mt-0.5">₹{highestCatAmount.toLocaleString('en-IN')} this month</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        {/* AI Guidance Callout */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Advisory</span>
            </div>
            <div className="text-sm font-bold font-display">Optimization Insights</div>
            <p className="text-xs text-slate-300">OpenAI savings strategies ready</p>
          </div>
          <button
            onClick={() => setActiveTab('ai-tips')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center space-x-1 shrink-0"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                alert.type === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {alert.type === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                <div>
                  <strong className="font-bold">{alert.title}: </strong>
                  <span>{alert.message}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('predictive-insights')}
                className="underline font-semibold ml-3 shrink-0 hover:opacity-80"
              >
                Review
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 6 Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Monthly Spending Trend</h3>
              <p className="text-xs text-slate-400">Historical spending trajectory (trailing 6 months)</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Time-series</span>
          </div>
          <div className="h-64 relative">
            <MonthlyTrendChart labels={trendLabels} values={trendValues} />
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Category Distribution</h3>
              <p className="text-xs text-slate-400">Proportional expenditure allocation (current month)</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Breakdown</span>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            {categoryLabels.length > 0 ? (
              <CategoryDonutChart labels={categoryLabels} values={categoryValues} />
            ) : (
              <p className="text-xs text-slate-400">No records for this month.</p>
            )}
          </div>
        </div>

        {/* Chart 3: Historical Actuals vs Forecasted Next Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Actuals vs Forecasted Next Month</h3>
              <p className="text-xs text-slate-400">Linear regression and moving average ML projection</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              ML Model
            </span>
          </div>
          <div className="h-64 relative">
            <ForecastTimelineChart timeline={prediction.historical_chart_data} />
          </div>
        </div>

        {/* Chart 4: Payment Method Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Payment Method Share</h3>
              <p className="text-xs text-slate-400">UPI, Credit Card, Debit Card, Net Banking</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Channel</span>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            {methodLabels.length > 0 ? (
              <PaymentMethodChart labels={methodLabels} values={methodValues} />
            ) : (
              <p className="text-xs text-slate-400">No transaction data.</p>
            )}
          </div>
        </div>

        {/* Chart 5: Weekday Spending Profile */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Daily Spending Pattern</h3>
              <p className="text-xs text-slate-400">Average spending per day of week</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Habits</span>
          </div>
          <div className="h-64 relative">
            <DailyWeekdayChart labels={days} values={dowAvg} />
          </div>
        </div>

        {/* Chart 6: Budget vs Actual Burn */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Budget Target vs Actual</h3>
              <p className="text-xs text-slate-400">Comparison of current allowance and current burn</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Control</span>
          </div>
          <div className="h-64 relative">
            <BudgetVsActualChart budget={masterBudget} actual={totalThisMonth} />
          </div>
        </div>
      </div>
    </div>
  );
};
