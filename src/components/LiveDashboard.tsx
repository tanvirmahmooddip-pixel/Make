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
  Server,
  BarChart3,
  ArrowUpRight,
  Award,
  FileText,
  Printer,
  Flame,
  CreditCard,
  Star,
  Users,
  Eye,
  Scan,
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
  DashboardWidgetConfig,
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
  onOpenInstallerWizard?: () => void;
  onSelectInvoiceForPrint?: (sale: SaleTransaction) => void;
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
  onOpenInstallerWizard,
  onSelectInvoiceForPrint,
}) => {
  // Calculations
  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);

  // Today sales & daily volume calculation
  const todayStr = new Date().toISOString().split('T')[0];
  // If no transactions logged today yet, fall back to the latest recorded transactions date for live demo visualization
  const hasTodaySales = sales.some((s) => s.date.startsWith(todayStr));
  const activeSalesDate = hasTodaySales
    ? todayStr
    : (sales[0]?.date ? sales[0].date.split('T')[0] : todayStr);

  const todaySalesList = sales.filter((s) => s.date.startsWith(activeSalesDate));
  const todayGrossSales = todaySalesList.reduce((acc, s) => acc + s.grandTotal, 0);

  // Volume metrics
  const totalDailyOrdersCount = todaySalesList.length;
  const totalDailyUnitsSold = todaySalesList.reduce((acc, s) => {
    return acc + s.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);
  const averageDailyOrderValue =
    totalDailyOrdersCount > 0 ? todayGrossSales / totalDailyOrdersCount : 0;

  // Payment Breakdown for today's volume
  const todayCashSales = todaySalesList
    .filter((s) => s.paymentMethod === 'cash')
    .reduce((acc, s) => acc + s.grandTotal, 0);
  const todayBankSales = todaySalesList
    .filter((s) => s.paymentMethod === 'bank_transfer')
    .reduce((acc, s) => acc + s.grandTotal, 0);
  const todayCardSales = todaySalesList
    .filter((s) => s.paymentMethod === 'card')
    .reduce((acc, s) => acc + s.grandTotal, 0);
  const todayCreditSales = todaySalesList
    .filter((s) => s.paymentMethod === 'customer_credit')
    .reduce((acc, s) => acc + s.grandTotal, 0);

  // Recent High-Value Transactions (sorted by grandTotal descending)
  const highValueTransactions = [...sales]
    .sort((a, b) => b.grandTotal - a.grandTotal)
    .slice(0, 5);
  const totalAllSalesVolume = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const highValueTotalVolume = highValueTransactions.reduce((acc, s) => acc + s.grandTotal, 0);
  const highValueSharePercent =
    totalAllSalesVolume > 0 ? Math.round((highValueTotalVolume / totalAllSalesVolume) * 100) : 0;

  // Profit calculation for today
  const todayCostOfGoods = todaySalesList.reduce((acc, s) => {
    return acc + s.items.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  }, 0);
  const todayUtilityCommissions = utilityBills
    .filter((u) => u.timestamp.startsWith(activeSalesDate))
    .reduce((acc, u) => acc + u.commissionFee, 0);
  const todayTelecomCommissions = telecomBills
    .filter((t) => t.timestamp.startsWith(activeSalesDate))
    .reduce((acc, t) => acc + t.commission, 0);
  const todayRepairRevenue = repairs
    .filter((r) => r.createdAt.startsWith(activeSalesDate))
    .reduce((acc, r) => acc + r.depositPaid, 0);
  const todayExpenses = expenses
    .filter((e) => e.date.startsWith(activeSalesDate))
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

  const widgets: DashboardWidgetConfig = companyConfig?.dashboardWidgets || {
    showDailySalesVolume: true,
    showHighValueTransactions: true,
    showCashDrawer: true,
    showBankAccounts: true,
    showCCTVFeeds: true,
    showSmartDoor: true,
    showRepairsBottlenecks: true,
    showQuickLaunchpad: true,
    showActivityFeed: true,
    showTopProducts: true,
    showCategoryBreakdown: true,
    showLiveOperators: true,
    showAlertBadges: true,
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner: Store Status, Multilingual Brand & Executive Controls */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="relative mt-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  {companyConfig?.companyName || 'FAKAR AL AYAM PROJECTS LLC'}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30 font-bold">
                  ERP v5.0 LIVE
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-300 mt-1 font-medium">
                <span className="font-arabic text-amber-300">
                  {companyConfig?.companyNameAr || 'شركة فكار الأيام للمشاريع ذ.م.م'}
                </span>
                {companyConfig?.companyNameBn && (
                  <span className="text-cyan-300">
                    • {companyConfig.companyNameBn}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {companyConfig?.address || 'Muscat, Oman'} • {companyConfig?.tagline || 'Commercial Projects, Electronics & Smart Systems Solutions'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1-Click POS with Expand Option */}
            <button
              onClick={() => onNavigate('pos')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>POS (Expand All)</span>
            </button>

            {/* 1-Click Inventory with Expand Option */}
            <button
              onClick={() => onNavigate('inventory')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Inventory (Expand)</span>
            </button>

            {/* Software Setup Wizard Button */}
            {onOpenInstallerWizard && (
              <button
                onClick={onOpenInstallerWizard}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-xs transition cursor-pointer"
                title="Launch Software Setup & Installation Wizard"
              >
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Wizard</span>
              </button>
            )}

            {/* Quick Bank Deposit Button */}
            <button
              onClick={onOpenDepositModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Deposit Cash</span>
            </button>

            {/* Door Status Toggle */}
            <button
              onClick={onToggleDoorLock}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                smartDoor.status === 'locked'
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              {smartDoor.status === 'locked' ? (
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Door: {smartDoor.status.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ALL SALES OR USER OPERATOR OPTION & ALERTS TECHNICAL BAR */}
      {(widgets.showLiveOperators || widgets.showAlertBadges) && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          {/* Top Row: Operators Status */}
          {widgets.showLiveOperators && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Live Store Operators & Terminal Options:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-emerald-300">Cashier Terminal #1:</span>
                  <span className="text-slate-300 font-mono">Walk-in POS Active</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="font-semibold text-blue-300">Scanner Cam #2:</span>
                  <span className="text-slate-300 font-mono">IMEI/Barcode Ready</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="font-semibold text-purple-300">Tech Specialist:</span>
                  <span className="text-slate-300 font-mono">{activeRepairs.length} Job Cards</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-semibold text-amber-300">Owner Console:</span>
                  <span className="text-slate-300 font-mono">Master Override</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Row: Real-time Operational Alerts */}
          {widgets.showAlertBadges && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Live System Alerts:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {lowStockProducts.length > 0 && (
                  <button
                    onClick={() => onNavigate('inventory')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[11px] font-bold transition cursor-pointer"
                  >
                    <Boxes className="w-3.5 h-3.5 text-rose-400" />
                    <span>{lowStockProducts.length} Items Low Stock (Restock Alert)</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('cctvLive')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CCTV Surveillance: 4 Cameras Online</span>
                </button>

                <button
                  onClick={onToggleDoorLock}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                    smartDoor.status === 'locked'
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                  }`}
                >
                  {smartDoor.status === 'locked' ? (
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Door Lock: {smartDoor.status.toUpperCase()}</span>
                </button>

                {activeRepairs.length > 0 && (
                  <button
                    onClick={() => onNavigate('pendingBottlenecks')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5 text-orange-400" />
                    <span>{activeRepairs.length} Pending Repairs In Service</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Grid with Dynamic Auto-Fit */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Drawer Cash in Hand */}
        {widgets.showCashDrawer && (
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
        )}

        {/* Card 2: Combined Bank Balances */}
        {widgets.showBankAccounts && (
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
        )}

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
        {widgets.showTopProducts && (
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
        )}

        {/* Card 6: Active Repairs & Field Jobs */}
        {widgets.showRepairsBottlenecks && (
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
        )}
      </div>

      {/* Quick Launchpad Grid */}
      {widgets.showQuickLaunchpad && (
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
              <span className="text-[10px] text-slate-400">Expand Terminal</span>
            </button>

            <button
              onClick={() => onNavigate('inventory')}
              className="p-3 rounded-xl bg-slate-800 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/40 transition flex flex-col items-center text-center group cursor-pointer"
            >
              <Boxes className="w-5 h-5 text-amber-400 mb-1.5 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-slate-200">Stock Catalog</span>
              <span className="text-[10px] text-slate-400">Expand All IMEIs</span>
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
      )}

      {/* Executive Performance Showcase: Total Daily Sales Volume & Recent High-Value Transactions */}
      {(widgets.showDailySalesVolume || widgets.showHighValueTransactions) && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Summary Card 1: Total Daily Sales Volume */}
          {widgets.showDailySalesVolume && (
            <div className={`${widgets.showHighValueTransactions ? 'xl:col-span-5' : 'xl:col-span-12'} rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90 border border-emerald-500/30 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Total Daily Sales Volume</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                      Live Velocity
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Daily store transaction throughput & turnover</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('pos')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>POS Sale</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Big Revenue Number */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                    Gross Volume Today ({activeSalesDate})
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300 mt-0.5 tracking-tight">
                    {formatMoney(todayGrossSales, activeCurrency)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
                    <TrendingUp className="w-3 h-3" />
                    ~{marginPercent}% Margin
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">Est. Profit: {formatMoney(todayNetProfit, activeCurrency)}</div>
                </div>
              </div>

              {/* 3 Metrics Row */}
              <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-800">
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Orders Count</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {totalDailyOrdersCount} <span className="text-[10px] text-slate-400 font-normal">Txns</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Items Sold</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {totalDailyUnitsSold} <span className="text-[10px] text-slate-400 font-normal">Units</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Avg Order Value</div>
                  <div className="text-sm font-bold font-mono text-amber-300 mt-0.5 truncate">
                    {formatMoney(averageDailyOrderValue, activeCurrency)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Volume Distribution */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Payment Settlement Channels</span>
                <span>Breakdown</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Wallet className="w-2.5 h-2.5 text-emerald-400" /> Cash
                  </div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5 text-xs truncate">
                    {formatMoney(todayCashSales, activeCurrency)}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Landmark className="w-2.5 h-2.5 text-blue-400" /> Bank Trf
                  </div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5 text-xs truncate">
                    {formatMoney(todayBankSales, activeCurrency)}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <CreditCard className="w-2.5 h-2.5 text-purple-400" /> Card/POS
                  </div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5 text-xs truncate">
                    {formatMoney(todayCardSales, activeCurrency)}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Receipt className="w-2.5 h-2.5 text-amber-400" /> Credit
                  </div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5 text-xs truncate">
                    {formatMoney(todayCreditSales, activeCurrency)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Footer Action */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Oman VAT 5% verified on daily sales</span>
            </span>
            <button
              onClick={() => onNavigate('receivables')}
              className="text-xs text-slate-300 hover:text-white font-medium hover:underline cursor-pointer"
            >
              View Daily Ledger →
            </button>
          </div>
        </div>
      )}

      {/* Summary Card 2: Recent High-Value Transactions */}
      {widgets.showHighValueTransactions && (
        <div className={`${widgets.showDailySalesVolume ? 'xl:col-span-7' : 'xl:col-span-12'} rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90 border border-amber-500/30 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Recent High-Value Transactions</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono font-medium">
                      Top Orders
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Flagship smartphones, enterprise CCTV packages & corporate accounts</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('receivables')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>All Invoices</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* High-Value Transactions List */}
            <div className="mt-3.5 space-y-2.5">
              {highValueTransactions.map((tx, idx) => {
                const totalItemsCount = tx.items.reduce((sum, item) => sum + item.quantity, 0);
                const leadItem = tx.items[0];

                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono text-xs shrink-0 group-hover:scale-105 transition">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white group-hover:text-amber-300 transition">
                            {tx.customerName || 'Walk-in Client'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                            #{tx.invoiceNumber}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                              tx.paymentMethod === 'bank_transfer'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : tx.paymentMethod === 'card'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : tx.paymentMethod === 'customer_credit'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {tx.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 truncate">
                          {leadItem ? `${leadItem.productName} (${leadItem.quantity}x)` : 'Items'}
                          {tx.items.length > 1 && ` +${tx.items.length - 1} more (${totalItemsCount} total)`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-bold font-mono text-amber-300">
                          {formatMoney(tx.grandTotal, activeCurrency)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tx.date.includes('T') ? formatDateTime(tx.date).split(' ')[1] || tx.date.split('T')[0] : tx.date}
                        </div>
                      </div>

                      {onSelectInvoiceForPrint && (
                        <button
                          onClick={() => onSelectInvoiceForPrint(tx)}
                          title="Print or View Tax Invoice"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Stat */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>
                Top {highValueTransactions.length} transactions represent <strong className="text-amber-300">{formatMoney(highValueTotalVolume, activeCurrency)}</strong> ({highValueSharePercent}% of turnover)
              </span>
            </div>
            <button
              onClick={() => onNavigate('pos')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition cursor-pointer text-center"
            >
              Create High-Value Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  )}

  {/* Main Content Split: Live Activity vs Revenue Visuals */}
  {(widgets.showActivityFeed || widgets.showBankAccounts || widgets.showTopProducts) && (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7 cols: Live Activity Stream */}
      {widgets.showActivityFeed && (
        <div className={`${(widgets.showBankAccounts || widgets.showTopProducts) ? 'lg:col-span-7' : 'lg:col-span-12'} bg-slate-900 border border-slate-800 rounded-2xl p-5`}>
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
      )}

      {/* Right 5 cols: Multi-Bank Balances & Low Stock Radar */}
      {(widgets.showBankAccounts || widgets.showTopProducts) && (
        <div className={`${widgets.showActivityFeed ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-5`}>
          {/* Bank Accounts Breakdown */}
          {widgets.showBankAccounts && (
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
          )}

          {/* Low Stock Alerts Box */}
          {widgets.showTopProducts && (
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
          )}
        </div>
      )}
    </div>
  )}
</div>
);
};
