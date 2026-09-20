import { Expense, PredictionData } from '../types';

export function predictNextMonth(expenses: Expense[], referenceDate: Date = new Date(2026, 2, 20)): PredictionData {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group by YYYY-MM
  const monthTotals: Record<string, number> = {};
  const monthCategories: Record<string, Record<string, number>> = {};

  for (const exp of expenses) {
    const ym = exp.expense_date.substring(0, 7);
    monthTotals[ym] = (monthTotals[ym] || 0) + Number(exp.amount);
    if (!monthCategories[ym]) monthCategories[ym] = {};
    monthCategories[ym][exp.category] = (monthCategories[ym][exp.category] || 0) + Number(exp.amount);
  }

  const sortedMonths = Object.keys(monthTotals).sort();
  const distinctMonthCount = sortedMonths.length;

  const currentMonthIdx = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();
  const nextMonthIdx = (currentMonthIdx + 1) % 12;
  const nextYear = nextMonthIdx === 0 ? currentYear + 1 : currentYear;
  const nextMonthName = `${fullMonthNames[nextMonthIdx]} ${nextYear}`;

  if (distinctMonthCount < 3) {
    return {
      has_sufficient_data: false,
      message: 'Not enough historical data for a reliable prediction. At least 3 months of expenses are required to forecast trends.',
      predicted_month_name: nextMonthName,
      predicted_year: nextYear,
      predicted_total: 0,
      expected_change_pct: 0,
      confidence_score: 0,
      confidence_interval: { lower: 0, upper: 0 },
      predicted_categories: {},
      historical_chart_data: [],
    };
  }

  // Monthly values sequence
  const yVals = sortedMonths.map(m => monthTotals[m]);
  const n = yVals.length;

  // 1. Simple Linear Regression: y = m*x + c
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += yVals[i];
    sumXY += i * yVals[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  const linearPred = Math.max(0, slope * n + intercept);

  // 2. Weighted Moving Average (last 3 months)
  const last3 = yVals.slice(-3);
  const weights = [0.2, 0.3, 0.5];
  const wma = last3[0] * weights[0] + last3[1] * weights[1] + last3[2] * weights[2];

  // 3. Ensemble
  const predictedTotal = Math.round((0.4 * linearPred + 0.6 * wma) * 100) / 100;

  // Expected MoM shift
  const lastMonthTotal = yVals[yVals.length - 1];
  const changePct = lastMonthTotal > 0
    ? Math.round(((predictedTotal - lastMonthTotal) / lastMonthTotal) * 1000) / 10
    : 0;

  // Model confidence & interval
  // Measure MAPE on historical sequence
  let totalError = 0;
  for (let i = 0; i < n; i++) {
    const fitted = slope * i + intercept;
    if (yVals[i] > 0) {
      totalError += Math.abs(yVals[i] - fitted) / yVals[i];
    }
  }
  const mape = totalError / (n || 1);
  const confidenceScore = Math.min(95, Math.max(55, Math.round((1.0 - mape) * 100)));
  const margin = Math.round(predictedTotal * (mape * 0.75));

  // Category proportions (last 3 months average)
  const recentMonths = sortedMonths.slice(-3);
  const catSums: Record<string, number> = {};
  let totalRecent = 0;
  for (const m of recentMonths) {
    for (const [cat, amt] of Object.entries(monthCategories[m] || {})) {
      catSums[cat] = (catSums[cat] || 0) + amt;
      totalRecent += amt;
    }
  }

  const predictedCategories: Record<string, number> = {};
  for (const [cat, sum] of Object.entries(catSums)) {
    const ratio = totalRecent > 0 ? sum / totalRecent : 0;
    predictedCategories[cat] = Math.round(predictedTotal * ratio);
  }

  // Chart data: trailing 6 months + next month predicted
  const chartMonths = sortedMonths.slice(-6);
  const historicalChartData = chartMonths.map(m => {
    const [yr, mo] = m.split('-');
    const label = `${monthNames[parseInt(mo, 10) - 1]} '${yr.slice(2)}`;
    return {
      label,
      amount: Math.round(monthTotals[m]),
      is_predicted: false,
    };
  });

  historicalChartData.push({
    label: `${monthNames[nextMonthIdx]} '${String(nextYear).slice(2)} (Pred)`,
    amount: Math.round(predictedTotal),
    is_predicted: true,
  });

  return {
    has_sufficient_data: true,
    predicted_month_name: nextMonthName,
    predicted_year: nextYear,
    predicted_total: predictedTotal,
    expected_change_pct: changePct,
    confidence_score: confidenceScore,
    confidence_interval: {
      lower: Math.max(0, predictedTotal - margin),
      upper: predictedTotal + margin,
    },
    predicted_categories: predictedCategories,
    historical_chart_data: historicalChartData,
  };
}
