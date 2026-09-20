"""
Database Seeding Script
Populates the MySQL database with 11+ months of realistic sample expense data
and budget limits from data/sample_expenses.csv.
"""

import os
import sys
import csv
from datetime import datetime
from decimal import Decimal

# Add parent directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from models import db, Expense, Budget

def seed_database():
    app = create_app()
    with app.app_context():
        print("Ensuring database tables are initialized...")
        db.create_all()

        csv_path = os.path.join(os.path.dirname(__file__), "sample_expenses.csv")
        if not os.path.exists(csv_path):
            print(f"Error: Could not locate {csv_path}")
            return

        # Check existing count
        existing_count = Expense.query.count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} records.")
            choice = input("Do you wish to purge and re-seed? (y/N): ").strip().lower()
            if choice == "y":
                print("Purging existing records...")
                Expense.query.delete()
                Budget.query.delete()
                db.session.commit()
            else:
                print("Seeding aborted by user.")
                return

        print("Importing records from sample_expenses.csv...")
        expenses_to_add = []
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                exp = Expense(
                    title=row["title"].strip(),
                    amount=Decimal(row["amount"].strip()),
                    category=row["category"].strip(),
                    expense_date=datetime.strptime(row["expense_date"].strip(), "%Y-%m-%d").date(),
                    payment_method=row["payment_method"].strip(),
                    description=row.get("description", "").strip()
                )
                expenses_to_add.append(exp)

        db.session.bulk_save_objects(expenses_to_add)
        db.session.commit()
        print(f"✓ Successfully imported {len(expenses_to_add)} expense transactions.")

        # Seed budgets for recent months
        print("Seeding monthly budget limits...")
        today = datetime.now()
        current_year = today.year
        current_month = today.month

        # Overall and category budgets
        budgets_to_add = [
            # Overall monthly budgets
            Budget(category="Overall", monthly_limit=Decimal("50000.00"), month=current_month, year=current_year),
            Budget(category="Overall", monthly_limit=Decimal("50000.00"), month=max(1, current_month - 1), year=current_year if current_month > 1 else current_year - 1),
            # Category-specific budgets
            Budget(category="Groceries", monthly_limit=Decimal("10000.00"), month=current_month, year=current_year),
            Budget(category="Food", monthly_limit=Decimal("6000.00"), month=current_month, year=current_year),
            Budget(category="Shopping", monthly_limit=Decimal("7000.00"), month=current_month, year=current_year),
            Budget(category="Travel", monthly_limit=Decimal("4500.00"), month=current_month, year=current_year),
            Budget(category="Utilities", monthly_limit=Decimal("4000.00"), month=current_month, year=current_year),
            Budget(category="Bills", monthly_limit=Decimal("3000.00"), month=current_month, year=current_year),
        ]

        for b in budgets_to_add:
            existing = Budget.query.filter_by(category=b.category, month=b.month, year=b.year).first()
            if not existing:
                db.session.add(b)

        db.session.commit()
        print(f"✓ Seeded standard category & overall budgets for {current_month}/{current_year}.")
        print("\nDatabase is fully seeded and ready for analytics & prediction testing!")

if __name__ == "__main__":
    seed_database()
