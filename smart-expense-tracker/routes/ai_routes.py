"""
AI Routes
Handles integration with OpenAI for intelligent spending analysis and saving recommendations.
"""

from datetime import date
from flask import Blueprint, jsonify, request
from models import Expense, Budget
from services.analytics_service import AnalyticsService
from services.prediction_service import PredictionService
from services.openai_service import OpenAIService
from utils.helpers import standard_response

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@ai_bp.route("/insights", methods=["POST"])
def generate_ai_insights():
    """
    Generates tailored financial guidance via OpenAI.
    Extracts summarized metrics and transmits structured summary to avoid leaking raw transactions.
    """
    try:
        today = date.today()
        all_expenses = Expense.query.order_by(Expense.expense_date.asc()).all()

        # Gather summary metrics
        metrics = AnalyticsService.get_summary_metrics(all_expenses, today)
        prediction = PredictionService.predict_next_month(all_expenses, today)
        analytics = AnalyticsService.get_full_analytics(all_expenses)

        # Build category map for current month or overall recent
        category_spending = {
            c["category"]: c["total"] for c in analytics.get("category_breakdown", [])[:8]
        }

        # Allow client override if testing with specific values
        client_data = request.get_json(silent=True) or {}

        summary_payload = {
            "monthly_spending": client_data.get("monthly_spending", metrics["total_spending_this_month"]),
            "budget": client_data.get("budget", metrics["overall_budget"]),
            "mom_change_pct": client_data.get("mom_change_pct", metrics["mom_change_percentage"]),
            "predicted_next_month": client_data.get("predicted_next_month", prediction.get("predicted_total", 0.0)),
            "category_spending": client_data.get("category_spending", category_spending),
        }

        ai_result = OpenAIService.generate_savings_insights(summary_payload)

        return standard_response(
            success=True,
            data=ai_result,
            message="AI financial recommendations generated."
        )

    except Exception as e:
        return standard_response(
            success=False,
            message="Error generating AI recommendations.",
            errors=[str(e)],
            status_code=500
        )
