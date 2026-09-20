"""
Request Validation Utilities
Ensures robust input validation with explicit error messages.
"""

from datetime import datetime
from decimal import Decimal, InvalidOperation
from models.expense import VALID_CATEGORIES, VALID_PAYMENT_METHODS

def validate_expense_data(data, is_update=False):
    """
    Validates expense creation and update payloads.
    Returns: (is_valid: bool, cleaned_data: dict, errors: list)
    """
    errors = []
    cleaned = {}

    if not isinstance(data, dict):
        return False, {}, ["Request body must be a JSON object."]

    # Title
    if "title" in data or not is_update:
        title = str(data.get("title", "")).strip()
        if not title:
            errors.append("Title is required and cannot be empty.")
        elif len(title) > 150:
            errors.append("Title must be 150 characters or less.")
        else:
            cleaned["title"] = title

    # Amount
    if "amount" in data or not is_update:
        raw_amount = data.get("amount")
        if raw_amount is None or raw_amount == "":
            errors.append("Amount is required.")
        else:
            try:
                amount = Decimal(str(raw_amount))
                if amount <= 0:
                    errors.append("Amount must be a strictly positive number.")
                elif amount > Decimal("10000000.00"):
                    errors.append("Amount exceeds reasonable limit (10,000,000).")
                else:
                    cleaned["amount"] = round(amount, 2)
            except (ValueError, InvalidOperation):
                errors.append("Amount must be a valid numeric decimal value.")

    # Category
    if "category" in data or not is_update:
        category = str(data.get("category", "")).strip()
        if not category:
            errors.append("Category is required.")
        elif category not in VALID_CATEGORIES:
            errors.append(f"Invalid category '{category}'. Must be one of: {', '.join(VALID_CATEGORIES)}")
        else:
            cleaned["category"] = category

    # Expense Date
    if "expense_date" in data or not is_update:
        raw_date = data.get("expense_date")
        if not raw_date:
            errors.append("Expense date is required.")
        else:
            try:
                # Accept YYYY-MM-DD
                parsed_date = datetime.strptime(str(raw_date)[:10], "%Y-%m-%d").date()
                cleaned["expense_date"] = parsed_date
            except ValueError:
                errors.append("Expense date must be a valid date in YYYY-MM-DD format.")

    # Payment Method
    if "payment_method" in data or not is_update:
        payment_method = str(data.get("payment_method", "UPI")).strip()
        if not payment_method:
            errors.append("Payment method is required.")
        elif payment_method not in VALID_PAYMENT_METHODS:
            errors.append(f"Invalid payment method '{payment_method}'. Must be one of: {', '.join(VALID_PAYMENT_METHODS)}")
        else:
            cleaned["payment_method"] = payment_method

    # Description (Optional)
    if "description" in data:
        desc = str(data.get("description", "")).strip()
        cleaned["description"] = desc

    return len(errors) == 0, cleaned, errors


def validate_budget_data(data, is_update=False):
    """
    Validates budget creation/update payloads.
    Returns: (is_valid: bool, cleaned_data: dict, errors: list)
    """
    errors = []
    cleaned = {}

    if not isinstance(data, dict):
        return False, {}, ["Request body must be a JSON object."]

    # Category
    category = str(data.get("category", "Overall")).strip()
    if category != "Overall" and category not in VALID_CATEGORIES:
        errors.append(f"Invalid budget category '{category}'. Must be 'Overall' or a valid expense category.")
    else:
        cleaned["category"] = category

    # Monthly Limit
    raw_limit = data.get("monthly_limit")
    if raw_limit is None:
        errors.append("Monthly limit is required.")
    else:
        try:
            limit = Decimal(str(raw_limit))
            if limit <= 0:
                errors.append("Monthly limit must be positive.")
            else:
                cleaned["monthly_limit"] = round(limit, 2)
        except (ValueError, InvalidOperation):
            errors.append("Monthly limit must be a valid numeric amount.")

    # Month & Year
    try:
        month = int(data.get("month", datetime.now().month))
        year = int(data.get("year", datetime.now().year))
        if not (1 <= month <= 12):
            errors.append("Month must be between 1 and 12.")
        if year < 2000 or year > 2100:
            errors.append("Year must be between 2000 and 2100.")
        cleaned["month"] = month
        cleaned["year"] = year
    except (ValueError, TypeError):
        errors.append("Month and year must be integers.")

    return len(errors) == 0, cleaned, errors
