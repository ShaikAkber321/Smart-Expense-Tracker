"""
Expense Routes
Handles full CRUD, filtering, searching, and sorting operations.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Expense
from utils.validators import validate_expense_data
from utils.helpers import standard_response

expense_bp = Blueprint("expenses", __name__, url_prefix="/api/expenses")

@expense_bp.route("", methods=["GET"])
def get_expenses():
    """
    Retrieve list of expenses with optional filtering, search, and sorting.
    Query params:
    - search: string
    - category: string
    - payment_method: string
    - start_date: YYYY-MM-DD
    - end_date: YYYY-MM-DD
    - sort_by: 'date' | 'amount' | 'title' | 'category'
    - order: 'desc' | 'asc'
    """
    try:
        query = Expense.query

        # Search filter
        search = request.args.get("search", "").strip()
        if search:
            query = query.filter(
                (Expense.title.ilike(f"%{search}%")) |
                (Expense.description.ilike(f"%{search}%"))
            )

        # Category filter
        category = request.args.get("category", "").strip()
        if category and category != "All":
            query = query.filter(Expense.category == category)

        # Payment Method filter
        payment_method = request.args.get("payment_method", "").strip()
        if payment_method and payment_method != "All":
            query = query.filter(Expense.payment_method == payment_method)

        # Date range filter
        start_date = request.args.get("start_date", "").strip()
        if start_date:
            try:
                s_date = datetime.strptime(start_date, "%Y-%m-%d").date()
                query = query.filter(Expense.expense_date >= s_date)
            except ValueError:
                pass

        end_date = request.args.get("end_date", "").strip()
        if end_date:
            try:
                e_date = datetime.strptime(end_date, "%Y-%m-%d").date()
                query = query.filter(Expense.expense_date <= e_date)
            except ValueError:
                pass

        # Sorting
        sort_by = request.args.get("sort_by", "date").lower()
        order = request.args.get("order", "desc").lower()

        sort_column = Expense.expense_date
        if sort_by == "amount":
            sort_column = Expense.amount
        elif sort_by == "title":
            sort_column = Expense.title
        elif sort_by == "category":
            sort_column = Expense.category

        if order == "asc":
            query = query.order_by(sort_column.asc(), Expense.id.asc())
        else:
            query = query.order_by(sort_column.desc(), Expense.id.desc())

        expenses = query.all()
        total_amount = sum(float(e.amount) for e in expenses)

        return standard_response(
            success=True,
            data={
                "expenses": [e.to_dict() for e in expenses],
                "total_count": len(expenses),
                "total_amount": round(total_amount, 2),
            },
            message="Expenses retrieved successfully."
        )

    except Exception as e:
        return standard_response(
            success=False,
            message="Failed to retrieve expenses.",
            errors=[str(e)],
            status_code=500
        )


@expense_bp.route("/<int:expense_id>", methods=["GET"])
def get_expense(expense_id):
    """Retrieve single expense by ID."""
    expense = Expense.query.get(expense_id)
    if not expense:
        return standard_response(
            success=False,
            message=f"Expense with ID {expense_id} not found.",
            status_code=404
        )
    return standard_response(
        success=True,
        data=expense.to_dict(),
        message="Expense retrieved."
    )


@expense_bp.route("", methods=["POST"])
def create_expense():
    """Create a new expense entry."""
    data = request.get_json(silent=True) or {}
    is_valid, cleaned, errors = validate_expense_data(data)

    if not is_valid:
        return standard_response(
            success=False,
            message="Validation error.",
            errors=errors,
            status_code=400
        )

    try:
        new_expense = Expense(
            title=cleaned["title"],
            amount=cleaned["amount"],
            category=cleaned["category"],
            expense_date=cleaned["expense_date"],
            payment_method=cleaned["payment_method"],
            description=cleaned.get("description", "")
        )
        db.session.add(new_expense)
        db.session.commit()

        return standard_response(
            success=True,
            data=new_expense.to_dict(),
            message="Expense created successfully.",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return standard_response(
            success=False,
            message="Failed to save expense to database.",
            errors=[str(e)],
            status_code=500
        )


@expense_bp.route("/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):
    """Update existing expense by ID."""
    expense = Expense.query.get(expense_id)
    if not expense:
        return standard_response(
            success=False,
            message=f"Expense with ID {expense_id} not found.",
            status_code=404
        )

    data = request.get_json(silent=True) or {}
    is_valid, cleaned, errors = validate_expense_data(data, is_update=True)

    if not is_valid:
        return standard_response(
            success=False,
            message="Validation error.",
            errors=errors,
            status_code=400
        )

    try:
        if "title" in cleaned:
            expense.title = cleaned["title"]
        if "amount" in cleaned:
            expense.amount = cleaned["amount"]
        if "category" in cleaned:
            expense.category = cleaned["category"]
        if "expense_date" in cleaned:
            expense.expense_date = cleaned["expense_date"]
        if "payment_method" in cleaned:
            expense.payment_method = cleaned["payment_method"]
        if "description" in cleaned:
            expense.description = cleaned["description"]

        db.session.commit()

        return standard_response(
            success=True,
            data=expense.to_dict(),
            message="Expense updated successfully."
        )
    except Exception as e:
        db.session.rollback()
        return standard_response(
            success=False,
            message="Failed to update expense.",
            errors=[str(e)],
            status_code=500
        )


@expense_bp.route("/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    """Delete an expense record."""
    expense = Expense.query.get(expense_id)
    if not expense:
        return standard_response(
            success=False,
            message=f"Expense with ID {expense_id} not found.",
            status_code=404
        )

    try:
        db.session.delete(expense)
        db.session.commit()
        return standard_response(
            success=True,
            data={"id": expense_id},
            message="Expense deleted successfully."
        )
    except Exception as e:
        db.session.rollback()
        return standard_response(
            success=False,
            message="Failed to delete expense.",
            errors=[str(e)],
            status_code=500
        )
