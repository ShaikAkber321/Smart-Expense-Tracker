import React, { useState, useMemo } from 'react';
import {
  Expense,
  Budget,
  ActiveTab,
  AIInsightsData,
} from './types';
import {
  loadStoredExpenses,
  saveStoredExpenses,
  loadStoredBudgets,
  saveStoredBudgets,
  resetToDefaultData,
} from './data/initialData';
import { computeAnalytics } from './services/analytics';
import { predictNextMonth } from './services/prediction';
import { generateAISavingTips } from './services/ai';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { AddExpenseView } from './components/AddExpenseView';
import { AnalyticsView } from './components/AnalyticsView';
import { PredictiveInsightsView } from './components/PredictiveInsightsView';
import { BudgetView } from './components/BudgetView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>(() => loadStoredExpenses());
  const [budgets, setBudgets] = useState<Budget[]>(() => loadStoredBudgets());
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Analytical metrics
  const analytics = useMemo(() => computeAnalytics(expenses), [expenses]);

  // Predictive time-series forecast
  const prediction = useMemo(() => predictNextMonth(expenses), [expenses]);

  // Current month totals for AI analysis
  const thisMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.expense_date.startsWith('2026-03'));
  }, [expenses]);
  const lastMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.expense_date.startsWith('2026-02'));
  }, [expenses]);

  const totalThisMonth = useMemo(() => {
    return thisMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [thisMonthExpenses]);

  const totalLastMonth = useMemo(() => {
    return lastMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [lastMonthExpenses]);

  // AI Insights state
  const [aiInsights, setAiInsights] = useState<AIInsightsData>(() =>
    generateAISavingTips(
      expenses,
      budgets,
      totalThisMonth,
      totalLastMonth,
      prediction.predicted_total
    )
  );

  const handleRefreshAI = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      const updated = generateAISavingTips(
        expenses,
        budgets,
        totalThisMonth,
        totalLastMonth,
        prediction.predicted_total
      );
      setAiInsights(updated);
      setIsAiLoading(false);
    }, 700);
  };

  // CRUD handlers
  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    const nextId = expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;
    const created: Expense = { ...newExp, id: nextId };
    const updated = [created, ...expenses];
    setExpenses(updated);
    saveStoredExpenses(updated);
  };

  const handleUpdateExpense = (updatedExp: Expense) => {
    const updated = expenses.map((e) => (e.id === updatedExp.id ? updatedExp : e));
    setExpenses(updated);
    saveStoredExpenses(updated);
  };

  const handleDeleteExpense = (id: number) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveStoredExpenses(updated);
  };

  const handleSaveBudget = (newBudget: Omit<Budget, 'id'>) => {
    const existingIndex = budgets.findIndex((b) => b.category === newBudget.category);
    let updated: Budget[];
    if (existingIndex >= 0) {
      updated = [...budgets];
      updated[existingIndex] = { ...newBudget, id: budgets[existingIndex].id };
    } else {
      const nextId = budgets.length > 0 ? Math.max(...budgets.map((b) => b.id)) + 1 : 1;
      updated = [...budgets, { ...newBudget, id: nextId }];
    }
    setBudgets(updated);
    saveStoredBudgets(updated);
  };

  const handleResetData = () => {
    if (confirm('Reset database with 11 months of realistic sample transactions and budgets?')) {
      const res = resetToDefaultData();
      setExpenses(res.expenses);
      setBudgets(res.budgets);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onResetData={handleResetData}
        transactionCount={expenses.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          expenses={expenses}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              expenses={expenses}
              budgets={budgets}
              prediction={prediction}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              onAddExpenseClick={() => setActiveTab('add-expense')}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'add-expense' && (
            <AddExpenseView
              onAddExpense={handleAddExpense}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView analytics={analytics} />
          )}

          {activeTab === 'predictive-insights' && (
            <PredictiveInsightsView
              prediction={prediction}
              aiInsights={aiInsights}
              onRefreshAI={handleRefreshAI}
              isAiLoading={isAiLoading}
              initialTab="forecast"
            />
          )}

          {activeTab === 'ai-tips' && (
            <PredictiveInsightsView
              prediction={prediction}
              aiInsights={aiInsights}
              onRefreshAI={handleRefreshAI}
              isAiLoading={isAiLoading}
              initialTab="ai"
            />
          )}

          {activeTab === 'budget' && (
            <BudgetView
              budgets={budgets}
              expenses={expenses}
              onSaveBudget={handleSaveBudget}
            />
          )}
        </main>
      </div>
    </div>
  );
}
