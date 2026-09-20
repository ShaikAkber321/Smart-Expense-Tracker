import React from 'react';
import { ActiveTab, Expense } from '../types';
import { Menu, Plus, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  toggleSidebar: () => void;
  expenses: Expense[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  toggleSidebar,
  expenses,
}) => {
  const getTitles = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Financial Dashboard',
          subtitle: 'Real-time overview, multi-chart visualizations, and forecasting telemetry',
        };
      case 'expenses':
        return {
          title: 'Expense Management',
          subtitle: 'Search, filter, categorize, and inspect recorded transactions',
        };
      case 'add-expense':
        return {
          title: 'Record New Transaction',
          subtitle: 'Add line items with payment method, amount, and category tags',
        };
      case 'analytics':
        return {
          title: 'Analytics Engine',
          subtitle: 'Descriptive statistical distributions, standard deviations, and spending habits',
        };
      case 'predictive-insights':
        return {
          title: 'Predictive Insights',
          subtitle: 'Machine learning regression and moving-average time-series forecasting',
        };
      case 'ai-tips':
        return {
          title: 'OpenAI Financial Advisory',
          subtitle: 'Personalized budget restructuring recommendations and tactical saving tips',
        };
      case 'budget':
        return {
          title: 'Budget Allocations',
          subtitle: 'Monthly spending boundaries and automated threshold warning alerts',
        };
      default:
        return { title: 'Overview', subtitle: 'Personal finance intelligence' };
    }
  };

  const { title, subtitle } = getTitles();

  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['ID', 'Title', 'Amount', 'Category', 'Date', 'Payment Method', 'Description'];
    const rows = expenses.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      e.category,
      e.expense_date,
      e.payment_method,
      `"${(e.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 sticky top-0 z-20 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-bold font-display text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        <button
          onClick={handleExportCSV}
          title="Export records to CSV"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={() => setActiveTab('add-expense')}
          id="header-quick-add-btn"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Add</span>
        </button>
      </div>
    </header>
  );
};
