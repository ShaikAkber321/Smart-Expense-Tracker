# Smart Expense Tracker with Predictive Insights

A full-stack personal finance application that helps users **track expenses, analyze spending patterns, manage budgets, predict next-month expenses, and receive AI-powered saving recommendations**.

The project combines a modern React/Vite interface with a Python Flask backend, MySQL database, predictive analytics using scikit-learn, and OpenAI-powered financial insights.

---

## 📌 Overview

Traditional expense trackers mainly show users where their money has already gone. **Smart Expense Tracker with Predictive Insights** goes a step further by combining historical expense analysis with predictive analytics and generative AI.

The application allows users to:

* Record and manage daily expenses
* Categorize transactions
* Search and filter expenses
* Set monthly and category budgets
* Analyze spending patterns
* Visualize financial data through interactive charts
* Predict next month's total expenses
* Estimate category-wise future spending
* Identify budget risks and spending patterns
* Generate personalized saving recommendations using OpenAI

The prediction engine also checks whether enough historical data is available before producing a forecast, helping avoid misleading predictions.

---

# ✨ Features

## 1. Expense Management

Complete expense management functionality including:

* Add expenses
* Edit expenses
* Delete expenses
* View expense history
* Search expenses
* Filter by category
* Filter by payment method
* Filter by date
* Sort by date
* Sort by amount
* View individual transaction details

Supported categories include:

* Food
* Travel
* Shopping
* Bills
* Education
* Healthcare
* Entertainment
* Groceries
* Rent
* Utilities
* Other

Supported payment methods include:

* Cash
* Credit Card
* Debit Card
* UPI
* Net Banking
* Other

---

# 📊 Dashboard

The dashboard provides an overview of the user's financial activity.

### Key metrics

* Current month spending
* Previous month spending
* Month-over-month spending change
* Average daily spending
* Highest spending category
* Monthly budget usage
* Remaining budget
* Predicted next-month spending

### Visualizations

The application provides interactive charts for:

* Monthly spending trends
* Category-wise spending
* Historical vs predicted spending
* Payment method distribution
* Weekday vs weekend spending
* Budget vs actual spending

Charts are implemented using **Chart.js**.

---

# 📈 Expense Analytics

The analytics engine uses **Python, pandas, and NumPy** to analyze historical transactions.

It calculates:

* Total spending
* Average expense
* Median expense
* Minimum expense
* Maximum expense
* Standard deviation
* Monthly spending totals
* Category-wise spending
* Category percentages
* Month-over-month changes
* Spending frequency
* High-value transactions
* Spending trends

These metrics are used throughout the dashboard and predictive insights sections.

---

# 🔮 Predictive Expense Insights

One of the main features of the project is **next-month expense prediction**.

The prediction engine analyzes historical monthly spending and generates an estimate for the upcoming month.

## Prediction methodology

The prediction pipeline:

1. Retrieves historical expense transactions.
2. Converts transaction dates into monthly periods.
3. Aggregates total spending by month.
4. Creates a chronological spending series.
5. Trains a Linear Regression model to identify the overall spending trend.
6. Calculates a 3-month Weighted Moving Average.
7. Combines the trend prediction and recent spending behavior.
8. Generates the next-month expense prediction.
9. Estimates category-wise spending.
10. Calculates an uncertainty range and confidence score.

### Forecasting formula

The final prediction combines:

```text
60% Weighted Moving Average
+
40% Linear Regression Trend
=
Next-Month Forecast
```

The weighted moving average gives more importance to recent spending behavior.

---

## Data Sufficiency

The system does not generate a forecast when insufficient historical information is available.

A minimum of **3 historical months** is required.

If there is insufficient data, the application displays:

> Not enough historical data for a reliable prediction. Continue recording expenses to unlock predictive insights.

This prevents the application from presenting an unreliable prediction as if it were accurate.

---

## Prediction Output

The predictive insights section provides:

* Predicted next-month total
* Expected percentage change
* Trend direction
* Confidence score
* Uncertainty range
* Predicted category-wise expenses
* Historical vs predicted spending chart

Example:

```text
Current Month Spending: ₹23,500

Predicted Next Month:
₹24,800

Expected Change:
+5.53%

Confidence:
82%

Estimated Range:
₹22,900 – ₹26,700
```

---

# 🤖 OpenAI-Powered Saving Insights

The project integrates the **OpenAI API** to provide personalized spending insights.

Instead of sending every raw transaction to the AI model, the backend prepares summarized financial information such as:

* Current monthly spending
* Monthly budget
* Month-over-month change
* Predicted next-month spending
* Category-wise spending

This summarized information is then provided to the OpenAI service.

The AI generates structured insights containing:

* Monthly financial summary
* Top spending concerns
* Personalized saving tips
* Budget suggestions
* One high-priority action

### Example

```text
Summary:
Your current spending is approaching the monthly budget,
with food and shopping contributing significantly to total expenses.

Saving Tips:
• Reduce non-essential food orders.
• Review recurring subscriptions.
• Set a weekly spending limit.

Budget Suggestion:
Consider reducing discretionary spending next month.

Priority Action:
Review high-value discretionary transactions this week.
```

---

# 🛡️ AI Fallback System

The application does not completely depend on the OpenAI API.

If:

* `OPENAI_API_KEY` is not configured
* The API request fails
* The API is temporarily unavailable
* A request encounters an error

the application uses a **rule-based heuristic insight engine**.

This fallback analyzes:

* Budget utilization
* Month-over-month spending
* Largest spending categories
* Category concentration
* Remaining budget
* Predicted expenses

This allows the application to continue providing useful financial insights even when the external AI service is unavailable.

---

# 💰 Budget Management

Users can configure:

* Overall monthly budget
* Category-specific budgets

The application tracks:

```text
Monthly Budget
       ↓
Actual Spending
       ↓
Remaining Budget
       ↓
Budget Utilization %
```

### Budget alerts

The system provides different warning levels:

| Budget Usage | Status   |
| ------------ | -------- |
| Below 75%    | Normal   |
| 75% – 89%    | Caution  |
| 90% – 99%    | Critical |
| 100% or more | Exceeded |

This allows users to identify budget pressure before the month ends.

---

# 💡 Smart Rule-Based Insights

The application automatically detects important spending patterns.

Examples include:

* Significant increase in monthly spending
* Category spending increases
* Significant category reductions
* High-value transactions
* Approaching monthly budget
* Exceeded budget
* Large concentration of spending in one category

These insights work independently of the OpenAI integration.

---

# 🏗️ System Architecture

```text
                    ┌───────────────────────────────┐
                    │        User / Browser         │
                    │   React + TypeScript + Vite   │
                    └───────────────┬───────────────┘
                                    │
                                    │ HTTP / API
                                    ▼
                    ┌───────────────────────────────┐
                    │       Python Flask API        │
                    │                               │
                    │  Expense Routes               │
                    │  Dashboard Routes             │
                    │  Prediction Routes            │
                    │  AI Routes                    │
                    └───────┬───────────┬───────────┘
                            │           │
             ┌──────────────┘           └───────────────┐
             ▼                                          ▼
   ┌─────────────────────┐                  ┌─────────────────────┐
   │ Analytics Service   │                  │ Prediction Service  │
   │                     │                  │                     │
   │ pandas              │                  │ Linear Regression   │
   │ NumPy               │                  │ Weighted Moving Avg │
   └──────────┬──────────┘                  └──────────┬──────────┘
              │                                        │
              └────────────────┬───────────────────────┘
                               ▼
                    ┌────────────────────────┐
                    │ Flask-SQLAlchemy ORM   │
                    └────────────┬───────────┘
                                 ▼
                    ┌────────────────────────┐
                    │     MySQL Database      │
                    │                         │
                    │ expenses                │
                    │ budgets                 │
                    └────────────────────────┘

                               │
                               ▼
                    ┌────────────────────────┐
                    │    OpenAI Service      │
                    │                        │
                    │ Summarized Metrics     │
                    │          ↓             │
                    │ AI Financial Insights  │
                    └────────────────────────┘
```

---

# 🗂️ Project Structure

```text
Smart-Expense-Tracker/
│
├── src/
│   ├── components/
│   │   ├── AddExpenseView.tsx
│   │   ├── AnalyticsView.tsx
│   │   ├── BudgetView.tsx
│   │   ├── Charts.tsx
│   │   ├── DashboardView.tsx
│   │   ├── ExpensesView.tsx
│   │   ├── Header.tsx
│   │   ├── PredictiveInsightsView.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── data/
│   │   └── initialData.ts
│   │
│   ├── services/
│   │   ├── ai.ts
│   │   ├── analytics.ts
│   │   └── prediction.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
│
├── smart-expense-tracker/
│   │
│   ├── database/
│   │   └── schema.sql
│   │
│   ├── data/
│   │   ├── sample_expenses.csv
│   │   └── seed_data.py
│   │
│   ├── models/
│   │   ├── expense.py
│   │   ├── budget.py
│   │   └── __init__.py
│   │
│   ├── routes/
│   │   ├── expense_routes.py
│   │   ├── dashboard_routes.py
│   │   ├── prediction_routes.py
│   │   ├── ai_routes.py
│   │   └── __init__.py
│   │
│   ├── services/
│   │   ├── analytics_service.py
│   │   ├── prediction_service.py
│   │   ├── openai_service.py
│   │   └── __init__.py
│   │
│   ├── utils/
│   │   ├── helpers.py
│   │   ├── validators.py
│   │   └── __init__.py
│   │
│   ├── templates/
│   │   ├── base.html
│   │   ├── dashboard.html
│   │   ├── expenses.html
│   │   ├── add_expense.html
│   │   ├── analytics.html
│   │   ├── insights.html
│   │   └── budget.html
│   │
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   │
│   ├── tests/
│   │   └── test_app.py
│   │
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   └── README.md
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── bun.lock
├── metadata.json
└── README.md
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Chart.js
* Lucide React
* Motion

## Backend

* Python
* Flask
* Flask-SQLAlchemy
* Flask-CORS
* PyMySQL

## Data & Machine Learning

* pandas
* NumPy
* scikit-learn
* Linear Regression
* Weighted Moving Average

## Artificial Intelligence

* OpenAI API
* Structured JSON AI responses
* Rule-based fallback engine

## Database

* MySQL

## Testing

* pytest

## Development Tools

* VS Code
* Git
* GitHub

---

# 🗄️ Database

The project uses a MySQL database named:

```text
smart_expense_tracker
```

### Expenses Table

Stores individual transactions.

Important fields include:

```text
id
user_id
title
amount
category
description
expense_date
payment_method
created_at
updated_at
```

Monetary values are stored using `DECIMAL(10,2)`.

### Budgets Table

Stores overall and category-level budgets.

Important fields include:

```text
id
user_id
category
monthly_limit
month
year
created_at
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend directory based on `.env.example`.

Example:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

DATABASE_URL=mysql+pymysql://username:password@localhost/smart_expense_tracker

FLASK_ENV=development
```

**Never commit your real `.env` file or API keys to GitHub.**

The repository includes `.env.example` as a safe configuration template.

---

# 🚀 Installation

## Prerequisites

Install:

* Node.js
* Python 3.10+
* MySQL 8.0+
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/ShaikAkber321/Smart-Expense-Tracker.git
```

```bash
cd Smart-Expense-Tracker
```

---

# 2. Frontend Setup

Install frontend dependencies:

```bash
npm install
```

Run the frontend development server:

```bash
npm run dev
```

The Vite development server will start on:

```text
http://localhost:3000
```

---

# 3. Backend Setup

Move into the backend directory:

```bash
cd smart-expense-tracker
```

Create a virtual environment:

### Windows

```powershell
python -m venv venv
```

Activate it:

```powershell
venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

# 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

---

# 5. Configure MySQL

Create the database:

```sql
CREATE DATABASE smart_expense_tracker;
```

Then configure the database connection in your `.env` file.

You can also use the provided schema:

```text
smart-expense-tracker/database/schema.sql
```

---

# 6. Run the Flask Backend

From the backend directory:

```bash
python app.py
```

The Flask application runs on:

```text
http://localhost:5000
```

---

# 📥 Sample Data

The project includes sample expense data for testing and demonstration.

Sample data:

```text
smart-expense-tracker/data/sample_expenses.csv
```

A seed script is also provided:

```text
smart-expense-tracker/data/seed_data.py
```

This allows the application to be tested with historical spending data required for predictive analytics.

---

# 🔌 API Modules

The Flask backend separates functionality into multiple route modules.

### Expense API

```text
routes/expense_routes.py
```

Handles:

* Creating expenses
* Retrieving expenses
* Updating expenses
* Deleting expenses
* Filtering expenses

### Dashboard API

```text
routes/dashboard_routes.py
```

Provides:

* Dashboard KPIs
* Spending summaries
* Budget information
* Chart data

### Prediction API

```text
routes/prediction_routes.py
```

Provides:

* Next-month prediction
* Category forecasts
* Confidence information
* Historical vs predicted data

### AI API

```text
routes/ai_routes.py
```

Provides:

* AI financial insights
* Saving recommendations
* Budget suggestions
* Priority actions

---

# 🧪 Testing

Basic tests are included in:

```text
smart-expense-tracker/tests/test_app.py
```

Run tests using:

```bash
pytest
```

---

# 🔒 Security Considerations

The project follows several basic security practices:

* API keys are stored in environment variables.
* `.env` files are excluded through `.gitignore`.
* `.env.example` is provided without real secrets.
* Database operations use the ORM/database layer.
* User input is validated.
* API failures are handled gracefully.
* Internal errors are not exposed directly to users.
* The OpenAI service works with summarized financial metrics rather than unnecessarily transmitting raw transaction details.

---

# ⚠️ Prediction Limitations

Expense prediction is an estimate and not a guaranteed future value.

Personal spending can change because of:

* Unexpected expenses
* Seasonal spending
* Medical expenses
* Travel
* Major purchases
* Changes in income
* Lifestyle changes

The prediction model therefore provides an estimated value together with an uncertainty range rather than claiming certainty.

---

# ⚠️ AI Disclaimer

The OpenAI-generated recommendations are intended for **informational budgeting and self-analysis purposes only**.

They are not certified financial, investment, tax, or professional financial advice.

---

# 🔮 Future Enhancements

Potential future improvements include:

* User authentication
* Multi-user accounts
* Recurring expenses
* Income tracking
* Expense notifications
* Email alerts
* Mobile application
* Cloud deployment
* More advanced forecasting models
* Automatic receipt scanning using OCR
* Bank transaction integration
* Personalized financial goals
* Export reports as PDF/Excel
* Advanced anomaly detection
* Long-term savings forecasting

---

# 🎯 Learning Outcomes

This project demonstrates practical experience with:

* Full-stack application development
* React and TypeScript
* Flask REST APIs
* MySQL database design
* SQLAlchemy ORM
* CRUD operations
* Data analysis using pandas and NumPy
* Machine learning with scikit-learn
* Time-series-style forecasting
* API integration
* Generative AI integration
* JSON-based AI responses
* Error handling
* Budget analytics
* Data visualization
* Git and GitHub
* Software project architecture

---

# 👨‍💻 Project Purpose

This project was developed as a practical portfolio project to demonstrate how **software development, data analytics, machine learning, and generative AI** can be combined into a real-world personal finance application.

---

## ⭐ If you find this project useful

Feel free to explore the repository, experiment with the application, and extend it with additional financial analytics and forecasting capabilities.
