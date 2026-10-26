import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Server,
  Globe,
  Building2,
  Store,
  DollarSign,
  KeyRound,
  Printer,
  Terminal,
  Check,
  ArrowRight,
  ArrowLeft,
  Minus,
  Square,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  AlertCircle,
  QrCode,
  Flame,
  HardDrive,
  Smartphone,
  Wrench,
  Cctv,
  UtensilsCrossed,
  ShoppingCart,
  Truck,
  FileSpreadsheet,
  Download,
  Upload,
  CreditCard,
  Lock,
  Volume2,
  VolumeX,
  Layers,
  Search,
  Copy,
  FileText,
  HelpCircle,
  Send,
  Users,
  Scale,
  Receipt,
  RotateCcw,
  Landmark,
  ShieldAlert,
  Tv,
  CheckSquare,
  Square as SquareEmpty,
} from 'lucide-react';
import {
  CompanyConfig,
  CurrencyCode,
  LanguageCode,
  StoreLocation,
  User,
  BusinessIndustry,
} from '../types';
import { BUSINESS_PRESETS, DEFAULT_DASHBOARD_WIDGETS } from '../utils/storage';
import { CURRENCY_RATES, formatMoney } from '../utils/formatters';
import { soundEffects } from '../utils/soundEffects';

interface SoftwareInstallationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: CompanyConfig;
  currentCurrency: CurrencyCode;
  currentLanguage: LanguageCode;
  branches: StoreLocation[];
  currentUser: User;
  onCompleteInstallation: (payload: {
    config: CompanyConfig;
    currency: CurrencyCode;
    language: LanguageCode;
    primaryBranch: Partial<StoreLocation>;
    ownerUser: { name: string; pin: string };
    receiptFormat: 'a4' | 'medium' | 'small';
    deploymentMode: string;
  }) => void;
}

export type WizardTopicCategory =
  | 'intro'
  | 'clients'
  | 'company'
  | 'programs'
  | 'hardware'
  | 'csv_data'
  | 'security'
  | 'support'
  | 'deploy';

interface ProgramModuleItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  description: string;
  icon: any;
  enabled: boolean;
  isCore?: boolean;
}

export const SoftwareInstallationWizardModal: React.FC<SoftwareInstallationWizardModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  currentCurrency,
  currentLanguage,
  branches,
  currentUser,
  onCompleteInstallation,
}) => {
  if (!isOpen) return null;

  // Active Wizard Section / Topic
  const [activeSection, setActiveSection] = useState<WizardTopicCategory>('intro');
  const [searchTopicQuery, setSearchTopicQuery] = useState('');

  // Client Selection State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-fakar-alayam');
  const [deploymentMode, setDeploymentMode] = useState<
    'desktop_standalone' | 'multi_branch_server' | 'cloud_hybrid'
  >('desktop_standalone');

  // Company Profile & Legal Attributes (Fully Editable)
  const [config, setConfig] = useState<CompanyConfig>({
    ...currentConfig,
    companyName: currentConfig.companyName || 'FAKAR AL AYAM PROJECTS LLC',
    companyNameAr: currentConfig.companyNameAr || 'شركة فكار الأيام للمشاريع ذ.م.م',
    companyNameBn: currentConfig.companyNameBn || 'ফাকার আল আইয়াম প্রজেক্টস এলএলসি',
    shortName: currentConfig.shortName || 'FAKAR AL AYAM',
    tagline: currentConfig.tagline || 'Commercial Projects, Electronics & Smart Systems Solutions',
    taglineAr: currentConfig.taglineAr || 'حلول المشاريع التجارية والإلكترونيات والأنظمة الذكية المتكاملة',
    taglineBn: currentConfig.taglineBn || 'বাণিজ্যিক প্রকল্প, ইলেকট্রনিক্স ও স্মার্ট সিকিউরিটি সিস্টেম সলিউশন',
    crNumber: currentConfig.crNumber || 'CR 1492083/2026',
    vatNumber: currentConfig.vatNumber || 'OM1100984512',
    taxRatePercent: currentConfig.taxRatePercent !== undefined ? currentConfig.taxRatePercent : 5.0,
    taxLabel: currentConfig.taxLabel || 'Oman VAT (5%)',
    phone: currentConfig.phone || '+968 2478 9120',
    email: currentConfig.email || 'info@fakar-alayam.com',
    address: currentConfig.address || 'Commercial Projects Complex, Ruwi High Street, Muscat, Oman',
    addressAr: currentConfig.addressAr || 'مجمع المشاريع التجارية، شارع روي التجاري، مسقط، سلطنة عُمان',
    addressBn: currentConfig.addressBn || 'রুই বাণিজ্যিক কেন্দ্র, মাস্কাট, ওমান',
    invoiceFooterNote:
      currentConfig.invoiceFooterNote ||
      'FAKAR AL AYAM PROJECTS LLC - Official computerized tax invoice. Goods eligible for exchange within 7 days with original invoice.',
    invoiceFooterNoteAr:
      currentConfig.invoiceFooterNoteAr ||
      'شركة فكار الأيام للمشاريع ذ.م.م - فاتورة ضريبية رسمية معتمدة. تقبل البضاعة للاستبدال خلال 7 أيام بالفاتورة الأصلية.',
  });

  // Localization
  const [currency, setCurrency] = useState<CurrencyCode>(currentCurrency || 'OMR');
  const [language, setLanguage] = useState<LanguageCode>(currentLanguage || 'en');

  // Primary Branch & Head Office
  const [branchName, setBranchName] = useState<string>(
    branches[0]?.name || 'FAKAR AL AYAM PROJECTS LLC - Ruwi Commercial HQ'
  );
  const [branchCity, setBranchCity] = useState<string>(branches[0]?.city || 'Muscat');
  const [branchAddress, setBranchAddress] = useState<string>(
    config.address || 'Commercial Projects Complex, Ruwi High Street, Shop #14, Muscat, Oman'
  );
  const [branchPhone, setBranchPhone] = useState<string>(config.phone || '+968 2478 9120');

  // Master Owner & Security
  const [ownerName, setOwnerName] = useState<string>(currentUser.name || 'Owner Administrator');
  const [ownerPin, setOwnerPin] = useState<string>(currentUser.pin || '9900');
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(15);

  // Hardware & Peripherals Configuration
  const [receiptFormat, setReceiptFormat] = useState<'a4' | 'medium' | 'small'>('medium');
  const [enableSoundAlerts, setEnableSoundAlerts] = useState<boolean>(true);
  const [openingCashFloat, setOpeningCashFloat] = useState<number>(150);
  const [autoCashDrawerKick, setAutoCashDrawerKick] = useState<boolean>(true);
  const [dualScreenCustomerDisplay, setDualScreenCustomerDisplay] = useState<boolean>(true);
  const [creditCardGateway, setCreditCardGateway] = useState<'omannet' | 'bank_muscat' | 'generic_eftpos'>('omannet');
  const [faxNumber, setFaxNumber] = useState<string>('+968 2478 9121');
  const [smtpEmailDispatch, setSmtpEmailDispatch] = useState<string>('billing@fakar-alayam.com');
  const [receiptHeaderText, setReceiptHeaderText] = useState<string>('FAKAR AL AYAM PROJECTS LLC - OFFICIAL VAT RECEIPT');

  // ADD / REMOVE PROGRAMS & MODULES (Full Client Customization)
  const [installedModules, setInstalledModules] = useState<ProgramModuleItem[]>([
    {
      id: 'mod-pos',
      name: 'High-Speed POS & Touch Cashier',
      nameAr: 'نقطة البيع السريعة وشاشة اللمس',
      category: 'Sales',
      description: 'Barcode laser scan, fast touch register, multi-tender payments, automated change calculations.',
      icon: ShoppingCart,
      enabled: true,
      isCore: true,
    },
    {
      id: 'mod-inventory',
      name: 'Stock Inventory & 15-Digit IMEI Tracker',
      nameAr: 'المخزون وتتبع الرقم التسلسلي IMEI',
      category: 'Stock',
      description: 'Multi-branch stock levels, serial number registry, low stock alerts, cost vs margin metrics.',
      icon: Layers,
      enabled: true,
      isCore: true,
    },
    {
      id: 'mod-restaurant',
      name: 'Restaurant Menus & Dining Tables',
      nameAr: 'قوائم المطاعم وإدارة الطاولات',
      category: 'Hospitality',
      description: 'Visual dining room table layout, food menu categories, kitchen display orders & recipe costings.',
      icon: UtensilsCrossed,
      enabled: false,
    },
    {
      id: 'mod-cctv',
      name: 'CCTV Surveillance & Smart Door Access',
      nameAr: 'المراقبة بالفيديو وقفل الباب الذكي',
      category: 'Security',
      description: 'Live 4K IP cameras, NVR recording health, smart biometric door lock, field technician packages.',
      icon: Cctv,
      enabled: true,
    },
    {
      id: 'mod-repairs',
      name: 'Hardware Repair Lab & Job Cards',
      nameAr: 'مختبر الصيانة وبطاقات العمل',
      category: 'Services',
      description: 'Diagnostic intake, micro-soldering bench, spare parts consumption, customer warranty terms.',
      icon: Wrench,
      enabled: true,
    },
    {
      id: 'mod-utility-bills',
      name: 'Oman Utility & Telecom Bill Center',
      nameAr: 'تسديد فواتير الكهرباء والمياه والاتصالات',
      category: 'Services',
      description: 'Nama electricity, Diam water, Omantel, Ooredoo, Vodafone instant bill settlement & commissions.',
      icon: Smartphone,
      enabled: true,
    },
    {
      id: 'mod-bank-treasury',
      name: 'Multi-Bank Treasury & Vault Deposits',
      nameAr: 'إدارة الحسابات البنكية والخزينة',
      category: 'Finance',
      description: 'Bank Muscat, Bank Dhofar, NBO accounts, daily cash drawer float, end-of-day bank deposits.',
      icon: Landmark,
      enabled: true,
    },
    {
      id: 'mod-customers',
      name: 'Customer Directory & Credit Khata',
      nameAr: 'دليل العملاء وحسابات الآجل',
      category: 'Sales',
      description: 'VIP accounts, credit limits, aged receivables ledger, WhatsApp computerized invoice dispatch.',
      icon: Users,
      enabled: true,
    },
    {
      id: 'mod-branch-transfer',
      name: 'Inter-Branch Stock Transfers',
      nameAr: 'التحويلات المخزنية بين الفروع',
      category: 'Stock',
      description: 'Stock rebalancing between Ruwi HQ and branch outlets with delivery transfer notes.',
      icon: Truck,
      enabled: true,
    },
    {
      id: 'mod-purchase-orders',
      name: 'Purchase Orders & Supplier Procurement',
      nameAr: 'أوامر الشراء وإدارة الموردين',
      category: 'Stock',
      description: 'Vendor catalog, auto PO generation for low-stock items, receiving history and payment tracking.',
      icon: FileSpreadsheet,
      enabled: true,
    },
    {
      id: 'mod-returns',
      name: 'Customer Returns & Refund Restock',
      nameAr: 'مرتجعات العملاء والاستبدال',
      category: 'Sales',
      description: 'Serial number return verification, original receipt lookup, inventory restocking.',
      icon: RotateCcw,
      enabled: true,
    },
    {
      id: 'mod-ai-advisor',
      name: 'Gemini AI Enterprise Auditor',
      nameAr: 'مستشار الذكاء الاصطناعي للأعمال',
      category: 'Intelligence',
      description: 'Automated P&L auditing, dead-stock detection, margin optimization, revenue forecast.',
      icon: Sparkles,
      enabled: true,
    },
  ]);

  // CSV Import Wizard State (Phase 1 -> 2 -> 3)
  const [csvStep, setCsvStep] = useState<1 | 2 | 3>(1);
  const [csvFileName, setCsvFileName] = useState<string>('fakar_alayam_catalog_import.csv');
  const [csvMappedFields, setCsvMappedFields] = useState({
    sku: 'Item_SKU_Code',
    name: 'Product_Description',
    barcode: 'Barcode_EAN13',
    costPrice: 'Unit_Cost_OMR',
    sellingPrice: 'Retail_Price_OMR',
    stock: 'Initial_Stock_Qty',
    category: 'Category_Group',
  });
  const [csvSimulatedCount, setCsvSimulatedCount] = useState<number>(38);
  const [csvImportSuccess, setCsvImportSuccess] = useState<boolean>(false);

  // Backup & Restore state
  const [backupDownloaded, setBackupDownloaded] = useState<boolean>(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  // Salesperson List
  const [salespersons, setSalespersons] = useState([
    { id: 'sp-1', name: 'Ahmed Noor', code: 'SP-01', branch: 'Ruwi HQ', commissionPct: 2.0 },
    { id: 'sp-2', name: 'Tariq Al-Balushi', code: 'SP-02', branch: 'Ruwi HQ', commissionPct: 2.5 },
    { id: 'sp-3', name: 'Hamad Al-Amri', code: 'SP-03', branch: 'Al Khoudh', commissionPct: 2.0 },
  ]);

  // Unit Measure List
  const unitMeasureList = ['Pieces (pcs)', 'Units (unt)', 'Meters (m)', 'Kilograms (kg)', 'Box (bx)', 'Carton (ctn)', 'Set (st)'];
  // Ship By List
  const shipByCarriers = ['Asyad Express Oman', 'DHL Express GCC', 'Aramex Domestic', 'Store Customer Pickup', 'Direct Company Van'];

  // Installation Process State (Step execution)
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // EULA & License State
  const [eulaAccepted, setEulaAccepted] = useState<boolean>(true);
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('FAKAR-2026-OMAN-PRO-ENT-9941');

  // Toggle module installed / removed
  const toggleModule = (id: string) => {
    soundEffects.playClick();
    setInstalledModules((prev) =>
      prev.map((mod) => (mod.id === id && !mod.isCore ? { ...mod, enabled: !mod.enabled } : mod))
    );
  };

  // Client Preset Selection Handler
  const handleSelectPreset = (presetId: string) => {
    soundEffects.playExpand();
    setSelectedPresetId(presetId);
    const preset = BUSINESS_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.config) {
      setConfig((prev) => ({
        ...prev,
        ...preset.config,
      }));
      setBranchName(preset.config.companyName || branchName);
      if (preset.config.address) setBranchAddress(preset.config.address);
      if (preset.config.phone) setBranchPhone(preset.config.phone);

      // Adjust module selection according to preset industry
      if (preset.industry === 'restaurant_cafe') {
        setInstalledModules((prev) =>
          prev.map((m) =>
            m.id === 'mod-restaurant' ? { ...m, enabled: true } : m.id === 'mod-cctv' ? { ...m, enabled: false } : m
          )
        );
      } else if (preset.industry === 'electronics_cctv') {
        setInstalledModules((prev) =>
          prev.map((m) =>
            m.id === 'mod-restaurant' ? { ...m, enabled: false } : m.id === 'mod-cctv' ? { ...m, enabled: true } : m
          )
        );
      }
    }
  };

  // Download system backup JSON
  const handleExportBackup = () => {
    soundEffects.playClick();
    const backupData = {
      systemVersion: 'Enterprise ERP v5.2',
      exportDate: new Date().toISOString(),
      clientProfile: selectedPresetId,
      config,
      currency,
      language,
      installedModules: installedModules.filter((m) => m.enabled).map((m) => m.name),
      primaryBranch: { branchName, branchCity, branchAddress, branchPhone },
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${config.shortName || 'ERP'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setBackupDownloaded(true);
    setTimeout(() => setBackupDownloaded(false), 4000);
  };

  // Run simulated installation sequence on 'deploy' tab
  const runInstallation = () => {
    if (isInstalling || isFinished) return;
    setIsInstalling(true);
    setInstallProgress(5);
    setInstallLogs([`[INIT] Booting Enterprise ERP Software Installer v5.2...`]);
    soundEffects.playBarcodeBeep();

    const activeModCount = installedModules.filter((m) => m.enabled).length;

    const timeline: [number, string, number][] = [
      [12, 'Verifying EULA & License Certificate: ' + licenseKeyInput, 250],
      [24, `Configuring Client Profile: ${config.companyName} (${config.shortName})...`, 500],
      [38, `Building Database Schemas & Partition Tables (IndexedDB + Cloud Sync)...`, 850],
      [52, `Installing ${activeModCount} enabled programs & registering hardware drivers...`, 1200],
      [68, `Configuring Thermal Printer (${receiptFormat.toUpperCase()}) & OmanNet EFTPOS...`, 1600],
      [82, `Securing Executive Administrator Credentials (${ownerName} - PIN: ****)...`, 2000],
      [94, `Applying Tax Framework (${config.taxLabel} - ${config.taxRatePercent}%) & Currencies (${currency})...`, 2400],
      [100, `✓ Installation Completed! All system modules compiled & verified.`, 2800],
    ];

    timeline.forEach(([pct, log, delay]) => {
      setTimeout(() => {
        setInstallProgress(pct);
        setInstallLogs((prev) => [...prev, log]);
        if (pct === 100) {
          setIsInstalling(false);
          setIsFinished(true);
          soundEffects.playCashChime();
        }
      }, delay);
    });
  };

  const handleLaunchSystem = () => {
    soundEffects.playCashChime();

    // Map installed modules to dashboard widgets
    const updatedDashboardWidgets = {
      ...DEFAULT_DASHBOARD_WIDGETS,
      showPOSWidget: installedModules.find((m) => m.id === 'mod-pos')?.enabled ?? true,
      showCCTVFeeds: installedModules.find((m) => m.id === 'mod-cctv')?.enabled ?? true,
      showSmartDoor: installedModules.find((m) => m.id === 'mod-cctv')?.enabled ?? true,
      showRepairBottlenecks: installedModules.find((m) => m.id === 'mod-repairs')?.enabled ?? true,
      showBankLedger: installedModules.find((m) => m.id === 'mod-bank-treasury')?.enabled ?? true,
      showCashDrawer: installedModules.find((m) => m.id === 'mod-bank-treasury')?.enabled ?? true,
    };

    onCompleteInstallation({
      config: {
        ...config,
        dashboardWidgets: updatedDashboardWidgets,
        soundEnabled: enableSoundAlerts,
      },
      currency,
      language,
      primaryBranch: {
        name: branchName,
        city: branchCity,
        address: branchAddress,
        phone: branchPhone,
        crNumber: config.crNumber,
        vatNumber: config.vatNumber,
      },
      ownerUser: {
        name: ownerName,
        pin: ownerPin,
      },
      receiptFormat,
      deploymentMode,
    });
    onClose();
  };

  // Nav topics definition
  const navTopics = [
    { id: 'intro', title: '1. Welcome & License', subtitle: 'EULA & Diagnostics', icon: Monitor },
    { id: 'clients', title: '2. Client Business Choice', subtitle: 'Presets & Industry', icon: Store },
    { id: 'company', title: '3. Company & Fiscal', subtitle: 'CR, VAT, Multi-Lang', icon: Building2 },
    { id: 'programs', title: '4. Add / Remove Programs', subtitle: '12 Module Choosers', icon: Layers },
    { id: 'hardware', title: '5. Hardware & Peripherals', subtitle: 'Printers, EFTPOS, Scanners', icon: Printer },
    { id: 'csv_data', title: '6. CSV Import & Backup', subtitle: 'Catalog Wizard & Restore', icon: FileSpreadsheet },
    { id: 'security', title: '7. Passwords & Shortcuts', subtitle: 'PINs, Staff, F1-F9 keys', icon: KeyRound },
    { id: 'support', title: '8. Technical Support', subtitle: 'Documentation & Guides', icon: HelpCircle },
    { id: 'deploy', title: '9. Execute & Deploy', subtitle: 'Compile & Launch ERP', icon: Terminal },
  ];

  const filteredTopics = navTopics.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTopicQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchTopicQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Desktop Software Window Shell */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col text-slate-100 overflow-hidden my-auto max-h-[96vh] ring-1 ring-white/10 font-sans">
        {/* Title Bar with Window Controls */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold font-mono tracking-tight text-slate-200">
                Enterprise ERP Setup & Customization Suite v5.2
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-amber-400 font-mono">
                [Client Setup & Module Manager]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
              title="Maximize"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-xs"
              title="Close Setup Wizard"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Wizard Main Content Grid: Left Index Nav + Right Content Area */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* Left Rail: Setup Index (NCH Software Suite / Enterprise Desktop Style) */}
          <div className="w-full md:w-72 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-3.5 shrink-0 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              {/* Search Bar for Setup Topics */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter Setup Topics..."
                  value={searchTopicQuery}
                  onChange={(e) => setSearchTopicQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
                Setup Navigation
              </div>

              {/* Navigation List */}
              <div className="space-y-1">
                {filteredTopics.map((topic) => {
                  const Icon = topic.icon;
                  const isActive = activeSection === topic.id;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        soundEffects.playClick();
                        setActiveSection(topic.id as WizardTopicCategory);
                        if (topic.id === 'deploy' && !isFinished && !isInstalling) {
                          runInstallation();
                        }
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition text-xs cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate leading-tight font-semibold">{topic.title}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isActive ? 'text-slate-900 font-medium' : 'text-slate-500'
                          }`}
                        >
                          {topic.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diagnostics Quick Badge */}
            <div className="pt-3 border-t border-slate-800/80 mt-4 text-[10px] text-slate-400 space-y-1.5 hidden md:block">
              <div className="flex items-center justify-between">
                <span>Client Profile:</span>
                <span className="font-bold text-amber-400 truncate max-w-[110px]">
                  {config.shortName || 'FAP'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Modules:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {installedModules.filter((m) => m.enabled).length} / {installedModules.length} Enabled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Engine:</span>
                <span className="font-mono text-slate-300">IndexedDB + Cloud</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Active Section Content */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden min-h-0">
            {/* Step Top Banner */}
            <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Setup Category: {activeSection.toUpperCase()}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {navTopics.find((t) => t.id === activeSection)?.title} –{' '}
                  {navTopics.find((t) => t.id === activeSection)?.subtitle}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow-inner">
                {React.createElement(navTopics.find((t) => t.id === activeSection)?.icon || Monitor, {
                  className: 'w-4 h-4',
                })}
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
              {/* SECTION 1: WELCOME & LICENSE */}
              {activeSection === 'intro' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
                    <h4 className="text-sm font-bold text-white mb-1">
                      Welcome to FAKAR AL AYAM PROJECTS LLC Enterprise Software Suite
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      This comprehensive Installation & Customization Wizard allows clients to configure their
                      company credentials, choose active business engines, add or remove programs, set up thermal
                      printers and optical scanners, import product catalogs via CSV, and customize fiscal Oman VAT parameters.
                    </p>
                  </div>

                  {/* Software License Terms (EULA) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                        Software License Agreement (EULA):
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        COMMERCIAL PERPETUAL
                      </span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 h-28 overflow-y-auto font-mono text-[11px] text-slate-400 leading-relaxed scrollbar-thin">
                      <p className="text-slate-300 font-bold mb-1">
                        COMMERCIAL SOFTWARE LICENSE AGREEMENT – FAKAR AL AYAM PROJECTS LLC
                      </p>
                      <p>
                        1. GRANT OF LICENSE: FAKAR AL AYAM PROJECTS LLC grants the licensee a non-exclusive, perpetual
                        enterprise software license for installation across retail stores, warehouses, and commercial offices.
                      </p>
                      <p className="mt-1">
                        2. FISCAL COMPLIANCE: The software is configured to operate in compliance with regional Tax
                        Authorities (Oman Tax Authority 5% VAT, ZATCA Phase-2 QR, and UAE FTA standards).
                      </p>
                      <p className="mt-1">
                        3. DATA PRIVACY: All customer records, IMEI registries, and financial bank balances are stored
                        locally on the client machine with optional AES-encrypted Firebase Firestore cloud synchronization.
                      </p>
                      <p className="mt-1">
                        4. WARRANTY: 12 months commercial technical support and updates included.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="accept-eula"
                        checked={eulaAccepted}
                        onChange={(e) => setEulaAccepted(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="accept-eula" className="text-slate-300 text-[11px] cursor-pointer">
                        I accept the Software License Terms and Commercial Warranty conditions.
                      </label>
                    </div>
                  </div>

                  {/* License Key & System Diagnostic Verification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">License Activation Key</label>
                      <input
                        type="text"
                        value={licenseKeyInput}
                        onChange={(e) => setLicenseKeyInput(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-amber-400 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Deployment Architecture</label>
                      <select
                        value={deploymentMode}
                        onChange={(e) => setDeploymentMode(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 text-xs"
                      >
                        <option value="desktop_standalone">Single-Terminal Retail POS (Offline First)</option>
                        <option value="multi_branch_server">Multi-Branch Enterprise Hub (LAN / WAN)</option>
                        <option value="cloud_hybrid">Cloud-Connected Smart Node (Firebase Live)</option>
                      </select>
                    </div>
                  </div>

                  {/* System Readiness Checks */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      System Diagnostics Readiness:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>WebRTC Cam OK</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>WebAudio Synth OK</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>IndexedDB Ready</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>Thermal Driver OK</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: CLIENT BUSINESS CHOOSER */}
              {activeSection === 'clients' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">Select Main Client Business Solution</h4>
                    <p className="text-slate-400 text-[11px]">
                      Choose an enterprise business preset. This automatically configures default products,
                      categories, tax labels, and program settings:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUSINESS_PRESETS.map((p) => {
                      const isSelected = selectedPresetId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPreset(p.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10'
                              : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div>
                                <span className="font-bold text-xs text-white line-clamp-1">{p.name}</span>
                                {p.config.companyNameAr && (
                                  <div className="text-[10px] text-amber-400/90 font-arabic mt-0.5">
                                    {p.config.companyNameAr}
                                  </div>
                                )}
                              </div>
                              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 font-bold shrink-0">
                                {p.config.shortName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {p.description}
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px]">
                            <span className="text-emerald-400 font-medium">{p.config.taxLabel}</span>
                            <span
                              className={`font-bold flex items-center gap-1 ${
                                isSelected ? 'text-amber-400' : 'text-slate-500'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Active Client Selected</span>
                                </>
                              ) : (
                                'Click to Choose'
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: COMPANY & FISCAL SETUP */}
              {activeSection === 'company' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">Company Credentials & Fiscal Policy</h4>
                    <p className="text-slate-400 text-[11px]">
                      Fully editable corporate information printed on computerized invoices and receipts:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Company / Store Name (English) *</label>
                      <input
                        type="text"
                        required
                        value={config.companyName}
                        onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Company Name (Arabic / العربية)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={config.companyNameAr || ''}
                        onChange={(e) => setConfig({ ...config, companyNameAr: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-arabic focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Company Name (Bangla / বাংলা)</label>
                      <input
                        type="text"
                        value={config.companyNameBn || ''}
                        onChange={(e) => setConfig({ ...config, companyNameBn: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Brand Abbreviation / Short Code</label>
                      <input
                        type="text"
                        maxLength={12}
                        value={config.shortName}
                        onChange={(e) => setConfig({ ...config, shortName: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Commercial Registration (CR No) *</label>
                      <input
                        type="text"
                        required
                        value={config.crNumber}
                        onChange={(e) => setConfig({ ...config, crNumber: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">VAT Identification Number *</label>
                      <input
                        type="text"
                        required
                        value={config.vatNumber}
                        onChange={(e) => setConfig({ ...config, vatNumber: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Primary Operating Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 cursor-pointer"
                      >
                        {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((cur) => (
                          <option key={cur} value={cur}>
                            {cur} - {CURRENCY_RATES[cur].name} ({CURRENCY_RATES[cur].symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Default UI Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 cursor-pointer"
                      >
                        <option value="en">English (Default)</option>
                        <option value="ar">العربية (Arabic - RTL)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                        <option value="ml">മലയാളം (Malayalam)</option>
                        <option value="ur">اردو (Urdu)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Tax / VAT Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={config.taxRatePercent}
                        onChange={(e) => setConfig({ ...config, taxRatePercent: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100 text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Tax Label on Invoices</label>
                      <input
                        type="text"
                        value={config.taxLabel}
                        onChange={(e) => setConfig({ ...config, taxLabel: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-slate-300 font-semibold block mb-1">Commercial Physical Address</label>
                      <input
                        type="text"
                        value={config.address}
                        onChange={(e) => setConfig({ ...config, address: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: ADD / REMOVE PROGRAMS & MODULES */}
              {activeSection === 'programs' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">
                        Add / Remove Programs & Technical Features
                      </h4>
                      <p className="text-slate-400 text-[11px]">
                        Clients decide exactly which programs and modules are active in their software installation:
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          setInstalledModules((prev) => prev.map((m) => ({ ...m, enabled: true })));
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Enable All
                      </button>
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          setInstalledModules((prev) =>
                            prev.map((m) => (m.isCore ? m : { ...m, enabled: false }))
                          );
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] cursor-pointer"
                      >
                        Minimal Core
                      </button>
                    </div>
                  </div>

                  {/* Modules Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {installedModules.map((mod) => {
                      const Icon = mod.icon;
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleModule(mod.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            mod.enabled
                              ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm'
                              : 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-80'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              mod.enabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-bold text-xs text-white truncate">{mod.name}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                                  mod.enabled
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}
                              >
                                {mod.enabled ? 'INSTALLED' : 'REMOVED'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {mod.description}
                            </p>
                          </div>

                          <div className="pt-0.5 shrink-0">
                            {mod.enabled ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <SquareEmpty className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Unit Measure & Shipping Carriers Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-[11px]">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span>Unit Measure List (Supported Units):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {unitMeasureList.map((u, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ship By / Carrier Logistics:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {shipByCarriers.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: HARDWARE & TECHNICAL PERIPHERALS */}
              {activeSection === 'hardware' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      Hardware Devices, EFTPOS & Printers Configuration
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Configure thermal printers, OmanNet card terminals, camera scanners, and automated dispatch:
                    </p>
                  </div>

                  {/* Receipt Format Chooser */}
                  <div>
                    <label className="text-slate-300 font-bold block mb-2">Default Receipt & Invoice Thermal Format:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'medium', title: '80mm POS Thermal', desc: 'Standard counter printer (Epson/Star/Xprinter)' },
                        { id: 'small', title: '58mm Mobile Pocket', desc: 'Portable Bluetooth belt printer' },
                        { id: 'a4', title: 'A4 Full Page Laser', desc: 'Official commercial corporate tax invoice' },
                      ].map((fmt) => (
                        <div
                          key={fmt.id}
                          onClick={() => {
                            soundEffects.playClick();
                            setReceiptFormat(fmt.id as any);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition ${
                            receiptFormat === fmt.id
                              ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50'
                              : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-bold text-white mb-1 flex items-center justify-between">
                            <span>{fmt.title}</span>
                            {receiptFormat === fmt.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">{fmt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Gateway & Peripherals Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Credit Card Gateway / Reader</label>
                      <select
                        value={creditCardGateway}
                        onChange={(e) => setCreditCardGateway(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      >
                        <option value="omannet">OmanNet Direct EFTPOS (Debit / Credit)</option>
                        <option value="bank_muscat">Bank Muscat Corporate Payment Gateway</option>
                        <option value="generic_eftpos">Standard Serial / Bluetooth Card Terminal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Daily Opening Cash Drawer Float</label>
                      <input
                        type="number"
                        value={openingCashFloat}
                        onChange={(e) => setOpeningCashFloat(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Receipt Header Banner Text</label>
                      <input
                        type="text"
                        value={receiptHeaderText}
                        onChange={(e) => setReceiptHeaderText(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Automated Electronic Fax Number</label>
                      <input
                        type="text"
                        value={faxNumber}
                        onChange={(e) => setFaxNumber(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-slate-300 font-semibold block mb-1">Automated PDF Invoice Email Dispatch</label>
                      <input
                        type="email"
                        value={smtpEmailDispatch}
                        onChange={(e) => setSmtpEmailDispatch(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Peripherals Checkboxes */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto-drawer-kick"
                        checked={autoCashDrawerKick}
                        onChange={(e) => setAutoCashDrawerKick(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="auto-drawer-kick" className="text-slate-300 cursor-pointer">
                        Auto-kick cash drawer solenoid upon cash sale completion
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="dual-screen"
                        checked={dualScreenCustomerDisplay}
                        onChange={(e) => setDualScreenCustomerDisplay(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="dual-screen" className="text-slate-300 cursor-pointer">
                        Enable Dual-Screen customer-facing display pole (Live cart & VAT QR code)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="sound-chime"
                        checked={enableSoundAlerts}
                        onChange={(e) => setEnableSoundAlerts(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="sound-chime" className="text-slate-300 cursor-pointer">
                        Enable synthesized audio feedback for barcode laser scans and payment receipts
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: CSV IMPORT WIZARD & DATA BACKUP */}
              {activeSection === 'csv_data' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      CSV Import Wizard & Data Backup
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Quickly import existing stock catalogs from Excel / CSV files and manage full database backups:
                    </p>
                  </div>

                  {/* 3-Step CSV Flow */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                        <span>CSV Import Wizard (3-Phase Flow)</span>
                      </div>
                      <div className="flex gap-1 text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded ${csvStep === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                          1. Select CSV
                        </span>
                        <span className={`px-2 py-0.5 rounded ${csvStep === 2 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                          2. Match Fields
                        </span>
                        <span className={`px-2 py-0.5 rounded ${csvStep === 3 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                          3. Results
                        </span>
                      </div>
                    </div>

                    {/* Step 1: Select CSV */}
                    {csvStep === 1 && (
                      <div className="space-y-2.5">
                        <p className="text-[11px] text-slate-400">
                          Select a spreadsheet CSV exported from Excel, QuickBooks, or previous POS software:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={csvFileName}
                            onChange={(e) => setCsvFileName(e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-200 text-xs"
                          />
                          <button
                            onClick={() => {
                              soundEffects.playClick();
                              setCsvStep(2);
                            }}
                            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            <span>Analyze Fields</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Sample data ready: 38 items (iPhones, Samsung, Anker, Dahua 4K Kits, Tuya Locks).
                        </div>
                      </div>
                    )}

                    {/* Step 2: Match Fields */}
                    {csvStep === 2 && (
                      <div className="space-y-2.5">
                        <p className="text-[11px] text-slate-400">
                          Match your spreadsheet column names to the ERP internal product fields:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-slate-400">ERP: SKU</span>
                            <span className="text-amber-400 font-bold">{csvMappedFields.sku}</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-slate-400">ERP: Product Name</span>
                            <span className="text-amber-400 font-bold">{csvMappedFields.name}</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-slate-400">ERP: Barcode</span>
                            <span className="text-amber-400 font-bold">{csvMappedFields.barcode}</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                            <span className="text-slate-400">ERP: Selling Price</span>
                            <span className="text-emerald-400 font-bold">{csvMappedFields.sellingPrice}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <button
                            onClick={() => setCsvStep(1)}
                            className="px-2.5 py-1 text-slate-400 hover:text-white"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => {
                              soundEffects.playBarcodeBeep();
                              setCsvStep(3);
                              setCsvImportSuccess(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Validate & Import {csvSimulatedCount} Products</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: CSV Results */}
                    {csvStep === 3 && (
                      <div className="space-y-2">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            <strong>Import Verified!</strong> {csvSimulatedCount} products mapped and ready for deployment.
                          </span>
                        </div>
                        <button
                          onClick={() => setCsvStep(1)}
                          className="text-[11px] text-amber-400 underline"
                        >
                          Import another CSV file
                        </button>
                      </div>
                    )}
                  </div>

                  {/* System Backup & Restore */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <span className="font-bold text-slate-200 block text-xs flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-blue-400" />
                      <span>Data Backup & One-Click Restore</span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Export a secure offline JSON archive of all your configurations, branches, and custom settings:
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={handleExportBackup}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Full System Backup (.JSON)</span>
                      </button>

                      <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer text-xs border border-slate-700">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restore from JSON File</span>
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setRestoreStatus(`File "${e.target.files[0].name}" validated. Settings restored.`);
                              soundEffects.playBarcodeBeep();
                              setTimeout(() => setRestoreStatus(null), 3500);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {backupDownloaded && (
                      <div className="text-[11px] text-emerald-400 font-mono">
                        ✓ Backup file generated and saved to your device downloads folder.
                      </div>
                    )}
                    {restoreStatus && (
                      <div className="text-[11px] text-emerald-400 font-mono">
                        ✓ {restoreStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 7: PASSWORDS, USERS & SHORTCUTS */}
              {activeSection === 'security' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      Password Management, Salespersons & Keyboard Shortcuts
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Configure owner credentials, staff PINs, and speed billing keyboard shortcuts:
                    </p>
                  </div>

                  {/* Password / PIN Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Owner Master Name</label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Master Unlock PIN (4-Digits) *</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={ownerPin}
                        onChange={(e) => setOwnerPin(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-center text-sm font-bold text-amber-300 tracking-widest"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Auto-Lock Timeout</label>
                      <select
                        value={autoLockMinutes}
                        onChange={(e) => setAutoLockMinutes(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      >
                        <option value={5}>5 Minutes</option>
                        <option value={15}>15 Minutes (Default)</option>
                        <option value={30}>30 Minutes</option>
                        <option value={60}>1 Hour</option>
                      </select>
                    </div>
                  </div>

                  {/* Salesperson List */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-300 block text-xs flex items-center justify-between">
                      <span>Salesperson Directory (Active Sales Staff):</span>
                      <span className="text-[10px] text-amber-400 font-mono">Commission Tracking Active</span>
                    </span>
                    <div className="divide-y divide-slate-800 font-mono text-[11px]">
                      {salespersons.map((sp) => (
                        <div key={sp.id} className="py-1.5 flex items-center justify-between text-slate-300">
                          <div>
                            <span className="text-white font-bold">{sp.name}</span>{' '}
                            <span className="text-slate-500">({sp.code})</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400">{sp.branch}</span> •{' '}
                            <span className="text-emerald-400 font-bold">{sp.commissionPct}% Comm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keyboard Shortcuts Matrix */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-300 block text-xs flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      <span>Speed POS Keyboard Shortcuts:</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                        <span className="text-amber-400 font-bold">F1</span>
                        <span className="text-slate-300">POS Billing</span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                        <span className="text-amber-400 font-bold">F2</span>
                        <span className="text-slate-300">Stock Inventory</span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                        <span className="text-amber-400 font-bold">F3</span>
                        <span className="text-slate-300">Cam Barcode Scan</span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                        <span className="text-amber-400 font-bold">F4</span>
                        <span className="text-slate-300">Global Search</span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                        <span className="text-amber-400 font-bold">F9</span>
                        <span className="text-emerald-400 font-bold">Complete & Pay</span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                        <span className="text-rose-400 font-bold">Esc</span>
                        <span className="text-slate-300">Clear / Exit</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 8: TECHNICAL SUPPORT & DOCUMENTATION */}
              {activeSection === 'support' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      Online Technical Support & Software Documentation
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Enterprise resources, operational guides, and user manuals for staff training:
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="font-bold text-white text-xs">Technical Support Channels</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      If you experience operational questions regarding barcode scanners, thermal receipt
                      printers, or Oman VAT invoicing rules, contact the FAKAR AL AYAM technical support team:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="text-slate-500 text-[10px]">DIRECT HOTLINE:</div>
                        <div className="text-amber-400 font-bold text-xs">{config.phone}</div>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="text-slate-500 text-[10px]">TECHNICAL EMAIL:</div>
                        <div className="text-amber-400 font-bold text-xs">{config.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                    <div className="font-bold text-white text-xs">Software Suggestions & Free Upgrades</div>
                    <p className="text-slate-400 leading-relaxed">
                      If you have suggestions for improvements to Point of Sale features, camera scanner filters,
                      or restaurant table management, submit feedback through the Owner Console.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 9: EXECUTE & DEPLOY */}
              {activeSection === 'deploy' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">Execute System Setup & Launch</h4>
                    <p className="text-slate-400 text-[11px]">
                      Compile the configured settings, apply database partitions, and launch the ERP suite:
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-300 font-bold">
                        {isFinished ? 'Installation Completed 100%' : 'Applying Setup Configurations...'}
                      </span>
                      <span className="text-amber-400 font-bold">{installProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${installProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Terminal Log Console */}
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-300 h-44 overflow-y-auto space-y-1 scrollbar-thin">
                    <div className="text-slate-500">// Enterprise ERP Kernel Log</div>
                    {installLogs.map((log, i) => (
                      <div key={i} className={log.startsWith('✓') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                        {log}
                      </div>
                    ))}
                    {isInstalling && (
                      <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Applying configuration directives...</span>
                      </div>
                    )}
                  </div>

                  {/* Run / Restart Button if not finished */}
                  {!isInstalling && !isFinished && (
                    <button
                      onClick={runInstallation}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Terminal className="w-4 h-4" />
                      <span>Start Automated Installation & Compilation</span>
                    </button>
                  )}

                  {/* Finished Banner */}
                  {isFinished && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in zoom-in-95">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">System Configured Successfully!</h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {config.companyName} is ready. {installedModules.filter((m) => m.enabled).length} modules
                            activated with {currency} currency and {config.taxLabel}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Modal Actions Bar */}
            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 select-none">
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel / Close
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {activeSection !== 'intro' && (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = navTopics.findIndex((t) => t.id === activeSection);
                      if (idx > 0) {
                        soundEffects.playClick();
                        setActiveSection(navTopics[idx - 1].id as WizardTopicCategory);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Topic</span>
                  </button>
                )}

                {activeSection !== 'deploy' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = navTopics.findIndex((t) => t.id === activeSection);
                      if (idx < navTopics.length - 1) {
                        soundEffects.playClick();
                        const nextId = navTopics[idx + 1].id as WizardTopicCategory;
                        setActiveSection(nextId);
                        if (nextId === 'deploy' && !isFinished && !isInstalling) {
                          runInstallation();
                        }
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
                  >
                    <span>Next Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!isFinished}
                    onClick={handleLaunchSystem}
                    className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-lg shadow-emerald-500/30 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Launch & Enter System</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
