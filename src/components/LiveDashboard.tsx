import React from 'react';
import {
  Wallet,
  Landmark,
  TrendingUp,
  Percent,
  Boxes,
  Wrench,
  Truck,
  Sparkles,
  ArrowDownToLine,
  ShoppingCart,
  Zap,
  PhoneCall,
  Receipt,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Shield,
  Layers,
  Store,
} from 'lucide-react';
import {
  BankAccount,
  CCTVCamera,
  CCTVFieldJob,
  CompanyConfig,
  CurrencyCode,
  ExpenseRecord,
  Product,
  RepairTicket,
  SaleTransaction,
  SmartDoor,
  TelecomBillPayment,
  UtilityBillPayment,
} from '../types';
import { formatMoney, formatDateTime } from '../utils/formatters';

interface LiveDashboardProps {
  cashInHand: number;
  bankAccounts: BankAccount[];
  sales: SaleTransaction[];
  products: Product[];
  repairs: RepairTicket[];
  fieldJobs: CCTVFieldJob[];
  utilityBills: UtilityBillPayment[];
  telecomBills: TelecomBillPayment[];
  expenses: ExpenseRecord[];
  smartDoor: SmartDoor;
  activeCurrency: CurrencyCode;
  onNavigate: (tab: any) => void;
  onOpenDepositModal: () => void;
  onOpenAIModal: () => void;
  onToggleDoorLock: () => void;
  companyConfig?: CompanyConfig;
  onOpenBusinessCustomizer?: () => void;
}

export const LiveDashboard: React.FC<LiveDashboardProps> = ({
  cashInHand,
  bankAccounts,
  sales,
  products,
  repairs,
  fieldJobs,
  utilityBills,
  telecomBills,
  expenses,
  smartDoor,
  activeCurrency,
  onNavigate,
  onOpenDepositModal,
  onOpenAIModal,
  onToggleDoorLock,
  companyConfig,
  onOpenBusinessCustomizer,
}) => {
  // Calculations
  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);

  // Today sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesList = sales.filter((s) => s.date.startsWith(todayStr));
  const todayGrossSales = todaySalesList.reduce((acc, s) => acc + s.grandTotal, 0);

  // Profit calculation for today
  const todayCostOfGoods = todaySalesList.reduce((acc, s) => {
    return acc + s.items.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  }, 0);
  const todayUtilityCommissions = utilityBills
    .filter((u) => u.timestamp.startsWith(todayStr))
    .reduce((acc, u) => acc + u.commissionFee, 0);
  const todayTelecomCommissions = telecomBills
    .filter((t) => t.timestamp.startsWith(todayStr))
    .reduce((acc, t) => acc + t.commission, 0);
  const todayRepairRevenue = repairs
    .filter((r) => r.createdAt.startsWith(todayStr))
    .reduce((acc, r) => acc + r.depositPaid, 0);
  const todayExpenses = expenses
    .filter((e) => e.date.startsWith(todayStr))
    .reduce((acc, e) => acc + e.amount, 0);

  const todayGrossProfit =
    todayGrossSales - todayCostOfGoods + todayUtilityCommissions + todayTelecomCommissions;
  const todayNetProfit = todayGrossProfit - todayExpenses;
  const marginPercent =
    todayGrossSales > 0 ? Math.round((todayNetProfit / todayGrossSales) * 100) : 24;

  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert);
  const activeRepairs = repairs.filter(
    (r) => r.status !== 'delivered'
  );
  const activeFieldJobs = fieldJobs.filter(
    (j) => j.status !== 'completed'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Store Status & Executive Ticker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{companyConfig?.companyName || 'Al-Rabiul & Big Brother'} Executive Terminal</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                SYSTEM LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {companyConfig?.address || 'Muscat, Oman'} • {companyConfig?.tagline || 'Real-time sales, multi-bank treasury, CCTV security & VAT automation.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Business Profile Customizer Button */}
          {onOpenBusinessCustomizer && (
            <button
              onClick={onOpenBusinessCustomizer}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition cursor-pointer"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Change Business Profile</span>
            </button>
          )}

          {/* Quick Bank Deposit Button */}
          <button
            onClick={onOpenDepositModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Deposit Cash to Bank</span>
          </button>

          {/* Door Status Toggle */}
          <button
            onClick={onToggleDoorLock}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              smartDoor.status === 'locked'
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            {smartDoor.status === 'locked' ? (
              <Lock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Unlock className="w-4 h-4 text-amber-400" />
            )}
            <span>Door: {smartDoor.status.toUpperCase()}</span>
          </button>

          {/* Gemini AI Audit Button */}
          <button
            onClick={onOpenAIModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Gemini AI Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Drawer Cash in Hand */}
        <div
          onClick={onOpenDepositModal}
          className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 transition group cursor-pointer shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Drawer Cash (Now)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-300">
            {formatMoney(cashInHand, activeCurrency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <ArrowDownToLine className="w-3 h-3 text-emerald-400" />
            <span>Click to deposit to bank</span>
          </div>
        </div>

        {/* Card 2: Combined Bank Balances */}
        <div
          onClick={() => onNavigate('bankLedger')}
          className="p-4 rounded-2xl bg-slate-900 border border-blue-500/30 hover:border-blue-500/60 transition group cursor-pointer shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Company Banks
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-blue-300">
            {formatMoney(totalBankBalance, activeCurrency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            {bankAccounts.length} Accounts (Muscat/Dhofar/NBO)
          </div>
        </div>

        {/* Card 3: Today Gross Sales */}
        <div
          onClick={() => onNavigate('pos')}
          className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 transition group cursor-pointer shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Today Sales
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-amber-300">
            {formatMoney(todayGrossSales, activeCurrency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {todaySalesList.length} POS transactions
          </div>
        </div>

        {/* Card 4: Net Profit & Margin */}
        <div
          onClick={() => onNavigate('reports')}
          className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 hover:border-purple-500/60 transition group cursor-pointer shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Est. Net Profit
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-purple-300">
            {formatMoney(todayNetProfit, activeCurrency)}
          </div>
          <div className="text-[10px] text-purple-400/80 mt-1 font-semibold">
            ~{marginPercent}% net profit margin
          </div>
        </div>

        {/* Card 5: Low Stock Radar */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 hover:border-rose-500/60 transition group cursor-pointer shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Stock Warnings
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-rose-300">
            {lowStockProducts.length} Items
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1 truncate">
            {lowStockProducts[0]?.name.split(' ')[0] || 'All stocked'}
          </div>
        </div>

        {/* Card 6: Active Repairs & Field Jobs */}
        <div
          onClick={() => onNavigate('repairs')}
          className="p-4 rounded-2xl bg-slate-900 border border-orange-500/30 hover:border-orange-500/60 transition group cursor-pointer shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Active Services
            </span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 group-hover:scale-110 transition">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-orange-300">
            {activeRepairs.length + activeFieldJobs.length} Active
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {activeRepairs.length} Repairs • {activeFieldJobs.length} CCTV Jobs
          </div>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Quick Operations Launchpad</span>
          <span className="text-[11px] text-slate-500">Fast 1-Click Access</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          <button
            onClick={() => onNavigate('pos')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/40 transition flex flex-col items-center text-center group cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-emerald-400 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">POS Sale</span>
            <span className="text-[10px] text-slate-400">Issue Invoice</span>
          </button>

          <button
            onClick={() => onNavigate('repairs')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-orange-950/40 border border-slate-700 hover:border-orange-500/40 transition flex flex-col items-center text-center group cursor-pointer"
          >
            <Wrench className="w-5 h-5 text-orange-400 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">Job Card</span>
            <span className="text-[10px] text-slate-400">Device Intake</span>
          </button>

          <button
            onClick={() => onNavigate('utilityBills')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-yellow-950/40 border border-slate-700 hover:border-yellow-500/40 transition flex flex-col items-center text-center group cursor-pointer"
          >
            <Zap className="w-5 h-5 text-yellow-400 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">Nama Bills</span>
            <span className="text-[10px] text-slate-400">Power & Water</span>
          </button>

          <button
            onClick={() => onNavigate('telecomBills')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-teal-950/40 border border-slate-700 hover:border-teal-500/40 transition flex flex-col items-center text-center group cursor-pointer"
          >
            <PhoneCall className="w-5 h-5 text-teal-400 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">Telecom</span>
            <span className="text-[10px] text-slate-400">Omantel / Ooredoo</span>
          </button>

          <button
            onClick={() => onNavigate('expenses')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 transition flex flex-col items-center text-center group cursor-pointer"
          >
            <Receipt className="w-5 h-5 text-rose-400 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">Expense</span>
            <span className="text-[10px] text-slate-400">Log Cash Out</span>
          </button>

          <button
            onClick={() => onNavigate('cctvLive')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-cyan-950/40 border border-slate-700 hover:border-cyan-500/40 transition flex flex-col items-center text-center group cursor-pointer"
          >
            <Shield className="w-5 h-5 text-cyan-400 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">Live CCTV</span>
            <span className="text-[10px] text-slate-400">Door & Feeds</span>
          </button>

          <button
            onClick={onOpenAIModal}
            className="p-3 rounded-xl bg-gradient-to-b from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/40 transition flex flex-col items-center text-center group cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-purple-400 mb-1.5 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-purple-200">Gemini AI</span>
            <span className="text-[10px] text-purple-400">Financial Audit</span>
          </button>
        </div>
      </div>

      {/* Main Content Split: Live Activity vs Revenue Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Live Activity Stream */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Live Store Activity Feed</h2>
            </div>
            <span className="text-[11px] text-slate-400">Auto-updating ledger</span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {sales.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Sale #{s.invoiceNumber} • {s.customerName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {s.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-emerald-300">
                    +{formatMoney(s.grandTotal, activeCurrency)}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">{s.paymentMethod}</div>
                </div>
              </div>
            ))}

            {repairs.slice(0, 2).map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Repair Ticket {r.ticketNumber} • {r.deviceBrand} {r.deviceModel}
                    </div>
                    <div className="text-[10px] text-slate-400">{r.problemDescription}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-orange-300">
                    Est: {formatMoney(r.estimatedCost, activeCurrency)}
                  </div>
                  <div className="text-[10px] text-amber-400 capitalize">{r.status.replace('_', ' ')}</div>
                </div>
              </div>
            ))}

            {utilityBills.slice(0, 2).map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      {u.providerName.split('(')[0]} • Acc {u.accountNumber}
                    </div>
                    <div className="text-[10px] text-slate-400">Customer: {u.customerName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-yellow-300">
                    {formatMoney(u.totalCollected, activeCurrency)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    Fee: +{formatMoney(u.commissionFee, activeCurrency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Multi-Bank Balances & Low Stock Radar */}
        <div className="lg:col-span-5 space-y-5">
          {/* Bank Accounts Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Company Bank Ledgers
                </h3>
              </div>
              <button
                onClick={() => onNavigate('bankLedger')}
                className="text-[11px] text-blue-400 hover:underline"
              >
                View Ledger
              </button>
            </div>

            <div className="space-y-2.5">
              {bankAccounts.map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{b.bankName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Acc: {b.accountNumber}</div>
                  </div>
                  <div className="text-right font-mono font-bold text-blue-300">
                    {formatMoney(b.currentBalance, activeCurrency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Urgent Stock Alerts ({lowStockProducts.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-[11px] text-rose-400 hover:underline"
              >
                Manage Stock
              </button>
            </div>

            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-200 truncate">{p.name}</div>
                    <div className="text-[10px] text-rose-300/80 font-mono">
                      Stock: {p.stock} units (Min limit: {p.minStockAlert})
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('purchaseOrders')}
                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] whitespace-nowrap transition"
                  >
                    Reorder PO
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
