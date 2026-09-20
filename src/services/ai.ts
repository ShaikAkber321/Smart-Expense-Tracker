import { AIInsightsData, Expense, Budget } from '../types';

export function generateAISavingTips(
  expenses: Expense[],
  budgets: Budget[],
  monthSpending: number,
  lastMonthSpending: number,
  predictedNextMonth: number
): AIInsightsData {
  const overallBudget = budgets.find(b => b.category === 'Overall')?.monthly_limit || 50000;
  const momChange = lastMonthSpending > 0
    ? Math.round(((monthSpending - lastMonthSpending) / lastMonthSpending) * 1000) / 10
    : 0;

  // Compute category breakdown for this month
  const currentMonthPrefix = '2026-03';
  const thisMonthExpenses = expenses.filter(e => e.expense_date.startsWith(currentMonthPrefix));
  const catSums: Record<string, number> = {};
  for (const e of thisMonthExpenses) {
    catSums[e.category] = (catSums[e.category] || 0) + Number(e.amount);
  }

  const sortedCats = Object.entries(catSums).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCats[0] ? sortedCats[0][0] : 'Groceries';
  const topCategoryAmt = sortedCats[0] ? sortedCats[0][1] : 0;
  const secondCategory = sortedCats[1] ? sortedCats[1][0] : 'Food';
  const secondCategoryAmt = sortedCats[1] ? sortedCats[1][1] : 0;

  const budgetUsedPct = Math.round((monthSpending / overallBudget) * 100);

  // Generate tactical, context-specific insights
  const concerns: string[] = [];
  const tips: string[] = [];
  const suggestions: string[] = [];

  // 1. Budget & MoM Concerns
  if (budgetUsedPct >= 90) {
    concerns.push(`Overall monthly consumption has reached ${budgetUsedPct}% of your ₹${overallBudget.toLocaleString('en-IN')} limit with days remaining.`);
  } else if (budgetUsedPct >= 75) {
    concerns.push(`Monthly spending is currently at ${budgetUsedPct}% of allowance; pacing suggests potential month-end budget pressure.`);
  } else {
    concerns.push(`Current burn rate is moderate (${budgetUsedPct}% used), leaving a safety reserve of ₹${Math.max(0, overallBudget - monthSpending).toLocaleString('en-IN')}.`);
  }

  if (topCategoryAmt > 0) {
    concerns.push(`${topCategory} represents the largest cash outflow at ₹${topCategoryAmt.toLocaleString('en-IN')} (${Math.round((topCategoryAmt / (monthSpending || 1)) * 100)}% of monthly spend).`);
  }
  if (secondCategoryAmt > 3000) {
    concerns.push(`Discretionary spending in ${secondCategory} (₹${secondCategoryAmt.toLocaleString('en-IN')}) shows elevated weekend ticket sizes.`);
  }

  // 2. Actionable Saving Tips
  if (topCategory === 'Rent') {
    tips.push('Fixed housing expense is locked; focus discretionary optimization on food delivery, utilities, and impulse online purchases.');
  }
  if (catSums['Food'] && catSums['Food'] > 3000) {
    tips.push(`Consolidate dining out and weekend food orders: adopting meal prep 2 days a week can reclaim approx ₹2,500 monthly.`);
  }
  if (catSums['Shopping'] && catSums['Shopping'] > 4000) {
    tips.push('Institute a mandatory 48-hour cool-off rule for non-essential e-commerce items over ₹1,500 to curb impulse checkouts.');
  }
  if (catSums['Utilities'] && catSums['Utilities'] > 2500) {
    tips.push('Inspect high-drain appliances and seasonal cooling/heating devices; smart power strips can trim standby draw by 5-8%.');
  }
  tips.push('Automate a recurring transfer of 15% of surplus income to a liquid savings buffer at the start of each billing cycle.');

  // 3. Budget Adjustments
  const predictedMoM = monthSpending > 0 ? Math.round(((predictedNextMonth - monthSpending) / monthSpending) * 100) : 0;
  if (predictedMoM > 5) {
    suggestions.push(`Upcoming month forecast projects an increase of +${predictedMoM}%. Pre-emptively reduce discretionary limits by 10%.`);
  } else {
    suggestions.push(`Stable run-rate projected for next month (₹${predictedNextMonth.toLocaleString('en-IN')}). Maintain current allowance allocations.`);
  }
  suggestions.push(`Establish a strict ₹${Math.round((overallBudget * 0.12) / 100) * 100} ceiling on dining and takeout.`);
  suggestions.push(`Keep essential grocery spending capped at ₹${Math.round((overallBudget * 0.20) / 100) * 100} using bulk staples.`);

  // 4. Executive Summary & Priority Action
  const summary = `You have spent ₹${monthSpending.toLocaleString('en-IN')} out of your ₹${overallBudget.toLocaleString('en-IN')} monthly target (${budgetUsedPct}% used). Expenditure shifted ${momChange >= 0 ? '+' : ''}${momChange}% compared to last month, driven primarily by ${topCategory} and ${secondCategory}. Next month is projected at ₹${predictedNextMonth.toLocaleString('en-IN')}.`;

  const priorityAction = budgetUsedPct >= 85
    ? `Halt discretionary non-essential purchases in ${secondCategory} for the rest of the cycle to keep overall spending below ₹${overallBudget.toLocaleString('en-IN')}.`
    : `Allocate the remaining ₹${Math.max(0, overallBudget - monthSpending).toLocaleString('en-IN')} unspent budget into your emergency or investment fund before month end.`;

  return {
    summary,
    top_concerns: concerns,
    saving_tips: tips.slice(0, 4),
    budget_suggestions: suggestions,
    priority_action: priorityAction,
    disclaimer: 'AI-generated financial guidance for informational and self-budgeting analysis. Not certified professional or investment advice.',
  };
}
