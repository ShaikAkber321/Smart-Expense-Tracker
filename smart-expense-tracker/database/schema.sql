-- ==========================================================
-- Smart Expense Tracker with Predictive Insights
-- MySQL Database Schema
-- Database: smart_expense_tracker
-- ==========================================================

CREATE DATABASE IF NOT EXISTS smart_expense_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_expense_tracker;

-- Drop tables if they already exist to allow clean re-runs
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS users;

-- Optional Users Table for Multi-user support / authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Expenses Table
-- Monetary values safely stored using DECIMAL(10, 2)
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category ENUM(
        'Food',
        'Travel',
        'Shopping',
        'Bills',
        'Education',
        'Healthcare',
        'Entertainment',
        'Groceries',
        'Rent',
        'Utilities',
        'Other'
    ) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    payment_method ENUM(
        'Cash',
        'Credit Card',
        'Debit Card',
        'UPI',
        'Bank Transfer',
        'Other'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_expense_date (expense_date),
    INDEX idx_category (category),
    INDEX idx_payment_method (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Budgets Table
-- Category-level or overall monthly limits
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Overall',
    monthly_limit DECIMAL(10, 2) NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_budget_category_month_year (category, month, year, user_id),
    INDEX idx_budget_period (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
