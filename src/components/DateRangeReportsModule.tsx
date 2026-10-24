import React, { useState } from 'react';
import {
  CalendarRange,
  Printer,
  Download,
  Filter,
  TrendingUp,
  Percent,
  ShieldCheck,
  FileSpreadsheet,
  Receipt,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CurrencyCode, ExpenseRecord, SaleTransaction } from '../types';
import { formatMoney } from '../utils/formatters';

interface DateRangeReportsModuleProps {
  sales: SaleTransaction[];
  expenses: ExpenseRecord[];
  activeCurrency: CurrencyCode;
}

export const DateRangeReportsModule: React.FC<DateRangeReportsModuleProps> = ({
  sales,
  expenses,
  activeCurrency,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);

  // Quick preset filters
  const applyPreset = (preset: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year') => {
    const now = new Date();
    if (preset === 'today') {
      setFromDate(today);
      setToDate(today);
    } else if (preset === 'yesterday') {
      const y = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
      setFromDate(y);
      setToDate(y);
    } else if (preset === 'week') {
      const w = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
      setFromDate(w);
      setToDate(today);
    } else if (preset === 'month') {
      setFromDate(firstOfMonth);
      setToDate(today);
    } else if (preset === 'quarter') {
      const q = new Date(now.setMonth(now.getMonth() - 3)).toISOString().split('T')[0];
      setFromDate(q);
      setToDate(today);
    } else if (preset === 'year') {
      setFromDate(`${now.getFullYear()}-01-01`);
      setToDate(today);
    }
  };

  // Filter sales and expenses by date range
  const filteredSales = sales.filter((s) => {
    const sDate = s.date.split('T')[0];
    return sDate >= fromDate && sDate <= toDate;
  });

  const filteredExpenses = expenses.filter((e) => {
    return e.date >= fromDate && e.date <= toDate;
  });

  // Financial aggregates
  const totalGrossSales = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalCostOfGoods = filteredSales.reduce((acc, s) => {
    return acc + s.items.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  }, 0);
  const grossProfit = totalGrossSales - totalCostOfGoods;
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const netMarginPercent = totalGrossSales > 0 ? ((netProfit / totalGrossSales) * 100).toFixed(1) : '0';

  // Oman Tax Authority (OTA) 5% VAT Estimation
  const standardRatedSalesNet = totalGrossSales / 1.05;
  const outputVatCollected = totalGrossSales - standardRatedSalesNet;
  const estimatedInputVatOnExpenses = (totalCostOfGoods + totalExpenses) * 0.05 * 0.7; // estimated input tax
  const netVatPayableToOTA = Math.max(0, outputVatCollected - estimatedInputVatOnExpenses);

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Date', 'Customer', 'Payment Method', 'Items Count', 'Grand Total OMR', 'VAT OMR'];
    const rows = filteredSales.map((s) => [
      s.invoiceNumber,
      s.date,
      `"${s.customerName}"`,
      s.paymentMethod,
      s.items.length,
      s.grandTotal.toFixed(3),
      s.taxAmount.toFixed(3),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Al-Rabil-Sales-Report-${fromDate}-to-${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-sky-400" />
            <span>"AS FROM TO DATE" Periodic Audit & Profit Analytics</span>
          </h1>
          <p className="text-xs text-slate-400">
            Filtered time-series reporting for Oman Tax Authority (OTA) VAT returns, gross margins, and executive profit health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Quick Presets:
          </span>
          <button
            onClick={() => applyPreset('today')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Today
          </button>
          <button
            onClick={() => applyPreset('yesterday')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Yesterday
          </button>
          <button
            onClick={() => applyPreset('week')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => applyPreset('month')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            This Month
          </button>
          <button
            onClick={() => applyPreset('quarter')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Quarterly
          </button>
          <button
            onClick={() => applyPreset('year')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Full Year
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">FROM DATE:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">TO DATE:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-slate-100"
            />
          </div>

          <span className="text-slate-500 font-mono text-[11px] ml-auto">
            {filteredSales.length} Sales & {filteredExpenses.length} Expense vouchers matching range
          </span>
        </div>
      </div>

      {/* KPI Cards for the selected period */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Gross Revenue</div>
          <div className="text-base font-bold font-mono text-amber-300 mt-1">
            {formatMoney(totalGrossSales, activeCurrency)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{filteredSales.length} Transactions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400">Cost of Goods (COGS)</div>
          <div className="text-base font-bold font-mono text-slate-300 mt-1">
            {formatMoney(totalCostOfGoods, activeCurrency)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Wholesale cost incurred</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-rose-400">Operating Expenses</div>
          <div className="text-base font-bold font-mono text-rose-400 mt-1">
            {formatMoney(totalExpenses, activeCurrency)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Rent, staff, utilities</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Net Business Profit</div>
          <div className="text-base font-bold font-mono text-emerald-300 mt-1">
            {formatMoney(netProfit, activeCurrency)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-semibold">
            {netMarginPercent}% Net Margin
          </div>
        </div>
      </div>

      {/* Oman Tax Authority (OTA) VAT Return Estimator Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Oman Tax Authority (OTA) 5% VAT Return Estimator
              </h2>
              <p className="text-[11px] text-slate-400">
                Quarterly filing calculation compliant with Royal Decree No. 121/2020.
              </p>
            </div>
          </div>
          <span className="font-mono px-2 py-1 rounded bg-slate-800 text-amber-400 text-xs font-bold border border-slate-700">
            VAT ID: OM1100239102
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-sans text-slate-400 font-semibold">
              Box 1: Standard Supplies (Net)
            </div>
            <div className="text-sm font-bold text-slate-200 mt-1">
              {formatMoney(standardRatedSalesNet, activeCurrency)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-sans text-slate-400 font-semibold">
              Box 2: Output Tax (Collected 5%)
            </div>
            <div className="text-sm font-bold text-amber-400 mt-1">
              {formatMoney(outputVatCollected, activeCurrency)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-sans text-slate-400 font-semibold">
              Box 3: Input Tax on Purchases
            </div>
            <div className="text-sm font-bold text-blue-300 mt-1">
              {formatMoney(estimatedInputVatOnExpenses, activeCurrency)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/40">
            <div className="text-[10px] uppercase font-sans text-emerald-400 font-semibold">
              Net VAT Payable to OTA
            </div>
            <div className="text-base font-bold text-emerald-300 mt-1">
              {formatMoney(netVatPayableToOTA, activeCurrency)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
