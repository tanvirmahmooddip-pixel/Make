import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Landmark,
  Wallet,
  ArrowDownToLine,
  CheckCircle2,
  Calendar,
  Filter,
  PieChart,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { BankAccount, CurrencyCode, ExpenseCategory, ExpenseRecord, User } from '../types';
import { formatMoney } from '../utils/formatters';

interface ExpensesCashbookModuleProps {
  expenses: ExpenseRecord[];
  cashInHand: number;
  bankAccounts: BankAccount[];
  currentUser: User;
  activeBranchId: string;
  activeCurrency: CurrencyCode;
  onAddExpense: (expense: ExpenseRecord) => void;
  onOpenDepositModal: () => void;
}

export const ExpensesCashbookModule: React.FC<ExpensesCashbookModuleProps> = ({
  expenses,
  cashInHand,
  bankAccounts,
  currentUser,
  activeBranchId,
  activeCurrency,
  onAddExpense,
  onOpenDepositModal,
}) => {
  const [activeTab, setActiveTab] = useState<'expenses_list' | 'log_expense' | 'reconciliation'>('expenses_list');

  // New Expense State
  const [category, setCategory] = useState<ExpenseCategory>('tea_hospitality');
  const [amount, setAmount] = useState('3.500');
  const [paidFrom, setPaidFrom] = useState<ExpenseRecord['paidFrom']>('cash_drawer');
  const [paidTo, setPaidTo] = useState('Local Supplier / Cafeteria');
  const [description, setDescription] = useState('Tea, coffee and snacks for showroom visitors');
  const [referenceReceipt, setReferenceReceipt] = useState('');

  // End-of-day reconciliation manual physical count state
  const [actualCountedCash, setActualCountedCash] = useState<string>(cashInHand.toFixed(3));

  const categories: { id: ExpenseCategory; name: string }[] = [
    { id: 'tea_hospitality', name: 'Omani Hospitality & Karak Tea' },
    { id: 'transport_courier', name: 'Asyad Courier & Delivery' },
    { id: 'shop_rent', name: 'Commercial Showroom Rent' },
    { id: 'staff_salary', name: 'Staff Salary & Advance' },
    { id: 'utilities', name: 'Shop Electricity & Water' },
    { id: 'moci_baladiya_licenses', name: 'Baladiya & MOCI Govt Fees' },
    { id: 'maintenance_tools', name: 'Lab Tools & Consumables' },
    { id: 'marketing_promo', name: 'Instagram & TikTok Ads' },
    { id: 'misc', name: 'General Miscellaneous' },
  ];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    const catObj = categories.find((c) => c.id === category);

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category,
      categoryName: catObj?.name || category,
      amount: parsedAmount,
      paidFrom,
      paidTo,
      referenceReceipt: referenceReceipt || undefined,
      description,
      loggedBy: currentUser.name,
      branchId: activeBranchId,
    };

    onAddExpense(newExpense);
    setActiveTab('expenses_list');
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Group by category for monthly report
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.categoryName] = (categoryTotals[e.categoryName] || 0) + e.amount;
  });

  const parsedActualCount = parseFloat(actualCountedCash) || 0;
  const cashVariance = parsedActualCount - cashInHand;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" />
            <span>Daily Expenses & Cashbook Reconciliation</span>
          </h1>
          <p className="text-xs text-slate-400">
            Categorized spending, drawer petty cash tracking, and EOD cash drop into designated company bank accounts.
          </p>
        </div>

        {/* Tab & Deposit buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenDepositModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Bank Cash Deposit ({formatMoney(cashInHand, activeCurrency)})</span>
          </button>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('expenses_list')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeTab === 'expenses_list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              Expense Log ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('log_expense')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeTab === 'log_expense' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              + Record Expense
            </button>
            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeTab === 'reconciliation' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              EOD Z-Reconciliation
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Expense Log & Category Breakdown */}
      {activeTab === 'expenses_list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 cols: Expenses Table */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Expense Records</h2>
              <span className="font-mono font-bold text-rose-400">
                Total Outflow: {formatMoney(totalExpenses, activeCurrency)}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white">{exp.categoryName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-700 text-slate-300 capitalize">
                        Source: {exp.paidFrom.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{exp.description}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Paid to: {exp.paidTo} • Logged by: {exp.loggedBy} • Date: {exp.date}
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-rose-400 text-sm">
                    -{formatMoney(exp.amount, activeCurrency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 4 cols: Monthly Budget Breakdown */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Spending by Category
            </h2>

            <div className="space-y-3">
              {Object.entries(categoryTotals).map(([catName, sum]) => {
                const percent = Math.round((sum / (totalExpenses || 1)) * 100);
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-medium truncate pr-2">{catName}</span>
                      <span className="font-mono font-bold text-slate-100">
                        {formatMoney(sum, activeCurrency)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Record Expense */}
      {activeTab === 'log_expense' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl mx-auto shadow-xl text-xs">
          <h2 className="text-sm font-bold text-white mb-4">Record New Store Expense</h2>

          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-rose-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Paid From Account</label>
                <select
                  value={paidFrom}
                  onChange={(e) => setPaidFrom(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  <option value="cash_drawer">Drawer Cash (In Hand)</option>
                  <option value="bank_muscat">Bank Muscat Corporate</option>
                  <option value="bank_dhofar">Bank Dhofar Operations</option>
                  <option value="petty_cash">Emergency Petty Cash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Paid To / Recipient</label>
              <input
                type="text"
                required
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="e.g. Asyad Express / Cafeteria / Landlord"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description / Reason</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('expenses_list')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Log Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: End of Day Z-Reconciliation */}
      {activeTab === 'reconciliation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto shadow-xl text-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">End-of-Day (EOD) Z-Report & Cash Drawer Balancing</h2>
              <p className="text-[11px] text-slate-400">
                Count physical cash in register drawer, reconcile against digital ledger, and prepare evening bank deposit.
              </p>
            </div>
            <span className="font-mono text-amber-400 font-bold text-xs">
              {new Date().toLocaleDateString('en-GB')}
            </span>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3 rounded-xl bg-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300 font-sans">Digital System Expected Drawer Cash:</span>
              <span className="font-bold text-sm text-emerald-400">
                {formatMoney(cashInHand, activeCurrency)}
              </span>
            </div>

            <div>
              <label className="block font-sans text-slate-300 font-semibold mb-1">
                Enter Physical Counted Cash (Omani Rial):
              </label>
              <input
                type="number"
                step="0.001"
                value={actualCountedCash}
                onChange={(e) => setActualCountedCash(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-base font-bold text-white focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Variance indicator */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between font-sans ${
                Math.abs(cashVariance) < 0.001
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : cashVariance > 0
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div>
                <div className="font-bold text-xs">
                  {Math.abs(cashVariance) < 0.001
                    ? 'PERFECT RECONCILIATION (No Variance)'
                    : cashVariance > 0
                    ? `CASH OVERAGE (+${formatMoney(cashVariance, activeCurrency)})`
                    : `CASH SHORTAGE (${formatMoney(cashVariance, activeCurrency)})`}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Variance: OMR {cashVariance.toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Print Z-Report
            </button>

            <button
              onClick={onOpenDepositModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Deposit Counted Cash into Company Bank</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
