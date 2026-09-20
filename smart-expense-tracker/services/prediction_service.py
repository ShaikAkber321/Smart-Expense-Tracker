"""
Prediction Service
Time-series forecasting for next month's expense totals and category breakdowns
using pandas, NumPy, and scikit-learn.
"""

from datetime import datetime, date
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from utils.helpers import calculate_percentage_change

MIN_REQUIRED_MONTHS = 3

class PredictionService:
    @staticmethod
    def _prepare_monthly_aggregations(expenses):
        """
        Aggregates raw transactions into chronological monthly summaries.
        Returns: (monthly_df, category_monthly_df)
        """
        if not expenses:
            return pd.DataFrame(), pd.DataFrame()

        records = [
            {
                "amount": float(e.amount),
                "category": e.category,
                "date": pd.to_datetime(e.expense_date),
            }
            for e in expenses
        ]
        df = pd.DataFrame(records)
        df["year_month"] = df["date"].dt.to_period("M")

        # Monthly total expenses
        monthly_df = df.groupby("year_month")["amount"].sum().reset_index()
        monthly_df = monthly_df.sort_values("year_month").reset_index(drop=True)

        # Category monthly expenses
        cat_monthly_df = df.groupby(["year_month", "category"])["amount"].sum().unstack(fill_value=0)

        return monthly_df, cat_monthly_df

    @classmethod
    def predict_next_month(cls, expenses, current_date=None):
        """
        Predicts next month's overall expense and category-level distribution.
        """
        if current_date is None:
            current_date = date.today()

        monthly_df, cat_monthly_df = cls._prepare_monthly_aggregations(expenses)

        num_months = len(monthly_df)
        if num_months < MIN_REQUIRED_MONTHS:
            return {
                "has_sufficient_data": False,
                "message": "Not enough historical data for a reliable prediction. Continue recording expenses to unlock predictive insights.",
                "months_available": num_months,
                "months_required": MIN_REQUIRED_MONTHS,
                "predicted_total": 0.0,
                "expected_change_pct": 0.0,
                "historical_chart_data": [],
                "predicted_categories": {},
                "confidence_score": 0,
                "confidence_interval": {"lower": 0.0, "upper": 0.0},
            }

        amounts = monthly_df["amount"].values.astype(float)
        n = len(amounts)

        # 1. Feature Engineering & Modeling
        # Time index feature: X = [0, 1, 2, ..., n-1]
        X = np.arange(n).reshape(-1, 1)
        y = amounts

        # Linear trend regression
        model = LinearRegression()
        model.fit(X, y)
        trend_pred = float(model.predict([[n]])[0])

        # 3-month weighted moving average: gives higher weight to recent habits
        weights = np.array([0.2, 0.3, 0.5])[-min(3, n):]
        weights = weights / weights.sum()
        recent_window = amounts[-len(weights):]
        wma_pred = float(np.dot(weights, recent_window))

        # Ensemble forecast: 60% weighted moving average (inertia) + 40% linear trend
        predicted_total = max(100.0, round((0.60 * wma_pred) + (0.40 * trend_pred), 2))

        # Recent month for comparison
        latest_actual = float(amounts[-1])
        expected_change = calculate_percentage_change(predicted_total, latest_actual)

        # Compute Residuals & Confidence Score
        fitted_values = model.predict(X)
        errors = np.abs(y - fitted_values)
        mean_abs_error = float(np.mean(errors))
        mape = float(np.mean(errors / np.maximum(y, 1.0)))  # Mean Absolute Percentage Error

        # Map MAPE to confidence percentage (e.g. 5% MAPE -> 95% confidence, 20% MAPE -> 80%)
        confidence_score = max(50, min(95, int(round((1.0 - min(0.5, mape)) * 100))))
        uncertainty_margin = round(max(mean_abs_error * 1.2, predicted_total * 0.06), 2)

        lower_bound = max(0.0, round(predicted_total - uncertainty_margin, 2))
        upper_bound = round(predicted_total + uncertainty_margin, 2)

        # 2. Category-Level Forecasting
        predicted_categories = {}
        if not cat_monthly_df.empty:
            recent_cats = cat_monthly_df.tail(min(3, len(cat_monthly_df)))
            cat_means = recent_cats.mean()
            cat_sum = cat_means.sum()

            if cat_sum > 0:
                for cat, val in cat_means.items():
                    prop = float(val) / float(cat_sum)
                    cat_pred = round(prop * predicted_total, 2)
                    if cat_pred > 0:
                        predicted_categories[cat] = cat_pred
            else:
                for cat, val in cat_means.items():
                    predicted_categories[cat] = round(predicted_total / len(cat_means), 2)

        # Sort categories descending
        predicted_categories = dict(sorted(predicted_categories.items(), key=lambda item: item[1], reverse=True))

        # 3. Format Historical vs Predicted Series
        historical_chart_data = []
        for _, row in monthly_df.iterrows():
            period = row["year_month"]
            label = period.strftime("%b %Y")
            historical_chart_data.append({
                "label": label,
                "amount": round(float(row["amount"]), 2),
                "is_predicted": False,
            })

        # Append next month prediction
        last_period = monthly_df["year_month"].iloc[-1]
        next_period = last_period + 1
        predicted_label = next_period.strftime("%b %Y") + " (Predicted)"

        historical_chart_data.append({
            "label": predicted_label,
            "amount": predicted_total,
            "is_predicted": True,
        })

        return {
            "has_sufficient_data": True,
            "message": "Prediction calculated successfully based on historical spending features.",
            "months_available": num_months,
            "months_required": MIN_REQUIRED_MONTHS,
            "predicted_total": predicted_total,
            "expected_change_pct": expected_change,
            "trend_direction": "increase" if expected_change > 0 else ("decrease" if expected_change < 0 else "neutral"),
            "predicted_month_name": next_period.strftime("%B %Y"),
            "confidence_score": confidence_score,
            "uncertainty_margin": uncertainty_margin,
            "confidence_interval": {
                "lower": lower_bound,
                "upper": upper_bound,
            },
            "predicted_categories": predicted_categories,
            "historical_chart_data": historical_chart_data,
        }
