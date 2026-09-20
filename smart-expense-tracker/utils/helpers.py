"""
Helper Utilities
Formatting, response serialization, and mathematical utilities.
"""

from decimal import Decimal
from datetime import datetime, date

def format_currency(amount, symbol="₹"):
    """Format decimal/float into currency format."""
    try:
        val = float(amount or 0)
        return f"{symbol}{val:,.2f}"
    except (ValueError, TypeError):
        return f"{symbol}0.00"

def calculate_percentage_change(current, previous):
    """
    Computes percentage change between previous and current values.
    Returns percentage rounded to 1 decimal place.
    """
    try:
        curr = float(current or 0)
        prev = float(previous or 0)
        if prev == 0:
            if curr == 0:
                return 0.0
            return 100.0  # From 0 to positive
        change = ((curr - prev) / prev) * 100.0
        return round(change, 1)
    except Exception:
        return 0.0

def get_month_name(month_num):
    """Convert integer month (1-12) to abbreviated name."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    if 1 <= month_num <= 12:
        return months[month_num - 1]
    return str(month_num)

def standard_response(success=True, data=None, message="", errors=None, status_code=200):
    """Uniform REST API response structure."""
    payload = {
        "success": success,
        "message": message,
        "data": data if data is not None else {},
    }
    if errors:
        payload["errors"] = errors
    return payload, status_code
