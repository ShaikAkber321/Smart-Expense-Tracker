/**
 * Dashboard Controller
 * Fetches /api/dashboard and initializes cards & Chart.js instances.
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/dashboard');
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const { summary, prediction_summary, charts } = json.data;

    // Update KPI Cards
    document.getElementById('statThisMonth').innerText = `₹${summary.total_spending_this_month.toLocaleString('en-IN')}`;
    document.getElementById('statLastMonth').innerText = `₹${summary.total_spending_last_month.toLocaleString('en-IN')}`;
    document.getElementById('statDailyAvg').innerText = `₹${summary.average_daily_spending.toLocaleString('en-IN')}`;
    document.getElementById('statTxnCount').innerText = `${summary.total_transactions_overall} total transactions`;

    // MoM change
    const mom = summary.mom_change_percentage;
    const momBadge = document.getElementById('statMomBadge');
    momBadge.innerText = `${mom > 0 ? '+' : ''}${mom}%`;
    momBadge.className = `font-semibold ${mom > 0 ? 'text-rose-600' : 'text-emerald-600'}`;

    // Prediction Summary
    document.getElementById('statPredicted').innerText = `₹${prediction_summary.predicted_total.toLocaleString('en-IN')}`;
    const predChange = document.getElementById('statPredChange');
    predChange.innerText = `${prediction_summary.expected_change_pct > 0 ? '+' : ''}${prediction_summary.expected_change_pct}% expected`;
    if (summary.prediction_confidence) {
      document.getElementById('statPredConfidence').innerText = `Confidence: ${summary.prediction_confidence}%`;
    }

    // Top Category
    document.getElementById('statTopCat').innerText = summary.highest_spending_category;
    document.getElementById('statTopCatAmt').innerText = `₹${summary.highest_category_amount.toLocaleString('en-IN')} spent`;

    // Budget Progress
    const budgetPct = summary.budget_used_percentage;
    document.getElementById('budgetPctText').innerText = `${budgetPct}% used`;
    const bar = document.getElementById('budgetProgressBar');
    bar.style.width = `${Math.min(100, budgetPct)}%`;
    if (budgetPct >= 100) bar.className = 'h-full bg-rose-600 rounded-full transition-all duration-500';
    else if (budgetPct >= 90) bar.className = 'h-full bg-amber-500 rounded-full transition-all duration-500';
    else if (budgetPct >= 75) bar.className = 'h-full bg-yellow-500 rounded-full transition-all duration-500';

    document.getElementById('statBudgetLimit').innerText = `₹${summary.overall_budget.toLocaleString('en-IN')}`;
    document.getElementById('statBudgetRemaining').innerText = `₹${summary.remaining_budget.toLocaleString('en-IN')}`;

    // Render 6 Charts
    if (window.AppCharts) {
      // 1. Monthly Trend
      AppCharts.renderMonthlyTrend('monthlyTrendChart', charts.monthly_trend.labels, charts.monthly_trend.values);

      // 2. Category Donut
      AppCharts.renderCategoryDonut('categoryChart', charts.category_distribution.labels, charts.category_distribution.values);

      // 3. Historical vs Prediction
      AppCharts.renderForecastComparison('forecastComparisonChart', charts.historical_vs_predicted);

      // 4. Payment Methods
      AppCharts.renderPaymentMethods('paymentMethodChart', charts.payment_methods.labels, charts.payment_methods.values);

      // 5. Daily DOW
      AppCharts.renderDailySpending('dailySpendingChart', charts.daily_dow.labels, charts.daily_dow.values);

      // 6. Budget vs Actual
      AppCharts.renderBudgetVsActual(
        'budgetComparisonChart',
        charts.budget_comparison.overall_budget,
        charts.budget_comparison.actual_spent
      );
    }

    // Fetch Smart Insights for Alerts
    loadSmartInsights();

  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
});

async function loadSmartInsights() {
  try {
    const res = await fetch('/api/insights');
    const json = await res.json();
    if (!json.success || !json.data.insights) return;

    const alertsContainer = document.getElementById('dashboardAlerts');
    if (!alertsContainer) return;

    alertsContainer.innerHTML = json.data.insights.slice(0, 2).map(ins => {
      let bg = 'bg-indigo-50 border-indigo-200 text-indigo-900';
      if (ins.type === 'danger') bg = 'bg-rose-50 border-rose-200 text-rose-900';
      if (ins.type === 'warning') bg = 'bg-amber-50 border-amber-200 text-amber-900';
      if (ins.type === 'success') bg = 'bg-emerald-50 border-emerald-200 text-emerald-900';

      return `
        <div class="p-3.5 rounded-xl border ${bg} text-xs flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="font-bold">${ins.title}:</span>
            <span>${ins.message}</span>
          </div>
          <a href="/predictive-insights?tab=ai" class="text-xs underline font-semibold hover:opacity-80">View Tips</a>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error(e);
  }
}
