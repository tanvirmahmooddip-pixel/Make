import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Users,
  Grid,
  Store,
  Sparkles,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface MobileBottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onToggleSidebar: () => void;
  onOpenBusinessCustomizer: () => void;
  lowStockCount?: number;
  pendingInvoicesCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onToggleSidebar,
  onOpenBusinessCustomizer,
  lowStockCount = 0,
  pendingInvoicesCount = 0,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-300 py-1 px-2 flex items-center justify-around shadow-2xl safe-area-pb"
    >
      {/* 1. Dashboard */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition cursor-pointer min-w-[56px] ${
          currentTab === 'dashboard'
            ? 'text-amber-400 bg-amber-500/15 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>Terminal</span>
      </button>

      {/* 2. POS Terminal */}
      <button
        onClick={() => onSelectTab('pos')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition cursor-pointer min-w-[56px] ${
          currentTab === 'pos'
            ? 'text-emerald-400 bg-emerald-500/15 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <ShoppingCart className="w-5 h-5 mb-0.5" />
        <span>POS Sale</span>
      </button>

      {/* 3. Inventory */}
      <button
        onClick={() => onSelectTab('inventory')}
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition cursor-pointer min-w-[56px] ${
          currentTab === 'inventory'
            ? 'text-blue-400 bg-blue-500/15 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Boxes className="w-5 h-5 mb-0.5" />
        <span>Inventory</span>
        {lowStockCount > 0 && (
          <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        )}
      </button>

      {/* 4. Customers */}
      <button
        onClick={() => onSelectTab('customers')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition cursor-pointer min-w-[56px] ${
          currentTab === 'customers'
            ? 'text-indigo-400 bg-indigo-500/15 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span>Clients</span>
      </button>

      {/* 5. Business Switcher / Customizer */}
      <button
        onClick={onOpenBusinessCustomizer}
        title="Customize Company Name & Business Presets"
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold text-amber-300 hover:text-amber-200 transition cursor-pointer min-w-[56px]"
      >
        <Store className="w-5 h-5 mb-0.5 text-amber-400" />
        <span>Company</span>
      </button>

      {/* 6. All Modules Drawer Trigger */}
      <button
        onClick={onToggleSidebar}
        title="All 19 Modules Menu"
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/60 rounded-xl transition cursor-pointer min-w-[56px]"
      >
        <Grid className="w-5 h-5 mb-0.5 text-amber-400" />
        <span>All (19)</span>
      </button>
    </nav>
  );
};
