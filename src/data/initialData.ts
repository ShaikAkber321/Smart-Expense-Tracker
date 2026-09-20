import { Expense, Budget } from '../types';

export const DEFAULT_BUDGETS: Budget[] = [
  { id: 1, category: 'Overall', monthly_limit: 50000, month: 3, year: 2026 },
  { id: 2, category: 'Groceries', monthly_limit: 10000, month: 3, year: 2026 },
  { id: 3, category: 'Food', monthly_limit: 6500, month: 3, year: 2026 },
  { id: 4, category: 'Shopping', monthly_limit: 7000, month: 3, year: 2026 },
  { id: 5, category: 'Travel', monthly_limit: 4500, month: 3, year: 2026 },
  { id: 6, category: 'Utilities', monthly_limit: 4000, month: 3, year: 2026 },
  { id: 7, category: 'Bills', monthly_limit: 3500, month: 3, year: 2026 },
];

export const DEFAULT_EXPENSES: Expense[] = [
  // March 2026 (Current month)
  { id: 1, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2026-03-01', payment_method: 'Bank Transfer', description: 'Primary residence lease' },
  { id: 2, title: 'Fiber Broadband Internet', amount: 1199.00, category: 'Bills', expense_date: '2026-03-02', payment_method: 'UPI', description: 'Monthly 300Mbps bill' },
  { id: 3, title: 'Weekly Organic Grocery Run', amount: 3840.50, category: 'Groceries', expense_date: '2026-03-04', payment_method: 'UPI', description: 'Vegetables, milk, grains' },
  { id: 4, title: 'Weekend Dinner & Drinks', amount: 2150.00, category: 'Food', expense_date: '2026-03-07', payment_method: 'Credit Card', description: 'Italian bistro' },
  { id: 5, title: 'Metro Smart Card Recharge', amount: 1000.00, category: 'Travel', expense_date: '2026-03-09', payment_method: 'UPI', description: 'Monthly transit' },
  { id: 6, title: 'Electricity Utility Bill', amount: 2450.00, category: 'Utilities', expense_date: '2026-03-11', payment_method: 'Debit Card', description: 'State power supply' },
  { id: 7, title: 'Mid-Month Supermarket Restock', amount: 4120.00, category: 'Groceries', expense_date: '2026-03-14', payment_method: 'UPI', description: 'Household essentials' },
  { id: 8, title: 'Casual Friday Cafe Meetup', amount: 780.00, category: 'Food', expense_date: '2026-03-16', payment_method: 'UPI', description: 'Coffee & bakery items' },
  { id: 9, title: 'Spring Wardrobe Casual Wear', amount: 4890.00, category: 'Shopping', expense_date: '2026-03-18', payment_method: 'Credit Card', description: 'Cotton shirts and trousers' },
  { id: 10, title: 'OTT Streaming Bundle', amount: 899.00, category: 'Entertainment', expense_date: '2026-03-19', payment_method: 'Credit Card', description: 'Subscription renewal' },

  // February 2026 (Last month)
  { id: 11, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2026-02-01', payment_method: 'Bank Transfer', description: 'Primary residence' },
  { id: 12, title: 'Fiber Broadband Internet', amount: 1199.00, category: 'Bills', expense_date: '2026-02-02', payment_method: 'UPI', description: 'Internet provider' },
  { id: 13, title: 'Fresh Produce & Dairy', amount: 3650.00, category: 'Groceries', expense_date: '2026-02-04', payment_method: 'UPI', description: 'Weekly groceries' },
  { id: 14, title: 'Weekend Dining & Delivery', amount: 2400.00, category: 'Food', expense_date: '2026-02-08', payment_method: 'Credit Card', description: 'Food delivery' },
  { id: 15, title: 'Cab Commute to Airport', amount: 1450.00, category: 'Travel', expense_date: '2026-02-11', payment_method: 'UPI', description: 'Out of town trip' },
  { id: 16, title: 'Electricity Utility Bill', amount: 2180.00, category: 'Utilities', expense_date: '2026-02-12', payment_method: 'Debit Card', description: 'Winter utility' },
  { id: 17, title: 'Mid-Month Grocery Restock', amount: 3950.00, category: 'Groceries', expense_date: '2026-02-15', payment_method: 'UPI', description: 'Groceries' },
  { id: 18, title: 'Winter Clearance Jacket', amount: 3200.00, category: 'Shopping', expense_date: '2026-02-18', payment_method: 'Credit Card', description: 'Seasonal discount' },
  { id: 19, title: 'Prescription Medicine', amount: 1250.00, category: 'Healthcare', expense_date: '2026-02-21', payment_method: 'Cash', description: 'Pharmacy' },
  { id: 20, title: 'Cinema Tickets & Snacks', amount: 1100.00, category: 'Entertainment', expense_date: '2026-02-24', payment_method: 'UPI', description: 'Movie night' },

  // January 2026
  { id: 21, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2026-01-01', payment_method: 'Bank Transfer' },
  { id: 22, title: 'New Year Dinner Party', amount: 4800.00, category: 'Food', expense_date: '2026-01-02', payment_method: 'Credit Card' },
  { id: 23, title: 'Broadband Internet', amount: 1199.00, category: 'Bills', expense_date: '2026-01-03', payment_method: 'UPI' },
  { id: 24, title: 'Monthly Supermarket Staples', amount: 8200.00, category: 'Groceries', expense_date: '2026-01-06', payment_method: 'Debit Card' },
  { id: 25, title: 'Annual Tech Certification Course', amount: 6500.00, category: 'Education', expense_date: '2026-01-10', payment_method: 'Credit Card' },
  { id: 26, title: 'Electricity & Gas Bill', amount: 2850.00, category: 'Utilities', expense_date: '2026-01-13', payment_method: 'Bank Transfer' },
  { id: 27, title: 'Metro & Cab Travel', amount: 2300.00, category: 'Travel', expense_date: '2026-01-19', payment_method: 'UPI' },
  { id: 28, title: 'Home Decor & Rug', amount: 3900.00, category: 'Shopping', expense_date: '2026-01-24', payment_method: 'Credit Card' },

  // December 2025
  { id: 29, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2025-12-01', payment_method: 'Bank Transfer' },
  { id: 30, title: 'Broadband Bill', amount: 1199.00, category: 'Bills', expense_date: '2025-12-02', payment_method: 'UPI' },
  { id: 31, title: 'Weekly Groceries', amount: 7900.00, category: 'Groceries', expense_date: '2025-12-07', payment_method: 'UPI' },
  { id: 32, title: 'Holiday Gifts & Apparel', amount: 8500.00, category: 'Shopping', expense_date: '2025-12-14', payment_method: 'Credit Card' },
  { id: 33, title: 'Year-End Gathering & Dine Out', amount: 5600.00, category: 'Food', expense_date: '2025-12-22', payment_method: 'Credit Card' },
  { id: 34, title: 'Train Tickets to Hometown', amount: 3400.00, category: 'Travel', expense_date: '2025-12-24', payment_method: 'UPI' },
  { id: 35, title: 'Utilities Power & Gas', amount: 2600.00, category: 'Utilities', expense_date: '2025-12-28', payment_method: 'Debit Card' },

  // November 2025
  { id: 36, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2025-11-01', payment_method: 'Bank Transfer' },
  { id: 37, title: 'Broadband Bill', amount: 1199.00, category: 'Bills', expense_date: '2025-11-03', payment_method: 'UPI' },
  { id: 38, title: 'Groceries & Provisions', amount: 7450.00, category: 'Groceries', expense_date: '2025-11-08', payment_method: 'UPI' },
  { id: 39, title: 'Electronics Upgrade (Headphones)', amount: 6999.00, category: 'Shopping', expense_date: '2025-11-15', payment_method: 'Credit Card' },
  { id: 40, title: 'Dine Out & Quick Bites', amount: 3200.00, category: 'Food', expense_date: '2025-11-20', payment_method: 'Debit Card' },
  { id: 41, title: 'Commute Metro Passes', amount: 1600.00, category: 'Travel', expense_date: '2025-11-24', payment_method: 'UPI' },
  { id: 42, title: 'Electricity Power Bill', amount: 2300.00, category: 'Utilities', expense_date: '2025-11-28', payment_method: 'Debit Card' },

  // October 2025
  { id: 43, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2025-10-01', payment_method: 'Bank Transfer' },
  { id: 44, title: 'Festival Shopping & Sweets', amount: 9800.00, category: 'Shopping', expense_date: '2025-10-10', payment_method: 'Credit Card' },
  { id: 45, title: 'Supermarket Provisions', amount: 8100.00, category: 'Groceries', expense_date: '2025-10-14', payment_method: 'UPI' },
  { id: 46, title: 'Family Festival Dinner', amount: 4500.00, category: 'Food', expense_date: '2025-10-18', payment_method: 'Credit Card' },
  { id: 47, title: 'Flight Tickets for Holidays', amount: 7500.00, category: 'Travel', expense_date: '2025-10-22', payment_method: 'Credit Card' },
  { id: 48, title: 'Broadband & Utilities', amount: 3600.00, category: 'Bills', expense_date: '2025-10-25', payment_method: 'Debit Card' },

  // September 2025
  { id: 49, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2025-09-01', payment_method: 'Bank Transfer' },
  { id: 50, title: 'Groceries Monthly', amount: 7300.00, category: 'Groceries', expense_date: '2025-09-06', payment_method: 'UPI' },
  { id: 51, title: 'Dining Out', amount: 3100.00, category: 'Food', expense_date: '2025-09-12', payment_method: 'Credit Card' },
  { id: 52, title: 'Commute & Fuel', amount: 2400.00, category: 'Travel', expense_date: '2025-09-18', payment_method: 'UPI' },
  { id: 53, title: 'Electricity Bill', amount: 2800.00, category: 'Utilities', expense_date: '2025-09-24', payment_method: 'Debit Card' },

  // August 2025
  { id: 54, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2025-08-01', payment_method: 'Bank Transfer' },
  { id: 55, title: 'Groceries Monthly', amount: 7100.00, category: 'Groceries', expense_date: '2025-08-08', payment_method: 'UPI' },
  { id: 56, title: 'Weekend Dining', amount: 2800.00, category: 'Food', expense_date: '2025-08-15', payment_method: 'Credit Card' },
  { id: 57, title: 'Apparel & Footwear', amount: 4200.00, category: 'Shopping', expense_date: '2025-08-20', payment_method: 'Credit Card' },
  { id: 58, title: 'Power Utilities', amount: 3200.00, category: 'Utilities', expense_date: '2025-08-27', payment_method: 'Debit Card' },

  // July 2025
  { id: 59, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2025-07-01', payment_method: 'Bank Transfer' },
  { id: 60, title: 'Supermarket Groceries', amount: 7000.00, category: 'Groceries', expense_date: '2025-07-07', payment_method: 'UPI' },
  { id: 61, title: 'Dining & Cafes', amount: 2950.00, category: 'Food', expense_date: '2025-07-14', payment_method: 'UPI' },
  { id: 62, title: 'Transit Pass', amount: 1800.00, category: 'Travel', expense_date: '2025-07-21', payment_method: 'UPI' },
  { id: 63, title: 'Electricity AC Usage', amount: 3800.00, category: 'Utilities', expense_date: '2025-07-28', payment_method: 'Debit Card' },

  // June 2025
  { id: 64, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2025-06-01', payment_method: 'Bank Transfer' },
  { id: 65, title: 'Groceries', amount: 6850.00, category: 'Groceries', expense_date: '2025-06-06', payment_method: 'UPI' },
  { id: 66, title: 'Casual Dining', amount: 2600.00, category: 'Food', expense_date: '2025-06-13', payment_method: 'Credit Card' },
  { id: 67, title: 'Summer Utilities', amount: 3900.00, category: 'Utilities', expense_date: '2025-06-25', payment_method: 'Debit Card' },

  // May 2025
  { id: 68, title: 'Apartment Monthly Rent', amount: 22000.00, category: 'Rent', expense_date: '2025-05-01', payment_method: 'Bank Transfer' },
  { id: 69, title: 'Groceries', amount: 6700.00, category: 'Groceries', expense_date: '2025-05-08', payment_method: 'UPI' },
  { id: 70, title: 'Books & Course Subscription', amount: 3500.00, category: 'Education', expense_date: '2025-05-18', payment_method: 'Credit Card' },
  { id: 71, title: 'Dining Out', amount: 2400.00, category: 'Food', expense_date: '2025-05-22', payment_method: 'Cash' },
];

const STORAGE_EXPENSES_KEY = 'smart_expenses_records_v1';
const STORAGE_BUDGETS_KEY = 'smart_budgets_records_v1';

export function loadStoredExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_EXPENSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored expenses', e);
  }
  return DEFAULT_EXPENSES;
}

export function saveStoredExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses', e);
  }
}

export function loadStoredBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(STORAGE_BUDGETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored budgets', e);
  }
  return DEFAULT_BUDGETS;
}

export function saveStoredBudgets(budgets: Budget[]): void {
  try {
    localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(budgets));
  } catch (e) {
    console.error('Error saving budgets', e);
  }
}

export function resetToDefaultData(): { expenses: Expense[]; budgets: Budget[] } {
  localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(DEFAULT_EXPENSES));
  localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(DEFAULT_BUDGETS));
  return { expenses: DEFAULT_EXPENSES, budgets: DEFAULT_BUDGETS };
}
