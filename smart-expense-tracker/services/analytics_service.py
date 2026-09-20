"""
Analytics Service
Performs data analysis, statistical computations, and pattern recognition
using pandas and NumPy.
"""

from datetime import datetime, date, timedelta
import pandas as pd
import numpy as np
from models.expense import Expense
from models.budget import Budget
from utils.helpers import calculate_percentage_change

class AnalyticsService:
    @staticmethod
    def _expenses_to_dataframe(expenses):
        """Converts SQLAlchemy Expense models list to a pandas DataFrame."""
        if not expenses:
            return pd.DataFrame(columns=[
                "id", "title", "amount", "category", "expense_date", "payment_method"
            ])

        records = []
        for e in expenses:
            records.append({
                "id": e.id,
                "title": e.title,
                "amount": float(e.amount),
                "category": e.category,
                "expense_date": pd.to_datetime(e.expense_date),
                "payment_method": e.payment_method,
            })
        df = pd.DataFrame(records)
        df["expense_date"] = pd.to_datetime(df["expense_date"])
        df["year_month"] = df["expense_date"].dt.to_period("M")
        df["day_of_week"] = df["expense_date"].dt.day_name()
        return df

    @classmethod
    def get_summary_metrics(cls, expenses, current_date=None):
        """
        Calculates core metrics for the dashboard:
        - Total spending this month
        - Total spending last month
        - Month-over-month % change
        - Average daily spending this month
        - Highest spending category this month
        - Number of transactions
        - Current monthly budget and remaining budget
        """
        if current_date is None:
            current_date = date.today()

        current_year = current_date.year
        current_month = current_date.month

        # Determine last month and year
        if current_month == 1:
            last_month = 12
            last_year = current_year - 1
        else:
            last_month = current_month - 1
            last_year = current_year

        df = cls._expenses_to_dataframe(expenses)

        if df.empty:
            return {
                "total_spending_this_month": 0.0,
                "total_spending_last_month": 0.0,
                "mom_change_percentage": 0.0,
                "mom_trend": "stable",
                "average_daily_spending": 0.0,
                "highest_spending_category": "None",
                "highest_category_amount": 0.0,
                "transaction_count_this_month": 0,
                "total_transactions_overall": 0,
                "overall_budget": 0.0,
                "remaining_budget": 0.0,
                "budget_used_percentage": 0.0,
                "budget_status": "good",
            }

        # Current Month expenses
        current_month_mask = (df["expense_date"].dt.year == current_year) & (df["expense_date"].dt.month == current_month)
        curr_df = df[current_month_mask]

        # Last Month expenses
        last_month_mask = (df["expense_date"].dt.year == last_year) & (df["expense_date"].dt.month == last_month)
        last_df = df[last_month_mask]

        this_month_total = float(curr_df["amount"].sum()) if not curr_df.empty else 0.0
        last_month_total = float(last_df["amount"].sum()) if not last_df.empty else 0.0

        mom_change = calculate_percentage_change(this_month_total, last_month_total)
        mom_trend = "increasing" if mom_change > 0 else ("decreasing" if mom_change < 0 else "stable")

        # Average daily spending this month (based on elapsed days in current month)
        days_in_current_month = current_date.day if current_date.day > 0 else 1
        avg_daily = round(this_month_total / days_in_current_month, 2) if this_month_total > 0 else 0.0

        # Highest spending category this month
        if not curr_df.empty:
            cat_group = curr_df.groupby("category")["amount"].sum()
            highest_cat = cat_group.idxmax()
            highest_cat_amt = float(cat_group.max())
        else:
            highest_cat = "None"
            highest_cat_amt = 0.0

        # Query active overall budget for current month
        overall_budget_entry = Budget.query.filter_by(
            category="Overall", month=current_month, year=current_year
        ).first()

        budget_limit = float(overall_budget_entry.monthly_limit) if overall_budget_entry else 30000.0
        remaining_budget = max(0.0, round(budget_limit - this_month_total, 2))
        budget_used_pct = round((this_month_total / budget_limit) * 100.0, 1) if budget_limit > 0 else 0.0

        if budget_used_pct >= 100.0:
            budget_status = "exceeded"
        elif budget_used_pct >= 90.0:
            budget_status = "critical"
        elif budget_used_pct >= 75.0:
            budget_status = "warning"
        else:
            budget_status = "good"

        return {
            "total_spending_this_month": round(this_month_total, 2),
            "total_spending_last_month": round(last_month_total, 2),
            "mom_change_percentage": mom_change,
            "mom_trend": mom_trend,
            "average_daily_spending": avg_daily,
            "highest_spending_category": highest_cat,
            "highest_category_amount": round(highest_cat_amt, 2),
            "transaction_count_this_month": int(len(curr_df)),
            "total_transactions_overall": int(len(df)),
            "overall_budget": budget_limit,
            "remaining_budget": remaining_budget,
            "budget_used_percentage": budget_used_pct,
            "budget_status": budget_status,
        }

    @classmethod
    def get_full_analytics(cls, expenses):
        """
        Deep analytical statistical analysis across the entire dataset.
        Calculates mean, median, max, min, weekly totals, category totals & %,
        frequency metrics, and largest transactions.
        """
        df = cls._expenses_to_dataframe(expenses)

        if df.empty:
            return {
                "total_expenses": 0.0,
                "average_expense": 0.0,
                "median_expense": 0.0,
                "maximum_expense": 0.0,
                "minimum_expense": 0.0,
                "standard_deviation": 0.0,
                "category_breakdown": [],
                "payment_methods_breakdown": [],
                "monthly_totals": [],
                "weekly_totals": [],
                "daily_averages_by_weekday": {},
                "most_expensive_category": "N/A",
                "most_frequent_category": "N/A",
                "largest_transactions": [],
                "total_transactions": 0,
            }

        amounts = df["amount"]
        total_exp = float(amounts.sum())
        avg_exp = float(amounts.mean())
        median_exp = float(amounts.median())
        max_exp = float(amounts.max())
        min_exp = float(amounts.min())
        std_exp = float(amounts.std()) if len(amounts) > 1 else 0.0

        # Category totals and percentages
        cat_grouped = df.groupby("category")["amount"].agg(["sum", "count"]).reset_index()
        cat_grouped["percentage"] = (cat_grouped["sum"] / total_exp * 100.0).round(1)
        cat_grouped = cat_grouped.sort_values(by="sum", ascending=False)

        category_breakdown = [
            {
                "category": row["category"],
                "total": round(float(row["sum"]), 2),
                "count": int(row["count"]),
                "percentage": float(row["percentage"]),
            }
            for _, row in cat_grouped.iterrows()
        ]

        most_expensive_cat = category_breakdown[0]["category"] if category_breakdown else "N/A"
        most_freq_row = cat_grouped.sort_values(by="count", ascending=False).iloc[0] if not cat_grouped.empty else None
        most_frequent_cat = most_freq_row["category"] if most_freq_row is not None else "N/A"

        # Payment Methods
        pm_grouped = df.groupby("payment_method")["amount"].agg(["sum", "count"]).reset_index()
        pm_grouped["percentage"] = (pm_grouped["sum"] / total_exp * 100.0).round(1)
        payment_methods_breakdown = [
            {
                "payment_method": row["payment_method"],
                "total": round(float(row["sum"]), 2),
                "count": int(row["count"]),
                "percentage": float(row["percentage"]),
            }
            for _, row in pm_grouped.iterrows()
        ]

        # Monthly Totals
        df["month_str"] = df["expense_date"].dt.strftime("%Y-%m")
        monthly = df.groupby("month_str")["amount"].agg(["sum", "count"]).reset_index()
        monthly = monthly.sort_values("month_str")
        monthly_totals = [
            {
                "month": row["month_str"],
                "total": round(float(row["sum"]), 2),
                "count": int(row["count"]),
            }
            for _, row in monthly.iterrows()
        ]

        # Daily spending by Day of Week
        weekday_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        dow_avg = df.groupby("day_of_week")["amount"].mean().reindex(weekday_order).fillna(0)
        daily_averages_by_weekday = {day: round(float(dow_avg[day]), 2) for day in weekday_order}

        # Largest transactions (top 5)
        top_txns = df.sort_values(by="amount", ascending=False).head(5)
        largest_transactions = [
            {
                "id": int(row["id"]),
                "title": row["title"],
                "amount": round(float(row["amount"]), 2),
                "category": row["category"],
                "date": row["expense_date"].strftime("%Y-%m-%d"),
                "payment_method": row["payment_method"],
            }
            for _, row in top_txns.iterrows()
        ]

        return {
            "total_expenses": round(total_exp, 2),
            "average_expense": round(avg_exp, 2),
            "median_expense": round(median_exp, 2),
            "maximum_expense": round(max_exp, 2),
            "minimum_expense": round(min_exp, 2),
            "standard_deviation": round(std_exp, 2),
            "category_breakdown": category_breakdown,
            "payment_methods_breakdown": payment_methods_breakdown,
            "monthly_totals": monthly_totals,
            "daily_averages_by_weekday": daily_averages_by_weekday,
            "most_expensive_category": most_expensive_cat,
            "most_frequent_category": most_frequent_cat,
            "largest_transactions": largest_transactions,
            "total_transactions": int(len(df)),
        }

    @classmethod
    def generate_smart_insights(cls, expenses, current_date=None):
        """
        Rule-based pattern detection engine generating actionable alerts:
        - Category spending shifts
        - Approaching/exceeded budget
        - Large spike transactions
        - Positive spending drops
        """
        if current_date is None:
            current_date = date.today()

        metrics = cls.get_summary_metrics(expenses, current_date)
        df = cls._expenses_to_dataframe(expenses)
        insights = []

        # 1. Budget Warnings
        used_pct = metrics["budget_used_percentage"]
        if used_pct >= 100.0:
            insights.append({
                "type": "danger",
                "icon": "alert-circle",
                "title": "Monthly Budget Exceeded",
                "message": f"You have exceeded your monthly budget of ₹{metrics['overall_budget']:,.0f} by ₹{metrics['total_spending_this_month'] - metrics['overall_budget']:,.0f} ({used_pct}% used)."
            })
        elif used_pct >= 90.0:
            insights.append({
                "type": "warning",
                "icon": "alert-triangle",
                "title": "Critical Budget Threshold",
                "message": f"You have utilized {used_pct}% of your monthly budget with ₹{metrics['remaining_budget']:,.0f} remaining."
            })
        elif used_pct >= 75.0:
            insights.append({
                "type": "warning",
                "icon": "alert-circle",
                "title": "Approaching Monthly Budget",
                "message": f"You have used {used_pct}% of your budget for this month. Consider pacing discretionary expenses."
            })

        # 2. Month-over-Month Spending Trend
        mom = metrics["mom_change_percentage"]
        if mom > 15.0:
            insights.append({
                "type": "warning",
                "icon": "trending-up",
                "title": "Significant Spending Increase",
                "message": f"Total spending is up by {mom}% compared with last month (₹{metrics['total_spending_this_month']:,.0f} vs ₹{metrics['total_spending_last_month']:,.0f})."
            })
        elif mom < -10.0:
            insights.append({
                "type": "success",
                "icon": "trending-down",
                "title": "Positive Spending Reduction",
                "message": f"Great job! Your spending is down {abs(mom)}% compared to last month."
            })

        # 3. Category Shift Analysis
        if not df.empty and len(df) >= 5:
            current_month = current_date.month
            current_year = current_date.year
            last_month = 12 if current_month == 1 else current_month - 1
            last_year = current_year - 1 if current_month == 1 else current_year

            c_mask = (df["expense_date"].dt.year == current_year) & (df["expense_date"].dt.month == current_month)
            l_mask = (df["expense_date"].dt.year == last_year) & (df["expense_date"].dt.month == last_month)

            curr_cat = df[c_mask].groupby("category")["amount"].sum()
            last_cat = df[l_mask].groupby("category")["amount"].sum()

            for cat in curr_cat.index:
                c_amt = curr_cat[cat]
                l_amt = last_cat.get(cat, 0.0)
                if l_amt > 1000:
                    cat_change = calculate_percentage_change(c_amt, l_amt)
                    if cat_change >= 25.0:
                        insights.append({
                            "type": "warning",
                            "icon": "arrow-up-right",
                            "title": f"Surge in {cat}",
                            "message": f"{cat} spending increased by {cat_change}% this month (₹{c_amt:,.0f} vs ₹{l_amt:,.0f})."
                        })
                    elif cat_change <= -20.0:
                        insights.append({
                            "type": "success",
                            "icon": "arrow-down-right",
                            "title": f"Reduction in {cat}",
                            "message": f"Your {cat} spending decreased by {abs(cat_change)}% compared to last month."
                        })

        # 4. Outlier / Unusually Large Expense
        if not df.empty:
            avg_amount = df["amount"].mean()
            std_amount = df["amount"].std() if len(df) > 2 else 0.0
            outlier_threshold = avg_amount + (2.2 * std_amount) if std_amount > 0 else avg_amount * 3.0

            recent_mask = df["expense_date"] >= (pd.to_datetime(current_date) - pd.Timedelta(days=30))
            recent_df = df[recent_mask]
            outliers = recent_df[recent_df["amount"] > outlier_threshold]

            if not outliers.empty:
                top_outlier = outliers.sort_values("amount", ascending=False).iloc[0]
                insights.append({
                    "type": "info",
                    "icon": "sparkles",
                    "title": "Unusual High-Value Transaction",
                    "message": f"'{top_outlier['title']}' for ₹{top_outlier['amount']:,.0f} in {top_outlier['category']} was notably higher than your standard transaction average (₹{avg_amount:,.0f})."
                })

        # Default positive insight if no warnings
        if not insights:
            insights.append({
                "type": "success",
                "icon": "check-circle",
                "title": "Healthy Financial Trajectory",
                "message": "Your spending is balanced and well within designated limits for this billing cycle."
            })

        return insights
