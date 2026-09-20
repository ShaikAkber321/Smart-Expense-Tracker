"""
Models Package Initialization
Initializes SQLAlchemy instance.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from models.expense import Expense
from models.budget import Budget

__all__ = ["db", "Expense", "Budget"]
