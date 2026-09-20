"""
Expense Model
Represents individual transactions in MySQL.
"""

from datetime import datetime, date
from decimal import Decimal
from models import db

VALID_CATEGORIES = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Education",
    "Healthcare",
    "Entertainment",
    "Groceries",
    "Rent",
    "Utilities",
    "Other",
]

VALID_PAYMENT_METHODS = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "UPI",
    "Bank Transfer",
    "Other",
]

class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(150), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    expense_date = db.Column(db.Date, nullable=False, default=date.today, index=True)
    payment_method = db.Column(db.String(50), nullable=False, default="UPI", index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Serialize model instance to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "amount": float(self.amount) if self.amount is not None else 0.0,
            "category": self.category,
            "description": self.description or "",
            "expense_date": self.expense_date.strftime("%Y-%m-%d") if self.expense_date else "",
            "payment_method": self.payment_method,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else "",
        }

    def __repr__(self):
        return f"<Expense {self.id}: {self.title} - {self.amount}>"
