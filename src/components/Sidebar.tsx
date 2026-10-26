import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Wrench,
  Cctv,
  Truck,
  Zap,
  PhoneCall,
  Receipt,
  Landmark,
  FileText,
  RotateCcw,
  PackageCheck,
  Scale,
  CalendarRange,
  Crown,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ArrowRightLeft,
  ShieldAlert,
  Users,
  Search,
  X,
  Store,
  Layers,
  SlidersHorizontal,
  Server,
} from 'lucide-react';
import { CompanyConfig, LanguageCode, User } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

export type NavigationTab =
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'customers'
  | 'branchTransfer'
  | 'repairs'
  | 'pendingBottlenecks'
  | 'cctvLive'
  | 'cctvJobs'
  | 'utilityBills'
  | 'telecomBills'
  | 'expenses'
  | 'bankLedger'
  | 'receivables'
  | 'returns'
  | 'purchaseOrders'
  | 'costCompare'
  | 'reports'
  | 'ownerPanel';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: LanguageCode;
  currentUser: User;
  lowStockCount: number;
  activeRepairsCount: number;
  activeFieldJobsCount: number;
  doorLocked: boolean;
  pendingInvoicesCount: number;
  onOpenAIModal: () => void;
  companyConfig?: CompanyConfig;
  onOpenBusinessCustomizer?: () => void;
  onOpenInstallerWizard?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  activeLanguage,
  currentUser,
  lowStockCount,
  activeRepairsCount,
  activeFieldJobsCount,
  doorLocked,
  pendingInvoicesCount,
  onOpenAIModal,
  companyConfig,
  onOpenBusinessCustomizer,
  onOpenInstallerWizard,
}) => {
  const t = TRANSLATIONS[activeLanguage] || TRANSLATIONS.en;
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
    category: string;
    hint?: string;
  }[] = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: <LayoutDashboard className="w-4 h-4 text-amber-400" />,
      category: 'Overview',
      hint: 'Executive Real-Time Terminal',
    },
    {
      id: 'pos',
      label: t.pos,
      icon: <ShoppingCart className="w-4 h-4 text-emerald-400" />,
      category: 'Sales & Inventory',
      hint: 'Barcode & Touch Billing',
    },
    {
      id: 'inventory',
      label: t.inventory,
      icon: <Boxes className="w-4 h-4 text-blue-400" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500/80 text-white',
      category: 'Sales & Inventory',
      hint: 'Stock Levels & IMEI Tracking',
    },
    {
      id: 'customers',
      label: t.customers || 'Customer Directory & Credit',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      category: 'Sales & Inventory',
      hint: 'Client Accounts & Receivables',
    },
    {
      id: 'branchTransfer',
      label: t.branchTransfer || 'Branch Stock Transfers',
      icon: <ArrowRightLeft className="w-4 h-4 text-cyan-400" />,
      category: 'Sales & Inventory',
      hint: 'Inter-Branch Stock Movement',
    },
    {
      id: 'returns',
      label: t.returns,
      icon: <RotateCcw className="w-4 h-4 text-amber-400" />,
      category: 'Sales & Inventory',
      hint: 'Customer Refunds & Restock',
    },
    {
      id: 'repairs',
      label: t.repairs,
      icon: <Wrench className="w-4 h-4 text-orange-400" />,
      badge: activeRepairsCount > 0 ? activeRepairsCount : undefined,
      badgeColor: 'bg-orange-500/80 text-white',
      category: 'Services & Security',
      hint: 'Device Diagnosis & Job Cards',
    },
    {
      id: 'pendingBottlenecks',
      label: t.pendingBottlenecks || 'Owner Services Tracker',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      badge: 'DELAYS',
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      category: 'Services & Security',
      hint: 'Repair & Field Delays Queue',
    },
    {
      id: 'cctvLive',
      label: t.cctvLive,
      icon: <Cctv className="w-4 h-4 text-cyan-400" />,
      badge: doorLocked ? 'LOCKED' : 'UNLOCKED',
      badgeColor: doorLocked ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-300',
      category: 'Services & Security',
      hint: 'IP Surveillance & Smart Doors',
    },
    {
      id: 'cctvJobs',
      label: t.cctvJobs,
      icon: <Truck className="w-4 h-4 text-purple-400" />,
      badge: activeFieldJobsCount > 0 ? activeFieldJobsCount : undefined,
      badgeColor: 'bg-purple-500/80 text-white',
      category: 'Services & Security',
      hint: 'Field Technician Deployments',
    },
    {
      id: 'utilityBills',
      label: t.utilityBills,
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      category: 'Bill Payments',
      hint: 'Electricity, Water & Gas Bills',
    },
    {
      id: 'telecomBills',
      label: t.telecomBills,
      icon: <PhoneCall className="w-4 h-4 text-teal-400" />,
      category: 'Bill Payments',
      hint: 'Omantel, Ooredoo & Vodafone',
    },
    {
      id: 'costCompare',
      label: t.costCompare,
      icon: <Scale className="w-4 h-4 text-indigo-400" />,
      category: 'Bill Payments',
      hint: 'Supplier & Tariff Comparison',
    },
    {
      id: 'expenses',
      label: t.expenses,
      icon: <Receipt className="w-4 h-4 text-rose-400" />,
      category: 'Finance & Treasury',
      hint: 'Daily Cashbook & Petty Cash',
    },
    {
      id: 'bankLedger',
      label: t.bankLedger,
      icon: <Landmark className="w-4 h-4 text-blue-400" />,
      category: 'Finance & Treasury',
      hint: 'Bank Balances & Float Drop',
    },
    {
      id: 'receivables',
      label: t.receivables,
      icon: <FileText className="w-4 h-4 text-indigo-400" />,
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : undefined,
      badgeColor: 'bg-amber-500/80 text-slate-950 font-bold',
      category: 'Finance & Treasury',
      hint: 'Credit Collections & Dues',
    },
    {
      id: 'purchaseOrders',
      label: t.purchaseOrders,
      icon: <PackageCheck className="w-4 h-4 text-emerald-400" />,
      category: 'Finance & Treasury',
      hint: 'Vendor Procurement & POs',
    },
    {
      id: 'reports',
      label: t.reports,
      icon: <CalendarRange className="w-4 h-4 text-sky-400" />,
      category: 'Intelligence & Management',
      hint: 'VAT Audits, Margins & P&L',
    },
    {
      id: 'ownerPanel',
      label: t.ownerPanel,
      icon: <Crown className="w-4 h-4 text-amber-400" />,
      category: 'Intelligence & Management',
      hint: 'Branches, Staff RBAC & Company Profile',
    },
  ];

  // Filter items by search query
  const filteredItems = navItems.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (item.hint && item.hint.toLowerCase().includes(filterQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Overview', 'Sales & Inventory', 'Services & Security', 'Bill Payments', 'Finance & Treasury', 'Intelligence & Management'];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-[53px] bottom-0 left-0 z-40 w-72 sm:w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header in Sidebar for Mobile */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
              {companyConfig?.shortName || 'FAP'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate max-w-[140px]">
                {activeLanguage === 'bn' && companyConfig?.companyNameBn
                  ? companyConfig.companyNameBn
                  : activeLanguage === 'ar' && companyConfig?.companyNameAr
                  ? companyConfig.companyNameAr
                  : companyConfig?.companyName || 'FAKAR AL AYAM PROJECTS LLC'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All 19 Modules Enabled
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenInstallerWizard && (
              <button
                onClick={() => {
                  onOpenInstallerWizard();
                  if (window.innerWidth < 1024) onClose();
                }}
                title="Launch Software Setup & Installation Wizard"
                className="p-1.5 rounded-lg text-blue-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <Server className="w-4 h-4" />
              </button>
            )}

            {onOpenBusinessCustomizer && (
              <button
                onClick={() => {
                  onOpenBusinessCustomizer();
                  if (window.innerWidth < 1024) onClose();
                }}
                title="Change Company Name & Business Presets"
                className="p-1.5 rounded-lg text-amber-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <Store className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Search inside Sidebar */}
        <div className="px-3 pt-2.5 pb-1.5 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search all 19 options..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-6 py-1.5 text-[11px] bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Software Setup Wizard Quick Launcher */}
          {onOpenInstallerWizard && (
            <button
              onClick={() => {
                onOpenInstallerWizard();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 hover:border-blue-400 text-blue-200 hover:text-white transition group text-left cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <Server className="w-3 h-3 text-blue-400 group-hover:scale-110 transition" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">Setup Wizard</div>
                  <div className="text-[9px] text-blue-400/80 truncate">Enterprise Re-Configuration</div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                SETUP
              </span>
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {/* If filtering, show flat list */}
          {filterQuery.trim() ? (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center justify-between">
                <span>Matching Modules ({filteredItems.length})</span>
              </div>
              {filteredItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isActive ? 'text-slate-950' : ''}>{item.icon}</span>
                      <div className="text-left truncate">
                        <div className="truncate font-semibold">{item.label}</div>
                        {item.hint && (
                          <div className={`text-[10px] truncate ${isActive ? 'text-slate-900/80' : 'text-slate-400'}`}>
                            {item.hint}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-slate-950 text-amber-300'
                            : item.badgeColor || 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No modules match "{filterQuery}"
                </div>
              )}
            </div>
          ) : (
            // Group by category with all options visible & enabled
            categories
              .filter((cat) => cat !== 'All')
              .map((category) => {
                const items = navItems.filter((i) => i.category === category);
                return (
                  <div key={category} className="space-y-1">
                    <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-[9px] text-slate-600 font-mono">({items.length})</span>
                    </div>
                    {items.map((item) => {
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectTab(item.id);
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className={isActive ? 'text-slate-950' : ''}>{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                                isActive
                                  ? 'bg-slate-950 text-amber-300'
                                  : item.badgeColor || 'bg-slate-700 text-slate-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
          )}
        </div>

        {/* Gemini AI Floating Promotion Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => {
              onOpenAIModal();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 hover:border-purple-500/60 transition group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1">
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
              <span>Gemini 3.8 Flash AI</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              One-click VAT audit, cashflow forecast & stock anomaly analysis.
            </p>
          </button>

          {/* User info snippet */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
            <span className="truncate">Active: {currentUser.name.split(' ')[0]}</span>
            <span className="capitalize text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              [{currentUser.role}]
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
