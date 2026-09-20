"""
Prediction Routes
Handles time-series forecasting queries and model evaluation statistics.
"""

from datetime import date
from flask import Blueprint, jsonify
from models import Expense
from services.prediction_service import PredictionService
from utils.helpers import standard_response

prediction_bp = Blueprint("prediction", __name__, url_prefix="/api/prediction")

@prediction_bp.route("", methods=["GET"])
def get_prediction():
    """
    Returns next month's expense prediction:
    - Predicted total spending
    - Expected percentage change
    - Category-level breakdown predictions
    - Historical actuals vs predicted sequence
    - Confidence score & confidence intervals
    - Insufficient data detection
    """
    try:
        all_expenses = Expense.query.order_by(Expense.expense_date.asc()).all()
        forecast = PredictionService.predict_next_month(all_expenses, date.today())

        return standard_response(
            success=True,
            data=forecast,
            message="Forecasting analysis completed successfully."
        )
    except Exception as e:
        return standard_response(
            success=False,
            message="Prediction calculation failed.",
            errors=[str(e)],
            status_code=500
        )
