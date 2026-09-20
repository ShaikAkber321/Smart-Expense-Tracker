# Smart Expense Tracker with Predictive Insights

A production-ready personal finance and expense forecasting platform built with Python, Flask, MySQL, vanilla JavaScript, and Chart.js. The system integrates machine learning regression for next-month expenditure forecasting and utilizes OpenAI's API to analyze summarized financial patterns and deliver actionable, non-advisory saving recommendations.

---

## Overview

Managing personal finances often fails because traditional expense trackers are strictly retrospective—they tell you what you spent, not what you are likely to spend next. **Smart Expense Tracker with Predictive Insights** bridges this gap by combining real-time transaction recording with time-series predictive analytics and generative AI financial guidance.

The application allows users to record, categorize, filter, and budget their daily transactions. A machine learning forecasting engine trains on historical monthly spending patterns to project the upcoming month's total expenditure and category breakdown. To help users optimize their spending, an OpenAI integration analyzes high-level financial metrics to provide tactical saving suggestions and budget adjustments without exposing raw sensitive line items.

---

## Features

- **Full Expense CRUD Management**:
  - Add, edit, view, and delete transactions with instant calculation updates.
  - Search by merchant or notes.
  - Granular multi-dimensional filtering by Category, Payment Method, and Date Range.
  - Sort by Date (newest/oldest), Amount (high/low), or Title.
- **Dynamic Interactive Dashboard**:
  - Top KPI cards: Current month spending, last month spending, MoM shift %, average daily burn, and highest spending category.
  - Budget status progress bar with automatic threshold warnings (75%, 90%, and 100% exceeded).
  - 6 interactive Chart.js visualizations:
    1. Monthly spending trend line chart (trailing 6 months).
    2. Category-wise expenditure doughnut breakdown.
    3. Actual spending history vs. forecasted next month comparison chart.
    4. Payment method distribution chart (UPI, Credit Card, Debit Card, Cash, Net Banking).
    5. Weekday vs. weekend consumption profile (average spend by day of week).
    6. Master budget vs. actual consumption burn bar chart.
- **Data Analytics Engine**:
  - Powered by pandas and NumPy.
  - Calculates mean, median, standard deviation, minimum, and maximum expense values.
  - Month-over-month (MoM) growth rates.
  - Category frequency and expenditure matrix.
  - Identifies top 5 high-value spending outliers.
- **Time-Series Next-Month Expense Prediction**:
  - Aggregates multi-month historical transaction records into chronological series.
  - Evaluates linear trend slopes using `scikit-learn` Linear Regression paired with a 3-month weighted moving average (WMA).
  - Generates next-month overall expenditure and category-level forecasts.
  - Computes model confidence scores and uncertainty ranges based on Mean Absolute Percentage Error (MAPE).
  - Enforces data sufficiency checks: requires a minimum of 3 historical months before forecasting to avoid misleading predictions.
- **OpenAI AI Financial Advisory**:
  - Uses the official OpenAI Python SDK.
  - Transmits strictly summarized metrics (spending totals, category percentages, budget limits, MoM change) to safeguard user privacy.
  - Generates structured JSON output: executive summary, top spending concerns, personalized saving tips, budget adjustments, and a single high-priority action.
  - Graceful fallback: Includes an intelligent heuristic engine that continues to provide recommendations if an OpenAI API key is unavailable or rate-limited.
- **Rule-Based Smart Insights**:
  - Automated detection of budget risks, category surges (>25% MoM increase), positive spending reductions (>20% drop), and single high-value anomalous transactions.
- **Budget Allocation Engine**:
  - Master monthly budget and category-specific allowances.
  - Color-coded visual alert triggers: Normal (<75%), Caution (75%-89%), Critical (90%-99%), and Exceeded (≥100%).

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Tailwind CSS | Responsive, accessible UI layout and styling |
| | Vanilla JavaScript (ES6+) | Asynchronous DOM manipulation and REST API interactions |
| | Chart.js | Interactive canvas-based data visualizations |
| | Lucide Icons | Clean SVG iconography |
| **Backend** | Python 3.10+ | Core application runtime |
| | Flask 3.0+ | Lightweight RESTful API framework and routing |
| | Flask-SQLAlchemy | Object-Relational Mapping (ORM) and transaction management |
| | PyMySQL | Pure-Python MySQL client library |
| **Data & ML** | pandas & NumPy | Data manipulation, statistical aggregation, and feature extraction |
| | scikit-learn | Time-series regression modeling (`LinearRegression`) |
| **Artificial Intelligence** | OpenAI Python SDK | Structured financial guidance and budget optimization |
| **Database** | MySQL 8.0+ | Relational storage with strict data constraints and indexing |
| **Testing** | pytest | Unit and integration testing |

---

## System Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │          Client (Browser / Device)           │
                       │   HTML5 / CSS3 / Vanilla JS / Chart.js      │
                       └──────────────────────┬───────────────────────┘
                                              │ HTTP / JSON REST APIs
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │              Flask Application               │
                       │   (Blueprints: Expenses, Dashboard, AI, ML)  │
                       └──────┬───────────────┬───────────────┬───────┘
                              │               │               │
                              ▼               ▼               ▼
                      ┌──────────────┐┌──────────────┐┌──────────────┐
                      │  Analytics   ││  Prediction  ││    OpenAI    │
                      │   Service    ││   Service    ││   Service    │
                      │ (pandas/NumPy││ (scikit-learn││(Summaries In,│
                      │ Aggregations)││ Trend & WMA) ││Structured AI)│
                      └──────┬───────┘└──────┬───────┘└──────────────┘
                             │               │
                             ▼               ▼
                       ┌──────────────────────────────────────────────┐
                       │           Flask-SQLAlchemy (ORM)             │
                       └──────────────────────┬───────────────────────┘
                                              │ Parameterized Queries
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │             MySQL Database                   │
                       │     - expenses (DECIMAL, indexed dates)      │
                       │     - budgets  (Unique category & period)    │
                       └──────────────────────────────────────────────┘
```

---

## Database Schema

Database Name: `smart_expense_tracker`

### 1. `expenses` Table
Stores individual recorded financial transactions. Monetary values are strictly stored using `DECIMAL(10, 2)` to eliminate floating-point rounding inaccuracies.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | PRIMARY KEY, AUTO_INCREMENT | Unique transaction identifier |
| `user_id` | `INT` | NULLABLE, FOREIGN KEY | Optional user association |
| `title` | `VARCHAR(150)` | NOT NULL | Merchant or expense title |
| `amount` | `DECIMAL(10, 2)`| NOT NULL, > 0.00 | Monetary value in rupees |
| `category` | `ENUM(...)` | NOT NULL, INDEXED | Food, Travel, Shopping, Bills, etc. |
| `description`| `TEXT` | NULLABLE | Supplementary notes |
| `expense_date`| `DATE` | NOT NULL, INDEXED | Transaction date (YYYY-MM-DD) |
| `payment_method`| `ENUM(...)` | NOT NULL, INDEXED | Cash, Credit Card, Debit Card, UPI, etc. |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

### 2. `budgets` Table
Defines spending caps per category or for the whole month.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | PRIMARY KEY, AUTO_INCREMENT | Unique budget record ID |
| `user_id` | `INT` | NULLABLE, FOREIGN KEY | Optional user association |
| `category` | `VARCHAR(50)` | NOT NULL, DEFAULT 'Overall' | Target category or 'Overall' |
| `monthly_limit` | `DECIMAL(10, 2)` | NOT NULL, > 0.00 | Budget allowance ceiling |
| `month` | `INT` | NOT NULL, CHECK (1-12) | Calendar month index |
| `year` | `INT` | NOT NULL, CHECK (≥2000) | Calendar year |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

*A UNIQUE composite constraint `(category, month, year, user_id)` guarantees one budget per category per period.*

---

## Prediction Methodology

Accurate expense forecasting presents unique challenges: personal financial data is often volatile, affected by irregular purchases, seasonal bills, and changing lifestyle patterns.

### Pipeline:
1. **Chronological Aggregation**:
   Raw transactions are grouped by calendar month (`Period('M')`) to compute total historical monthly spends and category spending distributions.
2. **Data Sufficiency Threshold**:
   The engine checks if at least **3 distinct months** of historical data exist (`MIN_REQUIRED_MONTHS = 3`). If fewer months are present, the system declines to make an arbitrary forecast and returns:
   > *"Not enough historical data for a reliable prediction. Continue recording expenses to unlock predictive insights."*
3. **Feature Engineering**:
   - Time index step: $X = [0, 1, 2, ..., n-1]$.
   - Lagged features: Previous month spending ($t-1$) and trailing 3-month spending.
   - Rolling moving averages (3-month window).
4. **Ensemble Forecast Model**:
   - **Linear Regression**: Fits a trendline across the monthly index to detect continuous spending growth or reduction.
   - **Weighted Moving Average (WMA)**: Computes a recency-weighted average ($w = [0.2, 0.3, 0.5]$) giving highest influence to the immediate past 30 days.
   - **Ensemble Blend**:
     $$\text{Predicted Total} = 0.60 \times \text{WMA} + 0.40 \times \text{Linear Trend}$$
5. **Category-Level Projections**:
   Computes trailing 3-month category ratios ($\text{ratio}_c = \frac{\bar{S}_c}{\sum \bar{S}}$) and applies them to the predicted total to distribute expected expenses across Food, Groceries, Rent, Utilities, etc.
6. **Uncertainty & Confidence Estimation**:
   Computes the Mean Absolute Percentage Error (MAPE) of the model across the historical window. The confidence score is computed as:
   $$\text{Confidence Score} = \max\left(50, \min\left(95, \text{round}\left((1.0 - \text{MAPE}) \times 100\right)\right)\right)$$
   An uncertainty band ($\pm \text{Margin}$) is returned alongside the point estimate.

---

## OpenAI Integration

### Privacy-Preserving Prompt Design
Personal transaction titles (e.g., specific store names, medical notes) are **never** transmitted to third-party language models. Instead, the backend aggregates data into an anonymized financial digest:

```
Monthly spending: 48,200
Budget: 50,000
Month-over-Month change: +12.4%
Predicted next month: 49,800
Category spending:
  - Rent: 22,000
  - Groceries: 8,800
  - Food: 6,400
  - Shopping: 5,200
  - Utilities: 3,400
  - Travel: 2,400
```

### JSON Schema Enforcement
The model is constrained to return a verified JSON object:
```json
{
  "summary": "Monthly overview in 2 sentences.",
  "top_concerns": ["Specific observation on surging categories."],
  "saving_tips": ["Practical, numbered recommendations."],
  "budget_suggestions": ["Target adjustment values."],
  "priority_action": "Single immediate task."
}
```

### Resilience & Disclaimer
- If `OPENAI_API_KEY` is not present, or if OpenAI encounters rate limits or network issues, the application smoothly triggers an internal heuristic rules engine. The user interface remains 100% functional.
- Every AI response contains an explicit disclaimer: *"AI-generated financial guidance for informational and budgeting purposes only. Not certified financial advice."*

---

## Installation

### Prerequisites
- Python 3.10 or higher
- MySQL Server 8.0+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Create and Activate Virtual Environment
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your variables in `.env`:
```ini
# Flask Environment
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=generate_a_secure_random_key_here

# Database Configuration (MySQL)
DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/smart_expense_tracker

# OpenAI API
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Currency Symbol
CURRENCY_SYMBOL=₹
```

---

## Database Setup

### 1. Initialize Database & Tables via MySQL Client
```bash
mysql -u root -p < database/schema.sql
```

Alternatively, running `app.py` or the seed script will automatically verify and create missing tables via SQLAlchemy `db.create_all()`.

### 2. Populate Realistic Sample Data (11 Months)
To evaluate the analytics and machine learning prediction models immediately with realistic spending patterns:
```bash
python data/seed_data.py
```

---

## Running the Application

### Development Server
```bash
python app.py
```
Open your browser and navigate to:
```
http://localhost:5000
```

### Production Deployment (Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## Running Automated Tests

Run the test suite using `pytest`:
```bash
pytest -v tests/test_app.py
```
The test suite covers:
- Expense CRUD creation, updates, and deletions.
- Validation checks (negative values, empty titles, invalid categories).
- Filtering by category, payment method, date range, and sorting.
- Analytics calculations and standard deviations.
- Prediction service with sufficient data (>3 months) vs. insufficient data (<3 months).
- AI insights response schemas and fallback handling.

---

## API Endpoints

All responses follow a consistent envelope:
```json
{
  "success": true,
  "message": "Status description",
  "data": { ... },
  "errors": []
}
```

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/expenses` | List expenses with search, category, method, date, and sort query parameters |
| `POST` | `/api/expenses` | Record a new expense (validated payload) |
| `GET` | `/api/expenses/<id>` | Fetch single expense details |
| `PUT` | `/api/expenses/<id>` | Update an existing transaction |
| `DELETE` | `/api/expenses/<id>` | Delete transaction by ID |
| `GET` | `/api/dashboard` | Aggregated dashboard KPI numbers and 6 Chart.js datasets |
| `GET` | `/api/analytics` | Deep statistical matrix (mean, median, std dev, outliers, weekday profile) |
| `GET` | `/api/prediction` | Next-month time-series forecasting, category breakdown, confidence scores |
| `GET` | `/api/insights` | Rule-based smart pattern recognition cards (budget warnings, surges) |
| `GET` | `/api/budget` | Current month overall and category budget limits with percentage burn |
| `POST` | `/api/budget` | Set or update a category or master budget limit |
| `DELETE` | `/api/budget/<id>` | Remove a budget cap |
| `POST` | `/api/ai/insights` | Request tailored saving recommendations from OpenAI based on summaries |

---

## Project Structure

```
smart-expense-tracker/
│
├── app.py                      # Application entry point & factory
├── config.py                   # Configuration classes (Dev, Test, Prod)
├── requirements.txt            # Pinned dependencies
├── .env.example                # Sample environment variables
├── .gitignore                  # Git ignore rules
├── README.md                   # Project documentation
│
├── database/
│   └── schema.sql              # Clean MySQL schema with DECIMAL and indexes
│
├── models/
│   ├── __init__.py             # SQLAlchemy instance initialization
│   ├── expense.py              # Expense database model and serializers
│   └── budget.py               # Budget database model
│
├── routes/
│   ├── __init__.py             # Blueprints registration
│   ├── expense_routes.py       # CRUD, search, filter, sort endpoints
│   ├── dashboard_routes.py     # Aggregated KPIs & Chart.js data endpoints
│   ├── prediction_routes.py    # Time-series ML forecasting endpoints
│   └── ai_routes.py            # OpenAI integration endpoints
│
├── services/
│   ├── __init__.py             # Services exports
│   ├── analytics_service.py    # pandas & NumPy statistical analysis
│   ├── prediction_service.py   # scikit-learn regression & WMA forecasting
│   └── openai_service.py       # OpenAI client with structured prompting & fallback
│
├── utils/
│   ├── __init__.py
│   ├── validators.py           # Request payload sanitization & validation
│   └── helpers.py              # Currency formatting, percentage math, response wrappers
│
├── templates/
│   ├── base.html               # Master layout with responsive sidebar
│   ├── dashboard.html          # Main overview with 6 Chart.js graphs
│   ├── expenses.html           # Full CRUD table with filter toolbar & edit modal
│   ├── add_expense.html        # Dedicated transaction input form
│   ├── analytics.html          # Deep statistical tables & outlier inspector
│   ├── insights.html           # Predictive forecasting & OpenAI saving tips
│   └── budget.html             # Budget allocation sliders & warning thresholds
│
├── static/
│   ├── css/
│   │   └── style.css           # Custom UI refinements
│   └── js/
│       ├── dashboard.js        # Dashboard state & chart loaders
│       ├── expenses.js         # Expense table controller & edit handlers
│       └── charts.js           # Reusable Chart.js chart factory
│
├── data/
│   ├── sample_expenses.csv     # 11-month realistic sample transaction dataset
│   └── seed_data.py            # Automated database seeding utility
│
└── tests/
    └── test_app.py             # Complete automated test suite (pytest)
```

---

## Future Enhancements

- **Receipt OCR**: Automatic extraction of total amounts, dates, and line items from photographed receipts using vision models.
- **Automated Bank SMS Parsing**: Android/PWA notification listener to log UPI and credit card debits automatically.
- **Export Formats**: One-click export to formatted Excel workbooks (`.xlsx`) and tax-ready PDF summaries.
- **Recurring Subscriptions Engine**: Automatic detection of monthly charges (e.g. Netflix, broadband) with renewal reminders.

---

## Limitations

- **Predictive Models**: Time-series linear regression and moving averages require ongoing consistent recording. Unforeseen one-off emergencies cannot be predicted by mathematical models alone.
- **Anonymized AI Prompts**: OpenAI receives summarized category metrics rather than line items, meaning suggestions focus on category-level adjustments rather than individual product brands.

---

## Disclaimer

Smart Expense Tracker with Predictive Insights is a personal finance tool designed for tracking and budgeting assistance. Projections and AI-generated insights are mathematical estimates and informational suggestions; they do not constitute certified financial, tax, or investment advice.
