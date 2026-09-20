"""
Budget Model
Represents monthly spending targets for categories or overall.
"""

from datetime import datetime
from decimal import Decimal
from models import db

class Budget(db.Model):
    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category = db.Column(db.String(50), nullable=False, default="Overall")
    monthly_limit = db.Column(db.Numeric(10, 2), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("category", "month", "year", name="uq_budget_category_month_year"),
    )

    def to_dict(self):
        """Serialize model instance to dictionary."""
        return {
            "id": self.id,
            "category": self.category,
            "monthly_limit": float(self.monthly_limit) if self.monthly_limit is not None else 0.0,
            "month": self.month,
            "year": self.year,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else "",
        }

    def __repr__(self):
        return f"<Budget {self.category} ({self.month}/{self.year}): {self.monthly_limit}>"
