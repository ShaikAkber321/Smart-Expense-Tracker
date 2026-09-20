import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart3,
  Sparkles,
  Bot,
  Wallet,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onResetData: () => void;
  transactionCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  onResetData,
  transactionCount,
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses' as ActiveTab, label: 'Expenses', icon: Receipt, badge: transactionCount },
    { id: 'add-expense' as ActiveTab, label: 'Add Expense', icon: PlusCircle },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
    { id: 'predictive-insights' as ActiveTab, label: 'Predictive Insights', icon: Sparkles, tag: 'ML' },
    { id: 'ai-tips' as ActiveTab, label: 'AI Saving Tips', icon: Bot, tag: 'AI' },
    { id: 'budget' as ActiveTab, label: 'Budget', icon: Wallet },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col p-5 border-r border-slate-800 shrink-0 z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            ₹
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg tracking-tight">SmartExpense</h1>
            <p className="text-[11px] text-indigo-300 font-medium">Predictive AI Analytics</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {item.badge}
                  </span>
                )}
                {item.tag && (
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Reset Sample Data */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            onClick={onResetData}
            title="Reset dataset back to default 11 months of sample transactions"
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Data</span>
          </button>

          <div className="p-3 bg-slate-800/60 rounded-xl text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Engine Status</span>
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">Scikit-Learn & OpenAI Ready</div>
          </div>
        </div>
      </aside>
    </>
  );
};
