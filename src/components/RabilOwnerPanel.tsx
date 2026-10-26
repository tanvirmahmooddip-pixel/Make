import React, { useState } from 'react';
import {
  Crown,
  Building2,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Tag,
  Settings,
  X,
  Store,
  Sparkles,
  LayoutDashboard,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Palette,
  CheckCircle2,
  Layers,
  Radio,
  Sliders,
} from 'lucide-react';
import { ProductCategory, StoreLocation, User, UserRolePermissions, UserRoleType, DashboardWidgetConfig } from '../types';
import { CompanyConfig, BUSINESS_PRESETS, DEFAULT_DASHBOARD_WIDGETS } from '../utils/storage';
import { soundEffects } from '../utils/soundEffects';

interface RabilOwnerPanelProps {
  branches: StoreLocation[];
  users: User[];
  categories: ProductCategory[];
  companyConfig: CompanyConfig;
  onAddBranch: (branch: StoreLocation) => void;
  onUpdateBranch: (branch: StoreLocation) => void;
  onDeleteBranch: (branchId: string) => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddCategory: (category: ProductCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateCompanyConfig: (config: CompanyConfig) => void;
}

export const RabilOwnerPanel: React.FC<RabilOwnerPanelProps> = ({
  branches,
  users,
  categories,
  companyConfig,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddCategory,
  onDeleteCategory,
  onUpdateCompanyConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'company' | 'users' | 'branches' | 'categories'>('dashboard');

  // Company Config State with fallback widgets
  const [cfg, setCfg] = useState<CompanyConfig>({
    ...companyConfig,
    dashboardWidgets: {
      ...DEFAULT_DASHBOARD_WIDGETS,
      ...(companyConfig.dashboardWidgets || {}),
    },
  });
  const [savedConfigToast, setSavedConfigToast] = useState(false);

  const toggleWidget = (key: keyof DashboardWidgetConfig) => {
    soundEffects.playClick();
    const currentWidgets = cfg.dashboardWidgets || DEFAULT_DASHBOARD_WIDGETS;
    const updated = {
      ...currentWidgets,
      [key]: !currentWidgets[key],
    };
    const newCfg = { ...cfg, dashboardWidgets: updated };
    setCfg(newCfg);
    onUpdateCompanyConfig(newCfg);
  };

  const applyWidgetPreset = (mode: 'all' | 'pos_minimal' | 'executive') => {
    soundEffects.playExpand();
    let newWidgets: DashboardWidgetConfig;
    if (mode === 'all') {
      newWidgets = { ...DEFAULT_DASHBOARD_WIDGETS };
    } else if (mode === 'pos_minimal') {
      newWidgets = {
        showDailySalesVolume: true,
        showHighValueTransactions: false,
        showCashDrawer: true,
        showBankAccounts: false,
        showCCTVFeeds: false,
        showSmartDoor: true,
        showRepairsBottlenecks: false,
        showQuickLaunchpad: true,
        showActivityFeed: true,
        showTopProducts: true,
        showCategoryBreakdown: false,
        showLiveOperators: true,
        showAlertBadges: true,
      };
    } else {
      // Executive
      newWidgets = {
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
    }
    const updated = { ...cfg, dashboardWidgets: newWidgets };
    setCfg(updated);
    onUpdateCompanyConfig(updated);
  };

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameAr, setNewCatNameAr] = useState('');

  // New User State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRoleType>('cashier');
  const [userRoleTitle, setUserRoleTitle] = useState('Sales & POS Cashier');
  const [userPin, setUserPin] = useState('1234');
  const [userPermissions, setUserPermissions] = useState<UserRolePermissions>({
    viewFinancialLedgers: false,
    performBankDeposits: false,
    editProductCosts: false,
    deleteRecords: false,
    accessCCTV: false,
    issueRefunds: true,
    manageUserRoles: false,
    accessGeminiAI: false,
    manageStoreLocations: false,
  });

  // New Branch State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchNameAr, setBranchNameAr] = useState('');
  const [branchCity, setBranchCity] = useState('Muscat');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('+968 ');
  const [branchCr, setBranchCr] = useState('CR 1394821');
  const [branchVat, setBranchVat] = useState('OM1100239102');

  const handleSaveCompanyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyConfig(cfg);
    setSavedConfigToast(true);
    setTimeout(() => setSavedConfigToast(false), 2500);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cat: ProductCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      nameAr: newCatNameAr || newCatName,
      icon: 'Tag',
      color: 'from-amber-500 to-orange-600',
    };
    onAddCategory(cat);
    setNewCatName('');
    setNewCatNameAr('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userName,
      email: userEmail,
      role: userRole,
      roleTitle: userRoleTitle,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      branchId: branches[0]?.id || 'branch-ruwi',
      pin: userPin,
      permissions: userPermissions,
    };
    onAddUser(newUser);
    setIsUserModalOpen(false);
    setUserName('');
    setUserEmail('');
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const newBr: StoreLocation = {
      id: `branch-${Date.now()}`,
      name: branchName,
      nameAr: branchNameAr,
      city: branchCity,
      address: branchAddress,
      phone: branchPhone,
      crNumber: branchCr,
      vatNumber: branchVat,
      isHeadquarters: false,
    };
    onAddBranch(newBr);
    setIsBranchModalOpen(false);
    setBranchName('');
    setBranchNameAr('');
    setBranchAddress('');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>Rabiul & Big Brother Owner Master Control Panel</span>
            </h1>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
              DUAL OWNER SUITE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Executive control for Rabiul and Big Brother: user permissions matrix, branch network, and Oman legal filings.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard & Auto-Fit</span>
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'company' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Company & Presets
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'users' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Staff & Permissions ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'branches' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Store Branches ({branches.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'categories' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Categories ({categories.length})
          </button>
        </div>
      </div>

      {/* Tab 0: Dashboard Display & Auto-Fit Controller */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Dashboard Widget Visibility & Automatic Layout Reflow Engine
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Decide which cards, metrics, and technical modules appear on the live dashboard. When any widget is removed, the responsive grid automatically auto-fits and expands remaining items without empty slots.
              </p>
            </div>

            {/* Auto-Fit Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => applyWidgetPreset('all')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
              >
                All On (Full Suite)
              </button>
              <button
                type="button"
                onClick={() => applyWidgetPreset('pos_minimal')}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition cursor-pointer"
              >
                POS Minimal
              </button>
              <button
                type="button"
                onClick={() => applyWidgetPreset('executive')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer"
              >
                Executive Finance
              </button>
            </div>
          </div>

          {/* Interactive Widget Toggles Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Card-by-Card Visibility Toggles</span>
              <span className="text-[11px] text-emerald-400 font-mono">
                {Object.values(cfg.dashboardWidgets || DEFAULT_DASHBOARD_WIDGETS).filter(Boolean).length} / 12 Active
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                {
                  key: 'showDailySalesVolume',
                  label: 'Total Daily Sales Volume Card',
                  desc: 'Gross revenue, orders count, total units sold & payment distribution',
                },
                {
                  key: 'showHighValueTransactions',
                  label: 'Recent High-Value Transactions',
                  desc: 'Top customer sales invoices with 1-click tax invoice printing',
                },
                {
                  key: 'showCashDrawer',
                  label: 'Drawer Cash in Hand (Live Float)',
                  desc: 'Physical drawer cash status & instant deposit to bank trigger',
                },
                {
                  key: 'showBankAccounts',
                  label: 'Company Bank Accounts Ledger',
                  desc: 'Real-time balances across Bank Muscat, Dhofar & NBO accounts',
                },
                {
                  key: 'showCCTVFeeds',
                  label: 'CCTV Feeds & Surveillance Status',
                  desc: 'Store cameras streaming status & remote smart door lock control',
                },
                {
                  key: 'showSmartDoor',
                  label: 'Smart Security Door Lock Status',
                  desc: 'Remote lock/unlock switch and battery health meter',
                },
                {
                  key: 'showRepairsBottlenecks',
                  label: 'Pending Technician Bottlenecks',
                  desc: 'Micro-soldering, Dubai parts delay & waiting approval job cards',
                },
                {
                  key: 'showQuickLaunchpad',
                  label: 'Quick Operations Launchpad',
                  desc: '1-click launcher for POS, Cam Scan, Nama Bills & Omantel recharges',
                },
                {
                  key: 'showActivityFeed',
                  label: 'Live Store Activity Feed',
                  desc: 'Real-time ledger events: sales, utility bills, repairs, transfers',
                },
                {
                  key: 'showTopProducts',
                  label: 'Urgent Low Stock Warnings',
                  desc: 'Catalog items below minimum safety threshold needing purchase orders',
                },
                {
                  key: 'showLiveOperators',
                  label: 'Active Operators & Cashiers Banner',
                  desc: 'Real-time terminal status for Cashiers, Technicians & Owners',
                },
                {
                  key: 'showAlertBadges',
                  label: 'Store Alert Badges Bar',
                  desc: 'Emergency notifications for low stock, door alarms & service bottlenecks',
                },
              ].map((item) => {
                const isEnabled = !!(cfg.dashboardWidgets && (cfg.dashboardWidgets as any)[item.key]);
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleWidget(item.key as keyof DashboardWidgetConfig)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isEnabled
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-900/60 border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isEnabled ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                        />
                        <span className="font-bold text-white">{item.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div
                      className={`px-2 py-1 rounded text-[10px] font-bold font-mono shrink-0 transition ${
                        isEnabled
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isEnabled ? 'VISIBLE' : 'HIDDEN'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sound Synthesizer & Acoustic Effects Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Acoustic Sound Synthesizer (Web Audio API)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time synthesized audio feedback for barcode scanning, POS payment chimes, and system alert warnings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !(cfg.soundEnabled ?? true);
                  soundEffects.setMuted(!next);
                  setCfg({ ...cfg, soundEnabled: next });
                  onUpdateCompanyConfig({ ...cfg, soundEnabled: next });
                  if (next) soundEffects.playClick();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                  cfg.soundEnabled ?? true
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {cfg.soundEnabled ?? true ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Sound Active</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span>Sound Muted</span>
                  </>
                )}
              </button>
            </div>

            {/* Audio Test Triggers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => soundEffects.playBarcodeBeep()}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center transition cursor-pointer"
              >
                <div className="text-xs font-bold text-amber-300">Scanner Beep</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">2150Hz Laser Pulse</div>
              </button>

              <button
                type="button"
                onClick={() => soundEffects.playCashChime()}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center transition cursor-pointer"
              >
                <div className="text-xs font-bold text-emerald-300">Payment Chime</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">4-Note Harmonic Chord</div>
              </button>

              <button
                type="button"
                onClick={() => soundEffects.playAlertBuzzer()}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center transition cursor-pointer"
              >
                <div className="text-xs font-bold text-rose-300">Alert Buzzer</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Dual-Tone Warning</div>
              </button>

              <button
                type="button"
                onClick={() => soundEffects.playExpand()}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center transition cursor-pointer"
              >
                <div className="text-xs font-bold text-cyan-300">Expand Whoosh</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Tactile Sweep</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Staff Roles & Granular Permissions Matrix */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Staff Users & Granular Access Control</h2>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff User</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
                    />
                    <div>
                      <div className="font-bold text-white text-sm">{u.name}</div>
                      <div className="text-[11px] text-amber-400 font-medium capitalize">
                        {u.roleTitle} [{u.role}]
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {u.email} • PIN: {u.pin}
                      </div>
                    </div>
                  </div>

                  {u.role !== 'owner' && (
                    <button
                      onClick={() => onDeleteUser(u.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Permissions Toggles List */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Granular RBAC Permissions:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(u.permissions).map(([permKey, hasPerm]) => (
                      <label key={permKey} className="flex items-center gap-1.5 text-slate-300">
                        <input
                          type="checkbox"
                          checked={hasPerm}
                          disabled={u.role === 'owner'}
                          onChange={(e) => {
                            onUpdateUser({
                              ...u,
                              permissions: {
                                ...u.permissions,
                                [permKey]: e.target.checked,
                              },
                            });
                          }}
                          className="rounded bg-slate-800 border-slate-700 text-amber-500"
                        />
                        <span className="capitalize truncate">
                          {permKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Store Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Oman Store Branch Network</h2>
            <button
              onClick={() => setIsBranchModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Store Branch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{b.name}</span>
                      {b.isHeadquarters && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          HEADQUARTERS
                        </span>
                      )}
                    </h3>
                    <div className="text-slate-400 text-[11px]" dir="rtl">
                      {b.nameAr}
                    </div>
                  </div>

                  {!b.isHeadquarters && (
                    <button
                      onClick={() => onDeleteBranch(b.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-300">
                  <div><strong>City:</strong> {b.city}</div>
                  <div><strong>Address:</strong> {b.address}</div>
                  <div><strong>Phone:</strong> {b.phone}</div>
                  <div><strong>CR No:</strong> {b.crNumber} | <strong>VAT:</strong> {b.vatNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Product Categories Management */}
      {activeTab === 'categories' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-xs space-y-4">
            <h2 className="text-sm font-bold text-white">Add Product Category</h2>

            <form onSubmit={handleAddCategorySubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category Name (English, e.g. Smart Watches)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
              />
              <input
                type="text"
                dir="rtl"
                value={newCatNameAr}
                onChange={(e) => setNewCatNameAr(e.target.value)}
                placeholder="اسم الفئة بالعربية"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition whitespace-nowrap"
              >
                Add Category
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[11px] text-slate-400" dir="rtl">{c.nameAr}</div>
                </div>
                <button
                  onClick={() => onDeleteCategory(c.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Company Profile & CR/VAT Details */}
      {activeTab === 'company' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl shadow-xl text-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span>Company Branding & Legal VAT Configurations</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Changeable to any business (Electronics, Supermarket, Restaurant, Big Bro Trading, Workshop).
              </p>
            </div>
            {savedConfigToast && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Saved successfully!</span>
              </span>
            )}
          </div>

          {/* 1-Click Business Solutions Presets */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Business Solution Presets:</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUSINESS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCfg({ ...cfg, ...preset.config })}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-left transition cursor-pointer group"
                >
                  <div className="font-bold text-[11px] text-white group-hover:text-amber-300 truncate">
                    {preset.name.split('-')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {preset.config.shortName} • {preset.config.taxLabel}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveCompanyConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Legal Name (English) *</label>
                <input
                  type="text"
                  required
                  value={cfg.companyName}
                  onChange={(e) => setCfg({ ...cfg, companyName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Legal Name (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={cfg.companyNameAr}
                  onChange={(e) => setCfg({ ...cfg, companyNameAr: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-arabic"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Legal Name (Bangla - বাংলা)</label>
                <input
                  type="text"
                  placeholder="ফাকার আল আইয়াম প্রজেক্টস এলএলসি"
                  value={cfg.companyNameBn || ''}
                  onChange={(e) => setCfg({ ...cfg, companyNameBn: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brand Badge Initials (e.g. FAP, MEP, RB)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={cfg.shortName || ''}
                  onChange={(e) => setCfg({ ...cfg, shortName: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Tagline (English)</label>
                <input
                  type="text"
                  value={cfg.tagline || ''}
                  onChange={(e) => setCfg({ ...cfg, tagline: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Tagline (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={cfg.taglineAr || ''}
                  onChange={(e) => setCfg({ ...cfg, taglineAr: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-arabic"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Tagline (Bangla - বাংলা)</label>
                <input
                  type="text"
                  placeholder="বাণিজ্যিক প্রকল্প, ইলেকট্রনিক্স ও স্মার্ট সিকিউরিটি সিস্টেম"
                  value={cfg.taglineBn || ''}
                  onChange={(e) => setCfg({ ...cfg, taglineBn: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Active Color Accent Theme</label>
                <select
                  value={cfg.colorTheme || 'emerald_gold'}
                  onChange={(e) => setCfg({ ...cfg, colorTheme: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold"
                >
                  <option value="emerald_gold">Emerald Gold (Flagship Luxury Tech)</option>
                  <option value="neon_cyan">Cyber Neon Cyan (Futuristic)</option>
                  <option value="sapphire_tech">Sapphire Tech (Enterprise Blue)</option>
                  <option value="cyber_amber">Obsidian Amber (Night Vision)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={cfg.taxRatePercent ?? 5}
                  onChange={(e) => setCfg({ ...cfg, taxRatePercent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tax Label (e.g. VAT 5%)</label>
                <input
                  type="text"
                  value={cfg.taxLabel || 'VAT 5%'}
                  onChange={(e) => setCfg({ ...cfg, taxLabel: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Commercial Registration (CR No)</label>
                <input
                  type="text"
                  required
                  value={cfg.crNumber}
                  onChange={(e) => setCfg({ ...cfg, crNumber: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Oman VAT Identification No (OTA)</label>
                <input
                  type="text"
                  required
                  value={cfg.vatNumber}
                  onChange={(e) => setCfg({ ...cfg, vatNumber: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store Official Phone</label>
                <input
                  type="text"
                  required
                  value={cfg.phone}
                  onChange={(e) => setCfg({ ...cfg, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={cfg.email}
                  onChange={(e) => setCfg({ ...cfg, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Head Office Address</label>
                <input
                  type="text"
                  required
                  value={cfg.address}
                  onChange={(e) => setCfg({ ...cfg, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Invoice Footer Return Policy (English)</label>
                <textarea
                  rows={2}
                  value={cfg.invoiceFooterNote}
                  onChange={(e) => setCfg({ ...cfg, invoiceFooterNote: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Invoice Footer Return Policy (Arabic)</label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={cfg.invoiceFooterNoteAr}
                  onChange={(e) => setCfg({ ...cfg, invoiceFooterNoteAr: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Company Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 text-xs text-slate-100 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-white">Create New Staff User</h3>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Salim Al-Kharusi"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="salim@alrabil-oman.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">System Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => {
                      const role = e.target.value as UserRoleType;
                      setUserRole(role);
                      if (role === 'manager') setUserRoleTitle('Branch Operations Manager');
                      if (role === 'technician') setUserRoleTitle('Hardware Maintenance Tech');
                      if (role === 'cashier') setUserRoleTitle('POS Cashier');
                      if (role === 'accountant') setUserRoleTitle('Financial Auditor');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="manager">Manager</option>
                    <option value="technician">Technician</option>
                    <option value="cashier">Cashier</option>
                    <option value="accountant">Accountant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login PIN (4-Digits)</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={userPin}
                    onChange={(e) => setUserPin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100 text-center text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 text-xs text-slate-100 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-white">Add New Store Branch</h3>

            <form onSubmit={handleCreateBranch} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Branch Name (English)</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Al-Rabil Mobiles - Barka Commercial"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Branch Name (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={branchNameAr}
                  onChange={(e) => setBranchNameAr(e.target.value)}
                  placeholder="فرع بركاء التجاري"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address Details</label>
                <input
                  type="text"
                  required
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
