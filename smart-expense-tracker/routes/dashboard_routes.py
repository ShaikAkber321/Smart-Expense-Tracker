"""
Dashboard & Analytics Routes
Serves aggregated dashboard metrics, charts data, and budget controls.
"""

from datetime import datetime, date
from flask import Blueprint, jsonify, request
from models import db, Expense, Budget
from services.analytics_service import AnalyticsService
from services.prediction_service import PredictionService
from utils.validators import validate_budget_data
from utils.helpers import standard_response

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api")

@dashboard_bp.route("/dashboard", methods=["GET"])
def get_dashboard_data():
    """Returns complete summary statistics and Chart.js datasets for the dashboard."""
    try:
        all_expenses = Expense.query.order_by(Expense.expense_date.asc()).all()
        today = date.today()

        # 1. Summary Cards
        summary = AnalyticsService.get_summary_metrics(all_expenses, today)
        prediction = PredictionService.predict_next_month(all_expenses, today)

        # Inject predicted next month total into dashboard summary
        summary["predicted_next_month_spending"] = prediction.get("predicted_total", 0.0)
        summary["prediction_confidence"] = prediction.get("confidence_score", 0)

        # 2. Charts Data
        analytics = AnalyticsService.get_full_analytics(all_expenses)

        # Monthly Spending Trend Chart Data
        monthly_labels = [m["month"] for m in analytics["monthly_totals"][-6:]]
        monthly_values = [m["total"] for m in analytics["monthly_totals"][-6:]]

        # Category-wise Spending Chart Data
        cat_labels = [c["category"] for c in analytics["category_breakdown"]]
        cat_values = [c["total"] for c in analytics["category_breakdown"]]

        # Payment Method Distribution Data
        pm_labels = [p["payment_method"] for p in analytics["payment_methods_breakdown"]]
        pm_values = [p["total"] for p in analytics["payment_methods_breakdown"]]

        # Daily Spending (by day of week)
        daily_dow = analytics["daily_averages_by_weekday"]

        # Budget vs Actual Spending Comparison
        current_budgets = Budget.query.filter_by(month=today.month, year=today.year).all()
        budget_dict = {b.category: float(b.monthly_limit) for b in current_budgets}

        return standard_response(
            success=True,
            data={
                "summary": summary,
                "prediction_summary": {
                    "predicted_total": prediction.get("predicted_total", 0.0),
                    "expected_change_pct": prediction.get("expected_change_pct", 0.0),
                    "has_sufficient_data": prediction.get("has_sufficient_data", False),
                },
                "charts": {
                    "monthly_trend": {
                        "labels": monthly_labels,
                        "values": monthly_values,
                    },
                    "category_distribution": {
                        "labels": cat_labels,
                        "values": cat_values,
                    },
                    "payment_methods": {
                        "labels": pm_labels,
                        "values": pm_values,
                    },
                    "daily_dow": {
                        "labels": list(daily_dow.keys()),
                        "values": list(daily_dow.values()),
                    },
                    "historical_vs_predicted": prediction.get("historical_chart_data", []),
                    "budget_comparison": {
                        "overall_budget": summary["overall_budget"],
                        "actual_spent": summary["total_spending_this_month"],
                        "remaining": summary["remaining_budget"],
                    }
                }
            },
            message="Dashboard data retrieved."
        )
    except Exception as e:
        return standard_response(
            success=False,
            message="Failed to load dashboard data.",
            errors=[str(e)],
            status_code=500
        )


@dashboard_bp.route("/analytics", methods=["GET"])
def get_analytics():
    """Deep analytics metrics across all recorded transactions."""
    try:
        all_expenses = Expense.query.order_by(Expense.expense_date.asc()).all()
        analytics_data = AnalyticsService.get_full_analytics(all_expenses)
        return standard_response(
            success=True,
            data=analytics_data,
            message="Analytics computed."
        )
    except Exception as e:
        return standard_response(
            success=False,
            message="Failed to calculate analytics.",
            errors=[str(e)],
            status_code=500
        )


@dashboard_bp.route("/insights", methods=["GET"])
def get_smart_insights():
    """Rule-based pattern recognition alerts."""
    try:
        all_expenses = Expense.query.order_by(Expense.expense_date.asc()).all()
        insights = AnalyticsService.generate_smart_insights(all_expenses, date.today())
        return standard_response(
            success=True,
            data={"insights": insights},
            message="Insights generated."
        )
    except Exception as e:
        return standard_response(
            success=False,
            message="Failed to generate smart insights.",
            errors=[str(e)],
            status_code=500
        )


@dashboard_bp.route("/budget", methods=["GET", "POST"])
def manage_budget():
    """Retrieve or set budgets for categories or overall month."""
    today = date.today()
    if request.method == "GET":
        month = int(request.args.get("month", today.month))
        year = int(request.args.get("year", today.year))

        budgets = Budget.query.filter_by(month=month, year=year).all()

        # Compute actual spending per category for this period
        all_expenses = Expense.query.filter(
            db.extract("month", Expense.expense_date) == month,
            db.extract("year", Expense.expense_date) == year
        ).all()

        cat_spend = {}
        for exp in all_expenses:
            cat_spend[exp.category] = cat_spend.get(exp.category, 0.0) + float(exp.amount)

        overall_spent = sum(cat_spend.values())

        # Build detailed budget status with thresholds
        budget_list = []
        overall_budget_val = 30000.0

        for b in budgets:
            b_dict = b.to_dict()
            if b.category == "Overall":
                actual = overall_spent
                overall_budget_val = b_dict["monthly_limit"]
            else:
                actual = cat_spend.get(b.category, 0.0)

            limit = b_dict["monthly_limit"]
            remaining = max(0.0, limit - actual)
            used_pct = round((actual / limit * 100) if limit > 0 else 0, 1)

            if used_pct >= 100:
                status = "exceeded"
            elif used_pct >= 90:
                status = "critical"
            elif used_pct >= 75:
                status = "warning"
            else:
                status = "good"

            b_dict.update({
                "actual_spent": round(actual, 2),
                "remaining": round(remaining, 2),
                "used_percentage": used_pct,
                "status": status,
            })
            budget_list.append(b_dict)

        return standard_response(
            success=True,
            data={
                "month": month,
                "year": year,
                "budgets": budget_list,
                "overall_spent": round(overall_spent, 2),
                "overall_limit": round(overall_budget_val, 2),
            },
            message="Budgets retrieved."
        )

    # POST - Create or Update budget limit
    data = request.get_json(silent=True) or {}
    is_valid, cleaned, errors = validate_budget_data(data)
    if not is_valid:
        return standard_response(success=False, message="Validation error", errors=errors, status_code=400)

    try:
        existing = Budget.query.filter_by(
            category=cleaned["category"],
            month=cleaned["month"],
            year=cleaned["year"]
        ).first()

        if existing:
            existing.monthly_limit = cleaned["monthly_limit"]
            record = existing
            msg = f"Budget for {cleaned['category']} updated."
        else:
            record = Budget(
                category=cleaned["category"],
                monthly_limit=cleaned["monthly_limit"],
                month=cleaned["month"],
                year=cleaned["year"]
            )
            db.session.add(record)
            msg = f"Budget for {cleaned['category']} created."

        db.session.commit()
        return standard_response(success=True, data=record.to_dict(), message=msg, status_code=200)
    except Exception as e:
        db.session.rollback()
        return standard_response(success=False, message="Failed to save budget.", errors=[str(e)], status_code=500)


@dashboard_bp.route("/budget/<int:budget_id>", methods=["DELETE"])
def delete_budget(budget_id):
    """Delete a budget item."""
    b = Budget.query.get(budget_id)
    if not b:
        return standard_response(success=False, message="Budget not found.", status_code=404)
    try:
        db.session.delete(b)
        db.session.commit()
        return standard_response(success=True, message="Budget deleted.")
    except Exception as e:
        db.session.rollback()
        return standard_response(success=False, message="Failed to delete budget.", errors=[str(e)], status_code=500)
