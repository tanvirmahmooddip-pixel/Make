import React, { useState, useEffect } from 'react';
import {
  Monitor,
  HardDrive,
  Cpu,
  Layers,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  X,
  Minus,
  Square,
  Sparkles,
  ShieldCheck,
  Building2,
  Store,
  DollarSign,
  Printer,
  Smartphone,
  UtensilsCrossed,
  ShoppingCart,
  Wrench,
  Lock,
  Terminal,
  RefreshCw,
  Sliders,
  Check,
  AlertCircle,
  FileText,
  Globe,
  Radio,
  Server,
  KeyRound,
  QrCode,
  Flame,
} from 'lucide-react';
import {
  CompanyConfig,
  CurrencyCode,
  LanguageCode,
  StoreLocation,
  User,
  BusinessIndustry,
} from '../types';
import { BUSINESS_PRESETS } from '../utils/storage';
import { CURRENCY_RATES, formatMoney } from '../utils/formatters';

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

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 7;

  // Wizard Configuration State
  const [deploymentMode, setDeploymentMode] = useState<'desktop_standalone' | 'multi_branch_server' | 'cloud_hybrid'>('desktop_standalone');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-rabiul-bigbrother');

  // Company Config
  const [config, setConfig] = useState<CompanyConfig>({ ...currentConfig });

  // Localization
  const [currency, setCurrency] = useState<CurrencyCode>(currentCurrency);
  const [language, setLanguage] = useState<LanguageCode>(currentLanguage);

  // Primary Branch & Head Office
  const [branchName, setBranchName] = useState<string>(branches[0]?.name || config.companyName);
  const [branchCity, setBranchCity] = useState<string>(branches[0]?.city || 'Muscat');
  const [branchAddress, setBranchAddress] = useState<string>(config.address);
  const [branchPhone, setBranchPhone] = useState<string>(config.phone);

  // Master Owner & Security
  const [ownerName, setOwnerName] = useState<string>(currentUser.name);
  const [ownerPin, setOwnerPin] = useState<string>(currentUser.pin || '9900');
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(15);

  // Hardware Peripherals
  const [receiptFormat, setReceiptFormat] = useState<'a4' | 'medium' | 'small'>('medium');
  const [enableSoundAlerts, setEnableSoundAlerts] = useState<boolean>(true);
  const [openingCashFloat, setOpeningCashFloat] = useState<number>(150);

  // Automated Installation Process Simulation
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const steps = [
    { id: 1, title: 'Welcome & Mode', subtitle: 'Deployment Architecture', icon: Monitor },
    { id: 2, title: 'Business Engine', subtitle: 'Industry Preset & Identity', icon: Store },
    { id: 3, title: 'Fiscal & Tax', subtitle: 'Currency & VAT Compliance', icon: DollarSign },
    { id: 4, title: 'Branch Network', subtitle: 'Head Office & Premises', icon: Building2 },
    { id: 5, title: 'Security & PIN', subtitle: 'Executive Administrator', icon: KeyRound },
    { id: 6, title: 'Hardware POS', subtitle: 'Thermal Printers & Scanners', icon: Printer },
    { id: 7, title: 'Execute Setup', subtitle: 'Compile & Deploy System', icon: Terminal },
  ];

  const handleSelectPreset = (presetId: string) => {
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
    }
  };

  // Run simulated high-tech software installer progress when reaching step 7
  useEffect(() => {
    if (currentStep === 7 && !isFinished && !isInstalling) {
      setIsInstalling(true);
      setInstallProgress(5);
      setInstallLogs(['[INIT] Starting Enterprise ERP Configuration Engine v2.4.0...']);

      const timeline: [number, string, number][] = [
        [15, 'Scanning system environment & local storage partitions...', 350],
        [30, `Configuring business engine: ${config.companyName}...`, 750],
        [48, `Applying tax rules (${config.taxLabel}) and currency parameters (${currency})...`, 1200],
        [65, `Configuring primary headquarters: ${branchCity} (${branchAddress})...`, 1650],
        [80, `Securing master credentials for executive: ${ownerName}...`, 2100],
        [92, `Calibrating thermal printer interface (${receiptFormat.toUpperCase()}) & camera scanners...`, 2550],
        [100, '✓ System installation verified. Enterprise ERP is ready for operation.', 3000],
      ];

      timeline.forEach(([pct, log, delay]) => {
        setTimeout(() => {
          setInstallProgress(pct);
          setInstallLogs((prev) => [...prev, log]);
          if (pct === 100) {
            setIsInstalling(false);
            setIsFinished(true);
          }
        }, delay);
      });
    }
  }, [currentStep]);

  const handleFinish = () => {
    onCompleteInstallation({
      config,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Authentic Desktop Software Installer Window Shell */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col text-slate-100 overflow-hidden my-auto max-h-[95vh] ring-1 ring-white/10 font-sans">
        {/* Software Title Bar with Window Controls */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-[11px] shadow-sm">
              <Server className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold font-mono tracking-tight text-slate-200">
              Enterprise ERP Setup Wizard [v2.4.0 Build 2026.10]
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Win/macOS/Linux/Web
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
              title="Minimize"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
              title="Maximize"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-xs"
              title="Cancel / Exit Setup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Wizard Main Content Grid: Left Stepper Navigation + Right Step Panel */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Rail: Setup Steps List (Desktop Software Style) */}
          <div className="w-full md:w-64 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-4 shrink-0 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800/80">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Installation Phases
                </div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Deployment Sequence</span>
                </div>
              </div>

              {/* Steps Progress List */}
              <div className="space-y-1">
                {steps.map((s) => {
                  const Icon = s.icon;
                  const isCurrent = currentStep === s.id;
                  const isPast = currentStep > s.id;

                  return (
                    <button
                      key={s.id}
                      disabled={isInstalling || currentStep === 7}
                      onClick={() => setCurrentStep(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition text-xs group cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : isPast
                          ? 'text-emerald-400 hover:bg-slate-800/60'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCurrent
                            ? 'bg-slate-950 text-amber-300'
                            : isPast
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : s.id}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate leading-tight">{s.title}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isCurrent ? 'text-slate-900/80' : 'text-slate-500'
                          }`}
                        >
                          {s.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Diagnostic / System Specs Footer */}
            <div className="pt-3 border-t border-slate-800/80 mt-4 text-[10px] text-slate-500 space-y-1 hidden md:block">
              <div className="flex justify-between">
                <span>Core Engine:</span>
                <span className="font-mono text-slate-400">React 19 / Vite</span>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="font-mono text-emerald-400">IndexedDB + Cloud</span>
              </div>
              <div className="flex justify-between">
                <span>AI Module:</span>
                <span className="font-mono text-purple-400">Gemini 3.8 Flash</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Step Content Area */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* Step Top Header Banner */}
            <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Step {currentStep} of {totalSteps}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {steps[currentStep - 1].title} – {steps[currentStep - 1].subtitle}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow-inner">
                {React.createElement(steps[currentStep - 1].icon, { className: 'w-5 h-5' })}
              </div>
            </div>

            {/* Step Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
              {/* STEP 1: Welcome & Deployment Architecture */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
                    <h4 className="text-sm font-bold text-white mb-1">
                      Welcome to the Enterprise ERP Customization & Installation Wizard
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This wizard will assist you in configuring your company identity, multi-bank accounts,
                      thermal printer peripherals, and fiscal tax compliance for any business model in minutes.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Select Target Deployment Architecture:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'desktop_standalone',
                          title: 'Single-Terminal Retail POS',
                          desc: 'Standalone cash register with ultra-fast local storage & offline resiliency.',
                          badge: 'Recommended',
                          icon: Monitor,
                        },
                        {
                          id: 'multi_branch_server',
                          title: 'Multi-Branch Enterprise Hub',
                          desc: 'Centralized headquarters inventory, inter-branch transfers & treasury tracking.',
                          badge: 'Enterprise',
                          icon: Server,
                        },
                        {
                          id: 'cloud_hybrid',
                          title: 'Cloud-Connected Smart Node',
                          desc: 'Real-time synchronization with Firebase Firestore & Gemini AI auditing.',
                          badge: 'Cloud Sync',
                          icon: Globe,
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setDeploymentMode(item.id as any)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                            deploymentMode === item.id
                              ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50'
                              : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <item.icon className="w-5 h-5 text-amber-400" />
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                                {item.badge}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-white mb-1">{item.title}</h5>
                            <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
                            <span className={deploymentMode === item.id ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                              {deploymentMode === item.id ? '● Selected Mode' : '○ Click to choose'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Your operational data will remain private, secure and locally accelerated.</span>
                  </div>
                </div>
              )}

              {/* STEP 2: Business Solution Engine & Presets */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-300">
                    Select a ready-made commercial preset to immediately tune invoices, categories, and business labels:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {BUSINESS_PRESETS.map((p) => {
                      const isSelected = selectedPresetId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPreset(p.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50'
                              : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs text-white truncate">{p.name.split('-')[0]}</span>
                              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700 font-bold">
                                {p.config.shortName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{p.description}</p>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px]">
                            <span className="text-emerald-400 font-medium">{p.config.taxLabel}</span>
                            <span className={isSelected ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                              {isSelected ? '✓ Active' : 'Apply'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Manual Override Fields */}
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-white block">Fine-Tune Commercial Identity:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Company / Store Name (English) *</label>
                        <input
                          type="text"
                          required
                          value={config.companyName}
                          onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Company Name (Arabic / Local)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={config.companyNameAr}
                          onChange={(e) => setConfig({ ...config, companyNameAr: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Brand Initials / Badge Code</label>
                        <input
                          type="text"
                          maxLength={10}
                          value={config.shortName}
                          onChange={(e) => setConfig({ ...config, shortName: e.target.value.toUpperCase() })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono font-bold text-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Business Tagline</label>
                        <input
                          type="text"
                          value={config.tagline}
                          onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Fiscal, Currency & Tax Policy */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1.5">Primary Operating Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-medium"
                      >
                        {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((cur) => (
                          <option key={cur} value={cur}>
                            {cur} - {CURRENCY_RATES[cur].name} ({CURRENCY_RATES[cur].symbol})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        All POS cash counters and bank ledger journals will compute in this base currency.
                      </p>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1.5">User Interface Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-medium"
                      >
                        <option value="en">English (Default)</option>
                        <option value="ar">العربية (Arabic - RTL)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                        <option value="ml">മലയാളം (Malayalam)</option>
                        <option value="ur">اردو (Urdu)</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Switches interface directions (LTR/RTL) and billing terminology.
                      </p>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1.5">Tax / VAT Percentage (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={config.taxRatePercent}
                        onChange={(e) => setConfig({ ...config, taxRatePercent: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-mono text-slate-100 text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1.5">Tax Invoice Display Label</label>
                      <input
                        type="text"
                        value={config.taxLabel}
                        onChange={(e) => setConfig({ ...config, taxLabel: e.target.value })}
                        placeholder="e.g. Oman VAT (5%)"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-amber-400" />
                      <span>Electronic Tax Authority Invoicing Standard</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      All generated receipts will include cryptographic base64 TLV verification QR barcodes
                      compliant with regional Tax Authority (OTA / ZATCA / FTA) regulations.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: Store & Branch Infrastructure */}
              {currentStep === 4 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Headquarters Branch Name</label>
                      <input
                        type="text"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">City / Region</label>
                      <input
                        type="text"
                        value={branchCity}
                        onChange={(e) => setBranchCity(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Commercial Registration (CR No) *</label>
                      <input
                        type="text"
                        required
                        value={config.crNumber}
                        onChange={(e) => setConfig({ ...config, crNumber: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">VAT Identification Number *</label>
                      <input
                        type="text"
                        required
                        value={config.vatNumber}
                        onChange={(e) => setConfig({ ...config, vatNumber: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono font-bold text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Official Contact Phone</label>
                      <input
                        type="text"
                        value={branchPhone}
                        onChange={(e) => {
                          setBranchPhone(e.target.value);
                          setConfig({ ...config, phone: e.target.value });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Official Email Address</label>
                      <input
                        type="email"
                        value={config.email}
                        onChange={(e) => setConfig({ ...config, email: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-slate-300 font-semibold block mb-1">Physical Street Address</label>
                      <input
                        type="text"
                        value={branchAddress}
                        onChange={(e) => {
                          setBranchAddress(e.target.value);
                          setConfig({ ...config, address: e.target.value });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Executive Administrator & PIN */}
              {currentStep === 5 && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500"
                    />
                    <div>
                      <div className="font-bold text-white text-sm">Managing Director Account</div>
                      <div className="text-[11px] text-amber-400 font-mono">Full Executive Authority Granted</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Owner / Administrator Name</label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Terminal Unlock PIN (4-Digits) *</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={ownerPin}
                        onChange={(e) => setOwnerPin(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-mono text-center text-sm font-bold text-amber-300 tracking-widest"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Auto-Lock Idle Timeout</label>
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

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Multi-Bank Ledger Access</label>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Enabled (Bank Muscat & Dhofar)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Hardware Peripherals & POS */}
              {currentStep === 6 && (
                <div className="space-y-4 text-xs">
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
                          onClick={() => setReceiptFormat(fmt.id as any)}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
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
                      <label className="text-slate-300 font-semibold block mb-1">Camera Barcode & IMEI Scanner</label>
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-between">
                        <span>Universal Web Scanner</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">READY (HTML5)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="enable-sounds"
                      checked={enableSoundAlerts}
                      onChange={(e) => setEnableSoundAlerts(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="enable-sounds" className="text-slate-300 cursor-pointer">
                      Enable audible beep chime on successful barcode scan & cash drawer eject
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 7: Installation & Deployment Execution */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-300 font-bold">
                        {isFinished ? 'Installation Completed' : 'Applying System Setup Configuration...'}
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
                    <div className="text-slate-500">// Enterprise ERP Console Log</div>
                    {installLogs.map((log, i) => (
                      <div key={i} className={log.startsWith('✓') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                        {log}
                      </div>
                    ))}
                    {isInstalling && (
                      <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Processing kernel directives...</span>
                      </div>
                    )}
                  </div>

                  {/* Summary Card after completion */}
                  {isFinished && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in zoom-in-95">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">System Configured Successfully!</h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {config.companyName} ({config.shortName}) is deployed with {currency} currency and {config.taxLabel}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step Bottom Action Bar */}
            <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 select-none">
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {currentStep > 1 && currentStep < 7 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < 7 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
                  >
                    <span>{currentStep === 6 ? 'Proceed to Install' : 'Next Step'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {currentStep === 7 && isFinished && (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 transition cursor-pointer animate-bounce"
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
