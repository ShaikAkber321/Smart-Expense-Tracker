"""
OpenAI Integration Service
Generates personalized financial guidance, budget adjustments, and saving tips
using the official OpenAI Python SDK on summarized financial data.
"""

import os
import json
import logging
from utils.helpers import format_currency

logger = logging.getLogger(__name__)

class OpenAIService:
    @staticmethod
    def _build_prompt(summary_data):
        """Constructs the prompt containing only high-level summarized metrics."""
        category_lines = "\n".join(
            [f"  - {cat}: ₹{amt:,.2f}" for cat, amt in summary_data.get("category_spending", {}).items()]
        )

        return f"""You are a professional personal finance advisor AI.
Analyze the following summarized monthly expense metrics and generate actionable, realistic financial guidance.

SUMMARY DATA:
- Current Month Spending: ₹{summary_data.get('monthly_spending', 0):,.2f}
- Monthly Budget: ₹{summary_data.get('budget', 0):,.2f}
- Month-over-Month Change: {summary_data.get('mom_change_pct', 0)}%
- Predicted Next Month Expense: ₹{summary_data.get('predicted_next_month', 0):,.2f}
- Category Breakdown:
{category_lines}

INSTRUCTIONS:
1. Provide personalized saving tips focusing on the highest and surging categories.
2. Identify top spending concerns (e.g. nearing or exceeding budget, category surges).
3. Suggest concrete budget adjustments with target numbers.
4. Define ONE high-priority immediate action the user should take this week.
5. Provide a concise, encouraging 2-sentence monthly summary.

REQUIRED JSON FORMAT:
Return ONLY a valid JSON object matching this exact schema (no markdown fences, no preamble):
{{
  "summary": "Concise 2-sentence financial overview.",
  "top_concerns": [
    "Specific observation about budget or high-expenditure category."
  ],
  "saving_tips": [
    "Actionable tip with realistic rupee targets."
  ],
  "budget_suggestions": [
    "Specific category or overall budget adjustment suggestion."
  ],
  "priority_action": "The single most impactful immediate step."
}}"""

    @classmethod
    def generate_savings_insights(cls, summary_data):
        """
        Calls OpenAI API with summarized data.
        Falls back to intelligent rule-based generation if API key is missing or call fails.
        """
        api_key = os.getenv("OPENAI_API_KEY", "").strip()

        if not api_key:
            logger.warning("OPENAI_API_KEY not configured. Using rule-based fallback analytics.")
            return cls._generate_fallback_insights(summary_data, reason="No API key provided.")

        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

            prompt = cls._build_prompt(summary_data)

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a financial analyst assistant. Always respond with pure JSON adhering to the specified schema."
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
                max_tokens=800,
                response_format={"type": "json_object"}
            )

            raw_content = response.choices[0].message.content.strip()
            parsed = json.loads(raw_content)

            # Validate required schema keys
            required_keys = ["summary", "top_concerns", "saving_tips", "budget_suggestions", "priority_action"]
            for k in required_keys:
                if k not in parsed:
                    parsed[k] = [] if k != "summary" and k != "priority_action" else ""

            parsed["is_ai_generated"] = True
            parsed["model_used"] = model
            parsed["disclaimer"] = "AI-generated financial guidance for informational and budgeting purposes only. Not certified financial advice."
            return parsed

        except Exception as e:
            logger.error(f"OpenAI API call failed: {str(e)}")
            return cls._generate_fallback_insights(summary_data, reason=f"API temporarily unavailable ({type(e).__name__})")

    @staticmethod
    def _generate_fallback_insights(summary_data, reason=""):
        """
        Robust heuristic fallback ensuring the application provides deep, actionable
        insights even without active OpenAI credentials.
        """
        spending = summary_data.get("monthly_spending", 0)
        budget = summary_data.get("budget", 30000)
        mom = summary_data.get("mom_change_pct", 0)
        predicted = summary_data.get("predicted_next_month", spending)
        cats = summary_data.get("category_spending", {})

        top_cats = sorted(cats.items(), key=lambda x: x[1], reverse=True)
        primary_cat = top_cats[0][0] if top_cats else "Discretionary"
        primary_amt = top_cats[0][1] if top_cats else 0
        secondary_cat = top_cats[1][0] if len(top_cats) > 1 else "Shopping"

        used_pct = round((spending / budget * 100) if budget > 0 else 0, 1)

        concerns = []
        if used_pct >= 90:
            concerns.append(f"You have utilized {used_pct}% of your ₹{budget:,.0f} budget with minimal buffer remaining.")
        if mom > 10:
            concerns.append(f"Spending increased by {mom}% compared with last month, driven heavily by {primary_cat}.")
        if primary_amt > (spending * 0.35) and spending > 0:
            concerns.append(f"{primary_cat} accounts for {round(primary_amt/spending*100, 1)}% of your monthly expenditure.")
        if not concerns:
            concerns.append("Your expenses are well distributed with no alarming single-category outliers.")

        tips = [
            f"Set a weekly cap on {primary_cat} to reduce overall monthly spending by approximately ₹{round(primary_amt * 0.15, -2):,.0f}.",
            f"Review recurring subscriptions under {secondary_cat} and utilities for recurring non-essential charges.",
            f"Allocate at least 15% of your remaining budget (₹{max(0, budget - spending):,.0f}) to savings before month-end.",
        ]

        suggestions = [
            f"Cap {primary_cat} budget at ₹{round(primary_amt * 0.9, -2):,.0f} for next month to match historical averages.",
            f"Maintain an emergency buffer of ₹{round(budget * 0.1, -2):,.0f} to absorb seasonal expense spikes.",
        ]

        summary_text = (
            f"Current month spending stands at ₹{spending:,.0f} ({used_pct}% of budget). "
            f"Forecasting models estimate next month's spending around ₹{predicted:,.0f}."
        )

        priority = f"Review and restrict discretionary transactions in {primary_cat} over the next 7 days."

        return {
            "summary": summary_text,
            "top_concerns": concerns,
            "saving_tips": tips,
            "budget_suggestions": suggestions,
            "priority_action": priority,
            "is_ai_generated": False,
            "fallback_active": True,
            "note": f"Generated via Smart Heuristic Engine ({reason})",
            "disclaimer": "AI-generated financial guidance for informational and budgeting purposes only. Not certified financial advice.",
        }
