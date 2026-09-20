export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Education'
  | 'Healthcare'
  | 'Entertainment'
  | 'Groceries'
  | 'Rent'
  | 'Utilities'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'UPI'
  | 'Bank Transfer'
  | 'Other';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  description?: string;
  created_at?: string;
}

export interface Budget {
  id: number;
  category: string; // 'Overall' or specific category
  monthly_limit: number;
  month: number;
  year: number;
}

export interface InsightAlert {
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  metric?: string;
}

export interface AIInsightsData {
  summary: string;
  top_concerns: string[];
  saving_tips: string[];
  budget_suggestions: string[];
  priority_action: string;
  disclaimer: string;
}

export interface PredictionData {
  has_sufficient_data: boolean;
  message?: string;
  predicted_month_name: string;
  predicted_year: number;
  predicted_total: number;
  expected_change_pct: number;
  confidence_score: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  predicted_categories: Record<string, number>;
  historical_chart_data: Array<{
    label: string;
    amount: number;
    is_predicted?: boolean;
  }>;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  total_expenses: number;
  total_transactions: number;
  average_expense: number;
  median_expense: number;
  std_dev_expense: number;
  maximum_expense: number;
  minimum_expense: number;
  most_expensive_category: string;
  most_frequent_category: string;
  category_breakdown: CategoryBreakdown[];
  daily_averages_by_weekday: Record<string, number>;
  largest_transactions: Array<{
    id: number;
    title: string;
    amount: number;
    category: string;
    date: string;
  }>;
  monthly_totals: Array<{
    month: string;
    total: number;
    count: number;
  }>;
}

export interface DashboardSummary {
  total_spending_this_month: number;
  total_spending_last_month: number;
  mom_change_percentage: number;
  average_daily_spending: number;
  highest_spending_category: string;
  highest_category_amount: number;
  total_transactions_overall: number;
  overall_budget: number;
  budget_used_percentage: number;
  remaining_budget: number;
  predicted_next_month: number;
  prediction_confidence: number;
}

export type ActiveTab =
  | 'dashboard'
  | 'expenses'
  | 'add-expense'
  | 'analytics'
  | 'predictive-insights'
  | 'ai-tips'
  | 'budget';
