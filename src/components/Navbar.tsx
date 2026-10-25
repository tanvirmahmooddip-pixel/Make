import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  Globe,
  Landmark,
  Menu,
  Shield,
  Sparkles,
  User as UserIcon,
  Wallet,
  ArrowDownToLine,
  ChevronDown,
  Bell,
  Search,
  ScanLine,
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  Store,
  SlidersHorizontal,
  Server,
} from 'lucide-react';
import { CompanyConfig, CurrencyCode, LanguageCode, StoreLocation, User } from '../types';
import { CURRENCY_RATES, formatMoney } from '../utils/formatters';
import { TRANSLATIONS } from '../utils/i18n';

interface NavbarProps {
  branches: StoreLocation[];
  activeBranchId: string;
  onSelectBranch: (branchId: string) => void;
  users: User[];
  activeUserId: string;
  onSelectUser: (userId: string) => void;
  activeCurrency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  activeLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  cashInHand: number;
  totalBankBalance: number;
  isOnline: boolean;
  pendingOfflineCount: number;
  onSyncNow: () => void;
  onOpenScanner: () => void;
  onOpenDepositModal: () => void;
  onOpenAIModal: () => void;
  onToggleSidebar: () => void;
  onQuickSearch: (query: string) => void;
  isFirebaseConnected?: boolean;
  firebaseUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
  onGoogleSignIn?: () => void;
  onFirebaseSignOut?: () => void;
  onSyncToCloud?: () => void;
  isSyncingCloud?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  companyConfig?: CompanyConfig;
  onOpenBusinessCustomizer?: () => void;
  onOpenInstallerWizard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  branches,
  activeBranchId,
  onSelectBranch,
  users,
  activeUserId,
  onSelectUser,
  activeCurrency,
  onSelectCurrency,
  activeLanguage,
  onSelectLanguage,
  cashInHand,
  totalBankBalance,
  isOnline,
  pendingOfflineCount,
  onSyncNow,
  onOpenScanner,
  onOpenDepositModal,
  onOpenAIModal,
  onToggleSidebar,
  onQuickSearch,
  isFirebaseConnected = true,
  firebaseUser,
  onGoogleSignIn,
  onFirebaseSignOut,
  onSyncToCloud,
  isSyncingCloud = false,
  theme = 'light',
  onToggleTheme,
  companyConfig,
  onOpenBusinessCustomizer,
  onOpenInstallerWizard,
}) => {
  const t = TRANSLATIONS[activeLanguage] || TRANSLATIONS.en;
  const isRtl = activeLanguage === 'ar' || activeLanguage === 'ur';

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];
  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onQuickSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-2.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 gap-1.5 sm:gap-2 lg:gap-4">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Clickable Brand Logo & Name (triggers company profile customizer) */}
          <div
            onClick={onOpenBusinessCustomizer}
            title="Click to customize Company Name, Business Presets & Tax details"
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xs sm:text-base group-hover:scale-105 transition-transform shrink-0">
              {companyConfig?.shortName || 'RB'}
            </div>
            <div className="max-w-[150px] sm:max-w-[240px] md:max-w-[280px]">
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white leading-none">
                <span className="truncate text-xs sm:text-sm group-hover:text-amber-300 transition">
                  {companyConfig?.companyName || 'RABIUL & BIG BROTHER'}
                </span>
                <span className="hidden sm:inline-block text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 font-mono shrink-0">
                  {companyConfig?.taxLabel || 'VAT 5%'}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium truncate hidden xs:block">
                {companyConfig?.tagline || 'Business ERP Solutions'}
              </div>
            </div>
          </div>

          {/* Quick Change Company Name Pill Button for easy discovery */}
          {onOpenBusinessCustomizer && (
            <button
              onClick={onOpenBusinessCustomizer}
              title="Change Company Name & Business Presets"
              className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition cursor-pointer shrink-0"
            >
              <Store className="w-3 h-3 text-amber-400" />
              <span>Change Business</span>
            </button>
          )}

          {/* Software Installation & Customization Wizard Trigger */}
          {onOpenInstallerWizard && (
            <button
              onClick={onOpenInstallerWizard}
              title="Launch Enterprise Software Setup & Installation Wizard"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] shadow-sm transition cursor-pointer shrink-0 group"
            >
              <Server className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Setup Wizard</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">v2.4</span>
            </button>
          )}
        </div>

        {/* Center: Search, Branch Selector & Scanner Trigger */}
        <div className="hidden md:flex items-center gap-2.5 flex-1 max-w-xl mx-2">
          {/* Global Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition"
            />
          </div>

          {/* Camera Barcode / IMEI Scanner Trigger */}
          <button
            onClick={onOpenScanner}
            title="Open Live Camera Barcode & IMEI Scanner (Any Android, Apple, Windows, Linux Browser)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition cursor-pointer shrink-0"
          >
            <ScanLine className="w-4 h-4 animate-pulse" />
            <span className="hidden lg:inline">{t.cameraScanner || 'Scanner'}</span>
          </button>

          {/* Branch Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700/70 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span
                style={{ backgroundColor: '#141010' }}
                className="font-medium max-w-[140px] truncate px-1.5 py-0.5 rounded"
              >
                {activeBranch?.name.split('-')[1] || activeBranch?.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showBranchMenu && (
              <div className="absolute left-0 mt-1.5 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                  {t.switchBranch}
                </div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBranch(b.id);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 transition ${
                      b.id === activeBranchId ? 'text-amber-400 font-semibold bg-amber-500/10' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.city} • {b.crNumber}</div>
                    </div>
                    {b.isHeadquarters && (
                      <span className="text-[9px] bg-slate-700 text-amber-300 px-1 py-0.5 rounded border border-amber-500/20">HQ</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Online Status, Live Cash/Bank Indicators, Currency, Lang, User */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Online / Offline Connectivity & Sync Queue indicator */}
          <div className="flex items-center gap-1.5">
            {/* Firebase Cloud Sync Badge */}
            <div
              title="Firebase Firestore Cloud Connected: gen-lang-client-0476187452 | Database: ai-studio-rstelectronics-2e8b7be4-b876-474a-97b6-4fb833d1cc8b (asia-south1)"
              className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-bold font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span>FIREBASE CLOUD</span>
            </div>

            {onSyncToCloud && (
              <button
                onClick={onSyncToCloud}
                disabled={isSyncingCloud}
                title="Sync all ERP data to Firebase Firestore"
                className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-medium transition cursor-pointer"
              >
                <RefreshCw className={`w-2.5 h-2.5 text-orange-400 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span>{isSyncingCloud ? 'Syncing...' : 'Sync Cloud'}</span>
              </button>
            )}

            {isOnline ? (
              <div
                title="Browser online: real-time live sync active with main owner server"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">ONLINE</span>
              </div>
            ) : (
              <div
                title="Internet dropped: offline local cache active. Invoices & edits queued."
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold font-mono"
              >
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span>OFFLINE ({pendingOfflineCount})</span>
              </div>
            )}

            {pendingOfflineCount > 0 && (
              <button
                onClick={onSyncNow}
                title="Click to sync offline transactions"
                className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center gap-1 animate-pulse"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Sync ({pendingOfflineCount})</span>
              </button>
            )}
          </div>

          {/* Live Drawer Cash In Hand badge */}
          <button
            onClick={onOpenDepositModal}
            title="Click to deposit daily drawer cash into company bank account"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition group cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <div className="text-left">
              <div className="text-[9px] uppercase tracking-wider text-emerald-400/80 font-semibold leading-none">
                {t.cashInHand}
              </div>
              <div className="text-xs font-bold font-mono leading-tight">
                {formatMoney(cashInHand, activeCurrency)}
              </div>
            </div>
            <ArrowDownToLine className="w-3 h-3 text-emerald-400/70 group-hover:text-emerald-300 transition" />
          </button>

          {/* Live Bank Balance badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300">
            <Landmark className="w-3.5 h-3.5 text-blue-400" />
            <div className="text-left">
              <div className="text-[9px] uppercase tracking-wider text-blue-400/80 font-semibold leading-none">
                {t.bankBalance}
              </div>
              <div className="text-xs font-bold font-mono leading-tight">
                {formatMoney(totalBankBalance, activeCurrency)}
              </div>
            </div>
          </div>

          {/* AI Advisor Button */}
          <button
            onClick={onOpenAIModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
            <span className="hidden xl:inline">{t.aiAdvisor}</span>
          </button>

          {/* Currency Switcher */}
          <div className="relative">
            <select
              value={activeCurrency}
              onChange={(e) => onSelectCurrency(e.target.value as CurrencyCode)}
              className="bg-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
              title={t.currency}
            >
              {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((cur) => (
                <option key={cur} value={cur}>
                  {cur} ({CURRENCY_RATES[cur].symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Bengali & English toggle / Language Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectLanguage(activeLanguage === 'bn' ? 'en' : 'bn')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition border ${
                activeLanguage === 'bn'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Toggle Bangla / English"
            >
              {activeLanguage === 'bn' ? 'বাংলা' : 'EN'}
            </button>

            <select
              value={activeLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
              className="bg-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
              title={t.language}
            >
              <option value="en">English (EN)</option>
              <option value="bn">বাংলা (BN)</option>
              <option value="ar">العربية (AR)</option>
              <option value="ml">മലയാളം (ML)</option>
              <option value="ur">اردو (UR)</option>
            </select>
          </div>

          {/* Light / Dark Theme Switcher */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-300 active:scale-95 cursor-pointer select-none ${
                theme === 'light'
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
              aria-label="Toggle Light/Dark Theme"
            >
              <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                <Sun
                  className={`w-3.5 h-3.5 text-amber-600 transition-all duration-500 ease-in-out absolute ${
                    theme === 'light'
                      ? 'rotate-0 scale-100 opacity-100'
                      : '-rotate-90 scale-0 opacity-0 pointer-events-none'
                  }`}
                />
                <Moon
                  className={`w-3.5 h-3.5 text-slate-300 transition-all duration-500 ease-in-out absolute ${
                    theme === 'dark'
                      ? 'rotate-0 scale-100 opacity-100'
                      : 'rotate-90 scale-0 opacity-0 pointer-events-none'
                  }`}
                />
              </div>
              <span className="hidden sm:inline transition-colors duration-300">
                {theme === 'light' ? 'Light' : 'Dark'}
              </span>
            </button>
          )}

          {/* User Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/80 transition"
            >
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-500/50"
              />
              <div className="hidden lg:block text-left text-xs leading-none">
                <div className="font-semibold text-slate-200 max-w-[100px] truncate">{activeUser.name.split(' ')[0]}</div>
                <div className="text-[10px] text-amber-400 capitalize">{activeUser.role}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1.5 w-60 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                  {t.switchUser} (RBAC Access)
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u.id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-700 transition ${
                      u.id === activeUserId ? 'bg-amber-500/10 text-amber-300 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-600" />
                    <div>
                      <div className="font-medium text-slate-100">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.roleTitle}</div>
                    </div>
                  </button>
                ))}

                <div className="border-t border-slate-700/60 mt-1 pt-1.5 px-3 pb-1">
                  <div className="text-[10px] uppercase font-bold text-orange-400 tracking-wider mb-1 flex items-center justify-between">
                    <span>Firebase Cloud Sync</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  {firebaseUser ? (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-300 truncate">
                        {firebaseUser.email || firebaseUser.displayName}
                      </div>
                      {onFirebaseSignOut && (
                        <button
                          onClick={() => {
                            onFirebaseSignOut();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-center px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-rose-300 text-[11px] font-medium transition cursor-pointer"
                        >
                          Sign Out of Firebase
                        </button>
                      )}
                    </div>
                  ) : (
                    onGoogleSignIn && (
                      <button
                        onClick={() => {
                          onGoogleSignIn();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-[11px] transition shadow-md cursor-pointer"
                      >
                        <span>Sign In with Google</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
