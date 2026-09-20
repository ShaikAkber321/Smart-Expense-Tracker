import { Expense, AnalyticsData, CategoryBreakdown } from '../types';

export function computeAnalytics(expenses: Expense[]): AnalyticsData {
  if (expenses.length === 0) {
    return {
      total_expenses: 0,
      total_transactions: 0,
      average_expense: 0,
      median_expense: 0,
      std_dev_expense: 0,
      maximum_expense: 0,
      minimum_expense: 0,
      most_expensive_category: 'None',
      most_frequent_category: 'None',
      category_breakdown: [],
      daily_averages_by_weekday: {},
      largest_transactions: [],
      monthly_totals: [],
    };
  }

  const amounts = expenses.map(e => Number(e.amount)).sort((a, b) => a - b);
  const total = amounts.reduce((acc, curr) => acc + curr, 0);
  const count = amounts.length;
  const avg = Math.round((total / count) * 100) / 100;

  // Median
  const mid = Math.floor(count / 2);
  const median = count % 2 !== 0 ? amounts[mid] : Math.round(((amounts[mid - 1] + amounts[mid]) / 2) * 100) / 100;

  // Standard Deviation
  const variance = amounts.reduce((acc, curr) => acc + Math.pow(curr - avg, 2), 0) / count;
  const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;

  const max = amounts[amounts.length - 1];
  const min = amounts[0];

  // Category aggregates
  const catMap: Record<string, { total: number; count: number }> = {};
  for (const exp of expenses) {
    if (!catMap[exp.category]) {
      catMap[exp.category] = { total: 0, count: 0 };
    }
    catMap[exp.category].total += Number(exp.amount);
    catMap[exp.category].count += 1;
  }

  const categoryBreakdown: CategoryBreakdown[] = Object.entries(catMap).map(([category, stats]) => ({
    category,
    total: Math.round(stats.total * 100) / 100,
    count: stats.count,
    percentage: Math.round((stats.total / total) * 1000) / 10,
  })).sort((a, b) => b.total - a.total);

  const mostExpensiveCat = categoryBreakdown[0]?.category || 'None';
  const mostFrequentCat = [...categoryBreakdown].sort((a, b) => b.count - a.count)[0]?.category || 'None';

  // Day of week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const daySums: Record<string, { total: number; count: number }> = {};
  days.forEach(d => { daySums[d] = { total: 0, count: 0 }; });

  for (const exp of expenses) {
    const d = new Date(exp.expense_date + 'T00:00:00');
    const dayIndex = (d.getDay() + 6) % 7; // Monday = 0
    const dayName = days[dayIndex];
    if (daySums[dayName]) {
      daySums[dayName].total += Number(exp.amount);
      daySums[dayName].count += 1;
    }
  }

  const dailyAveragesByWeekday: Record<string, number> = {};
  days.forEach(d => {
    dailyAveragesByWeekday[d] = daySums[d].count > 0 ? Math.round((daySums[d].total / daySums[d].count) * 100) / 100 : 0;
  });

  // Largest transactions
  const largestTransactions = [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      title: e.title,
      amount: Number(e.amount),
      category: e.category,
      date: e.expense_date,
    }));

  // Monthly totals
  const monthMap: Record<string, { total: number; count: number }> = {};
  for (const exp of expenses) {
    const m = exp.expense_date.substring(0, 7); // YYYY-MM
    if (!monthMap[m]) monthMap[m] = { total: 0, count: 0 };
    monthMap[m].total += Number(exp.amount);
    monthMap[m].count += 1;
  }

  const monthlyTotals = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
    }));

  return {
    total_expenses: Math.round(total * 100) / 100,
    total_transactions: count,
    average_expense: avg,
    median_expense: median,
    std_dev_expense: stdDev,
    maximum_expense: max,
    minimum_expense: min,
    most_expensive_category: mostExpensiveCat,
    most_frequent_category: mostFrequentCat,
    category_breakdown: categoryBreakdown,
    daily_averages_by_weekday: dailyAveragesByWeekday,
    largest_transactions: largestTransactions,
    monthly_totals: monthlyTotals,
  };
}
