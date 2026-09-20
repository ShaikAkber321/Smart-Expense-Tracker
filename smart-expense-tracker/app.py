"""
Smart Expense Tracker with Predictive Insights
Main Application Entry Point (Flask + SQLAlchemy + MySQL)
"""

import os
from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS
from config import config_by_name
from models import db, Expense, Budget
from routes import expense_bp, dashboard_bp, prediction_bp, ai_bp

def create_app(config_name=None):
    """Application factory pattern."""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates"
    )

    # Load configuration
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    # Enable Cross-Origin Resource Sharing
    CORS(app)

    # Initialize extensions
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(expense_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(ai_bp)

    # Page Routes
    @app.route("/")
    def index():
        return render_template("dashboard.html", active_page="dashboard")

    @app.route("/dashboard")
    def dashboard_page():
        return render_template("dashboard.html", active_page="dashboard")

    @app.route("/expenses")
    def expenses_page():
        return render_template("expenses.html", active_page="expenses")

    @app.route("/add-expense")
    def add_expense_page():
        return render_template("add_expense.html", active_page="add_expense")

    @app.route("/analytics")
    def analytics_page():
        return render_template("analytics.html", active_page="analytics")

    @app.route("/predictive-insights")
    def predictive_insights_page():
        return render_template("insights.html", active_page="predictive_insights")

    @app.route("/ai-tips")
    def ai_tips_page():
        return render_template("insights.html", active_page="ai_tips", tab="ai")

    @app.route("/budget")
    def budget_page():
        return render_template("budget.html", active_page="budget")

    # Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "success": False,
            "message": "Resource not found",
            "errors": ["The requested endpoint does not exist."]
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Internal Server Error",
            "errors": ["An unexpected error occurred. Please contact system administrator."]
        }), 500

    return app

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        # Auto-create tables if they do not exist
        try:
            db.create_all()
            print("✓ Database tables verified/created successfully.")
        except Exception as e:
            print(f"! Notice: Database initialization deferred ({e})")

    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
