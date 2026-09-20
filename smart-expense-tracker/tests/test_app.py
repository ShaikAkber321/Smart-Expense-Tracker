"""
Automated Test Suite
Validates CRUD, filtering, dashboard calculations, prediction, analytics,
budget tracking, and validation error handling using pytest & in-memory database.
"""

import pytest
from datetime import date, datetime
from decimal import Decimal
from app import create_app
from models import db, Expense, Budget
from services.analytics_service import AnalyticsService
from services.prediction_service import PredictionService
from services.openai_service import OpenAIService

@pytest.fixture
def app():
    """Create and configure a clean testing app instance."""
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Test client for HTTP requests."""
    return app.test_client()

@pytest.fixture
def sample_expenses(app):
    """Populates test database with representative multi-month records."""
    records = [
        # Month 1
        Expense(title="Rent M1", amount=Decimal("20000.00"), category="Rent", expense_date=date(2026, 1, 1), payment_method="Bank Transfer"),
        Expense(title="Groceries M1", amount=Decimal("4000.00"), category="Groceries", expense_date=date(2026, 1, 5), payment_method="UPI"),
        Expense(title="Dining M1", amount=Decimal("2000.00"), category="Food", expense_date=date(2026, 1, 10), payment_method="Credit Card"),

        # Month 2
        Expense(title="Rent M2", amount=Decimal("20000.00"), category="Rent", expense_date=date(2026, 2, 1), payment_method="Bank Transfer"),
        Expense(title="Groceries M2", amount=Decimal("4500.00"), category="Groceries", expense_date=date(2026, 2, 5), payment_method="UPI"),
        Expense(title="Dining M2", amount=Decimal("2500.00"), category="Food", expense_date=date(2026, 2, 12), payment_method="Credit Card"),

        # Month 3
        Expense(title="Rent M3", amount=Decimal("20000.00"), category="Rent", expense_date=date(2026, 3, 1), payment_method="Bank Transfer"),
        Expense(title="Groceries M3", amount=Decimal("4800.00"), category="Groceries", expense_date=date(2026, 3, 4), payment_method="UPI"),
        Expense(title="Dining M3", amount=Decimal("3000.00"), category="Food", expense_date=date(2026, 3, 15), payment_method="Credit Card"),
        Expense(title="Shopping M3", amount=Decimal("5000.00"), category="Shopping", expense_date=date(2026, 3, 20), payment_method="Credit Card"),
    ]
    with app.app_context():
        db.session.bulk_save_objects(records)
        # Add budget
        budget = Budget(category="Overall", monthly_limit=Decimal("35000.00"), month=3, year=2026)
        db.session.add(budget)
        db.session.commit()
    return records


# 1. EXPENSE CRUD & VALIDATION TESTS
def test_create_expense_success(client):
    """Test creating a valid expense."""
    payload = {
        "title": "Weekly Organic Groceries",
        "amount": 3450.50,
        "category": "Groceries",
        "expense_date": "2026-03-10",
        "payment_method": "UPI",
        "description": "Milk, vegetables, fruits"
    }
    res = client.post("/api/expenses", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["title"] == "Weekly Organic Groceries"
    assert data["data"]["amount"] == 3450.50


def test_create_expense_validation_failures(client):
    """Test that invalid inputs are rejected with descriptive messages."""
    # Negative amount
    res = client.post("/api/expenses", json={
        "title": "Invalid Item",
        "amount": -500,
        "category": "Food",
        "expense_date": "2026-03-10",
        "payment_method": "UPI"
    })
    assert res.status_code == 400
    assert "strictly positive" in res.get_json()["errors"][0]

    # Missing title
    res2 = client.post("/api/expenses", json={
        "amount": 500,
        "category": "Food",
        "expense_date": "2026-03-10"
    })
    assert res2.status_code == 400

    # Invalid Category
    res3 = client.post("/api/expenses", json={
        "title": "Invalid Cat",
        "amount": 250,
        "category": "Cryptocurrency",
        "expense_date": "2026-03-10"
    })
    assert res3.status_code == 400
    assert "Invalid category" in res3.get_json()["errors"][0]


def test_update_and_delete_expense(client):
    """Test updating and deleting records."""
    # Create first
    res = client.post("/api/expenses", json={
        "title": "Initial Item",
        "amount": 1000.0,
        "category": "Food",
        "expense_date": "2026-03-01",
        "payment_method": "Cash"
    })
    exp_id = res.get_json()["data"]["id"]

    # Update
    update_res = client.put(f"/api/expenses/{exp_id}", json={
        "title": "Updated Item",
        "amount": 1250.0
    })
    assert update_res.status_code == 200
    assert update_res.get_json()["data"]["amount"] == 1250.0

    # Delete
    del_res = client.delete(f"/api/expenses/{exp_id}")
    assert del_res.status_code == 200

    # Verify 404
    get_res = client.get(f"/api/expenses/{exp_id}")
    assert get_res.status_code == 404


def test_filtering_and_sorting(client, sample_expenses):
    """Test search, category filter, date filter, and sorting."""
    # Filter by category Food
    res = client.get("/api/expenses?category=Food")
    data = res.get_json()
    assert data["success"] is True
    assert all(e["category"] == "Food" for e in data["data"]["expenses"])

    # Search filter
    res2 = client.get("/api/expenses?search=Rent")
    data2 = res2.get_json()
    assert data2["data"]["total_count"] == 3

    # Sort by amount desc
    res3 = client.get("/api/expenses?sort_by=amount&order=desc")
    expenses = res3.get_json()["data"]["expenses"]
    assert expenses[0]["amount"] >= expenses[1]["amount"]


# 2. ANALYTICS & DASHBOARD TESTS
def test_dashboard_calculations(client, sample_expenses):
    """Test that dashboard route returns proper metrics and charts."""
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "summary" in data
    assert "charts" in data
    assert "monthly_trend" in data["charts"]
    assert "category_distribution" in data["charts"]


def test_analytics_service(app, sample_expenses):
    """Test pandas-based statistical aggregations."""
    with app.app_context():
        all_exp = Expense.query.all()
        analytics = AnalyticsService.get_full_analytics(all_exp)
        assert analytics["total_transactions"] == 10
        assert analytics["total_expenses"] > 80000
        assert analytics["most_expensive_category"] == "Rent"
        assert len(analytics["category_breakdown"]) > 0


# 3. PREDICTION SERVICE TESTS
def test_prediction_sufficient_data(app, sample_expenses):
    """Tests forecasting model with 3 months of historical data."""
    with app.app_context():
        all_exp = Expense.query.all()
        prediction = PredictionService.predict_next_month(all_exp, date(2026, 3, 25))
        assert prediction["has_sufficient_data"] is True
        assert prediction["predicted_total"] > 0
        assert "confidence_score" in prediction
        assert "Rent" in prediction["predicted_categories"]
        assert len(prediction["historical_chart_data"]) == 4  # 3 historical + 1 predicted


def test_prediction_insufficient_data(app):
    """Tests that forecasting rejects prediction when under threshold."""
    with app.app_context():
        # Only 1 month of data
        exp = Expense(title="Single", amount=Decimal("1000.00"), category="Food", expense_date=date(2026, 3, 1), payment_method="Cash")
        db.session.add(exp)
        db.session.commit()

        prediction = PredictionService.predict_next_month([exp], date(2026, 3, 5))
        assert prediction["has_sufficient_data"] is False
        assert "Not enough historical data" in prediction["message"]


# 4. AI INSIGHTS TESTS
def test_ai_insights_endpoint(client, sample_expenses):
    """Test AI endpoint generates structured recommendations (via OpenAI or fallback)."""
    res = client.post("/api/ai/insights", json={
        "monthly_spending": 32800,
        "budget": 35000,
        "mom_change_pct": 14.5
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert "summary" in data
    assert "saving_tips" in data
    assert "top_concerns" in data
    assert "priority_action" in data
    assert "disclaimer" in data
