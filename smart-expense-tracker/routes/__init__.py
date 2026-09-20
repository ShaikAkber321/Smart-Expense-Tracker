"""
Routes Package Initialization
Exports all Flask Blueprints.
"""

from routes.expense_routes import expense_bp
from routes.dashboard_routes import dashboard_bp
from routes.prediction_routes import prediction_bp
from routes.ai_routes import ai_bp

__all__ = ["expense_bp", "dashboard_bp", "prediction_bp", "ai_bp"]
